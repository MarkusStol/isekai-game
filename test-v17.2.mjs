#!/usr/bin/env node
import * as Cont from './continuity.js';
import fs from 'fs';

let pass=0,fail=0;
const ok=(n,c,d='')=>{if(c){pass++;console.log('OK',n)}else{fail++;console.error('FAIL',n,d||'')}};

function blankS(){
  return {
    ver:20.1, turn:5, pc:{name:'Aki'},
    world:{scene:{ort:'Taverne „Zum Silberkelch“',zeit:'Abend',anwesend:['Lyra','Wirt Brok']},
      npcs:{'Lyra':{art:'kühl',alive:true,ort:'Taverne „Zum Silberkelch“'},'Wirt Brok':{art:'rau',alive:true},'Garrick':{art:'ritter',alive:true,ort:'Nordwall'}}},
    hist:[
      {role:'user',content:'SPIELER: Ich setze mich zu Lyra.'},
      {role:'assistant',content:'Lyra mustert dich über den Becher. Die Taverne rauscht leise.'}
    ],
    log:[{k:'n',t:'Lyra mustert dich über den Becher.'}],
    quests:{main:{ziel:'Ritual verstehen',actTitel:'Anfang',objectives:[],done:[]}},
    flags:{}, romance:{}, summary:''
  };
}

// --- Scene lock ---
{
  const S=blankS();
  Cont.lockScene(S,'talk');
  ok('lock active', Cont.isSceneLocked(S));
  ok('lock stores ort', S.cont.locked.ort.includes('Taverne'));
  ok('lock stores cast', S.cont.locked.anwesend.includes('Lyra'));
}

// --- filterWorldUpdate rejects location jump under lock ---
{
  const S=blankS(); Cont.lockScene(S,'talk');
  const u=Cont.filterWorldUpdate(S,{
    scene:{ort:'Beschwörungshalle', anwesend:['Garrick','Fremder']},
    speaker:'spieler'
  }, 'Ich frage Lyra nach dem Wein.');
  ok('reject ort jump', u.scene.ort.includes('Taverne'), u.scene.ort);
  ok('keep Lyra present', u.scene.anwesend.includes('Lyra'), u.scene.anwesend);
  ok('drop spieler speaker', !u.speaker, u.speaker);
}

// --- empty anwesend must not wipe ---
{
  const S=blankS(); Cont.lockScene(S,'talk');
  const u=Cont.filterWorldUpdate(S,{scene:{ort:'Taverne „Zum Silberkelch“',anwesend:[]}},'Ich warte.');
  ok('empty anwesend restored', u.scene.anwesend.includes('Lyra'), u.scene.anwesend);
}

// --- player exit allows travel ---
{
  const S=blankS(); Cont.lockScene(S,'talk');
  ok('wants exit', Cont.playerWantsExit('Ich gehe nach dem Markt'));
  Cont.unlockScene(S);
  const u=Cont.filterWorldUpdate(S,{scene:{ort:'Markt',anwesend:['Lyra']}},'Ich gehe nach dem Markt');
  ok('exit allows ort', u.scene.ort==='Markt', u.scene.ort);
}

// --- Story-Stand ---
{
  const S=blankS(); Cont.noteExchange(S,'Ich frage Lyra nach dem Ritual.','Lyra spricht vom Ritual.');
  ok('story stand', /Ritual|Taverne|Lyra/.test(S.cont.storyStand), S.cont.storyStand);
  const built=Cont.buildTurnUserMessage(S,'Ich höre zu.',{state:'STATUS ok'});
  ok('prompt has STORY-STAND', built.includes('STORY-STAND'));
  ok('prompt has OBEY', built.includes('ausschließlich auf diese Handlung'));
  ok('prompt has lock text', /GESPERRT|LOCK/.test(built));
  ok('action last-ish', built.trim().endsWith('Wörter.') || built.includes('Ich höre zu.'));
  const dump=Cont.dumpPromptForTest(S,'Ich höre zu.',built);
  ok('dump hasObey', dump.hasObey);
}

// --- addressesPlayer ---
ok('address hit', Cont.addressesPlayer('Ich frage Lyra nach dem Wein.','Lyra reicht dir den Wein und lächelt.'));
ok('address miss', !Cont.addressesPlayer('Ich frage Lyra nach dem Wein.','Plötzlich stehst du in der Beschwörungshalle. Garrick ruft dich.'));

// --- Transcript regression from live repro ---
const transcript=[
  {a:'Ich setze mich zu Lyra und bestelle einen Wein.', meta:{speaker:'spieler',world:{scene:{ort:'Taverne „Zum Silberkelch“',anwesend:['Lyra']}}}},
  {a:'Ich frage Lyra, was sie über das Ritual weiß.', meta:{speaker:'Erzähler',world:{scene:{ort:'Beschwörungshalle',anwesend:['Garrick']}}}},
  {a:'Ich bleibe in der Taverne und frage Brok nach einem Zimmer.', meta:{world:{scene:{ort:'Taverne „Zum Silberkelch“',anwesend:[]}}}},
];
{
  const S=blankS(); Cont.lockScene(S,'talk');
  for(const row of transcript){
    const filtered=Cont.filterWorldUpdate(S,{...row.meta, scene:row.meta.world?.scene, speaker:row.meta.speaker}, row.a);
    // simulate apply under lock
    if(filtered.scene){
      if(Cont.isSceneLocked(S) && !Cont.playerWantsExit(row.a)){
        ok('transcript ort held: '+row.a.slice(0,28), filtered.scene.ort.includes('Taverne'), filtered.scene.ort);
        ok('transcript cast held: '+row.a.slice(0,28), filtered.scene.anwesend.includes('Lyra')||filtered.scene.anwesend.includes('Wirt Brok'), filtered.scene.anwesend);
      }
    }
    if(row.meta.speaker==='spieler') ok('transcript drop spieler', !filtered.speaker);
  }
}

// --- chapter should not re-inject opening ---
{
  const S=blankS(); S.cont={chapter:'Du erwachst in der Beschwörungshalle. Göttin spricht.',threads:['Ritual'],lastNarration:'Lyra nickt.',lastPlayer:'frage',updatedTurn:4,storyStand:'',locked:null};
  Cont.lockScene(S,'talk');
  Cont.rollChapterAsync(S);
  // turn 5 % 4 !== 0, bump to 8
  S.turn=8; Cont.rollChapterAsync(S);
  ok('chapter cleaned opening', !/erwachst/i.test(S.cont.chapter||'') || /Lyra|Taverne|Ritual/.test(S.cont.chapter), S.cont.chapter);
}

// --- VER files ---
ok('game 20.1', /VER='20\.1'/.test(fs.readFileSync('./game.js','utf8')));
ok('index 20', /v20.1/.test(fs.readFileSync('./index.html','utf8')));
ok('free model openai-fast', /FREE_MODEL='openai-fast'/.test(fs.readFileSync('./game.js','utf8')));
ok('freeStream exists', /async function freeStream/.test(fs.readFileSync('./game.js','utf8')));
ok('maxOutputTokens 350', /maxOutputTokens:350/.test(fs.readFileSync('./game.js','utf8')));
ok('gemini lite preferred', /gemini-2\.5-flash-lite/.test(fs.readFileSync('./game.js','utf8')));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
