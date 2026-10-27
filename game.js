const $=s=>document.querySelector(s);const R=a=>a[Math.floor(Math.random()*a.length)];const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const ROLES={
 held:{e:'⚔️',name:'Held mit Status-System',d:'Ein blaues Fenster erscheint: [Status]. Die Welt braucht dich.',world:'Königreich Aldheim, bedroht vom Dämonenheer',
  base:{hp:100,mp:40,str:12,cha:8,ruf:10},skills:['Status-Fenster','Schwertschlag'],inv:['Bronzeschwert','Heiltrank'],
  npcs:{Lyra:'Elfische Bogenschützin, misstrauisch',Garrick:'Polternder Söldner',Prinzessin_Elise:'Beschwört dich, kühl & stolz'},
  cls:['Abenteurer','Ritter','Held','Legendärer Held']},
 villainess:{e:'🌹',name:'Villainess',d:'Du erwachst als Lady Rosalind – die Schurkin aus einem Otome-Roman. Dein Untergang ist in 1 Jahr.',world:'Akademie von Lumière, Hofintrigen',
  base:{hp:70,mp:60,str:5,cha:16,ruf:-20},skills:['Romanwissen','Eleganter Fächerhieb'],inv:['Seidenfächer','Tagebuch der Zukunft'],
  npcs:{Kronprinz_Julian:'Dein Verlobter, hasst dich',Heldin_Mira:'Die Protagonistin, zu nett',Ritter_Cedric:'Stiller Leibwächter'},
  cls:['Verstoßene Lady','Salonlöwin','Herzogin','Kaiserin der Intrige']},
 daemon:{e:'😈',name:'Dämonenkönig',d:'Du erwachst auf einem Thron aus Knochen. Deine Diener knien – und ein Held ist unterwegs.',world:'Das Dunkle Reich Nocturna',
  base:{hp:160,mp:120,str:20,cha:6,ruf:-50},skills:['Dunkle Aura','Höllenflamme'],inv:['Krone der Nacht'],
  npcs:{Sekretärin_Velka:'Sukkubus-Beraterin, loyal',General_Brok:'Ork-General, will Krieg',Heldin_Aria:'Die Heldin, die dich töten will'},
  cls:['Gefallener Fürst','Dämonenlord','Dämonenkönig','Gott der Nacht']},
 mensch:{e:'🧑',name:'Normaler Mensch',d:'Keine Kräfte, kein Status. Nur du, ein Dorf und viel Hoffnung.',world:'Dorf Kleinbach am Waldrand',
  base:{hp:60,mp:0,str:6,cha:8,ruf:0},skills:['Moderne Bildung'],inv:['Holzstock','Brotkanten'],
  npcs:{Wirtin_Hanna:'Gutmütige Tavernenwirtin',Jäger_Tom:'Rauer Jäger',Hexe_Morgana:'Mysteriöse Waldhexe'},
  cls:['Dorfbewohner','Lehrling','Meister','Ungekrönter Legende']}
};
const KEY='isekai_save_v1',CFG='isekai_cfg_v1';
let S=null,cfg=JSON.parse(localStorage.getItem(CFG)||'{"mode":"free"}'),engine=null,busy=false;
const save=()=>localStorage.setItem(KEY,JSON.stringify(S));
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('on'),2200)}

function newLife(role,meta){const r=ROLES[role];meta=meta||{lives:0,soul:0,keptSkills:[]};
 const b=meta.soul;S={role,lives:meta.lives+1,soul:b,
  st:{hp:r.base.hp+b*5,maxhp:r.base.hp+b*5,mp:r.base.mp+b*3,maxmp:r.base.mp+b*3,str:r.base.str+b,cha:r.base.cha+b,ruf:r.base.ruf,lvl:1,xp:0},
  skills:[...new Set([...r.skills,...meta.keptSkills])],inv:[...r.inv],aff:Object.fromEntries(Object.keys(r.npcs).map(k=>[k,0])),
  cls:0,turn:0,hist:[],log:[],flags:{}};
 const intro=`${r.e} ${meta.lives?`Reinkarnation #${S.lives}. Deine Seele erinnert sich (Seelenfragmente: ${b}).`:'Ein Lastwagen. Licht. Dann – Stille.'}\n\n${r.d}\nWelt: ${r.world}.\nDu triffst: ${Object.keys(r.npcs).map(n=>n.replace('_',' ')).join(', ')}.`;
 add('n',intro);S.choices=defChoices();save();show();}
