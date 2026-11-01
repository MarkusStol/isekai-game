import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
const ROOT='/workspace/isekai-game';
const OUT='/workspace/isekai-game-shots/v73-ship-report';
const PORT=8918;
const VER='73';
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

const HUBS=[
  ['Thronsaal der Nacht','throne'],
  ['Grenzpass','pass'],
  ['Ruinen von Solmir','crypt'],
  ['Kathedrale des Lichts','cathedral'],
];

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
    const toastEl=document.getElementById('toast');
    const toastOn=toastEl?.classList.contains('on');
    const toastRect=toastEl?.getBoundingClientRect?.();
    return {
      textInputs,
      inputRowVis: vis(document.getElementById('inputRow')),
      keyGateVis: vis(document.getElementById('keyGate')),
      geminiVis: vis(document.getElementById('geminiBox')),
      gkeyVis: vis(document.getElementById('gkey')),
      bodyClass: document.body.className,
      freetext: !!(window.__game?.FREETEXT_ENABLED),
      ver: window.__game?.VER,
      dlgName: (document.getElementById('owDlgName')?.textContent||'').trim(),
      dlgText: (document.getElementById('owDlgText')?.textContent||'').trim(),
      dlgOpen: document.body.classList.contains('ow-dialogue'),
      toast: (toastEl?.innerText||'').slice(0,120),
      toastOn: !!toastOn,
      toastTop: toastOn ? (toastRect?.top|0) : null,
      toastBottom: toastOn ? (toastRect?.bottom|0) : null,
    };
  });
}

