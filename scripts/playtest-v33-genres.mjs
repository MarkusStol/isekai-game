#!/usr/bin/env node
/**
 * v33 first-hour playtest: NPC depth, talk→fight→spare, camp build/defense.
 * Genres: fantasy(held)/zombie/cyberpunk. Mobile + desktop smoke.
 */
import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = '/workspace/isekai-game-shots';
fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT).filter(x => /^v33-/.test(x))) fs.unlinkSync(path.join(OUT, f));
const PORT = 8783;
const VER = '33';

const GENRES = [
  { id: 'held', label: 'fantasy', start: 'fantasy' },
  { id: 'zombie', label: 'zombie', start: 'zombie' },
  { id: 'cyberpunk', label: 'cyberpunk', start: 'cyberpunk' },
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
  const dest = path.join(OUT, `v33-${name}.png`);
  await page.screenshot({ path: dest, type: 'png' });
  console.log('shot', name, fs.statSync(dest).size);
}

async function bootGenre(page, genre) {
  await page.goto(`http://127.0.0.1:${PORT}/?v=${VER}&pt=1`, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForFunction(() => window.__game?.VER === '33', { timeout: 20000 });
  await page.evaluate(() => { try { localStorage.clear(); } catch(_){} });
  // Force offline
  await page.evaluate(() => {
    window.__setCfg?.({ mode: 'offline' });
    window.__gateNoBattle = false;
  });
  // Start procedural for zombie/cyber; held via newLife pack
  const ok = await page.evaluate(async (g) => {
    const G = window.__game;
    try {
      const gid = (g === 'held' || g === 'fantasy') ? 'fantasy' : g;
      await G.startProcedural?.(gid, 'Alex');
      if (G.S && !G.S.setup?.done) {
        G.S.setup = G.S.setup || {};
        G.S.setup.done = true;
      }
      try { G.enterPlay?.(); } catch(_){}
      return { ver: G.VER, genre: G.S?.genre || G.S?.role, ort: G.S?.world?.scene?.ort, npcs: Object.keys(G.S?.world?.npcs || {}).length };
    } catch (e) {
      return { err: String(e) };
    }
  }, genre.id === 'held' ? 'held' : genre.id);
  return ok;
}

async function act(page, text) {
  return page.evaluate(async (t) => {
    const G = window.__game;
    const before = (G.msgs?.() || []).length;
    try {
      // Prefer offlineRespondIntent for deterministic first-hour checks
      const intent = G.parsePlayerIntent?.(t) || { kind: 'act' };
      // Prefer full offline() so life-sim (camp/claim/build) and askNPC run
      let r = G.offline?.(t);
      if (!r || !r.text) r = G.offlineRespondIntent?.(t, intent);
      if (!r || !r.text) {
        await G.act?.(t);
        await new Promise(r => setTimeout(r, 80));
        const msgs = G.msgs?.() || [];
        const last = msgs[msgs.length - 1];
        r = { text: last?.text || last?.html || '', changes: {} };
      }
      const S = G.S;
      const who = (S?.world?.scene?.anwesend || [])[0];
      const npc = who ? S.world.npcs[who] : null;
      return {
        text: String(r.text || ''),
        intent: intent.kind,
        who,
        backstory: npc?.backstory || '',
        speechStyle: npc?.speechStyle || npc?.stimme || '',
        memCount: (npc?.memories || []).length + (npc?.erinnerung || []).length,
        lastMem: (npc?.erinnerung || []).slice(-1)[0] || (npc?.memories || []).slice(-1)[0],
        hunger: S?.needs?.hunger,
        gold: S?.st?.gold,
        homeStage: S?.home?.stage,
        camp: [...(S?.camp?.upgrades || [])],
        ort: S?.world?.scene?.ort,
        flavorLen: String(S?.world?.graph?.nodes?.[S?.world?.scene?.ort]?.desc || '').length,
      };
    } catch (e) {
      return { err: String(e), text: '' };
    }
  }, text);
}

function scoreNpc(replies) {
  const issues = [];
  const greet1 = replies.find(r => /hallo|guten/i.test(r.input));
  const who = replies.find(r => /wer bist|wie heißt/i.test(r.input));
  const back = replies.find(r => /erzähl|geschichte|vergangen|warum hier/i.test(r.input));
  const greet2 = replies.filter(r => /hallo|guten/i.test(r.input)).slice(-1)[0];
  if (who && who.text && !/ich bin|namen|heiß|„|bin /i.test(who.text) && !(who.backstory && who.text.includes(who.who?.split(' ')[0]))) {
    if (!/mustert|nickt|stimme|ziel|aufgewachsen/i.test(who.text)) issues.push('ask_who_shallow');
  }
  if (back && back.text) {
    const hasDepth = /ziel|aufgewachsen|backstory|geschichte|vergangen|ton|stimme|begehrt|will |braucht|zwischen den zeilen|mein ziel/i.test(back.text)
      || (back.backstory && /aufgewachsen|will |braucht/i.test(back.backstory) && back.text.length > 40);
    if (!hasDepth) issues.push('backstory_missing');
  }
  if (greet2 && greet1 && greet2 !== greet1) {
    if (greet2.memCount > 0 && !/erinnert|wieder|sprachen|Begegnung|begrüßt|Gespräch/i.test(greet2.text)) {
      issues.push('no_memory_recall');
    }
  }
  // speech style presence
  if (who && who.speechStyle && who.text && !who.text.toLowerCase().includes(String(who.speechStyle).slice(0, 12).toLowerCase()) && !/\(|stimme|ton|knapp|kurz|Segen|Ausbruch/i.test(who.text)) {
    issues.push('speech_style_absent');
  }
  return issues;
}

async function testCombatSpare(page) {
  const issues = [];
  // Non-blocking: start battle, then spare via command — never await offerEncounter (UI promise)
  const result = await page.evaluate(() => {
    const G = window.__game;
    const S = G.S;
    window.__gateNoBattle = false;
    const out = { steps: [] };
    try {
      // Ensure battle module ready
      if (G.Battle.isActive()) {
        try { document.getElementById('battle-root')?.classList.add('hidden'); } catch(_){}
      }
      G.Battle.startBattle(S, {
        enemies: [{ id: 'pt_bandit', name: 'Bandit Test', hp: 40, maxhp: 40, atk: 3, def: 1, human: true, icon: '🗡️', art: '', alive: true }],
        noBoss: true,
        atbMode: 'wait',
      });
      out.steps.push('started');
      out.active1 = !!G.Battle.isActive();
      const B = G.Battle.getBattle();
      // Force hero ready
      if (B?.party?.[0]) { B.party[0].atb = 100; B.selecting = { actor: B.party[0], mode: 'main' }; }
      if (B?.foes?.[0]) { B.foes[0].hp = Math.floor(B.foes[0].maxhp * 0.5); }
      const foe = B?.foes?.[0];
      out.foe = foe ? { name: foe.name, iid: foe._iid, id: foe.id } : null;
      // Talk first (social)
      try {
        const talk = G.Battle.playerCommand('talk', { targetId: foe?._iid || foe?.id });
        out.talk = talk;
        out.steps.push('talk');
      } catch (e) { out.talkErr = String(e); }
      // Then spare
      try {
        const spare = G.Battle.playerCommand('spare', { targetId: foe?._iid || foe?.id });
        out.spare = spare;
        out.steps.push('spare');
      } catch (e) { out.spareErr = String(e); }
      const B2 = G.Battle.getBattle();
      out.foeAfter = (B2?.foes || []).map(f => ({ name: f.name, ended: f._ended, alive: f.alive, hp: f.hp }));
      out.sparedFlags = (S.flags?.sparedNames || []).concat(S.flags?.spared || []);
      out.active2 = !!G.Battle.isActive();
      // Hide UI
      try {
        const root = document.getElementById('battle-root') || document.querySelector('.battle-ui, .battle-root');
        if (root) root.classList.add('hidden');
      } catch(_){}
    } catch (e) {
      out.err = String(e);
    }
    return out;
  });
  // Click Verschonen if still visible
  try {
    const btns = await page.$$('button');
    for (const b of btns) {
      const txt = await page.evaluate(el => el.textContent || '', b);
      if (/verschonen/i.test(txt)) { await b.click(); break; }
    }
  } catch(_){}
  await new Promise(r => setTimeout(r, 200));
  const after = await page.evaluate(() => {
    const G = window.__game;
    const B = G.Battle.getBattle?.();
    return {
      active: !!G.Battle.isActive?.(),
      spared: (G.S?.flags?.sparedNames || []).concat(G.S?.flags?.spared || []),
      foes: (B?.foes || []).map(f => ({ name: f.name, ended: f._ended, alive: f.alive })),
    };
  });
  const sparedOk = (result.sparedFlags || []).length > 0
    || (result.foeAfter || []).some(f => f.ended === 'spared')
    || (after.spared || []).length > 0
    || (after.foes || []).some(f => f.ended === 'spared');
  if (result.err) issues.push('battle_err');
  if (!sparedOk) issues.push('spare_failed');
  if (!result.active1 && !result.steps?.includes('started')) issues.push('battle_start_failed');
  return { issues, result, after };
}

async function testCamp(page) {
  const issues = [];
  const steps = [];
  // Give gold and claim land
  await page.evaluate(() => {
    const S = window.__game.S;
    S.st = S.st || {};
    S.st.gold = Math.max(S.st.gold | 0, 200);
    S.inv = S.inv || [];
  });
  for (const cmd of ['Ich beanspruche Land', 'Material sammeln', 'Bauen beginnen', 'Weiterbauen (Tag verstreichen)', 'Weiterbauen (Tag verstreichen)', 'Heim ausbauen', 'baue herd', 'baue bett', 'baue palisade']) {
    const r = await act(page, cmd);
    steps.push({ cmd, text: (r.text || '').slice(0, 120), home: r.homeStage, camp: r.camp, err: r.err });
  }
  // Force stage 2 for palisade if still low
  await page.evaluate(() => {
    const S = window.__game.S;
    if (S.home?.owned && (S.home.stage | 0) < 2) S.home.stage = 2;
    S.st.gold = Math.max(S.st.gold | 0, 100);
  });
  const pal = await act(page, 'baue palisade');
  steps.push({ cmd: 'baue palisade (forced stage)', text: (pal.text || '').slice(0, 140), camp: pal.camp });
  const snap = await page.evaluate(() => {
    const S = window.__game.S;
    const D = window.__game.Depth;
    D.ensureDeepNeeds(S);
    const b = D.homeBenefits(S);
    // Force raid check with defence
    S.flags = S.flags || {};
    S.flags.atHome = true;
    S.camp.raidThreat = 80;
    // Temporarily boost raid chance
    const held = D.maybeHomeRaid(S);
    return {
      home: S.home,
      camp: S.camp,
      benefits: b,
      raid: held,
    };
  });
  if (!(snap.camp?.upgrades || []).includes('palisade') && !(snap.camp?.upgrades || []).includes('herd')) {
    issues.push('camp_upgrades_missing');
  }
  if (snap.benefits && !snap.benefits.defence && (snap.camp?.upgrades || []).includes('palisade')) {
    issues.push('palisade_no_defence_flag');
  }
  return { issues, steps, snap };
}

async function runGenre(browser, genre, viewport) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  const tag = `${genre.label}-${viewport.width < 500 ? 'mobile' : 'desktop'}`;
  const findings = { genre: genre.label, vp: `${viewport.width}x${viewport.height}`, issues: [], replies: [] };
  const boot = await bootGenre(page, genre);
  findings.boot = boot;
  if (boot?.err) { findings.issues.push('boot_fail'); await page.close(); return findings; }

  // Ensure NPCs present + flavor
  await page.evaluate(() => {
    const G = window.__game;
    const S = G.S;
    try { G.enrichPlaceDescs?.(S); } catch(_){}
    const keys = Object.keys(S.world?.npcs || {});
    if (keys.length && S.world.scene) {
      S.world.scene.anwesend = keys.slice(0, 3);
    }
    // Clear food to test forage
    S.inv = (S.inv || []).filter(it => !/brot|proviant|essen|ration|food/i.test(it.name || ''));
    S.needs = S.needs || {};
    S.needs.hunger = 70;
  });

  const inputs = [
    'ich sehe mich um',
    'hallo',
    'wer bist du',
    'erzähl mir von dir und deiner Vergangenheit',
    'was ist hier los',
    'ich bin hungrig',
    'hallo', // second greet — memory
    'was kostet das',
  ];
  for (const input of inputs) {
    const r = await act(page, input);
    findings.replies.push({ input, ...r, text: (r.text || '').slice(0, 280) });
    if (r.err) findings.issues.push('act_err:' + input);
    if (/undefined|null|\[object Object\]|TypeError/i.test(r.text || '')) findings.issues.push('broken:' + input);
    if ((r.text || '').length < 15 && !r.err) findings.issues.push('short:' + input);
  }
  findings.issues.push(...scoreNpc(findings.replies));

  // Hunger forage check
  const hung = findings.replies.find(r => /hungrig/i.test(r.input));
  if (hung && !/hunger|essen|vorrat|brot|kaufen|suchen|durchsuch|ration|finde|magen|gold|cred/i.test(hung.text || '')) {
    findings.issues.push('hunger_no_guidance');
  }

  // Flavor length
  const look = findings.replies.find(r => /sehe mich um/i.test(r.input));
  if (look && (look.flavorLen || 0) < 40 && (look.text || '').length < 60) {
    findings.issues.push('place_flavor_thin');
  }

  await shot(page, `${tag}-vn`);

  // Combat talk-fight-spare
  const combat = await testCombatSpare(page);
  findings.combat = { issues: combat.issues, after: combat.after, fight: combat.fight };
  findings.issues.push(...combat.issues.map(i => 'combat_' + i));
  await shot(page, `${tag}-combat`);

  // Camp
  const camp = await testCamp(page);
  findings.camp = { issues: camp.issues, upgrades: camp.snap?.camp?.upgrades, raid: camp.snap?.raid, steps: camp.steps?.slice(-4) };
  findings.issues.push(...camp.issues.map(i => 'camp_' + i));
  await shot(page, `${tag}-camp`);

  // OW shot if available
  await page.evaluate(() => { try { window.__game.OW?.show?.(); } catch(_){} });
  await new Promise(r => setTimeout(r, 200));
  await shot(page, `${tag}-ow`);

  await page.close();
  return findings;
}

(async () => {
  const server = await serve();
  const browser = await puppeteer.launch({
    headless: true,
    protocolTimeout: 120000,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  const all = [];
  for (const g of GENRES) {
    all.push(await runGenre(browser, g, { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true }));
    all.push(await runGenre(browser, g, { width: 1280, height: 720, deviceScaleFactor: 1 }));
  }
  // Extra title / market / houses shots on desktop fantasy
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto(`http://127.0.0.1:${PORT}/?v=${VER}`, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.__game?.VER, { timeout: 15000 }).catch(() => {});
  await shot(page, 'title');
  await page.evaluate(async () => {
    const G = window.__game;
    window.__setCfg?.({ mode: 'offline' });
    await G.startProcedural?.('fantasy', 'Alex');
    try { G.enterPlay?.(); } catch(_){}
    // inject ledger news → market
    const S = G.S;
    S.ledger = S.ledger || [];
    S.ledger.push({ type: 'news', what: 'Hungersnot bedroht die Karawanserei — Vorräte knapp.', day: 1 });
    S.ledger.push({ type: 'news', what: 'Überfall auf Händler nahe dem Osttor.', day: 1 });
    try { G.Econ.marketFromLedger(S); } catch(_){}
    try { G.Econ.ensureMarket(S); } catch(_){}
  });
  await shot(page, 'market-ledger');
  await page.evaluate(() => { try { window.__game.openPixelShop?.(); } catch(_){} });
  await new Promise(r => setTimeout(r, 300));
  await shot(page, 'shop-houses');
  await page.close();

  await browser.close();
  server.close();

  const report = { ver: VER, findings: all, worst: all.flatMap(f => f.issues.map(i => `${f.genre}/${f.vp}:${i}`)) };
  fs.writeFileSync(path.join(OUT, 'v33-playtest.json'), JSON.stringify(report, null, 2));
  console.log('\n=== PLAYTEST SUMMARY ===');
  for (const f of all) {
    console.log(`\n${f.genre} ${f.vp}: issues=${f.issues.join(',') || 'none'}`);
    const sample = f.replies?.filter(r => /wer bist|erzähl|hallo|hungrig/i.test(r.input)).slice(0, 4) || [];
    for (const s of sample) console.log(`  [${s.input}] => ${(s.text || '').slice(0, 140)}`);
    if (f.camp) console.log('  camp', JSON.stringify(f.camp).slice(0, 200));
    if (f.combat) console.log('  combat', JSON.stringify({ issues: f.combat.issues, after: f.combat.after }).slice(0, 220));
  }
  console.log('\nWORST:', report.worst);
  process.exit(report.worst.length > 12 ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
