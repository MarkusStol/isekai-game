/** v15 immersion: weather, ambient audio, scene FX, combat mini-flow, toast cleaners */
export function cleanSnippet(raw){
  let t=String(raw||'');
  t=t.replace(/^\[[^\]]+\]\s*/,'');
  t=t.replace(/FLAG:\s*[^\n]+/gi,'');
  // unwrap nested quotes / dialogue dumps
  t=t.replace(/„[^“]{0,200}“/g,' ').replace(/"[^"]{0,200}"/g,' ');
  t=t.replace(/Gutes Gespräch[^.!]*/gi,'unser Gespräch')
    .replace(/Unangenehmes Gespräch[^.!]*/gi,'eine Spannung')
    .replace(/sucht dich auf\s*:?/gi,'')
    .replace(/Ich denke noch an[^.!]*/gi,'')
    .replace(/\(Offscreen\)\s*/gi,'')
    .replace(/\s+/g,' ').trim();
  if(t.length>55)t=t.slice(0,52).replace(/\s+\S*$/,'')+'…';
  if(t.length<3||/^[:：\-–—.,;]+$/.test(t))return '';
  return t;
}

const INIT_LINES=(label)=>[
  `${label} kommt auf dich zu.`,
  `${label} winkt dich heran.`,
  `${label}: „Hast du einen Moment?“`,
  `${label} bleibt stehen und sieht dich an.`,
  `Jemand räuspert sich – ${label} will etwas sagen.`,
  `${label}: „Wir müssen reden.“`
];

