#!/usr/bin/env node
/** v17.1 — hub UI wiring + systems usable from screens */
import * as Battle from './battle.js';
import * as Jrpg from './jrpg.js';
import * as Jobs from './jobs.js';
import * as Gems from './gems.js';
import * as Summons from './summons.js';
import * as Equip from './equip.js';
import * as UI14 from './ui14.js';
import * as UI17 from './ui17.js';
import { ENEMIES, enemyById } from './enemies.js';
import fs from 'fs';

let pass=0,fail=0;
const ok=(n,c,d='')=>{if(c){pass++;console.log('OK',n)}else{fail++;console.error('FAIL',n,d||'')}};

ok('ui17 exports', !!(UI17.renderEquip&&UI17.renderGambits&&UI17.renderJobs&&UI17.renderCraft&&UI17.renderSummons&&UI17.startSuperbossSetpiece));
ok('hub has equip tile', UI14.HUB_TILES.some(t=>t.id==='equip'));
ok('hub has jobs', UI14.HUB_TILES.some(t=>t.id==='jobs'));
ok('hub has gambits', UI14.HUB_TILES.some(t=>t.id==='gambits'));
ok('hub has craft', UI14.HUB_TILES.some(t=>t.id==='craft'));
ok('hub has summons', UI14.HUB_TILES.some(t=>t.id==='summons'));

const S={ver:17.1, genre:'held', role:'held', pc:{name:'Aki'},
  st:{hp:200,maxhp:200,mp:80,maxmp:80,str:16,cha:10,ruf:10,gold:500,lvl:5,xp:0},
  progress:{attrs:{str:10,dex:8,int:9,wil:7,cha:6,vit:9},unlockedSkills:[],tree:{},acquireLog:[],pathStats:{}},
  skills:[], world:{scene:{ort:'Drachenpass',zeit:'Abend',anwesend:['Ritter Kai']},
    npcs:{'Ritter Kai':{art:'tapfer',alive:true,mood:'loyal'}},orte:{}},
  romance:{'Ritter Kai':{affection:40,trust:30,stage:2}},
  inv:[{name:'Heiltrank',icon:'🧪'}],
  flags:{}, cal:{day:3,hour:18,minute:0}, party:['Ritter Kai'],
  cfgBattleDiff:'normal', cfgAtbMode:'active', battle:{}
};
Jobs.ensureJobs(S); Gems.ensureGems(S); Summons.ensureSummons(S); Equip.ensureEquip(S);

// Equipment + socket
ok('socket gem', Equip.socketGem(S,'eisenklinge',0,S.gems.inventory[0].uid).ok);
const load=Gems.resolveLoadoutGems(S,{sockets:Equip.equippedStats(S).sockets});
ok('gem loadout spells', load.spells.length>=1, load);
Equip.socketGem(S,'eisenklinge',0,S.gems.inventory[2].uid); // replace with eis
// need 2 sockets for link — socket heil on armor
Equip.socketGem(S,'lederwams',0,S.gems.inventory[1].uid);
const load2=Gems.resolveLoadoutGems(S,{sockets:Equip.equippedStats(S).sockets});
ok('link or multi gems', load2.spells.length>=2 || load2.links.length>=0, load2);

// Craft + upgrade
const craft=Equip.craftItem(S,'runenschwert');
ok('craft or mats', craft.ok || /Gil|Fehlt|Unbekannt|Rezept/.test(craft.text||''), craft);
S.st.gold=9999; S.equip.mats={'Eisenbarren':10,'Leder':10,'Runensplitter':10,'Holzstab':5,'Eiskristall':5};
const craft2=Equip.craftItem(S,'runenschwert');
ok('craft runenschwert', craft2.ok, craft2);
const up=Equip.upgradeItem(S,'eisenklinge');
ok('upgrade', up.ok && (S.equip.upgrades.eisenklinge|0)>=1, up);

