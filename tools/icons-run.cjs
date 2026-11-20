// מריץ את כל גיליונות האיקונים מהקטלוג, בקצב שמכבד את מכסת המנוע (20 תמונות בשעה): ברירת מחדל רווח של 200 שניות בין תמונות.
//   node tools/icons-run.cjs [שם-גיליון ...]     (בלי שמות = כל הגיליונות שעוד אין להם תמונה)   GAP=200 (שניות)   FORCE=1 (ליצור מחדש גם אם קיים)
// פלט: assets/icons-raw/<sheet>.jpg|json  ו-assets/icons/<key>.png (+ assets/icons-raw/<sheet>/_contact.png לבדיקה בעין)
const fs = require('fs'), p = require('path'), cp = require('child_process');
const root = p.join(__dirname, '..'), raw = p.join(root, 'assets', 'icons-raw'), outp = p.join(root, 'assets', 'icons'), refd = p.join(root, 'assets', 'ui-refs');
const { SHEETS } = require('./icons-catalog.cjs');
const want = process.argv.slice(2), GAP = +(process.env.GAP || 200) * 1000, FORCE = !!process.env.FORCE;
fs.mkdirSync(raw, { recursive: true }); fs.mkdirSync(outp, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  let first = true;
  for (const sh of SHEETS) {
    if (want.length && !want.includes(sh.name)) continue;
    const jpg = p.join(raw, sh.name + '.jpg');
    if (fs.existsSync(jpg) && !FORCE) { console.log('skip (exists)', sh.name); continue; }
    const refs = (sh.refs || []).map((r) => p.join(refd, r + '.jpg')).filter((f) => fs.existsSync(f));
    if ((sh.refs || []).length && refs.length < sh.refs.length) console.log('warn: missing refs for', sh.name, sh.refs.filter((r) => !fs.existsSync(p.join(refd, r + '.jpg'))).join(','));
    if (!first) await sleep(GAP); first = false;
    const spec = { name: sh.name, cols: sh.cols || 4, rows: sh.rows || Math.ceil(sh.items.length / (sh.cols || 4)), refs, refNote: refs.length === (sh.refs || []).length ? sh.refNote : '', items: sh.items.map((i) => ({ key: i.key, desc: i.desc })) };
    const sf = p.join(raw, sh.name + '.spec.json'); fs.writeFileSync(sf, JSON.stringify(spec, null, 1));
    let ok = false;
    for (let t = 1; t <= 8 && !ok; t++) {
      const r = cp.spawnSync(process.execPath, [p.join(__dirname, 'icon-sheet.cjs'), sf, raw], { encoding: 'utf8', timeout: 260000 });
      const out = ((r.stdout || '') + (r.stderr || '')).split('\n').filter((l) => /^(ok|FAIL)/.test(l)).join(' ');
      console.log(new Date().toISOString().slice(11, 19), sh.name, 'try', t, out || 'no output');
      ok = /^ok/.test(out);
      if (!ok && t < 8) await sleep(/rate_limited/.test(out) ? 300000 : GAP);   // מכסה (20 בשעה): ממתינים 5 דקות; עסוק: רווח רגיל
    }
    if (!ok) continue;
    const r2 = cp.spawnSync('python', ['-I', p.join(__dirname, 'split-sheet.py'), jpg, p.join(raw, sh.name + '.json'), outp], { encoding: 'utf8', timeout: 300000, env: { ...process.env, OPENBLAS_NUM_THREADS: '1', OMP_NUM_THREADS: '1', MKL_NUM_THREADS: '1' } });
    console.log((r2.stdout || r2.stderr || '').trim().slice(0, 400));
    try { fs.renameSync(p.join(outp, '_contact.png'), p.join(raw, sh.name + '_contact.png')); } catch (e) {}
  }
  console.log('DONE');
})();
