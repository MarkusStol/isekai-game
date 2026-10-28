/* Isekai Reinkarnation – offline shell cache. Bump CACHE on every release. */
const CACHE = 'isekai-v18';
const ASSETS = [
  './',
  './index.html',
  './style.css?v=18',
  './game.js?v=18',
  './ui13.js?v=18',
  './codex.js?v=18',
  './econ.js?v=18',
  './map.js?v=18',
  './persist.js?v=18',
  './sim.js?v=18',
  './know.js?v=18',
  './continuity.js?v=18',
  './immerse.js?v=18',
  './battle.js?v=18',
  './jrpg.js?v=18',
  './equip.js?v=18',
  './summons.js?v=18',
  './gems.js?v=18',
  './jobs.js?v=18',
  './enemies.js?v=18',
  './ui14.js?v=18',
  './ui17.js?v=18',
  './leveling.js?v=18',
  './manifest.json',
  './icon.svg',
  './favicon.svg',
  './assets/ui/title-held.webp',
  './worlds/greymourne.json?v=18',
  './worlds/held.json?v=18',
  './worlds/villainess.json?v=18',
  './worlds/daemon.json?v=18',
  './worlds/mensch.json?v=18'
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
