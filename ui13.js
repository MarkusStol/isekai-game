/** v13 UI: Home, Chronik, Finance, Kingdom, Codex, Map (zoom/pan/draw) */
import * as Sim from './sim.js';
import * as Map from './map.js';
import * as Econ from './econ.js';
import * as Codex from './codex.js';

export function renderHome(body, S, {act, closeMenu, phaseLabel}){
  const h=S.home||Sim.blankHome(); const st=Sim.HOME_STAGES[h.stage]||Sim.HOME_STAGES[0]; const next=Sim.HOME_STAGES[h.stage+1];
  const card=document.createElement('div'); card.className='card';
  let homeHtml='Kein Grundstück – Land beanspruchen.';
  if(h.owned){
    const plots=(S.farm?.plots||[]).map(p=>{
      if(!p.crop)return 'leer';
      return p.crop+(p.ready?' ✓':(' '+Math.floor(p.progress||0)+'/'+p.growDays));
    }).join(', ')||'leer';
    const build=h.building?('🔨 '+h.building.name+' ('+h.building.daysLeft+' T)'):(next?('Weiter: '+next.name):'Max');
    homeHtml='<b>'+st.name+'</b> · '+h.location
      +'<br>Stufe '+h.stage+'/5 · Räume: '+((h.rooms||[]).join(', ')||'–')
      +'<br>Möbel: '+((h.furniture||[]).join(', ')||'–')
      +'<br>Mitbewohner: '+((h.housemates||[]).join(', ')||'–')+' · Pets: '+((h.pets||[]).join(', ')||'–')
      +'<br>Material: Holz '+(h.materials?.wood|0)+' Stein '+(h.materials?.stone|0)+' Stoff '+(h.materials?.cloth|0)+' Nägel '+(h.materials?.nails|0)
      +'<br>'+build+'<br>Garten/Farmen: '+plots;
  }
  card.innerHTML='<h3>🏠 Zuhause</h3><p class="meta">'+homeHtml+'</p>';
  body.appendChild(card);
  const row=document.createElement('div'); row.className='row'; card.appendChild(row);
  const btn=(lab,fn)=>{const b=document.createElement('button');b.type='button';b.className='tiny';b.textContent=lab;b.onclick=()=>{closeMenu();fn()};row.appendChild(b)};
  if(!h.owned) btn('Land beanspruchen',()=>act('Ich beanspruche hier ein Grundstück'));
  else {btn('Material',()=>act('Ich sammle Holz und Material'));btn('Bauen',()=>act('Ich beginne zu bauen'));btn('Nach Hause',()=>act('Ich gehe nach Hause'));btn('Schlafen',()=>act('Ich schlafe'));btn('Pflanzen',()=>act('Ich pflanze Weizen'));btn('Ernten',()=>act('Ich ernte die Felder'))}
  const need=document.createElement('div'); need.className='card';
  need.innerHTML=`<h3>Bedürfnisse</h3><p class="meta">Hunger ${Math.round(S.needs?.hunger|0)} · Müdigkeit ${Math.round(S.needs?.fatigue|0)} · ${phaseLabel()}<br>Wetter: ${S.farm?.lastWeather||'–'} · Saison: ${S.cal?.season||'–'}</p>`;
  body.appendChild(need);
}

export function renderJournal(body, S){
  const list=[...(S.ledger||[])].reverse().slice(0,50);
  if(!list.length){body.innerHTML='<div class="card"><p>Chronik leer.</p></div>';return}
  list.forEach(e=>{
    const card=document.createElement('div'); card.className='card';
    card.innerHTML=`<h3>${e.type||'event'} · T${e.t?.day}/${e.t?.year||1} ${String(e.t?.hour??0).padStart(2,'0')}:00</h3>
      <p><b>${e.who||'?'}</b>: ${e.what}</p>
      <p class="meta">📍 ${e.where||'–'} · ${e.importance|0} · ${e.emotion||''}${(e.witnesses||[]).length?' · Zeugen: '+e.witnesses.join(', '):''}</p>`;
    body.appendChild(card);
  });
  if(S.ledgerSummaries?.length){
    const c=document.createElement('div');c.className='card';
    c.innerHTML=`<h3>Archiv-Zusammenfassungen</h3>${S.ledgerSummaries.slice(-5).map(s=>`<p class="meta">${s.count} Ereignisse · bemerkenswert: ${(s.notable||[]).map(n=>n.what).slice(0,3).join('; ')}</p>`).join('')}`;
    body.appendChild(c);
  }
}

