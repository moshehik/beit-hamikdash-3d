/* ---------- ראש השנה: שכבת מפה וכתוביות לסיור "ראש השנה" (RHW) ----------
   • תוויות תלת־ממדיות במרחב הדגם (אמות) – step.rh.lb=[[טקסט,x,z,y,צבע?],...]
   • מסגרת ארץ ישראל במרחב העולם (1000 יח׳ למעלה, ירושלים = ראשית, כמו WORLD/ERETZ): משואות, שליחים, עיגולים, זוהר בבל – step.rh.land={...}
     אם קיים ERETZ (הדגם התלת־ממדי של הארץ, session אחר) – משתמשים בו; אחרת ציור מפה שטוחה פשוטה מ-LAND (geodata.js), מוזזת ב-OFFX כדי שלא תתערבב עם דגם ירושלים.
   • מצלמה: cam.rh={at:'sartaba'|[lat,lon],d,h,az,to?}  ← services.js (applyCam) קורא RHW.resolve
   • חיווי צלילי שופר (HUD): step.rh.hud={snd:'TRT..'} , או {note:'טקסט'}
   הקורא: services.js → RHW.hook(step) בתחילת כל שלב, RHW.hook(null) בסגירה. כל מצב נקבע מנתוני השלב בלבד (דטרמיניסטי – דילוג וחזרה בטוחים). */
