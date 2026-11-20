/* ================= ארץ ישראל לילדים: שבטים וגבולות לפי תקופות – מפה מונפשת + מיקוד בערים (18.11.2026, גרסה 3) =================
   * הגיאומטריה (KGEOM): חלוקה בלי חפיפות ובלי חורים – לכל שני שבטים שכנים גבול משותף זהה (אותו מערך נקודות), מוחלק ב-Catmull-Rom;
     החיתוך לקו החוף נעשה בציור (clip) לפי קו החוף ב-geodata. אותו בלוק (בין הסימונים) מיוצא ע"י tools/kgeo-export.cjs לציור תמונת הייחוס.
   * תמונת הרקע base_k: צוירה מהנתונים (tools/draw-base-map.py) → Gemini (tools/gen-basemap.cjs) צייר עליה "חימר תלת־ממדי" → tools/verify-basemap.py אימת יישור.
     מעליה שכבה וקטורית מדויקת (שבטים/קו חוף/אגמים). אם התמונה חסרה – נשאר רקע שטוח מהנתונים.
   * ערים לפי תקופה: משוער. ירושלים – רינדורי הדגם (r_jo*), שאר הערים – איור דקורטיבי (d_city_*, "איור – לא מדויק").
   * כל התמונות בדרך blob: (mapPic ב-map.js) – נטפרי. אין משאבי רשת. */
