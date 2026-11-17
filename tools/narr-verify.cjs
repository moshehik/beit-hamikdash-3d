// אימות הגייה של קליפי ההקראה: שולח קליפ mp3 ל-Gemini (שמיעה) ומבקש תעתיק לטיני של מה שנאמר (תמלול עברי "מתקן" לכתיב מילוני ולכן חסר ערך לבדיקת הגייה).
//   node tools/narr-verify.cjs ketoret-0 tamid-shachar-11 ...
// מפתחות מ-print-center/.env (לא מודפסים); curl בלבד.
const fs=require('fs'),p=require('path'),cp=require('child_process'),os=require('os');
const ROOT=p.join(__dirname,'..'),ENV=process.env.PC_ENV||'C:/Users/moshe/Music/מדפיס בוט/print-center/.env',NL=String.fromCharCode(10);
const K=fs.readFileSync(ENV,'utf8').match(/^GEMINI_API_KEYS=(.*)$/m)[1].replace(/^["']|["']$/g,'').split(',').map(s=>s.trim()).filter(Boolean);
const MODELS=(process.env.STT_MODELS||'gemini-3.5-flash-lite,gemini-3.8-flash,gemini-2.5-flash').split(',');
function call(model,key,body){const f=p.join(os.tmpdir(),'nv-'+process.pid+'.json');fs.writeFileSync(f,JSON.stringify(body));
 const r=cp.spawnSync('curl',['-s','-m','70','-o','-','-w',NL+'%{http_code}','-H','content-type: application/json','--data-binary','@'+f,'https://generativelanguage.googleapis.com/v1beta/models/'+model+':generateContent?key='+key],{encoding:'utf8',maxBuffer:1e8,env:{...process.env,MSYS2_ARG_CONV_EXCL:'*'}});
 try{fs.unlinkSync(f)}catch(e){}const o=r.stdout||'',k=o.lastIndexOf(NL);let j=null;try{j=JSON.parse(o.slice(0,k))}catch(e){}return{status:+o.slice(k+1),json:j}}
const PROMPT=process.env.STT_PROMPT||'Listen to this Hebrew audio clip. Write EXACTLY how each word is pronounced, as a Latin transliteration with stress-free syllables (e.g. ke-to-ret, ba-ra-kai), separated by spaces, one sentence per line. Do not correct or normalise: write what you actually hear, including mispronunciations. Output only the transliteration.';
const keys=process.argv.slice(2);let kix=+process.env.KIX||0;
for(const k of keys){const f=p.join(ROOT,'audio',k+'.mp3');if(!fs.existsSync(f)){console.log(k,'missing');continue}
 const b64=fs.readFileSync(f).toString('base64');let out=null;
 outer:for(const m of MODELS)for(let n=0;n<K.length;n++){const i=(kix+n)%K.length;const r=call(m,K[i],{contents:[{role:'user',parts:[{text:PROMPT},{inlineData:{mimeType:'audio/mpeg',data:b64}}]}],generationConfig:{temperature:0}});
  const t=r.status===200&&r.json&&r.json.candidates&&r.json.candidates[0]&&r.json.candidates[0].content&&r.json.candidates[0].content.parts;
  if(t){out=t.map(x=>x.text||'').join('');kix=i;break outer}if(r.status===404)break}
 console.log('== '+k+NL+(out||'(no result)'))}
