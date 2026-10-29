import * as V25 from './visual25d.js';
/** v13 huge world map: seeded procedural chunks, fog, rumored/visited, player drawing */
function hash32(s){let h=2166136261>>>0;const str=String(s);for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function mulberry(seed){let t=seed>>>0;return()=>{t+=0x6D2B79F5;let r=Math.imul(t^t>>>15,1|t);r^=r+Math.imul(r^r>>>7,61|r);return((r^r>>>14)>>>0)/4294967296}}
const TERRAIN=['ebene','wald','hügel','berg','sumpf','wüste','küste','ruine','dorf','stadt','verlies','see'];
const TERRAIN_ICON={ebene:'🌾',wald:'🌲',hügel:'⛰',berg:'🏔',sumpf:'🫧',wüste:'🏜',küste:'🌊',ruine:'🏚',dorf:'🏘',stadt:'🏰',verlies:'🕳',see:'💧'};

export function blankAtlas(seed){
  return {
    seed:seed||('w'+Date.now()),
    chunks:{}, // "cx,cy" -> {locs:[]}
    fog:{}, // locId -> 'unknown'|'rumored'|'known'|'visited'
    marks:[], // {id,x,y,label,note,kind}
    drawings:[], // {id,points:[{x,y}],color}
    playerPos:{x:0,y:0},
    zoom:1, pan:{x:0,y:0}
  };
}

export function ensureAtlas(S){
  if(!S.atlas)S.atlas=blankAtlas(S.worldSeed||S.role||'held');
  if(!S.atlas.fog)S.atlas.fog={};
  return S.atlas;
}

function chunkKey(cx,cy){return cx+','+cy}
export function genChunk(atlas,cx,cy){
  const key=chunkKey(cx,cy);
  if(atlas.chunks[key])return atlas.chunks[key];
  const rng=mulberry(hash32(atlas.seed+'|'+key));
  const locs=[];
  const n=3+Math.floor(rng()*5);
  for(let i=0;i<n;i++){
    const terr=TERRAIN[Math.floor(rng()*TERRAIN.length)];
    const id=`${terr}_${cx}_${cy}_${i}`;
    const name=nameFor(terr,cx,cy,i,rng);
    const x=cx*100+(rng()*90-45);
    const y=cy*100+(rng()*90-45);
    locs.push({id,name,terrain:terr,x,y,desc:descFor(terr,rng),exits:[],discovered:false});
  }
  // link nearby in chunk
  for(let i=0;i<locs.length;i++){
    const a=locs[i];
    locs.forEach((b,j)=>{if(i===j)return;const d=Math.hypot(a.x-b.x,a.y-b.y);if(d<40)a.exits.push(b.id)});
  }
  atlas.chunks[key]= {cx,cy,locs};
  return atlas.chunks[key];
}

function nameFor(terr,cx,cy,i,rng){
  const A=['Nord','Süd','Ost','West','Alt','Neu','Hoch','Tief','Grau','Silber','Nacht','Sonn'];
  const B={ebene:['felder','auen','matten'],wald:['wald','hain','forst'],hügel:['höhen','hügel'],berg:['spitze','grat','horn'],sumpf:['moor','bruch'],wüste:['dünen','wüste'],küste:['bucht','ufer'],ruine:['ruinen','trümmer'],dorf:['dorf','heim'],stadt:['stadt','burg','markt'],verlies:['grüfte','schacht'],see:['see','weiher']};
  const a=A[Math.floor(rng()*A.length)];
  const b=(B[terr]||['ort'])[Math.floor(rng()*(B[terr]||['ort']).length)];
  return `${a}${b.charAt(0).toUpperCase()+b.slice(1)}${i?['','-Ost','-West','-Klein'][i%4]:''}`;
}
function descFor(terr,rng){
  const d={ebene:'Weites Grasland.',wald:'Dichte Baumkronen.',hügel:'Sanfte Erhebungen.',berg:'Steile Felsen.',sumpf:'Feucht und trügerisch.',wüste:'Heißer Sand.',küste:'Salzige Luft.',ruine:'Vergessene Mauern.',dorf:'Rauch aus Schornsteinen.',stadt:'Lärm und Handel.',verlies:'Kühle Dunkelheit.',see:'Still und tief.'};
  return d[terr]||'Unbekanntes Terrain.';
}

export function ensureSpawn(S){
  const a=ensureAtlas(S);
  genChunk(a,0,0);genChunk(a,-1,0);genChunk(a,0,-1);genChunk(a,1,0);genChunk(a,0,1);
  // seed start location as visited
  const start=S.world?.scene?.ort;
  if(start){
    // bind pack locations into atlas at origin ring
    placeKnown(S,start,0,0,'visited');
  }
  // place pack graph nodes around origin
  const g=S.world?.graph?.nodes||{};
  let i=0;
  for(const name of Object.keys(g)){
    const ang=(i/Math.max(1,Object.keys(g).length))*Math.PI*2;
    const r=20+((i%5)*12);
    placeKnown(S,name,Math.cos(ang)*r,Math.sin(ang)*r, name===start?'visited':'known');
    i++;
  }
  return a;
}

export function placeKnown(S,name,x,y,fog='known'){
  const a=ensureAtlas(S);
  const id='known_'+hash32(name).toString(36);
  // find or create in chunk 0
  const ch=genChunk(a,0,0);
  let loc=ch.locs.find(l=>l.name===name||l.id===id);
  if(!loc){loc={id,name,terrain:'stadt',x,y,desc:S.world?.orte?.[name]||'',exits:[],discovered:fog==='visited'};ch.locs.push(loc)}
  else {loc.x=x;loc.y=y}
  a.fog[loc.id]=fog;
  a.fog[name]=fog;
  if(fog==='visited')loc.discovered=true;
  return loc;
}

export function setFog(S,key,level){
  const a=ensureAtlas(S);
  const order=['unknown','rumored','known','visited'];
  const cur=a.fog[key]||'unknown';
  if(order.indexOf(level)>=order.indexOf(cur))a.fog[key]=level;
}

export function visitPlace(S,name,xy){
  const a=ensureAtlas(S);
  setFog(S,name,'visited');
  if(xy){a.playerPos={x:xy.x,y:xy.y}}
  // mark matching loc
  for(const ch of Object.values(a.chunks)){
    for(const loc of ch.locs){if(loc.name===name||loc.id===name){loc.discovered=true;setFog(S,loc.id,'visited');a.playerPos={x:loc.x,y:loc.y};return loc}}
  }
  return placeKnown(S,name,a.playerPos.x,a.playerPos.y,'visited');
}

export function rumorPlace(S,name,hint){
  setFog(S,name,'rumored');
  const a=ensureAtlas(S);
  // if not on map, add rumored pin near player
  let found=false;
  for(const ch of Object.values(a.chunks))for(const loc of ch.locs)if(loc.name===name)found=true;
  if(!found){
    const loc=placeKnown(S,name,a.playerPos.x+(Math.random()*60-30),a.playerPos.y+(Math.random()*60-30),'rumored');
    loc.desc=(hint||'Nur vom Hörensagen bekannt.')+' (Gerücht)';
  }
}

export function revealMapItem(S,item){
  const a=ensureAtlas(S);
  const region=item?.region||'umgebung';
  const cx=Math.round(a.playerPos.x/100), cy=Math.round(a.playerPos.y/100);
  const revealed=[];
  for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){
    const ch=genChunk(a,cx+dx,cy+dy);
    for(const loc of ch.locs){
      const inaccurate=Math.random()<0.25;
      setFog(S,loc.id,inaccurate?'rumored':'known');
      setFog(S,loc.name,inaccurate?'rumored':'known');
      if(inaccurate)loc.desc=(loc.desc||'')+' (Karte veraltet?)';
      revealed.push(loc.name);
    }
  }
  return {region,revealed:revealed.slice(0,20),count:revealed.length};
}

