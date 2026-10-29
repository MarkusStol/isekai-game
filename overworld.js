/** v24 Pixel JRPG overworld — tile map, hero walk, NPCs, d-pad / tap-to-move, talk → act() */
const TILE = 16;
const SCALE = 3;
const VIEW_W = 13, VIEW_H = 17;

const TILE_URL = {
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

const SOLID = new Set(['wall','water','tree','void']);

let _root=null, _canvas=null, _ctx=null, _imgs={}, _raf=0, _active=false;
let _map={w:24,h:24,tiles:[], doors:[], name:'', npcs:[]};
let _hero={x:12,y:12,dir:0,frame:0,moving:false,px:12,py:12};
let _npcs=[];
let _keys={}; let _tapTarget=null;
let _hooks={act:null, getS:null, onLocation:null};
let _animT=0; let _last=0; let _bound=false;

function loadImg(src){
  if(_imgs[src]) return _imgs[src];
  const im=new Image(); im.src=src; _imgs[src]=im; return im;
}
function preload(){
  Object.values(TILE_URL).forEach(loadImg);
  Object.values(NPC_SHEETS).forEach(loadImg);
  loadImg('./assets/pixel/hero/walk.png');
}

function hash(s){ let h=0; for(let i=0;i<String(s).length;i++) h=((h<<5)-h)+String(s).charCodeAt(i)|0; return Math.abs(h); }

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

  const w = kind==='dungeon'?20: kind==='camp'?16:24;
  const ht = kind==='dungeon'?18: kind==='camp'?14:24;
  const tiles=Array.from({length:ht},()=>Array(w).fill('grass'));

  const fill=(x,y,tw,th,t)=>{ for(let j=0;j<th;j++) for(let i=0;i<tw;i++){ const xx=x+i,yy=y+j; if(yy>=0&&yy<ht&&xx>=0&&xx<w) tiles[yy][xx]=t; } };

  if(kind==='town'){
    fill(0,0,w,ht,'grass');
    fill(0, Math.floor(ht/2)-1, w, 3, 'path');
    fill(Math.floor(w/2)-1, 0, 3, ht, 'path');
    for(const [bx,by,bw,bh] of [[2,2,6,5],[16,2,6,5],[2,15,6,6],[15,15,7,6],[9,8,6,5]]){
      fill(bx,by,bw,bh,'wall'); fill(bx+1,by+1,bw-2,bh-2,'floor');
      const dx=bx+Math.floor(bw/2), dy=by+bh-1; tiles[dy][dx]='door';
      if(bw>=6) fill(bx+2,by+2,2,2,'carpet');
    }
    for(let i=0;i<w;i++) if(i%3===0){ tiles[0][i]='tree'; tiles[ht-1][i]='tree'; }
  } else if(kind==='wild'){
    fill(0,0,w,ht,'grass');
    for(let y=0;y<ht;y++) for(let x=0;x<w;x++){
      const n=((h+x*17+y*31)%100);
      if(n<18) tiles[y][x]='tree'; else if(n<22) tiles[y][x]='stone'; else if(n>92) tiles[y][x]='water';
    }
    for(let x=0;x<w;x++){ tiles[Math.floor(ht/2)][x]='path'; tiles[Math.floor(ht/2)+1][x]='path'; }
    for(let y=0;y<ht;y++) tiles[y][Math.floor(w/2)]='path';
  } else if(kind==='dungeon'){
    fill(0,0,w,ht,'void'); fill(1,1,w-2,ht-2,'wall'); fill(2,2,w-4,ht-4,'floor');
    fill(2, Math.floor(ht/2), w-4, 2, 'floor'); fill(Math.floor(w/2), 2, 2, ht-4, 'floor');
    for(let i=4;i<w-4;i+=4) for(let j=4;j<ht-4;j+=4) tiles[j][i]='stone';
  } else {
    fill(0,0,w,ht,'grass');
    for(let i=0;i<w;i++){ tiles[0][i]='tree'; tiles[ht-1][i]='tree'; }
    fill(5,5,6,5,'camp'); fill(4,4,8,1,'path'); fill(4,10,8,1,'path'); fill(7,6,2,2,'carpet');
  }

  let sx=Math.floor(w/2), sy=Math.floor(ht/2);
  for(let t=0;t<60;t++){
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
    else if(/magier|hexe|zauber|mage/.test(art)) sheet='mage';
    else if(/händler|kauf|merchant|wirt/.test(art)) sheet='merchant';
    else if(/späher|dieb|assassin|spy|lyra/.test(art)) sheet='spy';
    else if(/prinzess|königin|elise|princess/.test(art)) sheet='princess';
    else if(/dämon|daemon|sukkub|teufel/.test(art)) sheet='daemon';
    let nx=sx+(i%2?2:-2)-((i>>1)%3), ny=sy+(i%3)-1;
    for(let tries=0;tries<40;tries++){
      const xx=Math.max(1,Math.min(w-2, nx+(tries%5)-2));
      const yy=Math.max(1,Math.min(ht-2, ny+Math.floor(tries/5)-1));
      const key=xx+','+yy;
      if(!SOLID.has(tiles[yy][xx]) && !used.has(key)){ nx=xx; ny=yy; used.add(key); break; }
    }
    npcs.push({name:nm, x:nx, y:ny, px:nx, py:ny, sheet, e:n.e||'👤'});
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
  // also from orte keys as soft neighbors
  if(!edgeList.length && S?.world?.orte){
    Object.keys(S.world.orte).filter(k=>k!==name).slice(0,3).forEach(k=>edgeList.push(k));
  }
  const uniq=[...new Set(edgeList)].filter(d=>d&&d!==name).slice(0,4);
  const slots=[[Math.floor(w/2),1],[Math.floor(w/2),ht-2],[1,Math.floor(ht/2)],[w-2,Math.floor(ht/2)]];
  uniq.forEach((dest,i)=>{
    const [ex,ey]=slots[i%slots.length];
    tiles[ey][ex]='door';
    exits.push({x:ex,y:ey,to:dest});
  });

  return {w,h:ht,tiles,doors:exits,spawn:{x:sx,y:sy},kind,name,npcs};
}

function walkable(x,y){
  if(y<0||x<0||y>=_map.h||x>=_map.w) return false;
  return !SOLID.has(_map.tiles[y][x]);
}

function talkTo(name){
  if(!_hooks.act) return;
  const label=String(name||'').trim();
  if(!label) return;
  try{ document.body.classList.add('ow-dialogue'); document.getElementById('txt')?.focus({preventScroll:true}); }catch(_){}
  _hooks.act('Ich rede mit '+label);
}

function tryMove(dx,dy){
  if(_hero.moving) return false;
  const nx=_hero.x+dx, ny=_hero.y+dy;
  if(dx<0)_hero.dir=1; else if(dx>0)_hero.dir=2; else if(dy<0)_hero.dir=3; else if(dy>0)_hero.dir=0;
  const bump=_npcs.find(n=>Math.round(n.x)===nx && Math.round(n.y)===ny);
  if(bump){ talkTo(bump.name); return false; }
  if(!walkable(nx,ny)) return false;
  const door=(_map.doors||[]).find(d=>d.x===nx&&d.y===ny);
  _hero.moving=true; _hero.x=nx; _hero.y=ny;
  if(door?.to && _hooks.onLocation){
    // finish step then travel
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
  _animT+=dt; if(_animT>0.12){ _animT=0; _hero.frame=(_hero.frame+1)%3; }
}

function draw(){
  if(!_ctx||!_canvas) return;
  const ctx=_ctx;
  const cssW=_canvas.width, cssH=_canvas.height;
  ctx.imageSmoothingEnabled=false;
  ctx.fillStyle='#0a0810'; ctx.fillRect(0,0,cssW,cssH);
  const camX=_hero.px - VIEW_W/2 + 0.5;
  const camY=_hero.py - VIEW_H/2 + 0.5;
  const tw=TILE*SCALE;
  const x0=Math.floor(camX)-1, y0=Math.floor(camY)-1;
  const x1=x0+VIEW_W+3, y1=y0+VIEW_H+3;
  for(let y=y0;y<=y1;y++){
    for(let x=x0;x<=x1;x++){
      let t='void';
      if(y>=0&&x>=0&&y<_map.h&&x<_map.w) t=_map.tiles[y][x];
      const im=loadImg(TILE_URL[t]||TILE_URL.void);
      const sx=(x-camX)*tw, sy=(y-camY)*tw;
      if(im.complete && im.naturalWidth) ctx.drawImage(im, sx, sy, tw, tw);
      else { ctx.fillStyle=t==='water'?'#2858a0':t==='wall'?'#444':t==='path'?'#a88c5a':'#2a5a28'; ctx.fillRect(sx,sy,tw,tw); }
    }
  }
  for(const n of _npcs){
    const im=loadImg(NPC_SHEETS[n.sheet]||NPC_SHEETS.default);
    const sx=(n.px-camX)*tw, sy=(n.py-camY)*tw - tw*0.5;
    if(im.complete && im.naturalWidth) ctx.drawImage(im, sx+tw*0.15, sy, tw*0.7, tw*1.05);
    ctx.fillStyle='rgba(0,0,0,.55)';
    const label=(n.name||'').split(' ')[0].slice(0,10);
    ctx.font='10px monospace';
    const twm=ctx.measureText(label).width;
    ctx.fillRect(sx+tw/2-twm/2-3, sy-12, twm+6, 12);
    ctx.fillStyle='#ffe8a0'; ctx.fillText(label, sx+tw/2-twm/2, sy-3);
  }
  const him=loadImg('./assets/pixel/hero/walk.png');
  const hx=(_hero.px-camX)*tw, hy=(_hero.py-camY)*tw - tw*0.5;
  if(him.complete && him.naturalWidth){
    const fw=16, fh=24;
    ctx.drawImage(him, _hero.frame*fw, _hero.dir*fh, fw, fh, hx+tw*0.1, hy, tw*0.8, tw*1.2);
  } else {
    ctx.fillStyle='#4a90d9'; ctx.fillRect(hx+tw*0.25, hy+tw*0.2, tw*0.5, tw*0.8);
  }
  ctx.fillStyle='rgba(10,20,60,.75)';
  ctx.fillRect(8,8,Math.min(cssW-16,280),22);
  ctx.strokeStyle='#9eb6ff'; ctx.strokeRect(8.5,8.5,Math.min(cssW-17,279),21);
  ctx.fillStyle='#e8f0ff'; ctx.font='12px monospace';
  ctx.fillText('📍 '+(_map.name||'').slice(0,28), 14, 23);
}

function loop(ts){
  if(!_active) return;
  const dt=Math.min(0.05, (_last? (ts-_last) : 16)/1000); _last=ts;
  let dx=0,dy=0;
  if(_keys.ArrowLeft||_keys.a||_keys.A) dx-=1;
  if(_keys.ArrowRight||_keys.d||_keys.D) dx+=1;
  if(_keys.ArrowUp||_keys.w||_keys.W) dy-=1;
  if(_keys.ArrowDown||_keys.s||_keys.S) dy+=1;
  if(_tapTarget && !_hero.moving){
    const tx=_tapTarget.x - _hero.x, ty=_tapTarget.y - _hero.y;
    if(Math.abs(tx)+Math.abs(ty)===0) _tapTarget=null;
    else if(Math.abs(tx)>=Math.abs(ty)) dx=Math.sign(tx); else dy=Math.sign(ty);
  }
  if((dx||dy) && !_hero.moving) tryMove(dx, dy);
  for(const n of _npcs){
    if(Math.random()<0.002){
      const d=[[1,0],[-1,0],[0,1],[0,-1]][Math.floor(Math.random()*4)];
      const nx=Math.round(n.x)+d[0], ny=Math.round(n.y)+d[1];
      if(walkable(nx,ny) && !_npcs.some(o=>o!==n&&Math.round(o.x)===nx&&Math.round(o.y)===ny) && !(nx===_hero.x&&ny===_hero.y)){
        n.x=nx; n.y=ny;
      }
    }
    n.px+=(n.x-n.px)*Math.min(1,dt*8); n.py+=(n.y-n.py)*Math.min(1,dt*8);
  }
  stepHero(dt);
  draw();
  _raf=requestAnimationFrame(loop);
}

function ensureDOM(){
  let root=document.getElementById('overworld');
  if(!root){
    root=document.createElement('div');
    root.id='overworld';
    root.className='overworld hidden';
    root.innerHTML=`
      <canvas id="owCanvas" width="390" height="520" aria-label="Weltkarte"></canvas>
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
    `;
    const stage=document.getElementById('stage');
    if(stage) stage.insertBefore(root, stage.firstChild);
    else document.body.appendChild(root);
  }
  _root=root;
  _canvas=document.getElementById('owCanvas');
  _ctx=_canvas.getContext('2d');
  if(_bound) return;
  _bound=true;
  const fit=()=>{
    const w=Math.min(window.innerWidth, 430);
    const h=Math.min(Math.floor(window.innerHeight*0.52), 560);
    _canvas.style.width=w+'px';
    _canvas.style.height=h+'px';
    _canvas.width=Math.floor(w);
    _canvas.height=Math.floor(h);
  };
  fit(); window.addEventListener('resize', fit);

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
  document.getElementById('owTalk')?.addEventListener('click', ()=>{
    let best=null, bd=99;
    for(const n of _npcs){
      const d=Math.abs(Math.round(n.x)-_hero.x)+Math.abs(Math.round(n.y)-_hero.y);
      if(d<bd){ bd=d; best=n; }
    }
    if(best && bd<=2) talkTo(best.name);
    else if(_hooks.act) _hooks.act('Ich schaue mich um');
  });
  document.getElementById('owKeyboard')?.addEventListener('click', ()=>{
    document.body.classList.add('ow-dialogue');
    const txt=document.getElementById('txt');
    if(txt){ txt.focus(); try{txt.scrollIntoView({block:'end'});}catch(_){}}
  });
  _canvas.addEventListener('pointerdown', e=>{
    const rect=_canvas.getBoundingClientRect();
    const tw=TILE*SCALE;
    const camX=_hero.px - VIEW_W/2 + 0.5;
    const camY=_hero.py - VIEW_H/2 + 0.5;
    const scaleX=_canvas.width/rect.width, scaleY=_canvas.height/rect.height;
    const cx=(e.clientX-rect.left)*scaleX, cy=(e.clientY-rect.top)*scaleY;
    const tx=Math.floor(camX + cx/tw), ty=Math.floor(camY + cy/tw);
    const hit=_npcs.find(n=>Math.round(n.x)===tx && Math.round(n.y)===ty);
    if(hit){ talkTo(hit.name); return; }
    _tapTarget={x:tx,y:ty};
  });
  window.addEventListener('keydown', e=>{
    if(!_active) return;
    if(document.activeElement?.id==='txt') return;
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D'].includes(e.key)){
      _keys[e.key]=true; e.preventDefault();
    }
  });
  window.addEventListener('keyup', e=>{ _keys[e.key]=false; });
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
  _npcs=(built.npcs||[]).map(n=>({...n}));
  _hero.x=built.spawn.x; _hero.y=built.spawn.y;
  _hero.px=_hero.x; _hero.py=_hero.y; _hero.moving=false; _hero.frame=0;
  _root.classList.remove('hidden');
  document.body.classList.add('pixel-ow');
  document.body.classList.remove('ow-dialogue');
  _active=true; _last=0;
  if(!_raf) _raf=requestAnimationFrame(loop);
  draw();
}

export function hideOverworld(){
  _active=false;
  if(_raf){ cancelAnimationFrame(_raf); _raf=0; }
  _root?.classList.add('hidden');
  document.body.classList.remove('pixel-ow');
}

export function refreshOverworld(S){
  if(!_active) return;
  showOverworld(S);
}

export function isOverworldActive(){ return _active; }

/** Test helpers */
export function __debug(){
  return {active:_active, hero:{..._hero}, map:{w:_map.w,h:_map.h,name:_map.name,kind:_map.kind}, npcs:_npcs.map(n=>({name:n.name,x:n.x,y:n.y})), doors:_map.doors};
}
export function __tryMove(dx,dy){ return tryMove(dx,dy); }
export function __talkNearest(){
  let best=null, bd=99;
  for(const n of _npcs){
    const d=Math.abs(Math.round(n.x)-_hero.x)+Math.abs(Math.round(n.y)-_hero.y);
    if(d<bd){ bd=d; best=n; }
  }
  if(best) talkTo(best.name);
  return best?.name||null;
}

export default { mountOverworld, showOverworld, hideOverworld, refreshOverworld, isOverworldActive, buildMapForLocation, __debug, __tryMove, __talkNearest };
