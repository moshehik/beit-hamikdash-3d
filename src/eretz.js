/* ---------- ארץ ישראל בתלת־ממד בימי בית שני (ERETZ) ----------
   מודל שטח של כל הארץ (יהודה, שומרון, הגליל, הגולן, עבר הירדן, השפלה, השרון, הנגב, ים המלח) מנתוני גובה אמיתיים (SRTM) + צבעוניות לפי אקלים + נהרות, דרכים וערים.
   קנה המידה: כמו src/world3d.js (קולנועי, לא קנה המידה של דגם המקדש): מעלה אחת = 1000 יחידות, ירושלים (35.2E, 31.8N) = הראשית; x=(lon-35.2)*1000, z=-(lat-31.8)*1000. יחידה ≈ 111 ק״מ/1000.
   גובה: y=(מ'−740)*EY+YOFF (הגזמה ×5.5) – ירושלים מתחת למודל המקומי כדי לא להצטלב איתו.
   הנתונים (מפת גבהים PNG + מרקם WebP, יוצרו ע"י tools/make-eretz.py) נמצאים ב-src/eretz_data.js: נטענים עצלנית (ERETZ.load()) – לא נכללים בטעינה הראשונית.
   ה-API (לסיורים): ERETZ.show({fly}) / hide({restore}) / on / loaded / load() / pos(lat,lon) -> {x,y,z} / elev(lat,lon) מ' / kmUnit / place(id) / places / camAt(id,height,tiltDeg,azDeg) / flyTo(id,opt)
   כשהמודל מוצג והמצלמה גבוהה (>CUTY) המודל המקומי של ירושלים מוסתר (הסולמות שונים פי 222). מקורות והערכות: docs/land-israel.md. */
