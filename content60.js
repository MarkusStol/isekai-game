/** v60 — Nocturna literary + graphics pack: Dunkles Reich Nocturna (daemon arc).
 * Free-text narrator archived (FREETEXT_ENABLED=false). Menu choices only.
 * v60: tiles-nocturna, area grades, denser hubs, literary German scenes,
 * grey antagonist (Thronhunger), companion arcs, branching endings, sidequests.
 */
import * as C57 from './content57.js';

export const FREETEXT_ENABLED = false;

/** German chapter outline (also for report) */
export const CHAPTER_OUTLINE_DE = [
  'Kap.1 Thron ohne Gold — Thronsaal & Schatzkatakomben; Boss: Niederer Fiend; Rekrut: Velka; Side: Velkas Register',
  'Kap.2 Heldin am Pass — Grenzpass-Türme; Boss: Höllenhund; Rekrut: Nyx (+ Brok); Side: Nyx-Cache',
  'Kap.3 Nachtfeuer — Ruinen Solmir; Boss: Lich; Rekrut: Aria (Vertrauen); Side: Name des Ersten Helden',
  'Kap.4 Gott der Nacht? — Kathedrale; Boss: Erzfiend/Thronhunger; Enden A–D; Side: Solaras Geständnis',
];

export const CHAPTERS = [
  {
    id: 'c1',
    titel: 'Thron ohne Gold',
    actId: 'a1',
    hub: 'Thronsaal der Nacht',
    dungeon: { name: 'Schatzkatakomben', rooms: 4, boss: 'lesser_fiend', bossName: 'Niederer Fiend' },
    recruit: { id: 'Sekretärin Velka', role: 'mage', blurb: 'Velka legt das Klemmbrett beiseite — nur für dich.' },
    scenes: [
      { id: 'c1_open', speaker: 'Velka', text: 'Der Knochenthron knackt, wenn man sich setzt — als erinnerte er sich an jeden Vorgänger. Die Kasse ist leer. Brok will Krieg wie ein Kind Feuer. Aria steht schon am Pass. Und irgendwo unter uns tickt etwas, das Gold frisst. Was zuerst, Fürst?',
        choices: [
          { id: 'budget', label: 'Finanzen — die Wahrheit der Zahlen', next: 'c1_budget' },
          { id: 'war', label: 'Kriegsrat mit Brok', next: 'c1_brok' },
          { id: 'side', label: 'Velkas Register (Side)', next: 'c1_side' },
          { id: 'dungeon', label: 'Schatzkatakomben', next: 'c1_dung' },
          { id: 'town', label: 'Festung erkunden', next: 'town' },
        ]},
      { id: 'c1_budget', speaker: 'Velka', text: 'Steuerreform. Unbeliebt wie Wahrheit. Ich kann die Edikte mit deiner Aura siegeln — oder du hältst die Rede und siehst, wer zuckt. Beides füllt Taschen. Beides macht Feinde.',
        choices: [
          { id: 'sign', label: 'Edikte siegeln', effect: 'gold+40', next: 'c1_after_budget' },
          { id: 'speech', label: 'Rede an die Fürsten', effect: 'ruf+5', next: 'c1_after_budget' },
          { id: 'back', label: 'Zurück', next: 'c1_open' },
        ]},
      { id: 'c1_after_budget', speaker: 'Velka', text: 'Tropfen. Nicht Regen. Unter der Schatzkammer liegen Relikte aus Zeiten, als Nocturna noch einen anderen Namen hatte. Der Fiend dort unten … er bewacht keine Münzen. Er bewacht Schulden.',
        choices: [
          { id: 'dung', label: 'In die Katakomben', next: 'c1_dung' },
          { id: 'town', label: 'Festung', next: 'town' },
        ]},
      { id: 'c1_side', speaker: 'Velka', text: 'Hinter dem Thron: mein Register. Namen. Summen. Wer wen verriet, als der alte König fiel. Du wirst Dinge lesen, die du nicht ungelesen machen kannst. Willst du?',
        choices: [
          { id: 'read', label: 'Lesen (Geheimnis)', effect: 'aff:Sekretärin Velka:+10|ruf+2', next: 'c1_side_read' },
          { id: 'later', label: 'Später', next: 'c1_open' },
        ]},
      { id: 'c1_side_read', speaker: 'Erzähler', text: 'Tinte wie Blut, getrocknet. Velkas Handschrift: „Ich half. Nicht aus Hass — aus Hunger nach Ordnung.“ Darunter ein Name, den der Thron selbst trägt: Thronhunger. Nicht Titel. Parasit.',
        choices: [
          { id: 'ask', label: 'Velka konfrontieren', next: 'c1_side_ask' },
          { id: 'keep', label: 'Schweigen bewahren', effect: 'aff:Sekretärin Velka:+5', next: 'c1_open' },
        ]},
      { id: 'c1_side_ask', speaker: 'Velka', text: 'Ja. Der Thron frisst. Jeder „König“ war Futter. Ich wollte einen, der widersteht — oder wenigstens langsam verdaut wird. Du bist … vielversprechend zäh.',
        choices: [
          { id: 'trust', label: 'Ich vertraue dir trotzdem', effect: 'aff:Sekretärin Velka:+20|recruit:Sekretärin Velka', next: 'c1_open' },
          { id: 'watch', label: 'Ich behalte dich im Auge', effect: 'aff:Sekretärin Velka:+5', next: 'c1_open' },
        ]},
      { id: 'c1_brok', speaker: 'Brok', text: 'KRIEG, Herr! Die Orks brauchen ein Zeichen, dass der Thron noch Zähne hat — keine Akten. Ein Duell. Blut. Trommeln. Oder wir verrotten in Kasernen voller Langeweile.',
        choices: [
          { id: 'duel', label: 'Ehren-Duell (Kampf)', effect: 'battle:hellhound', next: 'c1_after_brok' },
          { id: 'later', label: 'Später — erst Gold', next: 'c1_open' },
        ]},
      { id: 'c1_after_brok', speaker: 'Brok', text: 'Hah! Du stehst. Die Truppe hat gesehen. Sie folgen — vorerst. Langeweile ist der schlimmste Verrat.',
        choices: [
          { id: 'rec', label: 'Brok in die Party', effect: 'recruit:General Brok', next: 'c1_open' },
          { id: 'town', label: 'Festung', next: 'town' },
        ]},
      { id: 'c1_dung', speaker: 'Erzähler', text: 'Stufen hinab. Fackeln werfen Schatten, die sich falsch bewegen. Imp-Geflüster: Schulden, Schulden. Am Ende der Katakomben wartet ein Fiend mit leeren Augen — und einer vollen Kasse aus Knochen.',
        choices: [
          { id: 'enter', label: 'Dungeon betreten', effect: 'dungeon:c1', next: 'dungeon' },
          { id: 'back', label: 'Zurück zum Thron', next: 'c1_open' },
        ]},
    ],
  },
  {
    id: 'c2',
    titel: 'Die Heldin am Pass',
    actId: 'a2',
    hub: 'Grenzpass',
    dungeon: { name: 'Wachtürme am Pass', rooms: 5, boss: 'hellhound', bossName: 'Höllenhund der Vorhut' },
    recruit: { id: 'Spionin Nyx', role: 'spy', blurb: 'Nyx verkauft Berichte — und bleibt, wenn der Preis stimmt.' },
    scenes: [
      { id: 'c2_open', speaker: 'Nyx', text: 'Wind vom Pass riecht nach Weihrauch und Angst. Aria steht dort oben wie ein Urteil. Die Kirche Solari atmet ihr im Nacken — süß, giftig. Töten. Bekehren. Verhandeln. Ich verkaufe alle drei. Manchmal sogar die Wahrheit.',
        choices: [
          { id: 'spy', label: 'Bericht kaufen (15G)', effect: 'gold-15', next: 'c2_report' },
          { id: 'recruit', label: 'Nyx anheuern', effect: 'recruit:Spionin Nyx', next: 'c2_report' },
          { id: 'side', label: 'Nyx-Cache (Side)', next: 'c2_side' },
          { id: 'dung', label: 'Wachtürme säubern', next: 'c2_dung' },
          { id: 'town', label: 'Pass-Lager', next: 'town' },
        ]},
      { id: 'c2_report', speaker: 'Nyx', text: 'Aria trägt ein Relikt des Ersten Helden. Es … summt, wenn du nah bist. Als erkennte es Schulden. Vorsicht: Solara hat ihr gesagt, du frisst Welten. Du hungerst nur. Das ist fast schlimmer — weil es menschlich klingt.',
        choices: [
          { id: 'meet', label: 'Erstkontakt mit Aria', next: 'c2_aria' },
          { id: 'dung', label: 'Türme zuerst', next: 'c2_dung' },
        ]},
      { id: 'c2_side', speaker: 'Nyx', text: 'In den Turmritzen: meine Caches. Berichte über Solara. Über dich. Über einen Namen, den die Kirche löschen will: Thronhunger. Hol sie — oder lass sie verfaulen. Beides ist eine Entscheidung.',
        choices: [
          { id: 'take', label: 'Caches bergen', effect: 'gold+25|aff:Spionin Nyx:+15', next: 'c2_side_done' },
          { id: 'leave', label: 'Lassen', next: 'c2_open' },
        ]},
      { id: 'c2_side_done', speaker: 'Erzähler', text: 'Pergament, kalt. Solara weiß vom Thronhunger. Sie will dich nicht töten — sie will dich ersetzen. Ein sauberer Wirt für denselben Parasit.',
        choices: [
          { id: 'ok', label: 'Weiter', next: 'c2_open' },
        ]},
      { id: 'c2_aria', speaker: 'Aria', text: 'Dämonenkönig. Die Schrift sagt: du bist Hunger mit Krone. Stell dich — oder rede, bevor Stahl die einzige Sprache ist. Ich … höre einmal. Nur einmal.',
        choices: [
          { id: 'fight', label: 'Kämpfen', effect: 'battle:blood_cultist', next: 'c2_aria_after' },
          { id: 'talk', label: 'Verhandeln', effect: 'aff:Heldin Aria:+20', next: 'c2_aria_talk' },
          { id: 'spare', label: 'Zurückweichen', next: 'c2_open' },
        ]},
      { id: 'c2_aria_talk', speaker: 'Aria', text: 'Die Kirche sagte, du frisst Welten. Deine Festung hungert nur. Kinder. Soldaten. Ein Sekretärin mit zu vielen Listen. … Ich höre zu. Einmal reicht nicht für Vertrauen. Aber für Zweifel.',
        choices: [
          { id: 'ally', label: 'Um Waffenstillstand bitten', effect: 'aff:Heldin Aria:+15', next: 'c2_open' },
          { id: 'dung', label: 'Weiter zum Pass-Dungeon', next: 'c2_dung' },
        ]},
      { id: 'c2_aria_after', speaker: 'Aria', text: 'Stahl auf Stahl. Sie weicht — lebend. In den Augen: nicht Hass. Rechnung. Als hätte jemand die Zahlen falsch addiert.',
        choices: [
          { id: 'next', label: 'Weiter', next: 'c2_dung' },
        ]},
      { id: 'c2_dung', speaker: 'Erzähler', text: 'Die Wachtürme stinken nach Schwefel und gebrochenen Gelübden. Die Vorhut der Kirche hält einen Höllenhund in Ketten — oder er hält sie. Ketten klingen wie Gebete, die niemand meint.',
        choices: [
          { id: 'enter', label: 'Dungeon betreten', effect: 'dungeon:c2', next: 'dungeon' },
          { id: 'back', label: 'Zurück', next: 'c2_open' },
        ]},
    ],
  },
  {
    id: 'c3',
    titel: 'Nachtfeuer',
    actId: 'a3',
    hub: 'Ruinen von Solmir',
    dungeon: { name: 'Gruft von Solmir', rooms: 5, boss: 'boss_lich', bossName: 'Lich von Solmir' },
    recruit: { id: 'Heldin Aria', role: 'guard', blurb: 'Aria stellt sich gegen die Kirche — an deine Seite.', requireAff: { 'Heldin Aria': 30 } },
    scenes: [
      { id: 'c3_open', speaker: 'Velka', text: 'Solmir: Ruinen, die sich an Licht erinnern. Fürst Malgor will abfallen — höflich, mit Messern unter der Serviette. Der Schattenmarkt verkauft Waffen und Gerüchte. Und ich … habe etwas zu gestehen, wenn du noch zuhören magst.',
        choices: [
          { id: 'secret', label: 'Velkas Geständnis', next: 'c3_velka' },
          { id: 'malgor', label: 'Malgor stellen', next: 'c3_malgor' },
          { id: 'side', label: 'Name des Ersten Helden (Side)', next: 'c3_side' },
          { id: 'dung', label: 'Gruft von Solmir', next: 'c3_dung' },
          { id: 'town', label: 'Lager', next: 'town' },
        ]},
      { id: 'c3_velka', speaker: 'Velka', text: 'Ich half, den alten König zu stürzen. Nicht aus Verrat — aus Notwendigkeit. Er war schon halb Thronhunger. Willst du mich dafür richten? Oder brauchst du jemanden, der Zahlen und Leichen gleich gut sortiert?',
        choices: [
          { id: 'forgive', label: 'Vergeben', effect: 'aff:Sekretärin Velka:+25', next: 'c3_open' },
          { id: 'judge', label: 'Auf Distanz halten', effect: 'aff:Sekretärin Velka:-10', next: 'c3_open' },
          { id: 'shadow', label: 'Schatten-Protokoll prüfen', effect: 'battle:story_velka_shadow', next: 'c3_open' },
        ]},
      { id: 'c3_malgor', speaker: 'Malgor', text: 'Mit Verlaub: die Peripherie zahlt genug. Unabhängigkeit ist keine Rebellion — sie ist Buchhaltung. Oder Stahl. Ich bin flexibel. Der Lich unter uns ist es nicht.',
        choices: [
          { id: 'fight', label: 'Duell der Fürsten', effect: 'battle:bone_knight', next: 'c3_dung' },
          { id: 'deal', label: 'Autonomie gegen Tribut', effect: 'gold+30', next: 'c3_open' },
        ]},
      { id: 'c3_side', speaker: 'Erzähler', text: 'Unter dem Altarstein flüstert Stein: der Name des Ersten Helden. Nicht Aria. Nicht Solara. Ein Name, den der Thronhunger gestohlen hat — und der jetzt in dir nachhallt. Wissen ist eine Waffe. Auch gegen dich selbst.',
        choices: [
          { id: 'learn', label: 'Namen annehmen', effect: 'ruf+8|aff:Heldin Aria:+10', next: 'c3_open' },
          { id: 'deny', label: 'Namen verweigern', effect: 'aff:Priesterin Solara:-5', next: 'c3_open' },
        ]},
      { id: 'c3_dung', speaker: 'Erzähler', text: 'Unter Solmir wartet ein Lich, der den Ersten Helden kannte — und deinen Namen flüstert, als hätte er ihn inventarisiert.',
        choices: [
          { id: 'enter', label: 'Dungeon betreten', effect: 'dungeon:c3', next: 'dungeon' },
          { id: 'aria', label: 'Aria rekrutieren (Vertrauen)', effect: 'recruit:Heldin Aria', next: 'c3_open' },
          { id: 'back', label: 'Zurück', next: 'c3_open' },
        ]},
    ],
  },
  {
    id: 'c4',
    titel: 'Gott der Nacht?',
    actId: 'a4',
    hub: 'Kathedrale des Lichts',
    dungeon: { name: 'Kathedrale Solari', rooms: 6, boss: 'boss_archfiend', bossName: 'Erzfiend / Thronhunger' },
    recruit: null,
    scenes: [
      { id: 'c4_open', speaker: 'Solara', text: 'Glas und Schuld. Das Licht vergibt — die Klinge nicht. Nocturna endet hier, oder du wirst, was der Thron frisst. Ich biete Erlösung: stirb sauber, und ich trage die Krone für euch alle. Freundlich. Final.',
        choices: [
          { id: 'title', label: 'Titel / Ende wählen', next: 'c4_title' },
          { id: 'side', label: 'Solaras Geständnis (Side)', next: 'c4_side' },
          { id: 'dung', label: 'Kathedrale stürmen', next: 'c4_dung' },
          { id: 'town', label: 'Letztes Lager', next: 'town' },
        ]},
      { id: 'c4_side', speaker: 'Solara', text: 'Unter dem Altar: mein Gebet und mein Geständnis. Ich hasste dich nicht. Ich beneidete den Hunger. Der Thronhunger flüsterte auch mir. Ich nannte es Berufung. Du nennst es Parasit. Wir sind … verwandt.',
        choices: [
          { id: 'spare', label: 'Verschonen anbieten', effect: 'aff:Priesterin Solara:+20', next: 'c4_open' },
          { id: 'reject', label: 'Zurückweisen', effect: 'aff:Priesterin Solara:-15', next: 'c4_open' },
        ]},
      { id: 'c4_title', speaker: 'Erzähler', text: 'Der Thron frisst Namen. Was willst du sein — und was soll Nocturna von dir behalten?',
        choices: [
          { id: 'lord', label: 'Ende A: Dämonenlord (Tyrann)', effect: 'title:Dämonenlord', next: 'c4_dung' },
          { id: 'king', label: 'Ende B: Dämonenkönig (Ordnung)', effect: 'title:Dämonenkönig', next: 'c4_dung' },
          { id: 'god', label: 'Ende C: Gott der Nacht (Opfer)', effect: 'title:Gott der Nacht', next: 'c4_dung' },
          { id: 'human', label: 'Ende D: Mensch auf dem Thron', effect: 'title:Mensch auf dem Thron', next: 'c4_dung' },
        ]},
      { id: 'c4_dung', speaker: 'Erzähler', text: 'Glasfenster zerbrechen wie Gelübde. Der Erzfiend erhebt sich — oder bist du es selbst? Der Thronhunger lächelt mit deinem Mund.',
        choices: [
          { id: 'enter', label: 'Finaler Dungeon', effect: 'dungeon:c4', next: 'dungeon' },
          { id: 'back', label: 'Zurück', next: 'c4_open' },
        ]},
      { id: 'c4_end', speaker: 'Erzähler', text: 'Nocturna atmet. Schulden bleiben — aber sie haben jetzt einen Namen, den du gewählt hast. Die Nacht ist nicht leer. Sie ist ein Vertrag. Ende des Kampagnen-Bogens. Side-Leben geht weiter im Menü.',
        choices: [
          { id: 'town', label: 'Festung verwalten', next: 'town' },
          { id: 'newgame', label: 'Von vorn (neues Spiel)', effect: 'newgame', next: 'c1_open' },
        ]},
    ],
  },
];

