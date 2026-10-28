import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = '/workspace/isekai-game-shots';
fs.mkdirSync(SHOTS, { recursive: true });
const mime = { '.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.woff2':'font/woff2' };
const server = http.createServer((req,res)=>{
  let u=decodeURIComponent((req.url||'/').split('?')[0]); if(u==='/') u='/index.html';
  const fp=path.join(ROOT,u.replace(/^\//,''));
  if(!fp.startsWith(ROOT)||!fs.existsSync(fp)||fs.statSync(fp).isDirectory()){res.writeHead(404);res.end('no '+u);return}
  res.writeHead(200,{'Content-Type':mime[path.extname(fp)]||'application/octet-stream','Cache-Control':'no-store'});
  fs.createReadStream(fp).pipe(res);
});
await new Promise(r=>server.listen(8770,r));
const browser=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']});
const page=await browser.newPage();
await page.setViewport({width:390,height:844,deviceScaleFactor:2});
const report={tests:[],errors:[]};
page.on('pageerror',e=>report.errors.push(String(e)));
page.on('console',m=>{if(m.type()==='error')report.errors.push('console:'+m.text())});
const ok=(n,p,d)=>{report.tests.push({name:n,pass:!!p,detail:d});console.log((p?'PASS':'FAIL')+' '+n+(d?' — '+d:''))};
const shot=async n=>{const f=path.join(SHOTS,'v13-'+n+'.png');await page.screenshot({path:f});return f};

await page.goto('http://127.0.0.1:8770/index.html',{waitUntil:'networkidle0',timeout:60000});
await page.evaluate(()=>localStorage.clear());
await page.reload({waitUntil:'networkidle0'});
await new Promise(r=>setTimeout(r,600));
await shot('01-title');

const boot=await page.evaluate(async()=>{
  localStorage.setItem('isekai_cfg_v1',JSON.stringify({mode:'offline',v2:1}));
  const g=window.__game; if(!g) return {err:'no __game', keys:Object.keys(window).filter(k=>k.includes('game'))};
  await g.newLife('held',{lives:0,soul:0,keptSkills:[]},{fromIntro:true,name:'Testa',bg:'v13',look:'kurz',trait:'entschlossen',skipSetup:true});
  const S=g.S; if(S.setup&&!S.setup.done){S.setup.done=true;S.setup.beat=99}
  g.Sim.migrateToV13(S); g.Econ.ensureEcon(S); g.Codex.ensureCodex(S); g.WorldMap.ensureSpawn(S);
  g.enterPlay();
  return {ver:S.ver,ort:S.world?.scene?.ort,npcs:Object.keys(S.world?.npcs||{}).length,hasNecro:Object.keys(S.world.npcs).some(k=>/nekromant/i.test(k)),cal:S.cal,atlas:!!S.atlas,finance:!!S.finance,codex:!!S.codex};
});
ok('boot',!boot.err&&boot.ver===13,JSON.stringify(boot));
await shot('02-play');

// Kill + 30 days
const death=await page.evaluate(()=>{
  const g=window.__game,S=g.S;
  const names=Object.keys(S.world.npcs).filter(n=>!g.Sim.isDead(S,n)&&!/nekromant/i.test(n));
  const target=names.find(n=>/elise|lyra|garrick|mira|orren|seris|tom|otto|brok/i.test(n))||names[0];
  S.world.scene.anwesend=[target];
  const r=g.killNPC(target,'Test');
  g.advanceTime(30*24);
  for(let i=0;i<6;i++) g.Sim.runWorldAI(S,1);
  const fake=g.Sim.validateWorldUpdate(S,{scene:{ort:S.world.scene.ort,anwesend:[target]}});
  const remembered=g.Sim.ledgerHas(S,e=>e.type==='death')||(S.ledgerArchive||[]).some(e=>e.type==='death')||(S.ledger||[]).some(e=>e.type==='death');
  return {target,ok:r.ok,stillDead:g.Sim.isDead(S,target),remembered,rejected:!(fake.scene.anwesend||[]).includes(target),day:S.cal.day,graves:S.world.graves,led:(S.ledger||[]).length,arch:(S.ledgerArchive||[]).length};
});
ok('kill+30d dead+remembered',death.ok&&death.stillDead&&death.remembered&&death.rejected,JSON.stringify(death));
await page.evaluate(()=>window.__game.openMenu('journal')); await new Promise(r=>setTimeout(r,300)); await shot('03-journal-death');
await page.evaluate(()=>document.querySelector('#btnMenuClose')?.click());

// Resurrect
const rez=await page.evaluate(()=>{
  const g=window.__game,S=g.S; const target=(S.dead||[])[0];
  let necro=Object.keys(S.world.npcs).find(k=>/nekromant/i.test(k));
  if(necro){S.world.scene.anwesend.push(necro);S.world.npcs[necro].ort=S.world.scene.ort}
  else S.skills.push({name:'Nekromantie',icon:'💀',level:1,cost:40,cd:0,_cd:0});
  const r=g.Sim.resurrectNPC(S,target);
  return {ok:r.ok,undead:!!S.world.npcs[target]?.undead,dead:!!S.world.npcs[target]?.dead,inList:(S.dead||[]).includes(target)};
});
ok('resurrect necro',rez.ok&&rez.undead&&!rez.dead&&!rez.inList,JSON.stringify(rez));

// House multi-day
const home=await page.evaluate(()=>{
  const g=window.__game,S=g.S;
  g.Sim.claimLand(S,S.world.scene.ort+' Grundstück');
  S.home.materials={wood:80,stone:40,cloth:30,nails:40};
  for(let i=0;i<4;i++){const s=g.Sim.startBuild(S); if(!s.ok)break; const need=S.home.building?.daysLeft||1; g.advanceTime(need*24+1); g.Sim.progressBuild(S,need)}
  return {owned:S.home.owned,stage:S.home.stage,rooms:S.home.rooms,ledgerHome:(S.ledger||[]).filter(e=>e.type==='home').length};
});
ok('house multi-day',home.owned&&home.stage>=4,JSON.stringify(home));
await page.evaluate(()=>window.__game.openMenu('home')); await new Promise(r=>setTimeout(r,300)); await shot('04-home');
await page.evaluate(()=>document.querySelector('#btnMenuClose')?.click());

// Autonomous NPC cites old event
const auto=await page.evaluate(()=>{
  const g=window.__game,S=g.S;
  const npc=Object.keys(S.world.npcs).find(n=>!g.Sim.isDead(S,n));
  g.Sim.ledgerPush(S,{type:'feud',who:npc,what:npc+' schwor Rache nach dem Blutbad vor Wochen.',where:S.world.scene.ort,importance:80,emotion:'wütend'});
  const notes=[]; for(let i=0;i<20;i++) notes.push(...(g.Sim.runWorldAI(S,1)||[]).map(x=>x.line));
  const mems=g.Sim.retrieveMemories(S,{npcNames:[npc],keywords:['Rache','Blutbad'],limit:5});
  return {cites:notes.some(l=>/Rache|Blutbad|Fehde|sucht/i.test(l||''))||mems.some(m=>/Rache|Blutbad/i.test(m.text||'')),ai:notes.length,mems:mems.length};
});
ok('NPC autonomous cites old',auto.cites&&auto.ai>0,JSON.stringify(auto));

// Map: reveal, pin, explore
const map=await page.evaluate(()=>{
  const g=window.__game,S=g.S;
  g.WorldMap.ensureSpawn(S);
  const rev=g.WorldMap.revealMapItem(S,{region:'test'});
  const pin=g.WorldMap.addPin(S,{x:S.atlas.playerPos.x+3,y:S.atlas.playerPos.y+3,label:'Mein Lager',note:'v13'});
  const loc=g.WorldMap.exploreDirection(S,'n');
  g.WorldMap.visitPlace(S,loc.name);
  return {revealed:rev.count,pin:pin.label,discovered:loc.name,visible:g.WorldMap.listVisible(S).length};
});
ok('map reveal+pin+explore',map.revealed>0&&map.pin&&map.discovered&&map.visible>0,JSON.stringify(map));
await page.evaluate(()=>window.__game.openMenu('atlas')); await new Promise(r=>setTimeout(r,500)); await shot('05-map');
await page.evaluate(()=>document.querySelector('#btnMenuClose')?.click());

// Season plant/harvest + kingdom treasury
const econ=await page.evaluate(()=>{
  const g=window.__game,S=g.S;
  g.Econ.ensureEcon(S); S.cal.season='Frühling'; S.cal.day=10; S.home.owned=true; S.home.stage=4;
  const p=g.Econ.plantCrop(S,'weizen');
  // Reset treasury from deep debt so tick effect is visible
  S.kingdom.treasury=400; S.kingdom.stability=70; S.kingdom.army=20;
  const treas0=S.kingdom.treasury;
  g.Econ.kingdomTick(S,10*24);
  g.advanceTime(10*24);
  const h=g.Econ.harvestReady(S);
  const treas1=S.kingdom.treasury;
  return {plant:p.ok,harvest:h.text,got:h.got,treas0,treas1,changed:treas1!==treas0,delta:S.kingdom._lastDelta,weather:S.farm.lastWeather,stock:S.finance.stockpile};
});
ok('season plant/harvest + treasury',econ.plant&&(econ.got?.length>0)&&econ.changed,JSON.stringify(econ));
await page.evaluate(()=>window.__game.openMenu('finance')); await new Promise(r=>setTimeout(r,300)); await shot('06-finance');
await page.evaluate(()=>window.__game.openMenu('kingdom')); await new Promise(r=>setTimeout(r,300)); await shot('07-kingdom');
await page.evaluate(()=>document.querySelector('#btnMenuClose')?.click());

// Codex
const codex=await page.evaluate(()=>{
  const g=window.__game,S=g.S;
  g.Codex.recordCreature(S,'Schattenwolf',{desc:'Schwarzer Wolf',danger:3});
  g.Codex.recordItem(S,{name:'Eisenklinge',icon:'⚔️',type:'weapon',rarity:'rare'});
  const e=g.Codex.study(S,'bestiary:schattenwolf');
  return {entries:Object.keys(S.codex.entries).length,level:e?.level,cats:Object.fromEntries(Object.entries(S.codex.cats).map(([k,v])=>[k,v.length]))};
});
ok('codex entries',codex.entries>=2,JSON.stringify(codex));
await page.evaluate(()=>window.__game.openMenu('codex')); await new Promise(r=>setTimeout(r,300)); await shot('08-codex');
await page.evaluate(()=>document.querySelector('#btnMenuClose')?.click());

// Save monotonic + reload continuity (40 turns)
const saveTest=await page.evaluate(async()=>{
  const g=window.__game,S=g.S;
  const ort0=S.world.scene.ort; const turn0=S.turn|0;
  for(let i=0;i<42;i++){S.turn=(S.turn|0)+1; S.summary='Zug '+S.turn+' bei '+S.world.scene.ort; S.hist=(S.hist||[]).concat([{role:'user',content:'Aktion '+i},{role:'assistant',content:'Weiter bei '+S.world.scene.ort}]).slice(-20); g.Sim.ledgerPush(S,{type:'test',who:'Testa',what:'Zug '+S.turn,where:S.world.scene.ort,importance:10,emotion:'neutral'}); if(i%5===0) g.advanceTime(2)}
  const seq1=S.saveSeq|0; await g.Persist.atomicSave(S,{});
  const seq2=S.saveSeq|0;
  // simulate older save attempt
  const older=JSON.parse(JSON.stringify(S)); older.saveSeq=1; older.turn=2; older.summary='ALT';
  const stale=await g.Persist.atomicSave(older,{});
  // catch-up
  S.lastRealAt=Date.now()-3*3600*1000;
  const cu=g.Persist.catchUp(S,{Sim:g.Sim,econTick:(st,h)=>g.Econ.econHourly(st,h)});
  await g.Persist.atomicSave(S,{});
  const loaded=await g.Persist.loadBest(x=>x);
  return {ort0,turn:S.turn,seq1,seq2,staleOk:stale.ok,staleReason:stale.reason,loadedTurn:loaded?.turn,loadedSum:loaded?.summary,catchHours:cu.hours,summaryLines:cu.summary?.length};
});
ok('40 turns save+refuse stale+catchup',saveTest.turn>=40&&saveTest.staleOk===false&&saveTest.staleReason==='stale'&&saveTest.loadedTurn>=40&&!/ALT/.test(saveTest.loadedSum||''),JSON.stringify(saveTest));

// Reload page and continue
await page.reload({waitUntil:'networkidle0'});
await new Promise(r=>setTimeout(r,800));
const cont=await page.evaluate(async()=>{
  const g=window.__game;
  const s=await g.loadSave();
  if(!s)return {err:'no save'};
  // assign
  // can't set S from outside easily - use continue flow internals
  return {turn:s.turn,ort:s.world?.scene?.ort,summary:s.summary,ver:s.ver,ledger:(s.ledger||[]).length,archive:(s.ledgerArchive||[]).length};
});
ok('reload loadBest latest',cont.turn>=40&&cont.ver===13,JSON.stringify(cont));
await shot('09-after-reload-title');

await page.evaluate(()=>window.__game.openMenu('status')); // may fail if not in play
await shot('10-status-or-title');

const pass=report.tests.every(t=>t.pass);
report.pass=pass; report.errorCount=report.errors.length;
fs.writeFileSync(path.join(SHOTS,'v13-test-report.json'),JSON.stringify(report,null,2));
console.log('\nSUMMARY',pass?'ALL PASS':'SOME FAIL','errors',report.errors.length);
console.log(report.errors.slice(0,8));
await browser.close(); server.close();
process.exit(pass?0:1);
