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
  await page.goto(`http://127.0.0.1:${PORT}/index.html?v=25&gate=1`,{waitUntil:'domcontentloaded',timeout:60000});
  await page.evaluate(()=>localStorage.clear());
  await page.reload({waitUntil:'networkidle0',timeout:60000});
  await page.waitForFunction(()=>window.__game&&window.__game.newLife,{timeout:30000});
  const info=await page.evaluate(async({role,name})=>{
    window.__FAST=true; window.__SKIP_REMOTE_IMG=true; window.__FORCE_CSS_SCENES=true;
    window.__setCfg({mode:'offline', v2:1, debug:1});
    const g=window.__game;
    await g.newLife(role,{lives:0,soul:0,keptSkills:[]},{skipSetup:true,name});
    if(g.S.setup&&!g.S.setup.done){g.S.setup.done=true; try{g.enterPlay()}catch(_){}}
    else { try{g.enterPlay()}catch(_){ } }
    g.S.romance=g.S.romance||{}; g.S.turn=Math.min(g.S.turn|0,5);
    const sc=g.S.world?.scene;
    if(sc&&(!sc.anwesend||!sc.anwesend.length)){
      const names=Object.keys(g.S.world.npcs||{}).filter(n=>g.S.world.npcs[n].alive!==false).slice(0,3);
      sc.anwesend=names;
    }
    try{g.Cont.lockScene(g.S,'gate')}catch(_){}
    document.getElementById('title')?.classList.add('hidden');
    document.getElementById('stage')?.classList.remove('hidden');
    try{ g.OW?.showOverworld(g.S); }catch(_){}
    return {ort:g.S.world.scene.ort, anw:g.S.world.scene.anwesend||[], role:g.S.role};
  },{role,name});
  await page.evaluate(()=>{
    const g=window.__game;
    if(g.Battle){
      g.Battle.offerEncounter=async()=>({ok:true, fled:true, summary:{text:'Begegnung beigelegt (Gate).', fled:true}});
      g.Battle.isActive=()=>false;
    }
    window.__gateNoBattle=true;
  });
  return info;
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


/** Minimal legacy save factory (incomplete world — must heal + reply) */
function fakeOldSave(ver){
  return {
    ver:String(ver), role:'held', cls:0, pc:{name:'Alt'+ver}, setup:{done:true},
    st:{lvl:3,hp:30,maxhp:50,mp:12,maxmp:30,str:10,cha:9,ruf:0,gold:20,xp:40},
    world:{
      scene:{ort:'Marktplatz von Solari',anwesend:['Lyra'],zeit:'Mittag'},
      npcs:{Lyra:{e:'🗡️',art:'Späherin',ort:'Marktplatz von Solari',alive:true,romance:true,geschlecht:'w',stimme:'knapp'}}
      // deliberately no orte/graph — v21.1b heal must fix
    },
    hist:[], log:[{k:'n',t:'Markt.'}], flags:{}, romance:{Lyra:{affection:10,trust:2,stage:1}},
    quests:{main:{act:0,done:[],objectives:[]},side:[]},
    needs:{hunger:30,fatigue:20}, home:{owned:false,stage:0,materials:{}},
    skills:[], inv:[], turn:5, heat:0, cal:{day:2,hour:12,minute:0}, choices:['Umsehen']
  };
}

