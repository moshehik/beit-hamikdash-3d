/* מחולל סדר "עבודת יום הכיפורים": tools/yoma-research.json + tools/yk-template.js ← src/svc/yom-kippur.js */
const fs=require('fs'),p=require('path');const d=p.join(__dirname,'..');
const J=JSON.parse(fs.readFileSync(p.join(d,'tools/yoma-research.json'),'utf8'));
const rows=J.steps.filter(s=>s.n>=10).map(s=>[s.n,s.title,s.text,s.quote||'',s.src,s.time,s.garb==='gold'||s.garb==='white'?s.garb:'none',s.tevila?1:0]);
let t=fs.readFileSync(p.join(d,'tools/yk-template.js'),'utf8');
const miss=[];for(const r of rows)if(!new RegExp('\n\s*'+r[0]+':\(\)').test(t))miss.push(r[0]);
if(miss.length)console.log('חסר מפרט לשלבים:',miss.join(','));
t=t.replace('/*DATA*/','const YKD='+JSON.stringify(rows)+';');
fs.writeFileSync(p.join(d,'src/svc/yom-kippur.js'),t);console.log('נוצר src/svc/yom-kippur.js –',rows.length,'שלבים');
