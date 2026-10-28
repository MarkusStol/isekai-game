/** v14 player knowledge – unknown until revealed; no pre-known NPCs/creatures/factions */
export function blankKnow(){
  return {people:{},creatures:{},factions:{},version:1};
}
export function ensureKnow(S){if(!S.know)S.know=blankKnow();return S.know}

/** Build a short German indefinite description from art/look (no name). */
export function describeUnknown(npc, fallback='jemand'){
  if(!npc)return fallback;
  const art=String(npc.art||npc.look||'').trim();
  if(art){
    // Prefer first clause; strip leading name-like tokens
    let d=art.split(/[.;]/)[0].trim().slice(0,72);
    if(!/^(ein|eine|der|die|das|jemand)/i.test(d)){
      const fem=/frau|prinzessin|magierin|hexe|elfe|mädchen|dame|göttin|königin|priesterin/i.test(d+ ' '+(npc.geschlecht||''));
      const masc=/mann|ritter|magier|krieger|prinz|könig|priester|zwerg|or|schaftner|soldat|junge/i.test(d)||npc.geschlecht==='männlich';
      const artWord=fem?'eine':masc?'ein':'jemand,';
      if(artWord==='jemand,')d='jemand: '+d;
      else d=artWord+' '+d.replace(/^(ein|eine)\s+/i,'');
    }
    return d;
  }
  if(npc.e)return 'jemand mit dem Eindruck von '+npc.e;
  return fallback;
}

export function personKey(name){return String(name||'').trim()}

export function ensurePerson(S, trueName, npc){
  ensureKnow(S);
  const k=personKey(trueName);
  if(!S.know.people[k]){
    S.know.people[k]={
      trueName:k,
      knownName:false,
      label:describeUnknown(npc||S.world?.npcs?.[k]),
      met:false,           // seen in scene
      interacted:false,    // talked / fought / traded
      facts:{job:false,goal:false,secret:false,personality:false,home:false},
      firstSeenDay:S.cal?.day||S.time?.day||1
    };
  } else if(!S.know.people[k].label && npc){
    S.know.people[k].label=describeUnknown(npc);
  }
  return S.know.people[k];
}

export function isNameKnown(S, trueName){
  const p=S.know?.people?.[personKey(trueName)];
  return !!(p&&p.knownName);
}

export function displayName(S, trueName, npc){
  const p=ensurePerson(S,trueName,npc||S.world?.npcs?.[trueName]);
  if(p.knownName)return typeof p.knownName==='string'&&p.knownName!==true?p.knownName:trueName;
  return p.label||describeUnknown(npc||S.world?.npcs?.[trueName]);
}

export function markSeen(S, trueName, npc){
  const p=ensurePerson(S,trueName,npc);
  p.met=true;
  return p;
}

/** Reveal true name – Begegnung trigger. Sources: self, other, found */
export function learnName(S, trueName, source='told'){
  const p=ensurePerson(S,trueName,S.world?.npcs?.[trueName]);
  const was=!!p.knownName;
  p.knownName=trueName;
  p.met=true;
  return {first:!was, person:p, source};
}

export function markInteracted(S, trueName){
  const p=ensurePerson(S,trueName);
  p.interacted=true; p.met=true;
  return p;
}

export function learnFact(S, trueName, fact, value){
  const p=ensurePerson(S,trueName);
  if(!p.facts)p.facts={};
  p.facts[fact]=value===undefined?true:value;
  return p;
}

/** What the player may know about this NPC for prompts / UI */
export function knownSummary(S, trueName){
  const npc=S.world?.npcs?.[trueName];
  const p=S.know?.people?.[personKey(trueName)];
  if(!p||!p.met)return null;
  const out={label:displayName(S,trueName,npc), knownName:!!p.knownName, interacted:!!p.interacted};
  if(p.knownName)out.name=trueName;
  if(p.facts?.job&&npc?.job)out.job=npc.job;
  if(p.facts?.goal&&npc?.ziel)out.goal=npc.ziel;
  if(p.facts?.personality&&npc?.stimme)out.voice=npc.stimme;
  if(p.facts?.home&&(npc?.home||npc?.ort))out.home=npc.home||npc.ort;
  if(p.facts?.secret&&npc?.geheimnis)out.secret=npc.geheimnis;
  if(npc?.art&&p.met)out.look=String(npc.art).slice(0,80);
  return out;
}

