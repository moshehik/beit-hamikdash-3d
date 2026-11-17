/* סדר העבודה: מנחת סולת – בלילה, הגשה בקרן דרומית־מערבית, קמיצה, הקטרת הקומץ ואכילת השיריים (ויקרא ב, ו:ז–י; משנה זבחים ו:א; רמב״ם מעשה הקרבנות יג:ה, יב–יד) */
{const V=SVL,H=SVH,AX=V.AX,AZ=V.AZ,TOP=V.TOP,view=H.view,SW=V.yesodSW;
 const S=[AX-14,AZ+24],K2=[AX-25,AZ+5],fireT=[V.big[0],V.big[1],YA+13];
 SERVICES.push({id:'minchat-solet',name:'מנחת סולת – קמיצה והקטרה',cat:'מנחות',src:'ויקרא ב:א–ג · משנה זבחים ו:א · רמב״ם מעשה הקרבנות יג:ה, יב–יד',
  actors:{ow:{kind:'o',color:0x9a7a5a},k1:'k',k2:'k'},main:'k1',
  start:{ow:{at:[S[0]-12,S[1]+4],face:'e'},k1:{at:S,face:'w'},k2:{at:K2,face:'e'}},
  items:[{spawn:'bowl',id:'lv',opts:{fill:'levonah',r:.3},at:[S[0]+1.6,S[1]+1]}],
  steps:[
   {text:'המביא מנחה מביא סלת (קמח חיטים) מביתו, שמן וגם לבונה, בכלי – ומוסר אותם לכהן. כאן מנחת סלת שהיא מן המנחות הנקמצות.',src:'ויקרא ב:א · רמב״ם מעשה הקרבנות יג:יב',cam:view(S[0]-5,S[1]+2,YA+2,20,8,70),
    actions:[{who:'ow',pose:'hold'},{who:'ow',take:'bowl',id:'b0',opts:{fill:'solet',r:.4},hand:'R'},{who:'ow',take:'jar',id:'jr',opts:{col:0xd6b24a},hand:'L'},{who:'ow',walk:[[S[0]-2,S[1]+.5]],speed:3.2,face:'e'},{who:'k1',pose:'hold'},{who:'ow',anim:'rise',dur:1},{who:'ow',give:'b0',to:'k1',hand:'R'},{who:'ow',give:'jr',to:'k1',hand:'L'},{who:'ow',pose:'idle'},{who:'ow',walk:[[S[0]-12,S[1]+4]],speed:3.2,face:'e'}]},
   {text:'מעשה המנחה: נותן שמן בכלי, אחר כך את הסלת, ועוד שמן על הסלת, ובולל את הסלת בשמן. לוג שמן לכל עשרון.',src:'רמב״ם מעשה הקרבנות יג:ה, יד',cam:view(S[0],S[1],YA+2,9,4,60),
    actions:[{who:'k1',face:'s'},{who:'k1',anim:'sprinkle',dur:1.1},{who:'k1',anim:'press',dur:1.6},{who:'k1',anim:'sprinkle',dur:1}]},
   {text:'נותנה בכלי שרת, יוצק לתוכה שמן, ונותן עליה את לבונתה – מקדשה בכלי שרת. (הלבונה נשארת בצד.)',src:'רמב״ם מעשה הקרבנות יג:ה, יב',cam:view(S[0],S[1],YA+2,9,4,60),
    actions:[{who:'k1',drop:'b0',at:[S[0]+1,S[1]+.6]},{remove:['jr']},{who:'k1',take:'bowl',id:'ks',opts:{fill:'solet',r:.4,col:0xf0c040},hand:'R'},{who:'k1',anim:'sprinkle',dur:.9}]},
   {text:'הכהן מוליכה אל המזבח ומגישה בקרן דרומית־מערבית "כנגד חדה של קרן" – נוגע בה בכלי – ודיו.',src:'רמב״ם מעשה הקרבנות יג:יב · משנה, זבחים ו:ב',cam:view(SW[0],SW[1]-1,YA+2,16,6,290),
    actions:[{who:'k1',walk:[[SW[0],SW[1]]],speed:4.5,face:[AX-16,AZ+16]},{who:'k1',anim:'rise',dur:1.2},{wait:.4}]},
   {text:'קמיצה: מסלק את כל הלבונה לצד אחד, וקומץ בשלוש אצבעותיו – פושט את אצבעותיו על פס ידו, "כדרך שקומץ כל אדם", לא בראשי האצבעות – ממקום ששמנה מרובה. הקומץ ניתן בכלי שרת ומתקדש, ואחר כך מלקט את כל הלבונה ונותנה עליו.',src:'רמב״ם מעשה הקרבנות יג:יב–יד · ויקרא ב:ב',cam:view(SW[0]+1,SW[1],YA+2,8,4,300),
    actions:[{who:'k1',anim:'press',dur:1.4},{who:'k1',pose:'rh'},{who:'k1',take:'bowl',id:'kz',opts:{fill:'solet',r:.2,col:0xf0c040},hand:'L'},{wait:.6},{remove:'lv'},{who:'k1',anim:'press',dur:.9},{remove:'kz'},{who:'k1',take:'bowl',id:'kz2',opts:{fill:'levonah',r:.2,col:0xf0c040},hand:'L'}]},
   {text:'הכהן מעלה את הקומץ והלבונה על המזבח (בכבש), מולחו – "על כל קרבנך תקריב מלח" – ונותנו על גבי האשים מכלי שרת. הקומץ הוא ה"אזכרה" לה\'.',src:'רמב״ם מעשה הקרבנות יג:יב · ויקרא ב:ב, יג',cam:view(AX+4,AZ+10,TOP,22,10,20),
    actions:[{who:'k1',walk:[[V.W-6,V.ramp.foot+6],...H.upPts(V.E),[V.big[0]-2,V.topS,TOP]],speed:5.5,face:'n'},{who:'k1',anim:'sprinkle',dur:.9},{who:'k1',anim:'zerika',dur:.9},{move:'kz2',to:fireT,dur:.7},{remove:'kz2'}]},
   {text:'השיריים – שארית המנחה – נאכלים לכהנים: "מצות תאכל במקום קדוש בחצר אהל מועד". נאכלים לפנים מן הקלעים (בעזרה), לזכרי כהנה, בכל מאכל – כמצה – ליום ולילה עד חצות.',src:'ויקרא ו:ט–י · משנה, זבחים ו:א',cam:view(K2[0]+2,K2[1],YA+2,15,6,80),
    actions:[{who:'k1',pose:'hold'},{who:'k1',walk:[...H.downPts(V.W).slice(0,2),[V.W-12,V.ramp.foot-6],[K2[0]+2.2,K2[1]]],speed:5.5,face:'w'},{who:'k1',walk:[[K2[0]+2.2,K2[1]]],face:'w'},{who:'k2',pose:'hold'},{who:'k1',give:'ks',to:'k2',hand:'R'},{who:'k2',anim:'rise',dur:1},{remove:'ks'},{who:'k2',take:'loaf',hand:'R'},{who:'k2',pose:'rh'},{who:'k2',anim:'press',dur:1.4}]}
  ]})}
