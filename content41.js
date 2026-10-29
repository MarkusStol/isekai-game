/** v41: fair ATB boss balance helpers, in-fight boss dialogue, tilemap minimap, craft skill XP → tier 4 */
import * as C40 from './content40.js';
import * as C39 from './content39.js';
import * as Equip from './equip.js';

const TILE_BASE = './assets/pixel/tiles-dungeon';
const TILE_SRC = {
  floor:`${TILE_BASE}/floor.png`, wall:`${TILE_BASE}/wall.png`, path:`${TILE_BASE}/path.png`,
  door:`${TILE_BASE}/door.png`, stone:`${TILE_BASE}/stone.png`, void:`${TILE_BASE}/void.png`,
  ruin:`${TILE_BASE}/ruin.png`, carpet:`${TILE_BASE}/carpet.png`, water:`${TILE_BASE}/water.png`,
};

/** Expected player level for first dungeon boss (fair fight target). */
export const BOSS_EXPECTED_LVL = 8;

/** Soft HP/ATK scale for under/over-level (applied on dungeon boss spawn). */
export function bossScaleForLevel(S, foe){
  if(!foe?.boss) return foe;
  const lvl = S?.st?.lvl|0 || 1;
  const expect = foe.expectLvl || BOSS_EXPECTED_LVL;
  // Already tuned in enemies.js for expectLvl; slight soften if player is on-level, harden if overleveled only via player power.
  const out = { ...foe };
  out.expectLvl = expect;
  out._balanced41 = true;
  // Mark humanoid bosses talkable with dialogue trees
  if(['boss_chrome','story_ashcroft','quiet_porter'].includes(foe.id) || foe.human) out.human = true;
  if(['boss_ogre','boss_tyrant','boss_lich','dragon_whelp','boss_archfiend','boss_fogking'].includes(foe.id)){
    out.talkable = true;
  }
  return out;
}

