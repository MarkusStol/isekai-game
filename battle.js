/** v17 JRPG battle — ATB Active/Wait, Bruch/Stagger, jobs, gems, summons, gambits; free-choice + mercy preserved */
import { ENEMIES, ELEM_LABEL, enemyById, pickEncounter, battleBgFor, designEncounter, storyBossBlurb } from './enemies.js';
import * as Jrpg from './jrpg.js';
import * as Jobs from './jobs.js';
import * as Gems from './gems.js';
import * as Summons from './summons.js';
import * as Equip from './equip.js';
import * as V25 from './visual25d.js';

const R=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function isBerserkActor(u){return Jrpg.isBerserk(u)}
function showSkillBanner(name, elem){ if(!_B)return; _B.skillBanner=name; const el=document.getElementById('skillBanner'); if(el){el.textContent=name; el.classList.add('on'); clearTimeout(el._t); el._t=setTimeout(()=>el.classList.remove('on'),900)} try{ const fx=document.getElementById('battleFx'); if(fx){ const d=document.createElement('div'); d.className='spell-fx spell-cast spell-'+(elem||'arcane'); d.style.left='40%'; d.style.top='35%'; fx.appendChild(d); setTimeout(()=>d.remove(),800);} }catch(_){} }

/* ---- Skill catalog (maps leveling tree + combat skills) ---- */
export const COMBAT_SKILLS={
  Hieb:{name:'Hieb',mp:0,pow:1.15,elem:'phys',tree:'kampf'},
  Parade:{name:'Parade',mp:0,pow:0,defend:1.5,tree:'kampf'},
  Komboschlag:{name:'Komboschlag',mp:4,pow:1.45,elem:'phys',tree:'kampf'},
  Finisher:{name:'Finisher',mp:8,pow:2.0,elem:'phys',critBonus:.25,tree:'kampf'},
  Funke:{name:'Funke',mp:5,pow:1.35,elem:'feuer',tree:'magie'},
  Schild:{name:'Schild',mp:6,pow:0,status:'schild',self:true,tree:'magie'},
  Nova:{name:'Nova',mp:14,pow:1.55,elem:'licht',aoe:true,tree:'magie'},
  Teleport:{name:'Teleport',mp:8,pow:0,fleeBonus:.35,tree:'magie'},
  Inspiration:{name:'Inspiration',mp:6,pow:0,status:'staerkung',self:true,aoeParty:true,tree:'sozial'},
  'Erste Hilfe':{name:'Erste Hilfe',mp:4,heal:32,tree:'ueberleben'},
  Einschüchtern:{name:'Einschüchtern',mp:3,pow:0,status:'betaeubt',statusChance:.4,tree:'sozial'},
  // Limit
  Overdrive:{name:'Overdrive',mp:0,limit:true,pow:2.6,elem:'phys',aoe:true},
  Arkaner_Limit:{name:'Arkaner Limit',mp:0,limit:true,pow:2.4,elem:'licht',aoe:true},
};

function skillFromProgress(S){
  const list=[];
  for(const sk of (S.progress?.unlockedSkills||[])){
    const name=typeof sk==='string'?sk:sk.name;
    const def=COMBAT_SKILLS[name]||{name,mp:sk.cost||5,pow:1.2,elem:'phys'};
    list.push({...def,name});
  }
  for(const sk of (S.skills||[])){
    const name=typeof sk==='string'?sk:sk.name;
    if(list.some(x=>x.name===name))continue;
    const def=COMBAT_SKILLS[name]||{name,mp:(typeof sk==='object'?sk.cost:5)||5,pow:1.2,elem:'phys'};
    list.push({...def,name});
  }
  if(!list.length) list.push({...COMBAT_SKILLS.Hieb},{...COMBAT_SKILLS.Funke});
  return list.slice(0,8);
}

/* ---- Party helpers ---- */
export function buildParty(S){
  const p=S.progress||{};
  const attrs=p.attrs||{str:5,dex:5,int:5,wil:5,cha:5,vit:5};
  Jobs.ensureJobs(S); Gems.ensureGems(S); Summons.ensureSummons(S); Equip.ensureEquip(S);
  const jb=Jobs.jobStatBonus(S); const eq=Equip.equippedStats(S);
  const gemLoad=Gems.resolveLoadoutGems(S,{sockets:eq.sockets});
  const jobSkills=Jobs.availableAbilities(S).map(a=>({...a}));
  const hero={
    id:'hero', kind:'hero', name:S.pc?.name||'Du',
    hp:Math.max(1,(S.st.hp|0)+jb.hp+eq.hp), maxhp:(S.st.maxhp|100)+jb.hp+eq.hp,
    mp:(S.st.mp|0)+jb.mp+eq.mp, maxmp:(S.st.maxmp|40)+jb.mp+eq.mp,
    atk:8+(attrs.str|0)+(S.st.str|0)/3|0+jb.atk+eq.atk,
    def:5+(attrs.vit|0)/2|0+jb.def+eq.def,
    mag:6+(attrs.int|0)+jb.mag+eq.mag,
    spd:8+(attrs.dex|0)/2|0+jb.spd+eq.spd,
    crit:eq.crit||0, row:S.battle?.row||'front',
    limit:S.battle?.limit|0, maxLimit:100, limitTier:S.battle?.limitTier||1, limitAcc:S.battle?.limitAcc|0,
    skills:[...jobSkills, ...skillFromProgress(S).filter(s=>!jobSkills.some(j=>j.name===s.name)), ...gemLoad.spells].slice(0,14),
    gemLinks:gemLoad.links||[], job:S.jobs.active,
    portrait:null,
    statuses:[], guard:1, alive:true, aggro:1,
    gambits:S.battle?.gambits||Jrpg.defaultGambits()
  };
  const comps=[];
  const romance=S.romance||{};
  const known=Object.keys(S.world?.npcs||{}).filter(n=>{
    const r=romance[n];
    return r && ((r.stage|0)>=2 || (r.affection|0)>=25) && S.world.npcs[n]?.alive!==false;
  }).slice(0,2);
  // also party flag
  for(const n of (S.party||[]).concat(known)){
    if(comps.some(c=>c.name===n)||n===hero.name)continue;
    const npc=S.world.npcs[n]; if(!npc||npc.alive===false)continue;
    const aff=(romance[n]?.affection|0);
    comps.push({
      id:'c_'+n, kind:'companion', name:n,
      hp:60+Math.min(40,aff), maxhp:60+Math.min(40,aff),
      mp:20+Math.min(20,aff/2|0), maxmp:20+Math.min(20,aff/2|0),
      atk:8+Math.min(10,aff/10|0), def:5, mag:7, spd:9,
      limit:0, maxLimit:100, limitTier:1, limitAcc:0,
      skills:companionSkills(npc),
      portrait:null, npcRef:n, row:'back',
      statuses:[], guard:1, alive:true, aggro:0.8,
      gambits:Jrpg.defaultGambits()
    });
    if(comps.length>=2)break;
  }
  return [hero,...comps];
}

function companionSkills(npc){
  const art=String(npc?.art||npc?.stimme||'').toLowerCase();
  if(/mag|zauber|hex/.test(art)) return [{name:'Funke',...COMBAT_SKILLS.Funke},{name:'Schild',...COMBAT_SKILLS.Schild}];
  if(/heil|priester|arzt/.test(art)) return [{name:'Erste Hilfe',...COMBAT_SKILLS['Erste Hilfe']},{name:'Schild',...COMBAT_SKILLS.Schild}];
  if(/dieb|assass|schleich/.test(art)) return [{name:'Hieb',...COMBAT_SKILLS.Hieb},{name:'Komboschlag',...COMBAT_SKILLS.Komboschlag}];
  return [{name:'Hieb',...COMBAT_SKILLS.Hieb},{name:'Inspiration',...COMBAT_SKILLS.Inspiration}];
}

function spawnFoes(defs, S){
  const diff=Jrpg.difficultyOf(S||{});
  return defs.map((d,i)=>{
    const f={
      ...d,
      _iid:d._iid||(d.id+'_'+i),
      hp:Math.round((d.hp||40)*diff.enemyHp), maxhp:Math.round((d.hp||40)*diff.enemyHp),
      mp:d.mp|0, maxmp:d.mp|0,
      statuses:[], guard:1, alive:true, analyzed:false,
      atb:Math.random()*40, phaseIdx:0, aggroMap:{},
      def:d.def|4, _baseDef:d.def|4, atk:d.atk|10, mag:d.mag|5, spd:d.spd|8
    };
    Jrpg.initStagger(f);
    return f;
  });
}

/** Story NPCs in world.npcs (or tagged _storyNpc) get a mercy choice at 0 HP. Generic monsters die. */
export function storyNpcName(foe){
  if(!foe) return null;
  if(foe._storyNpc) return foe._storyNpc;
  return foe.name||null;
}
export function isStoryNpcFoe(foe, S){
  const name=storyNpcName(foe);
  if(!name) return false;
  if(foe._storyNpc) return true;
  const npc=S?.world?.npcs?.[name];
  return !!(npc && npc.alive!==false && !npc.dead);
}
export function mercyNeeded(foe, S){
  return !!(foe && isStoryNpcFoe(foe,S) && !foe._mercyResolved);
}

/**
 * Apply Finish / Spare / Knock-out. Finish → killNPC (permanent death, crime, grief, ledger).
 * Never auto-called; only after player choice.
 */
