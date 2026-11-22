/* ===== EI – איקוני חימר ייעודיים במקום אימוג'י גנריים (20.11.2026) =====
   האיקונים מגיעים מ-src/ui_icons2.js (ICON2, נוצר ע"י tools/pack-icons.py מגיליונות גמיני שנוצרו מרינדורי הדגם – ICONS_RULE.md):
     • EMOJI_ICONS: אימוג'י → מפתח איקון;  ICON_ALIAS: מפתח → מפתח אחר;  tag_<סיור>_<אינדקס> = סמל פעולה מעל הכהן;  svc_<סיור> = איקון הסיור.
   כל אימוג'י שיש לו איקון מוחלף אוטומטית בכל טקסט בדף (MutationObserver) – כך כל המקומות הרבים מכוסים בלי לגעת בכל מחרוזת;
   על canvas (מפות, שבטים) – EI.fill במקום fillText. אימוג'י בלי איקון נשאר כמו שהוא. נטפרי: base64 גולמי בלי data: → Blob → URL.createObjectURL. */
const EI=(()=>{
 const NORM=e=>String(e).replace(/️/g,'');
 const RE=/\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic}️?)*/gu,HAS=/\p{Extended_Pictographic}/u;
 const bu={},ims={};
 const raw=k=>{const a=typeof ICON2!='undefined'&&ICON2[k];if(a)return a;const u=typeof UI_ICONS!='undefined'&&UI_ICONS[k];return u||null};
 const res=k=>{let n=0;while(k&&typeof ICON_ALIAS!='undefined'&&ICON_ALIAS[k]&&n++<4)k=ICON_ALIAS[k];return k};
 function url(key){key=res(key);if(!key)return null;if(key in bu)return bu[key];let u=null;
  try{const d=raw(key);if(d){const i=d.indexOf(','),b=atob(d.slice(i+1)),a=new Uint8Array(b.length);for(let j=0;j<b.length;j++)a[j]=b.charCodeAt(j);u=URL.createObjectURL(new Blob([a],{type:'image/png'}))}}catch(e){u=null}
  return bu[key]=u}
 const keyOf=emo=>{if(typeof EMOJI_ICONS=='undefined')return null;const k=EMOJI_ICONS[NORM(emo)];return k?res(k):null};
 function el(key,cls){const u=url(key);if(!u)return null;const i=new Image();i.className='eico'+(cls?' '+cls:'');i.alt='';i.draggable=false;i.src=u;return i}
 const has=key=>!!url(key);
 /* סמל פעולה של שלב בסיור: איקון ייעודי (tag_<סיור>_<אינדקס>), ואם אין – האימוג'י */
 function setTag(host,tour,idx,fallback){host.textContent='';const i=el('tag_'+tour+'_'+idx,'tag');if(i)host.appendChild(i);else host.textContent=fallback||''}
 /* ----- החלפה אוטומטית בטקסט ----- */
 const SKIP={SCRIPT:1,STYLE:1,TEXTAREA:1,INPUT:1,OPTION:1,SELECT:1,TITLE:1,CANVAS:1,NOSCRIPT:1};
 function fixText(n){const t=n.nodeValue;if(!t||!HAS.test(t))return;const p=n.parentNode;if(!p||SKIP[p.nodeName]||(p.namespaceURI&&p.namespaceURI.indexOf('svg')>0)||(p.closest&&p.closest('[data-noeico]')))return;   /* לא בתוך SVG (השעון העגול): שם נשאר טקסט */
  const frag=document.createDocumentFragment();let last=0,did=false;
  for(const m of t.matchAll(RE)){const k=keyOf(m[0]);if(!k)continue;const u=el(k);if(!u)continue;did=true;if(m.index>last)frag.appendChild(document.createTextNode(t.slice(last,m.index)));frag.appendChild(u);last=m.index+m[0].length}
  if(!did)return;if(last<t.length)frag.appendChild(document.createTextNode(t.slice(last)));p.replaceChild(frag,n)}
 function scan(root){const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),L=[];let n;while((n=w.nextNode()))L.push(n);L.forEach(fixText)}
 const q=new Set();let sched=0;
 const flush=()=>{sched=0;const L=[...q];q.clear();L.forEach(n=>{if(!n.isConnected)return;if(n.nodeType==3)fixText(n);else if(n.nodeType==1)scan(n)})};
 const mo=typeof MutationObserver!='undefined'?new MutationObserver(ms=>{for(const m of ms){if(m.type=='characterData')q.add(m.target);else m.addedNodes.forEach(n=>{if(n.nodeType==1&&n.classList&&n.classList.contains('eico'))return;q.add(n)})}if(!sched){sched=1;requestAnimationFrame(flush)}}):null;
 function start(){try{scan(document.body);if(mo)mo.observe(document.body,{childList:true,subtree:true,characterData:true})}catch(e){}}
 /* ----- canvas ----- */
 function image(key){key=res(key);if(!key)return null;let I=ims[key];if(I)return I.ok?I.i:null;const u=url(key);if(!u)return null;const i=new Image();I=ims[key]={i,ok:false};
  i.onload=()=>{I.ok=true;try{if(typeof kQ=='function')kQ()}catch(e){}try{if(typeof rgQ=='function')rgQ()}catch(e){}};i.src=u;return null}
 /* מצייר איקון במקום fillText(t,x,y): S = גודל בפיקסלים; mid = textBaseline 'middle'. מחזיר true אם צויר איקון */
 function fill(c,t,x,y,S,mid){const k=keyOf(t),I=k&&image(k);if(I){c.drawImage(I,x-S/2,mid?y-S/2:y-S*.86,S,S);return true}c.fillText(t,x,y);return false}
 /* ui_icons2 (ICON2) מגיע כחלק עצל אחרי שהמודל עלה (site/boot.js): מנקים תוצאות null שנשמרו ומחליפים שוב אימוג'י באיקונים */
 function refresh(){try{for(const k in bu)if(bu[k]===null)delete bu[k];if(document.body)scan(document.body)}catch(e){}}
 setTimeout(start,0);
 return{url,el,has,keyOf,setTag,fill,start,scan,refresh}
})();
