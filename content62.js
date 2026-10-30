/** v62: natural hubs + skill trees / craft / sidequests / puzzles / superboss */
import * as C61 from './content61.js';
import * as C60 from './content60.js';

export const FREETEXT_ENABLED = false;
export const CAMPAIGN_ID = C61.CAMPAIGN_ID || 'nocturna';
export const CHAPTERS = C61.CHAPTERS;
export const BOSS_SCALE = C61.BOSS_SCALE;
export const ENDINGS = C61.ENDINGS;

/** Per-character skill trees (party members) — AP spends unlock nodes */
export const CHAR_SKILL_TREES = {
  hero: {
    name: 'Fürst',
    nodes: [
      { id:'aura_befehl', name:'Aura-Befehl', cost:1, desc:'Party-ATK +5%', effect:{partyAtk:1.05} },
      { id:'thronrecht', name:'Thronrecht', cost:2, requires:['aura_befehl'], desc:'CRIT +8%', effect:{crit:0.08} },
      { id:'schuld_brechen', name:'Schuld brechen', cost:3, requires:['thronrecht'], desc:'Bonus vs Boss', effect:{bossDmg:1.15} },
    ],
  },
  'Sekretärin Velka': {
    name: 'Velka',
    nodes: [
      { id:'register', name:'Register', cost:1, desc:'Analyse zeigt Schwächen', effect:{analyze:true} },
      { id:'edikt', name:'Edikt', cost:2, requires:['register'], desc:'Goldfunde +20%', effect:{goldFind:1.2} },
      { id:'ordnung', name:'Eiserne Ordnung', cost:3, requires:['edikt'], desc:'MAG +12%', effect:{mag:1.12} },
    ],
  },
  'Spionin Nyx': {
    name: 'Nyx',
    nodes: [
      { id:'schattenritt', name:'Schattenritt', cost:1, desc:'SPD +10%', effect:{spd:1.1} },
      { id:'giftklinge', name:'Giftklinge', cost:2, requires:['schattenritt'], desc:'Chance Blutung', effect:{bleed:0.2} },
      { id:'doppelgaenger', name:'Doppelgänger', cost:3, requires:['giftklinge'], desc:'Erste Aktion gratis', effect:{freeAct:1} },
    ],
  },
  'General Brok': {
    name: 'Brok',
    nodes: [
      { id:'kriegshammer', name:'Kriegshammer', cost:1, desc:'ATK +10%', effect:{atk:1.1} },
      { id:'schildwall', name:'Schildwall', cost:2, requires:['kriegshammer'], desc:'DEF +15%', effect:{def:1.15} },
      { id:'blutrausch', name:'Blutrausch', cost:3, requires:['schildwall'], desc:'Bei <30% HP: ATK +25%', effect:{lowHpAtk:1.25} },
    ],
  },
  'Heldin Aria': {
    name: 'Aria',
    nodes: [
      { id:'lichtseid', name:'Lichtseid', cost:1, desc:'Heilung +15%', effect:{heal:1.15} },
      { id:'urteil', name:'Urteil', cost:2, requires:['lichtseid'], desc:'Lichtschaden +20%', effect:{licht:1.2} },
      { id:'gnade', name:'Gnade oder Fall', cost:3, requires:['urteil'], desc:'Talk-Mercy leichter', effect:{mercy:1.2} },
    ],
  },
};

/** Crafting upgrade tiers (werkstatt) */
export const CRAFT_TIERS = [
  { id:'t1', name:'Feldschmiede', unlockAt:0, recipes:['trank_klein','antidot','wetzstein'] },
  { id:'t2', name:'Hofwerkstatt', unlockAt:2, recipes:['trank_mittel','nachtstahl_klinge','runenstein'] },
  { id:'t3', name:'Fürstliche Esse', unlockAt:4, recipes:['elixir','thronbrecher','aetherlinse'] },
];

