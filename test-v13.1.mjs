/** v13.1 tests: continuity budget + time logic + catch-up + latency of prompt build */
import * as Cont from './continuity.js';
import * as Persist from './persist.js';
import * as Sim from './sim.js';
import assert from 'assert';
import {performance} from 'perf_hooks';

function blankState(turn=1){
  return {
    turn, ver:131, summary:'', cont:null,
    cal:{year:1,day:1,hour:14,minute:0,season:'Frühling'},
    time:{day:1,hour:14,minute:0,phase:'Mittag'},
    world:{scene:{ort:'Marktplatz von Eldoria',zeit:'Mittag, 14:00',anwesend:['Lyra','Bäckerin']},npcs:{
      Lyra:{alive:true,ort:'Marktplatz von Eldoria',e:'🧝'},
      Bäckerin:{alive:true,ort:'Marktplatz von Eldoria',e:'👩'}
    }},
    hist:[], log:[], ledger:[], st:{hp:80,maxhp:100,mp:40,lvl:3,gold:20,str:5,cha:5,ruf:10},
    flags:{}, setup:{done:true}, cfgCatchupOptIn:false, lastRealAt:Date.now()-3*3600*1000
  };
}

function fillHist(S, n){
  for(let i=0;i<n;i++){
    const p=`Ich frage Lyra nach dem Artefakt (${i}).`;
    const a=`Lyra blickt dich an. „Das Artefakt liegt im Nordturm.“ Sie deutet auf die Gasse. (${i})`;
    S.hist.push({role:'user',content:'SPIELER: '+p},{role:'assistant',content:a});
    Cont.noteExchange(S,p,a);
    if((i+1)%4===0){S.turn=i+1;Cont.rollChapterAsync(S)}
  }
  S.hist=S.hist.slice(-24);
  S.turn=n;
}

let passed=0, failed=0;
function check(name, fn){
  try{fn(); passed++; console.log('✓', name)}
  catch(e){failed++; console.error('✗', name, '\n ', e.message||e)}
}

console.log('=== v13.1 continuity + time tests ===\n');

// --- Continuity prompt @ turn 60 ---
check('prompt at turn 60 stays within ~3k token budget', ()=>{
  const S=blankState(60); fillHist(S,60);
  S.summary='Kapitel: Suche nach dem Nordturm-Artefakt. Lyra hilft.';
  Cont.ensureCont(S).chapter=S.summary;
  const built=Cont.buildTurnUserMessage(S,'Was weißt du noch?',{
    worldLean:'ORT: Marktplatz. NPCs: Lyra. '+('Lore '.repeat(200)),
    memory:'Lyra mag dich.', heat:'', state:'Lv3 HP80', quest:'Finde Artefakt', isGrey:false
  });
  const dump=Cont.dumpPromptForTest(S,'Was weißt du noch?',built);
  assert.ok(dump.approxTokens<=3200, 'tokens '+dump.approxTokens+' > 3200');
  assert.ok(dump.promptChars<=Cont.TOKEN_BUDGET_CHARS+500, 'chars '+dump.promptChars);
  assert.ok(dump.hasPlayer, 'missing player action');
  assert.ok(dump.hasScene, 'missing scene ort');
  assert.ok(dump.hasSummary, 'missing summary/chapter');
  // situation LAST: scene block should appear after chapter and near the end
  const sceneIdx=built.lastIndexOf('AKTUELLE SZENE');
  const playerIdx=built.lastIndexOf('sagt/tut:');
  assert.ok(sceneIdx>0 && playerIdx>sceneIdx, 'scene must be before action, near end');
  console.log('   tokens≈', dump.approxTokens, 'chars', dump.promptChars);
});

