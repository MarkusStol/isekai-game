/** v42: skilled battle AI (gambits/elements/stagger), talk odds UI helpers, OW region minimap */
import * as C41 from './content41.js';
import * as C40 from './content40.js';
import * as C39 from './content39.js';
import * as Jrpg from './jrpg.js';

/* ---- Talk chance preview (visible odds/hints) ---- */
export function estimateTalkChance(S, foe, choice){
  const c=choice||{};
  let chance=Math.max(0.05, Math.min(0.92, c.base??0.25));
  const hints=[];
  if(c.rel && S.romance?.[c.rel]){
    const r=S.romance[c.rel];
    const bonus=Math.min(0.2, ((r.affection|0)+(r.trust|0))/250);
    chance+=bonus;
    hints.push(`Bindung ${c.rel}: +${Math.round(bonus*100)}%`);
  }
  if(c.tags?.includes('spare')) hints.push('Frühere Gnade hilft');
  if(c.tags?.includes('story')) hints.push('Story/Fraktion');
  if(c.tags?.includes('relationship')) hints.push('Beziehung');
  if(c.tags?.includes('threat')||c.id==='threat'){
    hints.push('Risiko: Wut möglich');
  }
  if(c.tags?.includes('peace')||c.tags?.includes('mercy')) hints.push('Friedlicher Ton');
  const cha=(S.st?.cha|0)+(S.progress?.attrs?.cha|0);
  if(cha>=12) hints.push('Hohe Ausstrahlung');
  chance=Math.max(0.05, Math.min(0.92, chance));
  return { chance, pct:Math.round(chance*100), hints, risk:!!(c.tags?.includes('threat')||c.id==='threat') };
}

/* ---- Skilled Einsatzregeln / gambits ---- */
export function skilledGambits(){
  return [
    {id:'heal_crit', when:'hp_lt', value:0.35, action:'skill', skill:'Heilung', target:'self_lowest_hp', on:true},
    {id:'potion_crit', when:'hp_lt', value:0.28, action:'item', item:'Heiltrank', target:'self', on:true},
    {id:'analyze_boss', when:'boss_unanalyzed', action:'analyze', target:'boss', on:true},
    {id:'exploit_stagger', when:'foe_staggered', action:'skill_best', target:'staggered_foe', on:true},
    {id:'build_stagger', when:'foe_stagger_high', action:'skill_stagger', target:'weak_foe', on:true},
    {id:'exploit_weak', when:'foe_weak', action:'skill_elem', target:'weak_foe', on:true},
    {id:'buff_self', when:'no_status', status:'staerkung', action:'skill', skill:'Inspiration', target:'self', on:true},
    {id:'attack', when:'always', action:'attack', target:'lowest_hp_foe', on:true},
  ];
}