async function boot(page){
  await page.goto(`http://127.0.0.1:${PORT}/?v=${VER}&pt=1`,{waitUntil:'networkidle0'}).catch(()=>{});
  await page.waitForFunction(v=>window.__game?.VER===v,{timeout:60000}, VER);
  await page.evaluate(()=>{ try{ localStorage.clear(); sessionStorage.clear(); }catch(_){} });
  await page.goto(`http://127.0.0.1:${PORT}/?v=${VER}&pt=1&fresh=1`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(v=>window.__game?.VER===v,{timeout:60000}, VER);
  await page.evaluate(()=>{
    window.__FAST=true; window.__SKIP_REMOTE_IMG=true; window.__PLAYTEST=true;
    try{ window.__setCfg({mode:'offline', battleDiff:'story', atbMode:'active'}); }catch(_){}
  });
  await new Promise(r=>setTimeout(r,400));
  await page.evaluate(()=>{ try{ document.getElementById('btnCoachOk')?.click(); }catch(_){}
    try{ document.getElementById('onboardCoach')?.classList.add('hidden'); document.getElementById('onboardCoach')?.remove(); }catch(_){}
  });
}

async function dismissCoach(page){
  await page.evaluate(()=>{ try{ document.getElementById('btnCoachOk')?.click(); }catch(_){}
    const c=document.getElementById('onboardCoach'); if(c) c.classList.add('hidden');
    document.querySelectorAll('#onboardCoach,.coach').forEach(el=>el.classList.add('hidden'));
  });
}
async function shot(page, name, tag){
  const file=`${tag}-${name}.png`;
  await page.screenshot({path:`${OUT}/${file}`});
  const audit=await auditDom(page);
  log.push({shot:file, audit});
  console.log(file, 'dlg=', JSON.stringify({n:audit.dlgName,t:(audit.dlgText||'').slice(0,40)}), 'toastOn=', audit.toastOn);
  return audit;
}

async function play(page){
  await page.evaluate(async()=>{
    const g=window.__game;
    await g.newLife('daemon',{lives:0,soul:0,keptSkills:[]},{skipSetup:true,name:'Noctis'});
    g.S.setup={done:true};
    g.S.flags=Object.assign(g.S.flags||{},{onboarded:true,introDone:true,visual45Tip:1,visual64:true,visual66:true,visual71:true,freetext:false});
    g.C64?.migrateV64?.(g.S); g.C66?.migrateV66?.(g.S); g.C66?.seedBestiary?.(g.S); g.C70?.migrateV70?.(g.S);
    g.enterPlay();
    document.getElementById('title')?.classList.add('hidden');
    document.getElementById('stage')?.classList.remove('hidden');
    document.getElementById('onboardCoach')?.classList.add('hidden');
    try{ g.OW.mountOverworld({getS:()=>g.S, toast:(m)=>g.toast?.(m), save:()=>g.save?.()}); }catch(_){}
  });
  await new Promise(r=>setTimeout(r,500));
}

async function ow(page, ort){
  await page.evaluate((ort)=>{
    const g=window.__game;
    g.S.world.scene.ort=ort; g.S.genre='daemon';
    try{ g.OW.hideDialogue?.(); }catch(_){}
    try{ document.body.classList.remove('ow-dialogue'); }catch(_){}
    try{ const n=document.getElementById('owDlgName'); if(n) n.textContent=''; const x=document.getElementById('owDlgText'); if(x) x.textContent=''; }catch(_){}
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

for(const [w,h,tag,mobile] of [[1920,1080,'desktop1080',false],[1280,720,'desktop720',false]]){
  const page=await browser.newPage();
  await page.setViewport({width:w,height:h,isMobile:mobile,hasTouch:mobile});
  await boot(page);
  await shot(page,'01-title',tag);

  await page.evaluate(()=>document.getElementById('btnNew')?.click());
  await new Promise(r=>setTimeout(r,1200));
  await shot(page,'02-newgame',tag);

  await play(page);
  await shot(page,'03-intro-or-play',tag);

  // Toast tip: desktop must show keyboard hints (not swipe)
  await ow(page,'Thronsaal der Nacht');
  await page.evaluate(()=>{
    const g=window.__game;
    try{ g.toast('WASD/Pfeile · Enter/A reden · Esc/B Menü · Gamepad OK'); }catch(_){}
  });
  await new Promise(r=>setTimeout(r,350));
  const tipA=await shot(page,'04-town-throne-with-toast',tag);
  const tipOk=/WASD|Enter|Esc|Gamepad|Pfeile/i.test(tipA.toast||'') && !/Wischen|Steuerkreuz|Tippen/i.test(tipA.toast||'');
  log[log.length-1].tipCheck={ toast:tipA.toast, expectKeyboard:true, ok: tipOk };
  // assert no d-pad
  const padVis=await page.evaluate(()=>{
    const p=document.getElementById('owPad');
    if(!p) return false;
    const st=getComputedStyle(p);
    return st.display!=='none' && st.visibility!=='hidden' && p.getBoundingClientRect().height>2;
  });
  log[log.length-1].padVisible=padVis;
  if(padVis) log[log.length-1].padFail=true;
  await page.evaluate(()=>{
    try{ window.__game.toast(''); }catch(_){}
    const e=document.getElementById('toast');
    if(e){ e.textContent=''; e.classList.remove('on','toast-top','toast-tip'); e.style.opacity='0'; }
  });
  await new Promise(r=>setTimeout(r,200));

  await ow(page,'Thronsaal der Nacht');
  await shot(page,'05-throne-hall',tag);

  // Talk to EVERY NPC in every hub
  let talkIdx=0;
  for(const [ort,slug] of HUBS){
    await ow(page, ort);
    await shot(page, `${String(10+talkIdx).padStart(2,'0')}-hub-${slug}`, tag);
    if(slug==='pass'){
      const cam=await page.evaluate(()=>{
        const d=window.__game?.OW?.__debug?.()||{};
        const c=document.getElementById('owCanvas');
        return {scale:d.scale, view:d.view, renderView:d.renderView, map:d.map,
          cssW:c?.clientWidth|0, cssH:c?.clientHeight|0, lw:c?.width|0, lh:c?.height|0,
          tileCss: (d.scale||0)*16};
      });
      log[log.length-1].camera=cam;
      console.log(tag,'pass-camera', JSON.stringify(cam));
      const decor=await page.evaluate(()=>{
        const d=window.__game?.OW?.__debug?.()||{};
        const ov=d.overlays||d.overhead||[];
        const kinds={};
        for(const o of ov){
          const k=String(o.id||o.src||o.label||'x');
          const key=k.includes('pine')?'pine':k.includes('foot')?'footprints':k.includes('bush')?'dead_bush':k.includes('drift')?'snowdrift':k.includes('rock')?'rock':k;
          kinds[key]=(kinds[key]|0)+1;
        }
        return {n:ov.length, kinds, cliff:!!d.cliffBands || 'n/a'};
      });
      log[log.length-1].passDecor=decor;
      console.log(tag,'pass-decor', JSON.stringify(decor));
    }
    talkIdx++;
    const npcs = await page.evaluate(()=> (window.__game.OW.__listNpcs?.()||[]).map(n=>({name:n.name,sheet:n.sheet,x:n.x,y:n.y})));
    console.log(tag, ort, 'npcs', npcs.map(n=>n.name));
    for(let i=0;i<npcs.length;i++){
      const n=npcs[i];
      await page.evaluate((nm)=>{
        const g=window.__game;
        try{ g.OW.hideDialogue?.(); }catch(_){}
        // stand next to NPC
        try{
          const list=g.OW.__listNpcs?.()||[];
          const hit=list.find(x=>x.name===nm);
          if(hit) g.OW.__setHero?.(Math.round(hit.x), Math.round(hit.y)+1);
        }catch(_){}
        g.OW.__talkTo?.(nm);
      }, n.name);
      await new Promise(r=>setTimeout(r,650));
      const safe=n.name.replace(/[^a-zA-Z0-9äöüÄÖÜß]+/g,'-').replace(/^-|-$/g,'').slice(0,28);
      const a=await shot(page, `${String(20+talkIdx).padStart(2,'0')}-talk-${slug}-${safe}`, tag);
      talkIdx++;
      const badName=/(\[object|undefined|null|NaN)/i.test(a.dlgName||'') || !a.dlgName;
      const badText=!a.dlgText || a.dlgText==='…' || a.dlgText==='...' || /(\[object|undefined|null|NaN)/i.test(a.dlgText);
      if(badName||badText) log[log.length-1].dialogueFail={npc:n.name, name:a.dlgName, text:a.dlgText};
      await page.evaluate(()=>{ try{ window.__game.OW.hideDialogue?.(); }catch(_){} });
    }
  }


  // v73 authored dungeon rooms (follow camera, unique layouts)
  for(const [ort,slug] of [
    ['Schatzkatakomben · Raum 1','dung-katakomben-r1'],
    ['Schatzkatakomben · Raum 3','dung-katakomben-r3'],
    ['Schatzkatakomben · Raum 5','dung-katakomben-r5'],
    ['Eishöhlen · Raum 1','dung-eishoehlen'],
    ['Reliquiengewölbe · Raum 1','dung-reliquien'],
    ['Knochenlabyrinth · Raum 1','dung-knochen'],
    ['Wachtürme am Pass · Raum 1','dung-wachtuerme'],
    ['Gruft von Solmir · Raum 1','dung-gruft'],
    ['Kathedrale Solari · Raum 1','dung-solari'],
  ]){
    await page.evaluate((ort)=>{
      const g=window.__game; const S=g.S;
      S.campaign=S.campaign||{}; S.campaign.mode='dungeon';
      const rm=/(?:Raum)\s*(\d+)/i.exec(ort);
      S.campaign.dungeon={name:ort.split('·')[0].trim(), room:rm?+rm[1]:1, rooms:5};
      S.world=S.world||{}; S.world.scene=S.world.scene||{}; S.world.scene.ort=ort;
    }, ort);
    await ow(page, ort);
    const meta=await page.evaluate(()=>{
      const st=window.__game.OW.__debug?.()||{};
      const view=st.renderView||st.view||{};
      return {preset:st.map?.preset, kind:st.map?.kind, scale:st.scale, viewW:view.w|0, viewH:view.h|0, mapW:st.map?.w|0, mapH:st.map?.h|0};
    });
    log.push({shot:tag+'-'+slug+'-meta', meta});
    console.log(tag, slug, JSON.stringify(meta));
    await shot(page, `60-${slug}`, tag);
  }
  // nameplate near-only: stand next to NPC, then far
  await ow(page,'Kathedrale des Lichts');
  await page.evaluate(()=>{
    const g=window.__game;
    const list=g.OW.__listNpcs?.()||[];
    const hit=list.find(n=>/Solara|Ren|Aria|Elias|Nira/i.test(n.name))||list[0];
    if(hit) g.OW.__setHero?.(Math.round(hit.x), Math.round(hit.y)+1);
  });
  await new Promise(r=>setTimeout(r,400));
  await shot(page,'61-cathedral-nameplate-near',tag);
  await page.evaluate(()=>{
    const g=window.__game;
    try{ g.OW.__setHero?.(2, 22); }catch(_){}
  });
  await new Promise(r=>setTimeout(r,400));
  await shot(page,'62-cathedral-nameplate-far',tag);

  // playtime structural report
  const pt = await page.evaluate(()=> window.__game?.C66?.estimatePlaytimeReport?.(window.__game.S) || null);
  log.push({shot:tag+'-playtime', playtime:pt});
  console.log(tag, 'playtime', JSON.stringify(pt&&{hours:pt.campaignEstimatedHours, chapters:pt.chapters?.map(c=>({l:c.label,m:c.estimatedMin,ok:c.meetsDepthBar}))}));

  // battle — full party order Noctis/Velka/Brok/Aria + throne BG
  await page.evaluate(async()=>{
    const g=window.__game;
    try{ g.OW.hideDialogue?.(); }catch(_){}
    try{ g.OW.hideOverworld?.(); }catch(_){}
    const S=g.S;
    S.pc=Object.assign({name:'Noctis'}, S.pc||{});
    S.world=S.world||{}; S.world.npcs=S.world.npcs||{};
    S.romance=S.romance||{};
    S.world.scene=S.world.scene||{}; S.world.scene.ort='Thronsaal der Nacht';
    for(const n of ['Sekretärin Velka','General Brok','Heldin Aria']){
      S.world.npcs[n]=Object.assign({alive:true,art:n}, S.world.npcs[n]||{});
      S.romance[n]=Object.assign({affection:40,stage:2}, S.romance[n]||{});
    }
    S.party=['Sekretärin Velka','General Brok','Heldin Aria'];
    const En=await import('./enemies.js');
    const f=En.enemyById('lesser_fiend')||En.enemyById('hellhound')||En.ENEMIES.hellhound;
    document.body.classList.add('in-battle');
    S.world.scene.ort='Schatzkatakomben · Raum 1';
    document.body.classList.add('visual71');
    await g.Battle.startBattle(S,{enemies:[structuredClone(f)],foes:[structuredClone(f)],bg:'./assets/pixel/bg-battle/nocturna/dungeon.png',canFlee:true,scripted:true});
  });
  await new Promise(r=>setTimeout(r,900));
  await page.waitForFunction(()=>document.querySelector('.battle-root.battle-ff67:not(.hidden), #battleRoot.battle-ff67'),{timeout:8000}).catch(()=>{});
  await new Promise(r=>setTimeout(r,600));
  const order=await page.evaluate(()=>{
    const list=[...document.querySelectorAll('.ff-party-row .ff-pname, .party-card .ff-pname, .party-card .pname')].map(e=>(e.textContent||'').trim()).filter(Boolean);
    const sprs=[...document.querySelectorAll('.party-stage-spr')].map(el=>{
      const img=el.querySelector('img');
      const r=el.getBoundingClientRect();
      const ir=img?img.getBoundingClientRect():r;
      return {src:(img?.getAttribute('src')||'').split('/').pop(), top:r.top|0, left:r.left|0, w:ir.width|0, h:ir.height|0, role:img?.dataset?.role||'', iid:el.dataset.iid};
    });
    const foes=[...document.querySelectorAll('.foe-art, .pixel-foe img')].map(el=>{
      const r=el.getBoundingClientRect();
      return {w:r.width|0,h:r.height|0,l:r.left|0,t:r.top|0,cx:(r.left+r.right)/2|0};
    });
    const bgSrc=(document.querySelector('.battle-root img.battle-bg-img, .battle-bg-img, .battle-layer-far')?.src)||'';
    const layers=[...document.querySelectorAll('.battle-layer,.battle-bg-tex')].map(e=>e.className);
    return {list, sprs, foes, bgSrc, layers, html:(document.querySelector('.battle-root')?.innerHTML||'').slice(0,200)};
  });
  log.push({shot:tag+'-battle-order', order});
  console.log(tag,'battle-order', JSON.stringify(order));
  await shot(page,'80-battle',tag);
  await shot(page,'80d-battle-dungeon',tag);

  // attack animation sequence: step / slash / dmg
  for(const [shotName, frame] of [['80c-atk-step','atk-step'],['80d-atk-slash','slash'],['80e-atk-dmg','dmg']]){
    await page.evaluate((frame)=>{
      const g=window.__game; const B=g.Battle?.getBattle?.();
      const hero=B?.party?.[0]; const foe=B?.foes?.find(f=>f.alive)||B?.foes?.[0];
      if(frame==='atk-step' && hero){
        const spr=document.querySelector(`.party-stage-spr[data-iid="${hero._iid}"]`);
        if(spr){ spr.classList.add('atk-step'); }
      }
      if(frame==='slash'){
        const fx=document.getElementById('battleFx');
        if(fx){ const slash=document.createElement('div'); slash.className='slash-fx'; slash.style.left='42%'; slash.style.top='38%'; fx.appendChild(slash); }
        const spr=document.querySelector('.party-stage-spr');
        if(spr) spr.classList.add('atk-step');
      }
      if(frame==='dmg' && foe){
        try{
          const pop=document.createElement('div');
          pop.className='dmg-pop'; pop.textContent='42';
          pop.style.cssText='position:absolute;left:38%;top:30%;z-index:40;color:#fff;font-weight:800;font-size:34px;text-shadow:0 2px 0 #000';
          (document.getElementById('battleFx')||document.querySelector('.battle-root')).appendChild(pop);
        }catch(_){}
      }
    }, frame);
    await new Promise(r=>setTimeout(r,200));
    await shot(page, shotName, tag);
  }

  // Velka close-up audit
  const velka=await page.evaluate(()=>{
    const imgs=[...document.querySelectorAll('.party-stage-spr img')].map(i=>({src:i.currentSrc||i.src, role:i.dataset.role, w:i.naturalWidth, h:i.naturalHeight}));
    return imgs;
  });
  log.push({shot:tag+'-velka-sprites', velka});
  console.log(tag,'sprites', JSON.stringify(velka));
  // setpiece optional boss shot
  await page.evaluate(()=>{
    try{
      const G=window.__game; const S=G.S;
      try{ G.Battle?.__forceHide?.(); }catch(_){}
      const opts=G.C67?.optionalBossBattleOpts?.(S,'opt_gildfiend')||{setpiece:true,bossName:'Gildenfiend',banner:'GOLD FRISST GOLD'};
      const foe={id:'opt_gildfiend',name:opts.bossName||'Gildenfiend',hp:400,maxhp:400,atk:22,def:10,mag:8,spd:8,icon:'👹',boss:true,setpiece:true};
      G.Battle?.startBattle?.(S,{enemies:[foe],setpiece:true,banner:opts.banner,bossName:opts.bossName,blurb:opts.blurb,scripted:true});
    }catch(e){ console.error(e); }
  });
  await page.waitForFunction(()=>document.querySelector('.battle-root.battle-setpiece, .battle-ff67'),{timeout:8000}).catch(()=>{});
  await new Promise(r=>setTimeout(r,700));
  await shot(page,'80b-setpiece-boss',tag);
  await page.evaluate(async()=>{
    try{ window.__gateNoBattle=true; }catch(_){}
    const g=window.__game;
    try{ await g.Battle?.endBattle?.({result:'flee'}); }catch(_){}
    try{ await g.Battle?.__forceHide?.(); }catch(_){}
    try{ g.Battle?.hide?.(); }catch(_){}
    document.body.classList.remove('in-battle','battle-ended','battle-open');
    document.documentElement.classList.remove('in-battle','battle-open','battle-ended');
    document.documentElement.classList.remove('in-battle');
    const br=document.getElementById('battleRoot');
    if(br){ br.classList.add('hidden'); br.style.display='none'; br.innerHTML=''; br.classList.remove('battle-ended'); }
    document.querySelectorAll('.battle-root').forEach(el=>{ el.classList.add('hidden'); el.style.display='none'; });
    try{ g.OW.showOverworld?.(g.S); }catch(_){}
  });
  await new Promise(r=>setTimeout(r,700));
  // ensure battle fully gone before menu
  await page.evaluate(async()=>{
    try{ window.__gateNoBattle=true; await window.__game.Battle?.__forceHide?.(); }catch(_){}
    document.body.classList.remove('in-battle','battle-open');
    document.documentElement.classList.remove('battle-open','in-battle');
    document.querySelectorAll('#battleRoot,.battle-root').forEach(br=>{ try{ br.remove(); }catch(_){ } });
  });
  await new Promise(r=>setTimeout(r,200));

  await page.evaluate(async()=>{
    try{ window.__gateNoBattle=true; await window.__game.Battle?.__forceHide?.(); }catch(_){}
    document.querySelectorAll('#battleRoot,.battle-root').forEach(el=>{ try{ el.remove(); }catch(_){ } });
    try{ window.__game.closeMenu?.(); }catch(_){}
    try{ window.__game.openMenu('hub'); }catch(_){}
    const m=document.getElementById('menu')||document.getElementById('gameMenu');
    if(m){
      m.classList.remove('hidden');
      m.style.setProperty('display','flex','important');
      m.style.setProperty('opacity','1','important');
      m.style.setProperty('visibility','visible','important');
      m.style.setProperty('z-index','12000','important');
    }
  });
  await page.waitForFunction(()=>{
    document.body.classList.remove('battle-open','in-battle');
    document.documentElement.classList.remove('battle-open','in-battle');
    const m=document.getElementById('menu')||document.getElementById('gameMenu');
    if(!m) return false;
    const st=getComputedStyle(m);
    return !m.classList.contains('hidden') && st.display!=='none' && st.visibility!=='hidden' && (m.innerText||'').length>20;
  },{timeout:10000}).catch(()=>{});
  await new Promise(r=>setTimeout(r,500));
  await shot(page,'81-menu',tag);
  await page.evaluate(()=>{ try{ window.__game.openMenu('v62'); }catch(_){} });
  await page.waitForFunction(()=>{
    const body=document.getElementById('menuBody');
    return body && /Fertigkeit|Fortschritt|Werkstatt|Kapitel/i.test(body.innerText||'');
  },{timeout:8000}).catch(()=>{});
  await new Promise(r=>setTimeout(r,800));
  await shot(page,'82-progress',tag);
  await page.evaluate(()=>{ try{ window.__game.closeMenu?.(); }catch(_){}
    document.getElementById('btnMenuClose')?.click();
    document.getElementById('menu')?.classList.add('hidden');
    document.getElementById('gameMenu')?.classList.add('hidden');
    document.body.classList.remove('menu-open');
  });
  // v69 inn screen — hard reset DOM overlays first
  await page.evaluate(async()=>{
    document.body.classList.remove('battle-open','in-battle','menu-open','ow-dialogue');
    document.documentElement.classList.remove('battle-open','in-battle');
    try{ window.__gateNoBattle=true; await window.__game.Battle?.__forceHide?.(); }catch(_){}
    document.querySelectorAll('#battleRoot,.battle-root').forEach(br=>{ try{ br.remove(); }catch(_){ } });
    document.getElementById('menu')?.classList.add('hidden');
    document.getElementById('gameMenu')?.classList.add('hidden');
    document.getElementById('innScreen')?.remove();
    try{ window.__game.closeMenu?.(); }catch(_){}
    try{ window.__game.closeInn?.(); }catch(_){}
  });
  await new Promise(r=>setTimeout(r,300));
  const innOk=await page.evaluate(()=>{
    try{ window.__game.openInn(); }catch(e){ return 'err:'+e; }
    const el=document.getElementById('innScreen')||document.querySelector('.inn-screen,#inn,.inn-card');
    if(el){ el.classList.remove('hidden'); el.style.display='flex'; el.style.opacity='1'; el.style.zIndex='9500'; el.style.visibility='visible'; }
    return el ? (el.innerText||'').slice(0,40) : 'missing';
  });
  console.log(tag+' inn open =>', innOk);
  await new Promise(r=>setTimeout(r,600));
  await page.waitForFunction(()=>{
    const el=document.getElementById('innScreen')||document.querySelector('.inn-screen,#inn,.inn-card');
    if(!el) return false;
    const r=el.getBoundingClientRect();
    return r.width>200 && r.height>200 && /Herberge|Ausruhen/i.test(el.innerText||'');
  },{timeout:10000}).catch(()=>{});
  await new Promise(r=>setTimeout(r,700));
  await shot(page,'84-inn',tag);
  await page.evaluate(()=>{ try{ window.__game.closeInn(); }catch(_){} document.getElementById('innScreen')?.remove(); });

  await page.evaluate(()=>{ try{ window.__game.openSheet(); }catch(_){} });
  await new Promise(r=>setTimeout(r,500));
  await shot(page,'83-settings',tag);
  await page.evaluate(()=>document.getElementById('btnClose')?.click());

  await page.close();
}

const badInputs=log.filter(x=>x.audit&&((x.audit.textInputs||[]).length || x.audit.inputRowVis || x.audit.keyGateVis || x.audit.geminiVis || x.audit.gkeyVis || x.audit.freetext));
const badDlg=log.filter(x=>x.dialogueFail);
const badTip=log.filter(x=>x.tipCheck && x.tipCheck.ok===false);
const playtime=log.find(x=>x.playtime)?.playtime||log.filter(x=>x.playtime).map(x=>x.playtime).slice(-1)[0];
fs.writeFileSync(`${OUT}/v73-shot-log.json`, JSON.stringify({log, badInputs, badDlg, badTip, playtime},null,2));
console.log(JSON.stringify({n:log.length, badInputs:badInputs.length, badDlg:badDlg.length, badTip:badTip.length, fails:badDlg.map(b=>({shot:b.shot,fail:b.dialogueFail})), playtime: playtime && {hours:playtime.campaignEstimatedHours, chapters:playtime.chapters?.map(c=>({l:c.label,m:c.estimatedMin,ok:c.meetsDepthBar}))}},null,2));
await browser.close(); s.close();
const badPad=log.filter(x=>x.padFail);
if(badPad.length) console.log('padFail', badPad.map(x=>x.shot));
if(badInputs.length || badDlg.length || badTip.length || badPad.length) process.exitCode=2;
