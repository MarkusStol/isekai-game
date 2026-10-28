const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];const R=a=>a[Math.floor(Math.random()*a.length)];const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const VER=9,CACHE_V='v9';
const ROLES={
 held:{e:'⚔️',name:'Held mit Status-System',d:'Ein blaues Fenster erscheint: [Status]. Die Welt braucht dich.',world:'Königreich Aldheim',
  base:{hp:100,mp:40,str:12,cha:8,ruf:10},cls:['Abenteurer','Ritter','Held','Legendärer Held'],pack:'worlds/held.json'},
 villainess:{e:'🌹',name:'Villainess',d:'Du erwachst als Lady Rosalind – die Schurkin aus einem Otome-Roman. Dein Untergang ist in 1 Jahr.',world:'Akademie von Lumière',
  base:{hp:70,mp:60,str:5,cha:16,ruf:-20},cls:['Verstoßene Lady','Salonlöwin','Herzogin','Kaiserin der Intrige'],pack:'worlds/villainess.json'},
 daemon:{e:'😈',name:'Dämonenkönig',d:'Du erwachst auf einem Thron aus Knochen. Deine Diener knien – und ein Held ist unterwegs.',world:'Das Dunkle Reich Nocturna',
  base:{hp:160,mp:120,str:20,cha:6,ruf:-50},cls:['Gefallener Fürst','Dämonenlord','Dämonenkönig','Gott der Nacht'],pack:'worlds/daemon.json'},
 mensch:{e:'🧑',name:'Normaler Mensch',d:'Keine Kräfte, kein Status. Nur du, ein Dorf und viel Hoffnung.',world:'Dorf Kleinbach',
  base:{hp:60,mp:0,str:6,cha:8,ruf:0},cls:['Dorfbewohner','Lehrling','Meister','Ungekrönter Legende'],pack:'worlds/mensch.json'},
 grey:{e:'🌫️',name:'Greymourne',d:'Ein Nachtzug hält, wo er nicht halten dürfte.',world:'Greymourne',
  base:{hp:100,mp:0,str:0,cha:0,ruf:0},cls:['Fahrgast','Gast im Eisernen Licht','Eingetragen','Wer durch den Nebel kommt'],hidden:1,pack:'worlds/greymourne.json'}
};
const ISEKAI=Object.keys(ROLES).filter(k=>!ROLES[k].hidden);const isG=()=>S&&S.role==='grey';
const STAGES=['Fremd','Bekannt','Freund','Vertraut','Verliebt','Partner'];
const STAGE_NEED=[0,15,35,55,75,90];
const PACKS={};let GREY=null;
async function loadPack(role){const path=ROLES[role].pack;if(PACKS[role])return PACKS[role];
 const j=await(await fetch(path+'?'+CACHE_V)).json();PACKS[role]=j;if(role==='grey')GREY=j;return j}
async function loadGrey(){return loadPack('grey')}

const KEY='isekai_save_v1',CFG='isekai_cfg_v1';
let S=null,cfg=JSON.parse(localStorage.getItem(CFG)||'{"mode":"gemini"}'),engine=null,busy=false,_dbgMs=0,_drawerTab=null;

function save(){if(!S)return;try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){try{if(S.hist)S.hist=S.hist.slice(-8);if(S.log)S.log=S.log.slice(-40);if(S.summary)S.summary=String(S.summary).slice(0,400);if(S.world&&S.world.npcs)for(const n of Object.values(S.world.npcs))if(n.erinnerung)n.erinnerung=n.erinnerung.slice(-2);localStorage.setItem(KEY,JSON.stringify(S));toast('Speicher gekürzt (wenig Platz)')}catch(_){toast('Speichern fehlgeschlagen – wenig Speicher')}}}
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('on'),2600)}
function hasKey(){return !!(cfg.gkey||'').trim()}
function wantAI(){return cfg.mode!=='offline'}
function gateOrShow(){if(wantAI()&&!hasKey()&&cfg.mode!=='webllm'&&cfg.mode!=='api'&&cfg.mode!=='free'){showKeyGate();return}show()}
function showKeyGate(){$('#start').classList.add('hidden');$('#game').classList.add('hidden');const g=$('#keyGate');if(g){g.classList.remove('hidden');$('#gateKey').value='';setTimeout(()=>$('#gateKey').focus(),50)}}
function dbgLine(){let el=$('#dbg');if(!cfg.debug){if(el)el.remove();return}if(!el){el=document.createElement('div');el.id='dbg';el.className='dbg';$('#game').appendChild(el)}el.textContent=_dbgMs?('Zug '+_dbgMs+' ms'):'–'}

/* ---------- items / skills helpers ---------- */
function itemFromStr(x){if(typeof x==='object'&&x&&x.name)return x;const s=String(x);return {id:'i_'+s.slice(0,20),name:s,icon:'📦',desc:s,type:'misc'}}
function skillFromStr(x){if(typeof x==='object'&&x&&x.name)return x;const s=String(x);return {id:'sk_'+s.slice(0,20),name:s,icon:'✨',desc:s,level:1,cost:0,cd:0,_cd:0}}
function invNames(){return (S.inv||[]).map(i=>typeof i==='string'?i:i.name)}
function skillNames(){return (S.skills||[]).map(i=>typeof i==='string'?i:i.name)}
function stageOf(aff,trust){let s=0;for(let i=0;i<STAGE_NEED.length;i++){const needT=i>=4?STAGE_NEED[i]-10:0;if(aff>=STAGE_NEED[i]&&(trust||0)>=needT)s=i}return s}
function stageName(n){return STAGES[Math.max(0,Math.min(5,n|0))]}

/* ---------- migration ---------- */
function migrate(raw){if(!raw)return null;const s=typeof raw==='string'?JSON.parse(raw):raw;
 if(!s.ver||s.ver<9){s.ver=9;
  if(Array.isArray(s.inv))s.inv=s.inv.map(itemFromStr);
  if(Array.isArray(s.skills))s.skills=s.skills.map(skillFromStr);
  if(!s.romance){s.romance={};for(const[k,v]of Object.entries(s.aff||{})){const nm=k.replace(/_/g,' ');s.romance[nm]={affection:v|0,trust:Math.max(0,(v|0)/2|0),stage:stageOf(v|0,(v|0)/2|0),events:[]}}}
  if(!s.quests)s.quests={main:{id:'legacy',titel:'Deine Geschichte',act:0,objectives:[],done:[]},side:[]};
  if(!s.discovered)s.discovered=[];
  if(!s.ticks)s.ticks={rumours:[],log:[]};
  if(!s.setup)s.setup={done:true,beat:99,answers:{}};
  if(!s.flags)s.flags={};
  if(s.world&&s.world.npcs){for(const[k,n]of Object.entries(s.world.npcs)){if(!n.e)n.e='👤';if(!n.plan)n.plan=[];if(n.beziehung&&!s.romance[k]){const a=(s.aff&&(s.aff[k]??s.aff[k.replace(/ /g,'_')]))||0;s.romance[k]={affection:a|0,trust:Math.max(0,a/2|0),stage:stageOf(a|0,a/2|0),events:[]}}}}
 }
 return s}

function buildQuests(pack){const arc=pack.arc||{titel:'Hauptgeschichte',acts:[]};const act0=arc.acts[0]||{id:'a1',titel:'Anfang',ziel:'Ankommen',mile:[]};
 return {main:{id:arc.acts[0]?.id||'a1',titel:arc.titel,act:0,actTitel:act0.titel,ziel:act0.ziel,objectives:[...(act0.mile||[])],done:[],twist:act0.twist||''},
  side:(pack.sideQuests||[]).map(q=>({...q,status:'offen',progress:0}))}}

function buildWorldFromPack(pack,role){const npcs={};
 for(const[k,v]of Object.entries(pack.npcs||{})){npcs[k]={art:v.art||v.stimme||'',stimme:v.stimme||'',ziel:v.ziel||'',furcht:v.furcht||'',geheimnis:v.geheim||v.geheimnis||'',beziehung:'Fremd',erinnerung:[],e:v.e||'👤',ort:v.ort||'',plan:[...(v.plan||[])],meinung:v.meinung||{},romance:!!v.romance,geschlecht:v.geschlecht||'',schedule:v.schedule||[]}}
 const orte={};for(const[k,v]of Object.entries(pack.regionen||pack.orte||{}))orte[k]=typeof v==='string'?v:v;
 return {scene:JSON.parse(JSON.stringify(pack.startScene||{ort:'',zeit:'',anwesend:[]})),orte,npcs,ereignisse:[...(pack.startEvents||[])],lore:{geschichte:pack.geschichte||'',magie:pack.magie||'',kultur:pack.kultur||'',alltag:pack.alltag||'',politik:pack.politik||'',ton:pack.ton||''}}}

function initRomance(pack,affKeys){const rom={};const names=new Set([...(pack.romanceable||[]),...affKeys]);
 for(const n of names){rom[n]={affection:0,trust:0,stage:0,events:[]}}
 return rom}

/* ---------- new life / setup ---------- */
async function newLife(role,meta){const r=ROLES[role];meta=meta||{lives:0,soul:0,keptSkills:[]};const pack=await loadPack(role);
 const b=meta.soul|0;
 const inv=(pack.startItems||[]).map(x=>({...x}));
 const skills=(pack.startSkills||[]).map(x=>({...x,_cd:0}));
 (meta.keptSkills||[]).forEach(ks=>{const sk=skillFromStr(ks);if(!skills.some(s=>s.name===sk.name))skills.push(sk)});
 const world=buildWorldFromPack(pack,role);
 const romNames=Object.keys(world.npcs);
 S={ver:VER,role,lives:(meta.lives|0)+1,soul:b,pc:{name:'???',bg:''},
  st:{hp:r.base.hp+b*5,maxhp:r.base.hp+b*5,mp:r.base.mp+b*3,maxmp:r.base.mp+b*3,str:r.base.str+b,cha:r.base.cha+b,ruf:r.base.ruf,lvl:1,xp:0},
  skills,inv,aff:Object.fromEntries(romNames.map(k=>[k,0])),romance:initRomance(pack,romNames),
  quests:buildQuests(pack),discovered:[world.scene.ort].filter(Boolean),ticks:{rumours:[],log:[]},
  cls:0,turn:0,hist:[],log:[],flags:{},setup:{done:false,beat:0,answers:{}},summary:''};
 S.world=world;
 beginSetup(pack);gateOrShow()}

