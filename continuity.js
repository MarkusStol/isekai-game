/** v13.1 compact narrative continuity + sane time. Target ~2–3k input tokens for continuity block. */
const MAX_VERBATIM = 10;
const MAX_MSG = 280;
const CHAPTER_EVERY = 4;
export const TOKEN_BUDGET_CHARS = 9000; // ~2.5k tokens rough

export function ensureCont(S){
  if(!S.cont)S.cont={chapter:'',sceneNote:'',threads:[],lastPlayer:'',lastNarration:'',updatedTurn:0};
  if(S.summary==null)S.summary='';
  return S.cont;
}

export function noteExchange(S, player, narration){
  const c=ensureCont(S);
  c.lastPlayer=String(player||'').slice(0,220);
  c.lastNarration=String(narration||'').slice(0,360);
  c.updatedTurn=S.turn|0;
  const t=String(player||'');
  if(/suche|finde|wo ist|frage|warum|rette|folge|reise|gehe nach|töte|kauf/i.test(t)){
    const bit=t.slice(0,70);
    c.threads=(c.threads||[]).filter(x=>x!==bit).concat(bit).slice(-4);
  }
}

export function rollChapterAsync(S){
  const c=ensureCont(S);
  const turn=S.turn|0;
  if(!(turn>0 && turn%CHAPTER_EVERY===0))return;
  const snap=sceneSnapshot(S);
  const prev=String(c.chapter||S.summary||'').slice(0,320);
  c.chapter=`T${turn} @ ${snap.where}: ${(c.lastNarration||'').slice(0,160)}. Fäden: ${(c.threads||[]).join('; ')||'–'}. | ${prev}`.slice(0,700);
  if(!S.summary || S.summary.length<40)S.summary=c.chapter.slice(0,600);
  else if(turn%(CHAPTER_EVERY*2)===0)S.summary=(String(S.summary).slice(0,280)+' → '+c.chapter.slice(0,300)).slice(0,700);
}

export function sceneSnapshot(S){
  const scene=S.world?.scene||{};
  const c=ensureCont(S);
  const who=(scene.anwesend||[]).slice(0,5).join(', ')||'–';
  const what=c.lastNarration || (S.log||[]).filter(m=>m.k==='n').slice(-1)[0]?.t || '';
  return {where:scene.ort||'?', when:scene.zeit||'', who, what:String(what).slice(0,200), threads:(c.threads||[]).slice(-3)};
}

export function currentSceneBlock(S){
  const s=sceneSnapshot(S);
  const c=ensureCont(S);
  return [
    '=== AKTUELLE SZENE (hier weitermachen) ===',
    `Ort: ${s.where}${s.when?' · '+s.when:''}`,
    `Anwesend: ${s.who}`,
    s.what?`Gerade: ${s.what}`:'',
    s.threads.length?`Fäden: ${s.threads.join(' · ')}`:'',
    c.lastPlayer?`Zuletzt getan: „${c.lastPlayer}“`:'',
    'Continue EXACTLY from the last narration line. No intro/reset.'
  ].filter(Boolean).join('\n');
}

export function verbatimBlock(S, n=MAX_VERBATIM){
  const hist=(S.hist||[]).slice(-n);
  if(!hist.length){
    const last=(S.log||[]).filter(m=>m.k==='n').slice(-1)[0];
    return last?('Erzähler: '+String(last.t).slice(0,MAX_MSG)):'(keine)';
  }
  return hist.map(h=>{
    const role=(h.role==='user')?'SPIELER':'Erzähler';
    let t=String(h.content||'').replace(/^SPIELER:\s*/,'');
    if(t.length>MAX_MSG)t=t.slice(0,MAX_MSG)+'…';
    return role+': '+t;
  }).join('\n');
}

export function chapterBlock(S){
  const c=ensureCont(S);
  const sum=String(c.chapter||S.summary||'').trim();
  return sum
    ? ('KAPITEL: '+sum.slice(0,700))
    : 'KAPITEL: (dünn – aus letzten Zügen ableiten, nicht neu starten)';
}