function defChoices(){const r=S.role;return {held:['Monster jagen','Mit Lyra reden','Training im Hof','Die Stadt erkunden'],villainess:['Mit dem Kronprinzen sprechen','Mira helfen','Intrige schmieden','Teeparty besuchen'],daemon:['Armee befehligen','Mit Velka planen','Die Heldin ausspionieren','Dunkle Magie üben'],mensch:['In der Taverne arbeiten','Mit Tom jagen gehen','Die Hexe besuchen','Ausruhen']}[r]}
function add(k,t){S.log.push({k,t});if(S.log.length>80)S.log.shift();renderMsg(k,t)}
function renderMsg(k,t){const d=document.createElement('div');d.className='msg '+k;d.textContent=t;$('#log').appendChild(d);d.scrollIntoView({behavior:'smooth',block:'end'});return d}
function hud(){const s=S.st,r=ROLES[S.role];const p=(v,m,c)=>`<div class="bar"><i style="width:${Math.max(0,Math.min(100,v/m*100))}%;background:${c}"></i></div>`;
 $('#hud').innerHTML=`<b>${r.e} ${r.cls[S.cls]}</b> · Lv ${s.lvl} · Leben #${S.lives}
 <div class="bars"><div style="flex:1">HP ${Math.max(0,s.hp)}/${s.maxhp}${p(s.hp,s.maxhp,'#ff5f7e')}</div><div style="flex:1">MP ${s.mp}/${s.maxmp}${p(s.mp,s.maxmp||1,'#6fb6ff')}</div><div style="flex:1">XP ${s.xp}/${s.lvl*100}${p(s.xp,s.lvl*100,'#ffd35a')}</div></div>
 <div class="chips"><span class="chip">💪 ${s.str}</span><span class="chip">✨ ${s.cha}</span><span class="chip">📣 Ruf ${s.ruf}</span>${Object.entries(S.aff).map(([n,v])=>`<span class="chip">💗 ${n.split('_').pop()} ${v}</span>`).join('')}</div>`;
 const c=$('#choices');c.innerHTML='';(S.choices||[]).slice(0,4).forEach(t=>{const b=document.createElement('button');b.textContent=t;b.onclick=()=>act(t);c.appendChild(b)})}
function show(){$('#start').classList.add('hidden');$('#game').classList.remove('hidden');$('#log').innerHTML='';S.log.forEach(m=>renderMsg(m.k,m.t));hud()}

// ---------- apply JSON changes ----------
function apply(ch){if(!ch)return;const s=S.st,num=v=>Math.max(-200,Math.min(200,Math.round(+v||0)));const out=[];
 const map={hp:'hp',mp:'mp',str:'str',staerke:'str',stärke:'str',cha:'cha',charme:'cha',ruf:'ruf',xp:'xp'};
 for(const[k,v]of Object.entries(ch)){const m=map[k.toLowerCase()];if(m&&v){s[m]+=num(v);out.push(`${k} ${v>0?'+':''}${num(v)}`)}}
 if(ch.affinity&&typeof ch.affinity==='object')for(const[n,v]of Object.entries(ch.affinity)){const key=Object.keys(S.aff).find(a=>a.toLowerCase().includes(n.toLowerCase().split(/[ _]/).pop()));if(key&&v){S.aff[key]=Math.max(-100,Math.min(100,S.aff[key]+num(v)));out.push(`💗${key.split('_').pop()} ${v>0?'+':''}${num(v)}`)}}
 (ch.newSkills||ch.skills||[]).forEach(x=>{if(typeof x==='string'&&!S.skills.includes(x)&&S.skills.length<20){S.skills.push(x.slice(0,40));out.push('Skill: '+x)}});
 (ch.items||ch.addItems||[]).forEach(x=>{if(typeof x==='string'&&S.inv.length<30){S.inv.push(x.slice(0,40));out.push('Item: '+x)}});
 (ch.removeItems||[]).forEach(x=>{const i=S.inv.indexOf(x);if(i>=0)S.inv.splice(i,1)});
 if(Array.isArray(ch.choices)&&ch.choices.length)S.choices=ch.choices.filter(x=>typeof x==='string').map(x=>x.slice(0,50));
 s.hp=Math.min(s.hp,s.maxhp);s.mp=Math.max(0,Math.min(s.mp,s.maxmp));
 while(s.xp>=s.lvl*100){s.xp-=s.lvl*100;s.lvl++;s.maxhp+=10;s.hp=s.maxhp;s.maxmp+=5;s.mp=s.maxmp;s.str+=2;s.cha+=1;out.push(`⬆ LEVEL ${s.lvl}!`)}
 const nc=Math.min(3,Math.floor(s.lvl/5));if(nc>S.cls){S.cls=nc;const cn=ROLES[S.role].cls[nc];out.push(`🌟 Klassenwechsel: ${cn}!`);S.skills.push(R(['Erwachte Aura','Zweite Natur','Seelenblick','Königlicher Befehl']))}
 if(out.length)add('s',out.join(' · '));
 if(ch.ending)return ending(String(ch.ending));checkEnd()}
