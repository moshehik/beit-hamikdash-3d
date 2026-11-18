/* ================= INSTR – כלי הנגינה של הלווים (גיאומטריה אמיתית בקוד; 20.11.2026) =================
 INSTR.make(type,opts) -> THREE.Group   type: 'kinor' | 'nevel' | 'tziltzal' | 'chalil'
   g.userData.inst = { type, hold:{p:[x,y,z],ry,rx,rz}, update(t,dt,amp,out), rest:{L,R}, mouth:[x,y,z]|null, strings:n }
   hold  = היכן הכלי נמצא ביחס לדמות (מערכת קואורדינטות של הדמות; y=0 בכפות הרגליים; הפנים +z) ובאיזו הטיה.
   update(t,dt,amp,out): מזיז מיתרים/צלחות (amp 0..1 = עוצמת הנגינה) ומחזיר ב-out.L / out.R את מיקום שורשי הכפות (במערכת הכלי).
 INSTR.addTo(B,type,opts) -> ממזג את הכלי (מיתרים כגלילים דקים) ל-FGB B בתנוחת האחיזה (לקהל/מופעים).
 INSTR.crowdHands(type) -> {L:[x,y,z],R:[x,y,z]} מיקומי שורשי כפות במנוחה בקואורדינטות הדמות (לתנוחת הידיים בגיאומטריה הממוזגת).
 מקורות (לא הומצא; הצורות – שחזור לפי מטבעות בר-כוכבא/ממצאים, אינן מפורטות במקורות):
  • ערכין ב:ג – "אין פוחתין משני נבלים ולא מוסיפין על ששה; אין פוחתין משני חלילין ולא מוסיפין על שנים עשר… ולא היה מכה באבוב של נחושת אלא באבוב של קנה, מפני שקולו ערב".
  • ערכין ב:ה – "אין פוחתין מתשעה כנורות ומוסיפין עד לעולם. והצלצל לבד" (צלצל אחד). ב:ו – "לא היו אומרים בנבל וכנור אלא בפה, כדי לתת תבל בנעימה".
  • סוכה ה:ד – "והלוים בכנורות ובנבלים ובמצלתים ובחצוצרות ובכלי שיר בלא מספר על חמש עשרה מעלות".
  • תמיד ז:ג – "ושחה לנסך… והקיש בן ארזא בצלצל, ודברו הלוים בשיר".
  • יוסף בן מתתיהו, קדמוניות ז׳ 12.3 (תרגום ויסטון): הכינור (kinyra) עשרה מיתרים, מנוגן בפלקטרון (תרגום ויסטון: "בקשת" – ביוונית plektron = פריטה בכלי מכה); הנבל (nabla) שנים עשר קולות, מנוגן באצבעות; המצלתיים רחבים וגדולים, מנחושת.
 כלומר: כינור = 10 מיתרים, פריטה בפלקטרון; נבל = 12 מיתרים, באצבעות (שתי ידיים); צלצל = זוג צלחות נחושת; חליל = קנה (לא נחושת). */