export function npcInitiativeLine(label, memText){
  const snip=cleanSnippet(memText);
  // Only weave memory when it still carries concrete content (not our soft stubs)
  const weak=/^(unser Gespräch|eine Spannung|…|\.\.\.)?$/i.test(snip)||snip.length<8;
  if(snip && !weak && !/sucht dich|Gespräch mit dir|denke noch|unser Gespräch|eine Spannung/i.test(snip)){
    if(snip.length<=40 && !/[„"]/.test(snip)){
      const soft=[
        `${label} spricht dich an – wegen ${snip}.`,
        `${label}: „Kurz zu ${snip} …“`,
        `${label} bleibt stehen. Thema: ${snip}.`
      ];
      return soft[Math.floor(Math.random()*soft.length)];
    }
  }
  const pool=INIT_LINES(label);
  return pool[Math.floor(Math.random()*pool.length)];
}

export function seekPlayerLine(name){
  const pool=[
    `${name} findet dich und bleibt stehen.`,
    `${name} sucht dich auf.`,
    `${name} kommt eilig auf dich zu.`,
    `${name}: „Da bist du.“`
  ];
  return pool[Math.floor(Math.random()*pool.length)];
}

/** Rich offline narrator: 3–6 sentences from context */
export function richOfflineProse(S, playerAction, opts={}){
  const R=a=>a[Math.floor(Math.random()*a.length)];
  const scene=S.world?.scene||{};
  const ort=scene.ort||'diesem Ort';
  const zeit=scene.zeit||opts.phase||'der Stunde';
  const weather=opts.weather||S.flags?.weather||'klar';
  const anw=(scene.anwesend||[]).slice(0,3);
  const who=opts.who||anw[0];
  const npc=who?S.world?.npcs?.[who]:null;
  const label=opts.label||who||'jemand';
  const art=String(npc?.art||npc?.stimme||'').split(/[.;]/)[0].trim().slice(0,90);
  const mood=npc?.mood||'neutral';
  const memRaw=(npc?.memories||[]).slice(-1)[0];
  const mem=cleanSnippet(typeof memRaw==='string'?memRaw:(memRaw?.text||''));
  const act=String(playerAction||'').trim().slice(0,120);
  const tone=String(S.world?.lore?.ton||S.genre||'').slice(0,60);

  const weatherLine={
    regen:`Feiner Regen trommelt gegen Stein und Stoff.`,
    schnee:`Schnee flirrt in der Luft und legt sich lautlos.`,
    nebel:`Nebel schiebt sich zwischen euch, kalt und dicht.`,
    wind:`Ein Windstoß trägt Gerüche von ${ort}.`,
    klar:`Die Luft ist klar; jedes Geräusch trägt weit.`,
    embers:`Aschepartikel tanzen im Licht.`
  }[weather]||`Die Atmosphäre von ${ort} liegt schwer über der Szene.`;

  const timeFeel=/Nacht|Spät/i.test(zeit)?`Es ist ${zeit} – Schatten lang, Stimmen leiser.`
    :/Morgen/i.test(zeit)?`Es ist ${zeit}; die Welt wirkt noch unfertig.`
    :`Es ist ${zeit} in ${ort}.`;

  const lines=[];
  const isQ=/\?|was |wer |wie |wo |warum |wieso |weshalb |erzähl|frag/.test(act.toLowerCase());
  // Lead with the person and the answer — time/weather as color, not headline (seamless vs live narrators)
  if(who&&npc){
    lines.push(art?`${label} (${art}) bleibt in ${ort}.`:`${label} bleibt dir in ${ort} zugewandt.`);
    if(mem) lines.push(`Etwas an dir erinnert ${label} an: ${mem}.`);
    if(isQ){
      const topic=act.replace(/^[„"]?/,'').slice(0,80);
      lines.push(opts.good!==false
        ? R([
            `${label} überlegt. „Zu deiner Frage — ich sage dir, was ich weiß.“ Die Antwort bleibt knapp, aber ehrlich.`,
            `„Hm.“ ${label} senkt die Stimme. „Darüber spricht man hier nicht laut. Aber gut: ich erzähl’s dir.“`,
            `${label} nickt. Die Antwort kommt in ganzen Sätzen, ohne dich wegzuschicken.`
          ])
        : R([
            `${label} schüttelt den Kopf. „Nicht hier. Nicht so.“`,
            `Ein kurzes Schweigen. „Frag etwas anderes.“`
          ]));
      lines.push(weatherLine);
    } else {
      lines.push(R([
        `Die Haltung verrät ${mood==='wütend'?'Anspannung':'eine vorsichtige Offenheit'}.`,
        `${label} atmet aus, bevor Worte kommen.`,
        `Ein Blick wechselt – kurz, dann länger.`
      ]));
      lines.push(opts.good!==false
        ? R([
            `„${R(['Ich höre.','Gut, dass du das sagst.','Das bleibt zwischen uns.','Rede weiter.'])}“`,
            `${label} nickt langsam und antwortet mit Bedacht.`,
            `Ihr sprecht eine Weile; Pausen sind Teil des Gesprächs.`
          ])
        : R([
            `„Nicht jetzt.“ Die Stimme ist scharf, aber nicht laut.`,
            `${label} weicht einen Schritt zurück.`,
            `Ein kalter Blick – dann doch ein Satz, knapp und ehrlich.`
          ]));
      lines.push(timeFeel);
    }
  } else {
    lines.push(timeFeel);
    lines.push(weatherLine);
    lines.push(`Du handelst in ${ort}.`);
    lines.push(R([
      `Die Umgebung antwortet mit Geräuschen, Licht und dem Gewicht deiner Entscheidung.`,
      `Nichts zwingt dich – aber die Welt merkt sich, was du tust.`,
      `Ein Augenblick zieht sich, dann setzt sich etwas in Bewegung.`
    ]));
  }
  // 3–6 sentences
  let out=lines.filter(Boolean).slice(0,6).join(' ');
  out=out.replace(/\s+/g,' ').trim();
  if(out.split(/[.!?]/).filter(Boolean).length<3){
    out+=` Du spürst, wie ${ort} weiteratmet – unabhängig von dir.`;
  }
  return out;
}

/* ---- Scene FX ---- */
let _wx=null, _wxRAF=0, _wxKind='none';
export function ensureWeatherCanvas(){
  let c=document.getElementById('wxCanvas');
  if(!c){
    c=document.createElement('canvas'); c.id='wxCanvas'; c.className='wx-canvas';
    c.setAttribute('aria-hidden','true');
    const bg=document.getElementById('sceneBg');
    (bg||document.body).appendChild(c);
  }
  return c;
}
export function setWeather(kind){
  _wxKind=kind||'none';
  const c=ensureWeatherCanvas();
  const dpr=Math.min(2, window.devicePixelRatio||1);
  const resize=()=>{
    const p=c.parentElement||document.body;
    c.width=Math.floor(p.clientWidth*dpr); c.height=Math.floor(p.clientHeight*dpr);
    c.style.width=p.clientWidth+'px'; c.style.height=p.clientHeight+'px';
  };
  resize();
  cancelAnimationFrame(_wxRAF);
  if(_wxKind==='none'){const ctx=c.getContext('2d'); ctx&&ctx.clearRect(0,0,c.width,c.height); return;}
  const n=_wxKind==='schnee'?48:_wxKind==='embers'?36:64;
  _wx=Array.from({length:n},()=>({
    x:Math.random(), y:Math.random(),
    v:(.2+Math.random()*1.2)*(_wxKind==='schnee'?.4:1),
    s:1+Math.random()*2, a:.2+Math.random()*.6
  }));
  const tick=()=>{
    const ctx=c.getContext('2d'); if(!ctx)return;
    ctx.clearRect(0,0,c.width,c.height);
    for(const p of _wx){
      p.y+=p.v*0.004; p.x+=(_wxKind==='wind'||_wxKind==='regen'?0.0015:_wxKind==='embers'?-0.0008:0.0003);
      if(p.y>1){p.y=0;p.x=Math.random()} if(p.x>1)p.x=0; if(p.x<0)p.x=1;
      const x=p.x*c.width, y=p.y*c.height;
      if(_wxKind==='regen'){ctx.strokeStyle=`rgba(180,200,255,${p.a})`; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x-2,y+8*p.s); ctx.stroke()}
      else if(_wxKind==='schnee'){ctx.fillStyle=`rgba(255,255,255,${p.a})`; ctx.beginPath(); ctx.arc(x,y,p.s,0,6.28); ctx.fill()}
      else if(_wxKind==='nebel'){ctx.fillStyle=`rgba(200,210,220,${p.a*.08})`; ctx.fillRect(x-40,y-20,80,40)}
      else if(_wxKind==='embers'){ctx.fillStyle=`rgba(255,${120+p.s*40|0},60,${p.a})`; ctx.beginPath(); ctx.arc(x,y,p.s,0,6.28); ctx.fill()}
    }
    _wxRAF=requestAnimationFrame(tick);
  };
  _wxRAF=requestAnimationFrame(tick);
}
export function weatherFor(S){
  const h=S?.cal?.hour??S?.time?.hour??12;
  const ort=String(S?.world?.scene?.ort||'').toLowerCase();
  const genre=String(S?.genre||S?.role||'');
  if(/zombie|asche|dark|daemon/.test(genre)||/asche|moor|friedhof/.test(ort))return Math.random()<.5?'embers':'nebel';
  if(/cyber|neon/.test(genre)||/gasse|neon/.test(ort))return 'regen';
  if(/nord|schnee|winter|wall/.test(ort))return 'schnee';
  if(/hafen|nebel|grey|zug/.test(ort+genre))return 'nebel';
  if(h>=22||h<5)return Math.random()<.4?'nebel':'klar';
  if(Math.random()<.15)return 'regen';
  return 'klar';
}
export function applyDayNightTint(S){
  const el=document.getElementById('sceneBg'); if(!el)return;
  const h=S?.cal?.hour??12;
  let tint='none';
  if(h>=21||h<5)tint='night';
  else if(h<7)tint='dawn';
  else if(h>=18)tint='dusk';
  else tint='day';
  el.dataset.tint=tint;
  document.body.dataset.tint=tint;
}

export function crossfadeScene(imgEl, url){
  if(!imgEl||!url)return Promise.resolve();
  return new Promise(res=>{
    const next=new Image(); next.decoding='async'; next.crossOrigin='anonymous';
    next.onload=()=>{
      imgEl.classList.add('scene-fade-out');
      setTimeout(()=>{
        imgEl.src=url; imgEl.classList.remove('scene-fade-out'); imgEl.classList.add('on','scene-kenburns'); imgEl.style.opacity='1'; imgEl.style.zIndex='2';
        // soft ken-burns restart
        try{ imgEl.style.animation='none'; void imgEl.offsetWidth; imgEl.style.animation=''; }catch(_){}
        res();
      },280);
    };
    next.onerror=()=>res();
    next.src=url;
  });
}

/* ---- Ambient audio (WebAudio, muted by default) ---- */
let _audio=null, _nodes=null, _muted=true, _want=false;
export function isMuted(){return _muted}
export function toggleMute(){
  _muted=!_muted; _want=!_muted;
  if(!_muted)startAmbient(document.body.dataset.genre||'fantasy');
  else stopAmbient();
  return !_muted;
}
export function startAmbient(genre){
  if(_muted)return;
  try{
    _audio=_audio||new (window.AudioContext||window.webkitAudioContext)();
    if(_audio.state==='suspended')_audio.resume();
    stopAmbient(false);
    const master=_audio.createGain(); master.gain.value=0.035; master.connect(_audio.destination);
    const oscs=[];
    const beds={
      'genre-fantasy':[174.61,220,261.63],
      'genre-zombie':[55,82.41,110],
      'genre-cyberpunk':[98,196,311.13],
      'genre-darkfantasy':[65.41,98,130.81],
      'genre-postapoc':[73.42,110,146.83],
      'genre-grey':[87.31,130.81,164.81]
    };
    const freqs=beds[genre]||beds['genre-fantasy'];
    freqs.forEach((f,i)=>{
      const o=_audio.createOscillator(); const g=_audio.createGain();
      o.type=i?('triangle'):'sine'; o.frequency.value=f;
      g.gain.value=0.12/(i+1);
      const lfo=_audio.createOscillator(); const lg=_audio.createGain();
      lfo.frequency.value=0.05+i*0.02; lg.gain.value=f*0.01; lfo.connect(lg); lg.connect(o.frequency); lfo.start();
      o.connect(g); g.connect(master); o.start();
      oscs.push(o,lfo);
    });
    _nodes={master,oscs};
  }catch(_){}
}
export function stopAmbient(keepFlag=true){
  if(_nodes){try{_nodes.oscs.forEach(o=>{try{o.stop()}catch(_){}});_nodes.master.disconnect()}catch(_){}_nodes=null}
  if(!keepFlag)_want=false;
}
export function playUi(kind){
  try{
    if(_muted)return;
    _audio=_audio||new (window.AudioContext||window.webkitAudioContext)();
    if(_audio.state==='suspended')_audio.resume();
    const o=_audio.createOscillator(), g=_audio.createGain();
    const now=_audio.currentTime;
    const map={tap:[880,.04],ok:[660,.06],open:[520,.08],back:[420,.05],err:[180,.1]};
    const [f,d]=map[kind]||map.tap;
    o.type='sine'; o.frequency.value=f;
    g.gain.setValueAtTime(0.0001,now);
    g.gain.exponentialRampToValueAtTime(0.045, now+0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now+d);
    o.connect(g); g.connect(_audio.destination); o.start(now); o.stop(now+d+0.02);
  }catch(_){ }
}
export function uiTick(){
  playUi('tap');
  try{if(navigator.vibrate)navigator.vibrate(8)}catch(_){}
}

/* ---- Combat mini-flow ---- */
export function openCombat(opts={}){
  const {foeName='Gegner', foeArt='', playerHP=100, playerMax=100, foeHP=40, foeMax=40, skills=[], onSkill, onFlee, onClose}=opts;
  let overlay=document.getElementById('combatFx');
  if(!overlay){overlay=document.createElement('div'); overlay.id='combatFx'; overlay.className='combat-fx hidden'; document.body.appendChild(overlay)}
  const sk=(skills||[]).slice(0,4);
  const initial=(foeName||'?').trim().charAt(0).toUpperCase();
  overlay.innerHTML=`<div class="combat-card">
    <div class="combat-badge">Kampf</div>
    <div class="combat-foeport" aria-hidden="true"><span>${initial}</span></div>
    <div class="combat-row">
      <div class="combat-side"><div class="combat-lab">Du</div><div class="bar"><i style="width:${Math.max(0,playerHP/playerMax*100)}%;background:#ff5f7e"></i></div></div>
      <div class="combat-vs" aria-hidden="true"><svg class="ico-svg" viewBox="0 0 24 24" width="22" height="22"><use href="#sk-attack"/></svg></div>
      <div class="combat-side"><div class="combat-lab">${foeName}</div><div class="bar"><i id="foeBar" style="width:${Math.max(0,foeHP/foeMax*100)}%;background:#f59e0b"></i></div></div>
    </div>
    <p class="meta combat-art">${foeArt||'Ein Gegner stellt sich dir entgegen.'}</p>
    <div class="combat-log" id="combatLog">Der Kampf beginnt.</div>
    <div class="combat-skills" id="combatSkills"></div>
    <button type="button" class="tiny" id="combatFlee">Fliehen</button>
  </div>`;
  overlay.classList.remove('hidden'); overlay.classList.add('screen-enter');
  const log=overlay.querySelector('#combatLog');
  const skillsEl=overlay.querySelector('#combatSkills');
  let hp=foeHP, php=playerHP;
  const renderSk=()=>{
    skillsEl.innerHTML='';
    (sk.length?sk:[{name:'Angriff'},{name:'Verteidigen'},{name:'Finte'}]).forEach(s=>{
      const b=document.createElement('button'); b.type='button'; b.className='big'; b.textContent=s.name||s;
      b.onclick=()=>{
        const r=onSkill?onSkill(s,{foeHP:hp,playerHP:php}):{foeDmg:8+Math.random()*12|0, selfDmg:Math.random()<.4?(4+Math.random()*10|0):0, text:`Du setzt ${s.name||s} ein.`};
        hp=Math.max(0,hp-(r.foeDmg|0)); php=Math.max(0,php-(r.selfDmg|0));
        const bar=overlay.querySelector('#foeBar'); if(bar)bar.style.width=(hp/foeMax*100)+'%';
        log.textContent=r.text||'Schlag.';
        if(hp<=0){log.textContent+=(r.winText||' Du siegst.'); setTimeout(()=>{overlay.classList.add('hidden'); onClose&&onClose({win:true,playerHP:php})},700)}
        else if(php<=0){log.textContent+=' Du wankst …'; setTimeout(()=>{overlay.classList.add('hidden'); onClose&&onClose({win:false,playerHP:php})},700)}
      };
      skillsEl.appendChild(b);
    });
  };
  renderSk();
  overlay.querySelector('#combatFlee').onclick=()=>{overlay.classList.add('hidden'); onFlee&&onFlee(); onClose&&onClose({flee:true,playerHP:php})};
  return overlay;
}

export function portraitMoodClass(mood){
  const m=String(mood||'neutral').toLowerCase();
  if(/wüt|zorn|feind/.test(m))return 'mood-anger';
  if(/trau|angst|furcht/.test(m))return 'mood-sad';
  if(/verliebt|freut|glück|vertraut/.test(m))return 'mood-warm';
  if(/kühl|misstrau/.test(m))return 'mood-cool';
  return 'mood-neutral';
}


export function arrivalBlurb(S){
  const ort=S?.world?.scene?.ort||'hier';
  const zeit=S?.world?.scene?.zeit||'';
  const wx=weatherFor(S);
  const anw=(S?.world?.scene?.anwesend||[]).slice(0,2);
  const bits=[
    `Du betrittst ${ort}.`,
    wx==='regen'?`Regen nässt das Pflaster.` : wx==='schnee'?`Schnee knirscht unter den Sohlen.` : wx==='nebel'?`Nebel hängt zwischen den Mauern.` : wx==='embers'?`Asche schwebt in der Luft.` : `Die Luft trägt den Geruch von ${ort}.`,
    zeit?`Es ist ${zeit}.`:'',
    anw.length?`${anw.map(n=>{try{return n}catch(_){return n}}).join(' und ')} ${anw.length>1?'sind':'ist'} hier.` : `Noch wirkt der Ort leer – oder wartet.`
  ];
  return bits.filter(Boolean).join(' ');
}

export default {
  cleanSnippet, npcInitiativeLine, seekPlayerLine, richOfflineProse,
  setWeather, weatherFor, applyDayNightTint, crossfadeScene, ensureWeatherCanvas,
  toggleMute, isMuted, startAmbient, stopAmbient, uiTick, playUi,
  openCombat, portraitMoodClass, arrivalBlurb
};