export function applyMercyDecision(S, foe, choice, hooks={}){
  if(!foe) return {ok:false};
  const name=storyNpcName(foe);
  const ch=String(choice||'').toLowerCase();
  const killFn=hooks.killNPC||(typeof window!=='undefined'?window.__game?.killNPC:null);
  const addMem=hooks.addMemory||(typeof window!=='undefined'?window.__game?.addMemory:null);
  const Sim=hooks.Sim||(typeof window!=='undefined'?window.__game?.Sim:null);
  const npc=name && S?.world?.npcs?.[name];

  if(ch==='finish'||ch==='kill'||ch==='töten'||ch==='toeten'){
    foe._ended='killed'; foe.alive=false; foe.hp=0; foe._mercyResolved=true;
    let killOk=false;
    if(name && killFn){
      try{
        const r=killFn(name,{cause:'Im Kampf getötet'});
        killOk=!!(r&&r.ok!==false);
        foe._killApplied=killOk;
        if(killOk) try{addMem?.(name,'(tot)','Tod')}catch(_){}
      }catch(e){ foe._killApplied=false }
    } else if(name && Sim?.killPermanent){
      try{
        const r=Sim.killPermanent(S,name,{where:S.world?.scene?.ort, cause:'Im Kampf getötet', killer:S.pc?.name||'Du'});
        killOk=!!r?.ok; foe._killApplied=killOk;
      }catch(_){}
    }
    try{Sim?.ledgerPush?.(S,{type:'battle_mercy',who:S.pc?.name||'Du',what:`Im Kampf getötet (Finish): ${name||foe.name}.`,where:S.world?.scene?.ort,importance:85,emotion:'kalt',meta:{mercy:'finish',foe:name||foe.name}})}catch(_){}
    return {ok:true, choice:'finish', killed:true, name, killOk};
  }

  if(ch==='spare'||ch==='verschonen'||ch==='begnadigen'){
    foe._ended='spared'; foe.alive=false; foe.hp=Math.max(1, foe.hp|0); foe._mercyResolved=true;
    if(npc){ npc.mood='verschont'; npc.alive=true; delete npc.dead }
    rememberSocial(S, foe, 'spare');
    try{addMem?.(name, 'Du hast mich im Kampf verschont.', 'Gnade')}catch(_){}
    try{Sim?.ledgerPush?.(S,{type:'battle_mercy',who:S.pc?.name||'Du',what:`Verschont: ${name||foe.name}.`,where:S.world?.scene?.ort,importance:55,emotion:'hoffnungsvoll',meta:{mercy:'spare',foe:name||foe.name}})}catch(_){}
    return {ok:true, choice:'spare', killed:false, name};
  }

  // default: knock out
  foe._ended='ko'; foe.alive=false; foe.hp=Math.max(1, foe.hp|0); foe._mercyResolved=true;
  if(npc){ npc.mood='bewusstlos'; npc.alive=true; delete npc.dead }
  rememberSocial(S, foe, 'ko');
  try{addMem?.(name, 'Du hast mich bewusstlos geschlagen — ich lebe noch.', 'Kampf')}catch(_){}
  try{Sim?.ledgerPush?.(S,{type:'battle_mercy',who:S.pc?.name||'Du',what:`Niedergeschlagen (KO): ${name||foe.name}.`,where:S.world?.scene?.ort,importance:45,emotion:'angespannt',meta:{mercy:'ko',foe:name||foe.name}})}catch(_){}
  return {ok:true, choice:'ko', killed:false, name};
}

function enqueueMercy(foe){
  if(!_B||!foe||foe._mercyResolved) return;
  _B.mercyQueue=_B.mercyQueue||[];
  if(!_B.mercyQueue.includes(foe._iid)) _B.mercyQueue.push(foe._iid);
  foe._downed=true;
}

function drainMercyQueue(){
  if(!_B||_B.done) return false;
  const q=_B.mercyQueue||[];
  while(q.length){
    const iid=q[0];
    const foe=_B.foes.find(f=>f._iid===iid);
    if(!foe || foe._mercyResolved){ q.shift(); continue }
    showMercySheet(foe);
    return true;
  }
  return false;
}

function showMercySheet(foe){
  if(!_B) return;
  _B.mercyActive=true;
  _B.selecting=null;
  const name=storyNpcName(foe)||foe.name;
  const cmd=el('battleCmd');
  const log=el('battleLog');
  if(log){
    _B.log.push(`${name} liegt am Boden — du entscheidest.`);
    log.innerHTML=_B.log.slice(-4).map(l=>`<div>${l}</div>`).join('');
  }
  // overlay card on battle root
  let sheet=el('mercySheet');
  const root=ensureRoot();
  if(!sheet){
    sheet=document.createElement('div');
    sheet.id='mercySheet';
    root.appendChild(sheet);
  }
  sheet.className='mercy-sheet';
  sheet.innerHTML=`
    <div class="mercy-card">
      <div class="encounter-badge">Entscheidung</div>
      <p><b>${name}</b> ist kampfunfähig. Was tust du?</p>
      <div class="encounter-cmds">
        <button type="button" class="bcm accent" data-m="finish">Finish — töten</button>
        <button type="button" class="bcm social" data-m="spare">Verschonen</button>
        <button type="button" class="bcm" data-m="ko">Niederschlagen (KO)</button>
      </div>
      <form class="battle-free" id="mercyFree"><input name="t" placeholder="Freitext: töten, verschonen, KO…" autocomplete="off"/><button type="submit">➤</button></form>
      <p class="meta">Permanenter Tod nur bei Finish — Zeugen, Trauer, Ledger, Fahndung.</p>
    </div>`;
  if(cmd) cmd.innerHTML=`<div class="battle-pick">Entscheidung über ${name}</div>`;
  const pick=(choice)=>{
    applyMercyDecision(_B.S, foe, choice);
    const label=choice==='finish'?'getötet (Finish)':choice==='spare'?'verschont':'niedergeschlagen (KO)';
    _B.log.push(`${name}: ${label}.`);
    sheet.remove();
    _B.mercyActive=false;
    (_B.mercyQueue||[]).shift();
    refreshUI();
    if(drainMercyQueue()) return;
    checkEnd();
    if(_B && !_B.done){
      refreshUI();
      requestAnimationFrame(()=>setTimeout(()=>advanceUntilPlayer(),180));
    }
  };
  sheet.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>pick(b.dataset.m));
  const f=sheet.querySelector('#mercyFree');
  if(f) f.onsubmit=(ev)=>{
    ev.preventDefault();
    const t=f.t.value.trim().toLowerCase();
    let c='ko';
    if(/töt|kill|finish|hinricht|mord|umbring|ersterche/.test(t)) c='finish';
    else if(/verschon|begnad|lass(t)? leben|schon|spare/.test(t)) c='spare';
    else if(/ko|knock|bewusstlos|niederschlag|betäub/.test(t)) c='ko';
    pick(c);
  };
}

/* ---- Damage / status ---- */
function elemMult(target, elem){
  if(!elem||elem==='phys'){
    if(target.weak?.includes('phys')) return 1.5;
    if(target.resist?.includes('phys')) return 0.6;
    return 1;
  }
  if(target.immune?.includes(elem)) return 0;
  if(target.weak?.includes(elem)) return 1.75;
  if(target.resist?.includes(elem)) return 0.5;
  return 1;
}

function rollDamage(attacker, target, skill){
  const pow=skill.pow||1;
  const mag=/feuer|eis|blitz|wind|licht|schatten|gift|techno/.test(skill.elem||'');
  const base=mag?(attacker.mag||6):(attacker.atk||8);
  const def=mag?(target.def||4)*0.6:(target.def||4);
  let raw=(base*pow - def*0.5) * (0.9+Math.random()*0.25);
  raw*=elemMult(target, skill.elem);
  raw*=(target.guard||1);
  if(attacker.statuses?.some(s=>s.id==='staerkung')) raw*=1.25;
  const critChance=.08+(skill.critBonus||0)+(attacker.spd||0)/200;
  const crit=Math.random()<critChance;
  if(crit) raw*=1.75;
  const dmg=Math.max(1, Math.round(raw));
  return {dmg, crit, weak:elemMult(target,skill.elem)>=1.5, immune:elemMult(target,skill.elem)===0};
}

function applyStatus(unit, id, turns=3){
  if(!id)return;
  if(unit.immune?.includes(id))return;
  unit.statuses=unit.statuses||[];
  const ex=unit.statuses.find(s=>s.id===id);
  if(ex) ex.turns=Math.max(ex.turns,turns);
  else unit.statuses.push({id,turns});
}

function tickStatuses(unit, log){
  if(!unit.alive)return;
  unit.statuses=(unit.statuses||[]).map(s=>{
    if(s.id==='gift'){ const d=Math.max(1,unit.maxhp*0.06|0); unit.hp=Math.max(0,unit.hp-d); log(`${unit.name} erleidet Gift (${d}).`); }
    if(s.id==='brand'){ const d=Math.max(1,unit.maxhp*0.07|0); unit.hp=Math.max(0,unit.hp-d); log(`${unit.name} brennt (${d}).`); }
    if(s.id==='blutung'){ const d=Math.max(1,unit.maxhp*0.05|0); unit.hp=Math.max(0,unit.hp-d); log(`${unit.name} blutet (${d}).`); }
    if(s.id==='regeneration'){ const h=Math.max(1,unit.maxhp*0.08|0); unit.hp=Math.min(unit.maxhp,unit.hp+h); }
    s.turns--; return s;
  }).filter(s=>s.turns>0);
  if(unit.hp<=0){
    unit.alive=false; unit.hp=0;
    if(_B && mercyNeeded(unit, _B.S) && unit.kind!=='hero' && unit.kind!=='companion'){
      log(`${unit.name} fällt — Entscheidung steht aus.`);
      enqueueMercy(unit);
    } else {
      if(!unit._ended) unit._ended='killed';
      log(`${unit.name} fällt!`);
    }
  }
  unit.guard=1;
}

function canAct(unit){
  if(!unit.alive)return false;
  if((unit.statuses||[]).some(s=>s.id==='schlaf'||s.id==='betaeubt')) return false;
  return true;
}

/* ---- Battle state machine ---- */
let _B=null; // active battle
let _music=null;

export function isActive(){return !!_B && !_B.done}
export function getBattle(){return _B}


function playBattleSwirl(){
  return new Promise(res=>{
    let el=document.getElementById('battleSwirl');
    if(!el){
      el=document.createElement('div'); el.id='battleSwirl'; el.className='battle-swirl';
      document.body.appendChild(el);
    }
    el.classList.remove('hidden'); el.classList.add('on');
    try{ window.__game?.Aud?.playSfx?.('alert', 0.5); }catch(_){}
    setTimeout(()=>{ el.classList.remove('on'); el.classList.add('hidden'); res(); }, 720);
  });
}
export function startBattle(S, opts={}){
  try{ playBattleSwirl(); }catch(_){}
  try{ window.__game?.Aud?.fadeTo?.('battle'); }catch(_){}

  const foes=opts.enemies?.length?spawnFoes(opts.enemies,S):spawnFoes(pickEncounter(S,{count:opts.count,boss:opts.boss,noBoss:opts.noBoss}),S);
  if(!foes.length) return null;
  const party=buildParty(S);
  // sync portrait urls if provided
  if(opts.heroPortrait) party[0].portrait=opts.heroPortrait;
  if(opts.companionPortraits){
    for(const c of party){ if(c.npcRef && opts.companionPortraits[c.npcRef]) c.portrait=opts.companionPortraits[c.npcRef]}
  }
  for(const f of foes){ if(!f.art || f.art.startsWith('assets/')){ /* keep */ } }
  _B={
    S, party, foes,
    bg:opts.bg||battleBgFor(S),
    turn:0, done:false, result:null,
    log:[`Kampf gegen ${foes.map(f=>f.name).join(', ')}!`],
    queue:[],
    selecting:null,
    escaped:false, analyzed:{},
    onEnd:opts.onEnd||null,
    startedAt:Date.now(),
    atbMode:(opts.atbMode||S.cfgAtbMode||S.flags?.atbMode||'active'), // active|wait
    _waiting:false,
    skillBanner:null,
    victoryRewards:null
  };
  // init ATB
  for(const u of [...party,...foes]) u.atb=Math.random()*30+(u.spd||8);
  renderBattleUI();
  startBattleMusic(S);
  advanceUntilPlayer();
  return _B;
}

