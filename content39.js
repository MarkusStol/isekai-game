/** v39 emergent content — threads, side arcs, dungeons, mid-game (never railroad) */
import { pickEncounter, enemyById } from './enemies.js';
import * as Jobs from './jobs.js';
import * as Equip from './equip.js';
import * as Codex from './codex.js';

const R=a=>a[Math.floor(Math.random()*a.length)];
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));

/** Per-genre optional main threads: factions + escalating events (discoverable). */
export const GENRE_THREADS={
  fantasy:{
    id:'crown_shadow',
    titel:'Schatten um die Krone',
    factions:[
      {id:'kronrat',name:'Kronrat',goal:'Stabilität um jeden Preis',stance:'cautious'},
      {id:'nordwall',name:'Nordwall-Orden',goal:'Die Grenze halten',stance:'martial'},
      {id:'silberzunft',name:'Silberzunft',goal:'Handelswege sichern',stance:'merchant'},
      {id:'dämmerbund',name:'Dämmerbund',goal:'Alte Magie freisetzen',stance:'secret'},
    ],
    events:[
      {id:'e1',at:0,rumor:'Am Nordwall fehlen Wachen — und niemand sagt warum.',hook:'nordwall'},
      {id:'e2',at:1,rumor:'Die Silberzunft zahlt für Geleitschutz. Gerüchte über verschwundene Karawanen.',hook:'zunft'},
      {id:'e3',at:2,rumor:'Im Kronrat flüstert man von einem Siegelbruch unter der Stadt.',hook:'siegel'},
      {id:'e4',at:3,rumor:'Der Dämmerbund zeigt sich offen — Kerzen in den Gassen, keine Namen.',hook:'bund'},
      {id:'e5',at:4,rumor:'Etwas unter dem Ostwall bewegt sich. Wer will, kann hinab.',hook:'dungeon'},
    ],
    dungeon:{name:'Katakomben unter dem Ostwall',boss:'boss_ogre',rooms:5},
  },
  zombie:{
    id:'signal_fire',
    titel:'Das letzte Signal',
    factions:[
      {id:'enklave',name:'Enklave Süd',goal:'Quarantäne halten',stance:'fortress'},
      {id:'räuber',name:'Asphaltwölfe',goal:'Vorräte und Waffen',stance:'raid'},
      {id:'sanitäter',name:'Rote Binden',goal:'Infizierte retten — oder erlösen',stance:'mercy'},
      {id:'sender',name:'Frequenz 7',goal:'Das alte Funkfeuer wieder starten',stance:'hope'},
    ],
    events:[
      {id:'e1',at:0,rumor:'Frequenz 7 sendet wieder — drei Takte, Pause, drei Takte.',hook:'funk'},
      {id:'e2',at:1,rumor:'Die Asphaltwölfe blockieren die Nordbrücke. Verhandeln oder umgehen.',hook:'brücke'},
      {id:'e3',at:2,rumor:'Rote Binden brauchen Serum. Die Enklave hortet es.',hook:'serum'},
      {id:'e4',at:3,rumor:'Ein Tyrant zieht Richtung Enklave. Zeitfenster schrumpft.',hook:'tyrant'},
      {id:'e5',at:4,rumor:'Unter dem alten Krankenhaus: Bunkerzugang. Licht flackert.',hook:'dungeon'},
    ],
    dungeon:{name:'Krankenhaus-Bunker',boss:'boss_tyrant',rooms:5},
  },
  cyberpunk:{
    id:'ghost_lease',
    titel:'Ghost-Lease',
    factions:[
      {id:'helion',name:'Helion Corp',goal:'Schuld tilgen — deine',stance:'corp'},
      {id:'netzkatzen',name:'Netzkatzen',goal:'Daten befreien',stance:'hack'},
      {id:'chromsyndikat',name:'Chrom-Syndikat',goal:'Implant-Markt kontrollieren',stance:'street'},
      {id:'ghosts',name:'Ghost-Lease Kollektiv',goal:'Identitäten löschen und neu schreiben',stance:'ghost'},
    ],
    events:[
      {id:'e1',at:0,rumor:'Dein Name taucht in einem Helion-Schuldledger auf — auch wenn du ihn nie unterschrieben hast.',hook:'schuld'},
      {id:'e2',at:1,rumor:'Netzkatzen bieten einen Key gegen einen Gefallen in Sektor 9.',hook:'key'},
      {id:'e3',at:2,rumor:'Chrom-Syndikat jagt jemanden mit deiner Gesichtssignatur.',hook:'gesicht'},
      {id:'e4',at:3,rumor:'Ghost-Lease öffnet ein Fenster: 90 Minuten ohne Kameras.',hook:'fenster'},
      {id:'e5',at:4,rumor:'Unter dem Neonmarkt: Servergruft. Wärmesignatur = Boss.',hook:'dungeon'},
    ],
    dungeon:{name:'Servergruft Sektor 9',boss:'boss_chrome',rooms:5},
  },
  dark:{
    id:'candle_debt',
    titel:'Kerzen-Schuld',
    factions:[
      {id:'kirche',name:'Ashen-Kirche',goal:'Namen tilgen',stance:'faith'},
      {id:'hof',name:'Nacht-Hof',goal:'Pakte sammeln',stance:'court'},
    ],
    events:[
      {id:'e1',at:0,rumor:'Eine Kerze brennt mit deinem Namen — wer hat gezündet?',hook:'kerze'},
      {id:'e2',at:2,rumor:'Unter der Kapelle: Gänge, die nicht auf Karten stehen.',hook:'dungeon'},
    ],
    dungeon:{name:'Kapellengruft',boss:'boss_lich',rooms:4},
  },
  default:{
    id:'open_road',
    titel:'Offene Straße',
    factions:[
      {id:'wanderer',name:'Wanderzirkel',goal:'Geschichten tauschen',stance:'neutral'},
      {id:'wächter',name:'Pfadwächter',goal:'Sicherheit auf den Wegen',stance:'guard'},
    ],
    events:[
      {id:'e1',at:0,rumor:'Irgendwo wartet ein Pfad, den niemand benennt.',hook:'pfad'},
      {id:'e2',at:2,rumor:'Eine Ruine am Rand der Karte — optional, gefährlich, lohnend.',hook:'dungeon'},
    ],
    dungeon:{name:'Vergessene Ruine',boss:'dragon_whelp',rooms:4},
  },
};