export function blankCampaign(){
  return {
    id: 'nocturna',
    chapterIdx: 0,
    sceneId: 'c1_open',
    mode: 'scene', // scene | town | dungeon | battle
    dungeon: null, // { chapterId, room, rooms, boss, cleared[] }
    party: [], // NPC names recruited
    flags: {},
    title: 'Gefallener Fürst',
    shopStock: [
      { name: 'Brot', type: 'food', price: 4, desc: 'Stillt Hunger' },
      { name: 'Heiltrank', type: 'consumable', price: 25, desc: '+40 HP' },
      { name: 'Nachtfeuer-Essenz', type: 'consumable', price: 40, desc: '+20 MP' },
      { name: 'Eisenklinge', type: 'weapon', price: 80, desc: 'ATK +4' },
      { name: 'Schattenrobe', type: 'armor', price: 70, desc: 'DEF +3' },
    ],
  };
}

export function migrateV58(S){
  C57.migrateV57(S);
  if(!S || typeof S!=='object') return S;
  S.ver = Math.max(Number(S.ver)||0, 58);
  S.flags = S.flags || {};
  S.flags.jrpg58 = true;
  S.flags.freetext = FREETEXT_ENABLED;
  S.flags.visual58 = true;
  if(!S.campaign || S.campaign.id!=='nocturna'){
    S.campaign = blankCampaign();
  }
  if(!Array.isArray(S.party)) S.party = S.campaign.party?.slice() || [];
  S.romance = S.romance || {};
  return S;
}

