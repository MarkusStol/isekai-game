/** Isekai v13 – world ledger, calendar, death, utility AI, home/life-sim */
export const SEASONS=['Frühling','Sommer','Herbst','Winter'];
export const MONTH_LEN=30; // 12*30 = 360-day year
export const HOURS_DAY=24;

export function blankCalendar(seed={}){
  return {year:seed.year||1, day:seed.day||1, hour:seed.hour??18, minute:seed.minute||0, season:seasonOf(seed.day||1)};
}
export function seasonOf(day){const d=((day-1)%360+360)%360; return SEASONS[Math.floor(d/90)%4]}
export function calLabel(c){if(!c)return ''; const dow=['Mo','Di','Mi','Do','Fr','Sa','So'][(c.day-1)%7];
  return `${dow} · ${c.season} · Tag ${c.day}, Jahr ${c.year} · ${String(c.hour).padStart(2,'0')}:${String(c.minute|0).padStart(2,'0')}`}
export function phaseFromHour(h){if(h<5)return 'Nacht';if(h<11)return 'Morgen';if(h<14)return 'Mittag';if(h<18)return 'Nachmittag';if(h<22)return 'Abend';return 'Nacht'}

let _eid=1;
export function nextEventId(S){S._eid=(S._eid|0)+1; return 'e'+S._eid}

/** Append-only ledger event */
export function ledgerPush(S, ev){
  if(!S.ledger)S.ledger=[];
  const c=S.cal||S.time||blankCalendar();
  const e={
    id:ev.id||nextEventId(S),
    t:{year:c.year|0, day:c.day|0, hour:c.hour|0, season:c.season||seasonOf(c.day|0)},
    type:ev.type||'event',
    who:ev.who||'',
    what:String(ev.what||'').slice(0,200),
    where:ev.where||S.world?.scene?.ort||'',
    witnesses:(ev.witnesses||[]).slice(0,8),
    importance:Math.max(0,Math.min(100, ev.importance|0)),
    emotion:ev.emotion||'neutral',
    meta:ev.meta||{}
  };
  S.ledger.push(e);
  // Never delete facts — archive overflow (priority: keep high-importance in hot ledger)
  if(S.ledger.length>400){
    S.ledgerArchive=S.ledgerArchive||[];
    const keep=[], move=[];
    for(const x of S.ledger){
      if((x.importance|0)>=70 && keep.filter(k=>(k.importance|0)>=70).length<80) keep.push(x);
      else if(keep.length<280) keep.push(x);
      else move.push(x);
    }
    // Prefer chronological hot tail + important
    const hot=S.ledger.slice(-200);
    const important=S.ledger.filter(x=>(x.importance|0)>=70);
    const ids=new Set();
    const next=[];
    for(const x of [...important, ...hot]){ if(ids.has(x.id))continue; ids.add(x.id); next.push(x) }
    const moved=S.ledger.filter(x=>!ids.has(x.id));
    for(const x of moved){
      S.ledgerArchive.push({id:x.id,t:x.t,type:x.type,who:x.who,what:String(x.what||'').slice(0,120),where:x.where,importance:x.importance|0,emotion:x.emotion,meta:x.meta||{}});
    }
    S.ledger=next.slice(-320);
    if(S.ledgerArchive.length>1000){
      const chunk=S.ledgerArchive.splice(0,300);
      S.ledgerSummaries=S.ledgerSummaries||[];
      S.ledgerSummaries.push({from:chunk[0]?.t,to:chunk[chunk.length-1]?.t,count:chunk.length,types:[...new Set(chunk.map(c=>c.type))].slice(0,16),notable:chunk.filter(c=>(c.importance|0)>=60).slice(0,40)});
    }
  }
  // link memories for involved NPCs
  const involved=new Set([e.who, ...e.witnesses].filter(Boolean));
  if(e.meta?.about)involved.add(e.meta.about);
  for(const name of involved){
    const n=S.world?.npcs?.[name]; if(!n||n.dead)continue;
    linkMemory(n, e, name===e.who?1:0.7);
  }
  return e;
}

export function ledgerHas(S, pred){
  const all=[...(S.ledger||[]),...(S.ledgerArchive||[])];
  if(typeof pred==='function')return all.some(pred);
  if(pred&&typeof pred==='object')return all.some(e=>Object.entries(pred).every(([k,v])=>e[k]===v));
  return false;
}
export function linkMemory(npc, ev, scale=1){
  if(!npc.memories)npc.memories=[];
  const imp=Math.round((ev.importance||10)*scale);
  npc.memories.push({
    eventId:ev.id, text:ev.what, type:ev.type, where:ev.where,
    importance:imp, emotion:ev.emotion||'neutral',
    t:{...ev.t}, strength:imp
  });
  // keep top by importance then recency
  npc.memories.sort((a,b)=>(b.importance|0)-(a.importance|0)||((b.t?.day||0)-(a.t?.day||0)));
  npc.memories=npc.memories.slice(0,16);
  npc.erinnerung=(npc.erinnerung||[]).concat(ev.what).slice(-8);
}

