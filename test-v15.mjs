#!/usr/bin/env node
/** v15 unit checks: toast cleaners, rich offline, continuity still, free default */
import * as Imm from './immerse.js';
import * as Cont from './continuity.js';
import * as Know from './know.js';
import * as Level from './leveling.js';
import assert from 'assert';

let pass=0,fail=0;
function ok(name,cond,detail=''){ if(cond){pass++; console.log('OK',name)} else {fail++; console.error('FAIL',name,detail)} }

const garbled='[Gespräch] Gutes Gespräch mit dir: „D“ Hofmagier Orren sucht dich auf: „…“';
const clean=Imm.cleanSnippet(garbled);
ok('cleanSnippet strips nested', clean.length>0 && !/Gutes Gespräch|sucht dich auf|„/.test(clean), clean);

const line=Imm.npcInitiativeLine('Hofmagier Orren', garbled);
ok('npcInitiativeLine clean', !/Gutes Gespräch|sucht dich auf:/.test(line) && line.includes('Orren'), line);
ok('npcInitiativeLine short', line.length<120, line);

const seek=Imm.seekPlayerLine('Hofmagier Orren');
ok('seekPlayerLine clean', seek.includes('Orren') && !/Gespräch/.test(seek), seek);

const S={
  ver:15, genre:'fantasy', role:'held',
  cal:{day:3,hour:21,minute:12},
  world:{scene:{ort:'Akademie-Hof',zeit:'Spätabend, 21:12',anwesend:['Hofmagier Orren']},
    npcs:{'Hofmagier Orren':{art:'älterer Magier, ruhig, präzise',mood:'nachdenklich',memories:[{text:'[Gespräch] Gutes Gespräch mit dir: „D“'}]}},
    lore:{ton:'anime fantasy'}},
  flags:{}, pc:{name:'Aki'}, st:{hp:90,maxhp:100,gold:40,lvl:2}
};
const prose=Imm.richOfflineProse(S,'Erzähl mir von der Akademie',{who:'Hofmagier Orren',label:'Hofmagier Orren',good:true,weather:'nebel',phase:'Spätabend'});
ok('richOffline >=3 sentences', prose.split(/[.!?]/).filter(x=>x.trim()).length>=3, prose);
ok('richOffline has scene', /Akademie|Orren|Nebel|Spät/.test(prose), prose);
ok('richOffline no nested garble', !/Gutes Gespräch mit dir/.test(prose), prose);

const arrive=Imm.arrivalBlurb(S);
ok('arrivalBlurb', /Akademie|betritt/.test(arrive), arrive);

ok('weatherFor night-ish', typeof Imm.weatherFor(S)==='string');
ok('portraitMood', Imm.portraitMoodClass('wütend')==='mood-anger');

// Continuity still works
Cont.ensureCont(S);
const built=Cont.buildTurnUserMessage(S,'Hallo',{worldLean:'Ort: Akademie',state:'Lv2',isGrey:false});
ok('cont scene-last present', /SPIELER:|Hallo|Akademie/i.test(built), built.slice(0,200));
ok('cont compact size', Cont.compactContinuity(S,'').length>50);

// Know still
Know.ensureKnow(S);
ok('know unknown default', !Know.isNameKnown(S,'Hofmagier Orren'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
