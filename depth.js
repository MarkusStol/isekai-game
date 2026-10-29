/** v21 content depth — make existing systems matter; style bible; situations; home stakes */
const R=a=>a[Math.floor(Math.random()*a.length)];

export function styleBible(pack, role){
  const ton=pack?.ton||'';
  const id=pack?.id||role||'held';
  const bibles={
    held:`STILBIBEL ALDHEIM: 2. Person Präsens. Sätze mittelkurz, oft ein Sinneseindruck + eine Reaktion. Anime-Isekai: Statusfenster sparsam (1×/Szene max). Dialoge charakterfest (Elise förmlich, Lyra knapp, Garrick derb). Stakes sichtbar: Belagerung, Ruf, Gold, Hunger. Nie: Meta, Englisch, Erzähler-Ich.`,
    villainess:`STILBIBEL: Salon-Intrige, höfliche Giftpfeile, 2. Person. Gerüchte wie Waffen. Körpersprache > Magie.`,
    daemon:`STILBIBEL: Schwere Bilder, Glut und Asche, kurze Sätze. Macht kostet. 2. Person.`,
    mensch:`STILBIBEL: Alltagsrealismus in Fantasy-Dorf. Arbeit, Wetter, Klatsch. 2. Person, warm aber unsentimental.`,
    grey:`STILBIBEL GREYMOURNE: Literarischer leiser Horror, 2. Person, Nebel und Zahlen die nicht stimmen. Kein Splatter.`
  };
  return (bibles[id]||bibles.held)+(ton?` Ton-Notiz: ${String(ton).slice(0,120)}`:'');
}

/** Explicit player capabilities for the narrator — gates dialogue, prices, access, outcomes */

/** v22: encounter design hints for AI + offline */
export function fightDesignBlock(S,foes){
  const list=Array.isArray(foes)?foes:[foes].filter(Boolean);
  if(!list.length) return '';
  const lines=list.map(f=>{
    const name=f.name||f.id||'?';
    const weak=(f.weak||[]).join('/')||'—';
    const role=f._formation||(f.boss?'boss':'soldat');
    const story=f.blurb||f.storyTag||'';
    return `- ${name} [${role}] schwach: ${weak}${story?' — '+story:''}`;
  });
  return `KAMPF-DESIGN (Nutze Mechanik, nicht nur Schaden):
${lines.join('\n')}
Regeln: Gegner haben Rollen (Front/Flanke/Support/Boss). Spieler-Text kann Zielen, Decken, Verhandeln — nicht nur Angriff. Story-Bosse an Arc binden.`;
}

export function lifeStatusLine(S){
  ensureDeepNeeds(S);
  const n=S.needs;
  const flags=[];
  // hunger/thirst/fatigue/hygiene: high = bad (legacy); warmth/social/mood: low = bad; stress: high = bad
  if((n.hunger|0)>70) flags.push('hungrig');
  if((n.thirst|0)>70) flags.push('durstig');
  if((n.fatigue|0)>70) flags.push('erschöpft');
  if((n.hygiene|0)>70) flags.push('ungewaschen');
  if((n.warmth|0)<30) flags.push('frierend');
  if((n.social|0)<25) flags.push('einsam');
  if((n.stress|0)>70) flags.push('gestresst');
  if((n.mood|0)<30) flags.push('niedergeschlagen');
  if(S.life?.illness) flags.push(S.life.illness);
  if(S.life?.injury) flags.push(S.life.injury);
  return flags.length?('Leben: '+flags.join(', ')):'';
}

export function campUpgradeOptions(S){
  const st=S?.home?.stage|0;
  const have=new Set(S?.camp?.upgrades||[]);
  const all=[
    {id:'herd',name:'Herd',need:1,gold:25,desc:'Kochen + Wärme'},
    {id:'bett',name:'Bett',need:1,gold:20,desc:'Besserer Schlaf'},
    {id:'truhe',name:'Truhe',need:1,gold:15,desc:'Mehr Lager'},
    {id:'wanne',name:'Waschwanne',need:2,gold:30,desc:'Hygiene'},
    {id:'werkbank',name:'Werkbank',need:2,gold:40,desc:'Reparatur/Craft'},
    {id:'garten',name:'Garten',need:2,gold:35,desc:'Nahrung über Zeit'},
    {id:'palisade',name:'Palisade',need:2,gold:55,desc:'Raid-Schutz (+Verteidigung)'},
    {id:'wache',name:'Wachposten',need:2,gold:45,desc:'Warnung vor Raids (+Verteidigung)'},
    {id:'attrappe',name:'Trainingspuppe',need:3,gold:45,desc:'Kampftraining zu Hause'},
  ];
  return all.filter(u=>!have.has(u.id)&&st>=u.need);
}

export function applyCampUpgrade(S,id){
  ensureDeepNeeds(S);
  const opt=campUpgradeOptions(S).find(u=>u.id===id);
  if(!opt) return {ok:false,line:'Upgrade nicht verfügbar.'};
  if((S.st?.gold|0)<opt.gold) return {ok:false,line:`Zu wenig Gold (braucht ${opt.gold}).`};
  S.st.gold-=opt.gold;
  S.camp.upgrades=S.camp.upgrades||[];
  S.camp.upgrades.push(id);
  if(id==='wache') S.camp.watch=true;
  if(id==='garten') S.camp.garden=(S.camp.garden|0)+1;
  S.camp.morale=Math.min(100,(S.camp.morale|0)+8);
  return {ok:true,line:`Heim ausgebaut: ${opt.name}. ${opt.desc}.`};
}

