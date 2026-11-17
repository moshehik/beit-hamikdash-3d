/* tools/snap-inject.js – מוזרק ע"י tools/render-snapshots.mjs serve בסוף הדף (לא חלק מהמוצר).
   מרנדר מהדגם התלת־ממדי: מבט־על אורתוגרפי של ירושלים לכל תקופה, תמונה לכל מקום ברשימת P, מבט־על של הר הבית עם תוויות,
   ובודק: לא ריק/שחור, המצלמה והתקופה תואמות למה שנרשם, נקודות ציון (מזבח, היכל, חומת ההר) מול הנתונים. שולח הכול לשרת. */
(function(){
if(!/[?&]snap=1/.test(location.search))return;
const Q=new URLSearchParams(location.search),CFG={jer:[+(Q.get('jx')||-250),+(Q.get('jz')||150),+(Q.get('jh')||800)],only:Q.get('only')||''};
const log=m=>{try{fetch('/log',{method:'POST',body:String(m)})}catch(e){}};
const post=(name,blob)=>fetch('/save?name='+name,{method:'POST',body:blob});
const MAN={generated:new Date().toISOString(),tool:'tools/render-snapshots.mjs',time:11,images:[],checks:[],notes:[]};
const toBlob=(c,q)=>new Promise(r=>c.toBlob(r,'image/jpeg',q));
const r2=v=>Math.round(v*100)/100;
(async()=>{try{
 await new Promise(r=>setTimeout(r,1500));
 const L=$('landing');if(L)L.style.display='none';
 const ad=$('autoDay');if(ad&&ad.checked){ad.checked=false;ad.dispatchEvent(new Event('change'))}
 $('tm').value=11;setTime(11);$('card').style.display='none';
 renderer.setPixelRatio(1);
 const fog0=scene.fog;
 const cvs=renderer.domElement,out=document.createElement('canvas'),ox=out.getContext('2d');ox.imageSmoothingQuality='high';
 const names=g=>Object.keys(GRP).filter(k=>GRP[k]===g)[0];
 const visPG=()=>PGS.filter(g=>g.visible).map(names).sort();
 /* מצלמת מבט־על אורתוגרפית: צפון למעלה (z שלילי), מזרח ימינה */
 const ortho=(cx,cz,halfH,asp)=>{const hw=halfH*asp,o=new T.OrthographicCamera(-hw,hw,halfH,-halfH,1,7000);o.position.set(cx,3000,cz);o.up.set(0,0,-1);o.lookAt(cx,0,cz);o.updateMatrixWorld(true);o.updateProjectionMatrix();return o};
 const stats=(w,h)=>{const d=ox.getImageData(0,0,w,h).data,n=w*h;let s=0,s2=0;const bins=new Map();
  for(let i=0;i<d.length;i+=4){const y=.2126*d[i]+.7152*d[i+1]+.0722*d[i+2];s+=y;s2+=y*y;const k=(d[i]>>3)<<10|(d[i+1]>>3)<<5|(d[i+2]>>3);bins.set(k,(bins.get(k)||0)+1)}
  let mx=0;for(const v of bins.values())if(v>mx)mx=v;const m=s/n;return{mean:r2(m),std:r2(Math.sqrt(Math.max(0,s2/n-m*m))),flat:r2(mx/n),colors:bins.size}};
 /* מרנדר, מעתיק לקנבס 2D מוקטן (סינכרוני – לפני שה-WebGL buffer מתנקה), ושולח JPEG */
 async function shoot(key,cam,rw,rh,ow,oh,maxB,meta,after,noFog){
  if(CFG.only&&!key.startsWith(CFG.only))return;
  const hid=[];if(noFog){scene.fog=null;scene.traverse(o=>{if(o.visible&&(o.isSprite||(o.userData&&o.userData.pl))){o.visible=false;hid.push(o)}})}
  renderer.setSize(rw,rh,false);if(cam.isPerspectiveCamera){cam.aspect=rw/rh;cam.updateProjectionMatrix()}
  renderer.shadowMap.needsUpdate=true;renderer.render(scene,cam);renderer.render(scene,cam);
  out.width=ow;out.height=oh;ox.drawImage(cvs,0,0,ow,oh);if(after)after(cam,ox,ow,oh);
  scene.fog=fog0;hid.forEach(o=>o.visible=true);
  const st=stats(ow,oh);let q=.78,b=null;
  for(;q>.3;q-=.06){b=await toBlob(out,q);if(b.size<=maxB)break}
  await post(key,b);
  const rec={key,w:ow,h:oh,q:r2(q),stats:st,period:curPer,periodName:PERIODS[curPer].n,visibleGroups:visPG(),cut:renderer.clippingPlanes.length?$('cut').value+':'+$('cutv').value:'',
   roofs:$('lRoof').checked,camera:cam.isOrthographicCamera?{type:'ortho',pos:cam.position.toArray().map(r2),halfH:r2(cam.top),halfW:r2(cam.right),north:'up'}:{type:'persp',pos:cam.position.toArray().map(r2),fov:cam.fov,target:meta&&meta.tg||null},meta:meta||{}};
  rec.checks={notBlank:st.std>=12&&st.flat<.9,notDark:st.mean>=40&&st.mean<=235,weak:st.flat>.4||st.std<18};
  MAN.images.push(rec);log(key+' '+b.size+'B q'+r2(q)+' mean'+st.mean+' std'+st.std+' flat'+st.flat);return rec}
 /* ---- 1. ירושלים לכל תקופה (אורתוגרפי) ---- */
 for(let i=0;i<PERIODS.length;i++){
  setPeriod(i);const pv=curPer;
  const fit=i>=6?[-400,-40,1550]:[-300,420,1050];
  const o=ortho(fit[0],fit[1],fit[2],1);
  const r=await shoot('r_jer'+i,o,1000,1000,420,420,30000,{kind:'jerusalem',expectPeriod:i,periodName:PERIODS[i].n},null,true);
  const pc=P.find(p=>p[0]=='ירושלים כולה'),oc=new T.PerspectiveCamera(55,1.6,.3,8000);oc.position.set(900,380,-300);oc.lookAt(new T.Vector3(-300,0,250));oc.updateMatrixWorld(true);
  const r2_=await shoot('r_jo'+i,oc,960,600,480,300,30000,{kind:'jerusalem-oblique',expectPeriod:i,periodName:PERIODS[i].n,tg:[-300,0,250]},null,true);
  if(r2_)r2_.checks.periodMatches=(curPer===i);
  if(r){r.checks.periodMatches=(pv===i&&+$('per').value===i);MAN.checks.push({id:'period-state-'+i,desc:'התקופה החיה בדגם תואמת לתמונה',expected:i,actual:pv,pass:pv===i})}}
 /* ---- 2. מקומות ---- */
 setPeriod(5);
 const places=P.filter(p=>p[0]!='sec');
 /* מצלמות חלופיות למקומות שבהם מצלמת הטיסה ב-ui.js (P) נמצאת בתוך קיר/ההיכל (לבדיקת דיוק – ר' README של assets/maps) */
 const OVR={'לשכות העזרה – צפון':[[-30,50,-40],[-115,18,-118]],'לשכות העזרה – דרום':[[60,70,-30],[-100,18,3]],'בית הטבילה והמסיבה':[[-30,45,-70],[-100,18,-115]],'בתוך ההיכל':[[-68,27,ZC],[-120,26,ZC]],'קודש הקדשים':[[-110,27,ZC],[-155,25,ZC]]};
 for(let i=0;i<places.length;i++){
  const p=places[i];goto(p);tw=null;
  const ov=OVR[p[0]],pc3=ov?ov[0]:p[3],pt3=ov?ov[1]:p[4];
  const cam=new T.PerspectiveCamera(55,1.6,.3,8000);cam.position.set(...pc3);cam.lookAt(new T.Vector3(...pt3));cam.updateMatrixWorld(true);
  const r=await shoot('r_p'+i,cam,960,600,480,300,34000,{kind:'place',index:i,name:p[0],tg:pt3,cameraOverride:!!ov,dataCamera:p[3]});
  if(r){r.checks.cameraMatchesData=cam.position.toArray().every((v,j)=>Math.abs(v-pc3[j])<1e-6)}}
 goto(P[1]);tw=null;setPeriod(5);
 /* ---- 3. הר הבית: מבט־על עם תוויות ---- */
 {const o=ortho(0,-20,285,1);
  await shoot('r_mount',o,1000,1000,440,440,42000,{kind:'mount-labeled'},(cam,c,w,h)=>{
   const v=new T.Vector3(),placed=[];c.font='700 12px "Segoe UI",Arial';c.textAlign='center';c.direction='rtl';let n=0;
   const cand=LBL.filter(l=>l.big&&vis(GRP[l.g])&&(l.cat=='mount'||l.cat=='courts'||l.cat=='hek'));
   for(const l of cand){v.set(l.x,l.y,l.z).project(cam);const sx=(v.x*.5+.5)*w,sy=(-v.y*.5+.5)*h;if(sx<10||sx>w-10||sy<10||sy>h-10)continue;
    const t=l.el.textContent,tw_=c.measureText(t).width+8,x=sx-tw_/2,y=sy-8;if(placed.some(q=>x<q[2]&&x+tw_>q[0]&&y<q[3]&&y+16>q[1]))continue;placed.push([x,y,x+tw_,y+16]);
    c.fillStyle='rgba(10,16,30,.78)';c.fillRect(x,y,tw_,16);c.fillStyle='#ffe29a';c.fillText(t,sx,y+12);c.fillStyle='#ff5252';c.beginPath();c.arc(sx,sy+9,2.2,0,6.3);c.fill();n++}
   MAN.notes.push('mount: '+n+' labels drawn (big labels only)')},true)}
 /* ---- 4. נקודות ציון: נתונים מול הדגם (קרן כלפי מטה על הסצנה) ---- */
 {setPeriod(5);goto(P[1]);tw=null;scene.updateMatrixWorld(true);
  const rc2=new T.Raycaster();rc2.far=6000;
  const lst=[];scene.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh&&!o.isSprite&&vis(o))lst.push(o)});
  const down=(x,z)=>{rc2.set(new T.Vector3(x,3000,z),new T.Vector3(0,-1,0));let h=[];try{h=rc2.intersectObjects(lst,false).filter(k=>k.point.y<260)}catch(e){log('ray '+e.message)}return h.length?h[0]:null};
  const chk=(id,desc,expected,actual,pass,note)=>MAN.checks.push({id,desc,expected,actual,pass:!!pass,note:note||''});
  let h=down(-26,-43);chk('altar-height','גובה פסגת המזבח מעל רצפת העזרה (מידות ג:א: כ־10 אמות עם הקרנות)','8..13 אמות',h?r2(h.point.y-YA):null,h&&h.point.y-YA>=8&&h.point.y-YA<=13,'נקודת הנתונים: (-26,-43) – מרכז המזבח (ui.js, P)');
  h=down(-114,ZC);chk('hekhal-height','גובה גג ההיכל מעל רצפת העזרה (מידות ד:ו: 100 אמה; המודל מוסיף כרכוב/מעקה)','88..112 אמות',h?r2(h.point.y-YA):null,h&&h.point.y-YA>=88&&h.point.y-YA<=112,'(-114,'+ZC+') מרכז ההיכל');
  const under=(o,g)=>{for(;o;o=o.parent)if(o===g)return true;return false};
  const edge=(z,dir)=>{let first=null;for(let x=dir*330;Math.abs(x)>=170;x-=dir*1){const k=down(x,z);if(k&&k.point.y>YA&&under(k.object,GRP.mount)){first=x;break}}return first};
  for(const z of [-150,-120]){const e=edge(z,1),w=edge(z,-1);
   chk('mount-east-'+z,'קיר הר הבית המזרחי (חצי מ־500 אמה)','250±8 (x)',e,e!=null&&Math.abs(e-250)<=8,'סריקת קרניים לאורך z='+z);
   chk('mount-west-'+z,'קיר הר הבית המערבי','-250±8 (x)',w,w!=null&&Math.abs(w+250)<=8,'סריקת קרניים לאורך z='+z)}
  /* נתונים: ירושלים */
  const jer=CITIES.find(c=>c[0]=='ירושלים'),ks=KSITES.find(s=>s[0]=='ירושלים');
  chk('geo-jerusalem-map','מפת האזור: ירושלים מול הר הבית (31.778N,35.235E)','Δ≤0.06°',jer?[jer[1],jer[2]]:null,jer&&Math.abs(jer[1]-35.235)<.06&&Math.abs(jer[2]-31.778)<.06,'geodata CITIES');
  chk('geo-jerusalem-kids','מפת הילדים: ירושלים מול הר הבית','Δ≤0.06°',ks?[ks[1],ks[2]]:null,ks&&Math.abs(ks[1]-35.235)<.06&&Math.abs(ks[2]-31.778)<.06,'kids KSITES');
  for(let i=0;i<PERIODS.length;i++){const yy=PERIODS[i].y,pr=PR[i];chk('geo-period-'+i,'שנת הייחוס של התקופה בתוך טווח התקופה (PR)',pr[0]+'..'+pr[1],yy,yy>=pr[0]&&yy<=pr[1],PERIODS[i].n);
   chk('geo-emp-'+i,'יש מעצמות/ערים בנתוני התקופה','>0',EMP[i].length+' מעצמות / '+CITIES.filter(c=>cityOn(c,i)).length+' ערים',EMP[i].length>0&&CITIES.filter(c=>cityOn(c,i)).length>0)}}
 MAN.summary={images:MAN.images.length,checks:MAN.checks.length,failed:MAN.checks.filter(c=>!c.pass).map(c=>c.id),weak:MAN.images.filter(i=>i.checks.weak).map(i=>i.key),badImages:MAN.images.filter(i=>!i.checks.notBlank||!i.checks.notDark||i.checks.periodMatches===false||i.checks.cameraMatchesData===false).map(i=>i.key)};
 await fetch('/manifest',{method:'POST',body:JSON.stringify(MAN)});log('DONE '+JSON.stringify(MAN.summary));
}catch(e){log('ERROR '+e.message+' '+(e.stack||'').slice(0,400))}})();
})();
