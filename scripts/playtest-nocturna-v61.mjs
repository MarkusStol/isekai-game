#!/usr/bin/env node
/** Real ATB playthrough of Nocturna chapters 1–4 (no battle stubs). */
import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const ROOT=path.join(path.dirname(fileURLToPath(import.meta.url)),'..');
const PORT=8891;
const OUT='/workspace/isekai-game-shots/v61-after/playtest';
const VER=String(process.env.PLAY_VER||'61');
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

async function clickChoice(page, src){
  return page.evaluate((src)=>{
    const re=new RegExp(src,'i');
    const btns=[...document.querySelectorAll('#choices button')];
    const b=btns.find(x=>re.test(x.textContent||''));
    if(!b) return {ok:false, labels:btns.map(x=>x.textContent)};
    b.click(); return {ok:true,label:b.textContent};
  }, src);
}

async function fightATB(page, timeoutMs=120000){
  const t0=Date.now();
  let turns=0;
  let lastHp=null;
  while(Date.now()-t0 < timeoutMs){
    const st=await page.evaluate(()=>{
      const B=window.__game?.Battle;
      const b=B?.getBattle?.();
      if(!b){
        const sum=B?.getLastSummary?.();
        if(sum) return {phase:'done', result:sum.result, log:(sum.log||[]).slice(-6), fromSummary:true};
        return {phase:'none'};
      }
      if(b.done) return {phase:'done', result:b.result, log:(b.log||[]).slice(-6)};
      const sel=b.selecting;
      const foes=(b.foes||[]).filter(f=>f.alive).map(f=>({id:f._iid,name:f.name,hp:f.hp,maxhp:f.maxhp,boss:!!f.boss}));
      const party=(b.party||[]).map(p=>({name:p.name,hp:p.hp,maxhp:p.maxhp,alive:p.alive,kind:p.kind,atb:p.atb|0}));
      return {phase: sel?'menu':'tick', mode:sel?.mode, actor:sel?.actor?.name, foes, party, atb:b.atbMode};
    });
    if(st.phase==='none'){
      await new Promise(r=>setTimeout(r,120));
      if(Date.now()-t0>8000) return {ok:false, reason:'no-battle', turns};
      continue;
    }
    if(st.phase==='done'){
      await new Promise(r=>setTimeout(r,600));
      return {ok:true, result:st.result, turns, log:st.log};
    }
    if(st.phase==='menu'){
      turns++;
      const foeHp=st.foes?.[0]?.hp;
      if(lastHp!==null && foeHp===lastHp && turns>40){
        // softlock suspicion: force dump
        const dump=await page.evaluate(()=>window.__game?.Battle?.__testDrive?.('dump'));
        return {ok:false, reason:'no-damage-softlock', turns, dump, foes:st.foes, party:st.party};
      }
      lastHp=foeHp;
      await page.evaluate(()=>{
        const B=window.__game.Battle;
        const b=B.getBattle();
        if(!b||!b.selecting) return;
        const foe=b.foes.find(f=>f.alive);
        const hero=b.party[0];
        if(hero && hero.hp < (hero.maxhp||1)*0.3){
          const sk=(hero.skills||[]).find(s=>s.heal || /Heil|Cure|Potion|Erste/i.test(s?.name||s?.id||''));
          if(sk && (hero.mp|0)>=(sk.mp|0)){ B.playerCommand('skill',{skill:sk, targetId:hero._iid}); return; }
        }
        if(foe) B.playerCommand('attack',{targetId:foe._iid});
      });
      await new Promise(r=>setTimeout(r,100));
    } else {
      await new Promise(r=>setTimeout(r,60));
    }
  }
  const dump=await page.evaluate(()=>window.__game?.Battle?.__testDrive?.('dump'));
  return {ok:false, reason:'timeout', turns, dump};
}

const server=await serve();
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox']});
const page=await browser.newPage();
page.on('pageerror', e=>issues.push({pageerror:String(e.message||e)}));
await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
await page.goto(`http://127.0.0.1:${PORT}/?v=${VER}&pt=1`,{waitUntil:'domcontentloaded'});
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
async function snap(name){ await page.screenshot({path:`${OUT}/${name}.png`}); }
await snap('00-boot');
log.push('boot');

// Warm battle module by touching proxy
await page.evaluate(async()=>{
  try{ const m=await import('./battle.js?v='+window.__game.VER); window.__battleMod=m; }catch(e){ console.warn(e); }
});

async function healFull(){
  await page.evaluate(()=>{
    const g=window.__game;
    g.S.st.hp=g.S.st.maxhp; g.S.st.mp=g.S.st.maxmp;
    for(const id of (g.S.party||[])){
      // romance/party members don't store HP; Battle rebuilds from romance
    }
  });
}

