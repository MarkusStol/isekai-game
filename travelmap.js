/** v32 region travel map — horse free; boat needs harbors; airship earned/bought. */
const MODES=[
  {id:'horse', label:'🐎 Pferd', hours:2.5, blurb:'Über Landwege'},
  {id:'boat', label:'⛵ Boot', hours:4, blurb:'Nur zwischen Häfen'},
  {id:'airship', label:'🛸 Luftschiff', hours:1.2, blurb:'Freigeschaltet durch Quest/Kauf'},
];

const HARBOR_RE=/hafen|küste|seehafen|bucht|werft|kai|pier|docks?|marina|uferstadt|meerestor|hafenstadt|seewacht|containerhafen|hafenlager|hafencontainer|hafenruine/i;

export function isHarborName(name){
  return HARBOR_RE.test(String(name||''));
}
export function placeIsHarbor(S, name){
  if(isHarborName(name)) return true;
  try{
    const node=S?.world?.graph?.nodes?.[name];
    if(node){
      const blob=(String(node.desc||'')+' '+String(node.terrain||'')+' '+String(node.tags||'')+' '+(Array.isArray(node.tags)?node.tags.join(' '):'')).toLowerCase();
      if(/hafen|küste|hafenstadt|dock|werft|seeport|port/.test(blob)) return true;
      if(node.harbor || node.port || (node.tags||[]).includes?.('harbor')) return true;
    }
    const ort=S?.world?.orte?.[name];
    if(ort && /hafen|küste|werft|kai/.test(String(typeof ort==='string'?ort:ort.desc||'').toLowerCase())) return true;
  }catch(_){}
  return false;
}
export function hasAirship(S){
  const f=S?.flags||{};
  if(f.airship===true || f.travel?.airship===true) return true;
  // Ticket / deed in inventory
  try{
    return (S.inv||[]).some(it=>{
      const id=String(it?.id||it?.name||'').toLowerCase();
      return /luftschiff|airship|flugticket|zeppelin/.test(id);
    });
  }catch(_){ return false; }
}
export function grantAirship(S, reason){
  S.flags=S.flags||{};
  S.flags.travel=S.flags.travel||{};
  S.flags.airship=true;
  S.flags.travel.airship=true;
  S.flags.travel.airshipHow=reason||'earned';
  return true;
}

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
    const harbor=placeIsHarbor(S, name);
    return {
      id:name, name, known, current:name===cur, harbor,
      x:50+Math.cos(ang)*r*0.55,
      y:50+Math.sin(ang)*r*0.42,
      terrain:harbor?'water':guessTerrain(name),
    };
  });
}
function guessTerrain(name){
  const s=String(name).toLowerCase();
  if(HARBOR_RE.test(s)||/see|fluss|meer/.test(s)) return 'water';
  if(/berg|spitze|grat|pass|gipfel/.test(s)) return 'air';
  return 'land';
}
function boatOk(S,a,b){
  // Both ends must be real harbors (v32)
  return !!(a && b && a.harbor && b.harbor);
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
  const airOk=hasAirship(S);

  function paint(){
    const cur=regions.find(r=>r.current);
    const m=MODES.find(x=>x.id===state.mode)||MODES[0];
    root.classList.remove('hidden');
    root.innerHTML=`
      <div class="travel-map-panel">
        <div class="travel-map-head">
          <b>🗺 Reisekarte</b>
          <span class="meta">${cur?.name||'?'}${cur?.harbor?' · ⚓':''}</span>
          <button type="button" class="px-x" id="tmClose">×</button>
        </div>
        <div class="travel-modes" id="tmModes"></div>
        <div class="travel-canvas-wrap"><canvas id="tmCv" width="360" height="220" class="pixelated"></canvas></div>
        <div class="travel-map-foot">
          <div id="tmInfo" class="meta">Wähle ein Ziel. Boot: nur Hafen↔Hafen. Luftschiff: Freischaltung nötig.</div>
          <button type="button" class="big" id="tmGo" disabled>Reisen</button>
        </div>
      </div>`;
    const modes=root.querySelector('#tmModes');
    MODES.forEach(mm=>{
      const b=document.createElement('button');
      b.type='button';
      const locked=mm.id==='airship' && !airOk;
      b.className='tm-mode'+(state.mode===mm.id?' on':'')+(locked?' locked':'');
      b.textContent=locked? (mm.label+' 🔒') : mm.label;
      b.title=locked? 'Noch nicht freigeschaltet — kaufe ein Ticket oder schließe die Luftschiff-Quest ab.' : mm.blurb;
      b.onclick=()=>{
        if(locked){ hooks.toast?.('Luftschiff gesperrt — Ticket kaufen oder Quest.'); return; }
        state.mode=mm.id; paint();
      };
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
    // harbor glow rings
    regions.filter(r=>r.known && r.harbor).forEach(r=>{
      const px=r.x/100*344+8, py=r.y/100*204+8;
      ctx.strokeStyle='#38bdf866'; ctx.beginPath(); ctx.arc(px,py,10,0,Math.PI*2); ctx.stroke();
    });
    if(cur){
      regions.filter(r=>r.known && !r.current).forEach(r=>{
        let draw=true;
        if(state.mode==='boat' && !boatOk(S,cur,r)) draw=false;
        if(state.mode==='airship' && !airOk) draw=false;
        if(!draw) return;
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
      if(!r.known){ ctx.fillStyle='#444'; ctx.fillRect(px-2,py-2,4,4); return; }
      ctx.fillStyle=r.current?'#fbbf24':(state.selected===r.id?'#34d399':(r.harbor?'#38bdf8':'#c4b5fd'));
      ctx.beginPath(); ctx.arc(px,py, r.current?8:6, 0, Math.PI*2); ctx.fill();
      if(r.harbor){ ctx.fillStyle='#bae6fd'; ctx.font='9px monospace'; ctx.fillText('⚓', px-12, py+3); }
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
    let reason='';
    if(ok && state.mode==='boat' && cur && !boatOk(S,cur,dest)){
      ok=false;
      reason=`⛵ Boot nur Hafen↔Hafen. ${cur.harbor?'Ziel':'Start'} ist kein Hafen.`;
    }
    if(ok && state.mode==='airship' && !airOk){
      ok=false; reason='🛸 Luftschiff gesperrt.';
    }
    go.disabled=!ok;
    if(dest && ok) info.textContent=`${m.label} → ${dest.name} · ca. ${m.hours} Std. · ${m.blurb}`;
    else if(reason) info.textContent=reason;
    else if(!airOk && state.mode==='horse') info.textContent='Pferd frei. Boot: Häfen. Luftschiff: Ticket/Quest.';

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
      if(state.mode==='boat' && cur && !boatOk(S,cur,d)){ hooks.toast?.('Kein Hafenweg.'); return; }
      if(state.mode==='airship' && !airOk){ hooks.toast?.('Luftschiff gesperrt.'); return; }
      root.classList.add('hidden');
      const flair=state.mode==='horse'
        ?`Du satteltst und reitest nach ${d.name}. Hufe auf dem Pfad.`
        :state.mode==='boat'
        ?`Vom Kai stichst du in See — Kurs ${d.name}.`
        :`Das Luftschiff hebt ab. Wolken unter den Planken — Kurs ${d.name}.`;
      try{ hooks.onTravel?.(d.name,{hours:mm.hours, mode:state.mode, flair}); }catch(err){ console.warn(err); }
    };
  }
  paint();
  return root;
}

export default { openTravelMap, dismissTravelMap, MODES, hasAirship, grantAirship, placeIsHarbor, isHarborName };
