/** v27 area music + SFX (Ninja Adventure CC0) */
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
  talk: './assets/audio/sfx/talk.ogg',
  hit: './assets/audio/sfx/hit.ogg',
  menu: './assets/audio/sfx/menu.ogg',
  ok: './assets/audio/sfx/ok.ogg',
  cancel: './assets/audio/sfx/cancel.ogg',
  alert: './assets/audio/sfx/alert.ogg',
  heal: './assets/audio/sfx/heal.ogg',
};

let _enabled = false;
let _musicEl = null;
let _curKey = null;
let _sfxCache = {};
let _stepGate = 0;

export function isEnabled(){ return _enabled; }
export function setEnabled(on){
  _enabled = !!on;
  if(!_enabled) stopMusic();
  else if(_curKey) playMusic(_curKey, true);
  try{ localStorage.setItem('isekai_audio_on', _enabled?'1':'0'); }catch(_){}
}
export function restore(){
  try{ _enabled = localStorage.getItem('isekai_audio_on')==='1'; }catch(_){}
}

function ensureMusic(){
  if(_musicEl) return _musicEl;
  const a = new Audio();
  a.loop = true;
  a.preload = 'auto';
  a.volume = 0.32;
  _musicEl = a;
  return a;
}

export function playMusic(key, force=false){
  if(!key || (!(force) && key===_curKey && _musicEl && !_musicEl.paused)) { _curKey=key; return; }
  _curKey = key;
  if(!_enabled) return;
  const src = MUSIC[key] || MUSIC.town;
  const a = ensureMusic();
  try{
    if(a.src && a.src.endsWith(src.replace('./',''))) { a.play().catch(()=>{}); return; }
    a.src = src;
    a.currentTime = 0;
    a.play().catch(()=>{});
  }catch(_){}
}

export function stopMusic(){
  try{ if(_musicEl){ _musicEl.pause(); } }catch(_){}
}

export function fadeTo(key, ms=600){
  if(!_enabled){ _curKey=key; return; }
  const a = ensureMusic();
  const start = a.volume;
  const t0 = performance.now();
  const step = (t)=>{
    const k = Math.min(1,(t-t0)/ms);
    a.volume = start * (1-k);
    if(k<1) requestAnimationFrame(step);
    else { playMusic(key, true); a.volume = 0.32; }
  };
  if(_curKey===key) return;
  requestAnimationFrame(step);
}

export function playSfx(kind, vol=0.45){
  if(!_enabled) return;
  try{
    const src = SFX[kind]; if(!src) return;
    let a = _sfxCache[kind];
    if(!a){ a = new Audio(src); a.preload='auto'; _sfxCache[kind]=a; }
    const c = a.cloneNode();
    c.volume = vol;
    c.play().catch(()=>{});
  }catch(_){}
}

export function stepSfx(){
  const now = performance.now();
  if(now-_stepGate < 140) return;
  _stepGate = now;
  playSfx('step', 0.22);
}

export function musicForMapKind(kind){
  if(kind==='dungeon') return 'dungeon';
  if(kind==='wild' || kind==='ruins') return 'wild';
  if(kind==='camp') return 'camp';
  return 'town';
}

export default { playMusic, stopMusic, fadeTo, playSfx, stepSfx, setEnabled, isEnabled, restore, musicForMapKind, MUSIC, SFX };