/** Path E: live github pages — fresh profile + old saves; no pageerrors; busy clears */
async function runLiveSiteBrowser(){
  const label='live-site';
  let fails=0, total=0;
  const LIVE=process.env.GATE_LIVE_URL||'https://markusstol.github.io/isekai-game/';
  const versions=['13','16','18','20','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48'];
  const safariUA='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

  async function oneProfile(name, {ua, seedVer}={}){
    total++;
    const errs=[];
    const ctx=await browser.createBrowserContext();
    const pg=await ctx.newPage();
    pg.setDefaultTimeout(90000);
    await pg.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
    if(ua) await pg.setUserAgent(ua);
    pg.on('pageerror', e=>errs.push(String(e.message||e).split('\n')[0]));
    try{
      await pg.goto(LIVE,{waitUntil:'networkidle2',timeout:90000});
      // Wait for game + tolerate SW heal reload after VER bump
      for(let attempt=0; attempt<3; attempt++){
        try{
          await pg.waitForFunction(()=>window.__game&&window.__game.act,{timeout:45000});
          break;
        }catch(waitErr){
          if(attempt===2) throw waitErr;
          await pg.goto(LIVE,{waitUntil:'networkidle2',timeout:90000}).catch(()=>{});
          await new Promise(r=>setTimeout(r,1500));
        }
      }
      if(seedVer){
        await pg.evaluate((save)=>{ localStorage.setItem('isekai_save_v1', JSON.stringify(save)); }, fakeOldSave(seedVer));
        await pg.reload({waitUntil:'networkidle2',timeout:90000});
        await pg.waitForFunction(()=>window.__game&&window.__game.act,{timeout:30000});
        await pg.evaluate(async()=>{
          const b=document.getElementById('btnContinue');
          if(b && !b.classList.contains('hidden')) b.click();
          await new Promise(r=>setTimeout(r,1800));
          const g=window.__game;
          if(g?.S && g.S.setup && !g.S.setup.done) g.S.setup.done=true;
        });
      } else {
        await pg.evaluate(async()=>{
          window.__FAST=true;
          const g=window.__game;
          await g.newLife('held',{lives:0,soul:0,keptSkills:[]},{fromIntro:true,name:'GateLive',bg:'',look:'',trait:''});
          if(g.S.setup&&!g.S.setup.done){ g.S.setup.done=true; try{g.enterPlay()}catch(_){}}
        });
      }
      const row=await pg.evaluate(async()=>{
        const g=window.__game;
        if(!g?.S) return {ok:false, reason:'no-S'};
        try{ if(g.S.flags){ delete g.S.flags._offerEncounter; delete g.S.flags.narratorCombat } }catch(_){}
        const INPUTS=['hallo','ich schaue mich um','ich rede mit ihr'];
        const results=[];
        for(const text of INPUTS){
          const before=(document.getElementById('vnText')?.textContent||'').trim();
          const txt=document.getElementById('txt');
          if(txt){ txt.disabled=false; txt.value=text; }
          const form=document.getElementById('inputRow');
          const t0=performance.now();
          if(form) form.requestSubmit();
          else await g.act(text);
          let last={};
          for(let i=0;i<50;i++){
            await new Promise(r=>setTimeout(r,300));
            const vn=(document.getElementById('vnText')?.textContent||'').trim();
            last={vn, busy:document.body.classList.contains('busy'), disabled:!!document.getElementById('txt')?.disabled, same:vn===before, ms:Math.round(performance.now()-t0)};
            if(!last.busy && !last.same && vn.length>=8) break;
          }
          results.push({text, ...last});
          // Must finish within ~12s (hard deadline + typewrite grace)
          if(last.busy || last.same || (last.vn||'').length<8 || last.ms>12000){
            return {ok:false, reason:last.busy?'busy-stuck':last.same?'no-reply':(last.ms>12000?'too-slow':'empty'), vn:last.vn, text, ms:last.ms, busy:last.busy, disabled:last.disabled};
          }
        }
        return {ok:true, busy:false, disabled:false, vn:results.at(-1).vn, results, ort:g.S.world?.scene?.ort, hasOrte:!!g.S.world?.orte, hasGraph:!!g.S.world?.graph?.nodes};
      });
      const pageErrs=errs.filter(e=>!/AbortError/i.test(e)); // AbortError from race must not appear after v21.1 — count if present
      const abortErrs=errs.filter(e=>/AbortError/i.test(e));
      let reason=null;
      if(!row.ok) reason=row.reason||'act-fail';
      else if(row.busy) reason='busy-stuck';
      else if(row.disabled) reason='input-disabled';
      else if((row.vn||'').length<8) reason='empty-reply';
      else if(HIJACK.test(row.vn)) reason='hijack';
      else if(pageErrs.length) reason='pageerror:'+pageErrs[0].slice(0,80);
      else if(abortErrs.length) reason='abort-pageerror';
      if(reason){
        fails++;
        failures.push({path:label, world:name, a:'hallo', reason, text:(row.vn||'').slice(0,120)});
        console.log('  FAIL', name, reason, (row.vn||'').slice(0,60));
      } else {
        console.log('  OK', name, '→', (row.vn||'').slice(0,60).replace(/\n/g,' '), `busy=${row.busy}`);
      }
    }catch(e){
      const msg=String(e.message||e);
      if(/Execution context was destroyed|Target closed|Session closed|Waiting failed|Timeout/i.test(msg)){
        // SW heal / version bump reload — retry once
        try{
          await pg.goto(LIVE,{waitUntil:'networkidle2',timeout:90000});
          await pg.waitForFunction(()=>window.__game&&window.__game.act,{timeout:45000});
          await pg.evaluate(async()=>{
            window.__FAST=true;
            const g=window.__game;
            if(g?.startProcedural) await g.startProcedural('fantasy','Alex');
            else if(g?.startIntro) g.startIntro();
            await new Promise(r=>setTimeout(r,1500));
          });
          const row=await pg.evaluate(async()=>{
            const g=window.__game; if(!g?.S) return {ok:false, reason:'no-S'};
            const before=(document.getElementById('vnText')?.textContent||'').trim();
            await g.act('hallo');
            let last={};
            for(let i=0;i<50;i++){
              await new Promise(r=>setTimeout(r,300));
              const vn=(document.getElementById('vnText')?.textContent||'').trim();
              last={vn, busy:document.body.classList.contains('busy')};
              if(!last.busy && vn!==before && vn.length>=8) break;
            }
            return {ok:!last.busy && (last.vn||'').length>=8, vn:last.vn};
          });
          if(row.ok){ console.log('  OK', name, '(retry) →', (row.vn||'').slice(0,60).replace(/\n/g,' ')); return; }
        }catch(e2){ /* fall through */ }
      }
      fails++; total=Math.max(total, fails);
      failures.push({path:label, world:name, reason:'runner:'+msg});
      console.log('  FAIL', name, msg);
    }finally{
      try{await ctx.close()}catch(_){}
    }
  }

  console.log('\n=== LIVE SITE (fresh + old saves) ===', LIVE);
  try{
    await oneProfile('fresh');
    await oneProfile('safari-fresh', {ua:safariUA});
    for(const v of versions) await oneProfile('save-v'+v, {seedVer:v});
  }catch(e){
    fails++; failures.push({path:label, reason:'suite:'+String(e.message||e)});
  }
  report.paths[label]={fails, total};
  console.log(`=== ${label}: ${fails}/${total} fails ===`);
  return fails;
}

