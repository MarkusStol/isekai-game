/** v31 overworld region travel map — horse / boat / airship feel. */
const MODES=[
  {id:'horse', label:'🐎 Pferd', hours:2.5, blurb:'Über Landwege'},
  {id:'boat', label:'⛵ Boot', hours:4, blurb:'Entlang der Küste & Flüsse'},
  {id:'airship', label:'🛸 Luftschiff', hours:1.2, blurb:'Über Berge & Nebel'},
];

function regionList(S){
  const nodes=Object.keys(S?.world?.graph?.nodes||{});
  const discovered=new Set((S?.discovered||[]).map(String));
  const cur=S?.world?.scene?.ort||'';
  const fromPack=Object.keys(S?.world?.orte||{});
  const all=[...new Set([...nodes, ...fromPack, cur].filter(Boolean))];
  return all.map((name,i)=>{
    const known=discovered.has(name) || name===cur || i<4;
    const ang=(i/Math.max(1,all.length))*Math.PI*2;
    const r=38+((i%5)*10);
    return {
      id:name, name, known, current:name===cur,
      x:50+Math.cos(ang)*r*0.55,
      y:50+Math.sin(ang)*r*0.42,
      terrain:guessTerrain(name),
    };
  });
}
function guessTerrain(name){
  const s=String(name).toLowerCase();
  if(/küste|hafen|see|fluss|meer|bucht|ufer/.test(s)) return 'water';
  if(/berg|spitze|grat|pass|gipfel/.test(s)) return 'air';
  return 'land';
}
function boatOk(a,b){
  return a.terrain==='water'||b.terrain==='water'||/hafen|küste|see|fluss/.test((a.name+' '+b.name).toLowerCase());
}

export function dismissTravelMap(){
  document.getElementById('travelMap')?.classList.add('hidden');
}

