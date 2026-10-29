#!/usr/bin/env node
/**
 * v32 first-hour playtest per genre (fantasy/held, zombie, cyberpunk).
 * Everyday inputs, coherence, pacing, visuals — mobile + desktop smoke.
 */
import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = '/workspace/isekai-game-shots';
fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT).filter(x => /^v32-/.test(x))) fs.unlinkSync(path.join(OUT, f));
const PORT = 8782;
const VER = '32';

const EVERYDAY = [
  'ich sehe mich um',
  'hallo',
  'wer bist du',
  'was ist hier los',
  'ich warte',
  'ich ruhe mich aus',
  'ich kaufe Brot',
  'wo ist der Ausgang',
  'danke',
  'erzähl mir von diesem Ort',
  'ich gehe weiter',
  'was kostet das',
  'ich bin hungrig',
  'hilf mir',
  'guten Morgen',
];

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
  const dest = path.join(OUT, `v32-${name}.png`);
  await page.screenshot({ path: dest, type: 'png' });
  console.log('shot', name, fs.statSync(dest).size);
}

function scoreReply(input, text, genre, Ssnap) {
  const issues = [];
  const t = String(text || '');
  if (t.length < 20) issues.push('too_short');
  if (/undefined|null|\[object|NaN|TypeError/i.test(t)) issues.push('broken_token');
  if (/greymourne/i.test(t) && genre !== 'grey') issues.push('greymourne_leak');
  // Echo / non-answer
  if (/Die Welt wartet nicht|Wohin du gehst, ist deine Sache/.test(t) && !/ankommen|intro/i.test(input)) issues.push('bridge_repeat');
  // Genre bleed
  if (genre === 'zombie' && /drache|magierakademie|elfen/i.test(t) && !/flashback/i.test(t)) issues.push('fantasy_bleed');
  if (genre === 'cyberpunk' && /drache|zaubertrank|ritter/i.test(t)) issues.push('fantasy_bleed');
  if (genre === 'fantasy' && /infiziert|neon-gasse|chrome/i.test(t)) issues.push('genre_bleed');
  // Everyday coherence
  if (/hallo|hi|guten/i.test(input) && !/gruß|nickt|erwidert|mustert|hallo|sieht|antwortet|schweigt|lächelt/i.test(t) && t.length>0) {
    // soft — only if completely unrelated
    if (/kampf|sieg|exp\+/i.test(t)) issues.push('greet_mismatch');
  }
  if (/sehe mich um|umsehen/i.test(input) && !/sieh|um|ort|weg|anwesend|du /i.test(t)) issues.push('look_weak');
  if (/hungrig|essen|brot/i.test(input) && genre==='zombie' && !/hunger|essen|vorrat|knapp|brot|wasser|magen/i.test(t)) {
    issues.push('need_ignored');
  }
  return issues;
}

const server = await serve();
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
page.on('pageerror', e => console.warn('PAGEERR', e.message.slice(0,120)));

const findings = { genres: {}, bugs: [] };

async function boot(desk=false) {
  const vp = desk
    ? { width: 1920, height: 1080, deviceScaleFactor: 1 }
    : { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
  await page.setViewport(vp);
  await page.goto(`http://127.0.0.1:${PORT}/index.html?v=${VER}`, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload({ waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForFunction((v) => window.__game?.VER === v, { timeout: 30000 }, VER);
}

console.log('=== FEATURE SMOKE ===');
await boot(false);
await shot(page, 'title');

// Intro cutscene bespoke
const intro = await page.evaluate(async () => {
  const g = window.__game;
  const p = g.Cut31.playIntroCutscene({});
  await new Promise(r => setTimeout(r, 1000));
  const cv = document.getElementById('introCv');
  let bgData = null;
  try {
    bgData = cv?.toDataURL?.()?.slice(0,40);
  } catch(_){}
  document.getElementById('introSkip')?.click();
  await p.catch(()=>{});
  return { visible: !!cv, bgData };
});
console.log('intro', intro);
await page.evaluate(async () => {
  const g = window.__game;
  g.Cut31.dismissIntroCutscene();
  const p = g.Cut31.playIntroCutscene({});
  await new Promise(r => setTimeout(r, 1200));
  window.__ip = p;
});
await shot(page, 'intro-cutscene');
await page.evaluate(() => document.getElementById('introSkip')?.click());

// Travel unlocks
await page.evaluate(async () => {
  const g = window.__game;
  window.__setCfg?.({ mode: 'offline' });
  await g.newLife('held', { lives: 0, soul: 0, keptSkills: [] }, { skipSetup: true, name: 'Aki' });
  g.S.setup.done = true; g.S.ver = '32'; g.enterPlay();
  document.body.classList.add('pixel-jrpg','genre-held');
});
await page.evaluate(() => {
  const g = window.__game;
  g.openRegionTravelMap();
});
await new Promise(r => setTimeout(r, 400));
await shot(page, 'travel-locked-airship');
const travel = await page.evaluate(() => {
  const locked = !!document.querySelector('.tm-mode.locked');
  const modes = [...document.querySelectorAll('.tm-mode')].map(b => b.textContent);
  // try select airship
  const air = [...document.querySelectorAll('.tm-mode')].find(b => /Luftschiff/.test(b.textContent||''));
  air?.click();
  return { locked, modes, airStillLocked: !!document.querySelector('.tm-mode.locked') };
});
console.log('travel', travel);
if (!travel.locked) findings.bugs.push('airship not locked by default');

// Buy ticket unlock
await page.evaluate(() => {
  document.getElementById('travelMap')?.classList.add('hidden');
  const g = window.__game;
  g.S.st.gold = 500;
  g.S.world.npcs['Kaufmann Reis'] = { art: 'Reisender Händler Karawane', ort: 'Markt' };
  g.openPixelShop('Kaufmann Reis');
});
await new Promise(r => setTimeout(r, 300));
await shot(page, 'shop-market');
const ticket = await page.evaluate(() => {
  const g = window.__game;
  const rows = [...document.querySelectorAll('.pixel-shop-row')];
  const air = rows.find(r => /Luftschiff/i.test(r.textContent||''));
  air?.click();
  return {
    hadTicket: !!air,
    airship: !!(g.S.flags?.airship || g.TravelMap.hasAirship?.(g.S)),
    meta: document.querySelector('.pixel-shop-meta')?.textContent,
  };
});
console.log('ticket', ticket);
if (!ticket.hadTicket) findings.bugs.push('no airship ticket in exotic shop');
if (ticket.hadTicket && !ticket.airship) findings.bugs.push('ticket did not unlock airship');
await page.evaluate(() => document.getElementById('pixelShop')?.classList.add('hidden'));

// Harbor boat
const harbor = await page.evaluate(async () => {
  const g = window.__game;
  // ensure two harbors
  const nodes = g.S.world.graph.nodes;
  nodes['Hafen von Myr'] = Object.assign(nodes['Hafen von Myr']||{}, { harbor:true, tags:['harbor'], desc:'Salzige Luft.', exits:['Containerhafen Test'] });
  nodes['Containerhafen Test'] = { harbor:true, tags:['harbor'], desc:'Kräne und Planken.', exits:['Hafen von Myr'] };
  g.S.world.orte['Containerhafen Test'] = 'Kräne und Planken.';
  g.S.discovered = [...new Set([...(g.S.discovered||[]), 'Hafen von Myr', 'Containerhafen Test'])];
  await g.travelTo('Hafen von Myr', { force:true, hours:1 });
  g.openRegionTravelMap();
  // switch boat
  const boat = [...document.querySelectorAll('.tm-mode')].find(b => /Boot/.test(b.textContent||''));
  boat?.click();
  await new Promise(r => setTimeout(r, 100));
  // click container harbor on canvas — use go via state by evaluating API
  return {
    curHarbor: g.TravelMap.placeIsHarbor?.(g.S, 'Hafen von Myr'),
    destHarbor: g.TravelMap.placeIsHarbor?.(g.S, 'Containerhafen Test'),
    inland: g.TravelMap.placeIsHarbor?.(g.S, 'Dorf Weidenau'),
    airOk: g.TravelMap.hasAirship?.(g.S),
  };
});
console.log('harbor', harbor);
await shot(page, 'travel-harbors');
if (!harbor.curHarbor || !harbor.destHarbor) findings.bugs.push('harbor detection failed');
if (harbor.inland) findings.bugs.push('inland wrongly harbor');

// Houses art preview
await page.evaluate(() => {
  document.getElementById('travelMap')?.classList.add('hidden');
  let d = document.getElementById('artPrev');
  if (!d) { d = document.createElement('div'); d.id = 'artPrev'; document.body.appendChild(d); }
  d.style.cssText = 'position:fixed;inset:0;background:#1a1028;z-index:9999;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:16px';
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
  for (const n of ['crash','void','goddess','paths','fall']) {
    const im = document.createElement('img');
    im.src = `./assets/pixel/cutscene/${n}.png`;
    im.style.cssText = 'width:100%;image-rendering:pixelated;background:#000;border:2px solid #f59e0b';
    d.appendChild(im);
  }
});
await new Promise(r => setTimeout(r, 400));
await shot(page, 'art-houses-cutscene');
await page.evaluate(() => document.getElementById('artPrev')?.remove());

// Market sim variance
const market = await page.evaluate(() => {
  const g = window.__game;
  g.S.cal = g.S.cal || {}; g.S.cal.season = 'Winter';
  g.Econ.ensureMarket(g.S);
  g.Econ.pushMarketEvent(g.S, {id:'test_raid', label:'Test-Überfall', mult:1.5, days:3, cats:['food','weapon']});
  const winterFood = g.Econ.marketPriceMult(g.S, 'brot', 'Dorf Weidenau');
  g.S.cal.season = 'Herbst';
  const autumnFood = g.Econ.marketPriceMult(g.S, 'brot', 'Dorf Weidenau');
  const harborWeapon = g.Econ.marketPriceMult(g.S, 'schwert', 'Hafen von Myr');
  return { winterFood, autumnFood, harborWeapon, status: g.Econ.marketStatusLine(g.S) };
});
console.log('market', market);
if (!(market.winterFood > market.autumnFood)) findings.bugs.push('market season not affecting food');

// Genre first-hour playtests
const GENRESPEC = [
  { id: 'fantasy', boot: 'held', label: 'fantasy' },
  { id: 'zombie', boot: 'zombie', label: 'zombie' },
  { id: 'cyberpunk', boot: 'cyberpunk', label: 'cyberpunk' },
];

for (const spec of GENRESPEC) {
  console.log('\n=== FIRST HOUR:', spec.id, '===');
  await boot(false);
  const report = await page.evaluate(async (spec, EVERYDAY, VER) => {
    const g = window.__game;
    window.__FAST = true;
    window.__setCfg?.({ mode: 'offline' });
    const out = { replies: [], issues: [], ort: '', genre: '', hours: [] };
    if (spec.boot === 'held') {
      await g.newLife('held', { lives: 0, soul: 0, keptSkills: [] }, { skipSetup: true, name: 'Aki' });
      if (g.S.setup && !g.S.setup.done) g.S.setup.done = true;
      g.S.ver = VER;
      g.enterPlay();
      g.S.genre = 'fantasy';
    } else {
      await g.startProcedural(spec.boot, 'Aki');
    }
    out.genre = g.S.genre || g.S.role;
    out.ort = g.S.world?.scene?.ort;
    out.bridge = (g.S.log?.[0]?.t || '').slice(0, 200);
    // seed presence
    const names = Object.keys(g.S.world.npcs || {}).slice(0, 4);
    g.S.world.scene.anwesend = names;
    for (const n of names) {
      try { g.Know?.learnName?.(g.S, n, 'play'); g.Know?.markInteracted?.(g.S, n); } catch (_) {}
    }
    document.body.classList.add('pixel-jrpg');
    // ~first hour: 15 everyday + travel + shop + time advances (~60 min compressed)
    for (let i = 0; i < EVERYDAY.length; i++) {
      const a = EVERYDAY[i];
      let text = '';
      try {
        const r = await g.act(a);
        text = (r && (r.text || r.msg)) || '';
        // also pull from log
        if (!text) {
          const last = (g.S.log || []).slice(-1)[0];
          text = last?.t || '';
        }
      } catch (e) {
        text = 'ERR:' + (e.message || e);
        out.issues.push({ a, err: String(e.message || e) });
      }
      out.replies.push({ a, text: String(text).slice(0, 280), len: String(text).length });
      try { g.advanceTimeMinutes?.(8, { allowLong: true }); } catch (_) {}
    }
    // travel a bit
    const orte = Object.keys(g.S.world.orte || {}).slice(0, 5);
    for (const dest of orte) {
      try {
        await g.travelTo(dest, { force: true, hours: 1 });
        out.hours.push(dest);
      } catch (e) {
        out.issues.push({ travel: dest, err: String(e.message || e) });
      }
    }
    out.ortEnd = g.S.world?.scene?.ort;
    out.cal = { ...(g.S.cal || {}) };
    out.gold = g.S.st?.gold;
    out.systems = g.S.world?.systems || g.S.systems;
    // OW visual
    try {
      g.OW.showOverworld(g.S);
      await new Promise(r => setTimeout(r, 300));
      const dbg = g.OW.__debug?.() || {};
      out.ow = { preset: dbg.map?.preset, overhead: dbg.map?.overhead, npcs: (dbg.npcs || []).length };
    } catch (e) {
      out.ow = { err: String(e.message || e) };
    }
    return out;
  }, spec, EVERYDAY, VER);

  // score replies in node
  const scored = report.replies.map(r => {
    const issues = scoreReply(r.a, r.text, spec.id === 'fantasy' ? 'fantasy' : spec.id, report);
    return { ...r, issues };
  });
  const allIssues = scored.flatMap(s => s.issues.map(i => ({ a: s.a, i })));
  findings.genres[spec.id] = {
    ort: report.ort,
    ortEnd: report.ortEnd,
    bridge: report.bridge,
    ow: report.ow,
    cal: report.cal,
    gold: report.gold,
    sample: scored.slice(0, 5).map(s => ({ a: s.a, text: s.text.slice(0, 120), issues: s.issues })),
    issueCounts: allIssues.reduce((acc, x) => { acc[x.i] = (acc[x.i] || 0) + 1; return acc; }, {}),
    worst: scored.filter(s => s.issues.length).slice(0, 8),
    travelN: report.hours.length,
    rawIssues: report.issues,
  };
  console.log(spec.id, 'issues', findings.genres[spec.id].issueCounts, 'ow', report.ow);

  await dismissQuiet(page);
  await shot(page, `genre-${spec.id}-ow`);
  // dialogue / vn sample
  await page.evaluate(() => {
    const g = window.__game;
    g.OW.hideOverworld?.();
    document.getElementById('menu')?.classList.add('hidden');
  });
  await shot(page, `genre-${spec.id}-vn`);
}

async function dismissQuiet(page) {
  await page.evaluate(() => {
    document.querySelectorAll('.begegnung,#begegnung,#pixelShop,#travelMap,#introCutscene').forEach(el => el.classList.add('hidden'));
    document.getElementById('menu')?.classList.add('hidden');
  });
}

// Desktop fantasy smoke
console.log('\n=== DESKTOP ===');
await boot(true);
await page.evaluate(async () => {
  const g = window.__game;
  window.__setCfg?.({ mode: 'offline' });
  await g.newLife('held', { lives: 0, soul: 0, keptSkills: [] }, { skipSetup: true, name: 'Aki' });
  g.S.setup.done = true; g.S.ver = '32'; g.enterPlay();
  document.body.classList.add('pixel-jrpg','genre-held');
  g.OW.showOverworld(g.S);
});
await new Promise(r => setTimeout(r, 700));
await shot(page, 'desktop-overworld');

// Migrate v13-v31
const migrate = await page.evaluate(() => {
  const g = window.__game;
  const results = [];
  for (const v of [13,16,18,20,22,23,24,25,26,27,28,29,30,31]) {
    try {
      const raw = JSON.stringify({ ver: v, role: 'held', world: g.S.world, pc: g.S.pc, st: g.S.st, cal: g.S.cal, inv: [], setup: { done: true } });
      const s = g.migrate(raw);
      results.push({ v, out: s.ver, ok: Number(s.ver) >= 32 || s.ver === '32' || Number(s.ver) >= Number(v) });
    } catch (e) { results.push({ v, err: String(e.message || e) }); }
  }
  return results;
});
console.log('migrate fails', migrate.filter(x => x.err || !x.ok));
if (migrate.some(x => x.err)) findings.bugs.push('migrate errors');

await browser.close();
server.close();

fs.writeFileSync('/tmp/v32-playtest.json', JSON.stringify(findings, null, 2));
console.log('\n=== FINDINGS BUGS ===');
console.log(findings.bugs.length ? findings.bugs : 'none flagged in smoke');
console.log(JSON.stringify({ fantasy: findings.genres.fantasy?.issueCounts, zombie: findings.genres.zombie?.issueCounts, cyberpunk: findings.genres.cyberpunk?.issueCounts }, null, 2));
if (findings.bugs.length) process.exitCode = 1;
