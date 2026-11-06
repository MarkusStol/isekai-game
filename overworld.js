/** v28 Pixel JRPG overworld — dense art, unique orts, soft FoW, day/night, weather, audio */
const TILE = 16;
const SPR = 64; // LPC frame size in walk sheets (256×256 = 4×4)
const MOBILE_VIEW = { w: 13, h: 27 }; /* v45d: fill 390x844 — was 11x13 letterboxing ~45% */
const DESKTOP_LOGICAL = { w: 320, h: 180 }; // 16:9 pixel canvas before integer scale

const BASE_TILES = {
  // v74: single family — Ninja Adventure CC0 cuts (see ART-BIBLE.md)
  grass: './assets/pixel/tiles-na/cut/grass.png',
  path: './assets/pixel/tiles-na/cut/path.png',
  water: './assets/pixel/tiles-na/cut/water.png',
  floor: './assets/pixel/tiles-na/cut/floor.png',
  wall: './assets/pixel/tiles-na/cut/wall.png',
  tree: './assets/pixel/tiles-na/cut/tree.png',
  sand: './assets/pixel/tiles-na/cut/sand.png',
  stone: './assets/pixel/tiles-na/cut/stone.png',
  carpet: './assets/pixel/tiles-na/cut/carpet.png',
  plaza: './assets/pixel/tiles-na/cut/plaza.png',
  void: './assets/pixel/tiles-na/cut/void.png',
  door: './assets/pixel/tiles-na/cut/door.png',
  camp: './assets/pixel/tiles-na/cut/camp.png',
  camp_burnt: './assets/pixel/tiles-na/cut/camp_burnt.png',
  burnt: './assets/pixel/tiles-na/cut/burnt.png',
  ash: './assets/pixel/tiles-na/cut/ash.png',
  ember: './assets/pixel/tiles-na/cut/ember.png',
  fence_broken: './assets/pixel/tiles-na/cut/fence_broken.png',
  house: './assets/pixel/tiles-na/cut/house.png',
  ruin: './assets/pixel/tiles-na/cut/ruin.png',
  fence: './assets/pixel/tiles-na/cut/fence.png',
  well: './assets/pixel/tiles-na/cut/well.png',
  flower: './assets/pixel/tiles-na/cut/flower.png',
  stall: './assets/pixel/tiles-na/cut/stall.png',
  wood: './assets/pixel/tiles-na/cut/wood.png',
  stairs: './assets/pixel/tiles-na/cut/stairs.png',
  cliff: './assets/pixel/tiles-na/cut/cliff.png',
};
const WATER_ANIM = './assets/pixel/tiles/water-anim.png';
const WATER_ANIM_NOCTURNA = './assets/pixel/tiles-nocturna/water-anim.png';
const DECOR = {
  bush: './assets/pixel/decor/bush32.png',
  fence: './assets/pixel/decor/fence.png',
  well: './assets/pixel/decor/well.png',
  flower: './assets/pixel/decor/flower.png',
  stall: './assets/pixel/decor/stall.png',
  barrel: './assets/pixel/decor/barrel.png',
  crate: './assets/pixel/decor/crate.png',
  lamp: './assets/pixel/decor/lamp.png',
  sign: './assets/pixel/decor/sign.png',
  bench: './assets/pixel/decor/bench.png',
  chest: './assets/pixel/tiles-na/cut/chest.png',
  statue: './assets/pixel/decor/statue.png',
  cart: './assets/pixel/decor/cart.png',
  shadow: './assets/pixel/decor/shadow.png',
  watchtower: './assets/pixel/decor/watchtower.png',
  pine: './assets/pixel/decor/pine.png',
  pine2: './assets/pixel/decor/pine2.png',
  pine3: './assets/pixel/decor/pine3.png',
  pine_tall: './assets/pixel/decor/pine_tall.png',
  rock: './assets/pixel/decor/rock.png',
  snowdrift: './assets/pixel/decor/snowdrift.png',
  dead_bush: './assets/pixel/decor/dead_bush.png',
  footprints: './assets/pixel/decor/footprints.png',
  campfire: './assets/pixel/decor/campfire.png',
  coffin: './assets/pixel/decor/coffin.png',
  throne_chair: './assets/pixel/decor/throne_chair.png',
  altar: './assets/pixel/decor/altar.png',
  glass_blue: './assets/pixel/tiles-nocturna/areas/cathedral/glass_blue.png',
  glass_red: './assets/pixel/tiles-nocturna/areas/cathedral/glass_red.png',
  glass_green: './assets/pixel/tiles-nocturna/areas/cathedral/glass_green.png',
  glass_gold: './assets/pixel/tiles-nocturna/areas/cathedral/glass_gold.png',
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
  ash: './assets/pixel/tiles/ash.png',
  ember: './assets/pixel/tiles/ember.png',
};
const HOUSE_BIG = Array.from({length:16},(_,i)=>`./assets/pixel/decor/housebig${i}.png`);
const HALL_BIG = Array.from({length:8},(_,i)=>`./assets/pixel/decor/hall${i}.png`);
/** v35 genre-unique architecture pools */
const ARCH_GENRE = {
  fantasy: Array.from({length:6},(_,i)=>`./assets/pixel/decor/arch_fan${i}.png`),
  highfantasy: Array.from({length:6},(_,i)=>`./assets/pixel/decor/arch_fan${i}.png`),
  held: Array.from({length:6},(_,i)=>`./assets/pixel/decor/arch_fan${i}.png`),
  darkfantasy: Array.from({length:4},(_,i)=>`./assets/pixel/decor/arch_dark${i}.png`),
  daemon: Array.from({length:4},(_,i)=>`./assets/pixel/decor/arch_dark${i}.png`),
  zombie: Array.from({length:5},(_,i)=>`./assets/pixel/decor/arch_zom${i}.png`),
  cyberpunk: Array.from({length:5},(_,i)=>`./assets/pixel/decor/arch_cyb${i}.png`),
  desert: Array.from({length:4},(_,i)=>`./assets/pixel/decor/arch_des${i}.png`),
  postapoc: Array.from({length:5},(_,i)=>`./assets/pixel/decor/arch_zom${i}.png`),
};
const ANIM = {
  flower: './assets/pixel/anim/flower.png',
  torch: './assets/pixel/anim/torch.png',
  smoke: './assets/pixel/anim/smoke.png',
  fountain: './assets/pixel/anim/fountain.png',
};