export function restAtHomeDeep(S){
  ensureDeepNeeds(S);
  const b=homeBenefits(S);
  if(!(S.home?.stage|0)) return {ok:false,line:'Kein Heim — nur freies Lager.'};
  S.flags.atHome=true;
  const mult=b.restMult||1;
  if(S.st){
    S.st.hp=Math.min(S.st.maxhp|0, Math.floor((S.st.hp|0)+(S.st.maxhp|0)*0.35*mult));
    S.st.mp=Math.min(S.st.maxmp|0, Math.floor((S.st.mp|0)+(S.st.maxmp|0)*0.4*mult));
  }
  // high hunger/fatigue/hygiene = bad → rest lowers them
  S.needs.fatigue=Math.max(0,S.needs.fatigue-35*mult);
  S.needs.warmth=Math.min(100,S.needs.warmth+25);
  S.needs.stress=Math.max(0,S.needs.stress-20);
  S.needs.mood=Math.min(100,(S.needs.mood|0)+15);
  if(b.cookBonus){S.needs.hunger=Math.max(0,S.needs.hunger-25);S.needs.thirst=Math.max(0,(S.needs.thirst|0)-15);S.life.lastMeal='home'}
  if(b.bathBonus){S.needs.hygiene=Math.max(0,S.needs.hygiene-35);S.life.lastBath='home'}
  if(b.gardenBonus && Math.random()<0.5){S.needs.hunger=Math.max(0,S.needs.hunger-10)}
  S.camp.morale=Math.min(100,(S.camp.morale|0)+3);
  return {ok:true,line:`Du ruhst in deinem ${b.label}.`+(b.cookBonus?' Mahlzeit.':'')+(b.defence?' Die Palisade hält.':'')};
}


export function capabilityBlock(S){
  if(!S?.st) return '';
  const s=S.st, n=S.needs||{};
  const skills=(S.skills||[]).map(x=>typeof x==='string'?x:x.name).filter(Boolean).slice(0,10);
  const home=S.home?.owned?`Zuhause Stufe ${S.home.stage} in ${S.home.location} (Räume: ${(S.home.rooms||[]).join(', ')||'–'}; Mitbewohner: ${(S.home.housemates||[]).join(', ')||'keine'})`:'kein Zuhause';
  const gates=[];
  if((s.cha|0)>=14) gates.push('Cha≥14: Überzeugen/Flirten leichter, Preise −10%');
  else if((s.cha|0)<8) gates.push('Cha niedrig: NPCs wirken abweisender');
  if((s.str|0)>=14) gates.push('Str≥14: Einschüchtern/Gewalt-Optionen glaubwürdig');
  if((s.ruf|0)>=20) gates.push('Ruf hoch: Zugang zu Hof/Gilde erleichtert');
  else if((s.ruf|0)<=-10) gates.push('Ruf schlecht: Wachen misstrauisch, Preise +');
  if((s.gold|0)<5) gates.push('Fast pleite: Betteln/Arbeit drängt');
  if((s.gold|0)>=80) gates.push('Wohlhabend: Bestechung/Käufe möglich');
  if((n.hunger|0)>70) gates.push('Hungrig: Konzentrations-/Cha-Malus in Prosa');
  if((n.fatigue|0)>75) gates.push('Erschöpft: Fehler, kürzere Sätze der NPCs möglich');
  if(S.home?.stage>=3) gates.push('Haus mit Raum: Rekruten/Einzug möglich');
  if(S.home?.stage>=4) gates.push('Wohnhaus: sichere Rast (volle Heilung), Lager, Werkstatt-Rezepte');
  if(S.home?.stage>=5) gates.push('Ausgebaut: Farm/Werkstatt-Einkommen, bessere Verteidigung');
  if(skills.some(x=/schleich|dieb|schatten/i.test(x))) gates.push('Schleich-Skill: Diebstahl/Ambush-Dialoge öffnen');
  if(skills.some(x=/heil|erste|kraut/i.test(x))) gates.push('Heilkunde: Kranke NPCs helfen, Quest-Varianten');
  if(skills.some(x=/nekro|toten/i.test(x))) gates.push('Nekromantie: Auferstehung möglich (Kosten!)');
  const heat=S.heat|0;
  if(heat>30) gates.push(`Fahndungsdruck ${heat}: Zeugen, Kopfgeld-Gerüchte`);
  return `SPIELER-KÖNNEN & FOLGEN (verbindlich in Text/choices spiegeln):\nSTATUS Lv${s.lvl} HP${s.hp}/${s.maxhp} MP${s.mp} Str${s.str} Cha${s.cha} Ruf${s.ruf} Gold${s.gold|0}\nNeeds: Hunger ${n.hunger|0} Durst ${n.thirst|0} Müdigkeit ${n.fatigue|0} Hygiene ${n.hygiene|0} Wärme ${n.warmth|0} Sozial ${n.social|0} Stress ${n.stress|0} Laune ${n.mood|0}\n${homeStatusLine(S)}\n${lifeStatusLine(S)}\nSkills: ${skills.join(', ')||'–'}\n${home}\nTore: ${gates.join('; ')||'Standard'}\n→ Schalte Dialogoptionen/Preise/Zugang/Questausgänge danach. Erfinde keine Skills die der Spieler nicht hat.`;
}

const SITUATIONS=[
  {id:'moral', w:1, line:s=>`SITUATION: Moralisches Dilemma — zwei NPCs wollen Unvereinbares. Zeitdruck: ${(s.flags?.siegeDays)||'bald'}.`},
  {id:'betray', w:1, line:()=>`SITUATION: Ein Vertrauter hält etwas zurück. Spur in Erinnerungen/Geheimnissen.`},
  {id:'clock', w:1, line:()=>`SITUATION: Zeitdruck — eine Glocke, eine Frist, ein Heer das näher kommt.`},
  {id:'scarce', w:1, line:()=>`SITUATION: Mangel — Essen, Munition oder Vertrauen wird knapp.`},
  {id:'witness', w:1, line:()=>`SITUATION: Jemand hat zugesehen. Gerüchte laufen voraus.`},
  {id:'offer', w:1, line:()=>`SITUATION: Ein Angebot mit Haken — Gold, Schutz oder Wissen gegen eine Schuld.`},
  {id:'home', w:1, line:s=>s.home?.owned?`SITUATION: Dein Zuhause ist involviert (Lager/Rekrut/Überfall-Risiko).`:`SITUATION: Obdachlosigkeit macht dich verwundbar — oder frei.`},
  {id:'rep', w:1, line:s=>(s.st?.ruf|0)<0?`SITUATION: Dein schlechter Ruf öffnet dunkle Türen und schließt helle.`:`SITUATION: Dein Ruf wird geprüft — Worte wiegeren schwer.`}
];

