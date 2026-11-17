// ניקוד אוטומטי להקראה (Gemini TTS) – שיטה שנגזרה מתיעוד "מדפיס בוט" (print-center: lib/phonePromptsNikud.js, lib/geminiTts.js fixPrefixShva).
// שרשרת: טקסט פשוט -> מודל טקסט של Gemini (הנחיה מפורשת: ניקוד תקני + מונחי מקדש + רמזי מילון ממשנה/מקרא) -> אימות שהאותיות לא השתנו
//   (alignMarks: אם המודל סטה באותיות – מעתיקים אליו רק את סימני הניקוד) -> מטמון (audio/niqqud-cache.json) -> תיקוני מילון ידניים
//   (tools/niqqud-fixes.json) -> fixPrefixShva. רק התוצאה הסופית נשלחת ל-TTS; הטקסט המוצג על המסך נשאר בלי ניקוד.
const fs=require('fs'),p=require('path'),crypto=require('crypto');
const MARKS=/[֑-ֽֿׁׂׄ-ׇ]/g,TAAMIM=/[֑-ֽֿ֯׀׃-׆]/g;
const strip=s=>String(s).replace(MARKS,'');
const norm=s=>String(s).replace(/\s+/g,' ').trim();
const HEB=/[א-ת]/;

// --- fixPrefixShva: העתק מדויק של lib/geminiTts.js (14.10.2026): ל/ב/כ בשווא לפני מילה שאות הפתיחה שלה גם בשווא -> חיריק (או סגול לפני וְ) ---
function fixPrefixShva(text){
 return String(text==null?'':text).normalize('NFC')
  .replace(/(?<![א-ת֐-ׇ])([בכל]ְּ?)וְ/g,'$1וֶ')
  .replace(/(?<![א-ת֐-ׇ])([בכל])ְ(ּ?)יְ/g,'$1ִ$2י')
  .replace(/(?<![א-ת֐-ׇ])([בכל])ְ(ּ?)(?=[א-ת]ְ)/g,'$1ִ$2')}

// --- אשכולות (אות + סימניה) ו-alignMarks (פורט מ-print-center/lib/phonePromptsNikud.js, בלי לוגיקת {משתנים}) ---
function clusters(text){const out=[];for(const ch of String(text)){if(/[֑-ֽֿׁׂׄ-ׇ]/.test(ch)&&out.length)out[out.length-1].marks+=ch;else out.push({ch,marks:''})}return out}
function alignMarks(original,candidate){
 const a=[...String(original)],aPos=[];a.forEach((c,i)=>{if(!/\s/.test(c))aPos.push(i)});
 const b=clusters(candidate).filter(c=>!/\s/.test(c.ch)),n=aPos.length,m=b.length;
 const dp=Array.from({length:n+1},()=>new Uint16Array(m+1));
 for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)dp[i][j]=a[aPos[i]]===b[j].ch?dp[i+1][j+1]+1:Math.max(dp[i+1][j],dp[i][j+1]);
 const marksAt=new Map();let matched=0,i=0,j=0;
 while(i<n&&j<m){if(a[aPos[i]]===b[j].ch){if(b[j].marks)marksAt.set(aPos[i],b[j].marks);matched++;i++;j++}else if(dp[i+1][j]>=dp[i][j+1])i++;else j++}
 let out='';for(let k=0;k<a.length;k++){out+=a[k];if(marksAt.has(k))out+=marksAt.get(k)}
 return{text:out,coverage:n?matched/n:1}}

