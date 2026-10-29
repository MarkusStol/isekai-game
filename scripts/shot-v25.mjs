#!/usr/bin/env node
import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = '/workspace/isekai-game-shots';
fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT).filter(x => /^v25-/.test(x))) fs.unlinkSync(path.join(OUT, f));
const PORT = 8775;

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
      const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json' };
      res2.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(fp).pipe(res2);
    });
    server.listen(PORT, () => res(server));
  });
}
async function shot(page, name) {
  const dest = path.join(OUT, `v25-${name}.png`);
  await page.screenshot({ path: dest, type: 'png' });
  console.log('shot', name, fs.statSync(dest).size);
}

const server = await serve();
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.goto(`http://127.0.0.1:${PORT}/index.html?v=25`, { waitUntil: 'networkidle0' });
await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
await page.reload({ waitUntil: 'networkidle0' });
await page.waitForFunction(() => window.__game?.VER === '25' && window.__game?.OW);
await shot(page, 'title');

await page.evaluate(async () => {
  const g = window.__game;
  window.__FAST = true; window.__setCfg?.({ mode: 'offline' });
  await g.newLife('held', { lives: 0, soul: 0, keptSkills: [] }, { skipSetup: true, name: 'Aki' });
  if (g.S.setup && !g.S.setup.done) g.S.setup.done = true;
  g.S.ver = '25';
  g.enterPlay();
  const names = Object.keys(g.S.world.npcs || {}).slice(0, 4);
  g.S.world.scene.anwesend = names;
  for (const n of names) { try { g.Know?.learnName?.(g.S, n, 'shot'); g.Know?.markInteracted?.(g.S, n); } catch (_) {} }
  document.body.classList.add('genre-held', 'pixel-jrpg');
});
await new Promise(r => setTimeout(r, 400));

await page.evaluate(() => {
  const g = window.__game;
  g.OW.showOverworld(g.S);
  for (let i = 0; i < 4; i++) { g.OW.__tryMove(1, 0); g.OW.__tryMove(0, -1); }
});
await new Promise(r => setTimeout(r, 800));
await shot(page, 'overworld');

await page.evaluate(async () => {
  const g = window.__game;
  g.OW.__talkNearest();
  g.OW.showDialogue('Lyra', '„Bleib sitzen. Wenn du vom Bruch redest, dann leise — die Wände haben Ohren.“', 'spy');
});
await new Promise(r => setTimeout(r, 700));
await shot(page, 'dialogue');

await page.evaluate(() => {
  const g = window.__game;
  g.OW.hideDialogue?.();
  g.OW.hideOverworld();
  document.getElementById('menu')?.classList.add('hidden');
  g.Battle.startBattle(g.S, {
    enemies: [{ id: 'wolf', name: 'Schattenwolf', hp: 45, maxhp: 45, atk: 10, def: 4, spd: 8, icon: '🐺' }],
    atbMode: 'wait',
  });
});
await new Promise(r => setTimeout(r, 800));
await shot(page, 'battle');

await page.evaluate(() => {
  document.getElementById('battleRoot')?.classList.add('hidden');
  window.__game.openMenu('hub');
});
await new Promise(r => setTimeout(r, 500));
await shot(page, 'menu');

await browser.close(); server.close();
console.log('done', fs.readdirSync(OUT).filter(x => /^v25-/.test(x)));
