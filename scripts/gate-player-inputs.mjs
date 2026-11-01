#!/usr/bin/env node
/**
 * v60 release gate — classic JRPG Nocturna.
 * GATE_SKIP_LIVE=1 → local only. GATE_ONLY_LIVE=1 → live Pages + old saves.
 * Real ATB for chapter bosses (no __gateNoBattle stub).
 */
import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT=path.join(path.dirname(fileURLToPath(import.meta.url)),'..');
const PORT=8793;
const VER='71';
const LIVE='https://markusstol.github.io/isekai-game/';
const SKIP_LIVE=process.env.GATE_SKIP_LIVE==='1';
const ONLY_LIVE=process.env.GATE_ONLY_LIVE==='1';
const failures=[];
const report={paths:{}, samples:{}};

function fail(pathName, msg, extra){
  failures.push({path:pathName, msg, extra});
  console.error('FAIL', pathName, msg, extra?JSON.stringify(extra).slice(0,200):'');
}
function ok(pathName, extra){
  report.paths[pathName]=(report.paths[pathName]||0)+1;
  if(extra) report.samples[pathName]=extra;
  console.log('OK', pathName, extra?JSON.stringify(extra).slice(0,120):'');
}

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
    server.listen(PORT,()=>resolve(server));
  });
}

async function boot(page, {live=false}={}){
  const url = live ? `${LIVE}?v=${Date.now()}` : `http://127.0.0.1:${PORT}/?v=${VER}&pt=1`;
  await page.goto(url,{waitUntil:'domcontentloaded', timeout:60000});
  await page.waitForFunction(()=>window.__game?.VER,{timeout:45000});
  return page.evaluate(()=>window.__game.VER);
}

