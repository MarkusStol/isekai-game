/** v14 deep leveling: attributes, classes/branches, titles, perks, skill trees, acquisition paths */
export const ATTRS=['str','dex','int','wil','cha','vit'];
export const ATTR_LABEL={str:'Stärke',dex:'Geschick',int:'Verstand',wil:'Wille',cha:'Charme',vit:'Vitalität'};

export const CLASSES={
  held:{id:'held',name:'Held:in',icon:'⚔️',branches:['ritter','magier','kundschafter','barde']},
  schurke:{id:'schurke',name:'Schurke',icon:'🗡️',branches:['dieb','assassine','spion']},
  weise:{id:'weise',name:'Weise',icon:'📜',branches:['gelehrte','heiler','runenmeister']},
  wildling:{id:'wildling',name:'Wildling',icon:'🐺',branches:['jaeger','druide','bestienrufer']},
  nekromant:{id:'nekromant',name:'Nekromant',icon:'💀',branches:['todesweber','seelenbinder']},
  tech:{id:'tech',name:'Technomancer',icon:'⚙️',branches:['netrunner','ingenieur','medtech']},
};

export const BRANCH={
  ritter:{name:'Ritter',req:{str:8,vit:6},perks:['Schildwall','Vorbild']},
  magier:{name:'Magier',req:{int:10},perks:['Arkaner Fokus','Manafluss']},
  kundschafter:{name:'Kundschafter',req:{dex:8},perks:['Spurenlesen','Hinterhalt']},
  barde:{name:'Barde',req:{cha:8},perks:['Lied der Hoffnung','Charme']},
  dieb:{name:'Dieb',req:{dex:10},perks:['Taschendieb','Schleichen']},
  assassine:{name:'Assassine',req:{dex:10,wil:6},perks:['Todesstoß','Giftkunde']},
  spion:{name:'Spion',req:{cha:6,int:8},perks:['Maske','Netzwerk']},
  gelehrte:{name:'Gelehrte',req:{int:10},perks:['Archivgeist','Analyse']},
  heiler:{name:'Heiler',req:{wil:8,int:6},perks:['Heilung','Reinigung']},
  runenmeister:{name:'Runenmeister',req:{int:10,wil:8},perks:['Rune binden','Siegel']},
  jaeger:{name:'Jäger',req:{dex:8,vit:6},perks:['Fährte','Präzisionsschuss']},
  druide:{name:'Druide',req:{wil:8,vit:6},perks:['Naturgewalt','Gestalt']},
  bestienrufer:{name:'Bestienrufer',req:{cha:6,wil:8},perks:['Vertrautentier','Heulen']},
  todesweber:{name:'Todesweber',req:{int:10,wil:10},perks:['Untote rufen','Knochenrüstung']},
  seelenbinder:{name:'Seelenbinder',req:{wil:12},perks:['Seelenpakt','Erinnerungsdiebstahl']},
  netrunner:{name:'Netrunner',req:{int:10,dex:6},perks:['Icebreak','Ghost']},
  ingenieur:{name:'Ingenieur',req:{int:8,str:6},perks:['Basteln','Überladung']},
  medtech:{name:'Medtech',req:{int:8,wil:6},perks:['Feldchirurgie','Stimpacks']},
};

export const TITLES=[
  {id:'neuling',name:'Neuling',req:{lvl:1}},
  {id:'wanderer',name:'Wanderer',req:{lvl:5,discovered:5}},
  {id:'held_von',name:'Held von Aldheim',req:{lvl:10,ruf:40}},
  {id:'schatten',name:'Schatten der Gassen',req:{crime:3}},
  {id:'freund',name:'Seelenfreund',req:{romance:1}},
  {id:'baumeister',name:'Baumeister',req:{home:3}},
  {id:'gelehrt',name:'Codex-Gelehrte:r',req:{codex:12}},
  {id:'regent',name:'Regent',req:{treasury:800}},
  {id:'untotenherr',name:'Herr:in der Untoten',req:{undead:1}},
  {id:'ueberlebende',name:'Überlebende:r',req:{zombieDays:7}},
];

export const SKILL_TREE={
  kampf:['Hieb','Parade','Komboschlag','Finisher'],
  magie:['Funke','Schild','Nova','Teleport'],
  sozial:['Überreden','Einschüchtern','Feilschen','Inspiration'],
  ueberleben:['Lagerbau','Kräuter','Fallen','Erste Hilfe'],
  handwerk:['Schmieden','Kochen','Alchemie','Nähen'],
  heimlich:['Schleichen','Schlösser','Ablenken','Falschspiel'],
};

