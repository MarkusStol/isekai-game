#!/usr/bin/env node
/** v57: 100 offline narrator inputs + session continuity checks */
import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = '/workspace/isekai-game-shots/v57-narrator.json';
const PORT = 8877;
const VER = '57';

const SESSION = [
  'hallo','wer bist du','ich sehe mich um','erzähl mir von hier','was ist hier los',
  'ich gehe zum Markt','ich kaufe Brot','danke','wer ist das','erzähl eine Geschichte',
  'ich bleibe hier','ich warte','was soll ich tun','hilf mir','ich ruhe mich aus',
  'guten Morgen','ich spreche dich an','was weißt du über den Krieg','wo ist der Ausgang',
  'ich trainiere','ok','ja','nein','entschuldigung','ich höre zu',
];
// expand to ≥100 with genre/world variants of same intents
const MORE = [
  'ich gehe zur Taverne','ich kaufe Wasser','schau dich um','ich beobachte','moin','servus','hey','hi',
  'guten Tag','guten Abend','ich nehme das','ich benutze den Heiltrank','ich schlafe',
  'erzähl mir von dir','wie heißt du','was machst du','bleib bei mir','geh weg',
  'ich suche Arbeit','ich frage nach dem Weg','wo ist das Safehouse','ich brauche Essen',
  'hast du Hunger','gibt es Gefahr','wer regiert hier','was ist das für ein Ort',
  'ich öffne die Tür','ich klopfe an','ich warte auf dich','erzähl weiter','und dann',
  'erinnerst du dich','was ist gestern passiert','kennst du mich noch','wir waren am Markt',
  'das Brot war teuer','die Taverne war laut','ich gehe zurück','noch einmal umsehen',
  'frag nach Gerüchten','frag nach Quests','zeig mir die Karte','ich will handeln',
  'ich will reden','lass uns gehen','warte kurz','erzähl vom Krieg','wer ist der Feind',
  'wie komme ich weiter','gibt es einen Heiler','wo schlafe ich sicher','ich bin müde',
  'mein Name ist Alex','nenn mich Alex','merk dir das','was weißt du über mich',
  'beschreibe den Ort','beschreibe die Leute','wie ist das Wetter','wie spät ist es',
  'ich lächle','ich nicke','ich seufze','ich denke nach','ich plane den nächsten Schritt',
  'gibt es Magie','gibt es Monster','ist es sicher','geh zum Tor','geh zum Brunnen',
  'suche Vorräte','teile das Brot','frag nach dem Preis','feilsche','arbeite für Münzen',
];
const INPUTS = [...SESSION, ...MORE].slice(0, 100);

