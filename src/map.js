/* ================= דף מפת המדינות (האזור לפי תקופות) – עיצוב מחדש לילדים (18.11.2026, גרסה 2) =================
   * הגיאומטריה (MGEOM): חלוקת האזור ל"אטומים" (תאי יסוד) בלי חפיפות ובלי חורים – לכל שני תאים שכנים קצה משותף זהה (אותו מערך נקודות, מוחלק ב-Catmull-Rom).
     ישות מדינית בכל תקופה = איחוד אטומים (לפי EMP ב-regions.js; השמות והמעצמות מהנתונים, הצורות משוערות). החיתוך לקו החוף נעשה בציור (clip) לפי LAND ב-geodata.
     אותו בלוק (בין הסימונים) מיוצא ע"י tools/mgeo-export.cjs לציור תמונת הייחוס.
   * תמונת הרקע base_m: צוירה מהנתונים (tools/draw-region-map.py) → Gemini (tools/gen-regionmap.cjs) צייר עליה "חימר תלת־ממדי" → tools/verify-regionmap.py אימת יישור
     (+ tools/fix-regionmap.py תיקן מפרצים/איים דקים). מעליה שכבה וקטורית מדויקת (מדינות/קו חוף/אגמים). אם התמונה חסרה – נשאר רקע שטוח מהנתונים.
   * ערים לפי תקופה: משוער. ירושלים – רינדורי הדגם (r_jo*), שאר הערים – איור דקורטי (d_city_*, "איור – לא מדויק").
   * כל התמונות בדרך blob: (mapPic) – נטפרי. כל העובדות (גבולות/ערים/תקופות) מהנתונים בלבד. נשמרו המשתנים והפונקציות שדף השבטים (kids.js) ו-ui.js משתמשים בהם:
     PR, MCOL, COSL, mapPic, mapImg, mapGest, mShort, cityOn, mapOpen, curPer, openMap, mapRefresh. */
const PR=[[-538,-332],[-332,-301],[-301,-200],[-200,-167],[-167,-63],[-63,-4],[-4,70]];
const MSH=['פרס','אלכסנדר','תלמי','סלווקים','חשמונאים','הורדוס','רומא'],MDECO=['d_persia','d_greece','d_ptolemy','d_seleucid','d_hasmonean','d_herod','d_roman'],
 MCOL=['#8e6bbf','#4a90d9','#d9a441','#6aa84f','#7e57c2','#26a69a','#c62828'],MEMO=['🏺','🏛️','⛵','🐘','🕎','🏗️','🛡️'];
const COSL=.82,MC=$('mapc'),mx2=MC.getContext('2d');
const MV={lon:35,lat:32,z:20},MT={e:1,c:1,l:1};let mapOpen=false,curPer=5;

/* ---------- תמונות מוטמעות -> blob: URL (נטפרי: blob מקומי עובר; data: בתוך HTML/CSS נחסם) ---------- */
const MPU={};const _mapImgCbs=[];function onMapImgs(f){if(typeof MAP_IMG!='undefined')f();else _mapImgCbs.push(f)}window.__mapImgsLoaded=()=>{_mapImgCbs.splice(0).forEach(f=>{try{f()}catch(e){}})};
function mapPic(k){if(k in MPU)return MPU[k];if(typeof MAP_IMG=='undefined')return null;let r=null;
 try{const u=typeof MAP_IMG!='undefined'&&MAP_IMG[k];if(u){const s=atob(u),a=new Uint8Array(s.length);for(let j=0;j<s.length;j++)a[j]=s.charCodeAt(j);r=URL.createObjectURL(new Blob([a],{type:'image/webp'}))}}catch(e){r=null}
 return MPU[k]=r}
/* אלמנט תמונה: צבע+אימוג'י כרקע; ה-<img> מכסה אותו, ואם נכשל (או חסרה תמונה) נשאר הרקע */
function mapImg(k,col,emo){const d=document.createElement('div');d.className='mpic';d.style.setProperty('--c',col||'#f6c26b');
 const u=mapPic(k);if(u){const im=new Image();im.alt='';im.draggable=false;im.onerror=()=>{im.remove();d.textContent=emo||''};d.appendChild(im);im.src=u}else{d.textContent=emo||'';if(k)onMapImgs(()=>{const u2=mapPic(k);if(u2){const im=new Image();im.alt='';im.draggable=false;im.onerror=()=>{im.remove();d.textContent=emo||''};d.textContent='';d.appendChild(im);im.src=u2}})}return d}
function mapPk(n){const m=(typeof MAP_IMG_META!='undefined'&&MAP_IMG_META.places||[]).find(x=>x[1].indexOf(n)==0);return m?m[0]:null}   /* מפתח תמונת מקום לפי שם (הסדר ב-P יכול להשתנות) */
const mShort=d=>{d=(d||'').replace(/\s+/g,' ').trim();let s=d.split(/(?<=[.!?])\s/)[0]||d;if(s.length>110){const c=s.slice(0,110),i=Math.max(c.lastIndexOf(', '),c.lastIndexOf(' – '),c.lastIndexOf(': '));s=(i>40?c.slice(0,i):c.replace(/\s\S*$/,''))+'…'}return s};
const MYR=i=>{const a=PR[i][0],b=PR[i][1];return b<=0?(-a)+'–'+(-b)+' לפנה״ס':(-a)+' לפנה״ס–'+b};   /* שנה קצרה לכרטיס (מתוך PR) */
function mapToast(el,t){el.textContent=t;el.classList.add('on');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('on'),1600)}
function cityOn(c,i){return c[3]<=PR[i][1]&&c[4]>=PR[i][0]}

/* ---------- בקרת מגע/עכבר: גרירה, צביטה, גלגלת, לחיצה (משותף למפה ולמפת הילדים) ---------- */
function mapGest(cv,V,lim,draw,tap,hover){const ps=new Map();let dr=null,pn=null;
 const pos=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)*cv.width/(r.width||1),(e.clientY-r.top)*cv.height/(r.height||1)]};
 const s2m=(x,y)=>[(x-cv.width/2)/(V.z*COSL)+V.lon,V.lat-(y-cv.height/2)/V.z];
 const zoom=(x,y,f)=>{const b=s2m(x,y);V.z=Math.max(lim[0],Math.min(lim[1],V.z*f));const a=s2m(x,y);V.lon+=b[0]-a[0];V.lat+=b[1]-a[1]};
 cv.addEventListener('pointerdown',e=>{const p=pos(e);ps.set(e.pointerId,p);try{cv.setPointerCapture(e.pointerId)}catch(_){}
  if(ps.size==1)dr={x:p[0],y:p[1],lon:V.lon,lat:V.lat,m:0};else if(ps.size==2){dr=null;const q=[...ps.values()];pn={d:Math.hypot(q[0][0]-q[1][0],q[0][1]-q[1][1])||1,z:V.z}}});
 cv.addEventListener('pointermove',e=>{const p=pos(e);if(ps.has(e.pointerId))ps.set(e.pointerId,p);
  if(pn&&ps.size>=2){const q=[...ps.values()],d=Math.hypot(q[0][0]-q[1][0],q[0][1]-q[1][1])||1;zoom((q[0][0]+q[1][0])/2,(q[0][1]+q[1][1])/2,pn.z*d/pn.d/V.z);draw()}
  else if(dr){const dx=p[0]-dr.x,dy=p[1]-dr.y;if(Math.abs(dx)+Math.abs(dy)>6)dr.m=1;V.lon=dr.lon-dx/(V.z*COSL);V.lat=dr.lat+dy/V.z;draw()}
  else if(hover&&e.pointerType=='mouse')hover(p[0],p[1])});
 const up=e=>{const p=pos(e);if(ps.has(e.pointerId)){ps.delete(e.pointerId);if(dr&&!dr.m&&e.type=='pointerup'&&tap)tap(p[0],p[1]);if(ps.size<2)pn=null;if(!ps.size)dr=null}};
 cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
 cv.addEventListener('wheel',e=>{e.preventDefault();const p=pos(e);zoom(p[0],p[1],e.deltaY<0?1.2:1/1.2);draw()},{passive:false});
 return{zoom:f=>{zoom(cv.width/2,cv.height/2,f);draw()}}}

