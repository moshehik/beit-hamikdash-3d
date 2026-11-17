// בניית מילון ניקוד-ייחוס ממקורות מנוקדים ברשות הרבים (ספריא: משנה – תורת אמת; מקרא) → tools/niqqud-corpus.json
//   node tools/niqqud-corpus.cjs
// המילון הוא רמז בלבד למודל הניקוד (ולבדיקה ידנית): אות-פשוטה -> [ניקודים נפוצים]. לא נשלח שום מפתח ושום מידע פרטי (רק קריאת טקסט ציבורי).
const fs=require('fs'),p=require('path'),cp=require('child_process');
const OUT=p.join(__dirname,'niqqud-corpus.json');
const REFS=[];
for(let i=1;i<=7;i++)REFS.push('Mishnah_Tamid.'+i);
for(const [b,n] of [['Mishnah_Zevachim',[1,2,3,4,5,6]],['Mishnah_Menachot',[1,2,3,5,6]],['Mishnah_Yoma',[1,2,3,4,5]],['Mishnah_Middot',[1,2,3,4,5]],['Mishnah_Shekalim',[5,6]],['Mishnah_Keritot',[1]]])for(const c of n)REFS.push(b+'.'+c);
for(const c of [1,2,6])REFS.push('Leviticus.'+c);
REFS.push('Exodus.30','Exodus.25');
const STRIP=/[֑-ֽֿ֯׀׃ׅׄ׆]/g;   // טעמים, מתג, פסק, סוף פסוק...
const plain=w=>w.replace(/[֑-ׇ]/g,'');
const vocab=new Map();
function add(t){t=String(t).replace(/<[^>]+>/g,' ').replace(/&[a-z]+;/g,' ').replace(STRIP,'').replace(/[־]/g,' ');
 for(let w of t.split(/\s+/)){w=w.replace(/[^א-תְ-ׇ]/g,'');if(w.length<2)continue;w=w.normalize('NFC');const k=plain(w);if(!/[ְ-ׇ]/.test(w))continue;
  let m=vocab.get(k);if(!m){m=new Map();vocab.set(k,m)}m.set(w,(m.get(w)||0)+1)}}
function flat(x,o){if(Array.isArray(x))x.forEach(y=>flat(y,o));else if(typeof x==='string')o.push(x);return o}
for(const r of REFS){
 const o=cp.spawnSync('curl',['-s','-m','40','https://www.sefaria.org/api/texts/'+r+'?context=0&commentary=0'],{encoding:'utf8',maxBuffer:64*1024*1024,env:{...process.env,MSYS2_ARG_CONV_EXCL:'*'}});
 let j=null;try{j=JSON.parse(o.stdout)}catch(e){}
 if(!j||!j.he){console.log('fail',r);continue}
 const a=flat(j.he,[]);a.forEach(add);console.log('ok',r,a.length)}
const out={};for(const [k,m] of vocab){out[k]=[...m.entries()].sort((a,b)=>b[1]-a[1]).slice(0,3).map(e=>e[0])}
fs.writeFileSync(OUT,JSON.stringify(out));console.log('words',Object.keys(out).length)
