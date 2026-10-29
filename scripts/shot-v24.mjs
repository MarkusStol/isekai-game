#!/usr/bin/env node
import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = '/workspace/isekai-game-shots';
fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT).filter(x => /^v24-/.test(x))) fs.unlinkSync(path.join(OUT, f));
const PORT = 8774;

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
  const dest = path.join(OUT, `v24-${name}.png`);
  await page.screenshot({ path: dest, type: 'png' });
  console.log('shot', name, fs.statSync(dest).size);
}

const server = await serve();
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=390,844'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
page.setDefaultTimeout(30000);

await page.goto(`http://127.0.0.1:${PORT}/index.html?v=24`, { waitUntil: 'networkidle0' });
await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
await page.reload({ waitUntil: 'networkidle0' });
await page.waitForFunction(() => window.__game?.OW && window.__game?.VER === '24');
await new Promise(r => setTimeout(r, 300));
await shot(page, 'title');

const started = await page.evaluate(async () => {
  const g = window.__game;
  window.__FAST = true;
  window.__FORCE_CSS_SCENES = false;
  window.__SKIP_REMOTE_IMG = true;
  window.__setCfg?.({ mode: 'offline', debug: 1, v2: 1 });
  try {
    await g.newLife('held', { lives: 0, soul: 0, keptSkills: [] }, { skipSetup: true, name: 'Aki' });
    if (g.S.setup && !g.S.setup.done) g.S.setup.done = true;
    g.S.ver = '24';
    g.enterPlay();
    const names = Object.keys(g.S.world.npcs || {}).slice(0, 4);
    g.S.world.scene.anwesend = names;
    for (const n of names) {
      try { g.Know?.learnName?.(g.S, n, 'shot'); } catch (_) {}
      try { g.Know?.markInteracted?.(g.S, n); } catch (_) {}
    }
    g.S.inv = [
      { name: 'Kurzschwert', type: 'weapon', rarity: 'uncommon', desc: 'Zuverlässige Klinge' },
      { name: 'Heiltrank', type: 'potion', rarity: 'common', desc: 'Stellt HP wieder her' },
    ];
    document.body.classList.add('genre-held', 'pixel-jrpg');
    return { ok: true, ver: g.VER, npcs: names, ort: g.S.world.scene.ort };
  } catch (e) { return { err: e.message }; }
});
console.log('start', started);
await new Promise(r => setTimeout(r, 400));

// OVERWORLD
await page.evaluate(() => {
  const g = window.__game;
  // dismiss any begegnung modal
  document.querySelectorAll('.begegnung,.modal,.name-reveal,[data-begegnung]').forEach(el => el.remove());
  const b = [...document.querySelectorAll('button')].find(x => /Weiter|Schließen|OK/i.test(x.textContent || ''));
  b?.click();
  g.OW.showOverworld(g.S);
  g.OW.__tryMove(1, 0);
  g.OW.__tryMove(0, -1);
});
await new Promise(r => setTimeout(r, 700));
await shot(page, 'overworld');

// DIALOGUE — talk nearest with known names, wait for VN
await page.evaluate(async () => {
  const g = window.__game;
  document.querySelectorAll('.begegnung,.begegn-overlay,#begegnung').forEach(el => el.classList.add('hidden'));
  [...document.querySelectorAll('button')].find(x => /Weiter/i.test(x.textContent || ''))?.click();
  const who = g.OW.__talkNearest();
  document.body.classList.add('ow-dialogue');
  return who;
});
// wait for busy clear / text
await page.waitForFunction(() => {
  const t = document.getElementById('vnText')?.textContent || '';
  return t.length > 20 && !document.body.classList.contains('busy');
}, { timeout: 15000 }).catch(() => {});
await new Promise(r => setTimeout(r, 500));
// hide begegnung if still up
await page.evaluate(() => {
  document.querySelectorAll('.begegnung, #begegnung, .begegn-card').forEach(el => { el.style.display = 'none'; el.classList.add('hidden'); });
  [...document.querySelectorAll('button')].find(x => /Weiter/i.test(x.textContent || ''))?.click();
});
await new Promise(r => setTimeout(r, 400));
await shot(page, 'dialogue');

// BATTLE — proper FF6 pixel Battle.startBattle
await page.evaluate(() => {
  const g = window.__game;
  g.OW.hideOverworld();
  document.body.classList.remove('ow-dialogue', 'pixel-ow');
  document.getElementById('menu')?.classList.add('hidden');
  // end any immerse combat
  document.querySelectorAll('.imm-combat,#immCombat').forEach(el => el.remove());
  g.Battle.startBattle(g.S, {
    enemies: [{ id: 'wolf', name: 'Schattenwolf', hp: 45, maxhp: 45, atk: 10, def: 4, spd: 8, icon: '🐺', type: 'beast' }],
    atbMode: 'wait',
  });
});
await new Promise(r => setTimeout(r, 800));
const battleCheck = await page.evaluate(() => ({
  root: !document.getElementById('battleRoot')?.classList.contains('hidden'),
  pixel: document.getElementById('battleRoot')?.classList.contains('battle-pixel'),
  foes: document.querySelectorAll('#battleFoes .foe-card').length,
  party: document.querySelectorAll('#battleParty .party-card').length,
  cmds: document.querySelectorAll('#battleCmd .bcm').length,
}));
console.log('battle', battleCheck);
await shot(page, 'battle');

// MENU
await page.evaluate(() => {
  const g = window.__game;
  // force-end battle UI
  const root = document.getElementById('battleRoot');
  if (root) { root.classList.add('hidden'); root.innerHTML = ''; }
  try { if (g.Battle.getBattle()) { /* leave */ } } catch (_) {}
  g.openMenu('hub');
});
await new Promise(r => setTimeout(r, 600));
await shot(page, 'menu');

await browser.close();
server.close();
console.log('done', fs.readdirSync(OUT).filter(x => /^v24-/.test(x)));