/*MGEO-BEGIN*/
const MGEOM=(()=>{
 const cr=(p,n)=>{const k=p.length/2;if(k<3)return p.slice();const P=i=>{const j=Math.max(0,Math.min(k-1,i));return[p[2*j],p[2*j+1]]};const o=[p[0],p[1]];
  for(let i=0;i<k-1;i++){const a=P(i-1),b=P(i),c=P(i+1),d=P(i+2);for(let s=1;s<=n;s++){const t=s/n,t2=t*t,t3=t2*t;
   for(let j=0;j<2;j++)o.push(.5*(2*b[j]+(-a[j]+c[j])*t+(2*a[j]-5*b[j]+4*c[j]-d[j])*t2+(-a[j]+3*b[j]-3*c[j]+d[j])*t3))}}return o};
 const ch=(p,it)=>{for(let r=0;r<it;r++){const k=p.length/2,o=[];for(let i=0;i<k;i++){const a=[p[2*i],p[2*i+1]],b=[p[2*((i+1)%k)],p[2*((i+1)%k)+1]];o.push(.75*a[0]+.25*b[0],.75*a[1]+.25*b[1],.25*a[0]+.75*b[0],.25*a[1]+.75*b[1])}p=o}return p};
 /* תחום תמונת הרקע base_m: מלבן 5:4 (רוחב:גובה) בהקרנת המפה (x=(lon-lon0)*COSL, y=lat) – יחס שמנוע התמונות של Gemini תומך בו */
 const B={lon0:19.2,lat0:21.5,lat1:43.0,ar:1.25};B.lon1=B.lon0+(B.lat1-B.lat0)*B.ar/COSL;
 /* הים הכספי (LAND אינו כולל אותו): קו החוף המערבי והדרומי משוער; נחתך מהיבשה */
 const casp=[46.5,44.0,47.5,43.0,48.3,42.06,49.0,41.2,49.85,40.45,50.3,40.3,49.6,40.0,49.3,39.4,49.0,38.8,48.85,38.4,49.4,37.5,50.2,37.3,51.0,36.9,52.0,36.65,53.2,36.75,53.8,37.0,54.2,37.3,54.5,38.0,54.0,39.0,53.2,40.0,53.0,41.0,52.5,42.0,52.8,43.0,53.0,44.0];
 /* צמתים משותפים (אורך, רוחב). צמתי ים נמצאים מחוץ לחוף כדי שהגבול יחתוך את החוף במקום הנכון */
 const N={
  G_W1:[18.9,42.7],G_W2:[18.9,39.3],G_W3:[18.9,36.0],G_S:[22.6,36.0],G_SE:[25.4,36.0],G_M2:[25.4,38.9],D1:[26.45,40.15],G_T:[26.8,42.7],G_NW:[18.9,46.5],G_NE:[29.4,46.5],B1:[29.4,41.7],B2:[29.05,41.05],M1:[28.2,40.65],
  C1:[23.3,34.6],C2:[26.6,34.6],C3:[26.6,35.75],C4:[23.3,35.75],
  A1:[29.3,38.6],SC1:[31.3,36.1],SC2:[32.3,36.0],S_C:[35.7,36.3],C_T1:[32.7,36.9],C_T2:[34.8,37.5],A10:[38.0,37.3],A9:[38.0,40.3],A7:[32.4,40.3],A6:[30.4,39.6],B3:[32.4,42.0],P1:[41.8,41.9],AP1:[40.5,40.4],AP2:[42.0,41.1],
  Y3:[34.9,34.75],Y4:[36.0,34.75],Y2:[38.3,34.7],Y1:[38.4,36.0],Y6:[38.3,33.0],L1:[34.7,33.1],L2:[35.9,33.25],L3:[37.1,33.1],L4:[37.3,31.9],L5:[36.8,31.1],
  JW_N:[41.5,37.3],JW_S:[41.5,33.0],JE_N:[44.3,37.2],BW1:[44.3,31.8],BW2:[46.3,29.6],AR2:[45.5,41.2],AR3:[50.0,39.6],I1:[45.3,38.4],
  I3:[47.8,33.3],I9:[47.6,32.0],I4:[48.0,29.0],I7:[49.2,32.2],I8:[50.4,31.0],I6:[50.5,29.3],IE1:[52.5,38.5],IE_S:[52.5,24.0],IE2:[62,38.5],IE3:[62,24.5],
  E1:[33.9,31.5],E2:[34.25,30.6],N_W:[34.9,29.5],J_S2:[35.4,30.95],JJ_N:[35.5,32.05],JJ_S:[35.45,31.3],JN1:[34.95,32.05],JS1:[34.95,31.3],
  N2:[40.2,31.0],N3:[40.5,26.5],N4:[35.9,26.5],R1:[34.6,27.6],R2:[35.4,25.8],R3:[36.5,24.0],EG_S1:[37.9,22.0],EG_S2:[25.0,22.0],CY_SE:[25.0,29.9],EG_N:[25.0,32.9],CY_W1:[18.9,34.2],CY_SW:[18.9,22.0],
  Y_1:[32.0,34.4],Y_2:[34.8,34.4],Y_3:[34.8,35.95],Y_4:[32.0,35.95]};
 /* מקטעי גבול עם נקודות ביניים ידניות (בכיוון כתוב); ללא רשומה – קו ישר, ובגבול בין שתי ישויות – גלי טבעי דטרמיניסטי */
 const M={'G_W2>G_M2':[20.4,39.45,21.8,39.25,23.0,39.0,24.1,38.85],'D1>G_M2':[26.0,39.75,25.65,39.35],'D1>M1':[27.4,40.5],'M1>B2':[28.6,40.8],'B2>B1':[29.2,41.35],
  'A1>SC1':[29.9,37.9,30.7,37.0],'G_M2>A1':[26.4,38.85,27.4,38.7],'M1>A1':[28.4,39.8,28.9,39.2],'A1>A6':[29.7,39.2],'A6>A7':[31.3,40.0],'A7>A9':[34.0,40.2,36.0,40.0],'A9>AP1':[39.3,40.4],'AP1>AP2':[41.3,40.75],
  'L2>JJ_N':[35.7,33.1,35.62,32.85,35.58,32.55,35.55,32.3],'JJ_N>JJ_S':[35.5,31.8,35.47,31.55],'JJ_S>J_S2':[35.45,31.1],'E1>E2':[34.1,31.15],
  'N_W>R1':[34.75,28.5],'R1>R2':[34.95,26.7],'R2>R3':[35.9,24.9],
  'JE_N>I3':[45.4,36.0,46.4,34.8,47.4,33.7],'I3>I7':[48.5,32.8],'I7>I8':[49.9,31.6],'I8>I6':[50.7,30.2],'JE_N>I1':[44.7,37.8],'I1>AR3':[46.6,38.9,48.2,39.3],
  'A10>JW_N':[39.6,37.35],'JW_N>JE_N':[42.9,37.3],'Y1>A10':[38.15,36.7],'Y2>Y1':[38.35,35.3],'C_T1>C_T2':[33.6,37.3],'SC2>C_T1':[32.4,36.5],'C_T2>A10':[36.4,37.5],'A10>S_C':[36.7,36.9,36.2,36.6],'Y4>Y2':[37.2,34.75],'L3>L2':[36.5,33.2],'Y6>Y2':[38.3,33.8],
  'L1>L2':[35.3,33.12],'G_M2>G_SE':[25.4,37.5],
  /* גבולות חיצוניים במדבר (בלי שכן): עקומים כדי שלא ייראו כקופסה */
  'L5>N2':[37.7,31.35,39.0,31.2],'N2>N3':[40.9,29.5,40.3,27.9],'N3>N4':[38.8,26.2,37.2,26.4],'L3>L4':[37.4,32.6],'L4>L5':[37.0,31.5],'JW_S>Y6':[40.0,33.2,39.0,32.9],'JW_S>BW1':[42.8,32.4,43.7,32.0],'BW1>BW2':[45.0,30.8],'BW2>I4':[47.3,29.2],'CY_SE>EG_S2':[24.9,27.0,25.1,24.5]};
 /* אטומים (תאי יסוד של החלוקה): רשימת צמתים ברצף; כל זוג צמתים סמוכים = קצה משותף לשני תאים שכנים.  ישות מדינית בכל תקופה = איחוד אטומים */
 const A={
  GRK:['G_W2','G_M2','G_SE','G_S','G_W3'],MAC:['G_W1','G_T','D1','G_M2','G_W2'],BAL:['G_W1','G_NW','G_NE','B1','B2','M1','D1','G_T'],CRT:['C1','C2','C3','C4'],
  APE:['D1','M1','A1','G_M2'],AIO:['G_SE','G_M2','A1','SC1'],ABI:['B1','B2','M1','A1','A6','A7','B3'],ACE:['A1','A6','A7','A9','A10','C_T2','C_T1','SC2','SC1'],APO:['B3','P1','AP2','AP1','A9','A7'],CIL:['SC2','C_T1','C_T2','A10','S_C'],
  SYN:['S_C','Y3','Y4','Y2','Y1','A10'],PHO:['L1','Y3','Y4','L2'],SYS:['L2','Y4','Y2','Y6','L3'],JAW:['A10','JW_N','JW_S','Y6','Y2','Y1'],JAE:['JW_N','JE_N','BW1','JW_S'],
  ARM:['A9','AP1','AP2','AR2','AR3','I1','JE_N','JW_N','A10'],IRN:['JE_N','I1','AR3','IE1','IE_S','I6','I8','I7','I3'],IRE:['IE1','IE2','IE3','IE_S'],ELA:['I3','I7','I8','I6','I4','I9'],BAB:['JE_N','I3','I9','I4','BW2','BW1'],
  LVW:['E1','L1','L2','JJ_N','JN1','JS1','JJ_S','J_S2','E2'],LVE:['L2','L3','L4','L5','J_S2','JJ_S','JJ_N'],JUD:['JN1','JJ_N','JJ_S','JS1'],NAB:['E2','J_S2','L5','N2','N3','N4','R2','R1','N_W'],
  EGY:['EG_N','E1','E2','N_W','R1','R2','R3','EG_S1','EG_S2','CY_SE'],CYR:['CY_W1','EG_N','CY_SE','EG_S2','CY_SW'],CYP:['Y_1','Y_2','Y_3','Y_4']};
 const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0)/4294967296};
 const key=(a,b)=>a<b?a+'|'+b:b+'|'+a;
 const adj={};for(const id in A){const r=A[id];for(let i=0;i<r.length;i++){const k=key(r[i],r[(i+1)%r.length]);(adj[k]||(adj[k]=[])).push(id)}}
 const rv=a=>{const o=[];for(let i=a.length-2;i>=0;i-=2)o.push(a[i],a[i+1]);return o};
 const cache={};
 /* גאומטריית קצה בכיוון a→b */
 const edge=(a,b)=>{const k=key(a,b),cn=a<b;if(!cache[k]){const s=cn?a:b,t=cn?b:a,P=N[s],Q=N[t];let mids=M[s+'>'+t]||(M[t+'>'+s]&&rv(M[t+'>'+s]));let pts;
   if(mids){pts=cr([].concat(P,mids,Q),5)}
   else if((adj[k]||[]).length>1){const dx=(Q[0]-P[0])*COSL,dy=Q[1]-P[1],len=Math.hypot(dx,dy),n=Math.floor(len/1.0);
    if(n<2)pts=[].concat(P,Q);else{const m=[],amp=Math.min(.4,len*.09);for(let i=1;i<n;i++){const t_=i/n,o=(hash(k+i)-.5)*2*amp;m.push(P[0]+(Q[0]-P[0])*t_+(-dy/len)*o/COSL,P[1]+(Q[1]-P[1])*t_+(dx/len)*o)}pts=cr([].concat(P,m,Q),5)}}
   else pts=[].concat(P,Q);cache[k]=pts}
  return cn?cache[k]:rv(cache[k])};
 const ring=names=>{const o=[];for(let i=0;i<names.length;i++){const e=edge(names[i],names[(i+1)%names.length]);for(let j=(o.length?2:0);j<e.length;j+=2)o.push(e[j],e[j+1])}return o};
 const atoms={};for(const id in A){const r=ring(A[id]);let a=1e9,b=-1e9,c=1e9,d=-1e9;for(let i=0;i<r.length;i+=2){a=Math.min(a,r[i]);b=Math.max(b,r[i]);c=Math.min(c,r[i+1]);d=Math.max(d,r[i+1])}
  atoms[id]={ring:r,keys:A[id].map((n,i)=>key(n,A[id][(i+1)%A[id].length])),bb:[a,b,c,d],c:[(a+b)/2,(c+d)/2]}}
 const edges={};for(const k in adj){const [a,b]=k.split('|');edges[k]={pts:edge(a,b),atoms:adj[k]}}
 /* אגמים, נהרות, רכסים (עיצוב; לא נתון עובדתי – הגבולות המדיניים אינם נשענים עליהם) */
 const lakes={kinneret:ch([35.57,32.9,35.61,32.895,35.65,32.85,35.655,32.78,35.62,32.72,35.57,32.695,35.525,32.725,35.51,32.79,35.525,32.855],2),
  dead:ch([35.45,31.77,35.53,31.77,35.57,31.68,35.58,31.55,35.56,31.4,35.53,31.25,35.49,31.12,35.43,31.08,35.4,31.2,35.385,31.32,35.385,31.46,35.39,31.6,35.42,31.72],2),
  van:ch([42.6,38.55,42.9,38.8,43.4,38.75,43.55,38.5,43.2,38.35,42.8,38.35],2),urmia:ch([45.05,37.2,45.3,37.1,45.5,37.45,45.45,37.9,45.2,38.1,45.0,37.75],2)};
 const rivers=[
  {n:'nile',w:3.4,p:cr([32.85,21.5,32.9,23.0,32.9,24.1,32.9,25.0,32.65,25.7,32.7,26.2,31.7,26.55,31.2,27.2,30.75,28.1,31.1,29.1,31.25,30.05],4)},
  {n:'nile',w:2.6,p:cr([31.25,30.05,31.35,30.5,31.5,31.0,31.75,31.45],4)},{n:'nile',w:2.6,p:cr([31.25,30.05,31.1,30.5,30.9,31.0,30.45,31.5],4)},
  {n:'euphrates',w:3.4,p:cr([38.8,38.0,38.2,37.0,38.3,36.4,39.0,35.95,40.2,35.2,41.0,34.6,42.2,34.2,43.2,33.8,43.9,33.2,44.4,32.8,45.3,32.0,46.2,31.3,47.3,30.8,48.1,30.2],5)},
  {n:'tigris',w:3.4,p:cr([40.2,38.15,41.2,37.8,42.4,37.3,43.1,36.35,43.6,35.5,44.0,34.5,44.4,33.35,45.4,32.6,46.1,32.0,46.7,31.5,47.3,30.8],5)},
  {n:'jordan',w:2.4,p:cr([35.65,33.22,35.6,32.9,35.57,32.6,35.55,32.3,35.52,32.0,35.5,31.78],4)},
  {n:'orontes',w:2,p:cr([36.55,34.45,36.6,35.0,36.4,35.5,36.2,35.95,35.95,36.12],4)}];
 const ridges=[{w:.4,k:'m',p:[27.5,37.3,29.5,37.0,31.5,36.9,33.5,37.0,35.3,37.5,37.0,37.6,39.0,38.2,41.5,38.3,43.5,38.0]},{w:.35,k:'h',p:[31.0,41.1,33.5,41.2,36.0,40.9,38.5,40.6,41.0,40.6]},
  {w:.35,k:'m',p:[42.0,42.8,44.0,42.6,46.0,42.2,48.0,41.5]},{w:.5,k:'m',p:[44.2,37.0,45.3,36.0,46.5,34.7,47.6,33.6,48.8,32.2,50.2,31.0,51.6,29.8,52.0,29.0]},{w:.3,k:'m',p:[49.5,37.0,51.0,36.3,52.0,36.2]},
  {w:.2,k:'m',p:[35.7,34.5,35.9,33.9,36.2,33.5]},{w:.2,k:'h',p:[36.35,34.3,36.55,33.8,36.9,33.4]},{w:.22,k:'h',p:[35.25,32.6,35.28,32.3,35.25,32.0,35.2,31.75,35.08,31.5,34.98,31.3]},{w:.22,k:'h',p:[35.82,32.5,35.86,32.2,35.86,31.8,35.82,31.5]},
  {w:.2,k:'h',p:[35.18,33.2,35.34,33.0,35.46,32.95]},{w:.3,k:'m',p:[33.4,28.9,33.9,28.5,34.3,28.1]},{w:.2,k:'h',p:[35.3,30.8,35.5,30.2,35.6,29.8]},{w:.3,k:'h',p:[35.7,28.5,36.3,27.5,37.2,25.5,38.3,23.5]},{w:.3,k:'h',p:[33.0,27.5,33.6,25.5,34.6,24.0]},
  {w:.2,k:'h',p:[20.8,40.2,21.2,39.3,21.6,38.6,22.4,37.6]},{w:.25,k:'h',p:[22.5,42.5,25.0,42.7,27.0,42.7]},{w:.2,k:'h',p:[36.3,36.8,36.5,37.4]},{w:.25,k:'h',p:[28.0,39.0,29.5,38.0,30.5,37.6]}].map(r=>({w:r.w,k:r.k,p:cr(r.p,4)}));
 /* אזורים פוריים (ירוק) – לציור הייחוס בלבד */
 const greens=[{w:.28,p:rivers[0].p},{w:.5,p:rivers[3].p},{w:.5,p:rivers[4].p},{w:.45,p:cr([35.0,33.3,34.95,32.8,34.8,32.1,34.6,31.5],3)},{w:.4,p:rivers[1].p.concat(rv(rivers[2].p))}];
 const check=()=>{const bad=[];for(const id in A){for(const n of A[id])if(!N[n])bad.push(id+':'+n)}for(const k in M){const [a,b]=k.split('>');if(!N[a]||!N[b])bad.push('M:'+k);else if(!adj[key(a,b)])bad.push('M-noedge:'+k)}return bad};
 const pol={};
 return{B,land:LAND,casp,N,A,atoms,edges,adj,lakes,rivers,ridges,greens,cr,ch,check,key,edge}})();
