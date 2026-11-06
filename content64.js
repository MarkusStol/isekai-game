/** v64: real hub NPC dialogue (DE), strangers as role labels */
import * as C63 from './content63.js';

export const FREETEXT_ENABLED = false;
export const CAMPAIGN_ID = C63.CAMPAIGN_ID;
export const CHAPTERS = C63.CHAPTERS;
export const BOSS_SCALE = C63.BOSS_SCALE;
export const ENDINGS = C63.ENDINGS;
export const SIDEQUESTS = C63.SIDEQUESTS;
export const CHAR_SKILL_TREES = C63.CHAR_SKILL_TREES;
export const CRAFT_TIERS = C63.CRAFT_TIERS;
export const CRAFT_RECIPES = C63.CRAFT_RECIPES;
export const CHAPTER_SIDEQUESTS = C63.CHAPTER_SIDEQUESTS;
export const CHAPTER_PUZZLES = C63.CHAPTER_PUZZLES;
export const OPTIONAL_SUPERBOSS = C63.OPTIONAL_SUPERBOSS;

/** Named hub NPCs → German lines (first line may introduce name). */
export const HUB_NPC_LINES = {
  'hunderte kniende Monster': [
    'Kniende Gestalten: …Sie murmeln in einer Sprache, die nach Asche schmeckt.',
    'Kniende Gestalten: Der Thron fordert Stille. Wir gehorchen.',
  ],

  'Sekretärin Velka': [
    'Velka: Vierzehn Gold in der Kasse, und Venn hustet seit Dienstag. Lies das, bevor du mich nützlich findest.',
    'Velka: Unter dem Sitz sind drei Kerben. Neun, neun, neun. Dieselbe Folge wie in deiner Schrift.',
    'Velka: Ich hab die Feder gehalten, weil seine Hand schon Gold war. Wenn du mich dafür hasst, sag es laut.',
  ],
  'General Brok': [
    'Brok: Letzte Woche war ich für ihn nur noch der Soldat. Nicht Brok.',
    'Brok: Eine Nacht am Pass, oder Venn stirbt an dem Zeug in der Lunge. Ich schrei heute nicht.',
    'Brok: Wenn das Ding unten weiß, wer ich bin, hau nicht daneben.',
  ],
  'Wächter Toren': [
    'Toren: Halt. Grenzpass. Sag, wen du suchst, bevor du am Turm vorbeiläufst.',
    'Toren: Der Hund im Ostturm hat zwei von uns geholt. Die Nachtwache ist dünn.',
    'Toren: Schnee kommt. Bleib am Feuer, wenn du keine Klinge dabei hast.',
  ],
  'Kundschafterin Lira': [
    'Lira: Spuren im Schnee. Zu groß für einen Mann. Ich geh ihnen nach, bis sie aufhören.',
    'Lira: Östlich vom Bach steigt Rauch. Kann Banditen sein. Kann auch nur ein nasses Feuer sein.',
    'Lira: Wenn du gehst, geh leise. Der Schnee trägt die Schritte weiter, als du denkst.',
  ],
  'Händler Bram': [
    'Bram: Trank, Seil, eine Decke. Gold her, oder du frierst.',
    'Bram: Der Weg nach Solmir friert zu. Nimm Wolle mit, nicht nur Stahl.',
    'Bram: Beute kauf ich. Frag nicht, woher. Ich frag auch nicht.',
  ],
  'Rekrut Venn': [
    'Venn: Ich hust noch. Zwei von uns sind im Turm geblieben.',
    'Venn: Brok hat gesagt, er kommt. Sag ihm, er soll sich beeilen.',
  ],
  'Schmiedin Kael': [
    'Kael: Stahl für den Turm. Wenn die Klinge splittert, bring sie her.',
    'Kael: Reden wärmen nicht. Das Feuer schon. Tritt zur Seite.',
  ],
  'Priesterin Solara': [
    'Solara: Licht auf dich. Die Kathedrale hört Beichte und Bitte.',
    'Solara: Das Glas erzählt von Opfern, die wir nicht wiederholen.',
    'Solara: Betet, wenn ihr kämpft. Mut allein reicht selten.',
  ],
  'Akolyth': [
    'Ein Akolyth: …Verzeihung. Die Kerzen müssen brennen.',
    'Ein Akolyth: Solara sagt, Zweifel sei erlaubt — Lüge nicht.',
  ],
  'Grabräuber': [
    'Ein vermummter Dieb: Was guckst du? Hier ist nichts… noch.',
    'Ein vermummter Dieb: Die Toten schweigen. Wir auch — für Gold.',
  ],

  'Spionin Nyx': [
    'Nyx: Fünfzehn Gold, dann sag ich dir, wo der Hund steht. Ohne Gold sag ich nichts.',
    'Nyx: Der Pass hat Ohren. Ich auch. Sprich leiser, wenn Toren in der Nähe ist.',
    'Nyx: Wenn Brok fragt, ich war am Feuer. Mehr nicht.',
  ],
  'Akolyth Ren': [
    'Ren: Die Kerzen… Solara sagt, Zweifel sei erlaubt.',
    'Ren: Hinter dem Altar liegt ein altes Siegel.',
    'Ren: Verzeihung. Ich muss die Gänge fegen.',
  ],
  'Heldin Aria': [
    'Aria: Lio hält die zweite Wache. Ich bin nicht hier, um zu knien.',
    'Aria: Wenn das Ding unten seinen Posten sagt, schlagt weiter. Ich kann das nicht.',
    'Aria: Ich geh mit in den Keller. Danach geh ich. Das ist kein Bündnis.',
  ],
  'Grabräuber Jex': [
    'Jex: Ich nehm Münzen. Staub lass ich liegen. Der Fiend zahlt mit beidem, und ich will nur eins davon.',
    'Jex: Links klirrt es, rechts hustet es. Ich bleib in der Mitte, da ist es nur kalt.',
    'Jex: Drei Neunen, sagen sie. Ich zähl nicht mit, wenn die Knochen mitzählen.',
  ],
  'Imp-Schuldner': [
    'Imp: Schulden. Dein Posten steht schon in der Spalte, auch wenn du den nicht geschrieben hast.',
    'Imp: Der König hat uns noch gekannt. Du riechst nach seiner Feder.',
    'Imp: Schlag im Takt, sonst kommt der zweite Schlag nicht an.',
  ],
  'Chronistin Mara': [
    'Mara: Ich schreibe, was bleibt. Namen verblassen sonst.',
    'Mara: Der Erste Held… der Stein flüstert noch.',
    'Mara: Nimm dieses Fragment. Es gehört in keine Truhe.',
  ],
};

