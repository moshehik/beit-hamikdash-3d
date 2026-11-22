// הפקת הקראה בקול (Gemini TTS) לשלבי הסיורים של דגם בית המקדש.
//   node tools/narration.cjs           -> מפיק קליפים חסרים/ישנים (audio/<svc>-<idx>.mp3) ואורז ל-src/narr.js
//   node tools/narration.cjs pack      -> רק אורז את מה שקיים
//   node tools/narration.cjs list      -> מציג את הטקסטים שיוקראו (מנוקדים, אם כבר נוקדו)
//   node tools/narration.cjs niqqud    -> מנקד (Gemini טקסט, מטמון audio/niqqud-cache.json) בלי להפיק קול
//   ENV: SKIP=olat-haof,... (תסריטים לדלג עליהם) | ONLY=ketoret-3,... (רק שלבים אלה) | LIMIT=N (מקס' קליפים בהרצה) | NIQQUD=0 (בלי ניקוד)
// מקורות הקראה מחוץ ל-src/svc: tools/narr-sources/<id>.json = {id, ext?, steps:[{idx,text}]} (נוצר ע"י מחולל הסיור, למשל tools/gen-yk.cjs). ext:true = הקליפים נשמרים כקבצים נפרדים audio/ext/<key>-<hash>.mp3 ומוגשים בנפרד (a/<שם>.mp3), לא בתוך החבילה. מדריך: docs/narration-pipeline.md
// טקסט להקראה = סיפור הילדים (STORY מ-src/story.js ו-src/story_*.js) ואם אין – step.text; אחר כך ניקוד אוטומטי (tools/niqqud.cjs) + תיקוני tools/niqqud-fixes.json + fixPrefixShva.
// ה-hash של הקליפ כולל את הטקסט המנוקד, כך שתיקון במילון/בסיפור מפיק מחדש רק את הקליפים שהושפעו.
// מפתחות: GEMINI_API_KEYS מתוך print-center/.env (לא מודפסים). השיחה דרך curl (פילטר הרשת של המחשב שובר fetch של Node).
// מכסה חינמית: ~10 בקשות ליום לפרויקט*מודל; מפתח שקיבל 429 מושהה והסקריפט עובר הלאה. אפשר להריץ שוב מחר – ממשיך מאיפה שעצר.
const fs=require('fs'),p=require('path'),cp=require('child_process'),crypto=require('crypto'),os=require('os'),vm=require('vm');
const NIQ=require('./niqqud.cjs');
const ROOT=p.join(__dirname,'..'),SVC=p.join(ROOT,'src','svc'),AUD=p.join(ROOT,'audio'),MAN=p.join(AUD,'manifest.json');
const ENV=process.env.PC_ENV||'C:/Users/moshe/Music/מדפיס בוט/print-center/.env';
const VOICE=process.env.TTS_VOICE||'Achird';   // קול ידידותי וחם – מתאים לילדים (בקשת משה 16.11); קצב מואט מעט ב-ffmpeg (atempo)
const TEMPO=process.env.TTS_TEMPO||'0.93';
const MODELS=(process.env.TTS_MODELS||'gemini-3.8-flash-tts,gemini-3.8-flash-lite-tts,gemini-3.1-flash-tts-preview,gemini-2.5-flash-preview-tts').split(',');
const BS=String.fromCharCode(92),NL=String.fromCharCode(10);
const SKIP=(process.env.SKIP||'').split(',').filter(Boolean),ONLY=(process.env.ONLY||'').split(',').filter(Boolean);
fs.mkdirSync(AUD,{recursive:true});

