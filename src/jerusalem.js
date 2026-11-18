/* ===== ירושלים בימי בית שני (משוער) – שטח, חומות, שכונות ואתרים לפי ממצאים ארכאולוגיים =====
   מקור המפה: מיקומים יחסיים משוערים (מ' מהר הבית; 1 אמה ≈ 0.5 מ'). הכול בנייה פרוצדורלית. */
const smth=(a,b,v)=>{const t=Math.min(1,Math.max(0,(v-a)/(b-a)));return t*t*(3-2*t)};
const gs=(v,c,w,p=2)=>Math.exp(-Math.pow(Math.abs((v-c)/w),p));
const FLAT=[[-60,1440,110,-220],[120,-345,140,25],[-500,-100,150,0]];                  // ברכת השילוח, בית חסדא, הסטיו/הכיכר המערבית
function terrH(x,z){const mx=x/2,mz=z/2;
 let e=700-70*smth(-100,900,mz)-40*smth(500,1100,Math.hypot(mx,mz-100));
 e+=40*(1-smth(100,800,mz))*gs(mx,20,110+60*smth(0,800,mz));                           // רכס הר הבית–אופל–עיר דוד
 e+=55*gs(mx,50,300,6)*gs(mz,-420,250,6)+115*gs(mx,650,260)*gs(mz,-20,700);           // בית חדתא (העיר החדשה), הר הזיתים
 e+=65*gs(mx,-415,260,6)*gs(mz,230,450,6)-35*gs(mx,200,45)*smth(-500,-200,mz);         // הגבעה המערבית (העיר העליונה), נחל קדרון
 let h=(e-740)*2;
 for(const f of FLAT){const d=Math.hypot(x-f[0],z-f[1]);if(d<f[2]*1.8)h+=(f[3]-h)*(1-smth(f[2]*.6,f[2]*1.8,d))}
 if(Math.abs(x)<252&&Math.abs(z)<252)h=Math.min(h,-3);return h}

/* ---------- שטח ---------- */
{const N=220,S=7000,g=new T.PlaneGeometry(S,S,N,N);g.rotateX(-Math.PI/2);const p=g.attributes.position,n=p.count,c=new Float32Array(n*3);
 for(let i=0;i<n;i++)p.setY(i,terrH(p.getX(i),p.getZ(i)));g.computeVertexNormals();const nr=g.attributes.normal;
 const rock=new T.Color(.84,.74,.52),green=new T.Color(.5,.55,.28),pale=new T.Color(.93,.86,.7),k=new T.Color();
 for(let i=0;i<n;i++){const x=p.getX(i),z=p.getZ(i),h=p.getY(i),mx=x/2,slope=1-nr.getY(i);
  const f=Math.min(1,.55*gs(mx,620,300)+.5*smth(-100,-190,h)*gs(mx,210,130)+.25*gs(z/2,-500,300)+.4*gs(Math.hypot(x,z),0,720,3));   // + מרחב ירוק־זית סביב הר הבית (כמו בסרטון)
  k.copy(rock).lerp(green,f);k.lerp(pale,Math.min(.6,.45*(gs(mx,-420,330,4)*gs(z/2,250,480,4)+gs(mx,100,160,4)*gs(z/2,450,420,4))));
  k.multiplyScalar((1-slope*1.4)*(.94+rand()*.12));c.set([k.r,k.g,k.b],i*3)}
 g.setAttribute('color',new T.BufferAttribute(c,3));const tm=tDirt.clone();tm.repeat.set(160,160);tm.needsUpdate=true;
 const m=new T.Mesh(g,new T.MeshStandardMaterial({vertexColors:true,map:tm,roughness:1}));m.receiveShadow=true;gE.add(m)}

/* ---------- עזרים ---------- */
function inst(g,items,mat,geo=new T.BoxGeometry(1,1,1)){const im=new T.InstancedMesh(geo,mat,items.length),o=new T.Object3D();
 items.forEach((q,i)=>{o.position.set(q.x,q.y+q.sy/2,q.z);o.rotation.set(0,q.ry||0,0);o.scale.set(q.sx,q.sy,q.sz);o.updateMatrix();im.setMatrixAt(i,o.matrix);if(q.c)im.setColorAt(i,q.c)});
 im.castShadow=im.receiveShadow=true;g.add(im);
 if(mat===matH)items.forEach(q=>{if(q.sy<2)return;const cs=Math.abs(Math.cos(q.ry||0)),sn=Math.abs(Math.sin(q.ry||0)),hw=(cs*q.sx+sn*q.sz)/2,hd=(sn*q.sx+cs*q.sz)/2;COL.push([q.x-hw,q.x+hw,q.z-hd,q.z+hd,q.y,q.y+q.sy,g.userData&&g.userData.min!==undefined?g:null])});
 return im}
const palette=[0xe6d7b4,0xdccaa0,0xd2bd92,0xe9dec3,0xcdb88a].map(c=>new T.Color(c));
const EX=[[-330,330,-330,330],[-320,-20,-380,-240],[-1260,-740,-130,70],[-190,70,1330,1560],[-100,330,-450,-230],[-680,-380,-230,-20],[-70,120,250,470],[-440,-240,-130,-70],[-290,-240,200,340]]; // אזורים תפוסים
const near=(x,z,path,r)=>{for(let i=0;i<path.length-1;i++){const a=path[i],b=path[i+1],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz))),d=Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);if(d<r)return true}return false};
const PILGRIM=[[-60,1440],[-120,1100],[-210,740],[-250,520],[-262,262]],MAINST=[[-1000,-110],[-700,-100],[-520,-100]];
/* ----- חיי העיר (משוער): האתרים נקבעים כאן כדי שהבתים האקראיים לא ייפלו עליהם; הבנייה – בבלוק "חיי העיר" בסוף הקובץ ----- */
const LF_SYN=[[40,560,'n','theo'],[-540,200,'e','alex'],[-760,420,'e','up'],[-30,-600,'s','new'],[-160,1230,'n','sil']];                    // בתי כנסת: מרכז, צד הדלת, מזהה
const LF_HALL=[[-650,150,'e'],[-650,240,'e'],[-650,330,'e'],[-550,420,'e'],[150,440,'n'],[-170,470,'n']];                                  // אולמות חבורה
const LF_MIK=[[-108,360,2,3],[150,370,2,3],[105,1420,2,2]];                                                                              // מקוואות: מרכז, עמודות, שורות
const LF_WELL=[[-72,1262],[-140,900],[-205,640],[30,700],[110,950]],LF_M1=[-600,548],LF_MILL=[[-720,650,'e'],[60,820,'n']],LF_PRESS=[600,-130],LF_HANAN=[790,-150];
const LF_AQ=[[-1130,200],[-960,150],[-780,115],[-610,80],[-500,55],[-455,-20],[-450,-100]],LF_TUN=[[340,660],[-60,1440]];                 // אמת המים (קו משוער), מנהרת חזקיהו (קו משוער)
const LF_X=(x0,x1,z0,z1)=>{const m=(z1>250&&z0<470&&x0>-260&&x1<260)?32:17;EX.push([x0-m,x1+m,z0-m,z1+m])};   // שוליים: הבתים האקראיים נבדקים במרכזם בלבד (עד 60 רוחב באופל)
LF_SYN.forEach(a=>LF_X(a[0]-50,a[0]+50,a[1]-50,a[1]+50));LF_HALL.forEach(a=>LF_X(a[0]-48,a[0]+48,a[1]-42,a[1]+42));
LF_MIK.forEach(c=>LF_X(c[0]-c[2]*6.5,c[0]+c[2]*6.5,c[1]-c[3]*8,c[1]+c[3]*8));LF_WELL.forEach(a=>LF_X(a[0]-10,a[0]+10,a[1]-10,a[1]+10));
LF_X(LF_M1[0]-80,LF_M1[0]+80,LF_M1[1]-85,LF_M1[1]+85);LF_X(-655,-565,-330,-250);LF_MILL.forEach(a=>LF_X(a[0]-45,a[0]+45,a[1]-45,a[1]+45));
LF_X(LF_PRESS[0]-45,LF_PRESS[0]+45,LF_PRESS[1]-40,LF_PRESS[1]+40);LF_X(LF_HANAN[0]-55,LF_HANAN[0]+55,LF_HANAN[1]-35,LF_HANAN[1]+35);
function scatter(x0,x1,z0,z1,n,w0,w1,h0,h1,ok){const out=[];let t=0;while(out.length<n&&t++<n*14){const x=x0+rand()*(x1-x0),z=z0+rand()*(z1-z0);
  if(EX.some(e=>x>e[0]&&x<e[1]&&z>e[2]&&z<e[3])||near(x,z,PILGRIM,14)||near(x,z,MAINST,12)||near(x,z,LF_AQ,22)||(ok&&!ok(x,z)))continue;
  const w=w0+rand()*(w1-w0),d=w0+rand()*(w1-w0),h=h0+rand()*(h1-h0);
  out.push({x,y:terrH(x,z)-2,z,sx:w,sy:h+2,sz:d,ry:(rand()-.5)*.6,c:palette[rand()*5|0].clone().multiplyScalar(.82+rand()*.28)})}return out}
function tube(g,a,b,w,hh,mat,y0){box(g,(a[0]+b[0])/2,y0,(a[1]+b[1])/2,Math.abs(b[0]-a[0])+w,hh,Math.abs(b[1]-a[1])+w,mat,{ns:1})}

