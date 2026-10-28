/** v13 persist: atomic monotonic saves, IndexedDB + localStorage, catch-up while away */
const LS_KEY='isekai_save_v1';
const LS_META='isekai_save_meta_v1';
const IDB_NAME='isekai_db_v13';
const IDB_STORE='saves';
const REAL_TO_GAME_HOURS=1; // 1 real hour → 1 game hour (configurable)
const CATCHUP_CAP_HOURS=24*14; // max 14 game-days catch-up

let _db=null;
function openDB(){return new Promise((res,rej)=>{
  if(_db)return res(_db);
  const r=indexedDB.open(IDB_NAME,1);
  r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(IDB_STORE))db.createObjectStore(IDB_STORE)};
  r.onsuccess=()=>{_db=r.result;res(_db)};
  r.onerror=()=>rej(r.error);
})}

async function idbPut(key,val){const db=await openDB();return new Promise((res,rej)=>{
  const tx=db.transaction(IDB_STORE,'readwrite');tx.objectStore(IDB_STORE).put(val,key);
  tx.oncomplete=()=>res(true);tx.onerror=()=>rej(tx.error);
})}
async function idbGet(key){const db=await openDB();return new Promise((res,rej)=>{
  const tx=db.transaction(IDB_STORE,'readonly');const q=tx.objectStore(IDB_STORE).get(key);
  q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error);
})}

export function saveMeta(){try{return JSON.parse(localStorage.getItem(LS_META)||'{}')}catch(_){return {}}}
export function writeMeta(m){try{localStorage.setItem(LS_META,JSON.stringify(m))}catch(_){}}

/** Compact payload for storage (never drop ledger facts — archive old ones) */
export function prepareSave(S){
  if(!S)return null;
  S.saveSeq=(S.saveSeq|0)+1;
  S.turn=S.turn|0;
  S.savedAt=Date.now();
  S.lastRealAt=Date.now();
  // Archive old ledger into compact facts; keep recent full events
  if(Array.isArray(S.ledger)&&S.ledger.length>200){
    S.ledgerArchive=S.ledgerArchive||[];
    const old=S.ledger.slice(0,-120);
    for(const e of old){
      S.ledgerArchive.push({id:e.id,t:e.t,type:e.type,who:e.who,what:String(e.what||'').slice(0,120),where:e.where,importance:e.importance|0});
    }
    if(S.ledgerArchive.length>800){
      // compact further into summaries, never delete facts
      const chunk=S.ledgerArchive.splice(0,200);
      S.ledgerSummaries=S.ledgerSummaries||[];
      S.ledgerSummaries.push({from:chunk[0]?.t,to:chunk[chunk.length-1]?.t,count:chunk.length,types:[...new Set(chunk.map(c=>c.type))].slice(0,12),notable:chunk.filter(c=>(c.importance|0)>=60).slice(0,20)});
    }
    S.ledger=S.ledger.slice(-120);
  }
  // trim hist/log but keep summary
  if(S.hist&&S.hist.length>24)S.hist=S.hist.slice(-24);
  if(S.log&&S.log.length>60)S.log=S.log.slice(-60);
  if(S.summary)S.summary=String(S.summary).slice(0,1200);
  return S;
}

