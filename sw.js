/* Isekai Reinkarnation – offline shell cache. Bump CACHE on every release. */
const CACHE = 'isekai-v16';
const ASSETS = [
  './',
  './index.html',
  './style.css?v=16',
  './game.js?v=16',
  './ui13.js?v=16',
  './codex.js?v=16',
  './econ.js?v=16',
  './map.js?v=16',
  './persist.js?v=16',
  './sim.js?v=16',
  './know.js?v=16',
  './continuity.js?v=16',
  './immerse.js?v=16',
  './battle.js?v=16',
  './enemies.js?v=16',
  './ui14.js?v=16',
  './leveling.js?v=16',
  './manifest.json',
  './icon.svg',
  './favicon.svg',
  './worlds/greymourne.json?v=16',
  './worlds/held.json?v=16',
  './worlds/villainess.json?v=16',
  './worlds/daemon.json?v=16',
  './worlds/mensch.json?v=16'
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
  if (url.origin !== self.location.origin) return;

  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
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