export function migrateV59(S){
  migrateV58(S);
  if(!S || typeof S!=='object') return S;
  S.ver = Math.max(Number(S.ver)||0, 59);
  S.flags = S.flags || {};
  S.flags.jrpg59 = true;
  S.flags.visual59 = true;
  S.flags.freetext = FREETEXT_ENABLED;
  // heal broken double-advance: if scene is c4_end but archfiend never beaten, rewind
  const f = S.campaign?.flags || (S.campaign.flags={});
  if(S.campaign?.sceneId==='c4_end' && !f.archfiendDown && (S.campaign.chapterIdx|0)>=3){
    // leave as-is if they finished; flag set by onBossVictory final
  }
  return S;
}

export function migrateV60(S){
  migrateV59(S);
  if(!S || typeof S!=='object') return S;
  S.ver = Math.max(Number(S.ver)||0, 60);
  S.flags = S.flags || {};
  S.flags.jrpg60 = true;
  S.flags.visual60 = true;
  S.flags.nocturnaTiles = true;
  S.flags.freetext = FREETEXT_ENABLED;
  S.campaign = S.campaign || blankCampaign();
  S.campaign.flags = S.campaign.flags || {};
  // Expand shop for v60 progression
  if(!(S.campaign.shopStock||[]).some(x=>x.name==='Nachtstahl')){
    S.campaign.shopStock = (S.campaign.shopStock||[]).concat([
      { name: 'Nachtstahl', type: 'weapon', price: 120, desc: 'ATK +6 · Dunkel' },
      { name: 'Antidot', type: 'consumable', price: 18, desc: 'Heilt Gift' },
      { name: 'Phylakterium-Splitter', type: 'misc', price: 60, desc: 'Sidequest-Fund' },
    ]);
  }
  return S;
}

