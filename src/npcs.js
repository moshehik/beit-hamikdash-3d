/* ================= רישום דמויות (NPC) – חוזה משותף + זיהוי לחיצה =================
 מי שיוצר דמות (כהן, לוי, ישראלי, סנהדרין, שוער...) קורא, תחת הגנה typeof NPCS!='undefined':
   NPCS.register({id, kind, job:()=>string, who, getPos, pick:{obj}|{inst,index}, freeze(on), face(vec3), extra})
 - id: מחרוזת ייחודית (רישום חוזר באותו id מחליף). kind: kohen | kohen-gadol | levi | yisrael | sanhedrin | shoer (או k/g/y/o – ר' personas.js).
 - who: שם/תיאור קצר להצגה ("כהן מדשן את המזבח"). job(): מה הדמות עושה עכשיו (טקסט; נשלח למודל כהקשר – תאר רק מה שקורה באמת בדגם).
 - getPos(): THREE.Vector3 או [x,y,z] של הרגליים. pick: {obj} = Object3D (כולל ילדים) או {inst,index} = InstancedMesh ואינדקס המופע.
 - freeze(on): מקפיא/משחרר את תנועת הדמות. face(vec3): מסובב את הדמות אל נקודה (המצלמה). extra: מידע נוסף חופשי (למשל {role:'בעל קרבן'}).
 - brief (לא חובה): פונקציה שמחזירה טקסט קצר להצגה בחלון במקום job().
 NPCS.sv = דמויות נגן סדרי העבודה (נרשמות אוטומטית ע"י npc_chat.js מתוך SV.S.actors; לא מושפעות מ-clear()).
 NPCS.pickAt(clientX,clientY) -> {n,d,pt}|null : הדמות שהוקשה (raycast; ואם החטיא – קרבה על המסך לגוף הדמות), בכפוף להסתרה ע"י קירות. */
const NPCS=(()=>{
 const list=[],sv=[];
 const rcast=new THREE.Raycaster(),ndc=new THREE.Vector2(),v3=new THREE.Vector3(),v3b=new THREE.Vector3();
 const chainVis=o=>{for(;o;o=o.parent)if(!o.visible)return false;return true};
 const posOf=(n,out)=>{try{const p=n.getPos&&n.getPos();if(!p)return null;if(Array.isArray(p))return out.set(p[0],p[1],p[2]);if(p.isVector3)return out.copy(p);if(p.x!=null)return out.set(p.x,p.y||0,p.z)}catch(e){}return null};
 const reg=(arr,n)=>{if(!n)return n;const i=n.id!=null?arr.findIndex(x=>x.id===n.id):-1;if(i>=0)arr[i]=n;else arr.push(n);return n};
 function pickAt(cx,cy){
  const cv=renderer.domElement,r=cv.getBoundingClientRect();if(!r.width)return null;
  ndc.set((cx-r.left)/r.width*2-1,-((cy-r.top)/r.height)*2+1);rcast.setFromCamera(ndc,camera);rcast.far=700;
  const all=list.concat(sv);let best=null;const insts=new Map();
  const take=(n,d,pt)=>{if(!best||d<best.d)best={n,d,pt:pt?pt.clone():null}};
  for(const n of all){const p=n.pick;if(!p)continue;
   try{if(p.obj){if(!chainVis(p.obj))continue;const hs=rcast.intersectObject(p.obj,true);for(const h of hs){if(chainVis(h.object)){take(n,h.distance,h.point);break}}}
   else if(p.inst){if(!chainVis(p.inst))continue;let a=insts.get(p.inst);if(!a)insts.set(p.inst,a=[]);a.push(n)}}catch(e){}}
  for(const [inst,ns] of insts){try{const hs=rcast.intersectObject(inst,false);for(const h of hs){if(h.instanceId==null)continue;const n=ns.find(x=>x.pick.index===h.instanceId);if(n){take(n,h.distance,h.point);break}}}catch(e){}}
  /* החטיא (דמות קטנה/רחוקה): קרבה על המסך לקטע "רגליים–ראש" */
  if(!best){let bd=1e9;const W=r.width,H=r.height,rad=Math.max(14,Math.min(26,W/60));
   for(const n of all){if(n.pick&&n.pick.obj&&!chainVis(n.pick.obj))continue;if(n.pick&&n.pick.inst&&!chainVis(n.pick.inst))continue;const p0=posOf(n,v3);if(!p0)continue;
    const dist=camera.position.distanceTo(p0);if(dist>260||dist<1.5)continue;
    const a=p0.clone().project(camera);if(a.z>1)continue;const b=v3b.set(p0.x,p0.y+3.4,p0.z).project(camera);
    const ax=(a.x*.5+.5)*W,ay=(-a.y*.5+.5)*H,bx=(b.x*.5+.5)*W,by=(-b.y*.5+.5)*H,px=cx-r.left,py=cy-r.top;
    const dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy||1,u=Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/L2)),qx=ax+dx*u,qy=ay+dy*u,dd=Math.hypot(px-qx,py-qy);
    if(dd<rad&&dd<bd){bd=dd;best={n,d:dist,pt:null}}}}
  if(!best)return null;
  /* הסתרה ע"י קיר/אבן בין המצלמה לדמות (רק כשנמצא מכשול ברור קרוב יותר) */
  try{let tp=best.pt;if(!tp){const q=posOf(best.n,new THREE.Vector3());if(q){q.y+=2;tp=q}}if(typeof occ!=='undefined'&&tp){const dir=tp.clone().sub(camera.position),dist=dir.length();rcast.set(camera.position,dir.normalize());rcast.far=dist;
    const hs=rcast.intersectObjects(occ,false);for(const h of hs){if(h.distance<dist-3&&chainVis(h.object))return null}}}catch(e){}
  return best}
 return{list,sv,
  register(n){return reg(list,n)},
  unregister(id){const i=list.findIndex(x=>x.id===id);if(i>=0)list.splice(i,1)},
  clear(){list.length=0},
  get(id){return list.find(x=>x.id===id)||sv.find(x=>x.id===id)||null},
  pickAt,posOf}
})();
