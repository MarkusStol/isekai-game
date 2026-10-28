/** v17 Berufssystem — original job/ability design (no licensed names) */
export const JOBS={
  krieger:{id:'krieger',name:'Krieger',icon:'⚔️',desc:'Frontkämpfer mit hoher ATK und Parade.',
    growth:{str:1.2,vit:1.1,dex:0.9,int:0.6,wil:0.8,cha:0.7},
    base:{atk:4,def:3,mag:0,spd:1,hp:12,mp:2},
    abilities:[
      {id:'kraftschlag',name:'Kraftschlag',lvl:1,mp:0,pow:1.35,elem:'phys',ap:0},
      {id:'schildwall',name:'Schildwall',lvl:3,mp:0,defend:1.8,ap:40},
      {id:'wutschrei',name:'Wutschrei',lvl:5,mp:4,status:'berserker',statusChance:1,self:true,ap:80},
      {id:'erdruettler',name:'Erdrüttler',lvl:8,mp:8,pow:1.6,elem:'erde',aoe:true,ap:140},
      {id:'klingensturm',name:'Klingensturm',lvl:12,mp:12,pow:2.1,elem:'phys',ap:220},
    ]},
  magier:{id:'magier',name:'Magier',icon:'🔮',desc:'Elementarmagie und hohe MAG.',
    growth:{int:1.3,wil:1.1,str:0.5,vit:0.7,dex:0.8,cha:0.9},
    base:{atk:1,def:1,mag:5,spd:2,hp:6,mp:10},
    abilities:[
      {id:'feuerball',name:'Feuerball',lvl:1,mp:6,pow:1.4,elem:'feuer',ap:0},
      {id:'eissplitter',name:'Eissplitter',lvl:2,mp:6,pow:1.4,elem:'eis',ap:30},
      {id:'blitzschlag',name:'Blitzschlag',lvl:3,mp:6,pow:1.4,elem:'blitz',ap:50},
      {id:'arkane_nova',name:'Arkane Nova',lvl:7,mp:16,pow:1.7,elem:'licht',aoe:true,ap:120},
      {id:'elementsturm',name:'Elementsturm',lvl:14,mp:22,pow:2.0,elem:'feuer',aoe:true,ap:260},
    ]},
  heiler:{id:'heiler',name:'Heiler',icon:'✨',desc:'Heilung, Schutz und Reinigung.',
    growth:{wil:1.3,int:1.1,cha:1.0,vit:0.9,str:0.5,dex:0.7},
    base:{atk:1,def:2,mag:4,spd:1,hp:8,mp:12},
    abilities:[
      {id:'heilung',name:'Heilung',lvl:1,mp:5,heal:40,ap:0},
      {id:'protschirm',name:'Protschirm',lvl:3,mp:6,status:'schutz',self:true,aoeParty:true,ap:45},
      {id:'magschild',name:'Magschild',lvl:4,mp:6,status:'magschild',self:true,aoeParty:true,ap:60},
      {id:'regeneration',name:'Regeneration',lvl:6,mp:8,status:'regen',self:true,ap:100},
      {id:'erwecken',name:'Erwecken',lvl:8,mp:14,revive:0.4,ap:160},
      {id:'vollheilung',name:'Vollheilung',lvl:12,mp:22,heal:999,ap:240},
    ]},
  dieb:{id:'dieb',name:'Dieb',icon:'🗡️',desc:'Tempo, Diebstahl und kritische Treffer.',
    growth:{dex:1.4,cha:1.0,str:0.8,vit:0.8,int:0.7,wil:0.7},
    base:{atk:3,def:1,mag:1,spd:5,hp:7,mp:4},
    abilities:[
      {id:'schnellhieb',name:'Schnellhieb',lvl:1,mp:0,pow:1.1,elem:'phys',critBonus:.2,ap:0},
      {id:'stehlen',name:'Stehlen',lvl:2,mp:0,steal:true,ap:35},
      {id:'nebelmantel',name:'Nebelmantel',lvl:5,mp:5,status:'hast',self:true,ap:90},
      {id:'hinterhalt',name:'Hinterhalt',lvl:8,mp:8,pow:2.0,elem:'phys',critBonus:.35,ap:150},
      {id:'schattenklinge',name:'Schattenklinge',lvl:12,mp:10,pow:1.8,elem:'dunkel',ap:230},
    ]},
  paladin:{id:'paladin',name:'Paladin',icon:'🛡️',desc:'Heilige Klinge und Frontschutz.',
    growth:{str:1.1,vit:1.2,wil:1.1,int:0.8,dex:0.7,cha:1.0},
    base:{atk:3,def:4,mag:2,spd:1,hp:14,mp:6},
    abilities:[
      {id:'heiliger_hieb',name:'Heiliger Hieb',lvl:1,mp:4,pow:1.3,elem:'licht',ap:0},
      {id:'decken',name:'Decken',lvl:3,mp:0,cover:true,ap:40},
      {id:'lichtsegen',name:'Lichtsegen',lvl:6,mp:10,heal:35,aoeParty:true,ap:110},
      {id:'urteil',name:'Urteil',lvl:10,mp:14,pow:2.0,elem:'licht',ap:200},
    ]},
  dragoner:{id:'dragoner',name:'Dragoner',icon:'🐉',desc:'Sprungangriffe und Speerkunst.',
    growth:{str:1.2,dex:1.1,vit:1.0,wil:0.8,int:0.6,cha:0.7},
    base:{atk:4,def:2,mag:1,spd:3,hp:11,mp:3},
    abilities:[
      {id:'sprungstoss',name:'Sprungstoß',lvl:1,mp:4,pow:1.55,elem:'phys',jump:true,ap:0},
      {id:'drachenatem',name:'Drachenatem',lvl:6,mp:10,pow:1.5,elem:'feuer',aoe:true,ap:100},
      {id:'himmelsspeer',name:'Himmelsspeer',lvl:11,mp:12,pow:2.2,elem:'wind',ap:210},
    ]},
  beschwoerer:{id:'beschwoerer',name:'Beschwörer',icon:'🌟',desc:'Ruft Sternengeister und bindet Äther.',
    growth:{int:1.2,wil:1.3,cha:1.1,vit:0.7,str:0.5,dex:0.7},
    base:{atk:1,def:1,mag:5,spd:2,hp:7,mp:14},
    abilities:[
      {id:'aether_rufen',name:'Äther rufen',lvl:1,mp:8,summonBoost:1,ap:0},
      {id:'geistband',name:'Geistband',lvl:4,mp:6,status:'magschild',self:true,ap:70},
      {id:'doppelruf',name:'Doppelruf',lvl:10,mp:20,summonBoost:2,ap:180},
      {id:'sternenschwur',name:'Sternenschwur',lvl:15,mp:28,pow:2.3,elem:'licht',aoe:true,ap:300},
    ]},
  monch:{id:'monch',name:'Mönch',icon:'👊',desc:'Waffenlose Kunst und innere Kraft.',
    growth:{str:1.15,vit:1.15,dex:1.1,wil:1.0,int:0.6,cha:0.7},
    base:{atk:4,def:2,mag:1,spd:3,hp:12,mp:4},
    abilities:[
      {id:'schlagfolge',name:'Schlagfolge',lvl:1,mp:0,pow:1.25,elem:'phys',hits:2,ap:0},
      {id:'chi_welle',name:'Chi-Welle',lvl:5,mp:6,pow:1.4,elem:'licht',ap:85},
      {id:'innere_ruhe',name:'Innere Ruhe',lvl:8,mp:0,heal:25,self:true,ap:140},
    ]},
  jaeger:{id:'jaeger',name:'Jäger',icon:'🏹',desc:'Fernkampf aus der Hinterreihe.',
    growth:{dex:1.3,str:0.9,vit:0.9,int:0.8,wil:0.8,cha:0.8},
    base:{atk:3,def:1,mag:2,spd:4,hp:8,mp:5},
    abilities:[
      {id:'präzision',name:'Präzisionsschuss',lvl:1,mp:0,pow:1.3,elem:'phys',ranged:true,ap:0},
      {id:'elementpfeil',name:'Elementpfeil',lvl:4,mp:5,pow:1.45,elem:'wind',ranged:true,ap:65},
      {id:'salve',name:'Salve',lvl:9,mp:10,pow:1.2,elem:'phys',aoe:true,ranged:true,ap:160},
    ]},
  barde:{id:'barde',name:'Barde',icon:'🎵',desc:'Lieder stärken die Gruppe.',
    growth:{cha:1.4,int:1.0,wil:1.0,dex:0.9,str:0.6,vit:0.8},
    base:{atk:1,def:1,mag:3,spd:2,hp:7,mp:10},
    abilities:[
      {id:'kampflied',name:'Kampflied',lvl:1,mp:4,status:'staerkung',aoeParty:true,ap:0},
      {id:'eilmelodie',name:'Eilmelodie',lvl:3,mp:5,status:'hast',aoeParty:true,ap:50},
      {id:'klageton',name:'Klageton',lvl:6,mp:6,status:'langsam',statusChance:.7,ap:100},
      {id:'finale',name:'Finale',lvl:12,mp:16,pow:1.8,elem:'licht',aoe:true,ap:220},
    ]},
};

