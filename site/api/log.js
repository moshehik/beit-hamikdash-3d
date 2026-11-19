// POST /api/log  — receives batched analytics events from the page (tracker.js). Never cached.
// Stores: one row per visit in temple_site_sessions (IP, geo, UA, active time) + one row per event in temple_site_events.
// No content of chat messages/voice is ever sent or stored.
const { pool } = require('../lib/db');

const hits = new Map();           // per-instance soft rate limit: ip -> [windowStart, count]
let dayCap = { at: 0, n: 0 };     // cached count of events in the last 24h
const MAX_EVENTS_PER_DAY = 150000;

const EV_RE = /^[a-z_]{1,24}$/;
const SID_RE = /^[A-Za-z0-9]{8,24}$/;

function clientIp(req) {
  const x = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return (x || String(req.headers['x-real-ip'] || '')).slice(0, 64) || null;
}
const hdr = (req, k) => {
  const v = req.headers[k];
  if (!v) return null;
  try { return decodeURIComponent(String(v)).slice(0, 80); } catch { return String(v).slice(0, 80); }
};

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.statusCode = 405; return res.end(); }
  try {
    let b = req.body;
    if (Buffer.isBuffer(b)) b = b.toString('utf8');
    if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = null; } }
    if (!b || typeof b !== 'object' || !SID_RE.test(String(b.sid || '')) || !Array.isArray(b.events)) { res.statusCode = 400; return res.end(); }
    if (JSON.stringify(b).length > 20000) { res.statusCode = 413; return res.end(); }

    const ip = clientIp(req);
    const now = Date.now();
    const h = hits.get(ip);
    if (!h || now - h[0] > 60000) hits.set(ip, [now, 1]);
    else if (++h[1] > 120) { res.statusCode = 429; return res.end(); }
    if (hits.size > 5000) hits.clear();

    const db = pool();
    if (now - dayCap.at > 60000) {
      dayCap = { at: now, n: Number((await db.query("select count(*) n from temple_site_events where ts > now() - interval '1 day'")).rows[0].n) };
    }
    if (dayCap.n > MAX_EVENTS_PER_DAY) { res.statusCode = 429; return res.end(); }

    const sid = String(b.sid);
    let act = 0, tot = 0, info = null;
    const rows = [];
    for (const e of b.events.slice(0, 25)) {
      if (!e || !EV_RE.test(String(e.ev || ''))) continue;
      const d = e.d && typeof e.d === 'object' ? e.d : null;
      if (e.ev === 'hb' || e.ev === 'end') {
        act = Math.max(act, Math.min(86400, Number(d && d.act) || 0));
        tot = Math.max(tot, Math.min(86400, Number(d && d.tot) || 0));
        continue;
      }
      if (e.ev === 'view' && d) info = d;
      let ds = d ? JSON.stringify(d) : null;
      if (ds && ds.length > 1500) ds = JSON.stringify({ trunc: ds.slice(0, 1400) });
      rows.push([sid, String(e.ev), ds]);
    }

    const ua = String(req.headers['user-agent'] || '').slice(0, 300);
    await db.query(
      `insert into temple_site_sessions (sid, ip, country, city, ua, info, act, tot) values ($1,$2,$3,$4,$5,$6,$7,$8)
       on conflict (sid) do update set last_ts = now(), act = greatest(temple_site_sessions.act, excluded.act), tot = greatest(temple_site_sessions.tot, excluded.tot),
         info = coalesce(temple_site_sessions.info, excluded.info)`,
      [sid, ip, hdr(req, 'x-vercel-ip-country'), hdr(req, 'x-vercel-ip-city'), ua, info ? JSON.stringify(info).slice(0, 1500) : null, act, tot]);
    if (rows.length) {
      const vals = [], params = [];
      rows.forEach((r, i) => { vals.push(`($${i * 3 + 1},$${i * 3 + 2},$${i * 3 + 3}::jsonb)`); params.push(...r); });
      await db.query(`insert into temple_site_events (sid, ev, data) values ${vals.join(',')}`, params);
      dayCap.n += rows.length;
    }
    if (Math.random() < 0.01) { // retention: 90 days
      await db.query("delete from temple_site_events where ts < now() - interval '90 days'");
      await db.query("delete from temple_site_sessions where last_ts < now() - interval '90 days'");
    }
    res.statusCode = 204;
    res.end();
  } catch (e) {
    console.error('log error', e && e.message);
    res.statusCode = 500;
    res.end();
  }
};
