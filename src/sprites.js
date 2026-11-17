/* ================= ספרייטים ריאליסטיים (פיילוט) – דמויות/בעלי חיים שנוצרו במנוע Gemini מצילום הדגם =================
 הקבצים ב-assets/*.png (רקע שקוף) נארזים ע"י tools/pack-sprites.cjs ל-src/sprites_data.js (const SPR). כאן: טקסטורות, לוחות שפונים למצלמה (סביב ציר Y בלבד),
 ומתג "דמויות ריאליסטיות" (checkbox בלוח הבקרה, localStorage 'bh_real', ברירת מחדל כבוי). כשהמתג כבוי – שום דבר בדגם לא משתנה.
 API: SPRITE.make(שם,{h:גובה_באמות,w?,face:true})  -> THREE.Mesh (לוח, מעוגן בתחתיתו; face:true = פונה למצלמה כשקוראים SPRITE.tick)
      SPRITE.on() / SPRITE.set(bool) · SPRITE.tick(S) נקרא מ-services.js:updateActors (פעם בפריים) ומחליף דמות-דגם↔ספרייט לפי המצב:
      כהן/ישראל – רק בעמידה (pose idle, בלי חפץ ביד, בלי כריעה), חזית/גב לפי המצלמה; יונה/תור וכבש – רק בעמידה (לא שכוב/תלוי/מופשט), פרופיל שפונה לכיוון הגוף. */
