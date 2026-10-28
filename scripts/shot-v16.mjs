#!/usr/bin/env node
import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = '/workspace/isekai-game-shots';
fs.mkdirSync(OUT,{recursive:true});
for(const f of fs.readdirSync(OUT).filter(x=>x.startsWith('v16-'))) fs.unlinkSync(path.join(OUT,f));
const PORT=8767;

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
  const dest=path.join(OUT,`v16-${name}.png`);
  await page.screenshot({path:dest,type:'png'});
  console.log('shot',dest,fs.statSync(dest).size);
}

const server=await serve();
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--window-size=390,844']});
const page=await browser.newPage();
await page.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
page.setDefaultTimeout(25000);

await page.goto(`http://127.0.0.1:${PORT}/index.html?v=16`,{waitUntil:'networkidle0'});
await page.evaluate(()=>{localStorage.clear();sessionStorage.clear()});
await page.reload({waitUntil:'networkidle0'});
await new Promise(r=>setTimeout(r,500));
await shot(page,'01-title');

const started=await page.evaluate(async()=>{
  const g=window.__game; if(!g)return 'no-game';
  window.__FAST=true; window.__FORCE_CSS_SCENES=true; window.__SKIP_REMOTE_IMG=true;
  window.__setCfg?.({mode:'offline',debug:1,v2:1});
  try{
    await g.newLife('held',{lives:0,soul:0,keptSkills:[]},{skipSetup:true,name:'Aki'});
    if(g.S.setup&&!g.S.setup.done){g.S.setup.done=true;g.S.ver=16;g.enterPlay()}
    return {ok:true,ver:g.S.ver,hasBattle:!!g.Battle};
  }catch(e){return {err:e.message}}
});
console.log('start',started);
await new Promise(r=>setTimeout(r,800));
await shot(page,'02-play');

// Offer encounter sheet
const enc=await page.evaluate(async()=>{
  const g=window.__game; const S=g.S;
  const foes=g.Battle? null : null;
  const {pickEncounter}=await import('./enemies.js').catch(()=>({}));
  // use Battle.offerEncounter but don't await full — start and shot
  const p=g.Battle.offerEncounter(S,{count:2,noBoss:true,blurb:'Test-Begegnung. Du entscheidest.'});
  // store promise
  window.__encP=p;
  await new Promise(r=>setTimeout(r,400));
  const sheet=!!document.querySelector('.encounter-sheet');
  const btns=[...document.querySelectorAll('.encounter-cmds .bcm')].map(b=>b.textContent);
  return {sheet,btns};
});
console.log('enc',enc);
await shot(page,'03-encounter-choices');

// Choose fight
await page.evaluate(()=>{
  const b=[...document.querySelectorAll('.encounter-cmds .bcm')].find(x=>/Kämpfen/i.test(x.textContent||''));
  if(b) b.click();
});
await new Promise(r=>setTimeout(r,700));
const battle=await page.evaluate(()=>{
  const root=document.getElementById('battleRoot');
  const foes=[...document.querySelectorAll('.foe-card .foe-name')].map(x=>x.textContent);
  const cmds=[...document.querySelectorAll('.bcm')].map(b=>b.textContent.trim()).slice(0,12);
  const arts=[...document.querySelectorAll('.foe-art')].map(img=>({src:img.getAttribute('src'),displayed:img.style.display!=='none'&&img.offsetParent!==null||img.complete}));
  return {visible:root&&!root.classList.contains('hidden'), foes, cmds, arts, hasSocial:cmds.some(c=>/Reden|Verschonen|Drohen/.test(c)), hasAuto:cmds.some(c=>/Auto/.test(c))};
});
console.log('battle',battle);
await shot(page,'04-battle-screen');

// Target attack
await page.evaluate(()=>{
  const atk=[...document.querySelectorAll('.bcm')].find(b=>b.textContent.trim()==='Angriff');
  if(atk) atk.click();
});
await new Promise(r=>setTimeout(r,200));
await page.evaluate(()=>{ const f=document.querySelector('.foe-card:not(.dead)'); if(f) f.click() });
await new Promise(r=>setTimeout(r,500));
await shot(page,'05-after-attack');

// Social / auto
await page.evaluate(()=>{
  // if waiting for player again
  const auto=[...document.querySelectorAll('.bcm')].find(b=>/Auto/.test(b.textContent||''));
  const reden=[...document.querySelectorAll('.bcm')].find(b=>/^Reden/.test(b.textContent||''));
  if(auto) auto.click(); else if(reden) reden.click();
});
await new Promise(r=>setTimeout(r,1200));
await shot(page,'06-end-or-social');

// Fresh encounter → talk path (non-combat)
await page.evaluate(()=>{ const r=document.getElementById('battleRoot'); if(r) r.classList.add('hidden'); });
const talk=await page.evaluate(async()=>{
  const g=window.__game;
  // Direct non-combat via offer — click Reden
  const p=g.Battle.offerEncounter(g.S,{enemies:[{...((await import('./enemies.js')).enemyById('bandit'))}],blurb:'Ein Wegelagerer blockiert den Weg.'});
  window.__encP2=p;
  await new Promise(r=>setTimeout(r,300));
  const b=[...document.querySelectorAll('[data-a=talk]')].find(Boolean);
  if(b) b.click();
  const res=await Promise.race([p, new Promise(r=>setTimeout(()=>r({timeout:1}),5000))]);
  return {choice:res.choice, text:res.summary?.text?.slice(0,120), nonCombat:!!res.summary?.nonCombat};
});
console.log('talk',talk);
await shot(page,'07-talk-resolve');

// Hub still works
await page.evaluate(()=>{try{window.__game.openMenu('hub')}catch(_){}});
await new Promise(r=>setTimeout(r,300));
await shot(page,'08-hub');

await page.evaluate(()=>{try{window.__game.openMenu('level')}catch(_){}});
await new Promise(r=>setTimeout(r,300));
await shot(page,'09-level');

console.log('done');
await browser.close(); server.close();