/** Chapter-boss stat floors (applied when starting dungeon boss fights). */
export const BOSS_SCALE = {
  lesser_fiend: { hp:110, atk:13, def:10, mag:12, spd:10, boss:true, exp:90, gold:40 },
  hellhound: { hp:160, atk:16, def:11, mag:8, spd:13, boss:true, exp:120, gold:50 },
  boss_lich: { hp:240, atk:11, def:13, mag:22, spd:8, boss:true, exp:220, gold:90 },
  boss_archfiend: { hp:240, atk:16, def:14, mag:18, spd:8, boss:true, exp:300, gold:140 },
};
export function scaleBossFoe(foe, id){
  const sc = BOSS_SCALE[id] || BOSS_SCALE[foe?.id];
  if(!sc || !foe) return foe;
  const o = {...foe, ...sc, maxhp: sc.hp, boss:true};
  return o;
}


export function currentChapter(S){
  const idx = Math.min(CHAPTERS.length-1, Math.max(0, S.campaign?.chapterIdx|0));
  return CHAPTERS[idx];
}

export function findScene(S, sceneId){
  const id = sceneId || S.campaign?.sceneId;
  for(const ch of CHAPTERS){
    const sc = ch.scenes.find(s=>s.id===id);
    if(sc) return { chapter: ch, scene: sc };
  }
  return { chapter: CHAPTERS[0], scene: CHAPTERS[0].scenes[0] };
}