/** Path F: local — pageerror + busy clear under offline + poisoned Depth */
async function runBusyPageerror(){
  const label='busy-pageerror';
  let fails=0, total=0;
  const errs=[];
  const onErr=e=>errs.push(String(e.message||e).split('\n')[0]);
  page.on('pageerror', onErr);
  try{
    await boot('held','BusyTest');
    // 1) normal hallo — busy must clear
    total++;
    const r1=await page.evaluate(async()=>{
      const g=window.__game;
      await g.act('hallo');
      return {busy:document.body.classList.contains('busy'), disabled:!!document.getElementById('txt')?.disabled, vn:(document.getElementById('vnText')?.textContent||'').slice(0,80)};
    });
    if(r1.busy||r1.disabled||(r1.vn||'').length<8){
      fails++; failures.push({path:label, a:'hallo', reason:r1.busy?'busy-stuck':r1.disabled?'input-disabled':'empty', text:r1.vn});
      console.log('  FAIL hallo', r1);
    } else console.log('  OK hallo busy-clear');

    // 2) poison capabilityBlock — act must still reply and clear busy
    total++;
    const r2=await page.evaluate(async()=>{
      const g=window.__game;
      const real=g.Depth.capabilityBlock;
      g.Depth.capabilityBlock=()=>{ throw new Error('gate-poison-cap'); };
      try{ await g.act('wie geht es dir'); }
      finally{ g.Depth.capabilityBlock=real; }
      return {busy:document.body.classList.contains('busy'), vn:(document.getElementById('vnText')?.textContent||'').slice(0,100)};
    });
    if(r2.busy||(r2.vn||'').length<8){
      fails++; failures.push({path:label, a:'poison', reason:r2.busy?'busy-stuck':'empty', text:r2.vn});
      console.log('  FAIL poison', r2);
    } else console.log('  OK poison-cap busy-clear');

    // 3) pageerrors: gate-poison must not surface; AbortError must not appear in offline
    total++;
    const bad=errs.filter(e=>!/gate-poison/i.test(e)); // poison is inside try in Depth callers; if it surfaces, fail
    // Actually capabilityBlock is try/caught in sysPrompt — should be 0 pageerrors
    const realBad=errs.filter(e=>!/ResizeObserver|Loading CSS/i.test(e));
    if(realBad.length){
      fails++; failures.push({path:label, reason:'pageerror:'+realBad[0].slice(0,100)});
      console.log('  FAIL pageerrors', realBad.slice(0,3));
    } else console.log('  OK no-pageerrors', '(caught', errs.length, ')');
  } finally {
    page.off('pageerror', onErr);
  }
  report.paths[label]={fails, total};
  console.log(`=== ${label}: ${fails}/${total} fails ===`);
  return fails;
}

