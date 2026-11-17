/* ================= ארץ ישראל לילדים: שבטים וגבולות לפי תקופות ================= */
const KZ={ // צורות משוערות [אורך,רוחב,...] – מתאימות להצגה ילדית, לא למדידה
 mas:[33.8,31.1,34.42,30.67,35.15,30.75,35.45,30.95,35.55,31.6,35.55,32.2,35.6,32.75,35.8,33.0,36.3,33.5,36.55,34.4,35.9,34.65,34.5,34.65,33.8,34.65],
 trans:[35.55,31.4,36.1,31.4,36.5,32.2,36.5,33.2,35.9,33.35,35.6,32.9,35.55,32.2],
 solomon:[33.9,31.1,34.9,29.5,35.6,29.5,36.3,30.3,36.8,31.8,37.8,33.0,38.0,35.9,37.0,36.0,36.0,35.9,35.6,35.5,35.4,34.6,34.5,34.6],
 kIsrael:[34.0,31.9,35.4,31.9,35.9,31.8,36.5,32.2,36.5,33.2,35.8,33.5,35.5,33.55,34.0,33.55],
 kJudah:[34.4,31.9,35.2,31.9,35.5,31.75,35.5,30.95,34.9,30.5,34.4,30.65,34.0,31.3,34.4,31.6],
 yehud:[35.0,31.95,35.5,31.95,35.5,31.4,35.0,31.4],
 shomron:[34.9,32.6,35.55,32.6,35.55,32.0,34.9,32.1],ashdod:[34.2,31.95,34.9,31.95,34.9,31.5,34.3,31.5],edom:[34.4,31.5,35.1,31.45,35.1,30.8,34.5,30.8],ammon:[35.6,32.2,36.2,32.2,36.2,31.6,35.6,31.6],
 hasmo0:[34.6,31.9,35.5,31.9,35.5,31.3,34.6,31.3],
 hasmoMax:[34.2,31.3,34.85,30.6,35.35,30.5,35.9,31.0,36.1,31.8,36.4,32.7,36.2,33.3,35.7,33.3,35.2,33.05,35.05,32.8,34.95,32.65],
 herod2:[34.1,33.6,35.6,33.4,36.9,33.2,36.9,31.8,35.8,30.6,34.8,30.6,34.2,31.3],
 pGalil:[35.0,32.65,35.7,32.65,35.75,33.3,35.1,33.25],pShomron:[34.0,32.65,35.55,32.6,35.55,32.0,34.0,32.0],pYehuda:[34.0,32.0,35.55,32.0,35.55,31.3,35.1,31.0,34.0,31.3],
 pPerea:[35.55,32.6,36.1,32.5,36.1,31.4,35.55,31.4],pGolan:[35.6,33.3,36.4,33.2,36.45,32.65,35.65,32.7],pEdom:[34.3,31.3,35.2,31.3,35.1,30.7,34.5,30.7],
 // שבטים
 asher:[34.0,32.65,35.1,32.65,35.2,32.85,35.3,33.1,35.5,33.3,35.4,33.6,34.0,33.6],
 naftali:[35.3,32.88,35.62,32.85,35.65,33.1,35.78,33.3,35.55,33.42,35.45,33.3,35.3,33.1],
 zevulun:[34.9,32.65,35.3,32.6,35.45,32.75,35.3,32.9,35.15,32.85,35.0,32.7],
 yissachar:[35.3,32.6,35.55,32.55,35.6,32.75,35.5,32.85,35.35,32.8],
 menasheW:[34.0,32.6,34.95,32.6,35.35,32.55,35.5,32.4,35.45,32.2,34.0,32.2],
 efraim:[34.9,32.2,35.5,32.2,35.5,31.95,34.9,31.95],
 dan:[34.0,32.25,34.9,32.25,34.95,31.8,34.0,31.8],danN:[35.62,33.2,35.78,33.2,35.78,33.38,35.62,33.38],
 binyamin:[35.0,31.95,35.5,31.95,35.5,31.75,35.1,31.75],
 yehuda:[34.4,31.8,35.1,31.8,35.5,31.7,35.5,31.3,35.2,31.0,34.6,31.0,34.4,31.4],
 shimon:[34.2,31.35,34.95,31.3,35.05,30.8,34.4,30.7,34.2,31.0],
 reuven:[35.55,31.8,36.0,31.8,36.0,31.4,35.55,31.4],gad:[35.55,32.25,35.95,32.25,36.0,31.8,35.55,31.8],
 menasheE:[35.55,33.0,36.3,33.1,36.5,32.5,36.0,32.3,35.7,32.7]};