/*MGEO-END*/

/* ---------- ישויות מדיניות לפי תקופה: אטומים לכל רשומה ב-EMP (אותו סדר) ---------- */
const MB=MGEOM.B,RGSEA='#6a90ab',RGSAND='#c8a876';
const RG_ALL=['EGY','CYR','CYP','LVW','LVE','PHO','SYS','SYN','CIL','ACE','AIO','APE','ABI','APO','ARM','JAW','JAE','BAB','ELA','IRN','IRE','NAB'],
 RG_ROME=['GRK','MAC','BAL','CRT','APE','AIO','ACE','ABI','APO','CIL','SYN','SYS','JAW','PHO','EGY','CYR','CYP'],RG_PAR=['IRN','IRE','BAB','ELA'],RG_J=['LVW','LVE','JUD'];
const RGP=[
 [RG_ALL,['JUD'],['GRK','MAC'],[]],
 [RG_ALL.concat(['GRK','MAC','BAL']),['JUD'],[],[]],
 [['EGY','CYR','CYP','LVW','LVE','PHO','SYS'],['SYN','CIL','ACE','AIO','ABI','APO','ARM','JAW','JAE','BAB','ELA','IRN','IRE'],['MAC'],['GRK'],['APE'],[],[],['JUD']],
 [['EGY','CYR','CYP'],['SYN','CIL','ACE','AIO','LVW','LVE','PHO','SYS','JAW','JAE','BAB','ELA','IRN','ARM'],['MAC'],['GRK'],['APE'],['ABI','APO'],[],[],['NAB'],['IRE'],['JUD']],
 [RG_J,['EGY','CYP'],['SYN'],['ARM'],RG_PAR,['NAB'],['GRK','MAC','CRT','APE','AIO','CIL','CYR']],
 [RG_ROME,RG_J,['NAB'],RG_PAR,['ARM']],
 [RG_ROME,RG_J,['NAB'],RG_PAR,['ARM']]];
