#!/usr/bin/env node
import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = '/workspace/isekai-game-shots';
fs.mkdirSync(OUT,{recursive:true});
for(const f of fs.readdirSync(OUT).filter(x=>/^v23-/.test(x))) fs.unlinkSync(path.join(OUT,f));
const PORT=8774;

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
  const dest=path.join(OUT,`v23-${name}.png`);
  await page.screenshot({path:dest,type:'png'});
  console.log('shot',name,fs.statSync(dest).size);
}

const server=await serve();
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--window-size=390,844']});
const page=await browser.newPage();
await page.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
page.setDefaultTimeout(30000);

await page.goto(`http://127.0.0.1:${PORT}/index.html?v=23`,{waitUntil:'networkidle0'});
await page.evaluate(()=>{localStorage.clear();sessionStorage.clear()});
await page.reload({waitUntil:'networkidle0'});
await new Promise(r=>setTimeout(r,400));
await shot(page,'title');

const started=await page.evaluate(async()=>{
  const g=window.__game; if(!g)return 'no-game';
  window.__FAST=true; window.__FORCE_CSS_SCENES=false; window.__SKIP_REMOTE_IMG=true;
  window.__setCfg?.({mode:'offline',debug:1,v2:1});
  try{
    await g.newLife('held',{lives:0,soul:0,keptSkills:[]},{skipSetup:true,name:'Aki'});
    if(g.S.setup&&!g.S.setup.done){g.S.setup.done=true;g.S.ver='22';g.enterPlay()}
    g.S.ver='22';
    g.S.world.scene={ort:'Taverne „Zum Silberkelch“',anwesend:['Lyra','Wirt Brok'],phase:'Abend',zeit:'Abend'};
    // seed inventory + skills for SVG icons
    g.S.inv=[
      {name:'Kurzschwert',type:'weapon',rarity:'uncommon',desc:'Zuverlässige Klinge',icon:''},
      {name:'Lederharnisch',type:'armor',rarity:'common',desc:'Leichter Schutz'},
      {name:'Heiltrank',type:'potion',rarity:'common',desc:'Stellt HP wieder her'},
      {name:'Aetherkristall',type:'gem',rarity:'rare',desc:'Pulsierender Splitter'},
      {name:'Alte Landkarte',type:'map',rarity:'uncommon',desc:'Verblichene Routen'},
      {name:'Gasthausschlüssel',type:'key',rarity:'common',desc:'Messing, abgenutzt'},
      {name:'Runenrolle',type:'scroll',rarity:'epic',desc:'Flüstert bei Mondlicht'},
      {name:'Sternensplitter',type:'gem',rarity:'legendary',desc:'Ein Sternengeist-Echo'},
    ];
    g.S.skills=[
      {name:'Doppelschlag',desc:'Zwei schnelle Hiebe',level:2,cost:5,cd:0,_cd:0},
      {name:'Heilende Hand',desc:'Heilt leichte Wunden',level:1,cost:8,cd:1,_cd:0},
      {name:'Schildwall',desc:'Blockiert den nächsten Treffer',level:1,cost:6,cd:2,_cd:0},
      {name:'Schattenportal',desc:'Kurzer magischer Schritt',level:1,cost:12,cd:3,_cd:0},
    ];
    try{g.Cont?.lockScene?.(g.S,'shot')}catch(_){}
    document.body.classList.add('genre-held','hud-dim');
    const sc=document.getElementById('sceneBg');
    if(sc){
      sc.className='scene-bg has-art';
      sc.style.background="#1a1010";
      sc.style.backgroundImage="url('/assets/bg/held/taverne-abend.webp')";
      sc.style.backgroundSize='cover'; sc.style.backgroundPosition='center';
    }
    const bg=document.getElementById('sceneImg');
    if(bg){bg.removeAttribute('crossorigin');bg.src='/assets/bg/held/taverne-abend.webp';bg.classList.add('on');bg.style.cssText='opacity:1;display:block;position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:2'}
    const ph=document.getElementById('scenePh'); if(ph) ph.style.display='none';
    const art=document.getElementById('sceneArt'); if(art) art.style.display='none';
    const wrap=document.getElementById('portraitWrap');
    const img=document.getElementById('portraitImg');
    if(wrap){wrap.classList.remove('hidden','dim');wrap.classList.add('portrait-bust','portrait-sprite','portrait-in')}
    if(img){img.dataset.masked='1';img.src='/assets/port/lyra.webp';img.onload=()=>img.classList.add('on');img.classList.add('on')}
    document.getElementById('speaker').textContent='Lyra';
    document.getElementById('speaker').classList.remove('hidden');
    document.getElementById('vnText').textContent='„Bleib sitzen.“ Lyra schiebt dir das Glas hin, ohne dich anzusehen. „Wenn du vom Bruch redest, dann leise.“';
    document.getElementById('choices').innerHTML='<button type="button">Mit Lyra sprechen</button><button type="button">Den Wirt fragen</button><button type="button">Zur Tür gehen</button>';
    return {ok:true,ver:g.S.ver};
  }catch(e){return {err:e.message}}
});
console.log('start',started);
await new Promise(r=>setTimeout(r,400));
await page.evaluate(()=>{
  document.getElementById('title')?.classList.add('hidden');
  document.getElementById('stage')?.classList.remove('hidden');
  document.getElementById('menu')?.classList.add('hidden');
  document.body.classList.add('genre-held','hud-dim');
  const img=document.getElementById('sceneImg');
  if(img){img.classList.remove('scene-fade-out');img.removeAttribute('crossorigin');
    img.src='/assets/bg/held/taverne-abend.webp';img.classList.add('on');img.style.opacity='1';img.style.zIndex='2'}
  const wrap=document.getElementById('portraitWrap');
  const pimg=document.getElementById('portraitImg');
  if(wrap){wrap.classList.remove('hidden','dim');wrap.classList.add('portrait-sprite','portrait-bust','portrait-in')}
  if(pimg){pimg.src='/assets/port/lyra.webp';pimg.classList.add('on');pimg.style.opacity='1'}
});
await new Promise(r=>setTimeout(r,500));
await shot(page,'play');

