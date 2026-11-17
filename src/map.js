/* ================= מפת האזור לפי תקופות ================= */
const PR=[[-538,-332],[-332,-301],[-301,-200],[-200,-167],[-167,-63],[-63,-4],[-4,70]];
const COSL=.82,MC=$('mapc'),mx2=MC.getContext('2d');
const MV={lon:32,lat:35,z:20},MS2={c:1,e:1,l:1};let mapOpen=false,curPer=5,selC=null,hovC=null,mdrag=null,mrect=[];
const KCOL={k:'#c9961a',c:'#3a3a3a',p:'#2a6fb0',h:'#7d3fa0',f:'#b03030'};
function m2s(lon,lat){return[(lon-MV.lon)*MV.z*COSL+MC.width/2,(MV.lat-lat)*MV.z+MC.height/2]}
function s2m(x,y){return[(x-MC.width/2)/(MV.z*COSL)+MV.lon,MV.lat-(y-MC.height/2)/MV.z]}
function cityOn(c,i){return c[3]<=PR[i][1]&&c[4]>=PR[i][0]}
function landPath(ctx){ctx.beginPath();for(const r of LAND){for(let i=0;i<r.length;i+=2){const p=m2s(r[i],r[i+1]);i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])}ctx.closePath()}}
function shapePath(ctx,pts){ctx.beginPath();for(let i=0;i<pts.length;i+=2){const p=m2s(pts[i],pts[i+1]);i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])}ctx.closePath()}
function drawMapCanvas(){const W=MC.width,H=MC.height,c=mx2;c.fillStyle='#b9d4e8';c.fillRect(0,0,W,H);
 landPath(c);c.fillStyle='#efe5c8';c.fill();
 if(MS2.e){c.save();landPath(c);c.clip();c.lineJoin='round';for(const e of EMP[curPer]){for(const sh of e[2]){shapePath(c,Z[sh]);c.globalAlpha=.5;c.fillStyle=e[1];c.fill();c.globalAlpha=.95;c.strokeStyle=e[1];c.lineWidth=1.6;c.stroke()}}c.restore();c.globalAlpha=1}
 landPath(c);c.strokeStyle='#7a6a48';c.lineWidth=1;c.stroke();
 mrect=[];c.textAlign='center';c.direction='rtl';
 if(MS2.e&&MS2.l){c.font='700 15px Segoe UI,Arial';for(const e of EMP[curPer]){const pts=Z[e[2][0]];let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(let i=0;i<pts.length;i+=2){x0=Math.min(x0,pts[i]);x1=Math.max(x1,pts[i]);y0=Math.min(y0,pts[i+1]);y1=Math.max(y1,pts[i+1])}
  const s=m2s((x0+x1)/2,(y0+y1)/2),w=(x1-x0)*MV.z*COSL;if(w>70){c.fillStyle='rgba(30,20,10,.55)';c.fillText(e[0],s[0],s[1])}}}
 if(MS2.c){const thr=MV.z<15?3:MV.z<34?2:1;c.font='12.5px Segoe UI,Arial';
  const cs=CITIES.filter(k=>cityOn(k,curPer)).sort((a,b)=>b[5]-a[5]);
  for(const k of cs){const p=m2s(k[1],k[2]);if(p[0]<-20||p[1]<-20||p[0]>W+20||p[1]>H+20)continue;const sel=k===selC||k===hovC;
   if(k[5]<thr&&!sel)continue;const r=k[6]=='k'?5.5:k[5]>=2?4.2:3.2;c.fillStyle=KCOL[k[6]]||'#333';c.strokeStyle='#fff';c.lineWidth=1.6;
   c.beginPath();if(k[6]=='f')c.rect(p[0]-r,p[1]-r,2*r,2*r);else if(k[6]=='h'){c.moveTo(p[0],p[1]-r*1.4);c.lineTo(p[0]+r*1.2,p[1]+r);c.lineTo(p[0]-r*1.2,p[1]+r);c.closePath()}else c.arc(p[0],p[1],r,0,6.283);c.fill();c.stroke();
   if(k[0]=='ירושלים'){c.strokeStyle='#e8c068';c.lineWidth=2.5;c.beginPath();c.arc(p[0],p[1],r+4,0,6.283);c.stroke()}
   if(MS2.l){const w=c.measureText(k[0]).width+6,x=p[0]-w/2,y=p[1]-r-15;if(!sel&&mrect.some(q=>x<q[2]&&x+w>q[0]&&y<q[3]&&y+14>q[1]))continue;mrect.push([x,y,x+w,y+14]);
    c.fillStyle='rgba(255,255,255,.82)';c.fillRect(x,y,w,14);c.fillStyle=sel?'#8a5a00':'#222';c.fillText(k[0],p[0],y+11)}
   k._p=p}}
 // מצפן וסרגל
 c.fillStyle='#222';c.font='700 13px Arial';c.fillText('N',W-28,22);c.beginPath();c.moveTo(W-28,26);c.lineTo(W-33,40);c.lineTo(W-23,40);c.fill();
 const km=100,px=km/111*MV.z*COSL;c.fillStyle='#222';c.fillRect(16,H-26,px,3);c.font='11px Arial';c.textAlign='left';c.fillText(km+' ק״מ',16,H-32);c.textAlign='center'}