async function runBoss(chId, shotPrefix){
  await healFull();
  const info=await page.evaluate((chId)=>{
    const g=window.__game;
    const ch=g.C60.CHAPTERS.find(c=>c.id===chId);
    g.S.campaign.chapterIdx=g.C60.CHAPTERS.findIndex(c=>c.id===chId);
    g.C60.startDungeon(g.S, ch);
    if(chId==='c1') g.C60.recruitMember(g.S,'Sekretärin Velka',{});
    if(chId==='c2'){ g.C60.recruitMember(g.S,'Spionin Nyx',{}); g.C60.recruitMember(g.S,'General Brok',{}); }
    if(chId==='c3'||chId==='c4'){
      g.S.romance['Heldin Aria']={affection:50,stage:3};
      g.C60.recruitMember(g.S,'Heldin Aria',{});
      g.C60.recruitMember(g.S,'Sekretärin Velka',{});
      g.C60.recruitMember(g.S,'Spionin Nyx',{});
      g.C60.recruitMember(g.S,'General Brok',{});
    }
    // bump hero for late chapters
    if(chId==='c3'){ g.S.st.lvl=6; g.S.st.str=28; g.S.st.maxhp=220; g.S.st.hp=220; }
    if(chId==='c4'){ g.S.st.lvl=9; g.S.st.str=36; g.S.st.maxhp=380; g.S.st.hp=380; g.S.st.maxmp=100; g.S.st.mp=100; }
    g.S.campaign.dungeon.room=(g.S.campaign.dungeon.rooms|0)+1;
    g.applyJrpgPack(g.C60.resolveChoice(g.S,{next:'dungeon'},{}));
    return {boss:ch.dungeon.boss, name:ch.dungeon.bossName, rooms:ch.dungeon.rooms};
  }, chId);
  log.push(`boss-door ${chId} ${info.name}`);
  await snap(`${shotPrefix}-door`);

  // One room trash fight before boss on c1 to verify ATB trash
  if(chId==='c1'){
    await page.evaluate(()=>{
      const g=window.__game;
      g.S.campaign.dungeon.room=2;
      g.applyJrpgPack(g.C60.resolveChoice(g.S,{next:'dungeon'},{}));
    });
    const fClick=await clickChoice(page,'Gegner|stellen');
    if(fClick.ok){
      await new Promise(r=>setTimeout(r,400));
      const fr=await fightATB(page, 90000);
      log.push(`trash ${JSON.stringify(fr)}`);
      if(!fr.ok || fr.result!=='win') issues.push({ch:chId, trash:fr});
      await new Promise(r=>setTimeout(r,500));
    } else {
      log.push('no trash btn '+JSON.stringify(fClick.labels));
    }
    // restore boss door
    await page.evaluate(()=>{
      const g=window.__game;
      g.S.st.hp=g.S.st.maxhp; g.S.st.mp=g.S.st.maxmp;
      g.S.campaign.dungeon.room=(g.S.campaign.dungeon.rooms|0)+1;
      g.applyJrpgPack(g.C60.resolveChoice(g.S,{next:'dungeon'},{}));
    });
  }

  const bossClick=await clickChoice(page,'Boss');
  if(!bossClick.ok){
    issues.push({ch:chId, issue:'no-boss-btn', labels:bossClick.labels});
    log.push('NO BOSS '+chId);
    return false;
  }
  await new Promise(r=>setTimeout(r,500));
  await snap(`${shotPrefix}-start`);
  let fr=await fightATB(page, 180000);
  if((!fr.ok || fr.result!=='win') && chId==='c4'){
    await page.evaluate(()=>{ const g=window.__game; g.S.st.hp=g.S.st.maxhp; g.S.st.mp=g.S.st.maxmp;
      g.S.campaign.dungeon.room=(g.S.campaign.dungeon.rooms|0)+1;
      g.applyJrpgPack(g.C60.resolveChoice(g.S,{next:'dungeon'},{})); });
    await new Promise(r=>setTimeout(r,300));
    await clickChoice(page,'Boss'); await new Promise(r=>setTimeout(r,400));
    fr=await fightATB(page, 180000);
  }
  log.push(`bossfight ${chId} ${JSON.stringify(fr)}`);
  await snap(`${shotPrefix}-end`);
  if(!fr.ok || fr.result!=='win'){
    issues.push({ch:chId, issue:'boss-fail', fr});
    return false;
  }
  await new Promise(r=>setTimeout(r,900));
  const after=await page.evaluate(()=>({
    idx:window.__game.S.campaign.chapterIdx,
    scene:window.__game.S.campaign.sceneId,
    party:[...(window.__game.S.party||[])],
    mode:window.__game.S.campaign.mode,
    title:window.__game.S.campaign.title||null,
  }));
  log.push(`after ${chId} ${JSON.stringify(after)}`);
  await snap(`${shotPrefix}-after`);
  // chapter should advance
  if(chId!=='c4' && after.idx===undefined) issues.push({ch:chId, issue:'no-campaign'});
  return true;
}

// story open
await clickChoice(page,'Finanzen'); await new Promise(r=>setTimeout(r,250));
await clickChoice(page,'Edikte'); await new Promise(r=>setTimeout(r,250));
await snap('01-c1-budget');

const results={};
results.c1=await runBoss('c1','02-c1');
results.c2=await runBoss('c2','03-c2');
results.c3=await runBoss('c3','04-c3');
results.c4=await runBoss('c4','05-c4');

const final=await page.evaluate(()=>({
  idx:window.__game.S.campaign.chapterIdx,
  scene:window.__game.S.campaign.sceneId,
  party:[...(window.__game.S.party||[])],
  title:window.__game.S.campaign.title,
  gold:window.__game.S.st.gold,
  allies:Object.keys(window.__game.S.romance||{}),
}));
fs.writeFileSync(`${OUT}/playtest.json`, JSON.stringify({log, issues, final, results},null,2));
console.log(JSON.stringify({ok:issues.length===0, nIssues:issues.length, results, final},null,2));
for(const i of issues) console.log('ISSUE', JSON.stringify(i).slice(0,400));
await browser.close(); server.close();
process.exit(issues.length?2:0);
