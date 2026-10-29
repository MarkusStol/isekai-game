#!/usr/bin/env node
import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8860;
const server = http.createServer((req, res) => {
  let p = decodeURIComponent((req.url || '/').split('?')[0]);
  if (p === '/') p = '/index.html';
  const fp = path.join(ROOT, p.replace(/^\//, ''));
  if (!fp.startsWith(ROOT) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()) { res.writeHead(404); res.end(); return; }
  const ext = path.extname(fp);
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json' };
  res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(fp).pipe(res);
});
await new Promise(r => server.listen(PORT, r));
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
await page.goto(`http://127.0.0.1:${PORT}/?v=50`, { waitUntil: 'networkidle0', timeout: 60000 });
await page.waitForFunction(() => window.__game?.VER === '50' && window.__game?.C50, { timeout: 30000 });
const check = await page.evaluate(() => {
  const G = window.__game;
  const ids = Object.keys(G.C50.ENEMY_ART_KEYS);
  const rows = ids.map(id => {
    const e = { id, name: id, boss: /boss|story|super/.test(id) };
    const url = G.C50.battleEnemyArt(e);
    return { id, url, ok: url.includes('/battler/' + id + '.png') || url.includes('/battler/') };
  });
  const ogre = G.C50.battleEnemyArt({ id: 'boss_ogre', name: 'Oger-Kriegsherr', boss: true });
  return { ver: G.VER, ogre, rows: rows.filter(r => !r.ok), count: rows.length };
});
console.log(JSON.stringify(check, null, 2));
const out = '/workspace/isekai-game-shots/v50-after';
fs.mkdirSync(out, { recursive: true });
await page.evaluate(async () => {
  const G = window.__game;
  window.__PLAYTEST = true;
  await G.startProcedural?.('fantasy', 'Alex');
  G.S.setup = { done: true }; G.S.flags = { onboarded: true };
  try { G.enterPlay?.(); } catch (_) {}
  try { G.C50?.migrateV50?.(G.S); } catch (_) {}
  const foe = { id: 'boss_ogre', name: 'Oger-Kriegsherr', boss: true, hp: 220, maxhp: 220, atk: 14, def: 8, icon: '👹' };
  try {
    if (G.Battle?.beginEncounter) G.Battle.beginEncounter(G.S, { foes: [foe] });
    else if (G.Battle?.start) G.Battle.start(G.S, [foe]);
    else if (G.openPendingEncounter) {
      G.S.pendingEncounter = { foes: [foe] };
      G.openPendingEncounter();
    }
  } catch (e) { console.warn(e); }
  try { G.Battle?.renderBattleUI?.(); } catch (_) {}
});
await new Promise(r => setTimeout(r, 800));
await page.screenshot({ path: out + '/00-ogre-kriegsherr.png', type: 'png' });
const src = await page.evaluate(() => {
  const img = document.querySelector('.foe-art, .pixel-foe img, .battler-spr');
  const name = document.querySelector('.foe-name, .foe-card b, .battle-foes')?.textContent || '';
  return { src: img?.getAttribute('src') || img?.src || null, name: name.slice(0, 80) };
});
console.log('battle proof', src);
await browser.close();
server.close();
if (check.ogre !== './assets/pixel/battler/boss_ogre.png') process.exit(1);
