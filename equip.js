/** v17 equipment depth — weapons, armor, accessories, crafting */
import { ELEMENTS } from './gems.js';

export const RARITY=['common','uncommon','rare','epic','legendary'];
export const RARITY_LABEL={common:'Gewöhnlich',uncommon:'Ungewöhnlich',rare:'Selten',epic:'Episch',legendary:'Legendär'};

export const WEAPONS={
  eisenklinge:{id:'eisenklinge',name:'Eisenklinge',slot:'weapon',icon:'⚔️',atk:8,sockets:1,rarity:'common',elem:null},
  runenschwert:{id:'runenschwert',name:'Runenschwert',slot:'weapon',icon:'🗡️',atk:14,mag:4,sockets:2,rarity:'rare',elem:'licht'},
  froststab:{id:'froststab',name:'Froststab',slot:'weapon',icon:'🪄',atk:4,mag:16,sockets:2,rarity:'rare',elem:'eis'},
  diebesdolch:{id:'diebesdolch',name:'Diebesdolch',slot:'weapon',icon:'🗡️',atk:10,spd:4,sockets:1,rarity:'uncommon',crit:0.08},
  drachenspeer:{id:'drachenspeer',name:'Drachenspeer',slot:'weapon',icon:'🔱',atk:18,sockets:2,rarity:'epic',elem:'feuer'},
  sternenklinge:{id:'sternenklinge',name:'Sternenklinge',slot:'weapon',icon:'✨',atk:22,mag:12,sockets:3,rarity:'legendary',elem:'licht'},
};

export const ARMORS={
  lederwams:{id:'lederwams',name:'Lederwams',slot:'armor',icon:'🦺',def:6,sockets:1,rarity:'common'},
  plattenharnisch:{id:'plattenharnisch',name:'Plattenharnisch',slot:'armor',icon:'🛡️',def:16,spd:-1,sockets:1,rarity:'rare'},
  magierrobe:{id:'magierrobe',name:'Magierrobe',slot:'armor',icon:'🧥',def:5,mag:8,mp:10,sockets:2,rarity:'uncommon'},
  schattenmantel:{id:'schattenmantel',name:'Schattenmantel',slot:'armor',icon:'🧥',def:8,spd:3,sockets:2,rarity:'epic',resist:['dunkel']},
  aethercuirass:{id:'aethercuirass',name:'Ätherkürass',slot:'armor',icon:'🛡️',def:20,mag:6,sockets:3,rarity:'legendary'},
};

export const ACCESSORIES={
  kraftband:{id:'kraftband',name:'Kraftband',slot:'accessory',icon:'💍',atk:3,rarity:'common'},
  eilstiefel:{id:'eilstiefel',name:'Eilstiefel',slot:'accessory',icon:'👢',spd:5,rarity:'uncommon'},
  schutzamulett:{id:'schutzamulett',name:'Schutzamulett',slot:'accessory',icon:'📿',def:4,resist:['gift'],rarity:'rare'},
  heldenring:{id:'heldenring',name:'Heldenring',slot:'accessory',icon:'💍',atk:5,mag:5,hp:30,rarity:'epic'},
  weltenauge:{id:'weltenauge',name:'Weltenauge',slot:'accessory',icon:'👁️',mag:10,spd:3,sockets:1,rarity:'legendary'},
};

export const ALL_EQUIP={...WEAPONS,...ARMORS,...ACCESSORIES};

export const CRAFT_RECIPES=[
  {id:'runenschwert', mats:{'Eisenbarren':2,'Runensplitter':1}, gold:120, tier:2},
  {id:'froststab', mats:{'Eiskristall':2,'Holzstab':1}, gold:100, tier:2},
  {id:'plattenharnisch', mats:{'Eisenbarren':3,'Leder':1}, gold:150, tier:2},
  {id:'diebesdolch', mats:{'Eisenbarren':1,'Leder':1}, gold:40, tier:1},
  {id:'drachenspeer', mats:{'Eisenbarren':2,'Boss-Essenz':1,'Leder':1}, gold:280, tier:3},
  {id:'schattenmantel', mats:{'Leder':2,'Runensplitter':2}, gold:220, tier:3},
  {id:'heldenring', mats:{'Runensplitter':2,'Sternenfragment':1}, gold:300, tier:3},
  {id:'sternenklinge', mats:{'Sternenfragment':3,'Runenschwert':1,'Boss-Essenz':1}, gold:500, tier:4},
  {id:'aethercuirass', mats:{'Eisenbarren':4,'Sternenfragment':2,'Boss-Essenz':1}, gold:450, tier:4},
];