export function genreKey(S){
  const g=String(S?.genre||S?.role||S?.world?.systems?.kind||'').toLowerCase();
  if(/zombie|apokal|seuche/.test(g)) return 'zombie';
  if(/cyber|neon|punk|netz/.test(g)) return 'cyberpunk';
  if(/dark|daemon|dämon|horror|grey/.test(g)) return 'dark';
  if(/fantasy|held|magie|elf|villain/.test(g)) return 'fantasy';
  return 'default';
}

export function blankContent39(){
  return {
    threadId:null,
    stage:0, // event index unlocked by discovery/time — never forced
    knownFactions:[],
    rumours:[],
    arcs:[], // side arcs
    dungeon:null, // active run
    clearedDungeons:[],
    flags:{},
    lastEventTurn:0,
  };
}

export function ensureContent39(S){
  S.content39=S.content39||blankContent39();
  const c=S.content39;
  if(!Array.isArray(c.knownFactions)) c.knownFactions=[];
  if(!Array.isArray(c.rumours)) c.rumours=[];
  if(!Array.isArray(c.arcs)) c.arcs=[];
  if(!Array.isArray(c.clearedDungeons)) c.clearedDungeons=[];
  if(!c.flags) c.flags={};
  if(c.stage==null) c.stage=0;
  return c;
}

export function seedThreads(S){
  const c=ensureContent39(S);
  const key=genreKey(S);
  const pack=GENRE_THREADS[key]||GENRE_THREADS.default;
  if(!c.threadId){
    c.threadId=pack.id;
    c.titel=pack.titel;
    // seed first rumor only — optional
    const e0=pack.events[0];
    if(e0 && !c.rumours.includes(e0.rumor)){
      c.rumours.push(e0.rumor);
      c.flags['ev_'+e0.id]='heard';
    }
  }
  // register factions softly in codex when first heard
  return c;
}