export function renderFinance(body, S, {act, closeMenu}){
  Econ.ensureEcon(S);
  const f=S.finance;
  const card=document.createElement('div'); card.className='card';
  card.innerHTML=`<h3>💰 Finanzen</h3>
    <p>Börse: <b>${f.wallet|0}</b> 🪙 · Bank: <b>${f.bank|0}</b> · Schulden: <b>${f.debt|0}</b> (Zins ${(f.interestRate*100).toFixed(1)}%/Wo)</p>
    <p class="meta">Vorrat: Nahrung ${f.stockpile.food|0}, Getreide ${f.stockpile.grain|0}, Holz ${f.stockpile.wood|0}, Erz ${f.stockpile.ore|0}, Eisen ${f.stockpile.iron|0}</p>
    <p class="meta">Miete/Tag: ${f.rent|0} · Angestellte: ${(f.employees||[]).map(e=>e.name).join(', ')||'–'}</p>`;
  body.appendChild(card);
  const row=document.createElement('div'); row.className='row'; card.appendChild(row);
  const btn=(lab,fn)=>{const b=document.createElement('button');b.type='button';b.className='tiny';b.textContent=lab;b.onclick=()=>{closeMenu();fn()};row.appendChild(b)};
  btn('Bank +20',()=>act('Ich zahle 20 Gold auf die Bank'));
  btn('Kredit 50',()=>act('Ich nehme 50 Gold Kredit'));
  btn('Arbeiten',()=>act('Ich arbeite als Tagelöhner'));
  const exp=document.createElement('div'); exp.className='card';
  exp.innerHTML=`<h3>Buchung</h3>${(f.expenses||[]).slice(-6).map(e=>`<div class="lex-item">−${e.amount} ${e.reason} (T${e.t})</div>`).join('')||'<p class="meta">Keine Ausgaben.</p>'}${(f.income||[]).slice(-4).map(e=>`<div class="lex-item">+${e.amount} ${e.reason}</div>`).join('')}`;
  body.appendChild(exp);
}

export function renderKingdom(body, S, {act, closeMenu}){
  Econ.ensureEcon(S);
  const k=S.kingdom;
  const card=document.createElement('div'); card.className='card';
  card.innerHTML=`<h3>👑 ${k.name}</h3>
    <p>Schatz: <b>${k.treasury|0}</b> · Volk: ${k.population|0} · Stabilität: ${Math.round(k.stability)}% · Armee: ${k.army|0}</p>
    <p class="meta">Steuer ${(k.taxRate*100).toFixed(0)}% · Getreide ${k.resources.grain} · Holz ${k.resources.wood} · Erz ${k.resources.ore} · Eisen ${k.resources.iron}</p>
    <p class="meta">Handel: ${(k.tradeRoutes||[]).map(r=>r.to+(r.active?'':' (pausiert)')).join(', ')||'–'} · Politik: ${Object.entries(k.policies||{}).map(([a,b])=>a+':'+b).join(' · ')}</p>`;
  body.appendChild(card);
  const row=document.createElement('div'); row.className='row'; card.appendChild(row);
  const btn=(lab,fn)=>{const b=document.createElement('button');b.type='button';b.className='tiny';b.textContent=lab;b.onclick=()=>{closeMenu();fn()};row.appendChild(b)};
  btn('Steuer 10%',()=>act('Ich setze die Steuer auf 10 Prozent'));
  btn('Steuer 20%',()=>act('Ich setze die Steuer auf 20 Prozent'));
  btn('Armee +5',()=>act('Ich mustere 5 Soldaten für das Reich'));
}

