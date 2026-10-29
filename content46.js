/** v46: town tile/building cleanup + stranger-safe portraits */
import * as C45 from './content45.js';

/** Only house sprites with clear roofs, consistent ~96 footprint */
export const TOWN_HOUSE_SRCS = [
  './assets/pixel/decor/town_house_0.png',
  './assets/pixel/decor/town_house_1.png',
  './assets/pixel/decor/town_house_2.png',
  './assets/pixel/decor/town_house_3.png',
  './assets/pixel/decor/town_house_4.png',
  './assets/pixel/decor/town_house_5.png',
  './assets/pixel/decor/town_house_6.png',
  './assets/pixel/decor/town_house_7.png',
];

export const TOWN_HALL_SRCS = [
  './assets/pixel/decor/town_hall_0.png',
  './assets/pixel/decor/town_hall_1.png',
  './assets/pixel/decor/town_hall_2.png',
  './assets/pixel/decor/town_hall_3.png',
];

/** Map roles onto ROLE_PORT keys; never use PC hero sheet for NPCs */
export function portraitRole(name, npc={}){
  let r=C45.roleFromNpc(name, npc)||'villager';
  if(r==='medic') r='mage';
  if(r==='tech') r='merchant';
  const art=String(npc.art||npc.look||'').toLowerCase();
  const nm=String(name||'').toLowerCase();
  const g=String(npc.geschlecht||'');
  if(/magier|hexe|zauber|orren|nebel|liora|elara|thalia|maelis/.test(art+' '+nm)) r='mage';
  else if(/wache|ritter|guard|soldat|lucan|garrick/.test(art+' '+nm)) r='guard';
  else if(/händler|kauf|wirt|merchant|brok/.test(art+' '+nm)) r='merchant';
  else if(/prinzess|königin|elise|mira|dame/.test(art+' '+nm)) r='princess';
  else if(/späher|dieb|spy|lyra|julian/.test(art+' '+nm)) r='spy';
  else if(/dämon|daemon|velka/.test(art+' '+nm)) r='daemon';
  else if(/weib|frau/.test(g) && (r==='villager'||r==='hero')) r='princess';
  if(r==='hero' || !(r in C45.ROLE_PORT)) r='villager';
  return r;
}

export function densifyTownMapV46(map){
  C45.densifyTownMap(map);
  if(!map?.tiles) return map;
  const w=map.w, h=map.h;
  if(!map.overlay) map.overlay=Array.from({length:h},()=>Array(w).fill(null));
  const groundOk=new Set(['grass','path','plaza','stone','sand','floor','carpet','wood','door','wall','water','tree','house','ruin','fence','void','camp','burnt','ash','ember','fence_broken']);
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){
    const t=map.tiles[y][x];
    const ov=map.overlay[y][x];
    // strip tiny houseN overlays (mixed-scale red-roof cottages)
    if(ov && /^house\d/.test(String(ov))) map.overlay[y][x]=null;
    if(t==='flower'||t==='bush'){
      if(!map.overlay[y][x]) map.overlay[y][x]=t;
      map.tiles[y][x]='grass';
    } else if(t==='barrel'||t==='crate'||t==='lamp'||t==='bench'||t==='sign'){
      if(!map.overlay[y][x]) map.overlay[y][x]=t;
      map.tiles[y][x]='path';
    } else if(t==='well'||t==='stall'){
      // well=blue blob; stall=tiny red-roof cottage look
      if(t==='stall' && !map.overlay[y][x]) map.overlay[y][x]='barrel';
      map.tiles[y][x]='path';
    } else if(t && !groundOk.has(t)){
      map.tiles[y][x]='grass';
    }
    // flower overlay must sit on grass (transparent petals → black if no ground)
    if(map.overlay[y][x]==='flower' && (map.tiles[y][x]==='path'||map.tiles[y][x]==='plaza'||map.tiles[y][x]==='stone')){
      /* keep path under; flower still fine on path texture */
    }
  }
  if(map.kind!=='dungeon' && map.kind!=='wild'){
    const cx=(w/2)|0, cy=(h/2)|0;
    for(let y=Math.max(0,cy-4);y<=Math.min(h-1,cy+4);y++)
      for(let x=Math.max(0,cx-4);x<=Math.min(w-1,cx+4);x++){
        if(map.tiles[y][x]==='water'||map.tiles[y][x]==='well') map.tiles[y][x]='path';
      }
  }
  // drop water-looking overhead leftovers: filter map.overhead to roofed town_* only
  if(Array.isArray(map.overhead)){
    map.overhead=map.overhead.filter(oh=>/town_house_|town_hall_/.test(String(oh?.src||'')));
  }
  return map;
}

export function migrateV46(S){
  C45.migrateV45(S);
  S.flags=S.flags||{};
  S.flags.visual46=true;
  S.ver=46;
  return S;
}

export default {
  TOWN_HOUSE_SRCS, TOWN_HALL_SRCS, portraitRole, densifyTownMapV46, migrateV46,
};
