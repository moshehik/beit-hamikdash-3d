/* ---------- אנשים "אמיתיים" (22.11.2026) – תמונות אנשים צילומיות מ-Gemini (אורקל) במקום הדמויות הסגנוניות בקהל ----------
 איך זה עובד: ההמון (crowd.js) נבנה ממופעים (InstancedMesh: robe+head) לכל אוכלוסייה (man/woman/kohen/levi/sage/sit). כשהמתג "אנשים אמיתיים" דולק,
 לכל בריכה מתווסף InstancedMesh של מרובעים מוטי־מצלמה (בילבורד גלילי, ציר Y) שחולק את אותה instanceMatrix – כלומר אותו מיקום/כיוון/קנה מידה של כל דמות, בלי לגעת
 בלוגיקת התנועה. הצללן בוחר לכל דמות תא מתוך אטלס (קדמי/אחורי לפי הכיוון שבו הדמות פונה ביחס למצלמה), היפוך שמאל־ימין ושונות צבע קלה כדי שלא ייראו שכפולים.
 הנתונים (אטלסי WebP, base64 גולמי – בלי data: בגלל נטפרי) נטענים עצל רק בלחיצה על המתג: window.REAL_PEOPLE (מוטמע בבנייה עם REAL=1) או fetch של window.REAL_PEOPLE_URL (באתר החי).
 כל כשל (רשת/פענוח/מסנן) => חוזרים בשקט לדמויות הסגנוניות. ברירת מחדל: דלוק (22.11, ביקשה משה; הכיבוי נזכר ב-localStorage realPplOff). כלי הפקה: tools/gen-people.mjs → tools/pack-people.py → assets/people/people.json. תיעוד: docs/real-people.md */
