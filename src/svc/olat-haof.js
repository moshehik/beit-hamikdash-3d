/* סדר העבודה: עולת העוף – מליקה בקרן דרומית־מזרחית (משנה זבחים ו:ג–ו; רמב״ם מעשה הקרבנות ו:כ–כג) */
{const V=SVL,H=SVH,AX=V.AX,AZ=V.AZ,SOV=V.SOV,TOP=V.TOP,sovS=V.sovS;
 const view=(x,z,y,d,h,az)=>({at:[x,y,z],d,h,az});
 const fireT=[V.big[0],V.big[1],YA+13];                    // המערכה הגדולה (בגובה הלהבות)
 SERVICES.push({id:'olat-haof',name:'עולת העוף – מליקה',cat:'קרבנות',src:'משנה זבחים ו:ג–ו · רמב״ם מעשה הקרבנות ו:כ–כג',
  actors:{ow:{kind:'o',color:0x6e8aa8},k:'k'},main:'k',
  start:{ow:{at:[V.E+10,V.ramp.foot+7],face:'w',pose:'idle'},k:{at:[V.E-4,V.ramp.foot+7],face:'e',pose:'idle'}},
  steps:[
   {text:'הבעלים מביא תור או בן יונה ונותנו לכהן. עוף אינו טעון סמיכה.',src:'רמב״ם, מעשה הקרבנות ג:ז',cam:view(V.E,V.ramp.foot+7,YA+2,22,9,40),
    actions:[{who:'ow',pose:'rh'},{who:'ow',take:'dove',id:'b',opts:{scale:1.6},hand:'R'},{who:'ow',walk:[[V.E+1.2,V.ramp.foot+7]],speed:3},{who:'k',pose:'rh'},{who:'k',face:'e'},[{who:'ow',anim:'rise',dur:1.2}],{who:'ow',give:'b',to:'k',hand:'R'},{who:'ow',pose:'idle'},{who:'ow',walk:[[V.E+10,V.ramp.foot+7]],speed:3,face:'w'}]},
   {text:'הכהן עולה בכבש הגדול. "כל העולים למזבח עולין דרך ימין" – הוא עולה בצד הימני (המזרחי) של הכבש.',src:'משנה, זבחים ו:ג',cam:view(V.E,V.ramp.foot-8,YA+5,26,10,70),
    actions:[{who:'k',walk:[[V.E,V.ramp.foot+1.5,YA],[V.E,V.ramp.top+10.3,YA+6]],speed:4.5}]},
   {text:'בראש הכבש הוא "פונה לסובב": עובר לכבש הקטן שבצידו המזרחי ומשם אל הסובב, ומהלך עליו עד הקרן הדרומית־מזרחית.',src:'משנה, זבחים ו:ה · רמב״ם, בית הבחירה ב:יד',cam:view(V.sovE-3,V.sovS,SOV,16,7,35),
    actions:[{who:'k',walk:[...H.smallUp('e').slice(1),[V.sovE-.8,sovS,SOV]],speed:4.5,face:'n'}]},
   {text:'בקרן דרומית־מזרחית הוא מולק את ראש העוף בצפורן ממול העורף ומבדילו מן הגוף. בחטאת מולקים בלי להבדיל; בעולה מבדילים (ולפי הרמב״ם, אם לא הבדיל – פסולה).',src:'משנה, זבחים ו:ה · רמב״ם ו:כ, כג',cam:view(V.sovE-1.5,sovS,SOV+2.8,9,2.5,30),
    actions:[{who:'k',anim:'press',dur:1.4},{who:'k',pose:'lh'},{spawn:'meat',id:'hd',opts:{kind:'chunk',scale:.22},at:[V.sovE-1.3,sovS,SOV+3]},{wait:.3},{who:'k',take:'hd',hand:'L'},{item:'b',on:true}]},
   {text:'הוא ממצה את דם הראש ואת דם הגוף על קיר המזבח – למעלה מחוט הסיקרא האדום. אם מצה את דם הראש ולא את דם הגוף – העולה פסולה.',src:'משנה, זבחים ו:ה–ו · רמב״ם ו:כ',cam:view(V.sovE-1.5,sovS,SOV+3,8,2,20),
    actions:[{who:'k',pose:'both'},{who:'k',anim:'sprinkle',dur:.9},{spawn:'blood',id:'b1',at:[AX+13.3,AZ+14.04,SOV+1.7],opts:{w:.6,h:.7}},{wait:.4},{spawn:'blood',id:'b2',at:[AX+12.2,AZ+14.04,SOV+1.2],opts:{w:.5,h:.9}}]},
   {text:'הוא נוטל את הראש, מקיף את מקום המליקה אל המזבח, סופגו במלח וזורקו על גבי האשים.',src:'משנה, זבחים ו:ה · רמב״ם ו:כא',cam:view(AX+4,AZ+12,TOP,26,12,40),
    actions:[{who:'k',pose:'lh'},{who:'k',walk:[[V.sovE-8,sovS,SOV],...H.smallDown('e').reverse().slice(0,0),[V.smallE,sovS,SOV],[V.smallE,V.ramp.top+10.3-.5,SOV],[V.E,V.ramp.top+10.3,SOV+.1],[V.E,V.ramp.top+1,TOP-.4],[V.E,V.topS,TOP],[V.E-6,V.topS,TOP]],speed:4.5,face:'n'},
     {who:'k',anim:'sprinkle',dur:.8},{who:'k',anim:'zerika',dur:.9},{move:'hd',to:fireT,dur:.8},{remove:'hd'}]},
   {text:'הוא חוזר אל הגוף ומסיר את המראה (הזפק), את הנוצה ואת בני המעיים היוצאים עמה, ומשליכם לבית הדשן – מקום מזרחית לכבש, צמוד לדופנו וכעשר אמות צפונה מתחתיתו.',src:'משנה, זבחים ו:ה · תמיד א:ד · רמב״ם ו:כא',cam:view(V.deshen[0]+1,V.deshen[1],YA+2,28,11,70),
    actions:[{who:'k',pose:'hold'},{who:'k',walk:[...H.downPts(V.W),...H.toDeshen(V.W)],speed:5,face:'w'},{spawn:'meat',id:'cr',opts:{kind:'entrails',scale:.5},at:[V.deshen[0]+1.2,V.deshen[1]+1.2]},{who:'k',anim:'bow',dur:1.1},{spawn:'coals',id:'dp',opts:{s:.8},at:[V.deshen[0],V.deshen[1]+.2]}]},
   {text:'הכהן חוזר ועולה בכבש, ובראש המזבח משסע את הגוף בכנפיו בידו, בלי סכין ובלי להבדיל (ואם הבדיל – כשר), סופגו במלח וזורקו על גבי האשים.',src:'משנה, זבחים ו:ה · רמב״ם ו:כב',cam:view(AX+4,AZ+12,TOP,24,11,30),
    actions:[{who:'k',walk:[...H.fromDeshen(V.E),...H.upPts(V.E),[V.E-6,V.topS,TOP]],speed:5.5,face:'n'},{who:'k',pose:'both'},{who:'k',anim:'press',dur:1.2},{who:'k',anim:'sprinkle',dur:.8},{who:'k',anim:'zerika',dur:.9},{item:'b',on:false}]},
   {text:'כך מתכלה כל העוף על האש לריח ניחוח, והכהן יורד מן המזבח – דרך שמאל, בצד המערבי של הכבש.',src:'ויקרא א:יז · משנה, זבחים ו:ג',cam:view(V.W,V.ramp.foot-10,YA+6,30,12,300),
    actions:[{who:'k',pose:'idle'},{who:'k',walk:[...H.downPts(V.W)],speed:5,face:'s'}]}
  ]})}
