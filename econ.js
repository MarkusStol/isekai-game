/** v13 economy + seasons + farming + kingdom */
import { ledgerPush, seasonOf, blankCalendar } from './sim.js';

export function blankFinance(){
  return {wallet:0,bank:0,debt:0,interestRate:0.02,income:[],expenses:[],stockpile:{grain:0,wood:0,ore:0,iron:0,food:0,cloth:0},rent:0,employees:[]};
}
export function blankKingdom(name='Aldheim'){
  return {name,treasury:500,resources:{grain:200,wood:150,ore:80,iron:40},population:1200,taxRate:0.1,army:40,armyUpkeep:8,
    tradeRoutes:[{to:'Nachbarreich',goods:'grain',active:true}],stability:70,policies:{trade:'offen',war:'friedlich',welfare:'mittel'},lastTickDay:0};
}
export function blankFarm(){
  return {plots:[],livestock:[],tools:['Hacke'],water:50,lastWeather:'klar'};
}

export function ensureEcon(S){
  if(!S.finance){S.finance=blankFinance();S.finance.wallet=S.st?.gold|0}
  if(!S.kingdom)S.kingdom=blankKingdom(S.world?.lore?.politik?.slice?.(0,40)||S.role||'Reich');
  if(!S.farm)S.farm=blankFarm();
  if(!S.cal)S.cal=blankCalendar(S.time||{});
  // sync wallet <-> gold loosely
  if(S.st&&S.finance){S.finance.wallet=S.st.gold|0}
  return S;
}

const CROPS={
  weizen:{plant:['Frühling'],grow:8,yield:5,water:1},
  kartoffel:{plant:['Frühling','Sommer'],grow:6,yield:6,water:1},
  kräuter:{plant:['Frühling','Sommer','Herbst'],grow:4,yield:3,water:1},
  kürbis:{plant:['Sommer'],grow:10,yield:7,water:2},
  winterroggen:{plant:['Herbst'],grow:14,yield:5,water:1}
};

export function seasonWeather(S){
  const season=S.cal?.season||seasonOf(S.cal?.day||1);
  const table={Frühling:['regen','klar','wind','regen'],Sommer:['klar','heiß','klar','gewitter'],Herbst:['nebel','regen','klar','wind'],Winter:['schnee','frost','klar','sturm']};
  const w=(table[season]||['klar'])[Math.floor(Math.random()*4)];
  S.farm.lastWeather=w;
  return w;
}

export function plantCrop(S,cropId,plotIdx){
  ensureEcon(S);
  const crop=CROPS[cropId]; if(!crop)return {ok:false,text:'Unbekannte Frucht.'};
  const season=S.cal?.season||'Frühling';
  if(!crop.plant.includes(season))return {ok:false,text:`${cropId} wird in ${season} nicht gepflanzt (nur ${crop.plant.join(', ')}).`};
  if(!S.home?.owned||(S.home.stage|0)<3)return {ok:false,text:'Brauchst Garten/Haus Stufe 3+.'};
  S.farm.plots=S.farm.plots||[];
  const plot={id:'p'+(S.farm.plots.length+1),crop:cropId,plantedDay:S.cal.day,plantedYear:S.cal.year,growDays:crop.grow,progress:0,watered:0,ready:false};
  if(plotIdx!=null&&S.farm.plots[plotIdx])S.farm.plots[plotIdx]=plot; else S.farm.plots.push(plot);
  ledgerPush(S,{type:'farm',who:S.pc?.name,what:`Pflanzt ${cropId}.`,where:S.home.location,importance:25,emotion:'hoffnungsvoll'});
  return {ok:true,text:`Du pflanzt ${cropId}. Wachstum ~${crop.grow} Tage.`};
}

export function waterCrops(S){
  ensureEcon(S);
  let n=0; for(const p of(S.farm.plots||[])){if(!p.ready){p.watered=(p.watered|0)+1;n++}}
  S.farm.water=Math.max(0,(S.farm.water|0)-n);
  return {ok:true,text:n?`Du wässerst ${n} Beet(e).`:'Nichts zu wässern.'};
}

