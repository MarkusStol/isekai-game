/** v26 Pixel JRPG overworld — LPC 64px sprites, layered maps, desktop 16:9 + gamepad */
const TILE = 16;
const SPR = 64; // LPC frame size in walk sheets (256×256 = 4×4)
const MOBILE_VIEW = { w: 13, h: 15 };
const DESKTOP_LOGICAL = { w: 320, h: 180 }; // 16:9 pixel canvas before integer scale

const BASE_TILES = {
  grass: './assets/pixel/tiles/grass.png',
  path: './assets/pixel/tiles/path.png',
  water: './assets/pixel/tiles/water.png',
  floor: './assets/pixel/tiles/floor.png',
  wall: './assets/pixel/tiles/wall.png',
  tree: './assets/pixel/tiles/tree.png',
  sand: './assets/pixel/tiles/sand.png',
  stone: './assets/pixel/tiles/stone.png',
  carpet: './assets/pixel/tiles/carpet.png',
  void: './assets/pixel/tiles/void.png',
  door: './assets/pixel/tiles/door.png',
  camp: './assets/pixel/tiles/camp.png',
  house: './assets/pixel/tiles/house.png',
  ruin: './assets/pixel/tiles/ruin.png',
};
const WATER_ANIM = './assets/pixel/tiles/water-anim.png';
const DECOR = {
  bush: './assets/pixel/decor/bush32.png',
  d0: './assets/pixel/decor/d0.png',
  d1: './assets/pixel/decor/d1.png',
  d2: './assets/pixel/decor/d2.png',
  house0: './assets/pixel/decor/house0.png',
  house1: './assets/pixel/decor/house1.png',
  house2: './assets/pixel/decor/house2.png',
  house3: './assets/pixel/decor/house3.png',
  house4: './assets/pixel/decor/house4.png',
  house5: './assets/pixel/decor/house5.png',
  house6: './assets/pixel/decor/house6.png',
  house7: './assets/pixel/decor/house7.png',
  house8: './assets/pixel/decor/house8.png',
};

const GENRE_SET = {
  zombie: 'tiles-zombie',
  cyberpunk: 'tiles-neon',
  postapoc: 'tiles-ruins',
  darkfantasy: 'tiles-dungeon',
};

const NPC_SHEETS = {
  default: './assets/pixel/npc/neutral.png',
  villager: './assets/pixel/npc/villager.png',
  guard: './assets/pixel/npc/guard.png',
  mage: './assets/pixel/npc/mage.png',
  merchant: './assets/pixel/npc/merchant.png',
  spy: './assets/pixel/npc/spy.png',
  princess: './assets/pixel/npc/princess.png',
  daemon: './assets/pixel/npc/daemon.png',
};
const PORTRAITS = {
  default: './assets/pixel/portrait/neutral.png',
  villager: './assets/pixel/portrait/villager.png',
  guard: './assets/pixel/portrait/guard.png',
  mage: './assets/pixel/portrait/mage.png',
  merchant: './assets/pixel/portrait/merchant.png',
  spy: './assets/pixel/portrait/spy.png',
  princess: './assets/pixel/portrait/princess.png',
  daemon: './assets/pixel/portrait/daemon.png',
  hero: './assets/pixel/portrait/hero.png',
};

const SOLID = new Set(['wall','water','tree','void','house','ruin']);

let _root=null, _canvas=null, _ctx=null, _imgs={}, _raf=0, _active=false;
let _map={w:24,h:24,tiles:[], overlay:[], doors:[], name:'', npcs:[], kind:'town'};
let _hero={x:12,y:12,dir:0,frame:0,moving:false,px:12,py:12};
let _npcs=[];
let _keys={}; let _tapTarget=null;
let _hooks={act:null, getS:null, onLocation:null, openMenu:null};
let _animT=0; let _last=0; let _bound=false;
let _waterFrame=0; let _tickAcc=0;
let _explored=new Set(); let _visible=new Set();
let _genre='held'; let _tileSet=BASE_TILES;
let _dlg=null;
let _desktop=false; let _intScale=3; let _viewW=13, _viewH=15;
let _padAxes={x:0,y:0}; let _padPrev={};

function isDesktop(){
  return window.matchMedia('(min-width: 900px) and (min-aspect-ratio: 4/3)').matches
    || window.innerWidth >= 1000;
}

function loadImg(src){
  if(_imgs[src]) return _imgs[src];
  const im=new Image(); im.src=src; _imgs[src]=im; return im;
}
function tileUrl(t){
  if(t==='water') return WATER_ANIM;
  return _tileSet[t] || BASE_TILES[t] || BASE_TILES.void;
}
function preload(){
  Object.values(BASE_TILES).forEach(loadImg);
  Object.values(NPC_SHEETS).forEach(loadImg);
  Object.values(PORTRAITS).forEach(loadImg);
  Object.values(DECOR).forEach(loadImg);
  loadImg('./assets/pixel/hero/walk.png');
  loadImg(WATER_ANIM);
  for(const pack of Object.values(GENRE_SET)){
    for(const k of Object.keys(BASE_TILES)){
      loadImg(`./assets/pixel/${pack}/${k}.png`);
    }
  }
}
function applyGenre(S){
  const g=String(S?.genre||S?.role||'held').toLowerCase();
  _genre=g;
  const pack=GENRE_SET[g];
  const set={...BASE_TILES};
  if(pack){
    for(const k of Object.keys(BASE_TILES)) set[k]=`./assets/pixel/${pack}/${k}.png`;
  }
  if(g==='zombie'){ set.grass=`./assets/pixel/tiles-zombie/grass.png`; set.path=`./assets/pixel/tiles-zombie/path.png`; }
  if(g==='cyberpunk'){ set.grass=`./assets/pixel/tiles-neon/grass.png`; set.path=`./assets/pixel/tiles-neon/path.png`; }
  if(g==='darkfantasy'||_map.kind==='dungeon'){
    Object.assign(set,{
      grass:`./assets/pixel/tiles-dungeon/grass.png`,
      path:`./assets/pixel/tiles-dungeon/path.png`,
      floor:`./assets/pixel/tiles-dungeon/floor.png`,
      wall:`./assets/pixel/tiles-dungeon/wall.png`,
      tree:`./assets/pixel/tiles-dungeon/tree.png`,
    });
  }
  _tileSet=set;
}

