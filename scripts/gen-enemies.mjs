#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'https://image.pollinations.ai/prompt/';
const STYLE = 'anime style JRPG enemy portrait, full body or bust, dramatic lighting, transparent-friendly dark background, high quality, no text, no watermark, no logo';
const CONC = Number(process.env.GEN_CONC || 4);

function hash(s){ let h=0; for(const c of s) h=((h<<5)-h)+c.charCodeAt(0)|0; return Math.abs(h)%99991+1 }
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

const ENEMIES=[
  // fantasy
  ['goblin','small green goblin warrior with crude dagger anime JRPG enemy'],
  ['orc','muscular orc warrior with axe anime JRPG enemy'],
  ['wolf','fierce grey wolf snarling fantasy anime JRPG enemy'],
  ['slime','cute but dangerous blue slime monster anime JRPG'],
  ['skeleton','animated skeleton with rusty sword anime JRPG undead'],
  ['bandit','hooded fantasy bandit with knives anime JRPG enemy'],
  ['mage_rogue','dark robe mage casting sparks anime JRPG enemy'],
  ['dragon_whelp','small red dragon hatchling breathing ember anime JRPG'],
  // dark
  ['demon_imp','red horned imp with fire anime JRPG demon'],
  ['shadow_wraith','shadowy wraith cloak hollow eyes anime dark fantasy'],
  ['ash_hound','ember ash hellhound smoke anime dark fantasy'],
  ['bone_knight','armored bone knight with greatsword anime undead'],
  ['blood_cultist','hooded blood cultist ritual dagger anime dark'],
  // zombie
  ['walker','rotting zombie walker torn clothes anime horror'],
  ['runner','fast infected runner zombie anime horror'],
  ['bloater','bloated infected zombie anime horror'],
  ['looter','hostile post-apoc looter with bat anime'],
  // cyber
  ['drone','hostile flying combat drone neon cyberpunk anime'],
  ['street_thug','cyberpunk street thug chrome arm neon anime'],
  ['chrome_hound','cybernetic attack dog neon anime'],
  ['net_ghost','holographic netrunner ghost glitch anime cyberpunk'],
  // daemon
  ['lesser_fiend','winged lesser fiend dark anime demon'],
  ['hellhound','black hellhound with flame eyes anime'],
  ['cultist','demon cultist robes anime dark'],
  // grey
  ['fog_passenger','mysterious fog-shrouded passenger victorian anime muted'],
  ['mirror_double','uncanny mirror double silhouette fog anime'],
  ['quiet_porter','silent train porter fog greymourne anime muted'],
  // bosses
  ['boss_ogre','massive ogre warlord boss anime JRPG dramatic'],
  ['boss_lich','lich king boss glowing eyes anime JRPG'],
  ['boss_tyrant','zombie tyrant boss huge anime horror'],
  ['boss_chrome','chrome assassin boss cyberpunk neon anime'],
  ['boss_archfiend','archfiend demon lord boss anime dramatic'],
  ['boss_fogking','fog king silhouette greymourne boss anime muted'],
];

const BGS=[
  ['arena-fantasy','anime fantasy battle arena rocky clearing dusk dramatic vertical'],
  ['arena-dark','dark fantasy battle arena ruined cathedral night vertical'],
  ['arena-zombie','post apocalypse battle street abandoned cars night vertical'],
  ['arena-cyber','cyberpunk battle rooftop neon rain night vertical'],
  ['arena-daemon','demon realm battle arena lava cracks night vertical'],
  ['arena-grey','foggy victorian square battle greymourne muted vertical'],
  ['arena-forest','anime fantasy forest clearing battle daylight vertical'],
  ['arena-dungeon','anime dungeon torchlit battle chamber vertical'],
];

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
  if(fs.existsSync(abs)&&fs.statSync(abs).size>14000){
    const existing=fs.readFileSync(abs);
    if(!(await isPlacard(existing))) return {ok:true,skipped:true,path:job.path,bytes:existing.length};
  }
  let lastErr;
  for(let attempt=0;attempt<4;attempt++){
    try{
      const seed=(job.seed||hash(job.path))+attempt*97;
      const prompt=job.prompt+', '+STYLE;
      const url=`${BASE}${encodeURIComponent(prompt)}?width=${job.w}&height=${job.h}&nologo=true&seed=${seed}&referrer=${encodeURIComponent('https://markusstol.github.io/isekai-game/')}`;
      await sleep(800+attempt*900+Math.random()*500);
      const ctrl=new AbortController();
      const t=setTimeout(()=>ctrl.abort(),90000);
      let buf;
      try{
        const r=await fetch(url,{signal:ctrl.signal});
        if(!r.ok) throw new Error('HTTP '+r.status);
        buf=Buffer.from(await r.arrayBuffer());
      }finally{clearTimeout(t)}
      if(await isPlacard(buf)){ lastErr='placard'; continue }
      try{
        const {default:sharp}=await import('sharp');
        const out=await sharp(buf).webp({quality:80}).toBuffer();
        fs.writeFileSync(abs,out);
        return {ok:true,path:job.path,bytes:out.length,attempt};
      }catch{
        fs.writeFileSync(abs,buf);
        return {ok:true,path:job.path,bytes:buf.length,attempt};
      }
    }catch(e){ lastErr=String(e.message||e); await sleep(3000*(attempt+1)) }
  }
  return {ok:false,path:job.path,err:lastErr};
}

const jobs=[
  ...ENEMIES.map(([id,p])=>({path:`assets/creature/${id}.webp`,prompt:p,w:384,h:512,seed:hash(id)})),
  ...BGS.map(([id,p])=>({path:`assets/bg/battle/${id}.webp`,prompt:p,w:512,h:896,seed:hash('bg'+id)})),
];
fs.writeFileSync(path.join(ROOT,'scripts/enemy-manifest.json'), JSON.stringify(jobs,null,2));

const pending=jobs.filter(j=>{
  const abs=path.join(ROOT,j.path);
  return !(fs.existsSync(abs)&&fs.statSync(abs).size>14000);
});
console.log('jobs',jobs.length,'pending',pending.length);

let i=0, ok=0, fail=0, skip=0;
async function worker(){
  while(i<pending.length){
    const idx=i++; const job=pending[idx];
    const r=await genOne(job);
    if(r.skipped){skip++; console.log('skip',job.path)}
    else if(r.ok){ok++; console.log('ok',job.path,r.bytes)}
    else {fail++; console.log('FAIL',job.path,r.err)}
  }
}
await Promise.all(Array.from({length:Math.min(CONC,pending.length||1)},()=>worker()));
console.log(JSON.stringify({ok,fail,skip,total:jobs.length}));