export function blankJobs(S){
  return {
    active:'krieger',
    levels:Object.fromEntries(Object.keys(JOBS).map(k=>[k,1])),
    ap:Object.fromEntries(Object.keys(JOBS).map(k=>[k,0])),
    learned:[], // ability ids carried across jobs
    unlocked:['krieger','magier','heiler','dieb'],
  };
}

export function ensureJobs(S){
  S.jobs=S.jobs||blankJobs(S);
  const j=S.jobs;
  if(!j.levels) j.levels={};
  if(!j.ap) j.ap={};
  if(!j.learned) j.learned=[];
  if(!j.unlocked) j.unlocked=['krieger','magier','heiler','dieb'];
  for(const id of Object.keys(JOBS)){
    if(j.levels[id]==null) j.levels[id]=1;
    if(j.ap[id]==null) j.ap[id]=0;
  }
  if(!JOBS[j.active]) j.active='krieger';
  return j;
}

export function jobLevel(S, id){
  ensureJobs(S);
  return S.jobs.levels[id||S.jobs.active]|1;
}

export function availableAbilities(S, jobId){
  ensureJobs(S);
  const job=JOBS[jobId||S.jobs.active]; if(!job) return [];
  const jl=jobLevel(S, job.id);
  const fromJob=job.abilities.filter(a=>a.lvl<=jl || S.jobs.learned.includes(a.id));
  // learned from other jobs also available
  const extra=[];
  for(const oid of Object.keys(JOBS)){
    if(oid===job.id) continue;
    for(const a of JOBS[oid].abilities){
      if(S.jobs.learned.includes(a.id) && !fromJob.some(x=>x.id===a.id)) extra.push(a);
    }
  }
  return [...fromJob, ...extra].slice(0,12);
}

