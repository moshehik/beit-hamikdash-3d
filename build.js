// node build.js  -> ../beit-hamikdash-3d.html + עותק ב-C:/Users/moshe/Downloads (כל בנייה רגילה)
// OUT=<path> node build.js  -> כותב לנתיב אחר בלבד (לעבודה מקבילה, בלי לדרוס את הקובץ המשותף ובלי העתקה להורדות)
const fs=require('fs'),p=require('path');const d=__dirname;
const r=f=>fs.readFileSync(p.join(d,f),'utf8');
const pre=['nikud_map','geodata','regions','app','lishkhot','jerusalem','map_images','map','kids','npcs','instruments','figures_tex','figures','people','crowd','life','personas','npc_chat','narr','story','story_olat_haof','landing_icons','landing_svg','ui_icons','audio','services'].filter(n=>fs.existsSync(p.join(d,'src',n+'.js'))).map(n=>r('src/'+n+'.js'));   // narr.js = הקראות Gemini (נוצר ע"י tools/narration.cjs; לא חובה)
const svcDir=p.join(d,'src','svc'),svc=fs.existsSync(svcDir)?fs.readdirSync(svcDir).filter(f=>/[.]js$/.test(f)).sort().map(f=>fs.readFileSync(p.join(svcDir,f),'utf8')):[];   // src/svc/*.js = תסריטי סדרי העבודה (לפי סדר א״ב)
const app=pre.concat(svc,[r('src/ui.js'),r('src/kidui.js')].concat(fs.existsSync(p.join(d,'src','nikud_dom.js'))?[r('src/nikud_dom.js')]:[])).join(String.fromCharCode(10));
const html=r('src/template.html').replace('{{THREE}}',()=>r('lib/three.min.js')).replace('{{ORBIT}}',()=>r('lib/orbit.js')).replace('{{APP}}',()=>app);
const out=process.env.OUT||p.join(d,'..','beit-hamikdash-3d.html');
fs.writeFileSync(out,html);
if(!process.env.OUT){try{fs.copyFileSync(out,'C:/Users/moshe/Downloads/beit-hamikdash-3d.html');console.log('copied to Downloads')}catch(e){console.log('copy failed',e.message)}}
const i=html.lastIndexOf('<script>');try{new Function(html.slice(i+8,html.lastIndexOf('</script>')));console.log('ok',(html.length/1024|0)+'KB','syntax ok')}catch(e){console.log('SYNTAX ERROR',e.message);process.exitCode=1}