/* מפתח → [סמל, צבע פסטל, מילות מפתח לבחירת משפט מהטקסט הקיים של התקופה] */
const RGK={persia:['🏺','#b39ddb',['פרס']],alex:['🐎','#82b1ff',['אלכסנדר']],greece:['🏛️','#90caf9',['יוון']],macedon:['🏰','#7986cb',['מקדון']],ptol:['⛵','#ffd54f',['תלמי']],sel:['🐘','#ff8a65',['סלווק','אנטיוכוס']],
 perg:['📜','#ce93d8',['פרגמון']],bith:['⚓','#bcaaa4',['ביתניה','פונטוס']],rome:['🛡️','#e57373',['רומא']],carth:['🚢','#ffb74d',['קרתגו']],nab:['🐫','#e6c37d',['נבטים']],parth:['🏹','#9575cd',['פרתיה']],
 arm:['⛰️','#a1887f',['ארמניה']],judea:['🌟','#69d39a',['יהוד','ירושלים']],hasmo:['🕎','#69d39a',['חשמונא','מתתיהו']],herod:['🏗️','#69d39a',['הורדוס']]};
const rgKey=n=>/פרסית/.test(n)?'persia':/המקדונית/.test(n)?'alex':/^מקדון$/.test(n)?'macedon':/יוון|ליגות/.test(n)?'greece':/תלמי/.test(n)?'ptol':/סלווק/.test(n)?'sel':/פרגמון/.test(n)?'perg':/ביתניה/.test(n)?'bith':/רומא|רומית/.test(n)?'rome':/קרתגו/.test(n)?'carth':/נבטים/.test(n)?'nab':/פרתיה/.test(n)?'parth':/ארמניה/.test(n)?'arm':/חשמונא/.test(n)?'hasmo':/הורדוס/.test(n)?'herod':'judea';
const rgNm=n=>n.replace(/\s*\(.*$/,'');   /* שם קצר לתווית: בלי הסוגריים */
const RGPOL=[];
function rgPols(p){if(RGPOL[p])return RGPOL[p];
 return RGPOL[p]=EMP[p].map((e,i)=>{const k=rgKey(e[0]),d=RGK[k],at=RGP[p][i]||[],m=at.map(a=>MGEOM.atoms[a]);
  return{i,k,name:e[0],nm:rgNm(e[0]),sym:d[0],col:d[1],kw:d[2],atoms:at,west:k=='rome'||(k=='carth'),wlat:k=='rome'?41.9:36.4,hov:0,lbl:null,
   bb:m.length?[Math.min(...m.map(a=>a.bb[0])),Math.max(...m.map(a=>a.bb[1])),Math.min(...m.map(a=>a.bb[2])),Math.max(...m.map(a=>a.bb[3]))]:null}})}
const rgAM=p=>{const m={};rgPols(p).forEach((q,i)=>q.atoms.forEach(a=>m[a]=i));return m};
const rgHex=h=>{const n=parseInt(h.slice(1),16);return[n>>16,(n>>8)&255,n&255]};

/* ---------- ערים לפי תקופה (משוער): שמות מתוך CITIES (נתוני regions.js), רשימה קצרה וזהירה ---------- */
const RGCN=[['ירושלים','בבל','שושן','ממפיס','אתונה','צור'],['ירושלים','אלכסנדריה','בבל','שושן','אתונה','צור'],['ירושלים','אלכסנדריה','אנטיוכיה','פטרה','בבל','אתונה'],['ירושלים','אלכסנדריה','אנטיוכיה','בבל','פטרה','אתונה'],
 ['ירושלים','מודיעין','אלכסנדריה','אנטיוכיה','קטסיפון','פטרה'],['ירושלים','קיסריה','מצדה','אלכסנדריה','אנטיוכיה','פטרה'],['ירושלים','קיסריה','מצדה','אלכסנדריה','אנטיוכיה','קטסיפון']];
const RGCE={'ירושלים':'🌟','אלכסנדריה':'🗼','אנטיוכיה':'🏛️','בבל':'🧱','שושן':'👑','קיסריה':'⚓','פטרה':'🪨','אתונה':'🏛️','ממפיס':'🔺','קטסיפון':'🏰','מצדה':'🏰','מודיעין':'🕎','צור':'⚓'},
 RGCD={'אלכסנדריה':'city_alexandria','אנטיוכיה':'city_antioch','בבל':'city_babylon','שושן':'city_susa','קיסריה':'city_caesarea','פטרה':'city_petra','אתונה':'city_athens'},
 RGSRC='מקור: נתוני "מפת האזור לפי תקופות". מיקומי הערים משוערים.';
const RGCC=[];
function rgCities(p){if(RGCC[p])return RGCC[p];const o=[];
 RGCN[p].forEach(n=>{const c=CITIES.find(x=>x[0]==n&&cityOn(x,p))||CITIES.find(x=>x[0]==n);if(c&&cityOn(c,p))o.push({n,lon:c[1],lat:c[2],e:RGCE[n]||'📍',t:c[7]||'עיר חשובה בתקופה הזאת.',d:RGCD[n]||'',to:c[4]})});
 return RGCC[p]=o}
const RGW=[['הים התיכון',28.0,34.3,0],['הים השחור',35.5,42.4,0],['ים סוף',36.0,24.8,0],['מפרץ פרס',50.6,28.0,0],['הים הכספי',51.0,40.2,0],['הנילוס',31.15,27.6,70],['הפרת',41.2,34.5,70],['חידקל',43.9,35.0,70],
 ['ים כנרת',35.62,32.78,300],['ים המלח',35.47,31.4,300],['הירדן',35.6,32.3,300]];
const RGVW=[['האזור כולו',0],['ארץ ישראל',35.2,32.0,8],['יוון ואנטוליה',29.5,39.3,15],['מצרים',31.5,27.2,12],['בבל ופרס',46.0,33.0,15]];

/* ---------- מצב ---------- */
let rgPrev=-1,rgSel=null,rgHov=null,rgCity=null,rgFly=null,rgRaf=0,rgDim=0,rgAt=0,rgTw=null,rgPins=[],rgChips=[],rgVi=0,rgTop=false,rgIdleT=0,rgCur={m:{},pols:[]};
const rgRM=()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}};
const rgClamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rgEase=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,rgBack=t=>{const c=2.70158;return 1+c*Math.pow(t-1,3)+1.70158*Math.pow(t-1,2)};
function m2s(lon,lat){return[(lon-MV.lon)*MV.z*COSL+MC.width/2,(MV.lat-lat)*MV.z+MC.height/2]}
function s2m(x,y){return[(x-MC.width/2)/(MV.z*COSL)+MV.lon,MV.lat-(y-MC.height/2)/MV.z]}
const rgTf=c=>c.setTransform(MV.z,0,0,MV.z,MC.width/2-MV.z*MV.lon*COSL,MC.height/2+MV.z*MV.lat);   /* מערכת עולם: x=lon*COSL, y=-lat → מסך */
const rgP2=pts=>{const p=new Path2D();for(let i=0;i<pts.length;i+=2)i?p.lineTo(pts[i]*COSL,-pts[i+1]):p.moveTo(pts[i]*COSL,-pts[i+1]);p.closePath();return p};
const rgP2o=pts=>{const p=new Path2D();for(let i=0;i<pts.length;i+=2)i?p.lineTo(pts[i]*COSL,-pts[i+1]):p.moveTo(pts[i]*COSL,-pts[i+1]);return p};
const RGLANDP=new Path2D(),RGSEAP=new Path2D();
{for(const r of MGEOM.land)RGLANDP.addPath(rgP2(r));RGLANDP.addPath(rgP2(MGEOM.casp));RGSEAP.addPath(RGLANDP);RGSEAP.rect(0,-70,100,130)}
const RGAP={},RGEP={},RGLK=[],RGRV=MGEOM.rivers.map(r=>({w:r.w,p:rgP2o(r.p)}));
for(const id in MGEOM.atoms)RGAP[id]=rgP2(MGEOM.atoms[id].ring);
for(const k in MGEOM.edges){const e=MGEOM.edges[k],m=e.pts.length/4|0;RGEP[k]={p:rgP2o(e.pts),at:e.atoms,c:[e.pts[2*m],e.pts[2*m+1]]}}
for(const k in MGEOM.lakes)RGLK.push(rgP2(MGEOM.lakes[k]));
const RGLIM=[6,700],rgHit=document.createElement('canvas').getContext('2d');
const rgInLand=(lon,lat)=>rgHit.isPointInPath(RGLANDP,lon*COSL,-lat,'evenodd');
const rgInAtom=(id,lon,lat)=>{const b=MGEOM.atoms[id].bb;return lon>=b[0]&&lon<=b[1]&&lat>=b[2]&&lat<=b[3]&&rgHit.isPointInPath(RGAP[id],lon*COSL,-lat)};

