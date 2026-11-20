const fs=require('fs');
function ed(f,pairs){let s=fs.readFileSync(f,'utf8');for(const [a,b,n] of pairs){if(!s.includes(a))throw new Error(f+' missing '+n);s=s.replace(a,()=>b)}fs.writeFileSync(f,s)}
ed('src/jerusalem.js',[
[" let h=(e-740)*2;"," let h=(e-740)*2;h-=150*smth(2680,2730,x)*gs(z,-60,420,4);   /* הצוק במדבר: מדרון תלול אל נחל (דרך השעיר המשתלח – יומא ו:ד–ו) */",'terr'],
["// גשר פרה אדומה: הר הבית – הר המשחה",`/* ===== דרך השעיר המשתלח: מגשר הר המשחה אל הצוק במדבר; עשר סוכות לאורך הדרך (משנה יומא ו:ד–ח; רמב״ם עבודת יום הכיפורים ג:ו–ח)
   "עשר סוכות מירושלים ועד צוק, תשעים רִיס – שבעה וחצי לכל מיל" (יומא ו:ד) ≈ 12 מיל ≈ 24,000 אמה; בדגם המרחק מכווץ (כ-1,300 אמה בין הסוכה הראשונה לצוק), והמיקום משוער. */
const AZAZEL=(()=>{const ZB=-57.5,pz=x=>ZB+(x<800?0:70*Math.sin((x-800)/340)),path=[];for(let x=722;x<=2680;x+=70)path.push([x,pz(x)]);path.push([2684,pz(2684)]);
 const booths=[];for(let i=0;i<10;i++){const x=1380+i*131,z=pz(x);booths.push({x,z:z-15,fx:x,fz:z-5})}
 const seg=(x0,x1)=>{const r=path.filter(p=>p[0]>x0&&p[0]<x1);r.push([x1,pz(x1)]);return r};
 return{pz,path,booths,seg,cliff:[2684,pz(2684)]}})();
{const rr_=(a,b)=>a+(b-a)*rand();const A=AZAZEL,rock=new T.MeshStandardMaterial({color:0x9a8660,roughness:1}),leaf=new T.MeshStandardMaterial({color:0x6f8f3c,roughness:1}),dirt=0xc9b585;
 /* שביל עפר מן הגשר אל הצוק */
 {const cu=new T.CatmullRomCurve3(A.path.map(p=>new T.Vector3(p[0],0,p[1]))),N=Math.ceil(cu.getLength()/10),pos=[],idx=[];
  for(let i=0;i<=N;i++){const t=i/N,c=cu.getPoint(t),tg=cu.getTangent(t),ln=Math.hypot(tg.x,tg.z)||1,nx=-tg.z/ln,nz=tg.x/ln;[-1,1].forEach(sg=>{const x=c.x+sg*nx*3,z=c.z+sg*nz*3;pos.push(x,terrH(x,z)+1.1,z)});if(i<N){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
  const m=new T.Mesh(g,new T.MeshStandardMaterial({color:dirt,roughness:1,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));m.receiveShadow=true;gE.add(m)}
 /* עשר סוכות: ארבעה עמודים, גג ענפים, קיר אחורי, שולחן עם כד מים ולחם ("הרי מזון והרי מים") */
 const HEB=['א׳','ב׳','ג׳','ד׳','ה׳','ו׳','ז׳','ח׳','ט׳','י׳'];
 A.booths.forEach((b,i)=>{const y=terrH(b.x,b.z),g=new T.Group();g.position.set(b.x,y,b.z);gE.add(g);
  [[-3.2,-2.6],[3.2,-2.6],[-3.2,2.6],[3.2,2.6]].forEach(([dx,dz])=>{const p=new T.Mesh(new T.CylinderGeometry(.22,.26,5.2,6),M.wood);p.position.set(dx,2.6,dz);p.castShadow=true;g.add(p)});
  const roof=new T.Mesh(new T.BoxGeometry(8.6,.45,7.2),leaf);roof.position.set(0,5.4,0);roof.rotation.z=.05;roof.castShadow=true;g.add(roof);
  const back=new T.Mesh(new T.BoxGeometry(7,4.2,.35),leaf);back.position.set(0,2.4,-2.7);g.add(back);
  const tb=new T.Mesh(new T.BoxGeometry(3,1,1.3),M.wood);tb.position.set(0,.6,-1.4);tb.castShadow=true;g.add(tb);
  const jar=new T.Mesh(new T.CylinderGeometry(.35,.28,.9,10),new T.MeshStandardMaterial({color:0xb06a3a,roughness:.8}));jar.position.set(-.8,1.55,-1.4);g.add(jar);
  const loaf=new T.Mesh(new T.SphereGeometry(.32,8,6),new T.MeshStandardMaterial({color:0xd9a860,roughness:1}));loaf.scale.set(1.3,.6,1);loaf.position.set(.7,1.3,-1.4);g.add(loaf);
  lbl('סוכה '+HEB[i],b.x,y+9,b.z,'pHer',700,0)});
 /* הצוק: סלעים על שפת המדרון ובבסיסו */
 {const cz=A.cliff[1];lbl('הצוק במדבר – מקום שילוח השעיר',2686,terrH(2684,cz)+22,cz,'pHer',1800,1);
  rep(34,k=>{const x=2686+rr_(-4,10),z=cz+rr_(-300,300),y=terrH(x,z),s=rr_(3,9),m=new T.Mesh(new T.DodecahedronGeometry(s,0),rock);m.position.set(x,y+s*.3,z);m.rotation.set(rr_(0,3),rr_(0,3),0);m.scale.set(1,.7,1);m.castShadow=true;gE.add(m)});
  rep(50,k=>{const x=2735+rr_(0,90),z=cz+rr_(-300,300),y=terrH(x,z),s=rr_(2,7),m=new T.Mesh(new T.DodecahedronGeometry(s,0),rock);m.position.set(x,y+s*.3,z);m.rotation.set(rr_(0,3),rr_(0,3),0);m.scale.set(1,.7,1);m.castShadow=true;gE.add(m)})}}
// גשר פרה אדומה: הר הבית – הר המשחה`,'azazel']]);
console.log('ok');