const mkP=(n,min,max=99)=>{const g=new T.Group();g.userData={min,max};gE.add(g);GRP[n]=g;PGS.push(g);return g};
const gUp=mkP('pUp',4),gLow=mkP('pLow',0),gOph=mkP('pOph',4),gNew=mkP('pNew',5),gTyr=mkP('pTyr',4),gW1=mkP('pW1',4),gWN=mkP('pWN',0,3),gW2=mkP('pW2',4),gW3=mkP('pW3',6,6),gPal=mkP('pPal',5),gAnt=mkP('pAnt',5),gBar=mkP('pBar',0,4),gAkr=mkP('pAkr',3,4),gBeth=mkP('pBeth',2),gHer=mkP('pHer',5),gHas=mkP('pHas',4);
/* ---------- שכונות (אינסטנסים) ---------- */
const matH=new T.MeshStandardMaterial({color:0xb4a98e,roughness:.95});
inst(gUp,scatter(-1350,-350,-300,1280,700,13,30,7,17),matH);                              // העיר העליונה
inst(gLow,scatter(-120,330,330,1300,520,10,22,6,12,(x,z)=>terrH(x,z)>-200),matH);        // עיר דוד והעיר התחתית
inst(gOph,scatter(-250,250,265,420,24,30,60,12,22),matH);                                  // האופל
inst(gNew,scatter(-560,320,-1000,-380,230,13,30,7,14),matH);                               // בית חדתא (העיר החדשה)
inst(gTyr,scatter(-420,-275,-250,260,130,10,22,6,12),matH);                                // השוק בגיא הטיופויון
{const tr=[];rep(380,()=>{const x=520+rand()*900,z=-500+rand()*900,h=terrH(x,z);if(h>-150&&!EX.some(e=>x>e[0]&&x<e[1]&&z>e[2]&&z<e[3]))tr.push({x,y:h-.5,z,sx:7,sy:5,sz:7,c:new T.Color().setHSL(.22,.3,.3+rand()*.12)})});
 rep(70,()=>{const x=330+rand()*120,z=-100+rand()*500;tr.push({x,y:terrH(x,z)-.5,z,sx:6,sy:5,sz:6,c:new T.Color().setHSL(.24,.35,.3)})});
 inst(gE,tr,new T.MeshStandardMaterial({color:0xffffff,roughness:1}),new T.SphereGeometry(.5,7,5))}                    // זיתים בהר הזיתים ובקדרון

/* ---------- חומות: ראשונה (עיר עליונה ועיר דוד), שנייה (אל אנטוניה), שלישית (אגריפס) ---------- */
function wallPath(pts,hgt,th,every,col,g=gE){const P=pts.map(p=>[p[0]*2,p[1]*2]),it=[],tw=[];let acc=0;
 for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(L/14)),ry=-Math.atan2(b[1]-a[1],b[0]-a[0]);
  for(let k=0;k<n;k++){const t=(k+.5)/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t,sg=L/n+.4,y=terrH(x,z)-4;it.push({x,y,z,sx:sg,sy:hgt+4,sz:th,ry,c:col});acc+=sg;
   if(acc>=every){acc=0;tw.push({x,y,z,sx:22,sy:hgt+16,sz:22,ry,c:col})}}}
 inst(g,it,matH);inst(g,tw,matH)}
const cW1=new T.Color(.86,.8,.66),cW2=new T.Color(.8,.74,.6),cW3=new T.Color(.92,.86,.72);
wallPath([[125,125],[125,200],[125,400],[110,560],[40,700],[-20,720],[-60,690]],20,8,60,cW2,gWN);wallPath([[-125,125],[-70,300],[-90,500],[-60,690]],20,8,60,cW2,gWN);   // חומת עיר דוד (נחמיה/הסלווקים)
wallPath([[-480,-30],[-380,-50],[-280,-40],[-190,-20],[-130,-30]],26,10,64,cW1,gW1);
wallPath([[-480,-30],[-540,60],[-530,200],[-500,350],[-420,520],[-300,600],[-180,640],[-90,680],[-40,720],[40,700],[120,560],[130,400],[125,200],[125,130]],26,10,64,cW1,gW1);
wallPath([[-440,-40],[-440,-180],[-330,-280],[-200,-290],[-90,-200],[-70,-170]],24,9,60,cW2,gW2);
wallPath([[-480,-30],[-640,-100],[-650,-500],[-400,-720],[0,-760],[240,-600],[250,-300],[205,-120]],30,11,70,cW3,gW3);

/* ---------- ארמון הורדוס ומגדליו ---------- */
{const gy=terrH(-1000,-40);const tower=(x,z,s,solid,total,w)=>{const y=terrH(x,z)-3;box(gPal,x,y,z,s,solid+3,s,M.stone);box(gPal,x,y+solid+3,z,s*.82,total-solid-5,s*.82,M.marble);box(gPal,x,y+total-2,z,s*1.1,2,s*1.1,M.stone);
  rep(4,i=>box(gPal,x+(i%2?1:-1)*s*.5,y+total,z+(i<2?1:-1)*s*.5,2.2,3.5,2.2,M.stone,{ns:1}));lbl(w,x,y+total+6,z,'pPal',700,0)};
 tower(-1200,-100,25,30,80,'מגדל היפיקוס');tower(-1090,-100,40,40,90,'מגדל פצאל');tower(-960,-100,20,20,55,'מגדל מרים');
 const py=gy-2;box(gPal,-1005,py-30,-25,450,32,120,M.stone);box(gPal,-1090,py+2,-35,170,24,66,M.marble);box(gPal,-920,py+2,-35,170,24,66,M.marble);       // אגפי הארמון
 rep(17,i=>cyl(gPal,-1130+i*16,py+2,2,.9,15,M.marble,8));
 {const t=[];rep(36,()=>t.push({x:-1010+(rand()-.5)*120,y:py+2,z:-25+(rand()-.5)*34,sx:5,sy:5,sz:5,c:new T.Color().setHSL(.25,.4,.3)}));inst(gPal,t,new T.MeshStandardMaterial({color:0xffffff}),new T.SphereGeometry(.5,6,4))}
 box(gPal,-1010,py+2.2,-25,70,.3,10,M.water,{ns:1});lbl('ארמון הורדוס',-1005,py+34,-25,'pPal',2200,1)}

/* ---------- אנטוניה (פינת צפון־מערב של הר הבית) ---------- */
{const y0=0;box(gAnt,-170,-40,-315,220,60,95,M.stoneRaw);box(gAnt,-170,20,-315,200,22,76,M.stone);   // הוזז 20 אמה צפונה: לא חוסם את מרפסת החומה ואת היציאה משער טדי
 [[-262,-358,50],[-78,-358,50],[-262,-278,50],[-78,-278,70]].forEach(a=>{box(gAnt,a[0],20,a[1],20,a[2]+22,20,M.stone);box(gAnt,a[0],42+a[2],a[1],24,2,24,M.stone)});
 lbl('מצודת אנטוניה',-170,95,-315,'pAnt',2400,1)}

{const yb=0;box(gBar,-170,-40,-295,150,50,70,M.stoneRaw);box(gBar,-170,10,-295,100,26,40,M.stone);[[-230,-325],[-110,-325],[-230,-265],[-110,-265]].forEach(a=>box(gBar,a[0],10,a[1],14,34,14,M.stone));lbl('הבירה (מצודת הר הבית)',-170,52,-295,'pBar',2400,1)}
{const ay=terrH(60,420);box(gAkr,60,ay-6,420,130,50,70,M.stoneRaw);box(gAkr,60,ay+44,420,100,24,40,M.stone);lbl('החקרא (מצודת הסלווקים)',60,ay+84,420,'pAkr',2400,1)}
/* ---------- ברכות, מעיין, שביל עולי רגל, קשתות ---------- */
function pool(cx,cz,w,d,steps,lab,g=gE,gn='env'){const y=terrH(cx,cz);box(g,cx,y-6,cz,w+8,6,d+8,M.stone);
 for(let i=0;i<steps;i++)box(g,cx,y-6+i*1.6+1,cz,w-i*10,1.6,d-i*8,M.marble,{ns:1});box(g,cx,y-.6,cz,w-steps*8,.4,d-steps*7,M.water,{ns:1});lbl(lab,cx,y+14,cz,gn,1500,0)}
pool(-60,1440,120,100,4,'ברכת השילוח');pool(60,-345,110,80,3,'בית חסדא (ברכות)',gBeth,'pBeth');pool(190,-345,110,80,3,'',gBeth,'pBeth');
{const y=terrH(340,660);box(gE,340,y,660,16,8,16,M.stone);box(gE,340,y+.2,660,10,.5,10,M.water,{ns:1});lbl('מעיין הגיחון',340,y+14,660,'env',1500,0)}
{const it=[];[[PILGRIM,16],[MAINST,16]].forEach(([P,w])=>{for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(L/9);
  for(let k=0;k<n;k++){const t=(k+.5)/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;it.push({x,y:terrH(x,z)-.3,z,sx:L/n+.6,sy:1,sz:w,ry:-Math.atan2(b[1]-a[1],b[0]-a[0]),c:new T.Color(.93,.89,.78)})}}});inst(gHer,it,matH)}
// קשתות (ספנדרל מחולל עם פתח קשתי; כמה קומות כשהעומק גדול): גשרי ההר כפי שבסרטון – שורת קשתות גבוהות על פירים
function spandrel(g,xa,xb,y0,hh,zc,dd,mat){const W=xb-xa,ry=Math.min(W/2,hh-2.5),ys=hh-ry-2,sh=new T.Shape();
 sh.moveTo(0,ys);sh.lineTo(0,hh);sh.lineTo(W,hh);sh.lineTo(W,ys);sh.absellipse(W/2,ys,W/2,ry,0,Math.PI,false);
 const geo=new T.ExtrudeGeometry(sh,{depth:dd,bevelEnabled:false,curveSegments:20}),uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/8,uv.getY(i)/8);
 const m=new T.Mesh(geo,mat);m.position.set(xa,y0,zc-dd/2);m.castShadow=m.receiveShadow=true;g.add(m);return m}
function arcade(g,xs,zc,dd,yb,mat,pw){const gy=x=>terrH(x,zc);
 xs.forEach(x=>{const b=Math.min(gy(x-pw/2),gy(x),gy(x+pw/2))-3;if(yb-b>1)box(g,x,b,zc,pw,yb-b,dd,mat)});
 for(let i=0;i<xs.length-1;i++){const a=Math.min(xs[i],xs[i+1])+pw/2,b=Math.max(xs[i],xs[i+1])-pw/2;let gm=1e9;for(let k=0;k<=8;k++)gm=Math.min(gm,gy(a+(b-a)*k/8));
  gm-=3;const D=yb-gm;if(D<=0)continue;if(D<10){box(g,(a+b)/2,gm,zc,b-a,D,dd,mat);continue}
  const n=Math.max(1,Math.round(D/38)),ht=D/n;for(let k=0;k<n;k++)spandrel(g,a,b,yb-(k+1)*ht,ht,zc,dd,mat)}}
