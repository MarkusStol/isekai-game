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

export function econHourly(S,hours){
  personalFinanceTick(S,hours);
  farmTick(S,hours);
  // kingdom less frequent: every call still ok with days fraction
  kingdomTick(S,hours);
}

export {CROPS};
export default {ensureEcon,blankFinance,blankKingdom,blankFarm,plantCrop,waterCrops,harvestReady,farmTick,personalFinanceTick,kingdomTick,econHourly,regionalPrice,takeLoan,bankDeposit,deposit,withdraw,setTax,syncGold,CROPS,seasonWeather};