export function harvestReady(S){
  ensureEcon(S);
  const got=[];
  for(const p of(S.farm.plots||[])){
    if(p.ready||p.progress>=p.growDays){
      const crop=CROPS[p.crop]||{yield:3}; let y=crop.yield;
      if((p.watered|0)<2)y=Math.max(1,y-2);
      if(S.farm.lastWeather==='frost')y=Math.max(0,y-3);
      got.push({name:p.crop,amount:y});
      S.finance.stockpile.food=(S.finance.stockpile.food|0)+y;
      S.finance.stockpile.grain=(S.finance.stockpile.grain|0)+(/weizen|roggen/.test(p.crop)?y:0);
      p.ready=false;p.crop=null;p.progress=0;
    }
  }
  S.farm.plots=(S.farm.plots||[]).filter(p=>p.crop);
  if(got.length)ledgerPush(S,{type:'farm',who:S.pc?.name,what:`Ernte: ${got.map(g=>g.amount+'× '+g.name).join(', ')}.`,where:S.home?.location,importance:40,emotion:'stolz'});
  return {ok:true,got,text:got.length?`Ernte: ${got.map(g=>g.amount+'× '+g.name).join(', ')}.`:'Nichts reif.'};
}

/** Advance farm by hours */
export function farmTick(S,hours){
  ensureEcon(S);
  const days=hours/24;
  if(days<=0)return;
  if(Math.random()<days)seasonWeather(S);
  for(const p of(S.farm.plots||[])){
    if(!p.crop)continue;
    let rate=1;
    if(S.farm.lastWeather==='dürre'||S.farm.lastWeather==='heiß')rate*=(p.watered>0?0.9:0.5);
    if(S.farm.lastWeather==='frost')rate*=0.3;
    if(S.farm.lastWeather==='regen')rate*=1.1;
    p.progress=(p.progress||0)+days*rate;
    if(p.progress>=p.growDays)p.ready=true;
  }
  // spoilage of food stockpile in summer heat / slow in winter
  const season=S.cal?.season;
  if(season==='Sommer'&&(S.finance.stockpile.food|0)>0&&Math.random()<days*0.15){
    const lose=Math.min(S.finance.stockpile.food,1+Math.floor(Math.random()*3));
    S.finance.stockpile.food-=lose;
    if(lose)ledgerPush(S,{type:'farm',who:'Lager',what:`${lose} Nahrung verdorben (Hitze).`,where:S.home?.location||'Lager',importance:20,emotion:'ärgerlich'});
  }
  // livestock
  for(const a of(S.farm.livestock||[])){a.days=(a.days|0)+days; if(a.type==='huhn'&&a.days>=1){a.days=0;S.finance.stockpile.food=(S.finance.stockpile.food|0)+1}}
}

export function personalFinanceTick(S,hours){
  ensureEcon(S);
  const days=hours/24; if(days<=0)return;
  // interest on debt weekly-ish
  if(S.finance.debt>0){S.finance.debt=Math.round((S.finance.debt*(1+S.finance.interestRate*(days/7)))*100)/100}
  // rent
  if(S.finance.rent>0){const cost=S.finance.rent*days; withdraw(S,cost,'Miete');}
  // food expense if no stockpile
  const foodNeed=days*1.5;
  if((S.finance.stockpile.food|0)>=foodNeed)S.finance.stockpile.food-=foodNeed;
  else {
    const buy=Math.ceil(foodNeed-(S.finance.stockpile.food|0));S.finance.stockpile.food=0;
    const price=Math.round(buy*3*regionalPrice(S,'food'));
    withdraw(S,price,'Essen');
  }
  // employee wages
  for(const e of(S.finance.employees||[])){withdraw(S,(e.wage|0)*days,'Lohn: '+e.name)}
  // bank interest tiny
  if(S.finance.bank>0)S.finance.bank=Math.round(S.finance.bank*(1+0.005*(days/7))*100)/100;
  syncGold(S);
}

