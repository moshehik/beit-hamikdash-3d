// יוצר "גיליון דמות" (חזית/צד/גב) ב-Gemini (אורקל) מרינדור הדגם כתמונת ייחוס (ICONS_RULE.md). שימוש:
//   node tools/figure-sheet.cjs <key> <outdir> "<prompt מלא באנגלית>" <render1.jpg> [render2.jpg]
// X-Requester: temple-figures (עד ~20 תמונות בשעה). הטוקן נקרא ב-ssh ולא מודפס/נשמר. עם 503/429 מנסה שוב אחרי המתנה.
const fs=require('fs'),p=require('path'),cp=require('child_process'),os=require('os');
const [key,outdir,prompt,...refs]=process.argv.slice(2);
if(!key||!outdir||!prompt||!refs.length){console.log('usage: node tools/figure-sheet.cjs <key> <outdir> "<prompt>" <render.jpg>...');process.exit(1)}
const tok=process.env.GEMINI_ENGINE_TOKEN||cp.execFileSync('ssh',['-o','BatchMode=yes','-i',p.join(os.homedir(),'.ssh','oracle_new_ed25519'),'opc@92.5.172.95','cat /opt/gemini-engine/token.txt'],{encoding:'utf8',timeout:30000}).trim();
const images=refs.map(f=>({mimeType:'image/jpeg',base64:fs.readFileSync(f).toString('base64')}));
const tmp=p.join(os.tmpdir(),'figref-'+process.pid+'.json'),NL=String.fromCharCode(10);
fs.writeFileSync(tmp,JSON.stringify({prompt,images,format:'jpeg',only:'default'}));
let ok=false;
for(let a=0;a<4&&!ok;a++){
 const r=cp.spawnSync('curl',['-s','-m','175','-w',NL+'%{http_code}','-X','POST','-H','Authorization: Bearer '+tok,'-H','X-Requester: temple-figures','-H','Content-Type: application/json','--data-binary','@'+tmp,'https://nblm.chavarivkalandauhydrotherapy.co.il/gemini/generate'],{encoding:'utf8',maxBuffer:128*1024*1024,env:{...process.env,MSYS2_ARG_CONV_EXCL:'*'}});
 const parts=(r.stdout||'').split(NL),code=parts.pop();let j=null;try{j=JSON.parse(parts.join(NL))}catch(e){}
 if(j&&j.ok&&j.base64){fs.mkdirSync(outdir,{recursive:true});fs.writeFileSync(p.join(outdir,key+'.jpg'),Buffer.from(j.base64,'base64'));console.log('ok',key,j.account);ok=true}
 else{console.log('FAIL',key,code,j&&(j.error||j.code)||'attempt',a+1);if(code=='503'||code=='429'||code=='000'||code=='')Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,45000);else break}}
try{fs.unlinkSync(tmp)}catch(e){}
process.exit(ok?0:2)