function hash(s){ let h=0; for(let i=0;i<String(s).length;i++) h=((h<<5)-h)+String(s).charCodeAt(i)|0; return Math.abs(h); }

/** Varied grass via hash so footprints aren't a flat carpet */
function grassVariant(x,y,h){
  return ((h+x*13+y*29)&3)===0 ? 'grass' : (((h+x*7+y*11)&7)===0 ? 'path' : 'grass');
}

export function buildMapForLocation(S, ort){
  const name=String(ort||S?.world?.scene?.ort||'Welt');
  const node=S?.world?.graph?.nodes?.[name] || {};
  const desc=String(S?.world?.orte?.[name]||node.desc||'').toLowerCase();
  const h=hash(name);
  let kind='town';
  const blob=desc+name.toLowerCase();
  if(/wald|wild|feld|straße|strasse|pfad|ruine/.test(blob)) kind='wild';
  if(/verlies|höhle|kerker|dungeon|keller|grab/.test(blob)) kind='dungeon';
  if(/camp|lager|zuhause|hütte|heim|grundstück/.test(blob) || S?.home?.location===name) kind='camp';
  if(/markt|stadt|dorf|platz|tempel|burg|palast|gasthaus|taverne|akademie|halle|solari/.test(blob)) kind='town';
  if(/ruine|trümmer|zerstört/.test(blob)) kind='ruins';

  const w = kind==='dungeon'?22: kind==='camp'?18:28;
  const ht = kind==='dungeon'?18: kind==='camp'?14:22;
  const tiles=Array.from({length:ht},()=>Array(w).fill('grass'));
  const overlay=Array.from({length:ht},()=>Array(w).fill(null));
  const fill=(x,y,tw,th,t)=>{ for(let j=0;j<th;j++) for(let i=0;i<tw;i++){ const xx=x+i,yy=y+j; if(yy>=0&&yy<ht&&xx>=0&&xx<w) tiles[yy][xx]=t; } };
  const scatterGrass=()=>{
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++){
      if(tiles[y][x]==='grass'){
        const n=((h+x*17+y*31)%100);
        if(n<6) overlay[y][x]='d'+(n%3);
        else if(n>94) overlay[y][x]='bush';
      }
    }
  };

  if(kind==='town'){
    // Mostly grass with slight variation — avoid striped path noise
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++){
      tiles[y][x]=((h+x*3+y*7)%11===0)?'path':'grass';
    }
    fill(0, Math.floor(ht/2)-1, w, 3, 'path');
    fill(Math.floor(w/2)-1, 0, 3, ht, 'path');
    const houses=[[2,2],[19,2],[2,14],[18,14],[11,7],[22,9]];
    houses.forEach(([bx,by])=>{
      if(bx+3>=w||by+3>=ht) return;
      fill(bx,by,3,3,'house'); // solid collision
      for(let j=0;j<3;j++) for(let i=0;i<3;i++) overlay[by+j][bx+i]='house'+(j*3+i);
      const dx=bx+1, dy=by+3;
      if(dy<ht){ tiles[dy][dx]='door'; overlay[dy][dx]=null; tiles[Math.min(ht-1,dy+1)][dx]='path'; }
      if(by>0) fill(bx, by-1, 3, 1, 'path');
    });
    for(let i=0;i<w;i++){
      if(i%4===0){ tiles[0][i]='tree'; tiles[ht-1][i]='tree'; }
    }
    // plaza
    const cx=Math.floor(w/2), cy=Math.floor(ht/2);
    fill(cx-2, cy-2, 5, 5, 'path');
    fill(cx-1, cy-1, 3, 3, 'carpet');
    scatterGrass();
  } else if(kind==='wild'){
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++){
      const n=((h+x*17+y*31)%100);
      if(n<22) tiles[y][x]='tree';
      else if(n<28) tiles[y][x]='stone';
      else if(n>90) tiles[y][x]='water';
      else tiles[y][x]='grass';
    }
    // meandering path
    let px=0, py=Math.floor(ht/2);
    while(px<w){
      tiles[py][px]='path';
      if(py+1<ht) tiles[py+1][px]='path';
      const step=((h+px*9)%5)-2;
      py=Math.max(2, Math.min(ht-3, py+((px%3===0)?step:0)));
      px++;
    }
    for(let y=0;y<ht;y++){ tiles[y][Math.floor(w/2)]='path'; }
    // small pond
    fill(4,3,4,3,'water'); fill(5,4,2,1,'water');
    scatterGrass();
  } else if(kind==='dungeon'){
    fill(0,0,w,ht,'void'); fill(1,1,w-2,ht-2,'wall'); fill(2,2,w-4,ht-4,'floor');
    fill(2, Math.floor(ht/2), w-4, 2, 'floor'); fill(Math.floor(w/2), 2, 2, ht-4, 'floor');
    for(let i=4;i<w-4;i+=4) for(let j=4;j<ht-4;j+=4){
      tiles[j][i]='stone';
      if(j+1<ht-2) tiles[j+1][i]='stone';
    }
    // rooms
    fill(3,3,5,4,'floor'); fill(w-8,3,5,4,'floor'); fill(3,ht-7,5,4,'floor');
  } else if(kind==='ruins'){
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++){
      tiles[y][x]=((h+x*7+y*11)%100)<14?'ruin':'grass';
    }
    fill(0, Math.floor(ht/2), w, 2, 'path');
    fill(6,5,6,5,'ruin');
    scatterGrass();
  } else {
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++) tiles[y][x]='grass';
    for(let i=0;i<w;i++){ tiles[0][i]='tree'; tiles[ht-1][i]='tree'; }
    fill(5,5,8,5,'camp'); fill(4,4,10,1,'path'); fill(4,10,10,1,'path'); fill(8,6,3,2,'carpet');
    scatterGrass();
  }

  let sx=Math.floor(w/2), sy=Math.floor(ht/2);
  for(let t=0;t<80;t++){
    const x=(sx+t)%w, y=(sy+Math.floor(t/3))%ht;
    if(!SOLID.has(tiles[y][x]) && tiles[y][x]!=='door'){ sx=x; sy=y; break; }
  }

  const present=S?.world?.scene?.anwesend||[];
  const npcs=[]; const used=new Set([sx+','+sy]);
  present.slice(0,8).forEach((nm,i)=>{
    const n=S.world?.npcs?.[nm]||{};
    const art=String(n.art||n.stimme||'').toLowerCase()+nm.toLowerCase();
    let sheet='villager';
    if(/wache|ritter|guard|soldat/.test(art)) sheet='guard';
    else if(/magier|hexe|zauber|mage|orren/.test(art)) sheet='mage';
    else if(/händler|kauf|merchant|wirt/.test(art)) sheet='merchant';
    else if(/späher|dieb|assassin|spy|lyra/.test(art)) sheet='spy';
    else if(/prinzess|königin|elise|princess/.test(art)) sheet='princess';
    else if(/dämon|daemon|sukkub|teufel|velka/.test(art)) sheet='daemon';
    let nx=sx+(i%2?2:-2)-((i>>1)%3), ny=sy+(i%3)-1;
    for(let tries=0;tries<40;tries++){
      const xx=Math.max(1,Math.min(w-2, nx+(tries%5)-2));
      const yy=Math.max(1,Math.min(ht-2, ny+Math.floor(tries/5)-1));
      const key=xx+','+yy;
      if(!SOLID.has(tiles[yy][xx]) && !used.has(key)){ nx=xx; ny=yy; used.add(key); break; }
    }
    npcs.push({name:nm, x:nx, y:ny, px:nx, py:ny, sheet, dir:0, frame:0, e:n.e||'👤'});
  });

  const exits=[];
  const edgeList=[];
  const g=S?.world?.graph;
  if(g?.nodes){
    for(const [on,nd] of Object.entries(g.nodes)){
      const links=nd.links||nd.exits||nd.to||nd.edges||[];
      const arr=Array.isArray(links)?links:Object.keys(links||{});
      for(const L of arr){
        const dest=typeof L==='string'?L:(L.to||L.name||L);
        if(on===name && dest) edgeList.push(String(dest));
        if(String(dest)===name && on!==name) edgeList.push(on);
      }
    }
  }
  if(!edgeList.length && S?.world?.orte){
    Object.keys(S.world.orte).filter(k=>k!==name).slice(0,3).forEach(k=>edgeList.push(k));
  }
  const uniq=[...new Set(edgeList)].filter(d=>d&&d!==name).slice(0,4);
  const slots=[[Math.floor(w/2),1],[Math.floor(w/2),ht-2],[1,Math.floor(ht/2)],[w-2,Math.floor(ht/2)]];
  uniq.forEach((dest,i)=>{
    const [ex,ey]=slots[i%slots.length];
    tiles[ey][ex]='door';
    overlay[ey][ex]=null;
    exits.push({x:ex,y:ey,to:dest});
  });

  return {w,h:ht,tiles,overlay,doors:exits,spawn:{x:sx,y:sy},kind,name,npcs};
}

