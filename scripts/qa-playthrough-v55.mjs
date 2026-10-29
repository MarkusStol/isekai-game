#!/usr/bin/env node
/** v55 QA: zombie + cyberpunk new-player, desktop keyboard, returning v20 save (~15min sim) */
import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = '/workspace/isekai-game-shots/v55-qa';
fs.mkdirSync(OUT, { recursive: true });
const PORT = 8875;
const VER = '55';
const issues = [];
const crashes = [];
function note(sev, where, msg){ issues.push({sev, where, msg}); console.log(`[${sev}] ${where}: ${msg}`); }
function crash(where, msg){ crashes.push({where, msg}); note('crash', where, msg); }

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
function fakeOldSave(ver){
  return {
    ver:String(ver), role:'held', cls:0, pc:{name:'Alt'+ver}, setup:{done:true},
    st:{lvl:3,hp:30,maxhp:50,mp:12,maxmp:30,str:10,cha:9,ruf:0,gold:20,xp:40},
    world:{
      scene:{ort:'Marktplatz von Solari',anwesend:['Lyra'],zeit:'Mittag'},
      npcs:{Lyra:{e:'🗡️',art:'Späherin',ort:'Marktplatz von Solari',alive:true,romance:true,geschlecht:'w',stimme:'knapp'}}
    },
    hist:[], log:[{k:'n',t:'Markt.'}], flags:{}, romance:{Lyra:{affection:10,trust:2,stage:1}},
    quests:{main:{act:0,done:[],objectives:[]},side:[]},
    needs:{hunger:30,fatigue:20}, home:{owned:false,stage:0,materials:{}},
    skills:[], inv:[], turn:5, heat:0, cal:{day:2,hour:12,minute:0}, choices:['Umsehen']
  };
}