// --- מילון תיקונים ידני ---
// tools/niqqud-fixes.json: {"אות-פשוטות":"ניקוד/כתיב-הגייה", "צירוף של כמה מילים":"..."}; הערך מחליף את המילה/הצירוף גם עם קידומת (ה/ו/ב/ל/מ/כ/ש ושילובים);
// הקידומת נשארת כפי שהמודל ניקד אותה, והדגש של אות הגזע הראשונה מועתק מהמודל (דגש חזק אחרי ה"א הידיעה תלוי במילה).
const PREFIXES=['','ה','ו','ב','ל','מ','כ','ש','וה','וב','ול','ומ','וכ','וש','שה','שב','של','שמ','כש','לכל','ולכל','בכל','מכל','כל'];
const PFX_SORTED=[...new Set(PREFIXES)].sort((x,y)=>y.length-x.length);
function loadFixes(file){let j={};try{j=JSON.parse(fs.readFileSync(file,'utf8'))}catch(e){}
 const words=new Map(),phrases=[];
 for(const [k,v] of Object.entries(j)){if(k[0]==='_')continue;const key=norm(strip(k)),val=norm(String(v).normalize('NFC'));
  if(key.includes(' '))phrases.push({key,n:key.split(' ').length,val:val.split(' ')});else words.set(key,val)}
 return{words,phrases}}
const TOKEN=/[א-תְ-ֽֿׁׂׄ-ׇ]+/g;
function firstClusterDagesh(tok){const c=clusters(tok)[0];return c&&c.marks.includes('ּ')}
function setDagesh(tok,on){const cs=clusters(tok);if(!cs.length)return tok;const c=cs[0],has=c.marks.includes('ּ');
 if(on&&!has)c.marks+='ּ';else if(!on&&has)c.marks=c.marks.replace('ּ','');return cs.map(x=>x.ch+x.marks).join('').normalize('NFC')}
function replaceStem(tok,P,V){
 if(V[0]==='='){V=V.slice(1);if(!P)return V;const c0=clusters(tok);return c0.slice(0,P.length).map(x=>x.ch+x.marks).join('')+V}   // =ערך: בלי העתקת דגש מהמודל   // tok: הטוקן המנוקד של המודל, P: קידומת פשוטה, V: ערך התיקון (מנוקד)
 if(!P)return V;const cs=clusters(tok),pre=cs.slice(0,P.length).map(x=>x.ch+x.marks).join(''),stem=cs.slice(P.length).map(x=>x.ch+x.marks).join('');
 const dg=stem?firstClusterDagesh(stem):false;
 return pre+setDagesh(V,dg&&!/^[אהחער]/.test(V))}
function applyFixes(text,fx){
 const toks=[];let m;TOKEN.lastIndex=0;const src=String(text).normalize('NFC');while((m=TOKEN.exec(src)))toks.push({s:m.index,e:m.index+m[0].length,t:m[0],pl:strip(m[0])});
 const repl=new Array(toks.length).fill(null),skip=new Array(toks.length).fill(false);
 for(let i=0;i<toks.length;i++){if(skip[i])continue;
  // צירופים
  let done=false;
  for(const ph of fx.phrases){if(i+ph.n>toks.length)continue;let ok=true;for(let k=0;k<ph.n;k++){if(toks[i+k].pl!==ph.key.split(' ')[k]){ok=false;break}
    if(k>0&&!/^\s+$/.test(src.slice(toks[i+k-1].e,toks[i+k].s))){ok=false;break}}
   if(ok){for(let k=0;k<ph.n;k++){repl[i+k]=ph.val[k];skip[i+k]=true}done=true;break}}
  if(done)continue;
  for(const P of PFX_SORTED){if(toks[i].pl.length<=P.length||!toks[i].pl.startsWith(P))continue;const rest=toks[i].pl.slice(P.length);
   if(fx.words.has(rest)){repl[i]=replaceStem(toks[i].t,P,fx.words.get(rest));break}}}
 let out='',last=0;toks.forEach((t,i)=>{out+=src.slice(last,t.s)+(repl[i]!=null?repl[i]:t.t);last=t.e});out+=src.slice(last);return out.normalize('NFC')}

