'use strict';
/* ===== בית המקדש השני – בניה פרוצדורלית. יחידה אחת = אמה. x=מזרח, z=דרום, y=גובה ===== */
const T=THREE,$=id=>document.getElementById(id);
const ZC=-57.5,YN=6,YI=13.5,YA=16,YH=22;            // ציר המקדש; מפלסים: נשים, ישראל, כהנים, היכל
let _s=11;const rand=()=>(_s=_s*16807%2147483647)/2147483647;
const COL=[],ZN=[],LBL=[],ROOFS=[],GRP={},cols=[],PGS=[];

/* ---------- renderer / scene ---------- */
const renderer=new T.WebGLRenderer({canvas:$('c'),antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.78;
const scene=new T.Scene();scene.fog=new T.Fog(0xbcd4ec,900,4200);scene.background=new T.Color(0xbcd4ec);
const camera=new T.PerspectiveCamera(55,innerWidth/innerHeight,.3,8000);
const hemi=new T.HemisphereLight(0xbfd8ff,0x8a7a5a,.7);scene.add(hemi);
const sun=new T.DirectionalLight(0xfff0d0,1.2);sun.castShadow=true;sun.shadow.mapSize.set(4096,4096);
Object.assign(sun.shadow.camera,{left:-420,right:420,top:420,bottom:-420,near:10,far:2200});sun.shadow.bias=-.0006;sun.shadow.normalBias=.6;
scene.add(sun,sun.target);sun.target.position.set(-40,0,-40);
const grp=n=>{const g=new T.Group();GRP[n]=g;scene.add(g);return g};

/* ---------- טקסטורות פרוצדורליות ---------- */
function cv(w,h,f,srgb=true){const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;if(srgb)t.encoding=T.sRGBEncoding;return t}
function blocks(base,joint,rows,sh){return cv(256,256,(c,w,h)=>{c.fillStyle=joint;c.fillRect(0,0,w,h);const rh=h/rows;
 for(let r=0;r<rows;r++){let x=0;while(x<w){let bw=rand()<.5?64:128;if(x+bw>w)bw=w-x;const s=(rand()-.5)*sh;
  c.fillStyle=`rgb(${base[0]+s|0},${base[1]+s|0},${base[2]+s|0})`;c.fillRect(x+2,r*rh+2,bw-3,rh-3);x+=bw}}
 for(let i=0;i<900;i++){c.fillStyle=`rgba(${rand()<.5?'0,0,0':'255,255,255'},${rand()*.07})`;c.fillRect(rand()*w,rand()*h,1+rand()*3,1+rand()*3)}})}
const tStone=blocks([221,205,170],'#a89878',4,26),tMarble=blocks([244,241,232],'#cfc9bb',2,10),
 tFloor=cv(256,256,(c,w,h)=>{c.fillStyle='#8f836c';c.fillRect(0,0,w,h);for(let i=0;i<4;i++)for(let j=0;j<4;j++){const s=(rand()-.5)*8+((i+j)%2?-16:6);c.fillStyle='rgb('+(208+s|0)+','+(192+s|0)+','+(160+s|0)+')';c.fillRect(i*64+1.5,j*64+1.5,61,61)}}),
 tWood=cv(128,128,(c,w,h)=>{c.fillStyle='#6b4a2b';c.fillRect(0,0,w,h);for(let i=0;i<40;i++){c.fillStyle=`rgba(${rand()<.5?'30,15,0':'160,110,60'},.25)`;c.fillRect(0,rand()*h,w,1+rand()*2)}}),
 tDirt=cv(256,256,(c,w,h)=>{c.fillStyle='#a99a76';c.fillRect(0,0,w,h);for(let i=0;i<2500;i++){const s=rand()*60-30;c.fillStyle=`rgba(${150+s|0},${135+s|0},${95+s|0},.5)`;c.fillRect(rand()*w,rand()*h,2+rand()*5,2+rand()*5)}}),
 tLat=cv(64,64,(c,w,h)=>{c.clearRect(0,0,w,h);c.strokeStyle='#7a5a2a';c.lineWidth=5;c.beginPath();c.moveTo(0,0);c.lineTo(w,h);c.moveTo(w,0);c.lineTo(0,h);c.stroke();c.strokeRect(0,0,w,h)}),
 tCurt=cv(64,256,(c,w,h)=>{['#2b5aa8','#f1ead2','#b3262e','#6a2a86'].forEach((k,i)=>{c.fillStyle=k;c.fillRect(0,i*64,w,64)});c.fillStyle='rgba(0,0,0,.18)';for(let x=0;x<w;x+=8)c.fillRect(x,0,3,h)});
const mk=(c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,roughness:.85,metalness:0},o));
const M={stone:mk(0xffffff,{map:tStone}),marble:mk(0xffffff,{map:tMarble,roughness:.55}),floor:mk(0xffffff,{map:tFloor}),wood:mk(0xffffff,{map:tWood}),
 dirt:mk(0xffffff,{map:tDirt}),gold:mk(0xf0c040,{metalness:.65,roughness:.3,emissive:0x3a2600}),bronze:mk(0x9a6a30,{metalness:.5,roughness:.4}),
 dark:mk(0x2a2118),ash:mk(0x55504a),coal:mk(0x16130f,{roughness:1}),dstone:mk(0x6b6156,{roughness:.9}),plaster:mk(0xf1ece0,{roughness:.9}),red:mk(0x9a3a2a),water:mk(0x3a7fb0,{roughness:.1,metalness:.2}),stoneRaw:mk(0xb9ab8c),
 flame:new T.MeshBasicMaterial({color:0xffa030}),fire2:new T.MeshBasicMaterial({color:0xffe070}),
 curt:mk(0xffffff,{map:tCurt,side:T.DoubleSide}),curt2:mk(0xa4636a,{side:T.DoubleSide,roughness:.95}),leaf:mk(0x6b7a3c),grass:mk(0x8a8a58)};
M.stone.userData.tile=8;M.marble.userData.tile=10;M.floor.userData.tile=16;M.wood.userData.tile=4;M.dirt.userData.tile=40;
/* ==== NZ-MAT-BEGIN: חומרים וטקסטורות לחיל/עזרת נשים/לשכות (נדגמו מהסרטון; RNG פרטי כדי לא לשנות את rand הגלובלי) ==== */
const NZR=(()=>{let s=4242;return()=>(s=s*16807%2147483647)/2147483647})();
{const r=NZR;
 // אבני גזית גדולות: צבע חום־זהוב (#cdba8c), פס אור בקצה עליון/שמאלי וצל תחתון/ימני
 const ashlar=(base,joint,rows,widths,sh)=>cv(256,256,(c,w,h)=>{c.fillStyle=joint;c.fillRect(0,0,w,h);const rh=h/rows;
  for(let k=0;k<rows;k++){let x=0;while(x<w){let bw=widths[r()*widths.length|0];if(x+bw>w-24)bw=w-x;const s=(r()-.5)*sh;
   c.fillStyle='rgb('+(base[0]+s|0)+','+(base[1]+s*.95|0)+','+(base[2]+s*.8|0)+')';c.fillRect(x+1.5,k*rh+1.5,bw-3,rh-3);
   c.fillStyle='rgba(255,246,220,.28)';c.fillRect(x+1.5,k*rh+1.5,bw-3,2);c.fillRect(x+1.5,k*rh+1.5,2,rh-3);
   c.fillStyle='rgba(60,40,10,.22)';c.fillRect(x+1.5,k*rh+rh-4.5,bw-3,3);c.fillRect(x+bw-4.5,k*rh+1.5,3,rh-3);x+=bw}}
  for(let i=0;i<1400;i++){c.fillStyle='rgba('+(r()<.5?'70,50,20':'255,250,230')+','+r()*.08+')';c.fillRect(r()*w,r()*h,1+r()*3,1+r()*2)}});
 const mkm=(c,o)=>new T.MeshStandardMaterial(Object.assign({color:new T.Color(c).convertSRGBToLinear(),roughness:.85,metalness:0},o||{}));   // r128: צבע hex נחשב ליניארי, לכן ממירים מ-sRGB (כדי להתאים לצבעי הסרטון)
 M.nStone=mkm(0xffffff,{map:ashlar([205,186,140],'#85704c',4,[96,128,160],30)});M.nStone.userData.tile=8;
 M.nStoneL=mkm(0xffffff,{map:ashlar([230,219,190],'#9a8a68',4,[96,128,160],16)});M.nStoneL.userData.tile=8;
 // שיש בהיר גדול (לוחות כ-5 אמות, ווריד דק)
 const veins=(c,x,y,s,n,a)=>{for(let k=0;k<n;k++){c.strokeStyle='rgba(150,138,118,'+(a*(.4+r()*.6))+')';c.lineWidth=.7+r()*1.6;c.beginPath();let px=x+r()*s,py=y+r()*s;c.moveTo(px,py);
   for(let j=0;j<4;j++){px+=(r()-.3)*s*.35;py+=(r()-.5)*s*.3;c.lineTo(px,py)}c.stroke()}};
 const marbleTex=cv(512,512,(c,w,h)=>{c.fillStyle='#b4a890';c.fillRect(0,0,w,h);const n=3,s=w/n;
  for(let i=0;i<n;i++)for(let j=0;j<n;j++){const v=(r()-.5)*10;c.fillStyle='rgb('+(214+v|0)+','+(205+v|0)+','+(184+v|0)+')';c.fillRect(i*s+1.5,j*s+1.5,s-3,s-3);veins(c,i*s,j*s,s,6,.3)}});
 M.nFloor=mkm(0xffffff,{map:marbleTex,roughness:.5});M.nFloor.userData.tile=16;
 // רצפת לשכה: שיש + גבול פסיפס (כחול/חום/שמנת) כמו בסרטון
 const mosaic=cv(512,512,(c,w,h)=>{c.fillStyle='#d2c8b0';c.fillRect(0,0,w,h);for(let i=0;i<3;i++)for(let j=0;j<3;j++){c.fillStyle='rgba(0,0,0,'+r()*.05+')';c.fillRect(i*w/3,j*h/3,w/3,h/3);veins(c,i*w/3,j*h/3,w/3,5,.3)}
  c.strokeStyle='#bdb09a';c.lineWidth=2;for(let i=1;i<3;i++){c.beginPath();c.moveTo(i*w/3,0);c.lineTo(i*w/3,h);c.moveTo(0,i*h/3);c.lineTo(w,i*h/3);c.stroke()}
  const bw=34,cs=11,cols=['#c9b17a','#7a4d26','#efe4c8','#51677f'];
  c.fillStyle='#51677f';c.fillRect(0,0,w,bw);c.fillRect(0,h-bw,w,bw);c.fillRect(0,0,bw,h);c.fillRect(w-bw,0,bw,h);
  const cell=(x,y,k)=>{c.fillStyle=cols[k%4];c.fillRect(x,y,cs,cs)};
  for(let x=4;x<w-4;x+=cs){let k=(x/cs|0);cell(x,9,k);cell(x,h-9-cs,k+1);cell(x,9+cs,k+2);cell(x,h-9-2*cs,k+3)}for(let y=4;y<h-4;y+=cs){let k=(y/cs|0);cell(9,y,k);cell(w-9-cs,y,k+1);cell(9+cs,y,k+2);cell(w-9-2*cs,y,k+3)}
  c.strokeStyle='#2f3e52';c.lineWidth=3;c.strokeRect(3,3,w-6,h-6);c.strokeRect(bw,bw,w-2*bw,h-2*bw)});
 M.nMosaic=mkm(0xffffff,{map:mosaic,roughness:.5,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 // דלתות זהב מעוטרות (גפנים/רוזטות, כמו בסרטון)
 const doorT=cv(128,256,(c,w,h)=>{c.fillStyle='#b98c34';c.fillRect(0,0,w,h);c.fillStyle='#e0b955';c.fillRect(5,5,w-10,h-10);c.fillStyle='#8f6a22';c.fillRect(9,9,w-18,h-18);c.fillStyle='#c9a24a';c.fillRect(12,12,w-24,h-24);
  c.strokeStyle='#f6e08e';c.lineWidth=3;for(let k=0;k<3;k++){const cy=55+k*70;c.beginPath();c.arc(64,cy,22,0,6.283);c.stroke();for(let p=0;p<8;p++){c.save();c.translate(64,cy);c.rotate(p*.785);c.beginPath();c.ellipse(0,-13,5,9,0,0,6.283);c.stroke();c.restore()}
   c.fillStyle='#8f6a22';c.beginPath();c.arc(64,cy,5,0,6.283);c.fill();c.beginPath();c.arc(30,cy+30,10,.4,4.4);c.stroke();c.beginPath();c.arc(98,cy+30,10,-1.2,2.7);c.stroke()}});
 M.nDoor=mkm(0xffffff,{map:doorT,metalness:.45,roughness:.4,emissive:0x2a1c00});M.nDoor.userData.tile=10;
 M.nGoldD=mkm(0xe6b93c,{metalness:.7,roughness:.28,emissive:0x3a2600,side:T.DoubleSide});
 // חזית לשכה: שלב קשת ("בֵּיי") – טיח שמנת, מסגרת זהב, חלון כחלחל
 M.nBay=mkm(0xffffff,{map:cv(128,256,(c,w,h)=>{c.fillStyle='#e6dcc0';c.fillRect(0,0,w,h);c.fillStyle='#d6caa8';c.fillRect(0,0,12,h);c.fillRect(w-12,0,12,h);c.fillStyle='rgba(120,95,50,.4)';c.fillRect(11,0,2,h);c.fillRect(w-13,0,2,h);
  c.fillStyle='#d3c5a2';c.beginPath();c.arc(64,66,46,Math.PI,0);c.lineTo(110,74);c.lineTo(18,74);c.fill();
  const arch=(R,col)=>{c.fillStyle=col;c.beginPath();c.moveTo(64-R,236);c.lineTo(64-R,80);c.arc(64,80,R,Math.PI,0);c.lineTo(64+R,236);c.closePath();c.fill()};
  arch(40,'#c9a24a');arch(35,'#8e9aa5');const g=c.createLinearGradient(0,45,0,236);g.addColorStop(0,'#b3bfc9');g.addColorStop(1,'#66737f');c.fillStyle=g;c.beginPath();c.moveTo(30,236);c.lineTo(30,80);c.arc(64,80,34,Math.PI,0);c.lineTo(98,236);c.closePath();c.fill();
  c.fillStyle='rgba(255,255,255,.2)';c.fillRect(30,80,34,156);c.fillStyle='#c9a24a';c.fillRect(59,28,10,14);c.fillStyle='#cdbf9d';c.fillRect(20,236,88,10);
  c.strokeStyle='#e9dfc4';c.lineWidth=2;c.beginPath();c.moveTo(64,45);c.lineTo(64,236);c.stroke()}),roughness:.85});
 // גומחה פנימית עם מדפים (כדים / ארגזים)
 const niche=(boxes)=>cv(128,256,(c,w,h)=>{c.fillStyle='#b9b7b1';c.fillRect(0,0,w,h);c.fillStyle='#ece4d0';c.fillRect(3,20,16,h-20);c.fillRect(w-19,20,16,h-20);c.fillStyle='#d6cbb0';c.fillRect(0,14,22,9);c.fillRect(w-22,14,22,9);
  c.fillStyle='#4a3d33';c.beginPath();c.moveTo(24,244);c.lineTo(24,72);c.arc(64,72,40,Math.PI,0);c.lineTo(104,244);c.closePath();c.fill();
  const jar=(x,yb,s,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,yb-12*s,8*s,12*s,0,0,6.283);c.fill();c.fillRect(x-3*s,yb-31*s,6*s,10*s);c.fillRect(x-4.5*s,yb-33*s,9*s,3*s)};
  [92,132,172,212,244].forEach((y,i)=>{c.fillStyle='#eadfc6';c.fillRect(26,y,76,5);
   if(boxes){for(let x=28;x<100;x+=15){if(i==4)break;c.fillStyle=((x/15|0)%2)?'#cbb7a0':'#b69f86';c.fillRect(x,y-27,13,27);c.fillStyle='#7a5a3a';c.fillRect(x+2,y-17,9,3)}}
   else{for(let x=36;x<100;x+=17){if(i==4)break;jar(x,y,.9+r()*.25,r()<.5?'#b5683a':(r()<.5?'#e2d3b3':'#8f4f2c'))}}})});
 M.nNicheJ=mkm(0xffffff,{map:niche(false),roughness:.9});M.nNicheB=mkm(0xffffff,{map:niche(true),roughness:.9});
 // סבכת הסורג: עץ חום כהה בשיבוץ אלכסוני, מסגרת
 const latT=cv(256,64,(c,w,h)=>{c.clearRect(0,0,w,h);c.lineWidth=6;c.strokeStyle='#4a3f2c';for(let i=-70;i<w+70;i+=30){c.beginPath();c.moveTo(i,0);c.lineTo(i+64,h);c.moveTo(i,h);c.lineTo(i+64,0);c.stroke()}
  c.strokeStyle='rgba(180,150,100,.35)';c.lineWidth=1.5;for(let i=-70;i<w+70;i+=30){c.beginPath();c.moveTo(i-1,0);c.lineTo(i+63,h);c.stroke()}c.fillStyle='#4a3f2c';c.fillRect(0,0,w,5);c.fillRect(0,h-5,w,5)});
 M.nLat=new T.MeshBasicMaterial({map:latT,alphaTest:.45,side:T.DoubleSide});   // (Basic: עם Standard + alphaTest הסבכה לא הוצגה)
 // רצועת עיטור (חום־זהב) בראש קירות הלשכות
 M.nBand=mkm(0xffffff,{map:cv(128,32,(c,w,h)=>{c.fillStyle='#7a4a2a';c.fillRect(0,0,w,h);for(let x=0;x<w;x+=16){c.fillStyle='#d6a640';c.beginPath();c.moveTo(x+8,2);c.lineTo(x+15,16);c.lineTo(x+8,30);c.lineTo(x+1,16);c.fill();c.fillStyle='#3a2414';c.fillRect(x+6,13,4,6)}}),roughness:.8});M.nBand.userData.tile=1.6;
 // ערימות עץ מסוידות: פסים כתומים־חומים (עצי המערכה)
 M.nTimber=mkm(0xffffff,{map:cv(128,64,(c,w,h)=>{c.fillStyle='#8f5222';c.fillRect(0,0,w,h);for(let y=0;y<h;y+=5){c.fillStyle=(y/5|0)%2?'#b87432':'#a8662a';c.fillRect(0,y,w,4)}for(let i=0;i<60;i++){c.fillStyle='rgba(60,30,10,.35)';c.fillRect(r()*w,r()*h,6+r()*14,1)}}),roughness:.9});M.nTimber.userData.tile=4;
 M.nBark=mkm(0x6b5237,{roughness:.95});M.nEnd=mkm(0xcfa56a,{roughness:.8});
 M.nDark=mkm(0x3f3a31,{roughness:.9});          // מעלות החיל (אפור־פחם כמו בסרטון)
 M.nPost=mkm(0xb7ac8d,{roughness:.9});M.nPostL=mkm(0xcfc4a5,{roughness:.9});M.nMerl=mkm(0xd2c096,{roughness:.9});M.nMarb=mkm(0xe6dcc6,{roughness:.55});
 M.nWoodD=mkm(0x5b4630,{roughness:.9});M.nWoodL=mkm(0xd9bf8e,{roughness:.9});M.nWoodBeam=mkm(0x6b4a2b,{roughness:.9});
 M.nFac=mkm(0xe4d9bc,{roughness:.85});M.nPlaster=mkm(0xb2aea8,{roughness:.95});M.nWarm=mkm(0xe9d3a0,{roughness:.9,emissive:0x3a2208});
 M.nMetal=mkm(0x0e0d0c,{metalness:.55,roughness:.45});M.nCoal=mkm(0x120f0c,{roughness:1});M.nRoof=mkm(0x4a4538,{roughness:.8});
 M.nFlame=new T.MeshBasicMaterial({color:new T.Color(0xff7a14).convertSRGBToLinear()});M.nJar=mkm(0xffffff,{roughness:.75});M.nBarrel=mkm(0xffffff,{roughness:.85});M.nRaw=mkm(0x6d6f64,{roughness:.95});
 M.nDome=mkm(0xe6d9b6,{roughness:.85,side:T.DoubleSide});M.nWater=mkm(0x4a93b8,{roughness:.1,metalness:.2});M.nCloth=mkm(0xd8d0bd,{roughness:.95});M.nBlack=mkm(0x1a1816,{roughness:.9});
}
/* ==== NZ-MAT-END ==== */

/* ---------- עזרי בנייה ---------- */
function scaleUV(g,w,h,d,t){const uv=g.attributes.uv,D=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];for(let f=0;f<6;f++)for(let i=0;i<4;i++){const k=f*4+i;uv.setXY(k,uv.getX(k)*D[f][0]/t,uv.getY(k)*D[f][1]/t)}}
function box(g,cx,y0,cz,w,h,d,m,o={}){if(w<=0||h<=0||d<=0)return;const geo=new T.BoxGeometry(w,h,d);if(m.map)scaleUV(geo,w,h,d,m.userData.tile||8);
 const me=new T.Mesh(geo,m);me.position.set(cx,y0+h/2,cz);me.castShadow=o.ns?false:true;me.receiveShadow=true;me.userData.ns=!!o.ns;g.add(me);
 if(o.c)COL.push([cx-w/2,cx+w/2,cz-d/2,cz+d/2,y0,y0+h]);return me}
