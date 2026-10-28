/** v17 JRPG combat core — original systems inspired by classic ATB JRPGs */
import { ELEM_LABEL, ELEMENTS } from './gems.js';
import { JOBS, ensureJobs, availableAbilities, jobStatBonus, switchJob, grantJobAp } from './jobs.js';
import { ensureGems, resolveLoadoutGems, grantGemXp } from './gems.js';
import { ensureSummons, ownedSummons, summonPower, bondSummon } from './summons.js';
import { ensureEquip, equippedStats } from './equip.js';

export { ELEMENTS, ELEM_LABEL };

export const STATUS_DEFS={
  hast:{id:'hast',name:'Hast',kind:'buff',spdMult:1.5,turns:4},
  langsam:{id:'langsam',name:'Slow',kind:'debuff',spdMult:0.55,turns:4},
  schutz:{id:'schutz',name:'Protect',kind:'buff',physMit:0.5,turns:5},
  magschild:{id:'magschild',name:'Shell',kind:'buff',magMit:0.5,turns:5},
  regen:{id:'regen',name:'Regen',kind:'buff',hot:0.06,turns:5},
  berserker:{id:'berserker',name:'Berserk',kind:'mix',atkMult:1.4,autoAttack:true,turns:4},
  stille:{id:'stille',name:'Silence',kind:'debuff',blockMagic:true,turns:3},
  blind:{id:'blind',name:'Blind',kind:'debuff',hitPenalty:0.4,turns:4},
  gift:{id:'gift',name:'Poison',kind:'debuff',dot:0.06,turns:5},
  doom:{id:'doom',name:'Doom',kind:'debuff',doom:true,turns:5},
  versteinert:{id:'versteinert',name:'Petrify',kind:'debuff',noAct:true,turns:99},
  schlaf:{id:'schlaf',name:'Sleep',kind:'debuff',noAct:true,turns:3},
  betaeubt:{id:'betaeubt',name:'Stun',kind:'debuff',noAct:true,turns:1},
  staerkung:{id:'staerkung',name:'Bravery',kind:'buff',atkMult:1.25,turns:4},
  schild:{id:'schild',name:'Barrier',kind:'buff',physMit:0.35,turns:3},
  brand:{id:'brand',name:'Burn',kind:'debuff',dot:0.07,turns:3},
  blutung:{id:'blutung',name:'Bleed',kind:'debuff',dot:0.05,turns:3},
};

export const DIFFICULTY={
  story:{id:'story',name:'Geschichte',enemyHp:0.8,enemyDmg:0.75,playerDmg:1.2,staggerRate:1.35},
  normal:{id:'normal',name:'Normal',enemyHp:1,enemyDmg:0.95,playerDmg:1.05,staggerRate:1.1},
  hard:{id:'hard',name:'Hart',enemyHp:1.25,enemyDmg:1.2,playerDmg:0.9,staggerRate:0.85},
  nightmare:{id:'nightmare',name:'Albtraum',enemyHp:1.55,enemyDmg:1.45,playerDmg:0.8,staggerRate:0.7},
};

export function difficultyOf(S){
  const id=S?.cfgBattleDiff || S?.flags?.battleDiff || 'normal';
  return DIFFICULTY[id]||DIFFICULTY.normal;
}

export function elemMult(target, elem){
  if(!elem || elem==='phys'){
    if(target.absorb?.includes('phys')) return -1;
    if(target.immune?.includes('phys')) return 0;
    if(target.weak?.includes('phys')) return 1.5;
    if(target.resist?.includes('phys')) return 0.5;
    return 1;
  }
  if(target.absorb?.includes(elem)) return -1;
  if(target.immune?.includes(elem)) return 0;
  if(target.weak?.includes(elem)) return 1.75;
  if(target.resist?.includes(elem)) return 0.5;
  return 1;
}

export function statusSpdMult(unit){
  let m=1;
  for(const s of (unit.statuses||[])){
    const d=STATUS_DEFS[s.id]; if(d?.spdMult) m*=d.spdMult;
  }
  return m;
}

export function canAct(unit){
  if(!unit.alive) return false;
  for(const s of (unit.statuses||[])){
    const d=STATUS_DEFS[s.id];
    if(d?.noAct || d?.autoAttack && s.id==='versteinert') return false;
    if(d?.noAct) return false;
  }
  return true;
}

export function isSilenced(unit){
  return (unit.statuses||[]).some(s=>s.id==='stille');
}

