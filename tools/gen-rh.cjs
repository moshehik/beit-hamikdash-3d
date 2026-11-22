/* מחולל סדר "מסכת ראש השנה": tools/rh/ch1–4.cjs + tools/rh-template.js ← src/svc/rosh-hashana.js, src/story_rosh_hashana.js, docs/rosh-hashana-tour-plan.md
   node tools/gen-rh.cjs   (ואז node build.js).  לעולם לא לערוך את הקבצים שנוצרו ביד.  בודק גם את הציטוטים מול המשנה (tools/rh/verify.cjs). */
const fs=require('fs'),p=require('path'),cp=require('child_process');const d=p.join(__dirname,'..');
const v=cp.spawnSync(process.execPath,[p.join(__dirname,'rh/verify.cjs')],{encoding:'utf8'});process.stdout.write(v.stdout||'');if(v.status){console.log('הציטוטים לא תואמים – מפסיק');process.exit(1)}
const rows=[].concat(...[1,2,3,4].map(i=>require('./rh/ch'+i+'.cjs')));
let t=fs.readFileSync(p.join(d,'tools/rh-template.js'),'utf8');
if(!t.includes('/*DATA*/')){console.log('חסר /*DATA*/');process.exit(1)}
const tag=(r,i)=>(r[6]||'🎺')+' '+r[1].replace(/[:–—·].*$/,'').split(/\s+/).slice(0,3).join(' ');
t=t.replace('/*DATA*/',()=>'const RHD='+JSON.stringify(rows.map(r=>[r[0],r[1],r[2],r[3],'',r[5],r[6],r[7]]))+';window.KTAG_RH='+JSON.stringify(rows.map(tag))+';');
fs.writeFileSync(p.join(d,'src/svc/rosh-hashana.js'),t);
const story={};rows.forEach((r,i)=>{story['rosh-hashana-'+i]=r[4]});
fs.writeFileSync(p.join(d,'src/story_rosh_hashana.js'),'/* נוצר ע"י tools/gen-rh.cjs מ-tools/rh/ch*.cjs – אל תערכו ביד */\nObject.assign(STORY,'+JSON.stringify(story)+');\n');
/* מסמך תכנון */
let md='# סיור מודרך: מסכת ראש השנה – תכנית הצגה\n\n_נוצר אוטומטית מ-`tools/rh/ch1–4.cjs` ע"י `node tools/gen-rh.cjs`; ההמחשה (תנועה ומצלמה) ב-`tools/rh-template.js`._\n\n'+
'**מבנה:** '+rows.length+' שלבים לפי סדר המשניות (א:א – ד:ט) בתוספת פתיחה וסיום. כל שלב: מקור, הדין בקצרה, ציטוט מדויק מהמשנה (נבדק מול נוסח ספריא ב-`tools/rh/mishna.txt`), ההמחשה התלת־ממדית, וטקסט ההקראה (שפת ילדים).\n\n'+
'**זירות:** רחבת הר הבית הדרומית (שולחנות הדיון, בית יעזק, יבנה בדמות "תמונה"), המזבח (קרבן ראש חודש, ניסוך המים, הלולב), הר המשחה (הכנת המשואה והנפתה) ו**מפת ארץ ישראל** (המשואות מהר המשחה עד בית בלתין ובבל, השליחים, העדים, יבנה, לוד). המפה משתמשת ב-`ERETZ` (דגם הארץ של session "temple-land") כשהוא קיים, ואחרת במפה שטוחה פשוטה.\n\n'+
'**הערות הוגנות על אי־ודאות:** מיקום גרופינא, חורן (ההר בו) ובית בלתין משוער; בית יעזק ויבנה מוצגים כתמונות הדגמה על הרחבה ולא כמיקום ארכיאולוגי; שעות היום בדגם הערכה.\n\n---\n\n';
rows.forEach((r,i)=>{md+='## '+i+'. '+r[1]+'\n- **מקור:** '+r[0]+'\n- **הדין:** '+r[2]+'\n'+(r[3]?'- **לשון המשנה:** '+r[3]+'\n':'')+'- **המחשה ומצלמה:** '+r[5]+'\n- **הקראה:** '+r[4]+'\n\n'});
fs.mkdirSync(p.join(d,'docs'),{recursive:true});fs.writeFileSync(p.join(d,'docs/rosh-hashana-tour-plan.md'),md);
console.log('נוצרו: src/svc/rosh-hashana.js, src/story_rosh_hashana.js, docs/rosh-hashana-tour-plan.md –',rows.length,'שלבים');
