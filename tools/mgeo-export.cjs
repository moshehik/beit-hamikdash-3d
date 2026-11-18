// מייצא את הגיאומטריה של דף מפת המדינות (MGEOM מתוך src/map.js, בין הסימונים MGEO-BEGIN/END) + קו החוף (geodata) ל-JSON – קלט ל-tools/draw-region-map.py.
//   node tools/mgeo-export.cjs <out.json> [src-file=src/map.js]      (בלי נתיב: בדיקות רציפות בלבד)
// מקור אמת יחיד: אותו קוד רץ בדפדפן ובכלי הזה, כך שתמונת הייחוס תמיד מיושרת לשכבה הווקטורית.
const fs=require('fs'),p=require('path'),vm=require('vm');
const root=p.resolve(__dirname,'..'),rd=f=>fs.readFileSync(p.isAbsolute(f)?f:p.join(root,f),'utf8');
const k=rd(process.argv[3]||'src/map.js'),a=k.indexOf('/*MGEO-BEGIN*/'),b=k.indexOf('/*MGEO-END*/');
if(a<0||b<0){console.error('markers not found');process.exit(1)}
const ctx=vm.createContext({});
vm.runInContext('const COSL=0.82;'+rd('src/geodata.js')+';'+k.slice(a,b)+';this.OUT=MGEOM;',ctx);
const G=ctx.OUT,bad=G.check();
console.log('check:',bad.length?('BAD '+bad.join(' ')):'ok ('+Object.keys(G.atoms).length+' atoms, '+Object.keys(G.edges).length+' edges)');
const free=Object.keys(G.adj).filter(x=>G.adj[x].length==1).length;console.log('shared edges',Object.keys(G.adj).length-free,'free edges',free);
if(process.argv[2]){const o={B:G.B,land:G.land,casp:G.casp,atoms:Object.fromEntries(Object.entries(G.atoms).map(([i,v])=>[i,v.ring])),lakes:G.lakes,rivers:G.rivers,ridges:G.ridges,greens:G.greens};
 fs.mkdirSync(p.dirname(p.resolve(process.argv[2])),{recursive:true});fs.writeFileSync(process.argv[2],JSON.stringify(o));console.log('wrote',process.argv[2])}
if(bad.length)process.exit(2);
