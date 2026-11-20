const fs=require('fs');let s=fs.readFileSync('src/ui.js','utf8');
const rep=(a,b)=>{if(!s.includes(a))throw new Error('missing '+a.slice(0,60));s=s.replace(a,()=>b)};
rep(" fly(cam,tg);pendingWalk=wk}\nlet pendingWalk=null;"," fly(cam,tg);pendingWalk=wk;pendingTg=tg}\nlet pendingWalk=null,pendingTg=null;");
rep("const w=pendingWalk||(()=>{","const pw=(pendingWalk&&pendingTg&&Math.hypot(controls.target.x-pendingTg[0],controls.target.z-pendingTg[2])<40)?pendingWalk:null;pendingWalk=null;   /* נקודת ההליכה של תחנה תקפה רק אם עדיין מסתכלים עליה */\n  const w=pw||(()=>{");
/* נעילת הטיה (למעלה/מטה) בזמן גרירה במבט־על */
rep("try{controls.mouseButtons=","{const el=renderer.domElement,pmin=controls.minPolarAngle,pmax=controls.maxPolarAngle;let down=0;   /* בסיבוב המבט – רק ימינה/שמאלה; ההטיה למעלה/למטה נעולה (משה, 20.11.2026) */\n el.addEventListener('pointerdown',()=>{if(typeof walk!='undefined'&&walk)return;if(!down++){const a=controls.getPolarAngle();controls.minPolarAngle=a;controls.maxPolarAngle=a}},true);\n const up=()=>{if(down>0&&!--down){controls.minPolarAngle=pmin;controls.maxPolarAngle=pmax}};el.addEventListener('pointerup',up,true);el.addEventListener('pointercancel',up,true)}\ntry{controls.mouseButtons=");
fs.writeFileSync('src/ui.js',s);console.log('ok');
