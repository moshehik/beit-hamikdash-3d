/* ================= בקרה, מצלמה, טיול, ממשק ================= */
const controls=new THREE.OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;controls.dampingFactor=.08;controls.maxDistance=6500;controls.minDistance=4;controls.maxPolarAngle=Math.PI*.495;controls.screenSpacePanning=false;
camera.position.set(330,330,470);controls.target.set(-20,0,-40);

/* ---------- שעה ביום ---------- */
const C=(h)=>new T.Color(h);let day=1;
function setTime(h){const a=(h-6)/12*Math.PI,el=Math.sin(a);day=Math.max(0,Math.min(1,el*2.4+.12));const dusk=Math.max(0,1-Math.abs(el)*4);
 sun.position.set(Math.cos(a)*800,Math.max(60,el*800),320).add(sun.target.position);sun.intensity=1.3*Math.max(0,Math.min(1,el*3));sun.color.set(0xffffff).lerp(C(0xffa860),dusk*.8);
 const sky=C(0x060a1c).lerp(C(0x8fc4ee),day).lerp(C(0xf09a68),dusk*.55);scene.background=sky;scene.fog.color.copy(sky);
 hemi.intensity=.12+.6*day;hemi.color.set(0x6a7ab0).lerp(C(0xbfd8ff),day);stars.material.opacity=1-day;renderer.shadowMap.needsUpdate=true;
 const n=1-day;lampLights.forEach(l=>l.intensity=.35+n*2.2);altarLight.intensity=1+n*2.5;hekLight.intensity=.4+n*.4}
$('tm').oninput=e=>setTime(+e.target.value);

/* ---------- שכבות וחתכים ---------- */
const bind=(id,fn)=>{const e=$(id);e.onchange=()=>{fn(e.checked);renderer.shadowMap.needsUpdate=true}};
const ARKLBL=lbl('ארון הברית וכרובי שלמה (בית ראשון)',-137,YH+13,ZC,'hekhal',90);ARKLBL.r=.001;bind('lArk',v=>{ARKG.visible=v;ARKLBL.r=v?90:.001});
[['lMount','mount'],['lChel','chel'],['lNashim','nashim'],['lAz','azarah'],['lHek','hekhal'],['lEnv','env']].forEach(([i,g])=>bind(i,v=>GRP[g].visible=v));
bind('lRoof',v=>ROOFS.forEach(r=>r.visible=v));let lblMode='smart',lblSize=13,lblCat={mount:1,courts:1,hek:1,city:1};
const plane=new T.Plane(new T.Vector3(0,0,1),0);
function applyCut(){const k=$('cut').value,v=+$('cutv').value;
 if(!k){renderer.clippingPlanes=[]}else{k=='z'?plane.set(new T.Vector3(0,0,1),-v):plane.set(new T.Vector3(-1,0,0),v);renderer.clippingPlanes=[plane]}
 Object.values(M).forEach(m=>m.side=k?T.DoubleSide:(m===M.curt?T.DoubleSide:T.FrontSide));
 Object.values(M).forEach(m=>m.needsUpdate=true);renderer.shadowMap.needsUpdate=true}
$('cut').onchange=applyCut;$('cutv').oninput=applyCut;