export function withdraw(S,amount,reason){
  ensureEcon(S); amount=Math.max(0,Math.round(amount));
  if(amount<=0)return;
  if((S.finance.wallet|0)>=amount){S.finance.wallet-=amount}
  else if((S.finance.bank|0)>=amount){S.finance.bank-=amount}
  else {const short=amount-(S.finance.wallet|0)-(S.finance.bank|0);S.finance.wallet=0;S.finance.bank=0;S.finance.debt=(S.finance.debt|0)+short}
  S.finance.expenses.push({t:S.cal?.day,reason,amount}); if(S.finance.expenses.length>40)S.finance.expenses=S.finance.expenses.slice(-40);
  syncGold(S);
}
export function deposit(S,amount,to='wallet'){
  ensureEcon(S); amount=Math.max(0,Math.round(amount));
  if(to==='bank')S.finance.bank=(S.finance.bank|0)+amount; else S.finance.wallet=(S.finance.wallet|0)+amount;
  S.finance.income.push({t:S.cal?.day,reason:'Einzahlung',amount}); syncGold(S);
}
export function syncGold(S){if(S.st)S.st.gold=Math.max(0,S.finance.wallet|0)}
export function takeLoan(S,amount){
  ensureEcon(S); amount=Math.round(amount);
  S.finance.debt=(S.finance.debt|0)+amount; S.finance.wallet=(S.finance.wallet|0)+amount; syncGold(S);
  ledgerPush(S,{type:'finance',who:S.pc?.name,what:`Kredit +${amount} (Schuld nun ${S.finance.debt}).`,where:S.world?.scene?.ort,importance:40,emotion:'besorgt'});
  return {ok:true,text:`Du nimmst ${amount} Gold Kredit. Zinsen ${(S.finance.interestRate*100).toFixed(1)}%/Woche.`};
}
export function bankDeposit(S,amount){
  ensureEcon(S); amount=Math.min(amount|0,S.finance.wallet|0);
  S.finance.wallet-=amount; S.finance.bank=(S.finance.bank|0)+amount; syncGold(S);
  return {ok:true,text:`${amount} Gold auf die Bank.`};
}

export function regionalPrice(S,good){
  ensureEcon(S);
  const season=S.cal?.season||'Sommer';
  let m=1;
  if(good==='food'||good==='grain'){if(season==='Winter')m*=1.4; if(season==='Herbst')m*=0.85; if((S.kingdom.resources.grain|0)<50)m*=1.6}
  if(good==='wood'&&(S.kingdom.resources.wood|0)<40)m*=1.3;
  if((S.kingdom.stability|0)<40)m*=1.25;
  return m;
}

export function kingdomTick(S,hours){
  ensureEcon(S);
  const days=hours/24; if(days<=0)return;
  const k=S.kingdom;
  const day=S.cal?.day|0;
  const before=k.treasury|0;
  // Balanced: tax scales with population; army upkeep milder so treasury can recover
  const tax=Math.max(1, Math.round(k.population*k.taxRate*0.08*days));
  const upkeep=Math.max(0, Math.round((k.armyUpkeep|0)*(k.army|0)/20*days));
  let trade=0;
  for(const r of(k.tradeRoutes||[])){if(!r.active)continue;trade+=Math.round(4*days);k.resources.grain=Math.max(0,(k.resources.grain|0)-1)}
  k.treasury=before+tax-upkeep+trade;
  // resources drift
  k.resources.grain=Math.max(0,(k.resources.grain|0)-Math.round(k.population/200*days)+Math.round(5*days*(S.cal?.season==='Herbst'?2:S.cal?.season==='Winter'?0.3:1)));
  k.resources.wood=Math.max(0,(k.resources.wood|0)+Math.round(2*days)-(k.army>60?1:0));
  k.resources.ore=Math.max(0,(k.resources.ore|0)+Math.round(1*days));
  k.resources.iron=Math.max(0,(k.resources.iron|0)+Math.floor((k.resources.ore|0)/20));
  // stability
  if(k.treasury<0){k.stability=Math.max(0,k.stability-2*days)}
  if(k.resources.grain<30){k.stability=Math.max(0,k.stability-3*days);
    if(Math.random()<days*0.2)ledgerPush(S,{type:'kingdom',who:k.name,what:'Hungersnot-Gerüchte. Preise steigen.',where:'Reich',importance:70,emotion:'ängstlich'});
  }
  if(k.taxRate>0.25)k.stability=Math.max(0,k.stability-1*days);
  if(k.stability>80&&k.treasury>200)k.population=Math.round(k.population+(days*0.5));
  if(k.stability<25&&Math.random()<days*0.1){
    ledgerPush(S,{type:'kingdom',who:k.name,what:'Unruhen in den Straßen!',where:'Hauptstadt',importance:80,emotion:'wütend'});
    k.stability+=5;k.treasury-=20;
  }
  // Floor/ceiling after all mutations; always mark tick
  k.treasury=Math.max(-500, Math.min(50000, k.treasury|0));
  if(k.treasury!==before){
    k._lastDelta={tax,upkeep,trade,before,after:k.treasury,days};
  }
  k.lastTickDay=day;
}