async function newGrey(kind,name,bg){const B=await loadGrey();const r=ROLES.grey;const own=kind!=='darren';
 const who=own?(name||'Fremde Person'):'Darren Crowe';
 const inv=((own?B.startItems_own:B.startItems_darren)||[]).map(x=>({...x}));
 const skills=(B.startSkills||[]).map(x=>({...x,_cd:0}));
 const world=buildWorldFromPack(B,'grey');
 world.scene={ort:'Nachtzug, Abteil mit Messinglampe, kurz nach Mitternacht',zeit:'Nacht, Nebel',anwesend:['Der Schaffner','Die alte Frau im Zug','ein schlafender Soldat','ein Junge mit Buch']};
 world.ereignisse=['Der Zug hält in Greymourne, obwohl er nach Blackmere fahren sollte'];
 // seed core NPCs into world
 for(const[k,v]of Object.entries(B.npcs||{})){if(!world.npcs[k])world.npcs[k]={art:v.art||'',stimme:v.stimme||'',ziel:v.ziel||'',furcht:v.furcht||'',geheimnis:v.geheim||'',beziehung:'Fremd',erinnerung:[],e:v.e||'👤',ort:v.ort||'',plan:[...(v.plan||[])],meinung:v.meinung||{},romance:!!v.romance,schedule:v.schedule||[]}}
 const affBase=own?['Marlowe','Elias Ward','Mascha Petrowa','Darren Crowe']:['Velicya','Marlowe','Elias Ward','Mascha Petrowa'];
 S={ver:VER,role:'grey',world_id:'greymourne',kind,pc:{name:who,bg:own?(bg||'Jemand, der etwas verloren hat'):(B.npcs['Darren Crowe']?.art||'')},lives:1,soul:0,
  st:{hp:100,maxhp:100,mp:0,maxmp:0,str:0,cha:0,ruf:own?10:30,lvl:1,xp:0},skills,inv,
  aff:Object.fromEntries(affBase.map(k=>[k,0])),romance:initRomance(B,affBase),
  quests:buildQuests(B),discovered:['Nachtzug'],ticks:{rumours:[],log:[]},
  cls:0,turn:0,hist:[],log:[],flags:{},setup:{done:false,beat:0,answers:{}},summary:''};
 S.world=world;
 beginSetup(B);gateOrShow()}

function beginSetup(pack){const beats=pack.setup||[];
 if(!beats.length){finishSetup(pack);return}
 S.setup={done:false,beat:0,answers:{}};
 showBeat(pack)}

function showBeat(pack){const beats=pack.setup||[];const i=S.setup.beat;
 if(i>=beats.length){finishSetup(pack);return}
 const b=beats[i];$('#log').innerHTML='';S.log=[];
 add('n',`✦ ${b.titel}\n\n${b.text}`);
 const choices=b.choices||[];
 S.choices=choices.map(c=>c.label);
 S._setupChoices=choices;S._setupBeat=b;S._setupPack=pack;
 // name input?
 const c=$('#choices');c.innerHTML='';
 if(b.needsName){const row=document.createElement('div');row.className='name-row';row.innerHTML=`<input id="setupName" placeholder="Name…" maxlength="40" value="">`;c.appendChild(row)}
 choices.forEach(ch=>{const btn=document.createElement('button');btn.textContent=ch.label;btn.onclick=()=>pickSetup(ch);c.appendChild(btn)});
 hud();save()}

function pickSetup(ch){const pack=S._setupPack;const beat=S._setupBeat;
 S.setup.answers[beat.id]=ch;
 if(beat.needsName){const inp=$('#setupName');const nm=(inp&&inp.value.trim())||(isG()?S.pc.name:'Held');if(ch.nameMode!=='mystery'&&ch.nameMode!=='lost')S.pc.name=nm;else if(ch.nameMode==='hero')S.pc.name=nm||'Held';else if(ch.nameMode==='keep'||ch.nameMode==='real')S.pc.name=nm;else if(ch.nameMode==='nick'||ch.nameMode==='new')S.pc.name=nm||'???';else if(ch.nameMode==='king')S.pc.name=nm||'König der Nacht';else if(ch.nameMode==='human')S.pc.name=nm;else if(ch.nameMode==='mask')S.pc.name='Rosalind';else if(ch.nameMode==='honest'||ch.nameMode==='rewrite')S.pc.name=nm||'Rosalind'}
 if(ch.past)S.pc.bg=(S.pc.bg?S.pc.bg+' ':'')+ch.past;
 if(ch.focus)S.flags.focus=ch.focus;
 if(ch.impression)S.flags.impression=ch.impression;
 if(ch.aff){for(const[n,v]of Object.entries(ch.aff))bumpRel(n,v,Math.max(0,v/2|0),false)}
 add('p',ch.label);
 S.setup.beat++;
 showBeat(pack)}

function finishSetup(pack){S.setup.done=true;S._setupChoices=null;S._setupBeat=null;
 let bridge='';
 if(isG()){
  bridge=(S.kind==='darren'?greyIntroDarren():greyIntroOwn())+(S.flags.impression?'\n\n(Dein erster Eindruck bleibt: '+S.flags.impression+'.)':'');
 }else{
  const ort=(pack.startScene&&pack.startScene.ort)||'';
  const anw=((pack.startScene&&pack.startScene.anwesend)||[]).join(', ');
  bridge=ROLES[S.role].e+' Du bist '+(S.pc.name||'???')+'.\n'+(S.pc.bg||'Ein Leben endete.')+'\n\nDie Welt von '+(pack.titel||ROLES[S.role].world)+' atmet bereits – sie hat nicht auf dich gewartet, aber sie hat Platz.\n\nOrt: '+ort+'\nAnwesend: '+anw+'\n\n'+((pack.startEvents||[])[0]||'')+'\n\n(Die Eröffnung ist vorbei. Was tust du?)';
 }
 $('#log').innerHTML='';S.log=[];add('n',bridge);S.hist=[{role:'assistant',content:bridge}];S.choices=defChoices();
 discover(S.world?.scene?.ort);hud();save()}

function greyIntroDarren(){return `Der Zug hätte nicht halten dürfen.\n\nAuf deiner Fahrkarte steht Blackmere. Kurz nach Mitternacht verliert das Rattern seinen Takt. Die Messinglampe hängt still.\n\nAußen im Ruß: der Abdruck einer kleinen Hand.\nDie Bremsen greifen. GREYMOURNE.\n\nDu bist Darren Crowe. ${S.pc.bg?S.pc.bg.slice(0,120):'Koch, unrasiert, eine Narbe am Unterarm.'}`}
function greyIntroOwn(){return `Der Zug hätte nicht halten dürfen.\n\nDu – ${S.pc.name}. ${S.pc.bg}\nIm Ruß außen: eine kleine Hand. Der Schaffner hat deinen Namen in violetter Tinte geschrieben.\nGREYMOURNE.\nDie alte Frau: „Lassen Sie sich nicht beim vollen Namen rufen.“`}

function defChoices(){const r=S.role;return {grey:['Sitzen bleiben','Aus dem Fenster sehen','Die alte Frau fragen','Nach etwas Unwichtigem fragen'],held:['Mit Elise sprechen','Status prüfen','Die Halle verlassen','Orren nach dem Kreis fragen'],villainess:['Mira helfen','Julian antworten','Romanwissen prüfen','Cedric rufen'],daemon:['Velka zuhören','Brok antworten','Schatzkammer prüfen','Die Armee mustern'],mensch:['Tom antworten','Zur Taverne','Taschen prüfen','Den Wald ansehen']}[r]||['Weiter','Umsehen','Fragen','Warten']}

function discover(place){if(!place)return;if(!S.discovered)S.discovered=[];if(!S.discovered.includes(place)){S.discovered.push(place);if(S.setup?.done)toast('📍 Neu entdeckt: '+place)}}

/* ---------- relationships / romance ---------- */
function bumpRel(name,daff,dtrust,toastOn){if(!S.romance)S.romance={};
 let key=Object.keys(S.romance).find(k=>k.toLowerCase()===String(name).toLowerCase())||Object.keys(S.romance).find(k=>k.toLowerCase().includes(String(name).toLowerCase().split(' ').pop()));
 if(!key){key=String(name);S.romance[key]={affection:0,trust:0,stage:0,events:[]}}
 const r=S.romance[key];const old=r.stage;r.affection=Math.max(-100,Math.min(100,(r.affection|0)+(daff|0)));r.trust=Math.max(0,Math.min(100,(r.trust|0)+(dtrust|0)));
 r.stage=stageOf(r.affection,r.trust);S.aff[key]=r.affection;
 if(S.world?.npcs?.[key])S.world.npcs[key].beziehung=stageName(r.stage);
 if(r.stage>old){const msg=`💞 ${key}: ${stageName(old)} → ${stageName(r.stage)}`;if(toastOn!==false)toast(msg);add('s',msg);r.events.push({t:S.turn,stage:r.stage});
  if(r.stage>=4)maybeJealousy(key)}
 return key}
function maybeJealousy(who){const pack=PACKS[S.role];if(!pack)return;const roms=(pack.romanceable||[]).filter(n=>n!==who);const high=roms.filter(n=>(S.romance[n]?.stage|0)>=3);
 if(high.length&&Math.random()<.45){const j=R(high);bumpRel(j,-rnd(3,8),-rnd(1,4),false);S.ticks.rumours.push(`${j} hat von dir und ${who} gehört.`);add('s',`⚡ Spannung: ${j} wirkt verletzt oder misstrauisch.`)}}

/* ---------- world tick ---------- */
function worldTick(){if(!S.world||!S.setup?.done)return;const npcs=Object.entries(S.world.npcs||{});if(!npcs.length)return;
 const present=new Set((S.world.scene.anwesend||[]).map(String));
 const actors=npcs.filter(([k])=>!present.has(k)).sort(()=>Math.random()-.5).slice(0,2);
 const notes=[];
 for(const[name,n]of actors){const plan=n.plan||[];const act=plan.length?R(plan):null;
  if(act){const line=`${n.e||'👤'} ${name} handelt abseits: ${act}.`;notes.push(line);n.erinnerung=(n.erinnerung||[]).concat(['(Offscreen) '+act]).slice(-6);
   if(Math.random()<.35){const rum=`Gerücht: ${name} – ${act}`;S.ticks.rumours=(S.ticks.rumours||[]).concat(rum).slice(-8);S.world.ereignisse=(S.world.ereignisse||[]).concat(rum).slice(0,6)}}
  // pursue goals quietly
  if(n.ziel&&Math.random()<.25)S.ticks.rumours.push(`${name} verfolgt weiter: ${String(n.ziel).slice(0,60)}`)}
 // organic quest nudge (not railroad): if main objectives empty progress hint every 5 turns
 if(S.turn%5===0&&S.quests?.main){const m=S.quests.main;const left=(m.objectives||[]).filter(o=>!(m.done||[]).includes(o));
  if(left.length&&Math.random()<.5)S.world.ereignisse=(S.world.ereignisse||[]).concat(`Etwas zieht die Geschichte: ${left[0]}`).slice(0,6)}
 if(notes.length&&S.turn>0&&S.turn%2===0){const t=notes[0];S.ticks.log=(S.ticks.log||[]).concat(t).slice(-10);add('tick',t)}
 // NPC may initiate
 if(Math.random()<.22){const here=[...present].filter(p=>S.world.npcs[p]);if(here.length){const who=R(here);const n=S.world.npcs[who];
  const line=R([`${n.e||''} ${who} spricht dich an, ohne zu warten.`.trim(),`${who} schaut zu dir herüber: „${R(['Wir müssen reden.','Hast du einen Moment?','Das bleibt nicht so.'])}“`]);
  S.flags.npcInit=who;if(S.choices&&S.choices.length)S.choices=[`Mit ${who} sprechen`,...S.choices.slice(0,3)]}}}

