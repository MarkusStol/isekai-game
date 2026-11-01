/** v66: chapter depth — side dungeons, optional bosses, collectibles/bestiary, playtime */
import * as C64 from './content64.js';

export const FREETEXT_ENABLED = false;
export const CAMPAIGN_ID = C64.CAMPAIGN_ID;
export const CHAPTERS = C64.CHAPTERS;
export const BOSS_SCALE = C64.BOSS_SCALE;
export const ENDINGS = C64.ENDINGS;
export const SIDEQUESTS = C64.SIDEQUESTS;
export const CHAR_SKILL_TREES = C64.CHAR_SKILL_TREES;
export const CRAFT_TIERS = C64.CRAFT_TIERS;
export const CRAFT_RECIPES = C64.CRAFT_RECIPES;
export const CHAPTER_SIDEQUESTS = C64.CHAPTER_SIDEQUESTS;
export const CHAPTER_PUZZLES = C64.CHAPTER_PUZZLES;
export const OPTIONAL_SUPERBOSS = C64.OPTIONAL_SUPERBOSS;

export const HUB_NPC_LINES = {
  ...C64.HUB_NPC_LINES,
  'Archivar Quinn': [
    'Quinn: Die Register… sie riechen nach altem Siegelwachs.',
    'Quinn: Hinter dem Thron liegt mehr als Gold. Lies leise.',
    'Quinn: Wenn Velka fragt: ich katalogisiere nur.',
  ],
  'Page Sera': [
    'Sera: Botschaft für den Fürsten! …Entschuldigung, Falschlieferung.',
    'Sera: Die Knieenden murmeln Namen. Ich höre nicht zu.',
    'Sera: Braucht ihr etwas aus dem Archiv?',
  ],
  'Schmiedin Kael': [
    'Kael: Stahl und Hitze. Der Pass frisst Klingen.',
    'Kael: Bring mir Nachtstahl — ich mache daraus mehr als Nägel.',
    'Kael: Rekrut Venn stumpf seine Speere ab. Typisch.',
  ],
  'Rekrut Venn': [
    'Venn: Meldung: alles ruhig. …Fast.',
    'Venn: Brok sagt, Haltung sei die halbe Parade.',
    'Venn: Die Eishöhlen unten… ich geh nicht allein.',
  ],
  'Kantor Elias': [
    'Elias: Der Gesang hält das Glas wach. Hört ihr die Harmonie?',
    'Elias: Gold, Blau, Rot, Grün — so lautet die Litanei.',
    'Elias: Hinter dem Chor liegt ein Gewölbe. Nicht für Touristen.',
  ],
  'Schwester Nira': [
    'Nira: Kerzen wachsen nicht von allein. Arbeit ist Gebet.',
    'Nira: Solara lächelt, wenn sie droht. Vorsicht.',
    'Nira: Die Lichtschächte… sie zeigen mehr als Farbe.',
  ],
  'Hüter Orun': [
    'Orun: Die Knochen zählen. Die Lebenden nicht.',
    'Orun: Westkammer: Echo. Ostkammer: Hunger.',
    'Orun: Mara schreibt. Ich bewache. So bleibt Ordnung.',
  ],
};

export const ROLE_LINES = C64.ROLE_LINES;
export const SELF_INTRO_NAMES = C64.SELF_INTRO_NAMES;

/** Side dungeons per chapter — enter via hub door / travel */
export const SIDE_DUNGEONS = [
  { chapter:0, id:'sd_katakomben', name:'Schatzkatakomben', hub:'Thronsaal der Nacht',
    ort:'Schatzkatakomben', rooms:5, blurb:'Unter dem Thron: Gold und Schuld.',
    bossId:'opt_gildfiend', collectible:'Münze des Ersten' },
  { chapter:1, id:'sd_eishoehle', name:'Eishöhlen', hub:'Grenzpass',
    ort:'Eishöhlen am Pass', rooms:5, blurb:'Unter dem Wachturm friert das Echo.',
    bossId:'opt_frostwight', collectible:'Eissplitter-Rune' },
  { chapter:2, id:'sd_reliquien', name:'Reliquiengewölbe', hub:'Kathedrale des Lichts',
    ort:'Reliquiengewölbe', rooms:6, blurb:'Unter dem Altar: Glas und Blut.',
    bossId:'opt_glasswraith', collectible:'Glasfragment Solari' },
  { chapter:3, id:'sd_knochen', name:'Knochenlabyrinth', hub:'Ruinen von Solmir',
    ort:'Knochenlabyrinth', rooms:6, blurb:'Unter der Gruft: Namen ohne Grab.',
    bossId:'opt_boneking', collectible:'Namenlose Kronenschale' },
];