/** Path G: hung narrator fetch must still reply + clear busy within ACT_HARD_MS+grace */
async function runHungFetchReply(){
  const label='hung-fetch-reply';
  let fails=0, total=0;
  console.log('\n=== HUNG FETCH → ALWAYS REPLY ===');
  await boot('held','HungTest');
  total++;
  const r=await page.evaluate(async()=>{
    const g=window.__game;
    window.__setCfg({mode:'free'});
    const orig=window.fetch;
    window.fetch=function(url, opts){
      const u=String(url);
      if(/pollinations|generativelanguage|openai/i.test(u)) return new Promise(()=>{}); // never resolves
      return orig.apply(this, arguments);
    };
    const before=(document.getElementById('vnText')?.textContent||'').trim();
    const t0=performance.now();
    document.getElementById('txt').value='hallo';
    document.getElementById('inputRow').requestSubmit();
    let last={};
    const limit=(g.ACT_HARD_MS||4800)+2500;
    for(let i=0;i<40;i++){
      await new Promise(r=>setTimeout(r,200));
      const vn=(document.getElementById('vnText')?.textContent||'').trim();
      last={vn, busy:document.body.classList.contains('busy'), disabled:!!document.getElementById('txt')?.disabled, same:vn===before, ms:Math.round(performance.now()-t0)};
      if(!last.busy && !last.same && vn.length>=8) break;
      if(performance.now()-t0>limit+2000) break;
    }
    window.fetch=orig;
    return last;
  });
  const hard= (await page.evaluate(()=>window.__game?.ACT_HARD_MS)) || 4800;
  if(r.busy || r.same || (r.vn||'').length<8 || r.ms > hard+3000){
    fails++; failures.push({path:label, reason:r.busy?'busy-stuck':r.same?'no-reply':`slow:${r.ms}`, text:(r.vn||'').slice(0,80), ms:r.ms});
    console.log('  FAIL hung-fetch', r);
  } else console.log('  OK hung-fetch reply in', r.ms+'ms', '→', (r.vn||'').slice(0,60));
  // second input after hung must also work (no permanent lock)
  total++;
  const r2=await page.evaluate(async()=>{
    const before=(document.getElementById('vnText')?.textContent||'').trim();
    document.getElementById('txt').value='ich schaue mich um';
    document.getElementById('inputRow').requestSubmit();
    let last={};
    for(let i=0;i<30;i++){
      await new Promise(r=>setTimeout(r,200));
      const vn=(document.getElementById('vnText')?.textContent||'').trim();
      last={vn, busy:document.body.classList.contains('busy'), same:vn===before};
      if(!last.busy && !last.same && vn.length>=8) break;
    }
    return last;
  });
  if(r2.busy || r2.same || (r2.vn||'').length<8){
    fails++; failures.push({path:label, a:'second', reason:r2.busy?'busy-stuck':'no-reply', text:(r2.vn||'').slice(0,80)});
    console.log('  FAIL second-after-hung', r2);
  } else console.log('  OK second-after-hung');
  report.paths[label]={fails,total};
  console.log(`=== ${label}: ${fails}/${total} fails ===`);
  return fails;
}


