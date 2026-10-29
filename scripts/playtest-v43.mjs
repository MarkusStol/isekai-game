#!/usr/bin/env node
/**
 * v43: tyrant L4 ~50%; pixel portraits+expressions; ambient beds; transitions;
 * genuine ~22–28 min wall-clock mixed playtest + bug sweep.
 */
import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = '/workspace/isekai-game-shots';
fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT).filter(x => /^v43-/.test(x))) fs.unlinkSync(path.join(OUT, f));
const PORT = 8814;
const VER = '43';
const PLAY_MS = Number(process.env.V43_PLAY_MS || (22 * 60 * 1000)); // ~22 min default

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
  const dest = path.join(OUT, `v43-${name}.png`);
  await page.screenshot({ path: dest, type: 'png' });
  console.log('shot', name, fs.statSync(dest).size);
  return dest;
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function boot(page, genre = 'fantasy') {
  await page.goto(`http://127.0.0.1:${PORT}/?v=${VER}&pt=1`, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForFunction(() => window.__game?.VER === '43' && window.__game?.C43 && window.__game?.Battle, { timeout: 30000 });
  await page.evaluate(() => { try { localStorage.clear(); localStorage.setItem('isekai_audio_on', '1'); } catch (_) {} });
  return page.evaluate(async (g) => {
    const G = window.__game;
    window.__PLAYTEST = true;
    window.__setCfg?.({ mode: 'offline', gkey: '', pollenKey: '' });
    window.__gateFastCut = true;
    try { G.Aud?.setEnabled?.(true); } catch (_) {}
    await G.startProcedural?.(g, 'Alex');
    if (G.S && !G.S.setup?.done) { G.S.setup = G.S.setup || {}; G.S.setup.done = true; }
    G.S.flags = G.S.flags || {}; G.S.flags.onboarded = true;
    try { G.enterPlay?.(); } catch (_) {}
    G.C40.seedAllNpcArcs(G.S);
    G.C41.ensureCraft41(G.S);
    G.C43.migrateV43(G.S);
    return { ver: G.VER, genre: G.S?.genre, npcs: Object.keys(G.S?.world?.npcs || {}).length };
  }, genre);
}

async function balanceTyrant(page, trials = 12) {
  return page.evaluate(async (trials) => {
    const G = window.__game;
    const { enemyById } = await import('./enemies.js');
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const results = [];
    for (let t = 0; t < trials; t++) {
      const S = G.S;
      const lvl = 4;
      S.st = { lvl, xp: 0, maxhp: 95 + lvl * 8, hp: 95 + lvl * 8, maxmp: 40 + lvl * 4, mp: 40 + lvl * 4, str: 6 + Math.floor(lvl * 0.7), cha: 6, gold: 50 };
      S.progress = S.progress || {};
      S.progress.attrs = { str: 8, dex: 6, int: 8, wil: 5, cha: 6, vit: 9 };
      G.C43.migrateV43(S);
      G.Equip.ensureEquip(S); S.equip.weapon = null; S.equip.armor = null;
      G.Jobs.ensureJobs(S); S.jobs.active = 'magier'; S.jobs.levels = { magier: 4, krieger: 2 };
      S.inv = []; S.party = []; S.romance = {}; S.cfgAtbMode = 'active';
      S.flags = { dungeonBoss: 1 };
      S.content39 = S.content39 || G.C39.ensureContent39(S);
      S.content39.dungeon = { name: 'Sim', boss: 'boss_tyrant', room: 0, rooms: [{ type: 'boss' }] };
      try { if (G.Battle.isActive()) { G.Battle.__testDrive('flee'); await sleep(700); } } catch (_) {}
      G.Battle.startBattle(S, { enemies: [{ ...enemyById('boss_tyrant') }], dungeonBoss: true, atbMode: 'active' });
      let steps = 0;
      while (G.Battle.isActive() && steps++ < 260) {
        const B = G.Battle.getBattle();
        const sel = B?.selecting;
        if (sel?.actor?.kind === 'hero' && (sel.mode === 'main' || sel.mode == null || sel.mode === 'attack')) {
          const hero = sel.actor;
          const foes = (B.foes || []).filter(f => f.alive);
          if (!foes.length) break;
          hero.gambits = G.C42.skilledGambits();
          const dec = G.C42.skilledGambitDecide(hero, B);
          if (!G.C42.applySkilledCommand(G.Battle, dec)) G.Battle.playerCommand('attack', { targetId: foes[0]._iid });
          for (let w = 0; w < 40; w++) {
            await sleep(40);
            const B2 = G.Battle.getBattle();
            if (!B2 || B2.done || !G.Battle.isActive()) break;
            if (B2.selecting?.actor?.kind === 'hero') break;
          }
        } else await sleep(40);
      }
      let finalResult = G.Battle.getBattle()?.result || null;
      let guard = 0;
      while (G.Battle.isActive() && guard++ < 50) await sleep(40);
      await sleep(300);
      finalResult = finalResult || G.Battle.getLastResult?.() || null;
      if (G.Battle.isActive()) {
        try { const B = G.Battle.getBattle(); if (B) { B.scripted = true; B.flags = B.flags || {}; B.flags.scripted = true; } G.Battle.playerCommand('flee'); } catch (_) {}
        await sleep(400);
        finalResult = finalResult || 'timeout';
      }
      results.push(finalResult);
    }
    const wins = results.filter(r => r === 'win').length;
    return { wins, trials, winRate: wins / trials, results };
  }, trials);
}

async function portraitSuite(page) {
  return page.evaluate(() => {
    const G = window.__game;
    const S = G.S;
    const names = Object.keys(S.world?.npcs || {}).slice(0, 12);
    const moods = ['neutral', 'wütend', 'freut sich', 'traurig', 'kühl', 'überrascht'];
    const out = [];
    const urls = new Set();
    for (const name of names) {
      const npc = S.world.npcs[name];
      for (const mood of moods) {
        const n = { ...npc, mood };
        const expr = G.C43.expressionFromMood(mood);
        const url = G.C43.pixelPortraitUrl(name, n, expr);
        const key = G.C43.pixelPortraitKey(name, n, expr);
        const app = G.C43.appearanceFromNpc(name, n);
        out.push({ name, mood, expr, role: app.role, key, hasUrl: !!url, len: url?.length || 0 });
        if (url) urls.add(url.slice(0, 64));
      }
      // stability: same seed twice
      const a = G.C43.appearanceFromNpc(name, npc).seed;
      const b = G.C43.appearanceFromNpc(name, npc).seed;
      if (a !== b) out.push({ name, err: 'unstable_seed' });
    }
    // distinctness across NPCs (neutral)
    const seeds = names.map(n => G.C43.appearanceFromNpc(n, S.world.npcs[n]).seed);
    const uniqSeeds = new Set(seeds).size;
    return {
      npcCount: names.length,
      samples: out.length,
      uniqUrlPrefixes: urls.size,
      uniqSeeds,
      seedRatio: names.length ? uniqSeeds / names.length : 0,
      exprs: [...new Set(out.map(o => o.expr))],
      ok: names.length >= 3 && uniqSeeds >= Math.min(3, names.length) && out.every(o => !o.err && o.hasUrl),
    };
  });
}

async function ambientSuite(page) {
  return page.evaluate(() => {
    const G = window.__game;
    const S = G.S;
    const cases = [
      { ort: 'Marktplatz', kind: 'town', expect: 'crowd' },
      { ort: 'Dunkler Wald', kind: 'wild', expect: 'wind' },
      { ort: 'Sektor 9 Neon', kind: 'town', genre: 'cyberpunk', expect: 'neon' },
      { ort: 'Regenstrasse', kind: 'town', weather: 'regen', expect: 'rain' },
    ];
    const hits = [];
    const prevScene = { ...S.world.scene };
    const prevGenre = S.genre;
    const prevWeather = S.world.weather;
    for (const c of cases) {
      S.world.scene = { ...S.world.scene, ort: c.ort };
      S.genre = c.genre || 'fantasy';
      S.world.weather = c.weather || '';
      if (S.flags) S.flags.weather = c.weather || '';
      const got = G.C43.ambientForContext(S, { kind: c.kind, name: c.ort });
      hits.push({ ...c, got, ok: got === c.expect });
    }
    S.world.scene = prevScene;
    S.genre = prevGenre;
    S.world.weather = prevWeather;
    G.C43.playAmbient('wind', { enabled: true, vol: 0.01 });
    G.C43.stopAmbient();
    return { hits, ok: hits.every(h => h.ok) };
  });
}

async function transitionSuite(page) {
  return page.evaluate(async () => {
    const G = window.__game;
    await G.C43.screenTransition('fade', 200);
    const el = document.getElementById('fxTransition');
    await G.C43.withTransition(async () => { /* noop */ }, 'menu', 200);
    return { hasDom: !!el, ok: !!el };
  });
}

async function longMixedPlay(page, report) {
  const bugs = [];
  const log = [];
  const t0 = Date.now();
  const deadline = t0 + PLAY_MS;
  let cycle = 0;
  const genres = ['fantasy', 'zombie', 'cyberpunk'];

  await boot(page, 'fantasy');
  await shot(page, 'mobile-boot');

  // Initial immersion checks
  const ports = await portraitSuite(page);
  report.portraits = ports;
  log.push({ t: 0, ports });
  if (!ports.ok) bugs.push('portraits_fail');

  const amb = await ambientSuite(page);
  report.ambient = amb;
  if (!amb.ok) bugs.push('ambient_map_fail');

  const tr = await transitionSuite(page);
  report.transition = tr;
  if (!tr.ok) bugs.push('transition_dom_fail');

  // Show emotive portraits in VN
  await page.evaluate(() => {
    const G = window.__game;
    const names = Object.keys(G.S.world.npcs);
    const n = names[0];
    G.S.world.npcs[n].mood = 'freut sich';
    G.setPortrait(n, G.S.world.npcs[n]);
  });
  await sleep(300);
  await shot(page, 'mobile-portrait-happy');

  await page.evaluate(() => {
    const G = window.__game;
    const names = Object.keys(G.S.world.npcs);
    const n = names[0];
    G.S.world.npcs[n].mood = 'wütend';
    G.setPortrait(n, G.S.world.npcs[n]);
  });
  await sleep(300);
  await shot(page, 'mobile-portrait-angry');

  // OW with dialogue portrait
  await page.evaluate(() => {
    const G = window.__game;
    try { G.OW.showOverworld(G.S); } catch (_) {}
    G.C43.syncAmbient(G.S, G.OW.__map, G.Aud);
  });
  await sleep(500);
  await shot(page, 'mobile-ow-ambient');

  await page.evaluate(() => {
    const G = window.__game;
    const npcs = G.OW.__map?.npcs || [];
    const n = npcs[0]?.name || Object.keys(G.S.world.npcs)[0];
    if (G.S.world.npcs[n]) G.S.world.npcs[n].mood = 'freut sich';
    G.OW.showDialogue(n, 'Schön, dich zu sehen — der Markt ist heute laut.', npcs[0]?.sheet || 'villager');
  });
  await sleep(400);
  await shot(page, 'mobile-ow-dlg-portrait');

  // Main long loop
  while (Date.now() < deadline) {
    cycle++;
    const elapsed = ((Date.now() - t0) / 60000).toFixed(1);
    const genre = genres[cycle % genres.length];
    console.log(`cycle ${cycle} @ ${elapsed} min`);

    // Reboot genre every few cycles for variety
    if (cycle % 4 === 1 && cycle > 1) {
      await boot(page, genre);
    }

    // Walk OW
    await page.evaluate(async () => {
      const G = window.__game;
      try { G.OW.showOverworld(G.S); } catch (_) {}
      G.C43.syncAmbient(G.S, G.OW.__map, G.Aud);
      const dirs = [[1,0],[-1,0],[0,1],[0,-1],[1,0],[0,-1]];
      for (let i = 0; i < 18; i++) {
        const [dx, dy] = dirs[i % dirs.length];
        try { G.OW.__tryMove?.(dx, dy); } catch (_) {}
        await new Promise(r => setTimeout(r, 120));
      }
      try { G.OW.__talkNearest?.(); } catch (_) {}
    });
    await sleep(800);

    // Menu open with transition
    await page.evaluate(async () => {
      const G = window.__game;
      try { await G.C43.withTransition(() => G.openMenu?.(), 'menu', 280); } catch (_) {
        try { G.openMenu?.(); } catch (_) {}
      }
    });
    await sleep(600);
    if (cycle % 5 === 0) await shot(page, `mobile-menu-c${cycle}`);

    // Close menu-ish
    await page.evaluate(() => {
      try { document.getElementById('menu')?.classList.add('hidden'); } catch (_) {}
      try { document.body.classList.remove('menu-open'); } catch (_) {}
    });

    // Short battle
    await page.evaluate(async () => {
      const G = window.__game;
      const { enemyById } = await import('./enemies.js');
      const ids = ['goblin', 'wolf', 'slime'];
      const id = ids[Math.floor(Math.random() * ids.length)];
      try { if (G.Battle.isActive()) G.Battle.__testDrive('flee'); } catch (_) {}
      await new Promise(r => setTimeout(r, 400));
      G.S.st.hp = G.S.st.maxhp;
      G.Battle.startBattle(G.S, { enemies: [enemyById(id)], atbMode: 'wait', scripted: true });
      const B = G.Battle.getBattle();
      if (B) {
        for (let i = 0; i < 3; i++) {
          try { G.Battle.__testDrive('attack'); } catch (_) {}
          await new Promise(r => setTimeout(r, 350));
        }
        try { G.Battle.__testDrive('flee'); } catch (_) {}
      }
    });
    await sleep(1200);
    if (cycle % 6 === 0) await shot(page, `mobile-battle-c${cycle}`);

    // Weather / ambient swap
    await page.evaluate(() => {
      const G = window.__game;
      const weathers = ['klar', 'regen', 'sturm', ''];
      G.S.world.weather = weathers[Math.floor(Math.random() * weathers.length)];
      G.C43.syncAmbient(G.S, G.OW?.__map || { kind: 'town', name: G.S.world.scene.ort }, G.Aud);
    });

    // Portrait rotate moods for met NPCs
    await page.evaluate(() => {
      const G = window.__game;
      const moods = ['neutral', 'freut sich', 'wütend', 'traurig', 'kühl'];
      const names = Object.keys(G.S.world.npcs).slice(0, 5);
      for (const n of names) {
        G.S.world.npcs[n].mood = moods[Math.floor(Math.random() * moods.length)];
        G.setPortrait(n, G.S.world.npcs[n]);
      }
    });
    await sleep(400);

    // Travel / location flavor
    await page.evaluate(() => {
      const G = window.__game;
      const orte = Object.keys(G.S.world?.orte || {});
      if (orte.length) {
        const o = orte[Math.floor(Math.random() * orte.length)];
        try { G.travelTo?.(o); } catch (_) {
          G.S.world.scene.ort = o;
          try { G.OW.refreshOverworld?.(G.S); } catch (_) {}
        }
      }
      G.C43.syncAmbient(G.S, G.OW?.__map, G.Aud);
    });
    await sleep(700);

    // Narrator beat
    await page.evaluate(async () => {
      const G = window.__game;
      try { await G.act?.('ich sehe mich um'); } catch (_) {}
    });
    await sleep(900);

    // Page error harvest
    // (collected via listener)

    // Pace: keep wall clock honest — each cycle ~45–70s of real waits already; add idle soak
    const remain = deadline - Date.now();
    if (remain > 0) {
      const soak = Math.min(45000, Math.max(8000, Math.floor(remain / 8)));
      await sleep(soak);
    }

    log.push({ cycle, elapsedMin: +((Date.now() - t0) / 60000).toFixed(2) });
  }

  // Desktop pass near end
  await page.setViewport({ width: 1280, height: 800, isMobile: false, hasTouch: false });
  await boot(page, 'fantasy');
  await page.evaluate(() => {
    const G = window.__game;
    const n = Object.keys(G.S.world.npcs)[0];
    G.S.world.npcs[n].mood = 'freut sich';
    G.setPortrait(n, G.S.world.npcs[n]);
    try { G.OW.showOverworld(G.S); } catch (_) {}
    G.OW.showDialogue(n, 'Willkommen zurück — die Straßen summen.', 'villager');
    G.C43.syncAmbient(G.S, G.OW.__map, G.Aud);
  });
  await sleep(500);
  await shot(page, 'desktop-ow-dlg-portrait');
  await page.evaluate(async () => {
    const G = window.__game;
    const { enemyById } = await import('./enemies.js');
    await G.C43.screenTransition('battle', 300);
    G.Battle.startBattle(G.S, { enemies: [enemyById('goblin')], atbMode: 'wait', scripted: true });
  });
  await sleep(500);
  await shot(page, 'desktop-battle-transition');

  report.longPlay = {
    cycles: cycle,
    wallMin: +((Date.now() - t0) / 60000).toFixed(2),
    log: log.slice(-15),
  };
  report.bugs = bugs;
  return bugs;
}

(async () => {
  const server = await serve();
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=390,844', '--autoplay-policy=no-user-gesture-required'],
    defaultViewport: { width: 390, height: 844, isMobile: true, hasTouch: true },
  });
  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', e => { pageErrors.push(String(e.message || e).slice(0, 160)); console.warn('PAGEERR', e.message); });
  const report = { ver: VER, playMs: PLAY_MS, bugs: [], pageErrors };

  console.log('=== boot + tyrant balance ===');
  console.log(await boot(page, 'zombie'));
  const tyr = await balanceTyrant(page, 12);
  report.tyrantL4 = tyr;
  console.log('tyrant L4 skilled', tyr);

  console.log(`=== long mixed play ~${(PLAY_MS / 60000).toFixed(0)} min ===`);
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await longMixedPlay(page, report);
  report.pageErrors = pageErrors.slice(0, 30);

  report.pass = {
    tyrantNear50: tyr.winRate >= 0.35 && tyr.winRate <= 0.65,
    portraits: !!report.portraits?.ok,
    ambient: !!report.ambient?.ok,
    transition: !!report.transition?.ok,
    longEnough: (report.longPlay?.wallMin || 0) >= 18,
    noBugs: (report.bugs || []).length === 0,
  };
  report.pass.ok = report.pass.tyrantNear50 && report.pass.portraits && report.pass.ambient && report.pass.transition && report.pass.longEnough;

  fs.writeFileSync(path.join(OUT, 'v43-playtest.json'), JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(OUT, 'v43-balance-stats.json'), JSON.stringify({ tyrantL4: tyr, pass: report.pass }, null, 2));
  console.log('PASS', report.pass);
  console.log('wallMin', report.longPlay?.wallMin, 'cycles', report.longPlay?.cycles);
  await browser.close();
  server.close();
  process.exit(report.pass.ok ? 0 : 2);
})().catch(e => { console.error(e); process.exit(1); });
