/** v48: FF6-like battle stage + OW calm + craft chrome helpers */
import * as C47 from './content47.js';

export function densifyTownMapV48(map){
  C47.densifyTownMapV47(map);
  if(!map?.tiles) return map;
  const w=map.w, h=map.h;
  if(!map.overlay) map.overlay=Array.from({length:h},()=>Array(w).fill(null));
  // Calmer zombie/cyber: strip excess water/ruin and prop spam
  const genre=String(map.genre||'');
  const wastes=/zombie|apokal|seuche|wastes|ruins/i.test(genre)||map.kind==='ruins';
  const neon=/cyber|neon/i.test(genre)||map.kind==='neon';
  let water=0, ruin=0, props=0;
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){
    const t=map.tiles[y][x];
    if(t==='water'){
      water++;
      if(wastes && water>18) map.tiles[y][x]='grass';
      if(neon && water>6) map.tiles[y][x]='floor';
    }
    if(t==='ruin'){
      ruin++;
      if(ruin>14) map.tiles[y][x]=(ruin%2)?'grass':'stone';
    }
    const ov=map.overlay[y][x];
    if(ov==='barrel'||ov==='crate'||ov==='sign'){
      props++;
      const lim=wastes||neon?3:4;
      if(props>lim) map.overlay[y][x]=(props%2)?'bush':'flower';
    }
  }
  return map;
}

export function migrateV48(S){
  C47.migrateV47(S);
  S.flags=S.flags||{};
  S.flags.visual48=true;
  S.ver=48;
  return S;
}

export function battleEnemyScale(f){
  if(f?.boss) return 'boss';
  if(/golem|dragon|tyrant|lich|chrome|fogking|archfiend/i.test(String(f?.id||f?.name||''))) return 'large';
  return 'normal';
}

export default {
  densifyTownMapV48, migrateV48, battleEnemyScale,
  TOWN_HOUSE_SRCS: C47.TOWN_HOUSE_SRCS,
  TOWN_HALL_SRCS: C47.TOWN_HALL_SRCS,
  portraitRole: C47.portraitRole,
};