export async function atomicSave(S,{toast,onFail}={}){
  if(!S)return {ok:false,reason:'no state'};
  prepareSave(S);
  const seq=S.saveSeq|0, turn=S.turn|0;
  const meta=saveMeta();
  // Refuse to overwrite newer save
  if((meta.seq|0)>seq || ((meta.seq|0)===seq && (meta.turn|0)>turn)){
    return {ok:false,reason:'stale',meta};
  }
  const payload=JSON.stringify(S);
  let lsOk=false, idbOk=false, err=null;
  try{localStorage.setItem(LS_KEY,payload);lsOk=true}catch(e){
    err=e;
    // try compact further
    try{
      const c={...S,imgCache:{scenes:{},portraits:{},ok:{},fail:{},next:{}},hist:(S.hist||[]).slice(-8),log:(S.log||[]).slice(-20)};
      localStorage.setItem(LS_KEY,JSON.stringify(c));lsOk=true;
      if(toast)toast('Speicher gekürzt (wenig Platz)');
    }catch(e2){err=e2}
  }
  try{await idbPut('main',{seq,turn,savedAt:S.savedAt,data:S});idbOk=true}catch(e){err=err||e}
  if(lsOk||idbOk){
    writeMeta({seq,turn,savedAt:S.savedAt,lsOk,idbOk});
    return {ok:true,lsOk,idbOk,seq,turn};
  }
  if(onFail)onFail(err); if(toast)toast('⚠ Speichern fehlgeschlagen – Speicher voll?');
  return {ok:false,reason:'quota',err:String(err&&err.message||err)};
}

export async function loadBest(migrate){
  let candidates=[];
  try{const raw=localStorage.getItem(LS_KEY);if(raw){const s=migrate?migrate(raw):JSON.parse(raw);if(s)candidates.push({src:'ls',s,seq:s.saveSeq|0,turn:s.turn|0,savedAt:s.savedAt|0})}}catch(_){}
  try{const row=await idbGet('main');if(row?.data){const s=migrate?migrate(row.data):row.data;if(s)candidates.push({src:'idb',s,seq:s.saveSeq|0,turn:s.turn|0,savedAt:s.savedAt||row.savedAt|0})}}catch(_){}
  if(!candidates.length)return null;
  candidates.sort((a,b)=>(b.seq-a.seq)||(b.turn-a.turn)||(b.savedAt-a.savedAt));
  const best=candidates[0];
  // Refuse older if meta says newer exists and we somehow got old
  const meta=saveMeta();
  if((meta.seq|0)>best.seq || ((meta.seq|0)===best.seq && (meta.turn|0)>best.turn)){
    // try other candidate matching meta
    const match=candidates.find(c=>c.seq>=(meta.seq|0)&&c.turn>=(meta.turn|0));
    if(match)return match.s;
  }
  return best.s;
}

/** Simulate world forward for real-time away */
export function catchUp(S, hooks={}){
  if(!S)return {hours:0,summary:[]};
  const now=Date.now();
  const last=S.lastRealAt||S.savedAt||now;
  const realMs=Math.max(0,now-last);
  const rate=S.cfgCatchupRate??REAL_TO_GAME_HOURS; // game hours per real hour
  let gameHours=Math.floor((realMs/3600000)*rate);
  if(gameHours<1){S.lastRealAt=now;return {hours:0,summary:[]}}
  gameHours=Math.min(gameHours,S.cfgCatchupCap??CATCHUP_CAP_HOURS);
  const beforeLedger=(S.ledger||[]).length;
  const notes=[];
  // Batched ticks: 6h chunks
  let left=gameHours;
  while(left>0){
    const step=Math.min(left,6);
    if(hooks.advance)hooks.advance(S,step);
    else if(hooks.Sim){
      hooks.Sim.advanceCalendar(S,step,{hourly:(st)=>{try{hooks.Sim.runWorldAI(st,1)}catch(_){}}});
    }
    if(hooks.econTick)hooks.econTick(S,step);
    if(hooks.seasonTick)hooks.seasonTick(S,step);
    left-=step;
  }
  S.lastRealAt=now;
  const newEvents=(S.ledger||[]).slice(beforeLedger);
  const summary=newEvents.filter(e=>(e.importance|0)>=35).slice(0,12).map(e=>`• ${e.who}: ${e.what}`);
  if(!summary.length&&gameHours>=6)summary.push(`• ${gameHours} Stunden vergingen in der Welt.`);
  return {hours:gameHours,summary,events:newEvents};
}

export default {atomicSave,loadBest,prepareSave,catchUp,saveMeta,writeMeta};
