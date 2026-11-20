// רינדורי ייחוס מהדגם הבנוי לאיקוני הגמיני (ICONS_RULE.md): node tools/render-refs.cjs [built.html] [outdir=assets/ui-refs]
// דורש puppeteer-core (מתיקיית print-center) ו-Chrome; מרנדר ב-GL תוכנתי (איטי אבל עובד). כל מצלמה = P[...] מ-ui.js או מצלמה מותאמת.
const fs = require('fs'), p = require('path'), { pathToFileURL } = require('url');
const puppeteer = require('C:/Users/moshe/Music/מדפיס בוט/print-center/node_modules/puppeteer-core');
const HTML = process.argv[2] || p.join(__dirname, '..', '..', 'beit-hamikdash-3d.html');
const OUT = process.argv[3] || p.join(__dirname, '..', 'assets', 'ui-refs');
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// name -> {place: שם מקום ב-P, או cam/tgt מותאמים, cut: מקום עם חתך}
const VIEWS = JSON.parse(process.env.VIEWS || JSON.stringify([
  { name: 'altar', cam: [28, 72, 34], tgt: [-26, 17, -38] },          // המזבח והכבש מדרום־מזרח מלמעלה (מעל חומת העזרה); SV.SVL: AX=-26, AZ=-43, YA=16
  { name: 'altar-top', cam: [-24, 78, -10], tgt: [-26, 16, -40] },    // מבט־על על המזבח והכבשים
  { name: 'kiyor', preset: 'הכיור' },
  { name: 'heichal', preset: 'ההיכל מצד' },
  { name: 'gate', preset: 'שער ניקנור' },
  { name: 'menorah', cut: { cut: 'x', v: -72, roofs: false }, cam: [-80, 31, -57.5], tgt: [-125, 25, -57.5] },       // חתך רוחב: מנורה (שמאל), שולחן (ימין), מזבח הזהב והפרוכת
  { name: 'goldenaltar', cut: { cut: 'x', v: -72, roofs: false }, cam: [-98, 26.5, -65], tgt: [-116, 24, -57.5] },
  { name: 'priest', actor: true },
]));
(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new',
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox', '--window-size=1000,780'], defaultViewport: { width: 1000, height: 780 }, protocolTimeout: 400000 });
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.log('pageerror', e.message));
  await page.goto(pathToFileURL(HTML).href + '?lite=1', { waitUntil: 'load', timeout: 240000 });
  await sleep(3000);
  await page.evaluate(() => { document.querySelector('[data-go="model"]').click(); const a = document.getElementById('autoDay'); a.checked = false; LIFE.setHour(12); });
  await page.addStyleTag({ content: '#ktop,#kdock,#ktime,#kidbar,#card,#svCap,.lbl,#ktpop{display:none!important}' });
  for (const v of VIEWS) {
    if (v.actor) {
      await page.evaluate(() => { SV.show(true); SV.open('tamid-shachar'); LIFE.tour(null); LIFE.setHour(12); });
      await sleep(9000);
      v.cam = await page.evaluate(() => { const A = Object.values(SV.S.actors)[0]; return [A.x + 5, A.y + 4.6, A.z + 5.5]; });
      v.tgt = await page.evaluate(() => { const A = Object.values(SV.S.actors)[0]; return [A.x, A.y + 3.1, A.z]; });
    }
    await page.evaluate((v) => {
      try { tw = null; } catch (e) {}
      let cam = v.cam, tgt = v.tgt;
      if (v.preset) { const pl = P.find((x) => x[0] !== 'sec' && x[0].indexOf(v.preset) === 0); cam = pl[3]; tgt = pl[4]; }
      if (v.cut) { $('cut').value = v.cut.cut; $('cutv').value = v.cut.v; $('lRoof').checked = v.cut.roofs; ROOFS.forEach((r) => (r.visible = v.cut.roofs)); }
      else { if ($('cut').value) $('cut').value = ''; if (!$('lRoof').checked) { $('lRoof').checked = true; ROOFS.forEach((r) => (r.visible = true)); } }
      applyCut();
      if (v.day) { const d = document.getElementById('dayType'); d.value = v.day; d.dispatchEvent(new Event('change')); }
      camera.position.set(...cam); controls.target.set(...tgt); controls.update();
    }, v);
    await sleep(3500);
    const b64 = await page.evaluate(() => { renderer.render(scene, camera); return renderer.domElement.toDataURL('image/jpeg', 0.88).split(',')[1]; });
    fs.writeFileSync(p.join(OUT, v.name + '.jpg'), Buffer.from(b64, 'base64'));
    console.log('shot', v.name);
  }
  await browser.close();
})().catch((e) => { console.error('CRASH', e.message); process.exit(1); });
