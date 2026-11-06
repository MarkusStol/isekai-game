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
    dungeon: { name: 'Schatzkatakomben', rooms: 5, boss: 'lesser_fiend', bossName: 'Niederer Fiend', puzzleRoom: 3, puzzleId: 'c1_ledger_seal' },
    recruit: { id: 'Sekretärin Velka', role: 'mage', blurb: 'Velka legt das Klemmbrett beiseite — nur für dich.' },
    estimatedMin: 55,
    scenes: [
      { id: 'c1_intro', speaker: 'Noctis', text: 'Die Krone ist warm vom Sitzen, nicht vom Blut. Du kennst Velkas Schritte, bevor du sie siehst. Brok atmet, als hätte er seit einer Stunde nicht gebrüllt. Das ist schlimmer als Lärm. Irgendwo im Saal hustet jemand, kurz, und hört dann auf.',
        choices: [
          { id: 'wake', label: 'Augen öffnen — Thronsaal', next: 'c1_velka' },
        ]},
      { id: 'c1_velka', speaker: 'Velka', text: 'Vierzehn Gold. Ein offener Posten auf deinen Namen, den du nicht unterschrieben hast. Rekrut Venn hat heute Morgen Goldstaub gehustet — aus der Lunge, Noctis, nicht aus der Tasche. Ich habe dem alten König die Bücher geführt, bis er unsere Namen nicht mehr sagte. Ich werde das nicht noch einmal höflich tun.',
        choices: [
          { id: 'hear', label: 'Sie ausreden lassen', next: 'c1_brok_in' },
        ]},
      { id: 'c1_brok_in', speaker: 'Brok', text: 'Sie hat ihm die Seiten umgeschlagen, während er uns vergaß. Ich stand mit ihm im Matsch, und am Ende kannte er meine Stimme nicht. Er hat mich Soldat genannt. Nicht Brok. Gib mir die Nacht am Pass, oder Venn stirbt an ihrer Tinte. Aria ist schon im Saal. Ihr Bruder steht oben in der zweiten Wache.',
        choices: [
          { id: 'both', label: 'Beide anhören', next: 'c1_aria' },
        ]},
      { id: 'c1_aria', speaker: 'Aria', text: 'Solara will die Festung brennen, wenn das unter dem Thron bis zur dritten Glocke nicht versiegelt ist. Ich glaube ihr nicht. Ich glaube dir nicht. Mein Bruder Lio schreibt, der Wind am Pass sagt deinen Namen. Ich gehe mit in den Keller. Danach gehe ich. Nicht in deine Gruppe. In den Keller, und dann zu ihm.',
        choices: [
          { id: 'hall', label: 'In den Saal', next: 'c1_open' },
        ]},
      { id: 'c1_open', speaker: 'Velka', text: 'Brok will heute Nacht marschieren. Ich will die Edikte, sonst frisst die Kasse morgen Venns Namen. Aria wartet auf die Treppe, nicht auf einen Titel. Unter dem Sitz des Throns sind drei Kerben: neun, neun, neun. Dieselbe Folge steht im Register, in deiner Handschrift. Du erinnerst dich nicht. Das ist der Teil, der mir Angst macht.',
        choices: [
          { id: 'budget', label: 'Finanzen — die Wahrheit der Zahlen', next: 'c1_budget' },
          { id: 'war', label: 'Kriegsrat mit Brok', next: 'c1_brok' },
          { id: 'side', label: 'Velkas Register (Side)', next: 'c1_side' },
          { id: 'aria', label: 'Aria anhören', next: 'c1_aria_quiet' },
          { id: 'dungeon', label: 'Schatzkatakomben', next: 'c1_dung' },
          { id: 'town', label: 'Festung erkunden', next: 'town' },
        ]},
      { id: 'c1_budget', speaker: 'Velka', text: 'Wenn ich die Edikte mit deiner Aura siegle, ist morgen Brot da. Venn wird bezahlt. Brok wird mich eine Mörderin mit Stempel nennen, und er hat nicht ganz unrecht: das Gold kommt aus derselben Kasse, die Venn aushustet. Oder du hältst die Rede und lässt die Fürsten selbst zittern. Beides füllt Taschen. Beides hat danach noch einen Namen, den wir aussprechen müssen.',
        choices: [
          { id: 'sign', label: 'Edikte siegeln', effect: 'gold+40|flag:edicts', next: 'c1_after_budget' },
          { id: 'speech', label: 'Rede an die Fürsten', effect: 'ruf+5|flag:speech', next: 'c1_after_budget' },
          { id: 'back', label: 'Zurück', next: 'c1_open' },
        ]},
      { id: 'c1_after_budget', speaker: 'Velka', text: 'Sie legt den Stempel hin, als wäre er schwerer als das Klemmbrett. Brok sagt nichts. Das ist neu. Aria wischt Goldstaub von einer Bank, die nicht ihr gehört. „Lio hat so gehustet, bevor er an den Pass ging“, sagt sie, zu niemandem. Leg die Hand flach unters Thronholz: drei Kerben. Neun. Neun. Neun. Dieselbe Folge öffnet das Siegel unten.',
        choices: [
          { id: 'dung', label: 'In die Katakomben', next: 'c1_dung' },
          { id: 'town', label: 'Festung', next: 'town' },
        ]},
      { id: 'c1_aria_quiet', speaker: 'Aria', text: 'Ich bleibe bis zum Fiend. Danach hole ich Lio, ob du König bist oder nur ein Mann mit einer Handschrift, an die er sich nicht erinnert. Solstich nehme ich mit — Licht gegen die Münzrüstung. Wenn er die Rüstung abwirft und mit der Stimme eures Königs spricht, hilft Licht weniger. Dann braucht ihr Broks Gewicht und Velkas Tinte. Nicht mich als Heilige.',
        choices: [
          { id: 'guest', label: 'Sie geht mit hinunter', effect: 'flag:ariaGuest|aff:Heldin Aria:+12', next: 'c1_open' },
          { id: 'back', label: 'Zurück', next: 'c1_open' },
        ]},
      { id: 'c1_side', speaker: 'Velka', text: 'Hinter dem Thron liegt das Register offen. Letzte Zeile, deine Hand: „Wenn ich sie vergesse, verbrennt die Seite, nicht die Stadt.“ Darunter, kleiner, nicht deine Tinte: drei Neunen. Ich habe das Datum nicht geschrieben. Daneben steht nur: er hat uns noch gekannt. Am Rand ein durchgestrichenes Wort. Ich lese es nicht vor.',
        choices: [
          { id: 'read', label: 'Lesen (Geheimnis)', effect: 'aff:Sekretärin Velka:+10|ruf+2', next: 'c1_side_read' },
          { id: 'later', label: 'Später', next: 'c1_open' },
        ]},
      { id: 'c1_side_read', speaker: 'Noctis', text: 'Du liest es laut. Brok setzt sich, was er nie tut. Aria sagt: „Dann ist das Siegel keine Magie. Es ist, ihn daran zu erinnern, wen er gemeint hat.“ Velka, leise: „Ich habe ihm die Feder geführt, Noctis. An dem Abend. Nicht du. Das Wort am Rand heißt Thronhunger. Ich benutze es nicht. Noch nicht.“',
        choices: [
          { id: 'ask', label: 'Velka konfrontieren', next: 'c1_side_ask' },
          { id: 'keep', label: 'Schweigen bewahren', effect: 'aff:Sekretärin Velka:+5', next: 'c1_open' },
        ]},
      { id: 'c1_side_ask', speaker: 'Velka', text: 'Ja. Ich habe die Feder gehalten, weil seine Hand schon Goldstaub war. Wenn du mich dafür hasst, tu es laut. Wenn du mich mitnimmst, tu es nicht, weil ich nützlich bin. Tu es, weil jemand die Namen noch lesen kann, wenn du sie vergisst. Die drei Neunen sind sein Satz. Im Kampf ist es derselbe Takt: triff das helle Feld, oder der Schlag wird dünn.',
        choices: [
          { id: 'trust', label: 'Ich vertraue dir trotzdem', effect: 'aff:Sekretärin Velka:+20|recruit:Sekretärin Velka', next: 'c1_open' },
          { id: 'watch', label: 'Ich behalte dich im Auge', effect: 'aff:Sekretärin Velka:+5', next: 'c1_open' },
        ]},
      { id: 'c1_brok', speaker: 'Brok', text: 'Nicht Krieg. Lio und Venn. Eine Nacht. Ich bringe sie zurück, oder ich bringe ihre Namen zurück, und dann rede ich leiser. Ein Duell vorher, damit die Truppe sieht, dass du noch selbst stehst. Kein Spektakel. Ein Beweis. Wenn das Ding unten meinen Namen kennt, schlag nicht daneben.',
        choices: [
          { id: 'duel', label: 'Ehren-Duell (Kampf)', effect: 'battle:hellhound', next: 'c1_after_brok' },
          { id: 'later', label: 'Später — erst Gold', next: 'c1_open' },
        ]},
      { id: 'c1_after_brok', speaker: 'Brok', text: 'Du stehst. Er nickt, einmal, wie einem Gleichen. „Er hat mich in der letzten Woche Soldat genannt. Nicht Brok. Ich komme mit runter. Nicht weil ich dir glaube. Weil Venn heute noch einen Namen haben soll, den jemand laut sagt.“',
        choices: [
          { id: 'rec', label: 'Brok in die Party', effect: 'recruit:General Brok', next: 'c1_open' },
          { id: 'town', label: 'Festung', next: 'town' },
        ]},
      { id: 'c1_dung', speaker: 'Velka', text: 'Die Treppe ist schmaler als in deiner Erinnerung. Ich zähle Stufen, damit Brok nicht die falsche nimmt. Aria geht zuletzt. „Wenn er Lios Namen sagt, schlagt weiter. Ich kann das nicht.“ Unten: ein Siegel aus Knochen und Tinte. Drei Neunen. Falsche Hand, und es beißt. Am Altar im Norden drückst du den Satz — im Kampf ist es derselbe Takt.',
        choices: [
          { id: 'enter', label: 'Dungeon betreten', effect: 'dungeon:c1', next: 'dungeon' },
          { id: 'back', label: 'Zurück zum Thron', next: 'c1_open' },
        ]},
      { id: 'c1_reward', speaker: 'Velka', text: 'Er fällt nicht wie ein Monster. Er setzt sich. Gold rieselt, und darin die Zeile aus dem Register, mit der Stimme, die Brok vermisst hat: „Verbrennt die Seite nicht.“ Du streicht sie nicht durch. Du schreibst darunter drei Namen, langsam, als müsste die Tinte sie sich merken. Aria nickt — keine Allianz, eine Quittung — und geht zum Pass, Lio holen. Brok bleibt. „Morgen sagen wir Venn, dass der Staub aufgehört hat.“ Die Festung ist nicht gerettet. Jemand in ihr hat noch einen Namen.',
        choices: [
          { id: 'keep', label: 'Siegel einstecken (+Loot)', effect: 'gold+80|aff:Sekretärin Velka:+15|recruit:Sekretärin Velka', next: 'c2_open' },
          { id: 'town', label: 'Festung feiern', effect: 'gold+40', next: 'town' },
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
          { id: 'newgame', label: 'Von vorn (neues Spiel)', effect: 'newgame', next: 'c1_intro' },
        ]},
    ],
  },
];