export const ACQUIRE_PATHS={
  quest:'Quest-Belohnung',
  mentor:'NPC-Mentor',
  buch:'Buch / Codex studieren',
  kampf:'Im Kampf erlernt',
  arbeit:'Arbeit / Handwerk',
  entdeckung:'Entdeckung in der Welt',
  titel:'Titel-Freischaltung',
  nekromantie:'Dunkles Ritual',
};

export function blankProgress(){
  return {
    attrs:{str:5,dex:5,int:5,wil:5,cha:5,vit:5},
    attrPoints:0,
    classId:'held',
    branch:null,
    titles:['neuling'],
    activeTitle:'neuling',
    perks:[],
    tree:Object.fromEntries(Object.keys(SKILL_TREE).map(k=>[k,0])),
    unlockedSkills:[],
    acquireLog:[],
    pathStats:{quest:0,mentor:0,buch:0,kampf:0,arbeit:0,entdeckung:0,titel:0,nekromantie:0}
  };
}

export function ensureProgress(S){
  if(!S.progress)S.progress=blankProgress();
  // sync legacy stats into attrs loosely
  if(S.st){
    S.progress.attrs.str=Math.max(S.progress.attrs.str, Math.min(20, 3+(S.st.str|0)/2|0));
    S.progress.attrs.cha=Math.max(S.progress.attrs.cha, Math.min(20, 3+(S.st.cha|0)/2|0));
    S.progress.attrs.vit=Math.max(S.progress.attrs.vit, Math.min(20, 4+((S.st.maxhp|100)/20|0)));
  }
  return S.progress;
}

export function xpToNext(lvl){return Math.round(80*lvl*1.35)}

export function grantXp(S, amount, reason=''){
  ensureProgress(S);
  if(!S.st)S.st={lvl:1,xp:0,hp:100,maxhp:100,mp:30,maxmp:30,str:5,cha:5,gold:0};
  if(S.st.lvl==null)S.st.lvl=1;
  S.st.xp=(S.st.xp|0)+(amount|0);
  const leveled=[];
  while((S.st.xp|0)>=xpToNext(S.st.lvl|1)){
    S.st.xp-=xpToNext(S.st.lvl|1);
    S.st.lvl=(S.st.lvl|1)+1;
    S.progress.attrPoints=(S.progress.attrPoints|0)+3;
    S.st.maxhp=(S.st.maxhp|0)+5+(S.progress.attrs.vit|0);
    S.st.hp=S.st.maxhp;
    S.st.maxmp=(S.st.maxmp|0)+3+(S.progress.attrs.int|0)/2|0;
    S.st.mp=S.st.maxmp;
    leveled.push(S.st.lvl);
    checkTitles(S);
  }
  if(amount)S.progress.acquireLog=(S.progress.acquireLog||[]).concat({t:Date.now(),xp:amount,reason:reason||'XP'}).slice(-40);
  return {leveled, lvl:S.st.lvl, xp:S.st.xp, next:xpToNext(S.st.lvl)};
}

export function spendAttr(S, attr, n=1){
  ensureProgress(S);
  if(!ATTRS.includes(attr))return {ok:false,text:'Unbekanntes Attribut'};
  if((S.progress.attrPoints|0)<n)return {ok:false,text:'Keine Attributspunkte'};
  S.progress.attrPoints-=n;
  S.progress.attrs[attr]=(S.progress.attrs[attr]|0)+n;
  if(!S.st)S.st={lvl:1,xp:0,hp:100,maxhp:100,mp:30,maxmp:30,str:5,cha:5,gold:0};
  if(attr==='str')S.st.str=(S.st.str|0)+n;
  if(attr==='cha')S.st.cha=(S.st.cha|0)+n;
  if(attr==='vit'){S.st.maxhp=(S.st.maxhp|0)+n*2;S.st.hp=Math.min(S.st.maxhp, (S.st.hp|0)+n*2)}
  if(attr==='int'){S.st.maxmp=(S.st.maxmp|0)+n;S.st.mp=Math.min(S.st.maxmp,(S.st.mp|0)+n)}
  return {ok:true,text:`${ATTR_LABEL[attr]} +${n}`};
}

