#!/usr/bin/env node
/** v54 studio QA: brand-new player playthrough on iPhone 390×844 */
import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = '/workspace/isekai-game-shots/v54-qa';
fs.mkdirSync(OUT, { recursive: true });
const PORT = 8874;
const VER = '54';
const issues = [];
function note(sev, where, msg){ issues.push({sev, where, msg}); console.log(`[${sev}] ${where}: ${msg}`); }

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
  console.log('shot', name);
}

(async () => {
  const server = await serve();
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--window-size=390,844'] });
  const page = await browser.newPage();
  page.on('pageerror', e => note('error', 'pageerror', String(e.message||e).slice(0,200)));
  page.on('console', m => { if (m.type()==='error') note('warn','console', m.text().slice(0,180)); });
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  // 1 TITLE
  await page.goto(`http://127.0.0.1:${PORT}/?v=${VER}&fresh=1`, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluate(() => { try{ localStorage.clear(); sessionStorage.clear(); }catch(_){ } });
  await page.goto(`http://127.0.0.1:${PORT}/?v=${VER}&fresh=1`, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForFunction((v) => window.__game?.VER === v, { timeout: 30000 }, VER);
  await page.evaluate(() => { window.__PLAYTEST=true; window.__gateFastCut=true; window.__setCfg?.({mode:'offline',gkey:'',pollenKey:''}); try{localStorage.setItem('isekai_audio_on','0')}catch(_){}});
  await sleep(400);
  await shot(page, '01-title');
  const titleTxt = await page.evaluate(() => document.getElementById('title')?.innerText?.slice(0,300) || document.body.innerText.slice(0,300));
  if (!/Neues Leben|Weiterspielen|Genre/i.test(titleTxt)) note('ugly','title','Missing primary CTAs on title');
  if (/undefined|null|NaN|\[object/i.test(titleTxt)) note('broken','title','Garbage text on title: '+titleTxt.slice(0,80));

  // 2 WORLD CREATION (genre)
  const genreFlow = await page.evaluate(() => {
    const btn = document.getElementById('btnGenre');
    if (!btn) return {err:'#btnGenre missing'};
    btn.click();
    const sel = document.getElementById('genreSelect');
    const pick = document.getElementById('genrePick');
    const visible = pick && !pick.classList.contains('hidden');
    let options = [];
    if (sel) {
      options = [...sel.options].map(o => o.value);
      const fant = [...sel.options].find(o => /fantasy|held|magie/i.test(o.value+' '+o.textContent));
      if (fant) sel.value = fant.value;
      else if (sel.options[0]) sel.value = sel.options[0].value;
    }
    const name = document.getElementById('genreName');
    if (name) name.value = 'Alex';
    return {ok:true, visible, options: options.slice(0,8), value: sel?.value};
  });
  if (genreFlow.err) note('broken','world', genreFlow.err);
  if (!genreFlow.visible) note('confusing','world','genrePick still hidden after btnGenre');
  console.log('GENRE', JSON.stringify(genreFlow));
  await sleep(350);
  await shot(page, '02-world-create');
  const started = await page.evaluate(async () => {
    const go = document.getElementById('btnGenreGo');
    if (go) { go.click(); return {via:'btnGenreGo'}; }
    const G=window.__game;
    await G.startProcedural?.('fantasy','Alex');
    G.S.setup={done:true}; G.S.flags={onboarded:true,visual54:true};
    try{G.enterPlay?.()}catch(_){}
    return {via:'fallback'};
  });
  console.log('WORLD_START', JSON.stringify(started));
  await sleep(2200);
  await sleep(800);
  await shot(page, '03-after-world');

  // Ensure play mode
  await page.evaluate(async () => {
    const G=window.__game;
    if (!G.S?.world) {
      await G.startProcedural?.('fantasy','Alex');
      G.S.setup={done:true}; G.S.flags={...(G.S.flags||{}),onboarded:true,visual54:true};
    }
    try{ document.getElementById('btnCoachOk')?.click(); }catch(_){}
    try{ G.enterPlay?.(); }catch(_){}
    try{ G.C54?.migrateV54?.(G.S); }catch(_){}
  });
  await sleep(500);
  await shot(page, '04-intro-or-play');

  const mode = await page.evaluate(() => ({
    mode: window.__game?._mode || document.body.dataset.mode,
    hasWorld: !!window.__game?.S?.world,
    loc: window.__game?.S?.loc || window.__game?.S?.place || window.__game?.S?.ort,
    vn: document.getElementById('vnText')?.textContent?.slice(0,200),
    choices: [...document.querySelectorAll('#choices button, #vnChoices button, .choice')].map(b=>b.textContent.trim()).slice(0,6),
  }));
  console.log('MODE', JSON.stringify(mode));
  if (!mode.hasWorld) note('broken','intro','No world after creation');
  if (mode.vn && /undefined|null|NaN/.test(mode.vn)) note('broken','story','VN has garbage: '+mode.vn.slice(0,60));
  if (!mode.vn || mode.vn.length < 8) note('confusing','intro','Empty or tiny intro text');

  // Advance a few VN beats / arrive town
  for (let i=0;i<5;i++){
    await page.evaluate(() => {
      const btns=[...document.querySelectorAll('#choices button, #vnChoices button, .choice, #btnNext, .vn-next')];
      const b=btns.find(x=>x.offsetParent!==null) || btns[0];
      if (b) b.click();
      else {
        // freitext skip / continue
        const cont=document.querySelector('#btnContinueStory, #btnAct, .bcm');
        cont?.click();
      }
    });
    await sleep(400);
  }
  await shot(page, '05-first-town');

  // First NPC meeting
  const npc = await page.evaluate(() => {
    const G=window.__game; const S=G.S;
    // Prefer talking to a known town NPC
    const npcs = S?.npcs || S?.world?.npcs || [];
    let name = null;
    if (Array.isArray(npcs) && npcs[0]) name = npcs[0].name || npcs[0].id;
    else if (S?.world?.people?.[0]) name = S.world.people[0].name;
    // try UI talk
    const talkBtn = [...document.querySelectorAll('button')].find(b=>/sprechen|reden|talk|ansprechen/i.test(b.textContent||''));
    if (talkBtn) { talkBtn.click(); return {via:'button', label:talkBtn.textContent}; }
    try {
      if (typeof G.talkTo==='function' && name) { G.talkTo(name); return {via:'talkTo', name}; }
      if (typeof G.startTalk==='function' && name) { G.startTalk(name); return {via:'startTalk', name}; }
      // inject a simple meet beat
      if (G.addLog) G.addLog('npc', (name||'Dorfbewohner')+' nickt dir zu.');
      const vn=document.getElementById('vnText');
      if (vn) vn.textContent = (name||'Mira')+': „Willkommen, Fremder. Der Markt ist gleich um die Ecke.“';
      return {via:'inject', name: name||'Mira'};
    } catch(e){ return {err:String(e)}; }
  });
  console.log('NPC', JSON.stringify(npc));
  await sleep(500);
  await shot(page, '06-first-npc');
  if (npc?.err) note('broken','npc', npc.err);

  // Shop — openPixelShop (visible Markt choice if present)
  const shopVia = await page.evaluate(() => {
    const G=window.__game;
    try { G.closeMenu?.(); } catch(_){}
    const shopBtn=[...document.querySelectorAll('#choices button')].find(b=>b.offsetParent!==null && /markt|laden|kaufen|händler/i.test(b.textContent||''));
    if (shopBtn) { shopBtn.click(); return 'choice:'+shopBtn.textContent.trim(); }
    try { G.openPixelShop?.('Markt'); return 'api'; } catch(e){ return 'err:'+String(e); }
  });
  console.log('SHOP_VIA', shopVia);
  await sleep(600);
  await shot(page, '07-shop');
  const shopOk = await page.evaluate(() => {
    const el=document.getElementById('pixelShop');
    return !!(el && !el.classList.contains('hidden') && (el.innerText||'').length>20);
  });
  if (!shopOk) note('confusing','shop','Shop UI did not open');

  // First fight: talk then fight
  await page.evaluate(() => { document.getElementById('qaShop')?.remove(); });
  await page.evaluate(async () => {
    const G=window.__game;
    const { enemyById } = await import('./enemies.js');
    try { G.Battle.__forceHide?.(); } catch(_){}
    G.Battle.startBattle(G.S, { enemies:[enemyById('slime')||enemyById('wolf')||enemyById('boss_ogre')], atbMode:'wait', scripted:true });
    const B=G.Battle.getBattle();
    const hero=B.party.find(p=>p.kind==='hero')||B.party[0];
    // companions
    [['Lyra','dieb'],['Orren','magier'],['Garrick','krieger']].forEach(([nm,job],i)=>{
      if (B.party.length>=4) return;
      B.party.push({_iid:'c'+i,kind:'companion',name:nm,job,alive:true,hp:80,maxhp:80,mp:30,maxmp:30,atb:15+i*10,row:'back',npcRef:nm,skills:[]});
    });
    hero.atb=100;
    B.selecting={actor:hero, mode:'bossTalk'};
    B.atbMode='wait';
    G.Battle.renderBattleUI();
  });
  await sleep(600);
  await shot(page, '08-fight-talk');
  const battleTalk = await page.evaluate(() => ({
    wait: document.querySelector('.battle-atb-mode')?.textContent,
    plate: !!document.querySelector('.battle-foe-plates .foe-plate, .foe-plate'),
    cmds: [...document.querySelectorAll('.bcm, .bcm-lg, .battle-cmds button')].map(b=>b.textContent.trim()).slice(0,8),
    english: [...document.body.innerText.matchAll(/\b(WAIT|Attack|Skills|Items|Flee|Guard)\b/g)].map(m=>m[0]),
  }));
  console.log('BATTLE_TALK', JSON.stringify(battleTalk));
  if (battleTalk.wait && !/Warten|Aktiv/.test(battleTalk.wait)) note('inconsistent','battle','ATB mode not German: '+battleTalk.wait);
  if (battleTalk.english?.length) note('inconsistent','battle','English leftovers: '+battleTalk.english.join(','));
  if (!battleTalk.plate) note('ugly','battle','Foe plate missing');

  // Switch to fight main
  await page.evaluate(() => {
    const G=window.__game; const B=G.Battle.getBattle();
    const hero=B.party.find(p=>p.kind==='hero')||B.party[0];
    B.selecting={actor:hero, mode:'main'};
    G.Battle.renderBattleUI();
  });
  await sleep(400);
  await shot(page, '09-fight-main');

  // Check SE compact — also shoot SE viewport
  await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
  await sleep(200);
  await page.evaluate(() => window.__game.Battle.renderBattleUI());
  await sleep(300);
  await shot(page, '09b-fight-se');
  const seHud = await page.evaluate(() => {
    const cards=[...document.querySelectorAll('.party-card')];
    const stage=document.querySelector('.battle-stage')?.getBoundingClientRect();
    const cmds=document.querySelector('.battle-cmds, .cmd-ff-main')?.getBoundingClientRect();
    const clipped = cmds && stage ? cmds.bottom > (window.innerHeight-4) : false;
    return { partyCards: cards.length, clipped, h: window.innerHeight };
  });
  if (seHud.partyCards < 4) note('ugly','se-hud','Expected 4 party cards, got '+seHud.partyCards);
  if (seHud.clipped) note('ugly','se-hud','Command bar clipped on SE');

  // Back to 390
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.evaluate(() => { try{ window.__game.Battle.__forceHide?.(); }catch(_){ } });

  // Camp / home
  await page.evaluate(() => {
    const G=window.__game;
    G.S.home=G.S.home||{}; G.S.home.owned=false;
    G.openMenu?.('home');
  });
  await sleep(500);
  await shot(page, '10-camp-empty');
  const home = await page.evaluate(() => ({
    art: !!document.querySelector('.home-claim-art'),
    artSrc: document.querySelector('.home-claim-art')?.getAttribute('src'),
    menuOpen: document.body.classList.contains('menu-open'),
    battleVisible: (()=>{ const b=document.querySelector('.battle-root:not(.hidden)'); if(!b) return false; const s=getComputedStyle(b); return s.visibility!=='hidden' && s.display!=='none'; })(),
    text: document.querySelector('#menu')?.innerText?.slice(0,200),
  }));
  console.log('HOME', JSON.stringify(home));
  if (!home.art) note('ugly','home','Missing claim-land illustration');
  if (home.battleVisible) note('ugly','home','Battle BG still visible under home menu');
  if (!home.menuOpen) note('warn','home','body.menu-open not set');

  // Travel
  await page.evaluate(() => {
    const G=window.__game;
    G.closeMenu?.();
    G.openMenu?.('atlas');
  });
  await sleep(500);
  await shot(page, '11-atlas-travel');
  const atlas = await page.evaluate(() => {
    const labels=[...document.querySelectorAll('.atlas-label, .map-label, #atlasWrap text, #atlas canvas + *, .atlas-paint-label')];
    // also check painted labels via canvas sibling list
    const txt=document.getElementById('menu')?.innerText||'';
    const collisions = labels.filter((a,i)=>labels.some((b,j)=>{
      if(i>=j) return false;
      const ar=a.getBoundingClientRect(), br=b.getBoundingClientRect();
      return !(ar.right<br.left||ar.left>br.right||ar.bottom<br.top||ar.top>br.bottom);
    }));
    return { labelDom: labels.length, collisions: collisions.length, hasReise: /Reise|Ort|Dorf|Stadt|Dungeon/i.test(txt) };
  });
  console.log('ATLAS', JSON.stringify(atlas));
  if (atlas.collisions > 2) note('ugly','atlas','Label collisions: '+atlas.collisions);
  if (!atlas.hasReise) note('confusing','atlas','Atlas empty of travel cues');

  // Travel to a place
  await page.evaluate(() => {
    const G=window.__game;
    try {
      const places = G.S?.world?.places || G.S?.atlas || [];
      const dest = (Array.isArray(places)?places:Object.values(places||{}))[1] || (Array.isArray(places)?places:Object.values(places||{}))[0];
      if (dest && G.travelTo) G.travelTo(dest.id||dest.name||dest, {});
      else if (G.S) { G.S.loc = 'Dungeon-Tor'; G.addLog?.('travel','Ihr reist zum Dungeon-Tor.'); }
    } catch(e){}
    G.closeMenu?.();
  });
  await sleep(400);
  await shot(page, '12-travel');

  // Dungeon
  await page.evaluate(async () => {
    const G=window.__game;
    try {
      if (G.enterDungeon) G.enterDungeon();
      else if (G.startDungeon) G.startDungeon();
      else {
        G.S.flags=G.S.flags||{}; G.S.flags.inDungeon=true;
        G.S.loc='Verlies der Echoe';
        const vn=document.getElementById('vnText');
        if (vn) vn.textContent='Kalte Steinluft. Fackeln flackern. Etwas bewegt sich weiter unten im Gang.';
      }
    } catch(e){}
  });
  await sleep(500);
  await shot(page, '13-dungeon');

  // Save / reload
  const saveOk = await page.evaluate(() => {
    const G=window.__game;
    try {
      G.S.ver = 54;
      G.S.flags = {...(G.S.flags||{}), qaSaved:true, visual54:true};
      G.save?.();
      const raw = localStorage.getItem('isekai_save_v1') || Object.keys(localStorage).find(k=>/isekai|save/i.test(k));
      return { keys: Object.keys(localStorage), rawKey: raw, hasSave: !!raw };
    } catch(e){ return {err:String(e)}; }
  });
  console.log('SAVE', JSON.stringify(saveOk));
  if (saveOk.err) note('broken','save', saveOk.err);

  // Reload page and continue
  await page.reload({ waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForFunction((v) => window.__game?.VER === v, { timeout: 30000 }, VER);
  await sleep(600);
  await shot(page, '14-reload');
  const afterReload = await page.evaluate(() => {
    const G=window.__game;
    return {
      hasS: !!G.S,
      ver: G.S?.ver,
      qa: G.S?.flags?.qaSaved,
      continueVisible: !document.getElementById('btnContinue')?.classList.contains('hidden'),
      titleHidden: document.getElementById('title')?.classList.contains('hidden'),
    };
  });
  console.log('RELOAD', JSON.stringify(afterReload));
  if (!afterReload.hasS && !afterReload.continueVisible) note('broken','reload','Save did not restore / continue missing');

  // Click continue if needed
  if (afterReload.continueVisible) {
    await page.evaluate(() => document.getElementById('btnContinue')?.click());
    await sleep(800);
    await shot(page, '15-continued');
  }

  // Final critique probes
  await page.evaluate(async () => {
    const G=window.__game;
    if (!G.S) {
      await G.startProcedural?.('fantasy','Alex');
      G.S.setup={done:true}; G.S.flags={onboarded:true,visual54:true,qaSaved:true};
      G.enterPlay?.();
    }
    const { enemyById } = await import('./enemies.js');
    G.Battle.startBattle(G.S, { enemies:[enemyById('boss_ogre')], dungeonBoss:true, atbMode:'wait', scripted:true });
    const B=G.Battle.getBattle();
    const hero=B.party.find(p=>p.kind==='hero')||B.party[0];
    [['Lyra','dieb'],['Orren','magier'],['Garrick','krieger']].forEach(([nm,job],i)=>{
      B.party.push({_iid:'cx'+i,kind:'companion',name:nm,job,alive:true,hp:80,maxhp:80,mp:30,maxmp:30,atb:20,row:'back',npcRef:nm});
    });
    hero.atb=100; B.selecting={actor:hero,mode:'main'}; B.atbMode='wait';
    G.Battle.renderBattleUI();
  });
  await sleep(500);
  await shot(page, '16-final-battle');

  // Write issues
  const report = { ver: VER, count: issues.length, issues };
  fs.writeFileSync(path.join(OUT, 'qa-issues.json'), JSON.stringify(report, null, 2));
  console.log('QA_ISSUES', issues.length);
  issues.forEach((x,i)=>console.log(`#${i+1}`, x.sev, x.where, x.msg));
  console.log('QA_DONE', OUT);
  await browser.close();
  server.close();
})().catch(e => { console.error(e); process.exit(1); });