export function blankCampaign(){
  return {
    id: 'nocturna',
    chapterIdx: 0,
    sceneId: 'c1_intro',
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
  lesser_fiend: { hp:150, atk:15, def:9, mag:12, spd:10, boss:true, exp:90, gold:40 },
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
    else if(e.startsWith('flag:')){ S.campaign.flags=S.campaign.flags||{}; S.campaign.flags[e.slice(5)]=true; notes.push(e.slice(5)); }
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
  S.flags = S.flags || {}; S.flags.owNeedsRefresh = true;
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
  const ch = currentChapter(S);
  const puzzleRoom = ch?.dungeon?.puzzleRoom|0;
  const puzzleDone = !!(S.campaign.flags||{})['puzzle_'+ (ch?.dungeon?.puzzleId||'')];
  if(puzzleRoom && d.room===puzzleRoom && !puzzleDone){
    return {
      speaker: d.name,
      text: `Raum ${d.room}/${d.rooms}. Knochen und Tinte. Unter dem Thron waren drei Kerben, und im Register dieselbe Folge: neun, neun, neun. Velka, ohne aufzusehen: „Seine Hand. Nicht irgendeine Summe.“`,
      choices: [
        { id: 'pz_a', label: 'Siegel: 3-7-12 (Summe 22)', next: 'dung_puzzle_wrong' },
        { id: 'pz_b', label: 'Siegel: 9-9-9 (Summe 27)', next: 'dung_puzzle_ok' },
        { id: 'pz_c', label: 'Siegel: 1-1-1 (Summe 3)', next: 'dung_puzzle_wrong' },
        { id: 'leave', label: 'Später', next: 'town' },
      ],
    };
  }
  return {
    speaker: d.name,
    text: `Raum ${d.room}/${d.rooms}. Fackeln. ${chestOpen?'Truhe bereits geleert.':'Eine Truhe glänzt in der Ecke.'} ${puzzleDone&&d.room===puzzleRoom?'Das Siegel schläft. ':''}Etwas bewegt sich.`,
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
  S.flags = S.flags || {}; S.flags.owNeedsRefresh = true;
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
    try{ if(typeof window!=='undefined' && window.__game?.openInn){ window.__game.openInn(); return showPack(S, townChoices(S), note||'Herberge'); } }catch(_){}
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
  if(next==='dung_puzzle_ok'){
    S.campaign.flags=S.campaign.flags||{};
    const pid=currentChapter(S)?.dungeon?.puzzleId||'c1_ledger_seal';
    S.campaign.flags['puzzle_'+pid]=true;
    S.st=S.st||{}; S.st.gold=(S.st.gold|0)+35; S.st.xp=(S.st.xp|0)+40;
    advanceDungeonRoom(S);
    return showPack(S, { speaker:'Siegel', text:'Die Knochen klappen. Tinte wird Gold. +35 Gold, +40 XP. Der Weg ist frei.', choices:[{id:'c',label:'Weiter',next:'dungeon'}] }, note);
  }
  if(next==='dung_puzzle_wrong'){
    S.st=S.st||{}; S.st.hp=Math.max(1,(S.st.hp|0)-12);
    return showPack(S, { speaker:'Velka', text:'Das ist nicht seine Hand. Brok zieht dich zurück, bevor das Siegel mehr nimmt als Atem. 12 Schaden. Die Kerben warten: neun, neun, neun.', choices:[{id:'c',label:'Erneut versuchen',next:'dungeon'}] }, note);
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
  // v70: chapter-1 reward beat before advancing
  if(ch?.id==='c1'){
    const reward=ch.scenes.find(s=>s.id==='c1_reward')||ch.scenes[0];
    S.campaign.sceneId=reward.id;
    hooks.toast?.('Kapitel 1 — Fiend besiegt!');
    return showPack(S, reward, `Boss besiegt. +50 Gold. ${ch.recruit?.blurb||''}`);
  }
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
  S.skills=S.skills||[];
  if(!S.skills.some(s=>(s&&s.name)==='Nachtklinge')){
    S.skills.push({name:'Nachtklinge', mp:4, pow:1.35, elem:'dunkel', nachklang:3});
  }
  if(!S.skills.some(s=>(s&&s.name)==='Hieb')){
    S.skills.push({name:'Hieb', mp:0, pow:1.1, elem:'phys'});
  }
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