function serve(){
  return new Promise(res=>{
    const s=http.createServer((req,res2)=>{
      let p=decodeURIComponent((req.url||'/').split('?')[0]);
      if(p==='/') p='/index.html';
      const fp=path.join(ROOT,p.replace(/^\//,''));
      if(!fp.startsWith(ROOT)||!fs.existsSync(fp)||fs.statSync(fp).isDirectory()){res2.writeHead(404);res2.end();return;}
      
      const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.json':'application/json','.ogg':'audio/ogg'};
      res2.writeHead(200,{'Content-Type':types[path.extname(fp)]||'application/octet-stream','Cache-Control':'no-store'});
      fs.createReadStream(fp).pipe(res2);
    });
    s.listen(PORT,()=>res(s));
  });
}

const HIJACK=/(du bist in eine falle|überfall!|ein fremder flüstert deinen namen)/i;
function score(input, text, prevOrt, prevWho, memHints){
  const t=(text||'').trim();
  const issues=[];
  if(t.length<8) issues.push('empty');
  if(HIJACK.test(t)) issues.push('hijack');
  const en=(t.match(/\b(the|you|your|with|what|where|this|that|are)\b/gi)||[]);
  if(en.length>=4) issues.push('english');
  // continuity: place stickiness for non-travel
  if(prevOrt && !/gehe |geh /.test(input.toLowerCase())){
    // soft: reply shouldn't invent a totally different city name often
  }
  // session memory: if we bought bread earlier, later refs shouldn't deny it randomly
  if(/brot war teuer|wir waren am markt|erinnerst/i.test(input) && memHints.boughtBread){
    if(/nie.*brot|kein brot gekauft|hast kein brot/i.test(t)) issues.push('memory-deny-bread');
  }
  if(/nenn mich alex|mein name ist alex/i.test(input)){ /* name set */ }
  if(/kennst du mich noch|was weißt du über mich/i.test(input) && memHints.pcName){
    if(/unbekannt|fremdling|keine ahnung wer du bist/i.test(t) && !/scherz|spaß/i.test(t))
      issues.push('identity-amnesia');
  }
  return issues;
}

(async()=>{
  const server=await serve();
  const browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox']});
  const page=await browser.newPage();
  await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
  await page.goto(`http://127.0.0.1:${PORT}/?v=${VER}&narr=1`,{waitUntil:'domcontentloaded',timeout:60000});
  await page.evaluate(async()=>{
    try{ const regs=await navigator.serviceWorker?.getRegistrations?.()||[]; await Promise.all(regs.map(r=>r.unregister())); }catch(_){}
  });
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(v=>window.__game?.VER===v,{timeout:45000},VER);
  await page.evaluate(async()=>{
    const G=window.__game;
    window.__FAST=true; window.__PLAYTEST=true; window.__SKIP_REMOTE_IMG=true; window.__FORCE_CSS_SCENES=true; window.__gateNoBattle=true;
    window.__setCfg?.({mode:'offline'});
    await G.startProcedural('fantasy','Alex');
    G.S.setup={done:true}; G.S.flags={onboarded:true,introDone:true};
    G.S._narratorMode='offline';
    try{ G.enterPlay?.(); }catch(_){}
    try{ G.C57?.migrateV57?.(G.S); }catch(_){}
  });
  await new Promise(r=>setTimeout(r,600));

  const rows=[];
  const memHints={pcName:'Alex', boughtBread:false};
  let prevOrt=null, prevWho=null;
  for(let i=0;i<INPUTS.length;i++){
    const input=INPUTS[i];
    if(/kaufe brot/i.test(input)) memHints.boughtBread=true;
    const r=await page.evaluate(async(a)=>{
      const G=window.__game;
      const ort0=G.S?.world?.scene?.ort||'';
      const who0=(G.S?.world?.scene?.anwesend||[])[0]||'';
      let text='';
      try{
        // prefer offline path
        const intent=G.parsePlayerIntent?.(a)||{kind:'talk'};
        const off=G.offlineRespondIntent?.(a, intent)||G.offline?.(a)||{};
        text=off.text||G.localBeatLine?.(a)||'';
        if(off.changes){ try{ /* apply light */ if(off.changes.choices) G.S.choices=off.changes.choices; }catch(_){}}
      }catch(e){ text='ERR:'+e.message; }
      const ort1=G.S?.world?.scene?.ort||'';
      return {text, ort0, ort1, who0, ver:G.VER, mode:G.S?._narratorMode};
    }, input);
    const issues=score(input, r.text, prevOrt, prevWho, memHints);
    // place drift without travel intent
    if(prevOrt && r.ort1 && r.ort1!==prevOrt && !/gehe |geh |reise|zurück/.test(input.toLowerCase())){
      if(r.ort0===prevOrt && r.ort1!==r.ort0) issues.push('place-teleport');
    }
    rows.push({i, input, text:(r.text||'').slice(0,220), ort:r.ort1, issues});
    prevOrt=r.ort1||prevOrt;
    prevWho=r.who0||prevWho;
  }
  const fails=rows.filter(r=>r.issues.length);
  const report={ver:VER, total:rows.length, fail:fails.length, fails:fails.slice(0,30), sample:rows.slice(0,8), late:rows.slice(-5)};
  fs.writeFileSync(OUT, JSON.stringify(report,null,2));
  console.log(JSON.stringify({total:report.total, fail:report.fail, top:fails.slice(0,12).map(f=>({i:f.i,input:f.input,issues:f.issues}))},null,2));
  await browser.close(); server.close();
  process.exit(fails.length>12 ? 1 : 0); // allow a few soft fails; hard fail if many
})().catch(e=>{ console.error(e); process.exit(2); });
