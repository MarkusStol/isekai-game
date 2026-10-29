#!/usr/bin/env node
import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const ROOT=path.join(path.dirname(fileURLToPath(import.meta.url)),'..');
const OUT='/workspace/isekai-game-shots';
fs.mkdirSync(OUT,{recursive:true});
for(const f of fs.readdirSync(OUT).filter(x=>/^v32-/.test(x))) fs.unlinkSync(path.join(OUT,f));
const PORT=8786, VER='32';
function serve(){return new Promise(res=>{
  const server=http.createServer((req,res2)=>{
    let p=decodeURIComponent((req.url||'/').split('?')[0]); if(p==='/')p='/index.html';
    const fp=path.join(ROOT,p.replace(/^\//,''));
    if(!fp.startsWith(ROOT)||!fs.existsSync(fp)||fs.statSync(fp).isDirectory()){res2.writeHead(404);res2.end();return}
    const ext=path.extname(fp);
    const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.json':'application/json','.ogg':'audio/ogg','.woff2':'font/woff2'};
    res2.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream','Cache-Control':'no-store'});
    fs.createReadStream(fp).pipe(res2);
  });
  server.listen(PORT,()=>res(server));
});}
async function shot(page,name){
  const dest=path.join(OUT,`v32-${name}.png`);
  await page.screenshot({path:dest,type:'png'});
  console.log('shot',name,fs.statSync(dest).size);
}
const server=await serve();
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox']});
const page=await browser.newPage();

async function boot(desk=false){
  const vp=desk?{width:1920,height:1080,deviceScaleFactor:1}:{width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true};
  await page.setViewport(vp);
  await page.goto(`http://127.0.0.1:${PORT}/index.html?v=${VER}`,{waitUntil:'networkidle0',timeout:60000});
  await page.evaluate(()=>{localStorage.clear();sessionStorage.clear()});
  await page.reload({waitUntil:'networkidle0'});
  await page.waitForFunction(v=>window.__game?.VER===v,{timeout:30000},VER);
}

await boot(false);
await shot(page,'title');

// Intro cutscene
await page.evaluate(async()=>{
  const g=window.__game;
  const p=g.Cut31.playIntroCutscene({});
  window.__ip=p;
  await new Promise(r=>setTimeout(r,1400));
});
await shot(page,'intro-cutscene');
await page.evaluate(()=>document.getElementById('introSkip')?.click());
await page.evaluate(()=>window.__ip?.catch?.(()=>{}));

// Fantasy play
await page.evaluate(async()=>{
  const g=window.__game; window.__setCfg({mode:'offline'});
  await g.newLife('held',{lives:0,soul:0,keptSkills:[]},{skipSetup:true,name:'Aki'});
  g.S.setup.done=true; g.S.ver='32'; g.enterPlay();
  document.body.classList.add('pixel-jrpg','genre-held');
});
await new Promise(r=>setTimeout(r,400));
await shot(page,'fantasy-vn');
await page.evaluate(()=>{ const g=window.__game; g.OW.showOverworld(g.S); });
await new Promise(r=>setTimeout(r,600));
await shot(page,'fantasy-ow-summon');

// Travel locked airship
await page.evaluate(()=>{
  document.getElementById('owRoot')&&(document.getElementById('owRoot').style.display='');
  const g=window.__game; g.OW.hideOverworld?.(); g.openRegionTravelMap();
});
await new Promise(r=>setTimeout(r,400));
await shot(page,'travel-airship-locked');

// Unlock + harbors
await page.evaluate(async()=>{
  document.getElementById('travelMap')?.classList.add('hidden');
  const g=window.__game;
  g.S.st.gold=600;
  g.S.world.npcs['Kaufmann Reis']=g.S.world.npcs['Kaufmann Reis']||{art:'Reisender Händler Karawane',ort:'Markt'};
  g.openPixelShop('Kaufmann Reis');
});
await new Promise(r=>setTimeout(r,350));
await shot(page,'shop-market-ticket');
await page.evaluate(()=>{
  const rows=[...document.querySelectorAll('.pixel-shop-row')];
  rows.find(r=>/Luftschiff/i.test(r.textContent||''))?.click();
  document.getElementById('pixelShop')?.classList.add('hidden');
});

await page.evaluate(async()=>{
  const g=window.__game;
  const nodes=g.S.world.graph.nodes;
  nodes['Hafen von Myr']=Object.assign(nodes['Hafen von Myr']||{},{harbor:true,tags:['harbor'],desc:'Salzige Luft.',exits:['Containerhafen Test']});
  nodes['Containerhafen Test']={harbor:true,tags:['harbor'],desc:'Kräne.',exits:['Hafen von Myr']};
  g.S.world.orte['Containerhafen Test']='Kräne.';
  g.S.discovered=[...new Set([...(g.S.discovered||[]),'Hafen von Myr','Containerhafen Test'])];
  await g.travelTo('Hafen von Myr',{force:true,hours:1});
  g.openRegionTravelMap();
  [...document.querySelectorAll('.tm-mode')].find(b=>/Boot/.test(b.textContent||''))?.click();
});
await new Promise(r=>setTimeout(r,400));
await shot(page,'travel-boat-harbors');
await page.evaluate(()=>{
  [...document.querySelectorAll('.tm-mode')].find(b=>/Luftschiff/.test(b.textContent||''))?.click();
});
await new Promise(r=>setTimeout(r,200));
await shot(page,'travel-airship-unlocked');
await page.evaluate(()=>document.getElementById('travelMap')?.classList.add('hidden'));

// Art grid
await page.evaluate(()=>{
  let d=document.getElementById('artPrev'); if(!d){d=document.createElement('div');d.id='artPrev';document.body.appendChild(d)}
  d.style.cssText='position:fixed;inset:0;background:#1a1028;z-index:9999;display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:12px;overflow:auto';
  d.innerHTML='';
  for(let i=0;i<8;i++){const im=document.createElement('img');im.src=`./assets/pixel/decor/housebig${i}.png`;im.style.cssText='width:100%;image-rendering:pixelated;background:#000';d.appendChild(im)}
  for(let i=0;i<4;i++){const im=document.createElement('img');im.src=`./assets/pixel/decor/hall${i}.png`;im.style.cssText='width:100%;image-rendering:pixelated;background:#000';d.appendChild(im)}
  for(const n of ['crash','void','goddess','paths','fall','pose_hero_fall','pose_goddess_cast']){const im=document.createElement('img');im.src=`./assets/pixel/cutscene/${n}.png`;im.style.cssText='width:100%;image-rendering:pixelated;background:#000';d.appendChild(im)}
});
await new Promise(r=>setTimeout(r,500));
await shot(page,'art-houses-cutscene');
await page.evaluate(()=>document.getElementById('artPrev')?.remove());

// Genres
for(const [id,boot] of [['zombie','zombie'],['cyberpunk','cyberpunk']]){
  await bootFresh();
  await page.evaluate(async (boot)=>{
    const g=window.__game; window.__setCfg({mode:'offline'});
    await g.startProcedural(boot,'Aki');
    document.body.classList.add('pixel-jrpg');
    g.OW.showOverworld(g.S);
  }, boot);
  await new Promise(r=>setTimeout(r,700));
  await shot(page,`genre-${id}-ow`);
  await page.evaluate(()=>{window.__game.OW.hideOverworld?.();});
  await shot(page,`genre-${id}-vn`);
}
async function bootFresh(){
  await page.evaluate(()=>localStorage.clear());
  await page.reload({waitUntil:'networkidle0'});
  await page.waitForFunction(v=>window.__game?.VER===v,{timeout:20000},VER);
}

// Desktop
await boot(true);
await page.evaluate(async()=>{
  const g=window.__game; window.__setCfg({mode:'offline'});
  await g.newLife('held',{lives:0,soul:0,keptSkills:[]},{skipSetup:true,name:'Aki'});
  g.S.setup.done=true; g.enterPlay();
  document.body.classList.add('pixel-jrpg','genre-held');
  g.OW.showOverworld(g.S);
});
await new Promise(r=>setTimeout(r,700));
await shot(page,'desktop-overworld');

// Market HUD-ish via shop meta
await page.evaluate(()=>{
  const g=window.__game;
  g.OW.hideOverworld?.();
  g.S.cal=g.S.cal||{}; g.S.cal.season='Winter';
  g.Econ.ensureMarket(g.S);
  g.Econ.pushMarketEvent(g.S,{id:'raid',label:'Banditenüberfall',mult:1.4,days:2,cats:['food','weapon']});
  g.openPixelShop('Kaufmann Reis');
});
await new Promise(r=>setTimeout(r,350));
await shot(page,'market-winter-event');

await browser.close(); server.close();
console.log('shots', fs.readdirSync(OUT).filter(x=>/^v32-/.test(x)).length);