/*KGEO-BEGIN*/
const KGEOM=(()=>{
 const cr=(p,n)=>{const k=p.length/2;if(k<3)return p.slice();const P=i=>{const j=Math.max(0,Math.min(k-1,i));return[p[2*j],p[2*j+1]]};const o=[p[0],p[1]];
  for(let i=0;i<k-1;i++){const a=P(i-1),b=P(i),c=P(i+1),d=P(i+2);for(let s=1;s<=n;s++){const t=s/n,t2=t*t,t3=t2*t;
   for(let j=0;j<2;j++)o.push(.5*(2*b[j]+(-a[j]+c[j])*t+(2*a[j]-5*b[j]+4*c[j]-d[j])*t2+(-a[j]+3*b[j]-3*c[j]+d[j])*t3))}}return o};
 const ch=(p,it)=>{for(let r=0;r<it;r++){const k=p.length/2,o=[];for(let i=0;i<k;i++){const a=[p[2*i],p[2*i+1]],b=[p[2*((i+1)%k)],p[2*((i+1)%k)+1]];o.push(.75*a[0]+.25*b[0],.75*a[1]+.25*b[1],.25*a[0]+.75*b[0],.25*a[1]+.75*b[1])}p=o}return p};
 /* תחום תמונת הרקע: מלבן 2:3 (רוחב:גובה) בהקרנה של המפה (x=(lon-lon0)*COSL, y=lat) – יחס שמנוע התמונות של Gemini תומך בו */
 const B={lon0:34.0,lat0:30.4,lat1:33.8,ar:2/3};B.lon1=B.lon0+(B.lat1-B.lat0)*B.ar/COSL;
 /* קו החוף מ-LAND (geodata): מתחילים בחוף סיני הצפוני ועד חוף סוריה; מוחלק; סוגרים בפינות רחוקות */
 const R0=LAND[10];let i0=0,i1=R0.length/2-1;for(let i=0;i<R0.length/2;i++){if(Math.abs(R0[2*i]-33.13)<.001&&Math.abs(R0[2*i+1]-31.17)<.001){i0=i;break}}
 for(let i=i0;i<R0.length/2;i++){if(Math.abs(R0[2*i]-36.03)<.001&&Math.abs(R0[2*i+1]-36.52)<.001){i1=i;break}}
 const land=cr(R0.slice(2*i0,2*i1+2),4).concat([38.8,36.52,38.8,28,25,28,25,31.15]);
 /* צמתים (נקודות משותפות) */
 const P={Wt:[33.95,33.58],N0:[35.36,33.58],N1:[35.52,33.58],D2:[35.72,33.58],M1:[36.4,33.4],X:[36.3,32.4],
  j0:[35.62,33.22],j2:[35.58,32.84],j3:[35.55,32.52],j4:[35.55,32.4],j5:[35.55,32.2],j6:[35.53,31.95],j7:[35.52,31.8],j8:[35.5,31.47],jS:[35.2,30.68],
  T1:[35.3,32.86],T2:[35.05,32.68],T3:[35.43,32.87],T4:[35.35,32.6],T5:[35.05,32.02],T6:[35.0,31.87],T7:[35.05,30.68],T8:[35.04,31.32],T9:[34.25,31.36],T10:[36.02,31.82],T11:[36.02,31.5],
  S1:[33.95,32.68],S2:[33.95,32.2],S3:[33.95,32.1],S4:[33.95,31.82],ST:[34.25,30.68],
  Y1:[35.08,31.42],K1:[34.4,31.45],S6:[33.95,31.45],S7:[34.4,30.75],Q1:[36.2,32.2],Q2:[36.2,31.47]};
 const e=(a,m,b)=>[].concat(P[a],m,P[b]);
 /* קצוות: שתי נקודות קצה (צמתים) ואמצע – כל קצה מוגדר פעם אחת ומשמש את שני הצדדים */
 const E={
  A_top:e('Wt',[],'N0'),A_N:e('N0',[35.33,33.4,35.28,33.2,35.27,33.05,35.3,32.93],'T1'),A_Z:e('T1',[35.22,32.8,35.12,32.73],'T2'),A_M:e('T2',[34.6,32.68],'S1'),A_w:e('S1',[],'Wt'),
  N_top:e('N0',[],'N1'),N_DN:e('N1',[35.55,33.42,35.6,33.3],'j0'),N_I:e('j2',[35.5,32.855],'T3'),N_Z:e('T3',[35.37,32.885],'T1'),
  DN_top:e('N1',[],'D2'),DN_ME:e('D2',[35.73,33.4,35.72,33.3],'j0'),ME_top:e('D2',[36.05,33.5],'M1'),ME_E:e('M1',[36.5,33.0,36.45,32.7],'X'),ME_G:e('j4',[35.8,32.37,36.05,32.34],'X'),
  J1:e('j0',[35.6,33.08,35.58,32.95],'j2'),J2:e('j2',[35.6,32.72,35.56,32.6],'j3'),J3:e('j3',[],'j4'),J4:e('j4',[],'j5'),J5:e('j5',[35.54,32.08],'j6'),J6:e('j6',[],'j7'),J7:e('j7',[35.52,31.65],'j8'),
  J8:e('j8',[35.48,31.25,35.45,31.05,35.3,30.8],'jS'),
  Z_M:e('T2',[35.15,32.63,35.25,32.6],'T4'),I_Z:e('T4',[35.38,32.7,35.4,32.8],'T3'),I_M:e('j3',[35.5,32.55,35.43,32.58],'T4'),
  M_w:e('S1',[],'S2'),E_M:e('S2',[34.6,32.2,35.0,32.22,35.3,32.2],'j5'),E_B:e('j6',[35.4,31.96,35.25,31.99,35.12,32.01],'T5'),D_E:e('T5',[34.9,32.06,34.6,32.1],'S3'),E_w:e('S3',[],'S2'),
  D_B:e('T5',[35.02,31.95],'T6'),D_J:e('T6',[34.85,31.84,34.6,31.82],'S4'),D_w:e('S4',[],'S3'),B_J:e('j7',[35.4,31.76,35.28,31.77,35.15,31.8,35.05,31.85],'T6'),
  J_w:e('T9',[33.95,31.36],'S4'),J_s1:e('jS',[],'T7'),S_J_E:e('T7',[35.05,31.0],'T8'),S_J_N:e('T8',[34.75,31.38,34.5,31.37],'T9'),S_w:e('T9',[],'ST'),S_s:e('ST',[],'T7'),
  G_E:e('X',[36.15,32.35,36.05,32.1],'T10'),R_G:e('T10',[35.8,31.815],'j7'),R_s:e('j8',[35.75,31.47],'T11'),R_E:e('T11',[],'T10'),
  /* תקופת פרס: גבולות נוספים (מעל אותו מערך נקודות) */
  Y_W:e('T6',[35.04,31.6],'Y1'),Y_S:e('Y1',[35.3,31.45],'j8'),A_E1:e('Y1',[34.7,31.45],'K1'),A_E2:e('K1',[],'S6'),AD_w:e('S6',[],'S3'),ED_s:e('jS',[34.9,30.68],'S7'),ED_w:e('S7',[34.38,31.1],'K1'),
  AM_n:e('j5',[35.9,32.2],'Q1'),AM_e:e('Q1',[36.22,31.8],'Q2'),AM_s:e('Q2',[35.9,31.47],'j8')};
 const ES={};for(const k in E)ES[k]=E[k].length>4?cr(E[k],6):E[k].slice();
 /* טבעות: רשימת קצוות ברצף; '-' = בכיוון הפוך */
 const R={asher:['A_top','A_N','A_Z','A_M','A_w'],naftali:['N_top','N_DN','J1','N_I','N_Z','-A_N'],danN:['DN_top','DN_ME','-N_DN'],menasheE:['-DN_ME','ME_top','ME_E','-ME_G','-J3','-J2','-J1'],
  zevulun:['A_Z','Z_M','I_Z','N_Z'],yissachar:['-N_I','J2','I_M','I_Z'],menasheW:['A_M','M_w','E_M','-J4','-J3','I_M','-Z_M'],efraim:['E_M','J5','E_B','D_E','E_w'],
  dan:['D_B','D_J','D_w','-D_E'],binyamin:['J6','B_J','-D_B','-E_B'],yehuda:['J7','J8','J_s1','S_J_E','S_J_N','J_w','-D_J','-B_J'],shimon:['S_J_N','S_w','S_s','S_J_E'],
  gad:['ME_G','G_E','R_G','-J6','-J5','-J4'],reuven:['R_G','J7','R_s','R_E'],
  p_yehud:['E_B','D_B','Y_W','Y_S','-J7','-J6'],p_ashdod:['D_B','Y_W','A_E1','A_E2','AD_w','-D_E'],p_edom:['Y_S','J8','ED_s','ED_w','-A_E1'],p_ammon:['J5','J6','J7','-AM_s','-AM_e','-AM_n']};
 const pts=n=>{const rv=n[0]=='-',a=ES[rv?n.slice(1):n],o=[];for(let i=0;i<a.length;i+=2)o.push([a[i],a[i+1]]);return rv?o.reverse():o};
 const same=(a,b)=>Math.abs(a[0]-b[0])<1e-9&&Math.abs(a[1]-b[1])<1e-9;
 const ring=names=>{const o=[];for(const n of names)for(const q of pts(n)){const l=o.length;if(l>=2&&same([o[l-2],o[l-1]],q))continue;o.push(q[0],q[1])}return o};
 const check=()=>{const bad=[];for(const k in R){const ps=R[k].map(pts);for(let i=0;i<ps.length;i++){const a=ps[i],b=ps[(i+1)%ps.length];if(!same(a[a.length-1],b[0]))bad.push(k+':'+R[k][i]+'->'+R[k][(i+1)%ps.length])}}return bad};
 const rings={};for(const k in R)rings[k]=ring(R[k]);
 /* צבירה: טבעות של כמה שבטים/מחוזות + קווי המתאר החיצוניים (קצוות שמופיעים בדיוק פעם אחת) */
 const group=names=>{const cnt={};for(const n of names)for(const s of R[n])cnt[s.replace('-','')]=(cnt[s.replace('-','')]||0)+1;
  return{rings:names.map(n=>rings[n]),outline:Object.keys(cnt).filter(s=>cnt[s]==1).map(s=>ES[s])}};
 /* אגמים, נהרות ורכסים (קישוט משוער – לא נתון עובדתי; הגבולות הם ה-Jordan וקו החוף בלבד) */
 const lakes={kinneret:ch([35.57,32.9,35.61,32.895,35.65,32.85,35.655,32.78,35.62,32.72,35.57,32.695,35.525,32.725,35.51,32.79,35.525,32.855],2),
  dead:ch([35.45,31.77,35.53,31.77,35.57,31.68,35.58,31.55,35.56,31.4,35.53,31.25,35.49,31.12,35.43,31.08,35.4,31.2,35.385,31.32,35.385,31.46,35.39,31.6,35.42,31.72],2)};
 const jordan=[].concat(ES.J1,ES.J2.slice(2),ES.J3.slice(2),ES.J4.slice(2),ES.J5.slice(2),ES.J6.slice(2));
 const rivers=[{n:'jordan',w:3.2,p:jordan},{n:'yarmuk',w:2,p:cr([36.4,32.74,36.1,32.68,35.85,32.7,35.62,32.68],5)},{n:'jabbok',w:2,p:cr([36.1,32.22,35.85,32.17,35.56,32.18],5)},
  {n:'arnon',w:2,p:cr([35.95,31.45,35.75,31.47,35.52,31.46],5)},{n:'kishon',w:2,p:cr([35.3,32.57,35.15,32.66,35.03,32.78],5)},{n:'yarkon',w:2,p:cr([35.0,32.12,34.88,32.1,34.77,32.09],5)}];
 const ridges=[{w:.2,k:'h',p:[35.18,33.2,35.34,33.0,35.46,32.95]},{w:.13,k:'h',p:[35.1,32.78,35.3,32.8,35.46,32.77]},{w:.09,k:'h',p:[34.98,32.78,35.12,32.65,35.26,32.57]},
  {w:.22,k:'h',p:[35.25,32.6,35.28,32.3,35.25,32.0,35.2,31.75,35.08,31.5,34.98,31.3]},{w:.13,k:'m',p:[35.25,32.4,35.26,32.2]},{w:.14,k:'m',p:[35.15,31.7,35.1,31.5]},
  {w:.28,k:'h',p:[35.75,33.3,35.85,33.05,35.92,32.85]},{w:.13,k:'m',p:[35.75,33.38,35.82,33.42]},{w:.22,k:'h',p:[35.82,32.5,35.86,32.2,35.86,31.8,35.82,31.5]},
  {w:.2,k:'h',p:[34.65,30.65,34.92,30.85,35.12,31.02]},{w:.14,k:'m',p:[34.75,30.7,34.95,30.82]}].map(r=>({w:r.w,k:r.k,p:cr(r.p,4)}));
 return{B,land,tribes:rings,edges:ES,rings:R,group,lakes,rivers,ridges,cr,ch,check,P};
})();
/*KGEO-END*/