// קיר לאורך x (ב-z=fix) או לאורך z (ב-x=fix), עם פתחים
function wall(g,ax,fix,a0,a1,y0,h,t,m,gates=[]){gates=[...gates].sort((p,q)=>p.c-q.c);
 const pc=(s,e,yb,hh,c)=>{if(e-s<.01||hh<=.01)return;const mid=(s+e)/2,L=e-s;ax=='x'?box(g,mid,yb,fix,L,hh,t,m,{c}):box(g,fix,yb,mid,t,hh,L,m,{c})};
 let cur=a0;for(const G of gates){const s=G.c-G.w/2,e=G.c+G.w/2,b=G.b||0;pc(cur,s,y0,h,1);pc(s,e,y0,b,0);pc(s,e,y0+b+G.h,h-b-G.h,0);cur=e;
  if(!G.nd&&h-b-G.h>1.5){ax=='x'?box(g,G.c,y0+b+G.h,fix,G.w+2,1,t+.6,M.gold,{ns:1}):box(g,fix,y0+b+G.h,G.c,t+.6,1,G.w+2,M.gold,{ns:1})}
  if(G.door)ax=='x'?box(g,G.c,y0+b,fix,G.w,G.h,t*.45,M.bronze,{c:1}):box(g,fix,y0+b,G.c,t*.45,G.h,G.w,M.bronze,{c:1})}
 pc(cur,a1,y0,h,1)}
function room(g,x0,x1,z0,z1,y0,h,m,o={}){const t=o.t||1.5,d=o.door,sd=s=>d&&d.side==s?[{c:d.c,w:d.w||6,h:d.h||10,nd:1}]:[];
 wall(g,'x',z0+t/2,x0+t,x1-t,y0,h,t,m,sd('n'));wall(g,'x',z1-t/2,x0+t,x1-t,y0,h,t,m,sd('s'));
 wall(g,'z',x0+t/2,z0,z1,y0,h,t,m,sd('w'));wall(g,'z',x1-t/2,z0,z1,y0,h,t,m,sd('e'));
 if(o.roof){const r=box(g,(x0+x1)/2,y0+h,(z0+z1)/2,x1-x0+.6,1.2,z1-z0+.6,o.rm||M.wood);ROOFS.push(r)}}
function plat(g,x0,x1,z0,z1,Y){box(g,(x0+x1)/2,0,(z0+z1)/2,x1-x0,Y-.3,z1-z0,M.stone);box(g,(x0+x1)/2,Y-.3,(z0+z1)/2,x1-x0,.3,z1-z0,M.floor)}
function stairs(g,sx,sz,dir,w,n,rise,tread,y0,m=M.stone){const dx=dir[0],dz=dir[1];
 for(let i=0;i<n;i++){const L=(n-i)*tread,al=i*tread+L/2,cx=sx+dx*al,cz=sz+dz*al,hh=(i+1)*rise;dx?box(g,cx,y0,cz,L,hh,w,m):box(g,cx,y0,cz,w,hh,L,m)}
 const ex=sx+dx*n*tread,ez=sz+dz*n*tread,r=dx?[Math.min(sx,ex),Math.max(sx,ex),sz-w/2,sz+w/2]:[sx-w/2,sx+w/2,Math.min(sz,ez),Math.max(sz,ez)];
 ZN.push({r,ax:dx?'x':'z',a:dx?sx:sz,ya:y0,b:dx?ex:ez,yb:y0+n*rise})}
function floorY(x,z,r){let y=(x>250||x<-250||z>250||z<-250)?terrH(x,z):0,U=null;for(const q of ZN){if(q.c){const dx=x-q.c[0],dz=z-q.c[1],rr=Math.hypot(dx,dz);if(dx>=0&&rr<=q.R)y=q.ya+(q.yb-q.ya)*Math.min(1,Math.max(0,(q.R-rr)/(q.R-q.rt)));continue}const k=q.r;if(x>=k[0]&&x<=k[1]&&z>=k[2]&&z<=k[3]){let v;if(q.ax){const p=q.ax=='x'?x:z,t=Math.min(1,Math.max(0,(p-q.a)/(q.b-q.a)));v=q.ya+(q.yb-q.ya)*t}else v=q.y;if(q.u){if(r!==undefined)(U||(U=[])).push(v)}else y=v}}
 if(U){let b=null,d=1e9;for(const c of [y].concat(U)){if(c<=r+3.6){const e=Math.abs(c-r);if(e<d){d=e;b=c}}}y=b===null?Math.min(y,...U):b}   // שכבות תת־קרקעיות (ZN עם u:1) נבחרות רק כשמעבירים את מפלס ההולך r; בלי r – רק פני השטח
 return y}
function lbl(t,x,y,z,g,r=250,big){if(!t)return;const el=document.createElement('div');el.className='lbl'+(big?' big':'');el.textContent=t;document.body.appendChild(el);const e={el,x,y,z,g,r,big:big?1:0};LBL.push(e);return e}
const rep=(n,f)=>{for(let i=0;i<n;i++)f(i)};
const cyl=(g,x,y,z,r,h,m,seg=16)=>{const me=new T.Mesh(new T.CylinderGeometry(r,r,h,seg),m);me.position.set(x,y+h/2,z);me.castShadow=me.receiveShadow=true;g.add(me);return me};
const sph=(g,x,y,z,r,m)=>{const me=new T.Mesh(new T.SphereGeometry(r,12,8),m);me.position.set(x,y,z);g.add(me);return me};

/* ================= הר הבית ================= */
const gM=grp('mount'),gE=grp('env'),gC=grp('chel'),gN=grp('nashim'),gA=grp('azarah'),gH=grp('hekhal');
/* --- חומרי הר הבית כפי שבסרטון: גזית זהובה (קירות), כותל הרודיאני עם שוליים מסותתים (חומת התמך), מרפסת אבן אפורה, גגות סטיו בהירים --- */
{const r2=(q=>()=>(q=q*16807%2147483647)/2147483647)(4242);
 const ash=(w,h,rows,ws,base,joint,sh,mar)=>cv(w,h,(c)=>{c.fillStyle=joint;c.fillRect(0,0,w,h);const rh=h/rows;
  for(let r=0;r<rows;r++){let x=-(ws[r%ws.length]*r2()|0);while(x<w){const bw=ws[r2()*ws.length|0],s=(r2()-.5)*sh;
   c.fillStyle='rgb('+(base[0]+s|0)+','+(base[1]+s*.92|0)+','+(base[2]+s*.8|0)+')';c.fillRect(x+1.5,r*rh+1.5,bw-3,rh-3);
   if(mar){c.fillStyle='rgba(255,248,225,.24)';c.fillRect(x+1.5,r*rh+1.5,bw-3,mar);c.fillRect(x+1.5,r*rh+1.5,mar,rh-3);
    c.fillStyle='rgba(60,40,10,.22)';c.fillRect(x+bw-1.5-mar,r*rh+1.5+mar,mar,rh-3-mar);c.fillRect(x+1.5+mar,r*rh+rh-1.5-mar,bw-3-mar,mar);
    c.fillStyle='rgba(90,70,35,.10)';c.fillRect(x+4+mar,r*rh+4+mar,bw-8-2*mar,rh-8-2*mar)}
   x+=bw}}
  for(let i=0;i<w*h/90;i++){c.fillStyle='rgba('+(r2()<.5?'40,25,5':'255,245,220')+','+r2()*.08+')';c.fillRect(r2()*w,r2()*h,1+r2()*3,1+r2()*2)}});
 M.herod=mk(0xffffff,{map:ash(512,512,8,[128,192,256],[214,196,156],'#8a7a58',22,7)});M.herod.userData.tile=16;     // כותל: נדבכים של 2 אמות, שוליים מסותתים
 M.wallG=mk(0xffffff,{map:ash(256,256,5,[64,96,128],[229,207,146],'#a3875a',16,0)});M.wallG.userData.tile=8;       // חומת ההר: גזית זהב־חולית (#e8d59d בסרטון)
 M.terr=mk(0xffffff,{map:ash(256,256,4,[96,128,160],[188,171,140],'#7a6c52',26,0),roughness:.95});M.terr.userData.tile=16;   // מרפסת אפורה־חומה סביב החומה
 M.sroof=mk(0xd8d1bf,{roughness:.9});M.merl=mk(0xdcc388)}
box(gM,0,-95,0,500,94.7,500,M.herod);box(gM,0,-.3,0,500,.3,500,M.floor);
wall(gM,'x',-246,-250,250,0,22,8,M.wallG,[{c:-102,w:8,h:15.5,nd:1}]);                       // שער טדי: פתח מחודד (הסרטון), נבנה ב-lishkhot.js; פתוח ליציאת המסיבה
wall(gM,'x',246,-250,250,0,22,8,M.wallG,[{c:10,w:12,h:14},{c:40,w:12,h:14}]);          // שערי חולדה
wall(gM,'z',-246,-242,242,0,22,8,M.wallG,[{c:-100,w:12,h:14},{c:213,w:12,h:14}]);        // שער קיפונוס + פתח אל הסטיו המלכותי מקשת רובינסון
wall(gM,'z',246,-242,242,0,22,8,M.wallG,[{c:ZC,w:12,h:14}]);                            // שער שושן
// מסגרות שערים (עמודי אבן, משקוף, כרכוב וזהב) ודלתות זהב פתוחות בתוך המעבר – מבפנים ומבחוץ
function gateFr(ax,fix,c,w,h,lv){const o=Math.sign(fix);
 const P=(a,y0,ww,hh,dd,m,sd)=>{const q=fix+o*sd*4.8;ax=='x'?box(gM,a,y0,q,ww,hh,dd,m,{ns:1}):box(gM,q,y0,a,dd,hh,ww,m,{ns:1})};
 [1,-1].forEach(sd=>{[-1,1].forEach(k=>P(c+k*(w/2+1),0,2,h+3,1.6,M.marble,sd));P(c,h+1,w+6,2.2,1.6,M.marble,sd);P(c,h+3.2,w+8,1,2.6,M.marble,sd);P(c,h+4.2,w+6,.4,1.6,M.gold,sd)});
 if(lv)[-1,1].forEach(k=>ax=='x'?box(gM,c+k*(w/2-.4),0,fix,.5,h-.4,5.6,M.gold,{ns:1}):box(gM,fix,0,c+k*(w/2-.4),5.6,h-.4,.5,M.gold,{ns:1}))}
gateFr('x',246,10,12,14,1);gateFr('x',246,40,12,14,1);gateFr('z',-246,-100,12,14,1);gateFr('z',-246,213,12,14,1);gateFr('z',246,ZC,12,14,1);
// מרפסת חיצונית מרוצפת (כמו בסרטון: סרט אבן אפורה־חומה, 16 אמות, סביב החומה) עם שפת אבן נמוכה בהירה; פתוחה במקום הגשרים והמדרגות
{const E=266,pc=(x0,x1,z0,z1)=>{box(gM,(x0+x1)/2,-95,(z0+z1)/2,x1-x0,94.7,z1-z0,M.herod);box(gM,(x0+x1)/2,-.3,(z0+z1)/2,x1-x0,.3,z1-z0,M.terr);ZN.push({r:[x0,x1,z0,z1],y:0})},
 kb=(cx,cz,w,d)=>box(gM,cx,0,cz,w,1.3,d,M.marble,{c:1});
 pc(-E,E,-E,-250);pc(-250,-42,250,E);pc(92,E,250,E);pc(-E,-250,-250,-113);pc(-E,-250,-87,200);pc(250,E,-250,-63);pc(250,E,-52,250);
 kb(0,-E+.6,2*E,1.2);kb(-146,E-.6,208,1.2);kb(179,E-.6,174,1.2);kb(-E+.6,-189.5,1.2,153);kb(-E+.6,56.5,1.2,287);kb(E-.6,-164.5,1.2,203);kb(E-.6,107,1.2,318);
 // שיני חומה (מהסרטון: חומת ההר מוקפת מגדנות) – אינסטנסים על שפת החומה החיצונית והפנימית
 const mg=[];for(let t=-249;t<=249;t+=4.8)[1,-1].forEach(sd=>{const r=sd>0?248.9:243.1;mg.push([t,-r,0],[t,r,0],[-r,t,1],[r,t,1])});
 const im=new T.InstancedMesh(new T.BoxGeometry(2.4,2.3,1.8),M.merl,mg.length),o=new T.Object3D();
 mg.forEach((q,i)=>{o.position.set(q[0],23.15,q[1]);o.rotation.set(0,q[2]?Math.PI/2:0,0);o.updateMatrix();im.setMatrixAt(i,o.matrix)});
 im.castShadow=im.receiveShadow=true;gM.add(im)}
const gSt=new T.Group();gSt.userData={min:5,max:99};gM.add(gSt);GRP.stoa=gSt;PGS.push(gSt);
// סטווים (יוספוס): עמודים באינסטנסינג
const gap=(v,c)=>Math.abs(v-c)<9;
for(let z=-204;z<=170;z+=8)if(!gap(z,ZC))[14,30].forEach(o=>cols.push([242-o,z,0,28,1.1]));
for(let z=-204;z<=170;z+=8)if(!gap(z,-100))[14,30].forEach(o=>cols.push([-242+o,z,0,28,1.1]));
for(let x=-242;x<=242;x+=8)if(!gap(x,-100))[14,30].forEach(o=>cols.push([x,-242+o,0,28,1.1]));
ROOFS.push(box(gSt,227,28,-17,30,1.5,382,M.sroof),box(gSt,-227,28,-17,30,1.5,382,M.sroof),box(gSt,0,28,-227,484,1.5,30,M.sroof));
box(gSt,212,26.4,-17,1.6,1.6,382,M.marble,{ns:1});box(gSt,-212,26.4,-17,1.6,1.6,382,M.marble,{ns:1});box(gSt,0,26.4,-212,484,1.6,1.6,M.marble,{ns:1});   // אפריז לפני העמודים
// הסטיו המלכותי: 4 שורות, בית אמצעי גבוה
[[170,33,1.2],[190,67,1.6],[220,67,1.6],[240,33,1.2]].forEach(([z,h,r])=>{for(let x=-240;x<=240;x+=10)if(!(z>=220&&x>-4&&x<54))cols.push([x,z,0,h,r])});
ROOFS.push(box(gSt,0,33,180,484,1.5,20,M.sroof),box(gSt,0,67,205,484,1.5,30,M.sroof),box(gSt,0,33,231,484,1.5,22,M.sroof));
[[170,31.4],[190,65.4],[220,65.4],[240,31.4]].forEach(([z,y])=>{const sg=z>=220?[[-242,-4],[54,242]]:[[-242,242]];sg.forEach(([a,b])=>box(gSt,(a+b)/2,y,z,b-a,1.6,1.6,M.marble,{ns:1}))});   // אפריז הסטיו המלכותי
for(let x=-240;x<=240;x+=10)[190,220].forEach(z=>{if(!(z==220&&x>-4&&x<54))box(gSt,x,34,z,6,33,1.2,M.marble)});
// (ירושלים והסביבה נבנות ב-jerusalem.js)
// כוכבים
{const p=new Float32Array(1800);for(let i=0;i<600;i++){const a=rand()*6.283,b=Math.acos(rand()),r=5000;p.set([r*Math.sin(b)*Math.cos(a),r*Math.cos(b),r*Math.sin(b)*Math.sin(a)],i*3)}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(p,3));var stars=new T.Points(g,new T.PointsMaterial({color:0xffffff,size:6,sizeAttenuation:false,fog:false,transparent:true,opacity:0}));scene.add(stars)}

/* ================= החיל והסורג, עזרת נשים, עזרה ================= */
// מפלסים (אזורי רצפה): ברירת מחדל 0
// ריצוף עזרת ישראל וכהנים: שיש שמנת בהיר, אריחי אמה על אמה (דגום מהסרטון)
{let _qf=5;const rf=()=>(_qf=_qf*16807%2147483647)/2147483647;const t=cv(256,256,(c,w,h)=>{c.fillStyle='#d7cab1';c.fillRect(0,0,w,h);for(let i=0;i<16;i++)for(let j=0;j<16;j++){const s=(rf()-.5)*7;c.fillStyle='rgb('+(233+s|0)+','+(221+s|0)+','+(199+s|0)+')';c.fillRect(i*16+.5,j*16+.5,15,15)}
 c.strokeStyle='rgba(150,120,80,.07)';for(let k=0;k<26;k++){c.beginPath();const x=rf()*w,y=rf()*h;c.moveTo(x,y);c.lineTo(x+(rf()-.5)*60,y+(rf()-.5)*60);c.stroke()}});
 M.floorA=mk(0xffffff,{map:t,roughness:.45,metalness:.04});M.floorA.userData.tile=16}