export const CRAFT_RECIPES = {
  trank_klein: { name:'Heiltrank', cost:{gold:12, mats:['Kraut']}, out:{item:'Heiltrank', qty:1} },
  antidot: { name:'Antidot', cost:{gold:10, mats:['Giftbeere']}, out:{item:'Antidot', qty:1} },
  wetzstein: { name:'Wetzstein', cost:{gold:20, mats:['Stein']}, out:{item:'Wetzstein', qty:1}, upgrade:true },
  trank_mittel: { name:'Mittlerer Trank', cost:{gold:35, mats:['Kraut','Kristallstaub']}, out:{item:'Mittlerer Trank', qty:1} },
  nachtstahl_klinge: { name:'Nachtstahl-Klinge', cost:{gold:80, mats:['Nachtstahl-Splitter','Eisen']}, out:{item:'Nachtstahl-Klinge', qty:1}, equip:true },
  runenstein: { name:'Runenstein', cost:{gold:50, mats:['Kristallstaub']}, out:{item:'Runenstein', qty:1} },
  elixir: { name:'Elixier', cost:{gold:90, mats:['Manaessenz','Heiliges Siegel']}, out:{item:'Elixier', qty:1} },
  thronbrecher: { name:'Thronbrecher', cost:{gold:150, mats:['Nachtstahl-Splitter','Phylakterium-Splitter']}, out:{item:'Thronbrecher', qty:1}, equip:true },
  aetherlinse: { name:'Ätherlinse', cost:{gold:120, mats:['Heiliges Siegel','Kristallstaub']}, out:{item:'Ätherlinse', qty:1} },
};

/** One side quest per chapter */
export const CHAPTER_SIDEQUESTS = [
  { chapter:0, id:'sq_register', title:'Velkas Register', ort:'Thronsaal der Nacht', desc:'Lies das geheime Register hinter dem Thron.', scene:'c1_side', reward:{gold:30, ap:1, item:'Runenstein'} },
  { chapter:1, id:'sq_cache', title:'Nyx-Caches', ort:'Grenzpass', desc:'Berge Spionage-Caches in den Turmritzen.', scene:'c2_side', reward:{gold:40, ap:1, item:'Wetzstein'} },
  { chapter:2, id:'sq_reliquiar', title:'Reliquiar der Solari', ort:'Kathedrale des Lichts', desc:'Untersuche das Relikt, ohne Solara zu alarmieren.', scene:'c3_side', reward:{gold:50, ap:1, item:'Heiliges Siegel'} },
  { chapter:3, id:'sq_schuld', title:'Schuld des Ersten', ort:'Ruinen von Solmir', desc:'Finde den Namen, den die Gruft verschweigt.', scene:'c4_side', reward:{gold:60, ap:2, item:'Phylakterium-Splitter'} },
];

/** One dungeon puzzle per chapter */
export const CHAPTER_PUZZLES = [
  { chapter:0, id:'pz_sigil', title:'Siegel-Reihenfolge', ort:'Thronsaal der Nacht',
    prompt:'Vier Fackeln. Nur eine Reihenfolge öffnet die Schatzkammer.',
    solution:['nord','ost','süd','west'], hint:'Der Thron blickt nach Süden — beginne gegenüber.',
    reward:{gold:25, item:'Kraut', ap:1} },
  { chapter:1, id:'pz_bridge', title:'Eisbrücke', ort:'Grenzpass',
    prompt:'Platten im Schnee: tritt nur auf die mit Rissen nach Osten.',
    solution:['E','E','N','E','S'], hint:'Der Wind vom Pass kommt von Westen.',
    reward:{gold:30, item:'Stein', ap:1} },
  { chapter:2, id:'pz_glass', title:'Glaslitanei', ort:'Kathedrale des Lichts',
    prompt:'Fensterfarben in der Reihenfolge des Glaubens: Gold, Blau, Rot, Grün.',
    solution:['gold','blau','rot','grün'], hint:'Licht vor Nacht, Blut vor Wachstum.',
    reward:{gold:35, item:'Kristallstaub', ap:1} },
  { chapter:3, id:'pz_coffin', title:'Sarg-Echo', ort:'Ruinen von Solmir',
    prompt:'Klopfe an die Särge in der Reihenfolge der Bestattung (ältester zuerst).',
    solution:['NW','NO','SW','SO'], hint:'Der Erste Held liegt dem Eingang am nächsten.',
    reward:{gold:45, item:'Manaessenz', ap:1} },
];

export const SIDEQUESTS = [...(C61.SIDEQUESTS||[]), ...CHAPTER_SIDEQUESTS.map(s=>({
  id:s.id, titel:s.title, ort:s.ort, desc:s.desc, chapter:s.chapter
}))];

export const OPTIONAL_SUPERBOSS = {
  id: 'superboss_aether',
  name: 'Ätherwyrm Eternalis',
  unlockFlag: 'nocturna_ending_seen',
  ort: 'Ätherspalte',
  blurb: 'Jenseits des Thronhungers öffnet sich ein Riss. Nur wer alle Kapitel und Sidequests berührt hat, sollte eintreten.',
};