// קשת וילסון (גשר לעיר העליונה) + שער הר הבית שם, קשת רובינסון ומדרגות
{box(gHer,-335,-5,-100,170,5,26,M.stone);arcade(gHer,[-253.5,-285.5,-317.5,-349.5],-100,22,-5,M.stone,7);box(gHer,-500,-3,-100,12,3,60,M.stone,{ns:1});
 [-113.2,-86.8].forEach(z=>box(gHer,-335,0,z,170,1.4,.8,M.marble,{ns:1}));   // מעקות
 lbl('קשת וילסון',-335,8,-100,'pHer',900,0);
 {const x0=-276,x1=-250,zN=226,L=96,n=80,yS=terrH(-270,322),rise=-yS/n,dz=L/n,yB=yS-6;   // מדרגות מונומנטליות לאורך הכותל המערבי (80 מעלות, מפרופיל אחד), מהרחוב עד רחבת הקשת
  const sh=new T.Shape();sh.moveTo(zN+L,yB);sh.lineTo(zN+L,yS+rise);
  for(let i=0;i<n;i++){const y=yS+(i+1)*rise,zn=zN+L-(i+1)*dz;sh.lineTo(zn,y);if(i<n-1)sh.lineTo(zn,y+rise)}
  sh.lineTo(zN,yB);const geo=new T.ExtrudeGeometry(sh,{depth:x1-x0,bevelEnabled:false}),uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/8,uv.getY(i)/8);
  const st=new T.Mesh(geo,M.stone);st.rotation.y=-Math.PI/2;st.position.x=x1;st.castShadow=st.receiveShadow=true;gHer.add(st);
  ZN.push({r:[-282,x1,200,zN],y:0},{r:[x0,x1,zN,zN+L],ax:'z',a:zN+L,ya:yS,b:zN,yb:0});
  // מעקות המדרגות (משופעים) ושורת חנויות קמורות בחזית המערבית של בסיס המדרגות
  {const Ls=Math.hypot(L,-yS),th=Math.atan2(-yS,L);[x0+.4,x1-.4].forEach(px=>{const pr=box(gHer,px,yS/2,zN+L/2,.8,1.8,Ls,M.stone,{ns:1});pr.rotation.x=th})}
  const mkA=(w,hl)=>{const q=new T.Shape(),r=w/2;q.moveTo(-r,0);q.lineTo(-r,hl);q.absarc(0,hl,r,Math.PI,0,true);q.lineTo(r,0);return new T.ShapeGeometry(q,14)};
  for(let zc=244;zc<=304;zc+=10){const base=terrH(x0-2,zc)+.4,top=yS*(1-(zN+L-zc)/L);if(top-base<10)continue;
   const f=new T.Mesh(mkA(10.4,3.6),M.marble),d=new T.Mesh(mkA(8,3),M.dark);[f,d].forEach((m,j)=>{m.rotation.y=-Math.PI/2;m.position.set(x0-.12-j*.1,base+(j?0:-.2),zc);gHer.add(m)})}
  // הקשת עצמה: קשת עגולה של 32 אמה ממפלס רחבה ועד הכותל, עמוד (פיר) מערבי ורחבה עם מעקות
  spandrel(gHer,-282,x1,-24,24,213,26,M.stone);const pb=terrH(-285,213)-3;box(gHer,-285,pb,213,6,-18-pb,26,M.stone);
  box(gHer,-281.6,0,213,.8,1.5,26,M.stone,{ns:1});box(gHer,-266,0,200.4,32,1.5,.8,M.stone,{ns:1});
  lbl('קשת רובינסון',-266,14,213,'pHer',900,0)}
 // המדרגות הדרומיות אל שערי חולדה
 {const sy=terrH(25,340),n=24,r=-sy/n;rep(n,i=>box(gHer,25,-120,254+i*3.6+1.8,134,120-(i+1)*r,3.6,M.stone,{ns:1}));ZN.push({r:[-42,92,250,340],ax:'z',a:250,ya:0,b:340,yb:sy});
  box(gHer,25,-3,252,134,3,4.2,M.terr,{ns:1});   // רחבת העליון בין החומה למדרגה הראשונה
  const Ls=Math.hypot(90,-sy),th=Math.atan2(-sy,90);[-41.4,91.4].forEach(px=>{const pr=box(gHer,px,sy/2,295,1.2,2.2,Ls,M.stone,{ns:1});pr.rotation.x=th;sph(gHer,px,2.4,250.8,1,M.stone)})}   // מעקות עם כדורי אבן
 lbl('המדרגות הדרומיות',25,-4,315,'pHer',700,0)}
// קבר אבשלום, קבר זכריה, קבר בני חזיר (נחל קדרון)
{const T1=(x,z)=>terrH(x,z);let y=T1(400,160);box(gHer,400,y-2,160,18,26,18,M.stoneRaw);cyl(gHer,400,y+24,160,6,8,M.stoneRaw,12);const cone=new T.Mesh(new T.ConeGeometry(7,12,12),M.stoneRaw);cone.position.set(400,y+38,160);cone.castShadow=true;gHer.add(cone);lbl('יד אבשלום',400,y+52,160,'pHer',900,0);
 y=T1(432,205);box(gHer,432,y-2,205,14,16,14,M.stoneRaw);const py2=new T.Mesh(new T.ConeGeometry(10,9,4),M.stoneRaw);py2.rotation.y=Math.PI/4;py2.position.set(432,y+18,205);gHer.add(py2);lbl('קבר זכריה',432,y+30,205,'pHer',700,0);
 y=T1(408,262);box(gHer,408,y-2,262,22,16,5,M.stoneRaw);[-5,5].forEach(o=>cyl(gHer,408+o,y-2,266,.9,14,M.marble,8));lbl('קבר בני חזיר',408,y+22,262,'pHer',700,0)}
// הבית הכנסת והכיכר: צוק הגבול, בית המועצה, הארמון החשמונאי
{const y=terrH(-520,-60);box(gHas,-520,y,-60,44,16,32,M.stone);lbl('בית המועצה',-520,y+22,-60,'pHas',900,0);box(gHas,-600,y,-190,74,24,52,M.stone);lbl('ארמון בית חשמונאי',-600,y+30,-190,'pHas',1000,0);
 rep(18,i=>cyl(gHas,-640+i*12,y,-120,1,12,M.marble,8));lbl('הסטיו',-540,y+14,-120,'pHas',800,0)}
// גשר פרה אדומה: הר הבית – הר המשחה
{box(gE,486,-3,ZC,472,3,11,M.terr);[-5,5].forEach(o=>{box(gE,486,0,ZC+o,472,2.6,.9,M.stone,{ns:1});box(gE,486,2.6,ZC+o,472,.4,1.5,M.wood,{ns:1})});   // משטח מרוצף ומעקות אבן גבוהים עם כיפה מעץ (כמו בסרטון)
 const xs=[];for(let k=0;k<15;k++)xs.push(253.5+32*k);arcade(gE,xs,ZC,9,-3,M.stone,7);   // 14 קשתות (בעמקים – כמה קומות) כמו בסרטון
 {const g=terrH(714,ZC)-3;box(gE,714.5,g,ZC,19,-3-g,9,M.stone)}}