/* ---------- מקומות ---------- */
const P=[
['sec','סקירה'],
['מבט על – הר הבית','הר הבית כולו: ריבוע של 500×500 אמה, ובתוכו הסורג והחיל, עזרת נשים, העזרה וההיכל. הדרום גדול מהצפון והמערב קטן מכולם (מידות ב:א) – כאן המתחם הפנימי מוזז לצפון־מערב, והדרום פתוח לסטיו המלכותי.','משנה, מידות ב:א · מידות א:א',[330,330,470],[-20,0,-40],[200,100,225]],
['הר הבית וחומותיו','חומת ההר עם חמשת שעריו: שושן במזרח, קיפונוס במערב, טדי בצפון ושני שערי חולדה בדרום. כל הקירות גבוהים חוץ מהמזרחי, כדי שהשורף את הפרה יראה את פתח ההיכל מהר המשחה (המודל מפשט: חומת ההר אחידה). בפנים – סטווים סביב.','משנה, מידות א:ג · ב:ג–ד',[-430,170,-440],[0,0,0]],
['שערי ההר – חולדה','שני שערי חולדה בדרום, בהם עולים ויוצאים מן העיר. בשני אלה נכנסים והולכים ימינה (בכיוון השעון) ויוצאים משמאל.','משנה, מידות א:ג · ב:ב',[25,45,330],[25,12,246],[25,200,-1.6]],
['הסטיו המלכותי','לפי יוספוס: אולם בן שלוש ספינות ו־4 שורות עמודים, האמצעית גבוהה כפליים. אינו מהמשנה, אבל היה חלק מהר הבית ההרודיאני.','יוספוס, קדמוניות טו:יא',[-150,70,100],[40,40,210],[0,150,0]],
['שער שושן וגשר פרה אדומה','בשער המזרחי ציור שושן הבירה. מעליו יצא הכהן השורף את הפרה על גשר כפול־קשתות להר המשחה (הזיתים).','משנה, מידות א:ג · פרה ג:ו',[640,70,-130],[300,0,-57.5],[225,-57.5,270]],
['sec','ירושלים בימי בית שני (משוער)'],
['ירושלים כולה','ירושלים בימי בית שני: הר הבית במרכז, מזרחה נחל קדרון והר הזיתים, בדרום רכס עיר דוד והאופל, במערב הגיא (טירופיון) והעיר העליונה על הגבעה המערבית, ומצפון בית חדתא. שלוש החומות: ראשונה, שנייה (אל אנטוניה) ושלישית (אגריפס). הפריסה משוערת לפי חפירות ארכאולוגיות (העיר העליונה והרובע ההרודיאני, עיר דוד, רחוב עולי הרגל, ברכת השילוח) ותיאורי יוספוס.','יוספוס, מלחמות ה:ד · ממצאי חפירות העופל, עיר דוד והרובע היהודי',[1500,650,-250],[-250,0,300],[25,345,0]],
['עיר דוד וברכת השילוח','רכס עיר דוד מדרום להר הבית: מעיין הגיחון בנחל קדרון, ברכת השילוח בקצה הדרומי, ורחוב עולי הרגל שעלה מן הברכה אל הר הבית לאורך הגיא. הבתים של העיר התחתית צפופים על הרכס.','חפירות עיר דוד · ברכת השילוח (2004–2007)',[200,420,2250],[-40,-100,1000],[-258,430,180]],
['העיר העליונה וארמון הורדוס','ארמון הורדוס בפינת צפון־מערב של העיר העליונה, ושלושה מגדלים: היפיקוס (25 אמה רוחב, 80 גובה), פצאל (40 על 90) ומרים (20 על 55). הרובע העליון: בתי אצולה וכוהנים.','יוספוס, מלחמות ה:ד:ג–ד · חפירות הרובע היהודי',[-560,300,560],[-1000,40,-40],[-700,-60,270]],
['אנטוניה ובית חסדא','מצודת אנטוניה בפינת צפון־מערב של הר הבית: סלע חצוב בגובה 50 אמה, ארבעה מגדלים, ומהם מדרגות אל סטיו הצפון. מצפון להר הבית – ברכות בית חסדא.','יוספוס, מלחמות ה:ה:ח',[250,200,-700],[-100,20,-330],[-170,-430,180]],
['קשת וילסון ורובינסון','קשת וילסון: גשר מעל הגיא מהעיר העליונה אל שער הר הבית המערבי. קשת רובינסון ומדרגותיה בפינת דרום־מערב עלו אל הסטיו המלכותי מרחוב עולי הרגל.','חפירות הכותל המערבי · יוספוס, קדמוניות טו:יא:ה',[-720,130,330],[-330,-30,100],[-300,-100,270]],
['sec','החיל, עזרת נשים והעזרה'],
['החיל והסורג','גדר סבכה בגובה עשרה טפחים (1.67 אמה) עם י״ג פרצות, ולפנימה ממנה החיל ברוחב עשר אמות. משם י״ב מעלות (חצי אמה גובה, חצי אמה רוחב) אל עזרת נשים.','משנה, מידות ב:ג',[215,50,0],[150,5,-57.5],[195,-57.5,270]],
['עזרת נשים','135×135 אמה. בארבע פינותיה ארבע לשכות של 40×40 אמה ללא גג: נזירים (דרום־מזרח), עצים (צפון־מזרח), מצורעים (צפון־מערב), שמן ויין (דרום־מערב). בסוכות הוצבו כאן ארבע מנורות בגובה 50 אמה.','משנה, מידות ב:ה · סוכה ה:ב',[165,95,-115],[85,6,-57.5],[140,-57.5,270]],
['שער ניקנור וט״ו המעלות','ט״ו מעלות כנגד ט״ו שיר המעלות עולות מעזרת נשים אל שער ניקנור ועזרת ישראל. השער לא נצטפה בזהב בגלל הנס שאירע בו.','משנה, מידות ב:ג, ה',[65,40,-35],[14.5,20,ZC],[40,ZC,270]],
['עזרת ישראל וכהנים','שתי רצועות באורך 135 ורוחב 11 אמה כל אחת: ישראל, ולפנימה כהנים. עזרת כהנים גבוהה מעזרת ישראל בשתי אמות וחצי.','משנה, מידות ב:ו · ה:א',[45,55,-35],[-5,17,-60],[6.5,-60,270]],
['המזבח והכבשים','בסיס 32×32, ומעליו 30×30, סובב 28×28 וקרנות; המערכה 24×24. הכבש הגדול בדרום: 32 אמה אורך ו־16 רוחב. בשני צידיו כבש קטן מזרחי ומערבי שעולים אל הסובב. בקרן דרומית־מערבית שני נקבים ושני ספלים. עשן המערכה עולה ישר.','משנה, מידות ג:א–ג · זבחים סב ע״א · ערכת המזבח',[15,45,25],[-26,16,-43],[-6,-14,270]],
['בית המטבחיים','מצפון למזבח: שמונה אמות עד הטבעות, 24 טבעות (ארבע בשורה), ארבע אמות לשולחנות השיש, שמונה עמודים נמוכים עם קורות ארז וקרסים, ושם התלו והפשיטו.','משנה, מידות ג:ה · ה:ב',[5,40,-70],[-22,16,-105],[-4,-100,270]],
['הכיור','דרומית למעלות האולם ומזרחית לאולם (תרשים התפארת ישראל). הבור והמוכני צמודים אליו.','משנה, מידות ג:ו',[-38,30,-8],[-58,18,-30],[-46,-28,270]],
['לשכות העזרה – צפון','בית המוקד (חציו בפנים וחציו בחוץ) מזרחית לשערי הניצוץ והקרבן; ובקצה המזרחי: לשכות פרהדרין והגזית. לשכות המלח והפרווה בפינות המערביות של העזרה.','משנה, מידות א:ו · ה:ג',[-110,70,-70],[-115,18,-118],[-80,-90,0]],
['בית הטבילה והמסיבה','בבית המוקד מקווה עגול שקוע ליד המדורה, ובלשכה הצפונית־מערבית (פתוחה לטרקלין) יורדים במעלות מסתלסלות. משם "המסיבה ההולכת תחת הבירה והחיל": מנהרה קמורה ארוכה, נרות דולקים משני צדיה, עד מדרגות היציאה בשער טדי – פתח מחודד מוצר עם דלתות מעוטרות. הדגם מציג את שתי הדעות: בית טבילה בבית המוקד (טרקלין) והמסיבה שיוצאת בטדי (ר׳ אליעזר בן יעקב).','משנה, מידות א:ו, ט · תמיד א:א',[-60,70,-60],[-90,18,-117],[-99,-117,270]],
['המסיבה ושער טדי','המנהרה המוארת מתחת לעזרה ולחיל: קירות לוחות, גג קמור, פמוטי קיר. בקצה הצפוני עולים 20 מעלות אל החצר שבתוך שער טדי, והשער פתוח החוצה (טמא קרי אינו נכנס להר הבית).','משנה, מידות א:ט (ר׳ אליעזר בן יעקב)',[40,45,-170],[-102,0,-190],[-102,-140,0,-10]],
['לשכות העזרה – דרום','שער העליון, הדלק, הבכורות והמים; לשכות העץ, הגולה (בור וגלגל), אבטינס והמדיחין. לשכת הגזית עברה לצפון־מזרח.','משנה, מידות ה:ג–ד',[-100,60,-40],[-100,18,3],[-98,-15,180]],
['sec','הכהנים'],
['כהן וכהן גדול – בגדי כהונה','כהן הדיוט עובד בארבעה בגדי בוץ לבנים: כתונת, מכנסיים, מגבעת ואבנט (שש, תכלת, ארגמן ותולעת שני). הכהן הגדול נוסף עליו בארבעה בגדי זהב: אפוד, חושן (י״ב אבנים), מעיל תכלת עם פעמונים ורימונים, וציץ זהב על המצח. ביום הכיפורים הכהן הגדול עובד בארבעה בגדי לבן בלבד. הכול יחפים.','שמות כח · ויקרא טז:ד · רמב״ם הל׳ כלי המקדש ח · יומא עב',[4,20,-31],[-7.5,18,-31]],
['sec','האולם וההיכל'],
['האולם','פתח 40 אמה גובה ו־20 רוחב, חמש קורות אשוח מעליו (השווה 22–30 אמה), וילון בבלי, וחזית מצופה זהב (יוספוס). עומקו 11 אמה ורוחבו 100: פורץ 15 אמה לכל צד מעבר לגוף ההיכל.','משנה, מידות ג:ז–ח · ד:ז',[40,70,-60],[-65,48,ZC],[-48,ZC,270]],
['ההיכל מצד מערב','100×100×100: ששה יסוד, 40 גובה, 1 ציור, 2 מרזב, 1 תקרה, 1 טיח, 40 עליה, ועוד כרכוב, מעקה 3 וקוצים (אמה). התאים בשלוש קומות בצפון, דרום ומערב.','משנה, מידות ד:ו',[-260,110,-40],[-125,55,ZC]],
['חתך – בתוך ההיכל','חתך אורך (הסרת הצפון וגגות): האולם, ההיכל (40×20), האמה של הפרוכת, קודש הקדשים (20×20), ושלוש קומות התאים (5, 6 ו־7 אמות רוחב).','משנה, מידות ד:א–ז',[-112,95,-235],[-112,48,-58],null,{cut:'z',v:ZC,roofs:false}],
['חתך – תאי הלשכות (דרום)','חתך דרך שלוש קומות התאים בדרום (5, 6 ו־7 אמות), הגגות מוסתרים: בתחתונה אוצר כלי שרת (קערות, גביעים, צלחות זהב), באמצעית תאי אוצר (תיבות, כדים, שקים, מטילים), ובעליונה מנורות, נרות ו"מגדלורי" זהב.','משנה, מידות ד:ג–ז',[-112,52,-175],[-112,22,ZC+22],null,{cut:'z',v:ZC+16.3,roofs:false}],
['חתך – תאי המערב','חתך מזרחי דרך תאי המערב (3 + 3 + 2) עם תכולתם, הגגות מוסתרים.','משנה, מידות ד:ג–ז',[-100,40,ZC+0.1],[-158,16,ZC],null,{cut:'x',v:-153.4,roofs:false}],
['בתוך ההיכל','מנורה בדרום, שולחן הלחם בצפון ומזבח הזהב באמצע לפני הפרוכת. ההיכל 40 אמה אורך על 20 רוחב; הקירות מצופים זהב.','משנה, מידות ד:ז · תמיד ג:ו',[-72,28,-45],[-110,26,ZC],[-90,ZC,270]],
['קודש הקדשים','20×20 אמה, נפרד בשתי פרוכות ובאמה ביניהן. בבית שני לא היה ארון, ועמדה "אבן שתיה" בגובה שלושה אצבעות. (לעומת בית ראשון: ארון הברית וכרובי עשר האמות – ראו תיבת הסימון "ארון הברית".)','משנה, מידות ד:ז · יומא ה:ב',[-120,28,-47],[-140,25,ZC],[-130,ZC,270]]
];
const pl=$('places');let curBtn=null;
P.forEach(p=>{if(p[0]=='sec'){const d=document.createElement('div');d.className='sec';d.textContent=p[1];pl.appendChild(d);return}
 const b=document.createElement('button');b.textContent=p[0];b.onclick=()=>{goto(p);if(curBtn)curBtn.classList.remove('on');b.classList.add('on');curBtn=b};pl.appendChild(b)});