/* ---- In-fight boss dialogue (story / relationship, not hidden flags only) ---- */
export function bossDialogueChoices(S, foe){
  const id = foe?.id || '';
  const name = foe?.name || 'Boss';
  const romance = S.romance || {};
  const threads = S.content39?.threads || {};
  const arcs = S.content39?.arcs || [];
  const spared = (S.flags?.spared || []).concat(S.flags?.sparedNames || []);
  const cha = (S.st?.cha|0) + (S.progress?.attrs?.cha|0);
  const choices = [];

  // Always available: appeal to reason / threaten / plead
  choices.push({ id:'reason', label:'Zur Vernunft reden', text:`${name}, das muss nicht so enden. Lege die Waffen nieder.`, base:0.28 + cha/100, tags:['peace'] });
  choices.push({ id:'plead', label:'Um Gnade bitten', text:`Bitte — verschone uns, wir gehen.`, base:0.18 + cha/140, tags:['mercy'] });
  choices.push({ id:'threat', label:'Einschüchtern', text:`Du wirst fallen. Weiche jetzt.`, base:0.12 + (S.st?.str|0)/90, tags:['threat'], risk:true });

  // Spared history (visible story, not only flag — also check journal)
  if(spared.includes(id) || spared.includes(name) || (S.ticks?.log||[]).some(l=>/verschont|gnade|surrender/i.test(String(l)))){
    choices.push({ id:'remind_spare', label:'Frühere Gnade erwähnen', text:`Damals hast du Gnade erfahren — erinnere dich.`, base:0.55 + cha/120, tags:['story','spare'] });
  }

  // Genre / faction thread stage
  const genre = S.genre || S.role || '';
  const th = threads[genre] || threads[S.role] || Object.values(threads)[0];
  const stage = th?.stage|0;
  if(stage >= 1){
    choices.push({ id:'faction', label:'Fraktion / Gerücht ansprechen', text:`Die Gerüchte über dich sind weit — beweise, dass du mehr bist als Wut.`, base:0.35 + stage*0.08, tags:['story','faction'] });
  }
  if(stage >= 2 && /ogre|tyrant|chrome|lich/i.test(id)){
    choices.push({ id:'thread', label:'Hauptfaden zitieren', text:`Der Ostwall / die Enklave / Sektor 9 braucht keinen weiteren Toten. Hör zu.`, base:0.42 + stage*0.06, tags:['story','thread'] });
  }

  // Relationship with related NPCs (affection/trust visible in romance)
  const related = Object.entries(romance).filter(([,r])=>(r.affection|0)>=20 || (r.trust|0)>=15 || (r.stage|0)>=1);
  if(related.length){
    const [who, r] = related.sort((a,b)=>((b[1].affection|0)-(a[1].affection|0)))[0];
    choices.push({
      id:'rel_'+who.replace(/\W+/g,'_').slice(0,20),
      label:`An ${who} appellieren`,
      text:`${who} vertraut mir — und würde wollen, dass Blut hier endet. Hör auf ${who}.`,
      base:0.38 + Math.min(0.35, ((r.affection|0)+(r.trust|0))/200),
      tags:['relationship', who],
      rel:who,
    });
  }

  // Completed mercy arcs
  const mercyArc = arcs.find(a=>a.status==='erledigt' && /gnade|mercy|verschon|frieden|versöhn/i.test(String(a.title||a.id||a.hook||'')));
  if(mercyArc || arcs.filter(a=>a.status==='erledigt').length>=2){
    choices.push({ id:'arc_mercy', label:'Versöhnungspfad nennen', text:`Ich habe schon Frieden gestiftet — glaube mir das.`, base:0.48, tags:['story','arc'] });
  }

  // Boss-specific story hooks (readable, not hidden)
  if(id==='boss_ogre'){
    choices.push({ id:'ogre_honor', label:'Krieger-Ehre', text:`Kriegsherr — ein ehrenvoller Rückzug ist stärker als ein sinnloser Tod.`, base:0.4, tags:['story','honor'] });
  }
  if(id==='boss_tyrant'){
    choices.push({ id:'tyrant_cure', label:'Heilung / Serum', text:`Es gibt Serum und Hoffnung — du musst kein Monster bleiben.`, base:0.36, tags:['story','cure'] });
  }
  if(id==='boss_chrome'){
    choices.push({ id:'chrome_code', label:'Protokoll ansprechen', text:`Dein Code erlaubt Wahl. Überschreib den Kill-Befehl.`, base:0.4, tags:['story','code'] });
  }
  if(id==='boss_lich'){
    choices.push({ id:'lich_name', label:'Alten Namen nennen', text:`Ich kenne den Namen, den du vergraben hast. Ruhe, nicht Fluch.`, base:0.38, tags:['story','name'] });
  }

  // Deduplicate; prioritize relationship + story hooks over generic
  const seen=new Set();
  const uniq=choices.filter(c=>{ if(seen.has(c.id)) return false; seen.add(c.id); return true; });
  const score=c=>{
    let s=0;
    if(c.tags?.includes('relationship')) s+=5;
    if(c.tags?.includes('story')) s+=3;
    if(c.tags?.includes('spare')) s+=2;
    if(c.id==='reason') s+=1;
    return s;
  };
  return uniq.sort((a,b)=>score(b)-score(a)).slice(0,8);
}

export function resolveBossDialogue(S, foe, choice){
  const c = choice || {};
  let chance = clamp(c.base ?? 0.25, 0.05, 0.92);
  // Visible relationship bonus
  if(c.rel && S.romance?.[c.rel]){
    const r=S.romance[c.rel];
    chance += Math.min(0.2, ((r.affection|0)+(r.trust|0))/250);
  }
  if(c.tags?.includes('threat')){
    // threaten can backfire
    if(Math.random() < 0.35){
      return { ok:false, enrage:true, chance, text:`${foe.name} wird wütend von der Drohung.` };
    }
  }
  const roll = Math.random();
  const ok = roll < chance;
  // Soft story write: bump related affection slightly on attempt
  if(c.rel && S.romance?.[c.rel]){
    S.romance[c.rel].trust = (S.romance[c.rel].trust|0) + (ok?2:1);
  }
  if(ok){
    S.flags = S.flags||{};
    S.flags.bossTalkedDown = S.flags.bossTalkedDown||[];
    if(!S.flags.bossTalkedDown.includes(foe.id||foe.name)) S.flags.bossTalkedDown.push(foe.id||foe.name);
  }
  return { ok, enrage:false, chance, roll, text: ok ? `${foe.name} senkt die Waffe — überzeugt.` : `${foe.name} schüttelt den Kopf.` };
}

function clamp(n,a,b){ return Math.max(a, Math.min(b,n)); }

