/** v47: town polish — foundations, props, letterbox-free FOV helpers */
import * as C46 from './content46.js';

/** Prefer fewer clutter props in densify */
export const TOWN_PROP_OVERLAYS = ['bush','flower','lamp','bench'];

export function densifyTownMapV47(map){
  C46.densifyTownMapV46(map);
  if(!map?.tiles) return map;
  const w=map.w, h=map.h;
  if(!map.overlay) map.overlay=Array.from({length:h},()=>Array(w).fill(null));
  // Cap barrel/crate/sign spam — keep at most ~8 of each, convert extras to bush/flower
  const counts={barrel:0,crate:0,sign:0,lamp:0,bench:0};
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){
    const ov=map.overlay[y][x];
    // strip noisy d0-d2 notice boards if any remain
    if(ov && /^d\d$/.test(String(ov))){ map.overlay[y][x]=null; continue; }
    if(ov==='barrel'||ov==='crate'||ov==='sign'||ov==='lamp'||ov==='bench'){
      counts[ov]=(counts[ov]|0)+1;
      const lim={barrel:4,crate:4,sign:3,lamp:10,bench:6}[ov];
      if(counts[ov]>lim){
        map.overlay[y][x]=(counts[ov]%2)?'bush':'flower';
      }
    }
    // never leave transparent tree as ground without grass — tree tile is now opaque
    if(map.tiles[y][x]==='tree' && map.overlay[y][x]==='tree') map.overlay[y][x]=null;
  }
  // Soften house path pads: convert path under overhead footprints to grass
  // (keep door tile + one stub south of door; keep main road axes)
  const cx=(w/2)|0, cy=(h/2)|0;
  const road=new Set();
  for(let x=0;x<w;x++){ road.add(x+','+cy); if(cy+1<h) road.add(x+','+(cy+1)); }
  for(let y=0;y<h;y++){ road.add(cx+','+y); if(cx+1<w) road.add((cx+1)+','+y); }
  if(Array.isArray(map.overhead)){
    for(const oh of map.overhead){
      const tw=oh.tw||3, th=oh.th||3;
      for(let j=0;j<th;j++) for(let i=0;i<tw;i++){
        const x=oh.x+i, y=oh.y+j;
        if(y<0||x<0||y>=h||x>=w) continue;
        const k=x+','+y;
        if(road.has(k)) continue;
        if(map.tiles[y][x]==='door') continue;
        if(map.tiles[y][x]==='path'||map.tiles[y][x]==='stone'||map.tiles[y][x]==='plaza'){
          // neon/cyber towns use floor as ground — don't plant grass pads under towers
          const g=String(map.genre||map.kind||'');
          const under=(map.kind==='neon'||/neon|cyber|floor/.test(g))?'floor':'grass';
          // detect floor-majority neighborhood
          let floors=0, grassn=0;
          for(let jj=-1;jj<=1;jj++) for(let ii=-1;ii<=1;ii++){
            const yy=y+jj, xx=x+ii;
            if(yy<0||xx<0||yy>=h||xx>=w) continue;
            const tt=map.tiles[yy][xx];
            if(tt==='floor') floors++;
            if(tt==='grass') grassn++;
          }
          map.tiles[y][x]=floors>grassn?'floor':'grass';
        }
      }
    }
  }
  return map;
}

export function migrateV47(S){
  C46.migrateV46(S);
  S.flags=S.flags||{};
  S.flags.visual47=true;
  S.ver=47;
  return S;
}

export default {
  densifyTownMapV47, migrateV47, TOWN_PROP_OVERLAYS,
  TOWN_HOUSE_SRCS: C46.TOWN_HOUSE_SRCS,
  TOWN_HALL_SRCS: C46.TOWN_HALL_SRCS,
  portraitRole: C46.portraitRole,
};
