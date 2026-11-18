// tools/audit-people.mjs  –  אימות תנועת אנשים בעזרה ובהר הבית (בלי חדירה לקירות, בלי קפיצות, בלי הופעה/היעלמות גלויה, בלי עמידה >60 דקות-דגם)
//
//   node tools/audit-people.mjs serve <built.html> [port=8776]
//        מגיש את הדגם הבנוי (קובץ OUT) עם tools/audit-people-page.js מוזרק בסופו.
//        לפתוח בדפדפן:  http://localhost:8776/?audit=1            (כל 9 סוגי הימים × 24 שעות, רצף + קפיצות שעה/יום)
//                       http://localhost:8776/?audit=1&days=chol,yk&rate=0.02&dt=0.25&jump=0   (פרמטרים: days, rate [שעות/שנייה], dt, jump, hours, boost)
//                       http://localhost:8776/?perf=1                                           (זמן עדכון ממוצע לפריים בתקציבי ברירת המחדל)
//        הדף שולח את התוצאות ל-/save → tools/audit-people-result.json, והשרת מדפיס סיכום.
//   node tools/audit-people.mjs summary <result.json>     מדפיס סיכום של קובץ תוצאות קיים
//
// מה נבדק לכל דמות (CROWD.entities(): דמויות ההמון + שחקני people.js; בגרסה ישנה – סריקת מופעים/יחידות):
//   א. המרכז אינו בתוך COL (חפיפה >0.25 בכל הצירים, אותו קריטריון גובה כמו blocked) ואינו חוצה קיר בין פריים לפריים;
//   ב. אין קפיצת מיקום >2.5 יחידות בפריים (טלפורטציה);
//   ג. אין יצירה/השמדה גלויה: דמות שנוצרת/נעלמת ברחק <250 בתוך חרוט הראייה של המצלמה ושאינה בשער (±16 יחידות משער);
//   ד. אין scale חריג של מופע (<0.55 או >1.4 – "צמיחה מהרצפה");
//   ה. עמידה במקום >60 דקות-דגם: סה"כ, ומתוכן "ללא סיבה" (פילגרים/בעלי קרבן שלא התחלפו) לעומת "עם סיבה" (עבודה/משמר/דיין).
// המצלמה בבדיקה מסתובבת ומחליפה נקודת מבט כל 25 שניות (8 נקודות: עזרה, עזרת נשים, חיל, הר הבית).
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pagePath = path.join(root, 'tools', 'audit-people-page.js');
const resultPath = path.join(root, 'tools', 'audit-people-result.json');
const cmd = process.argv[2];

const BOOT = `
;(function(){const q=new URLSearchParams(location.search);if(!q.has('audit')&&!q.has('perf'))return;
 const num=(k,d)=>q.has(k)?+q.get(k):d;
 window.addEventListener('load',()=>setTimeout(async()=>{
  try{let res;
   if(q.has('perf')){res=[];for(const d of ['erev-pesach','shavuot','chol'])res.push(await runPerf({day:d,h:d=='chol'?8:12}))}
   else res=await runAudit({days:q.has('days')?q.get('days').split(','):undefined,rate:num('rate',.1),dt:num('dt',.2),jump:q.get('jump')!=='0',hours:num('hours',24),boost:num('boost',2.5)});
   await fetch('/save',{method:'POST',body:JSON.stringify(res)});document.title='AUDIT DONE';
  }catch(e){await fetch('/save',{method:'POST',body:JSON.stringify({error:String(e&&e.stack||e)})});document.title='AUDIT ERROR'}
 },3000))})();`;

function summary(R) {
  if (R.error) return 'ERROR: ' + R.error;
  if (Array.isArray(R)) return R.map(r => JSON.stringify(r)).join('\n');
  const T = R.total, L = [];
  L.push(`אימות תנועת אנשים – ${Object.keys(R.perDay).length} סוגי ימים, ${T.steps} פריימים, ${R.sec}s, ממוצע ישויות ${R.perf.entAvg} (מקס' ביום בודד ${T.entMax})`);
  L.push(`  חדירה לקירות: במרכז COL=${T.insideCOL}, חציית קיר=${T.crossCOL}   (דיינים יושבים על כיסא COL: ${T.seatedInside} – מכוון)`);
  L.push(`  קפיצות >2.5: ${T.jumps} (מקס' ${T.jumpMax.toFixed(1)})`);
  L.push(`  יצירה גלויה (לא בשער): ${T.createVis} מתוך ${T.create}  [בשער: ${T.createGate}, מוסתר: ${T.createHidden}]`);
  L.push(`  השמדה גלויה (לא בשער): ${T.destroyVis} מתוך ${T.destroy}  [בשער: ${T.destroyGate}, מוסתר: ${T.destroyHidden}]`);
  L.push(`  scale חריג: ${T.scaleBad}`);
  L.push(`  עמידה >60 דקות-דגם: ${T.still60} (עם סיבה/עבודה ${T.still60why}, ללא סיבה ${T.still60nowhy})`);
  L.push(`  ביצועים (CROWD.update+ambUpdate, תקציב בלתי מוגבל): ממוצע ${R.perf.avgMs}ms, p95 ${R.perf.p95Ms}ms, מקס' ${R.perf.maxMs}ms`);
  return L.join('\n');
}

if (cmd === 'serve') {
  const built = process.argv[3];
  if (!built) { console.log('usage: node tools/audit-people.mjs serve <built.html> [port]'); process.exit(1); }
  const port = +(process.argv[4] || 8776);
  const html = fs.readFileSync(built, 'utf8');
  const i = html.lastIndexOf('</body>');
  const page = html.slice(0, i) + '<script src="/__audit-people-page.js"></script>' + html.slice(i);
  http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/save') {
      let b = '';
      req.on('data', c => b += c);
      req.on('end', () => {
        fs.writeFileSync(resultPath, b);
        try { console.log(summary(JSON.parse(b))); } catch (e) { console.log('saved', resultPath); }
        res.end('ok');
      });
      return;
    }
    if (req.url.startsWith('/__audit-people-page.js')) {
      res.setHeader('Content-Type', 'text/javascript; charset=utf-8');
      res.end(fs.readFileSync(pagePath, 'utf8') + BOOT);
      return;
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(page);
  }).listen(port, '127.0.0.1', () => console.log('audit server on http://localhost:' + port + '/?audit=1  (או ?perf=1)'));
} else if (cmd === 'summary') {
  console.log(summary(JSON.parse(fs.readFileSync(process.argv[3] || resultPath, 'utf8'))));
} else {
  console.log('usage: node tools/audit-people.mjs serve <built.html> [port] | summary [result.json]');
}
