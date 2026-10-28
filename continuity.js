/** v17.2 hard scene lock + Story-Stand + obey-player. Compact continuity for free models. */
const MAX_VERBATIM = 10;
const MAX_MSG = 280;
const CHAPTER_EVERY = 4;
export const TOKEN_BUDGET_CHARS = 7500; // keep prompts short for free models

export function ensureCont(S){
  if(!S.cont)S.cont={chapter:'',sceneNote:'',threads:[],lastPlayer:'',lastNarration:'',updatedTurn:0,storyStand:'',locked:null};
  if(S.summary==null)S.summary='';
  if(!S.cont.locked)S.cont.locked=null;
  if(S.cont.storyStand==null)S.cont.storyStand='';
  return S.cont;
}

/** Lock current scene while conversation is active. Autonomy may not break this. */
export function lockScene(S, reason='talk'){
  const c=ensureCont(S);
  const scene=S.world?.scene||{};
  c.locked={
    ort:scene.ort||'',
    anwesend:[...(scene.anwesend||[])],
    reason,
    turn:S.turn|0,
    at:Date.now()
  };
  return c.locked;
}

export function unlockScene(S){
  const c=ensureCont(S);
  c.locked=null;
}

export function isSceneLocked(S){
  const L=ensureCont(S).locked;
  if(!L)return false;
  // auto-expire after long idle (15 min real) or 12 turns without reinforce
  if(Date.now()-(L.at||0)>15*60*1000) return false;
  if(((S.turn|0)-(L.turn|0))>12) return false;
  return true;
}

export function reinforceLock(S){
  const c=ensureCont(S);
  if(c.locked){ c.locked.turn=S.turn|0; c.locked.at=Date.now();
    // refresh presence from live scene (player may have been introduced someone)
    if(S.world?.scene){
      c.locked.ort=S.world.scene.ort||c.locked.ort;
      c.locked.anwesend=[...(S.world.scene.anwesend||c.locked.anwesend||[])];
    }
  }
}

/** Player explicitly traveling / leaving → unlock */
export function playerWantsExit(text){
  const t=String(text||'').toLowerCase();
  return /^(ich )?(gehe|geh|laufe|lauf|reise|wander|ritt|fahre|verlass|trete aus|aufbruch|zurück nach|fort von)|reise nach|gehe nach|geh(e)? zur? |auf dem weg nach|verlass(e)? (die|den|das)/.test(t)
    || /\b(aufbrechen|weggehen|fortgehen|rausgehen)\b/.test(t);
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
  // reinforce lock on conversational turns; unlock on travel
  if(playerWantsExit(t)) unlockScene(S);
  else {
    if(!c.locked) lockScene(S,'talk');
    else reinforceLock(S);
  }
  updateStoryStand(S);
}

/** Compact canonical story stand — always injected */
export function updateStoryStand(S){
  const c=ensureCont(S);
  const scene=S.world?.scene||{};
  const goal=(c.threads||[])[0]||(S.quests?.main?.ziel||'').slice(0,80)||'–';
  const who=(scene.anwesend||[]).slice(0,5).join(', ')||'–';
  const last=(c.lastNarration||'').slice(0,100);
  c.storyStand=[
    `Ziel/Faden: ${goal}`,
    `Ort: ${scene.ort||'?'} · Anwesend: ${who}`,
    last?`Stand: ${last}`:'',
    (c.threads||[]).length>1?`Offen: ${c.threads.slice(1).join(' · ')}`:''
  ].filter(Boolean).join(' | ').slice(0,320);
  return c.storyStand;
}

export function storyStandBlock(S){
  const c=ensureCont(S);
  const stand=c.storyStand||updateStoryStand(S);
  return 'STORY-STAND (kanonisch, nicht zurückspulen):\n'+stand;
}

