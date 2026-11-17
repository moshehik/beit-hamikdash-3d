const NQ_MARK=/[֑-ֽֿׁׂׄ-ׇ]/,NQ_MARKS=/[֑-ֽֿׁׂׄ-ׇ]/g,NQ_HEB=/[א-ת]/;
const NQ_BODY=/[א-תA-Za-z0-9][\s\S]*[א-תA-Za-z0-9֑-ֽֿׁׂׄ-ׇ׳״]|[א-תA-Za-z0-9]/;
let NQ_IX=null,NQ_VOTE=null;const NQ_CACHE=new Map();
function nqCore(t){const m=NQ_BODY.exec(t);if(!m)return{l:t,b:'',v:'',r:''};const b=m[0];return{l:t.slice(0,m.index),v:b,b:b.replace(NQ_MARKS,''),r:t.slice(m.index+b.length)}}
function nqBuild(){NQ_IX=Object.create(null);NQ_VOTE=Object.create(null);
 for(const k in NQ_MAP){const pt=k.split(' '),vt=NQ_MAP[k].split(' ');if(pt.length!==vt.length)continue;
  const pc=pt.map(nqCore),vc=vt.map(nqCore),e={pc,vc};
  for(let i=0;i<pc.length;i++){const w=pc[i].b;if(!w||!NQ_HEB.test(w))continue;(NQ_IX[w]||(NQ_IX[w]=[])).push([e,i]);const o=NQ_VOTE[w]||(NQ_VOTE[w]={});o[vc[i].v]=(o[vc[i].v]||0)+1}}}
/* nq(s): ניקוד לטקסט תצוגה. התאמה מלאה למפתח במפה; אחרת כיסוי חמדני ברצפי מילים ידועים (כולל קידומת של משפט, "…", מספרים באמצע); מילה בודדת – רק אם כל ההופעות שלה במפה מנוקדות באותה צורה */
function nq(s){
 if(typeof s!=='string'||!s||!NQ_HEB.test(s)||NQ_MARK.test(s))return s;
 const k=s.replace(/\s+/g,' ').trim(),h=NQ_MAP[k];
 if(h!==undefined&&k===s.trim())return s.slice(0,s.length-s.trimStart().length)+h+s.slice(s.trimEnd().length);
 let c=NQ_CACHE.get(s);if(c!==undefined)return c;
 if(!NQ_IX)nqBuild();
 const parts=s.split(/(\s+)/),idx=[];for(let i=0;i<parts.length;i+=2)if(parts[i])idx.push(i);
 const tc=idx.map(i=>nqCore(parts[i]));let changed=false;
 for(let a=0;a<tc.length;){const w=tc[a].b;let best=null,bl=0;
  if(w&&NQ_HEB.test(w)){const cand=NQ_IX[w];if(cand)for(const [e,pos] of cand){let n=1;while(a+n<tc.length&&pos+n<e.pc.length&&tc[a+n].b===e.pc[pos+n].b)n++;if(n>bl){bl=n;best=[e,pos]}}}
  if(bl>=2){for(let n=0;n<bl;n++){const t=tc[a+n],v=best[0].vc[best[1]+n];parts[idx[a+n]]=t.l+v.v+t.r}changed=true;a+=bl;continue}
  if(bl===1){const o=NQ_VOTE[w],ks=Object.keys(o);let tot=0,top=0,tk='';for(const x of ks){tot+=o[x];if(o[x]>top){top=o[x];tk=x}}
   if(top/tot>=.8){const t=tc[a];parts[idx[a]]=t.l+tk+t.r;changed=true}}
  a++}
 c=changed?parts.join('').normalize('NFC'):s;if(NQ_CACHE.size>3000)NQ_CACHE.clear();NQ_CACHE.set(s,c);return c}
/* הלוגיקה (בדיקות regex על textContent וכד') עובדת על הטקסט הפשוט: הקריאה מ-textContent/innerText מחזירה בלי סימני ניקוד (הכתיבה ללא שינוי) */
(function(){try{
 for(const [P,n] of [[Node.prototype,'textContent'],[HTMLElement.prototype,'innerText']]){
  const d=Object.getOwnPropertyDescriptor(P,n);if(!d||!d.get||!d.set)continue;
  Object.defineProperty(P,n,{configurable:true,enumerable:d.enumerable,set:d.set,get(){const v=d.get.call(this);return(typeof v==='string'&&v.length&&NQ_MARK.test(v))?v.replace(NQ_MARKS,''):v}})}
}catch(e){}})();