export function isBerserk(unit){
  return (unit.statuses||[]).some(s=>s.id==='berserker');
}

export function applyStatus(unit, id, turns){
  const def=STATUS_DEFS[id]; if(!def||!unit) return;
  if(unit.immune?.includes(id)) return;
  unit.statuses=unit.statuses||[];
  const ex=unit.statuses.find(s=>s.id===id);
  const t=turns??def.turns??3;
  if(ex) ex.turns=Math.max(ex.turns,t);
  else unit.statuses.push({id, turns:t});
}

export function tickStatuses(unit, log){
  if(!unit.alive) return;
  const msgs=[];
  unit.statuses=(unit.statuses||[]).map(s=>{
    const d=STATUS_DEFS[s.id];
    if(d?.dot){
      const dmg=Math.max(1, Math.floor(unit.maxhp*d.dot));
      unit.hp=Math.max(0, unit.hp-dmg);
      msgs.push(`${unit.name}: ${d.name} (−${dmg})`);
    }
    if(d?.hot){
      const h=Math.max(1, Math.floor(unit.maxhp*d.hot));
      unit.hp=Math.min(unit.maxhp, unit.hp+h);
      msgs.push(`${unit.name}: Regen (+${h})`);
    }
    if(d?.doom){
      if(s.turns<=1){ unit.hp=0; msgs.push(`${unit.name}: Doom!`); }
    }
    s.turns--; return s;
  }).filter(s=>s.turns>0);
  if(unit.hp<=0){ unit.alive=false; unit.hp=0; msgs.push(`${unit.name} fällt!`); }
  unit.guard=1;
  for(const m of msgs) log?.(m);
}

export function initStagger(foe){
  const max=foe.staggerMax || Math.round((foe.maxhp||foe.hp||50)*0.45);
  foe.stagger=0; foe.staggerMax=max; foe.staggered=false; foe.staggerTurns=0;
}

export function addStagger(foe, amount, diff){
  if(!foe||!foe.alive||foe.staggered) return false;
  const rate=diff?.staggerRate||1;
  foe.stagger=Math.min(foe.staggerMax, (foe.stagger|0)+amount*rate);
  if(foe.stagger>=foe.staggerMax){
    foe.staggered=true; foe.staggerTurns=3; foe.stagger=foe.staggerMax;
    foe.def=Math.max(1, Math.floor((foe.def||4)*0.5));
    return true;
  }
  return false;
}

export function tickStagger(foe, log){
  if(!foe?.staggered) return;
  foe.staggerTurns--;
  if(foe.staggerTurns<=0){
    foe.staggered=false; foe.stagger=0;
    foe.def=foe._baseDef??foe.def;
    log?.(`${foe.name} erholt sich vom Bruch.`);
  }
}

export function rollDamage(attacker, target, skill, opts={}){
  const pow=skill.pow||1;
  const mag=/feuer|eis|blitz|wasser|wind|erde|licht|dunkel|gift|techno/.test(skill.elem||'');
  const base=mag?(attacker.mag||6):(attacker.atk||8);
  let def=mag?(target.def||4)*0.6:(target.def||4);
  // Protect / Shell
  for(const s of (target.statuses||[])){
    const d=STATUS_DEFS[s.id];
    if(!mag && d?.physMit) def/=d.physMit; // lower mit → higher effective reduction via def scale
    if(mag && d?.magMit) def/=d.magMit;
  }
  // row: back row takes less phys, deals less phys melee
  let rowMult=1;
  if(!mag && !skill.ranged && !skill.jump){
    if(target.row==='back') rowMult*=0.7;
    if(attacker.row==='back') rowMult*=0.75;
  }
  if(skill.ranged && attacker.row==='back') rowMult*=1.1;
  let raw=(base*pow - def*0.45)*(0.9+Math.random()*0.25)*rowMult;
  const em=elemMult(target, skill.elem);
  if(em<0){ // absorb
    const heal=Math.max(1, Math.round(Math.abs(raw*em)));
    return {dmg:0, heal, crit:false, weak:false, immune:false, absorb:true, stagger:0};
  }
  if(em===0) return {dmg:0, heal:0, crit:false, weak:false, immune:true, absorb:false, stagger:0};
  raw*=em;
  raw*=(target.guard||1);
  if(attacker.statuses?.some(s=>STATUS_DEFS[s.id]?.atkMult)){
    const m=attacker.statuses.reduce((a,s)=>a*(STATUS_DEFS[s.id]?.atkMult||1),1);
    raw*=m;
  }
  if(target.staggered) raw*=2.0;
  const blind=(attacker.statuses||[]).some(s=>s.id==='blind');
  if(blind && Math.random()<(STATUS_DEFS.blind.hitPenalty||0.4)){
    return {dmg:0, heal:0, crit:false, weak:false, immune:false, absorb:false, miss:true, stagger:0};
  }
  const critChance=.08+(skill.critBonus||0)+(attacker.crit||0)+(attacker.spd||0)/200;
  const crit=Math.random()<critChance;
  if(crit) raw*=1.75;
  const diff=opts.diff||DIFFICULTY.normal;
  if(attacker.kind==='hero'||attacker.kind==='companion') raw*=diff.playerDmg;
  else raw*=diff.enemyDmg;
  const dmg=Math.max(1, Math.round(raw));
  // stagger buildup: weakness and crit fill faster
  let stag=Math.round(dmg*0.35);
  if(em>=1.5) stag=Math.round(stag*1.8);
  if(crit) stag=Math.round(stag*1.4);
  if(skill.staggerBonus) stag=Math.round(stag*skill.staggerBonus);
  return {dmg, heal:0, crit, weak:em>=1.5, immune:false, absorb:false, stagger:stag};
}

