/** v43: stable pixel portraits + expressions, location ambients, screen transitions */
import * as C42 from './content42.js';

/* ---- seeded RNG ---- */
function hash32(str){
  let h=2166136261>>>0;
  const s=String(str||'');
  for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); }
  return h>>>0;
}
function mulberry(seed){
  let t=seed>>>0;
  return ()=>{
    t+=0x6D2B79F5;
    let r=Math.imul(t^t>>>15,1|t);
    r^=r+Math.imul(r^r>>>7,61|r);
    return ((r^r>>>14)>>>0)/4294967296;
  };
}

const SKIN=[[255,214,186],[240,190,160],[210,160,120],[160,110,80],[120,80,55],[255,230,210]];
const HAIR=[[30,24,20],[60,40,20],[120,80,40],[200,160,80],[40,40,50],[180,60,40],[90,50,120],[20,20,20],[220,200,180]];
const EYES=[[60,100,160],[80,140,80],[140,90,50],[40,40,40],[100,60,140],[60,140,160]];
const CLOTH=[[60,70,120],[120,50,50],[40,90,70],[90,70,40],[50,50,60],[140,100,60],[80,40,90],[30,30,40]];

function pick(rng, arr){ return arr[Math.floor(rng()*arr.length)%arr.length]; }
function rgb(c){ return `rgb(${c[0]|0},${c[1]|0},${c[2]|0})`; }
function shade(c, f){ return [Math.max(0,Math.min(255,c[0]*f|0)), Math.max(0,Math.min(255,c[1]*f|0)), Math.max(0,Math.min(255,c[2]*f|0))]; }

/** Infer appearance traits from NPC art/gender/role */
export function appearanceFromNpc(name, npc={}){
  const art=String(npc.art||npc.stimme||'').toLowerCase();
  const g=String(npc.geschlecht||'');
  const seed=hash32([name, art, g, npc.e||'', npc.portrait||''].join('|'));
  const rng=mulberry(seed);
  let skin=pick(rng, SKIN);
  let hair=pick(rng, HAIR);
  let eyes=pick(rng, EYES);
  let cloth=pick(rng, CLOTH);
  let hairLen=rng()<0.45?'long':(rng()<0.5?'short':'mid');
  let bangs=rng()<0.55;
  let beard=false;
  let horn=false;
  let scar=rng()<0.12;
  let glasses=rng()<0.08;
  let role='villager';

  if(/wache|ritter|guard|soldat|cop/.test(art)){ role='guard'; cloth=[70,80,100]; hairLen='short'; }
  else if(/magier|hexe|zauber|mage|orren/.test(art)){ role='mage'; cloth=[70,50,120]; hair=[40,40,60]; }
  else if(/händler|kauf|merchant|wirt|bartender/.test(art)){ role='merchant'; cloth=[120,80,40]; }
  else if(/späher|dieb|assassin|spy|lyra|fixer|runner/.test(art)){ role='spy'; cloth=[40,45,55]; hairLen='mid'; }
  else if(/prinzess|königin|elise|princess|idol/.test(art)){ role='princess'; cloth=[160,80,120]; hairLen='long'; bangs=true; }
  else if(/dämon|daemon|sukkub|teufel|velka/.test(art)){ role='daemon'; horn=true; cloth=[80,30,50]; eyes=[180,60,60]; }
  else if(/arzt|medic|heiler|priester/.test(art)){ role='medic'; cloth=[200,200,210]; }
  else if(/ingenieur|engineer|mechanic/.test(art)){ role='tech'; cloth=[80,90,70]; glasses=true; }

  if(/w|weib|frau|dame/.test(g) || role==='princess'){ beard=false; if(hairLen==='short'&&rng()<0.5) hairLen='mid'; }
  if(/m|männ|mann|herr/.test(g) && role!=='princess'){ if(rng()<0.28) beard=true; if(rng()<0.4) hairLen='short'; }

  // genre tint
  if(/cyber|neon|chrome|corpo/.test(art)){ cloth=shade(cloth,0.85); hair=shade(hair,1.1); }
  if(/zombie|infekt|raider|survival/.test(art)){ skin=shade(skin,0.85); scar=true; }

  return {
    seed, skin, hair, eyes, cloth, hairLen, bangs, beard, horn, scar, glasses, role,
    emoji: npc.e||'👤',
    label: String(name||'?').slice(0,16),
  };
}

