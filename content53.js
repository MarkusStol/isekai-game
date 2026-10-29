/** v53: FF two-level battle cmds, pixel TL icons, DE job labels, companion scale, atlas/inv/home */
import * as C52 from './content52.js';

export const ENEMY_ART_KEYS = C52.ENEMY_ART_KEYS;
export const enemyArtKey = C52.enemyArtKey;
export const battleEnemyArt = C52.battleEnemyArt;
export const battlerPathForKey = C52.battlerPathForKey;
export const assertEnemyArtKeys = C52.assertEnemyArtKeys;
export const battleLayerKey = C52.battleLayerKey;
export const battleLayerUrls = C52.battleLayerUrls;
export const BATTLE_LAYER_KEYS = C52.BATTLE_LAYER_KEYS;

export function migrateV53(S){
  C52.migrateV52(S);
  S.flags = S.flags || {};
  S.flags.visual53 = true;
  S.ver = 53;
  return S;
}

export default {
  ...C52.default,
  migrateV53,
  ENEMY_ART_KEYS, enemyArtKey, battleEnemyArt, battlerPathForKey, assertEnemyArtKeys,
  battleLayerKey, battleLayerUrls, BATTLE_LAYER_KEYS,
};
