#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'https://pollinations.ai/p/';
const STYLE = 'anime style illustration, high quality, detailed, no text, no watermark, no logo';
const LOG = path.join(ROOT, 'scripts/gen-log.jsonl');

function hash(s){ let h=0; for(const c of s) h=((h<<5)-h)+c.charCodeAt(0)|0; return Math.abs(h)%99991+1 }
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)) }

function jobs(){
  const out=[];
  const add=(kind,rel,prompt,w,h)=>out.push({kind,path:rel,prompt:prompt+', '+STYLE,w,h,seed:hash(rel)});
  // HELD BGs day/night
  const heldBgs=[
    ['beschwoerungshalle-abend','fantasy summoning hall marble palace torches evening ceremonial circle vertical'],
    ['beschwoerungshalle-tag','fantasy summoning hall marble palace daylight stained glass vertical'],
    ['beschwoerungshalle-nacht','fantasy summoning hall moonlit empty circle night vertical'],
    ['beschwoerungshalle-morgen','fantasy summoning hall dawn soft light incense vertical'],
    ['markt-tag','anime fantasy medieval market plaza sunny banners spices vertical'],
    ['markt-nacht','anime fantasy medieval market night lanterns vertical'],
    ['markt-abend','anime fantasy medieval market sunset vertical'],
    ['elfenwald-nacht','anime glowing elf forest night bioluminescent vertical'],
    ['elfenwald-tag','anime sunlit elf forest ancient trees vertical'],
    ['hafen-tag','anime fantasy harbor ships seagulls daylight vertical'],
    ['hafen-nacht','anime fantasy harbor night lanterns vertical'],
    ['thron-abend','anime royal throne hall purple banners evening vertical'],
    ['thron-tag','anime royal throne hall daylight grandeur vertical'],
    ['thron-nacht','anime royal throne hall night candlelight vertical'],
    ['taverne-abend','anime cozy fantasy tavern warm fire evening vertical'],
    ['taverne-nacht','anime fantasy tavern late night candles vertical'],
    ['nordwall-tag','anime fortress northern wall snow mountains day vertical'],
    ['nordwall-nacht','anime fortress wall snow night aurora vertical'],
    ['palastgarten-tag','anime palace garden fountain hedges daylight vertical'],
    ['palastgarten-nacht','anime palace garden moonlight fountain vertical'],
    ['unterstadt-tag','anime fantasy undercity alleys market day vertical'],
    ['unterstadt-nacht','anime fantasy undercity alleys lanterns night vertical'],
  ];
  for(const [s,p] of heldBgs) add('bg',`assets/bg/held/${s}.webp`,p,512,896);

  const zombieBgs=[
    ['parkplatz-abend','post apocalypse empty parking lot sunset abandoned cars anime vertical'],
    ['parkplatz-nacht','zombie apocalypse parking lot night fog anime vertical'],
    ['safehouse-nacht','anime boarded safehouse interior candlelight night vertical'],
    ['safehouse-tag','anime fortified safehouse daylight barricades vertical'],
    ['stadt-tag','anime ruined city street daylight overgrown vertical'],
    ['stadt-nacht','anime ruined city night fires distant vertical'],
    ['mall-abend','anime abandoned shopping mall evening vertical'],
    ['waldlager-tag','anime survivor camp forest daylight tents vertical'],
  ];
  for(const [s,p] of zombieBgs) add('bg',`assets/bg/zombie/${s}.webp`,p,512,896);

  const cyberBgs=[
    ['neon-gasse','anime cyberpunk neon alley rain night vertical'],
    ['neon-gasse-tag','anime cyberpunk alley daylight holographic ads vertical'],
    ['club-nacht','anime cyberpunk nightclub neon interior vertical'],
    ['dach-nacht','anime cyberpunk rooftop city lights night vertical'],
    ['lab-tag','anime cyberpunk laboratory chrome daylight vertical'],
    ['markt-nacht','anime cyberpunk night market stalls neon vertical'],
    ['wohnblock-abend','anime cyberpunk apartment block evening vertical'],
    ['bahn-nacht','anime cyberpunk maglev station night vertical'],
  ];
  for(const [s,p] of cyberBgs) add('bg',`assets/bg/cyberpunk/${s}.webp`,p,512,896);

  const darkBgs=[
    ['asche-thron','dark fantasy ash throne hall crimson anime vertical'],
    ['asche-thron-nacht','dark fantasy ruined throne night blood moon vertical'],
    ['kathedrale-nacht','dark fantasy ruined cathedral night vertical'],
    ['sumpf-abend','dark fantasy cursed swamp evening mist vertical'],
    ['kerker-nacht','dark fantasy dungeon torchlit vertical'],
    ['friedhof-nacht','dark fantasy graveyard fog night vertical'],
    ['burg-tag','dark fantasy bleak castle daylight grey vertical'],
    ['opferaltar-nacht','dark fantasy ritual altar night candles vertical'],
  ];
  for(const [s,p] of darkBgs) add('bg',`assets/bg/darkfantasy/${s}.webp`,p,512,896);

  const postBgs=[
    ['wueste-tag','anime post apocalypse desert ruins daylight vertical'],
    ['wueste-nacht','anime desert ruins night stars vertical'],
    ['bunker-tag','anime underground bunker fluorescent vertical'],
    ['bunker-nacht','anime bunker red emergency lights vertical'],
    ['bruecke-abend','anime collapsed bridge evening dust vertical'],
    ['oasis-tag','anime desert oasis settlement day vertical'],
  ];
  for(const [s,p] of postBgs) add('bg',`assets/bg/postapoc/${s}.webp`,p,512,896);

  const greyBgs=[
    ['bahnhof-nebel','foggy victorian train station greymourne mysterious anime muted vertical'],
    ['bahnhof-nebel-nacht','foggy train station night gaslamps greymourne vertical'],
    ['zugabteil','vintage train compartment foggy windows mysterious anime vertical'],
    ['zugabteil-nacht','train compartment night dim lamp mysterious vertical'],
    ['gasse-nebel','foggy cobblestone alley gaslamp greymourne vertical'],
    ['gasthaus-abend','foggy inn interior evening greymourne vertical'],
    ['kirche-nebel','foggy old church greymourne muted vertical'],
    ['hafen-nebel','foggy harbor greymourne muted tones vertical'],
  ];
  for(const [s,p] of greyBgs) add('bg',`assets/bg/grey/${s}.webp`,p,512,896);

  // extra genre roots
  add('bg','assets/bg/daemon/thron-nacht.webp','demon throne hall bones velvet night anime vertical',512,896);
  add('bg','assets/bg/daemon/thron-tag.webp','demon throne hall bones daylight anime vertical',512,896);
  add('bg','assets/bg/villainess/salon-abend.webp','ornate noble salon mirrors roses evening anime vertical',512,896);
  add('bg','assets/bg/villainess/salon-tag.webp','ornate noble salon daylight anime vertical',512,896);
  add('bg','assets/bg/mensch/waldpfad-tag.webp','quiet forest path village daylight anime vertical',512,896);
  add('bg','assets/bg/mensch/waldpfad-nacht.webp','quiet forest path night anime vertical',512,896);
  add('bg','assets/bg/highfantasy/kristall.webp','crystal palace fantasy anime vertical',512,896);
  add('bg','assets/bg/proc/default-abend.webp','anime fantasy landscape evening vertical',512,896);
  add('bg','assets/bg/proc/default-tag.webp','anime fantasy landscape daylight vertical',512,896);
  add('bg','assets/bg/proc/default-nacht.webp','anime fantasy landscape night vertical',512,896);

  // PORTRAITS held (root assets/port)
  const heldPorts=[
    ['elise','beautiful anime princess long golden blonde hair blue eyes elegant dress portrait bust looking at viewer'],
    ['lyra','anime elven archer woman silver hair green eyes soft smile portrait bust'],
    ['garrick','anime knight captain short brown hair beard armor portrait bust'],
    ['orren','anime elderly court mage grey beard blue robes portrait bust'],
    ['seris','anime young sorceress dark hair violet eyes portrait bust'],
    ['rhett','anime military captain scar short black hair portrait bust'],
    ['mira','anime merchant woman warm smile brown hair portrait bust'],
    ['julian','anime noble young man soft features portrait bust'],
    ['velka','anime dark priestess pale skin black hair portrait bust'],
    ['brok','anime dwarf blacksmith muscular beard portrait bust'],
    ['tom','anime young squire freckles earnest portrait bust'],
    ['otto','anime farmer middle-aged kind weathered portrait bust'],
    ['kael','anime spy hooded sharp eyes portrait bust'],
    ['vael','anime necromancer pale hooded eerie portrait bust'],
    ['heldin','anime fantasy heroine determined eyes portrait bust'],
    ['ritter','anime armored knight open visor portrait bust'],
  ];
  for(const [s,p] of heldPorts) add('port',`assets/port/${s}.webp`,p,512,512);

  const genrePorts={
    zombie:[
      ['survivor-f','anime survivor woman messy hair determined portrait postapoc'],
      ['survivor-m','anime survivor man stubble jacket portrait postapoc'],
      ['medic','anime field medic woman tired eyes portrait'],
      ['raider','anime raider scarred dangerous portrait'],
      ['kid','anime child survivor hopeful dirty face portrait'],
      ['leader','anime community leader grey temples portrait'],
      ['scout','anime scout hoodie binoculars portrait'],
      ['engineer','anime engineer grease stains goggles portrait'],
      ['guard','anime gate guard rifle postapoc portrait'],
      ['trader','anime scrap trader hooded portrait'],
      ['infected','anime infected human yellowish eyes portrait horror'],
      ['doctor','anime exhausted doctor coat torn portrait'],
    ],
    cyberpunk:[
      ['runner','anime cyberpunk netrunner woman neon hair portrait'],
      ['fixer','anime cyberpunk fixer suit implants portrait'],
      ['corpo','anime cyberpunk corporate executive cold portrait'],
      ['street','anime cyberpunk street samurai chrome arm portrait'],
      ['dj','anime cyberpunk dj neon makeup portrait'],
      ['hacker','anime cyberpunk hacker hoodie glow portrait'],
      ['cop','anime cyberpunk police officer visor portrait'],
      ['idol','anime cyberpunk idol singer holographic portrait'],
      ['mechanic','anime cyberpunk mechanic grease portrait'],
      ['ai-face','anime android face uncanny soft portrait'],
      ['bartender','anime cyberpunk bartender neon bar portrait'],
      ['smuggler','anime cyberpunk smuggler coat portrait'],
    ],
    darkfantasy:[
      ['hexe','anime dark witch pale long hair portrait'],
      ['vampir','anime vampire noble red eyes portrait'],
      ['jaeger','anime monster hunter coat scars portrait'],
      ['geist','anime ghostly woman translucent portrait'],
      ['demon','anime demon horns elegant portrait'],
      ['paladin','anime fallen paladin cracked armor portrait'],
      ['orakel','anime oracle blindfold mystic portrait'],
      ['skelett-ritter','anime skeletal knight armor portrait'],
      ['kultist','anime cultist hood shadows portrait'],
      ['blutmagier','anime blood mage crimson eyes portrait'],
      ['schatten','anime shadow assassin mask portrait'],
      ['koenigin-nacht','anime dark queen crown black gown portrait'],
    ],
    postapoc:[
      ['nomade','anime desert nomad scarf portrait'],
      ['tech','anime scavenger tech goggles portrait'],
      ['warlord','anime wasteland warlord armor portrait'],
      ['seer','anime mystic seer sand robes portrait'],
      ['driver','anime jeep driver goggles portrait'],
      ['child-dust','anime dusty child hopeful portrait'],
      ['trader-sand','anime sand trader mask portrait'],
      ['guard-wall','anime wall guard spear portrait'],
      ['mechanic-dust','anime dust mechanic portrait'],
      ['priest-ash','anime ash priest robes portrait'],
      ['hunter-dune','anime dune hunter hood portrait'],
      ['elder','anime wasteland elder wrinkles portrait'],
    ],
    grey:[
      ['darren','anime tired cook man stubble soft eyes greymourne portrait'],
      ['schaffner','anime train conductor stern portrait'],
      ['alte-frau','anime elderly woman knowing eyes fog portrait'],
      ['kind-nebel','anime pale child foggy mysterious portrait'],
      ['wirt','anime innkeeper apron greymourne portrait'],
      ['polizist','anime foggy town constable portrait'],
      ['kuenstlerin','anime mysterious artist woman portrait fog'],
      ['arzt','anime victorian doctor greymourne portrait'],
      ['schauspieler','anime traveling actor dramatic portrait'],
      ['matrose','anime sailor foggy harbor portrait'],
      ['pfarrerin','anime foggy parish priestess portrait'],
      ['bibliothek','anime librarian glasses fog portrait'],
    ],
  };
  for(const [g,list] of Object.entries(genrePorts)){
    for(const [s,p] of list) add('port',`assets/port/${g}/${s}.webp`,p+', portrait bust looking at viewer',512,512);
  }

  const creatures=[
    ['schattenwolf','anime shadow wolf monster glowing eyes dark fur'],
    ['schleim','anime cute dangerous slime monster green'],
    ['drache','anime fantasy dragon majestic scales'],
    ['goblin','anime goblin creature mischievous'],
    ['skelett','anime skeleton warrior fantasy'],
    ['greifung','anime griffin majestic creature'],
    ['daemon-bestie','anime demon beast horns'],
    ['zombie-hund','anime zombie dog horror'],
  ];
  for(const [s,p] of creatures) add('creature',`assets/creature/${s}.webp`,p,512,512);
  const weapons=[
    ['mondklinge','anime fantasy silver moon sword glowing item icon'],
    ['feuerstab','anime mage fire staff crystal item icon'],
    ['schattenbogen','anime dark bow arrows item icon'],
    ['neonklinge','anime cyberpunk energy katana item icon'],
    ['axt-nord','anime northern battle axe item icon'],
    ['dolch-gift','anime ornate poison dagger item icon'],
  ];
  for(const [s,p] of weapons) add('weapon',`assets/weapon/${s}.webp`,p,512,512);
  add('map','assets/map/pergament.webp','antique fantasy parchment world map illustrated ink anime',768,512);
  add('map','assets/map/stadtplan.webp','anime fantasy city map illustrated top-down streets soft',768,768);
  add('map','assets/map/grey-karte.webp','foggy greymourne town map parchment mysterious',768,512);
  return out;
}

