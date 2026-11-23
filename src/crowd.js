// src/crowd.js – פעילות ודמויות בעזרה לפי שעה ותאריך (סוכן הפעילות)
/* ================= כהנים, לויים, ישראלים וסנהדרין בתנועה לפי השעה והיום =================
 הבורר #dayType (יום חול / שבת / ראש חודש / ערב פסח / פסח / שבועות / ר״ה / יוה״כ / סוכות) + סליידר השעה #tm קובעים מי נמצא איפה ומה הוא עושה.
 כל הפעילויות מבוססות על מקורות (משנה, תלמוד, רמב״ם, יוספוס) – ליד כל סצנה בקוד הערת מקור; שורת הסבר ב-#ambChip.
 מימוש: מופעים (THREE.InstancedMesh: גוף + ראש) לקהל ולדמויות רחוקות; דמויות בודדות מפורטות (priest()) לכהנים עובדים ובודדים נבחרים.
 הליכה: מסלולים (routes) מאומתים מול COL; עומדים/משוטטים נדגמים מחוץ ל-COL (רשת מרחבית); רישום לסוכן הצ'אט: NPCS.register({...}) (src/npcs.js).
 ביצועים: ~כ-40 רשתות בסך הכל (בריכות מופעים), עד כ-2500 דמויות בערב פסח (מכפיל צפיפות #crowdQ).
 תנועה (עדכון 18.11): כל דמות נכנסת הולכת מן שער אמיתי (שערי הר הבית: שושן, חולדה×2, קיפונוס×2, טדי; רגלי מעלות שערי העזרה והנשים) לאורך מסלול ניווט שמחושב מרשת COL/ZN (ב2), עושה את מעשיה, ויוצאת הולכת אל שער ההר.
 אין scale מהרצפה ואין היעלמות פתאומית: דמות נוצרת/נעלמת "במקום" רק אם מקומה מוסתר מן המצלמה (hid: רחק >250 או מחוץ לחרוט הראייה) – "הרצה מקדימה": היא כבר שם / מתחילה בנקודה המוסתרת הרחוקה ביותר על המסלול; אחרת – בשער.
 שחקני people.js (לויים, מחצצרים, כהנים מהלכים/סל/דישון/תנופה) הם CROWD.actor עם אותם כללים. מראה הדמויות: buildCrowdGeometry(kind) (נקודת החלפה יחידה). בדיקה: tools/audit-people.mjs. */
