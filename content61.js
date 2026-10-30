/** v61: hand-authored Nocturna hubs + battle UI clarity. Campaign text inherits C60. */
import * as C60 from './content60.js';

export const FREETEXT_ENABLED = false;
export const CAMPAIGN_ID = C60.CAMPAIGN_ID || 'nocturna';
export const CHAPTERS = C60.CHAPTERS;
export const BOSS_SCALE = C60.BOSS_SCALE;
export const SIDEQUESTS = C60.SIDEQUESTS;
export const ENDINGS = C60.ENDINGS;

export function migrateV61(S){
  try{ C60.migrateV60?.(S); }catch(_){}
  S.ver = Math.max(S.ver|0, 61);
  S.flags = S.flags || {};
  S.flags.visual59 = true;
  S.flags.visual61 = true;
  S.flags.jrpg59 = true;
  if(!S.campaign) try{ C60.startCampaign?.(S, {}); }catch(_){}
  return S;
}

export function startCampaign(S, opts){ return C60.startCampaign(S, opts); }
export function resolveChoice(S, ch, opts){ return C60.resolveChoice(S, ch, opts); }
export function renderJrpgChoices(S, opts){ return C60.renderJrpgChoices(S, opts); }
export function pendingBattleId(S){ return C60.pendingBattleId(S); }
export function scaleBossFoe(foe, id){ return C60.scaleBossFoe(foe, id); }
export function onBossVictory(S, opts){ return C60.onBossVictory(S, opts); }

export default {
  FREETEXT_ENABLED, CAMPAIGN_ID, CHAPTERS, BOSS_SCALE, SIDEQUESTS, ENDINGS,
  migrateV61, startCampaign, resolveChoice, renderJrpgChoices,
  pendingBattleId, scaleBossFoe, onBossVictory,
};
