/* ===== ערבות המזבח בסוכות (20.11.2026, בקשת משה) =====
   משנה סוכה ד:ה: "מקום היה למטה מירושלים ונקרא מוצא… ובאין וזוקפין אותן בצדי המזבח, וראשיהן כפופין על גבי המזבח".
   בבלי סוכה מה ע״א: "רבות וארוכות וגבוהות אחת עשרה אמה, כדי שיהיו גוחות על המזבח אמה" (ומונחות על היסוד – מר זוטרא שם).
   בדגם: ביום בורר היום = "סוכות" נוזקפות ערבות גבוהות 11 אמה (יחידה = אמה) מסביב למזבח (צפון, מערב, מזרח; בדרום הכבשים פנויים),
   וראשיהן כפופים פנימה, אמה אחת אל מעל המזבח. מיקום המזבח: AX=-26, AZ=-43, רצפת העזרה YA (app.js). קובץ נפרד כדי לא לגעת בקוד המזבח והקהל. */
const ARAVA=(()=>{
 const AX=-26,AZ=-43,H=11,EDGE=14;                           // מרכז המזבח; גובה הערבה (אמות); חצי רוחב הסובב העליון
 const g=new T.Group();g.visible=false;scene.add(g);GRP.arava=g;
 let _s=77;const R=()=>(_s=_s*16807%2147483647)/2147483647;
 /* קו הענף במערכת מקומית: x = פנימה (לכיוון המזבח), y = למעלה; כפיפה מתונה והקצה גוחה אמה מעל הסובב */
 const BASE=15.8,inward=BASE-(EDGE-1);                         // כמה צריך לגחון פנימה: עד אמה אחת אל תוך שפת המזבח
 const curve=new T.CatmullRomCurve3([[0,0,0],[.05,3.5,0],[.35,7,0],[1.1,9.7,0],[inward,H,0]].map(p=>new T.Vector3(...p)));
 const tube=new T.TubeGeometry(curve,18,.11,5,false);
 const mTrunk=new T.MeshStandardMaterial({color:0x8a5a3a,roughness:.95}),mLeaf=new T.MeshStandardMaterial({color:0x7f9f52,roughness:.9,side:T.DoubleSide});
 const spots=[];                                               // {x,z,ang}: מיקום הבסיס וכיוון "פנימה" (זווית סיבוב סביב Y)
 const add=(x,z,ix,iz)=>spots.push({x,z,ang:Math.atan2(-iz,ix)});
 for(let k=-5;k<=5;k++){const o=k*2.6;add(AX+o,AZ-BASE,0,1);add(AX-BASE,AZ+o,1,0);add(AX+BASE,AZ+o,-1,0)}   // צפון, מערב, מזרח (הדרום – הכבש הגדול והקטנים)
 const trunks=new T.InstancedMesh(tube,mTrunk,spots.length),o3=new T.Object3D();trunks.frustumCulled=false;trunks.castShadow=false;
 spots.forEach((s,i)=>{o3.position.set(s.x,YA,s.z);o3.rotation.set(0,s.ang,0);o3.scale.set(1,1,1);o3.updateMatrix();trunks.setMatrixAt(i,o3.matrix)});g.add(trunks);
 /* עלים: לאורך 70% העליונים של הענף, בפיזור סביב הענף */
 const LPER=46,leafGeo=new T.PlaneGeometry(1.5,.34);leafGeo.translate(.75,0,0);
 const leaves=new T.InstancedMesh(leafGeo,mLeaf,spots.length*LPER);leaves.frustumCulled=false;
 let n=0;const col=new T.Color();
 spots.forEach(s=>{const c=Math.cos(s.ang),sn=Math.sin(s.ang);
  for(let j=0;j<LPER;j++){const t=.3+.7*R(),p=curve.getPoint(t),a=R()*6.283,off=.18+R()*.3,ly=p.y+Math.sin(a)*off,lz=Math.cos(a)*off;
   // מקומי (x פנימה, z הצידה) → עולם
   const wx=s.x+p.x*c+lz*sn,wz=s.z-p.x*sn+lz*c;
   o3.position.set(wx,YA+ly,wz);o3.rotation.set(R()*1.2-.6,s.ang+R()*6.283,R()*1.2-.6);o3.scale.setScalar(.8+R()*.6);o3.updateMatrix();leaves.setMatrixAt(n,o3.matrix);
   col.setHSL(.24+R()*.05,.38+R()*.12,.34+R()*.1);leaves.setColorAt(n,col);n++}});
 g.add(leaves);
 const L=lbl('ערבות המזבח – גבוהות י״א אמה, וראשיהן כפופין על המזבח (סוכה מה ע״א)',AX,YA+H+3,AZ,'arava',160,0);if(L)L.cat='courts';
 const sel=document.getElementById('dayType');
 const upd=()=>{g.visible=!!sel&&sel.value==='sukkot'};
 if(sel){sel.addEventListener('change',upd);}upd();
 return{group:g,count:spots.length,update:upd}
})();