/** Build multi-step side arcs from NPC wound/desire/secret. */
export function seedSideArcsFromNpcs(S, limit=4){
  const c=ensureContent39(S);
  const npcs=Object.entries(S.world?.npcs||{});
  let added=0;
  for(const [name,n] of npcs){
    if(added>=limit) break;
    if(!n||n.alive===false) continue;
    if(c.arcs.some(a=>a.npc===name)) continue;
    const wound=n.wound||n.furcht||'';
    const desire=n.desire||n.need||n.ziel||'';
    const secret=n.geheimnis||(Array.isArray(n.secrets)?n.secrets[0]:'')||'';
    if(!wound && !desire && !secret) continue;
    const id='arc_'+name.replace(/\W+/g,'_').slice(0,24)+'_'+rnd(10,99);
    const steps=[];
    if(desire) steps.push({id:'listen',label:`Höre ${name} zu (Verlangen)`,done:false});
    if(wound) steps.push({id:'wound',label:`Sprich die Wunde an`,done:false});
    steps.push({id:'help',label:`Hilf oder lehne ab — deine Wahl`,done:false});
    if(secret) steps.push({id:'secret',label:`Geheimnis: behalten, verraten oder nutzen`,done:false});
    steps.push({id:'end',label:`Abschluss`,done:false});
    c.arcs.push({
      id, npc:name, status:'offen', step:0, steps,
      wound:String(wound).slice(0,80),
      desire:String(desire).slice(0,80),
      secret:String(secret).slice(0,80),
      ending:null, // mercy|pragmatic|betray|abandon
      titel: desire?`Für ${name}: ${String(desire).slice(0,40)}`:`Pfad mit ${name}`,
    });
    // also mirror into quests.side as optional
    S.quests=S.quests||{main:null,side:[]};
    S.quests.side=S.quests.side||[];
    if(!S.quests.side.some(q=>q.id===id)){
      S.quests.side.push({id,titel:`Nebenweg: ${name}`,ziel:desire||wound||'Zuhören',npc:name,status:'offen',progress:0,marker:{npc:name},arc:true});
    }
    added++;
  }
  return added;
}

export function discoverRumour(S, text){
  const c=ensureContent39(S);
  if(!text) return;
  if(!c.rumours.includes(text)) c.rumours.push(text);
  while(c.rumours.length>12) c.rumours.shift();
}

/** Soft escalation: only when player explores/talks enough — never teleports them. */
export function tickWorldEvents(S, reason='tick'){
  const c=ensureContent39(S);
  seedThreads(S);
  const pack=GENRE_THREADS[genreKey(S)]||GENRE_THREADS.default;
  const turn=S.turn|0;
  // unlock next stage at most every ~8 turns, and only if player has been active
  if(turn - (c.lastEventTurn|0) < 6) return null;
  if(c.stage >= (pack.events?.length||0)-1) return null;
  // chance based — not guaranteed
  if(Math.random()>0.45 && reason!=='explore' && reason!=='ask') return null;
  const next=c.stage+1;
  const ev=pack.events[next];
  if(!ev) return null;
  c.stage=next;
  c.lastEventTurn=turn;
  c.flags['ev_'+ev.id]='heard';
  discoverRumour(S, ev.rumor);
  // soft faction glimpse
  const fac=pack.factions[Math.min(next, pack.factions.length-1)];
  if(fac && !c.knownFactions.includes(fac.id)){
    c.knownFactions.push(fac.id);
    try{ Codex.recordFaction(S, fac.name, {desc:fac.goal, behavior:fac.stance, level:'glimpsed'}); }catch(_){}
  }
  if(ev.hook==='dungeon'){
    c.flags.dungeonRumour=1;
  }
  return {rumor:ev.rumor, faction:fac, hook:ev.hook};
}

export function threadStatusLine(S){
  const c=ensureContent39(S);
  const pack=GENRE_THREADS[genreKey(S)]||GENRE_THREADS.default;
  const bits=[`Faden „${c.titel||pack.titel}“ (Stufe ${c.stage|0}/${Math.max(0,(pack.events?.length||1)-1)}) — optional.`];
  if(c.rumours.length) bits.push('Gerücht: '+c.rumours[c.rumours.length-1]);
  if(c.flags.dungeonRumour) bits.push('Ein gefährlicher Ort wurde erwähnt — du musst nicht hin.');
  return bits.join(' ');
}