const KZ={ // צורות משוערות [אורך,רוחב,...] לשכבות שאינן חלוקה: מחליקות ב-KGEOM.ch; מתאימות להצגה ילדית, לא למדידה
 mas:[33.8,31.1,34.42,30.67,35.15,30.75,35.45,30.95,35.55,31.6,35.55,32.2,35.6,32.75,35.8,33.0,36.3,33.5,36.55,34.4,35.9,34.65,34.5,34.65,33.8,34.65],
 solomon:[33.9,31.1,34.9,29.5,35.6,29.5,36.3,30.3,36.8,31.8,37.8,33.0,38.0,35.9,37.0,36.0,36.0,35.9,35.6,35.5,35.4,34.6,34.5,34.6],
 hasmo0:[34.6,31.9,35.5,31.9,35.5,31.3,34.6,31.3],
 hasmoMax:[34.2,31.3,34.85,30.6,35.35,30.5,35.9,31.0,36.1,31.8,36.4,32.7,36.2,33.3,35.7,33.3,35.2,33.05,35.05,32.8,34.95,32.65],
 herod2:[34.1,33.6,35.6,33.4,36.9,33.2,36.9,31.8,35.8,30.6,34.8,30.6,34.2,31.3]};
const TRIBES=[ // שם, סמל, צבע, שבטים-מבנה (מפתחות ב-KGEOM.tribes), נקודת תווית (נפילה), תיאור לילדים
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
const KWATER=[['ים הגדול',34.0,32.5],['ים כנרת',35.62,32.78],['ים המלח',35.47,31.4],['הירדן',35.6,32.3],['הר חרמון',35.78,33.4],['הר הכרמל',35.03,32.72],['הר תבור',35.39,32.69]];
/* שכבות: שם, אימוג'י, צבע, אזורים (regs), עובדות. אזור: [צבע, תווית, מקור-גיאומטריה]; מקור: {z:'מפתח KZ'} | {g:[שבטים/מחוזות]} */
const KJ=['yehuda','shimon','binyamin'],KALL=['asher','naftali','danN','menasheE','zevulun','yissachar','menasheW','efraim','dan','binyamin','yehuda','shimon','gad','reuven'];
const KL=[
{n:'12 השבטים',e:'🧒',c:'#fb8c00',tribes:1,txt:['אחרי הכניסה לארץ חילק יהושע את הארץ בגורל לשנים־עשר שבטים. לשבט לוי לא היה חלק – הם שירתו במשכן ובמקדש וישבו ב־48 ערים. יוסף קיבל שני חלקים: אפרים ומנשה. ראובן, גד וחצי מנשה התנחלו בעבר הירדן המזרחי.','לחצו על שבט כדי לשמוע עליו!']},
{n:'גבולות הארץ (מסעי)',e:'🗺️',c:'#26a69a',dash:1,regs:[['#4db6ac','ארץ כנען',{m:1}],['#ffb74d','עבר הירדן',{g:['reuven','gad','menasheE']}]],txt:['בפרשת מסעי מתוארים גבולות הארץ: הים הגדול במערב, מדבר צין ונחל מצרים בדרום, ים המלח והירדן במזרח, ומצפון לבוא חמת.','עבר הירדן המזרחי נלקח בנפרד – ראובן, גד וחצי מנשה ביקשו לגור שם.']},
{n:'דוד ושלמה',e:'👑',c:'#fbc02d',regs:[['#ffd54f','ממלכת שלמה',{z:'solomon'}],['#4db6ac','',{m:1}]],txt:['בימי דוד ושלמה (כ־1000–930 לפנה״ס) הממלכה הייתה הגדולה ביותר: ״מִתִּפְסַח וְעַד עַזָּה״. שלמה בנה את בית המקדש הראשון בירושלים.']},
{n:'ישראל ויהודה',e:'✂️',c:'#ef5350',regs:[['#ef5350','ממלכת ישראל (שומרון)',{g:KALL.filter(x=>!KJ.includes(x))}],['#42a5f5','ממלכת יהודה (ירושלים)',{g:KJ}]],txt:['אחרי שלמה התפלגה הממלכה (930 לפנה״ס): עשרת השבטים בצפון – ממלכת ישראל, ויהודה ובנימין בדרום – ממלכת יהודה.','ממלכת ישראל חרבה בשנת 722, וממלכת יהודה ב־586 לפנה״ס.']},
{n:'שיבת ציון (פרס)',e:'🏗️',c:'#66bb6a',regs:[['#a5d6a7','שומרון',{g:['menasheW','efraim']}],['#ce93d8','אשדוד',{g:['p_ashdod']}],['#ffcc80','אדום',{g:['p_edom']}],['#90caf9','עמון',{g:['p_ammon']}],['#2e9d4f','יהוד',{g:['p_yehud']}]],txt:['אחרי גלות בבל חזרו היהודים לארץ בימי כורש, זרובבל ועזרא. ״יהוד״ הייתה פחווה קטנה סביב ירושלים. בניית בית שני הסתיימה ב־516 לפנה״ס.']},
{n:'החשמונאים',e:'🕎',c:'#7e57c2',regs:[['#b39ddb','המדינה בשיאה (ימי ינאי)',{z:'hasmoMax'}],['#7e57c2','ראשית המדינה',{z:'hasmo0'}]],txt:['מתתיהו ובניו מרדו ביוונים, טיהרו את המקדש (חנוכה) והקימו מדינה עצמאית. בימי אלכסנדר ינאי הגיעה המדינה לשטח גדול: גליל, חוף, גולן ועבר הירדן.']},
{n:'הורדוס',e:'🏛️',c:'#26a69a',regs:[['#80cbc4','ממלכת הורדוס',{z:'herod2'}]],txt:['הורדוס היה מלך בחסות רומא (37–4 לפנה״ס). הוא בנה את קיסריה, מצדה והרחיב את בית המקדש. ממלכתו כללה גליל, שומרון, יהודה, עבר הירדן וגולן.']},
{n:'המחוזות הרומיים',e:'🛡️',c:'#c62828',regs:[['#ef9a9a','הגליל',{g:['asher','naftali','danN','zevulun','yissachar']}],['#ce93d8','שומרון',{g:['menasheW','efraim']}],['#fff176','יהודה',{g:['p_ashdod','p_yehud']}],['#ffcc80','אדום',{g:['p_edom']}],['#90caf9','פרעה',{g:['reuven','gad']}],['#a5d6a7','גולן',{g:['menasheE']}]],txt:['אחרי הורדוס חולקה הארץ לאזורים. בשנת 6 לספירה יהודה הפכה למחוז רומי עם נציב (פרוקורטור). בשנת 70 חרב בית המקדש השני.']}];
const KLS=['12 שבטים','גבולות','דוד ושלמה','ישראל ויהודה','שיבת ציון','חשמונאים','הורדוס','רומא'],
 KLD=['d_tribes','d_borders','d_davidsolomon','d_israeljudah','d_persia','d_hasmonean','d_herod','d_roman'],
 KLP=[null,null,null,null,0,4,5,6];   /* אינדקס תקופה (ב-PERIODS) לשכבות שיש להן תמונת דגם של ירושלים באותה תקופה */

/* ---------- ערים לפי תקופה (משוער) ----------  [שם, אורך, רוחב, סמל, משפט, מפתח איור]. שכבות 0–3: רשימה קצרה לפי המקרא; שכבות 4–7: מנתוני CITIES (regions.js) */
const KSRC0='מקור: ספרי יהושע, שמואל ומלכים. מיקומי הערים משוערים.',KSRC1='מקור: נתוני "מפת האזור לפי תקופות". מיקומי הערים משוערים.';
const KCITY0=[
 [['שילה',35.29,32.06,'⛺','כאן עמד המשכן ימים רבים, וכאן חילק יהושע את הארץ.','city_shiloh'],['גלגל',35.47,31.89,'⭕','המחנה הראשון בארץ. הוקמו כאן אבני זיכרון מן הירדן.',''],['חברון',35.10,31.53,'🕍','עיר האבות. כאן קבורים אברהם ושרה.','city_hebron'],['שכם',35.28,32.21,'🏔️','בין הר גריזים להר עיבל קיבל העם את הברכה.','city_shechem'],['בית אל',35.22,31.94,'🪨','כאן חלם יעקב אבינו על הסולם.',''],['חצור',35.57,33.02,'🏯','עיר גדולה בצפון. יהושע ניצח את מלכה.',''],['ירושלים',35.23,31.78,'🌟','יבוס – עיר היבוסים. רק בימי דוד נכבשה.','city_jerusalem']],
 [['קדש ברנע',34.42,30.64,'💧','בדרום הארץ. משם שלח משה את המרגלים.',''],['באר שבע',34.79,31.25,'💧','הדרום: ״מִדָּן וְעַד בְּאֵר שָׁבַע״.',''],['חברון',35.10,31.53,'🕍','עיר האבות, בהר יהודה.','city_hebron'],['דן',35.65,33.25,'🌊','הצפון: ״מִדָּן וְעַד בְּאֵר שָׁבַע״.',''],['צידון',35.37,33.56,'⚓','עיר חוף בצפון, בגבול אשר.','']],
 [['ירושלים',35.23,31.78,'🌟','דוד הפך אותה לבירה, ושלמה בנה בה את בית המקדש.','city_jerusalem'],['חברון',35.10,31.53,'🕍','דוד מלך בה שבע שנים.','city_hebron'],['גזר',34.92,31.86,'🛡️','עיר מבצר שבנה שלמה.',''],['מגידו',35.18,32.58,'🛡️','עיר מבצר שבנה שלמה בעמק יזרעאל.',''],['חצור',35.57,33.02,'🏯','עיר מבצר שבנה שלמה בצפון.',''],['יפו',34.75,32.05,'⚓','נמל ירושלים. ארזי הלבנון הגיעו אליו.','city_jaffa']],
 [['שומרון',35.19,32.28,'🏛️','בירת ממלכת ישראל. עומרי בנה אותה.',''],['ירושלים',35.23,31.78,'🌟','בירת ממלכת יהודה. בית המקדש עמד בה.','city_jerusalem'],['בית אל',35.22,31.94,'🪨','ירבעם הציב בה עגל זהב.',''],['דן',35.65,33.25,'🌊','ירבעם הציב בה עגל זהב.',''],['לכיש',34.85,31.56,'🛡️','עיר מבצר חשובה ביהודה.',''],['באר שבע',34.79,31.25,'💧','גבול הדרום של יהודה.','']]];
const KEMO={'ירושלים':'🌟','שומרון':'🏛️','סבסטי':'🏛️','קיסריה':'⚓','מצדה':'🏰','יריחו':'🌴','קומראן':'📜','בית שאן':'🏺','מודיעין':'🕎','צפורי':'🏛️','טבריה':'🌊','יפו':'⚓','חברון':'🕍','עכו':'⚓','צור':'⚓','צידון':'⚓','אשקלון':'⚓','עזה':'🏛️','הורדיון':'🏰','שכם':'🏔️','באר שבע':'💧','כפר נחום':'🐟','נצרת':'🏡','עמון':'🏛️','לוד':'🏘️','יבנה':'📚','דור':'⚓'},
 KTE={k:'🌟',c:'🏘️',p:'⚓',h:'⛰️',f:'🏰'},KDECO={'יפו':'city_jaffa','חברון':'city_hebron','שכם':'city_shechem','יריחו':'city_jericho'};
let KCC={};
function kCities(li){if(KCC[li])return KCC[li];let r;
 if(li<4)r=KCITY0[li].map(c=>({n:c[0],lon:c[1],lat:c[2],e:c[3],t:c[4],d:c[5],src:KSRC0}));
 else{const pi=KLP[li],inb=c=>c[1]>KGEOM.B.lon0+.1&&c[1]<36.2&&c[2]>KGEOM.B.lat0&&c[2]<KGEOM.B.lat1&&c[6]!='h';
  r=CITIES.filter(c=>inb(c)&&cityOn(c,pi)&&c[5]>=2).sort((a,b)=>b[5]-a[5]).slice(0,10).map(c=>{const n=c[0].replace(/\s*\(.*$/,'');return{n,lon:c[1],lat:c[2],e:KEMO[n]||KTE[c[6]]||'📍',t:c[7]||'עיר בתקופה הזאת.',d:KDECO[n]||(n=='ירושלים'?'city_jerusalem':''),src:KSRC1}})}
 return KCC[li]=r}

/* ---------- מצב ותצוגה ---------- */
const kc=$('kidc'),kx=kc.getContext('2d'),KB=KGEOM.B;
const KV={lon:35.15,lat:32.1,z:150};let kDim=0,kidOpen=false,kLayer=0,kPrev=null,kLayerAt=0,kHov=null,kSel=null,kCity=null,kFly=null,kRaf=0;
const kRM=()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}};
const km2s=(lon,lat)=>[(lon-KV.lon)*KV.z*COSL+kc.width/2,(KV.lat-lat)*KV.z+kc.height/2];
const ks2m=(x,y)=>[(x-kc.width/2)/(KV.z*COSL)+KV.lon,KV.lat-(y-kc.height/2)/KV.z];
const kEase=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,kBack=t=>{const c=1.70158+1;return 1+c*Math.pow(t-1,3)+1.70158*Math.pow(t-1,2)};
const kClamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function kPath(ctx,pts,close,dx,dy){ctx.beginPath();for(let i=0;i<pts.length;i+=2){const p=km2s(pts[i],pts[i+1]);i?ctx.lineTo(p[0]+(dx||0),p[1]+(dy||0)):ctx.moveTo(p[0]+(dx||0),p[1]+(dy||0))}if(close!==false)ctx.closePath()}
function inPoly(pts,lon,lat){let c=false;for(let i=0,j=pts.length-2;i<pts.length;j=i,i+=2){if((pts[i+1]>lat)!=(pts[j+1]>lat)&&lon<(pts[j]-pts[i])*(lat-pts[i+1])/(pts[j+1]-pts[i+1])+pts[i])c=!c}return c}
const kLandP=ctx=>kPath(ctx,KGEOM.land);
function kFit(){KV.lon=35.3;KV.lat=32.15;KV.z=Math.min(kc.width/(2.7*COSL),kc.height/3.1)}
function kText(t,x,y,size,fill,stroke){kx.font=`800 ${size}px "Segoe UI",Arial`;kx.lineJoin='round';kx.strokeStyle=stroke||'rgba(0,0,0,.55)';kx.lineWidth=Math.max(3,size/4);kx.strokeText(t,x,y);kx.fillStyle=fill||'#fff';kx.fillText(t,x,y)}
function kShade(h,a){const n=parseInt(h.slice(1),16),f=v=>kClamp(Math.round(a>=0?v+(255-v)*a:v*(1+a)),0,255);return'rgb('+f(n>>16)+','+f((n>>8)&255)+','+f(n&255)+')'}