function checkEnd(){const s=S.st;
 if(s.hp<=0)return death();
 const top=Object.entries(S.aff).find(([,v])=>v>=100);if(top)return ending(`Romantisches Ende mit ${top[0].replace('_',' ')} 💞`);
 if(s.lvl>=20)return ending('Legenden-Ende: Dein Name wird ewig besungen 👑');
 if(s.ruf>=150)return ending('Ruhmes-Ende: Das Volk krönt dich zur Hoffnung der Welt');
 if(s.ruf<=-150)return ending('Tyrannen-Ende: Die Welt kniet in Furcht vor dir');}
function death(){add('s',`💀 Du bist gestorben (Level ${S.st.lvl}).`);setTimeout(()=>reincarnate('Die Göttin seufzt: „Schon wieder? Na gut – nimm etwas mit.“'),600)}
function ending(t){add('s','🏁 ENDE: '+t);S.choices=[];hud();save();setTimeout(()=>reincarnate('Ein neues Kapitel? Deine Seele wird stärker.'),1500)}
function reincarnate(msg){const soul=S.soul+Math.max(1,Math.floor(S.st.lvl/2));const kept=S.skills.filter(x=>!Object.values(ROLES).some(r=>r.skills.includes(x))).slice(-2);
 const meta={lives:S.lives,soul,keptSkills:kept};add('n',msg+(kept.length?`\nBehaltene Skills: ${kept.join(', ')}`:''));
 S.choices=[];hud();const c=$('#choices');c.innerHTML='';Object.entries(ROLES).forEach(([k,r])=>{const b=document.createElement('button');b.textContent=r.e+' '+r.name;b.onclick=()=>{$('#log').innerHTML='';newLife(k,meta)};c.appendChild(b)});save()}