export function ensureDaemonWorld(S, hooks={}){
  // Prefer existing daemon pack NPCs; light seed if missing
  S.world = S.world || {};
  S.world.npcs = S.world.npcs || {};
  const seed = {
    'Sekretärin Velka': { art:'Sukkubus, Klemmbrett', stimme:'Trocken', ziel:'Nocturna retten', alive:true, ort:'Thronsaal' },
    'General Brok': { art:'Ork-General', stimme:'Brüllt', ziel:'Ruhm', alive:true, ort:'Kasernen' },
    'Spionin Nyx': { art:'Schatten-Spionin', stimme:'Flüstert', ziel:'Deals', alive:true, ort:'Schattenmarkt' },
    'Heldin Aria': { art:'Heldin Solari', stimme:'Klar', ziel:'Dich verstehen oder töten', alive:true, ort:'Grenzpass' },
    'Fürst Malgor': { art:'Skelettaristokrat', stimme:'Gesittet', ziel:'Autonomie', alive:true, ort:'Ruinen von Solmir' },
    'Priesterin Solara': { art:'Kirchenfanatikerin', stimme:'Süß-gefährlich', ziel:'Nocturna tilgen', alive:true, ort:'Kathedrale' },
  };
  for(const [n,npc] of Object.entries(seed)){
    if(!S.world.npcs[n]) S.world.npcs[n] = npc;
  }
  S.world.scene = S.world.scene || {};
  if(!S.world.scene.ort) S.world.scene.ort = currentChapter(S).hub;
  S.role = S.role || 'daemon';
  S.genre = S.genre || 'daemon';
  return S;
}

function applyEffect(S, effect, hooks){
  if(!effect) return '';
  const notes=[];
  const parts = String(effect).split('|');
  for(const raw of parts){
    const e = raw.trim();
    if(e.startsWith('gold+')){ const n=+e.slice(5)||0; S.st=S.st||{}; S.st.gold=(S.st.gold|0)+n; notes.push(`+${n} Gold`); }
    else if(e.startsWith('gold-')){ const n=+e.slice(5)||0; S.st=S.st||{}; S.st.gold=Math.max(0,(S.st.gold|0)-n); notes.push(`−${n} Gold`); }
    else if(e.startsWith('ruf+')){ const n=+e.slice(4)||0; S.st=S.st||{}; S.st.ruf=(S.st.ruf|0)+n; notes.push(`Ruf +${n}`); }
    else if(e.startsWith('title:')){ S.campaign.title=e.slice(6); S.pc=S.pc||{}; S.pc.title=S.campaign.title; notes.push(`Titel: ${S.campaign.title}`); }
    else if(e.startsWith('aff:')){
      const m=e.slice(4).match(/^(.+):([+-]?\d+)$/);
      if(m){ const who=m[1]; const n=+m[2]; S.romance=S.romance||{}; S.romance[who]=S.romance[who]||{affection:0,stage:0}; S.romance[who].affection=(S.romance[who].affection|0)+n; notes.push(`${who} ${n>=0?'+':''}${n}`); }
    }
    else if(e.startsWith('recruit:')){
      const who=e.slice(8);
      recruitMember(S, who, hooks);
      notes.push(`${who} schließt sich an`);
    }
    else if(e.startsWith('battle:')){
      const id=e.slice(7);
      notes.push(`Kampf: ${id}`);
      S.campaign._pendingBattle=id;
    }
    else if(e.startsWith('dungeon:')){
      const cid=e.slice(8);
      const ch=CHAPTERS.find(c=>c.id===cid)||currentChapter(S);
      startDungeon(S, ch);
      notes.push(`Dungeon: ${ch.dungeon.name}`);
    }
    else if(e==='newgame'){
      S.campaign=blankCampaign();
      notes.push('Neues Spiel');
    }
  }
  return notes.join(' · ');
}