const platA=(x0,x1,z0,z1,Y)=>{box(gA,(x0+x1)/2,0,(z0+z1)/2,x1-x0,Y-.3,z1-z0,M.stone);box(gA,(x0+x1)/2,Y-.3,(z0+z1)/2,x1-x0,.3,z1-z0,M.floorA)};
ZN.push({r:[17,157,-130,15],y:YN},{r:[-180,-4,-130,15],y:YA},{r:[1,17,-130,15],y:YI});
plat(gN,17,157,-130,15,YN);box(gN,87,YN-.01,-57.5,140,.04,145,M.nFloor,{ns:1});platA(-180,-4,-130,15,YA);platA(1,12,-130,15,YI);
const g20=(c,b)=>({c,w:10,h:20,b:b||0});
// חומות: עזרה (גבוהות 40), נשים (40; מזרחית נמוכה 24), חומת ניקנור
wall(gA,'x',-127.5,-180,1,YA,40,5,M.stone,[g20(-151),g20(-121),{c:-143,w:3.6,h:7.5,b:20,nd:1},{c:-76,w:40,h:22,nd:1},{c:-25.5,w:27,h:24,nd:1}]);   // ניצוץ, קרבן (מערבית לבית המוקד) + פתח לחדר העליון של מגדל הניצוץ, פתח רחב לחצי החיצוני של בית המוקד ופתח לאולם לשכת הגזית (בצפון־מזרח) (lishkhot.js)
wall(gA,'x',-127.5,1,12,YI,42.5,5,M.stone);
wall(gA,'x',12.5,-180,1,YA,40,5,M.stone,[g20(-116),g20(-43),g20(-27),g20(-11)]);      // שער העליון, הדלק, הבכורות והמים (ממערב למזרח)
wall(gA,'x',12.5,1,12,YI,42.5,5,M.stone);
wall(gA,'z',-177.5,-125,10,YA,40,5,M.stone);
wall(gA,'z',14.5,-130,15,0,40,5,M.stone,[{c:ZC-26,w:18,h:12,b:YI,nd:1},g20(ZC,YI),{c:ZC+26,w:18,h:12,b:YI,nd:1}]);   // שער ניקנור + גומחות לשכות פנחס המלביש ועושי החביתין (lishkhot.js)
wall(gN,'x',-127.5,17,157,YN,40,5,M.nStone,[g20(84.5)]);wall(gN,'x',12.5,17,157,YN,40,5,M.nStone,[g20(84.5)]);
wall(gN,'z',154.5,-125,10,YN,24,5,M.nStone,[g20(ZC)]);
// אצטבה עם עמודים לאורך הקיר המזרחי של העזרה משני צדי שער ניקנור, עם שני פתחי לשכות מזהב (כמו בהדמיה)
{const z0=-125+8,zs=[];for(let z=z0;z<=2;z+=12.6)if(Math.abs(z-ZC)>14)zs.push(z);
 zs.forEach(z=>{cyl(gA,6,YI,z,.85,12,M.marble,12);COL.push([5.1,6.9,z-.9,z+.9,YI,YI+12])});
 ROOFS.push(box(gA,8.9,YI+12,(-125+ZC-14)/2,6.2,1.6,ZC-14+125,M.marble),box(gA,8.9,YI+12,(ZC+14+10)/2,6.2,1.6,10-ZC-14,M.marble),box(gA,5.8,YI+12,-121.9,12,1.6,6.2,M.marble),box(gA,5.8,YI+12,6.9,12,1.6,6.2,M.marble));
 lbl('לשכות פנחס המלביש ועושי החביתין',11,YI+13,ZC,'azarah',140)}
// שערי העזרה בצפון ובדרום: מעלות רחבות מן החיל, שער פתוח עם וילון (לפי ההדמיה בסרטון)
[[-151,'n','שער הניצוץ'],[-121,'n','שער הקרבן'],[-116,'s','שער העליון'],[-43,'s','שער הדלק'],[-27,'s','שער הבכורות'],[-11,'s','שער המים']].forEach(([gx,sd,nm])=>{const n=sd=='n';
 stairs(gC,gx,n?-154:39,[0,n?1:-1],16,32,.5,.75,0,M.nDark);
 [-1,1].forEach(o=>{const c=new T.Mesh(new T.PlaneGeometry(3.2,19),M.curt2);c.position.set(gx+o*3.4,YA+9.5,n?-129.6:14.6);gA.add(c)});
 lbl(nm,gx,YA+24,n?-134:19,'azarah',150)});
// מגדל הניצוץ, חדר עליון ומעלות מסתלסלות: lishkhot.js
// מעלות: י״ב מול כל שער נשים (חצי אמה), ט״ו אל ניקנור
stairs(gC,163,ZC,[-1,0],16,12,.5,.5,0,M.nDark);stairs(gC,84.5,-136,[0,1],16,12,.5,.5,0,M.nDark);stairs(gC,84.5,21,[0,-1],16,12,.5,.5,0,M.nDark);
// ט״ו מעלות חצי־עגולות לפני שער ניקנור (כמו בהדמיה בסרטון): רדיוס 15 עד רחבה עליונה ברדיוס 4
{const cx=17,R0=15,Rt=4;rep(15,k=>{const r=R0-k*(R0-Rt)/14,h=(k+1)*.5;const m=new T.Mesh(new T.CylinderGeometry(r,r,h,40,1,false,0,Math.PI),M.marble);m.position.set(cx,YN+h/2,ZC);m.castShadow=m.receiveShadow=true;gN.add(m)});
 ZN.push({c:[cx,ZC],R:R0,rt:Rt,ya:YN,yb:YI});
 [-1,1].forEach(sg=>{const c=new T.Mesh(new T.PlaneGeometry(3.2,19),M.curt2);c.position.set(cx+.4,YI+9.5,ZC+sg*3.4);c.rotation.y=Math.PI/2;gN.add(c)})}
