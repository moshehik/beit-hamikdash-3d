// Serves files stored in Neon (table temple_site_files). Deploy once; update via `node publish.mjs` (no deploy).
// /            -> index.html (gzip stored, <4.5MB Vercel limit)
// /a/<hash>.mp3 -> narration clips (immutable, content-hashed)
const zlib = require('zlib');
const { Pool } = require('pg');

let pool;
const getPool = () => (pool ||= new Pool({ connectionString: process.env.DATABASE_URL, max: 1, ssl: { rejectUnauthorized: false } }));

module.exports = async (req, res) => {
  try {
    let p = new URL(req.url, 'http://x').searchParams.get('p') || '';
    p = decodeURIComponent(p).replace(/^\/+/, '');
    if (p === '' || p === 'index.html') p = 'index.html';
    if (!/^[A-Za-z0-9._\/-]{1,120}$/.test(p) || p.includes('..')) return notFound(res);
    const r = await getPool().query('select content_type, gzip, body, etag from temple_site_files where path = $1', [p]);
    if (!r.rows.length) return notFound(res);
    const f = r.rows[0];
    const isHtml = f.content_type.startsWith('text/html');
    if (req.headers['if-none-match'] === `"${f.etag}"`) { res.statusCode = 304; return res.end(); }
    let body = f.body;
    res.setHeader('Content-Type', f.content_type);
    res.setHeader('ETag', `"${f.etag}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.setHeader('Vary', 'Accept-Encoding');
    res.setHeader('Cache-Control', isHtml ? 'public, max-age=0, s-maxage=60, stale-while-revalidate=3600' : 'public, max-age=31536000, immutable');
    if (f.gzip) {
      if (/\bgzip\b/.test(req.headers['accept-encoding'] || '')) res.setHeader('Content-Encoding', 'gzip');
      else body = zlib.gunzipSync(body);
    }
    res.setHeader('Content-Length', body.length);
    res.statusCode = 200;
    res.end(body);
  } catch (e) {
    console.error('serve error', e && e.message);
    res.statusCode = 500;
    res.setHeader('Cache-Control', 'no-store');
    res.end('Server error');
  }
};

function notFound(res) {
  res.statusCode = 404;
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end('Not found');
}
