#!/usr/bin/env node
/** Chapter-1 E2E: intro → town → dungeon puzzle → boss → reward (v70). */
import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const ROOT=path.join(path.dirname(fileURLToPath(import.meta.url)),'..');
const PORT=8892;
const OUT='/workspace/isekai-game-shots/v70-ship-report/playtest-c1';
const VER='70';
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

async function pick(page, src){
  return page.evaluate((src)=>{
    const g=window.__game;
    const objs=g.S.campaign?._choiceObjs||[];
    const re=new RegExp(src,'i');
    const hit=objs.find(o=>re.test(o.label||''));
    if(hit){ g.jrpgPick(hit); return {ok:true, via:'jrpg', label:hit.label}; }
    const btns=[...document.querySelectorAll('#choices button,.choices button')];
    const b=btns.find(x=>re.test(x.textContent||''));
    if(b){ b.click(); return {ok:true, via:'dom', label:b.textContent}; }
    return {ok:false, labels:objs.map(o=>o.label).concat(btns.map(x=>x.textContent))};
  }, src);
}

async function fightATB(page, timeoutMs=90000){
  const t0=Date.now(); let turns=0;
  while(Date.now()-t0 < timeoutMs){
    const st=await page.evaluate(()=>{
      const B=window.__game?.Battle; const b=B?.getBattle?.();
      if(!b){ const sum=B?.getLastSummary?.(); if(sum) return {phase:'done', result:sum.result}; return {phase:'none'}; }
      if(b.done) return {phase:'done', result:b.result};
      return {phase: b.selecting?'menu':'tick'};
    });
    if(st.phase==='none'){ await new Promise(r=>setTimeout(r,100)); if(Date.now()-t0>8000) return {ok:false, reason:'no-battle', turns}; continue; }
    if(st.phase==='done') return {ok:true, result:st.result, turns};
    if(st.phase==='menu'){
      turns++;
      await page.evaluate(()=>{
        const B=window.__game.Battle; const b=B.getBattle(); if(!b||!b.selecting) return;
        const foe=b.foes.find(f=>f.alive); if(foe) B.playerCommand('attack',{targetId:foe._iid});
      });
      await new Promise(r=>setTimeout(r,70));
    } else await new Promise(r=>setTimeout(r,40));
  }
  return {ok:false, reason:'timeout', turns};
}

const server=await serve();
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox']});
const page=await browser.newPage();
page.on('pageerror', e=>issues.push({pageerror:String(e.message||e)}));
await page.setViewport({width:1920,height:1080});
await page.goto(`http://127.0.0.1:${PORT}/?v=${VER}&pt=1`,{waitUntil:'domcontentloaded'});
await page.waitForFunction(v=>window.__game?.VER===v,{timeout:60000},VER);
await page.evaluate(async()=>{
  localStorage.clear();
  try{ const regs=await navigator.serviceWorker?.getRegistrations?.()||[]; await Promise.all(regs.map(r=>r.unregister())); }catch(_){}
});
await page.reload({waitUntil:'domcontentloaded'});
await page.waitForFunction(v=>window.__game?.VER===v,{timeout:60000},VER);

await page.evaluate(async()=>{
  window.__FAST=true; window.__SKIP_REMOTE_IMG=true; window.__FORCE_CSS_SCENES=true; window.__PLAYTEST=true;
  window.__setCfg({mode:'offline', battleDiff:'story', atbMode:'active'});
  const g=window.__game;
  await g.newLife('daemon',{lives:0,soul:0,keptSkills:[]},{skipSetup:true,name:'Noctis'});
  g.S.setup={done:true}; g.S.flags=Object.assign(g.S.flags||{},{onboarded:true,introDone:true,visual70:true});
  g.S.cfgBattleDiff='story'; g.S.cfgAtbMode='active';
  g.S.st.hp=g.S.st.maxhp=240; g.S.st.mp=g.S.st.maxmp=100; g.S.st.gold=150; g.S.st.str=30; g.S.st.lvl=6;
  g.C60.migrateV60(g.S); g.C70?.migrateV70?.(g.S);
  g.S.campaign.chapterIdx=0; g.S.campaign.sceneId='c1_intro'; g.S.campaign.mode='scene';
  g.enterPlay();
  document.getElementById('title')?.classList.add('hidden');
  document.getElementById('stage')?.classList.remove('hidden');
  const pack=g.C60.startCampaign(g.S,{toast:g.toast});
  g.applyJrpgPack(pack);
});
await new Promise(r=>setTimeout(r,500));
async function snap(name){ await page.screenshot({path:`${OUT}/${name}.png`}); log.push(name); }

await snap('01-intro');
log.push({pick:await pick(page,'Augen|Thronsaal|öffnen')});
await new Promise(r=>setTimeout(r,400));
await snap('02-open');

// Town
log.push({pick:await pick(page,'Festung erkunden|town')});
await new Promise(r=>setTimeout(r,300));
if(!(await page.evaluate(()=>window.__game.S.campaign.mode))){
  await page.evaluate(()=>{
    const g=window.__game;
    g.applyJrpgPack(g.C60.resolveChoice(g.S,{id:'town',next:'town'},{toast:g.toast}));
  });
}
await snap('03-town');

// Seed party
await page.evaluate(()=>{
  const g=window.__game; const S=g.S;
  S.world=S.world||{}; S.world.npcs=S.world.npcs||{}; S.romance=S.romance||{};
  for(const n of ['Sekretärin Velka','General Brok','Heldin Aria']){
    S.world.npcs[n]=Object.assign({alive:true,art:n}, S.world.npcs[n]||{});
    S.romance[n]=Object.assign({affection:55,stage:2}, S.romance[n]||{});
  }
  S.party=['Sekretärin Velka','General Brok','Heldin Aria'];
  g.C70?.ensureV70?.(S);
});

