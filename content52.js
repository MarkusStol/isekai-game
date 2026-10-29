/** v52: foe names/timeline/bare art, unique companions, craft wrap, thumb SE, broader UI polish */
import * as C51 from './content51.js';

export const ENEMY_ART_KEYS = C51.ENEMY_ART_KEYS;
export const enemyArtKey = C51.enemyArtKey;
export const battleEnemyArt = C51.battleEnemyArt;
export const battlerPathForKey = C51.battlerPathForKey;
export const assertEnemyArtKeys = C51.assertEnemyArtKeys;
export const battleLayerKey = C51.battleLayerKey;
export const battleLayerUrls = C51.battleLayerUrls;
export const BATTLE_LAYER_KEYS = C51.BATTLE_LAYER_KEYS;

export function migrateV52(S){
  C51.migrateV51(S);
  S.flags = S.flags || {};
  S.flags.visual52 = true;
  S.ver = 52;
  return S;
}

export default {
  ...C51.default,
  migrateV52,
  ENEMY_ART_KEYS, enemyArtKey, battleEnemyArt, battlerPathForKey, assertEnemyArtKeys,
  battleLayerKey, battleLayerUrls, BATTLE_LAYER_KEYS,
};