/* ---------- תמונת הרקע (blob:) – נפילה: רקע שטוח מהנתונים ---------- */
let rgBaseC=null,rgBaseOk=false;
onMapImgs(function(){const u=mapPic('base_m');if(!u)return;const im=new Image();im.onload=()=>{try{const w=im.naturalWidth,h=im.naturalHeight,c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.drawImage(im,0,0);
  const f=Math.round(w*.03);for(const g of[[0,0,f,0],[w,0,w-f,0],[0,0,0,f],[0,h,0,h-f]]){const gr=x.createLinearGradient(g[0],g[1],g[2],g[3]);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,1)');x.globalCompositeOperation='destination-in';x.fillStyle=gr;x.fillRect(0,0,w,h)}
  x.globalCompositeOperation='source-over';rgBaseC=c;rgBaseOk=true;rgQ()}catch(e){rgBaseC=null}};im.onerror=()=>{rgBaseC=null};im.src=u});

/* ---------- אנימציית מעבר בין תקופות: כל אטום משנה צבע/שקיפות בגל שמתפשט מירושלים ---------- */
const RGJ=[35.2,31.8],RGDUR=480;
function rgSet(p,anim){rgVer++;const pols=rgPols(p),m=rgAM(p),from=rgCur;rgCur={m,pols};rgAt=performance.now();
 if(!anim||rgRM()){rgTw=null;return}
 const d={},ed={};for(const id in MGEOM.atoms)d[id]=Math.hypot((MGEOM.atoms[id].c[0]-RGJ[0])*COSL,MGEOM.atoms[id].c[1]-RGJ[1])*32;
 for(const k in RGEP)ed[k]=Math.hypot((RGEP[k].c[0]-RGJ[0])*COSL,RGEP[k].c[1]-RGJ[1])*32;
 rgTw={t0:rgAt,from,d,ed}}
const rgAtomCol=(st,id)=>{const i=st.m[id];return i==null?null:rgHex(st.pols[i].col)};
const rgEdgeVis=(st,k)=>{const a=RGEP[k].at,pa=st.m[a[0]]==null?-1:st.m[a[0]],pb=a.length>1&&st.m[a[1]]!=null?st.m[a[1]]:-1;return pa!=pb};

/* ---------- נקודת תווית פנימית: רסטר של (איחוד האטומים ∩ יבשה − אגמים) → רכיבים קשירים + מרחק עד הקצה (המרכז הפנימי) ---------- */
function rgLabel(atoms,bb){const W=110,gx=(bb[1]-bb[0])*COSL,gy=bb[3]-bb[2],sc=W/Math.max(gx,gy),w=Math.max(4,Math.ceil(gx*sc)+2),h=Math.max(4,Math.ceil(gy*sc)+2);
 const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d'),wx0=bb[0]*COSL,wy0=-bb[3];x.setTransform(sc,0,0,sc,1-wx0*sc,1-wy0*sc);
 x.fillStyle='#000';for(const a of atoms)x.fill(RGAP[a]);x.globalCompositeOperation='destination-in';x.fill(RGLANDP,'evenodd');x.globalCompositeOperation='destination-out';for(const l of RGLK)x.fill(l);
 const d=x.getImageData(0,0,w,h).data,m=new Float32Array(w*h),cl=new Int16Array(w*h);for(let i=0;i<w*h;i++)m[i]=d[4*i+3]>128?1e4:0;
 let nc=0;const area=[0],st=[];   /* רכיבים קשירים (4 שכנים) */
 for(let i=0;i<w*h;i++){if(!m[i]||cl[i])continue;nc++;area[nc]=0;st.push(i);cl[i]=nc;while(st.length){const j=st.pop();area[nc]++;const xx=j%w,yy=(j/w)|0;
   if(xx>0&&m[j-1]&&!cl[j-1]){cl[j-1]=nc;st.push(j-1)}if(xx<w-1&&m[j+1]&&!cl[j+1]){cl[j+1]=nc;st.push(j+1)}if(yy>0&&m[j-w]&&!cl[j-w]){cl[j-w]=nc;st.push(j-w)}if(yy<h-1&&m[j+w]&&!cl[j+w]){cl[j+w]=nc;st.push(j+w)}}}
 for(let y=0;y<h;y++)for(let xx=0;xx<w;xx++){const i=y*w+xx;if(!m[i])continue;let v=m[i];v=Math.min(v,(xx?m[i-1]:0)+1,(y?m[i-w]:0)+1,(xx&&y?m[i-w-1]:0)+1.4,(xx<w-1&&y?m[i-w+1]:0)+1.4);m[i]=v}
 const best=new Float32Array(nc+1),bi=new Int32Array(nc+1).fill(-1);
 for(let y=h-1;y>=0;y--)for(let xx=w-1;xx>=0;xx--){const i=y*w+xx;if(!m[i])continue;let v=m[i];v=Math.min(v,(xx<w-1?m[i+1]:0)+1,(y<h-1?m[i+w]:0)+1,(xx<w-1&&y<h-1?m[i+w+1]:0)+1.4,(xx&&y<h-1?m[i+w-1]:0)+1.4);m[i]=v;if(v>best[cl[i]]){best[cl[i]]=v;bi[cl[i]]=i}}
 const o=[];for(let k=1;k<=nc;k++){if(bi[k]<0)continue;const px=bi[k]%w,py=(bi[k]/w)|0;o.push({lon:(wx0+(px-1)/sc)/COSL,lat:-(wy0+(py-1)/sc),r:best[k]/sc,a:area[k]/sc/sc})}   /* r = רדיוס עיגול פנימי במעלות רוחב */
 return o.sort((p,q)=>q.r-p.r)}
function rgLbls(q){if(!q.lbl){q.lbl=q.bb?rgLabel(q.atoms,q.bb):[];const top=q.lbl.length?q.lbl[0].a:0;q.lbl=q.lbl.filter((l,i)=>i==0||l.a>top*.2)}return q.lbl}

/* ---------- ציור ---------- */
const rgHash=i=>{const s=Math.sin(i*127.1+311.7)*43758.5453;return s-Math.floor(s)};
const rgLay=document.createElement('canvas'),rgLx=rgLay.getContext('2d'),rgOv=document.createElement('canvas'),rgOx=rgOv.getContext('2d');
function rgText(t,x,y,size,fill,stroke){const c=mx2;c.font=`800 ${size}px "Segoe UI",Arial`;c.lineJoin='round';c.strokeStyle=stroke||'rgba(0,0,0,.55)';c.lineWidth=Math.max(3,size/4);c.strokeText(t,x,y);c.fillStyle=fill||'#fff';c.fillText(t,x,y)}
/* גלים ונצנוצים: מיקומים קבועים (lon,lat) שנבחרו פעם אחת כך שכולם בים (בלי clip יקר בכל פריים) */
const RGWV=[];
(function(){for(let i=0;i<900&&RGWV.length<80;i++){const lon=MB.lon0+rgHash(i)*(MB.lon1-MB.lon0),lat=MB.lat0+rgHash(i+1999)*(MB.lat1-MB.lat0);let ok=true;
  for(let k=0;k<8&&ok;k++){const a=k*.7854;if(rgInLand(lon+Math.cos(a)*.6,lat+Math.sin(a)*.5))ok=false}if(ok&&!rgInLand(lon,lat))RGWV.push({lon,lat,i})}})();
function rgSea(now){const c=mx2,W=MC.width,H=MC.height,t=rgRM()?0:now/1000,pz=Math.max(.5,MV.z/48);c.setTransform(1,0,0,1,0,0);
 for(const q of RGWV){const i=q.i,p=m2s(q.lon,q.lat);if(p[0]<-30||p[0]>W+30||p[1]<-20||p[1]>H+20)continue;
  const ph=t*1.1+i*1.7,a=.22+.2*Math.sin(ph),w=(10+rgHash(i+7)*14)*Math.min(2,pz),dy=Math.sin(ph*.7)*2;
  c.strokeStyle='rgba(255,255,255,'+a.toFixed(2)+')';c.lineWidth=2;c.lineCap='round';c.beginPath();c.moveTo(p[0]-w,p[1]+dy);c.quadraticCurveTo(p[0]-w/2,p[1]-5+dy,p[0],p[1]+dy);c.quadraticCurveTo(p[0]+w/2,p[1]+5+dy,p[0]+w,p[1]+dy);c.stroke();
  const sp=Math.max(0,Math.sin(t*1.6+i*2.3));if(i%5==0&&sp>.05){c.fillStyle='rgba(255,255,255,'+(sp*.8).toFixed(2)+')';c.beginPath();const r=1.5+sp*2,x=p[0]+w*.4,y=p[1]-9;
   c.moveTo(x,y-r*2);c.lineTo(x+r*.6,y-r*.6);c.lineTo(x+r*2,y);c.lineTo(x+r*.6,y+r*.6);c.lineTo(x,y+r*2);c.lineTo(x-r*.6,y+r*.6);c.lineTo(x-r*2,y);c.lineTo(x-r*.6,y-r*.6);c.fill()}}}