/** Advance a side arc based on player wording — branching endings. */
export function tryAdvanceArc(S, a, who){
  const c=ensureContent39(S);
  const t=String(a||'').toLowerCase().trim();
  // Never steal greetings / pure social openers — gate expects greet-ack
  if(/^(hallo|hi|hey|guten tag|guten morgen|guten abend|servus|moin|grüß|gruss|tschüss|bye)\b/.test(t) && !/wunde|verlangen|geheim|hilf|ziel|erzähl/.test(t)) return null;
  const arc=c.arcs.find(x=>x.status!=='erledigt'&&x.status!=='gescheitert'&&(!who||x.npc===who||String(a).toLowerCase().includes(String(x.npc).toLowerCase().split(/\s+/)[0])));
  if(!arc) return null;
  const npc=S.world?.npcs?.[arc.npc];
  if(!npc) return null;
  const step=arc.steps[arc.step];
  if(!step||step.done) return null;
  let advanced=false;
  let text='';
  let ending=null;
  const label=arc.npc;

  if(step.id==='listen' && (/erzähl|warum|ziel|wunsch|verlangen|brauch|was willst|hilf/.test(t)||/ask|talk/.test(t))){
    step.done=true; arc.step++; advanced=true; arc.status='aktiv';
    text=`${label} öffnet sich einen Spalt weit: „${arc.desire||'Ich will etwas, das ich nicht laut sagen kann.'}.“ Der Nebenweg „${arc.titel}“ ist aktiv — ohne Zwang.`;
  } else if(step.id==='wound' && (/wunde|furcht|angst|schmerz|verlust|was ist passiert|vergangen/.test(t))){
    step.done=true; arc.step++; advanced=true;
    text=`${label} stockt. „${arc.wound||'Es gibt eine Narbe, die nicht heilt.'}.“ Du kannst helfen, schweigen oder später zurückkommen.`;
  } else if(step.id==='help'){
    if(/helf|rett|bring|besorg|ja\b|mach ich|ich kümmere/.test(t)){
      step.done=true; arc.step++; advanced=true; ending='mercy';
      text=`Du sagst zu. ${label} atmet aus — Erleichterung, keine Kette. Nächster Schritt wartet, wenn du willst.`;
    } else if(/nein|nicht mein|allein|später|kein interesse/.test(t)){
      step.done=true; arc.step++; advanced=true; ending='abandon';
      text=`Du hältst Abstand. ${label} nickt knapp. „Dann eben so.“ Der Bogen bleibt offen, aber kühler.`;
    } else if(/gold|deal|im gegenzug|wenn du mir/.test(t)){
      step.done=true; arc.step++; advanced=true; ending='pragmatic';
      text=`Ein Handel. ${label}: „Pragmatisch. Gut.“ Vertrauen + Vorsicht.`;
    } else return null;
  } else if(step.id==='secret'){
    if(/verrat|erzähl allen|melde|verpfeif/.test(t)){
      step.done=true; arc.step++; advanced=true; ending='betray';
      text=`Du nutzt das Geheimnis (${String(arc.secret).slice(0,50)}…) gegen ${label}. Macht hat einen Preis — Ruf und Bindung leiden.`;
    } else if(/behalten|schweigen|geheim|niemandem/.test(t)){
      step.done=true; arc.step++; advanced=true; ending=ending||'mercy';
      text=`Du behältst das Geheimnis. ${label} merkt es — ohne Worte.`;
    } else if(/nutz|druck|erpress/.test(t)){
      step.done=true; arc.step++; advanced=true; ending='pragmatic';
      text=`Du behältst die Information als Hebel. ${label} wird vorsichtiger.`;
    } else return null;
  } else if(step.id==='end'){
    step.done=true; arc.status='erledigt'; advanced=true;
    arc.ending=arc.ending||ending||'mercy';
    text=finishArc(S, arc);
  } else {
    // soft listen bump only on clear interest — never on greetings/smalltalk
    if(step.id==='listen' && /erzähl|ziel|wunsch|verlangen|brauch|was willst|wer bist|warum hier|was treibt/.test(t)){
      step.done=true; arc.step++; advanced=true; arc.status='aktiv';
      text=`Zwischen den Zeilen: ${label} will „${arc.desire||'…'}“. Du könntest nach der Wunde fragen — oder nicht.`;
    } else return null;
  }
  if(ending) arc.ending=ending;
  // sync quest card
  const sq=(S.quests?.side||[]).find(q=>q.id===arc.id);
  if(sq){
    sq.status=arc.status;
    sq.progress=arc.step;
    if(arc.status==='erledigt') sq.status='erledigt';
  }
  return advanced?{text, arc, changes:arcReward(S,arc)}:null;
}

function finishArc(S, arc){
  const e=arc.ending||'mercy';
  const lines={
    mercy:`Abschluss mit ${arc.npc}: Gnade. Die Welt merkt sich Wärme. (${arc.titel})`,
    pragmatic:`Abschluss mit ${arc.npc}: Deal gehalten. Kühle Effizienz. (${arc.titel})`,
    betray:`Abschluss mit ${arc.npc}: Verrat. Türen schließen sich — andere öffnen sich. (${arc.titel})`,
    abandon:`Abschluss mit ${arc.npc}: Distanz. Kein Drama, aber auch kein Band. (${arc.titel})`,
  };
  return lines[e]||lines.mercy;
}

