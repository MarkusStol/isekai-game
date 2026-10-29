/** v17.1 hub screens — equipment/gems, gambits, jobs, craft, summons (iPhone-friendly tap UI) */
import * as Jobs from './jobs.js';
import * as Gems from './gems.js';
import * as Summons from './summons.js';
import * as Equip from './equip.js';
import * as Jrpg from './jrpg.js';
import { ENEMIES, enemyById } from './enemies.js';

function card(html){ const d=document.createElement('div'); d.className='card v17-card'; d.innerHTML=html; return d }
function btn(label, cls=''){ const b=document.createElement('button'); b.type='button'; b.className='tiny '+(cls||''); b.textContent=label; return b }
function refresh(body, S, helpers, fn){ body.innerHTML=''; fn(body,S,helpers) }

/* ---- Equipment + Aetherkristalle ---- */
export function renderEquip(body, S, helpers){
  const {toast, save}=helpers;
  Equip.ensureEquip(S); Gems.ensureGems(S);
  const eq=S.equip;
  const stats=Equip.equippedStats(S);
  const gemLoad=Gems.resolveLoadoutGems(S,{sockets:stats.sockets});
  const sel=S._uiGemSel||null; // selected gem uid for socketing

  const head=card(`<h3>⚔ Ausrüstung</h3>
    <p class="meta">ATK ${stats.atk} · DEF ${stats.def} · MAG ${stats.mag} · SPD ${stats.spd}${stats.elem?' · Elem '+stats.elem:''}</p>
    <p class="meta">Kristalle: ${gemLoad.spells.map(s=>s.name).join(', ')||'keine'}${gemLoad.links.length?' · Links: '+gemLoad.links.join(', '):''}</p>`);
  body.appendChild(head);

  const slots=[['weapon','Waffe'],['armor','Rüstung'],['accessory','Accessoire']];
  for(const [slot,lab] of slots){
    const id=eq[slot]; const it=id?Equip.getItem(id):null;
    const c=card(`<h3>${lab}</h3>
      <p><b>${it?((it.icon||'')+' '+it.name):'—'}</b>${it?` <span class="rarity r-${it.rarity}">${Equip.RARITY_LABEL[it.rarity]||it.rarity}</span>`:''}${id&&eq.upgrades[id]?` +${eq.upgrades[id]}`:''}</p>
      <div class="sock-row" data-item="${id||''}"></div>
      <div class="row slot-acts"></div>`);
    const sockRow=c.querySelector('.sock-row');
    if(it && (it.sockets|0)>0){
      const socks=eq.sockets[id]=eq.sockets[id]||Array(it.sockets).fill(null);
      socks.forEach((uid,i)=>{
        const gem=uid?S.gems.inventory.find(g=>g.uid===uid):null;
        const def=gem?Gems.gemDef(gem):null;
        const sbtn=document.createElement('button'); sbtn.type='button'; sbtn.className='sock '+(gem?'filled':'empty')+(sel?' target':'');
        sbtn.innerHTML=gem?`<span style="color:${def?.color||'#fff'}">◆</span><small>${def?.name||'?'} Lv${gem.lvl}</small>`:`<span>○</span><small>Sockel ${i+1}</small>`;
        sbtn.onclick=()=>{
          if(sel){
            const r=Equip.socketGem(S,id,i,sel);
            S._uiGemSel=null;
            toast?.(r.ok?`Gesockelt: ${Gems.gemDef(S.gems.inventory.find(g=>g.uid===sel))?.name}`:'Sockel belegt');
            save?.(); refresh(body,S,helpers,renderEquip);
          } else if(uid){
            // unsocket
            socks[i]=null; toast?.('Kristall entfernt'); save?.(); refresh(body,S,helpers,renderEquip);
          } else toast?.('Wähle zuerst einen Kristall unten');
        };
        sockRow.appendChild(sbtn);
      });
      // link viz
      if(socks.filter(Boolean).length>=2){
        const links=document.createElement('div'); links.className='link-viz';
        const resolved=Gems.resolveLoadoutGems(S,{sockets:socks.filter(Boolean)});
        links.textContent=resolved.links.length?'🔗 '+resolved.links.join(' · '):'Keine Link-Kombo';
        c.appendChild(links);
      }
    }
    const acts=c.querySelector('.slot-acts');
    // change equipment from inventory list of that slot type
    const pool=eq.inventory.filter(iid=>{
      const x=Equip.getItem(iid); return x && x.slot===slot;
    });
    pool.forEach(iid=>{
      const x=Equip.getItem(iid); if(!x)return;
      const b=btn((eq[slot]===iid?'✓ ':'')+x.name+(eq.upgrades[iid]?` +${eq.upgrades[iid]}`:''), eq[slot]===iid?'on':'');
      b.onclick=()=>{ eq[slot]=iid; if(x.sockets&&!eq.sockets[iid]) eq.sockets[iid]=Array(x.sockets).fill(null); toast?.('Angelegt: '+x.name); save?.(); refresh(body,S,helpers,renderEquip) };
      acts.appendChild(b);
    });
    if(slot==='accessory'){
      const clear=btn('Ablegen','ghost'); clear.onclick=()=>{eq.accessory=null;save?.();refresh(body,S,helpers,renderEquip)}; acts.appendChild(clear);
    }
    body.appendChild(c);
  }

  const gems=card(`<h3>◆ Aetherkristalle</h3>
    <p class="meta">Tippe einen Kristall, dann einen Sockel. Tippe einen gefüllten Sockel zum Entfernen.</p>
    <div class="gem-grid" id="gemGrid"></div>`);
  const grid=gems.querySelector('#gemGrid');
  (S.gems.inventory||[]).forEach(g=>{
    const def=Gems.gemDef(g); if(!def)return;
    const used=Object.values(eq.sockets||{}).flat().includes(g.uid);
    const b=document.createElement('button'); b.type='button';
    b.className='gem-chip '+(sel===g.uid?'sel':'')+(used?' used':'');
    b.innerHTML=`<span class="gem-dot" style="background:${def.color}"></span>
      <b>${def.name}</b><small>Lv ${g.lvl}/${def.maxLvl} · ${def.link}${used?' · sockel':''}</small>
      <div class="gem-xp"><i style="width:${Math.min(100,(g.xp||0)/Gems.gemXpToNext(g.lvl)*100)}%"></i></div>`;
    b.onclick=()=>{ S._uiGemSel = sel===g.uid?null:g.uid; refresh(body,S,helpers,renderEquip) };
    grid.appendChild(b);
  });
  if(!(S.gems.inventory||[]).length) grid.innerHTML='<p class="meta">Keine Kristalle — stiehl oder finde welche.</p>';
  body.appendChild(gems);
}