/** Role fallbacks when name unknown / densified stranger */
export const ROLE_LINES = {
  guard: [
    'Ein Wächter: Weitergehen. Keine Scherereien.',
    'Ein Wächter: Die Mauern halten — solange wir wach bleiben.',
  ],
  mage: [
    'Eine Gelehrte: Magie fordert Preis. Zahl ihn bewusst.',
    'Eine Gelehrte: Runen hier sind älter als das Reich.',
  ],
  merchant: [
    'Ein Händler: Ware gegen Münze. Feilschen erlaubt.',
    'Ein Händler: Seltenes wird teurer, je dunkler die Nacht.',
  ],
  spy: [
    'Eine Vermummte: Hör auf zu starren. Ich bin beschäftigt.',
    'Eine Vermummte: Geheimnisse sind billig. Schweigen teuer.',
  ],
  villager: [
    'Ein Passant: Schlechte Zeiten. Halt dich an Weggefährten.',
    'Ein Passant: Habt ihr Vorräte? Der Winter frisst alles.',
  ],
  daemon: [
    'Eine Gestalt der Nacht: …Du riechst nach Thron und Schuld.',
    'Eine Gestalt der Nacht: Sprich leise. Wände haben Ohren.',
  ],
  princess: [
    'Eine Edelfrau: Man erwartet Haltung — auch im Chaos.',
  ],
};

