// writes the queued daemon commands: setup + (normal,real) shots for several populations
const fs=require('fs'),path=require('path');const CMD=path.join(__dirname,'..','people-work','cmd');
const place=(pop,dist,elev,dx,dz)=>`
const m={Y:'man',K:'kohen',Q:'sit',W:'woman',L:'levi',S:'sage'};
const E=CROWD.entities().filter(e=>e.pop==='${pop}'||e.pop===m['${pop}']);if(!E.length)return 'none';
let best=null,bn=-1;const S=E.length>120?E.filter((_,i)=>i%Math.ceil(E.length/120)==0):E;
for(const e of S){let c=0;for(const f of E)if(Math.abs(e.x-f.x)<7&&Math.abs(e.z-f.z)<7)c++;if(c>bn){bn=c;best=e}}
const D=window.__dbg;if(D.walk)D.setWalk(false);const ty=(best.y||0)+1.7;
const go=()=>{D.controls.target.set(best.x,ty,best.z);D.camera.position.set(best.x+${dx}*${dist},ty+${dist}*${elev},best.z+${dz}*${dist});D.controls.update()};
go();await new Promise(r=>setTimeout(r,1500));go();
document.querySelectorAll('body > *').forEach(e=>{if(e.tagName!=='CANVAS'&&!e.querySelector('canvas')&&!['SCRIPT','STYLE'].includes(e.tagName))e.style.visibility='hidden'});
`;
const out={'01.js':fs.readFileSync(path.join(__dirname,'setup.js'),'utf8')};
let n=2;
const specs=JSON.parse(process.env.SPECS);
for(const [name,pop,dist,elev,dx,dz] of specs){
 for(const real of [false,true]){
  out[String(n++).padStart(2,'0')+'.js']=`//shot ${name}-${real?'real':'normal'}.png 4500\nawait REALP.set(${real});await new Promise(r=>setTimeout(r,${real?7000:2500}));${place(pop,dist,elev,dx,dz)}return 'ok '+${real};`}}
for(const k in out)fs.writeFileSync(path.join(CMD,k),out[k]);console.log(Object.keys(out).join(' '));