function allUnits(){return [..._B.party,..._B.foes]}
function living(side){return side.filter(u=>u.alive)}

function advanceUntilPlayer(){
  if(!_B||_B.done)return;
  // tick ATB until someone ready
  let guard=0;
  while(guard++<200){
    if(_B.done)return;
    // find ready
    const ready=allUnits().filter(u=>u.alive && (u.atb|0)>=100).sort((a,b)=>b.atb-a.atb);
    if(ready.length){
      const actor=ready[0];
      actor.atb=0;
      if(actor.kind==='hero'||actor.kind==='companion'){
        if(!canAct(actor)){
          _B.log.push(`${actor.name} kann nicht handeln.`);
          // consume sleep/stun turn
          for(const s of (actor.statuses||[])){ if(s.id==='schlaf'||s.id==='betaeubt') s.turns-- }
          actor.statuses=(actor.statuses||[]).filter(s=>s.turns>0);
          tickStatuses(actor, m=>_B.log.push(m));
          refreshUI();
          continue;
        }
        if(actor.kind==='companion'){
          if(isBerserkActor(actor)){ doAttack(actor, living(_B.foes)[0]?._iid); afterAction(); continue }
          aiCompanion(actor);
          afterAction();
          continue;
        }
        // player
        _B.selecting={actor, mode:'main'};
        refreshUI();
        return;
      } else {
        aiEnemy(actor);
        afterAction();
        continue;
      }
    }
    // advance clocks (Wait: freeze while player menu open)
    if(_B.atbMode==='wait' && _B.selecting) continue;
    for(const u of allUnits()){
      if(!u.alive)continue;
      const spd=(u.spd||8)*Jrpg.statusSpdMult(u);
      u.atb=(u.atb||0)+Math.max(2.5, spd*0.85);
    }
  }
}

function afterAction(){
  if(!_B)return;
  if(_B.mercyActive) return;
  if(drainMercyQueue()) return;
  checkEnd();
  if(_B.done)return;
  refreshUI();
  requestAnimationFrame(()=>setTimeout(()=>advanceUntilPlayer(),180));
}

function checkEnd(){
  if(!_B||_B.done)return;
  if(_B.mercyActive || (_B.mercyQueue&&_B.mercyQueue.length)) return;
  if(!living(_B.foes).length){ finish('win'); return }
  if(!living(_B.party).length || !_B.party[0].alive){ finish('lose'); return }
}

function finish(result){
  if(!_B||_B.done)return;
  _B.done=true; _B.result=result;
  stopBattleMusic();
  const summary=buildSummary(result);
  showEndScreen(result, summary);
  // apply to S after short delay so UI shows
  const B=_B;
  setTimeout(()=>{
    applyRewards(B, result, summary);
    const cb=B.onEnd;
    hideBattleUI();
    _B=null;
    if(cb) cb(summary);
  }, result==='flee'?600:1600);
}

function buildSummary(result){
  const B=_B;
  const killed=B.foes.filter(f=>!f.alive && (f._ended==='killed'||f._ended==='auto_win'||(!f._ended && (f.hp<=0))) && f._ended!=='spared' && f._ended!=='ko' && f._ended!=='surrender' && f._ended!=='fled' && f._ended!=='auto_flee' && !f._surrendered);
  const spared=B.foes.filter(f=>f._ended==='spared'||f._ended==='ko'||f._surrendered||f._ended==='surrender'||f._ended==='fled');
  const humans=killed.filter(f=>f.human||f._storyNpc);
  const xp=killed.reduce((s,f)=>s+(f.exp||0),0);
  const gold=killed.reduce((s,f)=>s+(f.gold||0),0);
  const loot=[];
  for(const f of killed){
    for(const L of (f.loot||[])){
      if(Math.random()<(L.chance||0.3)) loot.push({name:L.name,icon:L.icon||'📦',desc:'Beute',type:L.type||'misc',rarity:'uncommon'});
    }
  }
  return {
    result,
    text: result==='win'?`Sieg! ${killed.map(f=>f.name).join(', ')||'Gegner'} besiegt.${spared.length?' (Verschont: '+spared.map(f=>f.name).join(', ')+')':''}`
      : result==='surrender'?`Ihr kapituliert.`
      : result==='flee'?`Der Konflikt endet ohne Blutbad.${spared.length?' '+spared.map(f=>f.name).join(', ')+'.':''}`
      : `Niederlage. Die Gruppe sinkt zu Boden.`,
    xp, gold, loot, ap:Math.max(8, Math.round(xp/4)),
    killed:killed.map(f=>({id:f.id,name:f.name,human:!!f.human})),
    humansKilled:humans.map(f=>f.name),
    analyzed:Object.keys(B.analyzed||{}), spared:spared.map(f=>({id:f.id,name:f.name,human:!!f.human,ended:f._ended})),
    partyHP:B.party.map(p=>({name:p.name,hp:p.hp,maxhp:p.maxhp,alive:p.alive,npcRef:p.npcRef})),
    log:B.log.slice(-12),
    durationMs:Date.now()-B.startedAt,
    learned:[]
  };
}

function applyRewards(B, result, summary){
  const S=B.S; if(!S)return;
  S.battle=S.battle||{};
  S.battle.limit=B.party[0]?.limit|0;
  // sync hero HP/MP
  const hero=B.party[0];
  if(hero){
    S.st.hp=Math.max(1, hero.hp|0); // keep at least 1 unless story death elsewhere
    if(result==='lose') S.st.hp=Math.max(1, Math.floor((S.st.maxhp||100)*0.15));
    S.st.mp=clamp(hero.mp|0,0,S.st.maxmp|40);
  }
  // companions KO — not permadeath unless human enemy kill story; companions faint
  for(const c of B.party.slice(1)){
    if(c.npcRef && S.world?.npcs?.[c.npcRef]){
      S.world.npcs[c.npcRef]._battleHp=c.hp;
      if(!c.alive) S.world.npcs[c.npcRef].mood='erschöpft';
    }
  }
  if(result==='win'){
    S.st.gold=(S.st.gold|0)+(summary.gold|0);
    S.st.xp=(S.st.xp|0)+(summary.xp|0);
    try{
      const Level=window.__game?.Level;
      if(Level?.grantXP) Level.grantXP(S, summary.xp, 'Kampf'); else if(Level?.grantXp) Level.grantXp(S, summary.xp, 'Kampf');
      else {
        while(S.st.xp>=(S.st.lvl||1)*100){ S.st.xp-=(S.st.lvl||1)*100; S.st.lvl=(S.st.lvl||1)+1; }
      }
    }catch(_){}
    try{
      const learned=Jobs.grantJobAp(S, summary.ap||Math.max(8,Math.round((summary.xp||0)/4)));
      summary.learned=(learned||[]).map(a=>a.name);
      Gems.ensureGems(S); for(const g of S.gems.inventory) Gems.grantGemXp(g, Math.max(3, Math.round((summary.ap||8)/3)));
      S.battle=S.battle||{}; S.battle.limitTier=B.party[0]?.limitTier||1; S.battle.limitAcc=B.party[0]?.limitAcc|0;
    }catch(_){}
    for(const it of summary.loot){ S.inv=S.inv||[]; S.inv.push(it) }
    // skill-use XP already via grant
    try{
      const Codex=window.__game?.Codex;
      for(const k of summary.killed){
        if(Codex?.recordCreature) Codex.recordCreature(S,k.name,{danger:2,behavior:'im Kampf besiegt',habitat:S.world?.scene?.ort,imagePrompt:`anime JRPG enemy ${k.id||k.name}`,level:'studied'});
      }
      for(const id of summary.analyzed){
        const e=ENEMIES[id]; if(e&&Codex?.study) Codex.study(S,e.name,'bestiary');
      }
    }catch(_){}
    // Story NPC Finish already ran killNPC during mercy. Generic humanoids get heat. KO/spare already ledgered.
    try{
      const Sim=window.__game?.Sim;
      for(const f of B.foes){
        const name=storyNpcName(f)||f.name;
        if(f._ended==='killed' && f._killApplied) continue; // permanent death via killNPC done
        if(f._ended==='killed' && (f.human||f._storyNpc) && !S.world?.npcs?.[name]){
          if(Sim?.ledgerPush) Sim.ledgerPush(S,{type:'kill',who:S.pc?.name||'Du',what:`Im Kampf getötet: ${name}.`,where:S.world?.scene?.ort,importance:80,emotion:'kalt',meta:{battle:true,human:true}});
          S.heat=(S.heat|0)+8;
          S.wanted=S.wanted||[]; if(!S.wanted.includes(name)) S.wanted.push(name);
        }
      }
      if(summary.killed.length && Sim?.ledgerPush){
        Sim.ledgerPush(S,{type:'battle',who:S.pc?.name||'Du',what:summary.text,where:S.world?.scene?.ort,importance:50,emotion:'entschlossen',meta:{xp:summary.xp,loot:summary.loot.map(x=>x.name)}});
      }
    }catch(_){}
  } else if(result==='flee'){
    try{ window.__game?.Sim?.ledgerPush(S,{type:'battle',who:S.pc?.name||'Du',what:'Flucht aus dem Kampf.',where:S.world?.scene?.ort,importance:25,emotion:'angespannt'}) }catch(_){}
  } else {
    try{ window.__game?.Sim?.ledgerPush(S,{type:'battle',who:S.pc?.name||'Du',what:'Im Kampf unterlegen.',where:S.world?.scene?.ort,importance:60,emotion:'schmerz'}) }catch(_){}
  }
}