function walkable(x,y){
  if(y<0||x<0||y>=_map.h||x>=_map.w) return false;
  return !SOLID.has(_map.tiles[y][x]);
}

function fogKey(x,y){ return x+','+y; }
function recomputeFog(){
  _visible=new Set();
  const R=_desktop?7:5;
  const hx=_hero.x, hy=_hero.y;
  for(let y=hy-R;y<=hy+R;y++){
    for(let x=hx-R;x<=hx+R;x++){
      if(y<0||x<0||y>=_map.h||x>=_map.w) continue;
      if(Math.hypot(x-hx,y-hy)<=R+0.2){
        const k=fogKey(x,y);
        _visible.add(k);
        _explored.add(k);
      }
    }
  }
  try{
    const S=_hooks.getS?.();
    if(S){
      S.owFog=S.owFog||{};
      const loc=_map.name||'';
      S.owFog[loc]=[..._explored];
    }
  }catch(_){}
}
function loadFog(S){
  _explored=new Set();
  try{
    const loc=S?.world?.scene?.ort||_map.name;
    const arr=S?.owFog?.[loc];
    if(Array.isArray(arr)) arr.forEach(k=>_explored.add(k));
  }catch(_){}
  recomputeFog();
}

function ensureDlg(){
  if(_dlg) return _dlg;
  let el=document.getElementById('owDlg');
  if(!el){
    el=document.createElement('div');
    el.id='owDlg';
    el.className='ow-dlg hidden';
    el.innerHTML=`
      <div class="ow-dlg-inner">
        <img class="ow-dlg-port pixelated" id="owDlgPort" alt="" width="48" height="48"/>
        <div class="ow-dlg-body">
          <div class="ow-dlg-name" id="owDlgName">…</div>
          <div class="ow-dlg-text" id="owDlgText"></div>
        </div>
        <button type="button" class="ow-dlg-close" id="owDlgClose" aria-label="Schließen">×</button>
      </div>`;
    (_root||document.body).appendChild(el);
    el.querySelector('#owDlgClose')?.addEventListener('click', ()=>hideDialogue());
  }
  _dlg=el;
  return el;
}
let _dlgTw=null;
export function showDialogue(name, text, sheet){
  const el=ensureDlg();
  el.classList.remove('hidden');
  document.body.classList.add('ow-dialogue');
  const port=el.querySelector('#owDlgPort');
  const nm=el.querySelector('#owDlgName');
  const tx=el.querySelector('#owDlgText');
  if(port) port.src=PORTRAITS[sheet]||PORTRAITS.default;
  if(nm) nm.textContent=String(name||'…').slice(0,24);
  const full=String(text||'').trim()||'…';
  if(_dlgTw) clearInterval(_dlgTw);
  let i=0; if(tx) tx.textContent='';
  _dlgTw=setInterval(()=>{
    i=Math.min(full.length, i+2);
    if(tx) tx.textContent=full.slice(0,i);
    if(i>=full.length){ clearInterval(_dlgTw); _dlgTw=null; }
  }, 18);
}
export function hideDialogue(){
  if(_dlgTw){ clearInterval(_dlgTw); _dlgTw=null; }
  _dlg?.classList.add('hidden');
  document.body.classList.remove('ow-dialogue');
}
export function isDialogueOpen(){ return !!_dlg && !_dlg.classList.contains('hidden'); }