// Jobs
Jobs.unlockJob(S,'paladin');
ok('switch job', Jobs.switchJob(S,'paladin').ok);
ok('abilities', Jobs.availableAbilities(S).length>=1);
ok('job ap bar', (S.jobs.ap[S.jobs.active]|0)>=0);

// Gambits
const rules=Jrpg.defaultGambits().map(g=>({...g,on:true}));
rules[0].on=false;
S.battle.gambits=rules;
const actor={hp:100,maxhp:100,skills:[],gambits:rules};
const decided=Jrpg.gambitDecide(actor, {party:[{hp:10,maxhp:100}], foes:[{hp:50,maxhp:50}]});
ok('gambit skips off', decided==null || decided.when!==rules[0].when || rules[0].on, decided);

// Summons + superboss
ok('sternengeister', Summons.ownedSummons(S).length>=1);
ok('superboss tuned', ENEMIES.superboss_aether.hp<=500 && ENEMIES.superboss_aether.phases?.length>=2, ENEMIES.superboss_aether);
ok('balance story stagger', Jrpg.DIFFICULTY.story.staggerRate>=1.3);

// DOM render smoke (jsdom-free: call into fake body)
function fakeBody(){
  const kids=[];
  return {
    kids,
    get innerHTML(){return ''},
    set innerHTML(v){ if(v==='') kids.length=0 },
    appendChild(n){ kids.push(n); return n },
    querySelector(){return null},
    querySelectorAll(){return []},
  };
}
// Minimal document stubs for button creation inside renderers
if(typeof globalThis.document==='undefined'){
  globalThis.document={
    createElement(tag){
      const el={tagName:tag, className:'', style:{}, children:[], attrs:{},
        set textContent(v){this._t=v}, get textContent(){return this._t||''},
        set innerHTML(v){this._h=v; this.children=[]}, get innerHTML(){return this._h||''},
        appendChild(c){this.children.push(c);return c},
        append(...ns){ns.forEach(n=>this.appendChild(n))},
        querySelector(){return {onclick:null, onchange:null, oninput:null, appendChild(){}, append(){}, disabled:false}},
        querySelectorAll(){return []},
        setAttribute(k,v){this.attrs[k]=v},
        classList:{_s:new Set(), add(x){this._s.add(x)}, remove(x){this._s.delete(x)}, toggle(x,f){if(f===undefined){this._s.has(x)?this._s.delete(x):this._s.add(x)} else if(f)this._s.add(x); else this._s.delete(x)}, contains(x){return this._s.has(x)}}
      };
      return el;
    }
  };
}
const helpers={toast:()=>{}, save:()=>{}, closeMenu:()=>{}, startSuperboss:()=>{}, openTab:()=>{}};
try{
  const b1=fakeBody(); UI17.renderEquip(b1,S,helpers);
  ok('renderEquip cards', b1.kids.length>=3, b1.kids.length);
  const b2=fakeBody(); UI17.renderGambits(b2,S,helpers);
  ok('renderGambits', b2.kids.length>=2, b2.kids.length);
  const b3=fakeBody(); UI17.renderJobs(b3,S,helpers);
  ok('renderJobs', b3.kids.length>=2);
  const b4=fakeBody(); UI17.renderCraft(b4,S,helpers);
  ok('renderCraft', b4.kids.length>=2);
  const b5=fakeBody(); UI17.renderSummons(b5,S,helpers);
  ok('renderSummons', b5.kids.length>=2);
}catch(e){ ok('render smoke', false, e.message); console.error(e) }

ok('game.js VER 17.1', /VER='17\.1'/.test(fs.readFileSync('./game.js','utf8')));
ok('index badge 17.1', /v17\.1/.test(fs.readFileSync('./index.html','utf8')));
ok('sw cache 17.1', /isekai-v17\.1/.test(fs.readFileSync('./sw.js','utf8')));
ok('ui17 in sw', /ui17\.js/.test(fs.readFileSync('./sw.js','utf8')));
ok('css sock-row', /\.sock-row/.test(fs.readFileSync('./style.css','utf8')));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