function arcReward(S, arc){
  const e=arc.ending||'mercy';
  const who=arc.npc;
  if(arc.status!=='erledigt' && arc.steps[arc.step]?.id!=='end'){
    return {xp:8, affinity:who?{[who]:e==='betray'?-2:4}:undefined, choices:['Weiter','Umsehen','Fragen']};
  }
  if(e==='mercy') return {xp:40, affinity:who?{[who]:18}:undefined, trust:who?{[who]:12}:undefined, gold:rnd(10,30), choices:['Weiter','Ruhen','Umsehen']};
  if(e==='pragmatic') return {xp:35, affinity:who?{[who]:8}:undefined, gold:rnd(25,60), choices:['Weiter','Handeln','Umsehen']};
  if(e==='betray') return {xp:45, affinity:who?{[who]:-20}:undefined, gold:rnd(40,90), ruf:-5, choices:['Weiter','Fliehen','Umsehen']};
  return {xp:20, affinity:who?{[who]:-2}:undefined, choices:['Weiter','Umsehen']};
}

/* ---- Dungeons: puzzles, traps, loot, multi-phase boss ---- */
export function dungeonDef(S){
  const pack=GENRE_THREADS[genreKey(S)]||GENRE_THREADS.default;
  return pack.dungeon||GENRE_THREADS.default.dungeon;
}

export function enterDungeon(S, forceName){
  const c=ensureContent39(S);
  const def=dungeonDef(S);
  if(c.clearedDungeons.includes(def.name) && !forceName){
    return {ok:false, text:`${def.name} ist bereits erkundet — Ruinen bleiben, Gefahr sinkt.`};
  }
  const rooms=[];
  const n=def.rooms||4;
  for(let i=0;i<n;i++){
    if(i===n-1) rooms.push({type:'boss', done:false});
    else rooms.push({type:R(['puzzle','trap','loot','combat','puzzle']), done:false});
  }
  c.dungeon={
    name:forceName||def.name,
    boss:def.boss,
    room:0,
    rooms,
    loot:[],
    hpTax:0,
  };
  // soft move scene note — don't overwrite graph permanently
  S.flags=S.flags||{};
  S.flags._preDungeonOrt=S.world?.scene?.ort;
  if(S.world?.scene) S.world.scene.ort=c.dungeon.name+' · Raum 1';
  return {ok:true, text:`Du betrittst ${c.dungeon.name}. Fackeln. Staub. Ein Weg vorwärts — und jederzeit ein Rückzug. (Optional.)\n\n${describeRoom(S)}`};
}

function describeRoom(S){
  const d=S.content39?.dungeon; if(!d) return '';
  const room=d.rooms[d.room]; if(!room) return 'Ende der Gänge.';
  const n=d.room+1;
  if(room.type==='puzzle') return `Raum ${n}: Ein Siegel mit drei Symbolen (Sonne, Mond, Stern). Du kannst „Sonne-Mond-Stern“, „Mond-Stern-Sonne“ oder „zurück“ versuchen.`;
  if(room.type==='trap') return `Raum ${n}: Der Boden wirkt hohl. „Vorsichtig gehen“, „springen“ oder „zurück“.`;
  if(room.type==='loot') return `Raum ${n}: Eine Truhe, halb geöffnet. „öffnen“, „prüfen“ oder „zurück“.`;
  if(room.type==='combat') return `Raum ${n}: Bewegung im Dunkeln. „kämpfen“, „schleichen“ oder „zurück“.`;
  if(room.type==='boss') return `Raum ${n}: Die Luft wird schwer. Ein Boss wartet — mehrphasig. „Boss angreifen“ oder „zurück“.`;
  return `Raum ${n}.`;
}