/* ---------- טיסה למקום ---------- */
let tw=null;
function fly(pos,tg,dur=1.8){tw={t:0,dur,p0:camera.position.clone(),t0:controls.target.clone(),p1:new T.Vector3(...pos),t1:new T.Vector3(...tg)}}
function goto(p){const [name,desc,src,cam,tg,wk,cut]=p;showCard(name,desc,src);
 if(cut){$('cut').value=cut.k||cut.cut;$('cutv').value=cut.v;$('lRoof').checked=cut.roofs;ROOFS.forEach(r=>r.visible=cut.roofs)}
 else{if($('cut').value){$('cut').value='';}if(!$('lRoof').checked){$('lRoof').checked=true;ROOFS.forEach(r=>r.visible=true)}}
 applyCut();
 if(walk){if(wk)teleport(wk[0],wk[1],wk[2],wk[3]);return}
 fly(cam,tg);pendingWalk=wk}
let pendingWalk=null;
function showCard(t,d,s){$('cT').textContent=t;$('cD').textContent=d;$('cS').textContent='מקור: '+s;$('card').style.display='block'}
$('cardX').onclick=()=>$('card').style.display='none';
$('bAbout').onclick=()=>$('about').style.display='flex';

/* ---------- טיול ברגל ---------- */
let walk=false,px=0,pz=0,yaw=0,pitch=0,py=3.4;const EYE=3.4,RAD=1.1,keys={};
let pfl=0;   // מפלס הרצפה הנוכחי של ההולך (לבחירת שכבה תת־קרקעית ב-floorY)
function teleport(x,z,yd,fl){px=x;pz=z;yaw=yd*Math.PI/180;pitch=0;pfl=fl===undefined?floorY(x,z):floorY(x,z,fl);py=pfl+EYE}
function setWalk(on){walk=on;controls.enabled=!on;$('bWalk').textContent=on?'🛰️ חזרה למבט־על':'🚶 טיול ברגל';$('lookb').style.display=on?'flex':'none';$('hint').style.display=on?'block':'none';
 if(on){$('hint').textContent='W A S D · Shift מהר · גרירה להסתכלות · R/F או גלגלת: מעלה/מטה · Z ישר · Esc ליציאה';
  const w=pendingWalk||(()=>{const t=controls.target;return[t.x,t.z+10,0]})();let[x,z,y,fl]=w;teleport(x,z,y,fl);camera.rotation.order='YXZ'}
 else{const f=new T.Vector3(Math.sin(yaw),0,-Math.cos(yaw));camera.rotation.set(0,0,0);const fy=(Math.abs(px)<252&&Math.abs(pz)<252&&pfl<0)?0:floorY(px,pz,pfl>0&&floorY(px,pz)<-5?pfl:undefined);controls.target.set(px,fy,pz);camera.position.set(px-f.x*60,fy+45,pz-f.z*60);controls.update()}}