export function recruitMember(S, who, hooks={}){
  ensureDaemonWorld(S);
  const ch=currentChapter(S);
  if(ch.recruit?.id===who && ch.recruit?.requireAff){
    for(const [n,need] of Object.entries(ch.recruit.requireAff)){
      const aff=S.romance?.[n]?.affection|0;
      if(aff<need){ hooks.toast?.(`${n} vertraut dir noch nicht (${aff}/${need}).`); return false; }
    }
  }
  S.campaign.party = S.campaign.party || [];
  S.party = S.party || [];
  if(!S.campaign.party.includes(who)) S.campaign.party.push(who);
  if(!S.party.includes(who)) S.party.push(who);
  S.romance = S.romance || {};
  S.romance[who] = S.romance[who] || {affection:0,stage:0};
  S.romance[who].affection = Math.max(S.romance[who].affection|0, 30);
  S.romance[who].stage = Math.max(S.romance[who].stage|0, 2);
  hooks.toast?.(`${who} ist in der Gruppe.`);
  return true;
}

export function startDungeon(S, ch){
  ch = ch || currentChapter(S);
  S.campaign.mode = 'dungeon';
  S.campaign.dungeon = {
    chapterId: ch.id,
    name: ch.dungeon.name,
    room: 1,
    rooms: ch.dungeon.rooms|4,
    boss: ch.dungeon.boss,
    bossName: ch.dungeon.bossName,
    chests: {},
  };
  S.world.scene.ort = ch.dungeon.name + ' · Raum 1';
}

export function townChoices(S){
  const ch = currentChapter(S);
  const party = (S.party||[]).slice(0,3).join(', ') || 'nur du';
  return {
    speaker: 'Festung',
    text: `${ch.hub}. Gold: ${S.st?.gold|0}. Party: ${party}. Titel: ${S.campaign?.title||'—'}. Was tun?`,
    choices: [
      { id: 'talk', label: 'Mit NPCs sprechen', next: 'town_talk' },
      { id: 'shop', label: 'Laden', next: 'town_shop' },
      { id: 'inn', label: 'Herberge (heilen)', next: 'town_inn' },
      { id: 'party', label: 'Gruppe ansehen', next: 'town_party' },
      { id: 'story', label: 'Zur Geschichte', next: 'story' },
      { id: 'dung', label: 'Zum Kapitel-Dungeon', next: 'dung_prompt' },
    ],
  };
}

export function talkMenu(S){
  ensureDaemonWorld(S);
  const names = Object.keys(S.world.npcs).filter(n=>S.world.npcs[n]?.alive!==false).slice(0,8);
  return {
    speaker: 'Gespräch',
    text: 'Wen sprichst du an?',
    choices: names.map(n=>({ id:'talk_'+n, label:n, next:'npc:'+n })).concat([{ id:'back', label:'Zurück', next:'town' }]),
  };
}

export function npcDialogue(S, who){
  const npc = S.world?.npcs?.[who] || {};
  const lines = {
    'Sekretärin Velka': 'Die Bücher lügen nicht. Du schon — manchmal. Ich sortiere beides. Befehle?',
    'General Brok': 'KRIEG! … Oder Training. Training ist Krieg gegen die eigene Schwäche. Beides macht Lärm.',
    'Spionin Nyx': 'Alles hat einen Preis. Auch Stille. Besonders Stille — die verkaufe ich teurer.',
    'Heldin Aria': 'Ich bin nicht deine Feindin für immer. Beweise, dass Nocturna mehr ist als Hunger mit Krone.',
    'Fürst Malgor': 'Mit Verlaub: Tribut ist höflich. Unterwerfung ist Buchhaltung ohne Anstand.',
    'Priesterin Solara': 'Das Licht sieht dich. Es lächelt nicht. Manchmal weint es — aus Berufung.',
  };
  const text = lines[who] || (npc.stimme || npc.art || `${who} mustert dich.`);
  return {
    speaker: who,
    text: String(text),
    choices: [
      { id: 'aff', label: 'Zuhören (+Vertrauen)', effect: `aff:${who}:+8`, next: 'town_talk' },
      { id: 'rec', label: 'In die Gruppe bitten', effect: `recruit:${who}`, next: 'town' },
      { id: 'back', label: 'Zurück', next: 'town' },
    ],
  };
}

export function shopMenu(S){
  const stock = S.campaign?.shopStock || [];
  return {
    speaker: 'Schattenmarkt-Laden',
    text: `Gold: ${S.st?.gold|0}. Was kaufen?`,
    choices: stock.map((it,i)=>({ id:'buy_'+i, label:`${it.name} (${it.price}G)`, next:'buy:'+i }))
      .concat([{ id:'back', label:'Zurück', next:'town' }]),
  };
}

