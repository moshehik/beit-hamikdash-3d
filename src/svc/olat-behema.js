/* סדר העבודה: עולת בהמה (קרבן יחיד, כבש) – סמיכה, שחיטה, קבלה וזריקה, הפשט וניתוח, הולכה, מליחה והקטרה (ויקרא א; משנה זבחים ה:ד, ו:ג; רמב״ם מעשה הקרבנות ג, ה–ו) */
{const V=SVL,H=SVH,L=V.L,AX=V.AX,AZ=V.AZ,TOP=V.TOP,view=H.view,R=L.rings;
 const Px=R.x[1],Pz=R.z[3];                                           // מקום השחיטה: צפון המזבח, בשורת הטבעות
 const px=Px,pz=L.pillars.z[0],tx=R.x[1],tz=L.tables.z[0];            // עמוד ננס (תליית הבהמה) ושולחן שיש
 const fireT=[V.big[0],V.big[1],YA+13],NE=V.yesodNE,SW=V.yesodSW;
 const dr=(i)=>[AX-6+i*1.3,V.ramp.foot-5+(i%2)*1.4];                  // מקומות הנחת הנתחים בחצי התחתון של הכבש, במערבו
 const lane=i=>V.E-1.5+i*1.5;
 const bloodFace=(id,x,z,y,face)=>({spawn:'blood',id,at:[x,z,y],face,opts:{w:.9,h:1.5}});
 SERVICES.push({id:'olat-behema',name:'עולת בהמה (קרבן יחיד)',cat:'קרבנות',src:'ויקרא א:ג–ט · משנה זבחים ה:ד, ו:ג · רמב״ם מעשה הקרבנות ג, ה–ו',
  actors:{ow:{kind:'o',color:0x7a9a6a},k1:'k',k2:'k',k3:'k',k4:'k'},main:'k1',
  start:{ow:{at:[8,Pz+1.5],face:'w'},k1:{at:[Px+3.5,Pz+4],face:'w'},k2:{at:[Px-3.5,Pz+4],face:'e'},k3:{at:[Px+4.5,Pz-3],face:'w'},k4:{at:[Px-4.5,Pz-3],face:'e'}},
  items:[{spawn:'sheep',id:'a1',at:[6.5,Pz],face:'w'}],
  steps:[
   {text:'הבעלים מביא את העולה לעזרה – כאן כבש זכר תמים בן שנה. עולה היא קודש קדשים, ולכן שחיטתה בצפון המזבח.',src:'ויקרא א:ג, יא · משנה, זבחים ה:ד',cam:view(Px+2,Pz,YA+1,26,10,60),
    actions:[{who:'ow',pose:'rh'},[{who:'ow',walk:[[Px+2.4,Pz+1.6]],speed:3.2,face:'w'},{move:'a1',to:[Px,Pz],speed:3.2,face:'s'}],{who:'ow',face:'w'}]},
   {text:'הבעלים סומך את שתי ידיו בכל כוחו על ראש הכבש, בין קרניו, ומתודה על העולה: עון עשה ועון לא תעשה שנתק לעשה. הוא עומד במזרח ופניו למערב.',src:'ויקרא א:ד · רמב״ם מעשה הקרבנות ג:יג–טו',cam:view(Px+1,Pz+1.2,YA+2,9,4,70),
    actions:[{who:'k1',pose:'rh'},{who:'k1',take:'knife',hand:'R'},{who:'ow',walk:[[Px+1.3,Pz+1.4]],speed:2.5,face:'w'},{who:'ow',pose:'both'},{who:'ow',anim:'press',dur:2.2},{wait:.4},{who:'ow',pose:'idle'}]},
   {text:'שוחטים אותו: ראשו לדרום ופניו למערב, והשוחט עומד במזרח ופניו למערב. לא כופתים אותו אלא אוחזים בו. השוחט חותך את הסימנים (שנים או רוב שנים), והמקבל נוטל את הדם בכלי שרת – במזרק – ומתכוון לקבל את כל הדם.',src:'משנה, תמיד ד:א · רמב״ם מעשה הקרבנות ד:ח, תמידין א:י',cam:view(Px,Pz+1,YA+1,8,3.5,80),
    actions:[{who:'ow',walk:[[Px+5,Pz+3]],speed:3.5,face:'w'},[{item:'a1',state:'lay',dur:1.2},{who:'k3',walk:[[Px+1.3,Pz-.9]],speed:3,face:'w'},{who:'k4',walk:[[Px-1.4,Pz-.9]],speed:3,face:'e'},{who:'k3',pose:'both'},{who:'k4',pose:'both'},{who:'k1',walk:[[Px+1.5,Pz+1.1]],speed:3,face:'w'},{who:'k2',pose:'rh'},{who:'k2',take:'mizrak',id:'mz',opts:{blood:true},hand:'R'},{who:'k2',walk:[[Px-.3,Pz+2.5]],speed:3,face:'n'}],
     {who:'k1',anim:'slaughter',dur:1.4},{spawn:'pool',id:'pl',opts:{r:.7},at:[Px-.4,Pz+1.7]},{wait:.6},{who:'k3',pose:'idle'},{who:'k4',pose:'idle'}]},
   {text:'קבלה וזריקה: המקבל מוליך את המזרק אל המזבח, ל"קרן מזרחית־צפונית", וזורק שם – מחצי המזבח ולמטה – את המתנה הראשונה, כך שהדם מקיף את הקרן ונמצא על שני קירותיה.',src:'משנה, זבחים ה:ד · רמב״ם מעשה הקרבנות ה:ו',cam:view(NE[0]-2,NE[1],YA+2,15,5,40),
    actions:[{who:'k2',walk:[[Px+8,Pz+2],[NE[0],Pz+8],[NE[0],NE[1]]],speed:5,face:[AX+16,AZ-16]},{who:'k2',anim:'zerika',dur:.9},bloodFace('bn',AX+14.6,AZ-15.04,YA+3,0),bloodFace('be',AX+15.04,AZ-14.6,YA+3,'e')]},
   {text:'משם הוא מקיף את המזבח (צפון, מערב) ובא ל"קרן מערבית־דרומית", וזורק את המתנה השנייה – שתי מתנות שהן ארבע. את שירי הדם הוא שופך על היסוד הדרומי של המזבח.',src:'משנה, זבחים ה:ד · רמב״ם מעשה הקרבנות ה:ו',cam:view(SW[0]+2,SW[1]-1,YA+2,20,6,300),
    actions:[{who:'k2',walk:[[NE[0],AZ-20],[SW[0],AZ-20],[SW[0],SW[1]]],speed:5.5,face:[AX-16,AZ+16]},{who:'k2',anim:'zerika',dur:.9},bloodFace('bs',AX-14.6,AZ+15.04,YA+3,0),bloodFace('bw',AX-15.04,AZ+14.6,YA+3,'e'),
     {who:'k2',walk:[[V.yesodS[0],V.yesodS[1]+1.8]],speed:4,face:'n'},{who:'k2',anim:'sprinkle',dur:.9},{spawn:'pool',id:'pl2',opts:{r:.5},at:[V.yesodS[0],V.yesodS[1]+.3]},{remove:'mz'},{who:'k2',pose:'idle'}]},
   {text:'הפשט: מוליכים את הבהמה אל העמודים הננסים של בית המטבחיים; תולים אותה בווים (נוקבים מתוך ערכובה ולא שוברים את הרגל), ומפשיטים עד החזה. את העור מקבלים כהני המשמר.',src:'משנה, תמיד ד:ב · מידות ג:ה · רמב״ם מעשה הקרבנות ו:ה',cam:view(px+1.4,pz,YA+2,12,5,60),
    actions:[[{who:'k1',walk:[[px+3,pz+3]],speed:6,face:'w'},{who:'k3',walk:[[px+1.5,pz+1.5]],speed:6,face:'w'}],{remove:['pl','pl2']},{move:'a1',to:[px+1.4,pz],speed:20,face:'s'},{item:'a1',state:'hung',dur:1.3},{who:'k3',pose:'both'},{who:'k3',anim:'press',dur:1.6},{item:'a1',state:'skinned'},{who:'k3',pose:'idle'}]},
   {text:'ניתוח: חותכים את הראש, הכרעיים, הידיים והרגל הימנית, קורעים, מוציאים את הפדר, ומדיחים את הקרבים בבית המדיחין. נתחי הכבש: ראש ורגל, שתי הידיים, עקץ ורגל, חזה וגרה, שתי דפנות, והקרבים. ועוד הסלת והיין של נסכיו – שמונה נושאים.',src:'משנה, תמיד ד:ב–ג · רמב״ם מעשה הקרבנות ו:ה–ט, י–יז',cam:view(tx,tz,YA+2,14,6,50),
    actions:[{remove:'a1'},{spawn:'meat',id:'p1',opts:{kind:'head'},at:[tx-1.2,tz,YA+2.4]},{spawn:'meat',id:'p2',opts:{kind:'leg'},at:[tx,tz,YA+2.4]},{spawn:'meat',id:'p3',opts:{kind:'legs'},at:[tx+1.2,tz,YA+2.4]},{spawn:'meat',id:'p4',at:[tx-1.2,tz-1,YA+2.4]},{spawn:'meat',id:'p5',at:[tx,tz-1,YA+2.4]},{spawn:'meat',id:'p6',opts:{kind:'entrails'},at:[tx+1.2,tz-1,YA+2.4]},
     {who:'k1',walk:[[tx-1.6,tz+2]],speed:5,face:'n'},{who:'k2',walk:[[tx+.2,tz+2]],speed:5,face:'n'},{who:'k3',walk:[[tx+2,tz+2]],speed:5,face:'n'},{who:'k4',walk:[[tx+3.6,tz+2]],speed:5,face:'n'},
     [{who:'k1',pose:'hold'},{who:'k2',pose:'hold'},{who:'k3',pose:'hold'},{who:'k4',pose:'hold'}],
     {who:'k1',take:'p1',hand:'R'},{who:'k1',take:'p2',hand:'L'},{who:'k2',take:'p3',hand:'R'},{who:'k2',take:'p4',hand:'L'},{who:'k3',take:'p5',hand:'R'},{who:'k3',take:'p6',hand:'L'},{who:'k4',take:'bowl',id:'ns',opts:{fill:'solet'},hand:'R'},{who:'k4',take:'flask',id:'wn',hand:'L'},{wait:.8}]},
   {text:'הולכים את האיברים אל הכבש ונותנים אותם בחציו התחתון, במערבו – ושם מולחים אותם במלח, כי "על כל קרבנך תקריב מלח".',src:'רמב״ם מעשה הקרבנות ו:ד · משנה, תמיד ד:ג · ויקרא ב:יג',cam:view(AX-6,V.ramp.foot-4,YA+1,24,9,290),
    actions:[[1,2,3,4].map(i=>({who:'k'+i,walk:[[-46,tz+2],[-46,V.ramp.foot-12],[dr(2*i-2)[0]-1.4,dr(2*i-2)[1]+.5,SV.rampY(dr(2*i-2)[1])]],speed:6,face:'e'})),
     ...[[1,'p1','p2'],[2,'p3','p4'],[3,'p5','p6'],[4,'ns','wn']].map(([i,a,b])=>({seq:[{who:'k'+i,drop:a,at:[dr(2*i-2)[0],dr(2*i-2)[1],SV.rampY(dr(2*i-2)[1])]},{who:'k'+i,drop:b,at:[dr(2*i-1)[0],dr(2*i-1)[1],SV.rampY(dr(2*i-1)[1])]},{who:'k'+i,pose:'rh'},{who:'k'+i,anim:'sprinkle',dur:1}]}))]},
   {text:'אחר כך מעלים את האיברים בכבש – עולים דרך ימין – אל ראש המזבח.',src:'רמב״ם מעשה הקרבנות ו:ד · משנה, זבחים ו:ג',cam:view(V.E,V.ramp.foot-12,YA+5,28,10,70),
    actions:[...[[1,'p1','p2'],[2,'p3','p4'],[3,'p5','p6'],[4,'ns','wn']].map(([i,a,b])=>[{who:'k'+i,pose:'hold'},{who:'k'+i,take:a,hand:'R'},{who:'k'+i,take:b,hand:'L'}]).flat(),
     [1,2,3,4].map(i=>({who:'k'+i,walk:[...H.upPts(lane(i-1)).slice(0,2),[AX+2+2*(i-1),V.topS,TOP]],speed:5,face:'n'}))]},
   {text:'בראש המזבח מסירים את גיד הנשה ומשליכים אותו על הדשן שבאמצע; זורקים את כל האיברים על האש וערכים אותם עליה, כדי שהכול יעלה כליל: "והקטיר הכהן את הכל המזבחה עולה". ואחריהם הנסכים: הסלת נזרקת על האש, והיין נסוך בקרן דרומית־מערבית.',src:'ויקרא א:ט · רמב״ם מעשה הקרבנות ו:א, ד, טז · משנה, זבחים ו:ב',cam:view(AX+4,AZ+10,TOP,22,10,20),
    actions:[[1,2,3].map(i=>({seq:[{who:'k'+i,anim:'zerika',dur:.9},{move:['p1','p3','p5'][i-1],to:fireT,dur:.7},{remove:['p1','p3','p5'][i-1]},{who:'k'+i,anim:'zerika',dur:.9},{move:['p2','p4','p6'][i-1],to:fireT,dur:.7},{remove:['p2','p4','p6'][i-1]}]})),
     {who:'k4',anim:'zerika',dur:.9},{move:'ns',to:fireT,dur:.7},{remove:'ns'},{who:'k4',walk:[[AX-12.3,V.topS,TOP]],speed:4,face:'w'},{who:'k4',pose:'rh'},{who:'k4',anim:'sprinkle',dur:1.1},{remove:'wn'}]},
   {text:'הכהנים יורדים בכבש – "ויורדין דרך שמאל" – והעולה כולה כליל לה\'. הבעלים נתכפר לו, "ונרצה לו לכפר עליו".',src:'משנה, זבחים ו:ג · ויקרא א:ד · רמב״ם מעשה הקרבנות ו:א',cam:view(V.W,V.ramp.foot-10,YA+6,30,12,300),
    actions:[...[1,2,3,4].map(i=>({who:'k'+i,pose:'idle'})),[1,2,3,4].map(i=>({who:'k'+i,walk:[...H.downPts(V.W-1.5+(i-1)*1.2)],speed:5,face:'s'}))]}
  ]})}