/* ---------- quests apply ---------- */
function applyQuestUpdate(u){if(!u||!S.quests)return;const m=S.quests.main;
 if(u.mainObjectiveDone){const o=String(u.mainObjectiveDone);if(!(m.done||[]).includes(o)){m.done=m.done||[];m.done.push(o);toast('✓ Quest: '+o);add('s','📜 '+o)}}
 if(u.advanceAct&&PACKS[S.role]?.arc?.acts){const acts=PACKS[S.role].arc.acts;const next=Math.min(acts.length-1,(m.act|0)+1);if(next>m.act){m.act=next;m.id=acts[next].id;m.actTitel=acts[next].titel;m.ziel=acts[next].ziel;m.objectives=[...(acts[next].mile||[])];m.done=[];m.twist=acts[next].twist||'';toast('📖 Neuer Akt: '+m.actTitel);add('s','📖 Akt: '+m.actTitel+' – '+m.ziel)}}
 if(u.sideComplete){const id=String(u.sideComplete);const sq=(S.quests.side||[]).find(q=>q.id===id||q.titel===id);if(sq){sq.status='erledigt';toast('✓ Nebenquest: '+sq.titel)}}
 if(u.sideUnlock){const id=String(u.sideUnlock);const sq=(S.quests.side||[]).find(q=>q.id===id);if(sq&&sq.status==='offen')sq.status='aktiv'}}

/* ---------- HUD / UI ---------- */
function hud(){if(!S)return;if(isG())hudG();else hudI();
 const c=$('#choices');if(!S._setupChoices){c.innerHTML='';(S.choices||[]).slice(0,4).forEach(t=>{const b=document.createElement('button');b.textContent=t;b.onclick=()=>act(t);c.appendChild(b)})}
 dbgLine()}
function bar(v,m,col){return `<div class="bar"><i style="width:${Math.max(0,Math.min(100,v/Math.max(1,m)*100))}%;background:${col}"></i></div>`}
function hudI(){const s=S.st,r=ROLES[S.role];const topRom=Object.entries(S.romance||{}).filter(([,v])=>(v.stage|0)>0).sort((a,b)=>b[1].affection-a[1].affection).slice(0,2);
 $('#hud').innerHTML=`<div class="hud-top"><b>${r.e} ${S.pc?.name&&S.pc.name!=='???'?S.pc.name:r.cls[S.cls]}</b><span>Lv ${s.lvl} · #${S.lives}</span></div>
 <div class="bars"><div style="flex:1"><div class="bar-lab">HP ${Math.max(0,s.hp)}/${s.maxhp}</div>${bar(s.hp,s.maxhp,'#ff5f7e')}</div>
 <div style="flex:1"><div class="bar-lab">MP ${s.mp}/${s.maxmp}</div>${bar(s.mp,s.maxmp||1,'#6fb6ff')}</div>
 <div style="flex:1"><div class="bar-lab">XP ${s.xp}/${s.lvl*100}</div>${bar(s.xp,s.lvl*100,'#ffd35a')}</div></div>
 <div class="chips"><span class="chip">💪${s.str}</span><span class="chip">✨${s.cha}</span><span class="chip">📣${s.ruf}</span>${topRom.map(([n,v])=>`<span class="chip">💗${n.split(' ').pop()} ${stageName(v.stage)}</span>`).join('')}${S.quests?.main?`<span class="chip">📜${S.quests.main.actTitel||'Quest'}</span>`:''}</div>`}
function hudG(){const s=S.st;const topRom=Object.entries(S.romance||{}).filter(([,v])=>(v.affection|0)>0).sort((a,b)=>b[1].affection-a[1].affection).slice(0,2);
 $('#hud').innerHTML=`<div class="hud-top"><b>🌫️ ${S.pc.name}</b><span>${ROLES.grey.cls[S.cls]}</span></div>
 <div class="bars"><div style="flex:1"><div class="bar-lab">🧠 Verstand ${Math.max(0,s.hp)}/100</div>${bar(s.hp,100,'#9fb3c8')}</div>
 <div style="flex:1"><div class="bar-lab">⚖️ Schuld ${s.ruf}/100</div>${bar(s.ruf,100,'#8a5a5a')}</div></div>
 <div class="chips">${topRom.map(([n,v])=>`<span class="chip">🤝${n.split(' ')[0]} ${stageName(v.stage)}</span>`).join('')}<span class="chip">${(S.world?.scene?.ort||'').slice(0,28)}</span></div>`}

function add(k,t){S.log.push({k,t});if(S.log.length>80)S.log.shift();renderMsg(k,t)}
function renderMsg(k,t){const d=document.createElement('div');d.className='msg '+k;d.textContent=t;const log=$('#log');log.appendChild(d);requestAnimationFrame(()=>{log.scrollTop=log.scrollHeight});return d}
function show(){$('#keyGate')&&$('#keyGate').classList.add('hidden');document.body.classList.toggle('greyw',isG());$('.title').textContent=isG()?'✦ Greymourne':'✦ Isekai Reinkarnation';$('#start').classList.add('hidden');$('#game').classList.remove('hidden');$('#log').innerHTML='';(S.log||[]).forEach(m=>renderMsg(m.k,m.t));
 if(S.setup&&!S.setup.done){loadPack(S.role).then(p=>{S._setupPack=p;showBeat(p)})}else hud()}