function talkTo(name){
  if(!_hooks.act) return;
  const label=String(name||'').trim();
  if(!label) return;
  const npc=_npcs.find(n=>n.name===label);
  showDialogue(label.split(' ')[0], '…', npc?.sheet||'villager');
  _hooks.act('Ich rede mit '+label);
}

function talkNearest(){
  let best=null, bd=99;
  for(const n of _npcs){
    const d=Math.abs(Math.round(n.x)-_hero.x)+Math.abs(Math.round(n.y)-_hero.y);
    if(d<bd){ bd=d; best=n; }
  }
  if(best && bd<=2){ talkTo(best.name); return best.name; }
  if(_hooks.act) _hooks.act('Ich schaue mich um');
  return null;
}

function tryMove(dx,dy){
  if(_hero.moving) return false;
  if(isDialogueOpen()) return false;
  const nx=_hero.x+dx, ny=_hero.y+dy;
  if(dx<0)_hero.dir=1; else if(dx>0)_hero.dir=2; else if(dy<0)_hero.dir=3; else if(dy>0)_hero.dir=0;
  const bump=_npcs.find(n=>Math.round(n.x)===nx && Math.round(n.y)===ny);
  if(bump){ talkTo(bump.name); return false; }
  if(!walkable(nx,ny)) return false;
  const door=(_map.doors||[]).find(d=>d.x===nx&&d.y===ny);
  _hero.moving=true; _hero.x=nx; _hero.y=ny;
  recomputeFog();
  if(door?.to && _hooks.onLocation){
    setTimeout(()=>{ try{ _hooks.onLocation(door.to); }catch(_){ } }, 120);
  }
  return true;
}

function stepHero(dt){
  if(!_hero.moving) return;
  const speed=6;
  const dx=_hero.x-_hero.px, dy=_hero.y-_hero.py;
  const dist=Math.hypot(dx,dy);
  if(dist<0.05){ _hero.px=_hero.x; _hero.py=_hero.y; _hero.moving=false; _hero.frame=0; return; }
  const step=Math.min(dist, speed*dt);
  _hero.px+=dx/dist*step; _hero.py+=dy/dist*step;
  _animT+=dt; if(_animT>0.1){ _animT=0; _hero.frame=(_hero.frame+1)%4; }
}

/** Draw LPC 64×64 frame from 256×256 sheet (4 dirs × 4 frames) */
function drawSprite(ctx, im, frame, dir, dx, dy, tw){
  if(!(im.complete && im.naturalWidth)){
    ctx.fillStyle='#4a90d9'; ctx.fillRect(dx+tw*0.15, dy+tw*0.05, tw*0.7, tw*1.15);
    return;
  }
  const fw=SPR, fh=SPR;
  const cols=Math.max(1, Math.floor(im.naturalWidth/fw));
  const rows=Math.max(1, Math.floor(im.naturalHeight/fh));
  const fr=frame%cols;
  // LPC sheet rows: 0=down, 1=left, 2=right, 3=up — matches our dir
  const d=Math.min(dir%4, rows-1);
  const drawH=tw*1.35, drawW=tw*1.0;
  ctx.drawImage(im, fr*fw, d*fh, fw, fh, dx, dy+(tw-drawH)+tw*0.15, drawW, drawH);
}

