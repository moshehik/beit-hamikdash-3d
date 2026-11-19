// GET /stats?k=<STATS_KEY>   first visit sets a cookie and redirects to /stats (key no longer in the URL).
// Query: d=<days 1..90, default 7>, bots=1 (include crawlers), format=csv (download visits as CSV).
// Everything shown is escaped (IP/UA/error text come from visitors) and the page has a strict CSP.
const crypto = require('crypto');
const { pool } = require('../lib/db');

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const eq = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };
const BOT_RE = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python-requests|vercel/i;

const SCREEN_LABEL = { landing: 'דף הבית', map: 'מפות', tribes: 'שבטים', 'free:model': 'הדגם (חופשי)', 'free:walk': 'ללכת בפנים', 'free:ark': 'ארון הברית', 'free:tours': 'תפריט הסיורים', 'free:about': 'על הדגם', 'free:map': 'מפות', 'free:kids': 'שבטים', unknown: 'לא ידוע' };
const screenLabel = (n) => (n && n.startsWith('tour:') ? 'סיור: ' + n.slice(5) : SCREEN_LABEL[n] || n || '');

function device(ua) {
  ua = ua || '';
  const mobile = /Mobi|Android|iPhone|iPad/i.test(ua);
  const os = /Windows/i.test(ua) ? 'Windows' : /Android/i.test(ua) ? 'Android' : /iPhone|iPad|iOS/i.test(ua) ? 'iOS' : /Mac OS/i.test(ua) ? 'Mac' : /Linux/i.test(ua) ? 'Linux' : 'אחר';
  const br = /Edg\//.test(ua) ? 'Edge' : /OPR\/|Opera/.test(ua) ? 'Opera' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\/|CriOS/.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'אחר';
  return { mobile, os, br };
}
const fmtDur = (s) => { s = Math.round(s || 0); if (s < 60) return s + ' ש׳'; const m = Math.floor(s / 60); return m + ' ד׳ ' + (s % 60 ? (s % 60) + ' ש׳' : ''); };
const tz = 'Asia/Jerusalem';
const fmtT = (d) => new Date(d).toLocaleString('he-IL', { timeZone: tz, day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const fmtDay = (d) => new Date(d).toLocaleDateString('he-IL', { timeZone: tz, day: '2-digit', month: '2-digit' });
const top = (m, n = 8) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
const inc = (m, k, v = 1) => m.set(k, (m.get(k) || 0) + v);

function parseCookie(h) { const o = {}; String(h || '').split(';').forEach((p) => { const i = p.indexOf('='); if (i > 0) o[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim()); }); return o; }
function notFound(res) { res.statusCode = 404; res.setHeader('Cache-Control', 'no-store'); res.setHeader('Content-Type', 'text/plain; charset=utf-8'); res.end('Not found'); }

module.exports = async (req, res) => {
  const KEY = process.env.STATS_KEY || '';
  if (!KEY || KEY.length < 16) return notFound(res);
  const u = new URL(req.url, 'http://x');
  const given = u.searchParams.get('k');
  if (given) {
    if (!eq(given, KEY)) return notFound(res);
    res.setHeader('Set-Cookie', `bh_stats=${encodeURIComponent(KEY)}; Path=/; Max-Age=31536000; HttpOnly; Secure; SameSite=Strict`);
    res.setHeader('Cache-Control', 'no-store');
    res.statusCode = 302; res.setHeader('Location', '/stats'); return res.end();
  }
  if (!eq(parseCookie(req.headers.cookie).bh_stats || '', KEY)) return notFound(res);

  const days = Math.max(1, Math.min(90, parseInt(u.searchParams.get('d'), 10) || 7));
  const withBots = u.searchParams.get('bots') === '1';
  const db = pool();
  const [sr, er] = await Promise.all([
    db.query("select sid, first_ts, last_ts, ip, country, city, ua, info, act, tot from temple_site_sessions where first_ts > now() - ($1 || ' days')::interval order by first_ts desc limit 20000", [String(days)]),
    db.query("select ts, sid, ev, data from temple_site_events where ts > now() - ($1 || ' days')::interval order by ts asc limit 60000", [String(days)]),
  ]);
  const sess = new Map();
  let botCount = 0;
  for (const r of sr.rows) {
    if (BOT_RE.test(r.ua || '')) { botCount++; if (!withBots) continue; }
    sess.set(r.sid, { ...r, dev: device(r.ua), screens: [], errs: 0, chats: 0, chatFail: 0 });
  }
  const screenSecs = new Map(), screenCnt = new Map(), tourSteps = new Map(), errGroups = new Map();
  let chatOk = 0, chatBad = 0, chatMs = 0, resErr = 0;
  for (const e of er.rows) {
    const s = sess.get(e.sid); if (!s) continue;
    const d = e.data || {};
    if (e.ev === 'screen') {
      if (d.from) { inc(screenSecs, d.from, d.secs || 0); inc(screenCnt, d.from); }
      if (s.screens[s.screens.length - 1] !== d.from && d.from) s.screens.push(d.from);
      if (d.to && s.screens[s.screens.length - 1] !== d.to) s.screens.push(d.to);
      if (d.from && d.from.startsWith('tour:') && d.steps) { const t = tourSteps.get(d.from) || { n: 0, steps: 0 }; t.n++; t.steps += d.steps; tourSteps.set(d.from, t); }
    } else if (e.ev === 'chat') {
      s.chats++; if (d.ok) { chatOk++; chatMs += d.ms || 0; } else { chatBad++; s.chatFail++; }
    } else if (e.ev === 'error' || e.ev === 'resource_error') {
      s.errs++; if (e.ev === 'resource_error') resErr++;
      const key = e.ev === 'error' ? 'JS: ' + (d.msg || '?') : 'משאב: ' + (d.tag || '') + ' ' + (d.src || '');
      const g = errGroups.get(key) || { n: 0, sids: new Set(), last: e.ts, ua: s.ua, at: d.at, line: d.line };
      g.n++; g.sids.add(e.sid); g.last = e.ts; g.ua = s.ua; g.at = d.at; errGroups.set(key, g);
    } else if (e.ev === 'nav') { /* counted via screens */ }
  }

  const list = [...sess.values()];
  if (u.searchParams.get('format') === 'csv') {
    const head = ['זמן', 'IP', 'מדינה', 'עיר', 'מכשיר', 'דפדפן', 'זמן פעיל (שניות)', 'שהות כוללת (שניות)', 'מסכים', 'שגיאות', 'הפניה'];
    const q = (v) => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    const rows = list.map((s) => [new Date(s.first_ts).toISOString(), s.ip, s.country, s.city, s.dev.mobile ? 'נייד' : 'מחשב', s.dev.br + ' / ' + s.dev.os, s.act, s.tot, s.screens.map(screenLabel).join(' > '), s.errs, (s.info && s.info.ref) || '']);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="temple-visits.csv"');
    res.setHeader('Cache-Control', 'no-store');
    return res.end('﻿' + [head, ...rows].map((r) => r.map(q).join(',')).join('\r\n'));
  }

  const ips = new Set(list.map((s) => s.ip).filter(Boolean));
  const acts = list.map((s) => s.act).filter((x) => x > 0).sort((a, b) => a - b);
  const avg = acts.length ? acts.reduce((a, b) => a + b, 0) / acts.length : 0;
  const med = acts.length ? acts[Math.floor(acts.length / 2)] : 0;
  const withErr = list.filter((s) => s.errs > 0).length;
  const noGl = list.filter((s) => s.info && s.info.gl === false).length;
  const perDay = new Map();
  for (const s of list) { const k = fmtDay(s.first_ts); const o = perDay.get(k) || { v: 0, ips: new Set(), act: 0, n: 0 }; o.v++; if (s.ip) o.ips.add(s.ip); if (s.act > 0) { o.act += s.act; o.n++; } perDay.set(k, o); }
  const devs = new Map(), brs = new Map(), cts = new Map(), refs = new Map();
  for (const s of list) {
    inc(devs, s.dev.mobile ? 'נייד' : 'מחשב'); inc(brs, s.dev.br + ' / ' + s.dev.os);
    inc(cts, [s.country, s.city].filter(Boolean).join(' · ') || 'לא ידוע');
    const r = (s.info && s.info.ref) || ''; let host = 'ישיר (ללא הפניה)'; if (r) { try { host = new URL(r).host; } catch { host = r.slice(0, 40); } } inc(refs, host);
  }

  const table = (head, rows) => `<div class="tw"><table><thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('') || '<tr><td colspan="9" class="mut">אין נתונים</td></tr>'}</tbody></table></div>`;
  const card = (n, l) => `<div class="card"><b>${esc(n)}</b><span>${esc(l)}</span></div>`;
  const dayRows = [...perDay.entries()].map(([k, o]) => [esc(k), o.v, o.ips.size, o.n ? esc(fmtDur(o.act / o.n)) : '-']);
  const scrRows = [...screenSecs.entries()].sort((a, b) => b[1] - a[1]).map(([k, secs]) => { const n = screenCnt.get(k) || 1; const t = tourSteps.get(k); return [esc(screenLabel(k)), n, esc(fmtDur(secs)), esc(fmtDur(secs / n)), t ? esc((t.steps / t.n).toFixed(1)) : '']; });
  const errRows = [...errGroups.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 40).map(([k, g]) => [esc(k.slice(0, 220)), g.n, g.sids.size, esc(fmtT(g.last)), esc(screenLabel(g.at)), esc((g.ua || '').slice(0, 90))]);
  const visRows = list.slice(0, 150).map((s) => [esc(fmtT(s.first_ts)), esc(s.ip), esc([s.country, s.city].filter(Boolean).join(' · ')), esc((s.dev.mobile ? 'נייד ' : 'מחשב ') + s.dev.br), esc(fmtDur(s.act)), esc(s.screens.map(screenLabel).join(' ‹ ')), s.errs ? `<b class="bad">${s.errs}</b>` : '', s.chats ? esc(s.chats + (s.chatFail ? ` (${s.chatFail} נכשלו)` : '')) : '']);
  const kv = (m) => table(['', 'ביקורים'], top(m).map(([k, n]) => [esc(k), n]));
  const rangeLinks = [1, 7, 30, 90].map((n) => `<a href="/stats?d=${n}${withBots ? '&bots=1' : ''}" class="${n === days ? 'on' : ''}">${n === 1 ? '24 שעות' : n + ' ימים'}</a>`).join('');

  const html = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>סטטיסטיקות בית המקדש</title>
<style>:root{--bg:#fbf8f2;--fg:#2b2418;--mut:#7a6d58;--card:#fff;--line:#e6dcc8;--acc:#9a6b1f;--bad:#b3261e}@media(prefers-color-scheme:dark){:root{--bg:#1c1812;--fg:#efe6d4;--mut:#a89a82;--card:#26211a;--line:#3a3328;--acc:#e0b15a;--bad:#ff8a80}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,Segoe UI,Arial,sans-serif;padding:16px;max-width:1100px;margin-inline:auto}
h1{font-size:22px;margin:4px 0 12px}h2{font-size:17px;margin:26px 0 8px;color:var(--acc)}.bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:14px}.bar a{padding:6px 12px;border:1px solid var(--line);border-radius:999px;color:var(--fg);text-decoration:none;background:var(--card)}.bar a.on{background:var(--acc);color:#fff;border-color:var(--acc)}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 14px;display:flex;flex-direction:column}.card b{font-size:24px}.card span{color:var(--mut);font-size:13px}
.tw{overflow-x:auto;background:var(--card);border:1px solid var(--line);border-radius:12px}table{border-collapse:collapse;width:100%;font-size:14px}th,td{padding:7px 10px;text-align:start;border-bottom:1px solid var(--line);white-space:nowrap}td:last-child{white-space:normal}th{color:var(--mut);font-weight:600;font-size:13px}tr:last-child td{border-bottom:0}.mut{color:var(--mut)}.bad{color:var(--bad)}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px}</style></head><body>
<h1>🕍 סטטיסטיקות – בית המקדש מודל</h1>
<div class="bar">${rangeLinks}<a href="/stats?d=${days}${withBots ? '' : '&bots=1'}">${withBots ? 'הסתר בוטים' : 'הצג גם בוטים'}</a><a href="/stats?d=${days}&format=csv${withBots ? '&bots=1' : ''}">הורד CSV</a><span class="mut">${botCount} ביקורי בוטים/סורקים ${withBots ? 'כלולים' : 'מוסתרים'} · שעון ישראל</span></div>
<div class="cards">${card(list.length, 'ביקורים')}${card(ips.size, 'כתובות IP שונות')}${card(fmtDur(avg), 'זמן פעיל ממוצע')}${card(fmtDur(med), 'זמן פעיל חציוני')}${card(withErr, 'ביקורים עם תקלה')}${card(noGl, 'מכשירים בלי WebGL')}${card(chatOk + chatBad, 'שאלות לדמויות' + (chatBad ? ` (${chatBad} נכשלו)` : ''))}${card(chatOk ? Math.round(chatMs / chatOk / 100) / 10 + ' ש׳' : '-', 'זמן תשובה ממוצע בצ׳אט')}</div>
<h2>לפי יום</h2>${table(['יום', 'ביקורים', 'IP שונים', 'זמן פעיל ממוצע'], dayRows)}
<h2>אילו דפים / סיורים נצפו</h2>${table(['מסך', 'כניסות', 'סה״כ זמן', 'זמן ממוצע', 'שלבים ממוצע בסיור'], scrRows)}
<h2>תקלות</h2>${table(['תקלה', 'פעמים', 'ביקורים', 'אחרונה', 'במסך', 'דפדפן'], errRows)}
<div class="grid"><div><h2>מכשירים</h2>${kv(devs)}</div><div><h2>דפדפנים</h2>${kv(brs)}</div><div><h2>מיקומים</h2>${kv(cts)}</div><div><h2>מאיפה הגיעו</h2>${kv(refs)}</div></div>
<h2>ביקורים אחרונים (${Math.min(150, list.length)} מתוך ${list.length})</h2>${table(['זמן', 'IP', 'מיקום', 'מכשיר', 'זמן פעיל', 'מסלול (מסכים)', 'תקלות', 'צ׳אט'], visRows)}
<p class="mut">הנתונים נשמרים 90 יום. תוכן שיחות הצ׳אט והקול לא נשמרים כלל. כדי שביקורים שלך לא ייספרו: פתח את האתר פעם אחת עם <code>?notrack=1</code> בכתובת.</p>
</body></html>`;
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.end(html);
};
