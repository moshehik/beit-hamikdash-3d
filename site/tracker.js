/* Visit tracker for beit-hamikdash-model.vercel.app — injected by publish.mjs (not part of the local/offline build).
   Sends: visit start (device/screen/referrer), active time, which screen/tour is open and for how long, chat usage (status only),
   JS errors / failed resources. Never sends chat text or voice. Opt out on a device: open the site with ?notrack=1 (undo: ?notrack=0). */
(function () {
  try {
    if (window.__bhT) return; window.__bhT = 1;
    var LS = null; try { LS = window.localStorage; } catch (e) {}
    if (/[?&]notrack=1/.test(location.search)) { try { LS.setItem('bh_notrack', '1'); } catch (e) {} }
    if (/[?&]notrack=0/.test(location.search)) { try { LS.removeItem('bh_notrack'); } catch (e) {} }
    try { if (LS && LS.getItem('bh_notrack') === '1') return; } catch (e) {}

    var EP = '/api/log', q = [], total = 0, seen = {}, cur = null, curT = Date.now(), lastGo = null, maxStep = -1;
    var t0 = Date.now(), act = 0, last = t0, vis = !document.hidden;
    function rnd() {
      var a = new Uint8Array(9), s = '';
      try { crypto.getRandomValues(a); } catch (e) { for (var i = 0; i < 9; i++) a[i] = Math.random() * 256; }
      for (var j = 0; j < 9; j++) s += (a[j] % 36).toString(36);
      return s + 'x';
    }
    var sid; try { sid = sessionStorage.getItem('bh_sid'); if (!sid) { sid = rnd(); sessionStorage.setItem('bh_sid', sid); } } catch (e) { sid = rnd(); }
    function ev(name, d) { if (total >= 300) return; total++; q.push({ ev: name, d: d || null }); if (q.length >= 20) flush(); }
    function flush() {
      if (!q.length) return;
      var body = JSON.stringify({ sid: sid, events: q.splice(0, 25) });
      try { if (navigator.sendBeacon && navigator.sendBeacon(EP, new Blob([body], { type: 'text/plain;charset=UTF-8' }))) return; } catch (e) {}
      try { fetch(EP, { method: 'POST', body: body, keepalive: true, headers: { 'Content-Type': 'text/plain;charset=UTF-8' } }).catch(function () {}); } catch (e) {}
    }
    function tick() { var n = Date.now(); if (vis) act += n - last; last = n; }
    function state() { return { act: Math.round(act / 1000), tot: Math.round((Date.now() - t0) / 1000) }; }
    function trunc(s, n) { s = String(s == null ? '' : s); return s.length > n ? s.slice(0, n) : s; }

    // --- visit start
    var gl = false; try { var cv = document.createElement('canvas'); gl = !!(cv.getContext('webgl2') || cv.getContext('webgl')); } catch (e) {}
    var nc = navigator.connection || {};
    var tz = null; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) {}
    ev('view', { ref: trunc(document.referrer, 200), q: trunc(location.search, 100), w: innerWidth, h: innerHeight, dpr: window.devicePixelRatio || 1, lang: navigator.language, mem: navigator.deviceMemory || null, net: nc.effectiveType || null, touch: 'ontouchstart' in window, gl: gl, tz: tz });
    window.addEventListener('load', function () {
      setTimeout(function () {
        try { var p = performance.timing; ev('perf', { load: p.loadEventEnd - p.navigationStart, dcl: p.domContentLoadedEventEnd - p.navigationStart }); } catch (e) {}
      }, 0);
    });

    // --- which screen (landing / tour:<id> / map / tribes / free:<mode>)
    document.addEventListener('click', function (e) {
      try { var b = e.target && e.target.closest && e.target.closest('[data-go]'); if (b) { lastGo = b.getAttribute('data-go'); ev('nav', { go: lastGo }); } } catch (x) {}
    }, true);
    function shown(id) { var e = document.getElementById(id); return !!e && e.style.display !== 'none' && getComputedStyle(e).display !== 'none'; }
    function screenName() {
      try {
        var L = document.getElementById('landing');
        if (L && L.style.display !== 'none' && !L.classList.contains('out')) return 'landing';
        if (shown('mapov')) return 'map';
        if (shown('kidov')) return 'tribes';
        var s = (typeof SV !== 'undefined') && SV.S;
        if (s && s.sc) { if (typeof s.idx === 'number' && s.idx > maxStep) maxStep = s.idx; return 'tour:' + s.sc.id; }
        return 'free:' + (lastGo || 'model');
      } catch (e) { return cur || 'unknown'; }
    }
    function poll() {
      var n = screenName();
      if (n !== cur) {
        var now = Date.now();
        if (cur) ev('screen', { from: cur, to: n, secs: Math.round((now - curT) / 1000), steps: cur.indexOf('tour:') === 0 ? maxStep + 1 : undefined });
        cur = n; curT = now; maxStep = -1;
      }
    }
    setInterval(poll, 1500); setTimeout(poll, 300);

    // --- chat with characters: status/latency only, never the text
    try {
      var of = window.fetch;
      if (of) window.fetch = function (u) {
        var url = typeof u === 'string' ? u : (u && u.url) || '', isChat = url.indexOf('/api/temple/ask') > -1, t = Date.now(), p = of.apply(this, arguments);
        if (isChat) p.then(
          function (r) { ev('chat', { ok: r.ok, st: r.status, ms: Date.now() - t, at: cur }); },
          function (er) { ev('chat', { ok: false, st: 0, ms: Date.now() - t, err: trunc(er && er.message, 100), at: cur }); });
        return p;
      };
    } catch (e) {}

    // --- errors (each distinct message at most 3 times per visit)
    function errEv(name, d) { var k = name + '|' + (d.msg || d.src || ''); seen[k] = (seen[k] || 0) + 1; if (seen[k] > 3) return; d.at = cur; ev(name, d); }
    window.addEventListener('error', function (e) {
      try {
        var t = e.target;
        if (t && t !== window && t.tagName) errEv('resource_error', { tag: t.tagName, src: trunc((t.currentSrc || t.src || t.href || '').replace(location.origin, ''), 160) });
        else errEv('error', { msg: trunc(e.message, 200), line: e.lineno, col: e.colno, stack: trunc(e.error && e.error.stack, 300), webgl: /webgl/i.test(e.message || '') || undefined });
      } catch (x) {}
    }, true);
    window.addEventListener('unhandledrejection', function (e) {
      try { var r = e.reason; errEv('error', { msg: trunc((r && r.message) || r, 200), promise: true, stack: trunc(r && r.stack, 300) }); } catch (x) {}
    });

    // --- time / lifecycle
    document.addEventListener('visibilitychange', function () {
      tick(); vis = !document.hidden; last = Date.now();
      if (document.hidden) { poll(); ev('end', state()); flush(); }
    });
    window.addEventListener('pagehide', function () { tick(); poll(); ev('end', state()); flush(); });
    setInterval(function () { tick(); if (vis) ev('hb', state()); flush(); }, 30000);
  } catch (e) {}
})();
