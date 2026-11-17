// מייצא את הגיאומטריה של דף השבטים (KGEOM מתוך src/kids.js, בין הסימונים KGEO-BEGIN/END) + קו החוף (geodata) ל-JSON – קלט ל-tools/draw-base-map.py.
//   node tools/kgeo-export.cjs <out.json>      (בלי נתיב: מדפיס בדיקות רציפות בלבד)
// מקור אמת יחיד: אותו קוד רץ בדפדפן ובכלי הזה, כך שתמונת הייחוס תמיד מיושרת לשכבה הווקטורית.
const fs=require('fs'),p=require('path'),vm=require('vm');
const root=p.resolve(__dirname,'..'),rd=f=>fs.readFileSync(p.join(root,f),'utf8');
const k=rd('src/kids.js'),a=k.indexOf('/*KGEO-BEGIN*/'),b=k.indexOf('/*KGEO-END*/');
if(a<0||b<0){console.error('markers not found');process.exit(1)}
const ctx=vm.createContext({});
vm.runInContext('const COSL=0.82;'+rd('src/geodata.js')+';'+k.slice(a,b)+';this.OUT=KGEOM;',ctx);
const G=ctx.OUT,bad=G.check();
console.log('ring chain check:',bad.length?('BAD '+bad.join(' ')):'ok ('+Object.keys(G.rings).length+' rings)');
if(process.argv[2]){const o={B:G.B,land:G.land,tribes:G.tribes,lakes:G.lakes,rivers:G.rivers,ridges:G.ridges};fs.mkdirSync(p.dirname(p.resolve(process.argv[2])),{recursive:true});fs.writeFileSync(process.argv[2],JSON.stringify(o));console.log('wrote',process.argv[2])}
if(bad.length)process.exit(2);