const CROWD=(()=>{
 const $=id=>document.getElementById(id),PI=Math.PI,TAU=PI*2;
 let _r=987654321;const R=()=>(_r=_r*16807%2147483647)/2147483647,rr=(a,b)=>a+(b-a)*R(),pick=a=>a[R()*a.length|0];
 const sm01=x=>{x=Math.min(1,Math.max(0,x));return x*x*(3-2*x)};
 const inW=(h,a,b)=>a<=b?(h>=a&&h<b):(h>=a||h<b);                       // חלון שעות (גם חוצה חצות)
 const hhmm=h=>{const hh=Math.floor(h),mm=Math.floor((h-hh)*60);return(hh<10?'0':'')+hh+':'+(mm<10?'0':'')+mm};
 /* ---------------- א. לוח השנה: ימים וסוגיהם ---------------- */
 // mus: יש מוסף; yt: יום טוב/שבת (הסנהדרין יושבת בחיל – סנהדרין פח ע״ב); gold: כהן גדול מקריב בבוקר (נוהג בשבתות ובימים טובים)
 const DAYS={
  chol:{n:'יום חול',mus:0,gold:0,yt:0,cr:[16,36,45,0]},
  shabbat:{n:'שבת',mus:1,gold:1,yt:1,cr:[30,80,100,0]},
  rc:{n:'ראש חודש',mus:1,gold:1,yt:0,cr:[34,95,130,0]},
  'erev-pesach':{n:'ערב פסח (י״ד בניסן)',mus:0,gold:0,yt:0,cr:[90,680,860,0]},
  pesach:{n:'פסח – חול המועד',mus:1,gold:1,yt:0,cr:[110,420,520,0]},
  shavuot:{n:'שבועות',mus:1,gold:1,yt:1,cr:[100,470,600,0]},
  rh:{n:'ראש השנה',mus:1,gold:1,yt:1,cr:[80,330,400,0]},
  yk:{n:'יום הכיפורים',mus:1,gold:0,yt:1,cr:[150,260,110,230]},
  sukkot:{n:'סוכות – חול המועד',mus:1,gold:1,yt:0,cr:[100,440,540,0]}};
 const DLIST=['chol','shabbat','rc','erev-pesach','pesach','shavuot','rh','yk','sukkot'];
 let Qv=.7;                                                              // מכפיל צפיפות (בורר #crowdQ)
 /* ---------------- ב. התנגשויות: רשת מרחבית על COL + לבדוק הליכה ---------------- */
 let GRID=null;const GC=16,GO=300;
 const gkey=(x,z)=>Math.floor((x+GO)/GC)*64+Math.floor((z+GO)/GC);
 function buildGrid(){GRID=new Map();COL.forEach(c=>{if(c[1]<-290||c[0]>290||c[3]<-290||c[2]>290)return;const x0=Math.floor((c[0]-1.4+GO)/GC),x1=Math.floor((c[1]+1.4+GO)/GC),z0=Math.floor((c[2]-1.4+GO)/GC),z1=Math.floor((c[3]+1.4+GO)/GC);
  for(let a=x0;a<=x1;a++)for(let b=z0;b<=z1;b++){const k=a*64+b;let l=GRID.get(k);if(!l)GRID.set(k,l=[]);l.push(c)}})}
 const blocked=(x,z,f,r=.8)=>{const l=GRID.get(gkey(x,z));if(!l)return false;for(const c of l){if(c[6]&&!c[6].visible)continue;if(f+1<c[5]&&f+4>c[4]&&x>c[0]-r&&x<c[1]+r&&z>c[2]-r&&z<c[3]+r)return true}return false};
 const segClear=(x0,z0,x1,z1,f,r=.8)=>{const L=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.ceil(L/.7));for(let i=0;i<=n;i++){const u=i/n,x=x0+(x1-x0)*u,z=z0+(z1-z0)*u;if(blocked(x,z,levelY(x,z),r))return false}return true};
 // גובה הרצפה: floorY של הדגם + משטח ראש המזבח (y=25) שאין לו ZN
 const levelY=(x,z)=>(x>-40&&x<-12&&z>-57&&z<-28)?YA+9:floorY(x,z);
 // אזורים שאסור לעמוד בהם (נוסף על COL): מזבח וכבש, כבש האולם, שולחני הטבחים, בסיסי מנורות שמחת בית השואבה
 const EX=[[-44,-8,-61,5.5],[-66,-50,-71,-44]];[-39,-30,-21,-12].forEach(x=>EX.push([x-2.5,x+2.5,-101.6,-93.4]));[[62,-79],[62,-36],[108,-79],[108,-36]].forEach(([x,z])=>EX.push([x-3.6,x+3.6,z-3.6,z+3.6]));EX.push([16,33.5,-73.5,-41.5]);
 const inEx=(x,z,l)=>{for(const e of EX)if(x>e[0]&&x<e[1]&&z>e[2]&&z<e[3])return true;if(l)for(const e of l)if(x>e[0]&&x<e[1]&&z>e[2]&&z<e[3])return true;return false};
 const OCC=new Set(),okey=(x,z,y)=>Math.round(x/1.15)*8192+Math.round(z/1.15)+(y>40?7e7:0);
 function sample(rect,o){o=o||{};for(let t=0;t<40;t++){const x=rr(rect[0],rect[1]),z=rr(rect[2],rect[3]),y=o.y!=null?o.y:levelY(x,z);
   if(blocked(x,z,y,1))continue;if(inEx(x,z,o.ex))continue;const k=okey(x,z,y);if(!o.free&&OCC.has(k))continue;return{x,z,y,k}}return null}
 /* ---------------- ב2. רשת ניווט, שערים ושדות מרחק – מסלולים אמיתיים מתוך COL ו-ZN ----------------
  רשת 1×1 אמה על ההר והחצרות. תא מותר = אין COL ברדיוס גוף 1 (עם בדיקת גובה כמו ב-blocked) והפרש גובה לשכן ≤1.1 –
  כלומר מעבר מפלסים רק דרך המדרגות והרמפות הקיימות (ZN). לכל שער (פורטל) נבנה פעם אחת שדה מרחק (Dial, 8 שכנים);
  מסלול = ירידה במורד השדה מן היעד אל השער (בכיוון ההפוך – כניסה), דחיסת קטעים ישרים וקיצור קווי ראייה (string pulling).
  כך כל דמות נכנסת מן השער ויוצאת אליו, עוקפת מזבח/כבש/כיור/עמודים/קירות. מסלולים מחושבים פעם אחת בעת ההצבה (לא בכל פריים). */
 const NX0=-262,NZ0=-262,NN=525,NCELL=NN*NN,NR=1,NSTEP=1.1;
 let NW=null,NYa=null,NAVR=false;const NF={},NP={},NQ=[];
 const nOK=(x,z)=>{const ix=Math.round(x)-NX0,iz=Math.round(z)-NZ0;return ix>=0&&iz>=0&&ix<NN&&iz<NN&&NW[iz*NN+ix]===1};
 const navY=(x,z)=>{const ix=Math.round(x)-NX0,iz=Math.round(z)-NZ0;return ix>=0&&iz>=0&&ix<NN&&iz<NN?NYa[iz*NN+ix]:0};
 const ZCn=-57.5;
 // שערים: M = שערי הר הבית (שושן במזרח, חולדה בדרום ×2, קיפונוס במערב ×2, טדי בצפון) – נקודה מחוץ לחומה; A = רגל מעלות שערי העזרה (צפון ×2, דרום ×4); W = רגל מעלות שערי עזרת נשים (צפון, דרום, מזרח)
 const PORTALS=[['M0',258,ZCn,247,ZCn],['M1',10,258,10,247],['M2',40,258,40,247],['M3',-258,-100,-247,-100],['M4',-258,213,-247,213],['M5',-102,-258,-102,-247],
  ['A0',-151,-154.5],['A1',-121,-154.5],['A2',-116,40],['A3',-43,40],['A4',-27,40],['A5',-11,40],['W0',84.5,-137],['W1',84.5,22],['W2',164,ZCn]];
 const ROLEP={M:['M0','M1','M2','M3','M4','M5'],A:['A0','A1','A2','A3','A4','A5'],W:['W0','W1','W2']},EXITS=ROLEP.M;
 function buildNav(){NW=new Uint8Array(NCELL);NYa=new Float32Array(NCELL);
  for(let iz=0;iz<NN;iz++)for(let ix=0;ix<NN;ix++){const x=NX0+ix,z=NZ0+iz;NYa[iz*NN+ix]=(x>250||x<-250||z>250||z<-250)?terrH(x,z):0}
  for(const q of ZN){   // אותה סמנטיקה כמו floorY (ללא שכבות u)
   if(q.c){const x0=Math.max(NX0,Math.floor(q.c[0]-q.R)),x1=Math.min(NX0+NN-1,Math.ceil(q.c[0]+q.R)),z0=Math.max(NZ0,Math.floor(q.c[1]-q.R)),z1=Math.min(NZ0+NN-1,Math.ceil(q.c[1]+q.R));
    for(let z=z0;z<=z1;z++)for(let x=x0;x<=x1;x++){const dx=x-q.c[0],dz=z-q.c[1],rr=Math.hypot(dx,dz);if(dx>=0&&rr<=q.R)NYa[(z-NZ0)*NN+x-NX0]=q.ya+(q.yb-q.ya)*Math.min(1,Math.max(0,(q.R-rr)/(q.R-q.rt)))}continue}
   if(q.u)continue;const k=q.r,x0=Math.max(NX0,Math.ceil(k[0])),x1=Math.min(NX0+NN-1,Math.floor(k[1])),z0=Math.max(NZ0,Math.ceil(k[2])),z1=Math.min(NZ0+NN-1,Math.floor(k[3]));
   for(let z=z0;z<=z1;z++)for(let x=x0;x<=x1;x++){let v;if(q.ax){const p=q.ax=='x'?x:z,u=Math.min(1,Math.max(0,(p-q.a)/(q.b-q.a)));v=q.ya+(q.yb-q.ya)*u}else v=q.y;NYa[(z-NZ0)*NN+x-NX0]=v}}
  for(let iz=0;iz<NN;iz++)for(let ix=0;ix<NN;ix++){const x=NX0+ix,z=NZ0+iz,i=iz*NN+ix;if(x>-40&&x<-12&&z>-57&&z<-28)NYa[i]=YA+9;if(!blocked(x,z,NYa[i],NR))NW[i]=1}
  PORTALS.forEach(p=>{NP[p[0]]={id:p[0],x:p[1],z:p[2],ax:p[3],az:p[4],next:0};NQ.push(p[0])})}
 const DX=[1,-1,0,0,1,1,-1,-1],DZ=[0,0,1,-1,1,-1,1,-1],DC=[10,10,10,10,14,14,14,14];
 function okMove(i,ix,iz,k){const jx=ix+DX[k],jz=iz+DZ[k];if(jx<0||jz<0||jx>=NN||jz>=NN)return -1;const j=jz*NN+jx;if(NW[j]!==1||Math.abs(NYa[j]-NYa[i])>NSTEP)return -1;
  if(k>3){const a=iz*NN+jx,b=jz*NN+ix;if(NW[a]!==1||NW[b]!==1||Math.abs(NYa[a]-NYa[i])>NSTEP||Math.abs(NYa[b]-NYa[i])>NSTEP)return -1}return j}
 // התא המותר הקרוב ביותר (ואם D ניתן – גם מחובר לשדה)
 function snapCell(x,z,R,D){const cx=Math.round(x),cz=Math.round(z);let best=-1,bd=1e9;for(let r=0;r<=R;r++){for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dz))!==r)continue;const ix=cx+dx-NX0,iz=cz+dz-NZ0;if(ix<0||iz<0||ix>=NN||iz>=NN)continue;const i=iz*NN+ix;if(NW[i]!==1||(D&&D[i]===65535))continue;const d=dx*dx+dz*dz;if(d<bd){bd=d;best=i}}if(best>=0&&r>=Math.sqrt(bd))break}return best}
 // שדה מרחק לשער – נבנה בפרוסות זמן (כמה ms לפריים) כדי לא לתקוע את הטעינה
 let FJ=null;
 function fieldRun(J,s){J.D.fill(65535);J.s=s;J.D[s]=0;J.cnt=0;J.d=0;J.pend=1;J.B=[];for(let i=0;i<16;i++)J.B.push([]);J.B[0].push(s)}
 function fieldStep(ms){const t0=performance.now();
  if(!FJ){const pid=NQ.shift();if(!pid){NAVR=true;return}const P=NP[pid],s=snapCell(P.x,P.z,8);FJ={pid,P,D:new Uint16Array(NCELL).fill(65535),s,alt:false,cnt:0,B:null,pend:0,d:0};if(s>=0)fieldRun(FJ,s);else FJ.pend=0}
  const J=FJ,D=J.D;let n=0;
  for(;J.pend>0;J.d++){const b=J.B[J.d&15],d=J.d;while(b.length){const i=b.pop();J.pend--;if(D[i]!==d)continue;J.cnt++;const ix=i%NN,iz=(i-ix)/NN;for(let k=0;k<8;k++){const j=okMove(i,ix,iz,k);if(j<0)continue;const nd=d+DC[k];if(nd<D[j]&&nd<65535){D[j]=nd;J.B[nd&15].push(j);J.pend++}}
    if((++n&1023)==0&&performance.now()-t0>ms)return}}
  if(J.cnt<40000&&!J.alt&&J.P.ax!=null){J.alt=true;const s2=snapCell(J.P.ax,J.P.az,8);if(s2>=0){fieldRun(J,s2);return}}   // מחוץ לחומה אין חיבור – נכנסים מתוך פתח השער
  NF[J.pid]={D,s:J.s,cnt:J.cnt,bad:J.s<0||J.cnt<40000};FJ=null;if(!NQ.length)NAVR=true}
 function descend(D,i0){if(D[i0]===65535)return null;const out=[i0];let i=i0,g=0;while(D[i]>0&&g++<5000){const ix=i%NN,iz=(i-ix)/NN;let bj=-1,bd=D[i];for(let k=0;k<8;k++){const j=okMove(i,ix,iz,k);if(j>=0&&D[j]<bd){bd=D[j];bj=j}}if(bj<0)return null;out.push(bj);i=bj}return out}
 function los(x0,z0,x1,z1){const L=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.ceil(L/.5));let py=navY(x0,z0);for(let s=1;s<=n;s++){const u=s/n,x=x0+(x1-x0)*u,z=z0+(z1-z0)*u;if(!nOK(x,z))return false;const y=navY(x,z);if(Math.abs(y-py)>.75)return false;py=y}return true}
 function cellPts(cells){const P=cells.map(c=>{const ix=c%NN;return[ix+NX0,(c-ix)/NN+NZ0]});const o=[P[0]];for(let i=1;i<P.length-1;i++){const a=P[i-1],b=P[i],c=P[i+1];if(b[0]-a[0]!==c[0]-b[0]||b[1]-a[1]!==c[1]-b[1])o.push(b)}if(P.length>1)o.push(P[P.length-1]);return o}
 function pull(P){const o=[P[0]];let i=0;while(i<P.length-1){let j=P.length-1;while(j>i+1&&!los(P[i][0],P[i][1],P[j][0],P[j][1]))j--;o.push(P[j]);i=j}return o}
 function mkPath(P){if(P.length<2)P=[P[0],[P[0][0]+.01,P[0][1]]];const L=[0];for(let i=1;i<P.length;i++)L.push(L[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));return{pts:P,L,len:L[L.length-1]}}
 // מסלול מן השער pid אל (x,z): ירידה בשדה מן היעד אל השער ואז היפוך. הנקודה האחרונה = היעד המדויק
 function pathFromPortal(pid,x,z){const F=NF[pid];if(!F||F.bad)return null;const c=snapCell(x,z,6,F.D);if(c<0)return null;const cells=descend(F.D,c);if(!cells)return null;
  let P=pull(cellPts(cells));if(Math.hypot(P[0][0]-x,P[0][1]-z)>.2)P.unshift([x,z]);P.reverse();return mkPath(P)}
 // מסלול יציאה מן (x,z) אל שער ההר הקרוב ביותר
 function pathOut(x,z){let best=null,bd=1e9;for(const pid of EXITS){const F=NF[pid];if(!F||F.bad)continue;const c=snapCell(x,z,6,F.D);if(c<0)continue;if(F.D[c]<bd){bd=F.D[c];best={F,c}}}
  if(!best)return null;const cells=descend(best.F.D,best.c);if(!cells)return null;let P=pull(cellPts(cells));if(Math.hypot(P[0][0]-x,P[0][1]-z)>.2)P.unshift([x,z]);return mkPath(P)}
 const PO=[0,0,0,0];
 function pAt(pt,s,seg){let i=Math.max(0,Math.min(seg|0,pt.pts.length-2));while(i>0&&s<pt.L[i])i--;while(i<pt.pts.length-2&&s>pt.L[i+1])i++;const a=pt.pts[i],b=pt.pts[i+1],u=Math.min(1,Math.max(0,(s-pt.L[i])/Math.max(.001,pt.L[i+1]-pt.L[i])));PO[0]=a[0]+(b[0]-a[0])*u;PO[1]=a[1]+(b[1]-a[1])*u;PO[2]=Math.atan2(b[0]-a[0],b[1]-a[1]);PO[3]=i;return PO}
 function pickPortal(role,x,z){const L=ROLEP[role]||ROLEP.M,c=[];let m=1e9;for(const pid of L){const F=NF[pid];if(!F||F.bad)continue;const ci=snapCell(x,z,6,F.D);if(ci<0)continue;const d=F.D[ci];c.push([pid,d]);if(d<m)m=d}if(!c.length)return null;const g=c.filter(q=>q[1]<=m*1.3+100);return pick(g)[0]}
 /* ---- מי רואה את הנקודה: מרחק <250 (+מרווח 8) וחרוט ראייה של המצלמה (מרווח כדור ‎3.2). דמות נוצרת/נעלמת "במקום" רק כשהיא מוסתרת לפי זה, או בשער ---- */
 const FR=new T.Frustum(),SPH=new T.Sphere(new T.Vector3(),3.2),PM=new T.Matrix4();let CAMX=0,CAMY=0,CAMZ=0,NOW=0,BOOST=1,HELD=false,DMT=0;
 function camSync(){camera.updateMatrixWorld();PM.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);FR.setFromProjectionMatrix(PM);const e=camera.matrixWorld.elements;CAMX=e[12];CAMY=e[13];CAMZ=e[14]}
 const hid=(x,y,z)=>{const dx=x-CAMX,dy=y+1.7-CAMY,dz=z-CAMZ;if(dx*dx+dy*dy+dz*dz>66564)return true;SPH.center.set(x,y+1.7,z);return !FR.intersectsSphere(SPH)};
 /* ---------------- ג. גיאומטריה של דמויות פשוטות (מופעים) ---------------- */
 const _o=new T.Object3D();
 function GB(){const P=[],N=[],C=[];return{add(geo,col,x=0,y=0,z=0,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0){_o.position.set(x,y,z);_o.rotation.set(rx,ry,rz);_o.scale.set(sx,sy,sz);_o.updateMatrix();
   const g=geo.index?geo.toNonIndexed():geo.clone();g.applyMatrix4(_o.matrix);const p=g.attributes.position,n=g.attributes.normal,c=new T.Color(col);
   for(let i=0;i<p.count;i++){P.push(p.getX(i),p.getY(i),p.getZ(i));N.push(n.getX(i),n.getY(i),n.getZ(i));C.push(c.r,c.g,c.b)}},
  limb(a,b,r1,r2,col,seg=6){const d=new T.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),L=d.length();_o.position.set((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);_o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());_o.scale.set(1,1,1);_o.updateMatrix();
   const g=new T.CylinderGeometry(r2,r1,L,seg).toNonIndexed();g.applyMatrix4(_o.matrix);const p=g.attributes.position,n=g.attributes.normal,c=new T.Color(col);for(let i=0;i<p.count;i++){P.push(p.getX(i),p.getY(i),p.getZ(i));N.push(n.getX(i),n.getY(i),n.getZ(i));C.push(c.r,c.g,c.b)}},
  geo(){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('normal',new T.Float32BufferAttribute(N,3));g.setAttribute('color',new T.Float32BufferAttribute(C,3));return g}}}
 const lathe=(pts,seg)=>new T.LatheGeometry(pts.map(p=>new T.Vector2(p[0],p[1])),seg);
 const SKIN=0xc99673,HAIR=[0x2c1f17,0x3a2a1e,0x4a3426,0x6a5a4a,0x8a8a88,0xc8c8c4];
 // דמות עומדת: robe (נצבע בצבע המופע) + head (ראש, ידיים, רגליים, כיסוי ראש)
 function fig(o){const Rb=GB(),Hd=GB();const hm=o.hem||.14,w0=o.w0||.46,col=o.col!=null?o.col:0xffffff;
  Rb.add(lathe(o.prof||[[w0,hm],[w0*.96,.9],[.37,1.8],[.42,2.42],[.2,2.66]],o.seg||9),col);
  [-1,1].forEach(s=>Rb.limb([s*.36,2.55,0],[s*(.5+(o.sw||0)),1.95,.2],.12,o.sl||.1,col,6));
  if(o.belt!=null)Rb.add(new T.CylinderGeometry(.395,.395,o.bw||.14,9,1,true),o.belt,0,1.8,0);
  if(o.robeX)o.robeX(Rb);
  [-1,1].forEach(s=>{Hd.add(new T.SphereGeometry(.08,5,4),SKIN,s*(.5+(o.sw||0)),1.9,.22);Hd.add(new T.BoxGeometry(.16,.07,.34),SKIN,s*.14,.04,.06)});
  Hd.add(new T.CylinderGeometry(.08,.09,.2,6),SKIN,0,2.72,0);Hd.add(new T.SphereGeometry(.2,7,6),SKIN,0,2.93,.01,1,1.1,1);
  if(o.headX)o.headX(Hd);return{robe:Rb.geo(),head:Hd.geo()}}
 const hairC=()=>pick(HAIR);
 const beardX=(Hd,c,big)=>{Hd.add(new T.SphereGeometry(.14,6,5),c,0,2.72,.11,1.05,big?2.4:1.3,.8);Hd.add(new T.SphereGeometry(.2,6,5),c,0,3.0,-.05,1,.75,.9)};
 const LFIG={   // מראה מקומי (גיבוי) – ה-FIG הגלובלי של figures.js מקבל עדיפות ב-buildCrowdGeometry
  man:()=>fig({belt:0x6b5a45,headX:H=>{beardX(H,0x3a2a1e);H.add(new T.TorusGeometry(.2,.07,5,8),0xe8dfc8,0,3.07,0,1,1,1,PI/2,0,0);H.add(new T.SphereGeometry(.16,6,4),0xe8dfc8,0,3.11,0,1,.6,1)}}),
  woman:()=>fig({w0:.52,prof:[[.52,.05],[.48,.9],[.36,1.75],[.4,2.4],[.2,2.66]],belt:0x8a6a48,bw:.1,sl:.095,headX:H=>{H.add(new T.SphereGeometry(.23,7,6),0xdcd0b4,0,2.95,-.01,1,1.08,1.02);H.add(new T.SphereGeometry(.12,6,5),0xdcd0b4,0,2.65,-.15,1.3,1.4,.8)}}),
  kohen:()=>fig({belt:0x8a4a4f,bw:.2,w0:.44,sw:.04,headX:H=>{beardX(H,0x3a2a1e);H.add(new T.ConeGeometry(.23,.58,8),0xf1ece0,0,3.35,0)}}),
  levi:()=>fig({col:0xb8966a,belt:0x7a2a22,bw:.2,headX:H=>{beardX(H,0x3a2a1e);H.add(new T.TorusGeometry(.21,.08,5,8),0xe8dcc0,0,3.07,0,1,1,1,PI/2,0,0);H.add(new T.SphereGeometry(.15,6,4),0x8a2a22,0,3.12,0,1,.8,1)}}),
  sage:()=>fig({w0:.5,sw:.08,sl:.14,belt:0x5a4a38,headX:H=>{beardX(H,0xe0ddd6,1);H.add(new T.TorusGeometry(.22,.1,5,8),0xf0ecdf,0,3.08,0,1,1,1,PI/2,0,0);H.add(new T.SphereGeometry(.17,6,4),0xf0ecdf,0,3.14,0,1,.7,1)}}),
  // חכם יושב (הראשית = משטח הכיסא; הפנים +z; הרגליים יורדות 1.1 אל הרצפה)
  sit:()=>{const Rb=GB(),Hd=GB();Rb.add(lathe([[.42,.05],[.4,.6],[.37,1.3],[.42,1.75],[.2,1.97]],9),0xffffff);Rb.add(new T.BoxGeometry(.8,.3,1),0xffffff,0,.2,.52);
   [-1,1].forEach(s=>{Rb.add(new T.BoxGeometry(.26,1.15,.3),0xffffff,s*.22,-.52,1.0);Rb.limb([s*.38,1.8,0],[s*.3,.5,.8],.12,.1,0xffffff,6);Hd.add(new T.BoxGeometry(.2,.08,.4),SKIN,s*.22,-1.08,1.12);Hd.add(new T.SphereGeometry(.08,5,4),SKIN,s*.3,.5,.85)});
   Rb.add(new T.CylinderGeometry(.41,.41,.12,9,1,true),0x5a4a38,0,1.0,0);
   Hd.add(new T.CylinderGeometry(.08,.09,.2,6),SKIN,0,2.0,0);Hd.add(new T.SphereGeometry(.2,7,6),SKIN,0,2.2,.01,1,1.1,1);beardX(Hd,0xe0ddd6,1);Hd.add(new T.TorusGeometry(.22,.1,5,8),0xf0ecdf,0,2.34,0,1,1,1,PI/2,0,0);Hd.add(new T.SphereGeometry(.17,6,4),0xf0ecdf,0,2.4,0,1,.7,1);
   return{robe:Rb.geo(),head:Hd.geo()}}};
 const PAL={Y:[0xe8dcc0,0xd8c8a0,0xb89868,0x9a7a52,0xc9bfa8,0x8a6a4a,0xe9e4d4,0x7a8a98,0xa85a48,0x6a7a52],W:[0xc8584a,0xd8a040,0x4a7a9a,0x6a9a5a,0xb0608a,0xe0d0b0,0x8a6aa0,0xc98a6a,0xa04a3a],
  K:[0xffffff,0xf6f3ea,0xeeeadf],L:[0xffffff,0xf2ede2],S:[0xf0ece2,0x3b4a6b,0x6a2a38,0x4a4a52,0xd8d0b8],Q:[0xf0ece2,0x3b4a6b,0x6a2a38,0x4a4a52,0xd8d0b8,0xe4dcc4]};