/* ---------- drawer panels ---------- */
function openDrawer(tab){_drawerTab=tab;$('#drawer').classList.remove('hidden');$$('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.tab===tab));
 const titles={status:'Status',inv:'Inventar',skills:'Fähigkeiten',rels:'Beziehungen',quests:'Quests',lex:'Welt / Lexikon'};
 $('#drawerTitle').textContent=titles[tab]||'System';renderDrawer()}
function closeDrawer(){$('#drawer').classList.add('hidden');$$('#tabs button').forEach(b=>b.classList.remove('on'));_drawerTab=null}
function renderDrawer(){const body=$('#drawerBody');if(!body||!S)return;body.innerHTML='';
 if(_drawerTab==='status'){const s=S.st;body.innerHTML=`<div class="card"><h3>${ROLES[S.role].e} ${S.pc?.name||ROLES[S.role].name}</h3>
 <p class="meta">${ROLES[S.role].cls[S.cls]} · Leben #${S.lives} · Seele ${S.soul}</p>
 <p>${isG()?`Verstand ${s.hp}/100 · Schuld ${s.ruf}/100`:`Lv ${s.lvl} · HP ${s.hp}/${s.maxhp} · MP ${s.mp}/${s.maxmp}<br>Stärke ${s.str} · Charme ${s.cha} · Ruf ${s.ruf} · XP ${s.xp}/${s.lvl*100}`}</p>
 <p class="meta">Ort: ${S.world?.scene?.ort||'–'}<br>Zeit: ${S.world?.scene?.zeit||'–'}<br>Anwesend: ${(S.world?.scene?.anwesend||[]).join(', ')||'–'}</p>
 ${S.pc?.bg?`<p class="meta">Hintergrund: ${S.pc.bg}</p>`:''}</div>`}
 else if(_drawerTab==='inv'){(S.inv||[]).forEach((it,idx)=>{const item=itemFromStr(it);const card=document.createElement('div');card.className='card';
  card.innerHTML=`<h3>${item.icon||'📦'} ${item.name}</h3><p>${item.desc||''}</p><p class="meta">${item.type||'misc'}${item.equip?' · ausrüstbar':''}</p><div class="row"></div>`;
  const row=card.querySelector('.row');
  if(item.use||item.type==='consumable'){const b=document.createElement('button');b.textContent='Benutzen';b.onclick=()=>{useItem(idx);renderDrawer()};row.appendChild(b)}
  if(item.equip||item.type==='weapon'||item.type==='armor'){const b=document.createElement('button');b.textContent=item._eq?'Ablegen':'Ausrüsten';b.onclick=()=>{item._eq=!item._eq;S.inv[idx]=item;toast(item._eq?'Ausgerüstet: '+item.name:'Abgelegt');save();renderDrawer();hud()};row.appendChild(b)}
  const b2=document.createElement('button');b2.textContent='Erwähnen';b2.onclick=()=>{closeDrawer();act('Ich nutze/betrachte: '+item.name)};row.appendChild(b2);
  body.appendChild(card)});if(!(S.inv||[]).length)body.innerHTML='<div class="card"><p>Leer.</p></div>'}
 else if(_drawerTab==='skills'){(S.skills||[]).forEach((sk,idx)=>{const s=skillFromStr(sk);const card=document.createElement('div');card.className='card';
  card.innerHTML=`<h3>${s.icon||'✨'} ${s.name}</h3><p>${s.desc||''}</p><p class="meta">Stufe ${s.level||1} · Kosten ${s.cost||0} MP · CD ${s._cd||0}/${s.cd||0}</p><div class="row"></div>`;
  const row=card.querySelector('.row');const b=document.createElement('button');b.textContent='Einsetzen';b.disabled=(s._cd|0)>0||((s.cost|0)>0&&S.st.mp<(s.cost|0));
  b.onclick=()=>{useSkill(idx);renderDrawer()};row.appendChild(b);body.appendChild(card)});if(!(S.skills||[]).length)body.innerHTML='<div class="card"><p>Keine Fähigkeiten.</p></div>'}
 else if(_drawerTab==='rels'){const entries=Object.entries(S.romance||{});if(!entries.length)body.innerHTML='<div class="card"><p>Noch keine Beziehungen.</p></div>';
  entries.sort((a,b)=>b[1].affection-a[1].affection).forEach(([name,r])=>{const n=S.world?.npcs?.[name];const card=document.createElement('div');card.className='card';
   const mem=(n?.erinnerung||[]).slice(-1)[0]||'–';
   card.innerHTML=`<h3>${n?.e||'👤'} ${name}</h3><div class="stage">${stageName(r.stage)} · Zuneigung ${r.affection} · Vertrauen ${r.trust}</div>
   <div class="aff-bar"><i style="width:${Math.max(0,Math.min(100,r.affection))}%"></i></div>
   <p class="meta">${n?.art?String(n.art).slice(0,100):''}</p><p class="meta">Ort: ${n?.ort||'?'} · Letzte Erinnerung: ${mem}</p>
   <div class="row"><button type="button">Ansprechen</button></div>`;
   card.querySelector('button').onclick=()=>{closeDrawer();act('Ich gehe zu '+name+' und spreche sie/ihn an.')};body.appendChild(card)})}
 else if(_drawerTab==='quests'){const m=S.quests?.main;if(m){const left=(m.objectives||[]).filter(o=>!(m.done||[]).includes(o));
  body.innerHTML+=`<div class="card quest-main"><h3>📜 ${m.titel}</h3><p><b>Akt:</b> ${m.actTitel||''}</p><p>${m.ziel||''}</p>
  <p class="meta">Offen: ${left.join(' · ')||'–'}</p><p class="meta">Erledigt: ${(m.done||[]).join(' · ')||'–'}</p></div>`}
  (S.quests?.side||[]).forEach(q=>{const card=document.createElement('div');card.className='card quest-side';
   card.innerHTML=`<h3>🗺 ${q.titel}</h3><p>${q.ziel||''}</p><p class="meta">${q.status||'offen'}${q.npc?' · '+q.npc:''}</p>`;body.appendChild(card)})}
 else if(_drawerTab==='lex'){const pack=PACKS[S.role];body.innerHTML+=`<div class="card"><h3>📚 Lore</h3><p class="meta">${(S.world?.lore?.geschichte||pack?.geschichte||'').slice(0,280)}</p>
  <p class="meta"><b>Magie:</b> ${(S.world?.lore?.magie||'').slice(0,160)}</p><p class="meta"><b>Kultur:</b> ${(S.world?.lore?.kultur||'').slice(0,160)}</p></div>`;
  body.innerHTML+=`<div class="card"><h3>📍 Orte</h3></div>`;
  const wrap=body.lastChild;
  (S.discovered||[]).forEach(d=>{const desc=S.world?.orte?.[d]||'';const el=document.createElement('div');el.className='lex-item';el.innerHTML=`<b>${d}</b><br><span class="meta">${desc||'Entdeckt.'}</span>`;wrap.appendChild(el)});
  if(S.ticks?.rumours?.length){body.innerHTML+=`<div class="card"><h3>🗣 Gerüchte</h3>${S.ticks.rumours.slice(-5).map(r=>`<div class="lex-item">${r}</div>`).join('')}</div>`}}
}

function useItem(idx){const item=itemFromStr(S.inv[idx]);const use=item.use||'';
 if(use.startsWith('heal:')){const n=+use.slice(5)||20;S.st.hp=Math.min(S.st.maxhp,S.st.hp+n);toast(`+${n} HP`);S.inv.splice(idx,1);add('s',`🧪 ${item.name} benutzt (+${n} HP)`)}
 else if(use.startsWith('mp:')){const n=+use.slice(3)||20;S.st.mp=Math.min(S.st.maxmp,S.st.mp+n);toast(`+${n} MP`);S.inv.splice(idx,1);add('s',`🧪 ${item.name} benutzt (+${n} MP)`)}
 else{closeDrawer();act('Ich benutze: '+item.name);return}
 hud();save()}
function useSkill(idx){const sk=skillFromStr(S.skills[idx]);if((sk._cd|0)>0)return toast('Noch Abklingzeit');if((sk.cost|0)>S.st.mp)return toast('Nicht genug MP');
 S.st.mp-=sk.cost|0;sk._cd=sk.cd|0;S.skills[idx]=sk;toast('✨ '+sk.name);closeDrawer();act('Ich setze meine Fähigkeit ein: '+sk.name);hud();save()}

/* ---------- apply changes ---------- */
function apply(ch){if(!ch)return;const s=S.st,num=v=>Math.max(-200,Math.min(200,Math.round(+v||0)));const out=[];
 const map={verstand:'hp',schuld:'ruf',hp:'hp',mp:'mp',str:'str',staerke:'str',stärke:'str',cha:'cha',charme:'cha',ruf:'ruf',xp:'xp'};
 for(const[k,v]of Object.entries(ch)){const m=map[k.toLowerCase()];if(m&&v){s[m]+=num(v);out.push(`${k} ${v>0?'+':''}${num(v)}`)}}
 if(ch.affinity&&typeof ch.affinity==='object')for(const[n,v]of Object.entries(ch.affinity)){const trust=ch.trust&&ch.trust[n]!=null?num(ch.trust[n]):Math.max(0,num(v)/2|0);bumpRel(n,num(v),trust,false);out.push(`💗${n.split(' ').pop()} ${v>0?'+':''}${num(v)}`)}
 if(ch.trust&&typeof ch.trust==='object'&&!ch.affinity)for(const[n,v]of Object.entries(ch.trust))bumpRel(n,0,num(v),false);
 (ch.newSkills||ch.skills||[]).forEach(x=>{const sk=skillFromStr(x);if(!S.skills.some(s=>s.name===sk.name)&&S.skills.length<24){S.skills.push(sk);out.push('Skill: '+sk.name);toast('✨ Neue Fähigkeit: '+sk.name)}});
 (ch.items||ch.addItems||[]).forEach(x=>{const it=itemFromStr(x);if(S.inv.length<40){S.inv.push(it);out.push('Item: '+it.name);toast('📦 '+it.name)}});
 (ch.removeItems||[]).forEach(x=>{const name=typeof x==='string'?x:x.name;const i=S.inv.findIndex(it=>(typeof it==='string'?it:it.name)===name);if(i>=0)S.inv.splice(i,1)});
 if(Array.isArray(ch.choices)&&ch.choices.length)S.choices=ch.choices.filter(x=>typeof x==='string').map(x=>x.slice(0,50));
 if(ch.quests)applyQuestUpdate(ch.quests);
 // tick down skill CDs
 (S.skills||[]).forEach(sk=>{if(sk._cd>0)sk._cd--});
 s.hp=Math.min(s.hp,s.maxhp);s.mp=Math.max(0,Math.min(s.mp,s.maxmp));
 if(isG()){s.ruf=Math.max(0,Math.min(100,s.ruf));s.hp=Math.max(-1,s.hp);const nc=Math.min(3,Math.floor(S.turn/15));if(nc>S.cls){S.cls=nc;out.push('🌫️ '+ROLES.grey.cls[nc])}}
 else{let leveled=false;while(s.xp>=s.lvl*100){s.xp-=s.lvl*100;s.lvl++;s.maxhp+=10;s.hp=s.maxhp;s.maxmp+=5;s.mp=s.maxmp;s.str+=2;s.cha+=1;leveled=true;out.push(`⬆ LEVEL ${s.lvl}!`);toast('⬆ Level '+s.lvl+'!')}
  const nc=Math.min(3,Math.floor(s.lvl/5));if(nc>S.cls){S.cls=nc;const cn=ROLES[S.role].cls[nc];out.push(`🌟 Klassenwechsel: ${cn}!`);S.skills.push(skillFromStr(R(['Erwachte Aura','Zweite Natur','Seelenblick','Königlicher Befehl'])));toast('🌟 '+cn)}}
 if(out.length)add('s',out.join(' · '));
 if(ch.ending)return ending(String(ch.ending));checkEnd()}
function checkEnd(){const s=S.st;if(isG()){if(s.hp<=0)return ending('Der Nebel hat deinen Verstand. Greymourne trägt deinen Namen jetzt in seinem Register.');if(s.ruf>=100)return ending('Die Schuld wiegt mehr als du. Die Stadt behält dich – AUSGEGEBEN: 1, ZURÜCK: 0.');return}
 if(s.hp<=0)return death();
 const top=Object.entries(S.romance||{}).find(([,v])=>(v.stage|0)>=5&&(v.affection|0)>=90);if(top)return ending(`Romantisches Ende mit ${top[0]} 💞`);
 if(s.lvl>=20)return ending('Legenden-Ende: Dein Name wird ewig besungen 👑');
 if(s.ruf>=150)return ending('Ruhmes-Ende: Das Volk krönt dich zur Hoffnung der Welt');
 if(s.ruf<=-150)return ending('Tyrannen-Ende: Die Welt kniet in Furcht vor dir')}
function death(){add('s',`💀 Du bist gestorben (Level ${S.st.lvl}).`);setTimeout(()=>reincarnate('Die Göttin seufzt: „Schon wieder? Na gut – nimm etwas mit.“'),600)}
function ending(t){add('s','🏁 ENDE: '+t);S.choices=[];hud();save();if(isG()){const c=$('#choices');c.innerHTML='';[['🎫 Erneut als Darren',()=>newGrey('darren')],['✒️ Andere Figur',()=>{S=null;location.reload()}]].forEach(([l,f])=>{const b=document.createElement('button');b.textContent=l;b.onclick=f;c.appendChild(b)});return}setTimeout(()=>reincarnate('Ein neues Kapitel? Deine Seele wird stärker.'),1500)}
function reincarnate(msg){const soul=S.soul+Math.max(1,Math.floor(S.st.lvl/2));const kept=skillNames().filter(x=>!['Status-Fenster','Schwertschlag','Romanwissen','Eleganter Fächerhieb','Dunkle Aura','Höllenflamme','Moderne Bildung','Beobachten'].includes(x)).slice(-2);
 const meta={lives:S.lives,soul,keptSkills:kept};add('n',msg+(kept.length?`\nBehaltene Skills: ${kept.join(', ')}`:''));
 S.choices=[];hud();const c=$('#choices');c.innerHTML='';Object.entries(ROLES).filter(([k])=>k!=='grey').forEach(([k,r])=>{const b=document.createElement('button');b.textContent=r.e+' '+r.name;b.onclick=()=>{$('#log').innerHTML='';newLife(k,meta)};c.appendChild(b)});save()}

/* ---------- world text lean ---------- */
function worldText(){const w=S.world;if(!w)return '';
 const scene=w.scene||{};const present=new Set((scene.anwesend||[]).map(String));
 const histTxt=((S.hist||[]).slice(-6).map(h=>h.content).join(' ')+' '+(S.summary||'')).toLowerCase();
 const npcs={};for(const[k,v]of Object.entries(w.npcs||{})){const hit=present.has(k)||k.toLowerCase().split(/[ \/–_-]+/).some(p=>p.length>3&&histTxt.includes(p));if(!hit)continue;
  const rom=S.romance?.[k];const o={art:String(v.art||'').slice(0,100),stimme:String(v.stimme||'').slice(0,80),beziehung:stageName(rom?.stage||0),ziel:String(v.ziel||'').slice(0,80),furcht:String(v.furcht||'').slice(0,60)};
  const mem=(v.erinnerung||[]).slice(-2);if(mem.length)o.erinnerung=mem;if(S.turn>=40&&v.geheimnis)o.geheimnis=String(v.geheimnis).slice(0,100);
  if(rom)o.romance={stage:stageName(rom.stage),affection:rom.affection,trust:rom.trust};npcs[k]=o}
 const orte={};for(const[k,v]of Object.entries(w.orte||{})){const key=k.toLowerCase().split(/[ \/–]/)[0];if(String(scene.ort||'').toLowerCase().includes(key)||histTxt.includes(key)||(S.discovered||[]).includes(k))orte[k]=String(v).slice(0,120)}
 const q=S.quests?.main;const qHint=q?{akt:q.actTitel,ziel:q.ziel,offen:(q.objectives||[]).filter(o=>!(q.done||[]).includes(o)).slice(0,3)}:null;
 return 'WELT (nur Szene):\n'+JSON.stringify({scene,npcs,orte,ereignisse:(w.ereignisse||[]).slice(0,4),quest:qHint,geruechte:(S.ticks?.rumours||[]).slice(-2)})}
function applyWorld(u){if(!u||!S.world)return;const w=S.world;const cut=(x,n)=>String(x||'').slice(0,n);
 if(u.scene&&u.scene.ort){w.scene={ort:cut(u.scene.ort,80),zeit:cut(u.scene.zeit,60),anwesend:(u.scene.anwesend||[]).slice(0,8).map(x=>cut(x,40))};discover(w.scene.ort)}
 (u.npcUpdates||[]).forEach(n=>{if(!n||!n.name)return;let k=Object.keys(w.npcs).find(x=>x.toLowerCase()===String(n.name).toLowerCase());
  if(!k){if(Object.keys(w.npcs).length>=16)return;k=cut(n.name,40);w.npcs[k]={art:'',ziel:'',geheimnis:'',beziehung:'Fremd',erinnerung:[],e:'👤',plan:[]};if(!S.romance[k])S.romance[k]={affection:0,trust:0,stage:0,events:[]}}
  const p=w.npcs[k];['art','ziel','geheimnis','beziehung','ort'].forEach(f=>{if(n[f])p[f]=cut(n[f],140)});if(n.erinnerung){p.erinnerung.push(cut(n.erinnerung,140));p.erinnerung=p.erinnerung.slice(-6)};if(n.plan)p.plan=[cut(n.plan,80),...(p.plan||[])].slice(0,5)});
 (u.newLocations||[]).forEach(l=>{if(l&&l.name&&Object.keys(w.orte).length<20){w.orte[cut(l.name,50)]=cut(l.desc,140);discover(cut(l.name,50))}});
 if(Array.isArray(u.ereignisse)&&u.ereignisse.length)w.ereignisse=u.ereignisse.slice(0,6).map(x=>cut(x,140))}

/* ---------- offline narrator ---------- */
function isQ(a){return /\?\s*$/.test(a.trim())||/^\s*(wer|was|wo|wohin|woher|wie|warum|wieso|weshalb|wann|welche[rsmn]?|seid|bist|sind|kannst|könnt|ist|habt|hast|gibt)\b/i.test(a)}
function askNPC(a){if(!isQ(a)||!S)return null;const t=a.toLowerCase();const pres=(S.world?.scene?.anwesend||[]).map(String);
 const bible=S.world?.npcs||{};
 const STOP=/^(der|die|das|ein|eine|einer|im|am|zug|von|und)$/;const find=n=>{const w=n.toLowerCase();return Object.entries(bible).find(([k])=>k.toLowerCase()===w)||Object.entries(bible).find(([k])=>k.toLowerCase().split(/[ \/–_-]+/).some(p=>p.length>3&&!STOP.test(p)&&w.includes(p)))};
 let who=pres.map(p=>{const f=find(p);return f?{n:f[0],d:f[1],label:p}:{n:p,d:null,label:p}});if(!who.length)who=Object.entries(bible).slice(0,2).map(([k,v])=>({n:k,d:v,label:k}));
 const named=who.filter(w=>t.includes(w.n.toLowerCase().split(' ')[0]));const sp=(named.length?named:who).slice(0,/ihr|euch|alle|seid/.test(t)?3:1);
 const first=s=>String(s||'').split(/[.;]/)[0].trim();const lines=sp.map(w=>{const nm=w.n.split(' / ')[0];const desc=first(w.d?.art||w.d?.stimme);
  const rom=S.romance?.[w.n];const st=rom?stageName(rom.stage):'Fremd';
  if(/wer|seid|bist|name/.test(t)){return `${w.label} ${R(['mustert dich','hebt den Blick','zögert kurz'])}. „${nm}.“${desc?' '+desc+'.':''} (${st})`}
  if(/wo|wohin|woher/.test(t)){const o=S.world?.scene?.ort||'hier';return `${w.label}: „Du bist ${/^(in|im|am|auf|an)\b/i.test(o)?o:'in '+o}.“`}
  return `${w.label} ${R(['runzelt die Stirn','sieht dich lange an','senkt die Stimme'])}: „${R(['Das ist eine gute Frage.','Nicht hier. Nicht jetzt.','Wenn du das wirklich wissen willst, bleib in meiner Nähe.'])}“`});
 const aff={};sp.forEach(w=>{aff[w.n]=2});
 return {text:`„${a}“\n\n`+lines.join('\n\n'),changes:{xp:5,affinity:aff,choices:defChoices()}}}

function offline(a){const q=askNPC(a);if(q)return q;if(isG()){const t=a.toLowerCase();const hit=/tür|öffn|klink/.test(t);
  const txt=R(['Irgendwo schlägt eine Glocke, tief und unsauber. Du spürst sie im Brustbein.','Der Nebel antwortet nicht. Nur eine Uhr tickt, deren Zeiger stillstehen.','Aus einem Ablaufgitter: drei Schläge, Pause, zwei weitere.','Du zählst, ohne es zu wollen. Die Zahl stimmt nicht.']);
  return {text:`„${a}“ – ${txt}`,changes:{hp:hit?-8:-2,ruf:0,choices:defChoices()}}}
 const t=a.toLowerCase(),s=S.st;const npcs=Object.keys(S.romance||S.aff||{});
 const who=npcs.find(n=>n.toLowerCase().split(/[ _]/).some(p=>p.length>2&&t.includes(p.toLowerCase())));
 let txt,ch={};
 if(/kämpf|kampf|angriff|greif|jag|monster|schlag|töt|armee|befehl/.test(t)){const foe=R({held:['einen Goblin-Trupp','einen Oger','einen Dämonenspäher'],villainess:['einen Attentäter','eine Rivalin'],daemon:['eine Abenteurergruppe','einen rebellischen Fürsten'],mensch:['ein Wildschwein','einen Wegelagerer','einen Wolf']}[S.role]||['einen Gegner']);
  const win=Math.random()<0.45+s.str/80;const dmg=rnd(5,20)+(win?0:15);
  txt=win?`Du forderst ${foe} heraus und siegst!`:`Du forderst ${foe} heraus und entkommst blutend.`;
  ch={hp:-dmg,xp:win?rnd(30,60):10,str:win&&Math.random()<.4?1:0,ruf:win?(S.role==='daemon'?-5:5):0};if(win&&Math.random()<.3)ch.items=[{name:R(['Monsterkern','Silbermünzen','Amulett','Heiltrank']),icon:'💎',desc:'Beute',type:'misc'}]}
 else if(/red|sprech|sag|frag|flirt|küss|hilf|helf|plan|lieb|tee|party/.test(t)||who){const n=who||R(npcs);const good=Math.random()<0.5+s.cha/50;
  txt=good?`${n} hört dir zu. ${R(['Ein kleines Lächeln.','„Du bist anders…“','Ihr redet lange.'])}`:`${n} wirkt abweisend. ${R(['„Was willst du?“','Ein kalter Blick.','Unterbrochen.'])}`;
  ch={affinity:{[n]:good?rnd(8,18):-rnd(2,8)},trust:{[n]:good?rnd(4,10):-1},xp:15,cha:good&&Math.random()<.3?1:0}}
 else if(/train|üb|lern|magie|zauber|stud/.test(t)){const cost=Math.min(s.mp,rnd(5,15));txt=`Du trainierst. ${R(['Schweiß und Fortschritt.','Ein neues Gefühl.','Mühsam, aber lohnend.'])}`;
  ch={mp:-cost,xp:rnd(20,40),str:Math.random()<.5?1:0};if(Math.random()<.25)ch.newSkills=[{name:R(['Doppelschlag','Schildwall','Giftige Zunge','Schattenportal','Fallenbau','Kräuterkunde']),icon:'✨',desc:'Neu erlernt',level:1,cost:5,cd:0}]}
 else if(/ruh|schlaf|rast|ess|heil/.test(t)){txt='Du ruhst dich aus. Wärme kehrt zurück.';ch={hp:rnd(20,40),mp:rnd(10,25)}}
 else if(/intrig|lüg|schmied|spion|stehl|sabot/.test(t)){const ok=Math.random()<.55;txt=ok?'Dein Plan geht auf.':'Du wirst beinahe erwischt!';ch={xp:25,ruf:ok?rnd(-3,6):-10}}
 else if(/quest|auftrag|mission|hauptgeschichte|nebenquest/.test(t)){const m=S.quests?.main;txt=m?`Du denkst an dein Ziel: ${m.ziel}. Offene Punkte: ${(m.objectives||[]).filter(o=>!(m.done||[]).includes(o)).join(', ')||'keine'}.`:'Die Geschichte ist noch unklar.';ch={xp:10,choices:defChoices()}}
 else{const ev=R([['Du findest etwas Verstecktes!',{items:[{name:R(['Goldmünzen','Alte Karte','Zauberring']),icon:'📦',desc:'Gefunden',type:'misc'}],xp:20}],['Ein Händler hilft.',{xp:10,ruf:2}],['Eine Falle!',{hp:-rnd(8,18),xp:10}],['Ein Fremder flüstert deinen Namen.',{xp:15,ruf:3}],['Ruhige Gegend. Du lernst die Welt kennen.',{xp:20}]]);
  txt=`Du versuchst: „${a}“. ${ev[0]}`;ch=ev[1]}
 ch.choices=[...defChoices().sort(()=>Math.random()-.5).slice(0,3),R(['Ausruhen','Umgebung erkunden','Training'])];
 // soft quest progress offline
 if(S.quests?.main&&Math.random()<.2){const left=(S.quests.main.objectives||[]).filter(o=>!(S.quests.main.done||[]).includes(o));if(left.length){ch.quests={mainObjectiveDone:left[0]};txt+='\n\n(Etwas fügt sich: '+left[0]+')'}}
 return {text:txt,changes:ch}}

/* ---------- AI ---------- */
if(!cfg.v2){if(cfg.mode==='offline'||!cfg.mode)cfg.mode=hasKey()?'gemini':'gemini';cfg.v2=1;localStorage.setItem(CFG,JSON.stringify(cfg))}
const FREE_URL='https://text.pollinations.ai/openai';
const STREAM_DELIM='###DATA###';
function romanceHint(){const lines=[];for(const[n,r]of Object.entries(S.romance||{})){if((r.affection|0)>5||(r.stage|0)>0)lines.push(n+':'+stageName(r.stage)+'(♡'+r.affection+'/T'+r.trust+')')}
 return lines.length?'BEZIEHUNGEN: '+lines.slice(0,6).join('; ')+'. Stufen: Fremd→Bekannt→Freund→Vertraut→Verliebt→Partner. Keine expliziten Inhalte (13+). Eifersucht möglich.':'BEZIEHUNGEN: noch dünn – organisch wachsen lassen.'}
function questHint(){const m=S.quests?.main;if(!m)return '';const left=(m.objectives||[]).filter(o=>!(m.done||[]).includes(o));
 return `QUEST (organisch steuern, nicht railroading): Akt „${m.actTitel}“ – Ziel: ${m.ziel}. Offen: ${left.join('; ')||'–'}. Nebenquests: ${(S.quests.side||[]).filter(q=>q.status!=='erledigt').slice(0,3).map(q=>q.titel).join('; ')}. Markiere Fortschritt in JSON quests.` }
function greyPrompt(stream){const B=GREY||PACKS.grey||{kern:{}};const k=B.kern||{};return `Du bist der Erzähler eines interaktiven literarischen Horror-Romans auf Deutsch: „${B.titel||'Greymourne'}“.
SPIELFIGUR: ${S.pc.name}${S.kind==='darren'?' (Romanfigur)':' (eigene Figur; Darren kann als NPC existieren)'}. Hintergrund: ${S.pc.bg}
TON: ${k.ton||B.ton||'Leiser Horror.'}
STIL: ${k.stil||'Deutsche literarische Prosa, 2. Person.'}
REGELN: ${((k.regeln_der_stadt||[]).slice(0,8)).map((x,i)=>(i+1)+') '+x).join(' ')}
SPOILERSCHUTZ: ${k.spoilerschutz||''}
${romanceHint()}
${questHint()}
ERZÄHLREGELN: 1) Erster Satz reagiert direkt. Fragen werden beantwortet. 2) 2. Person, nie Erzähler-Ich. 3) Kein Splatter/Anime-Fenster. 4) NPCs eigenständig (können ablehnen). 5) 4-9 Sätze. 6) Romanzen: zurückhaltend, melancholisch, passend zur Stadt.
${stream?`AUSGABE: Erzähltext, dann Zeile „${STREAM_DELIM}“, dann JSON: choices[4], changes{verstand,schuld,affinity,trust,xp,items,removeItems}, summary, world{scene,npcUpdates,newLocations,ereignisse}, quests{mainObjectiveDone?,advanceAct?,sideComplete?}, optional ending.`:`JSON mit narration, choices, changes, summary, world, quests.`}`}
function voiceHint(){const pack=PACKS[S.role];if(!pack?.npcs)return '';
 return 'STIMMEN: '+Object.entries(pack.npcs).slice(0,6).map(([k,v])=>k+': '+(v.stimme||v.art||'').slice(0,60)).join(' | ')}
function sysPrompt(stream=true){if(isG())return greyPrompt(stream);const r=ROLES[S.role];const pack=PACKS[S.role]||{};
 return `Du bist Erzähler eines interaktiven Isekai-Anime auf Deutsch. SPIELER = Hauptfigur.
Protagonist: ${S.pc?.name||r.name}, ${r.cls[S.cls]}, Leben ${S.lives}. Welt: ${pack.titel||r.world}. Ton: ${pack.ton||''}
${voiceHint()}
${romanceHint()}
${questHint()}
GOLDENE REGELN:
1. Erster Satz reagiert DIREKT. Fragen beantworten. Absurde Aktionen → echte NPC-Reaktionen.
2. NPCs sind eigenständig: eigene Ziele, können ablehnen/widersprechen/von sich aus handeln.
3. Steuere zur Hauptgeschichte organisch (Gerüchte, Gelegenheiten) – kein Railroading, Spielerfreiheit.
4. Romanzen: Stufen Fremd→…→Partner, geschmackvoll (13+), keine expliziten Szenen.
5. Anime-Mittel sparsam: (Gedanke), [Status]. 4-9 Sätze, 2. Person.
6. WELT-JSON nur für Szene/Updates. Inventar/Skills nur bei echten Änderungen.
${stream?`AUSGABE: Erzähltext, dann „${STREAM_DELIM}“, dann JSON: choices[4], changes{hp,mp,str,cha,ruf,xp,affinity,trust,items,newSkills,removeItems}, summary, world, quests{mainObjectiveDone?,advanceAct?,sideComplete?}, optional ending.`:`JSON: narration, choices, changes, summary, world, quests.`}`}
function greyDetails(a){const B=GREY||PACKS.grey;if(!B)return '';const txt=(a+' '+JSON.stringify(S.world.scene)+' '+(S.hist||[]).slice(-4).map(h=>h.content).join(' ')).toLowerCase();
 const pick=(obj,force)=>Object.entries(obj||{}).filter(([k])=>(force||[]).includes(k)||k.toLowerCase().split(/[ \/–-]+/).some(w=>w.length>3&&txt.includes(w)));
 const npcs=pick(B.npcs,S.kind==='darren'?['Der Schaffner']:['Der Schaffner','Darren Crowe']).slice(0,5).map(([k,v])=>{const o={rolle:v.rolle,art:v.art,stimme:v.stimme,ziel:v.ziel};if(S.turn>=40&&v.geheim)o.geheim=v.geheim;return k+': '+JSON.stringify(o)});
 const orte=pick(B.orte,[]).slice(0,4).map(([k,v])=>k+': '+v);
 return 'BIBEL (Szene):\n'+npcs.join('\n')+'\n'+orte.join('\n')}
function leanLore(a){if(isG())return greyDetails(a);const pack=PACKS[S.role];if(!pack)return '';
 const txt=(a+' '+(S.world?.scene?.ort||'')+' '+(S.summary||'')).toLowerCase();
 const bits=[];
 if(/magie|mana|zauber|skill|status/.test(txt)&&pack.magie)bits.push('Magie: '+pack.magie.slice(0,180));
 if(/könig|adel|politik|steuer|hof|kirche/.test(txt)&&pack.politik)bits.push('Politik: '+pack.politik.slice(0,180));
 if(/essen|schlaf|alltag|arbeit|markt/.test(txt)&&pack.alltag)bits.push('Alltag: '+pack.alltag.slice(0,140));
 return bits.length?'LORE: '+bits.join(' | '):''}
function stateSum(){const s=S.st;const inv=invNames().slice(0,12).join(', ');const sk=skillNames().slice(0,8).join(', ');
 if(isG())return `STATUS: Verstand ${s.hp}/100, Schuld ${s.ruf}/100 | Inventar: ${inv} | ${romanceHint()} | Zug ${S.turn}`;
 return `STATUS: Lv${s.lvl} HP${s.hp}/${s.maxhp} MP${s.mp} Str${s.str} Cha${s.cha} Ruf${s.ruf} | Skills: ${sk} | Inventar: ${inv} | ${romanceHint()} | Leben #${S.lives}`}
function msgs(a){let h=(S.hist||[]).slice(-10);if(!h.length){const last=S.log.filter(m=>m.k==='n').slice(-1)[0];if(last)h=[{role:'assistant',content:last.t}]}
 return [{role:'system',content:sysPrompt(false)},...h,{role:'user',content:turnMsg(a)}]}
function turnMsg(a){return (leanLore(a)?leanLore(a)+'\n':'')+worldText()+'\n'+(S.summary?'BISHER: '+S.summary+'\n':'')+stateSum()+'\n'+questHint()+'\n'+(isG()?'DIE SPIELFIGUR':'DER SPIELER')+' sagt/tut: „'+a+'“\n(Zuerst direkte Reaktion. NPCs können ablehnen.)'}
function parse(raw){let m=raw.match(/```(?:json)?\s*([\s\S]*?)```/)||raw.match(/(\{[\s\S]*\})\s*$/);let ch=null;
 if(m){try{ch=JSON.parse(m[1].trim())}catch(e){try{ch=JSON.parse(m[1].replace(/,\s*}/g,'}').replace(/'/g,'"'))}catch(_){}}}
 const text=(m?raw.replace(m[0],''):raw).replace(/```[\s\S]*$/,'').replace(/^\s*\d[.)]\s.*$/gm,'').replace(/\n*(Wie|Was) (willst|wirst|tust) du[^\n]*\?\s*$/,'').trim();return {text:text||'…',changes:ch||{xp:10}}}
function parseStream(raw){const i=raw.indexOf(STREAM_DELIM);if(i<0){const j=raw.lastIndexOf('{');if(j>0){const nar=raw.slice(0,j).trim();const o=gJSON(raw.slice(j));if(o)return packStream(nar||o.narration||o.text||'…',o)}return parse(raw)}
 const nar=raw.slice(0,i).trim();const o=gJSON(raw.slice(i+STREAM_DELIM.length).trim())||{};return packStream(nar||o.narration||'…',o)}
function packStream(text,o){const ch=Object.assign({},o.changes||{});if(o.choices)ch.choices=o.choices;if(o.summary)ch.summary=o.summary;if(o.world)ch.world=o.world;if(o.ending)ch.ending=o.ending;if(o.quests)ch.quests=o.quests;
 for(const k of ['verstand','schuld','hp','mp','str','cha','ruf','xp','affinity','trust','items','newSkills','removeItems']){if(k in o&&!(k in ch))ch[k]=o[k]}
 return {text:String(text||'…'),changes:ch}}

const G_FALLBACK=['gemini-2.5-flash','gemini-flash-latest','gemini-2.5-flash-lite','gemini-2.0-flash'];
const GM_KEY='isekai_gmodels';
const G_SAFE=['HARM_CATEGORY_HARASSMENT','HARM_CATEGORY_HATE_SPEECH','HARM_CATEGORY_SEXUALLY_EXPLICIT','HARM_CATEGORY_DANGEROUS_CONTENT'].map(category=>({category,threshold:'BLOCK_ONLY_HIGH'}));
const G_TIMEOUT=25000;
function gmStore(){try{return JSON.parse(localStorage.getItem(GM_KEY))||{}}catch(_){return {}}}
function gmSave(o){localStorage.setItem(GM_KEY,JSON.stringify(o))}
function gmScore(id){const n=id.toLowerCase();const v=(n.match(/gemini-(\d+(?:\.\d+)?)/)||[])[1];let s=(v?+v:0)*100;
 if(/flash-lite/.test(n))s+=15;else if(/flash/.test(n))s+=45;else if(/pro/.test(n))s-=30;
 if(/-latest$/.test(n))s+=350;if(/preview|exp/.test(n))s-=60;if(/gemma/.test(n))s-=400;return s}
function gmRank(list){const bad=/embed|image|imagen|tts|audio|live|vision|aqa|veo|lyria|robotics|computer-use|learnlm|native|thinking-exp|nano|banana|deep-research/i;
 const ids=list.filter(m=>(m.supportedGenerationMethods||[]).includes('generateContent')).map(m=>String(m.name||'').replace(/^models\//,'')).filter(id=>/^gemini/i.test(id)&&!bad.test(id));
 return [...new Set(ids)].sort((a,b)=>gmScore(b)-gmScore(a))}
async function gmFetch(key,force){const st=gmStore();if(!force&&st.key===key.slice(-6)&&st.list&&Date.now()-st.t<864e5)return st;
 let all=[],tok='';try{for(let i=0;i<10;i++){const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000'+(tok?'&pageToken='+encodeURIComponent(tok):'')+'&key='+encodeURIComponent(key));if(!r.ok)break;const j=await r.json();all=all.concat(j.models||[]);tok=j.nextPageToken;if(!tok)break}}catch(_){}
 const list=all.length?gmRank(all):null;const o={key:key.slice(-6),t:Date.now(),list:list||st.list||G_FALLBACK,fail:force?{}:(st.fail||{}),noThink:force?{}:(st.noThink||{}),chosen:st.chosen,manual:st.manual,lat:st.lat||{}};gmSave(o);gmUI();return o}
function gmOrder(st){const fail=st.fail||{},now=Date.now();const cool=m=>!(fail[m]&&now-fail[m].t<(fail[m].c===429?(fail[m].rd||600)*1000:864e5));
 let L=(st.list||G_FALLBACK).slice();
 if(st.manual){const primary=st.manual;const rest=L.filter(x=>x!==primary&&cool(x));return cool(primary)?[primary,...rest.slice(0,1)]:[...rest.slice(0,2)]}
 if(st.chosen&&cool(st.chosen)){const rest=L.filter(x=>x!==st.chosen&&cool(x));return [st.chosen,...rest.slice(0,1)]}
 const ok=L.filter(cool);return (ok.length?ok:L).slice(0,2)}
function gmUI(){const sel=$('#gmodel');if(!sel)return;const st=gmStore();const L=st.list||G_FALLBACK;
 sel.innerHTML='<option value="">Automatisch</option>'+L.map(m=>`<option value="${m}">${m}${st.chosen===m?' ✓':''}</option>`).join('');
 sel.value=st.manual||'';const gs=$('#gmstatus');if(gs)gs.textContent=st.chosen?'Aktiv: '+st.chosen:'Bereit'}
function thinkingCfg(model){const st=gmStore();if(st.noThink&&st.noThink[model])return null;const n=model.toLowerCase();
 if(/gemini-([34](\.|$)|3\.\d)/.test(n)||/^gemini-3/.test(n)||/gemini-4/.test(n)){if(/flash-lite|3\.6|gemini-3-flash(?!-)|3\.5|3\.1-flash-lite|robotics/.test(n))return {thinkingLevel:'minimal'};return {thinkingLevel:'low'}}
 if(/2\.5/.test(n))return {thinkingBudget:0};return null}
function gParse(j){const c=j.candidates?.[0];const t=(c?.content?.parts||[]).filter(p=>!p.thought).map(p=>p.text||'').join('');return {t,fr:c?.finishReason||j.promptFeedback?.blockReason||(c?'':'LEER')}}
function gJSON(t){if(!t)return null;t=String(t).replace(/^```(?:json)?\s*/i,'').replace(/```\s*$/,'').trim();try{return JSON.parse(t)}catch(_){}const i=t.indexOf('{'),k=t.lastIndexOf('}');if(i>=0&&k>i)try{return JSON.parse(t.slice(i,k+1))}catch(_){}return null}
function gBody(a){const contents=[];for(const m of (S.hist||[]).slice(-10)){const role=m.role==='assistant'?'model':'user';const last=contents[contents.length-1];
  if(last&&last.role===role)last.parts[0].text+='\n'+m.content;else contents.push({role,parts:[{text:m.content}]})}
 if(contents[0]&&contents[0].role==='model')contents.unshift({role:'user',parts:[{text:'(Spielbeginn)'}]});
 contents.push({role:'user',parts:[{text:turnMsg(a)}]});
 return {systemInstruction:{parts:[{text:sysPrompt(true)}]},contents,generationConfig:{temperature:.9,maxOutputTokens:800},safetySettings:G_SAFE}}
function friendlyAIFail(){return 'Die Erzählerin stockt kurz. Versuch es noch einmal – oder spiele ohne sie weiter.'}
function gErr(t){const e=new Error(t);e.gem=1;return e}
async function fetchWithTimeout(url,opts,ms){const ac=new AbortController();const to=setTimeout(()=>ac.abort(),ms);try{return await fetch(url,{...opts,signal:ac.signal})}finally{clearTimeout(to)}}
async function readSSE(res,onText){const reader=res.body.getReader();const dec=new TextDecoder();let buf='',raw='';
 while(true){const {done,value}=await reader.read();if(done)break;buf+=dec.decode(value,{stream:true});
  let idx;while((idx=buf.indexOf('\n'))>=0){let line=buf.slice(0,idx);buf=buf.slice(idx+1);if(line.endsWith('\r'))line=line.slice(0,-1);
   if(!line.startsWith('data:'))continue;const data=line.slice(5).trim();if(!data||data==='[DONE]')continue;
   try{const j=JSON.parse(data);const {t}=gParse(j);if(t){raw+=t;if(onText)onText(raw)}}catch(_){}}}
 if(buf.startsWith('data:')){try{const j=JSON.parse(buf.slice(5).trim());const {t}=gParse(j);if(t){raw+=t;if(onText)onText(raw)}}catch(_){}}
 return raw}
function showNarration(el,raw){let vis=raw;const i=raw.indexOf(STREAM_DELIM);if(i>=0)vis=raw.slice(0,i);else{const partial=STREAM_DELIM;for(let n=Math.min(partial.length-1,raw.length);n>=3;n--){if(raw.endsWith(partial.slice(0,n))){vis=raw.slice(0,-n);break}}}
 el.textContent=vis.replace(/\n+$/,'');if(i>=0)el.classList.remove('typing');else el.classList.add('typing');
 const log=$('#log');if(log){const near=log.scrollHeight-log.scrollTop-log.clientHeight<120;if(near)log.scrollTop=log.scrollHeight}}

async function gmProbe(key){const st=await gmFetch(key);const cands=(st.list||G_FALLBACK).slice(0,6);const results=[];
 for(const m of cands){const t0=performance.now();
  try{const body={contents:[{role:'user',parts:[{text:'Sag nur: ok'}]}],generationConfig:{maxOutputTokens:8,temperature:0}};
   const tc=thinkingCfg(m);if(tc)body.generationConfig.thinkingConfig=tc;
   let res=await fetchWithTimeout(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify(body)},12000);
   let ms=Math.round(performance.now()-t0);let errObj=null;try{if(!res.ok)errObj=await res.json()}catch(_){}
   let msg=errObj?.error?.message||'';
   if(!res.ok&&res.status===400&&/thinking|Thinking/i.test(msg)){const s2=gmStore();s2.noThink=s2.noThink||{};s2.noThink[m]=1;gmSave(s2);
    const body2={contents:[{role:'user',parts:[{text:'Sag nur: ok'}]}],generationConfig:{maxOutputTokens:8,temperature:0}};
    res=await fetchWithTimeout(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify(body2)},12000);
    ms=Math.round(performance.now()-t0);errObj=null;try{if(!res.ok)errObj=await res.json()}catch(_){}msg=errObj?.error?.message||''}
   if(res.ok){results.push({m,ok:1,ms,c:200});continue}
   let rd=0;try{const d=(errObj?.error?.details||[]).find(x=>x['@type']?.includes('RetryInfo'));rd=parseInt(String(d?.retryDelay||'').replace(/s$/,''),10)||0}catch(_){}
   results.push({m,ok:0,ms,c:res.status,rd,msg:String(msg).slice(0,80)})}catch(e){results.push({m,ok:0,ms:Math.round(performance.now()-t0),c:0})}
 }
 const s2=gmStore();s2.lat=s2.lat||{};s2.fail=s2.fail||{};
 for(const r of results){if(r.ok){s2.lat[r.m]=r.ms;if(s2.fail[r.m])delete s2.fail[r.m]}else if(r.c){s2.fail[r.m]={c:r.c,t:Date.now(),rd:r.rd||(r.c===429?600:0)}}}
 const best=results.filter(r=>r.ok).sort((a,b)=>a.ms-b.ms)[0];
 if(best){s2.chosen=best.m;s2.lat[best.m]=best.ms}gmSave(s2);gmUI();return {best,results}}

async function gemini(a,el){const key=(cfg.gkey||'').trim();if(!key)throw gErr(friendlyAIFail());
 const st=await gmFetch(key);const base=gBody(a);const order=gmOrder(st);let last,tried=0;
 for(const m of order){if(tried>=2)break;tried++;
  el.classList.add('typing');el.textContent='…';
  let think=thinkingCfg(m),attempt=0;
  while(attempt++<2){const body=JSON.parse(JSON.stringify(base));
   if(think)body.generationConfig.thinkingConfig=think;else delete body.generationConfig.thinkingConfig;
   let res;try{res=await fetchWithTimeout(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(m)}:streamGenerateContent?alt=sse`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify(body)},G_TIMEOUT)}
   catch(e){last=gErr(friendlyAIFail());break}
   if(res.ok){let raw='';try{raw=await readSSE(res,r=>showNarration(el,r))}catch(_){last=gErr(friendlyAIFail());break}
    const packed=parseStream(raw);if(packed&&packed.text&&packed.text!=='…'){const s2=gmStore();s2.chosen=m;if(s2.fail)delete s2.fail[m];gmSave(s2);gmUI();return {...packed,model:m}}
    last=gErr(friendlyAIFail());break}
   let msg='',errObj=null;try{errObj=await res.json();msg=errObj?.error?.message||''}catch(_){}
   if(res.status===400&&think&&/thinking|Thinking|budget|level/i.test(msg)){const s2=gmStore();s2.noThink=s2.noThink||{};s2.noThink[m]=1;gmSave(s2);think=null;continue}
   if((res.status===400&&/api.?key/i.test(msg))||res.status===401||(res.status===403&&!/model/i.test(msg))){throw gErr(friendlyAIFail())}
   let rd=0;try{const d=(errObj?.error?.details||[]).find(x=>x['@type']?.includes('RetryInfo'));rd=parseInt(String(d?.retryDelay||'').replace(/s$/,''),10)||0}catch(_){}
   const s2=gmStore();s2.fail=s2.fail||{};s2.fail[m]={c:res.status,t:Date.now(),rd:rd||(res.status===429?600:0)};if(s2.chosen===m)delete s2.chosen;gmSave(s2);
   last=gErr(friendlyAIFail());break}
 }gmUI();throw last||gErr(friendlyAIFail())}

async function loadWebLLM(){if(engine)return engine;if(!navigator.gpu)throw new Error('WebGPU nicht verfügbar');
 const w=await import('https://esm.run/@mlc-ai/web-llm');$('#wstatus').textContent='Lade Modell…';
 engine=await w.CreateMLCEngine(cfg.wmodel||'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',{initProgressCallback:p=>{$('#wstatus').textContent=p.text}});$('#wstatus').textContent='✅ Modell bereit';return engine}
async function streamTo(el,iter){let raw='';for await(const c of iter){raw+=c;el.textContent=raw.split('```')[0]}return raw}
async function aiTurn(a,el,mode=cfg.mode){if(mode==='webllm'){const e=await loadWebLLM();const it=await e.chat.completions.create({messages:msgs(a),stream:true,temperature:.8,max_tokens:400});
  return streamTo(el,(async function*(){for await(const c of it)yield c.choices[0]?.delta?.content||''})())}
 if(mode==='api'){const res=await fetch((cfg.aurl||'').replace(/\/$/,'')+'/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+cfg.akey},body:JSON.stringify({model:cfg.amodel,messages:msgs(a),temperature:.8,max_tokens:500})});
  if(!res.ok)throw new Error('API '+res.status);const j=await res.json();const t=j.choices[0].message.content;el.textContent=t.split('```')[0];return t}
 if(mode==='free'){let err;for(let i=0;i<2;i++){try{const ac=new AbortController(),to=setTimeout(()=>ac.abort(),25000);
   const res=await fetch(FREE_URL,{method:'POST',signal:ac.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'openai',messages:msgs(a),temperature:.9,reasoning_effort:'low',referrer:'https://markusstol.github.io/isekai-game/'})});clearTimeout(to);
   if(!res.ok){const e=new Error('Gratis-KI '+res.status);e.ra=+res.headers.get('Retry-After')||0;throw e}const j=await res.json();const mm=j.choices?.[0]?.message||{};let t=(mm.content||'').trim()||(mm.reasoning_content||'').trim();if(!t){const e=new Error('leere Antwort');e.ra=1;throw e}showNarration(el,t);return t}
  catch(e){err=e;if(i<1){el.textContent='…';await new Promise(r=>setTimeout(r,Math.min(3,e.ra||1)*1000))}}}throw err}
 throw new Error('offline')}
