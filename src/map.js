/* ================= מפת האזור לפי תקופות – עיצוב מחדש לילדים (18.11.2026) =================
   כרטיסי תקופה עם איור (Gemini – קישוט בלבד), מפה גדולה, לוחית מידע קצרה עם תמונה מרונדרת מהדגם התלת־ממדי (src/map_images.js),
   כפתורי סמלים. התמונות מוטמעות כ-base64 ומוצגות דרך blob: URL (נטפרי), עם נפילה לצבע+אימוג'י. כל העובדות (גבולות/ערים/תקופות) מהנתונים בלבד. */
const PR=[[-538,-332],[-332,-301],[-301,-200],[-200,-167],[-167,-63],[-63,-4],[-4,70]];
const MSH=['פרס','אלכסנדר','תלמי','סלווקים','חשמונאים','הורדוס','רומא'],MDECO=['d_persia','d_greece','d_ptolemy','d_seleucid','d_hasmonean','d_herod','d_roman'],
 MCOL=['#8e6bbf','#4a90d9','#d9a441','#6aa84f','#7e57c2','#26a69a','#c62828'],MEMO=['🏺','🏛️','⛵','🐘','🕎','🏗️','🛡️'];
const COSL=.82,MC=$('mapc'),mx2=MC.getContext('2d');
const MV={lon:32,lat:35,z:20},MS2={c:1,e:1,l:1};let mapOpen=false,curPer=5,selC=null,hovC=null,mrect=[],mpTop=false,mpVi=0;
const KCOL={k:'#c9961a',c:'#3a3a3a',p:'#2a6fb0',h:'#7d3fa0',f:'#b03030'};
const MVIEWS=[['האזור',33,36,46],['ארץ ישראל',35.2,32.2,3.4],['יוון ורומא',17,40.5,26],['מצרים ובבל',36,31,32]];

/* ---------- תמונות מוטמעות -> blob: URL (נטפרי: blob מקומי עובר; data: בתוך HTML/CSS נחסם) ---------- */
const MPU={};
function mapPic(k){if(k in MPU)return MPU[k];let r=null;
 try{const u=typeof MAP_IMG!='undefined'&&MAP_IMG[k];if(u){const s=atob(u),a=new Uint8Array(s.length);for(let j=0;j<s.length;j++)a[j]=s.charCodeAt(j);r=URL.createObjectURL(new Blob([a],{type:'image/jpeg'}))}}catch(e){r=null}
 return MPU[k]=r}
/* אלמנט תמונה: צבע+אימוג'י כרקע; ה-<img> מכסה אותו, ואם נכשל (או חסרה תמונה) נשאר הרקע */
function mapImg(k,col,emo){const d=document.createElement('div');d.className='mpic';d.style.setProperty('--c',col||'#f6c26b');
 const u=mapPic(k);if(u){const im=new Image();im.alt='';im.draggable=false;im.onerror=()=>{im.remove();d.textContent=emo||''};d.appendChild(im);im.src=u}else d.textContent=emo||'';return d}
function mapPk(n){const m=(typeof MAP_IMG_META!='undefined'&&MAP_IMG_META.places||[]).find(x=>x[1].indexOf(n)==0);return m?m[0]:null}   /* מפתח תמונת מקום לפי שם (הסדר ב-P יכול להשתנות) */
const mShort=d=>{d=(d||'').replace(/\s+/g,' ').trim();let s=d.split(/(?<=[.!?])\s/)[0]||d;if(s.length>110){const c=s.slice(0,110),i=Math.max(c.lastIndexOf(', '),c.lastIndexOf(' – '),c.lastIndexOf(': '));s=(i>40?c.slice(0,i):c.replace(/\s\S*$/,''))+'…'}return s};
const MYR=i=>{const a=PR[i][0],b=PR[i][1];return b<=0?(-a)+'–'+(-b)+' לפנה״ס':(-a)+' לפנה״ס–'+b};   /* שנה קצרה לכרטיס (מתוך PR) */
function mapToast(el,t){el.textContent=t;el.classList.add('on');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('on'),1600)}

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