function updatePartyPanel(){
  const el=document.getElementById('owParty');
  if(!el) return;
  try{
    const S=_hooks.getS?.();
    if(!S){ el.innerHTML=''; return; }
    const st=S.st||{};
    const name=(S.pc?.name||'Held').slice(0,12);
    const hp=st.hp|0, hpMax=st.hpMax||st.maxHp||99;
    const mp=st.mp|0, mpMax=st.mpMax||st.maxMp||30;
    const lv=st.level||st.lvl||1;
    el.innerHTML=`<div class="ow-party-card">
      <img class="pixelated" src="./assets/pixel/portrait/hero.png" width="40" height="40" alt=""/>
      <div><div class="ow-party-name">${name}</div>
      <div class="ow-party-stat">Lv ${lv}</div>
      <div class="ow-bar"><i style="width:${Math.max(0,Math.min(100,hp/hpMax*100))}%"></i></div>
      <div class="ow-bar mp"><i style="width:${Math.max(0,Math.min(100,mp/mpMax*100))}%"></i></div>
      </div></div>`;
  }catch(_){}
}
function pushLog(line){
  const el=document.getElementById('owLog');
  if(!el) return;
  const row=document.createElement('div');
  row.className='ow-log-line';
  row.textContent=String(line||'').slice(0,80);
  el.prepend(row);
  while(el.children.length>40) el.lastChild.remove();
}

function draw(){
  if(!_ctx||!_canvas) return;
  const ctx=_ctx;
  const cssW=_canvas.width, cssH=_canvas.height;
  ctx.imageSmoothingEnabled=false;
  ctx.fillStyle='#05040a'; ctx.fillRect(0,0,cssW,cssH);

  const tw = _desktop
    ? Math.floor(Math.min(cssW/_viewW, cssH/_viewH))
    : Math.floor(Math.min(cssW/_viewW, cssH/_viewH));
  const camX=_hero.px - _viewW/2 + 0.5;
  const camY=_hero.py - _viewH/2 + 0.5;
  const x0=Math.floor(camX)-1, y0=Math.floor(camY)-1;
  const x1=x0+_viewW+3, y1=y0+_viewH+3;
  const waterIm=loadImg(WATER_ANIM);
  const ox=Math.floor((cssW - _viewW*tw)/2);
  const oy=Math.floor((cssH - _viewH*tw)/2);

  for(let y=y0;y<=y1;y++){
    for(let x=x0;x<=x1;x++){
      const sx=ox+(x-camX)*tw, sy=oy+(y-camY)*tw;
      if(y<0||x<0||y>=_map.h||x>=_map.w){
        ctx.fillStyle='#05040a'; ctx.fillRect(sx,sy,tw,tw); continue;
      }
      const k=fogKey(x,y);
      const seen=_explored.has(k), vis=_visible.has(k);
      if(!seen){
        ctx.fillStyle='#05040a'; ctx.fillRect(sx,sy,tw,tw); continue;
      }
      const t=_map.tiles[y][x];
      // ground under solids
      if(SOLID.has(t) || t==='door' || t==='house'){
        const gim=loadImg(tileUrl('grass'));
        if(gim.complete && gim.naturalWidth) ctx.drawImage(gim, sx, sy, tw, tw);
      }
      if(t==='water' && waterIm.complete && waterIm.naturalWidth){
        const fw=16;
        ctx.drawImage(waterIm, (_waterFrame%4)*fw, 0, fw, fw, sx, sy, tw, tw);
      } else {
        const im=loadImg(tileUrl(t));
        if(im.complete && im.naturalWidth) ctx.drawImage(im, sx, sy, tw, tw);
        else {
          ctx.fillStyle=t==='water'?'#2858a0':t==='wall'?'#444':t==='path'?'#a88c5a':t==='house'?'#8a5a3a':'#2a5a28';
          ctx.fillRect(sx,sy,tw,tw);
        }
      }
      const ov=_map.overlay?.[y]?.[x];
      if(ov && DECOR[ov]){
        const dim=loadImg(DECOR[ov]);
        if(dim.complete && dim.naturalWidth){
          const dw=ov.startsWith('house')?tw: (ov==='bush'?tw:tw*0.7);
          ctx.drawImage(dim, sx+(tw-dw)/2, sy+(tw-dw)/2, dw, dw);
        }
      }
      if(!vis){
        ctx.fillStyle='rgba(5,4,10,.55)'; ctx.fillRect(sx,sy,tw,tw);
      }
    }
  }

  for(const n of _npcs){
    const k=fogKey(Math.round(n.x), Math.round(n.y));
    if(!_visible.has(k)) continue;
    const im=loadImg(NPC_SHEETS[n.sheet]||NPC_SHEETS.default);
    const sx=ox+(n.px-camX)*tw, sy=oy+(n.py-camY)*tw - tw*0.55;
    drawSprite(ctx, im, n.frame|0, n.dir|0, sx+tw*0.0, sy, tw);
    ctx.fillStyle='rgba(0,0,0,.65)';
    const label=(n.name||'').split(' ')[0].slice(0,8);
    ctx.font='8px monospace';
    const twm=ctx.measureText(label).width;
    ctx.fillRect(sx+tw/2-twm/2-3, sy-12, twm+6, 12);
    ctx.fillStyle='#ffe8a0'; ctx.fillText(label, sx+tw/2-twm/2, sy-3);
  }

  const him=loadImg('./assets/pixel/hero/walk.png');
  const hx=ox+(_hero.px-camX)*tw, hy=oy+(_hero.py-camY)*tw - tw*0.55;
  drawSprite(ctx, him, _hero.frame, _hero.dir, hx, hy, tw);

  // location plaque
  ctx.fillStyle='rgba(10,20,60,.85)';
  ctx.fillRect(8,8,Math.min(cssW-16,_desktop?360:300),26);
  ctx.strokeStyle='#9eb6ff'; ctx.lineWidth=2; ctx.strokeRect(8.5,8.5,Math.min(cssW-17,_desktop?359:299),25);
  ctx.fillStyle='#e8f0ff'; ctx.font=_desktop?'10px "Press Start 2P", monospace':'11px monospace';
  ctx.fillText((_map.name||'').slice(0,28), 14, 26);
}