/** Extended gambit decide used by companions + skilled hero sim */
export function skilledGambitDecide(actor, battle, gambits){
  const rules=gambits||actor.gambits||skilledGambits();
  const party=battle.party||[];
  const foes=(battle.foes||[]).filter(u=>u.alive);
  const livingParty=party.filter(u=>u.alive);
  const skills=actor.skills||[];
  const canMp=sk=>(sk.mp|0)<=(actor.mp|0);

  for(const r of rules){
    if(r.on===false) continue;

    if(r.when==='hp_lt'){
      const t=livingParty.slice().sort((a,b)=>a.hp/a.maxhp-b.hp/b.maxhp)[0];
      if(t && t.hp/t.maxhp < (r.value||0.35)){
        if(r.action==='item'){
          const inv=battle.S?.inv||[];
          const name=r.item||'Heiltrank';
          if(inv.some(i=>(typeof i==='string'?i:i.name)===name))
            return {cmd:'item', item:name, targetId:t._iid||t.id, why:'potion'};
        }
        const sk=skills.find(s=>s.heal)||{name:'Erste Hilfe',heal:32,mp:4};
        if(canMp(sk)) return {cmd:'skill', skill:sk, targetId:t._iid||t.id, why:'heal'};
      }
    }

    if(r.when==='boss_unanalyzed'){
      const boss=foes.find(f=>(f.boss||f.talkable) && !f.analyzed);
      if(boss) return {cmd:'analyze', targetId:boss._iid, why:'analyze'};
    }

    if(r.when==='foe_staggered'){
      const t=foes.find(f=>f.staggered);
      if(t){
        const sk=skills.filter(s=>s.pow && canMp(s)).sort((a,b)=>(b.pow||1)-(a.pow||1))[0];
        if(sk) return {cmd:'skill', skill:sk, targetId:t._iid, why:'stagger_burst'};
        return {cmd:'attack', targetId:t._iid, why:'stagger_burst'};
      }
    }

    if(r.when==='foe_stagger_high'){
      const t=foes.slice().sort((a,b)=>((b.stagger||0)/(b.staggerMax||1))-((a.stagger||0)/(a.staggerMax||1)))[0];
      if(t && t.staggerMax && (t.stagger||0)/t.staggerMax>=0.55 && !t.staggered){
        const sk=skills.find(s=>s.staggerBonus && canMp(s))
          || skills.find(s=>s.elem && (t.weak||[]).includes(s.elem) && canMp(s))
          || skills.filter(s=>s.pow && canMp(s)).sort((a,b)=>(b.pow||1)-(a.pow||1))[0];
        if(sk) return {cmd:'skill', skill:sk, targetId:t._iid, why:'build_stagger'};
      }
    }

    if(r.when==='foe_weak' && foes.length){
      for(const f of foes){
        const weak=f.weak||[];
        const resist=f.resist||[];
        const sk=skills.find(s=>s.elem && weak.includes(s.elem) && canMp(s))
          || skills.find(s=>s.elem && s.elem!=='phys' && !resist.includes(s.elem) && canMp(s) && !s.heal);
        if(sk && weak.includes(sk.elem)) return {cmd:'skill', skill:sk, targetId:f._iid, why:'exploit_elem'};
      }
    }

    if(r.when==='no_status'){
      if(!(actor.statuses||[]).some(s=>s.id===r.status)){
        const sk=skills.find(s=>s.status===r.status||s.name===r.skill);
        if(sk && canMp(sk)) return {cmd:'skill', skill:sk, targetId:actor._iid||actor.id, why:'buff'};
      }
    }

    if(r.when==='always' && foes.length){
      const t=foes.slice().sort((a,b)=>a.hp-b.hp)[0];
      const resist=t.resist||[];
      const sk=skills.find(s=>s.elem && (t.weak||[]).includes(s.elem) && canMp(s))
        || skills.find(s=>s.elem && s.elem!=='phys' && !resist.includes(s.elem) && canMp(s) && s.pow && !s.heal)
        || skills.find(s=>s.pow>1.2 && canMp(s) && !s.heal && !(s.elem && resist.includes(s.elem)));
      if(sk) return {cmd:'skill', skill:sk, targetId:t._iid, why:'press'};
      return {cmd:'attack', targetId:t._iid, why:'attack'};
    }
  }
  if(foes.length) return {cmd:'attack', targetId:foes[0]._iid, why:'fallback'};
  return null;
}

/** Apply a skilled decision via Battle.playerCommand */
export function applySkilledCommand(Battle, dec){
  if(!dec) return false;
  if(dec.cmd==='analyze'){ Battle.playerCommand('analyze',{targetId:dec.targetId}); return true; }
  if(dec.cmd==='skill'){ Battle.playerCommand('skill',{skill:dec.skill, targetId:dec.targetId}); return true; }
  if(dec.cmd==='item'){ Battle.playerCommand('item',{item:dec.item, targetId:dec.targetId}); return true; }
  if(dec.cmd==='attack'){ Battle.playerCommand('attack',{targetId:dec.targetId}); return true; }
  if(dec.cmd==='defend'){ Battle.playerCommand('defend'); return true; }
  return false;
}

/* ---- Overworld region minimap (real OW tilemap) ---- */
const OW_TILE_COLORS={
  grass:'#2d5a2d', path:'#8a6a3a', floor:'#3a3344', wall:'#1a1520', tree:'#1a3a1a',
  water:'#203858', sand:'#c2a05a', stone:'#6a6a72', door:'#8a6230', void:'#0a0810',
  plaza:'#5a4a3a', fence:'#4a3a2a', house:'#5a3040', well:'#4a6a8a', stall:'#6a4a2a',
  carpet:'#5a2040', ruin:'#4a3030', wood:'#5a4030', burnt:'#3a2020',
};