export function situationSeed(S, playerAction){
  const t=String(playerAction||'').toLowerCase();
  let pick;
  if(/töt|mord|raub|stehlen/.test(t)) pick=SITUATIONS.find(x=>x.id==='witness');
  else if(/haus|lager|camp|heim/.test(t)) pick=SITUATIONS.find(x=>x.id==='home');
  else if(/krieg|heer|belager|frist|eile/.test(t)) pick=SITUATIONS.find(x=>x.id==='clock');
  else if(/vertrau|lüg|geheim|verrat/.test(t)) pick=SITUATIONS.find(x=>x.id==='betray');
  else if(/hunger|geld|arm|kauf/.test(t)) pick=SITUATIONS.find(x=>x.id==='scarce');
  else if(Math.random()<0.12 && !/^(hallo|hi|hey|danke|ja|nein|ok)\b/.test(t) && !/küss|umarm|rede|sprech|frag/.test(t)) pick=R(SITUATIONS);
  return pick?pick.line(S):'';
}

/** Layered sheet blurb for prompts from deep NPC fields */
export function npcDepthBlurb(name, n, S){
  if(!n) return '';
  const layers=[];
  const tier=ensureReveal(n);
  layers.push(`RevealTier ${tier}/3 (nur freigegebene Schichten zeigen)`);
  const slice=backstorySlice(n, tier);
  if(slice) layers.push(`Freigegeben: ${String(slice).slice(0,140)}`);
  if(tier>=1 && n.backstory) layers.push(`Biografie: ${String(n.backstory).slice(0,160)}`);
  if(tier>=2 && n.wound) layers.push(`Wunde: ${String(n.wound).slice(0,80)}`);
  if(n.desire||n.need) layers.push(`Begehrt: ${n.desire||'—'} / Braucht: ${n.need||'—'}`);
  if(tier>=3 && n.contradiction) layers.push(`Widerspruch: ${String(n.contradiction).slice(0,100)}`);
  if(n.speechStyle) layers.push(`Rede: ${String(n.speechStyle).slice(0,100)}`);
  if(Array.isArray(n.samples)&&n.samples.length) layers.push(`Beispiele: ${n.samples.slice(0,2).map(x=>'„'+x+'“').join(' ')}`);
  if(n.quirk) layers.push(`Tick: ${n.quirk}`);
  // Lived ledger memories — NOT ask-echo
  try{
    const lived=livedMemoryFor(S, name, 3);
    if(lived.length) layers.push(`Gelebtes Gedächtnis: ${lived.map(x=>x.text).join(' · ')}`);
  }catch(_){}
  const secrets=n.secrets||(n.geheimnis||n.geheim?[n.geheimnis||n.geheim]:[]);
  if(secrets[0] && (S?.romance?.[name]?.trust|0)>=8) layers.push(`Geheimnis (Spieler ahnt): ${String(secrets[0]).slice(0,100)}`);
  else if(secrets[0]) layers.push(`Geheimnis (NICHT verraten außer Trust hoch / Szene erzwingt): Schicht1 vorhanden`);
  if(n.questLine?.hook) layers.push(`Persönliche Quest: ${n.questLine.hook}`);
  if(n.roleReactions && S?.role){
    const rr=n.roleReactions[S.role]||n.roleReactions.held;
    if(rr) layers.push(`Reaktion auf Rolle ${S.role}: ${rr}`);
  }
  return layers.length?`${name}: ${layers.join(' | ')}`:'';
}

export function presentNpcDepth(S){
  const here=S?.world?.scene?.anwesend||[];
  return here.slice(0,4).map(n=>npcDepthBlurb(n, S.world?.npcs?.[n], S)).filter(Boolean).join('\n');
}


/** v35: large genre-appropriate first+surname pools (culture-flavoured) */
export const NAME_POOLS={
  highfantasy:{first:['Elara','Theron','Lyraelle','Kael','Seraphine','Gideon','Isolde','Rowan','Maelis','Aldric','Fenrir','Sylwen','Briar','Cassian','Orla','Torvin','Eowyn','Draven','Mirabel','Halvard','Ysolde','Cedric','Nimue','Bjorn','Aurelia','Faelan','Ragna','Lucan','Thalia','Emrys','Vespera','Oskar','Celeste','Gareth','Iona','Percival','Maeve','Alaric','Rhiannon','Tobias','Freya','Dorian','Astrid','Edmund','Sigrid','Quentin','Liora','Wulfric','Nora','Leif'],
    sur:['von Sternenfels','Silberklingen','Eichenherz','Mondthal','Drachenwacht','Lichtbringer','Steintrotz','Nebelwald','Feuerfeder','Kronenwacht','Runenschmied','Adlerflug','Goldblatt','Schattenmoor','Himmelsstein','Wolkenbruch','Nachtweide','Sonnenspeer','Talwächter','Flusskind','Bergsohn','Windrufer','Sternenseher','Eisenhand','Blütenpfad','Frostbart','Glutader','Saphirhüter','Rabenschwung','Elfenbein']},
  darkfantasy:{first:['Morrigan','Vael','Ashen','Nyxara','Corvin','Lilith','Thorne','Isolde','Malachar','Ravenna','Draven','Selene','Orin','Hexa','Bane','Vespera','Kaelith','Grim','Sable','Umbra','Noctis','Belladonna','Wraith','Ebon','Scarlet','Dusk','Mire','Cain','Ophelia','Voss'],
    sur:['Blutmoor','Aschenkrone','Knochenbruch','Nebelgrab','Schwarzfeder','Dornenwacht','Flüsterwald','Grabesruh','Nachtfluch','Eisenketten','Totentanz','Mondriss','Giftkelch','Schattenkuss','Ruinenkind','Hexenbrand','Leichenpfad','Galgenson','Düsterfels','Krähenruf']},
  zombie:{first:['Maya','Jordan','Chris','Sam','Alex','Riley','Casey','Morgan','Taylor','Jamie','Drew','Quinn','Avery','Reese','Cameron','Harper','Parker','Skyler','Finley','Blake','Dana','Kelly','Robin','Shawn','Tracy','Jessie','Pat','Leslie','Sandy','Kim'],
    sur:['Walker','Brooks','Nguyen','Park','Reyes','Coleman','Hayes','Singh','Okada','Martinez','Foster','Bennett','Cruz','Patel','Kimura','Okafor','Sullivan','Chen','Dubois','Kowalski','Bergström','Rossi','Andersen','Petrov','Moreau','Vargas','Ibrahim','Novak','Costa','Nakamura']},
  cyberpunk:{first:['Neon','Zero','Kai','Suki','Jinx','Vex','Rin','Nova','Ash','Byte','Lux','Echo','Nyx','Rex','Ivy','Orbit','Glitch','Pixel','Storm','Chrome','Jade','Spike','Rogue','Silk','Drift','Flux','Hex','Prism','Volt','Cipher'],
    sur:['Nakamura','Kovacs','Wei','Santos','Okoro','Vega','Chen','Hassan','Schwarz','Morales','Park','Ivanov','Almeida','Kim','Torres','Sato','Berg','Diaz','Nguyen','Rossi','Lee','Petrov','Silva','Yamamoto','Khan','Fischer','Costa','Ali','Müller','Tanaka']},
  desert:{first:['Zahra','Rashid','Amira','Karim','Layla','Omar','Yasmin','Farid','Noor','Samir','Leila','Hassan','Amina','Tariq','Safiya','Idris','Nadia','Malik','Rana','Yusuf'],
    sur:['Al-Sahra','ibn Karawan','Sandwacht','Oasenruh','Dünenläufer','Brunnentöchter','Sonnenbrand','Wüstenrose','Karawanensohn','Mirage','Kamelritt','Wasserhüter','Staubpfad','Skorpionhand','Nachtstern']},
  survival:{first:['Ash','Fern','River','Brook','Hunt','Sage','Clay','Reed','Moss','Glen','Sky','Dawn','Stone','Willow','Fox','Hawk','Birch','Dale','Pike','Wren'],
    sur:['Waldläufer','Moosbart','Flusspfad','Steinkluft','Feuerhüter','Beerenhand','Fährtenleser','Nordwind','Tannensohn','Nebelsteig']},
  default:{first:['Ava','Ren','Kai','Mira','Jon','Sera','Viktor','Lina','Omar','Nyx','Pia','Theo','Eira','Cruz','Yuna','Baz','Vera','Nils','Suri','Jax','Elena','Marcus','Sofia','Leo','Nora','Diego','Ines','Hugo','Clara','Felix'],
    sur:['Hartmann','Keller','Weber','Schulz','Braun','Hoffmann','Richter','Klein','Wolf','Schröder','Neumann','Schwarz','Zimmermann','Krüger','Hartmann','Lange','Werner','Jäger','Lehmann','König']}
};

