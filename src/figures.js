/* ================= FIG – דמויות יהודיות "חיות" מתקופת בית שני (20.11.2026) =================
 API (גלובלי; נטען לפני people.js ו-crowd.js; כלי הנגינה ב-src/instruments.js = INSTR):
  FIG.make(kind,variant,opts) -> THREE.Group (דמות קרובה עם שלד: כתפיים/מרפקים/צוואר/ירכיים/ברכיים; ≤8K משולשים)
     kind:  'israelite' (איש ישראל: כתונת, אבנט, טלית/גלימה עם ציצית וחוט תכלת, כיסוי ראש, זקן ופיאות, סנדלים)
            'woman'     (אישה בעזרת נשים: שמלה ארוכה צנועה, אבנט־חבל, צעיף/כיסוי ראש שיורד על הכתפיים)
            'elder'     (זקן/חבר סנהדרין: גלימה עשירה עם שוליים, מצנפת, זקן לבן ארוך, גב מעט כפוף)
            'child'     (ילד: כתונת קצרה, כיפה/כיסוי, פיאות, ראש גדול יחסית)
            'levite'    (לוי: מעיל בז' בפסים עם סרגל אדום, כתונת לבנה, אבנט אדום, טורבן שמנת עם כיפה אדומה – כבסרטון)
            'guard'     (שוער/לוי שומר = levite בלי כלי) ; 'priest' (כהן הדיוט/גדול: עוטף את priest() של people.js)
     variant: מספר (זרע: צבעים/זקן/כיסוי ראש משתנים דטרמיניסטית) או שם; ללוי: 'kinor'|'nevel'|'tziltzal'|'chalil'|'singer'|'guard'
     opts: {seed, instr:'kinor'|..., lod:0 (פחות מקטעים), scale, pose:'stand'|'clasp'|'chest'|'lift'|'carry'|'reach'|'wave', hair:hex, tint:hex (צבע כתונת)}
  FIG.pose(fig,name)            קובע תנוחת ידיים בסיסית (ר' POSE למטה). ללוי עם כלי: 'play' אוטומטי.
  FIG.animate(fig,t,state)      state = {walk:0..1, speed (אמות/שנ' לתדירות הצעדים), bow:0..1, sing:0..1, play:0..1, look:radians}
                                נשימה, נדנוד, סיבוב ראש, מצמוץ, מחזור הליכה (רגליים+ידיים+שוליים), השתחוויה, פה פתוח, נגינה.
  FIG.crowdGeometry(kind,variant,opts) -> {robe, head} (BufferGeometry ממוזגת, צבעי קודקודים, ≈400–700 משולשים).
     robe = הבגד: צבע לבן + פסים באפור => צובעים לפי instanceColor (כמו PAL ב-crowd.js); head = כל השאר בצבעים קבועים (עור, שיער, אבנט, כיסוי ראש...).
     kind גם בשמות crowd.js: man|woman|kohen|levi|sage|sit|child  ;  opts.instr לוי עם כלי (בגיאומטריה סטטית של נגינה).
  FIG.crowdPalette(kind) -> מערך צבעי בגד מומלצים ל-instanceColor.   FIG.stats(group) -> {tris, meshes}.
  FIG.nearLOD: ר' people.js – לוויי הדוכן בטווח קרוב מוחלפים בדמויות FIG עם נגינה אמיתית.
 תקציב: קרובה ≈4–7K משולשים (≈14 רשתות); קהל ≈500. טקסטורת בד: קנבס בקוד כברירת מחדל; אם FIG_TEX (figures_tex.js) קיים – תמונה (base64 גולמי -> Blob; לא data-URI – בגלל נטפרי).
 מקורות לבוש (לא הומצא): ממצאי מדבר יהודה/מצדה/נחל חבר – כתונת צמר/פשתן בגוון טבעי (שמנת/חום) עם פסי "קלביום" כהים (כחול־סגול, אדום, שחור) ושולי פס; גלימה מלבנית (טלית/הימטיון) עם ציצית בכנפות וחוט תכלת (במדבר טו:לח; משנה כלים כט, ושבת ו); אבנט; סנדלים (משנה שבת ו:ב; כלים כו:ג);
  אישה: כתונת ארוכה, חגורה וצעיף (משנה שבת ו:ו על כיסוי הראש, ביצה ב:ג; כתובות ז:ו – "יוצאה וראשה פרוע" אסור); כהן/לוי – ר' תיעוד ב-people.js. הצבעים – דגומים מגיליונות הדמות של Gemini (assets/figure-ref/). */
function FGB(){const P=[],N=[],U=[],C=[];let _fl=false;
 const Th=THREE,o3=new Th.Object3D(),up=new Th.Vector3(0,1,0),cc=new Th.Color();
 const put=(g0,col,mat,fl)=>{const g=g0.index?g0.toNonIndexed():g0.clone();g.applyMatrix4(mat);const p=g.attributes.position,n=g.attributes.normal,u=g.attributes.uv,c=cc.set(col),f=fl==null?_fl:fl;
  for(let i=0;i<p.count;i++){P.push(p.getX(i),p.getY(i),p.getZ(i));N.push(n.getX(i),n.getY(i),n.getZ(i));if(f||!u)U.push(.002,.002);else U.push(u.getX(i),u.getY(i));C.push(c.r,c.g,c.b)}};
 const B={
  fl(v){_fl=!!v;return B},n:()=>P.length/3,
  add(geo,col,x=0,y=0,z=0,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0,fl){o3.position.set(x,y,z);o3.rotation.set(rx,ry,rz);o3.scale.set(sx,sy,sz);o3.updateMatrix();put(geo,col,o3.matrix,fl)},
  mat(geo,col,m,fl){put(geo,col,m,fl)},
  limb(a,b,r1,r2,col,seg=8,fl){const d=new Th.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),L=d.length();if(L<1e-6)return;o3.position.set((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);o3.quaternion.setFromUnitVectors(up,d.normalize());o3.scale.set(1,1,1);o3.updateMatrix();put(new Th.CylinderGeometry(r2,r1,L,seg),col,o3.matrix,fl)},
  tube(pts,r,col,seg=8,rad=5,fl){const cu=new Th.CatmullRomCurve3(pts.map(p=>new Th.Vector3(p[0],p[1],p[2])));put(new Th.TubeGeometry(cu,seg,r,rad,false),col,new Th.Matrix4(),fl)},
  strip(A,Bp,col){const c=cc.set(col);for(let i=0;i<A.length-1;i++){const q=[A[i],Bp[i],Bp[i+1],A[i],Bp[i+1],A[i+1]],a=new Th.Vector3(...A[i]),b=new Th.Vector3(...Bp[i]),d=new Th.Vector3(...A[i+1]),nn=b.clone().sub(a).cross(d.clone().sub(a)).normalize();
    q.forEach(v=>{P.push(v[0],v[1],v[2]);N.push(nn.x,nn.y,nn.z);U.push(.002,.002);C.push(c.r,c.g,c.b)})}},
  addG(g0,m){if(!g0)return;const g=g0.clone();g.applyMatrix4(m);const p=g.attributes.position,n=g.attributes.normal,u=g.attributes.uv,c=g.attributes.color;for(let i=0;i<p.count;i++){P.push(p.getX(i),p.getY(i),p.getZ(i));N.push(n.getX(i),n.getY(i),n.getZ(i));U.push(u.getX(i),u.getY(i));C.push(c.getX(i),c.getY(i),c.getZ(i))}},
  geo(){if(!P.length)return null;const g=new Th.BufferGeometry();g.setAttribute('position',new Th.Float32BufferAttribute(P,3));g.setAttribute('normal',new Th.Float32BufferAttribute(N,3));g.setAttribute('uv',new Th.Float32BufferAttribute(U,2));g.setAttribute('color',new Th.Float32BufferAttribute(C,3));return g}};
 return B}