function pollGamepad(){
  _padAxes={x:0,y:0};
  try{
    const pads=navigator.getGamepads?.()||[];
    const gp=[...pads].find(p=>p&&p.connected);
    if(!gp) return;
    const ax=gp.axes||[];
    const bt=gp.buttons||[];
    let x=ax[0]||0, y=ax[1]||0;
    if(Math.abs(x)<0.35) x=0; if(Math.abs(y)<0.35) y=0;
    // D-pad
    if(bt[14]?.pressed) x=-1; if(bt[15]?.pressed) x=1;
    if(bt[12]?.pressed) y=-1; if(bt[13]?.pressed) y=1;
    _padAxes={x:Math.sign(x), y:Math.sign(y)};
    const pressed=(i)=>!!bt[i]?.pressed;
    const edge=(name,i)=>{
      const now=pressed(i);
      const was=!!_padPrev[name];
      _padPrev[name]=now;
      return now && !was;
    };
    if(edge('a',0) || edge('x',2)){ // A/X confirm/talk
      if(isDialogueOpen()) hideDialogue();
      else talkNearest();
    }
    if(edge('b',1) || edge('start',9)){ // B/Start menu
      try{ _hooks.openMenu?.(); }catch(_){}
      try{ document.getElementById('btnMenu')?.click(); }catch(_){}
    }
    if(edge('y',3)){ // Y → freitext
      document.body.classList.add('ow-dialogue');
      document.getElementById('txt')?.focus();
    }
  }catch(_){}
}

function loop(ts){
  if(!_active) return;
  const dt=Math.min(0.05, (_last? (ts-_last) : 16)/1000); _last=ts;
  _tickAcc+=dt;
  if(_tickAcc>0.28){ _tickAcc=0; _waterFrame=(_waterFrame+1)%4; }
  pollGamepad();
  let dx=0,dy=0;
  if(_keys.ArrowLeft||_keys.a||_keys.A) dx-=1;
  if(_keys.ArrowRight||_keys.d||_keys.D) dx+=1;
  if(_keys.ArrowUp||_keys.w||_keys.W) dy-=1;
  if(_keys.ArrowDown||_keys.s||_keys.S) dy+=1;
  if(_padAxes.x) dx=_padAxes.x;
  if(_padAxes.y) dy=_padAxes.y;
  if(_tapTarget && !_hero.moving){
    const tx=_tapTarget.x - _hero.x, ty=_tapTarget.y - _hero.y;
    if(Math.abs(tx)+Math.abs(ty)===0) _tapTarget=null;
    else if(Math.abs(tx)>=Math.abs(ty)) dx=Math.sign(tx); else dy=Math.sign(ty);
  }
  if((dx||dy) && !_hero.moving) tryMove(dx, dy);
  for(const n of _npcs){
    if(Math.random()<0.003){
      const d=[[1,0],[-1,0],[0,1],[0,-1]][Math.floor(Math.random()*4)];
      const nx=Math.round(n.x)+d[0], ny=Math.round(n.y)+d[1];
      if(walkable(nx,ny) && !_npcs.some(o=>o!==n&&Math.round(o.x)===nx&&Math.round(o.y)===ny) && !(nx===_hero.x&&ny===_hero.y)){
        if(d[0]<0)n.dir=1; else if(d[0]>0)n.dir=2; else if(d[1]<0)n.dir=3; else n.dir=0;
        n.x=nx; n.y=ny; n.frame=(n.frame+1)%4;
      }
    }
    n.px+=(n.x-n.px)*Math.min(1,dt*8); n.py+=(n.y-n.py)*Math.min(1,dt*8);
  }
  stepHero(dt);
  draw();
  _raf=requestAnimationFrame(loop);
}

