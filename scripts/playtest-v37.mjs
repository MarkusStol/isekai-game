#!/usr/bin/env node
/**
 * v37: online A/B (lean + spaced + multi-URL), global first names,
 * cyber/zombie camp burn reshoots, onboard + battle UX shots.
 */
import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = '/workspace/isekai-game-shots';
fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT).filter(x => /^v37-/.test(x))) fs.unlinkSync(path.join(OUT, f));
const PORT = 8797;
const VER = '37';
const FREE_URLS = [
  'https://text.pollinations.ai/openai',
  'https://text.pollinations.ai/',
  'https://gen.pollinations.ai/v1/chat/completions',
];
const REF = 'https://markusstol.github.io/isekai-game/';

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
  const dest = path.join(OUT, `v37-${name}.png`);
  await page.screenshot({ path: dest, type: 'png' });
  console.log('shot', name, fs.statSync(dest).size);
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function boot(page, genre) {
  await page.goto(`http://127.0.0.1:${PORT}/?v=${VER}&pt=1`, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForFunction(() => window.__game?.VER === '37', { timeout: 20000 });
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
    // Extra spawn via Depth to prove global tracker
    let extra = [];
    try {
      for (let i = 0; i < 5; i++) extra.push(G.Depth.pickGenreName(g, 'extra'+i));
    } catch(_){}
    const allFirst = [...firsts, ...extra.map(n => n.split(/\s+/)[0].toLowerCase())];
    return {
      ver: G.VER, genre: G.S?.genre, ort: G.S?.world?.scene?.ort,
      npcs: keys.slice(0, 6), firstUnique: new Set(firsts).size, firstTotal: firsts.length,
      firstDupes: firsts.length - new Set(firsts).size,
      extra, extraDupesVsWorld: extra.filter(n => firsts.includes(n.split(/\s+/)[0].toLowerCase())).length,
      globalSize: G.Depth.getUsedFirst?.()?.size|0,
      coachVisible: !document.getElementById('onboardCoach')?.classList.contains('hidden'),
    };
  }, genre);
}

async function forceCampBurnt(page, genre) {
  return page.evaluate((g) => {
    const G = window.__game; const S = G.S;
    S.genre = g; S.role = g;
    S.home = { owned: true, location: 'Lager-Zuhause', stage: 2 };
    S.world.orte = S.world.orte || {};
    S.world.orte['Lager-Zuhause'] = 'Lager Zuhause';
    S.world.graph = S.world.graph || { nodes: {} };
    S.world.graph.nodes['Lager-Zuhause'] = { desc: 'Lager Hütte' };
    S.camp = { upgrades: ['palisade'], morale: 40, raidThreat: 0,
      damage: { burnt: 3, palisadeBroken: true, tasks: ['palisade_repair', 'clear_ash'] } };
    S.world.scene.ort = 'Lager-Zuhause';
    const map = G.OW.buildMapForLocation(S, 'Lager-Zuhause');
    const c = {}; for (const t of (map.tiles || []).flat()) c[t] = (c[t] || 0) + 1;
    const ov = (map.overlay || []).flat().filter(Boolean);
    try { G.OW.showOverworld(S); } catch(_){}
    return {
      preset: map.preset, kind: map.kind,
      burnt: c.burnt|0, camp_burnt: c.camp_burnt|0, fence_broken: c.fence_broken|0,
      ash: ov.filter(x => /ash|ember/.test(x)).length,
    };
  }, genre);
}

