// איורי ערים דקורטיביים (Gemini, חימר תלת־ממדי) לדף מפת המדינות – מסומנים בממשק "איור – לא מדויק"; לא נתון עובדתי (ירושלים משתמשת ברינדורי הדגם).
//   node tools/gen-region-cities.cjs [outdir=assets/maps/raw/cities]   → city_<key>.jpg  ואז:  python -X utf8 tools/prep-deco.py assets/maps/raw/cities
// 7 קריאות בלבד, ברצף (X-Requester: temple-region-cities; מגבלה 20/שעה). קיימים – מדלגים. בלי כיתוב, בלי אנשים, בלי סמלי דתות אחרות.
const fs=require('fs'),p=require('path'),cp=require('child_process'),os=require('os');
const out=process.argv[2]||p.join(__dirname,'..','assets','maps','raw','cities');fs.mkdirSync(out,{recursive:true});
const tok=process.env.GEMINI_ENGINE_TOKEN||cp.execFileSync('ssh',['-o','BatchMode=yes','-i',p.join(os.homedir(),'.ssh','oracle_new_ed25519'),'opc@92.5.172.95','cat /opt/gemini-engine/token.txt'],{encoding:'utf8',timeout:30000}).trim();
const STYLE=' 3D claymation, Pixar-like children\'s book illustration, vivid saturated colors, warm golden light, cute, wide landscape 16:10 composition. No text, no letters, no signs, no people, no flags, no statues, no idols, no religious symbols of any faith.';
const C={
 city_alexandria:'A great ancient white-stone harbor city on the Mediterranean coast of Egypt: a very tall white lighthouse tower on a small island joined to the city by a long causeway, wooden sailing ships in two harbors, white flat-roofed buildings with columned porches, palm trees, turquoise sea.',
 city_antioch:'An ancient city at the foot of a steep green mountain beside a river: a long straight street lined with stone columns, a stone bridge over the river, strong city walls climbing the mountainside, houses with red tiled roofs, cypress trees.',
 city_babylon:'An ancient city of enormous golden mud-brick walls and towers beside a wide river, a great stone bridge, terraced hanging gardens full of palm trees and flowers on the city walls, small reed boats on the river, flat desert plain around.',
 city_susa:'An ancient Persian palace city on a wide plain with snowy mountains far behind: a grand royal palace with a forest of tall slender stone columns and flat roofs, a broad staircase, date palms and gardens, warm sunset light.',
 city_caesarea:'A grand ancient man-made harbor city on a sandy Mediterranean coast: two long curved stone breakwaters enclosing a harbor, a tall stone lighthouse tower, wooden sailing ships, white limestone buildings, a long arched stone aqueduct running along the beach, turquoise sea.',
 city_petra:'A rose-red city carved into the cliffs of a narrow desert canyon: a grand carved stone building front with tall columns cut straight into the pink sandstone cliff, a winding canyon path, dry golden desert, a few camels without riders, warm light.',
 city_athens:'A white hilltop citadel above an ancient Mediterranean city: pale stone walls and halls with rows of columns on a rocky hill, an open-air stone theater built into the hillside, olive trees, a harbor with small sailing boats in the distance, blue sea and sky.'};
for(const k of Object.keys(C)){const f=p.join(out,k+'.jpg');if(fs.existsSync(f)){console.log('skip',k);continue}
 const prompt=C[k]+STYLE,tmp=p.join(os.tmpdir(),'rcity-'+process.pid+'.json'),NL=String.fromCharCode(10);
 fs.writeFileSync(tmp,JSON.stringify({prompt,format:'jpeg',only:'default'}));
 const r=cp.spawnSync('curl',['-s','-m','175','-w',NL+'%{http_code}','-X','POST','-H','Authorization: Bearer '+tok,'-H','X-Requester: temple-region-cities','-H','Content-Type: application/json','--data-binary','@'+tmp,'https://nblm.chavarivkalandauhydrotherapy.co.il/gemini/generate'],{encoding:'utf8',maxBuffer:128*1024*1024,env:{...process.env,MSYS2_ARG_CONV_EXCL:'*'}});
 try{fs.unlinkSync(tmp)}catch(e){}
 const parts=(r.stdout||'').split(NL),code=parts.pop();let j=null;try{j=JSON.parse(parts.join(NL))}catch(e){}
 if(j&&j.ok&&j.base64){fs.writeFileSync(f,Buffer.from(j.base64,'base64'));console.log('ok',k)}else console.log('FAIL',k,code,j&&(j.error||j.code)||'')}