ZN.push({r:[12,17,-130,15],y:YI});
/* ==== NZ-MAIN-BEGIN: החיל, הסורג, מעלות, חומות ושערי עזרת נשים, ארבע לשכות הפינות, מנורות השמחה (לפי הסרטון) ==== */
const lampLights=[];
{
 /* ---------- רישום מופעים חוזרים (InstancedMesh) ---------- */
 const NZ={},uBox=new T.BoxGeometry(1,1,1);uBox.translate(0,.5,0);
 const reg=(k,geo,mat,sh)=>NZ[k]={geo,mat,list:[],sh:sh!==false};
 const add=(k,x,y,z,sx,sy,sz,rx,ry,rz,col)=>NZ[k].list.push([x,y,z,sx,sy,sz,rx||0,ry||0,rz||0,col]);
 const ens=mk=>{if(!NZ['b_'+mk])reg('b_'+mk,uBox,M[mk])};
 const bx=(mk,x,y,z,sx,sy,sz,ry,col)=>{ens(mk);add('b_'+mk,x,y,z,sx,sy,sz,0,ry||0,0,col)};   // תיבה: y=תחתית
 const lathe=(pts,seg)=>new T.LatheGeometry(pts.map(p=>new T.Vector2(p[0],p[1])),seg||14);
 reg('jar',lathe([[0,0],[.5,0],[.8,.4],[1,1],[.9,1.6],[.55,2.2],[.4,2.6],[.5,2.75],[.42,2.85]],12),M.nJar);
 reg('barrel',lathe([[0,-1.75],[1.2,-1.75],[1.42,-.9],[1.5,0],[1.42,.9],[1.2,1.75],[0,1.75]],14),M.nBarrel);
 reg('log',new T.CylinderGeometry(.72,.72,1,9),[M.nBark,M.nEnd,M.nEnd]);
 reg('cup',new T.CylinderGeometry(1.1,.32,1.7,12,1,true),M.nGoldD,false);
 reg('flame',new T.ConeGeometry(.5,1.6,6),M.nFlame,false);
 reg('ball',new T.SphereGeometry(.72,10,8),M.nPostL);
 reg('sdome',new T.SphereGeometry(1,10,6,0,6.2832,0,1.5708),M.nPostL);
 reg('scroll',new T.CylinderGeometry(1,1,1,12),M.nMarb);
 reg('lat',new T.PlaneGeometry(1,1),M.nLat,false);
 reg('bay',new T.PlaneGeometry(4.8,9),M.nBay,false);
 reg('nicheJ',new T.PlaneGeometry(8,11),M.nNicheJ,false);reg('nicheB',new T.PlaneGeometry(8,11),M.nNicheB,false);
 const qq=new T.Quaternion(),vv=new T.Vector3(),ss=new T.Vector3(),ee=new T.Euler(),mm=new T.Matrix4(),cc=new T.Color();
 const flush=()=>{for(const k in NZ){const o=NZ[k],n=o.list.length;if(!n)continue;const im=new T.InstancedMesh(o.geo,o.mat,n);let hc=false;
  o.list.forEach((a,i)=>{mm.compose(vv.set(a[0],a[1],a[2]),qq.setFromEuler(ee.set(a[6],a[7],a[8],'YXZ')),ss.set(a[3],a[4],a[5]));im.setMatrixAt(i,mm);if(a[9]!==undefined)hc=true});
  if(hc)o.list.forEach((a,i)=>im.setColorAt(i,cc.set(a[9]!==undefined?a[9]:0xffffff).convertSRGBToLinear()));
  im.frustumCulled=false;im.castShadow=o.sh;im.receiveShadow=true;gN.add(im)}};
 const MESH=(geo,mat,x,y,z,o)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=!(o&&o.ns);m.receiveShadow=true;if(o&&o.r)m.rotation.set(o.r[0],o.r[1],o.r[2]);if(o&&o.s)m.scale.set(o.s[0],o.s[1],o.s[2]);(o&&o.g||gN).add(m);return m};
 const metalD=new T.MeshStandardMaterial({color:0x0b0a09,metalness:.6,roughness:.4,side:T.DoubleSide});
 // סולם עץ: שני קורות + שלבים מופעים; נשען בכיוון ry בזווית tilt
 const ladder=(x,z,L,tilt,ry,y0)=>{ens('nWoodBeam');const g=new T.Group();[-.65,.65].forEach(o=>{const m=new T.Mesh(new T.BoxGeometry(.26,L,.26),M.nWoodBeam);m.position.set(o,L/2,0);m.castShadow=true;g.add(m)});
  g.position.set(x,y0,z);g.rotation.set(tilt,ry,0,'YXZ');gN.add(g);const n=Math.floor(L/1.1)-1;
  for(let k=0;k<n;k++){const s=1+k*1.1;add('b_nWoodBeam',x+Math.sin(tilt)*Math.sin(ry)*s,y0+Math.cos(tilt)*s-.09,z+Math.sin(tilt)*Math.cos(ry)*s,1.3,.18,.18,tilt,ry,0)}};

 /* ---------- רצפת החיל: שיש בהיר מרובע (פס רוחב 10 אמות סביב עזרת נשים והעזרה) ---------- */
 {const ring=(x0,x1,z0,z1)=>box(gC,(x0+x1)/2,0,(z0+z1)/2,x1-x0,.14,z1-z0,M.nFloor,{ns:1});ring(-190,167,-140,-130);ring(-190,167,15,25);ring(-190,-180,-130,15);ring(157,167,-130,15)}

 /* ---------- הסורג: עמודי אבן מרובעים עם כיפת כדור, לוחות סבכה עץ בין העמודים, פרצות מול המעלות ---------- */
 {const PH=2.4,LH=1.45,GW=9.2,gp=g=>g.map(v=>[v-GW,v+GW]);
  const sides=[['x',-140,-190,167,gp([-151,-121,-35.5,-15.5,84.5])],['x',25,-190,167,gp([-116,-43,-27,-11,84.5])],['z',-190,-140,25,[]],['z',167,-140,25,gp([ZC])]];
  sides.forEach(([ax,fix,a0,a1,gaps])=>{const free=[];let cur=a0;gaps.sort((p,q)=>p[0]-q[0]).forEach(g=>{if(g[0]>cur)free.push([cur,g[0]]);cur=g[1]});free.push([cur,a1]);
   free.forEach(([s,e])=>{const L=e-s,n=Math.max(1,Math.round(L/6)),st=L/n;
    for(let i=0;i<=n;i++){const a=s+i*st,x=ax=='x'?a:fix,z=ax=='x'?fix:a;
     bx('nPost',x,0,z,1.1,PH,1.1);bx('nPost',x,0,z,1.5,.45,1.5);bx('nPostL',x,PH,z,1.45,.25,1.45);add('sdome',x,PH+.24,z,.82,.56,.82)}
    for(let i=0;i<n;i++){const m=s+(i+.5)*st,len=st-1.1,x=ax=='x'?m:fix,z=ax=='x'?fix:m,ry=ax=='x'?0:Math.PI/2;
     add('lat',x,.45+LH/2,z,len,LH,1,0,ry,0);bx('nWoodD',x,LH+.4,z,len,.3,.42,ry);bx('nWoodD',x,.2,z,len,.3,.42,ry)}})})}

 /* ---------- מעלות החיל: מדרגות אפורות כהות, אבני־צד מעלות עם מעקה ועמודי־מעקה בעלי כדור ---------- */
 const bal=(sx0,sz0,dir,w,n,rise,tread)=>{const dx=dir[0],dz=dir[1],S=n*tread,H=n*rise,th=Math.atan2(-dz,dx),lx=-dz,lz=dx,D=1;
  [-1,1].forEach(sg=>{const lat=sg*(w/2+.5),sh=new T.Shape();sh.moveTo(0,0);sh.lineTo(S,0);sh.lineTo(S,H+1.7);sh.lineTo(0,rise+1.7);sh.closePath();
   const m=new T.Mesh(new T.ExtrudeGeometry(sh,{depth:D,bevelEnabled:false}),M.nPostL);m.rotation.y=th;m.position.set(sx0+lx*(lat-D/2),0,sz0+lz*(lat-D/2));m.castShadow=m.receiveShadow=true;gC.add(m);
   const p=(s,l)=>[sx0+dx*s+lx*l,sz0+dz*s+lz*l],a=p(0,lat-D/2),b=p(S,lat+D/2);COL.push([Math.min(a[0],b[0]),Math.max(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[1],b[1]),0,H+1.5]);
   [0,S].forEach(s=>{const q=p(s,lat),hh=s?H+1.7:rise+1.7;bx('nPostL',q[0],0,q[1],1.4,hh+1.1,1.4);add('ball',q[0],hh+1.55,q[1],1,1,1)})})};
 [[163,ZC,[-1,0],12,.5,.5],[84.5,-136,[0,1],12,.5,.5],[84.5,21,[0,-1],12,.5,.5]].forEach(a=>bal(a[0],a[1],a[2],16,a[3],a[4],a[5]));
 [[-151,'n'],[-121,'n'],[-116,'s'],[-43,'s'],[-27,'s'],[-11,'s']].forEach(([gx,sd])=>bal(gx,sd=='n'?-154:39,[0,sd=='n'?1:-1],16,32,.5,.75));

 /* ---------- שערי עזרת נשים: מסגרת אבן, כותרת וזהב, דלתות זהב מעוטרות פתוחות ---------- */
 const gate=(ax,fix,c,w,h,y0,t)=>{const P=(a,wa,hh,yy,m,o)=>ax=='x'?box(gN,a,yy,fix,wa,hh,t+1.4,m,o):box(gN,fix,yy,a,t+1.4,hh,wa,m,o);
  P(c-w/2-.9,1.8,h+2,y0,M.nStoneL);P(c+w/2+.9,1.8,h+2,y0,M.nStoneL);P(c,w+3.6,2.2,y0+h,M.nStoneL);P(c,w+3.6,.5,y0+h+2.2,M.gold,{ns:1});
  [-1,1].forEach(sg=>{const a=c+sg*(w/2-.25);ax=='x'?box(gN,a,y0,fix,.4,h,t*.9,M.nDoor,{ns:1}):box(gN,fix,y0,a,t*.9,h,.4,M.nDoor,{ns:1})})};
 gate('x',-127.5,84.5,10,20,YN,5);gate('x',12.5,84.5,10,20,YN,5);gate('z',154.5,ZC,10,20,YN,5);

 /* ---------- חומות: מרלונים בחוץ + כרכוב; גזוזטרת הנשים (קורות עץ בולטות + רצפה) ---------- */
 {[['x',-129.4,17,157,YN+40],['x',14.4,17,157,YN+40],['z',156.4,-125,10,YN+24]].forEach(([ax,fix,a0,a1,yt])=>{for(let a=a0+1.2;a<a1;a+=3.1){ax=='x'?bx('nMerl',a,yt,fix,1.7,1.5,1.3):bx('nMerl',fix,yt,a,1.3,1.5,1.7)}});
  box(gN,87,YN+39.3,-127.5,140,.7,5.9,M.nStoneL,{ns:1});box(gN,87,YN+39.3,12.5,140,.7,5.9,M.nStoneL,{ns:1});box(gN,154.5,YN+23.3,-57.5,5.9,.7,135,M.nStoneL,{ns:1});
  for(let i=0;i<11;i++){const x=24+i*12.4;bx('nWoodBeam',x,YN+33.6,-122.4,1.1,1.1,5.4);bx('nWoodBeam',x,YN+33.6,7.4,1.1,1.1,5.4)}
  box(gN,87,YN+34.7,-123.4,138,.45,3.6,M.nWoodL,{ns:1});box(gN,87,YN+34.7,8.4,138,.45,3.6,M.nWoodL,{ns:1});box(gN,87,YN+35.1,-121.7,138,.8,.25,M.nWoodBeam,{ns:1});box(gN,87,YN+35.1,6.7,138,.8,.25,M.nWoodBeam,{ns:1})}

 /* ---------- מנורות שמחת בית השואבה: עמוד זהב דק, ארבע זרועות מעוקלות וגביעי שמן, סולם עץ נשען ---------- */
 [[62,-79],[62,-36],[108,-79],[108,-36]].forEach(([x,z])=>{
  cyl(gN,x,YN,z,2.4,.45,M.nGoldD,16);cyl(gN,x,YN+.45,z,1.2,.7,M.nGoldD,12);cyl(gN,x,YN+1.1,z,.5,47.5,M.gold,10);sph(gN,x,YN+47.4,z,.95,M.gold);
  [[1,0],[-1,0],[0,1],[0,-1]].forEach(([a,b])=>{const cu=new T.QuadraticBezierCurve3(new T.Vector3(x,YN+47.2,z),new T.Vector3(x+a*3.2,YN+45.6,z+b*3.2),new T.Vector3(x+a*5,YN+49.3,z+b*5));
   MESH(new T.TubeGeometry(cu,10,.17,5),M.gold,0,0,0,{ns:1});add('cup',x+a*5,YN+49.9,z+b*5,1,1,1);add('flame',x+a*5,YN+51.3,z+b*5,.9,.9,.9)});
  add('cup',x,YN+49.1,z,1.1,1.1,1.1);add('flame',x,YN+50.7,z,1,1,1);
  ladder(x+3,z,38,.079,-Math.PI/2,YN);
  const l=new T.PointLight(0xffb060,1.2,110);l.position.set(x,YN+55,z);gN.add(l);lampLights.push(l)});

 /* ---------- ארבע הלשכות (40×40): חזיתות קשתות, פס עיטור, ריצוף פסיפס, תכולה ---------- */
 const jc=[0xb5683a,0xe2d3b3,0xa65a30,0xd9c9a3,0x8f4f2c];
 const chamber=CF=>{const xo=CF.xo,sx=CF.sx,zo=CF.zo,sz=CF.sz,HC=14,X=a=>xo+sx*a,Z=b=>zo+sz*b;
  const cb=(a0,b0,y,wa,hb,hh,m,o)=>box(gN,X(a0+wa/2),YN+y,Z(b0+hb/2),wa,hh,hb,m,o);
  const ry1=sx>0?Math.PI/2:-Math.PI/2,ry2=sz>0?0:Math.PI;        // כיווני פנים (נורמל לכיוון מרכז העזרה)
  const lb=(t,a,y,b,r)=>lbl(t,X(a),YN+y,Z(b),'nashim',r||70);
  const jar=(a,y,b,s,i)=>add('jar',X(a),YN+y,Z(b),s,s,s,0,0,0,jc[i%jc.length]);
  const bench=(a,b,len,axis)=>{const al=axis=='a';cb(al?a-len/2:a-.8,al?b-.8:b-len/2,0,al?len:1.6,al?1.6:len,1.5,M.nMarb,{c:1});
   [-1,1].forEach(s=>add('scroll',al?X(a+s*(len/2+.15)):X(a),YN+1.5,al?Z(b):Z(b+s*(len/2+.15)),.62,1.9,.62,al?Math.PI/2:0,0,al?0:Math.PI/2))};
  MESH(new T.PlaneGeometry(38.5,38.5),M.nMosaic,X(19.25),YN+.05,Z(19.25),{ns:1,r:[-Math.PI/2,0,0]});     // רצפת פסיפס
  // חזית A (מול מרכז העזרה, עם פתח) וחזית B; גובה 14 + כרכוב + פס עיטור + ביסוס
  wall(gN,'z',X(39.25),Math.min(Z(0),Z(40)),Math.max(Z(0),Z(40)),YN,HC,1.5,M.nFac,[{c:Z(19.2),w:8,h:10.5,nd:1}]);
  wall(gN,'x',Z(39.25),Math.min(X(0),X(38.5)),Math.max(X(0),X(38.5)),YN,HC,1.5,M.nFac);
  cb(37.9,0,HC,3.4,41.2,1,M.nStoneL,{ns:1});cb(0,37.9,HC,41.2,3.4,1,M.nStoneL,{ns:1});cb(38.3,0,HC+1,2.6,41,.25,M.nBand,{ns:1});cb(0,38.3,HC+1,41,2.6,.25,M.nBand,{ns:1});
  cb(40,0,0,.9,40,1.3,M.nStoneL,{ns:1});cb(0,40,0,41,.9,1.3,M.nStoneL,{ns:1});cb(37.9,0,HC-.6,3.1,41.2,.3,M.gold,{ns:1});cb(0,37.9,HC-.6,41.2,3.1,.3,M.gold,{ns:1});
  for(let i=0;i<8;i++){const p=2.4+4.8*i;if(Math.abs(p-19.2)>=4.8)add('bay',X(40.06),YN+6.3,Z(p),1,1,1,0,ry1,0);add('bay',X(p),YN+6.3,Z(40.06),1,1,1,0,ry2,0)}
  // מסגרת הפתח + דלתות זהב מעוטרות פתוחות
  cb(38,14.4,0,2.6,.8,HC,M.nStoneL);cb(38,23.2,0,2.6,.8,HC,M.nStoneL);cb(38,14.4,10.5,2.6,9.6,1.3,M.nStoneL);cb(38.3,15.2,10.5,2.2,8,.35,M.gold,{ns:1});
  [15.2,22.8].forEach(b=>cb(37.8,b,0,2.4,.4,10.4,M.nDoor,{ns:1}));
  // בטנת טיח + גומחות בקירות החיצוניים (נזירים / שמן / מצורעים)
  if(CF.k!='wood'){cb(0,0,0,.35,38.5,HC,M.nPlaster,{ns:1});cb(0,0,0,38.5,.35,HC,M.nPlaster,{ns:1});cb(0,0,HC-.5,2.4,38.5,.5,M.nBand,{ns:1});cb(0,0,HC-.5,38.5,2.4,.5,M.nBand,{ns:1});
   if(CF.k=='naz'){[7.4,19.2,31].forEach((b,i)=>add(i%2?'nicheB':'nicheJ',X(.4),YN+6.3,Z(b),1,1,1,0,ry1,0));[10,29].forEach(a=>add('nicheJ',X(a),YN+6.3,Z(.4),1,1,1,0,ry2,0))}
   if(CF.k=='oil'){[8,19.5,31].forEach((b,i)=>add(i==1?'nicheB':'nicheJ',X(.4),YN+6.3,Z(b),1,1,1,0,ry1,0))}}
  return {X,Z,cb,ry1,ry2,lb,jar,bench}};

 /* ===== לשכת נזירים (דרום־מזרח): קדרת שלמים על האש, שער הנזיר, כירה שנייה, ספסלי שיש, כדים, מעמד גילוח ===== */
 {const c=chamber({k:'naz',xo:152,sx:-1,zo:10,sz:-1}),{X,Z,cb,lb,jar,bench}=c;
  cb(12,12,0,3.5,14,.35,M.nMarb);cb(22.5,12,0,3.5,14,.35,M.nMarb);cb(15.5,12,0,7,3,.35,M.nMarb);cb(15.5,23,0,7,3,.35,M.nMarb);    // שפת שיש מוגבהת סביב בור האש
  box(gN,X(19),YN+.06,Z(19),7,.05,8,M.nCoal,{ns:1});
  box(gN,X(21),YN+.1,Z(19),3.2,1.5,5,M.nRaw,{c:1});box(gN,X(17),YN+.1,Z(19),2.2,1.2,4,M.nRaw,{c:1});
  [[22.9,19,1.5],[22.7,17,1.2],[22.7,21,1.2],[16.2,18.5,1],[19,15.4,1.1],[19,22.6,1]].forEach(([a,b,s])=>add('flame',X(a),YN+.65,Z(b),s,s,s));box(gN,X(22.2),YN+.13,Z(19),1.6,.04,6,M.flame,{ns:1});
  MESH(new T.SphereGeometry(.8,8,6),M.nBlack,X(19),YN+.3,Z(18.2),{ns:1,s:[1,.4,1]});    // שער הנזיר הנשרף
  const cx=X(19),cz=Z(19),cy=YN+4.8;
  MESH(new T.SphereGeometry(3.3,20,10,0,6.2832,1.5708,1.5708),metalD,cx,cy,cz,{s:[1,.82,1]});
  MESH(new T.TorusGeometry(3.3,.25,6,24),M.nMetal,cx,cy,cz,{r:[Math.PI/2,0,0]});
  MESH(new T.CircleGeometry(3.05,20),new T.MeshLambertMaterial({color:new T.Color(0x5a6a70).convertSRGBToLinear()}),cx,cy-.5,cz,{ns:1,r:[-Math.PI/2,0,0]});
  [0,Math.PI/2].forEach(ry=>MESH(new T.TorusGeometry(3.3,.13,5,16,Math.PI),M.nMetal,cx,cy,cz,{ns:1,r:[0,ry,0]}));
  MESH(new T.TorusGeometry(.7,.14,6,12),M.nMetal,cx,cy+3.3,cz,{ns:1,r:[Math.PI/2,0,0]});
  COL.push([cx-3.4,cx+3.4,cz-3.4,cz+3.4,YN,YN+8]);
  {const a=8,b=31;box(gN,X(a),YN,Z(b),4.4,.9,4.4,M.nRaw,{c:1});box(gN,X(a),YN+.9,Z(b),3.2,.1,3.2,M.nCoal,{ns:1});add('flame',X(a),YN+1.7,Z(b),.7,.7,.7);
   MESH(new T.SphereGeometry(1.5,14,8,0,6.2832,1.5708,1.5708),metalD,X(a),YN+3.4,Z(b),{s:[1,.85,1]});MESH(new T.TorusGeometry(1.5,.12,5,16),M.nMetal,X(a),YN+3.4,Z(b),{r:[Math.PI/2,0,0]})}
  [8,20,32].forEach(b=>bench(3.2,b,8,'b'));[14,28].forEach(a=>bench(a,3.2,8,'a'));
  {const a=31,b=9;[[.5,0],[-.25,.43],[-.25,-.43]].forEach(([p,q])=>MESH(new T.CylinderGeometry(.08,.08,2.8,5),M.nMetal,X(a+p),YN+1.4,Z(b+q),{ns:1}));MESH(new T.SphereGeometry(1,12,6,0,6.2832,1.5708,1.5708),M.nBark,X(a),YN+2.8,Z(b),{ns:1,s:[1,.7,1]});bench(a,b+3.5,4,'a')}
  [[2.2,12.6,2],[2.2,26,1],[2.2,37.5,3],[6,2,4],[22,2,0],[34,2,2]].forEach(([a,b,i])=>jar(a,0,b,.55,i));
  lb('קדרת שלמי נזיר על האש',19,9.5,19,90);lb('שער הנזיר נשרף תחת הקדרה',19,3.6,16,55);lb('כירה שנייה (תבשיל)',8,5.5,31,50);lb('מקום הגילוח',31,4.4,9,50);lb('ספסלי הנזירים',3.2,3.4,20,50);lb('כלי חרס בגומחות',2.2,10,19.2,45)}

 /* ===== לשכת העצים (צפון־מזרח): ערימות גזעים, מתקני עץ מסוידים בשורות, שולחן בדיקת תולעים, בולי עץ נשענים ===== */
 {const c=chamber({k:'wood',xo:152,sx:-1,zo:-125,sz:1}),{X,Z,cb,lb}=c;
  const pile=(a0,b0,len,n)=>{for(let r=0;r<n;r++)for(let k=0;k<n-r;k++){const b=b0+.75+r*.75+k*1.5,y=YN+.75+r*1.3;add('log',X(a0+len/2),y,Z(b),1,len,1,0,0,Math.PI/2,[0xffffff,0xe8d8c0,0xcdb8a0][(r+k)%3])}
   [a0+.8,a0+len-.8].forEach(a=>{cb(a-.25,b0-.55,0,.5,.5,5,M.nMarb,{ns:1});cb(a-.25,b0+n*1.5+.55,0,.5,.5,5,M.nMarb,{ns:1})});COL.push([Math.min(X(a0),X(a0+len)),Math.max(X(a0),X(a0+len)),Math.min(Z(b0),Z(b0+n*1.5+.5)),Math.max(Z(b0),Z(b0+n*1.5+.5)),YN,YN+n*1.3+1])};
  pile(1.5,1.5,12.5,6);pile(1.5,29,12.5,6);
  const lean=(a,bBase,L,tilt)=>MESH(new T.CylinderGeometry(.7,.7,L,8),M.nBark,X(a),YN+L/2*Math.cos(tilt),Z(bBase)+L/2*Math.sin(tilt),{r:[tilt,0,0]});
  lean(6,26.4,11,.95);lean(9,12.6,11,-.95);
  [18,29].forEach(a=>{[3,7.6,12.2,27.8,32.4,37].forEach(b=>{bx('nTimber',X(a),YN+.3,Z(b),6.8,2,2.4);bx('nMarb',X(a-3.9),YN,Z(b),.5,3.2,.45);bx('nMarb',X(a+3.9),YN,Z(b),.5,3.2,.45);COL.push([X(a)-3.5,X(a)+3.5,Z(b)-1.3,Z(b)+1.3,YN,YN+2.4])})});
  box(gN,X(8),YN+2.1,Z(19.2),3.2,.35,6.5,M.nWoodL,{c:1});[[-1.2,-2.7],[1.2,-2.7],[-1.2,2.7],[1.2,2.7]].forEach(([p,q])=>box(gN,X(8+p),YN,Z(19.2+q),.4,2.1,.4,M.nWoodBeam,{ns:1}));
  bx('nTimber',X(8),YN+2.45,Z(18),2.4,.4,1.6,.2);bx('nTimber',X(8.2),YN+2.45,Z(21),2,.35,1.5,-.3);
  lb('ערימות גזעי עצי המערכה',7.5,6.5,8,90);lb('מתקני עץ מסוידים (נבדקו)',23,4.5,12,60);lb('שולחן בדיקת תולעים',8,4.8,19.2,50);lb('בולי עץ נשענים',9,6.5,24,45)}

 /* ===== לשכת המצורעים (צפון־מערב): בית "מקוה טהרה" מקומר, בריכת טבילה, ווי מגבות, כד ושולחן, תנור, ספסלים ===== */
 {const c=chamber({k:'lep',xo:17,sx:1,zo:-125,sz:1}),{X,Z,cb,lb,jar,bench}=c;
  const a0=13,a1=29,b0=10,b1=24,H=11.5,t=1.5,rY=sx=>sx>0?Math.PI/2:-Math.PI/2;
  const wx=(fix,aA,aB)=>wall(gN,'x',Z(fix),Math.min(X(aA),X(aB)),Math.max(X(aA),X(aB)),YN,H,t,M.nStoneL);
  wx(b0+t/2,a0,a1);wx(b1-t/2,a0,a1);
  wall(gN,'z',X(a0+t/2),Math.min(Z(b0),Z(b1)),Math.max(Z(b0),Z(b1)),YN,H,t,M.nStoneL);
  wall(gN,'z',X(a1-t/2),Math.min(Z(b0),Z(b1)),Math.max(Z(b0),Z(b1)),YN,H,t,M.nStoneL,[{c:Z(17),w:4.6,h:7.4,nd:1}]);
  const dome=MESH(new T.SphereGeometry(8.8,24,10,0,6.2832,0,1.5708),M.nDome,X(21),YN+H,Z(17),{s:[1,.5,.82]});ROOFS.push(dome);
  box(gN,X(21),YN+H-.1,Z(17),17.4,.5,15.4,M.nStoneL,{ns:1});[0,1].forEach(i=>box(gN,X(a1+.5+i*.5),YN,Z(17),1,.5*(2-i),6.4,M.nStoneL,{ns:1}));
  const tx=cv(256,64,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#6a5a3a';g.font='bold 40px serif';g.textAlign='center';g.textBaseline='middle';g.fillText('מקוה טהרה',w/2,h/2)});
  MESH(new T.PlaneGeometry(7,1.75),new T.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false}),X(a1+.05),YN+9.8,Z(17),{ns:1,r:[0,rY(1),0]});
  [-4.2,4.2].forEach(o=>{MESH(new T.TorusGeometry(1.05,.2,6,16),M.gold,X(a1+.1),YN+6.4,Z(17+o),{ns:1,r:[0,rY(1),0]});MESH(new T.CircleGeometry(.95,16),M.nDark,X(a1+.07),YN+6.4,Z(17+o),{ns:1,r:[0,rY(1),0]})});
  box(gN,X((a0+a1)/2),YN,Z(17),a1-a0-2*t,.12,b1-b0-2*t,M.nWarm,{ns:1});
  const pa=15.5,pb=15;   // בריכת טבילה 8×5 עם שפת שיש ומדרגות כניסה
  cb(pa-1,pb-1,0,10,1,1.5,M.nMarb);cb(pa-1,pb+5,0,10,1,1.5,M.nMarb);cb(pa-1,pb,0,1,5,1.5,M.nMarb);cb(pa+8,pb,0,1,5,1.5,M.nMarb);COL.push([X(pa+1),X(pa+7),Z(pb+.75),Z(pb+4.25),YN,YN+1.5]);   // התנגשות רק סביב המים (שפת השיש לא חוסמת – אחרת הלשכה הקטנה אטומה והפתח המזרחי לא מוביל לשום מקום)
  box(gN,X(pa+4),YN+1.1,Z(pb+2.5),8,.05,5,M.nWater,{ns:1});[0,1,2].forEach(i=>cb(pa+9+i*.7,pb+1,0,.7,3,.4*(3-i),M.nMarb,{ns:1}));
  [0,1,2,3,4,5].forEach(i=>bx('nCloth',X(a0+t+.25),YN+4.5,Z(12.4+i*1.5),.15,2.3,.8,0,[0xd8d0bd,0xbfb49a,0xe6dfce][i%3]));
  box(gN,X(a0+t+.1),YN+7,Z(17),.1,.3,10,M.gold,{ns:1});
  box(gN,X(26),YN,Z(12.6),1.4,2.2,1.4,M.nWoodBeam,{c:1});sph(gN,X(26),YN+2.45,Z(12.6),.28,M.nFlame);jar(27.2,0,12.4,.45,0);
  [[14.8,12.6],[14.8,21.4]].forEach(([a,b])=>{box(gN,X(a),YN+5.3,Z(b),.3,.5,.3,M.gold,{ns:1});add('flame',X(a+.5),YN+6.2,Z(b),.45,.45,.45)});
  box(gN,X(3.5),YN,Z(8),4,2.8,3.6,M.nStoneL,{c:1});box(gN,X(5.55),YN+.7,Z(8),.3,1.4,1.8,M.nBlack,{ns:1});sph(gN,X(3.5),YN+2.8,Z(8),1.7,M.nStoneL).scale.y=.7;
  bench(3.4,17,8,'b');bench(3.4,31,8,'b');bench(10,3.4,8,'a');bench(31,3.4,8,'a');
  [[3.2,2.5,0],[3.2,38,1]].forEach(([a,b,i])=>jar(a,0,b,.55,i));
  lb('מקוה טהרה · בית הטבילה',21,14,17,90);lb('בריכת טבילה',19.5,3.2,17.5,50);lb('ווי בגדים ומגבות',14.7,6.5,17,50);lb('תנור',3.5,5.4,8,40);lb('ספסלי המצורעים',3.4,3.5,17,50)}

 /* ===== לשכת שמן ויין (דרום־מערב): חביות מוערמות, מדפי כדים וארגזי מנחות, שולחן שיש ארוך, סולמות, מדרגות לפתח המערבי ===== */
 {const c=chamber({k:'oil',xo:17,sx:1,zo:10,sz:-1}),{X,Z,cb,lb,jar}=c;
  const bc=[0xa56a3a,0x8a5a30,0xb27a46,0x7a4d28];
  for(let layer=0;layer<3;layer++){const n=7-layer;for(let k=0;k<n;k++){const a=6.2+layer*1.55+k*3.1;add('barrel',X(a),YN+1.5+layer*2.65,Z(1.9),1,1,1,Math.PI/2,0,0,bc[(k+layer)%4])}}
  COL.push([Math.min(X(4.5),X(28)),Math.max(X(4.5),X(28)),Math.min(Z(0),Z(3.8)),Math.max(Z(0),Z(3.8)),YN,YN+7.4]);
  const shelf=(a,b0)=>{[0,3.2,6.4].forEach(y=>cb(a,b0,y+.1,1.3,6,.3,M.nMarb,{ns:1}));cb(a,b0-.2,0,.4,.4,9.6,M.nMarb,{ns:1});cb(a,b0+5.8,0,.4,.4,9.6,M.nMarb,{ns:1});
   for(let y=0;y<3;y++)for(let k=0;k<4;k++){if((y+k)%3==1)bx('nCloth',X(a+.65),YN+y*3.2+.4,Z(b0+.9+k*1.35),.9,1.6,.9,0,0xcbb7a0);else jar(a+.65,y*3.2+.4,b0+.9+k*1.35,.4,k+y)}
   COL.push([Math.min(X(a),X(a+1.3)),Math.max(X(a),X(a+1.3)),Math.min(Z(b0),Z(b0+6)),Math.max(Z(b0),Z(b0+6)),YN,YN+9.6])};
  [5,16.5,28].forEach(b=>shelf(.6,b));
  [11,22.5].forEach(b=>ladder(X(5),Z(b),10,.26,-Math.PI/2,YN));
  {const a=23,b=19.2;cb(a-1.6,b-9,2.1,3.2,18,.5,M.nMarb,{c:1});[-1,1].forEach(s=>{cb(a-1.4,b+s*8.4-.5,0,2.8,1.1,2.1,M.nMarb,{ns:1});add('scroll',X(a),YN+2.3,Z(b+s*9.4),.65,3.1,.65,0,0,Math.PI/2)});
   [-6,-1.5,2.8,6.6].forEach((o,i)=>jar(a+(i%2?.5:-.5),2.6,b+o,.38,i+1))}
  rep(5,i=>cb(2.5,26+i*1.2,0,5,1.2,.55*(i+1),M.nMarb,{c:1}));
  [[12,10,0],[14,4,1],[6,34,2],[30,6,3],[30,33,4],[19,36,1],[33,24,2]].forEach(([a,b,i])=>jar(a,0,b,.6,i));
  lb('חביות יין ושמן מוערמות',16,8.5,2,80);lb('מדפי כדים וארגזי מנחות (נסכים)',1.2,10.8,16,70);lb('שולחן שיש ארוך',23,5.2,19.2,60);lb('סולמות עץ',5,10.5,16.5,45);lb('מדרגות לפתח המערבי',4.5,5,28,50)}

 /* ===== מבנה בעל גג כהה ליד מעלות ניקנור (חלל כלי השיר מתחת לעזרת ישראל – כמו בסרטון) ===== */
 {const x0=17,x1=38,z0=-85,z1=-72.5,H=9,cx=(x0+x1)/2,cz=(z0+z1)/2;box(gN,cx,YN,cz,x1-x0,H,z1-z0,M.nStoneL,{c:1});box(gN,cx,YN+H,cz,x1-x0+2,.7,z1-z0+2,M.nRoof);box(gN,cx,YN+H+.7,cz,x1-x0-.8,.5,z1-z0-.8,M.nRoof,{ns:1});
  for(let i=0;i<4;i++)add('bay',x0+2.8+i*5,YN+H*.5+.2,z1+.06,.8,.65,1,0,0,0);
  lbl('לשכה בגג כהה · כלי שיר',cx,YN+H+4,cz,'nashim',90)}

 lbl('סורג · עמודי אבן וסבכת עץ',100,4,-140,'chel',140);lbl('מעלות עם מעקה וכדורי אבן',163,9,ZC,'chel',90);lbl('גזוזטרת הנשים (קורות עץ)',87,YN+38,-122,'nashim',230);lbl('שער נשים צפוני · דלתות זהב',84.5,YN+25,-127.5,'nashim',120);lbl('שער נשים דרומי',84.5,YN+25,12.5,'nashim',120);lbl('שער נשים מזרחי',154.5,YN+25,ZC,'nashim',120);
 [[62,-79],[108,-79]].forEach(([x,z])=>lbl('מנורת שמחת בית השואבה · ארבעה גביעי שמן',x,YN+53,z,'nashim',110));
 flush();
}
/* ==== NZ-MAIN-END ==== */
// עזרת ישראל וכהנים – גדר/דוכן
{const mSt=mk(0xcdc3b4,{roughness:.55});rep(5,i=>box(gA,.5-i,0,-57.5,1,YI+(i+1)*.5,145,mSt));   // חמש מעלות (חצי אמה גובה, אמה עומק) מעזרת ישראל (13.5) אל עזרת כהנים (16), לכל רוחב העזרה; הלויים עומדים עליהן
 ZN.push({r:[-4,1,-130,15],ax:'x',a:1,ya:YI,b:-4,yb:YA});lbl('מעלות הדוכן',-1.5,YA+4,ZC-30,'azarah',120)}
