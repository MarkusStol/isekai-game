import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
const ROOT='/workspace/isekai-game';
const OUT='/workspace/isekai-game-shots/v63-ship-report';
const PORT=8910;
const VER='63';
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

async function auditDom(page){
  return page.evaluate(()=>{
    const vis=el=>{
      if(!el) return false;
      if(el.hasAttribute('hidden')) return false;
      const st=getComputedStyle(el);
      if(st.display==='none'||st.visibility==='hidden') return false;
      const r=el.getBoundingClientRect();
      return r.width>1 && r.height>1;
    };
    const textInputs=[...document.querySelectorAll('input,textarea')].filter(el=>{
      const t=(el.type||'text').toLowerCase();
      if(['hidden','checkbox','radio','button','submit','range','color','file'].includes(t)) return false;
      return vis(el);
    }).map(el=>({id:el.id,type:el.type,ph:el.placeholder||'',tag:el.tagName}));
    return {
      textInputs,
      inputRowVis: vis(document.getElementById('inputRow')),
      keyGateVis: vis(document.getElementById('keyGate')),
      geminiVis: vis(document.getElementById('geminiBox')),
      gkeyVis: vis(document.getElementById('gkey')),
      bodyClass: document.body.className,
      freetext: !!(window.__game?.FREETEXT_ENABLED),
      ver: window.__game?.VER,
      vn: (document.getElementById('vnText')?.innerText||'').slice(0,160),
      toast: (document.getElementById('toast')?.innerText||'').slice(0,120),
    };
  });
}