// --- הנחיה למודל ---
const SYSTEM=`You add full, accurate Hebrew niqqud (vowel points) to short Hebrew texts. The output will be read aloud by a Hebrew text-to-speech engine, so every word must be vocalized exactly as it is read correctly aloud (standard Israeli reading, with traditional Biblical and Mishnaic pronunciation for quoted terms).

STRICT RULES:
1. Add complete niqqud to EVERY Hebrew word: shva, dagesh (including dagesh forte, e.g. הַקְּטֹרֶת), patach/kamatz, segol/tsere, cholam, shuruk, chirik, hataf vowels etc., as a careful Hebrew teacher would write it. No cantillation marks (te'amim).
2. NEVER change, add, remove, reorder, merge or split any word or letter. Ignoring the niqqud marks, each paragraph must be letter-for-letter identical to the input (keep the spelling, full or defective, exactly as written: NEVER drop or add a י or ו — vocalize the letters that are there).
3. Keep exactly as-is: punctuation, quotation marks, dashes, maqaf (־), line breaks and spacing.
4. Choose the vocalization by CONTEXT (e.g. "ישנים" = יְשֵׁנִים when it means "sleeping" and יְשָׁנִים when it means "old"; "קומץ" = קוֹמֵץ as a verb, קֹמֶץ as a noun; "עולה" = עוֹלָה the offering; "שם" = שָׁם/שֵׁם by meaning; "ברכה" = בְּרָכָה; "מערבה" = מַעֲרָבָה).
5. Temple terms and names must be vocalized as in the Torah and the Mishnah: קְטֹרֶת (קטורת), מִזְבֵּחַ, כֹּהֵן, כֹּהֲנִים, כֹּהֵן גָּדוֹל, קָרְבָּן, קָרְבָּנוֹת, מִנְחָה, סֹלֶת, לְבוֹנָה, קְמִיצָה, פַּיִס (פייס), מַחְתָּה, מִזְרָק, הַכּוּז, הַבָּזָךְ, הַמַּגְרֵפָה, הַתַּפּוּחַ, פִּשְׁפָּשׁ, אֲבוּקוֹת, חֲבִתִּין, בַּרְקַאי, בֵּית הַמּוֹקֵד, לִשְׁכַּת הַגָּזִית, הַמְמֻנֶּה (הממונה), אֵבָרִים/אֵיבָרִים by the Mishnah (אברים), פְּדָרִים, יְסוֹד, עֲזָרָה (עזרה), הֵיכָל, אוּלָם, פָּרֹכֶת, קָדְשֵׁי קָדָשִׁים, כֶּבֶשׁ (the ramp: הַכֶּבֶשׁ), כֶּבֶשׂ (a lamb: also כֶּבֶשׂ), טָלֶה.
6. Hints: after the paragraphs you may get a list "HINTS" with correct vocalizations of some words, taken from the vocalized Mishnah. Use them when the word has the same meaning in the paragraph.
7. Input: several paragraphs, each as <p id="N">text</p>. Output: exactly the same <p id="N"> elements (same ids, same order) with the vocalized text inside. Return ONLY the <p> elements — no explanations, no markdown fences.`;
const RETRY_NOTE=`\n\nIMPORTANT — a previous attempt was rejected because it changed letters (dropping or adding a י or ו, or changing punctuation) or left some words without niqqud. Copy every letter exactly; only add niqqud marks, and vocalize EVERY word.`;