function rgBase(now){const c=mx2,W=MC.width,H=MC.height;c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.fillStyle=RGSEA;c.fillRect(0,0,W,H);
 if(!(rgBaseOk&&rgBaseC)){rgTf(c);c.fillStyle=RGSAND;c.fill(RGLANDP,'evenodd');c.setTransform(1,0,0,1,0,0)}
 else{const a=m2s(MB.lon0,MB.lat1),b=m2s(MB.lon1,MB.lat0);c.drawImage(rgBaseC,a[0],a[1],b[0]-a[0],b[1]-a[1])}
 rgSea(now)}
const rgProg=(now,d)=>rgTw?rgEase(rgClamp((now-rgTw.t0-d)/RGDUR,0,1)):1;
/* שכבת המדינות (rgLay): בקנבס נפרד – אטומים אטומים בלי תפרים; מורכבת בשקיפות על התמונה. נבנית מחדש רק כשהתצוגה/המצב משתנים (לא בכל פריים של הגלים) */
function rgPolys(now){const W=MC.width,H=MC.height,L=rgLx;L.setTransform(1,0,0,1,0,0);L.globalCompositeOperation='source-over';L.globalAlpha=1;L.clearRect(0,0,W,H);
 L.save();rgTf(L);L.clip(RGLANDP,'evenodd');
 for(const id in RGAP){const st=rgCur,i0=rgTw?rgAtomCol(rgTw.from,id):null,i1=rgAtomCol(st,id),p=rgProg(now,rgTw?rgTw.d[id]:0);let col,al=1;
  if(i0&&i1)col=[0,1,2].map(j=>Math.round(i0[j]+(i1[j]-i0[j])*p));else if(i1){col=i1;al=p}else if(i0){col=i0;al=1-p}else continue;
  if(al<=.01)continue;const s='rgb('+col+')';L.globalAlpha=al;L.fillStyle=s;L.fill(RGAP[id]);if(al>.99){L.lineWidth=1.3/MV.z;L.strokeStyle=s;L.stroke(RGAP[id])}}
 L.restore();L.setTransform(1,0,0,1,0,0);L.globalAlpha=1;L.globalCompositeOperation='source-atop';
 const g=L.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(255,255,255,.3)');g.addColorStop(.5,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(40,20,0,.18)');L.fillStyle=g;L.fillRect(0,0,W,H);L.globalCompositeOperation='source-over'}
/* שכבת העל (rgOv): קו החוף המדויק, גבולות (קצה נראה אם משני צדיו ישויות שונות או ישות ושטח ללא שייכות; דהייה/הופעה בגל), זוהר ישות נבחרת, אגמים ונהרות */
function rgOverlay(now,dim){const W=MC.width,H=MC.height,c=rgOx;c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.clearRect(0,0,W,H);
 c.save();rgTf(c);c.lineJoin='round';c.lineCap='round';c.strokeStyle='rgba(255,255,255,.72)';c.lineWidth=2.6/MV.z;c.stroke(RGLANDP);c.strokeStyle='rgba(210,165,90,.85)';c.lineWidth=1/MV.z;c.stroke(RGLANDP);c.restore();
 if(MT.e){c.save();rgTf(c);c.clip(RGLANDP,'evenodd');c.lineJoin='round';c.lineCap='round';
  for(const k in RGEP){const v1=rgEdgeVis(rgCur,k),v0=rgTw?rgEdgeVis(rgTw.from,k):v1,p=rgProg(now,rgTw?rgTw.ed[k]:0),a=(v0?1-p:0)+(v1?p:0);if(a<=.02)continue;
   c.globalAlpha=Math.min(1,a)*(1-.5*dim);c.lineWidth=3.6/MV.z;c.strokeStyle='rgba(255,255,255,.95)';c.stroke(RGEP[k].p);c.lineWidth=1.3/MV.z;c.strokeStyle='rgba(222,160,40,.95)';c.stroke(RGEP[k].p)}
  c.restore();rgCur.pols.forEach(q=>{const s=(rgSel===q?1:0)*.9+q.hov*.6;if(s>.02)rgGlow(c,q,Math.min(1,s))})}
 c.save();rgTf(c);c.lineJoin='round';c.lineCap='round';c.setLineDash([]);
 for(const l of RGLK){c.fillStyle='#4fb3e8';c.globalAlpha=.9;c.fill(l);c.globalAlpha=1;c.strokeStyle='#f6e3a8';c.lineWidth=1.6/MV.z;c.stroke(l)}
 c.strokeStyle='rgba(79,179,235,.95)';for(const r of RGRV){c.lineWidth=Math.max(1.6,Math.min(4,MV.z/22))*(r.w>3?1:.7)/MV.z;c.stroke(r.p)}c.restore()}
/* זוהר סביב ישות שנבחרה/מרחפת: גבולותיה החיצוניים בצבעה + הבהרה פנימית */
function rgGlow(c,q,s){if(!q||s<=.02||!q.atoms.length)return;const set=new Set(q.atoms);c.save();rgTf(c);c.clip(RGLANDP,'evenodd');
 c.globalAlpha=.2*s;c.fillStyle='#fff';for(const a of q.atoms)c.fill(RGAP[a]);
 c.globalAlpha=s;c.lineJoin='round';c.lineCap='round';c.shadowColor=q.col;c.shadowBlur=24*s;c.strokeStyle=q.col;c.lineWidth=5/MV.z;
 for(const k in RGEP){const e=RGEP[k],a=e.at.map(x=>set.has(x));if(a[0]!=(a.length>1?a[1]:false))c.stroke(e.p)}
 c.restore()}