$('bWalk').onclick=()=>setWalk(!walk);
addEventListener('keydown',e=>{keys[e.code]=1;if(e.code=='Escape'){if(mapOpen)openMap(false);else if(kidOpen)openKids(false);else if(walk)setWalk(false)}if(e.code=='KeyH'){['side','ctl','mini'].forEach(i=>{const d=$(i);d.style.display=d.style.display=='none'?'':'none'})}});
addEventListener('keyup',e=>keys[e.code]=0);
let drag=false,lx=0,ly=0;const cvs=renderer.domElement;
cvs.addEventListener('pointerdown',e=>{if(walk){drag=true;lx=e.clientX;ly=e.clientY;cvs.setPointerCapture(e.pointerId)}});
cvs.addEventListener('pointermove',e=>{if(walk&&drag){yaw+=(e.clientX-lx)*.0042;pitch=Math.max(-1.3,Math.min(1.3,pitch-(e.clientY-ly)*.0042));lx=e.clientX;ly=e.clientY}});
cvs.addEventListener('pointerup',()=>drag=false);
cvs.addEventListener('wheel',e=>{if(walk){e.preventDefault();pitch=Math.max(-1.5,Math.min(1.5,pitch-Math.sign(e.deltaY)*.12))}},{passive:false});
[['lkU','KeyR'],['lkD','KeyF']].forEach(([i,k])=>{const b=$(i);['pointerdown'].forEach(ev=>b.addEventListener(ev,e=>{keys[k]=1;e.preventDefault()}));['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,()=>keys[k]=0))});
const blocked=(x,z,f)=>{for(const c of COL)if(!(c[6]&&!c[6].visible)&&f+1<c[5]&&f+4>c[4]&&x>c[0]-RAD&&x<c[1]+RAD&&z>c[2]-RAD&&z<c[3]+RAD)return true;return false};
const inBounds=(x,z)=>Math.abs(x)<3200&&Math.abs(z)<3200;
function stepWalk(dt){if(keys.KeyR||keys.PageUp)pitch=Math.min(1.5,pitch+1.5*dt);if(keys.KeyF||keys.PageDown)pitch=Math.max(-1.5,pitch-1.5*dt);if(keys.KeyZ)pitch*=Math.max(0,1-6*dt);const sp=(keys.ShiftLeft||keys.ShiftRight?42:13)*dt,f=floorY(px,pz,pfl);
 let fw=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0),sd=(keys.KeyD?1:0)-(keys.KeyA?1:0);
 if(keys.ArrowLeft)yaw-=1.6*dt;if(keys.ArrowRight)yaw+=1.6*dt;
 const dx=(Math.sin(yaw)*fw+Math.cos(yaw)*sd)*sp,dz=(-Math.cos(yaw)*fw+Math.sin(yaw)*sd)*sp;
 if(dx||dz){const bad=(x,z,f0)=>{const nf=floorY(x,z,f0);return blocked(x,z,f0)||!inBounds(x,z)||nf-f0>3.5||f0-nf>6};let nx=px+dx;if(!bad(nx,pz,f))px=nx;const nz=pz+dz;if(!bad(px,nz,floorY(px,pz,f)))pz=nz}
 pfl=floorY(px,pz,f);const ty=pfl+EYE;py+=(ty-py)*Math.min(1,dt*14);camera.position.set(px,py,pz);camera.rotation.set(pitch,-yaw,0)}

/* ---------- תוויות ומיני־מפה ---------- */
const vv=new T.Vector3(),rc=new T.Raycaster(),occ=[];
const vis=o=>{for(;o;o=o.parent)if(!o.visible)return false;return true};
const catOf=g=>g=='mount'||g=='stoa'?'mount':(g=='chel'||g=='nashim'||g=='azarah')?'courts':g=='hekhal'?'hek':'city';
LBL.forEach(L=>L.cat=catOf(L.g));
scene.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry.type=='BoxGeometry')occ.push(o)});
document.querySelectorAll('.lc').forEach(c=>c.onchange=()=>lblCat[c.dataset.c]=c.checked?1:0);
$('lblMode').onchange=e=>lblMode=e.target.value;$('lblSize').oninput=e=>lblSize=+e.target.value;
let lblFrame=0;
function updLabels(){const W=innerWidth,H=innerHeight;lblFrame++;const cand=[];
 for(const L of LBL){let ok=lblMode!='off'&&lblCat[L.cat]&&vis(GRP[L.g]);if(ok&&lblMode=='main'&&!L.big)ok=false;
  if(ok){vv.set(L.x,L.y,L.z);const d=camera.position.distanceTo(vv);vv.project(camera);L.d=d;L.sx=(vv.x*.5+.5)*W;L.sy=(-vv.y*.5+.5)*H;
   ok=vv.z<1&&d<L.r&&d>3&&L.sx>-20&&L.sx<W+20&&L.sy>10&&L.sy<H+10;if(ok)cand.push(L)}
  if(!ok&&L.shown){L.el.style.display='none';L.shown=0}}
 if(lblFrame%6==0){const cams=camera.position;for(const L of cand.slice(0,40)){vv.set(L.x,L.y,L.z);const dir=vv.clone().sub(cams),dist=dir.length();rc.set(cams,dir.normalize());rc.far=dist-2;const hits=rc.intersectObjects(occ,false);L.hid=hits.length>0&&hits[0].distance<dist-2.5}}
 cand.sort((a,b)=>(b.big-a.big)||(a.d/a.r-b.d/b.r));const placed=[],fs=lblSize;let n=0;
 for(const L of cand){let show=!L.hid&&n<(lblMode=='main'?14:24);
  const w=L.el.textContent.length*fs*.58+14,x=L.sx-w/2,y=L.sy-fs*2.2;
  if(show&&placed.some(q=>x<q[2]&&x+w>q[0]&&y<q[3]&&y+fs+8>q[1]))show=false;
  if(show){placed.push([x,y,x+w,y+fs+8]);n++;L.el.style.fontSize=(L.big?fs+2:fs)+'px';L.el.style.opacity=Math.max(.25,Math.min(1,(L.r-L.d)/(L.r*.35)));
   L.el.style.transform='translate('+L.sx+'px,'+L.sy+'px) translate(-50%,-120%)';if(!L.shown){L.el.style.display='block';L.shown=1}}
  else if(L.shown){L.el.style.display='none';L.shown=0}}}
