import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
const ROOT='/workspace/isekai-game';
const OUT='/workspace/isekai-game-shots/v61-after';
const PORT=8901;
const VER='61';
fs.mkdirSync(OUT,{recursive:true});
const log=[];
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

async function boot(page){
  await page.goto(`http://127.0.0.1:${PORT}/?v=${VER}&pt=1`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction((v)=>window.__game?.VER===v,{timeout:45000}, VER);
  await page.evaluate(()=>localStorage.clear());
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction((v)=>window.__game?.VER===v,{timeout:45000}, VER);
  await page.evaluate(async()=>{
    window.__FAST=true; window.__SKIP_REMOTE_IMG=true; window.__PLAYTEST=true;
    window.__setCfg({mode:'offline', battleDiff:'story', atbMode:'active'});
    const g=window.__game;
    await g.newLife('daemon',{lives:0,soul:0,keptSkills:[]},{skipSetup:true,name:'Noctis'});
    g.S.setup={done:true};
    g.S.flags=Object.assign(g.S.flags||{},{onboarded:true,introDone:true,visual45Tip:1});
    g.S.st.hp=g.S.st.maxhp=180; g.S.st.mp=g.S.st.maxmp=80; g.S.st.gold=200; g.S.st.lvl=4;
    g.C61.migrateV61(g.S);
    g.enterPlay();
    document.getElementById('title')?.classList.add('hidden');
    document.getElementById('stage')?.classList.remove('hidden');
    try{ g.OW.mountOverworld({getS:()=>g.S, toast:(m)=>g.toast?.(m)}); }catch(_){}
  });
  await new Promise(r=>setTimeout(r,400));
}

async function shotOW(page, ort, slug, tag){
  const meta=await page.evaluate((ort)=>{
    const g=window.__game;
    g.S.world.scene.ort=ort; g.S.genre='daemon';
    try{ g.OW.hideOverworld?.(); }catch(_){}
    g.OW.showOverworld(g.S);
    g.syncOwHud?.(ort);
    g.hud?.();
    const m=g.OW.buildMapForLocation(g.S, ort);
    const d=g.OW.__debug?.();
    return {
      ort, scene:g.S.world.scene.ort,
      preset:m?.preset, kind:m?.kind, name:m?.name, w:m?.w, h:m?.h,
      chests:(m?.chests||[]).length, overhead:(m?.overhead||[]).length,
      hud:document.querySelector('#hud .loc-line')?.textContent||'',
      debugPreset:d?.map?.preset, canvasW:document.getElementById('owCanvas')?.width,
      canvasCss:document.getElementById('owCanvas')?.style?.width,
      bodyClass:document.body.className
    };
  }, ort);
  await new Promise(r=>setTimeout(r,700));
  const file=`${tag}-ow-${slug}.png`;
  await page.screenshot({path:`${OUT}/${file}`});
  log.push({shot:file, meta});
  return meta;
}

async function shotBattle(page, ort, foeId, slug, tag, forceLose=false){
  const meta=await page.evaluate(async(ort, foeId, forceLose)=>{
    const g=window.__game;
    g.S.world.scene.ort=ort; g.S.genre='daemon';
    try{ g.OW.hideOverworld?.(); }catch(_){}
    // clear tip toast
    try{ const t=document.getElementById('toast'); if(t){ t.classList.remove('on','toast-tip'); t.textContent=''; } }catch(_){}
    if(forceLose){ g.S.st.hp=8; g.S.st.maxhp=180; }
    else { g.S.st.hp=180; g.S.st.maxhp=180; }
    const foe = g.Battle?.designEncounter ? null : null;
    // open battle via Battle API
    const En = await import('./enemies.js');
    const bg = En.battleBgFor(g.S);
    const f = En.enemyById(foeId) || En.ENEMIES[foeId];
    // clear toast again right before battle
    try{ const t=document.getElementById('toast'); if(t){ t.classList.remove('on'); t.textContent=''; } }catch(_){}
    document.body.classList.add('in-battle');
    await g.Battle.startBattle(g.S, {
      enemies:[structuredClone(f)],
      foes:[structuredClone(f)],
      bg,
      canFlee:true,
      scripted: !!forceLose
    });
    await new Promise(r=>setTimeout(r,600));
    if(forceLose){
      try{ g.Battle.__forceLose?.('Die Gruppe sinkt zu Boden. Kehre zur Herberge zurück oder versuche es erneut.'); }catch(_){}
      await new Promise(r=>setTimeout(r,500));
    }
    try{ const t=document.getElementById('toast'); if(t){ t.classList.remove('on'); t.textContent=''; } }catch(_){}
    const root=document.getElementById('battleRoot');
    const foeImgs=[...document.querySelectorAll('.foe-art, .battler-spr')].map(img=>({src:img.getAttribute('src'), w:img.naturalWidth, h:img.naturalHeight, disp:getComputedStyle(img).display}));
    const bgEl=document.getElementById('battleBg');
    const toastOn=document.getElementById('toast')?.classList.contains('on');
    const endVisible=!document.getElementById('battleEnd')?.classList.contains('hidden');
    return {
      bg, bgStyle:bgEl?.style?.backgroundImage||'', foeImgs, toastOn, endVisible,
      endText:document.getElementById('battleEnd')?.innerText?.slice(0,200)||'',
      cmdText:document.querySelector('.battle-cmd')?.innerText?.slice(0,120)||''
    };
  }, ort, foeId, forceLose);
  await new Promise(r=>setTimeout(r,600));
  const file=`${tag}-battle-${slug}${forceLose?'-defeat':''}.png`;
  await page.screenshot({path:`${OUT}/${file}`});
  log.push({shot:file, meta});
  try{ await page.evaluate(()=>{ try{ window.__game?.Battle?.hideBattleUI?.(); document.getElementById('battleRoot')?.classList.add('hidden'); }catch(_){}}); }catch(_){}
  return meta;
}

// Desktop
{
  const page=await browser.newPage();
  await page.setViewport({width:1280,height:720});
  await boot(page);
  await page.screenshot({path:`${OUT}/desktop-01-boot.png`});
  for(const [ort,slug] of [['Grenzpass','pass'],['Ruinen von Solmir','crypt'],['Thronsaal der Nacht','throne'],['Kathedrale des Lichts','cathedral']]){
    await shotOW(page, ort, slug, 'desktop');
  }
  await shotBattle(page, 'Grenzpass', 'hellhound', 'pass', 'desktop', false);
  await shotBattle(page, 'Grenzpass', 'ash_hound', 'ash', 'desktop', true);
  await shotBattle(page, 'Thronsaal der Nacht', 'demon_imp', 'throne', 'desktop', false);
  // side scene
  await page.evaluate(()=>{
    const g=window.__game;
    try{ g.OW?.hideOverworld?.(); }catch(_){}
    g.applyJrpgPack(g.C61.resolveChoice(g.S,{next:'c1_side'},{}));
  });
  await new Promise(r=>setTimeout(r,500));
  await page.screenshot({path:`${OUT}/desktop-06-side-velka.png`});
  await page.close();
}

// Mobile
{
  const page=await browser.newPage();
  await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
  await boot(page);
  await page.screenshot({path:`${OUT}/mobile-01-boot.png`});
  for(const [ort,slug] of [['Grenzpass','pass'],['Ruinen von Solmir','crypt'],['Thronsaal der Nacht','throne'],['Kathedrale des Lichts','cathedral']]){
    await shotOW(page, ort, slug, 'mobile');
  }
  await shotBattle(page, 'Grenzpass', 'hellhound', 'pass', 'mobile', false);
  await shotBattle(page, 'Grenzpass', 'ash_hound', 'ash', 'mobile', true);
  await shotBattle(page, 'Thronsaal der Nacht', 'demon_imp', 'throne', 'mobile', false);
  await page.evaluate(()=>{
    const g=window.__game;
    try{ g.OW?.hideOverworld?.(); }catch(_){}
    g.applyJrpgPack(g.C61.resolveChoice(g.S,{next:'c1_side'},{}));
  });
  await new Promise(r=>setTimeout(r,500));
  await page.screenshot({path:`${OUT}/mobile-06-side-velka.png`});
  // menu
  await page.evaluate(()=>{ try{ window.__game.openMenu('party'); }catch(_){}});
  await new Promise(r=>setTimeout(r,400));
  await page.screenshot({path:`${OUT}/mobile-05-menu.png`});
  await page.close();
}

fs.writeFileSync(`${OUT}/v61-shot-log.json`, JSON.stringify({log},null,2));
console.log(JSON.stringify({n:log.length, presets:log.filter(x=>x.meta?.preset).map(x=>({shot:x.shot,preset:x.meta.preset,hud:x.meta.hud}))},null,2));
await browser.close(); s.close();