export function compactContinuity(S, playerAction){
  return [
    chapterBlock(S),
    'ZÜGE:\n'+verbatimBlock(S,6),
    currentSceneBlock(S),
    'SPIELER: „'+String(playerAction||'').slice(0,200)+'“'
  ].join('\n');
}

export function buildTurnUserMessage(S, playerAction, extras={}){
  const bits=[];
  if(extras.worldLean)bits.push(String(extras.worldLean).slice(0,1200));
  if(extras.memory)bits.push(String(extras.memory).slice(0,400));
  if(extras.heat)bits.push(String(extras.heat).slice(0,160));
  if(extras.state)bits.push(String(extras.state).slice(0,220));
  if(extras.quest)bits.push(String(extras.quest).slice(0,200));
  bits.push(chapterBlock(S));
  bits.push('LETZTE ZÜGE (wörtlich):\n'+verbatimBlock(S,MAX_VERBATIM));
  bits.push(currentSceneBlock(S)); // LAST context before action
  bits.push((extras.isGrey?'DIE SPIELFIGUR':'DER SPIELER')+' sagt/tut: „'+String(playerAction||'')+'“');
  bits.push('Erster Satz = direkte Reaktion. Continue from last line.');
  let out=bits.filter(Boolean).join('\n\n');
  if(out.length>TOKEN_BUDGET_CHARS){
    // trim middle lore first — keep scene + verbatim + action
    const scene=currentSceneBlock(S);
    const verb='LETZTE ZÜGE:\n'+verbatimBlock(S,8);
    const chap=chapterBlock(S);
    const act=(extras.isGrey?'DIE SPIELFIGUR':'DER SPIELER')+' sagt/tut: „'+String(playerAction||'')+'“\nContinue from last line.';
    out=[chap,verb,String(extras.state||'').slice(0,180),scene,act].join('\n\n').slice(0,TOKEN_BUDGET_CHARS);
  }
  return out;
}

export function ingestModelSummary(S, summary){
  if(!summary)return;
  ensureCont(S);
  const s=String(summary).slice(0,700);
  S.summary=s;
  if(!S.cont.chapter)S.cont.chapter=s;
  else S.cont.chapter=(S.cont.chapter.slice(0,360)+' → '+s.slice(0,320)).slice(0,700);
}

/* ---- Time: minutes-based clock ---- */
export const ACTION_MIN = {
  talk: 8, ask: 5, look: 3, wait: 15, eat: 30, drink: 10, shop: 25,
  craft: 45, work: 60, fight: 20, travel_local: 20, travel_far: 120,
  sleep: -1, // until morning
  rest: 40, romance: 25, default: 8
};

export function classifyAction(text){
  const t=String(text||'').toLowerCase();
  if(/schlaf|übernacht|ins bett|ruhe mich aus bis|schlafe/.test(t))return 'sleep';
  if(/ess|mahlzeit|frühstück|mittag|abendessen|hunger still/.test(t))return 'eat';
  if(/trink|becher|wein|bier|tee/.test(t))return 'drink';
  if(/reise|gehe nach|wander|ritt|fahre|lauf nach|auf dem weg/.test(t))return /stadt|dorf|burg|hafen|wald|berg|weit|tage?s?reise/.test(t)?'travel_far':'travel_local';
  if(/kampf|angreif|töt|schlag|verteidig|schieß/.test(t))return 'fight';
  if(/schmied|craft|bau|nähe|brauen|alchem|herstell/.test(t))return 'craft';
  if(/arbeit|schicht|job|verdienst/.test(t))return 'work';
  if(/kauf|verkauf|handel|markt|feilsch/.test(t))return 'shop';
  if(/küss|date|umarm|flirt|liebe|bleib bei/.test(t))return 'romance';
  if(/warte|paus|ruhe kurz/.test(t))return 'wait';
  if(/sieh|schau|umsehen|untersuch|betrachte/.test(t))return 'look';
  if(/\?|frag|sprech|sprich|red|unterhalt|sag|erzähl|hör|plauder|gespräch/.test(t))return 'talk';
  return 'default';
}