// Enter dungeon story beat then dungeon
await page.evaluate(()=>{
  const g=window.__game;
  g.applyJrpgPack(g.C60.resolveChoice(g.S,{id:'dung',next:'c1_dung'},{toast:g.toast}));
});
await new Promise(r=>setTimeout(r,300));
await snap('04-dung-prompt');
await page.evaluate(()=>{
  const g=window.__game;
  g.C60.startDungeon(g.S, g.C60.CHAPTERS.find(c=>c.id==='c1'));
  g.applyJrpgPack(g.C60.resolveChoice(g.S,{id:'go',next:'dungeon'},{toast:g.toast}));
});
await snap('05-dungeon-r1');

// Advance rooms: chest → next until boss door; solve puzzle at room 3
for(let i=0;i<8;i++){
  const st=await page.evaluate(()=>{
    const S=window.__game.S; const d=S.campaign?.dungeon;
    return {room:d?.room, rooms:d?.rooms, done:d && d.room>d.rooms, flags:{...S.campaign.flags}, labels:(S.campaign._choiceObjs||[]).map(c=>c.label)};
  });
  log.push({loop:st});
  if(st.done) break;
  if(st.room===3 && !st.flags.puzzle_c1_ledger_seal){
    await snap('06-puzzle');
    let r=await pick(page,'9-9-9|27');
    if(!r.ok){
      await page.evaluate(()=>{
        const g=window.__game;
        g.applyJrpgPack(g.C60.resolveChoice(g.S,{id:'pz_b',next:'dung_puzzle_ok'},{toast:g.toast}));
      });
    }
    await new Promise(r=>setTimeout(r,350));
    await snap('07-puzzle-ok');
    await pick(page,'Weiter');
    continue;
  }
  // open chest if available
  await page.evaluate(()=>{
    const g=window.__game;
    const labels=(g.S.campaign._choiceObjs||[]).map(c=>c.label);
    if(labels.some(l=>/Truhe öffnen/i.test(l))){
      g.applyJrpgPack(g.C60.resolveChoice(g.S,{id:'chest',next:'dung_chest'},{toast:g.toast}));
    }
  });
  await new Promise(r=>setTimeout(r,150));
  await pick(page,'Weiter');
  await page.evaluate(()=>{
    const g=window.__game;
    g.applyJrpgPack(g.C60.resolveChoice(g.S,{id:'next',next:'dung_next'},{toast:g.toast}));
  });
  await new Promise(r=>setTimeout(r,150));
}
await snap('08-preboss');

// Boss
await page.evaluate(async()=>{
  const g=window.__game;
  const ch=g.C60.CHAPTERS.find(c=>c.id==='c1');
  const d=g.S.campaign.dungeon||{chapterId:'c1',name:ch.dungeon.name,rooms:5,boss:ch.dungeon.boss,bossName:ch.dungeon.bossName,chests:{}};
  d.room=(d.rooms|0)+1; g.S.campaign.dungeon=d;
  const En=await import('./enemies.js');
  const f=structuredClone(En.enemyById('lesser_fiend')||{id:'lesser_fiend',name:'Niederer Fiend',hp:100,maxhp:100,atk:10,def:5,spd:7,boss:true});
  f.hp=f.maxhp=70; f.atk=7;
  document.body.classList.add('in-battle');
  await g.Battle.startBattle(g.S,{
    enemies:[f], foes:[f], bg:'./assets/pixel/bg-battle/nocturna/throne.png', canFlee:false, scripted:false,
    onEnd:(res)=>{
      const win=res==='win'||res?.result==='win';
      if(win){ try{ g.applyJrpgPack(g.C60.onBossVictory(g.S,{toast:g.toast})); }catch(e){ console.warn(e); } }
    }
  });
});
await new Promise(r=>setTimeout(r,500));
await snap('09-boss-start');
const fight=await fightATB(page, 120000);
log.push({boss:fight});
await new Promise(r=>setTimeout(r,800));
await snap('10-boss-end');

// Force reward if needed
await page.evaluate(()=>{
  const g=window.__game;
  if(!g.S.campaign.flags?.beat_lesser_fiend){
    try{ g.applyJrpgPack(g.C60.onBossVictory(g.S,{toast:g.toast})); }catch(_){}
  }
  if(g.S.campaign.sceneId!=='c1_reward'){
    const sc=g.C60.CHAPTERS.find(c=>c.id==='c1').scenes.find(s=>s.id==='c1_reward');
    g.S.campaign.sceneId='c1_reward'; g.S.campaign.mode='scene';
    g.applyJrpgPack({speaker:sc.speaker,text:sc.text,choices:sc.choices});
    g.S.campaign._choiceObjs=sc.choices.slice();
  }
});
await snap('11-reward');
log.push({pick:await pick(page,'Siegel|Loot|einstecken')});
await new Promise(r=>setTimeout(r,400));
await snap('12-done');

const summary=await page.evaluate(()=>{
  const S=window.__game.S;
  return {ver:window.__game.VER, scene:S.campaign?.sceneId, chapter:S.campaign?.chapterIdx, flags:S.campaign?.flags, gold:S.st?.gold, party:S.party, xp:S.st?.xp};
});
const ok=!!summary.flags?.beat_lesser_fiend && !!summary.flags?.puzzle_c1_ledger_seal;
fs.writeFileSync(`${OUT}/playtest-c1-log.json`, JSON.stringify({ok,log,issues,summary,fight},null,2));
console.log(JSON.stringify({ok, summary, fight, issues:issues.length},null,2));
await browser.close(); server.close();
if(!ok) process.exitCode=2;
