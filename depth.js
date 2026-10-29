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
  if(n.backstory) layers.push(`Biografie: ${String(n.backstory).slice(0,160)}`);
  if(n.wound) layers.push(`Wunde: ${String(n.wound).slice(0,80)}`);
  if(n.desire||n.need) layers.push(`Begehrt: ${n.desire||'—'} / Braucht: ${n.need||'—'}`);
  if(n.contradiction) layers.push(`Widerspruch: ${String(n.contradiction).slice(0,100)}`);
  if(n.speechStyle) layers.push(`Rede: ${String(n.speechStyle).slice(0,100)}`);
  if(Array.isArray(n.samples)&&n.samples.length) layers.push(`Beispiele: ${n.samples.slice(0,2).map(x=>'„'+x+'“').join(' ')}`);
  if(n.quirk) layers.push(`Tick: ${n.quirk}`);
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
  const names=[['Mira','w'],['Jorn','m'],['Sera','w'],['Bram','m'],['Nyx','w'],['Otto','m'],['Lina','w'],['Kai','m']];
  const [name0,g]=names[h%names.length];
  const name=name0+'-'+(h%97);
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
    raidChance: owned ? Math.max(0.02, 0.12 - st*0.015 + (S.heat|0)/400 + ((S.camp?.raidThreat|0)/500)) : 0,
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
  S.camp=S.camp||{upgrades:[],morale:40,watch:false,garden:0,stash:[],raidThreat:0};
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

export function maybeHomeRaid(S){
  ensureDeepNeeds(S);
  const b=homeBenefits(S);
  if(!S.home?.owned || Math.random()>b.raidChance) return null;
  const atHome=S.flags?.atHome || S.world?.scene?.ort===S.home.location;
  if(atHome && ((S.home.housemates||[]).length || b.defence)){
    if(S.camp) S.camp.raidThreat=Math.max(0,(S.camp.raidThreat|0)-20);
    const kind=/zombie|grey/i.test(S.genre||S.role||'')?'Untote':'Banditen';
    return {text:`${kind} nähern sich — doch ${(b.defence?'Palisade/Wache':'Mitbewohner')} und deine Anwesenheit halten stand. Camp sicher.`, loss:0, kind:'raid_held', line:`Überfall abgewehrt (${b.label}).`, goldLost:0, held:true};
  }
  const loss=Math.min(S.st?.gold|0, Math.floor((5+Math.floor(Math.random()*20))*(1-b.defense)));
  if(S.st) S.st.gold=Math.max(0,(S.st.gold|0)-loss);
  if(!b.defence && Math.random()<0.25 && (S.home.stage|0)>1) S.home.stage=Math.max(1,(S.home.stage|0)-1);
  if(S.camp){S.camp.raidThreat=0;S.camp.morale=Math.max(0,(S.camp.morale|0)-15)}
  const kind=/zombie|grey/i.test(S.genre||S.role||'')?'Untote':'Banditen';
  return {text:`Überfall auf dein Camp (${kind})! Verteidigung ${(b.defense*100)|0}%. Verlust: ${loss} Gold. Wache/Palisade oder Anwesenheit hätten geholfen.`, loss, kind:'raid', line:`Dein ${b.label} wurde geplündert`+(loss?` (−${loss} Gold)`:'')+'.', goldLost:loss};
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
  fightDesignBlock, lifeStatusLine, campUpgradeOptions, applyCampUpgrade, restAtHomeDeep
};