/** Decay weak memories; importance>=70 never decay */
export function decayMemories(S, hours){
  const h=hours||1;
  for(const n of Object.values(S.world?.npcs||{})){
    if(!n.memories)continue;
    n.memories=n.memories.filter(m=>{
      if((m.importance|0)>=70) return true;
      m.strength=Math.max(0,(m.strength|0)-h*(m.importance<30?0.4:0.15));
      return m.strength>1;
    });
  }
}

export function retrieveMemories(S, {npcNames, location, keywords, limit=6}={}){
  const keys=(keywords||[]).map(k=>String(k).toLowerCase()).filter(Boolean);
  const loc=String(location||S.world?.scene?.ort||'').toLowerCase();
  const names=new Set(npcNames||S.world?.scene?.anwesend||[]);
  const scored=[];
  for(const name of names){
    const n=S.world?.npcs?.[name]; if(!n||n.dead)continue;
    for(const m of(n.memories||[])){
      let s=(m.importance|0)+(m.strength|0)/2;
      if(loc&&String(m.where||'').toLowerCase().includes(loc.slice(0,8)))s+=15;
      if(keys.some(k=>String(m.text||'').toLowerCase().includes(k)))s+=20;
      if(m.emotion&&m.emotion!=='neutral')s+=5;
      scored.push({name, ...m, _s:s});
    }
  }
  // also world ledger relevance
  for(const e of(S.ledger||[]).slice(-80)){
    let s=(e.importance|0)*0.8;
    if(loc&&String(e.where||'').toLowerCase().includes(loc.slice(0,8)))s+=12;
    if(keys.some(k=>String(e.what||'').toLowerCase().includes(k)))s+=18;
    if(names.has(e.who)||e.witnesses?.some(w=>names.has(w)))s+=10;
    if(s>25)scored.push({name:e.who||'Welt', text:e.what, eventId:e.id, importance:e.importance, emotion:e.emotion, where:e.where, t:e.t, _s:s, type:e.type});
  }
  scored.sort((a,b)=>b._s-a._s);
  const seen=new Set(); const out=[];
  for(const m of scored){const k=m.eventId||m.text; if(seen.has(k))continue; seen.add(k); out.push(m); if(out.length>=limit)break}
  return out;
}

export function worldStateSummary(S){
  const dead=(S.dead||[]).concat(Object.entries(S.world?.npcs||{}).filter(([,n])=>n.dead||n.alive===false).map(([k])=>k));
  const uniq=[...new Set(dead)];
  const home=S.home?.owned?`Zuhause Stufe ${S.home.stage} in ${S.home.location} (${(S.home.rooms||[]).join(', ')||'Rohbau'})`:'kein Haus';
  const cal=S.cal||blankCalendar();
  const graves=Object.entries(S.world?.graves||{}).map(([loc,list])=>`${loc}:${(list||[]).join(',')}`);
  return {
    calendar:calLabel(cal),
    location:S.world?.scene?.ort,
    present:(S.world?.scene?.anwesend||[]).filter(n=>!isDead(S,n)),
    dead:uniq.slice(0,20),
    graves:graves.slice(0,8),
    heat:S.heat|0,
    wanted:(S.wanted||[]).slice(-3),
    home,
    playerNeeds:{hunger:S.needs?.hunger|0, fatigue:S.needs?.fatigue|0, ageYears:S.needs?.ageYears||18},
    recentLedger:(S.ledger||[]).slice(-5).map(e=>`${e.t.day}.${e.t.hour}h [${e.type}] ${e.who}: ${e.what}`)
  };
}

export function isDead(S, name){
  const n=S.world?.npcs?.[name];
  if(!n)return (S.dead||[]).includes(name);
  return !!(n.dead||n.alive===false);
}