export function setTax(S,rate){
  ensureEcon(S); S.kingdom.taxRate=Math.max(0,Math.min(0.4,+rate||0.1));
  ledgerPush(S,{type:'kingdom',who:S.pc?.name||'Regent',what:`Steuer auf ${(S.kingdom.taxRate*100).toFixed(0)}% gesetzt.`,where:'Hof',importance:45,emotion:'entschlossen'});
  return {ok:true,text:`Steuersatz: ${(S.kingdom.taxRate*100).toFixed(0)}%.`};
}



/* ===== v32 market sim: supply/demand by region, season, events ===== */
const GOOD_CAT={
  brot:'food', eintopf:'food', bier:'food', trank:'potion', äther:'potion', antidot:'potion', elixier:'potion',
  dolch:'weapon', schwert:'weapon', schild:'armor', umhang:'armor', fackel:'misc', seil:'misc',
  karte:'travel', feder:'rare', ring:'rare', luftschiff_ticket:'travel', raum:'service',
};
const REGION_BIAS={
  harbor:{food:0.9, potion:1.05, weapon:1.1, travel:0.85, rare:1.15},
  market:{food:0.95, potion:1.0, weapon:1.0, armor:0.95, misc:0.9},
  village:{food:0.85, potion:1.15, weapon:1.2, rare:1.3},
  guild:{weapon:0.9, armor:0.9, potion:1.05, food:1.1},
  wild:{food:1.25, potion:1.3, weapon:1.15, travel:1.2},
  default:{food:1, potion:1, weapon:1, armor:1, misc:1, rare:1.1, travel:1, service:1},
};
function regionKind(ort){
  const s=String(ort||'').toLowerCase();
  if(/hafen|küste|werft|bucht|kai/.test(s)) return 'harbor';
  if(/markt|bazar|handels/.test(s)) return 'market';
  if(/dorf|weiler|bauern/.test(s)) return 'village';
  if(/gilde|söldner|wache|burg/.test(s)) return 'guild';
  if(/wald|moor|ruine|höhle|wüste|berg/.test(s)) return 'wild';
  return 'default';
}
export function blankMarket(){
  return {
    goods:{}, // id -> {supply, demand, base}
    events:[], // {id,label,mult,untilDay,cats:[]}
    lastTickDay:0,
    lastSeason:'',
  };
}
export function ensureMarket(S){
  ensureEcon(S);
  if(!S.market) S.market=blankMarket();
  if(!S.market.goods) S.market.goods={};
  if(!S.market.events) S.market.events=[];
  // seed defaults once
  const seeds={food:40, potion:20, weapon:12, armor:12, misc:25, rare:6, travel:8, service:15};
  for(const [k,v] of Object.entries(seeds)){
    if(!S.market.goods[k]) S.market.goods[k]={supply:v, demand:v, base:1};
  }
  return S.market;
}
function seasonMult(season, cat){
  const s=season||'Sommer';
  if(cat==='food'){
    if(s==='Winter') return 1.35;
    if(s==='Herbst') return 0.88;
    if(s==='Frühling') return 1.05;
    return 0.95;
  }
  if(cat==='potion'){
    if(s==='Winter') return 1.15;
    if(s==='Sommer') return 0.95;
  }
  if(cat==='travel'){
    if(s==='Winter') return 1.25;
    if(s==='Sommer') return 0.9;
  }
  return 1;
}
export function pushMarketEvent(S,{id,label,mult,days,cats}){
  const m=ensureMarket(S);
  const until=(S.cal?.day|1)+(days|3);
  m.events=m.events.filter(e=>e.id!==id);
  m.events.push({id,label,mult:mult||1.2,untilDay:until,cats:cats||['food']});
  try{ ledgerPush(S,{type:'market',who:'Markt',what:label||id,where:S.world?.scene?.ort,importance:50,emotion:'unruhig'}); }catch(_){}
}

