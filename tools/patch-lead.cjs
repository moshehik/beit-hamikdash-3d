const fs=require('fs');let s=fs.readFileSync('src/services.js','utf8');
const a="  uiStep();if(st.cam!==undefined&&st.cam!==null)applyCam(st.cam,jump);";
if(!s.includes(a))throw new Error('missing');
s=s.replace(a,()=>`  if(S.camMode=='follow'&&!(st.cam&&st.cam.follow)){const L=leadActor(st.actions||[]);if(L&&L!==S.follow){S.follow=L;S.fboost=1.6}}   /* מצלמת מעקב: עוברת אל הדמות הפעילה בשלב (לא נשארת על main) */
`+a);
const b=" function startStep(jump){";
s=s.replace(b,()=>` /* הדמות "הראשית" של השלב: מי שהולכת הכי רחוק / עושה את רוב הפעולות (לא מחשיבים דמויות נסתרות) */
 function leadActor(actions){const sc={},visit=a=>{if(Array.isArray(a)){a.forEach(visit);return}if(!a||typeof a!='object')return;if(a.seq)visit(a.seq);
   if(a.who&&S.actors[a.who]){let w=0;if(a.walk){let p=null,L=0;for(const q of a.walk){if(p)L+=Math.hypot(q[0]-p[0],q[1]-p[1]);p=q}w=3+L*.05}else if(a.anim||a.take||a.give||a.drop||a.pose)w=1;else if(a.face||a.vis)w=.1;sc[a.who]=(sc[a.who]||0)+w}};
  visit(actions);let best=null,bs=0;for(const k in sc){const A=S.actors[k];if(sc[k]>bs&&A&&A.root&&A.root.visible!==false){bs=sc[k];best=k}}return best}
`+b);
fs.writeFileSync('src/services.js',s);console.log('ok');
