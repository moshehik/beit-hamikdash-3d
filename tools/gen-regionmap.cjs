// שולח את תמונת הייחוס הנקייה של מפת האזור (tools/draw-region-map.py) למנוע התמונות של Gemini באורקל ומקבל מפת "חימר תלת־ממדי" באותם קווי מתאר.
//   node tools/gen-regionmap.cjs <ref.png> <out.jpg> [strict]
// כלל ICONS_RULE: תמונת מפה שמוצגת כעובדה נוצרת מהנתונים; Gemini רק צובע על הייחוס. את היישור מאמת tools/verify-regionmap.py (ואם סטה – משתמשים בתמונה כרקע מטושטש בלבד).
// מגבלה: 20 תמונות בשעה ל-X-Requester (temple-region) – ללא לולאות. הטוקן נקרא ב-ssh ולא מודפס/נשמר.
const fs=require('fs'),p=require('path'),cp=require('child_process'),os=require('os');
const [ref,out,mode]=process.argv.slice(2);
if(!ref||!out){console.log('usage: node tools/gen-regionmap.cjs <ref.png> <out.jpg> [strict]');process.exit(1)}
const tok=process.env.GEMINI_ENGINE_TOKEN||cp.execFileSync('ssh',['-o','BatchMode=yes','-i',p.join(os.homedir(),'.ssh','oracle_new_ed25519'),'opc@92.5.172.95','cat /opt/gemini-engine/token.txt'],{encoding:'utf8',timeout:30000}).trim();
let prompt='Using the provided image as the exact reference for all outlines and positions, paint it as a beautiful 3D claymation children\'s relief map of the eastern Mediterranean and the Middle East: sea with gentle waves, sandy desert land, lush green fertile river valleys (the Nile with its delta, the Euphrates and Tigris), green hills and darker green mountain ranges where the reference has highlands, blue rivers and lakes, no text, no labels, no borders, no icons, no people, no buildings, no ships. Keep every coastline, island, sea, lake, river and mountain range in exactly the same place and the same shape, and keep the same landscape framing and 5:4 aspect ratio as the reference. Soft warm lighting, Pixar-like clay texture, top-down map view.';
if(mode==='strict')prompt+=' IMPORTANT: this is a map, so the position of every sea/land boundary (the Mediterranean, Aegean, Black Sea, Red Sea, Persian Gulf and Caspian Sea) and the Nile, Euphrates and Tigris must match the reference pixel for pixel. Do not move, rotate, crop, zoom, mirror or reinvent anything: only change the surface texture and colors to look like modeling clay.';
const images=[{mimeType:/png$/i.test(ref)?'image/png':'image/jpeg',base64:fs.readFileSync(ref).toString('base64')}];
const tmp=p.join(os.tmpdir(),'regionmap-'+process.pid+'.json'),NL=String.fromCharCode(10);
fs.writeFileSync(tmp,JSON.stringify({prompt,images,format:'jpeg',only:'default'}));
const r=cp.spawnSync('curl',['-s','-m','175','-w',NL+'%{http_code}','-X','POST','-H','Authorization: Bearer '+tok,'-H','X-Requester: temple-region','-H','Content-Type: application/json','--data-binary','@'+tmp,'https://nblm.chavarivkalandauhydrotherapy.co.il/gemini/generate'],{encoding:'utf8',maxBuffer:128*1024*1024,env:{...process.env,MSYS2_ARG_CONV_EXCL:'*'}});
try{fs.unlinkSync(tmp)}catch(e){}
const parts=(r.stdout||'').split(NL),code=parts.pop();let j=null;try{j=JSON.parse(parts.join(NL))}catch(e){}
if(j&&j.ok&&j.base64){fs.mkdirSync(p.dirname(p.resolve(out)),{recursive:true});fs.writeFileSync(out,Buffer.from(j.base64,'base64'));console.log('ok',out,j.account||'')}
else{console.log('FAIL',code,j&&(j.error||j.code)||'');process.exit(2)}
