/** v51: battle HUD/cmd/WAIT, HD party stages, brighter painted BGs, foe tags, craft Gil */
import * as C50 from './content50.js';

export const ENEMY_ART_KEYS = C50.ENEMY_ART_KEYS;
export const enemyArtKey = C50.enemyArtKey;
export const battleEnemyArt = C50.battleEnemyArt;
export const battlerPathForKey = C50.battlerPathForKey;
export const assertEnemyArtKeys = C50.assertEnemyArtKeys;
export const battleLayerKey = C50.default.battleLayerKey;
export const battleLayerUrls = C50.default.battleLayerUrls;
export const BATTLE_LAYER_KEYS = C50.default.BATTLE_LAYER_KEYS;

export function migrateV51(S){
  C50.migrateV50(S);
  S.flags = S.flags || {};
  S.flags.visual51 = true;
  S.ver = 51;
  return S;
}

export default {
  ...C50.default,
  migrateV51,
  ENEMY_ART_KEYS, enemyArtKey, battleEnemyArt, battlerPathForKey, assertEnemyArtKeys,
  battleLayerKey, battleLayerUrls, BATTLE_LAYER_KEYS,
};