const ERETZ=(()=>{
 const K=1000,J=[35.2,31.8],EY=.055,YOFF=-250,CUTY=1800,kmUnit=K/111;
 const wx=lon=>(lon-J[0])*K,wz=lat=>-(lat-J[1])*K;
 /* id, שם, lat, lon, סוג, דרגה (1 תמיד, 2 קרוב, 3 קרוב מאוד), ודאות (s = מקורות, e = משוער), הערה קצרה */
 const PL=[
  ['jerusalem','ירושלים',31.7785,35.2345,'temple',1,'s','בית המקדש'],['olives','הר המשחה',31.7785,35.2455,'mount',3,'s','משם מדליקים משואות'],
  ['bethlehem','בית לחם',31.704,35.2,'city',3,'s'],['herodium','הרודיון',31.6657,35.2413,'fortress',2,'s','מבצר וקבר הורדוס'],['hebron','חברון',31.5326,35.0998,'city',2,'s'],
  ['betar','ביתר',31.7167,35.1167,'fortress',3,'e','מרד בר כוכבא (אחרי החורבן)'],['tekoa','תקוע',31.6347,35.2294,'city',3,'s'],
  ['jericho','יריחו (הורדוס)',31.8686,35.4411,'palm',2,'s','ארמונות החשמונאים והורדוס, בקעת הדקלים'],['qumran','קומראן',31.7417,35.4589,'city',3,'s'],
  ['masada','מצדה',31.3156,35.3542,'fortress',2,'s'],['engedi','עין גדי',31.4614,35.3892,'palm',3,'s'],['machaerus','מכוור',31.5683,35.6372,'fortress',3,'s','עבר הירדן – מבצר הורדוס'],
  ['sdom','סדום (ים המלח הדרומי)',31.05,35.42,'label',3,'e'],['beersheba','באר שבע',31.2518,34.7913,'city',3,'s'],['arad','ערד',31.2833,35.1275,'city',3,'s'],
  ['mamshit','ממפסיס',31.0258,35.0678,'city',3,'s','נבטים'],['avdat','עבדת',30.7936,34.7683,'city',3,'s','נבטים'],['petra','פטרה',30.3285,35.4444,'city',3,'s','בירת הנבטים'],
  ['eleutheropolis','בית גוברין',31.6089,34.8914,'city',3,'s'],['gaza','עזה',31.5222,34.4528,'city',2,'s'],['ashkelon','אשקלון',31.6688,34.5743,'city',2,'s'],
  ['yavne','יבנה',31.8786,34.7431,'city',2,'s','בית דינו של רבן יוחנן בן זכאי (אחרי החורבן)'],['jaffa','יפו',32.0536,34.7522,'city',2,'s'],['lod','לוד',31.9519,34.8955,'city',2,'s'],
  ['emmaus','עמאוס',31.8394,34.9906,'city',3,'s'],['antipatris','אנטיפטריס',32.1058,34.9275,'city',3,'s'],['caesarea','קיסריה',32.4986,34.8929,'harbor',1,'s','נמל סבסטוס של הורדוס'],
  ['dor','דור',32.6128,34.9161,'city',3,'s'],['akko','עכו (תלמאיס)',32.9186,35.0711,'city',2,'s'],['tyre','צור',33.2733,35.1939,'city',2,'s'],
  ['sebaste','שומרון (סבסטי)',32.2778,35.1925,'city',2,'s'],['shechem','שכם',32.2136,35.2831,'city',3,'s'],['gerizim','הר גרזים',32.2,35.27,'mount',3,'s','מקדש השומרונים'],
  ['sartaba','סרטבא',32.0925,35.4283,'mount',2,'e','תחנת משואות; מבצר אלכסנדריון – מיקום משוער'],
  ['grofina','גרופינא',32.36,35.82,'mount',3,'e','תחנת משואות; הזיהוי והמיקום משוערים בלבד'],
  ['hauran','חורן',32.78,36.45,'mount',3,'e','תחנת משואות; מיקום משוער'],['beitbaltin','בית בלתין',33.0,36.95,'mount',3,'e','תחנת משואות; הכיוון בלבד, המקום המדויק לא ידוע'],
  ['beitshean','בית שאן (סקיתופוליס)',32.5016,35.5024,'city',1,'s'],['gilboa','הר הגלבוע',32.4667,35.3927,'mount',3,'s'],['tabor','הר תבור',32.6866,35.3908,'mount',3,'s'],
  ['carmel','הר הכרמל',32.7332,35.0431,'mount',2,'s'],['sepphoris','ציפורי',32.7536,35.2797,'city',2,'s'],['tiberias','טבריה',32.7922,35.5312,'city',1,'s'],
  ['magdala','מגדלא',32.8256,35.5,'city',3,'s'],['capernaum','כפר נחום',32.8803,35.575,'city',3,'s'],['gamla','גמלא',32.8944,35.7511,'fortress',3,'s'],
  ['hazor','חצור',33.0178,35.5681,'city',3,'s'],['meron','מירון',32.9876,35.4398,'mount',3,'s'],['banias','פנייס (קיסריה פיליפי)',33.2483,35.6942,'city',2,'s'],
  ['hermon','הר חרמון',33.4161,35.857,'mount',2,'s'],['gadara','גדרה',32.6567,35.6833,'city',3,'s'],['pella','פלה',32.4492,35.6175,'city',3,'s'],
  ['gerasa','גרשה (ג׳רש)',32.2814,35.8914,'city',3,'s'],['philadelphia','פילדלפיה (עמון)',31.9539,35.9106,'city',2,'s'],['heshbon','חשבון',31.8,35.8,'city',3,'s'],
  ['nebo','הר נבו',31.7678,35.7256,'mount',3,'s']];
 const RG=[['yehuda','יהודה',31.62,35.02],['shomron','שומרון',32.34,35.1],['galil_t','גליל תחתון',32.78,35.3],['galil_e','גליל עליון',33.04,35.42],['golan','גולן (גולנין)',32.98,35.8],['perea','עבר הירדן (פרעיה)',32.1,35.88],['edom','אדום (אידומיאה)',31.38,35.02],['negev','הנגב',30.7,34.95],['sharon','השרון',32.3,34.9],['shfela','השפלה',31.72,34.85],['pleshet','פלשת',31.6,34.58],['nabatea','נבטיה',30.55,35.75],['moav','מואב',31.45,35.8],['decapolis','עשר הערים',32.5,35.95],['yam','הים הגדול',32.2,34.1],['yamhamelach','ים המלח',31.45,35.47],['kineret','ים כנרת',32.83,35.59],['yarden','הירדן',32.35,35.55],['hula','אגם החולה',33.07,35.6]];
 const byId={};PL.forEach(r=>{byId[r[0]]={id:r[0],he:r[1],lat:r[2],lon:r[3],kind:r[4],rank:r[5],conf:r[6]=='s'?'sourced':'estimated',note:r[7]||''}});
 let D=null,H=null,hw=0,hh=0,box=null,loadP=null,built=false,on=false,hiddenLocal=false,saved=null,G=null,mesh=null,labels=[],marks=[],panel=null,showNames=true,etw=null,lastNF='',fog0=null,locVis=[];
 const $$=id=>document.getElementById(id);
 /* ----- גובה / מיקום ----- */
 function elev(lat,lon){if(!H)return 0;const u=(lon-box[0])/(box[1]-box[0])*(hw-1),v=(box[3]-lat)/(box[3]-box[2])*(hh-1);if(u<0||v<0||u>hw-1||v>hh-1)return 0;
  const i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,i1=Math.min(hw-1,i+1),j1=Math.min(hh-1,j+1);
  return (H[j*hw+i]*(1-fu)+H[j*hw+i1]*fu)*(1-fv)+(H[j1*hw+i]*(1-fu)+H[j1*hw+i1]*fu)*fv}
 const yOf=m=>(m-740)*EY+YOFF;
 function pos(lat,lon){return{x:wx(lon),y:H?yOf(elev(lat,lon)):YOFF,z:wz(lat)}}
 function place(id){const p=byId[id];if(!p)return null;const q=pos(p.lat,p.lon);return Object.assign({},p,q)}
 /* מצלמה מעל מקום: height = גובה המצלמה מעל הקרקע (יחידות; 1000 ≈ 111 ק״מ), tilt = זווית מבט מהאנך (0 = מלמעלה, 70 = כמעט אופקי), az = כיוון המצלמה (0 = מדרום לצפון) */
 function camAt(id,height,tilt,az){const p=typeof id=='string'?place(id):id;if(!p)return null;height=height||600;tilt=tilt==null?35:tilt;az=(az||0)*Math.PI/180;const d=height*Math.tan(tilt*Math.PI/180);
  return{pos:[p.x+Math.sin(az)*d,p.y+height,p.z+Math.cos(az)*d],tgt:[p.x,p.y,p.z]}}
 /* ----- תוויות ----- */
 function label(lines,opt){opt=opt||{};const c=document.createElement('canvas'),x=c.getContext('2d'),fs=opt.fs||56,pad=22;
  x.font='800 '+fs+'px Heebo,Arial,sans-serif';let w=0;lines.forEach((l,i)=>{x.font=(i?'600 ':'800 ')+(i?fs*.6:fs)+'px Heebo,Arial,sans-serif';w=Math.max(w,x.measureText(l).width)});
  const lh=fs*1.25,h=lh+(lines.length-1)*fs*.75;c.width=Math.ceil(w+pad*2);c.height=Math.ceil(h+pad*1.1);
  const W=c.width,Hh=c.height,r=22;x.fillStyle=opt.bg||'rgba(40,28,10,.8)';x.beginPath();x.moveTo(r,0);x.arcTo(W,0,W,Hh,r);x.arcTo(W,Hh,0,Hh,r);x.arcTo(0,Hh,0,0,r);x.arcTo(0,0,W,0,r);x.fill();
  x.strokeStyle=opt.border||'#e8c068';x.lineWidth=3;x.stroke();x.direction='rtl';x.textAlign='center';x.textBaseline='middle';
  lines.forEach((l,i)=>{x.font=(i?'600 ':'800 ')+(i?fs*.6:fs)+'px Heebo,Arial,sans-serif';x.fillStyle=i?'#f1e4c4':(opt.color||'#ffe9a8');x.fillText(l,W/2,i?pad*.55+lh+(i-1)*fs*.75+fs*.3:pad*.55+lh/2)});
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false,fog:false}));s.userData.ar=c.width/c.height;s.renderOrder=30;return s}
 const stoneM=()=>new THREE.MeshBasicMaterial({color:0xfff1d0,fog:false}),darkM=()=>new THREE.MeshBasicMaterial({color:0x8d7447,fog:false});
 function marker(p){const g=new THREE.Group(),b=(w,h,d,x,z,m)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m||stoneM());o.position.set(x,h/2,z);g.add(o);return o};
  switch(p.kind){
   case'temple':{const gm=new THREE.MeshBasicMaterial({color:0xffd45a,fog:false});b(2.6,1.4,2.6,0,0,stoneM());b(1.5,2.4,1.5,0,0,gm).position.y=1.6;const bm=new THREE.Mesh(new THREE.CylinderGeometry(.35,.35,30,10,1,true),new THREE.MeshBasicMaterial({color:0xffd45a,transparent:true,opacity:.5,fog:false,depthWrite:false}));bm.position.y=15;g.add(bm);
    for(let i=0;i<9;i++){const a=i*.7;b(.8,.8,.8,Math.cos(a)*2.6,Math.sin(a)*2.6)}break}
   case'city':for(let i=0;i<(p.rank<3?7:4);i++){const a=i*2.3;b(.9,.7+((i*7)%3)*.3,.9,Math.cos(a)*(.4+i*.3),Math.sin(a)*(.4+i*.3))}break;
   case'fortress':{const m=new THREE.Mesh(new THREE.CylinderGeometry(.9,1.6,1.6,14),darkM());m.position.y=.8;g.add(m);b(1.5,.6,1.5,0,0,stoneM()).position.y=1.9;break}
   case'palm':for(let i=0;i<6;i++){const a=i*1.1,r=.4+(i%3)*.5,t=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,1.5,5),darkM());t.position.set(Math.cos(a)*r,.75,Math.sin(a)*r);g.add(t);const c=new THREE.Mesh(new THREE.ConeGeometry(.5,.6,6),new THREE.MeshBasicMaterial({color:0x3f8f3a,fog:false}));c.position.set(Math.cos(a)*r,1.7,Math.sin(a)*r);g.add(c)}b(1.2,.5,1.2,0,0);break;
   case'harbor':{const m=new THREE.MeshBasicMaterial({color:0xcfc3a4,fog:false});[[-.9,.35],[.9,-.35]].forEach(([s,e])=>{const t=new THREE.Mesh(new THREE.TorusGeometry(2.2,.28,6,18,Math.PI*.85),m);t.rotation.x=-Math.PI/2;t.rotation.z=e>0?Math.PI*.65:-Math.PI*.5;t.position.set(-3.2,.2,s*1.2);g.add(t)});b(1,.8,1,0,0);b(.5,1.6,.5,-3.5,0);break}
   case'mount':{const m=new THREE.Mesh(new THREE.ConeGeometry(.9,1.5,8),new THREE.MeshBasicMaterial({color:0x7f8f55,fog:false}));m.position.y=.75;g.add(m);break}
   default:return null}
  return g}
 /* ----- בנייה ----- */
 function build(){if(built||!D)return;built=true;
  G=new THREE.Group();G.name='eretz';G.visible=false;
  const gw=Math.max(2,Math.floor(hw/1)),gh=Math.max(2,Math.floor(hh/1));
  const tb=D.tbox||box,pos_=new Float32Array(hw*hh*3),uv=new Float32Array(hw*hh*2);
  for(let j=0;j<hh;j++)for(let i=0;i<hw;i++){const k=j*hw+i,lon=box[0]+(box[1]-box[0])*i/(hw-1),lat=box[3]-(box[3]-box[2])*j/(hh-1);pos_[k*3]=wx(lon);pos_[k*3+1]=yOf(H[k]);pos_[k*3+2]=wz(lat);uv[k*2]=(lon-tb[0])/(tb[1]-tb[0]);uv[k*2+1]=(lat-tb[2])/(tb[3]-tb[2])}
  const idx=new Uint32Array((hw-1)*(hh-1)*6);let n=0;for(let j=0;j<hh-1;j++)for(let i=0;i<hw-1;i++){const a=j*hw+i,b=a+1,c=a+hw,d=c+1;idx[n++]=a;idx[n++]=c;idx[n++]=b;idx[n++]=b;idx[n++]=c;idx[n++]=d}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos_,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setIndex(new THREE.BufferAttribute(idx,1));g.computeBoundingSphere();
  const mat=new THREE.MeshBasicMaterial({color:0x8a8a7a,fog:false});mesh=new THREE.Mesh(g,mat);mesh.frustumCulled=false;G.add(mesh);
  if(D.tex){const im=new Image();im.onload=()=>{const t=new THREE.Texture(im);t.encoding=THREE.sRGBEncoding;t.anisotropy=8;t.needsUpdate=true;mat.map=t;mat.color.set(0xffffff);mat.needsUpdate=true};im.src=URL.createObjectURL(new Blob([b64(D.tex)],{type:'image/webp'}))}
  PL.forEach(r=>{const p=place(r[0]);const m=marker(p);if(m){m.position.set(p.x,p.y,p.z);m.userData.p=p;G.add(m);marks.push(m)}
   if(p.kind=='label'&&0)return;const s=label([p.he].concat(p.conf=='estimated'?['משוער']:[]),{fs:p.rank==1?64:52,color:p.conf=='estimated'?'#ffd0a0':null,bg:p.rank==1?'rgba(60,40,10,.88)':null});s.userData.p=p;s.userData.big=p.rank==1;s.userData.rank=p.rank;s.userData.off=(p.rank==1?2.6:2);s.position.set(p.x,p.y+4,p.z);G.add(s);labels.push(s)});
  RG.forEach(r=>{const y0=pos(r[2],r[3]),s=label([r[1]],{fs:84,color:'#fff4cf',bg:'rgba(20,40,60,.0)',border:'rgba(0,0,0,0)'});s.userData.region=1;s.userData.ar2=1;s.userData.big=1;s.position.set(y0.x,y0.y+30,y0.z);G.add(s);labels.push(s)});
  scene.add(G);ui();if(on&&panel)panel.style.display='block'}
 function b64(s){const a=atob(s),u=new Uint8Array(a.length);for(let i=0;i<a.length;i++)u[i]=a.charCodeAt(i);return u}
 /* ----- טעינה עצלנית ----- */
 function decodeData(){return new Promise((res,rej)=>{if(H)return res();const d=D=window.ERETZ_DATA;if(!d)return rej(new Error('no data'));box=d.box;hw=d.hw;hh=d.hh;
  const im=new Image();im.onload=()=>{try{const c=document.createElement('canvas');c.width=hw;c.height=hh;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(im,0,0);const px=x.getImageData(0,0,hw,hh).data;H=new Float32Array(hw*hh);for(let k=0;k<hw*hh;k++)H[k]=(px[k*4]*256+px[k*4+1])/16-600;res()}catch(e){rej(e)}};im.onerror=()=>rej(new Error('height png'));
  im.src=URL.createObjectURL(new Blob([b64(d.h)],{type:'image/png'}))})}
 function load(){if(loadP)return loadP;loadP=new Promise((res,rej)=>{const go=()=>decodeData().then(()=>{build();res(true)},rej);
   if(window.ERETZ_DATA)return go();const src=window.ERETZ_SRC;if(!src)return rej(new Error('ERETZ data not bundled'));
   const s=document.createElement('script');s.src=src;s.onload=go;s.onerror=()=>rej(new Error('ERETZ data failed to load'));document.head.appendChild(s)});
  loadP.catch(e=>{loadP=null;console.error('ERETZ',e);note('לא הצלחנו לטעון את מפת הארץ – נסו שוב')});return loadP}
 /* ----- הצגה / הסתרה ----- */
 function localHide(h){if(h===hiddenLocal)return;hiddenLocal=h;
  if(h){locVis=[];scene.children.forEach(o=>{if(o===G||o.isLight||o.name=='worldCine'||o.name=='risRoute')return;if(o.visible){locVis.push(o);o.visible=false}})}
  else{locVis.forEach(o=>{o.visible=true});locVis=[]}}
 function fly(p,t,dur){try{tw=null}catch(e){}etw={t:0,dur:Math.max(.3,dur||2.6),p0:camera.position.clone(),t0:controls.target.clone(),p1:new THREE.Vector3(p[0],p[1],p[2]),t1:new THREE.Vector3(t[0],t[1],t[2])};controls.enabled=false}
 function flyTo(id,o){o=o||{};const c=camAt(id,o.height||700,o.tilt==null?38:o.tilt,o.az||0);if(c)fly(c.pos,c.tgt,o.dur)}
 function show(o){o=o||{};if(typeof walk!='undefined'&&walk&&typeof setWalk=='function')setWalk(false);if(!on){saved={p:camera.position.clone(),t:controls.target.clone(),max:controls.maxDistance}}on=true;
  if(!built){note('טוענים את מפת הארץ…');load().then(()=>{note('');if(on&&o.fly!==false)flyTo('jerusalem',{height:2600,tilt:42,dur:3.2})},()=>{on=false})}
  else if(o.fly!==false)flyTo('jerusalem',{height:2600,tilt:42,dur:3.2});
  if(panel)panel.style.display='block';const b=$$('bEretz');if(b)b.classList.add('on')}
 function hide(o){o=o||{};on=false;etw=null;controls.enabled=true;localHide(false);if(G)G.visible=false;if(panel)panel.style.display='none';
  if(saved&&o.restore!==false){camera.position.copy(saved.p);controls.target.copy(saved.t);controls.update()}
  camera.near=.3;camera.far=8000;camera.updateProjectionMatrix();lastNF='';if(scene.fog&&fog0){scene.fog.near=fog0[0];scene.fog.far=fog0[1]}controls.maxDistance=6500;
  const b=$$('bEretz');if(b)b.classList.remove('on')}
 function note(t){let d=$$('ertzNote');if(!d){d=document.createElement('div');d.id='ertzNote';d.style.cssText='position:fixed;left:50%;top:84px;transform:translateX(-50%);z-index:46;background:rgba(40,28,10,.9);color:#f6e6bd;border:1px solid #e8c068;border-radius:14px;padding:8px 18px;font:600 15px system-ui,sans-serif;direction:rtl;display:none';document.body.appendChild(d)}d.textContent=t;d.style.display=t?'block':'none'}
 /* ----- חלונית ושליטה ----- */
 function ui(){if(panel)return;panel=document.createElement('div');panel.id='ertzP';panel.style.cssText='position:fixed;left:12px;top:285px;z-index:46;display:none;background:rgba(14,22,38,.86);color:#f6e6bd;border:1px solid #c9a24a;border-radius:14px;padding:10px 12px;font:600 13px system-ui,sans-serif;direction:rtl;max-width:230px';
  const sel=PL.filter(r=>r[4]!='label').map(r=>'<option value="'+r[0]+'">'+r[1]+'</option>').join('');
  panel.innerHTML='<div style="font-size:15px;color:#ffe9a8;margin-bottom:6px">🗺️ ארץ ישראל בימי בית שני</div><select id="ertzSel" style="width:100%;margin-bottom:6px;font:inherit;padding:3px;background:#1d2a40;color:#f6e6bd;border:1px solid #6b5a30;border-radius:6px"><option value="">קפצו אל מקום…</option>'+sel+'</select>'
   +'<div style="display:flex;gap:6px;flex-wrap:wrap"><button id="ertzAll" class="alt">כל הארץ</button><button id="ertzNames" class="alt">שמות ✓</button><button id="ertzBack">🕍 חזרה לדגם</button></div><div style="font-size:11px;opacity:.75;margin-top:6px">קנה המידה קולנועי והגבהים מוגזמים פי 5.5. ערים ושטחים מסומנים "משוער" אינם מדויקים.</div>';
  document.body.appendChild(panel);
  $$('ertzSel').onchange=e=>{if(e.target.value){flyTo(e.target.value,{height:600,tilt:38});e.target.value=''}};
  $$('ertzAll').onclick=()=>flyTo('jerusalem',{height:3400,tilt:30,dur:2.4});
  $$('ertzNames').onclick=()=>{showNames=!showNames;$$('ertzNames').textContent=showNames?'שמות ✓':'שמות'};
  $$('ertzBack').onclick=()=>hide({restore:true});
  const mb=$$('bMap');if(mb&&!$$('bEretz')){const b=document.createElement('button');b.id='bEretz';b.textContent='🗺️ ארץ ישראל בתלת־ממד';b.style.cssText='background:linear-gradient(90deg,#4f9a5a,#e8c068);color:#1b1405';b.onclick=()=>on?hide({restore:true}):show();mb.after(b)}}
 /* כפתור הכניסה נוצר מיד (לפני הטעינה העצלנית) */
 function earlyBtn(){const mb=$$('bMap');if(mb&&!$$('bEretz')){const b=document.createElement('button');b.id='bEretz';b.textContent='🗺️ ארץ ישראל בתלת־ממד';b.style.cssText='background:linear-gradient(90deg,#4f9a5a,#e8c068);color:#1b1405';b.onclick=()=>on?hide({restore:true}):show();mb.after(b)}}
 try{earlyBtn()}catch(e){}
 /* ----- כל פריים ----- */
 let tL=performance.now();
 function frame(){requestAnimationFrame(frame);const now=performance.now(),dt=Math.min(.1,(now-tL)/1000);tL=now;if(!on||!built)return;
  const y=camera.position.y;
  if(etw){etw.t+=dt;const k=Math.min(1,etw.t/etw.dur),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;camera.position.lerpVectors(etw.p0,etw.p1,e);controls.target.lerpVectors(etw.t0,etw.t1,e);controls.update();if(k>=1){etw=null;controls.enabled=true}}
  G.visible=true;localHide(!(y<CUTY&&Math.hypot(controls.target.x,controls.target.z)<150));   /* המודל המקומי (פי 222 גדול יותר) מוצג רק כשהמצלמה נמוכה וממוקדת בירושלים עצמה */
  if(controls.maxDistance<160000)controls.maxDistance=160000;
  const nf=(y>CUTY*.6)?(Math.max(.3,y*.004)+'|'+Math.max(8000,Math.min(260000,y*10))):'.3|8000';
  if(nf!==lastNF){lastNF=nf;const p=nf.split('|');camera.near=+p[0];camera.far=+p[1];camera.updateProjectionMatrix()}
  if(scene.fog){if(!fog0)fog0=[scene.fog.near,scene.fog.far];if(y>CUTY*.6){scene.fog.near=y*5;scene.fog.far=y*22}else{scene.fog.near=fog0[0];scene.fog.far=fog0[1]}}
  labels.forEach(s=>{const u=s.userData,p=s.position,d=camera.position.distanceTo(p);let vis=showNames;
   if(u.region){vis=vis&&d>1300;const h=d*.026;s.scale.set(h*u.ar,h,1);s.material.opacity=d>2600?.8:Math.max(0,(d-1300)/1300*.8);s.visible=vis;return}
   if(u.rank>1&&d>(u.rank==2?2400:1100))vis=false;
   const h=Math.max(d*.02*(u.big?1.15:1),.9);s.scale.set(h*u.ar,h,1);s.visible=vis});
  marks.forEach(m=>{const d=camera.position.distanceTo(m.position),k=Math.max(1.4,Math.min(36,d*.008));m.scale.setScalar(k)})}
 requestAnimationFrame(frame);
 return{show,hide,load,place,pos,elev,camAt,flyTo,kmUnit,K,J,EY,YOFF,places:Object.values(byId),regions:RG.map(r=>({id:r[0],he:r[1],lat:r[2],lon:r[3]})),get on(){return on},get loaded(){return built},get hiddenLocal(){return hiddenLocal}}})();