/** v33: derive market shocks from world ledger news (not only RNG) */
export function marketFromLedger(S){
  const m=ensureMarket(S);
  const led=(S.ledger||[]).slice(-24);
  const day=S.cal?.day|1;
  const seen=new Set((m.events||[]).map(e=>e.id));
  const rules=[
    {re:/überfall|raid|bandit|plünder|karawane.*(überfall|geraubt)|händler.*(tot|tot)/i, id:'ledger_raid', label:'Ledger: Überfall auf Händler', mult:1.35, days:4, cats:['weapon','food']},
    {re:/hunger|hungersnot|vorrat.*(knapp|leer)|ernte.*(fehl|miss)/i, id:'ledger_famine', label:'Ledger: Hunger-Gerüchte', mult:1.4, days:6, cats:['food']},
    {re:/karawane trifft|handelsschiff|lieferung|markt.*voll|ernte.*(gut|reich)/i, id:'ledger_caravan', label:'Ledger: Lieferung trifft ein', mult:0.88, days:3, cats:['misc','food','travel']},
    {re:/seuche|infekt|plage|krankheit|quarantäne/i, id:'ledger_plague', label:'Ledger: Seuchenangst', mult:1.45, days:5, cats:['potion']},
    {re:/fest|feier|festival|hochzeit|turnier/i, id:'ledger_fest', label:'Ledger: Fest inflates Preise', mult:1.18, days:2, cats:['food','service']},
    {re:/unruhen|aufstand|revolte|protest|streik/i, id:'ledger_unrest', label:'Ledger: Unruhen', mult:1.25, days:4, cats:['weapon','armor']},
    {re:/frost|schneesturm|eiszeit|wintereinbruch/i, id:'ledger_frost', label:'Ledger: Kältewelle', mult:1.3, days:5, cats:['food','travel']},
    {re:/krieg|belagerung|mobilmachung|armee zieht/i, id:'ledger_war', label:'Ledger: Kriegsnachfrage', mult:1.4, days:7, cats:['weapon','armor']},
  ];
  let added=0;
  for(const e of led){
    const blob=String(e.what||e.text||'')+' '+String(e.type||'');
    for(const r of rules){
      if(seen.has(r.id)) continue;
      if(r.re.test(blob)){
        // Don't re-ledger (pushMarketEvent would) — insert quietly
        m.events=m.events.filter(x=>x.id!==r.id);
        m.events.push({id:r.id,label:r.label,mult:r.mult,untilDay:day+(r.days|3),cats:r.cats, fromLedger:true});
        seen.add(r.id); added++;
        break;
      }
    }
  }
  return added;
}

