/* ================= שמע: מנגינת רקע + הקראה בקול (Gemini) =================
 מוזיקת רקע רכה ורומנטית: נוצרת בזמן אמת ב-WebAudio (בלי קבצים): פסנתר/נבל עדין + מיתרים על מעגל אקורדים ברה מז'ור, קצב איטי.
 הקראה: קליפי mp3 שהופקו מראש ב-Gemini TTS (tools/narration.cjs) ונארזו ל-NARR (src/narr.js): NARR['<תסריט>-<שלב>']=[dataURI, שניות].
 AUD.narr(key,rate,onEnd) מנגן הקראה (והמנגינה מנמיכה עצמה בזמן ההקראה); AUD.stop() עוצר; AUD.pause()/resume().
 הדפדפן מתיר שמע רק אחרי לחיצה – לכן המנגינה מתחילה בלחיצה הראשונה בדף (או בכפתור 🎵). */
const AUD=(()=>{
 const NR=(typeof NARR!=='undefined')?NARR:{};
 const LS={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:v}catch(e){return d}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
 let ctx=null,master=null,musG=null,wet=null,timer=null,nextT=0,pIdx=0,musicWanted=LS.get('bh_music','1')!=='0',narrWanted=LS.get('bh_narr','1')!=='0',duck=1,cur=null,started=false;
 /* מוזיקת רקע נעימה, רכה ורומנטית: מעגל אקורדים רך ברה מז'ור (ר–לה–סי־מינור–פה#־מינור–סול–ר–סול–לה), פסנתר/נבל עדין עם ארפג'ו,
    מקהלת מיתרים (pad) איטית ומלודיה שקטה. קצב איטי; עוצמה נמוכה, ובין הקראות היא מתגברת בעדינות (setDuck). */
 const D3=146.83,hz=n=>D3*Math.pow(2,n/12);
 /* אקורדים: חצאי־טונים מרה3 (בס, קווינטה, אוקטבה, טרצה, ...) */
 const CH=[[0,7,12,16,19,24],[-5,2,7,11,14,19],[-3,4,9,12,16,21],[-8,-1,4,7,11,16],[-7,0,5,9,12,17],[0,7,12,16,19,24],[-7,0,5,9,12,17],[-5,2,7,11,14,19]];
 /* מלודיה לכל אקורד (4 פעימות): [חצאי־טונים, משך] */
 const ML=[[[24,2],[23,1],[19,1]],[[23,2],[19,1],[21,1]],[[21,2],[24,1],[21,1]],[[23,2],[21,1],[19,1]],[[24,2],[21,1],[24,1]],[[19,2],[21,1],[19,1]],[[17,2],[21,1],[24,1]],[[23,3],[19,1]]];
 const ARP=[0,2,3,4,3,2,3,5];   /* אינדקסי ארפג'ו בחצאי־פעימה */
 function init(){if(ctx)return true;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
  ctx=new AC();master=ctx.createGain();master.gain.value=.9;const comp=ctx.createDynamicsCompressor();comp.threshold.value=-20;comp.ratio.value=3;master.connect(comp);comp.connect(ctx.destination);
  musG=ctx.createGain();musG.gain.value=0;musG.connect(master);
  /* רוורב ארוך ורך: אולם חם */
  const len=ctx.sampleRate*2.6,buf=ctx.createBuffer(2,len,ctx.sampleRate);
  for(let c=0;c<2;c++){const d=buf.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.2)}
  const cv=ctx.createConvolver();cv.buffer=buf;wet=ctx.createGain();wet.gain.value=.5;cv.connect(wet);wet.connect(musG);musG._cv=cv;
  return true}
 /* פסנתר/נבל רך: בסיס סינוס + הרמוניה שנייה חלשה, התקפה עדינה ודעיכה ארוכה, מסנן עדין */
 function key(fr,t,len,vel){
  const g=ctx.createGain(),o1=ctx.createOscillator(),o2=ctx.createOscillator(),g2=ctx.createGain(),f=ctx.createBiquadFilter();
  o1.type='sine';o2.type='triangle';o1.frequency.value=fr;o2.frequency.value=fr*2;g2.gain.value=.22;f.type='lowpass';f.frequency.value=Math.min(3200,fr*5);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vel,t+.02);g.gain.exponentialRampToValueAtTime(.0006,t+len);
  o1.connect(f);o2.connect(g2);g2.connect(f);f.connect(g);g.connect(musG);g.connect(musG._cv);
  o1.start(t);o2.start(t);o1.stop(t+len+.1);o2.stop(t+len+.1)}
 /* מיתרים: צלילים ארוכים עם כניסה/יציאה איטיות */
 function pad(fr,t,len,vel){
  const g=ctx.createGain(),f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=900;
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vel,t+1.4);g.gain.setValueAtTime(vel,t+len-1.4);g.gain.linearRampToValueAtTime(0,t+len);
  [-6,6].forEach(dt=>{const o=ctx.createOscillator();o.type='sawtooth';o.frequency.value=fr;o.detune.value=dt;o.connect(f);o.start(t);o.stop(t+len+.1)});
  f.connect(g);g.connect(musG);g.connect(musG._cv)}
 const BEAT=.9;   /* קצב איטי (כ־66 לדקה) */
 function sched(){if(!ctx||!musicWanted)return;
  if(nextT<ctx.currentTime)nextT=ctx.currentTime+.1;
  while(nextT<ctx.currentTime+1.6){
   const c=pIdx%8,loop=(pIdx/8|0)%2,p=CH[c],t=nextT;
   key(hz(p[0]-12),t,4,.2);   /* בס */
   [1,2,3,4].forEach(i=>pad(hz(p[i]-12),t,BEAT*4+1.6,.032));   /* מיתרים */
   for(let k=0;k<8;k++)key(hz(p[ARP[k]]),t+k*BEAT/2,2.2,k===0?.13:.07);   /* ארפג'ו */
   if(loop===0||c>=4){let m=t+.02;ML[c].forEach(([n,d])=>{key(hz(n)*(loop?1:1),m,Math.min(3.6,d*BEAT+1.6),.17);m+=d*BEAT})}   /* מלודיה (בסיבוב השני – רק בחצי השני) */
   nextT=t+BEAT*4;pIdx++}}
 function setMusic(on){musicWanted=on;LS.set('bh_music',on?'1':'0');
  if(on){if(!init())return;ctx.resume();musG.gain.cancelScheduledValues(ctx.currentTime);musG.gain.setTargetAtTime(.55*duck,ctx.currentTime,1.2);if(!timer){nextT=0;timer=setInterval(sched,300)}sched()}
  else if(ctx){musG.gain.setTargetAtTime(0,ctx.currentTime,.5);if(timer){clearInterval(timer);timer=null}}
  btn()}
 function setDuck(d){const up=d>duck;duck=d;if(ctx&&musicWanted)musG.gain.setTargetAtTime(.55*d,ctx.currentTime,up?.8:.35)}   /* מתגברת באיטיות בין הקראות, מונמכת מהר כשמתחילה הקראה */
 function btn(){const b=document.getElementById('bMus');if(b){b.textContent=musicWanted?'🎵 מוזיקה: פועלת':'🔇 מוזיקה: כבויה';b.style.opacity=musicWanted?1:.7}
  const m=document.getElementById('svMus');if(m){m.classList.toggle('off',!musicWanted);m.title=musicWanted?'מוזיקה – כבה':'מוזיקה – הפעל'}
  const n=document.getElementById('svNar');if(n){n.classList.toggle('off',!narrWanted);n.title=narrWanted?'הקראה בקול – כבה':'הקראה בקול – הפעל'}}
 /* ---- הקראה ---- */
 let duckT=null;
 /* עצירה רכה (דעיכה קצרה, בלי "קליק"); הנמכת המנגינה חוזרת רק אחרי הפסקה ארוכה – כדי שהמוזיקה לא "תקפוץ" בין שלב לשלב */
 function stop(keepDuck){if(cur){const c=cur;cur=null;c.a.onended=null;c.a.onerror=null;const a=c.a;let v=a.volume;const iv=setInterval(()=>{v-=.15;if(v<=0.02){clearInterval(iv);try{a.pause()}catch(e){}a.src=''}else a.volume=v},12)}
  if(!keepDuck)setDuck(1)}
 function narr(key,rate,onEnd){stop(true);clearTimeout(duckT);const e=NR[key];if(!narrWanted||!e){setDuck(1);onEnd&&onEnd();return false}
  const a=new Audio(e[0]);a.playbackRate=Math.max(.5,Math.min(2,rate||1));const c={a,key,end:onEnd};cur=c;
  const fin=()=>{if(cur!==c)return;cur=null;clearTimeout(duckT);duckT=setTimeout(()=>{if(!cur)setDuck(1)},350);onEnd&&onEnd()};a.onended=fin;a.onerror=fin;
  setDuck(.2);const pr=a.play();if(pr&&pr.catch)pr.catch(()=>fin());return true}
 const has=key=>!!NR[key];
 const dur=key=>NR[key]?NR[key][1]:0;
 function pause(){if(cur&&!cur.a.paused)cur.a.pause()}
 function resume(){if(cur&&cur.a.paused){const pr=cur.a.play();if(pr&&pr.catch)pr.catch(()=>{})}}
 function rate(r){if(cur)cur.a.playbackRate=Math.max(.5,Math.min(2,r))}
 function setNarr(on){narrWanted=on;LS.set('bh_narr',on?'1':'0');if(!on)stop();btn()}
 /* אתחול: לחיצה ראשונה בדף מפעילה מנגינה (מדיניות הדפדפן) */
 function first(e){if(started||e&&e.target&&e.target.id==='bMus')return;started=true;['pointerdown','keydown','touchstart'].forEach(ev=>window.removeEventListener(ev,first,true));if(musicWanted)setMusic(true)}
 ['pointerdown','keydown','touchstart'].forEach(ev=>window.addEventListener(ev,first,true));
 const b=document.getElementById('bMus');if(b)b.onclick=()=>{started=true;setMusic(!musicWanted)};btn();
 return{setMusic,setNarr,narr,stop,pause,resume,rate,has,dur,btn,get music(){return musicWanted},get narrOn(){return narrWanted},get speaking(){return !!cur}}
})();
