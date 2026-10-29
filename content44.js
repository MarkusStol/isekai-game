/** v44: studio visual pass — HD-2D-lite lighting, richer portraits, tile edge polish */
import * as C43 from './content43.js';

/* Re-export C43 portrait API with richer draw */
export function expressionFromMood(m){ return C43.expressionFromMood(m); }
export function appearanceFromNpc(n,npc={}){
  const a=C43.appearanceFromNpc(n,npc);
  const r=String(npc.role||npc.job||npc.beruf||npc.art||'').toLowerCase();
  if(/magier|mage|hexe|zauber/.test(r)){ a.role='mage'; a.cloth=[70,50,120]; }
  if(/wache|guard|ritter|soldat/.test(r)){ a.role='guard'; a.cloth=[70,80,100]; }
  if(/prinzess|princess|königin/.test(r)){ a.role='princess'; a.hairLen='long'; a.bangs=true; a.cloth=[160,80,120]; }
  if(/dämon|daemon|teufel/.test(r)){ a.role='daemon'; a.horn=true; a.cloth=[80,30,50]; a.eyes=[180,60,60]; }
  return a;
}
export function pixelPortraitKey(n,npc,e){ return C43.pixelPortraitKey(n,npc,e)+':v44'; }

function rgb(c){ return `rgb(${c[0]|0},${c[1]|0},${c[2]|0})`; }
function shade(c,f){ return [Math.max(0,Math.min(255,c[0]*f|0)),Math.max(0,Math.min(255,c[1]*f|0)),Math.max(0,Math.min(255,c[2]*f|0))]; }