/* ---------- ציור המפה ---------- */
function m2s(lon,lat){return[(lon-MV.lon)*MV.z*COSL+MC.width/2,(MV.lat-lat)*MV.z+MC.height/2]}
function s2m(x,y){return[(x-MC.width/2)/(MV.z*COSL)+MV.lon,MV.lat-(y-MC.height/2)/MV.z]}
function cityOn(c,i){return c[3]<=PR[i][1]&&c[4]>=PR[i][0]}
function landPath(ctx){ctx.beginPath();for(const r of LAND){for(let i=0;i<r.length;i+=2){const p=m2s(r[i],r[i+1]);i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])}ctx.closePath()}}
function shapePath(ctx,pts){ctx.beginPath();for(let i=0;i<pts.length;i+=2){const p=m2s(pts[i],pts[i+1]);i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])}ctx.closePath()}
function mHalo(c,t,x,y,fill){c.lineJoin='round';c.strokeStyle='rgba(255,255,255,.92)';c.lineWidth=4;c.strokeText(t,x,y);c.fillStyle=fill;c.fillText(t,x,y)}
function drawMapCanvas(){const W=MC.width,H=MC.height,c=mx2;c.fillStyle='#a9d6f2';c.fillRect(0,0,W,H);
 landPath(c);c.fillStyle='#f3e8c4';c.fill();
 if(MS2.e){c.save();landPath(c);c.clip();c.lineJoin='round';for(const e of EMP[curPer]){for(const sh of e[2]){shapePath(c,Z[sh]);c.globalAlpha=.55;c.fillStyle=e[1];c.fill();c.globalAlpha=.95;c.strokeStyle=e[1];c.lineWidth=2;c.stroke()}}c.restore();c.globalAlpha=1}
 landPath(c);c.strokeStyle='#8a7650';c.lineWidth=1.2;c.stroke();
 mrect=[];c.textAlign='center';c.direction='rtl';
 if(MS2.e&&MS2.l){c.font='800 17px "Segoe UI",Arial';for(const e of EMP[curPer]){const pts=Z[e[2][0]];let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(let i=0;i<pts.length;i+=2){x0=Math.min(x0,pts[i]);x1=Math.max(x1,pts[i]);y0=Math.min(y0,pts[i+1]);y1=Math.max(y1,pts[i+1])}
  const s=m2s((x0+x1)/2,(y0+y1)/2),w=(x1-x0)*MV.z*COSL;if(w>70)mHalo(c,e[0],s[0],s[1],'#4a3418')}}
 if(MS2.c){const thr=MV.z<15?3:MV.z<34?2:1;c.font='700 14px "Segoe UI",Arial';
  const cs=CITIES.filter(k=>cityOn(k,curPer)).sort((a,b)=>b[5]-a[5]);
  for(const k of cs){const p=m2s(k[1],k[2]);if(p[0]<-20||p[1]<-20||p[0]>W+20||p[1]>H+20)continue;const sel=k===selC||k===hovC;
   if(k[5]<thr&&!sel)continue;const r=k[6]=='k'?7:k[5]>=2?5.5:4.5;c.fillStyle=KCOL[k[6]]||'#333';c.strokeStyle='#fff';c.lineWidth=2;
   c.beginPath();if(k[6]=='f')c.rect(p[0]-r,p[1]-r,2*r,2*r);else if(k[6]=='h'){c.moveTo(p[0],p[1]-r*1.4);c.lineTo(p[0]+r*1.2,p[1]+r);c.lineTo(p[0]-r*1.2,p[1]+r);c.closePath()}else c.arc(p[0],p[1],r,0,6.283);c.fill();c.stroke();
   if(k[0]=='ירושלים'){c.strokeStyle='#f5a300';c.lineWidth=3.5;c.beginPath();c.arc(p[0],p[1],r+5,0,6.283);c.stroke()}
   if(sel){c.strokeStyle='#ff6f00';c.lineWidth=3;c.beginPath();c.arc(p[0],p[1],r+8,0,6.283);c.stroke()}
   if(MS2.l){const w=c.measureText(k[0]).width+8,x=p[0]-w/2,y=p[1]-r-17;if(!sel&&mrect.some(q=>x<q[2]&&x+w>q[0]&&y<q[3]&&y+16>q[1]))continue;mrect.push([x,y,x+w,y+16]);
    mHalo(c,k[0],p[0],y+12,sel?'#b34700':'#222')}
   k._p=p}}
 // מצפן וסרגל
 c.fillStyle='#222';c.font='800 14px Arial';c.fillText('N',W-30,24);c.beginPath();c.moveTo(W-30,28);c.lineTo(W-36,44);c.lineTo(W-24,44);c.fill();
 const km=100,px=km/111*MV.z*COSL;c.fillStyle='#222';c.fillRect(16,H-26,px,4);c.font='12px Arial';c.textAlign='left';c.fillText(km+' ק״מ',16,H-32);c.textAlign='center'}
function pickCity(x,y){let b=null,bd=20;for(const k of CITIES){if(!cityOn(k,curPer)||!k._p)continue;const d=Math.hypot(k._p[0]-x,k._p[1]-y);if(d<bd&&(MV.z>=34||k[5]>=(MV.z<15?3:2))){bd=d;b=k}}return b}
function fitView(lon,lat,span){MV.lon=lon;MV.lat=lat;MV.z=MC.width/(span*COSL);drawMapCanvas()}

/* ---------- לוחית מידע: תמונת הדגם + משפט אחד + "עוד" ---------- */
function mapPlaces(){const bx=$('mpPl');if(bx.dataset.done)return;bx.dataset.done=1;
 [['הר הבית','r_mount','מבט על','🕍'],['המזבח',null,'המזבח','🔥'],['ההיכל',null,'ההיכל מצד מערב','✨'],['בפנים',null,'בתוך ההיכל','🕎']].forEach(([lb,k,pf,em])=>{
  const b=document.createElement('button');b.className='mth';b.setAttribute('aria-label',lb);const key=k||mapPk(pf);
  b.appendChild(mapImg(key||'',MCOL[5],em));const s=document.createElement('span');s.textContent=lb;b.appendChild(s);
  b.onclick=()=>{openMap(false);const p=P.find(x=>x[0]!='sec'&&x[0].indexOf(pf)==0);if(p)goto(p)};bx.appendChild(b)})}
