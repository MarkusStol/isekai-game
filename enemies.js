/** v16 enemy catalog — JRPG bestiary templates per genre */
export const ELEMENTS=['phys','feuer','eis','blitz','wasser','wind','erde','licht','dunkel','schatten','gift','techno'];
export const ELEM_LABEL={phys:'Physisch',feuer:'Feuer',eis:'Eis',blitz:'Blitz',wasser:'Wasser',wind:'Wind',erde:'Erde',licht:'Licht',dunkel:'Dunkel',schatten:'Schatten',gift:'Gift',techno:'Techno'};
export const STATUS=['gift','betaeubt','brand','schlaf','blutung','staerkung','schild','regeneration','hast','langsam','schutz','magschild','regen','berserker','stille','blind','doom','versteinert'];

/** @typedef {{id:string,name:string,icon:string,art:string,genre:string[],hp:number,mp:number,atk:number,def:number,mag:number,spd:number,exp:number,gold:number,element?:string,weak?:string[],resist?:string[],immune?:string[],ai:'aggro'|'cautious'|'caster'|'healer'|'swarm'|'boss',skills?:object[],loot?:object[],human?:boolean,boss?:boolean,phases?:object[],aggroBias?:number}} EnemyDef */

/** @type {Record<string,EnemyDef>} */
export const ENEMIES={
  goblin:{id:'goblin',name:'Goblin',icon:'👺',art:'assets/creature/goblin.webp',genre:['held','fantasy'],hp:38,mp:0,atk:9,def:4,mag:2,spd:12,exp:18,gold:6,element:'phys',weak:['licht'],resist:[],ai:'swarm',skills:[{id:'kratzen',name:'Kratzen',pow:1.1,elem:'phys'}],loot:[{name:'Goblinzahn',icon:'🦷',chance:.4},{name:'Silbermünzen',icon:'🪙',chance:.5}],steal:[{name:'Diebesbeutel',icon:'🪙',chance:.35},{name:'Wurfmesser',icon:'🗡️',chance:.12}],aggroBias:1.1},
  orc:{id:'orc',name:'Ork',icon:'👹',art:'assets/creature/orc.webp',genre:['held','fantasy','darkfantasy'],hp:72,mp:0,atk:16,def:10,mag:2,spd:7,exp:40,gold:14,element:'phys',weak:['blitz'],ai:'aggro',skills:[{id:'wutschlag',name:'Wutschlag',pow:1.4,elem:'phys',cd:2}],loot:[{name:'Orkhauer',icon:'🦴',chance:.35},{name:'Beil',icon:'🪓',chance:.15,type:'weapon'}],aggroBias:1.4},
  wolf:{id:'wolf',name:'Wolf',icon:'🐺',art:'assets/creature/wolf.webp',genre:['held','fantasy','wild'],hp:42,mp:0,atk:12,def:5,mag:1,spd:14,exp:22,gold:4,element:'phys',weak:['feuer'],ai:'aggro',skills:[{id:'biss',name:'Biss',pow:1.2,elem:'phys',status:'blutung',statusChance:.35}],loot:[{name:'Wolfsfell',icon:'毛皮',chance:.45}],aggroBias:1.2},
  slime:{id:'slime',name:'Schleim',icon:'🫧',art:'assets/creature/slime.svg',genre:['held','fantasy'],hp:30,mp:8,atk:6,def:8,mag:6,spd:6,exp:14,gold:3,element:'gift',weak:['feuer','eis'],resist:['phys'],absorb:['gift'],ai:'cautious',skills:[{id:'saeure',name:'Säure',pow:1.0,elem:'gift',status:'gift',statusChance:.4}],loot:[{name:'Schleimkern',icon:'💧',chance:.5}],steal:[{name:'Heiltrank',icon:'🧪',chance:.25}]},
  skeleton:{id:'skeleton',name:'Skelett',icon:'💀',art:'assets/creature/skeleton.webp',genre:['held','darkfantasy','daemon'],hp:48,mp:0,atk:11,def:7,mag:2,spd:9,exp:26,gold:8,element:'schatten',weak:['licht','feuer'],resist:['gift','blutung'],immune:['gift'],ai:'aggro',skills:[{id:'knochenschlag',name:'Knochenschlag',pow:1.2,elem:'phys'}],loot:[{name:'Knochenstück',icon:'🦴',chance:.5}]},
  bandit:{id:'bandit',name:'Wegelagerer',icon:'🗡️',art:'assets/creature/bandit.svg',genre:['held','fantasy'],hp:50,mp:0,atk:13,def:6,mag:3,spd:11,exp:28,gold:18,element:'phys',weak:[],ai:'cautious',human:true,skills:[{id:'messerwurf',name:'Messerwurf',pow:1.15,elem:'phys'}],loot:[{name:'Lederrüstung',icon:'🦺',chance:.2},{name:'Münzbeutel',icon:'🪙',chance:.6}],steal:[{name:'Goldzahn',icon:'🦷',chance:.4},{name:'Feuerkern',icon:'🔴',chance:.08,gem:'feuerkern'}],aggroBias:.9},
  mage_rogue:{id:'mage_rogue',name:'Schattenmagier',icon:'🔮',art:'assets/creature/mage_rogue.webp',genre:['held','fantasy','darkfantasy'],hp:40,mp:40,atk:6,def:4,mag:16,spd:10,exp:36,gold:12,element:'schatten',weak:['licht'],ai:'caster',skills:[{id:'schattenblitz',name:'Schattenblitz',pow:1.3,elem:'schatten',mp:6},{id:'schlaf',name:'Schlafzauber',pow:0,elem:'schatten',mp:8,status:'schlaf',statusChance:.55}],loot:[{name:'Runensplitter',icon:'✨',chance:.35}]},
  dragon_whelp:{id:'dragon_whelp',name:'Drachenjunges',icon:'🐉',art:'assets/creature/dragon_whelp.webp',genre:['held','fantasy'],hp:90,mp:20,atk:18,def:12,mag:14,spd:8,exp:80,gold:40,element:'feuer',weak:['eis'],resist:['feuer'],ai:'boss',boss:true,skills:[{id:'feueratem',name:'Feueratem',pow:1.5,elem:'feuer',aoe:true,mp:8,status:'brand',statusChance:.4}],loot:[{name:'Drachenschuppe',icon:'🔷',chance:.7},{name:'Monsterkern',icon:'💎',chance:.4}],phases:[{at:0.45,buff:{atk:1.25},announce:'Das Junge wird wütend!'}],aggroBias:1.3},

  demon_imp:{id:'demon_imp',name:'Imp',icon:'😈',art:'assets/creature/demon_imp.svg',genre:['daemon','darkfantasy'],hp:36,mp:16,atk:8,def:4,mag:12,spd:13,exp:24,gold:10,element:'feuer',weak:['licht','eis'],ai:'caster',skills:[{id:'funke',name:'Höllenfunke',pow:1.2,elem:'feuer',mp:4}],loot:[{name:'Dämonenasche',icon:'🌑',chance:.4}]},
  shadow_wraith:{id:'shadow_wraith',name:'Schattengeist',icon:'👻',art:'assets/creature/shadow_wraith.webp',genre:['darkfantasy','grey','daemon'],hp:55,mp:30,atk:7,def:3,mag:15,spd:11,exp:42,gold:8,element:'schatten',weak:['licht'],resist:['phys'],immune:['gift'],ai:'caster',skills:[{id:'entzug',name:'Seelenentzug',pow:1.2,elem:'schatten',mp:7}],loot:[{name:'Schattentuch',icon:'🖤',chance:.3}]},
  ash_hound:{id:'ash_hound',name:'Aschenhund',icon:'🐕',art:'assets/creature/ash_hound.webp',genre:['darkfantasy','daemon'],hp:58,mp:0,atk:15,def:7,mag:4,spd:13,exp:34,gold:6,element:'feuer',weak:['eis'],resist:['feuer'],ai:'aggro',skills:[{id:'glutbiss',name:'Glutbiss',pow:1.25,elem:'feuer',status:'brand',statusChance:.3}],loot:[{name:'Glutkohle',icon:'🔥',chance:.4}]},
  bone_knight:{id:'bone_knight',name:'Knochenritter',icon:'☠️',art:'assets/creature/bone_knight.webp',genre:['darkfantasy','daemon'],hp:95,mp:0,atk:18,def:16,mag:4,spd:6,exp:70,gold:22,element:'schatten',weak:['licht','feuer'],ai:'aggro',skills:[{id:'schildbruch',name:'Schildbruch',pow:1.35,elem:'phys',cd:2}],loot:[{name:'Knochenplatte',icon:'🛡️',chance:.25}],aggroBias:1.5},
  blood_cultist:{id:'blood_cultist',name:'Blutkultist',icon:'🩸',art:'assets/creature/blood_cultist.svg',genre:['darkfantasy','daemon'],hp:48,mp:28,atk:9,def:5,mag:14,spd:9,exp:38,gold:15,element:'schatten',weak:['licht'],ai:'healer',human:true,skills:[{id:'blutmal',name:'Blutmal',pow:1.15,elem:'schatten',mp:6,status:'blutung',statusChance:.45},{id:'opferheil',name:'Opferheilung',pow:0,heal:28,mp:10}],loot:[{name:'Ritualdolch',icon:'🗡️',chance:.2}]},

  walker:{id:'walker',name:'Beißer',icon:'🧟',art:'assets/creature/walker.webp',genre:['zombie'],hp:40,mp:0,atk:10,def:5,mag:0,spd:5,exp:16,gold:2,element:'phys',weak:['feuer','licht'],ai:'swarm',skills:[{id:'biss',name:'Infizierter Biss',pow:1.1,elem:'phys',status:'gift',statusChance:.25}],loot:[{name:'Munition',icon:'🔫',chance:.2}],aggroBias:1.0},
  runner:{id:'runner',name:'Läufer',icon:'🧟‍♂️',art:'assets/creature/runner.webp',genre:['zombie'],hp:34,mp:0,atk:12,def:3,mag:0,spd:16,exp:22,gold:3,element:'phys',weak:['feuer'],ai:'aggro',skills:[{id:'ansturm',name:'Ansturm',pow:1.3,elem:'phys'}],loot:[{name:'Stoffreste',icon:'👕',chance:.3}],aggroBias:1.3},
  bloater:{id:'bloater',name:'Aufgedunsener',icon:'🧟‍♀️',art:'assets/creature/bloater.webp',genre:['zombie'],hp:80,mp:0,atk:8,def:9,mag:0,spd:3,exp:35,gold:5,element:'gift',weak:['feuer','blitz'],ai:'cautious',skills:[{id:'explosion',name:'Säureplatzen',pow:1.6,elem:'gift',aoe:true,cd:3}],loot:[{name:'Säureflasche',icon:'🧪',chance:.35}]},
  looter:{id:'looter',name:'Plünderer',icon:'🪓',art:'assets/creature/looter.webp',genre:['zombie','postapoc'],hp:52,mp:0,atk:13,def:6,mag:2,spd:10,exp:26,gold:20,element:'phys',weak:[],ai:'cautious',human:true,skills:[{id:'schlagen',name:'Knüppelschlag',pow:1.2,elem:'phys'}],loot:[{name:'Konserve',icon:'🥫',chance:.4},{name:'Munition',icon:'🔫',chance:.3}]},

  drone:{id:'drone',name:'Kampfdrohne',icon:'🤖',art:'assets/creature/drone.svg',genre:['cyberpunk'],hp:36,mp:20,atk:11,def:8,mag:10,spd:15,exp:28,gold:12,element:'techno',weak:['blitz','wind'],resist:['gift'],ai:'caster',skills:[{id:'laser',name:'Laserburst',pow:1.25,elem:'techno',mp:5}],loot:[{name:'Schaltkreis',icon:'🔌',chance:.45}]},
  street_thug:{id:'street_thug',name:'Straßengangster',icon:'🕶️',art:'assets/creature/street_thug.webp',genre:['cyberpunk'],hp:55,mp:0,atk:14,def:7,mag:3,spd:11,exp:30,gold:22,element:'phys',weak:[],ai:'aggro',human:true,skills:[{id:'chromfaust',name:'Chromfaust',pow:1.3,elem:'phys'}],loot:[{name:'Credstick',icon:'💳',chance:.4}]},
  chrome_hound:{id:'chrome_hound',name:'Chromhund',icon:'🐕‍🦺',art:'assets/creature/chrome_hound.svg',genre:['cyberpunk'],hp:48,mp:0,atk:15,def:8,mag:2,spd:14,exp:32,gold:8,element:'techno',weak:['blitz'],ai:'aggro',skills:[{id:'saegen',name:'Sägegebiss',pow:1.25,elem:'phys',status:'blutung',statusChance:.35}],loot:[{name:'Servo',icon:'⚙️',chance:.35}]},
  net_ghost:{id:'net_ghost',name:'Netzgeist',icon:'👾',art:'assets/creature/net_ghost.webp',genre:['cyberpunk'],hp:42,mp:45,atk:5,def:4,mag:18,spd:12,exp:40,gold:10,element:'techno',weak:['licht'],resist:['phys'],ai:'caster',skills:[{id:'glitch',name:'Glitch',pow:1.2,elem:'techno',mp:7,status:'betaeubt',statusChance:.35}],loot:[{name:'Datenkern',icon:'💾',chance:.4}]},

  lesser_fiend:{id:'lesser_fiend',name:'Niederer Fiend',icon:'🦇',art:'assets/creature/lesser_fiend.webp',genre:['daemon'],hp:60,mp:18,atk:14,def:8,mag:12,spd:10,exp:44,gold:16,element:'schatten',weak:['licht'],ai:'aggro',skills:[{id:'krallen',name:'Höllenkrallen',pow:1.25,elem:'schatten'}],loot:[{name:'Dämonenhorn',icon:'📯',chance:.3}]},
  hellhound:{id:'hellhound',name:'Höllenhund',icon:'🔥',art:'assets/creature/hellhound.webp',genre:['daemon'],hp:65,mp:0,atk:16,def:8,mag:6,spd:13,exp:40,gold:10,element:'feuer',weak:['eis'],resist:['feuer'],ai:'aggro',skills:[{id:'flammenbiss',name:'Flammenbiss',pow:1.3,elem:'feuer',status:'brand',statusChance:.4}],loot:[{name:'Höllenkohle',icon:'⬛',chance:.4}]},
  cultist:{id:'cultist',name:'Dämonenkultist',icon:'🕯️',art:'assets/creature/cultist.svg',genre:['daemon'],hp:46,mp:32,atk:8,def:5,mag:15,spd:8,exp:36,gold:14,element:'schatten',weak:['licht'],ai:'healer',human:true,skills:[{id:'fluch',name:'Fluch',pow:1.1,elem:'schatten',mp:6},{id:'dunkle_heilung',name:'Dunkle Heilung',heal:24,mp:9}],loot:[{name:'Kultrobe',icon:'🧥',chance:.2}]},

  fog_passenger:{id:'fog_passenger',name:'Nebelpassagier',icon:'🌫️',art:'assets/creature/fog_passenger.svg',genre:['grey'],hp:50,mp:20,atk:10,def:6,mag:12,spd:9,exp:34,gold:0,element:'schatten',weak:['licht'],resist:['phys'],ai:'cautious',skills:[{id:'nebelgriff',name:'Nebelgriff',pow:1.2,elem:'schatten',status:'schlaf',statusChance:.3}],loot:[{name:'Fahrkarte',icon:'🎫',chance:.5}]},
  mirror_double:{id:'mirror_double',name:'Spiegelbild',icon:'🪞',art:'assets/creature/mirror_double.svg',genre:['grey'],hp:55,mp:15,atk:12,def:7,mag:12,spd:11,exp:38,gold:0,element:'schatten',weak:[],ai:'cautious',skills:[{id:'echo',name:'Echo',pow:1.15,elem:'phys'}],loot:[{name:'Spiegelscherbe',icon:'🪞',chance:.4}]},
  quiet_porter:{id:'quiet_porter',name:'Stiller Schaffner',icon:'🧳',art:'assets/creature/quiet_porter.svg',genre:['grey'],hp:70,mp:10,atk:14,def:12,mag:8,spd:7,exp:48,gold:0,element:'phys',weak:['blitz'],ai:'boss',boss:true,skills:[{id:'kontrolle',name:'Fahrkartenkontrolle',pow:1.35,elem:'schatten',mp:5}],loot:[{name:'Silberpfeife',icon:'📯',chance:.5}],phases:[{at:0.4,buff:{def:1.3},announce:'Der Schaffner hebt die Hand – der Nebel gehorcht.'}]},

  boss_ogre:{id:'boss_ogre',name:'Oger-Kriegsherr',icon:'👹',art:'assets/creature/boss_ogre.webp',genre:['held','fantasy'],hp:220,mp:0,atk:24,def:18,mag:4,spd:5,exp:200,gold:80,element:'phys',weak:['blitz','erde'],resist:['feuer'],ai:'boss',boss:true,staggerMax:90,skills:[{id:'erdschlag',name:'Erdschlag',pow:1.6,elem:'erde',aoe:true,cd:2,staggerBonus:1.5},{id:'wutgeheul',name:'Wutgeheul',pow:0,buffSelf:{atk:1.3},cd:3},{id:'keulenschwung',name:'Keulenschwung',pow:1.45,elem:'phys'}],loot:[{name:'Kriegskeule',icon:'🏏',chance:.5,type:'weapon'},{name:'Ogerherz',icon:'❤️',chance:.6}],steal:[{name:'Kriegstrophäe',icon:'🏆',chance:.3},{name:'Allmachtssplitter',icon:'💎',chance:.05,gem:'allmacht'}],phases:[{at:0.66,buff:{atk:1.15},announce:'Der Kriegsherr stampft — die Erde bebt.',script:'stomp'},{at:0.5,buff:{atk:1.2,spd:1.15},announce:'Der Kriegsherr tobt!'},{at:0.2,buff:{atk:1.4},announce:'Letzter Widerstand — Bruchfenster!'}],aggroBias:1.6},
  boss_lich:{id:'boss_lich',name:'Lich',icon:'💀',art:'assets/creature/boss_lich.webp',genre:['darkfantasy','daemon'],hp:180,mp:80,atk:10,def:12,mag:26,spd:8,exp:220,gold:90,element:'schatten',weak:['licht','feuer'],resist:['eis','gift'],immune:['gift'],ai:'boss',boss:true,skills:[{id:'todesnova',name:'Todesnova',pow:1.5,elem:'schatten',aoe:true,mp:12},{id:'skelett_rufen',name:'Skelette rufen',summon:'skeleton',mp:14,cd:3}],loot:[{name:'Lichphylakterium',icon:'💎',chance:.4},{name:'Nekrobuch',icon:'📕',chance:.3}],phases:[{at:0.35,buff:{mag:1.35},announce:'Der Lich flüstert ältere Namen.'}]},
  boss_tyrant:{id:'boss_tyrant',name:'Tyrant',icon:'🧟',art:'assets/creature/boss_tyrant.svg',genre:['zombie'],hp:260,mp:0,atk:22,def:16,mag:0,spd:4,exp:210,gold:40,element:'phys',weak:['feuer'],ai:'boss',boss:true,skills:[{id:'zerquetschen',name:'Zerquetschen',pow:1.7,elem:'phys'},{id:'infektion',name:'Infektionswolke',pow:1.1,elem:'gift',aoe:true,status:'gift',statusChance:.5,cd:2}],loot:[{name:'Serumprobe',icon:'🧪',chance:.6}],phases:[{at:0.4,buff:{atk:1.25},announce:'Der Tyrant bricht Panzerung auf!'}]},
  boss_chrome:{id:'boss_chrome',name:'Chrom-Assassine',icon:'🤖',art:'assets/creature/boss_chrome.svg',genre:['cyberpunk'],hp:170,mp:40,atk:20,def:14,mag:16,spd:16,exp:200,gold:100,element:'techno',weak:['blitz'],ai:'boss',boss:true,skills:[{id:'klingenschirm',name:'Klingenschirm',pow:1.45,elem:'phys'},{id:'emp',name:'EMP-Puls',pow:1.2,elem:'techno',aoe:true,mp:10,status:'betaeubt',statusChance:.4}],loot:[{name:'Chrome-Klinge',icon:'⚔️',chance:.45,type:'weapon'}],phases:[{at:0.5,buff:{spd:1.3},announce:'Overclock aktiv!'}]},
  boss_archfiend:{id:'boss_archfiend',name:'Erzfiend',icon:'👿',art:'assets/creature/boss_archfiend.webp',genre:['daemon'],hp:240,mp:50,atk:22,def:16,mag:20,spd:9,exp:240,gold:110,element:'schatten',weak:['licht'],resist:['feuer','schatten'],ai:'boss',boss:true,skills:[{id:'hoellensturm',name:'Höllensturm',pow:1.55,elem:'feuer',aoe:true,mp:12},{id:'furcht',name:'Furcht',pow:0,status:'schlaf',statusChance:.4,mp:8,aoe:true}],loot:[{name:'Erzhorn',icon:'📯',chance:.5}],phases:[{at:0.45,buff:{mag:1.3,atk:1.2},announce:'Flügel aus schwarzer Flamme!'}]},
  boss_fogking:{id:'boss_fogking',name:'König im Nebel',icon:'👑',art:'assets/creature/boss_fogking.webp',genre:['grey'],hp:200,mp:60,atk:16,def:14,mag:22,spd:8,exp:230,gold:0,element:'schatten',weak:['licht'],resist:['phys'],ai:'boss',boss:true,skills:[{id:'nebelmeer',name:'Nebelmeer',pow:1.4,elem:'schatten',aoe:true,mp:12},{id:'vergessen',name:'Vergessen',pow:1.1,elem:'schatten',status:'schlaf',statusChance:.5,mp:10}],loot:[{name:'Nebelkrone',icon:'👑',chance:.4}],phases:[{at:0.4,buff:{mag:1.35},announce:'Der Nebel wird dichter – Stimmen rufen deinen Namen.'}]},
  golden_slime:{id:'golden_slime',name:'Goldschleim',icon:'🥇',art:'assets/creature/slime.svg',genre:['held','fantasy'],hp:45,mp:0,atk:5,def:20,mag:5,spd:4,exp:120,gold:200,element:'licht',weak:['feuer'],resist:['phys'],rare:true,ai:'cautious',skills:[{id:'rollen',name:'Rollen',pow:0.8,elem:'phys'}],loot:[{name:'Goldklumpen',icon:'🪙',chance:.9}],steal:[{name:'Heilstein',icon:'💚',chance:.4,gem:'heilstein'}]},
  superboss_aether:{id:'superboss_aether',name:'Ätherwyrm Eternalis',icon:'🐉',art:'assets/creature/boss_archfiend.webp',genre:['held','fantasy','daemon'],hp:600,mp:120,atk:32,def:24,mag:30,spd:12,exp:800,gold:400,element:'licht',weak:['dunkel'],resist:['feuer','eis','blitz'],absorb:['licht'],immune:['gift'],ai:'boss',boss:true,superboss:true,staggerMax:200,skills:[{id:'aetheratem',name:'Ätheratem',pow:1.8,elem:'licht',aoe:true,mp:16},{id:'weltenzorn',name:'Weltenzorn',pow:2.2,elem:'phys',aoe:true,cd:3}],loot:[{name:'Sternenklinge',icon:'✨',chance:.35}],phases:[{at:0.4,buff:{atk:1.3},announce:'Schuppen aus reinem Äther!'}],aggroBias:2}

};

