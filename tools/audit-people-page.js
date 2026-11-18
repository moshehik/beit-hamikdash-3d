/* tools/audit-people-page.js – מוזרק לדף הדגם ע"י tools/audit-people.mjs (או נטען ידנית בדפדפן: <script src=...>).
   window.runAudit(opts) מריץ סימולציה של הקהל/כהנים/לויים (CROWD + ambUpdate) ובודק לכל דמות:
   (א) מרכזה אינו בתוך COL (חפיפה >0.25 בכל הצירים, אותו קריטריון גובה כמו blocked) ואינו חוצה קיר בין פריים לפריים (אמצע הצעד);
   (ב) אין קפיצות מיקום >2.5 יחידות בפריים; (ג) אין יצירה/השמדה גלויה: דמות שמופיעה/נעלמת כשהיא ברחק <250 בתוך חרוט הראייה של המצלמה ושלא ליד שער;
   (ד) אין scale חריג (צמיחה מהרצפה); (ה) אין דמות שעומדת במקום >60 דקות-דגם (בנפרד: ללא סיבה / עם סיבה = עבודה/משמר).
   opts: {days:[...], hours:24, rate:h/s, dt:s, jump:bool, warm:s, jumpSec:s, boost:v, cams:true}  – מחזיר אובייקט תוצאות (וגם window.__AUDIT). */
