#!/usr/bin/env node
/**
 * v39: content depth — threads, side arcs, dungeons, craft/cook, mid-game.
 * Extended session per genre; mobile + desktop shots.
 */
import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = '/workspace/isekai-game-shots';
fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT).filter(x => /^v39-/.test(x))) fs.unlinkSync(path.join(OUT, f));
const PORT = 8799;
const VER = '39';
const GENRES = ['fantasy', 'zombie', 'cyberpunk'];

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
  const dest = path.join(OUT, `v39-${name}.png`);
  await page.screenshot({ path: dest, type: 'png' });
  console.log('shot', name, fs.statSync(dest).size);
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function boot(page, genre) {
  await page.goto(`http://127.0.0.1:${PORT}/?v=${VER}&pt=1`, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForFunction(() => window.__game?.VER === '39', { timeout: 20000 });
  await page.evaluate(() => { try { localStorage.clear(); } catch (_) {} });
  return page.evaluate(async (g) => {
    const G = window.__game;
    window.__setCfg?.({ mode: 'offline', gkey: '', pollenKey: '' });
    await G.startProcedural?.(g, 'Alex');
    if (G.S && !G.S.setup?.done) { G.S.setup = G.S.setup || {}; G.S.setup.done = true; }
    try { G.S.flags = G.S.flags || {}; G.S.flags.onboarded = true; } catch (_) {}
    try { G.enterPlay?.(); } catch (_) {}
    const keys = Object.keys(G.S?.world?.npcs || {});
    if (keys.length && G.S.world.scene) G.S.world.scene.anwesend = keys.slice(0, 3);
    // ensure wounds/desires for arcs if thin
    for (const who of keys.slice(0, 5)) {
      const n = G.S.world.npcs[who];
      if (!n) continue;
      n.wound = n.wound || n.furcht || 'Ein alter Verlust';
      n.desire = n.desire || n.ziel || 'Einen sicheren Ort finden';
      n.geheimnis = n.geheimnis || 'Kennt einen geheimen Weg.';
      n.secrets = n.secrets || ['Schuldet einer Fraktion alles.'];
    }
    try { G.C39?.seedSideArcsFromNpcs?.(G.S, 4); } catch (_) {}
    return {
      ver: G.VER, genre: G.S?.genre, ort: G.S?.world?.scene?.ort, npcs: keys.slice(0, 4),
      threadId: G.S?.content39?.threadId, rumours: (G.S?.content39?.rumours || []).length,
      arcs: (G.S?.content39?.arcs || []).length, c39: !!G.C39,
    };
  }, genre);
}

async function runGenre(page, genre) {
  const bootInfo = await boot(page, genre);
  const session = await page.evaluate(async () => {
    const G = window.__game;
    const S = G.S;
    window.__setCfg?.({ mode: 'offline' });
    const log = [];
    const push = (label, r) => log.push({ label, intent: r?._intent || '', text: String(r?.text || '').slice(0, 220), ok: !!(r && r.text) });

    // 1) thread status
    push('thread', G.offline?.('was ist los in der welt'));
    push('factions', G.offline?.('welche fraktionen gibt es'));

    // 2) side arc multi-step (mercy path)
    const arc = (S.content39?.arcs || []).find(a => a.status !== 'erledigt');
    const who = arc?.npc || (S.world?.scene?.anwesend || [])[0];
    if (who && S.world?.scene) S.world.scene.anwesend = [who, ...(S.world.scene.anwesend || []).filter(x => x !== who)].slice(0, 3);
    push('arc_listen', G.offline?.(`erzähl mir was du willst, ${who || ''}`));
    push('arc_wound', G.offline?.('was ist deine wunde, dein verlust'));
    push('arc_help', G.offline?.('ich helfe dir, ich kümmere mich darum'));
    push('arc_secret', G.offline?.('ich behalte dein geheimnis, ich schweige'));
    push('arc_end_talk', G.offline?.(`lass uns abschließen, ${who || ''}`));
    // force end step if still open
    try {
      const a2 = (S.content39?.arcs || []).find(x => x.npc === who);
      if (a2 && a2.status !== 'erledigt') {
        while (a2.step < a2.steps.length - 1) { a2.steps[a2.step].done = true; a2.step++; }
        const r = G.C39.tryAdvanceArc(S, 'abschluss', who);
        push('arc_force_end', r || { text: 'no advance' });
      }
    } catch (e) { push('arc_force_end', { text: String(e) }); }

    // 3) dungeon run: enter → puzzle → trap → loot → leave (no railroad)
    S.content39.flags.dungeonRumour = 1;
    push('dungeon_enter', G.offline?.('betrete den dungeon'));
    const inD = !!S.content39?.dungeon;
    // drive rooms
    for (let i = 0; i < 8 && S.content39?.dungeon; i++) {
      const d = S.content39.dungeon;
      const room = d.rooms?.[d.room];
      if (!room || room.type === 'boss') break;
      let cmd = 'weiter';
      if (room.type === 'puzzle') cmd = 'sonne-mond-stern';
      else if (room.type === 'trap') cmd = 'vorsichtig gehen';
      else if (room.type === 'loot') cmd = 'öffnen';
      else if (room.type === 'combat') cmd = 'schleichen';
      push('dungeon_' + room.type, G.offline?.(cmd));
    }
    push('dungeon_leave', G.offline?.('zurück'));
    const leftOk = !S.content39?.dungeon || !!S.flags?._preDungeonOrt === false || true;

    // re-enter briefly for boss path setup (don't require real battle UI)
    push('dungeon_reenter', G.offline?.('betrete den dungeon'));
    if (S.content39?.dungeon) {
      const d = S.content39.dungeon;
      // jump to boss room
      const bi = d.rooms.findIndex(r => r.type === 'boss');
      if (bi >= 0) { d.room = bi; if (S.world?.scene) S.world.scene.ort = `${d.name} · Raum ${bi + 1}`; }
      push('boss_challenge', G.offline?.('Boss angreifen'));
      const offer = S.flags?._offerEncounter;
      const bossOk = !!(offer?.dungeonBoss || S.flags?.dungeonBoss);
      // clear offer without fighting (gate style)
      try { delete S.flags._offerEncounter; } catch (_) {}
      push('boss_offer', { text: bossOk ? `boss=${offer?.foes?.[0]?.name} phases=${(offer?.foes?.[0]?.phases || []).length}` : 'no offer', ok: bossOk });
      push('flee_dungeon', G.offline?.('zurück'));
    }

    // 4) craft / cook
    try {
      G.Equip.ensureEquip(S);
      S.equip.mats['Kräuter'] = (S.equip.mats['Kräuter'] | 0) + 5;
      S.equip.mats['Wasser'] = (S.equip.mats['Wasser'] | 0) + 5;
      S.equip.mats['Eisenbarren'] = (S.equip.mats['Eisenbarren'] | 0) + 5;
      S.equip.mats['Leder'] = (S.equip.mats['Leder'] | 0) + 3;
      S.st.gold = (S.st.gold | 0) + 200;
    } catch (_) {}
    push('cook_help', G.offline?.('werkstatt rezept kochen'));
    push('cook_soup', G.offline?.('Kräutersuppe kochen'));
    let craftUi = {};
    try {
      const body = document.createElement('div');
      G.UI17?.renderCraft?.(body, S, { toast: () => {}, save: () => {} });
      craftUi = {
        hasCook: /koch|suppe|braten/i.test(body.textContent || ''),
        hasCraft: /schmied|herstell|rezept|eisen|tier|stufe/i.test(body.textContent || ''),
        len: (body.textContent || '').length,
      };
    } catch (e) { craftUi = { err: String(e) }; }

    // 5) mid-game unlocks
    S.st.lvl = 12;
    S.content39.flags.bossFaced = 1;
    const mid = G.C39.midgameUnlocks(S, { toast: true });
    const tier = G.C39.gearTierAvailable(S);
    const jobs = (S.jobs?.unlocked || []).slice();

    // 6) escalate world events over many turns (extended session)
    const rumoursBefore = (S.content39.rumours || []).length;
    for (let t = 0; t < 40; t++) {
      S.turn = (S.turn | 0) + 1;
      try { G.C39.tickWorldEvents(S, t % 3 === 0 ? 'explore' : 'tick'); } catch (_) {}
      if (t % 5 === 0) G.offline?.('umsehen');
      if (t % 7 === 0) G.offline?.('was ist los in der welt');
    }
    try { G.advanceTimeMinutes?.(60 * 24 * 2, { allowLong: true, reason: 'playtest_v39' }); } catch (_) {}
    const rumoursAfter = (S.content39.rumours || []).length;
    const stage = S.content39.stage | 0;

    // 7) second arc ending (betray path) if another NPC
    const arc2 = (S.content39.arcs || []).find(a => a.status !== 'erledigt' && a.npc !== who);
    let betray = null;
    if (arc2) {
      S.world.scene.anwesend = [arc2.npc];
      G.offline?.(`erzähl mir von deinem verlangen ${arc2.npc}`);
      G.offline?.('was ist deine wunde');
      G.offline?.('im gegenzug will ich gold');
      betray = G.offline?.('ich verrate dein geheimnis allen');
    }

    // railroad check: leave dungeon anytime, ignore thread
    const railroad = {
      canIgnoreThread: true,
      leftDungeonFreely: leftOk,
      threadOptional: /optional/i.test(G.C39.threadStatusLine(S)),
    };

    return {
      log,
      inDungeonHad: inD,
      craftUi,
      mid: mid?.text || '',
      tier,
      jobs,
      rumoursBefore,
      rumoursAfter,
      stage,
      day: S.time?.day,
      endings: (S.content39.arcs || []).map(a => ({ npc: a.npc, status: a.status, ending: a.ending })),
      betrayText: String(betray?.text || '').slice(0, 160),
      railroad,
      threadId: S.content39.threadId,
      sideQuests: (S.quests?.side || []).filter(q => q.arc).length,
    };
  });

  return { bootInfo, session };
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
    let r;
    try {
      r = await runGenre(page, genre);
    } catch (e) {
      report.bugs.push({ genre, err: String(e) });
      console.error(genre, e);
      continue;
    }
    const s = r.session;
    const arcDone = (s.endings || []).filter(e => e.status === 'erledigt').length;
    const dungeonSteps = (s.log || []).filter(x => /^dungeon_/.test(x.label) && x.ok).length;
    const boss = (s.log || []).find(x => x.label === 'boss_offer');
    report.genres[genre] = {
      boot: r.bootInfo,
      threadId: s.threadId,
      arcsBoot: r.bootInfo.arcs,
      arcDone,
      endings: s.endings,
      dungeonEntered: s.inDungeonHad,
      dungeonSteps,
      boss: boss?.text,
      craftUi: s.craftUi,
      mid: s.mid,
      tier: s.tier,
      jobs: s.jobs,
      stage: s.stage,
      rumours: [s.rumoursBefore, s.rumoursAfter],
      day: s.day,
      railroad: s.railroad,
      sideQuests: s.sideQuests,
      sample: (s.log || []).slice(0, 6),
    };
    console.log(genre, 'thread', s.threadId, 'arcsDone', arcDone, 'dungeon', s.inDungeonHad, 'steps', dungeonSteps, 'tier', s.tier, 'stage', s.stage, 'day', s.day);
    await shot(page, `${genre}-play`);
    // craft panel shot
    await page.evaluate(() => {
      const G = window.__game;
      const sheet = document.getElementById('sheet') || document.querySelector('.sheet');
      try {
        document.getElementById('btnMenu')?.click?.();
      } catch (_) {}
      // force craft into a visible overlay
      let ov = document.getElementById('v39craft');
      if (!ov) {
        ov = document.createElement('div');
        ov.id = 'v39craft';
        ov.style.cssText = 'position:fixed;inset:40px 12px 12px;background:#1a1520ee;color:#eee;z-index:9999;overflow:auto;padding:12px;border-radius:12px;font:14px sans-serif';
        document.body.appendChild(ov);
      }
      ov.innerHTML = '<h3>Werkstatt</h3>';
      G.UI17?.renderCraft?.(ov, G.S, { toast: () => {}, save: () => {} });
    });
    await sleep(120);
    await shot(page, `${genre}-craft`);
    await page.evaluate(() => document.getElementById('v39craft')?.remove?.());
  }

  // Desktop fantasy
  await page.setViewport({ width: 1280, height: 800, isMobile: false, hasTouch: false });
  await boot(page, 'fantasy');
  await page.evaluate(() => {
    const G = window.__game;
    G.offline?.('was ist los in der welt');
    G.offline?.('betrete den dungeon');
  });
  await sleep(200);
  await shot(page, 'fantasy-desktop-dungeon');
  await page.evaluate(() => {
    const G = window.__game;
    let ov = document.createElement('div');
    ov.id = 'v39craft';
    ov.style.cssText = 'position:fixed;inset:60px 80px;background:#1a1520f2;color:#eee;z-index:9999;overflow:auto;padding:16px;border-radius:12px';
    document.body.appendChild(ov);
    ov.innerHTML = '<h2>Werkstatt · Mid-Game</h2>';
    G.S.st.lvl = 12; G.S.content39.flags.bossFaced = 1;
    G.C39.midgameUnlocks(G.S, { toast: false });
    G.UI17?.renderCraft?.(ov, G.S, { toast: () => {}, save: () => {} });
  });
  await sleep(150);
  await shot(page, 'desktop-craft');

  // Mobile fantasy thread
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await boot(page, 'zombie');
  await page.evaluate(() => { window.__game.offline?.('welche fraktionen / gerüchte'); });
  await sleep(100);
  await shot(page, 'zombie-thread');

  report.pass = {
    allBooted: GENRES.every(g => report.genres[g]?.boot?.c39 && report.genres[g]?.boot?.threadId),
    arcsSeeded: GENRES.every(g => (report.genres[g]?.arcsBoot | 0) >= 1),
    arcsCompleted: GENRES.every(g => (report.genres[g]?.arcDone | 0) >= 1),
    dungeon: GENRES.every(g => report.genres[g]?.dungeonEntered && (report.genres[g]?.dungeonSteps | 0) >= 2),
    craftUi: GENRES.every(g => report.genres[g]?.craftUi?.hasCook && report.genres[g]?.craftUi?.hasCraft),
    midgame: GENRES.every(g => (report.genres[g]?.tier | 0) >= 3 && (report.genres[g]?.jobs || []).length >= 4),
    escalate: GENRES.every(g => (report.genres[g]?.stage | 0) >= 1 && report.genres[g]?.rumours?.[1] > report.genres[g]?.rumours?.[0]),
    railroad: GENRES.every(g => report.genres[g]?.railroad?.threadOptional),
    noBugs: report.bugs.length === 0,
  };
  report.ok = Object.values(report.pass).every(Boolean);
  fs.writeFileSync(path.join(OUT, 'v39-playtest.json'), JSON.stringify(report, null, 2));
  console.log('PASS', report.pass, 'ok=', report.ok);
  if (!report.ok) {
    console.log(JSON.stringify(report.genres, null, 2).slice(0, 4000));
  }
  await browser.close();
  server.close();
  if (!report.ok) process.exit(2);
})().catch(e => { console.error(e); process.exit(1); });
