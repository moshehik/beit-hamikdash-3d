/* ---------- שלט מצגות + פקודות קול (בלי AI: זיהוי הדיבור המובנה של כרום/אדג') ----------
   השלט של משה (דונגל USB, נמדד 20.11.2026): חץ למטה = PageDown, חץ למעלה = PageUp (כפולה = פעמיים, ארוכה: B / Esc),
   כפתור ריבוע = Tab (כפולה = Enter). לייזר – חומרה בלבד, לא שולח מקש.
   מצבים:
   • טיול ברגל: PageUp/PageDown פונים שמאלה/ימינה (30°), Tab – מתחיל/עוצר הליכה קדימה, Enter – הליכה אחורה, B – עצירה, Esc – יציאה (קיים).
   • סיור (סדרי עבודה): PageDown = הבא, PageUp = הקודם, Tab או B = הפעלה/השהיה.
   • מבט־על: PageUp/PageDown מסובבים את המבט, Tab/Enter מקרבים/מרחיקים.
   • דף הכניסה ותפריט הסיורים: PageDown/PageUp מזיזים סימון בין הכרטיסים, Tab/Enter (ריבוע) – בוחרים; B – סוגר את תפריט הסיורים.
   • מפות / שבטים / 'על הדגם': PageUp/PageDown גוללים כרגיל, ריבוע (Tab) או B – סוגרים וחוזרים לדגם.
   פקודות קול: קדימה · אחורה · ימינה · שמאלה · עצור · הסתובב · למעלה · למטה · מהר · לאט · הבא · הקודם · המשך · טיול · מבט על. */