const mc=$('map'),mx=mc.getContext('2d'),MS=190/560,mp=(x,z)=>[(x+280)*MS,(z+280)*MS];
function drawMap(){mx.clearRect(0,0,190,190);mx.fillStyle='#2a3a52';mx.fillRect(0,0,190,190);
 const R=(x0,x1,z0,z1,c,s)=>{const a=mp(x0,z0),b=mp(x1,z1);if(s){mx.strokeStyle=c;mx.strokeRect(a[0],a[1],b[0]-a[0],b[1]-a[1])}else{mx.fillStyle=c;mx.fillRect(a[0],a[1],b[0]-a[0],b[1]-a[1])}};
 R(-250,250,-250,250,'#b9aa88');R(-190,167,-140,25,'#8a7a58',1);R(17,152,-125,10,'#d8c9a6');R(-175,12,-125,10,'#e8dcc0');R(-164,-64,ZC-50,ZC+50,'#f3efe6');R(-42,-10,-77,-45,'#7a4a3a');
 R(-170,-70,ZC-35,ZC+35,'#fff6d0');
 const c=walk?[px,pz]:[camera.position.x,camera.position.z],a=mp(Math.max(-270,Math.min(270,c[0])),Math.max(-270,Math.min(270,c[1])));
 const dir=new T.Vector3();camera.getWorldDirection(dir);const ang=Math.atan2(dir.z,dir.x);mx.fillStyle='#ff4a4a';mx.beginPath();mx.moveTo(a[0]+Math.cos(ang)*8,a[1]+Math.sin(ang)*8);
 mx.lineTo(a[0]+Math.cos(ang+2.5)*5,a[1]+Math.sin(ang+2.5)*5);mx.lineTo(a[0]+Math.cos(ang-2.5)*5,a[1]+Math.sin(ang-2.5)*5);mx.fill()}
