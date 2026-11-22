// one-off: hooks the real-people sprites into crowd.js / build.js (byte-preserving). Safe to re-run (idempotent).
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
function patch(file, pairs) {
  const f = path.join(root, file); let s = fs.readFileSync(f, 'utf8');
  for (const [a, b, tag] of pairs) {
    if (s.includes(tag)) { console.log(file, 'already patched:', tag); continue; }
    if (!s.includes(a)) throw new Error(file + ': pattern not found: ' + a.slice(0, 70));
    s = s.split(a).join(b);
  }
  fs.writeFileSync(f, s, 'utf8');
}
patch('src/crowd.js', [
  ["P.robe.instanceColor.needsUpdate=P.head.instanceColor.needsUpdate=true;P.robe.count=P.head.count=0;",
   "P.robe.instanceColor.needsUpdate=P.head.instanceColor.needsUpdate=true;P.robe.count=P.head.count=0;P.pop=pop;if(typeof REALP!='undefined')REALP.attach(P,POPFIG[pop]);",
   "REALP.attach"],
  ["for(const k in POOLS){const P=POOLS[k];P.robe.visible=P.head.visible=!HELD;",
   "for(const k in POOLS){const P=POOLS[k];const rl=!!(P.real&&typeof REALP!='undefined'&&REALP.on);P.robe.visible=P.head.visible=!HELD&&!rl;if(P.real)P.real.visible=!HELD&&rl;",
   "const rl=!!(P.real"],
]);
const bj = fs.readFileSync(path.join(root, 'build.js'), 'utf8');
const NL = bj.includes('\r\n') ? '\r\n' : '\n';
patch('build.js', [
  ["'figures','people','crowd','life'", "'figures','people','real_people','crowd','life'", "'people','real_people','crowd'"],
]);
// REAL=1 -> embed the image atlases (assets/people/people.json) in the single-file builds (offline html / GitHub Pages / tests)
patch('build.js', [
  ["const app=pre.concat(svc,", "const REALJS=process.env.REAL&&fs.existsSync(p.join(d,'assets','people','people.json'))?['window.REAL_PEOPLE='+fs.readFileSync(p.join(d,'assets','people','people.json'),'utf8')+';']:[];   // REAL=1: אטלסי אנשים אמיתיים מוטמעים בקובץ (בחבילה העצלה של האתר החי הם נטענים בנפרד – ראו site/publish.mjs)" + NL + "const app=REALJS.concat(pre,svc,", "const REALJS"],
]);
console.log('ok');