/** Global first-name uniqueness for the active world (all pickGenreName calls). */
let _usedFirst=new Set();
export function getUsedFirst(){ return _usedFirst; }
export function resetUsedFirst(seed=null){
  _usedFirst=new Set();
  if(seed instanceof Set){ for(const x of seed) _usedFirst.add(String(x).toLowerCase()); }
  else if(Array.isArray(seed)){ for(const x of seed) if(x) _usedFirst.add(String(x).split(/\s+/)[0].toLowerCase()); }
  return _usedFirst;
}
/** Seed tracker from existing NPC keys + optional PC name. */
export function resetUsedFirstFromWorld(S, pcName=''){
  const names=Object.keys(S?.world?.npcs||{});
  if(pcName) names.push(pcName);
  return resetUsedFirst(names);
}
export function pickGenreName(genre, seedStr='', usedFirst=null){
  const g=String(genre||'').toLowerCase();
  let pool=NAME_POOLS.default;
  if(/high|fantasy|held|elf|zwerg|magie/.test(g) && !/dark/.test(g)) pool=NAME_POOLS.highfantasy;
  else if(/dark|daemon|dämon|horror|blood/.test(g)) pool=NAME_POOLS.darkfantasy;
  else if(/zombie|apokal|seuche|undead/.test(g)) pool=NAME_POOLS.zombie;
  else if(/cyber|neon|netz|punk/.test(g)) pool=NAME_POOLS.cyberpunk;
  else if(/desert|wüste|sand/.test(g)) pool=NAME_POOLS.desert;
  else if(/survival|wildnis|überleben/.test(g)) pool=NAME_POOLS.survival;
  // v37: always track globally; optional Set merges into global
  const used=_usedFirst;
  if(usedFirst instanceof Set){
    for(const x of usedFirst) used.add(String(x).toLowerCase());
  }
  const h0=Math.abs(hash(String(seedStr||Math.random())+g));
  let first=pool.first[h0%pool.first.length];
  for(let k=0;k<pool.first.length;k++){
    const cand=pool.first[(h0+k)%pool.first.length];
    if(!used.has(cand.toLowerCase())){ first=cand; break; }
  }
  // pool exhausted — suffix digit rather than collide
  if(used.has(first.toLowerCase())){
    let n=2; while(used.has((first+n).toLowerCase()) && n<50) n++;
    first=first+n;
  }
  used.add(first.toLowerCase());
  let sur=pool.sur[(h0>>5)%pool.sur.length];
  return first+' '+sur;
}