/* ---- Einsatzregeln / Gambits ---- */
export function renderGambits(body, S, helpers){
  const {toast, save}=helpers;
  S.battle=S.battle||{};
  // per companion + hero
  const targets=[{id:'hero', name:S.pc?.name||'Du'}];
  for(const n of (S.party||[]).concat(Object.keys(S.romance||{}))){
    if(!targets.some(t=>t.id===n) && S.world?.npcs?.[n]?.alive!==false) targets.push({id:n, name:n});
  }
  const cur=S._uiGambitWho||'hero';
  S.battle.gambitMap=S.battle.gambitMap||{};
  if(!S.battle.gambitMap[cur]) S.battle.gambitMap[cur]=(S.battle.gambits||Jrpg.defaultGambits()).map(g=>({...g, on:g.on!==false}));

  const head=card(`<h3>🎯 Einsatzregeln</h3>
    <p class="meta">Wenn/Dann-Regeln für Begleiter (und dich im Auto). Reihenfolge von oben nach unten.</p>
    <div class="row" id="gWho"></div>`);
  body.appendChild(head);
  const who=head.querySelector('#gWho');
  targets.slice(0,6).forEach(t=>{
    const b=btn(t.name, cur===t.id?'on':'');
    b.onclick=()=>{ S._uiGambitWho=t.id; refresh(body,S,helpers,renderGambits) };
    who.appendChild(b);
  });

  const rules=S.battle.gambitMap[cur];
  rules.forEach((r,i)=>{
    const c=card(`<div class="gambit-line">
      <label class="gambit-tog"><input type="checkbox" ${r.on!==false?'checked':''}/> an</label>
      <div class="gambit-body">
        <b>#${i+1}</b>
        <select data-f="when">${['always','hp_lt','ally_ko','no_status','foe_weak'].map(w=>`<option value="${w}" ${r.when===w?'selected':''}>${w}</option>`).join('')}</select>
        ${r.when==='hp_lt'?`<input data-f="value" type="number" step="0.05" min="0.1" max="0.9" value="${r.value??0.3}" class="tiny-inp"/>`:''}
        →
        <select data-f="action">${['attack','skill','item'].map(a=>`<option value="${a}" ${r.action===a?'selected':''}>${a}</option>`).join('')}</select>
        <input data-f="skill" placeholder="Skill/Item" value="${r.skill||r.item||''}" class="tiny-inp"/>
      </div>
      <div class="gambit-ord"></div>
    </div>`);
    c.querySelector('input[type=checkbox]').onchange=e=>{ r.on=e.target.checked; if(cur==='hero') S.battle.gambits=rules; save?.() };
    c.querySelectorAll('[data-f]').forEach(el=>{
      el.onchange=el.oninput=()=>{
        const f=el.dataset.f; let v=el.value;
        if(f==='value') v=parseFloat(v)||0.3;
        r[f]=v;
        if(f==='action'&&v==='item') r.item=r.skill||'Phönixfeder';
        if(cur==='hero') S.battle.gambits=rules;
        save?.();
      };
    });
    const ord=c.querySelector('.gambit-ord');
    const up=btn('↑'); up.disabled=i===0; up.onclick=()=>{ const x=rules.splice(i,1)[0]; rules.splice(i-1,0,x); if(cur==='hero')S.battle.gambits=rules; save?.(); refresh(body,S,helpers,renderGambits) };
    const down=btn('↓'); down.disabled=i===rules.length-1; down.onclick=()=>{ const x=rules.splice(i,1)[0]; rules.splice(i+1,0,x); if(cur==='hero')S.battle.gambits=rules; save?.(); refresh(body,S,helpers,renderGambits) };
    const del=btn('✕','ghost'); del.onclick=()=>{ rules.splice(i,1); if(cur==='hero')S.battle.gambits=rules; save?.(); refresh(body,S,helpers,renderGambits) };
    ord.append(up,down,del);
    body.appendChild(c);
  });

  const add=card(`<div class="row" id="gAdd"></div>`);
  const addBtn=btn('+ Regel','accent'); addBtn.onclick=()=>{
    rules.push({id:'r'+Date.now(), when:'always', action:'attack', target:'lowest_hp_foe', on:true});
    if(cur==='hero') S.battle.gambits=rules; save?.(); refresh(body,S,helpers,renderGambits);
  };
  const reset=btn('Standard'); reset.onclick=()=>{
    S.battle.gambitMap[cur]=Jrpg.defaultGambits().map(g=>({...g,on:true}));
    if(cur==='hero') S.battle.gambits=S.battle.gambitMap[cur];
    toast?.('Zurückgesetzt'); save?.(); refresh(body,S,helpers,renderGambits);
  };
  add.querySelector('#gAdd').append(addBtn,reset);
  body.appendChild(add);
}