export function killPermanent(S, name, ctx={}){
  const n=S.world?.npcs?.[name]; if(!n)return {ok:false, text:'Unbekannt.'};
  if(n.dead||n.alive===false)return {ok:false, text:`${name} ist bereits tot.`};
  n.dead=true; n.alive=false; n.mood='tot'; n.schedule=[]; n.plan=[]; n.ort='—';
  S.dead=S.dead||[]; if(!S.dead.includes(name))S.dead.push(name);
  // remove from scene & romance
  if(S.world.scene?.anwesend)S.world.scene.anwesend=S.world.scene.anwesend.filter(x=>x!==name);
  if(S.romance)delete S.romance[name];
  if(S.quests?.side)S.quests.side.forEach(q=>{if(q.npc===name&&q.status!=='erledigt'){q.status='gescheitert';q.note='NPC tot'}});
  const where=ctx.where||S.world.scene?.ort||'?';
  if(!S.world.graves)S.world.graves={};
  if(!S.world.graves[where])S.world.graves[where]=[];
  S.world.graves[where].push(name);
  // corpse / grave item marker in location loot
  if(!S.world.locationItems)S.world.locationItems={};
  if(!S.world.locationItems[where])S.world.locationItems[where]=[];
  S.world.locationItems[where].push({name:`Grab/Leichnam: ${name}`, icon:'🪦', type:'grave', desc:`Hier starb ${name}.`, rarity:'rare'});
  const witnesses=(S.world.scene?.anwesend||[]).filter(x=>x!==name&&!isDead(S,x));
  const ev=ledgerPush(S,{type:'death', who:ctx.killer||S.pc?.name||'Unbekannt', what:`${name} starb${ctx.cause?': '+ctx.cause:''}.`, where, witnesses, importance:95, emotion:'trauervoll', meta:{about:name, cause:ctx.cause||'gewalt'}});
  for(const w of witnesses){
    const wn=S.world.npcs[w]; if(!wn)continue;
    wn.mood=['trauervoll','wütend','ängstlich','rachsüchtig'][Math.floor(Math.random()*4)];
    if(Math.random()<.55)wn.goals=(wn.goals||[]).concat(`Rache/Antwort für ${name}`).slice(0,4);
  }
  return {ok:true, event:ev, witnesses};
}

export function canResurrect(S, name){
  if(!isDead(S,name))return {ok:false, reason:'nicht tot'};
  const n=S.world?.npcs?.[name]; if(!n)return {ok:false, reason:'unbekannt'};
  if(n.undead)return {ok:false, reason:'bereits untot'};
  // need necromancer present or player skill
  const here=(S.world?.scene?.anwesend||[]);
  const necroNPC=here.find(x=>{const p=S.world.npcs[x]; return p&&!p.dead&&/nekromant|necromanc|totenbanner|schwarzmag/i.test(String(p.art||'')+String(p.ziel||'')+x)});
  const hasSkill=(S.skills||[]).some(sk=>/nekromantie|totenerweck|necromanc/i.test(typeof sk==='string'?sk:sk.name||''));
  if(!necroNPC&&!hasSkill)return {ok:false, reason:'Kein Nekromant und keine Nekromantie-Fähigkeit hier.'};
  return {ok:true, via:necroNPC||'skill'};
}

export function resurrectNPC(S, name, opts={}){
  const gate=canResurrect(S,name); if(!gate.ok)return {ok:false, text:gate.reason};
  const n=S.world.npcs[name];
  n.dead=false; n.alive=true; n.undead=true; n.mood='untot';
  n.art=(n.art||'')+' [Untot – auferstanden, verändert]';
  n.ort=S.world.scene?.ort||n.home||'';
  n.schedule=n.home?[`Nacht: ${n.home}`,`Abend: ${n.home}`]:[];
  S.dead=(S.dead||[]).filter(x=>x!==name);
  // cost
  const costMP=opts.costMP??40; const costHP=opts.costHP??25;
  if(S.st){S.st.mp=Math.max(0,(S.st.mp|0)-costMP); S.st.hp=Math.max(1,(S.st.hp|0)-costHP)}
  S.heat=Math.min(100,(S.heat|0)+rnd(5,15));
  const where=S.world.scene?.ort||'';
  if(S.world.graves?.[where])S.world.graves[where]=S.world.graves[where].filter(x=>x!==name);
  ledgerPush(S,{type:'resurrection', who:S.pc?.name||'Nekromant', what:`${name} wurde als Untote:r zurückgeholt (via ${gate.via}).`, where, witnesses:(S.world.scene?.anwesend||[]).slice(0,4), importance:90, emotion:'unheimlich', meta:{about:name}});
  return {ok:true, text:`Dunkle Worte. Kälte. ${name} öffnet die Augen – nicht mehr ganz dieselben. Untot. Verändert. Der Preis war echt.`, via:gate.via};
}

function rnd(a,b){return a+Math.floor(Math.random()*(b-a+1))}
function R(a){return a[Math.floor(Math.random()*a.length)]}

