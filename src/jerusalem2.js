/* ===== ירושלים החיה (19–20.11.2026): רחובות ושבילים, בתים עם דלתות וחלונות, חומה עם חומות־שן ושערים, שווקים, בעלי מקצוע,
   המולת אנשים ובהמות, מצורעים מחוץ לעיר, בית הדשן וכהנים שמוציאים דשן בפסכתר, בורסקי.
   המקום והמידות הם הערכה (כל התוויות הן "משוער"). מקורות שמאחורי הסצנות (מהזיכרון, לא נבדקו ב-Sefaria – לבדוק לפני פרסום סופי):
   • "עשרה דברים" שתלמיד חכם צריך בעיר: בית דין, צדקה, בית כנסת, מרחץ, ביב, רופא, אומן, לבלר, מלמד תינוקות – בבלי סנהדרין יז ע״ב.
   • בעלי מלאכה (חייט, לבלר, נפח, נגר, צבע, אופה, קדר, אורג, צורף, טבח): משנה שבת א:ב–ג, בבא קמא, כלים – פזורים; לא הוזכרו מקומות מדויקים בירושלים.
   • בורסקי: מרחיקים מן העיר חמישים אמה ורק בצד מזרח – משנה בבא בתרא ב:ט (ומשנה כתובות ז:י: הבורסי).
   • מצורעים: "בדד ישב מחוץ למחנה מושבו", בגדים קרועים, ראש פרוע, "ועל שפם יעטה", קורא "טמא טמא" – ויקרא יג:מה–מו; ערי חומה מקודשות מפני ששולחים מהן מצורעים – משנה כלים א:ז.
   • דשן: "והוציא את הדשן אל מחוץ למחנה אל מקום טהור" – ויקרא ו:ד; שער האשפות – נחמיה ב:יג, ג:יג–יד. פסכתר – כלי לפינוי הדשן (כמו בסיור תמיד של שחר).
   • שערי העיר: שער הצאן, שער הגיא, שער האשפות, שער העין – נחמיה ב–ג. */
