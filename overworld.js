/** v28 Pixel JRPG overworld — dense art, unique orts, soft FoW, day/night, weather, audio */
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
  carpet: './assets/pixel/tiles/plaza.png',
  plaza: './assets/pixel/tiles/plaza.png',
  void: './assets/pixel/tiles/void.png',
  door: './assets/pixel/tiles/door.png',
  camp: './assets/pixel/tiles/camp.png',
  house: './assets/pixel/tiles/house.png',
  ruin: './assets/pixel/tiles/ruin.png',
  fence: './assets/pixel/tiles/fence.png',
  well: './assets/pixel/tiles/well.png',
  flower: './assets/pixel/tiles/flower.png',
  stall: './assets/pixel/tiles/stall.png',
  wood: './assets/pixel/tiles/wood.png',
};
const WATER_ANIM = './assets/pixel/tiles/water-anim.png';
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
  chest: './assets/pixel/decor/chest.png',
  statue: './assets/pixel/decor/statue.png',
  cart: './assets/pixel/decor/cart.png',
  shadow: './assets/pixel/decor/shadow.png',
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
const HOUSE_BIG = Array.from({length:8},(_,i)=>`./assets/pixel/decor/housebig${i}.png`);
const HALL_BIG = Array.from({length:4},(_,i)=>`./assets/pixel/decor/hall${i}.png`);
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