/** Optional bosses (not chapter-critical) */
export const OPTIONAL_BOSSES = [
  { id:'opt_gildfiend', name:'Gildenfiend', ort:'Schatzkatakomben', danger:3,
    blurb:'Ein Fiend, der Gold frisst und Schuld speit.', unlockFlag:null },
  { id:'opt_frostwight', name:'Frostwicht', ort:'Eishöhlen am Pass', danger:4,
    blurb:'Atem wie Glasscherben.', unlockFlag:null },
  { id:'opt_glasswraith', name:'Glasgeist', ort:'Reliquiengewölbe', danger:5,
    blurb:'Gebrochenes Fenster, das zurückstarrt.', unlockFlag:null },
  { id:'opt_boneking', name:'Knochenkönig', ort:'Knochenlabyrinth', danger:6,
    blurb:'Krone aus Rippen. Thron aus Stille.', unlockFlag:null },
  { id:'opt_aether', name: OPTIONAL_SUPERBOSS.name, ort: OPTIONAL_SUPERBOSS.ort, danger:9,
    blurb: OPTIONAL_SUPERBOSS.blurb, unlockFlag: OPTIONAL_SUPERBOSS.unlockFlag },
];

/** Collectibles — feed bestiary/codex */
export const COLLECTIBLES = [
  { id:'col_muenze', name:'Münze des Ersten', cat:'items', chapter:0, where:'Schatzkatakomben',
    desc:'Prägung verwischt. Die Zahl auf der Rückseite ist eine Schuld.' },
  { id:'col_eisrune', name:'Eissplitter-Rune', cat:'items', chapter:1, where:'Eishöhlen am Pass',
    desc:'Kalt selbst in der Handfläche. Nyx würde sie stehlen.' },
  { id:'col_glas', name:'Glasfragment Solari', cat:'items', chapter:2, where:'Reliquiengewölbe',
    desc:'Blaues Licht. Es summt die Litanei.' },
  { id:'col_krone', name:'Namenlose Kronenschale', cat:'items', chapter:3, where:'Knochenlabyrinth',
    desc:'Zu leicht für Gold. Zu schwer für Knochen.' },
  { id:'col_aether', name:'Ätherscherbe', cat:'items', chapter:4, where:'Ätherspalte',
    desc:'Pulsierendes Nichts. Codex-Eintrag: unklassifizierbar.' },
];

/** Authored bestiary seeds (shown as glimpsed until fought/found) */
export const BESTIARY_SEEDS = [
  { name:'Niederer Fiend', desc:'Thronsaal-Schatten. Hungert nach Titeln.', habitat:'Thronsaal der Nacht', danger:2 },
  { name:'Höllenhund', desc:'Pass-Jäger. Hitze im Schnee.', habitat:'Grenzpass', danger:3 },
  { name:'Gildenfiend', desc:'Optional. Goldfresser.', habitat:'Schatzkatakomben', danger:3 },
  { name:'Frostwicht', desc:'Optional. Atem wie Glasscherben.', habitat:'Eishöhlen am Pass', danger:4 },
  { name:'Glasgeist', desc:'Optional. Fenster, das zurückblickt.', habitat:'Reliquiengewölbe', danger:5 },
  { name:'Knochenkönig', desc:'Optional. Krone aus Rippen.', habitat:'Knochenlabyrinth', danger:6 },
  { name:'Erzfiend', desc:'Kapitelboss. Thronhunger in Person.', habitat:'Kathedrale des Lichts', danger:7 },
  { name:'Ätherwyrm Eternalis', desc:'Superboss. Riss jenseits der Enden.', habitat:'Ätherspalte', danger:9 },
];

