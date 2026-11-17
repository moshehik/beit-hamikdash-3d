/* ממשק ילדים (18.11.2026): מינימום מלל, כפתורי תמונה גדולים, כל פעולה מוסברת בסמל + 2–3 מילים.
   ברירת מחדל: מצב ילדים. הכפתור ⚙️ מחזיר את כל הפאנלים (מצב מבוגרים). נטען אחרי ui.js. */
(()=>{
const $=id=>document.getElementById(id),LS={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:v}catch(e){return d}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
let adult=LS.get('bh_adult','0')==='1';
const body=document.body;

/* ---------- תגית פעולה לכל שלב בסדרי העבודה: סמל + עד 3 מילים ---------- */
const TAG={
 'ketoret':['🎲 פייס לקטורת','🎲 פייס לאברים','🥄 לוקחים את הכף','🔥 גחלים מהמזבח','🔔 קול המגרפה','🧹 מוציאים אפר','🔥 גחלים על מזבח הזהב','💨 מפזרים קטורת','🌫️ מקטירים!','🕯️ נרות אחרונים','🥄 מראים את הכלים','🙌 ברכת כהנים'],
 'menorah':['🕯️ נכנסים להיכל','🧽 מנקים נרות','🕯️ חמישה נרות','🕯️ שני נרות אחרונים','🌇 מדליקים את המנורה'],
 'minchat-solet':['🌾 מביאים סלת','🥣 מערבבים שמן','🏺 בכלי שרת','🔥 מגישים למזבח','✋ קומצים','🔥 על המזבח','🍞 הכהנים אוכלים'],
 'olat-behema':['🐑 מביאים כבש','✋ סמיכה','🔪 שחיטה','🩸 זריקת דם','🩸 מתנה שנייה','🪝 מפשיטים','✂️ מחלקים נתחים','🧂 מולחים','⬆️ עולים למזבח','🔥 על האש','⬇️ יורדים'],
 'tamid-shachar':['🎲 פייס בחושך','🔑 פותחים את העזרה','💧 מקדשים ידיים','🔥 חותים גחלים','⬇️ ערימת גחלים','🏃 רצים לעבודה','🧹 מסדרים אברים','⛰️ תפוח הדשן','🪵 בונים מערכה','🔥 מדליקים אש','🎲 פייס שני','🌅 רואים את השחר','🐑 מביאים טלה','🚶 לבית המטבחיים','🗝️ פותחים היכל','🎺 תקיעות והשער','🚪 נכנסים לעזרה','🔪 שחיטה','🩸 זריקת דם','🧹 דישון מזבח הזהב','🕯️ מטיבים נרות','🪝 מפשיטים','🧼 שוטפים קרביים','🧍 כל כהן נושא נתח','🙏 קריאת שמע','🎲 עוד פייס','🔥 על האש ונסכים','✅ סיום התמיד'],
 'olat-haof':['🕊️ מביאים עוף','⬆️ עולים בכבש','↪️ הולכים בסובב','🤏 מליקה','🩸 ממצים את הדם','🔥 הראש לאש','🪶 זורקים נוצות','🔥 הגוף לאש','🔄 ממשיכים להקיף','⬇️ יורדים']
};

/* ---------- סרגל עליון: כפתורי תמונה ---------- */
const top=document.createElement('div');top.id='ktop';
const mk=(ic,lb,fn,id)=>{const b=document.createElement('button');if(id)b.id=id;b.innerHTML='<i>'+ic+'</i><span>'+lb+'</span>';b.onclick=fn;top.appendChild(b);return b};
mk('🏠','בית',()=>$('bHome').click());
mk('🕎','סיורים',()=>$('bSvc').click());
mk('🚶','ללכת',()=>$('bWalk').click(),'kWalk');
mk('🗺️','מפות',()=>$('bMap').click());
mk('🧒','שבטים',()=>$('bKids').click());
mk('🎵','מוזיקה',()=>$('bMus').click(),'kMus');
mk('⚙️','למבוגרים',()=>setAdult(!adult),'kAdult');
body.appendChild(top);

/* ---------- שעון היום: שמש ← → ירח ---------- */
const kt=document.createElement('div');kt.id='ktime';kt.innerHTML='<span>☀️</span><input type="range" min="0" max="24" step="0.1" aria-label="שעה ביום"><span>🌙</span>';body.appendChild(kt);
const kr=kt.querySelector('input');let drag=false;
kr.oninput=()=>{drag=true;const a=$('autoDay');if(a&&a.checked){a.checked=false;a.dispatchEvent(new Event('change'))}$('tm').value=kr.value;$('tm').dispatchEvent(new Event('input'))};
kr.onchange=()=>{drag=false};
setInterval(()=>{if(!drag&&$('tm'))kr.value=$('tm').value},700);

/* ---------- מעגן מקומות: תמונה + מילה ---------- */
const dock=document.createElement('div');dock.id='kdock';
const PL=[['🕍','הר הבית','מבט על'],['🔥','המזבח','המזבח והכבשים'],['💧','הכיור','הכיור'],['✨','ההיכל','ההיכל מצד מערב'],['🕎','בתוך ההיכל','בתוך ההיכל'],['📦','קודש הקדשים','קודש הקדשים'],['🧔','הכהנים','כהן וכהן גדול'],['🏙️','ירושלים','ירושלים כולה']];
let cur=null;
PL.forEach(([ic,lb,pf])=>{const p=P.find(x=>x[0]!='sec'&&x[0].indexOf(pf)==0);if(!p)return;
 const b=document.createElement('button');b.innerHTML='<i>'+ic+'</i><span>'+lb+'</span>';
 b.onclick=()=>{if(cur)cur.classList.remove('on');cur=b;b.classList.add('on');goto(p)};dock.appendChild(b)});
body.appendChild(dock);

/* ---------- כרטיס מידע קצר + "עוד" ---------- */
const card=$('card'),more=document.createElement('button');more.id='kmore';more.textContent='📖 עוד';card.appendChild(more);
const short=d=>{d=(d||'').replace(/\s+/g,' ').trim();let s=d.split(/(?<=[.!?])\s/)[0]||d;if(s.length>105){const c=s.slice(0,105),i=Math.max(c.lastIndexOf(', '),c.lastIndexOf(' – '),c.lastIndexOf(': '));s=(i>40?c.slice(0,i):c.replace(/\s\S*$/,''))+'…'}return s};
const _showCard=window.showCard;
window.showCard=function(t,d,s){_showCard(t,d,s);if(adult)return;card.dataset.full=d;card.dataset.src=$('cS').textContent;$('cD').textContent=short(d);$('cS').style.display='none';card.classList.remove('open');more.style.display=(short(d)===d.trim()?'none':'inline-block');more.textContent='📖 עוד'};
more.onclick=()=>{const o=card.classList.toggle('open');$('cD').textContent=o?card.dataset.full:short(card.dataset.full);$('cS').style.display=o?'block':'none';more.textContent=o?'🔼 פחות':'📖 עוד'};

/* ---------- כתוביות הסיור: תגית פעולה + משפט אחד + "עוד" ---------- */
const capT=$('svCapT'),capN=$('svCapN');let capBusy=false;
if(capT){
 const cap=$('svCap'),mb=document.createElement('button');mb.id='kcapmore';mb.textContent='📖 עוד';cap.appendChild(mb);
 const render=()=>{
  const S=SV&&SV.S;if(!S||adult)return;const full=capT.dataset.full||'',tag=(TAG[S.sc.id]||[])[S.idx]||'';
  const open=cap.classList.contains('kopen');
  capBusy=true;capT.innerHTML='';
  if(tag){const h=document.createElement('div');h.className='ktag';h.textContent=tag;capT.appendChild(h)}
  const p=document.createElement('div');p.className='ktx';p.textContent=open?full:short(full);capT.appendChild(p);
  capBusy=false;
  mb.style.display=(short(full)===full.trim())?'none':'inline-block';mb.textContent=open?'🔼 פחות':'📖 עוד';
  const n=$('svCapN');if(n&&S)n.textContent=(S.idx+1)+' / '+S.sc.steps.length;
  const cs=$('svCapS');if(cs)cs.style.display=open?'block':'none'};
 const obsT=new MutationObserver(()=>{if(capBusy||adult)return;if(capT.querySelector('.ktag,.ktx')){obsT.takeRecords();return}capT.dataset.full=capT.textContent;cap.classList.remove('kopen');render();obsT.takeRecords()});obsT.observe(capT,{childList:true,characterData:true,subtree:true});
 mb.onclick=()=>{cap.classList.toggle('kopen');render()};
 new MutationObserver(()=>{if(!adult&&capN&&!capBusy){const S=SV&&SV.S;if(S&&/^שלב/.test(capN.textContent))capN.textContent=(S.idx+1)+' / '+S.sc.steps.length}}).observe(capN,{childList:true,characterData:true,subtree:true});
}

/* ---------- מצב ילדים / מבוגרים ---------- */
function setAdult(on){adult=on;LS.set('bh_adult',on?'1':'0');body.classList.toggle('kid',!on);
 const lm=$('lblMode');if(lm){lm.value=on?'smart':'main';lm.dispatchEvent(new Event('change'))}
 const b=$('kAdult');if(b){b.querySelector('span').textContent=on?'לילדים':'למבוגרים';b.querySelector('i').textContent=on?'🧒':'⚙️'}
 const nh=$('ncHint');if(nh)nh.textContent='💬 לחצו על כהן ושאלו אותו';
 if(!on&&card.style.display=='block'){const d=card.dataset.full||$('cD').textContent;if(d)window.showCard($('cT').textContent,d,(card.dataset.src||$('cS').textContent||'').replace(/^מקור: /,''))}}
setAdult(adult);

/* ---------- מה מוצג מתי ---------- */
const busy=()=>{const v=id=>{const e=$(id);return e&&getComputedStyle(e).display!=='none'};const L=$('landing');return (L&&L.style.display!=='none'&&!L.classList.contains('out'))||v('mapov')||v('kidov')||v('about')};
setInterval(()=>{const hide=busy(),sv=$('svc')&&getComputedStyle($('svc')).display!=='none',walk=!!$('lookb')&&getComputedStyle($('lookb')).display!=='none';
 body.classList.toggle('kbusy',hide);body.classList.toggle('ksv',!!sv);body.classList.toggle('kwalk',walk);
 const w=$('kWalk');if(w){w.querySelector('span').textContent=walk?'למעלה':'ללכת';w.querySelector('i').textContent=walk?'🛰️':'🚶'}
 const m=$('kMus'),bm=$('bMus');if(m&&bm){m.classList.toggle('off',/כבוי|הפעל/.test(bm.textContent)&&!/פועלת/.test(bm.textContent))}},300);
})();
