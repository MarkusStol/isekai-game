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
export function pickUnique(S, pool, bucket='gen'){
  if(!pool||!pool.length) return '';
  S._offlineRecent=S._offlineRecent||{};
  const recent=S._offlineRecent[bucket]||[];
  const avail=pool.filter(x=>x&&!recent.includes(x));
  const src=avail.length?avail:pool;
  const pick=src[Math.floor(Math.random()*src.length)];
  recent.push(pick);
  while(recent.length>28) recent.shift();
  S._offlineRecent[bucket]=recent;
  return pick;
}
export function rememberOfflineOut(S, text){
  S._offlineOut=S._offlineOut||[];
  const h=String(text||'').replace(/\s+/g,' ').trim().slice(0,96);
  if(!h) return true;
  if(S._offlineOut.includes(h)) return false;
  S._offlineOut.push(h);
  while(S._offlineOut.length>120) S._offlineOut.shift();
  return true;
}
const GENRE_SCENE={
  fantasy:[
    'Fackeln knistern; irgendwo übt jemand denselben Hieb zum dritten Mal.',
    'Ein Glockenläuten — zu früh für die Abendmesse, zu spät für den Markt.',
    'Auf dem Pflaster liegen Nadelreste von einem Vorbeizug der Stadtwache.',
    'Der Geruch von Brot und nassem Leder mischt sich in der Gasse.',
    'Ein Magier-Lehrling murmelt Formeln, die halb falsch klingen.',
    'Tauben flattern von einem Brunnenrand, als spürten sie Unruhe.',
    'Ein Wappen an der Mauer ist frisch übermalt — Politik, leise.',
    'Unter den Stiefeln knirscht Sand von der Landstraße.',
    'Pferdehufe entfernen sich; Staub bleibt.',
    'Ein Kind übt denselben Fluch — ohne Magie, nur Mut.',
    'Weihrauch kriecht aus einer Seitengasse.',
    'Die Stadtwache lacht zu laut für echte Ruhe.',
    'Ein Banner hängt schief, als hätte der Wind Partei ergriffen.',
    'Irgendwo wird Stahl geschärft, langsam und absichtlich.',
  ],
  zombie:[
    'Irgendwo knarrt Blech; zu rhythmisch für Wind.',
    'Die Luft riecht nach Desinfektionsmittel und altem Rauch.',
    'Ein handgemaltes Schild: „Klopfen. Dann warten.“',
    'Munition zählt hier lauter als Gold.',
    'Krähen sitzen auf einer umgestürzten Ampel und warten.',
    'Barrikaden aus Einkaufswagen — pragmatisch, hässlich, wirksam.',
    'Ein Generator surrt hinter Sperrholz; Licht ist Luxus.',
    'Fußspuren im Staub: frisch, zu viele für eine Person.',
    'Fern ein Schuss — oder eine Tür, die zuschnappt.',
    'Wasser tropft aus einem geborstenen Rohr, messbar.',
    'Ein Hund bellt einmal, dann nie wieder.',
    'Plastikplanen flattern wie weiße Flaggen.',
    'Die Stille zwischen zwei Windstößen ist zu lang.',
    'Jemand hat Kreidepfeile auf den Asphalt gemalt.',
  ],
  cyberpunk:[
    'Neon spiegelt sich in Pfützen aus Kühlmittel.',
    'Ein Drohnen-Summen zieht über die Gasse und ist gleich wieder weg.',
    'Hologramm-Werbung flackert: „Schuld tilgen. Heute.“',
    'Der Implant-Rand eines Passanten piepst leise Warnungen.',
    'Regen riecht nach Ozon und billigem Synth-Essen.',
    'Ein Vendor-Automat klemmt — jemand hat ihn getreten.',
    'Datenkabel hängen wie Lianen von einem Balkon.',
    'Kameras zwinkern rot; jemand schaut, oder tut so.',
    'Ein Lift rattert im Schacht, Stockwerk unbekannt.',
    'Bass aus einem Club drückt gegen die Rippen.',
    'AR-Tags schweben über Mülltonnen: „Claimed.“',
    'Ein Courier-Bike zischt vorbei, zu schnell für die Gasse.',
    'Strom knackt in einer freiliegenden Leitung.',
    'Jemand flüstert in ein Halsmikro — Deal oder Drohung.',
  ],
  dark:[
    'Kerzenruß zeichnet schwarze Tränen an die Decke.',
    'Ein Gebet bleibt in der Kehle stecken, halb gesprochen.',
    'Metall riecht nach Blut, auch wenn keines zu sehen ist.',
    'Schatten bewegen sich gegen das Licht — Absicht oder Angst.',
    'Die Glocke schlägt falsch, eine Sekunde zu spät.',
    'Etwas Kaltes streicht am Nacken vorbei.',
  ],
  desert:[
    'Sand knirscht zwischen den Zähnen, egal wie oft du spuckst.',
    'Hitze flimmert über dem Platz; Schatten sind knappe Ware.',
    'Ein Brunnenplätschern klingt wie ein Versprechen.',
    'Wind zeichnet Wellen in den Boden — und löscht Spuren.',
    'Fern ein Karawanenglöckchen, dann nichts.',
  ],
  default:[
    'Die Szene hält den Atem einen Schlag lang an.',
    'Geräusche schieben sich übereinander — nah und fern.',
    'Etwas in der Luft will bemerkt werden.',
    'Ein Detail verlangt Aufmerksamkeit.',
    'Die Welt wartet auf deinen nächsten Satz.',
  ]
};
const GESTURE=[
  'mustert dich von der Seite',
  'hebt eine Braue',
  'verschränkt die Arme, dann lockert sie wieder',
  'wischt sich Staub von der Manschette',
  'blickt kurz zur Tür, alte Gewohnheit',
  'knickt den Kopf, als wöge der nächste Satz',
  'lässt die Schultern sinken',
  'tippt unruhig mit dem Finger gegen den eigenen Daumen',
  'lächelt schief, ohne Wärme zu versprechen',
  'tritt einen halben Schritt näher',
  'weicht einen halben Schritt zurück',
  'reibt sich die Schläfe',
];
const OPEN_GOOD=[
  '„Ich höre.“',
  '„Gut, dass du das sagst.“',
  '„Rede weiter — ich bin noch da.“',
  '„Kurz und ehrlich also.“',
  '„Dann lass uns das klären.“',
  '„Nicht laut. Aber klar.“',
  '„Ein Satz nach dem anderen.“',
  '„Du fragst das Richtige — vorsichtig.“',
];
const OPEN_BAD=[
  '„Nicht jetzt.“',
  '„Frag etwas anderes.“',
  '„Das bleibt unter Verschluss.“',
  '„Zu nah. Zu früh.“',
  '„Nein. Noch nicht.“',
];
const ANS_FANTASY=[
  '„Hier draußen zählt, wen du kennst — und wen du nicht verrätst.“',
  '„Die Stadt merkt sich Gesichter länger als Namen.“',
  '„Magie hilft. Vertrauen hilft mehr.“',
  '„Halt dich von den falschen Höfen fern.“',
];
const ANS_ZOMBIE=[
  '„Hier draußen frisst die Stadt die Unvorsichtigen. Bleib an den Wänden.“',
  '„Infizierte. Knappheit. Misstrauen. Mehr brauchst du nicht — fürs Erste.“',
  '„Prüf jede Tür zweimal. Dann nochmal.“',
  '„Teilen ist gut. Blind teilen ist tödlich.“',
];
const ANS_CYBER=[
  '„Frag nicht laut nach dem Datenträger. Die Wände haben Mikros.“',
  '„Neon, Schulden, Konzerne. Willkommen in der Gasse.“',
  '„Creds zuerst. Moral danach — wenn übrig.“',
  '„Implants lügen seltener als Menschen. Seltener, nicht nie.“',
];
const ACT_BEAT=[
  'Die Umgebung antwortet mit Geräusch, Licht und dem Gewicht deiner Entscheidung.',
  'Nichts zwingt dich — aber die Welt merkt sich, was du tust.',
  'Ein Augenblick zieht sich, dann setzt sich etwas in Bewegung.',
  'Du spürst den Boden unter den Füßen und den nächsten Schritt schon vor dir.',
  'Die Luft verändert sich um einen Hauch; genug, um wach zu bleiben.',
];

