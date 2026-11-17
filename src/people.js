/* ================= כהנים ולויים – גיאומטריה ממוזגת (קפלים, פנים, זקן, ידיים) וצבעים דגומים מהסרטון ================= */
const PRIESTS=[];let mkPriest=null,ambUpdate=null;   // mkPriest: מוצא את priest() החוצה (לנגן סדרי העבודה, services.js)
{let _qp=41;const rp=()=>(_qp=_qp*16807%2147483647)/2147483647;   // מחולל מקומי (לא נוגע ב-rand הגלובלי)
 const _o=new T.Object3D(),_up=new T.Vector3(0,1,0);
 // אוסף גיאומטריות לרשת אחת עם צבעי קודקודים
 function PB(){const P=[],N=[],U=[],C=[];
  const put=(geo,col,mat)=>{const g=geo.index?geo.toNonIndexed():geo.clone();g.applyMatrix4(mat);const p=g.attributes.position,n=g.attributes.normal,u=g.attributes.uv,c=new T.Color(col);
   for(let i=0;i<p.count;i++){P.push(p.getX(i),p.getY(i),p.getZ(i));N.push(n.getX(i),n.getY(i),n.getZ(i));U.push(u?u.getX(i):0,u?u.getY(i):0);C.push(c.r,c.g,c.b)}};
  return{n:()=>P.length,
   add(geo,col,x=0,y=0,z=0,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0){_o.position.set(x,y,z);_o.rotation.set(rx,ry,rz);_o.scale.set(sx,sy,sz);_o.updateMatrix();put(geo,col,_o.matrix)},
   limb(a,b,r1,r2,col,seg=8){const d=new T.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),L=d.length();_o.position.set((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);_o.quaternion.setFromUnitVectors(_up,d.normalize());_o.scale.set(1,1,1);_o.updateMatrix();put(new T.CylinderGeometry(r2,r1,L,seg),col,_o.matrix)},
   geo(){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('normal',new T.Float32BufferAttribute(N,3));g.setAttribute('uv',new T.Float32BufferAttribute(U,2));g.setAttribute('color',new T.Float32BufferAttribute(C,3));return g}}}
 // קפלי בד: הטיית הרדיוס סביב ההיקף
 const pleat=(g,n,amp)=>{const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),y=p.getY(i),k=1+amp*Math.sin(Math.atan2(z,x)*n+y*1.7);p.setX(i,x*k);p.setZ(i,z*k)}g.computeVertexNormals();return g};
 /* --- חומרים וטקסטורות --- */
 const LIN=0xdfd9c7,SKIN=0xc99673,BLUE=0x2f86b0,GEM=['#d0463c','#e8a838','#58b868','#46b8b0','#4a6aa8','#ecebe6','#c8a878','#a8b0b8','#9a58b0','#38a090','#4080c0','#8a5a48'];   // י״ב אבני החושן
 const tBelt=cv(128,32,(c,w,h)=>{c.fillStyle='#8a4a4f';c.fillRect(0,0,w,h);for(let x=0;x<w;x+=16){c.fillStyle='#c98a82';c.beginPath();c.moveTo(x+8,4);c.lineTo(x+14,16);c.lineTo(x+8,28);c.lineTo(x+2,16);c.closePath();c.fill();c.fillStyle='#5a2a2e';c.fillRect(x+7,13,3,6)}c.fillStyle='#5a2a2e';c.fillRect(0,0,w,3);c.fillRect(0,h-3,w,3)});
 const tLion=cv(96,96,(c,w,h)=>{c.fillStyle='#6a3236';c.fillRect(0,0,w,h);c.fillStyle='#3d1a1f';for(let j=0;j<3;j++)for(let i=0;i<3;i++){const x=i*32+16,y=j*32+18;c.beginPath();c.ellipse(x,y+4,9,5,0,0,6.3);c.fill();c.beginPath();c.arc(x+9,y-3,4.5,0,6.3);c.fill();c.fillRect(x-8,y+6,2.5,8);c.fillRect(x+4,y+6,2.5,8);c.fillRect(x-14,y-2,6,2)}});
 const tHoshen=cv(96,128,(c,w,h)=>{c.fillStyle='#d9a93a';c.fillRect(0,0,w,h);for(let r=0;r<4;r++)for(let q=0;q<3;q++){c.fillStyle='#9a7420';c.fillRect(q*32+3,r*32+3,27,27);c.fillStyle=GEM[r*3+q];c.fillRect(q*32+5,r*32+5,23,23);c.fillStyle='rgba(255,255,255,.35)';c.fillRect(q*32+7,r*32+7,8,6)}});
 const mV=mk(0xffffff,{vertexColors:true,roughness:.92,side:T.DoubleSide}),mBeltM=mk(0xffffff,{map:tBelt,roughness:.85,side:T.DoubleSide}),mBeltL=mk(0xf3eede,{roughness:.9,side:T.DoubleSide}),
  mLionM=mk(0xffffff,{map:tLion,roughness:.9}),mHosM=mk(0xffffff,{map:tHoshen,roughness:.35,metalness:.4,emissive:0x2a2010}),mGld=M.gold,
  mSlv=mk(0xdde1e6,{metalness:.7,roughness:.28,emissive:0x23262a});
 /* --- טקסטורות הכהן (17.11): מצוירות בקנבס בקוד – פשתן כמכפיל + אבנט רקום; בלי תמונות raster ובלי data-URI (נטפרי) --- */
 const _ctex=(w,h,f,rx,ry)=>{const t=cv(w,h,f);t.wrapS=t.wrapT=T.MirroredRepeatWrapping;t.repeat.set(rx,ry);return t};
 let _sd=7;const _rn=()=>{_sd=(_sd*16807)%2147483647;return _sd/2147483647};
 const _tLin=_ctex(128,128,(g,w,h)=>{g.fillStyle='#f6f3ec';g.fillRect(0,0,w,h);
  for(let y=0;y<h;y+=2){g.fillStyle='rgba(120,105,80,'+(.05+_rn()*.07)+')';g.fillRect(0,y,w,1)}
  for(let x=0;x<w;x+=2){g.fillStyle='rgba(120,105,80,'+(.04+_rn()*.06)+')';g.fillRect(x,0,1,h)}
  for(let i=0;i<60;i++){g.fillStyle='rgba(255,255,255,.35)';g.fillRect(_rn()*w,_rn()*h,2+_rn()*6,1)}},2,2);
 const _tBlt=_ctex(256,128,(g,w,h)=>{g.fillStyle='#e9e0cb';g.fillRect(0,0,w,h);
  for(let y=0;y<h;y+=2){g.fillStyle='rgba(110,95,70,.07)';g.fillRect(0,y,w,1)}
  const y0=22,y1=106;g.fillStyle='#b3261e';g.fillRect(0,y0,w,y1-y0);                       // תולעת שני
  g.fillStyle='#d9b45a';g.fillRect(0,y0,w,3);g.fillRect(0,y1-3,w,3);                      // חוטי זהב בשוליים
  for(let x=0;x<w;x+=32){                                                                  // מעויינים: תכלת וארגמן
   g.fillStyle='#2f5fa8';g.beginPath();g.moveTo(x+16,y0+8);g.lineTo(x+30,64);g.lineTo(x+16,y1-8);g.lineTo(x+2,64);g.closePath();g.fill();
   g.fillStyle='#6a3a8a';g.beginPath();g.moveTo(x+16,y0+22);g.lineTo(x+23,64);g.lineTo(x+16,y1-22);g.lineTo(x+9,64);g.closePath();g.fill();
   g.fillStyle='#e9e0cb';g.fillRect(x+14,60,4,8)}},2,1);
 const mP=mk(0xffffff,Object.assign({vertexColors:true,roughness:.93,side:T.DoubleSide},_tLin?{map:_tLin}:{})),
  mBeltP=_tBlt?mk(0xffffff,{map:_tBlt,roughness:.88,side:T.DoubleSide}):mBeltM,mFrg=mk(0xece6d6,{roughness:.95,side:T.DoubleSide});
 /* --- כהן: kind = k הדיוט (ארבעה בגדי לבן), g כהן גדול (שמונה בגדים), y כהן גדול ביום הכיפורים (ארבעה בגדי לבן); pose = idle|tray|basket|rake|wave|trumpet --- */
 const POSES={idle:[[-.36,2.62,0],[-.46,2.05,.12],[-.18,1.75,.36],[.36,2.62,0],[.46,2.05,.12],[.18,1.75,.36]],
   tray:[[-.36,2.62,0],[-.46,2.1,.22],[-.28,2.3,.62],[.36,2.62,0],[.46,2.1,.22],[.28,2.3,.62]],
   basket:[[-.36,2.62,0],[-.54,2.8,.1],[-.34,3.35,.22],[.36,2.62,0],[.54,2.8,.1],[.34,3.35,.22]],
   rake:[[-.36,2.62,0],[-.4,2.25,.3],[-.14,2.2,.59],[.36,2.62,0],[.45,1.95,.25],[-.04,1.7,.67]],
   wave:[[-.36,2.62,0],[-.46,2.05,.12],[-.18,1.75,.36],[.36,2.62,0],[.64,2.95,.1],[.5,3.5,.2]],
   trumpet:[[-.36,2.62,0],[-.4,2.3,.32],[-.08,2.72,.5],[.36,2.62,0],[.4,2.3,.32],[.08,2.72,.5]],
   hold:[[-.36,2.62,0],[-.42,2.2,.28],[-.2,2.15,.6],[.36,2.62,0],[.42,2.2,.28],[.2,2.15,.6]],
   rh:[[-.36,2.62,0],[-.5,2.25,.28],[-.34,2.3,.74],[.36,2.62,0],[.46,2.05,.12],[.18,1.75,.36]],
   lh:[[-.36,2.62,0],[-.46,2.05,.12],[-.18,1.75,.36],[.36,2.62,0],[.5,2.25,.28],[.34,2.3,.74]],
   both:[[-.36,2.62,0],[-.4,2.3,.38],[-.22,2.0,.8],[.36,2.62,0],[.4,2.3,.38],[.22,2.0,.8]],
   up:[[-.36,2.62,0],[-.5,3.0,.15],[-.3,3.55,.2],[.36,2.62,0],[.5,3.0,.15],[.3,3.55,.2]],
   low:[[-.36,2.62,0],[-.45,2.0,.25],[-.22,1.62,.55],[.36,2.62,0],[.45,2.0,.25],[.22,1.62,.55]],
   high:[[-.36,2.62,0],[-.46,2.05,.12],[-.18,1.75,.36],[.36,2.62,0],[.55,2.85,.3],[.4,3.2,.75]]};   // תנוחות זרועות: [כתף, מרפק, שורש כף] שמאל (x<0) וימין (x>0); נוספו hold/rh/lh/both/up/low/high לנגן סדרי העבודה
 /* מדל מעודכן 17.11 לפי גיליון הדמות של Gemini (assets/priest-ref/): כתונת עד הקרסול (הוארכה 17.11 לפי הלכה, בהחלטת משה) עם מכנסיים נראים בקושי, מגבעת חרוט מלופפת בספירלה, אבנט רקום מתמונה, פנים/זקן/פיאות מסולסלות, כפות רגליים. צבעים דגומים: פשתן #e3dfd6, עור #c08c74, זקן #3a261d. */
 const PLIN=0xe4e0d5,PTRO=0xdcd8cc,PSKIN=0xc08c74,PCAP=0xe9e5da;
 // מגבעת כרוכה: חרוט (פרופיל קמור קלות) עם פס בד ספירלי – כל "כריכה" מבליטה מדרגה קטנה
 function wcap(R0,H,turns){const pts=[];for(let i=0;i<=26;i++){const t=i/26;pts.push(new T.Vector2(Math.max(.006,R0*Math.pow(1-t,.86)),H*t))}
  const g=new T.LatheGeometry(pts,44),p=g.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),t=y/H,th=Math.atan2(z,x),s=((t*turns-th/6.2832)%1+1)%1,k=1+.085*s*(1-.5*t);p.setX(i,x*k);p.setZ(i,z*k)}
  g.computeVertexNormals();return g}
 // קצה אבנט תלוי: מישור ש-UV שלו לאורך הרצועה (הדוגמה רצה לאורך הקצה)
 function beltTail(W,Ln){const g=new T.PlaneGeometry(W,Ln),p=g.attributes.position,u=g.attributes.uv;for(let i=0;i<p.count;i++){u.setXY(i,(p.getY(i)/Ln+.5)*Ln/2.55,.19+.62*(p.getX(i)/W+.5))}return g}
 function priest(kind,pose,beard){pose=pose||'idle';const hp=kind!='k',gold=kind=='g',B=PB(),G=PB(),S=PB(),g=new T.Group();
  const HAIR=beard!=null?beard:({k:0x3a261d,g:0xd8d8d6,y:0xb4b4b2})[kind];
  const mesh=(P,mat,sh=true)=>{if(!P.n())return;const m=new T.Mesh(P.geo(),mat);m.castShadow=sh;g.add(m);return m};
  // רגליים: כפות יחפות (אליפסואיד + עקב), קרסול, מכנסי פשתן צרים מתחת לכתונת
  [-.15,.15].forEach(o=>{B.add(new T.SphereGeometry(.1,10,8),PSKIN,o,.055,.1,.9,.5,2.0);B.add(new T.SphereGeometry(.07,8,6),PSKIN,o,.09,-.07,1,1.1,1);B.add(new T.CylinderGeometry(.052,.058,.14,8),PSKIN,o,.14,0);
   B.add(new T.CylinderGeometry(.118,.13,.5,12),PTRO,o,.38,0)});
  // כתונת: גוף אחד (חזה+חצאית) מצווארון עד הקרסול, קפלים אנכיים (שני תדרים) ותפיחה מעל האבנט
  {const tg=new T.LatheGeometry([[.53,.22],[.515,.3],[.5,.6],[.48,.95],[.455,1.3],[.43,1.6],[.415,1.8],[.43,1.98],[.405,2.14],[.375,2.38],[.33,2.58],[.27,2.69]].map(a=>new T.Vector2(a[0],a[1])),32);pleat(pleat(tg,10,.035),23,.012);B.add(tg,PLIN)}
  B.add(new T.SphereGeometry(.27,16,8),PLIN,0,2.69,0,1,.34,1);[-1,1].forEach(s=>B.add(new T.SphereGeometry(.14,10,8),PLIN,s*.34,2.62,0));   // חזה וכתפיים
  B.add(new T.CylinderGeometry(.085,.1,.18,8),PSKIN,0,2.74,0);B.add(new T.TorusGeometry(.125,.024,6,16),PLIN,0,2.7,0,1,1,1,Math.PI/2,0,0);   // צוואר וצווארון עגול
  // ראש: פנים, אף, עיניים (לובן+אישון), גבות, אוזניים, שפם, זקן מלא, פיאות מסולסלות
  B.add(new T.SphereGeometry(.205,18,14),PSKIN,0,2.93,.01,1,1.1,.97);B.add(new T.SphereGeometry(.045,8,6),PSKIN,0,2.915,.2,.95,1.5,1.2);
  [-1,1].forEach(s=>{B.add(new T.SphereGeometry(.024,8,6),0xf2ece0,s*.08,2.975,.18,1.2,.8,.7);B.add(new T.SphereGeometry(.017,6,5),0x1a1410,s*.08,2.975,.2);
   B.add(new T.BoxGeometry(.1,.024,.03),HAIR,s*.08,3.022,.185,1,1,1,0,0,-s*.14);B.add(new T.SphereGeometry(.05,6,5),PSKIN,s*.21,2.93,0);
   B.add(new T.SphereGeometry(.075,8,6),HAIR,s*.135,2.81,.08,.8,1.3,.9);B.add(new T.SphereGeometry(.06,8,6),HAIR,s*.045,2.86,.205,1.35,.55,.6);   // לחי וחצי שפם
   for(let i=0;i<5;i++)B.add(new T.SphereGeometry(.032,6,5),HAIR,s*(.2+(i%2?.013:-.008)),2.9-.055*i,.05+(i%2)*.012)});   // פיאה: ספירלת תלתלים
  B.add(new T.SphereGeometry(.2,16,12),HAIR,0,2.7,.11,1,1.0,.85);B.add(new T.SphereGeometry(.11,10,8),HAIR,0,2.52,.16,1,1.15,.8);B.add(new T.BoxGeometry(.06,.014,.02),0x6a3a34,0,2.83,.205);
  B.add(new T.SphereGeometry(.2,12,8),HAIR,0,3.0,-.06,1,.8,.85);   // שיער בעורף
  if(hp){                                                                                                                                 // כהן גדול: מצנפת רחבה ונמוכה
   [[.23,.085,3.1],[.2,.08,3.19],[.14,.075,3.27]].forEach(([R,r,y])=>{B.add(new T.TorusGeometry(R,r,8,22),0xf6f1e4,0,y,0,1,1,1,Math.PI/2,0,0)});B.add(new T.SphereGeometry(.17,12,8),0xf6f1e4,0,3.31,0,1,.7,1);
   if(gold){G.add(new T.BoxGeometry(.34,.1,.025),0xf0c040,0,3.1,.3);B.add(new T.TorusGeometry(.305,.013,6,24),BLUE,0,3.0,0,1,1,1,Math.PI/2,0,0)}}                  // ציץ הזהב ופתיל תכלת
  else B.add(wcap(.245,.64,7),PCAP,0,3.06,-.01);   // כהן הדיוט: מגבעת חרוט מלופפת בספירלה (9 כריכות)
  // מעיל תכלת, אפוד (סינר רקום), חושן עם י״ב אבנים, כתפיות עם אבני שהם, פעמונים ורימונים
  if(gold){B.add(pleat(new T.CylinderGeometry(.40,.62,1.6,28,6,true),13,.04),BLUE,0,1.65,0);
   rep(18,i=>{const a=i*Math.PI/9;const pm=i%2;if(pm)G.add(new T.SphereGeometry(.055,8,6),0xf0c040,Math.sin(a)*.64,.86,Math.cos(a)*.64);else B.add(new T.SphereGeometry(.07,8,6),[0x2457b8,0x7a3a9a,0xc0392b][i/2%3|0],Math.sin(a)*.64,.86,Math.cos(a)*.64)});
   [-1,1].forEach(s=>{G.add(new T.BoxGeometry(.2,.07,.36),0xf0c040,s*.28,2.74,0,1,1,1,0,0,-s*.18);B.add(new T.SphereGeometry(.065,8,6),0x23201c,s*.3,2.8,.06)})}
  // זרועות לפי תנוחה: [כתף שמאל, מרפק, שורש כף, כתף ימין, מרפק, שורש כף] – שרוולים רחבים מעט, כף יד אליפטית
  const PO=POSES[pose]||POSES.idle;
  [0,3].forEach(k=>{const s=PO[k],e=PO[k+1],w=PO[k+2];B.limb(s,e,.125,.115,PLIN);B.limb(e,w,.118,.1,PLIN);B.add(new T.SphereGeometry(.115,10,8),PLIN,e[0],e[1],e[2]);B.add(new T.SphereGeometry(.082,10,8),PSKIN,w[0],w[1],w[2],.9,1.05,1.2)});
  if(pose=='tray'){S.add(new T.CylinderGeometry(.52,.46,.07,22),0xdde1e6,0,2.3,.68);rep(5,i=>B.add(new T.SphereGeometry(.1,8,6),[0xc0392b,0xe8a838,0x7a3a9a,0x58b868,0xc0392b][i],Math.cos(i*1.26)*.24,2.42,.68+Math.sin(i*1.26)*.24))}
  if(pose=='basket'){B.add(new T.SphereGeometry(.5,14,8),0xb98a4a,0,3.4,.24,1,.55,1);rep(7,i=>B.add(new T.SphereGeometry(.1,8,6),[0xc0392b,0xe8a838,0x7a3a9a,0x58b868,0xd0463c,0xe8a838,0x58b868][i],Math.cos(i*.9)*.28,3.68,.24+Math.sin(i*.9)*.28))}
  if(pose=='rake'){B.limb([-.25,2.75,.5],[.3,.02,.95],.035,.035,0x7a5a38,6);S.add(new T.BoxGeometry(.5,.04,.38),0x555a60,.3,.05,1.0)}
  if(pose=='wave'){B.add(new T.SphereGeometry(.17,10,8),0xa8403a,.5,3.64,.22,1,1.3,.9);B.limb([.5,3.5,.2],[.5,3.78,.22],.03,.03,0xe8e0d0,5)}
  if(pose=='trumpet'){S.limb([0,2.82,.46],[0,3.0,2.3],.035,.035,0xdde1e6,6);S.add(new T.ConeGeometry(.22,.55,12),0xdde1e6,0,3.02,2.45,1,1,1,Math.PI/2,0,0)}
  mesh(B,mP);mesh(G,mGld);mesh(S,mSlv);
  // אבנט: רצועה רקומה (טקסטורה מהתמונה) כרוכה בגובה המותן, קשר וקצוות תלויים עם ציציות (הכהן הגדול ביום הכיפורים – פשתן לבן)
  {const bm=kind=='y'?mBeltL:mBeltP,bl=new T.Mesh(new T.CylinderGeometry(.445,.445,.24,36,1,true),bm);bl.position.set(0,1.93,0);bl.castShadow=true;g.add(bl);
   const kn=new T.Mesh(new T.SphereGeometry(.085,10,8),bm);kn.scale.set(1.25,.9,.75);kn.position.set(.06,1.9,.45);g.add(kn);
   [[.12,.05,.88,-.05],[.0,-.04,.7,.06]].forEach(([x,r,Ln,tz])=>{const t=new T.Group();t.position.set(x,1.9,.5);t.rotation.set(-.1,0,r);
    const pl=new T.Mesh(beltTail(.16,Ln),bm);pl.position.y=-Ln/2;t.add(pl);const fr=new T.Mesh(new T.BoxGeometry(.16,.07,.012),mFrg);fr.position.y=-Ln-.025;t.add(fr);g.add(t)})}
  if(gold){   // אפוד רקום (סינר אריות) מלפנים ומאחור, וחושן על החזה
   [1,-1].forEach(s=>{const a=new T.Mesh(new T.BoxGeometry(.62,1.25,.04),mLionM);a.position.set(0,1.42,s*.57);a.rotation.x=-s*.137;g.add(a)});
   const hf=new T.Mesh(new T.BoxGeometry(.6,.66,.05),mGld);hf.position.set(0,2.32,.46);g.add(hf);const hs=new T.Mesh(new T.PlaneGeometry(.5,.58),mHosM);hs.position.set(0,2.32,.49);g.add(hs)}
  return g}
 mkPriest=priest;priest.POSES=POSES;
 /* --- הלוי: מעיל בז' פסים עם סרגל אדום, כתונת לבנה, אבנט אדום, טורבן שמנת עם כיפה אדומה (כבסרטון) --- */
 function levite(hair){const B=PB();
  [-.14,.14].forEach(o=>{B.add(new T.BoxGeometry(.15,.07,.34),SKIN,o,.035,.06)});
  B.add(pleat(new T.CylinderGeometry(.40,.54,1.75,24,5),9,.03),0xb8966a,0,.92,0);B.add(new T.CylinderGeometry(.31,.40,.95,20,2),0xb8966a,0,2.22,0);
  B.add(new T.BoxGeometry(.3,2.2,.03),0xf1ece0,0,1.5,.5);[-1,1].forEach(s=>B.add(new T.BoxGeometry(.04,2.2,.04),0x7a2a22,s*.17,1.5,.5));   // כתונת לבנה וסרגל אדום מלפנים
  B.add(new T.CylinderGeometry(.43,.43,.3,20,1,true),0x4a1512,0,1.86,0);
  [-1,1].forEach(s=>{B.limb([s*.36,2.62,0],[s*.46,2.05,.12],.115,.1,0xb8966a);B.limb([s*.46,2.05,.12],[s*.2,1.75,.36],.1,.085,0xf1ece0);B.add(new T.SphereGeometry(.085,8,6),SKIN,s*.2,1.75,.36)});
  B.add(new T.CylinderGeometry(.085,.1,.18,8),SKIN,0,2.74,0);B.add(new T.SphereGeometry(.21,14,10),SKIN,0,2.93,.01,1,1.1,1);B.add(new T.SphereGeometry(.2,10,8),hair,0,2.7,.11,1,1.45,.65);
  [-1,1].forEach(s=>B.add(new T.SphereGeometry(.026,6,5),0x1a1410,s*.08,2.97,.185));
  B.add(new T.TorusGeometry(.22,.09,8,20),0xe8dcc0,0,3.1,0,1,1,1,Math.PI/2,0,0);B.add(new T.SphereGeometry(.15,12,8),0x8a2a22,0,3.15,0,1,.8,1);
  return B.geo()}
 const LEV=[],WALK=[],TRUMP=[];let SHOFAR=null;
 const mkL=(hair,pl)=>{const im=new T.InstancedMesh(levite(hair),mV,pl.length);pl.forEach((p,i)=>{_o.position.set(p[0],p[1],p[2]);_o.rotation.set(0,p[3],0);_o.scale.setScalar(1);_o.updateMatrix();im.setMatrixAt(i,_o.matrix)});im.castShadow=true;im.frustumCulled=false;gA.add(im);const ent={im,pl,fr:new Set()};LEV.push(ent);
  if(typeof NPCS!='undefined')[1,Math.min(5,pl.length-1)].forEach(i=>{const n={id:'levi-dukhan-'+LEV.length+'-'+i,kind:'levi',who:'לוי על מעלות הדוכן – משורר בשעת הנסכים (משנה תמיד ז:ג; ערכין ב:ו)',active:false,job:()=>'עומד על הדוכן ושר על הקרבן (בנסכים)',getPos:()=>new T.Vector3(pl[i][0],pl[i][1],pl[i][2]),pick:{inst:im,index:i},freeze:on=>{on?ent.fr.add(i):ent.fr.delete(i)},face:v=>{pl[i][3]=Math.atan2(v.x-pl[i][0],v.z-pl[i][2])},extra:{instance:{index:i}}};(ent.ns||(ent.ns=[])).push(n);NPCS.register(n)})};
 {const a=[],b=[];[[-1.5,15.0],[-2.5,15.5]].forEach(([x,y],r)=>{for(let z=-118+r*2.1,i=0;z<4;z+=4.2,i++){if(Math.abs(z-ZC)<7)continue;(i%2?a:b).push([x,y,z,-Math.PI/2])}});   // שתי שורות לויים על מעלות הדוכן, פניהם למערב
  mkL(0x3a2a1e,a);mkL(0xcfcfcd,b);lbl('לויים על הדוכן – שירה על הקרבן',-2,YA+5.5,ZC-40,'azarah',120)}
 /* --- הצבת הכהנים --- */
 const walkJob=w=>{const C=typeof CROWD!='undefined'?CROWD.S:null,d=C?C.day:'chol';
  if(w.k=='y')return w.holding?'קורא בתורה בעמידה בעזרה (יומא ז:א)':'עובד עבודת יום הכיפורים בבגדי לבן';
  if(w.k=='g')return d=='yk'?'מקריב את תמיד של שחר בבגדי זהב (יומא ג:ד–ו)':'כהן גדול בבגדי זהב – עולה בכבש ומקריב (תמיד ז:ג)';
  return 'מהלך בעזרה בין עבודות הכהנים'};
 /* כהנים מהלכים בעזרה (לא עומדים במקום): כהן הדיוט, כהן גדול בשמונה בגדים, וכהן גדול ביום הכיפורים – מופיעים רק בזמנים המתאימים (ambUpdate) */
 [['k','כהן הדיוט – ארבעה בגדי לבן',0,3.1],['g','כהן גדול – שמונה בגדים',.34,2.8],['y','כהן גדול ביום הכיפורים – ארבעה בגדי לבן',.67,2.9]].forEach(([k,t,f,sp])=>{const p=priest(k);gA.add(p);const lb=lbl(t,0,YA+5,0,'azarah',70),w={p,k,lb,f,sp,yaw:0};WALK.push(w);
  if(typeof NPCS!='undefined')w.npc=NPCS.register({id:'walk-'+k,kind:k=='k'?'kohen':'kohen-gadol',who:t,active:false,job:()=>walkJob(w),getPos:()=>p.position.clone(),pick:{obj:p},freeze:on=>{w.frozen=!!on},face:v=>{w.yaw=Math.atan2(v.x-p.position.x,v.z-p.position.z);p.rotation.y=w.yaw},extra:{gold:k=='g',white:k=='y'}})});
 // כהנים בפעולה: נושא מנחה בכבש, מגרף דשן על המזבח, מניף נתח, שני מחצצרים על הדוכן
 {const rampY=z=>YA+9*(2.7-z)/30.7;   // כבש 16 רחב, מ-z=2.7 (גובה הרצפה) עד z=-28 (גובה ראש המזבח, 9 אמות)
  const reg1=(p,id,k,who,job)=>{if(typeof NPCS!='undefined')NPCS.register({id,kind:k,who,active:true,job:()=>job,getPos:()=>p.position.clone(),pick:{obj:p},freeze:on=>{p.userData.frozen=!!on},face:v=>{p.rotation.y=Math.atan2(v.x-p.position.x,v.z-p.position.z)},extra:{}})};
  let p=priest('k','basket',0x2b2018);p.position.set(-29,rampY(-12),-12);p.rotation.y=Math.PI;gA.add(p);lbl('כהן עולה בכבש ונושא סל מנחה',-29,rampY(-12)+5,-12,'azarah',80);reg1(p,'fixed-basket','kohen','כהן שעולה בכבש עם סל מנחה','עולה בכבש ונושא סל מנחה אל המזבח');
  p=priest('k','rake',0x4a3426);p.position.set(-28,YA+9,-34);p.rotation.y=Math.PI;gA.add(p);lbl('כהן מדשן את המזבח',-28,YA+14,-34,'azarah',80);reg1(p,'fixed-rake','kohen','כהן שמדשן על ראש המזבח (תמיד ב:א)','מגרף את הדשן מראש המזבח');   // הוזז מ-z=-65.5 (שם צף באוויר מצפון למזבח) אל ראש המזבח
  p=priest('k','wave',0x7a3b22);p.position.set(-8.2,YA,-52);p.rotation.y=-Math.PI/2.4;gA.add(p);lbl('כהן מניף',-8.2,YA+5.2,-52,'azarah',70);reg1(p,'fixed-wave','kohen','כהן שמניף נתח (תנופה)','מניף את הנתח בתנופה');
  [-3.4,3.4].forEach((o,i)=>{p=priest('k','trumpet',i?0xb4b4b2:0x3a2a1e);p.position.set(-2.5,YA-.5,ZC+o);p.rotation.y=-Math.PI/2;gA.add(p);TRUMP.push(p);
   if(typeof NPCS!='undefined'){const n=NPCS.register({id:'trump-'+i,kind:'kohen',who:'כהן מחצצר על הדוכן (שתי חצוצרות של כסף – תמיד ז:ג)',active:false,job:()=>'תוקע בחצוצרה בשעת הנסכים',getPos:()=>p.position.clone(),pick:{obj:p},freeze:on=>{p.userData.frozen=!!on},face:v=>{p.rotation.y=Math.atan2(v.x-p.position.x,v.z-p.position.z)},extra:{}});p.userData.npc=n}});lbl('כהנים מחצצרים',-2.5,YA+5,ZC,'azarah',80);
  {const sh=priest('k','hold',0x6a4a30);sh.position.set(-2.5,YA-.5,ZC);sh.rotation.y=-Math.PI/2;sh.visible=false;gA.add(sh);   // ראש השנה: שופר של יעל (פשוט, פיו מצופה זהב) בין שתי החצוצרות – משנה ראש השנה ג:ג
   const hm=new T.Mesh(new T.CylinderGeometry(.06,.1,2.4,7),new T.MeshStandardMaterial({color:0xcfc4a8,roughness:.6}));hm.rotation.x=Math.PI/2;hm.position.set(0,2.95,1.35);sh.add(hm);const gm=new T.Mesh(new T.CylinderGeometry(.075,.075,.3,7),M.gold);gm.rotation.x=Math.PI/2;gm.position.set(0,2.95,.18);sh.add(gm);SHOFAR=sh}}

 /* ---- חיים בעזרה: לויים ומחצצרים רק בזמן השירה והנסכים; כהנים מהלכים בהקפה; הכל בתנועה ---- */
 const LOOP=[[-7,-24],[-7,-62],[-46,-63],[-46,-40],[-46,5.5],[-8,5.5]];   // הקפה בעזרה עוקפת את המזבח והכבש (עם כיוון השעון)
 const SEG=[];let LL=0;LOOP.forEach((a,i)=>{const b=LOOP[(i+1)%LOOP.length],l=Math.hypot(b[0]-a[0],b[1]-a[1]);SEG.push({a,b,l,s:LL});LL+=l});
 const at=s=>{s=((s%LL)+LL)%LL;for(const g of SEG)if(s<=g.s+g.l){const u=(s-g.s)/g.l;return[g.a[0]+(g.b[0]-g.a[0])*u,g.a[1]+(g.b[1]-g.a[1])*u,Math.atan2(g.b[0]-g.a[0],g.b[1]-g.a[1])]}return[LOOP[0][0],LOOP[0][1],0]};
 const angd=(a,b)=>((b-a+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;
 const HOLD_S=33.5;   // נקודת (-7,-57.5) על ההקפה – מקום קריאת כהן גדול בתורה (יומא ז:א)
 ambUpdate=(t,dt)=>{
  const C=typeof CROWD!='undefined'?CROWD.S:null,song=!!(C&&C.song),vis=C?C.vis:{k:false,g:false,y:false};   // התכנון (מי איפה ומתי) נמצא ב-crowd.js
  LEV.forEach(ent=>{const{im,pl,fr}=ent;im.visible=song;if(ent.ns)ent.ns.forEach(n=>n.active=song);if(!song)return;
   for(let i=0;i<pl.length;i++){if(fr.has(i))continue;const q=pl[i],ph=i*1.7+q[2]*.3;
    _o.position.set(q[0],q[1]+Math.abs(Math.sin(t*2.3+ph))*.07,q[2]);_o.rotation.set(0,q[3]+Math.sin(t*.9+ph)*.16,Math.sin(t*1.6+ph)*.04);_o.scale.setScalar(1);_o.updateMatrix();im.setMatrixAt(i,_o.matrix)}
   im.instanceMatrix.needsUpdate=true});
  TRUMP.forEach((p,i)=>{p.visible=song;if(p.userData.npc)p.userData.npc.active=song;if(song&&!p.userData.frozen){p.position.y=YA-.5+Math.abs(Math.sin(t*2+i*2))*.04;p.rotation.z=Math.sin(t*3.1+i)*.03}});
  if(SHOFAR){SHOFAR.visible=!!(C&&C.shofar)}
  WALK.forEach(w=>{const on=!!vis[w.k];w.p.visible=on;if(w.npc)w.npc.active=on;if(w.lb)w.lb.r=on?70:.001;if(!on)return;
   if(w.frozen)return;
   w.s=(w.s==null?w.f*LL:w.s);let adv=w.sp*dt;w.holding=false;
   if(w.k=='y'&&C&&C.walkHold){const cur=((w.s%LL)+LL)%LL;let dd=HOLD_S-cur;if(dd<0)dd=dd<-.05?dd+LL:0;if(dd<=adv){w.s+=dd;adv=0}if(dd<.05||adv==0){w.holding=true;adv=0}}
   w.s+=adv;const[x,z,yw0]=at(w.s),yw=w.holding?Math.PI/2:yw0;w.yaw+=angd(w.yaw,yw)*Math.min(1,dt*3.5);
   const ph=w.s*1.15,bob=w.holding?0:Math.abs(Math.sin(ph))*.08;w.p.position.set(x,YA+bob,z);w.p.rotation.set(0,w.yaw,w.holding?0:Math.sin(ph)*.035);
   if(w.lb){w.lb.x=x;w.lb.y=YA+5;w.lb.z=z}})}
}