export function renderCodex(body, S, {setSceneImage, imgUrl}){
  Codex.ensureCodex(S);
  const tabs=document.createElement('div'); tabs.className='row'; tabs.style.flexWrap='wrap';
  body.appendChild(tabs);
  const panel=document.createElement('div'); body.appendChild(panel);
  const localPort=(name)=>{
    const slug=String(name||'').toLowerCase().split(/\s+/).pop();
    const map={elise:'elise',lyra:'lyra',garrick:'garrick',orren:'orren',seris:'seris',rhett:'rhett',mira:'mira',julian:'julian',velka:'velka',brok:'brok',tom:'tom',otto:'otto',heldin:'heldin',ritter:'ritter'};
    for(const[k,v]of Object.entries(map)){if(String(name||'').toLowerCase().includes(k))return 'assets/port/'+v+'.webp'}
    return 'assets/port/'+slug+'.webp';
  };
  const mkImg=(e)=>{
    const seed=[...String(e.id||e.name)].reduce((a,c)=>a+c.charCodeAt(0),0)||42;
    const remote=imgUrl?imgUrl(e.imagePrompt||(e.cat+' '+e.name+' anime fantasy'),256,256,seed,false):'';
    const local=e.cat==='people'?localPort(e.name):(e.localImg||'');
    const src=local||remote||'';
    if(!src)return '';
    const onerr=remote&&local?` onerror="this.onerror=null;this.src='${remote}'"`: '';
    return '<img class="codex-thumb" src="'+src+'" alt="'+e.name+'" loading="lazy" width="96" height="96"'+onerr+' style="float:right;border-radius:10px;object-fit:cover;margin:0 0 8px 8px;border:1px solid #f0d59a44"/>';
  };
  const show=(cat)=>{
    panel.innerHTML='';
    const list=Codex.listCat(S,cat);
    if(!list.length){panel.innerHTML='<div class="card"><p class="meta">Noch keine Einträge in '+Codex.CODEX_LABEL[cat]+'.</p></div>';return}
    list.forEach(e=>{
      const card=document.createElement('div'); card.className='card';
      const blur=e.level==='glimpsed'?'filter:blur(1.5px);opacity:.85':'';
      card.innerHTML=mkImg(e).replace('style="','style="'+blur)
        +'<h3>'+(e.icon||'📖')+' '+e.name+' <span class="meta">'+(Codex.DISC_LABEL[e.level]||e.level)+'</span></h3>'
        +'<p>'+(e.level==='glimpsed'?((e.desc||'').slice(0,60)+'…'):(e.desc||'').slice(0,220))+'</p>'
        +'<p class="meta">'+(e.behavior?('Verhalten: '+e.behavior+' · '):'')+(e.habitat?('Habitat: '+e.habitat+' · '):'')+'Gesehen: '+((e.seenAt||[]).slice(-3).join(', ')||'–')+(e.obtained?.length?(' · Erhalten: '+e.obtained.slice(-2).join(', ')):'')+'</p>'
        +'<p class="meta">Stats: '+JSON.stringify(e.stats||{}).slice(0,100)+'</p>';
      const b=document.createElement('button'); b.type='button'; b.className='tiny'; b.textContent='Studieren';
      b.onclick=()=>{Codex.study(S,e.id); show(cat)};
      card.appendChild(b);
      if(setSceneImage){const v=document.createElement('button');v.type='button';v.className='tiny';v.textContent='Ansehen';v.onclick=()=>setSceneImage(e.imagePrompt,'codex_'+e.id);card.appendChild(v)}
      panel.appendChild(card);
    });
  };
  Codex.CODEX_CATS.forEach(cat=>{
    const b=document.createElement('button'); b.type='button'; b.className='tiny'; b.textContent=Codex.CODEX_LABEL[cat]+' ('+(S.codex.cats[cat]||[]).length+')';
    b.onclick=()=>show(cat); tabs.appendChild(b);
  });
  show('bestiary');
}

