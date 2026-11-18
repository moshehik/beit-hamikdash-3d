/* ================= שיחה עם הדמויות =================
 לחיצה על דמות (כהן, כהן גדול, לוי, ישראלי, סנהדרין, שוער...) – בדגם החופשי וגם בנגן סדרי העבודה – עוצרת אותה (ובנגן: משהה את הסדר),
 ופותחת חלון שיחה: שואלים בהקלטה (MediaRecorder, עד 30 שניות) או בהקלדה. השאלה נשלחת לשרת הביניים של האתר (TEMPLE_CHAT_URL, print-center) שמחזיק את
 מפתחות Gemini בצד שרת, והדמות עונה בגוף ראשון על סמך המקורות בלבד (הנחיית המערכת ב-src/personas.js). הקראה: אם השרת מחזיר אודיו – מנגנים אותו, אחרת speechSynthesis he-IL.
 *** אין בקוד ובדפדפן שום מפתח, ואין קריאה ישירה לגוגל. ***
 חוזה השרת: POST JSON {system(<=8000), prompt?(<=1500), audio?:{mimeType,base64}(<=2MB), history?:[{role:'user'|'model',text}](<=6), tts?:boolean}
   -> {ok:true,text,audio?:{mimeType,base64}} או {ok:false,code,message(עברית – מוצג כמו שהוא)}.
 האודיו/הטקסט יוצאים מהדפדפן רק בלחיצה על "שלח" (ובפעם הראשונה – אחרי אישור מפורש).
 רישום דמויות: src/npcs.js (NPCS.register). דמויות נגן הסדרים (SV.S.actors) נרשמות כאן בעצמנו (syncSV) בלי לגעת ב-services.js.
 חיצוני: NPC_CHAT.open(npc) / close() / get isOpen. */
