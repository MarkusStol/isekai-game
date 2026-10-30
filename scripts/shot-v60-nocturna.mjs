#!/usr/bin/env node
/** v60 visual QA: Nocturna hubs + battle BGs + menus, mobile+desktop */
import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT=path.join(path.dirname(fileURLToPath(import.meta.url)),'..');
const PORT=8892;
const OUT='/workspace/isekai-game-shots/v60-after';
const VER='60';
fs.mkdirSync(OUT,{recursive:true});
const log=[];
const issues=[];

function serve(){
  return new Promise(res=>{
    const s=http.createServer((req,res2)=>{
      let p=decodeURIComponent((req.url||'/').split('?')[0]); if(p==='/')p='/index.html';
      const fp=path.join(ROOT,p.replace(/^\//,''));
      if(!fp.startsWith(ROOT)||!fs.existsSync(fp)||fs.statSync(fp).isDirectory()){res2.writeHead(404);res2.end();return;}
      const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json','.ogg':'audio/ogg'};
      res2.writeHead(200,{'Content-Type':types[path.extname(fp)]||'application/octet-stream','Cache-Control':'no-store'});
      fs.createReadStream(fp).pipe(res2);
    });
    s.listen(PORT,()=>res(s));
  });
}

async function shot(page, name){
  const fp=path.join(OUT, name+'.png');
  await page.screenshot({path:fp, fullPage:false});
  log.push({shot:name});
  return fp;
}

async function boot(page){
  await page.goto(`http://127.0.0.1:${PORT}/?v=${VER}&pt=1`,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(v=>window.__game?.VER===v,{timeout:45000},VER);
  await page.evaluate(async()=>{
    localStorage.clear();
    try{ const regs=await navigator.serviceWorker?.getRegistrations?.()||[]; await Promise.all(regs.map(r=>r.unregister())); }catch(_){}
  });
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(v=>window.__game?.VER===v,{timeout:45000},VER);
  await page.evaluate(async()=>{
    window.__FAST=true; window.__SKIP_REMOTE_IMG=true; window.__FORCE_CSS_SCENES=true; window.__PLAYTEST=true;
    window.__setCfg({mode:'offline', battleDiff:'story', atbMode:'active'});
    const g=window.__game;
    await g.newLife('daemon',{lives:0,soul:0,keptSkills:[]},{skipSetup:true,name:'Noctis'});
    g.S.setup={done:true}; g.S.flags=Object.assign(g.S.flags||{},{onboarded:true,introDone:true});
    g.S.cfgBattleDiff='story'; g.S.cfgAtbMode='active';
    g.S.st.hp=g.S.st.maxhp=180; g.S.st.mp=g.S.st.maxmp=80; g.S.st.gold=200; g.S.st.str=22; g.S.st.lvl=4;
    g.C60.migrateV60(g.S);
    g.enterPlay();
    document.getElementById('title')?.classList.add('hidden');
    document.getElementById('stage')?.classList.remove('hidden');
  });
  await new Promise(r=>setTimeout(r,700));
  const ver=await page.evaluate(()=>window.__game?.VER);
  if(String(ver)!==VER) issues.push({type:'ver',ver});
  return ver;
}

async function showOrt(page, ort){
  return page.evaluate((ort)=>{
    const g=window.__game;
    g.S.world=g.S.world||{}; g.S.world.scene=g.S.world.scene||{};
    g.S.world.scene.ort=ort;
    g.S.genre='daemon'; g.S.role='daemon';
    try{ g.OW.mountOverworld({}); }catch(_){}
    try{ g.OW.showOverworld(g.S); }catch(e){ return {ok:false, err:String(e)}; }
    const d=g.OW.__debug?.() || {};
    return {ok:true, preset:d.map?.preset, name:d.map?.name, overhead:d.map?.overhead, chests:(d.chests||[]).length, tilesOk:!!d.map?.w};
  }, ort);
}

async function startBattle(page, ort, foeId){
  return page.evaluate(async (ort, foeId)=>{
    const g=window.__game;
    g.S.world.scene.ort=ort;
    try{ g.OW?.hideOverworld?.(); }catch(_){}
    const en=await import('./enemies.js?v='+g.VER);
    const foe=en.enemyById(foeId)||en.enemyById('demon_imp');
    const bg=en.battleBgFor(g.S);
    if(g.Battle?.startBattle) await g.Battle.startBattle(g.S,{foes:[foe], bg, blurb:'v60'});
    else if(g.openPendingEncounter) {
      g.S._pendingEncounter={enemies:[foe],bg}; 
    }
    return {bg, foe:foe?.id};
  }, ort, foeId);
}

async function runViewport(browser, tag, w, h, mobile){
  const page=await browser.newPage();
  page.on('pageerror', e=>issues.push({pageerror:String(e.message||e), tag}));
  await page.setViewport({width:w, height:h, isMobile:!!mobile, hasTouch:!!mobile, deviceScaleFactor:1});
  const ver=await boot(page);
  await shot(page, `${tag}-01-boot`);

  // Literary VN open
  const labels=await page.evaluate(()=>[...document.querySelectorAll('#choices button')].map(b=>b.textContent).slice(0,12));
  log.push({tag, labels});
  await shot(page, `${tag}-02-vn-c1`);

  // Sidequest choice visible?
  const hasSide=labels.some(l=>/Register|Side|Geheimnis/i.test(l||''));
  if(!hasSide) issues.push({tag, type:'missing-side-label', labels});

  // Overworld hubs
  for(const [ort, slug] of [
    ['Thronsaal der Nacht','throne'],
    ['Grenzpass','pass'],
    ['Ruinen von Solmir','crypt'],
    ['Kathedrale des Lichts','cathedral'],
  ]){
    const r=await showOrt(page, ort);
    log.push({tag, ort, r});
    await new Promise(t=>setTimeout(t,900));
    await shot(page, `${tag}-03-ow-${slug}`);
    if(!r.ok) issues.push({tag, type:'ow-fail', ort, r});
  }

  // Battles
  for(const [ort, foe, slug] of [
    ['Thronsaal der Nacht','demon_imp','throne'],
    ['Grenzpass','hellhound','pass'],
    ['Ruinen von Solmir','boss_lich','crypt'],
    ['Kathedrale des Lichts','boss_archfiend','cathedral'],
  ]){
    const br=await startBattle(page, ort, foe);
    log.push({tag, battle:br});
    await new Promise(t=>setTimeout(t,1100));
    await shot(page, `${tag}-04-battle-${slug}`);
    await page.evaluate(()=>{
      try{ window.__game?.Battle?.endBattle?.({result:'flee'}); }catch(_){}
      try{ document.getElementById('battle')?.remove(); }catch(_){}
      try{ document.querySelector('.battle-root,.battle-stage')?.closest('#overlay')?.remove(); }catch(_){}
    });
    await new Promise(t=>setTimeout(t,300));
  }

  // Menu
  await page.evaluate(()=>{ try{ window.__game?.openMenu?.(); }catch(_){} });
  await new Promise(t=>setTimeout(t,500));
  await shot(page, `${tag}-05-menu`);

  // Story literary deeper scene
  await page.evaluate(()=>{
    const g=window.__game;
    try{ g.OW?.hideOverworld?.(); }catch(_){}
    g.S.campaign.sceneId='c1_side'; g.S.campaign.mode='scene';
    g.applyJrpgPack(g.C60.resolveChoice(g.S,{next:'c1_side'},{}));
  });
  await new Promise(t=>setTimeout(t,500));
  await shot(page, `${tag}-06-side-velka`);

  await page.evaluate(()=>{
    const g=window.__game;
    g.S.campaign.sceneId='c4_title'; g.S.campaign.chapterIdx=3;
    g.applyJrpgPack(g.C60.resolveChoice(g.S,{next:'c4_title'},{}));
  });
  await new Promise(t=>setTimeout(t,500));
  await shot(page, `${tag}-07-endings`);

  const dbg=await page.evaluate(()=>({
    ver:window.__game.VER,
    flags:window.__game.S?.flags,
    scene:window.__game.S?.campaign?.sceneId,
    nocturna:window.__game.S?.flags?.nocturnaTiles,
  }));
  log.push({tag, dbg});
  await page.close();
}

const server=await serve();
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']});
try{
  await runViewport(browser,'mobile',390,844,true);
  await runViewport(browser,'desktop',1280,720,false);
}catch(e){
  issues.push({type:'fatal', err:String(e&&e.stack||e)});
  console.error(e);
}
await browser.close();
server.close();
fs.writeFileSync(path.join(OUT,'v60-shot-log.json'), JSON.stringify({log,issues},null,2));
console.log(JSON.stringify({shots:log.filter(x=>x.shot).length, nIssues:issues.length, issues:issues.slice(0,8)},null,2));
process.exit(issues.some(i=>i.type==='fatal')?2:0);
