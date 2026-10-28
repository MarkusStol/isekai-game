/** v17 Aetherkristalle — gem sockets on gear (original; not materia) */
export const ELEMENTS=['feuer','eis','blitz','wasser','wind','erde','licht','dunkel'];
export const ELEM_LABEL={
  feuer:'Feuer',eis:'Eis',blitz:'Blitz',wasser:'Wasser',wind:'Wind',erde:'Erde',licht:'Licht',dunkel:'Dunkel',phys:'Physisch'
};

export const GEM_CATALOG={
  feuerkern:{id:'feuerkern',name:'Feuerkern',elem:'feuer',color:'#ef4444',spell:{name:'Glut',mp:5,pow:1.35,elem:'feuer'},maxLvl:15,link:'offensive'},
  eiskern:{id:'eiskern',name:'Eiskern',elem:'eis',color:'#38bdf8',spell:{name:'Frost',mp:5,pow:1.35,elem:'eis'},maxLvl:15,link:'offensive'},
  blitzkern:{id:'blitzkern',name:'Blitzkern',elem:'blitz',color:'#fbbf24',spell:{name:'Funke',mp:5,pow:1.35,elem:'blitz'},maxLvl:15,link:'offensive'},
  wasserkern:{id:'wasserkern',name:'Wasserkern',elem:'wasser',color:'#22d3ee',spell:{name:'Gischt',mp:5,pow:1.35,elem:'wasser'},maxLvl:15,link:'offensive'},
  windkern:{id:'windkern',name:'Windkern',elem:'wind',color:'#a3e635',spell:{name:'Böe',mp:5,pow:1.3,elem:'wind'},maxLvl:15,link:'offensive'},
  erdkern:{id:'erdkern',name:'Erdkern',elem:'erde',color:'#a8a29e',spell:{name:'Beben',mp:8,pow:1.4,elem:'erde',aoe:true},maxLvl:15,link:'offensive'},
  lichtkern:{id:'lichtkern',name:'Lichtkern',elem:'licht',color:'#fde68a',spell:{name:'Schein',mp:6,pow:1.4,elem:'licht'},maxLvl:15,link:'offensive'},
  dunkelkern:{id:'dunkelkern',name:'Dunkelkern',elem:'dunkel',color:'#7c3aed',spell:{name:'Schatten',mp:6,pow:1.4,elem:'dunkel'},maxLvl:15,link:'offensive'},
  heilstein:{id:'heilstein',name:'Heilstein',elem:'licht',color:'#86efac',spell:{name:'Lebenstropfen',mp:4,heal:36},maxLvl:12,link:'support'},
  haststein:{id:'haststein',name:'Haststein',elem:'wind',color:'#f9a8d4',spell:{name:'Eile',mp:5,status:'hast',self:true},maxLvl:10,link:'support'},
  giftstein:{id:'giftstein',name:'Giftstein',elem:'dunkel',color:'#84cc16',spell:{name:'Toxin',mp:4,pow:0.8,elem:'dunkel',status:'gift',statusChance:.55},maxLvl:10,link:'status'},
  schutzstein:{id:'schutzstein',name:'Schutzstein',elem:'erde',color:'#94a3b8',spell:{name:'Panzer',mp:5,status:'schutz',self:true},maxLvl:10,link:'support'},
  allmacht:{id:'allmacht',name:'Allmachtssplitter',elem:'licht',color:'#fbbf24',spell:{name:'Absolute',mp:18,pow:2.2,elem:'licht',aoe:true},maxLvl:20,link:'offensive',rare:true},
};

/** Link combos: adjacent same link-type gems grant bonus */
export const LINK_COMBOS={
  'offensive+offensive':{name:'Doppelkern',powBonus:0.25,desc:'Zwei Angriffskristalle verstärken sich.'},
  'support+support':{name:'Heilkreis',healBonus:0.2,desc:'Unterstützende Kristalle fließen zusammen.'},
  'offensive+status':{name:'Durchdringung',statusChanceBonus:0.15,desc:'Status haftet besser.'},
  'support+offensive':{name:'Kampfsegen',mpDiscount:1,desc:'Zauber kosten 1 MP weniger.'},
};

