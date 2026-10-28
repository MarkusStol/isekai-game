#!/usr/bin/env node
import * as Battle from './battle.js';
import { ENEMIES, pickEncounter, battleBgFor, enemyById } from './enemies.js';
import * as Cont from './continuity.js';
import * as Know from './know.js';
import fs from 'fs';

let pass=0,fail=0;
const ok=(n,c,d='')=>{if(c){pass++;console.log('OK',n)}else{fail++;console.error('FAIL',n,d)}}

ok('enemy catalog size', Object.keys(ENEMIES).length>=20, Object.keys(ENEMIES).length);
ok('goblin has art path', !!ENEMIES.goblin.art && ENEMIES.goblin.art.startsWith('assets/'));
ok('art file exists goblin', fs.existsSync(ENEMIES.goblin.art));
const missing=Object.values(ENEMIES).filter(e=>!fs.existsSync(e.art));
ok('all enemy art exists (webp or svg)', missing.length===0, missing.map(e=>e.art).slice(0,5));

const S={ver:'16.1', genre:'held', role:'held', pc:{name:'Aki'}, st:{hp:100,maxhp:100,mp:40,maxmp:40,str:12,cha:10,ruf:10,gold:40,lvl:2,xp:0},
  progress:{attrs:{str:8,dex:6,int:5,wil:5,cha:6,vit:7},unlockedSkills:[{name:'Hieb'},{name:'Funke'}],tree:{},acquireLog:[],pathStats:{}},
  skills:[{name:'Hieb',cost:0},{name:'Funke',cost:5}],
  world:{scene:{ort:'Elfenwald',zeit:'Abend',anwesend:['Prinzessin Elise']},npcs:{'Prinzessin Elise':{art:'stolz',alive:true,mood:'warm'}},orte:{}},
  romance:{'Prinzessin Elise':{affection:55,trust:40,stage:3}},
  inv:[{name:'Heiltrank',icon:'🧪'}], flags:{}, cal:{day:2,hour:18,minute:0}, party:[]
};
Cont.ensureCont(S); Know.ensureKnow(S);

const foes=pickEncounter(S,{noBoss:true,count:2});
ok('pickEncounter returns foes', foes.length>=1, foes.map(f=>f.name));
ok('battleBg', /assets\/bg\/battle/.test(battleBgFor(S)), battleBgFor(S));

const party=Battle.buildParty(S);
ok('party has hero', party[0].kind==='hero' && party[0].name==='Aki');
ok('ally companion from romance', party.some(p=>p.name==='Prinzessin Elise'), party.map(p=>p.name));
ok('skills from tree', party[0].skills.some(s=>s.name==='Hieb'||s.name==='Funke'));

ok('COMBAT_SKILLS has Overdrive', !!Battle.COMBAT_SKILLS.Overdrive);
ok('cont still', Cont.compactContinuity(S,'').length>20);

/* v16.1 mercy / permanent death */
const Elise='Prinzessin Elise';
ok('story foe needs mercy', Battle.mercyNeeded({name:Elise,_storyNpc:Elise,human:true}, S));
ok('monster no mercy', !Battle.mercyNeeded({id:'goblin',name:'Goblin',...ENEMIES.goblin}, S));

const foeKill={name:Elise,_storyNpc:Elise,human:true,hp:0,alive:false,id:'story_elise'};
let killCalled=false;
const rKill=Battle.applyMercyDecision(S, foeKill, 'finish', {
  killNPC:(n,ctx)=>{ killCalled=true; S.world.npcs[n].alive=false; S.world.npcs[n].dead=true; return {ok:true,cause:ctx?.cause}; },
  addMemory:()=>{},
  Sim:{ledgerPush:()=>{}}
});
ok('finish calls killNPC', killCalled && rKill.choice==='finish' && S.world.npcs[Elise].dead===true);
ok('finish marks killed', foeKill._ended==='killed' && foeKill._mercyResolved);

S.world.npcs['Ritter Kai']={art:'tapfer',alive:true,mood:'neutral'};
const foeSpare={name:'Ritter Kai',_storyNpc:'Ritter Kai',human:true,hp:0,id:'kai'};
Battle.applyMercyDecision(S, foeSpare, 'spare', {addMemory:()=>{}, Sim:{ledgerPush:()=>{}}});
ok('spare keeps alive', S.world.npcs['Ritter Kai'].alive===true && !S.world.npcs['Ritter Kai'].dead && foeSpare._ended==='spared');
ok('spare remembered', (S.flags.sparedNames||[]).includes('Ritter Kai'));

S.world.npcs['Dieb Mara']={art:'flink',alive:true,mood:'neutral'};
const foeKo={name:'Dieb Mara',_storyNpc:'Dieb Mara',human:true,hp:0,id:'mara'};
Battle.applyMercyDecision(S, foeKo, 'ko', {addMemory:()=>{}, Sim:{ledgerPush:()=>{}}});
ok('ko not dead', S.world.npcs['Dieb Mara'].alive===true && S.world.npcs['Dieb Mara'].mood==='bewusstlos' && foeKo._ended==='ko');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
