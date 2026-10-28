#!/usr/bin/env node
import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = '/workspace/isekai-game-shots';
fs.mkdirSync(OUT, {recursive:true});
// clear old v15
for(const f of fs.readdirSync(OUT).filter(x=>x.startsWith('v15-'))) fs.unlinkSync(path.join(OUT,f));
const PORT = 8766;

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
  const dest=path.join(OUT,`v15-${name}.png`);
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
page.setDefaultTimeout(25000);
page.on('console', m => { if(m.type()==='error') console.log('console.err', m.text()) });

await page.goto(`http://127.0.0.1:${PORT}/index.html?v=15`,{waitUntil:'networkidle0'});
await page.evaluate(()=>{ localStorage.clear(); sessionStorage.clear(); });
await page.reload({waitUntil:'networkidle0'});
await new Promise(r=>setTimeout(r,600));
await shot(page,'01-title');

// Start with FREE (Pollinations) — not offline — to verify badge + narrator
const started = await page.evaluate(async ()=>{
  const g=window.__game;
  if(!g)return 'no-game';
  window.__FAST=true; window.__FORCE_CSS_SCENES=true; window.__SKIP_REMOTE_IMG=true;
  if(window.__setCfg) window.__setCfg({mode:'free',debug:1,v2:1});
  try{
    await g.newLife('held',{lives:0,soul:0,keptSkills:[]},{skipSetup:true,name:'Aki'});
    return {ok:true, ver:g.S?.ver, mode: JSON.parse(localStorage.getItem('isekai_cfg')||'{}').mode};
  }catch(e){ return {err:e.message, stack:e.stack} }
});
console.log('start', started);
await new Promise(r=>setTimeout(r,1000));
await page.evaluate(()=>{
  const g=window.__game; if(!g||!g.S)return;
  if(g.S.setup && !g.S.setup.done){
    try{ g.S.setup.done=true; g.S.ver=15; g.enterPlay(); }catch(_){}
  }
});
await new Promise(r=>setTimeout(r,800));
await shot(page,'02-play-free');

// Force toast initiative + weather + badge
const toastCheck = await page.evaluate(()=>{
  const g=window.__game; const S=g.S;
  // seed a memory that used to garble
  const who=(S.world.scene.anwesend||Object.keys(S.world.npcs||{}))[0]||'Hofmagier Orren';
  if(!S.world.npcs[who]) S.world.npcs[who]={art:'Magier',memories:[],alive:true,mood:'nachdenklich'};
  S.world.npcs[who].memories=[{text:'[Gespräch] Gutes Gespräch mit dir: „D“'}];
  S.world.scene.anwesend=[who];
  const line=g.Imm.npcInitiativeLine(who, S.world.npcs[who].memories[0].text);
  // show toast
  const el=document.getElementById('eventToast');
  if(el){el.textContent=line; el.classList.remove('hidden')}
  // weather + tint
  g.Imm.setWeather('regen');
  S.cal={day:1,hour:22,minute:5}; g.Imm.applyDayNightTint(S);
  // badge free
  const badge=document.getElementById('narratorBadge')||(()=>{const d=document.createElement('div');d.id='narratorBadge';d.className='narrator-badge';document.body.appendChild(d);return d})();
  badge.textContent='Erzählerin: Pollinations'; badge.classList.remove('hidden','is-offline'); badge.classList.add('is-free');
  // ambient btn visible
  return {line, badge:badge.textContent, badgeRect:badge.getBoundingClientRect(), hud:document.getElementById('hud')?.innerText?.slice(0,80),
    lineClean:!/Gutes Gespräch|sucht dich auf:/.test(line)};
});
console.log('toast', toastCheck);
await shot(page,'03-toast-weather-badge');

// Offline rich prose + offline badge position
const rich = await page.evaluate(()=>{
  const g=window.__game; const S=g.S;
  const who=(S.world.scene.anwesend||[])[0];
  const txt=g.Imm.richOfflineProse(S,'Erzähl mir von der Magie',{who,label:who,good:true,weather:'nebel'});
  document.getElementById('vnText').textContent=txt;
  document.getElementById('speaker').textContent=who||'Erzähler';
  document.getElementById('speaker').classList.remove('hidden');
  const badge=document.getElementById('narratorBadge');
  badge.textContent='Offline-Erzähler'; badge.classList.remove('is-free'); badge.classList.add('is-offline');
  // combat overlay
  g.Imm.openCombat({foeName:'Goblin-Späher',playerHP:S.st.hp,playerMax:S.st.maxhp,foeHP:30,foeMax:30,
    skills:[{name:'Schwertstoß'},{name:'Schild'}], onSkill:()=>({foeDmg:12,selfDmg:3,text:'Treffer!'}), onClose:()=>{}});
  return {chars:txt.length, sentences:txt.split(/[.!?]/).filter(Boolean).length, sample:txt.slice(0,160)};
});
console.log('rich', rich);
await shot(page,'04-combat-rich');

// Close combat, hub menu
await page.evaluate(()=>{ const c=document.getElementById('combatFx'); if(c)c.classList.add('hidden'); window.__game.openMenu('hub'); });
await new Promise(r=>setTimeout(r,400));
await shot(page,'05-hub');

await page.evaluate(()=>window.__game.openMenu('level'));
await new Promise(r=>setTimeout(r,400));
await shot(page,'06-level');

// Try a free AI turn (may succeed or fall back)
await page.evaluate(()=>{ const m=document.getElementById('menu'); if(m)m.classList.add('hidden'); });
const aiTry = await page.evaluate(async ()=>{
  const g=window.__game;
  window.__setCfg({mode:'free',v2:1});
  try{
    // short timeout race
    const p=g.act('Ich sehe mich um.');
    const t=new Promise(r=>setTimeout(()=>r('timeout'),18000));
    await Promise.race([p,t]);
    const badge=document.getElementById('narratorBadge')?.textContent||'';
    const vn=(document.getElementById('vnText')?.textContent||'').slice(0,200);
    return {badge, vn, mode:g.S._narratorMode, len:vn.length};
  }catch(e){return {err:e.message}}
});
console.log('aiTry', aiTry);
await shot(page,'07-after-act');

// snow weather + dawn
await page.evaluate(()=>{
  const g=window.__game; g.S.cal.hour=6; g.Imm.setWeather('schnee'); g.Imm.applyDayNightTint(g.S);
  document.getElementById('narratorBadge').textContent='Erzählerin: Pollinations';
  document.getElementById('narratorBadge').className='narrator-badge is-free';
});
await shot(page,'08-snow-dawn');

// Audio button + portrait mood
await page.evaluate(()=>{
  const g=window.__game; const who=(g.S.world.scene.anwesend||Object.keys(g.S.world.npcs))[0];
  if(who){ g.S.world.npcs[who].mood='wütend'; try{g.setPortrait(who,g.S.world.npcs[who])}catch(_){}}
  document.getElementById('btnAudio')?.click();
});
await shot(page,'09-portrait-audio');

// key gate screen
await page.evaluate(()=>{
  document.getElementById('stage').classList.add('hidden');
  document.getElementById('keyGate').classList.remove('hidden');
});
await shot(page,'10-gate-pollinations');

console.log('done shots');
await browser.close();
server.close();