export function dungeonMenu(S){
  const d = S.campaign?.dungeon;
  if(!d) return townChoices(S);
  const done = d.room > d.rooms;
  if(done){
    return {
      speaker: d.name,
      text: `Du stehst vor der Boss-Tür. ${d.bossName} wartet.`,
      choices: [
        { id: 'boss', label: 'Boss bekämpfen', effect: 'battle:'+d.boss, next: 'boss_pending' },
        { id: 'leave', label: 'Dungeon verlassen', next: 'town' },
      ],
    };
  }
  const chestOpen = !!d.chests[d.room];
  return {
    speaker: d.name,
    text: `Raum ${d.room}/${d.rooms}. Fackeln. ${chestOpen?'Truhe bereits geleert.':'Eine Truhe glänzt in der Ecke.'} Etwas bewegt sich.`,
    choices: [
      { id: 'chest', label: chestOpen?'Truhe (leer)':'Truhe öffnen', next: 'dung_chest' },
      { id: 'fight', label: 'Gegner stellen', effect: 'battle:demon_imp', next: 'dung_after_fight' },
      { id: 'next', label: 'Nächster Raum', next: 'dung_next' },
      { id: 'leave', label: 'Fliehen / Verlassen', next: 'town' },
    ],
  };
}

export function advanceDungeonRoom(S){
  const d=S.campaign?.dungeon; if(!d) return;
  d.room = Math.min((d.rooms|0)+1, (d.room|0)+1);
  S.world.scene.ort = `${d.name} · Raum ${Math.min(d.room,d.rooms)}`;
}

export function openChest(S){
  const d=S.campaign?.dungeon; if(!d) return 'Keine Truhe.';
  if(d.chests[d.room]) return 'Die Truhe ist leer.';
  d.chests[d.room]=1;
  const gold=10+((d.room|0)*5);
  S.st=S.st||{}; S.st.gold=(S.st.gold|0)+gold;
  S.inv=S.inv||[];
  if(Math.random()<0.5) S.inv.push({name:'Schattenkristall',type:'misc',rarity:'uncommon',desc:'Dungeon-Fund'});
  return `Truhe: +${gold} Gold`+(S.inv.length?' und Beute.':'.');
}

export function innRest(S){
  const cost=15;
  S.st=S.st||{};
  if((S.st.gold|0)<cost) return { ok:false, text:`Herberge kostet ${cost} Gold — zu wenig.` };
  S.st.gold-=cost;
  S.st.hp=S.st.maxhp|100;
  S.st.mp=S.st.maxmp|40;
  return { ok:true, text:`Du ruhst in der Herberge (−${cost} Gold). KP/MP voll.` };
}

/** Resolve a choice id/next into the next display pack */
export function resolveChoice(S, choice, hooks={}){
  ensureDaemonWorld(S, hooks);
  S.campaign = S.campaign || blankCampaign();
  let note = applyEffect(S, choice?.effect, hooks);

  // purchases
  if(String(choice?.next||'').startsWith('buy:')){
    const idx=+String(choice.next).slice(4);
    const it=(S.campaign.shopStock||[])[idx];
    if(!it){ return showPack(S, townChoices(S), note); }
    if((S.st?.gold|0)<it.price) return showPack(S, { speaker:'Händler', text:`Zu teuer. ${it.name} kostet ${it.price}G.`, choices:[{id:'b',label:'Zurück',next:'town_shop'}] }, note);
    S.st.gold-=it.price;
    S.inv=S.inv||[]; S.inv.push({...it});
    note = `Gekauft: ${it.name}`;
    return showPack(S, shopMenu(S), note);
  }

  if(String(choice?.next||'').startsWith('npc:')){
    const who=String(choice.next).slice(4);
    return showPack(S, npcDialogue(S, who), note);
  }

  let next = choice?.next || 'town';

  if(next==='town' || next==='town_menu'){
    S.campaign.mode='town';
    return showPack(S, townChoices(S), note);
  }
  if(next==='town_talk') return showPack(S, talkMenu(S), note);
  if(next==='town_shop') return showPack(S, shopMenu(S), note);
  if(next==='town_inn'){
    const r=innRest(S);
    return showPack(S, { speaker:'Herberge', text:r.text, choices:[{id:'b',label:'Zurück',next:'town'}] }, note);
  }
  if(next==='town_party'){
    const list=(S.party||[]).map(n=>'• '+n).join('\n')||'• (allein)';
    return showPack(S, { speaker:'Gruppe', text:`Aktive Gefährten:\n${list}`, choices:[{id:'b',label:'Zurück',next:'town'}] }, note);
  }
  if(next==='story'){
    const { scene } = findScene(S, currentChapter(S).scenes[0].id);
    S.campaign.sceneId = scene.id;
    S.campaign.mode='scene';
    return showPack(S, scene, note);
  }
  if(next==='dung_prompt'){
    const ch=currentChapter(S);
    return showPack(S, { speaker:ch.dungeon.name, text:`Kapitel-Dungeon: ${ch.dungeon.name} (Boss: ${ch.dungeon.bossName}).`,
      choices:[{id:'go',label:'Betreten',effect:'dungeon:'+ch.id,next:'dungeon'},{id:'b',label:'Zurück',next:'town'}] }, note);
  }
  if(next==='dungeon'){
    S.campaign.mode='dungeon';
    return showPack(S, dungeonMenu(S), note);
  }
  if(next==='dung_chest'){
    const msg=openChest(S);
    return showPack(S, { speaker:'Truhe', text:msg, choices:[{id:'c',label:'Weiter',next:'dungeon'}] }, note);
  }
  if(next==='dung_next'){
    advanceDungeonRoom(S);
    return showPack(S, dungeonMenu(S), note);
  }
  if(next==='dung_after_fight'){
    return showPack(S, dungeonMenu(S), note);
  }
  if(next==='boss_pending' || next==='boss_win'){
    // Battle starts via pendingBattle; onEnd calls onBossVictory. Never advance pre-fight
    // (boss_win was the v58 label — kept as alias so old choice objs cannot softlock).
    const d=S.campaign?.dungeon;
    return showPack(S, {
      speaker: d?.bossName || 'Boss',
      text: (d?.bossName||'Der Boss') + ' erhebt sich. ATB-Kampf!',
      choices: [{ id:'wait', label:'…', next:'dungeon' }],
    }, note);
  }

  // named scene
  const found = findScene(S, next);
  if(found?.scene){
    S.campaign.sceneId = found.scene.id;
    S.campaign.mode = 'scene';
    // auto chapter advance when entering cN_open of later chapter via explicit next
    const idx = CHAPTERS.findIndex(c=>c.id===found.chapter.id);
    if(idx>=0) S.campaign.chapterIdx = idx;
    S.world.scene.ort = found.chapter.hub;
    return showPack(S, found.scene, note);
  }

  return showPack(S, townChoices(S), note);
}