const SOLID = new Set(['wall','water','tree','void','house','ruin','fence','well','stall']);

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
let _dayTint='day'; let _wxParts=[]; let _audioApi=null;
let _desktop=false; let _intScale=3; let _viewW=13, _viewH=15;
let _padAxes={x:0,y:0}; let _padPrev={};
let _overhead=[]; // {x,y,src,w,h} world-tile anchored big sprites drawn after entities
export let __map=null; // last built map (gates/shots)
let _animators=[]; // {x,y,kind} animated overlays
let _animFrame=0;
let _chests=[]; // {x,y,id,open,loot}
let _questMarks=[]; // {x,y,label,kind}
let _lights=[]; // {x,y,r,color} night readability


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
  Object.values(ANIM).forEach(loadImg);
  HOUSE_BIG.forEach(loadImg); HALL_BIG.forEach(loadImg);
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
  const low=name.toLowerCase();
  let kind='town';
  const blob=desc+low;
  if(/wald|wild|feld|straße|strasse|pfad/.test(blob)) kind='wild';
  if(/verlies|höhle|kerker|dungeon|keller|grab/.test(blob)) kind='dungeon';
  if(/\bcamp\b|\blager\b|zuhause|hütte|\bheim\b|grundstück/.test(blob) || S?.home?.location===name) kind='camp';
  if(/markt|stadt|dorf|platz|tempel|burg|palast|gasthaus|taverne|akademie|halle|solari|beschwörung|hafen|kirche|gilde|tor|garten/.test(blob)) kind='town';
  if(/ruine|trümmer|zerstört/.test(blob)) kind='ruins';
  if(/innen|zimmer|kammer|küche|schlaf|\(innen\)/.test(blob) || (/\bsaal\b/.test(blob)&&!/thron/.test(blob))) kind='interior';

  // Unique preset key for important orte — genre/terrain heuristics for unknown places
  let preset='default';
  // Entered buildings always use interior layout
  if(/^in:/.test(low) || /\(innen\)/.test(low)) { preset='interior'; kind='interior'; }

  const genre=String(S?.genre||S?.role||S?.world?.genre||'').toLowerCase();
  if(preset==='default'){
    if(/beschw/.test(low)) preset='summon';
    else if(/thron/.test(low)) preset='throne';
    else if(/markt|unterstadt|bazaar|souk/.test(low)) preset='market';
    else if(/taverne|gasthaus|silberfuchs|\binn\b|\bbar\b/.test(low)) preset='tavern';
    else if(/hafen|myr|dock|kai|werft/.test(low)) preset='harbor';
    else if(/elfen|sylvar|hain|dryade/.test(low)) preset='elfwood';
    else if(/nordwall|wall|festung|bastion|bollwerk/.test(low)) preset='wall';
    else if(/garten|palastgarten|park/.test(low)) preset='garden';
    else if(/kirche|tempel|solari|kathedrale|schrein|kapelle/.test(low)) preset='church';
    else if(/gilde|söldner|abenteurer/.test(low)) preset='guild';
    else if(/weidenau|dorf|bauern|weiler/.test(low)) preset='village';
    else if(/osttor|tor|gate|portal/.test(low)) preset='gate';
    else if(/königsburg|schloss|burg/.test(low) || (/\bhof\b/.test(low)) || (/palast/.test(low)&&!/garten/.test(low))) preset='courtyard';
    else if(/waldweg|pfad|straße|strasse|landstraße/.test(low)) preset='road';
    else if(/akademie|schule|bibliothek|archiv|universität/.test(low)) preset='academy';
    else if(/mine|stollen|bergwerk|zwerg/.test(low)) preset='mine';
    else if(/strand|küste|insel|meer|bucht/.test(low)) preset='beach';
    else if(/sumpf|moor|marsch|nebelfenn/.test(low)) preset='swamp';
    else if(/wüste|düne|oase|sand/.test(low)) preset='desert';
    else if(/schnee|gletscher|eis|frost|tundra|nord/.test(low)) preset='snow';
    else if(/friedhof|grab|nekropole|krypta/.test(low)) preset='graveyard';
    else if(/labor|werkstatt|fabrik|neon|station|cyber|netz/.test(low)) preset='neon';
    else if(/seuche|zombie|quarantäne|barrikade/.test(low)) preset='wasteland';
  }

  // Genre fallback when still default (unknown ort name)
  if(preset==='default'){
    if(/cyber|neon|netz/.test(genre)) preset='neon';
    else if(/zombie|apokal|seuche/.test(genre)) preset='wasteland';
    else if(/daemon|dämon|hölle|infernal/.test(genre)) preset='ruins';
    else if(/villainess|adel|hof/.test(genre) && kind==='town') preset='courtyard';
    else if(/held|mensch/.test(genre) && kind==='town') preset='village';
  }
  // Terrain keywords in description beat genre default
  if(/sumpf|moor/.test(blob) && preset==='default') preset='swamp';
  if(/wüste|düne/.test(blob) && preset==='default') preset='desert';
  if(/schnee|eisberg|gletscher/.test(blob) && preset==='default') preset='snow';
  if(/strand|küste/.test(blob) && preset==='default') preset='beach';
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

  const w = kind==='dungeon'?24: kind==='camp'?18: kind==='interior'?16:30;
  const ht = kind==='dungeon'?20: kind==='camp'?14: kind==='interior'?14:24;
  const tiles=Array.from({length:ht},()=>Array(w).fill('grass'));
  const overlay=Array.from({length:ht},()=>Array(w).fill(null));
  const interiors=[];
  const overhead=[]; // big sprites
  const animators=[];
  const chests=[];
  let _pendingLights=[];
  const fill=(x,y,tw,th,t)=>{ for(let j=0;j<th;j++) for(let i=0;i<tw;i++){ const xx=x+i,yy=y+j; if(yy>=0&&yy<ht&&xx>=0&&xx<w) tiles[yy][xx]=t; } };
  const ov=(x,y,id)=>{ if(y>=0&&y<ht&&x>=0&&x<w) overlay[y][x]=id; };
  const prop=(x,y,id)=>{ if(y>=0&&y<ht&&x>=0&&x<w){ overlay[y][x]=id; } };
  const anim=(x,y,kind)=>{ if(y>=0&&y<ht&&x>=0&&x<w) animators.push({x,y,kind}); };
  const ringFence=(x,y,tw,th)=>{
    for(let i=0;i<tw;i++){ if(y>=0&&y<ht&&x+i>=0&&x+i<w) tiles[y][x+i]='fence'; if(y+th-1>=0&&y+th-1<ht&&x+i>=0&&x+i<w) tiles[y+th-1][x+i]='fence'; }
    for(let j=0;j<th;j++){ if(y+j>=0&&y+j<ht&&x>=0&&x<w) tiles[y+j][x]='fence'; if(y+j>=0&&y+j<ht&&x+tw-1>=0&&x+tw-1<w) tiles[y+j][x+tw-1]='fence'; }
  };
  const placeHouse=(bx,by,label,opts={})=>{
    const bw=opts.w||3, bh=opts.h||3;
    if(bx+bw>=w||by+bh>=ht) return null;
    fill(bx,by,bw,bh,'house');
    // tile overlays for close-up; big sprite for density
    for(let j=0;j<Math.min(3,bh);j++) for(let i=0;i<Math.min(3,bw);i++) ov(bx+i,by+j,'house'+(j*3+i));
    const variant=(opts.variant!=null)?opts.variant:(hash(label+bx+by)% (opts.hall?4:8));
    const src=opts.hall?HALL_BIG[variant%4]:HOUSE_BIG[variant%8];
    overhead.push({x:bx, y:by, src, tw:opts.hall?4:3, th:3});
    // chimney smoke
    anim(bx+bw-1, by, 'smoke');
    // window glow anchors (night lights)
    _pendingLights = _pendingLights || [];
    _pendingLights.push({x:bx+0.5, y:by+1, r:2.4, color:'rgba(255,200,90,0.55)'});
    _pendingLights.push({x:bx+bw-1.5, y:by+1, r:2.2, color:'rgba(255,190,80,0.5)'});
    const dx=bx+Math.floor(bw/2), dy=by+bh;
    if(dy<ht){ tiles[dy][dx]='door'; overlay[dy][dx]=null; }
    if(by>0) fill(bx,by-1,bw,1,'path');
    if(dy+1<ht) tiles[Math.min(ht-1,dy+1)][dx]='path';
    // props near door
    if(dx-1>=0) prop(dx-1, Math.min(ht-1,dy), (hash(label)%2)?'barrel':'crate');
    if(dx+1<w) prop(dx+1, Math.min(ht-1,dy), 'lamp');
    anim(dx+1, Math.min(ht-1,dy), 'torch');
    const id='in:'+(label||('Haus'+(interiors.length+1)));
    interiors.push({x:dx,y:dy,to:id, label:label||'Haus', returnX:dx, returnY:dy});
    return {dx,dy,id};
  };
  const scatterGrass=()=>{
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++){
      if(tiles[y][x]==='grass'){
        const n=((h+x*17+y*31)%100);
        if(n<6){ ov(x,y,'flower'); anim(x,y,'flower'); }
        else if(n<11) ov(x,y,'d'+(n%3));
        else if(n>92) ov(x,y,'bush');
        else if(n>88) prop(x,y,['barrel','crate','bench','sign'][n%4]);
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

  // ---- Preset layouts ----
  const cx=Math.floor(w/2), cy=Math.floor(ht/2);
  if(preset==='interior'){
    fill(0,0,w,ht,'wall');
    fill(1,1,w-2,ht-2,'wood');
    fill(2,2,w-4,ht-4,'wood');
    fill(Math.floor(w/2)-2, Math.floor(ht/2)-1, 5, 3, 'plaza');
    tiles[2][2]='stall'; tiles[2][w-3]='stall';
    prop(2,3,'barrel'); prop(w-3,3,'crate'); prop(3,ht-3,'chest');
    prop(w-4,ht-3,'bench');
    anim(2,2,'torch'); anim(w-3,2,'torch');
    tiles[ht-2][Math.floor(w/2)]='door';
    // exit door handled later via _owReturn
  } else if(preset==='dungeon'){
    kind='dungeon';
    fill(0,0,w,ht,'void');
    fill(1,1,w-2,ht-2,'wall');
    [[2,2,8,6],[12,2,10,6],[2,11,8,7],[12,11,10,7],[8,7,8,5]].forEach(([rx,ry,rw,rh])=>fill(rx,ry,rw,rh,'floor'));
    fill(9,4,4,2,'floor'); fill(6,8,3,4,'floor'); fill(16,8,2,4,'floor');
    for(const [px,py] of [[4,4],[7,4],[14,4],[18,4],[4,14],[7,14],[14,14],[18,14]]){
      if(py<ht&&px<w) tiles[py][px]='stone';
    }
    fill(10,9,4,3,'plaza');
    prop(11,10,'chest'); prop(12,10,'barrel');
    anim(3,3,'torch'); anim(20,3,'torch'); anim(3,16,'torch'); anim(20,16,'torch');
    tiles[Math.floor(ht/2)][Math.floor(w/2)]='door';
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
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++) tiles[y][x]='floor';
    fill(0,0,w,2,'wall'); fill(0,0,2,ht,'wall'); fill(w-2,0,2,ht,'wall'); fill(0,ht-2,w,2,'wall');
    fill(cx-2, 2, 5, ht-4, 'carpet');
    fill(cx-4, 3, 9, 5, 'plaza');
    prop(cx,4,'statue'); prop(cx-3,5,'lamp'); prop(cx+3,5,'lamp');
    anim(cx-3,5,'torch'); anim(cx+3,5,'torch');
    placeHouse(cx-8, cy-1, 'Nebenkammer',{variant:3});
    placeHouse(cx+4, cy-1, 'Wache',{variant:0});
  } else if(preset==='market'){
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++) tiles[y][x]='grass';
    fill(0, cy-1, w, 3, 'path');
    fill(cx-1, 0, 3, ht, 'path');
    fill(cx-4, cy-4, 9, 9, 'plaza');
    tiles[cy][cx]='well'; anim(cx,cy,'fountain');
    for(let i=0;i<6;i++){
      const sx=2+i*4; if(sx+2>=w) continue;
      fill(sx, cy-7, 2, 2, 'stall'); ov(sx,cy-7,'stall');
      prop(sx, cy-5, 'cart'); anim(sx+1,cy-7,'smoke');
    }
    for(let i=0;i<5;i++){
      const sx=3+i*5; if(sx+2>=w) continue;
      fill(sx, cy+5, 2, 2, 'stall'); ov(sx,cy+5,'stall');
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
    placeHouse(cx-4, cy-6, 'Zum Silberfuchs', {hall:true, variant:0, w:4, h:3});
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
    for(let i=0;i<4;i++){ prop(4+i*6, ht-11, 'crate'); prop(5+i*6, ht-11, 'barrel'); }
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
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++) tiles[y][x]='grass';
    fill(0,0,w,4,'stone'); fill(0,0,w,1,'wall');
    fill(0, cy, w, 2, 'path');
    placeHouse(2, 5, 'Kaserne', {hall:true, variant:2, w:4, h:3});
    placeHouse(w-7, 5, 'Turm', {variant:1});
    placeHouse(cx-2, ht-7, 'Wachstube', {variant:0});
    for(let x=2;x<w-2;x+=4){ anim(x,2,'torch'); prop(x,3,'lamp'); }
    prop(cx, cy-1, 'sign'); prop(cx+2, cy+1, 'barrel');
    scatterGrass();
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
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++) tiles[y][x]='grass';
    fill(0,cy,w,2,'path');
    placeHouse(cx-4, cy-7, 'Kirche', {hall:true, variant:3, w:4, h:3});
    fill(cx-3, cy-3, 7, 5, 'plaza');
    prop(cx, cy-2, 'statue'); anim(cx-3,cy-4,'torch'); anim(cx+3,cy-4,'torch');
    placeHouse(2, ht-7, 'Pfarrhaus', {variant:2});
    placeHouse(w-6, ht-7, 'Friedhofskapelle', {variant:1});
    ringFence(w-10, cy+2, 7, 6); fill(w-9,cy+3,5,4,'grass');
    for(let i=0;i<3;i++) prop(w-8+i, cy+4, 'statue');
    scatterGrass();
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
    fill(cx-2,cy-2,5,5,'plaza'); tiles[cy][cx]='well';
    placeHouse(2,2,'Bauernhaus',{variant:0});
    placeHouse(w-6,2,'Mühle',{variant:3});
    placeHouse(2,ht-7,'Scheune',{variant:4});
    placeHouse(w-6,ht-7,'Gasthof',{variant:6});
    placeHouse(cx-8,cy-2,'Schmiede',{variant:5});
    placeChest(cx+1, cy-1, {gold:8, item:'Heilkraut'});
    placeChest(w-8, cy+2, {gold:15});
    ringFence(cx+3,cy+3,6,5); fill(cx+4,cy+4,4,3,'grass');
    for(let j=0;j<2;j++) for(let i=0;i<3;i++) anim(cx+4+i,cy+4+j,'flower');
    prop(cx-1,cy+1,'bench'); prop(cx+3,cy,'cart');
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
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++) tiles[y][x]='grass';
    for(let i=0;i<w;i++){ tiles[0][i]='tree'; tiles[ht-1][i]='tree'; }
    fill(5,4,8,6,'camp');
    fill(4,3,10,1,'path'); fill(4,10,10,1,'path');
    fill(7,6,3,2,'plaza');
    tiles[7][8]='well';
    ringFence(3,3,12,9); tiles[3][8]='path';
    anim(8,6,'smoke'); prop(6,7,'crate'); prop(10,7,'barrel'); prop(9,8,'bench');
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
    kind='ruins';
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++) tiles[y][x]='grass';
    fill(0,cy,w,2,'path');
    ringFence(2,2,w-4,ht-4);
    placeHouse(cx-3, 2, 'Kapelle', {hall:true, variant:3, w:4, h:3});
    for(let j=0;j<3;j++) for(let i=0;i<6;i++){ prop(4+i*3, 8+j*3, 'statue'); }
    anim(cx-3,4,'torch'); anim(cx+3,4,'torch');
    prop(cx,cy,'statue'); placeHouse(w-7, ht-7, 'Gruft', {variant:2});
    scatterGrass();
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
    for(let i=0;i<4;i++){ fill(3+i*6, cy-7, 2, 2, 'stall'); ov(3+i*6, cy-7, 'stall'); }
    anim(cx,cy,'fountain'); prop(cx-3,cy,'lamp'); prop(cx+3,cy,'lamp');
    anim(4,3,'torch'); anim(w-5,3,'torch');
    scatterGrass();
  } else if(preset==='wasteland'){
    kind='ruins';
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++){
      const n=((h+x*9+y*17)%100);
      tiles[y][x]=n<22?'ruin':(n<30?'stone':'grass');
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
    // default town
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++) tiles[y][x]='grass';
    fill(0, cy-1, w, 3, 'path');
    fill(cx-1, 0, 3, ht, 'path');
    fill(cx-3, cy-3, 7, 7, 'plaza');
    tiles[cy][cx]='well'; anim(cx,cy,'fountain');
    for(let i=0;i<5;i++){
      const sx=cx-6+i*3; if(sx<2||sx+2>=w) continue;
      fill(sx, cy-6, 2, 2, 'stall'); ov(sx, cy-6, 'stall');
      tiles[cy-4][sx]='path';
    }
    ringFence(2, cy+4, 7, 6);
    fill(3, cy+5, 5, 4, 'grass');
    for(let j=0;j<3;j++) for(let i=0;i<3;i++){ ov(4+i, cy+6+j, 'flower'); anim(4+i, cy+6+j, 'flower'); }
    tiles[cy+4][5]='path';
    placeHouse(2, 2, 'Gasthaus', {variant:0});
    placeHouse(w-6, 2, 'Tempel', {variant:1, hall:true, w:4, h:3});
    placeHouse(2, ht-7, 'Wohnhaus', {variant:4});
    placeHouse(w-6, ht-7, 'Laden', {variant:6});
    placeHouse(cx-8, cy-2, 'Bibliothek', {variant:2});
    placeHouse(cx+5, cy-2, 'Wachstube', {variant:3});
    for(let i=0;i<w;i++){ if(i%3===0){ tiles[0][i]='tree'; tiles[ht-1][i]='tree'; } }
    fill(w-8, 3, 4, 3, 'water');
    scatterGrass();
  }

  let sx=Math.floor(w/2), sy=Math.floor(ht/2);
  // Prefer spawn near return door if exiting interior
  if(S?._owSpawn && typeof S._owSpawn.x==='number'){
    sx=Math.max(1,Math.min(w-2,S._owSpawn.x|0));
    sy=Math.max(1,Math.min(ht-2,S._owSpawn.y|0));
  }
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
    const home={x:nx,y:ny};
    // simple schedule waypoints around spawn / plaza
    const wps=[
      {x:nx,y:ny},
      {x:Math.max(1,Math.min(w-2,cx+(i%3)-1)), y:Math.max(1,Math.min(ht-2,cy+(i%2)))},
      {x:Math.max(1,Math.min(w-2,nx+3)), y:ny},
      {x:nx, y:Math.max(1,Math.min(ht-2,ny+2))},
    ];
    let pace='wander';
    if(sheet==='guard') pace='patrol';
    else if(sheet==='merchant') pace='shop';
    else if(sheet==='mage') pace='study';
    npcs.push({name:nm, x:nx, y:ny, px:nx, py:ny, sheet, dir:0, frame:0, e:n.e||'👤', home, waypoints:wps, wp:i%wps.length, pace, wait:0});
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
    if(a.kind==='torch') lights.push({x:a.x+0.5,y:a.y+0.5,r:2.8,color:'rgba(255,170,60,0.55)'});
  }
  for(let y=0;y<ht;y++) for(let x=0;x<w;x++){
    if(overlay[y][x]==='lamp') lights.push({x:x+0.5,y:y+0.5,r:3.2,color:'rgba(255,210,120,0.5)'});
  }
  // quest marks filled later in showOverworld
  return {w,h:ht,tiles,overlay,doors:exits,spawn:{x:sx,y:sy},kind,name,npcs,interiors,overhead,animators,preset,chests,lights};
}

