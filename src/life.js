/* ================= חיים בדגם: זמן רץ (יום ולילה בתנועה), שמש וירח, עננים, יונים, והכיור שיורד אל הבור בלילה =================
 הכל מתעדכן מ-LIFE.update(dt,t) שנקרא מלולאת האנימציה ב-ui.js.
 - זמן רץ: תיבת "זמן רץ" (#autoDay) + מהירות (#dayRate); משנה את סליידר השעה (#tm) וקורא ל-setTime(h) (תאורה, שמיים, כוכבים, לפידים).
   בזמן שנגן סדרי העבודה פתוח (LIFE.tour) הזמן נעצר ומוגדר לשעת הסדר (תמיד של שחר – לפני עלות השחר, וכו').
 - הכיור: משנה תמיד ג:ח / יומא ג:י – בן קטין עשה מוכני לכיור כדי שלא יפסלו מימיו בלינה: בלילה הוא מורד אל הבור, ובבוקר מעלים אותו (בערך 4:20–4:50 עולה, 18:25–19:05 יורד).
 - שמש וירח (לוחות זוהר שעוקבים אחר המצלמה), עננים נסחפים, להקת יונים מסתובבת מעל ההר (ביום). */
const LIFE=(()=>{
 const el=id=>document.getElementById(id);const tm=el('tm'),chk=el('autoDay'),sel=el('dayRate'),clk=el('clk');
 let H=+(tm&&tm.value)||11,hold=false,since=0;
 let tgt=null,hf=null;
 /* תמיד של שחר: חושך עד הפייסות והפתיחה, "ברקאי" – המזרח מתבהר, השחיטה לפני זריחה, ואחריה האור גדל (שמש במודל: זריחה 6:00) */
 const TSTEP={'tamid-shachar':i=>i<=10?4.5+i*.04:i==11?5.8:i<=14?5.9+(i-12)*.05:i<=17?6.05+(i-15)*.05:6.3+(i-18)*.09};
 const TOUR_H={'tamid-shachar':4.5,ketoret:6.4,menorah:6.2,'olat-behema':10.5,'olat-haof':10.5,'minchat-solet':10.5};
 const sm=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x)};
 const kiyorUp=h=>sm(3.6,4.35,h)-sm(18.4,19.1,h);   /* עולה לפני תחילת תמיד של שחר (במצגת: 4:30) */
 /* --- שמש/ירח --- */
 const glow=(stops,sz=128)=>{const c=document.createElement('canvas');c.width=c.height=sz;const x=c.getContext('2d'),g=x.createRadialGradient(sz/2,sz/2,0,sz/2,sz/2,sz/2);stops.forEach(([o,col])=>g.addColorStop(o,col));x.fillStyle=g;x.fillRect(0,0,sz,sz);const t=new T.CanvasTexture(c);return t};
 const tSun=glow([[0,'rgba(255,255,240,1)'],[.12,'rgba(255,248,210,1)'],[.22,'rgba(255,220,140,.55)'],[.5,'rgba(255,190,100,.14)'],[1,'rgba(255,180,80,0)']]);
 const tMoon=(()=>{const sz=128,c=document.createElement('canvas');c.width=c.height=sz;const x=c.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(235,240,255,1)');g.addColorStop(.34,'rgba(225,232,250,1)');g.addColorStop(.38,'rgba(200,215,255,.35)');g.addColorStop(.7,'rgba(160,180,255,.08)');g.addColorStop(1,'rgba(150,170,255,0)');x.fillStyle=g;x.fillRect(0,0,sz,sz);
  x.fillStyle='rgba(150,160,185,.35)';[[54,52,7],[72,60,5],[60,74,6],[46,66,4]].forEach(([a,b,r])=>{x.beginPath();x.arc(a,b,r,0,6.3);x.fill()});return new T.CanvasTexture(c)})();
 const sprite=(tex,blend)=>{const m=new T.SpriteMaterial({map:tex,transparent:true,depthWrite:false,fog:false,blending:blend||T.NormalBlending});const s=new T.Sprite(m);s.renderOrder=-5;s.frustumCulled=false;scene.add(s);return s};
 const sunS=sprite(tSun,T.AdditiveBlending),moonS=sprite(tMoon);sunS.scale.set(900,900,1);moonS.scale.set(520,520,1);
 /* --- עננים --- */
 const tCloud=(()=>{const c=document.createElement('canvas');c.width=256;c.height=128;const x=c.getContext('2d');
  [[70,78,46],[110,60,52],[150,70,56],[190,80,42],[128,86,60],[90,88,40],[170,90,40]].forEach(([a,b,r])=>{const g=x.createRadialGradient(a,b,0,a,b,r);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(.6,'rgba(250,250,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,256,128)});return new T.CanvasTexture(c)})();
 const clouds=[];let _s=7;const rnd=()=>(_s=_s*16807%2147483647)/2147483647;
 for(let i=0;i<11;i++){const m=new T.SpriteMaterial({map:tCloud,transparent:true,depthWrite:false,fog:false,opacity:.8}),s=new T.Sprite(m);s.position.set((rnd()-.5)*5200,520+rnd()*320,(rnd()-.5)*5200);const w=900+rnd()*900;s.scale.set(w,w*.42,1);s.userData.v=7+rnd()*12;s.renderOrder=-4;s.frustumCulled=false;scene.add(s);clouds.push(s)}
 /* --- יונים --- */
 const birds=[],bm=new T.MeshLambertMaterial({color:0xffffff,side:T.DoubleSide,emissive:0x222222});
 const bBody=new T.SphereGeometry(.5,8,6),bHead=new T.SphereGeometry(.24,8,6),bTail=new T.PlaneGeometry(.7,1),bW=new T.PlaneGeometry(2.4,1);bW.translate(1.2,0,0);bW.rotateX(-Math.PI/2);
 for(let i=0;i<14;i++){const g=new T.Group(),b=new T.Mesh(bBody,bm);b.scale.set(1,.8,1.7);g.add(b);const h=new T.Mesh(bHead,bm);h.position.set(0,.18,.95);g.add(h);const tl=new T.Mesh(bTail,bm);tl.rotation.x=-Math.PI/2;tl.position.set(0,0,-1.3);g.add(tl);
  const pl=new T.Group(),pr=new T.Group(),wl=new T.Mesh(bW,bm),wr=new T.Mesh(bW,bm);wl.scale.x=-1;pl.add(wl);pr.add(wr);pl.position.set(-.2,.15,.2);pr.position.set(.2,.15,.2);g.add(pl,pr);
  g.scale.setScalar(2.6);g.userData={pl,pr,R:150+rnd()*330,y:55+rnd()*95,w:(.035+rnd()*.05)*(i%2?1:-1),ph:rnd()*6.28,fp:rnd()*6.28};scene.add(g);birds.push(g)}
 let _kd=0;
 function update(dt,t){
  if(!tm)return;
  /* זמן רץ */
  const auto=chk?chk.checked:false,rate=sel?+sel.value:.1;
  if(auto&&!hold){H=(H+dt*rate)%24;tm.value=H;since+=dt;if(since>.12){since=0;setTime(H)}}
  else if(hold&&tgt!=null){if(hf==null)hf=+tm.value;hf+=(tgt-hf)*Math.min(1,dt*.5);H=hf;tm.value=H;since+=dt;if(since>.08){since=0;setTime(H)}}else{H=+tm.value;hf=null}   /* בסיור: מעבר חלק לשעת השלב (עלות השחר) */
  if(clk){const hh=Math.floor(H),mm=Math.floor((H-hh)*60);clk.textContent=(hh<10?'0':'')+hh+':'+(mm<10?'0':'')+mm}
  /* הכיור */
  if(typeof KIYOR!='undefined'){const u=kiyorUp(H);KIYOR.position.y=YA-5.6*(1-u);KIYOR.visible=u>.02;if(typeof mochniSync=='function')mochniSync()}
  /* שמש/ירח */
  const a=(H-6)/12*Math.PI,s=Math.sin(a),dx=Math.cos(a),dz=.4,L=Math.hypot(dx,s,dz),cp=camera.position;
  sunS.position.set(cp.x+dx/L*3400,cp.y+s/L*3400,cp.z+dz/L*3400);moonS.position.set(cp.x-dx/L*3400,cp.y-s/L*3400,cp.z-dz/L*3400);
  const dusk=Math.max(0,1-Math.abs(s)*4);sunS.visible=s>-.12;sunS.material.opacity=Math.min(1,(s+.12)*6);sunS.material.color.set(0xffffff).lerp(new T.Color(0xff9a50),dusk*.9);
  moonS.visible=s<.12;moonS.material.opacity=Math.min(1,(.12-s)*6);
  /* עננים */
  const dayK=typeof day!='undefined'?day:1;
  clouds.forEach(c=>{c.position.x+=c.userData.v*dt;if(c.position.x>2800)c.position.x=-2800;c.material.opacity=.15+.65*dayK;c.material.color.set(0x3c4468).lerp(new T.Color(0xffffff),dayK).lerp(new T.Color(0xffc8a0),dusk*.5)});
  /* יונים */
  birds.forEach((g,i)=>{const u=g.userData,vis=dayK>.25;g.visible=vis;if(!vis)return;
   const ang=t*u.w+u.ph,x=-60+Math.cos(ang)*u.R,z=-60+Math.sin(ang)*u.R,y=u.y+Math.sin(t*.4+u.ph)*8;g.position.set(x,y,z);
   const dxa=-Math.sin(ang)*u.w,dza=Math.cos(ang)*u.w;g.rotation.y=Math.atan2(dxa,dza);g.rotation.z=(u.w>0?-.18:.18);
   const fl=Math.sin(t*(7+i%3)+u.fp)*.75,gl=Math.sin(t*.35+u.fp)>.55?.12:1;u.pl.rotation.z=-fl*gl;u.pr.rotation.z=fl*gl});
 }
 return{update,tour(id){hold=!!id;tgt=null;hf=null;if(id){H=TOUR_H[id]||10.5;if(tm)tm.value=H;setTime(H)}},tourStep(id,i){const f=TSTEP[id];tgt=hold&&f?f(i):null},setHour(h){H=((+h%24)+24)%24;if(tm)tm.value=H;setTime(H);since=0},get hour(){return H},get held(){return hold}}
})();