const REALP=(()=>{
 const T=THREE,$=id=>document.getElementById(id);
 const LIST=[];let on=false,data=null,loading=false,failed=false,texs={},loop=0,chip=null;
 const B64=b=>{const s=atob(b),a=new Uint8Array(s.length);for(let i=0;i<s.length;i++)a[i]=s.charCodeAt(i);return a};
 function say(t,ms){if(!chip){chip=document.createElement('div');chip.style.cssText='position:fixed;left:50%;bottom:70px;transform:translateX(-50%);z-index:60;background:rgba(0,0,0,.78);color:#fff;border-radius:12px;padding:7px 14px;font:14px system-ui,sans-serif;direction:rtl;transition:opacity .3s;pointer-events:none';document.body.appendChild(chip)}
  chip.textContent=t;chip.style.opacity=1;clearTimeout(say.t);if(ms)say.t=setTimeout(()=>{chip.style.opacity=0},ms)}
 /* ---- טעינה ---- */
 function decode(d){   // d = {cellH, kinds:{kind:{view:{w,h,cells,b64}}}} -> טקסטורות
  const jobs=[];
  for(const k in d.kinds)for(const v in d.kinds[k]){const e=d.kinds[k][v];
   jobs.push(new Promise((ok,no)=>{const url=URL.createObjectURL(new Blob([B64(e.b64)],{type:'image/webp'})),im=new Image();
    im.onload=()=>{if(im.naturalWidth<8)return no(new Error('blocked image '+k+v));const t=new T.Texture(im);t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;t.generateMipmaps=true;t.anisotropy=4;t.needsUpdate=true;(texs[k]=texs[k]||{})[v]=t;URL.revokeObjectURL(url);ok()};
    im.onerror=()=>no(new Error('decode '+k+v));im.src=url}))}
  return Promise.all(jobs)}
 function load(){
  if(data)return Promise.resolve();if(loading)return loading;
  loading=Promise.resolve().then(()=>{
   if(window.REAL_PEOPLE)return window.REAL_PEOPLE;
   if(window.REAL_PEOPLE_URL)return fetch(window.REAL_PEOPLE_URL,{credentials:'same-origin'}).then(r=>{if(!r.ok)throw new Error('http '+r.status);
    if(!window.REAL_PEOPLE_GZ)return r.json();   /* אתר חי: בייטים אטומים (gzip, octet-stream) – מסנני נטפרי/אתרוג לא נוגעים בהם */
    if(typeof DecompressionStream=='undefined')throw new Error('no DecompressionStream');
    return r.arrayBuffer().then(b=>new Response(new Blob([b]).stream().pipeThrough(new DecompressionStream('gzip'))).text()).then(t=>JSON.parse(t))});
   throw new Error('no data source')}).then(d=>decode(d).then(()=>{data=d})).catch(e=>{failed=true;console.warn('REALP load failed',e&&e.message);loading=false;throw e});
  return loading}
 /* ---- חומר ---- */
 const VS=`attribute vec2 corner;attribute vec4 aF;attribute vec4 aB;attribute vec4 aS;attribute vec4 aV;   // aF/aB/aS: מלבן התא באטלס (קדמי/אחורי/פרופיל); aV: x=היפוך(±1) yzw=גוון
  uniform vec2 sF,sB,sS;uniform float uH,uCellH,uSide;varying vec2 vUv;varying vec3 vTint;varying float vBk;
  #include <fog_pars_vertex>
  void main(){mat4 M=instanceMatrix;vec3 c=M[3].xyz;float sy=length(M[1].xyz);
   if(sy<1e-4){gl_Position=vec4(2.,2.,2.,1.);vUv=vec2(0.);vTint=vec3(1.);vBk=0.;return;}
   vec2 f=normalize(M[2].xz+vec2(1e-6));vec2 v=normalize(cameraPosition.xz-c.xz+vec2(1e-5));
   vec3 right=vec3(v.y,0.,-v.x);float d=dot(f,v),sd=dot(f,right.xz);   // d>0: הדמות פונה למצלמה; sd>0: פונה לימין המסך
   float bk=d<-.5?1.:0.;if(uSide>.5&&abs(d)<=.5)bk=2.;else if(d<0.)bk=1.;   // 0 קדמי, 1 אחורי, 2 פרופיל (פונה ימינה בתמונה)
   vec4 r=bk>1.5?aS:(bk>.5?aB:aF);vec2 sz=bk>1.5?sS:(bk>.5?sB:sF);
   float h=uH*sy*(r.w/uCellH),w=h*(r.z/r.w);
   vec3 pos=c+right*(corner.x-.5)*w+vec3(0.,corner.y*h,0.);
   float u=bk>1.5?(sd>0.?corner.x:1.-corner.x):(aV.x>0.?corner.x:1.-corner.x);
   vUv=vec2((r.x+u*r.z)/sz.x,1.-(r.y+(1.-corner.y)*r.w)/sz.y);vTint=aV.yzw;vBk=bk;
   vec4 mvPosition=viewMatrix*vec4(pos,1.);gl_Position=projectionMatrix*mvPosition;
   #include <fog_vertex>
  }`;
 const FS=`uniform sampler2D tF,tB,tS;uniform vec3 uLight;varying vec2 vUv;varying vec3 vTint;varying float vBk;
  #include <common>
  #include <fog_pars_fragment>
  void main(){vec4 c=vBk>1.5?texture2D(tS,vUv):(vBk>.5?texture2D(tB,vUv):texture2D(tF,vUv));if(c.a<.42)discard;
   vec3 rgb=pow(c.rgb,vec3(2.2))*vTint*uLight;gl_FragColor=vec4(rgb,1.);
   #include <tonemapping_fragment>
   #include <encodings_fragment>
   #include <fog_fragment>
  }`;
 const quad=(()=>{const g=new T.InstancedBufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(12),3));g.setAttribute('corner',new T.BufferAttribute(new Float32Array([0,0,1,0,1,1,0,1]),2));g.setIndex([0,1,2,0,2,3]);return g})();
 const mats={};
 function material(kind){if(mats[kind])return mats[kind];const t=texs[kind],d=data.kinds[kind];
  const u=T.UniformsUtils.merge([T.UniformsLib.fog]);   // merge() CLONES texture uniforms (clone => version 0 => never uploaded), so the textures are assigned after it
  Object.assign(u,{tF:{value:t.front},tB:{value:(t.back||t.front)},tS:{value:(t.side||t.front)},uSide:{value:t.side?1:0},sS:{value:new T.Vector2((d.side||d.front).w,(d.side||d.front).h)},sF:{value:new T.Vector2(d.front.w,d.front.h)},sB:{value:new T.Vector2((d.back||d.front).w,(d.back||d.front).h)},uH:{value:1.8},uCellH:{value:data.cellH},uLight:{value:new T.Vector3(1,1,1)}});
  return mats[kind]=new T.ShaderMaterial({uniforms:u,vertexShader:VS,fragmentShader:FS,fog:true,side:T.DoubleSide})}
 const heightOf=kind=>{try{const g=CROWD.buildCrowdGeometry(kind);let m=0;[g.robe,g.head].forEach(x=>{x.computeBoundingBox();m=Math.max(m,x.boundingBox.max.y)});return m||1.8}catch(e){return 1.8}};
 let seed=1;const rnd=()=>(seed=seed*16807%2147483647)/2147483647;
 function build(P){
  if(P.real||!data||!data.kinds[P.kind]||!texs[P.kind])return;
  const d=data.kinds[P.kind],F=d.front,K=d.back||d.front,SD=d.side||d.front,cap=P.cap;
  const aF=new Float32Array(cap*4),aB=new Float32Array(cap*4),aS=new Float32Array(cap*4),aV=new Float32Array(cap*4);seed=cap*31+P.kind.length*7;
  for(let i=0;i<cap;i++){const f=F.cells[(rnd()*F.cells.length)|0],b=K.cells[(rnd()*K.cells.length)|0];
   const sd=SD.cells[(rnd()*SD.cells.length)|0];aF.set(f.slice(0,4),i*4);aB.set(b.slice(0,4),i*4);aS.set(sd.slice(0,4),i*4);const s=.9+rnd()*.2;aV.set([rnd()<.5?1:-1,s*(.96+rnd()*.08),s*(.96+rnd()*.08),s*(.96+rnd()*.08)],i*4)}
  const g=quad.clone();g.setAttribute('aF',new T.InstancedBufferAttribute(aF,4));g.setAttribute('aB',new T.InstancedBufferAttribute(aB,4));g.setAttribute('aS',new T.InstancedBufferAttribute(aS,4));g.setAttribute('aV',new T.InstancedBufferAttribute(aV,4));
  const mat=material(P.kind);mat.uniforms.uH.value=heightOf(P.kind)*1.03;
  const m=new T.InstancedMesh(g,mat,cap);m.instanceMatrix=P.robe.instanceMatrix;m.frustumCulled=false;m.castShadow=false;m.count=P.robe.count;
  (P.robe.parent||scene).add(m);P.real=m}
 function light(){let r=1,g=1,b=1;try{const hi=hemi.intensity,hc=hemi.color,si=sun.intensity,sc=sun.color;r=hc.r*hi*.9+sc.r*si*.42;g=hc.g*hi*.9+sc.g*si*.42;b=hc.b*hi*.9+sc.b*si*.42}catch(e){}
  const k=1.55;for(const kind in mats)mats[kind].uniforms.uLight.value.set(Math.max(.06,r*k),Math.max(.06,g*k),Math.max(.07,b*k))}
 function apply(){for(const P of LIST){if(on){build(P);if(P.real){P.real.visible=true;P.robe.visible=P.head.visible=false}}else{if(P.real)P.real.visible=false;P.robe.visible=P.head.visible=true}}}
 function tick(){if(!on){loop=0;return}loop=requestAnimationFrame(tick);for(const P of LIST){if(P.real&&P.real.visible){P.real.count=P.robe.count;if(!P.robe.visible===false){}}}light()}
 /* ---- ממשק ---- */
 function set(v){
  if(v){say('טוען אנשים אמיתיים…');
   load().then(()=>{on=true;apply();say('אנשים אמיתיים',1500);if(!loop)loop=requestAnimationFrame(tick)}).catch(()=>{on=false;const cb=$('realPpl');if(cb)cb.checked=false;say('לא הצלחתי לטעון את תמונות האנשים – נשארים הדמויות הרגילות',4000)})}
  else{on=false;apply();say('דמויות רגילות',1200)}}
 function ui(){if(!(window.REAL_PEOPLE||window.REAL_PEOPLE_URL)||(typeof LITE!='undefined'&&LITE))return;const row=$('dayType')&&$('dayType').closest('.row');if(!row||$('realPpl'))return;
  const d=document.createElement('div');d.className='row';d.innerHTML='<label style="cursor:pointer"><input type="checkbox" id="realPpl"> אנשים "אמיתיים" (תמונות)</label><div style="font-size:11px;color:var(--mut)">תמונות אנשים צילומיות מ-AI במקום הדמויות המצוירות</div>';row.after(d);const cb=$('realPpl');let off=0;try{off=localStorage.getItem('realPplOff')=='1'}catch(e){}
  cb.onchange=e=>{set(e.target.checked);try{localStorage.setItem('realPplOff',e.target.checked?'0':'1')}catch(x){}};
  if(!off){cb.checked=true;const go=()=>setTimeout(()=>{if(cb.checked&&!on)set(true)},2500);if(document.readyState=='complete')go();else addEventListener('load',go)}}   /* 22.11: דלוק כברירת מחדל (ביקשה משה); אם כיבו – זוכר בדפדפן */
 if(document.readyState!='loading')setTimeout(ui,0);else addEventListener('DOMContentLoaded',()=>setTimeout(ui,0));
 return{attach(P,kind){P.kind=kind;LIST.push(P);if(on&&data){build(P);if(P.real){P.real.visible=true;P.robe.visible=P.head.visible=false}}},set,get on(){return on},get ready(){return !!data},get failed(){return failed},list:LIST,load,ui}
})();