export const BATTLE_BG={
  held:'assets/bg/battle/arena-fantasy.webp',
  fantasy:'assets/bg/battle/arena-fantasy.webp',
  darkfantasy:'assets/bg/battle/arena-dark.webp',
  daemon:'assets/bg/battle/arena-daemon.webp',
  zombie:'assets/bg/battle/arena-zombie.svg',
  postapoc:'assets/bg/battle/arena-zombie.svg',
  cyberpunk:'assets/bg/battle/arena-cyber.webp',
  grey:'assets/bg/battle/arena-grey.webp',
  forest:'assets/bg/battle/arena-forest.webp',
  dungeon:'assets/bg/battle/arena-dungeon.webp'
};

export function enemyById(id){
  const e=ENEMIES[id]; if(!e)return null;
  return JSON.parse(JSON.stringify(e));
}

export function pickEncounter(S,opts={}){
  const genre=String(S.genre||S.role||'held').toLowerCase();
  const pool=Object.values(ENEMIES).filter(e=>{
    if(opts.bossOnly && !e.boss)return false;
    if(opts.noBoss && e.boss)return false;
    return (e.genre||[]).some(g=>genre.includes(g)||g===genre||(genre==='held'&&g==='fantasy')||(genre==='mensch'&&g==='fantasy'));
  });
  const normal=pool.filter(e=>!e.boss);
  const bosses=pool.filter(e=>e.boss);
  if(opts.boss || (opts.forceBoss) || (S.flags?.bossChance && Math.random()<0.08)){
    const b=bosses[Math.floor(Math.random()*bosses.length)]||normal[0];
    return b?[enemyById(b.id)]:[];
  }
  // rare spawn ~4%
  const rares=normal.filter(e=>e.rare);
  if(rares.length && Math.random()<0.04 && !opts.noRare){
    return [enemyById(rares[Math.floor(Math.random()*rares.length)].id)];
  }
  if(opts.superboss){
    const sb=pool.find(e=>e.superboss)||Object.values(ENEMIES).find(e=>e.superboss);
    return sb?[enemyById(sb.id)]:[];
  }
  const n=opts.count||(Math.random()<.55?1:Math.random()<.75?2:3);
  const out=[];
  const poolN=normal.filter(e=>!e.rare && !e.superboss);
  for(let i=0;i<n;i++){
    const e=poolN[Math.floor(Math.random()*poolN.length)];
    if(e) out.push(enemyById(e.id));
  }
  // unique instance names for multiples
  const counts={};
  for(const e of out){counts[e.id]=(counts[e.id]|0)+1; if(counts[e.id]>1) e.name=e.name+' '+String.fromCharCode(64+counts[e.id]); e._iid=e.id+'_'+iRand()}
  return out;
}
function iRand(){return Math.random().toString(36).slice(2,7)}

export function battleBgFor(S){
  const genre=String(S.genre||S.role||'held').toLowerCase();
  const ort=String(S.world?.scene?.ort||'').toLowerCase();
  if(/wald|forest|elfen/.test(ort)) return BATTLE_BG.forest;
  if(/kerker|dungeon|höhle|keller/.test(ort)) return BATTLE_BG.dungeon;
  if(BATTLE_BG[genre]) return BATTLE_BG[genre];
  if(/zombie/.test(genre)) return BATTLE_BG.zombie;
  if(/cyber/.test(genre)) return BATTLE_BG.cyberpunk;
  if(/daemon|dark/.test(genre)) return BATTLE_BG.daemon;
  if(/grey/.test(genre)) return BATTLE_BG.grey;
  return BATTLE_BG.held;
}

export default {ENEMIES,ELEMENTS,ELEM_LABEL,STATUS,BATTLE_BG,enemyById,pickEncounter,battleBgFor};