/* ---- Craft skill XP → tier 4 via use/training ---- */
export const CRAFT_XP_TO_NEXT = { 1:40, 2:90, 3:160, 4:9999 };

export function ensureCraft41(S){
  C40.ensureCraft40(S);
  const c=S.craft40;
  c.skillXp = c.skillXp || { schmieden:0, kochen:0, alchemie:0 };
  for(const k of ['schmieden','kochen','alchemie']){
    if(c.skills[k]==null) c.skills[k] = k==='kochen'?1:0;
    if(c.skillXp[k]==null) c.skillXp[k]=0;
  }
  return c;
}

/** Grant craft XP; level up skill toward 4. Station unlock follows skill>=1. */
export function grantCraftXp(S, skill, amount=10, reason=''){
  const c=ensureCraft41(S);
  if(!['schmieden','kochen','alchemie'].includes(skill)) return null;
  let lvl = c.skills[skill]|0;
  if(lvl<=0){ c.skills[skill]=1; lvl=1; C40.unlockStation(S, skill==='kochen'?'kitchen':skill==='alchemie'?'alchemy':'forge', 'training'); }
  if(lvl>=4){ c.skillXp[skill]=0; return { skill, lvl:4, leveled:false, xp:0, reason }; }
  c.skillXp[skill]=(c.skillXp[skill]|0)+Math.max(1, amount|0);
  let leveled=false;
  while(lvl<4 && (c.skillXp[skill]|0) >= (CRAFT_XP_TO_NEXT[lvl]||9999)){
    c.skillXp[skill]-=CRAFT_XP_TO_NEXT[lvl];
    lvl++; c.skills[skill]=lvl; leveled=true;
    C40.unlockStation(S, skill==='kochen'?'kitchen':skill==='alchemie'?'alchemy':'forge', 'skill_xp');
  }
  return { skill, lvl:c.skills[skill], leveled, xp:c.skillXp[skill], need:CRAFT_XP_TO_NEXT[c.skills[skill]|0], reason };
}

/** Train at a station without crafting (small XP). */
export function trainCraftSkill(S, skill){
  ensureCraft41(S);
  const stationId = skill==='kochen'?'kitchen':skill==='alchemie'?'alchemy':'forge';
  const st=S.craft40.stations[stationId];
  if(!st?.unlocked && skill!=='kochen'){
    // kitchen always; others need unlock first via midgame
    C40.syncCraftProgress(S);
  }
  if(skill!=='kochen' && !S.craft40.stations[stationId]?.unlocked){
    return { ok:false, text:`Station für ${skill} noch gesperrt.` };
  }
  const gold = skill==='alchemie'?8:5;
  if((S.st?.gold|0)<gold) return { ok:false, text:'Nicht genug Gil für Training.' };
  S.st.gold-=gold;
  const r=grantCraftXp(S, skill, 12 + Math.min(20, (S.st?.lvl|1)), 'training');
  return { ok:true, text:`Training ${skill}: Stufe ${r.lvl}${r.leveled?' (aufgestiegen!)':''} · XP ${r.xp}/${r.need||'—'} (−${gold} Gil)`, ...r };
}

/** Replace sync that auto-maxed skills: stations unlock by progress; skills grow via XP. */
export function syncCraftProgress41(S){
  ensureCraft41(S);
  const tier=C39.gearTierAvailable(S);
  const lvl=S.st?.lvl||1;
  const jobs=S.jobs?.unlocked||[];
  if(lvl>=3 || tier>=2) C40.unlockStation(S,'forge','fortschritt');
  if(tier>=2 || jobs.includes('monch') || jobs.includes('beschwoerer')) C40.unlockStation(S,'alchemy','fortschritt');
  if((S.content39?.clearedDungeons||[]).length) C40.unlockStation(S,'forge','dungeon');
  // Floor only: unlocked station ⇒ skill at least 1 (not jump to tier)
  if(S.craft40.stations.forge?.unlocked && !(S.craft40.skills.schmieden|0)) C40.grantCraftSkill(S,'schmieden',1);
  if(S.craft40.stations.alchemy?.unlocked && !(S.craft40.skills.alchemie|0)) C40.grantCraftSkill(S,'alchemie',1);
  if(!(S.craft40.skills.kochen|0)) C40.grantCraftSkill(S,'kochen',1);
  return S.craft40;
}

