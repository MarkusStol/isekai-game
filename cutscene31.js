/** v31 pixel-style intro cutscene (canvas, no remote AI). */
const BEATS=[
  {id:'crash', bg:'#0a0614', title:'Aufprall', lines:['Hupen. Licht. Asphalt.','Zwischen Herzschlag und Stille…'], spr:'hero', action:'hurt'},
  {id:'void', bg:'#050818', title:'Dazwischen', lines:['Dunkelheit.','Wärme, die nicht von dieser Welt ist.'], spr:'princess', action:'cast'},
  {id:'goddess', bg:'#12082a', title:'Die Stimme', lines:['„Du bist gestorben.','Das ist… ärgerlich. Aber nicht endgültig.“'], spr:'mage', action:'cast'},
  {id:'paths', bg:'#1a0a30', title:'Pfade', lines:['Licht zerteilt sich.','Held · Intrige · Nacht · Alltag'], spr:'hero', action:'attack'},
  {id:'fall', bg:'#0c1a2e', title:'Fall', lines:['Die andere Welt atmet bereits.','Du fällst — und landest.'], spr:'hero', action:'hurt'},
];

function loadSheet(role, action){
  const map={attack:'slash', hurt:'hurt', cast:'spellcast'};
  const a=map[action]||'hurt';
  const src=`./assets/pixel/chars/${role}_${a}.png`;
  return new Promise(res=>{
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

/** Play pixel cutscene; resolves when finished or skipped. */
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

  const stars=Array.from({length:40},()=>({x:Math.random()*320,y:Math.random()*180,s:Math.random()*1.5+0.5}));
  for(let i=0;i<BEATS.length;i++){
    if(skipped) break;
    const b=BEATS[i];
    root.querySelector('#introCutTitle').textContent=b.title;
    root.querySelector('#introCutText').textContent='';
    const img=await loadSheet(b.spr, b.action);
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
    const lineT=setInterval(()=>{ if(!skipped) showLine(); }, 900);
    await new Promise(resolve=>{
      const tick=(ts)=>{
        if(skipped){ clearInterval(lineT); resolve(); return; }
        const t=(ts-start)/1000;
        // bg
        ctx.fillStyle=b.bg; ctx.fillRect(0,0,320,180);
        // stars / particles
        ctx.fillStyle='#ffffffaa';
        stars.forEach((s,si)=>{
          const yy=(s.y + t*8*(si%3+1))%180;
          ctx.fillRect(s.x, yy, s.s, s.s);
        });
        // ground strip
        ctx.fillStyle='#1a1028'; ctx.fillRect(0,140,320,40);
        ctx.fillStyle='#2a1840'; ctx.fillRect(0,140,320,2);
        // sprite
        if(img){
          const frame=Math.min(3, Math.floor(t*6)%4);
          const fw=64, fh=64;
          const sx=frame*fw, sy=0;
          const dx=128, dy=70;
          ctx.drawImage(img, sx, sy, fw, fh, dx, dy, 64, 64);
        } else {
          ctx.fillStyle='#f0d59a'; ctx.fillRect(148,100,24,32);
        }
        // vignette bars
        ctx.fillStyle='#0008'; ctx.fillRect(0,0,320,18); ctx.fillRect(0,162,320,18);
        if(t<3.2 && !skipped) requestAnimationFrame(tick);
        else { clearInterval(lineT); resolve(); }
      };
      requestAnimationFrame(tick);
    });
  }
  root.classList.add('hidden');
  try{ opts.onDone?.(); }catch(_){}
}

export default { playIntroCutscene, dismissIntroCutscene };