let rgSig='',rgVer=0;
function rgDraw(now){now=now||performance.now();const W=MC.width,H=MC.height,c=mx2;c.direction='rtl';rgBase(now);
 const el=now-rgAt,pols=rgCur.pols,dim=rgDim;
 const key=[MV.lon.toFixed(4),MV.lat.toFixed(4),MV.z.toFixed(3),W,H,dim.toFixed(2),MT.e,rgSel?rgSel.i:-1,pols.map(q=>q.hov.toFixed(2)).join(),rgVer].join('|');
 if(rgTw||key!==rgSig){rgSig=key;if(MT.e)rgPolys(now);rgOverlay(now,dim)}
 c.setTransform(1,0,0,1,0,0);
 if(MT.e){c.save();c.globalAlpha=.78*(1-.55*dim);c.drawImage(rgLay,0,0);c.restore()}
 c.drawImage(rgOv,0,0);
 c.textAlign='center';const sz=Math.max(13,Math.min(25,MV.z/2.4)),put=[];
 const free=(x,y,w,h)=>{if(put.some(q=>x<q[2]&&x+w>q[0]&&y<q[3]&&y+h>q[1]))return false;put.push([x,y,x+w,y+h]);return true};
 /* שמות ישויות + סמל במרכז הפנימי של הצורה */
 const cp=rgCity?m2s(rgCity.lon,rgCity.lat):null;rgChips=[];
 if(MT.e&&MT.l){const labs=[];pols.forEach((q,i)=>{if(!q.atoms.length)return;const t=rgClamp((el-450-i*90)/420,0,1);if(t<=0&&!rgRM())return;rgLbls(q).forEach((lb,j)=>{const pr=lb.r*MV.z,sel=rgSel===q||q.hov>.5;if(sel||pr>sz*1.15||(j==0&&pr>sz*.7&&q.lbl.length==1))labs.push({q,lb,t:rgRM()?1:t,sel})})});
  labs.sort((a,b)=>(b.sel-a.sel)||(b.lb.r-a.lb.r));
  for(const l of labs){const p=m2s(l.lb.lon,l.lb.lat);if(p[0]<-60||p[0]>W+60||p[1]<-40||p[1]>H+40)continue;if(cp&&Math.hypot(p[0]-cp[0],p[1]-cp[1]-sz)<sz*3)continue;
   const w=l.q.nm.length*sz*.62+10;if(!(l.sel||free(p[0]-w/2,p[1]-sz*1.7,w,sz*3.1)))continue;c.globalAlpha=l.t*(cp?.55:1);const lift=(1-l.t)*10;
   c.font=sz*1.5+'px "Segoe UI Emoji"';c.fillStyle='#000';EI.fill(c,l.q.sym,p[0],p[1]-sz*.2-lift,sz*1.7);rgText(l.q.nm,p[0],p[1]+sz*1.25-lift,sz);c.globalAlpha=1}}
 /* שמות מים/נהרות */
 RGW.forEach(w=>{if(MV.z<=w[3])return;const p=m2s(w[1],w[2]);if(p[0]<-60||p[0]>W+60||p[1]<-20||p[1]>H+20)return;const fs=Math.max(11,Math.min(20,sz*.62)),ww=w[0].length*fs*.6;if(free(p[0]-ww/2,p[1]-fs,ww,fs*1.3))rgText(w[0],p[0],p[1],fs,'#0d3b66','#e8f4fb')});
 /* שפת הים הדרומית־מערבית: ישויות שממשיכות מעבר לקצה המפה (רומא/קרתגו) */
 if(MT.e&&MT.l)pols.forEach((q,i)=>{if(!q.west)return;const a=m2s(MB.lon0,q.wlat),x=Math.max(12,a[0]+8),y=a[1];if(x>W-60||y<18||y>H-18)return;const t=rgClamp((el-500-i*90)/420,0,1);if(t<=0&&!rgRM())return;
  const fs=Math.max(13,Math.min(17,sz*.8)),w=q.nm.length*fs*.62+46;c.save();c.globalAlpha=rgRM()?1:t;c.shadowColor='rgba(0,0,0,.3)';c.shadowBlur=5;c.fillStyle=q.col;c.strokeStyle='#fff';c.lineWidth=3;
  const rx=x,ry=y-fs*.9,rw=w,rh=fs*1.9;c.beginPath();c.moveTo(rx+rh/2,ry);c.lineTo(rx+rw-rh/2,ry);c.arc(rx+rw-rh/2,ry+rh/2,rh/2,-1.5708,1.5708);c.lineTo(rx+rh/2,ry+rh);c.arc(rx+rh/2,ry+rh/2,rh/2,1.5708,4.7124);c.closePath();c.fill();c.shadowBlur=0;c.stroke();
  c.font=fs+'px "Segoe UI Emoji"';c.fillStyle='#000';c.textAlign='center';EI.fill(c,'◀',rx+rh/2+2,ry+rh*.72,fs*1.25);c.font=`800 ${fs}px "Segoe UI",Arial`;c.fillStyle='#3b2a14';{const cx=rx+rw/2+rh*.25,ky=EI.keyOf(q.sym);if(ky&&EI.has(ky)){const wf=c.measureText(q.sym+' '+q.nm).width,ws=c.measureText(q.sym+' ').width;c.textAlign='left';c.fillText(q.nm,cx-wf/2+ws,ry+rh*.72);EI.fill(c,q.sym,cx-wf/2+ws*.42,ry+rh*.72,fs*1.25);c.textAlign='center'}else c.fillText(q.sym+' '+q.nm,cx,ry+rh*.72)}c.restore();rgChips.push([rx,ry,rw,rh,q])});
 /* סמלי ערים: קופצים קלות בכניסה ובבחירה */
 rgPins=[];if(MT.c){const cs=rgCities(curPer);c.textAlign='center';
  cs.forEach((s,i)=>{const p=m2s(s.lon,s.lat);if(p[0]<-30||p[1]<-40||p[0]>W+30||p[1]>H+30)return;const sel=rgCity===s,t0=rgClamp((el-300-i*90)/420,0,1),tp=rgRM()?1:rgBack(t0);if(t0<=0&&!rgRM())return;
   const bob=sel&&!rgRM()?Math.abs(Math.sin(now/260))*6:0,r=Math.max(13,Math.min(19,MV.z/5)),y=p[1]-(1-Math.min(tp,1))*26-bob;
   if(sel&&!rgRM()){const k=(now/900)%1;c.save();c.globalAlpha=(1-k)*.6;c.strokeStyle='#ff9800';c.lineWidth=3;c.beginPath();c.arc(p[0],p[1],6+k*30,0,6.2832);c.stroke();c.restore()}
   if(!sel&&!free(p[0]-r,y-r*1.6,r*2,r*2.2))return;rgPins.push([p[0],p[1],s]);
   c.save();c.globalAlpha=Math.min(1,tp);c.shadowColor='rgba(0,0,0,.35)';c.shadowBlur=6;c.shadowOffsetY=2;c.fillStyle='#fff';c.strokeStyle=sel?'#ff9800':'#e0a92e';c.lineWidth=sel?4:2.5;c.beginPath();c.arc(p[0],y-r*1.0,r,0,6.2832);c.fill();c.shadowBlur=0;c.shadowOffsetY=0;c.stroke();
   c.beginPath();c.moveTo(p[0]-r*.45,y-r*.35);c.lineTo(p[0],y+r*.35);c.lineTo(p[0]+r*.45,y-r*.35);c.fillStyle='#fff';c.fill();
   c.font=Math.round(r*1.15)+'px "Segoe UI Emoji"';c.fillStyle='#000';c.textBaseline='middle';EI.fill(c,s.e,p[0],y-r*.95,r*1.5,true);c.textBaseline='alphabetic';c.restore();
   if(MT.l&&(sel||MV.z>70)){const fs=Math.max(11,sz*.66),w=s.n.length*fs*.6;if(sel||free(p[0]-w/2,p[1]+3,w,fs*1.4))rgText(s.n,p[0],p[1]+fs+3,fs,'#3e2723','#fff')}})}
 c.globalAlpha=1}

/* ---------- לולאת אנימציה: רק כשהדף פתוח; ים/נצנוץ בקצב נמוך; מכבד prefers-reduced-motion ---------- */
function rgQ(){if(!rgRaf&&mapOpen)rgRaf=requestAnimationFrame(rgTick)}
function rgTick(now){rgRaf=0;if(!mapOpen)return;let busy=false;
 if(rgFly){const t=rgClamp((now-rgFly.t0)/rgFly.d,0,1),e=rgEase(t);MV.lon=rgFly.a.lon+(rgFly.b.lon-rgFly.a.lon)*e;MV.lat=rgFly.a.lat+(rgFly.b.lat-rgFly.a.lat)*e;MV.z=rgFly.a.z*Math.pow(rgFly.b.z/rgFly.a.z,e);rgClampV();if(t>=1)rgFly=null;else busy=true}
 {const tg=rgCity?1:0;rgDim+=(tg-rgDim)*.18;if(Math.abs(tg-rgDim)<.01)rgDim=tg;else busy=true}
 for(const q of rgCur.pols){const tg=rgHov===q?1:0;q.hov+=(tg-q.hov)*.22;if(Math.abs(tg-q.hov)<.01)q.hov=tg;else busy=true}
 const el=now-rgAt;if(!rgRM()&&(el<2200||rgTw&&now-rgTw.t0<1800))busy=true;if(rgTw&&now-rgTw.t0>=1800){rgTw=null;rgVer++}if(rgCity&&!rgRM())busy=true;
 rgDraw(now);if(busy)rgQ()}
function rgIdleOn(){clearInterval(rgIdleT);rgIdleT=setInterval(()=>{if(mapOpen&&!rgRM()&&!document.hidden)rgQ()},90)}
function rgFlyTo(lon,lat,z,d){z=rgClamp(z,rgMinZ(),700);{const hw=MC.width/2/(z*COSL),hh=MC.height/2/z,lo=MB.lon0+hw,hi=MB.lon1-hw,a=MB.lat0+hh,b=MB.lat1-hh;lon=lo>hi?(MB.lon0+MB.lon1)/2:rgClamp(lon,lo,hi);lat=a>b?(MB.lat0+MB.lat1)/2:rgClamp(lat,a,b)}
 if(rgRM()){MV.lon=lon;MV.lat=lat;MV.z=z;rgDraw();return}rgFly={t0:performance.now(),d:d||800,a:{lon:MV.lon,lat:MV.lat,z:MV.z},b:{lon,lat,z}};rgQ()}
/* התמונה תמיד מכסה את כל החלון (זום מינימלי = "cover"): לא רואים מה שמחוץ לתחום התמונה; גרירה מוגבלת לתחום */
const rgFitZ=()=>Math.max(MC.width/((MB.lon1-MB.lon0)*COSL),MC.height/(MB.lat1-MB.lat0));
const rgMinZ=()=>rgFitZ();
function rgClampV(){MV.z=Math.max(MV.z,rgMinZ());const hw=MC.width/2/(MV.z*COSL),hh=MC.height/2/MV.z,lo=MB.lon0+hw,hi=MB.lon1-hw,a=MB.lat0+hh,b=MB.lat1-hh;
 MV.lon=lo>hi?(MB.lon0+MB.lon1)/2:rgClamp(MV.lon,lo,hi);MV.lat=a>b?(MB.lat0+MB.lat1)/2:rgClamp(MV.lat,a,b)}
function fitView(lon,lat,span,anim){const z=span?MC.width/(span*COSL):rgFitZ();if(!span){lon=35.6;lat=32.3}if(anim)rgFlyTo(lon,lat,z);else{MV.lon=lon;MV.lat=lat;MV.z=rgClamp(z,rgMinZ(),700);rgClampV();rgDraw()}}
function rgFitPol(q){if(!q.bb)return;const b=q.bb,z=Math.min(MC.width/((b[1]-b[0])*COSL*1.5),MC.height/((b[3]-b[2])*1.5));rgFlyTo((b[0]+b[1])/2,(b[2]+b[3])/2,Math.max(rgFitZ(),Math.min(z,260)))}

/* ---------- לוחית מידע: תמונה + משפט אחד + "עוד" ---------- */
function mapPlaces(){const bx=$('mpPl');if(bx.dataset.done)return;bx.dataset.done=1;
 [['הר הבית','r_mount','מבט על','🕍'],['המזבח',null,'המזבח','🔥'],['ההיכל',null,'ההיכל מצד מערב','✨'],['בפנים',null,'בתוך ההיכל','🕎']].forEach(([lb,k,pf,em])=>{
  const b=document.createElement('button');b.className='mth';b.setAttribute('aria-label',lb);const key=k||mapPk(pf);
  b.appendChild(mapImg(key||'',MCOL[5],em));const s=document.createElement('span');s.textContent=lb;b.appendChild(s);
  b.onclick=()=>{openMap(false);const p=P.find(x=>x[0]!='sec'&&x[0].indexOf(pf)==0);if(p)goto(p)};bx.appendChild(b)})}