/** Lived events only — skip ask-echo / meta intent tags */
export function livedMemoryFor(S, npcName, limit=3){
  const npc=S?.world?.npcs?.[npcName];
  const out=[];
  const skip=/^(greet|ask|ask_who|talk|act|look|rest|buy|wait|need|move|romance|flee|train|use|take)\s*:/i;
  // Any "Du hast …" is a player-action echo, not lived NPC life
  const playerEcho=/^Du hast\b|gefragt:\s*[„"]|erinnert sich an euer Gespräch|^Begegnung:\s*Gruß/i;
  const isLivedTxt=t=>/Offscreen|Leben|Raid|Überfall|starb|schenkte|kämpfte|reiste|arbeitete|baute|plünder|Brand|Palisade|Ziel:|Wund|aufgewachsen|traf |ging |hörte |Alltag/i.test(t);
  const push=(text,type,meta={})=>{
    const t=String(text||'').replace(/^\[[^\]]+\]\s*/,'').slice(0,100);
    if(!t||skip.test(t)||playerEcho.test(t)) return false;
    if(out.some(x=>x.text===t)) return false;
    out.push({text:t, type:type||'life', day:meta.day, where:meta.where, emotion:meta.emotion});
    return out.length>=limit;
  };
  // 1) NPC memories typed life / matching lived text (prefer these)
  if(npc){
    const mems=[...(npc.memories||[])];
    // Prefer Offscreen/Raid/Ziel seeds before later Begegnung notes
    const scored=mems.map((m,i)=>({m,i,raw:typeof m==='string'?m:(m?.text||'')})).filter(x=>x.raw);
    scored.sort((a,b)=>{
      const score=r=>(/Offscreen|Raid|Überfall|Ziel:|Wund|aufgewachsen/i.test(r.raw)?50:0)+((r.m.type&&/life|raid|home|offscreen|death|work/i.test(r.m.type))?20:0)+(isLivedTxt(r.raw)?10:0)-r.i*0.01;
      return score(b)-score(a);
    });
    for(const {m,raw} of scored.filter(x=>(x.m.type&&/life|raid|home|offscreen|death|work/i.test(x.m.type))||isLivedTxt(x.raw)||/Offscreen|Ziel:/i.test(x.raw))){
      if(push(raw, m.type||'life', {day:m.t?.day, where:m.where, emotion:m.emotion})) return out;
    }
  }
  // 2) Ledger lived events
  const led=(S?.ledger||[]).filter(e=>{
    if(!e||!e.what) return false;
    if(playerEcho.test(e.what)||skip.test(e.what)) return false;
    if(e.type==='memory' && playerEcho.test(e.what)) return false;
    const about=e.meta?.about;
    const involved=e.who===npcName || about===npcName || (e.witnesses||[]).includes(npcName);
    const typed=/raid|death|crime|home|work|quest|gift|kampf|handel|reise|offscreen|leben|life/i.test(e.type||'');
    return (involved && (typed||isLivedTxt(e.what))) || (typed && isLivedTxt(e.what));
  }).slice(-40);
  for(const e of led.reverse()){
    if(push(e.what, e.type, {day:e.t?.day, where:e.where, emotion:e.emotion})) return out;
  }
  // 3) Fallback: any non-echo memory with substance
  if(npc){
    for(const m of [...(npc.memories||[])].reverse()){
      const raw=typeof m==='string'?m:(m?.text||'');
      if(!raw||playerEcho.test(raw)) continue;
      if(raw.length<20) continue;
      if(push(raw, m.type||'mem', {day:m.t?.day, where:m.where})) return out;
    }
  }
  return out;
}

export function livedMemoryLine(S, npcName){
  const lived=livedMemoryFor(S, npcName, 2);
  if(!lived.length) return '';
  const L=lived[0];
  const when=L.day!=null?` (Tag ${L.day})`:'';
  return `${npcName} erinnert sich an gelebtes: ${L.text}${when}`;
}

/** Procedural layered NPC from trait combos */
export function generateProcNpc(seed, ort, genre){
  const traits=['verschlossen','impulsiv','fromm','zynisch','fürsorglich','ehrgeizig','ängstlich','tapfer','geizig','großzügig'];
  const wounds=['verlor ein Kind','verriet einen Freund','desertierte','wurde bestohlen','sah ein Massaker','liebte den Falschen'];
  const desires=['Reichtum','Sicherheit','Ruhm','Rache','Wissen','Zugehörigkeit'];
  const needs=['Vergebung','Ruhe','Anerkennung','Kontrolle','Nähe','Wahrheit'];
  const h=Math.abs(hash(seed+ort+genre));
  const t1=traits[h%traits.length], t2=traits[(h>>3)%traits.length];
  const wound=wounds[(h>>5)%wounds.length];
  const desire=desires[(h>>7)%desires.length], need=needs[(h>>9)%needs.length];
  const full=pickGenreName(genre, seed+ort); const name0=full.split(' ')[0]; const g=(h%2)?'w':'m';
  const name=full;
  return {
    e:'👤', art:`${t1}, ${t2}. ${wound}.`, stimme:t1==='zynisch'?'trocken':'ruhig',
    ziel:desire, furcht:need, geheimnis:`Verbirgt: ${wound}`,
    backstory:`Aufgewachsen nahe ${ort}. ${wound}. Will ${desire}, braucht eigentlich ${need}.`,
    wound, desire, need, contradiction:`Sagt ${desire} zu wollen, handelt aber aus ${need}.`,
    speechStyle:t1==='fromm'?'Segensformeln':t1==='impulsiv'?'kurze Ausbrüche':'abgewogene Sätze',
    samples:[`${desire} ist alles, was zählt.` , `Rede nicht von ${wound.split(' ')[0]}.`, `Wenn du ${need} versprichst, höre ich zu.`],
    quirk:t2==='ängstlich'?'schaut zur Tür':t1==='ehrgeizig'?'korrigiert deine Haltung':'spielt mit einem Glücksbringer',
    secrets:[wound, `Kennt einen Schmuggelweg bei ${ort}`, `Schuldet jemandem in ${ort} einen gefährlichen Gefallen`],
    questLine:{hook:`Braucht Hilfe bei: ${desire}`, stakes:`Ohne Hilfe verliert ${name0} ${need}`, branches:['helfen','ablehnen','ausnutzen','verraten'], payoff:'Erinnerung + Ruf/Items je nach Ausgang'},
    roleReactions:{held:'hofft auf Rettung', villainess:'wittern Intrige', daemon:'fürchtet Macht'},
    ort, home:ort, plan:['überleben'], meinung:{}, romance:false, adult:true, geschlecht:g,
    mood:t1, goals:[desire], relations:{}, alive:true, procedural:true
  };
}
function hash(s){let h=0; for(let i=0;i<s.length;i++) h=((h<<5)-h)+s.charCodeAt(i)|0; return h}