box(gA,-10,YA,ZC,.4,.3,125,M.stoneRaw,{ns:1});

/* ---- לשכות העזרה ---- */
// כל לשכות העזרה (בית המוקד, מלח, פרווה, מדיחין, העץ, הגולה, הגזית, אבטינס, בית טבילה, פנחס, חביתין) ושערי הצפון/דרום: src/lishkhot.js

/* ---- המזבח (32×32) והכבש, הכיור, בית המטבחיים – נאמן להדמיית הסרטון (אזור "מזבח וכהנים") ---- */
{const AX=-26,AZ=-43;   // מרכז המזבח (z=-43: מוסט דרומה מן הציר, לפי תרשים התפארת ישראל)
 const RX=[-39,-30,-21,-12],RZ=[-66,-71,-76,-81,-86,-91];   // בית המטבחיים: 4 שורות (מזרח־מערב) x 6 טבעות, צפונית למזבח
 let _qa=19;const rq=()=>(_qa=_qa*16807%2147483647)/2147483647;   // מחולל מקומי: לא משנה את הרצף הגלובלי של rand
 /* --- טקסטורות וחומרים (צבעים דגומים מהפריימים) --- */
 // פס הקישוט של חוט הסיקרא: רקמת צלב פרחונית אדומה־ורודה על סיד לבן
 const tBand=cv(256,64,(c,w,h)=>{c.fillStyle='#f7f0e8';c.fillRect(0,0,w,h);const mo=['..#.#..','.#.#.#.','#..#..#','.##.##.','#..#..#','.#.#.#.','..#.#..'];
  for(let u=0;u<8;u++){mo.forEach((row,j)=>[...row].forEach((ch,i)=>{if(ch=='#'){c.fillStyle=(i+j)%2?'#b8453f':'#d9746b';c.fillRect(u*32+i*4,(j+4)*4,4,4)}}));
   c.fillStyle='#c95d55';c.fillRect(u*32+14,22,4,4);for(let x=0;x<32;x+=8){c.fillRect(u*32+x,4,4,4);c.fillRect(u*32+x,56,4,4)}}});
 tBand.repeat.set(12.5,1);
 const tBark=cv(64,64,(c,w,h)=>{c.fillStyle='#2e231a';c.fillRect(0,0,w,h);for(let i=0;i<60;i++){c.fillStyle=rq()<.5?'rgba(90,60,34,.55)':'rgba(12,8,5,.6)';c.fillRect(rq()*w,0,1+rq()*2,h)}});
 const tPlank=cv(128,128,(c,w,h)=>{c.fillStyle='#8f6d40';c.fillRect(0,0,w,h);for(let y=0;y<h;y+=4){c.fillStyle='rgba(60,36,14,.55)';c.fillRect(0,y,w,1);c.fillStyle=`rgba(${rq()<.5?'200,160,100':'70,45,20'},${.12+rq()*.15})`;c.fillRect(0,y+1,w,3)}});
 const tRad=cv(128,128,(c,w,h)=>{c.fillStyle='#e0d2b2';c.fillRect(0,0,w,h);c.translate(64,64);for(let i=0;i<32;i++){c.rotate(Math.PI/16);c.fillStyle=i%2?'#cdbb92':'#e6dabc';c.fillRect(0,-1.5,64,3);c.strokeStyle='#b09a70';c.lineWidth=1;c.beginPath();c.moveTo(6,0);c.lineTo(64,0);c.stroke()}});
 const mAlt=mk(0xf4eee4,{roughness:.93}),mRedL=mk(0xb52a28,{roughness:.8}),mBandM=mk(0xffffff,{map:tBand,roughness:.9}),mBark=mk(0xffffff,{map:tBark,roughness:1}),mEnd=mk(0xa88050,{roughness:.9}),
  mAsh=mk(0x050505,{roughness:1}),mSil=mk(0xdde1e6,{metalness:.7,roughness:.28,emissive:0x23262a}),mCu=mk(0xb8782e,{metalness:.65,roughness:.3,emissive:0x2a1608}),
  mIron=mk(0x5b5e63,{metalness:.7,roughness:.45}),mMar=mk(0xe9e4da,{roughness:.5}),mTab=mk(0xdfe4e8,{roughness:.38,metalness:.1}),mWd=mk(0x6a4222,{roughness:.85}),mRope=mk(0xa88c5c,{roughness:1}),
  mFl1=new T.MeshBasicMaterial({color:0xff8a1c,transparent:true,opacity:.84,depthWrite:false}),mFl2=new T.MeshBasicMaterial({color:0xffe27a,transparent:true,opacity:.92,depthWrite:false}),
  mEmb=new T.MeshBasicMaterial({color:0xff4a18}),mEmbD=mk(0x241a16),mGlow=new T.MeshBasicMaterial({color:0xff7a2a,transparent:true,opacity:.3,depthWrite:false}),
  mPlank=mk(0xffffff,{map:tPlank,roughness:.9}),mDisc=mk(0xffffff,{map:tRad,roughness:.7});
 mPlank.userData.tile=3;
 const m4=new T.Matrix4(),qq=new T.Quaternion(),ee=new T.Euler(),oo=new T.Object3D();
 /* --- המזבח: יסוד 32×32×1, גוף 30×30×5, סובב 28×28×3, קרנות; הכל סיד לבן --- */
 const MA=mAlt;box(gA,AX,YA,AZ,30,6,30,MA,{c:1});box(gA,AX,YA,AZ-15.5,32,1,1,MA,{c:1});box(gA,AX-15.5,YA,AZ+.5,1,1,31,MA,{c:1});box(gA,AX,YA+6,AZ,28,3,28,MA,{c:1});   // ליבה 30×30×6; יסוד רק בצפון ובמערב (כל האורך) ובדרום/מזרח אמה אחת בלבד (משנה, מידות ג:א); סובב 28×28×3   // יסוד (אמה), 30×30 (5 אמות), סובב 28×28 (3 אמות): גובה 9 + קרנות
 box(gA,AX,YA+4.34,AZ,30.06,.12,30.06,mRedL,{ns:1});                                                                  // חוט הסיקרא האדום – באמצע גובה המזבח (5 אמות)
 [[0,15.03,0],[0,-15.03,Math.PI],[15.03,0,Math.PI/2],[-15.03,0,-Math.PI/2]].forEach(([dx,dz,ry])=>{const m=new T.Mesh(new T.PlaneGeometry(30,.62),mBandM);m.position.set(AX+dx,YA+4.83,AZ+dz);m.rotation.y=ry;gA.add(m)});   // פס קישוט פרחוני מעל החוט
 // שפה נמוכה סביב המערכה (ללא פתח הכבש) וקרנות חלולות בארבע הפינות
 box(gA,AX,YA+9,AZ-13.85,28,.35,.3,MA,{ns:1});box(gA,AX-11,YA+9,AZ+13.85,6,.35,.3,MA,{ns:1});box(gA,AX+11,YA+9,AZ+13.85,6,.35,.3,MA,{ns:1});box(gA,AX-13.85,YA+9,AZ,.3,.35,27.4,MA,{ns:1});box(gA,AX+13.85,YA+9,AZ,.3,.35,27.4,MA,{ns:1});
 [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([a,b])=>{box(gA,AX+a*13.5,YA+9,AZ+b*13.5,1,1.3,1,MA,{ns:1});box(gA,AX+a*13.5,YA+10.28,AZ+b*13.5,.56,.04,.56,M.dark,{ns:1})});   // קרנות: אמה על אמה, חלולות
 /* --- ערימות גזעים (גזעים עגולים עם חתכי עץ בהירים בקצה), דשן ותפוח, גחלים --- */
 const logs=[];
 const stack=(cx,cz,w,L,n)=>rep(L,l=>rep(n,k=>{const o=-w/2+k*w/(n-1)+(rq()-.5)*.08,len=w*(.93+rq()*.1);logs.push(l%2?[cx+o,YA+9.25+l*.46,cz+(rq()-.5)*.25,len,'z']:[cx+(rq()-.5)*.25,YA+9.25+l*.46,cz+o,len,'x'])}));
 stack(AX+6.4,AZ+5.6,8.4,7,15);stack(AX-7.8,AZ+11.2,5,4,9);   // המערכה הגדולה והמערכה השנייה (קטורת)
 {const lm=new T.InstancedMesh(new T.CylinderGeometry(.23,.23,1,8),[mBark,mEnd,mEnd],logs.length);
  logs.forEach((L,i)=>{qq.setFromEuler(ee.set(L[4]=='z'?Math.PI/2:0,0,L[4]=='x'?Math.PI/2:0));m4.compose(new T.Vector3(L[0],L[1],L[2]),qq,new T.Vector3(1,L[3],1));lm.setMatrixAt(i,m4)});
  lm.castShadow=true;lm.frustumCulled=false;gA.add(lm)}
 {const g=new T.SphereGeometry(1,40,28),p=g.attributes.position,v=new T.Vector3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const k=1+.1*Math.sin(v.x*5.1+v.z*3.7)+.08*Math.cos(v.y*6.3+v.x*4.1)+.06*Math.sin(v.z*9+v.y*5)+.04*Math.sin(v.x*17+v.y*13)+.03*Math.cos(v.z*23+v.x*19);p.setXYZ(i,v.x*k,v.y*k,v.z*k)}g.computeVertexNormals();
  const m=new T.Mesh(g,mAsh);m.scale.set(4.3,2.7,3.9);m.position.set(AX-.5,YA+9.2,AZ+1.2);m.castShadow=true;gA.add(m)}   // התפוח – ערמת דשן שחורה גבשושית
 {const E=new T.BoxGeometry(.38,.22,.32),e1=new T.InstancedMesh(E,mEmb,34),e2=new T.InstancedMesh(E,mEmbD,26);   // המערכה השלישית (קיום האש): גל גחלים לוחשות
  [e1,e2].forEach((im,j)=>{for(let i=0;i<im.count;i++){const a=rq()*6.283,r=Math.sqrt(rq())*2.4*(j?1.15:.8);oo.position.set(AX-7.5+Math.cos(a)*r,YA+9.12+Math.max(0,2.4-r)*.2*rq()*2,AZ-5.6+Math.sin(a)*r);oo.rotation.set(rq()*3,rq()*3,rq()*3);oo.scale.setScalar(.7+rq()*.8);oo.updateMatrix();im.setMatrixAt(i,oo.matrix)}im.frustumCulled=false;gA.add(im)});
  const gl=new T.Mesh(new T.CircleGeometry(2.9,20),mGlow);gl.rotation.x=-Math.PI/2;gl.position.set(AX-7.5,YA+9.06,AZ-5.6);gA.add(gl)}
 /* --- הכבש הגדול (סיד לבן, חלון עגול) ושני כבשים קטנים --- */
 const mRamp=MA.clone();mRamp.side=T.DoubleSide;const mRamp2=mRamp.clone();mRamp2.color.set(0xd9c9a8);   // כבשים: דו־צדדי כדי שהכבש הקטן המערבי לא ייעלם מכל זווית
 const sh=new T.Shape();sh.moveTo(0,0);sh.lineTo(30.7,0);sh.lineTo(0,9);const rp=new T.Mesh(new T.ExtrudeGeometry(sh,{depth:16,bevelEnabled:false}),mRamp);
 rp.rotation.y=-Math.PI/2;rp.position.set(AX+8,YA,AZ+15);rp.castShadow=rp.receiveShadow=true;gA.add(rp);
 ZN.push({r:[AX-8,AX+8,AZ+15,AZ+45.7],ax:'z',a:AZ+45.7,ya:YA,b:AZ+15,yb:YA+9});
 {const wd=new T.Mesh(new T.CylinderGeometry(.55,.55,.12,16),mIron);wd.rotation.z=Math.PI/2;wd.position.set(AX-9.04,YA+4.2,AZ+19);gA.add(wd)}   // חלון עגול בכבש (מערב) לעופות פסולים
 const tFl=cv(64,128,(c,w,h)=>{c.filter='blur(2.2px)';const g=c.createLinearGradient(0,h,0,0);g.addColorStop(0,'rgba(255,236,130,1)');g.addColorStop(.4,'rgba(255,150,30,.96)');g.addColorStop(.78,'rgba(225,70,10,.62)');g.addColorStop(1,'rgba(200,40,0,0)');c.fillStyle=g;
  c.beginPath();c.moveTo(w/2,0);c.bezierCurveTo(w*.72,h*.3,w*1.02,h*.55,w*.8,h*.82);c.bezierCurveTo(w*.7,h*.98,w*.3,h*.98,w*.2,h*.82);c.bezierCurveTo(-w*.02,h*.55,w*.28,h*.3,w/2,0);c.fill();
  const g2=c.createLinearGradient(0,h,0,h*.45);g2.addColorStop(0,'rgba(255,255,225,.95)');g2.addColorStop(1,'rgba(255,235,130,0)');c.fillStyle=g2;c.beginPath();c.ellipse(w/2,h*.8,w*.2,h*.17,0,0,6.3);c.fill()}),mFlS=new T.SpriteMaterial({map:tFl,transparent:true,depthWrite:false,fog:true});
 var fires=[];const fireAt=(x,z,n,k,y0)=>rep(n,i=>{const f=new T.Group(),w=(5.4-i*.35)*k,h=(6.5+i*.8)*k,sp=new T.Sprite(mFlS);sp.scale.set(w,h,1);sp.position.y=h*.46;f.add(sp);f.position.set(x+(rand()-.5)*3*k,YA+y0-.5*k,z+(rand()-.5)*3*k);gA.add(f);fires.push(f)});   // להבות: ספרייטים (מונפשים ב-ui.js)
 fireAt(AX+6.4,AZ+5.6,6,1,12.3);fireAt(AX-7.8,AZ+11.2,3,.55,10.9);fireAt(AX-7.5,AZ-5.6,2,.4,9.4);
 var altarLight=new T.PointLight(0xff8a30,2,110);altarLight.position.set(AX,YA+14,AZ);gA.add(altarLight);
 [1].forEach(sg=>{const s2=new T.Shape();s2.moveTo(0,0);s2.lineTo(30.7,0);s2.lineTo(13,6);s2.lineTo(0,6);const m=new T.Mesh(new T.ExtrudeGeometry(s2,{depth:1,bevelEnabled:false}),mRamp2);   // רוחב אמה; 13 אמה גג במפלס הסובב ואז ירידה
  m.rotation.y=-Math.PI/2;m.position.set(sg>0?AX+9:AX-8,YA,AZ+15);m.castShadow=m.receiveShadow=true;gA.add(m);COL.push([AX+(sg>0?8:-9),AX+(sg>0?9:-8),AZ+15,AZ+28,YA,YA+6])});
 /* הכבש הקטן המערבי: מתחבר לכבש הגדול (מדרכה במפלס הסובב, גובה 6, ואז רגל א׳ ברצף אחד עם שיפוע הכבש הגדול), ובנקודת הקצה מסתובב 180° כ-V צמוד – רגל ב׳ חוזרת וירדת צפונה אל רצפת העזרה */
 {const zS=AZ+15,zC=AZ+25.3,zA=AZ+35.5,xb=AX-8;
  const mk=(pts,xr)=>{const sh2=new T.Shape();sh2.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)sh2.lineTo(pts[i][0],pts[i][1]);const m=new T.Mesh(new T.ExtrudeGeometry(sh2,{depth:1,bevelEnabled:false}),mRamp2);m.rotation.y=-Math.PI/2;m.position.set(xr,YA,0);m.castShadow=m.receiveShadow=true;gA.add(m);return m};
  mk([[zS,0],[zC,0],[zC,6],[zS,6]],xb);                 // מדרכה במפלס הסובב עד נקודת החיבור
  mk([[zC,0],[zA,0],[zA,3],[zC,6]],xb);                 // רגל א׳: ברצף עם הכבש הגדול (אותו שיפוע) 6→3 דרומה
  mk([[zC,0],[zA,0],[zA,3]],xb-1);                      // רגל ב׳: אחרי הסיבוב, חוזרת צפונה 3→0 עד רצפת העזרה
  ZN.push({r:[AX-9,xb,zS,zC],y:YA+6},{r:[AX-9,xb,zC,zA],ax:'z',a:zA,ya:YA+3,b:zC,yb:YA+6},{r:[AX-10,AX-9,zC,zA],ax:'z',a:zC,ya:YA,b:zA,yb:YA+3})}
 // שני נקבים לשפיכת שיירי הדם: שני פתחים עגולים בפני היסוד, בקרן דרומית־מערבית (כמו בהדמיה – חורים כהים על שפת היסוד ליד פינת המזבח)
 {[AZ+13.3,AZ+14.7].forEach(z=>{const h=new T.Mesh(new T.CircleGeometry(.3,18),M.dark);h.rotation.x=-Math.PI/2;h.position.set(AX-15.5,YA+1.015,z);gA.add(h);
   const r=new T.Mesh(new T.RingGeometry(.3,.42,18),mIron);r.rotation.x=-Math.PI/2;r.position.set(AX-15.5,YA+1.02,z);gA.add(r)});
  lbl('שני נקבים לשפיכת שיירי הדם',AX-15.5,YA+3.2,AZ+14,'azarah',60)}
 // שני נקבים בקרן דרומית־מערבית ושני ספלי כסף
 [0,1.2].forEach(o=>{box(gA,AX-13.3+o,YA+9,AZ+13.3,.7,.1,.7,M.dark,{ns:1});cyl(gA,AX-12.4+o,YA+9.1,AZ+11.7,.28,.55,mSil,12)});
 // אמת המים: חריצי ניקוז לאורך בסיס המזבח (מערב)
 rep(12,i=>box(gA,AX-17.3,YA,AZ-11+i*2,.7,.05,.3,M.dark,{ns:1}));
 lbl('המזבח · 32×32',AX,YA+22,AZ,'azarah',320,1);lbl('הכבש הגדול · 32 על 16',AX,YA+8,AZ+31,'azarah',200);lbl('כבש קטן מזרחי',AX+9,YA+7.5,AZ+23,'azarah',90);lbl('כבש קטן מערבי',AX-9,YA+7.5,AZ+23,'azarah',90);lbl('התפוח',AX,YA+13.5,AZ+1.4,'azarah',70);lbl('מערכה גדולה',AX+6.4,YA+17,AZ+5.6,'azarah',110);lbl('מערכה שנייה (קטורת)',AX-7.8,YA+14,AZ+11.2,'azarah',80);lbl('מערכה שלישית – קיום האש',AX-7.5,YA+13,AZ-5.6,'azarah',80);lbl('שני נקבים',AX-13,YA+11,AZ+13,'azarah',70);lbl('אמת המים',AX-17.3,YA+2.5,AZ,'azarah',60);
 /* --- הכיור: גביע נחושת מפוספס, שתים־עשרה ברזים, מכסה מצולע, ומוכני (גלגל וחבל) עם בור --- */
 {const kx=-58,kz=-30,K=new T.Group();   // הכיור: דרומית למעלות האולם ומזרחית לאולם (תרשים התפארת ישראל), x=-58 z=-30
  K.position.set(kx,YA,kz);K.scale.setScalar(.9);gA.add(K);
  const cyc=(x,y,z,rt,rb,h,mat,seg=16)=>{const m=new T.Mesh(new T.CylinderGeometry(rt,rb,h,seg),mat);m.position.set(x,y,z);m.castShadow=true;K.add(m);return m};
  cyc(0,.08,0,2.7,2.7,.16,mDisc,32);                                                                       // מכסה הבור – דיסקה עם קרניים
  const pr=[[0,.16],[1.5,.16],[1.64,.3],[1.45,.46],[1.05,.66],[.9,.86],[1.2,1.1],[1.62,1.48],[1.9,1.93],[1.94,2.33],[1.77,2.73],[1.4,3.03],[1.14,3.16],[1.22,3.26],[1.12,3.36]].map(([r,y])=>new T.Vector2(r,y));
  const body=new T.Mesh(new T.LatheGeometry(pr,12),mCu);body.castShadow=true;K.add(body);                      // גוף מצולע (12 פאות) כבסרטון
  const beads=new T.InstancedMesh(new T.SphereGeometry(.075,8,6),mCu,46);for(let i=0;i<46;i++){const a=i<28?i/28*6.283:(i-28)/18*6.283,r=i<28?1.97:1.2,y=i<28?2.4:3.46;oo.position.set(Math.cos(a)*r,y,Math.sin(a)*r);oo.rotation.set(0,0,0);oo.scale.setScalar(1);oo.updateMatrix();beads.setMatrixAt(i,oo.matrix)}K.add(beads);   // שתי שורות חרוזים
  const tapG=new T.CylinderGeometry(.07,.07,.6,6),tapH=new T.BoxGeometry(.3,.07,.07),taps=new T.InstancedMesh(tapG,mCu,12),hand=new T.InstancedMesh(tapH,mCu,12);
  for(let i=0;i<12;i++){const a=i/12*6.283+.26,cx=Math.cos(a),cz=Math.sin(a);oo.position.set(cx*1.82,1.45,cz*1.82);oo.rotation.set(0,0,0);oo.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(cx*.75,-.6,cz*.75).normalize());oo.scale.setScalar(1);oo.updateMatrix();taps.setMatrixAt(i,oo.matrix);
   oo.position.set(cx*1.7,1.7,cz*1.7);oo.rotation.set(0,-a,0);oo.scale.setScalar(1);oo.updateMatrix();hand.setMatrixAt(i,oo.matrix)}K.add(taps,hand);   // 12 ברזים
  const rib=new T.InstancedMesh(new T.CylinderGeometry(.05,.05,1,5),mCu,42),pts=[[1.12,3.5],[1.03,3.9],[.66,4.25],[.18,4.55]];   // מכסה סבכה (14 צלעות מעוגלות)
  for(let i=0;i<14;i++){const a=i/14*6.283,cx=Math.cos(a),cz=Math.sin(a);for(let j=0;j<3;j++){const A=new T.Vector3(cx*pts[j][0],pts[j][1],cz*pts[j][0]),B=new T.Vector3(cx*pts[j+1][0],pts[j+1][1],cz*pts[j+1][0]),d=B.clone().sub(A);
    oo.position.copy(A).add(B).multiplyScalar(.5);oo.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.clone().normalize());oo.scale.set(1,d.length(),1);oo.updateMatrix();rib.setMatrixAt(i*3+j,oo.matrix)}}K.add(rib);
  cyc(0,3.52,0,1.18,1.18,.08,mCu,24);cyc(0,4.6,0,.3,.3,.08,mCu,12);cyc(0,4.75,0,.07,.07,.3,mCu,6);const fn=new T.Mesh(new T.SphereGeometry(.2,10,8),mCu);fn.position.set(0,4.98,0);K.add(fn);
  // מוכני: מסגרת עץ, תוף וחבל, גלגל וידית, קורה על הבור; הבור עם מים
  const bx2=(x,y,z,w,h,d,mat,rx=0,ry=0,rz=0)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);m.castShadow=true;gA.add(m);return m};
  const mx=kx+4.6,mz=kz-.6;
  [-1.5,1.5].forEach(s=>[-.8,.8].forEach(t=>bx2(mx+s,YA+1.7,mz+t,.34,3.4,.34,mWd,t*.06,0,-s*.04)));   // ארבע רגליים (שתי מסגרות A)
  [-1.5,1.5].forEach(s=>bx2(mx+s,YA+3.5,mz,.34,.34,2.1,mWd));bx2(mx+.5,YA+2.0,mz,4.6,.28,.28,mWd);            // קורות עליונות וציר
  {const d=new T.Mesh(new T.CylinderGeometry(1.0,1.0,2.0,18),mRope);d.rotation.z=Math.PI/2;d.position.set(mx,YA+2.0,mz);d.castShadow=true;gA.add(d);
   rep(7,i=>{const r=new T.Mesh(new T.TorusGeometry(1.0,.1,6,18),mRope);r.rotation.y=Math.PI/2;r.position.set(mx-.9+i*.3,YA+2.0,mz);gA.add(r)});
   const wh=new T.Mesh(new T.CylinderGeometry(1.35,1.35,.16,20),mWd);wh.rotation.z=Math.PI/2;wh.position.set(mx+2.0,YA+2.0,mz);gA.add(wh);
   [0,1,2,3].forEach(i=>bx2(mx+2.1,YA+2.0,mz,.1,.14,2.6,mWd,i*Math.PI/4,0,0));bx2(mx+2.9,YA+2.4,mz+.9,1.3,.12,.12,mWd)}   // גלגל וידית
  bx2(mx,YA+4.4,mz,.34,2.0,.34,mWd);bx2(mx,YA+5.3,mz+2.2,.3,.3,5.6,mWd,0,0,0);                              // עמוד וקורת מנוף
  {const wx=mx,wz=mz+4.7,rim=new T.Mesh(new T.CylinderGeometry(1.7,1.8,.6,20,1,true),M.stoneRaw);rim.material=rim.material.clone();rim.material.side=T.DoubleSide;rim.position.set(wx,YA+.3,wz);gA.add(rim);
   const rg=new T.Mesh(new T.RingGeometry(1.3,1.82,20),M.stoneRaw);rg.rotation.x=-Math.PI/2;rg.position.set(wx,YA+.61,wz);gA.add(rg);
   const wt=new T.Mesh(new T.CircleGeometry(1.32,20),M.water);wt.rotation.x=-Math.PI/2;wt.position.set(wx,YA+.4,wz);gA.add(wt);
   const rp2=new T.Mesh(new T.CylinderGeometry(.05,.05,5,5),mRope);rp2.position.set(wx,YA+3.0,wz);gA.add(rp2);rep(1,()=>{const hk=new T.Mesh(new T.TorusGeometry(.14,.03,5,8,4.2),mIron);hk.position.set(wx,YA+.55,wz);gA.add(hk)});
   COL.push([wx-1.8,wx+1.8,wz-1.8,wz+1.8,YA,YA+.7])}
  COL.push([mx-2,mx+2.8,mz-1.2,mz+1.2,YA,YA+4]);
  box(gA,kx,YA,kz,3.6,3.2,3.6,M.stone,{c:1,ns:1}).visible=false;lbl('הכיור',kx,YA+5.2,kz,'azarah',150);lbl('מוכני הכיור (גלגל וחבל)',mx,YA+7.2,mz+2,'azarah',90)}
 /* --- בית המטבחיים: 24 טבעות (חישוקי ברזל), 8 עמודים "ננסיים" עם גזעי ארז וווים, 8 שולחנות שיש --- */
 {const rg=new T.InstancedMesh(new T.TorusGeometry(.42,.055,6,12,Math.PI),mIron,24);   // טבעות: חצאי חישוק עומדים שקועים ברצפה
  rep(24,i=>{oo.position.set(RX[i%4],YA,RZ[Math.floor(i/4)]);oo.rotation.set(0,i%2?0:Math.PI/2,0);oo.scale.setScalar(1);oo.updateMatrix();rg.setMatrixAt(i,oo.matrix)});rg.castShadow=true;rg.frustumCulled=false;gA.add(rg)}
 {const hk=new T.InstancedMesh(new T.TorusGeometry(.1,.02,4,8,Math.PI*1.3),mIron,8*28),hi=[0];
  rep(8,i=>{const x=RX[i>>1],z=i%2?-112:-106;
   box(gA,x,YA,z,1.9,.25,1.9,mMar,{ns:1});box(gA,x,YA+.25,z,1.55,.22,1.55,mMar,{ns:1});
   {const pd=new T.Mesh(new T.CylinderGeometry(.62,.8,1.3,4),mMar);pd.rotation.y=Math.PI/4;pd.position.set(x,YA+.47+.65,z);pd.castShadow=pd.receiveShadow=true;gA.add(pd)}      // עמוד שיש מחודד
   box(gA,x,YA+1.75,z,1.25,.12,1.25,mMar,{ns:1});box(gA,x,YA+1.87,z,3.1,1.3,3.1,mPlank,{c:1});                                                  // קורות ארז מוערמות
   COL.push([x-1.6,x+1.6,z-1.6,z+1.6,YA,YA+3.2]);[[0,1.58,0],[0,-1.58,0],[1.58,0,Math.PI/2],[-1.58,0,Math.PI/2]].forEach(([dx,dz,ry])=>rep(7,k=>{const o=-1.2+k*.4;oo.position.set(x+(dz?o:dx),YA+2.7,z+(dx?o:dz));oo.rotation.set(0,ry,0);oo.scale.setScalar(1);oo.updateMatrix();hk.setMatrixAt(hi[0]++,oo.matrix)}))});   // ווים לתליית הבהמה
  hk.castShadow=true;hk.frustumCulled=false;gA.add(hk)}
 rep(8,i=>{const tx=RX[i>>1],tz=i%2?-100:-95;box(gA,tx,YA+1.25,tz,4.2,.22,2.2,mTab,{ns:1});[[-1.9,-.9],[1.9,-.9],[-1.9,.9],[1.9,.9]].forEach(([a,b])=>box(gA,tx+a,YA,tz+b,.14,1.25,.14,mIron,{ns:1}))});   // שולחנות שיש (פלטה כחלחלה, רגליים דקות)
 [[-34.5,-98],[-25.5,-98],[-16.5,-98],[-34.5,-109],[-25.5,-109],[-16.5,-109]].forEach(([x,z])=>{box(gA,x,YA+.55,z,1.5,.16,.7,mMar,{ns:1});[-.6,.6].forEach(o=>box(gA,x+o,YA,z,.14,.55,.5,mMar,{ns:1}))});   // שרפרפי שיש
 lbl('בית המטבחיים: טבעות, שולחנות, עמודים',-22,YA+8,-100,'azarah',220);lbl('נַנְסִין – עמודי שיש נמוכים',-22,YA+5.6,-109,'azarah',100)
}

