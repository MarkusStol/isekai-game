#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// reuse genOne/jobs by dynamic import of logic — inline thin copy
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'https://pollinations.ai/p/';
const STYLE = 'anime style illustration, high quality, detailed, no text, no watermark, no logo';
const LOG = path.join(ROOT, 'scripts/gen-log.jsonl');
const CONC = Number(process.env.GEN_CONC || 3);

function hash(s){ let h=0; for(const c of s) h=((h<<5)-h)+c.charCodeAt(0)|0; return Math.abs(h)%99991+1 }
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)) }

// Load job list from manifest if present
let all;
if(fs.existsSync(path.join(ROOT,'scripts/asset-manifest.json'))){
  all=JSON.parse(fs.readFileSync(path.join(ROOT,'scripts/asset-manifest.json'),'utf8'));
} else {
  console.error('no manifest'); process.exit(1);
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
  if(fs.existsSync(abs)&&fs.statSync(abs).size>14000){
    const existing=fs.readFileSync(abs);
    if(!(await isPlacard(existing))) return {ok:true,skipped:true,path:job.path,bytes:existing.length};
  }
  let lastErr;
  for(let attempt=0;attempt<4;attempt++){
    try{
      const seed=(job.seed||hash(job.path))+attempt*97;
      const prompt=(job.prompt.includes(STYLE)?job.prompt:job.prompt+', '+STYLE);
      const url=`${BASE}${encodeURIComponent(prompt)}?width=${job.w||512}&height=${job.h||512}&nologo=true&seed=${seed}`;
      await sleep(1500+attempt*1200+Math.random()*800);
      const ctrl=new AbortController();
      const t=setTimeout(()=>ctrl.abort(),90000);
      let buf;
      try{
        const r=await fetch(url,{signal:ctrl.signal,headers:{'User-Agent':'isekai-asset-gen/14p'}});
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
    }catch(e){ lastErr=String(e.message||e); await sleep(4000*(attempt+1)) }
  }
  return {ok:false,path:job.path,err:lastErr};
}

const pending=all.filter(j=>{
  const abs=path.join(ROOT,j.path);
  return !(fs.existsSync(abs)&&fs.statSync(abs).size>14000);
});
console.log('parallel pending',pending.length,'of',all.length,'conc',CONC);
let i=0, ok=0, fail=0, skip=0;
async function worker(id){
  while(true){
    const idx=i++; if(idx>=pending.length)return;
    const job=pending[idx];
    process.stdout.write(`W${id} [${idx+1}/${pending.length}] ${job.path} ... `);
    const r=await genOne(job);
    fs.appendFileSync(LOG,JSON.stringify({t:Date.now(),w:id,...r})+'\n');
    if(r.skipped){skip++; console.log('skip',r.bytes)}
    else if(r.ok){ok++; console.log('OK',r.bytes)}
    else {fail++; console.log('FAIL',r.err)}
  }
}
await Promise.all(Array.from({length:CONC},(_,k)=>worker(k+1)));
console.log('PARALLEL DONE',{ok,fail,skip,pending:pending.length});
fs.writeFileSync(path.join(ROOT,'scripts/gen-parallel-summary.json'),JSON.stringify({ok,fail,skip,pending:pending.length,t:Date.now()}));