/** Cooking / camping recipes — restore HP/MP, buff flags */
export const COOK_RECIPES=[
  {id:'kraeutersuppe', name:'Kräutersuppe', mats:{'Kräuter':2}, gold:0, heal:35, mp:0, tier:1, desc:'Einfacher Eintopf vom Wegrand.'},
  {id:'reisebrot', name:'Reisebrot', mats:{'Mehl':1,'Kräuter':1}, gold:2, heal:20, mp:5, tier:1, desc:'Hält den Hunger fern.'},
  {id:'feuerfleisch', name:'Feuerfleisch', mats:{'Fleisch':1,'Kräuter':1}, gold:5, heal:50, mp:0, tier:1, desc:'Gebraten, würzig, stärkend.'},
  {id:'stimtee', name:'Stimtee', mats:{'Kräuter':3,'Eiskristall':1}, gold:8, heal:10, mp:40, tier:2, desc:'Klarer Kopf, warmes Mana.'},
  {id:'notnahrung', name:'Notnahrung', mats:{'Dosenreste':1}, gold:0, heal:25, mp:0, tier:1, genre:['zombie'], desc:'Überlebensration.'},
  {id:'synth_bowl', name:'Synth-Bowl', mats:{'Synth-Paste':1,'Elektrolyt':1}, gold:6, heal:30, mp:15, tier:1, genre:['cyberpunk'], desc:'Neon-Kantinenklassiker.'},
  {id:'siegeltrank', name:'Siegeltrank', mats:{'Kräuter':2,'Runensplitter':1}, gold:20, heal:40, mp:25, tier:2, desc:'Alchemie light — Lagerfeuer-tauglich.'},
];

export function blankEquip(S){
  return {
    weapon:'eisenklinge',
    armor:'lederwams',
    accessory:null,
    inventory:['eisenklinge','lederwams','kraftband','diebesdolch','magierrobe'],
    sockets:{ // itemId -> [gemUid|null]
      eisenklinge:[null],
      lederwams:[null],
    },
    upgrades:{}, // itemId -> level
    mats:{'Eisenbarren':3,'Leder':2,'Runensplitter':1,'Holzstab':1,'Eiskristall':1,'Kräuter':3,'Mehl':2,'Fleisch':1,'Dosenreste':1,'Synth-Paste':1,'Elektrolyt':1,'Sternenfragment':0,'Boss-Essenz':0},
  };
}

export function ensureEquip(S){
  S.equip=S.equip||blankEquip(S);
  const e=S.equip;
  if(!e.inventory) e.inventory=[];
  if(!e.sockets) e.sockets={};
  if(!e.upgrades) e.upgrades={};
  if(!e.mats) e.mats={};
  return e;
}

export function getItem(id){ return ALL_EQUIP[id]||null }

export function equippedStats(S){
  ensureEquip(S);
  const ids=[S.equip.weapon, S.equip.armor, S.equip.accessory].filter(Boolean);
  const out={atk:0,def:0,mag:0,spd:0,hp:0,mp:0,crit:0,resist:[],elem:null,sockets:[]};
  for(const id of ids){
    const it=getItem(id); if(!it) continue;
    const up=S.equip.upgrades[id]|0;
    out.atk+=(it.atk|0)+up;
    out.def+=(it.def|0)+up;
    out.mag+=(it.mag|0)+Math.floor(up/2);
    out.spd+=(it.spd|0);
    out.hp+=(it.hp|0)+up*5;
    out.mp+=(it.mp|0)+up*2;
    out.crit+=(it.crit||0);
    if(it.resist) out.resist.push(...it.resist);
    if(it.elem) out.elem=it.elem;
    const sock=S.equip.sockets[id]||Array(it.sockets|0).fill(null);
    out.sockets.push(...sock.filter(Boolean));
  }
  return out;
}

export function upgradeItem(S, id){
  ensureEquip(S);
  const it=getItem(id); if(!it) return {ok:false,text:'Unbekannt.'};
  if(!S.equip.inventory.includes(id) && S.equip.weapon!==id && S.equip.armor!==id && S.equip.accessory!==id)
    return {ok:false,text:'Nicht im Besitz.'};
  const lvl=S.equip.upgrades[id]|0;
  if(lvl>=10) return {ok:false,text:'Maximale Stufe.'};
  const cost=30+(lvl+1)*25;
  if((S.st?.gold|0)<cost) return {ok:false,text:'Nicht genug Gil.'};
  S.st.gold-=cost;
  S.equip.upgrades[id]=lvl+1;
  return {ok:true,text:`${it.name} → +${lvl+1}`,cost};
}