/** Richer bust on proven 48-grid, rendered at 160px + gold frame */
export function drawPixelPortraitV44(app, expr='neutral', size=160){
  const canvas=document.createElement('canvas');
  canvas.width=size; canvas.height=size;
  const ctx=canvas.getContext('2d');
  ctx.imageSmoothingEnabled=false;
  const s=size/48;
  const px=(x,y,w,h,col)=>{ ctx.fillStyle=typeof col==='string'?col:rgb(col); ctx.fillRect(Math.round(x*s),Math.round(y*s),Math.max(1,Math.round(w*s)),Math.max(1,Math.round(h*s))); };

  // navy panel + inner
  px(0,0,48,48,[11,18,36]);
  px(2,2,44,44,[22,32,56]);
  px(3,3,42,42,[28,40,68]);
  px(3,3,6,6,[16,22,40]); px(39,3,6,6,[16,22,40]);
  px(3,39,6,6,[16,22,40]); px(39,39,6,6,[16,22,40]);

  // cloth + fold + collar
  px(8,34,32,14, app.cloth);
  px(10,36,28,10, shade(app.cloth,1.18));
  px(12,38,24,3, shade(app.cloth,0.72));
  px(18,33,12,4, shade(app.cloth,1.35));
  px(20,30,8,6, app.skin);
  px(21,31,6,4, shade(app.skin,1.08));

  // head
  px(14,10,20,22, app.skin);
  px(15,11,18,20, shade(app.skin,1.06));
  px(16,22,5,5, shade(app.skin,1.12));
  px(27,22,5,5, shade(app.skin,1.12));

  if(app.hairLen==='long'){ px(12,12,24,28, app.hair); px(11,16,4,22, shade(app.hair,0.88)); px(33,16,4,22, shade(app.hair,0.88)); px(14,10,20,8, shade(app.hair,0.85)); }
  else if(app.hairLen==='mid'){ px(13,10,22,16, app.hair); px(12,14,3,12, shade(app.hair,0.9)); px(33,14,3,12, shade(app.hair,0.9)); }
  else { px(14,10,20,8, app.hair); }
  px(16,10,16,3, shade(app.hair,1.25));
  if(app.bangs){ px(15,10,18,6, shade(app.hair,1.1)); px(16,14,6,3, app.hair); px(26,14,6,3, app.hair); }
  else { px(15,10,18,5, shade(app.hair,1.05)); }

  px(12,18,3,5, shade(app.skin,0.95));
  px(33,18,3,5, shade(app.skin,0.95));

  const eyeY = expr==='sad'?21: expr==='angry'?19:20;
  const eyeH = expr==='surprise'?4:3;
  px(18, eyeY, 4, eyeH, [255,255,255]);
  px(26, eyeY, 4, eyeH, [255,255,255]);
  const iris=app.eyes;
  if(expr==='angry'){
    px(19, eyeY+1, 2, 2, iris); px(27, eyeY+1, 2, 2, iris);
    px(17, eyeY-2, 5, 1, shade(app.hair,0.7)); px(26, eyeY-2, 5, 1, shade(app.hair,0.7));
  } else if(expr==='sad'){
    px(19, eyeY+1, 2, 2, iris); px(27, eyeY+1, 2, 2, iris);
    px(18, eyeY-1, 4, 1, shade(app.hair,0.6)); px(26, eyeY-1, 4, 1, shade(app.hair,0.6));
  } else if(expr==='happy'){
    px(18, eyeY+1, 4, 2, iris); px(26, eyeY+1, 4, 2, iris);
    px(19, eyeY+1, 1, 1, [20,20,30]); px(27, eyeY+1, 1, 1, [20,20,30]);
    px(16, 26, 2, 2, shade(app.skin,0.9)); px(30, 26, 2, 2, shade(app.skin,0.9));
  } else if(expr==='cool'){
    px(19, eyeY+1, 2, 1, iris); px(27, eyeY+1, 2, 1, iris);
  } else if(expr==='surprise'){
    px(19, eyeY, 2, 3, iris); px(27, eyeY, 2, 3, iris);
    px(19, eyeY, 1, 1, [255,255,255]); px(27, eyeY, 1, 1, [255,255,255]);
  } else {
    px(19, eyeY+1, 2, 2, iris); px(27, eyeY+1, 2, 2, iris);
    px(19, eyeY, 1, 1, [255,255,255]); px(27, eyeY, 1, 1, [255,255,255]);
  }

  px(22, 24, 2, 3, shade(app.skin,0.88));

  if(expr==='happy'){ px(21,28,6,2, shade(app.skin,0.75)); px(22,29,4,1,[180,80,90]); }
  else if(expr==='angry'){ px(21,29,6,1, shade(app.skin,0.7)); }
  else if(expr==='sad'){ px(22,30,4,1, shade(app.skin,0.7)); }
  else if(expr==='surprise'){ px(22,28,4,3, shade(app.skin,0.7)); px(23,29,2,1,[40,20,30]); }
  else { px(21,29,6,1, shade(app.skin,0.8)); }

  if(app.beard){ px(18,28,12,6, shade(app.hair,0.85)); px(20,30,8,4, app.hair); }
  if(app.scar){ px(28,18,1,6,[160,80,80]); }
  if(app.glasses){ px(17,19,6,5,[40,40,50]); px(25,19,6,5,[40,40,50]); px(23,21,2,1,[40,40,50]); px(18,20,4,3,[180,200,220]); px(26,20,4,3,[180,200,220]); }
  if(app.horn){ px(16,6,3,5,[200,180,160]); px(29,6,3,5,[200,180,160]); }

  if(app.role==='guard'){ px(8,38,32,2,[200,180,80]); px(20,34,8,3,[180,160,60]); }
  if(app.role==='mage'){ px(20,34,8,3,[160,120,220]); px(22,8,4,3,[220,200,255]); }
  if(app.role==='daemon') px(8,40,32,2,[120,20,40]);
  if(app.role==='princess'){ px(18,8,12,3,[240,200,100]); px(8,38,32,2,[200,120,160]); }

  ctx.strokeStyle='#d4b45a'; ctx.lineWidth=Math.max(2, size/40);
  ctx.strokeRect(1,1,size-2,size-2);
  ctx.strokeStyle='rgba(138,112,32,0.45)'; ctx.lineWidth=1;
  ctx.strokeRect(3,3,size-6,size-6);
  return canvas;
}

const _cache=new Map();
export function pixelPortraitUrl(name, npc={}, expr){
  const e=expr||expressionFromMood(npc?.mood);
  const key=pixelPortraitKey(name,npc,e);
  if(_cache.has(key)) return _cache.get(key);
  if(typeof document==='undefined') return null;
  const app=appearanceFromNpc(name,npc);
  const url=drawPixelPortraitV44(app,e,160).toDataURL('image/png');
  _cache.set(key,url);
  if(_cache.size>240){ const k=_cache.keys().next().value; _cache.delete(k); }
  return url;
}
export function applyPixelPortraitToImg(img,name,npc,expr){
  if(!img) return null;
  const url=pixelPortraitUrl(name,npc,expr);
  if(!url) return null;
  img.src=url; img.classList.add('pixelated','px-port');
  return url;
}