export function ensureV62(S){
  S.flags = S.flags || {};
  S.progress = S.progress || {};
  S.v62 = S.v62 || {
    skillPts: 2,
    charSkills: {}, // name -> {unlocked:[]}
    craftTier: 0,
    craftXp: 0,
    sideDone: [],
    puzzlesDone: [],
    superbossUnlocked: false,
    mats: { Kraut:3, Stein:2, Giftbeere:1 },
  };
  // seed hero tree
  if(!S.v62.charSkills.hero) S.v62.charSkills.hero = { unlocked:[] };
  return S.v62;
}

export function migrateV62(S){
  try{ C61.migrateV61?.(S); }catch(_){}
  S.ver = Math.max(S.ver|0, 62);
  S.flags = S.flags || {};
  S.flags.visual59 = true;
  S.flags.visual62 = true;
  S.flags.jrpg59 = true;
  ensureV62(S);
  if(!S.campaign) try{ C60.startCampaign?.(S, {}); }catch(_){}
  return S;
}

export function chapterIndex(S){
  return S?.campaign?.idx|0;
}

export function sidequestForChapter(S){
  const i = chapterIndex(S);
  return CHAPTER_SIDEQUESTS.find(s=>s.chapter===i) || null;
}

export function puzzleForChapter(S){
  const i = chapterIndex(S);
  return CHAPTER_PUZZLES.find(s=>s.chapter===i) || null;
}

export function unlockSkillNode(S, who, nodeId){
  const v = ensureV62(S);
  const tree = CHAR_SKILL_TREES[who] || CHAR_SKILL_TREES.hero;
  const node = tree.nodes.find(n=>n.id===nodeId);
  if(!node) return { ok:false, text:'Unbekannter Skill' };
  const st = v.charSkills[who] || (v.charSkills[who]={unlocked:[]});
  if(st.unlocked.includes(nodeId)) return { ok:false, text:'Bereits freigeschaltet' };
  for(const r of (node.requires||[])){
    if(!st.unlocked.includes(r)) return { ok:false, text:'Voraussetzung fehlt: '+r };
  }
  if((v.skillPts|0) < (node.cost|1)) return { ok:false, text:'Nicht genug Skillpunkte ('+(v.skillPts|0)+')' };
  v.skillPts = (v.skillPts|0) - (node.cost|1);
  st.unlocked.push(nodeId);
  return { ok:true, text: tree.name+': '+node.name+' freigeschaltet', node };
}

export function grantSkillPts(S, n=1, why=''){
  const v = ensureV62(S);
  v.skillPts = (v.skillPts|0) + (n|0);
  return { ok:true, text:`+${n} Skillpunkt(e)`+(why?` (${why})`:''), pts:v.skillPts };
}

export function craftTierOf(S){
  const v = ensureV62(S);
  return CRAFT_TIERS.filter(t => (v.craftTier|0) >= t.unlockAt || t.unlockAt===0);
}

export function tryCraft(S, recipeId){
  const v = ensureV62(S);
  const rec = CRAFT_RECIPES[recipeId];
  if(!rec) return { ok:false, text:'Unbekanntes Rezept' };
  const unlocked = craftTierOf(S).some(t => t.recipes.includes(recipeId));
  if(!unlocked) return { ok:false, text:'Werkstatt-Stufe zu niedrig' };
  const gold = S.st?.gold|0;
  if(gold < (rec.cost.gold|0)) return { ok:false, text:'Nicht genug Gold' };
  for(const m of (rec.cost.mats||[])){
    if((v.mats[m]|0) < 1) return { ok:false, text:'Material fehlt: '+m };
  }
  S.st.gold = gold - (rec.cost.gold|0);
  for(const m of (rec.cost.mats||[])) v.mats[m] = (v.mats[m]|0) - 1;
  S.inv = S.inv || [];
  S.inv.push({ name: rec.out.item, icon: rec.equip?'⚔️':'🧪', qty: rec.out.qty||1 });
  v.craftXp = (v.craftXp|0) + 1;
  if(v.craftXp >= 3 && v.craftTier < 2){ v.craftTier = 2; }
  if(v.craftXp >= 6 && v.craftTier < 4){ v.craftTier = 4; }
  return { ok:true, text:'Hergestellt: '+rec.out.item };
}