/** Home gameplay consequences — v22 camp relevance */
export function homeBenefits(S){
  const st=S.home?.stage|0;
  const up=new Set(S?.camp?.upgrades||[]);
  const owned=!!S.home?.owned || st>=1;
  return {
    // legacy keys (sim/game callers)
    restHeal: st>=4?1: st>=2?0.7:0.4,
    storage: st>=3 || up.has('truhe'),
    craft: st>=4 || up.has('werkbank'),
    farm: st>=5 || up.has('garten'),
    recruit: st>=3,
    defense: (st>=4?0.5: st>=2?0.25:0) + (up.has('palisade')?0.2:0) + (S?.camp?.watch||up.has('wache')?0.1:0),
    raidChance: owned ? Math.max(0.02, Math.min(0.85, 0.12 - st*0.015 + (S.heat|0)/400 + ((S.camp?.raidThreat|0)/180))) : 0,
    // v22 keys
    restMult:1+st*0.12+(up.has('bett')?0.1:0),
    cookBonus:st>=1||up.has('herd'),
    craftBonus:st>=2||up.has('werkbank'),
    bathBonus:st>=2||up.has('wanne'),
    gardenBonus:up.has('garten')||(S?.camp?.garden|0)>0,
    trainBonus:st>=3||up.has('attrappe'),
    defence:st>=3||up.has('palisade')||!!S?.camp?.watch,
    prestige:st>=4,
    relevant:owned,
    label:['Kein Heim','Lager','Hütte','Haus','Anwesen','Herrensitz'][Math.min(5,st)]||'Heim'
  };
}

export function homeStatusLine(S){
  if(!S.home?.owned && !(S.home?.stage|0)) return 'CAMP: keines — Rast unsicher, kein Lager, keine Produktion.';
  const b=homeBenefits(S);
  const bits=[`Stufe ${S.home?.stage|0} (${b.label})`, b.storage?'Lager':'', b.craft||b.craftBonus?'Werkstatt':'', b.cookBonus?'Kochen':'', b.bathBonus?'Bad':'', b.gardenBonus||b.farm?'Garten/Farm':'', b.recruit?'Rekruten':'', b.trainBonus?'Training':'', `Verteidigung ${(b.defense*100)|0}%`];
  if((S.camp?.raidThreat|0)>40) bits.push('⚠️ Raid-Gefahr');
  if(S.flags?.atHome) bits.push('du bist hier');
  if((S.camp?.upgrades||[]).length) bits.push('Upgrades: '+S.camp.upgrades.slice(0,4).join(','));
  try{ const dl=campDamageLine(S); if(dl) bits.push(dl);}catch(_){}
  return 'CAMP: '+bits.filter(Boolean).join(' · ');
}

/** Expand needs for life complexity (v22) */
export function ensureDeepNeeds(S){
  if(!S.needs) S.needs={hunger:20,fatigue:10,ageYears:18};
  if(S.needs.hygiene==null) S.needs.hygiene=40;
  if(S.needs.mood==null) S.needs.mood=55;
  if(S.needs.warmth==null) S.needs.warmth=60;
  if(S.needs.thirst==null) S.needs.thirst=30;
  if(S.needs.social==null) S.needs.social=50;
  if(S.needs.stress==null) S.needs.stress=35;
  if(S.needs.billsDue==null) S.needs.billsDue=0;
  S.life=S.life||{lastMeal:null,lastBath:null,lastTalk:null,lastWork:null,lastFight:null,reputationLocal:0,debts:[],favors:[],routines:[],illness:null,injury:null,comfort:0};
  S.camp=S.camp||{upgrades:[],morale:40,watch:false,garden:0,stash:[],raidThreat:0,damage:{burnt:0,palisadeBroken:false,tasks:[]}};
  if(!S.camp.damage) S.camp.damage={burnt:0,palisadeBroken:false,tasks:[]};
  return S.needs;
}

export function tickNeedsDeep(S, hours=1){
  const n=ensureDeepNeeds(S);
  const h=Math.max(0.25, +hours||1);
  const atHome=!!(S.flags?.atHome || (S.home?.owned && S.world?.scene?.ort===S.home.location));
  const b=homeBenefits(S);
  const damp=atHome? Math.max(0.55, 1- (S.home?.stage|0)*0.08) : 1;
  // hunger/fatigue rise (legacy polarity: high = bad)
  n.hunger=Math.min(100,(n.hunger|0)+h*2.0*damp*(b.gardenBonus?0.85:1));
  n.fatigue=Math.min(100,(n.fatigue|0)+h*1.4*(S.time?.phase==='nacht'?0.7:1)*(atHome?0.75:1));
  n.hygiene=Math.min(100,(n.hygiene|0)+h*0.8*(atHome&&b.bathBonus?0.5:1));
  n.thirst=Math.min(100,(n.thirst|0)+h*2.2*damp);
  n.social=Math.max(0,(n.social|0)-(atHome?0.3:0.7)*h);
  n.stress=Math.min(100,Math.max(0,(n.stress|0)+(S.flags?.inCombat?2*h:-0.25*h)-(atHome?0.7*h:0)));
  if(!atHome && (S.time?.phase==='nacht'||S.time?.phase==='abend')) n.warmth=Math.max(0,(n.warmth|0)-1.2*h);
  else n.warmth=Math.min(100,(n.warmth|0)+0.4*h*(atHome?1.5:1));
  if(n.hunger>80) n.mood=Math.max(0,(n.mood|0)-h*2);
  if(n.fatigue>85) n.mood=Math.max(0,(n.mood|0)-h);
  if(n.stress>70) n.mood=Math.max(0,(n.mood|0)-h);
  if(n.social<25) n.mood=Math.max(0,(n.mood|0)-0.5*h);
  if(atHome) n.mood=Math.min(100,(n.mood|0)+h*0.6);
  if((S.camp?.morale|0)>60) n.mood=Math.min(100,(n.mood|0)+0.2*h);
  if(S.st){
    if(n.hunger>88 && Math.random()<0.2*h) S.st.hp=Math.max(1,(S.st.hp|0)-1);
    if(n.thirst>90 && Math.random()<0.25*h) S.st.mp=Math.max(0,(S.st.mp|0)-1);
  }
  if(!atHome && (S.home?.stage|0)>=1){
    S.camp.raidThreat=Math.min(100,(S.camp.raidThreat|0)+0.8*h*((S.st?.gold|0)>80?1.3:1));
  } else if(atHome){
    S.camp.raidThreat=Math.max(0,(S.camp.raidThreat|0)-1.5*h);
  }
  if(S.home?.owned && S.home.stage>=3){
    n.billsDue=(n.billsDue|0)+h*0.15;
    if(n.billsDue>=24){
      const tax=Math.min(S.st?.gold|0, 3+S.home.stage*2);
      if(S.st) S.st.gold=Math.max(0,(S.st.gold|0)-tax);
      n.billsDue=0;
      if(tax) return `Abgaben fürs Haus: −${tax} Gold.`;
    }
  }
  return '';
}

