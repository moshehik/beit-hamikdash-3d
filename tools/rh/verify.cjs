/* בודק שכל ציטוט במחקר מופיע במשנה (tools/rh/mishna.txt, נוסח ספריא): בלי ניקוד, בלי פיסוק, בלי הפניות בסוגריים, ובהשוואת "שלד" (בלי ו/י, ן=ם) כדי לא להיתקע על הבדלי כתיב.  node tools/rh/verify.cjs */
const fs=require('fs'),p=require('path');
const skel=s=>s.replace(/ן/g,'ם').replace(/ך/g,'כ').replace(/[וי]/g,'').replace(/\s+/g,' ').trim();
const norm=(s,strip)=>skel((strip?s.replace(/\([^)]*\)/g,' '):s).replace(/[֑-ׇ]/g,'').replace(/[.,:;!?"'׳״()\-–־]/g,' ').replace(/\s+/g,' ').trim());
const M={};fs.readFileSync(p.join(__dirname,'mishna.txt'),'utf8').split(/\r?\n/).filter(Boolean).forEach(l=>{const i=l.indexOf('|');M[l.slice(0,i)]=norm(l.slice(i+1),true)});
const HE='אבגדהוזחט';
const rows=[].concat(...[1,2,3,4].map(i=>require('./ch'+i+'.cjs')));
let bad=0;
rows.forEach((r,i)=>{const m=r[0].match(/^משנה ([א-ד]):([א-ט])$/);if(!r[3])return;if(!m){console.log(i,'מקור לא ברור',r[0]);bad++;return}
 const key=(1+'אבגד'.indexOf(m[1]))+':'+(1+HE.indexOf(m[2])),q=norm(r[3]);
 if(!M[key]||!M[key].includes(q)){bad++;console.log('✗',i,key,r[1],'\n   ',q.slice(0,90));
  let k=q.length;while(k>0&&!M[key].includes(q.slice(0,k)))k--;console.log('    מתאים עד:',q.slice(0,k).slice(-40),'| במשנה אחר כך:',(M[key].split(q.slice(0,k))[1]||'').slice(0,40))}});
console.log(rows.length,'שלבים;',bad,'ציטוטים לא מתאימים');process.exit(bad?1:0);
