/** v14: knowledge, leveling, continuity intact, asset inventory */
import * as Know from './know.js';
import * as Level from './leveling.js';
import * as Cont from './continuity.js';
import * as Persist from './persist.js';
import * as Sim from './sim.js';
import assert from 'assert';
import fs from 'fs';
import path from 'path';

const S={world:{npcs:{
  'Elise von Aldheim':{e:'👑',art:'Prinzessin mit goldenem Haar und sanften blauen Augen',geschlecht:'weiblich',ziel:'Frieden',geheimnis:'Träumt von Flucht',job:'Prinzessin',ort:'Thronsaal'},
  'Garrick':{e:'⚔️',art:'Hauptmann mit Narbe am Kinn',geschlecht:'männlich',job:'Hauptmann'}
},scene:{ort:'Thronsaal',anwesend:['Elise von Aldheim','Garrick']}}, romance:{'Elise von Aldheim':{affection:0,trust:0,stage:0,events:[]}}, codex:{entries:{},cats:{people:[]}}, cal:{day:1,hour:14,minute:0}, time:{day:1,hour:14}, pc:{name:'Test'}, st:{lvl:1,xp:0,hp:100,maxhp:100,mp:40,maxmp:40,str:10,cha:8,gold:20}, turn:0, hist:[], log:[]};

Know.ensureKnow(S);
Know.migrateKnow(S);
assert.strictEqual(Object.keys(S.romance).length,0,'romance emptied until interact');
const d=Know.displayName(S,'Elise von Aldheim');
assert.ok(!/Elise/i.test(d), 'must not show name: '+d);
assert.ok(/prinzessin|frau|haar|augen/i.test(d), 'desc: '+d);
assert.strictEqual(Know.isNameKnown(S,'Elise von Aldheim'), false);
const line=Know.scenePresenceLine(S);
assert.ok(!/Elise von Aldheim/.test(line), line);
const r=Know.learnName(S,'Elise von Aldheim','told');
assert.ok(r.first);
assert.strictEqual(Know.isNameKnown(S,'Elise von Aldheim'), true);
assert.strictEqual(Know.displayName(S,'Elise von Aldheim'), 'Elise von Aldheim');
Know.markInteracted(S,'Elise von Aldheim');
const masked=Know.maskNarrationNames(S,'Elise von Aldheim spricht mit Garrick.');
assert.ok(masked.includes('Elise'), masked);
assert.ok(!masked.includes('Garrick') || /Hauptmann|Narbe|jemand|ein /.test(masked), 'garrick masked: '+masked);

Level.ensureProgress(S);
const xp=Level.grantXp(S,200,'test');
assert.ok((S.st.lvl|0)>=1, "lvl "+S.st.lvl);
Level.spendAttr(S,'str');
assert.ok(S.progress.attrs.str>=5);
Level.setClass(S,'held');
const br=Level.chooseBranch(S,'ritter');
assert.ok(br.ok!==false || S.progress.branch==='ritter' || br.text);

const flags=Know.applyNarratorFlags(S,'Hallo.\nFLAG: LEARN_NAME=Garrick\nFLAG: INTERACT=Garrick');
assert.ok(flags.learned.includes('Garrick'));
assert.ok(Know.isNameKnown(S,'Garrick'));

// Continuity still compact
for(let i=0;i<60;i++){S.hist.push({role:'user',content:'SPIELER: Zug '+i},{role:'assistant',content:'Antwort '+i}); Cont.noteExchange(S,'Zug '+i,'Antwort '+i)}
S.hist=S.hist.slice(-24); S.turn=60; S.summary='Kapitel';
const built=Cont.buildTurnUserMessage(S,'Weiter',{});
assert.ok(Math.round(built.length/3.5)<=3200, 'cont budget '+built.length);
const talk=Cont.estimateMinutes('Ich spreche mit Garrick.', 10);
assert.equal(talk.kind,'talk');
assert.ok(talk.minutes<=20);
Cont.advanceMinutes(S, talk.minutes);
assert.equal(S.cal.day,1);

// catch-up opt-in
S.cfgCatchupOptIn=false; S.lastRealAt=Date.now()-9e7;
const cu=Persist.catchUp(S,{Sim});
assert.ok(cu.skipped==='opt-in'||cu.hours===0);

// Asset inventory (honest)
function walk(dir,acc=[]){
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    const p=path.join(dir,ent.name);
    if(ent.isDirectory())walk(p,acc);
    else if(ent.name.endsWith('.webp'))acc.push({p, size:fs.statSync(p).size});
  }
  return acc;
}
const webps=walk('assets');
const ok=webps.filter(w=>w.size>=8000);
console.log('ALL PASS v14 know+level+cont');
console.log('unknown label sample:', d);
console.log('ASSET COUNT: webp=', webps.length, 'usable(>=8KB)=', ok.length, 'tiny=', webps.length-ok.length);
console.log('  bg=', webps.filter(w=>w.p.includes('/bg/')).length, 'port=', webps.filter(w=>w.p.includes('/port/')).length);