/* ================= האולם וההיכל ================= */
{const X0=-164,X1=-64,Z0=ZC-50,Z1=ZC+50;
 let _hs=7;const hr=()=>(_hs=_hs*16807%2147483647)/2147483647;                   // מחולל מקומי: לא משנה את הרצף הגלובלי
 // ---------- טקסטורות וחומרים (צבעים נדגמו מהסרטון: שיש שמנת #e3d8c7, זהב #f3cd55, פרוכת בורדו #7d4549, טיח לבן #f3efe5)
 const vein=(c,w,h,base,dk,lt,n)=>{c.fillStyle=base;c.fillRect(0,0,w,h);
  for(let i=0;i<40;i++){const x=hr()*w,y=hr()*h,r=40+hr()*120,g=c.createRadialGradient(x,y,0,x,y,r),a=hr()<.5?dk:lt;g.addColorStop(0,a+'.17)');g.addColorStop(1,a+'0)');c.fillStyle=g;c.fillRect(x-r,y-r,2*r,2*r)}
  for(let i=0;i<n;i++){let x=hr()*w,y=hr()*h,a=hr()*6.28;c.beginPath();c.moveTo(x,y);for(let s=0;s<14;s++){a+=(hr()-.5)*1.1;x+=Math.cos(a)*(10+hr()*18);y+=Math.sin(a)*(10+hr()*18);c.lineTo(x,y)}c.strokeStyle=dk+(.12+hr()*.25)+')';c.lineWidth=.6+hr()*1.8;c.stroke()}};
 const gold=(c,w,h)=>{const g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,'#d6a22e');g.addColorStop(.45,'#f3cd55');g.addColorStop(1,'#c68e24');c.fillStyle=g;c.fillRect(0,0,w,h)};
 const tVein=cv(512,512,(c,w,h)=>vein(c,w,h,'#e3d8c7','rgba(170,140,108,','rgba(255,250,240,',18));
 const tFl=cv(512,512,(c,w,h)=>{vein(c,w,h,'#ddcdb6','rgba(165,115,75,','rgba(255,248,236,',14);c.strokeStyle='rgba(125,105,85,.6)';c.lineWidth=2.5;
  for(let i=0;i<4;i++){c.beginPath();c.moveTo(i*128,0);c.lineTo(i*128,h);c.moveTo(0,i*128);c.lineTo(w,i*128);c.stroke()}});
 const tPl=cv(128,128,(c,w,h)=>{c.fillStyle='#f3efe5';c.fillRect(0,0,w,h);for(let i=0;i<300;i++){c.fillStyle='rgba('+(hr()<.5?'120,110,90':'255,255,255')+','+hr()*.05+')';c.fillRect(hr()*w,hr()*h,2+hr()*6,2+hr()*6)}});
 // זהב מובלט (דמשק עלים ועיגולים – כמו בקירות ההיכל שבסרטון)
 const tGd=cv(256,256,(c,w,h)=>{gold(c,w,h);
  const leaf=(cx,cy,s,a)=>{c.save();c.translate(cx,cy);c.rotate(a);c.beginPath();c.moveTo(0,s);c.bezierCurveTo(-s*.95,s*.35,-s*.95,-s*.5,0,-s);c.bezierCurveTo(s*.95,-s*.5,s*.95,s*.35,0,s);
   c.strokeStyle='rgba(120,74,8,.85)';c.lineWidth=5;c.stroke();c.strokeStyle='rgba(255,236,150,.9)';c.lineWidth=2;c.stroke();
   c.beginPath();c.arc(0,-s*.1,s*.28,0,6.3);c.strokeStyle='rgba(120,74,8,.8)';c.lineWidth=3;c.stroke();
   c.beginPath();c.moveTo(0,s);c.quadraticCurveTo(s*.5,s*.5,s*.25,s*.15);c.moveTo(0,s);c.quadraticCurveTo(-s*.5,s*.5,-s*.25,s*.15);c.stroke();c.restore()};
  [[64,64],[192,192]].forEach(p=>leaf(p[0],p[1],52,0));
  [[192,64],[64,192]].forEach(p=>{c.beginPath();c.arc(p[0],p[1],18,0,6.3);c.strokeStyle='rgba(120,74,8,.8)';c.lineWidth=4;c.stroke();c.strokeStyle='rgba(255,236,150,.9)';c.lineWidth=1.5;c.stroke();
   for(let k=0;k<8;k++)leaf(p[0]+Math.cos(k*.785)*30,p[1]+Math.sin(k*.785)*30,12,k*.785+1.57)})});
 // פרוכת בורדו עם אריות
 const tLion=cv(256,256,(c,w,h)=>{c.fillStyle='#7d4549';c.fillRect(0,0,w,h);for(let i=0;i<2500;i++){c.fillStyle='rgba('+(hr()<.5?'40,10,14':'200,130,130')+','+hr()*.07+')';c.fillRect(hr()*w,hr()*h,1+hr()*2,1+hr()*4)}
  c.fillStyle='rgba(78,30,36,.8)';c.strokeStyle='rgba(78,30,36,.8)';c.lineWidth=2.4;
  for(let r=0;r<4;r++)for(let q=0;q<3;q++){const x=q*85+(r%2?30:0)+6,y=r*64+38;
   c.beginPath();c.ellipse(x+16,y,16,7,0,0,6.3);c.fill();c.beginPath();c.arc(x+36,y-7,7.5,0,6.3);c.fill();
   [4,12,24,30].forEach(o=>c.fillRect(x+o,y+3,3.5,12));
   c.beginPath();c.moveTo(x,y-2);c.quadraticCurveTo(x-14,y-8,x-8,y-20);c.stroke()}});
 // תקרת זהב עם שושנות
 const tCe=cv(256,256,(c,w,h)=>{gold(c,w,h);c.save();c.translate(128,128);c.strokeStyle='rgba(120,74,8,.85)';c.fillStyle='rgba(255,236,150,.35)';c.lineWidth=3;
  for(let k=0;k<12;k++){c.save();c.rotate(k*Math.PI/6);c.beginPath();c.ellipse(0,-62,13,34,0,0,6.3);c.fill();c.stroke();c.restore()}
  c.beginPath();c.arc(0,0,30,0,6.3);c.stroke();c.beginPath();c.arc(0,0,12,0,6.3);c.fill();c.stroke();c.restore();
  [[0,0],[256,0],[0,256],[256,256]].forEach(p=>{c.beginPath();c.arc(p[0],p[1],34,0,6.3);c.stroke()})});
 const mkM=(map,tile,o)=>{const m=mk(0xffffff,Object.assign({map},o||{}));m.userData.tile=tile;return m};
 const MV=mkM(tVein,30,{roughness:.55}),MF=mkM(tFl,20,{roughness:.3}),MP=mkM(tPl,40,{roughness:.92}),
  MG=mkM(tGd,10,{metalness:.55,roughness:.38,emissive:0x2c1a00}),MCe=mkM(tCe,14,{metalness:.5,roughness:.4,emissive:0x2c1a00});
 M.hV=MV;M.hF=MF;M.hP=MP;M.hG=MG;M.hCe=MCe;                                  // נרשמים ב-M כדי להתנהג נכון בחתך
 const MCurt=mk(0xffffff,{map:tLion,side:T.DoubleSide,roughness:.95});
 const mClay=mk(0xa4643a,{roughness:.9}),mSil=mk(0xc9ced4,{metalness:.7,roughness:.3}),mWax=mk(0xf3ead0),mGl=mk(0xffe7a8,{emissive:0x7a5a1c,roughness:.4}),
  mBag=mk(0xb79a68,{roughness:1}),mGr=mk(0x3a2a18,{roughness:.5,metalness:.3}),mDw=mk(0x4a3322,{roughness:.8});
 // פרוכת מקופלת
 const curtain=(w,h,nx,amp,x,y,z,ry,mat)=>{const g=new T.PlaneGeometry(w,h,nx,1),p=g.attributes.position,uv=g.attributes.uv;
  for(let i=0;i<p.count;i++){p.setZ(i,Math.cos((p.getX(i)/w+.5)*nx*Math.PI)*amp);uv.setXY(i,uv.getX(i)*w/8,uv.getY(i)*h/8)}
  g.computeVertexNormals();const m=new T.Mesh(g,mat);m.position.set(x,y,z);m.rotation.y=ry;gH.add(m);return m};
 // ---------- מופעים חוזרים (תכולת התאים, חלונות, עלי הגפן)
 const uB=new T.BoxGeometry(1,1,1).translate(0,.5,0),uC=new T.CylinderGeometry(1,1,1,10).translate(0,.5,0),uS=new T.SphereGeometry(1,9,7),uO=new T.OctahedronGeometry(1,0);
 const IM=(geo,mat)=>{const a=[];return{add(x,y,z,sx,sy,sz,ry){a.push(x,y,z,sx,sy,sz,ry||0)},
  fin(g){const n=a.length/7;if(!n)return;const im=new T.InstancedMesh(geo,mat,n),m=new T.Matrix4(),q=new T.Quaternion(),e=new T.Euler(),p=new T.Vector3(),s=new T.Vector3();
   for(let i=0;i<n;i++){const o=i*7;e.set(0,a[o+6],0);q.setFromEuler(e);p.set(a[o],a[o+1],a[o+2]);s.set(a[o+3],a[o+4],a[o+5]);m.compose(p,q,s);im.setMatrixAt(i,m)}
   im.castShadow=false;im.receiveShadow=true;im.frustumCulled=false;g.add(im);return im}}};
 const I={};const mi=(n,g,m)=>(I[n]=IM(g,m));
 mi('wood',uB,M.wood);mi('gB',uB,M.gold);mi('gC',uC,M.gold);mi('sB',uB,mSil);mi('sC',uC,mSil);mi('cC',uC,mClay);mi('cS',uS,mClay);mi('wC',uC,mWax);mi('fl',uS,M.flame);
 mi('bag',uS,mBag);mi('dk',uB,mDw);mi('wf',uB,M.gold);mi('wg',uB,mGl);mi('lf',uO,M.gold);mi('grp',uS,mGr);
 // חלון צר מסגרת זהב (כמו בקירות ההיכל שבסרטון)
 const win=(x,y,z,ax,n,w,h)=>{w=w||1.7;h=h||6.5;
  if(ax=='z'){I.wf.add(x,y-.35,z+n*.15,w+.7,h+.7,.5);I.wg.add(x,y,z+n*.4,w,h,.3)}else{I.wf.add(x+n*.15,y-.35,z,.5,h+.7,w+.7);I.wg.add(x+n*.4,y,z,.3,h,w)}};
 // תכולת תא: מדפים לאורך הקיר האחורי; t: 0 כלי שרת, 1 אוצר, 2 מנורות ונרות, 3 סכינים (בית החליפות)
 const fillCell=(ax,cu,back,din,L,D,fy,t)=>{
  const P=(u,v)=>ax=='z'?[cu+u,back+din*v]:[back+din*v,cu+u],
   B=(n,u,v,y,su,sv,sh)=>{const p=P(u,v);I[n].add(p[0],y,p[1],ax=='z'?su:sv,sh,ax=='z'?sv:su)},
   C=(n,u,v,y,r,h)=>{const p=P(u,v);I[n].add(p[0],y,p[1],r,h,r)},
   S=(n,u,v,y,r)=>{const p=P(u,v);I[n].add(p[0],y,p[1],r,r,r)},
   cnt=Math.floor((L-2)/1.3),uj=j=>-(L-2)/2+j*1.3+.65,ys=[2.6,5.4,8.2];
  ys.forEach(y=>B('wood',0,.95,fy+y,L-1.2,1.7,.25));
  [-1,1].forEach(s=>[.3,1.6].forEach(v=>B('wood',s*(L/2-.5),v,fy,.35,.35,8.45)));
  if(t==0){for(let j=0;j<cnt;j++){const u=uj(j),m=j%3==1?'sC':'gC',pl=j%2?'sC':'gC';
    C('gC',u,.95,fy+2.85,.5,.3);                                              // קערות זהב
    C(m,u,.95,fy+5.65,.26,.8);C(m,u,.95,fy+6.45,.4,.22);                      // גביעים
    C(pl,u,.95,fy+8.45,.62,.1);C(pl,u,.95,fy+8.55,.55,.1);C(pl,u,.95,fy+8.65,.48,.1)}   // צלחות מוערמות
   [-1,1].forEach(s=>{B('wood',s*(L/2-2.2),D-1.2,fy,2.6,1.5,1.5);B('gB',s*(L/2-2.2),D-1.2,fy+1.5,2.7,1.6,.2)});C('gC',0,D-1.2,fy,1.1,.9);C('sC',2.6,D-1.2,fy,.8,.7)}
  else if(t==1){for(let j=0;j<cnt;j++){const u=uj(j);
    if(j%2){S('bag',u,.95,fy+2.85+.4,.5);S('bag',u,.95,fy+5.65+.4,.45)}else{B('gB',u,.95,fy+2.85,.9,.5,.3);B('gB',u,.95,fy+3.15,.7,.4,.3);B('gB',u,.95,fy+5.65,.9,.5,.3)}
    B('gB',u,.95,fy+8.45,.9,.5,.3);B('gB',u,.95,fy+8.75,.7,.4,.3)}
   for(let j=0;j<4;j++){const u=-L/2+1.9+j*3.1;B('wood',u,1.0,fy,2.6,1.7,1.6);B('gB',u,1.0,fy+1.6,2.7,1.8,.18);B('gB',u,1.0,fy+.6,2.7,1.8,.15)}
   for(let j=0;j<5;j++){const u=-L/2+1.6+j*2.6;C('cC',u,D-1.1,fy,.6,1.1);S('cS',u,D-1.1,fy+1.2,.65);C('cC',u,D-1.1,fy+1.7,.3,.5)}}
  else if(t==2){const mn=(u,v)=>{C('gC',u,v,fy,.9,.3);C('gC',u,v,fy+.3,.12,3.2);
    for(let s=-3;s<=3;s++){if(!s){S('fl',u,v,fy+3.75,.17);continue}C('gC',u+s*.5,v,fy+1.0,.07,2.45);S('fl',u+s*.5,v,fy+3.6,.15)}
    [1,2,3].forEach(a=>B('gB',u,v,fy+.9+a*.4,a*1,.12,.1))};
   [-1,1].forEach(s=>{mn(s*L*.22,D*.6);const u=s*(L/2-.8);C('gC',u,D-.9,fy,.4,.25);C('gC',u,D-.9,fy+.25,.12,6);C('gC',u,D-.9,fy+6.2,.5,.35);S('fl',u,D-.9,fy+6.9,.2)});   // מגדלורי זהב
   for(let j=0;j<cnt;j++){const u=uj(j);
    if(j%2==0){C('wC',u,.95,fy+2.85,.12,.9);S('fl',u,.95,fy+3.9,.1);C('wC',u,.95,fy+8.45,.12,.9);S('fl',u,.95,fy+9.5,.1)}else{C('cC',u,.95,fy+5.65,.4,.7);S('cS',u,.95,fy+6.45,.34)}}}
  else{const n2=Math.floor((L-1)/.5);ys.forEach((y,b)=>{for(let j=0;j<n2;j++){const u=-(L-1)/2+j*.5+.25;B('dk',u,.95,fy+y+.25,.16,.55,.5);B('sB',u,.95,fy+y+.75,.1,.45,1.2)}
    for(let j=0;j<Math.floor(cnt/3);j++)if(b==0)C('sC',-(L-2)/2+j*3.9+1,D-1.1,fy,.8,.5)})}};
 // ---------- בסיס והמעלות
 plat(gH,X0,X1,Z0,Z1,YH);ZN.push({r:[X0,X1,Z0,Z1],y:YH});COL.push([X0,X1,Z0,Z1,YA,YH]);
 stairs(gH,-52,ZC,[-1,0],24,12,.5,1,YA);                                  // י״ב מעלות לאולם (גובה חצי אמה, רוחב אמה)
 // ---------- האולם: 100 רוחב × 11 עומק, גובה 90 – חזית טיח לבן, פנים שיש שמנת
 wall(gH,'z',-66.5,Z0,Z1,YH,90,5,MP,[{c:ZC,w:20,h:40}]);
 box(gH,-74.5,YH,Z0+2.5,11,90,5,MP,{c:1});box(gH,-74.5,YH,Z1-2.5,11,90,5,MP,{c:1});
 wall(gH,'z',-83,Z0+5,Z1-5,YH,90,6,MP,[{c:ZC,w:10,h:20}]);                  // קיר האולם האחורי = קיר ההיכל (פתח 10×20), סוגר גם את בית החליפות משני הצדדים
 ROOFS.push(box(gH,-72,YH+90,ZC,16.6,2,100.6,MP));
 box(gH,-65,YH+86,ZC,2,3,100,MP,{ns:1});                                    // מעקה
 box(gH,-64.3,YH+83,ZC,2.2,1.4,101,MP,{ns:1});box(gH,-63.3,YH+83.2,ZC,.6,.6,100.6,M.gold,{ns:1});   // כרכוב וסרט זהב
 {const cl=(x,y0,h,za,zb)=>box(gH,x,y0,(za+zb)/2,.25,h,zb-za,MV,{ns:1});                // חיפוי שיש מעורק בפנים
  cl(-69.12,YH,90,Z0+5,ZC-10);cl(-69.12,YH,90,ZC+10,Z1-5);cl(-69.12,YH+40,50,ZC-10,ZC+10);
  cl(-79.88,YH,90,Z0+5,ZC-5);cl(-79.88,YH,90,ZC+5,Z1-5);cl(-79.88,YH+20,70,ZC-5,ZC+5);
  [Z0+5.12,Z1-5.12].forEach(z=>box(gH,-74.5,YH,z,11,90,.25,MV,{ns:1}));
  box(gH,-74.5,YH,ZC,11,.08,90,MF,{ns:1})}                                  // ריצוף שיש
 // לוחות זהב מובלט בחזית + מסגרת השער + שני עמודים
 [ZC-30,ZC+30].forEach(z=>box(gH,-63.8,YH+4,z,.5,34,36,MG,{ns:1}));box(gH,-63.8,YH+64,ZC,.5,24,92,MG,{ns:1});
 [-1,1].forEach(s=>{box(gH,-63.6,YH,ZC+s*10.7,.7,40,1.4,M.gold,{ns:1});
  const cx=-62.3,cz=ZC+s*12.9;cyl(gH,cx,YH,cz,1.8,1.2,M.gold,14);cyl(gH,cx,YH+1.2,cz,1.25,37.4,MP,16);cyl(gH,cx,YH+38.6,cz,2.1,1.4,M.gold,14);box(gH,cx,YH+40,cz,4.4,.9,4.4,M.gold,{ns:1})});
 box(gH,-63.6,YH+40,ZC,.7,1.8,23.4,M.gold,{ns:1});
 // חמש קורות אשוח מעל הפתח (22..30 אמה)
 rep(5,i=>box(gH,-66.5,YH+41+i*1.9,ZC,5.5,1.1,22+i*2,M.wood,{ns:1}));
 // וילון (בבלי) – שני קצוות פתוחים
 [-8.5,8.5].forEach(o=>{const c=new T.Mesh(new T.PlaneGeometry(3,40),M.curt);c.position.set(-62.9,YH+20,ZC+o);c.rotation.y=Math.PI/2;gH.add(c)});
 const c2=new T.Mesh(new T.PlaneGeometry(20,4),M.curt);c2.position.set(-62.9,YH+38,ZC);c2.rotation.y=Math.PI/2;gH.add(c2);
 // חלונות צרים בחזית (פס הטיח שמעל לוחות הזהב התחתונים)
 [-44,-33,-22,22,33,44].forEach(o=>win(-64,YH+47,ZC+o,'x',1,1.8,8));
 // ---------- גוף ההיכל: קירות טיח לבן; מרכז 45, תאים 33
 box(gH,-119.5,YH,ZC-13,67,45,6,MP,{c:1});box(gH,-119.5,YH,ZC+13,67,45,6,MP,{c:1});box(gH,-150,YH,ZC,6,45,32,MP,{c:1});
 ROOFS.push(box(gH,-116.5,YH+40,ZC,61,5,20,MP));                              // תקרת ההיכל (40 אמה) ורצפת העליה
 // ---------- 38 תאים: 3 קומות בצפון ובדרום (5/6/7 אמות), 8 במערב. הקומות חלולות ומלאות בתכולה; בחתך (הסתרת גגות) רואים פנימה
 const TYP=[[0,0,1,0,1],[1,1,0,1,0],[2,0,2,1,2]];
 [-1,1].forEach(sg=>{rep(3,i=>{const w=5+i,zin=ZC+sg*16,y=YH+11*i,zo=zin+sg*w,zw=ZC+sg*35,zm=(zin+zo)/2,fy=i?y+1:y;
   box(gH,-125,y,(zo+zw)/2,78,11,Math.abs(zw-zo),MP,{c:1});                    // קיר חיצוני עבה
   box(gH,-158.5,y,zm,11,11,w,MP,{c:1});                                       // קצה מערבי סגור
   if(i)box(gH,-119.5,y,zm,67,1,w,MF,{ns:1});else box(gH,-119.5,YH,zm,67,.06,w,MF,{ns:1});
   rep(4,k=>box(gH,-86-(k+1)*13.4,fy,zm,.8,y+11-fy,w,MP,{ns:1}));
   rep(5,k=>{const cx=-86-13.4*(k+.5);fillCell('z',cx,zo,-sg,12.6,w,fy,TYP[i][k]);win(cx,y+4,zw,'z',sg,1.7,6)})});
  ROOFS.push(box(gH,-122,YH+33,(ZC+sg*16+ZC+sg*35)/2,84,1.5,19,M.stoneRaw))});
 box(gH,-161.5,YH,ZC,5,33,32,MP,{c:1});ROOFS.push(box(gH,-158.5,YH+33,ZC,11,1.5,32,M.stoneRaw));
 [3,3,2].forEach((n,i)=>{const y=YH+11*i,fy=i?y+1:y,TW=[[0,1,0],[1,0,1],[2,2]][i];
  if(i)box(gH,-156,y,ZC,6,1,32,MF,{ns:1});else box(gH,-156,YH,ZC,6,.06,32,MF,{ns:1});
  rep(n-1,k=>box(gH,-156,fy,ZC-16+(k+1)*(32/n),6,y+11-fy,.8,MP,{ns:1}));
  rep(n,k=>{const cz=ZC-16+(k+.5)*(32/n);fillCell('x',cz,-159,1,32/n-.8,6,fy,TW[k]);win(-164,y+4,cz,'x',-1,1.7,6)})});
 // ---------- עליה (40 אמה) + כרכוב + מעקה 3 + קוצים
 room(gH,-153,-86,ZC-16,ZC+16,YH+45,40,MP,{t:4,roof:1,rm:MP});
 box(gH,-119.5,YH+85,ZC,71,2,34,M.gold,{ns:1});
 [[-119.5,ZC-17.2,71,.8],[-119.5,ZC+17.2,71,.8]].forEach(a=>box(gH,a[0],YH+87,a[1],a[2],3,a[3],MP,{ns:1}));
 [-154.2,-84.8].forEach(x=>box(gH,x,YH+87,ZC,.8,3,34,MP,{ns:1}));
 // חלונות צרים: שורת חלונות מעל התאים (קיר ההיכל), ושתי שורות בעליה; דלת זהב צרה ומסיבה (סולם) בצפון
 [-143,-132,-121,-110,-99].forEach(x=>{[-1,1].forEach(sg=>{win(x,YH+35.5,ZC+sg*16,'z',sg,1.7,7);win(x,YH+52,ZC+sg*16,'z',sg,1.7,9);win(x,YH+68,ZC+sg*16,'z',sg,1.7,9)})});
 [-8,0,8].forEach(o=>{win(-153,YH+35.5,ZC+o,'x',-1,1.7,7);win(-153,YH+52,ZC+o,'x',-1,1.7,9);win(-153,YH+68,ZC+o,'x',-1,1.7,9)});
 box(gH,-91,YH+45,ZC-16.25,3.2,9,.5,M.gold,{ns:1});box(gH,-91,YH+45.4,ZC-16.5,2.4,8.2,.3,MG,{ns:1});
 {const lad=new T.Mesh(new T.BoxGeometry(1.4,.25,15.3),M.wood);lad.position.set(-91,YH+39.4,ZC-21.8);lad.rotation.x=-Math.atan2(11.2,10.4);gH.add(lad);
  rep(10,i=>box(gH,-91,YH+33.9+i*1.244,ZC-27+i*1.156,1.7,.12,.22,M.wood,{ns:1}))}
 // קוצים מזהב על הגגות
 {const sp=[];for(let z=Z0+2;z<=Z1-2;z+=2.5)sp.push([-65,YH+94,z]);for(let x=-153;x<=-86;x+=2.5){sp.push([x,YH+90,ZC-17.2],[x,YH+90,ZC+17.2])}
  const im=new T.InstancedMesh(new T.ConeGeometry(.22,1.6,5),M.gold,sp.length),m4=new T.Matrix4();sp.forEach((p,i)=>{m4.setPosition(p[0],p[1],p[2]);im.setMatrixAt(i,m4)});gH.add(im)}
 // ---------- פתח ההיכל (10×20) מצד האולם: דלתות זהב פתוחות, מסגרת, קורות ארז מדורגות, פרוכת בורדו מקופלת
 [-1,1].forEach(s=>{const d=box(gH,-80+Math.sin(1.31)*2.5,YH,ZC+s*(5+Math.cos(1.31)*2.5),5,20,.5,MG,{ns:1});d.rotation.y=-s*.26;
  box(gH,-79.7,YH,ZC+s*5.3,.3,20,.7,M.gold,{ns:1})});
 box(gH,-79.7,YH+20,ZC,.3,.7,11,M.gold,{ns:1});
 rep(5,i=>{box(gH,-79.3,YH+21.6+i*1.5,ZC,1.2,1,14+i*2,mDw,{ns:1});[-1,1].forEach(s=>box(gH,-79.3,YH+21.6+i*1.5,ZC+s*(7+i),1.3,1.05,.4,M.gold,{ns:1}))});
 [-1,1].forEach(s=>curtain(3.2,20,6,.25,-85.2,YH+10,ZC+s*3.4,Math.PI/2,MCurt));
 // גפן הזהב: נברשת (ספל זהב על שרשראות) + עלים וענבים כמעטפת מעל הפתח ועל צדיו
 {const env=u=>{const a=Math.abs(u),lo=a<.55?21:21-(a-.55)/.45*12;return[lo,a<.55?24+12*Math.sqrt(1-u*u):lo+8+4*(1-a)]},VX=-79.2;
  for(let i=0;i<460;i++){const u=hr()*2-1,e=env(u);I.lf.add(VX+hr()*2.4,YH+e[0]+(e[1]-e[0])*Math.pow(hr(),.8),ZC+u*15.5,.9,.2,1.2,hr()*6.28)}
  for(let i=0;i<90;i++){const u=hr()*2-1,e=env(u);I.grp.add(VX+.8+hr()*1.8,YH+e[0]+(e[1]-e[0])*hr(),ZC+u*15.5,.42,.42,.42)}
  [-1,1].forEach(s=>[0,1,2].forEach(j=>{const pts=[];for(let q=0;q<=10;q++){const t=q/10;pts.push(new T.Vector3(VX+.7+j*.6,YH+34+Math.sin(t*3+j)*1.5-t*t*(14+j*3),ZC+s*(1+t*14.5)))}
   gH.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),24,.14,5),M.gold))}));
  const prof=[[.01,0],[1.6,.2],[2.6,1.2],[2.9,2.2],[2.3,3.2],[1.4,3.6],[1.8,4.2],[.9,4.7],[.01,4.9]].map(p=>new T.Vector2(p[0],p[1])),bowl=new T.Mesh(new T.LatheGeometry(prof,20),M.gold);bowl.position.set(-77.6,YH+27,ZC);bowl.castShadow=true;gH.add(bowl);
  [-1.4,1.4].forEach(o=>cyl(gH,-77.6,YH+31.8,ZC+o,.1,57,M.gold,5));
  rep(10,i=>{const z=ZC+(i%2?-1:1)*(10.6+hr()*5),y=YH+1.5;cyl(gH,VX+1+hr()*.5,y,z,.06,10+hr()*6,M.gold,4)})}
 // ---------- ריהוט האולם: שולחנות שיש/זהב משני צדי הפתח, ספסלים, בית החליפות (סכינים) ובית הכלים (כלי זהב ומנורות)
 [-1,1].forEach(s=>{box(gH,-78.6,YH,ZC+s*21.5,1.2,5,3.2,M.gold,{c:1});box(gH,-78.6,YH+4.9,ZC+s*21.5,1.5,.3,3.8,MV,{ns:1});box(gH,-76.2,YH,ZC+s*21.5,1.4,1.3,3.6,MV,{ns:1})});
 fillCell('x',ZC-31.5,-79.7,1,24,3.2,YH,3);fillCell('x',ZC+25,-79.7,1,12,3.2,YH,0);fillCell('x',ZC+38,-79.7,1,12,3.2,YH,2);
 const il3=new T.PointLight(0xffd8a0,.35,45);il3.position.set(-74,YH+26,ZC);gH.add(il3);
 // ---------- פנים ההיכל: קירות זהב מובלט, רצפת שיש, תקרת זהב, פרוכת כפולה בלי כל פרט חסר
 [[-106,ZC-9.8],[-106,ZC+9.8]].forEach(a=>box(gH,-106,YH,a[1],40,40,.3,MG,{ns:1}));[[-137,ZC-9.8],[-137,ZC+9.8]].forEach(a=>box(gH,-137,YH,a[1],20,40,.3,MG,{ns:1}));
 box(gH,-146.8,YH,ZC,.3,40,20,MG,{ns:1});box(gH,-116.5,YH,ZC,61,.12,20,MF,{ns:1});
 box(gH,-85.85,YH,ZC-7.5,.3,40,5,MG,{ns:1});box(gH,-85.85,YH,ZC+7.5,.3,40,5,MG,{ns:1});box(gH,-85.85,YH+20,ZC,.3,20,10,MG,{ns:1});
 {const ce=new T.Mesh(new T.PlaneGeometry(61,20),MCe);const uv=ce.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*61/14,uv.getY(i)*20/14);
  ce.position.set(-116.5,YH+39.95,ZC);ce.rotation.x=Math.PI/2;gH.add(ce);ROOFS.push(ce)}
 [-126,-127.6].forEach(x=>curtain(20,38,20,.4,x,YH+19,ZC,Math.PI/2,MCurt));
 box(gH,-137,YH,ZC,1.6,.35,1.6,M.stoneRaw,{c:1});                         // אבן שתיה
 /* ---- ארון הברית וכרובי שלמה (בית ראשון) – אפשרות להצגה (תיבת סימון "ארון הברית"): ארון 2½×1½×1½ אמה מצופה זהב, כפורת, בדים; שני כרובי עץ שמן מצופי זהב בני עשר אמות, כנף חמש אמות: הכנפיים הפנימיות נוגעות זו בזו באמצע והחיצוניות בקירות (מלכים א ו:כג–כח; ח:ו–ז) ---- */
 var ARKG=new T.Group();ARKG.visible=false;gH.add(ARKG);
 {const gold=mk(0xe0b440,{metalness:.85,roughness:.28,emissive:0x2a1c04}),gold2=mk(0xf3cc62,{metalness:.9,roughness:.22,emissive:0x3a2806}),face=mk(0x6a4a1a,{roughness:.6});
  const tWing=cv(256,256,(c,w,h)=>{c.clearRect(0,0,w,h);const g=c.createLinearGradient(0,0,w,0);g.addColorStop(0,'#c99a2c');g.addColorStop(.6,'#efc860');g.addColorStop(1,'#d9a93a');c.fillStyle=g;
   c.beginPath();c.moveTo(0,h*.78);c.bezierCurveTo(w*.18,h*.5,w*.45,h*.16,w*.98,h*.03);   // קצה עליון: קשת מגב הכנף אל הקצה
   for(let i=0;i<9;i++){const x1=w*(.98-i*.105),y1=h*(.03+i*.095),x2=w*(.98-(i+1)*.105),y2=h*(.03+(i+1)*.095);c.quadraticCurveTo(x1+10,y1+h*.07,x2,y2)}   // קצה תחתון: נוצות מדורגות
   c.lineTo(0,h*.96);c.closePath();c.fill();c.strokeStyle='rgba(120,80,10,.55)';c.lineWidth=2;
   for(let i=0;i<9;i++){c.beginPath();c.moveTo(w*(.08+i*.04),h*(.8-i*.03));c.quadraticCurveTo(w*(.4+i*.06),h*(.4-i*.02),w*(.96-i*.05),h*(.06+i*.1));c.stroke()}});
  const mWing=new T.MeshStandardMaterial({map:tWing,transparent:true,alphaTest:.4,side:T.DoubleSide,metalness:.5,roughness:.4,emissive:0x2a1c04});
  const add=(g,geo,m,x,y,z,rx=0,ry=0,rz=0)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);o.castShadow=false;g.add(o);return o};
  // הארון: אורך 2.5 (ציר מזרח־מערב), רוחב 1.5, גובה 1.5; על אבן השתיה
  const A=new T.Group();A.position.set(-137,YH+.35,ZC);ARKG.add(A);
  add(A,new T.BoxGeometry(2.5,1.4,1.5),gold,0,.7,0);add(A,new T.BoxGeometry(2.6,.14,1.6),gold2,0,1.45,0);   // גוף וכפורת
  add(A,new T.BoxGeometry(2.56,.1,1.56),gold2,0,1.3,0);   // זר זהב סביב
  [-1,1].forEach(sz=>[-1,1].forEach(sx=>{add(A,new T.TorusGeometry(.12,.04,8,14),gold2,sx*1.0,.9,sz*.78,0,Math.PI/2,0);}));   // ארבע טבעות (גבים) בצלעות הארוך
  [-1,1].forEach(sz=>add(A,new T.CylinderGeometry(.07,.07,6.4,10),gold2,.7,.9,sz*.9,0,0,Math.PI/2));   // הבדים: משתלשלים מזרחה אל מול הפרוכת
  [-1,1].forEach(sz=>add(A,new T.SphereGeometry(.11,10,8),gold2,3.95,.9,sz*.9));
  // שני כרובים בני עשר אמות: פנים לבית (מזרחה), כנפיים פרושות לשני הצדדים
  [-1,1].forEach(sz=>{const C=new T.Group();C.position.set(-137,YH,ZC+sz*5);ARKG.add(C);
   add(C,new T.CylinderGeometry(1.5,2.1,5.6,18),gold,0,2.8,0);   // גוף (ברכיים ורגליים מכוסים)
   add(C,new T.CylinderGeometry(1.15,1.5,2.6,18),gold2,0,6.8,0);add(C,new T.CylinderGeometry(.5,.8,.9,12),gold,0,8.4,0);   // חזה וצוואר
   add(C,new T.SphereGeometry(.95,16,12),face,.12,9.35,0,0,0,0);add(C,new T.SphereGeometry(.2,8,6),gold,.95,9.4,.35);add(C,new T.SphereGeometry(.2,8,6),gold,.95,9.4,-.35);   // פנים (מזרחה)
   add(C,new T.TorusGeometry(.9,.12,8,18),gold2,0,10.15,0,Math.PI/2,0,0);   // כתר
   [-1,1].forEach(sw=>{const w=add(C,new T.PlaneGeometry(5,6.2),mWing,0,6.4,sw*2.5,0,Math.PI/2,0);w.scale.x=sw;w.userData.wing=1});   // כנף חמש אמות לכל צד
  });
 }
 // לוח זהב ממוסגר בקיר הצפוני ודלת זהב קטנה (פשפש)
 box(gH,-110,YH+13,ZC-9.5,7,5,.3,M.gold,{ns:1});box(gH,-110,YH+13.6,ZC-9.4,5.8,3.8,.3,mDw,{ns:1});rep(4,i=>box(gH,-110,YH+14.2+i*.8,ZC-9.25,4.6,.22,.05,M.gold,{ns:1}));
 box(gH,-95,YH,ZC-9.5,3.6,8.6,.3,M.gold,{ns:1});box(gH,-95,YH,ZC-9.4,3,8,.3,MG,{ns:1});
 // שני עמודונים קטנים לפני הפרוכת
 [-2.5,2.5].forEach(o=>{cyl(gH,-124.8,YH,ZC+o,.12,2.2,M.gold,6);cyl(gH,-124.8,YH+2.2,ZC+o,.3,.25,M.gold,8);sph(gH,-124.8,YH+2.7,ZC+o,.13,M.flame)});
 // מזבח הזהב (1×1×2 עם קרנות), שולחן (2×1×1.5 + 12 לחם), מנורה (7 קנים) על שלוש מדרגות שיש
 box(gH,-116,YH,ZC,1,2,1,M.gold,{c:1});box(gH,-116,YH+2,ZC,1.3,.15,1.3,M.gold,{ns:1});[[-.6,-.6],[.6,-.6],[-.6,.6],[.6,.6]].forEach(o=>box(gH,-116+o[0],YH+2.1,ZC+o[1],.14,.4,.14,M.gold,{ns:1}));
 box(gH,-100,YH,ZC-6,1,1.5,2,M.gold,{c:1});rep(12,i=>box(gH,-100,YH+1.5+Math.floor(i/6)*.3+.2,ZC-6.5+(i%6<3?0:1.0)+(i%3)*.0,.5,.25,.6,M.stoneRaw,{ns:1}));
 {const mg=new T.Group(),h=3;cyl(mg,0,0,0,.4,.2,M.gold,10);cyl(mg,0,.2,0,.07,h,M.gold,8);
  [1,2,3].forEach(k=>{const r=k*.5,a=new T.Mesh(new T.TorusGeometry(r,.05,6,18,Math.PI),M.gold);a.position.y=h*(.35+k*.07);mg.add(a);const a2=a.clone();a2.rotation.y=Math.PI;});
  [1,2,3].forEach(k=>{[-1,1].forEach(s=>{const y0=h*(.35+k*.07);cyl(mg,s*k*.5,y0,0,.05,h-y0,M.gold,6);cyl(mg,s*k*.5,h,0,.12,.12,M.gold,8);sph(mg,s*k*.5,h+.25,0,.13,M.flame)})});
  cyl(mg,0,h,0,.12,.12,M.gold,8);sph(mg,0,h+.25,0,.13,M.flame);mg.rotation.y=Math.PI/2;mg.position.set(-100,YH+.8,ZC+6);
  cyl(gH,-100,YH,ZC+6,2.5,.27,MP,20);cyl(gH,-100,YH+.27,ZC+6,1.8,.27,MP,20);cyl(gH,-100,YH+.54,ZC+6,1.1,.26,MP,20);mg.scale.setScalar(1.15);gH.add(mg)}
 const il=new T.PointLight(0xffc070,.45,60);il.position.set(-104,YH+24,ZC);gH.add(il);var hekLight=il;
 const il2=new T.PointLight(0xffd090,.3,30);il2.position.set(-137,YH+16,ZC);gH.add(il2);
 Object.values(I).forEach(i=>i.fin(gH));
 lbl('האולם · 100 רוחב × 11',-70,YH+97,ZC,'hekhal',650,1);lbl('ההיכל · 100×100×100',-120,YH+104,ZC,'hekhal',650,1);
 lbl('פתח ההיכל 20×10',-81,YH+22,ZC,'hekhal',110);lbl('שער האולם 40×20',-62,YH+42,ZC,'hekhal',160);lbl('העליה · 40 אמה',-120,YH+92,ZC,'hekhal',280);
 lbl('38 תאים',-122,YH+36,ZC-34,'hekhal',230);lbl('קודש הקדשים 20×20',-137,YH+30,ZC,'hekhal',90);lbl('ההיכל 40×20',-106,YH+30,ZC,'hekhal',90);
 lbl('מנורה',-100,YH+6,ZC+6,'hekhal',60);lbl('שולחן הלחם',-100,YH+4.5,ZC-6,'hekhal',60);lbl('מזבח הזהב',-116,YH+4.5,ZC,'hekhal',60);lbl('אבן שתיה',-137,YH+2.5,ZC,'hekhal',60);lbl('פרוכת',-126.5,YH+22,ZC,'hekhal',60);
 lbl('גפן הזהב',-78,YH+36,ZC,'hekhal',110);lbl('בית החליפות (סכינים)',-77,YH+11,ZC-31.5,'hekhal',90);lbl('בית הכלים: כלי זהב ומנורות',-77,YH+11,ZC+31.5,'hekhal',90);
 lbl('תאים: כלי שרת · אוצר · מנורות',-125,YH+12,ZC+38,'hekhal',200)}

