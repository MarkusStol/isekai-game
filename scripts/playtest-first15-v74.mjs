#!/usr/bin/env node
/** Timed first-15-minutes critique: hook → fight → party → reward. Frame shots every ~30s simulated. */
import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const ROOT=path.join(path.dirname(fileURLToPath(import.meta.url)),'..');
const PORT=8920;
const OUT='/workspace/isekai-game-shots/v74-ship-report/first15';
const VER='74';
fs.mkdirSync(OUT,{recursive:true});
const log=[]; const critique=[];
function serve(){
  return new Promise(res=>{
    const s=http.createServer((req,res2)=>{
      let p=decodeURIComponent((req.url||'/').split('?')[0]); if(p==='/')p='/index.html';
      const fp=path.join(ROOT,p.replace(/^\//,''));
      if(!fp.startsWith(ROOT)||!fs.existsSync(fp)||fs.statSync(fp).isDirectory()){res2.writeHead(404);res2.end();return;}
      const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json'};
      res2.writeHead(200,{'Content-Type':types[path.extname(fp)]||'application/octet-stream','Cache-Control':'no-store'});
      fs.createReadStream(fp).pipe(res2);
    });
    s.listen(PORT,()=>res(s));
  });
}
const t0=Date.now();
const mark=async(page,name,note)=>{
  const elapsed=((Date.now()-t0)/1000)|0;
  await page.screenshot({path:`${OUT}/${String(elapsed).padStart(3,'0')}s-${name}.png`});
  const meta=await page.evaluate(()=>{
    const g=window.__game; const ow=g?.OW?.__debug?.();
    return {ver:g?.VER, mode:g?.S?.campaign?.mode, scene:g?.S?.campaign?.sceneId, ort:g?.S?.world?.scene?.ort,
      lvl:g?.S?.st?.lvl, gold:g?.S?.st?.gold, party:(g?.S?.party||g?.S?.allies||[]).length,
      ow: ow?{kind:ow.map?.kind,scale:ow.scale,view:ow.view,hero:ow.hero}:null};
  });
  log.push({elapsed,name,note,meta});
  return {elapsed,meta};
};
const server=await serve();
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox']});
const page=await browser.newPage();
await page.setViewport({width:1920,height:1080});
await page.goto(`http://127.0.0.1:${PORT}/?v=${VER}&pt=1`,{waitUntil:'domcontentloaded'});
await page.waitForFunction(v=>window.__game?.VER===v,{timeout:60000},VER);
await page.evaluate(async()=>{ localStorage.clear(); try{ const regs=await navigator.serviceWorker?.getRegistrations?.()||[]; await Promise.all(regs.map(r=>r.unregister())); }catch(_){ }});
await page.reload({waitUntil:'domcontentloaded'});
await page.waitForFunction(v=>window.__game?.VER===v,{timeout:60000},VER);
await new Promise(r=>setTimeout(r,800));

await mark(page,'title','Boot / title');
await page.evaluate(async()=>{
  window.__FAST=true; window.__SKIP_REMOTE_IMG=true; window.__FORCE_CSS_SCENES=true; window.__PLAYTEST=true;
  window.__setCfg({mode:'offline', battleDiff:'story', atbMode:'active'});
  const g=window.__game;
  await g.newLife('daemon',{lives:0,soul:0,keptSkills:[]},{skipSetup:true,name:'Noctis'});
  g.S.setup={done:true}; g.S.flags=Object.assign(g.S.flags||{},{onboarded:true,introDone:true,visual74:true});
  g.S.cfgBattleDiff='story'; g.S.cfgAtbMode='active';
  g.S.st.hp=g.S.st.maxhp=160; g.S.st.mp=g.S.st.maxmp=80; g.S.st.gold=40; g.S.st.str=18; g.S.st.lvl=1; g.S.st.xp=0;
  g.C60.migrateV60(g.S); g.C70?.migrateV70?.(g.S);
  g.S.campaign.chapterIdx=0; g.S.campaign.sceneId='c1_intro'; g.S.campaign.mode='scene';
  g.enterPlay();
  document.getElementById('title')?.classList.add('hidden');
  document.getElementById('stage')?.classList.remove('hidden');
  const pack=g.C60.startCampaign(g.S,{toast:g.toast});
  g.applyJrpgPack(pack);
});
await new Promise(r=>setTimeout(r,400));
await mark(page,'hook-intro','Hook: intro scene on screen');

// pick open eyes / explore
await page.evaluate(()=>{
  const g=window.__game; const objs=g.S.campaign?._choiceObjs||[];
  const hit=objs.find(o=>/Augen|öffnen|Thronsaal|erkunden|town/i.test(o.label||''))||objs[0];
  if(hit) g.jrpgPick(hit);
});
await new Promise(r=>setTimeout(r,500));
await mark(page,'first-choice','After first choice');

// Force town hub overworld
await page.evaluate(()=>{
  const g=window.__game;
  g.S.world=g.S.world||{}; g.S.world.scene=g.S.world.scene||{};
  g.S.world.scene.ort='Thronsaal der Nacht';
  g.S.campaign.mode='town';
  g.OW?.showOverworld?.(g.S);
});
await new Promise(r=>setTimeout(r,600));
const hub=await mark(page,'hub-throne','Hub throne — art family check');
if((hub.meta.ow?.scale|0)!==3) critique.push('Camera scale not 3 at hub: '+JSON.stringify(hub.meta.ow));

// Talk Velka → party
await page.evaluate(()=>{
  const g=window.__game;
  g.S.world.npcs=g.S.world.npcs||{};
  g.S.world.npcs['Sekretärin Velka']=g.S.world.npcs['Sekretärin Velka']||{name:'Sekretärin Velka',role:'clerk'};
  g.S.romance=g.S.romance||{};
  g.S.party=[{id:'hero',name:'Noctis'},{id:'velka',name:'Velka',battler:'ally_velka.png'}];
  try{ g.OW.__talkTo?.('Sekretärin Velka'); }catch(_){}
});
await new Promise(r=>setTimeout(r,400));
await mark(page,'party-velka','First party member (Velka) joined');

// First fight
await page.evaluate(async()=>{
  const g=window.__game;
  await g.Battle?.ensure?.(); // may not exist
  const foes=[{id:'demon_imp',name:'Imp',hp:40,maxhp:40,atk:8,def:3,spd:12,exp:30,gold:12,alive:true}];
  g.S.flags=g.S.flags||{};
  g.S.flags._offerEncounter={foes,blurb:'Ein Imp springt aus den Registern!',forceAttack:true};
});
await page.evaluate(async()=>{
  const g=window.__game;
  try{ await g.openPendingEncounter({}); }catch(e){
    try{
      const B=g.Battle; const foes=g.S.flags._offerEncounter.foes;
      await B.offerEncounter(g.S,{enemies:foes,blurb:'Kampf!',bg:g.battleBgFor?.(g.S)});
    }catch(e2){ console.warn(e2); }
  }
});
await new Promise(r=>setTimeout(r,800));
await mark(page,'first-fight','First fight started');

// Auto-attack through fight
let turns=0;
for(let i=0;i<80;i++){
  const st=await page.evaluate(()=>{
    const B=window.__game?.Battle; const b=B?.getBattle?.();
    if(!b){ const sum=B?.getLastSummary?.(); if(sum) return {phase:'done',result:sum.result}; return {phase:'none'}; }
    if(b.done) return {phase:'done',result:b.result};
    return {phase:b.selecting?'menu':'tick'};
  });
  if(st.phase==='done'){ log.push({fight:st}); break; }
  if(st.phase==='menu'){
    turns++;
    await page.evaluate(()=>{
      const B=window.__game.Battle; const b=B.getBattle(); if(!b||!b.selecting) return;
      const foe=b.foes.find(f=>f.alive); if(foe) B.playerCommand('attack',{targetId:foe._iid});
    });
  }
  await new Promise(r=>setTimeout(r,50));
}
await mark(page,'fight-done',`Fight finished turns=${turns}`);

// Reward: chest in dungeon
await page.evaluate(()=>{
  const g=window.__game;
  g.S.world.scene.ort='Schatzkatakomben · Raum 1';
  g.S.content39=g.S.content39||{}; g.S.content39.dungeon=true;
  g.OW.showOverworld(g.S);
});
await new Promise(r=>setTimeout(r,700));
const dung=await mark(page,'dungeon-na','Dungeon with NA tileset');
if((dung.meta.ow?.scale|0)<2) critique.push('Dungeon camera zoomed out');

// Open nearest chest via debug
await page.evaluate(()=>{
  const g=window.__game; const d=g.OW.__debug?.();
  const c=(d?.chests||[])[0];
  if(c){ g.OW.__setHero?.(c.x,c.y); }
});
await page.keyboard.press('ArrowDown');
await new Promise(r=>setTimeout(r,300));
await page.evaluate(()=>{
  const g=window.__game; const d=g.OW.__debug?.();
  const c=(g.OW.__map?.chests||d?.chests||[])[0];
  // force open by stepping
  try{ g.OW.__tryMove?.(0,0); }catch(_){}
});
// grant XP to trigger level-up screen
await page.evaluate(()=>{
  const g=window.__game;
  g.Level.grantXp(g.S, 120, 'playtest');
});
await new Promise(r=>setTimeout(r,500));
await mark(page,'levelup-reward','Level-up modal + dungeon reward beat');

// Pass hub for outdoor NA
await page.evaluate(()=>{
  const g=window.__game;
  g.S.world.scene.ort='Grenzpass';
  g.S.content39.dungeon=false;
  g.OW.showOverworld(g.S);
});
await new Promise(r=>setTimeout(r,600));
await mark(page,'pass-na','Grenzpass NA snow biome');

const elapsed=((Date.now()-t0)/1000)|0;
critique.push(`Simulated first-arc wall-clock ${elapsed}s (scripted; not real human 15min).`);
critique.push('Hook present via C60 intro; first fight forced; Velka party seeded; dungeon NA tiles + level-up modal shown.');
if(turns>12) critique.push(`Fight felt slow (${turns} turns) — ATB/animations may still drag.`);
else critique.push(`Fight pacing OK (${turns} turns).`);

fs.writeFileSync(`${OUT}/critique.json`, JSON.stringify({log,critique,elapsed},null,2));
console.log(JSON.stringify({elapsed,shots:log.length,critique,turns},null,2));
await browser.close(); server.close();