function walkable(x,y){
  if(y<0||x<0||y>=_map.h||x>=_map.w) return false;
  return !SOLID.has(_map.tiles[y][x]);
}

function fogKey(x,y){ return x+','+y; }
function recomputeFog(){
  _visible=new Set();
  const R=_desktop?8:6;
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
  try{ _audioApi?.playSfx?.('talk'); }catch(_){}
  _hooks.act('Ich rede mit '+label);
}

function facingTile(){
  const d=_hero.dir|0;
  const dx=d===1?-1:d===2?1:0, dy=d===3?-1:d===0?1:0;
  return {x:_hero.x+dx, y:_hero.y+dy};
}
function talkNearest(){
  const f=facingTile();
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
  if(_hooks.act) _hooks.act('Ich schaue mich um');
  return null;
}

function tryMove(dx,dy){
  if(_hero.moving) return false;
  if(isDialogueOpen()) return false;
  const nx=_hero.x+dx, ny=_hero.y+dy;
  if(dx<0)_hero.dir=1; else if(dx>0)_hero.dir=2; else if(dy<0)_hero.dir=3; else if(dy>0)_hero.dir=0;
  const bump=_npcs.find(n=>Math.round(n.x)===nx && Math.round(n.y)===ny);
  if(bump){
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
  try{ _audioApi?.stepSfx?.(); }catch(_){}
  if(door?.to){
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
  return ({
    night:'rgba(18,28,70,.28)',
    dawn:'rgba(255,160,100,.18)',
    dusk:'rgba(180,110,80,.14)',
    day:'rgba(0,0,0,0)'
  })[_dayTint]||'rgba(0,0,0,0)';
}
function ensureWxParts(){
  if(_wxParts.length) return;
  for(let i=0;i<40;i++){
    _wxParts.push({x:Math.random(), y:Math.random(), s:0.5+Math.random()*1.5, v:0.2+Math.random()*0.6, a:0.3+Math.random()*0.5});
  }
}
function drawWeather(ctx, cssW, cssH, dt){
  let kind='klar';
  try{ kind=String(_hooks.getS?.()?.flags?.weather||'klar'); }catch(_){}
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
      if(ov && DECOR[ov] && !String(ov).startsWith('house')){
        const dim=loadImg(DECOR[ov]);
        if(dim.complete && dim.naturalWidth){
          const dw=(ov==='bush'?tw:tw*0.7);
          ctx.drawImage(dim, sx+(tw-dw)/2, sy+(tw-dw)/2, dw, dw);
        }
      }
      if(!vis){
        // soft explored-but-not-visible veil
        ctx.fillStyle='rgba(5,4,10,.42)'; ctx.fillRect(sx,sy,tw,tw);
      } else {
        // soft FoW edge: darken by distance from hero
        const dist=Math.hypot(x-_hero.x, y-_hero.y);
        const R=_desktop?8:6;
        if(dist > R-1.6){
          const a=Math.min(0.55, (dist-(R-1.6))*0.35);
          ctx.fillStyle=`rgba(5,4,10,${a.toFixed(3)})`;
          ctx.fillRect(sx,sy,tw,tw);
        }
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

  // animated overlays (torches, flowers, smoke, fountain)
  for(const a of _animators){
    const k=fogKey(a.x,a.y);
    if(!_explored.has(k)) continue;
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
    ctx.drawImage(im, sx, sy, (oh.tw||3)*tw, (oh.th||3)*tw);
    ctx.globalAlpha=1;
  }

  // location plaque
  ctx.fillStyle='rgba(10,20,60,.85)';
  ctx.fillRect(8,8,Math.min(cssW-16,_desktop?360:300),26);
  ctx.strokeStyle='#9eb6ff'; ctx.lineWidth=2; ctx.strokeRect(8.5,8.5,Math.min(cssW-17,_desktop?359:299),25);
  ctx.fillStyle='#e8f0ff'; ctx.font=_desktop?'10px "Press Start 2P", monospace':'11px monospace';
  ctx.fillText((_map.name||'').slice(0,28), 14, 26);
  // day/night tint + weather (tint only lit tiles; keep unexplored pure dark)
  syncDayNight();
  const tc=tintColor();
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
  // re-seal unexplored after tint so FoW edge stays soft charcoal, not dusk-red
  for(let y=y0;y<=y1;y++){
    for(let x=x0;x<=x1;x++){
      const sx=ox+(x-camX)*tw, sy=oy+(y-camY)*tw;
      if(y<0||x<0||y>=_map.h||x>=_map.w){ ctx.fillStyle='#05040a'; ctx.fillRect(sx,sy,tw,tw); continue; }
      if(!_explored.has(fogKey(x,y))){ ctx.fillStyle='#05040a'; ctx.fillRect(sx,sy,tw,tw); }
    }
  }
  // v30 night lights — windows/lamps punch through fog tint
  if(_dayTint==='night' || _dayTint==='dusk'){
    for(const L of _lights){
      const k=fogKey(Math.floor(L.x), Math.floor(L.y));
      if(!_explored.has(k)) continue;
      const sx=ox+(L.x-camX)*tw, sy=oy+(L.y-camY)*tw;
      const r=(L.r||2.5)*tw;
      const g=ctx.createRadialGradient(sx,sy,0,sx,sy,r);
      g.addColorStop(0, L.color||'rgba(255,200,100,0.55)');
      g.addColorStop(0.45, 'rgba(255,160,60,0.18)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalCompositeOperation='lighter';
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(sx,sy,r,0,Math.PI*2); ctx.fill();
      ctx.globalCompositeOperation='source-over';
    }
  }
  // quest markers
  for(const m of _questMarks){
    if(!_explored.has(fogKey(m.x,m.y))) continue;
    const sx=ox+(m.x-camX)*tw+tw/2, sy=oy+(m.y-camY)*tw-4;
    ctx.fillStyle='#ffd35a'; ctx.strokeStyle='#000'; ctx.lineWidth=3;
    ctx.font='bold 14px monospace';
    ctx.strokeText(m.kind==='done'?'✓':'!', sx-4, sy);
    ctx.fillText(m.kind==='done'?'✓':'!', sx-4, sy);
  }
  // open chests visual (empty)
  for(const c of _chests){
    if(!c.open) continue;
    if(!_explored.has(fogKey(c.x,c.y))) continue;
    const sx=ox+(c.x-camX)*tw, sy=oy+(c.y-camY)*tw;
    ctx.fillStyle='rgba(0,0,0,0.35)'; ctx.fillRect(sx,sy,tw,tw);
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

function stepNpcs(dt){
  const phase=phaseNow();
  for(const n of _npcs){
    n.wait=(n.wait||0)-dt;
    // merchants linger near home during day; guards patrol; night → home
    let target=null;
    const wps=n.waypoints||[];
    if(phase==='nacht'){
      target=n.home||wps[0];
    } else if(n.pace==='shop' && (phase==='morgen'||phase==='mittag'||phase==='nachmittag')){
      target=n.home||wps[0];
    } else if(n.wait<=0 && wps.length){
      n.wp=((n.wp|0)+1)%wps.length;
      target=wps[n.wp];
      n.wait = n.pace==='patrol' ? 0.6+Math.random()*1.2 : 1.5+Math.random()*3;
    }
    if(target && !_hero.moving){
      const tx=Math.round(target.x), ty=Math.round(target.y);
      const cx=Math.round(n.x), cy=Math.round(n.y);
      if(cx!==tx || cy!==ty){
        let dx=Math.sign(tx-cx), dy=Math.sign(ty-cy);
        if(Math.random()<0.45) { /* prefer axis with larger delta */ if(Math.abs(tx-cx)>=Math.abs(ty-cy)) dy=0; else dx=0; }
        else { if(Math.abs(tx-cx)<Math.abs(ty-cy)) dx=0; else dy=0; }
        const nx=cx+dx, ny=cy+dy;
        if(walkable(nx,ny) && !_npcs.some(o=>o!==n&&Math.round(o.x)===nx&&Math.round(o.y)===ny) && !(nx===_hero.x&&ny===_hero.y)){
          if(dx<0)n.dir=1; else if(dx>0)n.dir=2; else if(dy<0)n.dir=3; else n.dir=0;
          n.x=nx; n.y=ny; n.frame=(n.frame+1)%4;
        }
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
      try{ _audioApi?.playSfx?.('ok'); }catch(_){}
      try{ _hooks.save?.(); }catch(_){}
    }
  }catch(_){}
  // clear overlay chest art → open look via darken
  try{ if(_map.overlay?.[y]) _map.overlay[y][x]='crate'; }catch(_){}
  return true;
}

function rebuildQuestMarks(S){
  _questMarks=[];
  if(!S?.quests) return;
  const marks=[];
  const main=S.quests.main;
  if(main){
    const left=(main.objectives||[]).filter(o=>!(main.done||[]).includes(o));
    for(const o of left.slice(0,3)){
      // heuristic: match objective text to door/npc/chest
      const blob=String(o).toLowerCase();
      const npc=_npcs.find(n=>blob.includes(String(n.name).toLowerCase().slice(0,4)));
      if(npc) marks.push({x:Math.round(npc.x), y:Math.round(npc.y), label:o, kind:'npc'});
      else {
        const door=(_map.doors||[]).find(d=>blob.includes(String(d.to||d.label||'').toLowerCase().slice(0,5)));
        if(door) marks.push({x:door.x,y:door.y,label:o,kind:'door'});
        else if(_chests[0] && /truhe|schatz|gold|suche|find/.test(blob)) marks.push({x:_chests[0].x,y:_chests[0].y,label:o,kind:'chest'});
        else marks.push({x:_hero.x+2,y:_hero.y-1,label:o,kind:'hint'});
      }
    }
  }
  (S.quests.side||[]).filter(q=>q.status==='aktiv'||q.status==='offen').slice(0,3).forEach(q=>{
    const npc=_npcs[marks.length%Math.max(1,_npcs.length)];
    if(npc) marks.push({x:Math.round(npc.x), y:Math.round(npc.y)-1, label:q.titel, kind:'side'});
  });
  _questMarks=marks;
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
  if(hooks.audio) _audioApi=hooks.audio;
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
  _hero.x=built.spawn.x; _hero.y=built.spawn.y;
  _hero.px=_hero.x; _hero.py=_hero.y; _hero.moving=false; _hero.frame=0;
  loadFog(S);
  _root.classList.remove('hidden');
  document.body.classList.add('pixel-ow');
  _active=true; _last=0;
  fitCanvas();
  updatePartyPanel();
  try{
    const key=_audioApi?.musicForMapKind?.(built.kind)||'town';
    _audioApi?.fadeTo?.(key);
  }catch(_){}
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
  return {active:_active, desktop:_desktop, scale:_intScale, view:{w:_viewW,h:_viewH}, hero:{..._hero}, map:{w:_map.w,h:_map.h,name:_map.name,kind:_map.kind,preset:_map.preset,overhead:(_overhead||[]).length}, overhead:_overhead.slice(0,8), npcs:_npcs.map(n=>({name:n.name,x:n.x,y:n.y})), doors:_map.doors, fog:{explored:_explored.size, visible:_visible.size}};
}
export function __tryMove(dx,dy){ return tryMove(dx,dy); }
export function __talkNearest(){ return talkNearest(); }

export default { mountOverworld, showOverworld, hideOverworld, refreshOverworld, isOverworldActive, buildMapForLocation, showDialogue, hideDialogue, syncDialogueFromVN, __debug, __tryMove, __talkNearest, get __map(){ return __map; } };
