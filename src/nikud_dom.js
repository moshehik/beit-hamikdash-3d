/* ================= ניקוד בזמן ריצה (תצוגה בלבד) – נוצר יחד עם src/nikud_map.js (tools/nikud-ui.cjs) =================
 עובר על כל צמתי הטקסט ב-document.body (וגם title / aria-label / placeholder) ומחליף לפי nq(); MutationObserver מטפל בתוכן שנוסף/השתנה אחר כך.
 הלוגיקה בקוד ממשיכה לעבוד על הטקסט הפשוט: textContent/innerText מחזירים בלי ניקוד (ראו nikud_map.js). */
(function(){
 if(typeof nq!=='function'||typeof document==='undefined'||!document.body)return;
 const HEB=/[א-ת]/,SKIP={SCRIPT:1,STYLE:1,TEXTAREA:1,INPUT:1,NOSCRIPT:1,CANVAS:1},ATTRS=['title','aria-label','placeholder'],done=new WeakMap();
 const skipEl=el=>!!SKIP[el.nodeName]||(el.closest&&!!el.closest('[data-nonq]'));
 function fixText(n){const v=n.nodeValue;if(!v||!HEB.test(v)||done.get(n)===v)return;const par=n.parentNode;if(!par||(par.nodeType===1&&skipEl(par)))return;
  const r=nq(v);if(r!==v){n.nodeValue=r;done.set(n,r)}else done.set(n,v)}
 function fixAttrs(el){if(!el.getAttribute||skipEl(el))return;for(const a of ATTRS){const v=el.getAttribute(a);if(v&&HEB.test(v)){const r=nq(v);if(r!==v)el.setAttribute(a,r)}}}
 function walk(root){
  if(root.nodeType===3){fixText(root);return}
  if(root.nodeType!==1&&root.nodeType!==9&&root.nodeType!==11)return;
  if(root.nodeType===1){if(skipEl(root))return;fixAttrs(root)}
  const tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT,{acceptNode:n=>n.nodeType===3?NodeFilter.FILTER_ACCEPT:(SKIP[n.nodeName]?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_SKIP)});
  let n;while((n=tw.nextNode())){if(n.nodeType===3)fixText(n)}
  if(root.querySelectorAll)root.querySelectorAll('[title],[aria-label],[placeholder]').forEach(fixAttrs)}
 const obs=new MutationObserver(recs=>{for(const r of recs){
  if(r.type==='characterData')fixText(r.target);
  else if(r.type==='attributes')fixAttrs(r.target);
  else for(const n of r.addedNodes)if(n.isConnected!==false)walk(n)}});
 walk(document.body);
 obs.observe(document.body,{childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:ATTRS});
 window.nqWalk=walk;   // לשימוש ידני (ובדיקות)
})();