/* ---- Berufe ---- */
export function renderJobs(body, S, helpers){
  const {toast, save}=helpers;
  Jobs.ensureJobs(S);
  const j=S.jobs;
  const active=Jobs.JOBS[j.active];
  const head=card(`<h3>🏷 Berufe</h3>
    <p>Aktiv: <b>${active?.icon||''} ${active?.name||j.active}</b> · Lv ${j.levels[j.active]|1} · AP ${j.ap[j.active]|0}/100</p>
    <p class="meta">${active?.desc||''}</p>
    <div class="ap-bar"><i style="width:${(j.ap[j.active]|0)}%"></i></div>`);
  body.appendChild(head);

  const list=card(`<h3>Freigeschaltet</h3><div class="job-grid" id="jobGrid"></div>`);
  const grid=list.querySelector('#jobGrid');
  (j.unlocked||[]).forEach(id=>{
    const job=Jobs.JOBS[id]; if(!job)return;
    const b=document.createElement('button'); b.type='button';
    b.className='job-chip '+(j.active===id?'on':'');
    b.innerHTML=`<span>${job.icon}</span><b>${job.name}</b><small>Lv ${j.levels[id]|1} · AP ${j.ap[id]|0}</small>`;
    b.onclick=()=>{
      const r=Jobs.switchJob(S,id); toast?.(r.text); save?.(); refresh(body,S,helpers,renderJobs);
    };
    grid.appendChild(b);
  });
  body.appendChild(list);

  // locked preview
  const locked=Object.keys(Jobs.JOBS).filter(id=>!(j.unlocked||[]).includes(id));
  if(locked.length){
    const lc=card(`<h3>Gesperrt</h3><p class="meta">${locked.map(id=>Jobs.JOBS[id].icon+' '+Jobs.JOBS[id].name).join(' · ')}</p>
      <button type="button" class="tiny" id="unlockHint">Freischalten (Test/Quest)</button>`);
    lc.querySelector('#unlockHint').onclick=()=>{
      const id=locked[0]; Jobs.unlockJob(S,id); toast?.('Freigeschaltet: '+Jobs.JOBS[id].name); save?.(); refresh(body,S,helpers,renderJobs);
    };
    body.appendChild(lc);
  }

  const abs=Jobs.availableAbilities(S);
  const ab=card(`<h3>Fähigkeiten (mitgetragen)</h3>
    <ul class="abil-list">${abs.map(a=>`<li><b>${a.name}</b> <span class="meta">${a.mp?a.mp+' MP':''}${a.elem?' · '+a.elem:''}${a.heal?' · Heilung':''} · Job-Lv ${a.lvl}</span></li>`).join('')||'<li class="meta">Keine</li>'}</ul>
    <p class="meta">Gelernt gesamt: ${(j.learned||[]).length}</p>`);
  body.appendChild(ab);
}