const TRIBES=[ // שם, סמל, צבע, כותרת, נקודת תווית, צורות, תיאור לילדים
['יהודה','🦁','#fbc02d',['yehuda'],[35.0,31.5],'״גּוּר אַרְיֵה יְהוּדָה״ – שבט המלכות. ממנו יצא דוד המלך, ובנחלתו חברון וסביבות ירושלים.'],
['שמעון','🏰','#ff9800',['shimon'],[34.6,31.0],'נחלתו נמצאה בתוך נחלת יהודה בנגב, סביב באר שבע.'],
['בנימין','🐺','#ec407a',['binyamin'],[35.25,31.85],'״בִּנְיָמִין זְאֵב יִטְרָף״ – ירושלים, יריחו ובית אל. ממנו שאול המלך ומרדכי.'],
['אפרים','🐂','#ef6c00',['efraim'],[35.2,32.07],'בן יוסף. בהרי אפרים שוכנת שילה, שם עמד המשכן ימים רבים.'],
['מנשה','🐃','#5c6bc0',['menasheW'],[35.12,32.45],'חצי שבט במערב וחצי בעבר הירדן המזרחי (גלעד ובשן). בן הבכור של יוסף.'],['מנשה (עבר הירדן)','🐃','#7986cb',['menasheE'],[35.95,32.75],'חצי שבט מנשה התיישב בגלעד ובבשן, ממזרח לירדן.'],
['דן','🐍','#ab47bc',['dan','danN'],[34.82,32.02],'״דָּן יָדִין עַמּוֹ״ – שמשון השופט. חלק מהשבט עבר צפונה לעיר לֶשֶׁם ונקראה דן.'],
['אשר','🫒','#7cb342',['asher'],[35.18,33.02],'״מֵאָשֵׁר שְׁמֵנָה לַחְמוֹ״ – שבט של זיתים ושמן, בחוף הים בצפון.'],
['נפתלי','🦌','#00acc1',['naftali'],[35.52,33.1],'״אַיָּלָה שְׁלֻחָה״ – מהיר כאיילה. הגליל העליון, חצור וים כנרת.'],
['זבולון','⛵','#29b6f6',['zevulun'],[35.18,32.72],'״לְחוֹף יַמִּים יִשְׁכֹּן״ – סוחרים ויורדי ים, בגליל התחתון.'],
['יששכר','🫏','#66bb6a',['yissachar'],[35.43,32.68],'״חֲמֹר גָּרֶם״ – שבט של לומדי תורה, בעמק יזרעאל לרגלי הר תבור.'],
['גד','⛺','#8d6e63',['gad'],[35.8,32.0],'״גָּד גְּדוּד יְגוּדֶנּוּ״ – לוחמים אמיצים, בעבר הירדן המזרחי.'],
['ראובן','🌿','#e53935',['reuven'],[35.8,31.6],'בכור יעקב, סימנו דודאים. נחלתו בעבר הירדן המזרחי, מצפון לארנון.']];
const KSITES=[['ירושלים',35.23,31.78,'⭐'],['שילה',35.29,32.06,'⛺'],['בית אל',35.22,31.94,'🪨'],['חצור',35.57,33.02,'🏯'],['באר שבע',34.79,31.25,'💧'],['עזה',34.47,31.5,'🏛️'],['יפו',34.75,32.05,'⚓'],['יריחו',35.45,31.87,'🌴'],['שכם',35.28,32.21,'🏔️'],['חברון',35.10,31.53,'🕍'],['בית שאן',35.5,32.5,'🏺'],['דן',35.65,33.25,'🌊'],['קדש (עיר מקלט)',35.52,33.1,'🛡️']];
const KWATER=[['ים הגדול',34.2,32.5],['ים כנרת',35.62,32.82],['ים המלח',35.47,31.42],['הירדן',35.57,32.3],['הר חרמון',35.78,33.4],['הר הכרמל',35.03,32.72],['הר תבור',35.39,32.69]];
const KL=[ // שכבות: שם, אימוג'י, צבע, [צבע, צורה, תווית נקודה...], עובדות
{n:'12 השבטים',e:'🧒',c:'#fb8c00',tribes:1,txt:['אחרי הכניסה לארץ חילק יהושע את הארץ בגורל לשנים־עשר שבטים. לשבט לוי לא היה חלק – הם שירתו במשכן ובמקדש וישבו ב־48 ערים. יוסף קיבל שני חלקים: אפרים ומנשה. ראובן, גד וחצי מנשה התנחלו בעבר הירדן המזרחי.','לחצו על שבט כדי לשמוע עליו!']},
{n:'גבולות הארץ (מסעי)',e:'🗺️',c:'#26a69a',shapes:[['#4db6ac','mas','ארץ כנען'],['#ffb74d','trans','עבר הירדן']],txt:['בפרשת מסעי מתוארים גבולות הארץ: הים הגדול במערב, מדבר צין ונחל מצרים בדרום, ים המלח והירדן במזרח, ומצפון לבוא חמת.','עבר הירדן המזרחי נלקח בנפרד – ראובן, גד וחצי מנשה ביקשו לגור שם.']},
{n:'דוד ושלמה',e:'👑',c:'#fbc02d',shapes:[['#ffd54f','solomon','ממלכת שלמה'],['#4db6ac','mas','']],txt:['בימי דוד ושלמה (כ־1000–930 לפנה״ס) הממלכה הייתה הגדולה ביותר: ״מִתִּפְסַח וְעַד עַזָּה״. שלמה בנה את בית המקדש הראשון בירושלים.']},
{n:'ישראל ויהודה',e:'✂️',c:'#ef5350',shapes:[['#ef5350','kIsrael','ממלכת ישראל (שומרון)'],['#42a5f5','kJudah','ממלכת יהודה (ירושלים)']],txt:['אחרי שלמה התפלגה הממלכה (930 לפנה״ס): עשרת השבטים בצפון – ממלכת ישראל, ויהודה ובנימין בדרום – ממלכת יהודה.','ממלכת ישראל חרבה בשנת 722, וממלכת יהודה ב־586 לפנה״ס.']},
{n:'שיבת ציון (פרס)',e:'🏗️',c:'#66bb6a',shapes:[['#a5d6a7','shomron','שומרון'],['#ce93d8','ashdod','אשדוד'],['#ffcc80','edom','אדום'],['#90caf9','ammon','עמון'],['#2e9d4f','yehud','יהוד']],txt:['אחרי גלות בבל חזרו היהודים לארץ בימי כורש, זרובבל ועזרא. ״יהוד״ הייתה פחווה קטנה סביב ירושלים. בניית בית שני הסתיימה ב־516 לפנה״ס.']},
{n:'החשמונאים',e:'🕎',c:'#7e57c2',shapes:[['#b39ddb','hasmoMax','המדינה בשיאה (ימי ינאי)'],['#7e57c2','hasmo0','ראשית המדינה']],txt:['מתתיהו ובניו מרדו ביוונים, טיהרו את המקדש (חנוכה) והקימו מדינה עצמאית. בימי אלכסנדר ינאי הגיעה המדינה לשטח גדול: גליל, חוף, גולן ועבר הירדן.']},
{n:'הורדוס',e:'🏛️',c:'#26a69a',shapes:[['#80cbc4','herod2','ממלכת הורדוס']],txt:['הורדוס היה מלך בחסות רומא (37–4 לפנה״ס). הוא בנה את קיסריה, מצדה והרחיב את בית המקדש. ממלכתו כללה גליל, שומרון, יהודה, עבר הירדן וגולן.']},
{n:'המחוזות הרומיים',e:'🛡️',c:'#c62828',shapes:[['#ef9a9a','pGalil','הגליל'],['#ce93d8','pShomron','שומרון'],['#fff176','pYehuda','יהודה'],['#ffcc80','pEdom','אדום'],['#90caf9','pPerea','פרעה'],['#a5d6a7','pGolan','גולן']],txt:['אחרי הורדוס חולקה הארץ לאזורים. בשנת 6 לספירה יהודה הפכה למחוז רומי עם נציב (פרוקורטור). בשנת 70 חרב בית המקדש השני.']}];
const kc=$('kidc'),kx=kc.getContext('2d');const KV={lon:35.3,lat:32,z:150};let kidOpen=false,kLayer=0,kHov=null,kSel=null,kdrag=null,kPoly=[];
const km2s=(lon,lat)=>[(lon-KV.lon)*KV.z*COSL+kc.width/2,(KV.lat-lat)*KV.z+kc.height/2];
const ks2m=(x,y)=>[(x-kc.width/2)/(KV.z*COSL)+KV.lon,KV.lat-(y-kc.height/2)/KV.z];
function kPath(ctx,pts){ctx.beginPath();for(let i=0;i<pts.length;i+=2){const p=km2s(pts[i],pts[i+1]);i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])}ctx.closePath()}
function kLand(ctx){ctx.beginPath();for(const r of LAND){for(let i=0;i<r.length;i+=2){const p=km2s(r[i],r[i+1]);i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])}ctx.closePath()}}
function inPoly(pts,lon,lat){let c=false;for(let i=0,j=pts.length-2;i<pts.length;j=i,i+=2){if((pts[i+1]>lat)!=(pts[j+1]>lat)&&lon<(pts[j]-pts[i])*(lat-pts[i+1])/(pts[j+1]-pts[i+1])+pts[i])c=!c}return c}
function kFit(){KV.lon=35.35;KV.lat=32.1;KV.z=Math.min(kc.width/(2.9*COSL),kc.height/3.5)}
function kText(t,x,y,size,fill,stroke){kx.font=`800 ${size}px "Segoe UI",Arial`;kx.lineJoin='round';kx.strokeStyle=stroke||'rgba(0,0,0,.55)';kx.lineWidth=Math.max(3,size/4);kx.strokeText(t,x,y);kx.fillStyle=fill||'#fff';kx.fillText(t,x,y)}
function kDraw(){const W=kc.width,H=kc.height,c=kx,L=KL[kLayer];kPoly=[];
 const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#b3e5fc');g.addColorStop(1,'#81d4fa');c.fillStyle=g;c.fillRect(0,0,W,H);
 c.fillStyle='rgba(255,255,255,.35)';for(let i=0;i<40;i++){const x=(i*173)%W,y=(i*97)%H;c.beginPath();c.arc(x,y,3+i%4,0,6.3);c.fill()}
 kLand(c);c.fillStyle='#fff6d6';c.fill();c.lineWidth=5;c.strokeStyle='#e8c77a';c.stroke();
 c.save();kLand(c);c.clip();c.lineJoin='round';
 if(L.tribes){TRIBES.forEach(t=>{const hot=kHov===t||kSel===t;for(const sh of t[3]){kPath(c,KZ[sh]);c.globalAlpha=hot?.97:.84;c.fillStyle=t[2];c.fill();c.globalAlpha=1;c.lineWidth=hot?4:2.5;c.strokeStyle='#fff';c.stroke();kPoly.push([KZ[sh],t])}})}
 else{for(const s of L.shapes){const hot=kHov&&kHov[1]===s;kPath(c,KZ[s[1]]);c.globalAlpha=.78;c.fillStyle=s[0];c.fill();c.globalAlpha=1;c.lineWidth=3.5;c.setLineDash(s[1]=='mas'||s[1]=='trans'?[10,6]:[]);c.strokeStyle=hot?'#fff':'rgba(255,255,255,.9)';c.stroke();c.setLineDash([]);kPoly.push([KZ[s[1]],s])}}
 c.restore();
 // ים המלח וכנרת וירדן
 c.fillStyle='#4fc3f7';c.strokeStyle='#e8c77a';c.lineWidth=2;kPath(c,[35.4,31.78,35.55,31.78,35.52,31.5,35.5,31.2,35.45,31.0,35.38,31.2,35.4,31.5]);c.fill();c.stroke();
 kPath(c,[35.55,32.9,35.62,32.92,35.66,32.8,35.6,32.7,35.54,32.78]);c.fill();c.stroke();
 c.strokeStyle='#4fc3f7';c.lineWidth=Math.max(2,KV.z/50);c.lineJoin='round';c.beginPath();[[35.58,32.72],[35.56,32.5],[35.55,32.3],[35.53,32.0],[35.55,31.78]].forEach((p,i)=>{const q=km2s(p[0],p[1]);i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])});c.stroke();
 c.textAlign='center';
 const sz=Math.max(12,Math.min(28,KV.z/8)),put=[],labs=[];
 if(L.tribes)TRIBES.forEach(t=>{const p=km2s(t[4][0],t[4][1]);labs.push({k:'t',t,p})});
 else for(const s of L.shapes){if(!s[2])continue;const pts=KZ[s[1]];let a=0,b=0,n=0;for(let i=0;i<pts.length;i+=2){a+=pts[i];b+=pts[i+1];n++}labs.push({k:'r',s,p:km2s(a/n,b/n)})}
 const free=(x,y,w,h)=>{if(put.some(q=>x<q[2]&&x+w>q[0]&&y<q[3]&&y+h>q[1]))return false;put.push([x,y,x+w,y+h]);return true};
 for(const l of labs){if(l.k=='t'){const w=l.t[0].length*sz*.62+10;if(!free(l.p[0]-w/2,l.p[1]-sz*1.7,w,sz*3.1))continue;kx.font=sz*1.5+'px "Segoe UI Emoji"';kx.fillStyle='#000';kx.fillText(l.t[1],l.p[0],l.p[1]-sz*.2);kText(l.t[0],l.p[0],l.p[1]+sz*1.25,sz)}
  else{const w=l.s[2].length*sz*.6;if(free(l.p[0]-w/2,l.p[1]-sz,w,sz*1.4))kText(l.s[2],l.p[0],l.p[1],sz*.95)}}
 const ss=KV.z>150;c.font=Math.max(14,sz)+'px "Segoe UI Emoji"';
 KSITES.forEach(s=>{if(!ss&&s[0]!='ירושלים')return;const p=km2s(s[1],s[2]);if(!free(p[0]-10,p[1]-12,20,20))return;c.fillStyle='#000';c.fillText(s[3],p[0],p[1]+6);if(KV.z>230){const fs=Math.max(11,sz*.62),w=s[0].length*fs*.6;if(free(p[0]-w/2,p[1]-fs*2.2,w,fs*1.3))kText(s[0],p[0],p[1]-fs*1.1,fs,'#3e2723','#fff')}});
 if(KV.z>170)KWATER.forEach(w=>{const p=km2s(w[1],w[2]),fs=Math.max(11,sz*.6),ww=w[0].length*fs*.6;if(free(p[0]-ww/2,p[1]-fs,ww,fs*1.3))kText(w[0],p[0],p[1],fs,'#01579b','#e1f5fe')})}