/* ---- Actions ---- */
export function playerCommand(cmd, payload={}){
  if(!_B||_B.done||!_B.selecting)return;
  const actor=_B.selecting.actor;
  if(cmd==='menu'){ _B.selecting={actor, mode:payload.mode||'main'}; refreshUI(); return }
  if(cmd==='attack'){ return doAttack(actor, payload.targetId) }
  if(cmd==='skill'){ return doSkill(actor, payload.skill, payload.targetId) }
  if(cmd==='item'){ return doItem(actor, payload.item, payload.targetId) }
  if(cmd==='defend'){ return doDefend(actor) }
  if(cmd==='flee'){ return doFlee(actor) }
  if(cmd==='analyze'){ return doAnalyze(actor, payload.targetId) }
  if(cmd==='limit'){ return doLimit(actor, payload.targetId) }
  if(cmd==='talk'){ return doTalk(actor, payload) }
  if(cmd==='spare'){ return doSpare(actor, payload.targetId) }
  if(cmd==='surrender'){ return doSurrender(actor) }
  if(cmd==='threaten'){ return doThreaten(actor, payload.targetId) }
  if(cmd==='auto'){ return doAutoResolve(actor) }
  if(cmd==='freetext'){ return doFreeText(actor, payload.text||'') }
  if(cmd==='mercy'){ return doMercyCmd(payload.choice, payload.targetId) }
  if(cmd==='summon'){ return doSummon(actor, payload.id) }
  if(cmd==='job'){ return doJobSwitch(actor, payload.job) }
  if(cmd==='steal'){ return doSteal(actor, payload.targetId) }
  if(cmd==='row'){ actor.row=actor.row==='front'?'back':'front'; _B.log.push(`${actor.name} → ${actor.row==='front'?'Vorder':'Hinter'}reihe`); refreshUI(); return }
  if(cmd==='atbMode'){ _B.atbMode=_B.atbMode==='active'?'wait':'active'; if(_B.S) _B.S.cfgAtbMode=_B.atbMode; _B.log.push('ATB: '+(_B.atbMode==='active'?'Aktiv':'Warten')); refreshUI(); return }
  if(cmd==='combo'){ return doTeamCombo(actor, payload.partnerId, payload.targetId) }
}

function doSummon(actor, id){
  const list=Summons.ownedSummons(_B.S); const sp=Summons.summonPower(_B.S, id)||list[0]&&Summons.summonPower(_B.S,list[0].id);
  if(!sp){ _B.log.push('Kein Sternengeist.'); refreshUI(); return }
  if(Jrpg.isSilenced(actor)){ _B.log.push('Stille — Beschwörung blockiert.'); refreshUI(); return }
  if((actor.mp|0)<sp.cost){ _B.log.push('Nicht genug MP für '+sp.name); refreshUI(); return }
  actor.mp-=sp.cost;
  showSkillBanner(sp.skillName);
  _B.log.push(`🌟 ${actor.name} ruft ${sp.name}: ${sp.skillName}!`);
  Summons.bondSummon(_B.S, sp.id, 12);
  shakeScreen();
  const targets=sp.aoe?living(_B.foes):[living(_B.foes)[0]].filter(Boolean);
  for(const t of targets) resolveHit(actor,t,{name:sp.skillName,pow:sp.pow,elem:sp.elem,status:sp.status,statusChance:sp.statusChance});
  if(sp.healParty) for(const p of living(_B.party)){ p.hp=Math.min(p.maxhp,p.hp+sp.healParty); popNumber(p,'+'+sp.healParty,'heal') }
  afterAction();
}
function doJobSwitch(actor, job){
  if(actor.kind!=='hero') return;
  const r=Jobs.switchJob(_B.S, job);
  _B.log.push(r.text||'Beruf?');
  if(r.ok){
    actor.job=job;
    const jb=Jobs.jobStatBonus(_B.S); const eq=Equip.equippedStats(_B.S);
    const gems=Gems.resolveLoadoutGems(_B.S,{sockets:eq.sockets});
    actor.skills=[...Jobs.availableAbilities(_B.S).map(a=>({...a})), ...gems.spells].slice(0,14);
    actor.atk=10+jb.atk+eq.atk; actor.def=6+jb.def+eq.def; actor.mag=8+jb.mag+eq.mag; actor.spd=10+jb.spd+eq.spd;
  }
  afterAction();
}
function doSteal(actor, targetId){
  const t=pickTarget(targetId,true); if(!t)return;
  showSkillBanner('Stehlen');
  const chance=clamp(0.35+(actor.spd||0)/80,0.15,0.75);
  if(Math.random()<chance && (t.steal||t.loot)?.length){
    const pool=t.steal||t.loot; const item=pool[Math.floor(Math.random()*pool.length)];
    _B.S.inv=_B.S.inv||[]; _B.S.inv.push({name:item.name,icon:item.icon||'📦',desc:'Gestohlen',type:item.type||'misc',rarity:'uncommon'});
    if(item.gem) Gems.addGem(_B.S, item.gem);
    _B.log.push(`${actor.name} stiehlt ${item.name}!`);
    t._stolen=true;
  } else _B.log.push('Diebstahl misslungen.');
  afterAction();
}
function doTeamCombo(actor, partnerId, targetId){
  const partner=_B.party.find(p=>(p._iid||p.id)===partnerId||p.name===partnerId)||_B.party[1];
  if(!partner||!Jrpg.teamComboReady(actor,partner,_B.S)){ _B.log.push('Kein Duett möglich (Bindung zu schwach).'); refreshUI(); return }
  if(!partner.alive){ _B.log.push('Partner kampfunfähig.'); refreshUI(); return }
  const sk=Jrpg.teamComboSkill(actor,partner);
  showSkillBanner(sk.name); shakeScreen();
  partner.atb=0;
  for(const t of living(_B.foes)) resolveHit(actor,t,sk);
  afterAction();
}
function doMercyCmd(choice, targetId){
  if(!_B) return;
  const foe=_B.foes.find(f=>f._iid===targetId||f.id===targetId||f.name===targetId)
    || _B.foes.find(f=>f._downed && !f._mercyResolved);
  if(!foe) return;
  applyMercyDecision(_B.S, foe, choice);
  const sheet=el('mercySheet'); if(sheet) sheet.remove();
  _B.mercyActive=false;
  (_B.mercyQueue||[]).shift();
  if(drainMercyQueue()) return;
  checkEnd();
  if(_B && !_B.done){
    refreshUI();
    requestAnimationFrame(()=>setTimeout(()=>advanceUntilPlayer(),180));
  }
}

function pickTarget(id, enemies=true){
  const side=enemies?_B.foes:_B.party;
  if(id){ const t=side.find(u=>u._iid===id||u.id===id||u.name===id); if(t&&t.alive)return t }
  return living(side)[0]||null;
}

function doAttack(actor, targetId){
  const t=pickTarget(targetId,true); if(!t)return;
  const skill={name:'Angriff',pow:1.0,elem:'phys'};
  resolveHit(actor,t,skill);
  afterAction();
}
function doSkill(actor, skill, targetId){
  if(!skill)return;
  const sk=typeof skill==='string'?(COMBAT_SKILLS[skill]||actor.skills.find(s=>s.name===skill)||{name:skill,pow:1.2,mp:4}):skill;
  if((sk.mp|0)>(actor.mp|0)){ _B.log.push('Nicht genug MP!'); refreshUI(); return }
  actor.mp-=sk.mp|0;
  if(sk.fleeBonus){ doFlee(actor, sk.fleeBonus); return }
  if(sk.defend){ doDefend(actor, sk.defend); return }
  if(sk.heal){
    const t=pickTarget(targetId,false)||actor;
    const h=sk.heal|0; t.hp=Math.min(t.maxhp,t.hp+h);
    _B.log.push(`${actor.name}: ${sk.name} — ${t.name} +${h} HP.`);
    popNumber(t,'+'+h,'heal'); flashUnit(t,'heal');
    afterAction(); return;
  }
  if(sk.self && sk.status){
    applyStatus(actor, sk.status, 3);
    if(sk.aoeParty) for(const p of living(_B.party)) applyStatus(p, sk.status, 3);
    _B.log.push(`${actor.name}: ${sk.name}!`);
    afterAction(); return;
  }
  const targets=sk.aoe?living(_B.foes):[pickTarget(targetId,true)].filter(Boolean);
  for(const t of targets) resolveHit(actor,t,sk);
  // skill-use XP
  try{ window.__game?.Level?.grantXP?.(_B.S, 2, 'Skill: '+sk.name) }catch(_){}
  afterAction();
}
function doItem(actor, itemName){
  const S=_B.S; const inv=S.inv||[];
  const idx=inv.findIndex(i=>(typeof i==='string'?i:i.name)===itemName);
  if(idx<0){ _B.log.push('Kein Item.'); refreshUI(); return }
  const it=inv[idx]; const name=typeof it==='string'?it:it.name;
  inv.splice(idx,1);
  let healed=0;
  if(/trank|heil|med|stim/i.test(name)){ healed=40; actor.hp=Math.min(actor.maxhp,actor.hp+healed) }
  else if(/mana|ether|mp/i.test(name)){ actor.mp=Math.min(actor.maxmp,actor.mp+25); _B.log.push(`${actor.name} nutzt ${name} (+MP).`); afterAction(); return }
  else { healed=20; actor.hp=Math.min(actor.maxhp,actor.hp+healed) }
  _B.log.push(`${actor.name} nutzt ${name} (+${healed} HP).`);
  popNumber(actor,'+'+healed,'heal');
  afterAction();
}
function doDefend(actor, mult=0.5){
  actor.guard=mult; actor.limit=Math.min(actor.maxLimit,(actor.limit|0)+8);
  _B.log.push(`${actor.name} verteidigt sich.`);
  afterAction();
}
function doFlee(actor, bonus=0){
  const avgSpd=living(_B.foes).reduce((s,f)=>s+f.spd,0)/Math.max(1,living(_B.foes).length);
  const chance=clamp(0.35+((actor.spd||8)-avgSpd)/40+bonus,0.15,0.85);
  if(Math.random()<chance){ _B.log.push('Flucht gelungen!'); finish('flee') }
  else { _B.log.push('Flucht gescheitert!'); afterAction() }
}
function doAnalyze(actor, targetId){
  const t=pickTarget(targetId,true); if(!t)return;
  t.analyzed=true; _B.analyzed[t.id]=1;
  try{ window.__game?.Codex?.recordCreature?.(_B.S,t.name,{danger:Math.ceil((t.maxhp||40)/40),behavior:t.ai,habitat:_B.S.world?.scene?.ort,stats:{hp:t.maxhp,weak:t.weak,resist:t.resist},level:'studied',imagePrompt:`anime JRPG enemy ${t.id}`}) }catch(_){}
  _B.log.push(`${actor.name} analysiert ${t.name}: Schwäche ${(t.weak||['—']).join('/')}, Resistenz ${(t.resist||['—']).join('/')||'—'}.`);
  afterAction();
}
function doLimit(actor, targetId){
  if((actor.limit|0)<100){ _B.log.push('Limit nicht bereit.'); refreshUI(); return }
  actor.limit=0;
  const sk=Jrpg.limitSkillFor(actor);
  showSkillBanner(sk.limitName+': '+sk.name);
  const targets=living(_B.foes);
  for(const t of targets) resolveHit(actor,t,sk);
  _B.log.push(`✦ ${sk.limitName} — ${sk.name}!`);
  shakeScreen();
  afterAction();
}