function mapInfo(){const P0=PERIODS[curPer],i=curPer;
 const pw=$('mpPic');pw.innerHTML='';const im=mapImg((mpTop?'r_jer':'r_jo')+i,MCOL[i],'🕍');im.classList.add('mmodel');im.setAttribute('role','img');im.setAttribute('aria-label','ירושלים בדגם');im.onclick=()=>$('mapTo3d').click();pw.appendChild(im);
 const cap=document.createElement('div');cap.className='mcap';cap.textContent='🕍 ירושלים בדגם';pw.appendChild(cap);
 const tb=document.createElement('button');tb.className='mib mtop';tb.textContent=mpTop?'👁️':'🧭';tb.setAttribute('aria-label',mpTop?'מבט מהצד':'מבט מלמעלה');tb.onclick=()=>{mpTop=!mpTop;mapInfo()};pw.appendChild(tb);
 $('mpT').textContent=P0.n;$('mpJ').textContent=P0.yr;$('mpD').textContent=mShort(P0.txt);
 $('mpFull').innerHTML='';[P0.txt,'בארץ: '+P0.jud,'בית המקדש: '+P0.tem].forEach(t=>{const p=document.createElement('p');p.textContent=t;$('mpFull').appendChild(p)});
 $('mpL').innerHTML=EMP[curPer].map(e=>`<span><i style="background:${e[1]}"></i>${e[0]}</span>`).join('');
 const k=selC;$('mpC').style.display=k?'block':'none';if(k)$('mpC').innerHTML=`<b>${k[0]}</b>${k[4]>=70?'':' · עד '+Math.abs(k[4])+' לפנה״ס'}<div>${mShort(k[7]||'')}</div>`}
function mapRefresh(){document.querySelectorAll('#mper button').forEach((b,i)=>b.classList.toggle('on',i==curPer));if(mapOpen)mapInfo();
 const on=document.querySelector('#mper button.on');if(mapOpen&&on&&on.scrollIntoView)try{on.scrollIntoView({inline:'center',block:'nearest'})}catch(e){}
 if(mapOpen)drawMapCanvas()}
function sizeMap(){const r=MC.parentElement.getBoundingClientRect();MC.width=Math.max(200,Math.round(r.width));MC.height=Math.max(200,Math.round(r.height));drawMapCanvas()}
function openMap(on){mapOpen=on;$('mapov').style.display=on?'flex':'none';if(on){sizeMap();mapPlaces();if(!openMap.once){openMap.once=1;fitView(33,36,46)}mapRefresh()}}
/* בקרה */
const MG=mapGest(MC,MV,[6,900],drawMapCanvas,(x,y)=>{selC=pickCity(x,y);mapInfo();drawMapCanvas()},(x,y)=>{const k=pickCity(x,y);if(k!==hovC){hovC=k;MC.style.cursor=k?'pointer':'grab';drawMapCanvas()}});
addEventListener('resize',()=>{if(mapOpen)sizeMap()});
/* כרטיסי תקופה (איור + שם + שנה) */
PERIODS.forEach((p,i)=>{const b=document.createElement('button');b.className='mcard';b.style.setProperty('--c',MCOL[i]);b.setAttribute('aria-label',p.n+' '+p.yr);
 b.appendChild(mapImg(MDECO[i],MCOL[i],MEMO[i]));const t=document.createElement('b');t.textContent=MSH[i];const s=document.createElement('small');s.textContent=MYR(i);b.append(t,s);
 b.onclick=()=>setPeriod(i);$('mper').appendChild(b)});
/* כפתורי סמלים */
[['mapE','e'],['mapC','c'],['mapL','l']].forEach(([id,k])=>{const b=$(id);b.onclick=()=>{MS2[k]=MS2[k]?0:1;b.classList.toggle('on',!!MS2[k]);drawMapCanvas()}});
$('zIn').onclick=()=>MG.zoom(1.45);$('zOut').onclick=()=>MG.zoom(1/1.45);
$('zIl').onclick=()=>{mpVi=1;fitView(35.2,32.2,3.4)};
$('zFind').onclick=()=>{mpVi=(mpVi+1)%MVIEWS.length;const v=MVIEWS[mpVi];fitView(v[1],v[2],v[3]);mapToast($('mtoast'),v[0])};
$('mpMore').onclick=()=>{const o=$('mapside').classList.toggle('open');$('mpMore').textContent=o?'🔼 פחות':'📖 עוד'};
$('bMap').onclick=()=>openMap(true);$('mapX').onclick=()=>openMap(false);$('perChip').onclick=()=>openMap(true);
$('mapTo3d').onclick=()=>{openMap(false);setPeriod(curPer)};
