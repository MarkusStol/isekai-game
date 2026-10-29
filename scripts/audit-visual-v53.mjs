#!/usr/bin/env node
/** v53 audit: battle critique fixes + broader UI at 390/375/1920 */
import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const TAG = process.env.V53_TAG || 'after';
const OUT = `/workspace/isekai-game-shots/v53-${TAG}`;
fs.mkdirSync(OUT, { recursive: true });
const PORT = 8863 + (TAG === 'after' ? 1 : 0);
const VER = process.env.V53_VER || '53';

function serve() {
  return new Promise(res => {
    const s = http.createServer((req, res2) => {
      let p = decodeURIComponent((req.url || '/').split('?')[0]);
      if (p === '/') p = '/index.html';
      const fp = path.join(ROOT, p.replace(/^\//, ''));
      if (!fp.startsWith(ROOT) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()) { res2.writeHead(404); res2.end(); return; }
      const ext = path.extname(fp);
      const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.ogg': 'audio/ogg' };
      res2.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(fp).pipe(res2);
    });
    s.listen(PORT, () => res(s));
  });
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function shot(page, name) {
  const dest = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: dest, type: 'png' });
  console.log('shot', TAG, name, fs.statSync(dest).size);
}
async function boot(page, genre = 'fantasy') {
  await page.goto(`http://127.0.0.1:${PORT}/?v=${VER}&audit=1`, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForFunction((v) => window.__game?.VER === v && window.__game?.Battle, { timeout: 30000 }, VER);
  await page.evaluate(async (g) => {
    const G = window.__game;
    window.__PLAYTEST = true; window.__gateFastCut = true;
    window.__setCfg?.({ mode: 'offline', gkey: '', pollenKey: '' });
    try { localStorage.setItem('isekai_audio_on', '0'); } catch (_) {}
    await G.startProcedural?.(g, 'Alex');
    G.S.setup = { done: true }; G.S.flags = { onboarded: true, visual53: true };
    try { document.getElementById('btnCoachOk')?.click(); } catch (_) {}
    try { G.enterPlay?.(); } catch (_) {}
    try { G.C53?.migrateV53?.(G.S); } catch (_) {}
  }, genre);
}
async function startOgre(page, mode = 'main') {
  await page.evaluate(async (mode) => {
    const G = window.__game;
    const { enemyById } = await import('./enemies.js');
    try { G.Battle.__forceHide?.(); } catch (_) {}
    G.Battle.startBattle(G.S, { enemies: [enemyById('boss_ogre')], dungeonBoss: true, atbMode: 'wait', scripted: true });
    const B = G.Battle.getBattle();
    const hero = B.party.find(p => p.kind === 'hero') || B.party[0];
    // add a companion for silhouette check
    if (B.party.length < 2) {
      try {
        const c = G.Battle.buildParty(G.S)?.[1];
        if (c) B.party.push(c);
      } catch (_) {}
    }
    // ensure 3 named companions with sheet roles (jobs German via companionJobId/role map)
    const names = [['Lyra','dieb'],['Orren','magier'],['Garrick','krieger']];
    for (const [nm, job] of names) {
      if (B.party.length >= 4) break;
      if (B.party.some(p => p.name === nm)) continue;
      B.party.push({ _iid: 'c_'+nm, kind: 'companion', name: nm, job, alive: true, hp: 80, maxhp: 80, mp: 40, maxmp: 40, atb: 20+B.party.length*12, row: 'back', npcRef: nm });
    }
    if (B.party[1]) { B.party[1].alive = true; B.party[1].atb = 40; }
    hero.atb = 100;
    if (mode === 'bossTalk') B.selecting = { actor: hero, mode: 'bossTalk', targetId: B.foes[0]._iid };
    else if (mode === 'technik') B.selecting = { actor: hero, mode: 'technik' };
    else B.selecting = { actor: hero, mode };
    B.atbMode = 'wait';
    G.Battle.renderBattleUI();
  }, mode);
  await sleep(500);
}
async function openTab(page, tab) {
  await page.evaluate((tab) => {
    const G = window.__game;
    try { G.Battle.__forceHide?.(); } catch (_) {}
    try { document.getElementById('auditCraft')?.remove(); } catch(_){}
    document.getElementById('overworld')?.classList.add('hidden');
    document.body.className = 'pixel-jrpg';
    document.getElementById('stage')?.classList.remove('hidden');
    document.getElementById('titleScreen')?.classList.add('hidden');
    const menu = document.getElementById('menu');
    if (menu) { menu.classList.remove('hidden'); menu.style.display = ''; menu.style.zIndex = '9999'; }
    G.openMenu?.(tab);
  }, tab);
  await sleep(450);
}
async function openCraft(page) {
  await page.evaluate(() => {
    const G = window.__game;
    try { G.closeMenu?.(); } catch (_) {}
    document.getElementById('menu')?.classList.add('hidden');
    document.getElementById('auditCraft')?.remove();
    const wrap = document.createElement('div');
    wrap.id = 'auditCraft';
    wrap.className = 'pixel-shop';
    wrap.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;';
    wrap.innerHTML = '<div class="pixel-shop-panel"><div class="pixel-shop-head">⚒ Werkstatt <span></span><button type="button" class="px-x">✕</button></div><div class="pixel-shop-meta">Rezepte · Material · Upgrade</div><div class="craft-wrap craft-shop-body" id="auditCraftBody"></div></div>';
    document.body.appendChild(wrap);
    G.UI17.renderCraft(document.getElementById('auditCraftBody'), G.S, { toast: () => {}, save: () => {} });
  });
  await sleep(300);
}

(async () => {
  const server = await serve();
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--window-size=390,844'] });
  const page = await browser.newPage();

  // ---- 390×844 ----
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto(`http://127.0.0.1:${PORT}/?v=${VER}`, { waitUntil: 'networkidle0', timeout: 60000 });
  await sleep(350);
  await shot(page, '01-title-390');

  await boot(page, 'fantasy');
  await shot(page, '02-play-vn-390');

  await startOgre(page, 'main');
  await shot(page, '07-battle-menu-390');
  await startOgre(page, 'technik');
  await shot(page, '07b-technik-390');
  await startOgre(page, 'skills');
  await shot(page, '07c-battle-skills-390');
  await startOgre(page, 'bossTalk');
  await shot(page, '07e-battle-talk-390');

  // companion silhouettes — force party with multiple roles
  await page.evaluate(async () => {
    const G = window.__game;
    const { enemyById } = await import('./enemies.js');
    try { G.Battle.__forceHide?.(); } catch (_) {}
    G.Battle.startBattle(G.S, { enemies: [enemyById('boss_ogre')], dungeonBoss: true, atbMode: 'wait', scripted: true });
    const B = G.Battle.getBattle();
    const hero = B.party.find(p => p.kind === 'hero') || B.party[0];
    const roles = ['spy', 'mage', 'guard'];
    const jobs = ['dieb', 'magier', 'krieger'];
    roles.forEach((role, i) => {
      B.party.push({
        kind: 'companion', name: ['Lyra', 'Orren', 'Garrick'][i], job: jobs[i], row: 'back',
        alive: true, hp: 80, maxhp: 80, mp: 30, maxmp: 30, atb: 20 + i * 10, limit: 0,
        _iid: 'c' + i, npcRef: ['Lyra', 'Orren', 'Garrick'][i], skills: [],
      });
    });
    hero.atb = 100; B.selecting = { actor: hero, mode: 'main' }; B.atbMode = 'wait';
    G.Battle.renderBattleUI();
  });
  await sleep(600);
  await shot(page, '07g-companions-390');

  await openCraft(page);
  await shot(page, '09-craft-390');
  await page.evaluate(() => document.getElementById('auditCraft')?.remove());

  await openTab(page, 'hub');
  await shot(page, '08-hub-390');
  await page.evaluate(() => { const G=window.__game; G.S.inv=[]; });
  await openTab(page, 'inv');
  await shot(page, '20-inv-empty-390');
  await page.evaluate(() => { const G=window.__game; G.S.inv=[{name:'Rucksack',icon:'🎒',type:'misc'},{name:'Proviant',icon:'🍞',type:'consumable'}]; });
  await openTab(page, 'inv');
  await shot(page, '20-inv-390');
  await openTab(page, 'jobs');
  await shot(page, '21-jobs-390');
  await openTab(page, 'atlas');
  await shot(page, '22-atlas-390');
  await openTab(page, 'codex');
  await shot(page, '23-codex-390');
  await openTab(page, 'skills');
  await shot(page, '21b-skills-390');
  await openTab(page, 'equip');
  await shot(page, '20b-equip-390');
  await page.evaluate(() => {
    try { document.getElementById('menu')?.classList.add('hidden'); document.querySelector('.menu-panel')?.classList.add('hidden'); } catch(_){}
    window.__game.openSheet?.();
  });
  await sleep(500);
  await shot(page, '24-settings-390');
  await page.evaluate(() => { document.getElementById('sheet')?.classList.add('hidden'); });
  // camp/home if available
  await page.evaluate(() => {
    document.getElementById('sheet')?.classList.add('hidden');
    window.__game.Battle?.__forceHide?.();
    const G=window.__game; if(G.S){ G.S.home=G.S.home||{}; G.S.home.owned=false; }
  });
  await openTab(page, 'home');
  await sleep(400);
  await shot(page, '25-home-390');

  // new-game / intro feel — title + procedural start
  await page.goto(`http://127.0.0.1:${PORT}/?v=${VER}&new=1`, { waitUntil: 'networkidle0', timeout: 60000 });
  await sleep(400);
  await shot(page, '03-title-new-390');

  // ---- 375×667 iPhone SE ----
  await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
  await boot(page, 'fantasy');
  await startOgre(page, 'main');
  await shot(page, '07-battle-menu-se');
  await startOgre(page, 'technik');
  await shot(page, '07b-technik-se');
  await openCraft(page);
  await shot(page, '09-craft-se');
  await page.evaluate(() => document.getElementById('auditCraft')?.remove());
  await openTab(page, 'hub');
  await shot(page, '08-hub-se');
  await openTab(page, 'jobs');
  await shot(page, '21-jobs-se');
  await page.goto(`http://127.0.0.1:${PORT}/?v=${VER}`, { waitUntil: 'networkidle0', timeout: 60000 });
  await sleep(300);
  await shot(page, '01-title-se');

  // ---- 1920×1080 ----
  await page.setViewport({ width: 1920, height: 1080, isMobile: false, hasTouch: false });
  await boot(page, 'fantasy');
  await startOgre(page, 'main');
  await shot(page, '12-battle-desktop');
  await startOgre(page, 'skills');
  await shot(page, '12b-skills-desktop');
  await openTab(page, 'hub');
  await shot(page, '08-hub-desktop');
  await openTab(page, 'atlas');
  await shot(page, '22-atlas-desktop');
  await openTab(page, 'codex');
  await shot(page, '23-codex-desktop');
  await openCraft(page);
  await shot(page, '09-craft-desktop');
  await page.goto(`http://127.0.0.1:${PORT}/?v=${VER}`, { waitUntil: 'networkidle0', timeout: 60000 });
  await sleep(300);
  await shot(page, '01-title-desktop');

  console.log('AUDIT_DONE', TAG, OUT);
  await browser.close();
  server.close();
})().catch(e => { console.error(e); process.exit(1); });