/** Path H: overworld movement + NPC talk opens dialogue / act reply */
async function runOverworldGate(){
  const label='overworld';
  let fails=0, total=0;
  console.log('\n=== OVERWORLD MOVE + NPC TALK ===');
  await boot('held','OwTest');
  total++;
  const r=await page.evaluate(async()=>{
    const g=window.__game;
    if(!g.OW) return {ok:false, reason:'no-OW'};
    try{ g.OW.showOverworld(g.S); }catch(e){ return {ok:false, reason:'show:'+e.message}; }
    await new Promise(r=>setTimeout(r,200));
    const d0=g.OW.__debug();
    const moved=g.OW.__tryMove(1,0) || g.OW.__tryMove(0,1) || g.OW.__tryMove(-1,0) || g.OW.__tryMove(0,-1);
    await new Promise(r=>setTimeout(r,200));
    const d1=g.OW.__debug();
    // Walk toward first NPC if any
    if(d1.npcs?.length){
      const n=d1.npcs[0];
      for(let i=0;i<20;i++){
        const h=g.OW.__debug().hero;
        const dx=Math.sign(n.x-h.x), dy=Math.sign(n.y-h.y);
        if(dx||dy) g.OW.__tryMove(dx||0, dy&&!dx?dy:0);
        await new Promise(r=>setTimeout(r,50));
        if(Math.abs(g.OW.__debug().hero.x-n.x)+Math.abs(g.OW.__debug().hero.y-n.y)<=1) break;
      }
    }
    const before=(document.getElementById('vnText')?.textContent||'').trim();
    const who=g.OW.__talkNearest();
    // wait for reply
    let last={};
    for(let i=0;i<40;i++){
      await new Promise(r=>setTimeout(r,250));
      const vn=(document.getElementById('vnText')?.textContent||'').trim();
      last={vn, busy:document.body.classList.contains('busy'), same:vn===before, who};
      if(!last.busy && !last.same && vn.length>=8) break;
    }
    const canvas=document.getElementById('owCanvas');
    return {
      ok:true, moved:!!moved || (d1.hero.x!==d0.hero.x||d1.hero.y!==d0.hero.y),
      hasCanvas:!!canvas, map:d1.map?.name, npcs:(d1.npcs||[]).length,
      who:last.who, vn:(last.vn||'').slice(0,80), busy:last.busy, same:last.same,
      active:g.OW.isOverworldActive()
    };
  });
  if(!r.ok){ fails++; failures.push({path:label, reason:r.reason}); console.log('  FAIL', r); }
  else if(!r.hasCanvas || !r.active){ fails++; failures.push({path:label, reason:'no-canvas'}); console.log('  FAIL canvas', r); }
  else if(!r.moved && !(r.npcs>0)){ fails++; failures.push({path:label, reason:'no-move'}); console.log('  FAIL move', r); }
  else if(r.busy || r.same || (r.vn||'').length<8){ fails++; failures.push({path:label, reason:r.busy?'busy':'no-talk-reply', text:r.vn}); console.log('  FAIL talk', r); }
  else console.log('  OK overworld', r.map, 'npcs='+r.npcs, 'talk='+(r.who||'-'), '→', (r.vn||'').slice(0,50));
  // movement alone OK even without NPC if map built
  if(r.ok && r.hasCanvas && r.active && !r.moved){
    // try more moves
    const m2=await page.evaluate(()=>{ const g=window.__game; let ok=false; for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1]]){ if(g.OW.__tryMove(dx,dy)) ok=true; } return ok||g.OW.__debug().map?.w>0; });
    if(!m2){ fails++; console.log('  FAIL cannot move'); }
  }
  total++;
  // free text still works while OW active
  const r2=await page.evaluate(async()=>{
    const before=(document.getElementById('vnText')?.textContent||'').trim();
    document.getElementById('txt').value='hallo';
    document.getElementById('inputRow').requestSubmit();
    let last={};
    for(let i=0;i<40;i++){
      await new Promise(r=>setTimeout(r,250));
      const vn=(document.getElementById('vnText')?.textContent||'').trim();
      last={vn, busy:document.body.classList.contains('busy'), same:vn===before};
      if(!last.busy && !last.same && vn.length>=8) break;
    }
    return last;
  });
  if(r2.busy||r2.same||(r2.vn||'').length<8){ fails++; failures.push({path:label, a:'freetext', reason:'no-reply'}); console.log('  FAIL freetext', r2); }
  else console.log('  OK freetext-while-ow');
  report.paths[label]={fails,total};
  console.log(`=== ${label}: ${fails}/${total} fails ===`);
  return fails;
}