/** Scene line for narrator: only descriptions / known names */
export function scenePresenceLine(S){
  const here=S.world?.scene?.anwesend||[];
  if(!here.length)return 'Niemand sonst ist hier.';
  return here.map(n=>{
    const npc=S.world?.npcs?.[n];
    markSeen(S,n,npc);
    return displayName(S,n,npc);
  }).join('; ');
}

/** Prompt block: forbid meta knowledge */
export function knowledgePrompt(S){
  ensureKnow(S);
  const here=S.world?.scene?.anwesend||[];
  const lines=['WISSEN DES SPIELERS (streng einhalten – kein Meta-Wissen):',
    '- Der Spieler kennt zu Beginn niemanden. Unbekannte nur als Beschreibung nennen (z.B. „eine Frau mit Narbe am Kinn“), NIEMALS mit wahrem Namen, Job, Stats oder Beziehungsanzeige, bis der Name gelernt wurde.',
    '- Namen nur nennen, wenn knownName=true. Beziehung/Romance nur wenn interacted=true.',
    '- Secrets/Ziele/Jobs nur erwähnen, wenn facts.* freigeschaltet.'];
  const known=[];
  for(const n of here){
    const sum=knownSummary(S,n);
    if(!sum){known.push(`- Anwesend (unbekannt): ${displayName(S,n)}`); continue}
    if(!sum.knownName)known.push(`- Anwesend (unbekannt, nur Beschreibung): „${sum.label}“`);
    else {
      let s=`- Bekannt: ${sum.name}`;
      if(sum.job)s+=`, Job: ${sum.job}`;
      if(sum.goal)s+=`, Ziel: ${sum.goal}`;
      if(sum.secret)s+=`, Geheimnis bekannt`;
      if(!sum.interacted)s+=' (noch keine echte Interaktion → keine Beziehungsanzeige)';
      known.push(s);
    }
  }
  if(known.length)lines.push('Aktuell hier:',...known);
  else lines.push('Aktuell niemand vom Spieler erkannt.');
  lines.push('Wenn ein NPC seinen Namen sagt, oder jemand ihn nennt, setze FLAG: LEARN_NAME=<wahrer Name>.');
  lines.push('Nach erstem echtem Gespräch: FLAG: INTERACT=<wahrer Name>.');
  return lines.join('\n');
}

/** Parse narrator flags for name/fact learning */
export function applyNarratorFlags(S, text){
  const out={learned:[], interacted:[], facts:[]};
  if(!text)return out;
  const reName=/LEARN_NAME\s*=\s*([^\n|;]+)/gi;
  let m; while((m=reName.exec(text))){ const name=m[1].trim(); const r=learnName(S,name,'told'); if(r.first)out.learned.push(name) }
  const reInt=/INTERACT\s*=\s*([^\n|;]+)/gi;
  while((m=reInt.exec(text))){ const name=m[1].trim(); markInteracted(S,name); out.interacted.push(name) }
  const reFact=/LEARN_FACT\s*=\s*([^:]+):([^\n|;]+)/gi;
  while((m=reFact.exec(text))){ const name=m[1].trim(), fact=m[2].trim(); learnFact(S,name,fact,true); out.facts.push([name,fact]) }
  return out;
}

/** Strip true names from player-facing narration when unknown */
export function maskNarrationNames(S, text){
  if(!text||!S.world?.npcs)return text;
  let t=text;
  const names=Object.keys(S.world.npcs).sort((a,b)=>b.length-a.length);
  for(const n of names){
    if(isNameKnown(S,n))continue;
    const label=displayName(S,n);
    // replace whole-name occurrences
    const re=new RegExp(n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g');
    t=t.replace(re, label);
  }
  return t;
}

export function migrateKnow(S){
  ensureKnow(S);
  // Wipe pre-seeded romance that was never interacted
  if(S.romance){
    for(const k of Object.keys(S.romance)){
      const p=S.know.people[k];
      if(!p?.interacted && (S.romance[k].affection|0)===0 && (S.romance[k].stage|0)===0){
        delete S.romance[k];
      }
    }
  }
  // Clear auto-codex people without known names
  if(S.codex?.entries){
    for(const [id,e] of Object.entries(S.codex.entries)){
      if(e.cat==='people' && !isNameKnown(S,e.name)){
        delete S.codex.entries[id];
        S.codex.cats.people=(S.codex.cats.people||[]).filter(x=>x!==id);
      }
    }
  }
  return S.know;
}

export default {blankKnow,ensureKnow,describeUnknown,displayName,learnName,markSeen,markInteracted,learnFact,knownSummary,scenePresenceLine,knowledgePrompt,applyNarratorFlags,maskNarrationNames,migrateKnow,isNameKnown,ensurePerson};