export function exploreDirection(S,dir){
  const a=ensureAtlas(S);
  const vec={n:[0,-1],s:[0,1],o:[1,0],w:[-1,0],no:[0.7,-0.7],nw:[-0.7,-0.7],so:[0.7,0.7],sw:[-0.7,0.7]}[dir]||[Math.random()*2-1,Math.random()*2-1];
  const dist=25+Math.random()*35;
  const nx=a.playerPos.x+vec[0]*dist, ny=a.playerPos.y+vec[1]*dist;
  const cx=Math.round(nx/100), cy=Math.round(ny/100);
  const ch=genChunk(a,cx,cy);
  // pick nearest undiscovered or create
  let best=null,bd=1e9;
  for(const loc of ch.locs){const d=Math.hypot(loc.x-nx,loc.y-ny);if(d<bd){bd=d;best=loc}}
  if(!best||bd>50){
    best={id:'disc_'+hash32(nx+','+ny).toString(36),name:nameFor(TERRAIN[Math.floor(Math.random()*TERRAIN.length)],cx,cy,0,mulberry(hash32(nx+','+ny))),terrain:'wald',x:nx,y:ny,desc:'Frisch entdeckt.',exits:[],discovered:true};
    ch.locs.push(best);
  }
  best.discovered=true;setFog(S,best.id,'visited');setFog(S,best.name,'visited');
  a.playerPos={x:best.x,y:best.y};
  return best;
}

