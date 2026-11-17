// אורז את assets/landing/*.png (איורי דף הכניסה שנוצרו ב-Gemini) ל-src/landing_icons.js:  const LAND_ICONS={tours:'data:image/png;base64,...',...}
// המפתחות = ערכי data-go בכרטיסי #landing: tours, model, walk, ark, map, kids, about.   הרצה ידנית:  node tools/pack-landing.cjs
const fs=require('fs'),p=require('path');const d=p.join(__dirname,'..');
const dir=p.join(d,'assets','landing');const out={};let tot=0;
fs.readdirSync(dir).filter(f=>/[.]png$/i.test(f)).sort().forEach(f=>{
  const b=fs.readFileSync(p.join(dir,f));
  if(b.readUInt32BE(12)!==0x49484452){console.log('skip (not png)',f);return}
  out[f.replace(/[.]png$/i,'')]='data:image/png;base64,'+b.toString('base64');tot+=b.length});
fs.writeFileSync(p.join(d,'src','landing_icons.js'),'// נוצר ע"י tools/pack-landing.cjs – אל תערוך ידנית\nconst LAND_ICONS='+JSON.stringify(out)+';\n');
console.log('packed',Object.keys(out).join(','),(tot/1024|0)+'KB png');
