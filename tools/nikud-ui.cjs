// ניקוד לכל הטקסט בממשק: אוסף מחרוזות עבריות מ-src/template.html ומקבצי src/*.js (בלי נתוני מפה/הנחיות מערכת/קבצי נתונים),
// מנקד אותן בצנרת הקיימת (tools/niqqud.cjs + מטמון audio/niqqud-cache.json + tools/niqqud-fixes.json) וכותב src/nikud_map.js:
//   const NQ_MAP={"<טקסט פשוט>":"<מנוקד>",...}; function nq(s){...}
// הניקוד מוחל רק בתצוגה (src/nikud_dom.js + lbl ב-app.js); קבצי המקור לא משתנים.
//   node tools/nikud-ui.cjs scan     -> אוסף ומדווח (בלי API)
//   node tools/nikud-ui.cjs run      -> מנקד מה שחסר במטמון (Gemini דרך curl) וכותב את המפה
//   node tools/nikud-ui.cjs build    -> כותב את המפה רק ממה שכבר במטמון (בלי API)
//   ENV: NIQQUD_BATCH, NIQQUD_MODELS, INCLUDE_REGIONS=1 (גם src/regions.js), LIMIT=N (מקס' בקשות-קבוצה בהרצה)
// מפתחות: GEMINI_API_KEYS מתוך print-center/.env (לא מודפסים). השיחה דרך curl (Git Bash).
const fs=require('fs'),p=require('path'),cp=require('child_process'),os=require('os');
const NIQ=require('./niqqud.cjs');
const ROOT=p.join(__dirname,'..'),SRC=p.join(ROOT,'src'),AUD=p.join(ROOT,'audio');
const ENV=process.env.PC_ENV||'C:/Users/moshe/Music/מדפיס בוט/print-center/.env';
const NL=String.fromCharCode(10);
const HEBL=/[א-ת]/g,MARK=/[֑-ֽֿׁׂׄ-ׇ]/;

// ---------- מקורות ----------
function jsFiles(){
 const L=['app','audio','lishkhot','jerusalem','map','kids','services','story','story_olat_haof','kidui','ui','people','crowd','life','npcs'];
 if(process.env.INCLUDE_REGIONS)L.push('regions');
 const out=L.map(n=>'src/'+n+'.js').filter(f=>fs.existsSync(p.join(ROOT,f)));
 const sd=p.join(SRC,'svc');if(fs.existsSync(sd))fs.readdirSync(sd).filter(f=>/[.]js$/.test(f)).sort().forEach(f=>out.push('src/svc/'+f));
 return out}

// ---------- סורק JS: מחרוזות (כולל חלקי template בין ${ }), בלי הערות ובלי regex ----------
function jsStrings(src){
 const out=[],n=src.length,stack=[];let i=0,depth=0,prev='';   // prev: 'id' (מזהה/מספר/סוגר סוגר) או 'op'
 const KW=/^(return|typeof|case|in|of|delete|void|throw|new|else|do|yield|await)$/;
 function esc(){const c=src[i+1];i+=2;
  if(c==='n')return NL;if(c==='t')return'\t';if(c==='r')return'';if(c==='b'||c==='f'||c==='v')return' ';if(c==='0')return'\0';
  if(c==='u'){if(src[i]==='{'){const e=src.indexOf('}',i);const h=src.slice(i+1,e);i=e+1;return String.fromCodePoint(parseInt(h,16))}const h=src.slice(i,i+4);i+=4;return String.fromCharCode(parseInt(h,16))}
  if(c==='x'){const h=src.slice(i,i+2);i+=2;return String.fromCharCode(parseInt(h,16))}
  if(c===NL)return'';if(c==='\r'){if(src[i]===NL)i++;return''}
  return c}
 function readQ(q){let s='';while(i<n&&src[i]!==q){if(src[i]==='\\')s+=esc();else if(src[i]===NL)break;else s+=src[i++]}i++;return s}
 function readTpl(){let s='';
  while(i<n){const c=src[i];
   if(c==='\\'){s+=esc();continue}
   if(c==='`'){i++;out.push(s);return}
   if(c==='$'&&src[i+1]==='{'){i+=2;out.push(s);stack.push(depth);depth=0;return}
   s+=c;i++}}
 while(i<n){const c=src[i];
  if(c==='/'&&src[i+1]==='/'){while(i<n&&src[i]!==NL)i++;continue}
  if(c==='/'&&src[i+1]==='*'){const e=src.indexOf('*/',i+2);i=e<0?n:e+2;continue}
  if(c==="'"||c==='"'){i++;out.push(readQ(c));prev='id';continue}
  if(c==='`'){i++;readTpl();prev='id';continue}
  if(c==='/'){   // regex או חילוק
   if(prev==='op'){i++;let cls=false;while(i<n&&src[i]!==NL){if(src[i]==='\\')i+=2;else if(src[i]==='['){cls=true;i++}else if(src[i]===']'){cls=false;i++}else if(src[i]==='/'&&!cls){i++;break}else i++}
    while(i<n&&/[a-z]/.test(src[i]))i++;prev='id';continue}
   i++;prev='op';continue}
  if(c==='{'){depth++;i++;prev='op';continue}
  if(c==='}'){if(depth===0&&stack.length){depth=stack.pop();i++;readTpl();prev='id';continue}depth--;i++;prev='id';continue}   // אחרי } נתייחס כמזהה (חילוק) – נדיר שמגיע regex
  if(/[A-Za-z_$0-9]/.test(c)){let j=i;while(j<n&&/[A-Za-z_$0-9]/.test(src[j]))j++;const w=src.slice(i,j);prev=KW.test(w)?'op':'id';i=j;continue}
  if(c===')'||c===']'){prev='id';i++;continue}
  if(c===' '||c==='\t'||c===NL||c==='\r'){i++;continue}
  prev='op';i++}
 return{strings:out,balanced:depth===0&&stack.length===0}}