export function dungeonAction(S, a){
  const c=ensureContent39(S);
  const d=c.dungeon; if(!d) return null;
  const t=String(a||'').toLowerCase();
  if(/zurück|flucht|verlass|raus|exit|gehe raus/.test(t)){
    const prev=S.flags?._preDungeonOrt;
    if(prev && S.world?.scene) S.world.scene.ort=prev;
    c.dungeon=null;
    return {text:`Du verlässt ${d.name}. Die Gänge warten — ohne Timer, ohne Pflicht.`, changes:{xp:5, choices:['Umsehen','Weiter','Ruhen']}, _intent:'dungeon_leave'};
  }
  const room=d.rooms[d.room];
  if(!room){
    c.clearedDungeons.push(d.name);
    c.dungeon=null;
    return {text:`${d.name} ist durchquert. Stille. Beute gesichert.`, changes:{xp:80, gold:rnd(40,100), choices:['Umsehen','Handwerk','Weiter']}};
  }
  if(room.done){
    d.room++;
    if(S.world?.scene) S.world.scene.ort=`${d.name} · Raum ${d.room+1}`;
    return {text:`Weiter.\n\n${describeRoom(S)}`, changes:{choices:['Weiter','Umsehen','zurück']}};
  }

  if(room.type==='puzzle'){
    if(/sonne.?mond.?stern|mond.?stern.?sonne|stern.?sonne.?mond|lösung|entsiegel|richtiger/.test(t) || /sonne|mond|stern/.test(t)){
      room.done=true;
      const ok=/sonne.?mond.?stern/.test(t.replace(/\s+/g,'')) || /prüf|vorsicht|langsam|denk/.test(t) || Math.random()<0.55;
      if(ok || /sonne|mond|stern/.test(t)){
        d.room++;
        if(S.world?.scene) S.world.scene.ort=`${d.name} · Raum ${d.room+1}`;
        try{ Equip.ensureEquip(S); S.equip.mats['Runensplitter']=(S.equip.mats['Runensplitter']|0)+1; }catch(_){}
        return {text:`Das Siegel gibt nach — Klicken, dann Luftzug. (+Runensplitter)\n\n${describeRoom(S)}`, changes:{xp:25, choices:['Weiter','prüfen','zurück']}};
      }
      if(S.st) S.st.hp=Math.max(1,(S.st.hp|0)-rnd(4,10));
      return {text:`Falsche Reihenfolge — ein Schlag Licht, Schmerz. Noch ein Versuch oder zurück.`, changes:{hp:-rnd(4,10), choices:['Sonne-Mond-Stern','Mond-Stern-Sonne','zurück']}};
    }
    return {text:describeRoom(S), changes:{choices:['Sonne-Mond-Stern','prüfen','zurück']}};
  }
  if(room.type==='trap'){
    if(/vorsicht|langsam|prüf|entschärf|umgeh/.test(t)){
      room.done=true; d.room++;
      if(S.world?.scene) S.world.scene.ort=`${d.name} · Raum ${d.room+1}`;
      return {text:`Du entdeckst den Druckstein rechtzeitig. Vorbei.\n\n${describeRoom(S)}`, changes:{xp:20, choices:['Weiter','zurück']}};
    }
    if(/spring|renn|stur/.test(t)){
      room.done=true; d.room++;
      if(S.st) S.st.hp=Math.max(1,(S.st.hp|0)-rnd(8,18));
      if(S.world?.scene) S.world.scene.ort=`${d.name} · Raum ${d.room+1}`;
      return {text:`Pfeile. Du kommst durch — blutend, lebendig.\n\n${describeRoom(S)}`, changes:{hp:-rnd(8,18), xp:15, choices:['Weiter','heilen','zurück']}};
    }
    return {text:describeRoom(S), changes:{choices:['vorsichtig gehen','springen','zurück']}};
  }
  if(room.type==='loot'){
    if(/öffn|nimm|plünder|ja/.test(t)){
      room.done=true; d.room++;
      const mats=[['Eisenbarren',2],['Leder',1],['Kräuter',2],['Eiskristall',1],['Sternenfragment',1]];
      const [mat,n]=R(mats);
      try{ Equip.ensureEquip(S); S.equip.mats[mat]=(S.equip.mats[mat]|0)+n; }catch(_){}
      const gold=rnd(15,45); if(S.st) S.st.gold=(S.st.gold|0)+gold;
      if(S.world?.scene) S.world.scene.ort=`${d.name} · Raum ${d.room+1}`;
      return {text:`In der Truhe: ${n}× ${mat}, ${gold} Gold.\n\n${describeRoom(S)}`, changes:{gold, xp:18, choices:['Weiter','Rezept kochen','zurück']}};
    }
    if(/prüf|untersuch/.test(t)){
      return {text:`Keine sichtbare Falle. Die Truhe riecht nach altem Öl — wahrscheinlich sicher.`, changes:{choices:['öffnen','zurück']}};
    }
    return {text:describeRoom(S), changes:{choices:['öffnen','prüfen','zurück']}};
  }
  if(room.type==='combat'){
    if(/schleich|vermeid|umgeh/.test(t)){
      room.done=true; d.room++;
      if(S.world?.scene) S.world.scene.ort=`${d.name} · Raum ${d.room+1}`;
      return {text:`Du gleitest vorbei. Kein Kampf.\n\n${describeRoom(S)}`, changes:{xp:12, choices:['Weiter','zurück']}};
    }
    if(/kämpf|angriff|stell/.test(t)){
      room.done=true;
      const foes=pickEncounter(S,{noBoss:true,count:rnd(1,2)});
      S.flags._offerEncounter={foes, blurb:`Dungeon-Patrouille in ${d.name}.`, forceAttack:true};
      d.room++;
      if(S.world?.scene) S.world.scene.ort=`${d.name} · Raum ${d.room+1}`;
      return {text:`Kampfbereit — ${foes.map(f=>f.name).join(', ')}. Danach geht der Gang weiter.`, changes:{xp:10, choices:['Kämpfen','Fliehen']}};
    }
    return {text:describeRoom(S), changes:{choices:['kämpfen','schleichen','zurück']}};
  }
  if(room.type==='boss'){
    if(/boss|angriff|kämpf|stell|herausforder/.test(t)){
      const bossId=d.boss;
      let foe=enemyById(bossId);
      if(!foe) foe=(pickEncounter(S,{bossOnly:true,count:1})||[])[0];
      if(!foe) return {text:'Kein Boss-Datenblatt — die Präsenz weicht. (Später erneut versuchen.)', changes:{choices:['zurück','Umsehen']}};
      // ensure phases for multi-phase feel
      if(!foe.phases || !foe.phases.length){
        foe={...foe, phases:[
          {at:0.66,buff:{atk:1.15},announce:'Phase 2 — die Haltung ändert sich.'},
          {at:0.33,buff:{atk:1.25,spd:1.1},announce:'Phase 3 — Bruchfenster!'},
        ]};
      }
      room.done=true;
      S.flags._offerEncounter={foes:[foe], blurb:`Dungeon-Boss: ${foe.name}. Mehrphasig.`, forceAttack:true, dungeonBoss:true}; S.flags.dungeonBoss=1;
      c.flags.bossFaced=1;
      return {text:`${foe.name} erhebt sich. Mehrere Phasen. Flucht bleibt erlaubt.\n(Starte den Kampf über „Kämpfen“.)`, changes:{xp:20, choices:['Kämpfen','Fliehen','zurück']}};
    }
    return {text:describeRoom(S), changes:{choices:['Boss angreifen','zurück']}};
  }
  return {text:describeRoom(S), changes:{choices:['Weiter','zurück']}};
}