export function renderMap(body, S, {act, closeMenu, toast}){
  Map.ensureSpawn(S);
  const wrap=document.createElement('div'); wrap.className='card'; wrap.innerHTML='<h3>🗺 Weltkarte</h3><p class="meta">Pinch/Drag · Zeichnen · Nebel lichtet sich nur durch Reisen, Karten und Gerüchte.</p>';
  body.appendChild(wrap);
  const canvas=document.createElement('canvas'); canvas.width=340; canvas.height=340; canvas.style.width='100%'; canvas.style.borderRadius='12px'; canvas.style.border='1px solid #f0d59a55'; canvas.style.touchAction='none'; canvas.style.background='#0a1620';
  wrap.appendChild(canvas);
  const ctx=canvas.getContext('2d');
  const a=S.atlas;
  let drawMode=false, drawing=[];
  const worldToScreen=(x,y)=>({x:(x-a.pan.x)*a.zoom+canvas.width/2, y:(y-a.pan.y)*a.zoom+canvas.height/2});
  const screenToWorld=(sx,sy)=>({x:(sx-canvas.width/2)/a.zoom+a.pan.x, y:(sy-canvas.height/2)/a.zoom+a.pan.y});
  function paint(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // fog backdrop
    ctx.fillStyle='#071018'; ctx.fillRect(0,0,canvas.width,canvas.height);
    // grid
    ctx.strokeStyle='#ffffff10'; ctx.beginPath();
    for(let i=-5;i<=5;i++){const p1=worldToScreen(a.pan.x+i*50,a.pan.y-250);const p2=worldToScreen(a.pan.x+i*50,a.pan.y+250);ctx.moveTo(p1.x,p1.y);ctx.lineTo(p2.x,p2.y)}
    ctx.stroke();
    // drawings
    for(const d of(a.drawings||[])){
      if(!d.points?.length)continue;
      ctx.strokeStyle=d.color||'#f0d59a'; ctx.lineWidth=2; ctx.beginPath();
      d.points.forEach((pt,i)=>{const s=worldToScreen(pt.x,pt.y); i?ctx.lineTo(s.x,s.y):ctx.moveTo(s.x,s.y)}); ctx.stroke();
    }
    // locations
    for(const loc of Map.listVisible(S)){
      const s=worldToScreen(loc.x,loc.y);
      const fog=loc.fog;
      ctx.globalAlpha=fog==='rumored'?0.45:1;
      ctx.fillStyle=fog==='visited'?'#f0d59a':fog==='known'?'#a78bfa':fog==='rumored'?'#94a3b8':'#334155';
      ctx.beginPath(); ctx.arc(s.x,s.y,fog==='visited'?6:4,0,6.28); ctx.fill();
      ctx.fillStyle='#e2e8f0'; ctx.font='10px sans-serif';
      ctx.fillText((loc.icon||'•')+' '+(fog==='rumored'?'???':loc.name).slice(0,14), s.x+6, s.y+3);
      ctx.globalAlpha=1;
    }
    // marks
    for(const m of(a.marks||[])){
      const s=worldToScreen(m.x,m.y);
      ctx.fillStyle='#fb7185'; ctx.fillRect(s.x-3,s.y-8,6,6);
      ctx.fillStyle='#fda4af'; ctx.font='9px sans-serif'; ctx.fillText(m.label||'Pin',s.x+5,s.y-2);
    }
    // player
    const ps=worldToScreen(a.playerPos.x,a.playerPos.y);
    ctx.fillStyle='#4ade80'; ctx.beginPath(); ctx.arc(ps.x,ps.y,5,0,6.28); ctx.fill();
  }
  paint();
  // pan / draw
  let dragging=false, last=null;
  const pos=ev=>{const r=canvas.getBoundingClientRect();const t=ev.touches?ev.touches[0]:ev;return {x:(t.clientX-r.left)*(canvas.width/r.width),y:(t.clientY-r.top)*(canvas.height/r.height)}};
  canvas.addEventListener('pointerdown',ev=>{dragging=true;last=pos(ev);canvas.setPointerCapture(ev.pointerId);if(drawMode){const w=screenToWorld(last.x,last.y);drawing=[w]}});
  canvas.addEventListener('pointermove',ev=>{if(!dragging||!last)return;const p=pos(ev);
    if(drawMode){drawing.push(screenToWorld(p.x,p.y)); ctx.strokeStyle='#f0d59a'; ctx.lineWidth=2; ctx.beginPath(); const a1=worldToScreen(drawing[drawing.length-2].x,drawing[drawing.length-2].y); const a2=worldToScreen(drawing[drawing.length-1].x,drawing[drawing.length-1].y); ctx.moveTo(a1.x,a1.y);ctx.lineTo(a2.x,a2.y);ctx.stroke()}
    else {a.pan.x-=(p.x-last.x)/a.zoom; a.pan.y-=(p.y-last.y)/a.zoom; last=p; paint()}
  });
  canvas.addEventListener('pointerup',()=>{dragging=false;last=null;if(drawMode&&drawing.length>1){Map.addDrawing(S,drawing);drawing=[];paint()}});
  canvas.addEventListener('wheel',ev=>{ev.preventDefault();a.zoom=Math.max(0.4,Math.min(3,a.zoom*(ev.deltaY>0?0.9:1.1)));paint()},{passive:false});

  const tools=document.createElement('div'); tools.className='row'; wrap.appendChild(tools);
  const btn=(lab,fn)=>{const b=document.createElement('button');b.type='button';b.className='tiny';b.textContent=lab;b.onclick=fn;tools.appendChild(b);return b};
  btn('＋',()=>{a.zoom=Math.min(3,a.zoom*1.2);paint()});
  btn('－',()=>{a.zoom=Math.max(0.4,a.zoom/1.2);paint()});
  const db=btn('Zeichnen',()=>{drawMode=!drawMode;db.textContent=drawMode?'Zeichnen ✓':'Zeichnen';});
  btn('Pin',()=>{const label=prompt('Name der Marke','Mein Ort'); if(!label)return; Map.addPin(S,{x:a.playerPos.x+5,y:a.playerPos.y+5,label,note:''}); paint(); toast&&toast('📌 '+label)});
  btn('Norden',()=>{closeMenu();act('Ich erkunde nach Norden')});
  btn('Karte nutzen',()=>{closeMenu();act('Ich studiere eine gefundene Landkarte')});
  // list nearby
  const list=document.createElement('div'); list.className='card'; list.innerHTML='<h3>Sichtbar</h3>'+Map.listVisible(S).slice(0,12).map(l=>`<div class="lex-item">${l.icon} <b>${l.fog==='rumored'?'???':l.name}</b> <span class="meta">${l.fog}</span></div>`).join('');
  body.appendChild(list);
}