function setBusy(on){busy=!!on;const txt=$('#txt'),btn=$('#inputRow button'),ch=$('#choices');if(txt)txt.disabled=on;if(btn)btn.disabled=on;if(ch)ch.querySelectorAll('button').forEach(b=>b.disabled=on);document.body.classList.toggle('busy',on)}
async function act(a){if(busy||!a.trim())return;if(S.setup&&!S.setup.done)return;
 setBusy(true);const t0=performance.now();try{await loadPack(S.role)}catch(_){}
 add('p',a);S.turn++;const el=renderMsg('n','');el.classList.add('typing');el.innerHTML='<span class="dots">Schreibe</span>';let res;
 let softFail=false;try{if(cfg.mode==='offline')throw 0;
  if(cfg.mode==='gemini'||(cfg.mode!=='webllm'&&cfg.mode!=='api'&&cfg.mode!=='free'&&hasKey())){
   try{res=await gemini(a,el)}catch(e){softFail=true;el.textContent='…';el.classList.add('typing')}}
  if(!res&&(cfg.mode==='free'||softFail||(cfg.mode!=='gemini'&&cfg.mode!=='webllm'&&cfg.mode!=='api'&&cfg.mode!=='offline'))){
   try{const raw=await aiTurn(a,el,'free');let p=raw.includes(STREAM_DELIM)?parseStream(raw):parse(raw);if(p&&p.text&&p.text!=='…'&&p.text.length>8){res=p;softFail=false}}catch(_){}}
  if(!res&&cfg.mode!=='gemini'&&cfg.mode!=='free'){const raw=await aiTurn(a,el,cfg.mode);res=parse(raw)}
  if(!res){res=offline(a);softFail=true}
  {const c=res.changes,lim={hp:30,mp:30,str:2,cha:2,ruf:5,xp:60,verstand:15,schuld:5};for(const k in lim)if(k in c)c[k]=Math.max(-lim[k],Math.min(lim[k],+c[k]||0));if(c.affinity)for(const n in c.affinity)c.affinity[n]=Math.max(-15,Math.min(15,+c.affinity[n]||0));if(c.trust)for(const n in c.trust)c.trust[n]=Math.max(-10,Math.min(10,+c.trust[n]||0))}
  if(Array.isArray(res.changes.items))res.changes.items=res.changes.items.filter(x=>{const n=typeof x==='string'?x:x.name;return !invNames().includes(n)});
  if(Array.isArray(res.changes.newSkills))res.changes.newSkills=res.changes.newSkills.filter(x=>{const n=typeof x==='string'?x:x.name;return !skillNames().includes(n)});
  if(res.changes.summary){S.summary=String(res.changes.summary).slice(0,800);delete res.changes.summary}
  if(res.changes.world){try{applyWorld(res.changes.world)}catch(_){}delete res.changes.world}
  if(res.changes.quests){try{applyQuestUpdate(res.changes.quests)}catch(_){}delete res.changes.quests}
  S.hist=S.hist||[];S.hist.push({role:'user',content:'SPIELER: '+a},{role:'assistant',content:res.text});S.hist=S.hist.slice(-20);
  if(softFail)res.note=friendlyAIFail()}
 catch(e){res=offline(a);res.note=friendlyAIFail()}
 _dbgMs=Math.round(performance.now()-t0);el.remove();add('n',res.text);if(res.note)add('s',res.note);apply(res.changes);
 try{worldTick()}catch(_){}
 hud();save();setBusy(false);requestAnimationFrame(()=>{const t=$('#txt');if(t)t.focus({preventScroll:true})})}

