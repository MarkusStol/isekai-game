#!/usr/bin/env node
/** Capture before/after audit screens for art direction */
import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const TAG = process.env.V48_TAG || 'after';
const OUT = `/workspace/isekai-game-shots/v48-${TAG}`;
fs.mkdirSync(OUT, { recursive: true });
const PORT = 8850 + (TAG === 'after' ? 1 : 0);
const VER = process.env.V48_VER || '48';

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
    try { G.C45?.migrateV45?.(G.S); } catch (_) {}
    try { G.C46?.migrateV46?.(G.S); } catch (_) {}
    try { G.C47?.migrateV47?.(G.S); } catch (_) {}
    try { G.C48?.migrateV48?.(G.S); } catch (_) {}
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

  // Portraits — stranger label until name learned; coherent choices; role-matched face
  await page.evaluate(() => {
    const G = window.__game;
    try { G.OW?.hideOverworld?.(); } catch (_) {}
    document.getElementById('overworld')?.classList.add('hidden');
    document.body.classList.remove('pixel-ow','ow-mode','ow-fs-active','ow-desktop','ow-dialogue');
    document.body.classList.add('pixel-jrpg');
    document.getElementById('stage')?.classList.remove('hidden');
    document.getElementById('toast')?.classList.remove('on');
    try { G.clearTypewrite?.(); } catch (_) {}
    const n = Object.keys(G.S.world.npcs || {})[0] || 'Lyra';
    const npc = G.S.world.npcs[n] || {};
    npc.art = npc.art || 'eine Magierin mit silbernem Haar und blauem Mantel';
    npc.geschlecht = npc.geschlecht || 'weiblich';
    npc.mood = 'freut sich';
    G.S.world.npcs[n] = npc;
    // ensure name NOT known yet
    try {
      G.Know.ensurePerson(G.S, n, npc);
      if (G.S.know?.people?.[n]) G.S.know.people[n].knownName = false;
    } catch (_) {}
    G.S.flags = G.S.flags || {};
    G.S.flags.speaker = n;
    G.setPortrait(n, npc);
    const label = G.Know.displayName(G.S, n, npc);
    const wrap = document.getElementById('portraitWrap');
    wrap?.classList.remove('hidden');
    wrap?.classList.add('portrait-force-show','portrait-bust','portrait-sprite');
    const role = G.C46?.portraitRole?.(n, npc) || 'mage';
    const img = document.getElementById('portraitImg');
    if (img) {
      img.src = G.C45?.ROLE_PORT?.[role] || './assets/pixel/portrait/mage.png';
      img.classList.add('on','pixelated');
    }
    G.C45?.loadFramedRolePortrait?.(role).then(url => { if (url && img) { img.src = url; img.classList.add('on'); } });
    const vn = document.getElementById('vnText');
    if (vn) vn.textContent = '„Willkommen in Kristallspitze. Der Pakt ist gebrochen — wohin gehst du?“';
    const sp = document.getElementById('speaker');
    if (sp) { sp.classList.remove('hidden'); sp.textContent = label; }
    // coherent choices while she speaks
    G.S.choices = ['Weiter fragen', 'Verabschieden', 'Umsehen'];
    try { G.renderChoices?.(); } catch (_) {
      const c = document.getElementById('choices');
      if (c) {
        c.innerHTML = '';
        G.S.choices.forEach(t => { const b=document.createElement('button'); b.type='button'; b.textContent=t; c.appendChild(b); });
      }
    }
    document.getElementById('inputRow')?.classList.add('hidden');
  });
  await page.waitForFunction(() => {
    const img = document.getElementById('portraitImg');
    const wrap = document.getElementById('portraitWrap');
    const sp = document.getElementById('speaker');
    if (!wrap || wrap.classList.contains('hidden')) return false;
    if (sp && /Liora|Nebelwald/i.test(sp.textContent||'')) return false; // must stay masked
    return !!(img && img.complete && img.naturalWidth > 8);
  }, { timeout: 5000 }).catch(()=>{});
  await sleep(500);
  await shot(page, '03-portrait-dialogue-mobile');

  // OW town
  await page.evaluate(() => {
    const G = window.__game;
    const t=document.getElementById('toast');
    if(t){ t.classList.remove('on','toast-tip'); t.textContent=''; }
    G.S.flags = G.S.flags || {};
    G.S.flags.visual45Tip = 1; G.S.flags.visual46Tip = 1; G.S.flags.visual48Tip = 1; // suppress tip during shot
    G.OW.showOverworld(G.S);
    try { G.hud?.(); } catch(_) {}
    // force hud refresh without ort chip
    try {
      const el=document.getElementById('hud');
      if(el) el.querySelectorAll('.chip').forEach(c=>{ if((c.textContent||'').includes('Kristall')||(c.textContent||'').includes('📍')) c.remove(); });
    } catch(_){}
  });
  await sleep(900);
  await shot(page, '04-overworld-town-mobile');

  // Dialogue
  await page.evaluate(() => {
    const G = window.__game;
    const n = Object.keys(G.S.world.npcs)[0];
    G.S.world.npcs[n].mood = 'wütend';
    try { G.Know.ensurePerson(G.S, n, G.S.world.npcs[n]); if(G.S.know?.people?.[n]) G.S.know.people[n].knownName=false; } catch(_){}
    G.OW.showDialogue(n, 'Die Wache hat Fragen. Antworte weise.', 'guard');
  });
  await sleep(300);
  await shot(page, '05-ow-dialogue-mobile');
  await page.evaluate(() => window.__game.OW.hideDialogue());

  // Dungeon — force dungeon floorplan (enterDungeon alone may leave village tokens in ort)
  await page.evaluate(() => {
    const G = window.__game;
    try {
      G.C39.enterDungeon(G.S, 'Verlies Katakomben');
      if(G.S.world?.scene) G.S.world.scene.ort='Verlies Katakomben · Raum 1';
      G.OW.showOverworld(G.S);
      G.C41.refreshMinimap?.(G.S);
    } catch (_) {}
  });
  await sleep(800);
  await shot(page, '06-dungeon-mobile');

  // Battle
  await page.evaluate(async () => {
    const G = window.__game;
    const { enemyById } = await import('./enemies.js');
    G.Battle.startBattle(G.S, { enemies: [enemyById('boss_ogre')], dungeonBoss: true, atbMode: 'wait', scripted: true });
  });
  await sleep(900);
  await shot(page, '07-battle-mobile');
  await page.evaluate(() => {
    const G = window.__game;
    const root = document.getElementById('battleRoot') || document.querySelector('.battle-root');
    if (root) { root.classList.add('hidden'); root.style.display='none'; root.innerHTML=''; }
    try { G.Battle.__forceHide?.(); } catch (_) {}
    try { G.OW?.hideOverworld?.(); } catch (_) {}
    document.getElementById('overworld')?.classList.add('hidden');
    document.querySelectorAll('.battle-end,.skill-banner').forEach(el=>el.classList.add('hidden'));
    document.body.className = 'pixel-jrpg';
    document.getElementById('stage')?.classList.remove('hidden');
    document.getElementById('titleScreen')?.classList.add('hidden');
    const menu = document.getElementById('menu');
    if (menu) { menu.classList.remove('hidden'); menu.style.display=''; menu.style.zIndex='9999'; }
    G.openMenu?.('hub');
  });
  await sleep(600);
  await shot(page, '08-menu-mobile');

  // Craft / shop — real pixel-shop chrome
  await page.evaluate(() => {
    const G = window.__game;
    let wrap = document.createElement('div');
    wrap.id = 'auditCraft';
    wrap.className = 'pixel-shop';
    wrap.innerHTML = '<div class="pixel-shop-panel"><div class="pixel-shop-head">⚒ Werkstatt <span></span><button type="button" class="px-x" id="auditCraftX">✕</button></div><div class="pixel-shop-meta">Rezepte · Material · Upgrade</div><div class="craft-wrap" id="auditCraftBody"></div><div class="pixel-shop-foot">Gold: '+(G.S?.gold|G.S?.st?.gold|0)+'</div></div>';
    document.body.appendChild(wrap);
    const body = document.getElementById('auditCraftBody');
    try { G.UI17.renderCraft(body, G.S, { toast: () => {}, save: () => {} }); } catch (e) { body.textContent = String(e); }
  });
  await sleep(300);
  await shot(page, '09-craft-shop-mobile');
  await page.evaluate(() => { document.getElementById('auditCraft')?.remove(); document.querySelector('.pixel-shop')?.remove(); });

  // Zombie genre town (settings rarely changes — use slot for genre polish)
  await boot(page, 'zombie');
  await page.evaluate(() => {
    const G = window.__game;
    G.S.flags = G.S.flags || {}; G.S.flags.visual45Tip=1; G.S.flags.visual46Tip=1; G.S.flags.visual48Tip=1;
    G.OW.showOverworld(G.S);
  });
  await sleep(900);
  await shot(page, '10-zombie-town-mobile');

  // Desktop
  await page.setViewport({ width: 1920, height: 1080, isMobile: false, hasTouch: false });
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
  await page.evaluate(() => {
    const G = window.__game;
    const root = document.getElementById('battleRoot') || document.querySelector('.battle-root');
    if (root) { root.classList.add('hidden'); root.style.display='none'; root.innerHTML=''; }
    try { G.Battle.__forceHide?.(); } catch (_) {}
    try { G.OW?.hideOverworld?.(); } catch (_) {}
    document.body.className = 'pixel-jrpg';
    document.getElementById('stage')?.classList.remove('hidden');
    const menu = document.getElementById('menu');
    if (menu) { menu.classList.remove('hidden'); menu.style.display=''; menu.style.zIndex='9999'; }
    G.openMenu?.('hub');
  });
  await sleep(600);
  await shot(page, '13-menu-desktop');

  // cyberpunk genre OW (mobile)
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await boot(page, 'cyberpunk');
  await page.evaluate(() => { const G = window.__game; G.OW.showOverworld(G.S); });
  await sleep(500);
  await shot(page, '14-overworld-cyber-mobile');

  console.log('AUDIT_DONE', TAG, OUT);
  await browser.close();
  server.close();
})().catch(e => { console.error(e); process.exit(1); });