/* ---------- תמונת הרקע (blob:) – נפילה: רקע שטוח מהנתונים ---------- */
const KSEA='#7abbe7',KSAND='#cfad68';   /* ממוצע צבעי הים/יבשה בתמונת הרקע (tools: ראו verify) – לצביעת מה שמחוץ לתמונה */let kBaseC=null,kBaseOk=false;
onMapImgs(function(){const u=mapPic('base_k');if(!u)return;const im=new Image();im.onload=()=>{try{const w=im.naturalWidth,h=im.naturalHeight,c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.drawImage(im,0,0);
  const f=Math.round(w*.05);for(const g of[[0,0,f,0],[w,0,w-f,0],[0,0,0,f],[0,h,0,h-f]]){const gr=x.createLinearGradient(g[0],g[1],g[2],g[3]);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,1)');x.globalCompositeOperation='destination-in';x.fillStyle=gr;x.fillRect(0,0,w,h)}
  x.globalCompositeOperation='source-over';kBaseC=c;kBaseOk=true;kQ()}catch(e){kBaseC=null}};im.onerror=()=>{kBaseC=null};im.src=u});

/* ---------- אזורים (regs) לכל שכבה ---------- */
const krev=a=>{const o=[];for(let i=a.length-2;i>=0;i-=2)o.push(a[i],a[i+1]);return o};
function kPolyOf(src){if(src.z)return{rings:[KGEOM.ch(KZ[src.z],2)],outline:null};
 if(src.m){const J=KGEOM.edges,P=KGEOM.P;   /* ארץ כנען: חוף+דרום+צפון משוערים, והירדן – אותו קו משותף עם שבטי עבר הירדן */
  const up=[].concat(krev(J.J8),krev(J.J7).slice(2),krev(J.J6).slice(2),krev(J.J5).slice(2),krev(J.J4).slice(2),krev(J.J3).slice(2),krev(J.J2).slice(2),krev(J.J1).slice(2));
  const o=KGEOM.cr([33.8,31.1,34.42,30.67,34.8,30.66].concat(P.jS),4).concat(up.slice(2),KGEOM.cr(P.j0.concat([35.75,33.35,36.3,33.5,36.55,34.4,35.9,34.65,34.5,34.65,33.8,34.65,33.8,31.1]),4).slice(2));return{rings:[o],outline:null}}
 const g=KGEOM.group(src.g);return{rings:g.rings,outline:g.outline}}