/* ---------- UI boot ---------- */
function startScreen(){const g=$('#roles');g.innerHTML='';Object.entries(ROLES).filter(([k])=>k!=='grey').forEach(([k,r])=>{const b=document.createElement('button');b.className='role';b.innerHTML=`<div class="e">${r.e}</div><b>${r.name}</b><span>${r.d}</span>`;b.onclick=()=>newLife(k);g.appendChild(b)});
 const sv=localStorage.getItem(KEY);if(sv){$('#btnContinue').classList.remove('hidden');$('#btnContinue').onclick=async()=>{S=migrate(sv);try{await loadPack(S.role)}catch(_){}
  if(!S.world&&PACKS[S.role])S.world=buildWorldFromPack(PACKS[S.role],S.role);gateOrShow()}}}
$('#btnRandom').onclick=()=>newLife(R(ISEKAI));
$('#btnDarren').onclick=()=>newGrey('darren');$('#btnOwnShow').onclick=()=>$('#ownForm').classList.toggle('hidden');
$('#btnOwnGo').onclick=()=>newGrey('own',$('#ownName').value.trim(),$('#ownBg').value.trim());
$('#inputRow').onsubmit=e=>{e.preventDefault();const v=$('#txt').value;$('#txt').value='';act(v)};
$$('#tabs button').forEach(b=>b.onclick=()=>openDrawer(b.dataset.tab));
$('#btnSys').onclick=()=>openDrawer('status');
$('#btnDrawerClose').onclick=closeDrawer;
$('#drawer').addEventListener('click',e=>{if(e.target.id==='drawer')closeDrawer()});
const sync=()=>{$('#webllmBox').style.display=$('#mode').value==='webllm'?'':'none';$('#apiBox').style.display=$('#mode').value==='api'?'':'none'};
function openSheet(){$('#mode').value=cfg.mode;$('#wmodel').value=cfg.wmodel||$('#wmodel').value;$('#aurl').value=cfg.aurl||'';$('#akey').value=cfg.akey||'';$('#amodel').value=cfg.amodel||'';$('#gkey').value=cfg.gkey||'';
 if($('#dbgToggle'))$('#dbgToggle').checked=!!cfg.debug;gmUI();sync();$('#sheet').classList.remove('hidden')}
