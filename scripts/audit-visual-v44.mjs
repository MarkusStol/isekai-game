#!/usr/bin/env node
/** Capture before/after audit screens for art direction */
import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const TAG = process.env.V44_TAG || 'before';
const OUT = `/workspace/isekai-game-shots/v44-${TAG}`;
fs.mkdirSync(OUT, { recursive: true });
const PORT = 8820 + (TAG === 'after' ? 1 : 0);
const VER = process.env.V44_VER || '44';

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
    G.S.setup = { done: true }; G.S.flags = { onboarded: true };
    try { document.getElementById('btnCoachOk')?.click(); } catch (_) {}
    try { G.enterPlay?.(); } catch (_) {}
    try { G.C43?.migrateV43?.(G.S); } catch (_) {}
    try { G.C44?.migrateV44?.(G.S); } catch (_) {}
  }, genre);
}

(async () => {
  const server = await serve();
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--window-size=390,844'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  // Title
  await page.goto(`http://127.0.0.1:${PORT}/?v=${VER}`, { waitUntil: 'networkidle0', timeout: 60000 });
  await sleep(400);
  await shot(page, '01-title-mobile');

  await boot(page, 'fantasy');
  await sleep(300);
  await shot(page, '02-play-vn-mobile');

  // Portraits (VN mode, OW hidden)
  await page.evaluate(() => {
    const G = window.__game;
    try { G.OW?.hideOverworld?.(); } catch (_) {}
    document.getElementById('owRoot')?.classList.add('hidden');
    document.body.classList.remove('ow-mode');
    const n = Object.keys(G.S.world.npcs)[0];
    G.S.world.npcs[n].mood = 'freut sich';
    G.setPortrait(n, G.S.world.npcs[n]);
    const wrap = document.getElementById('portraitWrap');
    wrap?.classList.remove('hidden');
    const box = document.getElementById('storyBox');
    if (box) { box.classList.remove('hidden'); box.textContent = n + ': Willkommen, Held. Die Kristallspitze braucht dich.'; }
  });
  await sleep(400);
  await shot(page, '03-portrait-dialogue-mobile');

  // OW town
  await page.evaluate(() => { const G = window.__game; G.OW.showOverworld(G.S); });
  await sleep(500);
  await shot(page, '04-overworld-town-mobile');

  // Dialogue
  await page.evaluate(() => {
    const G = window.__game;
    const n = Object.keys(G.S.world.npcs)[0];
    G.S.world.npcs[n].mood = 'wütend';
    G.OW.showDialogue(n, 'Die Wache hat Fragen. Antworte weise.', 'guard');
  });
  await sleep(300);
  await shot(page, '05-ow-dialogue-mobile');
  await page.evaluate(() => window.__game.OW.hideDialogue());

  // Dungeon
  await page.evaluate(() => {
    const G = window.__game;
    try { G.C39.enterDungeon(G.S); G.OW.showOverworld(G.S); G.C41.refreshMinimap?.(G.S); } catch (_) {}
  });
  await sleep(500);
  await shot(page, '06-dungeon-mobile');

  // Battle
  await page.evaluate(async () => {
    const G = window.__game;
    const { enemyById } = await import('./enemies.js');
    G.Battle.startBattle(G.S, { enemies: [enemyById('boss_ogre')], dungeonBoss: true, atbMode: 'wait', scripted: true });
  });
  await sleep(900);
  await shot(page, '07-battle-mobile');
  await page.evaluate(() => { try { window.__game.Battle.__testDrive('flee'); } catch (_) {} });
  await sleep(700);

  // Menu
  await page.evaluate(() => { try { window.__game.openMenu?.(); } catch (_) {} });
  await sleep(400);
  await shot(page, '08-menu-mobile');

  // Shop-ish / craft
  await page.evaluate(() => {
    const G = window.__game;
    let ov = document.createElement('div');
    ov.id = 'auditCraft';
    ov.style.cssText = 'position:fixed;inset:12px;background:#0b1224f5;z-index:9999;overflow:auto;padding:12px;border-radius:12px;border:2px solid #d4b45a';
    document.body.appendChild(ov);
    try { G.UI17.renderCraft(ov, G.S, { toast: () => {}, save: () => {} }); } catch (e) { ov.textContent = String(e); }
  });
  await sleep(300);
  await shot(page, '09-craft-shop-mobile');
  await page.evaluate(() => document.getElementById('auditCraft')?.remove());

  // Settings
  await page.evaluate(() => {
    try { document.getElementById('settings')?.classList.remove('hidden'); } catch (_) {}
    try { document.querySelector('.settings, #cfg, #settingsPanel')?.classList.remove('hidden'); } catch (_) {}
  });
  await sleep(200);
  await shot(page, '10-settings-mobile');

  // Desktop
  await page.setViewport({ width: 1280, height: 800, isMobile: false, hasTouch: false });
  await boot(page, 'fantasy');
  await page.evaluate(() => { const G = window.__game; G.OW.showOverworld(G.S); });
  await sleep(500);
  await shot(page, '11-overworld-desktop');
  await page.evaluate(async () => {
    const G = window.__game;
    const { enemyById } = await import('./enemies.js');
    G.Battle.startBattle(G.S, { enemies: [enemyById('goblin')], atbMode: 'wait', scripted: true });
  });
  await sleep(900);
  await shot(page, '12-battle-desktop');
  await page.evaluate(() => { try { window.__game.Battle.__testDrive('flee'); } catch (_) {} });
  await sleep(600);
  await page.evaluate(() => { try { window.__game.openMenu?.(); } catch (_) {} });
  await sleep(300);
  await shot(page, '13-menu-desktop');

  // cyberpunk genre OW
  await boot(page, 'cyberpunk');
  await page.evaluate(() => { const G = window.__game; G.OW.showOverworld(G.S); });
  await sleep(500);
  await shot(page, '14-overworld-cyber-mobile');

  console.log('AUDIT_DONE', TAG, OUT);
  await browser.close();
  server.close();
})().catch(e => { console.error(e); process.exit(1); });
