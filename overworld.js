/** v28 Pixel JRPG overworld — dense art, unique orts, soft FoW, day/night, weather, audio */
const TILE = 16;
const SPR = 64; // LPC frame size in walk sheets (256×256 = 4×4)
const MOBILE_VIEW = { w: 13, h: 27 }; /* v45d: fill 390x844 — was 11x13 letterboxing ~45% */
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
  camp_burnt: './assets/pixel/tiles/camp_burnt.png',
  burnt: './assets/pixel/tiles/burnt.png',
  ash: './assets/pixel/tiles/ash.png',
  ember: './assets/pixel/tiles/ember.png',
  fence_broken: './assets/pixel/tiles/fence_broken.png',
  house: './assets/pixel/tiles/house.png',
  ruin: './assets/pixel/tiles/ruin.png',
  fence: './assets/pixel/tiles/fence.png',
  well: './assets/pixel/tiles/well.png',
  flower: './assets/pixel/tiles/flower.png',
  stall: './assets/pixel/tiles/stall.png',
  wood: './assets/pixel/tiles/wood.png',
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
  chest: './assets/pixel/decor/chest.png',
  statue: './assets/pixel/decor/statue.png',
  cart: './assets/pixel/decor/cart.png',
  shadow: './assets/pixel/decor/shadow.png',
  watchtower: './assets/pixel/decor/watchtower.png',
  pine: './assets/pixel/decor/pine.png',
  rock: './assets/pixel/decor/rock.png',
  snowdrift: './assets/pixel/decor/snowdrift.png',
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
  // v60: Nocturna area grades (hand-tinted packs under tiles-nocturna/areas/)
  if(g==='daemon' || pack==='tiles-nocturna'){
    const ort=String(S?.world?.scene?.ort||'').toLowerCase();
    let area='throne';
    if(/pass|grenze|wachturm/.test(ort)) area='pass';
    else if(/solmir|gruft|krypta|ruine/.test(ort)) area='crypt';
    else if(/kathedrale|solari|kirche|licht/.test(ort)) area='cathedral';
    else if(/thron|festung|katakomb/.test(ort)) area='throne';
    const base=`./assets/pixel/tiles-nocturna/areas/${area}`;
    for(const k of ['grass','path','water','stone','floor','wall','tree','sand']){
      set[k]=`${base}/${k}.png`;
    }
    set.plaza=`./assets/pixel/tiles-nocturna/plaza.png`;
    set.carpet=set.plaza;
    set.wood=`./assets/pixel/tiles-nocturna/wood.png`;
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
  if(/thron/.test(low)) preset='throne';
  else if(/grenzpass|\bpass\b|wachturm/.test(low)) preset='wall';
  else if(/solmir|gruft|krypta/.test(low)) preset='graveyard';
  else if(/kathedrale|solari/.test(low)) preset='church';

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
  // v47c: active dungeon run always uses dungeon floorplan (not village/gate from name tokens)
  if(S?.content39?.dungeon || kind==='dungeon'){
    // don't let "Ostwall"/gate tokens steal the layout
    if(!/summon|throne|interior/.test(preset)) { preset='dungeon'; kind='dungeon'; }
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
  const w = handHub?30: kind==='dungeon'?26: kind==='camp'?18: kind==='interior'?16:30;
  const ht = handHub?34: kind==='dungeon'?32: kind==='camp'?16: kind==='interior'?14:34;
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
  } else if(preset==='dungeon'){
    kind='dungeon';
    fill(0,0,w,ht,'void');
    fill(1,1,w-2,ht-2,'wall');
    // v47d: multi-chamber layout scaled for taller/wider dungeon
    [[2,2,10,8],[14,2,10,8],[2,12,10,8],[14,12,10,8],[8,8,10,6],[2,22,10,7],[14,22,10,7]].forEach(([rx,ry,rw,rh])=>{
      if(ry+rh<ht && rx+rw<w) fill(rx,ry,rw,rh,'floor');
    });
    fill(11,6,4,3,'floor'); fill(6,10,3,5,'floor'); fill(17,10,3,5,'floor');
    fill(11,18,4,4,'floor');
    for(const [px,py] of [[4,4],[8,4],[16,4],[20,4],[4,14],[8,14],[16,14],[20,14],[4,24],[16,24]]){
      if(py<ht&&px<w) tiles[py][px]='stone';
    }
    fill(11,14,4,4,'plaza');
    prop(12,15,'chest'); prop(13,15,'barrel');
    anim(3,3,'torch'); anim(w-4,3,'torch'); anim(3,ht-5,'torch'); anim(w-4,ht-5,'torch');
    anim(12,14,'torch'); anim(14,14,'torch');
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
    // v62: castle hall — pillars, carpet, real throne, side alcoves
    kind='interior';
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++) tiles[y][x]='floor';
    fill(0,0,w,2,'wall'); fill(0,ht-2,w,2,'wall'); fill(0,0,2,ht,'wall'); fill(w-2,0,2,ht,'wall');
    // wide carpet aisle with soft edge (plaza border)
    fill(cx-2, 3, 5, ht-6, 'carpet');
    for(let y=3;y<ht-3;y++){
      if(tiles[y]){ tiles[y][cx-3]='plaza'; tiles[y][cx+3]='plaza'; }
    }
    // throne dais
    fill(cx-4, 2, 9, 5, 'plaza');
    fill(cx-2, 2, 5, 3, 'carpet');
    overhead.push({x:cx-1,y:2,src:DECOR.throne_chair,tw:2,th:2.5,label:'Thron'});
    prop(cx, 3, 'statue');
    // pillar rows with torch glow
    for(let y=7;y<ht-5;y+=3){
      if(tiles[y]){ tiles[y][cx-5]='stone'; tiles[y][cx+5]='stone'; }
      prop(cx-5, y, 'statue'); prop(cx+5, y, 'statue');
      anim(cx-5, y-1, 'torch'); anim(cx+5, y-1, 'torch');
      _pendingLights.push({x:cx-5+0.5,y:y-0.5,r:3}); _pendingLights.push({x:cx+5+0.5,y:y-0.5,r:3});
    }
    // side chambers
    fill(2, 5, 4, 5, 'floor'); fill(w-6, 5, 4, 5, 'floor');
    if(tiles[7]){ tiles[7][5]='door'; tiles[7][w-6]='door'; }
    fill(2, 5, 4, 1, 'wall'); fill(w-6, 5, 4, 1, 'wall');
    prop(3, 7, 'barrel'); prop(w-5, 7, 'crate');
    placeChest(cx+3, 5, {gold:18, item:'Nachtstahl-Splitter'});
    placeChest(4, cy, {gold:10, item:'Heiltrank'});
    placeChest(w-5, cy, {gold:12, item:'Antidot'});
    prop(cx-3, cy+1, 'bench'); prop(cx+3, cy+1, 'bench');
    questMark(cx, 4, 'Thron', 'story');
    fill(cx-1, ht-2, 3, 2, 'path');
    _hubNpcs.push({name:'Sekretärin Velka', x:cx+2, y:5, px:cx+2, py:5, sheet:'mage', e:'📜'});
    _hubNpcs.push({name:'General Brok', x:cx-2, y:cy, px:cx-2, py:cy, sheet:'guard', e:'🪓'});
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
      const edgeL = x < 5 + ((y*3+h)%4) + (rnd(x+y*17)%3);
      const edgeR = x > w-6 - ((y*5+h)%3) - (rnd(x*3+y)%3);
      if(edgeL || edgeR){
        tiles[y][x] = (rnd(x+y*9)%5===0)?'wall':'stone';
      } else {
        tiles[y][x]='sand';
      }
    }
    // winding path with soft edges
    let ppx=cx, ppy=0;
    while(ppy<ht){
      const half=1+(rnd(ppy*7)%2);
      for(let dx=-half;dx<=half;dx++){
        const xx=Math.max(6,Math.min(w-7,ppx+dx));
        if(tiles[ppy]?.[xx]) tiles[ppy][xx]='path';
      }
      // soft shoulder snow
      for(const s of [-half-1, half+1]){
        const xx=Math.max(5,Math.min(w-6,ppx+s));
        if(tiles[ppy]?.[xx]==='sand' && rnd(ppy+xx)%3===0) tiles[ppy][xx]='path';
      }
      if(ppy%2===0) ppx = Math.max(8, Math.min(w-9, ppx + ((ppy/2|0)%2===0?1:-1) + (rnd(ppy)%3-1)));
      ppy++;
    }
    // frozen stream — continuous meander with soft banks (not square pools)
    let sx=Math.floor(w*0.32), sy=2;
    while(sy<ht-2){
      const bend=Math.sin(sy*0.35+(h%7))*2.2;
      const mid=Math.max(8, Math.min(w-10, Math.round(sx+bend)));
      for(let k=-1;k<=2;k++){
        const xx=mid+k;
        if(xx<6||xx>w-7) continue;
        if(tiles[sy]?.[xx]==='wall'||tiles[sy]?.[xx]==='stone') continue;
        tiles[sy][xx]='water';
      }
      // snowy banks
      for(const bank of [mid-2, mid+3]){
        if(bank>5&&bank<w-6 && tiles[sy]?.[bank]==='sand'){
          ov(bank, sy, 'snowdrift'); prop(bank, sy, 'snowdrift');
        }
      }
      sx = mid;
      sy++;
    }
    // cliff shelves (irregular choke)
    for(let x=6;x<w-6;x++){
      if(Math.abs(x-cx)>2 && rnd(x+50)%3!==0){ tiles[6][x]='stone'; if(rnd(x)%4===0) tiles[6][x]='wall'; }
      if(Math.abs(x-cx)>2 && rnd(x+90)%3!==0){ tiles[ht-8][x]='stone'; }
    }
    fill(cx-1,6,3,1,'path'); fill(cx-1,ht-8,3,1,'path');
    // pass camp with fire (near spawn so towers+NPCs are on camera)
    const campX=cx-3, campY=Math.max(8, cy-1);
    fill(campX, campY, 7, 5, 'path');
    for(let j=0;j<5;j++) for(let i=0;i<7;i++){
      if(i===0||i===6||j===0||j===4){
        if(rnd(i+j*8)%2===0 && tiles[campY+j]?.[campX+i]) tiles[campY+j][campX+i]='stone';
      }
    }
    // tall watchtowers flanking the camp (visible at spawn)
    const twY=Math.max(3, campY-5);
    overhead.push({x:campX-4,y:twY,src:DECOR.watchtower,tw:3,th:5,label:'Wachturm West'});
    overhead.push({x:campX+8,y:twY,src:DECOR.watchtower,tw:3,th:5,label:'Wachturm Ost'});
    for(let j=0;j<5;j++) for(let i=0;i<3;i++){
      const y1=twY+j, xL=campX-4+i, xR=campX+8+i;
      if(tiles[y1]?.[xL]!=null) tiles[y1][xL]=(j>=4)?'path':'stone';
      if(tiles[y1]?.[xR]!=null) tiles[y1][xR]=(j>=4)?'path':'stone';
    }
    prop(campX+3, campY+2, 'campfire');
    anim(campX+3, campY+2, 'torch');
    prop(campX+1, campY+2, 'barrel');
    prop(campX+5, campY+2, 'crate');
    prop(campX+2, campY+3, 'bench');
    prop(campX+4, campY+3, 'bench');
    // pines, rocks, snowdrifts (irregular scatter)
    for(let i=0;i<14;i++){
      const tx=7+(rnd(i*13)*3)%Math.max(1,w-14);
      const ty=8+(rnd(i*17)*5)%Math.max(1,ht-16);
      if(!tiles[ty]?.[tx] || tiles[ty][tx]!=='sand') continue;
      if(i%3===0){ overhead.push({x:tx,y:ty-1,src:DECOR.pine,tw:2,th:3}); tiles[ty][tx]='tree'; }
      else if(i%3===1){ prop(tx, ty, 'rock'); }
      else { ov(tx, ty, 'snowdrift'); prop(tx, ty, 'snowdrift'); }
    }
    placeChest(cx+2, cy-1, {gold:15, item:'Eisen-Schild'});
    placeChest(8, 11, {gold:10, item:'Antidot'});
    placeChest(w-9, cy+2, {gold:18, item:'Nyx-Bericht'});
    prop(cx, cy-2, 'sign');
    questMark(cx, 7, 'Grenzpass', 'story');
    // camp NPCs with context
    _hubNpcs.push({name:'Wächter Toren', x:campX+2, y:campY+1, px:campX+2, py:campY+1, sheet:'guard', e:'🛡️', home:{x:campX+2,y:campY+1}});
    _hubNpcs.push({name:'Kundschafterin Lira', x:campX+4, y:campY+1, px:campX+4, py:campY+1, sheet:'spy', e:'🕵️', home:{x:campX+4,y:campY+1}});
    _hubNpcs.push({name:'Händler Bram', x:campX+3, y:campY+3, px:campX+3, py:campY+3, sheet:'merchant', e:'🧳', home:{x:campX+3,y:campY+3}});
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
    // v62: cathedral nave — stained glass, pillars, pews, altar
    kind='interior';
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++) tiles[y][x]='floor';
    fill(0,0,w,2,'wall'); fill(0,ht-2,w,2,'wall'); fill(0,0,2,ht,'wall'); fill(w-2,0,2,ht,'wall');
    fill(cx-1, 3, 3, ht-5, 'carpet');
    for(let y=3;y<ht-3;y++){
      if(tiles[y]){ tiles[y][cx-2]='plaza'; tiles[y][cx+2]='plaza'; }
    }
    // altar
    fill(cx-4, 2, 9, 4, 'plaza');
    overhead.push({x:cx-1,y:2,src:DECOR.altar,tw:2,th:1.5,label:'Altar'});
    prop(cx, 3, 'statue');
    anim(cx-3, 3, 'torch'); anim(cx+3, 3, 'torch');
    // pews
    for(let y=8;y<ht-5;y+=2){
      prop(cx-4, y, 'bench'); prop(cx+4, y, 'bench');
      if(tiles[y]){ tiles[y][cx-4]='wood'; tiles[y][cx+4]='wood'; }
    }
    // stained-glass window bays along walls
    const glasses=['glass_blue','glass_red','glass_green','glass_gold'];
    for(let i=0;i<4;i++){
      const y=6+i*4; if(y>=ht-4) continue;
      fill(2, y, 2, 3, 'plaza'); fill(w-4, y, 2, 3, 'plaza');
      ov(2, y+1, glasses[i%4]); ov(w-3, y+1, glasses[i%4]);
      // mark glass as special overlay drawn later
      if(tiles[y+1]){ tiles[y+1][2]='plaza'; tiles[y+1][w-3]='plaza'; }
      anim(3, y, 'torch'); anim(w-4, y, 'torch');
      _pendingLights.push({x:2.5,y:y+1.5,r:2.5,color:'glass'});
      _pendingLights.push({x:w-2.5,y:y+1.5,r:2.5,color:'glass'});
    }
    // pillars
    for(let y=8;y<ht-6;y+=4){
      if(tiles[y]){ tiles[y][cx-5]='stone'; tiles[y][cx+5]='stone'; }
      prop(cx-5, y, 'statue'); prop(cx+5, y, 'statue');
    }
    placeChest(cx+2, 5, {gold:22, item:'Heiliges Siegel'});
    placeChest(3, 8, {gold:14, item:'Weihwasser'});
    questMark(cx, 4, 'Altar', 'story');
    fill(cx-1, ht-2, 3, 2, 'path');
    _hubNpcs.push({name:'Priesterin Solara', x:cx+2, y:4, px:cx+2, py:4, sheet:'mage', e:'✝️'});
    _hubNpcs.push({name:'Akolyth', x:cx-3, y:cy, px:cx-3, py:cy, sheet:'villager', e:'🙏'});
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
    placeHouse(cx+2,cy+2,'Gasthof',{variant:3});
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
    // v62: Solmir crypt — rooms, coffins, candles, irregular chambers
    kind='dungeon';
    const rnd=(n)=>((h*1103515245+n*12345)>>>0)%100;
    fill(0,0,w,ht,'void');
    fill(1,1,w-2,ht-2,'wall');
    // organic corridor (not perfect cross) via jittered dig
    fill(cx-1, 2, 3, ht-4, 'floor');
    fill(2, cy-1, w-4, 3, 'floor');
    for(let y=3;y<ht-3;y++){
      const j=((h+y*7)%3)-1;
      if(tiles[y]?.[cx+j]) tiles[y][cx+j]='floor';
      if(tiles[y]?.[cx+j+1]) tiles[y][cx+j+1]='floor';
    }
    const rooms=[[2,2,7,6],[w-9,2,7,6],[2,ht-9,7,6],[w-9,ht-9,7,6],[cx-4,cy-4,8,7]];
    for(const [rx,ry,rw,rh] of rooms){
      fill(rx, ry, rw, rh, 'floor');
      // doorway toward center
      const midy=ry+Math.floor(rh/2), midx=rx+Math.floor(rw/2);
      if(rx<cx) fill(rx+rw-1, midy, 3, 1, 'floor');
      else if(rx>cx) fill(rx-2, midy, 3, 1, 'floor');
      if(ry<cy) fill(midx, ry+rh-1, 1, 3, 'floor');
      else if(ry>cy) fill(midx, ry-2, 1, 3, 'floor');
      // coffins + candles
      for(let i=0;i<3;i++){
        const cxr=rx+2+i*2, cyr=ry+2;
        if(cxr<rx+rw-1 && cyr<ry+rh-1){
          prop(cxr, cyr, 'coffin');
          anim(cxr, cyr-1, 'torch');
          _pendingLights.push({x:cxr+0.5,y:cyr-0.5,r:2});
        }
      }
      anim(rx+1, ry+1, 'torch'); anim(rx+rw-2, ry+rh-2, 'torch');
    }
    fill(cx-3, 2, 7, 4, 'floor');
    overhead.push({x:cx-2,y:2,src:DECOR.altar,tw:2,th:1.5,label:'Kapelle'});
    prop(cx, 3, 'statue');
    anim(cx-2, 3, 'torch'); anim(cx+2, 3, 'torch');
    // coffins near spawn
    for(let i=-2;i<=2;i++){
      if(i===0) continue;
      prop(cx+i, cy-1, 'coffin');
      anim(cx+i, cy-2, 'torch');
    }
    prop(cx-3, cy+1, 'statue'); prop(cx+3, cy+1, 'statue');
    placeChest(cx+2, 5, {gold:20, item:'Phylakterium-Splitter'});
    placeChest(5, cy+1, {gold:12, item:'Manaessenz'});
    placeChest(w-6, ht-6, {gold:16, item:'Knochen-Schlüssel'});
    questMark(cx, 4, 'Erster Held', 'secret');
    fill(cx-1, ht-3, 3, 2, 'path');
    if(tiles[ht-2]) tiles[ht-2][cx]='door';
    _hubNpcs.push({name:'Grabräuber', x:cx-2, y:cy+1, px:cx-2, py:cy+1, sheet:'spy', e:'💀'});
    _hubNpcs.push({name:'Chronistin Mara', x:5, y:4, px:5, py:4, sheet:'mage', e:'📖'});
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
  const R=_desktop
    ? (townish?18:10)
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
  // towns: reveal whole map once so Chrono-Trigger density is visible
  if(townish && _map){
    for(let y=0;y<_map.h;y++) for(let x=0;x<_map.w;x++) _explored.add(fogKey(x,y));
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
  // v45e: real LPC/port bust — never C43 procedural blob
  let usedPx=false;
  try{
    const S=_hooks.getS?.();
    const fullName=String(name||'');
    const npc=(S?.world?.npcs&&(S.world.npcs[fullName]||Object.entries(S.world.npcs).find(([k])=>k.startsWith(fullName)||fullName.startsWith(k))?.[1]))||null;
    const C45=window.__game?.C45;
    const C46=window.__game?.C46;
    const n=npc||{art:sheet||'villager', sheet};
    const role=C46?.portraitRole?.(fullName||'NPC', n)||C45?.roleFromNpc?.(fullName,n)||'villager';
    const roleUrl=C45?.ROLE_PORT?.[role]||C45?.ROLE_PORT?.villager;
    if(port && roleUrl){ port.src=roleUrl; usedPx=true; }
    C45?.loadFramedRolePortrait?.(role).then(url=>{ if(url && port) port.src=url; });
  }catch(_){}
  if(port && !usedPx) port.src=(window.__game?.C45?.ROLE_PORT?.villager)||PORTRAITS[sheet]||PORTRAITS.default;
  if(nm){
    let shown=String(name||'…').slice(0,28);
    try{
      const S=_hooks.getS?.();
      const Know=window.__game?.Know;
      const full=Object.keys(S?.world?.npcs||{}).find(k=>k===name||k.startsWith(name)||name.startsWith(k.split(' ')[0]));
      if(full && Know) shown=Know.displayName(S,full,S.world.npcs[full]).slice(0,32);
    }catch(_){}
    nm.textContent=shown;
  }
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
    ctx.fillStyle='#3a3428'; ctx.fillRect(dx+tw*0.2, dy+tw*0.15, tw*0.6, tw*1.0);
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
  ctx.fillStyle=(_map?.kind==='dungeon'||_map?.kind==='interior')?'#0a0c12':'#1e4a28'; ctx.fillRect(0,0,cssW,cssH);

  let tw = Math.floor(Math.min(cssW/_viewW, cssH/_viewH));
  // v47: prefer covering full height on mobile (absorb 1–2px remainder into tile size)
  if(!_desktop && tw*_viewH < cssH && tw*_viewW <= cssW){
    const twH=Math.floor(cssH/_viewH);
    if(twH*_viewW <= cssW+2) tw=Math.max(tw, twH);
  }
  const camX=_hero.px - _viewW/2 + 0.5;
  const camY=_hero.py - _viewH/2 + 0.5;
  const x0=Math.floor(camX)-1, y0=Math.floor(camY)-1;
  const x1=x0+_viewW+3, y1=y0+_viewH+3;
  const waterIm=loadImg(WATER_ANIM);
  const ox=Math.floor((cssW - _viewW*tw)/2);
  // v47: no black letterbox band — pin map to top, extend view if needed
  // v62: never letterbox — pin to top so black bands disappear
  let oy=0;

  for(let y=y0;y<=y1;y++){
    for(let x=x0;x<=x1;x++){
      const sx=ox+(x-camX)*tw, sy=oy+(y-camY)*tw;
      if(y<0||x<0||y>=_map.h||x>=_map.w){
        // v47c: extend biome beyond map — grass town, dark dungeon (no black letterbox)
        const indoor=_map.kind==='dungeon'||_map.kind==='interior';
        if(indoor){ ctx.fillStyle='#0a0c12'; ctx.fillRect(sx,sy,tw,tw); }
        else {
          const gim=loadImg(tileUrl('grass'));
          if(gim.complete && gim.naturalWidth) ctx.drawImage(gim, sx, sy, tw, tw);
          else { ctx.fillStyle='#2a6a34'; ctx.fillRect(sx,sy,tw,tw); }
        }
        continue;
      }
      const k=fogKey(x,y);
      const seen=_explored.has(k), vis=_visible.has(k);
      if(!seen){
        // v47c: unexplored ground matches biome — grass outdoors, dark stone in dungeon/interior
        const indoor=_map.kind==='dungeon'||_map.kind==='interior';
        if(indoor){
          ctx.fillStyle='#12141c'; ctx.fillRect(sx,sy,tw,tw);
          ctx.fillStyle='rgba(5,4,10,.55)'; ctx.fillRect(sx,sy,tw,tw);
        } else {
          const gim=loadImg(tileUrl('grass'));
          if(gim.complete && gim.naturalWidth) ctx.drawImage(gim, sx, sy, tw, tw);
          else { ctx.fillStyle='#1a3a22'; ctx.fillRect(sx,sy,tw,tw); }
          ctx.fillStyle='rgba(5,4,10,.72)'; ctx.fillRect(sx,sy,tw,tw);
        }
        continue;
      }
      const t=_map.tiles[y][x];
      // ground under solids / transparent decor tiles (flower etc.)
      const needsGrass = t!=='void' && t!=='wall' && t!=='floor' && (SOLID.has(t) || t==='door' || t==='house' || t==='flower' || t==='bush' || t==='well' || t==='stall');
      if(needsGrass || t==='flower' || t==='bush' || t==='well' || t==='stall'){
        const gim=loadImg(tileUrl('grass'));
        if(gim.complete && gim.naturalWidth) ctx.drawImage(gim, sx, sy, tw, tw);
        else { ctx.fillStyle='#2a5a28'; ctx.fillRect(sx,sy,tw,tw); }
      }
      if(t==='water' && waterIm.complete && waterIm.naturalWidth){
        const fw=16;
        ctx.drawImage(waterIm, (_waterFrame%4)*fw, 0, fw, fw, sx, sy, tw, tw);
      } else if(t==='flower' || t==='bush' || t==='stall' || t==='well'){
        // never draw well (blue) or stall (tiny cottage) as ground tiles
        if(t==='stall'){
          const pim=loadImg(tileUrl('path'));
          if(pim.complete && pim.naturalWidth) ctx.drawImage(pim, sx, sy, tw, tw);
        }
      } else {
        const im=loadImg(tileUrl(t));
        if(im.complete && im.naturalWidth) ctx.drawImage(im, sx, sy, tw, tw);
        else {
          ctx.fillStyle=t==='water'?'#3a7a9a':t==='void'?'#0a0c12':t==='wall'?'#444':t==='floor'?'#3a3a48':t==='path'?'#a88c5a':t==='house'||t==='stone'?'#6a5a4a':'#2a5a28';
          ctx.fillRect(sx,sy,tw,tw);
        }
      }
      // flower overlay: ensure green underlay if somehow missing
      if(_map.overlay?.[y]?.[x]==='flower' && t!=='grass' && t!=='path' && t!=='plaza'){
        const gim=loadImg(tileUrl('grass'));
        if(gim.complete && gim.naturalWidth) ctx.drawImage(gim, sx, sy, tw, tw);
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
            if(nt && nt!==t && nt!=='void'){
              ctx.fillStyle='rgba(0,0,0,0.18)';
              if(dx===1) ctx.fillRect(sx+tw-2, sy, 2, tw);
              if(dx===-1) ctx.fillRect(sx, sy, 2, tw);
              if(dy===1) ctx.fillRect(sx, sy+tw-2, tw, 2);
              if(dy===-1) ctx.fillRect(sx, sy, tw, 2);
            }
          }
        }
      }catch(_){}
      // v62: cliff vertical face — stone/wall above sand/path gets a dark drop + snow lip
      try{
        if((t==='stone'||t==='wall') && y+1<_map.h){
          const below=_map.tiles[y+1][x];
          if(below==='sand'||below==='path'||below==='grass'||below==='water'){
            // vertical face spilling into the tile below
            ctx.fillStyle='rgba(28,30,40,0.92)';
            ctx.fillRect(sx, sy+tw*0.35, tw, tw*0.65);
            ctx.fillStyle='rgba(12,14,20,0.75)';
            ctx.fillRect(sx, sy+tw*0.7, tw, tw*0.3);
            ctx.fillStyle='rgba(8,8,12,0.35)';
            ctx.fillRect(sx, sy+tw, tw, tw*0.35); // shadow on tile below
            ctx.fillStyle='rgba(235,242,250,0.95)';
            ctx.fillRect(sx, sy+tw*0.32, tw, Math.max(2,tw*0.1));
            // jagged edge
            ctx.fillStyle='rgba(60,65,80,0.8)';
            for(let i=0;i<4;i++) ctx.fillRect(sx+i*(tw/4), sy+tw*0.35, tw/8, tw*0.15);
          }
        }
      }catch(_){}
      const ov=_map.overlay?.[y]?.[x];
      if(ov && DECOR[ov] && !String(ov).startsWith('house') && !/^d\d$/.test(String(ov))){
        const dim=loadImg(DECOR[ov]);
        if(dim.complete && dim.naturalWidth){
          let dw=tw*0.85, dh=tw*0.85, ox=0, oy=0;
          if(ov==='bush'||ov==='tree'){ dw=tw; dh=tw; }
          else if(ov==='pine'){ dw=tw*1.6; dh=tw*2.4; oy=-tw*1.2; }
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
        const R=_desktop?(isDungeon?16:15):Math.max(17, Math.ceil(Math.max(_viewW||13,_viewH||15)*0.58));
        const band=isDungeon?7.5:5.5;
        if(dist > R-band){
          const t=Math.min(1, (dist-(R-band))/band);
          const ease=t*t*(3-2*t); // smoothstep
          const a=ease*(isDungeon?0.18:0.24);
          ctx.fillStyle=`rgba(6,8,14,${a.toFixed(3)})`;
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
    // v45e: nameplate only when near hero — stops giant ghost labels on desktop scale
    const near=Math.hypot((n.px||n.x)-_hero.px,(n.py||n.y)-_hero.py)<4.5;
    if(near){
      let label='?';
      try{
        const Know=window.__game?.Know;
        const S=_hooks.getS?.();
        if(Know?.isNameKnown?.(S,n.name)) label=(n.name||'').split(' ')[0].slice(0,8);
        else label='…';
      }catch(_){ label='…'; }
      if(label && label!=='…'){
        ctx.fillStyle='rgba(0,0,0,.55)';
        ctx.font='bold 9px monospace';
        const twm=ctx.measureText(label).width;
        ctx.fillRect(sx+tw/2-twm/2-3, sy-11, twm+6, 11);
        ctx.fillStyle='#ffe8a0'; ctx.fillText(label, sx+tw/2-twm/2, sy-3);
      }
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
    if(/watchtower|pine|throne_chair|altar/.test(String(oh.src||oh.label||''))){
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
  // v47c: re-veil unexplored after tint — keep grass under soft charcoal (never pure black squares/letterbox)
  for(let y=y0;y<=y1;y++){
    for(let x=x0;x<=x1;x++){
      const sx=ox+(x-camX)*tw, sy=oy+(y-camY)*tw;
      const indoor=_map.kind==='dungeon'||_map.kind==='interior';
      if(y<0||x<0||y>=_map.h||x>=_map.w){
        if(indoor){ ctx.fillStyle='#0a0c12'; ctx.fillRect(sx,sy,tw,tw); }
        else { ctx.fillStyle='rgba(5,4,10,.28)'; ctx.fillRect(sx,sy,tw,tw); }
        continue;
      }
      if(!_explored.has(fogKey(x,y))){
        if(indoor){ ctx.fillStyle='#12141c'; ctx.fillRect(sx,sy,tw,tw); }
        else {
          const gim=loadImg(tileUrl('grass'));
          if(gim.complete && gim.naturalWidth) ctx.drawImage(gim, sx, sy, tw, tw);
          else { ctx.fillStyle='#1a3a22'; ctx.fillRect(sx,sy,tw,tw); }
        }
        ctx.fillStyle='rgba(5,4,10,.72)'; ctx.fillRect(sx,sy,tw,tw);
      }
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
      // v45d: softer bloom — was washing buildings grey
      // v45e: tiny window glow only — no room washout
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
  const phase=phaseNow();
  let hour=12;
  try{ const raw=_hooks.getS?.()?.cal?.hour; if(raw!=null && raw!=='') hour=Number(raw)|0; }catch(_){}
  for(const n of _npcs){
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
      try{ _audioApi?.playSfx?.('ok'); }catch(_){}
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
  _desktop=isDesktop();
  document.body.classList.toggle('ow-desktop', _desktop);
  if(_desktop){
    // v62: fill FULL desktop width AND height (no black band / no forced 16:9 letterbox)
    const stage=document.getElementById('stage');
    const topbar=document.querySelector('.topbar');
    const topbarH=(topbar?.getBoundingClientRect?.().height)|0 || 52;
    const maxW=Math.max(640, (stage?.clientWidth||window.innerWidth) - 2);
    const maxH=Math.max(400, (stage?.clientHeight ? stage.clientHeight - 4 : (window.innerHeight - topbarH)));
    const cssW=maxW;
    const cssH=maxH;
    let scale=Math.max(2, Math.floor(cssW/320));
    while(DESKTOP_LOGICAL.w*scale>cssW || DESKTOP_LOGICAL.h*scale>cssH) scale--;
    scale=Math.max(2, scale);
    // logical buffer matches aspect of available area
    let lw=Math.floor(cssW/scale);
    let lh=Math.floor(cssH/scale);
    lw=Math.max(320, Math.floor(lw/16)*16);
    lh=Math.max(180, Math.floor(lh/16)*16);
    _canvas.width=lw;
    _canvas.height=lh;
    _canvas.style.width=cssW+'px';
    _canvas.style.height=cssH+'px';
    _intScale=scale;
    _viewW=Math.max(16, Math.floor(lw/16));
    _viewH=Math.max(12, Math.floor(lh/16));
    // bump view to consume leftover pixels inside buffer
    while(_viewH*Math.floor(Math.min(lw/_viewW, lh/_viewH)) < lh-2 && _viewH<48) _viewH++;
    while(_viewW*Math.floor(Math.min(lw/_viewW, lh/_viewH)) < lw-2 && _viewW<64) _viewW++;
  } else {
    // v45d: canvas = full viewport; tile count fills height (no letterbox)
    const root=_root||document.getElementById('owRoot');
    const w=Math.max(320, window.innerWidth|0);
    const h=Math.max(480, window.innerHeight|0);
    _canvas.style.width=w+'px';
    _canvas.style.height=h+'px';
    _canvas.width=w;
    _canvas.height=h;
    // v47: choose tile size so map fills full viewport height (no black band)
    const targetTw=28;
    _viewW=Math.max(11, Math.floor(w/targetTw));
    _viewH=Math.max(15, Math.floor(h/targetTw));
    // bump viewH if remainder would letterbox
    while(_viewH*Math.floor(Math.min(w/_viewW, h/_viewH)) < h - 4 && _viewH < 40) _viewH++;
    _intScale=3;
    try{ root?.classList.add('ow-fullscreen'); }catch(_){}
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
            <button type="button" class="ow-fs" id="owTravel" title="Reisekarte" aria-label="Reisekarte">🗺</button>
            <span class="ow-hint" id="owHint">WASD · Enter reden · Esc Menü · T Text · 🗺 Reise</span>
          </div>
          <div class="ow-pad ow-pad-float" id="owPad">
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
  // v46: preload walk sheets so drawSprite never flashes blue placeholders
  try{ loadImg('./assets/pixel/hero/walk.png'); Object.values(NPC_SHEETS||{}).forEach(loadImg); }catch(_){}
  ensureDlg();
  if(_bound){ fitCanvas(); return; }
  // v45 swipe / tap-to-move on canvas
  try{
    let sx=0,sy=0,st=0;
    _canvas.addEventListener('touchstart',(e)=>{
      const t=e.changedTouches?.[0]; if(!t) return;
      sx=t.clientX; sy=t.clientY; st=performance.now();
    },{passive:true});
    _canvas.addEventListener('touchend',(e)=>{
      const t=e.changedTouches?.[0]; if(!t) return;
      const dx=t.clientX-sx, dy=t.clientY-sy, dt=performance.now()-st;
      if(dt>500) return;
      if(Math.hypot(dx,dy)<24){
        // tap — try talk if near NPC else step toward tap relative to center
        const rect=_canvas.getBoundingClientRect();
        const cx=rect.left+rect.width/2, cy=rect.top+rect.height/2;
        const tx=t.clientX-cx, ty=t.clientY-cy;
        if(Math.hypot(tx,ty)<28){ try{ talkNearest(); }catch(_){} return; }
        const ax=Math.abs(tx)>Math.abs(ty)?Math.sign(tx):0;
        const ay=Math.abs(ty)>=Math.abs(tx)?Math.sign(ty):0;
        try{ queueMove?.(ax,ay) || (_padAxes={x:ax,y:ay}); }catch(_){ _padAxes={x:ax,y:ay}; }
        setTimeout(()=>{ _padAxes={x:0,y:0}; }, 180);
        return;
      }
      if(Math.abs(dx)<30 && Math.abs(dy)<30) return;
      const ax=Math.abs(dx)>Math.abs(dy)?Math.sign(dx):0;
      const ay=Math.abs(dy)>=Math.abs(dx)?Math.sign(dy):0;
      _padAxes={x:ax,y:ay};
      setTimeout(()=>{ _padAxes={x:0,y:0}; }, 220);
    },{passive:true});
  }catch(_){}

  _bound=true;
  fitCanvas();
  window.addEventListener('resize', ()=>{ fitCanvas(); draw(); });

  document.getElementById('owFullscreen')?.addEventListener('click', toggleFullscreen);
  document.getElementById('owTravel')?.addEventListener('click', ()=>{ try{ _hooks.openTravel?.(); }catch(_){ } });

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
  try{ window.__game?.UI14?.dismissBegegnung?.(); document.getElementById('begegnung')?.classList.add('hidden'); }catch(_){}
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
  if(Array.isArray(built.questMarks)&&built.questMarks.length){ _questMarks=(_questMarks||[]).concat(built.questMarks); }
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
          window.__game?.toast?.('↑ Wischen · Steuerkreuz · Tippen');
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
  return {active:_active, desktop:_desktop, scale:_intScale, view:{w:_viewW,h:_viewH}, hero:{..._hero}, map:{w:_map.w,h:_map.h,name:_map.name,kind:_map.kind,preset:_map.preset,overhead:(_overhead||[]).length}, overhead:_overhead.slice(0,8), npcs:_npcs.map(n=>({name:n.name,x:n.x,y:n.y,slot:n._calSlot,cal:!!n.calendar,pace:n.pace})), questMarks:_questMarks.slice(), chests:_chests.slice(0,8), doors:_map.doors, fog:{explored:_explored.size, visible:_visible.size}};
}
export function __setHero(x,y){ if(!_hero) return false; _hero.x=+x; _hero.y=+y; _hero.px=_hero.x; _hero.py=_hero.y; _hero.moving=false; try{draw();}catch(_){} return true; }
export function __tryMove(dx,dy){ return tryMove(dx,dy); }
export function __talkNearest(){ return talkNearest(); }

export default { mountOverworld, showOverworld, hideOverworld, refreshOverworld, isOverworldActive, buildMapForLocation, showDialogue, hideDialogue, syncDialogueFromVN, __debug, __setHero, __tryMove, __talkNearest, get __map(){ return __map; } };