/** v34: gradual backstory layers unlocked by repeated talk */
export function ensureReveal(npc){
  if(!npc) return 0;
  if(npc.revealTier==null) npc.revealTier=0;
  return npc.revealTier|0;
}
export function bumpReveal(npc, amount=1){
  if(!npc) return 0;
  npc.revealTier=Math.min(3, (npc.revealTier|0)+amount);
  npc.talkCount=(npc.talkCount|0)+1;
  return npc.revealTier;
}
/** Layered spoilers — never dump full bio on first hello */
export function backstorySlice(npc, tier){
  if(!npc) return '';
  const t=tier==null?ensureReveal(npc):tier;
  const ziel=npc.ziel||npc.desire||'';
  const wound=npc.wound||'';
  const back=String(npc.backstory||'');
  const need=npc.need||npc.furcht||'';
  const contra=npc.contradiction||'';
  if(t<=0) return ziel?`Wirkt, als ginge es um ${String(ziel).slice(0,40)}.`:'';
  if(t===1) return [ziel&&`Will ${String(ziel).slice(0,50)}.`, wound&&`Eine alte Narbe: ${String(wound).slice(0,50)}.`].filter(Boolean).join(' ');
  if(t===2) return [back.split(/[.;]/)[0].slice(0,110), need&&`Braucht eigentlich ${String(need).slice(0,40)}.`].filter(Boolean).join(' ');
  return [back.slice(0,160), contra&&`Widerspruch: ${String(contra).slice(0,80)}.`].filter(Boolean).join(' ');
}

export function maybeHomeRaid(S){
  ensureDeepNeeds(S);
  const b=homeBenefits(S);
  if(!S.home?.owned || Math.random()>b.raidChance) return null;
  const atHome=!!(S.flags?.atHome || S.world?.scene?.ort===S.home.location);
  const kind=/zombie|grey/i.test(S.genre||S.role||'')?'Untote':(/cyber/i.test(S.genre||'')?'Gang-Crew':'Banditen');
  // At home + defence → full hold
  if(atHome && ((S.home.housemates||[]).length || b.defence)){
    if(S.camp) S.camp.raidThreat=Math.max(0,(S.camp.raidThreat|0)-20);
    return {text:`${kind} nähern sich — doch ${(b.defence?'Palisade/Wache':'Mitbewohner')} und deine Anwesenheit halten stand. Camp sicher.`, loss:0, kind:'raid_held', line:`Überfall abgewehrt (${b.label}).`, goldLost:0, held:true, away:false};
  }
  // Away raids ALWAYS can hit — defence only softens
  const def=Math.min(0.85, b.defense||0);
  const baseLoss=8+Math.floor(Math.random()*22);
  const loss=Math.min(S.st?.gold|0, Math.floor(baseLoss*(1-def)*(atHome?0.6:1)));
  if(S.st) S.st.gold=Math.max(0,(S.st.gold|0)-loss);
  // Stash / camp morale consequences when away
  let stashLost=0;
  if(!atHome && S.camp){
    S.camp.morale=Math.max(0,(S.camp.morale|0)-(b.defence?8:18));
    S.camp.raidThreat=0;
    if(!b.defence && Math.random()<0.4){
      stashLost=1+Math.floor(Math.random()*2);
      S.camp.stash=(S.camp.stash||[]).slice(stashLost);
    }
    if(!b.defence && Math.random()<0.3 && (S.home.stage|0)>1) S.home.stage=Math.max(1,(S.home.stage|0)-1);
  } else if(S.camp){
    S.camp.raidThreat=0; S.camp.morale=Math.max(0,(S.camp.morale|0)-10);
  }
  if(!b.defence && atHome && Math.random()<0.2 && (S.home.stage|0)>1) S.home.stage=Math.max(1,(S.home.stage|0)-1);
  const where=atHome?'während du da bist':'während du fort bist';
  const tip=b.defence
    ? (atHome?'':` Die Palisade begrenzte den Schaden.`)
    : ` Wache/Palisade oder Anwesenheit hätten geholfen.`;
  const stashBit=stashLost?` Vorräte geplündert (${stashLost}).`:'';
  const text=`Überfall auf dein Camp (${kind}, ${where})! Verteidigung ${(def*100)|0}%. Verlust: ${loss} Gold.${stashBit}${tip}`;
  // v35: visible camp damage + repair tasks
  S.camp=S.camp||{upgrades:[],morale:40,watch:false,garden:0,stash:[],raidThreat:0,damage:{burnt:0,palisadeBroken:false,tasks:[]}};
  if(!S.camp.damage) S.camp.damage={burnt:0,palisadeBroken:false,tasks:[]};
  S.camp.damage=S.camp.damage||{burnt:0,palisadeBroken:false,tasks:[]};
  const dmg=S.camp.damage;
  dmg.burnt=Math.min(3,(dmg.burnt|0)+1);
  dmg.lastRaidDay=(S.cal?.day||S.time?.day||1);
  dmg.lastKind=kind;
  if(!b.defence || Math.random()<0.45){
    dmg.palisadeBroken=true;
    // Remove palisade upgrade until repaired
    if(Array.isArray(S.camp.upgrades)) S.camp.upgrades=S.camp.upgrades.filter(u=>u!=='palisade');
  }
  const tasks=new Set(dmg.tasks||[]);
  tasks.add('palisade_repair');
  if(dmg.burnt>=1) tasks.add('clear_ash');
  if(stashLost) tasks.add('restock_stash');
  if((S.home.stage|0)>1 && Math.random()<0.35) tasks.add('rebuild_wall');
  dmg.tasks=[...tasks];
  const dmgTip=dmg.palisadeBroken?' Palisade verkohlt — reparieren!':' Brandspuren am Lager.';
  const text2=text+dmgTip;
  try{
    if(typeof window!=='undefined' && window.__game?.Sim?.ledgerPush){
      window.__game.Sim.ledgerPush(S,{type:'raid',who:kind,what:text2,where:S.home.location,importance:65,emotion:'Angst',meta:{away:!atHome,loss,defence:!!b.defence,burnt:dmg.burnt,palisadeBroken:dmg.palisadeBroken,tasks:dmg.tasks.slice()}});
    }
  }catch(_){}
  return {text:text2, loss, kind: atHome?'raid':'raid_away', line:`Dein ${b.label} wurde ${(atHome?'angegriffen':'in deiner Abwesenheit geplündert')}`+(loss?` (−${loss} Gold)`:'')+'.'+dmgTip, goldLost:loss, away:!atHome, held:false, stashLost, damage:Object.assign({},dmg)};
}