export function blankGems(S){
  return {
    inventory:[
      {uid:'g1',defId:'feuerkern',lvl:1,xp:0},
      {uid:'g2',defId:'heilstein',lvl:1,xp:0},
      {uid:'g3',defId:'eiskern',lvl:1,xp:0},
    ],
    // sockets filled by uid on equipment pieces
  };
}

export function ensureGems(S){
  S.gems=S.gems||blankGems(S);
  if(!S.gems.inventory) S.gems.inventory=[];
  return S.gems;
}

export function gemDef(g){
  const id=typeof g==='string'?g:(g.defId||g.id);
  return GEM_CATALOG[id]||null;
}

export function gemXpToNext(lvl){ return 40+lvl*25 }

export function grantGemXp(gem, amount){
  if(!gem) return [];
  const def=gemDef(gem); if(!def) return [];
  gem.xp=(gem.xp|0)+(amount|0);
  const leveled=[];
  while(gem.lvl<(def.maxLvl||15) && gem.xp>=gemXpToNext(gem.lvl)){
    gem.xp-=gemXpToNext(gem.lvl); gem.lvl++; leveled.push(gem.lvl);
  }
  return leveled;
}

export function spellFromGem(gem){
  const def=gemDef(gem); if(!def||!def.spell) return null;
  const lvl=gem.lvl|1;
  const sp={...def.spell, fromGem:def.id, gemLvl:lvl, name:def.spell.name+(lvl>=5?'+':'')};
  if(sp.pow) sp.pow=+(sp.pow*(1+(lvl-1)*0.06)).toFixed(2);
  if(sp.heal) sp.heal=Math.round(sp.heal*(1+(lvl-1)*0.05));
  if(sp.mp) sp.mp=Math.max(1, (sp.mp|0) - Math.floor((lvl-1)/5));
  return sp;
}

/** Resolve socketed gems on a loadout → spells + link bonuses */
export function resolveLoadoutGems(S, loadout){
  ensureGems(S);
  const sockets=(loadout?.sockets||[]);
  const gems=sockets.map(uid=>S.gems.inventory.find(g=>g.uid===uid)).filter(Boolean);
  const spells=gems.map(spellFromGem).filter(Boolean);
  let powBonus=0, healBonus=0, statusChanceBonus=0, mpDiscount=0;
  const links=[];
  for(let i=0;i<gems.length-1;i++){
    const a=gemDef(gems[i]), b=gemDef(gems[i+1]);
    if(!a||!b) continue;
    const key=a.link+'+'+b.link;
    const combo=LINK_COMBOS[key]||LINK_COMBOS[b.link+'+'+a.link];
    if(combo){
      links.push(combo.name);
      powBonus+=combo.powBonus||0;
      healBonus+=combo.healBonus||0;
      statusChanceBonus+=combo.statusChanceBonus||0;
      mpDiscount+=combo.mpDiscount||0;
    }
  }
  // apply link to spells
  for(const sp of spells){
    if(sp.pow) sp.pow=+(sp.pow*(1+powBonus)).toFixed(2);
    if(sp.heal) sp.heal=Math.round(sp.heal*(1+healBonus));
    if(sp.statusChance!=null) sp.statusChance=Math.min(0.95,(sp.statusChance||0)+statusChanceBonus);
    if(sp.mp) sp.mp=Math.max(1,(sp.mp|0)-mpDiscount);
  }
  return {gems, spells, links, powBonus, healBonus};
}

export function findGem(S, defId){
  ensureGems(S);
  return S.gems.inventory.find(g=>g.defId===defId);
}

export function addGem(S, defId, lvl=1){
  ensureGems(S);
  if(!GEM_CATALOG[defId]) return null;
  const uid='g'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
  const g={uid, defId, lvl, xp:0};
  S.gems.inventory.push(g);
  return g;
}

export default {ELEMENTS, ELEM_LABEL, GEM_CATALOG, LINK_COMBOS, blankGems, ensureGems, gemDef, grantGemXp, spellFromGem, resolveLoadoutGems, findGem, addGem, gemXpToNext};