const FIG=(()=>{
 const T=THREE,TAU=Math.PI*2,PI=Math.PI,HY=1.7,L1=.56,L2=.52,DN=new T.Vector3(0,-1,0);
 const _hs=s=>{s=String(s);let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0)%2147483646+1};
 const mkR=seed=>{let s=seed%2147483646;if(s<=0)s+=2147483646;return()=>(s=s*16807%2147483647)/2147483647};
 const cl=(a,b,c)=>a<b?b:a>c?c:a;
 /* ---- פלטות (דגומות מגיליונות Gemini; ר' assets/figure-ref/palette.json ועדכון 'PALS' בהמשך) ---- */
 const SKINS=[0xc99673,0xbf8c6a,0xd2a283,0xb98462,0xc4906e],HAIRD=[0x2a1d16,0x3a261d,0x4a3426,0x1f1713,0x5a4030],GRAYB=[0x7a7570,0x9a9892,0xb8b6b0];
 const WOOLS=[0xa0846e,0x9a846e,0xe9dfc6,0xd9c9a2,0xc8b184,0xb89868,0xe4dccb,0xa8906e,0x9a7a52,0x6a7a52,0x3f5379,0x8a4a3a],CLAVI=[0x5a4636,0x5a4636,0x2e3a5a,0x6a2a38,0x3a3430,0x7a5a2a,0x2a4f8a],
  CLOAKS=[0xd3c7b9,0xe6d9c6,0xece6d6,0xd8cdb2,0x8a6a48,0x5a4a38,0x3f5379,0x7a6a54,0xf0ebde],BELTS=[0x8b2a33,0x6b4a2e,0x8a5a38,0x856b5b,0x3a4f78,0xb8a070],HATS=[0xefe9db,0xdccfb2,0xc8b88f,0x3b4a6b,0x8a6a48,0xe4dccb];
 const DRESS=[0x5a6585,0x4d5878,0x5a6585,0xc8584a,0xd8a040,0x4a7a9a,0x6a9a5a,0xb0608a,0xe0d0b0,0x8a6aa0,0xc98a6a,0xa04a3a,0x3f5379],DRTRIM=[0xd8c9b0,0xe8d08a,0x3a2a22,0xf0ece2,0x2e3a5a,0xb8903a],CORDS=[0x8a6a48,0xd8c8a0,0x7a2a30],VEILS=[0xe6e2da,0xd8d3ca,0xf0eadc,0xe4dcc8,0x6a5a7a,0x3b4a6b,0xb09878,0xdccfb2];
 const ELDR=[0xdccfb2,0xe0d4b8,0xdccfb2,0xf0ece2,0x3b4a6b,0x6a2a38,0x4a4a52,0xd8d0b8,0x2b3f6e],ELDM=[0x2b3f6e,0x2b3f6e,0x2b3f6e,0x3b4a6b,0x6a2a38,0xf3efe4],ELDH=[0xf0ecdf,0x3b4a6b,0xd8d0b8],CHILD=[0xe9dfc6,0xc8b184,0x9a4a3a,0x6a7a52,0x3f5379,0xd8a040];
 const PALS={israelite:WOOLS,woman:DRESS,elder:ELDR,child:CHILD,levite:[0xb8966a],priest:[0xe4e0d5]};
 const LEATH=0x6a4a2e,BLUEZ=0x2a5ca8,WHITEZ=0xf2ece0;
 /* ---- חומר וטקסטורת בד (קנבס בקוד; התמונה מ-FIG_TEX מחליפה אם קיימת) ---- */
 const _tc=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);return c};
 const weave=()=>_tc(128,128,(g,w,h)=>{let s=5;const r=()=>(s=s*16807%2147483647)/2147483647;g.fillStyle='#f4f1ea';g.fillRect(0,0,w,h);
  for(let y=0;y<h;y+=2){g.fillStyle='rgba(120,105,80,'+(.05+r()*.08)+')';g.fillRect(0,y,w,1)}for(let x=0;x<w;x+=2){g.fillStyle='rgba(120,105,80,'+(.04+r()*.07)+')';g.fillRect(x,0,1,h)}
  for(let i=0;i<70;i++){g.fillStyle='rgba(255,255,255,.4)';g.fillRect(r()*w,r()*h,2+r()*6,1)}g.fillStyle='#fff';g.fillRect(0,0,3,3)});
 const tex=new T.CanvasTexture(weave());tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(5,4);tex.anisotropy=4;tex.encoding=T.sRGBEncoding;
 const mFig=new T.MeshStandardMaterial({vertexColors:true,map:tex,roughness:.92,metalness:0,side:T.DoubleSide});
 // תמונת בד מ-FIG_TEX: base64 גולמי -> Blob -> Image -> קנבס (עם 3 פיקסלים לבנים בפינה: UV קבוע לעור/שיער) ; נכשל => נשאר הקנבס
 (()=>{if(typeof FIG_TEX=='undefined'||!FIG_TEX.cloth)return;try{const b=atob(FIG_TEX.cloth),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);const url=URL.createObjectURL(new Blob([u],{type:'image/jpeg'})),im=new Image();
  im.onload=()=>{if(im.naturalWidth<8)return;const c=_tc(im.naturalWidth,im.naturalHeight,(g,w,h)=>{g.drawImage(im,0,0);g.fillStyle='#fff';g.fillRect(0,0,3,3)});const t2=new T.CanvasTexture(c);t2.wrapS=t2.wrapT=T.RepeatWrapping;t2.repeat.set(3,2.4);t2.anisotropy=4;t2.encoding=T.sRGBEncoding;mFig.map=t2;mFig.needsUpdate=true;FIG.texFromImage=true};
  im.src=url}catch(e){}})();
 /* ---- עזרי גיאומטריה ---- */
 const lat=(pts,seg,a,b)=>new T.LatheGeometry(pts.map(p=>new T.Vector2(p[0],p[1])),seg,a,b);
 const PLT=[[10,.03],[23,.01]];const pk1=(x,y,z)=>{let k=1;for(const q of PLT)k*=1+q[1]*Math.sin(Math.atan2(z,x)*q[0]+y*1.7);return k};
 const pleat=g=>{const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),y=p.getY(i),k=pk1(x,y,z);p.setX(i,x*k);p.setZ(i,z*k)}g.computeVertexNormals();return g};
 const radAt=(a,y)=>{if(y<=a[0][1])return a[0][0];for(let i=1;i<a.length;i++)if(y<=a[i][1]){const u=(y-a[i-1][1])/(a[i][1]-a[i-1][1]);return a[i-1][0]+(a[i][0]-a[i-1][0])*u}return a[a.length-1][0]};
 // סרט (פס) שעוקב אחר פרופיל הכתונת בזווית th; w רוחב; off הרמה מהשטח
 function ribbon(B,a,y0,y1,th,w,col,off,zs,hi){const n=hi?8:4,A=[],Bb=[];for(let i=0;i<=n;i++){const y=y0+(y1-y0)*i/n,r=radAt(a,y)+off,s=Math.sin(th),c=Math.cos(th),x=r*s,z=r*c*zs,k=hi?pk1(x,y,z):1,tx=c,tz=-s*zs,tl=Math.hypot(tx,tz);
   A.push([x*k+tx/tl*w/2,y,z*k+tz/tl*w/2]);Bb.push([x*k-tx/tl*w/2,y,z*k-tz/tl*w/2])}B.strip(A,Bb,col)}
 // טבעת (שוליים) סביב הכתונת בין y0..y1
 const ring=(B,a,y0,y1,col,off,zs,hi,phi0,phiL)=>{const g=lat([[radAt(a,y0)+off,y0],[radAt(a,y1)+off,y1]],hi?NS:NL,phi0,phiL);if(hi)pleat(g);B.add(g,col,0,0,0,1,1,zs)};
 /* ---- פרופילי כתונת (רדיוס,גובה) ---- */
 const PROF={m:{lo:[[.52,.2],[.515,.3],[.5,.6],[.48,.95],[.455,1.3],[.43,1.6],[.415,1.82]],up:[[.415,1.82],[.43,1.98],[.405,2.14],[.375,2.38],[.33,2.58],[.27,2.69]]},
  f:{lo:[[.58,.1],[.57,.3],[.54,.6],[.5,.95],[.44,1.3],[.39,1.6],[.37,1.82]],up:[[.37,1.82],[.385,1.98],[.395,2.14],[.36,2.38],[.32,2.56],[.26,2.68]]}};
 function prof(sp,part){let a=PROF[sp.fem?'f':'m'][part].map(p=>[p[0]*sp.rs,p[1]]);if(part=='lo'&&sp.hem>a[0][1]){const i=a.findIndex(p=>p[1]>=sp.hem);if(i>0){const u=(sp.hem-a[i-1][1])/(a[i][1]-a[i-1][1]);a=[[a[i-1][0]+(a[i][0]-a[i-1][0])*u,sp.hem]].concat(a.slice(i))}}return a}
 /* ---- מפרט דמות (דטרמיניסטי לפי variant) ---- */
 function specFor(kind,variant,o){o=o||{};const vs=variant&&typeof variant=='object'?JSON.stringify(variant):String(variant),R=mkR(_hs(kind+'|'+vs+'|'+(o.seed||0))),pk=a=>a[(R()*a.length)|0];
  const s={kind,sc:1,hs:1.1,fem:false,child:false,stoop:0,rs:1,hem:.2,zs:.88,sleeve:1,beard:2,peot:true,cloak:null,hat:{},belt:{},clavi:null,band:null,sandal:true,coat:false,role:'',skin:pk(SKINS),R};
  const gray=R()<.22?pk(GRAYB):null;s.hair=o.hair!=null?o.hair:pk(HAIRD);s.bcol=gray||s.hair;
  switch(kind){
   case 'israelite':s.tun=pk(WOOLS);if(R()<.55)s.clavi=pk(CLAVI);if(R()<.4)s.band=pk(CLAVI);s.belt={col:pk(BELTS),h:.2,tail:true};
    if(R()<.8)s.cloak={col:pk(CLOAKS),band:pk(CLAVI),gap:1.3,tz:true};s.hat={type:pk(['wrap','wrap','cap','wrap']),col:pk(HATS)};s.beard=R()<.72?2:1;break;
   case 'woman':s.fem=true;s.sc=.94;s.hs=1.12;s.hem=.1;s.zs=.9;s.beard=0;s.peot=false;s.tun=pk(DRESS);s.band=pk(DRTRIM);s.belt={col:pk(CORDS),h:.07,tail:false};s.hat={type:'veil',col:pk(VEILS)};
    if(R()<.35)s.cloak={col:pk(VEILS),band:null,gap:1.7,shawl:true};break;
   case 'elder':s.stoop=.07;s.rs=1.06;s.tun=pk(ELDR);s.belt={col:pk(BELTS),h:.22,tail:true};s.cloak={col:pk(ELDM),band:pk([0xb08d3c,0xb08d3c,0xc9a23a,0x2a4f8a]),gap:1.15,tz:true,rich:true};s.hat={type:'turban',col:pk(ELDH)};s.beard=3;s.hair=0xd8d8d6;s.bcol=pk([0xe2e0da,0xd0cec8,0xe8e6df]);s.clavi=R()<.5?pk(CLAVI):null;break;
   case 'child':s.child=true;s.sc=.62;s.hs=1.32;s.hem=.5;s.beard=0;s.tun=pk(CHILD);s.belt={col:pk(BELTS),h:.16,tail:false};s.hat={type:'cap',col:pk(HATS)};s.band=R()<.4?pk(CLAVI):null;break;
   case 'levite':case 'guard':s.coat=true;s.tun=0xb8966a;s.hair=o.hair!=null?o.hair:pk([0x3a2a1e,0x3a2a1e,0x4a3426,0xcfcfcd]);s.bcol=s.hair;s.belt={col:0x7a2a22,h:.2,tail:true};s.hat={type:'levcap',col:0xe8dcc0,col2:0x8a2a22};s.beard=2;s.role=typeof variant=='string'?variant:(o.instr||'singer');break;
   case 'priest':s.tun=0xe4e0d5;s.belt={col:0x8a4a4f,h:.2,tail:true};s.hat={type:'cone',col:0xf1ece0};s.sandal=false;s.beard=2;s.hair=0x3a261d;s.bcol=0x3a261d;s.sleeve=1;break}
  if(o.tint!=null)s.tun=o.tint;return s}
 /* ---- שני כותבים: g (בגד: ניתן לצביעה) ו-h (קבוע) ---- */
 const GC=(sp,crowd)=>(c=>crowd?0xffffff:c);                    // צבע בגד ראשי: לבן בקהל (מקבל instanceColor)
 const AC=(crowd)=>((c,g)=>{if(!crowd)return c;const v=Math.round(255*(g!=null?g:.45));return (v<<16)|(v<<8)|v});       // צבע הדגשה (פס/שוליים): אפור בקהל
 /* ---- פיגורה: פונקציות בנייה לכל חלק ---- */
 // hi=1: מפורט (קרוב); hi=0: מצומצם (קהל / lod:0)
 const sub=(a,idx)=>idx.map(i=>a[Math.min(i,a.length-1)]);
 const NS=20,NL=8;   // מקטעי היקף
 function buildSkirt(sp,Q,hi,crowd){const g=Q.g,h=Q.h,gc=GC(sp,crowd),ac=AC(crowd),a0=prof(sp,'lo'),a=hi?a0:sub(a0,[0,2,4,a0.length-1]),n=hi?NS:NL,tg=gc(sp.tun);
  if(sp.coat){   // לוי: כתונת לבנה מלאה + מעיל בז׳ פתוח מלפנים עם סרגל אדום
   const gap=.72,wt=a.map(p=>[p[0]*.955,p[1]]);h.add(lat(wt,n),0xf1ece0,0,0,0,1,1,sp.zs);
   const cg=lat(a,n,gap/2,TAU-gap);if(hi)pleat(cg);g.add(cg,tg,0,0,0,1,1,sp.zs);
   [-1,1].forEach(s=>ribbon(h,a,a[0][1],1.82,s*(gap/2+.012),.035,0x7a2a22,.008,sp.zs,hi));
   if(hi)for(let i=0;i<7;i++)ribbon(g,a,a[0][1],1.82,gap/2+.35+i*(TAU-gap-.7)/6,.018,ac(0xa07e52,.62),.004,sp.zs,hi);
   return}
  const tgm=lat(a,n);if(hi)pleat(tgm);g.add(tgm,tg,0,0,0,1,1,sp.zs);
  if(sp.band!=null){const y0=a[0][1];ring(g,a,y0,y0+(sp.fem?.16:.07),ac(sp.band,.55),.004,sp.zs,hi,0,TAU);if(hi)ring(g,a,y0+.1,y0+.115,ac(sp.fem?0xe8d08a:0x8a6a48,.7),.004,sp.zs,hi,0,TAU)}
  if(sp.clavi!=null)(hi?[-.3,.3,PI-.3,PI+.3]:[-.3,.3]).forEach(th=>ribbon(g,a,a[0][1],1.82,th,.05,ac(sp.clavi,.4),.004,sp.zs,hi))}
 function buildTorso(sp,Q,hi,crowd){const g=Q.g,h=Q.h,gc=GC(sp,crowd),ac=AC(crowd),a0=prof(sp,'up'),a=hi?a0:sub(a0,[0,2,4,5]),n=hi?NS:NL,tg=gc(sp.tun),pb=prof(sp,'lo');
  if(sp.coat){const gap=.72;h.add(lat(a.map(p=>[p[0]*.955,p[1]]),n),0xf1ece0,0,0,0,1,1,sp.zs);const cg=lat(a,n,gap/2,TAU-gap);if(hi)pleat(cg);g.add(cg,tg,0,0,0,1,1,sp.zs);
   [-1,1].forEach(s=>ribbon(h,a,1.82,2.66,s*(gap/2+.012),.035,0x7a2a22,.008,sp.zs,hi))}
  else{const tgm=lat(a,n);if(hi)pleat(tgm);g.add(tgm,tg,0,0,0,1,1,sp.zs);
   if(sp.clavi!=null)(hi?[-.3,.3,PI-.3,PI+.3]:[-.3,.3]).forEach(th=>ribbon(g,a,1.82,2.64,th,.05,ac(sp.clavi,.4),.004,sp.zs,hi))}
  if(hi){g.add(new T.SphereGeometry(.27*sp.rs,16,8),tg,0,2.69,0,1,.34,sp.zs);[-1,1].forEach(s=>g.add(new T.SphereGeometry(.145,10,8),tg,s*.34,2.62,0));
   g.add(new T.TorusGeometry(.125,.024,6,18),sp.coat?0xf1ece0:ac(sp.child||sp.fem?(sp.band!=null?sp.band:sp.tun):0xd9cfb4,.9),0,2.7,0,1,1,1,PI/2,0,0)}
  h.add(new T.CylinderGeometry(.085,.1,.18,hi?10:4),sp.skin,0,2.745,0);
  // אבנט
  const b=sp.belt,by=sp.fem?1.98:1.9,ab=pb.concat(prof(sp,'up')),br=Math.max(radAt(pb,1.82),radAt(ab,by+b.h/2),radAt(ab,by-b.h/2))*1.04+.008;
  h.add(new T.CylinderGeometry(br,br,b.h,hi?NS:NL,1,true),b.col,0,by,0,1,1,sp.zs*1.01);
  if(hi&&b.h>.12){[1,-1].forEach(s=>h.add(new T.CylinderGeometry(br*1.004,br*1.004,.02,NS,1,true),0xdcb04a,0,by+s*(b.h/2-.015),0,1,1,sp.zs*1.01))}
  if(b.tail){const kz=br*sp.zs+.01;if(hi)h.add(new T.SphereGeometry(.07,8,6),b.col,.07,by,kz,1.25,.9,.75);[[.1,.05],[0,-.05]].slice(0,hi?2:1).forEach(([x,r],i)=>h.add(new T.BoxGeometry(.11,.55-i*.12,.016),b.col,x+.03,by-.3+i*.05,kz+.02,1,1,1,-.08,0,r*1.6))}
  // גלימה/טלית: מעטפת פתוחה מלפנים, קפל על הכתף, שוליים פסים, ציצית בכנפות
  if(sp.cloak){const c=sp.cloak,gp=c.gap;let pr=(c.shawl?[[.3,2.64],[.43,2.55],[.49,2.2],[.52,1.75],[.53,1.45]]:[[.31,2.66],[.42,2.58],[.47,2.32],[.5,1.9],[.54,1.4],[.57,1.1],[.58,.92]]).reverse().map(p=>[p[0]*sp.rs,p[1]]);
   if(!hi)pr=pr.length>5?sub(pr,[0,2,4,6]):sub(pr,[0,2,4]);const cg=lat(pr,hi?NS:NL,gp/2,TAU-gp),zc=sp.zs*1.03;if(hi)pleat(cg);g.add(cg,gc(c.col),0,0,0,1,1,zc);
   if(c.band!=null&&!c.shawl){ring(g,pr,.93,1.05,ac(c.band,.35),.006,zc,hi,gp/2,TAU-gp);if(hi){ring(g,pr,1.1,1.14,ac(c.rich?0xc9a23a:c.band,.5),.006,zc,hi,gp/2,TAU-gp);if(c.rich)ring(g,pr,1.2,1.23,ac(0xb08d3c,.6),.006,zc,hi,gp/2,TAU-gp)}}
   if(!c.shawl){   // קפל־טלית חוצה את החזה מהכתף השמאלית: פס רחב
    const cu=new T.CatmullRomCurve3([[.34,2.74,-.14],[.32,2.76,.16],[.1,2.34,.4],[-.2,1.92,.44]].map(p=>new T.Vector3(p[0]*sp.rs,p[1],p[2]))),pts=cu.getPoints(hi?8:3),A=[],Bq=[];
    pts.forEach((p,i)=>{const t=cu.getTangent(i/(pts.length-1)),w=new T.Vector3().crossVectors(t,new T.Vector3(0,0,1)).normalize().multiplyScalar(.085);A.push([p.x+w.x,p.y+w.y,p.z+.012]);Bq.push([p.x-w.x,p.y-w.y,p.z+.012])});g.strip(A,Bq,gc(c.col))}
   if(c.tz){[-1,1].forEach(s=>{const x=Math.sin(gp/2)*s*.6*sp.rs,z=Math.cos(gp/2)*.6*sp.rs*zc+.01,y0=.95;
     if(hi){for(let i=0;i<4;i++)h.limb([x+(i-1.5)*.008*s,y0,z],[x+(i-1.5)*.02*s,y0-.32,z+.005*i],.0045,.0035,WHITEZ,4);h.limb([x,y0,z+.006],[x+.012*s,y0-.36,z+.012],.0055,.0045,BLUEZ,4);h.add(new T.SphereGeometry(.013,5,4),WHITEZ,x,y0+.005,z)}   // ארבע חוטים לבנים + חוט תכלת
     else h.limb([x,y0,z],[x,y0-.3,z],.014,.01,WHITEZ,3)})}}}
 function buildHead(sp,Q,E,O,hi,crowd,rig){const g=Q.g,h=Q.h,ac=AC(crowd),sk=sp.skin,BD=sp.bcol,HR=sp.hair,ex=0,ey=2.975,ez=.18;
  const sph=(r,w,hh)=>new T.SphereGeometry(r,w,hh);const w1=hi?14:7,h1=hi?10:5;
  h.add(sph(.205,w1,h1),sk,0,2.93,.01,1,1.1,.97);
  if(hi){h.add(sph(.045,8,6),sk,0,2.915,.2,.95,1.5,1.2)}
  [-1,1].forEach(s=>{if(hi){h.add(sph(.05,8,6),sk,s*.21,2.93,0,.7,1,.8);
   h.add(new T.BoxGeometry(.105,.024,.03),sp.fem?0x2a1d16:HR,s*.08,3.025,.185,1,1,1,0,0,-s*.14);   // גבות
   if(sp.fem)h.add(new T.BoxGeometry(.07,.01,.02),0x2a1d16,s*.08,2.955,.196,1,1,1,0,0,-s*.05);   // ריסים
   // עיניים (לובן+אישון) – ברשת נפרדת כדי שאפשר לצמצם (מצמוץ)
   const ee=(geo,col,x,y,z,...r)=>rig?E.add(geo,col,x-ex,y-ey,z-ez,...r):h.add(geo,col,x,y,z,...r);
   ee(sph(.024,8,6),0xf2ece0,s*.08,ey,ez,1.2,.8,.7);ee(sph(.017,6,5),0x1a1410,s*.08,ey,ez+.02);
   if(sp.beard>0){h.add(sph(.075,8,6),BD,s*.135,2.81,.08,.8,1.3,.9);h.add(sph(.06,8,6),BD,s*.045,2.86,.205,1.35,.55,.6)}}   // לחי וחצי שפם
   if((sp.peot&&sp.beard>0)||sp.child){if(hi){for(let i=0;i<5;i++)h.add(sph(.032,6,5),HR,s*(.2+(i%2?.013:-.008)),2.9-.055*i,.05+(i%2)*.012)}else h.add(sph(.045,4,3),HR,s*.2,2.8,.05,.8,2.2,.8)}});   // פיאות מסולסלות
  if(!hi&&!rig)[-1,1].forEach(s=>h.add(new T.BoxGeometry(.045,.03,.02),0x1a1410,s*.08,2.975,.2))   // קו עיניים בקהל
  // פה (רשת נפרדת: נפתח בשירה)
  const mm=sp.fem?0x9a4a48:0x5a2a2a;if(rig)O.add(sph(1,8,6),mm,0,0,0,.048,.013,.02);
  // שיער בעורף + זקן (באישה – הכל מכוסה בצעיף)
  if(!sp.fem&&(hi||sp.hat.type=='cap'))h.add(sph(.2,hi?12:5,hi?8:3),HR,0,3.0,-.06,1,.8,.85);
  if(sp.beard>=1){const l=sp.beard,sy=l>=3?1.9:l==2?1.1:.8,cy=2.82-.13*sy;h.add(sph(.13,hi?10:5,hi?8:4),BD,0,cy,.1,1.1,sy,.85);
   if(l>=2&&hi)h.add(sph(.1,10,8),BD,0,l>=3?2.38:2.55,.16,1,l>=3?1.9:1.2,.8);
   if(l>=3)h.add(new T.ConeGeometry(.1,.32,hi?9:5),BD,0,2.25,.16,1,1,.8,PI,0,0);
   if(hi){if(l>=3)for(let i=0;i<5;i++)h.add(sph(.045,6,5),BD,(i-2)*.05,2.52-Math.abs(i-2)*.03,.19,1,1.5,.7);if(l>=2)for(let i=0;i<4;i++)h.add(sph(.034,6,5),BD,(i-1.5)*.07,cy-.1-Math.abs(i-1.5)*.02,.17-Math.abs(i-1.5)*.03,1,1.2,.8);h.add(new T.BoxGeometry(.06,.014,.02),0x6a3a34,0,2.865,.2)}}
  else if(!sp.fem&&!sp.child&&hi){h.add(new T.BoxGeometry(.06,.014,.02),0x6a3a34,0,2.865,.205)}
  // כיסוי ראש (בקהל: צבע קבוע ולא כצבע הבגד)
  const ht=sp.hat,hc=ht.col,G2=crowd?h:g,tr=hi?22:8,tb=hi?8:3;
  if(ht.type=='wrap'){(hi?[[.235,.075,3.09],[.215,.07,3.165]]:[[.23,.08,3.1]]).forEach(([R,r,y])=>G2.add(new T.TorusGeometry(R,r,tb,tr),hc,0,y,0,1,1,1,PI/2,0,0));G2.add(sph(.17,hi?12:5,hi?8:3),hc,0,3.2,0,1,.7,1);G2.limb([.12,3.1,-.2],[.3,2.6,-.28],.06,.045,hc,hi?7:4)}
  else if(ht.type=='cap'){G2.add(new T.SphereGeometry(.22,hi?14:6,hi?8:3,0,TAU,0,PI*.46),hc,0,2.97,0,1,1,1);if(hi)h.add(new T.TorusGeometry(.215,.018,5,18),sp.child?0x6a4a2e:0x8a6a48,0,3.0,0,1,1,1,PI/2,0,0)}
  else if(ht.type=='turban'){(hi?[[.25,.085,3.07],[.235,.08,3.15],[.2,.075,3.23]]:[[.25,.09,3.08],[.2,.08,3.2]]).forEach(([R,r,y])=>G2.add(new T.TorusGeometry(R,r,tb,tr),hc,0,y,0,1,1,1,PI/2,0,0));G2.add(sph(.18,hi?12:5,hi?8:3),hc,0,3.3,0,1,.7,1);if(hi){G2.add(sph(.08,8,6),hc,.22,3.08,.08);h.add(new T.TorusGeometry(.255,.012,5,22),0xc9a23a,0,3.06,0,1,1,1,PI/2,0,0)}}
  else if(ht.type=='levcap'){G2.add(new T.TorusGeometry(.22,.09,hi?8:3,hi?20:8),ht.col,0,3.1,0,1,1,1,PI/2,0,0);h.add(sph(.15,hi?12:5,hi?8:3),ht.col2,0,3.15,0,1,.8,1)}
  else if(ht.type=='cone'){G2.add(new T.ConeGeometry(.23,.58,hi?12:6),hc,0,3.35,0);if(hi)h.add(new T.TorusGeometry(.23,.02,5,16),0xd8d0b8,0,3.1,0,1,1,1,PI/2,0,0)}
  else if(ht.type=='veil'){const gp=1.5,pts=[[.001,3.2],[.1,3.19],[.2,3.12],[.245,2.97],[.26,2.82],[.28,2.7],[.34,2.62],[.42,2.54],[.47,2.3],[.5,2.0],[.52,1.7]],pv=hi?pts:sub(pts,[0,2,4,6,8,10]),vg=lat(pv,hi?NS:NL,gp/2,TAU-gp);if(hi)pleat(vg);G2.add(vg,hc,0,0,0,1,1,.92);if(hi)h.add(new T.TorusGeometry(.2,.014,5,18,TAU*.6),sp.band!=null?sp.band:0x8a6a48,0,3.06,.02,1,1,1,PI/2,0,PI*.2)}}
 // זרוע: מקומית, תלויה מטה (-y) מציר הכתף; Qu (עליונה), Ql (תחתונה)
 function buildArm(sp,s,Qu,Ql,hi,crowd){const gc=GC(sp,crowd),ac=AC(crowd),tg=gc(sp.tun),sw=sp.coat?0xf1ece0:tg,sl=sp.fem?.1:.125,sk=sp.skin,S=hi?10:4;
  if(hi)Qu.g.add(new T.SphereGeometry(sl*1.12,S,5),tg,0,0,0);Qu.g.limb([0,0,0],[0,-L1,0],sl,sl*.92,tg,S);if(hi)Qu.g.add(new T.SphereGeometry(sl*.93,S,5),tg,0,-L1,0);
  Ql.g.limb([0,0,0],[0,-.4,0],sl*.9,sl*.82,sw,S);if(hi)Ql.h.add(new T.TorusGeometry(sl*.84,.014,5,10),sp.coat?0x7a2a22:(sp.band!=null?sp.band:0xd9cfb4),0,-.4,0,1,1,1,PI/2,0,0);Ql.h.limb([0,-.4,0],[0,-L2,0],.07,.055,sk,hi?8:4);
  // כף יד: כף, אצבעות, אגודל
  if(hi){Ql.h.add(new T.SphereGeometry(.07,8,6),sk,0,-L2-.055,0,1.05,1.2,.55);for(let i=0;i<4;i++)Ql.h.limb([-.045+i*.03,-L2-.1,.0],[-.045+i*.03+(i-1.5)*.004,-L2-.185+(i==1||i==2?-.01:.012),.012],.016,.012,sk,5);Ql.h.limb([s*-.04,-L2-.04,.035],[s*-.05,-L2-.12,.07],.02,.014,sk,5)}
  else Ql.h.add(new T.SphereGeometry(.07,4,3),sk,0,-L2-.08,.01,1,1.3,.7)}
 function buildLeg(sp,Q,hi,crowd){const h=Q.h,sk=sp.skin;   // מקומי: ראשית בברך; הרצפה ב-y=-.85
  if(crowd&&!hi){if(sp.hem>.3)h.limb([0,0,0],[0,-.76,0],.065,.05,sk,4);h.add(new T.BoxGeometry(.13,.07,.3),sp.sandal!==false?LEATH:sk,0,-.815,.1);return}
  h.limb([0,0,0],[0,-.76,0],.065,.045,sk,hi?8:4);
  if(hi){h.add(new T.SphereGeometry(.05,6,5),sk,0,-.78,0);h.add(new T.SphereGeometry(.1,10,8),sk,0,-.815,.1,.9,.5,2.0);h.add(new T.SphereGeometry(.07,6,5),sk,0,-.79,-.07,1,1.1,1);
   for(let i=0;i<5;i++)h.add(new T.SphereGeometry(.018,5,4),sk,(i-2)*.026,-.835,.285-Math.abs(i-2)*.012)}
  else h.add(new T.SphereGeometry(.1,5,4),sk,0,-.815,.1,.9,.5,2.0);
  if(sp.sandal!==false){h.add(new T.BoxGeometry(.15,.025,.4),LEATH,0,-.838,.08);if(hi){h.add(new T.BoxGeometry(.17,.016,.035),0x3a2614,0,-.795,.07);h.add(new T.TorusGeometry(.056,.008,4,10),0x3a2614,0,-.755,0,1,1,1,PI/2,0,0);h.add(new T.BoxGeometry(.012,.012,.15),0x3a2614,0,-.79,0)}}}
 /* ---- IK לשתי חוליות; כל הווקטורים במערכת U (ראשית בירכיים) ---- */
 const _d=new T.Vector3(),_p=new T.Vector3(),_E=new T.Vector3(),_W=new T.Vector3(),_l=new T.Vector3(),_qi=new T.Quaternion();
 function ik(S,W,pole,qSh,qEl,outE){_d.copy(W).sub(S);let dist=_d.length();const mx=L1+L2-.004,mn=Math.abs(L1-L2)+.03;dist=cl(dist,mn,mx);_d.normalize();_W.copy(S).addScaledVector(_d,dist);
  const ca=cl((L1*L1+dist*dist-L2*L2)/(2*L1*dist),-1,1),sa=Math.sqrt(1-ca*ca);_p.copy(pole);_p.addScaledVector(_d,-_p.dot(_d));if(_p.lengthSq()<1e-6)_p.set(0,-1,0).addScaledVector(_d,.0);_p.normalize();
  _E.copy(S).addScaledVector(_d,L1*ca).addScaledVector(_p,L1*sa);qSh.setFromUnitVectors(DN,_l.copy(_E).sub(S).normalize());_qi.copy(qSh).invert();_l.copy(_W).sub(_E).normalize().applyQuaternion(_qi);qEl.setFromUnitVectors(DN,_l);if(outE)outE.copy(_E);return _W}
 const POSE={stand:{w:[[.46,1.58,.1],[-.46,1.58,.1]],free:[1,1]},clasp:{w:[[.1,1.95,.46],[-.1,1.95,.46]],free:[0,0]},chest:{w:[[.13,2.3,.5],[-.13,2.3,.5]],free:[0,0]},lift:{w:[[.3,2.72,.62],[-.3,2.72,.62]],free:[0,0]},
  carry:{w:[[.3,2.15,.6],[-.3,2.15,.6]],free:[0,0]},reach:{w:[[.46,1.58,.1],[-.36,2.45,.95]],free:[1,0]},wave:{w:[[.46,1.58,.1],[-.55,3.25,.12]],free:[1,0]},bless:{w:[[.5,2.9,.3],[-.5,2.9,.3]],free:[0,0]}};
 const SH=[new T.Vector3(.36,2.62-HY,0),new T.Vector3(-.36,2.62-HY,0)],POLE=[new T.Vector3(.5,-.7,-.5).normalize(),new T.Vector3(-.5,-.7,-.5).normalize()];
 /* ---- דמות קרובה עם שלד ---- */
 function make(kind,variant,o){o=o||{};if(kind=='guard'){variant='guard';kind='levite'}if(kind=='priest')return makePriest(variant,o);
  let instr=o.instr;if(kind=='levite'&&typeof variant=='string'&&INSTR.TYPES.indexOf(variant)>=0)instr=variant;
  const sp=specFor(kind,variant,o),hi=o.lod!==0,g=new T.Group(),F={sp,kind,ph:0,lt:null,w:0,pb:instr?1:0,bowv:0,bl:R0(sp),inst:null,pose:'stand',wr:[new T.Vector3(),new T.Vector3()],free:[1,1],hs:sp.hs};
  const mesh=(B,par,x=0,y=0,z=0)=>{const ge=B.geo();if(!ge)return null;const m=new T.Mesh(ge,mFig);m.castShadow=true;m.position.set(x,y,z);par.add(m);return m};
  const mk2=()=>{const b=FGB(),vw=fl=>({add:(geo,col,x,y,z,sx,sy,sz,rx,ry,rz)=>b.add(geo,col,x,y,z,sx,sy,sz,rx,ry,rz,fl),limb:(a,bb,r1,r2,col,seg)=>b.limb(a,bb,r1,r2,col,seg,fl),tube:(pts,r,col,seg,rad)=>b.tube(pts,r,col,seg,rad,fl),strip:(A,Bp,col)=>b.strip(A,Bp,col)});return{g:vw(false),h:vw(true),b}};
  const U=new T.Group();U.position.y=HY;g.add(U);F.U=U;
  // גוף עליון: חזה, כתפיים, אבנט, גלימה
  {const Q=mk2();buildTorso(sp,Q,hi,false);mesh(Q.b,U,0,-HY,0)}
  // חצאית (תנועה עצמאית) – נקודת ציר בירכיים
  {const Q=mk2();buildSkirt(sp,Q,hi,false);const sg=new T.Group();sg.position.y=HY;g.add(sg);const m=mesh(Q.b,sg,0,-HY,0);F.skirt=sg;F.skm=m;const p=m.geometry.attributes.position;F.skBase=p.array.slice()}
  // ראש
  {const hg=new T.Group();hg.position.y=2.74-HY;hg.scale.setScalar(sp.hs);U.add(hg);F.head=hg;const Q=mk2(),E=FGB().fl(true),Mo=FGB().fl(true);Q.b.fl(false);buildHead(sp,Q,E,Mo,true,false,true);
   mesh(Q.b,hg,0,-2.74,0);F.eyes=mesh(E,hg,0,2.975-2.74,.18);F.mouth=mesh(Mo,hg,0,2.845-2.74,.2)}
  // זרועות
  F.sh=[];F.el=[];
  [0,1].forEach(i=>{const s=i?-1:1,Qu=mk2(),Ql=mk2();buildArm(sp,s,Qu,Ql,hi,false);const sg=new T.Group();sg.position.copy(SH[i]);U.add(sg);mesh(Qu.b,sg);const eg=new T.Group();eg.position.set(0,-L1,0);sg.add(eg);mesh(Ql.b,eg);F.sh.push(sg);F.el.push(eg)});
  // רגליים
  F.th=[];F.sn=[];[0,1].forEach(i=>{const s=i?-1:1,Q=mk2();buildLeg(sp,Q,hi,false);const th=new T.Group();th.position.set(s*.15,HY,0);g.add(th);const sn=new T.Group();sn.position.y=-.85;th.add(sn);mesh(Q.b,sn);F.th.push(th);F.sn.push(sn)});
  // כלי נגינה
  if(instr){F.inst=INSTR.make(instr,{lod:hi?1:0});U.add(F.inst);F.pose='play'}
  F.role=sp.role;F.sing=kind=='levite'&&instr!='chalil'?(F.role=='singer'?1:.6):0;if(kind=='levite'&&!instr&&F.role!='guard')F.pose='chest';
  if(kind=='levite'&&F.role=='guard')F.pose='clasp';
  g.userData.fig=F;g.userData.kind=kind;g.scale.setScalar(sp.sc*(o.scale||1));g.userData.sc=sp.sc;
  if(sp.stoop)U.rotation.x=sp.stoop;
  pose(g,o.pose||(F.pose=='stand'?'stand':F.pose));animate(g,0,{});return g}
 function R0(sp){return 1+sp.R()*5}
 function pose(g,name){const F=g.userData.fig;if(!F)return g;F.pose=name;const P=POSE[name]||POSE.stand;if(name!='play'){F.wr[0].set(...P.w[0]);F.wr[1].set(...P.w[1]);F.free[0]=P.free[0];F.free[1]=P.free[1]}else{F.wr[0].set(...POSE.stand.w[0]);F.wr[1].set(...POSE.stand.w[1]);F.free[0]=F.free[1]=0}return g}
 const _o={L:null,R:null},_v=new T.Vector3(),_w=new T.Vector3(),_qs=new T.Quaternion(),_qe=new T.Quaternion();
 /* ---- אנימציה ---- */
 function animate(g,t,st){const F=g.userData.fig;if(!F)return g.userData.animShim&&g.userData.animShim(g,t,st||{});st=st||{};
  const dt=F.lt==null?0:cl(t-F.lt,0,.1);F.lt=t;const wk=st.walk||0,sing=st.sing!=null?st.sing:F.sing,bow=st.bow||0,pl=st.play!=null?st.play:(F.inst?1:0),spd=st.speed!=null?st.speed:2.4*wk,ph0=F.bl;
  F.w+=(wk-F.w)*Math.min(1,dt*7);const w=F.w;if(w>.01||wk>0)F.ph+=dt*TAU*spd/1.8;const ph=F.ph;
  F.pb+=(pl-F.pb)*Math.min(1,dt*5);const pb=F.pb;
  // גוף: נשימה, נדנוד, ניתור הליכה, השתחוויה
  const br=Math.sin(t*1.5+ph0)*.008,bob=Math.abs(Math.sin(ph))*.055*w;
  F.U.position.y=HY+br+bob;F.U.rotation.z=Math.sin(t*.6+ph0)*.012*(1-w)+Math.sin(ph)*.02*w;F.U.rotation.x=(F.sp.stoop||0)+bow*1.0+(w>.05?.03:0);F.U.rotation.y=Math.sin(ph)*.06*w;
  // ראש: סיבוב, הנהון, מצמוץ
  const look=st.look||0,fixed=F.inst&&F.inst.userData.inst.type=='chalil'?.1:1;
  F.head.rotation.y=(look+Math.sin(t*.45+ph0)*.35*(1-w*.7)+Math.sin(t*.17+ph0*2)*.15)*fixed;F.head.rotation.x=-bow*.35+Math.sin(t*.8+ph0)*.03+(sing>.01?Math.abs(Math.sin(t*2.6+ph0))*.05*sing:0);F.head.rotation.z=Math.sin(t*.37+ph0)*.03;
  F.eyes.scale.y=((t+ph0*3)%4.3)<.12?.1:1;
  // פה: הברות בשירה
  const op=sing>.01?Math.max(0,Math.sin(t*7.3+ph0)*Math.sin(t*2.9+ph0*.7))*sing:0;F.mouth.scale.y=.35+op*2.6;F.mouth.scale.x=1-op*.15;
  // רגליים
  for(let i=0;i<2;i++){const fi=ph+i*PI,s=Math.sin(fi);F.th[i].rotation.x=-.42*s*w;F.sn[i].rotation.x=.75*Math.max(0,Math.cos(fi))*w}
  // חצאית: נדנוד + גלי בד
  F.skirt.rotation.x=Math.sin(ph*2)*.03*w;F.skirt.rotation.z=Math.sin(ph)*.025*w;skirtWave(F,t,w,ph);
  // ידיים: יעד שורש כף (מערכת U), נדנוד הליכה, נגינה
  const inst=F.inst&&F.inst.userData.inst;let out=null;if(inst){out=_o;inst.update(t,dt,pl,out);F.inst.updateMatrix()}
  for(let i=0;i<2;i++){_v.copy(F.wr[i]);_v.y-=HY;
   if(F.free[i]){const fi=ph+(i+1)*PI,s=Math.sin(fi);_v.z+=.3*s*w;_v.y+=.04*Math.abs(Math.cos(fi))*w;_v.x+=Math.sin(t*.7+ph0+i)*.012}
   else if(F.pose!='play'){_v.x+=Math.sin(t*.6+ph0+i*2)*.008;_v.y+=Math.sin(t*1.5+ph0)*.006}
   if(out&&pb>.005){const q=i?out.R:out.L;_w.set(q[0],q[1],q[2]).applyMatrix4(F.inst.matrix);_v.lerp(_w,pb)}
   ik(SH[i],_v,POLE[i],_qs,_qe);F.sh[i].quaternion.copy(_qs);F.el[i].quaternion.copy(_qe)}
  return g}
 function skirtWave(F,t,w,ph){F.fc=(F.fc||0)+1;if(w<.02&&F.fc%4)return;const p=F.skm.geometry.attributes.position,b=F.skBase,top=HY+.1,n=p.count;let any=w>.02;const bz=Math.sin(t*1.1+F.bl)*.004;
  for(let i=0;i<n;i++){const o=i*3,y=b[o+1];if(y>top){if(F._sw){p.array[o]=b[o];p.array[o+1]=y;p.array[o+2]=b[o+2]}continue}
   const f=cl((top-y)/top,0,1),ff=f*f,x=b[o],z=b[o+2],a=Math.atan2(x,z);
   p.array[o]=x*(1+ff*(.01*Math.sin(t*1.3+a*3+F.bl)+.035*w*Math.sin(ph*2+a)));p.array[o+1]=y;p.array[o+2]=z+ff*(.16*w*Math.sin(ph-.6)+bz)+z*ff*.04*w*Math.cos(ph*2)}
  F._sw=true;p.needsUpdate=true}
 /* ---- כהן: עוטף את priest() (people.js) + תנועת כללית ---- */
 function makePriest(variant,o){const k=typeof variant=='string'&&'kgy'.indexOf(variant)>=0&&variant.length==1?variant:'k';const p=typeof mkPriest!='undefined'&&mkPriest?mkPriest(k,o.pose||'idle',o.hair):new T.Group();p.userData.kind='priest';
  let lt=null,ph=0;p.userData.animShim=(g,t,st)=>{const dt=lt==null?0:cl(t-lt,0,.1);lt=t;const w=st.walk||0;ph+=dt*TAU*(st.speed!=null?st.speed:2.4*w)/1.8;g.position.y=(g.userData.baseY||0)+Math.abs(Math.sin(ph))*.07*w;g.rotation.z=Math.sin(ph)*.035*w+Math.sin(t*.6)*.01*(1-w);g.rotation.x=(st.bow||0)*.8;return g};return p}
 /* ---- גיאומטריה לקהל (מופעים): robe=בגד (לבן+אפור), head=שאר ---- */
 const KMAP={man:'israelite',woman:'woman',kohen:'priest',levi:'levite',sage:'elder',sit:'elder',child:'child',israelite:'israelite',elder:'elder',levite:'levite',guard:'levite',priest:'priest'};
 const _cache={};
 function crowdGeometry(kind,variant,o){o=o||{};const key=kind+'|'+variant+'|'+(o.instr||'')+'|'+(o.hi?1:0)+'|'+(o.hair!=null?o.hair:'')+'|'+(o.baked?1:0)+'|'+(o.pose||'');if(_cache[key])return _cache[key];
  const sit=kind=='sit',k=KMAP[kind]||'israelite',v=variant==null?0:variant,sp=specFor(k,v,o),hi=!!o.hi,cc=!o.baked,Hd=FGB(),Rb=o.baked?Hd:FGB(),m4=new T.Matrix4(),dy=sit?-.75:0,mT=new T.Matrix4().makeTranslation(0,dy,0);
  const mix=(g,h,m)=>{Rb.addG(g.geo(),m);Hd.addG(h.geo(),m)};
  const pair=()=>{const a=FGB(),b=FGB();return{g:a,h:b,a,b}};
  {const Q=pair();buildTorso(sp,Q,hi,cc);mix(Q.a,Q.b,mT)}
  if(sit){   // חכם יושב: כתונת עד הישיבה, ירכיים וברכיים קדימה
   Rb.add(lat([[.42,.05],[.4,.6],[.37,1.12]],9),0xffffff,0,0,0,1,1,sp.zs);Rb.add(new T.BoxGeometry(.8,.3,1),0xffffff,0,.2,.52);
   [-1,1].forEach(s=>{Rb.add(new T.BoxGeometry(.26,1.15,.3),0xffffff,s*.22,-.52,1.0);Hd.add(new T.BoxGeometry(.2,.08,.4),sp.skin,s*.22,-1.08,1.12)})}
  else{const Q=pair();buildSkirt(sp,Q,hi,cc);mix(Q.a,Q.b,new T.Matrix4());
   [-1,1].forEach(s=>{const Ql=pair();buildLeg(sp,Ql,hi,true);Hd.addG(Ql.b.geo(),new T.Matrix4().makeTranslation(s*.15,.85,0))})}
  {const Q=pair();buildHead(sp,Q,null,null,hi,cc,false);const mh=new T.Matrix4().makeTranslation(0,dy,0);if(sp.hs!=1){const a=new T.Matrix4().makeTranslation(0,2.74,0),b=new T.Matrix4().makeScale(sp.hs,sp.hs,sp.hs),c=new T.Matrix4().makeTranslation(0,-2.74,0);mh.multiply(a).multiply(b).multiply(c)}mix(Q.a,Q.b,mh)}
  // זרועות בתנוחת מנוחה (או נגינה)
  const instr=o.instr||(k=='levite'&&INSTR.TYPES.indexOf(String(v))>=0?v:null);let W=[[.46,1.58,.1],[-.46,1.58,.1]];if(sit)W=[[.3,.98,.75],[-.3,.98,.75]];else if(o.pose&&POSE[o.pose])W=POSE[o.pose].w.map(a=>a.slice());
  if(instr){const hh=INSTR.crowdHands(instr);W=[hh.L,hh.R]}
  const qs=new T.Quaternion(),qe=new T.Quaternion(),E=new T.Vector3();
  [0,1].forEach(i=>{const s=i?-1:1,Qu=pair(),Ql=pair();buildArm(sp,s,Qu,Ql,hi,cc);const Sa=new T.Vector3(i?-.36:.36,2.62+dy,0),Wa=new T.Vector3(W[i][0],W[i][1],W[i][2]);ik(Sa,Wa,POLE[i],qs,qe,E);
   const mU=new T.Matrix4().compose(Sa,qs,new T.Vector3(1,1,1)),mL=mU.clone().multiply(new T.Matrix4().compose(new T.Vector3(0,-L1,0),qe,new T.Vector3(1,1,1)));mix(Qu.a,Qu.b,mU);mix(Ql.a,Ql.b,mL)});
  if(instr)INSTR.addTo(Hd,instr);
  const out={robe:Rb.geo(),head:o.baked?null:Hd.geo(),baked:!!o.baked};out.tris=((out.robe?out.robe.attributes.position.count:0)+(out.head?out.head.attributes.position.count:0))/3;out.sc=sp.sc;return _cache[key]=out}
 const crowdPalette=kind=>(PALS[KMAP[kind]||kind]||WOOLS).slice();
 const stats=g=>{let tris=0,meshes=0;g.traverse(o=>{if(o.isMesh&&o.geometry){meshes++;const a=o.geometry.attributes.position;tris+=(o.geometry.index?o.geometry.index.count:a.count)/3}});return{tris:Math.round(tris),meshes}};
 return{make,pose,animate,crowdGeometry,crowdPalette,stats,POSE,KINDS:['israelite','woman','elder','child','levite','guard','priest'],mat:mFig,specFor,texFromImage:false}
})();