// סיפורי ילדים: מריצים את src/story.js ואת src/story_*.js (לפי סדר) בהקשר vm משותף ומוציאים את STORY; קובץ שנכשל – מדלגים עליו עם אזהרה
function loadStory(){const ctx=vm.createContext({});const files=['story.js'].concat(fs.readdirSync(p.join(ROOT,'src')).filter(f=>/^story_.*[.]js$/.test(f)).sort());
 for(const f of files){const fp=p.join(ROOT,'src',f);if(!fs.existsSync(fp))continue;try{vm.runInContext(fs.readFileSync(fp,'utf8'),ctx,{filename:f})}catch(e){console.log('warn: '+f+' – '+e.message)}}
 try{return vm.runInContext('typeof STORY==="object"?STORY:{}',ctx)||{}}catch(e){return{}}}
const SRCDIR=p.join(__dirname,'narr-sources');
function sources(){return fs.existsSync(SRCDIR)?fs.readdirSync(SRCDIR).filter(f=>/[.]json$/.test(f)).sort().map(f=>JSON.parse(fs.readFileSync(p.join(SRCDIR,f),'utf8'))):[]}
function steps(){const out=[],STORY=loadStory(),SRC=sources(),srcIds=SRC.map(x=>x.id);
 for(const f of fs.readdirSync(SVC).filter(f=>f.endsWith('.js')).sort()){
  const s=fs.readFileSync(p.join(SVC,f),'utf8'),id=(s.match(/SERVICES[.]push[(][{]\s*id:'([^']+)'/)||[])[1];if(!id||srcIds.includes(id))continue;
  const re=/[{,]\s*text:\s*(['"`])/g;let m,idx=0;
  while((m=re.exec(s))){const q=m[1];let i=re.lastIndex,str='';
   while(i<s.length&&s[i]!==q){if(s[i]===BS){const c=s[i+1];str+=c==='n'?NL:c;i+=2}else str+=s[i++]}
   const key=id+'-'+idx,kid=STORY[key];out.push({id,idx:idx++,key,kid:!!kid,text:prep(kid||str)})}}
 for(const so of SRC)for(const st of so.steps){const key=so.id+'-'+st.idx;out.push({id:so.id,idx:st.idx,key,kid:false,ext:!!so.ext,text:prep(st.text),quote:st.quote?String(st.quote).normalize('NFC').replace(/\s+/g,' ').trim():''})}
 return out.filter(s=>!SKIP.includes(s.id)&&(!ONLY.length||ONLY.includes(s.key)))}
// טקסט להקראה: בלי הערות על "הדגם/הסרט" (מיועדות לקריאה בלבד), קיצורים מורחבים
function prep(t){return t.replace(/\s*[(][^)]*(בדגם|כמו בסרט|מקורב|בסרט)[^)]*[)]/g,'').replace(/ר'\s/g,'ראו ').replace(/\s+/g,' ').replace(/\s+([.,:;])/g,'$1').trim()}
const hash=t=>crypto.createHash('sha1').update(VOICE+'|'+TEMPO+'|'+t).digest('hex').slice(0,10);
const EXT=p.join(AUD,'ext');
const fileOf=(s,h)=>s.ext?p.join(EXT,s.key+'-'+h+'.mp3'):p.join(AUD,s.key+'.mp3');

function keys(){const e=fs.readFileSync(ENV,'utf8').match(/^GEMINI_API_KEYS=(.*)$/m);if(!e)throw new Error('no keys');return e[1].replace(/^["']|["']$/g,'').split(',').map(s=>s.trim()).filter(Boolean)}
function curlJson(url,body,tmo){const f=p.join(os.tmpdir(),'nar-'+process.pid+'.json');fs.writeFileSync(f,JSON.stringify(body));
 const r=cp.spawnSync('curl',['-s','-m',String(tmo||90),'-o','-','-w',NL+'%{http_code}','-H','content-type: application/json','--data-binary','@'+f,url],{encoding:'utf8',maxBuffer:64*1024*1024,env:{...process.env,MSYS2_ARG_CONV_EXCL:'*'}});
 try{fs.unlinkSync(f)}catch(e){}
 const o=r.stdout||'',k=o.lastIndexOf(NL),status=+o.slice(k+1);let json=null;try{json=JSON.parse(o.slice(0,k))}catch(e){}return{status,json}}
const cool=new Map();let kix=0;
function synth(text,K){
 for(const model of MODELS){
  for(let n=0;n<K.length;n++){const i=(kix+n)%K.length,ck=model+'|'+i;if((cool.get(ck)||0)>Date.now())continue;
   const url='https://generativelanguage.googleapis.com/v1beta/models/'+model+':generateContent?key='+K[i];
   const body={contents:[{role:'user',parts:[{text}]}],generationConfig:{responseModalities:['AUDIO'],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:VOICE}}}}};
   const r=curlJson(url,body);
   if(r.status===200){const d=r.json&&r.json.candidates&&r.json.candidates[0]&&r.json.candidates[0].content&&r.json.candidates[0].content.parts&&r.json.candidates[0].content.parts.find(x=>x.inlineData);
    if(d){kix=(i+1)%K.length;return{pcm:Buffer.from(d.inlineData.data,'base64'),model,key:i}}cool.set(ck,Date.now()+60e3);continue}
   if(r.status===429||r.status===402||r.status===403||r.status===404||r.status===400){cool.set(ck,Date.now()+(r.status===429?6*3600e3:3600e3));continue}
   cool.set(ck,Date.now()+30e3)}}
 return null}
// כניסה/יציאה רכות + שתיקה קצרה בסוף: בלי פיצוץ (click) במעבר בין הקראות (נמצא ב-16.11: הקליפים נחתכו בעוצמה מלאה)
const FADES='afade=t=in:d=0.03,areverse,afade=t=in:d=0.28,areverse,apad=pad_dur=0.35';
function toMp3(pcm,out){const raw=out+'.pcm';fs.writeFileSync(raw,pcm);
 const r=cp.spawnSync('ffmpeg',['-y','-hide_banner','-loglevel','error','-f','s16le','-ar','24000','-ac','1','-i',raw,'-af','atempo='+TEMPO+',silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,loudnorm=I=-18:TP=-2,'+FADES+'','-ar','24000','-ac','1','-c:a','libmp3lame','-b:a','24k',out],{encoding:'utf8'});
 fs.unlinkSync(raw);if(r.status!==0)throw new Error('ffmpeg '+r.stderr)}
function fixFades(){const man=JSON.parse(fs.readFileSync(MAN,'utf8'));let n=0;
 for(const k of Object.keys(man)){const f=p.join(AUD,k+'.mp3'),t=f+'.tmp.mp3';if(!fs.existsSync(f)||man[k].faded)continue;
  const r=cp.spawnSync('ffmpeg',['-y','-hide_banner','-loglevel','error','-i',f,'-af',FADES,'-ar','24000','-ac','1','-c:a','libmp3lame','-b:a','24k',t],{encoding:'utf8'});
  if(r.status!==0)throw new Error(r.stderr);fs.renameSync(t,f);man[k].dur=dur(f);man[k].faded=1;n++}
 fs.writeFileSync(MAN,JSON.stringify(man,null,1));console.log('faded',n);pack()}
function dur(f){const r=cp.spawnSync('ffprobe',['-v','error','-show_entries','format=duration','-of','csv=p=0',f],{encoding:'utf8'});return +(r.stdout||0)}

function pack(){const man=JSON.parse(fs.existsSync(MAN)?fs.readFileSync(MAN,'utf8'):'{}');let js='/* נוצר אוטומטית ע"י tools/narration.cjs – הקראה בקול Gemini ('+VOICE+') לשלבי הסיורים; אל תערוך ידנית */'+NL+'const NARR={';let n=0,sz=0;
 let ne=0,se=0;for(const k of Object.keys(man).sort()){if(man[k].ext){const ef=p.join(EXT,man[k].file||'');if(!man[k].file||!fs.existsSync(ef))continue;ne++;se+=fs.statSync(ef).size;js+=JSON.stringify(k)+':['+JSON.stringify('a/'+man[k].file)+','+(+man[k].dur.toFixed(2))+'],';continue}const f=p.join(AUD,k+'.mp3');if(!fs.existsSync(f))continue;const b=fs.readFileSync(f);sz+=b.length;n++;js+=JSON.stringify(k)+':['+JSON.stringify('data:audio/mpeg;base64,'+b.toString('base64'))+','+(+man[k].dur.toFixed(2))+'],'}
 js+='};'+NL;fs.writeFileSync(p.join(ROOT,'src','narr.js'),js);console.log('packed',n,'embedded clips',(sz/1024|0)+'KB;',ne,'external clips',(se/1024|0)+'KB')}

// ניקוד: מטמון audio/niqqud-cache.json (לפי hash של הטקסט הפשוט) – מודל טקסט נקרא רק לטקסטים חדשים/ששונו
function vocalizeAll(all,K){
 if(process.env.NIQQUD==='0'){all.forEach(s=>{s.tts=NIQ.fixPrefixShva(s.text)});addQuotes(all);return}
 const nq=NIQ.make({curlJson,keys:K,cacheFile:p.join(AUD,'niqqud-cache.json'),fixesFile:p.join(__dirname,'niqqud-fixes.json'),corpusFile:p.join(__dirname,'niqqud-corpus.json')});
 const r=nq.vocalize(all.map(s=>({id:s.key,plain:s.text})),m=>console.log(m));
 for(const s of all){const n=r.res[s.key];s.tts=n?nq.finish(n):null}addQuotes(all)}
function addQuotes(all){for(const s of all)if(s.tts&&s.quote)s.tts+=' '+NIQ.fixPrefixShva(s.quote)}
const cmd=process.argv[2];
if(cmd==='fixfades'){fixFades();process.exit(0)}
if(cmd==='pack'){pack();process.exit(0)}
const man=fs.existsSync(MAN)?JSON.parse(fs.readFileSync(MAN,'utf8')):{};
const K=cmd==='list'?[]:keys(),all=steps();vocalizeAll(all,K);
if(cmd==='list'||cmd==='niqqud'){all.forEach(s=>console.log(s.key,s.kid?'kid':'orig',s.text.length,s.tts?'':'(לא מנוקד)'+NL+'  ',(s.tts||s.text)));process.exit(0)}
const bad=all.filter(s=>!s.tts);if(bad.length)console.log('niqqud failed (skipped):',bad.map(s=>s.key).join(','));
const ready=all.filter(s=>s.tts);
const todo=ready.filter(s=>!man[s.key]||man[s.key].hash!==hash(s.tts)||!fs.existsSync(fileOf(s,hash(s.tts))));
console.log('steps',all.length,'to do',todo.length,'keys',K.length);
const lim=+process.env.LIMIT||1e9;let done=0;
for(const s of todo){if(done>=lim)break;const r=synth(s.tts,K);
 if(!r){console.log('quota exhausted at',s.key);break}
 const h=hash(s.tts),f=fileOf(s,h);fs.mkdirSync(p.dirname(f),{recursive:true});toMp3(r.pcm,f);if(s.ext&&man[s.key]&&man[s.key].file&&man[s.key].file!==p.basename(f))try{fs.unlinkSync(p.join(EXT,man[s.key].file))}catch(e){}man[s.key]={hash:h,dur:dur(f),model:r.model,faded:1,kid:s.kid?1:0};if(s.ext){man[s.key].ext=1;man[s.key].file=p.basename(f)}fs.writeFileSync(MAN,JSON.stringify(man,null,1));done++;
 console.log('ok',s.key,man[s.key].dur.toFixed(1)+'s',r.model,'key#'+r.key)}
pack();console.log('remaining',ready.filter(s=>!man[s.key]||man[s.key].hash!==hash(s.tts)).length+bad.length);