export function afterDungeonBossWin(S){
  const c=ensureContent39(S);
  const d=c.dungeon;
  if(!d) return;
  c.clearedDungeons.push(d.name);
  try{
    Equip.ensureEquip(S);
    S.equip.mats['Sternenfragment']=(S.equip.mats['Sternenfragment']|0)+1;
    S.equip.mats['Boss-Essenz']=(S.equip.mats['Boss-Essenz']|0)+1;
  }catch(_){}
  midgameUnlocks(S,{reason:'dungeon_boss'});
  const prev=S.flags?._preDungeonOrt;
  if(prev && S.world?.scene) S.world.scene.ort=prev;
  c.dungeon=null;
  discoverRumour(S, `${d.name} ist gefallen — die Fraktionen werden das bemerken.`);
}

/* ---- Mid-game progression ---- */
export const GEAR_TIERS={
  1:{label:'Anfänger', rarities:['common','uncommon']},
  2:{label:'Bewährt', rarities:['uncommon','rare'], minLvl:5},
  3:{label:'Veteran', rarities:['rare','epic'], minLvl:10},
  4:{label:'Legende', rarities:['epic','legendary'], minLvl:15},
};

export function gearTierAvailable(S){
  const lvl=S.st?.lvl|1;
  const c=ensureContent39(S);
  const boss=!!c.flags.bossFaced || (c.clearedDungeons||[]).length>0;
  let tier=1;
  if(lvl>=5) tier=2;
  if(lvl>=10||boss) tier=3;
  if(lvl>=15 && boss) tier=4;
  return tier;
}

export function midgameUnlocks(S, opts={}){
  Jobs.ensureJobs(S);
  const lvl=S.st?.lvl|1;
  const c=ensureContent39(S);
  const unlocked=[];
  const tryUnlock=(id, cond)=>{
    if(cond && !S.jobs.unlocked.includes(id)){
      Jobs.unlockJob(S,id);
      unlocked.push(Jobs.JOBS[id]?.name||id);
    }
  };
  tryUnlock('paladin', lvl>=6 || c.flags.bossFaced);
  tryUnlock('dragoner', lvl>=7);
  tryUnlock('jaeger', lvl>=5);
  tryUnlock('barde', lvl>=5 || (c.arcs||[]).some(a=>a.status==='erledigt'));
  tryUnlock('monch', lvl>=8);
  tryUnlock('beschwoerer', lvl>=10 || (c.clearedDungeons||[]).length>0);
  // gear tier flag
  const tier=gearTierAvailable(S);
  if((c.flags.gearTier|0)<tier){
    c.flags.gearTier=tier;
    unlocked.push('Ausrüstungsstufe '+tier+' ('+(GEAR_TIERS[tier]?.label||'')+')');
  }
  if(unlocked.length && opts.toast!==false){
    return {text:'Freischaltungen: '+unlocked.join(', '), unlocked};
  }
  return unlocked.length?{text:'Freischaltungen: '+unlocked.join(', '), unlocked}:null;
}