/** Repair a camp damage task */
export function campRepairOptions(S){
  const d=S?.camp?.damage||{tasks:[]};
  const map={
    palisade_repair:{id:'palisade_repair',name:'Palisade reparieren',need:1,gold:25,wood:4,desc:'Verkohlte Palisade ersetzen'},
    clear_ash:{id:'clear_ash',name:'Asche räumen',need:0,gold:0,wood:0,desc:'Brandspuren beseitigen'},
    restock_stash:{id:'restock_stash',name:'Vorrat auffüllen',need:0,gold:15,wood:0,desc:'Geplünderte Truhe neu füllen'},
    rebuild_wall:{id:'rebuild_wall',name:'Mauer flicken',need:1,gold:20,wood:3,desc:'Eingestürzte Wand richten'}
  };
  return (d.tasks||[]).map(id=>map[id]).filter(Boolean);
}
export function applyCampRepair(S, id){
  ensureDeepNeeds(S);
  const opt=campRepairOptions(S).find(u=>u.id===id);
  if(!opt) return {ok:false,text:'Nichts zu reparieren.'};
  if((S.st?.gold|0)<(opt.gold|0)) return {ok:false,text:`Zu wenig Gold (${opt.gold}).`};
  const wood=S.home?.materials?.wood|0;
  if((opt.wood|0)>wood) return {ok:false,text:`Zu wenig Holz (${opt.wood}).`};
  if(S.st) S.st.gold-=opt.gold|0;
  if(opt.wood && S.home?.materials) S.home.materials.wood=Math.max(0,wood-opt.wood);
  S.camp.damage=S.camp.damage||{burnt:0,palisadeBroken:false,tasks:[]};
  S.camp.damage.tasks=(S.camp.damage.tasks||[]).filter(t=>t!==id);
  if(id==='palisade_repair'){
    S.camp.damage.palisadeBroken=false;
    S.camp.upgrades=S.camp.upgrades||[];
    if(!S.camp.upgrades.includes('palisade')) S.camp.upgrades.push('palisade');
  }
  if(id==='clear_ash') S.camp.damage.burnt=Math.max(0,(S.camp.damage.burnt|0)-1);
  if(id==='rebuild_wall' && (S.home.stage|0)<5){ /* restore soft stage loss already applied */ }
  if(!(S.camp.damage.tasks||[]).length && !(S.camp.damage.burnt>0) && !S.camp.damage.palisadeBroken){
    S.camp.damage.burnt=0;
  }
  S.camp.morale=Math.min(100,(S.camp.morale|0)+6);
  try{
    if(typeof window!=='undefined' && window.__game?.Sim?.ledgerPush){
      window.__game.Sim.ledgerPush(S,{type:'home',who:S.pc?.name||'Du',what:`Reparatur: ${opt.name}.`,where:S.home?.location,importance:40,emotion:'entschlossen'});
    }
  }catch(_){}
  return {ok:true,text:`Reparatur erledigt: ${opt.name}. Camp sieht wieder bewohnbarer aus.`, id};
}
export function campDamageLine(S){
  const d=S?.camp?.damage; if(!d) return '';
  const bits=[];
  if(d.palisadeBroken) bits.push('Palisade verkohlt');
  if((d.burnt|0)>0) bits.push(`Brandspuren×${d.burnt}`);
  if((d.tasks||[]).length) bits.push(`${d.tasks.length} Reparatur(en)`);
  return bits.length?('🏕️ Schaden: '+bits.join(', ')):'';
}


/** Offline high-quality fragments */
export const OFFLINE_FRAGMENTS={
  held:[
    'Fackelrauch legt sich in die Kehle; irgendwo übt jemand den gleichen Hieb zum dritten Mal.',
    'Ein Glockenläuten aus Solari — zu früh für die Abendmesse.',
    'Auf dem Markt feilscht eine Frau um Mehl, als gäbe es morgen keines mehr.',
    'Lyra würde das hier mit zwei Worten abtun. Elise bräuchte einen ganzen Rat.',
    'Dein Statusfenster flackert kurz, als spürte es den Nordwall.',
    'Jemand flüstert „Held“ und meint es nicht freundlich.',
    'Der Boden unter den Stiefeln ist ausgetreten von Leuten, die älter wurden als der Krieg.'
  ],
  talk:[
    'Die Pause zwischen zwei Sätzen sagt mehr als der Satz.',
    'Ein Blick zur Tür — alte Gewohnheit.',
    'Finger kneten den Stoff eines Ärmels, bis die Naht quietscht.'
  ],
  tension:[
    'Zeit läuft gegen dich, auch wenn niemand die Sanduhr zeigt.',
    'Ein Versprechen und ein Preis liegen auf demselben Tisch.',
    'Du könntest lügen. Die Welt würde es merken — später.'
  ]
};

export function offlineFlavor(S, kind='held'){
  const pack=OFFLINE_FRAGMENTS[kind]||OFFLINE_FRAGMENTS.held;
  const genre=OFFLINE_FRAGMENTS[S?.role]||pack;
  return R(genre);
}

export default {
  styleBible, capabilityBlock, situationSeed, npcDepthBlurb, presentNpcDepth,
  generateProcNpc, homeBenefits, homeStatusLine, ensureDeepNeeds, tickNeedsDeep,
  maybeHomeRaid, offlineFlavor, OFFLINE_FRAGMENTS,
  ensureReveal, bumpReveal, backstorySlice, NAME_POOLS, pickGenreName, getUsedFirst, resetUsedFirst, resetUsedFirstFromWorld, livedMemoryFor, livedMemoryLine,
  campRepairOptions, applyCampRepair, campDamageLine,
  fightDesignBlock, lifeStatusLine, campUpgradeOptions, applyCampUpgrade, restAtHomeDeep
};
