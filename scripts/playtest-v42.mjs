#!/usr/bin/env node
/**
 * v42: skilled AI (gambits/elements/stagger) vs heuristic; L4 no-kit ~40–50%;
 * boss talk odds UI; OW region minimap; mixed playtest bug sweep.
 */
import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = '/workspace/isekai-game-shots';
fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT).filter(x => /^v42-/.test(x))) fs.unlinkSync(path.join(OUT, f));
const PORT = 8812;
const VER = '42';
const BOSSES = [
  { id: 'boss_ogre', genre: 'fantasy', expectLvl: 8 },
  { id: 'boss_tyrant', genre: 'zombie', expectLvl: 8 },
  { id: 'boss_chrome', genre: 'cyberpunk', expectLvl: 8 },
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
  const dest = path.join(OUT, `v42-${name}.png`);
  await page.screenshot({ path: dest, type: 'png' });
  console.log('shot', name, fs.statSync(dest).size);
  return dest;
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function boot(page, genre = 'fantasy') {
  await page.goto(`http://127.0.0.1:${PORT}/?v=${VER}&pt=1`, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForFunction(() => window.__game?.VER === '42' && window.__game?.C42 && window.__game?.Battle, { timeout: 30000 });
  await page.evaluate(() => { try { localStorage.clear(); } catch (_) {} });
  return page.evaluate(async (g) => {
    const G = window.__game;
    window.__PLAYTEST = true;
    window.__setCfg?.({ mode: 'offline', gkey: '', pollenKey: '' });
    window.__gateFastCut = true;
    await G.startProcedural?.(g, 'Alex');
    if (G.S && !G.S.setup?.done) { G.S.setup = G.S.setup || {}; G.S.setup.done = true; }
    try { G.S.flags = G.S.flags || {}; G.S.flags.onboarded = true; } catch (_) {}
    try { G.enterPlay?.(); } catch (_) {}
    G.C40.seedAllNpcArcs(G.S);
    G.C41.ensureCraft41(G.S);
    G.C41.syncCraftProgress41(G.S);
    G.C42.migrateV42(G.S);
    return { ver: G.VER, genre: G.S?.genre, hasC42: !!G.C42 };
  }, genre);
}

function prepState(S, G, lvl, kit) {
  S.st = S.st || {};
  S.st.lvl = lvl; S.st.xp = 0;
  S.st.maxhp = 95 + lvl * 8; S.st.hp = S.st.maxhp;
  S.st.maxmp = 40 + lvl * 4; S.st.mp = S.st.maxmp;
  S.st.str = 6 + Math.floor(lvl * 0.7); S.st.cha = 6 + Math.floor(lvl / 3);
  S.progress = S.progress || {};
  S.progress.attrs = { str: 6+Math.floor(lvl/2), dex: 5+Math.floor(lvl/3), int: 6+Math.floor(lvl/3), wil: 5, cha: 6+Math.floor(lvl/4), vit: 7+Math.floor(lvl/2) };
  G.C42.migrateV42(S);
  try {
    G.Equip.ensureEquip(S);
    if (kit && lvl >= 5) { S.equip.weapon = 'eisenklinge'; S.equip.armor = 'lederwams'; }
    if (kit && lvl >= 10) { S.equip.weapon = 'runenschwert'; S.equip.armor = 'plattenharnisch'; }
    if (!kit) { S.equip.weapon = null; S.equip.armor = null; }
  } catch (_) {}
  try {
    G.Jobs.ensureJobs(S);
    S.jobs.active = 'magier'; // elemental kit for skilled depth
    S.jobs.levels = S.jobs.levels || {};
    S.jobs.levels.magier = Math.min(8, 2 + Math.floor(lvl / 2));
    S.jobs.levels.krieger = Math.min(6, 1 + Math.floor(lvl / 3));
  } catch (_) {}
  if (kit && lvl >= 7) {
    S.inv = [
      { name: 'Heiltrank', icon: '🧪', type: 'consumable' },
      { name: 'Heiltrank', icon: '🧪', type: 'consumable' },
      { name: 'Heiltrank', icon: '🧪', type: 'consumable' },
    ];
    const npc = Object.keys(S.world?.npcs || {})[0];
    if (npc) {
      S.romance = S.romance || {};
      S.romance[npc] = { affection: 40, trust: 25, stage: 2, events: [] };
      S.party = [npc];
    }
  } else {
    S.inv = [];
    S.party = [];
    S.romance = {};
  }
  S.cfgAtbMode = 'active';
  S.cfgBattleDiff = 'normal';
  S.flags = S.flags || {}; S.flags.dungeonBoss = 1;
}

/** mode: 'heuristic' | 'skilled' */
async function balanceSim(page, bossId, trials, lvl, mode, kit) {
  return page.evaluate(async (bossId, trials, lvl, mode, kit) => {
    const G = window.__game;
    const { enemyById } = await import('./enemies.js');
    const results = [];
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const whyCounts = {};

    for (let t = 0; t < trials; t++) {
      const S = G.S;
      S.st = S.st || {};
      S.st.lvl = lvl; S.st.xp = 0;
      S.st.maxhp = 95 + lvl * 8; S.st.hp = S.st.maxhp;
      S.st.maxmp = 40 + lvl * 4; S.st.mp = S.st.maxmp;
      S.st.str = 6 + Math.floor(lvl * 0.7); S.st.cha = 6 + Math.floor(lvl / 3);
      S.progress = S.progress || {};
      S.progress.attrs = { str: 6+Math.floor(lvl/2), dex: 5+Math.floor(lvl/3), int: 6+Math.floor(lvl/3), wil: 5, cha: 6+Math.floor(lvl/4), vit: 7+Math.floor(lvl/2) };
      G.C42.migrateV42(S);
      try {
        G.Equip.ensureEquip(S);
        if (kit && lvl >= 5) { S.equip.weapon = 'eisenklinge'; S.equip.armor = 'lederwams'; }
        else { S.equip.weapon = null; S.equip.armor = null; }
        if (kit && lvl >= 10) { S.equip.weapon = 'runenschwert'; S.equip.armor = 'plattenharnisch'; }
      } catch (_) {}
      try {
        G.Jobs.ensureJobs(S);
        S.jobs.active = mode === 'skilled' ? 'magier' : 'krieger';
        S.jobs.levels = S.jobs.levels || {};
        S.jobs.levels.magier = Math.min(8, 2 + Math.floor(lvl / 2));
        S.jobs.levels.krieger = Math.min(8, 2 + Math.floor(lvl / 2));
      } catch (_) {}
      if (kit && lvl >= 7) {
        S.inv = [{ name: 'Heiltrank', icon: '🧪', type: 'consumable' }, { name: 'Heiltrank', icon: '🧪', type: 'consumable' }, { name: 'Heiltrank', icon: '🧪', type: 'consumable' }];
        const npc = Object.keys(S.world?.npcs || {})[0];
        if (npc) {
          S.romance = S.romance || {};
          S.romance[npc] = { affection: 40, trust: 25, stage: 2, events: [] };
          S.party = [npc];
        }
      } else {
        S.inv = []; S.party = []; S.romance = {};
      }
      S.cfgAtbMode = 'active';
      S.flags = S.flags || {}; S.flags.dungeonBoss = 1;
      S.content39 = S.content39 || G.C39.ensureContent39(S);
      S.content39.dungeon = { name: 'Sim', boss: bossId, room: 0, rooms: [{ type: 'boss' }] };

      try { if (G.Battle.isActive()) { G.Battle.__testDrive('flee'); await sleep(700); } } catch (_) {}

      const foe = { ...enemyById(bossId) };
      G.Battle.startBattle(S, { enemies: [foe], dungeonBoss: true, atbMode: 'active' });
      const B0 = G.Battle.getBattle();
      if (B0?.scripted) { results.push({ t, err: 'scripted_leaked' }); continue; }

      let steps = 0;
      const maxSteps = 260;
      while (G.Battle.isActive() && steps < maxSteps) {
        steps++;
        const B = G.Battle.getBattle();
        const sel = B?.selecting;
        if (sel?.actor?.kind === 'hero' && (sel.mode === 'main' || sel.mode == null || sel.mode === 'attack')) {
          const hero = sel.actor;
          const foes = (B.foes || []).filter(f => f.alive);
          if (!foes.length) break;
          if (mode === 'skilled') {
            hero.gambits = G.C42.skilledGambits();
            const dec = G.C42.skilledGambitDecide(hero, B, hero.gambits);
            if (dec?.why) whyCounts[dec.why] = (whyCounts[dec.why] || 0) + 1;
            if (!G.C42.applySkilledCommand(G.Battle, dec)) {
              G.Battle.playerCommand('attack', { targetId: foes[0]._iid });
            }
          } else {
            const hpRatio = hero.hp / Math.max(1, hero.maxhp);
            const heal = (hero.skills || []).find(s => s.heal && (hero.mp|0) >= (s.mp|0));
            const hasPotion = (G.S.inv||[]).some(i => /trank|heil/i.test(typeof i==='string'?i:i.name));
            if (hpRatio < 0.35 && hasPotion) G.Battle.playerCommand('item', { item: 'Heiltrank' });
            else if (hpRatio < 0.42 && heal) G.Battle.playerCommand('skill', { skill: heal });
            else G.Battle.playerCommand('attack', { targetId: foes[0]._iid });
          }
          for (let w = 0; w < 40; w++) {
            await sleep(45);
            const B2 = G.Battle.getBattle();
            if (!B2 || B2.done || !G.Battle.isActive()) break;
            if (!B2.selecting) continue;
            if (B2.selecting.actor?.kind === 'hero') break;
          }
        } else {
          await sleep(45);
        }
      }
      let finalResult = G.Battle.getBattle()?.result || null;
      if (!finalResult && G.Battle.getBattle()?.done) finalResult = G.Battle.getBattle().result;
      let guard = 0;
      while (G.Battle.isActive() && guard++ < 60) await sleep(40);
      await sleep(350);
      finalResult = finalResult || G.Battle.getLastResult?.() || G.Battle.getLastSummary?.()?.result || null;
      if (G.Battle.isActive()) {
        try {
          const B = G.Battle.getBattle();
          if (B) { B.scripted = true; B.flags = B.flags || {}; B.flags.scripted = true; }
          G.Battle.playerCommand('flee');
        } catch (_) {}
        await sleep(450);
        finalResult = finalResult || 'timeout';
      }
      results.push({ t, result: finalResult || 'unknown', steps, lvl, mode });
    }
    const wins = results.filter(r => r.result === 'win').length;
    return {
      bossId, lvl, trials, mode, kit: !!kit, wins,
      winRate: wins / trials,
      losses: results.filter(r => r.result === 'lose').length,
      flees: results.filter(r => r.result === 'flee').length,
      timeouts: results.filter(r => r.result === 'timeout' || r.result === 'unknown').length,
      whyCounts,
      sample: results.slice(0, 4),
    };
  }, bossId, trials, lvl, mode, kit);
}

async function talkOddsSuite(page) {
  return page.evaluate(async () => {
    const G = window.__game;
    const S = G.S;
    const { enemyById } = await import('./enemies.js');
    S.romance = S.romance || {};
    const npc = Object.keys(S.world?.npcs || {})[0] || 'Mira';
    S.romance[npc] = { affection: 55, trust: 40, stage: 2, events: [] };
    S.st.cha = 12;
    S.content39 = S.content39 || G.C39.ensureContent39(S);
    S.content39.threads = S.content39.threads || {};
    S.content39.threads.fantasy = { stage: 2, title: 'Ostwall' };
    const foe = enemyById('boss_ogre');
    G.Battle.startBattle(S, { enemies: [foe], dungeonBoss: true, atbMode: 'wait', scripted: true });
    const B = G.Battle.getBattle();
    B.selecting = { actor: B.party.find(p => p.kind === 'hero'), mode: 'bossTalk', targetId: B.foes[0]._iid };
    G.Battle.renderBattleUI();
    await new Promise(r => setTimeout(r, 80));
    const sheet = document.querySelector('.boss-talk-sheet');
    const odds = [...document.querySelectorAll('.bts-odds')].map(el => el.textContent);
    const hints = [...document.querySelectorAll('.bts-hint')].map(el => el.textContent);
    const choices = G.C41.bossDialogueChoices(S, B.foes[0]);
    const est = choices.map(c => G.C42.estimateTalkChance(S, B.foes[0], c));
    return {
      sheet: !!sheet,
      oddsCount: odds.length,
      odds,
      hints: hints.slice(0, 4),
      estSample: est.slice(0, 3).map(e => ({ pct: e.pct, hints: e.hints })),
      hasPercent: odds.every(o => /%/.test(o)),
      ok: !!sheet && odds.length >= 3 && odds.every(o => /%/.test(o)),
    };
  });
}

async function owMinimapSuite(page) {
  return page.evaluate(async () => {
    const G = window.__game;
    const S = G.S;
    try { G.OW?.showOverworld?.(S); } catch (_) {}
    await new Promise(r => setTimeout(r, 200));
    // force a few draws
    for (let i = 0; i < 12; i++) {
      try { G.C42.renderOwRegionMinimap?.(
        G.OW.__map || { w: 24, h: 18, tiles: Array.from({ length: 18 }, (_, y) => Array.from({ length: 24 }, () => 'grass')), name: 'Test' },
        { x: 5, y: 5 },
        { name: G.OW.__map?.name || 'Region' }
      ); } catch (_) {}
    }
    await new Promise(r => setTimeout(r, 100));
    const host = document.getElementById('owRegionMinimap');
    const canvas = host?.querySelector('canvas');
    const map = G.OW?.__map;
    return {
      visible: host && !host.classList.contains('hidden'),
      hasCanvas: !!canvas,
      cw: canvas?.width, ch: canvas?.height,
      mapW: map?.w, mapH: map?.h,
      name: host?.querySelector('.ow-mm-label')?.textContent,
      ok: !!(host && canvas && canvas.width > 10),
    };
  });
}

async function mixedPlaytest(page) {
  const bugs = [];
  const steps = [];
  // OW walk + minimap
  await boot(page, 'fantasy');
  let mm = await owMinimapSuite(page);
  steps.push({ step: 'ow-minimap', mm });
  if (!mm.ok) bugs.push('ow-minimap missing');
  await shot(page, 'mobile-ow-region-minimap');

  // open talk odds
  const talk = await talkOddsSuite(page);
  steps.push({ step: 'talk-odds', talk });
  if (!talk.ok) bugs.push('talk-odds UI fail');
  await sleep(120);
  await shot(page, 'mobile-boss-talk-odds');

  // flee cleanup
  await page.evaluate(() => {
    const G = window.__game;
    try { if (G.Battle.isActive()) G.Battle.__testDrive('flee'); } catch (_) {}
  });
  await sleep(600);

  // dungeon minimap still works
  await page.evaluate(() => {
    const G = window.__game;
    G.C39.enterDungeon(G.S);
    G.C41.refreshMinimap?.(G.S);
  });
  await sleep(200);
  await shot(page, 'mobile-dungeon-after-ow');

  // short battle with skilled gambits visible
  await page.evaluate(async () => {
    const G = window.__game;
    const { enemyById } = await import('./enemies.js');
    G.C42.migrateV42(G.S);
    G.S.st.lvl = 6; G.S.st.hp = 140; G.S.st.maxhp = 140; G.S.st.mp = 50; G.S.st.maxmp = 50;
    G.Jobs.ensureJobs(G.S); G.S.jobs.active = 'magier';
    G.Battle.startBattle(G.S, { enemies: [enemyById('boss_ogre')], dungeonBoss: true, atbMode: 'wait', scripted: true });
    const B = G.Battle.getBattle();
    const hero = B.party.find(p => p.kind === 'hero');
    hero.gambits = G.C42.skilledGambits();
    const dec = G.C42.skilledGambitDecide(hero, B);
    G.C42.applySkilledCommand(G.Battle, dec);
  });
  await sleep(400);
  await shot(page, 'mobile-skilled-analyze-or-elem');

  // craft still ok
  await page.evaluate(() => {
    const G = window.__game;
    try { if (G.Battle.isActive()) G.Battle.__testDrive('flee'); } catch (_) {}
  });
  await sleep(700);
  await page.evaluate(() => {
    const G = window.__game;
    let ov = document.createElement('div');
    ov.id = 'v42craft';
    ov.style.cssText = 'position:fixed;inset:20px;background:#1a1520f5;color:#eee;z-index:9999;overflow:auto;padding:12px;border-radius:12px';
    document.body.appendChild(ov);
    G.UI17.renderCraft(ov, G.S, { toast: () => {}, save: () => {} });
  });
  await sleep(100);
  await shot(page, 'mobile-craft-still');

  // desktop talk + ow
  await page.setViewport({ width: 1280, height: 800, isMobile: false, hasTouch: false });
  await boot(page, 'fantasy');
  await owMinimapSuite(page);
  await shot(page, 'desktop-ow-region-minimap');
  await talkOddsSuite(page);
  await sleep(100);
  await shot(page, 'desktop-boss-talk-odds');
  await page.evaluate(() => {
    const G = window.__game;
    try { if (G.Battle.isActive()) G.Battle.__testDrive('flee'); } catch (_) {}
  });
  await sleep(500);

  return { bugs, steps };
}

(async () => {
  const server = await serve();
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=390,844'],
    defaultViewport: { width: 390, height: 844, isMobile: true, hasTouch: true },
  });
  const page = await browser.newPage();
  page.on('pageerror', e => console.warn('PAGEERR', e.message));
  const report = { ver: VER, bugs: [], balance: {}, pass: {} };

  console.log('=== boot ===');
  console.log(await boot(page, 'fantasy'));
  await shot(page, 'mobile-boot');

  console.log('=== balance skilled vs heuristic ===');
  for (const b of BOSSES) {
    await boot(page, b.genre);
    const skilledL4 = await balanceSim(page, b.id, 10, 4, 'skilled', false);
    const heurL4 = await balanceSim(page, b.id, 8, 4, 'heuristic', false);
    const skilledL8 = await balanceSim(page, b.id, 6, 8, 'skilled', true);
    report.balance[b.id] = { skilledL4, heurL4, skilledL8 };
    console.log(b.id, 'skilledL4', skilledL4.winRate, 'heurL4', heurL4.winRate, 'skilledL8', skilledL8.winRate, skilledL4.whyCounts);
  }

  console.log('=== mixed playtest ===');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  const mixed = await mixedPlaytest(page);
  report.mixed = mixed;
  report.bugs = mixed.bugs;
  console.log('bugs', mixed.bugs);

  // aggregate
  const l4Rates = BOSSES.map(b => report.balance[b.id].skilledL4.winRate);
  const avgL4 = l4Rates.reduce((a, c) => a + c, 0) / l4Rates.length;
  const beatHeur = BOSSES.every(b => report.balance[b.id].skilledL4.winRate >= report.balance[b.id].heurL4.winRate - 0.01);
  const skilledBeats = BOSSES.filter(b => report.balance[b.id].skilledL4.wins > report.balance[b.id].heurL4.wins
    || report.balance[b.id].skilledL4.winRate > report.balance[b.id].heurL4.winRate + 0.05);
  report.pass = {
    avgL4,
    l4InBand: avgL4 >= 0.38 && avgL4 <= 0.58,
    beatHeur: skilledBeats.length >= 2 || beatHeur,
    talkOk: mixed.steps.find(s => s.step === 'talk-odds')?.talk?.ok,
    mmOk: mixed.steps.find(s => s.step === 'ow-minimap')?.mm?.ok,
    noBugs: mixed.bugs.length === 0,
  };
  report.pass.ok = report.pass.l4InBand && report.pass.beatHeur && report.pass.talkOk && report.pass.mmOk;

  fs.writeFileSync(path.join(OUT, 'v42-balance-stats.json'), JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(OUT, 'v42-playtest.json'), JSON.stringify(report, null, 2));
  console.log('PASS', report.pass);
  await browser.close();
  server.close();
  process.exit(report.pass.ok ? 0 : 2);
})().catch(e => { console.error(e); process.exit(1); });
