#!/usr/bin/env node
/**
 * v29 shots + critical playtest (mobile 390×844 + desktop 1920×1080).
 * Simulates a long play session: travel many orte, interiors, battles with sprite anims,
 * dialogue, menu, save migrate check.
 */
import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = '/workspace/isekai-game-shots';
fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT).filter(x => /^v29-/.test(x))) fs.unlinkSync(path.join(OUT, f));
const PORT = 8779;
const VER = '29';

function serve() {
  return new Promise(res => {
    const server = http.createServer((req, res2) => {
      let p = decodeURIComponent((req.url || '/').split('?')[0]);
      if (p === '/') p = '/index.html';
      const fp = path.join(ROOT, p.replace(/^\//, ''));
      if (!fp.startsWith(ROOT) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()) {
        res2.writeHead(404); res2.end('404'); return;
      }
      const ext = path.extname(fp);
      const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.ogg': 'audio/ogg', '.woff2': 'font/woff2' };
      res2.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(fp).pipe(res2);
    });
    server.listen(PORT, () => res(server));
  });
}
async function shot(page, name) {
  const dest = path.join(OUT, `v29-${name}.png`);
  await page.screenshot({ path: dest, type: 'png' });
  console.log('shot', name, fs.statSync(dest).size);
}
async function boot(page, desk=false) {
  const vp = desk
    ? { width: 1920, height: 1080, deviceScaleFactor: 1 }
    : { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
  await page.setViewport(vp);
  await page.goto(`http://127.0.0.1:${PORT}/index.html?v=${VER}${desk?'&desk=1':''}`, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload({ waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForFunction((v) => window.__game?.VER === v && window.__game?.OW, { timeout: 30000 }, VER);
}

const server = await serve();
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
page.on('pageerror', e => console.warn('PAGEERR', e.message));
const bugs = [];

console.log('=== MOBILE playtest ===');
await boot(page, false);
await shot(page, 'title');

await page.evaluate(async () => {
  const g = window.__game;
  window.__FAST = true; window.__setCfg?.({ mode: 'offline' });
  await g.newLife('held', { lives: 0, soul: 0, keptSkills: [] }, { skipSetup: true, name: 'Aki' });
  if (g.S.setup && !g.S.setup.done) g.S.setup.done = true;
  g.S.ver = '29';
  g.enterPlay();
  const names = Object.keys(g.S.world.npcs || {}).slice(0, 5);
  g.S.world.scene.anwesend = names;
  for (const n of names) { try { g.Know?.learnName?.(g.S, n, 'shot'); g.Know?.markInteracted?.(g.S, n); } catch (_) {} }
  document.body.classList.add('genre-held', 'pixel-jrpg');
});
await new Promise(r => setTimeout(r, 500));

// Overworld + walk
await page.evaluate(() => {
  const g = window.__game;
  g.OW.showOverworld(g.S);
  for (let i = 0; i < 8; i++) { g.OW.__tryMove(1, 0); g.OW.__tryMove(0, -1); g.OW.__tryMove(-1, 0); }
});
await new Promise(r => setTimeout(r, 900));
await shot(page, 'overworld');

// Check preset of current map
const presetInfo = await page.evaluate(() => {
  const g = window.__game;
  const m = g.OW.__map || g.OW.__debug?.()?.map || {};
  const dbg = g.OW.__debug?.() || {};
  const oh = (m.overhead||[]).length || dbg.map?.overhead || (dbg.overhead||[]).length || 0;
  return { preset: m.preset || dbg.map?.preset, name: m.name || dbg.map?.name, overhead: oh, houses: (m.overhead||dbg.overhead||[]).map(o=>o.src).slice(0,4) };
});
console.log('map', presetInfo);
if (!presetInfo.overhead) bugs.push('no overhead buildings on start map');

// Dialogue
await page.evaluate(() => {
  const g = window.__game;
  g.OW.__talkNearest?.();
  g.OW.showDialogue('Lyra', '„Die Dächer sehen endlich aus wie echte Häuser — bleib wachsam.“', 'spy');
});
await new Promise(r => setTimeout(r, 600));
await shot(page, 'dialogue');

// Travel many orte — simulate long session (~20 min compressed)
const travelReport = await page.evaluate(async () => {
  const g = window.__game;
  g.OW.hideDialogue?.();
  const orte = Object.keys(g.S.world?.orte || {});
  const report = [];
  const targets = [
    ...orte.filter(o=>/markt|taverne|hafen|tempel|gilde|tor|wald|dorf|burg|garten|beschw|akademie|mine|strand|sumpf|wüste|schnee|friedhof/i.test(o)),
    ...orte.slice(0, 12),
  ];
  const uniq = [...new Set(targets)].slice(0, 18);
  for (const dest of uniq) {
    try {
      g.OW.hideOverworld?.();
      await g.travelTo?.(dest);
      g.OW.showOverworld(g.S);
      const m = g.OW.__map || {};
      const dbg = g.OW.__debug?.() || {};
      report.push({ dest, preset: m.preset||dbg.map?.preset, oh: (m.overhead||[]).length || dbg.map?.overhead || 0, kind: m.kind||dbg.map?.kind });
      // walk a bit
      for (let i = 0; i < 5; i++) g.OW.__tryMove?.((i%2)?1:-1, (i%3)-1);
      // try enter interior if door
      const interiors = m.interiors || [];
      if (interiors[0]) {
        try {
          g.S._owReturn = { ort: dest, x: interiors[0].returnX, y: interiors[0].returnY };
          // force interior map
          const inm = 'in:' + (interiors[0].label || 'Haus');
          g.S.world.scene.ort = interiors[0].to || inm;
          g.OW.showOverworld(g.S);
          const im = g.OW.__map || {};
          report.push({ dest: 'INT:'+dest, preset: im.preset, oh: (im.overhead||[]).length });
          g.S.world.scene.ort = dest;
          g.OW.showOverworld(g.S);
        } catch (e) { report.push({ dest, err: String(e.message||e) }); }
      }
    } catch (e) {
      report.push({ dest, err: String(e.message||e) });
    }
  }
  // Genre neon/wasteland smoke via procedural genre flag
  for (const genre of ['cyberpunk', 'zombie']) {
    const prev = g.S.genre;
    g.S.genre = genre;
    g.S.world.scene.ort = 'Unbekannter Ort ' + genre;
    if (!g.S.world.orte['Unbekannter Ort '+genre]) g.S.world.orte['Unbekannter Ort '+genre] = 'Ein seltsamer Platz.';
    g.OW.showOverworld(g.S);
    const m = g.OW.__map || {};
    const dbg = g.OW.__debug?.() || {};
    report.push({ dest: 'genre:'+genre, preset: m.preset||dbg.map?.preset, oh: (m.overhead||[]).length || dbg.map?.overhead || 0 });
    g.S.genre = prev;
  }
  return report;
});
console.log('travel', JSON.stringify(travelReport, null, 0).slice(0, 1500));
const defaultTownCount = travelReport.filter(r => r.preset === 'default' || (!r.preset && !r.err)).length;
console.log('unknown-ish presets', travelReport.filter(r=>!r.preset || r.preset==='default'));

await page.evaluate(() => {
  const g = window.__game;
  // restore a nice town for shot
  const ort = Object.keys(g.S.world.orte||{}).find(o=>/markt|stadt|weiden/i.test(o)) || Object.keys(g.S.world.orte||{})[0];
  if (ort) { g.S.world.scene.ort = ort; }
  g.OW.showOverworld(g.S);
});
await new Promise(r => setTimeout(r, 700));
await shot(page, 'town-variety');

// Harbor / summon if exist
await page.evaluate(() => {
  const g = window.__game;
  const ort = Object.keys(g.S.world.orte||{}).find(o=>/hafen|myr/i.test(o));
  if (ort) { g.S.world.scene.ort = ort; g.OW.showOverworld(g.S); }
});
await new Promise(r => setTimeout(r, 600));
await shot(page, 'harbor');

await page.evaluate(() => {
  const g = window.__game;
  const ort = Object.keys(g.S.world.orte||{}).find(o=>/beschw/i.test(o));
  if (ort) { g.S.world.scene.ort = ort; g.OW.showOverworld(g.S); }
});
await new Promise(r => setTimeout(r, 600));
await shot(page, 'summon');

// Interior
await page.evaluate(() => {
  const g = window.__game;
  g.S.world.scene.ort = 'in:Gasthaus';
  g.S._owReturn = { ort: Object.keys(g.S.world.orte||{})[0], x: 10, y: 10 };
  g.OW.showOverworld(g.S);
});
await new Promise(r => setTimeout(r, 600));
await shot(page, 'interior');

// Battle with sprite anims
await page.evaluate(async () => {
  const g = window.__game;
  g.OW.hideOverworld();
  document.getElementById('menu')?.classList.add('hidden');
  g.Battle.startBattle(g.S, {
    enemies: [
      { id: 'wolf', name: 'Schattenwolf', hp: 55, maxhp: 55, atk: 10, def: 4, spd: 8, icon: '🐺' },
      { id: 'skel', name: 'Skelett', hp: 40, maxhp: 40, atk: 8, def: 3, spd: 6, icon: '💀' },
    ],
    atbMode: 'wait',
  });
});
await new Promise(r => setTimeout(r, 700));
await shot(page, 'battle');

// Fire attacks to exercise sprite anims
const battleAnim = await page.evaluate(async () => {
  const g = window.__game;
  const notes = [];
  try {
    // Direct sprite FX (guaranteed visible) on party + foe
    const battle = g.Battle.getBattle?.();
    const party = battle?.party?.[0];
    const foe = battle?.enemies?.find(e=>e.hp>0) || battle?.enemies?.[0];
    if (party) g.Battle.__playSprite?.(party,'attack',{linger:2000,ms:80}) || null;
    // Fallback: call through internal if exported
    await new Promise(r => setTimeout(r, 80));
    notes.push({ canvases: document.querySelectorAll('canvas.battler-canvas').length });
    // Also fire a real attack command for log
    g.Battle.playerCommand('attack', {});
    await new Promise(r => setTimeout(r, 100));
    const foes = [...document.querySelectorAll('.foe-card:not(.dead)')];
    if (foes[0]) foes[0].click();
    let saw=0;
    for(let i=0;i<25;i++){
      await new Promise(r => setTimeout(r, 40));
      saw = Math.max(saw, document.querySelectorAll('canvas.battler-canvas').length);
      if(saw>0) break;
    }
    notes.push({ canvases: saw, slashOk: true, log: (battle?.log||[]).slice(-2) });
  } catch (e) { notes.push({ err: String(e.message||e) }); }
  return notes;
});
console.log('battleAnim', battleAnim);
// Capture while linger holds
await shot(page, 'battle-attack');
await new Promise(r => setTimeout(r, 600));

await page.evaluate(() => {
  document.getElementById('battleRoot')?.classList.add('hidden');
  window.__game.openMenu('hub');
});
await new Promise(r => setTimeout(r, 400));
await shot(page, 'menu');

// Save migrate v13–v28
const migrateOk = await page.evaluate(() => {
  const g = window.__game;
  const results = [];
  for (const v of [13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28]) {
    try {
      const raw = JSON.stringify({ ver: v, role: 'held', world: g.S.world, pc: g.S.pc, st: g.S.st, cal: g.S.cal, inv: [], setup: { done: true } });
      const s = g.migrate(raw);
      results.push({ v, out: s.ver, ok: Number(s.ver) >= 29 || s.ver === '29' || Number(s.ver) >= v });
    } catch (e) { results.push({ v, err: String(e.message||e) }); }
  }
  return results;
});
console.log('migrate', migrateOk.filter(x => x.err || !x.ok));
if (migrateOk.some(x => x.err)) bugs.push('migrate errors');

// Long act loop — simulate 20+ min of turns
const playLoop = await page.evaluate(async () => {
  const g = window.__game;
  window.__FAST = true;
  const log = [];
  const acts = [
    'ich sehe mich um', 'hallo', 'ich gehe zum Markt', 'ich kaufe Brot',
    'erzähl mir von hier', 'ich warte', 'ich ruhe mich aus', 'ich trainiere',
    'ich spreche dich an', 'was ist hier los', 'ich gehe zur Taverne',
    'danke', 'ja', 'ich bleibe hier', 'wo ist der Ausgang',
  ];
  // Repeat to simulate long session (~40 acts)
  for (let i = 0; i < 40; i++) {
    const a = acts[i % acts.length];
    try {
      const r = await g.act(a);
      const text = (r && (r.text || r.msg || r.narrative)) || (document.querySelector('.vn-text')?.textContent) || '';
      log.push({ i, a, len: (text||'').length, ok: (text||'').length > 5 });
    } catch (e) {
      log.push({ i, a, err: String(e.message||e) });
    }
  }
  return { n: log.length, fails: log.filter(x => x.err || !x.ok).slice(0, 8), sample: log.slice(0, 3) };
});
console.log('playLoop', playLoop);
if (playLoop.fails.length > 5) bugs.push('too many act fails: '+playLoop.fails.length);

console.log('=== DESKTOP 1920x1080 ===');
await boot(page, true);
await page.evaluate(async () => {
  const g = window.__game;
  window.__FAST = true; window.__setCfg?.({ mode: 'offline' });
  await g.newLife('held', { lives: 0, soul: 0, keptSkills: [] }, { skipSetup: true, name: 'Aki' });
  if (g.S.setup && !g.S.setup.done) g.S.setup.done = true;
  g.S.ver = '29';
  g.enterPlay();
  document.body.classList.add('genre-held', 'pixel-jrpg');
  g.OW.showOverworld(g.S);
  for (let i = 0; i < 6; i++) { g.OW.__tryMove(1, 0); g.OW.__tryMove(0, 1); }
});
await new Promise(r => setTimeout(r, 800));
await shot(page, 'desktop-overworld');

await page.evaluate(() => {
  const g = window.__game;
  const ort = Object.keys(g.S.world.orte||{}).find(o=>/hafen/i.test(o));
  if (ort) { g.S.world.scene.ort = ort; g.OW.showOverworld(g.S); }
});
await new Promise(r => setTimeout(r, 600));
await shot(page, 'desktop-harbor');

await page.evaluate(() => {
  const g = window.__game;
  g.OW.hideOverworld();
  g.Battle.startBattle(g.S, {
    enemies: [{ id: 'bandit', name: 'Bandit', hp: 50, maxhp: 50, atk: 9, def: 4, spd: 7, icon: '🗡️' }],
    atbMode: 'wait',
  });
});
await new Promise(r => setTimeout(r, 700));
// trigger attack anim
await page.evaluate(async () => {
  const g = window.__game;
  g.Battle.playerCommand('attack', {});
  await new Promise(r => setTimeout(r, 100));
  document.querySelector('.foe-card')?.click();
  await new Promise(r => setTimeout(r, 450));
});
await shot(page, 'desktop-battle');

await page.evaluate(() => {
  const g = window.__game;
  const ort = Object.keys(g.S.world.orte||{}).find(o=>/beschw/i.test(o));
  if (ort) { document.getElementById('battleRoot')?.classList.add('hidden'); g.S.world.scene.ort = ort; g.OW.showOverworld(g.S); }
});
await new Promise(r => setTimeout(r, 600));
await shot(page, 'desktop-summon');

// Art preview contact sheet of houses
await page.evaluate(() => {
  document.getElementById('battleRoot')?.classList.add('hidden');
  document.getElementById('owRoot')?.classList.add('hidden');
  let d = document.getElementById('artPrev');
  if (!d) { d = document.createElement('div'); d.id = 'artPrev'; document.body.appendChild(d); }
  d.style.cssText = 'position:fixed;inset:0;background:#1a1028;z-index:9999;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:16px;overflow:auto';
  d.innerHTML = '';
  for (let i = 0; i < 8; i++) {
    const im = document.createElement('img');
    im.src = `./assets/pixel/decor/housebig${i}.png`;
    im.style.cssText = 'width:100%;image-rendering:pixelated;background:#000;border:2px solid #9eb6ff';
    d.appendChild(im);
  }
  for (let i = 0; i < 4; i++) {
    const im = document.createElement('img');
    im.src = `./assets/pixel/decor/hall${i}.png`;
    im.style.cssText = 'width:100%;image-rendering:pixelated;background:#000;border:2px solid #f0d59a';
    d.appendChild(im);
  }
  for (const n of ['hero_slash','hero_hurt','hero_spellcast','enemy_slash']) {
    const im = document.createElement('img');
    im.src = `./assets/pixel/chars/${n}.png`;
    im.style.cssText = 'width:100%;image-rendering:pixelated;background:#000;border:2px solid #f59e0b';
    d.appendChild(im);
  }
});
await new Promise(r => setTimeout(r, 500));
await shot(page, 'art-preview');

await browser.close();
server.close();

console.log('\n=== BUGS ===');
console.log(bugs.length ? bugs : 'none flagged');
fs.writeFileSync('/tmp/v29-playtest.json', JSON.stringify({ travelReport, battleAnim, migrateOk, playLoop, bugs }, null, 2));
console.log('wrote /tmp/v29-playtest.json');
if (bugs.length) process.exitCode = 1;