/* גן הפרחים ('עבודת הגן', ליד שער קיפונוס) כמו בסרטון + שבילי עפר מתפתלים על הר הזיתים */
{const mkT=(a,b,c)=>cv(128,64,(g,w,h)=>{g.fillStyle='#4f6b2a';g.fillRect(0,0,w,h);for(let i=0;i<300;i++){const q=rand();g.fillStyle=q<.5?a:q<.8?b:c;g.beginPath();g.arc(rand()*w,rand()*h,1.5+rand()*2.2,0,6.283);g.fill()}}),
 tx=[mkT('#c8321e','#e0562a','#e8c030'),mkT('#e8802a','#f0a838','#c8321e'),mkT('#e8c030','#f2dc58','#e8802a')];tx.forEach(t=>t.repeat.set(10,1));
 rep(7,k=>{const cz=-192+k*9,L=80,cx=-430,g=new T.PlaneGeometry(L,5,28,1);g.rotateX(-Math.PI/2);const p=g.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,terrH(cx+p.getX(i),cz+p.getZ(i))+.5);g.computeVertexNormals();
  const m=new T.Mesh(g,new T.MeshStandardMaterial({map:tx[k%3],roughness:1}));m.position.set(cx,0,cz);m.receiveShadow=true;gHer.add(m)});
 lbl('עבודת הגן – ערוגות פרחים',-430,12,-160,'pHer',700,0);
 const ribbon=(pts,w,col)=>{const cu=new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(p[0],0,p[1]))),N=Math.ceil(cu.getLength()/7),pos=[],idx=[];
  for(let i=0;i<=N;i++){const t=i/N,c=cu.getPoint(t),tg=cu.getTangent(t),ln=Math.hypot(tg.x,tg.z)||1,nx=-tg.z/ln,nz=tg.x/ln;
   [-1,1].forEach(sg=>{const x=c.x+sg*nx*w/2,z=c.z+sg*nz*w/2;pos.push(x,terrH(x,z)+1.1,z)});if(i<N){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
  const m=new T.Mesh(g,new T.MeshStandardMaterial({color:col,roughness:1,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));m.receiveShadow=true;gE.add(m)};
 ribbon([[800,-57],[880,-20],[960,-125],[1070,-75],[1170,-175],[1280,-120]],5,0xcdb88a);ribbon([[560,-255],[650,-190],[735,-245],[850,-335],[975,-300]],4,0xcdb88a);ribbon([[480,150],[560,235],[655,205],[765,320],[890,295]],4,0xcdb88a)}

ZN.push({r:[250,722,ZC-5.5,ZC+5.5],y:0},{r:[722,800,ZC-5.5,ZC+5.5],ax:'x',a:722,ya:0,b:800,yb:terrH(800,ZC)},{r:[-430,-250,-113,-87],y:0});   // גשר פרה, גשר וילסון
gE.updateMatrixWorld(true);gE.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh&&o.geometry&&o.geometry.type=='BoxGeometry'&&!o.userData.ns){const b=new T.Box3().setFromObject(o);if(b.max.y-b.min.y>=4&&b.max.y>-200){let pg=o.parent;while(pg&&!(pg.userData&&pg.userData.min!==undefined))pg=pg.parent;COL.push([b.min.x,b.max.x,b.min.z,b.max.z,b.min.y,b.max.y,pg])}}});
/* ===== חיי העיר: בתי כנסת, אולמות אכילה, מקוואות, שוק בהמות, מפעלי מנחות, בארות =====
   כל המבנים משוערים בהיקף ובמיקום (פרט למה שבמקורות). מקורות שנבדקו ב-Sefaria: ירושלמי מגילה ג:א (ארבע מאות ושמונים בתי כנסיות בירושלים, ר׳ פינחס בשם ר׳ הושעיה);
   בבלי כתובות קה ע״א (שלוש מאות ותשעים וארבעה בתי דינין, כנגדן בתי כנסיות, מדרשות וספרים); משנה פסחים ז:א–ב (שפוד ותנור), ז:יג (חבורות בבית אחד), י:א (הסבה);
   זבחים ה:ו (קדשים קלים נאכלים בכל העיר, ליום ולילה עד חצות); שקלים ה:א (פתחיה על הקינין; נחוניא חופר שיחין), ז:ב (סוחרי בהמה); כריתות א:ז (קנים בירושלים בדינרי זהב);
   יומא ג:יא (בית גרמו – לחם הפנים; בית אבטינס – הקטורת); מנחות ח:א–ו (סלת, שמן, יין), י:ד (רחיים), יא:א (אפיית לחם הפנים); מקוואות א:א, ו:ח; סוכה ד:ט (נסוך המים מן השילוח);
   אבות ה:ה (לא אמר אדם צר לי המקום שאלין בירושלים); נחמיה ג:א (שער הצאן), ג:טו (ברכת השלח); מלכים ב כ:כ (הברכה והתעלה); ירושלמי פאה א:ה וספרי דברים ק״ה (חנויות בני חנן).
   מהזיכרון, לא נבדקו ב-Sefaria: כתובת תאודוטוס (CIJ 1404, חפירת וייל 1913), מעשי השליחים ו:ט, יוחנן ה:ב, יוספוס קדמוניות יח:ג:ב. */
{
let _q=7;const R=()=>(_q=_q*16807%2147483647)/2147483647;
const gSyn=mkP('pLfSyn',4),gHall=mkP('pLfHall',4),gMik=mkP('pLfMik',3),gMkt=mkP('pLfMkt',4),gMin=mkP('pLfMin',4),gWel=mkP('pLfWel',0),gAq=mkP('pLfAq',4);
const mC=new T.MeshStandardMaterial({color:0xd0c8b8,roughness:.93}),mF=new T.MeshBasicMaterial({color:0xffa23a}),
 gB=new T.BoxGeometry(1,1,1),gCy=new T.CylinderGeometry(.5,.5,1,12),gSp=new T.SphereGeometry(.5,9,6);
const CC=(h,v=.1)=>(h&&h.isColor)?h:new T.Color(h).multiplyScalar(1-v/2+R()*v);
const o3=new T.Object3D();o3.rotation.order='YXZ';
function flush(g,L,geo,mat,col,sh=true){if(!L.length)return null;const im=new T.InstancedMesh(geo,mat,L.length);
 L.forEach((q,i)=>{o3.position.set(q.x,q.y,q.z);o3.rotation.set(q.rx||0,q.ry||0,q.rz||0);o3.scale.set(q.sx,q.sy,q.sz);o3.updateMatrix();im.setMatrixAt(i,o3.matrix);if(col)im.setColorAt(i,q.c)});
 im.castShadow=sh;im.receiveShadow=true;g.add(im);return im}
function Bt(g){const B={g,b:[],c:[],s:[],w:[],wc:[],f:[],r:[]};            // מקבץ מופעים: קופסאות, גלילים, כדורים, מים, אש, גגות (הגגות ניתנים להסתרה)
 B.box=(x,y0,z,w,h,d,c,ry=0,rx=0,rz=0)=>{if(w>0&&h>0&&d>0)B.b.push({x,y:y0+h/2,z,sx:w,sy:h,sz:d,ry,rx,rz,c:CC(c)})};
 B.cyl=(x,y0,z,r,h,c)=>B.c.push({x,y:y0+h/2,z,sx:2*r,sy:h,sz:2*r,c:CC(c)});
 B.cylR=(x,yc,z,r,len,c,rx=0,ry=0,rz=0)=>B.c.push({x,y:yc,z,sx:2*r,sy:len,sz:2*r,rx,ry,rz,c:CC(c)});
 B.cylH=(x,yc,z,r,len,c,ax='x',ry=0)=>B.cylR(x,yc,z,r,len,c,ax=='z'?Math.PI/2:0,ry,ax=='x'?Math.PI/2:0);
 B.sph=(x,yc,z,sx,sy,sz,c,ry=0)=>B.s.push({x,y:yc,z,sx,sy,sz,ry,c:CC(c)});
 B.wat=(x,y0,z,w,h,d,ry=0)=>B.w.push({x,y:y0+h/2,z,sx:w,sy:h,sz:d,ry});
 B.watc=(x,y0,z,r,h)=>B.wc.push({x,y:y0+h/2,z,sx:2*r,sy:h,sz:2*r});
 B.fire=(x,y0,z,w,h,d)=>B.f.push({x,y:y0+h/2,z,sx:w,sy:h,sz:d});
 B.roof=(x,y0,z,w,h,d,c)=>B.r.push({x,y:y0+h/2,z,sx:w,sy:h,sz:d,c:CC(c)});
 B.done=()=>{flush(g,B.b,gB,mC,1);flush(g,B.c,gCy,mC,1);flush(g,B.s,gSp,mC,1);flush(g,B.w,gB,M.water,0,false);flush(g,B.wc,gCy,M.water,0,false);flush(g,B.f,gB,mF,0,false);const rm=flush(g,B.r,gB,mC,1);if(rm)ROOFS.push(rm)};
 return B}
const col=(x0,x1,z0,z1,y0,y1,g)=>COL.push([x0,x1,z0,z1,y0,y1,g]);
const site=(cx,cz,w,d)=>{let mn=1e9,mx=-1e9;for(let i=0;i<=4;i++)for(let j=0;j<=4;j++){const h=terrH(cx-w/2+w*i/4,cz-d/2+d*j/4);if(h<mn)mn=h;if(h>mx)mx=h}return{mn,mx}};
const U4={n:[0,-1],s:[0,1],e:[1,0],w:[-1,0]},FACE={n:Math.PI,s:0,e:Math.PI/2,w:-Math.PI/2},isH=s=>s=='n'||s=='s',sideOf=v=>v[1]<0?'n':v[1]>0?'s':v[0]>0?'e':'w';
const WOOD=0x6b4a2b,STONE=0xa89878,CLOTH=[0xb3262e,0x2b5aa8,0xe8c030,0xf1ead2,0x6a2a86,0x4f7a3a],TUN=[0xd8cfae,0x8a4b2a,0x6b7a3c,0xb3262e,0x2b5aa8,0xcdb88a,0x9a6a30];
const lab=(t,x,z,dy,g,r,big)=>lbl(t,x,terrH(x,z)+dy,z,g,r||700,big||0);

/* בניין מלבני: יסוד (פלינתוס), קירות עם פתח, גג ניתן להסתרה, רצפה פנימית (ZN) ורמפה/מדרגות בפתח. הדלת בצד העליון של השיפוע כשאפשר */
function bld(B,o){
 const g=B.g,x=o.x,z=o.z,w=o.w,d=o.d,wh=o.wh||8,t=o.t||1.6,dr=o.door||'s',dw=o.dw||7,dh=o.dh||6,wc=o.col||0xdccaa0;
 const si=site(x,z,w,d),mn=si.mn,Y=si.mx+.5,x0=x-w/2,x1=x+w/2,z0=z-d/2,z1=z+d/2;
 B.box(x,mn-3,z,w+1.2,Y-.12-(mn-3),d+1.2,0x9c9078);col(x0-.6,x1+.6,z0-.6,z1+.6,mn-3,Y,g);
 B.box(x,Y-.12,z,w-2*t,.12,d-2*t,o.ft||0xcdbf9d);
 const fx={n:z0+t/2,s:z1-t/2,w:x0+t/2,e:x1-t/2};
 ['n','s','w','e'].forEach(s=>{const h=isH(s),L=h?w:d-2*t,c0=h?x:z,f=fx[s];
  const put=(c,len,y0,hh,cl)=>{if(len<.05||hh<.05)return;if(h)B.box(c,y0,f,len,hh,t,wc);else B.box(f,y0,c,t,hh,len,wc);
   if(cl){if(h)col(c-len/2,c+len/2,f-t/2,f+t/2,y0,y0+hh,g);else col(f-t/2,f+t/2,c-len/2,c+len/2,y0,y0+hh,g)}};
  if(dr==s){const a=(L-dw)/2;put(c0-dw/2-a/2,a,Y,wh,1);put(c0+dw/2+a/2,a,Y,wh,1);put(c0,dw,Y+dh,wh-dh,0)}else put(c0,L,Y,wh,1);
  if(o.win&&dr!=s&&wh>=7){const n=Math.max(1,Math.round(L/10)),face={n:z0,s:z1,w:x0,e:x1}[s],wy=Y+wh*.45;
   for(let k=0;k<n;k++){const c=c0-L/2+L*(k+.5)/n;if(h)B.box(c,wy,face,1.5,2.6,.4,0x2a2118);else B.box(face,wy,c,.4,2.6,1.5,0x2a2118)}}});
 if(o.roof!==0)B.roof(x,Y+wh,z,w+.8,1,d+.8,o.rc||0xcdb88a);
 const U=U4[dr],hl=isH(dr)?d/2:w/2;
 ZN.push({r:[x0+t,x1-t,z0+t,z1-t],y:Y});
 const Rr=(fa,fb,lat)=>{const p=[x+U[0]*fa,z+U[1]*fa],q=[x+U[0]*fb,z+U[1]*fb];return[Math.min(p[0],q[0])-(U[0]?0:lat),Math.max(p[0],q[0])+(U[0]?0:lat),Math.min(p[1],q[1])-(U[1]?0:lat),Math.max(p[1],q[1])+(U[1]?0:lat)]};
 const tf=terrH(x+U[0]*(hl+9),z+U[1]*(hl+9)),RL=Math.max(6,Math.min(30,Math.abs(Y-tf)*1.7+3)),far=hl+.6+RL,ya=terrH(x+U[0]*far,z+U[1]*far);
 ZN.push({r:Rr(hl-t,hl+.6,dw/2),y:Y});
 ZN.push({r:Rr(hl+.6,far,dw/2+1),ax:U[0]?'x':'z',a:U[0]?x+U[0]*far:z+U[1]*far,ya,b:U[0]?x+U[0]*(hl+.6):z+U[1]*(hl+.6),yb:Y});
 const N=5;for(let k=0;k<N;k++){const f=hl+.6+RL*(k+.5)/N,top=Y+(ya-Y)*((k+.5)/N),cx=x+U[0]*f,cz=z+U[1]*f,ln=RL/N+.1,lo=Math.min(top,ya,Y)-3;   // מדרגות פתח (חזותי)
  B.box(cx,lo,cz,U[0]?ln:dw+1.6,top-lo,U[0]?dw+1.6:ln,STONE)}
 return{Y,x0,x1,z0,z1,t,wh,U,V:[-U[1],U[0]],hl,x,z,dr,dw,dh,w,d,mn}}
const LP=(b,f,l)=>[b.x+b.U[0]*f+b.V[0]*l,b.z+b.U[1]*f+b.V[1]*l];
/* בלוק סגור קטן (לשכה/חדר) עם דלת צבועה */
function blk(B,x,z,w,d,h,c,dd){const{mn,mx}=site(x,z,w,d),Y=mx+.3;B.box(x,mn-3,z,w+.6,Y-(mn-3),d+.6,0x9c9078);B.box(x,Y,z,w,h,d,c);col(x-w/2-.3,x+w/2+.3,z-d/2-.3,z+d/2+.3,mn-3,Y+h,B.g);B.roof(x,Y+h,z,w+.6,.8,d+.6,0xcdb88a);
 if(dd)B.box(x+dd[0]*(w/2),Y,z+dd[1]*(d/2),dd[0]?.3:2,3.4,dd[1]?.3:2,0x2a2118);return Y}
/* שלט/כתובת (קנבס פשוט, בלי ניקוד) */
const TB={};
function placeBoard(g,key,lines,x,y,z,ry,w,h,fs){if(!TB[key])TB[key]=new T.MeshBasicMaterial({map:cv(640,Math.round(640*h/w),(c,W,H)=>{c.fillStyle='#e8dcc0';c.fillRect(0,0,W,H);c.strokeStyle='#6b4a2b';c.lineWidth=12;c.strokeRect(6,6,W-12,H-12);
  c.fillStyle='#3b2a14';c.direction='rtl';c.textAlign='center';c.font='bold '+(fs||40)+'px serif';lines.forEach((s,i)=>c.fillText(s,W/2,H/(lines.length+1)*(i+1)+(fs||40)*.3))})});
 const m=new T.Mesh(new T.PlaneGeometry(w,h),TB[key]);m.position.set(x,y,z);m.rotation.y=ry;g.add(m);return m}
/* אדם, כבשה, שור, באר, מקווה, תנור, כלוב יונים */
function person(B,x,z,Y,c){B.cyl(x,Y,z,.5,2.3,c||TUN[(R()*TUN.length)|0]);B.sph(x,Y+2.85,z,1,1.1,1,0xc99a6c)}
function quad(B,x,z,Y,ry,L,legH,bh,bw,co,hc){const c=Math.cos(ry),s=Math.sin(ry),W=(lx,lz)=>[x+c*lx+s*lz,z-s*lx+c*lz],yc=Y+legH+bh*.45;
 B.sph(x,yc,z,L,bh,bw,co,ry);const h=W(L*.58,0);B.sph(h[0],yc+bh*.22,h[1],L*.36,L*.32,L*.3,hc||0x4a3a2a,ry);
 [[-.3,-.3],[-.3,.3],[.3,-.3],[.3,.3]].forEach(a=>{const p=W(a[0]*L,a[1]*bw);B.box(p[0],Y,p[1],L*.12,legH+bh*.2,L*.12,hc||0x4a3a2a,ry)})}
const sheep=(B,x,z,Y,ry,dk)=>quad(B,x,z,Y,ry,2.3,1,1.4,1.4,dk?0x7a6448:0xf0ead6),ox=(B,x,z,Y,ry)=>quad(B,x,z,Y,ry,4,1.7,2.3,1.9,0x6b4a2b,0x3a2a1a),donkey=(B,x,z,Y,ry)=>quad(B,x,z,Y,ry,3.8,1.9,1.9,1.4,0x8a8478,0x6a645a);
const cage=(B,x,y0,z)=>{B.box(x,y0,z,1.5,1.2,1.2,0xb08a4c);B.sph(x-.3,y0+1.45,z,.7,.55,.55,0xf4f1e8);B.sph(x+.3,y0+1.45,z,.7,.55,.55,0xece6d8)};
function well(B,x,z){const Y=terrH(x,z)+.1;                                   // באר חצר: טבעת אבן, גלגלת וחבל, דלי, שוקת
 for(let k=0;k<8;k++){const a=k*Math.PI/4;B.box(x+Math.cos(a)*2.1,Y-.4,z+Math.sin(a)*2.1,1.75,2.3,.8,0xb9ab8c,-(a+Math.PI/2))}
 B.watc(x,Y+.7,z,1.7,.2);B.box(x-2.9,Y,z,.5,5.6,.5,WOOD);B.box(x+2.9,Y,z,.5,5.6,.5,WOOD);B.box(x,Y+5.4,z,6.3,.5,.5,WOOD);
 B.cylH(x,Y+4.9,z,.85,.4,0x4d3520,'x');B.cyl(x+.1,Y+2.1,z,.1,2.8,0xb59a62);B.cyl(x+.1,Y+1.5,z,.45,.7,WOOD);
 B.box(x+4.8,Y,z+3,3.8,.9,1.4,STONE);B.wat(x+4.8,Y+.8,z+3,3,.12,.8);col(x-2.4,x+2.4,z-2.4,z+2.4,Y-.4,Y+1.9,B.g)}
function mik(B,x,z){const w=9,d=12,{mn,mx}=site(x,z,w,d),Y=mx+.2,rm=0xb9ab8c;                  // מקווה: בור טבילה מוקף אבן, שתי מעלות כפולות ומחיצה
 B.box(x,mn-2,z,w,Y+1.1-(mn-2),d,STONE);B.box(x,Y+1.1,z-d/2+.55,w,1.2,1.1,rm);B.box(x,Y+1.1,z+d/2-.55,w,1.2,1.1,rm);B.box(x-w/2+.55,Y+1.1,z,1.1,1.2,d-2.2,rm);B.box(x+w/2-.55,Y+1.1,z,1.1,1.2,d-2.2,rm);
 B.wat(x,Y+1.1,z,w-2.2,.2,d-2.2);const iw=(w-2.2-.6)/2;
 for(let k=0;k<4;k++){const zc=z-d/2+1.65+k*1.05,top=Y+2.15-k*.28;[-1,1].forEach(sd=>B.box(x+sd*(.3+iw/2),Y+1.2,zc,iw,top-(Y+1.2),1.05,0xe2dccb))}
 B.box(x,Y+1.2,z-d/2+3.3,.6,1.2,4.4,rm);col(x-w/2,x+w/2,z-d/2,z+d/2,mn-2,Y+2.3,B.g)}
const oven=(B,x,z,Y)=>{B.cyl(x,Y,z,2.1,2.2,0xb5703c);B.sph(x,Y+2.2,z,4.2,2.6,4.2,0xb5703c);B.cyl(x+.9,Y+3.2,z-.4,.55,3.2,0xa0602e);B.fire(x,Y+.6,z+2.0,1.5,1.1,.5)};
const logs=(B,x,z,Y)=>{[[0,0],[1,0],[2,0],[.5,.6],[1.5,.6],[1,1.2]].forEach(a=>B.cylH(x+a[0]*.8,Y+.35+a[1],z,.38,3.6,0x7a5a36,'z'))};
const sacks=(B,x,z,Y,n)=>{for(let i=0;i<n;i++){const k=i%4,r=(i/4)|0;B.sph(x+k*1.7+(r%2)*.8,Y+.95+r*1.3,z+(R()-.5)*.4,1.5,1.9,1.4,0xe8dfc8)}};
const amph=(B,x,z,Y)=>{B.cyl(x,Y,z,.7,1.9,0xb5703c);B.cyl(x,Y+1.9,z,.3,.5,0xa0602e)};

/* ---------- בתי כנסת (משוער): אולם מלבני, שורות עמודים, ספסלי אבן בהיקף; בחצר באר ומקווה ---------- */
function synagogue(B,o){const b=bld(B,{x:o.x,z:o.z,w:38,d:26,wh:11,door:o.door,dw:8,dh:7,col:0xd8c79e,ft:0xd9ccaa,win:1}),{Y,t,hl}=b,x=o.x,z=o.z,P=(f,l)=>LP(b,f,l);
 for(const dz of[-5.5,5.5]){for(const dx of[-12,-4,4,12]){B.box(x+dx,Y,z+dz,2.4,.7,2.4,0xcfc6b0);B.cyl(x+dx,Y+.7,z+dz,.95,8.6,0xe9e3d3);B.box(x+dx,Y+9.3,z+dz,2.6,.9,2.6,0xcfc6b0)}B.box(x,Y+10.2,z+dz,30,.7,1.4,0xc6b894)}
 ['n','s','w','e'].forEach(s=>{if(s==b.dr)return;const sg={n:1,s:-1,w:1,e:-1}[s];                                // ספסלי אבן מדורגים בהיקף
  if(isH(s)){const zf=s=='n'?b.z0+t:b.z1-t,len=b.w-2*t-4.6;B.box(x,Y,zf+sg*.55,len,.85,1.1,0xb4a07a);B.box(x,Y,zf+sg*1.65,len,.45,1.1,0xc2b08c)}
  else{const xf=s=='w'?b.x0+t:b.x1-t,len=b.d-2*t-6.8;B.box(xf+sg*.55,Y,z,1.1,.85,len,0xb4a07a);B.box(xf+sg*1.65,Y,z,1.1,.45,len,0xc2b08c)}});
 B.box(x,Y,z,b.w-2*t-9,.05,b.d-2*t-9,0xf0e6cb);
 if(o.id=='theo'){const p=P(hl+.08,0);placeBoard(B.g,'theo',['תאודוטוס בן ורינוס, כהן וראש כנסת,','בנה את בית הכנסת לקריאת תורה','וללימוד מצוות'],p[0],Y+9,p[1],FACE[b.dr],7.8,3.4,30)}   // כתובת תאודוטוס (משוער)
 const rooms=o.id=='theo'?3:1;for(let k=0;k<rooms;k++){const p=P(hl+8+k*11.5,23),sx=b.U[0]?9.5:8,sz=b.U[0]?8:9.5;blk(B,p[0],p[1],sx,sz,6,0xdccaa0,[-b.V[0],-b.V[1]])}   // חדרי אורחים (בכתובת: בית האורחים והחדרים)
 const w1=P(hl+12,-15);well(B,w1[0],w1[1]);const m1=P(hl+24,-32);mik(B,m1[0],m1[1]);                              // באר ומקווה סמוכים
 [[hl+16,2],[hl+6,-6],[0,0]].forEach(a=>{const p=P(a[0],a[1]);person(B,p[0],p[1],a[0]==0?Y:terrH(p[0],p[1]))})}

/* ---------- אולמות חבורה: שולחנות וספסלי הסבה, תנור ושפודים בחצר, לשכות עם הוראות ---------- */
function hall(B,o){const b=bld(B,{x:o.x,z:o.z,w:34,d:22,wh:8,door:o.door,dw:7,dh:5.6,col:0xe0d0a8,ft:0xcdbf9d,win:1}),{Y,t,hl}=b,x=o.x,z=o.z,P=(f,l)=>LP(b,f,l),cush=[0x9a3a2a,0x2b5aa8,0xc99a3c,0x6a2a86];let ci=0;
 [-4.8,4.8].forEach(dz=>{const len=b.w-2*t-8;B.box(x,Y,z+dz,len,1.4,2.2,WOOD);[-1,1].forEach(sg=>B.box(x,Y,z+dz+sg*2.6,len,.85,2.1,cush[ci++%4]));
  for(let k=0;k<8;k++){const px=x-len/2+1.4+k*(len-2.8)/7;B.cyl(px,Y+1.4,z+dz+(k%2?.45:-.45),.55,.1,0xe9e2cc);if(k%3==1)B.cyl(px+.9,Y+1.4,z+dz,.22,.45,0xb5703c)}
  B.sph(x,Y+1.85,z+dz,3.4,.9,.9,0x8a4b2a)});
 [[1,['קדשים קלים נאכלים בכל העיר','זבחים ה:ו'],'h1'],[-1,['הפסח נאכל בחבורה','פסחים ז:יג'],'h2']].forEach(a=>{const p=P(hl+.08,a[0]*(b.dw/2+3.6));placeBoard(B.g,a[2],a[1],p[0],Y+4,p[1],FACE[b.dr],4.6,2.5,36)});
 let p=P(-(hl+9),-9);oven(B,p[0],p[1],terrH(p[0],p[1])+.1);p=P(-(hl+9),-16);logs(B,p[0],p[1],terrH(p[0],p[1])+.1);
 p=P(-(hl+14),7);const ry=terrH(p[0],p[1])+.1;[-3.2,3.2].forEach(s=>B.box(p[0]+s*(b.U[0]?0:1),ry,p[1]+s*(b.U[0]?1:0),.4,3,.4,WOOD));B.cylH(p[0],ry+2.8,p[1],.12,6.8,WOOD,b.U[0]?'z':'x');
 [-1.2,1.2].forEach(s=>B.sph(p[0]+b.V[0]*s,ry+2.3,p[1]+b.V[1]*s,b.V[0]?1.8:.9,.8,b.V[0]?.9:1.8,0x8a4b2a));
 p=P(-(hl+20),-14);well(B,p[0],p[1]);
 [-1,1].forEach(sg=>{const lat=(isH(b.dr)?b.w:b.d)/2+6,c=P(0,sg*lat),Yc=blk(B,c[0],c[1],9,9,6,0xe0d0a8,b.U),bp=[c[0]+b.U[0]*4.65,c[1]+b.U[1]*4.65];
  placeBoard(B.g,'lsh',['נאכלים ליום ולילה','עד חצות','זבחים ה:ו'],bp[0],Yc+4.4,bp[1],FACE[b.dr],3.8,2.2,34)});                  // לשכות עם הוראות
 [[-(hl+13),-3],[-(hl+4),10],[hl+6,2]].forEach(a=>{const q=P(a[0],a[1]);person(B,q[0],q[1],terrH(q[0],q[1])+.1)})}

/* ---------- בתי כנסת ---------- */
{const B=Bt(gSyn),L={theo:['בית הכנסת של תאודוטוס בן ורינוס (משוער)',1],alex:['בית כנסת האלכסנדרים (משוער)',0],up:['בית כנסת בעיר העליונה (משוער)',0],new:['בית כנסת בעיר החדשה (משוער)',0],sil:['בית כנסת ליד ברכת השילוח (משוער)',0]};
 LF_SYN.forEach(a=>{synagogue(B,{x:a[0],z:a[1],door:a[2],id:a[3]});lab(L[a[3]][0],a[0],a[1],26,'pLfSyn',L[a[3]][1]?1200:800,L[a[3]][1])});B.done()}
/* ---------- אולמות אכילת קדשים והפסח ---------- */
{const B=Bt(gHall);LF_HALL.forEach((a,i)=>{hall(B,{x:a[0],z:a[1],door:a[2]});lab('אולם חבורה – אכילת קדשים והפסח (משוער)',a[0],a[1],22,'pLfHall',i==1||i==4?900:600,i==1||i==4)});B.done()}
/* ---------- מקוואות (בורות טבילה) ליד המעלות הדרומיות, ברכת השילוח ומתחת לבתים ---------- */
{const B=Bt(gMik);LF_MIK.forEach((c,k)=>{for(let i=0;i<c[2];i++)for(let j=0;j<c[3];j++)mik(B,c[0]+(i-(c[2]-1)/2)*13,c[1]+(j-(c[3]-1)/2)*16);
  lab(k==2?'מקוואות ליד ברכת השילוח (משוער)':'מקוואות ליד המעלות הדרומיות (משוער)',c[0],c[1],16,'pLfMik',900,k<2)});B.done()}
/* ---------- בארות ציבוריות ומנהרת חזקיהו (תת־קרקעית; הקו משוער) ---------- */
{const B=Bt(gWel);LF_WELL.forEach((a,i)=>{well(B,a[0],a[1]);person(B,a[0]-5,a[1]+3,terrH(a[0]-5,a[1]+3));lab('באר (משוער)',a[0],a[1],14,'pLfWel',350)});
 const T0=LF_TUN[0],T1=LF_TUN[1];
 lab('מנהרת חזקיהו – תת־קרקעית (הקו משוער)',(T0[0]+T1[0])/2,(T0[1]+T1[1])/2,14,'pLfWel',900,0);B.done()}

/* ---------- שוק הבהמות והעופות לקרבן: לצד ברכות בית חסדא, ליד שער הצאן (נחמיה ג:א; יוחנן ה:ב – משוער); חנויות בני חנן (ירושלמי פאה א:ה – מקום משוער) ---------- */
{const B=Bt(gMkt);
 function stall(x,z,i){const w=12,d=7,{mn,mx}=site(x,z,w,d),Y=mx+.15,cl=CLOTH[i%CLOTH.length];                      // דוכן: עמודים, גגון בד, דלפק, כלובי יונים / כבשים
  B.box(x,mn-2,z,w+.4,Y-(mn-2),d+.4,0x9c9078);[[-5.6,-2.8,5.6],[5.6,-2.8,5.6],[-5.6,2.6,4.4],[5.6,2.6,4.4]].forEach(a=>B.box(x+a[0],Y,z+a[1],.4,a[2],.4,WOOD));
  B.box(x,Y+4.55,z-.1,12.4,.22,6.8,cl,0,.17);B.box(x,Y,z-3.1,11,3.6,.35,WOOD);B.box(x,Y+.1,z+1.3,10.6,1.5,1.6,WOOD);col(x-5.3,x+5.3,z+.5,z+2.1,Y,Y+1.6,B.g);
  if(i%3==2){sheep(B,x-3,z+4.4,Y,.4);sheep(B,x+2.5,z+4.6,Y,-.3,1);for(let k=0;k<2;k++)cage(B,x-2+k*3.4,Y+1.6,z+1.3)}else for(let k=0;k<4;k++)cage(B,x-4+k*2.7,Y+1.6,z+1.3);
  if(i%3==1){B.box(x+3.6,Y+1.6,z+1.3,1.2,.7,1.2,0xb08a4c);B.sph(x+3.6,Y+2.6,z+1.3,.8,.8,.8,0xf4f1e8)}
  person(B,x-2.2+(i%3)*2.2,z-.4,Y);if(i%2==0)person(B,x+(i%4)-1.5,z+3.9,Y)}
 function pen(cx,cz,kind){const w=26,d=14,{mn,mx}=site(cx,cz,w,d),Y=mx+.12;B.box(cx,mn-1.5,cz,w,Y-(mn-1.5),d,0xb89c6a);                    // מכלאה: גדר, שוקת, בהמות
  [.8,1.7].forEach(h=>{B.box(cx,Y+h,cz-d/2,w,.22,.22,WOOD);B.box(cx,Y+h,cz+d/2,w,.22,.22,WOOD);B.box(cx-w/2,Y+h,cz,.22,.22,d,WOOD);B.box(cx+w/2,Y+h,cz,.22,.22,d,WOOD)});
  for(let k=0;k<=5;k++){B.box(cx-w/2+k*w/5,Y,cz-d/2,.4,2,.4,WOOD);B.box(cx-w/2+k*w/5,Y,cz+d/2,.4,2,.4,WOOD)}[1,2].forEach(j=>{B.box(cx-w/2,Y,cz-d/2+j*d/3,.4,2,.4,WOOD);B.box(cx+w/2,Y,cz-d/2+j*d/3,.4,2,.4,WOOD)});
  B.box(cx+w/2-3.6,Y,cz+d/2-1.7,4,.8,1.2,STONE);B.wat(cx+w/2-3.6,Y+.7,cz+d/2-1.7,3.2,.12,.8);col(cx-w/2-.2,cx+w/2+.2,cz-d/2-.2,cz+d/2+.2,mn-1.5,Y+2,B.g);
  if(kind=='ox')for(let k=0;k<4;k++)ox(B,cx-8+(k%2)*10+(R()-.5)*2,cz-3+((k/2)|0)*6,Y,R()*6.28);
  else for(let k=0;k<12;k++)sheep(B,cx-w/2+3+(k%6)*4.2+(R()-.5)*1.2,cz-3.2+((k/6)|0)*6.4+(R()-.5),Y,R()*6.28,R()<.2)}
 for(let i=0;i<6;i++)pen(56+30*i,-420,i==3?'ox':'sheep');
 for(let i=0;i<10;i++)stall(54+i*19,-399,i);
 [-428,-392].forEach(z=>{const{mn,mx}=site(36,z,4,4),Y=mx+.1;B.box(36,mn-2,z,4.4,Y-(mn-2)+9.6,4.4,0xcdb88a);B.box(36,Y+9.6,z,5.4,1,5.4,0xdccaa0);col(34,38,z-2.2,z+2.2,mn-2,Y+10.6,B.g)});   // שער הצאן: שני עמודים וקורה
 {const Y=site(36,-410,4,36).mx+.1;B.box(36,Y+10.6,-410,4.4,1.6,38,0xcdb88a)}
 for(let k=0;k<7;k++){const x=70+k*22+(R()-.5)*6,z=-408.5+(R()-.5)*2,Y=terrH(x,z)+.1;person(B,x,z,Y);sheep(B,x+2.2,z+.5,Y,R()*6.28)}   // עולי רגל עם כבשים במעבר
 for(let i=0;i<6;i++)stall(LF_HANAN[0]-47.5+i*19,LF_HANAN[1],i+1);                                                                              // חנויות בני חנן (משוער)
 lab('שוק הבהמות והעופות לקרבן (משוער)',130,-410,34,'pLfMkt',1500,1);lab('שער הצאן (משוער)',36,-410,22,'pLfMkt',700,0);lab('חנויות בני חנן (משוער)',LF_HANAN[0],LF_HANAN[1],18,'pLfMkt',900,0);B.done()}

/* ---------- מפעלי מנחות: בית גרמו (לחם הפנים), בית אבטינס (הקטורת), מטחנות, מחסן; בית הבד והגת (יין ושמן) ---------- */
{const B=Bt(gMin),M1=LF_M1,PI=Math.PI;
 const millSt=(x,z,Y,a)=>{B.cyl(x,Y,z,3.5,.8,0x8a7e6a);B.cyl(x,Y+.8,z,2.9,1.5,0xb9ab8c);B.cyl(x,Y+.8,z,.4,4.4,WOOD);B.box(x,Y+3.4,z,10.5,.45,.45,WOOD,-a);
  donkey(B,x+Math.cos(a)*5.6,z+Math.sin(a)*5.6,Y,-a+PI/2)};
 const bake=(o)=>{const b=bld(B,Object.assign({wh:9,dw:8,dh:6,col:0xe0d0a8,win:1},o)),{Y,t,z0,wh}=b,x=o.x,z=o.z;                                    // מאפייה: תנורים וארובות, שולחנות כיכרות, שקי קמח
  [-9,9].forEach(dx=>{const ox2=x+dx,oz=z0+t+3.4;B.cyl(ox2,Y,oz,2.7,2.8,0xb5703c);B.sph(ox2,Y+2.8,oz,5.4,3,5.4,0xb5703c);B.cyl(ox2,Y+4,oz,.65,wh+3.2-4,0xa0602e);B.fire(ox2,Y+.7,oz+2.7,1.6,1.2,.5)});
  [-7,7].forEach(dx=>{B.box(x+dx,Y,z+2.2,9,1.3,2.6,WOOD);for(let k=0;k<8;k++)B.sph(x+dx-3.5+k*1,Y+1.55,z+2.2+(k%2?.6:-.6),1,.5,.7,0xc69a5a)});
  sacks(B,b.x0+t+2,z+6,Y,8);logs(B,x+11,z0+t+2,Y);person(B,x,z-1,Y);person(B,x+5,z+5,Y);return b};
 const mill=(o,n)=>{const b=bld(B,Object.assign({wh:8,dw:8,dh:6,col:0xdccaa0,win:1},o)),{Y,t}=b,x=o.x,z=o.z;
  for(let k=0;k<n;k++)millSt(x-1.5,z-(n-1)*6.5+k*13,Y,.6+k*2.1);sacks(B,b.x0+t+1.5,z+(n>1?0:-8),Y,8);person(B,x+4,z+8,Y);return b};
 /* בית גרמו – אפיית לחם הפנים (יומא ג:יא; מנחות יא:א) */
 bake({x:M1[0],z:M1[1]-45,w:36,d:22,door:'s'});lab('בית גרמו – אפיית לחם הפנים (משוער)',M1[0],M1[1]-45,26,'pLfMin',1200,1);
 /* מטחנת קמח (מנחות י:ד – רחיים) */
 mill({x:M1[0]-48,z:M1[1],w:22,d:30,door:'e'},2);lab('בית רחיים – קמח וסלת למנחות (משוער)',M1[0]-48,M1[1],22,'pLfMin',800,0);
 /* בית אבטינס – הקטורת (יומא ג:יא): מכתשות ומזרקות */
 {const b=bld(B,{x:M1[0]+48,z:M1[1],w:22,d:30,wh:8,door:'w',dw:8,dh:6,col:0xdccaa0,win:1}),{Y,t}=b,x=M1[0]+48,z=M1[1];
  for(let k=0;k<6;k++){const mx2=x+(k%2?4:-4),mz=z-10+((k/2)|0)*7;B.cyl(mx2,Y,mz,1.3,1.4,0xb9ab8c);B.cylR(mx2+.7,Y+2.2,mz,.28,3.2,WOOD,0,0,.25)}
  B.box(x,Y,z+11,16,1.3,2.4,WOOD);for(let k=0;k<7;k++)B.cyl(x-6.5+k*2.2,Y+1.3,z+11,.5,.9,0xb5703c);person(B,x+7,z-3,Y);person(B,x-8,z+4,Y);
  lab('בית אבטינס – הקטורת (משוער)',x,z,22,'pLfMin',800,0)}
 /* מחסן: חביות, כדים ושקים */
 {const b=bld(B,{x:M1[0],z:M1[1]+45,w:36,d:22,wh:8,door:'n',dw:8,dh:6,col:0xdccaa0,win:1}),{Y,t}=b,x=M1[0],z=M1[1]+45;
  for(let r=0;r<3;r++)for(let k=0;k<13;k++)amph(B,x-14+k*2.3,z-3+r*3.2,Y);sacks(B,x-14,z-8,Y,8);sacks(B,x+8,z+7,Y,8);lab('מחסן – סלת, יין ושמן (משוער)',x,z,20,'pLfMin',700,0)}
 /* חצר: באר, עגלה, שקים ואנשים */
 {const wx=M1[0]+4,wz=M1[1]+3,Y=terrH(wx,wz);well(B,wx,wz);sacks(B,M1[0]-22,M1[1]-12,terrH(M1[0]-22,M1[1]-12),8);
  B.box(M1[0]+16,terrH(M1[0]+16,M1[1]-8)+1,M1[1]-8,6,.7,2.6,WOOD);[-1.5,1.5].forEach(o=>B.cylH(M1[0]+16+o,terrH(M1[0]+16,M1[1]-8)+1.1,M1[1]-9.5,1.1,.35,0x4d3520,'z'));
  [[-14,0],[18,8],[-6,-16],[10,-16]].forEach(a=>person(B,M1[0]+a[0],M1[1]+a[1],terrH(M1[0]+a[0],M1[1]+a[1])))}
 /* מטחנות בשכונות */
 LF_MILL.forEach(a=>{mill({x:a[0],z:a[1],w:22,d:28,door:a[2]},1);lab('בית רחיים (משוער)',a[0],a[1],20,'pLfMin',600,0);const p=a[2]=='e'?[a[0]+30,a[1]+14]:[a[0]+14,a[1]-30];well(B,p[0],p[1])});
 /* בית הבד והגת – יין ושמן למנחות (מנחות ח:ד, ח:ו) */
 {const px=LF_PRESS[0],pz=LF_PRESS[1],{mn,mx}=site(px,pz,44,36),Y=mx+.3;B.box(px,mn-2,pz,44,Y-(mn-2),36,0xb89c6a);col(px-22,px+22,pz-18,pz+18,mn-2,Y,gMin);ZN.push({r:[px-22,px+22,pz-18,pz+18],y:Y});
  B.box(px-10,Y,pz-6,10,1,8,0xd2c6a8);B.box(px-10,Y+1,pz-6,10,.5,.6,0xb9ab8c);B.box(px-3.4,Y,pz-6,4,.7,4,STONE);B.box(px-3.4,Y+.7,pz-6,3.2,.12,3.2,0x7a2030);                      // גת: משטח דריכה ויקב
  B.box(px-10,Y+4.2,pz+6.5,.7,.7,16,WOOD,0,.06);B.box(px-12,Y,pz+13,1,6,1,STONE);B.box(px-8,Y,pz+13,1,6,1,STONE);B.cyl(px-10,Y+1.5,pz-1.5,1.3,1.4,0xa89878);               // קורת הבד ואבן משקל
  B.cyl(px+8,Y,pz-6,3.8,.9,0xb9ab8c);B.cylR(px+9.9,Y+2.8,pz-6,1.9,.9,0xa89878,0,0,PI/2);B.cyl(px+8,Y+.9,pz-6,.3,3.2,WOOD);B.box(px+8.9,Y+2.8,pz-6,2.2,.35,.35,WOOD);                  // בית בד: מרחיים (אבן מתגלגלת)
  for(let k=0;k<4;k++)B.cyl(px+8,Y+k*.4,pz+8,1.7,.35,0x3a2a1a);for(let k=0;k<5;k++)amph(B,px-16+k*2,pz-14,Y);for(let k=0;k<5;k++)amph(B,px+4+k*2,pz+13,Y);
  blk(B,px+13,pz+10,16,12,6.5,0xdccaa0,[-1,0]);[[-6,2],[4,-2],[12,0]].forEach(a=>person(B,px+a[0],pz+a[1]+4,Y));lab('בית הבד והגת – יין ושמן למנחות (משוער)',px,pz,20,'pLfMin',1000,1)}
 B.done()}

/* ---------- אמת המים (על קשתות; משוערת), ברכת חזקיהו (עמיגדלון) ---------- */
{const B=Bt(gAq),P=LF_AQ,s=18,sg=[];let tot=0;for(let i=0;i<P.length-1;i++){const L=Math.hypot(P[i+1][0]-P[i][0],P[i+1][1]-P[i][1]);sg.push({a:P[i],b:P[i+1],L,s0:tot});tot+=L}
 const at=d=>{let q=sg[sg.length-1];for(const e of sg)if(d<=e.s0+e.L){q=e;break}const t=Math.max(0,Math.min(1,(d-q.s0)/q.L));return[q.a[0]+(q.b[0]-q.a[0])*t,q.a[1]+(q.b[1]-q.a[1])*t,-Math.atan2(q.b[1]-q.a[1],q.b[0]-q.a[0])]};
 const sh=new T.Shape();sh.moveTo(0,.55);sh.lineTo(0,1);sh.lineTo(1,1);sh.lineTo(1,.55);sh.absellipse(.5,.55,.5,.36,0,Math.PI,false);
 const archG=new T.ExtrudeGeometry(sh,{depth:1,bevelEnabled:false,curveSegments:14});archG.translate(-.5,0,-.5);const arches=[];
 const nB=Math.floor(tot/s),stone=0xc9b78a;let Lp=null;                                          // גובה התעלה: צמוד לקרקע (5 מעליה), יורד לכל היותר 6% – בעמקים נוצרות קשתות; מעל הרכס – חצובה בסלע
 for(let k=0;k<nB;k++){const d0=k*s,d1=(k+1)*s,p0=at(d0),p1=at(d1),pc=at((d0+d1)/2),ry=pc[2],g0=terrH(p0[0],p0[1]),g1=terrH(p1[0],p1[1]),gc=terrH(pc[0],pc[1]),g=Math.min(g0,g1,gc),lvl=Lp===null?g+5:Math.max(Math.min(Lp,g+5),Lp-.06*s);Lp=lvl;
  if(lvl<g-1.5)continue;                                                                                // כשהקרקע גבוהה – התעלה חצובה/קבורה
  const nx=Math.sin(ry),nz=Math.cos(ry);B.box(pc[0],lvl-2.4,pc[1],s+.3,1.6,4.4,stone,ry);[-1,1].forEach(q=>B.box(pc[0]+nx*q*1.8,lvl-.9,pc[1]+nz*q*1.8,s+.3,1.1,.8,stone,ry));B.wat(pc[0],lvl-.95,pc[1],s+.3,.3,2.8,ry);
  const D=(lvl-2.4)-g;if(D>1){if(D<=7)B.box(pc[0],g-2,pc[1],s-3.4,D+2,3.4,stone,ry);else{const n=Math.ceil(D/22),h=D/n;for(let j=0;j<n;j++)arches.push({x:pc[0],y:g+j*h,z:pc[1],sx:s-3.4,sy:h,sz:3.6,ry,c:CC(stone)})}
   B.box(p1[0],g1-2,p1[1],3.4,(lvl-2.4)-(g1-2),3.8,0xbfae82,ry);if(D>2)col(p1[0]-2.2,p1[0]+2.2,p1[1]-2.2,p1[1]+2.2,g1-2,lvl,gAq)}}
 flush(gAq,arches,archG,mC,1);
 const m=at(tot*.5);lab('אמת המים (משוערת)',m[0],m[1],38,'pLfAq',1400,1);B.done()}
pool(-610,-290,70,50,3,'ברכת חזקיהו – עמיגדלון (משוער)',gAq,'pLfAq');
}
/* מקומות לממשק (src/ui.js, מערך P): [שם, תיאור, מקור, מצלמה, יעד, עמדת הליכה[x,z,yaw], חתך] – מחובר ע"י בעל ui.js */
const JER_PLACES=(()=>{const y=(x,z)=>terrH(x,z),yaw=(a,b)=>Math.round(Math.atan2(b[0]-a[0],-(b[1]-a[1]))*180/Math.PI);
 const mkp=(name,desc,src,t,cd,ch,st)=>{const ty=y(t[0],t[1]);return[name,desc,src,[t[0]+cd[0],ty+ch,t[1]+cd[1]],[t[0],ty+4,t[1]],[st[0],st[1],yaw(st,t)]]};
 return[
 mkp('בתי כנסת בירושלים','כמה בתי כנסת מייצגים: אולם מלבני עם שורות עמודים וספסלי אבן בהיקף, ובחצר באר ומקווה; ביניהם בית הכנסת של תאודוטוס מהכתובת. המקורות נוקבים במספר גדול – כאן חמישה בלבד (משוער).','ירושלמי מגילה ג:א · בבלי כתובות קה ע״א · כתובת תאודוטוס · מעשי השליחים ו:ט',[40,560],[-80,-110],75,[40,500]),
 mkp('אולמות לאכילת קדשים והפסח','בתים עם שולחנות והסבה לחבורות, תנור ושפודים בחצר ולשכות עם הוראות: קדשים קלים נאכלים בכל העיר (משוער).','משנה, זבחים ה:ו · פסחים ז:א–ב, ז:יג, י:א',[-650,240],[140,-50],70,[-600,240]),
 mkp('מקוואות לפני העלייה להר','בורות טבילה עם שתי מעלות לפני המעלות הדרומיות, ליד ברכת השילוח ובבתים; מספרם ומקומם משוערים.','משנה, מקוואות א:א, ו:ח · חפירות עיר דוד והעופל',[-108,360],[60,100],55,[-108,425]),
 mkp('שוק הבהמות והעופות','מכלאות כבשים ובקר, דוכני יונים ותורים ושער הצאן ליד בית חסדא – כל זה משוער; וחנויות בני חנן.','משנה, שקלים ז:ב · כריתות א:ז · נחמיה ג:א · יוחנן ה:ב · ירושלמי פאה א:ה',[130,-410],[0,110],65,[10,-410]),
 mkp('מפעלי מנחות','מאפיית לחם הפנים של בית גרמו, בית אבטינס לקטורת, בית רחיים, מחסן וחצר; ובמזרח בית בד וגת ליין ושמן (משוער).','משנה, יומא ג:יא · מנחות ח:א–ו, י:ד, יא:א',[LF_M1[0],LF_M1[1]],[90,100],80,[LF_M1[0],LF_M1[1]]),
 mkp('בארות, בריכות ואמת המים','בארות חצר עם גלגלת, ברכת חזקיהו, ברכת השילוח, מנהרת חזקיהו (תת־קרקעית) ואמת מים על קשתות אל הר הבית – הכול משוער.','מלכים ב כ:כ · נחמיה ג:טו · סוכה ד:ט · שקלים ה:א · יוספוס, קדמוניות יח:ג:ב',[-610,80],[-150,160],90,[-560,100])];})();
