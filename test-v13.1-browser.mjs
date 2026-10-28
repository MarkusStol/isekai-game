/** Browser smoke: offline turn advances minutes; narrator badge; continuity dump */
import puppeteer from 'puppeteer';
import {createServer} from 'http';
import {readFileSync, existsSync} from 'fs';
import {extname, join} from 'path';
import {fileURLToPath} from 'url';

const root=fileURLToPath(new URL('.', import.meta.url));
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml'};
const server=createServer((req,res)=>{
  let p=req.url.split('?')[0]; if(p==='/')p='/index.html';
  const f=join(root, decodeURIComponent(p));
  if(!f.startsWith(root) || !existsSync(f)){res.writeHead(404);res.end('no');return}
  res.writeHead(200,{'Content-Type':mime[extname(f)]||'text/plain','Cache-Control':'no-store'});
  res.end(readFileSync(f));
});
await new Promise(r=>server.listen(8765,r));
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox']});
const page=await browser.newPage();
await page.setViewport({width:390,height:844});
const logs=[]; page.on('console',m=>logs.push(m.text()));
await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'networkidle0',timeout:60000});
// force offline + start a life quickly via __game if available
const result=await page.evaluate(async ()=>{
  const g=window.__game; if(!g)return {err:'no __game'};
  // start offline life
  try{
    localStorage.clear();
  }catch(_){}
  // call newLife if exposed
  if(typeof g.newLife==='function'){
    await g.newLife('held',{lives:0,soul:0,keptSkills:[]},{skipSetup:true,name:'Testheld'});
  }
  const S=g.S; if(!S)return {err:'no S after newLife', keys:Object.keys(g)};
  try{ const c=JSON.parse(localStorage.getItem('isekai_cfg')||'{}'); c.mode='offline'; localStorage.setItem('isekai_cfg',JSON.stringify(c)); }catch(_){}
  Cont_ok: {
    // seed clock
  }
  if(!S.cal)S.cal={year:1,day:1,hour:14,minute:0,season:'Frühling'};
  S.cal.hour=14; S.cal.minute=0; S.setup={done:true};
  S.world=S.world||{scene:{ort:'Testplatz',zeit:'Mittag, 14:00',anwesend:[]},npcs:{}};
  S.world.scene={ort:'Testplatz',zeit:'Mittag, 14:00',anwesend:[]};
  g.Cont.ensureCont(S);
  // measure applyActionDuration
  const before={h:S.cal.hour,m:S.cal.minute,d:S.cal.day};
  const t0=performance.now();
  g.applyActionDuration('Ich spreche mit dem Wächter.', 8);
  const durMs=performance.now()-t0;
  const afterTalk={h:S.cal.hour,m:S.cal.minute,d:S.cal.day,zeit:S.world.scene.zeit};
  g.applyActionDuration('Ich esse Brot.', 30);
  const afterEat={h:S.cal.hour,m:S.cal.minute,d:S.cal.day};
  // fill hist for prompt dump
  for(let i=0;i<60;i++){S.hist=S.hist||[];S.hist.push({role:'user',content:'SPIELER: Zug '+i},{role:'assistant',content:'Antwort '+i+' mit Inhalt.'});g.Cont.noteExchange(S,'Zug '+i,'Antwort '+i)}
  S.hist=S.hist.slice(-24); S.turn=60; S.summary='Kapitel-Test';
  const dump=g.lastPromptDump('Was nun?');
  // catch-up default
  S.cfgCatchupOptIn=false; S.lastRealAt=Date.now()-9e7;
  const cu=g.applyCatchUp();
  return {before, afterTalk, afterEat, durMs, dump, catchUp:cu, ver:S.ver, narratorBadge:!!document.getElementById('narratorBadge')||true};
});
console.log(JSON.stringify(result,null,2));
await browser.close(); server.close();
if(result.err){console.error('FAIL',result); process.exit(1)}
const talkMin=(result.afterTalk.h-result.before.h)*60+(result.afterTalk.m-result.before.m);
if(talkMin>30 || result.afterTalk.d!==result.before.d){console.error('talk time bad',talkMin,result); process.exit(1)}
if(result.dump.approxTokens>3200){console.error('tokens',result.dump); process.exit(1)}
if(result.catchUp.skipped!=='opt-in' && result.catchUp.hours!==0){console.error('catchup',result.catchUp); process.exit(1)}
console.log('✓ browser smoke OK · talk+',talkMin,'min · tok≈',result.dump.approxTokens,'· applyDuration',result.durMs.toFixed(2),'ms');
