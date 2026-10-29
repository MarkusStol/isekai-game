/** v57 area music + SFX variety (Ninja Adventure CC0) + dual-buffer crossfade */
export const MUSIC = {
  title: './assets/audio/music/title.ogg',
  town: './assets/audio/music/town.ogg',
  wild: './assets/audio/music/wild.ogg',
  dungeon: './assets/audio/music/dungeon.ogg',
  camp: './assets/audio/music/camp.ogg',
  battle: './assets/audio/music/battle.ogg',
};
export const SFX = {
  step: './assets/audio/sfx/step.ogg',
  step_stone: './assets/audio/sfx/step_stone.ogg',
  step_grass: './assets/audio/sfx/step_grass.ogg',
  step_wood: './assets/audio/sfx/step_wood.ogg',
  step_water: './assets/audio/sfx/step_water.ogg',
  talk: './assets/audio/sfx/talk.ogg',
  hit: './assets/audio/sfx/hit.ogg',
  hit_sword: './assets/audio/sfx/hit_sword.ogg',
  hit_blunt: './assets/audio/sfx/hit_blunt.ogg',
  hit_magic: './assets/audio/sfx/hit_magic.ogg',
  hit_fire: './assets/audio/sfx/hit_fire.ogg',
  hit_heal: './assets/audio/sfx/hit_heal.ogg',
  hit_crit: './assets/audio/sfx/hit_crit.ogg',
  menu: './assets/audio/sfx/menu.ogg',
  ok: './assets/audio/sfx/ok.ogg',
  cancel: './assets/audio/sfx/cancel.ogg',
  alert: './assets/audio/sfx/alert.ogg',
  heal: './assets/audio/sfx/heal.ogg',
  whoosh: './assets/audio/sfx/whoosh.ogg',
  ui_tick: './assets/audio/sfx/ui_tick.ogg',
  ui_ok: './assets/audio/sfx/ui_ok.ogg',
};

let _enabled = false;
let _musicA = null;
let _musicB = null;
let _usingA = true;
let _curKey = null;
let _sfxCache = {};
let _stepGate = 0;
let _gestureBound=false;
let _wantKey=null;
let _xfading=false;
const MUSIC_VOL = 0.32;

export function isEnabled(){ return _enabled; }
export function setEnabled(on){
  _enabled = !!on;
  if(!_enabled){ stopMusic(); stopAmbient(); }
  else if(_curKey) playMusic(_curKey, true);
  try{ localStorage.setItem('isekai_audio_on', _enabled?'1':'0'); }catch(_){}
}
export function restore(){
  try{
    const v=localStorage.getItem('isekai_audio_on');
    _enabled = v==='1';
  }catch(_){}
}

function mkMusicEl(){
  const a = new Audio();
  a.loop = true;
  a.preload = 'metadata';
  a.volume = MUSIC_VOL;
  return a;
}
function ensurePair(){
  if(!_musicA) _musicA = mkMusicEl();
  if(!_musicB) _musicB = mkMusicEl();
  return _usingA ? _musicA : _musicB;
}
function otherEl(){
  return _usingA ? _musicB : _musicA;
}

export function playMusic(key, force=false){
  if(!key || (!(force) && key===_curKey && !_xfading)) { _curKey=key; _wantKey=key; return; }
  _curKey = key; _wantKey=key;
  if(!_enabled) return;
  const src = MUSIC[key] || MUSIC.town;
  const a = ensurePair();
  try{
    const end = (a.src||'').split('/').pop();
    if(end && src.endsWith(end) && !a.paused) { a.play().catch(()=>{}); return; }
    a.src = src;
    a.currentTime = 0;
    a.volume = MUSIC_VOL;
    a.play().catch(()=>{});
  }catch(_){}
}

export function stopMusic(){
  try{ if(_musicA) _musicA.pause(); }catch(_){}
  try{ if(_musicB) _musicB.pause(); }catch(_){}
  _xfading=false;
}

/** True dual-buffer crossfade between tracks */
export function fadeTo(key, ms=700){
  _wantKey=key;
  if(!_enabled){ _curKey=key; return; }
  if(!key || key===_curKey) return;
  const src = MUSIC[key] || MUSIC.town;
  const cur = ensurePair();
  const next = otherEl();
  _xfading = true;
  try{
    next.src = src;
    next.currentTime = 0;
    next.volume = 0;
    next.play().catch(()=>{});
  }catch(_){}
  const startVol = cur.volume || MUSIC_VOL;
  const t0 = performance.now();
  const step = (t)=>{
    const k = Math.min(1, (t-t0)/Math.max(80, ms));
    try{ cur.volume = startVol * (1-k); }catch(_){}
    try{ next.volume = MUSIC_VOL * k; }catch(_){}
    if(k<1) requestAnimationFrame(step);
    else {
      try{ cur.pause(); cur.volume = MUSIC_VOL; }catch(_){}
      next.volume = MUSIC_VOL;
      _usingA = !_usingA;
      _curKey = key;
      _xfading = false;
    }
  };
  requestAnimationFrame(step);
}