const KREG=[];
function kRegs(li){if(KREG[li])return KREG[li];const L=KL[li];let rs;
 if(L.tribes)rs=TRIBES.map((t,i)=>{const rr=t[3].map(k=>KGEOM.tribes[k]);return{t,i,col:t[2],name:t[0],rings:rr,outline:null,tribe:1}});
 else rs=L.regs.map((r,i)=>{const p=kPolyOf(r[2]);return{i,col:r[0],name:r[1],rings:p.rings,outline:p.outline,dash:L.dash}});
 rs.forEach(r=>{r.bb=r.rings.map(p=>{let a=1e9,b=-1e9,c=1e9,d=-1e9;for(let i=0;i<p.length;i+=2){a=Math.min(a,p[i]);b=Math.max(b,p[i]);c=Math.min(c,p[i+1]);d=Math.max(d,p[i+1])}return[a,b,c,d]});
  const ub=[1e9,-1e9,1e9,-1e9];r.bb.forEach(q=>{ub[0]=Math.min(ub[0],q[0]);ub[1]=Math.max(ub[1],q[1]);ub[2]=Math.min(ub[2],q[2]);ub[3]=Math.max(ub[3],q[3])});r.ub=ub;r.uc=[(ub[0]+ub[1])/2,(ub[2]+ub[3])/2];
  r.lbl=r.tribe?r.rings.map((p,j)=>kLabel([p],r.bb[j])):[kLabel(r.rings,ub)];r.hov=0});
 return KREG[li]=rs}
/* נקודת תווית פנימית: רסטר של (צורה ∩ יבשה − אגמים) + מרחק עד הקצה – המרכז הפנימי ולא מרכז הקופסה */
function kLabel(rings,bb){const W=72,gx=(bb[1]-bb[0]),gy=(bb[3]-bb[2]),sc=W/Math.max(gx*COSL,gy),w=Math.max(4,Math.ceil(gx*COSL*sc)+2),h=Math.max(4,Math.ceil(gy*sc)+2);
 const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');const tr=(lon,lat)=>[(lon-bb[0])*COSL*sc+1,(bb[3]-lat)*sc+1];
 const path=pts=>{x.beginPath();for(let i=0;i<pts.length;i+=2){const p=tr(pts[i],pts[i+1]);i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1])}x.closePath()};
 x.fillStyle='#000';for(const ring of rings){path(ring);x.fill()}x.globalCompositeOperation='destination-in';path(KGEOM.land);x.fill();x.globalCompositeOperation='destination-out';for(const k in KGEOM.lakes){path(KGEOM.lakes[k]);x.fill()}
 const d=x.getImageData(0,0,w,h).data,m=new Float32Array(w*h);for(let i=0;i<w*h;i++)m[i]=d[4*i+3]>128?1e4:0;
 for(let y=0;y<h;y++)for(let xx=0;xx<w;xx++){const i=y*w+xx;if(!m[i])continue;let v=m[i];v=Math.min(v,(xx?m[i-1]:0)+1,(y?m[i-w]:0)+1,(xx&&y?m[i-w-1]:0)+1.4,(xx<w-1&&y?m[i-w+1]:0)+1.4);m[i]=v}
 let best=0,bi=-1;for(let y=h-1;y>=0;y--)for(let xx=w-1;xx>=0;xx--){const i=y*w+xx;if(!m[i])continue;let v=m[i];v=Math.min(v,(xx<w-1?m[i+1]:0)+1,(y<h-1?m[i+w]:0)+1,(xx<w-1&&y<h-1?m[i+w+1]:0)+1.4,(xx&&y<h-1?m[i+w-1]:0)+1.4);m[i]=v;if(v>best){best=v;bi=i}}
 if(bi<0)return{lon:(bb[0]+bb[1])/2,lat:(bb[2]+bb[3])/2,r:0};const px=bi%w,py=(bi/w)|0;return{lon:bb[0]+(px-1)/(COSL*sc),lat:bb[3]-(py-1)/sc,r:best/sc}}   /* r = רדיוס עיגול פנימי במעלות רוחב */

