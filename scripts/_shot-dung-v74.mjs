import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
const ROOT='/workspace/isekai-game';
const OUT='/workspace/isekai-game-shots/v74-ship-report';
const PORT=8922; const VER='74';
const s=http.createServer((req,res)=>{
  let p=decodeURIComponent((req.url||'/').split('?')[0]); if(p==='/')p='/index.html';
  const fp=path.join(ROOT,p.replace(/^\//,''));
  if(!fp.startsWith(ROOT)||!fs.existsSync(fp)||fs.statSync(fp).isDirectory()){res.writeHead(404);res.end();return;}
  const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json'};
  res.writeHead(200,{'Content-Type':types[path.extname(fp)]||'application/octet-stream','Cache-Control':'no-store'});
  fs.createReadStream(fp).pipe(res);
});
await new Promise(r=>s.listen(PORT,r));
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox']});
const page=await browser.newPage();
await page.setViewport({width:1920,height:1080});
await page.goto(`http://127.0.0.1:${PORT}/?v=${VER}&pt=1`,{waitUntil:'domcontentloaded'});
await page.waitForFunction(v=>window.__game?.VER===v,{timeout:60000},VER);
await page.evaluate(async()=>{localStorage.clear();});
await page.reload({waitUntil:'domcontentloaded'});
await page.waitForFunction(v=>window.__game?.VER===v,{timeout:60000},VER);
await page.evaluate(async()=>{
  window.__FAST=true; window.__SKIP_REMOTE_IMG=true; window.__FORCE_CSS_SCENES=true; window.__PLAYTEST=true;
  window.__setCfg({mode:'offline', battleDiff:'story', atbMode:'active'});
  const g=window.__game;
  await g.newLife('daemon',{lives:0,soul:0,keptSkills:[]},{skipSetup:true,name:'Noctis'});
  g.S.setup={done:true}; g.S.flags=Object.assign(g.S.flags||{},{onboarded:true,introDone:true});
  g.S.st.hp=g.S.st.maxhp=160; g.S.st.mp=g.S.st.maxmp=80; g.S.st.gold=200; g.S.st.lvl=1;
  g.C60.migrateV60(g.S); g.C70?.migrateV70?.(g.S);
  g.enterPlay();
  document.getElementById('title')?.classList.add('hidden');
  document.getElementById('stage')?.classList.remove('hidden');
});
for(const [ort,slug] of [['Schatzkatakomben · Raum 1','katakomben-r1'],['Gruft von Solmir · Raum 1','gruft'],['Grenzpass','pass'],['Thronsaal der Nacht','throne']]){
  await page.evaluate((ort)=>{
    const g=window.__game;
    g.S.world=g.S.world||{}; g.S.world.scene=g.S.world.scene||{};
    g.S.world.scene.ort=ort;
    if(/katakomb|gruft/i.test(ort)){ g.S.content39=g.S.content39||{}; g.S.content39.dungeon=true; }
    else { if(g.S.content39) g.S.content39.dungeon=false; }
    g.OW.showOverworld(g.S);
  }, ort);
  await new Promise(r=>setTimeout(r,700));
  const meta=await page.evaluate(()=>window.__game.OW.__debug?.());
  console.log(slug, meta?.scale, meta?.view, meta?.map?.kind, meta?.map?.preset);
  await page.screenshot({path:`${OUT}/desktop1080-refresh-${slug}.png`});
}
await browser.close(); s.close();
