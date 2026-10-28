/* Isekai Reinkarnation – offline shell cache. Bump CACHE on every release. */
const CACHE = 'isekai-v17';
const ASSETS = [
  './',
  './index.html',
  './style.css?v=17',
  './game.js?v=17',
  './ui13.js?v=17',
  './codex.js?v=17',
  './econ.js?v=17',
  './map.js?v=17',
  './persist.js?v=17',
  './sim.js?v=17',
  './know.js?v=17',
  './continuity.js?v=17',
  './immerse.js?v=17',
  './battle.js?v=17',
  './jrpg.js?v=17',
  './equip.js?v=17',
  './summons.js?v=17',
  './gems.js?v=17',
  './jobs.js?v=17',
  './enemies.js?v=17',
  './ui14.js?v=17',
  './leveling.js?v=17',
  './manifest.json',
  './icon.svg',
  './favicon.svg',
  './worlds/greymourne.json?v=17',
  './worlds/held.json?v=17',
  './worlds/villainess.json?v=17',
  './worlds/daemon.json?v=17',
  './worlds/mensch.json?v=17'
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