export function setClass(S, classId){
  ensureProgress(S);
  if(!CLASSES[classId])return {ok:false,text:'Unbekannte Klasse'};
  S.progress.classId=classId; S.progress.branch=null;
  return {ok:true,text:`Klasse: ${CLASSES[classId].name}`};
}

export function chooseBranch(S, branchId){
  ensureProgress(S);
  const b=BRANCH[branchId]; if(!b)return {ok:false,text:'Unbekannter Zweig'};
  const cls=CLASSES[S.progress.classId];
  if(cls&&!(cls.branches||[]).includes(branchId))return {ok:false,text:'Zweig gehört nicht zu deiner Klasse'};
  for(const [k,v] of Object.entries(b.req||{})){
    if((S.progress.attrs[k]|0)<v)return {ok:false,text:`Benötigt ${ATTR_LABEL[k]||k} ${v}`};
  }
  S.progress.branch=branchId;
  for(const p of (b.perks||[])){
    if(!S.progress.perks.includes(p))S.progress.perks.push(p);
  }
  return {ok:true,text:`Zweig gewählt: ${b.name}. Perks: ${(b.perks||[]).join(', ')}`};
}

export function unlockSkill(S, tree, path='entdeckung'){
  ensureProgress(S);
  const list=SKILL_TREE[tree]; if(!list)return {ok:false,text:'Unbekannter Baum'};
  const lvl=S.progress.tree[tree]|0;
  if(lvl>=list.length)return {ok:false,text:'Baum bereits ausgeschöpft'};
  const name=list[lvl];
  S.progress.tree[tree]=lvl+1;
  S.progress.unlockedSkills.push({name,tree,path,at:S.cal?.day||S.time?.day||1});
  S.progress.pathStats[path]=(S.progress.pathStats[path]|0)+1;
  S.progress.acquireLog.push({t:Date.now(),skill:name,path,via:ACQUIRE_PATHS[path]||path});
  // mirror into S.skills
  S.skills=S.skills||[];
  if(!S.skills.some(sk=>(typeof sk==='string'?sk:sk.name)===name)){
    S.skills.push({name,icon:'✨',level:1,cost:5+lvl*3,cd:lvl,desc:`${ACQUIRE_PATHS[path]||path}: ${name}`,_cd:0});
  }
  return {ok:true,text:`Neue Fähigkeit: ${name} (${ACQUIRE_PATHS[path]||path})`};
}

export function checkTitles(S){
  ensureProgress(S);
  const got=[];
  const ctx={
    lvl:S.st?.lvl|1,
    discovered:(S.discovered||[]).length,
    ruf:S.st?.ruf|0,
    crime:(S.heat|0)>30?3:(S.wanted||[]).length,
    romance:Object.values(S.romance||{}).filter(r=>(r.stage|0)>=3).length,
    home:S.home?.stage|0,
    codex:Object.keys(S.codex?.entries||{}).length,
    treasury:S.kingdom?.treasury|0,
    undead:Object.values(S.world?.npcs||{}).filter(n=>n.undead).length,
    zombieDays:S.genre==='zombie'?(S.cal?.day|0):0
  };
  for(const t of TITLES){
    if(S.progress.titles.includes(t.id))continue;
    const r=t.req||{}; let ok=true;
    for(const [k,v] of Object.entries(r)){ if((ctx[k]|0)<v){ok=false;break} }
    if(ok){S.progress.titles.push(t.id); got.push(t); if(!S.progress.activeTitle)S.progress.activeTitle=t.id}
  }
  return got;
}

export function titleName(id){return (TITLES.find(t=>t.id===id)||{}).name||id}

export function summary(S){
  ensureProgress(S);
  const p=S.progress;
  return {
    lvl:S.st?.lvl|1, xp:S.st?.xp|0, next:xpToNext(S.st?.lvl|1),
    attrs:{...p.attrs}, points:p.attrPoints|0,
    className:CLASSES[p.classId]?.name||p.classId,
    branch:p.branch?BRANCH[p.branch]?.name:null,
    title:titleName(p.activeTitle),
    titles:p.titles.map(titleName),
    perks:p.perks.slice(),
    tree:{...p.tree},
    skills:p.unlockedSkills.slice(-8),
    paths:{...p.pathStats}
  };
}

export default {ATTRS,ATTR_LABEL,CLASSES,BRANCH,TITLES,SKILL_TREE,ACQUIRE_PATHS,blankProgress,ensureProgress,grantXp,spendAttr,setClass,chooseBranch,unlockSkill,checkTitles,titleName,summary,xpToNext};
