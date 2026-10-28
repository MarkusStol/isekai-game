#!/usr/bin/env node
import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = '/workspace/isekai-game-shots';
fs.mkdirSync(OUT,{recursive:true});
for(const f of fs.readdirSync(OUT).filter(x=>x.startsWith('v17-'))) fs.unlinkSync(path.join(OUT,f));
const PORT=8768;

function serve(){
  return new Promise(res=>{
    const server=http.createServer((req,res2)=>{
      let p=decodeURIComponent((req.url||'/').split('?')[0]);
      if(p==='/')p='/index.html';
      const fp=path.join(ROOT,p.replace(/^\//,''));
      if(!fp.startsWith(ROOT)||!fs.existsSync(fp)||fs.statSync(fp).isDirectory()){res2.writeHead(404);res2.end('404');return}
      const ext=path.extname(fp);
      const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.json':'application/json'};
      res2.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream','Cache-Control':'no-store'});
      fs.createReadStream(fp).pipe(res2);
    });
    server.listen(PORT,()=>res(server));
  });
}
async function shot(page,name){
  const dest=path.join(OUT,`v17-${name}.png`);
  await page.screenshot({path:dest,type:'png'});
  console.log('shot',dest,fs.statSync(dest).size);
}

const server=await serve();
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--window-size=390,844']});
const page=await browser.newPage();
await page.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
page.setDefaultTimeout(25000);

await page.goto(`http://127.0.0.1:${PORT}/index.html?v=17`,{waitUntil:'networkidle0'});
await page.evaluate(()=>{localStorage.clear();sessionStorage.clear()});
await page.reload({waitUntil:'networkidle0'});
await new Promise(r=>setTimeout(r,400));
await shot(page,'01-title');

const started=await page.evaluate(async()=>{
  const g=window.__game; if(!g)return 'no-game';
  window.__FAST=true; window.__FORCE_CSS_SCENES=true; window.__SKIP_REMOTE_IMG=true;
  window.__setCfg?.({mode:'offline',debug:1,v2:1,battleDiff:'normal',atbMode:'active'});
  try{
    await g.newLife('held',{lives:0,soul:0,keptSkills:[]},{skipSetup:true,name:'Aki'});
    if(g.S.setup&&!g.S.setup.done){g.S.setup.done=true;g.S.ver=17;g.enterPlay()}
    g.Jobs?.ensureJobs(g.S); g.Gems?.ensureGems(g.S); g.Summons?.ensureSummons(g.S); g.Equip?.ensureEquip(g.S);
    g.Jobs?.unlockJob(g.S,'beschwoerer'); g.Summons?.unlockSummon(g.S,'voltaris');
    g.S.cfgBattleDiff='normal'; g.S.cfgAtbMode='active';
    return {ok:true,ver:g.S.ver,jobs:!!g.Jobs,jrpg:!!g.Jrpg};
  }catch(e){return {err:e.message}}
});
console.log('start',started);
await new Promise(r=>setTimeout(r,500));
await shot(page,'02-play');

// Encounter choices
await page.evaluate(async()=>{
  const g=window.__game;
  window.__encP=g.Battle.offerEncounter(g.S,{count:2,noBoss:true,blurb:'v17 Begegnung — freie Wahl.'});
  await new Promise(r=>setTimeout(r,350));
});
await shot(page,'03-encounter');

// Fight → battle UI
await page.evaluate(()=>{
  const b=[...document.querySelectorAll('.encounter-cmds .bcm')].find(x=>/Kämpfen/i.test(x.textContent||''));
  if(b) b.click();
});
await new Promise(r=>setTimeout(r,700));
await shot(page,'04-battle-atb');

// Open skills / classic menu visible
await page.evaluate(()=>{
  const b=[...document.querySelectorAll('.bcm')].find(x=>/Fähigkeit|Skills|Magie/i.test(x.textContent||''));
  if(b) b.click();
});
await new Promise(r=>setTimeout(r,300));
await shot(page,'05-skills');

await page.evaluate(()=>{
  const back=[...document.querySelectorAll('.bcm')].find(x=>/Zurück|◀/.test(x.textContent||''));
  if(back) back.click();
});
await new Promise(r=>setTimeout(r,200));

// Summon menu
await page.evaluate(()=>{
  const b=[...document.querySelectorAll('.bcm')].find(x=>/Beschwörung/i.test(x.textContent||''));
  if(b) b.click();
});
await new Promise(r=>setTimeout(r,300));
await shot(page,'06-summon');

await page.evaluate(()=>{
  const back=[...document.querySelectorAll('.bcm')].find(x=>/◀/.test(x.textContent||''));
  if(back) back.click();
});

// Job menu
await page.evaluate(()=>{
  const b=[...document.querySelectorAll('.bcm')].find(x=>/^Beruf$/i.test((x.textContent||'').trim())||/Beruf/i.test(x.textContent||''));
  if(b) b.click();
});
await new Promise(r=>setTimeout(r,300));
await shot(page,'07-jobs');

await page.evaluate(()=>{
  const back=[...document.querySelectorAll('.bcm')].find(x=>/◀/.test(x.textContent||''));
  if(back) back.click();
});

// Boss battle with stagger bar
const boss=await page.evaluate(async()=>{
  const g=window.__game;
  // end current if any
  try{ const B=g.Battle.getBattle(); if(B){ B.done=true; document.getElementById('battleRoot')?.classList.add('hidden'); } }catch(_){}
  const {enemyById}=await import('./enemies.js');
  const foe=enemyById('boss_ogre');
  g.Battle.startBattle(g.S,{enemies:[foe], bg:'assets/bg/battle/arena-fantasy.webp'});
  await new Promise(r=>setTimeout(r,500));
  const stag=!!document.querySelector('.foe-stagger');
  const cmds=[...document.querySelectorAll('.bcm')].map(b=>b.textContent.trim()).slice(0,12);
  return {stag, cmds, foes:document.querySelectorAll('.foe-card').length};
});
console.log('boss',boss);
await shot(page,'08-boss-stagger');

// Social still there
await page.evaluate(()=>{
  const b=[...document.querySelectorAll('.bcm')].find(x=>/Reden/i.test(x.textContent||''));
  if(b) b.click();
});
await new Promise(r=>setTimeout(r,250));
await shot(page,'09-social');

// Settings difficulty
await page.evaluate(()=>{
  document.getElementById('battleRoot')?.classList.add('hidden');
  window.__game?.openSheet?.() || document.getElementById('btnSettings')?.click();
});
await new Promise(r=>setTimeout(r,200));
await page.evaluate(()=>{ document.getElementById('btnAdv')?.click(); });
await new Promise(r=>setTimeout(r,200));
await shot(page,'10-settings-diff');

console.log('done');
await browser.close(); server.close();