/** Map weapon/element labels → SFX key */
export function sfxForHit(opts={}){
  const w = String(opts.weapon||opts.wpn||opts.skill||'').toLowerCase();
  const e = String(opts.elem||opts.element||'').toLowerCase();
  if(opts.crit) return 'hit_crit';
  if(opts.heal || /heil|heal|cure/.test(w)) return 'hit_heal';
  if(/feuer|fire|flamme/.test(e+w)) return 'hit_fire';
  if(/magie|magic|arcane|licht|dunkel|eis|blitz|erde|nova|funke/.test(e+w)) return 'hit_magic';
  if(/schwert|klinge|sword|saber|rapier|dolch|dagger/.test(w)) return 'hit_sword';
  if(/hammer|axt|keule|staff|stab|blunt|streitkolben/.test(w)) return 'hit_blunt';
  return 'hit';
}

export function playSfx(kind, vol=0.45){
  if(!_enabled) return;
  try{
    // allow aliases: hit:sword → hit_sword
    let key = String(kind||'');
    if(key.includes(':')) key = key.replace(':',' _').replace(' ','_');
    if(typeof kind === 'object' && kind) key = sfxForHit(kind);
    const src = SFX[key] || SFX[kind] || null;
    if(!src) return;
    let a = _sfxCache[key];
    if(!a){ a = new Audio(src); a.preload='metadata'; _sfxCache[key]=a; }
    const c = a.cloneNode();
    c.volume = vol;
    // light variety via playbackRate without new files
    if(/^hit|^step/.test(key)) c.playbackRate = 0.92 + Math.random()*0.16;
    c.play().catch(()=>{});
  }catch(_){}
}

export function stepSfx(surface){
  const now = performance.now();
  if(now-_stepGate < 140) return;
  _stepGate = now;
  const s = String(surface||'').toLowerCase();
  let key='step';
  if(/stone|stein|cobble|dungeon|cave|straße|strasse|plaza/.test(s)) key='step_stone';
  else if(/grass|gras|wild|field|wiese|forest|wald/.test(s)) key='step_grass';
  else if(/wood|holz|floor|haus|inn|taverne|bridge/.test(s)) key='step_wood';
  else if(/water|wasser|swamp|beach|sand|regen/.test(s)) key='step_water';
  playSfx(key, 0.22);
}

/** Warm one track after gesture — never block first paint */
export function warmMusic(key){
  try{
    if(!_enabled) return;
    const src=MUSIC[key]; if(!src) return;
    const link=document.createElement('link');
    link.rel='prefetch'; link.as='audio'; link.href=src;
    document.head.appendChild(link);
  }catch(_){}
}
export function musicForMapKind(kind){
  if(kind==='dungeon') return 'dungeon';
  if(kind==='wild' || kind==='ruins') return 'wild';
  if(kind==='camp') return 'camp';
  return 'town';
}

export function unlockOnGesture(){
  if(_gestureBound) return;
  _gestureBound=true;
  const unlock=()=>{
    let muted=false;
    try{ muted=localStorage.getItem('isekai_audio_on')==='0'; }catch(_){}
    if(!muted){
      _enabled=true;
      try{ localStorage.setItem('isekai_audio_on','1'); }catch(_){}
      const key=_wantKey||_curKey||'title';
      playMusic(key, true);
      try{
        const b=document.getElementById('btnMusic');
        if(b) b.textContent='🔊 Musik an';
        const ba=document.getElementById('btnAudio');
        if(ba) ba.classList.add('is-on');
      }catch(_){}
    }
    window.removeEventListener('pointerdown', unlock, true);
    window.removeEventListener('keydown', unlock, true);
    window.removeEventListener('touchstart', unlock, true);
  };
  window.addEventListener('pointerdown', unlock, true);
  window.addEventListener('keydown', unlock, true);
  window.addEventListener('touchstart', unlock, true);
}

export function playAmbient(kind, opts){
  try{ return window.__game?.C43?.playAmbient?.(kind, {enabled:_enabled, ...(opts||{})}); }catch(_){}
}
export function stopAmbient(){
  try{ return window.__game?.C43?.stopAmbient?.(); }catch(_){}
}
export function syncAmbient(S, map){
  try{ return window.__game?.C43?.syncAmbient?.(S, map, {isEnabled:()=>_enabled}); }catch(_){}
}

export default { playMusic, stopMusic, fadeTo, playSfx, stepSfx, sfxForHit, setEnabled, isEnabled, restore, unlockOnGesture, musicForMapKind, playAmbient, stopAmbient, syncAmbient, warmMusic, MUSIC, SFX };