(function(){
const $=id=>document.getElementById(id);
// שערים (נקודות כניסה/יציאה – מחוץ לחומה, בפתח, ורגלי מעלות שערי העזרה/הנשים) – מוגדרות כאן במנותק מהקוד הנבדק
const GATES=[[258,-57.5],[247,-57.5],[10,258],[10,247],[40,258],[40,247],[-258,-100],[-247,-100],[-258,213],[-247,213],[-102,-258],[-102,-247],
 [-151,-154.5],[-121,-154.5],[-116,40],[-43,40],[-27,40],[-11,40],[84.5,-137],[84.5,22],[164,-57.5],[-151,-129],[-121,-129],[-116,13],[-43,13],[-27,13],[-11,13],[14.5,-57.5],[84.5,-127.5],[84.5,12.5],[154.5,-57.5]];
const GATE_R=16;
const EYES=[[-70,40,-30,-60,16,-65],[-10,25,-57,-100,16,-57],[90,20,-20,90,6,-90],[20,10,150,-20,0,0],[-120,30,-95,-30,16,-60],[200,12,-57,100,6,-57],[0,60,-60,-60,16,-60],[-60,6,60,-60,0,-60]];
let GRIDC=null;
function colGrid(){if(GRIDC)return GRIDC;GRIDC=new Map();COL.forEach(c=>{if(c[1]<-300||c[0]>300||c[3]<-300||c[2]>300)return;for(let a=Math.floor((c[0]+300)/16);a<=Math.floor((c[1]+300)/16);a++)for(let b=Math.floor((c[2]+300)/16);b<=Math.floor((c[3]+300)/16);b++){const k=a*64+b;let l=GRIDC.get(k);if(!l)GRIDC.set(k,l=[]);l.push(c)}});return GRIDC}
function insideCOL(x,y,z){const l=colGrid().get(Math.floor((x+300)/16)*64+Math.floor((z+300)/16));if(!l)return null;for(const c of l){if(c[6]&&!c[6].visible)continue;if(y+1<c[5]&&y+4>c[4]&&x>c[0]+.25&&x<c[1]-.25&&z>c[2]+.25&&z<c[3]-.25)return c}return null}
function nearGate(x,z){for(const g of GATES)if(Math.hypot(x-g[0],z-g[1])<GATE_R)return true;return false}
const FR=new THREE.Frustum(),PM=new THREE.Matrix4(),V=new THREE.Vector3();
function camSync(){camera.updateMatrixWorld();PM.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);FR.setFromProjectionMatrix(PM)}
function visibleNow(x,y,z){const c=camera.position,dx=x-c.x,dy=y+1.7-c.y,dz=z-c.z;if(dx*dx+dy*dy+dz*dz>62500)return false;return FR.containsPoint(V.set(x,y+1.7,z))}
const mx=(m,o)=>m[o]!==0||m[o+5]!==0||m[o+10]!==0;
/* איסוף ישויות: בגרסה החדשה CROWD.entities(); בגרסה הישנה (לפני) – סריקת מופעים/יחידות/people.js דרך window.__LEG שמוזרק בעותק הבדיקה */
function collect(){const M=new Map();
 if(typeof CROWD.entities=='function'){for(const e of CROWD.entities())M.set(String(e.uid),e);return M}
 const L=window.__LEG||{};
 for(const k in CROWD.POOLS){const P=CROWD.POOLS[k],m=P.robe.instanceMatrix.array;for(let i=0;i<P.hi;i++){if(!P.agents[i])continue;const o=i*16;if(!mx(m,o))continue;const a=P.agents[i];M.set('p:'+k+'#'+i,{id:a.sp&&a.sp.id,x:m[o+12],y:m[o+13],z:m[o+14],why:a.sp&&a.sp.rot?0:1,sc:Math.hypot(m[o],m[o+1],m[o+2]),mode:'at'})}}
 if(L.singles){for(const k in L.singles){const g=L.singles[k];if(g.visible)M.set('s:'+k,{id:k,x:g.position.x,y:g.position.y,z:g.position.z,why:1,sc:1,mode:'at'})}}
 if(L.lev)L.lev.forEach((ent,ei)=>{if(!ent.im.visible)return;const m=ent.im.instanceMatrix.array;for(let i=0;i<ent.pl.length;i++){const o=i*16;if(mx(m,o))M.set('l:'+ei+'#'+i,{id:'lev',x:m[o+12],y:m[o+13],z:m[o+14],why:1,sc:Math.hypot(m[o],m[o+1],m[o+2]),mode:'at'})}});
 [['w',L.walk&&L.walk.map(w=>w.p)],['t',L.trump],['f',window.__FIX]].forEach(([n,a])=>{(a||[]).forEach((p,i)=>{if(p&&p.visible)M.set(n+':'+i,{id:n+i,x:p.position.x,y:p.position.y,z:p.position.z,why:1,sc:1,mode:'at'})})});
 if(L.shofar&&L.shofar()&&L.shofar().visible){const p=L.shofar();M.set('shofar',{id:'shofar',x:p.position.x,y:p.position.y,z:p.position.z,why:1,sc:1,mode:'at'})}
 return M}
function matrixPresent(){let n=0;for(const k in CROWD.POOLS){const P=CROWD.POOLS[k],m=P.robe.instanceMatrix.array;for(let i=0;i<P.hi;i++)if(mx(m,i*16))n++}return n}
function newStats(){return{steps:0,entSum:0,entMax:0,create:0,createVis:0,createGate:0,createHidden:0,destroy:0,destroyVis:0,destroyGate:0,destroyHidden:0,jumps:0,jumpMax:0,insideCOL:0,seatedInside:0,insideIds:{},crossCOL:0,scaleBad:0,still60:0,still60why:0,still60nowhy:0,stillIds:{},samples:{createVis:[],destroyVis:[],jumps:[],insideCOL:[],still:[]}}}
function scanScale(st){for(const k in CROWD.POOLS){const P=CROWD.POOLS[k],m=P.robe.instanceMatrix.array;for(let i=0;i<P.hi;i++){const o=i*16;if(!mx(m,o))continue;const sc=Math.hypot(m[o],m[o+1],m[o+2]);if(sc<.55||sc>1.4)st.scaleBad++}}}
function sample(arr,o){if(arr.length<25)arr.push(o)}
function simulate(S,cfg,tag){
 // cfg: {day, h0, hours, rate, dt, label}
 const st=cfg.stats,dt=cfg.dt,rate=cfg.rate,steps=Math.round(cfg.hours/rate/dt);let t=cfg.t0||0,h=cfg.h0,prev=cfg.prev||null;const ms=[];
 const eyeIdx=cfg.eye0||0;
 for(let s=0;s<steps;s++){
  h=(h+rate*dt)%24;$('tm').value=h;
  // מצלמה: מסתובבת וגם מחליפה נקודת מבט כל 25 שניות
  if(cfg.cams!==false){const ei=(eyeIdx+Math.floor(t/25))%EYES.length,e=EYES[ei],yaw=t*.35;camera.position.set(e[0],e[1],e[2]);const dx=e[3]-e[0],dz=e[5]-e[2],r=Math.hypot(dx,dz)||1,a=Math.atan2(dz,dx)+Math.sin(t*.4)*1.3+ (cfg.spin?yaw:0);camera.lookAt(e[0]+Math.cos(a)*r,e[4],e[2]+Math.sin(a)*r)}
  camSync();const a0=performance.now();CROWD.update(t,dt);ambUpdate(t,dt);ms.push(performance.now()-a0);
  t+=dt;const cur=collect(),dMin=rate*dt*60;st.steps++;st.entSum+=cur.size;st.entMax=Math.max(st.entMax,cur.size);
  camSync();
  if(prev){
   for(const[k,e]of cur){const p=prev.get(k);
    if(!p){st.create++;const v=visibleNow(e.x,e.y,e.z),g=nearGate(e.x,e.z);if(v&&g)st.createGate++;else if(v){st.createVis++;sample(st.samples.createVis,{tag,k,id:e.id,x:+e.x.toFixed(1),y:+e.y.toFixed(1),z:+e.z.toFixed(1),t:+t.toFixed(1)})}else st.createHidden++}
    else{const d=Math.hypot(e.x-p.x,e.z-p.z,(e.y-p.y)*.5);if(d>2.5){st.jumps++;st.jumpMax=Math.max(st.jumpMax,d);sample(st.samples.jumps,{tag,k,id:e.id,d:+d.toFixed(1),x:+e.x.toFixed(1),z:+e.z.toFixed(1),y:+e.y.toFixed(1),dy:+(e.y-p.y).toFixed(2),mode:e.mode,pm:p.mode,t:+t.toFixed(1)})}
     const mxp=insideCOL((e.x+p.x)/2,(e.y+p.y)/2,(e.z+p.z)/2);if(mxp&&!insideCOL(e.x,e.y,e.z))st.crossCOL++}
    const c=insideCOL(e.x,e.y,e.z);if(c&&(e.seated||/^sanh(?!-sf)/.test(String(e.id)))){st.seatedInside++}else if(c){st.insideCOL++;const idk=String(e.id);st.insideIds[idk]=(st.insideIds[idk]||0)+1;sample(st.samples.insideCOL,{tag,id:e.id,x:+e.x.toFixed(1),y:+e.y.toFixed(1),z:+e.z.toFixed(1),col:c.slice(0,6).map(v=>+v.toFixed(1))})}
    // עמידה במקום: דקות-דגם ברצף בלי להתקדם >0.6 יחידות
    const q=p?(p.anc||(p.anc={x:p.x,z:p.z,m:0})):{x:e.x,z:e.z,m:0};e.anc=q;if(Math.hypot(e.x-q.x,e.z-q.z)>.6){q.x=e.x;q.z=e.z;q.m=0;q.done=false}else{q.m+=dMin;if(q.m>60&&!q.done){q.done=true;st.still60++;if(e.why)st.still60why++;else{st.still60nowhy++;sample(st.samples.still,{tag,id:e.id,k})}st.stillIds[e.id]=(st.stillIds[e.id]||0)+1}}}
   for(const[k,p]of prev){if(cur.has(k))continue;st.destroy++;const v=visibleNow(p.x,p.y,p.z),g=nearGate(p.x,p.z);if(v&&g)st.destroyGate++;else if(v){st.destroyVis++;sample(st.samples.destroyVis,{tag,k,id:p.id,x:+p.x.toFixed(1),y:+p.y.toFixed(1),z:+p.z.toFixed(1),t:+t.toFixed(1)})}else st.destroyHidden++}}
  prev=cur;
  if((s&7)==0)scanScale(st);
 }
 return{ms,t,h,prev}}
let CARRY=null;
async function runAudit(opts){opts=Object.assign({days:CROWD.DLIST,hours:24,rate:.1,dt:.2,jump:true,warm:30,jumpSec:20,boost:2.5,cams:true,fast:true},opts||{});
 if(!opts.days)opts.days=CROWD.DLIST;
 const R={opts,perDay:{},total:newStats(),perf:{},t0:Date.now()};
 if(CROWD.setBoost)CROWD.setBoost(opts.boost);if(CROWD.setBudget&&opts.fast)CROWD.setBudget(1e9,1e9,1e9);
 $('autoDay').checked=false;
 let guard=0;while(CROWD.ready===false&&guard++<400){$('tm').value=11;CROWD.update(guard*.05,.05);ambUpdate(guard*.05,.05)}
 const allMs=[];let pv=null;
 {$('dayType').value='chol';$('tm').value=11;const r=simulate(null,{stats:newStats(),h0:11,hours:opts.warm*.0001,rate:.0001,dt:opts.dt,cams:opts.cams},'init');pv=r.prev}
 for(const d of opts.days){const sel=$('dayType');sel.value=d;const S=newStats();let T=0;
  // חימום: מתחילים בחצות, מריצים זמן קפוא (הרצה מקדימה) כדי שההמון כבר במקומו
  $('tm').value=0;
  {const r=simulate(null,{stats:S,h0:0,hours:opts.warm*.0001,rate:.0001,dt:opts.dt,cams:opts.cams,prev:pv},d+':daychange');pv=r.prev}
  const cont=simulate(null,{stats:S,day:d,h0:0,hours:opts.hours,rate:opts.rate,dt:opts.dt,cams:opts.cams,eye0:0,prev:pv},d+':cont');allMs.push(...cont.ms);pv=cont.prev;
  if(opts.jump){for(let h=0;h<24;h+=(opts.jumpStep||1)){$('tm').value=h;const r=simulate(null,{stats:S,h0:h,hours:opts.jumpSec*.0001,rate:.0001,dt:opts.dt,cams:opts.cams,eye0:(h%EYES.length),prev:pv},d+':jump@'+h);allMs.push(...r.ms);pv=r.prev}}
  R.perDay[d]=S;for(const k in S){if(typeof S[k]=='number'&&k!='entMax'&&k!='jumpMax')R.total[k]+=S[k]}
  R.total.entMax=Math.max(R.total.entMax,S.entMax);R.total.jumpMax=Math.max(R.total.jumpMax,S.jumpMax);
  for(const k of ['createVis','destroyVis','jumps','insideCOL','still']){R.total.samples[k].push(...S.samples[k].slice(0,6))}
  for(const k in S.insideIds)R.total.insideIds[k]=(R.total.insideIds[k]||0)+S.insideIds[k];
  for(const k in S.stillIds)R.total.stillIds[k]=(R.total.stillIds[k]||0)+S.stillIds[k];
  await new Promise(r=>setTimeout(r,0))}
 allMs.sort((a,b)=>a-b);R.perf={avgMs:+(allMs.reduce((a,b)=>a+b,0)/allMs.length).toFixed(2),p95Ms:+allMs[allMs.length*.95|0].toFixed(2),maxMs:+allMs[allMs.length-1].toFixed(1),entAvg:Math.round(R.total.entSum/R.total.steps),entMax:R.total.entMax};
 R.sec=((Date.now()-R.t0)/1000)|0;window.__AUDIT=R;return R}
/* בדיקת ביצועים בתקציבי ברירת המחדל (כמו בשימוש חי): זמן עדכון ממוצע לפריים של CROWD.update+ambUpdate */
async function runPerf(opts){opts=Object.assign({day:'erev-pesach',h:16,sec:40,dt:1/30},opts||{});if(CROWD.setBudget)CROWD.setBudget(2.5,4,5);if(CROWD.setBoost)CROWD.setBoost(null);$('dayType').value=opts.day;$('tm').value=opts.h;$('autoDay').checked=false;
 camera.position.set(-70,40,-30);camera.lookAt(-60,16,-65);let t=0;const ms=[];for(let s=0;s<opts.sec/opts.dt;s++){camSync();const a=performance.now();CROWD.update(t,opts.dt);ambUpdate(t,opts.dt);ms.push(performance.now()-a);t+=opts.dt}
 const body=ms.slice(300);body.sort((a,b)=>a-b);return{day:opts.day,h:opts.h,ent:CROWD.entities?CROWD.entities().length:null,count:CROWD.count,avgMs:+(body.reduce((a,b)=>a+b,0)/body.length).toFixed(2),p95:+body[body.length*.95|0].toFixed(2),max:+body[body.length-1].toFixed(1),firstMs:ms.slice(0,40).map(v=>+v.toFixed(0))}}
window.runAudit=runAudit;window.runPerf=runPerf;window.__auditHelpers={collect,matrixPresent,insideCOL,nearGate,visibleNow};
})();
