/* ממשק ילדים (18.11.2026): מינימום מלל, כפתורי תמונה גדולים, כל פעולה מוסברת בסמל + 2–3 מילים.
   ברירת מחדל: מצב ילדים. הכפתור ⚙️ מחזיר את כל הפאנלים (מצב מבוגרים). נטען אחרי ui.js. */
(()=>{
const $=id=>document.getElementById(id),LS={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:v}catch(e){return d}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
let adult=false;LS.set('bh_adult','0');   /* מצב מבוגרים הוסר לגמרי (18.11.2026, בקשת משה): תמיד ממשק ילדים; הפאנלים הישנים (#side,#ctl,#mini...) נשארים בדף מוסתרים כי הקוד תלוי בהם */
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

/* ---------- איקונים: PNG בסגנון חימר מ-UI_ICONS דרך blob: (נטפרי) עם נפילה לאימוג'י ---------- */
const toBlob=u=>{try{const i=u.indexOf(','),s=atob(u.slice(i+1)),a=new Uint8Array(s.length);for(let j=0;j<s.length;j++)a[j]=s.charCodeAt(j);return URL.createObjectURL(new Blob([a],{type:'image/png'}))}catch(e){return null}};
const _bc={};
const ico=(key,emo)=>{const i=document.createElement('i');i.textContent=emo;
 const u=typeof UI_ICONS!='undefined'&&UI_ICONS[key];
 if(u){const bu=_bc[key]||(_bc[key]=toBlob(u));if(bu){const im=new Image();im.alt='';im.draggable=false;im.onload=()=>{i.textContent='';i.classList.add('pic');i.appendChild(im)};im.src=bu}}
 return i};
window.KTAG=TAG;   /* נגן הסיורים (services.js) משתמש באותן תגיות: סמל ליד הכהן ומסך הסיכום */

/* ---------- סרגל עליון: כפתורי תמונה ---------- */
const top=document.createElement('div');top.id='ktop';
const mk=(key,emo,lb,fn,id)=>{const b=document.createElement('button');if(id)b.id=id;const s=document.createElement('span');s.textContent=lb;b.appendChild(ico(key,emo));b.appendChild(s);b.onclick=fn;top.appendChild(b);return b};
mk('home','🏠','בית',()=>$('bHome').click());
mk('tours','🕎','סיורים',()=>$('bSvc').click());
mk('walk','🚶','ללכת',()=>$('bWalk').click(),'kWalk');
mk('map','🗺️','מפות',()=>$('bMap').click());
mk('kids','🧒','שבטים',()=>$('bKids').click());
mk('music','🎵','מוזיקה',()=>$('bMus').click(),'kMus');
/* ---------- איזה יום? (בחירת סוג היום לפעילות בעזרה; בא במקום הבורר מהפאנל הישן) ---------- */
const DAYS=[['chol','🗓️','יום חול'],['shabbat','🕯️','שבת'],['rc','🌙','ראש חודש'],['erev-pesach','🐑','ערב פסח'],['pesach','🍞','פסח'],['shavuot','🌾','שבועות'],['rh','📯','ראש השנה'],['yk','🤍','יום כיפור'],['sukkot','🌿','סוכות']];
const dayPop=document.createElement('div');dayPop.id='kdays';
DAYS.forEach(([v,e,l])=>{const b=document.createElement('button');b.dataset.v=v;const i=document.createElement('i');i.textContent=e;const s=document.createElement('span');s.textContent=l;b.appendChild(i);b.appendChild(s);
 b.onclick=()=>{const d=$('dayType');if(d){d.value=v;d.dispatchEvent(new Event('change'))}dayPop.classList.remove('on');const kb=$('kDay');if(kb){kb.querySelector('i').textContent=e;kb.querySelector('span').textContent=l}};dayPop.appendChild(b)});
body.appendChild(dayPop);
const dayBtn=mk('','🗓️','יום',()=>dayPop.classList.toggle('on'),'kDay');
body.appendChild(top);

/* ---------- שעון היום: שמש ← → ירח ---------- */
const kt=document.createElement('div');kt.id='ktime';kt.innerHTML='<span>☀️</span><input type="range" min="0" max="24" step="0.1" aria-label="שעה ביום"><span>🌙</span>';body.appendChild(kt);
const kr=kt.querySelector('input');let drag=false;
kr.oninput=()=>{drag=true;const a=$('autoDay');if(a&&a.checked){a.checked=false;a.dispatchEvent(new Event('change'))}$('tm').value=kr.value;$('tm').dispatchEvent(new Event('input'))};
kr.onchange=()=>{drag=false};
setInterval(()=>{if(!drag&&$('tm'))kr.value=$('tm').value},700);

/* ---------- מעגן מקומות: תמונה + מילה ---------- */
const dock=document.createElement('div');dock.id='kdock';
const PL=[['har','🕍','הר הבית','מבט על'],['mizbeach','🔥','המזבח','המזבח והכבשים'],['kiyor','💧','הכיור','הכיור'],['heichal','✨','ההיכל','ההיכל מצד מערב'],['inside','🕎','בתוך ההיכל','בתוך ההיכל'],['kodesh','📦','קודש הקדשים','קודש הקדשים'],['kohanim','🧔','הכהנים','כהן וכהן גדול'],['yerushalayim','🏙️','ירושלים','ירושלים כולה']];
let cur=null;
PL.forEach(([key,ic,lb,pf])=>{const p=P.find(x=>x[0]!='sec'&&x[0].indexOf(pf)==0);if(!p)return;
 const b=document.createElement('button');const sp=document.createElement('span');sp.textContent=lb;b.appendChild(ico(key,ic));b.appendChild(sp);
 b.onclick=()=>{if(cur)cur.classList.remove('on');cur=b;b.classList.add('on');goto(p)};dock.appendChild(b)});

/* ---------- כל המקומות: רשת אריחי תמונה (לחיצה = טיסה למקום) ---------- */
const ALLP=[['מבט על','har','הר הבית'],['הר הבית וחומותיו','p_walls','החומות'],['שערי ההר','p_hulda','שערי חולדה'],['הסטיו המלכותי','p_stoa','הסטיו'],['שער שושן','p_shushan','שער שושן'],
 ['ירושלים כולה','yerushalayim','ירושלים'],['עיר דוד','p_irdavid','עיר דוד'],['העיר העליונה','p_upper','ארמון הורדוס'],['אנטוניה','p_antonia','אנטוניה'],['קשת וילסון','p_wilson','הקשת'],
 ['החיל והסורג','p_chel','החיל'],['עזרת נשים','p_nashim','עזרת נשים'],['שער ניקנור','p_nikanor','שער ניקנור'],['עזרת ישראל','p_yisrael','עזרת ישראל'],['המזבח והכבשים','mizbeach','המזבח'],['בית המטבחיים','p_slaughter','בית המטבחיים'],['הכיור','kiyor','הכיור'],
 ['לשכות העזרה – צפון','p_north','לשכות צפון'],['בית הטבילה','p_mikveh','בית הטבילה'],['המסיבה','p_tunnel','המסיבה'],['לשכות העזרה – דרום','p_south','לשכות דרום'],
 ['כהן וכהן גדול','kohanim','הכהנים'],['האולם','p_ulam','האולם'],['ההיכל מצד מערב','heichal','ההיכל'],['חתך – בתוך ההיכל','p_cutin','חתך ההיכל'],['חתך – תאי הלשכות','p_cutsouth','תאים בדרום'],['חתך – תאי המערב','p_cutwest','תאים במערב'],['בתוך ההיכל','inside','בתוך ההיכל'],['קודש הקדשים','kodesh','קודש הקדשים']];
const pw=document.createElement('div');pw.id='kplaces';pw.innerHTML='<div class="kph"><b>לאן נלך?</b><button id="kpx" aria-label="סגור">✕</button></div><div class="kpg"></div>';body.appendChild(pw);
const pg=pw.querySelector('.kpg');
ALLP.forEach(([pf,key,lb])=>{const p=P.find(x=>x[0]!='sec'&&x[0].indexOf(pf)==0);if(!p)return;
 const b=document.createElement('button'),s=document.createElement('span');s.textContent=lb;b.appendChild(ico(key,'📍'));b.appendChild(s);
 b.onclick=()=>{pw.classList.remove('on');goto(p)};pg.appendChild(b)});
const closeP=()=>pw.classList.remove('on');$('kpx').onclick=closeP;pw.onclick=e=>{if(e.target===pw)closeP()};
{const b=document.createElement('button'),s=document.createElement('span');s.textContent='כל המקומות';const i=document.createElement('i');i.textContent='🧭';b.appendChild(i);b.appendChild(s);b.onclick=()=>pw.classList.add('on');dock.insertBefore(b,dock.firstChild)}
body.appendChild(dock);

/* ---------- כרטיס מידע קצר + "עוד" ---------- */
const card=$('card'),more=document.createElement('button');more.id='kmore';more.textContent='📖 עוד';card.appendChild(more);
const short=d=>{d=(d||'').replace(/\s+/g,' ').trim();let s=d.split(/(?<=[.!?])\s/)[0]||d;if(s.length>105){const c=s.slice(0,105),i=Math.max(c.lastIndexOf(', '),c.lastIndexOf(' – '),c.lastIndexOf(': '));s=(i>40?c.slice(0,i):c.replace(/\s\S*$/,''))+'…'}return s};
const _showCard=window.showCard;
window.showCard=function(t,d,s){_showCard(t,d,s);if(adult)return;card.dataset.full=d;card.dataset.src=$('cS').textContent;$('cD').textContent=short(d);$('cS').style.display='none';card.classList.remove('open');more.style.display=(short(d)===d.trim()?'none':'inline-block');more.textContent='📖 עוד'};
more.onclick=()=>{const o=card.classList.toggle('open');$('cD').textContent=o?card.dataset.full:short(card.dataset.full);$('cS').style.display=o?'block':'none';more.textContent=o?'🔼 פחות':'📖 עוד'};

/* ---------- כתוביות הסיור: תגית פעולה + משפט אחד + "עוד" ---------- */
const capT=$('svCapT'),capN=$('svCapN');let capBusy=false,lastKey=null;
if(capT){
 const cap=$('svCap'),mb=document.createElement('button');mb.id='kcapmore';mb.textContent='📖 עוד';cap.appendChild(mb);
 const render=()=>{
  const S=SV&&SV.S;if(!S||adult)return;const full=capT.dataset.full||'',tag=(TAG[S.sc.id]||[])[S.idx]||'';
  const open=cap.classList.contains('kopen');
  capBusy=true;capT.innerHTML='';
  const sp=tag.indexOf(' '),ic=sp>0?tag.slice(0,sp):'',lb=sp>0?tag.slice(sp+1):tag,key=S.sc.id+'-'+S.idx;
  if(ic){const bd=document.createElement('div');bd.className='kbadge'+(lastKey!==key?' kpop':'');bd.textContent=ic;capT.appendChild(bd)}
  const bx=document.createElement('div');bx.className='kbody';
  if(lb){const h=document.createElement('div');h.className='ktag';h.textContent=lb;bx.appendChild(h)}
  const p=document.createElement('div');p.className='ktx';p.textContent=open?full:short(full);bx.appendChild(p);capT.appendChild(bx);lastKey=key;
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
 const b=$('kAdult');if(b)b.querySelector('span').textContent=on?'לילדים':'למבוגרים';
 const nh=$('ncHint');if(nh)nh.textContent='💬 לחצו על כהן ושאלו אותו';
 if(!on&&card.style.display=='block'){const d=card.dataset.full||$('cD').textContent;if(d)window.showCard($('cT').textContent,d,(card.dataset.src||$('cS').textContent||'').replace(/^מקור: /,''))}}
setAdult(adult);

/* ---------- מה מוצג מתי ---------- */
const busy=()=>{const v=id=>{const e=$(id);return e&&getComputedStyle(e).display!=='none'};const L=$('landing');return (L&&L.style.display!=='none'&&!L.classList.contains('out'))||v('mapov')||v('kidov')||v('about')};
setInterval(()=>{const hide=busy(),sv=$('svc')&&getComputedStyle($('svc')).display!=='none',walk=!!$('lookb')&&getComputedStyle($('lookb')).display!=='none';
 body.classList.toggle('kbusy',hide);body.classList.toggle('ksv',!!sv);body.classList.toggle('kwalk',walk);
 const w=$('kWalk');if(w)w.querySelector('span').textContent=walk?'למעלה':'ללכת';
 const m=$('kMus'),bm=$('bMus');if(m&&bm){m.classList.toggle('off',/כבוי|הפעל/.test(bm.textContent)&&!/פועלת/.test(bm.textContent))}},300);
})();