function kInfo(){const L=KL[kLayer];$('kT').textContent=L.e+' '+L.n;$('kD').innerHTML=L.txt.map(t=>`<p>${t}</p>`).join('');
 const k=kSel;$('kS').innerHTML=!k?'':Array.isArray(k)&&k[1]&&k.length>=6?`<div class="kb" style="background:${k[2]}"><span>${k[1]}</span><b>${k[0]}</b><div>${k[5]}</div></div>`:`<div class="kb" style="background:${k[0]}"><b>${k[2]||''}</b></div>`;
 $('kList').innerHTML=L.tribes?TRIBES.map((t,i)=>`<button style="background:${t[2]}" data-i="${i}">${t[1]} ${t[0]}</button>`).join(''):(L.shapes||[]).filter(s=>s[2]).map(s=>`<span class="kd"><i style="background:${s[0]}"></i>${s[2]}</span>`).join('');
 document.querySelectorAll('#kList button').forEach(b=>b.onclick=()=>{kSel=TRIBES[+b.dataset.i];kInfo();kDraw()});
 document.querySelectorAll('#kbtns button').forEach((b,i)=>b.classList.toggle('on',i==kLayer))}
function kSize(){const r=kc.parentElement.getBoundingClientRect();kc.width=Math.max(300,r.width);kc.height=Math.max(260,r.height);kFit();kDraw()}
function openKids(on){kidOpen=on;$('kidov').style.display=on?'flex':'none';if(on){kSize();kInfo()}}
function kPick(x,y){const m=ks2m(x,y);for(let i=kPoly.length-1;i>=0;i--)if(inPoly(kPoly[i][0],m[0],m[1]))return kPoly[i][1];return null}
kc.addEventListener('pointerdown',e=>{kdrag={x:e.offsetX,y:e.offsetY,lon:KV.lon,lat:KV.lat,m:0};kc.setPointerCapture(e.pointerId)});
kc.addEventListener('pointermove',e=>{if(kdrag){const dx=e.offsetX-kdrag.x,dy=e.offsetY-kdrag.y;if(Math.abs(dx)+Math.abs(dy)>4)kdrag.m=1;KV.lon=kdrag.lon-dx/(KV.z*COSL);KV.lat=kdrag.lat+dy/KV.z;kDraw()}else{const h=kPick(e.offsetX,e.offsetY);if(h!==kHov){kHov=h;kc.style.cursor=h?'pointer':'grab';kDraw()}}});
kc.addEventListener('pointerup',e=>{if(kdrag&&!kdrag.m){kSel=kPick(e.offsetX,e.offsetY);kInfo();kDraw()}kdrag=null});
kc.addEventListener('wheel',e=>{e.preventDefault();const b=ks2m(e.offsetX,e.offsetY);KV.z=Math.max(60,Math.min(900,KV.z*(e.deltaY<0?1.2:1/1.2)));const a=ks2m(e.offsetX,e.offsetY);KV.lon+=b[0]-a[0];KV.lat+=b[1]-a[1];kDraw()},{passive:false});
addEventListener('resize',()=>{if(kidOpen)kSize()});
KL.forEach((l,i)=>{const b=document.createElement('button');b.innerHTML=`<span>${l.e}</span>${l.n}`;b.style.setProperty('--c',l.c);b.onclick=()=>{kLayer=i;kSel=null;kHov=null;kInfo();kDraw()};$('kbtns').appendChild(b)});
$('bKids').onclick=()=>openKids(true);$('kidX').onclick=()=>openKids(false);$('kFit').onclick=()=>{kFit();kDraw()};