export function dedupeOfflineReply(S, text){
  let out=String(text||'').replace(/\s+/g,' ').trim();
  if(!out) return out;
  if(rememberOfflineOut(S,out)) return out;
  const g=String(S?.genre||S?.role||'').toLowerCase();
  const gKey=/zombie|apokal/.test(g)?'zombie':/cyber|neon|punk/.test(g)?'cyberpunk':/dark|daemon|dämon|horror/.test(g)?'dark':/desert|wüste/.test(g)?'desert':/fantasy|held|magie/.test(g)?'fantasy':'default';
  const pads=[
    'Ein neuer Blick auf dieselbe Stunde.',
    'Diesmal klingt die Antwort anders.',
    'Die Szene verschiebt sich um einen Atemzug.',
    'Etwas an der Luft hat sich verändert.',
    'Du merkst Details, die vorhin fehlten.',
    'Der Ton der Welt wechselt um eine Nuance.',
    'Ein Geräusch setzt neu an.',
    'Licht und Schatten tauschen die Plätze.',
    'Die nächste Sekunde gehört dir allein.',
    'Wiederholung? Nein — Variation.',
    'Der Boden unter den Füßen fühlt sich anders an.',
    'Ein Gedanke bleibt hängen, bevor Worte folgen.',
  ];
  S._offlineNonce=(S._offlineNonce|0)+1;
  for(let attempt=0; attempt<8; attempt++){
    const beat=pickUnique(S, GENRE_SCENE[gKey]||GENRE_SCENE.default, 'sc');
    const alt=pickUnique(S, pads, 'pad');
    const spice=pickUnique(S, [
      `(#${S._offlineNonce+attempt})`,
      'Noch einmal, frischer:',
      'Anders gesagt:',
      'Aus neuem Winkel:',
      'Mit anderen Worten:',
    ], 'spice');
    // avoid leaking nonce into player-facing text — use spice words only
    const lead=attempt===0?`${beat} ${alt}`:`${alt} ${beat} ${spice.replace(/^\(#\d+\)\s*/,'')}`;
    const candidate=`${lead} ${out}`.replace(/\s+/g,' ').trim();
    if(rememberOfflineOut(S,candidate)) return candidate;
  }
  // last resort: force unique by appending invisible-ish distinct clause from pool index
  const forced=`${pickUnique(S,pads,'pad2')} ${out} — und die Stunde zählt ${S._offlineNonce}.`;
  rememberOfflineOut(S,forced);
  return forced;
}