function resolveHit(attacker, target, skill){
  if(!target||!target.alive)return;
  if((target.statuses||[]).some(s=>s.id==='schlaf')){
    target.statuses=target.statuses.filter(s=>s.id!=='schlaf');
    _B.log.push(`${target.name} erwacht!`);
  }
  if(skill?.name) showSkillBanner(skill.name);
  const rolled=Jrpg.rollDamage(attacker,target,skill,{diff:Jrpg.difficultyOf(_B.S)});
  if(rolled.miss){ _B.log.push(`${attacker.name} verfehlt ${target.name}.`); popNumber(target,'MISS','miss'); return }
  if(rolled.absorb){ target.hp=Math.min(target.maxhp,target.hp+rolled.heal); _B.log.push(`${target.name} absorbiert ${rolled.heal}!`); popNumber(target,'+'+rolled.heal,'heal'); return }
  if(rolled.immune){ _B.log.push(`${target.name} ist immun gegen ${ELEM_LABEL[skill.elem]||Jrpg.ELEM_LABEL[skill.elem]||skill.elem}!`); popNumber(target,'IMMUN','miss'); return }
  const {dmg,crit,weak}=rolled;
  target.hp=Math.max(0,target.hp-dmg);
  if(target.aggroMap) target.aggroMap[attacker.id]=(target.aggroMap[attacker.id]|0)+dmg;
  attacker.limit=Math.min(attacker.maxLimit,(attacker.limit|0)+Math.min(20,4+dmg/8|0));
  attacker.limitAcc=(attacker.limitAcc|0)+dmg;
  // promote limit tier
  const need=Jrpg.LIMIT_TIERS[Math.min(3,(attacker.limitTier||1)+1)]?.need;
  if(need && (attacker.limitAcc|0)>=need && (attacker.limitTier||1)<3){ attacker.limitTier=(attacker.limitTier||1)+1; _B.log.push(`${attacker.name}: Grenzwoge Stufe ${attacker.limitTier}!`) }
  let note=`${attacker.name} (${skill.name||'Angriff'}) → ${target.name}: ${dmg}${crit?' KRIT!':''}${weak?' (Schwach!)':''}${target.staggered?' BRUCH×2':''}`;
  _B.log.push(note);
  popNumber(target, String(dmg), crit?'crit':(weak?'weak':'dmg')); try{ window.__game?.Aud?.playSfx?.('hit', crit?0.55:0.4); }catch(_){}
  try{ playAttackLunge(attacker); }catch(_){}
  flashUnit(target,'hit');
  if((target.hp|0)<=0){ try{ playDeathFade(target); }catch(_){} } else { spawnSpellFx(target, crit?'crit':'impact'); }
  if(Jrpg.addStagger(target, rolled.stagger, Jrpg.difficultyOf(_B.S))){
    _B.log.push(`💥 ${target.name} — BRUCH!`);
    showSkillBanner('BRUCH');
    shakeScreen();
  }
  if(skill.status && Math.random()<(skill.statusChance||0.35)){ Jrpg.applyStatus(target, skill.status, 3); _B.log.push(`${target.name}: ${Jrpg.STATUS_DEFS[skill.status]?.name||skill.status}!`) }
  if(target.hp<=0){
    target.alive=false; target.hp=0;
    if(mercyNeeded(target, _B.S) && target.kind!=='hero' && target.kind!=='companion'){
      _B.log.push(`${target.name} liegt am Boden!`);
      enqueueMercy(target);
    } else {
      target._ended=target._ended||'killed';
      _B.log.push(`${target.name} besiegt!`);
    }
  } else if(target.boss && target.phases){
    const ratio=target.hp/target.maxhp;
    while(target.phaseIdx<target.phases.length && ratio<=target.phases[target.phaseIdx].at){
      const ph=target.phases[target.phaseIdx++];
      if(ph.announce) _B.log.push(ph.announce);
      if(ph.buff){ for(const[k,v] of Object.entries(ph.buff)) target[k]=Math.round((target[k]||1)*v) }
      shakeScreen();
    }
  }
}


/* ---- Social / non-lethal ---- */
function doTalk(actor, payload={}){
  const foes=living(_B.foes); if(!foes.length)return;
  const t=payload.targetId?pickTarget(payload.targetId,true):foes[0];
  const text=String(payload.text||'').trim();
  const S=_B.S;
  let chance=0.25+(actor.mag||0)/80+(S.st?.cha||0)/120;
  if(t.human) chance+=0.1;
  if(/bitte|frieden|freund|reden|spar|verschon|kapitul/i.test(text)) chance+=0.2;
  if(/droh|töt|umbring|hass/i.test(text)) chance-=0.25;
  if((S.flags?.spared||[]).includes(t.id)||(S.flags?.sparedNames||[]).includes(t.name)) chance+=0.25;
  _B.log.push(`${actor.name} spricht ${t.name} an${text?': „'+text.slice(0,60)+'“':''}.`);
  if(Math.random()<clamp(chance,0.05,0.9)){
    t.hp=Math.max(1,t.hp); t._surrendered=true; t._ended='surrender'; t.alive=false;
    _B.log.push(`${t.name} lässt die Waffe sinken.`);
    rememberSocial(S,t,'talk');
    checkSocialEnd();
  } else {
    _B.log.push(`${t.name} hört nicht zu.`);
    if(t.aggroMap) t.aggroMap[actor.id]=(t.aggroMap[actor.id]|0)+5;
  }
  afterAction();
}
function doSpare(actor, targetId){
  const t=pickTarget(targetId,true)||living(_B.foes)[0]; if(!t)return;
  if(t.hp>t.maxhp*0.45 && !t._surrendered){ _B.log.push(`${t.name} ist noch zu kampffähig — erst schwächen oder reden.`); refreshUI(); return }
  t.alive=false; t.hp=Math.max(1, Math.floor(t.hp)); t._ended='spared';
  _B.log.push(`${actor.name} verschont ${t.name}.`);
  rememberSocial(_B.S,t,'spare');
  checkSocialEnd();
  afterAction();
}
function doSurrender(actor){
  _B.log.push(`${actor.name} kapituliert.`);
  rememberSocial(_B.S, living(_B.foes)[0],'surrender_player');
  finish('surrender');
}
function doThreaten(actor, targetId){
  const t=pickTarget(targetId,true)||living(_B.foes)[0]; if(!t)return;
  const S=_B.S;
  const chance=clamp(0.2+(S.st?.str||0)/80+(S.st?.ruf<0?0.15:0)+(actor.atk||0)/100,0.05,0.75);
  _B.log.push(`${actor.name} droht ${t.name}.`);
  if(Math.random()<chance){
    t.alive=false; t._ended='fled'; t.hp=Math.max(1,t.hp);
    _B.log.push(`${t.name} flieht!`);
    rememberSocial(S,t,'threaten');
    checkSocialEnd();
  } else {
    applyStatus(t,'betaeubt',1);
    _B.log.push(`${t.name} zuckt — greift dann härter an.`);
    t.atk=Math.round((t.atk||10)*1.15);
  }
  afterAction();
}
function doFreeText(actor, text){
  const t=String(text||'').toLowerCase();
  if(/verschon|begnad|lass(t)? leben|schon/.test(t)) return doSpare(actor);
  if(/kapitul|ergeb|aufgebe|surrender/.test(t)) return doSurrender(actor);
  if(/droh|einschüchter|schreck/.test(t)) return doThreaten(actor);
  if(/flucht|renn|weg/.test(t)) return doFlee(actor);
  if(/auto|schnell|überspring|narrativ/.test(t)) return doAutoResolve(actor);
  return doTalk(actor,{text});
}
function doAutoResolve(actor){
  const foeHP=living(_B.foes).reduce((s,f)=>s+f.hp,0);
  const partyPow=_B.party.filter(p=>p.alive).reduce((s,p)=>s+p.atk+p.mag,0);
  const trivial=foeHP < partyPow*6 && !_B.foes.some(f=>f.boss);
  if(!trivial && !(_B.S.flags?.allowAutoBattle)){
    _B.log.push('Zu gefährlich für Auto — kämpfe oder rede.');
    refreshUI(); return;
  }
  const S=_B.S;
  const winChance=clamp(0.45+(S.st?.str||0)/100+(S.st?.cha||0)/120+(partyPow/100),0.2,0.92);
  _B.log.push('Auto-Auflösung…');
  if(Math.random()<winChance){
    for(const f of living(_B.foes)){
      if(isStoryNpcFoe(f, S)){
        // Auto never finishes a story NPC — KO only (player must choose Finish for permadeath)
        applyMercyDecision(S, f, 'ko');
      } else {
        f.hp=0; f.alive=false; f._ended='auto_win';
      }
    }
    _B.log.push('Der Konflikt endet schnell zu euren Gunsten (Story-NPCs: KO, nicht getötet).');
    finish('win');
  } else if(Math.random()<0.5){
    for(const f of living(_B.foes)){ f._ended='auto_flee'; f.alive=false; f.hp=Math.max(1,f.hp) }
    _B.log.push('Ihr zerstreut euch — niemand stirbt.');
    finish('flee');
  } else {
    const hero=_B.party[0]; hero.hp=Math.max(1, Math.floor(hero.hp*0.4));
    _B.log.push('Es geht schief — ihr müsst weichen.');
    finish('flee');
  }
}
function checkSocialEnd(){
  if(!living(_B.foes).length){
    const allMercy=_B.foes.every(f=>f._ended==='spared'||f._ended==='surrender'||f._ended==='fled'||f._surrendered);
    if(allMercy) finish('flee');
    else finish('win');
  }
}
function rememberSocial(S, foe, kind){
  if(!S||!foe)return;
  S.flags=S.flags||{};
  S.flags.spared=S.flags.spared||[];
  S.flags.sparedNames=S.flags.sparedNames||[];
  if(kind==='spare'||kind==='talk'){
    if(foe.id&&!S.flags.spared.includes(foe.id)) S.flags.spared.push(foe.id);
    if(foe.name&&!S.flags.sparedNames.includes(foe.name)) S.flags.sparedNames.push(foe.name);
  }
  try{
    const Sim=window.__game?.Sim;
    const what=kind==='spare'?`Verschont: ${foe.name}.`:kind==='talk'?`Verhandelt mit ${foe.name}.`:kind==='threaten'?`Eingeschüchtert: ${foe.name}.`:kind==='surrender_player'?`Kapitulation.`:`Sozial: ${kind} / ${foe.name}`;
    Sim?.ledgerPush?.(S,{type:'battle_social',who:S.pc?.name||'Du',what,where:S.world?.scene?.ort,importance:40,emotion:kind==='threaten'?'kalt':'hoffnungsvoll',meta:{foe:foe.id||foe.name,kind,human:!!foe.human}});
  }catch(_){}
}

