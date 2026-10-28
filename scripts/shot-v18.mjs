#!/usr/bin/env node
import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = '/workspace/isekai-game-shots';
fs.mkdirSync(OUT,{recursive:true});
for(const f of fs.readdirSync(OUT).filter(x=>/^v18-(?!before)/.test(x))) fs.unlinkSync(path.join(OUT,f));
const PORT=8771;

function serve(){
  return new Promise(res=>{
    const server=http.createServer((req,res2)=>{
      let p=decodeURIComponent((req.url||'/').split('?')[0]);
      if(p==='/')p='/index.html';
      const fp=path.join(ROOT,p.replace(/^\//,''));
      if(!fp.startsWith(ROOT)||!fs.existsSync(fp)||fs.statSync(fp).isDirectory()){res2.writeHead(404);res2.end('404');return}
      const ext=path.extname(fp);
      const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.json':'application/json','.woff2':'font/woff2'};
      res2.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream','Cache-Control':'no-store'});
      fs.createReadStream(fp).pipe(res2);
    });
    server.listen(PORT,()=>res(server));
  });
}
async function shot(page,name){
  const dest=path.join(OUT,`v18-${name}.png`);
  await page.screenshot({path:dest,type:'png'});
  console.log('shot',dest,fs.statSync(dest).size);
}

const server=await serve();
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--window-size=390,844']});
const page=await browser.newPage();
await page.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
page.setDefaultTimeout(30000);

await page.goto(`http://127.0.0.1:${PORT}/index.html?v=18`,{waitUntil:'networkidle0'});
await page.evaluate(()=>{localStorage.clear();sessionStorage.clear()});
await page.reload({waitUntil:'networkidle0'});
await new Promise(r=>setTimeout(r,600));
await shot(page,'01-title');

const started=await page.evaluate(async()=>{
  const g=window.__game; if(!g)return 'no-game';
  window.__FAST=true; window.__FORCE_CSS_SCENES=true; window.__SKIP_REMOTE_IMG=true;
  window.__setCfg?.({mode:'offline',debug:1,v2:1,battleDiff:'normal',atbMode:'active'});
  try{
    await g.newLife('held',{lives:0,soul:0,keptSkills:[]},{skipSetup:true,name:'Aki'});
    if(g.S.setup&&!g.S.setup.done){g.S.setup.done=true;g.S.ver='18';g.enterPlay()}
    g.S.ver='18';
    // Force VN state with Lyra portrait + dialogue
    g.S.world.scene={ort:'Taverne „Zum Silberkelch“',anwesend:['Lyra','Wirt Brok'],phase:'Abend'};
    try{g.Cont?.lockScene?.(g.S,'shot')}catch(_){}
    document.body.classList.add('genre-held','hud-dim');
    const wrap=document.getElementById('portraitWrap');
    const img=document.getElementById('portraitImg');
    const sp=document.getElementById('speaker');
    const tx=document.getElementById('vnText');
    if(wrap){wrap.classList.remove('hidden');wrap.classList.add('portrait-bust','portrait-in')}
    if(img){img.src='/assets/port/lyra.webp';img.classList.add('on');img.onload=()=>{}}
    if(sp){sp.textContent='Lyra';sp.classList.remove('hidden')}
    if(tx){tx.textContent='Die Kerzen flackern warm. „Du siehst aus, als hättest du den Bruch gerade erst hinter dir,“ sagt Lyra leise und schiebt dir ein Glas hin. „Trink. Dann rede.“'}
    // local scene bg if available
    const bg=document.getElementById('sceneImg');
    if(bg){bg.removeAttribute('crossorigin');bg.src='/assets/bg/held/taverne-abend.webp';bg.classList.add('on');bg.style.opacity='1';bg.style.display='block'}
    const sc=document.getElementById('sceneBg');
    if(sc){sc.style.backgroundImage="url('/assets/bg/held/taverne-abend.webp')";sc.classList.add('has-art')}
    const ph=document.getElementById('scenePh'); if(ph) ph.style.display='none';
    document.getElementById('choices').innerHTML='<button type="button">Mit Lyra sprechen</button><button type="button">Den Raum mustern</button>';
    return {ok:true,ver:g.S.ver};
  }catch(e){return {err:e.message,stack:String(e.stack||'').slice(0,200)}}
});
console.log('start',started);
await new Promise(r=>setTimeout(r,900));
await shot(page,'02-vn');

await page.evaluate(()=>{
  document.body.classList.remove('hud-dim');
  window.__game.openMenu();
});
await new Promise(r=>setTimeout(r,400));
await shot(page,'03-hub');

await page.evaluate(()=>{
  // summoning hall scene
  document.getElementById('menu')?.classList.add('hidden');
  const bg=document.getElementById('sceneImg');
  if(bg){bg.removeAttribute('crossorigin');bg.src='/assets/bg/held/beschwoerungshalle-abend.webp';bg.classList.add('on');bg.style.opacity='1';bg.style.display='block'}
  const sc=document.getElementById('sceneBg');
  if(sc){sc.style.backgroundImage="url('/assets/bg/held/beschwoerungshalle-abend.webp')";sc.classList.add('has-art')}
  const ph=document.getElementById('scenePh'); if(ph) ph.style.display='none';
  const img=document.getElementById('portraitImg');
  if(img){img.src='/assets/port/heldin.webp'}
  document.getElementById('speaker').textContent='Erzähler';
  document.getElementById('vnText').textContent='Du stehst in der Beschwörungshalle. Runen kreisen unter deinen Füßen — ein neues Leben beginnt.';
  document.body.classList.add('hud-dim');
});
await new Promise(r=>setTimeout(r,700));
await shot(page,'04-hall');

await browser.close();
server.close();
console.log('done');
