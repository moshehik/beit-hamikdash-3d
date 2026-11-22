/* ================= נגן "סדרי עבודה" – מנוע אנימציה מונחה־תסריט =================
 תסריט = אובייקט נתונים בקובץ נפרד src/svc/<שם>.js שקורא ל-SERVICES.push({...}); build.js כולל אותם אוטומטית (לפי סדר א״ב) לפני ui.js.

 ── מבנה תסריט ──
 SERVICES.push({
  id:'tamid-shachar', name:'תמיד של שחר', cat:'תמידין'|'קרבנות'|'מנחות'|'אחר', src:'מקור הלכתי כללי (מוצג ברשימה)',
  actors:{k1:'k', kg:'g', ow:'o', m:{kind:'k',hair:0x3a2a1e}},   // k=כהן הדיוט, g=כהן גדול בשמונה בגדים, y=כהן גדול ביום הכיפורים, o=ישראל (בעלים) – מוסיפים 'color'
  start:{k1:{at:[x,z],face:'e',pose:'idle'}, ...},               // נקודת פתיחה לכל שחקן (face: n/e/s/w או מעלות; at: [x,z] או [x,z,y])
  main:'k1',                                                    // השחקן שהמצלמה "עוקבת" אחריו (ברירת מחדל: הראשון)
  items:[{spawn:'sheep',id:'a1',at:[x,z]}],                     // (לא חובה) פעולות spawn שמתבצעות בפתיחה/איפוס
  steps:[{text:'הסבר בעברית (משפט-שניים)', src:'מקור קצר', cam:{...}|null, hold:שניות_המתנה_אחרי, actions:[...]}]
 })

 ── מצלמה (cam, בכל שלב; null = ללא שינוי) ──
  {pos:[x,y,z], tgt:[x,y,z]}             מיקום ומטרה מוחלטים
  {at:[x,y,z], d:מרחק, h:גובה, az:כיוון} המצלמה נמצאת במרחק d ובגובה h מעל נקודת המבט at, מהכיוון az (מעלות; 0=מדרום, 90=ממזרח, 180=מצפון, 270=ממערב)
  {follow:'k2'}                           (במצב "עוקב") עובר לעקוב אחרי שחקן אחר
  dur:שניות מעבר (ברירת מחדל 1.8)

 ── פעולות (actions) ── הרשימה ברמה העליונה רצה ברצף; איבר שהוא מערך [a,b,c] = פעולות במקביל (מסתיים כשכולן הסתיימו); {seq:[...]} בתוך מקביל = תת־רצף.
  נקודות על הרצפה הן [x,z] או [x,z,y] (y מוחלט; בלי y – גובה הרצפה מ-floorY, כולל כבשים ומעלות). מידות באמות; x=מזרח, z=דרום, y=גובה.
  כיוון (face/az): 'n','e','s','w' או מעלות (0=דרום/+z, 90=מזרח, 180=צפון, 270=מערב).
  שחקן (who:'id'):
   {who,walk:[[x,z],[x,z,y],...],speed:6,face:'n'}    הליכה לאורך מסלול (האטה בעליה, נדנוד, סיבוב לכיוון ההליכה); face = כיוון בסיום
   {who,face:'w'|[x,z]}                                  סיבוב במקום (אל כיוון או אל נקודה)
   {who,vis:true|false,at:[x,z,y?],face?}                 הופעה/היעלמות (שחקן עם start.hidden:true מתחיל נסתר; vis:false = נכנס לתא/יצא מן הדגם)
   {who,pose:'idle|tray|basket|rake|wave|trumpet|hold|rh|lh|both|up|low|high'}   תנוחת זרועות (rh = זרוע ימין קדימה, lh = שמאל, both = שתי הידים קדימה, hold = כלי בשתי ידיים, up = ידיים למעלה, low = נושא נמוך)
   {who,anim:'bow'|'slaughter'|'zerika'|'sprinkle'|'press'|'lean'|'upright'|'kneel'|'rise', dur, amt}   תנועת גוף קצרה (bow=השתחויה, slaughter=שחיטה, zerika=זריקה, sprinkle=הזאה, press=סמיכה, lean/upright=הטיה ממושכת/יישור, kneel=כריעה)
   {who,take:'מזהה_או_סוג',hand:'R'|'L',id?,opts?}       נטילת אביזר ליד (R=ימין). אם אין אביזר בשם הזה – נוצר חדש מהסוג (id/opts אופציונליים)
   {who,drop:'id',at:[x,z,y?]}                            הנחה במקום (ברירת מחדל: ליד השחקן);  {who,give:'id',to:'k2',hand:'R'} מסירה לשחקן אחר
  אביזרים/בעלי חיים:
   {spawn:'sheep',id:'a1',at:[x,z,y?],face:'w',opts:{...}}   יצירה. סוגים: sheep ram bull goat dove pigeon | knife mizrak tray bowl jar kaf bazach machta kuz tani rake tzenor flask loaf logs torch fire coals meat saltpile blood pool basket cloth lampcap key trumpet broom vtable paskhter
   {move:'id',to:[x,z,y?],speed:5,face:'w',arc:3}            הזזה/הליכה של אביזר או חיה (arc = גובה קשת בנקודת האמצע, לזריקה)
   {item:'id',state:'lay'|'stand'|'hung'|'skinned'|'live',dur} מצב חיה (lay=שוכב על צד שמאל, hung=תלוי בווים, skinned=מופשט)
   {item:'id',on:false}   (לאש/לפיד)   {show:'id'} {hide:'id'}   {remove:'id'|['id',...]}
   {wait:1.5}                                                 המתנה
   {anim:'lay',item:'a1'}  קיצור ל-state
  אפשר להוסיף לכל פעולה dur:שניות.

 ── הערות ──
  הדמויות נוצרות בעת פתיחת התסריט (priest() מ-people.js, עותקים משותפי גיאומטריה לכל תנוחה) ונמחקות בסגירה. כל השלבים ניתנים לדילוג וחזרה: המנוע מאפס ומריץ "קדימה מהירה" דטרמיניסטית.
  קבועים שימושיים: SVL (מיקומי תחנות), SV.rampY(z) = גובה הכבש הגדול בנקודה z.
==================================================================================================== */
const SERVICES=[];
/* ── LAYOUT: מיקומי התחנות במקום אחד. כל התסריטים קוראים מכאן (דרך SVL) בזמן הטעינה – כדי להזיז את המזבח/הכבש/הכיור/בית המטבחיים מספיק לעדכן כאן. ── */
const LAYOUT={
 altar:{x:-26,z:-43},                                  // מרכז המזבח (32×32)
 rampFoot:2.5,rampTop:-28,                             // z של תחילת הכבש הגדול בקרקע ושל סופו למעלה (הכבש בדרום המזבח)
 kiyor:{x:-58,z:-30},                                  // הכיור
 deshen:{dx:9,dz:-10},                                  // בית הדשן (לפי הסרט): צמוד לדופן המזרחית של הכבש (dx ממרכז המזבח; ~3 טפחים מן הכבש), dz אמות צפונה מתחתית הכבש
 rings:{x:[-39,-30,-21,-12],z:[-66,-71,-76,-81,-86,-91]}, // כל x = שורה (עמודה) הנמשכת ממזבח צפונה; בה הטבעות ב-z האלה
 tables:{z:[-95,-100]},pillars:{z:[-106,-112]},       // שולחנות שיש ועמודים ננסין (צפונית לטבעות)
 ulam:{x0:-52,x1:-64},ulamDoor:{x:-66.5,z:ZC},heichalDoor:{x:-80,z:ZC},nicanor:{x:14.5,z:ZC},
 gazit:{x:-25.5,zDoor:-112,zIn:-120,s:-1},   // לשכת הגזית בצפון־מזרח: s = כיוון z פנימה (לפנים מן הפתח); הפתח לעזרה בדרומה
 moked:{x:-76,z:-117,doorX:-56},
 menorah:{x:-100,z:ZC+6},table:{x:-100,z:ZC-6},goldAltar:{x:-116,z:ZC}};
const SVL=(()=>{const L=LAYOUT,AX=L.altar.x,AZ=L.altar.z,R=L.rings;return{L,AX,AZ,TOP:YA+9,SOV:YA+6,
 ramp:{foot:L.rampFoot,top:L.rampTop},E:AX+4,W:AX-4,           // נתיבי עליה (מזרח, ימין) וירידה (מערב, שמאל) בכבש הגדול – "עולין דרך ימין ויורדין דרך שמאל" (זבחים ו:ג)
 smallE:AX+8.5,smallW:AX-8.5,                                  // הכבשים הקטנים (רוחב אמה) בשני צדי הכבש הגדול
 topS:AZ+13,sovS:AZ+14.5,sovE:AX+14.5,sovW:AX-14.5,sovN:AZ-14.5,// מסדרון הכהנים על ראש המזבח, והסובב (מדרגה בגובה SOV)
 big:[AX+6.4,AZ+5.6],tapuach:[AX-.5,AZ+1.2],second:[AX-7.8,AZ+11.2],third:[AX-7.5,AZ-5.6],   // המערכות והתפוח
 deshen:[AX+L.deshen.dx,L.rampFoot+L.deshen.dz],deshenStand:[AX+L.deshen.dx+2.4,L.rampFoot+L.deshen.dz],   // בית הדשן: מזרח הכבש, צמוד לדופנו, כ-10 אמות צפונה מתחתיתו; deshenStand = נקודת עמידה במזרחו
 yesodNE:[AX+17.5,AZ-17.5],yesodSW:[AX-17.5,AZ+17.5],yesodS:[AX-12,AZ+17],   // עמידה בקרקע ליד הקרן ה"מזרחית־צפונית", ה"דרומית־מערבית" והיסוד הדרומי
 kiyor:[L.kiyor.x,L.kiyor.z],kiyorStand:[L.kiyor.x,L.kiyor.z-3.4],
 ringMorn:[R.x[0],R.z[4]],ringEve:[R.x[3],R.z[4]],             // טבעת שנייה (מן הקצה הצפוני) בקרן צפונית־מערבית / צפונית־מזרחית של בית המטבחיים
 tableRow:[R.x[0]+4,L.tables.z[0]],pillar:[R.x[1],L.pillars.z[0]],
 gazit:[L.gazit.x,L.gazit.zDoor],gazitIn:[L.gazit.x,L.gazit.zIn],moked:[L.moked.x,L.moked.z],mokedDoor:[L.moked.doorX,L.moked.z],
 hekDoor:[L.heichalDoor.x,L.heichalDoor.z],ulamDoor:[L.ulamDoor.x,L.ulamDoor.z],menorah:[L.menorah.x,L.menorah.z],table:[L.table.x,L.table.z],goldAlt:[L.goldAltar.x,L.goldAltar.z]}})();