export function canCraftRecipe41(S, recipeId, kind='craft'){
  ensureCraft41(S);
  syncCraftProgress41(S);
  return C40.canCraftRecipe(S, recipeId, kind);
}

/* ---- Tilemap dungeon minimap (real tiles) ---- */
export function buildDungeonTilemap(S){
  const d=S.content39?.dungeon;
  if(!d) return null;
  const rooms=d.rooms||[];
  const n=Math.max(1, rooms.length);
  // Layout: horizontal corridor of rooms, each 5x5, gap 1 wall, outer wall border
  const rw=5, rh=5, gap=1;
  const w = 2 + n*rw + (n-1)*gap;
  const h = 2 + rh;
  const tiles=Array.from({length:h},()=>Array(w).fill('void'));
  const roomMeta=[];
  for(let i=0;i<n;i++){
    const ox=1 + i*(rw+gap);
    const oy=1;
    const type=rooms[i]?.type||'path';
    for(let y=0;y<rh;y++) for(let x=0;x<rw;x++){
      let t='floor';
      if(y===0||y===rh-1||x===0||x===rw-1) t='wall';
      if(type==='boss' && y>0&&y<rh-1&&x>0&&x<rw-1) t='carpet';
      if(type==='loot' && x===2&&y===2) t='stone';
      if(type==='trap' && (x+y)%2===0 && y>0&&y<rh-1&&x>0&&x<rw-1) t='ruin';
      if(type==='puzzle' && x===2&&y===2) t='door';
      if(type==='combat' && y>0&&y<rh-1&&x>0&&x<rw-1) t='path';
      tiles[oy+y][ox+x]=t;
    }
    // corridor doors between rooms
    if(i<n-1){
      const doorY=oy+Math.floor(rh/2);
      const doorX=ox+rw;
      for(let g=0;g<gap;g++){
        tiles[doorY][doorX+g]='path';
        if(doorY-1>=0) tiles[doorY-1][doorX+g]='wall';
        if(doorY+1<h) tiles[doorY+1][doorX+g]='wall';
      }
    }
    roomMeta.push({ i, ox, oy, rw, rh, type, cx:ox+Math.floor(rw/2), cy:oy+Math.floor(rh/2) });
  }
  // outer border already void; seal edges as wall where adjacent to floor
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){
    if(tiles[y][x]==='void'){
      const near=[[0,1],[0,-1],[1,0],[-1,0]].some(([dx,dy])=>{
        const yy=y+dy,xx=x+dx; return yy>=0&&yy<h&&xx>=0&&xx<w&&tiles[yy][xx]!=='void'&&tiles[yy][xx]!=='wall';
      });
      if(near) tiles[y][x]='wall';
    }
  }
  const cur=Math.min(n-1, Math.max(0, d.room|0));
  const hero={ x:roomMeta[cur].cx, y:roomMeta[cur].cy };
  const map={ w, h, tiles, rooms:roomMeta, hero, name:d.name||'Dungeon', cur, tileSrc:{...TILE_SRC} };
  S.content39.dungeonTilemap = map;
  return map;
}

const _tileImgCache={};
function tileImg(src){
  if(typeof Image==='undefined') return null;
  if(_tileImgCache[src]) return _tileImgCache[src];
  const im=new Image(); im.src=src; _tileImgCache[src]=im; return im;
}

