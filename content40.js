/** v40: full NPC arc hooks, hard craft stations, dungeon minimap */
import * as C39 from './content39.js';
import * as Equip from './equip.js';
import * as Jobs from './jobs.js';

const R=a=>a[Math.floor(Math.random()*a.length)];

const WOUND_POOL=['Ein alter Verlust','Verrat durch jemanden Nahen','Hunger nach Anerkennung','Schuld, die nicht verjährt','Ein Name, den niemand mehr sagt','Angst vor dem nächsten Winter'];
const DESIRE_POOL=['Einen sicheren Ort finden','Gerechtigkeit ohne Blut','Die Familie ernähren','Einen Fehler wiedergutmachen','Freiheit von einer Schuld','Etwas Schönes bewahren'];
const SECRET_POOL=['Kennt einen geheimen Weg.','Schuldet einer Fraktion alles.','Hat jemanden im Stich gelassen.','Hört nachts Stimmen, die helfen.','Besitzt einen gestohlenen Schlüssel.','Weiß, wer den Brand gelegt hat.'];

/** Ensure EVERY NPC has wound/desire/secret — then one arc hook each. */
export function ensureNpcArcHooks(S){
  const npcs=S.world?.npcs||{};
  let filled=0;
  for(const [name,n] of Object.entries(npcs)){
    if(!n||n.alive===false) continue;
    if(!n.wound && !n.furcht){ n.wound=R(WOUND_POOL); filled++; }
    else if(!n.wound) n.wound=n.furcht;
    if(!n.desire && !n.ziel && !n.need){ n.desire=R(DESIRE_POOL); filled++; }
    else if(!n.desire) n.desire=n.ziel||n.need;
    if(!n.geheimnis && !(n.secrets&&n.secrets.length)){ n.geheimnis=R(SECRET_POOL); n.secrets=[n.geheimnis]; filled++; }
    else if(!n.geheimnis && n.secrets?.[0]) n.geheimnis=n.secrets[0];
    if(!n.furcht) n.furcht=n.wound;
    if(!n.ziel) n.ziel=n.desire;
  }
  return filled;
}

/** Seed arcs for ALL living NPCs (idempotent). */
export function seedAllNpcArcs(S){
  ensureNpcArcHooks(S);
  // content39 limiter was 4 — seed without practical limit
  return C39.seedSideArcsFromNpcs(S, 999);
}

/* ---- Craft stations + skills (hard gate) ---- */
export const CRAFT_STATIONS={
  forge:{id:'forge', name:'Schmiede', skill:'schmieden', icon:'🔨', tiers:[1,2,3,4]},
  kitchen:{id:'kitchen', name:'Küche', skill:'kochen', icon:'🍲', tiers:[1,2]},
  alchemy:{id:'alchemy', name:'Alchemie', skill:'alchemie', icon:'⚗️', tiers:[2,3,4]},
};

export const RECIPE_STATION={
  diebesdolch:'forge', eisenklinge:'forge', lederwams:'forge',
  runenschwert:'forge', froststab:'forge', plattenharnisch:'forge',
  drachenspeer:'forge', schattenmantel:'forge', heldenring:'alchemy',
  sternenklinge:'forge', aethercuirass:'forge',
  kraeutersuppe:'kitchen', reisebrot:'kitchen', feuerfleisch:'kitchen',
  stimtee:'alchemy', notnahrung:'kitchen', synth_bowl:'kitchen', siegeltrank:'alchemy',
};

export function ensureCraft40(S){
  C39.ensureContent39(S);
  S.craft40=S.craft40||{stations:{}, skills:{kochen:1}};
  const c=S.craft40;
  if(!c.stations) c.stations={};
  if(!c.skills) c.skills={kochen:1};
  // starter kitchen always
  if(!c.stations.kitchen) c.stations.kitchen={unlocked:true, level:1};
  return c;
}

export function unlockStation(S, id, reason=''){
  const c=ensureCraft40(S);
  const def=CRAFT_STATIONS[id]; if(!def) return null;
  c.stations[id]=c.stations[id]||{unlocked:false, level:1};
  if(!c.stations[id].unlocked){
    c.stations[id].unlocked=true;
    c.stations[id].reason=reason||'entdeckt';
    return {text:`Station freigeschaltet: ${def.icon} ${def.name}`};
  }
  return null;
}

export function grantCraftSkill(S, skill, lvl=1){
  const c=ensureCraft40(S);
  c.skills[skill]=Math.max(c.skills[skill]|0, lvl);
  if(skill==='schmieden') unlockStation(S,'forge','skill');
  if(skill==='kochen') unlockStation(S,'kitchen','skill');
  if(skill==='alchemie') unlockStation(S,'alchemy','skill');
  return c.skills[skill];
}