let STOOL=null;
 function setStools(L){if(!STOOL){const m=new T.InstancedMesh(new T.BoxGeometry(1.1,1.1,1.1),new T.MeshLambertMaterial({color:0x8a8478}),80);m.instanceMatrix.array.fill(0);m.frustumCulled=false;gC.add(m);STOOL=m}
  const a=STOOL.instanceMatrix.array;a.fill(0);if(L)L.forEach((s,i)=>{if(i<80)wm(a,i*16,s[0]-Math.sin(s[2])*.05,.55,s[1]-Math.cos(s[2])*.05,s[2],0,0,1,1,1)});STOOL.instanceMatrix.needsUpdate=true}
 const POPFIG={Y:'man',W:'woman',K:'kohen',L:'levi',S:'sage',Q:'sit'};
 const CAP={'Y@A':900,'Y@N':1200,'W@N':800,'Y@M':900,'W@M':400,'K@A':170,'K@N':16,'L@A':60,'L@N':130,'L@M':40,'S@A':8,'S@C':8,'Q@A':90,'Q@C':90};
 /* ---- חפצים (props) ---- */
 const PROP={
  lamb:{o:[0,2.95,.05,0,0,1],g:()=>{const g=GB();g.add(new T.SphereGeometry(1,7,5),0xf1ece0,0,0,0,.62,.3,.34);g.add(new T.SphereGeometry(1,6,5),0xe4dccb,.7,.14,0,.2,.2,.17);[[-.3,.14],[.3,.14],[-.3,-.14],[.3,-.14]].forEach(([a,b])=>g.add(new T.CylinderGeometry(.04,.04,.3,4),0x6a5a48,a,-.3,b));return g.geo()}},
  torch:{o:[.42,2.0,.55,0,-.2,1],basic:1,g:()=>{const g=GB();g.add(new T.CylinderGeometry(.04,.05,1.3,5),0x4a3220,0,.45,0);g.add(new T.ConeGeometry(.17,.55,6),0xff8a1c,0,1.2,0);g.add(new T.ConeGeometry(.09,.38,5),0xffe27a,0,1.14,0);return g.geo()}},
  branch:{o:[.4,2.3,.4,0,.25,1],g:()=>{const g=GB();g.add(new T.CylinderGeometry(.025,.04,1.5,4),0x5a4a2a,0,.6,0);g.add(new T.ConeGeometry(.28,1.3,5),0x3d7a34,0,1.5,0);g.add(new T.ConeGeometry(.2,.9,5),0x4e8e3e,0,1.1,0,1,1,1,.3,0,.3);return g.geo()}},
  log:{o:[.28,2.78,0,0,0,1],g:()=>{const g=GB();g.add(new T.CylinderGeometry(.2,.2,2.3,6),0x4a3626,0,0,0,1,1,1,PI/2,0,0);g.add(new T.CircleGeometry(.19,6),0xa88050,0,0,1.16);return g.geo()}},
  trumpet:{o:[0,2.85,.3,0,0,1],g:()=>{const g=GB();g.add(new T.CylinderGeometry(.04,.04,2,6),0xdde1e6,0,0,1,1,1,1,PI/2,0,0);g.add(new T.ConeGeometry(.2,.5,8),0xdde1e6,0,0,2.1,1,1,1,PI/2,0,0);return g.geo()}},
  harp:{o:[.3,2.3,.5,0,.2,1],g:()=>{const g=GB();g.add(new T.BoxGeometry(.5,.08,.14),0xd8a838,0,.38,0);g.add(new T.BoxGeometry(.08,.8,.14),0xd8a838,-.22,0,0);g.add(new T.BoxGeometry(.08,.8,.14),0xd8a838,.22,0,0);[-.1,0,.1].forEach(x=>g.add(new T.BoxGeometry(.015,.7,.015),0xf2e8c8,x,0,0));return g.geo()}},
  bowl:{o:[0,2.3,.58,0,0,1],g:()=>{const g=GB();g.add(new T.CylinderGeometry(.25,.14,.14,8),0xffffff,0,0,0);return g.geo()},tint:1},
  basket:{o:[0,3.0,.18,0,0,1],g:()=>{const g=GB();g.add(new T.SphereGeometry(.42,8,5,0,TAU,0,PI/2),0xb98a4a,0,-.12,0,1,.7,1);[0xc0392b,0x7a3a9a,0xe8a838,0x58b868,0xc0392b].forEach((c,i)=>g.add(new T.SphereGeometry(.1,5,4),c,Math.cos(i*1.26)*.2,.15,Math.sin(i*1.26)*.2));return g.geo()}},
  flute:{o:[0,2.8,.35,0,0,1],g:()=>{const g=GB();g.add(new T.CylinderGeometry(.035,.035,1.1,5),0xb88a50,0,0,.4,1,1,1,PI/2,0,0);return g.geo()}},
  jar:{o:[0,2.15,.42,0,0,1],g:()=>{const g=GB();g.add(new T.SphereGeometry(.25,6,5),0x9a5a34,0,0,0,1,1.3,1);g.add(new T.CylinderGeometry(.08,.12,.2,6),0x9a5a34,0,.38,0);return g.geo()}}};
 const GRPS={A:()=>gA,N:()=>gN,M:()=>gM,C:()=>gC};
 const mLam=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide}),mLamC=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide}),mBas=new T.MeshBasicMaterial({vertexColors:true,side:T.DoubleSide});
 const _geoCache={};
 /* נקודת מראה יחידה: מראה כל דמות בהמון נבנה כאן ({robe,head} – גיאומטריה עם צבעי קודקודים, robe נצבע לפי המופע). מראה מ-FIG.crowdGeometry (src/figures.js), גיבוי LFIG כאן. מחליפים בלי לגעת בלוגיקת התנועה. */
 const buildCrowdGeometry=kind=>{if(typeof FIG!='undefined'&&FIG&&FIG.crowdGeometry){try{const g=FIG.crowdGeometry(kind,0);if(g&&g.robe&&g.head)return{robe:g.robe,head:g.head}}catch(e){console.warn('FIG.crowdGeometry',kind,e&&e.message)}}return LFIG[kind]()};
 const getFig=k=>_geoCache[k]||(_geoCache[k]=buildCrowdGeometry(k));const getProp=k=>PROP[k]._g||(PROP[k]._g=PROP[k].g());
 /* ---------------- ד. בריכות מופעים ---------------- */
 const POOLS={};
 function pool(pop,grp){const key=pop+'@'+grp;if(POOLS[key])return POOLS[key];const cap=CAP[key]||60,f=getFig(POPFIG[pop]);
  const mk=g=>{const m=new T.InstancedMesh(g,mLamC,cap);m.instanceMatrix.array.fill(0);m.frustumCulled=false;m.castShadow=false;(GRPS[grp]()).add(m);return m};
  const P={key,pop,grp,cap,robe:mk(f.robe),head:mk(f.head),props:{},agents:new Array(cap).fill(null),free:[],hi:0};
  for(let i=cap-1;i>=0;i--)P.free.push(i);
  const fp=typeof FIG!='undefined'&&FIG&&FIG.crowdPalette?FIG.crowdPalette(POPFIG[pop]):null,pal=(fp&&fp.length)?fp:(PAL[pop]||PAL.Y),c=new T.Color();for(let i=0;i<cap;i++){P.robe.setColorAt(i,c.setHex(pick(pal)));const s=.8+R()*.22;P.head.setColorAt(i,c.setRGB(s,s*.97,s*.94))}
  P.robe.instanceColor.needsUpdate=P.head.instanceColor.needsUpdate=true;P.robe.count=P.head.count=0;P.pop=pop;if(typeof REALP!='undefined')REALP.attach(P,POPFIG[pop]);   // count רק אחרי setColorAt (three מקצה את instanceColor לפי count)
  
  P.getProp=k=>{if(P.props[k])return P.props[k];const d=PROP[k],m=new T.InstancedMesh(getProp(k),d.tint?mLamC:(d.basic?mBas:mLam),cap);m.instanceMatrix.array.fill(0);m.frustumCulled=false;m.castShadow=false;
    if(d.tint){const cc=new T.Color();for(let i=0;i<cap;i++)m.setColorAt(i,cc.setHex(i%2?0xe8c060:0xdde1e6));m.instanceColor.needsUpdate=true}m.count=P.hi;(GRPS[grp]()).add(m);return P.props[k]=m};
  return POOLS[key]=P}
 const M16=new Float32Array(16);
 // מטריצה: Ry(yaw)·Rx(pitch)·Rz(roll)·scale  (פנים = +z)
 function wm(arr,o,x,y,z,yaw,pit,roll,sx,sy,sz){const c=Math.cos(yaw),s=Math.sin(yaw),cx=Math.cos(pit),sxn=Math.sin(pit),cz=Math.cos(roll),sz2=Math.sin(roll);
  const c0x=cz,c0y=cx*sz2,c0z=sxn*sz2,c1x=-sz2,c1y=cx*cz,c1z=sxn*cz,c2x=0,c2y=-sxn,c2z=cx;
  arr[o]=(c*c0x+s*c0z)*sx;arr[o+1]=c0y*sx;arr[o+2]=(-s*c0x+c*c0z)*sx;arr[o+3]=0;
  arr[o+4]=(c*c1x+s*c1z)*sy;arr[o+5]=c1y*sy;arr[o+6]=(-s*c1x+c*c1z)*sy;arr[o+7]=0;
  arr[o+8]=(c*c2x+s*c2z)*sz;arr[o+9]=c2y*sz;arr[o+10]=(-s*c2x+c*c2z)*sz;arr[o+11]=0;arr[o+12]=x;arr[o+13]=y;arr[o+14]=z;arr[o+15]=1}
 const DIRTY=new Set();
 function setCount(P,i){if(i!=null&&i+1>P.hi)P.hi=i+1;let h=P.hi;while(h>0&&!P.agents[h-1])h--;P.hi=h;P.robe.count=P.head.count=h;for(const k in P.props)P.props[k].count=h}
 /* ---------------- ה. סוכנים (דמות אחת): מקום, תנועה, חפץ ---------------- */
 const DYN=new Set(),STAT=[],BOW=[],SPECS=new Map();let _tid=0;
 let bowAmt=0,bowMode='';
 function writeAgent(a,t){
  const y=a.y+(a.dy||0),sc=a.s||1;
  if(a.obj){a.obj.position.set(a.x,y,a.z);a.obj.rotation.set(0,a.yaw,a.roll||0);a.obj.visible=a.vis!==false&&!HELD;return}
  const P=a.pool,o=a.i*16;wm(P.robe.instanceMatrix.array,o,a.x,y,a.z,a.yaw,a.pit||0,a.roll||0,sc,sc,sc);wm(P.head.instanceMatrix.array,o,a.x,y,a.z,a.yaw,a.pit||0,a.roll||0,sc,sc,sc);DIRTY.add(P);
  if(a.prop){const d=PROP[a.prop],m=P.getProp(a.prop),cy=Math.cos(a.yaw),sy=Math.sin(a.yaw),ox=d.o[0]*sc,oz=d.o[2]*sc;let fl=1;if(a.prop=='torch')fl=.85+.3*Math.sin(t*14+a.i*1.7);
   wm(m.instanceMatrix.array,o,a.x+ox*cy+oz*sy,y+d.o[1]*sc,a.z-ox*sy+oz*cy,a.yaw+d.o[3],(a.pit||0)+d.o[4],a.roll||0,sc*d.o[5],sc*d.o[5]*fl,sc*d.o[5]);DIRTY.add(m)}}
 function hideAgent(a){if(a.obj){a.obj.visible=false;return}const P=a.pool,o=a.i*16;for(let k=0;k<16;k++){P.robe.instanceMatrix.array[o+k]=0;P.head.instanceMatrix.array[o+k]=0;for(const q in P.props)P.props[q].instanceMatrix.array[o+k]=0}DIRTY.add(P);for(const q in P.props)DIRTY.add(P.props[q])}
 // מסלולים: נקודות [x,z], אורכים מצטברים
 const ROUTES={};
 function defRoute(id,pts,flat){const L=[0];for(let i=1;i<pts.length;i++)L.push(L[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));ROUTES[id]={id,pts,L,len:L[L.length-1],flat}}
 const routePos=(r,d,seg)=>{let i=Math.max(0,Math.min(seg||0,r.pts.length-2));while(i>0&&d<r.L[i])i--;while(i<r.pts.length-2&&d>r.L[i+1])i++;const a=r.pts[i],b=r.pts[i+1],u=(d-r.L[i])/Math.max(.001,r.L[i+1]-r.L[i]);return[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,Math.atan2(b[0]-a[0],b[1]-a[1]),i]};
 const ZCr=-57.5;
 defRoute('wood',[[-97,3.5],[-97,-1.2],[-97,-4.6],[-46,-4.6],[-46,5],[-29.5,5],[-29.5,-29.5],[-28,-31.5],[-28,-34]]);                                 // לשכת העצים → כבש → ראש המזבח (תמיד ב:ב–ג; מידות ה:ד)
 defRoute('limbs',[[-34.5,-64],[-46,-64],[-46,5],[-29.5,5],[-29.5,-29.5],[-27,-32]]);                                                               // בית המטבחיים → מערב המזבח → כבש (תמיד ג:א)
 defRoute('lamb',[[-52,-113],[-52,-100],[-46,-92],[-40,-80],[-34.5,-68]]);                                                                      // הבאת טלה לשחיטה (תמיד ג:ג)
 defRoute('ulam',[[-48,-57.5],[-64,-57.5]]);                                                                                                      // כבש האולם
 defRoute('water',[[-11,44],[-11,6.5],[-24,6.5],[-24,-29.5],[-29,-30]]);                                                                         // שער המים → כבש (סוכה ד:ט)
 defRoute('sovev',[[-8,-26],[-8,-63],[-46,-63],[-46,5.5],[-8,5.5],[-8,-26]]);                                                                    // הקפת המזבח (סוכה ד:ה)
 defRoute('insE',[[-56,-117],[-52,-109],[-8,-109],[-8,-34]]);defRoute('insW',[[-56,-117],[-52,-112],[-52,-70],[-46,-62],[-46,2],[-8,5],[-8,-30]]);                      // שתי כתות בודקות את העזרה (תמיד א:ג)
  defRoute('bikk',[[238,ZCr],[160,ZCr],[110,ZCr],[40,ZCr],[19,ZCr],[8,ZCr],[-6,ZCr],[-8,-52]]);                                                    // ביכורים: שער שושן → עזרת נשים → עזרת ישראל → המזבח (ביכורים ג:ג–ו)
 (()=>{const c=[];for(let i=0;i<=16;i++){const a=i/16*TAU;c.push([85+Math.cos(a)*14,ZCr+Math.sin(a)*12])}defRoute('simcha',c)})();                      // מחול האבוקות בעזרת נשים (סוכה ה:ד)
 defRoute('nicanor',[[44,ZCr],[19,ZCr],[7,ZCr]]);                                                                                                  // שער ניקנור וט״ו המעלות
 defRoute('azIn',[[-43,44],[-43,9],[-46,2],[-46,-64],[-40,-90]]);                                                                                 // כניסת ישראל משער הדלק אל חצר הצפון
 /* אימות מסלולים מול COL (נקרא מבחוץ לבדיקות) */
 function validate(){if(!GRID)buildGrid();const bad=[];for(const id in ROUTES){const r=ROUTES[id];for(let d=0;d<=r.len;d+=.6){const p=routePos(r,d);const y=levelY(p[0],p[1]);if(blocked(p[0],p[1],y,.5))bad.push(id+'@'+p[0].toFixed(1)+','+p[1].toFixed(1)+' y'+y.toFixed(1))}}return bad}
 /* ---------------- ו. הצבת סוכן לפי מפרט (spec) ---------------- */
 const yawTo=(x,z,tx,tz)=>Math.atan2(tx-x,tz-z);
 const angd=(a,b)=>((b-a+PI)%TAU+TAU)%TAU-PI;
 function faceOf(sp,x,z){const f=sp.face;if(f==null)return rr(0,TAU);if(typeof f=='number')return f;if(f=='altar')return yawTo(x,z,-26,-43);if(f=='east')return PI/2;if(f=='west')return -PI/2;if(f=='north')return PI;if(f=='south')return 0;if(f=='center')return yawTo(x,z,sp.cx!=null?sp.cx:-26,sp.cz!=null?sp.cz:-43);if(f=='out')return yawTo(sp.cx,sp.cz,x,z);if(f=='rand')return rr(0,TAU);return 0}
 /* ---- מחזור החיים של דמות: 'in' (נכנסת הולכת מן השער אל מקומה) → 'at' (עושה את מעשיה) → 'out' (יוצאת הולכת אל שער ההר). אין scale מן הרצפה ואין היעלמות פתאומית:
    דמות נוצרת/נעלמת "במקום" רק אם מקומה מוסתר מן המצלמה (הרצה מקדימה – כבר שם), אחרת – בשער, הולכת. ---- */
 let _uid=0;const ALL=new Set();let LQ=[];
 const laneXY=(a,p,y0,eff)=>{const nx=-Math.cos(p[2]),nz=Math.sin(p[2]);a.x=p[0]+nx*eff;a.z=p[1]+nz*eff;return y0};
 function routeLane(a,p0,dt){   // סטייה צדדית (נתיב) שלא נכנסת לקיר: בודקים גם 2.5 יחידות קדימה ואחורה, מצמצמים עד שפנוי, ונעים בהדרגה
  if(a.ly==null||!dt)a.ly=p0[2];else a.ly+=angd(a.ly,p0[2])*Math.min(1,dt*5);   // כיוון מוחלק – כדי שהסטייה הצדדית לא תקפוץ בפינות המסלול
  const p=[p0[0],p0[1],a.ly],r=a.r,y0=r.flat!=null?r.flat:(a.sp.y!=null?a.sp.y:levelY(p[0],p[1]));let tl=a.lane;
  const ok=(q,L)=>!blocked(q[0]-Math.cos(q[2])*L,q[1]+Math.sin(q[2])*L,y0,.6);
  if(tl){const f=routePos(r,Math.min(r.len,a.d+2.5),a.seg),b=routePos(r,Math.max(0,a.d-2.5),a.seg);f[2]=b[2]=a.ly;for(let i=0;i<4&&tl;i++){if(ok(p,tl)&&ok(f,tl)&&ok(b,tl))break;tl*=.5;if(i==3)tl=0}}
  if(a.eff==null)a.eff=tl;else if(dt)a.eff+=Math.max(-8*dt,Math.min(8*dt,tl-a.eff));else a.eff=tl;
  laneXY(a,p,y0,a.eff);if(a.eff&&blocked(a.x,a.z,y0,.5)){a.eff=tl;laneXY(a,p,y0,tl)}return y0}
 function pickHome(a,sp,k){
  a.sp=sp;a.k=k;a.uid=++_uid;a.frozen=false;a.dy=0;a.pit=0;a.roll=0;a.s=sp.sc||1;a.ph=R()*TAU;a.prop=null;a.wait=0;a.vis=true;a.d=0;a.dir=1;a.seg=0;a.okey=null;a.mode='at';a.path=null;a.rel=false;a.age=0;a.rage=0;a.easeT=0;a.eff=null;a.life=sp.rot?rr(sp.rot[0],sp.rot[1]):0;a.role=sp.role;a.fail=false;
  if(sp.prop&&(sp.propP==null||R()<sp.propP))a.prop=sp.prop;
  if(sp.t=='stand'){let p=null;if(sp.pts){const q=sp.pts[k%sp.pts.length];p={x:q[0],z:q[1],y:q[3]!=null?q[3]:(sp.y!=null?sp.y:levelY(q[0],q[1])),yaw:q[2]}}else p=sample(sp.rect,{ex:sp.ex,y:sp.y});
   if(!p){a.fail=true;return}a.x=p.x;a.z=p.z;a.y=p.y;if(p.k!=null&&!sp.pts){a.okey=p.k;OCC.add(p.k)}a.yaw=p.yaw!=null?p.yaw:faceOf(sp,a.x,a.z);a.base=a.yaw}
  else if(sp.t=='wander'){const p=sample(sp.rect,{ex:sp.ex,y:sp.y,free:1});if(!p){a.fail=true;return}a.x=p.x;a.z=p.z;a.y=p.y;a.yaw=rr(0,TAU);a.tx=a.x;a.tz=a.z;a.wait=rr(0,5)}
  else if(sp.t=='route'){const r=ROUTES[sp.route];a.r=r;a.d=sp.loop?(k/Math.max(1,sp.n))*r.len:(sp.spread?rr(0,r.len):(sp.start!=null?sp.start:0));a.lane=(sp.lane||0)*(k%2?1:-1)+rr(-.25,.25);a.spd=(sp.spd||2.2)*rr(.9,1.1);a.dir=sp.dir||1;
   const p=routePos(r,a.d,0);a.seg=p[3];a.y=routeLane(a,p,0);a.yaw=p[2]+(a.dir<0?PI:0)}
  a.hx=a.x;a.hz=a.z;a.hy=a.y;a.hyaw=a.yaw}
 // תכנון כניסה לפי תפקיד: שער לפי קרבה, ומסלול הליכה אל המקום; ההתחלה בנקודה המוסתרת הרחוקה ביותר לאורך המסלול (הרצה מקדימה) או בשער עצמו. null = עוד לא (שער עמוס / תקרת חישובים לפריים)
 let PCAP=4;
 function planEntry(role,hx,hz){if(PCAP<=0)return null;const pid=pickPortal(role,hx,hz);if(pid==null)return null;PCAP--;const path=pathFromPortal(pid,hx,hz);if(!path)return null;
  let s0=0;for(let s=path.len;s>0;s-=2){const q=pAt(path,s,0);if(hid(q[0],navY(q[0],q[1]),q[1])){s0=s;break}}
  if(s0>0){const j=R()*4;if(s0-j>0){const q=pAt(path,s0-j,0);if(hid(q[0],navY(q[0],q[1]),q[1]))s0-=j}}   // פיזור קל כדי שלא יתחילו כולם באותה נקודה
  const P=NP[pid];if(s0==0){if(NOW<P.next)return null;P.next=NOW+(.2+R()*.35)/BOOST}
  return{path,s0,gate:pid}}
 // כניסה: מוסתר → כבר שם; אחרת הולך מן השער. false = עוד לא (שער עמוס / יושב גלוי / הרשת עדיין נבנית)
 function enter(a){const sp=a.sp,hx=a.hx,hz=a.hz,hy=a.hy;
  if(hid(hx,hy,hz)){a.mode='at';return true}
  if(sp.seated||!NAVR)return false;
  const pl=planEntry(a.role,hx,hz);if(!pl)return false;
  a.gate=pl.gate;a.mode='in';a.path=pl.path;a.ps=pl.s0;a.pspd=rr(2.3,3.1);a.lat=rr(-.35,.35);const q=pAt(pl.path,pl.s0,0);a.pseg=q[3];a.x=q[0];a.z=q[1];a.y=navY(a.x,a.z);a.yaw=q[2];a.chk=0;return true}
 const settle=a=>{const sp=a.sp;if(sp.t!='stand'||sp.anim)DYN.add(a);else STAT.push(a)};
 function initAgent(a,sp,k){pickHome(a,sp,k);if(a.fail)return false;
  if(!enter(a)){if(a.okey!=null){OCC.delete(a.okey);a.okey=null}return false}
  if(a.mode=='at')settle(a);else DYN.add(a);
  if(sp.bow)BOW.push(a);ALL.add(a);
  if(a.pool){a.pool.agents[a.i]=a;setCount(a.pool,a.i)}
  if(sp.reg&&k<sp.reg&&typeof NPCS!='undefined')register(a,sp,k);
  writeAgent(a,0);return true}
 function register(a,sp,k){const n={id:sp.id+'#'+k,kind:sp.kind||'yisrael',who:sp.who||'',job:()=>typeof sp.job=='function'?sp.job(a):(sp.job||''),active:true,
   getPos:()=>new T.Vector3(a.x,a.y+(a.dy||0),a.z),pick:a.obj?{obj:a.obj}:{inst:a.pool.robe,index:a.i,head:a.pool.head},freeze:on=>{a.frozen=!!on},
   face:v=>{a.yaw=Math.atan2(v.x-a.x,v.z-a.z);a.base=a.yaw;if(a.obj||a.frozen)writeAgent(a,0)},extra:Object.assign({spec:sp.id,female:sp.pop=='W',instance:a.obj?null:{pool:a.pool.key,index:a.i}},sp.extra||{})};
  a.npc=n;NPCS.register(n)}
 // הגעה למקום: מפנים את הפנים בהדרגה (easeT) ועוברים להתנהגות המקום
 function arrive(a){const sp=a.sp;a.mode='at';a.path=null;a.x=a.hx;a.z=a.hz;a.y=a.hy;a.pyaw=a.yaw;a.age=0;a.rage=0;if(sp.t=='stand')a.easeT=.7;
  relieve(a)}
 // החלפת משמר: הממלא מקום הגיע (בהליכה או מוסתר) – הקודם באותו עמדה יוצא
 function relieve(a){const rec=SPECS.get(a.sp.id);if(rec){const o=rec.agents.find(x=>x.rel&&x.mode=='at'&&x!==a&&x.k===a.k);if(o)leave(o)}}
 function release(a){if(!a.on)return;a.on=false;ALL.delete(a);DYN.delete(a);if(a.okey!=null)OCC.delete(a.okey);hideAgent(a);if(a.obj)a.obj.userData.busy=false;
  if(a.npc){const l=NPCS.list,i=l.indexOf(a.npc);if(i>=0)l.splice(i,1);a.npc.active=false;a.npc=null}
  if(a.pool){a.pool.agents[a.i]=null;a.pool.free.push(a.i);setCount(a.pool)}}
 // יציאה: חוזרים אל שער ההר הקרוב. מוסתרים – נעלמים מיד (אף אחד לא רואה); אחרת הולכים (המסלול מחושב בתור מוגבל)
 function leave(a){if(!a.on||a.mode=='out')return;const rec=SPECS.get(a.sp.id);if(rec){const i=rec.agents.indexOf(a);if(i>=0){rec.agents.splice(i,1);if(!a.rel){rec.cnt--;rec.used[a.k]=0}}}
  if(a.okey!=null){OCC.delete(a.okey);a.okey=null}
  let i=STAT.indexOf(a);if(i>=0)STAT.splice(i,1);i=BOW.indexOf(a);if(i>=0)BOW.splice(i,1);
  a.mode='out';a.path=null;a.rel=false;a.chk=0;a.dy=0;a.pit=0;a.roll=0;DYN.add(a);LQ.push(a);
  if(hid(a.x,a.y,a.z))release(a)}
 function processLQ(budget){const t0=performance.now(),keep=[];let i=0;
  for(;i<LQ.length;i++){const a=LQ[i];if(!a.on||a.path||a.mode!='out')continue;
   if(hid(a.x,a.y,a.z)){release(a);continue}
   if(a.sp.seated||!NAVR||PCAP<=0){keep.push(a);continue}
   PCAP--;const p=pathOut(a.x,a.z);if(!p){keep.push(a);continue}a.path=p;a.ps=0;a.pseg=0;a.pspd=rr(2.3,3.1);a.lat=rr(-.35,.35);
   if(performance.now()-t0>budget){i++;break}}
  for(;i<LQ.length;i++)keep.push(LQ[i]);LQ=keep}
 /* דמות בודדת מפורטת (Group): כהן (priest) או חכם (שתי רשתות). ברשימה לכל מפרט – כדי שדמות יוצאת וחדשה נכנסת לא יתחלקו באותו Group */
 const SINGLES={};
 function mkSingle(sp){let g;
  if(sp.make=='priest'){g=mkPriest?mkPriest(sp.pk||'k',sp.pose||'idle',sp.beard):new T.Group();if(typeof REALP!='undefined'&&mkPriest)REALP.skin(g,'kohen',{seed:(SINGLES[sp.id]||[]).length*7+3})}   // אנשים "אמיתיים": הגוף מוחלף בתמונה לפני sp.attach (אבוקה נשארת)
  else{const f=getFig(sp.make||'sit');g=new T.Group();const c=new T.Color(pick(PAL.Q)),s=.85+R()*.15;const m1=new T.Mesh(f.robe,new T.MeshLambertMaterial({vertexColors:true,color:c,side:T.DoubleSide})),m2=new T.Mesh(f.head,new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide,color:new T.Color(s,s*.97,s*.94)}));g.add(m1,m2)}
  if(sp.attach)sp.attach(g);(GRPS[sp.grp||'A']()).add(g);g.visible=false;return g}
 function allocAgent(sp,k){
  if(sp.obj){const arr=SINGLES[sp.id]||(SINGLES[sp.id]=[]);let g=arr.find(x=>!x.userData.busy);if(!g){g=mkSingle(sp);arr.push(g)}g.userData.busy=true;return{on:true,obj:g,i:-1}}
  const P=pool(sp.pop,sp.grp);if(!P.free.length)return null;const i=P.free.pop();return{on:true,pool:P,i}}
 function unalloc(a){if(a.obj)a.obj.userData.busy=false;else if(a.pool)a.pool.free.push(a.i)}
 const roleOf=sp=>sp.role||(sp.grp=='N'?'W':(sp.grp=='M'||sp.grp=='C')?'M':(sp.pop=='K'||sp.pop=='L'||sp.pop=='S'||sp.pop=='Q'||sp.make=='priest')?'A':'W');
 function spawnOne(rec){const sp=rec.sp;let k=0;while(rec.used[k])k++;
  const a=allocAgent(sp,k);if(!a)return false;
  if(!initAgent(a,sp,k)){unalloc(a);return false}
  rec.agents.push(a);rec.cnt++;rec.used[k]=1;if(a.mode=='at')relieve(a);return true}
 function applySpecs(list){
  const want=new Map();list.forEach(s=>{s.role=roleOf(s);want.set(s.id,s)});
  for(const[id,rec]of SPECS){if(!want.has(id)){rec.agents.slice().forEach(leave);SPECS.delete(id)}}
  for(const sp of list){let rec=SPECS.get(sp.id);const n=sp.n|0;
   if(!rec){rec={sp,agents:[],n:0,cnt:0,used:[],retry:0};SPECS.set(sp.id,rec)}else{rec.sp=sp;rec.agents.forEach(a=>{a.sp=sp})}
   rec.n=n;
   while(rec.cnt>n){let a=null;for(let i=rec.agents.length-1;i>=0;i--)if(!rec.agents[i].rel){a=rec.agents[i];break}if(!a)break;leave(a)}}}
 // מילוי מפרטים: הצבות מוגבלות בזמן לפריים (שער עמוס/יושב גלוי → ממתינים ומנסים שוב)
 let FILLMS=2.5;
 function fill(){const t0=performance.now();for(const rec of SPECS.values()){if(rec.retry>NOW)continue;while(rec.cnt<rec.n){if(performance.now()-t0>FILLMS)return;if(!spawnOne(rec)){rec.retry=NOW+.15+R()*.2;break}}}}
 /* ---------------- ז. תכנון: מי איפה ומה עושה לפי יום ושעה ---------------- */
 const SLAUGH=[-40,-11,-92,-62],AZE=[-62,-5,-124,8],ISR=[1.8,11.4,-127,12.5],NASH=[19,155,-122,7],PLZ=[173,207,-128,16],PLZ2=[60,200,48,160];
 const SAN_GAZIT=()=>{const L=[];[[5.2,15],[7.9,23],[10.5,33]].forEach(([Rr,n],ri)=>{for(let i=0;i<n;i++){const ph=PI*(.06+.88*i/(n-1));L.push([-25.5-Rr*Math.cos(ph),-134+Rr*Math.sin(ph),ph-PI/2+PI,YA+1.18,ri==2&&i==16])}});return L};   // 71 כיסאות (lishkhot.js, אחרי סיבוב 180°)
 const SAN_CHEL=()=>{const L=[];[[5.2,15],[7.9,23],[10.5,33]].forEach(([Rr,n],ri)=>{for(let i=0;i<n;i++){const ph=PI*(.06+.88*i/(n-1));L.push([-80-Rr*Math.cos(ph),22+Rr*Math.sin(ph),ph-PI/2+PI,1.18,ri==2&&i==16])}});return L};   // חצי גורן בחיל הדרומי (z 22..33), פניהם למרכז
 /* קידוש ידיים ורגליים מן הכיור (משנה תמיד ב:א, יומא ג:ג–ו): חלונות הזמן שבהם הכהנים ניגשים לכיור – המים זורמים מן הברזים (life.js) */
 const WASH_ALL=[[4.65,5.2],[6.15,6.6],[9.4,9.8],[14.4,14.8]],WASH_YK=[[4.4,5.0],[7.9,8.3],[10.4,10.8],[13.0,13.4],[16.3,16.7]];   // ביום הכיפורים: חמש טבילות ועשרה קידושים (יומא ג:ו)
 function washNow(dayId,h){return(dayId=='yk'?WASH_YK:WASH_ALL).some(w=>h>=w[0]&&h<w[1])}
 /* עוצמת שלוש המדורות (0..1): [מערכה גדולה, מערכה שנייה לקטורת, מערכה שלישית לקיום האש] – לפי שעה ויום (משנה תמיד א:ב; יומא ב:ב–ד; מידות ב:ה; ויקרא ו:ה–ו) */
 function fireK(dayId,h){const sm=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x)};
  const hx=((h%24)+24)%24;let big;
  if(hx<4.5)big=.5;else if(hx<5.4)big=.5-.2*sm(4.5,4.9,hx);else if(hx<6.4)big=.3+.7*sm(5.4,6.4,hx);else if(hx<19)big=1;else big=1-.5*sm(19,20,hx);   // בלילה – אברים ופדרים נאכלים על המזבח; לפני עלות השחר מדשנים וחוזרים ומסדרים את המערכה
  const dm={chol:.85,shabbat:.85,rc:.95,'erev-pesach':1,pesach:1,shavuot:1,rh:1,yk:.9,sukkot:1}[dayId];big*=hx>=6.4&&hx<19?(dm==null?.9:dm):1;
  const ket=Math.max(sm(5,5.5,hx)-sm(7.2,7.8,hx),sm(14.3,14.8,hx)-sm(17,17.6,hx),dayId=='yk'?sm(10.3,10.7,hx)-sm(12,12.4,hx):0);
  return[big,ket,1]}
 function plan(dayId,h){
  const D=DAYS[dayId]||DAYS.chol,S={day:dayId,D,h,specs:[],caps:[],song:false,vis:{k:false,g:false,y:false},bow:'',walkHold:null};
  const add=s=>{S.specs.push(s);return s},cap=(id,t,src,prio)=>S.caps.push({id,t,src,prio:prio||5});
  const q=n=>Math.max(n>0?1:0,Math.round(n*Qv)),yk=dayId=='yk',erev=dayId=='erev-pesach',kitot=erev&&h>=14.75&&h<17.3;
  const night=h>=19.5||h<3.5;
  const tamidEnd=erev?13.5:14.5;                 // שחיטת התמיד של בין הערבים: ח׳ וחצי; בערב פסח ז׳ וחצי (פסחים ה:א) – שעת שחר בדגם ≈ 6:00
  const offered=erev?14.5:15.5;                  // הקרבתו: ט׳ וחצי; בערב פסח ח׳ וחצי
  S.song=inW(h,7.5,9.5)||(D.mus&&inW(h,9.5,11.5))||(erev?inW(h,14.5,17.4):inW(h,15,17));
  S.basket=S.song&&!kitot;S.rake=inW(h,4.6,5.6);S.wave=!kitot&&!yk&&!night&&(dayId=='shavuot'?inW(h,9.5,11):(inW(h,9.5,10.5)||inW(h,14,15)));   // כהנים מפורטים (people.js): סל מנחה בכבש בנסכים; דישון בבוקר; תנופת חזה ושוק של שלמים (ויקרא ז:ל–לד)
  S.vis.k=h>=5&&h<19;S.vis.g=D.gold&&inW(h,7.5,11.5);if(yk){S.vis.g=inW(h,6,8);S.vis.y=inW(h,8,16.5)}
  // שמירות – תמיד (מידות א:א)
  {const mount=[[-102,-239.5],[10,239.5],[40,239.5],[-239.5,-100],[239.5,ZCr],[-239.5,-239.5],[239.5,-239.5],[239.5,237.5],[-239.5,237.5]];
   add({id:'g-mount',t:'stand',pop:'L',grp:'M',kind:'shoer',n:9,pts:mount.map(p=>[p[0],p[1],yawTo(p[0],p[1],-60,-57)]),noGrow:1,rot:[160,230],relief:1,why:'משמר',reg:2,job:'עומד במשמר על שער/פינת הר הבית',who:'לוי שומר – אחד מעשרים ואחד משמרות הלויים (משנה מידות א:א)',extra:{post:'הר הבית'}});
   add({id:'g-azarah',t:'stand',pop:'L',grp:'A',kind:'shoer',n:12,noGrow:1,rot:[160,230],relief:1,why:'משמר',reg:2,job:'עומד במשמר על שערי העזרה',who:'לוי שומר – משמר השערים והפינות (משנה מידות א:א)',
    pts:[[9.5,-52.5],[-43,8.2],[-27,8.2],[-11,8.2],[-121,-122.6],[13.5,-132],[-182,-132],[13.5,17.5],[-182,17.5],[-118,-121],[-57,-40],[-169.5,-57.5]].map((p,i)=>[p[0],p[1],yawTo(p[0],p[1],-60,-57),i>=5&&i<=8?0:undefined])});
   cap('guards','הלויים שומרים בעשרים ואחד מקומות: חמישה על שערי הר הבית, ארבעה בפינותיו, חמישה על שערי העזרה, ארבעה בפינותיה מבחוץ ועוד שלושה (מקומותיהם המדויקים מוערכים)','משנה מידות א:א',8);
   add({id:'g-kohen',t:'stand',pop:'K',grp:'A',kind:'shoer',n:3,pts:[[-77,-5,0],[-151,-122,PI],[-54.5,-116,-PI/2]],noGrow:1,rot:[160,230],relief:1,why:'משמר',reg:3,job:'שומר בבית אבטינס / בבית הניצוץ / בבית המוקד',who:'כהן שומר – שלושה מקומות שבהם הכהנים שומרים (משנה מידות א:א; תמיד א:א)'});
   cap('gk','הכהנים שומרים בשלושה מקומות: בית אבטינס, בית הניצוץ ובית המוקד','משנה מידות א:א; תמיד א:א',8)}
  if(night&&!S.song){add({id:'night',t:'route',obj:1,make:'priest',pk:'k',beard:0x4a3426,kind:'ish-har-habayit',grp:'A',n:1,route:'sovev',loop:1,spd:2.8,anim:'walk',flat:YA,reg:1,noGrow:1,
    attach:g=>{const t=new T.Mesh(getProp('torch'),mBas);t.position.set(.55,2.2,.7);t.scale.setScalar(1.3);g.add(t)},job:'מחזר על המשמרות עם אבוקה; מי שישן – מכים אותו ושורפים את בגדיו',who:'איש הר הבית – הממונה על משמרות הלויים (משנה מידות א:ב)'});
   cap('night','איש הר הבית מחזר בלילה על כל משמר ואבוקות דולקות לפניו; לוי שישן על משמרו – חובטים אותו ושורפים את בגדיו','משנה מידות א:ב',2)}
  if(h<3.6)cap('sleep','זקני בית אב ישנים בבית המוקד ומפתחות העזרה בידם; פרחי כהונה ישנים על הארץ בלי בגדי קודש','משנה תמיד א:א',4);
  // לפני עלות השחר (תמיד א:ב–ג, ב:א–ג)
  if(inW(h,3.5,4.3)){add({id:'pais',t:'stand',pop:'K',grp:'A',kind:'kohen',n:9,rect:[-56,-40,-123,-112],face:'rand',anim:'sway',prop:'torch',propP:.25,reg:1,job:'טובל ומפיס על תרומת הדשן',who:'כהן בית אב – מתכנסים להפיס (פייס) לפני בוא הממונה'});
   cap('pais','כהנים שטבלו מפיסים לתרומת הדשן; הממונה בא ודופק עליהם סמוך לקריאת הגבר','משנה תמיד א:ב',2)}
  if(inW(h,4.3,4.8)){['E','W'].forEach(s=>add({id:'ins'+s,t:'route',pop:'K',grp:'A',kind:'kohen',n:4,route:'ins'+s,spd:2.4,lane:.5,anim:'walk',prop:'torch',propP:.5,reg:s=='E'?1:0,loop:0,start:0,job:'בודק את העזרה באבוקה בכת '+(s=='E'?'המזרחית':'המערבית'),who:'כהן בודק את העזרה – שתי כתות, מזרח ומערב'}));
   cap('ins','שתי כתות נכנסות מבית המוקד עם אבוקות ובודקות את העזרה – אלו באכסדרה מזרח ואלו מערב – עד בית עושי החביתין','משנה תמיד א:ג',2)}
  if(inW(h,4.6,5.4)){const alt=[[-28,-34],[-32.5,-41,0],[-32.5,-44.5,0],[-26,-47.5,PI],[-20,-45,PI],[-27,-31.5,PI]];
   add({id:'dashen',t:'stand',pop:'K',grp:'A',kind:'kohen',n:5,pts:alt.map(p=>[p[0],p[1],p[2]!=null?p[2]:PI,YA+9]),anim:'sway',reg:2,job:'מגרף את הדשן בראש המזבח',who:'כהן – אחי התורם: לוקחים מגרפות וצינורות ועולים לראש המזבח'});
   add({id:'wood',t:'route',pop:'K',grp:'A',kind:'kohen',n:3,route:'wood',spd:2.3,lane:.4,anim:'walk',prop:'log',spread:1,reg:1,job:a=>a.dir>0?'נושא גזרי עץ מלשכת העצים אל המערכה':'חוזר ללשכת העצים',who:'כהן – מעלה עצים למערכה (כל העצים כשרים חוץ מזית וגפן)'});
   cap('dashen','אחיו של תורם הדשן ממהרים, מקדשים ידיים ורגליים, עולים עם המגרפות; מעלים באפר על התפוח ואחר כך גזרי עץ לסדר אש המערכה','משנה תמיד ב:א–ג',2)}
  if(inW(h,5.0,5.9)){add({id:'lamb',t:'route',pop:'K',grp:'A',kind:'kohen',n:3,route:'lamb',spd:2,lane:.5,anim:'walk',prop:'lamb',reg:1,loop:0,start:0,job:'מביא טלה לתמיד מלשכת הטלאים',who:'כהן – מביא את טלה התמיד (תמיד ג:ג)'});
   cap('lots','הממונה: באו והפיסו – מי שוחט, מי זורק, מי מדשן מזבח הפנימי והמנורה, מי מעלה אברים לכבש; ואז: צאו וראו אם הגיע זמן השחיטה (ברקאי / האיר המזרח)','משנה תמיד ג:א–ג',2)}
  if(washNow(dayId,h)){S.wash=true;const kp=[[-58,-26.4],[-58,-33.4],[-61.4,-30]].map(p=>[p[0],p[1],yawTo(p[0],p[1],-58,-30)]);   // סביב הכיור (x=-58, z=-30)
   add({id:'kiyor-w',t:'stand',pop:'K',grp:'A',kind:'kohen',n:3,pts:kp,anim:'sway',reg:2,job:'מקדש ידיו ורגליו מן הכיור',who:'כהן – מקדש ידיים ורגליים מן הברזים של הכיור'});
   cap('kiyor','הכהנים מקדשים ידיהם ורגליהם מן הכיור (שנים עשר ברזים) – ידיו הימנית על הרגל הימנית והשמאלית על השמאלית – לפני כל עבודה במקדש'+(yk?'; כהן גדול טובל חמש טבילות ומקדש עשרה קידושים בימי הכיפורים':''),'משנה תמיד ב:א; יומא ג:ג,ו',3)}
  // תמיד של שחר: שוחטים ומעלים אברים (תמיד ג:א)
  if(inW(h,5.2,7.0)){add({id:'tm-sl',t:'stand',pop:'K',grp:'A',kind:'kohen',n:7,rect:[-39,-24,-86,-66],face:'altar',anim:'sway',reg:2,job:'שוחט/מקבל/זורק את דם התמיד',who:'כהן בעבודת התמיד של שחר – שחיטה וקבלת הדם'});
   add({id:'tm-limb',t:'route',pop:'K',grp:'A',kind:'kohen',n:5,route:'limbs',spd:2.2,lane:.5,anim:'walk',prop:'lamb',reg:1,spread:1,job:a=>a.dir>0?'מעלה את אברי התמיד לכבש':'יורד מן הכבש',who:'כהן – מעלה אברים לכבש',});
   add({id:'tm-alt',t:'stand',pop:'K',grp:'A',kind:'kohen',n:4,pts:[[-28,-34,PI],[-23,-30.5,PI],[-18,-30.5,PI],[-26,-47.5,PI]].map(p=>[p[0],p[1],p[2],YA+9]),anim:'sway',reg:1,job:'מסדר אברים ועצים על המערכה',who:'כהן על ראש המזבח'});
   cap('tamid','תמיד של שחר: שוחטים בצפון, זורקים את הדם, ומעלים את האברים בכבש למערכה','משנה תמיד ג:א; ד:א',2)}
  if(inW(h,5.1,5.8)||inW(h,6.2,7.0)){const first=h<6;add({id:'ulam'+(first?'1':'2'),t:'route',pop:'K',grp:'A',kind:'kohen',n:first?3:4,route:'ulam',spd:1.6,lane:1.2,anim:'walk',loop:0,start:0,reg:1,job:first?'עולה בכבש האולם עם הטני והכוז לדשן את מזבח הפנימי ואת המנורה':'עולה בכבש האולם להקטיר את הקטורת',who:'כהן – עולה אל ההיכל (לפי הפייס)'});
   cap('ulam',first?'מי שזכה בדשון מזבח הפנימי והמנורה נכנס להיכל עם הטני והכוז ושני מפתחות, ופותח את השער הגדול – ורק כששמעו את קולו שחט השוחט':'לקטורת: "חדשים לקטרת באו והפיסו" – הזוכים בפייס עולים בכבש האולם להקטיר','משנה תמיד ג:ו–ט; ה:ב',3)}
  // נסכים ושירה (תמיד ז:ג)
  if(S.song&&!kitot){S.bow='cycle';add({id:'ns-alt',t:'stand',pop:'K',grp:'A',kind:'kohen',n:3,pts:[[-28,-34,PI],[-23,-30.5,PI],[-18,-30.5,PI]].map(p=>[p[0],p[1],p[2],YA+9]),anim:'sway',job:'עומד על המזבח בשעת הנסכים',who:'כהן בנסכים'});
   cap('song','נסכים ושירה: הסגן מניף בסודרין, בן ארזא מקיש בצלצל, הלויים אומרים שירה, החצוצרות תוקעות – והעם משתחווה על כל פרק ופרק','משנה תמיד ז:ג',1);
   add({id:'maamad',t:'stand',pop:'Y',grp:'A',kind:'yisrael',n:q(8),rect:[2,10.5,-110,-6],face:'west',anim:'sway',bow:1,reg:2,job:'עומד על הקרבן (איש מעמד) ומשתחווה בכל תקיעה',who:'איש מעמד – נציג ישראל שעומד על קרבן הציבור (משנה תענית ד:ב)',extra:{role:'maamad'}});
   cap('maamad','אנשי מעמד: על כל משמר כהנים עמד מעמד של כהנים, לוויים וישראלים – כדי שקרבן הציבור יהיה "עומד על גביו"','משנה תענית ד:ב',4)}
  // מוסף
  if(D.mus&&inW(h,9.5,11.5)){const t=dayId=='shabbat'?['מוסף שבת: שני כבשים בנוסף לתמידים','במדבר כח:ט–י']:dayId=='rc'?['מוסף ראש חודש: שני פרים, איל, שבעה כבשים ושעיר חטאת','במדבר כח:יא–טו']:yk?['מוסף יום הכיפורים: פר, איל, שבעה כבשים ושעיר','במדבר כט:ז–י']:dayId=='rh'?['מוסף ראש השנה; התקיעות במקדש: שופר מאריך (קרן יעל פשוטה, פיה מצופה זהב) וחצוצרות מקצרות משני צדדיו','משנה ראש השנה ג:ג']:dayId=='shavuot'?['מוסף שבועות, ובו קרבן שתי הלחם בתנופה','במדבר כח:כו–לא; ויקרא כג:יז–כ']:dayId=='sukkot'?['מוסף סוכות: פרי החג – שלושה עשר פרים ביום הראשון ובכל יום פר אחד פחות','במדבר כט:יב–לב']:dayId=='pesach'?['מוסף חול המועד פסח: שני פרים, איל ושבעה כבשים','במדבר כח:יט–כד']:['מוסף היום','במדבר כח–כט'];
   cap('mus',t[0],t[1],2);add({id:'mus-k',t:'stand',pop:'K',grp:'A',kind:'kohen',n:8,rect:[-40,-12,-90,-62],face:'altar',anim:'sway',reg:1,job:'מכין קרבן מוסף',who:'כהן בעבודת קרבן המוסף'})}
  if(dayId=='rh'&&inW(h,9.5,11.5))S.shofar=1;
  // בין התמידים: קרבנות יחידים ונדבות
  if(h>=7&&h<17.5&&!kitot){const nb=Math.round(({chol:6,shabbat:4,rc:8,pesach:12,erev:16,shavuot:12,rh:10,yk:0,sukkot:12})[dayId=='erev-pesach'?'erev':dayId]*Qv+1);
   if(nb>1){add({id:'baalei',rot:[22,50],t:'stand',pop:'Y',grp:'A',kind:'yisrael',n:nb,rect:[-40,-12,-92,-66],face:'rand',anim:'sway',prop:'lamb',propP:.5,reg:2,job:'מביא קרבן: סומך ידיו על ראשו ושוחט בעזרה',who:'ישראל בעל קרבן בעזרה'});
    cap('baalei','בעלי קרבנות סומכים ידיהם ושוחטים בעזרה; הכהנים מקבלים את הדם וזורקים','ויקרא א:ד–ה',5)}
   add({id:'tk-sl',t:'stand',pop:'K',grp:'A',kind:'kohen',n:Math.max(3,Math.round(nb/2)),rect:[-40,-12,-90,-64],face:'rand',anim:'sway',job:'עובד בקרבנות יחידים',who:'כהן בעבודת יום'})}
  if(dayId=='erev-pesach'&&inW(h,tamidEnd,offered))cap('pes-t','בערב פסח התמיד נשחט בשבע וחצי ומוקרב בשמונה וחצי (ואחריו הפסח); בשאר הימים – בשמונה וחצי ובתשע וחצי','משנה פסחים ה:א',2);
  if(h>=tamidEnd&&h<tamidEnd+.7)cap('pm','תמיד של בין הערביים – נשחט בשמונה שעות וחצי ומוקרב אחריו בשעה (בימים רגילים)','משנה פסחים ה:א',3);
  // שחיטת הפסחים בשלוש כתות (פסחים ה:ה–י)
  if(kitot){const kn=h<15.6?1:h<16.45?2:3;S.kitah=kn;const rows=[-34.5,-25.5,-16.5];
   const ex=rows.map(x=>[x-1.5,x+1.5,-100,-62]);
   rows.forEach((x,ri)=>{const pts=[];for(let i=0;i<13;i++)pts.push([x,-62.5-i*2.3,0,YA]);add({id:'row'+ri+'-'+kn,t:'stand',pop:'K',grp:'A',kind:'kohen',n:13,pts,anim:'pass',prop:'bowl',reg:ri==0?2:0,noGrow:1,
     job:ri%2==0?'מושיט בזיך כסף לחברו – שורה של כסף':'מושיט בזיך זהב לחברו – שורה של זהב',who:'כהן בשורה: מקבל את דם הפסח במלא ומחזיר את הריקן; הקרוב למזבח זורק זריקה אחת כנגד היסוד'})});
   add({id:'k-az-'+kn,t:'stand',pop:'Y',grp:'A',kind:'yisrael',n:q(430),rect:[-62,-5,-124,8],ex:ex.concat([[-44,-8,-61,5.5]]),face:'altar',anim:'sway',prop:'lamb',propP:.65,bow:0,reg:4,job:'שוחט את פסחו בעזרה ומקבל הכהן את דמו',who:'ישראל בכת '+(['ראשונה','שנייה','שלישית'][kn-1])+' של הפסח – נכנסו ונתמלאה העזרה'});
   add({id:'k-in',t:'route',pop:'Y',grp:'A',kind:'yisrael',n:q(60),route:'azIn',spd:1.7,lane:1.1,anim:'walk',prop:'lamb',spread:1,reg:1,job:'נכנס לעזרה עם פסחו (שער הדלק)',who:'ישראל נושא טלה לשחיטת הפסח'});
   cap('kitot','הפסח נשחט בשלוש כתות: נכנסה כת ראשונה – נתמלאה העזרה, נעלו הדלתות, תקעו הריעו ותקעו; הכהנים עומדים בשורות עם בזיכי כסף וזהב ומושיטים את הדם מיד ליד; קראו את ההלל (כת '+['א׳','ב׳','ג׳'][kn-1]+')','משנה פסחים ה:ה–ז; יוספוס, מלחמות ו:ט.ג (ט׳–י״א שעות)',1);
   cap('kitot2','אחרי כל כת: יצאה כת ראשונה וישבה בהר הבית, השנייה בחיל והשלישית במקומה עומדת; בחשכה יצאו וצלו את פסחיהן; תולים ומפשיטים באנקליות של ברזל','משנה פסחים ה:ט–י',3);
   S.bow='';S.song=true}
  // סנהדרין (סנהדרין פח ע״ב): מתמיד של שחר עד תמיד של בין הערביים בלשכת הגזית; בשבתות וימים טובים – בחיל
  if(inW(h,5.3,tamidEnd)){const gaz=!D.yt,seats=gaz?SAN_GAZIT():SAN_CHEL(),grp=gaz?'A':'C';S.stools=gaz?null:seats;const reg=[54,53,55,20,60,5,45,30];   // הנשיא באמצע הקשת החיצונית (אינדקס 54) וממנו שבעה חברים בולטים
   const singles=new Set(reg);
   reg.forEach((idx,j)=>{const s=seats[idx];add({id:'sanh-s'+j+(gaz?'g':'c'),t:'stand',obj:1,make:'sit',seated:1,grp,kind:'sanhedrin',n:1,pts:[[s[0],s[1],s[2],s[3]]],anim:'sway',noGrow:1,reg:1,
     job:()=>'יושב בבית דין הגדול '+(gaz?'בלשכת הגזית':'בחיל (שבת/יום טוב)')+' ודן בהלכה',who:j==0?'נשיא הסנהדרין – יושב במרכז חצי הגורן':'חבר בית הדין הגדול של שבעים ואחד (סנהדרין)',extra:{role:j==0?'nasi':'dayan',seat:idx}})});
   add({id:'sanh',seated:1,t:'stand',pop:'Q',grp:grp,kind:'sanhedrin',n:seats.length-reg.length,pts:seats.filter((s,i)=>!singles.has(i)).map(s=>[s[0],s[1],s[2],s[3]]),anim:'sway',noGrow:1,reg:0,job:'יושב בבית דין הגדול',who:'חבר בית הדין הגדול'});
   add({id:'sanh-sf'+(gaz?'g':'c'),t:'stand',pop:'S',grp:grp,kind:'sanhedrin',n:2,pts:gaz?[[-28.5,-131.4,0,YA],[-22.5,-131.4,0,YA]]:[[-83,26.3,-PI/2,0],[-77,26.3,-PI/2,0]],noGrow:1,reg:2,job:'סופר הדיינים – כותב את דברי המזכים והמחייבים',who:'סופר הדיינים (אחד מימין ואחד משמאל – משנה סנהדרין ד:ג)'});
   cap('sanh',gaz?'הסנהדרין הגדולה (71) יושבת בלשכת הגזית בחצי גורן עגולה מתמיד של שחר עד תמיד של בין הערביים':'בשבת וביום טוב הסנהדרין אינה בלשכת הגזית אלא יושבת בחיל','גמרא סנהדרין פח ע״ב; משנה סנהדרין ד:ג',1)}
  else if(h>=tamidEnd&&h<tamidEnd+3&&!D.yt)cap('sanh0','תמיד של בין הערביים נשחט – הסנהדרין סיימה את ישיבתה בלשכת הגזית; מחר, מתמיד של שחר','גמרא סנהדרין פח ע״ב',4);
  // קהל לפי ימים
  const cr=D.cr;let hw=0;if(h>=4.5&&h<8)hw=(h-4.5)/3.5;else if(h>=8&&h<16)hw=1;else if(h>=16&&h<18.5)hw=1-(h-16)/2.5;
  const nsukNight=dayId=='sukkot'&&(h>=19.2||h<3.2);
  if(hw>0.02||nsukNight){const nIs=q(cr[0]*hw),nN=q(cr[1]*hw),nP=q(cr[2]*hw);
   if(nIs)add({id:'c-isr',rot:[22,50],t:'wander',pop:'Y',grp:'A',kind:'yisrael',n:nIs,rect:ISR,y:YI,spd:.9,reg:3,job:'עומד בעזרת ישראל וצופה בעבודה',who:'ישראל בעזרת ישראל – מרחק אחד־עשרה אמות מן העזרה',prop:'lamb',propP:.18});
   if(nN>8)add({id:'c-nic',t:'route',pop:'Y',grp:'N',kind:'yisrael',n:Math.min(60,Math.round(nN/9)),route:'nicanor',spd:1.5,lane:2.6,anim:'walk',spread:1,reg:1,job:a=>a.dir>0?'עולה במעלות שער ניקנור אל עזרת ישראל':'יורד מעזרת ישראל לעזרת נשים',who:'ישראל בשער ניקנור – ט״ו המעלות מעזרת נשים אל עזרת ישראל (מידות ב:ה)'});
   if(nN){const ny=Math.round(nN*.6),nw=nN-ny;add({id:'c-nm',rot:[22,50],t:'wander',pop:'Y',grp:'N',kind:'yisrael',n:ny,rect:NASH,y:YN,spd:1,reg:3,job:'מסתובב בעזרת נשים',who:'ישראל בעזרת נשים (פתוחה לכל ישראל)'});add({id:'c-nw',rot:[22,50],t:'wander',pop:'W',grp:'N',kind:'yisrael',n:nw,rect:NASH,y:YN,spd:.9,reg:3,job:'מסתובבת בעזרת נשים',who:'אישה בעזרת נשים',extra:{female:true}})}
   if(nP){const py=Math.round(nP*.62),pw=nP-py;add({id:'p-m',rot:[22,50],t:'wander',pop:'Y',grp:'M',kind:'yisrael',n:py,rect:PLZ,y:0,spd:1.1,reg:2,job:'עולה לרגל בהר הבית ממתין להיכנס',who:'עולה לרגל בחצר הר הבית'});add({id:'p-w',rot:[22,50],t:'wander',pop:'W',grp:'M',kind:'yisrael',n:pw,rect:PLZ,y:0,spd:1,reg:1,job:'עולה לרגל בהר הבית',who:'אישה בהר הבית',extra:{female:true}});
    if(dayId!='chol'&&dayId!='shabbat'&&dayId!='rc'&&dayId!='yk')add({id:'p-m2',rot:[22,50],t:'wander',pop:'Y',grp:'M',kind:'yisrael',n:Math.round(nP*.5),rect:PLZ2,y:0,spd:1.1,job:'עולה לרגל בהר הבית',who:'עולה לרגל בחצר הר הבית'})}
   if(dayId=='erev-pesach')cap('pil','בערב פסח עולים המונים: יוספוס מספר 256,500 קרבנות פסח, ולפחות עשרה אנשים לכל קרבן; השחיטה משעה תשיעית עד אחת־עשרה','יוספוס, מלחמות ו:ט.ג',3);else if(dayId!='chol')cap('pil','ברגלים עולים כל זכורך לראות את פני ה׳ בירושלים – המונים בהר הבית ובעזרת נשים','דברים טז:טז',5)}
  if(hw<=.02&&!nsukNight&&night)cap('closed','הלילה: העזרה שקטה, שערי העזרה נעולים (המפתחות אצל זקני בית אב בבית המוקד)','משנה תמיד א:א',5);
  // בשבת: סדר מיוחד; בר״ח – כהנים רבים; נוספים
  if(dayId=='shabbat'&&h>=9&&h<14)cap('shab','בשבת הפסחים והנדבות נדחים; תמיד ומוסף קרבים; לחם הפנים מוחלף (ויקרא כד:ח)','משנה פסחים ה:ט; ויקרא כד:ח',6);
  // יום הכיפורים
  if(yk){const stand=inW(h,6.5,17.5)?q(cr[3]):0;
   if(stand)add({id:'yk-stand',t:'stand',pop:'Y',grp:'A',kind:'yisrael',n:stand,rect:AZE,ex:[[-44,-8,-61,5.5]],face:'altar',anim:'sway',bow:1,reg:4,job:'עומד בעזרה כל היום; כורע ומשתחווה כששומע את השם המפורש',who:'ישראל העומדים בעזרה ביום הכיפורים (משנה יומא ו:ב)'});
   if(inW(h,8.4,9.3)){add({id:'yk-par',t:'stand',pop:'K',grp:'A',kind:'kohen',n:5,rect:[-60,-46,-52,-36],face:'east',anim:'sway',reg:2,job:'עומד בין האולם למזבח – כהן גדול סומך שתי ידיו על הפר ומתודה',who:'כהן – עומד עם כהן גדול בווידוי על הפר (יומא ג:ח)'});
    cap('ykpar','כהן גדול סומך שתי ידיו על ראש פר החטאת ומתודה: "אנא השם, עויתי פשעתי חטאתי לפניך, אני וביתי" – והכהנים והעם עונים "ברוך שם כבוד מלכותו לעולם ועד"','משנה יומא ג:ח; ו:ב',2)}
   if(inW(h,9.3,10.3)){add({id:'yk-lots',t:'stand',pop:'K',grp:'A',kind:'kohen',n:6,rect:[-39,-24,-86,-66],face:'altar',anim:'sway',prop:'lamb',propP:.34,reg:2,job:'שני השעירים עומדים לפני כהן גדול; מטילים גורל – אחד לה׳ ואחד לעזאזל',who:'כהן – מסייע בגורל שני השעירים (יומא ד:א)'});
    cap('yklots','שני שעירים עומדים לפני כהן גדול בצפון המזבח; מטילים גורלות בקלפי – "לה׳" ו"לעזאזל" – וקושרים לשון של זהורית על ראש המשתלח','משנה יומא ג:ט–י; ד:א',2)}
   if(inW(h,10.6,11.4)){add({id:'yk-ulam',t:'route',pop:'K',grp:'A',kind:'kohen',n:3,route:'ulam',spd:1.6,lane:1.2,anim:'walk',loop:0,start:0,reg:1,job:'מלווה את כהן גדול אל ההיכל עם מחתת גחלים וכף קטורת',who:'כהן – מלווה את כהן גדול בכניסה לקודש הקדשים (יומא ה:א)'});
    cap('ykket','כהן גדול נוטל מחתה של גחלים מן המזבח ומלוא חפניו קטורת דקה, נכנס לקודש הקדשים ומעלה את הקטורת עד שהבית מתמלא עשן','משנה יומא ד:ד–ה:א; ויקרא טז:יב–יג',2)}
   if(inW(h,12.3,13.3))cap('yksa','השעיר המשתלח נמסר לאיש עתי – מוליכים אותו אל המדבר, וגדולי ירושלים מלווים אותו עד סוף עשר סוכות','משנה יומא ו:ב–ד; ויקרא טז:כא–כב',3);
   const vid=inW(h,8.6,8.8)||inW(h,9.3,9.5)||inW(h,10.1,10.3);if(vid){S.bow='prost'}
   cap('yk1','הכהנים והעם העומדים בעזרה – כששומעים את השם המפורש יוצא מפי כהן גדול הם כורעים, משתחווים ונופלים על פניהם ואומרים "ברוך שם כבוד מלכותו לעולם ועד"','משנה יומא ו:ב',1);
   if(inW(h,11.3,12.2)){S.walkHold={y:1};cap('yk2','כהן גדול קורא בתורה בעזרה בעמידה (אחרי מות ואך בעשור), וחזן הכנסת מוסר את הספר לראש הכנסת, לסגן ולכהן גדול','משנה יומא ז:א',2)}
   if(S.vis.g)cap('ykg','כהן גדול בבגדי זהב עובד בתמיד של שחר; אחר כך בבגדי לבן לעבודת היום','משנה יומא ג:ד–ו; ז:ג',3);else if(S.vis.y)cap('ykw','כהן גדול בבגדי לבן – עבודת יום הכיפורים (פר, שעירים, קטורת בקודש הקדשים)','ויקרא טז; משנה יומא',3)}
  if(S.vis.g&&!yk)cap('kg','כהן גדול בשמונה בגדים בשבת/במועד: עולה בכבש והסגן בימינו, סומך על האברים וזורק','משנה תמיד ז:ג',3);
  // סוכות
  if(dayId=='sukkot'){
   if(inW(h,7,9.5)){add({id:'water',t:'route',pop:'K',grp:'A',kind:'kohen',n:7,route:'water',spd:2.1,lane:.9,anim:'walk',prop:'trumpet',propP:.28,reg:1,loop:0,spread:1,job:a=>a.dir>0?'עולה עם צלוחית של זהב ממי השלוח לנסוך על המזבח':'יורד מן הכבש',who:'כהן – ניסוך המים (שער המים, תקעו והריעו ותקעו)'});
    cap('nisuch','ניסוך המים: ממלאים צלוחית זהב מחזיקה שלושה לוגים מן השילוח; בשער המים תוקעים; עולים בכבש ופונים לשמאלו אל שני ספלי הכסף – מערבי של מים ומזרחי של יין','משנה סוכה ד:ט; מידות ב:ו',1)}
   if(inW(h,11.5,12.6)){add({id:'arava',t:'route',pop:'K',grp:'A',kind:'kohen',n:12,route:'sovev',loop:1,spd:2,lane:.4,anim:'walk',prop:'branch',reg:1,job:'מקיף את המזבח עם ערבה: "אנא ה׳ הושיעה נא"',who:'כהן – מצות ערבה: מקיפים את המזבח פעם אחת בכל יום'});
    cap('arava','מצות ערבה: מלקטים מרביות ערבה במוצא, זוקפים אותן בצדי המזבח, ומקיפים את המזבח פעם אחת ואומרים "אנא ה׳ הושיעה נא" (ביום השביעי – שבע פעמים)','משנה סוכה ד:ה (השעה משוערת)',2)}
   if(S.song||inW(h,9.5,11.5))cap('lulav','הלולב נטלים בהלל ובאנא ה׳ הושיעה נא; כל העם מנענעים','משנה סוכה ג:ט',4);
   if(nsukNight){const gal=[];for(let i=0;i<60;i++){gal.push([24+i*2.1,-123.1,0,YN+35.2],[24+i*2.1,8.4,PI,YN+35.2])}
    S.simcha=1;add({id:'gal',seated:1,t:'stand',pop:'W',grp:'N',kind:'yisrael',n:q(110),pts:gal,anim:'bounce',reg:2,job:'מסתכלת משמחת בית השואבה מן הגזוזטרה',who:'אישה בגזוזטרת הנשים – הנשים רואות מלמעלה והאנשים מלמטה',extra:{female:true,role:'gallery'}});
    add({id:'sim-d',t:'route',pop:'Y',grp:'N',kind:'yisrael',n:14,route:'simcha',loop:1,spd:3.2,lane:.6,anim:'dance',prop:'torch',reg:2,job:'מרקד באבוקות של אור ואומר שירות ותשבחות',who:'מחסידי ואנשי מעשה – מרקדים באבוקות (משנה סוכה ה:ד)'});
    add({id:'sim-w',t:'wander',pop:'Y',grp:'N',kind:'yisrael',n:q(240),rect:[40,132,-100,-12],y:YN,spd:1.4,anim:'bounce',reg:3,job:'שמח בשמחת בית השואבה',who:'ישראל בשמחת בית השואבה'});
    const steps=[];for(let k=0;k<15;k+=1){const rad=15-k*(11/14)-.7,n=Math.max(2,Math.round(Math.PI*rad/(k%2?3.4:3.2)*.8));for(let j=0;j<n;j++){const th=(j+.5)/n*PI,x=17+rad*Math.sin(th),z=ZCr+rad*Math.cos(th);steps.push([x,z,Math.atan2(Math.sin(th),Math.cos(th)),YN+(k+1)*.5])}}
    add({id:'sim-l',t:'stand',pop:'L',grp:'N',kind:'levi',n:Math.min(steps.length,120),pts:steps,anim:'sing',prop:'harp',propP:.45,noGrow:1,reg:3,job:'מנגן ושר על אחת מחמש עשרה המעלות',who:'לוי בכלי שיר על ט״ו המעלות – כנגד חמש עשרה שיר המעלות',extra:{role:'shir'}});
    add({id:'sim-t',t:'stand',pop:'K',grp:'N',kind:'kohen',n:2,pts:[[15,ZCr-2.6,PI/2,YI],[15,ZCr+2.6,PI/2,YI]],prop:'trumpet',noGrow:1,reg:2,job:'עומד בשער העליון (ניקנור) ותוקע בחצוצרה כשקרא הגבר',who:'כהן בשער העליון היורד מעזרת ישראל לעזרת נשים – תקעו, הריעו ותקעו'});
    add({id:'sim-b',t:'stand',pop:'K',grp:'N',kind:'kohen',n:4,pts:[[62,-79],[62,-36],[108,-79],[108,-36]].map(p=>[p[0]+3.5,p[1]+1.5,-PI/2,YN]),prop:'jar',sc:.62,noGrow:1,reg:1,job:'ילד מפרחי כהונה – נושא כד שמן ומטיל לספל',who:'פרחי כהונה – ארבעה ילדים בידם כדי שמן של מאה ועשרים לוג (סוכה ה:ב)'});
    cap('simcha','שמחת בית השואבה: במוצאי יום טוב ראשון יורדים לעזרת נשים; מנורות זהב וארבעה ספלי שמן; חסידים מרקדים באבוקות; הלויים בכינורות, נבלים, מצלתים וחצוצרות על חמש עשרה המעלות; הנשים מלמעלה והאנשים מלמטה','משנה סוכה ה:א–ד; מידות ב:ה',1);
    cap('simcha2','שני כהנים בשער העליון תוקעים בחצוצרות: בקרוא הגבר, במעלה העשירית ובעזרה – ובשער המזרחי הופכים פניהם מערבה ואומרים "אנו ליה ועינינו ליה"','משנה סוכה ה:ד',3)}}
  // שבועות: ביכורים (ביכורים ג:ג–ו)
  if(dayId=='shavuot'&&inW(h,7,16)){add({id:'bikk',t:'route',pop:'Y',grp:'M',kind:'yisrael',n:q(26),route:'bikk',spd:1.9,lane:2.2,anim:'walk',prop:'basket',spread:1,loop:0,reg:2,job:'מביא ביכורים בטנא על כתפו אל העזרה; החליל מכה לפניו',who:'מביא ביכורים – מהר הבית אל העזרה, והלויים אומרים: ארוממך ה׳ כי דליתני',noGrow:0});
   add({id:'bikk-f',t:'route',pop:'Y',grp:'M',kind:'yisrael',n:2,route:'bikk',spd:1.9,lane:0,anim:'walk',prop:'flute',loop:0,spread:1,reg:1,job:'מחלל בחליל לפני מביאי הביכורים',who:'חלילן – "החליל מכה לפניהם עד שמגיעים להר הבית"'});
   cap('bikk','הבאת ביכורים: החליל מכה לפניהם עד הר הבית; אפילו אגריפס המלך נוטל הסל על כתפו ונכנס עד העזרה; הלויים אומרים שירה "ארוממך ה׳ כי דליתני"; קורא "הגדתי היום" ומניח את הטנא בצד המזבח','משנה ביכורים ג:ג–ו',1)}
  // לשכות עזרת נשים (מידות ב:ה) – ביום
  if(h>=6&&h<17.5){add({id:'ln-etz',t:'stand',pop:'K',grp:'N',kind:'kohen',n:3,rect:[116,148,-122,-88],face:'rand',anim:'sway',reg:1,job:'כהן בעל מום – בודק עצים לתולעים',who:'כהן בעל מום בלשכת העצים (פינה מזרחית־צפונית של עזרת נשים)'});
   add({id:'ln-naz',rot:[22,50],t:'stand',pop:'Y',grp:'N',kind:'yisrael',n:q(5)+1,rect:[116,148,-28,6],face:'rand',anim:'sway',reg:1,job:'נזיר – מבשל את שלמיו ומגלח את שערו',who:'נזיר בלשכת הנזירים (פינה דרומית־מזרחית של עזרת נשים)'});
   if(h<14)cap('chambers','ארבע לשכות בפינות עזרת נשים: נזירים מבשלים שלמיהם ומגלחים (דרום־מזרח), כהנים בעלי מומין מתליעים עצים (מזרח־צפון), מצורעים (צפון־מערב), יין ושמן (דרום־מערב)','משנה מידות ב:ה',6)}
  S.caps.sort((a,b)=>a.prio-b.prio);return S}
 /* ---------------- ח. עדכון בכל פריים ---------------- */
 let S=null,KEY='',READY=false,lastChip='',_slice=0;
 const chipEl=()=>$('ambChip');
 function chipText(){const D=S.D;let s='<b>'+D.n+' · '+hhmm(S.h)+'</b>';const seen=new Set();S.caps.slice(0,7).forEach(c=>{if(seen.has(c.t))return;seen.add(c.t);s+='<div style="margin-top:3px">• '+c.t+' <span style="opacity:.65">('+c.src+')</span></div>'});return s}
 function init(){buildGrid();buildNav();READY=true;const sel=$('crowdQ');if(sel){Qv=+sel.value||.7;sel.onchange=()=>{Qv=+sel.value||.7;KEY=''}}}
 function replan(day,h){S=plan(day,h);applySpecs(S.specs);setStools(S.stools);const html=chipText();if(html!==lastChip){lastChip=html;const c=chipEl();if(c)c.innerHTML=html}}
 const RMIN=18;                 // שהות מינימלית בזמן אמת לפני רוטציה (שניות) – כדי שבזמן רץ מהיר אנשים יספיקו להגיע
 function lifeTick(a,m,r){if(!a.life)return;a.age+=m;a.rage+=r;if(a.age>a.life&&a.rage>RMIN){const sp=a.sp;if(sp.relief){a.rel=true;const rec=SPECS.get(sp.id);if(rec){rec.cnt--;rec.used[a.k]=0}a.life=0}else leave(a)}}
 // הליכה בכניסה/ביציאה לאורך מסלול הניווט (בלי scale, בלי קפיצות)
 function walkStep(a,t,dt){const pa=a.path;
  if(!pa){a.dy=0;writeAgent(a,t);return}                              // יוצא וממתין שיחושב מסלולו
  a.ps+=a.pspd*BOOST*dt;
  if(a.ps>=pa.len){if(a.mode=='in'){arrive(a);writeAgent(a,t)}else release(a);return}
  const q=pAt(pa,a.ps,a.pseg);a.pseg=q[3];a.x=q[0];a.z=q[1];if(a.lat){const k=a.lat*Math.min(1,(a.mode=='in'?pa.len-a.ps:a.ps)/3);a.x+=Math.cos(q[2])*k;a.z-=Math.sin(q[2])*k}   // סטייה צדדית קלה (מתמעטת בהגעה/בהתחלת יציאה) – שלא ילכו בדיוק על אותו קו
  a.y+=(navY(q[0],q[1])-a.y)*Math.min(1,dt*10);a.yaw+=angd(a.yaw,q[2])*Math.min(1,dt*6);const w=t*4.2+a.ph;a.dy=Math.abs(Math.sin(w))*.07;a.roll=Math.sin(w)*.03;a.pit=0;
  if(a.mode=='out'){a.chk-=dt;if(a.chk<=0){a.chk=.6;if(hid(a.x,a.y,a.z)){release(a);return}}}
  writeAgent(a,t)}
 function agentStep(a,t,dt){
  const sp=a.sp;if(!sp)return;
  if(a.frozen){a.dy=0;a.pit=0;a.roll=0;writeAgent(a,t);return}
  if(a.mode!='at'){walkStep(a,t,dt);return}
  if(a.life){lifeTick(a,DMT,dt);if(a.mode!='at')return}
  let moving=false;
  if(a.r){const r=a.r;if(a.wait>0){a.wait-=dt}else{a.d+=a.dir*a.spd*dt;moving=true;
    if(sp.loop){if(a.d>r.len)a.d-=r.len;if(a.d<0)a.d+=r.len}else if(a.d>=r.len){a.d=r.len;a.dir=-1;a.wait=rr(2.5,7);moving=false}else if(a.d<=0){a.d=0;a.dir=1;a.wait=rr(2,6);moving=false}}
   const p=routePos(r,a.d,a.seg);a.seg=p[3];routeLane(a,p,dt);a.y=r.flat!=null?r.flat:(sp.y!=null?sp.y:levelY(a.x,a.z));
   const ty=p[2]+(a.dir<0?PI:0);a.yaw+=angd(a.yaw,ty)*Math.min(1,dt*5)}
  else if(sp.t=='wander'){if(a.wait>0){a.wait-=dt}else if(a.tx===a.x&&a.tz===a.z||Math.hypot(a.tx-a.x,a.tz-a.z)<.2){let ok=false;for(let i=0;i<6;i++){const p=sample(sp.rect,{ex:sp.ex,y:sp.y,free:1});if(!p)continue;if(Math.hypot(p.x-a.x,p.z-a.z)>22)continue;if(segClear(a.x,a.z,p.x,p.z,a.y,.7)){a.tx=p.x;a.tz=p.z;ok=true;break}}if(!ok)a.wait=rr(2,6)}
   else{const dx=a.tx-a.x,dz=a.tz-a.z,L=Math.hypot(dx,dz),st=Math.min(L,(sp.spd||1)*dt*rr(.9,1.1));a.x+=dx/L*st;a.z+=dz/L*st;moving=true;a.yaw+=angd(a.yaw,Math.atan2(dx,dz))*Math.min(1,dt*4);if(L<=st+.01){a.wait=rr(3,12);a.tx=a.x;a.tz=a.z}}}
  // תנועות
  const an=sp.anim,ph=a.ph;a.dy=0;a.pit=0;a.roll=0;
  if(an=='walk'||(moving&&sp.t=='wander')){if(moving){a.dy=Math.abs(Math.sin(t*4.2+ph))*.07;a.roll=Math.sin(t*4.2+ph)*.03}}
  else if(an=='dance'){a.dy=Math.abs(Math.sin(t*5+ph))*.4;a.roll=Math.sin(t*5+ph)*.12;a.yaw+=Math.sin(t*2.3+ph)*.04;a.pit=Math.sin(t*2.5+ph)*.06}
  else if(an=='bounce'){a.dy=Math.abs(Math.sin(t*3.3+ph))*.22;a.roll=Math.sin(t*3.3+ph)*.06}
  else if(an=='sing'){a.dy=Math.abs(Math.sin(t*2+ph))*.05;a.roll=Math.sin(t*1.6+ph)*.05;a.yaw=a.base+Math.sin(t*.9+ph)*.2}
  else if(an=='pass'){const u=Math.sin(t*1.6-a.k*.7);a.pit=.06+.05*u;a.yaw=a.base+u*.12;a.dy=0}
  else if(an=='sway'){a.roll=Math.sin(t*.9+ph)*.035;a.pit=Math.sin(t*.6+ph*1.3)*.02;a.yaw=a.base+Math.sin(t*.35+ph)*.18}
  else if(sp.t=='stand')a.yaw=a.base;
  if(a.easeT>0){a.easeT=Math.max(0,a.easeT-dt);if(sp.t=='stand'){a.yaw=a.pyaw+angd(a.pyaw,a.yaw)*sm01(1-a.easeT/.7)}
   if(!a.easeT&&sp.t=='stand'&&!sp.anim){DYN.delete(a);STAT.push(a)}}
  if(sp.bow&&bowAmt>.002){const m=bowMode=='prost'?1.45:1.15;a.pit+=bowAmt*m;a.dy-=bowAmt*(bowMode=='prost'?.35:.05)}
  writeAgent(a,t)}
 /* ---- שחקנים כלליים (people.js): דמות מתוזמנת שנכנסת מן השער כשרוצים אותה, עושה את מעשיה במקומה (או לאורך מסלול משלה – step), ויוצאת הולכת. אותם כללי הסתרה ---- */
 const ACTORS=[];let _aid=0;
 function actor(o){const c={o,id:o.id||('act'+(++_aid)),state:'away',x:0,y:0,z:0,yaw:0,moving:false,gen:0,frozen:false,path:null,ps:0,pseg:0,pspd:2.7,retry:0,hh:false,present:false};ACTORS.push(c);return c}
 const aPresent=(c,v)=>{if(c.present===v)return;c.present=v;if(c.o.onPresent)c.o.onPresent(c,v)};
 function actorTick(c,dt,t){const o=c.o;
  if(HELD){if(c.present&&!c.hh){c.hh=true;if(o.hide)o.hide(c)}return}c.hh=false;
  const want=!!o.want();
  if(c.state=='away'){if(!want||NOW<c.retry)return;
   const s=o.slot();c.gen++;
   if(hid(s.x,s.y,s.z)){c.state='at';c.x=s.x;c.y=s.y;c.z=s.z;c.yaw=s.yaw;c.moving=false;aPresent(c,true);if(o.arrived)o.arrived(c)}
   else{const pl=NAVR?planEntry(o.role||'A',s.x,s.z):null;if(!pl){c.retry=NOW+.15+R()*.2;return}
    c.state='in';c.path=pl.path;c.ps=pl.s0;c.pseg=0;c.pspd=2.4+R()*.7;c.lat=(R()-.5)*.7;const q=pAt(pl.path,pl.s0,0);c.pseg=q[3];c.x=q[0];c.z=q[1];c.y=navY(c.x,c.z);c.yaw=q[2];c.moving=true;c.slot=s;aPresent(c,true)}}
  else if((c.state=='at'||c.state=='in')&&!want){c.state='out';c.path=null;c.moving=false;if(hid(c.x,c.y,c.z)){c.state='away';aPresent(c,false);if(o.hide)o.hide(c);return}}
  if(c.state=='in'||c.state=='out'){
   if(c.state=='out'&&!c.path){if(hid(c.x,c.y,c.z)){c.state='away';aPresent(c,false);if(o.hide)o.hide(c);return}
    if(NAVR&&PCAP>0){PCAP--;c.path=pathOut(c.x,c.z);c.ps=0;c.pseg=0;c.pspd=2.4+R()*.7;c.lat=(R()-.5)*.7}
    c.moving=false;o.apply(c,t);return}
   if(!c.frozen){c.ps+=c.pspd*BOOST*dt;c.moving=true;
    if(c.ps>=c.path.len){if(c.state=='in'){const s=o.slot();c.state='at';c.x=s.x;c.z=s.z;c.y=s.y;c.moving=false;if(o.arrived)o.arrived(c)}else{c.state='away';c.path=null;aPresent(c,false);if(o.hide)o.hide(c);return}}
    else{const q=pAt(c.path,c.ps,c.pseg);c.pseg=q[3];c.x=q[0];c.z=q[1];if(c.lat){const k=c.lat*Math.min(1,(c.state=='in'?c.path.len-c.ps:c.ps)/3);c.x+=Math.cos(q[2])*k;c.z-=Math.sin(q[2])*k}c.y+=(navY(q[0],q[1])-c.y)*Math.min(1,dt*10);c.yaw+=angd(c.yaw,q[2])*Math.min(1,dt*6);
     if(c.state=='out'){c.chk=(c.chk||0)-dt;if(c.chk<=0){c.chk=.6;if(hid(c.x,c.y,c.z)){c.state='away';c.path=null;aPresent(c,false);if(o.hide)o.hide(c);return}}}}}
   if(c.state!='at'){o.apply(c,t);return}}
  // 'at': מקום קבוע (או התנהגות step משלו)
  if(!c.frozen){if(o.step)o.step(c,dt,t);else{const s=o.slot();c.x=s.x;c.z=s.z;c.y=s.y;c.yaw+=angd(c.yaw,s.yaw)*Math.min(1,dt*5);c.moving=false}}
  o.apply(c,t)}
 /* ---- מצב סיור (נגן סדרי העבודה): ההמון מוסתר בחיתוך הסצנה ומשוחזר ביציאה ---- */
 function applyHeldVis(){for(const k in POOLS){const P=POOLS[k];const rl=!!(P.real&&typeof REALP!='undefined'&&REALP.on);P.robe.visible=P.head.visible=!HELD&&!rl;if(P.real)P.real.visible=!HELD&&rl;for(const q in P.props)P.props[q].visible=!HELD}ALL.forEach(a=>{if(a.obj)a.obj.visible=a.vis!==false&&!HELD})}
 let wasLast=null,accM=0,accR=0;
 function update(t,dt){
  if(!READY){if(typeof floorY=='undefined'||!COL.length)return;init()}
  dt=Math.min(dt,.1);NOW+=dt;PCAP=PCAPMAX;camSync();
  if(!NAVR)fieldStep(FIELDMS);
  const tmv=$('tm'),h=tmv?+tmv.value:11,dsel=$('dayType'),day=dsel&&DAYS[dsel.value]?dsel.value:'chol';
  const held=typeof LIFE!='undefined'&&LIFE.held;
  if(BOOSTF!=null)BOOST=BOOSTF;else{const au=$('autoDay'),rt=$('dayRate');BOOST=au&&au.checked?1+Math.min(1.5,(rt?+rt.value:.1)*15):1}
  if(wasLast!=null){let d=h-wasLast;if(d<-12)d+=24;else if(d>12)d-=24;DMT=Math.abs(d)<.6?Math.max(0,d)*60:0}else DMT=0;wasLast=h;
  const key=day+'|'+Math.floor(h*12)+'|'+Qv+'|'+(held?1:0);
  if(held!==HELD){HELD=held;applyHeldVis()}
  if(key!==KEY){KEY=key;if(held){S=plan(day,h);S.specs=[];const c=chipEl();if(c)c.innerHTML='<b>'+S.D.n+'</b><div style="margin-top:3px">בנגן סדרי העבודה הקהל מוסתר כדי לא להפריע לסדר.</div>'}else replan(day,h)}
  if(held){for(const c of ACTORS)actorTick(c,dt,t);return}
  // כריעה: תקיעות במנות / השתחוויה מלאה בשם המפורש
  bowMode=S.bow;let tgt=0;if(S.bow=='cycle'){const tt=t%16;tgt=tt<2.6?Math.sin(tt/2.6*PI):0}else if(S.bow=='prost')tgt=1;
  bowAmt+=(tgt-bowAmt)*Math.min(1,dt*(S.bow=='prost'?2.5:9));if(bowAmt<.002&&tgt==0)bowAmt=0;
  for(const a of DYN){if(a.on)agentStep(a,t,dt)}
  if(bowAmt>0||_lastBow>0){for(const a of BOW)if(a.on&&!DYN.has(a)&&a.mode=='at')agentStep(a,t,dt)}_lastBow=bowAmt;
  // נדנוד קל לעומדים: פרוסה אחת בכל פריים
  if(STAT.length){const n=Math.min(STAT.length,Math.ceil(STAT.length/10));for(let j=0;j<n;j++){_slice=(_slice+1)%STAT.length;const a=STAT[_slice];if(a&&a.on&&!a.frozen&&a.sp&&a.mode=='at'){a.roll=Math.sin(t*.8+a.ph)*.03;a.pit=Math.sin(t*.5+a.ph*1.7)*.015;a.yaw=(a.base!=null?a.base:a.yaw)+Math.sin(t*.3+a.ph)*.15;if(a.sp.bow&&bowAmt>.002)a.pit+=bowAmt*1.15;writeAgent(a,t)}}}
  for(let i=STAT.length-1;i>=0;i--)if(!STAT[i].on)STAT.splice(i,1);
  for(let i=BOW.length-1;i>=0;i--)if(!BOW[i].on)BOW.splice(i,1);
  accM+=DMT;accR+=dt;if(accR>=1){for(const a of STAT.slice())if(a.on&&a.life&&a.mode=='at')lifeTick(a,accM,accR);accM=0;accR=0}   // רוטציה/החלפת משמר גם לעומדים שאינם בלולאת DYN
  fill();processLQ(1.5);
  for(const c of ACTORS)actorTick(c,dt,t);
  // הדלקות שמחת בית השואבה: המנורות הקיימות מאירות חזק בלילה (ללא אורות חדשים)
  if(S.simcha&&typeof lampLights!='undefined'){lampLights.forEach(l=>l.intensity=3.4);_sim=true}else if(_sim){_sim=false;if(typeof setTime=='function')setTime(h)}
  for(const m of DIRTY){if(m.isInstancedMesh){m.instanceMatrix.needsUpdate=true}else{m.robe.instanceMatrix.needsUpdate=true;m.head.instanceMatrix.needsUpdate=true;for(const k in m.props)m.props[k].instanceMatrix.needsUpdate=true}}DIRTY.clear();
 }
 let _lastBow=0,_sim=false,BOOSTF=null,PCAPMAX=4,FIELDMS=5;
 /* רשימת ישויות חיות (לבדיקות tools/audit-people.mjs): כל דמות במופעים/יחידות + שחקני people.js */
 function entities(){const L=[];ALL.forEach(a=>{L.push({uid:a.uid,id:a.sp.id,x:a.x,y:a.y,z:a.z,mode:a.mode,why:(a.life&&!a.sp.why)?0:1,seated:!!a.sp.seated,sc:a.s,pop:a.sp.pop||a.sp.make})});
  ACTORS.forEach(c=>{if(c.state!='away')L.push({uid:'act:'+c.id+':'+c.gen,id:c.id,x:c.x,y:c.y,z:c.z,mode:c.state,why:1,seated:false,sc:1,pop:'actor',moving:c.moving})});return L}
 return{washNow,fireK,update,validate,plan,get S(){return S},set S(v){S=v},DAYS,DLIST,POOLS,ROUTES,blocked:(x,z,f,r)=>{if(!GRID)buildGrid();return blocked(x,z,f,r)},levelY,SAN_GAZIT,SAN_CHEL,get count(){let n=0;for(const k in POOLS)n+=POOLS[k].hi;return n},setQ:v=>{Qv=v;KEY=''},
  actor,hid,entities,get held(){return HELD},get ready(){return READY&&NAVR},get now(){return NOW},portals:()=>Object.values(NP).map(p=>({id:p.id,x:p.x,z:p.z})),
  setBoost:v=>{BOOSTF=v},setBudget:(ms,pc,fm)=>{FILLMS=ms;PCAPMAX=pc||4;if(fm)FIELDMS=fm},buildCrowdGeometry,
  nav:{ok:nOK,y:navY,fields:NF,pathFromPortal,pathOut,snapCell,get W(){return NW},get Y(){return NYa},N:NN,X0:NX0,Z0:NZ0,get ready(){return NAVR}}}
})();