const INSTR=(()=>{
 const T=THREE,TAU=Math.PI*2;
 const WOOD=0x7a4a26,WOOD2=0x9a6a3a,WOOD3=0x5a3418,GOLD=0xdcae3c,COPPER=0xb8703a,COPPER2=0xd08a4a,GUT=0xf2e8c8,REED=0xcfab62,REED2=0x9a7638,DARK=0x2a1a10;
 let mW=null,mM=null,mS=null;
 const mats=()=>{if(mW)return;
  mW=new T.MeshStandardMaterial({vertexColors:true,roughness:.5,metalness:.04,side:T.DoubleSide});
  mM=new T.MeshStandardMaterial({vertexColors:true,roughness:.3,metalness:.78,emissive:0x1c1408,side:T.DoubleSide});
  mS=new T.MeshStandardMaterial({color:GUT,roughness:.5,emissive:0x3a3020,side:T.DoubleSide})};
 const lat=(pts,seg,a,b)=>new T.LatheGeometry(pts.map(p=>new T.Vector2(p[0],p[1])),seg,a,b);
 /* ---- מיתרים: סרט דק לכל מיתר (6 מקטעים) שאפשר לרטט ---- */
 function strGeo(L,r,segs){const n=L.length,K=segs,pos=new Float32Array(n*(K+1)*4*3),idx=[];
  for(let s=0;s<n;s++){const a=L[s][0],b=L[s][1];for(let k=0;k<=K;k++){const u=k/K,x=a[0]+(b[0]-a[0])*u,y=a[1]+(b[1]-a[1])*u,z=a[2]+(b[2]-a[2])*u,o=((s*(K+1)+k)*4)*3;
    [[r,0],[0,r],[-r,0],[0,-r]].forEach((d,j)=>{pos[o+j*3]=x+d[0];pos[o+j*3+1]=y;pos[o+j*3+2]=z+d[1]})}
   for(let k=0;k<K;k++){const o=(s*(K+1)+k)*4,p=o+4;for(let j=0;j<4;j++){const j2=(j+1)%4;idx.push(o+j,p+j,p+j2,o+j,p+j2,o+j2)}}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();g.userData={base:pos.slice(),n,K};return g}
 /* ---- קורת עץ מעוגלת (גליל בין שתי נקודות עם כדורי קצה) ---- */
 const beam=(B,a,b,r,col,seg=8,cap=true)=>{B.limb(a,b,r,r,col,seg);if(cap){B.add(new T.SphereGeometry(r,seg,Math.max(4,seg>>1)),col,a[0],a[1],a[2]);B.add(new T.SphereGeometry(r,seg,Math.max(4,seg>>1)),col,b[0],b[1],b[2])}};
 /* ---- לירה (כינור/נבל): תיבת תהודה, שתי זרועות מעוקלות, קורה עליונה ומיתרים. h=גובה הזרועות מעל התיבה ---- */
 function lyre(o,hi){const W=FGB(),Mt=FGB(),sg=hi?10:5,rad=hi?6:4,bw=o.bw,bh=o.bh,bd=o.bd,top=bh/2,H=o.h,w=o.w,n=o.n,strs=[];
  // תיבת תהודה: חביות מעוגלות (גוף עץ אגוז) + לוח קול בהיר + חור תהודה + טבעות זהב
  W.add(new T.CylinderGeometry(bw*.46,bw*.5,bh,hi?18:9),WOOD,0,0,0,1,1,bd/bw);
  W.add(new T.CylinderGeometry(bw*.435,bw*.435,.012,hi?18:9),WOOD2,0,top+.002,0,1,1,bd/bw*.9);
  W.add(new T.SphereGeometry(bw*.5,hi?12:6,hi?6:3,0,TAU,0,Math.PI/2),WOOD3,0,-bh/2,0,1,.35,bd/bw*.95,Math.PI,0,0);
  if(hi){W.add(new T.CircleGeometry(bh*.16,14),DARK,0,.0,bd*.5+.004,1,1.2,1);Mt.add(new T.TorusGeometry(bw*.47,.008,5,22),GOLD,0,top,0,1,bd/bw*.92,1,Math.PI/2,0,0)}
  // זרועות מעוקלות: ימין קצרה במעט (כבמטבעות בר-כוכבא)
  const arm=(s,hh)=>{const px=[[s*bw*.4,top*.3],[s*(bw*.52+.03),top+hh*.22],[s*(w/2+.045),top+hh*.6],[s*(w/2),top+hh]];
   if(hi)W.tube(px.map(p=>[p[0],p[1],0]),o.r,WOOD,16,6);else{beam(W,[px[0][0],px[0][1],0],[px[2][0],px[2][1],0],o.r,WOOD,5,false);beam(W,[px[2][0],px[2][1],0],[px[3][0],px[3][1],0],o.r,WOOD,5,false)}
   Mt.add(new T.SphereGeometry(o.r*1.35,hi?8:4,hi?6:3),GOLD,px[3][0],px[3][1],0);return px[3]};
  const tl=arm(-1,H),tr=arm(1,H*.93);
  beam(W,[tl[0],tl[1],0],[tr[0],tr[1],0],o.r*.9,WOOD2,hi?8:5,false);   // הקורה העליונה (הז'וג)
  if(hi)for(let i=0;i<n;i++){const t=(i+.5)/n;Mt.add(new T.CylinderGeometry(.012,.012,.05,5),GOLD,tl[0]+(tr[0]-tl[0])*(.08+.84*t),tl[1]+(tr[1]-tl[1])*(.08+.84*t)-.03,0,1,1,1,0,0,Math.PI/2)}   // יתדות כוונון
  // מיתרים: מגשר על התיבה אל הקורה
  for(let i=0;i<n;i++){const t=(i+.5)/n,xb=-bw*.3+bw*.6*t,xt=tl[0]+(tr[0]-tl[0])*(.1+.8*t),yt=tl[1]+(tr[1]-tl[1])*(.1+.8*t)-.045;strs.push([[xb,top+.008,0],[xt,yt,0]])}
  W.add(new T.BoxGeometry(bw*.64,.014,.022),WOOD3,0,top+.01,0);   // גשר
  return{W,Mt,strs,top,tl,tr}}
 /* ---- צלצל: צלחת נחושת (מצלתיים) – פרופיל מגובב עם פטמה, ורצועת אחיזה ---- */
 function cymbal(Mt,hi,sgn){const pts=[[.001,.075],[.03,.078],[.052,.066],[.062,.042],[.09,.03],[.16,.016],[.24,.004],[.26,0]],g=lat(pts,hi?28:12);
  Mt.add(g,COPPER,0,0,0,1,1,1,0,0,0);Mt.add(new T.TorusGeometry(.032,.008,5,10),COPPER2,0,.082,0,1,1,1,Math.PI/2,0,0);Mt.add(new T.TorusGeometry(.04,.007,5,12),0x4a2a16,0,.092,0,1,1,1,0,0,0)}
 /* ---- בניית כלי ---- */
 function parts(type,hi){
  if(type=='kinor'){const L=lyre({bw:.34,bh:.24,bd:.16,h:.62,w:.5,n:10,r:.026},hi);return Object.assign(L,{n:10,hold:{p:[.1,1.9,.52],ry:-.62,rx:-.06,rz:.1},rt:Math.PI/2})}
  if(type=='nevel'){const L=lyre({bw:.5,bh:.38,bd:.28,h:.62,w:.68,n:12,r:.034},hi);return Object.assign(L,{n:12,hold:{p:[.08,1.74,.55],ry:-.5,rx:-.04,rz:.08},rt:Math.PI/2})}
  if(type=='chalil'){const W=FGB(),Mt=FGB(),len=1.15;   // אבוב קנה: מקל חלול עם פרקים, חורי אצבעות ופיה צרה
   W.limb([0,0,0],[0,0,len],.03,.032,REED,hi?8:5);W.add(new T.SphereGeometry(.03,6,5),REED,0,0,0);
   [.2,.5,.8].forEach(z=>W.add(new T.TorusGeometry(.033,.006,4,hi?10:6),REED2,0,0,z));
   if(hi)for(let i=0;i<6;i++)W.add(new T.CylinderGeometry(.011,.011,.07,6),DARK,0,.027,.5+i*.09,1,1,1,0,0,0);
   Mt.add(new T.TorusGeometry(.036,.005,4,hi?10:6),GOLD,0,0,len);Mt.add(new T.TorusGeometry(.035,.005,4,hi?10:6),GOLD,0,0,.06);
   return{W,Mt,strs:[],hold:{p:[0,2.82,.2],ry:-.1,rx:.52,rz:0},n:0}}
  // tziltzal
  const W=FGB(),Mt=FGB();cymbal(Mt,hi,1);return{W,Mt,strs:[],hold:{p:[0,2.0,.58],ry:0,rx:0,rz:0},n:0}}
 /* ---- יצירת Group עם רשתות (עץ, מתכת, מיתרים) ---- */
 function make(type,opts){opts=opts||{};mats();const hi=opts.lod!==0,pt=parts(type,hi),g=new T.Group(),ud={type,hold:pt.hold,strings:pt.n,mouth:null,rest:{}};g.userData.inst=ud;
  const addM=(B,mat)=>{if(B.n()){const m=new T.Mesh(B.geo(),mat);m.castShadow=true;g.add(m);return m}};
  if(type=='tziltzal'){
   // שתי צלחות: כל אחת בקבוצה משלה; ציר הצלחת לאורך x, והקעורית פונה אל חברתה
   const cs=[1,-1].map(s=>{const B=FGB();cymbal(B,hi,s);const c=new T.Group(),m=new T.Mesh(B.geo(),mM);m.castShadow=true;c.add(m);c.rotation.z=-s*Math.PI/2;const w=new T.Group();w.add(c);g.add(w);return w});
   let ph=0,gap=.4;
   ud.update=(t,dt,amp,out)=>{if(amp>.01){ph+=dt*1.25;const p=ph%1;let k;if(p<.5)k=1-(p/.5)*(p/.5);else if(p<.6)k=0;else{const q=(p-.6)/.4;k=1-(1-q)*(1-q)}gap=.035+.4*k*amp+.4*(1-amp)*0}else gap=.3;
    const tilt=amp>.01?Math.sin(ph*TAU)*.06:0;cs.forEach((w,i)=>{const s=i?-1:1;w.position.x=s*(gap+.02);w.rotation.z=tilt*s;w.rotation.y=amp>.01?Math.sin(ph*TAU*2)*.04*(gap<.07?1:0):0});
    out.L=[(gap+.02),.0,0];out.R=[-(gap+.02),.0,0]};
   ud.rest={L:[.32,0,0],R:[-.32,0,0]};ud.hold=pt.hold;g.userData.cymbals=cs;
  }else{
   addM(pt.W,mW);addM(pt.Mt,mM);
   if(pt.strs.length){const sg=strGeo(pt.strs,.0062,6),sm=new T.Mesh(sg,mS);sm.frustumCulled=false;g.add(sm);
    const n=pt.n,en=new Float32Array(n),base=sg.userData.base,K=sg.userData.K,P=sg.attributes.position;let last=-1,ph=0,hp=[0,0,0];
    const tl=pt.tl,tr=pt.tr,top=pt.top;
    const sx=i=>pt.strs[i][0][0]*.62+pt.strs[i][1][0]*.38,sy=i=>pt.strs[i][0][1]*.62+pt.strs[i][1][1]*.38;
    ud.update=(t,dt,amp,out)=>{
     // פריטה: הכף הימנית זורמת על פני המיתרים; בנבל גם השמאלית (שתי ידיים)
     let sR=Math.round((.5+.5*Math.sin(t*TAU*(type=='nevel'?.8:1.05)))*(n-1)),sL=Math.round((.5+.5*Math.sin(t*TAU*.62+1.9))*(n-1));
     if(amp>.01){const kick=i=>{en[i]=Math.max(en[i],.55+.45*amp)};
      if(last<0)last=sR;if(sR!=last){const a=Math.min(sR,last),b=Math.max(sR,last);for(let i=a;i<=b;i++)kick(i);last=sR}
      if(type=='nevel'&&((t*2.3)%1)<dt*2.3+.001)kick(sL)}
     const dec=Math.exp(-dt*4.2);for(let s=0;s<n;s++){en[s]*=dec;const e=en[s];for(let k=0;k<=K;k++){const sn=Math.sin(Math.PI*k/K),d=e>.012?e*.02*sn*Math.sin(t*(95+s*7)+s*1.3):0;for(let j=0;j<4;j++){const o=((s*(K+1)+k)*4+j)*3;P.array[o]=base[o]+d*.35;P.array[o+2]=base[o+2]+d}}}
     P.needsUpdate=true;
     const hr=amp>.01?1:0;out.R=[sx(sR),sy(sR)-.02,.07+(1-hr)*.03];
     if(type=='nevel'){out.L=amp>.01?[sx(sL),sy(sL)-.05,-.08]:[tl[0]*.8,top+.3,-.07]}else out.L=[tl[0]-.015,top+.22,-.06]};
    ud.rest={R:[sx(Math.floor(n/2)),sy(Math.floor(n/2))-.02,.08],L:type=='nevel'?[sx(2),sy(2)-.05,-.08]:[tl[0]-.015,top+.22,-.06]};ud.strs=pt.strs;
   }else{   // חליל: הידיים על האבוב, אצבעות מרפרפות; הפה בקצה הקרוב
    ud.mouth=[0,0,0];ud.update=(t,dt,amp,out)=>{const f=amp>.01?Math.sin(t*14)*.012*amp:0,f2=amp>.01?Math.sin(t*11+1)*.012*amp:0;out.L=[0,-.045+f,.34];out.R=[0,-.045+f2,.66]};ud.rest={L:[0,-.045,.34],R:[0,-.045,.66]}}}
  ud.pt=pt;ud.hold=pt.hold;
  const h=ud.hold;g.position.set(h.p[0],h.p[1]-1.7,h.p[2]);g.rotation.set(h.rx,h.ry,h.rz,'YXZ');g.updateMatrix();
  ud.rest&&(ud.restPos=null);return g}
 /* ---- מיזוג לגיאומטריה סטטית (קהל): הכלי בתנוחת האחיזה, מיתרים כגלילים ---- */
 function addTo(B,type,opts){mats();const pt=parts(type,false),h=pt.hold,m=new T.Matrix4(),e=new T.Euler(h.rx,h.ry,h.rz,'YXZ');m.compose(new T.Vector3(h.p[0],h.p[1],h.p[2]),new T.Quaternion().setFromEuler(e),new T.Vector3(1,1,1));
  [pt.W,pt.Mt].forEach(b=>{if(b.n())B.addG(b.geo(),m)});
  if(type=='tziltzal'){[1,-1].forEach(s=>{const c=FGB();cymbal(c,false,s);const g=c.geo(),mm=new T.Matrix4().compose(new T.Vector3(h.p[0]+s*.32,h.p[1],h.p[2]),new T.Quaternion().setFromEuler(new T.Euler(0,0,-s*Math.PI/2)),new T.Vector3(1,1,1));B.addG(g,mm)})}
  pt.strs.forEach(s=>{const a=new T.Vector3(...s[0]).applyMatrix4(m),b=new T.Vector3(...s[1]).applyMatrix4(m);B.limb([a.x,a.y,a.z],[b.x,b.y,b.z],.007,.007,GUT,3)})}
 // מיקומי כפות במנוחה בקואורדינטות הדמות (כינור/נבל: ימנית מנגנת, שמאלית אוחזת; צלצל: שתי הצלחות; חליל: שתי ידיים על האבוב)
 function crowdHands(type){const pt=parts(type,false),h=pt.hold,m=new T.Matrix4().compose(new T.Vector3(h.p[0],h.p[1],h.p[2]),new T.Quaternion().setFromEuler(new T.Euler(h.rx,h.ry,h.rz,'YXZ')),new T.Vector3(1,1,1));
  const tl=pt.tl,tr=pt.tr,top=pt.top,n=pt.n;let L,R;
  if(type=='tziltzal'){L=[h.p[0]+.32,h.p[1],h.p[2]];R=[h.p[0]-.32,h.p[1],h.p[2]];return{L,R}}
  if(type=='chalil'){L=[0,-.045,.34];R=[0,-.045,.66]}
  else{const i=Math.floor(n/2),s=pt.strs[i];R=[s[0][0]*.62+s[1][0]*.38,s[0][1]*.62+s[1][1]*.38-.02,.08];L=type=='nevel'?[pt.strs[2][0][0]*.62+pt.strs[2][1][0]*.38,pt.strs[2][0][1]*.62+pt.strs[2][1][1]*.38-.05,-.08]:[tl[0]-.015,top+.22,-.06]}
  const a=new T.Vector3(...L).applyMatrix4(m),b=new T.Vector3(...R).applyMatrix4(m);return{L:[a.x,a.y,a.z],R:[b.x,b.y,b.z]}}
 return{make,addTo,crowdHands,TYPES:['kinor','nevel','tziltzal','chalil'],holdOf:t=>parts(t,false).hold}
})();