/* ---- תוויות כלליות ---- */
[['הר הבית · 500×500 אמה',0,70,-60,'mount',1800,1],['שער שושן (מזרח)',246,30,ZC,'mount',500],['שערי חולדה (דרום)',25,30,246,'mount',500],['שער קיפונוס (מערב)',-246,30,-100,'mount',500],['שער טדי (צפון) · פתח מחודד, יציאת המסיבה',-102,24,-246,'mount',500],
 ['הסטיו המלכותי',0,76,205,'mount',700,1],['סטיו שלמה (מזרח)',230,34,-60,'mount',400],['גשר הכבשים · פרה אדומה',420,6,ZC,'env',900],
 ['החיל והסורג',167,5,-57,'chel',260],['עזרת נשים · 135×135',85,14,-57.5,'nashim',500,1],['שער ניקנור',14.5,38,ZC,'nashim',320],['ט״ו מעלות',21,17,ZC,'nashim',100],
 ['עזרת ישראל · 11 אמה',6.5,19,-100,'azarah',160],['עזרת כהנים · 11 אמה',-4.5,19,-100,'azarah',160],['העזרה · 187×135',-70,64,-125,'azarah',700,1],
 ['מנורות שמחת בית השואבה',85,66,-57,'nashim',300],['לשכת נזירים',132,19,-10,'nashim',120],['לשכת עצים',132,19,-105,'nashim',120],['לשכת מצורעים',37,19,-105,'nashim',120],['לשכת שמן ויין',37,19,-10,'nashim',120]].forEach(a=>lbl(a[0],a[1],a[2],a[3],a[4],a[5],a[6]));

