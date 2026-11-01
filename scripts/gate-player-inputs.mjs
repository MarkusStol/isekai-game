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
const VER='64';
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
  await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
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
    const roles=['mage','spy','guard','daemon','hero'];
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
    if(chId==='c1' && after.idx!==1) fail('chapter-advance','c1 idx',after); else if(chId==='c1') ok('chapter-advance',after);
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
        g.C64?.migrateV64?.(s) || g.C63?.migrateV63?.(s) || g.C62?.migrateV62?.(s) || g.C61?.migrateV61?.(s) || g.C60.migrateV60(s);
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

  await page.close();
}

async function runLive(browser){
  const page=await browser.newPage();
  await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
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
        if(g.C64?.migrateV64) g.C64.migrateV64(s); else if(g.C63?.migrateV63) g.C63.migrateV63(s); else if(g.C62?.migrateV62) g.C62.migrateV62(s);
        else if(g.C61?.migrateV61) g.C61.migrateV61(s);
        else if(g.C60?.migrateV60) g.C60.migrateV60(s);
        else if(g.C59?.migrateV59) g.C59.migrateV59(s);
        else if(g.C58?.migrateV58) g.C58.migrateV58(s);
        else throw new Error('no migrate');
        out.push({ver, ok:true, outVer:s.ver, campaign:s.campaign?.id, freetext:s.flags?.freetext});
      }catch(e){ out.push({ver, ok:false, err:String(e)});}
    }
    return {pageVer:g.VER, saves:out, hasC61:!!g.C61,hasC62:!!g.C62,hasC63:!!g.C63,hasC64:!!g.C64};
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