export function addPin(S,{x,y,label,note}){
  const a=ensureAtlas(S);
  const pin={id:'pin_'+Date.now().toString(36),x,y,label:label||'Marke',note:note||'',kind:'pin'};
  a.marks.push(pin);
  return pin;
}

export function addDrawing(S,points,color='#f0d59a'){
  const a=ensureAtlas(S);
  const d={id:'draw_'+Date.now().toString(36),points,color};
  a.drawings.push(d);
  if(a.drawings.length>40)a.drawings=a.drawings.slice(-40);
  return d;
}

export function travelHours(from,to){
  if(!from||!to)return 2;
  const d=Math.hypot((to.x??0)-(from.x??0),(to.y??0)-(from.y??0));
  return Math.max(1,Math.round(d/12));
}

export function listVisible(S){
  const a=ensureAtlas(S);
  const out=[];
  for(const ch of Object.values(a.chunks)){
    for(const loc of ch.locs){
      const fog=a.fog[loc.id]||a.fog[loc.name]||'unknown';
      if(fog==='unknown')continue;
      out.push({...loc,fog,icon:TERRAIN_ICON[loc.terrain]||'•'});
    }
  }
  return out;
}

export function mergeFoundMap(S,other){
  const a=ensureAtlas(S);
  let n=0;
  for(const [k,v] of Object.entries(other?.fog||{})){setFog(S,k,v);n++}
  for(const [key,ch] of Object.entries(other?.chunks||{})){
    if(!a.chunks[key])a.chunks[key]=JSON.parse(JSON.stringify(ch));
    else {
      for(const loc of ch.locs){if(!a.chunks[key].locs.find(l=>l.id===loc.id)){a.chunks[key].locs.push(loc);n++}}
    }
  }
  return n;
}

export default {blankAtlas,ensureAtlas,ensureSpawn,genChunk,visitPlace,rumorPlace,revealMapItem,exploreDirection,addPin,addDrawing,travelHours,listVisible,placeKnown,setFog,mergeFoundMap,TERRAIN_ICON};

/* v23 iso hook */
const _v25map = (root)=>{ try{ V25.decorateMapIso(root); }catch(_){ } };
export function decorateIso(root){ _v25map(root||document.getElementById('menuBody')||document.getElementById('mapView')); }