// ---------- offline narrator ----------
function offline(a){const t=a.toLowerCase(),s=S.st,r=ROLES[S.role],npcs=Object.keys(S.aff);
 const who=npcs.find(n=>n.toLowerCase().split('_').some(p=>p.length>2&&t.includes(p.toLowerCase())));
 const nm=x=>x.replace('_',' ');let txt,ch={};
 if(/kämpf|kampf|angriff|greif|jag|monster|schlag|töt|armee|befehl/.test(t)){const foe=R({held:['einen Goblin-Trupp','einen Oger','einen Dämonenspäher'],villainess:['einen Attentäter','eine eifersüchtige Rivalin im Duell'],daemon:['eine Abenteurergruppe','einen rebellischen Fürsten'],mensch:['einen Wildschwein','einen Wegelagerer','einen Wolf']}[S.role]);
  const win=Math.random()<0.45+s.str/80;const dmg=rnd(5,20)+(win?0:15);
  txt=win?`Du forderst ${foe} heraus. ${R(['Ein präziser Hieb','Ein waghalsiger Konter','Pure Entschlossenheit'])} entscheidet den Kampf – du siegst!`:`Du forderst ${foe} heraus, doch der Gegner ist stärker. Du entkommst blutend.`;
  ch={hp:-dmg,xp:win?rnd(30,60):10,str:win&&Math.random()<.4?1:0,ruf:win?(S.role==='daemon'?-5:5):0};if(win&&Math.random()<.3)ch.items=[R(['Monsterkern','Silbermünzen','Seltsames Amulett','Heiltrank'])]}
 else if(/red|sprech|sag|frag|flirt|küss|hilf|helf|plan|lieb|tee|party/.test(t)||who){const n=who||R(npcs);const good=Math.random()<0.5+s.cha/50;
  txt=good?`${nm(n)} (${r.npcs[n]}) hört dir zu. ${R(['Ein kleines Lächeln huscht über das Gesicht.','„Du bist anders, als ich dachte…“','Ihr redet bis spät in die Nacht.'])}`:`${nm(n)} wirkt abweisend. ${R(['„Was willst du?“','Ein kalter Blick trifft dich.','Ihr werdet unterbrochen.'])}`;
  ch={affinity:{[n]:good?rnd(8,18):-rnd(2,8)},xp:15,cha:good&&Math.random()<.3?1:0,ruf:good?2:-1}}
 else if(/train|üb|lern|magie|zauber|stud/.test(t)){const cost=Math.min(s.mp,rnd(5,15));txt=`Du trainierst hart. ${R(['Schweiß tropft, doch du spürst Fortschritt.','Ein neues Gefühl regt sich in dir.','Es ist mühsam – aber lohnend.'])}`;
  ch={mp:-cost,xp:rnd(20,40),str:Math.random()<.5?1:0};if(Math.random()<.25)ch.newSkills=[R({held:['Doppelschlag','Schildwall','Lichtklinge'],villainess:['Giftige Zunge','Tränen-Taktik','Hofetikette'],daemon:['Schattenportal','Seelenraub','Furchtgebrüll'],mensch:['Kochen','Fallenbau','Feilschen','Kräuterkunde']}[S.role])]}
 else if(/ruh|schlaf|rast|ess|heil/.test(t)){txt='Du ruhst dich aus. Wärme kehrt in deinen Körper zurück.';ch={hp:rnd(20,40),mp:rnd(10,25)}}
 else if(/intrig|lüg|schmied|spion|stehl|sabot/.test(t)){const ok=Math.random()<.55;txt=ok?'Dein Plan geht auf. Gerüchte verbreiten sich – genau wie du wolltest.':'Du wirst beinahe erwischt! Getuschel folgt dir.';ch={xp:25,ruf:ok?rnd(-3,6):-10,cha:ok?1:0}}
 else{const ev=R([['Du findest eine versteckte Truhe!',{items:[R(['Goldmünzen','Alte Karte','Zauberring'])],xp:20}],['Ein Händler bietet dir Hilfe an.',{xp:10,ruf:2}],['Eine Falle! Spitze Steine treffen dich.',{hp:-rnd(8,18),xp:10}],['Ein Fremder erkennt dich und flüstert deinen Namen…',{xp:15,ruf:3}],['Die Gegend ist ruhig. Du lernst die Welt besser kennen.',{xp:20}]]);
  txt=`Du versuchst: „${a}“. ${ev[0]}`;ch=ev[1]}
 ch.choices=[...defChoices().sort(()=>Math.random()-.5).slice(0,3),R(['Ausruhen','Die Umgebung erkunden','Training'])];
 return {text:txt,changes:ch}}

