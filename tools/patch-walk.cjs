const fs=require('fs');let s=fs.readFileSync('src/ui.js','utf8');
const a="const w=pendingWalk||(()=>{const t=controls.target;return[t.x,t.z+10,0]})();";
if(!s.includes(a))throw new Error('missing');
s=s.replace(a,()=>"const w=pendingWalk||(()=>{const t=controls.target,c=camera.position,dx=t.x-c.x,dz=t.z-c.z;return[t.x,t.z,Math.hypot(dx,dz)>1?Math.atan2(dx,-dz)*180/Math.PI:0,t.y>8?t.y:undefined]})();   /* מעבר ממבט־על לטיול: נשארים באותו מקום (מרכז המבט) ובאותו כיוון מבט */");
fs.writeFileSync('src/ui.js',s);console.log('ok');