/** Advance calendar by hours; apply needs, healing, crops, shop hours, NPC age ticks */
export function advanceCalendar(S, hours, hooks={}){
  if(!S.cal)S.cal=blankCalendar(S.time||{});
  let h=Math.max(0, hours|0); if(!h)return [];
  const notes=[];
  // Batch large jumps: 1h when small, 6h chunks when catching up
  const chunk = h>48 ? 6 : 1;
  while(h>0){
    const step=Math.min(h, chunk); h-=step;
    S.cal.hour+=step;
    while(S.cal.hour>=24){S.cal.hour-=24; S.cal.day++; if(S.cal.day>360){S.cal.day=1; S.cal.year++} S.cal.season=seasonOf(S.cal.day); notes.push('newday')}
    S.time={day:S.cal.day, hour:S.cal.hour, phase:phaseFromHour(S.cal.hour), year:S.cal.year, season:S.cal.season};
    decayMemories(S, step);
    if(!S.needs)S.needs={hunger:20, fatigue:10, ageYears:18};
    S.needs.hunger=Math.min(100,(S.needs.hunger|0)+step*2.2);
    S.needs.fatigue=Math.min(100,(S.needs.fatigue|0)+step*1.5);
    if(S.needs.hunger>85&&S.st)S.st.hp=Math.max(1,(S.st.hp|0)-1);
    if(S.needs.fatigue>90&&S.st)S.st.mp=Math.max(0,(S.st.mp|0)-1);
    if(S.st&&(S.st.hp|0)<(S.st.maxhp|0)&&Math.random()<.35)S.st.hp=Math.min(S.st.maxhp,(S.st.hp|0)+Math.max(1,Math.floor(step/6)));
    if(S.home?.crops){for(const c of S.home.crops){c.days=(c.days|0)+(step/24); if(c.days>=c.growDays)c.ready=true}}
    if(hooks.hourly)hooks.hourly(S, step);
  }
  return notes;
}

export function shopOpen(S, shopTags=[]){
  const h=(S.cal||S.time||{}).hour??12;
  // default market 8-18, tavern 12-24, temple 6-20
  if(shopTags.includes('taverne')||shopTags.includes('tavern'))return h>=12||h<2;
  if(shopTags.includes('tempel')||shopTags.includes('kirche'))return h>=6&&h<20;
  return h>=8&&h<18;
}

export function priceMod(S){
  const season=(S.cal||{}).season||'Sommer';
  const heat=S.heat|0;
  let m=1; if(season==='Winter')m*=1.25; if(season==='Frühling')m*=0.95; if(heat>50)m*=1.15;
  return m;
}

/** Utility-AI tick for one NPC */
export function npcUtilityTick(S, name, n){
  if(!n||n.dead||n.alive===false)return null;
  // needs
  if(!n.needs)n.needs={hunger:rnd(10,40), fatigue:rnd(5,30), social:rnd(20,60), wealth:rnd(0,40)};
  n.needs.hunger=Math.min(100,(n.needs.hunger|0)+rnd(1,3));
  n.needs.fatigue=Math.min(100,(n.needs.fatigue|0)+rnd(0,2));
  n.needs.social=Math.min(100,(n.needs.social|0)+rnd(0,2));
  // score actions
  const actions=[];
  const home=n.home||n.ort; const cur=n.ort||home;
  if(n.needs.hunger>60)actions.push({act:'essen', score:n.needs.hunger, where:cur});
  if(n.needs.fatigue>70)actions.push({act:'schlafen', score:n.needs.fatigue, where:home});
  if(n.needs.social>55)actions.push({act:'sozial', score:n.needs.social, where:cur});
  if(n.goals?.length)actions.push({act:'ziel', score:50+rnd(0,20), where:cur, detail:n.goals[0]});
  if(n.job)actions.push({act:'arbeit', score:40+(shopOpen(S,[n.jobTag||'markt'])?30:0), where:n.jobPlace||home});
  // feud / romance with other NPCs
  const others=Object.entries(S.world.npcs||{}).filter(([k,o])=>k!==name&&!o.dead);
  if(others.length&&Math.random()<.3){
    const [ok, on]=R(others);
    const rel=(n.relations||{})[ok]||'kennt';
    if(/hass|feind|rache|meidet/.test(rel)||(n.mood==='rachsüchtig'))actions.push({act:'fehde', score:55, target:ok});
    else if(/mag|liebt|schätzt|respekt/.test(rel))actions.push({act:'npc_romance', score:35, target:ok});
    else actions.push({act:'handel', score:30, target:ok});
  }
  // seek player if reason
  const player=S.pc?.name||'Held';
  const rumOurs=(S.ticks?.rumours||[]).some(r=>String(r).includes(name));
  const owed=retrieveMemories(S,{npcNames:[name], keywords:['Versprechen','Schuld','Rache',player], limit:2});
  if(owed.length&&Math.random()<.4)actions.push({act:'suche_spieler', score:60+owed[0].importance/2, detail:owed[0].text});
  if((S.heat|0)>40&&/wache|ritter|kapitän|soldat|jäger/i.test(name+String(n.art||'')))actions.push({act:'ermittlung', score:50+(S.heat|0)/2});

  if(!actions.length)return null;
  actions.sort((a,b)=>b.score-a.score);
  const pick=actions[0];
  return applyNpcAction(S, name, n, pick);
}