/** Gambit-like rules: first match wins */
export function defaultGambits(){
  return [
    {id:'heal_low', when:'hp_lt', value:0.3, action:'skill', skill:'Heilung', target:'self_lowest_hp'},
    {id:'revive', when:'ally_ko', action:'item', item:'Phönixfeder', target:'ko_ally'},
    {id:'buff_haste', when:'no_status', status:'hast', action:'skill', skill:'Eile', target:'self'},
    {id:'exploit_weak', when:'foe_weak', action:'skill_elem', target:'weak_foe'},
    {id:'attack', when:'always', action:'attack', target:'lowest_hp_foe'},
  ];
}

export function gambitDecide(actor, battle, gambits){
  const rules=gambits||actor.gambits||defaultGambits();
  const party=battle.party.filter(u=>true);
  const foes=battle.foes.filter(u=>u.alive);
  const livingParty=party.filter(u=>u.alive);
  for(const r of rules){
    if(r.on===false) continue;
    if(r.when==='hp_lt'){
      const t=livingParty.slice().sort((a,b)=>a.hp/a.maxhp-b.hp/b.maxhp)[0];
      if(t && t.hp/t.maxhp < (r.value||0.3)){
        const sk=(actor.skills||[]).find(s=>s.heal||s.name===r.skill)||{name:'Heilung',heal:40,mp:5};
        if((sk.mp|0)<=(actor.mp|0)) return {cmd:'skill', skill:sk, targetId:t._iid||t.id};
      }
    }
    if(r.when==='ally_ko'){
      const ko=party.find(u=>!u.alive);
      if(ko && (battle.S?.inv||[]).some(i=>(typeof i==='string'?i:i.name)===(r.item||'Phönixfeder'))){
        return {cmd:'item', item:r.item||'Phönixfeder', targetId:ko._iid||ko.id};
      }
    }
    if(r.when==='no_status'){
      if(!(actor.statuses||[]).some(s=>s.id===r.status)){
        const sk=(actor.skills||[]).find(s=>s.status===r.status||s.name===r.skill);
        if(sk && (sk.mp|0)<=(actor.mp|0)) return {cmd:'skill', skill:sk, targetId:actor._iid||actor.id};
      }
    }
    if(r.when==='foe_weak' && foes.length){
      for(const f of foes){
        const sk=(actor.skills||[]).find(s=>s.elem && (f.weak||[]).includes(s.elem));
        if(sk && (sk.mp|0)<=(actor.mp|0)) return {cmd:'skill', skill:sk, targetId:f._iid};
      }
    }
    if(r.when==='always' && foes.length){
      const t=foes.slice().sort((a,b)=>a.hp-b.hp)[0];
      return {cmd:'attack', targetId:t._iid};
    }
  }
  if(foes.length) return {cmd:'attack', targetId:foes[0]._iid};
  return null;
}

