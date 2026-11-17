// tools/render-snapshots.mjs  –  תמונות מדויקות מהדגם התלת־ממדי (עמודי המפות) + אימות
//
//   node tools/render-snapshots.mjs serve <built.html> [port=8775]
//        מגיש את הדגם הבנוי (קובץ OUT) עם סקריפט הרינדור (tools/snap-inject.js) מוזרק בסופו.
//        לפתוח בדפדפן:  http://localhost:8775/?snap=1   – הדף מרנדר את כל התמונות ושולח אותן ל-/save.
//        נכתב: assets/maps/*.jpg  +  assets/maps/manifest.json  (period, camera, hash, בדיקות)
//   node tools/render-snapshots.mjs pack
//        אורז assets/maps/*.jpg ו-assets/maps/deco/*.jpg אל src/map_images.js  (const MAP_IMG={key:'<base64 של JPEG>'})
//
// אין כאן תלות ברשת; הכול מקומי. אימות פיקסלים/ייחודיות: python -I tools/verify-snapshots.py
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mapsDir = path.join(root, 'assets', 'maps');
const cmd = process.argv[2];

if (cmd === 'pack') {
  const out = [];
  let total = 0;
  let man = null;
  try { man = JSON.parse(fs.readFileSync(path.join(mapsDir, 'manifest.json'), 'utf8')); } catch (e) { console.log('no manifest.json - packing all jpgs'); }
  const skip = new Set(man ? man.images.filter(i => !i.checks.notBlank || !i.checks.notDark || i.checks.weak || i.checks.periodMatches === false || i.checks.cameraMatchesData === false).map(i => i.key) : []);
  if (skip.size) console.log('skipping weak/failed images:', [...skip].join(' '));
  const add = (dir, prefix) => {
    if (!fs.existsSync(dir)) return;
    for (const f of fs.readdirSync(dir).filter(f => /\.jpg$/i.test(f)).sort()) {
      if (!prefix && skip.has(f.replace(/\.jpg$/i, ''))) continue;
      const b = fs.readFileSync(path.join(dir, f));
      total += b.length;
      out.push(JSON.stringify(prefix + f.replace(/\.jpg$/i, '')) + ':"' + b.toString('base64') + '"');
    }
  };
  add(mapsDir, '');
  add(path.join(mapsDir, 'deco'), 'd_');
  const js = '/* נוצר ע"י tools/render-snapshots.mjs pack – אל תערוך ידנית. תמונות מהדגם התלת־ממדי (r_*: רינדור מדויק) ואיורי Gemini דקורטיביים (d_*). מוצגות דרך blob: URL (נטפרי). base64 גולמי, בלי קידומת data:. */\n'
    + 'const MAP_IMG={' + out.join(',\n') + '};\n'
    + 'const MAP_IMG_META=' + JSON.stringify({generated: man && man.generated, places: man ? man.images.filter(i => i.meta && i.meta.kind === 'place' && !skip.has(i.key)).map(i => [i.key, i.meta.name]) : []}) + ';\n';
  fs.writeFileSync(path.join(root, 'src', 'map_images.js'), js);
  console.log('packed', out.length, 'images, raw', (total / 1024 | 0) + 'KB, js', (js.length / 1024 | 0) + 'KB');
} else if (cmd === 'serve') {
  const port = +(process.argv[4] || 8775);
  const buildPage = () => {   // נקרא מחדש בכל בקשה: אפשר לבנות מחדש ולרענן בלי להפעיל את השרת שוב
    const html = fs.readFileSync(path.resolve(process.argv[3]), 'utf8');
    const inject = fs.readFileSync(path.join(root, 'tools', 'snap-inject.js'), 'utf8');
    const i = html.lastIndexOf('</body>');
    return (i < 0 ? html : html.slice(0, i)) + '<script>' + inject + '</script>' + (i < 0 ? '' : html.slice(i));
  };
  fs.mkdirSync(mapsDir, {recursive: true});
  const status = {saved: [], log: [], done: false};
  http.createServer((req, res) => {
    const u = new URL(req.url, 'http://x');
    if (req.method === 'GET' && u.pathname === '/') { res.writeHead(200, {'content-type': 'text/html; charset=utf-8'}); return res.end(buildPage()); }
    if (req.method === 'GET' && u.pathname === '/status') { res.writeHead(200, {'content-type': 'application/json'}); return res.end(JSON.stringify({n: status.saved.length, done: status.done, log: status.log.slice(-15)})); }
    if (req.method === 'POST') {
      const ch = []; req.on('data', d => ch.push(d)); req.on('end', () => {
        const body = Buffer.concat(ch);
        try {
          if (u.pathname === '/save') {
            const name = u.searchParams.get('name').replace(/[^\w-]/g, '');
            fs.writeFileSync(path.join(mapsDir, name + '.jpg'), body); status.saved.push(name);
          } else if (u.pathname === '/log') { status.log.push(body.toString('utf8')); console.log(body.toString('utf8')); }
          else if (u.pathname === '/manifest') {
            const m = JSON.parse(body.toString('utf8'));
            for (const e of m.images) {
              const f = path.join(mapsDir, e.key + '.jpg');
              if (fs.existsSync(f)) { const b = fs.readFileSync(f); e.bytes = b.length; e.sha256 = crypto.createHash('sha256').update(b).digest('hex'); }
              else e.error = 'missing file';
            }
            fs.writeFileSync(path.join(mapsDir, 'manifest.json'), JSON.stringify(m, null, 1));
            status.done = true; console.log('manifest written,', m.images.length, 'images');
          }
          res.writeHead(200); res.end('ok');
        } catch (e) { console.error(e); res.writeHead(500); res.end(String(e)); }
      });
      return;
    }
    res.writeHead(404); res.end();
  }).listen(port, '127.0.0.1', () => console.log('serving http://localhost:' + port + '/?snap=1'));
} else {
  console.log('usage: serve <built.html> [port] | pack');
}