async function bootGenre(page, genre, name='Alex'){
  await page.goto(`http://127.0.0.1:${PORT}/?v=${VER}&g=${genre}`, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForFunction((v) => window.__game?.VER === v, { timeout: 30000 }, VER);
  const errs=[];
  page.removeAllListeners('pageerror');
  page.on('pageerror', e => { errs.push(String(e.message||e)); crash(genre, String(e.message||e).slice(0,160)); });
  await page.evaluate(async (genre, name) => {
    const G=window.__game;
    window.__PLAYTEST=true; window.__gateFastCut=true; window.__FAST=true;
    window.__setCfg?.({mode:'offline',gkey:'',pollenKey:''});
    try{localStorage.setItem('isekai_audio_on','0')}catch(_){}
    await G.startProcedural?.(genre, name);
    G.S.setup={done:true}; G.S.flags={...(G.S.flags||{}),onboarded:true,visual55:true};
    try{ G.C55?.migrateV55?.(G.S); }catch(_){}
    try{ document.getElementById('btnCoachOk')?.click(); }catch(_){}
    try{ G.enterPlay?.(); }catch(_){}
  }, genre, name);
  await sleep(600);
  return errs;
}

async function flowGenre(page, genre, prefix){
  console.log('\n=== FLOW', genre, '===');
  await bootGenre(page, genre);
  await shot(page, `${prefix}-01-play`);
  const mode = await page.evaluate(() => ({
    hasWorld: !!window.__game?.S?.world,
    ort: window.__game?.S?.world?.scene?.ort,
    genre: window.__game?.S?.genre,
    vn: document.getElementById('vnText')?.textContent?.slice(0,120),
    choices: [...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim()).slice(0,5),
    tags: (()=>{ try{ const n=window.__game.S.world.graph?.nodes?.[window.__game.S.world.scene.ort]; return n?.tags||[]; }catch(_){return[]} })(),
  }));
  console.log('MODE', JSON.stringify(mode));
  if (!mode.hasWorld) crash(genre, 'no world');
  if (!mode.vn || mode.vn.length < 8) note('confusing', genre+'-intro', 'empty intro');
  if (/undefined|null|NaN|\[object/.test(mode.vn||'')) crash(genre, 'garbage VN');

  // advance + look for Markt by tags
  for (let i=0;i<3;i++){
    await page.evaluate(() => {
      const b=[...document.querySelectorAll('#choices button')].find(x=>x.offsetParent!==null);
      b?.click();
    });
    await sleep(350);
  }
  await shot(page, `${prefix}-02-town`);
  // Markt
  const shop = await page.evaluate(() => {
    const G=window.__game;
    try{ G.renderChoices?.(); }catch(_){}
    // force re-render choices
    try{
      const list=[...(G.S.choices||[])];
      // call through visible button or API
      const btn=[...document.querySelectorAll('#choices button')].find(b=>/^(Zum Markt|Markt besuchen|Zum Laden|Einkaufen)\b/i.test((b.textContent||'').trim()));
      if (btn){ btn.click(); return {via:'choice', label:btn.textContent}; }
      G.openPixelShop?.('Markt');
      const el=document.getElementById('pixelShop');
      return {via:'api', open: el && !el.classList.contains('hidden'), tags: G.S.world.graph?.nodes?.[G.S.world.scene.ort]?.tags};
    }catch(e){ return {err:String(e)}; }
  });
  console.log('SHOP', JSON.stringify(shop));
  await sleep(400);
  await shot(page, `${prefix}-03-shop`);
  if (shop.err) crash(genre+'-shop', shop.err);
  await page.evaluate(() => document.getElementById('pixelShop')?.classList.add('hidden'));

  // NPC
  await page.evaluate(async () => {
    const G=window.__game;
    await G.act?.('hallo');
  });
  await sleep(500);
  await shot(page, `${prefix}-04-npc`);

  // Fight talk + fight
  await page.evaluate(async () => {
    const G=window.__game;
    const { enemyById } = await import('./enemies.js');
    const id = G.S.genre==='cyberpunk' ? (enemyById('street_thug')||enemyById('drone')||enemyById('boss_ogre'))
             : G.S.genre==='zombie' ? (enemyById('walker')||enemyById('runner')||enemyById('boss_ogre'))
             : enemyById('boss_ogre');
    G.Battle.startBattle(G.S, { enemies:[id], atbMode:'wait', scripted:true, dungeonBoss:!!id.boss });
    const B=G.Battle.getBattle();
    const hero=B.party.find(p=>p.kind==='hero')||B.party[0];
    [['Lyra','dieb'],['Orren','magier'],['Garrick','krieger']].forEach(([nm,job],i)=>{
      if(B.party.length>=4)return;
      B.party.push({_iid:'c'+i,kind:'companion',name:nm,job,alive:true,hp:80,maxhp:80,mp:30,maxmp:30,atb:20,row:'back',npcRef:nm});
    });
    hero.atb=100; B.selecting={actor:hero, mode:'bossTalk'}; B.atbMode='wait';
    G.Battle.renderBattleUI();
  });
  await sleep(500);
  await shot(page, `${prefix}-05-talk`);
  const talk = await page.evaluate(() => ({
    wait: document.querySelector('.battle-atb-mode')?.textContent,
    odds: [...document.querySelectorAll('.bts-odds')].map(e=>e.textContent),
    plate: !!document.querySelector('.foe-plate-dock'),
    english: [...document.body.innerText.matchAll(/\b(WAIT|Attack|Skills|Items|Flee)\b/g)].map(m=>m[0]),
  }));
  console.log('TALK', JSON.stringify(talk));
  if (talk.wait && !/Warten|Aktiv/.test(talk.wait)) note('inconsistent', genre+'-battle', 'ATB not DE: '+talk.wait);
  if (talk.english?.length) note('inconsistent', genre+'-battle', 'EN: '+talk.english.join(','));

  await page.evaluate(() => {
    const G=window.__game; const B=G.Battle.getBattle();
    const hero=B.party.find(p=>p.kind==='hero')||B.party[0];
    B.selecting={actor:hero, mode:'main'}; G.Battle.renderBattleUI();
  });
  await sleep(300);
  await shot(page, `${prefix}-06-fight`);

  // menu / home / atlas
  await page.evaluate(() => { window.__game.Battle.__forceHide?.(); window.__game.S.home={owned:false}; window.__game.openMenu?.('home'); });
  await sleep(400);
  await shot(page, `${prefix}-07-home`);
  const home = await page.evaluate(() => ({
    art: !!document.querySelector('.home-claim-art'),
    menuOpen: document.body.classList.contains('menu-open'),
    battleHidden: (()=>{ const b=document.querySelector('.battle-root:not(.hidden)'); if(!b) return true; return getComputedStyle(b).visibility==='hidden'; })(),
    tabsCompact: document.getElementById('menuTabs')?.classList.contains('tabs-compact'),
    visibleTabs: [...document.querySelectorAll('#menuTabs button')].filter(b=>b.offsetParent!==null).map(b=>b.textContent.trim()),
  }));
  console.log('HOME', JSON.stringify(home));
  if (!home.art) note('ugly', genre+'-home', 'missing claim art');
  if (!home.battleHidden) note('ugly', genre+'-home', 'battle visible under menu');

  await page.evaluate(() => window.__game.openMenu?.('atlas'));
  await sleep(500);
  await shot(page, `${prefix}-08-atlas`);
  const atlas = await page.evaluate(() => ({
    labs: document.querySelectorAll('.atlas-dom-lab').length,
    canvas: !!document.querySelector('.map-canvas, canvas.map-canvas, .atlas-map-stage canvas'),
  }));
  console.log('ATLAS', JSON.stringify(atlas));

  // travel + dungeon-ish
  await page.evaluate(async () => {
    const G=window.__game; G.closeMenu?.();
    const places=Object.keys(G.S.world?.graph?.nodes||{});
    const dest=places.find(p=>p!==G.S.world.scene.ort)||places[1];
    if (dest && G.travelTo) G.travelTo(dest,{});
    else await G.act?.('Ich gehe weiter');
  });
  await sleep(500);
  await shot(page, `${prefix}-09-travel`);
  await page.evaluate(() => {
    const G=window.__game;
    G.S.flags={...(G.S.flags||{}), inDungeon:true};
    const vn=document.getElementById('vnText');
    if (vn) vn.textContent='Enge Gänge. Etwas kratzt an den Wänden. Deine Lampe flackert.';
  });
  await shot(page, `${prefix}-10-dungeon`);

  // save
  await page.evaluate(() => { const G=window.__game; G.S.flags.qa55=true; G.save?.(); });
}

(async () => {
  const server = await serve();
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--window-size=390,844'] });
  const page = await browser.newPage();
  page.on('pageerror', e => crash('global', String(e.message||e).slice(0,160)));

  // --- iPhone zombie ---
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await flowGenre(page, 'zombie', 'z');

  // --- iPhone cyberpunk ---
  await flowGenre(page, 'cyberpunk', 'c');

  // --- SE boss-talk + menu tabs ---
  await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
  await bootGenre(page, 'cyberpunk');
  await page.evaluate(async () => {
    const G=window.__game;
    const { enemyById } = await import('./enemies.js');
    G.Battle.startBattle(G.S, { enemies:[enemyById('street_thug')||enemyById('boss_ogre')], atbMode:'wait', scripted:true });
    const B=G.Battle.getBattle();
    const hero=B.party.find(p=>p.kind==='hero')||B.party[0];
    hero.atb=100; B.selecting={actor:hero, mode:'bossTalk'}; B.atbMode='wait';
    G.Battle.renderBattleUI();
  });
  await sleep(400);
  await shot(page, 'se-boss-talk');
  const seTalk = await page.evaluate(() => {
    const odds=[...document.querySelectorAll('.bts-odds')].map(e=>e.getBoundingClientRect());
    const labs=[...document.querySelectorAll('.bts-lab')].map(e=>e.getBoundingClientRect());
    const clipped = odds.some(o => o.bottom > window.innerHeight-2 || o.right > window.innerWidth-2);
    return { clipped, odds:odds.length, hintsVisible: [...document.querySelectorAll('.bts-hint')].some(h=>h.offsetParent!==null && getComputedStyle(h).display!=='none') };
  });
  console.log('SE_TALK', JSON.stringify(seTalk));
  if (seTalk.clipped) note('ugly', 'se-talk', 'odds clipped');
  if (seTalk.hintsVisible) note('ugly', 'se-talk', 'hints still visible on SE');

  await page.evaluate(() => { window.__game.Battle.__forceHide?.(); window.__game.openMenu?.('hub'); });
  await sleep(300);
  await shot(page, 'se-menu-tabs');
  const seMenu = await page.evaluate(() => ({
    compact: document.getElementById('menuTabs')?.classList.contains('tabs-compact'),
    visible: [...document.querySelectorAll('#menuTabs button')].filter(b=>b.offsetParent!==null).map(b=>b.textContent.trim()),
  }));
  console.log('SE_MENU', JSON.stringify(seMenu));
  if (!seMenu.compact) note('ugly', 'se-menu', 'tabs not compact');
  if ((seMenu.visible?.length||0) > 12) note('ugly', 'se-menu', 'too many tabs visible: '+seMenu.visible.length);

  // --- Desktop keyboard ---
  await page.setViewport({ width: 1920, height: 1080, isMobile: false, hasTouch: false });
  await bootGenre(page, 'zombie', 'DeskAlex');
  await shot(page, 'desk-01-play');
  // keyboard: focus input, type, Enter
  const kb = await page.evaluate(async () => {
    const G=window.__game;
    const txt=document.getElementById('txt');
    if (!txt) return {err:'no txt'};
    txt.disabled=false; txt.focus(); txt.value='ich sehe mich um';
    const before=(document.getElementById('vnText')?.textContent||'').trim();
    const form=document.getElementById('inputRow');
    form?.requestSubmit();
    let last={};
    for (let i=0;i<40;i++){
      await new Promise(r=>setTimeout(r,250));
      const vn=(document.getElementById('vnText')?.textContent||'').trim();
      last={vn, busy:document.body.classList.contains('busy'), same:vn===before};
      if (!last.busy && !last.same && vn.length>=8) break;
    }
    return last;
  });
  console.log('KB', JSON.stringify({vn:(kb.vn||'').slice(0,80), busy:kb.busy, same:kb.same}));
  await shot(page, 'desk-02-keyboard-look');
  if (kb.err) crash('desktop-kb', kb.err);
  if (kb.busy || kb.same) note('broken', 'desktop-kb', 'keyboard act stuck');

  // Esc / number keys if any — open menu with 'm' or click
  await page.keyboard.press('Escape');
  await sleep(200);
  await page.evaluate(() => window.__game.openMenu?.('hub'));
  await sleep(300);
  await shot(page, 'desk-03-menu');
  // Arrow / Tab through choices
  await page.evaluate(() => window.__game.closeMenu?.());
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await sleep(400);
  await shot(page, 'desk-04-choice-enter');

  // battle keyboard-ish
  await page.evaluate(async () => {
    const G=window.__game;
    const { enemyById } = await import('./enemies.js');
    G.Battle.startBattle(G.S, { enemies:[enemyById('walker')||enemyById('slime')], atbMode:'wait', scripted:true });
    const B=G.Battle.getBattle();
    const hero=B.party.find(p=>p.kind==='hero')||B.party[0];
    hero.atb=100; B.selecting={actor:hero, mode:'main'}; B.atbMode='wait';
    G.Battle.renderBattleUI();
  });
  await sleep(400);
  await shot(page, 'desk-05-battle');
  // click Angriff via keyboard focus
  await page.evaluate(() => {
    const btn=[...document.querySelectorAll('.bcm-lg, .bcm')].find(b=>/Angriff/i.test(b.textContent||''));
    btn?.focus(); btn?.click();
  });
  await sleep(300);
  await shot(page, 'desk-06-attack');

  // --- Returning player: v20 save, simulate ~15 min (many acts) ---
  console.log('\n=== RETURNING v20 ===');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto(`http://127.0.0.1:${PORT}/?v=${VER}`, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForFunction((v) => window.__game?.VER === v, { timeout: 30000 }, VER);
  await page.evaluate(async () => {
    localStorage.clear();
    window.__setCfg?.({mode:'offline'});
    try{
      // close Persist's cached IDB handle if any, then wipe
      try{ const db = await new Promise((res,rej)=>{ const r=indexedDB.open('isekai_db_v13'); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); }); db.close(); }catch(_){}
      await new Promise((res)=>{
        const r=indexedDB.deleteDatabase('isekai_db_v13');
        r.onsuccess=r.onerror=r.onblocked=()=>res();
        setTimeout(res,800);
      });
    }catch(_){}
  });
  const v20 = fakeOldSave('20');
  v20.saveSeq = 999001; v20.turn = 5; v20.savedAt = Date.now();
  await page.evaluate((save) => {
    localStorage.setItem('isekai_save_v1', JSON.stringify(save));
    localStorage.setItem('isekai_save_meta_v1', JSON.stringify({seq:save.saveSeq,turn:save.turn,savedAt:save.savedAt,lsOk:true,idbOk:false}));
    window.__setCfg?.({mode:'offline'});
  }, v20);
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForFunction((v) => window.__game?.VER === v, { timeout: 30000 }, VER);
  await page.evaluate(() => document.getElementById('btnContinue')?.click());
  await sleep(1500);
  await shot(page, 'ret-01-continued');
  const ret0 = await page.evaluate(() => ({
    hasS: !!window.__game?.S,
    ver: window.__game?.S?.ver,
    ort: window.__game?.S?.world?.scene?.ort,
    name: window.__game?.S?.pc?.name,
    pageErr: null,
  }));
  console.log('RET0', JSON.stringify(ret0));
  if (!ret0.hasS) crash('returning-v20', 'no S after continue');

  // ~15 min sim: 20 turns of mixed actions (gate-fast)
  const acts = [
    'hallo','ich schaue mich um','ich rede mit Lyra','was gibt es zu kaufen',
    'ich gehe zum Markt','ich kaufe Brot','ich ruhe mich aus','nach Norden',
    'wer bist du','erzähl mir von hier','ich prüfe meinen Status','ich öffne den Codex',
    'ich gehe weiter','ich bin bereit zu kämpfen','ich flüchte','danke',
    'was ist das für ein Ort','ich suche eine Herberge','Zeit vergeht','ich speichere'
  ];
  let retFails=0;
  for (let i=0;i<acts.length;i++){
    const a=acts[i];
    const row = await page.evaluate(async (a) => {
      const G=window.__game;
      if (!G?.S) return {ok:false, reason:'no-S'};
      try{ if(G.S.flags){ delete G.S.flags._offerEncounter; delete G.S.flags.narratorCombat; } }catch(_){}
      // special UI actions
      if (/Status/i.test(a)){ G.openMenu?.('status'); return {ok:true, ui:'status'}; }
      if (/Codex/i.test(a)){ G.openMenu?.('codex'); return {ok:true, ui:'codex'}; }
      if (/speicher/i.test(a)){ G.save?.(); return {ok:true, ui:'save'}; }
      if (/Markt|kaufen/i.test(a)){ try{ G.closeMenu?.(); G.openPixelShop?.('Markt'); return {ok:true, ui:'shop'}; }catch(e){ return {ok:false, reason:String(e)}; } }
      const before=(document.getElementById('vnText')?.textContent||'').trim();
      const p=G.act(a);
      const to=new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),15000));
      try{ await Promise.race([p,to]); }catch(e){ return {ok:false, reason:String(e.message||e)}; }
      try{ G.Battle?.__forceHide?.(); document.getElementById('battle')?.classList.add('hidden'); document.querySelector('.battle-root')?.classList.add('hidden'); }catch(_){}
      const vn=(document.getElementById('vnText')?.textContent||'').trim();
      return {ok: vn.length>=4 && !document.body.classList.contains('busy'), vn:vn.slice(0,80), same:vn===before, busy:document.body.classList.contains('busy')};
    }, a);
    if (!row.ok){ retFails++; note('broken', 'returning-v20', `#${i} ${a}: ${row.reason||row.busy&&'busy'||'fail'}`); }
    if (i===5 || i===12 || i===19) await shot(page, `ret-turn-${i}`);
  }
  console.log('RET_FAILS', retFails);
  await shot(page, 'ret-99-end');

  // Companion spy fidelity check in battle
  await page.evaluate(async () => {
    const G=window.__game;
    if (!G.S) return;
    try{ G.closeMenu?.(); document.getElementById('menu')?.classList.add('hidden'); }catch(_){}
    const { enemyById } = await import('./enemies.js');
    G.Battle.startBattle(G.S, { enemies:[enemyById('slime')||enemyById('walker')], atbMode:'wait', scripted:true });
    const B=G.Battle.getBattle();
    B.party = B.party.filter(p=>p.kind==='hero').slice(0,1);
    B.party.push({_iid:'spy1',kind:'companion',name:'Lyra',job:'dieb',alive:true,hp:80,maxhp:80,mp:30,maxmp:30,atb:40,row:'back',npcRef:'Lyra'});
    const hero=B.party.find(p=>p.kind==='hero')||B.party[0];
    hero.atb=100; B.selecting={actor:hero,mode:'main'}; B.atbMode='wait';
    G.Battle.renderBattleUI();
  });
  await sleep(500);
  await shot(page, 'spy-fidelity');
  const spyInfo = await page.evaluate(() => {
    const imgs=[...document.querySelectorAll('.battle-root img, #battle img, .party-card img, .battler-spr img')].map(i=>i.getAttribute('src')||'');
    return { spy: imgs.filter(s=>/spy/i.test(s)), any: imgs.slice(0,8) };
  });
  console.log('SPY_SPRITES', JSON.stringify(spyInfo));
  if (!spyInfo.spy.length) note('broken','spy-fidelity','spy_stage not in DOM: '+JSON.stringify(spyInfo.any));

  const report={ ver:VER, issues, crashes, retFails };
  fs.writeFileSync(path.join(OUT,'qa-issues.json'), JSON.stringify(report,null,2));
  console.log('QA_CRASHES', crashes.length);
  crashes.forEach((c,i)=>console.log('CRASH', i+1, c.where, c.msg));
  console.log('QA_ISSUES', issues.length);
  issues.filter(x=>x.sev!=='crash').forEach((x,i)=>console.log(`#${i+1}`, x.sev, x.where, x.msg));
  console.log('QA_DONE', OUT);
  await browser.close();
  server.close();
  // non-zero if crashes
  if (crashes.length) process.exitCode=2;
})().catch(e => { console.error(e); process.exit(1); });