const REMOTE=(()=>{
 const $$=id=>document.getElementById(id);
 const menuItems=m=>[...document.querySelectorAll(m=='landing'?'#landing .ldc':'#svKGrid .kcard,#svList .svc-it')].filter(b=>b.offsetParent!==null);
 const mode=()=>{if(typeof mapOpen!='undefined'&&mapOpen||typeof kidOpen!='undefined'&&kidOpen)return 'overlay';
  const ab=$$('about');if(ab&&getComputedStyle(ab).display!='none')return 'overlay';
  const L=$$('landing');if(L&&getComputedStyle(L).display!='none'&&!L.classList.contains('out'))return 'landing';
  if(typeof SV!='undefined'&&SV.isOpen){if(SV.S)return 'tour';if(menuItems('menu').length)return 'menu'}return walk?'walk':'orbit'};
 /* ----- תנועה ----- */
 let auto=0;   /* 1 קדימה, -1 אחורה */
 const hold=(code,ms)=>{keys[code]=1;setTimeout(()=>{keys[code]=0},ms)};
 function setAuto(d){auto=d;keys.KeyW=d>0?1:0;keys.KeyS=d<0?1:0}
 function stopAuto(){setAuto(0)}
 setInterval(()=>{if(auto&&!walk)stopAuto()},300);
 const orbitTurn=(deg)=>{const t=controls.target,a=deg*Math.PI/180;let n=0;const N=12,da=a/N;(function st(){const v=camera.position.clone().sub(t),c=Math.cos(da),s=Math.sin(da);camera.position.set(t.x+v.x*c-v.z*s,camera.position.y,t.z+v.x*s+v.z*c);controls.update();if(++n<N)requestAnimationFrame(st)})()};
 const orbitZoom=k=>{const t=controls.target,v=camera.position.clone().sub(t);camera.position.copy(t.clone().add(v.multiplyScalar(k)));controls.update()};
 function turn(dir){   /* dir: +1 ימינה, -1 שמאלה (30°) */
  const m=mode();if(m=='walk')walkTurn(dir*30);else if(m=='orbit')orbitTurn(dir>0?-30:30)}
 let wtTok=0,wtTgt=null;   /* פנייה בטיול: ממשיכים מהיעד הקודם, בזמן (לא בפריימים) – עובד גם במחשב איטי */
 function walkTurn(deg){const a0=yaw,a1=(wtTgt==null?yaw:wtTgt)+deg*Math.PI/180,t0=performance.now(),D=260,tok=++wtTok;wtTgt=a1;(function st(){if(tok!=wtTok)return;const u=Math.min(1,(performance.now()-t0)/D);yaw=a0+(a1-a0)*(1-(1-u)*(1-u));if(u<1)requestAnimationFrame(st);else wtTgt=null})()}
 function say(t){const b=$$('rmChip');if(!b)return;b.textContent=t;b.style.opacity=1;clearTimeout(say.t);say.t=setTimeout(()=>{b.style.opacity=0},2200)}
 /* ----- פקודות (משותפות לקול ולשלט) ----- */
 const A={
  forward(){const m=mode();if(m=='walk')setAuto(auto>0?0:1);else if(m=='orbit')orbitZoom(.75);else if(m=='tour')A.next()},
  back(){const m=mode();if(m=='walk')setAuto(auto<0?0:-1);else if(m=='orbit')orbitZoom(1.33);else if(m=='tour')A.prev()},
  left(){turn(-1)},right(){turn(1)},
  stop(){const m=mode();if(auto)stopAuto();else if(m=='tour')A.pause()},
  around(){if(mode()=='walk')walkTurn(180);else orbitTurn(180)},
  up(){if(mode()=='walk')hold('KeyR',400)},down(){if(mode()=='walk')hold('KeyF',400)},
  fast(){keys.ShiftLeft=1;say('מהר')},slow(){keys.ShiftLeft=0;say('רגיל')},
  next(){const b=$$('svNext');if(b&&mode()=='tour')b.click()},prev(){const b=$$('svPrev');if(b&&mode()=='tour')b.click()},
  pause(){if(mode()=='tour'&&SV.S&&SV.S.playing)$$('svPP').click()},
  play(){if(mode()=='tour'&&SV.S&&!SV.S.playing)$$('svPP').click()},
  toggle(){if(mode()=='tour')$$('svPP').click()},
  walkOn(){if(!walk)setWalk(true)},walkOff(){if(walk){stopAuto();setWalk(false)}}};
 /* ----- תפריטים (דף הכניסה / רשימת הסיורים): סימון עם החיצים, בחירה עם הריבוע ----- */
 let selEl=null;
 function menuMove(m,d){const it=menuItems(m);if(!it.length)return;let i=it.indexOf(selEl);if(selEl)selEl.classList.remove('rmSel');i=i<0?(d>0?0:it.length-1):(i+d+it.length)%it.length;selEl=it[i];selEl.classList.add('rmSel');try{selEl.scrollIntoView({block:'nearest',inline:'nearest'})}catch(e){}}
 function menuGo(m){const it=menuItems(m);if(!it.length)return;const el=it.indexOf(selEl)>=0?selEl:it[0];if(selEl)selEl.classList.remove('rmSel');selEl=null;el.click()}
 function closeOverlay(){if(typeof mapOpen!='undefined'&&mapOpen)openMap(false);else if(typeof kidOpen!='undefined'&&kidOpen)openKids(false);else{const a=$$('about');if(a)a.style.display='none'}}
 /* ----- מקשי שלט ----- */
 let lastTab=0;
 const typing=e=>{const t=e.target;return t&&(t.tagName=='INPUT'||t.tagName=='TEXTAREA'||t.tagName=='SELECT'||t.isContentEditable)};
 addEventListener('keydown',e=>{
  if(typing(e)||e.ctrlKey||e.altKey||e.metaKey)return;
  const m=mode(),c=e.code;let h=true;
  if(m=='landing'||m=='menu'){if(c=='PageDown')menuMove(m,1);else if(c=='PageUp')menuMove(m,-1);
   else if(c=='Tab'||c=='Enter'){if(performance.now()-lastTab>=700){lastTab=performance.now();menuGo(m)}}
   else if(c=='KeyB'&&m=='menu')SV.show(false);else h=false;
   if(h){e.preventDefault();e.stopImmediatePropagation()}return}
  if(m=='overlay'){if((c=='Tab'||c=='KeyB')&&performance.now()-lastTab>=700){lastTab=performance.now();closeOverlay();e.preventDefault();e.stopImmediatePropagation()}else if(c=='Tab'){e.preventDefault()}return}
  if(c=='PageDown'){if(m=='tour')A.next();else A.right()}
  else if(c=='PageUp'){if(m=='tour')A.prev();else A.left()}
  else if(c=='Tab'){if(performance.now()-lastTab>=700){lastTab=performance.now();if(m=='tour')A.toggle();else A.forward()}}   /* לחיצה ארוכה על הריבוע שולחת Tab חוזר – מתעלמים מהחזרות */
  else if(c=='Enter'){if(m=='tour')A.toggle();else A.back()}
  else if(c=='KeyB'){if(m=='tour')A.toggle();else A.stop()}
  else h=false;
  if(h){e.preventDefault();e.stopImmediatePropagation()}
 },true);
 /* ----- קול ----- */
//VOICE-BEGIN
 const norm=s=>(s||'').replace(/[֑-ׇ]/g,'').replace(/[.,!?"'׳״\-–:;()]/g,' ').replace(/\s+/g,' ').trim().toLowerCase();
 const CMD=[
  [/(עצור|עצרו|תעצור|לעצור|עצירה|סטופ|stop|מספיק|חכה|^די$|^די | די )/,'stop'],
  [/(הסתובב|תסתובב|סובב|חצי סיבוב|פנית פרסה)/,'around'],
  [/(שמאלה|שמאל)/,'left'],[/(ימינה|ימין)/,'right'],
  [/(אחורה|אחורנית|לאחור|תחזור אחורה|תלך אחורה)/,'back'],
  [/(קדימה|תתקדם|התקדם|תלך|סע|ישר|הלאה)/,'forward'],
  [/(למעלה|תסתכל למעלה|מעלה)/,'up'],[/(למטה|תסתכל למטה|מטה)/,'down'],
  [/(מהר|מהר יותר|רוץ|ריצה)/,'fast'],[/(לאט|רגיל|הליכה רגילה)/,'slow'],
  [/(הבא|השלב הבא|הלאה)/,'next'],[/(הקודם|קודם|השלב הקודם|חזור)/,'prev'],
  [/(השהה|תשהה|הפסק)/,'pause'],[/(המשך|נגן|התחל|תמשיך)/,'play'],
  [/(טיול|הליכה|ללכת|טיול ברגל)/,'walkOn'],[/(מבט על|מבט־על|יציאה|צא)/,'walkOff']];
 function cmd(text){const t=norm(text);if(!t)return null;
  const hits=[];for(const [re,name] of CMD){const m=t.match(re);if(m)hits.push([t.indexOf(m[0]),name])}
  if(!hits.length)return null;hits.sort((a,b)=>a[0]-b[0]);const name=hits[0][1];   /* הפקודה הראשונה במשפט */
  if(name=='forward'&&mode()=='tour'){A.next()}else if(name=='play'&&mode()=='walk'){A.forward()}else A[name]&&A[name]();
  return name}
 const SRC=window.SpeechRecognition||window.webkitSpeechRecognition;
 let rec=null,want=false,handled={};
 function startVoice(){if(!SRC)return;want=true;if(rec)return;
  rec=new SRC();rec.lang='he-IL';rec.continuous=true;rec.interimResults=true;rec.maxAlternatives=3;
  rec.onresult=ev=>{for(let i=ev.resultIndex;i<ev.results.length;i++){const r=ev.results[i];let done=handled[i];
   for(let j=0;j<r.length&&!done;j++){const tx=r[j].transcript,n=cmd(tx);if(n){done=handled[i]=1;say('🎤 '+tx.trim()+' ← '+(LBL[n]||n))}}
   if(!done&&r.isFinal&&r[0]&&r[0].transcript.trim())say('🎤 '+r[0].transcript.trim()+' (לא פקודה)')
   if(r.isFinal)delete handled[i]}};
  rec.onerror=e=>{if(e.error=='not-allowed'||e.error=='service-not-allowed'){want=false;say('אין הרשאת מיקרופון')}else if(e.error=='network'){say('זיהוי הדיבור דורש חיבור לרשת');}};
  rec.onend=()=>{rec=null;handled={};if(want)setTimeout(()=>{if(want)startVoice()},350);else sync()};
  try{rec.start()}catch(e){rec=null}sync()}
 function stopVoice(){want=false;if(rec){try{rec.stop()}catch(e){}}sync()}
 const LBL={forward:'קדימה',back:'אחורה',left:'שמאלה',right:'ימינה',stop:'עצירה',around:'הסתובבות',up:'מבט למעלה',down:'מבט למטה',fast:'מהר',slow:'לאט',next:'הבא',prev:'הקודם',pause:'השהיה',play:'המשך',walkOn:'טיול',walkOff:'מבט על'};
 function sync(){const b=$$('rmMic');if(!b)return;b.classList.toggle('on',want);b.setAttribute('aria-pressed',want?'true':'false');b.querySelector('span').textContent=want?'מקשיב… אמרו: קדימה / אחורה / ימינה / שמאלה / עצור':'פקודות קול'}
//VOICE-END
 /* ----- כפתור ----- */
 const css=document.createElement('style');css.textContent='#rmMic{position:fixed;left:12px;bottom:12px;z-index:45;display:flex;align-items:center;gap:8px;background:rgba(32,24,12,.82);color:#f6e6bd;border:1px solid #c9a24a;border-radius:22px;padding:8px 14px;font:600 14px system-ui,sans-serif;cursor:pointer;direction:rtl}#rmMic.on{background:#9a2a1a;border-color:#ff9a7a;color:#fff}#rmMic i{font-style:normal;font-size:18px}#landing .ldc.rmSel,.svc-it.rmSel,.kcard.rmSel{outline:4px solid #ffd66b;outline-offset:3px;box-shadow:0 0 22px 6px rgba(255,214,107,.75)!important;transform:translateY(-3px) scale(1.03)}#rmChip{position:fixed;left:12px;bottom:58px;z-index:45;background:rgba(0,0,0,.75);color:#fff;border-radius:12px;padding:6px 12px;font:14px system-ui,sans-serif;direction:rtl;opacity:0;transition:opacity .3s;pointer-events:none;max-width:70vw}@media(max-width:600px){#rmMic span{display:none}}';document.head.appendChild(css);
 const chip=document.createElement('div');chip.id='rmChip';chip.setAttribute('role','status');document.body.appendChild(chip);
//VOICE-BEGIN
 if(SRC){const b=document.createElement('button');b.id='rmMic';b.type='button';b.setAttribute('aria-label','פקודות קול');b.innerHTML='<i>🎤</i><span>פקודות קול</span>';b.onclick=()=>want?stopVoice():startVoice();document.body.appendChild(b)}
//VOICE-END
 return{A,mode,get cmd(){return typeof cmd=='function'?cmd:null},get startVoice(){return typeof startVoice=='function'?startVoice:null},get stopVoice(){return typeof stopVoice=='function'?stopVoice:null},get auto(){return auto},get listening(){return typeof want!='undefined'&&want}}})();