/* ---- Craft / Upgrade ---- */
export function renderCraft(body, S, helpers){
  const {toast, save}=helpers;
  body.classList.add('craft-shop-body');
  Equip.ensureEquip(S);
  try{ window.__game?.C40?.ensureCraft40?.(S); window.__game?.C40?.syncCraftProgress?.(S); }catch(_){}
  const mats=S.equip.mats||{};
  const tier=window.__game?.C40 ? (window.__game.C39?.gearTierAvailable?.(S)||S.content39?.flags?.gearTier|1) : (S.content39?.flags?.gearTier|1);
  const c40=S.craft40||{};
  const stations=Object.entries(window.__game?.C40?.CRAFT_STATIONS||{}).map(([id,def])=>{
    const st=c40.stations?.[id];
    const sk=c40.skills?.[def.skill]|0;
    return `${def.icon} ${def.name}:${st?.unlocked?('L'+sk):'🔒'}`;
  }).join(' · ')||'Küche';
  try{ window.__game?.C41?.ensureCraft41?.(S); window.__game?.C41?.syncCraftProgress41?.(S); }catch(_){}
  const xp=S.craft40?.skillXp||{};
  const sk=S.craft40?.skills||{};
  const xpLine=['schmieden','kochen','alchemie'].map(s=>{
    const lv=sk[s]|0; const need=window.__game?.C41?.CRAFT_XP_TO_NEXT?.[lv]||'—';
    return `${s} Lv${lv} (${xp[s]|0}/${need})`;
  }).join(' · ');
  body.appendChild(card(`<div class="craft-header-compact"><h3>🔨 Werkstatt</h3>
    <p class="meta">Gil ${S.st?.gold|0} · Tier ${tier} · ${stations}</p>
    <p class="meta">Mats: ${Object.entries(mats).filter(([,n])=>n>0).slice(0,8).map(([k,v])=>`${k}×${v}`).join(' · ')||'leer'}</p>
    <p class="meta craft-xp">${xpLine}</p>
    <div class="craft-train-row" id="craftTrain"></div></div>`));
  const tr=body.querySelector('#craftTrain');
  if(tr){
    ['schmieden','kochen','alchemie'].forEach(skill=>{
      const b=btn('Trainiere '+skill);
      b.onclick=()=>{
        const r=window.__game?.C41?.trainCraftSkill?.(S,skill)||{ok:false,text:'C41 fehlt'};
        toast?.(r.text); save?.(); body.innerHTML=''; renderCraft(body,S,helpers);
      };
      tr.appendChild(b);
    });
  }

  const craft=card(`<h3>Herstellen</h3><div id="craftList"></div>`);
  const list=craft.querySelector('#craftList');
  Equip.CRAFT_RECIPES.forEach(rec=>{
    const it=Equip.getItem(rec.id);
    const gate=(window.__game?.C41?.canCraftRecipe41||window.__game?.C40?.canCraftRecipe)?.(S,rec.id,'craft')||{ok:true};
    const row=document.createElement('div'); row.className='pixel-shop-row craft-row'+(gate.ok?'':' locked');
    row.innerHTML=`<div class="shop-ico">${it?.icon||'📦'}</div><div class="shop-info"><b>${it?.name||rec.id}</b><span class="meta">T${(rec.tier||1)} · ${Object.entries(rec.mats).map(([k,v])=>`${k}×${v}`).join(', ')}${gate.ok?'':' · 🔒'}</span></div><div class="shop-side"><div class="shop-price">${rec.gold} Gil</div></div>`;
    const b=btn(gate.ok?'Herstellen':'Gesperrt'); b.className='shop-buy'; b.disabled=!gate.ok;
    b.onclick=()=>{ const r=Equip.craftItem(S,rec.id); toast?.(r.text); save?.(); body.innerHTML=''; renderCraft(body,S,helpers) };
    (row.querySelector('.shop-side')||row).appendChild(b); list.appendChild(row);
  });
  body.appendChild(craft);

  const cook=card(`<h3>Kochen</h3><div id="cookList"></div>`);
  const cl=cook.querySelector('#cookList');
  (Equip.COOK_RECIPES||[]).forEach(rec=>{
    const gate=(window.__game?.C41?.canCraftRecipe41||window.__game?.C40?.canCraftRecipe)?.(S,rec.id,'cook')||{ok:true};
    const row=document.createElement('div'); row.className='pixel-shop-row craft-row'+(gate.ok?'':' locked');
    row.innerHTML=`<div class="shop-ico">🍲</div><div class="shop-info"><b>${rec.name}</b><span class="meta">T${(rec.tier||1)} · +${rec.heal|0}HP${rec.mp?` +${rec.mp}MP`:''}${gate.ok?'':' · 🔒'}</span></div><div class="shop-side"><div class="shop-price">kochen</div></div>`;
    const b=btn(gate.ok?'Kochen':'Gesperrt'); b.className='shop-buy'; b.disabled=!gate.ok;
    b.onclick=()=>{ const r=Equip.cookItem(S,rec.id); toast?.(r.text); save?.(); body.innerHTML=''; renderCraft(body,S,helpers) };
    (row.querySelector('.shop-side')||row).appendChild(b); cl.appendChild(row);
  });
  body.appendChild(cook);

  const up=card(`<h3>Aufwerten</h3><div id="upList"></div>`);
  const ul=up.querySelector('#upList');
  const owned=new Set([...(S.equip.inventory||[]), S.equip.weapon, S.equip.armor, S.equip.accessory].filter(Boolean));
  [...owned].forEach(id=>{
    const it=Equip.getItem(id); if(!it)return;
    const lvl=S.equip.upgrades[id]|0;
    const cost=30+(lvl+1)*25;
    const row=document.createElement('div'); row.className='pixel-shop-row craft-row';
    row.innerHTML=`<div class="shop-ico">${it.icon||'⬆'}</div><div class="shop-info"><b>${it.name}</b> +${lvl}<span class="meta">Nächste Stufe</span></div><div class="shop-side"><div class="shop-price">${cost} Gil</div></div>`;
    const b=btn('Upgrade'); b.className='shop-buy';
    b.onclick=()=>{ const r=Equip.upgradeItem(S,id); toast?.(r.text); save?.(); body.innerHTML=''; renderCraft(body,S,helpers) };
    (row.querySelector('.shop-side')||row).appendChild(b); ul.appendChild(row);
  });
  body.appendChild(up);
}