async function isPlacard(buf){
  if(buf.length<8000) return true;
  try{
    const {default:sharp}=await import('sharp');
    const {data,info}=await sharp(buf).resize(32,32,{fit:'fill'}).raw().ensureAlpha().toBuffer({resolveWithObject:true});
    let yel=0,n=info.width*info.height,sum=0,sum2=0;
    for(let i=0;i<data.length;i+=4){
      const r=data[i],g=data[i+1],b=data[i+2];
      if(r>180&&g>140&&b<120) yel++;
      const v=(r+g+b)/3; sum+=v; sum2+=v*v;
    }
    if(yel/n>0.35) return true;
    const mean=sum/n, varr=sum2/n-mean*mean;
    if(varr<80) return true;
    return false;
  }catch{ return buf.length<12000 }
}

async function genOne(job){
  const abs=path.join(ROOT,job.path);
  fs.mkdirSync(path.dirname(abs),{recursive:true});
  if(fs.existsSync(abs)&&fs.statSync(abs).size>15000){
    const existing=fs.readFileSync(abs);
    if(!(await isPlacard(existing))) return {ok:true,skipped:true,path:job.path,bytes:existing.length};
  }
  let lastErr;
  for(let attempt=0;attempt<4;attempt++){
    try{
      const seed=job.seed+attempt*97;
      const url=`${BASE}${encodeURIComponent(job.prompt)}?width=${job.w}&height=${job.h}&nologo=true&seed=${seed}`;
      await sleep(2800+attempt*1800);
      const ctrl=new AbortController();
      const t=setTimeout(()=>ctrl.abort(),120000);
      let buf;
      try{
        const r=await fetch(url,{signal:ctrl.signal,headers:{'User-Agent':'isekai-asset-gen/14'}});
        if(!r.ok) throw new Error('HTTP '+r.status);
        buf=Buffer.from(await r.arrayBuffer());
      }finally{clearTimeout(t)}
      if(await isPlacard(buf)){ lastErr='placard'; continue }
      try{
        const {default:sharp}=await import('sharp');
        const out=await sharp(buf).webp({quality:78}).toBuffer();
        fs.writeFileSync(abs,out);
        return {ok:true,path:job.path,bytes:out.length,attempt};
      }catch{
        fs.writeFileSync(abs,buf);
        return {ok:true,path:job.path,bytes:buf.length,attempt};
      }
    }catch(e){ lastErr=String(e.message||e); await sleep(5000*(attempt+1)) }
  }
  return {ok:false,path:job.path,err:lastErr};
}