export function renderDungeonMinimap(host, S){
  const d=S.content39?.dungeon;
  if(!host) return null;
  if(!d){ host.classList.add('hidden'); host.innerHTML=''; return null; }
  host.classList.remove('hidden');
  const map = S.content39.dungeonTilemap && S.content39.dungeonTilemap.name===d.name
    ? S.content39.dungeonTilemap
    : buildDungeonTilemap(S);
  if(!map){ host.innerHTML=''; return null; }
  // refresh hero cell
  const cur=Math.min(map.rooms.length-1, Math.max(0, d.room|0));
  map.cur=cur;
  map.hero={ x:map.rooms[cur].cx, y:map.rooms[cur].cy };

  const scale=10;
  const W=map.w*scale, H=map.h*scale;
  host.innerHTML=`<div class="dungeon-mm tilemap-mm">
    <div class="mm-title">${map.name||'Dungeon'}</div>
    <canvas class="mm-canvas" width="${W}" height="${H}" style="width:${W}px;height:${H}px;image-rendering:pixelated"></canvas>
    <div class="mm-legend">Kachelkarte · Raum ${cur+1}/${map.rooms.length} · ${(map.rooms[cur].type||'?')}</div>
  </div>`;
  const canvas=host.querySelector('canvas');
  const ctx=canvas.getContext('2d');
  ctx.imageSmoothingEnabled=false;
  // draw tiles (fallback colors if image not ready)
  const colors={ floor:'#3a3344', wall:'#1a1520', path:'#5a4a3a', door:'#8a6230', stone:'#6a6a72', void:'#0a0810', ruin:'#4a3030', carpet:'#5a2040', water:'#203858' };
  for(let y=0;y<map.h;y++) for(let x=0;x<map.w;x++){
    const t=map.tiles[y][x];
    ctx.fillStyle=colors[t]||'#222';
    ctx.fillRect(x*scale,y*scale,scale,scale);
    const src=map.tileSrc[t];
    if(src){
      const im=tileImg(src);
      if(im && im.complete && im.naturalWidth){
        ctx.drawImage(im, x*scale, y*scale, scale, scale);
      } else if(im){
        im.onload=()=>{ try{
          // redraw this cell when loaded
          ctx.drawImage(im, x*scale, y*scale, scale, scale);
          // hero on top
          ctx.fillStyle='#6cf';
          ctx.fillRect(map.hero.x*scale+2, map.hero.y*scale+2, scale-4, scale-4);
        }catch(_){} };
      }
    }
  }
  // mark cleared rooms dimly
  map.rooms.forEach((rm,i)=>{
    if(i<cur || d.rooms?.[i]?.done){
      ctx.fillStyle='rgba(0,0,0,0.25)';
      ctx.fillRect(rm.ox*scale, rm.oy*scale, rm.rw*scale, rm.rh*scale);
    }
  });
  // hero
  ctx.fillStyle='#6cf';
  ctx.fillRect(map.hero.x*scale+2, map.hero.y*scale+2, scale-4, scale-4);
  ctx.strokeStyle='#fff'; ctx.lineWidth=1;
  ctx.strokeRect(map.hero.x*scale+1.5, map.hero.y*scale+1.5, scale-3, scale-3);
  // boss room marker
  map.rooms.forEach(rm=>{
    if(rm.type==='boss'){
      ctx.fillStyle='#f66';
      ctx.fillRect(rm.cx*scale+3, rm.cy*scale+3, scale-6, scale-6);
    }
  });
  return host;
}

export function ensureMinimapDom(){ return C40.ensureMinimapDom(); }
export function refreshMinimap(S){
  try{ renderDungeonMinimap(ensureMinimapDom(), S); }catch(_){}
}
export function onDungeonEnterHook(S){
  buildDungeonTilemap(S);
  refreshMinimap(S);
}
export function onDungeonLeaveHook(S){
  try{ delete S.content39.dungeonTilemap; }catch(_){}
  refreshMinimap(S);
}

export function migrateV41(S){
  C40.migrateV40(S);
  ensureCraft41(S);
  syncCraftProgress41(S);
  // strip auto-granted high skills from v40 sync if no XP path yet — keep floors only if player never trained
  // If skill jumped to tier without xp, convert excess into XP progress toward next (preserve progress feel)
  const c=S.craft40;
  for(const sk of ['schmieden','kochen','alchemie']){
    const lvl=c.skills[sk]|0;
    if(lvl>1 && !(c.skillXp[sk]|0) && !c._xpMigrated){
      // keep level (player earned via old sync) but mark migrated; further growth needs XP
      c.skillXp[sk]=0;
    }
  }
  c._xpMigrated=1;
  if(S.content39?.dungeon) buildDungeonTilemap(S);
  S.ver=41;
  return S;
}

export default {
  BOSS_EXPECTED_LVL, bossScaleForLevel,
  bossDialogueChoices, resolveBossDialogue,
  CRAFT_XP_TO_NEXT, ensureCraft41, grantCraftXp, trainCraftSkill, syncCraftProgress41, canCraftRecipe41,
  buildDungeonTilemap, renderDungeonMinimap, ensureMinimapDom, refreshMinimap,
  onDungeonEnterHook, onDungeonLeaveHook, migrateV41, TILE_SRC,
};
