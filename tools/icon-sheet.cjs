// יוצר "גיליון איקונים" אחד (רשת של N איקוני חימר על רקע ירוק) במנוע התמונות של Gemini באורקל – תמונה אחת במקום N (מכסה: 20 תמונות בשעה ל-X-Requester).
//   node tools/icon-sheet.cjs <spec.json> <outdir>
//   spec: { "name":"sheetA", "cols":4, "rows":3, "refs":["ref1.jpg",...], "refNote":"מה רואים ברינדורי הייחוס", "items":[{"key":"tag-ketoret-0","desc":"..."}, ...] }
//   פלט: <outdir>/<name>.jpg  (+ <name>.json עם סדר המפתחות). אחר כך:  python -I tools/split-sheet.py <outdir>/<name>.jpg <outdir>/<name>.json <outpng_dir>
// כלל משה (ICONS_RULE.md): אובייקט מהדגם – מצורף כרינדור ייחוס, והפרומפט מחייב נאמנות לו. הטוקן נקרא ב-ssh ולא מודפס/נשמר.
const fs = require('fs'), p = require('path'), cp = require('child_process'), os = require('os');
const [specFile, outdir] = process.argv.slice(2);
if (!specFile || !outdir) { console.log('usage: node tools/icon-sheet.cjs <spec.json> <outdir>'); process.exit(1); }
const spec = JSON.parse(fs.readFileSync(specFile, 'utf8'));
const tok = process.env.GEMINI_ENGINE_TOKEN || cp.execFileSync('ssh', ['-o', 'BatchMode=yes', '-i', p.join(os.homedir(), '.ssh', 'oracle_new_ed25519'), 'opc@92.5.172.95', 'cat /opt/gemini-engine/token.txt'], { encoding: 'utf8', timeout: 30000 }).trim();
const n = spec.items.length, cols = spec.cols, rows = spec.rows;
if (n > cols * rows) throw new Error('too many items for the grid');
const STYLE = "Shiny 3D claymation, Pixar-like children's app icons, vivid saturated colors, warm soft lighting, glossy, rounded chunky shapes, one consistent style across the whole sheet, in the same style as a cute golden menorah icon. Priests (when shown) wear a plain white linen tunic, a tall rounded white cone-shaped cap and a red-blue-white woven sash, with a brown beard, and are drawn as cute simple clay figures.";
const list = spec.items.map((it, i) => (i + 1) + ') ' + it.desc).join('\n');
const hasRefs = (spec.refs || []).length > 0;
const prompt = (hasRefs ? 'The provided reference image(s) are renders of a 3D model of the Second Temple. ' + (spec.refNote || '') + ' Use the renders as the EXACT reference for the SHAPE, proportions and COLORS of every model object that appears in the icons below (do not invent a different design or colors for those objects), BUT draw every icon in the cute stylized claymation look of the example icons: soft rounded glossy plasticine surfaces and simplified cartoon forms. Do NOT copy the realistic texture, stone pattern or lighting of the renders and do NOT make photorealistic images.\n\n' : '') +
  'Create ONE single image containing a clean grid of exactly ' + n + ' separate stylized clay-like icons, arranged in ' + rows + ' rows and ' + cols + ' columns, in reading order (left to right, top to bottom). ' + STYLE + '\n' +
  'LAYOUT RULES: every icon is an isolated object centered in its own cell, about 70 percent of the cell size, with a WIDE empty margin of at least 15 percent of the cell between icons so that nothing touches or overlaps. The ENTIRE background of the whole image is ONE SOLID PURE GREEN #00FF00 with no gradient, no vignette, no shadows on the ground, no cell borders, no frames. No text, no letters, no numbers, no captions anywhere. Do not use green or near-green colors inside the icons. Draw ONLY the object itself: no rounded-square tile, plate, circle, card or any background shape behind the object.\n' +
  'The icons, in order:\n' + list;
const images = (spec.refs || []).map(f => ({ mimeType: 'image/jpeg', base64: fs.readFileSync(f).toString('base64') }));
const tmp = p.join(os.tmpdir(), 'iconsheet-' + process.pid + '.json'), NL = String.fromCharCode(10);
fs.writeFileSync(tmp, JSON.stringify({ prompt, images, format: 'jpeg' }));   // בלי only: המנוע מחלק בין שלושת החשבונות (429 busy = עסוק, מנסים שוב)
let r, parts, code, j = null;
for (let a = 0; a < 10; a++) {
  r = cp.spawnSync('curl', ['-s', '-m', '200', '-w', NL + '%{http_code}', '-X', 'POST', '-H', 'Authorization: Bearer ' + tok, '-H', 'X-Requester: temple-ui-refs', '-H', 'Content-Type: application/json', '--data-binary', '@' + tmp, 'https://nblm.chavarivkalandauhydrotherapy.co.il/gemini/generate'], { encoding: 'utf8', maxBuffer: 128 * 1024 * 1024, env: { ...process.env, MSYS2_ARG_CONV_EXCL: '*' } });
  parts = (r.stdout || '').split(NL); code = parts.pop(); j = null; try { j = JSON.parse(parts.join(NL)); } catch (e) {}
  if (code === '429' && j && /busy/.test(JSON.stringify(j))) { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 12000); continue; }   // המנוע עסוק (שרשור אחר) – לנסות שוב אחרי 12 ש׳
  break;
}
try { fs.unlinkSync(tmp); } catch (e) {}
if (j && j.ok && j.base64) {
  fs.mkdirSync(outdir, { recursive: true });
  fs.writeFileSync(p.join(outdir, spec.name + '.jpg'), Buffer.from(j.base64, 'base64'));
  fs.writeFileSync(p.join(outdir, spec.name + '.json'), JSON.stringify({ name: spec.name, cols, rows, keys: spec.items.map(i => i.key) }));
  console.log('ok', spec.name, j.account || '');
} else { console.log('FAIL', spec.name, code, j && (j.error || j.code) || (r.stderr || '').slice(0, 200)); process.exit(2); }
