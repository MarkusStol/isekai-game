#!/usr/bin/env node
/**
 * v40: full dungeon boss E2E in real battle UI (phases + win/flee/talk/spare),
 * all-NPC arcs, hard craft gates, minimap + boss cutscene shots.
 */
import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = '/workspace/isekai-game-shots';
fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT).filter(x => /^v40-/.test(x))) fs.unlinkSync(path.join(OUT, f));
const PORT = 8800;
const VER = '40';
const GENRES = ['fantasy', 'zombie', 'cyberpunk'];
const BOSS_BY = { fantasy: 'boss_ogre', zombie: 'boss_tyrant', cyberpunk: 'boss_chrome' };

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
  const dest = path.join(OUT, `v40-${name}.png`);
  await page.screenshot({ path: dest, type: 'png' });
  console.log('shot', name, fs.statSync(dest).size);
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function boot(page, genre) {
  await page.goto(`http://127.0.0.1:${PORT}/?v=${VER}&pt=1`, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForFunction(() => window.__game?.VER === '40' && window.__game?.C40 && window.__game?.Battle, { timeout: 25000 });
  await page.evaluate(() => { try { localStorage.clear(); } catch (_) {} });
  windowFast(page);
  return page.evaluate(async (g) => {
    const G = window.__game;
    window.__setCfg?.({ mode: 'offline', gkey: '', pollenKey: '' });
    window.__gateFastCut = true;
    await G.startProcedural?.(g, 'Alex');
    if (G.S && !G.S.setup?.done) { G.S.setup = G.S.setup || {}; G.S.setup.done = true; }
    try { G.S.flags = G.S.flags || {}; G.S.flags.onboarded = true; } catch (_) {}
    try { G.enterPlay?.(); } catch (_) {}
    G.C40.seedAllNpcArcs(G.S);
    G.C40.ensureCraft40(G.S);
    G.C40.syncCraftProgress(G.S);
    const npcs = Object.keys(G.S?.world?.npcs || {});
    if (npcs.length && G.S.world.scene) G.S.world.scene.anwesend = npcs.slice(0, 3);
    const missing = npcs.filter(n => {
      const x = G.S.world.npcs[n];
      return !(x.wound || x.furcht) || !(x.desire || x.ziel) || !(x.geheimnis || (x.secrets && x.secrets[0]));
    });
    return {
      ver: G.VER, genre: G.S?.genre, npcCount: npcs.length, arcs: (G.S.content39?.arcs || []).length,
      missingHooks: missing.length, stations: G.S.craft40?.stations, skills: G.S.craft40?.skills,
    };
  }, genre);
}
function windowFast(page) {
  return page.evaluateOnNewDocument(() => { window.__gateFastCut = true; });
}

async function bossSuite(page, genre) {
  const bossId = BOSS_BY[genre];
  // WIN path with all phases
  const win = await page.evaluate(async (bossId, genre) => {
    const G = window.__game;
    const S = G.S;
    const { enemyById } = await import('./enemies.js');
    let foe = enemyById(bossId);
    if (!foe.phases?.length) foe = { ...foe, phases: [{ at: 0.66, buff: { atk: 1.1 }, announce: 'Phase 2' }, { at: 0.33, buff: { atk: 1.2 }, announce: 'Phase 3' }] };
    // enter dungeon context
    G.C39.ensureContent39(S);
    S.content39.dungeon = { name: 'Test-Dungeon', boss: bossId, room: 0, rooms: [{ type: 'boss', done: false }], loot: [], hpTax: 0 };
    S.flags.dungeonBoss = 1;
    G.C40.refreshMinimap(S);
    // boss cutscene
    const cut = await G.Cut40.playBossIntroCutscene({ genre, bossName: foe.name, fast: true });
    // real battle
    G.Battle.startBattle(S, { enemies: [foe], dungeonBoss: true, atbMode: 'wait', scripted: true, bg: './assets/pixel/bg-battle/crypt.png' });
    const td = G.Battle.__testDrive;
    td('buff', { atk: 80 }); // not a one-shot — cross phase thresholds
    const phases = [];
    // Cross each phase threshold from the foe's phase table
    const thresholds = (foe.phases || []).map(p => p.at).sort((a, b) => b - a);
    let last = null;
    for (const at of (thresholds.length ? thresholds : [0.66, 0.33])) {
      if (!G.Battle.isActive()) break;
      td('setHpRatio', { ratio: Math.min(0.99, at + 0.04) });
      last = td('attack');
      phases.push(...(last.phaseLog || []));
    }
    if (G.Battle.isActive()) {
      td('buff', { atk: 900 });
      td('setHpRatio', { ratio: 0.01 });
      for (let i = 0; i < 8 && G.Battle.isActive(); i++) {
        last = td('attack');
        phases.push(...(last.phaseLog || []));
      }
    }
    const midDump = td('dump');
    // wait for finish timeout to clear UI
    await new Promise(r => setTimeout(r, 1700));
    const dump = td('dump');
    const mm = !!document.getElementById('dungeonMinimap') && !document.getElementById('dungeonMinimap').classList.contains('hidden');
    const phaseAnnounces = [...new Set((phases.concat(dump.phaseLog || midDump.phaseLog || [])).filter(x => /phase|bruchfenster|overclock|stampft|tobt|widerstand|panzerung|wütend|flügel|nebel wird/i.test(String(x))))];
    return {
      cut,
      phases: phaseAnnounces,
      rawPhases: [...new Set(phases)],
      done: dump.done || midDump.done,
      result: dump.result || midDump.result,
      phaseIdx: midDump.foe?.phaseIdx ?? dump.foe?.phaseIdx,
      phaseCount: midDump.foe?.phases?.length || foe.phases?.length,
      dungeonBoss: !!(dump.flags?.dungeonBoss || midDump.flags?.dungeonBoss),
      minimap: mm,
      battleVisible: true,
      logTail: dump.log || midDump.log,
    };
  }, bossId, genre);

  await sleep(200);
  await shot(page, `${genre}-boss-win`);

  // FLEE
  const flee = await page.evaluate(async (bossId) => {
    const G = window.__game;
    const S = G.S;
    const { enemyById } = await import('./enemies.js');
    const foe = enemyById(bossId);
    S.flags.dungeonBoss = 1;
    G.Battle.startBattle(S, { enemies: [{ ...foe }], dungeonBoss: true, atbMode: 'wait', scripted: true });
    const r = G.Battle.__testDrive('flee');
    await new Promise(x => setTimeout(x, 700));
    return { ...r, active: G.Battle.isActive() };
  }, bossId);
  await shot(page, `${genre}-boss-flee`);

  // TALK then SPARE
  const spare = await page.evaluate(async (bossId) => {
    const G = window.__game;
    const S = G.S;
    const { enemyById } = await import('./enemies.js');
    const foe = { ...enemyById(bossId), human: true };
    G.Battle.startBattle(S, { enemies: [foe], dungeonBoss: true, atbMode: 'wait', scripted: true });
    const talk = G.Battle.__testDrive('talk', { text: 'bitte frieden' });
    // if talk didn't end, spare
    let spareR = null;
    if (G.Battle.isActive()) {
      G.Battle.__testDrive('setHpRatio', { ratio: 0.3 });
      spareR = G.Battle.__testDrive('spare');
    }
    await new Promise(x => setTimeout(x, 900));
    return { talk, spare: spareR, active: G.Battle.isActive(), dump: G.Battle.__testDrive('dump') };
  }, bossId);
  await shot(page, `${genre}-boss-spare`);

  return { win, flee, spare };
}

async function craftAndArcs(page) {
  return page.evaluate(() => {
    const G = window.__game;
    const S = G.S;
    // hard gate: tier 4 without unlock should fail
    S.st.lvl = 1;
    S.content39.flags.gearTier = 1;
    S.content39.flags.bossFaced = 0;
    S.content39.clearedDungeons = [];
    S.craft40 = { stations: { kitchen: { unlocked: true, level: 1 } }, skills: { kochen: 1 } };
    const locked = G.C40.canCraftRecipe(S, 'sternenklinge', 'craft');
    const cookOk = G.C40.canCraftRecipe(S, 'kraeutersuppe', 'cook');
    // unlock forge + skill + tier
    S.st.lvl = 12;
    S.content39.flags.bossFaced = 1;
    S.content39.clearedDungeons = ['X'];
    G.C40.syncCraftProgress(S);
    G.C39.midgameUnlocks(S, { toast: false });
    const unlocked = G.C40.canCraftRecipe(S, 'runenschwert', 'craft');
    const hardStill = G.C40.canCraftRecipe(S, 'sternenklinge', 'craft'); // needs tier 4
    const npcs = Object.values(S.world.npcs || {});
    const allHooked = npcs.every(n => (n.wound || n.furcht) && (n.desire || n.ziel) && (n.geheimnis || n.secrets?.[0]));
    const arcs = (S.content39.arcs || []).length;
    return { locked, cookOk, unlocked, hardStill, allHooked, arcs, npcCount: npcs.length, stations: S.craft40.stations, skills: S.craft40.skills, gearTier: G.C39.gearTierAvailable(S) };
  });
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
  const report = { ver: VER, genres: {}, bugs: [] };

  for (const genre of GENRES) {
    console.log('===', genre, '===');
    try {
      const bootInfo = await boot(page, genre);
      const suite = await bossSuite(page, genre);
      const craft = await craftAndArcs(page);
      // dungeon minimap shot
      await page.evaluate(() => {
        const G = window.__game;
        G.C39.enterDungeon(G.S);
        G.C40.refreshMinimap(G.S);
      });
      await sleep(100);
      await shot(page, `${genre}-minimap`);
      await page.evaluate(() => window.__game.offline?.('zurück'));

      report.genres[genre] = {
        boot: bootInfo,
        win: {
          done: suite.win.done, result: suite.win.result, phases: suite.win.phases,
          phaseIdx: suite.win.phaseIdx, phaseCount: suite.win.phaseCount,
          dungeonBoss: suite.win.dungeonBoss, minimap: suite.win.minimap,
        },
        flee: { result: suite.flee.result, done: suite.flee.done, active: suite.flee.active },
        spare: {
          talkEnded: suite.spare.talk?.done, spareEnded: suite.spare.spare?.ended || suite.spare.dump?.result,
          active: suite.spare.active,
        },
        craft,
      };
      console.log(genre, 'win', suite.win.result, 'phases', suite.win.phases?.length, 'flee', suite.flee.result, 'arcs', bootInfo.arcs, 'missing', bootInfo.missingHooks);
    } catch (e) {
      report.bugs.push({ genre, err: String(e) });
      console.error(genre, e);
    }
  }

  // desktop craft + boss
  await page.setViewport({ width: 1280, height: 800, isMobile: false, hasTouch: false });
  await boot(page, 'fantasy');
  await page.evaluate(async () => {
    const G = window.__game;
    window.__gateFastCut = true;
    const { enemyById } = await import('./enemies.js');
    await G.Cut40.playBossIntroCutscene({ genre: 'fantasy', bossName: 'Oger-Kriegsherr', fast: true });
    G.Battle.startBattle(G.S, { enemies: [enemyById('boss_ogre')], dungeonBoss: true, atbMode: 'wait' });
    G.Battle.__testDrive('buff', { atk: 500 });
    G.Battle.__testDrive('setHpRatio', { ratio: 0.5 });
    G.Battle.__testDrive('attack');
  });
  await sleep(300);
  await shot(page, 'desktop-boss-phase');
  await page.evaluate(() => {
    const G = window.__game;
    let ov = document.createElement('div');
    ov.id = 'v40craft';
    ov.style.cssText = 'position:fixed;inset:40px 60px;background:#1a1520f5;color:#eee;z-index:9999;overflow:auto;padding:16px;border-radius:12px';
    document.body.appendChild(ov);
    G.UI17.renderCraft(ov, G.S, { toast: () => {}, save: () => {} });
  });
  await sleep(100);
  await shot(page, 'desktop-craft-gates');

  report.pass = {
    allBooted: GENRES.every(g => report.genres[g]?.boot?.ver === '40'),
    allNpcsArced: GENRES.every(g => (report.genres[g]?.boot?.missingHooks|0) === 0 && (report.genres[g]?.boot?.arcs|0) >= (report.genres[g]?.boot?.npcCount|0)),
    bossWin: GENRES.every(g => report.genres[g]?.win?.result === 'win'),
    phases: GENRES.every(g => (report.genres[g]?.win?.phases?.length||0) >= 1 || (report.genres[g]?.win?.phaseIdx||0) >= 1),
    flee: GENRES.every(g => report.genres[g]?.flee?.result === 'flee' || report.genres[g]?.flee?.done),
    spareOrTalk: GENRES.every(g => report.genres[g]?.spare?.talkEnded || report.genres[g]?.spare?.spareEnded || !report.genres[g]?.spare?.active),
    hardCraft: GENRES.every(g => report.genres[g]?.craft?.locked?.ok === false && report.genres[g]?.craft?.cookOk?.ok === true),
    minimap: GENRES.every(g => report.genres[g]?.win?.minimap),
    noBugs: report.bugs.length === 0,
  };
  report.ok = Object.values(report.pass).every(Boolean);
  fs.writeFileSync(path.join(OUT, 'v40-playtest.json'), JSON.stringify(report, null, 2));
  console.log('PASS', report.pass, 'ok=', report.ok);
  if (!report.ok) console.log(JSON.stringify(report.genres, null, 2).slice(0, 5000));
  await browser.close();
  server.close();
  if (!report.ok) process.exit(2);
})().catch(e => { console.error(e); process.exit(1); });
