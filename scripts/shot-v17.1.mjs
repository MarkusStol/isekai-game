#!/usr/bin/env node
import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = '/workspace/isekai-game-shots';
fs.mkdirSync(OUT,{recursive:true});
for(const f of fs.readdirSync(OUT).filter(x=>x.startsWith('v17.1-'))) fs.unlinkSync(path.join(OUT,f));
const PORT=8769;

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
  const dest=path.join(OUT,`v17.1-${name}.png`);
  await page.screenshot({path:dest,type:'png'});
  console.log('shot',dest,fs.statSync(dest).size);
}

const server=await serve();
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--window-size=390,844']});
const page=await browser.newPage();
await page.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
page.setDefaultTimeout(25000);

await page.goto(`http://127.0.0.1:${PORT}/index.html?v=17.1`,{waitUntil:'networkidle0'});
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
    if(g.S.setup&&!g.S.setup.done){g.S.setup.done=true;g.S.ver='17.1';g.enterPlay()}
    g.Jobs?.ensureJobs(g.S); g.Gems?.ensureGems(g.S); g.Summons?.ensureSummons(g.S); g.Equip?.ensureEquip(g.S);
    g.Jobs?.unlockJob(g.S,'beschwoerer'); g.Jobs?.unlockJob(g.S,'paladin');
    g.Summons?.unlockSummon(g.S,'voltaris');
    g.S.st.gold=800;
    g.S.equip.mats={'Eisenbarren':10,'Leder':8,'Runensplitter':5,'Holzstab':3,'Eiskristall':3};
    g.S.cfgBattleDiff='normal'; g.S.cfgAtbMode='active';
    g.save?.();
    return {ok:true,ver:g.S.ver,ui17:!!g.UI17, tiles:g.UI14?.HUB_TILES?.map(t=>t.id)};
  }catch(e){return {err:e.message}}
});
console.log('start',started);
await new Promise(r=>setTimeout(r,400));
await shot(page,'02-play');

// Open hub menu
await page.evaluate(()=>{ window.__game.openMenu(); });
await new Promise(r=>setTimeout(r,350));
await shot(page,'03-hub');

async function openTab(id){
  await page.evaluate((tab)=>{
    const g=window.__game;
    const tile=[...document.querySelectorAll('.hub-tile')].find(t=>t.textContent.includes(
      ({equip:'Ausrüstung',jobs:'Berufe',gambits:'Einsatz',craft:'Werkstatt',summons:'Geister'}[tab]||tab)
    ));
    if(tile) tile.click();
    else {
      // force via helpers
      const btn=[...document.querySelectorAll('#menuTabs button')].find(b=>b.dataset.tab===tab);
      if(btn) btn.click();
      else { g.openMenu(); /* re-open then */ 
        const body=document.getElementById('menuBody');
        if(body && g.UI17){
          // inject by setting tab through openMenu re-render
          const tabs=document.getElementById('menuTabs');
          let b=document.querySelector(`[data-tab="${tab}"]`);
          if(!b && tabs){ b=document.createElement('button'); b.dataset.tab=tab; b.textContent=tab; tabs.appendChild(b); }
          b?.click();
        }
      }
    }
  }, id);
  await new Promise(r=>setTimeout(r,400));
}

await openTab('equip');
await shot(page,'04-equip');

// select gem + show sockets
await page.evaluate(()=>{
  const chip=document.querySelector('.gem-chip');
  if(chip) chip.click();
});
await new Promise(r=>setTimeout(r,250));
await shot(page,'05-gems-select');

await page.evaluate(()=>{
  // back to hub
  const back=[...document.querySelectorAll('#menuSheet button, .menu-back, #btnMenuBack')].find(b=>/Zurück|Hub|Menü/i.test(b.textContent||''));
  if(back) back.click();
  else window.__game.openMenu();
});
await new Promise(r=>setTimeout(r,300));

await openTab('jobs');
await shot(page,'06-jobs');

await page.evaluate(()=>window.__game.openMenu());
await new Promise(r=>setTimeout(r,250));
await openTab('gambits');
await shot(page,'07-gambits');

await page.evaluate(()=>window.__game.openMenu());
await new Promise(r=>setTimeout(r,250));
await openTab('craft');
await shot(page,'08-craft');

await page.evaluate(()=>window.__game.openMenu());
await new Promise(r=>setTimeout(r,250));
await openTab('summons');
await shot(page,'09-summons');

// Superboss setpiece (encounter sheet)
await page.evaluate(()=>{
  document.getElementById('menuSheet')?.classList.add('hidden');
  document.getElementById('menuRoot')?.classList.add('hidden');
  const g=window.__game;
  window.__sb=g.UI17.startSuperbossSetpiece(g.S, g.Battle, {toast:()=>{}});
});
await new Promise(r=>setTimeout(r,500));
await shot(page,'10-superboss');

console.log('done');
await browser.close(); server.close();