function make({curlJson,keys,cacheFile,fixesFile,corpusFile,models}){
 const MODELS=models||(process.env.NIQQUD_MODELS||'gemini-3.5-flash-lite,gemini-3.8-flash,gemini-2.5-flash,gemini-3.1-flash-lite').split(',');
 let cache={};try{cache=JSON.parse(fs.readFileSync(cacheFile,'utf8'))}catch(e){}
 const saveCache=()=>fs.writeFileSync(cacheFile,JSON.stringify(cache,null,1));
 let corpus={};try{corpus=JSON.parse(fs.readFileSync(corpusFile,'utf8'))}catch(e){}
 const K=keys,cool=new Map();let kix=0;
 const sysHash=crypto.createHash('sha1').update(SYSTEM).digest('hex').slice(0,6);
 const ckey=plain=>crypto.createHash('sha1').update(sysHash+'|'+plain).digest('hex').slice(0,16);
 function gen(prompt,system){
  for(const model of MODELS){for(let n=0;n<K.length;n++){const i=(kix+n)%K.length,ck=model+'|'+i;if((cool.get(ck)||0)>Date.now())continue;
   const r=curlJson('https://generativelanguage.googleapis.com/v1beta/models/'+model+':generateContent?key='+K[i],{system_instruction:{parts:[{text:String(system).split('text-to-speech').join('reader')}]},contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{temperature:0}},45);
   if(r.status===200){const t=r.json&&r.json.candidates&&r.json.candidates[0]&&r.json.candidates[0].content&&r.json.candidates[0].content.parts;const txt=t&&t.map(x=>x.text||'').join('');
    if(txt){kix=(i+1)%K.length;return{text:txt,model}}cool.set(ck,Date.now()+60e3);continue}
   if(r.status===429||r.status===402||r.status===403)cool.set(ck,Date.now()+(r.status===429?20*60e3:3600e3));
   else if(r.status===404)cool.set(ck,Date.now()+3600e3);else cool.set(ck,Date.now()+20e3);
   if(process.env.NIQQUD_DEBUG)console.log('  [gen]',model,'key#'+i,r.status,JSON.stringify(r.json&&r.json.error&&r.json.error.message||'').slice(0,100))}}
  return null}
 function hintsFor(plains){const seen=new Set(),out=[];
  for(const t of plains)for(const w0 of String(t).split(/[^א-ת]+/)){if(w0.length<3||seen.has(w0))continue;
   const h=corpus[w0];
   if(h&&h.length){seen.add(w0);out.push(w0+' = '+h.join(' | '))}}
  return out.slice(0,140)}
 // items: [{id,plain}] -> {id: nikud}   (מטמון לפי hash; בקשה אחת לקבוצה)
 function vocalize(items,log){
  const res={},todo=[];for(const it of items){const c=cache[ckey(it.plain)];if(c)res[it.id]=c.text;else todo.push(it)}
  const B=+process.env.NIQQUD_BATCH||6;
  for(let s=0;s<todo.length;s+=B){const grp=todo.slice(s,s+B);let pending=grp.slice(),attempt=0;
   while(pending.length&&attempt<3){
    const body=pending.map((c,n)=>'<p id="'+(n+1)+'">'+c.plain+'</p>').join('\n')+'\n\nHINTS:\n'+hintsFor(pending.map(c=>c.plain)).join('\n');
    const g=gen(body,SYSTEM+(attempt?RETRY_NOTE:''));if(!g){log&&log('niqqud: no model available');return{res,failed:todo.filter(t=>!res[t.id]).map(t=>t.id)}}
    const tags=new Map();for(const x of g.text.matchAll(/<p id="(\d+)">([\s\S]*?)<\/p>/g))tags.set(+x[1],x[2].trim());
    const next=[];
    pending.forEach((c,n)=>{const cand=(tags.get(n+1)||'').replace(TAAMIM,'');if(!cand){next.push(c);return}
     let text=cand,cov=1;if(norm(strip(cand))!==norm(c.plain)){const al=alignMarks(c.plain,cand);cov=al.coverage;text=al.text;if(cov<.92){next.push(c);return}}
     else text=alignMarks(c.plain,cand).text;   // רווחים/שורות כמו במקור
     const words=text.split(/\s+/).filter(w=>HEB.test(w)),bare=words.filter(w=>!/[ְ-ׇ]/.test(w));
     if(words.length&&bare.length/words.length>.12&&attempt<2){next.push(c);return}
     res[c.id]=text.normalize('NFC');cache[ckey(c.plain)]={text:res[c.id],model:g.model,cov:+cov.toFixed(3)}});
    saveCache();pending=next;attempt++}
   if(pending.length)log&&log('niqqud: failed '+pending.map(c=>c.id).join(','))}
  return{res,failed:items.filter(t=>!res[t.id]).map(t=>t.id)}}
 const fixes=()=>loadFixes(fixesFile);
 const finish=nik=>fixPrefixShva(applyFixes(String(nik).replace(/־{2,}/g,'־'),fixes()));   // הורדת מקף כפול (תקלה ישנה במטמון)
 return{vocalize,finish,hintsFor,cache:()=>cache}}
module.exports={make,fixPrefixShva,applyFixes,loadFixes,alignMarks,strip,SYSTEM};