export function onBossVictory(S, hooks={}){
  const d=S.campaign?.dungeon;
  const ch=currentChapter(S);
  S.campaign.flags = S.campaign.flags || {};
  const bossId = d?.boss || ch?.dungeon?.boss;
  // idempotent: don't double-advance if already processed this boss
  const flagKey = 'beat_'+ (bossId||ch?.id||'x');
  if(S.campaign.flags[flagKey]){
    const { scene } = findScene(S, S.campaign.sceneId);
    return showPack(S, scene || currentChapter(S).scenes[0], 'Weiter…');
  }
  S.campaign.flags[flagKey] = true;
  if(bossId==='boss_archfiend') S.campaign.flags.archfiendDown = true;
  S.campaign.mode='scene';
  S.campaign.dungeon=null;
  S.st=S.st||{}; S.st.gold=(S.st.gold|0)+50; S.st.xp=(S.st.xp|0)+80;
  if(ch.recruit?.id){ recruitMember(S, ch.recruit.id, hooks); }
  if((S.campaign.chapterIdx|0) < CHAPTERS.length-1){
    S.campaign.chapterIdx = (S.campaign.chapterIdx|0)+1;
    const nch=currentChapter(S);
    S.campaign.sceneId = nch.scenes[0].id;
    hooks.toast?.(`Kapitel geschafft! → ${nch.titel}`);
    return showPack(S, nch.scenes[0], `Boss besiegt. +50 Gold. ${ch.recruit?.blurb||''}`);
  }
  S.campaign.sceneId='c4_end';
  return showPack(S, findScene(S,'c4_end').scene, 'Finaler Boss besiegt.');
}

function showPack(S, pack, note){
  const text = note ? `${pack.text}\n\n(${note})` : pack.text;
  const choices = (pack.choices||[]).map(c=>c.label);
  // stash rich choices for click handler
  S.campaign._choiceObjs = (pack.choices||[]).slice();
  S.choices = choices;
  return {
    speaker: pack.speaker || 'Erzähler',
    text,
    choices: pack.choices||[],
    changes: { choices },
  };
}

/** Boot into JRPG scene after newLife / migrate */
export function startCampaign(S, hooks={}){
  migrateV58(S);
  ensureDaemonWorld(S, hooks);
  S.campaign.mode='scene';
  const { scene, chapter } = findScene(S, S.campaign.sceneId);
  S.campaign.sceneId = scene.id;
  S.world.scene.ort = chapter.hub;
  return showPack(S, scene, '');
}

export function renderJrpgChoices(S, hooks){
  const objs = S.campaign?._choiceObjs || [];
  const host = hooks.choicesEl;
  if(!host) return;
  host.innerHTML='';
  objs.forEach((ch)=>{
    const btn=document.createElement('button');
    btn.type='button';
    btn.textContent=ch.label;
    btn.onclick=()=>hooks.onChoice?.(ch);
    host.appendChild(btn);
  });
}

export function pendingBattleId(S){
  const id=S.campaign?._pendingBattle;
  if(id){ delete S.campaign._pendingBattle; return id; }
  return null;
}

export default {
  FREETEXT_ENABLED, CHAPTER_OUTLINE_DE, CHAPTERS, blankCampaign, migrateV58, migrateV59, migrateV60,
  currentChapter, findScene, ensureDaemonWorld, recruitMember, startDungeon,
  townChoices, resolveChoice, startCampaign, renderJrpgChoices, onBossVictory,
  pendingBattleId, innRest, openChest, dungeonMenu, shopMenu, talkMenu, npcDialogue,
  BOSS_SCALE, scaleBossFoe,
};