/* ---------- ציור ---------- */
const kHash=i=>{const s=Math.sin(i*127.1+311.7)*43758.5453;return s-Math.floor(s)};
function kSea(now){const c=kx,W=kc.width,H=kc.height;
 c.save();c.beginPath();c.rect(0,0,W,H);for(let i=0;i<KGEOM.land.length;i+=2){const p=km2s(KGEOM.land[i],KGEOM.land[i+1]);i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])}c.closePath();c.clip('evenodd');
 const t=kRM()?0:now/1000,pz=KV.z/150;
 for(let i=0;i<46;i++){const lon=33.2+kHash(i)*1.2,lat=30.9+kHash(i+99)*3.4;const p=km2s(lon,lat);if(p[0]<-20||p[0]>W+20||p[1]<-20||p[1]>H+20)continue;
  const ph=t*1.1+i*1.7,a=.25+.2*Math.sin(ph),w=(10+kHash(i+7)*14)*Math.max(.6,pz),dy=Math.sin(ph*.7)*2;
  c.strokeStyle='rgba(255,255,255,'+a.toFixed(2)+')';c.lineWidth=2;c.lineCap='round';c.beginPath();c.moveTo(p[0]-w,p[1]+dy);c.quadraticCurveTo(p[0]-w/2,p[1]-5+dy,p[0],p[1]+dy);c.quadraticCurveTo(p[0]+w/2,p[1]+5+dy,p[0]+w,p[1]+dy);c.stroke()}
 for(let i=0;i<14;i++){const p=km2s(33.2+kHash(i+300)*1.0,30.9+kHash(i+400)*3.4),a=Math.max(0,Math.sin(t*1.6+i*2.3));if(a<.05)continue;c.fillStyle='rgba(255,255,255,'+(a*.8).toFixed(2)+')';c.beginPath();const r=1.5+a*2;c.moveTo(p[0],p[1]-r*2);c.lineTo(p[0]+r*.6,p[1]-r*.6);c.lineTo(p[0]+r*2,p[1]);c.lineTo(p[0]+r*.6,p[1]+r*.6);c.lineTo(p[0],p[1]+r*2);c.lineTo(p[0]-r*.6,p[1]+r*.6);c.lineTo(p[0]-r*2,p[1]);c.lineTo(p[0]-r*.6,p[1]-r*.6);c.fill()}
 c.restore()}
