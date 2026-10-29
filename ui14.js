/** v14 hub menu (Genshin/Persona-like), Begegnung, leveling panels */
import * as Level from './leveling.js';
import * as Codex from './codex.js';
import * as UI13 from './ui13.js';

export const HUB_PRIMARY=[
  {id:'status',icon:'status',label:'Status'},
  {id:'equip',icon:'equip',label:'Ausrüstung'},
  {id:'inv',icon:'inv',label:'Inventar'},
  {id:'quests',icon:'quests',label:'Quests'},
  {id:'atlas',icon:'atlas',label:'Weltkarte'},
  {id:'craft',icon:'craft',label:'Werkstatt'},
];
export const HUB_MORE=[
  {id:'level',icon:'level',label:'Aufstieg'},
  {id:'jobs',icon:'jobs',label:'Berufe'},
  {id:'gambits',icon:'gambits',label:'Einsatz'},
  {id:'summons',icon:'summons',label:'Geister'},
  {id:'skills',icon:'skills',label:'Fähigkeiten'},
  {id:'rels',icon:'rels',label:'Beziehungen'},
  {id:'home',icon:'home',label:'Zuhause'},
  {id:'journal',icon:'journal',label:'Chronik'},
  {id:'finance',icon:'finance',label:'Finanzen'},
  {id:'kingdom',icon:'kingdom',label:'Reich'},
  {id:'codex',icon:'codex',label:'Codex'},
];
export const HUB_TILES=[...HUB_PRIMARY, ...HUB_MORE];
function hubIcon(id){return `<svg class="ico" aria-hidden="true"><use href="#i-${id}"></use></svg>`}


export function openHub(root, S, helpers){
  const {closeMenu, openTab, imgUrl}=helpers;
  root.innerHTML='';
  try{ Level.ensureProgress(S); }catch(_){}
  const wrap=document.createElement('div'); wrap.className='hub';
  const head=document.createElement('div'); head.className='hub-hero';
  let sum;
  try{ sum=Level.summary(S); }catch(_){
    sum={className:'Held:in',branch:'',title:'Neuling',lvl:1,xp:0,next:100,attrs:{str:5,dex:5,int:5,wil:5,cha:5,vit:5}};
  }
  let port='assets/port/heldin.webp';
  try{
    if(S.pc?.portrait) port=`assets/port/${S.pc.portrait}.webp`;
    else if(S.role==='held') port='assets/port/heldin.webp';
    else if(S.role==='grey') port='assets/port/grey/darren.webp';
    else if(window.__game?.C57?.hubPortraitFallback) port=window.__game.C57.hubPortraitFallback(S);
    else {
      const g=String(S.genre||'').toLowerCase();
      if(/zombie|apoc/.test(g)) port='assets/port/zombie/leader.webp';
      else if(/cyber|neon|punk/.test(g)) port='assets/port/cyberpunk/runner.webp';
      else if(/dark|horror|gothic/.test(g)) port='assets/port/darkfantasy/jaeger.webp';
    }
  }catch(_){ port='assets/port/heldin.webp'; }
  const portFallback='assets/port/heldin.webp';
  head.innerHTML=`<div class="hub-hero-art" style="background-image:url('${port}'),url('${portFallback}');background-size:contain;background-repeat:no-repeat;background-color:#0a0810"></div>
    <div class="hub-hero-meta">
      <div class="hub-name">${S.pc?.name||'Held:in'}</div>
      <div class="hub-sub">${sum.className}${sum.branch?' · '+sum.branch:''} · ${sum.title}</div>
      <div class="hub-lvl">Lv ${sum.lvl} · XP ${sum.xp}/${sum.next} · 🪙 ${S.st?.gold|0}</div>
      <div class="hub-attrs">${Object.entries(sum.attrs).map(([k,v])=>`<span>${Level.ATTR_LABEL[k].slice(0,3)} ${v}</span>`).join('')}</div>
    </div>`;
  wrap.appendChild(head);
  const mkTile=(t)=>{
    const b=document.createElement('button'); b.type='button'; b.className='hub-tile';
    b.innerHTML=`<span class="hub-ico">${hubIcon(t.icon)}</span><span class="hub-lab">${t.label}</span>`;
    b.onclick=()=>openTab(t.id);
    return b;
  };
  const grid=document.createElement('div'); grid.className='hub-grid hub-grid-primary';
  HUB_PRIMARY.forEach(t=>grid.appendChild(mkTile(t)));
  wrap.appendChild(grid);
  const moreWrap=document.createElement('div'); moreWrap.className='hub-more-wrap';
  const moreBtn=document.createElement('button'); moreBtn.type='button'; moreBtn.className='hub-more-btn';
  moreBtn.textContent='Weitere Menüs';
  const moreGrid=document.createElement('div'); moreGrid.className='hub-grid hub-grid-more hidden';
  HUB_MORE.forEach(t=>moreGrid.appendChild(mkTile(t)));
  moreBtn.onclick=()=>{
    const open=moreGrid.classList.toggle('hidden')===false;
    moreBtn.textContent=open?'Weniger':'Weitere Menüs';
    moreBtn.classList.toggle('on', open);
  };
  moreWrap.appendChild(moreBtn); moreWrap.appendChild(moreGrid);
  wrap.appendChild(moreWrap);
  root.appendChild(wrap);
}

