/* Isekai Reinkarnation – offline shell cache. Bump CACHE on every release. */
const CACHE = 'isekai-v20.1';
const ASSETS = [
  './',
  './index.html',
  './style.css?v=20.1',
  './game.js?v=20.1',
  './ui13.js?v=20.1',
  './codex.js?v=20.1',
  './econ.js?v=20.1',
  './map.js?v=20.1',
  './persist.js?v=20.1',
  './sim.js?v=20.1',
  './know.js?v=20.1',
  './continuity.js?v=20.1',
  './immerse.js?v=20.1',
  './battle.js?v=20.1',
  './jrpg.js?v=20.1',
  './equip.js?v=20.1',
  './summons.js?v=20.1',
  './gems.js?v=20.1',
  './jobs.js?v=20.1',
  './enemies.js?v=20.1',
  './ui14.js?v=20.1',
  './ui17.js?v=20.1',
  './leveling.js?v=20.1',
  './manifest.json',
  './icon.svg',
  './favicon.svg',
  './assets/ui/title-held.webp',
  './assets/ui/icons.svg',
  './worlds/greymourne.json?v=20.1',
  './worlds/held.json?v=20.1',
  './worlds/villainess.json?v=20.1',
  './worlds/daemon.json?v=20.1',
  './worlds/mensch.json?v=20.1'
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
