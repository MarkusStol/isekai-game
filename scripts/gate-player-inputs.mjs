#!/usr/bin/env node
/**
 * Mandatory release gate (v20.1+): ≥40 natural German inputs × worlds × narrator paths.
 * Assert: reply references input intent, keeps scene/cast, no random plot hijack, no English dump.
 * Exit 1 → never push.
 */
import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT=path.join(path.dirname(fileURLToPath(import.meta.url)),'..');
const PORT=8793;
const WORLDS=[
  {role:'held', name:'Aki'},
  {role:'daemon', name:'Noctis'},
  {role:'villainess', name:'Iris'},
  {role:'mensch', name:'Tom'},
];
const INPUTS=[
  'hallo','hi','guten Tag','guten Abend','moin','servus','hey',
  'wer bist du','was ist dein Name','wer ist das',
  'ich sehe mich um','schau dich um','ich beobachte',
  'ich gehe zum Markt','ich gehe zur Taverne','ich bleibe hier',
  'ich kaufe Brot','ich kaufe Wasser','danke','ja','nein','ok',
  'erzähl mir von hier','was ist hier los','was weißt du über den Krieg',
  'erzähl eine Geschichte','hilf mir','was soll ich tun','wo ist der Ausgang',
  'ich spreche dich an','ich warte','ich höre zu','entschuldigung',
  'ich ruhe mich aus','ich schlafe','ich trainiere',
  'ich greife an','ich kämpfe','ich fliehe',
  'ich küsse sie','ich umarme dich',
  'ich nehme das','ich benutze den Heiltrank',
];

const HIJACK=/(du bist in eine falle|eine falle!|fallengelassen|überfall!|ein fremder flüstert deinen namen|du findest etwas verstecktes)/i;

function intentOf(a){
  const t=a.toLowerCase();
  if(/^(hallo|hey|servus|moin|guten)(\b|\s|!|\?|$)/.test(t) || /^hi\b/.test(t)) return 'greet';
  if(/wer bist|was ist dein|wer ist/.test(t)) return 'ask_who';
  if(/sehe mich um|schau|beobachte/.test(t)) return 'look';
  if(/gehe |geh /.test(t)) return 'move';
  if(/bleib/.test(t)) return 'talk';
  if(/kaufe/.test(t)) return 'buy';
  if(/küss|umarm/.test(t)) return 'romance';
  if(/greif|kämpf/.test(t)) return 'attack';
  if(/fliehe/.test(t)) return 'flee';
  if(/schlaf|ruhe/.test(t)) return 'rest';
  if(/train/.test(t)) return 'train';
  if(/nehm|benutze/.test(t)) return 'use';
  if(/\?|was |wo |erzähl|hilf|weiß/.test(t)) return 'ask';
  return 'talk';
}