export function completeSidequest(S, id){
  const v = ensureV62(S);
  if(v.sideDone.includes(id)) return { ok:false, text:'Bereits erledigt' };
  const sq = CHAPTER_SIDEQUESTS.find(s=>s.id===id);
  if(!sq) return { ok:false, text:'Unbekannte Sidequest' };
  v.sideDone.push(id);
  if(sq.reward?.gold) S.st.gold = (S.st.gold|0) + sq.reward.gold;
  if(sq.reward?.ap) grantSkillPts(S, sq.reward.ap, sq.title);
  if(sq.reward?.item){
    v.mats[sq.reward.item] = (v.mats[sq.reward.item]|0) + 1;
    S.inv = S.inv || [];
    S.inv.push({ name: sq.reward.item, icon:'📦', qty:1 });
  }
  maybeUnlockSuperboss(S);
  return { ok:true, text:'Sidequest: '+sq.title, sq };
}

export function solvePuzzle(S, id, attempt){
  const v = ensureV62(S);
  if(v.puzzlesDone.includes(id)) return { ok:false, text:'Rätsel schon gelöst' };
  const pz = CHAPTER_PUZZLES.find(p=>p.id===id);
  if(!pz) return { ok:false, text:'Unbekanntes Rätsel' };
  const want = pz.solution.map(s=>String(s).toLowerCase());
  const got = (Array.isArray(attempt)?attempt:[attempt]).map(s=>String(s).toLowerCase());
  if(want.length!==got.length || want.some((w,i)=>w!==got[i])){
    return { ok:false, text:'Falsche Reihenfolge. Hinweis: '+pz.hint };
  }
  v.puzzlesDone.push(id);
  if(pz.reward?.gold) S.st.gold = (S.st.gold|0) + pz.reward.gold;
  if(pz.reward?.ap) grantSkillPts(S, pz.reward.ap, pz.title);
  if(pz.reward?.item) v.mats[pz.reward.item] = (v.mats[pz.reward.item]|0) + 1;
  maybeUnlockSuperboss(S);
  return { ok:true, text:'Rätsel gelöst: '+pz.title, pz };
}

export function maybeUnlockSuperboss(S){
  const v = ensureV62(S);
  const sides = CHAPTER_SIDEQUESTS.every(s=>v.sideDone.includes(s.id));
  const puzzles = CHAPTER_PUZZLES.every(p=>v.puzzlesDone.includes(p.id));
  const ending = !!(S.flags?.nocturna_ending_seen || (S.campaign?.idx|0)>=3);
  if(sides && puzzles && ending){
    v.superbossUnlocked = true;
    S.flags.superboss_aether = true;
    return true;
  }
  return false;
}

export function startCampaign(S, opts){ return C61.startCampaign(S, opts); }
export function resolveChoice(S, ch, opts){
  const pack = C61.resolveChoice(S, ch, opts);
  // auto-complete side when visiting side scenes
  try{
    const next = ch?.next || '';
    const sq = CHAPTER_SIDEQUESTS.find(s=>s.scene===next || (next && next.startsWith(s.scene)));
    if(sq && (/_done|_read|_ask/.test(next) || next===sq.scene+'_done' || next.endsWith('_done'))){
      try{ completeSidequest(S, sq.id); }catch(_){}
    }
    // mark ending
    if(/c4_end|ending/.test(next)) S.flags.nocturna_ending_seen = true;
    maybeUnlockSuperboss(S);
  }catch(_){}
  return pack;
}
export function renderJrpgChoices(S, opts){ return C61.renderJrpgChoices(S, opts); }
export function pendingBattleId(S){ return C61.pendingBattleId(S); }
export function scaleBossFoe(foe, id){ return C61.scaleBossFoe(foe, id); }
export function onBossVictory(S, opts){
  const pack = C61.onBossVictory(S, opts);
  try{ grantSkillPts(S, 1, 'Boss'); }catch(_){}
  return pack;
}

export default {
  FREETEXT_ENABLED, CAMPAIGN_ID, CHAPTERS, BOSS_SCALE, SIDEQUESTS, ENDINGS,
  CHAR_SKILL_TREES, CRAFT_TIERS, CRAFT_RECIPES, CHAPTER_SIDEQUESTS, CHAPTER_PUZZLES, OPTIONAL_SUPERBOSS,
  migrateV62, ensureV62, unlockSkillNode, grantSkillPts, tryCraft, craftTierOf,
  completeSidequest, solvePuzzle, maybeUnlockSuperboss, sidequestForChapter, puzzleForChapter,
  startCampaign, resolveChoice, renderJrpgChoices, pendingBattleId, scaleBossFoe, onBossVictory,
};