const all=jobs();
fs.writeFileSync(path.join(ROOT,'scripts/asset-manifest.json'),JSON.stringify(all,null,2));
console.log('jobs',all.length);
const pri=all.filter(j=>/beschwoerungshalle|\/elise\.webp|\/orren\.webp|\/lyra\.webp|\/garrick\.webp/.test(j.path));
const rest=all.filter(j=>!pri.includes(j));
const queue=[...pri,...rest];
const limit=Number(process.env.GEN_LIMIT||9999);
const summary={ok:0,fail:0,skipped:0,bytes:0,fails:[]};
let n=0;
for(const job of queue){
  if(n>=limit) break; n++;
  process.stdout.write(`[${n}/${Math.min(limit,queue.length)}] ${job.path} ... `);
  const r=await genOne(job);
  fs.appendFileSync(LOG,JSON.stringify({t:Date.now(),...r})+'\n');
  if(r.skipped){summary.skipped++; console.log('skip',r.bytes)}
  else if(r.ok){summary.ok++; summary.bytes+=r.bytes||0; console.log('OK',r.bytes)}
  else {summary.fail++; summary.fails.push(r); console.log('FAIL',r.err)}
}
fs.writeFileSync(path.join(ROOT,'scripts/gen-summary.json'),JSON.stringify(summary,null,2));
console.log('DONE',JSON.stringify(summary));
