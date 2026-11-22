// Generates photoreal person SHEETS with Gemini (Oracle gemini-engine, /generate) – Moshe's item 4 (22.11.2026).
//   node tools/gen-people.mjs <id> [<id> ...]        ids from tools/people-prompts.json  (or "all")
//   env: OUT=tools/people-work (raw jpgs), REQ=local-real-people (X-Requester; limit 20 images/hour per name), PAR=3 (parallel), FORCE=1
// The engine token is read on the server over SSH (never leaves it). Each sheet = a grid of ~8 different people on flat green (#00FF00),
// later keyed + split + packed by tools/pack-people.py. Skips ids whose output already exists (resumable).
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = process.env.OUT || path.join(here, 'people-work');
const REQ = process.env.REQ || 'local-real-people';
const PAR = +(process.env.PAR || 3);
const cfg = JSON.parse(readFileSync(path.join(here, 'people-prompts.json'), 'utf8'));
mkdirSync(OUT, { recursive: true });
let ids = process.argv.slice(2);
if (ids.includes('all')) ids = Object.keys(cfg.sheets);
if (!ids.length) { console.error('ids:', Object.keys(cfg.sheets).join(' ')); process.exit(1); }

function gen(id) {
  return new Promise((resolve) => {
    const out = path.join(OUT, id + '.jpg');
    if (existsSync(out) && !process.env.FORCE) { console.log('skip (exists)', id); return resolve(true); }
    const s = cfg.sheets[id]; if (!s) { console.error('unknown id', id); return resolve(false); }
    const prompt = [cfg.common, s.prompt].join('\n\n');
    const refs = (s.refs || []).map((p) => ({ mimeType: p.endsWith('.png') ? 'image/png' : 'image/jpeg', base64: readFileSync(path.join(here, '..', p)).toString('base64') }));
    const body = JSON.stringify({ prompt, images: refs, format: 'jpeg' });
    const remote = `T=$(cat /opt/gemini-engine/token.txt 2>/dev/null || cat /opt/gemini-engine/token); curl -s --max-time 240 -X POST http://127.0.0.1:5725/generate -H "Authorization: Bearer $T" -H "Content-Type: application/json" -H "X-Requester: ${REQ}" --data-binary @-`;
    const p = spawn('ssh', ['-i', 'C:/Users/moshe/.ssh/oracle_new_ed25519', '-o', 'ConnectTimeout=20', 'opc@92.5.172.95', remote], { stdio: ['pipe', 'pipe', 'ignore'] });
    let data = ''; p.stdout.on('data', (d) => (data += d)); p.stdin.end(body);
    p.on('close', () => {
      let j; try { j = JSON.parse(data); } catch { console.error(id, 'bad response:', data.slice(0, 200)); return resolve(false); }
      if (!j.ok || !j.base64) { console.error(id, 'engine:', JSON.stringify(j).slice(0, 300)); return resolve(false); }
      writeFileSync(out, Buffer.from(j.base64, 'base64')); console.log('saved', id, 'account', j.account || '?'); resolve(true);
    });
  });
}
const queue = [...ids]; let ok = 0, bad = 0;
await Promise.all(Array.from({ length: Math.min(PAR, queue.length) }, async () => { while (queue.length) { const id = queue.shift(); (await gen(id)) ? ok++ : bad++; } }));
console.log('done ok', ok, 'failed', bad);