function pickCity(x,y){let b=null,bd=11;for(const k of CITIES){if(!cityOn(k,curPer)||!k._p)continue;const d=Math.hypot(k._p[0]-x,k._p[1]-y);if(d<bd&&(MV.z>=34||k[5]>=(MV.z<15?3:2))){bd=d;b=k}}return b}
function fitView(lon,lat,span){MV.lon=lon;MV.lat=lat;MV.z=MC.width/(span*COSL);drawMapCanvas()}
function mapInfo(){const P=PERIODS[curPer];$('mpT').textContent=P.n+' · '+P.yr;$('mpJ').textContent='בארץ: '+P.jud;$('mpD').textContent=P.txt;$('mpM').textContent='בית המקדש: '+P.tem;
 $('mpL').innerHTML=EMP[curPer].map(e=>`<span><i style="background:${e[1]}"></i>${e[0]}</span>`).join('');
 const k=selC;$('mpC').style.display=k?'block':'none';if(k)$('mpC').innerHTML=`<b>${k[0]}</b> · ${k[4]>=70?'':'עד '+Math.abs(k[4])+' לפנה״ס'}<br>${k[7]||''}`}
function mapRefresh(){document.querySelectorAll('#mper button').forEach((b,i)=>b.classList.toggle('on',i==curPer));mapInfo();if(mapOpen)drawMapCanvas()}
function sizeMap(){const r=MC.parentElement.getBoundingClientRect();MC.width=Math.max(300,r.width);MC.height=Math.max(260,r.height);drawMapCanvas()}
function openMap(on){mapOpen=on;$('mapov').style.display=on?'flex':'none';if(on){sizeMap();if(!openMap.once){openMap.once=1;fitView(33,36,46)}mapRefresh()}}
// בקרה: גרירה, גלגלת, לחיצה
MC.addEventListener('pointerdown',e=>{mdrag={x:e.offsetX,y:e.offsetY,lon:MV.lon,lat:MV.lat,m:0};MC.setPointerCapture(e.pointerId)});
MC.addEventListener('pointermove',e=>{if(mdrag){const dx=e.offsetX-mdrag.x,dy=e.offsetY-mdrag.y;if(Math.abs(dx)+Math.abs(dy)>4)mdrag.m=1;MV.lon=mdrag.lon-dx/(MV.z*COSL);MV.lat=mdrag.lat+dy/MV.z;drawMapCanvas()}
 else{const k=pickCity(e.offsetX,e.offsetY);if(k!==hovC){hovC=k;MC.style.cursor=k?'pointer':'grab';drawMapCanvas()}}});
MC.addEventListener('pointerup',e=>{if(mdrag&&!mdrag.m){selC=pickCity(e.offsetX,e.offsetY);mapInfo();drawMapCanvas()}mdrag=null});
MC.addEventListener('wheel',e=>{e.preventDefault();const b=s2m(e.offsetX,e.offsetY);MV.z=Math.max(6,Math.min(900,MV.z*(e.deltaY<0?1.2:1/1.2)));const a=s2m(e.offsetX,e.offsetY);MV.lon+=b[0]-a[0];MV.lat+=b[1]-a[1];drawMapCanvas()},{passive:false});
addEventListener('resize',()=>{if(mapOpen)sizeMap()});
// כפתורי תקופה ושכבות
PERIODS.forEach((p,i)=>{const b=document.createElement('button');b.innerHTML=`<b>${p.n}</b><small>${p.yr}</small>`;b.onclick=()=>setPeriod(i);$('mper').appendChild(b)});
$('mapC').onchange=e=>{MS2.c=e.target.checked;drawMapCanvas()};$('mapE').onchange=e=>{MS2.e=e.target.checked;drawMapCanvas()};$('mapL').onchange=e=>{MS2.l=e.target.checked;drawMapCanvas()};
$('zAll').onclick=()=>fitView(33,36,46);$('zIl').onclick=()=>fitView(35.2,32.2,3.4);$('zGr').onclick=()=>fitView(17,40.5,26);$('zEg').onclick=()=>fitView(36,31,32);
$('bMap').onclick=()=>openMap(true);$('mapX').onclick=()=>openMap(false);$('perChip').onclick=()=>openMap(true);
$('mapTo3d').onclick=()=>{openMap(false);setPeriod(curPer)};