function kBase(now){const c=kx,W=kc.width,H=kc.height;c.fillStyle=KSEA;c.fillRect(0,0,W,H);kLandP(c);c.fillStyle=KSAND;c.fill();
 if(kBaseOk&&kBaseC){const a=km2s(KB.lon0,KB.lat1),b=km2s(KB.lon1,KB.lat0);c.drawImage(kBaseC,a[0],a[1],b[0]-a[0],b[1]-a[1])}
 else{const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#b3e5fc');g.addColorStop(1,'#81d4fa');c.fillStyle=g;c.fillRect(0,0,W,H);kLandP(c);c.fillStyle=KSAND;c.fill()}
 kSea(now);kLandP(c);c.lineJoin='round';c.strokeStyle='rgba(255,255,255,.75)';c.lineWidth=3;c.stroke();c.strokeStyle='rgba(222,178,98,.9)';c.lineWidth=1.2;c.stroke()}
function kLake(c){const w=Math.max(1.5,KV.z/60);for(const k in KGEOM.lakes){kPath(c,KGEOM.lakes[k]);const bb=KGEOM.lakes[k],p=km2s(bb[0],bb[1]);const g=c.createLinearGradient(0,p[1]-20,0,p[1]+60*KV.z/150);g.addColorStop(0,'#5fc3f0');g.addColorStop(1,'#2f95d6');c.fillStyle=g;c.globalAlpha=.93;c.fill();c.globalAlpha=1;c.strokeStyle='#f6e3a8';c.lineWidth=2;c.stroke()}
 c.strokeStyle='rgba(79,195,247,.9)';c.lineWidth=Math.max(2,KV.z/48);c.lineJoin='round';c.lineCap='round';kPath(c,KGEOM.rivers[0].p,false);c.stroke()}
/* ציור אזור אחד: עומק (צל), מילוי בדרגתיות, מתאר לבן־זהוב, הגדלה קלה והארה כשבוחרים */
function kReg(c,r,t,sel,dim){
 const hv=r.hov,sc=1+.045*hv,lift=4*hv,al=Math.min(1,t);
 const bb=r.ub,cp=km2s(r.uc[0],r.uc[1]);
 for(let j=0;j<r.rings.length;j++){
  c.save();c.translate(cp[0],cp[1]-lift-(1-t)*18);c.scale(sc*(.9+.1*t),sc*(.9+.1*t));c.translate(-cp[0],-cp[1]);
  c.globalAlpha=al*dim;
  c.save();kPath(c,r.rings[j],true,0,5);c.fillStyle='rgba(60,40,10,.22)';c.fill();c.restore();
  kPath(c,r.rings[j]);const a=km2s(0,bb[3]),b=km2s(0,bb[2]),g=c.createLinearGradient(0,a[1],0,b[1]);g.addColorStop(0,kShade(r.col,.28));g.addColorStop(.55,r.col);g.addColorStop(1,kShade(r.col,-.16));
  c.globalAlpha=al*dim*(sel?.9:.7);if(hv>.05){c.shadowColor=r.col;c.shadowBlur=26*hv}c.fillStyle=g;c.fill();c.shadowBlur=0;c.globalAlpha=al*dim;
  if(!r.outline){c.lineJoin='round';c.lineWidth=3.4+hv*1.6;c.strokeStyle='rgba(255,255,255,.96)';c.setLineDash(r.dash?[10,6]:[]);c.stroke();c.lineWidth=1.3;c.strokeStyle='rgba(222,168,40,.95)';c.stroke();c.setLineDash([])}
  c.restore()}
 if(r.outline){c.save();c.globalAlpha=al*dim;c.lineJoin='round';c.lineCap='round';for(const [w,s] of[[3.6+hv*1.6,'rgba(255,255,255,.96)'],[1.3,'rgba(222,168,40,.95)']]){c.lineWidth=w;c.strokeStyle=s;for(const e of r.outline){kPath(c,e,false);c.stroke()}}c.restore()}}
function kDraw(now){now=now||performance.now();const W=kc.width,H=kc.height,c=kx;c.direction='rtl';kBase(now);
 const rs=kRegs(kLayer),el=now-kLayerAt,intro=kRM()?1e9:el;
 c.save();kLandP(c);c.clip();
 if(kPrev!=null&&!kRM()){const pf=1-kClamp(el/360,0,1);if(pf>0)kRegs(kPrev).forEach(r=>kReg(c,r,1,false,pf*.9))}
 rs.forEach((r,i)=>{const t=kBack(kClamp((intro-i*(KL[kLayer].tribes?70:110))/520,0,1)),sel=kHov===r||(kSel&&kSel.reg===r);if(t>0)kReg(c,r,t,sel,1-.55*kDim)});
 c.restore();
 kLake(c);
 c.textAlign='center';const sz=Math.max(12,Math.min(26,KV.z/8)),put=[];
 const free=(x,y,w,h)=>{if(put.some(q=>x<q[2]&&x+w>q[0]&&y<q[3]&&y+h>q[1]))return false;put.push([x,y,x+w,y+h]);return true};
 const labs=[];rs.forEach((r,i)=>{if(!r.name)return;const sel=kHov===r||(kSel&&kSel.reg===r),t=kClamp((intro-i*(KL[kLayer].tribes?70:110)-200)/400,0,1);if(t<=0)return;
  r.lbl.forEach((lb,j)=>{const pr=lb.r*KV.z,ok=sel||pr>sz*1.15||(r.lbl.length==1&&pr>sz*.8);if(ok)labs.push({r,lb,sel,t,j})})});
 labs.sort((a,b)=>(b.sel-a.sel)||(b.lb.r-a.lb.r));
 const cp=kCity?km2s(kCity.lon,kCity.lat):null;
 for(const l of labs){const p=km2s(l.lb.lon,l.lb.lat),lift=4*l.r.hov+(1-l.t)*10;if(cp&&Math.hypot(p[0]-cp[0],p[1]-cp[1]-sz)<sz*3.2)continue;c.globalAlpha=l.t*(cp?.6:1);
  if(l.r.tribe){const w=l.r.name.length*sz*.62+10;if(!(l.sel||free(p[0]-w/2,p[1]-sz*1.7,w,sz*3.1)))continue;c.font=sz*1.5+'px "Segoe UI Emoji"';c.fillStyle='#000';EI.fill(c,l.r.t[1],p[0],p[1]-sz*.2-lift,sz*1.7);kText(l.r.name,p[0],p[1]+sz*1.25-lift,sz)}
  else{const w=l.r.name.length*sz*.6;if(l.sel||free(p[0]-w/2,p[1]-sz,w,sz*1.4))kText(l.r.name,p[0],p[1]-lift,sz*.95)}c.globalAlpha=1}
 const ss=KV.z>150;
 KWATER.forEach(w=>{if(KV.z<=170&&w[0]!='ים הגדול')return;const p=km2s(w[1],w[2]),fs=Math.max(11,sz*.6),ww=w[0].length*fs*.6;if(free(p[0]-ww/2,p[1]-fs,ww,fs*1.3))kText(w[0],p[0],p[1],fs,'#01579b','#e1f5fe')});
 // סמלי ערים: קופצים קלות בכניסה ובבחירה
 const cs=kCities(kLayer);c.textAlign='center';kPins=[];
 cs.forEach((s,i)=>{const p=km2s(s.lon,s.lat);if(p[0]<-30||p[1]<-40||p[0]>W+30||p[1]>H+30)return;const sel=kCity===s,t0=kClamp((el-300-i*90)/420,0,1),tp=kRM()?1:kBack(t0);if(t0<=0&&!kRM())return;
  const bob=sel&&!kRM()?Math.abs(Math.sin(now/260))*6:0,r=Math.max(13,Math.min(19,KV.z/9)),y=p[1]-(1-Math.min(tp,1))*26-bob;kPins.push([p[0],p[1],s]);
  if(!sel&&!free(p[0]-r,y-r*1.6,r*2,r*2.2))return;
  c.save();c.globalAlpha=Math.min(1,tp);c.shadowColor='rgba(0,0,0,.35)';c.shadowBlur=6;c.shadowOffsetY=2;c.fillStyle='#fff';c.strokeStyle=sel?'#ff9800':'#e0a92e';c.lineWidth=sel?4:2.5;c.beginPath();c.arc(p[0],y-r*1.0,r,0,6.2832);c.fill();c.shadowBlur=0;c.shadowOffsetY=0;c.stroke();
  c.beginPath();c.moveTo(p[0]-r*.45,y-r*.35);c.lineTo(p[0],y+r*.35);c.lineTo(p[0]+r*.45,y-r*.35);c.fillStyle='#fff';c.fill();
  c.font=Math.round(r*1.15)+'px "Segoe UI Emoji"';c.fillStyle='#000';c.textBaseline='middle';EI.fill(c,s.e,p[0],y-r*.95,r*1.5,true);c.textBaseline='alphabetic';c.restore();
  if(sel||KV.z>210){const fs=Math.max(11,sz*.66),w=s.n.length*fs*.6;if(sel||free(p[0]-w/2,p[1]+3,w,fs*1.4))kText(s.n,p[0],p[1]+fs+3,fs,'#3e2723','#fff')}});
 c.globalAlpha=1}
let kPins=[];

/* ---------- לולאת אנימציה: רק כשהדף פתוח; ים/נצנוץ בקצב נמוך; מכבד prefers-reduced-motion ---------- */
function kQ(){if(!kRaf&&kidOpen)kRaf=requestAnimationFrame(kTick)}
function kTick(now){kRaf=0;if(!kidOpen)return;let busy=false;
 if(kFly){const t=kClamp((now-kFly.t0)/kFly.d,0,1),e=kEase(t);KV.lon=kFly.a.lon+(kFly.b.lon-kFly.a.lon)*e;KV.lat=kFly.a.lat+(kFly.b.lat-kFly.a.lat)*e;KV.z=kFly.a.z*Math.pow(kFly.b.z/kFly.a.z,e);if(t>=1)kFly=null;else busy=true}
 {const tg=kCity?1:0;kDim+=(tg-kDim)*.18;if(Math.abs(tg-kDim)<.01)kDim=tg;else busy=true}
 const rs=kRegs(kLayer);for(const r of rs){const tg=(kHov===r||(kSel&&kSel.reg===r))?1:0;r.hov+=(tg-r.hov)*.22;if(Math.abs(tg-r.hov)<.01)r.hov=tg;else busy=true}
 const el=now-kLayerAt;if(!kRM()&&el<1700)busy=true;if(kCity&&!kRM())busy=true;
 kDraw(now);if(busy)kQ()}
let kIdleT=0;
function kIdleOn(){clearInterval(kIdleT);kIdleT=setInterval(()=>{if(kidOpen&&!kRM()&&!document.hidden)kQ()},90)}
function kFlyTo(lon,lat,z,d){if(kRM()){KV.lon=lon;KV.lat=lat;KV.z=z;kDraw();return}kFly={t0:performance.now(),d:d||750,a:{lon:KV.lon,lat:KV.lat,z:KV.z},b:{lon,lat,z}};kQ()}
function kFitReg(r){let a=1e9,b=-1e9,c=1e9,d=-1e9;r.bb.forEach(q=>{a=Math.min(a,q[0]);b=Math.max(b,q[1]);c=Math.min(c,q[2]);d=Math.max(d,q[3])});
 const z=Math.min(kc.width/((b-a)*COSL*1.6),kc.height/((d-c)*1.6),420);kFlyTo((a+b)/2,(c+d)/2,Math.max(70,z))}

/* ---------- לוחית מידע ---------- */
function kInfo(){const L=KL[kLayer],mp=KLP[kLayer],pic=$('kPic'),ct=kCity,tb=kSel&&kSel.tribe,rg=kSel&&kSel.reg;pic.innerHTML='';pic.onclick=null;pic.classList.remove('go');
 let title,short,full,badge,model=(mp!=null&&(!ct||ct.n=='ירושלים'))?mp:null;
 if(model!=null){const im=mapImg('r_jo'+model,MCOL[model],'🕍');im.classList.add('mmodel');im.setAttribute('role','img');im.setAttribute('aria-label','ירושלים בדגם');pic.appendChild(im);badge='🕍 ירושלים בדגם';pic.onclick=()=>{openKids(false);setPeriod(model)};pic.classList.add('go')}
 else if(ct){pic.appendChild(mapImg(ct.d?'d_'+ct.d:KLD[kLayer],L.c,ct.e));badge=ct.d?'🎨 איור – לא מדויק':'🎨 איור של התקופה'}
 else{pic.appendChild(mapImg(KLD[kLayer],L.c,L.e));badge='🎨 איור'}
 if(ct){title=ct.e+' '+ct.n;short=ct.t;full=['<p class="ksrc">📍 מיקום משוער. '+ct.src+'</p>']}
 else if(tb){title=tb[1]+' '+tb[0];short=mShort(tb[5]);full=['<p>'+tb[5]+'</p>']}
 else if(rg){title=rg.name||L.n;short=mShort(L.txt[0]);full=L.txt.map(t=>'<p>'+t+'</p>')}
 else{title=L.e+' '+L.n;short=mShort(L.txt[0]);full=L.txt.map(t=>'<p>'+t+'</p>')}
 const cp=document.createElement('div');cp.className='mcap';cp.textContent=badge;pic.appendChild(cp);
 $('kT').textContent=title;$('kD').textContent=short;$('kFull').innerHTML=full.join('');
 $('kMore').style.display=(ct||full.join(' ').replace(/<[^>]+>/g,'').length>short.length+4)?'inline-block':'none';
 $('kBack').style.display=(ct||kSel)?'inline-block':'none';
 $('kS').innerHTML=!kSel&&!ct&&L.tribes?'<div class="khint">👆 בחרו שבט</div>':'';
 $('kList').innerHTML=L.tribes?TRIBES.map((t,i)=>`<button style="background:${t[2]}" data-i="${i}">${t[1]} ${t[0]}</button>`).join(''):(L.regs||[]).filter(s=>s[1]).map(s=>`<span class="kd"><i style="background:${s[0]}"></i>${s[1]}</span>`).join('');
 document.querySelectorAll('#kList button').forEach(b=>b.onclick=()=>kPickReg(kRegs(kLayer)[+b.dataset.i],true));
 document.querySelectorAll('#kbtns button').forEach((b,i)=>b.classList.toggle('on',i==kLayer));
 document.querySelectorAll('#kcities button').forEach(b=>b.classList.toggle('on',!!ct&&b.dataset.n==ct.n));
 const on=document.querySelector('#kbtns button.on');if(kidOpen&&on&&on.scrollIntoView)try{on.scrollIntoView({inline:'center',block:'nearest'})}catch(e){}}
function kCityStrip(){const box=$('kcities');box.innerHTML='';kCities(kLayer).forEach(c=>{const b=document.createElement('button');b.className='kcc';b.dataset.n=c.n;b.setAttribute('aria-label',c.n);
  const im=c.d?mapImg('d_'+c.d,KL[kLayer].c,c.e):mapImg('',KL[kLayer].c,c.e);b.appendChild(im);const t=document.createElement('b');t.textContent=c.n;b.appendChild(t);
  b.onclick=()=>kPickCity(c);box.appendChild(b)})}
function kPickCity(c){kCity=c;kSel=null;kInfo();kFlyTo(c.lon,c.lat+.04,Math.max(KV.z,430));const on=document.querySelector('#kcities button.on');if(on&&on.scrollIntoView)try{on.scrollIntoView({inline:'center',block:'nearest'})}catch(e){}kQ()}
function kPickReg(r,fly){if(!r){kSel=null;kCity=null;kInfo();kQ();return}kCity=null;const t=r.tribe?r.t:null;kSel={reg:r,tribe:t};if(fly)kFitReg(r);kInfo();kQ()}
function kReset(){kSel=null;kCity=null;const a={lon:KV.lon,lat:KV.lat,z:KV.z};kFit();const b={lon:KV.lon,lat:KV.lat,z:KV.z};KV.lon=a.lon;KV.lat=a.lat;KV.z=a.z;kInfo();kFlyTo(b.lon,b.lat,b.z);kQ()}
function kSetLayer(i){if(i==kLayer)return;kPrev=kLayer;kLayer=i;kLayerAt=performance.now();kSel=null;kCity=null;kHov=null;kFly=null;kCityStrip();kInfo();kQ()}
function kSize(){const r=kc.parentElement.getBoundingClientRect();kc.width=Math.max(200,Math.round(r.width));kc.height=Math.max(200,Math.round(r.height));kFit();kDraw()}
function openKids(on){if(on&&typeof stopTour=='function')stopTour();kidOpen=on;$('kidov').style.display=on?'flex':'none';if(on){kSize();kLayerAt=performance.now();kPrev=null;kCityStrip();kInfo();kIdleOn();kQ()}else{clearInterval(kIdleT);kFly=null}}
function kPick(x,y){for(let i=kPins.length-1;i>=0;i--){const p=kPins[i];if(Math.hypot(p[0]-x,p[1]-y)<26||Math.hypot(p[0]-x,p[1]-y+18)<24)return{city:p[2]}}
 const m=ks2m(x,y),rs=kRegs(kLayer);for(let i=rs.length-1;i>=0;i--)for(const p of rs[i].rings)if(inPoly(p,m[0],m[1])&&inPoly(KGEOM.land,m[0],m[1]))return{reg:rs[i]};return null}
const KG=mapGest(kc,KV,[50,1100],()=>{kFly=null;kDraw()},(x,y)=>{const h=kPick(x,y);if(h&&h.city)kPickCity(h.city);else if(h)kPickReg(h.reg,false);else kPickReg(null)},(x,y)=>{const h=kPick(x,y),r=h&&h.reg||null;if(r!==kHov){kHov=r;kc.style.cursor=h?'pointer':'grab';kQ()}});
kc.addEventListener('pointerdown',()=>{kFly=null});
addEventListener('resize',()=>{if(kidOpen)kSize()});
KL.forEach((l,i)=>{const b=document.createElement('button');b.className='mcard';b.style.setProperty('--c',l.c);b.setAttribute('aria-label',l.n);
 b.appendChild(mapImg(KLD[i],l.c,l.e));const t=document.createElement('b');t.textContent=KLS[i];b.appendChild(t);
 b.onclick=()=>kSetLayer(i);$('kbtns').appendChild(b)});
$('bKids').onclick=()=>openKids(true);$('kidX').onclick=()=>openKids(false);$('kFit').onclick=()=>kReset();$('kBack').onclick=()=>kReset();
$('kzIn').onclick=()=>KG.zoom(1.4);$('kzOut').onclick=()=>KG.zoom(1/1.4);
$('kMore').onclick=()=>{const o=$('kside').classList.toggle('open');$('kMore').textContent=o?'🔼 פחות':'📖 עוד'};