// ---------- AI ----------
if(!cfg.v2){if(cfg.mode==='offline'||!cfg.mode)cfg.mode='free';cfg.v2=1;localStorage.setItem(CFG,JSON.stringify(cfg))}
const FREE_URL='https://text.pollinations.ai/openai';
function sysPrompt(){const r=ROLES[S.role];return `Du bist der Erzähler (Spielleiter) eines Isekai-Textabenteuers auf Deutsch. Rolle des Spielers: ${r.name} (${r.cls[S.cls]}). Welt: ${r.world}. NPCs: ${Object.entries(r.npcs).map(([k,v])=>k+': '+v).join('; ')}.
REGELN:
1. Reagiere DIREKT auf die exakten Worte des Spielers. Stellt er eine Frage (z.B. „Woher kommt die Truhe?“), beantworte sie IN der Geschichte (durch Beobachtung, Erinnerung oder einen NPC) – erfinde keine andere Aktion.
2. Halte die Kontinuität: Orte, Gegenstände, Personen und Ereignisse aus der bisherigen Geschichte bleiben bestehen.
3. Schreibe 3-6 lebendige Sätze im Anime-Stil, in der 2. Person („du“). Kein Meta-Kommentar.
4. Sei fair: Riskantes kann HP kosten, Fragen/Reden kosten meist nichts.
Danach IMMER genau ein JSON-Block in \`\`\`json ... \`\`\` mit Änderungen, z.B.:
\`\`\`json
{"hp":0,"mp":0,"str":0,"cha":0,"ruf":0,"xp":10,"affinity":{"${Object.keys(r.npcs)[0]}":0},"newSkills":[],"items":[],"removeItems":[],"choices":["Passende Aktion 1","Aktion 2","Aktion 3","Aktion 4"],"summary":"Aktualisierte Kurz-Zusammenfassung der ganzen Geschichte bis jetzt (max. 4 Sätze)"}
\`\`\`
WICHTIG: Die Zahlen sind NUR die Änderungen durch DIESEN Zug (Deltas, keine Gesamtwerte) – meist 0. Bei Fragen/Gesprächen nur xp 5-15, sonst 0. "items" NUR neu erhaltene Gegenstände (nicht, was schon im Inventar ist), sonst []. "newSkills" nur selten.
"choices": genau 4 kurze, zur aktuellen Szene passende Aktionen. Werte klein halten (XP 5-60, HP -30..+30, Affinität -15..+15). Optional "ending":"Text" nur bei echtem Story-Ende.`}
function stateSum(){const s=S.st;return `STATUS: Lv${s.lvl} HP${s.hp}/${s.maxhp} MP${s.mp} Stärke${s.str} Charme${s.cha} Ruf${s.ruf} | Skills: ${S.skills.join(', ')} | Inventar: ${S.inv.join(', ')} | Affinität: ${Object.entries(S.aff).map(([k,v])=>k+'='+v).join(', ')} | Leben #${S.lives}`}
function msgs(a){const sum=S.summary?'BISHERIGE GESCHICHTE (Zusammenfassung): '+S.summary+'\n':'';
 let h=(S.hist||[]).slice(-16);if(!h.length){const last=S.log.filter(m=>m.k==='n').slice(-1)[0];if(last)h=[{role:'assistant',content:last.t}]}
 return [{role:'system',content:sysPrompt()},...h,{role:'user',content:sum+stateSum()+'\nSPIELER sagt/tut: „'+a+'“\n(Reagiere direkt darauf.)'}]}