/* משפט על ישות: המשפט הראשון בטקסט הקיים של התקופה שמזכיר אותה; אחרת – המשפט הראשון של התקופה */
function rgSent(q,P0){const ss=(P0.txt||'').split(/(?<=[.!?])\s/);const h=ss.find(s=>q.kw.some(k=>s.indexOf(k)>=0));return h?mShort(h):mShort(P0.txt)}
function mapInfo(){const P0=PERIODS[curPer],i=curPer,pw=$('mpPic');pw.innerHTML='';pw.onclick=null;pw.classList.remove('go');
 const ct=rgCity,q=rgSel;let title,short,full=[],badge;
 if(ct&&ct.n!='ירושלים'){pw.appendChild(mapImg(ct.d?'d_'+ct.d:MDECO[i],MCOL[i],ct.e));badge=ct.d?'🎨 איור – לא מדויק':'🎨 איור של התקופה'}
 else{const im=mapImg((rgTop?'r_jer':'r_jo')+i,MCOL[i],'🕍');im.classList.add('mmodel');im.setAttribute('role','img');im.setAttribute('aria-label','ירושלים בדגם');im.onclick=()=>$('mapTo3d').click();pw.appendChild(im);badge='🕍 ירושלים בדגם';
  const tb=document.createElement('button');tb.className='mib mtop';tb.textContent=rgTop?'👁️':'🧭';tb.setAttribute('aria-label',rgTop?'מבט מהצד':'מבט מלמעלה');tb.onclick=e=>{e.stopPropagation();rgTop=!rgTop;mapInfo()};pw.appendChild(tb)}
 const cap=document.createElement('div');cap.className='mcap';cap.textContent=badge;pw.appendChild(cap);
 if(ct){title=ct.e+' '+ct.n;short=ct.t;full=['<p class="ksrc">📍 מיקום משוער. '+RGSRC+(ct.to>=70?'':' קיימת עד '+Math.abs(ct.to)+' לפנה״ס.')+'</p>']}
 else if(q){title=q.sym+' '+q.nm;short=rgSent(q,P0);full=[P0.txt,'בארץ: '+P0.jud].map(t=>'<p>'+t+'</p>')}
 else{title=P0.n;short=mShort(P0.txt);full=[P0.txt,'בארץ: '+P0.jud,'בית המקדש: '+P0.tem].map(t=>'<p>'+t+'</p>')}
 $('mpT').textContent=title;$('mpJ').textContent=P0.yr;$('mpD').textContent=short;$('mpFull').innerHTML=full.join('');
 $('mpMore').style.display=(ct||full.join(' ').replace(/<[^>]+>/g,'').length>short.length+4)?'inline-block':'none';$('mpBack').style.display=(ct||q)?'inline-block':'none';
 const L=$('mpL');L.innerHTML='';rgPols(curPer).forEach(p=>{const b=document.createElement('button');b.className='mlg'+(q===p?' on':'');b.title=p.name;b.innerHTML='<i></i>';b.firstChild.style.background=p.col;b.appendChild(document.createTextNode(p.sym+' '+p.nm));b.onclick=()=>rgPickPol(p,true);L.appendChild(b)});
 document.querySelectorAll('#mcities button').forEach(b=>b.classList.toggle('on',!!ct&&b.dataset.n==ct.n))}
function rgCityStrip(){const box=$('mcities');box.innerHTML='';rgCities(curPer).forEach(c=>{const b=document.createElement('button');b.className='kcc';b.dataset.n=c.n;b.setAttribute('aria-label',c.n);
  const im=c.n=='ירושלים'?mapImg('r_jo'+curPer,MCOL[curPer],c.e):mapImg(c.d?'d_'+c.d:'',MCOL[curPer],c.e);b.appendChild(im);const t=document.createElement('b');t.textContent=c.n;b.appendChild(t);b.onclick=()=>rgPickCity(c);box.appendChild(b)})}
function rgPickCity(c){rgCity=c;rgSel=null;mapInfo();rgFlyTo(c.lon,c.lat+.2,Math.max(MV.z,MC.width/(7*COSL)));const on=document.querySelector('#mcities button.on');if(on&&on.scrollIntoView)try{on.scrollIntoView({inline:'center',block:'nearest'})}catch(e){}rgQ()}
function rgPickPol(q,fly){if(!q){rgSel=null;rgCity=null;mapInfo();rgQ();return}rgCity=null;rgSel=q;if(fly)rgFitPol(q);mapInfo();rgQ()}
function rgReset(){rgSel=null;rgCity=null;fitView(0,0,0,true);mapInfo();rgQ()}
function mapRefresh(){document.querySelectorAll('#mper button').forEach((b,i)=>b.classList.toggle('on',i==curPer));
 if(mapOpen){if(curPer!=rgPrev){rgPrev=curPer;rgSel=null;rgCity=null;rgHov=null;rgSet(curPer,true);rgCityStrip()}mapInfo();rgQ();
  const on=document.querySelector('#mper button.on');if(on&&on.scrollIntoView)try{on.scrollIntoView({inline:'center',block:'nearest'})}catch(e){}}}
function sizeMap(){const r=MC.parentElement.getBoundingClientRect();MC.width=Math.max(200,Math.round(r.width));MC.height=Math.max(200,Math.round(r.height));rgLay.width=rgOv.width=MC.width;rgLay.height=rgOv.height=MC.height;rgVer++;RGLIM[0]=rgMinZ();rgClampV();rgDraw()}
function openMap(on){if(on&&typeof stopTour=='function')stopTour();mapOpen=on;$('mapov').style.display=on?'flex':'none';
 if(on){sizeMap();mapPlaces();if(!openMap.once){openMap.once=1;fitView(0,0,0)}rgPrev=curPer;rgSel=null;rgCity=null;rgCur={m:{},pols:[]};rgSet(curPer,true);rgCityStrip();mapInfo();
  document.querySelectorAll('#mper button').forEach((b,i)=>b.classList.toggle('on',i==curPer));rgIdleOn();rgQ()}else{clearInterval(rgIdleT);rgFly=null}}

/* ---------- בחירה וקלט ---------- */
function rgPick(x,y){for(let i=rgChips.length-1;i>=0;i--){const q=rgChips[i];if(x>=q[0]&&x<=q[0]+q[2]&&y>=q[1]&&y<=q[1]+q[3])return{pol:q[4]}}
 for(let i=rgPins.length-1;i>=0;i--){const p=rgPins[i];if(Math.hypot(p[0]-x,p[1]-y)<26||Math.hypot(p[0]-x,p[1]-y+18)<24)return{city:p[2]}}
 if(!MT.e)return null;const m=s2m(x,y);if(!rgInLand(m[0],m[1]))return null;for(const id in rgCur.m)if(rgInAtom(id,m[0],m[1]))return{pol:rgCur.pols[rgCur.m[id]]};return null}
const MG=mapGest(MC,MV,RGLIM,()=>{rgFly=null;rgClampV();rgDraw()},(x,y)=>{const h=rgPick(x,y);if(h&&h.city)rgPickCity(h.city);else if(h&&h.pol)rgPickPol(h.pol,false);else rgPickPol(null)},
 (x,y)=>{const h=rgPick(x,y),q=h&&h.pol||null;if(q!==rgHov){rgHov=q;MC.style.cursor=h?'pointer':'grab';rgQ()}});
MC.addEventListener('pointerdown',()=>{rgFly=null});
addEventListener('resize',()=>{if(mapOpen)sizeMap()});
/* כרטיסי תקופה (איור + שם + שנה) */
PERIODS.forEach((p,i)=>{const b=document.createElement('button');b.className='mcard';b.style.setProperty('--c',MCOL[i]);b.setAttribute('aria-label',p.n+' '+p.yr);
 b.appendChild(mapImg(MDECO[i],MCOL[i],MEMO[i]));const t=document.createElement('b');t.textContent=MSH[i];const s=document.createElement('small');s.textContent=MYR(i);b.append(t,s);
 b.onclick=()=>setPeriod(i);$('mper').appendChild(b)});
/* כפתורי סמלים */
[['mapE','e'],['mapC','c'],['mapL','l']].forEach(([id,k])=>{const b=$(id);b.onclick=()=>{MT[k]=MT[k]?0:1;b.classList.toggle('on',!!MT[k]);rgDraw();rgQ()}});
$('zIn').onclick=()=>MG.zoom(1.45);$('zOut').onclick=()=>MG.zoom(1/1.45);
$('zIl').onclick=()=>{rgVi=1;fitView(35.2,32.0,8,true);mapToast($('mtoast'),RGVW[1][0])};
$('zFind').onclick=()=>{rgVi=(rgVi+1)%RGVW.length;const v=RGVW[rgVi];if(v[1]==null||v.length<3)fitView(0,0,0,true);else fitView(v[1],v[2],v[3],true);mapToast($('mtoast'),v[0])};
$('mpMore').onclick=()=>{const o=$('mapside').classList.toggle('open');$('mpMore').textContent=o?'🔼 פחות':'📖 עוד'};
$('mpBack').onclick=()=>rgReset();
$('bMap').onclick=()=>openMap(true);$('mapX').onclick=()=>openMap(false);$('perChip').onclick=()=>openMap(true);
$('mapTo3d').onclick=()=>{openMap(false);setPeriod(curPer)};