check('verbatim + scene present; no full dump of 60 turns', ()=>{
  const S=blankState(60); fillHist(S,60);
  const built=Cont.buildTurnUserMessage(S,'Weiter',{});
  // only last ~10 exchanges in LETZTE ZÜGE — not all 60
  const verbSection=built.split('LETZTE ZÜGE')[1]||built;
  const vMentions=(verbSection.match(/Artefakt \(/g)||[]).length;
  assert.ok(vMentions<=12, 'too many verbatim turns: '+vMentions);
  assert.ok(built.includes('Marktplatz'), 'scene ort missing');
});

check('compactContinuity is small', ()=>{
  const S=blankState(20); fillHist(S,20);
  const c=Cont.compactContinuity(S,'Hallo');
  assert.ok(c.length<4000, 'compact too big '+c.length);
});

// --- Time ---
check('talk advances minutes not hours', ()=>{
  const S=blankState(); Cont.ensureCont(S);
  const before={d:S.cal.day,h:S.cal.hour,m:S.cal.minute};
  const est=Cont.estimateMinutes('Ich spreche mit Lyra über das Wetter.', 10);
  assert.equal(est.kind,'talk');
  assert.ok(est.minutes>=2 && est.minutes<=20, 'talk minutes '+est.minutes);
  Cont.advanceMinutes(S, est.minutes);
  assert.equal(S.cal.day, before.d, 'day must not jump on talk');
  const totalMin=(S.cal.hour-before.h)*60+(S.cal.minute-before.m);
  assert.ok(totalMin>=2 && totalMin<=20, 'advanced '+totalMin);
});

check('eating ~30 min clamped', ()=>{
  const est=Cont.estimateMinutes('Ich esse eine Mahlzeit.', 30);
  assert.equal(est.kind,'eat');
  assert.ok(est.minutes>=15 && est.minutes<=60);
  const wild=Cont.estimateMinutes('Ich esse.', 9999);
  assert.ok(wild.minutes<=60, 'eat clamp failed '+wild.minutes);
});

check('travel by distance class', ()=>{
  const local=Cont.estimateMinutes('Ich gehe nach dem Tempel.', null);
  assert.equal(local.kind,'travel_local');
  assert.ok(local.minutes<=90);
  const far=Cont.estimateMinutes('Ich reise zur Hafenstadt — eine Tagesreise.', 200);
  assert.equal(far.kind,'travel_far');
  assert.ok(far.minutes>=60 && far.minutes<=480);
});

check('sleep until morning, no wild multi-day', ()=>{
  const S=blankState(); S.cal.hour=22; S.cal.minute=30;
  Cont.ensureCont(S);
  const r=Cont.sleepUntilMorning(S);
  assert.equal(S.cal.hour, 7);
  assert.ok(r.dayJump<=1, 'sleep dayJump '+r.dayJump);
  assert.ok(r.minutes>=240 && r.minutes<=720);
});

check('model durationMin clamped per action type', ()=>{
  const talk=Cont.estimateMinutes('Hallo?', 500); // claim 500 min talk
  assert.ok(talk.minutes<=20, 'talk must clamp, got '+talk.minutes);
  const craft=Cont.estimateMinutes('Ich schmiede ein Schwert.', 5);
  assert.ok(craft.minutes>=20, 'craft floor '+craft.minutes);
});

check('never jump days without reason (default action)', ()=>{
  const S=blankState(); Cont.ensureCont(S);
  Cont.advanceMinutes(S, Cont.estimateMinutes('Ich nicke.', null).minutes);
  assert.equal(S.cal.day, 1);
});

check('scene zeit matches clock after advance', ()=>{
  const S=blankState(); Cont.ensureCont(S);
  Cont.advanceMinutes(S, 45); // 14:00 → 14:45 Nachmittag
  assert.ok(S.world.scene.zeit.includes('14:45'), S.world.scene.zeit);
  assert.ok(/Nachmittag|Mittag/.test(S.world.scene.zeit+Cont.phaseFromClock(S)));
});

check('catch-up is opt-in by default', ()=>{
  const S=blankState(); S.cfgCatchupOptIn=false; S.lastRealAt=Date.now()-48*3600*1000;
  const r=Persist.catchUp(S,{Sim});
  assert.ok(r.skipped==='opt-in' || r.hours===0, JSON.stringify(r));
});

check('catch-up when opted in is capped and preserves scene', ()=>{
  const S=blankState(); S.cfgCatchupOptIn=true; S.cfgCatchupCap=6;
  S.lastRealAt=Date.now()-48*3600*1000;
  const ort=S.world.scene.ort;
  const an=S.world.scene.anwesend.slice();
  const r=Persist.catchUp(S,{Sim});
  assert.ok(r.hours<=6, 'cap '+r.hours);
  assert.equal(S.world.scene.ort, ort);
  assert.deepEqual(S.world.scene.anwesend, an);
  assert.ok(r.scenePreserved);
});

// --- Latency of prompt build (proxy for TTFT readiness) ---
check('prompt build is fast (<15ms) even at turn 60', ()=>{
  const S=blankState(60); fillHist(S,60);
  Cont.ensureCont(S).chapter='Langer Kapiteltext. '.repeat(40);
  // OLD: dump all 60 fat exchanges + fat world
  const allHist=[]; for(let i=0;i<60;i++) allHist.push({content:'SPIELER: frage '+i+' '+('x'.repeat(200))},{content:'Erzähler antwortet '+i+' '+('y'.repeat(400))});
  const fatWorld={npcs:Object.fromEntries([...Array(40)].map((_,i)=>['NPC'+i,{bio:('bio'+i).repeat(50),mem:Array(20).fill('m')}]))};
  const t0=performance.now();
  const bloated='KAPITEL\n'+allHist.map(h=>h.content).join('\n')+'\n'+JSON.stringify(fatWorld);
  const bloatedMs=performance.now()-t0;
  const t1=performance.now();
  const built=Cont.buildTurnUserMessage(S,'Weiter',{worldLean:'lean world',state:'Lv3'});
  const compactMs=performance.now()-t1;
  const tok=Math.round(built.length/3.5);
  console.log('   latency prompt-build BEFORE(naive dump)≈'+bloatedMs.toFixed(3)+'ms size='+bloated.length);
  console.log('   latency prompt-build AFTER(compact)≈'+compactMs.toFixed(3)+'ms size='+built.length+' tok≈'+tok);
  assert.ok(built.length < bloated.length/5, 'compact should be much smaller');
  assert.ok(compactMs < 15, 'build too slow '+compactMs);
  assert.ok(tok <= 3200, 'token budget '+tok);
});

check('ACTION_MIN defaults sane', ()=>{
  assert.equal(Cont.ACTION_MIN.talk, 8);
  assert.equal(Cont.ACTION_MIN.eat, 30);
  assert.ok(Cont.ACTION_MIN.travel_far >= 60);
});

console.log(`\n${passed} passed, ${failed} failed`);
if(failed) process.exit(1);
