/* Isekai Reinkarnation – offline shell cache. Bump CACHE on every release. */
const CACHE = 'isekai-v19';
const ASSETS = [
  './',
  './index.html',
  './style.css?v=19',
  './game.js?v=19',
  './ui13.js?v=19',
  './codex.js?v=19',
  './econ.js?v=19',
  './map.js?v=19',
  './persist.js?v=19',
  './sim.js?v=19',
  './know.js?v=19',
  './continuity.js?v=19',
  './immerse.js?v=19',
  './battle.js?v=19',
  './jrpg.js?v=19',
  './equip.js?v=19',
  './summons.js?v=19',
  './gems.js?v=19',
  './jobs.js?v=19',
  './enemies.js?v=19',
  './ui14.js?v=19',
  './ui17.js?v=19',
  './leveling.js?v=19',
  './manifest.json',
  './icon.svg',
  './favicon.svg',
  './assets/ui/title-held.webp',
  './assets/ui/icons.svg',
  './worlds/greymourne.json?v=19',
  './worlds/held.json?v=19',
  './worlds/villainess.json?v=19',
  './worlds/daemon.json?v=19',
  './worlds/mensch.json?v=19'
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