/* ---- OW lighting / autotile helpers (canvas 2D, iPhone-safe) ---- */
export function drawTileEdgeBlend(ctx, sx, sy, tw, mask){
  // mask bits: N=1 E=2 S=4 W=8 when neighbor tile differs
  if(!mask) return;
  ctx.fillStyle='rgba(0,0,0,0.34)';
  if(mask&1) ctx.fillRect(sx, sy, tw, Math.max(1,tw*0.12));
  if(mask&4) ctx.fillRect(sx, sy+tw-Math.max(1,tw*0.12), tw, Math.max(1,tw*0.12));
  if(mask&8) ctx.fillRect(sx, sy, Math.max(1,tw*0.12), tw);
  if(mask&2) ctx.fillRect(sx+tw-Math.max(1,tw*0.12), sy, Math.max(1,tw*0.12), tw);
  // corner soften
  ctx.fillStyle='rgba(0,0,0,0.18)';
  if((mask&1)&&(mask&8)) ctx.fillRect(sx,sy,tw*0.2,tw*0.2);
  if((mask&1)&&(mask&2)) ctx.fillRect(sx+tw*0.8,sy,tw*0.2,tw*0.2);
  if((mask&4)&&(mask&8)) ctx.fillRect(sx,sy+tw*0.8,tw*0.2,tw*0.2);
  if((mask&4)&&(mask&2)) ctx.fillRect(sx+tw*0.8,sy+tw*0.8,tw*0.2,tw*0.2);
}

export function neighborDiffMask(map, x, y){
  if(!map?.tiles) return 0;
  const t=map.tiles[y]?.[x];
  if(t==null) return 0;
  let m=0;
  const at=(xx,yy)=>map.tiles[yy]?.[xx];
  if(at(x,y-1)!=null && at(x,y-1)!==t) m|=1;
  if(at(x+1,y)!=null && at(x+1,y)!==t) m|=2;
  if(at(x,y+1)!=null && at(x,y+1)!==t) m|=4;
  if(at(x-1,y)!=null && at(x-1,y)!==t) m|=8;
  return m;
}

export function drawOwLighting(ctx, cssW, cssH, heroScreen, dayTint){
  // v45d: light edge vignette only — heavy radial made map look like a floating circle
  const g=ctx.createRadialGradient(cssW/2,cssH*0.5, Math.min(cssW,cssH)*0.42, cssW/2,cssH*0.5, Math.max(cssW,cssH)*0.78);
  g.addColorStop(0,'rgba(0,0,0,0)');
  g.addColorStop(0.75,'rgba(0,0,0,0.04)');
  g.addColorStop(1,'rgba(5,7,14,0.22)');
  ctx.fillStyle=g; ctx.fillRect(0,0,cssW,cssH);
  // soft hero key light
  if(heroScreen){
    const {x,y,r}=heroScreen;
    const lg=ctx.createRadialGradient(x,y,0,x,y,(r||80)*0.9);
    const warm = dayTint==='night' ? 'rgba(120,160,255,0.08)' : dayTint==='dusk' ? 'rgba(255,140,80,0.09)' : 'rgba(255,230,180,0.06)';
    lg.addColorStop(0, warm);
    lg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle=lg; ctx.fillRect(0,0,cssW,cssH);
  }
  // subtle film grain strip (top) — skip if reduced motion via CSS class
  if(!document.body.classList.contains('reduced-motion')){
    ctx.fillStyle='rgba(255,255,255,0.015)';
    for(let i=0;i<6;i++){
      const yy=((performance.now()/40+i*37)|0)%cssH;
      ctx.fillRect(0,yy,cssW,1);
    }
  }
}

export function ensureBattleBgAnim(){
  const bg=document.getElementById('battleBg');
  if(!bg) return;
  bg.classList.add('battle-bg-live');
}

export function migrateV44(S){
  C43.migrateV43(S);
  S.flags=S.flags||{};
  S.flags.visual44=true;
  S.flags.pxPortraits=true;
  S.ver=44;
  return S;
}

export default {
  expressionFromMood, appearanceFromNpc, pixelPortraitKey, pixelPortraitUrl,
  applyPixelPortraitToImg, drawPixelPortraitV44, drawTileEdgeBlend, neighborDiffMask,
  drawOwLighting, ensureBattleBgAnim, migrateV44,
};