export function openTravelMap(S, hooks={}){
  if(!S) return null;
  let root=document.getElementById('travelMap');
  if(!root){
    root=document.createElement('div');
    root.id='travelMap';
    root.className='travel-map hidden';
    document.body.appendChild(root);
  }
  const state={ mode:'horse', selected:null };
  const regions=regionList(S);

  function paint(){
    const cur=regions.find(r=>r.current);
    const m=MODES.find(x=>x.id===state.mode)||MODES[0];
    root.classList.remove('hidden');
    root.innerHTML=`
      <div class="travel-map-panel">
        <div class="travel-map-head">
          <b>🗺 Reisekarte</b>
          <span class="meta">${cur?.name||'?'}</span>
          <button type="button" class="px-x" id="tmClose">×</button>
        </div>
        <div class="travel-modes" id="tmModes"></div>
        <div class="travel-canvas-wrap"><canvas id="tmCv" width="360" height="220" class="pixelated"></canvas></div>
        <div class="travel-map-foot">
          <div id="tmInfo" class="meta">Wähle ein Ziel. Reiseart bestimmt Tempo & Flair.</div>
          <button type="button" class="big" id="tmGo" disabled>Reisen</button>
        </div>
      </div>`;
    const modes=root.querySelector('#tmModes');
    MODES.forEach(mm=>{
      const b=document.createElement('button');
      b.type='button'; b.className='tm-mode'+(state.mode===mm.id?' on':'');
      b.textContent=mm.label; b.title=mm.blurb;
      b.onclick=()=>{ state.mode=mm.id; paint(); };
      modes.appendChild(b);
    });
    root.querySelector('#tmClose').onclick=()=>root.classList.add('hidden');

    const cv=root.querySelector('#tmCv');
    const ctx=cv.getContext('2d');
    ctx.imageSmoothingEnabled=false;
    ctx.fillStyle='#1a1430'; ctx.fillRect(0,0,360,220);
    ctx.fillStyle='#2a2050'; ctx.fillRect(8,8,344,204);
    ctx.strokeStyle='#3a3070';
    for(let x=8;x<352;x+=24){ ctx.beginPath(); ctx.moveTo(x,8); ctx.lineTo(x,212); ctx.stroke(); }
    for(let y=8;y<212;y+=24){ ctx.beginPath(); ctx.moveTo(8,y); ctx.lineTo(352,y); ctx.stroke(); }
    if(cur){
      regions.filter(r=>r.known && !r.current).forEach(r=>{
        ctx.strokeStyle=state.mode==='airship'?'#7dd3fc88':state.mode==='boat'?'#38bdf888':'#f0d59a66';
        ctx.setLineDash(state.mode==='airship'?[4,4]:state.mode==='boat'?[6,3]:[2,2]);
        ctx.beginPath();
        ctx.moveTo(cur.x/100*344+8, cur.y/100*204+8);
        ctx.lineTo(r.x/100*344+8, r.y/100*204+8);
        ctx.stroke(); ctx.setLineDash([]);
      });
    }
    regions.forEach(r=>{
      const px=r.x/100*344+8, py=r.y/100*204+8;
      if(!r.known){
        ctx.fillStyle='#444'; ctx.fillRect(px-2,py-2,4,4); return;
      }
      ctx.fillStyle=r.current?'#fbbf24':(state.selected===r.id?'#34d399':'#c4b5fd');
      ctx.beginPath(); ctx.arc(px,py, r.current?8:6, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle='#ffe'; ctx.font='10px monospace';
      ctx.fillText(r.name.length>14?r.name.slice(0,12)+'…':r.name, px+8, py+3);
    });
    if(cur){
      const px=cur.x/100*344+8, py=cur.y/100*204+8;
      ctx.font='14px serif';
      ctx.fillText(state.mode==='horse'?'🐎':state.mode==='boat'?'⛵':'🛸', px-18, py-10);
    }

    const info=root.querySelector('#tmInfo');
    const go=root.querySelector('#tmGo');
    const dest=regions.find(r=>r.id===state.selected);
    let ok=!!dest;
    if(ok && state.mode==='boat' && cur && !boatOk(cur,dest)) ok=false;
    go.disabled=!ok;
    if(dest && ok) info.textContent=`${m.label} → ${dest.name} · ca. ${m.hours} Std. · ${m.blurb}`;
    else if(dest && !ok) info.textContent=`⛵ ${dest.name}: kein Wasserweg — Pferd oder Luftschiff wählen.`;

    cv.onclick=(e)=>{
      const rect=cv.getBoundingClientRect();
      const x=(e.clientX-rect.left)/rect.width*360;
      const y=(e.clientY-rect.top)/rect.height*220;
      let best=null, bd=999;
      regions.forEach(r=>{
        if(!r.known||r.current) return;
        const px=r.x/100*344+8, py=r.y/100*204+8;
        const d=Math.hypot(px-x,py-y);
        if(d<bd && d<20){ bd=d; best=r; }
      });
      if(best){ state.selected=best.id; paint(); }
    };
    go.onclick=()=>{
      if(!state.selected) return;
      const d=regions.find(r=>r.id===state.selected);
      const mm=MODES.find(x=>x.id===state.mode);
      if(!d||!mm) return;
      if(state.mode==='boat' && cur && !boatOk(cur,d)){ hooks.toast?.('Kein Wasserweg.'); return; }
      root.classList.add('hidden');
      const flair=state.mode==='horse'
        ?`Du satteltst und reitest nach ${d.name}. Hufe auf dem Pfad.`
        :state.mode==='boat'
        ?`Segel setzen — die Strömung trägt dich nach ${d.name}.`
        :`Das Luftschiff hebt ab. Wolken unter den Planken — Kurs ${d.name}.`;
      try{ hooks.onTravel?.(d.name,{hours:mm.hours, mode:state.mode, flair}); }catch(err){ console.warn(err); }
    };
  }
  paint();
  return root;
}

export default { openTravelMap, dismissTravelMap, MODES };