function parse(raw){let m=raw.match(/```(?:json)?\s*([\s\S]*?)```/)||raw.match(/(\{[\s\S]*\})\s*$/);let ch=null;
 if(m){try{ch=JSON.parse(m[1].trim())}catch(e){try{ch=JSON.parse(m[1].replace(/,\s*}/g,'}').replace(/'/g,'"'))}catch(_){}}}
 const text=(m?raw.replace(m[0],''):raw).replace(/```[\s\S]*$/,'').trim();return {text:text||'…',changes:ch||{xp:10}}}
async function loadWebLLM(){if(engine)return engine;if(!navigator.gpu)throw new Error('WebGPU nicht verfügbar');
 const w=await import('https://esm.run/@mlc-ai/web-llm');$('#wstatus').textContent='Lade Modell…';
 engine=await w.CreateMLCEngine(cfg.wmodel||'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',{initProgressCallback:p=>{$('#wstatus').textContent=p.text}});$('#wstatus').textContent='✅ Modell bereit';return engine}
async function streamTo(el,iter){let raw='';for await(const c of iter){raw+=c;el.textContent=raw.split('```')[0]}return raw}
async function aiTurn(a,el){if(cfg.mode==='webllm'){const e=await loadWebLLM();const it=await e.chat.completions.create({messages:msgs(a),stream:true,temperature:.8,max_tokens:400});
  return streamTo(el,(async function*(){for await(const c of it)yield c.choices[0]?.delta?.content||''})())}
 if(cfg.mode==='api'){const res=await fetch((cfg.aurl||'').replace(/\/$/,'')+'/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+cfg.akey},body:JSON.stringify({model:cfg.amodel,messages:msgs(a),temperature:.8,max_tokens:500})});
  if(!res.ok)throw new Error('API '+res.status);const j=await res.json();const t=j.choices[0].message.content;el.textContent=t.split('```')[0];return t}
 if(cfg.mode==='free'){let err;for(let i=0;i<3;i++){try{const ac=new AbortController(),to=setTimeout(()=>ac.abort(),60000);
   const res=await fetch(FREE_URL,{method:'POST',signal:ac.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'openai',messages:msgs(a),temperature:.9,reasoning_effort:'low',referrer:'isekai-game'})});clearTimeout(to);
   if(!res.ok){const e=new Error('Gratis-KI '+res.status);e.ra=+res.headers.get('Retry-After')||0;throw e}const j=await res.json();const t=j.choices?.[0]?.message?.content;if(!t)throw new Error('leere Antwort');el.textContent=t.split('```')[0];return t}
  catch(e){err=e;if(i<2){el.textContent='⏳ KI ist ausgelastet, neuer Versuch…';await new Promise(r=>setTimeout(r,Math.min(20,e.ra||(i?8:3))*1000))}}}throw err}
 throw new Error('offline')}
async function act(a){if(busy||!a.trim())return;busy=true;add('p',a);S.turn++;const el=renderMsg('n typing','');let res;
 try{if(cfg.mode==='offline')throw 0;const raw=await aiTurn(a,el);res=parse(raw);{const c=res.changes,lim={hp:30,mp:30,str:2,cha:2,ruf:5,xp:60};for(const k in lim)if(k in c)c[k]=Math.max(-lim[k],Math.min(lim[k],+c[k]||0));if(c.affinity)for(const n in c.affinity)c.affinity[n]=Math.max(-15,Math.min(15,+c.affinity[n]||0))}if(Array.isArray(res.changes.items))res.changes.items=res.changes.items.filter(x=>!S.inv.includes(x));if(Array.isArray(res.changes.newSkills))res.changes.newSkills=res.changes.newSkills.filter(x=>!S.skills.includes(x));if(res.changes.summary){S.summary=String(res.changes.summary).slice(0,800);delete res.changes.summary}
  S.hist=S.hist||[];S.hist.push({role:'user',content:'SPIELER: '+a},{role:'assistant',content:res.text});S.hist=S.hist.slice(-16)}
 catch(e){res=offline(a);if(e)res.note='⚠️ KI nicht erreichbar ('+(e.message||e)+') – Offline-Erzähler sprang ein.'}
 el.remove();add('n',res.text);if(res.note)add('s',res.note);apply(res.changes);hud();save();busy=false}

// ---------- UI ----------
function startScreen(){const g=$('#roles');g.innerHTML='';Object.entries(ROLES).forEach(([k,r])=>{const b=document.createElement('button');b.className='role';b.innerHTML=`<div class="e">${r.e}</div><b>${r.name}</b><span>${r.d}</span>`;b.onclick=()=>newLife(k);g.appendChild(b)});
 const sv=localStorage.getItem(KEY);if(sv){$('#btnContinue').classList.remove('hidden');$('#btnContinue').onclick=()=>{S=JSON.parse(sv);show()}}}
$('#btnRandom').onclick=()=>newLife(R(Object.keys(ROLES)));
$('#inputRow').onsubmit=e=>{e.preventDefault();const v=$('#txt').value;$('#txt').value='';act(v)};
const sync=()=>{$('#webllmBox').style.display=$('#mode').value==='webllm'?'':'none';$('#apiBox').style.display=$('#mode').value==='api'?'':'none'};
$('#btnMenu').onclick=()=>{$('#mode').value=cfg.mode;$('#wmodel').value=cfg.wmodel||$('#wmodel').value;$('#aurl').value=cfg.aurl||'';$('#akey').value=cfg.akey||'';$('#amodel').value=cfg.amodel||'';sync();$('#sheet').classList.remove('hidden')};
$('#mode').onchange=sync;$('#btnClose').onclick=()=>$('#sheet').classList.add('hidden');
$('#btnSave').onclick=()=>{cfg={mode:$('#mode').value,wmodel:$('#wmodel').value,aurl:$('#aurl').value,akey:$('#akey').value,amodel:$('#amodel').value};localStorage.setItem(CFG,JSON.stringify(cfg));if(cfg.mode==='webllm'&&!navigator.gpu)toast('WebGPU fehlt – Offline-Fallback aktiv');else toast('Gespeichert');$('#sheet').classList.add('hidden')};
$('#btnLoad').onclick=()=>{cfg.wmodel=$('#wmodel').value;engine=null;loadWebLLM().catch(e=>$('#wstatus').textContent='❌ '+e.message)};
$('#btnReset').onclick=()=>{if(confirm('Wirklich alles löschen?')){localStorage.removeItem(KEY);location.reload()}};
$('#btnStats').onclick=()=>{if(!S)return;$('#sheet').classList.add('hidden');add('s',`📜 ${ROLES[S.role].cls[S.cls]} · Seelenfragmente ${S.soul}\nSkills: ${S.skills.join(', ')}\nInventar: ${S.inv.join(', ')}`)};
window.__game={get S(){return S},act,newLife};
startScreen();
