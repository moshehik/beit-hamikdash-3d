// אורז את assets/*.png (ספרייטים ריאליסטיים שנוצרו במנוע Gemini) ל-src/sprites_data.js:  const SPR={שם:{u:'data:image/png;base64,...',w:רוחב,h:גובה}}
//   node tools/pack-sprites.cjs        (build.js אינו מפעיל אותו; מריצים ידנית אחרי שמחליפים תמונה ב-assets/)
const fs=require('fs'),p=require('path');const d=p.join(__dirname,'..');
const dir=p.join(d,'assets');const out={};let tot=0;
fs.readdirSync(dir).filter(f=>/[.]png$/i.test(f)).sort().forEach(f=>{
  const b=fs.readFileSync(p.join(dir,f));
  if(b.readUInt32BE(12)!==0x49484452){console.log('skip (not png)',f);return}
  out[f.replace(/[.]png$/i,'')]={u:'data:image/png;base64,'+b.toString('base64'),w:b.readUInt32BE(16),h:b.readUInt32BE(20)};tot+=b.length});
fs.writeFileSync(p.join(d,'src','sprites_data.js'),'// נוצר ע"י tools/pack-sprites.cjs – אל תערוך ידנית\nconst SPR='+JSON.stringify(out)+';\n');
console.log('packed',Object.keys(out).join(','),(tot/1024|0)+'KB png');