// ---------- HTML ----------
function decodeEnt(s){return s.replace(/&nbsp;/g,' ').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#(\d+);/g,(m,d)=>String.fromCharCode(+d)).replace(/&#x([0-9a-f]+);/gi,(m,h)=>String.fromCharCode(parseInt(h,16))).replace(/&amp;/g,'&')}
const ATTR=/\b(title|aria-label|placeholder|alt)\s*=\s*("([^"]*)"|'([^']*)')/g;
function htmlTexts(html){   // טקסט צמתים + מאפייני תצוגה, בלי script/style
 const out=[];html=html.replace(/<script[\s\S]*?<\/script>/gi,'<script></script>').replace(/<style[\s\S]*?<\/style>/gi,'<style></style>').replace(/<!--[\s\S]*?-->/g,'');
 const re=/<[^>]*>|[^<]+/g;let m;
 while((m=re.exec(html))){const t=m[0];if(t[0]==='<'){let a;ATTR.lastIndex=0;while((a=ATTR.exec(t)))out.push(decodeEnt(a[3]!=null?a[3]:a[4]))}else out.push(decodeEnt(t))}
 return out}

// ---------- סינון/נרמול ----------
const norm=s=>String(s).replace(/\s+/g,' ').trim();
function acceptable(t){
 if(!t)return false;const heb=(t.match(HEBL)||[]).length;if(heb<2)return false;
 if(MARK.test(t))return false;                                   // כבר מנוקד במקור
 if(/=>|[{};]|\$\{/.test(t))return false;                        // קוד
 return true}
// מחרוזת JS -> רשימת מקטעי תצוגה (אם יש בה HTML – מפצלים לפי תגיות)
function pieces(s){
 const raw=/<[a-zA-Z\/!][^>]*>/.test(s)?htmlTexts(s):[s];
 const out=[];for(const r of raw){const t=norm(decodeEnt(r));if(acceptable(t))out.push(t)}return out}

function collect(){
 const found=new Map();   // plain -> [files]
 const add=(t,f)=>{if(!found.has(t))found.set(t,new Set());found.get(t).add(f)};
 const warn=[];
 for(const f of ['src/template.html']){const s=fs.readFileSync(p.join(ROOT,f),'utf8');
  const body=s.slice(0,s.indexOf('{{APP}}')>0?s.indexOf('<script>'):s.length);
  for(const t of htmlTexts(body))for(const q of pieces(t))add(q,f)}
 for(const f of jsFiles()){const s=fs.readFileSync(p.join(ROOT,f),'utf8'),r=jsStrings(s);if(!r.balanced)warn.push('unbalanced scan: '+f);
  for(const str of r.strings)for(const q of pieces(str))add(q,f)}
 return{found,warn}}

// ---------- API ----------
function keys(){const e=fs.readFileSync(ENV,'utf8').match(/^GEMINI_API_KEYS=(.*)$/m);if(!e)throw new Error('no keys');return e[1].replace(/^["']|["']$/g,'').split(',').map(s=>s.trim()).filter(Boolean)}
function curlJson(url,body,tmo){const f=p.join(os.tmpdir(),'nikud-ui-'+process.pid+'.json');fs.writeFileSync(f,JSON.stringify(body));
 const r=cp.spawnSync('curl',['-s','-m',String(tmo||90),'-o','-','-w',NL+'%{http_code}','-H','content-type: application/json','--data-binary','@'+f,url],{encoding:'utf8',maxBuffer:64*1024*1024,env:{...process.env,MSYS2_ARG_CONV_EXCL:'*'}});
 try{fs.unlinkSync(f)}catch(e){}
 const o=r.stdout||'',k=o.lastIndexOf(NL),status=+o.slice(k+1);let json=null;try{json=JSON.parse(o.slice(0,k))}catch(e){}return{status,json}}

const cmd=process.argv[2]||'scan';
const {found,warn}=collect();
const plains=[...found.keys()].sort((a,b)=>a.localeCompare(b,'he'));
const totalChars=plains.reduce((a,t)=>a+t.length,0);
console.log('strings',plains.length,'chars',totalChars);warn.forEach(w=>console.log('WARN',w));
const byFile={};for(const [t,fs_] of found)for(const f of fs_)byFile[f]=(byFile[f]||0)+1;console.log(byFile);
if(cmd==='scan'){fs.writeFileSync(p.join(os.tmpdir(),'nikud-ui-scan.json'),JSON.stringify(plains,null,1));process.exit(0)}

const K=cmd==='run'?keys():[];
const nq=NIQ.make({curlJson,keys:K,cacheFile:p.join(AUD,'niqqud-cache.json'),fixesFile:p.join(__dirname,'niqqud-fixes.json'),corpusFile:p.join(__dirname,'niqqud-corpus.json')});
const cache=nq.cache();
// מפתח המטמון זהה ל-ckey שב-niqqud.cjs; מחשבים כאן רק כדי לדעת מה חסר
const crypto=require('crypto');const sysHash=crypto.createHash('sha1').update(NIQ.SYSTEM).digest('hex').slice(0,6);
const ckey=pl=>crypto.createHash('sha1').update(sysHash+'|'+pl).digest('hex').slice(0,16);

// סמלים/אימוג'י כאסימון נפרד (🎲 ▶ ←) – לא נשלחים למודל (הורידו את כיסוי האותיות באימות); מוחזרים למקומם בהרכבה
const SYM=/^[^\u05D0-\u05EAA-Za-z0-9]+$/;   // אסימון בלי אות/ספרה (אימוג'י, –, ·, ←) – לא נשלח למודל
const LEAD=/^[^\u05D0-\u05EAA-Za-z0-9]+/,TRAIL=/[^\u05D0-\u05EAA-Za-z0-9]+$/;
function dec(t){const lead=(t.match(LEAD)||[''])[0],r=t.slice(lead.length),trail=(r.match(TRAIL)||[''])[0];return{lead,mid:r.slice(0,r.length-trail.length),trail}}
const coreOf=t=>dec(t).mid.split(' ').filter(x=>!SYM.test(x)).join(' ');
function compose(t,vcore){const d=dec(t),vt=vcore.split(' ');let k=0;return d.lead+d.mid.split(' ').map(x=>SYM.test(x)?x:vt[k++]).join(' ')+d.trail}
const lookup=t=>{const c=cache[ckey(t)];if(c)return c.text;const k=coreOf(t);if(k!==t&&cache[ckey(k)])return compose(t,cache[ckey(k)].text);return null};

// טקסט שכבר קיים במטמון בגרסת narration.prep (בלי הערות "בדגם") – מעבירים סימנים לטקסט המלא ע"י alignMarks
function prep(t){return t.replace(/\s*[(][^)]*(בדגם|כמו בסרט|מקורב|בסרט)[^)]*[)]/g,'').replace(/ר'\s/g,'ראו ').replace(/\s+/g,' ').replace(/\s+([.,:;])/g,'$1').trim()}

let missing=plains.filter(t=>!lookup(t));
// ניסיון: טקסט שה-prep שלו קיים במטמון
let viaPrep=0;for(const t of missing.slice()){const q=prep(t);if(q===t||!cache[ckey(q)])continue;
 const al=NIQ.alignMarks(t,cache[ckey(q)].text);if(al.coverage<.97)continue;
 const w=al.text.split(/\s+/).filter(x=>/[א-ת]/.test(x));if(w.some(x=>!MARK.test(x)&&(x.match(HEBL)||[]).length>=2))continue;   // נשארה מילה בלי ניקוד (למשל הערה שנגרעה) – נשלח למודל
 cache[ckey(t)]={text:al.text.normalize('NFC'),model:'via-prep',cov:+al.coverage.toFixed(3)};viaPrep++}
if(viaPrep){fs.writeFileSync(p.join(AUD,'niqqud-cache.json'),JSON.stringify(cache,null,1));missing=plains.filter(t=>!lookup(t))}
const need=[...new Set(missing.map(coreOf))];
console.log('cached',plains.length-missing.length,'(via prep:',viaPrep+')','missing',missing.length,'chars',missing.reduce((a,t)=>a+t.length,0));
if(cmd==='run'&&missing.length){
 const groups=[need.filter(t=>t.length<=60),need.filter(t=>t.length>60&&t.length<=300),need.filter(t=>t.length>300)];
 const bs=[+process.env.NIQQUD_BATCH_SHORT||25,+process.env.NIQQUD_BATCH_MID||8,+process.env.NIQQUD_BATCH_LONG||4];
 groups.forEach((g,gi)=>{if(!g.length)return;process.env.NIQQUD_BATCH=String(bs[gi]);console.log('vocalizing group',gi,g.length,'items, batch',bs[gi]);
  const r=nq.vocalize(g.map((t,i)=>({id:i,plain:t})),m=>console.log(m));if(r.failed.length)console.log('  failed',r.failed.length)})}

// ---------- כתיבת המפה ----------
const map={},failed=[],changed=[];
const NQ2=NIQ.make({curlJson,keys:[],cacheFile:p.join(AUD,'niqqud-cache.json'),fixesFile:p.join(__dirname,'niqqud-fixes.json'),corpusFile:p.join(__dirname,'niqqud-corpus.json')});
const cache2=NQ2.cache();
const lookup2=t=>{const c=cache2[ckey(t)];if(c)return c.text;const k=coreOf(t);if(k!==t&&cache2[ckey(k)])return compose(t,cache2[ckey(k)].text);return null};
for(const t of plains){const raw=lookup2(t);if(!raw){failed.push(t);continue}
 let v=NQ2.finish(raw);
 if(NIQ.strip(v)!==t){const al=NIQ.alignMarks(t,v);v=al.text;changed.push(t)}
 v=v.normalize('NFC');
 const w=v.split(/\s+/).filter(x=>/[א-ת]/.test(x)),bare=w.filter(x=>!MARK.test(x)&&(x.match(HEBL)||[]).length>=2);
 if(NIQ.strip(v)!==t){failed.push(t);continue}
 map[t]=v}
const body='/* נוצר אוטומטית ע"י tools/nikud-ui.cjs – ניקוד לכל הטקסט בממשק (מפתח: טקסט פשוט; תצוגה בלבד, הלוגיקה עובדת על הפשוט). אל תערוך ידנית */'+NL+
 'const NQ_MAP='+JSON.stringify(map).replace(/","/g,'",'+NL+'"')+';'+NL+
 '/* nq(s): ניקוד מלא אם הטקסט כולו במפה; אחרת התאמה חמדנית של צירופי מילים ידועים (למשל "שלב "+מספר+" מתוך "+מספר); מה שלא נמצא נשאר כמות שהוא */'+NL+
 fs.readFileSync(p.join(__dirname,'nikud-runtime.js'),'utf8');
fs.writeFileSync(p.join(SRC,'nikud_map.js'),body);
fs.writeFileSync(p.join(os.tmpdir(),'nikud-ui-failed.json'),JSON.stringify(failed,null,1));
console.log('map entries',Object.keys(map).length,'size',(body.length/1024|0)+'KB','failed/unvocalized',failed.length,'letters-realigned',changed.length);