export function rollChapterAsync(S){
  const c=ensureCont(S);
  const turn=S.turn|0;
  if(!(turn>0 && turn%CHAPTER_EVERY===0))return;
  const snap=sceneSnapshot(S);
  const prev=String(c.chapter||S.summary||'').slice(0,280);
  // never re-inject opening beats
  const cleaned=prev.replace(/erwachst|Göttin|Beschwörungshalle im Kerzenschein, du öffnest/gi,'').trim();
  c.chapter=`T${turn} @ ${snap.where}: ${(c.lastNarration||'').slice(0,140)}. Fäden: ${(c.threads||[]).join('; ')||'–'}. | ${cleaned}`.slice(0,700);
  if(!S.summary || S.summary.length<40)S.summary=c.chapter.slice(0,600);
  else if(turn%(CHAPTER_EVERY*2)===0)S.summary=(String(S.summary).slice(0,280)+' → '+c.chapter.slice(0,300)).slice(0,700);
}

export function sceneSnapshot(S){
  const scene=S.world?.scene||{};
  const c=ensureCont(S);
  const who=(scene.anwesend||[]).slice(0,5).join(', ')||'–';
  const what=c.lastNarration || (S.log||[]).filter(m=>m.k==='n').slice(-1)[0]?.t || '';
  return {where:scene.ort||'?', when:scene.zeit||'', who, what:String(what).slice(0,200), threads:(c.threads||[]).slice(-3), locked:!!c.locked};
}

export function currentSceneBlock(S){
  const s=sceneSnapshot(S);
  const c=ensureCont(S);
  const lock=c.locked;
  return [
    '=== AKTUELLE SZENE (HART GESPERRT — nicht ändern) ===',
    `Ort: ${s.where}${s.when?' · '+s.when:''}`,
    `Anwesend: ${s.who}`,
    lock?`LOCK aktiv seit T${lock.turn}: Ort und Anwesende bleiben, bis der Spieler geht.`:'',
    s.what?`Gerade: ${s.what}`:'',
    s.threads.length?`Fäden: ${s.threads.join(' · ')}`:'',
    c.lastPlayer?`Zuletzt getan: „${c.lastPlayer}“`:'',
    'Continue EXACTLY from the last narration line. No intro/reset. Kein Ortswechsel. Keine neuen Hauptfiguren erfinden.'
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
    storyStandBlock(S),
    chapterBlock(S),
    'ZÜGE:\n'+verbatimBlock(S,6),
    currentSceneBlock(S),
    'SPIELER: „'+String(playerAction||'').slice(0,200)+'“'
  ].join('\n');
}

const OBEY = 'Reagiere direkt und ausschließlich auf diese Handlung; erfinde keinen Ortswechsel und keine fremden Handlungen des Spielers. Max 120–160 Wörter.';

export function buildTurnUserMessage(S, playerAction, extras={}){
  const bits=[];
  if(extras.worldLean)bits.push(String(extras.worldLean).slice(0,900));
  if(extras.memory)bits.push(String(extras.memory).slice(0,300));
  if(extras.heat)bits.push(String(extras.heat).slice(0,120));
  if(extras.state)bits.push(String(extras.state).slice(0,180));
  if(extras.quest)bits.push(String(extras.quest).slice(0,160));
  bits.push(storyStandBlock(S));
  bits.push(chapterBlock(S));
  bits.push('LETZTE ZÜGE (wörtlich):\n'+verbatimBlock(S,MAX_VERBATIM));
  bits.push(currentSceneBlock(S));
  // player action LAST with hard obey instruction
  bits.push((extras.isGrey?'DIE SPIELFIGUR':'DER SPIELER')+' sagt/tut GENAU: „'+String(playerAction||'')+'“');
  bits.push(OBEY);
  let out=bits.filter(Boolean).join('\n\n');
  if(out.length>TOKEN_BUDGET_CHARS){
    const scene=currentSceneBlock(S);
    const verb='LETZTE ZÜGE:\n'+verbatimBlock(S,6);
    const stand=storyStandBlock(S);
    const act=(extras.isGrey?'DIE SPIELFIGUR':'DER SPIELER')+' sagt/tut GENAU: „'+String(playerAction||'')+'“\n'+OBEY;
    out=[stand,verb,String(extras.state||'').slice(0,140),scene,act].join('\n\n').slice(0,TOKEN_BUDGET_CHARS);
  }
  return out;
}

