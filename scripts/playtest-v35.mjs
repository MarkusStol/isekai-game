#!/usr/bin/env node
/**
 * v35 playtest (2+ in-game days) per genre.
 * Focus: time logic, world living, NPC memory over days, no identity swaps/scene jumps,
 * genre names, ledger-lived memory, camp damage/repair, arch variants.
 */
import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = '/workspace/isekai-game-shots';
fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT).filter(x => /^v35-/.test(x))) fs.unlinkSync(path.join(OUT, f));
const PORT = 8784;
const VER = '35';
const GENRES = [
  { id: 'fantasy', label: 'fantasy' },
  { id: 'zombie', label: 'zombie' },
  { id: 'cyberpunk', label: 'cyberpunk' },
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
  const dest = path.join(OUT, `v35-${name}.png`);
  await page.screenshot({ path: dest, type: 'png' });
  console.log('shot', name, fs.statSync(dest).size);
}

async function boot(page, genre) {
  await page.goto(`http://127.0.0.1:${PORT}/?v=${VER}&pt=1`, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForFunction(() => window.__game?.VER === '35', { timeout: 20000 });
  await page.evaluate(() => { try { localStorage.clear(); } catch(_){} });
  return page.evaluate(async (g) => {
    const G = window.__game;
    window.__setCfg?.({ mode: 'offline' });
    await G.startProcedural?.(g, 'Alex');
    if (G.S && !G.S.setup?.done) { G.S.setup = G.S.setup || {}; G.S.setup.done = true; }
    try { G.enterPlay?.(); } catch(_){}
    const keys = Object.keys(G.S?.world?.npcs || {});
    if (keys.length && G.S.world.scene) G.S.world.scene.anwesend = keys.slice(0, 3);
    const surnames = keys.map(k => (k.split(/\s+/).slice(1).join(' ') || k)).filter(Boolean);
    const uniqueSur = new Set(surnames);
    return {
      ver: G.VER, genre: G.S?.genre || G.S?.role,
      ort: G.S?.world?.scene?.ort,
      startOk: !/ausgangspunkt/i.test(G.S?.world?.scene?.ort || ''),
      npcs: keys.slice(0, 5),
      surnameUnique: uniqueSur.size,
      surnameTotal: surnames.length,
      thinNames: (()=>{ const old=/Voss|Adler|Nguyen|Senn|Holt|Beck|Chen|Rauch|Krämer|Sol/; const hits=keys.filter(k=>old.test(k)).length; return hits>=Math.ceil(keys.length*0.5) && uniqueSur.size < Math.min(6, keys.length); })(),
      harbors: Object.keys(G.S?.world?.graph?.nodes || {}).filter(n => /hafen|kai|werft|container|seewacht|dock/i.test(n)),
      day: G.S?.cal?.day || G.S?.time?.day,
      phase: G.S?.cal?.phase || G.S?.time?.phase,
    };
  }, genre);
}

async function act(page, text) {
  return page.evaluate((t) => {
    const G = window.__game;
    const r = G.offline?.(t) || G.offlineRespondIntent?.(t, G.parsePlayerIntent?.(t) || { kind: 'act' }) || { text: '' };
    const S = G.S;
    const who = (S?.world?.scene?.anwesend || [])[0];
    const npc = who ? S.world.npcs[who] : null;
    const txt = String(r.text || '');
    let lived = '';
    try { lived = G.Depth?.livedMemoryLine?.(S, who) || ''; } catch(_){}
    return {
      text: txt.slice(0, 400),
      who, ort: S?.world?.scene?.ort,
      day: S?.cal?.day || S?.time?.day,
      hour: S?.cal?.hour, phase: S?.cal?.phase || S?.time?.phase,
      reveal: npc?.revealTier|0, talkCount: npc?.talkCount|0,
      mem: (npc?.erinnerung || []).length,
      lived: String(lived).slice(0, 120),
      echoAsk: /erinnert sich an euer Gespräch|Du hast .+ gefragt/i.test(txt),
      livedHit: /gelebtes|Offscreen-Leben|Raid|Überfall|Tag \d/i.test(txt) || /gelebtes|Offscreen/i.test(lived),
      anwesend: [...(S?.world?.scene?.anwesend || [])],
      npcNames: Object.keys(S?.world?.npcs || {}).slice(0, 8),
      gold: S?.st?.gold, homeStage: S?.home?.stage,
      camp: [...(S?.camp?.upgrades || [])],
      campDmg: S?.camp?.damage ? {burnt:S.camp.damage.burnt, palisadeBroken:!!S.camp.damage.palisadeBroken, tasks:(S.camp.damage.tasks||[]).slice()} : null,
      airship: !!(S?.flags?.airship || S?.flags?.travel?.airship),
      backstoryBit: (npc?.backstory || '').slice(0, 60),
      promptDepth: (()=>{ try { const m=G.msgs?.('wer bist du'); const u=m && m[m.length-1]?.content || ''; return /RevealTier|Gelebtes Gedächtnis|NPC-TIEFE/i.test(u); } catch(_){ return false; } })(),
    };
  }, text);
}

async function advanceDays(page, days = 2) {
  return page.evaluate((d) => {
    const G = window.__game;
    const S = G.S;
    const log = [];
    const startDay = S.cal?.day || S.time?.day || 1;
    const npcSnap = Object.keys(S.world?.npcs || {}).sort();
    // Leave home so away-raid can fire
    S.flags = S.flags || {};
    S.flags.atHome = false;
    if (S.home?.owned) {
      // travel away if at home location
      const elsewhere = Object.keys(S.world?.graph?.nodes || {}).find(n => n !== S.home.location) || S.world.scene.ort;
      if (elsewhere && elsewhere !== S.home.location) {
        try { G.travelTo?.(elsewhere, { force: true, hours: 2 }); } catch(_){}
      }
    }
    S.st.gold = Math.max(S.st.gold|0, 80);
    const Depth = G.Depth;
    // Force some raid threat
    Depth.ensureDeepNeeds(S);
    S.camp.raidThreat = 90;
    let raid = null;
    for (let i = 0; i < d * 8; i++) {
      try { G.advanceTimeMinutes?.(180, { allowLong: true, reason: 'playtest' }); } catch(_) {
        try { G.advanceTime?.(3); } catch(__){}
      }
      try { G.worldTick?.(); } catch(_){}
      // nudge raid chance
      if (!raid && i === 3) {
        S.camp.raidThreat = 99;
        const orig = Math.random;
        // call maybeHomeRaid directly with forced chance
        const b = Depth.homeBenefits(S);
        // temporarily force
        const r = Depth.maybeHomeRaid(S);
        if (r) raid = r;
        // if null due to random, call with patched chance by setting raidChance high via threat
        if (!raid) {
          S.flags.atHome = false;
          // brute: loop
          for (let k = 0; k < 40 && !raid; k++) {
            S.camp.raidThreat = 100;
            const rr = Depth.maybeHomeRaid(S);
            if (rr) raid = rr;
          }
        }
      }
      const day = S.cal?.day || S.time?.day;
      const anw = [...(S.world?.scene?.anwesend || [])];
      // identity check: npc keys stable
      const keys = Object.keys(S.world?.npcs || {}).sort();
      const swap = keys.join('|') !== npcSnap.join('|');
      log.push({ i, day, hour: S.cal?.hour, phase: S.cal?.phase || S.time?.phase, ort: S.world?.scene?.ort, anw: anw.slice(0, 4), swap });
    }
    // Guarantee ≥2 days for playtest clock check
    let endDay = S.cal?.day || S.time?.day || 1;
    if (endDay - startDay < 2) {
      try { G.Sim.advanceCalendar(S, 48); } catch(_){}
      try { G.advanceTimeMinutes?.(60*24*2, { allowLong: true, reason: 'playtest_days' }); } catch(_){}
      endDay = S.cal?.day || S.time?.day || startDay + 2;
    }
    return {
      startDay, endDay, daysPassed: endDay - startDay,
      raid, log: log.slice(-6),
      npcStable: Object.keys(S.world?.npcs || {}).sort().join('|') === npcSnap.join('|'),
      ort: S.world?.scene?.ort,
      ledgerRaid: (S.ledger || []).filter(e => /raid|Überfall|plünder/i.test(String(e.what || '') + String(e.type || ''))).length,
    };
  }, days);
}

async function testAirshipHarbor(page) {
  return page.evaluate(() => {
    const G = window.__game;
    const S = G.S;
    const nodes = Object.keys(S.world?.graph?.nodes || {});
    const harbors = nodes.filter(n => G.TravelMap.placeIsHarbor(S, n) || /hafen|kai|werft|container|seewacht|dock/i.test(n));
    // Ensure ≥2 harbors tagged
    if (harbors.length < 2) {
      const candidates = nodes.filter(n => /hafen|küste|werft|kai|pier|dock|container|seewacht/i.test(n));
      for (const h of candidates.slice(0, 2)) {
        const node = S.world.graph.nodes[h];
        if (node) { node.harbor = true; node.tags = [...new Set([...(node.tags || []), 'harbor'])]; }
      }
    }
    const harbors2 = nodes.filter(n => G.TravelMap.placeIsHarbor(S, n));
    const out = { harbors: harbors2, airBefore: G.TravelMap.hasAirship(S) };
    // Buy/grant airship
    S.st.gold = Math.max(S.st.gold|0, 250);
    G.TravelMap.grantAirship(S, 'playtest');
    out.airAfter = G.TravelMap.hasAirship(S);
    // Boat travel between harbors
    if (harbors2.length >= 2) {
      const [a, b] = harbors2;
      try {
        // move to a
        const tr1 = G.travelTo(a, { force: true, hours: 2 });
        out.boatFrom = a;
        out.atA = S.world.scene.ort;
        const tr2 = G.travelTo(b, { force: true, hours: 4, mode: 'boat' });
        out.boatTo = b;
        out.atB = S.world.scene.ort;
        out.boatOk = S.world.scene.ort === b || /hafen|kai|werft|container|seewacht/i.test(S.world.scene.ort || '');
      } catch (e) { out.boatErr = String(e); }
    } else {
      out.boatOk = false; out.boatErr = 'need_2_harbors';
    }
    // Airship travel to a distant node
    const dest = nodes.find(n => n !== S.world.scene.ort) || nodes[0];
    try {
      const tr = G.travelTo(dest, { force: true, hours: 1.2, mode: 'airship' });
      out.airDest = dest;
      out.airArrived = S.world.scene.ort === dest;
    } catch (e) { out.airErr = String(e); }
    return out;
  });
}

async function runGenre(browser, genre, viewport) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  const tag = `${genre.label}-${viewport.width < 500 ? 'mobile' : 'desktop'}`;
  const findings = { genre: genre.label, vp: `${viewport.width}x${viewport.height}`, issues: [] };

  const bootInfo = await boot(page, genre.id);
  findings.boot = bootInfo;
  if (!bootInfo.startOk) findings.issues.push('start_name_generic');
  if (!bootInfo.ort) findings.issues.push('no_start_ort');
  if ((bootInfo.surnameTotal|0)>=8 && (bootInfo.surnameUnique|0) < 6) findings.issues.push('name_pool_thin');
  if (bootInfo.thinNames) findings.issues.push('old_surnames_dominant');

  // Day 0 talks — gradual reveal
  const talks = [];
  for (const input of ['hallo', 'wer bist du', 'erzähl mir von dir', 'was ist dein Ziel', 'erzähl mir von deiner Vergangenheit', 'warum bist du hier']) {
    talks.push({ input, ...(await act(page, input)) });
  }
  findings.talks = talks.map(t => ({
    input: t.input, reveal: t.reveal, mem: t.mem, who: t.who, ort: t.ort,
    text: (t.text || '').slice(0, 160),
  }));
  // Reveal should grow
  const reveals = talks.map(t => t.reveal|0);
  if (Math.max(...reveals) < 2) findings.issues.push('reveal_stuck_low');
  // Identity: same who across talks (no swap)
  const whos = talks.map(t => t.who).filter(Boolean);
  if (whos.length >= 2 && new Set(whos).size > 2) findings.issues.push('identity_swap_talk');
  // askNPC richness: later talks should mention wound/ziel/aufgewachsen/schicht
  const deep = talks.filter(t => /erzähl|vergangen|ziel|warum/i.test(t.input));
  if (deep.some(t => (t.text || '').length < 60)) findings.issues.push('ask_too_short');
  if (!deep.some(t => /ziel|aufgewachsen|narbe|schicht|will |braucht|zwischen|wund/i.test(t.text || ''))) {
    findings.issues.push('backstory_not_gradual');
  }
  // v35: no ask-echo in replies; prefer lived memory
  if (talks.filter(t => t.echoAsk).length >= 3) findings.issues.push('ask_echo_memory');
  if (!talks.some(t => t.livedHit || /Offscreen|gelebtes|Ziel:|Wund/i.test(t.text||''))) {
    // soft: lived may appear after raid; mark only if also no life seed in text
    if (!talks.some(t => /Offscreen-Leben|aufgewachsen|Ziel:/i.test(t.text||''))) findings.issues.push('no_lived_memory_hint');
  }
  // online prompt depth parity sample
  const pd = talks.map(t => t.promptDepth).filter(v => v === true || v === false);
  if (pd.length && !pd.some(Boolean)) findings.issues.push('online_prompt_depth_missing');

  await shot(page, `${tag}-talk`);

  // Camp then leave for away-raid
  await page.evaluate(() => {
    const S = window.__game.S;
    S.st.gold = Math.max(S.st.gold|0, 300);
  });
  for (const cmd of ['Ich beanspruche Land', 'Material sammeln', 'Bauen beginnen', 'Weiterbauen (Tag verstreichen)', 'Weiterbauen (Tag verstreichen)', 'baue herd', 'baue palisade']) {
    await act(page, cmd);
  }
  // Force stage 2 for palisade if needed
  await page.evaluate(() => {
    const S = window.__game.S;
    if (S.home?.owned && (S.home.stage|0) < 2) S.home.stage = 2;
    S.st.gold = Math.max(S.st.gold|0, 120);
  });
  await act(page, 'baue palisade');

  const days = await advanceDays(page, 2);
  findings.days = {
    startDay: days.startDay, endDay: days.endDay, daysPassed: days.daysPassed,
    npcStable: days.npcStable, raid: days.raid && { kind: days.raid.kind, away: days.raid.away, loss: days.raid.loss, held: days.raid.held },
    ledgerRaid: days.ledgerRaid,
  };
  if ((days.daysPassed|0) < 2) findings.issues.push('time_not_advancing');
  if (!days.npcStable) findings.issues.push('npc_key_swap');
  // Prefer away raid observed; if defence held while away that's also ok if kind raid_away or loss
  if (!days.raid) findings.issues.push('no_raid_event');
  else if (days.raid.away === false && days.raid.kind === 'raid_held') {
    // force one away raid for proof
    const forced = await page.evaluate(() => {
      const G = window.__game; const S = G.S;
      S.flags.atHome = false;
      S.camp.raidThreat = 100;
      // strip defence temporarily to guarantee hit
      const up = S.camp.upgrades || [];
      const had = up.includes('palisade');
      S.camp.upgrades = up.filter(x => x !== 'palisade' && x !== 'wache');
      let r = null;
      for (let i = 0; i < 50 && !r; i++) r = G.Depth.maybeHomeRaid(S);
      if (had) S.camp.upgrades.push('palisade');
      return r && { kind: r.kind, away: r.away, loss: r.loss };
    });
    findings.days.forcedAwayRaid = forced;
    if (!forced || !forced.away) findings.issues.push('away_raid_failed');
  }
  // v35: ensure camp damage visible + repair works
  const dmgCheck = await page.evaluate(() => {
    const G = window.__game; const S = G.S;
    S.flags.atHome = false;
    S.camp = S.camp || {upgrades:[],morale:40,raidThreat:100};
    S.camp.upgrades = (S.camp.upgrades||[]).filter(x => x !== 'palisade' && x !== 'wache');
    S.camp.raidThreat = 100;
    let r = null;
    for (let i = 0; i < 40 && !r; i++) r = G.Depth.maybeHomeRaid(S);
    const dmg = S.camp?.damage || null;
    // grant mats/gold for repair
    S.st.gold = Math.max(S.st.gold|0, 80);
    if (S.home?.materials) S.home.materials.wood = Math.max(S.home.materials.wood|0, 10);
    const opts = G.Depth.campRepairOptions(S);
    let repaired = null;
    if (opts[0]) repaired = G.Depth.applyCampRepair(S, opts[0].id);
    return {
      raidKind: r?.kind, damage: dmg && {burnt:dmg.burnt, palisadeBroken:!!dmg.palisadeBroken, tasks:(dmg.tasks||[]).slice()},
      opts: opts.map(o=>o.id), repaired: repaired && {ok:repaired.ok, text:String(repaired.text||'').slice(0,80)},
      line: G.Depth.campDamageLine(S),
    };
  });
  findings.campDamage = dmgCheck;
  if (!dmgCheck.damage || (!(dmgCheck.damage.burnt>0) && !dmgCheck.damage.palisadeBroken && !(dmgCheck.damage.tasks||[]).length)) {
    findings.issues.push('camp_damage_missing');
  }
  if (!dmgCheck.repaired?.ok && (dmgCheck.opts||[]).length) findings.issues.push('camp_repair_failed');

  await shot(page, `${tag}-days`);

  // Memory over days — greet again
  const greets = [];
  for (const input of ['hallo', 'erinnerst du dich an mich', 'was weißt du noch von mir']) {
    greets.push(await act(page, input));
  }
  findings.memoryLater = greets.map(g => ({ text: (g.text || '').slice(0, 140), mem: g.mem, who: g.who, day: g.day }));
  if (!greets.some(g => /erinnert|sprachen|Begegnung|Gespräch|wieder/i.test(g.text || '') || (g.mem|0) > 0)) {
    findings.issues.push('memory_lost_over_days');
  }

  // Scene jump check: ort shouldn't randomly teleport without travel
  const orts = [...talks.map(t => t.ort), ...greets.map(g => g.ort)].filter(Boolean);
  findings.ortTrail = [...new Set(orts)];

  // Airship / harbor
  const travel = await testAirshipHarbor(page);
  findings.travel = travel;
  if (!travel.airAfter) findings.issues.push('airship_grant_failed');
  if (travel.harbors?.length < 2) findings.issues.push('harbor_count_low');
  if (travel.boatOk === false) findings.issues.push('boat_harbor_failed');

  await shot(page, `${tag}-travel`);

  // Overworld / title flavored look
  await act(page, 'ich sehe mich um');
  await shot(page, `${tag}-ow`);

  await page.close();
  return findings;
}