export const LIMIT_TIERS={
  1:{need:100, name:'Grenzwoge I', skills:{
    phys:{name:'Klingenorkan',pow:2.4,elem:'phys',aoe:true},
    mag:{name:'Sternenfall',pow:2.3,elem:'licht',aoe:true},
  }},
  2:{need:200, name:'Grenzwoge II', skills:{
    phys:{name:'Weltenteiler',pow:3.0,elem:'phys',aoe:true},
    mag:{name:'Äthernova',pow:2.9,elem:'licht',aoe:true},
  }},
  3:{need:300, name:'Grenzwoge III', skills:{
    phys:{name:'Endklinge',pow:3.6,elem:'phys',aoe:true},
    mag:{name:'Schöpfungsriss',pow:3.5,elem:'licht',aoe:true},
  }},
};

export function limitSkillFor(actor){
  const tier=actor.limitTier||1;
  const def=LIMIT_TIERS[tier]||LIMIT_TIERS[1];
  const mag=(actor.mag||0)>=(actor.atk||0);
  return {...(mag?def.skills.mag:def.skills.phys), limitTier:tier, limitName:def.name};
}

export function teamComboReady(a, b, S){
  if(!a||!b||!a.alive||!b.alive) return false;
  const names=[a.npcRef||a.name, b.npcRef||b.name];
  const rom=S?.romance||{};
  for(const n of names){
    const r=rom[n]; if(r && ((r.stage|0)>=2 || (r.affection|0)>=30)) return true;
  }
  // hero + companion always if affection
  if(a.kind==='hero' && b.kind==='companion'){
    const r=rom[b.npcRef||b.name]; return !!(r && (r.affection|0)>=20);
  }
  return false;
}

export function teamComboSkill(a,b){
  return {name:`Duett: ${a.name}+${b.name}`, pow:2.8, elem:'licht', aoe:true, teamCombo:true};
}

/** Headless sim for tests — runs until done or maxTurns */
export function simulateBattle(S, foes, opts={}){
  const diff=difficultyOf(S);
  ensureJobs(S); ensureGems(S); ensureSummons(S); ensureEquip(S);
  const eq=equippedStats(S);
  const gems=resolveLoadoutGems(S,{sockets:eq.sockets});
  const jb=jobStatBonus(S);
  const hero={
    id:'hero', kind:'hero', name:S.pc?.name||'Du',
    hp:(S.st.hp|100)+jb.hp+eq.hp, maxhp:(S.st.maxhp|100)+jb.hp+eq.hp,
    mp:(S.st.mp|40)+jb.mp+eq.mp, maxmp:(S.st.maxmp|40)+jb.mp+eq.mp,
    atk:10+jb.atk+eq.atk, def:6+jb.def+eq.def, mag:8+jb.mag+eq.mag, spd:10+jb.spd+eq.spd,
    crit:eq.crit||0, row:opts.heroRow||'front',
    limit:0, maxLimit:100, limitTier:S.battle?.limitTier||1, limitAcc:0,
    skills:[...availableAbilities(S).map(a=>({...a})), ...gems.spells],
    statuses:[], guard:1, alive:true, atb:0, job:S.jobs.active,
    gambits:S.battle?.gambits||defaultGambits(),
  };
  const party=[hero];
  // one companion for gambit test
  if(opts.companion!==false){
    const cname=Object.keys(S.romance||{})[0]||Object.keys(S.world?.npcs||{})[0];
    if(cname){
      party.push({
        id:'c1', kind:'companion', name:cname, npcRef:cname,
        hp:80, maxhp:80, mp:40, maxmp:40, atk:12, def:6, mag:14, spd:11,
        row:'back', limit:0, maxLimit:100, limitTier:1, limitAcc:0,
        skills:[{name:'Heilung',heal:40,mp:5},{name:'Feuerball',pow:1.4,elem:'feuer',mp:6},{name:'Eile',status:'hast',self:true,mp:5}],
        statuses:[], guard:1, alive:true, atb:20,
        gambits:defaultGambits(),
      });
    }
  }
  const F=foes.map((d,i)=>{
    const f={...d, _iid:(d.id||'e')+'_'+i, hp:Math.round((d.hp||50)*diff.enemyHp), maxhp:Math.round((d.hp||50)*diff.enemyHp),
      mp:d.mp|0, statuses:[], guard:1, alive:true, atb:Math.random()*30, analyzed:false,
      _baseDef:d.def|4, def:d.def|4, atk:d.atk|10, mag:d.mag|5, spd:d.spd|8};
    initStagger(f); return f;
  });
  if(opts.prefillLimit){ hero.limit=100; hero.limitAcc=250; hero.limitTier=2 }
  if(opts.boostMp){ hero.mp=hero.maxmp=Math.max(hero.maxmp,80) }
  if(opts.script?.length){ hero.hp=hero.maxhp=Math.max(hero.maxhp,220); hero.atb=99; hero.spd=Math.max(hero.spd,18) }

  const B={S, party, foes:F, turn:0, done:false, result:null, log:[], mode:opts.atbMode||'active',
    analyzed:{}, flags:{usedSummon:false, usedLimit:false, usedJobSwitch:false, usedGem:false, usedGambit:false, usedStagger:false}};
  const script=opts.script||[];
  let scriptIdx=0;
  let guard=0;
  while(!B.done && guard++<500){
    // ATB tick
    for(const u of [...party,...F]){
      if(!u.alive) continue;
      const spd=(u.spd||8)*statusSpdMult(u);
      u.atb=(u.atb||0)+Math.max(2, spd*0.9)*(B.mode==='wait'&&B._waiting?0:1);
    }
    const ready=[...party,...F].filter(u=>u.alive && (u.atb|0)>=100).sort((a,b)=>b.atb-a.atb);
    if(!ready.length) continue;
    const actor=ready[0]; actor.atb=0;
    tickStatuses(actor, m=>B.log.push(m));
    if(!actor.alive){ if(!party[0].alive){B.done=true;B.result='lose'} continue; }
    for(const f of F) tickStagger(f, m=>B.log.push(m));

    if(actor.kind==='hero'){
      let act=script[scriptIdx++];
      if(!act){
        // default: attack weakest
        const t=F.filter(f=>f.alive).sort((a,b)=>a.hp-b.hp)[0];
        act=t?{cmd:'attack',targetId:t._iid}:{cmd:'wait'};
      }
      resolveSimAction(B, actor, act);
    } else if(actor.kind==='companion'){
      const dec=gambitDecide(actor, B);
      if(dec){ B.flags.usedGambit=true; resolveSimAction(B, actor, dec); }
      else resolveSimAction(B, actor, {cmd:'attack', targetId:F.find(f=>f.alive)?._iid});
    } else {
      // enemy AI simple
      const t=party.filter(p=>p.alive).sort((a,b)=>a.hp-b.hp)[0];
      if(t) resolveSimAction(B, actor, {cmd:'attack', targetId:t.id||t.name});
    }
    if(!F.some(f=>f.alive)){ B.done=true; B.result='win'; }
    if(!party[0].alive){ B.done=true; B.result='lose'; }
    B.turn++;
  }
  return B;
}

