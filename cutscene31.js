/** v32 pixel intro cutscene — bespoke backgrounds + pose strips. */
const BEATS=[
  {id:'crash', title:'Aufprall', lines:['Hupen. Licht. Asphalt.','Zwischen Herzschlag und Stille…'], bg:'./assets/pixel/cutscene/crash.png', pose:'./assets/pixel/cutscene/pose_hero_hurt.png'},
  {id:'void', title:'Dazwischen', lines:['Dunkelheit.','Wärme, die nicht von dieser Welt ist.'], bg:'./assets/pixel/cutscene/void.png', pose:'./assets/pixel/cutscene/pose_goddess_cast.png'},
  {id:'goddess', title:'Die Stimme', lines:['„Du bist gestorben.','Das ist… ärgerlich. Aber nicht endgültig.“'], bg:'./assets/pixel/cutscene/goddess.png', pose:'./assets/pixel/cutscene/pose_goddess_cast.png'},
  {id:'paths', title:'Pfade', lines:['Licht zerteilt sich.','Held · Intrige · Nacht · Alltag'], bg:'./assets/pixel/cutscene/paths.png', pose:'./assets/pixel/cutscene/pose_hero_reach.png'},
  {id:'fall', title:'Fall', lines:['Die andere Welt atmet bereits.','Du fällst — und landest.'], bg:'./assets/pixel/cutscene/fall.png', pose:'./assets/pixel/cutscene/pose_hero_fall.png'},
];

function loadImg(src){
  return new Promise(res=>{
    if(!src) return res(null);
    const img=new Image();
    img.onload=()=>res(img);
    img.onerror=()=>res(null);
    img.src=src;
  });
}

export function dismissIntroCutscene(){
  const el=document.getElementById('introCutscene');
  if(el){ el.classList.add('hidden'); clearTimeout(el._t); }
}

export async function playIntroCutscene(opts={}){
  dismissIntroCutscene();
  let root=document.getElementById('introCutscene');
  if(!root){
    root=document.createElement('div');
    root.id='introCutscene';
    root.className='intro-cutscene';
    document.body.appendChild(root);
  }
  root.classList.remove('hidden');
  root.innerHTML=`
    <canvas id="introCv" width="320" height="180" class="pixelated"></canvas>
    <div class="intro-cut-ui">
      <div class="intro-cut-title" id="introCutTitle"></div>
      <div class="intro-cut-text" id="introCutText"></div>
      <div class="intro-cut-bar"><button type="button" id="introSkip">Überspringen ▸</button></div>
    </div>`;
  const cv=root.querySelector('#introCv');
  const ctx=cv.getContext('2d');
  ctx.imageSmoothingEnabled=false;
  let skipped=false;
  const skip=()=>{ skipped=true; };
  root.querySelector('#introSkip').onclick=skip;
  root.addEventListener('click', e=>{ if(e.target===root) skip(); });

  for(let i=0;i<BEATS.length;i++){
    if(skipped) break;
    const b=BEATS[i];
    root.querySelector('#introCutTitle').textContent=b.title;
    root.querySelector('#introCutText').textContent='';
    const [bg, pose]=await Promise.all([loadImg(b.bg), loadImg(b.pose)]);
    const start=performance.now();
    let lineIdx=0;
    const showLine=()=>{
      if(lineIdx<b.lines.length){
        const t=root.querySelector('#introCutText');
        t.textContent=(t.textContent?t.textContent+'\n':'')+b.lines[lineIdx];
        lineIdx++;
      }
    };
    showLine();
    const lineT=setInterval(()=>{ if(!skipped) showLine(); }, 850);
    await new Promise(resolve=>{
      const tick=(ts)=>{
        if(skipped){ clearInterval(lineT); resolve(); return; }
        const t=(ts-start)/1000;
        ctx.clearRect(0,0,320,180);
        if(bg){ ctx.drawImage(bg,0,0,320,180); }
        else { ctx.fillStyle='#0a0614'; ctx.fillRect(0,0,320,180); }
        // animated pose overlay (bottom-right)
        if(pose){
          const bob=Math.sin(t*3)*3;
          const dx=230, dy=95+bob;
          ctx.drawImage(pose, 0, 0, pose.width, pose.height, dx, dy, 72, 72);
        }
        // letterbox
        ctx.fillStyle='#0008'; ctx.fillRect(0,0,320,16); ctx.fillRect(0,164,320,16);
        if(t<3.1 && !skipped) requestAnimationFrame(tick);
        else { clearInterval(lineT); resolve(); }
      };
      requestAnimationFrame(tick);
    });
  }
  root.classList.add('hidden');
  try{ opts.onDone?.(); }catch(_){}
}

export default { playIntroCutscene, dismissIntroCutscene };