/** Sync stations from mid-game / dungeon / jobs */
export function syncCraftProgress(S){
  // v41+: skill growth via use/training XP (C41); stations still unlock here as floor
  try{
    if(typeof window!=='undefined' && window.__game?.C41?.syncCraftProgress41){
      return window.__game.C41.syncCraftProgress41(S);
    }
  }catch(_){}
  ensureCraft40(S);
  const tier=C39.gearTierAvailable(S);
  const lvl=S.st?.lvl||1;
  const jobs=S.jobs?.unlocked||[];
  if(lvl>=3 || tier>=2) unlockStation(S,'forge','fortschritt');
  if(tier>=2 || jobs.includes('monch') || jobs.includes('beschwoerer')) unlockStation(S,'alchemy','fortschritt');
  if((S.content39?.clearedDungeons||[]).length) {
    unlockStation(S,'forge','dungeon');
  }
  // floor only — do not auto-jump skill to gear tier (XP path in C41)
  if(S.craft40.stations.forge?.unlocked && !(S.craft40.skills.schmieden|0)) grantCraftSkill(S,'schmieden', 1);
  if(S.craft40.stations.alchemy?.unlocked && !(S.craft40.skills.alchemie|0)) grantCraftSkill(S,'alchemie', 1);
  if(!(S.craft40.skills.kochen|0)) grantCraftSkill(S,'kochen', 1);
  return S.craft40;
}

/** Hard gate: station unlocked + skill level >= recipe tier + gearTier >= recipe tier */
export function canCraftRecipe(S, recipeId, kind='craft'){
  ensureCraft40(S);
  syncCraftProgress(S);
  const rec=(kind==='cook'?Equip.COOK_RECIPES:Equip.CRAFT_RECIPES).find(r=>r.id===recipeId);
  if(!rec) return {ok:false, reason:'Rezept unbekannt.'};
  const tierNeed=(rec.tier||1);
  const stationId=RECIPE_STATION[recipeId]||(kind==='cook'?'kitchen':'forge');
  const station=CRAFT_STATIONS[stationId];
  const st=S.craft40.stations[stationId];
  if(!st?.unlocked){
    return {ok:false, reason:`Station „${station?.name||stationId}“ gesperrt. Schmieden/Kochen/Alchemie freischalten (Level, Job, Dungeon).`, station:stationId, tierNeed};
  }
  const skill=station.skill;
  const skillLvl=S.craft40.skills[skill]|0;
  if(skillLvl<tierNeed){
    return {ok:false, reason:`Skill ${skill} Stufe ${tierNeed} nötig (hast ${skillLvl}).`, station:stationId, tierNeed, skillLvl};
  }
  const gearTier=C39.gearTierAvailable(S);
  if(tierNeed>gearTier){
    return {ok:false, reason:`Ausrüstungsstufe ${tierNeed} nötig (aktuell ${gearTier}). Kein Soft-Bypass.`, station:stationId, tierNeed, gearTier};
  }
  return {ok:true, station:stationId, tierNeed, skillLvl, gearTier};
}

/* ---- Dungeon minimap ---- */
export function renderDungeonMinimap(host, S){
  // v41: prefer real tilemap minimap
  try{
    if(typeof window!=='undefined' && window.__game?.C41?.renderDungeonMinimap){
      return window.__game.C41.renderDungeonMinimap(host, S);
    }
  }catch(_){}
  const d=S.content39?.dungeon;
  if(!host) return null;
  if(!d){ host.classList.add('hidden'); host.innerHTML=''; return null; }
  host.classList.remove('hidden');
  const rooms=d.rooms||[];
  const cur=d.room|0;
  const cells=rooms.map((r,i)=>{
    const done=!!r.done || i<cur;
    const here=i===cur;
    const cls=['mm-cell', r.type, done?'done':'', here?'here':''].filter(Boolean).join(' ');
    const label=here?'●':(r.type||'?')[0].toUpperCase();
    return `<div class="${cls}" title="Raum ${i+1}: ${r.type}${done?' (klar)':''}${here?' ← du':''}">${label}</div>`;
  }).join('');
  host.innerHTML=`<div class="dungeon-mm">
    <div class="mm-title">${d.name||'Dungeon'}</div>
    <div class="mm-row">${cells}</div>
    <div class="mm-legend"><span class="mm-cell puzzle">P</span>uzzle <span class="mm-cell trap">T</span>rap <span class="mm-cell loot">L</span>oot <span class="mm-cell combat">C</span>ombat <span class="mm-cell boss">B</span>oss · jederzeit zurück</div>
  </div>`;
  return host;
}

export function ensureMinimapDom(){
  let el=document.getElementById('dungeonMinimap');
  if(!el){
    el=document.createElement('div');
    el.id='dungeonMinimap';
    el.className='dungeon-minimap-root hidden';
    document.body.appendChild(el);
  }
  return el;
}

export function refreshMinimap(S){
  try{ renderDungeonMinimap(ensureMinimapDom(), S); }catch(_){}
}

export function onDungeonEnterHook(S){
  try{ window.__game?.C41?.onDungeonEnterHook?.(S); }catch(_){}
  refreshMinimap(S);
}
export function onDungeonLeaveHook(S){
  try{ window.__game?.C41?.onDungeonLeaveHook?.(S); }catch(_){}
  refreshMinimap(S);
}

export function migrateV40(S){
  C39.ensureContent39(S);
  ensureNpcArcHooks(S);
  seedAllNpcArcs(S);
  ensureCraft40(S);
  syncCraftProgress(S);
  C39.midgameUnlocks(S,{toast:false});
  S.ver=40;
  return S;
}

export default {
  ensureNpcArcHooks, seedAllNpcArcs, CRAFT_STATIONS, RECIPE_STATION,
  ensureCraft40, unlockStation, grantCraftSkill, syncCraftProgress, canCraftRecipe,
  renderDungeonMinimap, ensureMinimapDom, refreshMinimap, onDungeonEnterHook, onDungeonLeaveHook,
  migrateV40,
};