$('#btnMenu').onclick=openSheet;
$('#mode').onchange=sync;$('#btnClose').onclick=()=>$('#sheet').classList.add('hidden');
$('#gkey').oninput=()=>{if($('#gkey').value.trim())$('#mode').value='gemini';sync()};
function saveCfgFromUI(gk){const mode=$('#mode')?$('#mode').value:(gk?'gemini':'offline');
 cfg={v2:1,gkey:gk,mode:gk&&(!cfg.gkey||cfg.gkey!==gk)?'gemini':mode,wmodel:$('#wmodel')?.value,aurl:$('#aurl')?.value,akey:$('#akey')?.value,amodel:$('#amodel')?.value,debug:!!($('#dbgToggle')&&$('#dbgToggle').checked)};
 localStorage.setItem(CFG,JSON.stringify(cfg));
 const st=gmStore();if($('#gmodel'))st.manual=$('#gmodel').value||'';gmSave(st);
 if(gk)gmFetch(gk,true).then(()=>gmProbe(gk).catch(()=>{}));
 dbgLine();return cfg}
$('#btnSave').onclick=()=>{const gk=$('#gkey').value.trim();saveCfgFromUI(gk);
 toast(gk?'Gespeichert – die Geschichte kann beginnen.':(cfg.mode==='offline'?'Offline gespeichert':'Gespeichert'));
 $('#sheet').classList.add('hidden')};
