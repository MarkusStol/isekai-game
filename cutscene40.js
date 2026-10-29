/** v40 pixel boss-intro cutscenes (optional, skippable). */
const GENRE_BEATS={
  fantasy:[
    {title:'Ostwall', lines:['Fackeln sterben.','Unter dem Stein atmet etwas Altes.'], bg:'./assets/pixel/cutscene/boss/fantasy_crypt.png', pose:'./assets/pixel/cutscene/boss/pose_ogre.png'},
    {title:'Der Kriegsherr', lines:['Panzerung knirscht.','Mehrere Phasen. Kein Zwang — Flucht bleibt erlaubt.'], bg:'./assets/pixel/cutscene/boss/fantasy_crypt.png', pose:'./assets/pixel/cutscene/boss/pose_ogre.png'},
  ],
  zombie:[
    {title:'Bunkerlicht', lines:['Notstrom flackert.','Etwas Schweres schabt über Fliesen.'], bg:'./assets/pixel/cutscene/boss/zombie_bunker.png', pose:'./assets/pixel/cutscene/boss/pose_tyrant.png'},
    {title:'Tyrant', lines:['Die Quarantäne war nie dicht.','Phasen. Serum. Entscheidung.'], bg:'./assets/pixel/cutscene/boss/zombie_bunker.png', pose:'./assets/pixel/cutscene/boss/pose_tyrant.png'},
  ],
  cyberpunk:[
    {title:'Servergruft', lines:['Kühlung heult.','Wärmesignatur = Assassine.'], bg:'./assets/pixel/cutscene/boss/cyber_vault.png', pose:'./assets/pixel/cutscene/boss/pose_chrome.png'},
    {title:'Chrome', lines:['Overclock. Klingenschirm.','Du kannst reden, fliehen oder kämpfen.'], bg:'./assets/pixel/cutscene/boss/cyber_vault.png', pose:'./assets/pixel/cutscene/boss/pose_chrome.png'},
  ],
  default:[
    {title:'Tiefe', lines:['Der Gang engt sich.','Ein Boss wartet — optional.'], bg:'./assets/pixel/cutscene/boss/fantasy_crypt.png', pose:'./assets/pixel/cutscene/boss/pose_ogre.png'},
  ],
};

function loadImg(src){
  return new Promise(res=>{
    if(!src) return res(null);
    const img=new Image();
    img.onload=()=>res(img);
    img.onerror=()=>res(null);
    img.src=src;
  });
}

export function dismissBossCutscene(){
  const el=document.getElementById('bossCutscene');
  if(el){ el.classList.add('hidden'); clearTimeout(el._t); }
}

export async function playBossIntroCutscene(opts={}){
  dismissBossCutscene();
  const genre=String(opts.genre||'default').toLowerCase();
  const key=/zombie/.test(genre)?'zombie':/cyber|neon|punk/.test(genre)?'cyberpunk':/fantasy|held|magie/.test(genre)?'fantasy':'default';
  const beats=(GENRE_BEATS[key]||GENRE_BEATS.default).map(b=>({...b}));
  if(opts.bossName){
    beats[beats.length-1].title=opts.bossName;
    beats[beats.length-1].lines=[`${opts.bossName} erhebt sich.`, ...(beats[beats.length-1].lines||[]).slice(1)];
  }
  let root=document.getElementById('bossCutscene');
  if(!root){
    root=document.createElement('div');
    root.id='bossCutscene';
    root.className='intro-cutscene boss-cutscene';
    document.body.appendChild(root);
  }
  root.classList.remove('hidden');
  root.innerHTML=`
    <canvas id="bossCv" width="320" height="180" class="pixelated"></canvas>
    <div class="intro-cut-ui">
      <div class="intro-cut-title" id="bossCutTitle"></div>
      <div class="intro-cut-text" id="bossCutText"></div>
      <div class="intro-cut-bar"><button type="button" id="bossSkip">Überspringen ▸</button></div>
    </div>`;
  const cv=root.querySelector('#bossCv');
  const ctx=cv.getContext('2d');
  ctx.imageSmoothingEnabled=false;
  let skipped=false;
  const skip=()=>{ skipped=true; };
  root.querySelector('#bossSkip').onclick=skip;
  root.addEventListener('click', e=>{ if(e.target===root) skip(); });
  const beatMs=opts.fast?400:2800;

  for(let i=0;i<beats.length;i++){
    if(skipped) break;
    const b=beats[i];
    root.querySelector('#bossCutTitle').textContent=b.title;
    root.querySelector('#bossCutText').textContent='';
    const [bg, pose]=await Promise.all([loadImg(b.bg), loadImg(b.pose)]);
    const start=performance.now();
    let lineIdx=0;
    const showLine=()=>{
      if(lineIdx<b.lines.length){
        const t=root.querySelector('#bossCutText');
        t.textContent=(t.textContent?t.textContent+'\n':'')+b.lines[lineIdx++];
      }
    };
    showLine();
    const lineT=setInterval(()=>{ if(!skipped) showLine(); }, opts.fast?120:700);
    await new Promise(resolve=>{
      const tick=(ts)=>{
        if(skipped){ clearInterval(lineT); resolve(); return; }
        const t=(ts-start)/1000;
        ctx.clearRect(0,0,320,180);
        if(bg) ctx.drawImage(bg,0,0,320,180);
        else { ctx.fillStyle='#0a0614'; ctx.fillRect(0,0,320,180); }
        if(pose){
          const bob=Math.sin(t*4)*4;
          const scale=1+Math.max(0,(0.6-t))*0.4;
          const w=72*scale, h=72*scale;
          ctx.drawImage(pose, 0,0,pose.width,pose.height, 240-w/2, 100+bob-h/2, w, h);
        }
        // scanlines
        ctx.fillStyle='#0004';
        for(let y=0;y<180;y+=4) ctx.fillRect(0,y,320,1);
        ctx.fillStyle='#0008'; ctx.fillRect(0,0,320,16); ctx.fillRect(0,164,320,16);
        if(t<(beatMs/1000) && !skipped) requestAnimationFrame(tick);
        else { clearInterval(lineT); resolve(); }
      };
      requestAnimationFrame(tick);
    });
  }
  root.classList.add('hidden');
  try{ opts.onDone?.(); }catch(_){}
  return {skipped, genre:key};
}

export default { playBossIntroCutscene, dismissBossCutscene, GENRE_BEATS };
