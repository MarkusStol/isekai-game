#!/usr/bin/env node
/**
 * v20 content QA: offline path (long), Gemini-mock, Pollinations when available.
 * Measures first-visible-text; asserts no hang on 402.
 */
import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT=8775;
const OUT='/tmp/v20-qa-report.json';

function serve(){
  return new Promise(res=>{
    const server=http.createServer((req,res2)=>{
      let p=decodeURIComponent((req.url||'/').split('?')[0]);
      if(p==='/')p='/index.html';
      const fp=path.join(ROOT,p.replace(/^\//,''));
      if(!fp.startsWith(ROOT)||!fs.existsSync(fp)||fs.statSync(fp).isDirectory()){res2.writeHead(404);res2.end('404');return}
      const ext=path.extname(fp);
      const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.json':'application/json'};
      res2.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream','Cache-Control':'no-store'});
      fs.createReadStream(fp).pipe(res2);
    });
    server.listen(PORT,()=>res(server));
  });
}

const ACTIONS=[
  'Ich sehe mich um.','Ich spreche Lyra an.','Was weißt du über den Bruch?',
  'Erzähl mir von den Aetherkristallen.','Wer bist du wirklich?',
  'Ich frage nach Sternengeistern.','Was sind die Einsatzregeln?',
  'Ich ruhe mich kurz aus.','Ich gehe zur Tür.','Hilf mir die Grenzwoge zu verstehen.',
  'Was ist dein Beruf?','Ich beobachte den Raum.','Erzähl mir von gestern Abend.',
  'Gibt es hier Gefahr?','Ich lächle und warte.','Zeig mir den Weg zum Markt.',
  'Ich trainiere einen Augenblick.','Ich bedanke mich höflich.',
  'Was sollte ich wissen, bevor ich gehe?','Ich schaue zum Fenster hinaus.',
  'Sprich über die Einsatzregeln.','Ich frage Brok nach Gerüchten.',
  'Bleib hier — ich höre zu.','Ich prüfe meine Ausrüstung.',
  'Was bedeutet der Bruch für dich?','Ich nicke und schweige einen Moment.',
  'Führt ein Weg zur Halle?','Ich bitte um einen Rat.',
  'Erzähl von den Aetherkristallen noch einmal.','Ich bleibe sitzen.',
];

const server=await serve();
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox']});
const page=await browser.newPage();
await page.setViewport({width:390,height:844});
page.setDefaultTimeout(25000);

await page.goto(`http://127.0.0.1:${PORT}/index.html?v=20`,{waitUntil:'networkidle0'});
await page.evaluate(()=>localStorage.clear());
await page.reload({waitUntil:'networkidle0'});

async function boot(mode){
  return page.evaluate(async(mode)=>{
    const g=window.__game;
    window.__FAST=true; window.__SKIP_REMOTE_IMG=true; window.__FORCE_CSS_SCENES=true;
    window.__setCfg?.({mode, debug:1, v2:1, gkey: mode==='gemini-mock' ? '' : (mode==='gemini'?'x':'') });
    // for gemini-mock we stay on free but intercept later
    const cfgMode = mode==='gemini-mock' ? 'offline' : mode;
    window.__setCfg?.({mode: cfgMode, debug:1, v2:1});
    await g.newLife('held',{lives:0,soul:0,keptSkills:[]},{skipSetup:true,name:'Aki'});
    if(g.S.setup&&!g.S.setup.done){g.S.setup.done=true;g.S.ver='20';g.enterPlay()}
    g.S.ver='20';
    g.S.world.scene={ort:'Taverne „Zum Silberkelch“',anwesend:['Lyra','Wirt Brok'],phase:'Abend',zeit:'Abend'};
    g.S.world.npcs=g.S.world.npcs||{};
    g.S.world.npcs.Lyra=g.S.world.npcs.Lyra||{name:'Lyra',art:'Wachsame Kundschafterin',ort:'Taverne „Zum Silberkelch“',alive:true,e:'🗡️',erinnerung:[]};
    g.S.world.npcs['Wirt Brok']=g.S.world.npcs['Wirt Brok']||{name:'Wirt Brok',art:'Derber Wirt',ort:'Taverne „Zum Silberkelch“',alive:true,e:'🍺',erinnerung:[]};
    try{g.Cont.lockScene(g.S,'qa')}catch(_){}
    try{g.Know?.markMet?.(g.S,'Lyra')}catch(_){}
    document.getElementById('title')?.classList.add('hidden');
    document.getElementById('stage')?.classList.remove('hidden');
    return {ort:g.S.world.scene.ort, mode:cfgMode};
  }, mode);
}

async function runTurns(label, n, {mock402=false, mockGemini=false}={}){
  const rows=[];
  if(mock402){
    await page.evaluate(()=>{
      window.__origFetch=window.fetch;
      window.fetch=async function(url, opts){
        if(String(url).includes('pollinations')){
          return new Response('Free limit reached: wait 30 seconds',{status:402, headers:{'Retry-After':'30'}});
        }
        return window.__origFetch.apply(this,arguments);
      };
      // open gate? force free mode
      window.__setCfg?.({mode:'free',v2:1});
    });
  }
  if(mockGemini){
    await page.evaluate(()=>{
      const g=window.__game;
      // mock hasKey + gemini
      window.__setCfg?.({mode:'free', gkey:'mock-key', v2:1});
      g.gemini=async function(a,el){
        const t0=performance.now();
        await new Promise(r=>setTimeout(r,120)); // pretend TTFT
        const text=`Lyra hält den Blick. „${String(a).slice(0,48)}“ — sie tippt aufs Holz. Die Szene bleibt in der Taverne. Brok poliert ein Glas. „Aetherkristalle lügen nicht,“ sagt sie. „Dein Beruf, deine Regeln.“`;
        if(el) el.textContent=text;
        g.S._ttft=Math.round(performance.now()-t0);
        return {text, changes:{choices:['Weiter fragen','Umsehen','Gehen'], xp:5}};
      };
      // force hasKey by cfg.gkey already set — freeStream raceSecondary checks hasKey()
      // Also trip gate so we skip pollinations and hit secondary
      // Simulate by making pollinations 402
      window.__origFetch=window.__origFetch||window.fetch;
      window.fetch=async function(url, opts){
        if(String(url).includes('pollinations')){
          return new Response('Free limit reached',{status:402, headers:{'Retry-After':'30'}});
        }
        return window.__origFetch.apply(this,arguments);
      };
    });
  }

  for(let i=0;i<n;i++){
    const a=ACTIONS[i%ACTIONS.length];
    const r=await page.evaluate(async(a)=>{
      const g=window.__game;
      const el=document.getElementById('vnText');
      const t0=performance.now();
      let firstVisible=null;
      // observe first non-empty change after act starts
      const prev=el.textContent;
      const obs=new MutationObserver(()=>{
        const cur=el.textContent||'';
        if(firstVisible==null && cur && cur!==prev && cur.length>2) firstVisible=performance.now()-t0;
      });
      obs.observe(el,{childList:true,characterData:true,subtree:true});
      try{
        await g.act(a);
      }catch(e){
        obs.disconnect();
        return {err:e.message, ms:performance.now()-t0};
      }
      obs.disconnect();
      const text=el.textContent||'';
      const total=performance.now()-t0;
      if(firstVisible==null && text && text!==prev) firstVisible=total;
      const scene=g.S.world?.scene?.ort||'';
      const anw=(g.S.world?.scene?.anwesend||[]).slice();
      const mode=g.S._narratorMode||'';
      // continuity checks
      const inventedArrival=/tritt ein|kommt herein|erscheint plötzlich|betritt die/i.test(text);
      const echo=text.trim().startsWith(a.trim()) || (text.includes('„'+a) && text.indexOf('„'+a)<5);
      return {
        ttft:firstVisible, total, text:text.slice(0,160), scene, anw, mode,
        inventedArrival, echo, len:text.length,
        beatMs:g.S._beatMs, failover:g.S._failoverReason||null
      };
    }, a);
    rows.push({i,a,...r});
    const flag=(r.total>2500?'HANG ':r.inventedArrival?'ARR ':r.echo?'ECHO ':'')||'';
    console.log(`${label} #${i+1} ttft=${Math.round(r.ttft??-1)} total=${Math.round(r.total??-1)} ${flag}${r.mode} ${(r.text||'').slice(0,50).replace(/\n/g,' ')}`);
  }
  // restore fetch
  await page.evaluate(()=>{ if(window.__origFetch) window.fetch=window.__origFetch; });
  return rows;
}

const report={offline:[], mock402:[], geminiMock:[], freeLive:[], issues:[]};

console.log('\n--- OFFLINE (30 turns) ---');
await boot('offline');
report.offline=await runTurns('off', 30);

console.log('\n--- MOCK 402→offline failover (8 turns) ---');
await boot('free');
report.mock402=await runTurns('402', 8, {mock402:true});

console.log('\n--- GEMINI-MOCK failover (8 turns) ---');
await boot('offline');
report.geminiMock=await runTurns('gem', 8, {mockGemini:true});

console.log('\n--- POLLINATIONS live (up to 6, may 402) ---');
await boot('free');
report.freeLive=await runTurns('live', 6);

function summarize(rows, name){
  const ttfts=rows.map(r=>r.ttft).filter(x=>x!=null);
  const totals=rows.map(r=>r.total).filter(x=>x!=null);
  const hangs=rows.filter(r=>r.total>2500).length;
  const empty=rows.filter(r=>!r.text||r.len<8).length;
  const arr=rows.filter(r=>r.inventedArrival).length;
  const echo=rows.filter(r=>r.echo).length;
  const maxTtft=ttfts.length?Math.max(...ttfts):null;
  const maxTotal=totals.length?Math.max(...totals):null;
  const s={name, n:rows.length, hangs, empty, arr, echo, maxTtft, maxTotal,
    avgTtft:ttfts.length?ttfts.reduce((a,b)=>a+b,0)/ttfts.length:null};
  console.log('SUM', s);
  if(hangs) report.issues.push(`${name}: ${hangs} hangs >2.5s`);
  if(empty) report.issues.push(`${name}: ${empty} empty`);
  if(arr) report.issues.push(`${name}: ${arr} invented arrivals`);
  if(maxTtft!=null && maxTtft>2000) report.issues.push(`${name}: max TTFT ${Math.round(maxTtft)}ms >2s`);
  return s;
}

report.summary=[
  summarize(report.offline,'offline'),
  summarize(report.mock402,'mock402'),
  summarize(report.geminiMock,'geminiMock'),
  summarize(report.freeLive,'freeLive'),
];

fs.writeFileSync(OUT, JSON.stringify(report,null,2));
console.log('\nISSUES', report.issues);
await browser.close(); server.close();
process.exit(report.issues.filter(x=>/hangs|empty/.test(x)).length?1:0);