export function parseLifeExtras(a, S, helpers){
  const t=a.toLowerCase();
  const {advanceTime, travelTo, travelChoices, skillFromStr, toast}=helpers;
  // map
  if(/landkarte|gefundene karte|karte stud|karte nutzen|karte lesen/.test(t)){
    const r=Map.revealMapItem(S,{region:'umgebung'});
    Sim.ledgerPush(S,{type:'map',who:S.pc?.name,what:`Landkarte enthüllt ${r.count} Orte.`,where:S.world?.scene?.ort,importance:55,emotion:'neugierig'});
    Codex.discover(S,{cat:'maps',name:'Landkarte ('+r.region+')',desc:`Enthüllt ${r.count} Orte.`,where:S.world?.scene?.ort,level:'studied'});
    advanceTime(1);
    return {ok:true,text:`Du entfaltest eine Karte. ${r.count} Orte werden sichtbar (manche veraltet): ${r.revealed.slice(0,6).join(', ')}…`,changes:{xp:15,choices:travelChoices()}};
  }
  if(/erkunde? nach (norden|süden|osten|westen)|reise nach (norden|süden|osten|westen)|aufbruch nach (norden|süden|osten|westen)/.test(t)){
    const dir=t.includes('nord')?'n':t.includes('süd')?'s':t.includes('ost')?'o':'w';
    const loc=Map.exploreDirection(S,dir);
    Map.visitPlace(S,loc.name,{x:loc.x,y:loc.y});
    Codex.recordPlace(S,loc.name,loc.desc);
    if(!S.world.orte)S.world.orte={}; S.world.orte[loc.name]=loc.desc;
    const hours=Map.travelHours(S.atlas.playerPos,loc);
    // set scene
    S.world.scene={ort:loc.name,zeit:helpers.phaseLabel(),anwesend:[]};
    advanceTime(hours);
    Sim.ledgerPush(S,{type:'explore',who:S.pc?.name,what:`Entdeckt: ${loc.name} (${loc.terrain}).`,where:loc.name,importance:50,emotion:'entschlossen'});
    return {ok:true,text:`Du brichst ins Unbekannte auf und entdeckst <b>${loc.name}</b> — ${loc.desc} Reise: ${hours} Std.`,changes:{xp:20,choices:['Umsehen','Weiter erkunden','Karte öffnen','Ausruhen']}};
  }
  if(/pin setzen|markiere ort|eigene marke/.test(t)){
    const pin=Map.addPin(S,{x:S.atlas.playerPos.x,y:S.atlas.playerPos.y,label:'Marke',note:a.slice(0,60)});
    return {ok:true,text:`Du markierst „${pin.label}“ auf deiner Karte.`,changes:{choices:travelChoices()}};
  }
  // finance
  if(/auf die bank|bank einzahl|zahle .* bank/.test(t)){
    Econ.ensureEcon(S); const m=t.match(/(\d+)/); const amt=m?+m[1]:20;
    const r=Econ.bankDeposit(S,amt); advanceTime(1);
    return {ok:true,text:r.text,changes:{choices:travelChoices()}};
  }
  if(/kredit|darlehen|borg(e|en)? /.test(t)){
    const m=t.match(/(\d+)/); const amt=m?+m[1]:50;
    const r=Econ.takeLoan(S,amt); advanceTime(1);
    return {ok:true,text:r.text,changes:{choices:travelChoices()}};
  }
  if(/steuer auf (\d+)/.test(t)||/setze die steuer/.test(t)){
    const m=t.match(/(\d+)/); const r=Econ.setTax(S,(m?+m[1]:10)/100); advanceTime(1);
    return {ok:true,text:r.text,changes:{choices:travelChoices()}};
  }
  if(/mustere (\d+) soldaten|armee \+/.test(t)){
    Econ.ensureEcon(S); const n=+(t.match(/(\d+)/)||[0,5])[1];
    const cost=n*10; Econ.withdraw(S,cost,'Rekrutierung'); S.kingdom.army=(S.kingdom.army|0)+n;
    Sim.ledgerPush(S,{type:'kingdom',who:S.pc?.name,what:`${n} Soldaten gemustert.`,where:'Kaserne',importance:40,emotion:'entschlossen'});
    return {ok:true,text:`${n} Soldaten treten bei (−${cost} Gold). Armee: ${S.kingdom.army}.`,changes:{choices:travelChoices()}};
  }
  // farming
  if(/pflanz.*weizen|pflanz.*kartoffel|pflanz.*kräuter|pflanz.*kürbis|pflanz.*roggen/.test(t)){
    const crop=/kartoffel/.test(t)?'kartoffel':/kräuter/.test(t)?'kräuter':/kürbis/.test(t)?'kürbis':/roggen/.test(t)?'winterroggen':'weizen';
    const r=Econ.plantCrop(S,crop); advanceTime(2);
    return {ok:r.ok,text:r.text,changes:{xp:r.ok?8:0,choices:travelChoices()}};
  }
  if(/wässer|gieße|bewässer/.test(t)){const r=Econ.waterCrops(S);advanceTime(1);return {ok:true,text:r.text,changes:{choices:travelChoices()}}}
  if(/ernte/.test(t)){const r=Econ.harvestReady(S);advanceTime(2);return {ok:true,text:r.text,changes:{xp:r.got?.length?15:0,choices:travelChoices()}}}
  // codex study
  if(/codex|bestiarium|studiere .*eintrag/.test(t)){
    Codex.ensureCodex(S);
    const first=Object.values(S.codex.entries)[0];
    if(!first)return {ok:true,text:'Dein Codex ist noch leer — entdecke Kreaturen, Orte und Dinge.',changes:{choices:travelChoices()}};
    const e=Codex.study(S,first.id);
    return {ok:true,text:`Du vertiefst den Eintrag zu ${e.name}: nun „${Codex.DISC_LABEL[e.level]}“.`,changes:{xp:10,choices:travelChoices()}};
  }
  return null;
}

export default {renderHome,renderJournal,renderFinance,renderKingdom,renderCodex,renderMap,parseLifeExtras};
