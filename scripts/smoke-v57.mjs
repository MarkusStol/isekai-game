#!/usr/bin/env node
/** v56: load-time + throttled-CPU FPS + hub/ally/menu-battle shots */
import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = '/workspace/isekai-game-shots/v57-qa';
fs.mkdirSync(OUT, { recursive: true });
const PORT = 8878;
const VER = '57';

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

(async () => {
  const server = await serve();
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  // Throttle CPU 4x + slow 4G for mobile-ish
  const client = await page.createCDPSession();
  await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await client.send('Network.emulateNetworkConditions', {
    offline: false, latency: 100, downloadThroughput: 1.6*1024*1024/8, uploadThroughput: 750*1024/8, connectionType: 'cellular4g'
  });

  const t0 = Date.now();
  await page.goto(`http://127.0.0.1:${PORT}/?v=${VER}&perf=1`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate(async () => {
    try{
      const regs = await navigator.serviceWorker?.getRegistrations?.() || [];
      await Promise.all(regs.map(r => r.unregister()));
      if (window.caches?.keys){ const ks=await caches.keys(); await Promise.all(ks.map(k=>caches.delete(k))); }
    }catch(_){}
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  const tDom = Date.now() - t0;
  await page.waitForFunction((v) => window.__game?.VER === v, { timeout: 45000 }, VER);
  const tGame = Date.now() - t0;
  const bootMetrics = await page.evaluate(async () => {
    const nav = performance.getEntriesByType('navigation')[0];
    const res = performance.getEntriesByType('resource');
    const bytes = res.reduce((a, r) => a + (r.transferSize || 0), 0);
    const heavy = res.filter(r => /music\/|\.ogg|bg-battle|port\//.test(r.name)).map(r => ({ name: r.name.split('/').slice(-2).join('/'), kb: Math.round((r.transferSize||0)/1024), ms: Math.round(r.duration) }));
    return {
      domContentLoaded: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
      loadEvent: nav ? Math.round(nav.loadEventEnd) : null,
      transferKB: Math.round(bytes/1024),
      resourceCount: res.length,
      heavyAudioEarly: heavy.filter(h => /\.ogg/.test(h.name)),
    };
  });
  console.log('LOAD', JSON.stringify({ tDom, tGame, ...bootMetrics }));

  // Start play + battle for FPS
  const boot = await page.evaluate(async () => {
    const G = window.__game;
    window.__FAST = true; window.__PLAYTEST = true; window.__SKIP_REMOTE_IMG = true; window.__FORCE_CSS_SCENES = true;
    window.__setCfg?.({ mode: 'offline' });
    try{
      await G.startProcedural('zombie', 'PerfAlex');
      try{ G.Level?.ensureProgress?.(G.S); }catch(_){}
      if(G.S){ G.S.setup = { done: true }; }
      try { G.enterPlay?.(); } catch (_) {}
      return { ok:!!G.S, name:G.S?.pc?.name, ort:G.S?.world?.scene?.ort, progress:!!G.S?.progress };
    }catch(e){ return { ok:false, err:String(e.stack||e).slice(0,300) }; }
  });
  console.log('BOOT', JSON.stringify(boot));
  if(!boot.ok) throw new Error('boot failed: '+JSON.stringify(boot));
  await sleep(300);
  const mid = await page.evaluate(() => ({ hasS:!!window.__game?.S, href:location.href, ver:window.__game?.VER }));
  console.log('MID', JSON.stringify(mid));
  await page.screenshot({ path: `${OUT}/01-play.png` });
  const mid2 = await page.evaluate(() => ({ hasS:!!window.__game?.S }));
  console.log('MID2', JSON.stringify(mid2));

  // Hub density
  const hubOpen = await page.evaluate(() => {
    try{
      const G=window.__game;
      if(!G.S) return { ok:false, err:'no-S' };
      try{ G.Level?.ensureProgress?.(G.S); }catch(e){ return { ok:false, err:'prog:'+e }; }
      G.openMenu?.('hub');
      return { ok:true, body: (document.getElementById('menuBody')?.innerHTML||'').slice(0,200), menuHidden: document.getElementById('menu')?.classList.contains('hidden') };
    }catch(e){ return { ok:false, err:String(e) }; }
  });
  console.log('HUB_OPEN', JSON.stringify(hubOpen));
  await sleep(400);
  const hub = await page.evaluate(() => ({
    primary: document.querySelectorAll('.hub-grid-primary .hub-tile').length,
    moreBtn: !!document.querySelector('.hub-more-btn'),
    moreHidden: document.querySelector('.hub-grid-more')?.classList.contains('hidden'),
    tiles: document.querySelectorAll('.hub-tile').length,
  }));
  console.log('HUB', JSON.stringify(hub));
  await page.screenshot({ path: `${OUT}/02-hub.png` });
  await page.evaluate(() => document.querySelector('.hub-more-btn')?.click());
  await sleep(200);
  await page.screenshot({ path: `${OUT}/03-hub-more.png` });
  await page.evaluate(() => window.__game.closeMenu?.());

  // Battle + ally art + FPS sample
  await page.evaluate(async () => {
    const G = window.__game;
    try{ G.Level?.ensureProgress?.(G.S); }catch(_){}
    G.openMenu?.('hub');
    const { enemyById } = await import('./enemies.js');
    const foes = [enemyById('goblin'), enemyById('slime')].filter(Boolean);
    await G.Battle.startBattle(G.S, { enemies: foes, atbMode: 'wait', scripted: true });
    const B = G.Battle.getBattle();
    if(!B) throw new Error('no battle');
    B.party.push({ _iid: 'spy1', kind: 'companion', name: 'Lyra', job: 'dieb', alive: true, hp: 80, maxhp: 80, mp: 30, maxmp: 30, atb: 40, row: 'back', npcRef: 'Lyra' });
    const hero = B.party.find(p => p.kind === 'hero') || B.party[0];
    hero.atb = 100; B.selecting = { actor: hero, mode: 'main' }; B.atbMode = 'wait';
    await G.Battle.renderBattleUI();
  });
  await sleep(500);
  const battleInfo = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll('.battle-root img')].map(i => i.getAttribute('src') || '');
    const menu = document.getElementById('menu');
    const ms = getComputedStyle(menu);
    return {
      allies: imgs.filter(s => /ally_/.test(s)),
      foes: imgs.filter(s => /battler\/(?!ally)/.test(s) || /goblin|slime/.test(s)),
      menuHidden: menu.classList.contains('hidden') || ms.display === 'none' || ms.visibility === 'hidden',
      battleOpen: document.body.classList.contains('battle-open'),
    };
  });
  console.log('BATTLE', JSON.stringify(battleInfo));
  await page.screenshot({ path: `${OUT}/04-battle-allies.png` });

  // FPS over ~2s with rAF while battle UI idle
  const fps = await page.evaluate(async () => {
    let frames = 0;
    const t0 = performance.now();
    await new Promise(resolve => {
      const tick = (t) => {
        frames++;
        if (t - t0 < 2000) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
    const elapsed = (performance.now() - t0) / 1000;
    return { frames, fps: Math.round(frames / elapsed), elapsed: Math.round(elapsed * 100) / 100 };
  });
  console.log('FPS_THROTTLE4x', JSON.stringify(fps));

  // Desktop menu-under-battle
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(`http://127.0.0.1:${PORT}/?v=${VER}&desk=1`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => {
    try{ const regs=await navigator.serviceWorker?.getRegistrations?.()||[]; await Promise.all(regs.map(r=>r.unregister())); }catch(_){}
  });
  await page.waitForFunction((v) => window.__game?.VER === v, { timeout: 30000 }, VER);
  await page.evaluate(async () => {
    const G = window.__game; window.__FAST = true; window.__setCfg?.({ mode: 'offline' });
    await G.startProcedural?.('cyberpunk', 'Desk');
    G.S.setup = { done: true }; try { G.enterPlay?.(); } catch (_) {}
    G.openMenu?.('hub');
  });
  await sleep(400);
  await page.screenshot({ path: `${OUT}/05-desk-menu.png` });
  await page.evaluate(async () => {
    const G = window.__game;
    const { enemyById } = await import('./enemies.js');
    G.Battle.startBattle(G.S, { enemies: [enemyById('street_thug') || enemyById('slime')], atbMode: 'wait', scripted: true });
  });
  await sleep(500);
  const desk = await page.evaluate(() => {
    const menu = document.getElementById('menu');
    const ms = getComputedStyle(menu);
    return {
      menuHidden: menu.classList.contains('hidden') || ms.display === 'none' || ms.visibility === 'hidden',
      battleOpen: document.body.classList.contains('battle-open'),
    };
  });
  console.log('DESK_BATTLE', JSON.stringify(desk));
  await page.screenshot({ path: `${OUT}/06-desk-battle-no-menu.png` });

  const report = { ver: VER, tDom, tGame, bootMetrics, hub, battleInfo, fps, desk };
  fs.writeFileSync(path.join(OUT, 'perf.json'), JSON.stringify(report, null, 2));
  console.log('PERF_DONE', OUT);
  await browser.close();
  server.close();
})().catch(e => { console.error(e); process.exit(1); });
