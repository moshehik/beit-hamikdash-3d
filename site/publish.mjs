// node publish.mjs [--no-build]  -> builds the model, splits narration out of the HTML, gzips, uploads to Neon.
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
if (!process.env.DATABASE_URL) { console.error('DATABASE_URL missing (site/.env)'); process.exit(1); }

const tmp = path.join(os.tmpdir(), 'bh-publish.html');
if (!process.argv.includes('--no-build')) {
  execFileSync(process.execPath, [path.join(here, '..', 'build.js')], { env: { ...process.env, OUT: tmp }, stdio: 'inherit' });
}
let html = fs.readFileSync(tmp, 'utf8');

const files = new Map(); // path -> {type, gzip, body}
const etag = (b) => crypto.createHash('sha1').update(b).digest('hex').slice(0, 20);
html = html.replace(/data:audio\/mpeg;base64,([A-Za-z0-9+\/=]+)/g, (_, b64) => {
  const buf = Buffer.from(b64, 'base64');
  const name = `a/${crypto.createHash('sha1').update(buf).digest('hex').slice(0, 16)}.mp3`;
  files.set(name, { type: 'audio/mpeg', gzip: false, body: buf });
  return '/' + name;
});
const gz = zlib.gzipSync(Buffer.from(html), { level: 9 });
if (gz.length > 4_000_000) { console.error('index.html gzip too big for Vercel function limit:', gz.length); process.exit(1); }
files.set('index.html', { type: 'text/html; charset=utf-8', gzip: true, body: gz });

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
  console.log(`published: index.html ${(gz.length / 1e6).toFixed(2)}MB gzip, ${keep.length - 1} audio clips, ${del.rowCount} old files removed (older than 1 day)`);
} catch (e) {
  await c.query('rollback').catch(() => {});
  throw e;
} finally {
  await c.end();
}