/* ---- Sternengeister ---- */
export function renderSummons(body, S, helpers){
  const {toast, save, openTab}=helpers;
  Summons.ensureSummons(S);
  body.appendChild(card(`<h3>🌟 Sternengeister</h3>
    <p class="meta">Beschwörungen im Kampf über das Menü. Bande wachsen durch Nutzung.</p>`));

  const owned=Summons.ownedSummons(S);
  owned.forEach(sp=>{
    const bond=S.summons.bonds[sp.id]||{lvl:1,xp:0};
    const c=card(`<div class="summon-row">
      <div class="summon-ico">${sp.icon}</div>
      <div style="flex:1">
        <h3>${sp.name} <span class="meta">${sp.elem}</span></h3>
        <p>${sp.lore}</p>
        <p class="meta">${sp.skillName} · ${sp.cost} MP · Band Lv ${bond.lvl}</p>
        <div class="ap-bar"><i style="width:${Math.min(100,(bond.xp||0)/(50+bond.lvl*20)*100)}%"></i></div>
      </div>
    </div>`);
    body.appendChild(c);
  });

  const locked=Object.values(Summons.STERNENGEISTER).filter(s=>!S.summons.owned.includes(s.id));
  if(locked.length){
    body.appendChild(card(`<h3>Noch ungebunden</h3>
      <ul class="abil-list">${locked.map(s=>`<li>${s.icon} <b>${s.name}</b> — <span class="meta">${s.lore.slice(0,70)}…</span></li>`).join('')}</ul>`));
  }

  const trial=card(`<h3>Prüfung der Ätherwyrm</h3>
    <p class="meta">Optionaler Superboss — mehrphasig, mit Bruchfenstern. Nicht story-pflichtig.</p>`);
  const go=btn('Eternalis herausfordern','accent');
  go.onclick=()=>{
    helpers.closeMenu?.();
    helpers.startSuperboss?.(S);
  };
  trial.appendChild(go);
  body.appendChild(trial);
}

export function startSuperbossSetpiece(S, Battle, helpers={}){
  const foe=enemyById('superboss_aether');
  if(!foe){ helpers.toast?.('Superboss fehlt'); return null }
  // scripted intro via offerEncounter
  const blurb='Der Ätherwyrm Eternalis öffnet ein Sternentor. Du kannst kämpfen, reden oder fliehen — nichts zwingt dich.';
  return Battle.offerEncounter(S,{
    enemies:[foe],
    blurb,
    bg:'assets/bg/battle/arena-daemon.webp',
    boss:true
  });
}

export const JRPG_HUB_TILES=[
  {id:'equip',icon:'⚔',label:'Ausrüstung'},
  {id:'jobs',icon:'🏷',label:'Berufe'},
  {id:'gems',icon:'◆',label:'Kristalle'},
  {id:'gambits',icon:'🎯',label:'Einsatz'},
  {id:'craft',icon:'🔨',label:'Werkstatt'},
  {id:'summons',icon:'🌟',label:'Geister'},
];

export default {renderEquip, renderGambits, renderJobs, renderCraft, renderSummons, startSuperbossSetpiece, JRPG_HUB_TILES};
