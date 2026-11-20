// one-off: adds the CHUNKS_OUT mode to build.js (kept for reference; idempotent)
const fs = require('fs');
let t = fs.readFileSync(__dirname + '/../build.js', 'utf8');
if (t.includes('CHUNKS_OUT')) { console.log('already patched'); process.exit(0); }
const NL = String.fromCharCode(10);
const add = [
"// CHUNKS_OUT=<file.json> node build.js -> (לפרסום באתר החי) מפצל לקבצי JS נפרדים שנשמרים במטמון הדפדפן: vendor / img / data / app, ו-html בלי סקריפטים (<!--@CHUNKS@-->)",
"if(process.env.CHUNKS_OUT){",
" const names=['nikud_map','geodata','regions','app','lishkhot','jerusalem','jerusalem2','sukkot_arava','map_images','map','kids','npcs','instruments','figures_tex','figures','people','crowd','life','personas','npc_chat','narr','story','story_olat_haof','landing_icons','landing_svg','ui_icons','ui_icons2','emoji_icons','audio','services'].filter(n=>fs.existsSync(p.join(d,'src',n+'.js')));",
" const IMG=['map_images','landing_icons','ui_icons','ui_icons2'],DATA=['nikud_map','geodata','regions','narr','landing_svg'];   // מודולים של נתונים טהורים (נבדקו: רצים לבד) – מועברים לפני הקוד",
" const NLN=String.fromCharCode(10),J=a=>a.map(n=>r('src/'+n+'.js')).join(NLN);",
" const code=names.filter(n=>!IMG.includes(n)&&!DATA.includes(n));",
" const tail=[r('src/ui.js'),r('src/kidui.js')].concat(fs.existsSync(p.join(d,'src','nikud_dom.js'))?[r('src/nikud_dom.js')]:[]);",
" const chunks=[{name:'vendor',code:r('lib/three.min.js')+NLN+r('lib/orbit.js')},{name:'img',code:J(IMG.filter(n=>names.includes(n)))},{name:'data',code:J(DATA.filter(n=>names.includes(n)))},{name:'app',code:J(code)+NLN+svc.join(NLN)+NLN+tail.join(NLN)}];",
" let shell=r('src/template.html');",
" const A='<script>{{THREE}}</script>',B='<script>{{ORBIT}}</script>',C='<script>{{APP}}</script>';",
" if(!shell.includes(A)||!shell.includes(B)||!shell.includes(C)){console.log('template placeholders not found');process.exit(1)}",
" shell=shell.replace(A,'<!--@CHUNKS@-->').replace(B,'').replace(C,'');",
" for(const c of chunks){try{new Function(c.code)}catch(e){console.log('SYNTAX ERROR in chunk',c.name,e.message);process.exit(1)}}",
" fs.writeFileSync(process.env.CHUNKS_OUT,JSON.stringify({shell,chunks}));console.log('chunks ok',chunks.map(c=>c.name+' '+(c.code.length/1024|0)+'KB').join(', '));process.exit(0)",
"}",
""
].join(t.includes('\r\n') ? '\r\n' : NL);
const marker = 'const out=process.env.OUT||';
if (!t.includes(marker)) throw new Error('marker not found');
t = t.replace(marker, () => add + marker);
fs.writeFileSync(__dirname + '/../build.js', t, 'utf8');
console.log('patched');