/** Does narration address the player input? Keyword / stem overlap. */
export function addressesPlayer(playerAction, narration){
  const stop=new Set(['ich','du','der','die','das','ein','eine','und','oder','mit','nach','auf','für','den','dem','des','ist','bin','sind','zu','im','in','am','an','von','mich','mir','dir','dich','wir','ihr','sie','es','mein','dein','nicht','auch','noch','nur','wie','was','wo','wer','ob','als','bei','aus','zum','zur','eine','einer','eines','dem','den']);
  const stems=s=>String(s||'').toLowerCase().replace(/[„“"']/g,' ').split(/[^a-zäöüß0-9]+/i).filter(w=>w.length>=4&&!stop.has(w));
  const A=new Set(stems(playerAction));
  if(!A.size)return true;
  const B=stems(narration);
  let hit=0; for(const w of B) if(A.has(w)) hit++;
  // also soft intent verbs
  const intent=/frag|sag|geh|kauf|kämpf|küss|wart|hör|bleib|hilf|such|trink|ess|schlaf|reise|öffn|schließ|nimm|gib/i;
  const aHas=intent.test(playerAction||'');
  const nHas=intent.test(narration||'') || hit>=1;
  return hit>=1 || (A.size<=2 && nHas) || (!aHas && hit>=0 && B.length>8);
}

export function ingestModelSummary(S, summary){
  if(!summary)return;
  ensureCont(S);
  const s=String(summary).slice(0,700).replace(/erwachst in der beschwörungshalle/gi,'');
  S.summary=s;
  if(!S.cont.chapter)S.cont.chapter=s;
  else S.cont.chapter=(S.cont.chapter.slice(0,360)+' → '+s.slice(0,320)).slice(0,700);
  updateStoryStand(S);
}

/** Strip / reject illegal world mutations under scene lock */
export function filterWorldUpdate(S, u, playerAction=''){
  if(!u||typeof u!=='object')return u;
  const out={...u};
  const locked=isSceneLocked(S);
  const exit=playerWantsExit(playerAction);
  const cur=S.world?.scene||{};
  const curOrt=cur.ort||'';
  const curAnw=[...(cur.anwesend||[])];

  if(out.scene){
    const sc={...out.scene};
    // reject location change unless player exited
    if(sc.ort && curOrt && sc.ort!==curOrt){
      if(locked && !exit){ sc.ort=curOrt; }
      else if(!exit && !/reise|geh/.test(String(playerAction||'').toLowerCase())){ sc.ort=curOrt; }
    }
    // never wipe presence; merge under lock
    if(Array.isArray(sc.anwesend)){
      if(locked && !exit){
        // keep locked presence; allow only additions that look like walk-ins with low priority — drop unknowns replacing cast
        const keep=new Set(curAnw.map(String));
        const incoming=sc.anwesend.map(String).filter(Boolean);
        // if model dropped everyone, restore
        if(!incoming.length) sc.anwesend=curAnw.slice();
        else {
          // union: locked people stay; new names only appended if plausible (<=2 extras)
          const extras=incoming.filter(n=>!keep.has(n)).slice(0,2);
          sc.anwesend=[...curAnw, ...extras.filter(n=>!curAnw.includes(n))].slice(0,8);
        }
      } else if(!sc.anwesend.length && curAnw.length){
        sc.anwesend=curAnw.slice(); // never clear
      }
    } else if(locked){
      sc.anwesend=curAnw.slice();
    }
    if(!sc.ort) sc.ort=curOrt;
    out.scene=sc;
  }

  // speaker must be present or narrator — never rename free-form strangers as speaker
  if(out.speaker){
    const sp=String(out.speaker).trim();
    const present=new Set((out.scene?.anwesend||curAnw).map(x=>String(x).toLowerCase()));
    present.add('erzähler'); present.add('nebel'); present.add('gottin'); present.add('göttin');
    const ok=[...present].some(p=>p===sp.toLowerCase() || sp.toLowerCase().includes(p) || p.includes(sp.toLowerCase().split(' ')[0]));
    if(!ok || /^(spieler|du|ich|player|pc)$/i.test(sp)) delete out.speaker;
  }

  // reject npc renames via npcUpdates (name change)
  if(Array.isArray(out.npcUpdates)){
    out.npcUpdates=out.npcUpdates.filter(n=>{
      if(!n?.name)return false;
      // don't invent brand-new NPCs mid-lock unless walk-in
      if(locked && S.world?.npcs && !S.world.npcs[n.name] && !Object.keys(S.world.npcs).some(k=>k.toLowerCase()===String(n.name).toLowerCase())){
        return false;
      }
      return true;
    });
  }
  return out;
}

/* ---- Time: minutes-based clock ---- */
export const ACTION_MIN = {
  talk: 8, ask: 5, look: 3, wait: 15, eat: 30, drink: 10, shop: 25,
  craft: 45, work: 60, fight: 20, travel_local: 20, travel_far: 120,
  sleep: -1, rest: 40, romance: 25, default: 8
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
  if(kind==='sleep')base=null;
  let m=modelMinutes!=null && isFinite(+modelMinutes)?(+modelMinutes):base;
  const clamps={
    talk:[2,20], ask:[1,15], look:[1,10], wait:[5,60], eat:[15,60], drink:[3,20],
    shop:[10,90], craft:[20,180], work:[30,240], fight:[5,90],
    travel_local:[10,90], travel_far:[60,480], romance:[10,90], default:[2,30], sleep:[240,720]
  };
  if(kind==='sleep'){ m=m==null||m<0?480:m; }
  if(m==null)m=8;
  const [lo,hi]=clamps[kind]||clamps.default;
  m=Math.max(lo,Math.min(hi,Math.round(m)));
  if(!/sleep|travel_far|work/.test(kind))m=Math.min(m,180);
  return {minutes:m, kind};
}

export function advanceMinutes(S, minutes, opts={}){
  ensureCont(S);
  if(!S.cal)S.cal={day:1,hour:12,minute:0,weekday:0,season:'Frühling',year:1};
  if(S.cal.minute==null)S.cal.minute=0;
  let min=Math.max(0,Math.round(minutes||0));
  if(!opts.allowLong)min=Math.min(min, 12*60);
  S.cal.minute=(S.cal.minute|0)+min;
  while(S.cal.minute>=60){S.cal.minute-=60;S.cal.hour=(S.cal.hour|0)+1}
  let dayJump=0;
  while(S.cal.hour>=24){
    S.cal.hour-=24; S.cal.day=(S.cal.day|0)+1; S.cal.weekday=((S.cal.weekday|0)+1)%7; dayJump++;
  }
  if(!S.time)S.time={day:S.cal.day,hour:S.cal.hour,phase:phaseFromClock(S)};
  S.time.day=S.cal.day; S.time.hour=S.cal.hour; S.time.minute=S.cal.minute; S.time.phase=phaseFromClock(S);
  if(S.world?.scene)S.world.scene.zeit=phaseFromClock(S)+', '+pad2(S.cal.hour)+':'+pad2(S.cal.minute);
  return {minutes:min, dayJump, phase:phaseFromClock(S), clock:pad2(S.cal.hour)+':'+pad2(S.cal.minute)};
}

export function sleepUntilMorning(S){
  ensureCont(S);
  if(!S.cal)S.cal={day:1,hour:22,minute:0,weekday:0,season:'Frühling',year:1};
  const h=S.cal.hour|0, m=S.cal.minute|0;
  let mins=(7*60)-(h*60+m);
  if(mins<=0)mins+=24*60;
  mins=Math.max(240,Math.min(720,mins));
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
    storyStand:S.cont?.storyStand||'',
    scene:sceneSnapshot(S),
    promptChars:built.length,
    approxTokens:Math.round(built.length/3.5),
    hasPlayer:built.includes(String(playerAction||'').slice(0,40)),
    hasScene:built.includes(String(S.world?.scene?.ort||'')||'___'),
    hasSummary:!!(S.summary||S.cont?.chapter),
    hasObey:built.includes('ausschließlich auf diese Handlung'),
    promptTail:built.slice(-500)
  };
}

export default {
  ensureCont,noteExchange,rollChapterAsync,sceneSnapshot,currentSceneBlock,verbatimBlock,chapterBlock,
  compactContinuity,buildTurnUserMessage,ingestModelSummary,classifyAction,estimateMinutes,advanceMinutes,
  sleepUntilMorning,phaseFromClock,dumpPromptForTest,ACTION_MIN,TOKEN_BUDGET_CHARS,
  lockScene,unlockScene,isSceneLocked,reinforceLock,playerWantsExit,updateStoryStand,storyStandBlock,
  addressesPlayer,filterWorldUpdate,OBEY
};
