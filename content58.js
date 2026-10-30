/** v58 — Classic JRPG campaign: Dunkles Reich Nocturna (daemon arc).
 * Free-text narrator archived (flag FREETEXT_ENABLED / tag freetext-archive).
 * Menu choices only: chapters, towns, NPC talk, shops, inns, dungeons, party, bosses.
 */
import * as C57 from './content57.js';

export const FREETEXT_ENABLED = false;

/** German chapter outline (also for report) */
export const CHAPTER_OUTLINE_DE = [
  'Kap.1 Thron ohne Gold — Thronsaal & Schatzkatakomben; Boss: Niederer Fiend; Rekrut: Velka',
  'Kap.2 Heldin am Pass — Grenzpass-Türme; Boss: Höllenhund; Rekrut: Nyx (+ Brok nach Duell)',
  'Kap.3 Nachtfeuer — Ruinen Solmir / Schattenmarkt; Boss: Lich; Rekrut: Aria (wenn verschont)',
  'Kap.4 Gott der Nacht? — Kathedrale des Lichts; Boss: Erzfiend; Finale & Titelwahl',
];

export const CHAPTERS = [
  {
    id: 'c1',
    titel: 'Thron ohne Gold',
    actId: 'a1',
    hub: 'Thronsaal der Nacht',
    dungeon: { name: 'Schatzkatakomben', rooms: 4, boss: 'lesser_fiend', bossName: 'Niederer Fiend' },
    recruit: { id: 'Sekretärin Velka', role: 'mage', blurb: 'Velka schließt sich dem Kriegsrat an — mit Klemmbrett.' },
    scenes: [
      { id: 'c1_open', speaker: 'Velka', text: 'Willkommen zurück auf dem Knochenthron. Die Kasse ist leer. Brok will Krieg. Aria marschiert. Was zuerst?',
        choices: [
          { id: 'budget', label: 'Finanzen zuerst', next: 'c1_budget' },
          { id: 'war', label: 'Kriegsrat mit Brok', next: 'c1_brok' },
          { id: 'dungeon', label: 'Schatzkatakomben durchsuchen', next: 'c1_dung' },
          { id: 'town', label: 'Festung erkunden', next: 'town' },
        ]},
      { id: 'c1_budget', speaker: 'Velka', text: 'Steuerreform. Unbeliebt. Wirksam. Mit deiner Aura unterschreibe ich die Edikte — oder du hältst die Rede.',
        choices: [
          { id: 'sign', label: 'Edikte unterschreiben', effect: 'gold+40', next: 'c1_after_budget' },
          { id: 'speech', label: 'Rede an die Fürsten', effect: 'ruf+5', next: 'c1_after_budget' },
          { id: 'back', label: 'Zurück', next: 'c1_open' },
        ]},
      { id: 'c1_after_budget', speaker: 'Velka', text: 'Etwas Gold tropft. Nicht genug. Die Katakomben unter der Schatzkammer sollen noch Relikte halten.',
        choices: [
          { id: 'dung', label: 'In die Katakomben', next: 'c1_dung' },
          { id: 'town', label: 'Festung', next: 'town' },
        ]},
      { id: 'c1_brok', speaker: 'Brok', text: 'KRIEG, Herr! Oder wenigstens ein Duell, damit die Orks wissen, dass der Thron Zähne hat.',
        choices: [
          { id: 'duel', label: 'Ehren-Duell (Kampf)', effect: 'battle:hellhound', next: 'c1_after_brok' },
          { id: 'later', label: 'Später — erst Gold', next: 'c1_open' },
        ]},
      { id: 'c1_after_brok', speaker: 'Brok', text: 'Hah! Blut und Trommeln. Die Truppe folgt dir — vorerst.',
        choices: [
          { id: 'rec', label: 'Brok in die Party nehmen', effect: 'recruit:General Brok', next: 'c1_open' },
          { id: 'town', label: 'Festung', next: 'town' },
        ]},
      { id: 'c1_dung', speaker: 'Erzähler', text: 'Stufen hinab. Fackeln. Imp-Geflüster. Am Ende der Katakomben: ein Fiend, der die leere Kasse bewacht.',
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
    recruit: { id: 'Spionin Nyx', role: 'spy', blurb: 'Nyx verkauft dir einen Bericht — und ihre Klinge.' },
    scenes: [
      { id: 'c2_open', speaker: 'Nyx', text: 'Aria steht am Pass. Die Kirche Solari atmet ihr im Nacken. Töte, bekehre — oder verhandle. Ich verkaufe alle drei Optionen.',
        choices: [
          { id: 'spy', label: 'Bericht kaufen (Nyx)', effect: 'gold-15', next: 'c2_report' },
          { id: 'recruit', label: 'Nyx anheuern', effect: 'recruit:Spionin Nyx', next: 'c2_report' },
          { id: 'dung', label: 'Wachtürme säubern', next: 'c2_dung' },
          { id: 'town', label: 'Pass-Lager', next: 'town' },
        ]},
      { id: 'c2_report', speaker: 'Nyx', text: 'Aria trägt ein Relikt des ersten Helden. Es … reagiert auf dich. Vorsicht.',
        choices: [
          { id: 'meet', label: 'Erstkontakt mit Aria', next: 'c2_aria' },
          { id: 'dung', label: 'Türme zuerst', next: 'c2_dung' },
        ]},
      { id: 'c2_aria', speaker: 'Aria', text: 'Dämonenkönig! Stell dich — oder rede, bevor Stahl spricht.',
        choices: [
          { id: 'fight', label: 'Kämpfen', effect: 'battle:blood_cultist', next: 'c2_aria_after' },
          { id: 'talk', label: 'Verhandeln', effect: 'aff:Heldin Aria:+20', next: 'c2_aria_talk' },
          { id: 'spare', label: 'Zurückweichen', next: 'c2_open' },
        ]},
      { id: 'c2_aria_talk', speaker: 'Aria', text: 'Die Kirche sagte, du frisst Welten. Deine Festung hungert nur. … Ich höre zu. Einmal.',
        choices: [
          { id: 'ally', label: 'Um Waffenstillstand bitten', effect: 'aff:Heldin Aria:+15', next: 'c2_open' },
          { id: 'dung', label: 'Weiter zum Pass-Dungeon', next: 'c2_dung' },
        ]},
      { id: 'c2_aria_after', speaker: 'Aria', text: 'Stahl auf Stahl. Sie weicht — lebend. Zweifel in den Augen.',
        choices: [
          { id: 'next', label: 'Weiter', next: 'c2_dung' },
        ]},
      { id: 'c2_dung', speaker: 'Erzähler', text: 'Die Wachtürme stinken nach Schwefel. Die Vorhut der Kirche hält einen Höllenhund in Ketten — oder er hält sie.',
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
      { id: 'c3_open', speaker: 'Velka', text: 'Fürst Malgor will abfallen. Der Schattenmarkt bietet Waffen. Und ich … habe etwas zu gestehen, wenn du es hören willst.',
        choices: [
          { id: 'secret', label: 'Velkas Geheimnis', next: 'c3_velka' },
          { id: 'malgor', label: 'Malgor stellen', next: 'c3_malgor' },
          { id: 'dung', label: 'Gruft von Solmir', next: 'c3_dung' },
          { id: 'town', label: 'Lager', next: 'town' },
        ]},
      { id: 'c3_velka', speaker: 'Velka', text: 'Ich half, den alten König zu stürzen. Nicht aus Verrat — aus Notwendigkeit. Willst du mich dafür richten?',
        choices: [
          { id: 'forgive', label: 'Vergeben', effect: 'aff:Sekretärin Velka:+25', next: 'c3_open' },
          { id: 'judge', label: 'Auf Distanz halten', effect: 'aff:Sekretärin Velka:-10', next: 'c3_open' },
          { id: 'shadow', label: 'Schatten-Protokoll prüfen', effect: 'battle:story_velka_shadow', next: 'c3_open' },
        ]},
      { id: 'c3_malgor', speaker: 'Malgor', text: 'Mit Verlaub: die Peripherie zahlt genug. Unabhängigkeit — oder Stahl.',
        choices: [
          { id: 'fight', label: 'Duell der Fürsten', effect: 'battle:bone_knight', next: 'c3_dung' },
          { id: 'deal', label: 'Autonomie gegen Tribut', effect: 'gold+30', next: 'c3_open' },
        ]},
      { id: 'c3_dung', speaker: 'Erzähler', text: 'Unter Solmir wartet ein Lich, der den ersten Helden kannte — und deinen Namen flüstert.',
        choices: [
          { id: 'enter', label: 'Dungeon betreten', effect: 'dungeon:c3', next: 'dungeon' },
          { id: 'aria', label: 'Aria rekrutieren (falls Vertrauen)', effect: 'recruit:Heldin Aria', next: 'c3_open' },
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
      { id: 'c4_open', speaker: 'Solara', text: 'Das Licht vergibt. Die Klinge nicht. Nocturna endet hier — oder du wirst, was der Thron frisst.',
        choices: [
          { id: 'title', label: 'Titel wählen', next: 'c4_title' },
          { id: 'dung', label: 'Kathedrale stürmen', next: 'c4_dung' },
          { id: 'town', label: 'Letztes Lager', next: 'town' },
        ]},
      { id: 'c4_title', speaker: 'Erzähler', text: 'Der Thron frisst Namen. Was willst du sein?',
        choices: [
          { id: 'lord', label: 'Dämonenlord', effect: 'title:Dämonenlord', next: 'c4_dung' },
          { id: 'king', label: 'Dämonenkönig', effect: 'title:Dämonenkönig', next: 'c4_dung' },
          { id: 'god', label: 'Gott der Nacht', effect: 'title:Gott der Nacht', next: 'c4_dung' },
          { id: 'human', label: 'Mensch bleiben', effect: 'title:Mensch auf dem Thron', next: 'c4_dung' },
        ]},
      { id: 'c4_dung', speaker: 'Erzähler', text: 'Glasfenster zerbrechen. Der Erzfiend erhebt sich — oder bist du es selbst?',
        choices: [
          { id: 'enter', label: 'Finaler Dungeon', effect: 'dungeon:c4', next: 'dungeon' },
          { id: 'back', label: 'Zurück', next: 'c4_open' },
        ]},
      { id: 'c4_end', speaker: 'Erzähler', text: 'Nocturna atmet. Schulden bleiben. Die Nacht hat einen Namen — deinen, oder den des Throns. Ende des Kampagnen-Bogens. Side-Leben geht weiter im Menü.',
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
  // seed romance stubs for recruit thresholds
  S.romance = S.romance || {};
  return S;
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
  if(ch.recruit?.requireAff){
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
    'Sekretärin Velka': 'Die Bücher lügen nicht. Du schon — manchmal. Befehle?',
    'General Brok': 'KRIEG! … Oder Training. Training ist auch Krieg gegen die eigene Schwäche.',
    'Spionin Nyx': 'Alles hat einen Preis. Auch Stille. Besonders Stille.',
    'Heldin Aria': 'Ich bin nicht deine Feindin für immer. Beweise, dass Nocturna mehr ist als Hunger.',
    'Fürst Malgor': 'Mit Verlaub: Tribut ist höflich. Unterwerfung ist es nicht.',
    'Priesterin Solara': 'Das Licht sieht dich. Es lächelt nicht.',
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
        { id: 'boss', label: 'Boss bekämpfen', effect: 'battle:'+d.boss, next: 'boss_win' },
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
  if(next==='boss_win'){
    return onBossVictory(S, hooks);
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
  S.campaign.mode='scene';
  S.campaign.dungeon=null;
  S.st=S.st||{}; S.st.gold=(S.st.gold|0)+50; S.st.xp=(S.st.xp|0)+80;
  // recruit chapter reward
  if(ch.recruit?.id){ recruitMember(S, ch.recruit.id, hooks); }
  // advance chapter
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
  FREETEXT_ENABLED, CHAPTER_OUTLINE_DE, CHAPTERS, blankCampaign, migrateV58,
  currentChapter, findScene, ensureDaemonWorld, recruitMember, startDungeon,
  townChoices, resolveChoice, startCampaign, renderJrpgChoices, onBossVictory,
  pendingBattleId, innRest, openChest, dungeonMenu, shopMenu, talkMenu, npcDialogue,
};