async function freshOffline(page){
  await page.evaluate(async()=>{
    localStorage.clear();
    try{ const regs=await navigator.serviceWorker?.getRegistrations?.()||[]; await Promise.all(regs.map(r=>r.unregister())); }catch(_){}
  });
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(v=>window.__game?.VER===v,{timeout:45000},VER);
  await page.evaluate(async()=>{
    window.__FAST=true; window.__SKIP_REMOTE_IMG=true; window.__FORCE_CSS_SCENES=true; window.__PLAYTEST=true;
    // NO battle stub — real ATB
    window.__setCfg({mode:'offline', battleDiff:'story', atbMode:'active'});
    const g=window.__game;
    await g.newLife('daemon',{lives:0,soul:0,keptSkills:[]},{skipSetup:true,name:'Noctis'});
    g.S.setup={done:true}; g.S.flags=Object.assign(g.S.flags||{},{onboarded:true,introDone:true});
    g.S.cfgBattleDiff='story'; g.S.cfgAtbMode='active';
    g.S.st.hp=g.S.st.maxhp=180; g.S.st.mp=g.S.st.maxmp=80; g.S.st.gold=120; g.S.st.str=20; g.S.st.lvl=4;
    g.C64?.migrateV64?.(g.S) || g.C63?.migrateV63?.(g.S) || g.C62?.migrateV62?.(g.S) || g.C61?.migrateV61?.(g.S) || g.C60.migrateV60(g.S);
    g.enterPlay();
    try{ g.syncFreetextUI?.(); document.body.classList.add('visual59','visual62','visual63','visual64','no-freetext','jrpg-classic'); }catch(_){}
    document.getElementById('title')?.classList.add('hidden');
    document.getElementById('stage')?.classList.remove('hidden');
  });
  await new Promise(r=>setTimeout(r,500));
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

async function fightATB(page, timeoutMs=90000){
  const t0=Date.now(); let turns=0;
  while(Date.now()-t0<timeoutMs){
    const st=await page.evaluate(()=>{
      const B=window.__game?.Battle; const b=B?.getBattle?.();
      if(!b){ const sum=B?.getLastSummary?.(); if(sum) return {phase:'done',result:sum.result}; return {phase:'none'}; }
      if(b.done) return {phase:'done',result:b.result};
      return {phase:b.selecting?'menu':'tick'};
    });
    if(st.phase==='none'){ await new Promise(r=>setTimeout(r,100)); if(Date.now()-t0>6000) return {ok:false,reason:'no-battle'}; continue; }
    if(st.phase==='done'){ await new Promise(r=>setTimeout(r,500)); return {ok:true,result:st.result,turns}; }
    if(st.phase==='menu'){
      turns++;
      await page.evaluate(()=>{
        const B=window.__game.Battle; const b=B.getBattle(); if(!b?.selecting) return;
        const hero=b.party?.[0];
        const foe=b.foes.find(f=>f.alive);
        if(hero && hero.hp < (hero.maxhp||1)*0.4){
          const sk=(hero.skills||[]).find(s=>s.heal||/Heil|Erste|Cure/i.test(s?.name||''));
          if(sk && (hero.mp|0)>=(sk.mp|0)){ B.playerCommand('skill',{skill:sk,targetId:hero._iid}); return; }
        }
        if(foe) B.playerCommand('attack',{targetId:foe._iid});
      });
      await new Promise(r=>setTimeout(r,80));
    } else await new Promise(r=>setTimeout(r,50));
  }
  return {ok:false,reason:'timeout',turns};
}


// ---- v64: talk to EVERY hub NPC; fail on bad dialogue strings ----
async function npcDialogueGate(page){
  const HUBS = [
    'Thronsaal der Nacht',
    'Grenzpass',
    'Ruinen von Solmir',
    'Kathedrale des Lichts',
  ];
  await page.evaluate(async()=>{
    const g=window.__game;
    // reset to OW-capable play state
    await g.newLife('daemon',{lives:0,soul:0,keptSkills:[]},{skipSetup:true,name:'Noctis'});
    g.S.setup={done:true};
    g.S.flags=Object.assign(g.S.flags||{},{onboarded:true,introDone:true,visual45Tip:1,visual64:true,freetext:false});
    try{ g.C64?.migrateV64?.(g.S); }catch(_){}
    g.enterPlay();
    document.getElementById('title')?.classList.add('hidden');
    document.getElementById('stage')?.classList.remove('hidden');
    document.getElementById('onboardCoach')?.classList.add('hidden');
    document.getElementById('battleRoot')?.classList.add('hidden');
    document.body.classList.remove('in-battle');
    try{ g.OW.mountOverworld({getS:()=>g.S, toast:(m)=>g.toast?.(m), save:()=>g.save?.()}); }catch(_){}
  });
  const all=[];
  for(const ort of HUBS){
    const hubRes = await page.evaluate(async (ort)=>{
      const g=window.__game;
      const badRe=/(\[object|undefined|null|NaN)/i;
      g.S.world.scene.ort=ort; g.S.genre='daemon';
      try{ g.Battle?.endBattle?.({result:'flee'}); }catch(_){}
      try{ g.OW.hideOverworld?.(); }catch(_){}
      g.OW.showOverworld(g.S);
      await new Promise(r=>setTimeout(r,250));
      const npcs = (g.OW.__listNpcs?.() || g.OW.__debug?.()?.npcs || []).slice();
      const talks=[];
      for(const n of npcs){
        try{ g.OW.hideDialogue?.(); }catch(_){}
        let shown=null;
        try{ shown = g.OW.__talkTo?.(n.name); }catch(e){ shown={error:String(e)}; }
        // wait typewriter
        await new Promise(r=>setTimeout(r,520));
        const name=(document.getElementById('owDlgName')?.textContent||'').trim() || String(shown?.name||'');
        const text=(document.getElementById('owDlgText')?.textContent||'').trim() || String(shown?.text||'');
        const empty=!text || text==='…' || text==='...' || text.length<2;
        const badName = !name || badRe.test(name) || /^\[object/i.test(name);
        const badText = empty || badRe.test(text);
        talks.push({npc:n.name, sheet:n.sheet, name, text:text.slice(0,140), badName, badText, empty});
        try{ g.OW.hideDialogue?.(); }catch(_){}
      }
      return {ort, npcCount:npcs.length, talks, names:npcs.map(n=>n.name)};
    }, ort);
    all.push(hubRes);
    for(const t of hubRes.talks){
      if(t.badName || t.badText || t.empty){
        fail('npc-dialogue', `${hubRes.ort} / ${t.npc}`, t);
      } else {
        ok('npc-dialogue', {ort:hubRes.ort, npc:t.npc, name:t.name, text:t.text.slice(0,60)});
      }
    }
    if(hubRes.npcCount<1) fail('npc-dialogue', `${hubRes.ort} has zero NPCs`, hubRes);
  }
  return all;
}

async function runLocal(browser){
  const page=await browser.newPage();
  await page.setViewport({width:1280,height:720,isMobile:false,hasTouch:false}); // v66 PC-only
  const ver=await boot(page);
  if(String(ver)!==VER) fail('ver', 'local VER mismatch', {ver}); else ok('ver',{ver});

  await freshOffline(page);

  // jrpg-boot
  const bootInfo=await page.evaluate(()=>({
    freetext:window.__game.FREETEXT_ENABLED,
    scene:window.__game.S.campaign?.sceneId,
    inputHidden:getComputedStyle(document.getElementById('inputRow')||document.body).display==='none' || document.body.classList.contains('no-freetext'),
    visual59:document.body.classList.contains('visual59'),
    choices:[...document.querySelectorAll('#choices button')].map(b=>b.textContent),
  }));
  if(bootInfo.freetext) fail('jrpg-boot','freetext still on'); else ok('jrpg-boot', bootInfo);
  if(!bootInfo.inputHidden) fail('jrpg-boot','input visible');
  // v63: DOM must not expose free-text / AI key UI
  const domAudit=await page.evaluate(()=>{
    const vis=el=>{
      if(!el) return false;
      const st=getComputedStyle(el);
      if(st.display==='none'||st.visibility==='hidden'||st.opacity==='0') return false;
      if(el.hasAttribute('hidden')) return false;
      const r=el.getBoundingClientRect();
      return r.width>2 && r.height>2;
    };
    const inputs=[...document.querySelectorAll('input[type="text"],input:not([type]),textarea')].filter(vis);
    const ai=[...document.querySelectorAll('#gkey,#pollenKey,#gateKey,#geminiBox,#keyGate,#inputRow,#txt')].filter(vis);
    const tip=[...document.querySelectorAll('#toast,.toast')].map(e=>e.textContent||'').join(' ');
    return {
      visibleTextInputs: inputs.map(e=>({id:e.id,ph:e.placeholder||'',type:e.type})),
      visibleAi: ai.map(e=>e.id||e.className),
      tipHasFreetext: /Was tust|Schreibe|Freitext|Erzählerin|Gemini|Tipp: Wähle/i.test(tip),
      bodyClass: document.body.className,
    };
  });
  if((domAudit.visibleTextInputs||[]).length) fail('jrpg-boot','visible text inputs '+JSON.stringify(domAudit.visibleTextInputs));
  else if((domAudit.visibleAi||[]).length) fail('jrpg-boot','visible AI UI '+JSON.stringify(domAudit.visibleAi));
  else ok('input-dom-audit', domAudit);
  if(!bootInfo.visual59) fail('ff-ui','missing visual59 class'); else ok('ff-ui',{visual59:true});

  // chapter / town
  await clickChoice(page,'Finanzen'); await new Promise(r=>setTimeout(r,200));
  await clickChoice(page,'Edikte'); await new Promise(r=>setTimeout(r,200));
  await clickChoice(page,'Festung'); await new Promise(r=>setTimeout(r,250));
  const town=await clickChoice(page,'Laden|Herberge|NPCs|Gruppe');
  if(!town.ok) fail('town', 'no town actions', town); else ok('town', town);
  await clickChoice(page,'Herberge|heilen'); await new Promise(r=>setTimeout(r,200));
  await clickChoice(page,'Zurück|Geschichte|Festung'); await new Promise(r=>setTimeout(r,200));

  // ally art
  const art=await page.evaluate(async()=>{
    const roles=['mage','spy','guard','daemon','hero','velka','brok','aria','princess'];
    const out={};
    for(const r of roles){
      const url=`./assets/pixel/battler/ally_${r}.png`;
      try{
        const res=await fetch(url); const buf=await res.arrayBuffer();
        out[r]={ok:res.ok, bytes:buf.byteLength};
      }catch(e){ out[r]={ok:false,err:String(e)} }
    }
    return out;
  });
  for(const [r,v] of Object.entries(art)){
    if(!v.ok || (v.bytes|0)<8000) fail('ally-art', r, v); else ok('ally-art', {[r]:v.bytes});
  }

  // real ATB bosses c1–c4
  async function prepBoss(chId){
    await page.evaluate((chId)=>{
      const g=window.__game; const ch=g.C60.CHAPTERS.find(c=>c.id===chId);
      g.S.campaign.chapterIdx=g.C60.CHAPTERS.findIndex(c=>c.id===chId);
      const keep=g.S.campaign.flags||{};
      g.S.campaign.flags={}; // fresh beat flags per chapter attempt
      g.C60.startDungeon(g.S, ch);
      g.C60.recruitMember(g.S,'Sekretärin Velka',{});
      g.C60.recruitMember(g.S,'Spionin Nyx',{});
      g.C60.recruitMember(g.S,'General Brok',{});
      if(chId==='c3'||chId==='c4'){ g.S.romance['Heldin Aria']={affection:50,stage:3}; g.C60.recruitMember(g.S,'Heldin Aria',{}); }
      g.S.st.lvl = chId==='c1'?4:chId==='c2'?5:chId==='c3'?7:9;
      g.S.st.str = chId==='c1'?22:chId==='c2'?26:chId==='c3'?30:36;
      g.S.st.maxhp = chId==='c1'?200:chId==='c2'?230:chId==='c3'?280:380;
      g.S.st.maxmp = 90; g.S.st.hp=g.S.st.maxhp; g.S.st.mp=g.S.st.maxmp;
      g.S.campaign.dungeon.room=(g.S.campaign.dungeon.rooms|0)+1;
      g.applyJrpgPack(g.C60.resolveChoice(g.S,{next:'dungeon'},{}));
    }, chId);
  }
  for(const chId of ['c1','c2','c3','c4']){
    let fr=null;
    for(let attempt=1; attempt<=(chId==='c4'?3:2); attempt++){
      await prepBoss(chId);
      await new Promise(r=>setTimeout(r,200));
      const bc=await clickChoice(page,'Boss');
      if(!bc.ok){ fail('boss-'+chId,'no boss btn',bc); fr={ok:false}; break; }
      await new Promise(r=>setTimeout(r,400));
      fr=await fightATB(page, chId==='c4'?180000:120000);
      if(fr.ok && fr.result==='win') break;
      // lose: restore HP and retry once
      await page.evaluate(()=>{ const g=window.__game; g.S.st.hp=g.S.st.maxhp; g.S.st.mp=g.S.st.maxmp; });
      await new Promise(r=>setTimeout(r,400));
    }
    if(!fr?.ok || fr.result!=='win') fail('boss-'+chId,'ATB fail',fr); else ok('boss-'+chId, fr);
    await new Promise(r=>setTimeout(r,700));
    const after=await page.evaluate(()=>({
      idx:window.__game.S.campaign.chapterIdx,
      scene:window.__game.S.campaign.sceneId,
      flags:window.__game.S.campaign.flags,
    }));
    if(chId==='c1' && after.scene==='c4_end') fail('softlock','c1 advanced to ending',after);
    if(chId==='c1' && after.idx!==1 && after.scene!=='c1_reward') fail('chapter-advance','c1 idx',after); else if(chId==='c1') ok('chapter-advance',after);
    if(chId==='c3' && after.scene==='c4_end') fail('softlock','c3 skipped to ending',after);
    if(chId==='c3' && after.scene!=='c4_open') fail('chapter-advance','c3 should open c4',after); else if(chId==='c3') ok('chapter-advance-c3',after);
  }

  // migrate old saves
  const mig=await page.evaluate(()=>{
    const g=window.__game;
    const results=[];
    for(const ver of [13,40,50,56,57,58]){
      const s={ver, st:{hp:50,maxhp:100,gold:10}, world:{npcs:{},scene:{}}, flags:{}, romance:{}, pc:{name:'Alt'}};
      try{
        (g.C67?.migrateV67||g.C66?.migrateV66||g.C64?.migrateV64||g.C63?.migrateV63||g.C62?.migrateV62||g.C61?.migrateV61||g.C60?.migrateV60)?.(s);
        results.push({ver, out:s.ver, campaign:s.campaign?.id, jrpg59:!!s.flags?.jrpg59, freetext:!!s.flags?.freetext});
      } catch(e){ results.push({ver, err:String(e)});}
    }
    return results;
  });
  for(const m of mig){
    if(m.err || m.out<59 || m.campaign!=='nocturna' || m.freetext) fail('migrate-saves', m); else ok('migrate-saves', m);
  }

  // v64 NPC dialogue across all hubs
  try{
    const dlg = await npcDialogueGate(page);
    ok('npc-dialogue-hubs', {hubs:dlg.map(h=>({ort:h.ort,n:h.npcCount,names:h.names}))});
  }catch(e){ fail('npc-dialogue', 'exception', {err:String(e)}); }

  // viewport smoke desktop
  await page.setViewport({width:1920,height:1080});
  await new Promise(r=>setTimeout(r,200));
  const desk=await page.evaluate(()=>({w:innerWidth, choices:document.querySelectorAll('#choices button').length}));
  if(desk.w<1000) fail('viewport-smoke','desktop',desk); else ok('viewport-smoke',desk);


  // v69: unique companion battlers + camera scale + pass tile repetition
  // v70: party stage vertical order matches list (Noctis→Velka→Brok→Aria)

  try{
    const bat = await page.evaluate(async()=>{
      const g=window.__game; const S=g.S;
      S.world=S.world||{}; S.world.npcs=S.world.npcs||{}; S.romance=S.romance||{};
      for(const n of ['Sekretärin Velka','General Brok','Heldin Aria']){
        S.world.npcs[n]=Object.assign({alive:true,art:n}, S.world.npcs[n]||{});
        S.romance[n]={affection:40,stage:2};
      }
      S.party=['Sekretärin Velka','General Brok','Heldin Aria'];
      const En=await import('./enemies.js');
      const f=En.enemyById('hellhound')||Object.values(En.ENEMIES||{})[0];
      g.Battle.startBattle(S,{enemies:[structuredClone(f)],scripted:true});
      await new Promise(r=>setTimeout(r,900));
      const imgs=[...document.querySelectorAll('.party-stage-spr img.battler-spr, .party-stage-spr img.pixel-hero-spr, #battleRoot img.battler-spr')];
      const srcs=imgs.map(i=>i.getAttribute('src')||i.src||'');
      const roles=imgs.map(i=>i.dataset.role||'');
      const sprs=[...document.querySelectorAll('.party-stage-spr')].map(el=>{
        const r=el.getBoundingClientRect();
        const img=el.querySelector('img');
        return {top:r.top|0, src:(img?.getAttribute('src')||'').split('/').pop()};
      }).sort((a,b)=>a.top-b.top);
      const list=[...document.querySelectorAll('.ff-party-row .ff-pname, .party-card .ff-pname')].map(e=>(e.textContent||'').replace(/👉/g,'').trim());
      const htmlSnippet=(document.getElementById('battleRoot')?.innerHTML||'').slice(0,200);
      const layers=[...document.querySelectorAll('.battle-layer,.battle-bg-tex')].map(e=>e.className);
      return {srcs, roles, n:imgs.length, htmlSnippet, sprs, list, layers, party:(window.__game?.Battle?._B?.party||[]).map(p=>({name:p.name,kind:p.kind}))};
    });
    const bases=(bat.srcs||[]).map(s=> (s.split('/').pop()||'').replace(/\?.*/,''));
    const uniq=[...new Set(bases.filter(Boolean))];
    if(uniq.length < 3) fail('unique-battlers', 'companions share sprites', {bases, roles:bat.roles});
    else ok('unique-battlers', {bases:uniq, roles:bat.roles});
    const want=['ally_hero.png','ally_velka.png','ally_brok.png','ally_aria.png'];
    const got=(bat.sprs||[]).map(s=>s.src);
    const orderOk = want.every((w,i)=> (got[i]||'').includes(w.replace('.png','')) || got[i]===w);
    if(!orderOk && got.length>=4) fail('party-order', 'stage top→bottom != Noctis/Velka/Brok/Aria', {got, list:bat.list});
    else ok('party-order', {got, list:bat.list});
    if(!(bat.layers||[]).some(c=>/battle-bg-tex|battle-layer/.test(c))) fail('battle-bg-tex','missing textured hall layers',{layers:bat.layers});
    else ok('battle-bg-tex',{layers:bat.layers});
    await page.evaluate(()=>{ try{ window.__game.Battle.__forceHide(); }catch(_){} });
  }catch(e){ fail('unique-battlers','exception',{err:String(e)}); }

  // v71: battler size + no overlap (party ~100-120px @1080p; foes large & centered)
  try{
    const sz = await page.evaluate(async()=>{
      const g=window.__game; const S=g.S;
      S.world=S.world||{}; S.world.npcs=S.world.npcs||{}; S.romance=S.romance||{};
      for(const n of ['Sekretärin Velka','General Brok','Heldin Aria']){
        S.world.npcs[n]=Object.assign({alive:true,art:n}, S.world.npcs[n]||{});
        S.romance[n]={affection:40,stage:2};
      }
      S.party=['Sekretärin Velka','General Brok','Heldin Aria'];
      const En=await import('./enemies.js');
      const f=En.enemyById('lesser_fiend')||En.enemyById('hellhound')||Object.values(En.ENEMIES||{})[0];
      try{ g.Battle.__forceHide?.(); }catch(_){ }
      document.body.classList.add('in-battle'); document.documentElement.classList.add('in-battle','battle-open');
      g.Battle.startBattle(S,{enemies:[structuredClone(f)],scripted:true});
      await new Promise(r=>setTimeout(r,1100));
      const root=document.getElementById('battleRoot')||document.querySelector('.battle-root');
      if(root){ root.classList.remove('hidden'); root.style.display=''; root.style.visibility='visible'; root.style.opacity='1'; }
      const party=[...document.querySelectorAll('.party-stage-spr img.battler-spr, .party-stage-spr img.pixel-hero-spr, .party-stage-spr img')].map(el=>{
        const r=el.getBoundingClientRect();
        const cs=getComputedStyle(el);
        const cw=parseFloat(cs.width)||0, ch=parseFloat(cs.height)||0;
        return {w:(r.width||cw)|0,h:(r.height||ch)|0,l:r.left|0,t:r.top|0,r:r.right|0,b:r.bottom|0,cw:cw|0,ch:ch|0};
      });
      const foes=[...document.querySelectorAll('.foe-art.battler-spr, .foe-art, .pixel-foe img, .foe-art-wrap img')].map(el=>{
        const r=el.getBoundingClientRect();
        const cs=getComputedStyle(el);
        const cw=parseFloat(cs.width)||0, ch=parseFloat(cs.height)||0;
        return {w:(r.width||cw)|0,h:(r.height||ch)|0,l:r.left|0,t:r.top|0,cx:((r.left+r.right)/2|| (parseFloat(cs.left)||0))|0,cw:cw|0,ch:ch|0};
      });
      const stage=document.querySelector('.battle-stage, #battleRoot, .battle-root');
      const sw=stage?.getBoundingClientRect()?.width || window.innerWidth || 1920;
      function ov(a,b){ const x=Math.max(0,Math.min(a.r,b.r)-Math.max(a.l,b.l)); const y=Math.max(0,Math.min(a.b,b.b)-Math.max(a.t,b.t)); return x*y; }
      let overlapPairs=0, maxOv=0;
      for(let i=0;i<party.length;i++) for(let j=i+1;j<party.length;j++){ const o=ov(party[i],party[j]); if(o>1800){ overlapPairs++; maxOv=Math.max(maxOv,o);} }
      const minH=party.length?Math.min(...party.map(p=>p.h)):0;
      const maxH=party.length?Math.max(...party.map(p=>p.h)):0;
      const foeH=foes[0]?.h||0; const foeCx=foes[0]?.cx||0;
      const hasAtkCss = !!(document.querySelector('style,link') && true);
      const cssText=[...document.styleSheets].flatMap(ss=>{ try{ return [...ss.cssRules].map(r=>r.cssText||''); }catch(_){ return []; } }).join('\n');
      const atkOk=/atkStepFwd|atk-step|slash/.test(cssText) || /atkStepFwd/.test(document.documentElement.innerHTML);
      return {party, foes, minH, maxH, overlapPairs, maxOv, foeH, foeCx, sw, atkOk, vh:window.innerHeight};
    });
    const minCssH = Math.min(...(sz.party||[]).map(p=>p.ch||p.h||0), 999);
    const tallEnough = Math.max(sz.minH|0, minCssH|0) >= 90;
    if(!(sz.party||[]).length) fail('battler-size', 'no party sprites found', sz);
    else if(!tallEnough) fail('battler-size', 'party sprites too small', sz);
    else if((sz.overlapPairs|0)>0 && (sz.minH|0)>0) fail('battler-size', 'party sprites overlap', sz);
    else ok('battler-size', {minH:sz.minH,maxH:sz.maxH,minCssH,overlapPairs:sz.overlapPairs,n:sz.party.length});
    const foeH = Math.max(sz.foeH|0, ...(sz.foes||[]).map(f=>f.ch||0), 0);
    const foeCx = sz.foeCx|0;
    if(foeH < 160) fail('foe-size', 'enemy too small', {foeH, foes:sz.foes, sw:sz.sw});
    else if(foeCx > 0 && foeCx > (sz.sw*0.55)) fail('foe-size', 'enemy not in left half', {foeH, foeCx, sw:sz.sw});
    else ok('foe-size', {foeH, foeCx, sw:sz.sw});
    if(!sz.atkOk) fail('atk-fx', 'missing atkStepFwd/slash css'); else ok('atk-fx',{atkOk:true});
    await page.evaluate(()=>{ try{ window.__game.Battle.__forceHide(); }catch(_){} });
  }catch(e){ fail('battler-size','exception',{err:String(e)}); }

  // v71: dungeon layout reuse + follow camera (no black-border zoom-out)
  try{
    const dung = await page.evaluate(async()=>{
      const g=window.__game; const S=g.S;
      const orte=[
        'Schatzkatakomben · Raum 1','Schatzkatakomben · Raum 3','Schatzkatakomben · Raum 5',
        'Wachtürme am Pass · Raum 1','Eishöhlen · Raum 1','Reliquiengewölbe · Raum 1',
        'Knochenlabyrinth · Raum 1','Gruft von Solmir · Raum 1','Kathedrale Solari · Raum 1',
        'Thronsaal'
      ];
      const maps=[];
      for(const ort of orte){
        S.world=S.world||{}; S.world.scene=S.world.scene||{};
        S.world.scene.ort=ort;
        if(/Raum/.test(ort)) { S.campaign=S.campaign||{}; S.campaign.mode='dungeon'; S.campaign.dungeon={name:ort.split('·')[0].trim(),room:parseInt((/Raum\\s*(\\d+)/.exec(ort)||[])[1]||'1',10),rooms:5}; }
        else { if(S.campaign) S.campaign.mode='scene'; }
        const m=g.OW.buildMapForLocation(S, ort);
        // fingerprint: floor mask hash + counts
        let floor=0,wall=0,sig=[];
        for(let y=0;y<m.h;y+=2) for(let x=0;x<m.w;x+=2){
          const t=m.tiles[y][x]; if(t==='floor'||t==='carpet'||t==='plaza'||t==='stone'){ floor++; sig.push(x+','+y+':'+t); }
          else if(t==='wall'||t==='void') wall++;
        }
        maps.push({ort,preset:m.preset,kind:m.kind,w:m.w,h:m.h,floor,wall,sig:sig.slice(0,80).join('|'), nChests:(m.chests||[]).length, nMarks:(m.questMarks||[]).length});
      }
      // camera check on Schatzkatakomben
      S.world.scene.ort='Schatzkatakomben · Raum 1';
      S.campaign.mode='dungeon';
      try{ g.OW.hideOverworld?.(); }catch(_){}
      try{ g.OW.mountOverworld?.({getS:()=>g.S, toast:()=>{}, save:()=>{}}); }catch(_){}
      g.OW.showOverworld(S);
      await new Promise(r=>setTimeout(r,600));
      const st=g.OW.__debug?.()||{};
      const view=st.renderView||st.view||{};
      const map=st.map||{};
      const scale=st.scale|0;
      const wholeMap = (view.w|0) >= (map.w|0) && (view.h|0) >= (map.h|0);
      return {maps, cam:{scale, viewW:view.w|0, viewH:view.h|0, mapW:map.w|0, mapH:map.h|0, preset:map.preset, kind:map.kind, wholeMap}};
    });
    const throne=dung.maps.find(m=>m.ort==='Thronsaal');
    const reuse=[];
    for(const m of dung.maps){
      if(m.ort==='Thronsaal') continue;
      if(m.preset==='throne') reuse.push({ort:m.ort, reason:'preset-throne'});
      if(throne && m.sig===throne.sig) reuse.push({ort:m.ort, reason:'sig-equals-throne'});
      if(m.kind!=='dungeon' && /Raum/.test(m.ort)) reuse.push({ort:m.ort, reason:'not-dungeon-kind', preset:m.preset, kind:m.kind});
    }
    // distinct presets among named dungeons
    const named=dung.maps.filter(m=>/Raum 1$/.test(m.ort));
    const presets=named.map(m=>m.preset);
    const uniqPres=[...new Set(presets)];
    // room variants within Schatzkatakomben should not be identical sigs
    const skat=dung.maps.filter(m=>/Schatzkatakomben/.test(m.ort));
    const skatSigs=[...new Set(skat.map(m=>m.sig))];
    if(reuse.length) fail('layout-reuse', 'dungeon reused throne/non-dungeon', {reuse, maps:dung.maps.map(m=>({ort:m.ort,preset:m.preset,kind:m.kind,w:m.w,h:m.h}))});
    else if(uniqPres.length < 4) fail('layout-reuse', 'too few distinct dungeon presets', {presets, uniqPres});
    else if(skatSigs.length < 2) fail('layout-reuse', 'Schatzkatakomben rooms identical', {skat:skat.map(s=>({ort:s.ort,floor:s.floor}))});
    else ok('layout-reuse', {presets:uniqPres, skatRooms:skatSigs.length, maps:dung.maps.map(m=>({ort:m.ort,preset:m.preset,w:m.w,h:m.h,floor:m.floor}))});

    if((dung.cam.scale|0)<2 || (dung.cam.scale|0)>4) fail('dungeon-camera', 'scale not ~3', dung.cam);
    else if(dung.cam.wholeMap) fail('dungeon-camera', 'zoom-out whole map / black border risk', dung.cam);
    else if((dung.cam.mapW|0) <= (dung.cam.viewW|0)+2) fail('dungeon-camera', 'map not larger than view (border risk)', dung.cam);
    else if((dung.cam.mapW|0) < 48) fail('dungeon-camera', 'map too small for follow cam', dung.cam);
    else ok('dungeon-camera', dung.cam);
    try{ await page.evaluate(()=>window.__game.OW.hideOverworld?.()); }catch(_){}
  }catch(e){ fail('layout-reuse','exception',{err:String(e)}); }


  try{
    const cam = await page.evaluate(async()=>{
      const g=window.__game; const S=g.S;
      S.world=S.world||{}; S.world.scene=S.world.scene||{};
      S.world.scene.ort='Grenzpass'; S.genre='daemon';
      try{ g.OW.hideDialogue?.(); }catch(_){}
      try{ g.OW.hideOverworld?.(); }catch(_){}
      try{ g.OW.mountOverworld?.({getS:()=>g.S, toast:()=>{}, save:()=>{}}); }catch(_){}
      g.OW.showOverworld(S);
      await new Promise(r=>setTimeout(r,700));
      const st = g.OW.__debug?.() || {};
      const canvas=document.getElementById('owCanvas');
      const cssW=canvas?.clientWidth|0, cssH=canvas?.clientHeight|0;
      const lw=canvas?.width|0, lh=canvas?.height|0;
      const scale = st.scale || (cssW && lw ? Math.round(cssW/lw) : 0);
      const view = st.renderView || st.view || {};
      const map = st.map||{};
      let greenish=0, samples=0, snowish=0;
      try{
        const ctx=canvas.getContext('2d');
        const step=48;
        for(let y=40;y<lh-40;y+=step) for(let x=40;x<lw-40;x+=step){
          const d=ctx.getImageData(x,y,1,1).data;
          samples++;
          if(d[1]>d[0]+20 && d[1]>d[2]+15 && d[1]>80) greenish++;
          if(d[0]>170 && d[1]>175 && d[2]>180) snowish++;
        }
      }catch(_){}
      const vw = (view.w|0) || (st.view?.w|0) || 0;
      const vh = (view.h|0) || (st.view?.h|0) || 0;
      return {
        scale, cssW, cssH, lw, lh,
        viewW: vw, viewH: vh,
        mapW: map.w|0, mapH: map.h|0, preset: map.preset, name: map.name,
        greenish, snowish, samples,
        greenRatio: samples? greenish/samples : 0,
        snowRatio: samples? snowish/samples : 0,
        tileCss: scale ? scale*16 : (cssW && vw ? cssW/vw : 0),
        pineOh: (st.overhead||[]).filter(o=>/pine/i.test(String(o.src||o.label||''))).length,
      };
    });
    // expect ~3x scale at 1080p, tileCss ~48, view much smaller than whole map, snow > green
    if((cam.scale|0) < 2 || (cam.scale|0) > 4) fail('camera-scale', 'scale not near 3', cam);
    else if(cam.viewW >= (cam.mapW||999) && (cam.mapW|0)>30) fail('camera-scale', 'view shows whole map', cam);
    else if((cam.tileCss|0) < 36) fail('camera-scale', 'tiles too tiny', cam);
    else ok('camera-scale', {scale:cam.scale, tileCss:cam.tileCss, view:cam.viewW+'x'+cam.viewH, map:cam.mapW+'x'+cam.mapH});

    if((cam.greenRatio||0) > 0.28 && (cam.snowRatio||0) < 0.12) fail('tile-repetition', 'pass too green / not snow-dominant', cam);
    else if((cam.pineOh|0) > 40) fail('tile-repetition', 'pine wall filler suspected', cam);
    else ok('tile-repetition', {greenRatio:cam.greenRatio, snowRatio:cam.snowRatio, samples:cam.samples, pineOh:cam.pineOh});
  }catch(e){ fail('camera-scale','exception',{err:String(e)}); }

  // v68: DOM overlap audit (battle + menu)
  try{
    await page.evaluate(async()=>{
      const g=window.__game; const S=g.S;
      S.world=S.world||{}; S.world.npcs=S.world.npcs||{}; S.romance=S.romance||{};
      for(const n of ['Sekretärin Velka','General Brok','Heldin Aria']){
        S.world.npcs[n]=Object.assign({alive:true,art:n}, S.world.npcs[n]||{});
        S.romance[n]={affection:40,stage:2};
      }
      S.party=['Sekretärin Velka','General Brok','Heldin Aria'];
      const En=await import('./enemies.js');
      const f=En.enemyById('hellhound')||Object.values(En.ENEMIES||{})[0];
      g.Battle.startBattle(S,{enemies:[structuredClone(f)],scripted:true});
    });
    await new Promise(r=>setTimeout(r,700));
    await overlapAudit(page, 'battle-ff69');
    await page.evaluate(()=>{ try{ window.__game.Battle.__forceHide(); }catch(_){} 
      try{ window.__game.openMenu('hub'); }catch(_){} });
    await new Promise(r=>setTimeout(r,500));
    await overlapAudit(page, 'menu-hub');
    await page.evaluate(()=>{ try{ window.__game.closeMenu(); window.__game.Battle.__forceHide(); }catch(_){} });
  }catch(e){ fail('overlap-audit','exception',{err:String(e)}); }


  await page.close();
}


async function overlapAudit(page, label){
  const hits=await page.evaluate(()=>{
    function vis(el){
      if(!el||el.hasAttribute('hidden')) return false;
      const st=getComputedStyle(el);
      if(st.display==='none'||st.visibility==='hidden'||Number(st.opacity)===0) return false;
      const r=el.getBoundingClientRect();
      return r.width>2 && r.height>2;
    }
    function rect(el){ const r=el.getBoundingClientRect(); return {l:r.left,t:r.top,r:r.right,b:r.bottom,w:r.width,h:r.height}; }
    function overlap(a,b){
      const x=Math.max(0, Math.min(a.r,b.r)-Math.max(a.l,b.l));
      const y=Math.max(0, Math.min(a.b,b.b)-Math.max(a.t,b.t));
      return x*y;
    }
    const root=document.getElementById('battleRoot');
    const menu=document.getElementById('menu')||document.getElementById('gameMenu');
    const targets=[];
    const push=(sel,where)=>{
      document.querySelectorAll(sel).forEach(el=>{ if(vis(el)) targets.push({el, where, text:(el.innerText||'').slice(0,40)}); });
    };
    if(root && !root.classList.contains('hidden') && vis(root)){
      push('.battle-ff67 #battleCmd .bcm, .battle-ff67 .ff-cmd-row', 'battle-cmd');
      push('.battle-ff67 .ff-pname, .battle-ff67 .ff-foe-name', 'battle-names');
      push('.battle-ff67 .battle-kb-hint', 'battle-hint');
      // icons top-right often .ow-hud buttons / #hud icons
      push('#hud .icon, #owHud button, .ow-top-icons button, .battle-timeline, .tl-item', 'chrome');
    }
    if(menu && !menu.classList.contains('hidden') && vis(menu)){
      push('#menu .hub button, #menu .menu-tabs button, .menu-panel button', 'menu');
      push('.menu-panel::after', 'menu-prompt'); // pseudo won't work; check footer text nodes
    }
    const bad=[];
    // 1) cmd buttons: each must be single-line and not overlap siblings
    const cmds=[...document.querySelectorAll('.battle-ff67 #battleCmd .bcm')].filter(vis);
    for(let i=0;i<cmds.length;i++){
      const a=rect(cmds[i]);
      if(a.h>42) bad.push({kind:'cmd-too-tall', text:cmds[i].innerText, h:a.h});
      if(/Fähigkeiltem|Technik\\s*Reden|Angriff\\S/i.test(cmds[i].innerText.replace(/\\s+/g,' '))) bad.push({kind:'cmd-jumble', text:cmds[i].innerText});
      // mashed labels: two words without newline when they should be separate cmds
      for(let j=i+1;j<cmds.length;j++){
        const o=overlap(a, rect(cmds[j]));
        if(o>20) bad.push({kind:'cmd-overlap', a:cmds[i].innerText.slice(0,20), b:cmds[j].innerText.slice(0,20), area:o});
      }
    }
    // 2) party names vs HP labels
    document.querySelectorAll('.battle-ff67 .ff-party-row').forEach(row=>{
      const name=row.querySelector('.ff-pname');
      const hp=row.querySelector('.ff-hp span, .ff-hp');
      if(name&&hp&&vis(name)&&vis(hp)){
        const o=overlap(rect(name), rect(hp));
        if(o>8) bad.push({kind:'name-hp-overlap', name:name.innerText, area:o});
      }
      if(name && /\\n|Sekretärin\\s*$/i.test(name.innerText)) bad.push({kind:'name-wrap', name:name.innerText});
    });
    // 3) kb hint vs top-right icons
    const hint=document.querySelector('.battle-ff67 .battle-kb-hint');
    if(hint&&vis(hint)){
      const hr=rect(hint);
      document.querySelectorAll('#hud button, #owHud button, .ow-icon, .battle-atb-mode').forEach(ic=>{
        if(!vis(ic)) return;
        const o=overlap(hr, rect(ic));
        if(o>10) bad.push({kind:'hint-icon-overlap', area:o, hint:hint.innerText, icon:(ic.title||ic.className||'').slice(0,24)});
      });
      // hint should not be in top 48px
      if(hr.t < 48) bad.push({kind:'hint-too-high', top:hr.t});
    }
    // 4) party sprites clipped above stage
    const stage=document.querySelector('.battle-ff67 .battle-stage');
    if(stage){
      const sr=rect(stage);
      document.querySelectorAll('.battle-ff67 .party-stage-spr .pixel-hero-spr').forEach((img,idx)=>{
        if(!vis(img)) return;
        const r=rect(img);
        if(r.t < sr.t - 2) bad.push({kind:'party-clipped-top', idx, top:r.t, stageTop:sr.t});
      });
    }
    // 5) menu prompt vs buttons
    const panel=document.querySelector('.menu-panel, #menu .panel, #gameMenu');
    if(panel&&vis(panel)){
      const footer=panel.innerText||'';
      // buttons overlapping each other heavily
      const btns=[...panel.querySelectorAll('button')].filter(vis).slice(0,24);
      for(let i=0;i<btns.length;i++){
        for(let j=i+1;j<btns.length;j++){
          const o=overlap(rect(btns[i]), rect(btns[j]));
          if(o>80) bad.push({kind:'menu-btn-overlap', a:btns[i].innerText.slice(0,18), b:btns[j].innerText.slice(0,18), area:Math.round(o)});
        }
      }
    }
    return bad.slice(0,40);
  });
  if(hits.length) fail('overlap-audit', label, {n:hits.length, hits});
  else ok('overlap-audit', {label, clean:true});
  return hits;
}


async function runLive(browser){
  const page=await browser.newPage();
  await page.setViewport({width:1280,height:720,isMobile:false,hasTouch:false}); // v66 PC-only
  const ver=await boot(page,{live:true});
  const liveOk = String(ver)===VER || (ONLY_LIVE && Number(ver)>=58);
  // When ONLY_LIVE waiting for 58 after push of 58, accept 58; for v59 ship expect 59 after deploy.
  // This gate when GATE_ONLY_LIVE against live before push may still be 58 — caller runs post-wait.
  if(ONLY_LIVE && process.env.GATE_EXPECT_LIVE){
    if(String(ver)!==process.env.GATE_EXPECT_LIVE) fail('live-site','VER',{ver, expect:process.env.GATE_EXPECT_LIVE});
    else ok('live-site',{ver});
  } else if(String(ver)!==VER && !ONLY_LIVE){
    fail('live-site','VER',{ver, expect:VER});
  } else {
    ok('live-site',{ver});
  }

  // old saves on live: inject v13/v50/v57 blobs into idb/local and load
  const saveTest=await page.evaluate(async()=>{
    const g=window.__game;
    const out=[];
    for(const ver of [13,50,57,58]){
      const s={ver, st:{hp:40,maxhp:100,gold:5,str:8}, world:{npcs:{'Sekretärin Velka':{alive:true,art:'Sukkubus'}},scene:{ort:'Test'}}, flags:{onboarded:true}, romance:{}, pc:{name:'Legacy'+ver}, genre:'daemon', role:'daemon'};
      try{
        if(g.C67?.migrateV67) g.C67.migrateV67(s);
        else if(g.C66?.migrateV66) g.C66.migrateV66(s);
        else if(g.C64?.migrateV64) g.C64.migrateV64(s);
        else if(g.C63?.migrateV63) g.C63.migrateV63(s);
        else if(g.C62?.migrateV62) g.C62.migrateV62(s);
        else if(g.C61?.migrateV61) g.C61.migrateV61(s);
        else if(g.C60?.migrateV60) g.C60.migrateV60(s);
        else if(g.C59?.migrateV59) g.C59.migrateV59(s);
        else if(g.C58?.migrateV58) g.C58.migrateV58(s);
        else throw new Error('no migrate');
        out.push({ver, ok:true, outVer:s.ver, campaign:s.campaign?.id, freetext:s.flags?.freetext});
      }catch(e){ out.push({ver, ok:false, err:String(e)});}
    }
    return {pageVer:g.VER, saves:out, hasC61:!!g.C61,hasC62:!!g.C62,hasC63:!!g.C63,hasC64:!!g.C64,hasC66:!!g.C66,hasC67:!!g.C67,hasC70:!!g.C70};
  });
  for(const s of saveTest.saves){
    if(!s.ok) fail('live-old-saves', s); else ok('live-old-saves', s);
  }
  await page.close();
  return saveTest;
}

const browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox']});
let server=null;
console.log(`Gate v${VER} classic JRPG (real ATB)`+(ONLY_LIVE?' ONLY_LIVE':SKIP_LIVE?' SKIP_LIVE':''));

try{
  if(ONLY_LIVE){
    console.log('=== LIVE SITE ===', LIVE);
    await runLive(browser);
  } else {
    server=await serve();
    await runLocal(browser);
    if(!SKIP_LIVE){
      console.log('=== LIVE SITE ===', LIVE);
      await runLive(browser);
    }
  }
} finally {
  await browser.close();
  if(server) server.close();
}

const by={};
for(const f of failures){ by[f.path]=(by[f.path]||0)+1; }
console.log('\n=== GATE SUMMARY ===');
console.log(JSON.stringify({failures:failures.length, by, paths:report.paths},null,2));
if(failures.length){ console.log('Failures:', failures.length); process.exit(1); }
console.log('GATE PASSED');
process.exit(0);