export function richOfflineProse(S, playerAction, opts={}){
  const R=a=>a[Math.floor(Math.random()*a.length)];
  const U=(pool,b)=>pickUnique(S,pool,b);
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
  const g=String(S.genre||S.role||S.world?.systems?.kind||'').toLowerCase();
  let mem='';
  try{
    const Depth=window.__game?.Depth;
    if(who && Depth?.livedMemoryLine){ mem=Depth.livedMemoryLine(S,who)||''; }
    if(!mem && who && Depth?.livedMemoryFor){ const L=Depth.livedMemoryFor(S,who,2); if(L[0]) mem=`${label} erinnert sich an gelebtes: ${L[0].text}`; }
  }catch(_){}
  if(!mem){
    const memRaw=(npc?.memories||[]).slice(-1)[0];
    mem=cleanSnippet(typeof memRaw==='string'?memRaw:(memRaw?.text||''));
  }
  if(/^(greet|ask|ask_who|talk|act|look|rest|buy|wait|need|move|romance|flee|train|use|take)\s*:/i.test(mem)) mem='';
  if(/Du hast .+ gefragt|gefragt:\s*[„"]|erinnert sich an euer Gespräch/i.test(mem)) mem='';
  const act=String(playerAction||'').trim().slice(0,120);
  const weatherLine={
    regen:U([`Feiner Regen trommelt gegen Stein und Stoff.`,`Niesel hängt in den Haaren und macht jeden Satz leiser.`,`Tropfen zeichnen Bahnen auf dem Visier der Welt.`],'wx'),
    schnee:U([`Schnee flirrt und legt sich lautlos.`,`Kälte beißt in die Fingerkuppen.`,`Weiße Flocken machen aus Lärm Flüstern.`],'wx'),
    nebel:U([`Nebel schiebt sich zwischen euch, kalt und dicht.`,`Umrisse weichen; Nähe wird Vermutung.`,`Feuchte Schwaden schmecken nach Metall.`],'wx'),
    wind:U([`Ein Windstoß trägt Gerüche von ${ort}.`,`Zugluft zerrt an Mänteln und Geduld.`,`Irgendwo knallt eine Luke im Wind.`],'wx'),
    klar:U([`Die Luft ist klar; jedes Geräusch trägt weit.`,`Helles Licht legt Kanten scharf.`,`Kein Vorwand — nur du, der Ort, die Absicht.`],'wx'),
    embers:U([`Aschepartikel tanzen im Licht.`,`Wärme ohne Behaglichkeit liegt über dem Platz.`,`Glutreste knistern unter einem Tritt.`],'wx')
  }[weather]||U([`Die Atmosphäre von ${ort} liegt greifbar in der Luft.`,`${ort} atmet weiter, mit oder ohne dich.`],'wx');

  const timeFeel=/Nacht|Spät/i.test(zeit)
    ? U([`Es ist ${zeit} – Schatten lang, Stimmen leiser.`,`Späte Stunde in ${ort}: Vorsicht wird zur Manier.`],'tm')
    : /Morgen/i.test(zeit)
    ? U([`Es ist ${zeit}; die Welt wirkt noch unfertig.`,`Morgenlicht in ${ort} macht Lügen schwerer.`],'tm')
    : U([`Es ist ${zeit} in ${ort}.`,`Die Stunde hält inne, nur einen Atemzug.`],'tm');

  const gKey=/zombie|apokal|seuche/.test(g)?'zombie':/cyber|neon|netz|punk/.test(g)?'cyberpunk':/dark|daemon|dämon|horror/.test(g)?'dark':/desert|wüste/.test(g)?'desert':/fantasy|held|high|elf|magie/.test(g)?'fantasy':'default';
  const sceneColor=U(GENRE_SCENE[gKey]||GENRE_SCENE.default,'sc');

  const build=()=>{
    const lines=[];
    const isQ=/\?|was |wer |wie |wo |warum |wieso |weshalb |erzähl|frag/.test(act.toLowerCase());
    if(who&&npc){
      const style=String(npc.speechStyle||npc.stimme||'').split(/[.,;]/)[0].slice(0,50);
      let tier=npc.revealTier|0;
      try{
        const Depth=window.__game?.Depth;
        if(Depth?.bumpReveal){
          const deep=/\bdu\b|dein|dich|dir|wer bist|geschichte|vergangen|backstory|ziel|warum|über dich|von dir|erzähl/.test(act.toLowerCase());
          tier=Depth.bumpReveal(npc, deep?1:(Math.random()<0.4?1:0));
        }
      }catch(_){ tier=Math.min(3,(npc.revealTier|0)+1); npc.revealTier=tier; }
      let back='';
      try{ back=window.__game?.Depth?.backstorySlice?.(npc,tier)||''; }catch(_){}
      if(!back) back=String(npc.backstory||'').split(/[.;]/)[0].slice(0,100);
      const gest=U(GESTURE,'gest');
      lines.push(art
        ? `${label} (${art}${style?', '+style:''}) ${gest} — noch in ${ort}.`
        : `${label} ${gest}, dir in ${ort} zugewandt.`);
      lines.push(sceneColor);
      if(mem && tier>=1){
        lines.push(/gelebtes:/i.test(mem)?mem:U([
          `${label} erinnert sich an Gelebtes: ${mem}`,
          `Ein Blick sagt mehr als Worte — ${mem}`,
          `Zwischen euch liegt schon Geschichte: ${mem}`,
        ],'mem'));
      }
      if(isQ){
        const topic=act.replace(/^[„"]?/,'').slice(0,80);
        const ansPool=gKey==='zombie'?ANS_ZOMBIE:gKey==='cyberpunk'?ANS_CYBER:ANS_FANTASY;
        if(opts.good!==false){
          lines.push(U(OPEN_GOOD,'op'));
          lines.push(`${label}: ${U(ansPool,'ans')}`);
        } else {
          lines.push(`${label} ${U(GESTURE,'gest2')}. ${U(OPEN_BAD,'opb')}`);
        }
        if(/ort|hier|lage|los|passiert/.test(topic.toLowerCase())){
          const d=String(S.world?.orte?.[ort]||S.world?.graph?.nodes?.[ort]?.desc||'').slice(0,160);
          if(d) lines.push(`Über ${ort}: ${d}`);
        }
        if(/\bdu\b|dein|dich|\bdir\b|wer bist|geschichte|vergangen|backstory|ziel|warum|über dich|von dir|erzähl/.test(topic.toLowerCase())){
          const sm=(npc.samples&&npc.samples[0])?`„${String(npc.samples[0]).replace(/^[„"]|[“"]$/g,'').slice(0,80)}“`:'';
          const ziel=npc.ziel||npc.desire||'';
          if(back) lines.push(tier>=2
            ? `Reveal ${tier}: ${back}.`
            : `Ein Hauch von Wahrheit (Stufe ${tier||1}): ${back}`);
          else if(ziel) lines.push(`„Mein Ziel? ${String(ziel).slice(0,70)}.“`);
          if(tier>=1 && ziel && back) lines.push(`${label} will ${String(ziel).slice(0,48)}.`);
          if(tier>=2 && npc.wound) lines.push(`Die Stimme knickt: ${String(npc.wound).slice(0,60)}.`);
          if(tier>=2 && npc.need) lines.push(`Braucht eigentlich: ${String(npc.need).slice(0,40)}.`);
          if(tier>=3 && npc.contradiction) lines.push(`Und doch: ${String(npc.contradiction).slice(0,70)}.`);
          if(sm) lines.push(`${label} fällt in den eigenen Ton: ${sm}`);
        }
        if(style && opts.good!==false) lines.push(U([
          `(${style}) — die Antwort klingt genau danach.`,
          `Der Ton bleibt ${style.toLowerCase()}, auch wenn der Inhalt weh tut.`,
        ],'sty'));
        lines.push(weatherLine);
        lines.push(timeFeel);
      } else {
        lines.push(U([
          `Die Haltung verrät ${mood==='wütend'||mood==='feindlich'?'Anspannung':'eine vorsichtige Offenheit'}.`,
          `${label} atmet aus, bevor Worte kommen.`,
          `Ein Blick wechselt – kurz, dann länger.`,
          `${label} wägt ab, was du gerade getan hast: „${act.slice(0,48)}${act.length>48?'…':''}“.`,
        ],'mood'));
        if(opts.good!==false){
          lines.push(U([
            `${U(OPEN_GOOD,'op2')} ${label} antwortet mit Bedacht.`,
            `Ihr sprecht eine Weile; Pausen sind Teil des Gesprächs.`,
            `${label} nickt langsam. „Einverstanden — fürs Erste.“`,
            `Ein kurzes Lachen, dann Ernst. Die Szene bleibt in ${ort}.`,
          ],'good'));
        } else {
          lines.push(U([
            `${U(OPEN_BAD,'opb2')} Die Stimme ist scharf, aber nicht laut.`,
            `${label} weicht einen Schritt zurück.`,
            `Ein kalter Blick – dann doch ein Satz, knapp und ehrlich.`,
          ],'bad'));
        }
        if(back && tier>=1 && Math.random()<0.55) lines.push(`Zwischen den Zeilen: ${back}.`);
        if(mem && tier>=2) lines.push(mem);
        lines.push(timeFeel);
        lines.push(weatherLine);
      }
    } else {
      lines.push(timeFeel);
      lines.push(weatherLine);
      lines.push(sceneColor);
      lines.push(`Du handelst in ${ort}: „${act.slice(0,70)}${act.length>70?'…':''}“.`);
      lines.push(U(ACT_BEAT,'act'));
      const d=String(S.world?.orte?.[ort]||S.world?.graph?.nodes?.[ort]?.desc||'').slice(0,140);
      if(d) lines.push(d);
    }
    let out=lines.filter(Boolean).slice(0,8).join(' ');
    out=out.replace(/\s+/g,' ').trim();
    if(out.split(/[.!?]/).filter(Boolean).length<4){
      out+=` ${U(['Du spürst, wie '+ort+' weiteratmet — unabhängig von dir.','Ein Detail bleibt hängen und will später Bedeutung haben.','Nichts davon ist Zufall; die Welt hat nur keinen Erzähler aus Fleisch.'],'pad')}`;
    }
    return out;
  };

  let out=build();
  if(!rememberOfflineOut(S,out)){
    out=dedupeOfflineReply(S,out);
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
  /* ROUTE_TO_JRPG_BATTLE: prefer full Battle.startBattle when game exposes it */
  try{
    const g=typeof window!=='undefined'?window.__game:null;
    if(g?.Battle?.startBattle && g.S){
      const foe={name:opts.foeName||'Gegner', hp:opts.foeHP||40, maxhp:opts.foeMax||40, atk:8, def:3, spd:6, icon:'👹'};
      g.OW?.hideOverworld?.();
      g.Battle.startBattle(g.S,{enemies:[foe], atbMode:g.S.cfgAtbMode||'active'});
      return document.getElementById('battleRoot');
    }
  }catch(_){}

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
  cleanSnippet, npcInitiativeLine, seekPlayerLine, richOfflineProse, pickUnique, rememberOfflineOut, dedupeOfflineReply,
  setWeather, weatherFor, applyDayNightTint, crossfadeScene, ensureWeatherCanvas,
  toggleMute, isMuted, startAmbient, stopAmbient, uiTick, playUi,
  openCombat, portraitMoodClass, arrivalBlurb
};