$('#btnLoad').onclick=()=>{cfg.wmodel=$('#wmodel').value;engine=null;loadWebLLM().catch(e=>$('#wstatus').textContent='❌ '+e.message)};
$('#btnReset').onclick=()=>{if(confirm('Wirklich alles löschen?')){localStorage.removeItem(KEY);location.reload()}};
$('#btnAdv').onclick=()=>{$('#advBox').classList.toggle('hidden');$('#btnAdv').textContent=$('#advBox').classList.contains('hidden')?'Erweitert ▸':'Erweitert ▾'};
$('#btnGateSave').onclick=()=>{const gk=$('#gateKey').value.trim();if(!gk){toast('Bitte Schlüssel einfügen');return}
 cfg.gkey=gk;cfg.mode='gemini';cfg.v2=1;localStorage.setItem(CFG,JSON.stringify(cfg));
 toast('Alles bereit.');gmFetch(gk,true).then(()=>gmProbe(gk).catch(()=>{}));show()};
$('#btnGateSkip').onclick=()=>{cfg.mode='offline';cfg.v2=1;localStorage.setItem(CFG,JSON.stringify(cfg));show()};
window.__game={newGrey,greyDetails,loadGrey,loadPack,get S(){return S},act,newLife,gBody,msgs,gmRank,gmProbe,parseStream,thinkingCfg,gmOrder,readSSE,STREAM_DELIM,migrate,worldTick,bumpRel,openDrawer,stageName,offline};
window.__game.askNPC=a=>askNPC(a);window.__game.gemini=gemini;
if(cfg.gkey)gmFetch(cfg.gkey.trim()).then(()=>gmProbe(cfg.gkey.trim()).catch(()=>{})).catch(()=>{});
(function(){const root=document.documentElement;const apply=()=>{try{const vv=window.visualViewport;if(!vv)return;const kb=Math.max(0,window.innerHeight-vv.height-vv.offsetTop);root.style.setProperty('--kb',kb+'px');if(kb>40){const log=$('#log');if(log)log.scrollTop=log.scrollHeight}}catch(_){}};
 if(window.visualViewport){visualViewport.addEventListener('resize',apply);visualViewport.addEventListener('scroll',apply)}
 window.addEventListener('focusin',e=>{if(e.target&&e.target.id==='txt'){setTimeout(()=>{try{e.target.scrollIntoView({block:'end',behavior:'smooth'})}catch(_){};apply()},300)}});
 $('#txt')&&$('#txt').addEventListener('blur',()=>root.style.setProperty('--kb','0px'))})();
try{if('serviceWorker' in navigator&&navigator.serviceWorker){navigator.serviceWorker.register('./sw.js?v=9').catch(()=>{});
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(sessionStorage.getItem('isekai_sw_reloaded'))return;sessionStorage.setItem('isekai_sw_reloaded','1');location.reload()})}}catch(_){}
startScreen();
