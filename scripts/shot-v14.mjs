#!/usr/bin/env node
import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = '/workspace/isekai-game-shots';
fs.mkdirSync(OUT, {recursive:true});
const PORT = 8765;

function serve(){
  return new Promise(res=>{
    const server=http.createServer((req,res2)=>{
      let p=decodeURIComponent((req.url||'/').split('?')[0]);
      if(p==='/')p='/index.html';
      const fp=path.join(ROOT,p.replace(/^\//,''));
      if(!fp.startsWith(ROOT) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()){
        res2.writeHead(404); res2.end('404 '+p); return;
      }
      const ext=path.extname(fp);
      const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.json':'application/json','.woff2':'font/woff2'};
      res2.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream','Cache-Control':'no-store'});
      fs.createReadStream(fp).pipe(res2);
    });
    server.listen(PORT,()=>res(server));
  });
}

async function shot(page, name){
  const dest=path.join(OUT,`v14-${name}.png`);
  await page.screenshot({path:dest, type:'png'});
  console.log('shot', dest, fs.statSync(dest).size);
  return dest;
}

const server=await serve();
const browser=await puppeteer.launch({
  headless:true,
  args:['--no-sandbox','--disable-setuid-sandbox','--window-size=390,844']
});
const page=await browser.newPage();
await page.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
page.setDefaultTimeout(20000);

// Clear storage, load
await page.goto(`http://127.0.0.1:${PORT}/index.html?v=14`,{waitUntil:'networkidle0'});
await page.evaluate(()=>localStorage.setItem('isekai_cfg', JSON.stringify({v2:1,mode:'offline',debug:1})));
await page.evaluate(()=>{ localStorage.clear(); sessionStorage.clear(); });
await page.reload({waitUntil:'networkidle0'});
await new Promise(r=>setTimeout(r,800));
await shot(page,'01-title');

// Start held / skip setup if possible
const started = await page.evaluate(async ()=>{
  const g=window.__game;
  if(!g)return 'no-game';
  window.__FAST=true; if(window.__setCfg) window.__setCfg({mode:'offline',debug:1});
  else localStorage.setItem('isekai_cfg', JSON.stringify({v2:1,mode:'offline'}));
  try{
    await g.newLife('held',{lives:0,soul:0,keptSkills:[]},{skipSetup:true,name:'Aki'});
    const vn=document.querySelector('#vnText')?.textContent||'';
    return {ok:true, vn:vn.slice(0,80), ver:g.S?.ver, genre:document.body.dataset.genre, classes:[...document.body.classList].filter(c=>c.startsWith('genre-'))};
  }catch(e){ return {err:e.message} }
});
console.log('start', started);
await new Promise(r=>setTimeout(r,1500));
// skip setup if present
await page.evaluate(()=>{
  const btn=[...document.querySelectorAll('button')].find(b=>/überspringen|skip|weiter|beginnen|start/i.test(b.textContent||''));
  if(btn)btn.click();
});
await new Promise(r=>setTimeout(r,1200));
// try finish setup via API
await page.evaluate(()=>{
  const g=window.__game; if(!g||!g.S)return;
  if(g.S.setup && !g.S.setup.done){
    // answer minimally
    try{
      g.S.setup.done=true;
      g.S._setupChoices=null;
      if(typeof g.enterPlay==='function'){/* */}
    }catch(_){}
  }
});
// Click through setup choices if any
for(let i=0;i<8;i++){
  const clicked=await page.evaluate(()=>{
    const c=document.querySelector('#choices button');
    if(c){c.click();return c.textContent}
    return null;
  });
  if(!clicked)break;
  console.log('choice', clicked);
  await new Promise(r=>setTimeout(r,700));
}
await new Promise(r=>setTimeout(r,1500));
await shot(page,'02-play');

// Check dialogue / bg
const playInfo=await page.evaluate(()=>{
  const vn=document.querySelector('#vnText')?.textContent||'';
  const bg=getComputedStyle(document.querySelector('#sceneBg')||document.body).backgroundImage;
  const img=document.querySelector('#sceneBg img, .scene-bg img, #sceneArt img');
  const port=document.querySelector('#portraitWrap');
  return {
    vn:vn.slice(0,120),
    hasBgImg:!!(img&&img.src&&!img.src.includes('data:')),
    bgSrc:img?.src||bg?.slice(0,80),
    portHidden:port?.classList.contains('hidden'),
    portText:document.querySelector('#portraitPh')?.textContent||'',
    genre:document.body.dataset.genre||[...document.body.classList].filter(c=>c.startsWith('genre-')).join(',')
  };
});
console.log('playInfo', playInfo);

// Open hub
await page.click('#btnMenu').catch(()=>{});
await new Promise(r=>setTimeout(r,600));
await shot(page,'03-hub');

// Level tab
await page.evaluate(()=>{
  const b=[...document.querySelectorAll('#menuTabs button')].find(x=>x.dataset.tab==='level');
  if(b)b.click();
  else window.__game?.openMenu?.('level');
});
await new Promise(r=>setTimeout(r,500));
await shot(page,'04-level');

// Rels empty
await page.evaluate(()=>window.__game?.openMenu?.('rels'));
await new Promise(r=>setTimeout(r,400));
await shot(page,'05-rels-empty');

// Codex people empty
await page.evaluate(()=>window.__game?.openMenu?.('codex'));
await new Promise(r=>setTimeout(r,400));
await shot(page,'06-codex');

// Close menu, simulate name learn + Begegnung
await page.evaluate(()=>{
  const g=window.__game; const S=g.S;
  document.getElementById('menu')?.classList.add('hidden');
  const names=Object.keys(S.world?.npcs||{});
  const n=names[0];
  if(n){
    g.Know.learnName(S,n,'told');
    g.UI14.showBegegnung(n,S.world.npcs[n],{imgUrl:g.imgUrl,setPortrait:g.setPortrait,slug:n.toLowerCase().split(' ').pop()});
  }
});
await new Promise(r=>setTimeout(r,800));
await shot(page,'07-begegnung');

// After dismiss
await page.evaluate(()=>document.querySelector('#begOk')?.click());
await new Promise(r=>setTimeout(r,600));
await shot(page,'08-after-name');

// Genre themes: zombie body class
await page.evaluate(()=>{
  document.body.classList.remove('genre-fantasy'); document.body.classList.add('genre-zombie');
  document.body.dataset.genre='zombie';
});
await new Promise(r=>setTimeout(r,300));
await shot(page,'09-theme-zombie');

await page.evaluate(()=>{
  document.body.classList.remove('genre-zombie'); document.body.classList.add('genre-cyberpunk');
  document.body.dataset.genre='cyberpunk';
});
await shot(page,'10-theme-cyber');

await page.evaluate(()=>{
  document.body.classList.remove('genre-cyberpunk'); document.body.classList.add('genre-darkfantasy');
});
await shot(page,'11-theme-dark');

// Force local bg visible
await page.evaluate(()=>{
  document.body.classList.remove('genre-darkfantasy'); document.body.classList.add('genre-fantasy');
  const g=window.__game;
  g.setSceneImage?.('Beschwörungshalle im Königspalast', '');
});
await new Promise(r=>setTimeout(r,1200));
await shot(page,'12-bg-hall');

fs.writeFileSync(path.join(OUT,'v14-shot-meta.json'), JSON.stringify({playInfo, started, t:Date.now()},null,2));
await browser.close();
server.close();
console.log('DONE shots', fs.readdirSync(OUT).filter(f=>f.startsWith('v14')).join(', '));
