// One-off / idempotent: creates the log tables + the app role used by the Vercel function.
// node setup-db.mjs   -> writes site/.env.app (DATABASE_URL of role temple_site_app) the first time.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const { Client } = createRequire(import.meta.url)('pg');
const url = fs.readFileSync(path.join(here, '.env'), 'utf8').match(/DATABASE_URL="(.*)"/)[1];
const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await c.connect();
await c.query(`create table if not exists temple_site_sessions (
  sid text primary key, first_ts timestamptz not null default now(), last_ts timestamptz not null default now(),
  ip text, country text, city text, ua text, info jsonb, act int not null default 0, tot int not null default 0)`);
await c.query(`create table if not exists temple_site_events (
  id bigserial primary key, ts timestamptz not null default now(), sid text not null, ev text not null, data jsonb)`);
await c.query('create index if not exists temple_site_sessions_first on temple_site_sessions (first_ts)');
await c.query('create index if not exists temple_site_sessions_ip on temple_site_sessions (ip, first_ts)');
await c.query('create index if not exists temple_site_events_ts on temple_site_events (ts)');
await c.query('create index if not exists temple_site_events_sid on temple_site_events (sid)');
const envApp = path.join(here, '.env.app');
const exists = (await c.query("select 1 from pg_roles where rolname='temple_site_app'")).rowCount > 0;
let pw = null;
if (!exists) { pw = crypto.randomBytes(24).toString('hex'); await c.query(`create role temple_site_app login password '${pw}'`); }
await c.query('grant usage on schema public to temple_site_app');
await c.query('grant select on temple_site_files to temple_site_app');
await c.query('grant select, insert, update, delete on temple_site_sessions, temple_site_events to temple_site_app');
await c.query('grant usage, select on sequence temple_site_events_id_seq to temple_site_app');
if (pw) { const u = new URL(url); u.username = 'temple_site_app'; u.password = pw; fs.writeFileSync(envApp, `DATABASE_URL="${u.toString()}"\n`); console.log('role created, wrote .env.app'); }
else console.log('role already existed (password unchanged)');
await c.end();
console.log('tables ready');
