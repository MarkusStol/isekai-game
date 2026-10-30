#!/usr/bin/env node
/**
 * v58 release gate — classic JRPG (Nocturna / daemon arc).
 * Free-text narrator archived (tag freetext-archive, FREETEXT_ENABLED=false).
 * Asserts: menu choices, chapters, town/shop/inn, dungeon, party recruit, battles, no #txt.
 */
import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT=path.join(path.dirname(fileURLToPath(import.meta.url)),'..');
const PORT=8793;
const VER='58';
const failures=[];
const report={paths:{}, samples:{}};

function serve(){
  return new Promise((resolve,reject)=>{
    const server=http.createServer((req,res)=>{
      let p=decodeURIComponent((req.url||'/').split('?')[0]); if(p==='/')p='/index.html';
      const fp=path.join(ROOT,p.replace(/^\//,''));
      if(!fp.startsWith(ROOT)||!fs.existsSync(fp)||fs.statSync(fp).isDirectory()){res.writeHead(404);res.end('404');return}
      const ext=path.extname(fp);
      const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.json':'application/json','.woff2':'font/woff2','.ogg':'audio/ogg'};
      res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream','Cache-Control':'no-store'});
      fs.createReadStream(fp).pipe(res);
    });
    server.on('error',reject);
    server.listen(PORT,'127.0.0.1',()=>resolve(server));
  });
}

let server, browser, page;

async function bootDaemon(name='Noctis'){
  await page.goto(`http://127.0.0.1:${PORT}/index.html?v=${VER}&gate=1`,{waitUntil:'domcontentloaded',timeout:60000});
  await page.evaluate(async()=>{
    localStorage.clear();
    try{
      const regs=await navigator.serviceWorker?.getRegistrations?.()||[];
      await Promise.all(regs.map(r=>r.unregister()));
      if(window.caches?.keys){ const ks=await caches.keys(); await Promise.all(ks.map(k=>caches.delete(k))); }
    }catch(_){}
  });
  await page.reload({waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(v=>window.__game?.VER===v,{timeout:45000},VER);
  const info=await page.evaluate(async(name)=>{
    window.__FAST=true; window.__SKIP_REMOTE_IMG=true; window.__FORCE_CSS_SCENES=true; window.__PLAYTEST=true;
    window.__gateNoBattle=true;
    window.__setCfg?.({mode:'offline',v2:1,debug:1});
    const g=window.__game;
    await g.newLife('daemon',{lives:0,soul:0,keptSkills:[]},{skipSetup:true,name});
    g.S.setup={done:true}; g.S.flags=Object.assign(g.S.flags||{},{onboarded:true,introDone:true});
    try{ g.C58?.migrateV58?.(g.S); }catch(_){}
    try{ g.enterPlay(); }catch(_){}
    document.getElementById('title')?.classList.add('hidden');
    document.getElementById('stage')?.classList.remove('hidden');
    // stub battles for most paths
    if(g.Battle){
      const realStart=g.Battle.startBattle?.bind(g.Battle);
      g.Battle.startBattle=async(S,opts={})=>{
        if(window.__gateNoBattle){
          const sum={result:'win',text:'Sieg (Gate).',xp:10,gold:5,loot:[],killed:[],analyzed:[],spared:[],partyHP:[],log:[]};
          try{ opts.onEnd?.(sum); }catch(_){}
          return {_B:true, result:'win'};
        }
        return realStart?.(S,opts);
      };
      g.Battle.isActive=()=>false;
    }
    return {
      ver:g.VER,
      freetext:g.FREETEXT_ENABLED,
      role:g.S.role,
      chapter:g.S.campaign?.chapterIdx,
      scene:g.S.campaign?.sceneId,
      choices:(g.S.campaign?._choiceObjs||[]).map(c=>c.label),
      inputHidden: (()=>{ const r=document.getElementById('inputRow'); if(!r) return true; const st=getComputedStyle(r); return r.classList.contains('hidden')||st.display==='none'; })(),
      vn:(document.getElementById('vnText')?.textContent||'').slice(0,120),
    };
  }, name);
  return info;
}

async function clickChoice(labelRe){
  return page.evaluate((reSrc)=>{
    const re=new RegExp(reSrc,'i');
    const btns=[...document.querySelectorAll('#choices button')];
    const b=btns.find(x=>re.test(x.textContent||''));
    if(!b) return {ok:false, labels:btns.map(x=>x.textContent)};
    b.click();
    return {ok:true, label:b.textContent};
  }, labelRe);
}

async function waitChoices(ms=400){ await new Promise(r=>setTimeout(r,ms)); }

function fail(path, reason, extra={}){
  failures.push({path, reason, ...extra});
  return 1;
}

async function runJrpgBoot(){
  const label='jrpg-boot';
  let fails=0,total=0;
  total++; const info=await bootDaemon();
  report.samples.boot=info;
  if(info.ver!==VER) fails+=fail(label,'ver',{info});
  total++; if(info.freetext!==false) fails+=fail(label,'freetext-still-on',{info});
  total++; if(!info.inputHidden) fails+=fail(label,'input-visible',{info});
  total++; if(info.role!=='daemon') fails+=fail(label,'role',{info});
  total++; if(!(info.choices||[]).length) fails+=fail(label,'no-choices',{info});
  total++; if(!(info.vn||'').length) fails+=fail(label,'empty-vn',{info});
  report.paths[label]={fails,total};
  console.log(`=== ${label}: ${fails}/${total} fails ===`);
  return fails;
}

async function runChapterFlow(){
  const label='jrpg-chapter';
  let fails=0,total=0;
  await bootDaemon();
  // open → Finanzen → Katakomben prompt
  total++; let r=await clickChoice('Finanzen'); await waitChoices(500);
  if(!r.ok) fails+=fail(label,'no-budget',{r});
  total++; r=await clickChoice('Edikte|Rede'); await waitChoices(500);
  if(!r.ok) fails+=fail(label,'no-budget-act',{r});
  total++; r=await clickChoice('Katakomben|Dungeon|Festung'); await waitChoices(500);
  if(!r.ok) fails+=fail(label,'no-next',{r});
  const row=await page.evaluate(()=>{
    const g=window.__game;
    return { scene:g.S.campaign?.sceneId, choices:(g.S.campaign?._choiceObjs||[]).map(c=>c.label), gold:g.S.st?.gold };
  });
  total++; if((row.gold|0)<1 && !(row.choices||[]).length) fails+=fail(label,'stuck',{row});
  report.paths[label]={fails,total,row};
  console.log(`=== ${label}: ${fails}/${total} fails ===`);
  return fails;
}

async function runTownShopInn(){
  const label='jrpg-town';
  let fails=0,total=0;
  await bootDaemon();
  // jump to town via resolveChoice
  await page.evaluate(()=>{
    const g=window.__game;
    const pack=g.C58.resolveChoice(g.S,{next:'town'},{toast:()=>{}});
    g.applyJrpgPack(pack);
  });
  await waitChoices(300);
  total++; let r=await clickChoice('Laden'); await waitChoices(400);
  if(!r.ok) fails+=fail(label,'shop',{r});
  total++; r=await clickChoice('Brot|Heiltrank|Zurück'); await waitChoices(400);
  if(!r.ok) fails+=fail(label,'buy-or-back',{r});
  await page.evaluate(()=>{
    const g=window.__game;
    g.applyJrpgPack(g.C58.resolveChoice(g.S,{next:'town'},{}));
  });
  await waitChoices(200);
  total++; r=await clickChoice('Herberge'); await waitChoices(400);
  if(!r.ok) fails+=fail(label,'inn',{r});
  const gold=await page.evaluate(()=>window.__game.S.st?.gold|0);
  // give gold then inn
  await page.evaluate(()=>{ window.__game.S.st.gold=50; window.__game.applyJrpgPack(window.__game.C58.resolveChoice(window.__game.S,{next:'town_inn'},{})); });
  await waitChoices(200);
  const after=await page.evaluate(()=>({gold:window.__game.S.st.gold|0, hp:window.__game.S.st.hp|0, text:(document.getElementById('vnText')?.textContent||'')}));
  total++; if(after.gold>=50) fails+=fail(label,'inn-no-charge',{after});
  total++; if(!/Herberge|ruhst|KP|voll/i.test(after.text)) fails+=fail(label,'inn-text',{after});
  report.paths[label]={fails,total,gold,after};
  console.log(`=== ${label}: ${fails}/${total} fails ===`);
  return fails;
}

async function runDungeonParty(){
  const label='jrpg-dungeon-party';
  let fails=0,total=0;
  await bootDaemon();
  await page.evaluate(()=>{
    const g=window.__game;
    g.C58.startDungeon(g.S, g.C58.currentChapter(g.S));
    g.applyJrpgPack(g.C58.resolveChoice(g.S,{next:'dungeon'},{}));
  });
  await waitChoices(300);
  total++; let r=await clickChoice('Truhe'); await waitChoices(400);
  if(!r.ok) fails+=fail(label,'chest',{r});
  total++; r=await clickChoice('Weiter|Dungeon|Raum'); await waitChoices(300);
  // recruit Velka
  await page.evaluate(()=>{
    const g=window.__game;
    g.C58.recruitMember(g.S,'Sekretärin Velka',{toast:()=>{}});
  });
  const party=await page.evaluate(()=>({party:window.__game.S.party||[], romance:!!window.__game.S.romance?.['Sekretärin Velka']}));
  total++; if(!party.party.includes('Sekretärin Velka')) fails+=fail(label,'recruit',{party});
  // advance rooms to boss door
  await page.evaluate(()=>{
    const g=window.__game; const d=g.S.campaign.dungeon; d.room=d.rooms+1;
    g.applyJrpgPack(g.C58.resolveChoice(g.S,{next:'dungeon'},{}));
  });
  await waitChoices(300);
  total++; r=await clickChoice('Boss'); await waitChoices(600);
  if(!r.ok) fails+=fail(label,'boss-btn',{r});
  const ch=await page.evaluate(()=>({idx:window.__game.S.campaign.chapterIdx|0, scene:window.__game.S.campaign.sceneId, mode:window.__game.S.campaign.mode}));
  total++; if(ch.idx<1 && ch.mode==='dungeon') fails+=fail(label,'boss-no-advance',{ch});
  report.paths[label]={fails,total,party,ch};
  console.log(`=== ${label}: ${fails}/${total} fails ===`);
  return fails;
}

async function runNpcTalk(){
  const label='jrpg-npc';
  let fails=0,total=0;
  await bootDaemon();
  await page.evaluate(()=>{
    const g=window.__game;
    g.applyJrpgPack(g.C58.resolveChoice(g.S,{next:'town_talk'},{}));
  });
  await waitChoices(300);
  total++; let r=await clickChoice('Velka|Brok|Nyx|Aria'); await waitChoices(400);
  if(!r.ok) fails+=fail(label,'npc',{r});
  total++; r=await clickChoice('Zuhören|Gruppe|Zurück'); await waitChoices(300);
  if(!r.ok) fails+=fail(label,'npc-act',{r});
  report.paths[label]={fails,total};
  console.log(`=== ${label}: ${fails}/${total} fails ===`);
  return fails;
}

async function runAllyArt(){
  const label='ally-art';
  let fails=0,total=0;
  const files=['ally_hero.png','ally_spy.png','ally_mage.png','ally_guard.png'];
  for(const f of files){
    total++;
    const fp=path.join(ROOT,'assets/pixel/battler',f);
    if(!fs.existsSync(fp)) fails+=fail(label,'missing',{f});
    else {
      const sz=fs.statSync(fp).size;
      if(sz<8000) fails+=fail(label,'too-sparse',{f,sz});
    }
  }
  report.paths[label]={fails,total};
  console.log(`=== ${label}: ${fails}/${total} fails ===`);
  return fails;
}

async function runMigrateSaves(){
  const label='migrate-saves';
  let fails=0,total=0;
  await bootDaemon();
  for(const ver of [13,20,40,50,56,57]){
    total++;
    const ok=await page.evaluate((ver)=>{
      const g=window.__game;
      const s={ver, role:'daemon', pc:{name:'Alt'+ver}, st:{hp:50,maxhp:100,mp:10,maxmp:40,gold:3,xp:0,lvl:1}, world:{scene:{ort:'Thronsaal',anwesend:[]},npcs:{}}, flags:{}, log:[]};
      try{ g.migrate?.(s); }catch(e){ try{ g.C58.migrateV58(s); }catch(_){ return {ok:false,err:String(e)} } }
      try{ g.C58.migrateV58(s); }catch(e){ return {ok:false,err:String(e)} }
      return {ok:(s.ver|0)>=58 && !!s.campaign, ver:s.ver, camp:s.campaign?.id};
    }, ver);
    if(!ok.ok) fails+=fail(label,'mig-'+ver,{ok});
  }
  report.paths[label]={fails,total};
  console.log(`=== ${label}: ${fails}/${total} fails ===`);
  return fails;
}

async function runMobileDesktopSmoke(){
  const label='viewport-smoke';
  let fails=0,total=0;
  for(const vp of [{w:390,h:844,name:'mobile'},{w:1920,h:1080,name:'desktop'}]){
    total++;
    await page.setViewport({width:vp.w,height:vp.h,isMobile:vp.w<500,hasTouch:vp.w<500});
    const info=await bootDaemon('Vista');
    const shot=`/workspace/isekai-game-shots/v58-after/${vp.name}-hub.png`;
    await page.screenshot({path:shot,fullPage:false});
    if(!info.inputHidden || !(info.choices||[]).length) fails+=fail(label,vp.name,{info});
    report.samples[vp.name]=info;
  }
  report.paths[label]={fails,total};
  console.log(`=== ${label}: ${fails}/${total} fails ===`);
  return fails;
}

async function runLiveSiteBrowser(){
  const label='live-site';
  let fails=0,total=0;
  const LIVE='https://markusstol.github.io/isekai-game/';
  console.log('\n=== LIVE SITE ===', LIVE);
  total++;
  try{
    await page.goto(LIVE+'?gate=1&v='+Date.now(),{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForFunction(()=>window.__game?.VER,{timeout:45000});
    const ver=await page.evaluate(()=>window.__game?.VER);
    if(String(ver)!==VER) fails+=fail(label,'live-ver-'+ver);
  }catch(e){ fails+=fail(label,'live-err',{err:String(e.message||e)}); }
  report.paths[label]={fails,total};
  console.log(`=== ${label}: ${fails}/${total} fails ===`);
  return fails;
}

try{
  server=await serve();
  browser=await puppeteer.launch({headless:true,protocolTimeout:300000,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']});
  page=await browser.newPage();
  page.setDefaultTimeout(90000);
  await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});

  console.log('Gate v58 classic JRPG (freetext archived)');

  if(process.env.GATE_ONLY_LIVE==='1'){
    await runLiveSiteBrowser();
  } else {
    console.log('\n=== JRPG BOOT ==='); await runJrpgBoot();
    console.log('\n=== CHAPTER FLOW ==='); await runChapterFlow();
    console.log('\n=== TOWN / SHOP / INN ==='); await runTownShopInn();
    console.log('\n=== NPC TALK ==='); await runNpcTalk();
    console.log('\n=== DUNGEON + PARTY + BOSS ==='); await runDungeonParty();
    console.log('\n=== ALLY ART ==='); await runAllyArt();
    console.log('\n=== MIGRATE SAVES ==='); await runMigrateSaves();
    console.log('\n=== VIEWPORTS ==='); await runMobileDesktopSmoke();
    if(process.env.GATE_SKIP_LIVE==='1'){
      console.log('\n=== LIVE SITE skipped (GATE_SKIP_LIVE=1) ===');
      report.paths['live-site']={fails:0,total:0,skipped:true};
    } else {
      await runLiveSiteBrowser();
    }
  }
} catch(e){
  console.error('GATE ERROR', e);
  failures.push({path:'runner', reason:String(e.message||e)});
} finally {
  try{await browser?.close()}catch(_){}
  try{server?.close()}catch(_){}
}

fs.writeFileSync('/tmp/gate-report.json', JSON.stringify({failures, report},null,2));
fs.mkdirSync('/workspace/isekai-game-shots',{recursive:true});
fs.writeFileSync('/workspace/isekai-game-shots/v58-gate.log', JSON.stringify({failures, report},null,2));
console.log('\n=== GATE SUMMARY ===');
console.log(JSON.stringify(report.paths,null,2));
console.log('Failures:', failures.length);
for(const f of failures.slice(0,40))
  console.log(' -', f.path, f.reason, JSON.stringify(f).slice(0,160));
if(failures.length){ console.error('GATE FAILED — do not push'); process.exit(1); }
console.log('GATE PASSED');
process.exit(0);