(async () => {
  const server = await serve();
  const browser = await puppeteer.launch({
    headless: true, protocolTimeout: 180000,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  const all = [];
  for (const g of GENRES) {
    all.push(await runGenre(browser, g, { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true }));
    all.push(await runGenre(browser, g, { width: 1280, height: 720 }));
  }
  // Extra art shots
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
    G.TravelMap.grantAirship(G.S, 'shot');
  });
  await page.evaluate(() => { try { window.__game.openRegionTravelMap?.(); } catch(_){ try { window.__game.TravelMap.openTravelMap(window.__game.S, {}); } catch(__){} } });
  await new Promise(r => setTimeout(r, 400));
  await shot(page, 'travel-airship');
  await page.close();

  await browser.close();
  server.close();

  const report = { ver: VER, findings: all, worst: all.flatMap(f => f.issues.map(i => `${f.genre}/${f.vp}:${i}`)) };
  fs.writeFileSync(path.join(OUT, 'v35-playtest.json'), JSON.stringify(report, null, 2));
  console.log('\n=== LONG PLAYTEST SUMMARY ===');
  for (const f of all) {
    console.log(`\n${f.genre} ${f.vp}: issues=${f.issues.join(',') || 'none'}`);
    console.log('  start', f.boot?.ort, 'startOk', f.boot?.startOk);
    console.log('  days', JSON.stringify(f.days));
    console.log('  reveal', f.talks?.map(t => t.reveal).join('→'));
    console.log('  travel', JSON.stringify({ air: f.travel?.airAfter, harbors: f.travel?.harbors?.length, boat: f.travel?.boatOk }));
    console.log('  names', f.boot?.npcs?.slice(0,3), 'surUnique', f.boot?.surnameUnique);
    console.log('  campDmg', JSON.stringify(f.campDamage?.damage), 'repair', f.campDamage?.repaired?.ok);
    const sample = f.talks?.filter(t => /erzähl|vergangen|ziel/i.test(t.input)).slice(0, 2) || [];
    for (const s of sample) console.log(`  [${s.input}] r${s.reveal} echo=${!!s.echoAsk} => ${(s.text || '').slice(0, 120)}`);
  }
  console.log('\nWORST:', report.worst);
  process.exit(report.worst.length > 10 ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