const CITY2=(()=>{
 const g=mkP('pCity2',4);
 let _s=24681357;const R=()=>(_s=_s*16807%2147483647)/2147483647,rr=(a,b)=>a+(b-a)*R(),pick=a=>a[R()*a.length|0];
 const col=h=>new T.Color(h),WH=col(0xffffff);
 const o3=new T.Object3D();o3.rotation.order='YXZ';
 const geoB=new T.BoxGeometry(1,1,1),geoC=new T.CylinderGeometry(.5,.5,1,10),geoS=new T.SphereGeometry(.5,9,7),geoK=new T.ConeGeometry(.5,1,10);
 const mWhite=new T.MeshStandardMaterial({color:0xc4c4c4,roughness:.95}),mFire=new T.MeshBasicMaterial({color:0xffa23a});
 const W=(q,lx,lz)=>{const c=Math.cos(q.ry||0),s=Math.sin(q.ry||0);return[q.x+c*lx+s*lz,q.z-s*lx+c*lz]};
 const inEX=(x,z)=>EX.some(e=>x>e[0]&&x<e[1]&&z>e[2]&&z<e[3]);
 /* מקבץ מופעים סטטי: add(x,yMרכז,z,sx,sy,sz,ry,צבע,rx,rz) */
 function Batch(geo,material){const L=[];return{L,add(x,y,z,sx,sy,sz,ry,c,rx,rz){L.push({x,y,z,sx,sy,sz,ry:ry||0,rx:rx||0,rz:rz||0,c:c||WH})},
  done(par){if(!L.length)return null;const im=new T.InstancedMesh(geo,material,L.length);L.forEach((q,i)=>{o3.position.set(q.x,q.y,q.z);o3.rotation.set(q.rx,q.ry,q.rz);o3.scale.set(q.sx,q.sy,q.sz);o3.updateMatrix();im.setMatrixAt(i,o3.matrix);im.setColorAt(i,q.c)});
   im.frustumCulled=false;im.castShadow=false;im.receiveShadow=false;im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;(par||g).add(im);return im}}}
 /* גובה הקרקע כפי שהיא מצוירת (רשת 220×220 על 7000 – אינטרפולציה בין קודקודים), כדי שאנשים, דוכנים ושבילים ייגעו בקרקע ולא יצללו בה */
 const GS=7000/220,G0=-3500,_vh=new Map();
 const vH=(i,k)=>{const key=i*4096+k;let v=_vh.get(key);if(v===undefined){v=terrH(G0+i*GS,G0+k*GS);_vh.set(key,v)}return v};
 const terrM=(x,z)=>{const fx=(x-G0)/GS,fz=(z-G0)/GS,i=Math.floor(fx),k=Math.floor(fz),u=fx-i,v=fz-k;return(vH(i,k)*(1-u)+vH(i+1,k)*u)*(1-v)+(vH(i,k+1)*(1-u)+vH(i+1,k+1)*u)*v};
 const label=(t,x,z,dy,r,big)=>lbl(t,x,terrM(x,z)+dy,z,'pCity2',r||900,big||0);

 /* ================= א. רחובות ושבילים (סרטי קרקע) ================= */
 const pieces=[];   // קטעי רחוב אחרי חיתוך מאתרים תפוסים: {s,pts,len,cum}
 function dense(p,step){const out=[];for(let i=0;i<p.length-1;i++){const a=p[i],b=p[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(L/step));for(let k=0;k<n;k++)out.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n])}out.push(p[p.length-1].slice());return out}
 STREETS.forEach(s=>{const d=dense(s.p,7);let run=[];const flush=()=>{if(run.length>=5){const cum=[0];for(let i=1;i<run.length;i++)cum.push(cum[i-1]+Math.hypot(run[i][0]-run[i-1][0],run[i][1]-run[i-1][1]));pieces.push({s,pts:run,len:cum[cum.length-1],cum})}run=[]};
  d.forEach(q=>{if(inEX(q[0],q[1]))flush();else run.push(q)});flush()});
 function ribbonGeo(pts,w,dy){const pos=[],idx=[];const n=pts.length;for(let i=0;i<n;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)];let dx=b[0]-a[0],dz=b[1]-a[1];const L=Math.hypot(dx,dz)||1;dx/=L;dz/=L;const nx=-dz,nz=dx,x=pts[i][0],z=pts[i][1];
   pos.push(x+nx*w/2,terrM(x+nx*w/2,z+nz*w/2)+dy,z+nz*w/2,x-nx*w/2,terrM(x-nx*w/2,z-nz*w/2)+dy,z-nz*w/2)}
  for(let i=0;i<n-1;i++){const a=i*2;idx.push(a,a+2,a+1,a+1,a+2,a+3)}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();return geo}
 {const mB=new T.MeshStandardMaterial({color:0x5e5038,roughness:1,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),
   mP=new T.MeshStandardMaterial({color:0x80704f,roughness:.98,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}),
   mF=new T.MeshStandardMaterial({color:0x756444,roughness:1,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3});
  pieces.forEach(p=>{if(p.s.n=='ash'&&p.pts[0][1]<1330)return;   // דרך הדשן חופפת לשביל עולי הרגל עד השער – שם לא מציירים פס נוסף
   const w=p.s.w;const a=new T.Mesh(ribbonGeo(p.pts,w+1.8,.9),mB),b=new T.Mesh(ribbonGeo(p.pts,w,1.1),p.s.foot?mF:mP);a.receiveShadow=b.receiveShadow=true;a.frustumCulled=b.frustumCulled=false;g.add(a,b)})}
 const rtAt=(p,s)=>{s=Math.max(0,Math.min(p.len,s));let i=1;while(i<p.pts.length-1&&p.cum[i]<s)i++;const a=p.pts[i-1],b=p.pts[i],L=p.cum[i]-p.cum[i-1]||1,t=(s-p.cum[i-1])/L,dx=(b[0]-a[0])/L,dz=(b[1]-a[1])/L;return{x:a[0]+(b[0]-a[0])*t,z:a[1]+(b[1]-a[1])*t,dx,dz}};

 /* ================= ב. בתים בסגנון עתיק: דלתות, חלונות, משקופים, גג עם כרכוב וחדר גג ================= */
 {const dcol=[0x4a2f1a,0x5b3a22,0x3d4a58,0x6a3a24,0x2f3a2a,0x6b4a2b].map(col),WIN=col(0x1c1510),TRIM=col(0xeee3c6);let nH=0;
  HOUSES.forEach(([grp,items])=>{const door=Batch(geoB,mWhite),win=Batch(geoB,mWhite),trim=Batch(geoB,mWhite),top=Batch(geoB,mWhite);
   for(const q of items){if(q.sx<9||q.sy<7)continue;nH++;
    const ry=q.ry||0,H=q.sy-2,topY=q.y+q.sy,c=(q.c||WH).clone();
    top.add(q.x,topY+.3,q.z,q.sx+.8,.6,q.sz+.8,ry,c.clone().multiplyScalar(1.12));                          // כרכוב הגג
    top.add(q.x,topY+.7,q.z,q.sx-.4,.5,q.sz-.4,ry,c.clone().multiplyScalar(.9));                           // מעקה שטוח
    const front=R()<.5?1:-1,dx=rr(-q.sx*.22,q.sx*.22),dp=W(q,dx,front*(q.sz/2+.1)),gy=Math.max(terrM(dp[0],dp[1]),q.y+.4);
    door.add(dp[0],gy+1.9,dp[1],2.5,3.8,.5,ry,pick(dcol));
    trim.add(dp[0],gy+4.1,dp[1],3.5,.5,.9,ry,TRIM);trim.add(dp[0],gy+.15,dp[1],3.2,.3,1.2,ry,TRIM);        // משקוף ואסקופה
    const wy=Math.min(topY-2.2,gy+Math.max(3.2,H*.55)),nF=Math.max(1,Math.min(3,Math.round(q.sx/9)));
    for(let k=0;k<nF;k++){const lx=-q.sx/2+q.sx*(k+.5)/nF;if(Math.abs(lx-dx)<2.8)continue;const p=W(q,lx,front*(q.sz/2+.08));win.add(p[0],wy,p[1],1.3,1.8,.45,ry,WIN);trim.add(p[0],wy+1.15,p[1],2,.35,.75,ry,TRIM)}
    for(let k=0;k<Math.min(2,nF);k++){const lx=-q.sx/2+q.sx*(k+.5)/Math.min(2,nF),p=W(q,lx,-front*(q.sz/2+.08));win.add(p[0],wy,p[1],1.3,1.8,.45,ry,WIN);trim.add(p[0],wy+1.15,p[1],2,.35,.75,ry,TRIM)}
    for(const sd of[-1,1]){if(R()<.35)continue;const p=W(q,sd*(q.sx/2+.08),rr(-q.sz*.2,q.sz*.2));win.add(p[0],wy,p[1],.45,1.8,1.3,ry,WIN);trim.add(p[0],wy+1.15,p[1],.75,.35,2,ry,TRIM)}
    if(R()<.28&&q.sx>12&&q.sz>12){const rp=W(q,rr(-q.sx*.18,q.sx*.18),rr(-q.sz*.18,q.sz*.18));top.add(rp[0],topY+2.1,rp[1],q.sx*.36,2.8,q.sz*.36,ry,c);top.add(rp[0],topY+3.7,rp[1],q.sx*.36+.7,.5,q.sz*.36+.7,ry,c.clone().multiplyScalar(1.12));   // חדר גג
     const rd=W({x:rp[0],z:rp[1],ry},0,q.sz*.18+.05);door.add(rd[0],topY+1.8,rd[1],1.6,2.4,.4,ry,pick(dcol))}}
   [door,win,trim,top].forEach(b=>b.done(grp))});
  g.userData.houses=nH}

 /* ================= ג. חומה: חומות־שן וטורי פתחים; שערים עם מגדלים ודלתות ================= */
 {const stone=col(0xe1d2b0);
  WALLS.forEach(([grp,it,hgt,th])=>{const mer=Batch(geoB,mWhite);
   for(const q of it){const topY=q.y+q.sy,n=Math.max(2,Math.round(q.sx/4.6)),cs=Math.cos(q.ry),sn=Math.sin(q.ry);
    for(let k=0;k<n;k++){const t=((k+.5)/n-.5)*q.sx;mer.add(q.x+cs*t,topY+1.4,q.z-sn*t,2.2,2.8,Math.max(1.6,th*.55),q.ry,stone)}}
   mer.done(grp)});
  const gt=Batch(geoB,mWhite),gw=Batch(geoB,mWhite),WOOD=col(0x4a2f1a),DARK=col(0x251a10),ST=col(0xd8c8a2);
  GATES.forEach(G=>{let best=null,bd=1e9;WALLS.forEach(([grp,it,hgt,th])=>it.forEach(q=>{const d=Math.hypot(q.x-G[0],q.z-G[1]);if(d<bd){bd=d;best={q,hgt,th,grp}}}));if(!best)return;
   const {q,hgt,th}=best,ry=q.ry,gy=terrM(G[0],G[1]),op=15;                                                   // רוחב הפתח
   const P=(lx,lz)=>W({x:G[0],z:G[1],ry},lx,lz),tw=(lx)=>{const p=P(lx,0);gt.add(p[0],gy+(hgt+18)/2-2,p[1],11,hgt+18,th+6,ry,ST);
     for(let k=0;k<4;k++){const a=k%2?1:-1,b=k<2?1:-1,m=W({x:p[0],z:p[1],ry},a*4.4,b*(th/2+2.6));gt.add(m[0],gy+hgt+17,m[1],2.4,3,2.4,ry,stone)}};
   tw(-(op/2+5.5));tw(op/2+5.5);
   const lp=P(0,0);gt.add(lp[0],gy+(14+hgt)/2,lp[1],op+2,hgt-14,th+1,ry,ST);                                   // גשר עליון מעל הפתח
   [-1,1].forEach(sd=>{const p=P(sd*(op/2-1.6),th/2+2.4);gw.add(p[0],gy+6.5,p[1],3.2,13,.9,ry+sd*.9,WOOD)});      // כנפי דלת פתוחות החוצה
   const lk=P(0,th/2+.2);gw.add(lk[0],gy+13.2,lk[1],op+1,1.1,1.4,ry,DARK);
   label(G[3]+' (משוער)',G[0],G[1],hgt+34,1500,1)});
  gt.done();gw.done()}

 /* ================= ד. אנשים: בריכות מופעים (גוף, ראש, משא) לעוברים ושבים ולעומדים ================= */
 const SKIN=[0xc99a6c,0xb8865a,0xd8aa7c,0xa87850].map(col),TUN=[0xd8cfae,0x8a4b2a,0x6b7a3c,0xb3262e,0x2b5aa8,0xcdb88a,0x9a6a30,0xf1ead2,0x6a2a86].map(col),SCARF=[0xf1ead2,0xb3262e,0x2b5aa8,0xe8c030,0x4f7a3a,0x6a2a86].map(col);
 function Pool(n,geo,castS){const im=new T.InstancedMesh(geo,mWhite,Math.max(1,n));im.instanceMatrix.setUsage(T.DynamicDrawUsage);im.frustumCulled=false;im.castShadow=!!castS;im.receiveShadow=false;for(let i=0;i<n;i++)im.setColorAt(i,WH);g.add(im);return im}
 const people=[];   // {r:route,s,dir,sp,off,k,ph,x,z,ry,sc,stand}
 const NW=360,ND=24;
 const pB=Pool(NW+400,geoC,true),pH=Pool(NW+400,geoS),pL=Pool(NW+400,geoB);
 const mover=pieces.filter(p=>p.len>80),wts=mover.map(p=>p.len*(p.s.mk?3:1));let wsum=0;wts.forEach(x=>wsum+=x);
 const pickRoute=()=>{let r=R()*wsum;for(let i=0;i<mover.length;i++){r-=wts[i];if(r<=0)return mover[i]}return mover[0]};
 function newWalker(i){const r=pickRoute(),k=R()<.52?0:R()<.7?1:R()<.82?2:3;
  const w={r,s:R()*r.len,dir:R()<.5?1:-1,sp:rr(3.4,7.8),off:rr(-r.s.w*.32,r.s.w*.32),k,ph:R()*6.3,sc:k==2?.66:1,i,stand:0};
  const sk=pick(SKIN);pB.setColorAt(i,k==1?pick(SCARF).clone().multiplyScalar(.9):pick(TUN));pH.setColorAt(i,k==1?pick(SCARF):sk);pL.setColorAt(i,k==3?pick(TUN).clone().multiplyScalar(.7):WH);return w}
 if(mover.length)for(let i=0;i<NW;i++)people.push(newWalker(i));
 let nStand=NW;
 const standAt=(x,z,ry,k,c)=>{if(nStand>=NW+400)return;const i=nStand++;const sk=pick(SKIN);pB.setColorAt(i,c||pick(TUN));pH.setColorAt(i,k==1?pick(SCARF):sk);pL.setColorAt(i,WH);people.push({stand:1,x,z,ry,k,sc:k==2?.62:1,ph:R()*6.3,i,sp:0,r:null,s:0,dir:1,off:0})};
 /* חמורים עמוסים */
 const dB=Pool(ND,geoS,true),dH=Pool(ND,geoS),dLg=Pool(ND*4,geoB),dLoad=Pool(ND,geoB);const donk=[];
 if(mover.length)for(let i=0;i<ND;i++){const r=pickRoute();donk.push({r,s:R()*r.len,dir:R()<.5?1:-1,sp:rr(2.6,4.6),off:rr(-2,2),ph:R()*6});dB.setColorAt(i,col(pick([0x8a8478,0x6a645a,0x9a9488])));dH.setColorAt(i,col(0x6a645a));dLoad.setColorAt(i,col(pick([0xb08a4c,0x8a4b2a,0xe8dfc8,0x6b7a3c])));for(let l=0;l<4;l++)dLg.setColorAt(i*4+l,col(0x5a554c))}

 /* ================= ה. דוכני שוק ================= */
 const SB=Batch(geoB,mWhite),SC=Batch(geoC,mWhite),SS=Batch(geoS,mWhite),SF=Batch(geoB,mFire),SK=Batch(geoK,mWhite);
 const CANOPY=[0xb3262e,0x2b5aa8,0xe8c030,0xf1ead2,0x6a2a86,0x4f7a3a,0xc8742a].map(col),WOODC=col(0x6b4a2b),WOOD2=col(0x8a6a40);
 const GOODS={fruit:[0xc8402a,0xe8a020,0x7a9a30,0x9a2a5a],bread:[0xc9954a],spice:[0xc8402a,0xe8a020,0x8a5a2a,0x4f7a3a],cloth:[0xb3262e,0x2b5aa8,0xe8c030,0x6a2a86,0xf1ead2],oil:[0xb5703c],wine:[0x8a3a2a],figs:[0x6a3a5a,0xc9a05a],dove:[0xf4f1e8]};
 function stall(x,z,ry,kind){const gy=terrM(x,z),q={x,z,ry},P=(lx,lz)=>W(q,lx,lz);
  const bx=(lx,y0,lz,w,h,d,c,rx)=>{const p=P(lx,lz);SB.add(p[0],gy+y0+h/2,p[1],w,h,d,ry,c.isColor?c:col(c),rx||0)};
  bx(0,0,0,5.4,1.25,2.2,WOODC);bx(0,1.25,0,5.6,.18,2.4,WOOD2);
  [[-2.6,-1.1],[2.6,-1.1],[-2.6,1.1],[2.6,1.1]].forEach(a=>bx(a[0],0,a[1],.35,4.4,.35,WOODC));
  bx(0,4.3,.1,6.2,.2,3.4,pick(CANOPY),.14);                                                                   // יריעת צל
  const gc=GOODS[kind]||GOODS.fruit;
  if(kind=='oil'||kind=='wine'){for(let k=0;k<5;k++){const p=P(-2+k,.1);SC.add(p[0],gy+1.25+.8,p[1],.9,1.6,.9,0,col(gc[0]));const n=P(-2+k,.1);SK.add(n[0],gy+1.25+1.85,n[1],.5,.5,.5,0,col(gc[0]))}}
  else if(kind=='dove'){for(let k=0;k<3;k++){bx(-1.6+k*1.6,1.43,0,1.3,1.1,1.2,0xb08a4c);const p=P(-1.6+k*1.6,0);SS.add(p[0],gy+3.05,p[1],.8,.6,.55,ry,col(0xf4f1e8))}}
  else if(kind=='cloth'){for(let k=0;k<5;k++)bx(-2.1+k*1.05,1.43,.1,.9,.7,1.3,pick(gc))}
  else if(kind=='bread'){for(let k=0;k<8;k++){const p=P(-2.3+(k%4)*1.5,-.4+(k>>2)*.9);SS.add(p[0],gy+1.6,p[1],1.1,.6,.8,ry,col(0xc9954a))}}
  else{for(let k=0;k<4;k++){const p=P(-2.1+k*1.4,.1);SK.add(p[0],gy+1.25+.55,p[1],1.5,1.1,1.5,0,col(pick(gc)))}}
  if(R()<.7)standAt(...P(0,-2.3),ry+Math.PI,R()<.35?1:0);                                                     // המוכר מאחור
  const nc=(R()*3)|0;for(let k=0;k<nc;k++){const p=P(rr(-2.5,2.5),rr(2.6,4.6));standAt(p[0],p[1],ry+rr(2.6,3.7),R()<.4?1:R()<.2?2:0)}
 }
 /* מקומות לדוכנים: לאורך רחובות שוק (בצדדים לסירוגין, בלי להתנגש בבעלי המלאכה) */
 const val=pieces.filter(p=>p.s.n=='valley').sort((a,b)=>b.len-a.len)[0],ST0=20,STN=12,STD=37;   // רחוב גיא הטיופויון: בעלי המלאכה בצד מערב, דוכנים בצד מזרח
 const kinds1=['fruit','bread','spice','cloth','oil','figs','wine','dove','fruit','cloth'];
 pieces.filter(p=>p.s.mk==1).forEach(p=>{let side=1,ki=(R()*kinds1.length)|0;const isVal=p.s.n=='valley';
  for(let s=14;s<p.len-10;s+=(isVal?19:17)){const a=rtAt(p,s),nx=-a.dz,nz=a.dx,off=p.s.w/2+4.6;side=-side;const x=a.x+nx*off*side,z=a.z+nz*off*side,ry=Math.atan2(-nx*side,-nz*side);
   if(p===val&&s>ST0-8&&s<ST0+STN*STD+4&&side>0)continue;                                                       // אזור בעלי המלאכה: בצד מערב אין דוכנים
   stall(x,z,ry,kinds1[ki++%kinds1.length])}});
 pieces.filter(p=>p.s.mk==2).forEach(p=>{let side=1;for(let s=40;s<p.len-20;s+=46){const a=rtAt(p,s),nx=-a.dz,nz=a.dx,off=p.s.w/2+4.6;side=-side;stall(a.x+nx*off*side,a.z+nz*off*side,Math.atan2(-nx*side,-nz*side),pick(['dove','figs','oil','wine']))}});

 /* ================= ו. בעלי מקצוע (מהמשנה והגמרא) – תחנות לאורך רחוב הגיא ================= */
 const anim=[];   // {pv,type,ph,...}
 const arm=(x,z,y,ry,type,len,ph)=>{const pv=new T.Group();pv.position.set(x,y,z);pv.rotation.y=ry;const m=new T.Mesh(geoB,new T.MeshStandardMaterial({color:0xc99a6c,roughness:.9}));m.scale.set(.5,.5,len||2);m.position.set(0,0,(len||2)/2);pv.add(m);
  if(type=='hammer'){const h=new T.Mesh(geoB,new T.MeshStandardMaterial({color:0x4a4a4a,roughness:.6}));h.scale.set(.9,.9,.5);h.position.set(0,0,(len||2)+.1);pv.add(h)}
  if(type=='saw'){const h=new T.Mesh(geoB,new T.MeshStandardMaterial({color:0xb8b8b0,roughness:.5}));h.scale.set(.1,.8,2.6);h.position.set(0,-.2,(len||2)+.9);pv.add(h)}
  g.add(pv);anim.push({pv,type,ph:ph||R()*6,ry});return pv};
 const spinners=[],smokers=[];
 function station(i,kind,x,z,ry,name){const gy=terrM(x,z),q={x,z,ry},P=(lx,lz)=>W(q,lx,lz);
  const bx=(lx,y0,lz,w,h,d,c,rx)=>{const p=P(lx,lz);SB.add(p[0],gy+y0+h/2,p[1],w,h,d,ry,col(c),rx||0)};
  const cy=(lx,y0,lz,r,h,c)=>{const p=P(lx,lz);SC.add(p[0],gy+y0+h/2,p[1],2*r,h,2*r,0,col(c))};
  const sp=(lx,yc,lz,sx,sy,sz,c)=>{const p=P(lx,lz);SS.add(p[0],gy+yc,p[1],sx,sy,sz,ry,col(c))};
  const fr=(lx,y0,lz,w,h,d)=>{const p=P(lx,lz);SF.add(p[0],gy+y0+h/2,p[1],w,h,d,ry)};
  const man=(lx,lz,face,k,c)=>{const p=P(lx,lz);standAt(p[0],p[1],ry+(face||0),k||0,c?col(c):null)};
  const A=(lx,lz,y,type,len,yawOff,ph)=>{const p=P(lx,lz);return arm(p[0],p[1],gy+y,ry+(yawOff||0),type,len,ph)};
  bx(0,-1,0,11,1.25,9,0xbfae85);                                                                               // רצפת אבן
  [[-5,-4],[5,-4],[-5,4],[5,4]].forEach(a=>bx(a[0],0,a[1],.4,5.2,.4,0x6b4a2b));bx(0,5.1,0,11.4,.25,9.4,pick(CANOPY.map(c=>c.getHex())),.1);   // סככה
  const lab=name;
  if(kind=='smith'){bx(-3,0,-2.4,3.2,2,2.6,0x8a8478);fr(-3,2,-2.4,2.2,.6,1.6);cy(-3.8,2,-3,.45,3.4,0x6a645a);bx(1.4,0,-1.3,1.2,1.3,.9,0x3a3a3a);bx(1.4,1.3,-1.3,1.6,.3,.8,0x555555);bx(3.6,0,-2.6,2.2,1,1.2,0x6b4a2b);man(.2,-.2,Math.PI,0,0x5a4a3a);A(.7,-.4,2.2,'hammer',2.1,Math.PI,0)}
  else if(kind=='potter'){cy(-1.8,.2,.4,1.2,.4,0x9a7a52);const p=P(-1.8,.4);spinners.push({x:p[0],y:gy+1,z:p[1]});sp(-1.8,1.9,.4,1.6,1.7,1.6,0xb5703c);for(let k=0;k<7;k++)sp(-4.2+k*1.35,.95+.2*(k%2),-3.4,1.0+.25*(k%3),1.1+.2*(k%2),1.0+.25*(k%3),pick([0xb5703c,0xa0602e,0xc58250]));bx(0,-.1,-3.4,10,.3,1.2,0x8a6a40);cy(3.7,0,-1.2,1.5,1.2,0x9a7a52);sp(3.7,1.2,-1.2,3.4,2.4,3.4,0xa0602e);fr(3.7,.3,-.1,1.2,.8,.4);man(-1.8,-1.2,0,0,0x8a6a4a)}
  else if(kind=='carp'){bx(0,0,-1.6,5,1.1,1.6,0x8a6a40);bx(0,1.1,-1.6,5.2,.2,1.8,0x9a7a52);for(let k=0;k<5;k++)bx(-3.9+k*.35,0,3.4,.3,4.2,.9,pick([0xb08a4c,0x9a7a52,0xc9a05a]),.12);for(let k=0;k<3;k++)cy(3.6,k*.8,2.8,.5,.8,0x6b4a2b);man(-.8,-.2,Math.PI,0);A(-.5,-.9,2.3,'saw',1.8,Math.PI,1)}
  else if(kind=='weaver'){bx(-3.8,0,-1,.35,4.4,.35,0x6b4a2b);bx(3.8,0,-1,.35,4.4,.35,0x6b4a2b);bx(0,4.1,-1,7.9,.3,.3,0x6b4a2b);bx(0,.9,-1,7.9,.3,.3,0x6b4a2b);for(let k=0;k<16;k++)bx(-3.5+k*.47,1.1,-1,.12,3,.12,pick([0xe8c030,0xb3262e,0xf1ead2,0x2b5aa8]));bx(0,1.1,-.95,7,1.6,.15,0xb3262e);for(let k=0;k<5;k++)bx(-3+k*1.4,1.2,-.9,.7,1.5,.18,pick([0x2b5aa8,0xe8c030,0xf1ead2]));for(let k=0;k<4;k++)sp(-4+k*1.1,.6,3,1.1,.9,1.1,pick([0xf1ead2,0xb3262e,0xe8c030]));man(0,1,Math.PI,1,0x6a2a86)}
  else if(kind=='dyer'){[[-3.2,0x2b5aa8],[0,0x6a2a86],[3.2,0xb3262e]].forEach(a=>{cy(a[0],0,-1.4,1.3,1.5,0x6b4a2b);const p=P(a[0],-1.4);SC.add(p[0],gy+1.55,p[1],2.2,.2,2.2,0,col(a[1]))});for(let k=0;k<5;k++)bx(-4.2+k*2.1,2.2,-3.9,.12,3.2,1.2,pick([0x2b5aa8,0x6a2a86,0xb3262e,0xf1ead2]));bx(0,5.2,-3.9,10,.2,.2,0x6b4a2b);bx(0,2.1,-3.9,10,.2,.2,0x6b4a2b);man(1.6,1,Math.PI,0,0x5a4a8a);A(1.6,.4,2.3,'stir',1.9,Math.PI,2)}
  else if(kind=='baker'){cy(-3,0,-2.2,2.1,2.4,0xb5703c);sp(-3,2.6,-2.2,4.4,2.8,4.4,0xb5703c);cy(-2.2,3,-2.6,.55,3.2,0xa0602e);fr(-3,.6,-.2,1.5,1.1,.5);bx(2.4,0,-1.6,4,1.1,1.8,0x8a6a40);for(let k=0;k<8;k++)sp(.9+(k%4)*1.1,1.55,-1.9+(k>>2)*.8,1,.55,.75,0xc9954a);man(-.5,.6,Math.PI,0,0xf1ead2);smokers.push({x:P(-2.2,-2.6)[0],y:gy+7,z:P(-2.2,-2.6)[1]})}
  else if(kind=='butcher'){bx(-4,0,-3,.3,4.2,.3,0x6b4a2b);bx(4,0,-3,.3,4.2,.3,0x6b4a2b);bx(0,4.2,-3,8.3,.25,.3,0x6b4a2b);for(let k=0;k<4;k++){bx(-3+k*2,1.6,-3,.9,2.6,.55,pick([0xb3262e,0x9a2a2a]));}cy(1.6,0,-.2,.9,1.3,0x8a6a40);bx(3,0,-1.5,3,1.1,1.5,0x8a6a40);man(.4,-1.4,Math.PI,0,0xe8dfc8);A(.8,-1.6,2.4,'hammer',1.8,Math.PI,3)}
  else if(kind=='tailor'){bx(0,0,-2.2,5,1.1,1.8,0x8a6a40);for(let k=0;k<5;k++)bx(-2+k*1,1.1,-2.2,.9,.5+.1*(k%2),1.2,pick([0xb3262e,0x2b5aa8,0xe8c030,0x6a2a86,0xf1ead2]));man(-.2,1,Math.PI,0,0x8a7a5a);const p=P(-.2,1);for(let k=0;k<3;k++)sp(-1.4+k*1.2,.5,2.2,1.4,.6,1.1,pick([0xb3262e,0x2b5aa8,0xf1ead2]))}
  else if(kind=='scribe'){bx(0,0,-1.4,4.6,1.2,2,0x8a6a40);cyR(P,bx,SC,gy,ry);for(let k=0;k<3;k++)bx(-1.5+k*1.2,1.2,-1.5,.9,.14,.55,0xf1ead2);bx(1.6,1.2,-1.7,.4,.6,.4,0x1c1510);man(0,.6,Math.PI,0,0xd8cfae);man(-1.5,3.4,Math.PI,0);man(1.2,4.2,Math.PI,1);A(.1,-.2,2.2,'write',1.3,Math.PI,4)}
  else if(kind=='doctor'){bx(0,0,-3.2,9,.25,.9,0x6b4a2b);bx(0,1.4,-3.2,9,.25,.9,0x6b4a2b);for(let k=0;k<9;k++){cy(-4+k*1,.25,-3.2,.35,.85,pick([0x6b7a3c,0xb5703c,0x8a3a2a,0x2b5aa8]));cy(-4+k*1,1.65,-3.2,.3,.7,pick([0xe8c030,0xf1ead2,0x4f7a3a]))}for(let k=0;k<6;k++)sp(-3.5+k*1.4,4.4,-3.6,.7,.7,.7,0x4f7a3a);man(.4,-.6,Math.PI,0,0xf1ead2);man(-1.2,1.2,Math.PI/2,0);bx(-1.2,0,1.2,1.6,.8,1.2,0x8a6a40)}
  else if(kind=='goldsmith'){bx(0,0,-1.8,4.4,1.15,1.9,0x8a6a40);for(let k=0;k<6;k++)sp(-1.6+k*.65,1.5,-1.8+(k%2)*.4,.45,.3,.45,0xe8c030);bx(2.8,0,-2.6,1.4,1.2,1.2,0x6a645a);fr(2.8,1.2,-2.6,.8,.4,.8);man(-.4,-.2,Math.PI,0,0x8a4b2a)}
  else if(kind=='teacher'){bx(0,-.05,-.4,9,.2,6,0xb3262e);man(0,-3.2,0,0,0xf1ead2);for(let k=0;k<8;k++){const a=-1.15+k*.33,p=[Math.sin(a)*4.4,Math.cos(a)*-1.6+.8];man(p[0],p[1]+1.2,Math.PI+a*.4,2,pick([0xd8cfae,0xcdb88a,0x8a4b2a,0x2b5aa8]))}}
  label(lab,x,z,9,380)}
 function cyR(){}   // (placeholder: גליל מגילה – מוסתר בכוונה, נוסף כקופסה)
 {if(val){const kinds=[['smith','נפח'],['potter','קדר'],['carp','נגר'],['weaver','אורג'],['dyer','צבע'],['baker','אופה'],['butcher','טבח'],['tailor','חייט'],['scribe','לבלר'],['doctor','רופא'],['goldsmith','צורף'],['teacher','מלמד תינוקות']];
   const side=1;kinds.forEach((k,i)=>{const s=ST0+10+i*STD;if(s>val.len-10)return;const a=rtAt(val,s),nx=-a.dz,nz=a.dx,off=val.s.w/2+7.5;station(i,k[0],a.x+nx*off*side,a.z+nz*off*side,Math.atan2(-nx*side,-nz*side),k[1])});
   const a0=rtAt(val,ST0-6);label('שוק בעלי המלאכה (משוער) – "אומן, לבלר, רופא ומלמד תינוקות" (סנהדרין יז ע״ב)',a0.x,a0.z,24,1300,1)}}
 SB.done();SC.done();SS.done();SF.done();SK.done();

 /* ================= ז. מצורעים מחוץ לעיר (ויקרא יג:מה–מו; כלים א:ז) ================= */
 {const [cx,cz]=CITY_SITES.lepers,gy=terrM(cx,cz),hutB=Batch(geoB,mWhite),hutC=Batch(geoK,mWhite),fireB=Batch(geoB,mFire),sc=Batch(geoS,mWhite);
  for(let k=0;k<5;k++){const a=k*1.25+.3,r=rr(14,30),x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r,y=terrM(x,z),ry=a+Math.PI;                       // סוכות עשויות ענפים ושקים
   hutB.add(x,y+2.4,z,8,.4,6.4,ry,col(0x7a6a4a),-.6);hutB.add(x,y+1,z,8,.5,6.4,ry,col(0x5a4a30));[-3.6,3.6].forEach(s=>hutB.add(x+Math.cos(ry)*s,y+1.7,z-Math.sin(ry)*s,.4,3.4,.4,ry,col(0x5a3a1a)));hutB.add(x,y+.35,z,8.6,.3,6.8,ry,col(0x8a7a58))}
  fireB.add(cx,gy+.5,cz,1.4,.9,1.4,0);hutB.add(cx,gy+.15,cz,3.4,.3,3.4,0,col(0x3a352c));
  for(let k=0;k<7;k++){const a=k*.9,r=rr(3,7);sc.add(cx+Math.cos(a)*r,terrM(cx+Math.cos(a)*r,cz+Math.sin(a)*r)+.35,cz+Math.sin(a)*r,1.1,.7,.9,a,col(0x6a655a))}
  hutB.done();fireB.done();sc.done();hutC.done();
  const RAG=[0x8a8478,0x6b6558,0x7a6a58,0x5a5448,0x948c78].map(col),HAIR=col(0x3a2a1a);
  const lep=[];for(let k=0;k<7;k++){const a=k*.85+.2,r=rr(5,9),x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r,i=nStand++;if(i>=NW+400)break;pB.setColorAt(i,pick(RAG));pH.setColorAt(i,HAIR);pL.setColorAt(i,WH);lep.push({x,z,ry:a+Math.PI,i,k:4,ph:R()*6,sc:k<5?.72:1,stand:1,sit:k<5})}
  // מצורע אחד עומד ליד הדרך וקורא "טמא טמא"
  const rd=terrM(-1160,425),i2=nStand++;pB.setColorAt(i2,col(0x7a6a58));pH.setColorAt(i2,HAIR);pL.setColorAt(i2,WH);lep.push({x:-1160,z:425,ry:-1.9,i:i2,k:5,ph:0,sc:1,stand:1,sit:0,call:1});
  lep.forEach(p=>people.push(p));
  label('מחנה המצורעים (משוער) – "בדד ישב, מחוץ למחנה מושבו"',cx,cz,22,1300,1);label('טָמֵא טָמֵא!',-1160,425,9,260,0)}

 /* ================= ח. בורסקי – מחוץ לעיר, בצד מזרח (בבא בתרא ב:ט) ================= */
 {const [cx,cz]=CITY_SITES.tannery,y=terrM(cx,cz),b=Batch(geoB,mWhite),c=Batch(geoC,mWhite);
  for(let k=0;k<4;k++){const x=cx-18+k*12;b.add(x,y+2.4,cz-6,.35,4.8,.35,0,col(0x6b4a2b));b.add(x+4,y+2.4,cz-6,.35,4.8,.35,0,col(0x6b4a2b));b.add(x+2,y+4.6,cz-6,4.4,.3,.3,0,col(0x6b4a2b));b.add(x+2,y+2.6,cz-6,3.6,3.4,.18,0,col(pick([0x9a6a40,0xb08a5c,0x8a5a38])))}
  for(let k=0;k<3;k++){c.add(cx-12+k*10,y+.9,cz+7,4.2,1.8,4.2,0,col(0x6b4a2b));c.add(cx-12+k*10,y+1.85,cz+7,3.6,.15,3.6,0,col(pick([0x5a4a2a,0x6b5a30,0x4a4028])))}
  b.add(cx,y+.2,cz+1,48,.3,26,0,col(0xa8946a));b.done();c.done();
  const m=people.length;[[-6,0],[8,2],[16,-3]].forEach((a,j)=>{const i=nStand++;if(i>=NW+400)return;pB.setColorAt(i,col(0x6b5a3a));pH.setColorAt(i,pick(SKIN));pL.setColorAt(i,WH);people.push({stand:1,x:cx+a[0],z:cz+a[1],ry:j,k:0,sc:1,ph:R()*6,i,sp:0,r:null,s:0,dir:1,off:0})});
  label('בורסקי – חמישים אמה מן העיר, בצד מזרח (משוער)',cx,cz,14,1000,0)}

 /* ================= ט. בית הדשן מחוץ לירושלים + כהנים מוציאים דשן בפסכתר ================= */
 const ash={c:CITY_SITES.ash,puffs:[]};
 {const [cx,cz]=CITY_SITES.ash,gy=terrM(cx,cz),b=Batch(geoB,mWhite),k=Batch(geoK,mWhite),f=Batch(geoB,mFire),s=Batch(geoS,mWhite),cd=Batch(geoC,mWhite);
  cd.add(cx,gy+.25,cz,64,.5,64,0,col(0xd6cdb6));cd.add(cx,gy+.55,cz,46,.2,46,0,col(0x6f6a62));cd.add(cx+12,gy+.6,cz-8,14,.2,14,0,col(0x4a4640));                       // רצפה עגולה נקייה, ואדמה חרוכה סביב התלים                                                                // רצפה נקייה – "מקום טהור"
  for(let i=0;i<22;i++){const a=i/22*Math.PI*2;if(Math.abs(Math.atan2(Math.sin(a-2.2),Math.cos(a-2.2)))<.32)continue;const x=cx+Math.cos(a)*31,z=cz+Math.sin(a)*31;b.add(x,terrM(x,z)+1.2,z,6,2.4,2.2,-a+Math.PI/2,col(0xc8b896))}   // גדר אבן עם פתח לדרך
  k.add(cx,gy+10,cz,40,20,40,0,col(0x8f8a80));k.add(cx+13,gy+6,cz+8,24,12,24,0,col(0x7f7a72));k.add(cx-12,gy+5,cz-12,20,10,20,0,col(0x9d988e));k.add(cx+4,gy+3,cz-16,14,6,14,0,col(0x6f6a62));      // תלי הדשן
  for(let i=0;i<14;i++){const a=R()*6.28,r=R()*10;s.add(cx+Math.cos(a)*r,gy+rr(3,9),cz+Math.sin(a)*r,rr(3,6),rr(2,4),rr(3,6),a,col(pick([0x8a857a,0xa9a498,0x6e6a62])))}
  for(let i=0;i<5;i++){const a=R()*6.28,r=rr(4,11);f.add(cx+Math.cos(a)*r,gy+rr(1.5,4)+Math.hypot(r)*.15,cz+Math.sin(a)*r,1.8,.6,1.8,a)}                   // גחלים עוממות
  b.done();k.done();f.done();s.done();cd.done();
  ash.fire=f;label('בית הדשן – "אל מקום טהור" מחוץ לירושלים (ויקרא ו:ד) · משוער',cx,cz,26,1400,1)}
 // כהנים: שלוש קבוצות בהפרש, כל אחת שני כהנים עם פסכתר
 const route=(()=>{const a=pieces.find(p=>p.s.n=='ash');return a})();
 const ashPath=(()=>{const full=dense(STREETS.find(s=>s.n=='ash').p,8),cum=[0];for(let i=1;i<full.length;i++)cum.push(cum[i-1]+Math.hypot(full[i][0]-full[i-1][0],full[i][1]-full[i-1][1]));return{pts:full,cum,len:cum[cum.length-1]}})();
 const NP=6,pri=[];const pBd=Pool(NP,geoC,true),pHd=Pool(NP,geoS),pCap=Pool(NP,geoK),pVes=Pool(NP,geoB),pAsh=Pool(NP,geoC),pSash=Pool(NP,geoC);
 for(let i=0;i<NP;i++){pBd.setColorAt(i,col(0xf4efe0));pHd.setColorAt(i,pick(SKIN));pCap.setColorAt(i,col(0xf1ead2));pVes.setColorAt(i,col(0xb5703c));pAsh.setColorAt(i,col(0x8a857a));pSash.setColorAt(i,col(0xb3262e));pri.push({grp:i>>1,j:i&1,i})}
 const CYC=250,WALK=ashPath.len/13;   // מהירות 13 יחידות לשנייה (מואצת, כדי שיהיה מה לראות)
 const smoke=[];{const cv=document.createElement('canvas');cv.width=cv.height=64;const x=cv.getContext('2d'),gr=x.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(210,205,198,.7)');gr.addColorStop(1,'rgba(210,205,198,0)');x.fillStyle=gr;x.fillRect(0,0,64,64);const tex=new T.CanvasTexture(cv);
  const mk=(n,x0,y0,z0)=>{for(let i=0;i<n;i++){const m=new T.SpriteMaterial({map:tex,transparent:true,depthWrite:false,opacity:0}),s=new T.Sprite(m);s.frustumCulled=false;g.add(s);smoke.push({s,x:x0,y:y0,z:z0,ph:i/n,sp:rr(.12,.2)})}};
  smokers.forEach(e=>mk(5,e.x,e.y,e.z));const [cx,cz]=CITY_SITES.ash;mk(8,cx,terrM(cx,cz)+6,cz);mk(5,cx+9,terrM(cx+9,cz+6)+4,cz+6)}

 /* ================= י. עדכון בכל תמונה ================= */
 const tmpC=col(0xffffff);
 function setP(im,i,x,y,z,sx,sy,sz,ry,rx,rz){o3.position.set(x,y,z);o3.rotation.set(rx||0,ry||0,rz||0);o3.scale.set(sx,sy,sz);o3.updateMatrix();im.setMatrixAt(i,o3.matrix)}
 let fr=0;
 function update(dt,t){if(!g.visible)return;fr++;const cp=camera.position;
  // עוברים ושבים
  for(const p of people){if(p.stand){const gy=terrM(p.x,p.z),sc=p.sc,sit=p.sit,call=p.call,bob=call?Math.abs(Math.sin(t*2.2+p.ph))*.25:0,sway=Math.sin(t*(sit?1.1:.8)+p.ph)*(sit?.09:.03);
    const hh=sit?1.5:2.3,bodyY=gy+(sit?.2:0)+hh*sc/2+bob;setP(pB,p.i,p.x,bodyY,p.z,1.0*sc,hh*sc,1.0*sc,p.ry,sway*.3,sway);setP(pH,p.i,p.x,bodyY+hh*sc/2+.5*sc,p.z,1.0*sc,1.1*sc,1.0*sc,p.ry);setP(pL,p.i,p.x,-9999,p.z,.01,.01,.01,0);continue}
   p.s+=p.dir*p.sp*dt;if(p.s>p.r.len){p.s=p.r.len;p.dir=-1}else if(p.s<0){p.s=0;p.dir=1}
   const a=rtAt(p.r,p.s),nx=-a.dz,nz=a.dx,x=a.x+nx*p.off,z=a.z+nz*p.off,gy=terrM(x,z),ph=t*p.sp*.55+p.ph,bob=Math.abs(Math.sin(ph))*.16*p.sc,ry=Math.atan2(a.dx*p.dir,a.dz*p.dir),sway=Math.sin(ph)*.07,sc=p.sc;
   setP(pB,p.i,x,gy+1.15*sc+bob,z,1.0*sc,2.3*sc,1.0*sc,ry,0,sway);setP(pH,p.i,x,gy+2.85*sc+bob,z,1.0*sc,1.1*sc,1.0*sc,ry);
   if(p.k==3)setP(pL,p.i,x,gy+3.9*sc+bob,z,2.2,1.5,1.5,ry);else setP(pL,p.i,x,-9999,z,.01,.01,.01,0)}
  pB.instanceMatrix.needsUpdate=pH.instanceMatrix.needsUpdate=pL.instanceMatrix.needsUpdate=true;
  // חמורים
  donk.forEach((d,i)=>{d.s+=d.dir*d.sp*dt;if(d.s>d.r.len){d.s=d.r.len;d.dir=-1}else if(d.s<0){d.s=0;d.dir=1}const a=rtAt(d.r,d.s),nx=-a.dz,nz=a.dx,x=a.x+nx*d.off,z=a.z+nz*d.off,gy=terrM(x,z),ry=Math.atan2(a.dx*d.dir,a.dz*d.dir),ph=t*d.sp*.9+d.ph,bob=Math.abs(Math.sin(ph))*.12,c=Math.cos(ry),s=Math.sin(ry);
   setP(dB,i,x,gy+2.6+bob,z,1.7,2.1,3.9,ry);setP(dH,i,x+s*2.5,gy+3.5+bob,z+c*2.5,1.1,1.2,1.7,ry,-.3);setP(dLoad,i,x,gy+4.1+bob,z,2.2,1.5,2.4,ry);
   [[-.6,-1.3],[.6,-1.3],[-.6,1.3],[.6,1.3]].forEach((l,k)=>setP(dLg,i*4+k,x+c*l[0]+s*l[1],gy+.95,z-s*l[0]+c*l[1],.35,1.9,.35,ry,Math.sin(ph+k*1.7)*.35))});
  dB.instanceMatrix.needsUpdate=dH.instanceMatrix.needsUpdate=dLoad.instanceMatrix.needsUpdate=dLg.instanceMatrix.needsUpdate=true;
  // כהנים עם פסכתר: מן המקדש אל בית הדשן ובחזרה
  pri.forEach(q=>{const ph=((t+q.grp*CYC/3)%CYC),out=ph<WALK,wait=ph>=WALK&&ph<WALK+14,back=ph>=WALK+14&&ph<2*WALK+14;let s,dir=1,tip=0;
   if(out){s=ph*13}else if(wait){s=ashPath.len;tip=Math.min(1,(ph-WALK)/3)*(ph-WALK<11?1:0)}else if(back){s=ashPath.len-(ph-WALK-14)*13;dir=-1}else{s=0}
   s=Math.max(0,Math.min(ashPath.len,s));let i=1;while(i<ashPath.pts.length-1&&ashPath.cum[i]<s)i++;const a=ashPath.pts[i-1],b=ashPath.pts[i],L=ashPath.cum[i]-ashPath.cum[i-1]||1,u=(s-ashPath.cum[i-1])/L,dx=(b[0]-a[0])/L,dz=(b[1]-a[1])/L,nx=-dz,nz=dx,lat=(q.j?1:-1)*1.6;
   const x=a[0]+(b[0]-a[0])*u+nx*lat,z=a[1]+(b[1]-a[1])*u+nz*lat;q.px=x;q.pz=z;const gy=terrM(x,z),moving=out||back,pp=t*6+q.i,bob=moving?Math.abs(Math.sin(pp))*.14:0,ry=wait?Math.atan2(-(CITY_SITES.ash[0]-x),-(CITY_SITES.ash[1]-z))+Math.PI:Math.atan2(dx*dir,dz*dir),c=Math.cos(ry),sn=Math.sin(ry);
   const carry=back?0:1;
   setP(pBd,q.i,x,gy+1.25+bob,z,1.05,2.5,1.05,ry,0,moving?Math.sin(pp)*.05:0);setP(pHd,q.i,x,gy+3.1+bob,z,1.0,1.1,1.0,ry);setP(pCap,q.i,x,gy+3.95+bob,z,.95,1.1,.95,ry);setP(pSash,q.i,x,gy+1.7+bob,z,1.15,.45,1.15,ry);
   const vx=x+sn*1.15,vz=z+c*1.15;setP(pVes,q.i,vx,gy+2.0+bob+tip*.4,vz,1.1,.9,1.1,ry,tip*.9);setP(pAsh,q.i,vx,gy+2.5+bob+tip*.5,vz,.95,carry?.18:.001,.95,ry,tip*.9);
   });
  pBd.instanceMatrix.needsUpdate=pHd.instanceMatrix.needsUpdate=pCap.instanceMatrix.needsUpdate=pVes.instanceMatrix.needsUpdate=pAsh.instanceMatrix.needsUpdate=pSash.instanceMatrix.needsUpdate=true;
  // בעלי מקצוע: פטיש, מסור, מגרגרה, גלגל קדר
  anim.forEach(a=>{const ph=a.ph;if(a.type=='hammer')a.pv.rotation.x=-.5+Math.abs(Math.sin(t*4.5+ph))*1.2;else if(a.type=='saw')a.pv.rotation.x=-.2+Math.sin(t*6+ph)*.25;else if(a.type=='stir')a.pv.rotation.x=.3+Math.sin(t*1.6+ph)*.35;else if(a.type=='write')a.pv.rotation.x=.45+Math.sin(t*3+ph)*.1});
  // עשן (אפיה ובית הדשן)
  smoke.forEach(e=>{const u=(e.ph+t*e.sp)%1;e.s.position.set(e.x+Math.sin(u*5+e.ph*9)*1.2+u*5,e.y+u*18,e.z+u*3);const sz=4+u*9;e.s.scale.set(sz,sz,1);e.s.material.opacity=Math.sin(u*Math.PI)*.5});
 }
 return{update,g,pieces,pri,count:()=>({people:people.length,pieces:pieces.length,houses:g.userData.houses})}
})();
