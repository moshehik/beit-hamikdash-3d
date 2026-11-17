// יוצר איקון חימר (3D claymation) של אובייקט מהדגם **לפי רינדור התלת־ממד של הדגם עצמו** – ולא לפי תיאור טקסט בלבד (כלל משה, 18.11.2026; ר' ICONS_RULE.md).
//   node tools/icon-from-render.cjs <key> <outdir> "<תיאור קצר באנגלית של מה שנראה ברינדור: צורה, חומרים, צבעים, פרטים חובה>" <render1.jpg> [render2.jpg ...]
//   פלט: <outdir>/<key>_1.jpg (רקע ירוק #00FF00) → אחר כך:  python -I tools/landing-icons.py <dir> <out>  ו-  python -I tools/pack-ui-icons.py <out>
// מנוע Gemini באורקל (POST /generate עם images, עד 4): print-center/docs/oracle-server/gemini-engine/CONNECT-FROM-OTHER-SITE.md. הטוקן נקרא ב-ssh ולא מודפס/נשמר.
// מגבלה: 20 תמונות בשעה ל-X-Requester (120 כללי) – לא ללולאות.
const fs=require('fs'),p=require('path'),cp=require('child_process'),os=require('os');
const [key,outdir,desc,...refs]=process.argv.slice(2);
if(!key||!outdir||!desc||!refs.length){console.log('usage: node tools/icon-from-render.cjs <key> <outdir> "<description>" <render.jpg>...');process.exit(1)}
const tok=process.env.GEMINI_ENGINE_TOKEN||cp.execFileSync('ssh',['-o','BatchMode=yes','-i',p.join(os.homedir(),'.ssh','oracle_new_ed25519'),'opc@92.5.172.95','cat /opt/gemini-engine/token.txt'],{encoding:'utf8',timeout:30000}).trim();
const STYLE='Shiny 3D claymation, Pixar-like children\'s app icon, vivid saturated colors, warm lighting, glossy. The object is centered and fills about 80 percent of the frame. SOLID PURE GREEN #00FF00 background, no text, no letters, no ground shadow, no people. Same style as a cute golden menorah icon.';
const prompt='Using the provided image'+(refs.length>1?'s':'')+' of a 3D model as the EXACT reference for the shape, proportions, materials and colors, create a stylized clay-like icon of this same object. Keep every structural detail visible in the reference and do not replace it with a different kind of object. Details that must be preserved: '+desc+' '+STYLE;
const images=refs.map(f=>({mimeType:'image/jpeg',base64:fs.readFileSync(f).toString('base64')}));
const tmp=p.join(os.tmpdir(),'iconref-'+process.pid+'.json'),NL=String.fromCharCode(10);
fs.writeFileSync(tmp,JSON.stringify({prompt,images,format:'jpeg',only:'default'}));
const r=cp.spawnSync('curl',['-s','-m','175','-w',NL+'%{http_code}','-X','POST','-H','Authorization: Bearer '+tok,'-H','X-Requester: temple-ui-refs','-H','Content-Type: application/json','--data-binary','@'+tmp,'https://nblm.chavarivkalandauhydrotherapy.co.il/gemini/generate'],{encoding:'utf8',maxBuffer:128*1024*1024,env:{...process.env,MSYS2_ARG_CONV_EXCL:'*'}});
try{fs.unlinkSync(tmp)}catch(e){}
const parts=(r.stdout||'').split(NL),code=parts.pop();let j=null;try{j=JSON.parse(parts.join(NL))}catch(e){}
if(j&&j.ok&&j.base64){fs.mkdirSync(outdir,{recursive:true});fs.writeFileSync(p.join(outdir,key+'_1.jpg'),Buffer.from(j.base64,'base64'));console.log('ok',key,j.account)}
else{console.log('FAIL',key,code,j&&(j.error||j.code)||'');process.exit(2)}
