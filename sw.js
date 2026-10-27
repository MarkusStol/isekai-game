/* Isekai Reinkarnation – offline shell cache. Bump CACHE on every release. */
const CACHE = 'isekai-v8';
const ASSETS = [
  './',
  './index.html',
  './style.css?v=8',
  './game.js?v=8',
  './manifest.json',
  './icon.svg',
  './worlds/greymourne.json?v=8'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // never cache Gemini/Pollinations

  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    // Network-first for HTML/JS/CSS so updates apply; cache fallback offline
    const isShell = /\.(?:html|js|css|json|svg)(?:\?|$)/.test(url.pathname) || url.pathname.endsWith('/isekai-game/') || url.pathname.endsWith('/isekai-game');
    if (isShell) {
      try {
        const fresh = await fetch(req);
        if (fresh && fresh.ok) cache.put(req, fresh.clone());
        return fresh;
      } catch (_) {
        const hit = await cache.match(req) || await cache.match('./index.html') || await cache.match('./');
        if (hit) return hit;
        throw _;
      }
    }
    const hit = await cache.match(req);
    if (hit) return hit;
    try {
      const fresh = await fetch(req);
      if (fresh && fresh.ok) cache.put(req, fresh.clone());
      return fresh;
    } catch (err) {
      throw err;
    }
  })());
});