export function ensureOwMinimapDom(){
  let el=document.getElementById('owRegionMinimap');
  if(!el){
    el=document.createElement('div');
    el.id='owRegionMinimap';
    el.className='ow-region-minimap hidden';
    el.innerHTML='<canvas class="ow-mm-canvas" width="120" height="120"></canvas><div class="ow-mm-label"></div>';
    document.body.appendChild(el);
  }
  return el;
}

/** Render current overworld tilemap into corner minimap. map={w,h,tiles}, hero={x,y}, name */
export function renderOwRegionMinimap(map, hero, opts={}){
  const host=ensureOwMinimapDom();
  if(!map?.tiles?.length){ host.classList.add('hidden'); return null; }
  host.classList.remove('hidden');
  const canvas=host.querySelector('canvas');
  const label=host.querySelector('.ow-mm-label');
  const ctx=canvas.getContext('2d');
  const W=map.w, H=map.h;
  const scale=Math.max(2, Math.floor(Math.min(120/W, 120/H)));
  const cw=W*scale, ch=H*scale;
  if(canvas.width!==cw||canvas.height!==ch){ canvas.width=cw; canvas.height=ch; }
  ctx.imageSmoothingEnabled=false;
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){
    const t=map.tiles[y][x];
    ctx.fillStyle=OW_TILE_COLORS[t]||'#333';
    ctx.fillRect(x*scale,y*scale,scale,scale);
  }
  // fog overlay if provided
  if(opts.fog && typeof opts.fog==='function'){
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){
      if(opts.fog(x,y)){
        ctx.fillStyle='rgba(0,0,0,0.55)';
        ctx.fillRect(x*scale,y*scale,scale,scale);
      }
    }
  }
  if(hero){
    ctx.fillStyle='#6cf';
    ctx.fillRect((hero.x|0)*scale+1,(hero.y|0)*scale+1,Math.max(2,scale-2),Math.max(2,scale-2));
    ctx.strokeStyle='#fff'; ctx.lineWidth=1;
    ctx.strokeRect((hero.x|0)*scale+0.5,(hero.y|0)*scale+0.5,Math.max(2,scale-1),Math.max(2,scale-1));
  }
  if(label) label.textContent=opts.name||map.name||'Region';
  return host;
}

export function hideOwRegionMinimap(){
  const el=document.getElementById('owRegionMinimap');
  if(el) el.classList.add('hidden');
}

export function migrateV42(S){
  C41.migrateV41(S);
  S.battle=S.battle||{};
  if(!S.battle.gambits?.length) S.battle.gambits=skilledGambits();
  // Upgrade default gambits with stagger/analyze rules if still v17 defaults only
  const ids=(S.battle.gambits||[]).map(g=>g.id);
  if(!ids.includes('analyze_boss') || !ids.includes('exploit_stagger')){
    const merged=[...skilledGambits()];
    for(const g of (S.battle.gambits||[])){
      if(!merged.some(m=>m.id===g.id)) merged.push(g);
    }
    S.battle.gambits=merged;
  }
  S.battle.gambitMap=S.battle.gambitMap||{};
  S.battle.gambitMap.hero=S.battle.gambits;
  // Elemental starters so Einsatzregeln / weakness play is available early
  S.progress=S.progress||{};
  const unlock=S.progress.unlockedSkills||[];
  const need=['Hieb','Funke','Blitzfunke','Erdstoß','Eisklinge','Erste Hilfe','Heilung','Inspiration','Komboschlag'];
  const names=new Set(unlock.map(s=>typeof s==='string'?s:s.name));
  for(const n of need){ if(!names.has(n)){ unlock.push(n); names.add(n); } }
  S.progress.unlockedSkills=unlock;
  S.ver=42;
  return S;
}

export default {
  estimateTalkChance, skilledGambits, skilledGambitDecide, applySkilledCommand,
  ensureOwMinimapDom, renderOwRegionMinimap, hideOwRegionMinimap, migrateV42,
  OW_TILE_COLORS,
};
