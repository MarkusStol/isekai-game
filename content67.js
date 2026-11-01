/** v67: FF battle + optional boss setpieces + PC polish hooks */
import * as C66 from './content66.js';

export const OPTIONAL_BOSS_SETPIECES = {
  opt_gildfiend: {
    title: 'Gildenfiend',
    banner: 'GOLD FRISST GOLD',
    blurb: 'Die Katakomben zittern. Münzen schreien.',
    bgHint: 'crypt',
    hpMul: 1.8, atkMul: 1.25, scale: 'boss',
  },
  opt_frostwight: {
    title: 'Frostwicht',
    banner: 'ATEM AUS GLAS',
    blurb: 'Der Pass hält den Atem an.',
    bgHint: 'snow',
    hpMul: 2.0, atkMul: 1.3, scale: 'boss',
  },
  opt_glasswraith: {
    title: 'Glasgeist',
    banner: 'FENSTER OHNE RAHMEN',
    blurb: 'Licht bricht sich — und dich.',
    bgHint: 'cathedral',
    hpMul: 2.1, atkMul: 1.35, scale: 'boss',
  },
  opt_boneking: {
    title: 'Knochenkönig',
    banner: 'KRONE AUS RIPPEN',
    blurb: 'Die Stille kniet.',
    bgHint: 'crypt',
    hpMul: 2.4, atkMul: 1.4, scale: 'boss',
  },
  opt_aether: {
    title: 'Ätherwyrm Eternalis',
    banner: 'JENSEITS DER ENDEN',
    blurb: 'Der Riss öffnet ein Auge.',
    bgHint: 'void',
    hpMul: 3.2, atkMul: 1.6, scale: 'boss',
  },
};

export function ensureV67(S){
  C66.ensureV66?.(S);
  S.flags = S.flags || {};
  S.flags.visual67 = true;
  S.flags.battleFf67 = true;
  S.ver = Math.max(S.ver|0, 67);
  S.v67 = S.v67 || { setpiecesSeen: [], setpiecesBeat: [] };
  return S.v67;
}

export function migrateV67(S){
  try{ C66.migrateV66?.(S); }catch(_){}
  ensureV67(S);
  S.ver = Math.max(S.ver|0, 67);
  S.flags.freetext = false;
  return S;
}

export function setpieceForBossId(id){
  return OPTIONAL_BOSS_SETPIECES[id] || null;
}

/** Build startBattle opts for an optional boss encounter */
export function optionalBossBattleOpts(S, bossId){
  const sp = setpieceForBossId(bossId) || {};
  const base = (C66.OPTIONAL_BOSSES||[]).find(b=>b.id===bossId) || {};
  return {
    setpiece: true,
    bossId,
    bossName: sp.title || base.name || 'Optionalboss',
    banner: sp.banner || 'OPTIONAL BOSS',
    blurb: sp.blurb || base.blurb || '',
    hpMul: sp.hpMul || 1.8,
    atkMul: sp.atkMul || 1.25,
    forced: true,
  };
}

export function markSetpieceSeen(S, bossId){
  const v = ensureV67(S);
  if(!v.setpiecesSeen.includes(bossId)) v.setpiecesSeen.push(bossId);
}
export function markSetpieceBeat(S, bossId){
  const v = ensureV67(S);
  if(!v.setpiecesBeat.includes(bossId)) v.setpiecesBeat.push(bossId);
  try{ C66.markOptionalBoss?.(S, bossId); }catch(_){}
}

export const lineForNpc = C66.lineForNpc;
export const displayLabelFor = C66.displayLabelFor;
export const SIDE_DUNGEONS = C66.SIDE_DUNGEONS;
export const OPTIONAL_BOSSES = C66.OPTIONAL_BOSSES;
export const COLLECTIBLES = C66.COLLECTIBLES;
export const BESTIARY_SEEDS = C66.BESTIARY_SEEDS;
export const PLAYTIME_TARGETS = C66.PLAYTIME_TARGETS;
export default {
  ensureV67, migrateV67, setpieceForBossId, optionalBossBattleOpts,
  markSetpieceSeen, markSetpieceBeat, OPTIONAL_BOSS_SETPIECES,
  lineForNpc, displayLabelFor, SIDE_DUNGEONS, OPTIONAL_BOSSES,
  COLLECTIBLES, BESTIARY_SEEDS, PLAYTIME_TARGETS,
};