/* ---- AI ---- */
function aiEnemy(e){
  if(!canAct(e)){ _B.log.push(`${e.name} ist handlungsunfähig.`); tickStatuses(e,m=>_B.log.push(m)); return }
  tickStatuses(e,m=>_B.log.push(m));
  if(!e.alive)return;
  const party=living(_B.party);
  if(!party.length)return;
  // target by aggro
  let target=party[0];
  if(e.aggroMap && Object.keys(e.aggroMap).length){
    const best=Object.entries(e.aggroMap).sort((a,b)=>b[1]-a[1])[0];
    const t=party.find(p=>p.id===best[0]); if(t) target=t;
  } else if(e.ai==='cautious'){ target=party.slice().sort((a,b)=>a.hp-b.hp)[0] }
  else if(e.ai==='aggro'||e.ai==='boss'){ target=party.slice().sort((a,b)=>b.aggro-a.aggro||b.hp-a.hp)[0] }

  const skills=e.skills||[];
  let skill=null;
  if(e.ai==='healer' && living(_B.foes).some(f=>f.hp<f.maxhp*0.5)){
    skill=skills.find(s=>s.heal)||null;
    if(skill && (e.mp|0)>=(skill.mp|0)){
      e.mp-=skill.mp|0; const ally=living(_B.foes).sort((a,b)=>a.hp-b.hp)[0];
      ally.hp=Math.min(ally.maxhp,ally.hp+(skill.heal|0));
      _B.log.push(`${e.name}: ${skill.name} (+${skill.heal})`); return;
    }
  }
  if(e.ai==='caster'||e.ai==='boss'){
    const cast=skills.filter(s=>(s.mp|0)<=(e.mp|0) && (s.pow||s.status));
    if(cast.length && Math.random()<.7) skill=R(cast);
  }
  if(!skill && skills.length && Math.random()<.45){
    const aff=skills.filter(s=>(s.mp|0)<=(e.mp|0)); if(aff.length) skill=R(aff);
  }
  skill=skill||{name:'Angriff',pow:1.0,elem:e.element||'phys'};
  if(skill.mp) e.mp-=skill.mp|0;
  if(skill.heal){ e.hp=Math.min(e.maxhp,e.hp+skill.heal); _B.log.push(`${e.name}: ${skill.name}`); return }
  if(skill.summon){ _B.log.push(`${e.name} ruft Verstärkung!`); /* simplified: self buff */ applyStatus(e,'staerkung',2); return }
  if(skill.aoe){ for(const t of party) resolveHit(e,t,skill) }
  else resolveHit(e,target,skill);
}

function aiCompanion(c){
  if(!Jrpg.canAct(c)){ Jrpg.tickStatuses(c,m=>_B.log.push(m)); return }
  Jrpg.tickStatuses(c,m=>_B.log.push(m));
  if(!c.alive)return;
  const foes=living(_B.foes); if(!foes.length)return;
  const dec=Jrpg.gambitDecide(c,_B);
  if(dec){
    if(dec.cmd==='skill'){ doSkill(c, dec.skill, dec.targetId); return }
    if(dec.cmd==='item'){ doItem(c, dec.item, dec.targetId); return }
    if(dec.cmd==='attack'){ doAttack(c, dec.targetId); return }
  }
  const sk=c.skills.find(s=>s.pow&&(s.mp|0)<=c.mp)||{name:'Angriff',pow:1.0,elem:'phys'};
  if(sk.mp) c.mp-=sk.mp|0;
  resolveHit(c, R(foes), sk);
}

/* ---- UI ---- */

function pixelEnemyArt(f){
  const n=String(f?.id||f?.name||'').toLowerCase();
  let key='slime';
  if(/bat|fledermaus/.test(n)) key='bat';
  else if(/bandit|räuber|rauber|dieb/.test(n)) key='bandit';
  else if(/wolf|hound/.test(n)) key='wolf';
  else if(/skel|knochen|undead/.test(n)) key='skeleton';
  else if(/boss|drache|dragon|könig|demon/.test(n) || f?.boss) key='boss';
  else if(/imp|goblin/.test(n)) key='imp';
  else if(/golem|stein/.test(n)) key='golem';
  else if(/schleim|slime|blob/.test(n)) key='slime';
  return './assets/pixel/enemy/'+key+'.png';
}

function el(id){return document.getElementById(id)}

function ensureRoot(){
  let root=el('battleRoot');
  if(!root){
    root=document.createElement('div'); root.id='battleRoot'; root.className='battle-root hidden';
    document.body.appendChild(root);
  }
  return root;
}

export function renderBattleUI(){
  const root=ensureRoot();
  if(!_B){ root.classList.add('hidden'); return }
  root.classList.remove('hidden'); root.classList.add('battle-pixel');
  const B=_B;
  root.innerHTML=`
  <div class="battle-bg pixel-battle-bg" id="battleBg" style="background-image:url('${B.bg}')"></div>
  <div class="pixel-battle-floor" aria-hidden="true"></div>
  <div class="battle-veil"></div>
  <div class="battle-stage-25d"><div class="bstage-floor"></div></div>
  <div class="battle-atb-mode">${B.atbMode==='wait'?'WAIT':'ACTIVE'}</div>
  <div class="skill-banner" id="skillBanner"></div>
  <div class="battle-timeline" id="battleTL"></div>
  <div class="battle-foes" id="battleFoes"></div>
  <div class="battle-fx" id="battleFx" aria-hidden="true"></div>
  <div class="battle-party" id="battleParty"></div>
  <div class="battle-log" id="battleLog"></div>
  <div class="battle-cmd" id="battleCmd"></div>
  <div class="battle-end hidden" id="battleEnd"></div>`;
  refreshUI();
}