export function expressionFromMood(mood){
  const m=String(mood||'neutral').toLowerCase();
  if(/wüt|zorn|feind|aggress/.test(m)) return 'angry';
  if(/trau|angst|furcht|müde|erschöpft/.test(m)) return 'sad';
  if(/verliebt|freut|glück|vertraut|warm|heiter/.test(m)) return 'happy';
  if(/kühl|misstrau|skept|nachdenk/.test(m)) return 'cool';
  if(/überrascht|schock|staunen/.test(m)) return 'surprise';
  return 'neutral';
}

/** Draw 48×48 (or size) pixel bust; returns canvas */
export function drawPixelPortrait(app, expr='neutral', size=48){
  const canvas=document.createElement('canvas');
  canvas.width=size; canvas.height=size;
  const ctx=canvas.getContext('2d');
  ctx.imageSmoothingEnabled=false;
  const s=size/48;
  const px=(x,y,w,h,col)=>{ ctx.fillStyle=typeof col==='string'?col:rgb(col); ctx.fillRect(Math.round(x*s),Math.round(y*s),Math.max(1,Math.round(w*s)),Math.max(1,Math.round(h*s))); };

  // background vignette
  px(0,0,48,48,[24,20,32]);
  px(4,4,40,40,[36,30,48]);

  // shoulders / cloth
  px(8,34,32,14, app.cloth);
  px(10,36,28,10, shade(app.cloth,1.15));
  // neck
  px(20,30,8,6, app.skin);
  // head
  px(14,10,20,22, app.skin);
  px(15,11,18,20, shade(app.skin,1.05));

  // hair back
  if(app.hairLen==='long'){ px(12,12,24,28, app.hair); px(14,10,20,8, shade(app.hair,0.85)); }
  else if(app.hairLen==='mid'){ px(13,10,22,14, app.hair); }
  else { px(14,10,20,8, app.hair); }

  // bangs / top hair over forehead
  if(app.bangs){ px(15,10,18,6, shade(app.hair,1.1)); px(16,14,6,3, app.hair); px(26,14,6,3, app.hair); }
  else { px(15,10,18,5, shade(app.hair,1.05)); }

  // ears
  px(12,18,3,5, shade(app.skin,0.95));
  px(33,18,3,5, shade(app.skin,0.95));

  // eyes by expression
  const eyeY = expr==='sad'?21: expr==='angry'?19:20;
  const eyeH = expr==='surprise'?4:3;
  px(18, eyeY, 4, eyeH, [255,255,255]);
  px(26, eyeY, 4, eyeH, [255,255,255]);
  const iris=app.eyes;
  if(expr==='angry'){
    px(19, eyeY+1, 2, 2, iris);
    px(27, eyeY+1, 2, 2, iris);
    // brows down
    px(17, eyeY-2, 5, 1, shade(app.hair,0.7));
    px(26, eyeY-2, 5, 1, shade(app.hair,0.7));
  } else if(expr==='sad'){
    px(19, eyeY+1, 2, 2, iris);
    px(27, eyeY+1, 2, 2, iris);
    px(18, eyeY-1, 4, 1, shade(app.hair,0.6));
    px(26, eyeY-1, 4, 1, shade(app.hair,0.6));
  } else if(expr==='happy'){
    px(18, eyeY+1, 4, 2, iris);
    px(26, eyeY+1, 4, 2, iris);
    // smile cheeks
    px(16, 26, 2, 2, shade(app.skin,0.9));
    px(30, 26, 2, 2, shade(app.skin,0.9));
  } else if(expr==='cool'){
    px(19, eyeY+1, 2, 1, iris);
    px(27, eyeY+1, 2, 1, iris);
  } else if(expr==='surprise'){
    px(19, eyeY, 2, 3, iris);
    px(27, eyeY, 2, 3, iris);
  } else {
    px(19, eyeY+1, 2, 2, iris);
    px(27, eyeY+1, 2, 2, iris);
  }

  // mouth
  if(expr==='happy'){ px(21,28,6,2, shade(app.skin,0.75)); px(22,29,4,1,[180,80,90]); }
  else if(expr==='angry'){ px(21,29,6,1, shade(app.skin,0.7)); }
  else if(expr==='sad'){ px(22,30,4,1, shade(app.skin,0.7)); }
  else if(expr==='surprise'){ px(22,28,4,3, shade(app.skin,0.7)); }
  else { px(21,29,6,1, shade(app.skin,0.8)); }

  if(app.beard){ px(18,28,12,6, shade(app.hair,0.85)); px(20,30,8,4, app.hair); }
  if(app.scar){ px(28,18,1,6,[160,80,80]); }
  if(app.glasses){ px(17,19,6,5,[40,40,50]); px(25,19,6,5,[40,40,50]); px(23,21,2,1,[40,40,50]); }
  if(app.horn){ px(16,6,3,5,[200,180,160]); px(29,6,3,5,[200,180,160]); }

  // role accent stripe
  if(app.role==='guard') px(8,38,32,2,[200,180,80]);
  if(app.role==='mage') px(20,34,8,3,[160,120,220]);
  if(app.role==='daemon') px(8,40,32,2,[120,20,40]);

  return canvas;
}