export function handleContentIntent(S, a, intent){
  ensureContent39(S);
  const t=String(a||'').toLowerCase();
  // enter dungeon
  if(/betrete (den |die |das )?(dungeon|höhle|kerker|katakom|bunker|ruine|servergruft)|in den (kerker|dungeon|bunker)|erkunde (die )?(ruine|höhle|katakom)/.test(t)
     || (S.content39?.flags?.dungeonRumour && /zum (ostwall|krankenhaus|neonmarkt|kapelle|gefährlichen ort)|dungeon/.test(t))){
    return {...enterDungeon(S), _intent:'dungeon_enter'};
  }
  if(S.content39?.dungeon){
    const r=dungeonAction(S,a);
    if(r) return {...r, _intent:r._intent||'dungeon'};
  }
  // craft / cook natural language
  if(/koch|back|brat|brau|craft|schmied|herstell|rezept|werkstatt/.test(t)){
    return {text:craftCookHelp(S,a), changes:{choices:['Werkstatt öffnen','Kräutersuppe kochen','Umsehen'], xp:2}, _intent:'craft'};
  }
  // rumours / thread
  if(/gerücht|was ist los in der welt|fraktion|welche seiten|hauptgeschichte|weltereignis/.test(t)){
    tickWorldEvents(S,'ask');
    return {text:threadStatusLine(S)+'\n\n(Alles optional. Du kannst ignorieren, mitmachen oder dagegen arbeiten.)', changes:{xp:6, choices:['Umsehen','Jemanden fragen','Weiter']}, _intent:'thread'};
  }
  // arc advancement with present NPC
  const who=(S.world?.scene?.anwesend||[])[0];
  const adv=tryAdvanceArc(S,a,who);
  if(adv) return {...adv, _intent:'arc'};
  return null;
}

export function craftCookHelp(S, a){
  Equip.ensureEquip(S);
  const t=String(a||'').toLowerCase();
  // try cook by name
  const cook=Equip.COOK_RECIPES||[];
  for(const rec of cook){
    if(t.includes((rec.name||'').toLowerCase()) || t.includes(rec.id)){
      const r=Equip.cookItem(S, rec.id);
      return r.text+(r.ok?'\n(Über die Werkstatt im Menü siehst du alle Rezepte.)':'');
    }
  }
  const craft=Equip.CRAFT_RECIPES||[];
  for(const rec of craft){
    const it=Equip.getItem(rec.id);
    if(it && t.includes(it.name.toLowerCase())){
      const r=Equip.craftItem(S, rec.id);
      return r.text;
    }
  }
  midgameUnlocks(S,{toast:false});
  const tier=gearTierAvailable(S);
  return `Werkstatt: Herstellen, Aufwerten, Kochen. Aktuelle Ausrüstungsstufe: ${tier} (${GEAR_TIERS[tier]?.label}).\nKochen z.B. „Kräutersuppe kochen“. Schmieden über Menü → Werkstatt.\nRezepte freischalten sich mit Materialien aus Dungeons und Nebenwegen.`;
}

export function onPlayerActHook(S, a, intent){
  ensureContent39(S);
  seedThreads(S);
  // rare soft world tick on explore/talk
  if(intent?.kind==='look'||intent?.kind==='ask'||intent?.kind==='talk'){
    const ev=tickWorldEvents(S, intent.kind==='look'?'explore':'ask');
    if(ev?.rumor && Math.random()<0.5){
      return {append:'\n\n(Gerücht am Rande: '+ev.rumor+')'};
    }
  }
  if((S.turn|0)%12===0) midgameUnlocks(S,{toast:false});
  return null;
}

export default {
  GENRE_THREADS, genreKey, blankContent39, ensureContent39, seedThreads, seedSideArcsFromNpcs,
  tickWorldEvents, threadStatusLine, tryAdvanceArc, enterDungeon, dungeonAction, dungeonDef,
  afterDungeonBossWin, midgameUnlocks, gearTierAvailable, GEAR_TIERS, handleContentIntent,
  onPlayerActHook, discoverRumour, craftCookHelp,
};
