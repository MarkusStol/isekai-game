/* content54 — foe plate dock, SE HUD, claim-land, Warten DE, atlas labels, menu clears battle, proc continue */
import * as C53 from './content53.js';

export function migrateV54(S){
  C53.migrateV53(S);
  if(!S || typeof S!=='object') return S;
  S.ver = Math.max(Number(S.ver)||0, 54);
  S.flags = S.flags || {};
  S.flags.visual54 = true;
  // keep a compact worldPack for ROLES.proc restore after reload
  if((S.role==='proc' || S.genre) && !S.worldPack){
    S.worldPack = {
      icon: S.world?.icon || '🎲',
      titel: S.world?.titel || S.pc?.bg || 'Welt',
      ton: S.world?.ton || '',
      _genreLabel: S.genre || 'Abenteuer',
      genre: S.genre,
      imageStyle: S.world?.imageStyle || ''
    };
  }
  return S;
}

export default { migrateV54 };