const _portCache=new Map();

export function pixelPortraitKey(name, npc, expr){
  const app=appearanceFromNpc(name, npc);
  const e=expr||expressionFromMood(npc?.mood);
  return `px:${app.seed}:${e}`;
}

/** Stable data-URL pixel portrait for NPC + mood/expression */
export function pixelPortraitUrl(name, npc={}, expr){
  const e=expr||expressionFromMood(npc?.mood);
  const key=pixelPortraitKey(name, npc, e);
  if(_portCache.has(key)) return _portCache.get(key);
  if(typeof document==='undefined') return null;
  const app=appearanceFromNpc(name, npc);
  const canvas=drawPixelPortrait(app, e, 96);
  const url=canvas.toDataURL('image/png');
  _portCache.set(key, url);
  // cap cache
  if(_portCache.size>200){
    const first=_portCache.keys().next().value;
    _portCache.delete(first);
  }
  return url;
}

export function applyPixelPortraitToImg(img, name, npc, expr){
  if(!img) return null;
  const url=pixelPortraitUrl(name, npc, expr);
  if(!url) return null;
  img.src=url;
  img.classList.add('pixelated','px-port');
  img.dataset.pxKey=pixelPortraitKey(name, npc, expr||expressionFromMood(npc?.mood));
  return url;
}

/* ---- Ambient layers ---- */
export const AMBIENT = {
  wind: './assets/audio/ambient/wind.ogg',
  crowd: './assets/audio/ambient/crowd.ogg',
  rain: './assets/audio/ambient/rain.ogg',
  neon: './assets/audio/ambient/neon.ogg',
};

const _ambEls={};
let _ambKey=null;

export function stopAmbient(){
  for(const a of Object.values(_ambEls)){
    try{ a.pause(); a.volume=0; }catch(_){}
  }
  _ambKey=null;
}

export function playAmbient(kind, {enabled=true, vol=0.22}={}){
  if(!kind){ stopAmbient(); return; }
  if(!enabled){ _ambKey=kind; return; }
  if(_ambKey===kind){
    const a=_ambEls[kind];
    if(a && a.paused) a.play().catch(()=>{});
    return;
  }
  // fade others out
  for(const [k,a] of Object.entries(_ambEls)){
    if(k!==kind){ try{ a.pause(); }catch(_){ } }
  }
  let a=_ambEls[kind];
  if(!a){
    a=new Audio(AMBIENT[kind]||AMBIENT.wind);
    a.loop=true; a.preload='auto'; a.volume=vol;
    _ambEls[kind]=a;
  }
  a.volume=vol;
  a.play().catch(()=>{});
  _ambKey=kind;
}