export function craftItem(S, recipeId){
  ensureEquip(S);
  const rec=CRAFT_RECIPES.find(r=>r.id===recipeId); if(!rec) return {ok:false,text:'Rezept unbekannt.'};
  const tierNeed=(rec.tier||1);
  // v40 hard gate via content40 stations/skills (no soft level bypass)
  try{
    const gateFn=window.__game?.C41?.canCraftRecipe41||window.__game?.C40?.canCraftRecipe;
    if(gateFn){
      const gate=gateFn(S, recipeId, 'craft');
      if(!gate.ok) return {ok:false,text:gate.reason};
    } else {
      const tierHave=(S.content39?.flags?.gearTier)||1;
      if(tierNeed>tierHave) return {ok:false,text:`Ausrüstungsstufe ${tierNeed} nötig (aktuell ${tierHave}).`};
    }
  }catch(_){
    const tierHave=(S.content39?.flags?.gearTier)||1;
    if(tierNeed>tierHave) return {ok:false,text:`Ausrüstungsstufe ${tierNeed} nötig (aktuell ${tierHave}).`};
  }
  if((S.st?.gold|0)<rec.gold) return {ok:false,text:'Nicht genug Gil.'};
  for(const [m,n] of Object.entries(rec.mats)){
    if((S.equip.mats[m]|0)<n) return {ok:false,text:`Fehlt: ${m}`};
  }
  // inventory recipe components (e.g. Runenschwert) — treat as mats if present as item id
  for(const [m,n] of Object.entries(rec.mats)){
    if(ALL_EQUIP[m]){
      // need crafted item as ingredient
      let left=n;
      while(left>0){
        const ix=S.equip.inventory.indexOf(m);
        if(ix<0) return {ok:false,text:`Fehlt Gegenstand: ${getItem(m)?.name||m}`};
        S.equip.inventory.splice(ix,1); left--;
      }
    } else {
      S.equip.mats[m]-=n;
    }
  }
  S.st.gold-=rec.gold;
  if(!S.equip.inventory.includes(recipeId)) S.equip.inventory.push(recipeId);
  const it=getItem(recipeId);
  if(it?.sockets && !S.equip.sockets[recipeId]) S.equip.sockets[recipeId]=Array(it.sockets).fill(null);
  let xpNote='';
  try{
    const C41=window.__game?.C41;
    const station=(window.__game?.C40?.RECIPE_STATION||{})[recipeId]||'forge';
    const skill=station==='kitchen'?'kochen':station==='alchemy'?'alchemie':'schmieden';
    const xp=C41?.grantCraftXp?.(S, skill, 18+tierNeed*8, 'craft:'+recipeId);
    if(xp) xpNote=` · ${skill} Lv${xp.lvl}${xp.leveled?'↑':''}`;
  }catch(_){}
  return {ok:true,text:`Hergestellt: ${it?.name||recipeId} (Tier ${tierNeed})${xpNote}`};
}

export function cookItem(S, recipeId){
  ensureEquip(S);
  const rec=COOK_RECIPES.find(r=>r.id===recipeId); if(!rec) return {ok:false,text:'Kochrezept unbekannt.'};
  try{
    const gateFn=window.__game?.C41?.canCraftRecipe41||window.__game?.C40?.canCraftRecipe;
    if(gateFn){
      const gate=gateFn(S, recipeId, 'cook');
      if(!gate.ok) return {ok:false,text:gate.reason};
    }
  }catch(_){}
  if(rec.genre && S.genre && !rec.genre.includes(S.genre) && !rec.genre.some(g=>String(S.genre).includes(g))){
    // still allow — genre hint only
  }
  if((S.st?.gold|0)<(rec.gold|0)) return {ok:false,text:'Nicht genug Gil.'};
  for(const [m,n] of Object.entries(rec.mats||{})){
    if((S.equip.mats[m]|0)<n) return {ok:false,text:`Fehlt: ${m}`};
  }
  for(const [m,n] of Object.entries(rec.mats||{})) S.equip.mats[m]-=n;
  if(rec.gold) S.st.gold-=rec.gold;
  if(S.st){
    if(rec.heal) S.st.hp=Math.min(S.st.maxhp|S.st.hp,(S.st.hp|0)+(rec.heal|0));
    if(rec.mp) S.st.mp=Math.min(S.st.maxmp|S.st.mp,(S.st.mp|0)+(rec.mp|0));
  }
  try{ if(S.needs) S.needs.hunger=Math.max(0,(S.needs.hunger|0)-25); }catch(_){}
  let xpNote='';
  try{
    const xp=window.__game?.C41?.grantCraftXp?.(S,'kochen',14+(rec.tier||1)*6,'cook:'+recipeId);
    if(xp) xpNote=` · kochen Lv${xp.lvl}${xp.leveled?'↑':''}`;
  }catch(_){}
  return {ok:true,text:`Gekocht: ${rec.name}. ${rec.desc||''} (+${rec.heal|0} HP${rec.mp?`, +${rec.mp} MP`:''})${xpNote}`};
}

export function socketGem(S, itemId, slotIdx, gemUid){
  ensureEquip(S);
  const it=getItem(itemId); if(!it) return {ok:false};
  const socks=S.equip.sockets[itemId]=S.equip.sockets[itemId]||Array(it.sockets|0).fill(null);
  if(slotIdx<0||slotIdx>=socks.length) return {ok:false,text:'Kein Sockel.'};
  socks[slotIdx]=gemUid;
  return {ok:true};
}

export default {RARITY, RARITY_LABEL, WEAPONS, ARMORS, ACCESSORIES, ALL_EQUIP, CRAFT_RECIPES, COOK_RECIPES,
  blankEquip, ensureEquip, getItem, equippedStats, upgradeItem, craftItem, cookItem, socketGem};
