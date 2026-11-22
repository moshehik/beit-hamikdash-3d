/* Installable-app glue (inlined into the published index.html by site/publish.mjs --pwa).
   • registers the service worker after the page has loaded (never blocks the start; silently ignored if blocked)
   • install button (beforeinstallprompt) + full-screen button; in full screen Chrome's Keyboard Lock sends Tab/PageUp/PageDown/Enter to the page
   • kill switch: open the site with ?nosw=1 -> unregisters the service worker and clears its caches */
(function () {
  var W = window, D = document;
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  if (/[?&]nosw\b/.test(location.search)) {
    try { navigator.serviceWorker && navigator.serviceWorker.getRegistrations().then(function (rs) { rs.forEach(function (r) { r.unregister(); }); }); } catch (e) {}
    try { W.caches && caches.keys().then(function (ks) { ks.forEach(function (k) { caches.delete(k); }); }); } catch (e) {}
    return;
  }
  var dp = null, bar = null;
  var standalone = function () { try { return matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || navigator.standalone === true; } catch (e) { return false; } };
  var fsOn = function () { return !!(D.fullscreenElement || D.webkitFullscreenElement); };
  var canFs = !!(D.documentElement.requestFullscreen);
  function lock() { try { if (navigator.keyboard && navigator.keyboard.lock) navigator.keyboard.lock(['Tab', 'PageUp', 'PageDown', 'Enter', 'KeyB']).catch(function () {}); } catch (e) {} }
  function unlock() { try { navigator.keyboard && navigator.keyboard.unlock && navigator.keyboard.unlock(); } catch (e) {} }
  function btn(txt, title, fn) { var b = D.createElement('button'); b.type = 'button'; b.textContent = txt; b.title = title; b.setAttribute('aria-label', title); b.onclick = fn; return b; }
  function ui() {
    if (!D.body) return;
    if (!bar) {
      var css = D.createElement('style');
      css.textContent = '#pwaBar{position:fixed;right:12px;bottom:12px;z-index:46;display:flex;gap:8px;direction:rtl}#pwaBar button{background:rgba(32,24,12,.82);color:#f6e6bd;border:1px solid #c9a24a;border-radius:20px;padding:7px 13px;font:600 13px system-ui,sans-serif;cursor:pointer}#pwaBar button:hover{background:#4a3818}@media(max-width:600px){#pwaBar button{padding:7px 10px}}';
      D.head.appendChild(css);
      bar = D.createElement('div'); bar.id = 'pwaBar'; D.body.appendChild(bar);
    }
    bar.textContent = '';
    if (dp && !standalone() && ls('bh_pwa_x') !== '1') {
      bar.appendChild(btn('⬇ התקנה כאפליקציה', 'התקנה כאפליקציה במחשב (חלון נפרד, בלי שורת כתובת)', function () {
        var p = dp; if (!p) return; dp = null; p.prompt(); try { p.userChoice.then(function (c) { if (c && c.outcome === 'dismissed') ls('bh_pwa_x', '1'); ui(); }); } catch (e) {} ui();
      }));
    }
    if (canFs) {
      bar.appendChild(btn(fsOn() ? '⤢ יציאה ממסך מלא' : '⛶ מסך מלא', 'מסך מלא – מקשי השלט (ריבוע, חיצים) נשלחים ישר לאתר', function () {
        try { if (fsOn()) (D.exitFullscreen || D.webkitExitFullscreen).call(D); else { var p = D.documentElement.requestFullscreen(); if (p && p.then) p.then(lock, function () {}); } } catch (e) {}
      }));
    }
    bar.style.display = bar.childNodes.length ? 'flex' : 'none';
    vis();
  }
  /* the buttons live on the entry screen only (they are one-time actions and would cover the tour/menu UI) */
  function vis() { if (!bar) return; var L = D.getElementById('landing'); var on = !L || (getComputedStyle(L).display !== 'none' && !L.classList.contains('out')); bar.style.visibility = on ? 'visible' : 'hidden'; }
  setInterval(vis, 600);
  addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); dp = e; ui(); });
  addEventListener('appinstalled', function () { dp = null; ui(); });
  D.addEventListener('fullscreenchange', function () { if (fsOn()) lock(); else unlock(); ui(); });
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', ui); else ui();
  if (standalone()) lock();
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    addEventListener('load', function () { setTimeout(function () { try { navigator.serviceWorker.register('@SW@').catch(function () {}); } catch (e) {} }, 1500); });
  }
  W.__pwa = { standalone: standalone, get canInstall() { return !!dp; } };
})();
