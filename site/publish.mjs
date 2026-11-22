// node publish.mjs [--no-build] [--out <dir>]  -> builds the model as cacheable JS chunks (j/*.js) + tiny index.html + narration clips (a/*.mp3), gzips, uploads to Neon (or writes to <dir> for a local test).
// No git, no Vercel build, no deploy: the live site picks it up within ~60s (edge cache).
// Needs DATABASE_URL in site/.env (gitignored) or in the environment.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  const envFile = path.join(here, '.env');
  if (fs.existsSync(envFile)) for (const l of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = l.match(/^DATABASE_URL=(.*)$/); if (m) process.env.DATABASE_URL = m[1].replace(/^["']|["']$/g, '');
  }
}
if (!process.env.DATABASE_URL && !process.argv.includes('--out')) { console.error('DATABASE_URL missing (site/.env)'); process.exit(1); }

// Build as separate cacheable JS chunks (vendor / img / data / app): the browser caches each by content hash (immutable),
// so repeat visits and small updates download almost nothing. index.html stays tiny and shows the loader at once.
const si = process.argv.indexOf('--stage');
const STAGE = process.argv.includes('--safe') ? 0 : (si > 0 ? +process.argv[si + 1] : 3);   // 0 = like before 20.11 PM, 1 = + clicker, 2 = + zoom-out/route, 3 = + voice
const tmp = path.join(os.tmpdir(), 'bh-chunks.json');
if (!process.argv.includes('--no-build')) {
  execFileSync(process.execPath, [path.join(here, '..', 'build.js')], { env: { ...process.env, CHUNKS_OUT: tmp, STAGE: String(STAGE) }, stdio: 'inherit' });
}
const built = JSON.parse(fs.readFileSync(tmp, 'utf8'));

const files = new Map(); // path -> {type, gzip, body}
const etag = (b) => crypto.createHash('sha1').update(b).digest('hex').slice(0, 20);
const CHUNKED = process.argv.includes('--chunks');   // external cacheable chunks: OFF by default (see below)
const tags = [], lazy = [];   // lazy chunks (map images) are fetched in the background after the page has loaded
for (const ch of built.chunks) {
  if (STAGE < 2 && ch.name === 'app') ch.code = ch.code.split('{pos:[18500,27500,27500],tgt:[18500,0,3500],fixed:true,dur:5.5}').join("C('parva',20,12,5)").split('{pos:[1750,1350,1500],tgt:[1750,60,-57]}').join('view(AZ.booths[0].fx,AZ.booths[0].fz,terrH(AZ.booths[0].fx,AZ.booths[0].fz)+3,40,16,250)').split('   /* זום־אאוט קולנועי: ירושלים ← פלוסין (מצרים) והנדווין (הודו) – src/world3d.js */').join('');
  let code = ch.code.replace(/data:audio\/mpeg;base64,([A-Za-z0-9+\/=]+)/g,(_, b64) => {
    const buf = Buffer.from(b64, 'base64');
    const name = `a/${crypto.createHash('sha1').update(buf).digest('hex').slice(0, 16)}.mp3`;
    files.set(name, { type: 'audio/mpeg', gzip: false, body: buf });
    return '/' + name;
  });
  if (!code) continue;
  if (!CHUNKED) { tags.push('<script>' + code + '</script>'); console.log(`  inline ${ch.name}: ${(code.length / 1e6).toFixed(2)}MB`); continue; }   // default: scripts inline in index.html (Moshe's network filter broke external /j/*.js on 20.11.2026)
  const buf = Buffer.from(code);
  const name = `j/${ch.name}.${crypto.createHash('sha1').update(buf).digest('hex').slice(0, 12)}.js`;
  const gzc = zlib.gzipSync(buf, { level: 9 });
  files.set(name, { type: 'text/javascript; charset=utf-8', gzip: true, body: gzc });
  if (ch.lazy) lazy.push(name); else tags.push('<script src="/' + name + '"></script>');
  console.log(`  chunk ${ch.name}: ${(buf.length / 1e6).toFixed(2)}MB -> ${(gzc.length / 1e6).toFixed(2)}MB gzip`);
}
// real-people atlases (assets/people/people.json, made by tools/pack-people.py): a SEPARATE lazily-fetched file (not in the initial bundle).
// src/real_people.js fetches window.REAL_PEOPLE_URL only when the user turns the 'אנשים אמיתיים' switch on; any failure falls back to the normal figures.
const peopleFile = path.join(here, '..', 'assets', 'people', 'people.json');
if (fs.existsSync(peopleFile) && !process.argv.includes('--no-people')) {
  const pb = fs.readFileSync(peopleFile), pn = `p/people.${crypto.createHash('sha1').update(pb).digest('hex').slice(0, 12)}.json`, pz = zlib.gzipSync(pb, { level: 9 });
  files.set(pn, { type: 'application/json; charset=utf-8', gzip: true, body: pz });
  tags.unshift('<script>window.REAL_PEOPLE_URL="/' + pn + '"</script>');
  console.log(`  real-people atlas ${pn}: ${(pb.length / 1e3).toFixed(0)}KB -> ${(pz.length / 1e3).toFixed(0)}KB gzip (lazy, fetched on demand)`);
}
let html = built.shell;
// visit tracker (only in the published site, not in the offline/local build)
const tracker = fs.readFileSync(path.join(here, 'tracker.js'), 'utf8');
if (!html.includes('</head>') || !html.includes('<!--@CHUNKS@-->')) { console.error('no </head> or chunk marker in built html'); process.exit(1); }
html = html.replace('</head>', () => '<script>' + tracker + '</script></head>');
if (lazy.length) tags.push('<script>addEventListener("load",function(){setTimeout(function(){' + lazy.map((n) => 'var s=document.createElement("script");s.src="/' + n + '";document.head.appendChild(s);').join('') + '},300)})</script>');
html = html.replace('<!--@CHUNKS@-->', () => tags.join(String.fromCharCode(10)));
const gz = zlib.gzipSync(Buffer.from(html), { level: 9 });
files.set('index.html', { type: 'text/html; charset=utf-8', gzip: true, body: gz });

const outIdx = process.argv.indexOf('--out');   // local test: write the files to a directory instead of Neon
if (outIdx > 0) {
  const dir = process.argv[outIdx + 1];
  for (const [p, f] of files) { const fp = path.join(dir, p); fs.mkdirSync(path.dirname(fp), { recursive: true }); fs.writeFileSync(fp, f.gzip ? zlib.gunzipSync(f.body) : f.body); }
  console.log('written to', dir, files.size, 'files; index.html gzip', (gz.length / 1e3).toFixed(0) + 'KB');
  process.exit(0);
}

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
try {
  await c.query('begin');
  await c.query(`create table if not exists temple_site_files (path text primary key, content_type text not null, gzip boolean not null default false, body bytea not null, etag text not null, updated_at timestamptz not null default now())`);
  for (const [p, f] of files) {
    await c.query(
      `insert into temple_site_files (path, content_type, gzip, body, etag) values ($1,$2,$3,$4,$5)
       on conflict (path) do update set content_type=excluded.content_type, gzip=excluded.gzip, body=excluded.body, etag=excluded.etag, updated_at=now()
       where temple_site_files.etag is distinct from excluded.etag`,
      [p, f.type, f.gzip, f.body, etag(f.body)]);
  }
  const keep = [...files.keys()];
  const del = await c.query("delete from temple_site_files where path <> all($1::text[]) and updated_at < now() - interval '1 day'", [keep]);
  await c.query('commit');
  console.log(`published: index.html ${(gz.length / 1e3).toFixed(0)}KB gzip, ${tags.length} js chunks, ${keep.filter((k) => k.startsWith('a/')).length} audio clips, ${del.rowCount} old files removed (older than 1 day)`);
} catch (e) {
  await c.query('rollback').catch(() => {});
  throw e;
} finally {
  await c.end();
}
