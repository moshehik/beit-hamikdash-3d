/* ---------- זום־אאוט קולנועי + מסע השעיר (יום הכיפורים) ----------
   steps של סדר העבודה עם  world:'garb'  – המצלמה עולה מעל ירושלים ורואים מפת אזור (לים התיכון עד הודו) עם חיצים מפלוסין (מצרים) ומהנדווין (הודו) אל ירושלים;
   steps עם  world:'ris'  – מסע השעיר: אבני מיל 1–12, עשר הסוכות, הצוק, ולוח התקדמות "מיל X מתוך 12" (90 ריס = 12 מיל; ריס = 1/7.5 מיל).
   קנה המידה של המפה: מעלה אחת = 1000 יחידות (לא קנה המידה של הדגם – זה קולנוע), ירושלים (35.2E, 31.8N) = הראשית.
   הקורא: services.js → WORLD.hook(step) בתחילת כל שלב, WORLD.hook(null) בסגירת הסיור. */
const WORLD=(()=>{
 const K=1000,J=[35.2,31.8],BOX=typeof WORLD_MAP_BOX!='undefined'?WORLD_MAP_BOX:[10,90,-5,52,1920,1368];
 const wx=lon=>(lon-J[0])*K,wz=lat=>-(lat-J[1])*K;
 const PEL=[wx(32.55),wz(31.05)],IND=[wx(72.8),wz(20.8)],JER=[0,0];
 let gOn=false,rOn=false,built=false,G=null,R=null,plane=null,arcs=[],movers=[],labels=[],hud=null,fog0=null,lastNF='';
 const $$=id=>document.getElementById(id);
 function label(lines,opt){opt=opt||{};const c=document.createElement('canvas'),x=c.getContext('2d'),fs=opt.fs||64,pad=26,lh=fs*1.25;
  x.font='700 '+fs+'px Heebo,Arial,sans-serif';let w=0;lines.forEach((l,i)=>{x.font=(i==0?'800 ':'600 ')+(i==0?fs:fs*.62)+'px Heebo,Arial,sans-serif';w=Math.max(w,x.measureText(l).width)});
  const h=lines.length==1?lh:lh+(lines.length-1)*fs*.8;c.width=Math.ceil(w+pad*2);c.height=Math.ceil(h+pad*1.2);
  x.fillStyle=opt.bg||'rgba(40,28,10,.82)';const r=26,W=c.width,H=c.height;x.beginPath();x.moveTo(r,0);x.arcTo(W,0,W,H,r);x.arcTo(W,H,0,H,r);x.arcTo(0,H,0,0,r);x.arcTo(0,0,W,0,r);x.fill();
  x.strokeStyle=opt.border||'#e8c068';x.lineWidth=4;x.stroke();x.direction='rtl';x.textAlign='center';x.textBaseline='middle';
  lines.forEach((l,i)=>{x.font=(i==0?'800 ':'600 ')+(i==0?fs:fs*.62)+'px Heebo,Arial,sans-serif';x.fillStyle=i==0?(opt.color||'#ffe9a8'):'#f1e4c4';x.fillText(l,W/2,i==0?pad*.6+lh/2:pad*.6+lh+(i-1)*fs*.8+fs*.35)});
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;const m=new THREE.SpriteMaterial({map:t,transparent:true,depthTest:opt.depthTest!=null?opt.depthTest:false,fog:false});
  const s=new THREE.Sprite(m);s.userData.ar=c.width/c.height;s.renderOrder=30;return s}
 const beam=(x,z,col,h)=>{const g=new THREE.Group(),m=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.55,fog:false,depthWrite:false});
  const b=new THREE.Mesh(new THREE.CylinderGeometry(70,70,h,16,1,true),m);b.position.set(x,h/2-60,z);g.add(b);
  const r=new THREE.Mesh(new THREE.RingGeometry(260,340,40),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.9,fog:false,side:THREE.DoubleSide}));r.rotation.x=-Math.PI/2;r.position.set(x,-50,z);r.userData.pulse=1;g.add(r);return g};
 function arc(a,b,col,hMul){const A=new THREE.Vector3(a[0],40,a[1]),B=new THREE.Vector3(b[0],40,b[1]),L=A.distanceTo(B),M=A.clone().lerp(B,.5);M.y=L*(hMul||.22);
  const cv=new THREE.QuadraticBezierCurve3(A,M,B),tube=new THREE.Mesh(new THREE.TubeGeometry(cv,80,230,8,false),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.95,fog:false}));
  const cones=[];for(let i=0;i<7;i++){const c=new THREE.Mesh(new THREE.ConeGeometry(520,1200,10),new THREE.MeshBasicMaterial({color:0xffffff,fog:false}));c.userData={cv,o:i/7,sp:L<6000?.10:.05};cones.push(c);G.add(c)}
  G.add(tube);return{cv,cones}}
 function build(){if(built)return;built=true;
  G=new THREE.Group();G.visible=false;G.name='worldCine';
  const w=(BOX[1]-BOX[0])*K,h=(BOX[3]-BOX[2])*K,cx=((BOX[0]+BOX[1])/2-J[0])*K,cz=-(((BOX[2]+BOX[3])/2)-J[1])*K;
  const mat=new THREE.MeshBasicMaterial({color:0x9ec4d6,transparent:true,opacity:0,fog:false,depthWrite:false});
  plane=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat);plane.rotation.x=-Math.PI/2;plane.position.set(cx,-90,cz);plane.renderOrder=-5;G.add(plane);
  const applyTex=()=>{if(typeof MAP_IMG=='undefined'||!MAP_IMG.world||mat.map)return false;try{const s=atob(MAP_IMG.world),a=new Uint8Array(s.length);for(let i=0;i<s.length;i++)a[i]=s.charCodeAt(i);
    const im=new Image();im.onload=()=>{const t=new THREE.Texture(im);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;t.needsUpdate=true;mat.map=t;mat.color.set(0xffffff);mat.needsUpdate=true};im.src=URL.createObjectURL(new Blob([a],{type:'image/webp'}));return true}catch(e){return false}};
  G.userData.tex=applyTex;
  G.add(beam(JER[0],JER[1],0xffd45a,3200),beam(PEL[0],PEL[1],0x4fd1c5,2600),beam(IND[0],IND[1],0xff9a4a,2600));
  const e=arc(PEL,JER,0x39c5bb,1.1),i=arc(IND,JER,0xff8a3d,.16);arcs=[e,i];e.cones.concat(i.cones).forEach(c=>movers.push(c));
  e.cones.forEach(c=>c.material.color.set(0xb8fff6));i.cones.forEach(c=>c.material.color.set(0xffe0b8));
  const L=[[JER,['ירושלים','בית המקדש'],'#ffe9a8',1500],[PEL,['פלוסין (מצרים)','בד פשתן מצרי משובח','בשחר: 12 מנה (ר׳ מאיר) · 18 מנה (חכמים)'],'#9ff5ec',1700],
   [IND,['הנדווין (הודו)','בד פשתן הודי','בין הערביים: 800 זוז (ר׳ מאיר) · 12 מנה (חכמים)'],'#ffd2a0',1700],
   [[wx(30),wz(27)],['מצרים'],'#fff',0,'s'],[[wx(78),wz(22)],['הודו'],'#fff',0,'s'],[[wx(44.4),wz(33.3)],['בבל'],'#fff',0,'s'],[[wx(22),wz(35)],['הים התיכון'],'#cfe6f2',0,'s'],[[wx(46),wz(24)],['ערב'],'#fff',0,'s']];
  L.forEach(([p,lines,col,y,sm])=>{const s=label(lines,{fs:sm?44:64,color:col,bg:sm?'rgba(40,28,10,.55)':null});s.position.set(p[0]+(lines[0]=='ירושלים'?2500:(lines[0].indexOf('הנדווין')==0?-2500:0)),y||350,p[1]+(lines[0]=='ירושלים'?-3400:(lines[0].indexOf('פלוסין')==0?3800:(lines[0].indexOf('הנדווין')==0?-3200:0))));s.userData.big=!sm;s.userData.base=1;G.add(s);labels.push(s)});
  scene.add(G);
  /* ----- מסע השעיר ----- */
  R=new THREE.Group();R.visible=false;R.name='risRoute';
  const AZ=AZAZEL,stone=new THREE.MeshStandardMaterial({color:0xcfc3a4,roughness:1}),ped=new THREE.CylinderGeometry(.9,1.3,5,10);
  const pl=(x,lines,y,sc,opt)=>{const z=AZ.pz(x),s=label(lines,Object.assign({fs:56,depthTest:true},opt||{}));const ty=terrH(x,z-6);s.position.set(x,ty+y,z-6);s.userData.w=sc;R.add(s);return s};
  for(let k=0;k<=12;k++){const x=1380+109*k,z=AZ.pz(x)-6,m=new THREE.Mesh(ped,stone);m.position.set(x,terrH(x,z)+2.5,z);R.add(m);pl(x,['מיל '+k],11,9,{fs:60,bg:'rgba(60,45,20,.78)'})}
  AZ.booths.forEach((b,i)=>{const s=pl(b.x,['סוכה '+(i+1)],20,14,{fs:68,color:'#ffd9a0',bg:'rgba(120,60,20,.82)',border:'#ffb066'});s.userData.big=1});
  {const s=pl(AZ.cliff[0],['הצוק (בית חדודו)'],26,22,{fs:64,color:'#ffb0a0',bg:'rgba(90,20,15,.85)',border:'#ff8a7a'});s.userData.big=1}
  {const s=pl(722,['מגשר הר המשחה'],24,22,{fs:60});s.userData.big=1}
  {const pts=AZ.path.map(p=>new THREE.Vector3(p[0],terrH(p[0],p[1])+1.2,p[1]));const cv=new THREE.CatmullRomCurve3(pts);R.add(new THREE.Mesh(new THREE.TubeGeometry(cv,260,2.6,6,false),new THREE.MeshBasicMaterial({color:0xffa84a,fog:false})))}
  scene.add(R);
  /* לוח התקדמות */
  hud=document.createElement('div');hud.id='ykHud';hud.setAttribute('role','status');hud.style.cssText='position:fixed;top:92px;left:50%;transform:translateX(-50%);z-index:44;background:rgba(40,28,10,.88);color:#f6e6bd;border:2px solid #e8c068;border-radius:16px;padding:8px 18px;font:700 17px system-ui,sans-serif;direction:rtl;display:none;text-align:center;min-width:260px';
  hud.innerHTML='<div id="ykHudT">מסע השעיר המשתלח</div><div id="ykHudB" style="height:8px;background:#5a4524;border-radius:6px;margin:6px 0;overflow:hidden"><div id="ykHudF" style="height:100%;width:0;background:linear-gradient(90deg,#e8c068,#ff8a5a)"></div></div><div id="ykHudS" style="font-weight:600;font-size:14px"></div>';document.body.appendChild(hud)}
 /* ----- כל פריים ----- */
 let t0=performance.now();
 function frame(){requestAnimationFrame(frame);
  const y=camera.position.y;
  if(!built&&!gOn&&!rOn)return;
  if(built){const high=gOn&&y>400;
   if(G){G.visible=gOn;if(plane){const o=Math.max(0,Math.min(1,(y-300)/2200));plane.material.opacity=o;plane.visible=o>0;if(!plane.material.map&&G.userData.tex&&!G.userData.texTried){if(G.userData.tex())G.userData.texTried=1}}}
   if(R)R.visible=rOn;
   /* הרחבת מגבלות הבקרה/מצלמה/ערפל כשהמצלמה גבוהה (קולנוע) */
   const wantMax=gOn?160000:6500;if(controls.maxDistance!==wantMax&&(wantMax>6500||y<5000))controls.maxDistance=wantMax;
   const nf=(gOn&&y>1200)?(Math.max(.3,y*.004)+'|'+Math.max(8000,Math.min(260000,y*8))):'.3|8000';
   if(nf!==lastNF){lastNF=nf;const p=nf.split('|');camera.near=+p[0];camera.far=+p[1];camera.updateProjectionMatrix()}
   if(scene.fog){if(!fog0)fog0=[scene.fog.near,scene.fog.far];if(gOn&&y>300){scene.fog.near=fog0[0]+(y-300)*60;scene.fog.far=fog0[1]+(y-300)*200}else{scene.fog.near=fog0[0];scene.fog.far=fog0[1]}}
   if(gOn&&G.visible){const tt=(performance.now()-t0)/1000;
    movers.forEach(c=>{const u=c.userData,t=(tt*u.sp+u.o)%1,p=u.cv.getPointAt(t),tg=u.cv.getTangentAt(t);c.position.copy(p);c.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),tg)});
    G.traverse(o=>{if(o.userData.pulse){const k=1+.35*Math.sin(tt*3);o.scale.set(k,k,1)}});
    labels.forEach(s=>{const d=camera.position.distanceTo(s.position),h=d*.052*(s.userData.big?1.2:.8);s.scale.set(h*s.userData.ar,h,1)})}
   if(rOn&&R.visible)R.traverse(o=>{if(o.isSprite&&o.userData.w){const d=camera.position.distanceTo(o.position),h=Math.max(o.userData.w/o.userData.ar,d*(o.userData.big?.032:.02));o.scale.set(h*o.userData.ar,h,1)}})}
  if(hud){const on=rOn&&typeof SV!='undefined'&&SV.S&&SV.S.actors&&SV.S.actors.ai;hud.style.display=on?'block':'none';
   if(on){const A=SV.S.actors.ai,mil=Math.max(0,Math.min(12,(A.x-1380)/109)),bn=Math.max(0,Math.min(10,Math.floor((A.x-1380)/131+1)));
    $$('ykHudF').style.width=(mil/12*100)+'%';$$('ykHudS').innerHTML='כ־'+mil.toFixed(1)+' מיל מתוך 12 · כ־'+Math.round(mil*7.5)+' ריס מתוך 90 · סוכה '+bn+' מתוך 10<div style="font-weight:400;font-size:12px;opacity:.8">המרחק בדגם מכווץ; המיקומים משוערים</div>'}}}
 requestAnimationFrame(frame);
 function hook(st){const w=st&&st.world||null;gOn=w=='garb';rOn=w=='ris';if((gOn||rOn)&&!built){try{build()}catch(e){console.error('WORLD',e);gOn=rOn=false}}
  if(!gOn&&!rOn&&hud)hud.style.display='none'}
 return{hook,get gOn(){return gOn},get rOn(){return rOn},build,coords:{PEL,IND,JER}}})();