/* עזרים לתסריטים: נקודות מסלול (עם y מפורש, כך שההליכה על הכבש/הסובב אינה תלויה בגובה הרצפה) */
const SVH={
 upPts:(lane)=>{const v=SVL;return[[lane,v.ramp.foot+1.5,YA],[lane,v.ramp.top,YA+9],[lane,v.topS,YA+9]]},          // עליה בכבש הגדול עד מסדרון ראש המזבח
 downPts:(lane)=>{const v=SVL;return[[lane,v.topS,YA+9],[lane,v.ramp.top,YA+9],[lane,v.ramp.foot+1.5,YA]]},       // ירידה
 smallUp:(side)=>{const v=SVL,x=side=='w'?v.smallW:v.smallE,l=side=='w'?v.W:v.E,z0=v.ramp.top+10.3;return[[l,z0,YA+6+.1],[x,z0-.5,YA+6],[x,v.sovS,YA+6]]},   // מן הכבש הגדול (בגובה ~6) אל הכבש הקטן ועד הסובב
 view:(x,z,y,d,h,az)=>({at:[x,y,z],d,h,az}),   // מצלמה: נקודת מבט (x,z,y), מרחק, גובה, כיוון
 smallDown:(side)=>{const v=SVH.smallUp(side);return v.slice().reverse()},
 toDeshen:(lane)=>{const v=SVL;return[[lane,v.ramp.foot+4],[v.deshen[0]+3.4,v.ramp.foot+4],v.deshenStand]},      // מתחתית הכבש (אחרי downPts) אל מזרח הכבש ובית הדשן: מזרחה עד סוף הרוחב ואז צפונה
 fromDeshen:(lane)=>{const v=SVL;return[[v.deshen[0]+3.4,v.ramp.foot+4],[lane,v.ramp.foot+4]]}};