function resolveSimAction(B, actor, act){
  const foes=B.foes.filter(f=>f.alive);
  const allies=B.party.filter(p=>p.alive);
  const isEnemy=actor.kind!=='hero' && actor.kind!=='companion';
  const pickFoe=id=>B.foes.find(f=>f._iid===id||f.id===id)||foes[0];
  const pickAlly=id=>B.party.find(p=>(p._iid||p.id)===id||p.name===id)||allies[0]||B.party[0];
  const pick=isEnemy?pickAlly:pickFoe;
  if(act.cmd==='jobswitch'){
    const r=switchJob(B.S, act.job);
    if(r.ok){ actor.job=act.job; actor.skills=availableAbilities(B.S).map(a=>({...a})); B.flags.usedJobSwitch=true; B.log.push(r.text); }
    return;
  }
  if(act.cmd==='summon'){
    const sp=summonPower(B.S, act.id); if(!sp) return;
    if((actor.mp|0)<sp.cost) return;
    actor.mp-=sp.cost; B.flags.usedSummon=true;
    bondSummon(B.S, act.id, 15);
    B.log.push(`${actor.name} ruft ${sp.name}: ${sp.skillName}!`);
    for(const t of (sp.aoe?foes:[pick(act.targetId)].filter(Boolean))){
      const sk={name:sp.skillName,pow:sp.pow,elem:sp.elem};
      hit(B,actor,t,sk);
    }
    if(sp.healParty) for(const p of B.party.filter(x=>x.alive)) p.hp=Math.min(p.maxhp,p.hp+sp.healParty);
    return;
  }
  if(act.cmd==='limit'){
    const sk=limitSkillFor(actor);
    actor.limit=0; B.flags.usedLimit=true;
    B.log.push(`✦ ${sk.limitName}: ${sk.name}!`);
    for(const t of foes) hit(B,actor,t,sk);
    return;
  }
  if(act.cmd==='skill'){
    const sk=typeof act.skill==='string'?(actor.skills||[]).find(s=>s.name===act.skill||s.id===act.skill)||{name:act.skill,pow:1.2,mp:4}:act.skill;
    if((sk.mp|0)>(actor.mp|0)) return;
    actor.mp-=sk.mp|0;
    if(sk.fromGem) B.flags.usedGem=true;
    if(sk.heal){ const t=pickAlly(act.targetId); t.hp=Math.min(t.maxhp,t.hp+(sk.heal|0)); B.log.push(`${actor.name}: ${sk.name} +${sk.heal}`); return; }
    if(sk.status && sk.self){ applyStatus(actor, sk.status, 4); B.log.push(`${actor.name}: ${sk.name}`); return; }
    if(sk.revive){ const t=B.party.find(p=>!p.alive); if(t){ t.alive=true; t.hp=Math.floor(t.maxhp*(sk.revive||0.4)); B.log.push(`${t.name} erweckt!`); } return; }
    const targets=sk.aoe?foes:[pickFoe(act.targetId)].filter(Boolean);
    for(const t of targets) hit(B,actor,t,sk);
    return;
  }
  if(act.cmd==='item'){
    const t=pickAlly(act.targetId);
    if(/phönix|phoenix|feder/i.test(act.item||'')){
      if(t && !t.alive){ t.alive=true; t.hp=Math.floor(t.maxhp*0.4); B.log.push(`${t.name} durch Phönixfeder zurück!`); }
    }
    return;
  }
  // attack — enemies hit party, heroes hit foes
  const t=isEnemy?pickAlly(act.targetId):pickFoe(act.targetId);
  if(t) hit(B,actor,t,{name:'Angriff',pow:1.0,elem:'phys'});
}