async function boot(page){
  await page.goto(`http://127.0.0.1:${PORT}/?v=${VER}&pt=1`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(v=>window.__game?.VER===v,{timeout:45000}, VER);
  await page.evaluate(()=>localStorage.clear());
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(v=>window.__game?.VER===v,{timeout:45000}, VER);
  await page.evaluate(()=>{
    window.__FAST=true; window.__SKIP_REMOTE_IMG=true; window.__PLAYTEST=true;
    window.__setCfg({mode:'offline', battleDiff:'story', atbMode:'active'});
  });
}

async function shot(page, name, tag){
  const file=`${tag}-${name}.png`;
  await page.screenshot({path:`${OUT}/${file}`});
  const audit=await auditDom(page);
  log.push({shot:file, audit});
  console.log(file, 'inputs=', audit.textInputs.length, 'ft=', audit.freetext);
  return audit;
}

async function play(page){
  await page.evaluate(async()=>{
    const g=window.__game;
    await g.newLife('daemon',{lives:0,soul:0,keptSkills:[]},{skipSetup:true,name:'Noctis'});
    g.S.setup={done:true};
    g.S.flags=Object.assign(g.S.flags||{},{onboarded:true,introDone:true,visual45Tip:1,visual63:true});
    g.C63?.migrateV63?.(g.S);
    g.enterPlay();
    document.getElementById('title')?.classList.add('hidden');
    document.getElementById('stage')?.classList.remove('hidden');
    document.getElementById('onboardCoach')?.classList.add('hidden');
    try{ g.OW.mountOverworld({getS:()=>g.S, toast:(m)=>g.toast?.(m)}); }catch(_){}
  });
  await new Promise(r=>setTimeout(r,500));
}

async function ow(page, ort){
  await page.evaluate((ort)=>{
    const g=window.__game;
    g.S.world.scene.ort=ort; g.S.genre='daemon';
    try{ g.OW.hideOverworld?.(); }catch(_){}
    g.OW.showOverworld(g.S);
    g.syncOwHud?.(ort); g.hud?.();
    try{
      const d=g.OW.__debug?.();
      const ohs=d?.overhead||[];
      const mark=ohs.find(o=>/throne|altar|Wachturm|campfire|Thron|Altar/i.test(String(o.label||o.src||'')))||ohs[0];
      if(mark) g.OW.__setHero?.(mark.x, Math.min((d.map?.h||14)-2, (mark.y|0)+3));
    }catch(_){}
  }, ort);
  await new Promise(r=>setTimeout(r,700));
}

for(const [w,h,tag,mobile] of [[1280,720,'desktop',false],[390,844,'mobile',true]]){
  const page=await browser.newPage();
  await page.setViewport({width:w,height:h,isMobile:mobile,hasTouch:mobile});
  await boot(page);
  await shot(page,'01-title',tag);

  // new game via UI button
  await page.evaluate(()=>document.getElementById('btnNew')?.click());
  await new Promise(r=>setTimeout(r,1200));
  await shot(page,'02-newgame',tag);

  // force clean play state for remaining screens
  await play(page);
  await shot(page,'03-intro-or-play',tag);

  await ow(page,'Thronsaal der Nacht');
  await shot(page,'04-town-throne',tag);

  // NPC talk
  await page.evaluate(()=>{
    const g=window.__game;
    try{ g.OW.__talkNearest?.(); }catch(_){}
    // also force short dialogue
    try{
      g.OW.showDialogue?.({speaker:'Velka', text:'Die Register sind bereit, Fürst.'});
    }catch(_){}
  });
  await new Promise(r=>setTimeout(r,600));
  await shot(page,'05-npc-talk',tag);
  await page.evaluate(()=>{ try{ window.__game.OW.hideDialogue?.(); }catch(_){} });

  // shop
  await page.evaluate(()=>{ try{ window.__game.openPixelShop('Markt'); }catch(_){} });
  await new Promise(r=>setTimeout(r,500));
  await shot(page,'06-shop',tag);
  await page.evaluate(()=>{ try{ document.getElementById('pixelShop')?.classList.add('hidden'); }catch(_){} });

  // inn / rest via toast location
  await ow(page,'Grenzpass');
  await shot(page,'07-pass-dungeonish',tag);

  await ow(page,'Ruinen von Solmir');
  await shot(page,'08-crypt',tag);

  await ow(page,'Kathedrale des Lichts');
  await shot(page,'09-cathedral',tag);

  // battle
  await page.evaluate(async()=>{
    const g=window.__game;
    try{ g.OW.hideOverworld?.(); }catch(_){}
    const En=await import('./enemies.js');
    const f=En.enemyById('hellhound')||En.ENEMIES.hellhound;
    document.body.classList.add('in-battle');
    await g.Battle.startBattle(g.S,{enemies:[structuredClone(f)],foes:[structuredClone(f)],bg:En.battleBgFor(g.S),canFlee:true});
  });
  await new Promise(r=>setTimeout(r,900));
  await shot(page,'10-battle',tag);
  await page.evaluate(()=>{ try{ window.__game.Battle?.endBattle?.({result:'flee'}); }catch(_){}
    document.body.classList.remove('in-battle');
    document.getElementById('battleRoot')?.classList.add('hidden');
  });

  // menu + fortschritt
  await page.evaluate(()=>window.__game.openMenu('hub'));
  await new Promise(r=>setTimeout(r,500));
  await shot(page,'11-menu',tag);
  await page.evaluate(()=>window.__game.openMenu('v62'));
  await new Promise(r=>setTimeout(r,1200));
  await shot(page,'12-progress',tag);
  await page.evaluate(()=>window.__game.closeMenu?.() || document.getElementById('btnMenuClose')?.click());

  // settings
  await page.evaluate(()=>window.__game.openSheet());
  await new Promise(r=>setTimeout(r,400));
  await shot(page,'13-settings',tag);
  await page.evaluate(()=>document.getElementById('btnClose')?.click());

  // save/continue surface on title
  await page.evaluate(()=>{ try{ window.__game.save?.(); }catch(_){} });
  await page.goto(`http://127.0.0.1:${PORT}/?v=${VER}&pt=1`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(v=>window.__game?.VER===v,{timeout:45000}, VER);
  await new Promise(r=>setTimeout(r,400));
  await shot(page,'14-title-save',tag);

  await page.close();
}

const bad=log.filter(x=>(x.audit.textInputs||[]).length || x.audit.inputRowVis || x.audit.keyGateVis || x.audit.geminiVis || x.audit.gkeyVis || x.audit.freetext);
fs.writeFileSync(`${OUT}/v63-shot-log.json`, JSON.stringify({log, bad},null,2));
console.log(JSON.stringify({n:log.length, bad:bad.length, badShots:bad.map(b=>b.shot)},null,2));
await browser.close(); s.close();
if(bad.length) process.exitCode=2;