function fitCanvas(){
  if(!_canvas) return;
  _desktop=isDesktop();
  document.body.classList.toggle('ow-desktop', _desktop);
  if(_desktop){
    // Integer-scaled 16:9 pixel canvas
    const maxW=Math.min(window.innerWidth - 320, 1600); // leave room for side panels
    const maxH=Math.min(window.innerHeight - 80, 900);
    let scale=1;
    while((DESKTOP_LOGICAL.w*(scale+1))<=maxW && (DESKTOP_LOGICAL.h*(scale+1))<=maxH) scale++;
    scale=Math.max(2, scale);
    _intScale=scale;
    const lw=DESKTOP_LOGICAL.w, lh=DESKTOP_LOGICAL.h;
    _canvas.width=lw;
    _canvas.height=lh;
    _canvas.style.width=(lw*scale)+'px';
    _canvas.style.height=(lh*scale)+'px';
    // how many tiles fit at ~16px logical
    _viewW=Math.floor(lw/16);
    _viewH=Math.floor(lh/16);
  } else {
    const w=Math.min(window.innerWidth, 430);
    const h=Math.min(Math.floor(window.innerHeight*0.48), 520);
    _canvas.style.width=w+'px';
    _canvas.style.height=h+'px';
    _canvas.width=Math.floor(w);
    _canvas.height=Math.floor(h);
    _viewW=MOBILE_VIEW.w;
    _viewH=MOBILE_VIEW.h;
    _intScale=3;
  }
}

function toggleFullscreen(){
  const target=_root||document.documentElement;
  try{
    if(!document.fullscreenElement){
      (target.requestFullscreen||target.webkitRequestFullscreen)?.call(target);
    } else {
      (document.exitFullscreen||document.webkitExitFullscreen)?.call(document);
    }
  }catch(_){}
}

function ensureDOM(){
  let root=document.getElementById('overworld');
  if(!root){
    root=document.createElement('div');
    root.id='overworld';
    root.className='overworld hidden';
    root.innerHTML=`
      <div class="ow-shell">
        <aside class="ow-side ow-side-left" id="owParty" aria-label="Party"></aside>
        <div class="ow-main">
          <canvas id="owCanvas" width="390" height="480" aria-label="Weltkarte"></canvas>
          <div class="ow-toolbar">
            <button type="button" class="ow-fs" id="owFullscreen" title="Vollbild" aria-label="Vollbild">⛶</button>
            <span class="ow-hint" id="owHint">WASD · Enter reden · Esc Menü · T Text</span>
          </div>
          <div class="ow-pad" id="owPad">
            <button type="button" data-dx="0" data-dy="-1" aria-label="Hoch">▲</button>
            <div class="ow-pad-mid">
              <button type="button" data-dx="-1" data-dy="0" aria-label="Links">◀</button>
              <button type="button" data-dx="0" data-dy="0" class="ow-action" id="owTalk" aria-label="Sprechen">💬</button>
              <button type="button" data-dx="1" data-dy="0" aria-label="Rechts">▶</button>
            </div>
            <button type="button" data-dx="0" data-dy="1" aria-label="Runter">▼</button>
          </div>
          <button type="button" class="ow-keyboard" id="owKeyboard" aria-label="Freitext">⌨ Freitext</button>
        </div>
        <aside class="ow-side ow-side-right" id="owLog" aria-label="Log"></aside>
      </div>
    `;
    const stage=document.getElementById('stage');
    if(stage) stage.insertBefore(root, stage.firstChild);
    else document.body.appendChild(root);
  }
  _root=root;
  _canvas=document.getElementById('owCanvas');
  _ctx=_canvas.getContext('2d');
  ensureDlg();
  if(_bound){ fitCanvas(); return; }
  _bound=true;
  fitCanvas();
  window.addEventListener('resize', ()=>{ fitCanvas(); draw(); });

  document.getElementById('owFullscreen')?.addEventListener('click', toggleFullscreen);

  const pad=document.getElementById('owPad');
  const hold={};
  const start=(dx,dy,id)=>{ hold[id]=setInterval(()=>{ if(dx||dy) tryMove(dx,dy); }, 140); if(dx||dy) tryMove(dx,dy); };
  const end=(id)=>{ clearInterval(hold[id]); delete hold[id]; };
  pad?.querySelectorAll('button[data-dx]').forEach(btn=>{
    if(btn.id==='owTalk') return;
    const dx=+btn.dataset.dx, dy=+btn.dataset.dy;
    const id=btn.dataset.dx+','+btn.dataset.dy;
    btn.addEventListener('pointerdown', e=>{ e.preventDefault(); start(dx,dy,id); });
    ['pointerup','pointerleave','pointercancel'].forEach(ev=>btn.addEventListener(ev, ()=>end(id)));
  });
  document.getElementById('owTalk')?.addEventListener('click', ()=>talkNearest());
  document.getElementById('owKeyboard')?.addEventListener('click', ()=>{
    document.body.classList.add('ow-dialogue');
    const txt=document.getElementById('txt');
    if(txt){ txt.focus(); try{txt.scrollIntoView({block:'end'});}catch(_){}}
  });
  _canvas.addEventListener('pointerdown', e=>{
    if(!_active) return;
    const rect=_canvas.getBoundingClientRect();
    const tw = Math.floor(Math.min(_canvas.width/_viewW, _canvas.height/_viewH));
    const camX=_hero.px - _viewW/2 + 0.5;
    const camY=_hero.py - _viewH/2 + 0.5;
    const ox=Math.floor((_canvas.width - _viewW*tw)/2);
    const oy=Math.floor((_canvas.height - _viewH*tw)/2);
    const scaleX=_canvas.width/rect.width, scaleY=_canvas.height/rect.height;
    const cx=(e.clientX-rect.left)*scaleX, cy=(e.clientY-rect.top)*scaleY;
    const tx=Math.floor(camX + (cx-ox)/tw), ty=Math.floor(camY + (cy-oy)/tw);
    const hit=_npcs.find(n=>Math.round(n.x)===tx && Math.round(n.y)===ty);
    if(hit){ talkTo(hit.name); return; }
    _tapTarget={x:tx,y:ty};
  });
  window.addEventListener('keydown', e=>{
    if(!_active) return;
    if(document.activeElement?.id==='txt' || document.activeElement?.tagName==='INPUT' || document.activeElement?.tagName==='TEXTAREA'){
      if(e.key==='Escape'){ document.getElementById('txt')?.blur(); hideDialogue(); e.preventDefault(); }
      return;
    }
    const moveKeys=['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D'];
    if(moveKeys.includes(e.key)){ _keys[e.key]=true; e.preventDefault(); return; }
    if(e.key==='Enter' || e.key===' '){
      e.preventDefault();
      if(isDialogueOpen()){ hideDialogue(); return; }
      talkNearest();
      return;
    }
    if(e.key==='Escape'){
      e.preventDefault();
      if(isDialogueOpen()){ hideDialogue(); return; }
      try{ document.getElementById('btnMenu')?.click(); }catch(_){}
      try{ _hooks.openMenu?.(); }catch(_){}
      return;
    }
    if(e.key==='t' || e.key==='T'){
      e.preventDefault();
      document.body.classList.add('ow-dialogue');
      const txt=document.getElementById('txt');
      if(txt){ txt.focus(); }
      return;
    }
    if(e.key==='f' || e.key==='F'){
      if(!e.metaKey && !e.ctrlKey){ e.preventDefault(); toggleFullscreen(); }
    }
  });
  window.addEventListener('keyup', e=>{ _keys[e.key]=false; });
  window.addEventListener('gamepadconnected', ()=>{ pushLog('Gamepad verbunden'); });
}