export function estimateMinutes(text, modelMinutes){
  const kind=classifyAction(text);
  let base=ACTION_MIN[kind]??8;
  if(kind==='sleep')base=null; // special
  let m=modelMinutes!=null && isFinite(+modelMinutes)?(+modelMinutes):base;
  // clamps by type
  const clamps={
    talk:[2,20], ask:[1,15], look:[1,10], wait:[5,60], eat:[15,60], drink:[3,20],
    shop:[10,90], craft:[20,180], work:[30,240], fight:[5,90],
    travel_local:[10,90], travel_far:[60,480], romance:[10,90], default:[2,30], sleep:[240,720]
  };
  if(kind==='sleep'){
    m=m==null||m<0?480:m;
  }
  if(m==null)m=8;
  const [lo,hi]=clamps[kind]||clamps.default;
  m=Math.max(lo,Math.min(hi,Math.round(m)));
  // never jump >12h unless sleep/travel_far/work
  if(!/sleep|travel_far|work/.test(kind))m=Math.min(m,180);
  return {minutes:m, kind};
}

export function advanceMinutes(S, minutes, opts={}){
  ensureCont(S);
  if(!S.cal)S.cal={day:1,hour:12,minute:0,weekday:0,season:'Frühling',year:1};
  if(S.cal.minute==null)S.cal.minute=0;
  let min=Math.max(0,Math.round(minutes||0));
  // hard cap unless explicit sleep/long travel flagged
  if(!opts.allowLong)min=Math.min(min, 12*60);
  S.cal.minute=(S.cal.minute|0)+min;
  while(S.cal.minute>=60){S.cal.minute-=60;S.cal.hour=(S.cal.hour|0)+1}
  let dayJump=0;
  while(S.cal.hour>=24){
    S.cal.hour-=24; S.cal.day=(S.cal.day|0)+1; S.cal.weekday=((S.cal.weekday|0)+1)%7; dayJump++;
  }
  // sync legacy time
  if(!S.time)S.time={day:S.cal.day,hour:S.cal.hour,phase:phaseFromClock(S)};
  S.time.day=S.cal.day; S.time.hour=S.cal.hour; S.time.minute=S.cal.minute; S.time.phase=phaseFromClock(S);
  if(S.world?.scene)S.world.scene.zeit=phaseFromClock(S)+', '+pad2(S.cal.hour)+':'+pad2(S.cal.minute);
  return {minutes:min, dayJump, phase:phaseFromClock(S), clock:pad2(S.cal.hour)+':'+pad2(S.cal.minute)};
}

export function sleepUntilMorning(S){
  ensureCont(S);
  if(!S.cal)S.cal={day:1,hour:22,minute:0,weekday:0,season:'Frühling',year:1};
  const h=S.cal.hour|0, m=S.cal.minute|0;
  // wake at 7:00
  let mins=(7*60)-(h*60+m);
  if(mins<=0)mins+=24*60; // next day
  mins=Math.max(240,Math.min(720,mins)); // 4–12h
  return advanceMinutes(S, mins, {allowLong:true});
}

function pad2(n){return String(n|0).padStart(2,'0')}
export function phaseFromClock(S){
  const h=S?.cal?.hour??S?.time?.hour??12;
  if(h<5)return 'Nacht'; if(h<11)return 'Morgen'; if(h<14)return 'Mittag'; if(h<18)return 'Nachmittag'; if(h<22)return 'Abend'; return 'Nacht';
}

export function dumpPromptForTest(S, playerAction, built){
  return {
    turn:S.turn|0,
    summary:S.summary||'',
    chapter:S.cont?.chapter||'',
    scene:sceneSnapshot(S),
    promptChars:built.length,
    approxTokens:Math.round(built.length/3.5),
    hasPlayer:built.includes(String(playerAction||'').slice(0,40)),
    hasScene:built.includes(String(S.world?.scene?.ort||'')||'___'),
    hasSummary:!!(S.summary||S.cont?.chapter),
    promptTail:built.slice(-500)
  };
}

export default {
  ensureCont,noteExchange,rollChapterAsync,sceneSnapshot,currentSceneBlock,verbatimBlock,chapterBlock,
  compactContinuity,buildTurnUserMessage,ingestModelSummary,classifyAction,estimateMinutes,advanceMinutes,
  sleepUntilMorning,phaseFromClock,dumpPromptForTest,ACTION_MIN,TOKEN_BUDGET_CHARS
};