function refreshUI(){
  if(!_B)return;
  const B=_B;
  // timeline
  const tl=el('battleTL');
  if(tl){
    const units=allUnits().filter(u=>u.alive).map(u=>({u,pct:clamp((u.atb||0),0,100)}))
      .sort((a,b)=>b.pct-a.pct).slice(0,8);
    tl.innerHTML=units.map(({u,pct})=>`<div class="tl-item ${u.kind==='hero'||u.kind==='companion'?'ally':'foe'}" title="${u.name}"><i style="height:${pct}%"></i><span>${(u.name||'?').slice(0,1)}</span></div>`).join('');
  }
  // foes
  const foes=el('battleFoes');
  if(foes){
    foes.innerHTML=B.foes.map(f=>`
      <button type="button" class="foe-card ${f.alive?'':'dead'} ${B.selecting&&needsTarget()?(_B._hover===f._iid?'target':''):''}" data-iid="${f._iid}" ${f.alive?'':'disabled'}>
        <div class="foe-art-wrap pixel-foe"><img class="foe-art pixelated" src="${pixelEnemyArt(f)}" alt="${f.name}" loading="lazy" onerror="this.onerror=null;this.src='${f.art||''}';"/><div class="foe-fallback" style="display:none">${f.icon||'👹'}</div></div>
        <div class="foe-name">${f.name}${f.analyzed?' · ✦':''}${f.boss?' · BOSS':''}${f.staggered?' · BRUCH':''}${f.rare?' · SELTEN':''}</div>
        <div class="bar foe-hp"><i style="width:${Math.max(0,f.hp/f.maxhp*100)}%"></i></div>
        <div class="bar foe-stagger ${f.staggered?'broken':''}" title="Bruch"><i style="width:${Math.max(0,(f.stagger||0)/Math.max(1,f.staggerMax||1)*100)}%"></i></div>
        ${f.analyzed?`<div class="foe-weak">${(f.weak||[]).map(w=>ELEM_LABEL[w]||Jrpg.ELEM_LABEL[w]||w).join(' · ')||'—'}</div>`:''}
        <div class="status-row">${(f.statuses||[]).map(s=>`<em>${Jrpg.STATUS_DEFS[s.id]?.name||s.id}</em>`).join('')}</div>
      </button>`).join('');
    foes.querySelectorAll('.foe-card').forEach(btn=>{
      btn.onclick=()=>{
        if(!_B.selecting)return;
        const iid=btn.dataset.iid;
        const mode=_B.selecting.mode;
        if(mode==='attack') playerCommand('attack',{targetId:iid});
        else if(mode==='skill') playerCommand('skill',{skill:_B.selecting.skill,targetId:iid});
        else if(mode==='analyze') playerCommand('analyze',{targetId:iid});
        else if(mode==='limit') playerCommand('limit',{targetId:iid});
        else if(mode==='talk') playerCommand('talk',{targetId:iid});
        else if(mode==='spare') playerCommand('spare',{targetId:iid});
        else if(mode==='threaten') playerCommand('threaten',{targetId:iid});
        else if(mode==='steal') playerCommand('steal',{targetId:iid});
        else { _B.selecting={..._B.selecting, mode:'attack'}; playerCommand('attack',{targetId:iid}) }
      };
    });
  }
  // party
  const party=el('battleParty');
  if(party){
    party.innerHTML=B.party.map(p=>`
      <div class="party-card pixel-party ${p.alive?'':'dead'} ${B.selecting?.actor===p?'active':''} row-${p.row||'front'}">
        <img class="pixel-hero-spr pixelated" src="./assets/pixel/hero/battle.png" alt="" width="40" height="54"/>
        <div class="party-port">${p.portrait?`<img src="${p.portrait}" alt="" loading="lazy"/>`:`<span>${(p.name||'?')[0]}</span>`}</div>
        <div class="party-meta">
          <b>${p.name}${p.job?' · '+((Jobs.JOBS[p.job]||{}).name||p.job):''}<small>${p.row==='back'?' hinten':' vorn'}</small></b>
          <div class="bar hp"><i style="width:${Math.max(0,p.hp/p.maxhp*100)}%"></i></div>
          <div class="bar mp"><i style="width:${Math.max(0,p.mp/Math.max(1,p.maxmp)*100)}%"></i></div>
          <div class="bar lim"><i style="width:${Math.max(0,(p.limit||0)/100*100)}%"></i></div>
          <div class="bar atb"><i style="width:${Math.max(0,Math.min(100,p.atb||0))}%"></i></div>
        </div>
      </div>`).join('');
  }
  // log
  const log=el('battleLog');
  if(log) log.innerHTML=B.log.slice(-4).map(l=>`<div>${l}</div>`).join('');
  // commands
  const cmd=el('battleCmd');
  if(cmd){
    if(B.done){ cmd.innerHTML=''; return }
    const sel=B.selecting;
    if(!sel||sel.actor.kind!=='hero'){ cmd.innerHTML=`<div class="battle-wait">…</div>`; return }
    if(sel.mode==='main'){
      const limReady=(sel.actor.limit|0)>=100;
      cmd.innerHTML=`
        <div class="cmd-classic">
          <button type="button" class="bcm" data-c="attack">Angriff</button>
          <button type="button" class="bcm" data-c="skills">Fähigkeit</button>
          <button type="button" class="bcm" data-c="magic">Magie/Kristalle</button>
          <button type="button" class="bcm" data-c="items">Items</button>
          <button type="button" class="bcm" data-c="summon">Beschwörung</button>
          <button type="button" class="bcm" data-c="job">Beruf</button>
          <button type="button" class="bcm" data-c="steal">Stehlen</button>
          <button type="button" class="bcm" data-c="analyze">Analysieren</button>
          <button type="button" class="bcm" data-c="defend">Schützen</button>
          <button type="button" class="bcm" data-c="row">Reihe</button>
          <button type="button" class="bcm accent" data-c="limit" ${limReady?'':'disabled'}>Limit ${sel.actor.limitTier||1}</button>
          <button type="button" class="bcm" data-c="combo">Duett</button>
          <button type="button" class="bcm social" data-c="talk">Reden</button>
          <button type="button" class="bcm social" data-c="spare">Verschonen</button>
          <button type="button" class="bcm social" data-c="threaten">Drohen</button>
          <button type="button" class="bcm ghost" data-c="atbMode">ATB ${(_B.atbMode||'active')==='wait'?'Wait':'Active'}</button>
          <button type="button" class="bcm ghost" data-c="auto">Auto</button>
          <button type="button" class="bcm ghost" data-c="surrender">Kapitulieren</button>
          <button type="button" class="bcm ghost" data-c="flee">Flucht</button>
        </div>
        <form class="battle-free" id="battleFree"><input name="t" placeholder="Freitext…" autocomplete="off"/><button type="submit">➤</button></form>`;
      cmd.querySelectorAll('.bcm').forEach(b=>b.onclick=()=>{
        const c=b.dataset.c;
        if(c==='attack'){ _B.selecting={actor:sel.actor,mode:'attack'}; refreshUI(); toastPick() }
        else if(c==='skills'||c==='magic'){ _B.selecting={actor:sel.actor,mode:'skills'}; refreshUI() }
        else if(c==='items'){ _B.selecting={actor:sel.actor,mode:'items'}; refreshUI() }
        else if(c==='summon'){ _B.selecting={actor:sel.actor,mode:'summon'}; refreshUI() }
        else if(c==='job'){ _B.selecting={actor:sel.actor,mode:'job'}; refreshUI() }
        else if(c==='steal'){ _B.selecting={actor:sel.actor,mode:'steal'}; if(living(_B.foes).length===1) playerCommand('steal',{targetId:living(_B.foes)[0]._iid}); else { refreshUI(); toastPick() } }
        else if(c==='defend') playerCommand('defend')
        else if(c==='row') playerCommand('row')
        else if(c==='atbMode') playerCommand('atbMode')
        else if(c==='analyze'){ _B.selecting={actor:sel.actor,mode:'analyze'}; refreshUI(); toastPick() }
        else if(c==='talk'){ _B.selecting={actor:sel.actor,mode:'talk'}; if(living(_B.foes).length===1) playerCommand('talk',{targetId:living(_B.foes)[0]._iid}); else { refreshUI(); toastPick() } }
        else if(c==='spare'){ _B.selecting={actor:sel.actor,mode:'spare'}; if(living(_B.foes).length===1) playerCommand('spare',{targetId:living(_B.foes)[0]._iid}); else { refreshUI(); toastPick() } }
        else if(c==='threaten'){ _B.selecting={actor:sel.actor,mode:'threaten'}; if(living(_B.foes).length===1) playerCommand('threaten',{targetId:living(_B.foes)[0]._iid}); else { refreshUI(); toastPick() } }
        else if(c==='limit'){ playerCommand('limit',{targetId:living(_B.foes)[0]?._iid}) }
        else if(c==='combo'){ const p=_B.party[1]; if(p) playerCommand('combo',{partnerId:p.id}); else { _B.log.push('Kein Partner.'); refreshUI() } }
        else if(c==='auto') playerCommand('auto')
        else if(c==='surrender') playerCommand('surrender')
        else if(c==='flee') playerCommand('flee')
      });
      const bf=cmd.querySelector('#battleFree');
      if(bf) bf.onsubmit=(ev)=>{ev.preventDefault(); const v=bf.t.value.trim(); if(v) playerCommand('freetext',{text:v}); bf.t.value=''};
    } else if(sel.mode==='skills'){
      const skills=sel.actor.skills||[];
      cmd.innerHTML=`<button type="button" class="bcm ghost" data-c="back">◀</button>`+
        skills.map((s,i)=>`<button type="button" class="bcm" data-i="${i}" ${(s.mp|0)>(sel.actor.mp|0)?'disabled':''}>${s.name}<small>${s.mp?s.mp+' MP':''}${s.elem?' · '+(ELEM_LABEL[s.elem]||s.elem):''}</small></button>`).join('');
      cmd.querySelector('[data-c=back]').onclick=()=>{_B.selecting={actor:sel.actor,mode:'main'};refreshUI()};
      cmd.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{
        const sk=skills[+b.dataset.i];
        if(sk.heal||sk.self||sk.defend||sk.fleeBonus){ playerCommand('skill',{skill:sk}); return }
        if(sk.aoe){ playerCommand('skill',{skill:sk}); return }
        _B.selecting={actor:sel.actor,mode:'skill',skill:sk}; refreshUI(); toastPick();
      });
    } else if(sel.mode==='items'){
      const items=(_B.S.inv||[]).slice(0,8);
      cmd.innerHTML=`<button type="button" class="bcm ghost" data-c="back">◀</button>`+
        (items.length?items.map((it,i)=>{const n=typeof it==='string'?it:it.name;return `<button type="button" class="bcm" data-i="${i}">${n}</button>`}).join(''):'<span class="meta">Kein Item</span>');
      cmd.querySelector('[data-c=back]').onclick=()=>{_B.selecting={actor:sel.actor,mode:'main'};refreshUI()};
      cmd.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{
        const it=items[+b.dataset.i]; const n=typeof it==='string'?it:it.name;
        playerCommand('item',{item:n});
      });
    } else if(sel.mode==='summon'){
      const list=Summons.ownedSummons(_B.S);
      cmd.innerHTML=`<button type="button" class="bcm ghost" data-c="back">◀</button>`+
        (list.length?list.map(s=>`<button type="button" class="bcm" data-sid="${s.id}">${s.icon||'🌟'} ${s.name}<small>${s.cost} MP · ${s.elem}</small></button>`).join(''):'<span class="meta">Keine Sternengeister</span>');
      cmd.querySelector('[data-c=back]').onclick=()=>{_B.selecting={actor:sel.actor,mode:'main'};refreshUI()};
      cmd.querySelectorAll('[data-sid]').forEach(b=>b.onclick=()=>playerCommand('summon',{id:b.dataset.sid}));
    } else if(sel.mode==='job'){
      Jobs.ensureJobs(_B.S);
      const unlocked=_B.S.jobs.unlocked||[];
      cmd.innerHTML=`<button type="button" class="bcm ghost" data-c="back">◀</button>`+
        unlocked.map(id=>{const j=Jobs.JOBS[id]; const lv=_B.S.jobs.levels[id]|1; return `<button type="button" class="bcm ${id===_B.S.jobs.active?'accent':''}" data-j="${id}">${j?.icon||''} ${j?.name||id}<small>Lv ${lv}</small></button>`}).join('');
      cmd.querySelector('[data-c=back]').onclick=()=>{_B.selecting={actor:sel.actor,mode:'main'};refreshUI()};
      cmd.querySelectorAll('[data-j]').forEach(b=>b.onclick=()=>playerCommand('job',{job:b.dataset.j}));
    } else if(['attack','skill','analyze','limit','talk','spare','threaten','steal'].includes(sel.mode)){
      cmd.innerHTML=`<div class="battle-pick">Ziel wählen</div><button type="button" class="bcm ghost" data-c="back">◀ Zurück</button>`;
      cmd.querySelector('[data-c=back]').onclick=()=>{_B.selecting={actor:sel.actor,mode:'main'};refreshUI()};
    }
  }
}

function needsTarget(){const m=_B?.selecting?.mode; return ['attack','skill','analyze','limit','talk','spare','threaten','steal'].includes(m)}
function toastPick(){ /* visual only via cmd label */ }

function showEndScreen(result, summary){
  const end=el('battleEnd'); if(!end)return;
  end.classList.remove('hidden');
  if(result==='win') playVictoryFanfare();
  const ap=summary.ap|0, gil=summary.gold|0;
  end.innerHTML=`<div class="battle-end-card ${result}">
    <h2>${result==='win'?'SIEG':result==='flee'?'ENTKOMMEN':result==='surrender'?'KAPITULATION':'NIEDERLAGE'}</h2>
    <p>${summary.text}</p>
    ${result==='win'?`<div class="victory-summary">
      <div><span>EXP</span><b>+${summary.xp}</b></div>
      <div><span>AP</span><b>+${ap}</b></div>
      <div><span>Gil</span><b>+${gil}</b></div>
      ${summary.loot.length?`<div class="loot">${summary.loot.map(l=>(l.icon||'📦')+' '+l.name).join(', ')}</div>`:''}
      ${(summary.learned||[]).length?`<div class="meta">Gelernt: ${summary.learned.join(', ')}</div>`:''}
    </div>`:''}
  </div>`;
}
function playVictoryFanfare(){
  try{
    const AC=window.AudioContext||window.webkitAudioContext; if(!AC)return;
    const ctx=new AC(); const now=ctx.currentTime;
    const notes=[523.25,659.25,783.99,1046.5,783.99,1046.5];
    notes.forEach((f,i)=>{
      const o=ctx.createOscillator(); const g=ctx.createGain();
      o.type='square'; o.frequency.value=f;
      g.gain.value=0.05; g.gain.exponentialRampToValueAtTime(0.001, now+0.35+i*0.12);
      o.connect(g); g.connect(ctx.destination);
      o.start(now+i*0.12); o.stop(now+0.4+i*0.12);
    });
    setTimeout(()=>ctx.close(),2000);
  }catch(_){}
}

function hideBattleUI(){
  const root=el('battleRoot'); if(root) root.classList.add('hidden');
}