/* ---- עמודים (מופע חוזר) + אינסטנס ---- */
{const geo=new T.CylinderGeometry(1,1,1,14);geo.translate(0,.5,0);const im=new T.InstancedMesh(geo,M.marble,cols.length),m4=new T.Matrix4();
 cols.forEach((c,i)=>{m4.makeScale(c[4],c[3],c[4]);m4.setPosition(c[0],c[2],c[1]);im.setMatrixAt(i,m4);COL.push([c[0]-c[4],c[0]+c[4],c[1]-c[4],c[1]+c[4],c[2],c[2]+c[3],gSt])});im.castShadow=im.receiveShadow=true;gSt.add(im)}
// כותרות זהב ובסיסי שיש לעמודי הסטווים (מהסרטון: עמודי שיש עם כותרת מוזהבת)
{const g1=new T.CylinderGeometry(1.5,1,1,12),g2=new T.CylinderGeometry(1.2,1.35,1,12);g1.translate(0,.5,0);g2.translate(0,.5,0);
 const ic=new T.InstancedMesh(g1,M.gold,cols.length),ib=new T.InstancedMesh(g2,M.marble,cols.length),m4=new T.Matrix4();
 cols.forEach((c,i)=>{m4.makeScale(c[4],c[4]*1.6,c[4]);m4.setPosition(c[0],c[2]+c[3]-c[4]*1.6,c[1]);ic.setMatrixAt(i,m4);m4.makeScale(c[4],c[4]*.7,c[4]);m4.setPosition(c[0],c[2],c[1]);ib.setMatrixAt(i,m4)});
 ic.castShadow=ib.castShadow=true;gSt.add(ic,ib)}
// עשן המערכה – עמוד ישר
const smoke=[];{const t=cv(64,64,(c,w,h)=>{const g=c.createRadialGradient(32,32,2,32,32,30);g.addColorStop(0,'rgba(255,255,255,.7)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,w,h)});
 rep(26,i=>{const s=new T.Sprite(new T.SpriteMaterial({map:t,color:0xcfc8c0,transparent:true,depthWrite:false,fog:true}));s.userData={p:i/26};gA.add(s);smoke.push(s)})}