export function mountOverworld(hooks={}){
  _hooks={..._hooks, ...hooks};
  preload();
  ensureDOM();
}

export function showOverworld(S){
  ensureDOM();
  preload();
  const built=buildMapForLocation(S, S?.world?.scene?.ort);
  _map=built;
  applyGenre(S);
  if(built.kind==='dungeon'){
    _tileSet={..._tileSet,
      grass:'./assets/pixel/tiles-dungeon/grass.png',
      path:'./assets/pixel/tiles-dungeon/path.png',
      floor:'./assets/pixel/tiles-dungeon/floor.png',
      wall:'./assets/pixel/tiles-dungeon/wall.png',
      tree:'./assets/pixel/tiles-dungeon/tree.png',
      void:'./assets/pixel/tiles-dungeon/void.png',
      door:'./assets/pixel/tiles-dungeon/door.png',
      stone:'./assets/pixel/tiles-dungeon/stone.png',
    };
  }
  _npcs=(built.npcs||[]).map(n=>({...n, dir:0, frame:0}));
  _hero.x=built.spawn.x; _hero.y=built.spawn.y;
  _hero.px=_hero.x; _hero.py=_hero.y; _hero.moving=false; _hero.frame=0;
  loadFog(S);
  _root.classList.remove('hidden');
  document.body.classList.add('pixel-ow');
  _active=true; _last=0;
  fitCanvas();
  updatePartyPanel();
  if(!_raf) _raf=requestAnimationFrame(loop);
  draw();
}

export function hideOverworld(){
  _active=false;
  if(_raf){ cancelAnimationFrame(_raf); _raf=0; }
  _root?.classList.add('hidden');
  document.body.classList.remove('pixel-ow','ow-desktop');
  hideDialogue();
}

export function refreshOverworld(S){
  if(!_active) return;
  const prevName=_map.name;
  const prevExpl=new Set(_explored);
  showOverworld(S);
  if(_map.name===prevName){ _explored=prevExpl; recomputeFog(); }
  updatePartyPanel();
}

export function isOverworldActive(){ return _active; }

export function syncDialogueFromVN(){
  if(!isDialogueOpen()) return;
  const sp=document.getElementById('speaker')?.textContent||'';
  const tx=document.getElementById('vnText')?.textContent||'';
  if(!tx || tx==='…') return;
  const nameEl=document.getElementById('owDlgName');
  const textEl=document.getElementById('owDlgText');
  if(nameEl && sp) nameEl.textContent=sp.slice(0,24);
  if(textEl){
    if(_dlgTw){ clearInterval(_dlgTw); _dlgTw=null; }
    const full=tx; let i=0; textEl.textContent='';
    _dlgTw=setInterval(()=>{
      i=Math.min(full.length, i+3);
      textEl.textContent=full.slice(0,i);
      if(i>=full.length){ clearInterval(_dlgTw); _dlgTw=null; }
    }, 16);
  }
  pushLog((sp?sp+': ':'')+tx.slice(0,60));
}

export function __debug(){
  return {active:_active, desktop:_desktop, scale:_intScale, view:{w:_viewW,h:_viewH}, hero:{..._hero}, map:{w:_map.w,h:_map.h,name:_map.name,kind:_map.kind}, npcs:_npcs.map(n=>({name:n.name,x:n.x,y:n.y})), doors:_map.doors, fog:{explored:_explored.size, visible:_visible.size}};
}
export function __tryMove(dx,dy){ return tryMove(dx,dy); }
export function __talkNearest(){ return talkNearest(); }

export default { mountOverworld, showOverworld, hideOverworld, refreshOverworld, isOverworldActive, buildMapForLocation, showDialogue, hideDialogue, syncDialogueFromVN, __debug, __tryMove, __talkNearest };