/** Honest playtime targets (minutes) — probe compares structure, not wall-clock of bots */
export const PLAYTIME_TARGETS = [
  { chapter:0, hubMin:12, sideMin:18, bossMin:8, totalMin:45, label:'Kap.1 Thronsaal' },
  { chapter:1, hubMin:14, sideMin:20, bossMin:10, totalMin:55, label:'Kap.2 Grenzpass' },
  { chapter:2, hubMin:16, sideMin:22, bossMin:12, totalMin:60, label:'Kap.3 Kathedrale' },
  { chapter:3, hubMin:18, sideMin:25, bossMin:15, totalMin:70, label:'Kap.4 Solmir/Finale' },
];

export function lineForNpc(name, sheet, S){
  const lines = HUB_NPC_LINES[name];
  if(lines?.length){
    const i = ((S?.flags?.npcLineIdx||{})[name]|0) % lines.length;
    try{
      S.flags = S.flags||{};
      S.flags.npcLineIdx = S.flags.npcLineIdx||{};
      S.flags.npcLineIdx[name] = i+1;
    }catch(_){}
    return lines[i];
  }
  return C64.lineForNpc?.(name, sheet, S);
}

export const displayLabelFor = C64.displayLabelFor;

export function ensureV66(S){
  C64.ensureV64?.(S);
  S.flags = S.flags || {};
  S.flags.visual66 = true;
  S.flags.freetext = false;
  S.v66 = S.v66 || {
    sideDungeonsDone: [],
    optionalBossesBeat: [],
    collectibles: [],
    playStartedAt: Date.now(),
    chapterEnteredAt: {},
  };
  return S.v66;
}

export function migrateV66(S){
  try{ C64.migrateV64?.(S); }catch(_){}
  S.ver = Math.max(S.ver|0, 66);
  S.flags = S.flags || {};
  S.flags.visual59 = true;
  S.flags.visual62 = true;
  S.flags.visual63 = true;
  S.flags.visual64 = true;
  S.flags.visual66 = true;
  S.flags.jrpg59 = true;
  S.flags.freetext = false;
  ensureV66(S);
  return S;
}

export function sideDungeonForChapter(S){
  const i = (S?.campaign?.idx)|0;
  return SIDE_DUNGEONS.find(d=>d.chapter===i) || null;
}

export function markSideDungeonDone(S, id){
  const v = ensureV66(S);
  if(!v.sideDungeonsDone.includes(id)) v.sideDungeonsDone.push(id);
  return v;
}

export function markOptionalBoss(S, id){
  const v = ensureV66(S);
  if(!v.optionalBossesBeat.includes(id)) v.optionalBossesBeat.push(id);
  return v;
}

export function grantCollectible(S, id){
  const v = ensureV66(S);
  const col = COLLECTIBLES.find(c=>c.id===id);
  if(!col) return { ok:false, text:'Unbekanntes Collectible' };
  if(v.collectibles.includes(id)) return { ok:false, text:'Bereits gefunden: '+col.name };
  v.collectibles.push(id);
  try{
    const Codex = (typeof window!=='undefined' && window.__game?.Codex) || null;
    Codex?.discover?.(S, { cat:col.cat||'items', name:col.name, desc:col.desc, where:col.where, level:'studied' });
  }catch(_){}
  return { ok:true, text:'Collectible: '+col.name, col };
}

export function seedBestiary(S){
  try{
    const Codex = (typeof window!=='undefined' && window.__game?.Codex) || null;
    if(!Codex?.recordCreature) return { ok:false };
    for(const b of BESTIARY_SEEDS){
      Codex.recordCreature(S, b.name, { desc:b.desc, habitat:b.habitat, danger:b.danger, level:'glimpsed' });
    }
    return { ok:true, n:BESTIARY_SEEDS.length };
  }catch(e){ return { ok:false, err:String(e) }; }
}