function popNumber(unit, text, kind){
  const fx=el('battleFx'); if(!fx)return;
  const d=document.createElement('div'); d.className='dmg-pop '+kind; d.textContent=text;
  d.style.left=(20+Math.random()*60)+'%'; d.style.top=(20+Math.random()*40)+'%';
  fx.appendChild(d); setTimeout(()=>d.remove(),900);
}
function flashUnit(unit, kind){
  const root=el('battleRoot'); if(!root)return;
  root.classList.add('flash-'+kind); setTimeout(()=>root.classList.remove('flash-'+kind),180);
  const isParty=(_B?.party||[]).some(p=>p._iid===unit._iid);
  const sel=isParty?'.party-card':'.foe-card';
  const card=[...document.querySelectorAll(sel)].find(c=>{
    if(isParty) return (c.textContent||'').includes(unit.name||'') || c.dataset.iid===unit._iid;
    return c.dataset.iid===unit._iid;
  });
  if(kind==='hit'){
    if(card){ card.classList.add('hit','lunge'); setTimeout(()=>card.classList.remove('hit','lunge'),320); }
    spawnSpellFx(unit, 'impact');
  } else if(kind==='heal'){
    if(card){ card.classList.add('heal-glow'); setTimeout(()=>card.classList.remove('heal-glow'),500); }
    spawnSpellFx(unit, 'heal');
  }
}
function spawnSpellFx(unit, kind){
  const fx=el('battleFx'); if(!fx) return;
  const d=document.createElement('div');
  d.className='spell-fx spell-'+kind;
  d.style.left=(18+Math.random()*64)+'%';
  d.style.top=(16+Math.random()*50)+'%';
  fx.appendChild(d);
  setTimeout(()=>d.remove(),700);
}
function playAttackLunge(attacker){
  const isParty=(_B?.party||[]).some(p=>p._iid===attacker._iid);
  const cards=[...document.querySelectorAll(isParty?'.party-card':'.foe-card')];
  const card=cards.find(c=>isParty? (c.classList.contains('active')||(c.textContent||'').includes(attacker.name||'')): c.dataset.iid===attacker._iid);
  if(!card) return;
  card.classList.add(isParty?'party-lunge':'enemy-lunge');
  setTimeout(()=>card.classList.remove('party-lunge','enemy-lunge'),380);
}
function playDeathFade(unit){
  const card=[...document.querySelectorAll('.foe-card')].find(c=>c.dataset.iid===unit._iid);
  if(!card) return;
  card.classList.add('death-fade');
  setTimeout(()=>{ card.classList.add('dead'); }, 520);
}
function shakeScreen(){
  const root=el('battleRoot'); if(!root)return;
  try{V25.decorateBattle25d(root); V25.battleCamPulse(root,'hit')}catch(_){}
  root.classList.add('shake'); setTimeout(()=>root.classList.remove('shake'),400);
}

/* ---- Music ---- */
function startBattleMusic(S){
  try{
    stopBattleMusic();
    const AC=window.AudioContext||window.webkitAudioContext; if(!AC)return;
    const ctx=new AC(); const master=ctx.createGain(); master.gain.value=0.04; master.connect(ctx.destination);
    const oscs=[];
    const base=/zombie/.test(S.genre||'')?[55,82,110]:/cyber/.test(S.genre||'')?[98,147,220]:[130.81,164.81,196];
    base.forEach((f,i)=>{
      const o=ctx.createOscillator(); const g=ctx.createGain();
      o.type=i===0?'sawtooth':'square'; o.frequency.value=f;
      g.gain.value=0.08/(i+1);
      const lfo=ctx.createOscillator(); const lg=ctx.createGain();
      lfo.frequency.value=4+i; lg.gain.value=f*0.02; lfo.connect(lg); lg.connect(o.frequency); lfo.start();
      o.connect(g); g.connect(master); o.start(); oscs.push(o,lfo);
    });
    _music={ctx,master,oscs};
  }catch(_){}
}
function stopBattleMusic(){
  if(!_music)return;
  try{_music.oscs.forEach(o=>{try{o.stop()}catch(_){}});_music.master.disconnect();_music.ctx.close()}catch(_){}
  _music=null;
}

/** Encounter trigger helper for exploration */
export function maybeRandomEncounter(S, opts={}){
  if(isActive())return false;
  const chance=opts.chance??0.12;
  if(Math.random()>chance)return false;
  return true;
}


/** Pre-battle choice sheet — never auto-starts combat */
export function offerEncounter(S, opts={}){
  const foes=opts.enemies?.length?opts.enemies:(opts.kind?designEncounter(S,opts.kind):pickEncounter(S,{count:opts.count,boss:opts.boss,noBoss:opts.noBoss!==false}));
  if(!opts.blurb && foes[0]){ try{ const sb=storyBossBlurb(foes[0]); if(sb) opts={...opts, blurb:sb}; }catch(_){} }
  if(!foes.length) return null;
  const root=ensureRoot();
  return new Promise(resolve=>{
    root.classList.remove('hidden');
    const names=foes.map(f=>f.name+(f.boss?' (Boss)':'')).join(', ');
    root.innerHTML=`<div class="battle-bg" style="background-image:url('${opts.bg||battleBgFor(S)}')"></div>
      <div class="battle-veil"></div>
      <div class="encounter-sheet">
        <div class="encounter-badge">Begegnung</div>
        <div class="encounter-foes">${foes.map(f=>`<div class="enc-foe"><img src="${f.art}" alt="" onerror="this.remove()"/><span>${f.icon||''} ${f.name}</span></div>`).join('')}</div>
        <p class="encounter-desc">${opts.blurb||('Ihr trefft auf '+names+'. Was tust du?')}</p>
        <div class="encounter-cmds">
          <button type="button" data-a="fight" class="bcm accent">Kämpfen</button>
          <button type="button" data-a="talk" class="bcm social">Reden / Überzeugen</button>
          <button type="button" data-a="intimidate" class="bcm social">Einschüchtern</button>
          <button type="button" data-a="bribe" class="bcm">Bestechen</button>
          <button type="button" data-a="sneak" class="bcm">Schleichen</button>
          <button type="button" data-a="surrender" class="bcm ghost">Ergeben</button>
          <button type="button" data-a="flee" class="bcm ghost">Fliehen</button>
        </div>
        <form class="battle-free" id="encFree"><input name="t" placeholder="Freitext…" autocomplete="off"/><button type="submit">➤</button></form>
      </div>`;
    const done=(choice, text='')=>{
      root.classList.add('hidden');
      if(choice==='fight' || choice==='attack'){
        startBattle(S,{...opts, enemies:foes, onEnd:(sum)=>resolve({choice:'fight', summary:sum, foes})});
        return;
      }
      // non-combat resolutions
      const summary=resolveNonCombat(S, foes, choice, text);
      resolve({choice, summary, foes});
    };
    root.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>done(b.dataset.a));
    const f=root.querySelector('#encFree');
    if(f) f.onsubmit=(ev)=>{
      ev.preventDefault(); const text=f.t.value.trim();
      const low=text.toLowerCase();
      let choice='talk';
      if(/angriff|kampf|schlag|töt|attack/.test(low)) choice='fight';
      else if(/droh|einschüchter|schreck/.test(low)) choice='intimidate';
      else if(/bestech|kauf|gold|geld/.test(low)) choice='bribe';
      else if(/schleich|versteck|umgeh/.test(low)) choice='sneak';
      else if(/ergeb|kapitul/.test(low)) choice='surrender';
      else if(/flieh|flucht|renn|weg/.test(low)) choice='flee';
      else if(/red|überzeug|frieden|bitte/.test(low)) choice='talk';
      done(choice, text);
    };
  });
}
function resolveNonCombat(S, foes, choice, text){
  const names=foes.map(f=>f.name).join(', ');
  let textOut='', xp=0, gold=0, heat=0, spared=[];
  const cha=(S.st?.cha||0), str=(S.st?.str||0), goldHave=S.st?.gold|0;
  if(choice==='talk'){
    const ok=Math.random()<clamp(0.4+cha/80,0.2,0.9);
    textOut=ok?`Durch Worte entspannt sich die Lage mit ${names}.`:`${names} bleibt misstrauisch, greift aber nicht sofort an.`;
    if(ok){ xp=8; spared=foes.map(f=>f.name); for(const f of foes) rememberSocial(S,f,'talk') }
  } else if(choice==='intimidate'){
    const ok=Math.random()<clamp(0.35+str/70,0.15,0.85);
    textOut=ok?`${names} weicht zurück.`:`Deine Drohung verpufft — die Lage bleibt angespannt.`;
    if(ok){ xp=10; spared=foes.map(f=>f.name); for(const f of foes) rememberSocial(S,f,'threaten') }
  } else if(choice==='bribe'){
    const cost=Math.min(goldHave, 10+foes.length*8);
    if(goldHave>=cost && cost>0){ S.st.gold-=cost; textOut=`Du zahlst ${cost} Gold. ${names} lässt euch passieren.`; xp=5; spared=foes.map(f=>f.name) }
    else textOut=`Nicht genug Gold — ${names} lacht höhnisch.`;
  } else if(choice==='sneak'){
    const ok=Math.random()<clamp(0.4+(S.progress?.attrs?.dex||5)/30,0.2,0.85);
    textOut=ok?`Ihr schleicht an ${names} vorbei.`:`Entdeckung! Noch könnt ihr wählen…`;
    if(ok) xp=6;
  } else if(choice==='surrender'){
    textOut=`Ihr ergibt euch vor ${names}.`; heat-=2;
  } else if(choice==='flee'){
    const ok=Math.random()<0.7;
    textOut=ok?`Ihr entkommt ${names}.`:`Flucht misslingt — ${names} stellt sich in den Weg.`;
  } else {
    textOut=`Begegnung mit ${names} endet unklar.`;
  }
  if(text) textOut += ` („${String(text).slice(0,80)}“)`;
  try{
    window.__game?.Sim?.ledgerPush?.(S,{type:'encounter',who:S.pc?.name||'Du',what:textOut,where:S.world?.scene?.ort,importance:35,emotion:'angespannt',meta:{choice,foes:foes.map(f=>f.id),spared}});
  }catch(_){}
  if(xp){ S.st.xp=(S.st.xp|0)+xp; try{window.__game?.Level?.grantXP?.(S,xp,'Begegnung')}catch(_){} }
  return {result:choice, text:textOut, xp, gold, loot:[], killed:[], humansKilled:[], spared:spared.map(n=>({name:n})), log:[textOut], nonCombat:true};
}

export default {
  startBattle, isActive, getBattle, playerCommand, buildParty, renderBattleUI,
  maybeRandomEncounter, offerEncounter, COMBAT_SKILLS,
  isStoryNpcFoe, storyNpcName, mercyNeeded, applyMercyDecision,
  Jrpg, Jobs, Gems, Summons, Equip
};


export { Jrpg, Jobs, Gems, Summons, Equip };