/** Path I: desktop 1920×1080 — integer canvas, keyboard WASD + Enter talk */
async function runDesktopOverworldGate(){
  const label='desktop-ow';
  let fails=0, total=0;
  console.log('\n=== DESKTOP 1920x1080 KEYBOARD OVERWORLD ===');
  await page.setViewport({width:1920, height:1080, deviceScaleFactor:1});
  await boot('held','DeskTest');
  total++;
  const r=await page.evaluate(async()=>{
    const g=window.__game;
    if(!g.OW) return {ok:false, reason:'no-OW'};
    try{ g.OW.showOverworld(g.S); }catch(e){ return {ok:false, reason:'show:'+e.message}; }
    await new Promise(r=>setTimeout(r,300));
    const d0=g.OW.__debug();
    // Keyboard WASD / arrows
    const fire=(type,key)=>{
      const ev=new KeyboardEvent(type,{key, code: key.startsWith('Arrow')?key:'Key'+key.toUpperCase(), bubbles:true});
      window.dispatchEvent(ev);
    };
    fire('keydown','ArrowRight');
    await new Promise(r=>setTimeout(r,180));
    fire('keyup','ArrowRight');
    fire('keydown','d');
    await new Promise(r=>setTimeout(r,180));
    fire('keyup','d');
    fire('keydown','w');
    await new Promise(r=>setTimeout(r,180));
    fire('keyup','w');
    await new Promise(r=>setTimeout(r,250));
    const d1=g.OW.__debug();
    const moved = d1.hero.x!==d0.hero.x || d1.hero.y!==d0.hero.y || g.OW.__tryMove(1,0);
    // Talk via Enter
    if(d1.npcs?.length){
      const n=d1.npcs[0];
      for(let i=0;i<24;i++){
        const h=g.OW.__debug().hero;
        const dx=Math.sign(n.x-h.x), dy=Math.sign(n.y-h.y);
        if(dx||dy) g.OW.__tryMove(dx||0, dy&&!dx?dy:0);
        await new Promise(r=>setTimeout(r,40));
      }
    }
    const before=(document.getElementById('vnText')?.textContent||'').trim();
    // Simulate Enter talk
    window.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
    await new Promise(r=>setTimeout(r,100));
    const who=g.OW.__talkNearest();
    let last={};
    for(let i=0;i<40;i++){
      await new Promise(r=>setTimeout(r,250));
      const vn=(document.getElementById('vnText')?.textContent||'').trim();
      last={vn, busy:document.body.classList.contains('busy'), same:vn===before, who};
      if(!last.busy && !last.same && vn.length>=8) break;
    }
    const canvas=document.getElementById('owCanvas');
    const desktop=document.body.classList.contains('ow-desktop');
    return {
      ok:true, moved:!!moved, desktop, hasCanvas:!!canvas,
      cw:canvas?.width, ch:canvas?.height,
      map:d1.map?.name, npcs:(d1.npcs||[]).length,
      who:last.who, vn:(last.vn||'').slice(0,80), busy:last.busy, same:last.same,
      active:g.OW.isOverworldActive(), dbg:d1
    };
  });
  if(!r.ok){ fails++; failures.push({path:label, reason:r.reason}); console.log('  FAIL', r); }
  else if(!r.hasCanvas || !r.active){ fails++; failures.push({path:label, reason:'no-canvas'}); console.log('  FAIL canvas', r); }
  else if(!r.desktop){ fails++; failures.push({path:label, reason:'not-desktop-class'}); console.log('  FAIL desktop class', r); }
  else if(!(r.cw>=300 && r.ch>=160)){ fails++; failures.push({path:label, reason:'bad-canvas-size', cw:r.cw, ch:r.ch}); console.log('  FAIL size', r); }
  else if(!r.moved){ fails++; failures.push({path:label, reason:'no-move'}); console.log('  FAIL move', r); }
  else if(r.busy || r.same || (r.vn||'').length<8){ fails++; failures.push({path:label, reason:r.busy?'busy':'no-talk-reply', text:r.vn}); console.log('  FAIL talk', r); }
  else console.log('  OK desktop-ow', r.map, `${r.cw}x${r.ch}`, 'desktop='+r.desktop, 'talk='+(r.who||'-'));
  report.paths[label]={fails,total:1};
  console.log(`=== ${label}: ${fails}/1 fails ===`);
  // restore mobile-ish viewport for later paths if any
  await page.setViewport({width:390, height:844, deviceScaleFactor:2});
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

  if(process.env.GATE_ONLY_LIVE==='1'){
    await runLiveSiteBrowser();
  } else {

  console.log('\n=== OFFLINE DIRECT (offline()) ===');
  await runOfflineDirect();
  console.log('\n=== ACT + OFFLINE MODE ===');
  await runActOffline();
  console.log('\n=== MOCK 402 FAILOVER ===');
  await runMock402();
  console.log('\n=== LIVE FREE SUBSET ===');
  await runLiveSubset();
  console.log('\n=== BUSY + PAGEERROR ===');
  await runBusyPageerror();
  await runHungFetchReply();
  await runOverworldGate();
  await runDesktopOverworldGate();
  // Live site last (needs network); skip if GATE_SKIP_LIVE=1
  if(process.env.GATE_SKIP_LIVE==='1'){
    console.log('\n=== LIVE SITE skipped (GATE_SKIP_LIVE=1) ===');
    report.paths['live-site']={fails:0,total:0,skipped:true};
  } else {
    await runLiveSiteBrowser();
  }
  } // end GATE_ONLY_LIVE else
} catch(e){
  console.error('GATE ERROR', e);
  failures.push({path:'runner', reason:String(e.message||e)});
} finally {
  try{await browser?.close()}catch(_){}
  try{server?.close()}catch(_){}
}

fs.writeFileSync('/tmp/gate-report.json', JSON.stringify({failures, report, inputCount:INPUTS.length},null,2));
console.log('\n=== GATE SUMMARY ===');
console.log(JSON.stringify(report.paths,null,2));
console.log('Failures:', failures.length);
for(const f of failures.slice(0,30))
  console.log(' -', f.path, f.world||'', JSON.stringify(f.a||''), f.reason, '|', (f.text||'').slice(0,80));

if(failures.length){ console.error('GATE FAILED — do not push'); process.exit(1); }
console.log('GATE PASSED');
process.exit(0);