export function renderLevel(body, S, {act, closeMenu, toast}){
  Level.ensureProgress(S);
  const sum=Level.summary(S);
  const card=document.createElement('div'); card.className='card';
  card.innerHTML=`<h3>⬆ Aufstieg</h3>
    <p>Level <b>${sum.lvl}</b> · XP ${sum.xp}/${sum.next} · Titel: <b>${sum.title}</b></p>
    <p class="meta">Klasse: ${sum.className}${sum.branch?' → '+sum.branch:''} · Attributspunkte: <b>${sum.points}</b></p>
    <div class="attr-row">${Object.entries(sum.attrs).map(([k,v])=>
      `<button type="button" class="tiny attr-btn" data-a="${k}">${Level.ATTR_LABEL[k]} <b>${v}</b>${sum.points?' +':''}</button>`).join('')}</div>`;
  body.appendChild(card);
  card.querySelectorAll('.attr-btn').forEach(b=>{
    b.onclick=()=>{const r=Level.spendAttr(S,b.dataset.a); toast&&toast(r.text||''); renderLevel(body,S,{act,closeMenu,toast}); body.innerHTML=''; renderLevel(body,S,{act,closeMenu,toast})}
  });
  // class / branch
  const cls=document.createElement('div'); cls.className='card';
  cls.innerHTML=`<h3>Klasse & Zweig</h3><div class="row" id="clsRow"></div><div class="row" id="brRow"></div>`;
  body.appendChild(cls);
  const clsRow=cls.querySelector('#clsRow');
  Object.values(Level.CLASSES).forEach(c=>{
    const b=document.createElement('button'); b.type='button'; b.className='tiny'; b.textContent=c.icon+' '+c.name;
    if(S.progress.classId===c.id)b.classList.add('on');
    b.onclick=()=>{Level.setClass(S,c.id); body.innerHTML=''; renderLevel(body,S,{act,closeMenu,toast})};
    clsRow.appendChild(b);
  });
  const brRow=cls.querySelector('#brRow');
  const cur=Level.CLASSES[S.progress.classId];
  (cur?.branches||[]).forEach(id=>{
    const b=Level.BRANCH[id]; if(!b)return;
    const btn=document.createElement('button'); btn.type='button'; btn.className='tiny';
    btn.textContent=(S.progress.branch===id?'✓ ':'')+b.name;
    btn.onclick=()=>{const r=Level.chooseBranch(S,id); toast&&toast(r.text); body.innerHTML=''; renderLevel(body,S,{act,closeMenu,toast})};
    brRow.appendChild(btn);
  });
  // skill trees
  const trees=document.createElement('div'); trees.className='card';
  trees.innerHTML=`<h3>Skillbäume</h3>`;
  Object.entries(Level.SKILL_TREE).forEach(([k,list])=>{
    const lvl=S.progress.tree[k]|0;
    const row=document.createElement('div'); row.className='tree-row';
    row.innerHTML=`<b>${k}</b> <span class="meta">${lvl}/${list.length}</span> · ${list.map((n,i)=>i<lvl?`<span class="sk on">${n}</span>`:`<span class="sk">${n}</span>`).join(' → ')}`;
    const btn=document.createElement('button'); btn.type='button'; btn.className='tiny'; btn.textContent='Freischalten';
    btn.onclick=()=>{
      const paths=Object.keys(Level.ACQUIRE_PATHS);
      const path=paths[Math.floor(Math.random()*Math.min(4,paths.length))];
      const r=Level.unlockSkill(S,k,path); toast&&toast(r.text); body.innerHTML=''; renderLevel(body,S,{act,closeMenu,toast});
    };
    row.appendChild(btn); trees.appendChild(row);
  });
  body.appendChild(trees);
  // titles + paths
  const tit=document.createElement('div'); tit.className='card';
  tit.innerHTML=`<h3>Titel</h3><p>${sum.titles.map(t=>`«${t}»`).join(' · ')||'–'}</p>
    <h3>Lernwege</h3><p class="meta">${Object.entries(sum.paths).filter(([,v])=>v).map(([k,v])=>`${Level.ACQUIRE_PATHS[k]||k}: ${v}`).join(' · ')||'Noch keine.'}</p>
    <p class="meta">Perks: ${(sum.perks||[]).join(', ')||'–'}</p>`;
  body.appendChild(tit);
}

