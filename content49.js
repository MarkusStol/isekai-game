/** v49: parallax battle BGs, licensed battlers, bust dock, craft rows */
import * as C48 from './content48.js';

export const BATTLE_LAYER_KEYS = {
  held: 'fantasy', fantasy: 'fantasy', forest: 'forest',
  dungeon: 'dungeon', cyberpunk: 'cyber', cyber: 'cyber',
  zombie: 'zombie', postapoc: 'zombie', daemon: 'daemon',
  darkfantasy: 'dark', grey: 'grey',
};

export function battleLayerKey(S, bgUrl){
  const ort=String(S?.world?.scene?.ort||'').toLowerCase();
  const genre=String(S?.genre||S?.role||'held').toLowerCase();
  const u=String(bgUrl||'').toLowerCase();
  if(/wald|forest|elfen/.test(ort)||/forest/.test(u)) return 'forest';
  if(/kerker|dungeon|höhle|keller|verlies|katakomb|gruft|bunker/.test(ort)||/dungeon/.test(u)) return 'dungeon';
  if(/cyber|neon/.test(genre)||/cyber/.test(u)) return 'cyber';
  if(/zombie|apokal|seuche|postapoc/.test(genre)||/zombie/.test(u)) return 'zombie';
  if(/daemon|dark/.test(genre)||/daemon|dark/.test(u)) return /daemon/.test(u)||/daemon/.test(genre)?'daemon':'dark';
  if(/grey/.test(genre)||/grey/.test(u)) return 'grey';
  return BATTLE_LAYER_KEYS[genre] || 'fantasy';
}

export function battleLayerUrls(key){
  const k=key||'fantasy';
  const base=`./assets/pixel/bg-battle/layers/${k}`;
  return {
    far: `${base}-far.webp`,
    mid: `${base}-mid.webp`,
    near: `${base}-near.webp`,
    floor: `${base}-floor.webp`,
    key: k,
  };
}

export function densifyTownMapV49(map){
  return C48.densifyTownMapV48(map);
}

export function migrateV49(S){
  C48.migrateV48(S);
  S.flags=S.flags||{};
  S.flags.visual49=true;
  S.ver=49;
  return S;
}

export default {
  densifyTownMapV49, migrateV49, battleLayerKey, battleLayerUrls, BATTLE_LAYER_KEYS,
  battleEnemyScale: C48.battleEnemyScale,
  TOWN_HOUSE_SRCS: C48.TOWN_HOUSE_SRCS,
  TOWN_HALL_SRCS: C48.TOWN_HALL_SRCS,
  portraitRole: C48.portraitRole,
};
