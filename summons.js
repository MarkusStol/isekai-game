/** v17 Sternengeister — original summon entities & lore */
export const STERNENGEISTER={
  solara:{
    id:'solara', name:'Solara', icon:'☀️', elem:'feuer',
    lore:'Die Sonnenwächterin, geboren aus dem ersten Morgenlicht einer toten Welt.',
    cost:28, pow:2.4, aoe:true, unlock:'quest_sonnentempel',
    skillName:'Sonnenspeer', portrait:'assets/creature/dragon_whelp.webp'
  },
  nivalis:{
    id:'nivalis', name:'Nivalis', icon:'❄️', elem:'eis',
    lore:'Ein Kristallherz aus dem Schweigen der Gletschergräber.',
    cost:26, pow:2.3, aoe:true, status:'langsam', statusChance:.4, unlock:'bond_ice',
    skillName:'Ewiger Schnee', portrait:'assets/creature/slime.svg'
  },
  voltaris:{
    id:'voltaris', name:'Voltaris', icon:'⚡', elem:'blitz',
    lore:'Der wandernde Funke zwischen Sturm und Stahl.',
    cost:24, pow:2.5, unlock:'quest_turm',
    skillName:'Himmelsriss', portrait:'assets/creature/drone.svg'
  },
  aqualith:{
    id:'aqualith', name:'Aqualith', icon:'🌊', elem:'wasser',
    lore:'Ein Tiefsee-Wächter, der Schiffe und Seelen gleichermaßen trägt.',
    cost:25, pow:2.2, aoe:true, unlock:'quest_hafen',
    skillName:'Gezeitenbruch', portrait:'assets/creature/walker.webp'
  },
  zephyra:{
    id:'zephyra', name:'Zephyra', icon:'🌪️', elem:'wind',
    lore:'Die Stimme der Hochpässe — frei, scharf, ungehalten.',
    cost:22, pow:2.1, aoe:true, unlock:'bond_wind',
    skillName:'Klingenorkan', portrait:'assets/creature/fog_passenger.svg'
  },
  terraxis:{
    id:'terraxis', name:'Terraxis', icon:'🪨', elem:'erde',
    lore:'Ein Berggeist, der Städte unter seinen Schritten zählt.',
    cost:30, pow:2.6, aoe:true, unlock:'quest_berg',
    skillName:'Weltplatten', portrait:'assets/creature/bone_knight.webp'
  },
  lumenor:{
    id:'lumenor', name:'Lumenor', icon:'🕊️', elem:'licht',
    lore:'Ein Schwur aus Sternenstaub, der nur den Gerechten antwortet.',
    cost:32, pow:2.5, aoe:true, healParty:40, unlock:'bond_light',
    skillName:'Aurora-Schwur', portrait:'assets/creature/boss_archfiend.webp'
  },
  umbrax:{
    id:'umbrax', name:'Umbrax', icon:'🌑', elem:'dunkel',
    lore:'Die Leere hinter dem Mond — hungrig, aber vertragstreu.',
    cost:34, pow:2.7, aoe:true, status:'blind', statusChance:.35, unlock:'quest_mond',
    skillName:'Nachtfraktur', portrait:'assets/creature/shadow_wraith.webp'
  },
};

export function blankSummons(S){
  return { owned:['solara'], bonds:{}, questFlags:{} };
}

export function ensureSummons(S){
  S.summons=S.summons||blankSummons(S);
  if(!S.summons.owned) S.summons.owned=['solara'];
  if(!S.summons.bonds) S.summons.bonds={};
  return S.summons;
}

export function ownedSummons(S){
  ensureSummons(S);
  return S.summons.owned.map(id=>STERNENGEISTER[id]).filter(Boolean);
}

export function unlockSummon(S, id, reason=''){
  ensureSummons(S);
  if(!STERNENGEISTER[id]) return {ok:false};
  if(!S.summons.owned.includes(id)) S.summons.owned.push(id);
  S.summons.bonds[id]=S.summons.bonds[id]||{lvl:1, xp:0};
  if(reason) S.summons.questFlags[reason]=1;
  return {ok:true, spirit:STERNENGEISTER[id]};
}

export function bondSummon(S, id, xp=10){
  ensureSummons(S);
  if(!S.summons.owned.includes(id)) return null;
  const b=S.summons.bonds[id]=S.summons.bonds[id]||{lvl:1,xp:0};
  b.xp+=xp;
  while(b.xp>=50+b.lvl*20 && b.lvl<10){ b.xp-=50+b.lvl*20; b.lvl++ }
  return b;
}

export function summonPower(S, id){
  const sp=STERNENGEISTER[id]; if(!sp) return null;
  ensureSummons(S);
  const bond=S.summons.bonds[id]?.lvl|1;
  return {...sp, pow:+(sp.pow*(1+(bond-1)*0.08)).toFixed(2), bond};
}

export default {STERNENGEISTER, blankSummons, ensureSummons, ownedSummons, unlockSummon, bondSummon, summonPower};