const SV=(()=>{
 const D2R=Math.PI/180,DIR={s:0,e:90,n:180,w:-90},V3=(a,b,c)=>new T.Vector3(a,b,c);
 const dirYaw=d=>(typeof d=='string'?DIR[d]:+d||0)*D2R;
 const ease=k=>k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const angD=(a,b)=>((b-a+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;
 const rampY=z=>YA+9*clamp((SVL.ramp.foot-z)/(SVL.ramp.foot-SVL.ramp.top),0,1);
 const root=new T.Group();root.name='svc';scene.add(root);
 let S=null;            // הסשן הנוכחי
 /* ---------- חומרים וגאומטריה משותפים ---------- */
 const _m={};const mat=(c,o={})=>{const k=c+JSON.stringify(o);return _m[k]||(_m[k]=new T.MeshStandardMaterial(Object.assign({color:c,roughness:.8,metalness:0},o)))};
 const SIL=mat(0xdde1e6,{metalness:.7,roughness:.28,emissive:0x23262a}),GLD=mat(0xf0c040,{metalness:.65,roughness:.3,emissive:0x3a2600}),CU=mat(0xb8782e,{metalness:.65,roughness:.3,emissive:0x2a1608}),
  WOOD=mat(0x7a5230),DARK=mat(0x2a2118),BLOOD=mat(0xa01818,{roughness:.5}),FLESH=mat(0xb4503f,{roughness:.7}),FAT=mat(0xeadfae),WHITE=mat(0xf1ece0),SKIN=mat(0xc99673),
  BASIC=(c,o)=>new T.MeshBasicMaterial(Object.assign({color:c},o||{}));
 const SPH=new T.SphereGeometry(1,14,10),BOX=new T.BoxGeometry(1,1,1),CYL=new T.CylinderGeometry(1,1,1,14),CONE=new T.ConeGeometry(1,1,12);
 const mesh=(geo,m,x=0,y=0,z=0,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.rotation.set(rx,ry,rz);return o};
 const grp=(...c)=>{const g=new T.Group();c.forEach(x=>g.add(x));return g};
 const lathe=(pts,seg=16)=>new T.LatheGeometry(pts.map(p=>new T.Vector2(p[0],p[1])),seg);
 const limb=(a,b,r1,r2,m)=>{const d=V3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),L=d.length(),o=new T.Mesh(new T.CylinderGeometry(r2,r1,L,8),m);o.position.set((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);o.quaternion.setFromUnitVectors(V3(0,1,0),d.normalize());return o};
 /* אש: ספרייט להבה (כמו במזבח) */
 const tFl=cv(64,128,(c,w,h)=>{c.filter='blur(2.2px)';const g=c.createLinearGradient(0,h,0,0);g.addColorStop(0,'rgba(255,236,130,1)');g.addColorStop(.4,'rgba(255,150,30,.96)');g.addColorStop(.78,'rgba(225,70,10,.62)');g.addColorStop(1,'rgba(200,40,0,0)');c.fillStyle=g;
  c.beginPath();c.moveTo(w/2,0);c.bezierCurveTo(w*.72,h*.3,w*1.02,h*.55,w*.8,h*.82);c.bezierCurveTo(w*.7,h*.98,w*.3,h*.98,w*.2,h*.82);c.bezierCurveTo(-w*.02,h*.55,w*.28,h*.3,w/2,0);c.fill()});
 const FLM=new T.SpriteMaterial({map:tFl,transparent:true,depthWrite:false,fog:true});
 const flame=(x,y,z,w,h)=>{const s=new T.Sprite(FLM);s.scale.set(w,h,1);s.position.set(x,y+h*.46,z);s.userData.fl=[w,h];return s};

 /* ---------- אביזרים (פרוצדורליים; מקור הציר = נקודת האחיזה, "קדימה" = +z) ---------- */
 const B={};
 const bowlG=(r,h,fill)=>{const g=grp(mesh(lathe([[0,0],[r*.45,0],[r,h*.55],[r*1.05,h]],18),fill.m,0,0,0));g.children[0].material=fill.m;return g};
 B.knife=()=>{const g=grp(mesh(BOX,WOOD,0,0,-.05,.08,.08,.34),mesh(BOX,SIL,0,0,.5,.03,.13,.95),mesh(BOX,GLD,0,0,.13,.12,.12,.04));g.userData.grip=[0,.02,.1];return g};
 B.mizrak=(o={})=>{const g=grp(mesh(new T.LatheGeometry([[0,0],[.08,.04],[.22,.16],[.34,.3],[.36,.34]].map(p=>new T.Vector2(p[0],p[1])),16),mat(0xf0c040,{metalness:.65,roughness:.3,side:T.DoubleSide,emissive:0x3a2600}),0,-.34,.3));
  if(o.blood)g.add(mesh(new T.CircleGeometry(.33,14),BLOOD,0,-.02,.3,1,1,1,-Math.PI/2));g.userData.grip=[0,0,0];return g};
 B.tray=()=>grp(mesh(CYL,SIL,0,0,0,.55,.04,.55),mesh(new T.TorusGeometry(.55,.03,5,22),SIL,0,.03,0,1,1,1,Math.PI/2));
 B.bowl=(o={})=>{const fill={solet:0xf7efd8,levonah:0xf2e4b0,salt:0xffffff,oil:0xd6b24a,wine:0x7a1830,flour:0xf7efd8,coal:0xff5a1a,ketoret:0xc9a050,blood:0xa01818,water:0x5a9ad0}[o.fill];const r=o.r||.36;
  const g=grp(mesh(new T.LatheGeometry([[0,0],[r*.5,0],[r*.95,r*.55],[r,r*.6]].map(p=>new T.Vector2(p[0],p[1])),16),mat(o.col||0xdde1e6,{metalness:.6,roughness:.3,side:T.DoubleSide,emissive:0x23262a}),0,-r*.6+.02,0));
  if(fill)g.add(mesh(SPH,mat(fill,fill==0xff5a1a?{emissive:0xff3a00}:{roughness:.9}),0,-.08,0,r*.85,r*.28,r*.85));g.userData.grip=[0,0,.2];return g};
 B.jar=(o={})=>{const c=o.col||0xa8522a,s=o.s||1;const g=grp(mesh(lathe([[0,0],[.18,0],[.28,.08],[.4,.3],[.43,.5],[.36,.72],[.2,.85],[.17,.95],[.24,1.02],[.2,1.06]],12),mat(c,{side:T.DoubleSide,roughness:.7})));g.scale.setScalar(.7*s);g.userData.grip=[0,-.2,.1];return g};
 B.kaf=()=>{const g=grp(mesh(new T.LatheGeometry([[0,0],[.2,0],[.44,.12],[.5,.2]].map(p=>new T.Vector2(p[0],p[1])),20),mat(0xf0c040,{metalness:.65,roughness:.3,side:T.DoubleSide,emissive:0x3a2600}),0,-.2,.2),mesh(BOX,GLD,0,-.1,-.45,.1,.07,.8),
   mesh(new T.LatheGeometry([[0,0],[.14,0],[.2,.16]].map(p=>new T.Vector2(p[0],p[1])),12),GLD,0,-.04,.2),mesh(SPH,mat(0xc9a050),0,.14,.2,.18,.1,.18));g.userData.grip=[0,0,0];return g};
 B.bazach=()=>{const g=grp(mesh(new T.LatheGeometry([[0,0],[.1,0],[.2,.17],[.22,.22]].map(p=>new T.Vector2(p[0],p[1])),12),mat(0xf0c040,{metalness:.65,roughness:.3,side:T.DoubleSide,emissive:0x3a2600}),0,-.1,0),mesh(SPH,mat(0xc9a050),0,.12,0,.2,.1,.2));g.userData.grip=[0,0,0];return g};
 B.machta=(o={})=>{const g=grp(mesh(new T.LatheGeometry([[0,0],[.3,0],[.5,.12],[.52,.16]].map(p=>new T.Vector2(p[0],p[1])),18),o.gold?GLD:SIL,0,-.1,.25),mesh(BOX,o.gold?GLD:SIL,0,0,-.55,.07,.07,1.0));
  if(o.coals)g.add(mesh(SPH,mat(0xff5a1a,{emissive:0xff3a00}),0,.02,.25,.38,.09,.38));g.userData.grip=[0,0,0];return g};
 B.kuz=()=>{const g=grp(mesh(new T.LatheGeometry([[0,0],[.12,0],[.2,.34],[.22,.4]].map(p=>new T.Vector2(p[0],p[1])),12),mat(0xf0c040,{metalness:.65,roughness:.3,side:T.DoubleSide,emissive:0x3a2600}),0,-.2,0),mesh(new T.TorusGeometry(.12,.025,5,10),GLD,.26,0,0));g.userData.grip=[0,0,.05];return g};
 B.tani=()=>{const g=grp(mesh(new T.LatheGeometry([[0,0],[.3,0],[.55,.25],[.6,.45]].map(p=>new T.Vector2(p[0],p[1])),18),mat(0xf0c040,{metalness:.65,roughness:.3,side:T.DoubleSide,emissive:0x3a2600}),0,-.22,.1));g.userData.grip=[0,0,.2];return g};
 B.rake=()=>{const g=grp(limbm([0,0,-1.1],[0,0,1.1],.035,WOOD),mesh(BOX,mat(0x555a60),0,-.04,1.15,.7,.06,.3));g.userData.grip=[0,0,0];return g};
 function limbm(a,b,r,m){return limb(a,b,r,r,m)}
 B.tzenor=()=>{const g=grp(mesh(new T.LatheGeometry([[0,0],[.3,0],[.45,.25]].map(p=>new T.Vector2(p[0],p[1])),14),mat(0x6b7078,{metalness:.6,roughness:.4,side:T.DoubleSide}),0,-.1,.2),mesh(BOX,WOOD,0,0,-.4,.06,.06,.7));g.userData.grip=[0,0,0];return g};
 B.flask=()=>{const g=grp(mesh(lathe([[0,0],[.14,0],[.2,.1],[.16,.55],[.09,.62],[.1,.72],[.14,.76]],12),mat(0xdde1e6,{metalness:.7,roughness:.28,emissive:0x23262a,side:T.DoubleSide}),0,-.3,0));g.userData.grip=[0,0,.1];return g};
 B.loaf=()=>{const g=grp(mesh(SPH,mat(0xc88a3c),0,0,0,.34,.15,.42));g.userData.grip=[0,0,.1];return g};
 B.logs=()=>{const g=new T.Group(),m=mat(0x6a4a2c,{roughness:1});for(let i=0;i<5;i++){const L=mesh(CYL,m,(i%3-1)*.2,(i>2?.2:0),0,.1,1.5,.1,Math.PI/2,0,0);L.rotation.y=.2*(i-2);g.add(L)}g.userData.grip=[0,0,.4];return g};
 B.torch=()=>{const g=grp(limbm([0,0,-.3],[0,.9,.1],.045,WOOD),flame(0,.98,.12,.55,.95));g.userData.flick=1;g.userData.grip=[0,0,0];return g};
 B.fire=(o={})=>{const s=o.s||1,g=new T.Group();for(let i=0;i<3;i++)g.add(flame((i-1)*.5*s,0,(i%2-.5)*.5*s,(1.6-i*.2)*s,(2.2+i*.4)*s));g.userData.flick=1;return g};
 B.coals=(o={})=>{const g=new T.Group(),s=o.s||1;g.add(mesh(SPH,mat(0x1a1410,{roughness:1}),0,.15*s,0,1.1*s,.35*s,1.1*s));for(let i=0;i<9;i++)g.add(mesh(SPH,mat(0xff5a1a,{emissive:0xff3a00}),Math.cos(i*2.1)*.6*s,.36*s,Math.sin(i*2.1)*.6*s,.13*s,.08*s,.13*s));g.userData.grip=[0,0,0];return g};
 B.saltpile=()=>grp(mesh(SPH,mat(0xffffff,{roughness:1}),0,0,0,.4,.2,.4));
 B.meat=(o={})=>{const k=o.kind||'chunk',g=new T.Group(),f=m=>mesh(SPH,m,0,0,0);const add=(m,x,y,z,sx,sy,sz)=>g.add(mesh(SPH,m,x,y,z,sx,sy,sz));
  if(k=='head'){add(mat(0xd8c4a0),0,0,0,.28,.26,.42);add(mat(0xd8c4a0),0,.1,.28,.17,.14,.2);[-1,1].forEach(s=>add(mat(0xd8c4a0),s*.26,.12,-.05,.08,.18,.1));add(FAT,0,.22,-.15,.2,.07,.2)}
  else if(k=='legs'||k=='leg'){[-1,1].forEach(s=>{if(k=='leg'&&s>0)return;g.add(limb([s*.12,.2,-.5],[s*.12,-.05,.5],.12,.08,FLESH));g.add(mesh(SPH,mat(0xe4d8b8),s*.12,-.05,.55,.09,.09,.12))})}
  else if(k=='entrails'){add(mat(0xd4a090),0,0,0,.4,.14,.4);add(mat(0xc07a6a),.1,.08,.05,.28,.1,.28)}
  else if(k=='liver'){add(mat(0x6a2a2a),0,0,0,.3,.1,.22)}
  else{add(FLESH,0,0,0,.45,.22,.3);add(FAT,.1,.12,0,.3,.06,.22);add(mat(0xe4d8b8),-.2,-.05,.12,.12,.12,.16)}
  g.userData.grip=[0,-.1,.15];return g};
 B.blood=(o={})=>{const w=o.w||1,h=o.h||1.1;return mesh(BOX,BLOOD,0,0,0,w,h,.06)};
 B.pool=(o={})=>{const g=mesh(new T.CircleGeometry(o.r||.8,16),BLOOD,0,.06,0,1,1,1,-Math.PI/2);return g};
 B.basket=()=>{const g=grp(mesh(new T.LatheGeometry([[0,0],[.3,0],[.45,.3],[.5,.36]].map(p=>new T.Vector2(p[0],p[1])),12),mat(0xb98a4a,{side:T.DoubleSide,roughness:1}),0,-.2,0),mesh(SPH,mat(0xf7efd8),0,.1,0,.36,.1,.36));g.userData.grip=[0,0,.2];return g};
 B.cloth=()=>{const g=grp(mesh(BOX,WHITE,0,0,0,.5,.03,.5));g.userData.grip=[0,0,.1];return g};
 B.lampcap=()=>grp(mesh(SPH,mat(0x3a2a14),0,0,0,.16,.12,.16));
 B.key=()=>{const g=grp(mesh(BOX,GLD,0,0,.18,.04,.04,.5),mesh(new T.TorusGeometry(.09,.025,5,10),GLD,0,0,-.1),mesh(BOX,GLD,0,-.05,.38,.03,.1,.05),mesh(BOX,GLD,0,-.04,.3,.03,.08,.05));g.userData.grip=[0,0,0];return g};   // מפתח זהב קטן
 B.trumpet=()=>{const g=grp(mesh(new T.CylinderGeometry(.035,.035,2.6,8),SIL,0,0,.5,1,1,1,Math.PI/2,0,0),mesh(new T.CylinderGeometry(.2,.035,.55,12,1,true),mat(0xdde1e6,{metalness:.7,roughness:.28,side:T.DoubleSide}),0,0,1.78,1,1,1,Math.PI/2,0,0));g.userData.grip=[0,0,-.2];return g};   // חצוצרת כסף ישרה
 B.broom=()=>{const g=grp(limbm([0,0,-.4],[0,-.05,.4],.03,WOOD),mesh(BOX,mat(0x8a6a3a),0,-.06,.48,.22,.05,.22));g.userData.grip=[0,0,0];return g};   // מכבדת (מטאטא קטן)
 B.vtable=(o={})=>{const g=new T.Group();g.add(mesh(BOX,SIL,0,1.05,0,3.2,.14,1.6));[[-1.4,-.65],[1.4,-.65],[-1.4,.65],[1.4,.65]].forEach(p=>g.add(mesh(BOX,SIL,p[0],.5,p[1],.12,1,.12)));
  for(let i=0;i<7;i++){const x=-1.2+(i%4)*.8,z=-.4+Math.floor(i/4)*.8;g.add(mesh(CYL,i%2?GLD:SIL,x,1.2+(i>3?.0:0),z,.28,.1,.28))}g.add(mesh(CYL,GLD,.2,1.32,.1,.3,.1,.3));g.add(mesh(CYL,SIL,.2,1.42,.1,.24,.08,.24));return g};   // שולחן כלי שרת מתכת עם כלים
 B.paskhter=()=>{const g=grp(mesh(new T.LatheGeometry([[0,0],[.9,0],[1.7,.7],[1.95,1.1]].map(p=>new T.Vector2(p[0],p[1])),22),mat(0xb8782e,{metalness:.65,roughness:.35,side:T.DoubleSide,emissive:0x2a1608}),0,.15,0),mesh(new T.TorusGeometry(1.95,.07,6,24),CU,0,1.25,0,1,1,1,Math.PI/2));
  [-1,1].forEach(s=>{for(let i=0;i<5;i++)g.add(mesh(new T.TorusGeometry(.09,.025,4,8),mat(0x555a60),s*(1.95+i*.16),1.15-i*.15,0,1,1,1,i%2?0:Math.PI/2))});return g};   // פסכתר: כלי נחושת עגול ושרשרת בכל אחד משני צדיו
 /* ---------- בעלי חיים ---------- */
 function quad(o){const g=new T.Group(),inn=new T.Group();g.add(inn);const s=o.s||1,wm=mat(o.col,{roughness:1}),sk=mat(o.face||o.col,{roughness:.9}),L=o.L,H=o.H,W=o.W,lg=o.leg;
  const body=mesh(SPH,wm,0,lg+H*.5,0,W*.5,H*.5,L*.5);inn.add(body);
  const car=mesh(SPH,mat(0xc97a6a,{roughness:.7}),0,lg+H*.46,0,W*.45,H*.45,L*.46);car.visible=false;inn.add(car);
  const head=new T.Group();head.position.set(0,lg+H*.82,L*.5);inn.add(head);
  head.add(mesh(SPH,sk,0,0,.25*s,.24*s,.26*s,.38*s));head.add(mesh(SPH,sk,0,-.12*s,.55*s,.13*s,.12*s,.22*s));[-1,1].forEach(q=>{head.add(mesh(SPH,sk,q*.26*s,.1*s,.1*s,.1*s,.05*s,.2*s,0,0,q*.5));head.add(mesh(SPH,DARK,q*.12*s,.1*s,.5*s,.03*s,.03*s,.03*s))});
  if(o.horns=='ram')[-1,1].forEach(q=>{const t=new T.Mesh(new T.TorusGeometry(.3*s,.06*s,6,14,Math.PI*1.5),mat(0xcdbb94));t.position.set(q*.22*s,.12*s,.12*s);t.rotation.set(0,q*Math.PI/2,q*.4);head.add(t)});
  if(o.horns=='bull')[-1,1].forEach(q=>head.add(mesh(CONE,mat(0xe8dcc0),q*.3*s,.28*s,.18*s,.07*s,.5*s,.07*s,0,0,-q*.9)));
  if(o.horns=='goat'){[-1,1].forEach(q=>head.add(mesh(CONE,mat(0x3a2f26),q*.1*s,.3*s,.1*s,.05*s,.4*s,.05*s,-.5,0,-q*.3)));head.add(mesh(CONE,mat(0xddd6c6),0,-.35*s,.5*s,.06*s,.25*s,.06*s,Math.PI,0,0))}
  const legs=[];[[-1,1],[1,1],[-1,-1],[1,-1]].forEach(([a,b])=>{const l=mesh(CYL,sk,a*W*.32,lg/2,b*L*.32,.09*s,lg,.09*s);inn.add(l);legs.push(l)});
  inn.add(mesh(SPH,wm,0,lg+H*.7,-L*.5,.14*s,.14*s,.28*s,.6,0,0));
  g.userData={inn,body,car,head,L,H,W,lg,lay:0,hang:0,skinned:0,kind:o.kind};g.userData.apply=()=>applyAnimal(g);return g}
 function applyAnimal(g){const u=g.userData,inn=u.inn;const lay=u.lay,hg=u.hang;inn.rotation.set(hg*Math.PI/2,0,-lay*Math.PI/2);
  inn.position.set(-lay*(u.lg+u.H*.5)+0,lay*u.W*.5,0);if(hg){inn.position.y=hg*(2.75-u.L*.5);inn.position.z=-hg*(u.lg+u.H*.5)}
  u.head.rotation.x=lay*.9;u.body.visible=!u.skinned;u.car.visible=!!u.skinned}
 B.sheep=(o={})=>quad(Object.assign({kind:'sheep',L:2.1,H:1.05,W:.95,leg:.65,col:0xf1ece0,face:0xd2bc96,s:1},o));
 B.ram=(o={})=>quad(Object.assign({kind:'ram',L:2.8,H:1.4,W:1.2,leg:.9,col:0xeee6d4,face:0xcfb48a,horns:'ram',s:1.25},o));
 B.bull=(o={})=>quad(Object.assign({kind:'bull',L:4.2,H:2.2,W:1.7,leg:1.3,col:0x8a5a38,face:0x6e4528,horns:'bull',s:2.2},o));
 B.goat=(o={})=>quad(Object.assign({kind:'goat',L:2.2,H:1.0,W:.8,leg:.85,col:0xd8d0be,face:0xc4b89c,horns:'goat',s:1.1},o));
 function bird(o){const g=new T.Group(),c=mat(o.col||0xe8e4dc,{roughness:.9}),s=o.s||2;g.add(mesh(SPH,c,0,.18*s,0,.14*s,.12*s,.24*s,-.3,0,0));g.add(mesh(SPH,c,0,.3*s,.2*s,.08*s,.08*s,.09*s));g.add(mesh(CONE,mat(0xd8a850),0,.29*s,.3*s,.025*s,.08*s,.025*s,Math.PI/2,0,0));
  [-1,1].forEach(q=>g.add(mesh(SPH,mat(0xcfc8bc),q*.13*s,.2*s,-.02*s,.04*s,.1*s,.2*s,-.2,0,q*.2)));g.add(mesh(BOX,c,0,.16*s,-.28*s,.1*s,.02*s,.18*s));
  g.userData.grip=[0,0,.15];g.userData.kind='bird';return g}
 B.dove=(o={})=>bird(Object.assign({col:0xe8e4dc},o));B.pigeon=(o={})=>bird(Object.assign({col:0xaaa49a},o));
 /* ---------- דמות "ישראל" (בעלים): גלימה צבעונית, כיסוי ראש ---------- */
 function layman(pose,col,hair){const g=new T.Group(),P=mkPriest.POSES[pose]||mkPriest.POSES.idle,rb=mat(col||0x6e8aa8,{roughness:.9,side:T.DoubleSide}),cl=mat(0xe8dfc8),hr=mat(hair||0x3a2a1e);
  g.add(mesh(new T.CylinderGeometry(.4,.52,1.75,20),rb,0,.92,0),mesh(new T.CylinderGeometry(.31,.4,.95,16),rb,0,2.22,0),mesh(new T.CylinderGeometry(.43,.43,.3,18,1,true),mat(0x7a3a2a,{side:T.DoubleSide}),0,1.86,0));
  g.add(mesh(SPH,SKIN,0,2.93,.01,.21,.23,.21),mesh(SPH,hr,0,2.72,.1,.2,.28,.14),mesh(new T.TorusGeometry(.22,.09,8,18),cl,0,3.1,0,1,1,1,Math.PI/2),mesh(SPH,cl,0,3.14,0,.15,.12,.15));
  [-.14,.14].forEach(x=>g.add(mesh(BOX,mat(0x5a3a20),x,.035,.06,.15,.07,.34)));
  [0,3].forEach(k=>{const s=P[k],e=P[k+1],w=P[k+2];g.add(limb(s,e,.115,.1,rb),limb(e,w,.1,.085,rb),mesh(SPH,SKIN,w[0],w[1],w[2],.085,.085,.085))});
  return g}
 /* ---------- שחקנים ---------- */
 const VC={};
 function variant(kind,pose,spec){const key=kind+'|'+pose+'|'+(spec.hair||'')+'|'+(spec.color||'');
  if(kind=='o')return layman(pose,spec.color,spec.hair);
  if(!VC[key]){VC[key]=mkPriest(kind,pose,spec.hair);VC[key].traverse(o=>{if(o.isMesh)o.castShadow=false})}
  return VC[key].clone()}
 const wristOf=(pose,h)=>{const P=mkPriest.POSES[pose]||mkPriest.POSES.idle;return P[h=='R'?2:5]};
 function makeActor(id,spec,poses){if(typeof spec=='string')spec={kind:spec};const A={id,spec,x:0,y:YA,z:0,yaw:0,lean:0,dip:0,roll:0,speed:0,phase:0,pose:'idle',var:{},hand:{R:new T.Group(),L:new T.Group()},held:{R:null,L:null}};
  A.root=new T.Group();A.body=new T.Group();A.root.add(A.body);
  poses.forEach(p=>{const v=variant(spec.kind,p,spec);v.visible=false;A.body.add(v);A.var[p]=v});
  A.body.add(A.hand.R,A.hand.L);
  const sh=mesh(new T.CircleGeometry(.75,16),BASIC(0,{transparent:true,opacity:.3,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3}),0,.05,0,1,1,1,-Math.PI/2);A.root.add(sh);
  root.add(A.root);return A}
 function setPose(A,p){if(!A.var[p])p='idle';A.pose=p;for(const k in A.var)A.var[k].visible=k==p;['R','L'].forEach(h=>{A.hand[h].position.set(...wristOf(p,h))})}
 /* ---------- אביזרים ---------- */
 function spawnItem(id,kind,opts,at,face){if(!B[kind])throw new Error('אביזר לא מוכר: '+kind);
  const g=B[kind](opts||{}),it={id,kind,g,held:null,opts:opts||{}};g.userData.itemId=id;if(it.opts.scale)g.scale.setScalar(it.opts.scale);root.add(g);S.items[id]=it;
  if(at){setItemPos(it,at[0],at[1],at[2])}if(face!=null)g.rotation.y=dirYaw(face);if(g.userData.apply)g.userData.apply();return it}
 function setItemPos(it,x,z,y){it.g.position.set(x,y!=null?y:floorY(x,z),z)}
 function detach(it){if(!it.held)return;const A=it.held.actor;A.held[it.held.hand]=null;root.attach(it.g);it.held=null}
 function attachTo(it,A,hand){detach(it);const h=hand||(A.held.R?'L':'R');if(A.held[h])detach(A.held[h]);A.hand[h].add(it.g);const gp=it.g.userData.grip||[0,0,0];it.g.position.set(gp[0],gp[1],gp[2]);it.g.rotation.set(gp[3]||0,gp[4]||0,gp[5]||0);A.held[h]=it;it.held={actor:A,hand:h}}
 const killItem=id=>{const it=S.items[id];if(!it)return;detach(it);root.remove(it.g);delete S.items[id]};

 /* ================= פעולות: כל פעולה = {init,tick(dt)→done,fin} ================= */
 const RUN=(init,tick,fin)=>{let st=0;return{init(){if(!st){st=1;init&&init()}},tick(dt){if(st==2)return true;this.init();if(tick?tick(dt):true){st=2;return true}return false},fin(){if(st==2)return;this.init();fin&&fin();st=2},get done(){return st==2}}};
 const tween=(dur,f,fin)=>{let t=0;return RUN(null,dt=>{t+=dt;const k=Math.min(1,t/dur);f(k,ease(k));return k>=1},()=>{f(1,1);fin&&fin()})};
 const gA=id=>{const A=S.actors[id];if(!A)throw new Error('שחקן לא מוכר: '+id);return A};
 const gI=id=>{const I=S.items[id];if(!I)throw new Error('אביזר לא מוכר: '+id);return I};
 const ptY=p=>p[2]!=null?p[2]:floorY(p[0],p[1]);
 function actWalk(a){const A=gA(a.who);let segs,i,s,L,sp,ex0;
  const build=()=>{let p0={x:A.x,z:A.z,y:A.y};segs=a.walk.map(p=>{const q={x:p[0],z:p[1],y:p[2]};const dx=q.x-p0.x,dz=q.z-p0.z;const sg={x0:p0.x,z0:p0.z,y0:p0.y,x1:q.x,z1:q.z,ey:q.y,L:Math.hypot(dx,dz),yaw:Math.atan2(dx,dz)};p0={x:q.x,z:q.z,y:q.y!=null?q.y:floorY(q.x,q.z)};return sg}).filter(g=>g.L>.01)};
  const end=()=>{const e=a.walk[a.walk.length-1];A.x=e[0];A.z=e[1];A.y=ptY(e);A.explicit=e[2]!=null;if(segs.length)A.yaw=segs[segs.length-1].yaw;if(a.face!=null)A.yaw=faceYaw(A,a.face);A.speed=0};
  return RUN(()=>{build();i=0;s=0;sp=a.speed||6;ex0=A.explicit},dt=>{
   if(i>=segs.length){return fFace()}const g=segs[i];const slope=g.ey!=null||ex0?((g.ey!=null?g.ey:floorY(g.x1,g.z1))-g.y0)/g.L:(floorY(g.x1,g.z1)-floorY(g.x0,g.z0))/g.L;const f=slope>.12?.7:slope<-.12?.9:1;
   s+=sp*f*dt;A.speed=sp*f;const k=Math.min(1,s/g.L);A.x=g.x0+(g.x1-g.x0)*k;A.z=g.z0+(g.z1-g.z0)*k;
   A.y=(g.ey!=null||ex0)?g.y0+((g.ey!=null?g.ey:floorY(g.x1,g.z1))-g.y0)*k:floorY(A.x,A.z);A._mv=1;
   A.yaw+=angD(A.yaw,g.yaw)*Math.min(1,dt*10);
   if(k>=1){ex0=g.ey!=null;A.explicit=ex0;i++;s=0}return false},end);
  function fFace(){if(a.face==null){A.speed=0;return true}const ty=faceYaw(A,a.face),d=angD(A.yaw,ty);A.yaw+=d*.25;if(Math.abs(d)<.03){A.yaw=ty;return true}return false}}
 const faceYaw=(A,f)=>Array.isArray(f)?Math.atan2(f[0]-A.x,f[1]-A.z):dirYaw(f);
 function actFace(a){const A=gA(a.who);let ty;return RUN(()=>{ty=faceYaw(A,a.face)},dt=>{const d=angD(A.yaw,ty);A.yaw+=d*Math.min(1,dt*7);if(Math.abs(d)<.03){A.yaw=ty;return true}return false},()=>{A.yaw=ty})}
 function actPose(a){const A=gA(a.who);return RUN(()=>setPose(A,a.pose),null,()=>setPose(A,a.pose))}
 function actAnim(a){if(a.item&&!a.who)return actState({item:a.item,state:a.anim,dur:a.dur});const A=gA(a.who);const d=a.dur||1.2,amt=a.amt;
  const R=A.hand.R;
  const T0={bow:1.6,slaughter:1.1,zerika:.9,sprinkle:.9,press:1.4,rise:1.2,kneel:1.2,lean:.6,upright:.5};const dur=a.dur||T0[a.anim]||1;
  const st={l:A.lean,d:A.dip};
  switch(a.anim){
   case 'lean':return tween(dur,(k,e)=>{A.lean=st.l+((amt!=null?amt:.5)-st.l)*e});
   case 'upright':return tween(dur,(k,e)=>{A.lean=st.l*(1-e);A.dip=st.d*(1-e)});
   case 'kneel':return tween(dur,(k,e)=>{A.dip=-.9*Math.sin(Math.min(1,k*1.3)*Math.PI/2);A.lean=.15*e},()=>{A.dip=-.9;A.lean=.15});
   case 'bow':return tween(dur,(k)=>{const e=k<.3?ease(k/.3):k<.65?1:ease(1-(k-.65)/.35);A.lean=1.25*e;A.dip=-.75*e},()=>{A.lean=0;A.dip=0});
   case 'press':return tween(dur,(k)=>{const e=k<.3?ease(k/.3):k<.8?1:ease(1-(k-.8)/.2);A.lean=.4*e+(k>.3&&k<.8?Math.sin(k*30)*.03:0)},()=>{A.lean=0});
   case 'slaughter':return tween(dur,(k)=>{const e=k<.25?ease(k/.25):k<.8?1:ease(1-(k-.8)/.2);A.lean=.55*e;R.rotation.z=e*Math.sin(k*18)*.35;R.rotation.x=e*.25},()=>{A.lean=0;R.rotation.set(0,0,0)});
   case 'zerika':return tween(dur,(k)=>{A.lean=k<.4?-.3*ease(k/.4):-.3+.7*Math.sin(Math.min(1,(k-.4)/.6)*Math.PI);R.rotation.x=k<.4?-.9*ease(k/.4):-.9+1.3*ease((k-.4)/.6)},()=>{A.lean=0;R.rotation.set(0,0,0)});
   case 'sprinkle':return tween(dur,(k)=>{R.rotation.x=-.5*Math.sin(k*Math.PI*6);A.lean=.2*Math.sin(k*Math.PI)},()=>{A.lean=0;R.rotation.set(0,0,0)});
   case 'rise':return tween(dur,(k)=>{A.dip=.35*Math.sin(k*Math.PI);A.lean=-.2*Math.sin(k*Math.PI)},()=>{A.dip=0;A.lean=0});
  }throw new Error('אנימציה לא מוכרת: '+a.anim)}
 function actTake(a){const A=gA(a.who);return RUN(()=>{let it=S.items[a.take];if(!it)it=spawnItem(a.id||a.take,a.take,a.opts,[A.x,A.z,A.y]);attachTo(it,A,a.hand)},null,null)}
 function actDrop(a){const A=gA(a.who);return RUN(()=>{const it=gI(a.drop);detach(it);const p=a.at||[A.x+Math.sin(A.yaw)*.8,A.z+Math.cos(A.yaw)*.8];setItemPos(it,p[0],p[1],p[2]);it.g.rotation.set(0,A.yaw,0);if(a.tilt)it.g.rotation.x=a.tilt},null,null)}
 function actGive(a){const A=gA(a.who),B2=gA(a.to);return RUN(()=>attachTo(gI(a.give),B2,a.hand),null,null)}
 function actSpawn(a){return RUN(()=>{if(S.items[a.id])killItem(a.id);spawnItem(a.id||a.spawn,a.spawn,a.opts,a.at,a.face)},null,null)}
 function actRemove(a){const ids=[].concat(a.remove);return RUN(()=>ids.forEach(killItem),null,null)}
 function actMove(a){let it,p0,p1,L,t=0,sp,y1;return RUN(()=>{it=gI(a.move);detach(it);const g=it.g.position;p0=g.clone();p1=V3(a.to[0],a.to[2]!=null?a.to[2]:floorY(a.to[0],a.to[1]),a.to[1]);L=p0.distanceTo(p1)||.01;sp=a.speed||4;if(a.face!=null)it.g.userData.fy=dirYaw(a.face)},
  dt=>{t+=sp*dt/L;const k=Math.min(1,t);it.g.position.lerpVectors(p0,p1,k);if(a.arc)it.g.position.y+=a.arc*4*k*(1-k);if(it.g.userData.fy!=null)it.g.rotation.y+=angD(it.g.rotation.y,it.g.userData.fy)*Math.min(1,dt*8);if(it.kind in {sheep:1,ram:1,bull:1,goat:1})it.g.position.y+=Math.abs(Math.sin(t*L*1.3))*.08;return k>=1},()=>{it.g.position.copy(p1);if(it.g.userData.fy!=null)it.g.rotation.y=it.g.userData.fy})}
 function actState(a){const gu=()=>gI(a.item).g.userData;if(a.state=='skinned'||a.state=='live'){return RUN(()=>{const u=gu();u.skinned=a.state=='skinned'?1:0;u.apply&&u.apply()},null,null)}
  const tl=a.state=='lay'?1:0,th=a.state=='hung'?1:0;let l0,h0;return tween(a.dur||.9,(k,e)=>{const u=gu();if(l0==null){l0=u.lay;h0=u.hang}u.lay=l0+(tl-l0)*e;u.hang=h0+(th-h0)*e;u.apply&&u.apply()},()=>{const u=gu();u.lay=tl;u.hang=th;u.apply&&u.apply()})}
 function actVis(a){const A=gA(a.who);return RUN(()=>{if(a.at){A.x=a.at[0];A.z=a.at[1];A.y=ptY(a.at);A.explicit=a.at[2]!=null}if(a.face!=null)A.yaw=faceYaw(A,a.face);A.root.visible=!!a.vis},null,null)}
 const actWait=a=>{return tween(a.wait,()=>{})};
 function atom(a){
  if(a.who&&a.vis!=null&&!a.walk)return actVis(a);   // {who,vis:true|false,at?,face?} – מופיע/נעלם (למשל: כניסה לתא סגור)
  if(a.walk)return actWalk(a);if(a.pose!=null&&a.who)return actPose(a);if(a.anim&&(a.who||a.item))return actAnim(a);if(a.face!=null&&a.who)return actFace(a);
  if(a.take)return actTake(a);if(a.drop)return actDrop(a);if(a.give)return actGive(a);if(a.spawn)return actSpawn(a);if(a.remove)return actRemove(a);if(a.move)return actMove(a);
  if(a.state&&a.item)return actState(a);if(a.wait!=null)return actWait(a);
  if(a.show)return RUN(()=>{gI(a.show).g.visible=true});if(a.hide)return RUN(()=>{gI(a.hide).g.visible=false});
  if(a.item&&a.on!=null)return RUN(()=>{gI(a.item).g.visible=!!a.on});
  throw new Error('פעולה לא מוכרת: '+JSON.stringify(a))}
 const top=l=>seq(l.map(mk));   // רשימת הפעולות של שלב = רצף
 function mk(n){if(Array.isArray(n))return par(n.map(mk));if(n.seq)return seq(n.seq.map(mk));return atom(n)}
 function par(rs){return RUN(()=>rs.forEach(r=>r.init()),dt=>{let all=true;rs.forEach(r=>{if(!r.done&&!r.tick(dt))all=false});return all},()=>rs.forEach(r=>r.fin()))}
 function seq(rs){let i=0;const r=RUN(()=>{i=0;rs[0]&&rs[0].init()},dt=>{while(i<rs.length){if(rs[i].tick(dt)){i++;if(i<rs.length)rs[i].init();else return true}else return false}return true},()=>{for(;i<rs.length;i++)rs[i].fin()});r.rs=rs;r.idx=()=>i;return r}

 /* ================= סשן ================= */
 const ui={};
 function scanPoses(sc){const P={};Object.keys(sc.actors).forEach(k=>P[k]=new Set(['idle']));
  const visit=n=>{if(Array.isArray(n))n.forEach(visit);else if(n&&n.seq)n.seq.forEach(visit);else if(n&&n.who&&P[n.who]&&n.pose)P[n.who].add(n.pose)};
  (sc.steps||[]).forEach(st=>visit(st.actions||[]));Object.keys(sc.start||{}).forEach(k=>{if(sc.start[k].pose&&P[k])P[k].add(sc.start[k].pose)});return P}
 function open(id){close(true);const sc=SERVICES.find(s=>s.id==id);if(!sc)return;LIFE.tour(id);const poses=scanPoses(sc);
  S={sc,actors:{},items:{},idx:0,t:0,playing:true,speed:1,run:null,camMode:'follow',follow:sc.main||Object.keys(sc.actors)[0],camTw:null,phase:'run',hold:0,err:null,fr:0};
  Object.keys(sc.actors).forEach(k=>{S.actors[k]=makeActor(k,sc.actors[k],[...poses[k]])});
  uiOpenScript();goTo(0)}
 function close(keepUI){try{typeof WORLD!='undefined'&&WORLD.hook(null)}catch(e){}AUD.stop();if(S){for(const k in S.items)killItem(k);for(const k in S.actors)root.remove(S.actors[k].root);S=null}if(!keepUI)uiBack()}
 function resetState(){for(const k in S.items)killItem(k);const st=S.sc.start||{};
  for(const k in S.actors){const A=S.actors[k],s=st[k]||{at:[0,0]};A.lean=A.dip=A.roll=A.speed=0;A.hand.R.rotation.set(0,0,0);A.hand.L.rotation.set(0,0,0);['R','L'].forEach(h=>A.held[h]=null);A.explicit=s.at[2]!=null;
   A.x=s.at[0];A.z=s.at[1];A.y=ptY(s.at);A.yaw=dirYaw(s.face!=null?s.face:0);setPose(A,s.pose||'idle');A.root.visible=!s.hidden}
  (S.sc.items||[]).forEach(a=>atom(a).fin())}
 function goTo(i,instant){if(!S)return;const n=S.sc.steps.length;i=clamp(i,0,n-1);resetState();
  try{for(let j=0;j<i;j++){top(S.sc.steps[j].actions||[]).fin()}}catch(e){fail(e)}
  S.idx=i;startStep(true)}
 /* שפת ילדים (בקשת משה 17.11): ברירת מחדל – הסיפור מ-STORY['<id>-<שלב>'] (src/story*.js); המתג 👶 (localStorage bh_kid) מחליף ללשון המקורות (step.text). ההקראה בקול תמיד מקריאה את גרסת הילדים כשקיימת. */
 let KID=true;try{KID=localStorage.getItem('bh_kid')!=='0'}catch(e){}
 function stText(st){const k=S.sc.id+'-'+S.idx;return KID&&typeof STORY!=='undefined'&&STORY[k]?STORY[k]:(st.text||'')}
 /* הדמות "הראשית" של השלב: מי שהולכת הכי רחוק / עושה את רוב הפעולות (לא מחשיבים דמויות נסתרות) */
 function leadActor(actions){const sc={},visit=a=>{if(Array.isArray(a)){a.forEach(visit);return}if(!a||typeof a!='object')return;if(a.seq)visit(a.seq);
   if(a.who&&S.actors[a.who]){let w=0;if(a.walk){let p=null,L=0;for(const q of a.walk){if(p)L+=Math.hypot(q[0]-p[0],q[1]-p[1]);p=q}w=3+L*.05}else if(a.anim||a.take||a.give||a.drop||a.pose)w=1;else if(a.face||a.vis)w=.1;sc[a.who]=(sc[a.who]||0)+w}};
  visit(actions);let best=null,bs=0;for(const k in sc){const A=S.actors[k];if(sc[k]>bs&&A&&A.root&&A.root.visible!==false){bs=sc[k];best=k}}return best}
 function startStep(jump){const st=S.sc.steps[S.idx];S.t=0;S.phase='run';S.hold=0;try{typeof WORLD!='undefined'&&WORLD.hook(st)}catch(e){}
  try{S.run=top(st.actions||[]);S.run.init()}catch(e){fail(e)}
  const chars=stText(st).length;S.minT=S.txtMinT=1.4+chars*.03;S.holdT=st.hold!=null?st.hold:.8;narrStart();
  if(S.camMode=='follow'&&!(st.cam&&st.cam.follow)){const L=leadActor(st.actions||[]);if(L&&L!==S.follow){S.follow=L;S.fboost=1.6}}   /* מצלמת מעקב: עוברת אל הדמות הפעילה בשלב (לא נשארת על main) */
  uiStep();if(st.cam!==undefined&&st.cam!==null)applyCam(st.cam,jump);else if(jump)applyCam(null,true);
  if(jump)updateActors(0)}
 /* הקראה בקול: השלב לא מסתיים לפני שההקראה נגמרה (הפעולות והקול רצים יחד); במהירות מעל 2× או כשהקול כבוי – תזמון לפי אורך הטקסט */
 function narrStart(){const key=S.sc.id+'-'+S.idx;S.auDone=true;if(!AUD.narrOn||!AUD.has(key)||S.speed>2){AUD.stop();return}AUD.stop(true);
  S.auDone=false;S.minT=.3;const idx=S.idx,sc=S.sc;AUD.narr(key,S.speed,err=>{if(S&&S.sc===sc&&S.idx===idx){S.auDone=true;if(err)S.minT=S.txtMinT}});if(!S.playing)AUD.pause();for(let j=1;j<=2;j++){const nk=sc.id+'-'+(idx+j);AUD.has(nk)&&AUD.prefetch&&AUD.prefetch(nk)}}
 function fail(e){console.error(e);S.err=e;S.playing=false;ui.act&&(ui.act.style.display='none');ui.cap&&(ui.capT.textContent='שגיאה בתסריט: '+e.message)}
 function nextStep(){if(S.idx>=S.sc.steps.length-1){S.playing=false;S.phase='end';uiState();return}S.idx++;startStep(false)}
 /* ---------- מצלמה ---------- */
 function camFrom(c){if(c.pos)return[V3(...c.pos),V3(...c.tgt)];const t=V3(...c.at),az=dirYaw(c.az!=null?c.az:0),d=c.d||30;return[t.clone().add(V3(Math.sin(az)*d,c.h!=null?c.h:d*.4,Math.cos(az)*d)),t]}
 /* מצלמה חכמה: מחפשת נקודת תצפית פנויה סביב המטרה (קרן מול תיבות ההתנגשות ורשתות הסצנה) – כדי שלא תעמוד בתוך קיר/עמוד/פרוכת */
 const _rc=new T.Raycaster();
 function occl(t,p){   // מרחק לראשון המכשולים בין המטרה למצלמה (או null אם פנוי)
  const dx=p.x-t.x,dy=p.y-t.y,dz=p.z-t.z,L=Math.hypot(dx,dy,dz);if(L<.5)return null;let best=1e9;
  for(const c of COL){if(c.length>6||c[5]-c[4]<3)continue;
   if(t.x>c[0]&&t.x<c[1]&&t.z>c[2]&&t.z<c[3]&&t.y>c[4]&&t.y<c[5])continue;
   let a=0,b=1;const lo=[c[0],c[4],c[2]],hi=[c[1],c[5],c[3]],o=[t.x,t.y,t.z],d=[dx,dy,dz];let ok=true;
   for(let i=0;i<3;i++){if(Math.abs(d[i])<1e-6){if(o[i]<lo[i]||o[i]>hi[i]){ok=false;break}}else{let u=(lo[i]-o[i])/d[i],v=(hi[i]-o[i])/d[i];if(u>v){const q=u;u=v;v=q}if(u>a)a=u;if(v<b)b=v;if(a>b){ok=false;break}}}
   if(ok&&a*L<best&&a*L>Math.min(2.4,L*.3))best=a*L}
  return best<1e8?best:null}
 function clearCam(p,t){
  const ex=p.x-t.x,ey=p.y-t.y,ez=p.z-t.z,L=Math.hypot(ex,ey,ez);if(L<1.5)return p;
  if(ey/L>.57)return p;   // מצלמות גבוהות (מבט מלמעלה) – לא נוגעים
  const h0=occl(t,p);if(h0===null||h0>=L-.3)return p;
  const f=Math.max(.25,(h0-.9)/L);return V3(t.x+ex*f,t.y+ey*f,t.z+ez*f)}
 function flyTo(p,t,dur){tw=null;S.camTw={t:0,dur:Math.max(.01,dur),p0:camera.position.clone(),t0:controls.target.clone(),p1:p,t1:t}}
 function followOff(A){const a=A.yaw+2.5;return V3(Math.sin(a)*16,9,Math.cos(a)*16)}
 const RET_MS=4000;let _retB=null,_retOn=false;   /* אחרי שהמשתמש הזיז את המצלמה: מבט חופשי ו-4 שניות אחר כך חזרה מונפשת אל הכהן */
 function retChip(on){if(on===_retOn)return;_retOn=on;if(!_retB){_retB=document.createElement('button');_retB.id='svRet';_retB.type='button';_retB.textContent='🎯 חוזרים אל הכהן… (לחצו לחזרה מיידית)';_retB.onclick=()=>{if(S){S.drag=false;S.ut=0}};document.body.appendChild(_retB)}_retB.classList.toggle('on',on)}
 function applyCam(c,jump){if(walk)return;
  if(S.camMode=='free')return;
  if(S.camMode=='follow'){if(c&&c.follow&&S.actors[c.follow])S.follow=c.follow;
  {const A0=S.actors[S.follow];if(A0&&!jump&&!(c&&c.fixed)&&camera.position.distanceTo(V3(A0.x,A0.y,A0.z))>120){S.fd=null;S.fAz=null;const t0=V3(A0.x,A0.y+3,A0.z);flyTo(t0.clone().add(followOff(A0)),t0,.5);return}}   /* הדמות רחוקה מאוד (למשל אחרי שלב בדרך המדבר) – מעבר מהיר ולא מסע ארוך של המצלמה */
  if(c&&c.fixed&&(c.pos||c.at)){const[p,t]=camFrom(c);S.fd=null;S.fAz=null;flyTo(p,t,jump?.01:(c.dur||1.8));return}   /* fixed: מצלמה קבועה גם במצב עוקב (למשל בתוך קודש הקדשים, מאחורי הפרוכת) – אחר כך ממשיכה אחרי הדמות */
  if(c&&c.follow)S.fboost=1.6;if(jump){S.fd=null;S.fAz=null;const A=S.actors[S.follow];if(A){const t=V3(A.x,A.y+3,A.z);flyTo(t.clone().add(followOff(A)),t,.01)}}return}   /* סיור רציף: אין קפיצה לתחנה – המצלמה רק ממשיכה אחרי הכהן */
  if(c&&(c.pos||c.at)){const[p,t]=camFrom(c);flyTo(p,t,jump?.01:(c.dur||1.8))}else if(c&&c.follow){S.follow=c.follow}
  else if(jump){const A=S.actors[S.follow],t=V3(A.x,A.y+3,A.z);flyTo(t.clone().add(followOff(A)),t,.01)}}
 function updCam(dt){if(walk||!S)return;
  if(S.camTw){const w=S.camTw;w.t+=dt/w.dur;const k=Math.min(1,w.t),e=ease(k);camera.position.lerpVectors(w.p0,w.p1,e);controls.target.lerpVectors(w.t0,w.t1,e);if(k>=1)S.camTw=null;return}
  if(S.camMode=='follow'){const A=S.actors[S.follow];if(!A)return;
   /* מצלמת מעקב רציפה: גולשת אחרי הכהן, מסתובבת לאט אל אחורי כיוון ההליכה, ומתקרבת כשקיר חוסם (ומתרחקת חזרה כשמתפנה) */
   const t=V3(A.x,A.y+3,A.z),tg=controls.target,now=performance.now(),inter=S.drag||(S.ut&&now-S.ut<RET_MS);
   if(inter){retChip(true);S.away=true;return}
   if(S.away){S.away=false;retChip(false);const o0=camera.position.clone().sub(tg),dist=Math.min(60,Math.max(9,o0.length())),fo=followOff(A).normalize().multiplyScalar(dist);S.fd=null;flyTo(t.clone().add(fo),t,2);return}
   if(S.fboost>0)S.fboost-=dt;const k=1-Math.exp(-dt*(S.fboost>0?6:3.5)),d=t.clone().sub(tg).multiplyScalar(k);tg.add(d);camera.position.add(d);
   if(!inter&&A.speed>1.2){const o=camera.position.clone().sub(tg),az=Math.atan2(o.x,o.z),w=A.yaw+2.7,az2=az+angD(az,w)*(1-Math.exp(-dt*.55)),r=Math.hypot(o.x,o.z);camera.position.x=tg.x+Math.sin(az2)*r;camera.position.z=tg.z+Math.cos(az2)*r}
   const o=camera.position.clone().sub(tg),L=o.length();if(inter||!S.fd||L<2)S.fd=Math.max(4,L);
   if(!inter&&L>1){const want=tg.clone().add(o.multiplyScalar(S.fd/L)),c=clearCam(want,tg);camera.position.lerp(c,1-Math.exp(-dt*(c!==want?5:1.3)))}}}
 /* ---------- עדכון ---------- */
 function updateActors(dt){if(typeof SPRITE!='undefined')SPRITE.tick(S);for(const k in S.actors){const A=S.actors[k];if(!A._mv)A.speed*=Math.max(0,1-dt*8);A._mv=0;A.phase+=A.speed*dt*1.35;
   const sp=Math.min(1,A.speed/6),bob=Math.abs(Math.sin(A.phase))*.1*sp;
   A.root.position.set(A.x,A.y,A.z);A.root.rotation.y=A.yaw;A.body.position.y=bob+A.dip;A.body.rotation.x=A.lean+sp*.05;A.body.rotation.z=Math.sin(A.phase)*.045*sp}}
 function update(dt){if(!S||!ui.panel||ui.panel.style.display=='none')return;if(S.err){updateActors(0);return}
  const sdt=dt*S.speed;if(S.playing!==S._pl){S._pl=S.playing;S.playing?AUD.resume():AUD.pause()}
  if(S.playing){try{
   if(S.phase=='run'){S.t+=sdt;const done=S.run.tick(sdt);if(done&&S.t>=S.minT&&S.auDone!==false){S.phase='hold';S.hold=0}}
   else if(S.phase=='hold'){S.hold+=sdt;if(S.hold>=S.holdT)nextStep()}}catch(e){fail(e)}}
  updateActors(sdt);updCam(dt);
  for(const k in S.items){const it=S.items[k];if(it.g.userData.flick)it.g.traverse(o=>{if(o.isSprite&&o.userData.fl){const f=o.userData.fl;const j=1+.14*Math.sin(S.fr*.5+o.id)+.1*Math.cos(S.fr*.83+o.id*2);o.scale.set(f[0]*j,f[1]*(1+.2*Math.sin(S.fr*.7+o.id)),1)}})}
  S.fr++;if(S.fr%3==0)ui.prog&&uiProg();kAct()}
 /* ================= ממשק ================= */
 function build(){
  const p=document.createElement('div');p.id='svc';p.className='panel';p.style.display='none';
  p.innerHTML='<div class="svh"><b>🕎 סדרי העבודה</b><span id="svMin" class="svx" title="מזער">▁</span><span id="svX" class="svx">✕</span></div><div id="svList"></div><div id="svPlay" style="display:none"></div>';
  document.body.appendChild(p);ui.panel=p;
  const c=document.createElement('div');c.id='svCap';c.className='panel';c.style.display='none';c.innerHTML='<button type="button" id="svCapMin" aria-label="מזער או הרחב כיתוב"></button><div class="svn" id="svCapN"></div><div id="svCapT"></div><div class="svs" id="svCapS"></div>';document.body.appendChild(c);ui.cap=c;ui.capT=$('svCapT');
  {const b=$('svCapMin'),LSg=k=>{try{return localStorage.getItem(k)}catch(e){return null}},LSs=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};const paint=m=>{c.classList.toggle('cmin',m);b.textContent=m?'💬 כיתוב':'▁';b.title=m?'הצג את הכיתוב':'מזער את הכיתוב'};paint(LSg('bh_capmin')==='1');b.onclick=e=>{e.stopPropagation();const m=!c.classList.contains('cmin');paint(m);LSs('bh_capmin',m?'1':'0')}}
  $('svX').onclick=()=>show(false);
  $('svMin').onclick=()=>{const m=p.classList.toggle('min');$('svMin').textContent=m?'▢':'▁'};
  const L=$('svList'),cats=['תמידין','קרבנות','מנחות','אחר'];
  cats.forEach(cat=>{const xs=SERVICES.filter(s=>(s.cat||'אחר')==cat);if(!xs.length)return;const h=document.createElement('div');h.className='svc-cat';h.textContent=cat;L.appendChild(h);
   xs.forEach(s=>{const b=document.createElement('button');b.className='svc-it';b.innerHTML='<span>'+s.name+'</span><small>'+(s.src||'')+'</small>';b.onclick=()=>open(s.id);L.appendChild(b)})});
  if(!SERVICES.length)L.textContent='אין תסריטים';
  const pl=$('svPlay');pl.innerHTML='<button class="svb" id="svBack">← כל הסדרים</button><h3 id="svT"></h3><div class="svsrc" id="svSrc"></div>'+
   '<div class="svbar"><button id="svPrev" title="שלב קודם">⏮</button><button id="svPP" class="pri">⏸</button><button id="svNext" title="שלב הבא">⏭</button><select id="svSpd"><option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="2">2×</option><option value="4">4×</option></select><button id="svNar" title="הקראה בקול">🔊</button><button id="svMus" title="מוזיקה">🎵</button><button id="svKid">👶</button><button id="svMoreB" title="מצלמה ורשימת שלבים">☰</button></div>'+
   '<div class="svprog"><i id="svProg"></i></div><div id="svMore" style="display:none"><div class="t" style="margin-top:8px">מצלמה</div><div class="svcam"><label><input type="radio" name="svcm" value="follow" checked> סיור רציף – עוקבת אחרי הכהן</label><label><input type="radio" name="svcm" value="script"> מצלמת התסריט (קופצת לכל תחנה)</label><label><input type="radio" name="svcm" value="free"> חופשי</label></div>'+
   '<div class="t" style="margin-top:8px">שלבים</div><div id="svSteps"></div></div>';
  $('svBack').onclick=()=>{close(true);uiBack()};$('svPP').onclick=()=>{if(!S)return;if(S.phase=='end'){goTo(0);S.playing=true}else S.playing=!S.playing;uiState()};
  $('svPrev').onclick=()=>{if(!S)return;goTo(S.t>2.5||S.phase!='run'&&S.idx==0?S.idx:S.idx-1);if(S.err)S.err=null;S.playing=true;uiState()};$('svNext').onclick=()=>{if(!S)return;if(S.idx<S.sc.steps.length-1){goTo(S.idx+1);S.playing=true;uiState()}};
  $('svMoreB').onclick=()=>{const m=$('svMore');m.style.display=m.style.display=='none'?'block':'none'};
  $('svSpd').onchange=e=>{if(!S)return;S.speed=+e.target.value;if(S.speed>2){AUD.stop();S.auDone=true}else AUD.rate(S.speed)};
  $('svNar').onclick=()=>{AUD.setNarr(!AUD.narrOn);if(S){if(AUD.narrOn)narrStart();else S.auDone=true}};$('svMus').onclick=()=>AUD.setMusic(!AUD.music);AUD.btn();
  const kidBtn=()=>{const b=$('svKid');b.classList.toggle('off',!KID);b.title=KID?'שפת ילדים (סיפור) – לחצו למעבר ללשון המקורות':'לשון המקורות – לחצו למעבר לשפת ילדים'};kidBtn();
  $('svKid').onclick=()=>{KID=!KID;try{localStorage.setItem('bh_kid',KID?'1':'0')}catch(e){}kidBtn();if(S){const st=S.sc.steps[S.idx];$('svCapT').textContent=stText(st);if(S.phase=='run'&&!AUD.speaking)S.minT=1.4+stText(st).length*.03}};
  document.querySelectorAll('input[name=svcm]').forEach(r=>r.onchange=()=>{if(!S||!r.checked)return;S.camMode=r.value;S.camTw=null;if(r.value=='follow')applyCam(null,false),applyFollowNow();else if(r.value=='script')applyCam(S.sc.steps[S.idx].cam,false)});
  renderer.domElement.addEventListener('pointerdown',()=>{if(S){S.camTw=null;S.ut=performance.now();S.drag=true}});renderer.domElement.addEventListener('wheel',()=>{if(S)S.ut=performance.now()},{passive:true});window.addEventListener('pointerup',()=>{if(S){S.drag=false;if(S.ut)S.ut=performance.now()}});kBuild()}
 /* ================= ממשק ילדים – עיצוב מחדש (18.11.2026): מסך כרטיסי סדרים, סרגל התקדמות (נקודות לחיצות), כפתורי סמל גדולים, סמל הפעולה ליד הכהן וסיכום בסוף.
   נראה רק ב-body.kid (kidui.js); במצב מבוגרים נשאר הפאנל הישן (#svList/#svPlay). אין טקסט הסברי חדש – רק שמות קצרים וסמלים; תגיות הפעולה (KTAG) מ-kidui.js.
   נטפרי: אייקון PNG רק דרך blob: (UI_ICONS[מזהה-סדר] ← src/ui_icons.js, אם קיים), גיבוי: אימוג'י. */
 const KN={'tamid-shachar':['תמיד של שחר','🌅'],'ketoret':['קטורת','🌫️'],'menorah':['הטבת הנרות','🕎'],'olat-behema':['עולה','🐑'],'minchat-solet':['מנחה','🌾'],'olat-haof':['עולת העוף','🕊️'],'yom-kippur':['יום הכיפורים','🕯️']};
 const kinfo=sc=>KN[sc.id]||[sc.name,'📜'];
 const ktags=sc=>(window.KTAG&&window.KTAG[sc.id])||[];
 const kemoji=(sc,i)=>{const t=ktags(sc)[i]||'',j=t.indexOf(' ');return j>0?t.slice(0,j):''};
 const _bu={};
 function blobUrl(k){if(k in _bu)return _bu[k];let u=null;try{const I=typeof UI_ICONS!='undefined'?UI_ICONS:null,d=I&&(I[k]||I['svc-'+k]||I['svc_'+k])||(typeof ICON2!='undefined'&&(ICON2['svc_'+k]||ICON2[k]));
   if(d){const i=d.indexOf(','),b=atob(d.slice(i+1)),a=new Uint8Array(b.length);for(let j=0;j<b.length;j++)a[j]=b.charCodeAt(j);u=URL.createObjectURL(new Blob([a],{type:'image/png'}))}}catch(e){u=null}return _bu[k]=u}
 function kIcon(el,key,em){el.textContent=em;const u=blobUrl(key);if(!u)return;const im=new Image();im.alt='';im.draggable=false;im.onload=()=>{el.textContent='';el.classList.add('im');el.appendChild(im)};im.src=u}
 const kmk=(tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e};
 function kBuild(){const p=ui.panel,B=document.body;B.classList.add('ksvl');
  /* מסך כרטיסים */
  const L=kmk('div',null);L.id='svKList';L.innerHTML='<div class="kh"><b>בחרו סדר</b><button id="svKX" class="kx" aria-label="סגירה" title="סגירה">✕</button></div><div class="kgrid" id="svKGrid"></div>';p.appendChild(L);
  const G=$('svKGrid'),ids=Object.keys(KN),list=ids.map(id=>SERVICES.find(s=>s.id==id)).filter(Boolean).concat(SERVICES.filter(s=>!KN[s.id]));
  list.forEach(sc=>{const[nm,em]=kinfo(sc),b=kmk('button','kcard');b.dataset.id=sc.id;b.setAttribute('aria-label',nm);
   b.innerHTML='<span class="kic"></span><b>'+nm+'</b><span class="kdt">'+'<i></i>'.repeat(sc.steps.length)+'</span>';kIcon(b.firstChild,sc.id,em);b.onclick=()=>open(sc.id);G.appendChild(b)});
  $('svKX').onclick=()=>show(false);
  /* סרגל בקרה בזמן סיור */
  const K=kmk('div',null);K.id='svKPlay';K.innerHTML='<div class="kt"><span class="kti"></span><b id="svKT"></b><em id="svKN"></em></div><div id="svDots" role="group" aria-label="שלבים"></div>'+
   '<div class="kctl"><div class="kg"><div class="kmain"><button id="svKPrev" class="kb big" aria-label="שלב קודם">⏮</button><button id="svKPP" class="kb big pri" aria-label="הפעלה והשהיה">⏸</button><button id="svKNext" class="kb big" aria-label="שלב הבא">⏭</button></div></div>'+
   '<div class="kg"><div id="svKSpd" class="kspd" role="group" aria-label="מהירות"><button data-v="0.5" aria-label="לאט">🐢</button><button data-v="1" aria-label="רגיל">🚶</button><button data-v="2" aria-label="מהר">🐇</button></div><button id="svKNar" class="kb" aria-label="הקראה">🔊</button><button id="svKMus" class="kb" aria-label="מוזיקה">🎵</button><button id="svKBack" class="kb" aria-label="חזרה לסדרים">⬅️</button></div></div>';p.appendChild(K);
  $('svKPrev').onclick=()=>$('svPrev').click();$('svKNext').onclick=()=>$('svNext').click();$('svKPP').onclick=()=>$('svPP').click();$('svKBack').onclick=()=>$('svBack').click();
  $('svKNar').onclick=()=>{$('svNar').click();kState()};$('svKMus').onclick=()=>{$('svMus').click();kState()};
  $('svKSpd').onclick=e=>{const b=e.target.closest('button');if(!b||!S)return;const sel=$('svSpd');sel.value=b.dataset.v;sel.onchange({target:sel});kState()};
  /* כפתור המצלמה (עוקב/חופשי) הוסר (משה, 20.11.2026): המצלמה תמיד עוקבת; מזיזים בעכבר – מבט חופשי וחזרה מונפשת אחרי 4 שניות */
  $('svDots').onclick=e=>{if(!S)return;let bi=0,bd=1e9;[...$('svDots').children].forEach((d,i)=>{const r=d.getBoundingClientRect(),dd=Math.abs(e.clientX-(r.left+r.right)/2);if(dd<bd){bd=dd;bi=i}});S.err=null;goTo(bi);S.playing=true;uiState()};
  /* מתגי הקראה/מוזיקה: משקפים את מצב הכפתורים הישנים (AUD.btn מעדכן אותם) */
  ['svNar','svMus'].forEach(id=>new MutationObserver(kState).observe($(id),{attributes:true,attributeFilter:['class']}));
  /* גובה הסרגל → מיקום הכתובית */
  if(window.ResizeObserver)new ResizeObserver(()=>{if(p.classList.contains('kplay'))B.style.setProperty('--kstrip',p.offsetHeight+'px')}).observe(p);
  /* סמל הפעולה ליד הכהן + מסך סיכום */
  ui.act=kmk('div',null);ui.act.id='svAct';ui.act.style.display='none';B.appendChild(ui.act);
  ui.end=kmk('div',null);ui.end.id='svEnd';ui.end.style.display='none';ui.end.innerHTML='<div class="ke1">🎉</div><b>סיימנו!</b><div class="ke2" id="svEIc"></div><div class="ke3"><button id="svEAgain" class="kb wide">↻ שוב</button><button id="svEList" class="kb wide">📋 סדרים</button></div>';B.appendChild(ui.end);
  $('svEAgain').onclick=()=>{if(S){goTo(0);S.playing=true;uiState()}};$('svEList').onclick=()=>$('svBack').click()}
 function kOpen(){if(!ui.panel||!$('svKList'))return;const sc=S.sc,[nm,em]=kinfo(sc);ui.panel.classList.add('kplay');document.body.classList.remove('ksvl');
  $('svKT').textContent=nm;const ti=ui.panel.querySelector('.kti');ti.classList.remove('im');ti.textContent='';kIcon(ti,sc.id,em);
  const D=$('svDots');D.innerHTML='<i></i>'.repeat(sc.steps.length);ui.curDot=null;ui.lastAct=null;ui.lastActK=null;
  requestAnimationFrame(()=>{if(ui.panel.classList.contains('kplay'))document.body.style.setProperty('--kstrip',ui.panel.offsetHeight+'px')})}
 function kBack(){if(!ui.panel||!$('svKList'))return;ui.panel.classList.remove('kplay');document.body.classList.add('ksvl');ui.act.style.display='none';ui.end.style.display='none';ui.cap.classList.remove('kend');ui.curDot=null}
 function kStep(){if(!$('svDots')||!S)return;const ds=$('svDots').children,n=ds.length;
  for(let i=0;i<n;i++){ds[i].className=i<S.idx?'d':i==S.idx?'c':'';ds[i].style.removeProperty('--p')}ui.curDot=ds[S.idx]||null;
  $('svKN').textContent=(S.idx+1)+' / '+n;
  const em=kemoji(S.sc,S.idx),A=ui.act,sk=S.sc.id+'#'+S.idx;if(A&&sk!==ui.lastActK){ui.lastActK=sk;ui.lastAct=em;if(typeof EI!='undefined')EI.setTag(A,S.sc.id,S.idx,em);else A.textContent=em;A.classList.remove('pop');void A.offsetWidth;A.classList.add('pop')}}
 function kProg(){if(!S||!ui.curDot)return;const f=S.phase=='run'?Math.min(1,S.t/Math.max(.1,S.minT)):1;ui.curDot.style.setProperty('--p',(100*f).toFixed(0)+'%')}
 function kState(){if(!S||!$('svKPP'))return;const end=S.phase=='end';$('svKPP').textContent=end?'↻':S.playing?'⏸':'▶';
  document.querySelectorAll('#svKSpd button').forEach(b=>b.classList.toggle('on',+b.dataset.v===S.speed));

  $('svKNar').classList.toggle('off',!AUD.narrOn);$('svKMus').classList.toggle('off',!AUD.music);
  const E=ui.end;if(E){const show=end&&ui.panel.classList.contains('kplay');E.style.display=show?'block':'none';ui.cap.classList.toggle('kend',end);
   if(show&&E.dataset.k!=S.sc.id){E.dataset.k=S.sc.id;{const ic=$('svEIc');ic.innerHTML='';S.sc.steps.forEach((s,i)=>{const e=kemoji(S.sc,i);if(!e)return;const sp=document.createElement('span');if(typeof EI!='undefined')EI.setTag(sp,S.sc.id,i,e);else sp.textContent=e;ic.appendChild(sp)})}}}}
 const _pv=V3(0,0,0);
 function kAct(){const e=ui.act;if(!e)return;if(S.fr%6==0)kProg();
  const hide=()=>{if(e.style.display!='none')e.style.display='none'};
  if(!document.body.classList.contains('kid')||S.err||S.phase=='end'||!ui.lastAct||!ui.panel.classList.contains('kplay'))return hide();
  const A=S.actors[S.follow];if(!A||!A.root.visible)return hide();
  camera.updateMatrixWorld();_pv.set(A.x,A.y+4.9,A.z).project(camera);
  const W=innerWidth,H=innerHeight,x=(_pv.x*.5+.5)*W,y=(-_pv.y*.5+.5)*H,lim=H-(parseFloat(document.body.style.getPropertyValue('--kstrip'))||130)-110;
  if(_pv.z>1||x<30||x>W-30||y<110||y>lim)return hide();
  if(e.style.display=='none')e.style.display='flex';e.style.transform='translate('+x.toFixed(0)+'px,'+y.toFixed(0)+'px) translate(-50%,-100%)'}
 function applyFollowNow(){const A=S.actors[S.follow];if(!A)return;const t=V3(A.x,A.y+3,A.z);flyTo(t.clone().add(followOff(A)),t,1.2)}
 let _side=null;
 function show(on){if(!ui.panel)return;ui.panel.style.display=on?'flex':'none';ui.cap.style.display=on&&S?'block':'none';const sd=$('side');if(on){_side=sd.style.display;sd.style.display='none';$('card').style.display='none'}else{sd.style.display=_side||'';if(S)close(true);uiBack();LIFE.tour(null)}}
 function uiOpenScript(){$('svList').style.display='none';$('svPlay').style.display='block';$('svT').textContent=S.sc.name;$('svSrc').textContent=S.sc.src||'';ui.cap.style.display='block';$('svMore').style.display='none';ui.panel.classList.remove('min');$('svMin').textContent='▁';kOpen();
  const st=$('svSteps');st.innerHTML='';S.sc.steps.forEach((s,i)=>{const b=document.createElement('button');b.className='svst';b.textContent=(i+1)+'. '+(s.title||s.text.slice(0,38)+(s.text.length>38?'…':''));b.onclick=()=>{goTo(i);S.playing=true;uiState()};st.appendChild(b)});
  S.speed=+$('svSpd').value;document.querySelectorAll('input[name=svcm]').forEach(r=>r.checked=r.value==S.camMode);AUD.btn();uiState()}
 function uiBack(){retChip(false);if(!ui.panel)return;$('svList').style.display='block';$('svPlay').style.display='none';ui.cap.style.display='none';kBack()}
 function uiState(){if(!S)return;$('svPP').textContent=S.phase=='end'?'↻':S.playing?'⏸':'▶';kState()}
 function uiStep(){const st=S.sc.steps[S.idx];if(typeof LIFE!='undefined'&&LIFE.tourStep)LIFE.tourStep(S.sc.id,S.idx);$('svCapN').textContent='שלב '+(S.idx+1)+' מתוך '+S.sc.steps.length;$('svCapT').textContent=stText(st);$('svCapS').textContent=st.src?'מקור: '+st.src:'';
  document.querySelectorAll('.svst').forEach((b,i)=>b.classList.toggle('on',i==S.idx));const on=document.querySelector('.svst.on');if(on&&on.scrollIntoView)on.scrollIntoView({block:'nearest'});uiState();uiProg();kStep()}
 function uiProg(){if(!S)return;const n=S.sc.steps.length;const f=(S.idx+(S.phase=='run'?Math.min(1,S.t/Math.max(.1,S.minT)):1))/n;$('svProg').style.width=(100*f)+'%';kProg()}
  function pauseT(){if(S&&S.playing){S.playing=false;uiState()}}
 function playT(){if(S&&!S.playing){if(S.phase=='end'){goTo(0)}S.playing=true;uiState()}}
 function stepBy(d){if(!S)return;const n=S.sc.steps.length;goTo(Math.max(0,Math.min(n-1,S.idx+d)));S.playing=true;uiState()}
 function stopT(){if(ui.panel&&ui.panel.style.display!='none')show(false);AUD.stop()}   /* יציאה מלאה מהסיור: עוצר, סוגר ומחזיר את הממשק */
 return{rampY,update,open,close,show,build,get S(){return S},goTo,SVL,pause:pauseT,play:playT,step:stepBy,stop:stopT,get isOpen(){return !!ui.panel&&ui.panel.style.display!='none'}}
})();
