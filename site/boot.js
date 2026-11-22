/* Boot loader for beit-hamikdash-model (injected by publish.mjs right after the #load markup; NOT part of the offline build).
   index.html is tiny (markup + CSS + this script), so the "טוענים את בית המקדש" screen paints at once even behind a filter that
   buffers whole responses. The heavy code is fetched as opaque gzip bytes (application/octet-stream, so content filters that rewrite
   JS do not touch it), cached in the Cache API by content hash (instant repeat visits), un-gzipped in the browser (the gzip CRC and the
   expected byte size are the integrity check) and run as inline <script> elements created at run time.
   Any failure (network, size, CRC, SyntaxError) falls back to /full.html = the old single-document build. The manifest object below is filled in by publish.mjs. */
(function () {
  var M = __MANIFEST__;
  var T0 = performance.now(), D = document;
  function $(i) { return D.getElementById(i); }
  var FB = '/full.html';
  try { if (/[?&]full=1/.test(location.search) || (localStorage.getItem('bh_full') | 0) > Date.now()) { location.replace(FB); return; } } catch (e) {}
  var ldtxt = $('ldtxt'), bar = $('ldbar') && $('ldbar').firstChild, pct = $('ldpct');
  var want = 0, got = {}, done = false, syntaxErr = null, hit = 0, tNet = 0, tRun = 0;
  M.crit.forEach(function (f) { want += f.n; });
  var quiet = false;
  function show(f, label) { if (quiet) return; if (bar) bar.style.width = Math.max(6, Math.min(99, Math.round(f * 100))) + '%'; if (pct) pct.textContent = label || (Math.min(99, Math.round(f * 100)) + '%'); }
  function bytes() { var s = 0; for (var k in got) s += got[k]; return s; }
  function fail(why) {
    if (done) return; done = true;
    try { if (window.__bhEv) window.__bhEv('boot', { ok: false, why: String(why).slice(0, 80), ms: Math.round(performance.now() - T0) }); } catch (e) {}
    var tried = 0; try { tried = +sessionStorage.getItem('bh_fb') || 0; sessionStorage.setItem('bh_fb', '1'); } catch (e) {}
    try { localStorage.setItem('bh_full', String(Date.now() + 86400000)); } catch (e) {}   // for a day: skip the fast path on this device
    if (!tried) { location.replace(FB); return; }
    if (ldtxt) ldtxt.textContent = 'הטעינה נכשלה'; if (bar) bar.parentNode.style.display = 'none';
    if (pct) pct.innerHTML = '<a href="' + FB + '">לפתיחת הגרסה המלאה</a>';
  }
  addEventListener('error', function (e) { if (!done && e.error && e.error.name === 'SyntaxError') syntaxErr = e.message || 'SyntaxError'; }, true);

  function concat(chunks, n) { var o = new Uint8Array(n), p = 0; for (var i = 0; i < chunks.length; i++) { o.set(chunks[i], p); p += chunks[i].length; } return o.buffer; }
  function net(f, cache) {
    return fetch(f.u, { credentials: 'same-origin' }).then(function (r) {
      if (!r.ok) throw new Error('http ' + r.status);
      if (!r.body || !r.body.getReader) return r.arrayBuffer().then(function (b) { got[f.u] = b.byteLength; show(bytes() / want * .9); return b; });
      var rd = r.body.getReader(), ch = [], n = 0;
      return (function pump() {
        return rd.read().then(function (x) {
          if (x.done) return concat(ch, n);
          ch.push(x.value); n += x.value.length; got[f.u] = n; show(bytes() / want * .9); return pump();
        });
      })();
    }).then(function (b) {
      if (b.byteLength !== f.n) throw new Error('size ' + b.byteLength + '/' + f.n);
      if (cache) { try { cache.put(f.u, new Response(b.slice(0))).catch(function () {}); } catch (e) {} }
      return b;
    });
  }
  function get(f) {
    if (!window.caches) return net(f, null);
    return caches.open('bh1').then(function (c) {
      return c.match(f.u).then(function (r) {
        if (r) return r.arrayBuffer().then(function (b) { if (b.byteLength === f.n) { hit++; got[f.u] = f.n; show(bytes() / want * .9); return b; } return net(f, c); });
        return net(f, c);
      });
    }, function () { return net(f, null); });
  }
  function gunzip(b) { return new Response(new Blob([b]).stream().pipeThrough(new DecompressionStream('gzip'))).text(); }
  function ready() { return D.readyState !== 'loading' ? Promise.resolve() : new Promise(function (ok) { D.addEventListener('DOMContentLoaded', ok); }); }
  function run(text) {
    var parts = text.split(M.sep);
    for (var i = 0; i < parts.length; i++) { if (!parts[i]) continue; var s = D.createElement('script'); s.text = parts[i]; D.head.appendChild(s); }
  }
  function prune() {
    if (!window.caches) return;
    caches.open('bh1').then(function (c) { c.keys().then(function (ks) {
      var keep = {}; M.crit.concat(M.lazy).forEach(function (f) { keep[f.u] = 1; });
      ks.forEach(function (k) { var p = new URL(k.url).pathname; if (!keep[p]) c.delete(k); });
    }); }).catch(function () {});
  }
  if (typeof DecompressionStream === 'undefined' || typeof fetch === 'undefined') { fail('no DecompressionStream/fetch'); return; }
  show(.06, '');
  var t1 = performance.now();
  Promise.all(M.crit.map(get)).then(function (bufs) {
    tNet = performance.now() - t1;
    if (ldtxt) ldtxt.textContent = 'מפעילים את המודל…'; show(.93, '');
    return Promise.all(bufs.map(gunzip));
  }).then(function (texts) { return ready().then(function () { return texts; }); }).then(function (texts) {
    // let the browser paint the loader (and its text) at least once before the big synchronous start-up of the model
    return new Promise(function (ok) { var d = 0; function go() { if (!d) { d = 1; ok(texts); } } requestAnimationFrame(function () { requestAnimationFrame(go); }); setTimeout(go, 200); });
  }).then(function (texts) {
    var t2 = performance.now(); window.__bhB = { run0: Math.round(t2), net: Math.round(tNet), hit: hit };
    run(texts.join(M.sep));
    tRun = performance.now() - t2;
    if (syntaxErr) throw new Error('syntax: ' + syntaxErr);
    done = true; quiet = true;
    var ok = !!window.__bhOK;   // the last statement of the code ran (a runtime error such as "no WebGL" is not a load problem: no fallback)
    if (ok) prune();
    try { if (window.__bhEv) window.__bhEv('boot', { ok: ok, why: ok ? undefined : 'runtime', ms: Math.round(performance.now() - T0), net: Math.round(tNet), run: Math.round(tRun), hit: hit, kb: Math.round(want / 1024) }); } catch (e) {}
    // lazy parts (map pictures ...) after the model is up; failures are harmless
    setTimeout(function () {
      M.lazy.reduce(function (p, f) { return p.then(function () { return get(f).then(gunzip).then(function (t) { run(t); }); }).catch(function () {}); }, Promise.resolve());
    }, 600);
  }).catch(function (e) { fail(e && e.message || e); });
})();
