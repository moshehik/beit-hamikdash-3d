// איורי ערים דקורטיביים (Gemini, חימר תלת־ממדי) לדף השבטים – מסומנים בממשק "איור – לא מדויק"; לא נתון עובדתי (ירושלים משתמשת ברינדורי הדגם).
//   node tools/gen-city-decos.cjs [outdir=assets/maps/raw/cities]   → city_<key>.jpg  ואז:  python -X utf8 tools/prep-deco.py assets/maps/raw/cities
// 6 קריאות בלבד, ברצף (X-Requester: temple-cities; מגבלה 20/שעה). קיימים – מדלגים.
const fs=require('fs'),p=require('path'),cp=require('child_process'),os=require('os');
const out=process.argv[2]||p.join(__dirname,'..','assets','maps','raw','cities');fs.mkdirSync(out,{recursive:true});
const tok=process.env.GEMINI_ENGINE_TOKEN||cp.execFileSync('ssh',['-o','BatchMode=yes','-i',p.join(os.homedir(),'.ssh','oracle_new_ed25519'),'opc@92.5.172.95','cat /opt/gemini-engine/token.txt'],{encoding:'utf8',timeout:30000}).trim();
const STYLE=' 3D claymation, Pixar-like children\'s book illustration, vivid saturated colors, warm golden light, cute, wide landscape 16:10 composition. No text, no letters, no signs, no people, no flags, no religious symbols of other faiths.';
const C={
 city_shiloh:'An ancient hill-country town of Israel in the hills of Ephraim: a large tent sanctuary with beautiful woven curtains inside a fenced courtyard on a green hilltop, olive trees, terraced fields, small stone houses.',
 city_hebron:'An ancient stone town on rocky hills among vineyards and old olive trees in the Judean hills, simple flat-roofed houses and a large rectangular enclosure of big pale cut stones, blue sky.',
 city_shechem:'An ancient town in a green valley between two tall mountains, stone houses, olive groves, a spring and a big oak tree, morning light.',
 city_jericho:'An ancient oasis city of date palm trees with a round stone tower and a mud-brick wall, a spring and green gardens, dry golden mountains of the desert behind.',
 city_jaffa:'An ancient Mediterranean port town on a rocky coast, stone harbor, wooden sailing ships with cedar logs being unloaded, small sandy-stone houses on the hill, turquoise sea.',
 city_jerusalem:'The ancient City of David on a ridge between deep valleys: stone houses climbing the hillside, strong fortress walls and towers, olive trees, golden evening light, dry hills around.'};
for(const k of Object.keys(C)){const f=p.join(out,k+'.jpg');if(fs.existsSync(f)){console.log('skip',k);continue}
 const prompt=C[k]+STYLE,tmp=p.join(os.tmpdir(),'city-'+process.pid+'.json'),NL=String.fromCharCode(10);
 fs.writeFileSync(tmp,JSON.stringify({prompt,format:'jpeg',only:'default'}));
 const r=cp.spawnSync('curl',['-s','-m','175','-w',NL+'%{http_code}','-X','POST','-H','Authorization: Bearer '+tok,'-H','X-Requester: temple-cities','-H','Content-Type: application/json','--data-binary','@'+tmp,'https://nblm.chavarivkalandauhydrotherapy.co.il/gemini/generate'],{encoding:'utf8',maxBuffer:128*1024*1024,env:{...process.env,MSYS2_ARG_CONV_EXCL:'*'}});
 try{fs.unlinkSync(tmp)}catch(e){}
 const parts=(r.stdout||'').split(NL),code=parts.pop();let j=null;try{j=JSON.parse(parts.join(NL))}catch(e){}
 if(j&&j.ok&&j.base64){fs.writeFileSync(f,Buffer.from(j.base64,'base64'));console.log('ok',k)}else console.log('FAIL',k,code,j&&(j.error||j.code)||'')}
