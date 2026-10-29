/* Isekai Reinkarnation – offline shell. Network-first for shell; self-heal on version mismatch. */
const VER = '38';
const CACHE = 'isekai-v' + VER;
const ASSETS = [
  './',
  './index.html',
  './style.css?v=' + VER,
  './game.js?v=' + VER,
  './ui13.js?v=' + VER,
  './codex.js?v=' + VER,
  './econ.js?v=' + VER,
  './map.js?v=' + VER,
  './persist.js?v=' + VER,
  './sim.js?v=' + VER,
  './know.js?v=' + VER,
  './continuity.js?v=' + VER,
  './immerse.js?v=' + VER,
  './battle.js?v=' + VER,
  './jrpg.js?v=' + VER,
  './depth.js?v=' + VER,
  './visual25d.js?v=' + VER,
  './overworld.js?v=' + VER,
  './audio.js?v=' + VER,
  './bg-manifest.js?v=' + VER,
  './equip.js?v=' + VER,
  './summons.js?v=' + VER,
  './gems.js?v=' + VER,
  './jobs.js?v=' + VER,
  './enemies.js?v=' + VER,
  './ui14.js?v=' + VER,
  './ui17.js?v=' + VER,
  './leveling.js?v=' + VER,
  './manifest.json',
  './icon.svg',
  './assets/pixel/hero/walk.png',
  './assets/pixel/tiles/water-anim.png',
  './assets/pixel/portrait/hero.png',
  './assets/pixel/hero/battle.png',
  './assets/pixel/tiles/grass.png',
  './assets/pixel/tiles/path.png',
  './assets/pixel/tiles/floor.png',
  './assets/pixel/tiles/wall.png',
  './assets/pixel/anim/torch.png',
  './assets/pixel/anim/flower.png',
  './assets/pixel/anim/smoke.png',
  './assets/pixel/decor/housebig0.png',
  './assets/pixel/chars/hero_slash.png',
  './assets/pixel/chars/hero_hurt.png',
  './assets/pixel/chars/hero_spellcast.png',
  './assets/pixel/chars/enemy_slash.png',
  './assets/pixel/chars/enemy_hurt.png',
  './assets/pixel/chars/enemy_spellcast.png',
  './assets/bg/manifest.json',
  './assets/pixel/ui/window.png',
  './favicon.svg',
  './assets/ui/title-held.webp',
  './assets/ui/icons.svg',
  './worlds/greymourne.json?v=' + VER,
  './worlds/held.json?v=' + VER,
  './worlds/villainess.json?v=' + VER,
  './worlds/daemon.json?v=' + VER,
  './worlds/mensch.json?v=' + VER
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS).catch(() => c.addAll(ASSETS.filter(a => !a.includes('assets/')))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
  if (e.data && e.data.type === 'purge') {
    e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))).then(() => self.skipWaiting()));
  }
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    // Shell (HTML/JS/CSS/JSON): always network-first, version-matched
    const isShell = /\.(?:html|js|css|json|svg)(?:\?|$)/.test(url.pathname)
      || url.pathname.endsWith('/isekai-game/')
      || url.pathname.endsWith('/isekai-game');
    if (isShell) {
      try {
        const fresh = await fetch(req, { cache: 'no-cache' });
        if (fresh && fresh.ok) {
          try { await cache.put(req, fresh.clone()); } catch (_) {}
          // Also store bare path without query so import maps hit
          try {
            if (url.search) {
              const bare = new Request(url.origin + url.pathname);
              await cache.put(bare, fresh.clone());
            }
          } catch (_) {}
        }
        return fresh;
      } catch (_) {
        const hit = await cache.match(req)
          || await cache.match(url.pathname)
          || await cache.match('./' + url.pathname.split('/').pop())
          || await cache.match('./index.html')
          || await cache.match('./');
        if (hit) return hit;
        throw _;
      }
    }
    const hit = await cache.match(req) || await cache.match(url.pathname);
    if (hit) return hit;
    try {
      const fresh = await fetch(req);
      if (fresh && fresh.ok) try { await cache.put(req, fresh.clone()); } catch (_) {}
      return fresh;
    } catch (err) {
      throw err;
    }
  })());
});