export function switchJob(S, jobId){
  ensureJobs(S);
  if(!JOBS[jobId]) return {ok:false, text:'Unbekannter Beruf.'};
  if(!S.jobs.unlocked.includes(jobId)) return {ok:false, text:`Beruf ${JOBS[jobId].name} noch gesperrt.`};
  S.jobs.active=jobId;
  return {ok:true, text:`Beruf gewechselt: ${JOBS[jobId].name}.`};
}

export function unlockJob(S, jobId){
  ensureJobs(S);
  if(!JOBS[jobId]) return false;
  if(!S.jobs.unlocked.includes(jobId)) S.jobs.unlocked.push(jobId);
  return true;
}

export function grantJobAp(S, amount, jobId){
  ensureJobs(S);
  const id=jobId||S.jobs.active;
  const job=JOBS[id]; if(!job) return [];
  S.jobs.ap[id]=(S.jobs.ap[id]|0)+(amount|0);
  const unlocked=[];
  let jl=S.jobs.levels[id]|1;
  // level up every 100 AP
  while(S.jobs.ap[id]>=100 && jl<99){
    S.jobs.ap[id]-=100; jl++; S.jobs.levels[id]=jl;
    for(const a of job.abilities){
      if(a.lvl<=jl && !S.jobs.learned.includes(a.id) && (a.ap|0)===0){
        // free learn at level gate for ap:0; others need AP threshold met historically
      }
      if(a.lvl<=jl && !S.jobs.learned.includes(a.id)){
        // learn when job level reached
        S.jobs.learned.push(a.id); unlocked.push(a);
      }
    }
  }
  return unlocked;
}

export function jobStatBonus(S){
  ensureJobs(S);
  const job=JOBS[S.jobs.active]; if(!job) return {atk:0,def:0,mag:0,spd:0,hp:0,mp:0};
  const jl=jobLevel(S);
  const g=job.growth, b=job.base;
  return {
    atk:(b.atk|0)+Math.floor(jl*(g.str||1)*0.35),
    def:(b.def|0)+Math.floor(jl*(g.vit||1)*0.3),
    mag:(b.mag|0)+Math.floor(jl*(g.int||1)*0.4),
    spd:(b.spd|0)+Math.floor(jl*(g.dex||1)*0.35),
    hp:(b.hp|0)*jl,
    mp:(b.mp|0)*jl,
  };
}

export default {JOBS, blankJobs, ensureJobs, jobLevel, availableAbilities, switchJob, unlockJob, grantJobAp, jobStatBonus};