/** First-meet Begegnung reveal — auto-dismiss; never stacks over OW dialogue/shots. */
export function dismissBegegnung(){
  const overlay=document.getElementById('begegnung');
  if(overlay){ overlay.classList.add('hidden'); clearTimeout(overlay._autoT); }
}
export function showBegegnung(npcName, npc, opts={}){
  const {imgUrl, setPortrait, onClose, know}=opts;
  // Skip full-screen card while overworld dialogue or shop is open (v31)
  try{
    if(opts.force!==true && window.__game?.OW?.isOverworldActive?.()){
      if(window.__game.OW.isDialogueOpen?.()) return null;
      if(!document.getElementById('pixelShop')?.classList.contains('hidden')) return null;
    }
  }catch(_){}
  let overlay=document.getElementById('begegnung');
  if(!overlay){
    overlay=document.createElement('div'); overlay.id='begegnung'; overlay.className='begegnung hidden';
    document.body.appendChild(overlay);
  }
  clearTimeout(overlay._autoT);
  const art=(npc&&npc.art)||'';
  const prompt=`anime character portrait bust, ${npcName}, ${String(art).slice(0,100)}, looking at viewer, dramatic lighting, no text`;
  const seed=[...String(npcName)].reduce((a,c)=>a+c.charCodeAt(0),0)||42;
  const localSlug=(opts.slug)||String(npcName||'').toLowerCase().split(/\s+/).pop();
  const locals=[`assets/port/${localSlug}.webp`,`assets/port/${String(npcName||'').toLowerCase().split(/\s+/).pop()}.webp`];
  if(npc?.portrait)locals.unshift(`assets/port/${npc.portrait}.webp`);
  const local=locals[0];
  const remote=imgUrl?imgUrl(prompt,512,512,seed,false):'';
  const look=art?String(art).split(/[.;]/)[0].trim().slice(0,110):'Du hast ihren Namen erfahren.';
  const metaBits=[];
  if(know?.facts?.job&&npc?.job)metaBits.push(npc.job);
  if(know?.facts?.home&&(npc?.home||npc?.ort))metaBits.push(npc.home||npc.ort);
  overlay.innerHTML=`<div class="begegnung-card">
      <div class="begegnung-badge">Namen erfahren</div>
      <img class="begegnung-img" alt="${npcName}" src="${local}" onerror="this.onerror=null;this.src='${remote||local}'"/>
      <h2>${npc?.e||'👤'} ${npcName}</h2>
      <p class="begegnung-art">${look}</p>
      <p class="meta">${metaBits.join(' · ')||'Mehr über sie erfährst du durch Gespräche und Beobachtung.'}</p>
      <button type="button" class="big" id="begOk">Weiter</button>
    </div>`;
  overlay.classList.remove('hidden');
  const finish=()=>{ clearTimeout(overlay._autoT); overlay.classList.add('hidden'); try{setPortrait&&setPortrait(npcName,npc);}catch(_){ } try{onClose&&onClose();}catch(_){ } };
  overlay.querySelector('#begOk').onclick=finish;
  overlay.onclick=e=>{if(e.target===overlay)finish()};
  // Auto-dismiss so it never blocks playtest / OW shots
  overlay._autoT=setTimeout(finish, 4200);
  return overlay;
}

export function renderViaHubOrTab(tab, body, S, helpers){
  if(tab==='hub'){ openHub(body,S,helpers); return true }
  if(tab==='level'){ renderLevel(body,S,helpers); return true }
  return false;
}

export default {HUB_TILES,HUB_PRIMARY,HUB_MORE,openHub,renderLevel,showBegegnung,dismissBegegnung,renderViaHubOrTab};
