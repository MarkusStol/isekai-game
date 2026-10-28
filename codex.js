/** v13 illustrated codex – bestiary, arsenal, items, flora, people, places, factions, maps, lore */
import { ledgerPush } from './sim.js';

export const CODEX_CATS=['bestiary','arsenal','items','flora','people','places','factions','maps','lore'];
export const CODEX_LABEL={bestiary:'Bestiarium',arsenal:'Arsenal',items:'Gegenstände',flora:'Flora',people:'Personen',places:'Orte',factions:'Fraktionen',maps:'Karten',lore:'Wissen'};
export const DISC_LEVELS=['glimpsed','studied','mastered'];
export const DISC_LABEL={glimpsed:'Erblickt',studied:'Untersucht',mastered:'Meisterhaft'};

export function blankCodex(){
  return {entries:{},cats:Object.fromEntries(CODEX_CATS.map(c=>[c,[]])),version:1};
}
export function ensureCodex(S){if(!S.codex)S.codex=blankCodex();return S.codex}

function eid(cat,name){return cat+':'+String(name||'').toLowerCase().replace(/\s+/g,'_').slice(0,48)}

export function upsertEntry(S,{cat,name,desc,stats,behavior,habitat,imagePrompt,icon,where,level}){
  ensureCodex(S);
  if(!CODEX_CATS.includes(cat))cat='lore';
  const id=eid(cat,name);
  const prev=S.codex.entries[id];
  const order={glimpsed:1,studied:2,mastered:3};
  const nextLevel=(!prev||(order[level||'glimpsed']>=order[prev.level||'glimpsed']))?(level||'glimpsed'):prev.level;
  const e={
    id,cat,name,
    desc:desc||prev?.desc||'',
    stats:{...(prev?.stats||{}),...(stats||{})},
    behavior:behavior||prev?.behavior||'',
    habitat:habitat||prev?.habitat||'',
    imagePrompt:imagePrompt||prev?.imagePrompt||`${cat} ${name} anime fantasy illustration`,
    icon:icon||prev?.icon||'📖',
    level:nextLevel,
    seenAt:prev?.seenAt||[],
    obtained:prev?.obtained||[],
    firstDay:prev?.firstDay||S.cal?.day||S.time?.day||1,
    updatedDay:S.cal?.day||S.time?.day||1
  };
  if(where&&!e.seenAt.includes(where))e.seenAt.push(where);
  S.codex.entries[id]=e;
  if(!S.codex.cats[cat].includes(id))S.codex.cats[cat].push(id);
  return e;
}

export function discover(S, partial){
  const e=upsertEntry(S,{...partial,level:partial.level||'glimpsed'});
  ledgerPush(S,{type:'codex',who:S.pc?.name||'Du',what:`Codex: ${e.name} (${DISC_LABEL[e.level]}).`,where:partial.where||S.world?.scene?.ort,importance:30,emotion:'neugierig',meta:{codexId:e.id}});
  return e;
}

export function study(S,nameOrId,cat){
  ensureCodex(S);
  let e=S.codex.entries[nameOrId]||S.codex.entries[eid(cat||'lore',nameOrId)]||Object.values(S.codex.entries).find(x=>x.name===nameOrId);
  if(!e)return null;
  const up=e.level==='glimpsed'?'studied':e.level==='studied'?'mastered':'mastered';
  e=upsertEntry(S,{...e,level:up,desc:e.desc||`Genauere Notizen zu ${e.name}.`});
  return e;
}

