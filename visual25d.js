/* v23 2.5D: layered parallax scenes, grounded sprites, iso map/camp/battle staging. iPhone-light. */
const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
let _tiltX = 0, _tiltY = 0, _raf = 0, _bound = false;

function $(id){ return document.getElementById(id); }

export function ensureSceneLayers(){
  const bg = $('sceneBg');
  if(!bg || bg.querySelector('.parallax-stack')) return bg;
  const stack = document.createElement('div');
  stack.className = 'parallax-stack';
  stack.innerHTML = `
    <div class="plx plx-sky" data-depth="0.15" aria-hidden="true"></div>
    <div class="plx plx-mid" data-depth="0.4" aria-hidden="true"></div>
    <div class="plx plx-ground" data-depth="0.7" aria-hidden="true"></div>
    <div class="plx plx-fg" data-depth="1" aria-hidden="true"></div>
    <div class="scene-actors" id="sceneActors" aria-hidden="true"></div>`;
  bg.insertBefore(stack, bg.firstChild);
  return bg;
}

export function setParallaxTheme(theme){
  ensureSceneLayers();
  const bg = $('sceneBg');
  if(!bg) return;
  bg.dataset.plx = theme || bg.dataset.theme || 'void';
  bg.classList.add('is-25d');
}

function applyTilt(){
  const stack = document.querySelector('.parallax-stack');
  if(!stack) return;
  stack.querySelectorAll('.plx').forEach(layer=>{
    const d = parseFloat(layer.dataset.depth||'0.5');
    const x = (-_tiltX * d * 12).toFixed(2);
    const y = (-_tiltY * d * 8).toFixed(2);
    layer.style.transform = `translate3d(${x}px,${y}px,0)`;
  });
  const actors = $('sceneActors');
  if(actors){
    const x = (-_tiltX * 0.85 * 10).toFixed(2);
    const y = (-_tiltY * 0.85 * 6).toFixed(2);
    actors.style.transform = `translate3d(${x}px,${y}px,0)`;
  }
}

function onPointer(e){
  if(reduced()) return;
  const w = window.innerWidth || 1, h = window.innerHeight || 1;
  const cx = (e.clientX ?? (e.touches&&e.touches[0]?.clientX) ?? w/2) / w;
  const cy = (e.clientY ?? (e.touches&&e.touches[0]?.clientY) ?? h/2) / h;
  _tiltX = (cx - 0.5) * 2;
  _tiltY = (cy - 0.5) * 2;
  if(!_raf) _raf = requestAnimationFrame(()=>{ _raf=0; applyTilt(); });
}

function onOrient(e){
  if(reduced()) return;
  const g = e.gamma, b = e.beta;
  if(g==null||b==null) return;
  _tiltX = Math.max(-1, Math.min(1, g / 30));
  _tiltY = Math.max(-1, Math.min(1, (b - 45) / 40));
  if(!_raf) _raf = requestAnimationFrame(()=>{ _raf=0; applyTilt(); });
}

export function bindParallax(){
  if(_bound || reduced()) return;
  _bound = true;
  ensureSceneLayers();
  window.addEventListener('pointermove', onPointer, {passive:true});
  window.addEventListener('deviceorientation', onOrient, {passive:true});
}

/** Place present NPCs as grounded sprites in the scene (emoji/initial fallback — fast). */
export function syncSceneActors(S){
  ensureSceneLayers();
  const host = $('sceneActors');
  if(!host || !S?.world?.scene) return;
  const present = (S.world.scene.anwesend||[]).slice(0,4);
  const npcs = S.world.npcs||{};
  host.innerHTML = present.map((name,i)=>{
    const n = npcs[name]||{};
    const e = n.e || n.emoji || '👤';
    const depth = 0.55 + (i%3)*0.12;
    const slot = ['l','c','r','rr'][i]||'c';
    return `<div class="actor actor-${slot}" data-depth="${depth}" style="--d:${depth}">
      <div class="actor-body"><span class="actor-emoji">${e}</span></div>
      <div class="actor-shadow"></div>
      <div class="actor-name">${String(name).split(' ')[0].slice(0,10)}</div>
    </div>`;
  }).join('');
}

export function decorateMapIso(root){
  if(!root) return;
  root.classList.add('map-iso-25d');
}

export function decorateCamp25d(root, home, S){
  if(!root) return;
  root.classList.add('camp-25d');
  const stage = home?.stage|0;
  const dmg = S?.camp?.damage || home?.damage || {};
  const burnt = (dmg.burnt|0)>0 || !!dmg.palisadeBroken;
  root.classList.toggle('camp-burnt', burnt);
  root.classList.toggle('camp-palisade-broken', !!dmg.palisadeBroken);
  if(!root.querySelector('.camp-stage-vis')){
    const vis = document.createElement('div');
    vis.className = 'camp-stage-vis'+(burnt?' is-burnt':'');
    vis.innerHTML = `<div class="camp-sky"></div><div class="camp-mid"></div><div class="camp-build s${Math.min(stage,4)}"></div><div class="camp-palisade${dmg.palisadeBroken?' broken':''}"></div><div class="camp-ash"${burnt?'':' hidden'}></div><div class="camp-fg"></div>`;
    root.prepend(vis);
  } else {
    const b = root.querySelector('.camp-build');
    if(b) b.className = 'camp-build s'+Math.min(stage,4);
    const vis = root.querySelector('.camp-stage-vis');
    if(vis) vis.classList.toggle('is-burnt', burnt);
    let pal = root.querySelector('.camp-palisade');
    if(!pal){ pal=document.createElement('div'); pal.className='camp-palisade'; root.querySelector('.camp-stage-vis')?.appendChild(pal); }
    pal.classList.toggle('broken', !!dmg.palisadeBroken);
    let ash = root.querySelector('.camp-ash');
    if(!ash){ ash=document.createElement('div'); ash.className='camp-ash'; root.querySelector('.camp-stage-vis')?.appendChild(ash); }
    ash.hidden = !burnt;
  }
}

export function decorateBattle25d(root){
  if(!root) return;
  root.classList.add('battle-25d');
  let stage = root.querySelector('.battle-stage-25d');
  if(!stage){
    stage = document.createElement('div');
    stage.className = 'battle-stage-25d';
    stage.innerHTML = `<div class="bstage-floor"></div><div class="bstage-foes" id="bstageFoes"></div><div class="bstage-party" id="bstageParty"></div>`;
    const bg = root.querySelector('.battle-bg');
    if(bg) bg.after(stage); else root.prepend(stage);
  }
}

export function battleCamPulse(root, kind='hit'){
  if(!root || reduced()) return;
  root.classList.remove('cam-zoom','cam-shake-hard');
  void root.offsetWidth;
  root.classList.add(kind==='crit'?'cam-zoom':'cam-shake-hard');
  setTimeout(()=>root.classList.remove('cam-zoom','cam-shake-hard'), kind==='crit'?420:380);
}

export function boot25d(){
  ensureSceneLayers();
  bindParallax();
}

export default { ensureSceneLayers, setParallaxTheme, bindParallax, syncSceneActors, decorateMapIso, decorateCamp25d, decorateBattle25d, battleCamPulse, boot25d };