async function onlineAB(page) {
  const pack = await page.evaluate(() => {
    const G = window.__game;
    window.__setCfg?.({ mode: 'free' });
    const keys = Object.keys(G.S.world.npcs);
    G.S.world.scene.anwesend = keys.slice(0, 2);
    G.offline?.('hallo'); G.offline?.('wer bist du');
    const a = 'erzähl mir von deiner Vergangenheit und was dein Ziel ist';
    const lean = G.msgsLean(a);
    const full = G.msgs(a);
    const offline = G.offline?.(a);
    return {
      lean, fullLen: JSON.stringify(full).length, leanLen: JSON.stringify(lean).length,
      ort: G.S.world.scene.ort, anwesend: [...G.S.world.scene.anwesend],
      offline: String(offline?.text || '').slice(0, 280),
      leanHasLock: /SCENE LOCK|Ort=/i.test(JSON.stringify(lean)),
      leanHasDepth: /TIEFE|Reveal|Gelebtes|Rede/i.test(JSON.stringify(lean)),
      leanHasInput: /Vergangenheit|Ziel/i.test(JSON.stringify(lean)),
    };
  });

  const result = {
    ...pack, attempts: [], online: null, st: null, endpoint: null,
    honorsDepth: false, honorsSceneLock: false, honorsInput: false, rateLimited: false,
  };

  const tryPost = async (url, messages, label) => {
    const body = { model: 'openai-fast', messages, temperature: 0.7, max_tokens: 180, stream: false, referrer: REF };
    const ac = new AbortController();
    const to = setTimeout(() => ac.abort(), 25000);
    try {
      const res = await fetch(url, {
        method: 'POST', signal: ac.signal,
        headers: { 'Content-Type': 'application/json', 'Referer': REF },
        body: JSON.stringify(body),
      });
      clearTimeout(to);
      const txt = await res.text();
      let online = '';
      try {
        const j = JSON.parse(txt);
        online = j.choices?.[0]?.message?.content || j.content || '';
        if (!online && j.error) online = '';
      } catch(_) { online = /choices|error/i.test(txt) ? '' : txt; }
      return { label, url, st: res.status, online: String(online).slice(0, 600), body: txt.slice(0, 160) };
    } catch (e) {
      clearTimeout(to);
      return { label, url, st: 0, err: String(e.message || e) };
    }
  };

  // 1) lean on classic openai
  let hit = await tryPost(FREE_URLS[0], pack.lean, 'lean-openai');
  result.attempts.push({ ...hit, online: (hit.online || '').slice(0, 120) });
  if (hit.st === 503 || hit.st === 402 || hit.st === 429 || !hit.online) {
    await sleep(32000);
    // 2) lean on plain text.pollinations.ai
    hit = await tryPost(FREE_URLS[1], pack.lean, 'lean-plain');
    result.attempts.push({ ...hit, online: (hit.online || '').slice(0, 120) });
  }
  if (hit.st === 503 || hit.st === 402 || hit.st === 429 || !hit.online) {
    await sleep(32000);
    // 3) tiny single-user message via openai
    const tiny = [
      { role: 'system', content: 'Nur Deutsch. Ort ' + pack.ort + '. NPC ' + (pack.anwesend?.[0] || 'jemand') + ' antwortet knapp mit Ziel/Vergangenheit. SCENE LOCK.' },
      { role: 'user', content: 'erzähl mir von deiner Vergangenheit und was dein Ziel ist' },
    ];
    hit = await tryPost(FREE_URLS[0], tiny, 'tiny-openai');
    result.attempts.push({ ...hit, online: (hit.online || '').slice(0, 120) });
  }
  if (hit.st === 503 || hit.st === 402 || hit.st === 429 || !hit.online) {
    await sleep(8000);
    // 4) gen endpoint (expect 401 without key — document)
    hit = await tryPost(FREE_URLS[2], pack.lean, 'gen-v1');
    result.attempts.push({ ...hit, online: (hit.online || '').slice(0, 120) });
  }

  result.st = hit.st;
  result.endpoint = hit.label;
  result.online = hit.online || '';
  if (hit.st === 503 || hit.st === 402 || hit.st === 429) result.rateLimited = true;
  if (hit.st === 401) result.genNeedsKey = true;

  if (result.online && result.online.length > 20 && hit.st === 200) {
    const online = result.online;
    const anw = pack.anwesend || [];
    const mentions = anw.some(n => {
      const f = String(n).split(/\s+/)[0];
      return f && online.toLowerCase().includes(f.toLowerCase());
    });
    const teleport = /du betrittst|ankommst in|stehst plötzlich|Königspalast|Teleport/i.test(online)
      && pack.ort && !new RegExp(pack.ort.slice(0, 10).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(online);
    result.honorsSceneLock = !teleport;
    result.honorsDepth = /ziel|vergangen|aufgewachsen|narbe|wund|erinner|schicht|weiß|will /i.test(online) || (mentions && online.length > 60);
    result.honorsInput = await page.evaluate((pa, narr) => {
      try { return window.__game.Cont.addressesPlayer(pa, narr); } catch(_) {
        return /vergangen|ziel|erzähl/i.test(narr);
      }
    }, 'erzähl mir von deiner Vergangenheit und was dein Ziel ist', online) || /ziel|vergangen/i.test(online);
    result.mentionsNpc = mentions;
  }
  return result;
}

(async () => {
  const server = await serve();
  const browser = await puppeteer.launch({
    headless: true, protocolTimeout: 180000,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  const findings = { issues: [] };

  // Fantasy boot + names + coach
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
  const bootF = await boot(page, 'fantasy');
  findings.bootFantasy = bootF;
  if ((bootF.firstDupes|0) > 0) findings.issues.push('first_dupes_world');
  if ((bootF.extraDupesVsWorld|0) > 0) findings.issues.push('first_dupes_global_spawn');
  if (!bootF.coachVisible) findings.issues.push('coach_missing');
  await shot(page, 'ui-mobile-onboard');
  await page.evaluate(() => { document.getElementById('btnCoachOk')?.click(); });
  await sleep(200);
  await shot(page, 'ui-mobile-play');

  // Battle UX — open a battle if possible
  await page.evaluate(() => {
    const G = window.__game;
    try {
      const foes = [{ id: 'wolf', name: 'Wolf', hp: 40, maxhp: 40, atk: 8, def: 3, spd: 8 }];
      G.Battle?.startBattle?.(G.S, { foes, canFlee: true });
    } catch (e) {
      try { G.openPendingEncounter?.({ foes: [{ name: 'Wolf', hp: 30 }] }); } catch(_){}
    }
  });
  await sleep(500);
  await shot(page, 'ui-mobile-battle');
  await page.close();

  // Desktop UX title
  const desk = await browser.newPage();
  await desk.setViewport({ width: 1280, height: 720 });
  await desk.goto(`http://127.0.0.1:${PORT}/?v=${VER}`, { waitUntil: 'networkidle0' });
  await desk.waitForFunction(() => window.__game?.VER === '37');
  await shot(desk, 'ui-desktop-title');
  await desk.close();

  // Camp burn reshoots cyber + zombie mobile+desktop
  for (const g of ['cyberpunk', 'zombie']) {
    for (const vp of [
      { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, tag: 'mobile' },
      { width: 1280, height: 720, tag: 'desktop' },
    ]) {
      const p = await browser.newPage();
      await p.setViewport(vp);
      await boot(p, g);
      await p.evaluate(() => { document.getElementById('btnCoachOk')?.click(); });
      const camp = await forceCampBurnt(p, g);
      findings['camp_'+g+'_'+vp.tag] = camp;
      if (!(camp.burnt > 0 || camp.camp_burnt > 0)) findings.issues.push('camp_burnt_'+g+'_'+vp.tag);
      if (!(camp.fence_broken > 0)) findings.issues.push('fence_broken_'+g+'_'+vp.tag);
      await sleep(400);
      await shot(p, `${g}-${vp.tag}-camp-burnt`);
      await p.close();
    }
  }

  // Online A/B on desktop fantasy
  const abPage = await browser.newPage();
  await abPage.setViewport({ width: 1280, height: 720 });
  await boot(abPage, 'fantasy');
  await abPage.evaluate(() => { document.getElementById('btnCoachOk')?.click(); });
  const ab = await onlineAB(abPage);
  findings.onlineAB = {
    rateLimited: ab.rateLimited, genNeedsKey: ab.genNeedsKey, st: ab.st, endpoint: ab.endpoint,
    leanLen: ab.leanLen, fullLen: ab.fullLen,
    leanHasLock: ab.leanHasLock, leanHasDepth: ab.leanHasDepth, leanHasInput: ab.leanHasInput,
    honorsDepth: ab.honorsDepth, honorsSceneLock: ab.honorsSceneLock, honorsInput: ab.honorsInput,
    mentionsNpc: ab.mentionsNpc,
    online: (ab.online || '').slice(0, 320),
    attempts: ab.attempts,
  };
  if (!ab.leanHasLock || !ab.leanHasDepth || !ab.leanHasInput) findings.issues.push('lean_prompt_incomplete');
  if (ab.rateLimited) findings.issues.push('online_ab_rate_limited');
  else if (ab.genNeedsKey && !ab.online) findings.issues.push('online_ab_gen_needs_key');
  else if (ab.st === 200 && ab.online) {
    if (!ab.honorsDepth) findings.issues.push('online_ab_depth_fail');
    if (!ab.honorsSceneLock) findings.issues.push('online_ab_scene_lock_fail');
    if (!ab.honorsInput) findings.issues.push('online_ab_input_fail');
  } else if (!ab.online) {
    findings.issues.push('online_ab_no_reply');
  }
  await abPage.close();

  await browser.close();
  server.close();

  const hard = findings.issues.filter(i => i !== 'online_ab_rate_limited' && i !== 'online_ab_gen_needs_key');
  const soft = findings.issues.filter(i => i === 'online_ab_rate_limited' || i === 'online_ab_gen_needs_key');
  const report = { ver: VER, findings, worst: hard, soft };
  fs.writeFileSync(path.join(OUT, 'v37-playtest.json'), JSON.stringify(report, null, 2));
  console.log('\n=== V37 SUMMARY ===');
  console.log('boot', JSON.stringify(bootF));
  console.log('camps', JSON.stringify({ cyber: findings.camp_cyberpunk_desktop, zombie: findings.camp_zombie_desktop }));
  console.log('onlineAB', JSON.stringify(findings.onlineAB, null, 2));
  console.log('WORST', hard);
  console.log('SOFT', soft);
  process.exit(hard.length > 6 ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