const TEMPLE_CHAT_URL='https://print-center.vercel.app/api/temple/ask';   // דריסה לפיתוח בלבד: localStorage 'bh_chat_endpoint'
const NPC_CHAT=(()=>{
 const el=id=>document.getElementById(id);
 const W=el('ncw');if(!W)return{open(){},close(){},get isOpen(){return false}};
 const LS={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:v}catch(e){return d}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}},del(k){try{localStorage.removeItem(k)}catch(e){}}};
 const ACK_LS='bh_chat_ack',TTS_LS='bh_chat_tts';
 const endpoint=()=>{const v=String(LS.get('bh_chat_endpoint','')||'').trim();return /^https?:\/\//.test(v)?v:TEMPLE_CHAT_URL};
 const MAX_REC=30,MAX_AUDIO=2*1024*1024;                                 // שניות הקלטה, בתים לאודיו
 let cur=null,svS=null;const hists=new Map();                             // cur = השיחה הפתוחה; hists = היסטוריית שיחה לכל דמות
 el('ncTts').checked=LS.get(TTS_LS,'1')!=='0';el('ncTts').onchange=e=>{LS.set(TTS_LS,e.target.checked?'1':'0');if(!e.target.checked)stopSpeak()};

 /* ---------- רשת ---------- */
 function fetchT(url,opt,ms){const ac=new AbortController(),t=setTimeout(()=>ac.abort(),ms||45000);return fetch(url,Object.assign({signal:ac.signal},opt)).finally(()=>clearTimeout(t))}
 const E=(kind,status,msg)=>Object.assign(new Error(kind),{kind,status,msg});
 const netErr=e=>e&&e.name==='AbortError'?E('timeout'):E('down');
 function errText(e){if(e&&e.msg)return String(e.msg);switch(e&&e.kind){
  case'rate_limited':return'נשאלו הרבה שאלות בזמן קצר. נסו שוב בעוד דקה.';
  case'busy':return'השרת עסוק כרגע. נסו שוב בעוד רגע.';
  case'down':case'empty':return'השרת לא זמין כרגע. נסו שוב מאוחר יותר (הדגם עצמו ממשיך לעבוד).';
  case'timeout':return'השרת לא ענה בזמן. נסו שוב.';
  case'big':return'ההקלטה גדולה מדי. הקליטו שאלה קצרה יותר (עד 30 שניות) או הקלידו אותה.';
  case'mic-denied':return'אין הרשאה למיקרופון. אפשרו אותו בהגדרות הדפדפן (סמל המנעול ליד הכתובת), או הקלידו את השאלה.';
  case'mic-none':return'לא נמצא מיקרופון במכשיר. אפשר להקליד את השאלה.';
  case'mic-unsupported':return'הדפדפן הזה אינו תומך בהקלטה (או שהדף אינו מאובטח). אפשר להקליד את השאלה.';
  default:return'משהו השתבש בשליחה. נסו שוב.'}}

 /* ---------- הקשר לשאלה ---------- */
 const HELD={knife:'סכין',mizrak:'מזרק',tray:'מגש',bowl:'קערה',jar:'כד',kaf:'כף',bazach:'בזך',machta:'מחתה',kuz:'כוז',tani:'תני',rake:'מגרפה',tzenor:'צנור',flask:'צלוחית',loaf:'לחם',logs:'עצים',torch:'אבוקה',coals:'גחלים',meat:'נתחי בשר',basket:'סל',key:'מפתח',trumpet:'חצוצרה',broom:'מכבדת',cloth:'מטלית'};
 function hourTxt(){let h=NaN;try{if(typeof LIFE!=='undefined'&&LIFE.hour!=null)h=+LIFE.hour}catch(e){}if(isNaN(h)){const t=el('tm');h=t?+t.value:NaN}if(isNaN(h))return'';const hh=Math.floor(h),mm=Math.floor((h-hh)*60);return hh+':'+(mm<10?'0':'')+mm}
 function dayTxt(){const d=el('dayType');try{return d&&d.options[d.selectedIndex]?d.options[d.selectedIndex].textContent:''}catch(e){return''}}
 const safe=(f,d)=>{try{const v=f();return v==null?d:v}catch(e){return d}};
 function ctxText(npc){const k=PERSONAS.kind(npc),inf=PERSONAS.info(k),L=[];
  L.push('סוג הדמות: '+inf.title+(npc.who?' – '+npc.who:'')+'.');
  const job=safe(()=>npc.job&&npc.job(),'');L.push('מה הדמות עושה עכשיו (לפי הדגם): '+(job||'לא צוין – אינך יודע מה בדיוק תפקידך כרגע.'));
  const h=hourTxt(),d=dayTxt();if(h)L.push('השעה בדגם: '+h+' (לפי סליידר השעה בדגם; אינה שעת השיחה האמיתית).');if(d)L.push('סוג היום בדגם: '+d+'.');
  const ex=safe(()=>npc.extra,null);if(ex){let s='';try{s=typeof ex==='string'?ex:JSON.stringify(ex)}catch(e){}if(s&&s!=='{}')L.push('פרטים נוספים על הדמות: '+s.slice(0,400))}
  return L.join('\n')}
 const kindNote=npc=>{const kd=PERSONAS.kind(npc),t=((npc.who||'')+' '+safe(()=>npc.job&&npc.job(),'')+' '+safe(()=>JSON.stringify(npc.extra||{}),'')).slice(0,1500);
  if(kd==='kohen-gadol'&&(npc.kind==='y'||/כיפור/.test(t)))return'הערה: בדגם כרגע זה הכהן הגדול ביום הכיפורים (בבגדי לבן).';
  return''};


 /* ---------- בניית הבקשה והשרת ---------- */
 function buildBody(npc,hist,audio,text,tts){
  let ctx=ctxText(npc),sys=PERSONAS.system(npc,ctx,{note:kindNote(npc)});
  if(sys.length>8000){const cut=sys.length-8000+20;ctx=ctx.slice(0,Math.max(200,ctx.length-cut));sys=PERSONAS.system(npc,ctx,{note:kindNote(npc)}).slice(0,8000)}
  const b={system:sys,tts:!!tts};
  if(hist&&hist.length)b.history=hist.slice(-6).map(h=>({role:h.role,text:String(h.text).slice(0,600)}));
  b.prompt=(audio?'השאלה הוקלטה בקול (האודיו מצורף).'+(text?' הערה מוקלדת: '+text:''):'השאלה: '+text).slice(0,1500);
  if(audio)b.audio={mimeType:audio.mime,base64:audio.b64};
  return b}
 /* הפורמט: אם הקלטה – שורה ראשונה "שמעתי: ..." ואחריה התשובה */
 function parseReply(j){
  const t=String(j&&j.text||'').trim();if(!t)throw E('empty');
  const m=/^\s*שמעתי\s*[:：]\s*([^\n]*)\n+([\s\S]*)$/.exec(t);let heard='',answer=t;
  if(m&&m[2].trim()){heard=m[1].trim().replace(/^["״“]+|["״”]+$/g,'');answer=m[2].trim();if(/^\(?\s*לא ברור/.test(heard))heard=''}
  return{heard,answer,audio:j.audio&&j.audio.base64?j.audio:null}}
 async function askServer(npc,hist,audio,text,tts){
  const body=buildBody(npc,hist,audio,text,tts);let res;
  try{res=await fetchT(endpoint(),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),credentials:'omit'},tts?60000:45000)}catch(e){throw netErr(e)}
  let j=null;try{j=await res.json()}catch(e){}
  if(!j||typeof j!=='object')throw E('down',res.status);
  if(j.ok===false)throw Object.assign(E(String(j.code||'server'),res.status),{msg:j.message});
  if(j.ok!==true)throw E(res.ok?'empty':'down',res.status);
  return parseReply(j)}


 /* ---------- הקלטה ---------- */
 let rs='idle',mr=null,stream=null,chunks=[],recT0=0,recTick=null,recBlob=null,recUrl=null,downNow=false,downAtStart=false,ignoreUp=false;
 const fmt=s=>Math.floor(s/60)+':'+('0'+Math.floor(s%60)).slice(-2);
 function pickMime(){if(!window.MediaRecorder)return null;for(const m of['audio/webm;codecs=opus','audio/webm','audio/mp4','audio/ogg;codecs=opus']){try{if(MediaRecorder.isTypeSupported(m))return m}catch(e){}}return''}
 function recBar(){const bar=el('ncRecBar'),rec=rs==='rec';bar.style.display=(rec||recBlob)?'flex':'none';bar.querySelector('.rdot').style.display=rec?'inline-block':'none';el('ncPrev').style.display=rec?'none':'block';el('ncMic').classList.toggle('rec',rec);el('ncMic').textContent=rec?'⏹':'🎤'}
 function clearRec(){if(recUrl){try{URL.revokeObjectURL(recUrl)}catch(e){}}recUrl=null;recBlob=null;try{el('ncPrev').removeAttribute('src');el('ncPrev').load()}catch(e){}recBar()}
 function killStream(){if(stream){try{stream.getTracks().forEach(t=>t.stop())}catch(e){}}stream=null}
 async function startRec(){
  if(rs!=='idle'||(cur&&cur.busy))return;
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia||!window.MediaRecorder){note(errText(E('mic-unsupported')),1);return}
  stopSpeak();clearRec();rs='starting';
  try{stream=await navigator.mediaDevices.getUserMedia({audio:true})}catch(e){rs='idle';recBar();note(errText(E(e&&(e.name==='NotFoundError'||e.name==='OverconstrainedError')?'mic-none':e&&e.name==='NotAllowedError'||e&&e.name==='SecurityError'?'mic-denied':'mic-unsupported')),1);return}
  if(!cur||W.style.display==='none'){killStream();rs='idle';return}
  const mime=pickMime();try{mr=new MediaRecorder(stream,mime?{mimeType:mime}:undefined)}catch(e){killStream();rs='idle';note(errText(E('mic-unsupported')),1);return}
  chunks=[];mr.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};
  mr.onstop=()=>{const dur=(performance.now()-recT0)/1000,type=(mr&&mr.mimeType)||mime||'audio/webm';killStream();clearInterval(recTick);rs='idle';
   if(dur<.7||!chunks.length){chunks=[];recBar();note('ההקלטה קצרה מדי – נסו שוב (לחיצה להתחלה ולחיצה לעצירה).');return}
   recBlob=new Blob(chunks,{type});recBlob._dur=dur;recUrl=URL.createObjectURL(recBlob);el('ncPrev').src=recUrl;recBar();el('ncTime').textContent=fmt(dur)};
  mr.start();recT0=performance.now();rs='rec';downAtStart=downNow;recBar();el('ncTime').textContent='0:00';
  recTick=setInterval(()=>{const s=(performance.now()-recT0)/1000;el('ncTime').textContent=fmt(s);if(s>=MAX_REC)stopRec()},250)}
 function stopRec(){if(rs==='rec'&&mr){try{mr.stop()}catch(e){killStream();rs='idle';recBar()}}}
 const mic=el('ncMic');
 mic.addEventListener('pointerdown',e=>{if(e.button>0)return;downNow=true;if(rs==='rec'){ignoreUp=true;stopRec();return}ignoreUp=false;startRec();e.preventDefault()});
 const up=()=>{const was=downNow;downNow=false;if(ignoreUp){ignoreUp=false;return}if(was&&rs==='rec'&&downAtStart&&performance.now()-recT0>600)stopRec()};   // החזקה ושחרור = עצירה; לחיצה קצרה = ממשיך עד לחיצה נוספת
 mic.addEventListener('pointerup',up);mic.addEventListener('pointercancel',up);
 mic.addEventListener('click',e=>{if(e.detail===0){rs==='rec'?stopRec():startRec()}});   // מקלדת (Enter/רווח)
 el('ncDelRec').onclick=()=>{if(rs==='rec'){mr&&(mr.onstop=()=>{killStream();clearInterval(recTick);rs='idle';chunks=[];recBar()});stopRec()}clearRec()};
 const b64=b=>new Promise((ok,no)=>{const fr=new FileReader();fr.onload=()=>ok(String(fr.result).split(',')[1]);fr.onerror=()=>no(fr.error);fr.readAsDataURL(b)});
 function wavBlob(buf,rate){const n=buf.byteLength,h=new DataView(new ArrayBuffer(44)),w=(o,s)=>{for(let i=0;i<s.length;i++)h.setUint8(o+i,s.charCodeAt(i))};
  w(0,'RIFF');h.setUint32(4,36+n,true);w(8,'WAVEfmt ');h.setUint32(16,16,true);h.setUint16(20,1,true);h.setUint16(22,1,true);h.setUint32(24,rate,true);h.setUint32(28,rate*2,true);h.setUint16(32,2,true);h.setUint16(34,16,true);w(36,'data');h.setUint32(40,n,true);
  return new Blob([h.buffer,buf],{type:'audio/wav'})}
 async function toWav(b){const AC=window.AudioContext||window.webkitAudioContext,ab=await b.arrayBuffer(),ctx=new AC();
  const buf=await new Promise((ok,no)=>{const p=ctx.decodeAudioData(ab,ok,no);if(p&&p.catch)p.catch(no)});try{ctx.close()}catch(e){}
  const sr=16000,oc=new OfflineAudioContext(1,Math.max(1,Math.ceil(buf.duration*sr)),sr),s=oc.createBufferSource();s.buffer=buf;s.connect(oc.destination);s.start();
  const pcm=(await oc.startRendering()).getChannelData(0),u=new Int16Array(pcm.length);for(let i=0;i<pcm.length;i++)u[i]=Math.max(-1,Math.min(1,pcm[i]))*32767;return wavBlob(u.buffer,sr)}


 /* ---------- הקראה ---------- */
 let curAudio=null,curUrl=null;
 function stopSpeak(){if(curAudio){try{curAudio.pause()}catch(e){}curAudio=null}if(curUrl){try{URL.revokeObjectURL(curUrl)}catch(e){}curUrl=null}try{window.speechSynthesis&&speechSynthesis.cancel()}catch(e){}}
 function audioBlob(a){const bin=atob(a.base64),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
  const mt=String(a.mimeType||''),rm=/rate=(\d+)/.exec(mt);if(/L16|pcm/i.test(mt))return wavBlob(u.buffer,rm?+rm[1]:24000);return new Blob([u],{type:mt||'audio/mpeg'})}
 function browserSpeak(text){const ss=window.speechSynthesis;if(!ss||!window.SpeechSynthesisUtterance)return false;
  const vs=ss.getVoices?ss.getVoices():[],hv=vs.find(v=>/^he/i.test(v.lang));if(vs.length&&!hv)return false;
  const u=new SpeechSynthesisUtterance(text);u.lang='he-IL';if(hv)u.voice=hv;u.rate=.95;ss.cancel();ss.speak(u);return true}
 async function speak(answer,audio){stopSpeak();const my=cur;
  if(audio&&audio.base64){try{const url=URL.createObjectURL(audioBlob(audio)),a=new Audio(url);curAudio=a;curUrl=url;a.onended=()=>{if(curAudio===a)stopSpeak()};await a.play();return}catch(e){if(cur!==my)return;stopSpeak()}}
  if(cur===my&&!browserSpeak(answer))note('ההקראה בקול לא זמינה כרגע (אין קול עברי בדפדפן). התשובה מוצגת בכתב.')}


 /* ---------- ממשק ---------- */
 const log=el('ncLog');
 function addMsg(cls,text,small){const d=document.createElement('div');d.className='ncm '+cls;d.textContent=text;if(small){const s=document.createElement('small');s.textContent=small;d.appendChild(s)}log.appendChild(d);log.scrollTop=log.scrollHeight;return d}
 function note(t,err){const d=addMsg(err?'err':'sys',t);return d}
 function typing(){const d=document.createElement('div');d.className='ncm npc typ';d.innerHTML='<i></i><i></i><i></i>';log.appendChild(d);log.scrollTop=log.scrollHeight;return d}
 function setBusy(b){if(cur)cur.busy=b;el('ncSend').disabled=b;el('ncSend').textContent=b?'שולח…':'שלח'}
 const hasAck=()=>LS.get(ACK_LS,'')==='1';
 let ackCb=null;
 el('ncAckOk').onclick=()=>{LS.set(ACK_LS,'1');el('ncAck').style.display='none';const f=ackCb;ackCb=null;f&&f()};
 el('ncAckNo').onclick=()=>{el('ncAck').style.display='none';ackCb=null};
 async function send(){
  if(!cur||cur.busy)return;
  const txt=el('ncTxt').value.trim();if(rs==='rec')stopRec();
  if(rs==='starting'){return}
  if(!recBlob&&!txt){note('הקליטו שאלה (🎤) או הקלידו אותה.');return}
  if(!hasAck()){el('ncAck').style.display='block';ackCb=send;return}
  const npc=cur.npc,my=cur,blob=recBlob,wantTts=el('ncTts').checked;
  el('ncAck').style.display='none';stopSpeak();
  const meEl=addMsg('me',blob?'🎤 שאלה מוקלטת'+(blob._dur?' ('+fmt(blob._dur)+')':'')+(txt?'\n'+txt:''):txt);
  el('ncTxt').value='';const sendBlob=blob;clearRec();setBusy(true);const tp=typing();
  let r=null,err=null;const hist=histOf(npc);
  try{
   let audio=null;
   if(sendBlob){if(sendBlob.size>MAX_AUDIO)throw E('big');audio={mime:(sendBlob.type||'audio/webm').split(';')[0],b64:await b64(sendBlob)}}
   try{r=await askServer(npc,hist,audio,txt,wantTts)}
   catch(e){if(/audio|mime|format/i.test(e.kind)&&sendBlob&&!/wav/.test(audio.mime)){const w=await toWav(sendBlob);if(w.size>MAX_AUDIO)throw E('big');r=await askServer(npc,hist,{mime:'audio/wav',b64:await b64(w)},txt,wantTts)}else throw e}
  }catch(e){err=e&&e.kind?e:E('other')}
  tp.remove();if(cur!==my){return}setBusy(false);
  if(err){note(errText(err),1);if(txt)el('ncTxt').value=txt;if(sendBlob&&err.kind!=='big'&&!/audio|mime|format/i.test(err.kind)){/* נשאיר אפשרות לנסות שוב */ recBlob=sendBlob;recUrl=URL.createObjectURL(sendBlob);el('ncPrev').src=recUrl;recBar();el('ncTime').textContent=fmt(sendBlob._dur||0)}return}
  if(r.heard&&sendBlob){meEl.textContent='🎤 ״'+r.heard+'״'+(txt?'\n'+txt:'')}
  const q=r.heard||txt||'(שאלה בהקלטה)';hist.push({role:'user',text:q},{role:'model',text:r.answer});while(hist.length>12)hist.splice(0,2);
  const bub=addMsg('npc',r.answer);const b=document.createElement('button');b.className='sp';b.title='השמע שוב';b.textContent='🔊';b.onclick=()=>speak(r.answer,r.audio);bub.insertBefore(b,bub.firstChild);
  if(wantTts)speak(r.answer,r.audio)}
 const histOf=n=>{let h=hists.get(n.id);if(!h)hists.set(n.id,h=[]);return h};
 el('ncSend').onclick=send;
 el('ncTxt').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.isComposing){e.preventDefault();send()}});
 ['keydown','keyup'].forEach(ev=>W.addEventListener(ev,e=>e.stopPropagation()));   // הקלדה/WASD בחלון לא מזיזים את המטייל ולא מפעילים קיצורי דף (H, Esc – ר' למטה)
 window.addEventListener('keydown',e=>{if(cur&&e.code==='Escape'){e.stopPropagation();close()}},true);
 el('ncX').onclick=()=>close();el('ncGo').onclick=()=>close();

 /* ---------- פתיחה וסגירה (עצירת הדמות והנגן) ---------- */
 const svPP=()=>el('svPP');
 /* דמות בחלון: איקון חימר (kohanim) מ-UI_ICONS דרך blob אם קיים, אחרת אימוג'י */
 const AVK={kohen:'kohanim','kohen-gadol':'kohanim'};
 function setAv(emo,kd){const a=el('ncAv');a.textContent=emo;const k=AVK[kd];if(k&&typeof UI_ICONS!='undefined'&&UI_ICONS[k]){try{const s=atob(UI_ICONS[k]),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);const im=new Image();im.alt='';im.onload=()=>{a.textContent='';a.appendChild(im)};im.src=URL.createObjectURL(new Blob([u],{type:'image/png'}))}catch(e){}}}
 function open(npc){
  if(!npc)return;
  const S=safe(()=>SV.S,null),carry=!!(cur&&cur.resume&&cur.S===S);
  if(cur)release(false);
  const c={npc,S,resume:carry,busy:false};cur=c;
  if(S&&S.playing){S.playing=false;c.resume=true;try{AUD.pause()}catch(e){}const b=svPP();if(b)b.textContent='▶'}
  else if(!S){try{AUD.stop()}catch(e){}}
  try{if(typeof keys!=='undefined')for(const k in keys)keys[k]=0}catch(e){}
  try{npc.freeze&&npc.freeze(true)}catch(e){}
  try{npc.face&&npc.face(camera.position.clone())}catch(e){}
  const kd=PERSONAS.kind(npc),inf=PERSONAS.info(kd);
  setAv(inf.emoji,kd);{const nf=PERSONAS.nameFor?PERSONAS.nameFor(npc):null;el('ncName').textContent=nf?nf.name+' – '+inf.title:(npc.who||inf.title)}
  const jb=safe(()=>npc.brief?npc.brief():npc.job&&npc.job(),'');el('ncJob').textContent=jb?'עכשיו: '+String(jb).slice(0,240):'';
  log.textContent='';stopSpeak();clearRec();el('ncTxt').value='';el('ncAck').style.display='none';setBusy(false);
  note('🎤 שאלו אותי!');
  {const q=document.createElement('div');q.className='ncqs';['מה אתה עושה עכשיו?','מה התפקיד שלך?','ספר על היום שלך'].forEach(s=>{const b=document.createElement('button');b.textContent=s;b.onclick=()=>{el('ncTxt').value=s;send()};q.appendChild(b)});log.appendChild(q)}
  W.style.display='flex';const h=el('ncHint');if(h)h.classList.remove('on');
  setTimeout(()=>{try{el('ncTxt').focus({preventScroll:true})}catch(e){}},60)}
 function release(resume){
  const c=cur;if(!c)return;cur=null;
  if(rs==='rec'){try{mr&&(mr.onstop=null);mr&&mr.stop()}catch(e){}clearInterval(recTick);rs='idle'}killStream();rs='idle';clearRec();stopSpeak();ackCb=null;
  try{c.npc.freeze&&c.npc.freeze(false)}catch(e){}
  if(resume&&c.resume){const S=safe(()=>SV.S,null);if(S&&S===c.S){S.playing=true;const b=svPP();if(b)b.textContent='⏸';try{AUD.resume()}catch(e){}}}}
 function close(){if(!cur)return;release(true);W.style.display='none';el('ncAck').style.display='none'}
 const isOpen=()=>!!cur;

 /* ---------- דמויות נגן סדרי העבודה (SV.S.actors) ---------- */
 function svNpcs(S){
  const sc=S.sc,out=[];
  Object.keys(S.actors).forEach(id=>{const A=S.actors[id],sp=A.spec||{},kd=sp.kind||'k';
   let kind='kohen',who='כהן בסדר העבודה',role=null;
   if(kd==='g'){kind='kohen-gadol';who='כהן גדול (שמונה בגדים)'}
   else if(kd==='y'){kind='kohen-gadol';who='כהן גדול ביום הכיפורים (בגדי לבן)'}
   else if(kd==='o'){kind='yisrael';
    if(/^lv/.test(id)){kind='levi';who='לוי – פותח את שערי העזרה'}
    else if(/^mm/.test(id)){who='איש מעמד או אחד ממביאי הקרבנות';role='איש מעמד / מביא קרבן'}
    else{who='בעל הקרבן – ישראל המביא את הקרבן';role='בעל קרבן'}}
   else if(id==='m'){who='הממונה (כהן ממונה על העבודה)'}
   const stp=()=>sc.steps[S.idx]||{};
   const heldTxt=()=>['R','L'].map(h=>A.held&&A.held[h]&&HELD[A.held[h].kind]).filter(Boolean).join(', ');
   out.push({id:'sv:'+id,kind,who,sv:true,extra:role?{role}:null,
    getPos:()=>new THREE.Vector3(A.x,A.y,A.z),pick:{obj:A.root},
    brief:()=>sc.name+' – שלב '+(S.idx+1)+': '+(stp().text||''),
    job:()=>{const st=stp(),h=heldTxt();return 'הדמות מופיעה בסדר העבודה ״'+sc.name+'״ שמוצג עכשיו בדגם (שלב '+(S.idx+1)+' מתוך '+sc.steps.length+'). מה שמתרחש בשלב הזה (תיאור כללי של כל הפעולה, לא בהכרח של הדמות הזו בלבד): '+(st.text||'')+(st.src?' (מקור השלב: '+st.src+')':'')+(sc.src?' מקור כללי לסדר: '+sc.src+'.':'')+(h?' בידי הדמות כרגע: '+h+'.':'')},
    freeze(on){if(on){this._yaw=A.yaw}else if(this._yaw!=null){A.yaw=this._yaw;this._yaw=null}},
    face(v){this._yaw=A.yaw;A.yaw=Math.atan2(v.x-A.x,v.z-A.z)}})});
  return out}
 function syncSV(){const S=safe(()=>SV.S,null);if(S===svS)return;
  for(const k of Array.from(hists.keys()))if(String(k).indexOf('sv:')===0)hists.delete(k);
  svS=S;NPCS.sv.length=0;if(!S)return;
  try{svNpcs(S).forEach(n=>NPCS.sv.push(n))}catch(e){}}

 /* ---------- לחיצה על דמות (לחיצה קצרה בלי גרירה) ---------- */
 const cv=renderer.domElement;let dn=null;
 cv.addEventListener('pointerdown',e=>{if(e.isPrimary&&e.button===0)dn={x:e.clientX,y:e.clientY,t:performance.now(),id:e.pointerId}});
 cv.addEventListener('pointerup',e=>{const d=dn;dn=null;if(!d||d.id!==e.pointerId||!e.isPrimary)return;
  if(Math.hypot(e.clientX-d.x,e.clientY-d.y)>7||performance.now()-d.t>500)return;
  try{syncSV();const hit=NPCS.pickAt(e.clientX,e.clientY);if(hit&&hit.n)open(hit.n)}catch(err){console.warn('npc pick',err&&err.message)}});
 cv.addEventListener('pointercancel',()=>{dn=null});

 /* ---------- רמז קטן אחרי דף הכניסה ---------- */
 {const L=el('landing'),h=el('ncHint'),gone=()=>!L||L.style.display==='none'||L.classList.contains('out');let n=0;
  const iv=setInterval(()=>{if(++n>600){clearInterval(iv);return}if(!gone())return;clearInterval(iv);if(!h)return;setTimeout(()=>{if(cur)return;h.classList.add('on');setTimeout(()=>h.classList.remove('on'),14000)},1500)},1000)}

 /* ---------- "שאלו אותי": בועה קטנה מעל הדמויות הקרובות (לחיצה פותחת שיחה) ---------- */
 {const box=document.createElement('div');box.id='ncMarks';document.body.appendChild(box);const pool=[],pv=new THREE.Vector3();
  const get=i=>{if(!pool[i]){const b=document.createElement('button');b.className='ncmk';b.innerHTML='<i>💬</i><span>שאלו אותי</span>';b.style.display='none';box.appendChild(b);pool[i]=b}return pool[i]};
  const hideAll=()=>pool.forEach(b=>b.style.display='none');
  (function tick(){requestAnimationFrame(tick);
   try{const bd=document.body,L=el('landing');
    if(isOpen()||bd.classList.contains('kbusy')||bd.classList.contains('ksv')||(L&&L.style.display!=='none'&&!L.classList.contains('out'))){hideAll();return}
    const cp=camera.position,cand=[];
    for(const n of NPCS.list){if(n.active===false)continue;let p=null;try{p=NPCS.posOf(n,pv)}catch(e){}if(!p)continue;const d=Math.hypot(p.x-cp.x,p.y-cp.y,p.z-cp.z);if(d<70)cand.push([d,n,p.x,p.y,p.z])}
    cand.sort((a,b)=>a[0]-b[0]);const r=renderer.domElement.getBoundingClientRect();let k=0;
    for(const c of cand){if(k>=5)break;pv.set(c[2],c[3]+3.7,c[4]).project(camera);if(pv.z>1||Math.abs(pv.x)>.96||Math.abs(pv.y)>.92)continue;
     if(NPCS.occluded&&NPCS.occluded(c[1]))continue;
     const b=get(k++);b.style.display='flex';b.style.left=(r.left+(pv.x+1)/2*r.width)+'px';b.style.top=(r.top+(1-pv.y)/2*r.height)+'px';b.classList.toggle('lg',k<=2);b.onclick=e=>{e.stopPropagation();open(c[1])};b.onpointerdown=e=>e.stopPropagation()}
    for(let i=k;i<pool.length;i++)pool[i].style.display='none'}catch(e){}})()}
 return{open,close,get isOpen(){return isOpen()},syncSV,
  _dbg:{toWav,speak,buildBody,ctxText,parseReply,askServer,endpoint,svNpcs,get cur(){return cur},hists,wavBlob,errText}}
})();