function applyNpcAction(S, name, n, pick){
  const where=S.world?.scene?.ort;
  let line='', importance=25, emotion='neutral', type='npc_life';
  switch(pick.act){
    case 'essen': n.needs.hunger=Math.max(0,n.needs.hunger-40); line=`${name} isst in ${n.ort||'der Gegend'}.`; break;
    case 'schlafen': n.needs.fatigue=Math.max(0,n.needs.fatigue-50); n.ort=n.home||n.ort; line=`${name} schläft in ${n.ort}.`; break;
    case 'sozial': n.needs.social=Math.max(0,n.needs.social-30); line=`${name} redet mit Leuten, sammelt Gerüchte.`; 
      if(Math.random()<.4){const rum=`Gerücht von ${name}: ${R(['Preise steigen.','Jemand fehlt.','Ein Fremder wurde gesehen.','Die Ernte stockt.'])}`; S.ticks.rumours=(S.ticks.rumours||[]).concat(rum).slice(-12)} break;
    case 'ziel': line=`${name} verfolgt: ${pick.detail}`; importance=40; break;
    case 'arbeit': n.needs.wealth=(n.needs.wealth|0)+rnd(2,8); line=`${name} arbeitet als ${n.job||'Tagelöhner'} in ${pick.where}.`; n.ort=pick.where; break;
    case 'fehde': {
      const t=pick.target; const on=S.world.npcs[t]; if(!on)break;
      n.relations={...n.relations,[t]:'Feind'}; on.relations={...on.relations,[name]:'Feind'};
      line=`${name} und ${t} geraten aneinander (Fehde).`; importance=55; emotion='wütend'; type='feud';
      break;}
    case 'npc_romance': {
      const t=pick.target; n.relations={...n.relations,[t]:'interessiert'};
      line=`${name} nähert sich ${t} – zögerlich, einvernehmlich unter Erwachsenen.`; importance=35; emotion='verliebt'; type='npc_romance';
      break;}
    case 'handel': line=`${name} handelt mit ${pick.target}.`; break;
    case 'suche_spieler': {
      n.ort=where; 
      if(S.world.scene&&!S.world.scene.anwesend.includes(name))S.world.scene.anwesend.push(name);
      line=`${name} sucht dich auf.`; importance=65; emotion='entschlossen'; type='seek_player'; // detail kept in ledger meta, not nested into toast
      S.flags=S.flags||{}; S.flags.npcInit=name;
      break;}
    case 'ermittlung': line=`${name} ermittelt wegen deines Rufs (Heat ${S.heat|0}).`; importance=50; emotion='misstrauisch'; type='investigation'; break;
    default: line=`${name} geht dem Alltag nach.`;
  }
  // schedule move
  if(n.schedule?.length){
    const phase=phaseFromHour((S.cal||S.time||{}).hour??12);
    const hit=n.schedule.find(s=>String(s).toLowerCase().startsWith(phase.toLowerCase())||String(s).toLowerCase().includes(phase.toLowerCase()+':'));
    if(hit){const bit=String(hit).split(':').slice(1).join(':').trim(); if(bit)n.ort=bit}
  }
  const ev=ledgerPush(S,{type, who:name, what:line, where:n.ort||where, witnesses:[], importance, emotion, meta:{detail:ImmClean(pick.detail)}});
  return {line, event:ev, seek:pick.act==='suche_spieler', who:name};
}