function hit(B, attacker, target, skill){
  if(!target||!target.alive) return;
  const {dmg,heal,crit,weak,immune,absorb,miss,stagger}=rollDamage(attacker,target,skill,{diff:difficultyOf(B.S)});
  if(miss){ B.log.push(`${attacker.name} verfehlt ${target.name}.`); return; }
  if(absorb){ target.hp=Math.min(target.maxhp,target.hp+heal); B.log.push(`${target.name} absorbiert (${heal})`); return; }
  if(immune){ B.log.push(`${target.name} immun!`); return; }
  target.hp=Math.max(0,target.hp-dmg);
  B.log.push(`${attacker.name} (${skill.name}) → ${target.name}: ${dmg}${crit?' KRIT':''}${weak?' SCHWACH':''}${target.staggered?' BRUCH×2':''}`);
  if(addStagger(target, stagger, difficultyOf(B.S))){ B.flags.usedStagger=true; B.log.push(`${target.name} — BRUCH!`); }
  attacker.limit=Math.min(100,(attacker.limit|0)+Math.min(25,5+dmg/6|0));
  attacker.limitAcc=(attacker.limitAcc|0)+dmg;
  if(target.hp<=0){ target.alive=false; target.hp=0; B.log.push(`${target.name} besiegt!`); }
}

export function applyBattleRewards(S, B){
  if(!S||!B||B.result!=='win') return {xp:0,ap:0,gil:0};
  const killed=B.foes.filter(f=>!f.alive);
  const xp=killed.reduce((s,f)=>s+(f.exp||20),0);
  const gil=killed.reduce((s,f)=>s+(f.gold||10),0);
  const ap=Math.max(8, Math.round(xp/4));
  S.st.xp=(S.st.xp|0)+xp;
  S.st.gold=(S.st.gold|0)+gil;
  const learned=grantJobAp(S, ap);
  ensureGems(S);
  for(const g of S.gems.inventory) grantGemXp(g, Math.max(3, Math.round(ap/3)));
  return {xp, ap, gil, learned:learned.map(a=>a.name)};
}

export default {
  STATUS_DEFS, DIFFICULTY, difficultyOf, elemMult, rollDamage, applyStatus, tickStatuses,
  initStagger, addStagger, tickStagger, canAct, isSilenced, isBerserk, statusSpdMult,
  defaultGambits, gambitDecide, LIMIT_TIERS, limitSkillFor, teamComboReady, teamComboSkill,
  simulateBattle, applyBattleRewards, ELEMENTS, ELEM_LABEL
};
