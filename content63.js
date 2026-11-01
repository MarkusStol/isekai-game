/** v63: Wang/blob autotiles, indoor verticality, DE skill tree UI, Höllenhund balance */
import * as C62 from './content62.js';

export const FREETEXT_ENABLED = false;
export const CAMPAIGN_ID = C62.CAMPAIGN_ID;
export const CHAPTERS = C62.CHAPTERS;
export const BOSS_SCALE = C62.BOSS_SCALE;
export const ENDINGS = C62.ENDINGS;
export const SIDEQUESTS = C62.SIDEQUESTS;
export const CRAFT_TIERS = C62.CRAFT_TIERS;
export const CRAFT_RECIPES = C62.CRAFT_RECIPES;
export const CHAPTER_SIDEQUESTS = C62.CHAPTER_SIDEQUESTS;
export const CHAPTER_PUZZLES = C62.CHAPTER_PUZZLES;
export const OPTIONAL_SUPERBOSS = C62.OPTIONAL_SUPERBOSS;

/** German-only skill trees with icons + layout for visual node graph */
export const CHAR_SKILL_TREES = {
  hero: {
    name: 'Fürst', icon: '👑',
    nodes: [
      { id:'aura_befehl', name:'Aura-Befehl', cost:1, icon:'⚔️', col:0, row:0, desc:'Gruppen-Angriff +5%' },
      { id:'thronrecht', name:'Thronrecht', cost:2, requires:['aura_befehl'], icon:'🗡️', col:0, row:1, desc:'Kritische Treffer +8%' },
      { id:'schuld_brechen', name:'Schuld brechen', cost:3, requires:['thronrecht'], icon:'⚖️', col:0, row:2, desc:'Mehr Schaden gegen Bosse' },
    ],
  },
  'Sekretärin Velka': {
    name: 'Velka', icon: '📜',
    nodes: [
      { id:'register', name:'Register', cost:1, icon:'🔍', col:0, row:0, desc:'Analyse zeigt Schwächen' },
      { id:'edikt', name:'Edikt', cost:2, requires:['register'], icon:'💰', col:0, row:1, desc:'Goldfunde +20%' },
      { id:'ordnung', name:'Eiserne Ordnung', cost:3, requires:['edikt'], icon:'✨', col:0, row:2, desc:'Magie +12%' },
    ],
  },
  'Spionin Nyx': {
    name: 'Nyx', icon: '🗡️',
    nodes: [
      { id:'schattenritt', name:'Schattenritt', cost:1, icon:'🌑', col:0, row:0, desc:'Tempo +10%' },
      { id:'giftklinge', name:'Giftklinge', cost:2, requires:['schattenritt'], icon:'☠️', col:0, row:1, desc:'Chance auf Blutung' },
      { id:'doppelgaenger', name:'Doppelgänger', cost:3, requires:['giftklinge'], icon:'👥', col:0, row:2, desc:'Erste Aktion gratis' },
    ],
  },
  'General Brok': {
    name: 'Brok', icon: '🛡️',
    nodes: [
      { id:'kriegshammer', name:'Kriegshammer', cost:1, icon:'🔨', col:0, row:0, desc:'Angriff +10%' },
      { id:'schildwall', name:'Schildwall', cost:2, requires:['kriegshammer'], icon:'🧱', col:0, row:1, desc:'Verteidigung +15%' },
      { id:'blutrausch', name:'Blutrausch', cost:3, requires:['schildwall'], icon:'🩸', col:0, row:2, desc:'Unter 30% LP: Angriff +25%' },
    ],
  },
  'Heldin Aria': {
    name: 'Aria', icon: '☀️',
    nodes: [
      { id:'lichtseid', name:'Lichtseid', cost:1, icon:'💚', col:0, row:0, desc:'Heilung +15%' },
      { id:'urteil', name:'Urteil', cost:2, requires:['lichtseid'], icon:'⚡', col:0, row:1, desc:'Lichtschaden +20%' },
      { id:'gnade', name:'Gnade oder Fall', cost:3, requires:['urteil'], icon:'🕊️', col:0, row:2, desc:'Gnade im Gespräch leichter' },
    ],
  },
};

export const ensureV62 = C62.ensureV62;
export function unlockSkillNode(S, who, nodeId){
  const v = C62.ensureV62(S);
  const tree = CHAR_SKILL_TREES[who];
  if(!tree) return {ok:false, text:'Unbekannter Charakter'};
  const node = tree.nodes.find(n=>n.id===nodeId);
  if(!node) return {ok:false, text:'Unbekannter Knoten'};
  v.charSkills[who] = v.charSkills[who] || {unlocked:[]};
  const st = v.charSkills[who];
  if(st.unlocked.includes(nodeId)) return {ok:false, text:'Bereits freigeschaltet'};
  for(const r of (node.requires||[])){
    if(!st.unlocked.includes(r)) return {ok:false, text:'Voraussetzung fehlt'};
  }
  if((v.skillPts|0) < (node.cost|0)) return {ok:false, text:'Zu wenig Fertigkeitspunkte'};
  v.skillPts = (v.skillPts|0) - (node.cost|0);
  st.unlocked.push(nodeId);
  return {ok:true, text: tree.name+': '+node.name+' freigeschaltet', node};
}
export const grantSkillPts = C62.grantSkillPts;
export const tryCraft = C62.tryCraft;
export const craftTierOf = C62.craftTierOf;
export const completeSidequest = C62.completeSidequest;
export const solvePuzzle = C62.solvePuzzle;
export const maybeUnlockSuperboss = C62.maybeUnlockSuperboss;
export const sidequestForChapter = C62.sidequestForChapter;
export const puzzleForChapter = C62.puzzleForChapter;
export const startCampaign = C62.startCampaign;
export const resolveChoice = C62.resolveChoice;
export const renderJrpgChoices = C62.renderJrpgChoices;
export const pendingBattleId = C62.pendingBattleId;
export const scaleBossFoe = C62.scaleBossFoe;
export const onBossVictory = C62.onBossVictory;

export function ensureV63(S){
  C62.ensureV62(S);
  S.flags = S.flags || {};
  S.flags.visual63 = true;
  S.flags.freetext = false;
  return S.v62;
}

export function migrateV63(S){
  try{ C62.migrateV62?.(S); }catch(_){}
  S.ver = Math.max(S.ver|0, 63);
  S.flags = S.flags || {};
  S.flags.visual59 = true;
  S.flags.visual62 = true;
  S.flags.visual63 = true;
  S.flags.freetext = false;
  S.flags.jrpg59 = true;
  ensureV63(S);
  return S;
}

export default {
  FREETEXT_ENABLED, CAMPAIGN_ID, CHAPTERS, BOSS_SCALE, ENDINGS, SIDEQUESTS,
  CHAR_SKILL_TREES, CRAFT_TIERS, CRAFT_RECIPES, CHAPTER_SIDEQUESTS, CHAPTER_PUZZLES, OPTIONAL_SUPERBOSS,
  migrateV63, ensureV63, ensureV62, unlockSkillNode, grantSkillPts, tryCraft, craftTierOf,
  completeSidequest, solvePuzzle, maybeUnlockSuperboss, sidequestForChapter, puzzleForChapter,
  startCampaign, resolveChoice, renderJrpgChoices, pendingBattleId, scaleBossFoe, onBossVictory,
};