export function ambientForContext(S, map){
  const ort=String(S?.world?.scene?.ort||map?.name||'').toLowerCase();
  const kind=map?.kind||'';
  const genre=String(S?.genre||S?.role||'').toLowerCase();
  const weather=String(S?.world?.weather||S?.flags?.weather||'').toLowerCase();
  const phase=String(S?.world?.scene?.zeit||S?.time?.phase||'').toLowerCase();

  // Weather bed wins when explicitly set (not ort name alone)
  if(/regen|storm|rain|gewitter|niederschlag/.test(weather)) return 'rain';
  if(/regenstrasse|regengasse|regenwald/.test(ort)) return 'rain';
  if(/cyber|neon|nachtclub|sektor|arcade|slum/.test(genre+ort) || /cyber/.test(genre)) return 'neon';
  if(kind==='wild' || kind==='ruins' || /wald|berg|feld|ufer|küste|ruine/.test(ort)) return 'wind';
  if(kind==='dungeon' || /kerker|höhle|gruft|labyrinth/.test(ort)) return 'wind';
  if(/markt|plaza|stadt|taverne|gasthaus|platz|gasse|dorf/.test(ort) || kind==='town') return 'crowd';
  if(/nacht|abend/.test(phase) && /cyber/.test(genre)) return 'neon';
  if(/nacht|abend/.test(phase)) return 'wind';
  return kind==='town'?'crowd':'wind';
}

export function syncAmbient(S, map, audioApi){
  try{
    const kind=ambientForContext(S, map);
    const on=audioApi?.isEnabled?.() ?? true;
    playAmbient(kind, {enabled:!!on, vol: kind==='crowd'?0.18:0.22});
  }catch(_){}
}

/* ---- Screen transitions ---- */
export function ensureTransitionDom(){
  let el=document.getElementById('fxTransition');
  if(!el){
    el=document.createElement('div');
    el.id='fxTransition';
    el.className='fx-transition';
    el.innerHTML='<div class="fx-transition-inner"></div>';
    document.body.appendChild(el);
  }
  return el;
}

export function screenTransition(kind='fade', ms=420){
  return new Promise(resolve=>{
    try{
      const el=ensureTransitionDom();
      el.dataset.kind=kind||'fade';
      el.classList.remove('hidden','out');
      el.classList.add('on');
      try{ window.__game?.Aud?.playSfx?.('whoosh', 0.28); }catch(_){}
      const half=Math.max(120, (ms|0)/2);
      setTimeout(()=>{
        el.classList.add('out');
        setTimeout(()=>{
          el.classList.remove('on','out');
          el.classList.add('hidden');
          resolve();
        }, half);
      }, half);
    }catch(_){ resolve(); }
  });
}

/** Wrap a mode switch with fade */
export async function withTransition(fn, kind='fade', ms=420){
  const el=ensureTransitionDom();
  el.dataset.kind=kind; el.classList.remove('hidden','out'); el.classList.add('on');
  try{ window.__game?.Aud?.playSfx?.('whoosh', 0.25); }catch(_){}
  await new Promise(r=>setTimeout(r, Math.max(100, ms/2)));
  let result;
  try{ result=await fn(); }catch(e){ result=e; }
  el.classList.add('out');
  await new Promise(r=>setTimeout(r, Math.max(100, ms/2)));
  el.classList.remove('on','out'); el.classList.add('hidden');
  return result;
}

export function migrateV43(S){
  C42.migrateV42(S);
  S.flags=S.flags||{};
  S.flags.pxPortraits=true;
  S.imgCache=S.imgCache||{scenes:{},portraits:{},ok:{},fail:{},next:{}};
  // Pre-seed pixel portrait cache keys for known NPCs (urls filled lazily in browser)
  S.imgCache.pxMeta=S.imgCache.pxMeta||{};
  for(const [name,npc] of Object.entries(S.world?.npcs||{})){
    const app=appearanceFromNpc(name, npc);
    S.imgCache.pxMeta[name]={ seed:app.seed, role:app.role };
  }
  S.ver=43;
  return S;
}

export default {
  appearanceFromNpc, expressionFromMood, drawPixelPortrait, pixelPortraitUrl, pixelPortraitKey,
  applyPixelPortraitToImg, AMBIENT, playAmbient, stopAmbient, ambientForContext, syncAmbient,
  ensureTransitionDom, screenTransition, withTransition, migrateV43, hash32,
};