const SPRITE=(()=>{
 const T=THREE,KEY='bh_real',D=(typeof SPR!=='undefined')?SPR:{};let ON=false;try{ON=localStorage.getItem(KEY)=='1'}catch(e){}
 const texC={},matC={},_c=new T.Vector3(),_l=new T.Vector3();
 function tex(n){if(texC[n])return texC[n];const d=D[n];if(!d)return null;const t=new T.Texture();t.encoding=T.sRGBEncoding;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;
  try{t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy())}catch(e){}
  const im=new Image();im.onload=()=>{t.image=im;t.needsUpdate=true;t._ok=1};im.src=d.u;return texC[n]=t}
 function mat(n){if(matC[n])return matC[n];const t=tex(n);if(!t)return null;return matC[n]=new T.MeshBasicMaterial({map:t,alphaTest:.5,side:T.DoubleSide})}
 /* תיבת-גבול של קבוצה במערכת הצירים שלה עצמה (בלי הטרנספורם של הקבוצה) */
 function localBox(g){g.updateMatrixWorld(true);const inv=new T.Matrix4().copy(g.matrixWorld).invert(),b=new T.Box3(),t=new T.Box3(),m=new T.Matrix4();
  g.traverse(o=>{if(o.isMesh&&o.geometry){if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();t.copy(o.geometry.boundingBox);m.multiplyMatrices(inv,o.matrixWorld);t.applyMatrix4(m);b.union(t)}});return b}
 function make(name,o){o=o||{};const d=D[name],m0=mat(name);if(!d||!m0)return null;const h=o.h||(o.w?o.w*d.h/d.w:1),w=o.w||h*d.w/d.h;
  const geo=new T.PlaneGeometry(w,h);if(!o.center)geo.translate(0,h/2,0);
  const m=new T.Mesh(geo,m0);m.frustumCulled=false;m.castShadow=false;m.receiveShadow=false;m.userData.sp={name,face:!!o.face};
  if(o.face)FACERS.push(m);return m}
 const FACERS=[];
 /* סיבוב סביב Y אל המצלמה (במערכת הצירים של האב); מחזיר dx,dz של המצלמה ביחס ללוח (dz>0 = המצלמה מלפנים, +z = "קדימה" של האב) */
 function aim(m,par){_l.copy(_c);par.worldToLocal(_l);const dx=_l.x-m.position.x,dz=_l.z-m.position.z;m.rotation.y=Math.atan2(dx,dz);return[dx,dz]}
 const ready=m=>!!(m&&m.material.map&&m.material.map._ok);
 const _col=new T.Color();
 function tint(){let t=1;try{t=Math.max(0,Math.min(1,(hemi.intensity-.12)/.6))}catch(e){}
  const b=.22+.9*t;_col.setRGB(1,1,1);try{_col.lerp(sun.color,.45)}catch(e){}
  for(const k in matC)matC[k].color.setRGB(b*_col.r,b*_col.g,b*_col.b)}
 /* ---------- שחקנים (כהן 'k', ישראל 'o') ---------- */
 const ACT={k:['priest','priestb'],o:['layman','laymanb']};
 function actor(A){const pair=ACT[A.spec&&A.spec.kind];if(!pair||!A.var||!A.var.idle)return;
  if(!A.spr){if(!D[pair[0]])return;const h=localBox(A.var.idle).getSize(new T.Vector3()).y||3.4;
   const f=make(pair[0],{h}),b=pair[1]&&D[pair[1]]?make(pair[1],{h}):null;if(!f)return;f.position.y=.02;A.body.add(f);if(b){b.position.y=.02;A.body.add(b)}A.spr={f,b}}
  const S=A.spr,stand=ON&&A.pose=='idle'&&!A.held.R&&!A.held.L&&Math.abs(A.dip||0)<.05&&Math.abs(A.lean||0)<.06&&A.root.visible;
  if(stand){const[dx,dz]=aim(S.f,A.body);S.f.rotation.y=Math.atan2(dx,dz);if(S.b)S.b.rotation.y=S.f.rotation.y;const front=dz>=0||!S.b;
   S.f.visible=front&&ready(S.f);if(S.b)S.b.visible=!front&&ready(S.b);
   const shown=front?S.f.visible:S.b.visible;if(shown){for(const k in A.var)A.var[k].visible=false;A._sprHid=1}
   else if(A._sprHid){A.var[A.pose].visible=true;A._sprHid=0}}
  else{S.f.visible=false;if(S.b)S.b.visible=false;if(A._sprHid){A.var[A.pose].visible=true;A._sprHid=0}}}
 /* ---------- חפצים-בעלי-חיים: יונה, תור, כבש (פרופיל; הראש לכיוון +z של הגוף) ---------- */
 const ITM={dove:'dove',pigeon:'dove',sheep:'sheep'};
 function item(it){const nm=ITM[it.kind];if(!nm||!D[nm])return;const g=it.g,u=g.userData;
  if(!g.userData._spr){const bb=localBox(g),len=bb.max.z-bb.min.z;if(!(len>.05))return;
   const m=make(nm,{w:len*(nm=='sheep'?1.02:1.1)});if(!m)return;m.position.set(0,bb.min.y-(nm=='dove'?.03:0),(bb.max.z+bb.min.z)/2);g.add(m);g.userData._spr=m;g.userData._kids=g.children.filter(c=>c!==m)}
  const m=g.userData._spr,kids=g.userData._kids,ok=ON&&!(u.lay||u.hang||u.skinned)&&ready(m);
  if(ok){const[dx]=aim(m,g);m.scale.x=dx>=0?1:-1;m.visible=true;kids.forEach(c=>c.visible=false);g.userData._hid=1}
  else{m.visible=false;if(g.userData._hid){kids.forEach(c=>c.visible=true);g.userData._hid=0}}}
 function tick(S){try{tick0(S)}catch(e){if(!tick._e){tick._e=1;console.warn('SPRITE',e)}}}
 function tick0(S){if(!S)return;_c.setFromMatrixPosition(camera.matrixWorld);
  if(!ON&&!tick._was)return;tick._was=ON;
  for(const k in S.actors)actor(S.actors[k]);for(const k in S.items)item(S.items[k]);
  FACERS.forEach(m=>{if(m.parent&&m.visible!==false){_l.copy(_c);m.parent.worldToLocal(_l);m.rotation.y=Math.atan2(_l.x-m.position.x,_l.z-m.position.z)}});tint()}
 function set(v){ON=!!v;try{localStorage.setItem(KEY,ON?'1':'0')}catch(e){}const c=document.getElementById('lReal');if(c)c.checked=ON}
 /* מתג בלוח הבקרה (נוצר כאן כדי לא לגעת ב-template.html) */
 try{const ctl=document.getElementById('ctl');if(ctl&&!document.getElementById('lReal')){const lb=document.createElement('label');lb.title='כהן, ישראל, יונה וכבש כתמונות ריאליסטיות (ניסיוני) – מופיעות בסדרי העבודה כשהדמות עומדת';
   lb.innerHTML='<input type="checkbox" id="lReal"> 🎭 דמויות ריאליסטיות (ניסיוני)';const anchor=document.getElementById('lEnv');
   if(anchor&&anchor.parentNode&&anchor.parentNode.tagName=='LABEL')anchor.parentNode.insertAdjacentElement('afterend',lb);else ctl.appendChild(lb);
   const c=lb.querySelector('input');c.checked=ON;c.onchange=()=>set(c.checked)}}catch(e){}
 return{make,on:()=>ON,set,tick,tex,has:n=>!!D[n]}
})();