export function recordCreature(S,name,opts={}){
  return discover(S,{cat:'bestiary',name,desc:opts.desc||`Begegnung mit ${name}.`,stats:opts.stats||{gefahr:opts.danger||1},behavior:opts.behavior||'',habitat:opts.habitat||S.world?.scene?.ort,icon:opts.icon||'👹',imagePrompt:opts.imagePrompt||`fantasy monster ${name} anime`,where:S.world?.scene?.ort,level:opts.level||'glimpsed'});
}
export function recordItem(S,item,opts={}){
  const name=typeof item==='string'?item:item?.name; if(!name)return null;
  const cat=/schwert|bogen|axt|dolch|stab|waffe|schild|lance|speer/i.test(name)?'arsenal':'items';
  return discover(S,{cat,name,desc:opts.desc||(item?.desc)||name,stats:{rarity:item?.rarity||'common',type:item?.type||'misc'},icon:item?.icon||'📦',where:S.world?.scene?.ort,level:opts.level||'glimpsed',imagePrompt:`fantasy item ${name} game icon anime`});
}
export function recordPerson(S,name,npc){
  return discover(S,{cat:'people',name,desc:npc?.art||'',behavior:npc?.stimme||'',habitat:npc?.ort||npc?.home,icon:npc?.e||'👤',stats:{age:npc?.age,mood:npc?.mood},where:S.world?.scene?.ort,level:'glimpsed',imagePrompt:`anime character portrait ${name} ${npc?.art||''}`});
}
export function recordPlace(S,name,desc){
  return discover(S,{cat:'places',name,desc:desc||'',habitat:name,icon:'📍',where:name,level:'glimpsed',imagePrompt:`fantasy landscape ${name} anime scenic`});
}
export function recordFlora(S,name,opts={}){
  return discover(S,{cat:'flora',name,desc:opts.desc||`Pflanze: ${name}.`,habitat:opts.habitat||S.world?.scene?.ort,behavior:opts.behavior||'wächst saisonal',stats:opts.stats||{},icon:opts.icon||'🌿',where:S.world?.scene?.ort,level:opts.level||'glimpsed',imagePrompt:opts.imagePrompt||`fantasy plant herb ${name} botanical anime`});
}
export function recordFaction(S,name,opts={}){
  return discover(S,{cat:'factions',name,desc:opts.desc||'',behavior:opts.behavior||'',stats:opts.stats||{},icon:opts.icon||'🏛',where:S.world?.scene?.ort,level:opts.level||'glimpsed',imagePrompt:`fantasy faction emblem ${name} anime heraldry`});
}
export function recordWeapon(S,item,opts={}){
  const name=typeof item==='string'?item:item?.name; if(!name)return null;
  return discover(S,{cat:'arsenal',name,desc:opts.desc||item?.desc||name,stats:{rarity:item?.rarity||'common',dmg:item?.dmg||opts.dmg,type:item?.type||'weapon'},icon:item?.icon||'⚔️',where:S.world?.scene?.ort,level:opts.level||'glimpsed',imagePrompt:`fantasy weapon ${name} game icon anime sharp`});
}
export function markObtained(S,nameOrId,where){
  ensureCodex(S);
  let e=S.codex.entries[nameOrId]||Object.values(S.codex.entries).find(x=>x.name===nameOrId);
  if(!e)return null;
  e.obtained=e.obtained||[];
  const tag=where||S.world?.scene?.ort||'?';
  if(!e.obtained.includes(tag))e.obtained.push(tag);
  if(e.level==='glimpsed')e.level='studied';
  return e;
}

export function listCat(S,cat){
  ensureCodex(S);
  return (S.codex.cats[cat]||[]).map(id=>S.codex.entries[id]).filter(Boolean);
}

export function inlineCard(entry){
  if(!entry)return '';
  return `📜 ${entry.icon||'📖'} ${entry.name} — ${DISC_LABEL[entry.level]||entry.level}: ${(entry.desc||'').slice(0,100)}`;
}

export default {blankCodex,ensureCodex,upsertEntry,discover,study,recordCreature,recordItem,recordPerson,recordPlace,recordFlora,recordFaction,recordWeapon,markObtained,listCat,inlineCard,CODEX_CATS,CODEX_LABEL,DISC_LABEL,DISC_LEVELS};
