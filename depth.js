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
  return `SPIELER-KÖNNEN & FOLGEN (verbindlich in Text/choices spiegeln):\nSTATUS Lv${s.lvl} HP${s.hp}/${s.maxhp} MP${s.mp} Str${s.str} Cha${s.cha} Ruf${s.ruf} Gold${s.gold|0}\nNeeds: Hunger ${n.hunger|0} Müdigkeit ${n.fatigue|0} Hygiene ${n.hygiene|0} Laune ${n.mood|0}\nSkills: ${skills.join(', ')||'–'}\n${home}\nTore: ${gates.join('; ')||'Standard'}\n→ Schalte Dialogoptionen/Preise/Zugang/Questausgänge danach. Erfinde keine Skills die der Spieler nicht hat.`;
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
    samples:[`${desire} ist alles, was zählt.` , `Rede nicht von ${wound.split(' ')[0]}.`],
    quirk:t2==='ängstlich'?'schaut zur Tür':'spielt mit einem Glücksbringer',
    secrets:[wound, `Kennt einen Schmuggelweg bei ${ort}`],
    questLine:{hook:`Braucht Hilfe bei: ${desire}`, branches:['helfen','ablehnen','ausnutzen']},
    roleReactions:{held:'hofft auf Rettung', villainess:'wittern Intrige', daemon:'fürchtet Macht'},
    ort, home:ort, plan:['überleben'], meinung:{}, romance:false, adult:true, geschlecht:g,
    mood:t1, goals:[desire], relations:{}, alive:true, procedural:true
  };
}
function hash(s){let h=0; for(let i=0;i<s.length;i++) h=((h<<5)-h)+s.charCodeAt(i)|0; return h}

/** Home gameplay consequences */
export function homeBenefits(S){
  const st=S.home?.stage|0;
  return {
    restHeal: st>=4?1: st>=2?0.7:0.4,
    storage: st>=3,
    craft: st>=4,
    farm: st>=5,
    recruit: st>=3,
    defense: st>=4?0.5: st>=2?0.25:0,
    raidChance: S.home?.owned ? Math.max(0.02, 0.12 - st*0.015 + (S.heat|0)/400) : 0
  };
}

export function homeStatusLine(S){
  if(!S.home?.owned) return 'CAMP: keines — Rast unsicher, kein Lager, keine Produktion.';
  const b=homeBenefits(S);
  const bits=[`Stufe ${S.home.stage}`, b.storage?'Lager':'', b.craft?'Werkstatt':'', b.farm?'Farm/Einkommen':'', b.recruit?'Rekruten möglich':'', `Verteidigung ${(b.defense*100)|0}%`];
  return 'CAMP: '+bits.filter(Boolean).join(' · ');
}

/** Expand needs for life complexity (lightweight UI) */
export function ensureDeepNeeds(S){
  if(!S.needs) S.needs={hunger:20,fatigue:10,ageYears:18};
  if(S.needs.hygiene==null) S.needs.hygiene=40;
  if(S.needs.mood==null) S.needs.mood=55;
  if(S.needs.billsDue==null) S.needs.billsDue=0;
  return S.needs;
}

export function tickNeedsDeep(S, hours=1){
  const n=ensureDeepNeeds(S);
  const h=Math.max(0.25, +hours||1);
  n.hunger=Math.min(100,(n.hunger|0)+h*2.0);
  n.fatigue=Math.min(100,(n.fatigue|0)+h*1.4);
  n.hygiene=Math.min(100,(n.hygiene|0)+h*0.8);
  if(n.hunger>80) n.mood=Math.max(0,(n.mood|0)-h*2);
  if(n.fatigue>85) n.mood=Math.max(0,(n.mood|0)-h);
  if(S.home?.owned && S.world?.scene?.ort===S.home.location) n.mood=Math.min(100,(n.mood|0)+h*0.5);
  // bills weekly-ish
  if(S.home?.owned && S.home.stage>=3){
    n.billsDue=(n.billsDue|0)+h*0.15;
    if(n.billsDue>=24){
      const tax=Math.min(S.st.gold|0, 3+S.home.stage*2);
      if(S.st) S.st.gold=Math.max(0,(S.st.gold|0)-tax);
      n.billsDue=0;
      if(tax) return `Abgaben fürs Haus: −${tax} Gold.`;
    }
  }
  return '';
}

export function maybeHomeRaid(S){
  const b=homeBenefits(S);
  if(!S.home?.owned || Math.random()>b.raidChance) return null;
  if(S.world?.scene?.ort===S.home.location && (S.home.housemates||[]).length) return null; // defended by presence
  const loss=Math.min(S.st.gold|0, 5+Math.floor(Math.random()*20*(1-b.defense)));
  if(S.st) S.st.gold-=loss;
  const kind=/zombie/i.test(S.genre||'')?'Untote':'Banditen';
  return {text:`Überfall auf dein Camp (${kind})! Verteidigung ${(b.defense*100)|0}%. Verlust: ${loss} Gold.`, loss};
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
  maybeHomeRaid, offlineFlavor, OFFLINE_FRAGMENTS
};