function ImmClean(raw){let t=String(raw||'').replace(/^\[[^\]]+\]\s*/,'').replace(/„[^“]*“/g,' ').replace(/"[^"]*"/g,' ').replace(/\s+/g,' ').trim(); return t.slice(0,80)}
export function runWorldAI(S, hours=1){
  const notes=[];
  const npcs=Object.entries(S.world?.npcs||{}).filter(([,n])=>!n.dead&&n.alive!==false);
  const count=Math.min(4, Math.max(1, Math.floor(hours*2)));
  const shuffled=npcs.sort(()=>Math.random()-.5).slice(0,count);
  for(const [name,n] of shuffled){
    const r=npcUtilityTick(S,name,n);
    if(r?.line)notes.push(r);
  }
  // rumor spread over time
  if(Math.random()<.3&&(S.ledger||[]).length){
    const e=S.ledger[S.ledger.length-1-Math.floor(Math.random()*Math.min(10,S.ledger.length))];
    if(e&&e.importance>=40){const rum=`Man munkelt: ${e.what}`; S.ticks.rumours=(S.ticks.rumours||[]).concat(rum).slice(-12)}
  }
  // NPC aging yearly-ish: every 30 days bump
  if(S.cal&&S.cal.day%30===1&&(S.cal.hour|0)===0){
    for(const n of Object.values(S.world?.npcs||{})){if(n.dead)continue; n.age=(n.age|25)+1; if(n.age>70&&Math.random()<.08){/* natural death rare */}}
  }
  return notes;
}

/** Validate / repair AI world JSON against truth */
export function validateWorldUpdate(S, u){
  if(!u||typeof u!=='object')return u;
  const out={...u};
  if(out.scene?.anwesend){
    out.scene={...out.scene, anwesend:out.scene.anwesend.filter(n=>{
      if(isDead(S,n))return false;
      return true;
    })};
  }
  if(out.speaker&&isDead(S,out.speaker)&&!S.world?.npcs?.[out.speaker]?.undead){
    delete out.speaker;
  }
  if(Array.isArray(out.npcUpdates)){
    out.npcUpdates=out.npcUpdates.filter(n=>{
      if(!n?.name)return false;
      if(isDead(S,n.name)&&!n.resurrect)return false; // no living updates for dead unless resurrect flag
      return true;
    }).map(n=>{
      // prevent contradicting death
      if(isDead(S,n.name)){return {...n, art:undefined, ort:undefined, alive:false}}
      return n;
    });
  }
  // forbid resurrecting via casual scene without necromancy
  if(out.scene?.anwesend){
    out.scene.anwesend=out.scene.anwesend.filter(n=>!isDead(S,n)||S.world?.npcs?.[n]?.undead);
  }
  return out;
}

export function validateChanges(S, ch){
  if(!ch)return ch;
  const c={...ch};
  if(c.affinity){for(const n of Object.keys(c.affinity)){if(isDead(S,n)&&!S.world?.npcs?.[n]?.undead)delete c.affinity[n]}}
  if(c.trust){for(const n of Object.keys(c.trust)){if(isDead(S,n)&&!S.world?.npcs?.[n]?.undead)delete c.trust[n]}}
  if(Array.isArray(c.items))c.items=c.items.filter(it=>{const name=typeof it==='string'?it:it?.name; return name&&!/^Grab\/Leichnam/.test(name)||true});
  if(c.world)c.world=validateWorldUpdate(S,c.world);
  return c;
}

/* ---------- Home / life-sim ---------- */
export function blankHome(){
  return {owned:false, location:'', stage:0, rooms:[], storage:[], furniture:[], crops:[], pets:[], housemates:[], materials:{wood:0,stone:0,cloth:0,nails:0}, claimDay:0};
}
export const HOME_STAGES=[
  {stage:0, name:'Kein Grundstück', need:{}},
  {stage:1, name:'Beansprucht', need:{wood:0}, days:0},
  {stage:2, name:'Gerüst/Rohbau', need:{wood:8, stone:2}, days:2},
  {stage:3, name:'Ein Raum', need:{wood:6, cloth:2, nails:4}, days:3},
  {stage:4, name:'Wohnhaus', need:{wood:10, stone:6, nails:6, cloth:4}, days:5},
  {stage:5, name:'Ausgebaut', need:{wood:8, stone:4, cloth:6}, days:4}
];

export function claimLand(S, loc){
  if(!S.home)S.home=blankHome();
  if(S.home.owned)return {ok:false, text:'Du hast bereits ein Grundstück.'};
  S.home.owned=true; S.home.location=loc||S.world?.scene?.ort||'Grundstück';
  S.home.stage=1; S.home.claimDay=(S.cal||S.time||{}).day||1;
  ledgerPush(S,{type:'home', who:S.pc?.name, what:`Grundstück beansprucht in ${S.home.location}.`, where:S.home.location, importance:60, emotion:'hoffnungsvoll'});
  return {ok:true, text:`Du steckst den Anspruch ab: ${S.home.location}. Ein Anfang.`};
}

export function gatherMat(S, kind, amount=1){
  if(!S.home)S.home=blankHome();
  S.home.materials[kind]=(S.home.materials[kind]|0)+(amount|0);
  return S.home.materials;
}

