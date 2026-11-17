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
function scatter(x0,x1,z0,z1,n,w0,w1,h0,h1,ok){const out=[];let t=0;while(out.length<n&&t++<n*14){const x=x0+rand()*(x1-x0),z=z0+rand()*(z1-z0);
  if(EX.some(e=>x>e[0]&&x<e[1]&&z>e[2]&&z<e[3])||near(x,z,PILGRIM,14)||near(x,z,MAINST,12)||(ok&&!ok(x,z)))continue;
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
{const tr=[];rep(380,()=>{const x=520+rand()*900,z=-500+rand()*900,h=terrH(x,z);if(h>-150)tr.push({x,y:h-.5,z,sx:7,sy:5,sz:7,c:new T.Color().setHSL(.22,.3,.3+rand()*.12)})});
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
/* ---------- תוויות ירושלים ---------- */
[['ירושלים בימי בית שני (משוער)',-150,300,500,6000,1],['הר הזיתים',1300,140,-40,4500,1],['נחל קדרון',420,-130,500,3000,0],['עיר דוד',140,-120,900,3200,1],['האופל',0,-30,340,1500,0],
 ['הגיא (טירופיון)',-330,-80,200,1800,0],['העיר העליונה',-800,100,500,3600,1,'pUp'],['הר ציון',-700,100,1100,2400,0],['העיר החדשה – בית חדתא',-100,70,-800,3200,1,'pNew'],
 ['חומה ראשונה',-1000,30,1060,2600,0,'pW1'],['חומת עיר דוד',50,30,640,2000,0,'pWN'],['חומה שנייה',-660,30,-420,1800,0,'pW2'],['חומה שלישית (אגריפס)',-300,40,-1500,2800,0,'pW3'],['גיא בן הינום',-1500,-30,300,3500,0],['גשר פרה אדומה',480,10,ZC,2000,0]].forEach(a=>lbl(a[0],a[1],terrH(a[1],a[3])+a[2],a[3],a[6]||'env',a[4],a[5]));
scene.traverse(o=>{if(o.isInstancedMesh)o.frustumCulled=false});
scene.fog.near=1800;scene.fog.far=6200;camera.far=9500;camera.updateProjectionMatrix();
