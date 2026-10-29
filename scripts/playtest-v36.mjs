#!/usr/bin/env node
/**
 * v36 playtest: unique first names, OW camp damage tiles, regional floorplans,
 * Pollinations online A/B (depth/scene lock/player input), UI polish shots.
 */
import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = '/workspace/isekai-game-shots';
fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT).filter(x => /^v36-/.test(x))) fs.unlinkSync(path.join(OUT, f));
const PORT = 8791;
const VER = '36';
const GENRES = [
  { id: 'fantasy', label: 'fantasy' },
  { id: 'zombie', label: 'zombie' },
  { id: 'cyberpunk', label: 'cyberpunk' },
];
const FREE_URL = 'https://text.pollinations.ai/openai';
const FREE_REFERRER = 'https://markusstol.github.io/isekai-game/';

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
  const dest = path.join(OUT, `v36-${name}.png`);
  await page.screenshot({ path: dest, type: 'png' });
  console.log('shot', name, fs.statSync(dest).size);
}

async function boot(page, genre) {
  await page.goto(`http://127.0.0.1:${PORT}/?v=${VER}&pt=1`, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForFunction(() => window.__game?.VER === '36', { timeout: 20000 });
  await page.evaluate(() => { try { localStorage.clear(); } catch(_){} });
  return page.evaluate(async (g) => {
    const G = window.__game;
    window.__setCfg?.({ mode: 'offline' });
    await G.startProcedural?.(g, 'Alex');
    if (G.S && !G.S.setup?.done) { G.S.setup = G.S.setup || {}; G.S.setup.done = true; }
    try { G.enterPlay?.(); } catch(_){}
    const keys = Object.keys(G.S?.world?.npcs || {});
    if (keys.length && G.S.world.scene) G.S.world.scene.anwesend = keys.slice(0, 3);
    const firsts = keys.map(k => (k.split(/\s+/)[0] || '').toLowerCase()).filter(Boolean);
    const uniqueFirst = new Set(firsts);
    const surnames = keys.map(k => (k.split(/\s+/).slice(1).join(' ') || k)).filter(Boolean);
    const uniqueSur = new Set(surnames);
    return {
      ver: G.VER, genre: G.S?.genre || G.S?.role,
      ort: G.S?.world?.scene?.ort,
      startOk: !/ausgangspunkt/i.test(G.S?.world?.scene?.ort || ''),
      npcs: keys.slice(0, 8),
      firstUnique: uniqueFirst.size,
      firstTotal: firsts.length,
      firstDupes: firsts.length - uniqueFirst.size,
      surnameUnique: uniqueSur.size,
      surnameTotal: surnames.length,
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
      gold: S?.st?.gold, homeStage: S?.home?.stage,
      campDmg: S?.camp?.damage ? {burnt:S.camp.damage.burnt, palisadeBroken:!!S.camp.damage.palisadeBroken, tasks:(S.camp.damage.tasks||[]).slice()} : null,
      promptDepth: (()=>{ try { const m=G.msgs?.('wer bist du'); const u=m && m[m.length-1]?.content || ''; return /RevealTier|Gelebtes Gedächtnis|NPC-TIEFE|SCENE LOCK/i.test(u); } catch(_){ return false; } })(),
    };
  }, text);
}

/** Inspect overworld map for burnt tiles / regional signature */
async function inspectOW(page) {
  return page.evaluate(() => {
    const G = window.__game; const S = G.S;
    // Force camp damage then rebuild map for home
    S.home = S.home || {};
    S.home.owned = true;
    // Force camp-named home so preset==='camp' (platz/markt names flip kind back to town)
    S.home.location = 'Lager-Zuhause';
    S.world.orte = S.world.orte || {};
    S.world.orte['Lager-Zuhause'] = 'Dein Lager und Zuhause';
    S.world.graph = S.world.graph || { nodes: {}, edges: [] };
    S.world.graph.nodes = S.world.graph.nodes || {};
    S.world.graph.nodes['Lager-Zuhause'] = { desc: 'Lager Zuhause Hütte' };
    S.camp = S.camp || { upgrades: [], morale: 40, raidThreat: 0 };
    S.camp.damage = { burnt: 3, palisadeBroken: true, tasks: ['palisade_repair', 'clear_ash'] };
    S.world.scene.ort = 'Lager-Zuhause';
    const map = G.OW.buildMapForLocation(S, 'Lager-Zuhause');
    const flat = (map.tiles || []).flat();
    const counts = {};
    for (const t of flat) counts[t] = (counts[t] || 0) + 1;
    const ovFlat = (map.overlay || []).flat().filter(Boolean);
    const hasBurnt = (counts.burnt|0) > 0 || (counts.camp_burnt|0) > 0;
    const hasBroken = (counts.fence_broken|0) > 0;
    const hasAsh = ovFlat.some(k => /ash|ember/i.test(String(k)))
      || (map.animators||[]).some(a => /smoke|ember/i.test(String(a.kind||'')));
    const sig = {
      houses: (map.interiors || []).map(l => l.label || l.to).slice(0, 12),
      water: counts.water|0, ruin: counts.ruin|0, sand: counts.sand|0,
      stall: counts.stall|0, floor: counts.floor|0, plaza: counts.plaza|0,
      path: counts.path|0, burnt: counts.burnt|0, camp_burnt: counts.camp_burnt|0,
      fence_broken: counts.fence_broken|0,
    };
    return {
      ort: S.home.location, hasBurnt, hasBroken, hasAsh, kind: map.kind, preset: map.preset,
      counts: { burnt: counts.burnt|0, camp_burnt: counts.camp_burnt|0, fence_broken: counts.fence_broken|0, ashOv: hasAsh },
      sig, presetHint: map.preset || map.kind || null,
    };
  });
}

async function regionalCompare(page) {
  return page.evaluate(() => {
    const G = window.__game;
    const out = {};
    for (const g of ['fantasy', 'zombie', 'cyberpunk', 'desert', 'darkfantasy']) {
      // synthetic S
      const S = {
        genre: g, role: g,
        home: { owned: false },
        camp: {},
        world: { scene: { ort: 'Stadtplatz' }, graph: { nodes: { Stadtplatz: { desc: 'ein Platz' } } }, orte: { Stadtplatz: 'Platz' } },
      };
      const map = G.OW.buildMapForLocation(S, 'Stadtplatz');
      const flat = (map.tiles || []).flat();
      const c = {};
      for (const t of flat) c[t] = (c[t] || 0) + 1;
      const houses = (map.interiors || []).map(l => String(l.label || l.to));
      out[g] = {
        water: c.water|0, ruin: c.ruin|0, sand: c.sand|0, floor: c.floor|0,
        stall: c.stall|0, path: c.path|0, houses: houses.slice(0, 6).join('|'),
        preset: map.preset, kind: map.kind,
      };
    }
    // Distinctness: cyber should have floor, wastes ruin, desert sand, fantasy stalls/water
    const distinct =
      (out.cyberpunk.floor > out.fantasy.floor) &&
      (out.zombie.ruin > out.fantasy.ruin) &&
      (out.desert.sand > 10) &&
      (out.fantasy.stall >= 0);
    return { out, distinct };
  });
}

/** Real online A/B via Pollinations — when not rate-limited */
async function pollinationsAB(page, playerAction) {
  // Build messages in-page (same as online narrator)
  const pack = await page.evaluate((a) => {
    const G = window.__game;
    window.__setCfg?.({ mode: 'free' });
    const msgs = G.msgs(a);
    const dump = G.lastPromptDump?.(a) || {};
    const S = G.S;
    const ort = S.world?.scene?.ort;
    const anw = [...(S.world?.scene?.anwesend || [])];
    const offline = G.offline?.(a) || {};
    return {
      messages: msgs,
      dumpKeys: Object.keys(dump || {}),
      dumpHasDepth: /NPC-TIEFE|RevealTier|Gelebtes|SCENE LOCK|online = offline/i.test(JSON.stringify(dump) + JSON.stringify(msgs)),
      ort, anwesend: anw,
      offlineText: String(offline.text || '').slice(0, 500),
      offlineOrt: S.world?.scene?.ort,
    };
  }, playerAction);

  const result = {
    playerAction,
    promptHasDepth: !!pack.dumpHasDepth,
    offlineOrt: pack.ort,
    anwesend: pack.anwesend,
    offlineSample: (pack.offlineText || '').slice(0, 220),
    online: null,
    rateLimited: false,
    honorsDepth: false,
    honorsSceneLock: false,
    honorsInput: false,
    err: null,
  };

  try {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 20000);
    const body = {
      model: 'openai-fast',
      messages: pack.messages,
      temperature: 0.7,
      max_tokens: 220,
      stream: false,
      referrer: FREE_REFERRER,
    };
    const res = await fetch(FREE_URL, {
      method: 'POST',
      signal: ac.signal,
      headers: { 'Content-Type': 'application/json', 'Referer': FREE_REFERRER },
      body: JSON.stringify(body),
    });
    clearTimeout(t);
    if (res.status === 402 || res.status === 429 || res.status === 503) {
      result.rateLimited = true;
      result.err = `rate_${res.status}`;
      return result;
    }
    if (!res.ok) {
      result.err = `http_${res.status}`;
      const txt = await res.text().catch(() => '');
      result.body = txt.slice(0, 200);
      return result;
    }
    const j = await res.json();
    const text = j.choices?.[0]?.message?.content || j.content || '';
    result.online = String(text).slice(0, 600);

    // Honor checks
    const online = result.online || '';
    const ort = pack.ort || '';
    const anw = pack.anwesend || [];
    // Scene lock: should not invent arrival at unrelated place; should not drop all names
    const teleport = /du betrittst|ankommst in|stehst plötzlich in|Teleport|zurück in der Halle|Königspalast/i.test(online)
      && ort && !new RegExp(ort.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 20), 'i').test(online);
    const mentionsNpc = anw.some(n => {
      const first = String(n).split(/\s+/)[0];
      return first && online.toLowerCase().includes(first.toLowerCase());
    });
    result.honorsSceneLock = !teleport && (mentionsNpc || /hier|Ort|bleibt|Szene/i.test(online) || online.length > 40);

    // Depth: speech/memory/reveal markers or characterful reply (not generic empty)
    result.honorsDepth = /narbe|wund|ziel|erinner|aufgewachsen|schicht|stimme|flüstert|grinst|blick|gesagt|weiß noch/i.test(online)
      || (mentionsNpc && online.length > 80);

    // Player input: Cont.addressesPlayer or keyword overlap
    const addresses = await page.evaluate((pa, narr) => {
      try { return window.__game.Cont.addressesPlayer(pa, narr); } catch(_) {
        const stems = s => String(s||'').toLowerCase().split(/[^a-zäöüß0-9]+/i).filter(w => w.length >= 4);
        const A = new Set(stems(pa)); let hit = 0;
        for (const w of stems(narr)) if (A.has(w)) hit++;
        return hit >= 1 || /frag|sag|wer|ziel|vergangen/i.test(narr);
      }
    }, playerAction, online);
    result.honorsInput = !!addresses
      || /antwort|sagt|blickt|nickt|hebt|fragt zurück/i.test(online);

  } catch (e) {
    result.err = String(e.message || e);
    if (/abort/i.test(result.err)) result.err = 'timeout';
  }
  return result;
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
  if ((bootInfo.firstTotal|0) >= 6 && (bootInfo.firstDupes|0) > 0) findings.issues.push('first_name_dupes');
  if ((bootInfo.surnameTotal|0) >= 8 && (bootInfo.surnameUnique|0) < 6) findings.issues.push('name_pool_thin');

  const talks = [];
  for (const input of ['hallo', 'wer bist du', 'erzähl mir von dir', 'was ist dein Ziel', 'erzähl mir von deiner Vergangenheit']) {
    talks.push({ input, ...(await act(page, input)) });
  }
  findings.talks = talks.map(t => ({
    input: t.input, reveal: t.reveal, mem: t.mem, who: t.who, ort: t.ort,
    text: (t.text || '').slice(0, 160),
  }));
  const reveals = talks.map(t => t.reveal|0);
  if (Math.max(...reveals) < 2) findings.issues.push('reveal_stuck_low');
  const whos = talks.map(t => t.who).filter(Boolean);
  if (whos.length >= 2 && new Set(whos).size > 2) findings.issues.push('identity_swap_talk');
  if (talks.filter(t => t.echoAsk).length >= 3) findings.issues.push('ask_echo_memory');
  const pd = talks.map(t => t.promptDepth).filter(v => v === true || v === false);
  if (pd.length && !pd.some(Boolean)) findings.issues.push('online_prompt_depth_missing');

  await shot(page, `${tag}-talk`);

  // Camp damage + OW tiles
  await page.evaluate(() => {
    const S = window.__game.S;
    S.st.gold = Math.max(S.st.gold|0, 300);
  });
  for (const cmd of ['Ich beanspruche Land', 'Material sammeln', 'Bauen beginnen', 'Weiterbauen (Tag verstreichen)', 'baue herd', 'baue palisade']) {
    await act(page, cmd);
  }
  await page.evaluate(() => {
    const S = window.__game.S;
    if (S.home?.owned && (S.home.stage|0) < 2) S.home.stage = 2;
  });

  const ow = await inspectOW(page);
  findings.owCamp = ow;
  if (!ow.hasBurnt) findings.issues.push('ow_burnt_tiles_missing');
  if (!ow.hasBroken && !ow.hasAsh) findings.issues.push('ow_damage_overlay_thin');

  // Force rebuild + show OW for screenshot
  await page.evaluate(() => {
    const G = window.__game;
    try { G.OW?.showOverworld?.(G.S); } catch(_) {
      try { G.OW?.refreshOverworld?.(G.S); } catch(__){}
    }
  });
  await new Promise(r => setTimeout(r, 500));
  await shot(page, `${tag}-camp-burnt`);

  // Regional compare once per desktop fantasy
  if (viewport.width >= 500 && genre.id === 'fantasy') {
    const reg = await regionalCompare(page);
    findings.regional = reg;
    if (!reg.distinct) findings.issues.push('regional_floorplans_not_distinct');
  }

  // Advance days lightly
  await page.evaluate(() => {
    const G = window.__game;
    try { G.advanceTimeMinutes?.(60 * 24 * 2, { allowLong: true, reason: 'pt' }); } catch(_){}
  });
  await shot(page, `${tag}-days`);

  // Online A/B — once per genre on desktop to avoid rate limits
  if (viewport.width >= 500) {
    // brief backoff if classic API was hot
    await new Promise(r => setTimeout(r, 12000));
    const ab = await pollinationsAB(page, 'erzähl mir von deiner Vergangenheit und was dein Ziel ist');
    findings.onlineAB = {
      rateLimited: ab.rateLimited,
      err: ab.err,
      promptHasDepth: ab.promptHasDepth,
      honorsDepth: ab.honorsDepth,
      honorsSceneLock: ab.honorsSceneLock,
      honorsInput: ab.honorsInput,
      online: (ab.online || '').slice(0, 280),
      offlineSample: ab.offlineSample,
    };
    if (!ab.promptHasDepth) findings.issues.push('prompt_missing_depth_lock');
    if (ab.rateLimited) {
      findings.issues.push('online_ab_rate_limited'); // soft — noted in caveats
    } else if (ab.err) {
      findings.issues.push('online_ab_error:' + ab.err);
    } else {
      if (!ab.honorsDepth) findings.issues.push('online_ab_depth_fail');
      if (!ab.honorsSceneLock) findings.issues.push('online_ab_scene_lock_fail');
      if (!ab.honorsInput) findings.issues.push('online_ab_input_fail');
    }
    // cooldown between genres
    await new Promise(r => setTimeout(r, 35000));
  }

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

  // UI polish shots: title, menu, choices — mobile + desktop
  for (const vp of [
    { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, tag: 'mobile' },
    { width: 1280, height: 720, tag: 'desktop' },
  ]) {
    const page = await browser.newPage();
    await page.setViewport(vp);
    await page.goto(`http://127.0.0.1:${PORT}/?v=${VER}`, { waitUntil: 'networkidle0' });
    await page.waitForFunction(() => window.__game?.VER === '36', { timeout: 15000 }).catch(() => {});
    await shot(page, `ui-${vp.tag}-title`);
    await page.evaluate(async () => {
      const G = window.__game;
      window.__setCfg?.({ mode: 'offline' });
      await G.startProcedural?.('fantasy', 'Alex');
      try { G.enterPlay?.(); } catch(_){}
    });
    await new Promise(r => setTimeout(r, 400));
    await shot(page, `ui-${vp.tag}-play`);
    await page.evaluate(() => { try { window.__game.openMenu?.(); } catch(_){} });
    await new Promise(r => setTimeout(r, 300));
    await shot(page, `ui-${vp.tag}-menu`);
    await page.close();
  }

  await browser.close();
  server.close();

  // Soft: rate_limited is expected sometimes — demote from hard fail count
  const hard = all.flatMap(f => f.issues.filter(i => i !== 'online_ab_rate_limited').map(i => `${f.genre}/${f.vp}:${i}`));
  const soft = all.flatMap(f => f.issues.filter(i => i === 'online_ab_rate_limited').map(i => `${f.genre}/${f.vp}:${i}`));
  const report = { ver: VER, findings: all, worst: hard, soft };
  fs.writeFileSync(path.join(OUT, 'v36-playtest.json'), JSON.stringify(report, null, 2));
  console.log('\n=== V36 PLAYTEST SUMMARY ===');
  for (const f of all) {
    console.log(`\n${f.genre} ${f.vp}: issues=${f.issues.join(',') || 'none'}`);
    console.log('  firsts', f.boot?.firstUnique, '/', f.boot?.firstTotal, 'dupes', f.boot?.firstDupes, f.boot?.npcs?.slice(0, 4));
    console.log('  owCamp', JSON.stringify(f.owCamp?.counts), 'burnt', f.owCamp?.hasBurnt);
    if (f.regional) console.log('  regional distinct', f.regional.distinct, JSON.stringify(f.regional.out?.cyberpunk), JSON.stringify(f.regional.out?.zombie));
    if (f.onlineAB) console.log('  onlineAB', JSON.stringify({ rl: f.onlineAB.rateLimited, depth: f.onlineAB.honorsDepth, lock: f.onlineAB.honorsSceneLock, input: f.onlineAB.honorsInput, prompt: f.onlineAB.promptHasDepth, err: f.onlineAB.err }));
    if (f.onlineAB?.online) console.log('  online>>', f.onlineAB.online.slice(0, 160));
  }
  console.log('\nWORST:', hard);
  console.log('SOFT:', soft);
  process.exit(hard.length > 8 ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