export function canBuildNext(S){
  if(!S.home?.owned)return {ok:false, reason:'Kein Grundstück.'};
  const next=HOME_STAGES.find(s=>s.stage===S.home.stage+1); if(!next)return {ok:false, reason:'Maximale Ausbaustufe.'};
  for(const[k,v]of Object.entries(next.need||{})){if((S.home.materials[k]|0)<v)return {ok:false, reason:`Brauchst ${v} ${k} (hast ${S.home.materials[k]|0}).`, next}}
  return {ok:true, next};
}

export function startBuild(S){
  const g=canBuildNext(S); if(!g.ok)return g;
  const next=g.next;
  for(const[k,v]of Object.entries(next.need||{}))S.home.materials[k]-=v;
  S.home.building={target:next.stage, name:next.name, daysLeft:next.days||1, startedDay:(S.cal||{}).day||1};
  ledgerPush(S,{type:'home', who:S.pc?.name, what:`Baubeginn: ${next.name}.`, where:S.home.location, importance:55, emotion:'entschlossen'});
  return {ok:true, text:`Du beginnst den Bau: ${next.name}. Das wird ${next.days||1} Tag(e) dauern.`, days:next.days};
}

export function progressBuild(S, days=1){
  if(!S.home?.building)return null;
  S.home.building.daysLeft=Math.max(0,(S.home.building.daysLeft|0)-days);
  if(S.home.building.daysLeft>0)return {done:false, left:S.home.building.daysLeft};
  const b=S.home.building; S.home.stage=b.target;
  const room=R(['Schlafraum','Küche','Lager','Werkstatt','Gartenanbau','Gastzimmer']);
  if(S.home.stage>=3&&!S.home.rooms.includes(room))S.home.rooms.push(room);
  if(S.home.stage>=4&&!S.home.rooms.includes('Wohnraum'))S.home.rooms.push('Wohnraum');
  S.home.building=null;
  ledgerPush(S,{type:'home', who:S.pc?.name, what:`Bau fertig: Stufe ${S.home.stage} (${b.name}).`, where:S.home.location, importance:70, emotion:'stolz'});
  return {done:true, stage:S.home.stage, name:b.name};
}

export function workJob(S, job='Tagelöhner'){
  const hours=rnd(3,6); const base=job==='Söldner'?rnd(15,35):job==='Handwerk'?rnd(10,22):rnd(6,14);
  const pay=Math.round(base*priceMod(S));
  S.st.gold=(S.st.gold|0)+pay;
  if(S.needs){S.needs.fatigue=Math.min(100,(S.needs.fatigue|0)+hours*8); S.needs.hunger=Math.min(100,(S.needs.hunger|0)+hours*3)}
  ledgerPush(S,{type:'work', who:S.pc?.name, what:`Arbeit als ${job}: +${pay} Gold.`, where:S.world?.scene?.ort, importance:20, emotion:'müde'});
  return {pay, hours, text:`Du arbeitest ${hours} Stunden als ${job} und verdienst ${pay} Gold.`};
}

export function sleepHome(S){
  const atHome=S.home?.owned&&S.world?.scene?.ort===S.home.location;
  const hours=atHome?8:6;
  if(S.needs){S.needs.fatigue=Math.max(0,(S.needs.fatigue|0)-(atHome?70:40)); S.needs.hunger=Math.min(100,(S.needs.hunger|0)+15)}
  if(S.st){S.st.hp=Math.min(S.st.maxhp,(S.st.hp|0)+(atHome?rnd(15,30):rnd(5,15))); S.st.mp=Math.min(S.st.maxmp,(S.st.mp|0)+(atHome?rnd(10,20):rnd(4,10)))}
  // burgle chance if home empty overnight and heat/enemies
  let burgle='';
  if(S.home?.owned&&!atHome&&Math.random()<0.08+(S.heat|0)/500){
    const steal=Math.min(S.st.gold|0, rnd(5,25)); S.st.gold-=steal;
    burgle=` Während du weg bist, wird dein Haus bestohlen (−${steal} Gold).`;
    ledgerPush(S,{type:'crime', who:'Unbekannt', what:`Einbruch in ${S.home.location}.`, where:S.home.location, importance:50, emotion:'wütend'});
  }
  // housemate / partner memory
  if(atHome&&S.home.housemates?.length){
    const h=R(S.home.housemates);
    ledgerPush(S,{type:'home', who:h, what:`Teilt den Abend mit dir zu Hause.`, where:S.home.location, importance:25, emotion:'vertraut'});
  }
  return {hours, text:`Du schläfst ${hours} Stunden${atHome?' in deinem Haus':' im Freien/Herberge'}.${burgle}`};
}