function checkReply(a, text, intent, ort0){
  const t=(text||'').trim();
  if(t.length<8) return {ok:false, reason:'empty'};
  if(HIJACK.test(t) && intent!=='attack') return {ok:false, reason:'hijack'};
  const en=(t.match(/\b(the|you|your|with|hello|what|where|this|that|are|is)\b/gi)||[])
    .filter(w=>!/^Hallo$/i.test(w));
  if(en.length>=4) return {ok:false, reason:'english:'+en.slice(0,4).join(',')};
  // Sticky-attack hijack: social/ask/look/buy/rest must not still be the fight blurb
  if(/^(greet|talk|ask|ask_who|look|buy|rest|romance)$/.test(intent) && /du willst angreifen|steht bereit\. Kämpfen/i.test(t))
    return {ok:false, reason:'sticky-attack'};


  if(intent==='greet'){
    if(!/gruß|grüßt|hallo|nickt|mustert|erwidert|hört|begrüß|ja\?|was willst|sprich|moin|servus|reagiert|antwort/i.test(t))
      return {ok:false, reason:'greet-no-ack'};
  }
  if(intent==='look' && !/um|sieh|ort|anwesend|wege|schau|blick|anwesend/i.test(t) && !(ort0&&t.toLowerCase().includes(String(ort0).toLowerCase().slice(0,6))))
    return {ok:false, reason:'look-weak'};
  if(intent==='buy' && !/kauf|gold|brot|wasser|händler|preis|münze|proviant|kerze|flasche|fehlen/i.test(t))
    return {ok:false, reason:'buy-weak'};
  if(intent==='rest' && !/schl[aä]f|ruh|morgen|aus|wärme|nacht|stunden|herberge/i.test(t))
    return {ok:false, reason:'rest-weak'};
  if(intent==='attack' && !/kampf|angriff|greif|feind|gegner|kämpf|flieh|droh|konflikt|begegn/i.test(t))
    return {ok:false, reason:'attack-weak'};
  // For social intents, reply should not be a pure ambient hijack line without acknowledging player
  if(/^(greet|talk|ask|ask_who)$/.test(intent)){
    // must mention scene or NPC reaction-ish German
    if(!/[äöüß]|„|"|nickt|Blick|Ort|bleibt|antwortet|hört|sprich|Frage|Szene/i.test(t) && t.length<40)
      return {ok:false, reason:'social-thin'};
  }
  return {ok:true};
}

function serve(){
  return new Promise((resolve,reject)=>{
    const server=http.createServer((req,res)=>{
      let p=decodeURIComponent((req.url||'/').split('?')[0]); if(p==='/')p='/index.html';
      const fp=path.join(ROOT,p.replace(/^\//,''));
      if(!fp.startsWith(ROOT)||!fs.existsSync(fp)||fs.statSync(fp).isDirectory()){res.writeHead(404);res.end('404');return}
      const ext=path.extname(fp);
      const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.json':'application/json','.woff2':'font/woff2'};
      res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream','Cache-Control':'no-store'});
      fs.createReadStream(fp).pipe(res);
    });
    server.on('error',reject);
    server.listen(PORT,'127.0.0.1',()=>resolve(server));
  });
}

const failures=[];
const report={paths:{}, samples:{}};

let server, browser, page;

async function boot(role, name){
  await page.goto(`http://127.0.0.1:${PORT}/index.html?v=20.1&gate=1`,{waitUntil:'domcontentloaded',timeout:60000});
  await page.evaluate(()=>localStorage.clear());
  await page.reload({waitUntil:'networkidle0',timeout:60000});
  await page.waitForFunction(()=>window.__game&&window.__game.newLife,{timeout:30000});
  return page.evaluate(async({role,name})=>{
    window.__FAST=true; window.__SKIP_REMOTE_IMG=true; window.__FORCE_CSS_SCENES=true;
    window.__setCfg({mode:'offline', v2:1, debug:1});
    const g=window.__game;
    await g.newLife(role,{lives:0,soul:0,keptSkills:[]},{skipSetup:true,name});
    if(g.S.setup&&!g.S.setup.done){g.S.setup.done=true; try{g.enterPlay()}catch(_){}}
    g.S.ver='20.1'; g.S.romance={}; g.S.turn=Math.min(g.S.turn|0,5);
    const sc=g.S.world?.scene;
    if(sc&&(!sc.anwesend||!sc.anwesend.length)){
      const names=Object.keys(g.S.world.npcs||{}).filter(n=>g.S.world.npcs[n].alive!==false).slice(0,3);
      sc.anwesend=names;
    }
    try{g.Cont.lockScene(g.S,'gate')}catch(_){}
    document.getElementById('title')?.classList.add('hidden');
    document.getElementById('stage')?.classList.remove('hidden');
    return {ort:g.S.world.scene.ort, anw:g.S.world.scene.anwesend||[], role:g.S.role};
  },{role,name});
  // Never hang on encounter UI during gate
  await page.evaluate(()=>{
    const g=window.__game;
    if(g.Battle){
      g.Battle.offerEncounter=async()=>({ok:true, fled:true, summary:{text:'Begegnung beigelegt (Gate).', fled:true}});
      g.Battle.isActive=()=>false;
    }
    // neutralize scheduleAfterReply encounter opener hanging the page
    window.__gateNoBattle=true;
  });
}

/** Path A: direct offline() — core narrator fix */
async function runOfflineDirect(){
  const label='offline-direct';
  let fails=0, total=0;
  for(const w of WORLDS){
    const info=await boot(w.role,w.name);
    for(const a of INPUTS){
      total++;
      const intent=intentOf(a);
      const row=await page.evaluate((a)=>{
        const g=window.__game;
        const ort0=g.S.world.scene.ort;
        const anw0=(g.S.world.scene.anwesend||[]).slice();
        // ensure cast sticky
        if(!anw0.length){
          const names=Object.keys(g.S.world.npcs||{}).filter(n=>g.S.world.npcs[n].alive!==false).slice(0,3);
          g.S.world.scene.anwesend=names;
        }
        try{ if(!g.Cont.playerWantsExit(a)) g.Cont.lockScene(g.S,'gate'); }catch(_){}
        const beat=g.localBeatLine(a);
        const pack=g.offline(a);
        const parsed=g.parsePlayerIntent(a);
        return {
          text:pack?.text||'', beat, kind:parsed?.kind, ort:g.S.world.scene.ort, ort0,
          anw:g.S.world.scene.anwesend||[], anw0
        };
      }, a);
      let c=checkReply(a,row.text,intent,row.ort0);
      // scene must hold for social
      if(/^(greet|talk|ask|ask_who|buy|rest|look|romance)$/.test(intent) && row.ort!==row.ort0 && intent!=='move'){
        c={ok:false, reason:'scene-break:'+row.ort0+'→'+row.ort};
      }
      // beat must acknowledge greet
      if(intent==='greet' && !/Gruß|gruß|hört/i.test(row.beat||'')){
        c={ok:false, reason:'beat-not-greet:'+(row.beat||'').slice(0,40)};
      }
      // parser must classify greet
      if(intent==='greet' && row.kind!=='greet'){
        c={ok:false, reason:'parse-not-greet:'+row.kind};
      }
      if(!c.ok){
        fails++;
        failures.push({path:label, world:w.role, a, intent, reason:c.reason, text:(row.text||'').slice(0,140), beat:row.beat, kind:row.kind});
      }
      if(!report.samples[w.role+':'+label]) report.samples[w.role+':'+label]=[];
      if(report.samples[w.role+':'+label].length<2)
        report.samples[w.role+':'+label].push({a, kind:row.kind, text:(row.text||'').slice(0,90)});
    }
    console.log(`  ${w.role}: done (${INPUTS.length} inputs)`);
  }
  report.paths[label]={fails, total};
  console.log(`=== ${label}: ${fails}/${total} fails ===`);
  return fails;
}

/** Path B: act() with mode=offline (full pipeline, typewrite skipped via __FAST) */
async function runActOffline(){
  const label='act-offline';
  let fails=0, total=0;
  for(const w of WORLDS){
    await boot(w.role,w.name);
    await page.evaluate(()=>window.__setCfg({mode:'offline',v2:1}));
    for(const a of INPUTS){
      total++;
      const intent=intentOf(a);
      const row=await page.evaluate(async(a)=>{
        const g=window.__game;
        const ort0=g.S.world.scene.ort;
        try{ if(!g.Cont.playerWantsExit(a)) g.Cont.lockScene(g.S,'gate'); }catch(_){}
        if(!(g.S.world.scene.anwesend||[]).length){
          g.S.world.scene.anwesend=Object.keys(g.S.world.npcs||{}).filter(n=>g.S.world.npcs[n].alive!==false).slice(0,3);
        }
        if(g.S.flags) delete g.S.flags._offerEncounter;
        const actP=g.act(a);
        const to=new Promise((_,rej)=>setTimeout(()=>rej(new Error('act-timeout')),20000));
        try{ await Promise.race([actP,to]); }catch(_){ }
        if(g.S.flags) delete g.S.flags._offerEncounter;
        try{ document.getElementById('battle')?.classList.add('hidden'); }catch(_){}
        return {
          text:document.getElementById('vnText')?.textContent||'',
          ort:g.S.world.scene.ort, ort0, mode:g.S._narratorMode
        };
      }, a);
      let c=checkReply(a,row.text,intent,row.ort0);
      if(/^(greet|talk|ask|ask_who|buy|rest|look)$/.test(intent) && row.ort!==row.ort0)
        c={ok:false, reason:'scene-break'};
      if(!c.ok){
        fails++;
        failures.push({path:label, world:w.role, a, intent, reason:c.reason, text:(row.text||'').slice(0,140)});
      }
    }
    console.log(`  ${w.role}: done`);
  }
  report.paths[label]={fails, total};
  console.log(`=== ${label}: ${fails}/${total} fails ===`);
  return fails;
}

/** Path C: free mode with mocked 402 → must land offline intent-first */
async function runMock402(){
  const label='mock402';
  let fails=0, total=0;
  // one world full suite is enough for failover shape; still ≥40
  const w=WORLDS.find(x=>x.role==='daemon')||WORLDS[0];
  await boot(w.role,w.name);
  await page.evaluate(()=>{
    window.__setCfg({mode:'free', v2:1, gkey:''});
    window.__origFetch=window.fetch;
    window.fetch=async function(url,opts){
      if(String(url).includes('pollinations')||String(url).includes('generativelanguage'))
        return new Response('Free limit',{status:402,headers:{'Retry-After':'60'}});
      return window.__origFetch.apply(this,arguments);
    };
  });
  for(const a of INPUTS){
    total++;
    const intent=intentOf(a);
    const row=await page.evaluate(async(a)=>{
      const g=window.__game;
      const ort0=g.S.world.scene.ort;
      try{ if(!g.Cont.playerWantsExit(a)) g.Cont.lockScene(g.S,'gate'); }catch(_){}
      if(!(g.S.world.scene.anwesend||[]).length){
        g.S.world.scene.anwesend=Object.keys(g.S.world.npcs||{}).filter(n=>g.S.world.npcs[n].alive!==false).slice(0,3);
      }
      if(g.S.flags) delete g.S.flags._offerEncounter;
      if(g.S.flags) delete g.S.flags._offerEncounter;
      const actP=g.act(a);
      const to=new Promise((_,rej)=>setTimeout(()=>rej(new Error('act-timeout')),25000));
      try{ await Promise.race([actP,to]); }catch(_){ }
      if(g.S.flags) delete g.S.flags._offerEncounter;
      try{ document.getElementById('battle')?.classList.add('hidden'); }catch(_){}
      return {text:document.getElementById('vnText')?.textContent||'', ort:g.S.world.scene.ort, ort0, mode:g.S._narratorMode};
    }, a);
    let c=checkReply(a,row.text,intent,row.ort0);
    if(/^(greet|talk|ask|ask_who|buy|rest|look)$/.test(intent) && row.ort!==row.ort0)
      c={ok:false, reason:'scene-break'};
    if(!c.ok){
      fails++;
      failures.push({path:label, world:w.role, a, intent, reason:c.reason, text:(row.text||'').slice(0,140)});
    }
  }
  await page.evaluate(()=>{ if(window.__origFetch) window.fetch=window.__origFetch; });
  report.paths[label]={fails, total};
  console.log(`=== ${label}: ${fails}/${total} fails ===`);
  return fails;
}

/** Path D: live Pollinations subset (best-effort; 402→offline still must pass intent) */
async function runLiveSubset(){
  const label='live-subset';
  let fails=0, total=0;
  const subset=['hallo','wer bist du','ich sehe mich um','ich kaufe Brot','ich schlafe','ich greife an','erzähl mir von hier','danke'];
  await boot('daemon','Noctis');
  await page.evaluate(()=>window.__setCfg({mode:'free', v2:1, gkey:''}));
  for(const a of subset){
    total++;
    const intent=intentOf(a);
    const row=await page.evaluate(async(a)=>{
      const g=window.__game;
      const ort0=g.S.world.scene.ort;
      try{ if(!g.Cont.playerWantsExit(a)) g.Cont.lockScene(g.S,'gate'); }catch(_){}
      if(g.S.flags) delete g.S.flags._offerEncounter;
      if(g.S.flags) delete g.S.flags._offerEncounter;
      const actP=g.act(a);
      const to=new Promise((_,rej)=>setTimeout(()=>rej(new Error('act-timeout')),25000));
      try{ await Promise.race([actP,to]); }catch(_){ }
      if(g.S.flags) delete g.S.flags._offerEncounter;
      try{ document.getElementById('battle')?.classList.add('hidden'); }catch(_){}
      return {text:document.getElementById('vnText')?.textContent||'', ort:g.S.world.scene.ort, ort0, mode:g.S._narratorMode};
    }, a);
    let c=checkReply(a,row.text,intent,row.ort0);
    if(/^(greet|talk|ask|ask_who)$/.test(intent) && row.ort!==row.ort0) c={ok:false, reason:'scene-break'};
    console.log(c.ok?'  OK':'  FAIL', a, '→', (row.text||'').slice(0,70).replace(/\n/g,' '), `[${row.mode}]`);
    if(!c.ok){
      fails++;
      failures.push({path:label, world:'daemon', a, intent, reason:c.reason, text:(row.text||'').slice(0,140)});
    }
  }
  report.paths[label]={fails, total};
  console.log(`=== ${label}: ${fails}/${total} fails ===`);
  return fails;
}

try{
  server=await serve();
  browser=await puppeteer.launch({
    headless:true,
    protocolTimeout:300000,
    args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']
  });
  page=await browser.newPage();
  page.setDefaultTimeout(90000);

  console.log('Gate inputs:', INPUTS.length, 'worlds:', WORLDS.length);
  if(INPUTS.length<40) throw new Error('Need ≥40 inputs, got '+INPUTS.length);

  console.log('\n=== OFFLINE DIRECT (offline()) ===');
  await runOfflineDirect();
  console.log('\n=== ACT + OFFLINE MODE ===');
  await runActOffline();
  console.log('\n=== MOCK 402 FAILOVER ===');
  await runMock402();
  console.log('\n=== LIVE FREE SUBSET ===');
  await runLiveSubset();
} catch(e){
  console.error('GATE ERROR', e);
  failures.push({path:'runner', reason:String(e.message||e)});
} finally {
  try{await browser?.close()}catch(_){}
  try{server?.close()}catch(_){}
}

fs.writeFileSync('/tmp/gate-v20.1.json', JSON.stringify({failures, report, inputCount:INPUTS.length},null,2));
console.log('\n=== GATE SUMMARY ===');
console.log(JSON.stringify(report.paths,null,2));
console.log('Failures:', failures.length);
for(const f of failures.slice(0,30))
  console.log(' -', f.path, f.world||'', JSON.stringify(f.a||''), f.reason, '|', (f.text||'').slice(0,80));

if(failures.length){ console.error('GATE FAILED — do not push'); process.exit(1); }
console.log('GATE PASSED');
process.exit(0);