mc.onclick=e=>{const r=mc.getBoundingClientRect(),x=(e.clientX-r.left)/MS-280,z=(e.clientY-r.top)/MS-280;
 if(walk){if(inBounds(x,z))teleport(x,z,yaw*180/Math.PI)}else{const d=controls.target.clone().sub(camera.position);controls.target.set(x,0,z);camera.position.set(x,0,z).sub(d)}}

/* ---------- אנימציה ---------- */
const clock=new T.Clock();let fr=0;
function loop(){requestAnimationFrame(loop);if(mapOpen||kidOpen)return;const dt=Math.min(.05,clock.getDelta()),t=clock.elapsedTime;
 if(tw){tw.t+=dt/tw.dur;const k=Math.min(1,tw.t),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;camera.position.lerpVectors(tw.p0,tw.p1,e);controls.target.lerpVectors(tw.t0,tw.t1,e);if(k>=1)tw=null}
 SV.update(dt);if(walk)stepWalk(dt);else controls.update();
 LIFE.update(dt,t);CROWD.update(t,dt);ambUpdate&&ambUpdate(t,dt);
 fires.forEach((f,i)=>{f.scale.set(1+.15*Math.sin(t*9+i),1+.3*Math.sin(t*7+i*2),1+.15*Math.cos(t*8+i));f.rotation.y=t*2+i});
 smoke.forEach(s=>{const p=(t*.045+s.userData.p)%1;s.position.set(-26+Math.sin(p*9+s.userData.p*20)*1.6*p,YA+16+p*120,-43+Math.cos(p*7)*1.4*p);const sc=6+p*26;s.scale.set(sc,sc,1);s.material.opacity=.55*(1-p)*Math.min(1,p*8)});
 updLabels();if(++fr%4==0)drawMap();
 renderer.render(scene,camera)}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
