/** v45: mobile fullscreen layout helpers + real portrait resolver (LPC/port assets) */
import * as C44 from './content44.js';

export const ROLE_PORT = {
  guard: './assets/pixel/portrait/guard.png',
  mage: './assets/pixel/portrait/mage.png',
  merchant: './assets/pixel/portrait/merchant.png',
  spy: './assets/pixel/portrait/spy.png',
  princess: './assets/pixel/portrait/princess.png',
  daemon: './assets/pixel/portrait/daemon.png',
  villager: './assets/pixel/portrait/villager.png',
  hero: './assets/pixel/portrait/hero.png',
  neutral: './assets/pixel/portrait/neutral.png',
};

const NAME_SLUG = {
  lyra:'lyra', elise:'elise', mira:'mira', orren:'orren', otto:'otto',
  rhett:'rhett', garrick:'garrick', julian:'julian', brok:'brok',
};

function slugFromName(name){
  const n=String(name||'').toLowerCase();
  for(const [k,v] of Object.entries(NAME_SLUG)){ if(n.includes(k)) return v; }
  // only known licensed/AI port files — never invent 404 slugs like "liora"
  return null;
}

export function roleFromNpc(name, npc={}){
  const app=C44.appearanceFromNpc(name, npc);
  return app.role||'villager';
}

/** Prefer named port art, then LPC role bust, then C44 procedural framed */
export function resolvePortraitUrl(name, npc={}, expr){
  const slug=slugFromName(name);
  if(slug){
    // game serves webp; browser will 404→fallback via onerror chain in setPortrait
    return { kind:'port', url:`assets/port/${slug}.webp`, slug };
  }
  const role=roleFromNpc(name, npc);
  const path=ROLE_PORT[role]||ROLE_PORT.villager;
  return { kind:'role', url:path, role };
}

/** Upscale LPC 48² bust into framed 160² pixel canvas (readable face) */
export function frameRolePortrait(img, size=160, accent='#d4b45a'){
  const canvas=document.createElement('canvas');
  canvas.width=size; canvas.height=size;
  const ctx=canvas.getContext('2d');
  ctx.imageSmoothingEnabled=false;
  ctx.fillStyle='#0b1224'; ctx.fillRect(0,0,size,size);
  ctx.fillStyle='#162038'; ctx.fillRect(4,4,size-8,size-8);
  // LPC 48² bust: scale to nearly fill frame so face is readable
  const iw=img.naturalWidth||48, ih=img.naturalHeight||48;
  const scale=Math.max(2, Math.floor((size-8)/Math.max(iw,ih)));
  const dw=iw*scale, dh=ih*scale;
  const dx=((size-dw)/2)|0, dy=((size-dh)/2)|0;
  ctx.drawImage(img, 0,0,iw,ih, dx,dy,dw,dh);
  ctx.strokeStyle=accent; ctx.lineWidth=Math.max(3,size/36);
  ctx.strokeRect(2,2,size-4,size-4);
  return canvas.toDataURL('image/png');
}

const _framed=new Map();
export function framedRolePortraitUrl(role){
  const key=role||'villager';
  if(_framed.has(key)) return _framed.get(key);
  return null; // async fill via loadFramedRolePortrait
}

export function loadFramedRolePortrait(role){
  const key=role||'villager';
  if(_framed.has(key)) return Promise.resolve(_framed.get(key));
  const src=ROLE_PORT[key]||ROLE_PORT.villager;
  return new Promise((res)=>{
    const im=new Image();
    im.onload=()=>{
      try{
        const url=frameRolePortrait(im,160);
        _framed.set(key,url); res(url);
      }catch(_){ res(null); }
    };
    im.onerror=()=>res(null);
    im.src=src;
  });
}

/** Densify: add houses/props around spawn if map is sparse */
export function densifyTownMap(map){
  if(!map?.tiles || map.kind==='dungeon' || map.kind==='wild') return map;
  const w=map.w, h=map.h;
  const cx=(w/2)|0, cy=(h/2)|0;
  // shrink empty plaza: convert outer plaza ring to path/grass
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){
    if(map.tiles[y][x]==='plaza'){
      const d=Math.max(Math.abs(x-cx), Math.abs(y-cy));
      if(d>=2) map.tiles[y][x]=(d%2===0)?'path':'grass';
    }
  }
  // sprinkle overlays only — never flower as ground (transparent → black)
  if(!map.overlay) map.overlay=Array.from({length:h},()=>Array(w).fill(null));
  const overlays=['bush','flower','lamp','bush','flower','bench','flower','bush'];
  for(let i=0;i<18;i++){
    const a=(i*37+11)%(w-4)+2, b=(i*53+7)%(h-4)+2;
    if(Math.abs(a-cx)<=1 && Math.abs(b-cy)<=1) continue;
    const cur=map.tiles[b][a];
    if(cur!=='grass' && cur!=='path' && cur!=='plaza') continue;
    if(!map.overlay[b][a]) map.overlay[b][a]=overlays[i%overlays.length];
  }
  // cross paths through town like Chrono Trigger
  for(let x=2;x<w-2;x++){
    if(map.tiles[cy][x]==='grass'||map.tiles[cy][x]==='plaza') map.tiles[cy][x]='path';
  }
  for(let y=2;y<h-2;y++){
    if(map.tiles[y][cx]==='grass'||map.tiles[y][cx]==='plaza') map.tiles[y][cx]='path';
  }
  return map;
}

export function migrateV45(S){
  C44.migrateV44(S);
  S.flags=S.flags||{};
  S.flags.layout45=true;
  S.flags.portraits45=true;
  S.ver=45;
  return S;
}

export default {
  ROLE_PORT, resolvePortraitUrl, frameRolePortrait, loadFramedRolePortrait,
  framedRolePortraitUrl, roleFromNpc, densifyTownMap, migrateV45,
};