/** Structural playtime report: content minutes available per chapter (not bot wall-clock). */
export function estimatePlaytimeReport(S){
  ensureV66(S);
  const rows = PLAYTIME_TARGETS.map(t=>{
    const sd = SIDE_DUNGEONS.find(d=>d.chapter===t.chapter);
    const sq = CHAPTER_SIDEQUESTS.find(s=>s.chapter===t.chapter);
    const pz = CHAPTER_PUZZLES.find(p=>p.chapter===t.chapter);
    const opt = OPTIONAL_BOSSES.filter(b=>SIDE_DUNGEONS.find(d=>d.chapter===t.chapter && d.bossId===b.id));
    const contentBits = [sd?1:0, sq?1:0, pz?1:0, opt.length].reduce((a,b)=>a+b,0);
    const estimated = t.hubMin + (sd?t.sideMin:0) + t.bossMin + (sq?8:0) + (pz?6:0);
    return {
      ...t,
      hasSideDungeon: !!sd,
      hasSidequest: !!sq,
      hasPuzzle: !!pz,
      optionalBosses: opt.map(o=>o.name),
      contentBits,
      estimatedMin: estimated,
      meetsDepthBar: estimated >= 40 && contentBits >= 3,
    };
  });
  const total = rows.reduce((a,r)=>a+(r.estimatedMin|0),0);
  return {
    chapters: rows,
    campaignEstimatedMin: total,
    campaignEstimatedHours: Math.round(total/60*10)/10,
    collectibles: COLLECTIBLES.length,
    sideDungeons: SIDE_DUNGEONS.length,
    optionalBosses: OPTIONAL_BOSSES.length,
    bestiarySeeds: BESTIARY_SEEDS.length,
    honestNote: 'Schätzung aus Hub+Side+Boss+Quest-Struktur; echte Spielzeit hängt von Kampf/Erkundung ab.',
  };
}

// re-exports used by game.js
export const ensureV64 = C64.ensureV64;
export const ensureV63 = C64.ensureV63;
export const ensureV62 = C64.ensureV62;
export const unlockSkillNode = C64.unlockSkillNode;
export const grantSkillPts = C64.grantSkillPts;
export const tryCraft = C64.tryCraft;
export const craftTierOf = C64.craftTierOf;
export const completeSidequest = C64.completeSidequest;
export const solvePuzzle = C64.solvePuzzle;
export const maybeUnlockSuperboss = C64.maybeUnlockSuperboss;
export const sidequestForChapter = C64.sidequestForChapter;
export const puzzleForChapter = C64.puzzleForChapter;
export const startCampaign = C64.startCampaign;
export const resolveChoice = C64.resolveChoice;
export const renderJrpgChoices = C64.renderJrpgChoices;
export const pendingBattleId = C64.pendingBattleId;
export const scaleBossFoe = C64.scaleBossFoe;
export const onBossVictory = C64.onBossVictory;

export default {
  FREETEXT_ENABLED, CAMPAIGN_ID, CHAPTERS, BOSS_SCALE, ENDINGS, SIDEQUESTS,
  CHAR_SKILL_TREES, CRAFT_TIERS, CRAFT_RECIPES, CHAPTER_SIDEQUESTS, CHAPTER_PUZZLES, OPTIONAL_SUPERBOSS,
  HUB_NPC_LINES, ROLE_LINES, SELF_INTRO_NAMES, lineForNpc, displayLabelFor,
  SIDE_DUNGEONS, OPTIONAL_BOSSES, COLLECTIBLES, BESTIARY_SEEDS, PLAYTIME_TARGETS,
  migrateV66, ensureV66, sideDungeonForChapter, markSideDungeonDone, markOptionalBoss,
  grantCollectible, seedBestiary, estimatePlaytimeReport,
  ensureV64, ensureV63, ensureV62, unlockSkillNode, grantSkillPts, tryCraft, craftTierOf,
  completeSidequest, solvePuzzle, maybeUnlockSuperboss, sidequestForChapter, puzzleForChapter,
  startCampaign, resolveChoice, renderJrpgChoices, pendingBattleId, scaleBossFoe, onBossVictory,
};