const RHW=(()=>{
 const K=1000,J=[35.2,31.8],OFFX=250000;
 const PL={   /* [קו רוחב, קו אורך, שם, משוער?] */
  jer:[31.778,35.235,'ירושלים'],olives:[31.778,35.246,'הר המשחה'],sartaba:[32.113,35.396,'סרטבא'],grofina:[32.55,35.80,'גרופינא',1],hauran:[32.72,36.55,'חורן',1],baltin:[33.2,38.8,'בית בלתין',1],
  babel:[32.5,44.4,'בבל'],yavne:[31.878,34.742,'יבנה'],lod:[31.952,34.895,'לוד'],gerizim:[32.205,35.269,'הר גריזים'],jericho:[31.857,35.444,'יריחו'],tiberias:[32.79,35.53,'טבריה'],
  syria:[33.51,36.29,'סוריה'],beitshean:[32.50,35.50,'בית שאן'],hebron:[31.53,35.10,'חברון'],caesarea:[32.50,34.89,'קיסרין'],safed:[32.96,35.50,'גליל עליון'],beersheba:[31.25,34.79,'נגב'],
  ashkelon:[31.67,34.57,'אשקלון'],amman:[31.95,35.93,'עבר הירדן']};
 const have=()=>typeof ERETZ!='undefined'&&ERETZ&&ERETZ.loaded;
 const P=(ll)=>{if(typeof ll=='string')ll=PL[ll];if(have()){try{const p=ERETZ.pos(ll[0],ll[1]);return{x:p.x,y:p.y||0,z:p.z}}catch(e){}}return{x:(ll[1]-J[0])*K+OFFX,y:0,z:-(ll[0]-J[1])*K}};
 const $$=id=>document.getElementById(id);
 let cutNext=false,labR=null,built=false,RW=null,GR=null,landOn=false,spec=null,stn={},labT=null,tmpl=[],links=null,msgs=[],glows=[],rings=[],hud=null,fade=null,lastHave=false,saved=null,t0=performance.now(),stepT=0,hudSeq=null;
 /* ----- תוויות ----- */
 function label(lines,opt){opt=opt||{};lines=[].concat(lines);const c=document.createElement('canvas'),x=c.getContext('2d'),fs=opt.fs||56,pad=22,lh=fs*1.25;
  let w=0;lines.forEach((l,i)=>{x.font=(i==0?'800 ':'600 ')+(i==0?fs:fs*.62)+'px Heebo,Arial,sans-serif';w=Math.max(w,x.measureText(l).width)});
  const h=lines.length==1?lh:lh+(lines.length-1)*fs*.8;c.width=Math.ceil(w+pad*2);c.height=Math.ceil(h+pad*1.2);
  x.fillStyle=opt.bg||'rgba(40,28,10,.84)';const r=24,W=c.width,H=c.height;x.beginPath();x.moveTo(r,0);x.arcTo(W,0,W,H,r);x.arcTo(W,H,0,H,r);x.arcTo(0,H,0,0,r);x.arcTo(0,0,W,0,r);x.fill();
  x.strokeStyle=opt.border||'#e8c068';x.lineWidth=4;x.stroke();x.direction='rtl';x.textAlign='center';x.textBaseline='middle';
  lines.forEach((l,i)=>{x.font=(i==0?'800 ':'600 ')+(i==0?fs:fs*.62)+'px Heebo,Arial,sans-serif';x.fillStyle=i==0?(opt.color||'#ffe9a8'):'#f1e4c4';x.fillText(l,W/2,i==0?pad*.6+lh/2:pad*.6+lh+(i-1)*fs*.8+fs*.35)});
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false,fog:false}));
  s.userData.ar=c.width/c.height;s.renderOrder=40;s.frustumCulled=false;return s}
 const flameTex=(()=>{let t=null;return()=>{if(t)return t;const c=document.createElement('canvas');c.width=64;c.height=128;const x=c.getContext('2d'),g=x.createLinearGradient(0,128,0,0);g.addColorStop(0,'rgba(255,240,150,1)');g.addColorStop(.4,'rgba(255,150,30,.95)');g.addColorStop(.8,'rgba(225,70,10,.55)');g.addColorStop(1,'rgba(200,40,0,0)');x.fillStyle=g;
  x.beginPath();x.moveTo(32,0);x.bezierCurveTo(46,38,66,70,52,105);x.bezierCurveTo(45,126,19,126,12,105);x.bezierCurveTo(-2,70,18,38,32,0);x.fill();return t=new THREE.CanvasTexture(c)}})();
 const flame=(w,h,col)=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:flameTex(),transparent:true,depthWrite:false,depthTest:false,fog:false,color:col||0xffffff}));s.scale.set(w,h,1);s.userData.fl=[w,h];s.renderOrder=35;s.frustumCulled=false;return s};
 /* ----- מרחב הדגם: תוויות ----- */
 function setTLabels(list){if(labT){scene.remove(labT);labT.traverse(o=>{if(o.material){o.material.map&&o.material.map.dispose();o.material.dispose()}});labT=null}
  if(!list||!list.length)return;labT=new THREE.Group();labT.name='rhLabels';
  list.forEach(a=>{const s=label(a[0],{color:a[4],fs:a[5]||52});s.position.set(a[1],a[3]==null?8:a[3],a[2]);s.userData.t=1;labT.add(s)});scene.add(labT)}
 /* ----- מרחב העולם (ארץ ישראל) ----- */
 function build(){if(built)return;built=true;RW=new THREE.Group();RW.name='rhLand';RW.visible=false;scene.add(RW);
  Object.keys(PL).forEach(id=>{const p=PL[id],g=new THREE.Group(),big=['jer','olives','sartaba','grofina','hauran','baltin','babel','yavne'].includes(id);
   const pil=new THREE.Mesh(new THREE.CylinderGeometry(big?9:5,big?13:7,big?150:70,10,1,true),new THREE.MeshBasicMaterial({color:0xffc060,transparent:true,opacity:.5,fog:false,depthWrite:false}));pil.position.y=big?75:35;g.add(pil);
   const ring=new THREE.Mesh(new THREE.RingGeometry(big?26:14,big?38:22,32),new THREE.MeshBasicMaterial({color:0xffd070,transparent:true,opacity:.85,fog:false,side:THREE.DoubleSide,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.y=.8;g.add(ring);
   const lb=label([p[2]+(p[3]?' (משוער)':'')],{fs:big?60:46,color:p[3]?'#ffd2a0':'#ffe9a8'});lb.position.y=big?260:150;lb.userData.big=big;g.add(lb);
   const fl=[];for(let i=0;i<3;i++){const f=flame(big?120-i*24:70-i*14,big?260-i*38:160-i*24);f.position.set((i-1)*8,big?150:80,(i%2)*6);f.userData.by=f.position.y;f.visible=false;g.add(f);fl.push(f)}
   g.userData={ll:p,id,fl,lb,pil,ring,lit:0,want:0,wave:0};RW.add(g);stn[id]=g});
  links=new THREE.Group();RW.add(links);
  fade=document.createElement('div');fade.id='rhFade';fade.style.cssText='position:fixed;inset:0;background:#fff7e0;opacity:0;pointer-events:none;z-index:60;transition:none';document.body.appendChild(fade);
  hud=document.createElement('div');hud.id='rhHud';hud.setAttribute('role','status');hud.style.cssText='position:fixed;top:92px;left:50%;transform:translateX(-50%);z-index:44;background:rgba(40,28,10,.9);color:#f6e6bd;border:2px solid #e8c068;border-radius:16px;padding:10px 16px;font:700 16px system-ui,sans-serif;direction:rtl;display:none;text-align:center;max-width:92vw';document.body.appendChild(hud)}
 /* מפה שטוחה (גיבוי כשאין ERETZ): נוצרת פעם אחת מקו החוף ב-geodata.js */
 function groundFallback(){if(GR||typeof LAND=='undefined')return;GR=new THREE.Group();GR.name='rhGround';
  /* מפה שטוחה: ציור קו החוף (geodata LAND) על קנבס אחד – ים, יבשה, ים המלח, כנרת, ירדן – ומתיחתו על מישור; חיתוך ע״י הקנבס (לא משולשים) */
  const LA0=29,LA1=34.6,LO0=33.4,LO1=45.4,PX=100,W=Math.round((LO1-LO0)*PX),H=Math.round((LA1-LA0)*PX),cvs=document.createElement('canvas');cvs.width=W;cvs.height=H;const c=cvs.getContext('2d');
  const X=lo=>(lo-LO0)*PX,Y=la=>(LA1-la)*PX;c.fillStyle='#7fb0cc';c.fillRect(0,0,W,H);c.fillStyle='#e4d3a4';c.strokeStyle='#b89a62';c.lineWidth=1.2;
  /* LAND בנוי כזוגות [אורך,רוחב]; LAND[10] הוא קו החוף הלבנטי (מחוף סיני עד חוף סוריה) – סוגרים בפינות רחוקות כמו ב-kids.js */
  {const R0=LAND[10],n=R0.length/2;let i0=0,i1=n-1;for(let i=0;i<n;i++){if(Math.abs(R0[2*i]-33.13)<.001&&Math.abs(R0[2*i+1]-31.17)<.001){i0=i;break}}for(let i=i0;i<n;i++){if(Math.abs(R0[2*i]-36.03)<.001&&Math.abs(R0[2*i+1]-36.52)<.001){i1=i;break}}
   const pts=[];for(let i=i0;i<=i1;i++)pts.push([R0[2*i],R0[2*i+1]]);pts.push([46,36.52],[46,28],[25,28],[25,31.15]);
   c.beginPath();pts.forEach((q,i)=>{const x=X(q[0]),y=Y(q[1]);i?c.lineTo(x,y):c.moveTo(x,y)});c.closePath();c.fill();c.stroke()}
  const poly=(pts,col)=>{c.fillStyle=col;c.beginPath();pts.forEach((q,i)=>{const x=X(q[1]),y=Y(q[0]);i?c.lineTo(x,y):c.moveTo(x,y)});c.closePath();c.fill()};
  poly([[32.9,35.52],[32.84,35.6],[32.74,35.59],[32.7,35.53],[32.78,35.5]],'#7fb0cc');poly([[31.77,35.5],[31.5,35.54],[31.2,35.45],[31.05,35.4],[31.1,35.34],[31.4,35.4],[31.7,35.42]],'#7fb0cc');
  c.strokeStyle='#5a9cc0';c.lineWidth=2;c.beginPath();[[32.7,35.57],[32.4,35.55],[32.1,35.55],[31.85,35.52],[31.77,35.5]].forEach((q,i)=>{const x=X(q[1]),y=Y(q[0]);i?c.lineTo(x,y):c.moveTo(x,y)});c.stroke();
  c.strokeStyle='rgba(60,40,10,.18)';c.lineWidth=1;for(let la=Math.ceil(LA0);la<=LA1;la++){c.beginPath();c.moveTo(0,Y(la));c.lineTo(W,Y(la));c.stroke()}for(let lo=Math.ceil(LO0);lo<=LO1;lo++){c.beginPath();c.moveTo(X(lo),0);c.lineTo(X(lo),H);c.stroke()}
  const tex=new THREE.CanvasTexture(cvs);tex.encoding=THREE.sRGBEncoding;tex.anisotropy=8;
  const m=new THREE.Mesh(new THREE.PlaneGeometry((LO1-LO0)*K,(LA1-LA0)*K),new THREE.MeshBasicMaterial({map:tex,fog:false,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set(((LO0+LO1)/2-J[0])*K+OFFX,-3,-(((LA0+LA1)/2)-J[1])*K);m.renderOrder=-10;GR.add(m);
  scene.add(GR)}
 /* ----- מצב מפה ----- */
 function camParams(on){if(on){if(!saved)saved={near:camera.near,far:camera.far,max:controls.maxDistance,min:controls.minDistance};camera.near=2;camera.far=130000;camera.updateProjectionMatrix();controls.maxDistance=160000}
  else if(saved){camera.near=saved.near;camera.far=saved.far;controls.maxDistance=saved.max;controls.minDistance=saved.min;camera.updateProjectionMatrix();saved=null}}
 function flash(){if(!fade)return;fade.style.transition='none';fade.style.opacity=1;void fade.offsetWidth;fade.style.transition='opacity .9s ease-out';fade.style.opacity=0}
 function setLand(on,sp){const was=landOn;landOn=on;spec=on?sp:null;
  if(on&&!built)build();if(on){if(typeof ERETZ!='undefined'&&ERETZ&&!ERETZ.loaded&&ERETZ.load&&!ERETZ._ld){ERETZ._ld=1;try{ERETZ.load()}catch(e){}}if(!have())groundFallback();if(typeof ERETZ!='undefined'&&ERETZ&&!ERETZ.on&&ERETZ.show&&!ERETZ._rh){try{ERETZ.show({fly:false});ERETZ._rh=1}catch(e){}}}
  else if(was&&typeof ERETZ!='undefined'&&ERETZ&&ERETZ._rh){try{ERETZ.hide()}catch(e){}ERETZ._rh=0}
  if(built)RW.visible=on;if(GR)GR.visible=on&&!have();camParams(on);if(was!==on)flash();
  if(on)applyLand(sp)}
 function applyLand(sp){Object.keys(stn).forEach(id=>{const u=stn[id].userData;u.want=sp.lit&&sp.lit.includes(id)?1:0;u.wave=sp.wave==id?1:0;u.show=!sp.only||sp.only.includes(id)||u.want||sp.lit&&sp.lit.includes(id)||(sp.tags&&sp.tags.includes(id));stn[id].visible=!!u.show});
  /* קווים בין תחנות */
  while(links.children.length){const o=links.children.pop();o.geometry.dispose();o.material.dispose()}
  (sp.links||[]).forEach(l=>{const a=P(l[0]),b=P(l[1]);const cv=new THREE.CatmullRomCurve3([new THREE.Vector3(a.x,a.y+30,a.z),new THREE.Vector3((a.x+b.x)/2,Math.max(a.y,b.y)+60,(a.z+b.z)/2),new THREE.Vector3(b.x,b.y+30,b.z)]);
   links.add(new THREE.Mesh(new THREE.TubeGeometry(cv,40,l[2]||2.4,6,false),new THREE.MeshBasicMaterial({color:l[3]||0xffa84a,transparent:true,opacity:.9,fog:false})))});
  /* שליחים נעים (נקודות זוהרות) לאורך מסלולים */
  msgs.forEach(m=>RW.remove(m.o));msgs=[];
  (sp.msgs||[]).forEach(m=>{const pts=m.path.map(id=>P(id)),o=flame(m.s||22,m.s?m.s*1.8:40,m.col||0xbfffff);o.userData.ms=1;RW.add(o);msgs.push({o,pts,sp:m.sp||.06,off:m.off||0,n:m.n||1,col:m.col})});
  /* זוהר בבל */
  glows.forEach(g=>RW.remove(g));glows=[];
  if(sp.glow){const c=P(sp.glow),r=sp.glowR||260;for(let i=0;i<46;i++){const f=flame(30+Math.random()*30,60+Math.random()*60);const a=Math.random()*6.28,d=Math.sqrt(Math.random())*r;f.position.set(c.x+Math.cos(a)*d,c.y+40,c.z+Math.sin(a)*d);f.userData.ph=Math.random()*6;f.userData.baseP=f.position.clone();RW.add(f);glows.push(f)}}
  /* עיגולים (ירושלים וסביבתה וכו׳) */
  rings.forEach(g=>RW.remove(g));rings=[];
  (sp.rings||[]).forEach(r=>{const c=P(r[0]),m=new THREE.Mesh(new THREE.RingGeometry(r[1]-3,r[1],64),new THREE.MeshBasicMaterial({color:r[2]||0xffe08a,transparent:true,opacity:.9,fog:false,side:THREE.DoubleSide,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set(c.x,c.y+2,c.z);RW.add(m);rings.push(m)})}
 /* ----- HUD ----- */
 function setHud(h){if(!hud)return;hudSeq=null;if(!h){hud.style.display='none';return}
  if(h.note){hud.style.display='block';hud.innerHTML=h.note;return}
  if(h.snd){const W={T:['תקיעה',1.1,'#e8c068'],R:['תרועה',.8,'#ff9a5a'],S:['שברים',.9,'#8fd0ff'],Y:['יבבות',.7,'#d9a0ff']};
   hud.style.display='block';hud.innerHTML='<div style="font-size:13px;opacity:.85;margin-bottom:6px">'+(h.title||'')+'</div><div id="rhBars" style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap">'+[...h.snd].map((c,i)=>'<span data-i="'+i+'" style="display:inline-block;min-width:'+(W[c][1]*38)+'px;padding:6px 8px;border-radius:8px;background:#4a3a1c;color:#fff;opacity:.35;transition:.2s">'+W[c][0]+'</span>').join('')+'</div>';
   hudSeq={snd:[...h.snd].map(c=>W[c]),t:0,i:-1}}}
 /* ----- כל פריים ----- */
 function frame(){requestAnimationFrame(frame);const now=performance.now(),tt=(now-t0)/1000;
  if(built){const hv=have();if(hv!==lastHave){lastHave=hv;if(landOn){Object.keys(stn).forEach(id=>{});if(GR)GR.visible=!hv&&landOn;if(spec)applyLand(spec)}}}
  if(labT)labT.children.forEach(s=>{const d=camera.position.distanceTo(s.position),h=Math.max(1.5,d*.05);s.scale.set(h*s.userData.ar,h,1)});
  if(landOn&&built){
   Object.keys(stn).forEach(id=>{const g=stn[id],u=g.userData;if(!g.visible)return;const p=P(u.ll);g.position.set(p.x,p.y,p.z);u.lit+=(u.want-u.lit)*.08;
    u.fl.forEach((f,i)=>{f.visible=u.lit>.05;if(f.visible){const q=f.userData.fl,j=1+.16*Math.sin(tt*9+i*2)+.1*Math.cos(tt*13+i);f.scale.set(q[0]*j*u.lit,q[1]*(1+.2*Math.sin(tt*7+i))*u.lit,1);
      f.position.x=(i-1)*4+(u.wave?Math.sin(tt*3.2)*26*(i?.6:1):0);f.position.y=f.userData.by+(u.wave?Math.abs(Math.sin(tt*2.1))*14:0)}});
    u.ring.material.opacity=.45+.4*u.lit+.15*Math.sin(tt*3);
    const d=camera.position.distanceTo(g.position),h=Math.max(22,d*.045*(u.lb.userData.big?1.1:.85));u.lb.scale.set(h*u.lb.userData.ar,h,1)});
   msgs.forEach(m=>{const L=m.pts.length-1;if(L<1)return;const tot=m.pts.reduce((s,p,i)=>i?s+Math.hypot(p.x-m.pts[i-1].x,p.z-m.pts[i-1].z):0,0);
    const f=((tt*m.sp)+m.off)%1;let dist=f*tot,i=1;for(;i<m.pts.length;i++){const sg=Math.hypot(m.pts[i].x-m.pts[i-1].x,m.pts[i].z-m.pts[i-1].z);if(dist<=sg||i==m.pts.length-1)break;dist-=sg}
    const a=m.pts[i-1],b=m.pts[i],sg=Math.hypot(b.x-a.x,b.z-a.z)||1,k=Math.min(1,dist/sg);m.o.position.set(a.x+(b.x-a.x)*k,a.y+(b.y-a.y)*k+30+Math.sin(tt*10)*3,a.z+(b.z-a.z)*k);m.o.visible=true});
   glows.forEach(f=>{const q=f.userData.fl,j=1+.25*Math.sin(tt*5+f.userData.ph);f.scale.set(q[0]*j,q[1]*j,1)});
   const h0=camera.position.y;if(camera.far!=130000){camera.near=2;camera.far=130000;camera.updateProjectionMatrix()}
   if(controls.maxDistance<160000)controls.maxDistance=160000}
  if(hudSeq){hudSeq.t+=1/60;let acc=0,idx=-1;for(let k=0;k<hudSeq.snd.length;k++){acc+=hudSeq.snd[k][1]+.25;if(hudSeq.t*1<acc){idx=k;break}}
   if(idx<0)idx=hudSeq.t>acc+1.2?-2:hudSeq.snd.length-1;if(idx==-2){hudSeq.t=0;idx=0}
   if(idx!=hudSeq.i){hudSeq.i=idx;hud.querySelectorAll('#rhBars span').forEach((s,k)=>{s.style.opacity=k<idx?.7:k==idx?1:.35;s.style.background=k==idx?hudSeq.snd[k][2]:'#4a3a1c';s.style.color=k==idx?'#2a1c08':'#fff'})}}}
 requestAnimationFrame(frame);
 /* ----- מצלמה במרחב העולם ----- */
 function resolve(c){const r=c.rh,p0=typeof r.at=='string'||Array.isArray(r.at)?P(r.at):P('jer'),tg=r.to?P(r.to):p0,az=(r.az||0)*Math.PI/180,d=r.d||400,h=r.h||350;
  const sh=d*.22,t=[tg.x+Math.sin(az)*sh,tg.y+(r.ty||0),tg.z+Math.cos(az)*sh],pos=[p0.x+Math.sin(az)*d,Math.max(p0.y,tg.y)+h,p0.z+Math.cos(az)*d];
  const cut=camera.position.distanceTo(new THREE.Vector3(pos[0],pos[1],pos[2]))>20000;
  return{pos,tgt:t,fixed:true,dur:cut?.01:(c.dur||2.2)}}
 /* מיקום דמיית־המצלמה ("lf") במרחב העולם: הקורא מקבל [x,z,y] */
 const at=(ll)=>{const p=P(ll);return[p.x,p.z,p.y+20]};
 function setTRings(list){if(labR){scene.remove(labR);labR.traverse(o=>{o.geometry&&o.geometry.dispose();o.material&&o.material.dispose()});labR=null}
  if(!list||!list.length)return;labR=new THREE.Group();list.forEach(a=>{const m=new THREE.Mesh(new THREE.RingGeometry(a[2]-Math.max(.5,a[2]*.006),a[2],96),new THREE.MeshBasicMaterial({color:a[4]||'#e8c068',transparent:true,opacity:.85,fog:false,side:THREE.DoubleSide,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set(a[0],a[3]==null?9:a[3],a[1]);labR.add(m)});scene.add(labR)}
 function hook(st){const r=st&&st.rh||null;stepT=performance.now();if(landOn&&!(r&&r.land))cutNext=true;
  if(r&&(r.hud||r.land)&&!built)build();setTRings(r&&r.tr);setTLabels(r&&r.lb);if(!r){setLand(false);setHud(null);return}
  setLand(!!r.land,r.land||null);setHud(r.hud||null)}
 return{hook,resolve,at,P,PL,cut(){const c=cutNext;cutNext=false;return c},get on(){return landOn},hudSeq:()=>hudSeq}})();
