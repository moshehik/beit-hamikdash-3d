'use strict';
/* ===== לשכות העזרה, שערי הצפון והדרום, לשכות ניקנור – פנים מפורט (נטען אחרי app.js, לפני jerusalem.js) =====
   צבעים נדגמו מהסרטון: אבן חול־זהב, וילונות יין (#7a3f3f), מדרגות אפורות כהות, עור/עץ חום (#3b2114), טרקוטה (#a8522a),
   קירות ורדרדים בלשכת הגזית (#cf9f88), כיסאות בורדו (#7a2433), וילונות כחולים בבית אבטינס (#1e2d56), שיש מנומר ורוד־בהיר בבית המוקד.
   ריהוט חוזר = מופעים (InstancedMesh) לפי צבע; אין שימוש ב-rand() המשותף כדי לא לשנות את שאר העולם. */
{
const Y=YA,g=gA,dm=new T.Object3D(),tc=new T.Color(),POOL=[];let _q=7;const rq=()=>(_q=_q*16807%2147483647)/2147483647;
const pool=(geo,m)=>{const p={geo,m,a:[]};POOL.push(p);return p};
const cgeo=new T.CylinderGeometry(1,1,1,12);cgeo.translate(0,.5,0);
const ws=new T.Shape();ws.moveTo(-.8,0);ws.lineTo(.8,0);ws.lineTo(.8,3.2);ws.absarc(0,3.2,.8,0,Math.PI,false);ws.lineTo(-.8,0);
const wgeo=new T.ExtrudeGeometry(ws,{depth:.2,bevelEnabled:false});
const PB=pool(new T.BoxGeometry(1,1,1),mk(0xffffff,{roughness:.85})),
 PG=pool(new T.BoxGeometry(1,1,1),mk(0xffffff,{metalness:.65,roughness:.32,emissive:0x2a1c00})),
 PF=pool(new T.SphereGeometry(1,8,6),new T.MeshBasicMaterial({color:0xffffff})),
 PC=pool(cgeo,mk(0xffffff,{roughness:.8})),PL=pool(new T.CylinderGeometry(1,1,1,9),mk(0xffffff,{roughness:.9})),
 PS=pool(new T.SphereGeometry(1,10,7),mk(0xffffff,{roughness:.85})),
 PJ=pool(new T.LatheGeometry([[0,0],[.18,0],[.28,.08],[.4,.3],[.43,.5],[.36,.72],[.2,.85],[.17,.95],[.24,1.02],[.2,1.06]].map(p=>new T.Vector2(p[0],p[1])),10),mk(0xffffff,{roughness:.7,side:T.DoubleSide})),
 PWg=pool(wgeo,mk(0xffffff,{metalness:.6,roughness:.4,emissive:0x2a1c00})),PWs=pool(wgeo,mk(0xffffff,{roughness:.2,emissive:0x4a6a90})),PWd=pool(wgeo,mk(0xffffff,{roughness:.9}));
const ad=(p,x,y,z,sx,sy,sz,col,ry,rz,rx)=>p.a.push([x,y,z,sx,sy,sz,col,ry||0,rz||0,rx||0]);
const bb=(w,d,ry)=>{const c=Math.abs(Math.cos(ry||0)),s=Math.abs(Math.sin(ry||0));return[(c*w+s*d)/2,(s*w+c*d)/2]};
const B=(x,y0,z,w,h,d,col,o={})=>{ad(PB,x,y0+h/2,z,w,h,d,col,o.ry);if(o.c){const q=bb(w,d,o.ry);COL.push([x-q[0],x+q[0],z-q[1],z+q[1],y0,y0+h])}};
const G=(x,y0,z,w,h,d,o={})=>ad(PG,x,y0+h/2,z,w,h,d,0xf2c350,o.ry);
const Cy=(x,y0,z,r,h,col,o={})=>{ad(PC,x,y0,z,r,h,r,col);if(o.c)COL.push([x-r,x+r,z-r,z+r,y0,y0+h])};
const Lg=(x,y,z,r,len,col,ax)=>ax=='z'?ad(PL,x,y,z,r,len,r,col,0,0,Math.PI/2):ad(PL,x,y,z,r,len,r,col,0,Math.PI/2);
const Sp=(x,y,z,rx,ry,rz,col)=>ad(PS,x,y,z,rx,ry,rz,col);
const Jr=(x,y0,z,s,col)=>ad(PJ,x,y0,z,s,s,s,col);
const Fl=(x,y,z,rx,ry,rz,col)=>ad(PF,x,y,z,rx,ry,rz,col||0xffa640);
const Tc=(x,y,z)=>{G(x,y,z,.35,.9,.35);Fl(x,y+1.25,z,.32,.55,.32)};            // פתיל / לפיד קיר
const Wn=(x,y0,z,ry,s,dark)=>{ad(PWg,x,y0-.12*s,z,s*1.2,s*1.07,.7,0xf2c350,ry);ad(dark?PWd:PWs,x,y0,z,s,s,1,dark?0x2a2118:0xffffff,ry)};
const fin=p=>{if(!p.a.length)return;const im=new T.InstancedMesh(p.geo,p.m,p.a.length);
 p.a.forEach((a,i)=>{dm.position.set(a[0],a[1],a[2]);dm.rotation.set(a[9],a[7],a[8]);if(a[10])dm.quaternion.premultiply(qy.setFromAxisAngle(yv,a[10]));dm.scale.set(a[3],a[4],a[5]);dm.updateMatrix();im.setMatrixAt(i,dm.matrix);im.setColorAt(i,tc.set(a[6]))});
 im.instanceMatrix.needsUpdate=true;im.instanceColor.needsUpdate=true;im.castShadow=im.receiveShadow=true;im.frustumCulled=false;g.add(im)};
const light=(c,i,d,x,y,z)=>{const l=new T.PointLight(c,i,d);l.position.set(x,y,z);g.add(l);lampLights.push(l)};
/* ---- הזזה/סיבוב של לשכה שלמה אחרי בנייתה (פריסה לפי תרשים התפארת ישראל): S=snap() לפני הבלוק, mv(S,מרכז-מקורי x,z, סיבוב במעלות (0/90/180/270; 180 = הדלת מתהפכת צפון/דרום), מרכז-חדש x,z) בסופו.
   מזיז את כל מה שנוצר מאז ה-snap: רשתות, התנגשויות (COL), רצפות (ZN), תוויות ומופעים (POOL). ---- */
const GRPS=[gA,gC,gM,gN],qy=new T.Quaternion(),yv=new T.Vector3(0,1,0);
const snap=()=>({ch:GRPS.map(q=>q.children.length),col:COL.length,zn:ZN.length,lb:LBL.length,pl:POOL.map(p=>p.a.length)});
const mv=(S,ox,oz,deg,nx,nz)=>{const ph=deg*Math.PI/180,c=Math.round(Math.cos(ph)),s=Math.round(Math.sin(ph)),sw=s!=0,
  fx=(x,z)=>nx+(x-ox)*c+(z-oz)*s,fz=(x,z)=>nz-(x-ox)*s+(z-oz)*c,
  rect=r=>{const p=[fx(r[0],r[2]),fz(r[0],r[2])],q=[fx(r[1],r[3]),fz(r[1],r[3])];return[Math.min(p[0],q[0]),Math.max(p[0],q[0]),Math.min(p[1],q[1]),Math.max(p[1],q[1])]};
 GRPS.forEach((q,gi)=>{for(let i=S.ch[gi];i<q.children.length;i++){const o=q.children[i],x=o.position.x,z=o.position.z;o.position.x=fx(x,z);o.position.z=fz(x,z);if(deg)o.quaternion.premultiply(qy.setFromAxisAngle(yv,ph))}});
 for(let i=S.col;i<COL.length;i++){const k=COL[i],r=rect(k);k[0]=r[0];k[1]=r[1];k[2]=r[2];k[3]=r[3]}
 for(let i=S.zn;i<ZN.length;i++){const k=ZN[i];if(k.c){k.c=[fx(k.c[0],k.c[1]),fz(k.c[0],k.c[1])];continue}
  const r=k.r,mx=(r[0]+r[1])/2,mz=(r[2]+r[3])/2;
  if(k.ax){const ax=k.ax=='x',A=ax?[fx(k.a,mz),fz(k.a,mz)]:[fx(mx,k.a),fz(mx,k.a)],B=ax?[fx(k.b,mz),fz(k.b,mz)]:[fx(mx,k.b),fz(mx,k.b)],nax=(ax!=sw)?'x':'z',ix=nax=='x'?0:1;k.ax=nax;k.a=A[ix];k.b=B[ix]}
  k.r=rect(r)}
 for(let i=S.lb;i<LBL.length;i++){const l=LBL[i],x=l.x,z=l.z;l.x=fx(x,z);l.z=fz(x,z)}
 POOL.forEach((p,pi)=>{for(let i=S.pl[pi];i<p.a.length;i++){const a=p.a[i],x=a[0],z=a[2];a[0]=fx(x,z);a[2]=fz(x,z);if(deg)a[10]=ph}})};


/* ---- חומרים וטקסטורות ---- */
const mFl=(t,tile)=>{const m=mk(0xffffff,{map:t,roughness:.75});m.userData.tile=tile;return m};
const fChk=mFl(cv(128,128,(c,w,h)=>{for(let i=0;i<2;i++)for(let j=0;j<2;j++){c.fillStyle=(i+j)%2?'#8c7556':'#cdbb9c';c.fillRect(i*64,j*64,64,64);c.strokeStyle='#6b5a42';c.strokeRect(i*64,j*64,64,64)}}),8);
const fRose=mFl(cv(128,128,(c,w,h)=>{c.fillStyle='#c4a08c';c.fillRect(0,0,w,h);for(let i=0;i<2;i++)for(let j=0;j<2;j++){c.fillStyle=(i+j)%2?'#e6c9b6':'#efd6c4';c.fillRect(i*64+1.5,j*64+1.5,61,61)}}),12);
const fMar=mFl(cv(128,128,(c,w,h)=>{c.fillStyle='#cdbba3';c.fillRect(0,0,w,h);for(let i=0;i<2;i++)for(let j=0;j<2;j++){c.fillStyle='#ece0cc';c.fillRect(i*64+1.5,j*64+1.5,61,61)}c.strokeStyle='rgba(160,110,100,.35)';for(let k=0;k<7;k++){c.beginPath();c.moveTo(rq()*w,rq()*h);c.lineTo(rq()*w,rq()*h);c.stroke()}}),8);
const fWood=mFl(cv(128,128,(c,w,h)=>{c.fillStyle='#4a2c18';c.fillRect(0,0,w,h);for(let i=0;i<8;i++){c.fillStyle=i%2?'#5a3a20':'#6a4426';c.fillRect(0,i*16+1,w,14)}}),6);
const tMos=cv(256,256,(c,w,h)=>{c.fillStyle='#b99a64';c.fillRect(0,0,w,h);for(let r=124;r>0;r-=12){c.strokeStyle=r%24?'#7a5c34':'#e3cf9c';c.lineWidth=6;c.beginPath();c.arc(128,128,r,0,6.283);c.stroke()}});
const mMos=mk(0xffffff,{map:tMos,roughness:.6});
const tGold=cv(128,256,(c,w,h)=>{const gr=c.createLinearGradient(0,0,w,0);gr.addColorStop(0,'#a47a22');gr.addColorStop(.5,'#d9a93a');gr.addColorStop(1,'#a47a22');c.fillStyle=gr;c.fillRect(0,0,w,h);c.strokeStyle='#f3d57a';c.lineWidth=2.5;
 for(let i=0;i<4;i++){const y=32+i*64;c.beginPath();c.arc(w/2,y,20,0,6.283);c.stroke();c.beginPath();c.moveTo(w/2,y-30);c.quadraticCurveTo(w/2+30,y,w/2,y+30);c.quadraticCurveTo(w/2-30,y,w/2,y-30);c.stroke();[[-1,1],[1,1],[-1,-1],[1,-1]].forEach(a=>{c.beginPath();c.arc(w/2+a[0]*34,y+a[1]*20,9,0,6.283);c.stroke()})}
 c.strokeStyle='#6a4a12';c.lineWidth=5;c.strokeRect(2,2,w-4,h-4)});
M.gdoor=mk(0xffffff,{map:tGold,metalness:.5,roughness:.4,emissive:0x2a1a00,side:T.DoubleSide});M.gdoor.userData.tile=6;
M.nikn=mk(0xc89058,{map:tGold,metalness:.5,roughness:.5,emissive:0x1a0f00,side:T.DoubleSide});M.nikn.userData.tile=6;
const tFan=cv(128,128,(c,w,h)=>{c.fillStyle='#1c2c52';c.fillRect(0,0,w,h);c.strokeStyle='#e6bd52';c.lineWidth=3;for(let k=0;k<=8;k++){const a=Math.PI+k*Math.PI/8;c.beginPath();c.moveTo(64,64);c.lineTo(64+60*Math.cos(a),64+60*Math.sin(a));c.stroke()}c.lineWidth=5;c.beginPath();c.arc(64,64,58,0,6.283);c.stroke()});
M.fan=mk(0xffffff,{map:tFan,metalness:.3,roughness:.5,emissive:0x15100a});
const mCream=mk(0xe9dcc0),mStoneRaw=M.stoneRaw;

/* ---- בניית מעטפת לשכה: קירות עם פתחים, חיפוי פנים, כרכוב זהב, תקרה, ריצוף, מסגרות דלתות ---- */
function door(d,x0,x1,z0,z1,t,y0){const al=d.s=='n'||d.s=='s',w=d.w,h=d.h,nz=d.s=='n'?-1:d.s=='s'?1:0,nx=d.s=='e'?1:d.s=='w'?-1:0,
  px=al?d.c:(nx>0?x1:x0),pz=al?(nz>0?z1:z0):d.c,at=(a,o)=>al?[px+a,pz+nz*o]:[px+nx*o,pz+a],sz=(l,e)=>al?[l,e]:[e,l],io=-t/2+.2;
 [-1,1].forEach(s=>{const p=at(s*(w/2+.5),io),q=sz(1,t+.4);B(p[0],y0,p[1],q[0],d.h,q[1],0xe9e1cc);const q2=sz(1.5,t+.7);G(p[0],y0+h-.4,p[1],q2[0],.5,q2[1])});
 let p=at(0,io+.05),q=sz(w+3,t+.5);G(p[0],y0+h,p[1],q[0],.8,q[1]);
 const rad=w/2+.4,f=new T.Mesh(new T.CircleGeometry(rad,20,0,Math.PI),M.fan),fp=at(0,.1);f.position.set(fp[0],y0+h+.8,fp[1]);f.rotation.y=d.s=='n'?Math.PI:d.s=='s'?0:d.s=='e'?Math.PI/2:-Math.PI/2;g.add(f);
 q=sz(w+4.6,t+1.1);B(p[0],y0+h+.8+rad,p[1],q[0],.55,q[1],0xe9e1cc);
 [-1,1].forEach(s=>{const lp=at(s*(w/2-.2),w/4+.5),lq=sz(.28,w/2-.2);box(g,lp[0],y0,lp[1],lq[0],h-.3,lq[1],M.gdoor,{ns:1})})}
function shell(x0,x1,z0,z1,h,doors,o){const t=o.t||1.5,y0=o.y0==null?Y:o.y0,Gs={n:[],s:[],e:[],w:[]};
 doors.forEach(d=>Gs[d.s].push({c:d.c,w:d.w,h:d.h,nd:1}));
 wall(g,'x',z0+t/2,x0+t,x1-t,y0,h,t,M.stone,Gs.n);wall(g,'x',z1-t/2,x0+t,x1-t,y0,h,t,M.stone,Gs.s);wall(g,'z',x0+t/2,z0,z1,y0,h,t,M.stone,Gs.w);wall(g,'z',x1-t/2,z0,z1,y0,h,t,M.stone,Gs.e);
 const ln=(ax,fix,a0,a1,gs)=>{const seg=(s,e,yb,hh)=>{if(e-s<.02||hh<.02)return;const m=(s+e)/2,L=e-s;ax=='x'?box(g,m,yb,fix,L,hh,.3,o.lin,{ns:1}):box(g,fix,yb,m,.3,hh,L,o.lin,{ns:1})};
  let cur=a0;gs.slice().sort((p,q)=>p.c-q.c).forEach(q=>{seg(cur,q.c-q.w/2,y0,h);seg(q.c-q.w/2,q.c+q.w/2,y0+q.h,h-q.h);cur=q.c+q.w/2});seg(cur,a1,y0,h)};
 ln('x',z0+t+.15,x0+t,x1-t,Gs.n);ln('x',z1-t-.15,x0+t,x1-t,Gs.s);ln('z',x0+t+.15,z0+t,z1-t,Gs.w);ln('z',x1-t-.15,z0+t,z1-t,Gs.e);
 const cw=x1-x0-2*t,cd=z1-z0-2*t,cx=(x0+x1)/2,cz=(z0+z1)/2;
 G(cx,y0+h-1.6,z0+t+.3,cw,.5,.5);G(cx,y0+h-1.6,z1-t-.3,cw,.5,.5);G(x0+t+.3,y0+h-1.6,cz,.5,.5,cd);G(x1-t-.3,y0+h-1.6,cz,.5,.5,cd);
 ROOFS.push(box(g,cx,y0+h,cz,x1-x0+.6,1,z1-z0+.6,o.ceil||M.plaster));
 if(o.fl)box(g,cx,y0,cz,cw,.06,cd,o.fl,{ns:1});
 doors.forEach(d=>{if(!d.nf)door(d,x0,x1,z0,z1,t,y0)})}
const FL=(x0,x1,z0,z1,m,y)=>box(g,(x0+x1)/2,y,(z0+z1)/2,x1-x0,.06,z1-z0,m,{ns:1});
const bed=(x,y,z,ax,dir,i)=>{const sh=[0xe8e6e0,0xd6dae6,0xefe6d2][i%3],cap=[0x4a6a9a,0x7a4a8a,0x5a8a5a,0x9a5a3a][i%4],a=ax=='x'?dir:0,b=ax=='z'?dir:0;
 B(x,y,z,ax=='x'?3:.95,.42,ax=='z'?3:.95,sh);B(x+a*1.45,y,z+b*1.45,.85,.22,.85,0xf5f1e6);Sp(x+a*1.7,y+.5,z+b*1.7,.36,.34,.36,0xd9a98a);Sp(x+a*1.7,y+.68,z+b*1.7,.4,.22,.4,cap)};
const ladder=(x,z,ax,h,col)=>{const d=ax=='x';[-.8,.8].forEach(o=>B(d?x+o:x,Y,d?z:z+o,.15,h,.15,col));for(let k=0;k<h/1.2-1;k++)B(x,Y+1+k*1.2,z,d?1.7:.12,.12,d?.12:1.7,col)};

/* ================= בית המוקד (אולם מקומר; הוקטן ל-40×15 כדי לא לחפוף את גוף ההיכל שמתחיל ב-z=-107.5) ================= */
{const cx=-76,cz=-117;
 shell(-96,-56,-125,-110,22,[{s:'n',c:-68,w:9,h:16,nf:1},{s:'e',c:-117,w:8,h:13},{s:'w',c:-117,w:6,h:10,nf:1}],{lin:mk(0xd9bfa8),ceil:mk(0xf1e3cc)});
 const md=new T.Mesh(new T.CylinderGeometry(5.6,5.6,.1,40),mMos);md.position.set(cx,Y+.1,cz);md.receiveShadow=true;g.add(md);              // ריצוף פסיפס עגול סביב המדורה
 Cy(cx,Y+.1,cz,1.3,.7,0x8a5a28);Cy(cx,Y+.8,cz,1.9,.4,0xa87438);Cy(cx,Y+1.2,cz,1.6,.1,0x1a120c);COL.push([cx-1.9,cx+1.9,cz-1.9,cz+1.9,Y,Y+1.6]);   // בור האש העגול
 const co=new T.Mesh(new T.CylinderGeometry(1.5,1.5,.12,18),mk(0x401408,{emissive:0x6a2008}));co.position.set(cx,Y+1.3,cz);g.add(co);
 {const tF=cv(64,128,(c,w,h)=>{c.filter='blur(2.2px)';const gr=c.createLinearGradient(0,h,0,0);gr.addColorStop(0,'rgba(255,236,130,1)');gr.addColorStop(.4,'rgba(255,150,30,.96)');gr.addColorStop(.78,'rgba(225,70,10,.62)');gr.addColorStop(1,'rgba(200,40,0,0)');c.fillStyle=gr;
   c.beginPath();c.moveTo(w/2,0);c.bezierCurveTo(w*.72,h*.3,w*1.02,h*.55,w*.8,h*.82);c.bezierCurveTo(w*.7,h*.98,w*.3,h*.98,w*.2,h*.82);c.bezierCurveTo(-w*.02,h*.55,w*.28,h*.3,w/2,0);c.fill();
   const g2=c.createLinearGradient(0,h,0,h*.45);g2.addColorStop(0,'rgba(255,255,225,.95)');g2.addColorStop(1,'rgba(255,235,130,0)');c.fillStyle=g2;c.beginPath();c.ellipse(w/2,h*.8,w*.2,h*.17,0,0,6.3);c.fill()}),
  mS=new T.SpriteMaterial({map:tF,transparent:true,depthWrite:false,fog:true});
  rep(6,i=>{const f=new T.Group(),w=1.9-i*.2,h=2.5+i*.32,sp=new T.Sprite(mS);sp.scale.set(w,h,1);sp.position.y=h*.46;f.add(sp);f.position.set(cx+(rq()-.5)*2.4,Y+1.5,cz+(rq()-.5)*2.4);g.add(f);fires.push(f)});   // להבות מונפשות (ספרייטים) במקום קונוסים
  const gl=new T.Mesh(new T.CircleGeometry(2.2,20),new T.MeshBasicMaterial({color:0xff7a2a,transparent:true,opacity:.35,depthWrite:false}));gl.rotation.x=-Math.PI/2;gl.position.set(cx,Y+1.42,cz);g.add(gl)}
 light(0xff9a50,1,46,cx,Y+7,cz);
 // אצטבאות אבן (מיטות) לאורך הקיר הדרומי והצפוני – כלי שינה: סדינים, כריות, בגדים מקופלים; זקני בית אב ישנים על הרובדים
 B(-71.5,Y,-113,19,.6,5,0xe4d4bb);B(-78.25,Y,-110.9,32.5,1.2,.8,0xefe2cc);B(-77.5,Y,-121.25,7,.6,4.5,0xe4d4bb);B(-84.25,Y,-123.1,20.5,1.2,.8,0xefe2cc);
 rep(14,i=>{if(i>=6)bed(-93.3+i*2.3,Y+.6,-113.7,'z',1,i)});rep(8,i=>{if(i>=6)bed(-93.3+i*2.3,Y+.6,-121.2,'z',-1,i+1)});
 rep(14,i=>{B(-93.3+i*2.3,Y+1.2,-110.9,1.3,.3,.7,0xdadbe0);B(-93.3+i*2.3,Y+1.5,-110.9,1.1,.25,.6,0xe8d9b8)});
 for(let k=0;k<5;k++){const p=(155+k*12.5)*Math.PI/180,bx=cx+4.2*Math.cos(p),bz=cz+4.2*Math.sin(p);B(bx,Y,bz,2.4,1.3,1.3,0xe2d3ba,{ry:-(p+Math.PI/2)});COL.push([bx-1.1,bx+1.1,bz-1.1,bz+1.1,Y,Y+1.3])}   // ספסל עגול סביב האש
 Jr(-59.2,Y,-112.2,3.2,0xa8522a);Jr(-60.9,Y,-111.8,2.6,0x8f4524);COL.push([-61.8,-58.3,-113.2,-110.8,Y,Y+3]);                       // כדים
 B(-60,Y+5,-123.2,5,3,.2,0x5a3a20);rep(8,i=>{G(-62+i*.62,Y+5.3,-123.0,.18,1.6,.12);G(-62+i*.62,Y+6.8,-123.0,.55,.5,.12)});   // לוח מפתחות העזרה
 B(-86,Y+7,-123.2,6,.2,.2,0x5a3a20);rep(6,i=>B(-88.2+i*.9,Y+3.2,-123.2,.7,3.6,.12,0xefe9dc));                                    // קולב בגדים ומגבות
 [-89,-83,-77,-71,-65].forEach(x=>box(g,x,Y+4,-110.65,5.2,12,.15,M.gdoor,{ns:1}));[-91.5,-85.5,-79.5].forEach(x=>box(g,x,Y+4,-123.35,5.2,12,.15,M.gdoor,{ns:1}));   // לוחות זהב מגולפים
 [-70,-86].forEach(x=>Tc(x,Y+9,-110.8));[-62,-92].forEach(x=>Tc(x,Y+9,-123.2));[-122.5,-112].forEach(z=>Tc(-57.9,Y+9,z));[-122,-112].forEach(z=>Tc(-94.1,Y+9,z));
 const dome=new T.Mesh(new T.SphereGeometry(1,28,10,0,6.283,0,Math.PI/2),mk(0xc9c0aa,{roughness:.9}));dome.scale.set(20.5,9,9);dome.position.set(cx,Y+22.5,cz);dome.castShadow=true;g.add(dome);ROOFS.push(dome);
 sph(g,cx,Y+31.8,cz,1.1,M.gold);
 lbl('לשכת בית המוקד · כיפה',cx,Y+34,cz,'azarah',170);lbl('מדורת בית המוקד',cx,Y+7,cz,'azarah',55);lbl('אצטבאות אבן · זקני בית אב ישנים',-85,Y+4,-113,'azarah',45);
 lbl('מפתחות העזרה',-60,Y+9,-123,'azarah',40);lbl('פתח למסיבה · יורדים לבית הטבילה',-95.5,Y+11,-117,'azarah',40);lbl('פתח לעזרה',-56,Y+14,-117,'azarah',40);lbl('ספסל עגול',-79,Y+3,-117,'azarah',35)}
/* ---- בית המוקד בולט החוצה מן הקיר הצפוני (תרשים התפארת ישראל: חצי בפנים וחצי בחוץ): החצי החיצוני (חול) 40×14, מחובר בפתח הצפוני אל האולם המקומר ---- */
{const X0=-96,X1=-56,Z0=-139,Z1=-125;
 shell(X0,X1,Z0,Z1,22,[{s:'s',c:-68,w:9,h:16,nf:1}],{lin:mk(0xd9bfa8),ceil:mk(0xf1e3cc),fl:fMar});
 box(g,-76,0,-134.5,40,Y-.3,9,M.stone,{c:1});ZN.push({r:[X0+1.5,X1-1.5,Z0+1.5,-129.9],y:Y});
 B(-76,Y,-137.1,34,.7,1.3,0xe9dcc0);B(-93.3,Y,-132,1.1,.7,9,0xe9dcc0);B(-58.7,Y,-132,1.1,.7,9,0xe9dcc0);
 [-90,-76,-62].forEach(x=>Tc(x,Y+9,-137.4));Tc(-94.2,Y+9,-131);Tc(-57.8,Y+9,-131);
 [-86,-66].forEach(x=>box(g,x,Y+4,-137.35,5.2,12,.15,M.gdoor,{ns:1}));
 light(0xff9a50,.8,40,-76,Y+8,-132);
 lbl('בית המוקד · החצי החיצוני (חול)',-76,Y+24,-132,'azarah',150)}


/* ================= לשכה צפונית־מערבית: מעלות מסתלסלות (מסיבה) אל מתחת לבירה, מקווה עגול בבית המוקד, מסיבה מוארת אל שער טדי =================
   מקורות: משנה מידות א:ו ("צפונית מערבית – בה יורדים לבית הטבילה"), א:ט ("במסיבה ההולכת תחת הבירה, והנרות דולקים מכאן ומכאן, עד שהוא מגיע לבית הטבילה";
   ר' אליעזר בן יעקב: "במסיבה ההולכת תחת החיל יוצא והולך לו בטדי"), תמיד א:א (מדורה, בית הכסא של כבוד). הסרטון 05:10–05:46: מקווה עגול שקוע ומדורה בבית המוקד,
   מסדרון קמור מואר בפמוטי קיר על קירות לוחות אדומים־חומים, ושער טדי – פתח מחודד (שתי אבנים נטויות) עם דלתות מעוטרות פתוחות.
   החללים נחצבים מתוך תיבות האבן המלאות של פלטפורמת העזרה והר הבית (הן מפוצלות סביב החללים; הרצפה מדורגת בשכבות: ZN עם u:1 = שכבה תת־קרקעית). */
{
const SX=-104.25,SZ=-117.5,RI=1.2,RO=4.2,FT=-10,NS=52,DA=Math.PI/7;                  // ציר המעלות, רדיוסים, מפלס מנהרה, מספר מעלות (חצי אמה כל אחת)
const TXc=-102,S=[-108.5,-100,-122.5,-112.5],TN=[TXc-3,TXc+3,-223,-122.5],RR=[TXc-3,TXc+3,-238,-223];   // פיר, מנהרה, מדרגות יציאה
const PX=-86.2,PZ=-117.5,PQ=[PX-2.8,PX+2.8,PZ-2.8,PZ+2.8];                           // מקווה עגול בבית המוקד
const wuv=(geo,t)=>{const p=geo.attributes.position,n=geo.attributes.normal,u=geo.attributes.uv;for(let i=0;i<p.count;i++){const ax=Math.abs(n.getX(i)),ay=Math.abs(n.getY(i)),az=Math.abs(n.getZ(i));let a,b;
  if(ay>=ax&&ay>=az){a=p.getX(i);b=p.getZ(i)}else if(ax>=az){a=p.getZ(i);b=p.getY(i)}else{a=p.getX(i);b=p.getY(i)}u.setXY(i,a/t,b/t)}};
const cb=(grp,x0,x1,y0,y1,z0,z1,m,ns)=>{if(x1-x0<.01||y1-y0<.01||z1-z0<.01)return;const ge=new T.BoxGeometry(x1-x0,y1-y0,z1-z0);ge.translate((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);if(m.map)wuv(ge,m.userData.tile||8);
 const me=new T.Mesh(ge,m);me.castShadow=!ns;me.receiveShadow=true;me.userData.ns=!!ns;grp.add(me);return me};
const sub=(R,hs)=>{let o=[R.slice()];hs.forEach(h=>{const n=[];o.forEach(r=>{if(h[1]<=r[0]||h[0]>=r[1]||h[3]<=r[2]||h[2]>=r[3]){n.push(r);return}
  if(h[0]>r[0])n.push([r[0],h[0],r[2],r[3]]);if(h[1]<r[1])n.push([h[1],r[1],r[2],r[3]]);const a=Math.max(r[0],h[0]),b=Math.min(r[1],h[1]);
  if(h[2]>r[2])n.push([a,b,r[2],h[2]]);if(h[3]<r[3])n.push([a,b,h[3],r[3]])});o=n});return o};
const lay=(grp,R,y0,y1,hs,m,ns)=>sub(R,hs).forEach(r=>cb(grp,r[0],r[1],y0,y1,r[2],r[3],m,ns));
const rm=(grp,w,h,d)=>{const m=grp.children.find(o=>o.geometry&&o.geometry.type=='BoxGeometry'&&Math.abs(o.geometry.parameters.width-w)<.01&&Math.abs(o.geometry.parameters.height-h)<.01&&Math.abs(o.geometry.parameters.depth-d)<.01);if(m){grp.remove(m);m.geometry.dispose()}return !!m};

/* ---- חציבת הגושים המלאים: פלטפורמת העזרה (0..16) והר הבית (עד -95) מפוצלים סביב הפיר, המנהרה, המדרגות והמקווה ---- */
const carved=[rm(gA,176,Y-.3,145),rm(gA,176,.3,145),rm(gM,500,94.7,500),rm(gM,500,.3,500)].every(Boolean);
if(carved){const PL=[-180,-4,-130,15],MR=[-250,250,-250,250];
 lay(gA,PL,0,14,[S],M.stone);lay(gA,PL,14,Y-.3,[S,PQ],M.stone);lay(gA,PL,Y-.3,Y,[S,PQ],M.floorA);
 lay(gM,MR,-95,FT,[],M.herod);lay(gM,MR,FT,-2,[S,TN,RR],M.herod);lay(gM,MR,-2,-.3,[S,RR],M.herod);lay(gM,MR,-.3,0,[S,RR],M.floor)}
else console.warn('mesibah: carve skipped');

/* ---- הלשכה הצפונית־מערבית (פתוחה לטרקלין בית המוקד): ריצוף סביב הפיר, מעקה, מעלות מסתלסלות 52 × חצי אמה (4 סיבובים) ---- */
shell(-111,-96,-125,-110,16,[{s:'e',c:-117,w:6,h:10,nf:1}],{lin:mk(0xe0c9a4),ceil:mk(0xf3e6cd)});
lay(g,[-109.5,-97.5,-123.5,-111.5],Y,Y+.06,[S],fMar,1);
if(carved)ZN.push({r:S,y:-40});                                                                     // הפיר פתוח בפני הרצפה; המעלות הן שכבה תת־קרקעית (u)
const BAL=0xe8dcc4;B(SX,Y,S[2]+.2,8.5,1.1,.35,BAL,{c:1});B(SX,Y,S[3]-.2,8.5,1.1,.35,BAL,{c:1});B(S[0]+.2,Y,SZ,.35,1.1,10,BAL,{c:1});B(S[1]-.2,Y,-121.05,.35,1.1,2.9,BAL,{c:1});B(S[1]-.2,Y,-113.95,.35,1.1,2.9,BAL,{c:1});
Cy(SX,FT,SZ,RI,Y-FT,0xe2cfa4);COL.push([SX-.9,SX+.9,SZ-.9,SZ+.9,FT,Y]);                                                                // עמוד מרכזי (ציר המעלות)
for(let k=0;k<NS;k++){const a=k*DA,r=(RI+RO)/2,x=SX+r*Math.cos(a),z=SZ+r*Math.sin(a),yt=Y-.5*(k+1);
 if(yt<-4.5)B(x,FT,z,3.1,yt-FT,1.8,0xdcc79c,{ry:-a});else ad(PB,x,yt-.5,z,3.1,1,1.8,0xdcc79c,-a);                // מעלות תחתונות מלאות (אין הליכה מתחתן)
 ZN.push({r:[x-1.6,x+1.6,z-1.6,z+1.6],y:yt,u:1})}
ZN.push({r:[S[0]+.9,S[1],S[2],-120],y:FT,u:1},{r:TN,y:FT,u:1});   // רצפת הנחיתה בתחתית המעלות (מתחת לשאר המעלות אין רצפה – אי אפשר להיכנס)
[[-108.2,12,SZ],[-108.2,5,SZ],[-108.2,-2,SZ],[-108.2,-8,SZ],[SX,8,-122.3],[SX,1,-122.3],[SX,-6,-122.3],[-100.3,-6,-113]].forEach(q=>Tc(q[0],q[1],q[2]));
Jr(-98.6,Y,-122.4,2.6,0xa8522a);Jr(-98.6,Y,-112.6,2.2,0x8f4524);[-120,-113].forEach(z=>Tc(-109.3,Y+8,z));[-121,-112].forEach(z=>Tc(-97.7,Y+8,z));
light(0xffb870,1,48,SX+2.7,2,SZ);

/* ---- מסיבה: מנהרה קמורה (100 אמה) תחת העזרה והחיל אל שער טדי, קירות לוחות אדומים־חומים בגבולות שיש, פמוטי קיר בכל 4 אמות, ומעלות יציאה ---- */
{const L=TN[3]-TN[2],zc=(TN[2]+TN[3])/2,hw=3;
 const tp=cv(128,128,(c,w,h)=>{c.fillStyle='#c3a577';c.fillRect(0,0,w,h);c.fillStyle='#8a6a45';c.fillRect(0,h-14,w,14);c.fillStyle='#ecd9b2';c.fillRect(12,10,w-24,h-26);c.fillStyle='#d7bd90';c.fillRect(15,13,w-30,h-32);
  const gr=c.createLinearGradient(0,16,0,h-20);gr.addColorStop(0,'#bf6440');gr.addColorStop(1,'#a04c30');c.fillStyle=gr;c.fillRect(20,18,w-40,h-38);
  c.strokeStyle='rgba(60,25,10,.28)';c.lineWidth=1;for(let i=0;i<7;i++){c.beginPath();c.moveTo(22+i*13,18);c.lineTo(22+i*13+(i%2?8:-6),h-20);c.stroke()}c.strokeStyle='#e9cf9c';c.lineWidth=2;c.strokeRect(24,22,w-48,h-46)});
 const mP=new T.MeshStandardMaterial({map:tp,roughness:.8,emissive:0x2a1408,side:T.DoubleSide});
 [[TN[0],Math.PI/2],[TN[1],-Math.PI/2]].forEach(([x,ry])=>{const ge=new T.PlaneGeometry(L,4),uv=ge.attributes.uv;for(let i=0;i<uv.count;i++)uv.setX(i,uv.getX(i)*L/4);
  const me=new T.Mesh(ge,mP);me.rotation.y=ry;me.position.set(x,FT+2,zc);me.receiveShadow=true;gM.add(me)});
 const vg=new T.CylinderGeometry(hw,hw,L,28,1,true,Math.PI/2,Math.PI),vu=vg.attributes.uv;for(let i=0;i<vu.count;i++)vu.setXY(i,vu.getX(i)*hw*Math.PI/8,vu.getY(i)*L/8);
 const vm=new T.Mesh(vg,new T.MeshStandardMaterial({map:M.nStone.map,roughness:.9,emissive:0x2e1c0a,side:T.DoubleSide}));vm.rotation.x=Math.PI/2;vm.position.set(TXc,FT+4,zc);vm.receiveShadow=true;gM.add(vm);
 const mR=new T.MeshStandardMaterial({color:0xe9d9b4,roughness:.6,emissive:0x2a1c0c,side:T.DoubleSide});
 [-140,-162,-184,-206].forEach(z=>{const rb=new T.Mesh(new T.CylinderGeometry(hw+.06,hw+.06,.9,28,1,true,Math.PI/2,Math.PI),mR);rb.rotation.x=Math.PI/2;rb.position.set(TXc,FT+4,z);gM.add(rb)});
 const mSand=mFl(cv(128,128,(c,w,h)=>{c.fillStyle='#8c7250';c.fillRect(0,0,w,h);for(let i=0;i<2;i++)for(let j=0;j<2;j++){c.fillStyle=(i+j)%2?'#d6bc92':'#e2c9a0';c.fillRect(i*64+1.5,j*64+1.5,61,61)}}),8);mSand.emissive=new T.Color(0x24160a);
 cb(gM,TN[0],TN[1],FT,FT+.06,TN[2],TN[3],mSand,1);cb(gM,S[0],S[1],FT,FT+.06,S[2],S[3],mSand,1);
 for(let n=0;n<25;n++){const z=-124.5-4*n;[[TN[0]+.1,1],[TN[1]-.1,-1]].forEach(([x,s])=>{G(x+s*.3,FT+2.35,z,.5,.15,1.6);[-.6,.6].forEach(o=>{Cy(x+s*.3,FT+2.5,z+o,.12,.9,0xf6efd8);Fl(x+s*.3,FT+3.6,z+o,.14,.3,.14)})})}
 light(0xffb060,1.1,70,TXc,FT+5,-170);
 stairs(gM,TXc,-223,[0,-1],6,20,.5,.75,FT,M.stone);                                                   // 20 מעלות עולות אל חצר שער טדי
 [[TXc-3.4,-1],[TXc+3.4,1]].forEach(([x])=>box(gM,x,0,-230.5,.8,1.2,15,M.marble,{c:1}));          // כיפות/שפת הפיר העליון (מונעות נפילה מהצד)
 lbl('מסיבה · מנהרה מוארת בנרות תחת החיל',TXc,FT+6,-160,'azarah',90);lbl('מעלות יציאה אל שער טדי',TXc,FT+11,-230,'mount',90)}

/* ---- שער טדי: פתח מחודד מוצר (שתי אבנים נטויות), מסגרת אבן ודלתות מעוטרות פתוחות ---- */
{const cx=TXc,w2=4,hj=11,ha=15.5,wm=M.wallG;
 [-1,1].forEach(s=>{const sh=new T.Shape();sh.moveTo(cx+s*w2,hj);sh.lineTo(cx+s*w2,ha);sh.lineTo(cx,ha);sh.lineTo(cx+s*w2,hj);
  const ge=new T.ExtrudeGeometry(sh,{depth:8,bevelEnabled:false});ge.translate(0,0,-250);wuv(ge,8);const me=new T.Mesh(ge,wm);me.castShadow=me.receiveShadow=true;gM.add(me)});     // משולשי מילוי מעל הכתפיים
 [-250.8,-242].forEach(zz=>{const sh=new T.Shape();sh.moveTo(cx-w2-1.5,-.8);sh.lineTo(cx-w2-1.5,hj+.3);sh.lineTo(cx,ha+2);sh.lineTo(cx+w2+1.5,hj+.3);sh.lineTo(cx+w2+1.5,-.8);sh.lineTo(cx-w2-1.5,-.8);
  const ho=new T.Path();ho.moveTo(cx-w2,0);ho.lineTo(cx+w2,0);ho.lineTo(cx+w2,hj);ho.lineTo(cx,ha);ho.lineTo(cx-w2,hj);ho.lineTo(cx-w2,0);sh.holes.push(ho);
  const ge=new T.ExtrudeGeometry(sh,{depth:.8,bevelEnabled:false});ge.translate(0,0,zz);wuv(ge,8);const me=new T.Mesh(ge,M.nStoneL);me.castShadow=me.receiveShadow=true;gM.add(me)});   // מסגרת אבן מחודדת משני צדי החומה
 [-1,1].forEach(s=>box(gM,cx+s*(w2-.3),0,-244.4,.3,hj,3.9,M.gdoor,{ns:1}));box(gM,cx,0,-258,6,.06,16,M.dirt,{ns:1})}   // + דרך עפר מן השער אל קצה המרפסת                           // שני דפי הדלת פתוחים פנימה, צמודים לכתפיים

/* ---- בית המוקד: מקווה עגול שקוע ליד המדורה (הסרטון), ובית הכסא של כבוד ---- */
{const sh=new T.Shape();sh.moveTo(-94.5,111.5);sh.lineTo(-57.5,111.5);sh.lineTo(-57.5,123.5);sh.lineTo(-94.5,123.5);sh.lineTo(-94.5,111.5);
 const ho=new T.Path();ho.absarc(PX,-PZ,3.2,0,Math.PI*2,true);sh.holes.push(ho);const fg=new T.ShapeGeometry(sh,40);fg.rotateX(-Math.PI/2);fg.translate(0,Y+.07,0);
 const fu=fg.attributes.uv,fp=fg.attributes.position;for(let i=0;i<fu.count;i++)fu.setXY(i,fp.getX(i)/8,-fp.getZ(i)/8);const fm=new T.Mesh(fg,fMar);fm.receiveShadow=true;fm.userData.ns=true;g.add(fm);   // ריצוף עם פתח עגול
 const mRim=mk(0xe6d4b4,{roughness:.45,side:T.DoubleSide});
 const rim=new T.Mesh(new T.LatheGeometry([[2.65,-.5],[2.65,.75],[2.85,.9],[3,.9],[3.2,.75],[3.2,-.5]].map(p=>new T.Vector2(p[0],p[1])),40),mRim);rim.position.set(PX,Y,PZ);rim.castShadow=rim.receiveShadow=true;g.add(rim);
 const bas=new T.Mesh(new T.LatheGeometry([[2.7,0],[2.7,-.5],[2.2,-.5],[2.2,-1],[1.7,-1],[1.7,-1.6],[.01,-1.6]].map(p=>new T.Vector2(p[0],p[1])),40),mk(0xcdb892,{roughness:.6,side:T.DoubleSide}));bas.position.set(PX,Y,PZ);bas.receiveShadow=true;g.add(bas);
 const wt=new T.Mesh(new T.CircleGeometry(2.22,36),mk(0x4a93b8,{roughness:.1,metalness:.2,emissive:0x0c2430,transparent:true,opacity:.88}));wt.rotation.x=-Math.PI/2;wt.position.set(PX,Y-.9,PZ);g.add(wt);
 COL.push([PX-2.4,PX+2.4,PZ-2.4,PZ+2.4,Y,Y+1.4]);
 B(-93.4,Y,-122.25,2.2,5.5,2.5,0xd9c4a0,{c:1});box(g,-93.4,Y,-120.94,1.4,3.8,.12,M.wood,{ns:1});G(-93.4,Y+4.2,-120.9,.8,.45,.1);                       // בית הכסא של כבוד (נעול = תפוס)
 lbl('מקווה עגול · בית הטבילה',PX,Y+4.5,PZ,'azarah',60);lbl('בית הכסא של כבוד · נעול = תפוס',-93.4,Y+7.5,-121.5,'azarah',38);
 lbl('לשכה צפונית־מערבית · יורדים לבית הטבילה',-103,Y+19,-117,'azarah',100);lbl('מעלות מסתלסלות (מסיבה)',SX,Y+4,SZ,'azarah',45)}
}

/* ================= לשכת המלח ================= */
{const S0=snap();shell(-175,-155,-125,-112,16,[{s:'s',c:-165,w:7,h:11}],{lin:mk(0x6a4128),ceil:mk(0x4a2c18),fl:fWood});
 const sack=[0xd8c9a4,0xcdbb90,0xe3d6b4],unit=(x,z0,z1)=>{[1.2,4.4,7.6].forEach((y,k)=>{B(x,Y+y,(z0+z1)/2,1.6,.3,z1-z0,0x3f2412);for(let z=z0+.7;z<z1-.5;z+=1.15)B(x,Y+y+.3,z,1.1,1.3,.95,sack[(k+Math.round(z))%3])});B(x,Y,z0,.3,9,.3,0x3f2412);B(x,Y,z1,.3,9,.3,0x3f2412);COL.push([x-.8,x+.8,z0,z1,Y,Y+9])};
 unit(-172.4,-123,-114.5);unit(-157.6,-123,-114.5);                                                                      // מדפי שקי מלח
 B(-165,Y,-122,5,2,3,0x7a5230,{c:1});Sp(-165,Y+2,-122,2.2,1.1,1.2,0xf4f1e8);B(-162.5,Y+1.1,-120.3,.3,.2,1.6,0x5a3a20,{ry:.6});         // ארגז מלח וערימה
 Cy(-168.5,Y,-117.5,1.3,2,0x7a4f2c,{c:1});Cy(-161.5,Y,-117.5,1.3,2,0x7a4f2c,{c:1});Cy(-168.5,Y+.6,-117.5,1.36,.15,0x2a1a0e);Cy(-161.5,Y+.6,-117.5,1.36,.15,0x2a1a0e);
 ladder(-156.9,-114.6,'z',8.5,0x6a4426);Tc(-173.3,Y+9.5,-118);Tc(-156.7,Y+9.5,-118);
 lbl('לשכת המלח',-165,Y+19,-117.5,'azarah',150);lbl('שקי מלח',-172.4,Y+5,-118,'azarah',35);lbl('ערמת מלח',-165,Y+4.5,-122,'azarah',35);mv(S0,-165,-118.5,90,-168.5,-115);}   // לשכת המלח: בפינה הצפונית־מערבית, בקיר המערבי של העזרה (הדלת למזרח)

/* ================= לשכת הפרווה (מלח וגרירת עורות) ================= */
{const S0=snap();shell(-153,-133,-125,-112,16,[{s:'s',c:-143,w:7,h:11}],{lin:mk(0x5e3a22),ceil:mk(0x432818),fl:fWood});
 const hide=[0x8b3a2a,0xa8643a,0xc78d55];
 B(-143,Y+8.5,-123.2,12,.2,.2,0x3a2312);rep(9,i=>B(-148.5+i*1.4,Y+5,-123.2,1.1,3.4,.12,hide[i%3]));                    // עורות תלויים
 B(-136.4,Y,-118.7,2.4,1.7,7,0x6b4426,{c:1});B(-136.4,Y+1.7,-118.7,1.4,.05,5.6,0x120a05);rep(3,i=>B(-136.4,Y+1.75,-120.7+i*2.1,1.2,.12,1.8,hide[i]));   // שולחן עם גומחה לעורות
 Cy(-148.2,Y,-119.6,2,2.4,0x7a4f2c,{c:1});Cy(-148.2,Y+.6,-119.6,2.06,.18,0x2a1a0e);Cy(-148.2,Y+1.6,-119.6,2.06,.18,0x2a1a0e);Cy(-148.2,Y+2.4,-119.6,1.7,.15,0x9a3a2a);      // גיגית מלח
 rep(4,i=>B(-147.5,Y+i*.25,-115,2.4-i*.1,.25,2.2,hide[i%3]));B(-142,Y,-115.6,3,.3,1.8,0x6a4426);Lg(-139.5,Y+.4,-115.6,.1,3,0xc8b890,'x');B(-142,Y+.3,-115.6,2.4,.15,1.4,hide[1]);   // מזחלת גרירת עורות עם חבל
 ladder(-150.8,-121.2,'x',9,0x6a4426);rep(3,i=>B(-135.5,Y+i*.9,-114.7,1.3,.9,.9,0xd8c9a4));Tc(-151.3,Y+9.5,-117);Tc(-134.9,Y+9.5,-121);
 lbl('לשכת הפרווה',-143,Y+19,-117.5,'azarah',150);lbl('מלח עורות הקדשים',-148.2,Y+4.5,-119.6,'azarah',35);lbl('שולחן עורות',-136.4,Y+3,-117.5,'azarah',35);mv(S0,-143,-118.5,180,-165,3.5);}   // לשכת הפרווה: בפינה הדרומית־מערבית של העזרה (הדלת צפונה)

/* ================= לשכת המדיחין ================= */
{const S0=snap();shell(-131,-111,-125,-112,16,[{s:'s',c:-121,w:7,h:11}],{lin:mk(0x5e3a22),ceil:mk(0x432818),fl:fChk});
 B(-121,Y,-120.5,9,1.5,3,0xcfc4aa,{c:1});rep(3,i=>{Cy(-124+i*3,Y+1.5,-120.5,1.0,.18,0xb87a3a);Cy(-124+i*3,Y+1.65,-120.5,.85,.04,0x3a7fb0)});   // שולחן שיש עם אגנים לשטיפת קרבים
 B(-127.6,Y,-121,2.4,1.6,5,0xdcd0b8,{c:1});B(-114.4,Y,-121,2.4,1.6,5,0xdcd0b8,{c:1});B(-127.6,Y+1.6,-121,1.8,.04,4.4,0x3a7fb0);B(-114.4,Y+1.6,-121,1.8,.04,4.4,0x3a7fb0);   // מדיחי קרבים (בריכות)
 Lg(-121,Y+5.5,-123.1,.25,16,0xb87a3a,'x');rep(3,i=>Cy(-127+i*5,Y+3.5,-123.1,.12,2,0xb87a3a));                           // צינור מים וברזים
 [[-117,-114.8],[-115.2,-114.6]].forEach(p=>{Cy(p[0],Y,p[1],.8,1.3,0x6a4426);Cy(p[0],Y+1,p[1],.85,.12,0x2a1a0e)});[-126.5,-125.1,-123.7].forEach(x=>Cy(x,Y,-114.8,.6,1.1,0x7a5230));
 rep(5,i=>B(-129+i*.9,Y+3.2,-113.8,.7,3.6,.12,0xe0d8c4));ladder(-129.6,-117.5,'z',9,0x6a4426);Tc(-129.3,Y+9.5,-116);Tc(-112.7,Y+9.5,-116);
 lbl('לשכת המדיחין',-121,Y+19,-117.5,'azarah',150);lbl('מדיחי קרבים',-127.6,Y+3.5,-121,'azarah',35);lbl('שולחן שטיפה',-121,Y+3.5,-120.5,'azarah',35);mv(S0,-121,-118.5,180,-58,3.5);}   // לשכת המדיחין: בקיר הדרומי (הדלת צפונה)

/* ================= בית אבטינס (קטורת) – בדרום העזרה בין לשכת העץ לשער הבכורות ================= */
{shell(-83,-70,-2,10,16,[{s:'n',c:-76.5,w:5,h:12}],{lin:mk(0x1e2d56),ceil:mk(0x172346),fl:fChk});
 [1.5,4.2,6.9,9.6].forEach((y,k)=>{B(-76.5,Y+y,7.7,8,.3,1.4,0x3f2412);rep(8,i=>Jr(-79.8+i*.95,Y+y+.3,7.7,.95,[0xa8522a,0x8f4524,0x6a3a1c][(i+k)%3]))});COL.push([-81.5,-71.5,7,8.5,Y,Y+11]);
 rep(5,i=>{B(-81.35,Y+3,.2+i*1.8,.15,11,1.7,i%2?0x1e2d56:0x2a3d70);B(-71.65,Y+3,.2+i*1.8,.15,11,1.7,i%2?0x1e2d56:0x2a3d70)});     // וילונות כחולים
 B(-76.5,Y+1.3,4.5,2.2,.2,1.4,0xd4a94a,{c:1});[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(a=>G(-76.5+a[0]*.9,Y,4.5+a[1]*.55,.15,1.3,.15));Cy(-77,Y+1.5,4.5,.55,.7,0xe6dcc8);Lg(-76.6,Y+2.4,4.5,.07,1.4,0x8a5a28,'x');Cy(-75.9,Y+1.5,4.5,.45,.3,0xe6dcc8);
 Tc(-81.2,Y+8.5,1);Tc(-71.8,Y+8.5,1);Jr(-80.5,Y,3.2,2.4,0xa8522a);Jr(-72.5,Y,3.4,2,0x8f4524);
 lbl('בית אבטינס · הקטורת',-76.5,Y+19,2.5,'azarah',130);lbl('מדפי כדי קטורת',-76.5,Y+8,7.7,'azarah',35);lbl('מכתש ושולחן זהב',-76.5,Y+3.5,4.5,'azarah',30)}

/* ================= לשכת פרהדרין (לשכת כהן גדול) – בדרום העזרה, מערבית לשער המים ================= */
{const S0=snap();shell(-134,-124,-2,10,16,[{s:'n',c:-129,w:5,h:11}],{lin:mk(0xe9dcc0),ceil:mk(0xc9b48e),fl:fChk});
 B(-131.5,Y,5,1.9,.5,4.2,0x6a4426,{c:1});B(-131.5,Y+.5,5,1.7,.4,3.9,0xe8e6e0);B(-131.5,Y+.9,3.4,1.2,.3,.8,0xf5f1e6);B(-131.5,Y+.9,5.6,1.7,.2,2.4,0x2a5aa8);    // מיטה, כרית ושמיכה
 [[-132.3,3],[-130.7,3],[-132.3,7],[-130.7,7]].forEach(q=>B(q[0],Y,q[1],.2,7,.2,0x6a4426));B(-131.5,Y+7,5,1.9,.3,4.4,0x2a3d70);                              // ארבעה עמודי חופה ווילון כחול
 B(-126.4,Y,5,1.6,1.2,2.4,0x7a5230,{c:1});Lg(-126.4,Y+1.45,4.5,.2,1.1,0xe9dcc0,'x');Lg(-126.4,Y+1.45,5.6,.2,1.1,0xe9dcc0,'x');Cy(-126.6,Y+1.2,6,.25,.35,0x8a5a28);Fl(-126.6,Y+1.95,6,.12,.22,.12);   // שולחן עם מגילות ונר
 B(-129,Y+3,8.05,6,.3,.8,0x6a4426);rep(6,i=>Lg(-131.5+i*1,Y+3.55,8.05,.3,.8,[0xe9dcc0,0xd8c9a4][i%2],'x'));Tc(-132.4,Y+8,2);Tc(-125.7,Y+8,2);
 lbl('לשכת פרהדרין · כהן גדול',-129,Y+19,4,'azarah',130);lbl('מיטת כהן גדול',-131.5,Y+3,5,'azarah',30);lbl('שולחן ומגילות',-126.4,Y+3.4,5,'azarah',30);mv(S0,-129,4,180,-45,-119)}   // לשכת פרהדרין: בצפון־מזרח, מזרחית לבית המוקד (הדלת דרומה)

/* ================= לשכת העץ ================= */
{shell(-110,-85,-2,10,16,[{s:'n',c:-97,w:7,h:11}],{lin:mk(0xe2d4b8),ceil:mk(0xc9b48e),fl:fChk});
 [-105.5,-89.5].forEach((px,pi)=>{for(let L=0;L<5;L++){const n=5-L;for(let k=0;k<n;k++){const x=px+(k-(n-1)/2)*1.1,y=Y+.55+L*.95;Lg(x,y,3.7,.55,6,(k+L+pi)%2?0x6b4a2b:0x7a5a38,'z');Lg(x,y,.7,.53,.06,0xd8b98a,'z');Lg(x,y,6.7,.53,.06,0xd8b98a,'z')}}COL.push([px-2.9,px+2.9,.5,6.9,Y,Y+5])});   // ערימות גזעים
 B(-97.5,Y,7.6,4.6,1.4,1.4,0x6b4a2b,{c:1});Lg(-98.5,Y+1.85,7.6,.35,1.8,0x6b4a2b,'x');Lg(-96.5,Y+1.7,7.4,.3,1.4,0x7a5a38,'x');Cy(-95.7,Y+1.4,7.6,.3,.3,0x8a5a28);Fl(-95.7,Y+2.1,7.6,.14,.25,.14);Cy(-97.5,Y,5.9,.6,1,0x7a5230);   // שולחן בדיקת עצים עם נר וגרזן
 rep(6,i=>B(-101.2,Y+i*.2,7.8,2.6,.2,1.2,[0xc88a4a,0xb87a3a][i%2]));Tc(-108.1,Y+9.5,3);Tc(-86.9,Y+9.5,3);
 lbl('לשכת העץ',-97.5,Y+19,3.5,'azarah',150);lbl('ערימות גזעים',-105.5,Y+6.5,3.7,'azarah',40);lbl('ערימות גזעים',-89.5,Y+6.5,3.7,'azarah',40);lbl('בדיקת עצים (תולעים)',-97.5,Y+4.5,7.6,'azarah',35);lbl('קרשים לשימוש',-101.2,Y+3,7.8,'azarah',30);}

/* ================= לשכת הגולה (בור וגלגל) ================= */
{const S0=snap();shell(-165,-135,-2,10,16,[{s:'n',c:-150,w:7,h:11}],{lin:mk(0xe2d4b8),ceil:mk(0xc9b48e),fl:fChk});
 Cy(-150,Y,5.5,2.2,1.3,0xc9bea4,{c:1});Cy(-150,Y+1.31,5.5,1.5,.02,0x0e1620);                                          // בור (שפת בור)
 B(-153.2,Y,5.5,.6,6.4,.6,0x6a4426,{c:1});B(-146.8,Y,5.5,.6,6.4,.6,0x6a4426,{c:1});Lg(-150,Y+6.2,5.5,.38,7.4,0x5a3a20,'x');
 B(-145.9,Y+6.2,6.4,.25,.25,1.8,0x2a1a0e);Lg(-145.9,Y+6.2,7.3,.18,.9,0x2a1a0e,'x');Cy(-150,Y+1.9,5.5,.12,4.3,0xc8b890);Cy(-150,Y+1.4,5.5,.7,.9,0x6a4426);
 const wh=new T.Mesh(new T.TorusGeometry(2.3,.18,6,20),M.wood);wh.rotation.y=Math.PI/2;wh.position.set(-152.2,Y+6.2,5.5);wh.castShadow=true;g.add(wh);   // הגלגל
 rep(3,k=>ad(PL,-152.2,Y+6.2,5.5,.1,4.6,.1,0x5a3a20,0,0,k*Math.PI/3));
 B(-138,Y,2.5,1.6,1,7,0x8c7a5a,{c:1});B(-138,Y+.95,2.5,1.2,.05,6.4,0x3a7fb0);rep(3,i=>Cy(-162.2,Y,.5+i*1.4,.6,.9,0x6a4426));rep(2,i=>Cy(-141+i*1.3,Y,7.6,.6,.9,0x6a4426));
 B(-163.2,Y+3,3.5,1,.3,8,0x6a4426);rep(5,i=>Jr(-163.2,Y+3.3,.2+i*1.5,1,0xa8522a));B(-163.2,Y,3.5,.5,3,7.6,0x6a4426);Tc(-163.3,Y+8.5,1);Tc(-136.7,Y+8.5,1);
 lbl('לשכת הגולה',-150,Y+19,3.5,'azarah',150);lbl('בור הגולה',-150,Y+3.4,5.5,'azarah',40);lbl('גלגל וחבל',-152.2,Y+9,5.5,'azarah',40);lbl('שואבים מים לכל העזרה',-138,Y+2.5,2.5,'azarah',30);mv(S0,-150,4,0,-138,4);}   // לשכת הגולה: הוזזה 12 אמות מזרחה (x -153..-123), מזרחית ללשכת הפרווה

/* ================= לשכת הגזית – הסנהדרין (חציה בחול וחציה בקודש) ================= */
{const S0=snap(),gx=-36,gz=14;
 ZN.push({r:[-49.5,-22.5,15,24.1],y:Y});
 box(g,gx,0,19.5,30,Y-.3,9,M.stone,{ns:0});COL.push([-51,-21,15,24,0,12]);box(g,gx,Y-.3,19.5,30,.3,9,M.stone,{ns:1});                                   // אצטבה/בסיס בחול (מתחת לחלקה הדרומי)
 shell(-51,-21,-6,24,24,[{s:'n',c:-36,w:8,h:14},{s:'s',c:-46,w:5,h:12},{s:'s',c:-26,w:5,h:12}],{lin:mk(0xcf9f88),ceil:mk(0xe9c9ae),fl:fRose});
 ROOFS.push(box(g,gx,Y+25,9,32,1.2,32,mk(0x4b4b53)));
 stairs(gC,-46,39,[0,-1],5,32,.5,.47,0,M.nDark);stairs(gC,-26,39,[0,-1],5,32,.5,.47,0,M.nDark);   // מדרגות מן החיל (חול)
 const chair=(x,z,th,col,big)=>{const s=Math.sin(th),c=Math.cos(th),bx=x-.42*s,bz=z-.42*c;B(x,Y+1,z,big?1.5:.95,.18,big?1.5:.95,col,{ry:th});B(bx,Y+1.1,bz,big?1.5:.95,big?2.8:1.7,.14,col,{ry:th});B(x,Y,z,.55,1,.55,0x3a1a14,{ry:th});COL.push([x-.55,x+.55,z-.55,z+.55,Y,Y+2.8])};
 [[5.2,15],[7.9,23],[10.5,33]].forEach(([R,n],ri)=>{for(let i=0;i<n;i++){const ph=Math.PI*(.06+.88*i/(n-1)),x=gx+R*Math.cos(ph),z=gz-R*Math.sin(ph),big=ri==2&&i==16;chair(x,z,ph-Math.PI/2,big?0xb88a3a:0x7a2433,big)}});   // 71 כיסאות בחצי עיגול, הנשיא באמצע
 B(gx,Y,gz-12.3,3.4,.5,1,0xb88a3a);                                                                                       // הדום הנשיא
 [-3,3].forEach(s=>{B(gx+s,Y,gz-4.3,1.8,1.3,.9,0x6a4426,{c:1});Lg(gx+s,Y+1.45,gz-4.3,.15,1.2,0xe9dcc0,'x')});B(gx,Y,gz+3,2.6,.9,.8,0x6a4426);   // שני סופרי הדיינים + ספסל
 B(-23.4,Y,5.75,1.3,7,17.5,0x7e8b92,{c:1});rep(5,r=>rep(14,k=>B(-24.1,Y+.8+r*1.3,-2.5+k*1.2,.12,1.05,1,[0x6f8591,0x8a98a0,0x5f7480][(r+k)%3])));   // ארכיון (מגירות)
 const PI=Math.PI;rep(6,i=>{const z=-2.25+4.5*i;Wn(-49.3,Y+7,z,PI/2,1.9);Wn(-51,Y+7,z,-PI/2,1.9);Wn(-21,Y+7,z,PI/2,1.9);if(i<2||i>4)Wn(-22.7,Y+7,z,-PI/2,1.9)});   // חלונות קשתיים (פנים וחוץ)
 [-45,-27].forEach(x=>Wn(x,Y+7,-4.3,0,1.9));[-39,-33].forEach(x=>Wn(x,Y+7,22.3,PI,1.9));[-40.5,-36,-31.5].forEach(x=>Wn(x,1,24,0,2.2,1));
 rep(7,i=>{const z=-4.5+4.5*i;Cy(-49,Y,z,.55,14,0xe6d4b8);G(-49,Y+14,z,1.5,.6,1.5);if(i>4){Cy(-23,Y,z,.55,14,0xe6d4b8);G(-23,Y+14,z,1.5,.6,1.5)}});   // עמודונים עם כותרות זהב
 [-42,-36,-30].forEach(x=>Fl(x,Y+23.5,9,.5,.15,17,0xfff2d0));light(0xffe2c0,.8,52,gx,Y+16,9);
 Tc(-49.1,Y+7,-1);Tc(-49.1,Y+7,20);
 lbl('לשכת הגזית · סנהדרין גדולה',gx,Y+30,9,'azarah',200);lbl('כיסאות הסנהדרין (71)',gx,Y+4,gz-9,'azarah',55);lbl('מושב הנשיא',gx,Y+4.5,gz-10.5,'azarah',40);lbl('סופרי הדיינים',gx-3,Y+3,gz-4.3,'azarah',35);lbl('ארכיון',-23.5,Y+9,6,'azarah',40);lbl('חציה בחול, חציה בקודש',gx,Y+10,17,'azarah',70);
 mv(S0,-36,9,180,-25.5,-129);   // לשכת הגזית: בצפון־מזרח – חציה בקודש (דרום לקיר הצפוני) וחציה בחול; סיבוב 180° סביב מרכזה
 box(g,-25.5,0,-132.5,30,Y-.3,5,M.stone,{c:1});ZN.push({r:[-39,-12,-135.1,-129.9],y:Y});}   // גשר הבסיס בין רצפת העזרה (z=-130) לבסיס החלק החיצוני

/* ================= לשכות פנחס המלביש ועושי החביתין (בקיר ניקנור) ================= */
[[-83.5,0],[-31.5,1]].forEach(([c,k])=>{
 wall(g,'z',12.3,c-9,c+9,YI,12,.6,mCream,[{c,w:7,h:10,nd:1}]);box(g,16.65,YI,c,.7,12,18,mCream,{c:1});
 FL(12.6,16.3,c-8.9,c+8.9,fChk,YI);door({s:'w',c,w:7,h:10},12,17,c-9,c+9,.6,YI);
 if(!k){const col=[0xf1ede4,0x2a5aa8,0x7a3a8a,0xb3262e,0xf1ede4,0xe8d8a0];                                                  // פנחס המלביש – בגדי כהונה
  B(16.1,YI+7,c+3,.12,.12,10,0x5a3a20);rep(7,i=>{const z=c-.7+i*1.4;B(16,YI+3.2,z,.12,3.8,.95,col[i%6]);B(16,YI+4.6,z,.14,.35,1.0,0xb3262e);Sp(16,YI+7.5,z,.4,.3,.4,0xf1ede4)});
  B(13.9,YI,c+6.5,1.6,1.1,4,0x7a5230,{c:1});rep(4,i=>B(13.9,YI+1.1+i*.12,c+6.5,1.3,.12,1.2,col[i%6]));
  [1.5,3.5,5.5].forEach((y,j)=>{B(15.5,YI+y,c-5,1.4,.25,6,0x6a4426);rep(5,i=>Lg(15.45,YI+y+.55,c-7.2+i*1.1,.3,1.3,[0x2a5aa8,0xf1ede4,0xb3262e,0x7a3a8a,0xe8d8a0][(i+j)%5],'x'))});
  Tc(16,YI+8,c-6.5);Tc(16,YI+8,c+7);lbl('לשכת פנחס המלביש',13.5,YI+13,c,'azarah',130);lbl('בגדי כהונה',16,YI+8.5,c+3,'azarah',35);lbl('מדפי בדים ומגילות',15.5,YI+8,c-5,'azarah',35)}
 else{B(15.45,YI,c-4.5,1.7,1.5,7,0xe6dcc8,{c:1});B(15.4,YI+1.5,c-4,1.1,.04,1.8,0x1a1008);[-4.6,-3.4].forEach(z=>Fl(15.4,YI+1.56,c+z+.6,.5,.05,.55,0xff6a20));   // שולחן שיש עם גומחת גחלים
  rep(6,i=>{const z=c-7.5+i*1.2;Lg(16.1,YI+5.2,z,.85,.12,0x15100c,'x');B(16.05,YI+6.6,z,.2,2.2,.25,0x2a1d14)});                // מחבתות תלויות
  rep(4,i=>Cy(15.2,YI+1.5+i*.22,c-2,.8,.2,0x1d1612));rep(4,i=>Jr(15.5,YI+1.5,c-7+i*1.1,1.1,0xa4552c));rep(3,i=>Jr(13.6,YI,c+4.6+i*1.4,2.2,0xa4552c));   // קערות וכדי שמן
  B(14.4,YI,c+7.6,3,2.4,2.4,0xcdbf9f,{c:1});Fl(12.9,YI+1.2,c+7.6,.1,.7,.9,0xff7020);Tc(16,YI+8,c-6);Tc(16,YI+8,c+5);
  lbl('לשכת עושי חביתין',13.5,YI+13,c,'azarah',130);lbl('מחבתות חביתין',16,YI+7.5,c-5,'azarah',35);lbl('תנור וגחלים',15,YI+3,c+7.6,'azarah',35);lbl('כדי שמן',13.6,YI+3.5,c+6,'azarah',30)}});

/* ================= דלתות ניקנור (ארד מגולף, פתוחות לתוך העזרה) ================= */
[-1,1].forEach(s=>box(g,9.5,YI,ZC+s*5.1,5,19.4,.3,M.nikn,{ns:1}));

/* ================= שערי הצפון והדרום: מסגרת, עמודי שיש, חלונות קשתיים, דלתות זהב פתוחות (לחיי המדרגות והכדורים נבנים ב-app.js: bal) ================= */
{[[-151,'n'],[-121,'n'],[-116,'s'],[-43,'s'],[-27,'s'],[-11,'s']].forEach(([gx,sd])=>{const n=sd=='n',fz=n?-130:15,wz=n?-127.5:12.5,o=n?-1:1,ry=n?Math.PI:0;
  [-1,1].forEach(s=>box(g,gx+s*4.75,Y,wz,.3,19.4,4.4,M.gdoor,{ns:1}));
  [-1,1].forEach(s=>{Cy(gx+s*6.4,Y-.5,fz+o*.9,.85,20.7,0xe9e1cc);G(gx+s*6.4,Y+19.6,fz+o*.9,2.1,.7,2.1)});
  const GT=[[-151,'n'],[-121,'n'],[-116,'s'],[-43,'s'],[-27,'s'],[-11,'s']],free=(wx)=>!GT.some(([x2,s2])=>s2==sd&&x2!=gx&&Math.abs(wx-x2)<8.4);   // חלון לא יוצב מול פתח של שער שכן (היה תלוי באוויר)
  [8.8,11.8].forEach(d=>[-1,1].forEach(s=>{if(free(gx+s*d))Wn(gx+s*d,Y+5,fz,ry,1.1)}));[-1,0,1].forEach(k=>{if(free(gx+k*5))Wn(gx+k*5,Y+27,fz,ry,.9)})});
 G(-136,Y+35,-130.15,46,.5,.35);G(-136,Y+21.2,-130.15,46,.4,.3)}                                                          // פסי זהב לאורך חזית שערי הצפון

/* ================= מגדל שער הניצוץ: חדר עליון ומעלות מסתלסלות (24 מעלות, סיבוב אחד, מהחיל עד הפתח) ================= */
{const S0=snap(),sx=.6,sz=-136.7,Rc=1.8,aEnd=Math.PI*.75,D=Math.PI/14.4;
 shell(-8.5,-.5,-126,-116,10,[{s:'n',c:-4,w:3.6,h:7.5,nf:1}],{y0:Y+20,lin:mk(0xe9dcc0),ceil:mk(0xc9b48e),fl:fChk});
 box(g,-4.5,Y+19,-121,9.2,1,10.2,M.stone,{ns:1});box(g,-7.7,YI,-117,1.6,Y+19-YI,1.6,M.stone,{c:1});box(g,-1.3,YI,-117,1.6,Y+19-YI,1.6,M.stone,{c:1});
 ZN.push({r:[-8.5,-.5,-126,-116],y:Y+20});
 B(-4.5,Y+20,-117.2,3,.9,.8,0xe2d3ba);Jr(-7,Y+20,-124.5,2,0xa8522a);Tc(-7.8,Y+29,-121);Tc(-1.2,Y+29,-121);
 rep(24,k=>{const a=aEnd+(23-k)*D,x=sx+3*Math.cos(a),z=sz+3*Math.sin(a),y=1.5*(k+1);B(x,y-.5,z,2.4,.5,1,0xc9bea4,{ry:-a});ZN.push({r:[x-.75,x+.75,z-.75,z+.75],y:y})});
 box(g,-3.5,Y+19,-131.5,5.6,1,6.5,M.stone,{ns:1});ZN.push({r:[-6.3,-.7,-135.2,-125],y:Y+20});COL.push([-5.8,-2.2,-130,-125,Y,Y+19.5]);   // רחבת כניסה אל הפתח בקיר
 cyl(g,sx,0,sz,Rc,Y+21,mStoneRaw,16);sph(g,sx,Y+21.8,sz,1.4,M.gold);
 // חדר עליון מעל הפתח: אבן עם חלונות קשתיים וגג עם מעקה
 box(g,-14.25,Y+20,-121,11.5,10,10,M.stone);[-18.5,-15.5,-12.5].forEach(x=>Wn(x,Y+24,-115.95,0,.9));
 ROOFS.push(box(g,-14.25,Y+30,-121,12.5,1.2,11,M.marble));box(g,-14.25,Y+31.2,-121,13.4,1.2,11.9,M.marble,{ns:1});
 lbl('חדר עליון · כהנים שומרים',-6,Y+33,-121,'azarah',120);lbl('מעלות מסתלסלות',sx,Y+24,sz,'azarah',90);mv(S0,0,0,0,-139,0)}   // מגדל הניצוץ הוזז מערבה עם שער הניצוץ (x=-151)

/* ---- סיום: בניית המופעים ---- */
POOL.forEach(fin);
}