export function inviteHousemate(S, name){
  if(!S.home?.owned||S.home.stage<3)return {ok:false, text:'Brauchst mindestens einen Raum.'};
  if(isDead(S,name))return {ok:false, text:'Tote ziehen nicht ein.'};
  const n=S.world?.npcs?.[name]; if(!n)return {ok:false, text:'Unbekannt.'};
  const rom=S.romance?.[name]; const ok=(rom?.affection|0)>=40||(rom?.stage|0)>=3;
  if(!ok)return {ok:false, text:`${name} lehnt ab – noch nicht vertraut genug.`};
  if(!S.home.housemates.includes(name))S.home.housemates.push(name);
  n.home=S.home.location; n.ort=S.home.location;
  ledgerPush(S,{type:'home', who:name, what:`Zieht bei dir ein (${S.home.location}).`, where:S.home.location, importance:65, emotion:'vertraut'});
  return {ok:true, text:`${name} zieht bei dir ein. Ein gemeinsames Leben beginnt – einvernehmlich.`};
}

export function memoryHintV13(S){
  const top=retrieveMemories(S,{npcNames:S.world?.scene?.anwesend||[], location:S.world?.scene?.ort, keywords:[], limit:6});
  const ws=worldStateSummary(S);
  const lines=top.map(m=>`- ${m.name}: "${m.text}" [Wichtigkeit ${m.importance}, ${m.emotion||''}]`);
  return `WELT-STATUS: ${JSON.stringify(ws)}\nNPC-GEDÄCHTNIS (verankert, nicht widersprechen! Tote bleiben tot außer Nekromantie):\n${lines.join('\n')||'(keine)'}`;
}

export function migrateToV13(S){
  if(!S)return S;
  if(!S.cal)S.cal=blankCalendar(S.time||{day:1,hour:18});
  if(!S.time)S.time={day:S.cal.day, hour:S.cal.hour, phase:phaseFromHour(S.cal.hour), year:S.cal.year, season:S.cal.season};
  if(!S.ledger)S.ledger=[];
  if(!S.needs)S.needs={hunger:20, fatigue:10, ageYears:18};
  if(!S.home)S.home=blankHome();
  if(!S.dead)S.dead=[];
  if(!S.world)return S;
  if(!S.world.graves)S.world.graves={};
  if(!S.world.locationItems)S.world.locationItems={};
  for(const[k,n]of Object.entries(S.world.npcs||{})){
    if(n.alive===false)n.dead=true;
    if(n.dead){n.alive=false; n.schedule=[]; if(!S.dead.includes(k))S.dead.push(k)}
    if(!n.memories)n.memories=[];
    // upgrade string memories
    n.memories=n.memories.map(m=>typeof m==='string'?{text:m, importance:40, emotion:'neutral', strength:40, eventId:null}:m);
    if(!n.needs)n.needs={hunger:rnd(10,40), fatigue:rnd(5,30), social:rnd(20,50), wealth:rnd(0,30)};
    if(n.age==null)n.age=rnd(22,40);
  }
  // ensure a necromancer exists in fantasy worlds
  if(S.role&&S.role!=='grey'&&S.genre!=='zombie'&&!Object.keys(S.world.npcs).some(k=>/nekromant/i.test(k)||/nekromant/i.test(S.world.npcs[k].art||''))){
    const place=Object.keys(S.world.graph?.nodes||S.world.orte||{})[0]||S.world.scene?.ort||'Katakomben';
    S.world.npcs['Nekromant Vael']={e:'💀', art:'Nekromant, bleich, ruhig, handelt mit Tod – erwachsen', stimme:'Flüstern', ziel:'Gleichgewicht der Toten', furcht:'Vergessen', geheimnis:'War einst Priester', beziehung:'Fremd', erinnerung:[], memories:[], ort:place, home:place, plan:['Untote studieren'], relations:{}, romance:false, adult:true, schedule:[`Nacht: ${place}`,`Abend: ${place}`], mood:'kühl', goals:['Macht über den Tod'], alive:true, dead:false, age:47, job:'Nekromant', needs:{hunger:20,fatigue:20,social:10,wealth:40}};
  }
  if(S.ver<13)S.ver=13;
  return S;
}

export default {ledgerPush, ledgerHas, retrieveMemories, worldStateSummary, killPermanent, resurrectNPC, canResurrect, advanceCalendar, runWorldAI, validateChanges, validateWorldUpdate, claimLand, startBuild, progressBuild, canBuildNext, workJob, sleepHome, inviteHousemate, memoryHintV13, migrateToV13, blankHome, blankCalendar, calLabel, isDead, HOME_STAGES, shopOpen, priceMod, gatherMat};