await page.evaluate(()=>{document.body.classList.remove('hud-dim'); window.__game.openMenu('hub')});
await new Promise(r=>setTimeout(r,400));
await shot(page,'hub');

await page.evaluate(()=>{
  const tile=[...document.querySelectorAll('.hub-tile')].find(t=>/Inventar/i.test(t.textContent||''));
  if(tile) tile.click();
  else document.querySelector('[data-tab="inv"]')?.click();
});
await new Promise(r=>setTimeout(r,450));
const invCheck=await page.evaluate(()=>({
  cells:document.querySelectorAll('.inv-cell').length,
  svgs:document.querySelectorAll('.inv-cell .ico-svg').length,
}));
console.log('inv',invCheck);
await shot(page,'inventory');

await page.evaluate(()=>{
  const b=[...document.querySelectorAll('#menuTabs button')].find(x=>x.dataset.tab==='skills'||/fähigkeit|skill/i.test(x.textContent||''));
  if(b) b.click();
});
await new Promise(r=>setTimeout(r,400));
await shot(page,'skills');

await page.evaluate(()=>{
  const b=[...document.querySelectorAll('#menuTabs button,.hub-tile')].find(x=>/atlas|Weltkarte|Karte/i.test(x.textContent||'')||x.dataset?.tab==='atlas');
  if(b) b.click();
  else {
    const tabs=document.getElementById('menuTabs');
    let t=document.querySelector('[data-tab="atlas"]');
    if(!t&&tabs){t=document.createElement('button');t.dataset.tab='atlas';t.textContent='Karte';tabs.appendChild(t); t.onclick=()=>{window._menuTab='atlas'; window.__game.UI13.renderMap(document.getElementById('menuBody'), window.__game.S, {act:()=>{},closeMenu:()=>{},toast:()=>{}})}}
    t?.click();
  }
});
await new Promise(r=>setTimeout(r,500));
await shot(page,'map');

await page.evaluate(()=>{
  document.getElementById('menu')?.classList.add('hidden');
  try{
    window.__game.Imm?.openCombat?.({foeName:'Schattenwolf',foeArt:'Ein dunkler Wolf aus dem Bruch',playerHP:80,playerMax:100,foeHP:35,foeMax:40,skills:[{id:'slash',name:'Schlag'},{id:'guard',name:'Halten'}]});
  }catch(e){console.log('battle',e)}
});
await new Promise(r=>setTimeout(r,500));
await shot(page,'battle');

await browser.close(); server.close();
console.log('done');
