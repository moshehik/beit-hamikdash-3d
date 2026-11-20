const fs=require('fs');
function ed(f,pairs){let s=fs.readFileSync(f,'utf8');for(const [a,b,n] of pairs){if(!s.includes(a))throw new Error(f+' missing '+n);s=s.replace(a,()=>b)}fs.writeFileSync(f,s)}
ed('src/services.js',[["  if(c&&c.fixed&&(c.pos||c.at)){","  {const A0=S.actors[S.follow];if(A0&&!jump&&!(c&&c.fixed)&&camera.position.distanceTo(V3(A0.x,A0.y,A0.z))>120){S.fd=null;S.fAz=null;const t0=V3(A0.x,A0.y+3,A0.z);flyTo(t0.clone().add(followOff(A0)),t0,.5);return}}   /* הדמות רחוקה מאוד (למשל אחרי שלב בדרך המדבר) – מעבר מהיר ולא מסע ארוך של המצלמה */\n  if(c&&c.fixed&&(c.pos||c.at)){",'far']]);
ed('tools/gen-yk.cjs',[["s.garb==='gold'||s.garb==='white'?s.garb:'none']","s.garb==='gold'||s.garb==='white'?s.garb:'none',s.tevila?1:0]",'row']]);
ed('tools/yk-template.js',[
["want=garb=='gold'?'hg':garb=='white'?'hy':'hn';","want=garb=='gold'?'hg':garb=='white'?'hy':(d[7]||n<=27||n>=128)?'hn':cur_hp;",'want'],
["const FIXED=new Set([69,70,71,72,77,78,81]);","const FIXED=new Set([70,71,72,77,78]);",'fixed'],
["const START={};Object.keys(ACTORS).forEach(a=>START[a]={at:ND.parva.slice(0,2),face:'s',hidden:1});","const START={};Object.keys(ACTORS).forEach(a=>START[a]={at:ND.parva.slice(0,2),face:'s',hidden:1});START.hn={at:ND.parh.slice(0,2),face:'s'};",'start']]);
console.log('ok');
