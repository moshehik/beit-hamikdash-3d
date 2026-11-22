/* Service worker of the installed Temple app (בית המקדש השני).
   Generic runtime caching, so it never needs a per-release file list (the published index.html / j/*.js / a/*.mp3 are content-hashed by site/publish.mjs):
   • page (navigation): network first (4s), falls back to the last copy -> opens offline, and updated pages arrive as soon as there is a network
   • /a/*.mp3, /j/*.js, /pwa/*: cache first (names carry a content hash)
   Everything else, range requests and other origins pass straight to the network. If anything here throws, the browser just does a normal fetch. */
const VER = 'bh-pwa-1', SHELL = VER + '-shell', ASSETS = VER + '-assets';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== SHELL && k !== ASSETS) await caches.delete(k);
  try { if (self.registration.navigationPreload) await self.registration.navigationPreload.enable(); } catch (_) {}
  await self.clients.claim();
})()));
const timeout = (ms) => new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms));
self.addEventListener('fetch', e => {
  const q = e.request;
  if (q.method !== 'GET') return;
  const u = new URL(q.url);
  if (u.origin !== self.location.origin) return;
  if (q.mode === 'navigate') {
    e.respondWith((async () => {
      const cache = await caches.open(SHELL);
      try {
        const pre = e.preloadResponse ? await e.preloadResponse : null;
        const r = pre || await Promise.race([fetch(q), timeout(4000)]);
        if (r && r.ok) cache.put('/', r.clone()).catch(() => {});
        return r;
      } catch (_) {
        return (await cache.match('/')) || (await caches.match('/')) || Response.error();
      }
    })());
    return;
  }
  if (q.headers.has('range')) return;
  if (/^\/(a|j|pwa)\//.test(u.pathname)) {
    e.respondWith((async () => {
      const cache = await caches.open(ASSETS), hit = await cache.match(q);
      if (hit) return hit;
      const r = await fetch(q);
      if (r && r.ok && r.status === 200) cache.put(q, r.clone()).catch(() => {});
      return r;
    })());
  }
});