/** Names that introduce themselves on first talk → learnName */
export const SELF_INTRO_NAMES = new Set([
  'Sekretärin Velka','General Brok','Wächter Toren','Kundschafterin Lira','Händler Bram',
  'Priesterin Solara','Chronistin Mara','Spionin Nyx','Akolyth Ren','Heldin Aria','Grabräuber Jex',
]);

export function lineForNpc(name, sheet='villager', turn=0){
  const key=String(name||'').trim();
  const pool = HUB_NPC_LINES[key] || ROLE_LINES[sheet] || ROLE_LINES.villager;
  const i = Math.abs(turn|0) % pool.length;
  return pool[i];
}

export function displayLabelFor(S, name, sheet){
  const Know = (typeof window!=='undefined' && window.__game?.Know) || null;
  const trueName=String(name||'').trim()||'Unbekannt';
  const npc = S?.world?.npcs?.[trueName] || { art: roleArt(sheet), sheet };
  if(Know?.displayName){
    try{ return Know.displayName(S, trueName, npc); }catch(_){}
  }
  return trueName;
}

function roleArt(sheet){
  return ({
    guard:'ein strenger Wächter in dunkler Rüstung',
    mage:'eine gelehrte Frau mit Schriftrollen',
    merchant:'ein reisender Händler mit schwerem Sack',
    spy:'eine vermummte Gestalt im Schatten',
    villager:'ein einfacher Passant',
    daemon:'eine unheimliche Gestalt',
    princess:'eine Edelfrau',
  })[sheet] || 'jemand Unbekanntes';
}

export const ensureV62 = C63.ensureV62;
export const ensureV63 = C63.ensureV63;
export const unlockSkillNode = C63.unlockSkillNode;
export const grantSkillPts = C63.grantSkillPts;
export const tryCraft = C63.tryCraft;
export const craftTierOf = C63.craftTierOf;
export const completeSidequest = C63.completeSidequest;
export const solvePuzzle = C63.solvePuzzle;
export const maybeUnlockSuperboss = C63.maybeUnlockSuperboss;
export const sidequestForChapter = C63.sidequestForChapter;
export const puzzleForChapter = C63.puzzleForChapter;
export const startCampaign = C63.startCampaign;
export const resolveChoice = C63.resolveChoice;
export const renderJrpgChoices = C63.renderJrpgChoices;
export const pendingBattleId = C63.pendingBattleId;
export const scaleBossFoe = C63.scaleBossFoe;
export const onBossVictory = C63.onBossVictory;

export function ensureV64(S){
  C63.ensureV63?.(S);
  S.flags = S.flags || {};
  S.flags.visual64 = true;
  S.flags.freetext = false;
  return S;
}

export function migrateV64(S){
  try{ C63.migrateV63?.(S); }catch(_){}
  S.ver = Math.max(S.ver|0, 64);
  S.flags = S.flags || {};
  S.flags.visual59 = true;
  S.flags.visual62 = true;
  S.flags.visual63 = true;
  S.flags.visual64 = true;
  S.flags.jrpg59 = true;
  S.flags.freetext = false;
  ensureV64(S);
  return S;
}

export default {
  FREETEXT_ENABLED, CAMPAIGN_ID, CHAPTERS, BOSS_SCALE, ENDINGS, SIDEQUESTS,
  CHAR_SKILL_TREES, CRAFT_TIERS, CRAFT_RECIPES, CHAPTER_SIDEQUESTS, CHAPTER_PUZZLES, OPTIONAL_SUPERBOSS,
  HUB_NPC_LINES, ROLE_LINES, SELF_INTRO_NAMES, lineForNpc, displayLabelFor,
  migrateV64, ensureV64, ensureV63, ensureV62, unlockSkillNode, grantSkillPts, tryCraft, craftTierOf,
  completeSidequest, solvePuzzle, maybeUnlockSuperboss, sidequestForChapter, puzzleForChapter,
  startCampaign, resolveChoice, renderJrpgChoices, pendingBattleId, scaleBossFoe, onBossVictory,
};
