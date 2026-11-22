// node build.js  -> ../beit-hamikdash-3d.html + עותק ב-C:/Users/moshe/Downloads (כל בנייה רגילה)
// OUT=<path> node build.js  -> כותב לנתיב אחר בלבד (לעבודה מקבילה, בלי לדרוס את הקובץ המשותף ובלי העתקה להורדות)
const fs=require('fs'),p=require('path');const d=__dirname;
const r=f=>fs.readFileSync(p.join(d,f),'utf8');
const pre=['nikud_map','geodata','regions','app','lishkhot','jerusalem','jerusalem2','sukkot_arava','map_images','world_img','map','kids','npcs','instruments','figures_tex','figures','people','crowd','life','personas','npc_chat','narr','story','story_olat_haof','story_rosh_hashana','landing_icons','landing_svg','ui_icons','ui_icons2','emoji_icons','audio','world3d','rh_world','services'].filter(n=>fs.existsSync(p.join(d,'src',n+'.js'))).map(n=>r('src/'+n+'.js'));   // narr.js = הקראות Gemini (נוצר ע"י tools/narration.cjs; לא חובה)
const svcDir=p.join(d,'src','svc'),svc=fs.existsSync(svcDir)?fs.readdirSync(svcDir).filter(f=>/[.]js$/.test(f)).sort().map(f=>fs.readFileSync(p.join(svcDir,f),'utf8')):[];   // src/svc/*.js = תסריטי סדרי העבודה (לפי סדר א״ב)
const app=pre.concat(svc,[r('src/ui.js'),r('src/kidui.js'),r('src/remote.js')].concat(fs.existsSync(p.join(d,'src','nikud_dom.js'))?[r('src/nikud_dom.js')]:[])).join(String.fromCharCode(10));
const html=r('src/template.html').replace('{{THREE}}',()=>r('lib/three.min.js')).replace('{{ORBIT}}',()=>r('lib/orbit.js')).replace('{{APP}}',()=>app);
// CHUNKS_OUT=<file.json> node build.js -> (לפרסום באתר החי) מפצל לקבצי JS נפרדים שנשמרים במטמון הדפדפן: vendor / img / data / app, ו-html בלי סקריפטים (<!--@CHUNKS@-->)
if(process.env.CHUNKS_OUT){
 const STAGE=process.env.STAGE==null?3:+process.env.STAGE;   // שלבי בדיקה מול הסינון (20.11.2026)
 const names=['nikud_map','geodata','regions','app','lishkhot','jerusalem','jerusalem2','sukkot_arava','map_images','world_img','map','kids','npcs','instruments','figures_tex','figures','people','crowd','life','personas','npc_chat','narr','story','story_olat_haof','story_rosh_hashana','landing_icons','landing_svg','ui_icons','ui_icons2','emoji_icons','audio','world3d','rh_world','services'].filter(n=>fs.existsSync(p.join(d,'src',n+'.js'))&&!(STAGE<2&&['world3d','world_img'].includes(n)));
 const IMG=['landing_icons','ui_icons','ui_icons2'],LAZY=['map_images','world_img'],DATA=['nikud_map','geodata','regions','narr','landing_svg'];   // מודולים של נתונים טהורים (נבדקו: רצים לבד) – מועברים לפני הקוד
 const NLN=String.fromCharCode(10),J=a=>a.map(n=>r('src/'+n+'.js')).join(NLN);
 const code=names.filter(n=>!IMG.includes(n)&&!DATA.includes(n)&&!LAZY.includes(n));
 const mi=names.includes('map_images')?r('src/map_images.js').split(String.fromCharCode(10)):[],miMeta=mi.filter(l=>l.startsWith('const MAP_IMG_META')),miImg=mi.filter(l=>!l.startsWith('const MAP_IMG_META'));   // תמונות המפה (925KB) נטענות ברקע אחרי העלייה; המטא-דאטה הקטן נשאר ב-data
 const tail=[r('src/ui.js'),r('src/kidui.js')].concat(STAGE<1?[]:[STAGE>=3?r('src/remote.js'):r('src/remote.js').replace(/\/\/VOICE-BEGIN[\s\S]*?\/\/VOICE-END/g,'')]).concat(fs.existsSync(p.join(d,'src','nikud_dom.js'))?[r('src/nikud_dom.js')]:[]);
 const chunks=[{name:'vendor',code:r('lib/three.min.js')+NLN+r('lib/orbit.js')},{name:'img',code:J(IMG.filter(n=>names.includes(n)))},{name:'data',code:J(DATA.filter(n=>names.includes(n)))+NLN+miMeta.join(NLN)},{name:'app',code:J(code)+NLN+svc.join(NLN)+NLN+tail.join(NLN)},{name:'mapimg',lazy:true,code:miImg.join(NLN)+NLN+(names.includes('world_img')?r('src/world_img.js'):'')+NLN+';window.__mapImgsLoaded&&window.__mapImgsLoaded();'}];
 let shell=r('src/template.html');
 const A='<script>{{THREE}}</script>',B='<script>{{ORBIT}}</script>',C='<script>{{APP}}</script>';
 if(!shell.includes(A)||!shell.includes(B)||!shell.includes(C)){console.log('template placeholders not found');process.exit(1)}
 shell=shell.replace(A,'<!--@CHUNKS@-->').replace(B,'').replace(C,'');
 for(const c of chunks){try{new Function(c.code)}catch(e){console.log('SYNTAX ERROR in chunk',c.name,e.message);process.exit(1)}}
 fs.writeFileSync(process.env.CHUNKS_OUT,JSON.stringify({shell,chunks}));console.log('chunks ok',chunks.map(c=>c.name+' '+(c.code.length/1024|0)+'KB').join(', '));process.exit(0)
}
const out=process.env.OUT||p.join(d,'..','beit-hamikdash-3d.html');
fs.writeFileSync(out,html);
if(!process.env.OUT){try{fs.copyFileSync(out,'C:/Users/moshe/Downloads/beit-hamikdash-3d.html');console.log('copied to Downloads')}catch(e){console.log('copy failed',e.message)}}
const i=html.lastIndexOf('<script>');try{new Function(html.slice(i+8,html.lastIndexOf('</script>')));console.log('ok',(html.length/1024|0)+'KB','syntax ok')}catch(e){console.log('SYNTAX ERROR',e.message);process.exitCode=1}
