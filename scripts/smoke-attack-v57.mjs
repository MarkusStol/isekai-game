import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const ROOT=path.join(path.dirname(fileURLToPath(import.meta.url)),'..');
const PORT=8879;
const s=http.createServer((req,res)=>{
  let p=decodeURIComponent((req.url||'/').split('?')[0]); if(p==='/')p='/index.html';
  const fp=path.join(ROOT,p.replace(/^\//,''));
  if(!fs.existsSync(fp)||fs.statSync(fp).isDirectory()){res.writeHead(404);res.end();return;}
  const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.json':'application/json','.ogg':'audio/ogg'};
  res.writeHead(200,{'Content-Type':types[path.extname(fp)]||'application/octet-stream','Cache-Control':'no-store'});
  fs.createReadStream(fp).pipe(res);
});
await new Promise(r=>s.listen(PORT,r));
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox']});
const page=await browser.newPage();
page.on('pageerror',e=>console.log('PAGEERR',String(e)));
await page.goto(`http://127.0.0.1:${PORT}/?v=57`,{waitUntil:'domcontentloaded'});
await page.evaluate(async()=>{ try{ const regs=await navigator.serviceWorker?.getRegistrations?.()||[]; await Promise.all(regs.map(r=>r.unregister())); }catch(_){}});
await page.reload({waitUntil:'domcontentloaded'});
await page.waitForFunction(()=>window.__game?.VER==='57',{timeout:45000});
const row=await page.evaluate(async()=>{
  const G=window.__game;
  window.__FAST=true; window.__PLAYTEST=true; window.__SKIP_REMOTE_IMG=true; window.__FORCE_CSS_SCENES=true; window.__gateNoBattle=true;
  window.__setCfg({mode:'offline',v2:1});
  await G.startProcedural('fantasy','Atk');
  G.S.setup={done:true}; G.S.flags={onboarded:true,introDone:true};
  G.enterPlay();
  await new Promise(r=>setTimeout(r,400));
  const intent=G.parsePlayerIntent('ich greife an');
  const off=G.offlineRespondIntent('ich greife an', intent);
  const off2=G.offline('ich greife an');
  await G.act('ich greife an');
  await new Promise(r=>setTimeout(r,600));
  // boss talk
  window.__gateNoBattle=false;
  const {enemyById}=await import('./enemies.js');
  await G.Battle.startBattle(G.S,{enemies:[enemyById('boss_ogre')],atbMode:'wait',scripted:true,dungeonBoss:true});
  const B=G.Battle.getBattle();
  const hero=B?.party?.find(p=>p.kind==='hero')||B?.party?.[0];
  if(hero){ hero.atb=100; B.selecting={actor:hero,mode:'bossTalk'}; B.atbMode='wait'; }
  await G.Battle.renderBattleUI();
  await new Promise(r=>setTimeout(r,300));
  return {
    intent, offText:(off?.text||'').slice(0,140), offlineText:(off2?.text||'').slice(0,140),
    vn:(document.getElementById('vnText')?.textContent||'').slice(0,160),
    hasParty:!!B?.party, bossTalk:!!document.querySelector('.boss-talk-sheet')
  };
});
console.log(JSON.stringify(row,null,2));
await browser.close(); s.close();
if(!/angreif|kampf|steht bereit/i.test(row.offText+row.offlineText+row.vn)) process.exit(2);
if(!row.hasParty) process.exit(3);