const GENRE_SET = {
  zombie: 'tiles-zombie',
  cyberpunk: 'tiles-neon',
  postapoc: 'tiles-ruins',
  darkfantasy: 'tiles-dungeon',
  daemon: 'tiles-nocturna',
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

const SOLID = new Set(['wall','water','tree','void','house','ruin','fence','fence_broken','well','stall']);

let _root=null, _canvas=null, _ctx=null, _imgs={}, _raf=0, _active=false, _mmTick=0;
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
let _dayTint='day'; let _wxParts=[]; let _audioApi=null;
let _desktop=false; let _intScale=3; let _viewW=13, _viewH=15; let _lastViewW=0,_lastViewH=0;
let _padAxes={x:0,y:0}; let _padPrev={};
let _overhead=[]; // {x,y,src,w,h} world-tile anchored big sprites drawn after entities
export let __map=null; // last built map (gates/shots)
let _animators=[]; // {x,y,kind} animated overlays
let _animFrame=0;
let _chests=[]; // {x,y,id,open,loot}
let _questMarks=[]; // {x,y,label,kind}
let _lights=[]; // {x,y,r,color} night readability


function isDesktop(){
  // v66 PC-only: always desktop layout (keyboard / mouse / gamepad)
  return true;
}

function loadImg(src){
  if(_imgs[src]) return _imgs[src];
  const im=new Image(); im.src=src; _imgs[src]=im; return im;
}
function tileUrl(t){
  if(t==='water') return (_genre==='daemon' ? WATER_ANIM_NOCTURNA : WATER_ANIM);
  return _tileSet[t] || BASE_TILES[t] || BASE_TILES.void;
}
function preload(){
  Object.values(BASE_TILES).forEach(loadImg);
  Object.values(NPC_SHEETS).forEach(loadImg);
  Object.values(PORTRAITS).forEach(loadImg);
  Object.values(DECOR).forEach(loadImg);
  Object.values(ANIM).forEach(loadImg);
  HOUSE_BIG.forEach(loadImg); HALL_BIG.forEach(loadImg);
  for(let i=0;i<8;i++) loadImg(`./assets/pixel/decor/town_house_${i}.png`);
  for(let i=0;i<4;i++) loadImg(`./assets/pixel/decor/town_hall_${i}.png`);
  Object.values(ARCH_GENRE).forEach(arr=>arr.forEach(loadImg));
  loadImg('./assets/pixel/hero/walk.png');
  loadImg('./assets/pixel/tiles-na/sheets/outdoor.png');
  loadImg('./assets/pixel/tiles-na/sheets/interior_floor.png');
  loadImg(WATER_ANIM);
  for(const pack of Object.values(GENRE_SET)){
    for(const k of Object.keys(BASE_TILES)){
      loadImg(`./assets/pixel/${pack}/${k}.png`);
    }
  }
}

/** v63: 4-neighbor same-mask (N=1 E=2 S=4 W=8) for Wang/blob variants */
function wangSameMask(x,y,isSame){
  let m=0;
  if(isSame(x,y-1)) m|=1;
  if(isSame(x+1,y)) m|=2;
  if(isSame(x,y+1)) m|=4;
  if(isSame(x-1,y)) m|=8;
  return m;
}
const WANG_COUNTS = { cliff:8, grass:6, path:5, water:5, tree:6, floor:6, wall:6 };
function isCliffMat(t){ return t==='stone'||t==='wall'||t==='cliff'; }
function wangUrlFor(t,x,y){
  const base = tileUrl(t);
  if(!base || !_map) return base;
  const NA='./assets/pixel/tiles-na/cut/';
  // v74: all wang variants stay inside NA cuts (ART-BIBLE — no tiles-nocturna mix)
  const jitter=(x*3+y*5)&7;
  const passy=/wall|pass|grenze/i.test(String(_map.preset||_map.name||''));
  if(_map.kind==='dungeon'){
    if(t==='wall'||t==='void') return NA + 'wall_top' + (jitter&3) + '.png';
    if(t==='floor'||t==='stone'||t==='carpet'||t==='plaza'||t==='path'||t==='grass'||t==='wood'){
      const opts=['dfloor_lit','dfloor_mid','dfloor_dark','dfloor_lit','dfloor_mid','ifloor_slate'];
      return NA + opts[(jitter + ((x+y)&1)) % opts.length] + '.png';
    }
    if(t==='door') return NA + 'door.png';
    if(t==='stairs') return NA + 'stairs.png';
    if(t==='sand') return NA + 'biome_snow.png';
    if(t==='water') return NA + 'biome_ice.png';
  }
  if(_map.kind==='interior'){
    if(t==='wall') return NA + 'wall_top' + (jitter&3) + '.png';
    if(t==='floor'||t==='stone'||t==='plaza'||t==='path'||t==='grass'){
      const opts=['ifloor_stone','ifloor_slate','ifloor_tile','ifloor_wood','ifloor_check','ifloor_stone'];
      return NA + opts[jitter % opts.length] + '.png';
    }
    if(t==='carpet') return NA + 'ifloor_carpet.png';
    if(t==='wood') return NA + 'ifloor_wood.png';
    if(t==='door') return NA + 'door.png';
  }
  if(t==='grass'){
    if(passy) return NA + ((jitter&1)?'biome_snow':'snow') + '.png';
    const opts=['grass','grass1','grass2','grass3','biome_grass_bright','biome_grass_dark'];
    return NA + opts[jitter % opts.length] + '.png';
  }
  if(t==='path'){
    const opts=['path','path1','path2','path3'];
    return NA + opts[jitter % opts.length] + '.png';
  }
  if(t==='water'){
    const opts=['water','water1','water2','biome_ice'];
    return NA + opts[jitter % opts.length] + '.png';
  }
  if(t==='sand') return NA + ((jitter&1)?'biome_sand':'sand') + '.png';
  if(t==='stone'||t==='cliff'||t==='wall'){
    if(passy) return NA + 'cliff_snow.png';
    return NA + 'cliff_mountain.png';
  }
  if(t==='tree') return NA + 'tree.png';
  if(t==='door') return NA + 'door.png';
  if(t==='stairs') return NA + 'stairs.png';
  return base;
}

/** Real Ninja Adventure sheet cells (16px). Repeating tiles only — not the peach cut/ placeholders. */
const NA_SHEET = {
  outdoor: './assets/pixel/tiles-na/sheets/outdoor.png',
  interior: './assets/pixel/tiles-na/sheets/interior_floor.png',
};
const NA_CELL = {
  grass: ['outdoor', [[48,128],[64,128],[48,160],[64,160]]],
  snow: ['outdoor', [[304,344],[288,344],[320,344],[212,344],[260,344],[196,296]]],
  trail: ['outdoor', [[288,344],[320,344],[228,344],[308,328]]],
  path: ['outdoor', [[336,256],[352,256],[192,224],[208,224]]],
  wood: ['outdoor', [[192,224],[208,224],[176,224]]],
  dun: ['interior', [[208,192],[224,192],[240,192],[256,192],[272,192],[208,208],[240,208],[224,208]]],
  throne: ['interior', [[208,192],[224,192],[240,192],[256,192],[208,208]]],
  dais: ['outdoor', [[204,416],[220,416],[204,424],[220,424]]],
  wall: ['outdoor', [[204,432],[220,432],[204,440],[220,440],[284,424]]],
};
function naSpec(t, x, y){
  const kind=_map?.kind||'';
  const preset=String(_map?.preset||_map?.name||'');
  const pass=/wall|pass|grenze|berg/i.test(preset);
  const throne=/throne|festung/i.test(preset) || (kind==='interior' && /thron/i.test(String(_map?.name||'')));
  const j=Math.abs((x*3+y*5)|0);
  let key='grass';
  if(kind==='dungeon'){
    key=(t==='wall'||t==='void'||t==='cliff')?'wall':(t==='stone'?'dais':'dun');
  } else if(pass){
    if(t==='stone'||t==='wall'||t==='cliff') key='wall';
    else if(t==='path') key='trail';
    else key='snow';
  } else if(throne){
    if(t==='wall'||t==='cliff') key='wall';
    else if(t==='carpet') key='dun';
    else if(t==='stone'||t==='plaza') key='dais';
    else if(t==='wood') key='wood';
    else key='throne';
  } else if(kind==='interior' || /church|cathedral/i.test(preset)){
    if(t==='wall'||t==='cliff') key='wall';
    else if(t==='wood') key='wood';
    else if(t==='carpet') key='dun';
    else key='dais';
  } else if(t==='path'||t==='sand'||t==='wood') key = t==='wood'?'wood':'path';
  else if(t==='stone'||t==='wall'||t==='cliff') key='wall';
  else if(t==='water') key='snow';
  const pack=NA_CELL[key]||NA_CELL.grass;
  const cell=pack[1][j%pack[1].length];
  return {src:NA_SHEET[pack[0]], sx:cell[0], sy:cell[1]};
}
const PASS_SNOW=[
  './assets/pixel/tiles-na/cut/snow1.png',
  './assets/pixel/tiles-na/cut/snow.png',
  './assets/pixel/tiles-na/cut/snow3.png',
];
function paintPassTile(ctx, t, x, y, sx, sy, tw){
  if(_map?.preset!=='wall') return false;
  const SNOW='#e7eef4';
  const ROCK='#6a7278';
  const ROCK_DARK='#525960';
  const cliff=t==='stone'||t==='wall'||t==='cliff';
  if(cliff){
    ctx.fillStyle=ROCK;
    ctx.fillRect(sx, sy, tw, tw);
    ctx.fillStyle=ROCK_DARK;
    ctx.fillRect(sx, sy+tw-Math.max(2, Math.round(tw*0.12)), tw, Math.max(2, Math.round(tw*0.12)));
    const above=_map.tiles?.[y-1]?.[x];
    const snowAbove=above==='sand'||above==='path'||above==='grass'||above==='floor'||above==='plaza'||above==='snow';
    if(snowAbove){
      ctx.fillStyle=SNOW;
      ctx.fillRect(sx, sy, tw, Math.max(2, Math.round(tw*0.16)));
    }
    return true;
  }
  const ground=t==='sand'||t==='grass'||t==='floor'||t==='plaza'||t==='path'||t==='water'||t==='snow';
  if(!ground) return false;
  if(t==='water'){
    ctx.fillStyle='#c3d3df';
    ctx.fillRect(sx, sy, tw, tw);
    ctx.fillStyle='#a9bfce';
    ctx.fillRect(sx, sy+Math.floor(tw*0.62), tw, Math.max(1, Math.floor(tw*0.08)));
    return true;
  }
  const im=loadImg(PASS_SNOW[0]);
  if(im.complete && im.naturalWidth) ctx.drawImage(im, 0, 0, im.naturalWidth, im.naturalHeight, sx, sy, tw, tw);
  else ctx.fillStyle=SNOW, ctx.fillRect(sx, sy, tw, tw);
  return true;
}
function paintNa(ctx, t, x, y, dx, dy, dw, dh){
  try{
    const spec=naSpec(t,x,y);
    const im=loadImg(spec.src);
    if(!(im.complete && im.naturalWidth)) return false;
    ctx.imageSmoothingEnabled=false;
    ctx.drawImage(im, spec.sx, spec.sy, 16, 16, dx, dy, dw||0, dh||dw||0);
    return true;
  }catch(_){ return false; }
}
/** Floor / rug / dais / wall separation. The sheet cell is the texture; the wash is the room. */
function shadeField(ctx, t, x, y, sx, sy, tw){
  const preset=String(_map?.preset||'');
  const throne=/throne/i.test(preset);
  const dung=_map?.kind==='dungeon';
  if(throne && t==='carpet'){
    ctx.fillStyle='rgba(92,18,32,0.78)';
    ctx.fillRect(sx+1, sy+1, tw-2, tw-2);
    ctx.fillStyle='rgba(196,154,62,0.9)';
    ctx.fillRect(sx+1, sy+1, tw-2, 2);
    ctx.fillRect(sx+1, sy+tw-3, tw-2, 2);
    ctx.fillRect(sx+1, sy+1, 2, tw-2);
    ctx.fillRect(sx+tw-3, sy+1, 2, tw-2);
    return;
  }
  if(throne && (t==='stone'||t==='plaza')){
    ctx.fillStyle='rgba(210,206,196,0.28)';
    ctx.fillRect(sx, sy, tw, Math.max(2, tw*0.18));
    const nb=(dx,dy)=>_map?.tiles?.[y+dy]?.[x+dx];
    const beside=[nb(0,-1),nb(0,1),nb(1,0),nb(-1,0)].filter(v=>v==='carpet').length;
    if(beside===1){
      ctx.fillStyle='#242b38';
      ctx.fillRect(sx+tw*0.3, sy-tw*1.25, tw*0.4, tw*1.35);
      ctx.fillStyle='#9aa3b2';
      ctx.fillRect(sx+tw*0.22, sy-tw*1.34, tw*0.56, Math.max(3, tw*0.12));
      ctx.fillStyle='rgba(0,0,0,0.35)';
      ctx.fillRect(sx+tw*0.15, sy+tw*0.72, tw*0.8, tw*0.18);
    }
    return;
  }
  if(throne && (t==='floor'||t==='path')){
    ctx.fillStyle='rgba(18,20,28,0.18)';
    ctx.fillRect(sx, sy, tw, tw);
    return;
  }
  if(dung && (t==='floor'||t==='path'||t==='carpet'||t==='plaza')){
    ctx.fillStyle='rgba(6,8,14,0.28)';
    ctx.fillRect(sx, sy, tw, tw);
    return;
  }
  if(dung && (t==='wall'||t==='cliff')){
    ctx.fillStyle='#17202a';
    ctx.fillRect(sx, sy, tw, tw);
    ctx.fillStyle='#3c4c5c';
    ctx.fillRect(sx, sy, tw, Math.max(3, tw*0.2));
    ctx.fillStyle='#10161e';
    ctx.fillRect(sx, sy+tw*0.55, tw, tw*0.45);
    return;
  }
  if(throne && (t==='wall'||t==='cliff')){
    ctx.fillStyle='rgba(8,10,16,0.55)';
    ctx.fillRect(sx, sy, tw, tw);
    ctx.fillStyle='rgba(170,178,190,0.35)';
    ctx.fillRect(sx, sy, tw, Math.max(2, tw*0.12));
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
  // v74: Nocturna hubs — Ninja Adventure biomes only (ART-BIBLE)
  if(g==='daemon' || pack==='tiles-nocturna' || true){
    const ort=String(S?.world?.scene?.ort||'').toLowerCase();
    const NA='./assets/pixel/tiles-na/cut';
    let area='throne';
    if(/pass|grenze|wachturm/.test(ort)) area='pass';
    else if(/solmir|gruft|krypta|ruine/.test(ort)) area='crypt';
    else if(/kathedrale|solari|kirche|licht/.test(ort)) area='cathedral';
    else if(/katakomb|eishöhlen|eishoehlen|reliquien|knochenlabyrinth|ätherspalte|aetherspalte|wachtürme|wachtuerme/.test(ort)) area='crypt';
    else if(/thron|festung/.test(ort)) area='throne';
    if(area==='pass'){
      Object.assign(set,{
        grass:`${NA}/biome_snow.png`, path:`${NA}/path.png`, sand:`${NA}/biome_snow.png`,
        stone:`${NA}/biome_mountain.png`, cliff:`${NA}/cliff_snow.png`, water:`${NA}/biome_ice.png`,
        floor:`${NA}/biome_snow.png`, wall:`${NA}/cliff_mountain.png`, tree:`${NA}/tree.png`,
        plaza:`${NA}/snow.png`, carpet:`${NA}/snow.png`, wood:`${NA}/path.png`, void:`${NA}/void.png`,
      });
    } else if(area==='crypt'){
      Object.assign(set,{
        grass:`${NA}/dfloor_mid.png`, path:`${NA}/dfloor_lit.png`, floor:`${NA}/dfloor_lit.png`,
        wall:`${NA}/wall_top0.png`, stone:`${NA}/dfloor_dark.png`, carpet:`${NA}/dfloor_mid.png`,
        plaza:`${NA}/dfloor_lit.png`, void:`${NA}/dvoid.png`, door:`${NA}/door.png`,
        wood:`${NA}/dfloor_dark.png`, sand:`${NA}/dfloor_mid.png`, tree:`${NA}/ruin_wall.png`,
      });
    } else if(area==='cathedral'){
      Object.assign(set,{
        grass:`${NA}/ifloor_tile.png`, path:`${NA}/ifloor_check.png`, floor:`${NA}/ifloor_tile.png`,
        wall:`${NA}/wall_top1.png`, stone:`${NA}/ifloor_slate.png`, carpet:`${NA}/ifloor_carpet.png`,
        plaza:`${NA}/ifloor_stone.png`, wood:`${NA}/ifloor_wood.png`, void:`${NA}/void.png`,
      });
    } else { // throne / default hub
      Object.assign(set,{
        grass:`${NA}/ifloor_stone.png`, path:`${NA}/ifloor_wood.png`, floor:`${NA}/ifloor_stone.png`,
        wall:`${NA}/wall_top2.png`, stone:`${NA}/ifloor_slate.png`, carpet:`${NA}/ifloor_carpet.png`,
        plaza:`${NA}/ifloor_stone.png`, wood:`${NA}/ifloor_wood.png`, void:`${NA}/void.png`,
        door:`${NA}/door.png`, tree:`${NA}/tree.png`,
      });
    }
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
  const low=name.toLowerCase();
  let kind='town';
  const blob=desc+low;
  if(/wald|wild|feld|straße|strasse|pfad/.test(blob)) kind='wild';
  if(/verlies|höhle|kerker|dungeon|keller|grab|katakomb|bunker|servergruft|ruine.*raum|gruft/.test(blob) || S?.content39?.dungeon) kind='dungeon';
  if(/\bcamp\b|\blager\b|zuhause|hütte|\bheim\b|grundstück/.test(blob) || S?.home?.location===name) kind='camp';
  if(/markt|stadt|dorf|platz|tempel|burg|palast|gasthaus|taverne|akademie|halle|solari|beschwörung|hafen|kirche|gilde|tor|garten/.test(blob)) kind='town';
  if(/ruine|trümmer|zerstört/.test(blob)) kind='ruins';
  if(/innen|zimmer|kammer|küche|schlaf|\(innen\)/.test(blob) || (/\bsaal\b/.test(blob)&&!/thron/.test(blob))) kind='interior';

  // Unique preset key for important orte — genre/terrain heuristics for unknown places
  let preset='default';
  // v60 Nocturna hub presets (before genre heuristics)
  if(/thron/.test(low) && !/katakomb/.test(low)) preset='throne';
  else if(/grenzpass|\bpass\b|wachturm/.test(low) && !/wachtürme|wachtuerme/.test(low)) preset='wall';
  else if(/solmir|gruft|krypta/.test(low) && !/katakomb/.test(low)) preset='graveyard';
  else if(/kathedrale|solari/.test(low) && !/raum|dungeon|gewölbe/.test(low)) preset='church';
  else if(/schatzkatakomben|katakomben/.test(low)) { preset='catacomb'; kind='dungeon'; }
  else if(/eishöhlen|eishoehlen/.test(low)) { preset='ice_cave'; kind='dungeon'; }
  else if(/reliquiengewölbe|reliquiengewoelbe/.test(low)) { preset='relic_vault'; kind='dungeon'; }
  else if(/knochenlabyrinth/.test(low)) { preset='bone_labyrinth'; kind='dungeon'; }
  else if(/wachtürme|wachtuerme|vorhut/.test(low)) { preset='watch_dungeon'; kind='dungeon'; }
  else if(/ätherspalte|aetherspalte|kathedrale solari|finaler/.test(low)) { preset='aether_rift'; kind='dungeon'; }
  else if(/dungeon|kerker|verlies|höhle/.test(low)) { preset='catacomb'; kind='dungeon'; }

  // Entered buildings always use interior layout
  if(/^in:/.test(low) || /\(innen\)/.test(low)) { preset='interior'; kind='interior'; }

  const genre=String(S?.genre||S?.role||S?.world?.genre||'').toLowerCase();
  if(preset==='default'){
    if(/beschw|beschwörungshalle/.test(low)) preset='summon';
    else if(/palast.*halle|halle.*palast|königspalast/.test(low) && !/garten/.test(low)) preset='summon';
    else if(/thron/.test(low)) preset='throne';
    else if(/markt|unterstadt|bazaar|souk/.test(low)) preset='market';
    else if(/taverne|gasthaus|silberfuchs|\binn\b|\bbar\b/.test(low)) preset='tavern';
    else if(/hafen|\bmyr\b|von myr|dock|kai|werft/.test(low)) preset='harbor';
    else if(/elfen|sylvar|hain|dryade/.test(low)) preset='elfwood';
    else if(/nordwall|wall|festung|bastion|bollwerk/.test(low)) preset='wall';
    else if(/garten|palastgarten|\bpark\b(?!platz)|stadtpark|palast.?park/.test(low)) preset='garden';
    else if(/kirche|tempel|solari|kathedrale|schrein|kapelle/.test(low)) preset='church';
    else if(/gilde|söldner|abenteurer/.test(low)) preset='guild';
    else if(/weidenau|dorf|bauern|weiler|kristall|hauptstadt|spitze|stadt(?!park)/.test(low)) preset='village';
    else if(/osttor|tor|gate|portal/.test(low)) preset='gate';
    else if(/königsburg|schloss|burg/.test(low) || (/\bhof\b/.test(low)) || (/palast/.test(low)&&!/garten/.test(low))) preset='courtyard';
    else if(/waldweg|pfad|straße|strasse|landstraße/.test(low)) preset='road';
    else if(/akademie|schule|bibliothek|archiv|universität/.test(low)) preset='academy';
    else if(/mine|stollen|bergwerk|zwerg/.test(low)) preset='mine';
    else if(/strand|küste|insel|meer|bucht/.test(low)) preset='beach';
    else if(/sumpf|moor|marsch|nebelfenn/.test(low)) preset='swamp';
    else if(/wüste|düne|oase|sand/.test(low)) preset='desert';
    else if(/schnee|gletscher|eis|frost|tundra|nord/.test(low)) preset='snow';
    else if(/friedhof|grab|nekropole|krypta|solmir|gruft/.test(low)) preset='graveyard';
    else if(/labor|werkstatt|fabrik|neon|station|cyber|netz/.test(low)) preset='neon';
    else if(/seuche|zombie|quarantäne|barrikade|parkplatz|eastmall|safehouse|supermarkt ruine|tankstelle/.test(low)) preset='wasteland';
  }

  // Genre fallback when still default (unknown ort name)
  if(preset==='default'){
    if(/cyber|neon|netz/.test(genre)) preset='neon';
    else if(/zombie|apokal|seuche/.test(genre)) preset='wasteland';
    else if(/daemon|dämon|hölle|infernal/.test(genre) && preset==='default') preset='ruins';
    else if(/villainess|adel|hof/.test(genre) && kind==='town') preset='courtyard';
    else if(/held|mensch|fantasy|highfantasy/.test(genre) && kind==='town') preset='village';
  }
  // Terrain keywords in description beat genre default
  if(/sumpf|moor/.test(blob) && preset==='default') preset='swamp';
  if(/wüste|düne/.test(blob) && preset==='default') preset='desert';
  if(/schnee|eisberg|gletscher/.test(blob) && preset==='default') preset='snow';
  if(/strand|küste/.test(blob) && preset==='default') preset='beach';
  // v47c/v71: dungeon runs keep authored variants (catacomb/ice/relic/bone/watch/aether); never throne
  if(S?.content39?.dungeon || kind==='dungeon' || S?.campaign?.mode==='dungeon'){
    const lowName=String(name||'').toLowerCase();
    // remap hub presets that leaked into dungeon Raum N before generic stomp
    if(preset==='throne'){ preset='catacomb'; kind='dungeon'; }
    else if(preset==='graveyard' || (/solmir|gruft|krypta/.test(lowName) && /raum/.test(lowName))){ preset='bone_labyrinth'; kind='dungeon'; }
    else if(preset==='church' && /raum|dungeon/.test(lowName)){ preset='aether_rift'; kind='dungeon'; }
    const authored=/catacomb|ice_cave|relic_vault|bone_labyrinth|watch_dungeon|aether_rift|dungeon/.test(String(preset||''));
    if(authored){ kind='dungeon'; }
    else if(!/summon|interior/.test(preset)) { preset='dungeon'; kind='dungeon'; }
  }
    // v36: owned home / camp kind always wins over genre neon/wasteland fallback
  if(kind==='camp' || (S?.home?.owned && S.home.location===name)){
    preset='camp'; kind='camp';
  }
  // Kind overrides only when no named preset matched (keep throne/summon/etc.)
  if(preset==='default'){
    if(kind==='interior') preset='interior';
    else if(kind==='dungeon') preset='dungeon';
    else if(kind==='camp') preset='camp';
    else if(kind==='ruins') preset='ruins';
    else if(kind==='wild') preset='wild';
  } else {
    // still honor explicit dungeon/camp/ruins kinds for wild-like named? keep preset
    if(kind==='dungeon' && !/summon|throne|interior|academy/.test(preset)) { /* keep */ }
  }

  // v47: taller towns so mobile FOV (viewH~30) stays inside map — no void band
  // v62: hand hubs need room for pillars/glass/towers
  const handHub=/(wall|graveyard|throne|church)/.test(String(preset||''));
  // v69: Grenzpass must exceed gameplay frustum (~40×22) so camera follows the player
  const w = preset==='wall'?52: /catacomb|ice_cave|relic_vault|bone_labyrinth|watch_dungeon|aether_rift|dungeon/.test(String(preset))?56: handHub?30: kind==='dungeon'?56: kind==='camp'?18: kind==='interior'?16:30;
  // v64: throne court is compact (not endless hallway canvas)
  const ht = preset==='wall'?42: /catacomb|ice_cave|relic_vault|bone_labyrinth|watch_dungeon|aether_rift|dungeon/.test(String(preset))?48: preset==='throne'?20: preset==='church'?26: preset==='graveyard'?24: handHub?28: kind==='dungeon'?48: kind==='camp'?16: kind==='interior'?14:34;
  const tiles=Array.from({length:ht},()=>Array(w).fill('grass'));
  const overlay=Array.from({length:ht},()=>Array(w).fill(null));
  const interiors=[];
  const overhead=[]; // big sprites
  const animators=[];
  const chests=[];
  let _pendingLights=[];
  const _hubNpcs=[]; // v62 hand-placed NPCs for hubs
  const fill=(x,y,tw,th,t)=>{ for(let j=0;j<th;j++) for(let i=0;i<tw;i++){ const xx=x+i,yy=y+j; if(yy>=0&&yy<ht&&xx>=0&&xx<w) tiles[yy][xx]=t; } };
  const ov=(x,y,id)=>{ if(y>=0&&y<ht&&x>=0&&x<w) overlay[y][x]=id; };
  const prop=(x,y,id)=>{ if(y>=0&&y<ht&&x>=0&&x<w){ overlay[y][x]=id; } };
  const anim=(x,y,kind)=>{ if(y>=0&&y<ht&&x>=0&&x<w) animators.push({x,y,kind}); };
  const ringFence=(x,y,tw,th)=>{
    for(let i=0;i<tw;i++){ if(y>=0&&y<ht&&x+i>=0&&x+i<w) tiles[y][x+i]='fence'; if(y+th-1>=0&&y+th-1<ht&&x+i>=0&&x+i<w) tiles[y+th-1][x+i]='fence'; }
    for(let j=0;j<th;j++){ if(y+j>=0&&y+j<ht&&x>=0&&x<w) tiles[y+j][x]='fence'; if(y+j>=0&&y+j<ht&&x+tw-1>=0&&x+tw-1<w) tiles[y+j][x+tw-1]='fence'; }
  };
  const _houseRects=[];
  const placeHouse=(bx,by,label,opts={})=>{
    // v46: one consistent footprint (3×3 or hall 4×3), roofed 96² sprites only
    const bw=opts.hall?4:(opts.w||3), bh=opts.h||3;
    if(bx<1||by<1||bx+bw>=w-1||by+bh>=ht-1) return null;
    // no overlap / clip with existing houses (1-tile gap)
    for(const r of _houseRects){
      if(bx < r.x+r.w+1 && bx+bw+1 > r.x && by < r.y+r.h+1 && by+bh+1 > r.y) return null;
    }
    _houseRects.push({x:bx,y:by,w:bw,h:bh});
    // v47b: pure grass under house — no brown/stone pad; sprite carries the building
    fill(bx,by,bw,bh,'grass');
    for(let j=0;j<bh;j++) for(let i=0;i<bw;i++) ov(bx+i,by+j,null);
    const variant=(opts.variant!=null)?opts.variant:(hash(label+bx+by)%8);
    const C46= (typeof window!=='undefined' && window.__game?.C46) || null;
    let src;
    if(opts.hall){
      const fallback=['./assets/pixel/decor/town_hall_0.png','./assets/pixel/decor/town_hall_1.png','./assets/pixel/decor/town_hall_2.png','./assets/pixel/decor/town_hall_3.png'];
      const pool=(C46?.TOWN_HALL_SRCS)||fallback;
      src=pool[variant%pool.length];
    } else {
      const fallback=Array.from({length:8},(_,i)=>`./assets/pixel/decor/town_house_${i}.png`);
      const pool=(C46?.TOWN_HOUSE_SRCS)||fallback;
      src=pool[variant%pool.length];
    }
    overhead.push({x:bx, y:by, src, tw:bw, th:bh});
    // chimney smoke
    anim(bx+bw-1, by, 'smoke');
    // window glow anchors (night lights)
    _pendingLights = _pendingLights || [];
    _pendingLights.push({x:bx+0.5, y:by+1, r:2.4, color:'rgba(255,200,90,0.55)'});
    _pendingLights.push({x:bx+bw-1.5, y:by+1, r:2.2, color:'rgba(255,190,80,0.5)'});
    const dx=bx+Math.floor(bw/2), dy=by+bh;
    if(dy<ht){ tiles[dy][dx]='door'; overlay[dy][dx]=null; }
    // short path stub from door to road only (not a full brown pad)
    if(dy+1<ht) tiles[Math.min(ht-1,dy+1)][dx]='path';
    // v47: one lamp near door — no barrel/crate spam
    if(dx+1<w) prop(dx+1, Math.min(ht-1,dy), 'lamp');
    const id='in:'+(label||('Haus'+(interiors.length+1)));
    interiors.push({x:dx,y:dy,to:id, label:label||'Haus', returnX:dx, returnY:dy});
    return {dx,dy,id};
  };
  const scatterGrass=()=>{
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++){
      if(tiles[y][x]==='grass'){
        const n=((h+x*17+y*31)%100);
        if(n<5){ ov(x,y,'flower'); }
        else if(n<8) ov(x,y,'bush');
        else if(n>96) prop(x,y,'bench');
        else if(n>94) prop(x,y,'lamp');
        // v47: no random barrel/crate/sign spam; d0-d2 removed (looked like noisy grey boards)
      }
    }
  };
  const scatterProps=(list)=>{
    list.forEach(([x,y,id])=>prop(x,y,id));
  };
  const placeChest=(x,y,loot)=>{
    if(y<0||x<0||y>=ht||x>=w) return;
    prop(x,y,'chest');
    chests.push({x,y,id:'chest_'+name+'_'+x+'_'+y, open:false, loot:loot||null});
  };
  const questMark=(x,y,label,kind='story')=>{
    if(y<0||x<0||y>=ht||x>=w) return;
    // local marks collected into _questMarks at map finalize via map.questMarks
    chests; // keep closure warm
    (questMark._buf = questMark._buf || []).push({x,y,label,kind});
  };
  questMark._dungSpawn=null;
  questMark._buf=null;

  // ---- Preset layouts ----
  const cx=Math.floor(w/2), cy=Math.floor(ht/2);
  if(preset==='interior'){
    fill(0,0,w,ht,'wall');
    fill(1,1,w-2,ht-2,'wood');
    fill(2,2,w-4,ht-4,'wood');
    fill(Math.floor(w/2)-2, Math.floor(ht/2)-1, 5, 3, 'plaza');
    prop(2,2,'barrel'); prop(w-3,2,'crate');
    prop(3,ht-3,'chest'); // v47c: less interior clutter
    prop(w-4,ht-3,'bench');
    anim(2,2,'torch'); anim(w-3,2,'torch');
    tiles[ht-2][Math.floor(w/2)]='door';
    // exit door handled later via _owReturn
  } else if(preset==='dungeon' || preset==='catacomb' || preset==='ice_cave' || preset==='relic_vault' || preset==='bone_labyrinth' || preset==='watch_dungeon' || preset==='aether_rift'){
    kind='dungeon';
    let variant=preset==='dungeon'?'catacomb':preset;
    const roomMatch=/raum\s*(\d+)/i.exec(name);
    const roomN = roomMatch ? (parseInt(roomMatch[1],10)||1) : (S?.campaign?.dungeon?.room|1);
    const rs = ((roomN*17 + h)%5);
    // solid dark rock — corridors carved out
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++) tiles[y][x]='wall';
    const carve=(x,y,ww,hh,mat='floor')=>{ fill(Math.max(1,x|0),Math.max(1,y|0),Math.max(1,ww|0),Math.max(1,hh|0),mat); };
    // 3-tile-wide corridors (2–4 requested)
    const hall=(x0,y0,x1,y1,width=3)=>{
      const half=Math.floor(width/2);
      let x=x0|0, y=y0|0;
      const steps=Math.abs(x1-x0)+Math.abs(y1-y0)+2;
      for(let s=0;s<steps;s++){
        for(let oy=-half;oy<=half;oy++) for(let ox=-half;ox<=half;ox++){
          const xx=x+ox, yy=y+oy;
          if(yy>0&&yy<ht-1&&xx>0&&xx<w-1) tiles[yy][xx]='floor';
        }
        if(x===x1 && y===y1) break;
        if(x!==x1) x+=x1>x?1:-1;
        else if(y!==y1) y+=y1>y?1:-1;
      }
    };
    const rnd=(n)=>((h*1103515245+n*12345)>>>0)%100;
    const crack=(x,y,n)=>{
      for(let i=0;i<n;i++){
        const tx=x+(rnd(i*3+x)%9)-4, ty=y+(rnd(i*5+y)%7)-3;
        if(tiles[ty]?.[tx]==='floor' && rnd(i+tx)%3===0) tiles[ty][tx]='stone';
      }
    };
    // v72: spawn in CENTER chamber so frustum sees corridors+rooms, not wall void
    const sx0=cx, sy0=cy;
    carve(sx0-4, sy0-3, 9, 7); // spawn chamber
    questMark._dungSpawn={x:sx0, y:sy0};

    if(variant==='catacomb'){
      // v72 dense: rooms fill the 40×22 frustum so rock never reads as a mono void
      const shift=rs%3; // per-Raum fingerprint
      const west=sx0-16+shift, east=sx0+7-shift, north=sy0-10, south=sy0+7;
      carve(sx0-5, sy0-4, 11, 9); // larger spawn hall
      carve(west, sy0-4, 9, 8);
      carve(east, sy0-4, 10, 8);
      carve(sx0-5, north, 11, 7);
      carve(sx0-6, south, 13, 6);
      carve(west-1, north+1, 6, 5);
      carve(east+3, north+1, 6, 5);
      carve(west-1, south, 6, 5);
      carve(east+3, south, 6, 5);
      hall(sx0, sy0, west+4, sy0, 3);
      hall(sx0, sy0, east+4, sy0, 3);
      hall(sx0, sy0, sx0, north+3, 3);
      hall(sx0, sy0, sx0, south+2, 3);
      hall(west+3, sy0-3, west+3, north+3, 3);
      hall(east+4, sy0-3, east+4, north+3, 3);
      hall(west+3, sy0+3, west+3, south+2, 3);
      hall(east+4, sy0+3, east+4, south+2, 3);
      if(roomN===1){ carve(sx0+3, sy0+1, 5, 4); fill(sx0-4, sy0-2, 5, 3, 'stone'); }
      else if(roomN===3){ fill(sx0-4, north+1, 9, 4, 'carpet'); prop(sx0, north+2, 'altar'); ov(sx0,north+2,'altar'); carve(sx0-8, sy0-1, 4, 4); }
      else if(roomN>=5){ carve(sx0-7, sy0-7, 15, 6); hall(sx0-10, sy0, sx0+10, sy0, 4); }
      for(const [px,py] of [[west+1,sy0-3],[west+1,sy0+2],[west+6,sy0-3],[west+6,sy0+2],[east+2,sy0-3],[east+7,sy0-3],[east+2,sy0+2],[east+7,sy0+2]]){
        if(tiles[py]?.[px]==='floor'){ prop(px,py,'coffin'); ov(px,py,'coffin'); }
      }
      crack(sx0, sy0, 36); crack(east+4, sy0, 16); crack(west+3, sy0, 16);
      for(const [px,py] of [[sx0-3,sy0],[sx0+3,sy0],[west+4,sy0],[east+4,sy0],[sx0,sy0-3],[sx0,sy0+3]]){
        if(tiles[py]?.[px]==='floor') tiles[py][px]='stone';
      }
      placeChest(east+5, sy0, {gold:28, item:'Schattenkristall'});
      placeChest(east+7, sy0+1, {gold:18, item:'Antidot'});
      placeChest(sx0, north+2, {gold:12, item:'Siegelbruchstück'});
      placeChest(west+2, sy0+1, {gold:10, item:'Schattenkristall'});
      if(roomN!==3){ prop(sx0, north+2, 'altar'); ov(sx0,north+2,'altar'); }
      questMark(sx0, north+2, 'Siegelsaal', 'puzzle');
      questMark(sx0, Math.max(2, north), 'Fiendtor', 'boss');
      questMark(east+5, sy0, 'Schatzkammer', 'side');
      for(const [tx,ty] of [[sx0-4,sy0-3],[sx0+4,sy0-3],[west+2,sy0-3],[east+2,sy0-3],[sx0,north+1],[sx0,south+1],[west+2,south+1],[east+2,south+1]]){
        anim(tx,ty,'torch');
      }
      _hubNpcs.push({name:'Imp-Schuldner', x:west+4, y:sy0, px:west+4, py:sy0, sheet:'daemon', e:'👿'});
      _hubNpcs.push({name:'Grabräuber Jex', x:east+4, y:sy0+1, px:east+4, py:sy0+1, sheet:'spy', e:'🗝️'});
    } else if(variant==='ice_cave'){
      carve(sx0-5, sy0-4, 11, 9);
      carve(sx0-14, sy0-4, 10, 8); carve(sx0+5, sy0-4, 10, 8);
      carve(sx0-5, sy0-12, 11, 7); carve(sx0-5, sy0+6, 11, 6);
      carve(sx0-16, sy0-11, 7, 6); carve(sx0+10, sy0-11, 7, 6);
      carve(sx0-16, sy0+5, 7, 5); carve(sx0+10, sy0+5, 7, 5);
      hall(sx0, sy0, sx0-9, sy0, 3); hall(sx0, sy0, sx0+9, sy0, 3);
      hall(sx0, sy0, sx0, sy0-9, 3); hall(sx0, sy0, sx0, sy0+7, 3);
      hall(sx0-9, sy0-3, sx0-13, sy0-8, 3); hall(sx0+9, sy0-3, sx0+13, sy0-8, 3);
      hall(sx0-9, sy0+3, sx0-13, sy0+6, 3); hall(sx0+9, sy0+3, sx0+13, sy0+6, 3);
      for(let y=sy0-10;y<sy0+8;y++) for(let x=sx0-10;x<sx0+12;x++){
        if(tiles[y]?.[x]==='floor' && rnd(x*7+y)%10===0) tiles[y][x]='water';
      }
      crack(sx0, sy0, 20);
      for(const [px,py] of [[sx0-8,sy0],[sx0+8,sy0],[sx0,sy0-9],[sx0-1,sy0-8]]){
        if(tiles[py]?.[px]==='floor'){ tiles[py][px]='stone'; prop(px,py,'rock'); }
      }
      placeChest(sx0-8, sy0-1, {gold:22, item:'Frosttrank'});
      placeChest(sx0+8, sy0-1, {gold:20, item:'Eiskristall'});
      questMark(sx0, sy0-9, 'Eiskern', 'story');
      anim(sx0-3,sy0-1,'torch'); anim(sx0+3,sy0-1,'torch'); anim(sx0,sy0-10,'torch'); anim(sx0,sy0+5,'torch');
    } else if(variant==='relic_vault'){
      carve(sx0-5, sy0-4, 11, 9);
      for(const dy of [-8,0,8]) carve(sx0-14, sy0+dy-2, 29, 5);
      for(const dx of [-12,-4,4,12]) hall(sx0+dx, sy0-10, sx0+dx, sy0+10, 3);
      carve(sx0-5, sy0-13, 11, 6);
      carve(sx0-14, sy0-12, 7, 5); carve(sx0+8, sy0-12, 7, 5);
      carve(sx0-14, sy0+8, 7, 5); carve(sx0+8, sy0+8, 7, 5);
      prop(sx0, sy0-10, 'altar'); ov(sx0,sy0-10,'altar');
      for(const [gx,gy,g] of [[sx0-8,sy0-8,'glass_blue'],[sx0+8,sy0-8,'glass_red'],[sx0-8,sy0+8,'glass_gold'],[sx0+8,sy0+8,'glass_green']]){
        if(tiles[gy]?.[gx]==='floor'){ ov(gx,gy,g); prop(gx,gy,g); }
      }
      placeChest(sx0-2, sy0-10, {gold:30, item:'Heiliges Siegel'});
      placeChest(sx0-8, sy0, {gold:16, item:'Weihwasser'});
      placeChest(sx0+8, sy0, {gold:18, item:'Reliquiensplitter'});
      questMark(sx0, sy0-10, 'Hochaltar', 'story');
      for(const [tx,ty] of [[sx0-3,sy0-10],[sx0+3,sy0-10],[sx0-11,sy0],[sx0+11,sy0],[sx0,sy0]]) anim(tx,ty,'torch');
    } else if(variant==='bone_labyrinth'){
      for(let y=sy0-12;y<=sy0+12;y+=4) for(let x=sx0-14;x<=sx0+14;x+=4){
        if(x<2||y<2||x>=w-2||y>=ht-2) continue;
        carve(x, y, 3, 3);
        if(rnd(x+y*3)%3!==0) hall(x+1, y+1, Math.min(w-4,x+5), y+1, 3);
        if(rnd(x*2+y)%3!==0) hall(x+1, y+1, x+1, Math.min(ht-4,y+5), 3);
      }
      carve(sx0-3, sy0-3, 7, 7);
      hall(sx0, sy0, sx0, sy0-12, 3);
      carve(sx0-3, sy0-14, 7, 4);
      for(let i=0;i<18;i++){
        const tx=sx0-12+(rnd(i*9)%24), ty=sy0-10+(rnd(i*11)%20);
        if(tiles[ty]?.[tx]==='floor' && rnd(i)%2===0){ prop(tx,ty,'coffin'); ov(tx,ty,'coffin'); }
      }
      crack(sx0, sy0, 28);
      placeChest(sx0, sy0-13, {gold:26, item:'Knochenamulett'});
      placeChest(sx0-8, sy0+4, {gold:14, item:'Antidot'});
      questMark(sx0, sy0-13, 'Knochenherz', 'boss');
      anim(sx0-2,sy0-12,'torch'); anim(sx0+2,sy0-12,'torch'); anim(sx0-2,sy0,'torch'); anim(sx0+2,sy0,'torch');
      _hubNpcs.push({name:'Hüter Orun', x:sx0+2, y:sy0-12, px:sx0+2, py:sy0-12, sheet:'guard', e:'🦴'});
    } else if(variant==='watch_dungeon'){
      carve(sx0-6, sy0-4, 13, 9);
      for(const dy of [-10,-5,5,10]) carve(sx0-6, sy0+dy, 13, 5);
      hall(sx0, sy0-10, sx0, sy0+10, 4);
      carve(sx0-16, sy0-4, 9, 9); carve(sx0+8, sy0-4, 9, 9);
      carve(sx0-16, sy0-12, 8, 5); carve(sx0+9, sy0-12, 8, 5);
      hall(sx0-6, sy0, sx0-12, sy0, 3); hall(sx0+6, sy0, sx0+12, sy0, 3);
      hall(sx0-12, sy0-4, sx0-12, sy0-10, 3); hall(sx0+12, sy0-4, sx0+12, sy0-10, 3);
      prop(sx0-12, sy0, 'barrel'); prop(sx0-11, sy0+2, 'crate'); prop(sx0+10, sy0, 'barrel'); prop(sx0+11, sy0+1, 'bench');
      placeChest(sx0, sy0-9, {gold:24, item:'Wachtrank'});
      placeChest(sx0-12, sy0+1, {gold:12, item:'Seil'});
      questMark(sx0, sy0-9, 'Kommandostube', 'story');
      for(const [tx,ty] of [[sx0-4,sy0-9],[sx0+4,sy0-9],[sx0-13,sy0-2],[sx0+12,sy0-2],[sx0,sy0]]) anim(tx,ty,'torch');
      _hubNpcs.push({name:'Rekrut Venn', x:sx0+3, y:sy0-1, px:sx0+3, py:sy0-1, sheet:'guard', e:'🛡️'});
    } else { // aether_rift
      carve(sx0-6, sy0-4, 13, 9);
      carve(sx0-10, sy0-5, 21, 11);
      carve(sx0-7, sy0-13, 15, 8);
      carve(sx0-6, sy0+6, 13, 6);
      hall(sx0, sy0, sx0, sy0-10, 3); hall(sx0, sy0, sx0, sy0+7, 3);
      carve(sx0-16, sy0-3, 7, 7); carve(sx0+10, sy0-3, 7, 7);
      hall(sx0-10, sy0, sx0-13, sy0, 3); hall(sx0+10, sy0, sx0+13, sy0, 3);
      carve(sx0-14, sy0-11, 6, 6); carve(sx0+9, sy0-11, 6, 6);
      hall(sx0-13, sy0-3, sx0-11, sy0-8, 3); hall(sx0+13, sy0-3, sx0+11, sy0-8, 3);
      carve(sx0-14, sy0+6, 6, 5); carve(sx0+9, sy0+6, 6, 5);
      fill(sx0-3, sy0-10, 7, 3, 'carpet');
      prop(sx0, sy0-10, 'altar'); ov(sx0,sy0-10,'altar');
      for(const x of [sx0-6,sx0-2,sx0+2,sx0+6]){ if(tiles[sy0]?.[x]==='floor'){ tiles[sy0][x]='stone'; anim(x,sy0-1,'torch'); } }
      placeChest(sx0-3, sy0-10, {gold:40, item:'Äthersplitter'});
      placeChest(sx0+3, sy0-10, {gold:40, item:'Nachtstahl'});
      questMark(sx0, sy0-10, 'Ätherspalt', 'boss');
      anim(sx0-4,sy0-10,'torch'); anim(sx0+4,sy0-10,'torch');
    }
    // exit door + stairs south of spawn chamber (still on-camera)
    const doorY=Math.min(ht-2, sy0+10);
    hall(sx0, sy0, sx0, doorY, 3);
    tiles[doorY][sx0]='door';
    if(doorY>2){ tiles[doorY-1][sx0]='stairs'; }
    prop(sx0+2, sy0+1, 'sign');
    anim(sx0-2, sy0, 'torch'); anim(sx0+2, sy0, 'torch');

  } else if(preset==='summon'){
    // Summoning hall — marble plaza, pillars, central circle
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++) tiles[y][x]='floor';
    fill(0,0,w,2,'wall'); fill(0,ht-2,w,2,'wall'); fill(0,0,2,ht,'wall'); fill(w-2,0,2,ht,'wall');
    fill(cx-5, cy-5, 11, 11, 'plaza');
    fill(cx-2, cy-2, 5, 5, 'carpet');
    tiles[cy][cx]='well'; anim(cx,cy,'fountain');
    for(const [px,py] of [[cx-6,cy-6],[cx+6,cy-6],[cx-6,cy+6],[cx+6,cy+6],[cx,cy-7],[cx,cy+7]]){
      if(px>1&&py>1&&px<w-2&&py<ht-2){ tiles[py][px]='stone'; anim(px,py-1,'torch'); }
    }
    placeHouse(cx-8, cy-4, 'Nebenraum',{variant:1});
    placeHouse(cx+4, cy-4, 'Archiv',{variant:2});
    prop(cx-3,cy,'statue'); prop(cx+3,cy,'statue');
    scatterProps([[4,cy,'lamp'],[w-5,cy,'lamp'],[cx,4,'sign']]);
  } else if(preset==='throne'){
    // v65: castle court — stone floor, carpet runners, pillars, side chambers (no outdoor grass/plaza)
    kind='interior';
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++) tiles[y][x]='wall';
    fill(2,2,w-4,ht-4,'floor');
    fill(0,0,w,2,'wall'); fill(0,ht-2,w,2,'wall'); fill(0,0,2,ht,'wall'); fill(w-2,0,2,ht,'wall');
    // raised dais
    fill(cx-5, 3, 11, 5, 'stone');
    fill(cx-3, 4, 7, 3, 'carpet');
    overhead.push({x:cx-1,y:3,src:DECOR.throne_chair,tw:2.2,th:2.8,label:'Thron'});
    prop(cx-4, 4, 'statue'); prop(cx+4, 4, 'statue');
    anim(cx-4, 5, 'torch'); anim(cx+4, 5, 'torch');
    _pendingLights.push({x:cx-3.5,y:5.5,r:3.4}); _pendingLights.push({x:cx+4.5,y:5.5,r:3.4});
    // carpet aisle segments
    fill(cx-1, 8, 3, 3, 'carpet');
    fill(cx-1, 12, 3, 3, 'carpet');
    fill(cx-2, 16, 5, 2, 'carpet');
    // pillar colonnade
    for(const y of [7,10,13,16]){
      tiles[y][cx-5]='stone'; tiles[y][cx+5]='stone';
      prop(cx-5, y, 'statue'); prop(cx+5, y, 'statue');
      anim(cx-5, y-1, 'torch'); anim(cx+5, y-1, 'torch');
      _pendingLights.push({x:cx-4.5,y:y-0.5,r:2.6}); _pendingLights.push({x:cx+5.5,y:y-0.5,r:2.6});
    }
    // WEST archive
    fill(2, 7, 5, 7, 'floor');
    fill(2, 7, 5, 1, 'wall'); fill(2, 13, 5, 1, 'wall'); fill(2, 7, 1, 7, 'wall');
    if(tiles[10]) tiles[10][6]='door';
    prop(3, 9, 'barrel'); prop(4, 11, 'crate'); prop(5, 9, 'bench');
    placeChest(3, 12, {gold:14, item:'Runenstein'});
    // EAST war room
    fill(w-7, 7, 5, 7, 'floor');
    fill(w-7, 7, 5, 1, 'wall'); fill(w-7, 13, 5, 1, 'wall'); fill(w-3, 7, 1, 7, 'wall');
    if(tiles[10]) tiles[10][w-7]='door';
    prop(w-5, 9, 'barrel'); prop(w-4, 11, 'bench'); prop(w-5, 10, 'crate');
    placeChest(w-5, 12, {gold:16, item:'Nachtstahl-Splitter'});
    // south vestibule (stone, not path/grass)
    fill(cx-4, ht-6, 9, 3, 'stone');
    prop(cx-3, 15, 'bench'); prop(cx+3, 15, 'bench');
    placeChest(cx+4, 6, {gold:20, item:'Heiltrank'});
    questMark(cx, 5, 'Thron', 'story');
    fill(cx-1, ht-2, 3, 2, 'floor');
    if(tiles[ht-2]) tiles[ht-2][cx]='door';
    _hubNpcs.push({name:'Sekretärin Velka', x:cx+2, y:6, px:cx+2, py:6, sheet:'mage', e:'📜'});
    _hubNpcs.push({name:'General Brok', x:cx-2, y:14, px:cx-2, py:14, sheet:'guard', e:'🪓'});
    _hubNpcs.push({name:'Heldin Aria', x:cx+5, y:12, px:cx+5, py:12, sheet:'princess', e:'⚔'});
    _hubNpcs.push({name:'Wächter Toren', x:cx+4, y:17, px:cx+4, py:17, sheet:'guard', e:'🛡️'});
    _hubNpcs.push({name:'Archivar Quinn', x:4, y:10, px:4, py:10, sheet:'mage', e:'📚'});
    _hubNpcs.push({name:'Page Sera', x:cx-3, y:16, px:cx-3, py:16, sheet:'villager', e:'📨'});
    // v66 side dungeon entrance
    fill(2, ht-5, 3, 3, 'floor'); tiles[ht-4][3]='door';
    questMark(cx, Math.max(4, ht-3), 'Schatzkatakomben', 'side');
    overhead.push({x:3,y:ht-5,src:DECOR.sign||DECOR.statue,tw:1,th:1,label:'Katakomben'});


  } else if(preset==='market'){
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++) tiles[y][x]='grass';
    fill(0, cy-1, w, 3, 'path');
    fill(cx-1, 0, 3, ht, 'path');
    fill(cx-4, cy-4, 9, 9, 'plaza');
    tiles[cy][cx]='well'; anim(cx,cy,'fountain');
    for(let i=0;i<6;i++){
      const sx=2+i*4; if(sx+2>=w) continue;
      fill(sx, cy-7, 2, 2, 'path');
      prop(sx, cy-5, 'cart'); anim(sx+1,cy-7,'smoke');
    }
    for(let i=0;i<5;i++){
      const sx=3+i*5; if(sx+2>=w) continue;
      fill(sx, cy+5, 2, 2, 'path');
    }
    placeHouse(2,2,'Gasthaus',{variant:0});
    placeHouse(w-6,2,'Laden',{variant:6});
    placeHouse(2,ht-7,'Werkstatt',{variant:4});
    placeHouse(w-6,ht-7,'Haus',{variant:5});
    placeChest(cx+3, cy, {gold:12, item:'Trank'});
    placeChest(2, cy+2, {gold:6, item:'Brot'});
    ringFence(w-10, 2, 7, 5); fill(w-9,3,5,3,'grass');
    for(let j=0;j<2;j++) for(let i=0;i<3;i++){ anim(w-8+i,3+j,'flower'); ov(w-8+i,3+j,'flower'); }
    scatterGrass();
  } else if(preset==='tavern'){
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++) tiles[y][x]='grass';
    fill(0, cy, w, 2, 'path');
    placeHouse(cx-4, cy-6, 'Herberge Silbermond', {hall:true, variant:0, w:4, h:3});
    placeHouse(2, ht-8, 'Stall', {variant:3});
    placeHouse(w-6, ht-8, 'Lager', {variant:4});
    fill(cx-3, cy-2, 7, 4, 'plaza');
    prop(cx-2, cy, 'barrel'); prop(cx+2, cy, 'barrel'); prop(cx, cy+1, 'bench');
    prop(cx-4, cy-1, 'sign'); anim(cx+3, cy-2, 'torch');
    ringFence(2,2,8,6); fill(3,3,6,4,'grass');
    for(let j=0;j<3;j++) for(let i=0;i<4;i++) anim(4+i,3+j,'flower');
    scatterGrass();
  } else if(preset==='harbor'){
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++) tiles[y][x]=(y>ht-8)?'water':'grass';
    fill(0, ht-10, w, 3, 'path');
    fill(0, ht-8, w, 1, 'stone');
    placeHouse(2, cy-6, 'Zollhaus', {variant:1});
    placeHouse(cx-2, cy-6, 'Taverne', {variant:0});
    placeHouse(w-7, cy-6, 'Lagerhaus', {hall:true, variant:1, w:4, h:3});
    for(let i=0;i<2;i++){ prop(6+i*8, ht-11, 'crate'); } // v47c: less crate spam
    prop(cx, ht-12, 'cart'); prop(2, ht-11, 'sign');
    placeChest(cx+4, ht-12, {gold:20, item:'Seil'});
    anim(3,3,'smoke'); anim(w-5,3,'smoke');
    scatterGrass();
  } else if(preset==='elfwood'){
    kind='wild';
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++){
      const n=((h+x*17+y*31)%100);
      tiles[y][x]=n<35?'tree':(n>94?'water':'grass');
    }
    let px=0, py=cy;
    while(px<w){ tiles[py][px]='path'; if(py+1<ht)tiles[py+1][px]='path'; py=Math.max(3,Math.min(ht-4,py+((px%5===0)?((h+px)%3)-1:0))); px++; }
    fill(cx-3, cy-3, 7, 7, 'grass');
    for(let j=0;j<5;j++) for(let i=0;i<5;i++) anim(cx-2+i, cy-2+j, 'flower');
    fill(3,3,5,4,'water'); anim(5,5,'fountain');
    placeHouse(w-8, cy-2, 'Elfenhütte', {variant:2});
    prop(cx, cy, 'statue');
    scatterGrass();
  } else if(preset==='wall'){
    // v62: natural mountain pass — irregular cliffs, frozen stream, tall towers, camp
    kind='wild';
    const rnd=(n)=>((h*1103515245+n*12345)>>>0)%100;
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++){
      tiles[y][x] = (x<2 || x>=w-2) ? 'stone' : 'sand';
    }
    for(let y=1;y<ht-1;y++){
      if(tiles[y]?.[cx]) tiles[y][cx]='path';
      if(tiles[y]?.[cx+1]) tiles[y][cx+1]='path';
    }
    // frozen stream — continuous meander with soft banks (not square pools)
    let sx=6, sy=2;
    while(sy<ht-2){
      const mid=Math.max(4, Math.min(11, Math.round(sx+Math.sin(sy*0.22)*1.1)));
      for(let k=0;k<=1;k++){
        const xx=mid+k;
        if(tiles[sy]?.[xx] && tiles[sy][xx]!=='stone') tiles[sy][xx]='water';
      }
      sx = mid;
      sy++;
    }
    // v63: curved cliff bands (noise ridge, not diagonal brick stairs)
    const ridge=(y0)=>{
      for(let x=3;x<w-3;x++){
        if(Math.abs(x-cx)<=4) continue;
        if(tiles[y0]?.[x] && tiles[y0][x]!=='water') tiles[y0][x]='stone';
      }
    };
    ridge(5); ridge(ht-6);
    // pass camp with fire (near spawn so towers+NPCs are on camera)
    const campX=cx-3, campY=Math.max(8, cy-1);
    fill(campX, campY, 7, 5, 'sand');
    // tall watchtowers flanking the camp (visible at spawn)
    const twY=Math.max(3, campY-2);
    overhead.push({x:campX-6,y:twY,src:DECOR.watchtower,tw:2.4,th:4,label:'Wachturm West'});
    overhead.push({x:campX+8,y:twY,src:DECOR.watchtower,tw:2.4,th:4,label:'Wachturm Ost'});
    prop(campX+3, campY+2, 'campfire');
    anim(campX+3, campY+2, 'torch');
    prop(campX+1, campY+2, 'barrel');
    prop(campX+2, campY+3, 'bench');
    prop(campX+4, campY+3, 'bench');
    overhead.push({x:campX+9, y:campY-2, src:DECOR.pine, tw:2, th:3, label:'pine'});
    overhead.push({x:campX-5, y:campY, src:DECOR.pine, tw:2, th:3, label:'pine'});
    // scrub grass/tree leftovers → snow (no green plateaus)
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++){
      if(tiles[y][x]==='grass' || tiles[y][x]==='tree') tiles[y][x]='sand';
    }

    placeChest(cx+2, cy-1, {gold:15, item:'Eisen-Schild'});
    placeChest(8, 11, {gold:10, item:'Antidot'});
    placeChest(w-9, cy+2, {gold:18, item:'Nyx-Bericht'});
    questMark(cx, 7, 'Grenzpass', 'story');
    // camp NPCs with context
        placeHouse(Math.max(8,cx-3), Math.min(ht-8, cy+8), 'Herberge', {variant:3});
    // Around the fire, on the path, so they stay in frame while someone is talking.
    // Spawn sits one tile north of the fire; leave that tile empty.
    const fireX=campX+3, fireY=campY+2;
    const taken=new Set([cx+','+cy]);
    const campSpot=(dx,dy)=>{
      const solid=new Set(['wall','water','tree','void','house','ruin','fence','well','stall']);
      const x0=fireX+dx, y0=fireY+dy;
      for(let r=0;r<4;r++){
        for(let oy=-r;oy<=r;oy++) for(let ox=-r;ox<=r;ox++){
          const xx=Math.max(2, Math.min(w-3, x0+ox));
          const yy=Math.max(2, Math.min(ht-3, y0+oy));
          const key=xx+','+yy;
          if(taken.has(key)) continue;
          const t=tiles[yy]?.[xx];
          if(t && !solid.has(t)){ taken.add(key); return {x:xx,y:yy}; }
        }
      }
      if(tiles[y0]) tiles[y0][x0]='path';
      taken.add(x0+','+y0);
      return {x:x0,y:y0};
    };
    // Off the east and north roads out of camp, so walking to a mark does not bump someone.
    const nyx=campSpot(3,1), toren=campSpot(-2,0), lira=campSpot(2,-2);
    const kael=campSpot(-2,-2), bram=campSpot(2,1), venn=campSpot(-2,1), aria=campSpot(0,1);
    _hubNpcs.push({name:'Wächter Toren', x:toren.x, y:toren.y, px:toren.x, py:toren.y, sheet:'guard', e:'🛡️', home:toren});
    _hubNpcs.push({name:'Kundschafterin Lira', x:lira.x, y:lira.y, px:lira.x, py:lira.y, sheet:'spy', e:'🕵️', home:lira});
    _hubNpcs.push({name:'Schmiedin Kael', x:kael.x, y:kael.y, px:kael.x, py:kael.y, sheet:'merchant', e:'🔨', home:kael});
    _hubNpcs.push({name:'Händler Bram', x:bram.x, y:bram.y, px:bram.x, py:bram.y, sheet:'merchant', e:'🧳', home:bram});
    _hubNpcs.push({name:'Spionin Nyx', x:nyx.x, y:nyx.y, px:nyx.x, py:nyx.y, sheet:'spy', e:'🗡️', home:nyx});
    _hubNpcs.push({name:'Rekrut Venn', x:venn.x, y:venn.y, px:venn.x, py:venn.y, sheet:'villager', e:'🛡️', home:venn});
    _hubNpcs.push({name:'Heldin Aria', x:aria.x, y:aria.y, px:aria.x, py:aria.y, sheet:'princess', e:'⚔', home:aria});
    questMark(Math.max(4,cx-6), Math.min(ht-4,cy+5), 'Eishöhlen am Pass', 'side');
    if(tiles[Math.min(ht-4,cy+5)]) tiles[Math.min(ht-4,cy+5)][Math.max(4,cx-6)]='door';
    try{ if(S){ S.flags=S.flags||{}; S.flags.weather='schnee'; } }catch(_){}
  } else if(preset==='garden'){
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++) tiles[y][x]='grass';
    ringFence(1,1,w-2,ht-2);
    fill(cx-1,1,3,ht-2,'path'); fill(1,cy-1,w-2,3,'path');
    fill(cx-3,cy-3,7,7,'plaza'); tiles[cy][cx]='well'; anim(cx,cy,'fountain');
    for(let j=0;j<4;j++) for(let i=0;i<4;i++){ anim(3+i,3+j,'flower'); ov(3+i,3+j,'flower'); }
    for(let j=0;j<4;j++) for(let i=0;i<4;i++){ anim(w-8+i,3+j,'flower'); ov(w-8+i,3+j,'flower'); }
    placeHouse(cx-2, 2, 'Pavillon', {variant:7});
    prop(cx-4,cy,'bench'); prop(cx+4,cy,'bench'); prop(cx,cy+3,'statue');
    scatterGrass();
  } else if(preset==='church'){
    // v66: true nave — pew rows, altar, wide stained glass + light shafts
    kind='interior';
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++) tiles[y][x]='wall';
    fill(2,2,w-4,ht-4,'stone'); // v66: stone nave (avoid wood vertical stripes)
    fill(0,0,w,2,'wall'); fill(0,ht-2,w,2,'wall'); fill(0,0,2,ht,'wall'); fill(w-2,0,2,ht,'wall');
    // continuous carpet aisle
    fill(cx-1, 5, 3, ht-8, 'carpet');
    // sanctuary dais + altar
    fill(cx-5, 2, 11, 4, 'stone');
    fill(cx-2, 3, 5, 2, 'carpet');
    overhead.push({x:cx-1,y:2,src:DECOR.altar,tw:2.4,th:1.8,label:'Altar'});
    prop(cx, 3, 'statue');
    anim(cx-4, 3, 'torch'); anim(cx+4, 3, 'torch');
    _pendingLights.push({x:cx-3.5,y:3.5,r:3.2}); _pendingLights.push({x:cx+4.5,y:3.5,r:3.2});
    // pews in rows (left/right of aisle)
    for(let row=0; row<6; row++){
      const y=7+row*2; if(y>=ht-4) break;
      prop(cx-4, y, 'bench'); prop(cx-6, y, 'bench');
      prop(cx+4, y, 'bench'); prop(cx+6, y, 'bench');
      if(tiles[y]){ tiles[y][cx-4]='wood'; tiles[y][cx-6]='wood'; tiles[y][cx+4]='wood'; tiles[y][cx+6]='wood'; }
    }
    // pillar colonnade
    for(const y of [8,12,16,20]){
      if(y>=ht-3) continue;
      tiles[y][cx-7]='stone'; tiles[y][cx+7]='stone';
      prop(cx-7, y, 'statue'); prop(cx+7, y, 'statue');
      anim(cx-7, y-1, 'torch'); anim(cx+7, y-1, 'torch');
    }
    // wide stained-glass windows (west + east) with shaft lights
    const glasses=['glass_blue','glass_red','glass_gold','glass_green'];
    for(let i=0;i<4;i++){
      const y=6+i*4; if(y>=ht-5) continue;
      // deeper window bays
      fill(2, y, 2, 3, 'floor'); fill(w-4, y, 2, 3, 'floor');
      ov(2, y+1, glasses[i%4]); ov(w-3, y+1, glasses[i%4]);
      overhead.push({x:2,y:y,src:DECOR[glasses[i%4]]||DECOR.glass_blue,tw:1.2,th:2.2,label:'Fenster'});
      overhead.push({x:w-3,y:y,src:DECOR[glasses[i%4]]||DECOR.glass_blue,tw:1.2,th:2.2,label:'Fenster'});
      _pendingLights.push({x:3.2,y:y+1.5,r:4.5,color:'glass',shaft:1,hue:glasses[i%4]});
      _pendingLights.push({x:w-3.2,y:y+1.5,r:4.5,color:'glass',shaft:1,hue:glasses[i%4]});
    }
    // side chapels
    fill(2, 4, 4, 3, 'floor'); fill(w-6, 4, 4, 3, 'floor');
    prop(3, 5, 'bench'); prop(w-5, 5, 'bench');
    placeChest(cx+3, 5, {gold:22, item:'Heiliges Siegel'});
    placeChest(3, 10, {gold:14, item:'Weihwasser'});
    questMark(cx, 4, 'Altar', 'story');
    fill(cx-1, ht-2, 3, 2, 'floor');
    if(tiles[ht-2]) tiles[ht-2][cx]='door';
    _hubNpcs.push({name:'Priesterin Solara', x:cx+2, y:4, px:cx+2, py:4, sheet:'mage', e:'✝️'});
    _hubNpcs.push({name:'Akolyth Ren', x:cx-3, y:14, px:cx-3, py:14, sheet:'villager', e:'🙏'});
    _hubNpcs.push({name:'Heldin Aria', x:cx+3, y:14, px:cx+3, py:14, sheet:'princess', e:'⚔️'});
    _hubNpcs.push({name:'Kantor Elias', x:cx-5, y:8, px:cx-5, py:8, sheet:'mage', e:'🎵'});
    _hubNpcs.push({name:'Schwester Nira', x:cx+5, y:10, px:cx+5, py:10, sheet:'villager', e:'🕯️'});
    fill(cx-1, ht-5, 3, 2, 'stone');
    tiles[ht-4][cx]='door';
    questMark(cx, ht-4, 'Reliquiengewölbe', 'side');


  } else if(preset==='guild'){
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++) tiles[y][x]='grass';
    fill(0,cy,w,2,'path');
    placeHouse(cx-4, cy-6, 'Söldnergilde', {hall:true, variant:1, w:4, h:3});
    fill(cx-3, cy-2, 7, 4, 'plaza');
    prop(cx-2,cy,'barrel'); prop(cx+2,cy,'crate'); prop(cx,cy+1,'sign');
    placeHouse(2,2,'Waffenladen',{variant:4});
    placeHouse(w-6,2,'Quartier',{variant:5});
    anim(cx-3,cy-3,'torch'); anim(cx+3,cy-3,'torch');
    scatterGrass();
  } else if(preset==='village'){
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++) tiles[y][x]='grass';
    fill(0,cy,w,2,'path'); fill(cx,0,2,ht,'path');
    // v45: tiny well plaza — buildings crowd the spawn like Chrono Trigger towns
    fill(cx-1,cy-1,3,3,'plaza'); prop(cx,cy,'statue');
    placeHouse(cx-5,cy-5,'Bauernhaus',{variant:0});
    placeHouse(cx+2,cy-5,'Mühle',{variant:1});
    placeHouse(cx-5,cy+2,'Scheune',{variant:2});
    placeHouse(cx+2,cy+2,'Herberge',{variant:3});
    placeHouse(cx-8,cy-1,'Schmiede',{variant:4});
    placeHouse(cx+5,cy-1,'Laden',{variant:5});
    placeHouse(2,2,'Hütte Nord',{variant:6});
    placeHouse(w-5,2,'Hütte Ost',{variant:7});
    // bottom row spaced — AABB gap already skips overlaps
    placeHouse(2,ht-6,'Stall',{variant:0});
    placeHouse(w-5,ht-6,'Nachbarhaus',{variant:1});
    placeChest(cx+1, cy-1, {gold:8, item:'Heilkraut'});
    placeChest(w-8, cy+2, {gold:15});
    ringFence(cx+4,cy+4,5,4); fill(cx+5,cy+5,3,2,'grass');
    for(let j=0;j<2;j++) for(let i=0;i<3;i++) ov(cx+5+i,cy+5+j,'flower');
    prop(cx-1,cy+1,'bench'); prop(cx+3,cy,'cart');
    prop(cx-3,cy-2,'lamp'); prop(cx+3,cy-2,'lamp');
    for(let i=2;i<w-2;i+=3){ if(tiles[1][i]==='grass') tiles[1][i]='tree'; }
    scatterGrass();
  } else if(preset==='gate'){
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++) tiles[y][x]='grass';
    fill(cx-2,0,5,ht,'path');
    fill(0,0,w,3,'stone');
    placeHouse(cx-6, 4, 'Torhaus West', {variant:1});
    placeHouse(cx+2, 4, 'Torhaus Ost', {variant:1});
    prop(cx, 3, 'sign'); anim(cx-3,2,'torch'); anim(cx+3,2,'torch');
    placeHouse(2, ht-7, 'Zoll', {variant:0});
    placeHouse(w-6, ht-7, 'Wache', {variant:0});
    scatterGrass();
  } else if(preset==='courtyard'){
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++) tiles[y][x]='grass';
    fill(0,0,w,2,'wall'); fill(0,0,2,ht,'wall'); fill(w-2,0,2,ht,'wall');
    fill(3,3,w-6,ht-6,'plaza');
    fill(cx-1,0,3,ht,'path');
    placeHouse(cx-4, 2, 'Palastflügel', {hall:true, variant:0, w:4, h:3});
    placeHouse(3, ht-7, 'Kaserne', {variant:1});
    placeHouse(w-7, ht-7, 'Stallungen', {variant:3});
    prop(cx, cy, 'statue'); prop(cx-4,cy,'lamp'); prop(cx+4,cy,'lamp');
    anim(4,4,'torch'); anim(w-5,4,'torch');
    scatterGrass();
  } else if(preset==='road' || preset==='wild'){
    kind='wild';
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++){
      const n=((h+x*17+y*31)%100);
      if(n<20) tiles[y][x]='tree';
      else if(n<26) tiles[y][x]='stone';
      else if(n>91) tiles[y][x]='water';
      else tiles[y][x]='grass';
    }
    let px=0, py=cy;
    while(px<w){ tiles[py][px]='path'; if(py+1<ht)tiles[py+1][px]='path'; py=Math.max(2,Math.min(ht-3,py+((px%4===0)?(((h+px)%3)-1):0))); px++; }
    fill(3,3,5,4,'water');
    fill(w-10, ht-8, 6, 5, 'grass');
    for(let j=0;j<3;j++) for(let i=0;i<4;i++){ ov(w-9+i, ht-7+j, 'flower'); anim(w-9+i, ht-7+j, 'flower'); }
    placeHouse(Math.floor(w/3), Math.floor(ht/3), 'verlassene Hütte', {variant:h%8});
    scatterGrass();
  } else if(preset==='camp'){
    kind='camp';
    const dmg=S?.camp?.damage||{};
    const burntN=dmg.burnt|0;
    const palBroken=!!dmg.palisadeBroken || (dmg.tasks||[]).includes('palisade_repair');
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++) tiles[y][x]=(burntN>0 && ((h+x*5+y*9)%7===0))?'burnt':'grass';
    for(let i=0;i<w;i++){ tiles[0][i]='tree'; tiles[ht-1][i]='tree'; }
    const pad=burntN>0?'camp_burnt':'camp';
    fill(5,4,8,6,pad);
    fill(4,3,10,1,'path'); fill(4,10,10,1,'path');
    fill(7,6,3,2,burntN>1?'burnt':'plaza');
    tiles[7][8]='well';
    // Palisade: intact fence vs broken
    if(palBroken){
      for(let i=0;i<12;i++){ const xx=3+i; if(xx<w){ tiles[3][xx]=(i%3===1)?'fence_broken':'fence_broken'; tiles[11][xx]=(i%4===2)?'fence_broken':'fence'; } }
      for(let j=0;j<9;j++){ const yy=3+j; if(yy<ht){ tiles[yy][3]=(j%3===0)?'fence_broken':'fence'; tiles[yy][14]=(j%2===1)?'fence_broken':'fence_broken'; } }
      tiles[3][8]='path';
      // ash & embers inside
      for(const [ax,ay] of [[6,5],[9,5],[7,8],[10,7],[5,9]]){ if(ay<ht&&ax<w){ tiles[ay][ax]='burnt'; ov(ax,ay,'ash'); } }
      anim(7,5,'smoke'); anim(10,6,'smoke');
      prop(6,7,'ember'); prop(9,8,'ember');
    } else {
      ringFence(3,3,12,9); tiles[3][8]='path';
      if(burntN>0){ ov(6,5,'ash'); ov(10,8,'ash'); anim(8,5,'smoke'); }
    }
    placeHouse(6, 4, 'Lagerhaus', {variant: burntN>0?3:0, w:3, h:3});
    if((S?.camp?.upgrades||[]).includes('garten') || (S?.camp?.garden|0)>0){
      fill(12,5,3,3,'grass'); ov(12,5,'flower'); ov(13,6,'flower'); anim(13,5,'flower');
    }
    prop(6,7,'crate'); prop(10,7,'barrel'); prop(9,8,'bench');
    if(burntN>0) anim(8,6,'smoke'); else anim(8,6,'smoke');
    scatterGrass();
  } else if(preset==='ruins'){
    kind='ruins';
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++) tiles[y][x]=((h+x*7+y*11)%100)<16?'ruin':'grass';
    fill(0, cy, w, 2, 'path');
    fill(6,5,8,6,'ruin');
    ringFence(w-10, ht-9, 7, 6);
    anim(8,6,'torch'); prop(10,8,'chest');
    scatterGrass();
  } else if(preset==='academy'){
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++) tiles[y][x]='floor';
    fill(0,0,w,2,'wall'); fill(0,ht-2,w,2,'wall'); fill(0,0,2,ht,'wall'); fill(w-2,0,2,ht,'wall');
    fill(cx-1,2,3,ht-4,'carpet'); fill(cx-4,cy-3,9,7,'plaza');
    placeHouse(cx-4, 2, 'Akademiehalle', {hall:true, variant:0, w:4, h:3});
    placeHouse(2, cy-2, 'Bibliothek', {variant:2});
    placeHouse(w-6, cy-2, 'Labor', {variant:5});
    placeHouse(2, ht-7, 'Wohnheim', {variant:4});
    placeHouse(w-6, ht-7, 'Hörsaal', {variant:1});
    prop(cx,cy,'statue'); anim(cx-3,cy,'torch'); anim(cx+3,cy,'torch');
    prop(cx-2,cy+2,'bench'); prop(cx+2,cy+2,'bench');
  } else if(preset==='mine'){
    kind='dungeon';
    fill(0,0,w,ht,'void'); fill(1,1,w-2,ht-2,'wall');
    fill(2,2,w-4,ht-4,'floor'); fill(cx-2,0,5,ht,'path');
    for(let i=0;i<6;i++){ const x=3+(i%3)*8, y=4+Math.floor(i/3)*8; fill(x,y,4,3,'stone'); prop(x+1,y+1,'crate'); }
    anim(4,3,'torch'); anim(w-5,3,'torch'); anim(4,ht-4,'torch'); anim(w-5,ht-4,'torch');
    placeChest(cx, cy, {gold:30, item:'Erz'}); prop(cx+2,cy,'barrel');
    placeHouse(w-8, cy-2, 'Förderhaus', {variant:3});
  } else if(preset==='beach'){
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++) tiles[y][x]=(y>ht-7)?'water':(y>ht-10)?'path':'grass';
    fill(0, ht-10, w, 2, 'path');
    placeHouse(2, 2, 'Strandhütte', {variant:0});
    placeHouse(cx-2, 2, 'Leuchtturm', {variant:1});
    placeHouse(w-6, 2, 'Bootshaus', {variant:3});
    for(let i=0;i<5;i++){ prop(3+i*5, ht-11, 'barrel'); }
    prop(cx, ht-12, 'crate'); anim(4,4,'smoke');
    scatterGrass();
  } else if(preset==='swamp'){
    kind='wild';
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++){
      const n=((h+x*13+y*29)%100);
      tiles[y][x]=n<40?'water':(n<55?'tree':'grass');
    }
    let px=0,py=cy; while(px<w){ tiles[py][px]='path'; if(py+1<ht)tiles[py+1][px]='path'; py=Math.max(2,Math.min(ht-3,py+((px%5===0)?((h+px)%3)-1:0))); px++; }
    placeHouse(cx-2, cy-3, 'Sumpfhütte', {variant:h%8});
    prop(cx+3,cy,'barrel'); anim(cx,cy-1,'smoke');
    scatterGrass();
  } else if(preset==='desert'){
    kind='wild';
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++){
      const n=((h+x*11+y*19)%100);
      tiles[y][x]=n<12?'stone':(n>93?'water':'path'); // sand-ish via path
    }
    fill(0,cy,w,2,'path'); fill(cx-1,0,3,ht,'path');
    placeHouse(cx-3, cy-5, 'Oasenwirt', {hall:true, variant:1, w:4, h:3});
    placeHouse(2, 2, 'Zeltlager', {variant:6});
    placeHouse(w-6, ht-7, 'Ruine', {variant:2});
    fill(cx-2, cy+2, 5, 4, 'water'); anim(cx,cy+3,'fountain');
    prop(cx-4,cy,'crate'); prop(cx+4,cy,'barrel');
    scatterGrass();
  } else if(preset==='snow'){
    kind='wild';
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++){
      const n=((h+x*7+y*23)%100);
      tiles[y][x]=n<18?'tree':(n<28?'stone':'grass');
    }
    fill(0,cy,w,2,'path'); fill(cx-1,0,3,ht,'path');
    placeHouse(cx-3, cy-5, 'Berghütte', {hall:true, variant:2, w:4, h:3});
    placeHouse(2, 2, 'Wachturm', {variant:1});
    placeHouse(w-6, ht-7, 'Lager', {variant:4});
    anim(cx,cy-3,'smoke'); prop(cx+3,cy,'barrel'); prop(cx-3,cy,'crate');
    for(let i=0;i<w;i+=3){ tiles[0][i]='tree'; tiles[ht-1][i]='tree'; }
    scatterGrass();
  } else if(preset==='graveyard'){
    // v65: crypt complex — linked chambers (not endless checker cross)
    kind='dungeon';
    fill(0,0,w,ht,'void');
    fill(1,1,w-2,ht-2,'wall');
    // central shrine chamber
    fill(cx-4, cy-3, 9, 7, 'floor');
    fill(cx-2, cy-1, 5, 3, 'carpet');
    overhead.push({x:cx-1,y:cy-2,src:DECOR.altar,tw:2,th:1.5,label:'Kapelle'});
    prop(cx, cy-1, 'statue');
    anim(cx-3, cy-1, 'torch'); anim(cx+3, cy-1, 'torch');
    _pendingLights.push({x:cx-2.5,y:cy-0.5,r:2.8}); _pendingLights.push({x:cx+3.5,y:cy-0.5,r:2.8});
    // four corner tombs connected by short halls
    const rooms=[[2,2,8,6],[w-10,2,8,6],[2,ht-9,8,6],[w-10,ht-9,8,6]];
    for(const [rx,ry,rw,rh] of rooms){
      fill(rx, ry, rw, rh, 'floor');
      const midy=ry+Math.floor(rh/2), midx=rx+Math.floor(rw/2);
      // short connector toward center (2–3 tiles, not full cross)
      if(rx<cx) fill(rx+rw-1, midy, Math.max(2, cx-(rx+rw)+2), 2, 'floor');
      else fill(cx+3, midy, Math.max(2, rx-(cx+3)), 2, 'floor');
      if(ry<cy) fill(midx, ry+rh-1, 2, Math.max(2, cy-(ry+rh)+2), 'floor');
      else fill(midx, cy+2, 2, Math.max(2, ry-(cy+2)), 'floor');
      for(let i=0;i<2;i++){
        const cxr=rx+2+i*3, cyr=ry+2;
        prop(cxr, cyr, 'coffin');
        anim(cxr, cyr-1, 'torch');
        _pendingLights.push({x:cxr+0.5,y:cyr-0.5,r:2});
      }
      anim(rx+1, ry+1, 'torch');
    }
    // north antechamber
    fill(cx-3, 2, 7, 4, 'floor');
    prop(cx-2, 3, 'statue'); prop(cx+2, 3, 'statue');
    placeChest(cx+2, 4, {gold:20, item:'Phylakterium-Splitter'});
    placeChest(4, cy, {gold:12, item:'Manaessenz'});
    placeChest(w-6, ht-6, {gold:16, item:'Knochen-Schlüssel'});
    questMark(cx, cy-2, 'Erster Held', 'secret');
    fill(cx-1, ht-3, 3, 2, 'floor');
    if(tiles[ht-2]) tiles[ht-2][cx]='door';
    _hubNpcs.push({name:'Grabräuber Jex', x:cx-2, y:cy+2, px:cx-2, py:cy+2, sheet:'spy', e:'💀'});
    _hubNpcs.push({name:'Chronistin Mara', x:4, y:4, px:4, py:4, sheet:'mage', e:'📖'});
    _hubNpcs.push({name:'Hüter Orun', x:w-6, y:cy, px:w-6, py:cy, sheet:'guard', e:'🦴'});
    tiles[Math.min(ht-3,cy+6)][cx]='door';
    questMark(cx, Math.min(ht-3,cy+6), 'Knochenlabyrinth', 'side');


  } else if(preset==='neon'){
    // cyberpunk / neon city — denser urban, Kenney-ish feel via plazas + halls
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++) tiles[y][x]='floor';
    fill(0, cy-1, w, 3, 'path'); fill(cx-1, 0, 3, ht, 'path');
    fill(cx-4, cy-4, 9, 9, 'plaza');
    placeHouse(2, 2, 'Neon-Bar', {hall:true, variant:0, w:4, h:3});
    placeHouse(w-7, 2, 'Daten-Turm', {hall:true, variant:1, w:4, h:3});
    placeHouse(2, ht-7, 'Klinik', {variant:5});
    placeHouse(w-6, ht-7, 'Markt-Kiosk', {variant:6});
    placeHouse(cx-8, cy-2, 'Terminal', {variant:4});
    placeHouse(cx+4, cy-2, 'Wohnblock', {variant:7});
    for(let i=0;i<2;i++){ fill(5+i*10, cy-7, 2, 2, 'path'); } // v48 calmer neon
    anim(cx,cy,'fountain'); prop(cx-3,cy,'lamp'); prop(cx+3,cy,'lamp');
    anim(4,3,'torch'); anim(w-5,3,'torch');
    scatterGrass();
  } else if(preset==='wasteland'){
    kind='ruins';
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++){
      const n=((h+x*9+y*17)%100);
      tiles[y][x]=n<12?'ruin':(n<20?'stone':'grass'); // v48 calmer wastes
    }
    fill(0,cy,w,2,'path');
    placeHouse(cx-3, cy-5, 'Barrikade', {hall:true, variant:2, w:4, h:3});
    placeHouse(2, 2, 'Bunker', {variant:1});
    placeHouse(w-6, ht-7, 'Wrack', {variant:3});
    ringFence(cx+2, cy+2, 7, 5);
    prop(cx,cy,'barrel'); prop(cx+2,cy,'crate'); prop(cx-2,cy,'chest');
    anim(cx-1,cy-3,'smoke'); anim(w-5,3,'smoke');
    scatterGrass();
  } else {
    // v36 regional floorplans — distinct layouts by genre + ort hash
    const region=(()=>{
      if(/cyber|neon/.test(genre)) return 'cyber';
      if(/zombie|apokal|seuche/.test(genre)) return 'wastes';
      if(/dark|daemon|dämon/.test(genre)) return 'dark';
      if(/desert|wüste/.test(genre)) return 'desert';
      if(/high|fantasy|held|mensch/.test(genre)) return 'fantasy';
      const rh=h%5; return ['fantasy','harborish','marketish','gardenish','walled'][rh];
    })();
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++) tiles[y][x]=region==='desert'?'sand':(region==='wastes'?'stone':'grass');
    if(region==='cyber'){
      // grid plaza + towers
      for(let y=0;y<ht;y++) for(let x=0;x<w;x++) tiles[y][x]=(x%5===0||y%4===0)?'path':'floor';
      fill(cx-4, cy-4, 9, 9, 'plaza');
      placeHouse(2, 2, 'Neon-Bar', {hall:true, variant:0, w:4, h:3});
      placeHouse(w-7, 2, 'Daten-Turm', {hall:true, variant:1, w:4, h:3});
      placeHouse(2, ht-7, 'Wohnblock', {variant:7});
      placeHouse(w-6, ht-7, 'Klinik', {variant:4});
      placeHouse(cx-3, cy-6, 'Terminal', {variant:5});
      for(let i=0;i<2;i++){ prop(4+i*8, cy+3, 'lamp'); }
      prop(cx-2,cy,'lamp'); prop(cx+2,cy,'lamp');
    } else if(region==='wastes'){
      for(let y=0;y<ht;y++) for(let x=0;x<w;x++){ const n=((h+x*9+y*17)%100); tiles[y][x]=n<10?'ruin':(n<18?'stone':'grass'); } // v48 calmer
      fill(0,cy,w,2,'path');
      placeHouse(cx-3, cy-5, 'Barrikade', {hall:true, variant:2, w:4, h:3});
      placeHouse(2, 2, 'Bunker', {variant:1});
      placeHouse(w-6, ht-7, 'Wrack', {variant:3});
      placeHouse(cx+4, cy+2, 'Zeltlager', {variant:5});
      ringFence(cx-5, cy-1, 11, 7); tiles[cy-1][cx]='path';
      anim(cx-1,cy-3,'smoke'); prop(cx,cy,'barrel'); prop(cx+2,cy,'crate');
    } else if(region==='dark'){
      for(let y=0;y<ht;y++) for(let x=0;x<w;x++) tiles[y][x]=((x+y+h)%9===0)?'stone':'grass';
      fill(cx-1,0,3,ht,'path'); fill(0,cy,w,2,'path');
      fill(cx-4,cy-4,9,9,'plaza');
      placeHouse(cx-4, cy-7, 'Kapelle', {hall:true, variant:3, w:4, h:3});
      placeHouse(2, 2, 'Krypta', {variant:2});
      placeHouse(w-6, 2, 'Turm', {variant:1});
      placeHouse(2, ht-7, 'Söldnerhaus', {variant:4});
      placeHouse(w-6, ht-7, 'Markt der Schatten', {variant:6});
      anim(cx,cy,'torch'); anim(cx-3,cy-2,'torch'); prop(cx+3,cy,'statue');
    } else if(region==='desert'){
      fill(0, cy, w, 2, 'path'); fill(cx-1, 2, 3, ht-4, 'path');
      fill(cx-3, cy-3, 7, 7, 'plaza');
      placeHouse(cx-3, cy-5, 'Oasenwirt', {hall:true, variant:1, w:4, h:3});
      placeHouse(2, 2, 'Zelt', {variant:0});
      placeHouse(w-6, 2, 'Brunnenhaus', {variant:3});
      placeHouse(2, ht-7, 'Karawanserei', {variant:5});
      fill(w-9, 4, 5, 4, 'water');
      anim(cx,cy,'fountain');
    } else if(region==='walled'){
      fill(0,0,w,2,'wall'); fill(0,ht-2,w,2,'wall'); fill(0,0,2,ht,'wall'); fill(w-2,0,2,ht,'wall');
      fill(0, cy-1, w, 3, 'path'); fill(cx-1, 0, 3, ht, 'path');
      fill(cx-3, cy-3, 7, 7, 'plaza'); tiles[cy][cx]='well';
      placeHouse(3, 3, 'Kaserne', {hall:true, variant:2, w:4, h:3});
      placeHouse(w-8, 3, 'Turm', {variant:1});
      placeHouse(3, ht-8, 'Magazin', {variant:4});
      placeHouse(w-8, ht-8, 'Wache', {variant:0});
      placeHouse(cx-2, cy-6, 'Hauptquartier', {variant:6});
    } else if(region==='harborish'){
      fill(0, ht-5, w, 5, 'water');
      fill(0, cy-1, w, 3, 'path'); fill(cx-1, 0, 3, cy+2, 'path');
      placeHouse(2, 2, 'Zollhaus', {variant:1});
      placeHouse(cx-3, 2, 'Taverne', {variant:0});
      placeHouse(w-7, 2, 'Lagerhaus', {hall:true, variant:1, w:4, h:3});
      placeHouse(2, cy-4, 'Kai-Laden', {variant:6});
      for(let i=0;i<Math.min(w,12);i+=5) prop(i, ht-6, 'barrel'); // v47c: fewer dock barrels
      anim(cx, cy, 'fountain');
    } else if(region==='gardenish'){
      for(let y=0;y<ht;y++) for(let x=0;x<w;x++) tiles[y][x]='grass';
      fill(cx-1,0,3,ht,'path'); fill(0,cy,w,2,'path');
      ringFence(2,2,w-4,ht-4); tiles[2][cx]='path';
      for(let j=0;j<4;j++) for(let i=0;i<6;i++){ ov(4+i,4+j,'flower'); anim(4+i,4+j,'flower'); }
      placeHouse(cx-3, cy-5, 'Pavillon', {variant:7});
      placeHouse(2, ht-8, 'Gärtnerhaus', {variant:2});
      placeHouse(w-6, ht-8, 'Orangerie', {variant:5});
      anim(cx,cy,'fountain');
    } else if(region==='marketish'){
      fill(0, cy-1, w, 3, 'path'); fill(cx-1, 0, 3, ht, 'path');
      fill(cx-4, cy-4, 9, 9, 'plaza'); tiles[cy][cx]='well'; anim(cx,cy,'fountain');
      for(let i=0;i<6;i++){ const sx=2+i*4; if(sx+2<w){ fill(sx, cy-6, 2, 2, 'path'); } }
      for(let i=0;i<5;i++){ const sx=3+i*5; if(sx+2<w){ fill(sx, cy+4, 2, 2, 'path'); } }
      placeHouse(2, 2, 'Kaufhaus', {variant:6});
      placeHouse(w-6, 2, 'Zoll', {variant:1});
      placeHouse(2, ht-7, 'Wirtshaus', {variant:0});
      placeHouse(w-6, ht-7, 'Lager', {variant:4});
    } else {
      // v46 classic town — same scale houses, no stall-cottages, no water blobs
      fill(0, cy-1, w, 3, 'path');
      fill(cx-1, 0, 3, ht, 'path');
      fill(cx-1, cy-1, 3, 3, 'plaza');
      // center landmark: statue on plaza (not blue well)
      prop(cx, cy, 'statue');
      placeHouse(cx-5, cy-5, 'Wohnhaus N', {variant:0});
      placeHouse(cx+2, cy-5, 'Laden N', {variant:1});
      placeHouse(cx-5, cy+2, 'Wohnhaus S', {variant:2});
      placeHouse(cx+2, cy+2, 'Werkstatt', {variant:3});
      // market props instead of 2×2 stall "tiny houses"
      for(let i=0;i<4;i++){
        const sx=cx-5+i*3; if(sx<2||sx>=w-2) continue;
        prop(sx, cy-3, i%2?'cart':'barrel');
        prop(sx+1, cy-3, 'crate');
        tiles[cy-3][sx]='path';
      }
      ringFence(2, cy+4, 7, 6);
      fill(3, cy+5, 5, 4, 'grass');
      for(let j=0;j<3;j++) for(let i=0;i<3;i++){ ov(4+i, cy+6+j, 'flower'); }
      tiles[cy+4][5]='path';
      placeHouse(2, 2, 'Gasthaus', {variant:4});
      placeHouse(w-5, 2, 'Tempel', {variant:1, hall:true});
      placeHouse(2, ht-6, 'Wohnhaus', {variant:5});
      placeHouse(w-5, ht-6, 'Laden', {variant:6});
      placeHouse(cx-8, cy-2, 'Bibliothek', {variant:7});
      placeHouse(cx+5, cy-2, 'Wachstube', {variant:0});
      for(let i=0;i<w;i++){ if(i%3===0){ tiles[0][i]='tree'; tiles[ht-1][i]='tree'; } }
    }
    scatterGrass();
  }

  // v36: if this is the player's home and damaged, overlay burn even on non-camp presets
  if(S?.home?.owned && S.home.location===name && (S.camp?.damage?.burnt|0)>0){
    const dmg=S.camp.damage;
    const cx0=Math.floor(w/2), cy0=Math.floor(ht/2);
    for(let j=-2;j<=2;j++) for(let i=-3;i<=3;i++){
      const xx=cx0+i, yy=cy0+j;
      if(yy>0&&yy<ht-1&&xx>0&&xx<w-1 && (tiles[yy][xx]==='grass'||tiles[yy][xx]==='plaza'||tiles[yy][xx]==='path'||tiles[yy][xx]==='camp')){
        if(((i*3+j*5)&3)===0) tiles[yy][xx]='burnt';
      }
    }
    if(dmg.palisadeBroken){
      for(let i=cx0-4;i<=cx0+4;i++){ if(i>0&&i<w){ if(tiles[cy0-3]?.[i]==='fence') tiles[cy0-3][i]='fence_broken'; } }
      ov(cx0-1,cy0,'ash'); ov(cx0+2,cy0+1,'ash'); anim(cx0,cy0-1,'smoke');
    }
  }
  let sx=Math.floor(w/2), sy=Math.floor(ht/2);
  // v72: authored dungeon spawn (center chamber) wins over edge vestibule
  if(typeof questMark._dungSpawn==='object' && questMark._dungSpawn){
    sx=Math.max(1,Math.min(w-2, questMark._dungSpawn.x|0));
    sy=Math.max(1,Math.min(ht-2, questMark._dungSpawn.y|0));
  }
  // Prefer spawn near return door if exiting interior
  if(S?._owSpawn && typeof S._owSpawn.x==='number' && kind!=='dungeon'){
    sx=Math.max(1,Math.min(w-2,S._owSpawn.x|0));
    sy=Math.max(1,Math.min(ht-2,S._owSpawn.y|0));
  }
  for(let t=0;t<80;t++){
    const x=(sx+t)%w, y=(sy+Math.floor(t/3))%ht;
    if(!SOLID.has(tiles[y][x]) && tiles[y][x]!=='door'){ sx=x; sy=y; break; }
  }

  const present=S?.world?.scene?.anwesend||[];
  const npcs=[]; const used=new Set([sx+','+sy]);
  // v62: merge hand-authored hub NPCs first (camp guards etc.)
  for(const hn of _hubNpcs){
    const xx=Math.max(1,Math.min(w-2, Math.round(hn.x)));
    const yy=Math.max(1,Math.min(ht-2, Math.round(hn.y)));
    const key=xx+','+yy;
    if(SOLID.has(tiles[yy]?.[xx]) || used.has(key)) continue;
    used.add(key);
    npcs.push({
      name:hn.name, x:xx, y:yy, px:xx, py:yy,
      sheet:hn.sheet||'villager', dir:0, frame:0, e:hn.e||'👤',
      home:hn.home||{x:xx,y:yy}, waypoints:[hn.home||{x:xx,y:yy}], wp:0,
      pace:hn.pace||'idle', wait:0, calendar:null, schedule:[], roleHint:hn.sheet||'villager'
    });
  }
  const hubNames=new Set(_hubNpcs.map(h=>h.name));
  // v64: on hand hubs, skip pack crowd fluff + already hand-placed names
  const presentFiltered = present.filter(nm=>{
    const s=String(nm||'');
    if(hubNames.has(s)) return false;
    if(handHub && /hunderte|kniende|menge|crowd|volk|meute/i.test(s)) return false;
    if(handHub && /Sekretärin Velka|General Brok|Spionin Nyx|Heldin Aria/i.test(s)) return false;
    return true;
  });
  // v66/v72: hand hubs + dungeons = authored cast only (no Passant/Edelfrau generics)
  const skipCrowd = handHub || kind==='dungeon';
  presentFiltered.slice(0, skipCrowd?0:8).forEach((nm,i)=>{
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
    const home={x:nx,y:ny};
    // Landmark anchors for daily calendar (home / work / tavern / sleep)
    const doors=(interiors||[]).filter(d=>d && typeof d.x==='number');
    const tavernDoor=doors.find(d=>/taverne|gasthaus|wirt|inn|pub/i.test(String(d.label||d.to||'')))||doors[0]||{x:cx,y:cy+3};
    const workDoor=doors.find(d=>/laden|shop|markt|bibliothek|wache|hall|schmied/i.test(String(d.label||d.to||'')))
      || (sheet==='merchant'?home:doors[(i+1)%Math.max(1,doors.length)]||{x:cx+2,y:cy});
    const sleepSpot={x:home.x, y:Math.max(1,home.y-1)};
    const plaza={x:cx,y:cy};
    const calendar={
      home,
      work:{x:workDoor.x, y:Math.max(1,(workDoor.y|0)-1)},
      tavern:{x:tavernDoor.x, y:Math.max(1,(tavernDoor.y|0)-1)},
      sleep:sleepSpot,
      plaza
    };
    const wps=[home, calendar.work, calendar.tavern, plaza, sleepSpot];
    let pace='wander';
    if(sheet==='guard') pace='patrol';
    else if(sheet==='merchant') pace='shop';
    else if(sheet==='mage') pace='study';
    // Seed calendar from pack schedule text if present
    const sch=n.schedule||[];
    npcs.push({name:nm, x:nx, y:ny, px:nx, py:ny, sheet, dir:0, frame:0, e:n.e||'👤', home, waypoints:wps, wp:i%wps.length, pace, wait:0, calendar, schedule:sch, roleHint:sheet});
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
  // Interior exit → return to parent map
  if(kind==='interior' && S?._owReturn){
    const ex=Math.floor(w/2), ey=ht-2;
    tiles[ey][ex]='door';
    exits.push({x:ex,y:ey,to:S._owReturn, exitInterior:true, label:'Hinaus'});
  } else {
    const uniq=[...new Set(edgeList)].filter(d=>d&&d!==name).slice(0,4);
    const slots=[[Math.floor(w/2),1],[Math.floor(w/2),ht-2],[1,Math.floor(ht/2)],[w-2,Math.floor(ht/2)]];
    uniq.forEach((dest,i)=>{
      const [ex,ey]=slots[i%slots.length];
      tiles[ey][ex]='door';
      overlay[ey][ex]=null;
      exits.push({x:ex,y:ey,to:dest});
    });
  }
  interiors.forEach(iv=>{
    exits.push({x:iv.x,y:iv.y,to:iv.to, interior:true, label:iv.label, returnX:iv.returnX, returnY:iv.returnY});
  });

  // lamps/torches → lights
  const lights=[...(_pendingLights||[])];
  for(const a of animators){
    if(a.kind==='torch') lights.push({x:a.x+0.5,y:a.y+0.5,r:2.0,color:'rgba(255,170,60,0.28)'});
  }
  for(let y=0;y<ht;y++) for(let x=0;x<w;x++){
    if(overlay[y][x]==='lamp') lights.push({x:x+0.5,y:y+0.5,r:2.2,color:'rgba(255,210,120,0.32)'});
  }
  // quest marks filled later in showOverworld
  // v61: never densify hand-authored Nocturna hubs (wall/graveyard/throne/church)
  try{
    const hand=/(wall|graveyard|throne|church)/.test(String(preset||''));
    if(!hand){
      const G=window.__game;
      if(G?.C49?.densifyTownMapV49) G.C49.densifyTownMapV49({w,h:ht,tiles,overlay,kind,overhead,genre});
      else if(G?.C48?.densifyTownMapV48) G.C48.densifyTownMapV48({w,h:ht,tiles,overlay,kind,overhead,genre});
      else if(G?.C47?.densifyTownMapV47) G.C47.densifyTownMapV47({w,h:ht,tiles,overlay,kind,overhead,genre});
      else if(G?.C46?.densifyTownMapV46) G.C46.densifyTownMapV46({w,h:ht,tiles,overlay,kind});
      else if(G?.C45?.densifyTownMap) G.C45.densifyTownMap({w,h:ht,tiles,kind});
    }
  }catch(_){}
  const qmarks=(questMark._buf||[]).slice(); questMark._buf=[];
  // v66: side-dungeon doors from quest marks
  const SIDE_TO={
    'Schatzkatakomben':'Schatzkatakomben',
    'Eishöhlen':'Eishöhlen am Pass',
    'Eishöhlen am Pass':'Eishöhlen am Pass',
    'Reliquiengewölbe':'Reliquiengewölbe',
    'Knochenlabyrinth':'Knochenlabyrinth',
  };
  for(const qm of qmarks){
    const lab=String(qm.label||'');
    const to=SIDE_TO[lab] || (/katakomben|eishöhlen|reliquien|knochen|ätherspalte/i.test(lab)?lab:null);
    if(!to && qm.kind!=='side') continue;
    const dest=to||lab;
    if(!dest) continue;
    exits.push({x:qm.x,y:qm.y,to:dest, sideDungeon:true, label:lab||dest});
    if(tiles[qm.y]){ tiles[qm.y][qm.x]='door'; if(overlay[qm.y]) overlay[qm.y][qm.x]=null; }
  }
  return {w,h:ht,tiles,overlay,doors:exits,spawn:{x:sx,y:sy},kind,name,npcs,interiors,overhead,animators,preset,chests,lights,questMarks:qmarks};
}

function walkable(x,y){
  if(y<0||x<0||y>=_map.h||x>=_map.w) return false;
  return !SOLID.has(_map.tiles[y][x]);
}

function fogKey(x,y){ return x+','+y; }
function recomputeFog(){
  _visible=new Set();
  // v45d: FoW radius must cover the tile frustum or mobile shows a tiny circle in black void
  const handHub=_map && /(wall|graveyard|throne|church)/.test(String(_map.preset||''));
  const townish=(_map && !['dungeon','wild','cave','crypt'].includes(_map.kind)) || handHub;
  // v67 PC: FoW covers full frustum (no tiny black circle on small side maps)
  const R=_desktop
    ? Math.max(townish?22:16, Math.ceil(Math.hypot(_viewW||24,_viewH||18)*0.65))
    : Math.max(townish?18:12, Math.ceil(Math.max(_viewW||13,_viewH||15)*0.55));
  const hx=_hero.x, hy=_hero.y;
  for(let y=hy-R;y<=hy+R;y++){
    for(let x=hx-R;x<=hx+R;x++){
      if(y<0||x<0||y>=_map.h||x>=_map.w) continue;
      if(Math.hypot(x-hx,y-hy)<=R+0.35){
        const k=fogKey(x,y);
        _visible.add(k);
        _explored.add(k);
      }
    }
  }
  // towns + small interiors/dungeons: reveal whole map (PC setpiece rooms)
  const smallMap=_map && ((_map.w|0)<=36 || (_map.h|0)<=28);
  if((townish || (_desktop && smallMap)) && _map){
    for(let y=0;y<_map.h;y++) for(let x=0;x<_map.w;x++){ const k=fogKey(x,y); _explored.add(k); if(_desktop&&smallMap) _visible.add(k); }
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
        <img class="ow-dlg-port pixelated" id="owDlgPort" alt="" width="72" height="72"/>
        <div class="ow-dlg-body">
          <div class="ow-dlg-name" id="owDlgName">…</div>
          <div class="ow-dlg-text" id="owDlgText"></div>
          <div class="ow-dlg-choices" id="owDlgChoices"></div>
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
let _beatQueue=[];
let _dlgChoices=null;
const CAST_PORT={
  'Velka':'./assets/pixel/battler/ally_velka.png',
  'Sekretärin Velka':'./assets/pixel/battler/ally_velka.png',
  'Brok':'./assets/pixel/battler/ally_brok.png',
  'General Brok':'./assets/pixel/battler/ally_brok.png',
  'Aria':'./assets/pixel/battler/ally_aria.png',
  'Heldin Aria':'./assets/pixel/battler/ally_aria.png',
  'Noctis':'./assets/pixel/battler/ally_hero.png',
  'Spionin Nyx':'./assets/pixel/battler/ally_spy.png',
  'Nyx':'./assets/pixel/battler/ally_spy.png',
  'Kundschafterin Lira':'./assets/pixel/battler/ally_spy.png',
  'Lira':'./assets/pixel/battler/ally_spy.png',
  'Wächter Toren':'./assets/pixel/battler/ally_guard.png',
  'Toren':'./assets/pixel/battler/ally_guard.png',
  'Rekrut Venn':'./assets/pixel/battler/ally_guard.png',
  'Venn':'./assets/pixel/battler/ally_guard.png',
  'Händler Bram':'./assets/pixel/battler/ally_merchant.png',
  'Bram':'./assets/pixel/battler/ally_merchant.png',
  'Schmiedin Kael':'./assets/pixel/battler/ally_merchant.png',
  'Kael':'./assets/pixel/battler/ally_merchant.png',
};
function finishDlgText(){
  if(!_dlgTw) return false;
  clearInterval(_dlgTw); _dlgTw=null;
  const tx=document.getElementById('owDlgText');
  if(tx?.dataset.full) tx.textContent=tx.dataset.full;
  return true;
}
function renderDlgChoices(choices){
  _dlgChoices=choices&&choices.length?choices:null;
  const box=document.getElementById('owDlgChoices');
  if(!box) return;
  box.innerHTML='';
  if(!_dlgChoices) return;
  _dlgChoices.forEach((ch,i)=>{
    const b=document.createElement('button');
    b.type='button';
    b.className='ow-dlg-choice';
    b.textContent=ch.label;
    b.onclick=()=>{
      _dlgChoices=null;
      box.innerHTML='';
      try{ ch.pick?.(); }catch(e){ console.warn('dlg choice', e); }
    };
    box.appendChild(b);
  });
  const first=box.querySelector('button');
  if(first) first.focus();
}
export function queueBeats(lines){
  _beatQueue=(lines||[]).filter(Boolean);
  if(_beatQueue.length) nextBeat();
}
function nextBeat(){
  if(!_beatQueue.length){ hideDialogue(); return; }
  const b=_beatQueue.shift();
  showDialogue(b.name, b.text, b.sheet, b.choices||null);
}
function confirmDialogue(){
  if(!isDialogueOpen()){ talkNearest(); return; }
  if(finishDlgText()) return;
  if(_dlgChoices) return;
  if(_beatQueue.length){ nextBeat(); return; }
  hideDialogue();
}
function enterFieldDungeon(name){
  const S=_hooks.getS?.();
  if(!S) return;
  const base=String(name||'Schatzkatakomben').split('·')[0].trim();
  S.world=S.world||{}; S.world.scene=S.world.scene||{};
  S.world.scene.ort=base+' · Raum 1';
  S.campaign=S.campaign||{};
  S.campaign.mode='dungeon';
  S.campaign.dungeon=S.campaign.dungeon||{name:base, room:1, rooms:5, boss:'lesser_fiend', bossName:'Niederer Fiend'};
  S.flags=S.flags||{};
  S.flags.owNeedsRefresh=false;
  showOverworld(S);
  const f=S.campaign?.flags||{};
  if(f.ariaPact) showDialogue('Aria','Stufen. Die Seite liegt beim Siegel, nicht bei den Knochen.','princess');
  else showDialogue('Velka','Stufen. Das Siegel ist im Norden. Neun, neun, neun. Fass nichts an, bevor ich\'s gelesen hab.','mage');
}
function fieldChapter(S){
  if(S?.campaign?.id!=='nocturna') return false;
  const idx=S?.campaign?.chapterIdx|0;
  if(idx<=1) return true;
  return idx===2 && !!S.campaign?.flags?.solmirField;
}
function onPassMap(){
  return _map?.preset==='wall';
}
function coerceDlgText(v, fallback='…'){
  if(v==null) return fallback;
  if(typeof v==='object'){
    if(typeof v.text==='string') return v.text;
    if(typeof v.line==='string') return v.line;
    if(typeof v.name==='string' && typeof v.msg==='string') return v.msg;
    return fallback;
  }
  const s=String(v).trim();
  if(!s || s==='…' || s==='...' || /^\[object /i.test(s) || /^(undefined|null|NaN)$/i.test(s)) return fallback;
  return s;
}
function coerceDlgName(v, fallback='Unbekannt'){
  if(v==null) return fallback;
  if(typeof v==='object'){
    if(typeof v.name==='string') return v.name;
    if(typeof v.speaker==='string') return v.speaker;
    if(typeof v.label==='string') return v.label;
    return fallback;
  }
  const s=String(v).trim();
  if(!s || /^\[object /i.test(s) || /^(undefined|null|NaN)$/i.test(s)) return fallback;
  return s;
}

export function showDialogue(name, text, sheet){
  // v64: accept (name,text,sheet) OR ({speaker/name, text/line}, sheet)
  let sheetArg=sheet;
  if(name && typeof name==='object' && (name.text!=null || name.line!=null || name.speaker!=null || name.name!=null)){
    const o=name;
    text = text!=null ? text : (o.text||o.line||o.msg);
    name = o.speaker||o.name||o.label;
    sheetArg = sheetArg||o.sheet;
  }
  const el=ensureDlg();
  el.classList.remove('hidden');
  document.body.classList.add('ow-dialogue');
  const port=el.querySelector('#owDlgPort');
  const nm=el.querySelector('#owDlgName');
  const tx=el.querySelector('#owDlgText');
  const S=_hooks.getS?.();
  const trueName=coerceDlgName(name, 'Unbekannt');
  const npcObj=_npcs.find(n=>n.name===trueName) || null;
  const sh=sheetArg||npcObj?.sheet||'villager';
  let usedPx=false;
  try{
    const npc=(S?.world?.npcs&&(S.world.npcs[trueName]||Object.entries(S.world.npcs).find(([k])=>k.startsWith(trueName)||trueName.startsWith(k))?.[1]))||null;
    const C45=window.__game?.C45;
    const C46=window.__game?.C46;
    const n=npc||{art:sh, sheet:sh};
    const role=C46?.portraitRole?.(trueName, n)||C45?.roleFromNpc?.(trueName,n)||sh||'villager';
    const roleUrl=C45?.ROLE_PORT?.[role]||C45?.ROLE_PORT?.villager;
    if(port && roleUrl && !CAST_PORT[trueName]){ port.src=roleUrl; usedPx=true; }
    if(!CAST_PORT[trueName]) C45?.loadFramedRolePortrait?.(role).then(url=>{ if(url && port) port.src=url; });
  }catch(_){}
  if(port && CAST_PORT[trueName]) port.src=CAST_PORT[trueName];
  else if(port && !usedPx) port.src=(window.__game?.C45?.ROLE_PORT?.villager)||PORTRAITS[sh]||PORTRAITS.default;
  let shown=trueName.slice(0,36);
  try{
    const C64=window.__game?.C64;
    const Know=window.__game?.Know;
    if(C64?.displayLabelFor) shown=String(C64.displayLabelFor(S, trueName, sh)||shown).slice(0,36);
    else if(Know?.displayName) shown=String(Know.displayName(S, trueName, S?.world?.npcs?.[trueName]||{sheet:sh})||shown).slice(0,36);
  }catch(_){}
  shown=coerceDlgName(shown, trueName).slice(0,36);
  if(CAST_PORT[trueName]) shown=trueName.replace(/^(Sekretärin|General|Heldin)\s+/,'');
  // strangers: never show bare "jemand" — role label until introduced
  if(/^(jemand|unbekannt|\?\?\?)$/i.test(shown) || shown===trueName && /hunderte|kniende|menge/i.test(trueName)){
    const ROLE_LABEL={guard:'Ein Wächter',mage:'Eine Gelehrte',merchant:'Ein Händler',spy:'Eine Vermummte',villager:'Ein Passant',daemon:'Eine dunkle Gestalt',princess:'Eine Edelfrau'};
    shown = ROLE_LABEL[sh] || 'Eine unbekannte Gestalt';
  }
  if(nm) nm.textContent=shown;
  if(port && CAST_PORT[trueName]) port.src=CAST_PORT[trueName];
  let body=coerceDlgText(text, '');
  if(!body || body==='…' || body==='...'){
    try{
      const C64=window.__game?.C64;
      const turn=(S?.v64?.talkCount?.[trueName]|0);
      body = (window.__game?.C66||window.__game?.C64)?.lineForNpc?.(trueName, sh, turn) || '…';
    }catch(_){ body='Guten Tag.'; }
  }
  body=coerceDlgText(body, 'Guten Tag.');
  // strip leading "Name: " duplication if label already shows name
  const full=body;
  if(tx) tx.dataset.full=full;
  if(_dlgTw) clearInterval(_dlgTw);
  let i=0; if(tx) tx.textContent='';
  renderDlgChoices(arguments[3]);
  _dlgTw=setInterval(()=>{
    i=Math.min(full.length, i+2);
    if(tx) tx.textContent=full.slice(0,i);
    if(i>=full.length){ clearInterval(_dlgTw); _dlgTw=null; }
  }, 18);
  return {name:shown, text:full};
}
export function hideDialogue(){
  if(_dlgTw){ clearInterval(_dlgTw); _dlgTw=null; }
  _dlgChoices=null;
  const box=document.getElementById('owDlgChoices');
  if(box) box.innerHTML='';
  _dlg?.classList.add('hidden');
  document.body.classList.remove('ow-dialogue');
}
export function isDialogueOpen(){ return !!_dlg && !_dlg.classList.contains('hidden'); }

function talkTo(name){
  const label=coerceDlgName(name, '');
  if(!label) return null;
  const npc=_npcs.find(n=>n.name===label);
  const sh=npc?.sheet||'villager';
  const S=_hooks.getS?.();
  try{
    S.v64=S.v64||{talkCount:{}};
    S.v64.talkCount=S.v64.talkCount||{};
  }catch(_){}
  const turn=(S?.v64?.talkCount?.[label]|0);
  if(fieldChapter(S)){
    const ft=fieldLine(S, label, sh);
    if(ft){
      showDialogue(label, ft.text, sh, ft.choices||null);
      try{ if(S?.v64?.talkCount) S.v64.talkCount[label]=(turn+1)|0; }catch(_){}
      return {name:label, text:ft.text};
    }
  }
  let line='Guten Tag.';
  try{
    const C64=window.__game?.C64;
    line = (window.__game?.C66||window.__game?.C64)?.lineForNpc?.(label, sh, turn) || line;
  }catch(_){}
  // first talk: introduce → learn name for story NPCs
  try{
    const C64=window.__game?.C64;
    const Know=window.__game?.Know;
    if(Know && C64?.SELF_INTRO_NAMES?.has?.(label)){
      Know.learnName?.(S, label, 'self');
      Know.markInteracted?.(S, label);
    } else if(Know){
      Know.markInteracted?.(S, label);
      // strangers keep description label until self-intro line contains name
      if(/^[A-ZÄÖÜ][a-zäöüß]+\:/.test(line) && !C64?.SELF_INTRO_NAMES?.has?.(label)){
        const maybe=line.split(':')[0].trim();
        if(maybe && maybe.length<20) Know.learnName?.(S, label, 'heard');
      }
    }
  }catch(_){}
  try{ if(S?.v64?.talkCount) S.v64.talkCount[label]=(turn+1)|0; }catch(_){}
  const shown=showDialogue(label, line, sh);
  try{ _audioApi?.playSfx?.('talk'); }catch(_){}
  // v64: NEVER call free-text act() for talk — JRPG dialogue only
  try{ _hooks.toast?.(''); }catch(_){}
  try{ _hooks.save?.(); }catch(_){}
  return shown;
}

function facingTile(){
  const d=_hero.dir|0;
  const dx=d===1?-1:d===2?1:0, dy=d===3?-1:d===0?1:0;
  return {x:_hero.x+dx, y:_hero.y+dy};
}
function campFlags(S){
  S.campaign=S.campaign||{};
  S.campaign.flags=S.campaign.flags||{};
  return S.campaign.flags;
}
function leaveParty(S, names){
  const ban=new Set(names);
  S.party=(S.party||[]).filter(n=>!ban.has(n));
  if(S.campaign) S.campaign.party=(S.campaign.party||[]).filter(n=>!ban.has(n));
}
function noteAria(S, ev, aff, trust, stage){
  const f=campFlags(S);
  S.romance=S.romance||{};
  const prev=S.romance['Heldin Aria']||{};
  const r=S.romance['Heldin Aria']=Object.assign({affection:0,trust:0,stage:0,events:[],adult:true}, prev);
  r.adult=true;
  r.events=Array.isArray(r.events)?r.events:[];
  if(ev && !r.events.includes(ev)) r.events.push(ev);
  if(aff!=null) r.affection=Math.max(-100, Math.min(100, aff|0));
  if(trust!=null) r.trust=Math.max(0, Math.min(100, trust|0));
  if(stage!=null) r.stage=stage|0;
  r.route=f.ariaRomance?'romance':f.ariaPact?'betray':f.ariaRefused?'loyal':f.ariaClosed?'closed':'open';
  try{
    const n=S.world?.npcs?.['Heldin Aria'];
    if(n){ n.adult=true; n.romance=true; }
  }catch(_){}
  try{ _hooks.save?.(); }catch(_){}
}
function joinAria(S){
  try{ window.__game?.C60?.recruitMember?.(S, 'Heldin Aria', {}); }catch(_){}
}
function fadeIntimate(){
  let el=document.getElementById('owFade');
  if(!el){
    el=document.createElement('div');
    el.id='owFade';
    el.setAttribute('aria-hidden','true');
    document.body.appendChild(el);
  }
  el.classList.remove('on');
  void el.offsetWidth;
  el.classList.add('on');
  setTimeout(()=>{ try{ el.classList.remove('on'); }catch(_){} }, 1800);
}
function resolveAriaNight(S, yes, underage){
  const f=campFlags(S);
  f.ariaSplit=true;
  leaveParty(S, ['Sekretärin Velka','General Brok']);
  if(underage || !yes){
    f.ariaRomanceRefused=true;
    if(underage) f.ariaUnderageStop=true;
    leaveParty(S, ['Heldin Aria']);
    noteAria(S, underage?'stop':'nein', underage?0:22, underage?0:28, underage?0:1);
    showDialogue('Aria', underage
      ? 'Dann ist hier Schluss. So was fang ich nicht an. Die Seite nehm ich mit, den Rest nicht.'
      : 'Dann bleib König. Die Seite nehm ich mit. Ich schlaf nicht aus Dankbarkeit.', 'princess');
    return;
  }
  f.ariaRomance=true;
  f.ariaAdults=true;
  try{ if(S.pc) S.pc.adult=true; }catch(_){}
  try{ window.__game?.C60?.recruitMember?.(S, 'Heldin Aria', {}); }catch(_){}
  noteAria(S, 'ja', 78, 68, 4);
  fadeIntimate();
  showDialogue('Aria', 'Licht aus. Was danach ist, bleibt zwischen uns. Morgen holen wir Lio.', 'princess');
}
export function fieldCryptEnd(S){
  if(!S) return;
  const f=campFlags(S);
  document.body.classList.add('field-play');
  const beats=[];
  if(f.ariaStood && f.ariaRomance){
    beats.push({name:'Aria', sheet:'princess', text:'Er ist still. Ich geh mit dir zum Feuer zurück. Morgen reden wir. Heute holen wir erst Lio.'});
  } else if(f.ariaRefused){
    beats.push({name:'Velka', sheet:'mage', text:'Er ist still. Venn kann schlafen. Die Asche nehm ich mit, die Knochen nicht.'});
    beats.push({name:'Aria', sheet:'princess', text:'Das reicht für Lios Husten nicht, aber der Lärm hört auf. Ich geh zurück zum Pass.'});
  } else {
    beats.push({name:'Jex', sheet:'spy', text:'Still da unten. Die Münzen im Vorraum nehm ich. Du hast die Asche. Die Kathedrale ist noch zu.'});
  }
  beats.push({name:'Mara', sheet:'mage', text:'Ich schreib: der Lich ist still. Die Kathedrale mach ich heute nicht auf.'});
  queueBeats(beats);
}
export function fieldPassEnd(S){
  if(!S) return;
  const f=campFlags(S);
  document.body.classList.add('field-play');
  const beats=[];
  if(f.ariaStood && f.ariaRomance){
    beats.push({name:'Aria', sheet:'princess', text:'Der Hund ist still. Lio kann runter. Du hast dich vor Toren gestellt. Das war für ihn. Ob du bleibst, frag mich morgen, nicht im Schnee.'});
  } else if(f.ariaCool || f.ariaNoRomance || f.ariaRomanceRefused){
    beats.push({name:'Aria', sheet:'princess', text:'Der Hund ist still. Lio lebt. Das war der Handel. Ich geh mit ihm zum Feuer. Du nicht in mein Zelt.'});
  } else if(f.ariaRefused){
    if((S.party||[]).includes('Sekretärin Velka')) beats.push({name:'Velka', sheet:'mage', text:'Der Lärm hört auf. Venn hustet weniger, wenn sie schläft.'});
    if((S.party||[]).includes('General Brok')) beats.push({name:'Brok', sheet:'guard', text:'Saubere Arbeit. Kein Spektakel.'});
    beats.push({name:'Aria', sheet:'princess', text:'Ich bring Lio zum Feuer. Du hast Wort gehalten. Das ist viel. Es ist kein Versprechen.'});
  } else {
    beats.push({name:'Nyx', sheet:'spy', text:'Hund tot, Wache atmet. Der Mantel liegt bei der Beute. Mehr hab ich nicht gesehen.'});
  }
  if(f.nyxReport){
    try{ window.__game?.C60?.recruitMember?.(S, 'Spionin Nyx', {}); }catch(_){}
    beats.push({name:'Nyx', sheet:'spy', text:'Der Bericht ist bezahlt. Ich bleib, bis Solmir. Nicht aus Zuneigung. Aus dem Preis.'});
  }
  queueBeats(beats);
}
export function fieldReward(S){
  if(!S) return;
  const f=campFlags(S);
  document.body.classList.add('field-play');
  if(f.ariaPact && f.ariaPageTaken){
    const beats=[
      {name:'Velka', sheet:'mage', text:'Sie hat die Seite. Du hast ja gesagt. Ich hab\'s gesehen. Such dir jemand anders für die Zahlen. Ich geh zu Venn.'},
      {name:'Brok', sheet:'guard', text:'Die Nacht war für Venn. Du hast sie für Aria ausgegeben. Ich geh hoch. Such dir eine andere Wand.'},
    ];
    if(f.ariaCourt && !f.ariaNoRomance && !f.ariaRomance && !f.ariaRomanceRefused){
      beats.push({name:'Aria', sheet:'princess', text:'Die beiden gehen. Das hast du gewusst. Ich bin sechsundzwanzig, und ich frag trotzdem: bist du erwachsen? Eine Nacht am Pass, bei mir, nicht auf dem Thron. Ja oder nein.', choices:[
        {label:'Ja. Ich bin erwachsen. Ich komm mit.', pick:()=>resolveAriaNight(S, true, false)},
        {label:'Nein. Ich bleib.', pick:()=>resolveAriaNight(S, false, false)},
        {label:'Ich bin nicht erwachsen.', pick:()=>resolveAriaNight(S, false, true)},
      ]});
    }else if(f.ariaRomance){
      beats.push({name:'Aria', sheet:'princess', text:'Wir haben ja gesagt. Lio wartet. Wir gehen zu Fuß.'});
    }else{
      beats.push({name:'Aria', sheet:'princess', text:'Die Seite hab ich. Du hast nicht gefragt, und das ist in Ordnung. Ich hol Lio. Damit hat sich\'s.'});
      leaveParty(S, ['Sekretärin Velka','General Brok','Heldin Aria']);
      f.ariaSplit=true;
      noteAria(S, 'seite-ohne-frage', 24, 30, 2);
    }
    queueBeats(beats);
    return;
  }
  const beats=[
    {name:'Velka', sheet:'mage', text:'Er hat Broks Stimme benutzt. Danach war er still. Das Buch bleibt ganz.'},
    {name:'Brok', sheet:'guard', text:'Morgen sag ich Venn, der Staub hat aufgehört. Komm mit hoch, wenn du willst.'},
  ];
  if(f.ariaGuest && !f.ariaClosed){
    beats.push({name:'Aria', sheet:'princess', text:'Ich hol Lio. Danke fürs Mitkommen. Mehr war nicht ausgemacht.'});
    leaveParty(S, ['Heldin Aria']);
  }
  queueBeats(beats);
}
function goToPass(S){
  if(!S) return;
  const f=campFlags(S);
  f.passField=true;
  f.passArrived=true;
  S.campaign.chapterIdx=1;
  S.campaign.sceneId='c2_open';
  S.campaign.mode='scene';
  S.campaign.dungeon=null;
  S.world=S.world||{}; S.world.scene=S.world.scene||{};
  S.world.scene.ort='Grenzpass';
  S.flags=S.flags||{};
  S.flags.c2FieldBoot=true;
  document.body.classList.add('field-play');
  showOverworld(S);
  const beats=[];
  if(f.ariaRomance && !f.ariaCool){
    beats.push({name:'Aria', sheet:'princess', text:'Wir sind am Pass. Die Nacht bleibt die Nacht. Lio hustet da oben, und ich bin nicht deine Frau.'});
    beats.push({name:'Toren', sheet:'guard', text:'Halt. Wer die Seite rausgerissen hat, kommt nicht mit Begleitung durch. Rede mit mir, bevor sie weitergeht.'});
  } else if(f.ariaNoRomance || f.ariaRomanceRefused){
    beats.push({name:'Aria', sheet:'princess', text:'Pass. Lio hustet. Du hast klar gesagt, was die Nacht nicht ist. Der Hund ist im Ostturm.'});
  } else if(f.ariaRefused){
    beats.push({name:'Aria', sheet:'princess', text:'Lio hustet. Die Klinge unten war die Klinge. Der Hund ist im Ostturm.'});
    beats.push({name:'Velka', sheet:'mage', text:'Zwei Wachen fehlen. Der Hund hat sie, nicht der Schnee. Zähl sie nicht zu den Lebenden.'});
  } else {
    beats.push({name:'Toren', sheet:'guard', text:'Grenzpass. Der Hund im Ostturm hat die Wache geholt. Feuer ist da, wenn du eins brauchst.'});
  }
  queueBeats(beats);
  try{ _hooks.save?.(); }catch(_){}
}
function goToSolmir(S){
  if(!S) return;
  const f=campFlags(S);
  f.solmirField=true;
  f.solmirArrived=true;
  S.campaign.chapterIdx=2;
  S.campaign.sceneId='c3_open';
  S.campaign.mode='scene';
  S.campaign.dungeon=null;
  S.world=S.world||{}; S.world.scene=S.world.scene||{};
  S.world.scene.ort='Ruinen von Solmir';
  S.flags=S.flags||{};
  document.body.classList.add('field-play');
  showOverworld(S);
  const beats=[];
  if(f.ariaStood && f.ariaRomance){
    beats.push({name:'Aria', sheet:'princess', text:'Ich geh mit in den Hof. Nicht weiter, bis die Tür auf ist. Lio bleibt am Pass, am Feuer.'});
  } else if(f.ariaRefused){
    beats.push({name:'Aria', sheet:'princess', text:'Hier liegt Staub, kein Hund. Ich such etwas für Lios Husten. Danach geh ich zurück.'});
  } else if(f.ariaCool || f.ariaNoRomance || f.ariaRomanceRefused){
    beats.push({name:'Jex', sheet:'spy', text:'Die Blonde ist am Pass geblieben. Sie hat nicht nach dir gefragt. Der Hof ist offen. Die Gruft nicht.'});
  } else {
    beats.push({name:'Mara', sheet:'mage', text:'Der Hof ist offen. Die Tür zur Gruft ist zu. Heute kommst du da nicht durch.'});
  }
  beats.push({name:'Orun', sheet:'guard', text:'Vier Kammern. In jeder stehen zwei Särge. Die Tür will acht. Nicht vier, und nicht ein Gebet.'});
  queueBeats(beats);
  try{ _hooks.save?.(); }catch(_){}
}
function placeMark(x,y,label,kind){
  if(!walkable(x,y)) return false;
  if((_questMarks||[]).some(m=>m.kind===kind && m.x===x && m.y===y)) return true;
  _questMarks.push({x,y,label,kind});
  return true;
}
function ensurePassWorld(S){
  if(!S?.campaign?.flags?.beat_lesser_fiend || S.campaign.flags.passArrived) return;
  if((S.campaign.chapterIdx|0)!==0) return;
  if((_questMarks||[]).some(m=>m.kind==='pass')) return;
  const spots=[[_hero.x,_hero.y+2],[_hero.x+1,_hero.y+1],[_hero.x-1,_hero.y+1],[_hero.x,_hero.y+1],[_hero.x+2,_hero.y]];
  for(const [x,y] of spots){
    if(placeMark(x|0,y|0,'Zum Pass','pass')) return;
  }
}
function ensurePassJobs(S){
  if(!onPassMap() || !S?.campaign?.flags?.passField) return;
  const cx=Math.floor((_map.w||30)/2), cy=Math.floor((_map.h||30)/2);
  if(!S.campaign.flags.passWolf){
    const spots=[[cx+2,cy],[cx-2,cy],[cx,cy+2],[cx+2,cy+1]];
    for(const [x,y] of spots){ if(placeMark(x,y,'Wolf','hunt')) break; }
  }
  if(!S.campaign.flags.beat_hellhound && !S.campaign.flags.passClear){
    const spots=[[cx+12,cy-8],[cx+11,cy-7],[cx+12,cy-6],[cx+10,cy-8]];
    for(const [x,y] of spots){ if(placeMark(x,y,'Höllenhund','boss')) break; }
  }
  if(S.campaign.flags.passArrived && !S.campaign.flags.solmirArrived){
    const spots=[[cx,cy-3],[cx-1,cy-3],[cx+1,cy-3],[cx,cy-4]];
    for(const [x,y] of spots){ if(placeMark(x,y,'Nach Solmir','solmir')) break; }
  }
  const add=(name,sheet,x,y)=>{
    if(_npcs.some(n=>n.name===name)) return;
    if(!walkable(x,y)) return;
    _npcs.push({name, sheet, x, y, px:x, py:y, dir:0, frame:0, e:'', home:{x,y}});
  };
  if((S.party||[]).includes('Sekretärin Velka')) add('Sekretärin Velka','mage', Math.max(6,cx-10), cy+2);
  if((S.party||[]).includes('General Brok')) add('General Brok','guard', Math.min((_map.w||40)-7, cx+10), cy+2);
}
function ensureSolmir(S){
  if(_map?.preset!=='graveyard' || !S?.campaign?.flags?.solmirField) return;
  const cx=Math.floor((_map.w||30)/2), cy=Math.floor((_map.h||30)/2);
  const f=S.campaign.flags;
  const add=(name,sheet,x,y)=>{
    if(_npcs.some(n=>n.name===name)) return;
    if(!walkable(x,y)) return;
    _npcs.push({name, sheet, x, y, px:x, py:y, dir:0, frame:0, home:{x,y}});
  };
  if((f.ariaStood && f.ariaRomance) || f.ariaRefused) add('Heldin Aria','princess', cx+4, cy+3);
  if((S.party||[]).includes('Sekretärin Velka')) add('Sekretärin Velka','mage', cx-5, cy+3);
  if(!f.solmirSeal && !f.c3Clear){
    const spots=[[cx,cy-2],[cx,cy-3],[cx-1,cy-2],[cx+1,cy-2]];
    for(const [x,y] of spots){ if(placeMark(x,y,'Grufttür','crypt')) break; }
  }
  if(f.solmirSeal && !f.beat_boss_lich && !f.c3Clear){
    const spots=[[cx,cy-5],[cx,cy-4],[cx-1,cy-5],[cx+1,cy-4]];
    for(const [x,y] of spots){ if(placeMark(x,y,'Lich','boss')) break; }
  }
}
function passFieldLine(S, label, sh, party, f){
  if(label==='Heldin Aria'){
    if(f.passClear && f.ariaStood) return {text:'Der Hund ist still. Lio kann runter. Du hast dich vor Toren gestellt. Das war für Lio. Ob du bleibst, weiß ich morgen, nicht heute Nacht.'};
    if(f.passClear && (f.ariaNoRomance || f.ariaRomanceRefused || f.ariaCool)) return {text:'Lio lebt. Das war der Handel. Mehr nicht, und nicht in meinem Zelt.'};
    if(f.passClear && f.ariaRefused) return {text:'Lio kommt zum Feuer. Du hast Wort gehalten. Das ist viel. Es ist kein Versprechen.'};
    if(f.ariaCool) return {text:'Fass mich nicht an. Die Nacht war die Nacht. Lio hol ich allein.'};
    if(f.ariaStood) return {text:'Du stehst vor ihm. Gut. Das ist für Lio, nicht weil die Nacht uns was schuldet.'};
    if(f.ariaRomance) return {text:'Die Nacht war eine Nacht. Ich bin nicht deine Frau. Lio hustet da oben. Toren will mich nicht durch. Stell dich vor mich, oder lass es.'};
    if(f.ariaNoRomance || f.ariaRomanceRefused) return {text:'Die Seite ist draußen. Du hast klar gesagt, was du nicht willst. Der Hund frisst die Wache. Ich geh wegen Lio mit. Das ist kein Bett.'};
    if(f.ariaRefused) return {text:'Lio hustet. Die Klinge unten war die Klinge, nicht mehr. Der Hund ist im Ostturm. Komm mit, und fang nicht von uns an.'};
    return {text:'Lio hustet. Der Hund ist im Ostturm. Ich bin wegen ihm hier, nicht wegen dir.'};
  }
  if(label==='Wächter Toren'){
    if(f.ariaStood) return {text:'Sie geht durch. Du stehst davor, also halt ich die Order. Der Hund ist trotzdem im Turm.'};
    if(f.ariaCool) return {text:'Sie ist weg. Die Order gilt noch für dich. Ostturm, wenn du den Hund willst.'};
    if(f.ariaRomance && !f.ariaStood){
      return {text:'Sie bleibt stehen. Order: wer die Seite rausgerissen hat, kommt nicht mit Begleitung durch. Du entscheidest das, nicht ich.', choices:[
        {label:'Sie geht durch.', pick:()=>{ f.ariaStood=true; noteAria(S,'toren',78,74,4); showDialogue('Aria','Du stellst dich vor ihn. Das ist für Lio. Nicht, weil die Nacht uns was schuldet.', 'princess'); }},
        {label:'Halt sie auf.', pick:()=>{ f.ariaCool=true; leaveParty(S,['Heldin Aria']); noteAria(S,'kalt',20,10,1); showDialogue('Aria','Dann war die Nacht nur die Nacht. Lio hol ich allein.', 'princess'); }},
      ]};
    }
    return {text:'Grenzpass. Der Hund im Ostturm hat zwei von uns geholt. Feuer ist da. Rein geh ich nicht.'};
  }
  if(label==='Spionin Nyx'){
    if(f.nyxReport) return {text:'Er hängt im Ostturm, an der Kette. Licht kannst du dir sparen, das beißt ihn nicht. Wenn du Eis oder Wasser dabei hast, nimm das. Wenn nicht, geh mit Stahl rein und bleib nicht stehen.'};
    return {text:'Fünfzehn Gold, dann sag ich dir, wo er steht. Er hängt im Ostturm an der Kette. Licht beißt ihn nicht. Hast du Eis oder Wasser, nimm das mit. Hast du keins, nimm Stahl, und geh nicht allein rein.', choices:[
      {label:'Zahlen', pick:()=>{
        if((S.st?.gold|0)<15){ showDialogue(label,'Fünfzehn. Weniger nehm ich nicht.', sh); return; }
        S.st.gold=(S.st.gold|0)-15;
        f.nyxReport=true;
        try{ _hooks.save?.(); }catch(_){}
        showDialogue(label,'Ostturm, an der Kette. Fass die Kette nicht an. Wenn Aria bei dir ist, hat die Wache eine Order gegen sie. Das ist nicht meine Order.', sh);
      }},
      {label:'Später', pick:()=>hideDialogue()},
    ]};
  }
  if(label==='Rekrut Venn'){
    if(f.ariaSplit || f.ariaCool) return {text:'Brok ist nicht hier. Er hat gesagt, er kommt, wenn du die Nacht nicht verkaufst. Ich hust noch.'};
    return {text:'Ich hust noch. Zwei von uns hat der Hund geholt. Wenn Brok bei dir ist, sag ihm das, bevor ihr den Turm aufmacht.'};
  }
  if(label==='Kundschafterin Lira'){
    if(f.passWolf) return {text:'Der Wolf ist tot. Das Fell kannst du behalten. Der Hund im Turm ist größer, und der kommt nicht, wenn du rufst.'};
    return {text:'Ein Wolf auf dem Weg, der Hund im Turm. Der Wolf ist der kleinere. Dreh ihm trotzdem nicht den Rücken zu.'};
  }
  if(label==='Händler Bram'){
    return {text:'Decken, Seil, ein Trank. Der Weg nach Solmir friert zu. Ich frag nicht, wen du mitbringst.'};
  }
  if(label==='Schmiedin Kael'){
    return {text:'Der Turm braucht Stahl, keine Rede. Wenn die Klinge splittert, bring sie her. Lass mich sonst am Feuer.'};
  }
  if(label==='Sekretärin Velka' && party.includes(label)){
    return {text:'Zwei von der Wache fehlen. Der Hund hat sie geholt. Ich zähl die beiden nicht mehr mit.'};
  }
  if(label==='General Brok' && party.includes(label)){
    return {text:'Ostturm. Ich geh vor. Wenn du Aria anfasst, ohne dass sie es will, schlag ich dich. König oder nicht.'};
  }
  return null;
}
function onSolmirMap(){
  return _map?.preset==='graveyard';
}
function openCryptDoor(S){
  const f=campFlags(S);
  showDialogue('Orun','Vier Kammern, zwei Särge in jeder. Wie viele sind das?','guard',[
    {label:'Vier', pick:()=>{ S.st.hp=Math.max(1,(S.st.hp|0)-8); showDialogue('Orun','Zu wenig. Zähl die Kammern noch mal.','guard'); }},
    {label:'Acht', pick:()=>{
      f.solmirSeal=true;
      const spots=[[_hero.x,_hero.y-2],[_hero.x+1,_hero.y-2],[_hero.x-1,_hero.y-2],[_hero.x,_hero.y+2],[_hero.x+2,_hero.y]];
      for(const [x,y] of spots){ if(placeMark(x|0,y|0,'Lich','boss')) break; }
      showDialogue('Orun','Acht. Die Riegel gehen. Der Lich steht direkt hinter der Tür.','guard');
    }},
    {label:'Zwölf', pick:()=>{ S.st.hp=Math.max(1,(S.st.hp|0)-8); showDialogue('Orun','Zu viele. Es sind zwei pro Kammer.','guard'); }},
  ]);
}
function solmirLine(S, label, party, f){
  if(label==='Heldin Aria'){
    if(f.c3Clear && f.ariaStood) return {text:'Er ist still. Lio kann am Feuer bleiben. Ich geh mit dir zurück, und wir reden morgen. Heute nicht.'};
    if(f.ariaStood && f.ariaRomance) return {text:'Ich geh mit bis zur Tür. Die Nacht hat uns nicht verheiratet. Wenn du acht sagst, komm ich mit rein.'};
    if(f.ariaRefused) return {text:'Etwas für den Husten, dann zurück. Das hier ist kein Spaziergang mit mir.'};
    return {text:'Ich bin wegen Lio hier. Nicht wegen der Gruft, und nicht wegen dir.'};
  }
  if(label==='Grabräuber Jex'){
    if(f.c3Clear) return {text:'Der Lich ist unten still. Ich nehm die Münzen im Vorraum und geh. Die Knochen bleiben.'};
    if(f.ariaCool || f.ariaNoRomance || f.ariaRomanceRefused) return {text:'Sie ist nicht mit dir gekommen. Gut für sie. Die Tür will acht Särge. Ich zähl nicht für dich.'};
    if(f.ariaStood) return {text:'Sie steht hinter dir. Die Gruft ist zu, bis jemand acht sagt. Ich bleib im Hof.'};
    return {text:'Staub und Münzen. Die Tür ist zu. Ich klopf nicht.'};
  }
  if(label==='Chronistin Mara'){
    if(f.c3Clear) return {text:'Ich schreib: der Lich ist still. Die Gruft bleibt sonst zu. Mehr hab ich heute nicht.'};
    return {text:'Ich schreib, wer hier gelegen hat. Vier Kammern, zwei Särge. Die Tür geht auf acht auf.'};
  }
  if(label==='Hüter Orun'){
    if(f.solmirSeal) return {text:'Die Riegel sind auf. Norden. Und komm zurück, wenn er dich hinlegt.'};
    return {text:'Vier Kammern. Zwei Särge in jeder. Sag acht an der Tür, dann geht sie auf.'};
  }
  if(label==='Sekretärin Velka' && party.includes(label)){
    return {text:'Trockener Staub, nicht wie bei Venn. Die Tür ist zu. Ich les hier nichts vor.'};
  }
  if(label==='General Brok' && party.includes(label)){
    return {text:'Kein Hund, nur Stein. Wir gehen nicht rein, solange die Tür zu ist.'};
  }
  return null;
}
function fieldLine(S, label, sh){
  const party=(S.party||[]);
  const f=campFlags(S);
  if(onSolmirMap() && f.solmirField){
    const sol=solmirLine(S, label, party, f);
    if(sol) return sol;
  }
  if(onPassMap()){
    const pass=passFieldLine(S, label, sh, party, f);
    if(pass) return pass;
  }
  if(label==='Sekretärin Velka'){
    if(f.ariaSplit) return {text:'Die Seite ist raus. Mach deine Kasse allein. Ich les dir nichts mehr vor.'};
    if(f.ariaPageTaken) return {text:'Ich hab die Seite in ihrer Hand gesehen. Erklär das nach dem Fiend. Nicht jetzt.'};
    if(f.ariaPact){
      const line='Du guckst die ganze Zeit zu Aria. Wenn aus dem Buch eine Seite fehlt, seh ich das noch heute.';
      if(party.includes(label)) return {text:line};
      return {text:line+' Ich komm trotzdem mit. Venn wartet nicht.', choices:[
        {label:'Mitnehmen', pick:()=>{ try{ window.__game?.C60?.recruitMember?.(S, label, {}); }catch(_){} showDialogue(label,'Gut. Und ich guck auf das Buch, nicht auf sie.', sh); }},
        {label:'Noch nicht', pick:()=>hideDialogue()},
      ]};
    }
    if(party.includes(label)) return {text:'Neun, neun, neun. Unterm Thron, und noch mal am Siegel. Nicht laut. Unten hört einer mit.'};
    return {text:'Venn wird nicht gesünder, wenn wir hier stehen. Ich komm mit runter. Du vergisst Zahlen, ich nicht.', choices:[
      {label:'Mitnehmen', pick:()=>{ try{ window.__game?.C60?.recruitMember?.(S, label, {}); }catch(_){} showDialogue(label,'Gut. Wenn du\'s unterwegs vergisst: neun, neun, neun, unter dem Sitz.', sh); }},
      {label:'Noch nicht', pick:()=>hideDialogue()},
    ]};
  }
  if(label==='General Brok'){
    if(f.ariaSplit) return {text:'Gegen mich. Gegen Venn. Für sie. Such dir eine andere Wand.'};
    if(f.ariaPageTaken) return {text:'Du hast ihr die Seite gegeben. Vor meinen Augen. Den Fiend kämpf ich noch. Danach nicht mehr für dich.'};
    if(f.ariaPact){
      const line='Aria redet leise mit dir. Ich hör das trotzdem. Überleg dir, für wen die Nacht draufgeht.';
      if(party.includes(label)) return {text:line};
      return {text:line, choices:[
        {label:'Brok kommt mit', pick:()=>{ try{ window.__game?.C60?.recruitMember?.(S, label, {}); }catch(_){} showDialogue(label,'Na gut. Runter. Ich pass auf, wem du die Seite gibst.', sh); }},
        {label:'Bleib oben', pick:()=>hideDialogue()},
      ]};
    }
    if(party.includes(label)) return {text:'Wenn das Ding unten weiß, wer ich bin, hau nicht daneben.'};
    return {text:'Eine Nacht. Ich komm mit runter. Nicht für die Krone. Für Venn.', choices:[
      {label:'Brok kommt mit', pick:()=>{ try{ window.__game?.C60?.recruitMember?.(S, label, {}); }catch(_){} showDialogue(label,'Na gut. Runter. Und hau nicht daneben.', sh); }},
      {label:'Bleib oben', pick:()=>hideDialogue()},
    ]};
  }
  if(label==='Heldin Aria'){
    if(f.ariaRomance) return {text:'Pass. Lio. Und du gehst zu Fuß, nicht auf dem Thron.'};
    if(f.ariaUnderageStop) return {text:'Ich hab Schluss gesagt. Fass mich nicht an. Hol dir jemand in deinem Alter.'};
    if(f.ariaRomanceRefused) return {text:'Ich hab nein gesagt. Die Seite hab ich. Mehr gibt\'s nicht.'};
    if(f.ariaClosed && !f.ariaPact) return {text:'Ich hab nein gesagt. Geh.'};
    const step=f.ariaStep|0;
    if(step<1){
      return {text:'Lio ist neunzehn und steht draußen Wache. Ich bin sechsundzwanzig. Wir sind beide erwachsen, und ich lass ihn nicht stehen, nur weil du ein Siegel brauchst. Im Buch unten steht seine Schicht. Velka liest die Summen. Die Zeile lässt sie weg.', choices:[
        {label:'Erzähl weiter.', pick:()=>{ f.ariaStep=1; f.ariaHeard=true; noteAria(S,'gehört',12,18,1); showDialogue(label,'Nicht hier. Brok hört durch die Säulen. Geh zwei Schritte und komm wieder.', sh); }},
        {label:'Geh zu ihm.', pick:()=>{ f.ariaStep=2; f.ariaClosed=true; noteAria(S,'weg',4,0,0); showDialogue(label,'Wie du willst. Ich hol ihn allein.', sh); }},
      ]};
    }
    if(!f.ariaPact && !f.ariaRefused && !f.ariaClosed){
      return {text:'Die Zeile mit seiner Schicht. Die will ich draußen haben, nicht im Buch. Wenn du sie rausnimmst, sind Velka und Brok gegen dich. Die merken das. Ich lüg die beiden nicht an, und du sollst es nicht hinter ihrem Rücken tun. Sag\'s jetzt.', choices:[
        {label:'Ich nehm die Seite. Den beiden sag ich\'s.', pick:()=>{ f.ariaStep=2; f.ariaPact=true; f.ariaGuest=true; joinAria(S); noteAria(S,'pakt',36,40,2); showDialogue(label,'Dann geh ich mit runter. Wenn du kneifst, geh ich ohne dich.', sh); }},
        {label:'Die Seite bleibt. Du kannst als Klinge mit.', pick:()=>{ f.ariaStep=2; f.ariaRefused=true; f.ariaGuest=true; joinAria(S); noteAria(S,'klinge',20,24,2); showDialogue(label,'In Ordnung. Klinge, keine Komplizin. Verwechsel das nicht.', sh); }},
        {label:'Weder die Seite noch du.', pick:()=>{ f.ariaStep=2; f.ariaClosed=true; noteAria(S,'zu',0,0,0); showDialogue(label,'Dann sind wir fertig.', sh); }},
      ]};
    }
    if(f.ariaPact && !f.ariaCourt && !f.ariaNoRomance && !f.ariaRomance && !f.ariaRomanceRefused){
      return {text:'Die Seite ist eine Sache. Ich bin keine Belohnung dafür. Sechsundzwanzig, und du bist alt genug für ein Nein. Wenn du mich willst, frag mich, wenn das Ding unten still ist. Nicht im Keller. Ein Nein bleibt ein Nein.', choices:[
        {label:'Ich frag dich danach. Nicht jetzt.', pick:()=>{ f.ariaCourt=true; noteAria(S,'warte',48,55,3); showDialogue(label,'Mal sehen, ob du das aushältst. Bis dahin halt ich das Schwert, nicht deine Hand.', sh); }},
        {label:'Nur die Seite. Mehr nicht.', pick:()=>{ f.ariaNoRomance=true; noteAria(S,'nur-seite',30,36,2); showDialogue(label,'Ehrlich. Das kann ich brauchen.', sh); }},
      ]};
    }
    if(f.ariaPact && f.ariaCourt && !f.ariaPageTaken) return {text:'Frag mich, wenn er still ist. Nicht vorher. Ich halt das Schwert.'};
    if(f.ariaPact && f.ariaNoRomance) return {text:'Nur die Seite. Abgemacht. Dräng nicht nach.'};
    if(f.ariaPageTaken && f.ariaCourt) return {text:'Sie hat\'s gesehen. Nach dem Fiend fragst du. Nicht hier zwischen den Knochen.'};
    if(f.ariaPageTaken) return {text:'Die Seite ist draußen. Mehr hab ich nicht von dir verlangt.'};
    if(f.ariaRefused) return {text:'Ich kämpf mit. Dräng nicht. Lio wartet, und ich hab keine Lust auf einen König, der Grenzen vergisst.'};
    return {text:'Bis zum Fiend. Danach hol ich Lio.'};
  }
  return null;
}
function talkNearest(){
  const f=facingTile();
  const S=_hooks.getS?.();
  const nearMark=(kind)=> (_questMarks||[]).find(m=>{
    if(!m) return false;
    if(!(m.kind===kind || (kind==='puzzle' && /siegel/i.test(String(m.label||''))))) return false;
    const byFace=Math.abs((m.x|0)-f.x)<=1 && Math.abs((m.y|0)-f.y)<=1;
    const byHero=Math.abs((m.x|0)-_hero.x)<=1 && Math.abs((m.y|0)-_hero.y)<=1;
    return byFace || byHero;
  });
  const crypt=nearMark('crypt');
  if(crypt && onSolmirMap() && S?.campaign?.flags?.solmirField && !S.campaign.flags.solmirSeal){
    openCryptDoor(S);
    return 'crypt';
  }
  const boss=nearMark('boss');
  if(boss && fieldChapter(S)){
    if(onSolmirMap()){
      if(!S.campaign?.flags?.solmirSeal){
        showDialogue('Orun','Die Tür ist zu. Vier Kammern, zwei Särge. Sag acht.','guard');
        return 'locked';
      }
      S.campaign.chapterIdx=2;
      S.campaign.flags.solmirField=true;
      S.campaign.dungeon=null;
      try{ window.__game?.startFieldBoss?.(); }catch(_){}
      return 'boss';
    }
    const open=!!S.campaign?.flags?.puzzle_c1_ledger_seal;
    const hound=/hund|turm|pass/i.test(String(boss.label||'')) || onPassMap();
    if(!hound && !open){ showDialogue('Velka','Das Siegel hält noch. Erst neun, neun, neun. Dann das Ding dahinter.','mage'); return 'locked'; }
    if(hound){
      S.campaign.chapterIdx=1;
      S.campaign.flags=S.campaign.flags||{};
      S.campaign.flags.passField=true;
      S.campaign.dungeon=null;
    }
    try{ window.__game?.startFieldBoss?.(); }catch(_){}
    return 'boss';
  }
  const passGate=nearMark('pass');
  if(passGate && S?.campaign?.flags?.beat_lesser_fiend && !S.campaign.flags.passArrived){
    goToPass(S);
    return 'pass';
  }
  const solmir=nearMark('solmir');
  if(solmir && S?.campaign?.flags?.passArrived && !S.campaign.flags.solmirArrived){
    goToSolmir(S);
    return 'solmir';
  }
  const hunt=nearMark('hunt');
  if(hunt && !S?.campaign?.flags?.passWolf){
    try{ window.__game?.startFieldHunt?.(); }catch(_){}
    return 'hunt';
  }
  const seal=nearMark('puzzle');
  if(seal && window.__game?.openC1Seal){
    try{ window.__game.openC1Seal(); return 'seal'; }catch(_){}
  }
  if(openChestAt(f.x,f.y)) return 'chest';
  const door=(_map.doors||[]).find(d=>d.x===f.x&&d.y===f.y);
  if(door?.to){
    const dx=f.x-_hero.x, dy=f.y-_hero.y;
    tryMove(dx,dy);
    return 'door';
  }
  let best=null, bd=99;
  for(const n of _npcs){
    const d=Math.abs(Math.round(n.x)-_hero.x)+Math.abs(Math.round(n.y)-_hero.y);
    if(d<bd){ bd=d; best=n; }
  }
  if(best && bd<=2){
    if(best.sheet==='merchant' && _hooks.openShop){ try{ _hooks.openShop(best.name); return best.name; }catch(_){ } }
    talkTo(best.name); return best.name;
  }
  // v64: no free-text act — short look toast only
  try{ _hooks.toast?.('Nichts Auffälliges in der Nähe.'); }catch(_){}
  return null;
}

function tryMove(dx,dy){
  if(_hero.moving) return false;
  if(isDialogueOpen()) return false;
  const nx=_hero.x+dx, ny=_hero.y+dy;
  if(dx<0)_hero.dir=1; else if(dx>0)_hero.dir=2; else if(dy<0)_hero.dir=3; else if(dy>0)_hero.dir=0;
  const bump=_npcs.find(n=>Math.round(n.x)===nx && Math.round(n.y)===ny);
  if(bump){
    if(bump._mapEncounter){
      try{
        const S=_hooks.getS?.();
        _npcs=_npcs.filter(n=>n!==bump);
        _hooks.startEncounter?.(S, {fromMap:true, blurb:'Ein Gegner stellt sich dir in den Weg!'});
      }catch(_){}
      return false;
    }
    // merchant shop shortcut
    if(bump.sheet==='merchant' && _hooks.openShop){ try{ _hooks.openShop(bump.name); return false; }catch(_){ } }
    talkTo(bump.name); return false;
  }
  if(!walkable(nx,ny)) return false;
  // chests
  if(openChestAt(nx,ny)){ /* opened */ }
  const door=(_map.doors||[]).find(d=>d.x===nx&&d.y===ny);
  _hero.moving=true; _hero.x=nx; _hero.y=ny;
  recomputeFog();
  try{
    let surf='stone';
    try{
      const tile=(_map?.tiles?.[ny]?.[nx])||(_map?.ground?.[ny]?.[nx])||'';
      const kind=typeof tile==='string'?tile:(tile?.t||tile?.kind||'');
      const k=String(kind).toLowerCase();
      if(/grass|flower|tree|bush|dirt|path/.test(k)) surf='grass';
      else if(/water|shore|puddle|swamp/.test(k)) surf='water';
      else if(/floor|wood|carpet|plank|bridge|door/.test(k)) surf='wood';
      else if(/sand|ash|desert/.test(k)) surf='water';
      else surf='stone';
    }catch(_){}
    _audioApi?.stepSfx?.(surf);
  }catch(_){}
  if(door?.to){
    if(door.sideDungeon || /katakomb/i.test(String(door.to||''))){
      setTimeout(()=>{ try{ enterFieldDungeon(door.to); }catch(e){ console.warn('field-dung', e); } }, 60);
      return 'dung';
    }
    // v65: Herberge / Gasthof → real inn screen (rest + save), not empty interior
    if(/herberge|gasthof|gasthaus|\binn\b|taverne|wirtshaus/i.test(String(door.label||door.to||''))){
      try{ if(_hooks.openInn){ _hooks.openInn(); return 'inn'; } }catch(_){}
      try{ if(window.__game?.openInn){ window.__game.openInn(); return 'inn'; } }catch(_){}
    }
    if(door.exitInterior){
      setTimeout(()=>{
        try{
          const S=_hooks.getS?.();
          if(!S) return;
          const back=door.to || S._owReturn;
          const spawnX=S._owReturnDoor?.x;
          const spawnY=S._owReturnDoor?.y;
          S.world.scene.ort=back;
          S._owSpawn=(spawnX!=null)?{x:spawnX, y:(spawnY|0)+1}:null;
          delete S._owReturn; delete S._owReturnDoor;
          showOverworld(S);
          S._owSpawn=null;
          try{ _audioApi?.playSfx?.('ok'); }catch(_){}
        }catch(_){}
      }, 100);
    } else if(door.interior || String(door.to).startsWith('in:') || /\(innen\)/i.test(String(door.to))){
      setTimeout(()=>{
        try{
          const S=_hooks.getS?.();
          if(!S) return;
          const label=door.label||String(door.to).replace(/^in:/,'').replace(/\s*\(innen\)\s*/i,'').trim();
          const prev=S.world.scene.ort;
          S._owReturn=prev;
          S._owReturnDoor={x:door.returnX??door.x, y:door.returnY??door.y};
          const inn='in:'+label;
          S.world.scene.ort=inn;
          S.world.orte=S.world.orte||{};
          S.world.orte[inn]='Innenraum Zimmer Saal (innen)';
          S._owSpawn={x:Math.floor((_map.w||16)/2), y:(_map.h||14)-3};
          showOverworld(S);
          S._owSpawn=null;
          try{ _audioApi?.playSfx?.('ok'); }catch(_){}
          pushLog('Betritt '+label);
        }catch(e){ console.warn('interior-enter',e); }
      }, 80);
    } else if(_hooks.onLocation){
      setTimeout(()=>{ try{ _hooks.onLocation(door.to); }catch(_){ } }, 120);
    }
  }
  return true;
}

function stepHero(dt){
  if(!_hero.moving) return;
  const running=!!(_keys.Shift||_keys.ShiftLeft||_keys.ShiftRight);
  const speed=running?11:6;
  const dx=_hero.x-_hero.px, dy=_hero.y-_hero.py;
  const dist=Math.hypot(dx,dy);
  if(dist<0.05){ _hero.px=_hero.x; _hero.py=_hero.y; _hero.moving=false; _hero.frame=0; return; }
  const step=Math.min(dist, speed*dt);
  _hero.px+=dx/dist*step; _hero.py+=dy/dist*step;
  _animT+=dt; if(_animT>0.1){ _animT=0; _hero.frame=(_hero.frame+1)%4; }
}

/** Draw LPC 64×64 frame from 256×256 sheet (4 dirs × 4 frames) */
const WALK_LOOK={
  'Heldin Aria': {sheet:'princess', tint:'rgba(186,96,78,0.34)'},
  'Aria': {sheet:'princess', tint:'rgba(186,96,78,0.34)'},
  'Sekretärin Velka': {sheet:'mage', tint:'rgba(86,72,176,0.32)'},
  'Velka': {sheet:'mage', tint:'rgba(86,72,176,0.32)'},
  'General Brok': {sheet:'guard', tint:'rgba(92,102,70,0.28)'},
  'Brok': {sheet:'guard', tint:'rgba(92,102,70,0.28)'},
  'Wächter Toren': {sheet:'guard', tint:'rgba(58,104,150,0.36)'},
  'Toren': {sheet:'guard', tint:'rgba(58,104,150,0.36)'},
  'Rekrut Venn': {sheet:'villager', tint:'rgba(156,64,58,0.30)'},
  'Venn': {sheet:'villager', tint:'rgba(156,64,58,0.30)'},
  'Spionin Nyx': {sheet:'spy', tint:'rgba(18,16,28,0.40)'},
  'Nyx': {sheet:'spy', tint:'rgba(18,16,28,0.40)'},
  'Kundschafterin Lira': {sheet:'spy', tint:'rgba(46,118,78,0.34)'},
  'Lira': {sheet:'spy', tint:'rgba(46,118,78,0.34)'},
  'Händler Bram': {sheet:'merchant', tint:'rgba(138,96,48,0.32)'},
  'Bram': {sheet:'merchant', tint:'rgba(138,96,48,0.32)'},
  'Schmiedin Kael': {sheet:'merchant', tint:'rgba(176,78,36,0.36)'},
  'Kael': {sheet:'merchant', tint:'rgba(176,78,36,0.36)'},
  'Grabräuber Jex': {sheet:'spy', tint:'rgba(110,86,48,0.30)'},
  'Chronistin Mara': {sheet:'mage', tint:'rgba(120,90,140,0.28)'},
  'Hüter Orun': {sheet:'guard', tint:'rgba(130,130,120,0.26)'},
};
const _tintCache={};
function tintedSheet(src, tint){
  const key=src+'|'+tint;
  const cached=_tintCache[key];
  if(cached) return cached;
  const im=loadImg(src);
  if(!(im.complete && im.naturalWidth)) return im;
  const c=document.createElement('canvas');
  c.width=im.naturalWidth; c.height=im.naturalHeight;
  const g=c.getContext('2d');
  g.imageSmoothingEnabled=false;
  g.drawImage(im,0,0);
  g.globalCompositeOperation='source-atop';
  g.globalAlpha=0.45;
  g.fillStyle=tint;
  g.fillRect(0,0,c.width,c.height);
  g.globalAlpha=1;
  _tintCache[key]=c;
  return c;
}
function drawSprite(ctx, im, frame, dir, dx, dy, tw){
  const sw=im?.naturalWidth||im?.width||0;
  const sh=im?.naturalHeight||im?.height||0;
  if(!(sw>8 && sh>8)){
    ctx.fillStyle='#3a3428'; ctx.fillRect(dx+tw*0.2, dy+tw*0.15, tw*0.6, tw*1.0);
    return;
  }
  const fw=SPR, fh=SPR;
  const cols=Math.max(1, Math.floor(sw/fw));
  const rows=Math.max(1, Math.floor(sh/fh));
  const fr=frame%cols;
  // LPC sheet rows: 0=down, 1=left, 2=right, 3=up — matches our dir
  const d=Math.min(dir%4, rows-1);
  const drawH=tw*1.85, drawW=tw*1.2;
  const bob=(frame%2)?Math.round(tw*0.06):0;
  ctx.drawImage(im, fr*fw, d*fh, fw, fh, dx-(drawW-tw)*0.5, dy+(tw-drawH)+tw*0.05-bob, drawW, drawH);
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


function syncDayNight(){
  try{
    const S=_hooks.getS?.();
    const h=S?.cal?.hour??S?.time?.hour??12;
    if(h>=21||h<5) _dayTint='night';
    else if(h<7) _dayTint='dawn';
    else if(h>=18) _dayTint='dusk';
    else _dayTint='day';
  }catch(_){ _dayTint='day'; }
}
function tintColor(){
  if(_map?.preset==='wall'){
    return ({
      night:'rgba(24,36,58,.18)',
      dawn:'rgba(210,200,188,.08)',
      dusk:'rgba(64,82,104,.10)',
      day:'rgba(0,0,0,0)'
    })[_dayTint]||'rgba(0,0,0,0)';
  }
  return ({
    night:'rgba(18,28,70,.28)',
    dawn:'rgba(255,160,100,.18)',
    dusk:'rgba(180,110,80,.14)',
    day:'rgba(0,0,0,0)'
  })[_dayTint]||'rgba(0,0,0,0)';
}
function ensureWxParts(){
  if(_wxParts.length) return;
  for(let i=0;i<14;i++){
    _wxParts.push({x:Math.random(), y:Math.random(), s:0.6, v:0.15+Math.random()*0.2, a:0.18+Math.random()*0.12});
  }
}
function drawWeather(ctx, cssW, cssH, dt){
  let kind='klar';
  try{ kind=String(_hooks.getS?.()?.flags?.weather||'klar'); }catch(_){}
  // v48: never rain/snow/fog inside dungeon or interiors (genre bleed)
  if(_map && (_map.kind==='dungeon'||_map.kind==='interior')) return;
  if(kind==='klar'||kind==='none') return;
  ensureWxParts();
  for(const p of _wxParts){
    p.y += p.v*dt*(kind==='schnee'?0.4:1.2);
    p.x += (kind==='nebel'?0.05:0.02)*dt*(p.s);
    if(p.y>1){ p.y=0; p.x=Math.random(); }
    if(p.x>1) p.x=0;
    const x=p.x*cssW, y=p.y*cssH;
    if(kind==='regen'){ ctx.strokeStyle=`rgba(180,200,255,${p.a})`; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x-1,y+8*p.s); ctx.stroke(); }
    else if(kind==='schnee'){ ctx.fillStyle=`rgba(255,255,255,${p.a})`; ctx.beginPath(); ctx.arc(x,y,p.s,0,6.28); ctx.fill(); }
    else if(kind==='nebel'){ ctx.fillStyle=`rgba(200,210,220,${p.a*.06})`; ctx.fillRect(x-50,y-20,100,40); }
    else if(kind==='embers'){ ctx.fillStyle=`rgba(255,${120+p.s*40|0},60,${p.a})`; ctx.beginPath(); ctx.arc(x,y,p.s,0,6.28); ctx.fill(); }
  }
}

function draw(){
  if(!_ctx||!_canvas) return;
  const ctx=_ctx;
  const cssW=_canvas.width, cssH=_canvas.height;
  ctx.imageSmoothingEnabled=false;
  const _isDungeon=_map?.kind==='dungeon';
  const _indoorFill=(_isDungeon||_map?.kind==='interior');
  // v73: dungeons = solid near-black void (not purple cobble carpet)
  if(_isDungeon){
    ctx.fillStyle='#05060a'; ctx.fillRect(0,0,cssW,cssH);
  } else {
    const grd=ctx.createRadialGradient(cssW*0.5,cssH*0.45,cssW*0.08,cssW*0.5,cssH*0.5,cssW*0.75);
    if(_indoorFill){ grd.addColorStop(0,'#3a3550'); grd.addColorStop(0.45,'#2a2640'); grd.addColorStop(1,'#1a1628'); }
    else { grd.addColorStop(0,'#2a6a3a'); grd.addColorStop(0.55,'#143828'); grd.addColorStop(1,'#081410'); }
    ctx.fillStyle=grd; ctx.fillRect(0,0,cssW,cssH);
    ctx.globalAlpha=0.22;
    for(let i=0;i<120;i++){
      const x=((i*97)%cssW)|0, y=((i*57+13)%cssH)|0;
      ctx.fillStyle=_indoorFill?((i%3)?'#6a6088':'#a898c0'):((i%3)?'#4a8858':'#c8e0a0');
      ctx.fillRect(x,y,1+(i%2),1+(i%2));
    }
    ctx.globalAlpha=1;
  }

  // v65: map fills canvas — zoom into small interiors so void never letterboxes
  const dlgOpen = !!(typeof document!=='undefined' && document.body?.classList?.contains('ow-dialogue'));
  let viewH = _viewH, viewW = _viewW; let _rvW=viewW,_rvH=viewH;
  try{
    if(_map?.w && _map?.h){
      // v66: do NOT clamp viewH to map.h — that caused mobile black bars under short interiors
      // (tw locked by width → viewH*tw << cssH). OOB biome fill covers extra tiles.
      if(!_desktop){
        viewW = Math.min(viewW, Math.max(11, _map.w + 2));
      } else {
        // v69: FIXED gameplay camera — follow player at fitCanvas frustum (~40×22 @3×)
        // Never expand outdoor/pass to whole-map overview (tiny characters)
        const isPass = _map.preset==='wall' || /pass|grenze|berg|wild/i.test(String(_map.name||_map.preset||''));
        const isDungeonFollow = _map.kind==='dungeon' || /catacomb|ice_cave|relic_vault|bone_labyrinth|watch_dungeon|aether_rift/i.test(String(_map.preset||''));
        // v71: dungeons use same 3× follow camera as overworld (never zoom-out black border)
        const indoor = (_map.kind==='interior') && !isPass && !isDungeonFollow;
        if(indoor && _map.w && _map.h && _map.w <= viewW+4 && _map.h <= viewH+4){
          const aspect = Math.max(1.2, (cssW||960) / Math.max(1, cssH||540));
          viewH = Math.max(10, _map.h + 2);
          viewW = Math.max(12, _map.w + 2);
          if(viewW / viewH < aspect) viewW = Math.max(viewW, Math.ceil(viewH * aspect));
          else viewH = Math.max(viewH, Math.ceil(viewW / aspect));
        }
        if(_map.preset==='wall'){ viewW=18; viewH=10; }
      }
    }
  }catch(_){}
  _lastViewW=viewW; _lastViewH=viewH;
  // v66 PC: dialogue overlays; do not shrink camera
  let tw = Math.floor(Math.min(cssW/viewW, cssH/viewH));
  if(_desktop){
    // v69: integer contain (not cover) — keeps ~16px logical tiles; OOB paints gutters
    tw = Math.max(1, Math.floor(Math.min(cssW/viewW, cssH/viewH)));
  } else {
    const twH=Math.floor(cssH/viewH);
    if(twH*viewW <= cssW+8) tw=Math.max(tw, twH);
    if(tw*viewH < cssH && tw*viewW <= cssW+12){
      const bump=Math.ceil(cssH/viewH);
      if(bump*viewW <= cssW+14) tw=bump;
    }
  }
  let camX=_hero.px - viewW/2 + 0.5;
  let camY=_hero.py - viewH/2 + 0.5;
  try{
    if(_map?.w && _map?.h){
      if(_map.w > viewW) camX=Math.max(0, Math.min(_map.w - viewW, camX));
      else camX=(_map.w - viewW)/2;
      if(_map.h > viewH) camY=Math.max(0, Math.min(_map.h - viewH, camY));
      else camY=(_map.h - viewH)/2;
    }
  }catch(_){}
  const x0=Math.floor(camX)-1, y0=Math.floor(camY)-1;
  const x1=x0+viewW+3, y1=y0+viewH+3;
  const waterIm=loadImg(WATER_ANIM);
  // v69: contain centering — gutters get mountain/fog OOB, not negative crop
  const ox=Math.floor((cssW - viewW*tw)/2);
  let oy=Math.max(0, Math.floor((cssH - viewH*tw)/2));

  for(let y=y0;y<=y1;y++){
    for(let x=x0;x<=x1;x++){
      const sx=ox+(x-camX)*tw, sy=oy+(y-camY)*tw;
      if(y<0||x<0||y>=_map.h||x>=_map.w){
        // v65: extend biome — indoor castle floor (never flat black band)
        const indoor=_map.kind==='dungeon'||_map.kind==='interior';
        if(indoor){
          if(_map.kind==='dungeon'){
            // v73: OOB = solid dark void (not tiled purple rock carpet)
            ctx.fillStyle='#05060a'; ctx.fillRect(sx,sy,tw,tw);
          } else {
            const under=(_map.preset==='church'||_map.preset==='throne')?'stone':'stone';
            const gim=loadImg(tileUrl(under));
            if(gim.complete && gim.naturalWidth) ctx.drawImage(gim, sx, sy, tw, tw);
            else { ctx.fillStyle='#2a2438'; ctx.fillRect(sx,sy,tw,tw); }
            const edge=Math.min(1, Math.hypot(x-_hero.x, y-_hero.y)/28);
            ctx.fillStyle=`rgba(8,6,16,${0.12+edge*0.28})`; ctx.fillRect(sx,sy,tw,tw);
          }
        }
        else {
          // v69: pass OOB = snow + rock faces + dark fog vignette (NO pine wall filler)
          const useCliff = (_map.preset==='wall' || /pass|grenze|berg/i.test(String(_map.name||'')));
            if(useCliff){
            ctx.fillStyle='#e7eef4';
            ctx.fillRect(sx, sy, tw, tw);
          } else {
            const url = tileUrl('grass');
            const gim=loadImg(url);
            if(gim.complete && gim.naturalWidth) ctx.drawImage(gim, sx, sy, tw, tw);
            else { ctx.fillStyle='#2a6a34'; ctx.fillRect(sx,sy,tw,tw); }
          }
        }
        continue;
      }
      const k=fogKey(x,y);
      const seen=_explored.has(k), vis=_visible.has(k);
      if(!seen){
        // v47c/v73: unexplored — solid black in dungeons (not purple rock carpet)
        const indoor=_map.kind==='dungeon'||_map.kind==='interior';
        if(_map.kind==='dungeon'){
          ctx.fillStyle='#05060a'; ctx.fillRect(sx,sy,tw,tw);
        } else if(indoor){
          const gim=loadImg(tileUrl('floor'));
          if(gim.complete && gim.naturalWidth) ctx.drawImage(gim, sx, sy, tw, tw);
          else { ctx.fillStyle='#1a1520'; ctx.fillRect(sx,sy,tw,tw); }
          ctx.fillStyle='rgba(5,4,10,.55)'; ctx.fillRect(sx,sy,tw,tw);
        } else if(_map.preset==='wall' && paintPassTile(ctx,'sand',x,y,sx,sy,tw)){
          ctx.fillStyle='rgba(8,12,18,.45)'; ctx.fillRect(sx,sy,tw,tw);
        } else {
          const gim=loadImg(tileUrl('grass'));
          if(gim.complete && gim.naturalWidth) ctx.drawImage(gim, sx, sy, tw, tw);
          else { ctx.fillStyle='#1a3a22'; ctx.fillRect(sx,sy,tw,tw); }
          ctx.fillStyle='rgba(5,4,10,.72)'; ctx.fillRect(sx,sy,tw,tw);
        }
        continue;
      }
      const t=_map.tiles[y][x];
      // ground under solids / transparent decor — v65: indoor = floor (never outdoor grass in castle/crypt)
      const indoorHere=_map.kind==='dungeon'||_map.kind==='interior';
      const needsUnder = t!=='void' && t!=='wall' && t!=='floor' && t!=='carpet' && t!=='wood' && t!=='stone' && t!=='plaza' && t!=='path' && (SOLID.has(t) || t==='door' || t==='house' || t==='flower' || t==='bush' || t==='well' || t==='stall');
      if(needsUnder || t==='flower' || t==='bush' || t==='well' || t==='stall'){
        if(_map.preset==='wall' && !indoorHere){
          paintPassTile(ctx,'sand',x,y,sx,sy,tw);
        } else {
          const under = indoorHere ? 'floor' : 'grass';
          const gim=loadImg(tileUrl(under));
          if(gim.complete && gim.naturalWidth) ctx.drawImage(gim, sx, sy, tw, tw);
          else { ctx.fillStyle=indoorHere?'#2a2438':'#2a5a28'; ctx.fillRect(sx,sy,tw,tw); }
        }
      }
      if(t==='water' && _map.preset!=='wall' && waterIm.complete && waterIm.naturalWidth){
        const fw=16;
        ctx.drawImage(waterIm, (_waterFrame%4)*fw, 0, fw, fw, sx, sy, tw, tw);
      } else if(t==='flower' || t==='bush' || t==='stall' || t==='well'){
        // never draw well (blue) or stall (tiny cottage) as ground tiles
        if(t==='stall'){
          const pim=loadImg(tileUrl('path'));
          if(pim.complete && pim.naturalWidth) ctx.drawImage(pim, sx, sy, tw, tw);
        }
      } else if(_map.kind==='dungeon' && (t==='wall'||t==='void')){
        // v73: solid rock = pure dark void; edge walls get lit top face (FF 3/4)
        const walk=new Set(['floor','path','carpet','plaza','stone','door','water','sand','stairs']);
        let edge=false;
        for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
          if(walk.has(_map.tiles[y+dy]?.[x+dx])){ edge=true; break; }
        }
        if(!edge || t==='void'){
          ctx.fillStyle='#05060a'; ctx.fillRect(sx,sy,tw,tw);
        } else if(!paintNa(ctx,'wall',x,y,sx,sy,tw,tw)){
          ctx.fillStyle='#2c3a44'; ctx.fillRect(sx,sy,tw,tw);
          ctx.fillStyle='rgba(180,200,210,0.35)'; ctx.fillRect(sx, sy, tw, Math.max(2, tw*0.14));
        }
      } else if(_map.kind==='dungeon' && t==='door'){
        const crypt='./assets/pixel/tiles-na/cut/';
        const fl=loadImg(wangUrlFor('floor',x,y));
        if(fl.complete&&fl.naturalWidth) ctx.drawImage(fl,sx,sy,tw,tw);
        const dim=loadImg(crypt+'door.png');
        if(dim.complete&&dim.naturalWidth) ctx.drawImage(dim,sx,sy-tw*0.35,tw,tw*1.35);
        else { ctx.fillStyle='#c4a060'; ctx.fillRect(sx+tw*0.15,sy-tw*0.2,tw*0.7,tw*1.1); }
      } else if(_map.kind==='dungeon' && t==='stairs'){
        const crypt='./assets/pixel/tiles-na/cut/';
        const st=loadImg(crypt+'stairs.png');
        if(st.complete&&st.naturalWidth) ctx.drawImage(st,sx,sy,tw,tw);
        else {
          ctx.fillStyle='#9a9488'; ctx.fillRect(sx,sy,tw,tw);
          ctx.fillStyle='#5a564c';
          for(let i=0;i<4;i++) ctx.fillRect(sx+2, sy+2+i*(tw/4), tw-4, tw/6);
        }
      } else if(paintPassTile(ctx, t, x, y, sx, sy, tw)){
        /* snow cuts and rock lips, not the teal wall bricks */
      } else if(paintNa(ctx, t, x, y, sx, sy, tw, tw)){
        shadeField(ctx, t, x, y, sx, sy, tw);
      } else {
        const im=loadImg(wangUrlFor(t,x,y));
        if(im.complete && im.naturalWidth) ctx.drawImage(im, sx, sy, tw, tw);
        else {
          const im2=loadImg(tileUrl(t));
          if(im2.complete && im2.naturalWidth) ctx.drawImage(im2, sx, sy, tw, tw);
          else {
            ctx.fillStyle=t==='water'?'#3a7a9a':t==='void'?'#0a0c12':t==='wall'?'#444':t==='floor'?'#3a3a48':t==='path'?'#a88c5a':t==='house'||t==='stone'?'#6a5a4a':'#2a5a28';
            ctx.fillRect(sx,sy,tw,tw);
          }
        }
      }
      // flower overlay underlay — outdoor only (v65: never paint grass into castle/crypt)
      if(_map.preset!=='wall' && _map.overlay?.[y]?.[x]==='flower' && t!=='grass' && t!=='path' && t!=='plaza'){
        if(!(_map.kind==='interior'||_map.kind==='dungeon')){
          const gim=loadImg(tileUrl('grass'));
          if(gim.complete && gim.naturalWidth) ctx.drawImage(gim, sx, sy, tw, tw);
        }
      }
      // v44 autotile edge blend
      try{
        const C44=window.__game?.C44;
        if(C44?.neighborDiffMask && C44?.drawTileEdgeBlend){
          const mask=C44.neighborDiffMask(_map,x,y);
          if(mask) C44.drawTileEdgeBlend(ctx,sx,sy,tw,mask);
        }
      }catch(_){}
      // v62: soft irregular edge between differing walkable tiles
      try{
        if(t && t!=='void' && t!=='wall'){
          const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
          for(const [dx,dy] of dirs){
            const nx=x+dx, ny=y+dy;
            if(ny<0||nx<0||ny>=_map.h||nx>=_map.w) continue;
            const nt=_map.tiles[ny][nx];
            if(nt && nt!==t && nt!=='void' && _map.kind!=='dungeon' && _map.preset!=='throne' && _map.preset!=='wall'){
              ctx.fillStyle='rgba(0,0,0,0.18)';
              if(dx===1) ctx.fillRect(sx+tw-2, sy, 2, tw);
              if(dx===-1) ctx.fillRect(sx, sy, 2, tw);
              if(dy===1) ctx.fillRect(sx, sy+tw-2, tw, 2);
              if(dy===-1) ctx.fillRect(sx, sy, tw, 2);
            }
          }
        }
      }catch(_){}
      // v73: FF/CT 3/4 wall — lit top (already drawn) + tall dark front + shadow on floor
      try{
        if(_map.kind==='dungeon' && t==='wall'){
          const walk=new Set(['floor','path','carpet','plaza','stone','door','water','sand','stairs']);
          const southWalk=walk.has(_map.tiles[y+1]?.[x]);
          const anyWalk=[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>walk.has(_map.tiles[y+dy]?.[x+dx]));
          if(anyWalk){
            if(southWalk){
              const fh=tw*0.95;
              ctx.save();
              ctx.globalAlpha=0.95;
              if(!paintNa(ctx,'wall',x,y,sx, sy+tw*0.22, tw, fh)){
                ctx.fillStyle='#1c2830'; ctx.fillRect(sx, sy+tw*0.22, tw, fh);
              }
              ctx.restore();
              ctx.fillStyle='rgba(8,10,14,0.45)';
              ctx.fillRect(sx, sy+tw*0.22, tw, Math.max(2, tw*0.12));
              ctx.fillStyle='rgba(0,0,0,0.38)';
              ctx.fillRect(sx, sy+tw*0.95, tw, tw*0.28);
            } else {
              // side/north edges: short drop shadow only
              ctx.fillStyle='rgba(0,0,0,0.35)';
              ctx.fillRect(sx, sy+tw*0.75, tw, tw*0.35);
            }
          }
        } else if(_map.kind==='interior' && t==='wall'){
          const walk=new Set(['floor','path','carpet','plaza','stone','door','water','sand']);
          let edge=false;
          for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
            if(walk.has(_map.tiles[y+dy]?.[x+dx])){ edge=true; break; }
          }
          if(edge){
            if(!paintNa(ctx,'wall',x,y,sx, sy-tw*0.55, tw, tw*0.7)){
              ctx.fillStyle='#2c3a44'; ctx.fillRect(sx, sy-tw*0.45, tw, tw*0.6);
            }
            ctx.fillStyle='rgba(0,0,0,0.35)'; ctx.fillRect(sx, sy+tw*0.15, tw, tw*0.2);
          }
        }
        // pillars: plaza/stone columns beside carpet cast oval shadow
        if((_map.kind==='interior') && (t==='stone'||t==='plaza') && _map.tiles[y]?.[x-1]==='carpet'){
          ctx.fillStyle='rgba(0,0,0,0.28)';
          ctx.beginPath(); ctx.ellipse(sx+tw*0.5, sy+tw*0.85, tw*0.55, tw*0.22, 0, 0, Math.PI*2); ctx.fill();
          // tall pillar shaft
          ctx.fillStyle='rgba(90,92,110,0.95)';
          ctx.fillRect(sx+tw*0.25, sy-tw*1.6, tw*0.5, tw*1.7);
          ctx.fillStyle='rgba(200,190,160,0.5)';
          ctx.fillRect(sx+tw*0.25, sy-tw*1.65, tw*0.5, tw*0.12);
        }
      }catch(_){}
      // v70: tall height-shaded cliff faces (replace thin dark wang lips)
      try{
        if(_map.preset!=='wall' && (t==='stone'||t==='wall'||t==='cliff') && y+1<_map.h){
          const below=_map.tiles[y+1][x];
          if(below==='sand'||below==='path'||below==='grass'||below==='water'||below==='tree'){
            const faceH=tw*1.85;
            // snow cap
            ctx.fillStyle='rgba(236,242,252,0.98)';
            ctx.fillRect(sx, sy+tw*0.15, tw, Math.max(4,tw*0.18));
            // rock strata
            ctx.fillStyle='rgba(110,118,132,0.98)';
            ctx.fillRect(sx, sy+tw*0.32, tw, faceH*0.22);
            ctx.fillStyle='rgba(72,78,92,0.98)';
            ctx.fillRect(sx, sy+tw*0.32+faceH*0.22, tw, faceH*0.28);
            ctx.fillStyle='rgba(42,46,58,0.98)';
            ctx.fillRect(sx, sy+tw*0.32+faceH*0.50, tw, faceH*0.28);
            ctx.fillStyle='rgba(16,18,26,0.98)';
            ctx.fillRect(sx, sy+tw*0.32+faceH*0.78, tw, faceH*0.28);
            // snow drips
            ctx.fillStyle='rgba(210,220,235,0.7)';
            for(let i=0;i<4;i++) ctx.fillRect(sx+(i+0.2)*(tw/4), sy+tw*0.32, Math.max(2,tw*0.1), tw*(0.2+((x+i)&1)*0.12));
            // shadow on snow below
            ctx.fillStyle='rgba(4,6,12,0.48)';
            ctx.fillRect(sx, sy+tw, tw, tw*0.55);
            // jagged toe
            ctx.fillStyle='rgba(28,30,40,0.9)';
            for(let i=0;i<6;i++){
              const jh = tw*(0.12 + ((x*5+i*3+y)&3)*0.05);
              ctx.fillRect(sx+i*(tw/6), sy+tw*0.32+faceH-jh, tw/6+1, jh);
            }
          }
        }
      }catch(_){}
      const ov=_map.overlay?.[y]?.[x];
      if(ov && DECOR[ov] && !String(ov).startsWith('house') && !/^d\d$/.test(String(ov))){
        const dim=loadImg(DECOR[ov]);
        if(dim.complete && dim.naturalWidth){
          let dw=tw*0.85, dh=tw*0.85, ox=0, oy=0;
          if(ov==='bush'||ov==='tree'){ dw=tw; dh=tw; }
          else if(ov==='pine'||ov==='pine2'||ov==='pine3'){ dw=tw*1.6; dh=tw*2.4; oy=-tw*1.2; }
          else if(ov==='pine_tall'){ dw=tw*1.7; dh=tw*3.0; oy=-tw*1.7; }
          else if(ov==='dead_bush'){ dw=tw*1.1; dh=tw*1.0; oy=-tw*0.15; }
          else if(ov==='footprints'){ dw=tw*0.9; dh=tw*0.5; oy=tw*0.35; }
          else if(ov==='campfire'){ dw=tw*1.1; dh=tw*1.1; }
          else if(ov==='coffin'){ dw=tw*1.5; dh=tw*0.9; }
          else if(ov==='rock'){ dw=tw*1.2; dh=tw*0.9; }
          else if(ov==='snowdrift'){ dw=tw*1.8; dh=tw*0.7; oy=tw*0.3; }
          else if(/^glass_/.test(ov)){ dw=tw; dh=tw*1.4; oy=-tw*0.2; }
          else if(ov==='throne_chair'||ov==='altar'){ dw=tw*1.8; dh=tw*2; oy=-tw; }
          ctx.drawImage(dim, sx+(tw-dw)/2+ox, sy+(tw-dh)/2+oy, dw, dh);
        }
      }
      if(!vis){
        // soft explored-but-not-visible veil
        ctx.fillStyle='rgba(5,4,10,.22)'; ctx.fillRect(sx,sy,tw,tw);
      } else {
        // v50: softer dungeon FoW edges — wider band, gentler peak, biome-tinted
        const dist=Math.hypot(x-_hero.x, y-_hero.y);
        const isDungeon=/dungeon|kerker|höhle|interior|gruft|bunker|katakomb/.test(String(_map?.kind||_map?.preset||_map?.name||''));
        const R=_desktop?(isDungeon?18:15):Math.max(17, Math.ceil(Math.max(_viewW||13,_viewH||15)*0.58));
        const band=isDungeon?6:5.5;
        if(dist > R-band){
          const t=Math.min(1, (dist-(R-band))/band);
          const ease=t*t*(3-2*t); // smoothstep
          const a=ease*(isDungeon?0.12:0.24);
          ctx.fillStyle=`rgba(6,8,14,${a.toFixed(3)})`;
          ctx.fillRect(sx,sy,tw,tw);
        }
      }
    }
  }

  for(const n of _npcs){
    const k=fogKey(Math.round(n.x), Math.round(n.y));
    if(!_visible.has(k)) continue;
    const sx=ox+(n.px-camX)*tw, sy=oy+(n.py-camY)*tw - tw*0.55;
    if(n._mapEncounter && n._encImg){
      const mim=loadImg(n._encImg);
      if(mim.complete&&mim.naturalWidth){
        ctx.drawImage(mim, 0, 0, Math.min(32,mim.naturalWidth), Math.min(32,mim.naturalHeight), sx, sy+tw*0.15, tw, tw);
      } else {
        ctx.fillStyle='#c44'; ctx.fillRect(sx+tw*0.2, sy+tw*0.3, tw*0.6, tw*0.6);
      }
    } else {
      const look=WALK_LOOK[n.name];
      const sheet=look?.sheet||n.sheet;
      const src=NPC_SHEETS[sheet]||NPC_SHEETS.default;
      const im=look?.tint ? tintedSheet(src, look.tint) : loadImg(src);
      const stepping=Math.abs(n.x-n.px)+Math.abs(n.y-n.py)>0.15;
      const fr=stepping ? ((n.frame|0)%4) : ((_animFrame>>4)%2);
      drawSprite(ctx, im, fr, n.dir|0, sx, sy, tw);
    }
  }

  const him=loadImg('./assets/pixel/hero/walk.png');
  const hx=ox+(_hero.px-camX)*tw, hy=oy+(_hero.py-camY)*tw - tw*0.55;
  // entity shadows
  const sh=loadImg(DECOR.shadow);
  if(sh.complete && sh.naturalWidth){
    ctx.drawImage(sh, hx+tw*0.1, hy+tw*0.85, tw*0.8, tw*0.35);
    for(const n of _npcs){
      const k=fogKey(Math.round(n.x), Math.round(n.y));
      if(!_visible.has(k)) continue;
      const nsx=ox+(n.px-camX)*tw, nsy=oy+(n.py-camY)*tw - tw*0.55;
      ctx.drawImage(sh, nsx+tw*0.1, nsy+tw*0.85, tw*0.8, tw*0.35);
    }
  }
  drawSprite(ctx, him, _hero.frame, _hero.dir, hx, hy, tw);
  // One nameplate: the person being talked to, otherwise the nearest neighbour.
  try{
    const speaking=isDialogueOpen() ? String(document.getElementById('owDlgName')?.textContent||'') : '';
    let pick=null, best=1.6;
    for(const n of _npcs){
      if(n._mapEncounter) continue;
      const k=fogKey(Math.round(n.x), Math.round(n.y));
      if(!_visible.has(k)) continue;
      if(speaking && speaking!=='…' && (n.name===speaking || speaking.includes(n.name) || n.name.includes(speaking))){ pick=n; break; }
      const d=Math.hypot((n.px||n.x)-_hero.px,(n.py||n.y)-_hero.py);
      if(d<best){ best=d; pick=n; }
    }
    if(pick && !speaking){
      const nsx=ox+(pick.px-camX)*tw, nsy=oy+(pick.py-camY)*tw - tw*0.55;
      let label=pick.name||'';
      try{
        const Know=window.__game?.Know;
        const S=_hooks.getS?.();
        const ROLE={guard:'Wächter',mage:'Gelehrte',merchant:'Händler',spy:'Vermummte',villager:'Passant',daemon:'Gestalt',princess:'Edelfrau'};
        const named=speaking && (pick.name===speaking || speaking.includes(pick.name) || pick.name.includes(speaking));
        if(named) label=speaking;
        else if(!(Know?.isNameKnown?.(S, pick.name))) label=ROLE[pick.sheet]||label;
      }catch(_){}
      label=String(label||'').trim();
      if(label.length>18) label=label.split(/\s+/).slice(0,2).join(' ');
      if(label){
        const sc=Math.max(1, _intScale||1);
        const fontPx=Math.max(8, Math.round(18/sc));
        const pad=Math.max(2, Math.round(4/sc));
        const boxH=Math.max(10, Math.round(16/sc));
        ctx.font=`bold ${fontPx}px "Noto Sans",system-ui,sans-serif`;
        const twm=ctx.measureText(label).width;
        const labelBase=nsy-tw*1.15;
        ctx.fillStyle='rgba(8,6,14,.78)';
        ctx.fillRect(nsx+tw/2-twm/2-pad, labelBase-boxH, twm+pad*2, boxH);
        ctx.fillStyle='#ffe8a0';
        ctx.fillText(label, nsx+tw/2-twm/2, labelBase-Math.max(2, Math.round(3/sc)));
      }
    }
  }catch(_){}

  // v74: interaction prompt (NPC / chest / door under face tile)
  try{
    const f=facingTile();
    let label='';
    const npc=_npcs.find(n=>Math.round(n.x)===f.x&&Math.round(n.y)===f.y);
    if(npc) label='E · Sprechen';
    else if(_chests.some(c=>!c.open&&c.x===f.x&&c.y===f.y)) label='E · Truhe öffnen';
    else if((_map.doors||[]).some(d=>d.x===f.x&&d.y===f.y)) label='E · Durchgang';
    else if(_map.tiles?.[f.y]?.[f.x]==='stairs') label='E · Treppe';
    if(label){
      const px=ox+(f.x-camX)*tw+tw*0.5, py=oy+(f.y-camY)*tw-6;
      ctx.font='bold '+Math.max(11, Math.floor(tw*0.55))+'px monospace';
      ctx.textAlign='center';
      ctx.fillStyle='rgba(10,8,18,0.75)';
      const w=ctx.measureText(label).width+12;
      ctx.fillRect(px-w/2, py-16, w, 18);
      ctx.strokeStyle='#e8c86a'; ctx.strokeRect(px-w/2, py-16, w, 18);
      ctx.fillStyle='#ffe9a8'; ctx.fillText(label, px, py-3);
      ctx.textAlign='left';
    }
  }catch(_){}

  // animated overlays (torches, flowers, smoke, fountain)
  for(const a of _animators){
    const k=fogKey(a.x,a.y);
    if(!_explored.has(k)) continue;
    if(a.kind==='flower' || a.kind==='fountain'){
      // v46: skip flower anim (overlay already shows flower); fountain was blue blob at spawn
      if(a.kind==='flower') continue;
      if(a.kind==='fountain') continue;
    }
    const src=ANIM[a.kind]; if(!src) continue;
    const im=loadImg(src);
    if(!(im.complete && im.naturalWidth)) continue;
    const sx=ox+(a.x-camX)*tw, sy=oy+(a.y-camY)*tw;
    const fw=16, fr=_animFrame%4;
    const alpha=_visible.has(k)?1:0.45;
    ctx.globalAlpha=alpha;
    ctx.drawImage(im, fr*fw, 0, fw, fw, sx, sy, tw, tw);
    ctx.globalAlpha=1;
  }

  // v73: warm light pools around dungeon torches (FF crypt readability)
  if(_map?.kind==='dungeon'){
    for(const a of _animators){
      if(a.kind!=='torch') continue;
      const k=fogKey(a.x,a.y);
      if(!_explored.has(k)) continue;
      const cx=ox+(a.x-camX+0.5)*tw, cy=oy+(a.y-camY+0.35)*tw;
      const R=tw*3.2;
      const g=ctx.createRadialGradient(cx,cy,tw*0.15, cx,cy,R);
      g.addColorStop(0,'rgba(255,200,110,0.42)');
      g.addColorStop(0.35,'rgba(255,140,60,0.18)');
      g.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.fill();
    }
  }

  // overhead big buildings (drawn above ground, soft depth)
  for(const oh of _overhead){
    const im=loadImg(oh.src);
    if(!(im.complete && im.naturalWidth)) continue;
    // visibility: any tile of footprint explored
    let seen=false, vis=false;
    for(let j=0;j<(oh.th||3);j++) for(let i=0;i<(oh.tw||3);i++){
      const k=fogKey(oh.x+i, oh.y+j);
      if(_explored.has(k)) seen=true;
      if(_visible.has(k)) vis=true;
    }
    if(!seen) continue;
    const sx=ox+(oh.x-camX)*tw, sy=oy+(oh.y-camY)*tw - tw*0.15;
    // v30: keep buildings legible at night (never too dim)
    const night=_dayTint==='night'||_dayTint==='dusk';
    ctx.globalAlpha=vis?(night?0.95:1):(night?0.7:0.5);
    let dw=(oh.tw||3)*tw, dh=(oh.th||3)*tw;
    // v62: tall landmarks keep sprite aspect (watchtower/pine)
    if(/watchtower|pine|throne_chair|altar|pine_tall/.test(String(oh.src||oh.label||''))){
      const aspect=im.naturalHeight/Math.max(1,im.naturalWidth);
      dw=(oh.tw||3)*tw;
      dh=dw*aspect;
      // sit on footprint bottom
      const footY=oy+(oh.y+(oh.th||3)-camY)*tw;
      ctx.drawImage(im, sx, footY-dh, dw, dh);
    } else {
      ctx.drawImage(im, sx, sy, dw, dh);
    }
    ctx.globalAlpha=1;
  }

  // v45d: no canvas location plaque (HUD chip covers ort — was duplicate/clip banner)
  // day/night tint + weather (tint only lit tiles; keep unexplored pure dark)
  syncDayNight();
  const tc=(_map?.kind==='dungeon')?null:tintColor();
  if(tc && !tc.endsWith(',0)')){
    for(let y=y0;y<=y1;y++){
      for(let x=x0;x<=x1;x++){
        if(y<0||x<0||y>=_map.h||x>=_map.w) continue;
        if(!_explored.has(fogKey(x,y))) continue;
        const sx=ox+(x-camX)*tw, sy=oy+(y-camY)*tw;
        ctx.fillStyle=tc; ctx.fillRect(sx,sy,tw,tw);
      }
    }
  }
  drawWeather(ctx, cssW, cssH, 0.016);
  // v47c: re-veil unexplored after tint — keep grass under soft charcoal (never pure black squares/letterbox)
  for(let y=y0;y<=y1;y++){
    for(let x=x0;x<=x1;x++){
      const sx=ox+(x-camX)*tw, sy=oy+(y-camY)*tw;
      const indoor=_map.kind==='dungeon'||_map.kind==='interior';
      if(y<0||x<0||y>=_map.h||x>=_map.w){
        if(_map.kind==='dungeon'){ ctx.fillStyle='#05060a'; ctx.fillRect(sx,sy,tw,tw); }
        else if(indoor){ ctx.fillStyle='#0a0c12'; ctx.fillRect(sx,sy,tw,tw); }
        else { ctx.fillStyle='rgba(5,4,10,.28)'; ctx.fillRect(sx,sy,tw,tw); }
        continue;
      }
      if(!_explored.has(fogKey(x,y))){
        if(_map.kind==='dungeon'){ ctx.fillStyle='#05060a'; ctx.fillRect(sx,sy,tw,tw); }
        else if(indoor){ ctx.fillStyle='#12141c'; ctx.fillRect(sx,sy,tw,tw); ctx.fillStyle='rgba(5,4,10,.72)'; ctx.fillRect(sx,sy,tw,tw); }
        else {
          const gim=loadImg(tileUrl('grass'));
          if(gim.complete && gim.naturalWidth) ctx.drawImage(gim, sx, sy, tw, tw);
          else { ctx.fillStyle='#1a3a22'; ctx.fillRect(sx,sy,tw,tw); }
          ctx.fillStyle='rgba(5,4,10,.72)'; ctx.fillRect(sx,sy,tw,tw);
        }
      }
    }
  }
  // v66: glass light shafts (cathedral) always; lamp bloom at dusk/night
  for(const L of _lights){
    const k=fogKey(Math.floor(L.x), Math.floor(L.y));
    if(!_explored.has(k)) continue;
    const sx=ox+(L.x-camX)*tw, sy=oy+(L.y-camY)*tw;
    if(L.shaft || L.color==='glass'){
      const hue=String(L.hue||'glass_gold');
      const col=hue.includes('blue')?'120,170,255':hue.includes('red')?'255,120,140':hue.includes('green')?'140,220,150':'255,210,120';
      ctx.globalCompositeOperation='lighter';
      // angled shaft into the nave
      const sh=ctx.createLinearGradient(sx, sy-tw, sx+tw*2.2, sy+tw*5);
      sh.addColorStop(0, `rgba(${col},0.22)`);
      sh.addColorStop(0.45, `rgba(${col},0.08)`);
      sh.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle=sh;
      ctx.beginPath();
      ctx.moveTo(sx-tw*0.2, sy-tw*0.4);
      ctx.lineTo(sx+tw*0.9, sy-tw*0.5);
      ctx.lineTo(sx+tw*2.8, sy+tw*5.5);
      ctx.lineTo(sx+tw*0.6, sy+tw*5.5);
      ctx.closePath(); ctx.fill();
      const rg=ctx.createRadialGradient(sx,sy,0,sx,sy,(L.r||3)*tw);
      rg.addColorStop(0, `rgba(${col},0.16)`);
      rg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle=rg; ctx.beginPath(); ctx.arc(sx,sy,Math.min((L.r||3)*tw*0.55, tw*2.2),0,Math.PI*2); ctx.fill();
      ctx.globalCompositeOperation='source-over';
      continue;
    }
    if(_dayTint==='night' || _dayTint==='dusk'){
      const r=(L.r||2.5)*tw;
      const g=ctx.createRadialGradient(sx,sy,0,sx,sy,r);
      g.addColorStop(0, 'rgba(255,200,120,0.07)');
      g.addColorStop(0.45, 'rgba(255,160,60,0.02)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalCompositeOperation='lighter';
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(sx,sy,Math.min(r*0.35, tw*1.1),0,Math.PI*2); ctx.fill();
      ctx.globalCompositeOperation='source-over';
    }
  }
  // quest markers — v48: never float in void / unexplored / unwalkable
  for(const m of _questMarks){
    if(m.x<0||m.y<0||m.x>=_map.w||m.y>=_map.h) continue;
    const tt=_map.tiles[m.y]?.[m.x];
    if(!tt || tt==='void' || tt==='wall' || SOLID.has(tt)) continue;
    if(!_explored.has(fogKey(m.x,m.y))) continue;
    if(!_visible.has(fogKey(m.x,m.y))) continue;
    if(m.soft || m.kind==='hint'){
      if(Math.hypot(m.x-_hero.x, m.y-_hero.y)>5) continue;
    }
    // v49: dungeon/interior — exact NPC/chest/door only
    if(_map.kind==='dungeon'||_map.kind==='interior'){
      const onNpc=_npcs.some(n=>Math.round(n.x)===m.x&&Math.round(n.y)===m.y);
      const onChest=_chests.some(c=>!c.open&&c.x===m.x&&c.y===m.y);
      const onDoor=(_map.doors||[]).some(d=>d.x===m.x&&d.y===m.y);
      if(!(onNpc||onChest||onDoor)) continue;
    }
    if(_npcs.some(n=>Math.round(n.x)===m.x && Math.round(n.y)===m.y)) continue;
    const sx=ox+(m.x-camX)*tw+tw/2, sy=oy+(m.y-camY)*tw+tw*0.22;
    const s=Math.max(3, Math.round(tw*0.14));
    ctx.fillStyle=m.kind==='done'?'#9aa4ae':'#e2c36a';
    ctx.beginPath();
    ctx.moveTo(sx, sy-s);
    ctx.lineTo(sx+s*0.72, sy);
    ctx.lineTo(sx, sy+s);
    ctx.lineTo(sx-s*0.72, sy);
    ctx.closePath();
    ctx.fill();
  }
  // open chests visual (empty)
  for(const c of _chests){
    if(!c.open) continue;
    if(!_explored.has(fogKey(c.x,c.y))) continue;
    const sx=ox+(c.x-camX)*tw, sy=oy+(c.y-camY)*tw;
    ctx.fillStyle='rgba(0,0,0,0.35)'; ctx.fillRect(sx,sy,tw,tw);
  }
  // v44 studio lighting: vignette + hero key light
  try{
    const C44=window.__game?.C44;
    if(C44?.drawOwLighting){
      C44.drawOwLighting(ctx, cssW, cssH, {x:hx+tw*0.5, y:hy+tw*0.6, r:tw*2.0}, _dayTint); // v48 softer key light
    }
  }catch(_){}
  // v42 region minimap from real OW tilemap (throttled)
  if((++_mmTick)%8===0){
    try{
      window.__game?.C42?.renderOwRegionMinimap?.(
        {w:_map.w,h:_map.h,tiles:_map.tiles,name:_map.name},
        {x:Math.round(_hero.x), y:Math.round(_hero.y)},
        {name:_map.name, fog:(x,y)=>!_explored.has(fogKey(x,y))}
      );
    }catch(_){}
  }
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
      confirmDialogue();
    }
    if(edge('b',1) || edge('start',9)){ // B/Start menu
      try{ _hooks.openMenu?.(); }catch(_){}
      try{ document.getElementById('btnMenu')?.click(); }catch(_){}
    }
    if(edge('y',3)){ // Y → Reisekarte (PC, kein Freitext)
      try{ _hooks.openTravel?.(); }catch(_){}
    }
  }catch(_){}
}


function phaseNow(){
  try{
    const h=_hooks.getS?.()?.cal?.hour|0;
    if(h>=5&&h<11) return 'morgen';
    if(h>=11&&h<14) return 'mittag';
    if(h>=14&&h<18) return 'nachmittag';
    if(h>=18&&h<22) return 'abend';
    return 'nacht';
  }catch(_){ return 'tag'; }
}

function calendarSlot(n, hour){
  const cal=n.calendar||{};
  const h=(hour|0);
  // Clock-driven daily routine: sleep → work → plaza → tavern → sleep
  if(h>=22 || h<5) return cal.sleep||cal.home||n.home;
  if(h>=5 && h<8) return cal.home||n.home;
  if(n.pace==='shop' || n.roleHint==='merchant'){
    if(h>=8 && h<18) return cal.work||n.home;
    if(h>=18 && h<22) return cal.tavern||cal.plaza||n.home;
  }
  if(n.pace==='patrol' || n.roleHint==='guard'){
    if(h>=6 && h<20) return null; // patrol waypoints
    return cal.sleep||n.home;
  }
  if(n.pace==='study' || n.roleHint==='mage'){
    if(h>=9 && h<17) return cal.work||cal.plaza;
    if(h>=17 && h<21) return cal.tavern||cal.home;
    return cal.sleep||n.home;
  }
  // villagers
  if(h>=8 && h<12) return cal.work||cal.plaza||n.home;
  if(h>=12 && h<14) return cal.tavern||cal.plaza;
  if(h>=14 && h<18) return cal.plaza||cal.work;
  if(h>=18 && h<22) return cal.tavern||cal.home;
  return cal.home||n.home;
}
function stepNpcs(dt){
  if(isDialogueOpen()){
    for(const n of _npcs){
      n.px+=(n.x-n.px)*Math.min(1, dt*8);
      n.py+=(n.y-n.py)*Math.min(1, dt*8);
    }
    return;
  }
  const phase=phaseNow();
  let hour=12;
  try{ const raw=_hooks.getS?.()?.cal?.hour; if(raw!=null && raw!=='') hour=Number(raw)|0; }catch(_){}
  for(const n of _npcs){
    if(n.pace==='idle' || n.pace==='still'){
      n.px+=(n.x-n.px)*Math.min(1, dt*8);
      n.py+=(n.y-n.py)*Math.min(1, dt*8);
      continue;
    }
    n.wait=(n.wait||0)-dt;
    let target=null;
    const wps=n.waypoints||[];
    const slot=calendarSlot(n, hour);
    if(slot){
      target=slot;
      n._calSlot = (hour>=22||hour<5)?'sleep':(hour>=18?'tavern':(hour>=8&&hour<18?'work':'home'));
    } else if(n.wait<=0 && wps.length){
      n.wp=((n.wp|0)+1)%wps.length;
      target=wps[n.wp];
      n.wait = n.pace==='patrol' ? 0.55+Math.random()*1.0 : 1.4+Math.random()*2.8;
      n._calSlot='patrol';
    }
    if(target && !_hero.moving){
      const tx=Math.round(target.x), ty=Math.round(target.y);
      const cx=Math.round(n.x), cy=Math.round(n.y);
      if(cx!==tx || cy!==ty){
        let dx=Math.sign(tx-cx), dy=Math.sign(ty-cy);
        if(Math.random()<0.45) { if(Math.abs(tx-cx)>=Math.abs(ty-cy)) dy=0; else dx=0; }
        else { if(Math.abs(tx-cx)<Math.abs(ty-cy)) dx=0; else dy=0; }
        const nx=cx+dx, ny=cy+dy;
        if(walkable(nx,ny) && !_npcs.some(o=>o!==n&&Math.round(o.x)===nx&&Math.round(o.y)===ny) && !(nx===_hero.x&&ny===_hero.y)){
          if(dx<0)n.dir=1; else if(dx>0)n.dir=2; else if(dy<0)n.dir=3; else n.dir=0;
          n.x=nx; n.y=ny; n.frame=(n.frame+1)%4;
        }
      } else if(n._calSlot==='sleep' && Math.random()<0.01){
        /* idle at bed */
      }
    } else if(Math.random()<0.002){
      const d=[[1,0],[-1,0],[0,1],[0,-1]][(Math.random()*4)|0];
      const nx=Math.round(n.x)+d[0], ny=Math.round(n.y)+d[1];
      if(walkable(nx,ny) && !_npcs.some(o=>o!==n&&Math.round(o.x)===nx&&Math.round(o.y)===ny) && !(nx===_hero.x&&ny===_hero.y)){
        if(d[0]<0)n.dir=1; else if(d[0]>0)n.dir=2; else if(d[1]<0)n.dir=3; else n.dir=0;
        n.x=nx; n.y=ny; n.frame=(n.frame+1)%4;
      }
    }
    n.px+=(n.x-n.px)*Math.min(1,dt*8); n.py+=(n.y-n.py)*Math.min(1,dt*8);
  }
}

function openChestAt(x,y){
  const c=_chests.find(ch=>ch.x===x&&ch.y===y && !ch.open);
  if(!c) return false;
  c.open=true;
  try{
    const S=_hooks.getS?.();
    if(S){
      S.flags=S.flags||{};
      S.flags.chests=S.flags.chests||{};
      S.flags.chests[c.id]=1;
      const loot=c.loot||{gold:5+((Math.random()*12)|0)};
      if(loot.gold){ S.st=S.st||{}; S.st.gold=(S.st.gold|0)+(loot.gold|0); }
      if(loot.item){ S.inv=S.inv||[]; S.inv.push({id:loot.item,name:loot.item,qty:1}); }
      const msg='Truhe: '+(loot.gold?('+'+loot.gold+' Gold'):'')+(loot.item?((loot.gold?', ':'')+loot.item):'');
      pushLog(msg);
      try{ _hooks.toast?.(msg); }catch(_){}
      try{ _audioApi?.playSfx?.('fanfare') || _audioApi?.playSfx?.('ok'); }catch(_){}
      try{
        // v74: short chest fanfare toast
        _hooks.toast?.('✦ '+msg);
        const el=document.createElement('div');
        el.className='ow-chest-fanfare';
        el.textContent='✦ '+msg;
        el.style.cssText='position:fixed;left:50%;top:28%;transform:translate(-50%,-50%);z-index:80;padding:10px 18px;background:#1a1428ee;border:2px solid #e8c86a;color:#ffe9a8;font:700 16px/1.3 monospace;border-radius:8px;pointer-events:none';
        document.body.appendChild(el);
        setTimeout(()=>el.remove(),1600);
      }catch(_){}
      try{ _hooks.save?.(); }catch(_){}
    }
  }catch(_){}
  // clear overlay chest art → open look via darken
  try{ if(_map.overlay?.[y]) _map.overlay[y][x]='crate'; }catch(_){}
  return true;
}


function _walkablePinNear(cx,cy){
  if(!_map?.tiles) return {x:cx|0,y:cy|0};
  const h=_map.h, w=_map.w;
  for(let r=0;r<8;r++){
    for(let dy=-r;dy<=r;dy++) for(let dx=-r;dx<=r;dx++){
      const x=Math.max(1,Math.min(w-2,(cx|0)+dx)), y=Math.max(1,Math.min(h-2,(cy|0)+dy));
      const tt=_map.tiles[y][x];
      if(tt && tt!=='void' && tt!=='wall' && !SOLID.has(tt)) return {x,y};
    }
  }
  return {x:cx|0,y:cy|0};
}
function resolveQuestMarker(S, mark, label, kind){
  if(!mark) return null;
  if(typeof mark.x==='number' && typeof mark.y==='number'){
    return {x:mark.x|0, y:mark.y|0, label, kind:mark.kind||kind};
  }
  if(mark.npc){
    const want=String(mark.npc).toLowerCase();
    const npc=_npcs.find(n=>n.name===mark.npc || String(n.name).toLowerCase().includes(want.slice(0,5)) || want.includes(String(n.name).toLowerCase().slice(0,5)));
    if(npc) return {x:Math.round(npc.x), y:Math.round(npc.y), label, kind:'npc'};
    // NPC not on this map — drop a hint pin at plaza so the mark still comes from quest data
    return null; // v49: no soft NPC hint pins
  }
  if(mark.ort){
    const o=String(mark.ort).toLowerCase();
    const door=(_map.doors||[]).find(d=>{
      const blob=(String(d.to||'')+' '+String(d.label||'')).toLowerCase();
      return blob.includes(o.slice(0,5)) || o.includes(blob.slice(0,5));
    });
    if(door) return {x:door.x, y:door.y, label, kind:'door'};
    const mapName=String(_map?.name||'').toLowerCase();
    if(mapName.includes(o.slice(0,5)) || o.includes(mapName.slice(0,5))){
      { const p=_walkablePinNear((_map.w/2)|0, (_map.h/2)|0); return {x:p.x, y:p.y, label, kind:'ort'}; }
    }
    // Different region — still show soft pin derived from quest.ort (not text heuristic)
    return null; // v49: no soft ort pins
  }
  if(mark.chest && _chests[0]) return {x:_chests[0].x,y:_chests[0].y,label,kind:'chest'};
  return null;
}
function rebuildQuestMarks(S){
  _questMarks=[];
  if(!S?.quests) return;
  const marks=[];
  const main=S.quests.main;
  if(main){
    const left=(main.objectives||[]).filter(o=>!(main.done||[]).includes(o));
    const objMarks=main.objectiveMarks||[];
    left.slice(0,4).forEach((o,i)=>{
      const explicit=objMarks[i] || (typeof o==='object'?o.marker:null) || main.marker;
      let hit=resolveQuestMarker(S, explicit, typeof o==='string'?o:(o.label||o.id||'Ziel'), 'main');
      if(!hit && explicit?.npc){
        const npc=_npcs.find(n=>String(n.name).toLowerCase().includes(String(explicit.npc).toLowerCase().slice(0,4)));
        if(npc) hit={x:Math.round(npc.x),y:Math.round(npc.y),label:String(o),kind:'npc'};
      }
      if(!hit){
        // Soft fallback: only if objective text literally contains a present NPC name
        const blob=String(o).toLowerCase();
        const npc=_npcs.find(n=>blob.includes(String(n.name).toLowerCase()));
        if(npc) hit={x:Math.round(npc.x),y:Math.round(npc.y),label:String(o),kind:'npc'};
      }
      if(hit){
        const tt=_map?.tiles?.[hit.y]?.[hit.x];
        if(tt && tt!=='void' && tt!=='wall' && !SOLID.has(tt)) marks.push(hit);
      }
    });
  }
  (S.quests.side||[]).filter(q=>q.status==='aktiv'||q.status==='offen').slice(0,4).forEach(q=>{
    const mark=q.marker || (q.npc?{npc:q.npc}:null) || (q.ort?{ort:q.ort}:null);
    let hit=resolveQuestMarker(S, mark, q.titel, 'side');
    if(!hit && q.npc){
      const npc=_npcs.find(n=>n.name===q.npc || String(n.name).toLowerCase().includes(String(q.npc).toLowerCase().slice(0,5)));
      if(npc) hit={x:Math.round(npc.x), y:Math.round(npc.y)-1, label:q.titel, kind:'side'};
    }
    if(hit){
      const tt=_map?.tiles?.[hit.y]?.[hit.x];
      if(tt && tt!=='void' && tt!=='wall' && !SOLID.has(tt)) marks.push(hit);
    }
  });
  // v49: drop soft pins; dungeon/interior only exact NPC/chest/door tiles
  _questMarks=marks.filter(m=>{
    if(m.soft || m.kind==='hint' || m.kind==='ort') return false;
    if(_map?.kind==='dungeon'||_map?.kind==='interior'){
      const onNpc=_npcs.some(n=>Math.round(n.x)===m.x&&Math.round(n.y)===m.y);
      const onChest=_chests.some(c=>!c.open&&c.x===m.x&&c.y===m.y);
      const onDoor=(_map.doors||[]).some(d=>d.x===m.x&&d.y===m.y);
      return onNpc||onChest||onDoor;
    }
    const tt=_map?.tiles?.[m.y]?.[m.x];
    return !!(tt && tt!=='void' && tt!=='wall' && !SOLID.has(tt));
  });
}


function loop(ts){
  if(!_active) return;
  const dt=Math.min(0.05, (_last? (ts-_last) : 16)/1000); _last=ts;
  _tickAcc+=dt;
  if(_tickAcc>0.28){ _tickAcc=0; _waterFrame=(_waterFrame+1)%4; _animFrame=(_animFrame+1)%4; }
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
  stepNpcs(dt);
  stepHero(dt);
  draw();
  _raf=requestAnimationFrame(loop);
}

function fitCanvas(){
  if(!_canvas) return;
  _desktop=true;
  document.body.classList.add('ow-desktop','pc-only');
  document.body.classList.remove('touch-ui');
  // v66 PC: fill the WINDOW with integer-scaled 16:9 (ignore cramped stage box)
  const availW=Math.max(640, window.innerWidth|0);
  const availH=Math.max(360, window.innerHeight|0);
  // Choose largest 16:9 logical that still integer-scales into the window
  // Prefer ~24–32 CSS px tiles → logical tile 16 × scale ≈ 32–48 CSS at scale 2–3
  // v69: prefer ~3× of 16px tiles at 1080p (gameplay camera, not map overview)
  const candidates=[
    {lw:640, lh:360}, // scale 3 @ 1920×1080 — preferred
    {lw:960, lh:540}, // scale 2
    {lw:480, lh:270}, // scale 4 fallback
    {lw:320, lh:180}, // last resort
  ];
  let best=null;
  for(const c of candidates){
    const s=Math.floor(Math.min(availW/c.lw, availH/c.lh));
    if(s<1) continue;
    const outArea=c.lw*c.lh*s*s;
    const logical=c.lw*c.lh;
    // Prefer scale closest to 3 when fill is comparable; then maximize fill
    const pref = outArea - Math.abs(s-3)*5e8 - (s===3?0:1e7);
    if(!best || pref>best.pref){
      best={...c, scale:s, outArea, logical, pref};
    }
  }
  if(!best) best={lw:640, lh:360, scale:1, area:640*360};
  const {lw, lh, scale}=best;
  const outW=lw*scale, outH=lh*scale;
  _canvas.width=lw;
  _canvas.height=lh;
  _canvas.style.setProperty('position', 'relative', 'important');
  _canvas.style.setProperty('inset', 'auto', 'important');
  _canvas.style.setProperty('left', 'auto', 'important');
  _canvas.style.setProperty('right', 'auto', 'important');
  _canvas.style.setProperty('top', 'auto', 'important');
  _canvas.style.setProperty('bottom', 'auto', 'important');
  _canvas.style.setProperty('width', outW+'px', 'important');
  _canvas.style.setProperty('height', outH+'px', 'important');
  _canvas.style.setProperty('image-rendering', 'pixelated');
  _canvas.style.setProperty('max-width', 'none', 'important');
  _canvas.style.setProperty('max-height', 'none', 'important');
  _canvas.style.setProperty('margin', '0 auto', 'important');
  _canvas.style.setProperty('flex', '0 0 auto', 'important');
  _intScale=scale;
  // Close follow frustum. Canvas scale stays 2–4; tiles draw larger than 16 logical px
  // so the hero reads at 720p and 1080p instead of a whole-map overview.
  _viewW=22;
  _viewH=13;
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
            <button type="button" class="ow-fs" id="owTravel" title="Reisekarte" aria-label="Reisekarte">🗺</button>
            <span class="ow-hint" id="owHint">WASD/Pfeile bewegen · Enter/A reden · Esc/B Menü · T Log · Reise · Gamepad OK</span>
          </div>
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
  // v46: preload walk sheets so drawSprite never flashes blue placeholders
  try{ loadImg('./assets/pixel/hero/walk.png'); Object.values(NPC_SHEETS||{}).forEach(loadImg); }catch(_){}
  ensureDlg();
  if(_bound){ fitCanvas(); return; }
  // v66 PC-only: no touch swipe/tap
  _bound=true;
  fitCanvas();
  window.addEventListener('resize', ()=>{ fitCanvas(); draw(); });

  document.getElementById('owFullscreen')?.addEventListener('click', toggleFullscreen);
  document.getElementById('owTravel')?.addEventListener('click', ()=>{ try{ _hooks.openTravel?.(); }catch(_){ } });

  const pad=document.getElementById('owPad');
  const hold={};
  const start=(dx,dy,id)=>{ hold[id]=setInterval(()=>{ if(dx||dy) tryMove(dx,dy); }, 140); if(dx||dy) tryMove(dx,dy); };
  const end=(id)=>{ clearInterval(hold[id]); delete hold[id]; };
  // v66 PC-only: on-screen d-pad removed; keep bind no-op if DOM leftover
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
    if(hit){
      if(hit.sheet==='merchant' && _hooks.openShop){ try{ _hooks.openShop(hit.name); return; }catch(_){ } }
      talkTo(hit.name); return;
    }
    if(openChestAt(tx,ty)) return;
    _tapTarget={x:tx,y:ty};
  });
  window.addEventListener('keydown', e=>{
    if(!_active) return;
    if(document.activeElement?.id==='txt' || document.activeElement?.tagName==='INPUT' || document.activeElement?.tagName==='TEXTAREA'){
      if(e.key==='Escape'){ document.getElementById('txt')?.blur(); hideDialogue(); e.preventDefault(); }
      return;
    }
    if(_dlgChoices && isDialogueOpen()){
      const btns=[...document.querySelectorAll('#owDlgChoices button')];
      if(btns.length && (e.key==='ArrowLeft'||e.key==='ArrowRight'||e.key==='ArrowUp'||e.key==='ArrowDown')){
        e.preventDefault();
        let i=btns.indexOf(document.activeElement);
        if(i<0) i=0;
        const dir=(e.key==='ArrowRight'||e.key==='ArrowDown')?1:-1;
        btns[(i+dir+btns.length)%btns.length].focus();
        return;
      }
      if(btns.length && (e.key==='Enter'||e.key===' ')){
        e.preventDefault();
        const cur=btns.includes(document.activeElement)?document.activeElement:btns[0];
        cur.click();
        return;
      }
    }
    const moveKeys=['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D'];
    if(moveKeys.includes(e.key)){ _keys[e.key]=true; e.preventDefault(); return; }
    if(e.key==='Enter' || e.key===' '){
      e.preventDefault();
      confirmDialogue();
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
  if(hooks.audio) _audioApi=hooks.audio;
  preload();
  ensureDOM();
}

export function showOverworld(S){
  try{ window.__game?.UI14?.dismissBegegnung?.(); document.getElementById('begegnung')?.classList.add('hidden'); }catch(_){}
  ensureDOM();
  preload();
  const built=buildMapForLocation(S, S?.world?.scene?.ort);
  _map=built;
  applyGenre(S);
  if(built.kind==='dungeon'){
    // v74: NA dungeon family only
    const NA='./assets/pixel/tiles-na/cut';
    const ice=/ice_cave/i.test(String(built.preset||''));
    _tileSet={..._tileSet,
      grass: ice ? `${NA}/biome_ice.png` : `${NA}/dfloor_mid.png`,
      path: `${NA}/dfloor_lit.png`,
      floor: `${NA}/dfloor_lit.png`,
      wall: `${NA}/wall_top0.png`,
      tree: `${NA}/ruin_wall.png`,
      void: `${NA}/dvoid.png`,
      door: `${NA}/door.png`,
      stone: `${NA}/dfloor_dark.png`,
      carpet: `${NA}/dfloor_mid.png`,
      plaza: `${NA}/dfloor_lit.png`,
      sand: ice ? `${NA}/biome_snow.png` : `${NA}/dfloor_mid.png`,
      water: ice ? `${NA}/biome_ice.png` : `${NA}/water.png`,
      stairs: `${NA}/stairs.png`,
    };
  }
  _npcs=(built.npcs||[]).map(n=>({...n, dir:0, frame:0}));
  _overhead=built.overhead||[];
  _animators=built.animators||[];
  __map=built;
  _chests=(built.chests||[]).map(c=>({...c}));
  _lights=built.lights||[];
  try{
    const opened=S?.flags?.chests||{};
    for(const c of _chests){ if(opened[c.id]){ c.open=true; try{ if(_map.overlay?.[c.y]) _map.overlay[c.y][c.x]='crate'; }catch(_){}} }
  }catch(_){}
  try{ rebuildQuestMarks(S); }catch(_){}
  if(Array.isArray(built.questMarks)&&built.questMarks.length){
    const have=new Set((_questMarks||[]).map(m=>m.x+','+m.y+':'+m.kind));
    for(const m of built.questMarks){
      const k=m.x+','+m.y+':'+(m.kind||'');
      if(!have.has(k)) _questMarks.push(m);
    }
  }
  _hero.x=built.spawn.x; _hero.y=built.spawn.y;
  _hero.px=_hero.x; _hero.py=_hero.y; _hero.moving=false; _hero.frame=0;
  // v74: visible map encounters (NA monster sheets) — outdoor/dungeon only
  try{
    const authoredPass=built.preset==='wall' && S?.campaign?.flags?.passField;
    if(!authoredPass && (built.kind==='dungeon' || built.kind==='wild' || built.preset==='wall')){
      const mons=['1','2','3','4','5','6'];
      let nEnc=built.kind==='dungeon'?4:3;
      for(let i=0;i<nEnc;i++){
        const ang=(i/nEnc)*Math.PI*2;
        const ex=Math.round(_hero.x+Math.cos(ang)*6+(i%2));
        const ey=Math.round(_hero.y+Math.sin(ang)*5+((i*3)%2));
        if(!walkable(ex,ey)) continue;
        if(_npcs.some(n=>Math.round(n.x)===ex&&Math.round(n.y)===ey)) continue;
        const mid=mons[i%mons.length];
        _npcs.push({
          x:ex,y:ey,px:ex,py:ey,dir:0,frame:0,
          name:'Wildnis · '+mid, sheet:'monster', pace:0.4,
          _mapEncounter:true,
          _encImg:`./assets/pixel/tiles-na/monsters/${mid}.png`,
          calendar:false,
        });
      }
    }
  }catch(_){}
  try{ ensurePassWorld(S); }catch(_){}
  try{ ensurePassJobs(S); }catch(_){}
  try{ ensureSolmir(S); }catch(_){}
  loadFog(S);
  _root.classList.remove('hidden');
  document.body.classList.add('pixel-ow','ow-fs-active');
  try{ document.getElementById('choices')?.classList.add('hidden'); document.getElementById('inputRow')?.classList.add('hidden'); }catch(_){}
  _active=true;
  try{
    const S=_hooks.getS?.();
    if(S && !S.flags?.visual45Tip && document.body.classList.contains('pixel-ow')){
      S.flags=S.flags||{}; S.flags.visual45Tip=1;
      setTimeout(()=>{
        try{
          if(!document.body.classList.contains('pixel-ow')) return;
          if(document.body.classList.contains('ow-dialogue')) return;
          try{ const t=document.getElementById('toast'); if(t){ t.classList.add('toast-tip'); } }catch(_){}
          window.__game?.toast?.('WASD/Pfeile · Enter/A reden · Esc/B Menü · Gamepad OK');
        }catch(_){}
      }, 3200);
    }
  }catch(_){}
 _last=0;
  fitCanvas();
  updatePartyPanel();
  try{
    const Sloc=_hooks.getS?.() || S || window.__game?.S;
    const nm=built.name || Sloc?.world?.scene?.ort || '';
    if(Sloc?.world?.scene && nm) Sloc.world.scene.ort = nm;
    try{ window.__game?.syncOwHud?.(nm); }catch(_){}
    try{ window.__game?.hud?.(); }catch(_){}
    try{
      const loc=document.querySelector('#hud .loc-line');
      if(loc && nm) loc.textContent='📍 '+nm;
    }catch(_){}
  }catch(_){}
  try{
    const key=_audioApi?.musicForMapKind?.(built.kind)||'town';
    _audioApi?.fadeTo?.(key);
  }catch(_){}
  if(!_raf) _raf=requestAnimationFrame(loop);
  draw();
  try{ window.__game?.C42?.renderOwRegionMinimap?.(
    {w:_map.w,h:_map.h,tiles:_map.tiles,name:_map.name},
    {x:_hero.x,y:_hero.y},
    {name:_map.name, fog:(x,y)=>!_explored.has(fogKey(x,y))}
  ); }catch(_){}
  try{
    const S=_hooks.getS?.();
    window.__game?.C43?.syncAmbient?.(S, _map, _audioApi||window.__game?.Aud);
  }catch(_){}
  try{ maybeFieldBoot(); }catch(_){}
}

function maybeFieldBoot(){
  const S=_hooks.getS?.();
  if(!fieldChapter(S)) return;
  document.body.classList.add('field-play');
  if(S.flags?.c1FieldBoot) return;
  if(_map?.preset!=='throne') return;
  S.flags.c1FieldBoot=true;
  queueBeats([
    {name:'Velka', sheet:'mage', text:'Bleib stehen. In der Kasse sind vierzehn Gold, und Venn hustet seit Dienstag. Der Staub kommt von unten. Ich leg das nicht aus meiner Tasche drauf.'},
    {name:'Brok', sheet:'guard', text:'Letzte Woche war ich für ihn nur noch der Soldat. Ich heiß Brok. Wenn du das auch vergisst, sag ich\'s dir einmal.'},
    {name:'Aria', sheet:'princess', text:'Lio steht am Pass in der zweiten Wache. Ich bin nicht zum Knien hergekommen. Wenn du was willst, komm rüber.'},
    {name:'Velka', sheet:'mage', text:'Unter dem Sitz sind drei Kerben. Neun, neun, neun. Seine Hand. Merk dir das, bevor wir runtergehen.'},
  ]);
}

export function hideOverworld(){
  _active=false;
  if(_raf){ cancelAnimationFrame(_raf); _raf=0; }
  _root?.classList.add('hidden');
  document.body.classList.remove('pixel-ow','ow-desktop','ow-fs-active');
  try{ document.getElementById('choices')?.classList.remove('hidden'); document.getElementById('inputRow')?.classList.remove('hidden'); }catch(_){}
  hideDialogue();
  try{ window.__game?.C42?.hideOwRegionMinimap?.(); }catch(_){}
  try{ window.__game?.C43?.stopAmbient?.(); }catch(_){}
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
  return {active:_active, desktop:_desktop, scale:_intScale, view:{w:_viewW,h:_viewH}, renderView:{w:_lastViewW,h:_lastViewH}, hero:{..._hero}, map:{w:_map.w,h:_map.h,name:_map.name,kind:_map.kind,preset:_map.preset,overhead:(_overhead||[]).length}, overhead:_overhead.slice(0,8), npcs:_npcs.map(n=>({name:n.name,x:n.x,y:n.y,slot:n._calSlot,cal:!!n.calendar,pace:n.pace})), questMarks:_questMarks.slice(), chests:_chests.slice(0,8), doors:_map.doors, fog:{explored:_explored.size, visible:_visible.size}};
}
export function __setHero(x,y){ if(!_hero) return false; _hero.x=+x; _hero.y=+y; _hero.px=_hero.x; _hero.py=_hero.y; _hero.moving=false; try{draw();}catch(_){} return true; }
export function __tryMove(dx,dy){ return tryMove(dx,dy); }
export function __talkNearest(){ return talkNearest(); }
export function __talkTo(name){ return talkTo(name); }
export function __listNpcs(){ return _npcs.map(n=>({name:n.name,x:n.x,y:n.y,sheet:n.sheet})); }

export default { mountOverworld, showOverworld, hideOverworld, refreshOverworld, isOverworldActive, buildMapForLocation, showDialogue, hideDialogue, queueBeats, fieldReward, fieldPassEnd, fieldCryptEnd, syncDialogueFromVN, __debug, __setHero, __tryMove, __talkNearest, __talkTo, __listNpcs, get __map(){ return __map; } };
