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
  {id:'runenschwert', mats:{'Eisenbarren':2,'Runensplitter':1}, gold:120},
  {id:'froststab', mats:{'Eiskristall':2,'Holzstab':1}, gold:100},
  {id:'plattenharnisch', mats:{'Eisenbarren':3,'Leder':1}, gold:150},
  {id:'sternenklinge', mats:{'Sternenfragment':3,'Runenschwert':1}, gold:500},
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
    mats:{'Eisenbarren':3,'Leder':2,'Runensplitter':1,'Holzstab':1,'Eiskristall':1},
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
  if((S.st?.gold|0)<rec.gold) return {ok:false,text:'Nicht genug Gil.'};
  for(const [m,n] of Object.entries(rec.mats)){
    if((S.equip.mats[m]|0)<n) return {ok:false,text:`Fehlt: ${m}`};
  }
  for(const [m,n] of Object.entries(rec.mats)) S.equip.mats[m]-=n;
  S.st.gold-=rec.gold;
  if(!S.equip.inventory.includes(recipeId)) S.equip.inventory.push(recipeId);
  const it=getItem(recipeId);
  if(it?.sockets && !S.equip.sockets[recipeId]) S.equip.sockets[recipeId]=Array(it.sockets).fill(null);
  return {ok:true,text:`Hergestellt: ${it?.name||recipeId}`};
}

export function socketGem(S, itemId, slotIdx, gemUid){
  ensureEquip(S);
  const it=getItem(itemId); if(!it) return {ok:false};
  const socks=S.equip.sockets[itemId]=S.equip.sockets[itemId]||Array(it.sockets|0).fill(null);
  if(slotIdx<0||slotIdx>=socks.length) return {ok:false,text:'Kein Sockel.'};
  socks[slotIdx]=gemUid;
  return {ok:true};
}

export default {RARITY, RARITY_LABEL, WEAPONS, ARMORS, ACCESSORIES, ALL_EQUIP, CRAFT_RECIPES,
  blankEquip, ensureEquip, getItem, equippedStats, upgradeItem, craftItem, socketGem};