renderer.setSize(innerWidth,innerHeight);setTime(11);applyCut();
PERIODS.forEach((p,i)=>{const o=document.createElement('option');o.value=i;o.textContent=p.n+' ('+p.yr+')';$('per').appendChild(o)});
function setPeriod(i){curPer=+i;PGS.forEach(g=>{const u=g.userData;g.visible=curPer>=u.min&&curPer<=u.max});$('per').value=curPer;const P0=PERIODS[curPer];$('perChip').textContent='תקופה: '+P0.n+' · '+P0.yr+' – לחצו למפה';mapRefresh();renderer.shadowMap.needsUpdate=true;if(!mapOpen)showCard(P0.n+' · '+P0.yr,P0.txt+' '+P0.tem,'יוספוס · משנה · ממצאים ארכאולוגיים')}
$('per').onchange=e=>setPeriod(e.target.value);
/* דף כניסה: בחירת מסלול */
{const L=$('landing'),hide=()=>{L.classList.add('out');setTimeout(()=>{if(L.classList.contains('out'))L.style.display='none'},650)};
 const act={model:()=>{},tours:()=>SV.show(true),walk:()=>setWalk(true),map:()=>openMap(true),kids:()=>openKids(true),about:()=>{$('about').style.display='flex'},
  ark:()=>{const c=$('lArk');c.checked=true;c.onchange();const i=P.findIndex(p=>p[0]=='קודש הקדשים');if(i>=0)goto(P[i])}};
 if(typeof LAND_ICONS!='undefined')L.querySelectorAll('[data-go]').forEach(b=>{const u=LAND_ICONS[b.dataset.go],ic=b.querySelector('.ic');if(!u||!ic)return;ic.innerHTML=u;ic.classList.add('im')});   /* SVG מוטמע (עובר נטפרי); האימוג'י נשאר אם האיור חסר */
 L.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{const k=b.dataset.go;if(k!='about')hide();act[k]()});
 $('ldMus').onclick=()=>{AUD.setMusic(!AUD.music)};
 $('bHome').onclick=()=>{L.style.display='flex';setTimeout(()=>L.classList.remove('out'),30)}}
SV.build();$('bSvc').onclick=()=>SV.show(true);$('load').style.display='none';goto(P[1]);setPeriod(5);loop();
window.__dbg={scene,camera,controls,goto,P,setWalk,teleport,floorY,get walk(){return walk}};
