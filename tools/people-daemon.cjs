// node tools/people-daemon.cjs <built.html> [port]   — debug daemon: launches ONE headless Chrome, loads the page once, then executes every
// tools/people-work/cmd/<n>.js (page JS; first line "//shot <file.png> [waitMs]" takes a screenshot afterwards) and writes <n>.out. Stop: create cmd/STOP.
const http = require('http'), fs = require('fs'), path = require('path');
const puppeteer = require('C:/wt/wt-a5-pricelist/node_modules/puppeteer-core');
const file = path.resolve(process.argv[2]), dir = path.dirname(file), PORT = +(process.argv[3] || 5873);
const CMD = path.join(__dirname, 'people-work', 'cmd'); fs.mkdirSync(CMD, { recursive: true });
for (const f of fs.readdirSync(CMD)) fs.unlinkSync(path.join(CMD, f));
http.createServer((q, s) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/' + path.basename(file); const x = path.join(dir, p); if (!fs.existsSync(x)) { s.statusCode = 404; return s.end('nf'); } s.setHeader('Content-Type', x.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/json'); s.end(fs.readFileSync(x)); }).listen(PORT, '127.0.0.1', async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', userDataDir: path.join(__dirname, 'people-work', 'chrome-prof-' + PORT), protocolTimeout: 900000, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox', '--window-size=1100,700'] });
  const pg = await b.newPage(); await pg.setViewport({ width: 1100, height: 700 });
  const logs = []; pg.on('console', m => logs.push(m.type() + ': ' + m.text().slice(0, 600))); pg.on('pageerror', e => logs.push('pageerror: ' + e.message));
  await pg.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'domcontentloaded', timeout: 0 });
  await pg.waitForFunction('window.__dbg', { timeout: 0 });
  fs.writeFileSync(path.join(CMD, 'READY'), 'ok'); console.log('ready');
  for (;;) {
    if (fs.existsSync(path.join(CMD, 'STOP'))) break;
    const todo = fs.readdirSync(CMD).filter(f => /\.js$/.test(f) && !fs.existsSync(path.join(CMD, f.replace(/\.js$/, '.out')))).sort();
    for (const f of todo) {
      const src = fs.readFileSync(path.join(CMD, f), 'utf8'), n = f.replace(/\.js$/, ''); let res;
      try { res = await pg.evaluate(`(async()=>{try{return await (async()=>{${src}})()}catch(e){return 'ERR '+e.message+' '+(e.stack||'').slice(0,300)}})()`); } catch (e) { res = 'EVALFAIL ' + e.message; }
      const m = src.match(/^\/\/shot (\S+)(?: (\d+))?/);
      if (m) { await new Promise(r => setTimeout(r, +(m[2] || 3000))); await pg.screenshot({ path: path.join(CMD, '..', m[1]) }); }
      fs.writeFileSync(path.join(CMD, n + '.out'), (typeof res === 'string' ? res : JSON.stringify(res)) + '\n--- console ---\n' + logs.splice(0).slice(-25).join('\n'));
    }
    await new Promise(r => setTimeout(r, 700));
  }
  await b.close(); process.exit(0);
}).on('error', e => { console.log('server', e.message); process.exit(1); });