/* ---------- תוויות ירושלים ---------- */
[['ירושלים בימי בית שני (משוער)',-150,300,500,6000,1],['הר הזיתים',1300,140,-40,4500,1],['נחל קדרון',420,-130,500,3000,0],['עיר דוד',140,-120,900,3200,1],['האופל',0,-30,340,1500,0],
 ['הגיא (טירופיון)',-330,-80,200,1800,0],['העיר העליונה',-800,100,500,3600,1,'pUp'],['הר ציון',-700,100,1100,2400,0],['העיר החדשה – בית חדתא',-100,70,-800,3200,1,'pNew'],
 ['חומה ראשונה',-1000,30,1060,2600,0,'pW1'],['חומת עיר דוד',50,30,640,2000,0,'pWN'],['חומה שנייה',-660,30,-420,1800,0,'pW2'],['חומה שלישית (אגריפס)',-300,40,-1500,2800,0,'pW3'],['גיא בן הינום',-1500,-30,300,3500,0],['גשר פרה אדומה',480,10,ZC,2000,0]].forEach(a=>lbl(a[0],a[1],terrH(a[1],a[3])+a[2],a[3],a[6]||'env',a[4],a[5]));
scene.traverse(o=>{if(o.isInstancedMesh)o.frustumCulled=false});
scene.fog.near=1800;scene.fog.far=6200;camera.far=9500;camera.updateProjectionMatrix();