export function marketTick(S, hours){
  const m=ensureMarket(S);
  const days=(hours||0)/24; if(days<=0) return;
  const season=S.cal?.season||'Sommer';
  const day=S.cal?.day|1;
  // expire events
  m.events=(m.events||[]).filter(e=>(e.untilDay|0)>=day);
  // seasonal shock once per season change
  if(m.lastSeason && m.lastSeason!==season){
    if(season==='Winter') pushMarketEvent(S,{id:'winter_food',label:'Wintervorräte knapper',mult:1.3,days:10,cats:['food']});
    if(season==='Herbst') pushMarketEvent(S,{id:'harvest',label:'Ernte drückt Preise',mult:0.85,days:8,cats:['food']});
  }
  m.lastSeason=season;
  // Ledger-driven shocks first (actual world news)
  try{ marketFromLedger(S); }catch(_){}
  // Soft RNG only if ledger was quiet
  const hasLedgerEv=(m.events||[]).some(e=>e.fromLedger && (e.untilDay|0)>=day);
  if(!hasLedgerEv && Math.random()<days*0.06){
    const pool=[
      {id:'caravan',label:'Karawane trifft ein',mult:0.9,days:3,cats:['misc','rare','travel']},
      {id:'raid',label:'Überfall auf Händler',mult:1.35,days:4,cats:['weapon','food']},
      {id:'plague',label:'Seuchenangst',mult:1.4,days:5,cats:['potion']},
      {id:'festival',label:'Fest inflates Bier',mult:1.2,days:2,cats:['food','service']},
    ];
    const e=pool[Math.floor(Math.random()*pool.length)];
    pushMarketEvent(S,e);
  }
  // supply/demand drift toward equilibrium, affected by kingdom stock
  for(const [cat,g] of Object.entries(m.goods)){
    let targetSup=g.base*20;
    if(cat==='food') targetSup=20+Math.min(40,(S.kingdom?.resources?.grain|0)/5);
    if(cat==='weapon'||cat==='armor') targetSup=10+Math.min(20,(S.kingdom?.resources?.iron|0)/2);
    // mean-revert
    g.supply=Math.max(1, g.supply+(targetSup-g.supply)*0.15*days);
    g.demand=Math.max(1, g.demand+(g.base*18-g.demand)*0.1*days + (Math.random()-0.5)*2*days);
    // hunger / heat bump demand
    if(cat==='food' && (S.needs?.hunger|0)>60) g.demand+=days*3;
    if(cat==='weapon' && (S.heat|0)>40) g.demand+=days*2;
  }
  m.lastTickDay=day;
}
/** Price multiplier for a shop item id in current region */
export function marketPriceMult(S, itemId, ort){
  const m=ensureMarket(S);
  const cat=GOOD_CAT[itemId]||GOOD_CAT[String(itemId||'').toLowerCase()]||'misc';
  const g=m.goods[cat]||{supply:20,demand:20,base:1};
  const ratio=g.demand/Math.max(1,g.supply); // >1 scarce
  let mult=Math.pow(ratio, 0.55); // dampen
  mult*=seasonMult(S.cal?.season, cat);
  const rk=regionKind(ort||S.world?.scene?.ort);
  const bias=(REGION_BIAS[rk]||REGION_BIAS.default)[cat];
  if(bias) mult*=bias;
  // kingdom scarcity
  try{ mult*=regionalPrice(S, cat==='food'?'food':cat==='weapon'?'ore':'food')*0.5+0.5; }catch(_){}
  // events
  for(const e of(m.events||[])){
    if((e.cats||[]).includes(cat)) mult*=e.mult||1;
  }
  // genre
  const gen=S.genre||S.role||'';
  if(gen==='zombie' && (cat==='food'||cat==='weapon')) mult*=1.35;
  if(gen==='cyberpunk' && (cat==='rare'||cat==='travel')) mult*=1.2;
  return Math.max(0.55, Math.min(2.4, mult));
}
export function marketBuy(S, itemId, qty){
  const m=ensureMarket(S);
  const cat=GOOD_CAT[itemId]||'misc';
  if(m.goods[cat]){ m.goods[cat].supply=Math.max(0,m.goods[cat].supply-(qty||1)); m.goods[cat].demand+=0.5*(qty||1); }
}
export function marketSell(S, itemId, qty){
  const m=ensureMarket(S);
  const cat=GOOD_CAT[itemId]||'misc';
  if(m.goods[cat]){ m.goods[cat].supply+=(qty||1); m.goods[cat].demand=Math.max(1,m.goods[cat].demand-0.3*(qty||1)); }
}
export function marketStatusLine(S){
  const m=ensureMarket(S);
  const ev=(m.events||[]).map(e=>e.label).slice(0,2).join('; ');
  const food=m.goods.food; const ratio=food? (food.demand/Math.max(1,food.supply)):1;
  const tag=ratio>1.3?'knapp':ratio<0.85?'überreich':'ausgeglichen';
  return `Markt (${regionKind(S.world?.scene?.ort)}): Nahrung ${tag}`+(ev?` · ${ev}`:'');
}


export function econHourly(S,hours){
  personalFinanceTick(S,hours);
  farmTick(S,hours);
  kingdomTick(S,hours);
  try{ marketTick(S,hours); }catch(_){}
}

export {CROPS};
export default {ensureEcon,blankFinance,blankKingdom,blankFarm,plantCrop,waterCrops,harvestReady,farmTick,personalFinanceTick,kingdomTick,econHourly,regionalPrice,takeLoan,bankDeposit,deposit,withdraw,setTax,syncGold,CROPS,seasonWeather,ensureMarket,blankMarket,marketTick,marketPriceMult,marketBuy,marketSell,marketStatusLine,pushMarketEvent,marketFromLedger};
