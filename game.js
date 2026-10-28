import * as Sim from './sim.js';
import * as Persist from './persist.js';
import * as WorldMap from './map.js';
import * as Econ from './econ.js';
import * as Codex from './codex.js';
import * as UI13 from './ui13.js';
import * as Level from './leveling.js';
import * as UI14 from './ui14.js';
import * as Know from './know.js';
import * as Cont from './continuity.js';
import * as Imm from './immerse.js';
import * as Battle from './battle.js';
import { pickEncounter, battleBgFor, enemyById } from './enemies.js';
import * as Jobs from './jobs.js';
import * as Gems from './gems.js';
import * as Summons from './summons.js';
import * as Equip from './equip.js';
import * as Jrpg from './jrpg.js';
const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];const R=a=>a[Math.floor(Math.random()*a.length)];const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const VER=17,CACHE_V='v17';
const ROLES={
 held:{e:'⚔️',name:'Held mit Status-System',d:'Ein blaues Fenster erscheint: [Status]. Die Welt braucht dich.',world:'Königreich Aldheim',
  base:{hp:100,mp:40,str:12,cha:8,ruf:10,gold:40},cls:['Abenteurer','Ritter','Held','Legendärer Held'],pack:'worlds/held.json',
  destiny:'Als Held beschworen – mit Statusfenster und einer Welt am Abgrund.',
  scene:'epic anime summoning circle royal hall torchlight princess knights'},
 villainess:{e:'🌹',name:'Villainess',d:'Du erwachst als Lady Rosalind – die Schurkin aus einem Otome-Roman. Dein Untergang ist in 1 Jahr.',world:'Akademie von Lumière',
  base:{hp:70,mp:60,str:5,cha:16,ruf:-20,gold:120},cls:['Verstoßene Lady','Salonlöwin','Herzogin','Kaiserin der Intrige'],pack:'worlds/villainess.json',
  destiny:'Als Villainess in einem Otome-Roman – 365 Tage bis zum Untergang.',
  scene:'anime otome academy noble lady rose garden mirror ornate bedroom'},
 daemon:{e:'😈',name:'Dämonenkönig',d:'Du erwachst auf einem Thron aus Knochen. Deine Diener knien – und ein Held ist unterwegs.',world:'Das Dunkle Reich Nocturna',
  base:{hp:160,mp:120,str:20,cha:6,ruf:-50,gold:200},cls:['Gefallener Fürst','Dämonenlord','Dämonenkönig','Gott der Nacht'],pack:'worlds/daemon.json',
  destiny:'Als Dämonenkönig auf einem Thron aus Knochen – mit einer Heldin am Horizont.',
  scene:'dark fantasy demon throne bone castle red moon kneeling army anime'},
 mensch:{e:'🧑',name:'Normaler Mensch',d:'Keine Kräfte, kein Status. Nur du, ein Dorf und viel Hoffnung.',world:'Dorf Kleinbach',
  base:{hp:60,mp:0,str:6,cha:8,ruf:0,gold:8},cls:['Dorfbewohner','Lehrling','Meister','Ungekrönter Legende'],pack:'worlds/mensch.json',
  destiny:'Als ganz normaler Mensch – ohne Kräfte, nur mit Hoffnung.',
  scene:'cozy anime village meadow hay barn morning light rural fantasy'},
 grey:{e:'🌫️',name:'Greymourne',d:'Ein Nachtzug hält, wo er nicht halten dürfte.',world:'Greymourne',
  base:{hp:100,mp:0,str:0,cha:0,ruf:0,gold:12},cls:['Fahrgast','Gast im Eisernen Licht','Eingetragen','Wer durch den Nebel kommt'],hidden:1,pack:'worlds/greymourne.json',
  destiny:'Ein Buch aus Nebel – Greymourne.',
  scene:'foggy victorian train station night lamp gaslight horror atmosphere'}
};
const ISEKAI=Object.keys(ROLES).filter(k=>!ROLES[k].hidden);const isG=()=>S&&S.role==='grey';
const STAGES=['Fremd','Bekannt','Freund','Vertraut','Verliebt','Partner'];
const STAGE_NEED=[0,15,35,55,75,90];
const PHASES=['Nacht','Morgen','Mittag','Nachmittag','Abend','Spät'];
const PHASE_H={[0]:'Nacht',[1]:'Nacht',[2]:'Nacht',[3]:'Nacht',[4]:'Nacht',[5]:'Morgen',[6]:'Morgen',[7]:'Morgen',[8]:'Morgen',[9]:'Morgen',[10]:'Mittag',[11]:'Mittag',[12]:'Mittag',[13]:'Nachmittag',[14]:'Nachmittag',[15]:'Nachmittag',[16]:'Nachmittag',[17]:'Abend',[18]:'Abend',[19]:'Abend',[20]:'Abend',[21]:'Spät',[22]:'Spät',[23]:'Spät'};
const PACKS={};let GREY=null;
async function loadPack(role){const path=ROLES[role].pack;if(PACKS[role])return PACKS[role];
 const j=await(await fetch(path+'?'+CACHE_V)).json();PACKS[role]=j;if(role==='grey')GREY=j;return j}
async function loadGrey(){return loadPack('grey')}

const KEY='isekai_save_v1',CFG='isekai_cfg_v1';
let S=null,cfg=JSON.parse(localStorage.getItem(CFG)||'{"mode":"gemini"}'),engine=null,busy=false,_dbgMs=0,_menuTab='status';
let _twTimer=null,_twDone=true,_twFull='',_mode='title'; // title | intro | setup | play
let _musicOn=false,_audioCtx=null,_musicNodes=null;


/* ---------- images: CSS themes + validated Pollinations (reject placards) ---------- */
const IMG_STYLE='anime style, detailed illustration, cinematic lighting, vibrant colors, high quality, ';
const IMG_STYLE_GREY='atmospheric literary illustration, muted colors, fog, victorian, painterly, ';
function hashSeed(str){let h=2166136261>>>0;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0)%100000}
function imgUrl(prompt,w,h,seed,grey){const style=grey?IMG_STYLE_GREY:IMG_STYLE;
 const p=encodeURIComponent(style+String(prompt||'fantasy scene').slice(0,200));
 return `https://image.pollinations.ai/prompt/${p}?width=${w||512}&height=${h||896}&nologo=true&seed=${seed||42}&referrer=${encodeURIComponent('https://markusstol.github.io/isekai-game/')}`}
let _imgQ=Promise.resolve(),_imgBusy=false;
function enqueueImg(loadFn){_imgQ=_imgQ.then(()=>loadFn(),()=>loadFn());return _imgQ}
let _imgTmp={scenes:{},portraits:{},ok:{},fail:{},next:{}};
function ensureImgCache(){const c=S?(S.imgCache||(S.imgCache={scenes:{},portraits:{},ok:{},fail:{},next:{}})):_imgTmp;
 if(!c.ok)c.ok={};if(!c.fail)c.fail={};if(!c.next)c.next={};if(!c.scenes)c.scenes={};if(!c.portraits)c.portraits={};return c}
function scenePromptFor(ort,extra){const base=ort||'fantasy place';const tone=isG()?'foggy mysterious':'anime fantasy';
 return `${tone} scene, ${base}${extra?', '+extra:''}, environment establishing shot, no text`}
function portraitPromptFor(name,npc){const art=(npc&&npc.art)||'';const g=npc&&npc.geschlecht?npc.geschlecht+' ':'';
 return `character portrait bust, ${g}${name}, ${String(art).slice(0,100)}, looking at viewer, soft background, no text`}

function themeFromText(txt){const s=String(txt||'').toLowerCase();
 if(/zombie|beißer|safehouse|horde|apocalypse|parkplatz/.test(s))return 'zombie';
 if(/cyber|neon|konzern|netrunner/.test(s))return 'cyber';
 if(/asche|fluch|darkfantasy|blutmond/.test(s))return 'ash';
 if(/survival|wildnis|basislager|forst/.test(s))return 'survival';
 if(/grey|nebel|fog|zug|train|bahnhof|eisen|greymourne/.test(s))return 'fog';
 if(/nachtzug|abteil|messing/.test(s))return 'train';
 if(/regen|asphalt|scheinwerfer|straße|street|city night|hupen/.test(s))return 'street';
 if(/stern|void|dunkelheit|dazwischen|kosmos|starfield|cosmos/.test(s))return 'stars';
 if(/göttin|tempel|ethereal|lichtspiegel|gestalt|angebot|goddess|temple/.test(s))return 'temple';
 if(/akademie|salon|rose|otome|lumière|lumiere|academy/.test(s))return 'academy';
 if(/thron|dämon|daemon|nocturna|knochen|armee|throne/.test(s))return 'throne';
 if(/dorf|kleinbach|heu|wiese|taverne|village|morgenlicht/.test(s))return 'village';
 if(/wald|forest|bäume|hexe|woods|trees/.test(s))return 'forest';
 if(/kerker|dungeon|höhle|keller|katakom|cave/.test(s))return 'dungeon';
 if(/stadt|markt|gasse|city|hauptstadt|market/.test(s))return 'city';
 if(/burg|palast|halle|hall|ritter|knight|beschwörung|summon|castle|thronsaal|aldheim|royal|torch/.test(s))return 'castle';
 if(/nacht|mond|spät|night|moon/.test(s))return 'night';
 return isG()?'fog':'void'}

function buildSceneArt(theme){const art=$('#sceneArt');if(!art)return;art.innerHTML='';
 const add=(html)=>{art.insertAdjacentHTML('beforeend',html)};
 if(theme==='street'){add('<div class="mist" style="background:linear-gradient(180deg,transparent,#1a0820aa);bottom:0;height:50%"></div>');
  for(let i=0;i<14;i++)add(`<div style="position:absolute;left:${8+i*7}%;top:-5%;width:2px;height:18px;background:#9cf8;animation:rain 0.9s linear ${i*.07}s infinite"></div>`);
  add('<div class="sil" style="left:10%;width:18%;height:28%;background:#0006;border-radius:4px 4px 0 0"></div><div class="sil" style="right:12%;width:22%;height:36%;background:#0005;border-radius:6px 6px 0 0"></div>')}
 else if(theme==='stars'||theme==='void'||theme==='temple'){for(let i=0;i<18;i++)add(`<div class="spark" style="left:${5+Math.random()*90}%;top:${5+Math.random()*55}%;animation-delay:${Math.random()*3}s"></div>`);
  add('<div class="orb" style="width:120px;height:120px;left:30%;top:12%;background:radial-gradient(circle,#ff9ad588,#a78bfa22)"></div>');
  if(theme==='temple')add('<div style="position:absolute;left:10%;right:10%;top:8%;height:22%;background:linear-gradient(90deg,transparent,#cbb8ff44,transparent);animation:aurora 8s ease-in-out infinite"></div>')}
 else if(theme==='castle'){add('<div class="sil" style="left:18%;width:64%;height:42%;background:linear-gradient(180deg,#2a1848,#0a0610);clip-path:polygon(0% 100%,0% 40%,8% 40%,8% 20%,18% 20%,18% 40%,30% 40%,30% 10%,42% 10%,42% 40%,55% 40%,55% 25%,70% 25%,70% 40%,85% 40%,85% 15%,100% 15%,100% 100%)"></div>');
  add('<div class="orb" style="width:50px;height:50px;right:14%;top:10%;background:radial-gradient(circle,#ffe7a6aa,transparent);opacity:.7"></div>')}
 else if(theme==='academy'){add('<div class="sil" style="left:22%;width:56%;height:48%;background:linear-gradient(180deg,#5a3080aa,#1a1040);border-radius:40% 40% 0 0"></div>');
  for(let i=0;i<8;i++)add(`<div class="spark" style="left:${20+i*8}%;top:${30+((i*17)%40)}%;background:#ffb0d0"></div>`)}
 else if(theme==='throne'){add('<div class="orb" style="width:180px;height:180px;left:28%;top:8%;background:radial-gradient(circle,#ff3a5088,#5a102022);opacity:.7"></div>');
  add('<div class="sil" style="left:35%;width:30%;height:38%;background:linear-gradient(180deg,#3a0810,#100408);clip-path:polygon(10% 100%,20% 30%,50% 0,80% 30%,90% 100%)"></div>')}
 else if(theme==='village'){add('<div class="orb" style="width:70px;height:70px;right:18%;top:8%;background:radial-gradient(circle,#ffe08a,transparent);opacity:.85"></div>');
  add('<div class="sil" style="left:8%;width:28%;height:22%;background:#2a4018cc;border-radius:50% 50% 0 0"></div>');
  add('<div class="sil" style="left:40%;width:20%;height:18%;background:#4a3020cc;clip-path:polygon(0 100%,0 40%,50% 0,100% 40%,100% 100%)"></div>');
  add('<div class="sil" style="right:10%;width:24%;height:20%;background:#2a4018cc;border-radius:50% 50% 0 0"></div>')}
 else if(theme==='forest'){for(let i=0;i<7;i++)add(`<div class="sil" style="left:${6+i*13}%;width:${10+i%3*4}%;height:${30+i*4}%;background:linear-gradient(180deg,#1a4028,#061208);border-radius:40% 40% 0 0"></div>`);
  for(let i=0;i<10;i++)add(`<div class="spark" style="left:${10+i*8}%;top:${40+((i*23)%35)}%;background:#9dffb0;width:2px;height:2px"></div>`)}
 else if(theme==='dungeon'){add('<div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg,#ffffff06 0 2px,transparent 2px 48px),repeating-linear-gradient(0deg,#ffffff05 0 2px,transparent 2px 36px);opacity:.5"></div>');
  add('<div class="orb" style="width:40px;height:40px;left:20%;top:30%;background:radial-gradient(circle,#ff8a4aaa,transparent)"></div>')}
 else if(theme==='city'){for(let i=0;i<9;i++)add(`<div class="sil" style="left:${5+i*11}%;width:${8+i%3*3}%;height:${20+((i*19)%40)}%;background:#0a1220ee;box-shadow:inset 0 0 0 1px #6af3"></div>`);
  add('<div class="mist" style="background:linear-gradient(180deg,transparent,#1a284888)"></div>')}
 else if(theme==='night'){add('<div class="orb" style="width:60px;height:60px;right:16%;top:8%;background:radial-gradient(circle,#dfe7ff,#8a9ccc22);opacity:.9"></div>');
  for(let i=0;i<16;i++)add(`<div class="spark" style="left:${Math.random()*90+5}%;top:${Math.random()*50+5}%"></div>`)}
 else if(theme==='fog'||theme==='train'){add('<div class="mist" style="background:linear-gradient(180deg,#9aa3ae33,#cfd5dc22);height:60%;bottom:10%;animation-duration:18s"></div>');
  add('<div class="mist" style="background:linear-gradient(180deg,transparent,#8a909a44);height:40%;bottom:0;animation-duration:22s;animation-direction:reverse"></div>');
  if(theme==='train')add('<div class="sil" style="left:12%;right:12%;height:28%;bottom:22%;background:linear-gradient(180deg,#2a2418,#0e0c08);border-radius:8px;opacity:.35"></div>')}
 else {for(let i=0;i<12;i++)add(`<div class="spark" style="left:${Math.random()*90+5}%;top:${Math.random()*60+5}%"></div>`)}
}

function applySceneTheme(theme){const bg=$('#sceneBg');if(!bg)return;const th=theme||'void';
  bg.dataset.theme=th; bg.className='scene-bg theme-'+th;
  const genre=S?.genre||(isG()?'grey':(S?.role||'held'));
  document.body.dataset.genre=genre;
  document.body.classList.toggle('greyw', isG()||genre==='grey');
  document.body.classList.remove('genre-zombie','genre-cyberpunk','genre-darkfantasy','genre-fantasy','genre-postapoc','genre-grey');
  const map={zombie:'genre-zombie',cyberpunk:'genre-cyberpunk',darkfantasy:'genre-darkfantasy',dark:'genre-darkfantasy',postapoc:'genre-postapoc',grey:'genre-grey',held:'genre-fantasy',villainess:'genre-fantasy',daemon:'genre-darkfantasy',mensch:'genre-fantasy'};
  document.body.classList.add(map[genre]||'genre-fantasy');
}
function applyGenreTheme(genre){const g=String(genre||S?.genre||S?.role||'held').toLowerCase(); document.body.dataset.genre=g;
  document.body.classList.remove('genre-zombie','genre-cyberpunk','genre-darkfantasy','genre-fantasy','genre-postapoc','genre-grey');
  const map={zombie:'genre-zombie',cyberpunk:'genre-cyberpunk',darkfantasy:'genre-darkfantasy',dark:'genre-darkfantasy',postapoc:'genre-postapoc',grey:'genre-grey',held:'genre-fantasy',villainess:'genre-fantasy',daemon:'genre-darkfantasy',mensch:'genre-fantasy'};
  document.body.classList.add(map[g]||'genre-fantasy');
}

function portColors(name){const h=hashSeed(String(name||'x'));const hues=[[255,111,181],[123,107,255],[110,200,255],[255,180,100],[160,255,180],[255,120,140],[200,160,255]];
 const a=hues[h%hues.length],b=hues[(h*3)%hues.length];return {a:`rgb(${a[0]},${a[1]},${a[2]})`,b:`rgb(${(b[0]*0.35)|0},${(b[1]*0.35)|0},${(b[2]*0.35)|0})`,hexA:`#${a.map(x=>x.toString(16).padStart(2,'0')).join('')}`}}
function initialsOf(name){const p=String(name||'?').replace(/[^a-zA-ZäöüÄÖÜß\s]/g,' ').trim().split(/\s+/).filter(Boolean);
 if(!p.length)return '?';if(p.length===1)return p[0].slice(0,2).toUpperCase();return (p[0][0]+p[p.length-1][0]).toUpperCase()}
function stylizedPortraitHTML(name,npc){const col=portColors(name);const e=(npc&&npc.e)||'✦';
 let label='…';try{label=Know.isNameKnown(S,name)?name:Know.displayName(S,name,npc)}catch(_){label=String(name||'').split(' ').slice(-1)[0].slice(0,10)}
 return `<div class="port-svg" style="--port-a:${col.a};--port-b:${col.b};width:100%;height:100%;display:grid;place-items:center;background:linear-gradient(160deg,${col.a},${col.b})"><div style="text-align:center"><div style="font-size:28px;line-height:1">${e}</div><div style="font-size:10px;margin-top:4px;opacity:.85">${label}</div></div></div>`}
function applyPortraitFallback(name,npc){const ph=$('#portraitPh');if(!ph)return;const col=portColors(name);
 ph.style.setProperty('--port-a',col.a);ph.style.setProperty('--port-b',col.b);
 ph.innerHTML=stylizedPortraitHTML(name,npc);ph.classList.remove('hidden')}

/** Reject Pollinations free-limit placards (yellow/flat) via canvas sampling */
function analyzeImage(img){try{const w=Math.min(64,img.naturalWidth||0),h=Math.min(64,img.naturalHeight||0);
 if(w<8||h<8)return {ok:false,reason:'tiny'};
 const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{willReadFrequently:true});
 ctx.drawImage(img,0,0,w,h);const data=ctx.getImageData(0,0,w,h).data;
 let n=0,yellow=0,sum=0,sum2=0,rSum=0,gSum=0,bSum=0;
 for(let i=0;i<data.length;i+=4){const r=data[i],g=data[i+1],b=data[i+2],a=data[i+3];if(a<20)continue;n++;
  const lum=(r*299+g*587+b*114)/1000;sum+=lum;sum2+=lum*lum;rSum+=r;gSum+=g;bSum+=b;
  // yellow/amber placard tones
  if(r>170&&g>140&&b<120&&(r+g)>2.2*b)yellow++}
 if(!n)return {ok:false,reason:'empty'};
 const mean=sum/n,variance=sum2/n-mean*mean,yRatio=yellow/n;
 const avgR=rSum/n,avgG=gSum/n,avgB=bSum/n;
 if(yRatio>0.28)return {ok:false,reason:'yellow',yRatio,variance};
 if(variance<180&&avgR>160&&avgG>130&&avgB<140)return {ok:false,reason:'flat-yellow',variance};
 if(variance<90)return {ok:false,reason:'flat',variance};
 return {ok:true,yRatio,variance,avg:[avgR|0,avgG|0,avgB|0]}}
 catch(e){return {ok:false,reason:'cors-or-error',err:String(e)}}}

function loadValidatedImage(url){return new Promise(resolve=>{
 const pre=new Image();pre.crossOrigin='anonymous';
 const done=(ok,meta)=>{resolve({ok:!!ok,img:ok?pre:null,meta:meta||{}})};
 pre.onload=()=>{const meta=analyzeImage(pre);done(meta.ok,meta)};
 pre.onerror=()=>done(false,{reason:'error'});
 // cache-bust lightly on retries via existing url
 pre.src=url+(url.includes('?')?'&':'?')+'_cb='+(Date.now()%100000)})}

function markFail(cache,key){cache.fail[key]=(cache.fail[key]|0)+1;const n=cache.fail[key];
 cache.next[key]=Date.now()+Math.min(30*60*1000, Math.pow(2,Math.min(6,n))*8000);delete cache.ok[key]}
function canRetry(cache,key){if(cache.ok[key])return false;const t=cache.next[key]|0;return Date.now()>=t}
function scheduleRetry(kind,key,fn){const cache=ensureImgCache();const wait=Math.max(0,(cache.next[key]|0)-Date.now());
 setTimeout(()=>{if(canRetry(cache,key)||!cache.ok[key])fn()},Math.min(wait||12000,120000))}

function hideScenePhoto(){const img=$('#sceneImg');if(!img)return;img.classList.remove('on');img.removeAttribute('src');img.dataset.key=''}
function hidePortraitPhoto(){const img=$('#portraitImg');if(!img)return;img.classList.remove('on');img.removeAttribute('src');img.dataset.name=''}

function setSceneImage(prompt,key,opts){opts=opts||{};const cache=ensureImgCache();const k=key||prompt||'default';
 const theme=themeFromText((prompt||'')+' '+(k||'')+' '+(S?.world?.scene?.ort||'')+' '+(S?.role||'')+' '+(S?.genre||''));
 applySceneTheme(theme);hideScenePhoto();
 const forceCss=!!opts.cssOnly||!!window.__FORCE_CSS_SCENES;
 if(forceCss){cache.next[k]=Date.now()+60000;return}
 // 1) local asset library first
 const locals=tryLocalBg(S?.world?.scene?.ort||k, locNode(S?.world?.scene?.ort)?.bg);
 const tryLocal=async()=>{
  for(const path of locals){try{const r=await fetch(path,{method:'HEAD'});if(r.ok){const img=$('#sceneImg');if(!img)return true;
   img.crossOrigin='anonymous';img.dataset.key=k;try{await Imm.crossfadeScene(img,path)}catch(_){img.src=path;img.classList.add('on','scene-kenburns')}cache.ok[k]=1;cache.scenes[k]=path;if(S)save();return true}}catch(_){}}
  // also try .svg
  for(const path of locals.map(x=>x.replace(/\.webp$/,'.svg'))){try{const r=await fetch(path,{method:'HEAD'});if(r.ok){const img=$('#sceneImg');img.src=path;img.dataset.key=k;requestAnimationFrame(()=>img.classList.add('on'));cache.ok[k]=1;return true}}catch(_){}}
  return false};
 if(window.__SKIP_REMOTE_IMG){tryLocal();return}
 const seed=hashSeed('scene:'+k+(S?.role||'')+(S?.genre||''));
 const url=imgUrl(prompt||scenePromptFor(k),512,896,seed,isG());
 cache.scenes[k]=url;
 if(!canRetry(cache,k)&&cache.fail[k]){tryLocal().then(ok=>{if(!ok)scheduleRetry('scene',k,()=>setSceneImage(prompt,key,opts))});return}
 enqueueImg(()=>tryLocal().then(ok=>{if(ok)return;return loadValidatedImage(url).then(res=>{
  const img=$('#sceneImg');if(!img)return;
  if(res.ok){cache.ok[k]=1;delete cache.fail[k];delete cache.next[k];img.dataset.key=k;try{Imm.crossfadeScene(img,url)}catch(_){img.src=url;requestAnimationFrame(()=>img.classList.add('on','scene-kenburns'))};if(S)save()}
  else{markFail(cache,k);hideScenePhoto();scheduleRetry('scene',k,()=>setSceneImage(prompt,key,{...opts}));if(S)save()}
 })}) )}

function setPortrait(name,npc){const cache=ensureImgCache();const wrap=$('#portraitWrap'),img=$('#portraitImg');
 try{wrap.classList.remove('mood-anger','mood-sad','mood-warm','mood-cool','mood-neutral');wrap.classList.add(Imm.portraitMoodClass(npc?.mood));wrap.classList.add('portrait-in')}catch(_){}
 if(!name){wrap&&wrap.classList.add('hidden');return}
 wrap.classList.remove('hidden');applyPortraitFallback(name,npc);hidePortraitPhoto();
 if(window.__FORCE_CSS_SCENES)return;
 const slug=portAssetKey(name,npc);const local=`assets/port/${slug}.webp`;const localSvg=`assets/port/${slug}.svg`;
 const seed=hashSeed('port:'+name+(S?.role||''));
 const url=imgUrl(portraitPromptFor(name,npc),192,192,seed,isG());
 cache.portraits[name]=url;const key='port:'+name;
 const showLocal=async()=>{for(const path of[local,localSvg]){try{const r=await fetch(path,{method:'HEAD'});if(r.ok){img.crossOrigin='anonymous';img.src=path;img.dataset.name=name;requestAnimationFrame(()=>img.classList.add('on'));cache.ok[key]=1;return true}}catch(_){}}return false};
 if(!canRetry(cache,key)&&cache.fail[key]){showLocal().then(ok=>{if(!ok)scheduleRetry('port',key,()=>setPortrait(name,npc))});if(S)save();return}
 enqueueImg(()=>showLocal().then(ok=>{if(ok){if(S)save();return}return loadValidatedImage(url).then(res=>{
  if(!res.ok){markFail(cache,key);hidePortraitPhoto();scheduleRetry('port',key,()=>setPortrait(name,npc));if(S)save();return}
  cache.ok[key]=1;delete cache.fail[key];delete cache.next[key];
  img.src=url;img.dataset.name=name;requestAnimationFrame(()=>img.classList.add('on'));if(S)save()})}))}

function maybeSceneFromWorld(){if(!S?.world?.scene?.ort)return;const ort=S.world.scene.ort;const zeit=S.world.scene.zeit||phaseLabel();
 const prompt=(S.flags&&S.flags.scenePrompt)||scenePromptFor(ort,zeit);setSceneImage(prompt,ort)}
function maybePortraitsPresent(){const here=(S?.world?.scene?.anwesend||[]).filter(n=>{if(S.world.npcs[n]?.alive===false)return false;try{return Know.isNameKnown(S,n)}catch(_){return false}});if(here[0])setPortrait(here[0],S.world.npcs[here[0]]);else if($('#portraitWrap'))$('#portraitWrap').classList.add('hidden')}

/* ---------- v12: location graph, travel, NPC memory, crime ---------- */
function ensureGraph(s){s=s||S;if(!s?.world)return null;const pack=PACKS[s.role]||GREY||{};
 const g=s.world.graph||pack.locations||null;if(!g)return null;
 if(!s.world.graph)s.world.graph=JSON.parse(JSON.stringify(g));
 // sync orte
 for(const[name,node]of Object.entries(s.world.graph.nodes||{})){if(!s.world.orte[name])s.world.orte[name]=node.desc||''}
 return s.world.graph}
function enrichNpcs(world){if(!world?.npcs)return;for(const[k,n]of Object.entries(world.npcs)){
  if(!n.memories)n.memories=[];if(!n.mood)n.mood='neutral';if(!n.goals)n.goals=n.ziel?[String(n.ziel).slice(0,80)]:[];
  if(!n.relations)n.relations=n.meinung||{};if(!n.lastSeen)n.lastSeen={ort:n.ort||'',zeit:'',day:1};
  if(!n.alive&&n.alive!==false)n.alive=true;if(n.home&&!n.ort)n.ort=n.home}}
function locNode(name){const g=ensureGraph();if(!g)return null;if(g.nodes[name])return g.nodes[name];
 const key=Object.keys(g.nodes||{}).find(k=>k.toLowerCase()===String(name||'').toLowerCase()||String(name||'').toLowerCase().includes(k.toLowerCase().slice(0,8)));
 return key?g.nodes[key]:null}
function locKey(name){const g=ensureGraph();if(!g)return name;if(g.nodes[name])return name;
 return Object.keys(g.nodes||{}).find(k=>k.toLowerCase()===String(name||'').toLowerCase()||String(name||'').toLowerCase().includes(k.toLowerCase().slice(0,10)))||name}
function exitsFrom(ort){const n=locNode(ort);return (n&&n.exits)||[]}
function whoHere(ort){ort=ort||S.world?.scene?.ort;const list=[];
 for(const[name,n]of Object.entries(S.world?.npcs||{})){if(n.alive===false||n.dead)continue;if((n.ort||n.home||'')===ort||(S.world.scene.anwesend||[]).includes(name))list.push(name)}
 return list}
function travelTo(dest,opts){opts=opts||{};if(!S?.world)return {ok:false,text:'Keine Welt.'};
 const g=ensureGraph();const from=S.world.scene.ort;const key=locKey(dest);
 if(g&&!g.nodes[key]&&!opts.force){ // discover dynamic place
  if(!S.world.orte[dest]){S.world.orte[cutStr(dest,50)]=opts.desc||'Ein neuer Ort, den du entdeckst.';}
  discover(dest);S.world.scene={ort:cutStr(dest,80),zeit:phaseLabel(),anwesend:[]};{const est=Cont.estimateMinutes('reise nach '+dest, opts.hours?opts.hours*60:null);advanceTimeMinutes(est.minutes,{allowLong:true,reason:est.kind});}
  return finishTravel(from,dest)}
 if(g&&g.nodes[key]){const exits=exitsFrom(from);const known=exits.includes(key)||(S.discovered||[]).includes(key)||opts.force;
  if(!known&&exits.length){ // allow travel to any discovered or exit; if neither, still allow with longer time + rumour
   if(!(S.discovered||[]).some(d=>d===key||String(d).includes(key.slice(0,8)))){
    // permit free travel anyway — living world, not a leash — just costs more time
    opts.hours=opts.hours||rnd(3,6)}}
  discover(key);const here=whoHere(key);
  // NPCs at destination by schedule/ort
  const anwesend=[];for(const[name,n]of Object.entries(S.world.npcs||{})){if(n.alive===false)continue;if((n.ort||'')===key||(n._schedNow&&String(n._schedNow).includes(key)))anwesend.push(name)}
  S.world.scene={ort:key,zeit:phaseLabel(),anwesend:anwesend.slice(0,6)};
  {const est=Cont.estimateMinutes('reise nach '+key, opts.hours?opts.hours*60:null);advanceTimeMinutes(est.minutes,{allowLong:true,reason:est.kind})}
  return finishTravel(from,key)}
 // fallback: just set scene
 discover(dest);S.world.scene={ort:cutStr(dest,80),zeit:phaseLabel(),anwesend:whoHere(dest).slice(0,6)};
 applyActionDuration('reise nach '+dest, opts.hours?opts.hours*60:null);return finishTravel(from,dest)}
function finishTravel(from,to){const node=locNode(to);const bg=node?.bg;
  const present=(S.world.scene?.ort===to && (S.world.scene.anwesend||[]).length)?S.world.scene.anwesend.slice():whoHere(to);
  S.world.scene={ort:to,zeit:phaseLabel(),anwesend:present.slice()};
  const greets=[];for(const name of present){const n=S.world.npcs[name];if(!n)continue;
   let label=name; try{label=Know.displayName(S,name,n)}catch(_){}
   const away=S.time.day-(n.lastSeen?.day||S.time.day);
   if(away>=1&&(n.memories||[]).length){const life=R(n.memories.filter(m=>/Offscreen|Leben|tat|ging|traf|hörte/.test(String(m)))||n.memories); const sn=Imm.cleanSnippet(life); if(sn)greets.push(`${label} nickt wiedererkennend – wegen ${sn}.`)}
   else if((n.memories||[]).some(m=>/du |Spieler|Versprechen|Geschenk|Beleidig|Kampf/.test(String(m)))){const m=n.memories.filter(m=>/du |Spieler|Versprechen|Geschenk|Beleidig/.test(String(m))).slice(-1)[0]; const sn=Imm.cleanSnippet(m); if(sn)greets.push(`${label}: „Ich erinnere mich an ${sn}.“`)}
   n.lastSeen={ort:to,zeit:phaseLabel(),day:S.time.day}}
  const prompt=scenePromptFor(to,phaseLabel());S.flags.scenePrompt=prompt;
  setSceneImage(prompt, assetBgKey(to,bg), {assetKey:assetBgKey(to,bg)});
  try{const w=Imm.weatherFor(S);S.flags=S.flags||{};S.flags.weather=w;Imm.setWeather(w==='klar'?'none':w);Imm.applyDayNightTint(S)}catch(_){}
  let arrive=''; try{arrive=Imm.arrivalBlurb(S)}catch(_){arrive=`Du verlässt ${from||'den vorherigen Ort'} und erreichst ${to}.`}
  const txt=`${arrive}${node?.desc?' '+node.desc:''}${present.length?'\n\nAnwesend: '+present.map(n=>{try{return Know.displayName(S,n)}catch(_){return 'eine Gestalt'}}).join('; ')+'.':'\n\nHier ist niemand, den du kennst – vorerst.'}${greets.length?'\n\n'+greets.slice(0,2).join('\n\n'):''}`;
  const choices=travelChoices(to);
  return {ok:true,text:txt,changes:{xp:5,choices,world:{scene:S.world.scene}},to}}
function cutStr(x,n){return String(x||'').slice(0,n)}
function travelChoices(ort){ort=ort||S.world?.scene?.ort;const ex=exitsFrom(ort);const here=whoHere(ort);
  const ch=[];
  const label=n=>{try{const d=Know.displayName(S,n,S.world?.npcs?.[n]); return Know.isNameKnown(S,n)?d.split(' ')[0]:('die Gestalt')}catch(_){return 'die Gestalt'}};
  if(here[0])ch.push(Know.isNameKnown(S,here[0])?('Mit '+label(here[0])+' sprechen'):'Die Gestalt ansprechen');
  if(here[1]&&Know.isNameKnown(S,here[1]))ch.push('Mit '+label(here[1])+' sprechen');
  else if(here[1]&&!ch.includes('Die Gestalt ansprechen'))ch.push('Jemanden beobachten');
  ch.push('Umsehen');
  if(ex[0])ch.push('Nach '+shortPlace(ex[0])+' gehen');
  if(ex[1])ch.push('Richtung '+shortPlace(ex[1]));
  while(ch.length<4){ch.push(R(['Ausruhen','Leute beobachten','Etwas stehlen?','Die Gegend erkunden','Status prüfen']))}
  return [...new Set(ch)].slice(0,4)}
function shortPlace(p){return String(p).replace(/ von .*| im .*| Zum /g,' ').trim().split(' ').slice(0,2).join(' ')}
function parseTravel(a){const t=a.toLowerCase();
  const m=t.match(/(?:geh(?:e|st|en)?|lauf(?:e|st|en)?|wander(?:e|st|n)?|reise|fahr(?:e|st|en|t)?|auf dem weg|nach |zum |zur |ins |in die |in den |in der |richtung )(.{3,60?}?)(?:\s*[.!]|$)/i);
  let dest=null;const g=ensureGraph();const cur=(S?.world?.scene?.ort||'').toLowerCase();
  if(g){let best=null,bestScore=0;
   for(const name of Object.keys(g.nodes)){const low=name.toLowerCase();if(low===cur)continue;
    const parts=low.split(/[\s\-–\/]+/).filter(w=>w.length>3);
    let score=0;if(t.includes(low))score+=100;if(t.includes(low.slice(0,12)))score+=40;
    for(const p of parts){if(t.includes(p))score+=p.length}
    // require at least one distinctive part (not only shared words like aldheim)
    const distinctive=parts.filter(p=>!/aldheim|könig|stadt|dorf|wald|nacht|halle/.test(p)||parts.length===1);
    if(distinctive.some(p=>t.includes(p)))score+=20;
    if(score>bestScore){bestScore=score;best=name}}
   if(bestScore>=8)dest=best;
   if(!dest)for(const name of(S.discovered||[])){const low=String(name).toLowerCase();if(low!==cur&&t.includes(low.slice(0,10))){dest=name;break}}}
  if(!dest&&m){const cand=m[1].trim();const key=locKey(cand);if(key&&key.toLowerCase()!==cur)dest=key;else if(cand.length>3)dest=cand}
  const travelVerb=/geh|lauf|wander|reise|fahr|auf dem weg|verlasse|zurück|nach hause|fort|richtung/.test(t);
  return (dest&&(travelVerb||locNode(dest)))?dest:null}
function assetBgKey(ort,bgHint){const role=S?.role||'held';const phase=phaseLabel();const night=/nacht|spät|abend/i.test(phase)?'nacht':'tag';
  const slug=(bgHint||slugify(ort||'scene'));
  return `${role}/${slug}-${night==='nacht'&&!/abend/.test(slug)?(/abend/.test(phase)?'abend':night):(/abend/.test(phase)?'abend':night)}`}
function slugify(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40)}
function localAsset(kind,key){ // kind: bg|port
  if(!key)return null;
  if(kind==='bg'){const role=S?.role||'held';let path=`assets/bg/${key}.webp`;
   // try exact, then without phase, then role/slug
   return path}
  return `assets/port/${key}.webp`}
function bgRoleFolder(){
  if(isG())return 'grey';
  const gen=S?.genre||'';
  if(gen==='zombie')return 'zombie';
  if(gen==='cyberpunk')return 'cyberpunk';
  if(gen==='darkfantasy'||gen==='dark')return 'darkfantasy';
  if(gen==='postapoc'||gen==='post-apoc')return 'postapoc';
  if(S?.role==='daemon')return 'daemon';
  if(S?.role==='villainess')return 'villainess';
  if(S?.role==='mensch')return 'mensch';
  if(S?.role==='proc'){
    if(/zombie|apok/i.test(gen))return 'zombie';
    if(/cyber|neon/i.test(gen))return 'cyberpunk';
    if(/dark|dunkel|horror/i.test(gen))return 'darkfantasy';
    if(/wüste|wasteland|post/i.test(gen))return 'postapoc';
  }
  return S?.role||'held';
}
function bgAlias(ort,bgHint){
  if(bgHint)return bgHint;
  const node=locNode(ort); if(node?.bg)return node.bg;
  const t=String(ort||'').toLowerCase();
  const rules=[
    [/beschw[oö]r|summon|kreis/, 'beschwoerungshalle'],
    [/thron/, 'thron'],
    [/markt|unterstadt/, 'markt'],
    [/taverne|gasthaus|inn/, 'taverne'],
    [/hafen|hafenstadt|kai/, 'hafen'],
    [/elf|sylvar|wald/, 'elfenwald'],
    [/nordwall|wall|festung/, 'nordwall'],
    [/garten|palastgarten/, 'palastgarten'],
    [/salon/, 'salon'],
    [/bahnhof|greymourne|station/, 'bahnhof-nebel'],
    [/zug|abteil|waggon/, 'zugabteil'],
    [/parkplatz/, 'parkplatz'],
    [/safehouse|sicher/, 'safehouse'],
    [/neon|gasse|cyber/, 'neon-gasse'],
    [/asche|blutmond/, 'asche-thron'],
    [/kristall/, 'kristall'],
    [/wüste|desert/, 'wueste'],
    [/bunker/, 'bunker'],
  ];
  for(const [rx,slug] of rules){ if(rx.test(t)) return slug }
  return slugify(ort||'default').split('-').slice(0,2).join('-')||'default';
}
function tryLocalBg(ort,bgHint){const role=bgRoleFolder();const phase=phaseLabel();
  const base=bgAlias(ort,bgHint);
  const variants=[];
  if(/nacht|spät/i.test(phase))variants.push(base+'-nacht',base+'-abend',base+'-tag',base+'-morgen');
  else if(/abend/i.test(phase))variants.push(base+'-abend',base+'-tag',base+'-nacht',base+'-morgen');
  else if(/morgen|früh/i.test(phase))variants.push(base+'-morgen',base+'-tag',base+'-abend',base+'-nacht');
  else variants.push(base+'-tag',base+'-abend',base+'-nacht',base+'-morgen');
  variants.push(base);
  const paths=variants.flatMap(v=>[`assets/bg/${role}/${v}.webp`,`assets/bg/held/${v}.webp`,`assets/bg/proc/${v}.webp`]);
  paths.push('assets/bg/proc/default-abend.webp','assets/bg/proc/default-tag.webp','assets/bg/held/beschwoerungshalle-abend.webp');
  return [...new Set(paths)]}
function portAssetKey(name,npc){if(npc?.portrait)return npc.portrait;const map={elise:'elise',lyra:'lyra',garrick:'garrick',orren:'orren',seris:'seris',rhett:'rhett',mira:'mira',julian:'julian',velka:'velka',brok:'brok',tom:'tom',otto:'otto'};
  const s=String(name||'').toLowerCase();for(const[k,v]of Object.entries(map)){if(s.includes(k))return v}return slugify(name).split('-')[0]}

/* memories */
function addMemory(name,text,kind){const n=S.world?.npcs?.[name];if(!n||n.alive===false||n.dead)return;
  const line=(kind?`[${kind}] `:'')+cutStr(text,140);
  const imp=/Tod|Zeuge|Mord|Rache|Versprechen|untot|Grab/i.test(line)?85:/Romance|Date|Liebe/i.test(line)?55:35;
  const emotion=/Tod|trau|Mord/i.test(line)?'trauervoll':/Rache|wüt/i.test(line)?'wütend':/Romance|Liebe|Kuss/i.test(line)?'verliebt':'neutral';
  try{Sim.ledgerPush(S,{type:kind||'memory', who:name, what:line, where:S.world.scene?.ort||n.ort, witnesses:[], importance:imp, emotion, meta:{about:name}})}catch(_){n.memories=(n.memories||[]).concat({text:line,importance:imp,emotion,strength:imp}).slice(-12)}
  n.erinnerung=(n.erinnerung||[]).concat(line).slice(-8);n.lastSeen={ort:S.world.scene?.ort||n.ort,zeit:phaseLabel(),day:S.time?.day||1}}
function revealAndMask(text){
  try{
    const flags=Know.applyNarratorFlags(S,text);
    for(const nm of flags.learned){
      try{Codex.recordPerson(S,nm,S.world?.npcs?.[nm])}catch(_){}
      try{UI14.showBegegnung(nm,S.world?.npcs?.[nm],{imgUrl,setPortrait,slug:portAssetKey(nm,S.world?.npcs?.[nm]),know:S.know?.people?.[nm]})}catch(_){}
      toast('Namen erfahren: '+nm);
    }
    for(const nm of flags.interacted){try{Know.markInteracted(S,nm)}catch(_){}}
    let t=String(text||'').replace(/FLAG:\s*(LEARN_NAME|INTERACT|LEARN_FACT)=[^\n]+/gi,'').trim();
    t=Know.maskNarrationNames(S,t);
    return t;
  }catch(_){return text}
}
function memoryHint(){let h='';try{h=Sim.memoryHintV13(S)}catch(_){}
  try{h=(h?h+'\n':'')+Know.knowledgePrompt(S)}catch(_){}
  return h}
function heatHint(){const h=S.heat|0;const w=(S.wanted||[]).slice(-3);const dead=(S.dead||[]).slice(-5);
  if(!h&&!w.length&&!dead.length)return '';
  return `KONSEQUENZEN: Heat ${h}/100. Fahndung: ${w.join('; ')||'–'}. Tot: ${dead.join(', ')||'–'}. NPCs reagieren (Trauer, Rache, Ermittlung, Kopfgeld).`}

/* crime: kill & rob — dark-fantasy anime, not graphic */
function findNpcTarget(a){const t=a.toLowerCase();const names=Object.keys(S.world?.npcs||{});
  return names.find(n=>n.alive!==false&&n.toLowerCase().split(/[\s\/]+/).some(p=>p.length>2&&t.includes(p.toLowerCase())))}
function showCodexInline(entry){
  if(!entry)return;
  try{
    const seed=[...String(entry.id||entry.name)].reduce((a,c)=>a+c.charCodeAt(0),0)||42;
    const url=imgUrl(entry.imagePrompt||entry.name,256,256,seed,false);
    const wrap=document.createElement('div'); wrap.className='card codex-inline';
    wrap.innerHTML='<div style="display:flex;gap:10px;align-items:flex-start"><img src="'+url+'" alt="" width="72" height="72" style="border-radius:10px;object-fit:cover;border:1px solid #f0d59a55"/><div><b>'+(entry.icon||'📜')+' '+entry.name+'</b><br><span class="meta">'+(Codex.DISC_LABEL[entry.level]||entry.level)+'</span><br>'+String(entry.desc||'').slice(0,120)+'</div></div>';
    const log=$('#log')||document.querySelector('.log'); if(log){log.appendChild(wrap);log.scrollTop=log.scrollHeight}
    else add('n',Codex.inlineCard(entry));
  }catch(_){try{add('n',Codex.inlineCard(entry))}catch(__){}}
}
function discoverThing(kind,name,opts){
  opts=opts||{}; let e=null;
  try{
    if(kind==='creature'||kind==='animal')e=Codex.recordCreature(S,name,{...opts,danger:opts.danger||2});
    else if(kind==='weapon')e=Codex.recordWeapon(S,{name,...opts},opts);
    else if(kind==='item')e=Codex.recordItem(S,{name,...opts},opts);
    else if(kind==='flora')e=Codex.recordFlora(S,name,opts);
    else if(kind==='faction')e=Codex.recordFaction(S,name,opts);
    else if(kind==='place')e=Codex.recordPlace(S,name,opts.desc);
    else if(kind==='person')e=Codex.recordPerson(S,name,opts.npc||S.world?.npcs?.[name]);
    if(e&&opts.obtained)Codex.markObtained(S,e.id,opts.where);
    if(e&&opts.inline!==false)showCodexInline(e);
  }catch(_){}
  return e;
}
function killNPC(name,ctx){ctx=ctx||{};
  const r=Sim.killPermanent(S,name,{where:S.world?.scene?.ort, cause:typeof ctx==='string'?String(ctx).slice(0,80):(ctx.cause||'Gewalt'), killer:S.pc?.name||'Du'});
  if(!r.ok)return r;
  const witnesses=r.event?.witnesses||[];
  const heatAdd=witnesses.length?rnd(25,45):rnd(8,18);S.heat=Math.min(100,(S.heat|0)+heatAdd);
  const charge=`Mord an ${name}${witnesses.length?' (Zeugen: '+witnesses.join(', ')+')':''}`;S.wanted=(S.wanted||[]).concat(charge).slice(-8);
  for(const w of witnesses){bumpRel(w,-rnd(20,40),-rnd(15,30),false)}
  S.ticks.rumours=(S.ticks.rumours||[]).concat(`☠ ${name} ist tot. ${witnesses.length?'Es gab Zeugen.':'Niemand will es gesehen haben.'}`).slice(-10);
  S.st.ruf=(S.st.ruf|0)-(isG()?0:rnd(15,35));S.st.xp=(S.st.xp|0)+rnd(10,25);
  const loot=[{name:R(['Geldbeutel','Persönlicher Anhänger','Schlüssel','Brief']),icon:'🎒',desc:`Von ${name}`,type:'misc',rarity:'uncommon'}];
  const soft=`Der Kampf endet schnell. ${name} fällt – endgültig. Kein Statusfenster holt sie zurück.${witnesses.length?' Blicke treffen dich. Worte werden folgen.':' Die Stille danach ist laut.'}${S.heat>40?' Fahndungsplakate werden nicht lange auf sich warten lassen.':''} 🪦 Ein Grab/Leichnam bleibt in ${S.world.scene?.ort}.`;
  try{Codex.recordPerson(S,name,S.world.npcs[name]);Codex.discover(S,{cat:'lore',name:'Tod von '+name,desc:soft.slice(0,120),where:S.world.scene?.ort,level:'studied'}) }catch(_){}
  return {ok:true,text:soft,changes:{hp:-rnd(0,10),ruf:-(rnd(15,35)),xp:rnd(10,25),items:loot,choices:travelChoices(),affinity:Object.fromEntries(witnesses.map(w=>[w,-rnd(20,40)]))}}}
function robNPC(name){const n=S.world.npcs[name];if(!n||n.alive===false)return {ok:false,text:'Kein Ziel.'};
  const witnesses=(S.world.scene.anwesend||[]).filter(x=>x!==name);const seen=witnesses.length&&Math.random()<.7;
  const ok=Math.random()<0.55+(S.st.cha||0)/200;const gold=rnd(5,40);
  if(!ok){S.heat=Math.min(100,(S.heat|0)+rnd(10,20));addMemory(name,'Du hast versucht, sie/ihn zu bestehlen.','Beleidigung');bumpRel(name,-rnd(10,20),-rnd(8,15),false);
   return {ok:true,text:`${name} erwischt deine Hand. „Diebstahl?“ Die Luft wird scharf.${seen?' Andere haben es gesehen.':''}`,changes:{ruf:-rnd(5,12),affinity:{[name]:-rnd(10,20)},choices:travelChoices()}}}
  S.st.gold=(S.st.gold|0)+gold;addMemory(name,'Wurde von dir bestohlen.','Beleidigung');bumpRel(name,-rnd(8,16),-rnd(5,12),false);
  if(seen){S.heat=Math.min(100,(S.heat|0)+rnd(12,25));S.wanted=(S.wanted||[]).concat(`Diebstahl an ${name}`).slice(-8);witnesses.forEach(w=>addMemory(w,`Sah dich ${name} bestehlen.`,'Zeuge'))}
  else S.heat=Math.min(100,(S.heat|0)+rnd(2,8));
  return {ok:true,text:`Du entwendest unauffällig ${gold} Gold und ${R(['einen Ring','Münzen','ein Amulett','Proviant'])} von ${name}.${seen?' Jemand hat hingesehen.': ' Niemand schreit – noch nicht.'}`,changes:{gold,items:[{name:R(['Gestohlener Ring','Münzbeutel','Amulett']),icon:'💍',desc:'Heiße Ware',type:'misc',rarity:'uncommon'}],affinity:{[name]:-rnd(8,16)},choices:travelChoices()}}}
function parseCrime(a){const t=a.toLowerCase();const who=findNpcTarget(a);
  const kill=/töt|umbring|ersterche|erwürg|erschlage|hinricht|mord|kill|vernichte|lasse .* sterben|bring .* um/.test(t);
  const rob=/bestehl|stehle?|raube?|klau|tasche|geldbeutel|ausräum/.test(t);
  if(kill&&who)return {type:'kill',who};if(rob&&who)return {type:'rob',who};
  if(kill){const here=(S.world?.scene?.anwesend||[]).filter(n=>S.world.npcs[n]?.alive!==false);if(here.length)return {type:'kill',who:here[0]}}
  if(rob){const here=(S.world?.scene?.anwesend||[]).filter(n=>S.world.npcs[n]?.alive!==false);if(here.length)return {type:'rob',who:here[0]}}
  return null}


/* ---------- save / toast / gate ---------- */
function save(){if(!S)return;Persist.atomicSave(S,{toast}).then(r=>{if(!r.ok&&r.reason==='stale')toast('⚠ Älterer Stand nicht überschrieben');else if(!r.ok)toast('⚠ Speichern fehlgeschlagen')}).catch(()=>toast('⚠ Speichern fehlgeschlagen'))}
async function loadSave(){const s=await Persist.loadBest(migrate);return s}
function applyCatchUp(){if(!S)return null;
 // v13.1 default: skip auto catch-up (preserves ongoing scene). Opt-in via S.cfgCatchupOptIn or confirm.
 if(!S.cfgCatchupOptIn){S.lastRealAt=Date.now();return {hours:0,skipped:'opt-in'}}
 const r=Persist.catchUp(S,{Sim,econTick:(st,h)=>Econ.econHourly(st,h)});
 if(r.hours>=1){const lines=['⏳ Während du weg warst (offscreen, '+r.hours+' Std.) — Szene unverändert:',...(r.summary||[])];
  pushSys(lines[0]);setTimeout(()=>{try{eventToast(lines[0])}catch(_){toast(lines[0])}},300);save()}
 return r}
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('on'),2600)}
function eventToast(t){const e=$('#eventToast');if(!e)return;e.textContent=t;e.classList.remove('hidden');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.add('hidden'),4200)}
function hasKey(){return !!(cfg.gkey||'').trim()}
function wantAI(){return cfg.mode!=='offline'}
function gateOrShow(){if(S&&S.setup&&!S.setup.done){enterPlay();return}
 if(!hasKey()&&(cfg.mode==='gemini'||!cfg.mode)){cfg.mode='free';try{localStorage.setItem(CFG,JSON.stringify(cfg))}catch(_){}}
 if(wantAI()&&!hasKey()&&cfg.mode!=='webllm'&&cfg.mode!=='api'&&cfg.mode!=='free'&&cfg.mode!=='offline'){showKeyGate();return}enterPlay()}
function showKeyGate(){$('#title').classList.add('hidden');$('#stage').classList.add('hidden');const g=$('#keyGate');if(g){g.classList.remove('hidden');$('#gateKey').value='';setTimeout(()=>$('#gateKey').focus(),50)}}
function dbgLine(){const el=$('#dbg');if(!el)return;if(!cfg.debug){el.classList.add('hidden');return}el.classList.remove('hidden');el.textContent=_dbgMs?('Zug '+_dbgMs+' ms'+(S?._ttft!=null?(' · TTFT '+S._ttft+' ms'):'')+(S?._promptChars?(' · ~'+Math.round(S._promptChars/3.5)+' tok'):'')):'–'}

/* ---------- items / skills helpers ---------- */
function itemFromStr(x){if(typeof x==='object'&&x&&x.name)return x;const s=String(x);return {id:'i_'+s.slice(0,20),name:s,icon:'📦',desc:s,type:'misc',rarity:'common'}}
function skillFromStr(x){if(typeof x==='object'&&x&&x.name)return x;const s=String(x);return {id:'sk_'+s.slice(0,20),name:s,icon:'✨',desc:s,level:1,cost:0,cd:0,_cd:0}}
function invNames(){return (S.inv||[]).map(i=>typeof i==='string'?i:i.name)}
function skillNames(){return (S.skills||[]).map(i=>typeof i==='string'?i:i.name)}
function stageOf(aff,trust){let s=0;for(let i=0;i<STAGE_NEED.length;i++){const needT=i>=4?STAGE_NEED[i]-10:0;if(aff>=STAGE_NEED[i]&&(trust||0)>=needT)s=i}return s}
function stageName(n){return STAGES[Math.max(0,Math.min(5,n|0))]}
function rarityOf(item){const r=(item&&item.rarity)||'common';return ['common','uncommon','rare','epic','legendary'].includes(r)?r:'common'}
function hearts(stage){return '♥'.repeat(Math.max(0,Math.min(5,stage|0)))+'♡'.repeat(Math.max(0,5-Math.max(0,stage|0)))}
function phaseLabel(){if(!S)return '–';
  try{Cont.ensureCont(S)}catch(_){}
  if(S.cal){
    const ph=Cont.phaseFromClock(S);
    const clock=String(S.cal.hour|0).padStart(2,'0')+':'+String(S.cal.minute|0).padStart(2,'0');
    try{const base=Sim.calLabel(S.cal); return base.replace(/\d{1,2}:\d{2}/,clock).includes(clock)?(base.split('·')[0].trim()+' · '+clock+' · '+ph):`${ph} · ${clock} · Tag ${S.cal.day|1}`}catch(_){return `${ph} · ${clock} · Tag ${S.cal.day|1}`}
  }
  if(!S.time)return '–';return `${S.time.phase||PHASE_H[S.time.hour|0]||'–'} · Tag ${S.time.day|1}${S.time.season?' · '+S.time.season:''}`}
function advanceTime(hours){ // legacy hours API — prefer advanceTimeMinutes
  const h=Math.max(0,+hours||0); if(!h)return advanceTimeMinutes(0);
  return advanceTimeMinutes(Math.round(h*60), {allowLong:h>=4, reason:'hours'});
}
function advanceTimeMinutes(mins, opts){opts=opts||{};
  if(!S.cal)S.cal=Sim.blankCalendar(S.time||{day:1,hour:8});
  if(S.cal.minute==null)S.cal.minute=0;
  const dayBefore=S.cal.day|0; const yearBefore=S.cal.year|0; const hourBefore=S.cal.hour|0;
  const r=Cont.advanceMinutes(S, mins, opts);
  const hoursCrossed=Math.max(0, ((S.cal.day-dayBefore)*24 + (S.cal.hour-hourBefore) + ((S.cal.year-yearBefore)*360*24) ));
  // light hourly hooks only for crossed whole hours (no multi-hour AI storms)
  if(hoursCrossed>0){
    try{Econ.econHourly(S, Math.min(hoursCrossed,12))}catch(_){}
    const daysPassed=Math.max(0,(S.cal.day-dayBefore)+((S.cal.year-yearBefore)*360));
    if(daysPassed>0){const pb=Sim.progressBuild(S,daysPassed);if(pb?.done){toast('🏠 Bau fertig: '+pb.name);pushSys('🏠 '+pb.name+' (Stufe '+pb.stage+')')}}
  }
  if(S.world?.scene)S.world.scene.zeit=Cont.phaseFromClock(S)+', '+String(S.cal.hour|0).padStart(2,'0')+':'+String(S.cal.minute|0).padStart(2,'0');
  return r;
}
function applyActionDuration(playerText, modelMinutes){
  const kind=Cont.classifyAction(playerText);
  if(kind==='sleep')return Cont.sleepUntilMorning(S);
  const est=Cont.estimateMinutes(playerText, modelMinutes);
  return advanceTimeMinutes(est.minutes, {allowLong:/travel_far|work|craft/.test(est.kind), reason:est.kind});
}

/* ---------- migration ---------- */
function migrate(raw){if(!raw)return null;const s=typeof raw==='string'?JSON.parse(raw):raw;
 if(!s.ver||s.ver<9){s.ver=9;
  if(Array.isArray(s.inv))s.inv=s.inv.map(itemFromStr);
  if(Array.isArray(s.skills))s.skills=s.skills.map(skillFromStr);
  if(!s.romance){s.romance={};for(const[k,v]of Object.entries(s.aff||{})){const nm=k.replace(/_/g,' ');s.romance[nm]={affection:v|0,trust:Math.max(0,(v|0)/2|0),stage:stageOf(v|0,(v|0)/2|0),events:[]}}}
  if(!s.quests)s.quests={main:{id:'legacy',titel:'Deine Geschichte',act:0,objectives:[],done:[]},side:[]};
  if(!s.discovered)s.discovered=[];
  if(!s.ticks)s.ticks={rumours:[],log:[]};
  if(!s.setup)s.setup={done:true,beat:99,answers:{}};
  if(!s.flags)s.flags={};
  if(s.world&&s.world.npcs){for(const[k,n]of Object.entries(s.world.npcs)){if(!n.e)n.e='👤';if(!n.plan)n.plan=[];if(n.beziehung&&!s.romance[k]){const a=(s.aff&&(s.aff[k]??s.aff[k.replace(/ /g,'_')]))||0;s.romance[k]={affection:a|0,trust:Math.max(0,a/2|0),stage:stageOf(a|0,a/2|0),events:[]}}}}
 }
 if(s.ver<10){s.ver=10;if(!s.time)s.time={day:1,hour:isG()?0:18,phase:isG()?'Nacht':'Abend'};
  if(s.st&&s.st.gold==null)s.st.gold=ROLES[s.role]?.base?.gold||0;
  if(!s.imgCache)s.imgCache={scenes:{},portraits:{},ok:{},fail:{},next:{}};
  if(Array.isArray(s.inv))s.inv=s.inv.map(it=>{const i=itemFromStr(it);if(!i.rarity)i.rarity=i.type==='key'||i.type==='weapon'?'rare':i.type==='consumable'?'uncommon':'common';return i});
 }
 if(s.ver<11){s.ver=11;if(s.imgCache){s.imgCache.ok=s.imgCache.ok||{};s.imgCache.fail=s.imgCache.fail||{};s.imgCache.next=s.imgCache.next||{}}}
 if(s.ver<12){s.ver=12;s.heat=s.heat|0;s.wanted=s.wanted||[];s.dead=s.dead||[];if(s.world){ensureGraph(s);enrichNpcs(s.world)}}
 if(s.ver<13){s.ver=14;try{Sim.migrateToV13(s)}catch(e){console.warn('v13 migrate',e)}}
 if(s.ver<14){s.ver=14;try{Level.ensureProgress(s);Know.ensureKnow(s);Know.migrateKnow(s);s.met=s.met||{};s.romance=s.romance||{}}catch(e){console.warn('v14 migrate',e)}}
 if(Number(s.ver)<17){s.ver=17;try{Jobs.ensureJobs(s);Gems.ensureGems(s);Summons.ensureSummons(s);Equip.ensureEquip(s);s.cfgBattleDiff=s.cfgBattleDiff||'normal';s.cfgAtbMode=s.cfgAtbMode||'active'}catch(e){console.warn('v17 migrate',e)}}
 // v13.1 continuity+time always (kept in v14)
 try{Cont.ensureCont(s);if(s.cal&&s.cal.minute==null)s.cal.minute=0;if(s.cfgCatchupOptIn==null)s.cfgCatchupOptIn=false}catch(e){console.warn('cont migrate',e)}
 if(s.ver<14)s.ver=14;
 if(s.ver<15)s.ver=15;
 if(s.ver<16)s.ver=16;
 else {try{Sim.migrateToV13(s)}catch(_){}}
 return s}

function buildQuests(pack){const arc=pack.arc||{titel:'Hauptgeschichte',acts:[]};const act0=arc.acts[0]||{id:'a1',titel:'Anfang',ziel:'Ankommen',mile:[]};
 return {main:{id:arc.acts[0]?.id||'a1',titel:arc.titel,act:0,actTitel:act0.titel,ziel:act0.ziel,objectives:[...(act0.mile||[])],done:[],twist:act0.twist||''},
  side:(pack.sideQuests||[]).map(q=>({...q,status:'offen',progress:0}))}}

function buildWorldFromPack(pack,role){const npcs={};
 for(const[k,v]of Object.entries(pack.npcs||{})){npcs[k]={art:v.art||v.stimme||'',stimme:v.stimme||'',ziel:v.ziel||'',furcht:v.furcht||'',geheimnis:v.geheim||v.geheimnis||'',beziehung:'Fremd',erinnerung:[],memories:[],e:v.e||'👤',ort:v.ort||v.home||'',home:v.home||v.ort||'',plan:[...(v.plan||[])],meinung:v.meinung||{},relations:v.relations||v.meinung||{},romance:!!v.romance,adult:v.adult!==false,geschlecht:v.geschlecht||'',schedule:v.schedule||[],mood:v.mood||'neutral',goals:v.goals||(v.ziel?[String(v.ziel).slice(0,80)]:[]),portrait:v.portrait||'',alive:true,lastSeen:{ort:v.ort||v.home||'',zeit:'',day:1}}}
 const orte={};for(const[k,v]of Object.entries(pack.regionen||pack.orte||{}))orte[k]=typeof v==='string'?v:v;
 const graph=pack.locations?JSON.parse(JSON.stringify(pack.locations)):null;if(graph){for(const[name,node]of Object.entries(graph.nodes||{})){if(!orte[name])orte[name]=node.desc||''}} enrichNpcs({npcs});
 return {scene:JSON.parse(JSON.stringify(pack.startScene||{ort:(graph&&graph.start)||'',zeit:'',anwesend:[]})),orte,npcs,graph,genre:pack.genre||S?.genre||null,systems:pack.systems||null,ereignisse:[...(pack.startEvents||[])],lore:{geschichte:pack.geschichte||'',magie:pack.magie||'',kultur:pack.kultur||'',alltag:pack.alltag||'',politik:pack.politik||'',ton:pack.ton||'',conflict:pack.conflict||''}}}

function initRomance(pack,affKeys){/* v14: empty until real interaction */ return {}}

/* ---------- new life / cinematic intro ---------- */
async function newLife(role,meta,opts){const r=ROLES[role];meta=meta||{lives:0,soul:0,keptSkills:[]};opts=opts||{};const pack=await loadPack(role);
 const b=meta.soul|0;
 const inv=(pack.startItems||[]).map(x=>({...itemFromStr(x)}));
 const skills=(pack.startSkills||[]).map(x=>({...skillFromStr(x),_cd:0}));
 (meta.keptSkills||[]).forEach(ks=>{const sk=skillFromStr(ks);if(!skills.some(s=>s.name===sk.name))skills.push(sk)});
 const world=buildWorldFromPack(pack,role);
 const romNames=Object.keys(world.npcs);
 const pcName=(opts.name&&opts.name!=='???')?opts.name:'???';
 S={ver:VER,role,lives:(meta.lives|0)+1,soul:b,pc:{name:pcName,bg:opts.bg||'',look:opts.look||'',trait:opts.trait||''},
  st:{hp:r.base.hp+b*5,maxhp:r.base.hp+b*5,mp:r.base.mp+b*3,maxmp:r.base.mp+b*3,str:r.base.str+b,cha:r.base.cha+b,ruf:r.base.ruf,gold:r.base.gold|0,lvl:1,xp:0},
  skills,inv,aff:Object.fromEntries(romNames.map(k=>[k,0])),romance:initRomance(pack,romNames),
  quests:buildQuests(pack),discovered:[world.scene.ort].filter(Boolean),ticks:{rumours:[],log:[]},
  cls:0,turn:0,hist:[],log:[],flags:Object.assign({},opts.flags||{}),setup:{done:false,beat:0,answers:{}},summary:'',
  time:{day:1,hour:18,phase:'Abend'},imgCache:{scenes:{},portraits:{},ok:{},fail:{},next:{}}};
 S.world=world;S.heat=0;S.wanted=[];S.dead=[];S.ledger=[];S.needs={hunger:20,fatigue:10,ageYears:18};S.home=Sim.blankHome();S.cal=Sim.blankCalendar(S.time);S.saveSeq=0;
 try{Sim.migrateToV13(S);Econ.ensureEcon(S);Codex.ensureCodex(S);WorldMap.ensureSpawn(S);Level.ensureProgress(S);Know.ensureKnow(S);Know.migrateKnow(S)}catch(_){}
 if(opts.skipSetup){finishSetup(pack);gateOrShow();return}
 // If cinematic already covered death, skip first setup beat when it is 'tod'
 if(opts.fromIntro){S.flags.introDeath=true;S.setup.answers.tod={label:'(Intro)',past:opts.trait||''};S.setup.beat=1}
 beginSetup(pack);gateOrShow()}

async function newGrey(kind,name,bg,opts){const B=await loadGrey();const r=ROLES.grey;const own=kind!=='darren';opts=opts||{};
 const who=own?(name||'Fremde Person'):'Darren Crowe';
 const inv=((own?B.startItems_own:B.startItems_darren)||[]).map(x=>({...itemFromStr(x)}));
 const skills=(B.startSkills||[]).map(x=>({...skillFromStr(x),_cd:0}));
 const world=buildWorldFromPack(B,'grey');
 world.scene={ort:'Nachtzug, Abteil mit Messinglampe, kurz nach Mitternacht',zeit:'Nacht, Nebel',anwesend:['Der Schaffner','Die alte Frau im Zug','ein schlafender Soldat','ein Junge mit Buch']};
 world.ereignisse=['Der Zug hält in Greymourne, obwohl er nach Blackmere fahren sollte'];
 for(const[k,v]of Object.entries(B.npcs||{})){if(!world.npcs[k])world.npcs[k]={art:v.art||'',stimme:v.stimme||'',ziel:v.ziel||'',furcht:v.furcht||'',geheimnis:v.geheim||'',beziehung:'Fremd',erinnerung:[],e:v.e||'👤',ort:v.ort||'',plan:[...(v.plan||[])],meinung:v.meinung||{},romance:!!v.romance,schedule:v.schedule||[]}}
 const affBase=own?['Marlowe','Elias Ward','Mascha Petrowa','Darren Crowe']:['Velicya','Marlowe','Elias Ward','Mascha Petrowa'];
 S={ver:VER,role:'grey',world_id:'greymourne',kind,pc:{name:who,bg:own?(bg||'Jemand, der etwas verloren hat'):(B.npcs['Darren Crowe']?.art||''),look:opts.look||'',trait:opts.trait||''},lives:1,soul:0,
  st:{hp:100,maxhp:100,mp:0,maxmp:0,str:0,cha:0,ruf:own?10:30,gold:r.base.gold|0,lvl:1,xp:0},skills,inv,
  aff:Object.fromEntries(affBase.map(k=>[k,0])),romance:initRomance(B,affBase),
  quests:buildQuests(B),discovered:['Nachtzug'],ticks:{rumours:[],log:[]},
  cls:0,turn:0,hist:[],log:[],flags:{},setup:{done:false,beat:0,answers:{}},summary:'',
  time:{day:1,hour:0,phase:'Nacht'},imgCache:{scenes:{},portraits:{},ok:{},fail:{},next:{}}};
 S.world=world;
 beginSetup(B);gateOrShow()}

/* Cinematic origin – role emerges from dialogue, not cards */
const INTRO_BEATS=[
 {id:'death',titel:'Letzter Moment',
  scene:'dark rainy city street night headlights asphalt anime dramatic',
  speaker:'…',portrait:null,
  text:'Hupen. Scheinwerfer. Der Asphalt kommt auf dich zu.\n\nIn dem Moment zwischen Aufprall und Dunkelheit – was hältst du fest?',
  choices:[
   {label:'Ein Gesicht, das du liebst',trait:'liebt jemanden',look:''},
   {label:'Einen ungelösten Streit',trait:'trägt einen Streit mit sich',look:''},
   {label:'Einen Traum, den du nie gelebt hast',trait:'jagt einen unerfüllten Traum',look:''},
   {label:'Nur Leere – und Wut',trait:'wütend und leer',look:''}
  ],free:true,freePh:'Oder schreib frei, was dich nicht loslässt…'},
 {id:'void',titel:'Dazwischen',
  scene:'endless starry void soft light particles ethereal anime',
  speaker:'Eine Stimme',portrait:null,
  text:'Dunkelheit. Dann Wärme, die nicht von dieser Welt ist.\n\nEine Stimme, klar wie Glas: „Du bist gestorben. Das ist… ärgerlich. Aber nicht endgültig.“\n\n„Ich kann dir ein neues Leben geben. Nicht fair. Nicht sicher. Aber lebendig.“',
  choices:[
   {label:'„Wer bist du?“',note:'goddess'},
   {label:'„Ich will zurück.“',note:'deny'},
   {label:'„Was kostet das?“',note:'price'},
   {label:'Schweigen und zuhören',note:'listen'}
  ]},
 {id:'goddess',titel:'Angebot',
  scene:'ethereal goddess temple floating islands starlight anime beautiful',
  speaker:'Göttin',portrait:'Göttin',
  text:'„Nenn mich, wie du willst – Göttin, System, Fehler in der Matrix.“\n\nSie öffnet die Hand. Licht zerteilt sich in Pfade.\n\n„Wähle nicht eine Klasse auf einer Karte. Sag mir, wie du weiterleben willst.“',
  choices:[
   {label:'„Als Held. Mit Status. Die Welt retten.“',role:'held'},
   {label:'„Als Schurkin in einem Roman – diesmal anders.“',role:'villainess'},
   {label:'„Als Herrscher der Nacht. Mit Macht.“',role:'daemon'},
   {label:'„Einfach als Mensch. Keine Kräfte.“',role:'mensch'}
  ],free:true,freePh:'Oder beschreibe dein Schicksal in eigenen Worten…'},
 {id:'shape',titel:'Gestalt',
  scene:'mirror of light reflecting silhouette anime character creation soft glow',
  speaker:'Göttin',portrait:'Göttin',
  text:'„Gut. Dann formst du dich noch.“\n\nEin Spiegel aus Licht. Dein Name, dein Aussehen, was dich ausmacht – nicht als Formular. Als Antwort.',
  choices:[
   {label:'Ich behalte meinen alten Namen',nameMode:'keep'},
   {label:'Ich wähle einen neuen Namen',nameMode:'new'},
   {label:'Ich will geheimnisvoll bleiben',nameMode:'mystery'}
  ],needsName:true,free:true,freePh:'Name, Aussehen, Eigenart – frei schreiben…'}
];

let _intro={beat:0,answers:{},role:null,name:'',bg:'',look:'',trait:''};

function startIntro(){_mode='intro';_intro={beat:0,answers:{},role:null,name:'',bg:'',look:'',trait:''};
 $('#title').classList.add('hidden');$('#keyGate').classList.add('hidden');$('#stage').classList.remove('hidden');
 document.body.classList.remove('greyw');$('.top-actions').style.visibility='hidden';$('#hud').style.visibility='hidden';
 $('#inputRow').classList.remove('hidden');showIntroBeat()}

function showIntroBeat(){const i=_intro.beat;if(i>=INTRO_BEATS.length){return finishIntro()}
 const b=INTRO_BEATS[i];
 // Only fetch a scene image for goddess/shape — earlier beats stay on atmospheric placeholder to avoid free-limit burn
 applySceneTheme(themeFromText(b.scene+' '+b.id));
 if(b.id==='goddess'||b.id==='shape')setSceneImage(b.scene,b.id); else hideScenePhoto();
 if(b.portrait==='Göttin'){ensureTempGoddessPortrait()}
 else{$('#portraitWrap').classList.add('hidden')}
 typewrite(b.speaker,b.text,()=>{renderIntroChoices(b)})}
function ensureTempGoddessPortrait(){setPortrait('Göttin',{e:'✨',art:'ethereal goddess long silver hair kind eyes flowing robes',geschlecht:'weiblich'})}

function renderIntroChoices(b){const c=$('#choices');c.innerHTML='';
 if(b.needsName){const row=document.createElement('div');row.className='name-row';row.innerHTML=`<input id="setupName" placeholder="Dein Name…" maxlength="40">`;c.appendChild(row)}
 (b.choices||[]).forEach(ch=>{const btn=document.createElement('button');btn.type='button';btn.textContent=ch.label;btn.onclick=()=>pickIntro(ch,b);c.appendChild(btn)});
 $('#txt').placeholder=b.free?(b.freePh||'Frei antworten…'):'Was tust oder sagst du?';
 if(b.free){$('#txt').focus({preventScroll:true})}}

function pickIntro(ch,beat){beat=beat||INTRO_BEATS[_intro.beat];
 _intro.answers[beat.id]=ch;
 if(ch.trait)_intro.trait=( _intro.trait?_intro.trait+'; ':'')+ch.trait;
 if(ch.role)_intro.role=ch.role;
 if(ch.look)_intro.look=ch.look;
 if(beat.needsName){const inp=$('#setupName');const nm=(inp&&inp.value.trim())||'';
  if(ch.nameMode==='mystery')_intro.name=_intro.name||'???';
  else if(nm)_intro.name=nm;
  else if(ch.nameMode==='keep')_intro.name=_intro.name||'Alex';
  else _intro.name=_intro.name||nm||'???'}
 // free text already in actIntro
 addLogLocal('p',ch.label);
 _intro.beat++;showIntroBeat()}

async function actIntro(text){const beat=INTRO_BEATS[_intro.beat];if(!beat)return;
 const t=text.trim();if(!t)return;addLogLocal('p',t);
 // Interpret free text for goddess destiny
 if(beat.id==='goddess'&&!_intro.role){_intro.role=guessRole(t);toast('Pfad: '+(ROLES[_intro.role]?.name||_intro.role))}
 if(beat.id==='death')_intro.trait=(_intro.trait?_intro.trait+'; ':'')+t.slice(0,80);
 if(beat.id==='shape'){// parse "Name, look"
  const m=t.match(/^([^,–-]+)[,–-](.+)$/);if(m){_intro.name=m[1].trim();_intro.look=m[2].trim()}
  else if(!_intro.name||_intro.name==='???')_intro.name=t.slice(0,40);else _intro.look=t.slice(0,80);
  _intro.bg=t.slice(0,120)}
 if(beat.id==='void'){/* flavor */}
 _intro.answers[beat.id]={label:t,free:true};
 _intro.beat++;showIntroBeat()}

function guessRole(t){const s=t.toLowerCase();
 if(/villain|schurkin|rosalind|otome|roman|lady|intrig/.test(s))return 'villainess';
 if(/dämon|daemon|teufel|könig der nacht|nocturna|thron|bösewicht|lord/.test(s))return 'daemon';
 if(/mensch|normal|bauer|dorf|ohne kraft|keine magie|kein status/.test(s))return 'mensch';
 if(/grey|nebel|zug|horror|greymourne|buch/.test(s))return 'grey';
 if(/held|status|schwert|retten|ritter|aldheim|heldin/.test(s))return 'held';
 return R(ISEKAI)}

async function finishIntro(){let role=_intro.role||R(ISEKAI);
 if(role==='grey'){await startGreyBook();return}
 const name=_intro.name&&_intro.name!=='???'?_intro.name:'';
 // Brief bridge then pack setup
 setSceneImage(ROLES[role].scene,'destiny_'+role);
 await typewriteAsync('Göttin',`„Dann sei es so.“\n\n${ROLES[role].destiny}\n\nLicht reißt dich mit – und die andere Welt atmet bereits.`);
 $('.top-actions').style.visibility='';$('#hud').style.visibility='';
 await newLife(role,{lives:0,soul:0,keptSkills:[]},{fromIntro:true,name:name||undefined,bg:_intro.bg||_intro.trait,look:_intro.look,trait:_intro.trait,
  flags:{impression:_intro.trait,look:_intro.look}})}

function addLogLocal(k,t){/* soft breadcrumb in vn only during intro - no S yet */ }

async function startGreyBook(){_mode='intro';
 $('#title').classList.add('hidden');$('#stage').classList.remove('hidden');
 document.body.classList.add('greyw');$('.top-actions').style.visibility='hidden';$('#hud').style.visibility='hidden';
 setSceneImage(ROLES.grey.scene,'grey_book');
 await typewriteAsync('Buch','Ein Band, gebunden in etwas, das sich wie Nebel anfühlt.\n\nAuf dem Vorsatzblatt: GREYMOURNE.\nWer durch den Nebel kommt.\n\nDu kannst als Darren Crowe einsteigen – oder als jemand, den der Roman noch nicht kennt.');
 const c=$('#choices');c.innerHTML='';
 [['🎫 Als Darren Crowe',()=>newGrey('darren')],['✒️ Eigene Figur',()=>greyOwnForm()]].forEach(([l,f])=>{const b=document.createElement('button');b.type='button';b.textContent=l;b.onclick=f;c.appendChild(b)});
 $('#txt').placeholder='Oder schreib den Namen deiner Figur…'}
function greyOwnForm(){const c=$('#choices');c.innerHTML='';
 const row=document.createElement('div');row.className='name-row';row.innerHTML=`<input id="ownName" placeholder="Name der Figur" maxlength="40"><input id="ownBg" placeholder="Was hast du verloren?" maxlength="200" style="margin-top:6px">`;c.appendChild(row);
 const b=document.createElement('button');b.type='button';b.textContent='🚂 Einsteigen';b.onclick=()=>{
  const n=$('#ownName')?.value.trim(),bg=$('#ownBg')?.value.trim();newGrey('own',n,bg)};c.appendChild(b)}

function beginSetup(pack){const beats=pack.setup||[];
 if(!beats.length){finishSetup(pack);return}
 // clamp beat
 if(S.setup.beat>=beats.length){finishSetup(pack);return}
 _mode='setup';showBeat(pack)}

function showBeat(pack){const beats=pack.setup||[];const i=S.setup.beat;
 if(i>=beats.length){finishSetup(pack);return}
 const b=beats[i];
 if(i===0||i===beats.length-1){const sceneHint=b.scene||(pack.startScene&&i===beats.length-1?scenePromptFor(pack.startScene.ort,pack.startScene.zeit):ROLES[S.role].scene);setSceneImage(sceneHint,i===beats.length-1?(pack.startScene?.ort||('setup_'+S.role)):('setup_'+S.role+'_start'))}
 const sp=b.speaker||(isG()?'…':(i===0?'…':'Stimme'));
 typewrite(sp,`✦ ${b.titel}\n\n${b.text}`,()=>{
  const choices=b.choices||[];S.choices=choices.map(c=>c.label);S._setupChoices=choices;S._setupBeat=b;S._setupPack=pack;
  const c=$('#choices');c.innerHTML='';
  if(b.needsName){const row=document.createElement('div');row.className='name-row';row.innerHTML=`<input id="setupName" placeholder="Name…" maxlength="40" value="">`;c.appendChild(row)}
  choices.forEach(ch=>{const btn=document.createElement('button');btn.type='button';btn.textContent=ch.label;btn.onclick=()=>pickSetup(ch);c.appendChild(btn)});
  hud();save()})}

function pickSetup(ch){const pack=S._setupPack;const beat=S._setupBeat;
 S.setup.answers[beat.id]=ch;
 if(beat.needsName){const inp=$('#setupName');const nm=(inp&&inp.value.trim())||(S.pc.name&&S.pc.name!=='???'?S.pc.name:(isG()?S.pc.name:'Held'));if(ch.nameMode!=='mystery'&&ch.nameMode!=='lost')S.pc.name=nm;else if(ch.nameMode==='hero')S.pc.name=nm||'Held';else if(ch.nameMode==='keep'||ch.nameMode==='real')S.pc.name=nm;else if(ch.nameMode==='nick'||ch.nameMode==='new')S.pc.name=nm||'???';else if(ch.nameMode==='king')S.pc.name=nm||'König der Nacht';else if(ch.nameMode==='human')S.pc.name=nm;else if(ch.nameMode==='mask')S.pc.name='Rosalind';else if(ch.nameMode==='honest'||ch.nameMode==='rewrite')S.pc.name=nm||'Rosalind'}
 if(ch.past)S.pc.bg=(S.pc.bg?S.pc.bg+' ':'')+ch.past;
 if(ch.focus)S.flags.focus=ch.focus;
 if(ch.impression)S.flags.impression=ch.impression;
 if(ch.aff){for(const[n,v]of Object.entries(ch.aff))bumpRel(n,v,Math.max(0,v/2|0),false)}
 _introPushPlayer(ch.label);
 S.setup.beat++;
 showBeat(pack)}

function _introPushPlayer(label){/* show player choice briefly */}


function softMemory(trait,bg){const raw=String(trait||bg||'').trim();if(!raw)return '';
 const s=raw.toLowerCase();
 if(/liebt|gesicht/.test(s))return 'Irgendwo hinter den Rippen bleibt ein Gesicht, das du nicht verlieren wolltest.';
 if(/streit/.test(s))return 'Ein ungelöster Streit klopft noch leise an die Tür hinter dir.';
 if(/traum/.test(s))return 'Ein Traum, den du nie gelebt hast, sucht nach Luft in dieser neuen Brust.';
 if(/wut|leere/.test(s))return 'Wut und Leere teilen sich den Platz unter deiner Haut – und warten.';
 if(raw.length<60&&!/ort:|anwesend|hp|mp|status/i.test(raw))return ''; // avoid dumping form answers
 return ''}
function openingNarration(pack){if(isG())return (S.kind==='darren'?greyIntroDarren():greyIntroOwn());
 const ort=(pack.startScene&&pack.startScene.ort)||(S.world?.scene?.ort)||'ein unbekannter Ort';
 const zeit=(pack.startScene&&pack.startScene.zeit)||'';
 let presence='';
 try{
   Know.ensureKnow(S);
   const anw=(pack.startScene&&pack.startScene.anwesend)||S.world?.scene?.anwesend||[];
   const bits=[];
   for(const n of anw.slice(0,4)){
     const npc=S.world?.npcs?.[n]||pack.npcs?.[n];
     Know.markSeen(S,n,npc);
     bits.push(Know.displayName(S,n,npc));
   }
   if(bits.length)presence=' Du nimmst wahr: '+bits.join('; ')+'.';
 }catch(_){}
 const vibe=String(pack.ton||'').slice(0,100);
 return (`Du öffnest die Augen. ${ort}${zeit?'. '+zeit:''}.${presence} Du kennst niemanden — nur Gestalten und Eindrücke. ${vibe}`).replace(/\s+/g,' ').trim()}

function finishSetup(pack){S.setup.done=true;S._setupChoices=null;S._setupBeat=null;_mode='play';ensureGraph(S);enrichNpcs(S.world);S.heat=S.heat|0;S.wanted=S.wanted||[];S.dead=S.dead||[];try{Sim.migrateToV13(S);Econ.ensureEcon(S);Codex.ensureCodex(S);WorldMap.ensureSpawn(S);Level.ensureProgress(S);Know.ensureKnow(S);Know.migrateKnow(S);Cont.ensureCont(S);Jobs.ensureJobs(S);Gems.ensureGems(S);Summons.ensureSummons(S);Equip.ensureEquip(S);if(S.cal&&S.cal.minute==null)S.cal.minute=0;S.ver=VER;applyGenreTheme(S.genre||S.role||pack.genre)}catch(_){};
 let bridge=openingNarration(pack)||'Du öffnest die Augen. Die Welt wartet. Du kennst niemanden.';
 S.log=[{k:'n',t:bridge}];S.hist=[{role:'assistant',content:bridge}];S.choices=defChoices();
 try{Know.ensureKnow(S);Know.migrateKnow(S);Level.ensureProgress(S);
   for(const n of (S.world?.scene?.anwesend||[]))Know.markSeen(S,n,S.world.npcs[n]);
   const wrap=$('#portraitWrap'); if(wrap)wrap.classList.add('hidden');
 }catch(_){}
 if(wantAI()&&!hasKey()&&cfg.mode!=='webllm'&&cfg.mode!=='api'&&cfg.mode!=='free'&&cfg.mode!=='offline'){save();showKeyGate();return}
 $('.top-actions').style.visibility='';$('#hud').style.visibility='';
 maybeSceneFromWorld();maybePortraitsPresent();
 $('#txt').placeholder='Was tust oder sagst du?';
 typewrite(isG()?'Nebel':'Erzähler',bridge,()=>{hud();renderChoices();save()});
 discover(S.world?.scene?.ort)}

function greyIntroDarren(){return `Der Zug hätte nicht halten dürfen.\n\nAuf deiner Fahrkarte steht Blackmere. Kurz nach Mitternacht verliert das Rattern seinen Takt. Die Messinglampe hängt still.\n\nAußen im Ruß: der Abdruck einer kleinen Hand.\nDie Bremsen greifen. GREYMOURNE.\n\nDu bist Darren Crowe. ${S.pc.bg?S.pc.bg.slice(0,120):'Koch, unrasiert, eine Narbe am Unterarm.'}`}
function greyIntroOwn(){return `Der Zug hätte nicht halten dürfen.\n\nDu – ${S.pc.name}. ${S.pc.bg}\nIm Ruß außen: eine kleine Hand. Der Schaffner hat deinen Namen in violetter Tinte geschrieben.\nGREYMOURNE.\nDie alte Frau: „Lassen Sie sich nicht beim vollen Namen rufen.“`}

function defChoices(){if(S?.world?.scene?.ort)return travelChoices(S.world.scene.ort);
 return ['Umsehen','Mit jemandem sprechen','Wohin gehen?','Ausruhen']}

function discover(place){if(!place)return;if(!S.discovered)S.discovered=[];if(!S.discovered.includes(place)){S.discovered.push(place);if(S.setup?.done)toast('📍 Neu entdeckt: '+place)}
  try{WorldMap.visitPlace(S,place);Codex.recordPlace(S,place,S.world?.orte?.[place]);
  const lore=S.world?.lore||{};
  if(lore.politik)Codex.recordFaction(S,String(lore.politik).slice(0,40),{desc:String(lore.politik).slice(0,160)});
  /* v14: Codex people only after name known */
}catch(_){}}

/* ---------- typewriter VN ---------- */
function typewrite(speaker,text,done){_twDone=false;_twFull=String(text||'').trim()||'…';
 const sp=$('#speaker'),el=$('#vnText'),tap=$('#vnTap');
 if(speaker){sp.textContent=speaker;sp.classList.remove('hidden')}else sp.classList.add('hidden');
 // never leave the dialogue box empty (v14 empty-box fix)
 el.textContent=_twFull.slice(0,Math.min(48,_twFull.length)); tap.classList.add('hidden');
 clearInterval(_twTimer);
 function finish(){if(_twDone)return;clearInterval(_twTimer);el.textContent=_twFull;_twDone=true;tap.classList.remove('hidden');done&&done()}
 el.onclick=finish;$('#vnBox').onclick=finish;
 if(window.__FAST){finish();return}
 let i=Math.min(48,_twFull.length);const step=Math.max(1,Math.floor(_twFull.length/120));
 _twTimer=setInterval(()=>{i=Math.min(_twFull.length,i+step);el.textContent=_twFull.slice(0,i);if(i>=_twFull.length)finish()},12)}
function typewriteAsync(speaker,text){return new Promise(res=>typewrite(speaker,text,res))}

/* ---------- relationships / romance ---------- */
function bumpRel(name,daff,dtrust,toastOn){if(!S.romance)S.romance={};
 try{Know.markInteracted(S,name); if(!Know.isNameKnown(S,name)){const lr=Know.learnName(S,name,'interact'); if(lr.first){try{UI14.showBegegnung(name,S.world?.npcs?.[name],{imgUrl,setPortrait,slug:portAssetKey(name,S.world?.npcs?.[name]),know:lr.person})}catch(_){}}}}catch(_){}
 let key=Object.keys(S.romance).find(k=>k.toLowerCase()===String(name).toLowerCase())||Object.keys(S.romance).find(k=>k.toLowerCase().includes(String(name).toLowerCase().split(' ').pop()));
 if(!key){key=String(name);S.romance[key]={affection:0,trust:0,stage:0,events:[]}}
 const r=S.romance[key];const old=r.stage;r.affection=Math.max(-100,Math.min(100,(r.affection|0)+(daff|0)));r.trust=Math.max(0,Math.min(100,(r.trust|0)+(dtrust|0)));
 r.stage=stageOf(r.affection,r.trust);S.aff[key]=r.affection;
 if(S.world?.npcs?.[key])S.world.npcs[key].beziehung=stageName(r.stage);
 if(r.stage>old){const msg=`💞 ${key}: ${stageName(old)} → ${stageName(r.stage)}`;if(toastOn!==false)toast(msg);pushSys(msg);r.events.push({t:S.turn,stage:r.stage});
  if(r.stage>=4)maybeJealousy(key)}
 return key}
function maybeJealousy(who){const pack=PACKS[S.role];if(!pack)return;const roms=(pack.romanceable||[]).filter(n=>n!==who);const high=roms.filter(n=>(S.romance[n]?.stage|0)>=3);
 if(high.length&&Math.random()<.45){const j=R(high);bumpRel(j,-rnd(3,8),-rnd(1,4),false);S.ticks.rumours.push(`${j} hat von dir und ${who} gehört.`);pushSys(`⚡ Spannung: ${j} wirkt verletzt oder misstrauisch.`)}}

/* ---------- living world: time + schedules + ticks ---------- */
function matchSchedule(entry,phase){if(!entry)return false;const e=String(entry).toLowerCase();const p=String(phase).toLowerCase();
 if(e.startsWith(p+':')||e.includes(p+':'))return true;
 const map={nacht:['nacht','night','mitternacht'],morgen:['morgen','früh','morning'],mittag:['mittag','noon'],nachmittag:['nachmittag'],abend:['abend','evening'],spät:['spät','spaet','late']};
 const keys=map[p]||[p];return keys.some(k=>e.includes(k))}
function worldTick(){if(!S.world||!S.setup?.done)return;
 // v13.1: do NOT advance hours here — clock moves via applyActionDuration after the reply
 const phase=Cont.phaseFromClock(S)||S.time?.phase||Sim.phaseFromHour(S.cal?.hour||12);
 const npcs=Object.entries(S.world.npcs||{});if(!npcs.length)return;
 if(S.world.scene?.anwesend)S.world.scene.anwesend=S.world.scene.anwesend.filter(n=>!Sim.isDead(S,n)||S.world.npcs[n]?.undead);
 const present=new Set((S.world.scene.anwesend||[]).map(String));
 for(const[name,n]of npcs){if(n.alive===false||n.dead)continue;const sch=n.schedule||[];const hit=sch.find(s=>matchSchedule(s,phase));
  if(hit){const bit=String(hit).split(':').slice(1).join(':').trim()||hit;n._schedNow=bit;
   const g=ensureGraph();let dest=null;if(g){for(const loc of Object.keys(g.nodes)){if(bit.toLowerCase().includes(loc.toLowerCase().slice(0,8))||loc.toLowerCase().includes(bit.toLowerCase().slice(0,8))){dest=loc;break}}
    if(!dest&&g.nodes[bit])dest=bit} if(dest)n.ort=dest;else if(!present.has(name)&&Math.random()<.35)n.ort=bit}
  else if(!present.has(name)&&n.home&&Math.random()<.2)n.ort=n.home}
 let aiNotes=[];try{aiNotes=Sim.runWorldAI(S,1)||[]}catch(_){}
 for(const note of aiNotes){if(note?.line){const clean=note.seek?Imm.seekPlayerLine(note.who||note.line.split(' ')[0]):Imm.cleanSnippet(note.line)||note.line; S.ticks.log=(S.ticks.log||[]).concat(clean).slice(-12);if(note.seek)eventToast(clean)}}
 if(S.heat>30&&Math.random()<.4){S.ticks.rumours=(S.ticks.rumours||[]).concat(R(['Wachen fragen nach einem Fremden.','Ein Kopfgeld-Gerücht kursiert.','Jemand hat dein Gesicht skizziert.'])).slice(-10)}
 if(aiNotes.length&&S.turn>0&&S.turn%2===0){const n0=aiNotes[0]; eventToast(n0.seek?Imm.seekPlayerLine(n0.who||''): (Imm.cleanSnippet(n0.line)||n0.line));}
 if(Math.random()<.28){const here=[...present].filter(p=>S.world.npcs[p]&&!Sim.isDead(S,p));if(here.length){const who=R(here);const n=S.world.npcs[who];
  const mem=(Sim.retrieveMemories(S,{npcNames:[who],limit:1})||[])[0];
  let label=who; try{label=Know.displayName(S,who,n)}catch(_){}
  const line=Imm.npcInitiativeLine(label, mem?.text||mem);
  S.flags.npcInit=who;eventToast(line);if(S.choices&&S.choices.length){const speak=Know.isNameKnown(S,who)?`Mit ${who} sprechen`:`Die Gestalt ansprechen`;S.choices=[speak,...S.choices.slice(0,3)]}
  try{if(Know.isNameKnown(S,who))setPortrait(who,n)}catch(_){}}}}

function applyQuestUpdate(u){if(!u||!S.quests)return;const m=S.quests.main;
 if(u.mainObjectiveDone){const o=String(u.mainObjectiveDone);if(!(m.done||[]).includes(o)){m.done=m.done||[];m.done.push(o);toast('✓ Quest: '+o);pushSys('📜 '+o)}}
 if(u.advanceAct&&PACKS[S.role]?.arc?.acts){const acts=PACKS[S.role].arc.acts;const next=Math.min(acts.length-1,(m.act|0)+1);if(next>m.act){m.act=next;m.id=acts[next].id;m.actTitel=acts[next].titel;m.ziel=acts[next].ziel;m.objectives=[...(acts[next].mile||[])];m.done=[];m.twist=acts[next].twist||'';toast('📖 Neuer Akt: '+m.actTitel);pushSys('📖 Akt: '+m.actTitel+' – '+m.ziel)}}
 if(u.sideComplete){const id=String(u.sideComplete);const sq=(S.quests.side||[]).find(q=>q.id===id||q.titel===id);if(sq){sq.status='erledigt';toast('✓ Nebenquest: '+sq.titel)}}
 if(u.sideUnlock){const id=String(u.sideUnlock);const sq=(S.quests.side||[]).find(q=>q.id===id);if(sq&&sq.status==='offen')sq.status='aktiv'}}

/* ---------- HUD / choices / log ---------- */
function hud(){if(!S)return;if(isG())hudG();else hudI();dbgLine()}
function bar(v,m,col){return `<div class="bar"><i style="width:${Math.max(0,Math.min(100,v/Math.max(1,m)*100))}%;background:${col}"></i></div>`}
function hudI(){const s=S.st,r=ROLES[S.role];
 $('#hud').innerHTML=`<div class="hud-top"><b>${r.e} ${S.pc?.name&&S.pc.name!=='???'?S.pc.name:r.cls[S.cls]}</b><span>Lv ${s.lvl} · 🪙${s.gold|0}</span></div>
 <div class="bars"><div style="flex:1"><div class="bar-lab">HP ${Math.max(0,s.hp)}/${s.maxhp}</div>${bar(s.hp,s.maxhp,'#ff5f7e')}</div>
 <div style="flex:1"><div class="bar-lab">MP ${s.mp}/${s.maxmp}</div>${bar(s.mp,s.maxmp||1,'#6fb6ff')}</div></div>
 <div class="chips"><span class="chip">📍${(S.world?.scene?.ort||'').slice(0,22)}</span><span class="chip">🕐${phaseLabel()}</span></div>`}
function hudG(){const s=S.st;
 $('#hud').innerHTML=`<div class="hud-top"><b>🌫️ ${S.pc.name}</b><span>${ROLES.grey.cls[S.cls]}</span></div>
 <div class="bars"><div style="flex:1"><div class="bar-lab">🧠 Verstand ${Math.max(0,s.hp)}/100</div>${bar(s.hp,100,'#9fb3c8')}</div>
 <div style="flex:1"><div class="bar-lab">⚖️ Schuld ${s.ruf}/100</div>${bar(s.ruf,100,'#8a5a5a')}</div></div>
 <div class="chips"><span class="chip">📍${(S.world?.scene?.ort||'').slice(0,22)}</span><span class="chip">🕐${phaseLabel()}</span></div>`}

function renderChoices(){const c=$('#choices');if(S._setupChoices)return;c.innerHTML='';
 (S.choices||[]).slice(0,4).forEach(t=>{const b=document.createElement('button');b.type='button';b.textContent=t;b.onclick=()=>act(t);c.appendChild(b)})}

function pushSys(t){if(!S.log)S.log=[];S.log.push({k:'s',t});if(S.log.length>80)S.log.shift();eventToast(t)}
function add(k,t){
 if(k==='n'){try{t=revealAndMask(t)}catch(_){}}
 S.log.push({k,t});if(S.log.length>80)S.log.shift();
 if(k==='n'){const sp=S.flags?.speaker||(isG()?'Nebel':'Erzähler');typewrite(sp,t,()=>{});setPortraitFromSpeaker(S.flags?.speaker)}
 else if(k==='s')eventToast(t)
 else if(k==='p'){/* player line already shown via input */}
 else if(k==='tick')eventToast(t)}
function setPortraitFromSpeaker(name){if(!name||!S.world?.npcs){$('#portraitWrap').classList.add('hidden');return}
 let key=Object.keys(S.world.npcs).find(k=>k.toLowerCase()===String(name).toLowerCase())||Object.keys(S.world.npcs).find(k=>String(name).toLowerCase().includes(k.toLowerCase().split(' ')[0]));
 if(key){try{if(!Know.isNameKnown(S,key)){$('#portraitWrap').classList.add('hidden');return}}catch(_){}
  setPortrait(key,S.world.npcs[key])}else $('#portraitWrap').classList.add('hidden')}

function enterPlay(){$('#keyGate')&&$('#keyGate').classList.add('hidden');$('#title').classList.add('hidden');
 document.body.classList.toggle('greyw',isG());$('#stage').classList.remove('hidden');
 $('.top-actions').style.visibility='';$('#hud').style.visibility='';
 if(S.setup&&!S.setup.done){_mode='setup';loadPack(S.role).then(p=>{S._setupPack=p;showBeat(p)});return}
 _mode='play';
 try{Sim.migrateToV13(S);Econ.ensureEcon(S);Codex.ensureCodex(S);WorldMap.ensureSpawn(S);Level.ensureProgress(S);Know.ensureKnow(S);Know.migrateKnow(S);Cont.ensureCont(S)}catch(_){}
 try{applyGenreTheme(S.genre||S.role)}catch(_){}
 // never replay intro once setup done
 S.flags=S.flags||{}; S.flags.introDone=true;
 try{applyCatchUp()}catch(_){}
 maybeSceneFromWorld();maybePortraitsPresent();
 let last=(S.log||[]).filter(m=>m.k==='n').slice(-1)[0];
 if(!last||!String(last.t||'').trim()||last.t==='…'){
   const pack=PACKS[S.role]||S._setupPack||{};
   const bridge=openingNarration(pack)||'Du öffnest die Augen. Die Welt wartet. Du kennst niemanden.';
   S.log=[{k:'n',t:bridge}]; last={k:'n',t:bridge};
   if(!S.hist||!S.hist.length)S.hist=[{role:'assistant',content:bridge}];
 }
 try{Level.ensureProgress(S);Level.checkTitles(S);Know.ensureKnow(S);Know.migrateKnow(S);
   for(const n of (S.world?.scene?.anwesend||[]))Know.markSeen(S,n,S.world.npcs[n]);
   const wrap=$('#portraitWrap'); if(wrap)wrap.classList.add('hidden');
 }catch(_){}
 typewrite(isG()?'Nebel':'Erzähler', last.t, ()=>{});
 hud();renderChoices();
 try{const w=Imm.weatherFor(S);S.flags=S.flags||{};S.flags.weather=w;Imm.setWeather(w==='klar'?'none':w);Imm.applyDayNightTint(S);applyGenreTheme(S.genre||S.role)}catch(_){}}

function show(){enterPlay()}

/* ---------- menu overlays ---------- */
function openMenu(tab){_menuTab=tab||'hub';$('#menu').classList.remove('hidden');
 $$('#menuTabs button').forEach(b=>b.classList.toggle('on',b.dataset.tab===_menuTab));renderMenu()}
function closeMenu(){$('#menu').classList.add('hidden')}
function renderMenu(){const body=$('#menuBody');if(!body||!S)return;body.innerHTML='';
 const helpers={act,closeMenu,toast,phaseLabel,setSceneImage,imgUrl,openTab:(id)=>{_menuTab=id;$$('#menuTabs button').forEach(x=>x.classList.toggle('on',x.dataset.tab===id));renderMenu()}};
 if(_menuTab==='hub'||!_menuTab){UI14.openHub(body,S,helpers);return}
 if(_menuTab==='level'){UI14.renderLevel(body,S,helpers);return}
 if(_menuTab==='status'){const s=S.st;body.innerHTML=`<div class="card"><h3>${ROLES[S.role].e} ${S.pc?.name||ROLES[S.role].name}</h3>
 <p class="meta">${ROLES[S.role].cls[S.cls]} · Leben #${S.lives} · Seele ${S.soul}</p>
 <p>${isG()?`Verstand ${s.hp}/100 · Schuld ${s.ruf}/100`:`Lv ${s.lvl} · HP ${s.hp}/${s.maxhp} · MP ${s.mp}/${s.maxmp} · 🪙 ${s.gold|0}<br>Stärke ${s.str} · Charme ${s.cha} · Ruf ${s.ruf} · XP ${s.xp}/${s.lvl*100}`}</p>
 <p class="meta">Ort: ${S.world?.scene?.ort||'–'}<br>Zeit: ${phaseLabel()} (${S.world?.scene?.zeit||'–'})<br>Anwesend: ${(S.world?.scene?.anwesend||[]).map(n=>{try{return Know.displayName(S,n)}catch(_){return n}}).join('; ')||'–'}</p>
 ${S.pc?.bg?`<p class="meta">Hintergrund: ${S.pc.bg}</p>`:''}${S.pc?.look?`<p class="meta">Aussehen: ${S.pc.look}</p>`:''}</div>`}
 else if(_menuTab==='inv'){const grid=document.createElement('div');grid.className='inv-grid';
 (S.inv||[]).forEach((it,idx)=>{const item=itemFromStr(it);const cell=document.createElement('button');cell.type='button';cell.className='inv-cell r-'+rarityOf(item);
  cell.innerHTML=`<div class="ico">${item.icon||'📦'}</div><div class="nm">${item.name}</div>`;
  cell.onclick=()=>openItemDetail(idx);grid.appendChild(cell)});
 if(!(S.inv||[]).length)body.innerHTML='<div class="card"><p>Leer.</p></div>';else{body.appendChild(grid);body.innerHTML+=`<div class="card"><p class="meta">Tippe ein Item für Details. Farben = Seltenheit.</p></div>`}}
 else if(_menuTab==='skills'){(S.skills||[]).forEach((sk,idx)=>{const s=skillFromStr(sk);const card=document.createElement('div');card.className='card';
  card.innerHTML=`<div class="skill-card"><div class="skill-ico">${s.icon||'✨'}</div><div style="flex:1"><h3>${s.name} ${(s._cd|0)>0?`<span class="cd-pill">CD ${s._cd}</span>`:''}</h3>
  <p>${s.desc||''}</p><p class="meta">Stufe ${s.level||1} · ${s.cost||0} MP · CD ${s.cd||0}</p><div class="row"></div></div></div>`;
  const row=card.querySelector('.row');const b=document.createElement('button');b.textContent='Einsetzen';b.disabled=(s._cd|0)>0||((s.cost|0)>0&&S.st.mp<(s.cost|0));
  b.onclick=()=>{useSkill(idx)};row.appendChild(b);body.appendChild(card)});if(!(S.skills||[]).length)body.innerHTML='<div class="card"><p>Keine Fähigkeiten.</p></div>'}
 else if(_menuTab==='rels'){const entries=Object.entries(S.romance||{}).filter(([n,r])=>{try{return !!(Know.isNameKnown(S,n)&&(S.know?.people?.[n]?.interacted||(r.affection|0)||(r.stage|0)))}catch(_){return !!((r.affection|0)||(r.stage|0))}});if(!entries.length)body.innerHTML='<div class="card"><p>Noch keine Beziehungen. Unbekannte erscheinen erst nach einer echten Begegnung und wenn du ihren Namen kennst.</p></div>';
  entries.sort((a,b)=>b[1].affection-a[1].affection).forEach(([name,r])=>{const n=S.world?.npcs?.[name];const card=document.createElement('div');card.className='card';
   const mem=(n?.erinnerung||[]).slice(-1)[0]||'–';const portId='rp_'+hashSeed(name);
   card.innerHTML=`<div class="rel-row"><div class="rel-port" id="${portId}">${n?.e||'👤'}</div><div style="flex:1"><h3>${name}</h3>
   <div class="hearts">${hearts(r.stage)}</div><div class="stage-lab">${stageName(r.stage)} · ♡${r.affection} · Vertrauen ${r.trust}</div>
   <div class="aff-bar"><i style="width:${Math.max(0,Math.min(100,r.affection))}%"></i></div></div></div>
   <p class="meta">${n?.art?String(n.art).slice(0,100):''}</p><p class="meta">Ort: ${n?.ort||'?'} · ${mem}</p>
   <div class="row"><button type="button">Ansprechen</button></div>`;
   card.querySelector('button').onclick=()=>{closeMenu();act('Ich gehe zu '+name+' und spreche sie/ihn an.')};body.appendChild(card);
   const box=card.querySelector('.rel-port');const col=portColors(name);box.style.setProperty('--port-a',col.a);box.style.setProperty('--port-b',col.b);
   box.innerHTML=`<span class="port-emoji">${(n&&n.e)||'👤'}</span>`;
   const cache=ensureImgCache();const key='port:'+name;const delay=body.querySelectorAll('.rel-port').length*700;
   if(!window.__FORCE_CSS_SCENES)setTimeout(()=>{
    enqueueImg(()=>{
     const url=cache.portraits[name]||imgUrl(portraitPromptFor(name,n),192,192,hashSeed('port:'+name+(S.role||'')),isG());
     cache.portraits[name]=url;
     if(!canRetry(cache,key)&&cache.fail[key])return Promise.resolve();
     return loadValidatedImage(url).then(res=>{
      if(!res.ok){markFail(cache,key);return}
      cache.ok[key]=1;const im=document.createElement('img');im.alt='';im.crossOrigin='anonymous';
      im.onload=()=>im.classList.add('on');im.src=url;box.appendChild(im);if(S)save()
     })
    })
   },delay)
  })}

 else if(_menuTab==='quests'){const m=S.quests?.main;if(m){const left=(m.objectives||[]).filter(o=>!(m.done||[]).includes(o));
  body.innerHTML+=`<div class="card quest-main"><h3>📜 ${m.titel}</h3><p><b>Akt:</b> ${m.actTitel||''}</p><p>${m.ziel||''}</p>
  <p class="meta">Offen: ${left.join(' · ')||'–'}</p><p class="meta">Erledigt: ${(m.done||[]).join(' · ')||'–'}</p></div>`}
  (S.quests?.side||[]).forEach(q=>{const card=document.createElement('div');card.className='card quest-side';
   card.innerHTML=`<h3>🗺 ${q.titel}</h3><p>${q.ziel||''}</p><p class="meta">${q.status||'offen'}${q.npc?' · '+q.npc:''}</p>`;body.appendChild(card)})}
 else if(_menuTab==='map'){const wrap=document.createElement('div');wrap.className='card map-list';wrap.innerHTML='<h3>📍 Orte</h3>';
  (S.discovered||[]).forEach(d=>{const desc=S.world?.orte?.[d]||'';const el=document.createElement('div');el.className='lex-item';el.innerHTML=`<b>${d}</b><br><span class="meta">${typeof desc==='string'?desc:(desc?.desc||'Entdeckt.')}</span>`;wrap.appendChild(el)});
  body.appendChild(wrap);
  const lore=document.createElement('div');lore.className='card';lore.innerHTML=`<h3>📚 Lore</h3><p class="meta">${(S.world?.lore?.geschichte||PACKS[S.role]?.geschichte||'').slice(0,280)}</p>`;body.appendChild(lore);
  if(S.ticks?.rumours?.length){body.innerHTML+=`<div class="card"><h3>🗣 Gerüchte</h3>${S.ticks.rumours.slice(-5).map(r=>`<div class="lex-item">${r}</div>`).join('')}</div>`}}
 else if(_menuTab==='home'){UI13.renderHome(body,S,{act,closeMenu,phaseLabel})}
 else if(_menuTab==='journal'){UI13.renderJournal(body,S)}
 else if(_menuTab==='finance'){UI13.renderFinance(body,S,{act,closeMenu})}
 else if(_menuTab==='kingdom'){UI13.renderKingdom(body,S,{act,closeMenu})}
 else if(_menuTab==='codex'){UI13.renderCodex(body,S,{setSceneImage,imgUrl})}
 else if(_menuTab==='atlas'){UI13.renderMap(body,S,{act,closeMenu,toast})}
}
function openItemDetail(idx){const item=itemFromStr(S.inv[idx]);const body=$('#menuBody');
 body.innerHTML=`<div class="card"><h3>${item.icon||'📦'} ${item.name}</h3><p>${item.desc||''}</p>
 <p class="meta">${item.type||'misc'} · ${rarityOf(item)}${item.equip?' · ausrüstbar':''}</p><div class="row"></div></div>`;
 const row=body.querySelector('.row');
 if(item.use||item.type==='consumable'){const b=document.createElement('button');b.textContent='Benutzen';b.onclick=()=>{useItem(idx);renderMenu()};row.appendChild(b)}
 if(item.equip||item.type==='weapon'||item.type==='armor'){const b=document.createElement('button');b.textContent=item._eq?'Ablegen':'Ausrüsten';b.onclick=()=>{item._eq=!item._eq;S.inv[idx]=item;toast(item._eq?'Ausgerüstet: '+item.name:'Abgelegt');save();renderMenu();hud()};row.appendChild(b)}
 const b2=document.createElement('button');b2.textContent='Erwähnen';b2.onclick=()=>{closeMenu();act('Ich nutze/betrachte: '+item.name)};row.appendChild(b2);
 const back=document.createElement('button');back.textContent='Zurück';back.onclick=()=>renderMenu();row.appendChild(back)}

function useItem(idx){const item=itemFromStr(S.inv[idx]);const use=item.use||'';
 if(use.startsWith('heal:')){const n=+use.slice(5)||20;S.st.hp=Math.min(S.st.maxhp,S.st.hp+n);toast(`+${n} HP`);S.inv.splice(idx,1);pushSys(`🧪 ${item.name} benutzt (+${n} HP)`)}
 else if(use.startsWith('mp:')){const n=+use.slice(3)||20;S.st.mp=Math.min(S.st.maxmp,S.st.mp+n);toast(`+${n} MP`);S.inv.splice(idx,1);pushSys(`🧪 ${item.name} benutzt (+${n} MP)`)}
 else{closeMenu();act('Ich benutze: '+item.name);return}
 hud();save()}
function useSkill(idx){const sk=skillFromStr(S.skills[idx]);if((sk._cd|0)>0)return toast('Noch Abklingzeit');if((sk.cost|0)>S.st.mp)return toast('Nicht genug MP');
 S.st.mp-=sk.cost|0;sk._cd=sk.cd|0;S.skills[idx]=sk;toast('✨ '+sk.name);closeMenu();act('Ich setze meine Fähigkeit ein: '+sk.name);hud();save()}

/* ---------- apply changes ---------- */
function apply(ch){if(!ch)return;try{ch=Sim.validateChanges(S,ch)}catch(_){}const s=S.st,num=v=>Math.max(-200,Math.min(200,Math.round(+v||0)));const out=[];
 const map={verstand:'hp',schuld:'ruf',hp:'hp',mp:'mp',str:'str',staerke:'str',stärke:'str',cha:'cha',charme:'cha',ruf:'ruf',xp:'xp',gold:'gold'};
 for(const[k,v]of Object.entries(ch)){const m=map[k.toLowerCase()];if(m&&v){s[m]=(s[m]|0)+num(v);out.push(`${k} ${v>0?'+':''}${num(v)}`)}}
 if(ch.affinity&&typeof ch.affinity==='object')for(const[n,v]of Object.entries(ch.affinity)){const trust=ch.trust&&ch.trust[n]!=null?num(ch.trust[n]):Math.max(0,num(v)/2|0);bumpRel(n,num(v),trust,false);out.push(`💗${n.split(' ').pop()} ${v>0?'+':''}${num(v)}`)}
 if(ch.trust&&typeof ch.trust==='object'&&!ch.affinity)for(const[n,v]of Object.entries(ch.trust))bumpRel(n,0,num(v),false);
 (ch.newSkills||ch.skills||[]).forEach(x=>{const sk=skillFromStr(x);if(!S.skills.some(s=>s.name===sk.name)&&S.skills.length<24){S.skills.push(sk);out.push('Skill: '+sk.name);toast('✨ Neue Fähigkeit: '+sk.name)}});
 if(ch.xp){try{const lr=Level.grantXp(S,ch.xp|0,'Aktion');if(lr.leveled?.length)toast('⬆ Level '+lr.leveled.join(', '))}catch(_){}}
 (ch.items||ch.addItems||[]).forEach(x=>{const it=itemFromStr(x);if(!it.rarity)it.rarity='uncommon';if(S.inv.length<40){S.inv.push(it);out.push('Item: '+it.name);toast('📦 '+it.name);try{const kind=/waffe|schwert|bogen|axt|dolch|stab|speer|schild|klinge/i.test(it.name+it.type)?'weapon':'item';discoverThing(kind,it.name,{...it,obtained:true,inline:true})}catch(_){}}});
 (ch.removeItems||[]).forEach(x=>{const name=typeof x==='string'?x:x.name;const i=S.inv.findIndex(it=>(typeof it==='string'?it:it.name)===name);if(i>=0)S.inv.splice(i,1)});
 if(Array.isArray(ch.choices)&&ch.choices.length)S.choices=ch.choices.filter(x=>typeof x==='string').map(x=>x.slice(0,50));
 if(ch.quests)applyQuestUpdate(ch.quests);
 (S.skills||[]).forEach(sk=>{if(sk._cd>0)sk._cd--});
 s.hp=Math.min(s.hp,s.maxhp);s.mp=Math.max(0,Math.min(s.mp,s.maxmp));s.gold=Math.max(0,s.gold|0);
 if(isG()){s.ruf=Math.max(0,Math.min(100,s.ruf));s.hp=Math.max(-1,s.hp);const nc=Math.min(3,Math.floor(S.turn/15));if(nc>S.cls){S.cls=nc;out.push('🌫️ '+ROLES.grey.cls[nc])}}
 else{let leveled=false;while(s.xp>=s.lvl*100){s.xp-=s.lvl*100;s.lvl++;s.maxhp+=10;s.hp=s.maxhp;s.maxmp+=5;s.mp=s.maxmp;s.str+=2;s.cha+=1;leveled=true;out.push(`⬆ LEVEL ${s.lvl}!`);toast('⬆ Level '+s.lvl+'!')}
  const nc=Math.min(3,Math.floor(s.lvl/5));if(nc>S.cls){S.cls=nc;const cn=ROLES[S.role].cls[nc];out.push(`🌟 Klassenwechsel: ${cn}!`);S.skills.push(skillFromStr(R(['Erwachte Aura','Zweite Natur','Seelenblick','Königlicher Befehl'])));toast('🌟 '+cn)}}
 if(out.length)pushSys(out.join(' · '));
 if(ch.ending)return ending(String(ch.ending));checkEnd()}
function checkEnd(){const s=S.st;if(isG()){if(s.hp<=0)return ending('Der Nebel hat deinen Verstand. Greymourne trägt deinen Namen jetzt in seinem Register.');if(s.ruf>=100)return ending('Die Schuld wiegt mehr als du. Die Stadt behält dich – AUSGEGEBEN: 1, ZURÜCK: 0.');return}
 if(s.hp<=0)return death();
 const top=Object.entries(S.romance||{}).find(([,v])=>(v.stage|0)>=5&&(v.affection|0)>=90);if(top)return ending(`Romantisches Ende mit ${top[0]} 💞`);
 if(s.lvl>=20)return ending('Legenden-Ende: Dein Name wird ewig besungen 👑');
 if(s.ruf>=150)return ending('Ruhmes-Ende: Das Volk krönt dich zur Hoffnung der Welt');
 if(s.ruf<=-150)return ending('Tyrannen-Ende: Die Welt kniet in Furcht vor dir')}
function death(){pushSys(`💀 Du bist gestorben (Level ${S.st.lvl}).`);setTimeout(()=>reincarnate('Die Göttin seufzt: „Schon wieder? Na gut – nimm etwas mit.“'),600)}
function ending(t){pushSys('🏁 ENDE: '+t);S.choices=[];hud();save();
 typewrite('Ende',t,()=>{});
 if(isG()){const c=$('#choices');c.innerHTML='';[['🎫 Erneut als Darren',()=>newGrey('darren')],['✒️ Andere Figur',()=>{S=null;localStorage.removeItem(KEY);location.reload()}]].forEach(([l,f])=>{const b=document.createElement('button');b.type='button';b.textContent=l;b.onclick=f;c.appendChild(b)});return}
 setTimeout(()=>reincarnate('Ein neues Kapitel? Deine Seele wird stärker.'),1500)}
function reincarnate(msg){const soul=S.soul+Math.max(1,Math.floor(S.st.lvl/2));const kept=skillNames().filter(x=>!['Status-Fenster','Schwertschlag','Romanwissen','Eleganter Fächerhieb','Dunkle Aura','Höllenflamme','Moderne Bildung','Beobachten'].includes(x)).slice(-2);
 const meta={lives:S.lives,soul,keptSkills:kept};typewrite('Göttin',msg+(kept.length?`\nBehaltene Skills: ${kept.join(', ')}`:''),()=>{});
 S.choices=[];hud();const c=$('#choices');c.innerHTML='';
 // After death, return to cinematic destiny choice rather than 4 cards
 [['✦ Neues Schicksal wählen',()=>{S=null;startIntro()}],...Object.entries(ROLES).filter(([k])=>k!=='grey').map(([k,r])=>[r.e+' '+r.name,()=>{$('#vnText').textContent='';newLife(k,meta)}])].forEach(([l,f])=>{const b=document.createElement('button');b.type='button';b.textContent=l;b.onclick=f;c.appendChild(b)});save()}

/* ---------- world text lean ---------- */
function worldText(){const w=S.world;if(!w)return '';
 const scene=w.scene||{};const present=(scene.anwesend||[]).slice(0,6);
 const npcs={};for(const k of present){const v=w.npcs?.[k];if(!v)continue;
  const rom=S.romance?.[k];
  const o={art:String(v.art||'').slice(0,80)};
  try{if(Know.isNameKnown(S,k)){o.name=k;if(S.know?.people?.[k]?.facts?.job&&v.job)o.job=v.job}else o.label=Know.displayName(S,k,v)}catch(_){o.name=k}
  if(rom&&(rom.stage|0)>0)o.bez=stageName(rom.stage);
  const mem=(v.erinnerung||[]).slice(-1);if(mem.length)o.mem=mem[0];
  npcs[k]=o}
 return 'WELT-LEAN: '+JSON.stringify({ort:scene.ort,zeit:phaseLabel(),anwesend:present,npcs,heat:S.heat|0}).slice(0,1100)}
function applyWorld(u){if(!u||!S.world)return;try{u=Sim.validateWorldUpdate(S,u)}catch(_){}try{u=guardNoRegression(u)}catch(_){}const w=S.world;const cut=(x,n)=>String(x||'').slice(0,n);const prevOrt=w.scene?.ort;
 if(u.scene&&u.scene.ort){w.scene={ort:cut(u.scene.ort,80),zeit:cut(u.scene.zeit,60)||phaseLabel(),anwesend:(u.scene.anwesend||[]).slice(0,8).map(x=>cut(x,40)).filter(n=>!Sim.isDead(S,n)||w.npcs[n]?.undead)};discover(w.scene.ort);
  if(w.scene.ort!==prevOrt||u.scenePrompt||u.imagePrompt){S.flags.scenePrompt=u.scenePrompt||u.imagePrompt||scenePromptFor(w.scene.ort,w.scene.zeit);setSceneImage(S.flags.scenePrompt,w.scene.ort)}
  maybePortraitsPresent()}
 if(u.speaker)S.flags.speaker=cut(u.speaker,40);
 (u.npcUpdates||[]).forEach(n=>{if(!n||!n.name)return;let k=Object.keys(w.npcs).find(x=>x.toLowerCase()===String(n.name).toLowerCase());
  if(!k){if(Object.keys(w.npcs).length>=16)return;k=cut(n.name,40);w.npcs[k]={art:'',ziel:'',geheimnis:'',beziehung:'Fremd',erinnerung:[],e:'👤',plan:[]};if(!S.romance[k])S.romance[k]={affection:0,trust:0,stage:0,events:[]}}
  const p=w.npcs[k];['art','ziel','geheimnis','beziehung','ort'].forEach(f=>{if(n[f])p[f]=cut(n[f],140)});if(n.erinnerung){p.erinnerung.push(cut(n.erinnerung,140));p.erinnerung=p.erinnerung.slice(-6)};if(n.plan)p.plan=[cut(n.plan,80),...(p.plan||[])].slice(0,5);
  if(n.portraitPrompt&&!S.imgCache.portraits[k]){S.imgCache.portraits[k]=imgUrl(n.portraitPrompt,256,256,hashSeed('port:'+k),isG())}});
 (u.newLocations||[]).forEach(l=>{if(l&&l.name&&Object.keys(w.orte).length<20){w.orte[cut(l.name,50)]=cut(l.desc,140);discover(cut(l.name,50))}});
 if(Array.isArray(u.ereignisse)&&u.ereignisse.length)w.ereignisse=u.ereignisse.slice(0,6).map(x=>cut(x,140))}
function isQ(a){return /\?\s*$/.test(a.trim())||/^\s*(wer|was|wo|wohin|woher|wie|warum|wieso|weshalb|wann|welche[rsmn]?|seid|bist|sind|kannst|könnt|ist|habt|hast|gibt)\b/i.test(a)}
function askNPC(a){if(!isQ(a)||!S)return null;const t=a.toLowerCase();const pres=(S.world?.scene?.anwesend||[]).map(String);
 const bible=S.world?.npcs||{};
 const STOP=/^(der|die|das|ein|eine|einer|im|am|zug|von|und)$/;const find=n=>{const w=n.toLowerCase();return Object.entries(bible).find(([k])=>k.toLowerCase()===w)||Object.entries(bible).find(([k])=>k.toLowerCase().split(/[ \/–_-]+/).some(p=>p.length>3&&!STOP.test(p)&&w.includes(p)))};
 let who=pres.map(p=>{const f=find(p);return f?{n:f[0],d:f[1],label:p}:{n:p,d:null,label:p}});if(!who.length){const here=whoHere();who=here.slice(0,2).map(k=>({n:k,d:bible[k],label:k}));if(!who.length)return null}
 const named=who.filter(w=>t.includes(w.n.toLowerCase().split(' ')[0]));const sp=(named.length?named:who).slice(0,/ihr|euch|alle|seid/.test(t)?3:1);
 const first=s=>String(s||'').split(/[.;]/)[0].trim();const lines=sp.map(w=>{const nm=w.n.split(' / ')[0];const desc=first(w.d?.art||w.d?.stimme);
  const rom=S.romance?.[w.n];const st=rom?stageName(rom.stage):'Fremd';
  if(/wer|seid|bist|name/.test(t)){return `${w.label} ${R(['mustert dich','hebt den Blick','zögert kurz'])}. „${nm}.“${desc?' '+desc+'.':''} (${st})`}
  if(/wo|wohin|woher/.test(t)){const o=S.world?.scene?.ort||'hier';return `${w.label}: „Du bist ${/^(in|im|am|auf|an)\b/i.test(o)?o:'in '+o}.“`}
  return `${w.label} ${R(['runzelt die Stirn','sieht dich lange an','senkt die Stimme'])}: „${R(['Das ist eine gute Frage.','Nicht hier. Nicht jetzt.','Wenn du das wirklich wissen willst, bleib in meiner Nähe.'])}“`});
 const aff={};sp.forEach(w=>{aff[w.n]=2});
 return {text:`„${a}“\n\n`+lines.join('\n\n'),changes:{xp:5,affinity:aff,choices:defChoices()}}}


function ensureSystems(){if(!S.world)return {};if(!S.world.systems)S.world.systems={};const sys=S.world.systems;
 if(S.genre==='zombie'||sys.kind==='zombie'){sys.kind='zombie';if(sys.hunger==null)sys.hunger=30;if(sys.thirst==null)sys.thirst=25;if(sys.infection==null)sys.infection=0;if(sys.ammo==null)sys.ammo=12;if(sys.safehouse==null)sys.safehouse=''}
 return sys}
function romanceable(name){const n=S.world?.npcs?.[name];if(!n||n.alive===false)return false;if(n.adult===false)return false; // adults only
 if(n.romance===false)return false;return true}
function parseRomance(a){const t=a.toLowerCase();const who=findNpcTarget(a)||(S.world?.scene?.anwesend||[]).find(n=>romanceable(n));
 if(!who)return null;const n=S.world.npcs[who];if(!romanceable(who))return null;
 const rom=S.romance[who]||{affection:0,trust:0,stage:0,events:[]};S.romance[who]=rom;
 const kiss=/küss|kuss|küsse/.test(t);const date=/date|verabredung|spaziergang|einladen|zum essen|tee trinken|ausgang/.test(t);
 const night=/nacht (mit|zusammen)|bleib(en)? (bei|über Nacht)|schlaf(en)? (mit|bei)|gemeinsam(e)? nacht|ins bett/.test(t);
 const askRel=/freund|partner|zusammen sein|meine freundin|mein freund|beziehung|offiziell/.test(t);
 if(!(kiss||date||night||askRel||/flirt|umarmen|hand halten|geständnis|liebe gestehen/.test(t)))return null;
 // consent from affection, trust, personality, mood
 const mood=n.mood||'neutral';const hostile=/wütend|rachsüchtig|ängstlich|trauervoll|feindlich/.test(mood);
 const aff=rom.affection|0,tr=rom.trust|0;
 let willing=true;let reason='';
 if(hostile){willing=false;reason='Stimmung'}
 else if(night){willing=aff>=55&&tr>=45&&(rom.stage|0)>=3}
 else if(kiss){willing=aff>=35&&tr>=25&&(rom.stage|0)>=2}
 else if(askRel){willing=aff>=50&&tr>=40}
 else if(date){willing=aff>=20&&tr>=15}
 else willing=aff>=10;
 // personality veto
 if(/kühl|stolz|wortkarg/.test(String(n.art||''))&&aff<40&&(kiss||night))willing=false;
 if(!willing){addMemory(who,`Hat ein romantisches Angebot abgelehnt (${reason||'Grenzen'}).`,'Romance');
  bumpRel(who,kiss||night?-rnd(2,6):0,0,false);
  const no=R([`„Nein.“ ${who} schüttelt den Kopf – klar, ohne Drama, aber endgültig für jetzt.`,`„Das möchte ich nicht.“ ${who} geht einen Schritt zurück.`,`„Wir sind nicht so weit.“ ${who} lächelt schief, aber die Grenze steht.`]);
  return {text:no,changes:{affinity:{[who]:-2},choices:travelChoices()}}}
 // yes paths — fade to black for sexual
 if(night){rom.events=(rom.events||[]).concat('nacht').slice(-12);bumpRel(who,rnd(8,14),rnd(6,12),true);addMemory(who,'Nacht mit dir verbracht (fade to black). Erinnerung: Wärme, Vertrauen, Nähe.','Romance');
  n.mood='vertraut';
  return {text:`${who} hält deinen Blick – und nickt. Was folgt, bleibt zwischen euch.\n\n(Die Szene verblasst. Nur Atem, Wärme, Vertrauen.)\n\nAm Morgen ist etwas anders: nicht lauter – aber echter.`,changes:{affinity:{[who]:rnd(8,14)},trust:{[who]:rnd(6,12)},choices:travelChoices()}}}
 if(kiss){bumpRel(who,rnd(5,10),rnd(3,7),true);addMemory(who,'Kuss mit dir.','Romance');n.mood='verliebt';
  return {text:`${who} kommt näher. Ein Kuss – kurz oder lang, aber einvernehmlich. Danach Stille, die nicht peinlich ist.`,changes:{affinity:{[who]:rnd(5,10)},trust:{[who]:rnd(3,7)},choices:travelChoices()}}}
 if(date){bumpRel(who,rnd(6,12),rnd(4,8),true);addMemory(who,`Date/Zeit zu zweit in ${S.world.scene.ort}.`,'Romance');applyActionDuration('date mit '+who,45);
  return {text:`Ihr nehmt euch Zeit – nur ihr zwei, in ${S.world.scene.ort}. Gespräche, Blicke, ein Lachen, das nicht gespielt wirkt.`,changes:{affinity:{[who]:rnd(6,12)},trust:{[who]:rnd(4,8)},choices:travelChoices()}}}
 if(askRel){rom.stage=Math.max(rom.stage|0,4);bumpRel(who,rnd(10,16),rnd(8,14),true);addMemory(who,'Beziehung offiziell gemacht.','Romance');
  return {text:`„Dann… wir?“ ${who} atmet aus. „Ja. Wenn du es ernst meinst.“ Etwas klickt – nicht als Quest, als Entscheidung.`,changes:{affinity:{[who]:rnd(10,16)},trust:{[who]:rnd(8,14)},choices:travelChoices()}}}
 bumpRel(who,rnd(3,7),rnd(2,5),false);addMemory(who,'Flirt / zärtlicher Moment mit dir.','Romance');
 return {text:`${who} erwidert die Geste – behutsam, einvernehmlich.`,changes:{affinity:{[who]:rnd(3,7)},choices:travelChoices()}}}

/* ---------- procedural genre worlds ---------- */
const GENRES={
 zombie:{id:'zombie',label:'Zombie-Apokalypse',ton:'Modern, düster, Überlebenskampf. Knappheit, Misstrauen, seltene Hoffnung.',icon:'🧟',
  systems:{kind:'zombie',hunger:35,thirst:30,infection:0,ammo:15,safehouse:''},
  places:['Parkplatz Eastmall','Supermarkt Ruine','Safehouse Keller','Autobahnbrücke','Krankenhaus Flügel C','Radio-Turm','Wohnblock 4','Hafenlager'],
  factions:['Überlebende der Mall','Plünderer-Crew','Militär-Rest','Infizierte (Horden)'],
  conflict:'Die Stadt gehört den Infizierten. Essen und Munition schwinden. Ein Radio spricht von einer Evakuierung in drei Tagen – vielleicht Lüge.',
  npcSeeds:[{e:'🩹',art:'Sanitäterin, pragmatisch, müde Augen',ziel:'Impfstoffe finden'},{e:'🔧',art:'Mechaniker, zynisch, treu',ziel:'Generator am Laufen halten'},{e:'📻',art:'Scavengerin, schnell, misstrauisch',ziel:'Zum Radio-Turm'},{e:'🪖',art:'Ex-Soldat, Befehlston',ziel:'Disziplin erzwingen'},{e:'🎒',art:'Teenager (18+), ängstlich-tapfer',ziel:'Familie finden'},{e:'🧪',art:'Wissenschaftlerin, distanziert',ziel:'Infektion verstehen'},{e:'🔫',art:'Waffenhändlerin, kalt',ziel:'Profit in der Apokalypse'},{e:'🍞',art:'Koch, warmherzig',ziel:'Leute ernähren'}]},
 cyberpunk:{id:'cyberpunk',label:'Cyberpunk',ton:'Neon, Konzerne, Street-Level. Chrome und Schulden.',icon:'🌆',
  systems:{kind:'cyber',cred:50,heat_net:0},
  places:['Neon-Gasse','Konzern-Lobby Arasaka-Analog','Nachtmarkt','Underground-Club','Datenkiosk','Rooftop-Slum','Klinik Chrom&Knochen','Hafencontainer'],
  factions:['Street-Fixer','Konzern-Security','Netrunner-Crew','Ganger'],
  conflict:'Ein Datenträger in deiner Tasche ist mehr wert als dein Leben. Zwei Fraktionen wollen ihn – und dich.',
  npcSeeds:[{e:'🕶️',art:'Fixer, lächelt nie echt',ziel:'Deals brokern'},{e:'💊',art:'Street-Doc',ziel:'Schulden tilgen'},{e:'🖥️',art:'Netrunnerin',ziel:'ICE brechen'},{e:'🏍️',art:'Nomadin',ziel:'Raus aus der Stadt'},{e:'👔',art:'Konzern-Agent',ziel:'Asset bergen'},{e:'🎤',art:'Club-Sängerin',ziel:'Vertrag lösen'},{e:'🤖',art:'Android mit Glitch',ziel:'Freiheit'},{e:'🔧',art:'Techie',ziel:'Legende bauen'}]},
 darkfantasy:{id:'darkfantasy',label:'Dark Fantasy',ton:'Bleicher Mond, Flüche, Königreiche aus Asche.',icon:'🦇',
  systems:{kind:'dark',corruption:0},
  places:['Asche-Thron','Blutmoor','Verfluchte Kapelle','Söldnerlager','Knochenbrücke','Hexenwald','Ruinenstadt Vael','Katakomben'],
  factions:['Aschenkirche','Nachtfürsten','Söldnerbund','Hexenzirkel'],
  conflict:'Der Mond blutet. Ein Fluch frisst Namen – und deiner steht als Nächstes auf der Liste.',
  npcSeeds:[{e:'🕯️',art:'Priesterin mit Rissen in den Handflächen',ziel:'Fluch binden'},{e:'🐺',art:'Verfluchter Jäger',ziel:'Erlösung oder Beute'},{e:'🗡️',art:'Söldnerhauptmann',ziel:'Gold und Überleben'},{e:'📜',art:'Chronistin',ziel:'Wahrheit aufschreiben'},{e:'🧙',art:'Hexenmeister',ziel:'Macht um jeden Preis'},{e:'👑',art:'Exil-Prinz',ziel:'Thron zurück'},{e:'🪶',art:'Rabenbotin',ziel:'Botschaften liefern'},{e:'💀',art:'Untoter Ritter',ziel:'Eid erfüllen'}]},
 highfantasy:{id:'highfantasy',label:'High Fantasy',ton:'Episch, Magie, Drachenferne, Hoffnung mit Preis.',icon:'🐉',
  systems:{kind:'fantasy',mana_tide:1},
  places:['Kristallspitze','Elfenhain','Zwergenhalle','Drachenpass','Magierakademie','Königsmarkt','Ork-Grenzstein','Sternentempel'],
  factions:['Magierzirkel','Drachenbund','Händlerliga','Ork-Clans'],
  conflict:'Ein Drache erwacht nicht aus Gier – sondern aus einem gebrochenen Pakt. Die Reiche rüsten.',
  npcSeeds:[{e:'✨',art:'Magierlehrling',ziel:'Meister werden'},{e:'🏹',art:'Elfenwächterin',ziel:'Hain schützen'},{e:'⛏️',art:'Zwergen-Schmied',ziel:'Legendäre Klinge'},{e:'🛡️',art:'Paladin',ziel:'Licht tragen'},{e:'🐲',art:'Drachenblütige',ziel:'Herkunft verstehen'},{e:'🎪',art:'Barde',ziel:'Lied der Wahrheit'},{e:'🔮',art:'Orakel',ziel:'Schicksal biegen'},{e:'⚔️',art:'Ritterin',ziel:'Ehre halten'}]},
 survival:{id:'survival',label:'Survival',ton:'Wildnis, Kälte, Hunger, Handwerk.',icon:'🏕️',
  systems:{kind:'survival',hunger:40,thirst:35,cold:20,wood:5,food:3},
  places:['Basislager','Flussufer','Dichter Forst','Höhle','Jagdpfad','Ruinenhütte','Berggrat','Moore'],
  factions:['Siedler','Wilderer','Einsiedler','Raubtiere'],
  conflict:'Der Winter kommt früh. Ohne Vorräte stirbt das Lager – und jemand sabotiert die Fallen.',
  npcSeeds:[{e:'🪓',art:'Holzfäller',ziel:'Holzvorrat'},{e:'🦌',art:'Jägerin',ziel:'Fleisch für alle'},{e:'🩹',art:'Heilerin',ziel:'Kräuter finden'},{e:'👶',art:'Junge Mutter (erwachsen)',ziel:'Kind schützen'},{e:'🧭',art:'Pfadfinder',ziel:'Karte fertig'},{e:'🎣',art:'Fischer',ziel:'Netz reparieren'},{e:'🐺',art:'Wolfsflüsterer',ziel:'Rudelbündnis'},{e:'🔥',art:'Wächterin',ziel:'Feuer am Leben'}]},
 postapoc:{id:'postapoc',label:'Post-Apokalypse',ton:'Staub, Ruinen, Stämme, sauberes Wasser als Gold.',icon:'☢️',
  systems:{kind:'postapoc',water:40,rad:5,scrap:10},
  places:['Staub-Siedlung','Wasserloch','Schrottfestung','Giftfluss','Windrad-Farm','Bunker 9','Karawanenweg','Leuchtende Krater'],
  factions:['Wasser-Kartell','Schrott-Nomaden','Bunker-Kult','Karawane'],
  conflict:'Das letzte saubere Wasserloch versiegt. Das Kartell verkauft Tropfen – und sucht Sündenböcke.',
  npcSeeds:[{e:'💧',art:'Wasserhändlerin',ziel:'Monopol halten'},{e:'🔩',art:'Schrottschmied',ziel:'Panzerung bauen'},{e:'📿',art:'Kultprediger',ziel:'Bekehren'},{e:'🐪',art:'Karawanenführer',ziel:'Route sichern'},{e:'😷',art:'Arzt ohne Mittel',ziel:'Medizin finden'},{e:'🗺️',art:'Kartografin',ziel:'Sichere Pfade'},{e:'⛓️',art:'Ex-Sklave',ziel:'Freiheit anderer'},{e:'🌱',art:'Gärtnerin',ziel:'Erde heilen'}]}
};

function pickGenre(idOrText){const s=String(idOrText||'').toLowerCase().trim();
 if(GENRES[s])return GENRES[s];
 if(/zombie|untot|beißer|infekt/.test(s))return GENRES.zombie;
 if(/cyber|neon|konzern|netrunner/.test(s))return GENRES.cyberpunk;
 if(/dark\s*fantasy|dunkel|fluch|blutmond/.test(s))return GENRES.darkfantasy;
 if(/high\s*fantasy|drache|elfen|magier/.test(s))return GENRES.highfantasy;
 if(/survival|überleben|wildnis|camping/.test(s))return GENRES.survival;
 if(/post|wüste|radioaktiv|staub/.test(s))return GENRES.postapoc;
 // custom
 return {id:'custom',label:s.slice(0,40)||'Custom',ton:'Frei nach Vorgabe: '+s,icon:'🎲',systems:{kind:'custom'},
  places:['Ausgangspunkt','Grenzmarkt','Verlassene Station','Hochland','Untergrund','Hafenruine','Observatorium','Lager der Fraktion'],
  factions:['Einheimische','Außenseiter','Alte Macht','Neue Ordnung'],
  conflict:'Etwas in dieser Welt verlangt eine Entscheidung – und wartet nicht.',
  npcSeeds:[{e:'👤',art:'Fremde:r mit Geheimnis',ziel:'Überleben'},{e:'🧭',art:'Führer:in',ziel:'Den Weg kennen'},{e:'⚔️',art:'Kämpfer:in',ziel:'Stärke beweisen'},{e:'📚',art:'Gelehrte:r',ziel:'Wissen bergen'},{e:'💰',art:'Händler:in',ziel:'Profit'},{e:'🔮',art:'Seher:in',ziel:'Zukunft lesen'},{e:'🛡️',art:'Wächter:in',ziel:'Schützen'},{e:'🎭',art:'Trickser:in',ziel:'Spiel spielen'}],
  custom:s}}

function offlineGenerateWorld(genreInput,pcName){const g=pickGenre(genreInput);const namesA=['Ava','Ren','Kai','Mira','Jon','Sera','Viktor','Lina','Omar','Nyx','Pia','Theo','Eira','Cruz','Yuna','Baz'];
 const nodes={};const places=g.places.slice(0,8);places.forEach((name,i)=>{const exits=[places[(i+1)%places.length],places[(i+2)%places.length]];if(i>0)exits.push(places[0]);
  nodes[name]={desc:R(['Staub und Echo.','Leben trotz allem.','Spuren von gestern.','Ein Ort mit Zähnen.','Ruhe, die lügt.']),tags:[g.id],exits:[...new Set(exits)].slice(0,3),bg:slugify(name).split('-')[0]||'void'}});
 const start=places[0];const npcs={};const seeds=g.npcSeeds.slice(0,8);
 seeds.forEach((seed,i)=>{const nm=(R(namesA)+' '+R(['Voss','Chen','Adler','Krämer','Sol','Beck','Nguyen','Rauch'])+(i===0?'':''));
  const name=nm+(npcs[nm]?('-'+i):'');const home=places[i%places.length];
  const sch=['Morgen: '+home,'Mittag: '+places[(i+1)%places.length],'Nachmittag: '+places[(i+2)%places.length],'Abend: '+places[(i+3)%places.length],'Nacht: '+home];
  npcs[name]={e:seed.e,art:seed.art+', erwachsen',stimme:'knapp, menschlich',ziel:seed.ziel,furcht:R(['Verlust','Verrat','Hunger','Vergessen']),geheimnis:R(['Hat jemanden im Stich gelassen.','Kennt einen geheimen Weg.','Schuldet einer Fraktion alles.','Trägt Infektion/Geheimnis verborgen.']),
   beziehung:'Fremd',erinnerung:[],memories:[],ort:home,home,plan:[seed.ziel],relations:{},romance:i<5,adult:true,geschlecht:R(['weiblich','männlich','']),schedule:sch,mood:'angespannt',goals:[seed.ziel],portrait:'',alive:true,lastSeen:{ort:home,zeit:'',day:1}}});
 // link relations
 const keys=Object.keys(npcs);for(let i=0;i<keys.length;i++){const a=keys[i],b=keys[(i+1)%keys.length],c=keys[(i+3)%keys.length];
  npcs[a].relations[b]=R(['misstraut','respektiert','mag','schuldet']);npcs[a].relations[c]=R(['kennt','meidet','schätzt'])}
 const orte=Object.fromEntries(Object.entries(nodes).map(([k,v])=>[k,v.desc]));
 const systems=Object.assign({},g.systems||{});
 const pack={id:'proc_'+g.id,titel:g.label+(g.custom?' – '+g.custom.slice(0,30):''),ton:g.ton,genre:g.id,geschichte:g.conflict,conflict:g.conflict,
  kultur:(g.factions||[]).join(', '),alltag:'Die Welt läuft weiter, mit oder ohne dich.',politik:g.factions?.[0]||'',
  locations:{nodes,start},orte,npcs,systems,factions:g.factions,startScene:{ort:start,zeit:'Abend',anwesend:keys.slice(0,2)},
  startEvents:[g.conflict],startItems:g.id==='zombie'?[{name:'Tasche',icon:'🎒',type:'misc'},{name:'Messer',icon:'🔪',type:'weapon'},{name:'Wasserflasche',icon:'💧',type:'consumable',use:'heal:15'},{name:'Patronen',icon:'🔫',type:'misc'}]:[{name:'Rucksack',icon:'🎒',type:'misc'},{name:'Proviant',icon:'🍞',type:'consumable',use:'heal:20'}],
  startSkills:g.id==='zombie'?[{name:'Erste Hilfe',icon:'🩹',cost:0,cd:0},{name:'Leise bewegen',icon:'🤫',cost:0,cd:0}]:[{name:'Beobachten',icon:'👁',cost:0,cd:0}],
  romanceable:keys.filter(k=>npcs[k].romance).slice(0,5),
  arc:{titel:'Konflikt',acts:[{id:'a1',titel:'Ankommen',ziel:'Verstehe die Lage – oder ignoriere sie',mile:['Einen sicheren Ort finden','Jemanden kennenlernen'],twist:'Nichts ist umsonst'}]},
  sideQuests:keys.slice(0,3).map((k,i)=>({id:'sq'+i,titel:npcs[k].ziel,ziel:npcs[k].ziel,npc:k,ort:npcs[k].home})),
  imageStyle:g.id==='zombie'?'cinematic realistic modern apocalypse, muted colors':g.id==='cyberpunk'?'anime cyberpunk neon night': 'anime detailed illustration',
  _generated:true,_genreLabel:g.label};
 return pack}

async function generateWorldPack(genreInput,pcName){ // Gemini if key, else offline
 const offline=()=>offlineGenerateWorld(genreInput,pcName);
 if(!hasKey()||(cfg.mode==='offline'))return offline();
 try{
  const g=pickGenre(genreInput);
  const prompt=`Erzeuge ein vollständiges World-Bible JSON auf Deutsch für ein interaktives Spiel. Genre: ${g.label}. Premise: ${g.custom||g.conflict}.
Felder: titel, ton, geschichte, conflict, factions[4], locations:{start,nodes:{name:{desc,exits[2-4]}}}, npcs:{8 Namen:{art,stimme,ziel,furcht,geheimnis,ort,home,schedule[5 Phasen],romance:bool,adult:true,e:emoji}}, startScene, startItems, startSkills, arc:{titel,acts:[{titel,ziel,mile}]}, sideQuests[3], systems (passend zum Genre). Keine Minderjährigen. Nur JSON.`;
  const key=cfg.gkey||localStorage.getItem('isekai_gkey')||'';
  // reuse thin generateContent
  const st=await gmFetch(key);const model=(gmOrder(st)||G_FALLBACK)[0];
  const url=`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
  const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{temperature:.9,maxOutputTokens:4096}})});
  const j=await res.json();const text=j?.candidates?.[0]?.content?.parts?.map(p=>p.text).join('')||'';
  const m=text.match(/\{[\s\S]*\}/);if(!m)return offline();
  const raw=JSON.parse(m[0]);
  // normalize into pack
  const pack=offline(); // base structure
  Object.assign(pack,{titel:raw.titel||pack.titel,ton:raw.ton||pack.ton,geschichte:raw.geschichte||raw.conflict||pack.geschichte,conflict:raw.conflict||pack.conflict});
  if(raw.locations?.nodes){pack.locations=raw.locations;pack.orte=Object.fromEntries(Object.entries(raw.locations.nodes).map(([k,v])=>[k,v.desc||'']));pack.startScene=raw.startScene||{ort:raw.locations.start,zeit:'Abend',anwesend:Object.keys(raw.npcs||{}).slice(0,2)}}
  if(raw.npcs){pack.npcs={};for(const[k,v]of Object.entries(raw.npcs)){pack.npcs[k]=Object.assign({erinnerung:[],memories:[],alive:true,adult:true,relations:{},plan:[],mood:'neutral',goals:[],lastSeen:{ort:v.ort||'',zeit:'',day:1}},v,{adult:true})}}
  if(raw.systems)pack.systems=raw.systems;if(raw.arc)pack.arc=raw.arc;if(raw.sideQuests)pack.sideQuests=raw.sideQuests;
  pack._generated=true;return pack;
 }catch(e){console.warn('genworld fail',e);return offline()}}

async function startProcedural(genreInput,pcName){const pack=await generateWorldPack(genreInput,pcName||'Alex');
 PACKS.proc=pack;ROLES.proc={e:pack.icon||'🎲',name:pack._genreLabel||pack.titel,d:pack.ton,world:pack.titel,base:{hp:100,mp:30,str:10,cha:10,ruf:0,gold:20},cls:['Überlebende:r','Scavenger','Anführer:in','Legende'],pack:'',scene:pack.imageStyle||'apocalyptic scene'};
 const world=buildWorldFromPack(pack,'proc');
 const romNames=Object.keys(world.npcs);
 S={ver:VER,role:'proc',genre:pack.genre||pickGenre(genreInput).id,lives:1,soul:0,pc:{name:pcName||'Alex',bg:genreInput,look:'',trait:''},
  st:{hp:100,maxhp:100,mp:30,maxmp:30,str:10,cha:10,ruf:0,gold:pack.genre==='zombie'?5:25,lvl:1,xp:0},
  skills:(pack.startSkills||[]).map(x=>({...skillFromStr(x),_cd:0})),inv:(pack.startItems||[]).map(x=>({...itemFromStr(x)})),
  aff:Object.fromEntries(romNames.map(k=>[k,0])),romance:initRomance(pack,romNames),
  quests:buildQuests(pack),discovered:[world.scene.ort].filter(Boolean),ticks:{rumours:[],log:[]},
  cls:0,turn:0,hist:[],log:[],flags:{},setup:{done:true,beat:0,answers:{}},summary:pack.conflict||'',
  time:{day:1,hour:18,phase:'Abend'},imgCache:{scenes:{},portraits:{},ok:{},fail:{},next:{}},heat:0,wanted:[],dead:[],world};
 enrichNpcs(S.world);ensureGraph(S);try{Sim.migrateToV13(S);Econ.ensureEcon(S);Codex.ensureCodex(S);WorldMap.ensureSpawn(S);Level.ensureProgress(S);Know.ensureKnow(S);Know.migrateKnow(S);S.ver=VER}catch(_){}if(S.world.systems||S.genre==='zombie')ensureSystems();
 const bridge=`${pack.titel}.\n\n${pack.conflict||pack.geschichte}\n\nDu – ${S.pc.name} – stehst in ${world.scene.ort}. Die Welt wartet nicht. Wohin du gehst, ist deine Sache.`;
 S.log=[{k:'n',t:bridge}];S.hist=[{role:'assistant',content:bridge}];S.choices=travelChoices(world.scene.ort);
 save();enterPlay();typewrite('Erzähler',bridge,()=>{});hud();renderChoices();
 applySceneTheme(themeFromText(pack.genre+' '+world.scene.ort));setSceneImage(scenePromptFor(world.scene.ort,'Abend'),world.scene.ort);
 return S}


function parseLifeSim(a){const t=a.toLowerCase();
  const extras=UI13.parseLifeExtras(a,S,{advanceTime,travelTo,travelChoices,skillFromStr,toast,phaseLabel});
  if(extras)return extras;
  if(/aufersteh|erweck|nekroman|toten.*zurück|wiederbele|resurrect/.test(t)){
    let who=findAnyNpc(a);if(!who||!Sim.isDead(S,who)){who=(S.dead||[]).find(n=>t.includes(n.toLowerCase().split(' ')[0]))||(S.dead||[])[0]}
    if(!who)return {ok:false,text:'Wen soll die Nekromantie holen?'};
    const gate=Sim.canResurrect(S,who);
    if(!gate.ok){
      const vael=Object.keys(S.world.npcs||{}).find(k=>/nekromant/i.test(k)||/nekromant/i.test(S.world.npcs[k].art||''));
      if(vael&&!Sim.isDead(S,vael)){if(!S.world.scene.anwesend.includes(vael))S.world.scene.anwesend.push(vael);S.world.npcs[vael].ort=S.world.scene.ort}
      else if(!(S.skills||[]).some(sk=>/nekromantie|totenerweck/i.test(typeof sk==='string'?sk:sk.name||''))){
        if(/lerne|fähigkeit|skill|magie/.test(t)){S.skills.push(skillFromStr({name:'Nekromantie',icon:'💀',desc:'Tote als Untote zurückholen.',level:1,cost:40,cd:5}));toast('✨ Nekromantie erlernt')}
      }
    }
    const r=Sim.resurrectNPC(S,who);advanceTime(2);
    return {ok:r.ok,text:r.ok?(r.text||'Auferstehung.'):('Scheitert: '+(r.text||'Kein Nekromant.')),changes:{choices:travelChoices(),mp:r.ok?-40:0,hp:r.ok?-15:0,xp:r.ok?40:5}}
  }
  if(/grundstück|land beanspruch|beanspruch.*land|bauplatz/.test(t)){
    const r=Sim.claimLand(S,S.world.scene.ort);advanceTime(1);return {ok:r.ok,text:r.text,changes:{xp:10,choices:['Material sammeln','Bauen beginnen','Umsehen','Ausruhen']}}
  }
  if(/samm(le|eln)?.*(holz|stein|stoff|nagel)|holz fäll|material/.test(t)){
    const kind=/stein/.test(t)?'stone':/stoff|tuch|cloth/.test(t)?'cloth':/nagel/.test(t)?'nails':'wood';
    const amt=rnd(2,5);Sim.gatherMat(S,kind,amt);if(kind==='wood'&&Math.random()<.4)Sim.gatherMat(S,'nails',1);
    advanceTime(rnd(2,4));const m=S.home.materials;
    return {ok:true,text:`Du sammelst ${amt}× ${kind}. Vorrat: Holz ${m.wood}, Stein ${m.stone}, Stoff ${m.cloth}, Nägel ${m.nails}.`,changes:{xp:8,choices:['Weiter sammeln','Bauen beginnen','Nach Hause','Ausruhen']}}
  }
  if(/bau(en|e)? (haus|zimmer|weiter|stufe)|baubeginn|ausbau|bauen beginnen/.test(t)||t.trim()==='bauen'){
    if(S.home?.building){advanceTime(8);const pb=Sim.progressBuild(S,1);return {ok:true,text:pb?.done?`Bau fertig: ${pb.name} (Stufe ${pb.stage}).`:`Noch ${S.home.building?.daysLeft} Tag(e).`,changes:{xp:15,choices:travelChoices()}}}
    const r=Sim.startBuild(S);if(!r.ok)return {ok:false,text:r.reason||'Kein Bau.'};advanceTime(4);return {ok:true,text:r.text,changes:{xp:20,choices:['Weiterbauen (Tag verstreichen)','Material sammeln','Schlafen','Umsehen']}}
  }
  if(/weiterbau|tag verstreichen|bau voran/.test(t)){
    if(!S.home?.building){const r=Sim.startBuild(S);if(!r.ok)return {ok:false,text:r.reason||'Nichts im Bau.'}}
    advanceTime(24);const pb=Sim.progressBuild(S,1);
    return {ok:true,text:pb?.done?`Fertig: ${pb.name} (Stufe ${pb.stage}).`:`Noch ${S.home.building?.daysLeft||0} Tag(e).`,changes:{xp:12,choices:['Weiterbauen (Tag verstreichen)','Schlafen','Material sammeln','Umsehen']}}
  }
  if(/arbeit(en)? als|tagelöhn|verdien|lohn|handwerk|söldnerarbeit/.test(t)){
    const job=/söld/.test(t)?'Söldner':/handwerk|schmied/.test(t)?'Handwerk':'Tagelöhner';
    if(!Sim.shopOpen(S,['markt'])&&job==='Tagelöhner')return {ok:true,text:`Arbeitsplätze zu (Stunde ${S.cal?.hour??'?'}). 8–18 Uhr.`,changes:{choices:['Schlafen','Umsehen','Nach Hause']}};
    const r=Sim.workJob(S,job);Econ.ensureEcon(S);Econ.deposit(S,r.pay,'wallet');advanceTime(r.hours);
    return {ok:true,text:r.text+` Hunger ${S.needs?.hunger|0}.`,changes:{xp:10,choices:travelChoices()}}
  }
  if(/schlaf|ruhe|nacht verbring|ins bett|übernacht/.test(t)&&!/schlaf(en)? mit/.test(t)){
    const r=Sim.sleepHome(S);advanceTime(r.hours);return {ok:true,text:r.text,changes:{hp:15,mp:10,choices:travelChoices()}}
  }
  if(/einzieh|mitbewohner|zieh .* ein/.test(t)){
    const who=findNpcTarget(a)||(S.world.scene.anwesend||[])[0];if(!who)return {ok:false,text:'Wen einladen?'};
    const r=Sim.inviteHousemate(S,who);advanceTime(1);return {ok:r.ok,text:r.text,changes:{xp:r.ok?20:0,choices:travelChoices()}}
  }
  if(/nach hause|zuhause|mein haus|heimgehen/.test(t)){
    if(!S.home?.owned)return {ok:false,text:'Noch kein Zuhause.'};
    const tr=travelTo(S.home.location,{force:true,hours:rnd(1,3)});
    return {ok:true,text:(tr.text||'')+`\n\nZuhause Stufe ${S.home.stage}.`,changes:tr.changes||{choices:travelChoices()}}
  }
  if(/chronik|journal|was ist passiert|weltgeschichte/.test(t)){
    const lines=(S.ledger||[]).slice(-8).map(e=>`Tag ${e.t.day} ${e.t.hour}h · ${e.who}: ${e.what}`);
    return {ok:true,text:'Chronik:\n'+(lines.join('\n')||'leer'),changes:{choices:travelChoices()}}
  }
  return null}
function findAnyNpc(a){const t=a.toLowerCase();return Object.keys(S.world?.npcs||{}).find(n=>n.toLowerCase().split(/[\s\/]+/).some(p=>p.length>2&&t.includes(p.toLowerCase())))}

function offline(a){const q=askNPC(a);if(q)return q;
 const life=parseLifeSim(a);if(life)return {text:life.text,changes:life.changes||{choices:travelChoices()}};
 const beast=parseCreatureEncounter(a);if(beast){const e=discoverThing('creature',beast,{desc:'Begegnung mit '+beast+'.',danger:2,behavior:'aggressiv oder scheu',habitat:S.world?.scene?.ort,inline:true});applyActionDuration('begegne '+beast,15);return {text:'Du begegnest '+beast+'. '+(e?Codex.inlineCard(e):''),changes:{xp:8,choices:travelChoices()}}}
 // crime first
 const crime=parseCrime(a);if(crime){const r=crime.type==='kill'?killNPC(crime.who,a):robNPC(crime.who);if(r.ok){if(crime.type==='kill')addMemory(crime.who,'(tot)','Tod');return {text:r.text,changes:r.changes}}}
 // travel
 const dest=parseTravel(a);if(dest){const tr=travelTo(dest);if(tr.ok)return {text:tr.text,changes:tr.changes||{choices:travelChoices(tr.to),xp:5}}}
 // romance beats (consensual adults only)
 const rom=parseRomance(a);if(rom)return rom;
 if(isG()){const t=a.toLowerCase();const hit=/tür|öffn|klink/.test(t);
  const txt=R(['Irgendwo schlägt eine Glocke, tief und unsauber. Du spürst sie im Brustbein.','Der Nebel antwortet nicht. Nur eine Uhr tickt, deren Zeiger stillstehen.','Aus einem Ablaufgitter: drei Schläge, Pause, zwei weitere.','Du zählst, ohne es zu wollen. Die Zahl stimmt nicht.']);
  return {text:`„${a}“ – ${txt}`,changes:{hp:hit?-8:-2,ruf:0,choices:defChoices()}}}
 // genre systems (zombie etc.)
 if(S.genre==='zombie'||S.world?.systems?.hunger!=null){const sys=ensureSystems();const t=a.toLowerCase();
  if(/ess|trink|wasser|hunger|durst|ration/.test(t)){sys.hunger=Math.max(0,(sys.hunger|0)-rnd(20,40));sys.thirst=Math.max(0,(sys.thirst|0)-rnd(15,35));return {text:'Du nimmst eine knappe Ration. Der Magen beruhigt sich – fürs Erste.',changes:{hp:rnd(5,15),choices:defChoices()}}}
  if(/safehouse|versteck|barrikade|sichern/.test(t)){sys.safehouse=S.world.scene.ort;return {text:`Du sicherst ${S.world.scene.ort} so gut es geht. Ein Safehouse – vorerst.`,changes:{xp:15,choices:defChoices()}}}
  if(/horde|zombie|infiziert|beißer/.test(t)){const win=Math.random()<0.4+(S.st.str||0)/100;sys.ammo=Math.max(0,(sys.ammo|0)-rnd(1,4));return {text:win?'Die Horde brandet auf – und reißt an dir vorbei. Du bleibst stehen.':'Zähne. Hände. Du entkommst knapp, kratzt und keuchst.',changes:{hp:win?-rnd(5,15):-rnd(20,40),xp:win?30:10,choices:defChoices()}}}
 }
 const t=a.toLowerCase(),s=S.st;const npcs=Object.keys(S.world?.npcs||{}).filter(n=>S.world.npcs[n].alive!==false);
 const who=npcs.find(n=>n.toLowerCase().split(/[ _]/).some(p=>p.length>2&&t.includes(p.toLowerCase())));
 let txt,ch={};
 if(/kämpf|kampf|angriff|greif|jag|monster|schlag|armee|befehl/.test(t)&&!/töt|mord|umbring/.test(t)){
  const foes=pickEncounter(S,{noBoss:true,count: /armee|gruppe|trupp/.test(t)?2:1});
  S.flags._offerEncounter={foes, blurb:`Feindseligkeit. ${foes.map(f=>f.name).join(", ")} — du entscheidest.`, forceAttack:/angriff|greif|schlag/.test(t)};
  txt=`Du spürst den Konflikt mit ${foes.map(f=>f.name).join(", ")}. Kämpfen, reden, drohen, schleichen oder fliehen — deine Wahl.`;
  ch={xp:5, choices:["Kämpfen","Reden / Überzeugen","Einschüchtern","Schleichen","Fliehen"]}}
 else if(/red|sprech|sag|frag|flirt|hilf|helf|plan|lieb|tee|party|erzähl|gestalt ansprechen|mit .+ sprechen/.test(t)||who){const n=who||R((S.world.scene.anwesend||[]).filter(x=>S.world.npcs[x]?.alive!==false).concat(npcs));
  const npc=S.world.npcs[n];const good=Math.random()<0.5+s.cha/50;
  let label=n; try{label=Know.displayName(S,n,npc)}catch(_){}
  const wx=S.flags?.weather||Imm.weatherFor(S);
  txt=Imm.richOfflineProse(S,a,{who:n,label,good,weather:wx,phase:phaseLabel()});
  ch={affinity:{[n]:good?rnd(8,18):-rnd(2,8)},trust:{[n]:good?rnd(4,10):-1},xp:15,cha:good&&Math.random()<.3?1:0};
  addMemory(n, good?`Gespräch (positiv) über: ${a.slice(0,40)}`:`Gespräch (angespannt) über: ${a.slice(0,40)}`,'Gespräch')}
 else if(/train|üb|lern|magie|zauber|stud/.test(t)){const cost=Math.min(s.mp,rnd(5,15));txt=`Du trainierst. ${R(['Schweiß und Fortschritt.','Ein neues Gefühl.','Mühsam, aber lohnend.'])}`;
  ch={mp:-cost,xp:rnd(20,40),str:Math.random()<.5?1:0};if(Math.random()<.25)ch.newSkills=[{name:R(['Doppelschlag','Schildwall','Giftige Zunge','Schattenportal','Fallenbau','Kräuterkunde','Erste Hilfe']),icon:'✨',desc:'Neu erlernt',level:1,cost:5,cd:0}]}
 else if(/schlaf|übernacht/.test(t)){txt='Du schläfst bis zum Morgen.';ch={hp:rnd(20,40),mp:rnd(10,25)};Cont.sleepUntilMorning(S)}
 else if(/ruh|rast|ess|heil/.test(t)){txt='Du ruhst dich aus. Wärme kehrt zurück.';ch={hp:rnd(20,40),mp:rnd(10,25)};applyActionDuration(t.includes('ess')?'essen':'kurz ruhen',null)}
 else if(/intrig|lüg|schmied|spion|sabot/.test(t)){const ok=Math.random()<.55;txt=ok?'Dein Plan geht auf.':'Du wirst beinahe erwischt!';ch={xp:25,ruf:ok?rnd(-3,6):-10}}
 else if(/quest|auftrag|mission|hauptgeschichte|nebenquest|hook/.test(t)){const m=S.quests?.main;txt=m?`Du denkst an eine Möglichkeit – keinen Zwang: ${m.ziel}. (Optional.) Offene Haken: ${(m.objectives||[]).filter(o=>!(m.done||[]).includes(o)).join(', ')||'keine'}.`:'Kein Quest zwingt dich. Die Welt liegt offen.';ch={xp:5,choices:defChoices()}}
 else if(/umseh|erkund|schau|untersuch|wohn/.test(t)){const ex=exitsFrom(S.world.scene.ort);txt=`Du siehst dich in ${S.world.scene.ort} um. ${locNode(S.world.scene.ort)?.desc||''}${ex.length?' Wege führen nach: '+ex.slice(0,3).join(', ')+'.':''}`;ch={xp:8,choices:travelChoices()}}
 else{const ev=R([['Du findest etwas Verstecktes!',{items:[{name:R(['Goldmünzen','Alte Karte','Zauberring','Konserven']),icon:'📦',desc:'Gefunden',type:'misc'}],xp:20}],['Ein Händler hilft.',{xp:10,ruf:2}],['Eine Falle!',{hp:-rnd(8,18),xp:10}],['Ein Fremder flüstert deinen Namen.',{xp:15,ruf:3}],['Ruhige Gegend. Die Welt atmet weiter – ohne dich zu zerren.',{xp:20}]]);
  txt=`Du versuchst: „${a}“. ${ev[0]}`;ch=ev[1]}
 ch.choices=ch.choices||travelChoices();
 // NO auto quest progress — freedom
 if(S.genre==='zombie'||S.world?.systems){const sys=ensureSystems();sys.hunger=Math.min(100,(sys.hunger|0)+rnd(3,8));sys.thirst=Math.min(100,(sys.thirst|0)+rnd(3,8));if(sys.hunger>80){ch.hp=(ch.hp|0)-rnd(2,6);txt+='\n\n(Hunger nagt.)'} if(sys.thirst>80){ch.hp=(ch.hp|0)-rnd(2,6);txt+='\n\n(Durst brennt.)'}}
 return {text:txt,changes:ch}}

/* ---------- AI ---------- */
if(!cfg.v2||(cfg.mode==='gemini'&&!hasKey())){cfg.mode=hasKey()?'gemini':'free';cfg.v2=1;try{localStorage.setItem(CFG,JSON.stringify(cfg))}catch(_){}}
function parseCreatureEncounter(a){
  const m=String(a||'').match(/(?:kämpfe? gegen|begegne|sehe|jage|töte|erte|angreife?)\s+(?:einen?|die|das)?\s*([A-ZÄÖÜ][\wÄÖÜäöüß\-]{2,30})/i)
    ||String(a||'').match(/\b(Wolf|Schattenwolf|Drache|Goblin|Ork|Skelett|Spinne|Bär|Greif|Dämon|Schleim|Banditen?)\b/i);
  if(!m)return null; return m[1];
}
const FREE_URL='https://text.pollinations.ai/openai';
const STREAM_DELIM='###DATA###';
function romanceHint(){const lines=[];for(const[n,r]of Object.entries(S.romance||{})){if((r.affection|0)>5||(r.stage|0)>0)lines.push(n+':'+stageName(r.stage)+'(♡'+r.affection+'/T'+r.trust+')')}
 return lines.length?'BEZIEHUNGEN: '+lines.slice(0,6).join('; ')+'. Stufen: Fremd→Bekannt→Freund→Vertraut→Verliebt→Partner. Keine expliziten Inhalte (13+). Eifersucht möglich.':'BEZIEHUNGEN: noch dünn – organisch wachsen lassen.'}
function questHint(){const m=S.quests?.main;if(!m)return 'QUESTS: keine – Spieler ist völlig frei.';const left=(m.objectives||[]).filter(o=>!(m.done||[]).includes(o));
 return `QUESTS (nur optionale Haken, NIEMALS Leine): Akt „${m.actTitel}“ – ${m.ziel}. Offen: ${left.join('; ')||'–'}. Neben: ${(S.quests.side||[]).filter(q=>q.status!=='erledigt'&&q.status!=='gescheitert').slice(0,3).map(q=>q.titel).join('; ')}. Verbote: Spieler nicht zurück zum Start zerren, nicht „du solltest zurück zur Halle/Palast“, Szene nicht zurücksetzen gegen Spielerwillen.` }
function greyPrompt(stream){const B=GREY||PACKS.grey||{kern:{}};const k=B.kern||{};return `Du bist der Erzähler eines interaktiven literarischen Horror-Romans auf Deutsch: „${B.titel||'Greymourne'}“.
SPIELFIGUR: ${S.pc.name}${S.kind==='darren'?' (Romanfigur)':' (eigene Figur; Darren kann als NPC existieren)'}. Hintergrund: ${S.pc.bg}
TON: ${k.ton||B.ton||'Leiser Horror.'}
STIL: ${k.stil||'Deutsche literarische Prosa, 2. Person.'}
REGELN: ${((k.regeln_der_stadt||[]).slice(0,8)).map((x,i)=>(i+1)+') '+x).join(' ')}
SPOILERSCHUTZ: ${k.spoilerschutz||''}
${romanceHint()}
${questHint()}
ERZÄHLREGELN: 1) Erster Satz reagiert direkt. Fragen werden beantwortet. 2) 2. Person, nie Erzähler-Ich. 3) Kein Splatter/Anime-Fenster. 4) NPCs eigenständig (können ablehnen). 5) 4-9 Sätze. 6) Romanzen: zurückhaltend, melancholisch, passend zur Stadt.
${stream?`AUSGABE: Erzähltext, dann Zeile „${STREAM_DELIM}“, dann JSON: choices[4], changes{verstand,schuld,affinity,trust,xp,items,removeItems}, summary, world{scene,npcUpdates,newLocations,ereignisse,scenePrompt?,speaker?}, speaker, scenePrompt (engl. Bildprompt zur Szene), quests{mainObjectiveDone?,advanceAct?,sideComplete?}, durationMin. optional ending.`:`JSON mit narration, choices, changes, summary, durationMin, world, speaker, scenePrompt, quests.`}`}
function voiceHint(){const pack=PACKS[S.role];if(!pack?.npcs)return '';
 return 'STIMMEN: '+Object.entries(pack.npcs).slice(0,6).map(([k,v])=>k+': '+(v.stimme||v.art||'').slice(0,60)).join(' | ')}
function sysPrompt(stream=true){if(isG())return greyPrompt(stream);const r=ROLES[S.role]||ROLES.held;const pack=PACKS[S.role]||{};
 const genre=S.genre||pack.genre||'';
 return `Du bist Erzähler eines interaktiven Anime-/Genre-Spiels auf Deutsch. SPIELER = Hauptfigur mit voller Freiheit.
Protagonist: ${S.pc?.name||r.name}. Welt: ${pack.titel||r.world}. Genre: ${genre||'isekai'}. Ton: ${pack.ton||''}
${voiceHint()}
${romanceHint()}
${questHint()}
${memoryHint()}
${heatHint()}
FREIHEIT (HARTE REGELN):
1. Folge IMMER der Spielerabsicht. Ortwechsel ausführen, wenn der Spieler geht/reist – scene.ort aktualisieren.
2. VERBOTEN: Spieler zurück zum Startort/Halle/Palast zu zerren; Szene gegen den Willen zurückzusetzen; NPCs die „wir müssen zurück“ erzwingen; Quests als Leine.
3. Quests = optionale Hooks/Gerüchte. Die Welt reagiert, zwingt aber nicht.
4. NPCs haben Gedächtnis (siehe NPC-GEDÄCHTNIS): Bezug auf Vergangenes nehmen. Sie leben weiter (Routinen, Ziele, Beziehungen untereinander).
5. Romanzen: nur einvernehmlich, nur Erwachsene. NPCs dürfen NEIN sagen (Affection/Trust/Persönlichkeit). Kuss/Date/Beziehung/Nacht möglich; sexuelle Szenen IMMER Fade-to-Black, danach Erinnerung. Nie non-konsensual.
6. Gewalt/Crime: Töten und Raub möglich (dark-fantasy anime, nicht grafisch). Tote NPCs bleiben tot. Zeugen → Heat, Trauer, Rache, Ermittlung, Kopfgeld.
7. Erster Satz reagiert DIREKT. 4-9 Sätze, 2. Person. Anime-Mittel sparsam.
${stream?`AUSGABE: Erzähltext, dann „${STREAM_DELIM}“, dann JSON: choices[4] (ortsbezogen, keine Start-Halle-Zwänge), changes{hp,mp,str,cha,ruf,xp,gold,affinity,trust,items,newSkills,removeItems,killed?,robbed?}, summary, world{scene,npcUpdates,newLocations,ereignisse,scenePrompt?,speaker?}, speaker, scenePrompt, quests{...optional}, durationMin (Minuten dieser Handlung, Gespräch 5-15). optional ending.`:`JSON: narration, choices, changes, summary, durationMin, world, speaker, scenePrompt, quests.`}`}
function greyDetails(a){const B=GREY||PACKS.grey;if(!B)return '';const txt=(a+' '+JSON.stringify(S.world.scene)+' '+(S.hist||[]).slice(-4).map(h=>h.content).join(' ')).toLowerCase();
 const pick=(obj,force)=>Object.entries(obj||{}).filter(([k])=>(force||[]).includes(k)||k.toLowerCase().split(/[ \/–-]+/).some(w=>w.length>3&&txt.includes(w)));
 const npcs=pick(B.npcs,S.kind==='darren'?['Der Schaffner']:['Der Schaffner','Darren Crowe']).slice(0,5).map(([k,v])=>{const o={rolle:v.rolle,art:v.art,stimme:v.stimme,ziel:v.ziel};if(S.turn>=40&&v.geheim)o.geheim=v.geheim;return k+': '+JSON.stringify(o)});
 const orte=pick(B.orte,[]).slice(0,4).map(([k,v])=>k+': '+v);
 return 'BIBEL (Szene):\n'+npcs.join('\n')+'\n'+orte.join('\n')}
function leanLore(a){if(isG())return greyDetails(a);const pack=PACKS[S.role];if(!pack)return '';
 const txt=(a+' '+(S.world?.scene?.ort||'')+' '+(S.summary||'')).toLowerCase();
 const bits=[];
 if(/magie|mana|zauber|skill|status/.test(txt)&&pack.magie)bits.push('Magie: '+pack.magie.slice(0,180));
 if(/könig|adel|politik|steuer|hof|kirche/.test(txt)&&pack.politik)bits.push('Politik: '+pack.politik.slice(0,180));
 if(/essen|schlaf|alltag|arbeit|markt/.test(txt)&&pack.alltag)bits.push('Alltag: '+pack.alltag.slice(0,140));
 return bits.length?'LORE: '+bits.join(' | '):''}
function stateSum(){const s=S.st;const inv=invNames().slice(0,12).join(', ');const sk=skillNames().slice(0,8).join(', ');
 if(isG())return `STATUS: Verstand ${s.hp}/100, Schuld ${s.ruf}/100 | Inventar: ${inv} | ${romanceHint()} | Zug ${S.turn}`;
 return `STATUS: Lv${s.lvl} HP${s.hp}/${s.maxhp} MP${s.mp} Str${s.str} Cha${s.cha} Ruf${s.ruf} | Skills: ${sk} | Inventar: ${inv} | ${romanceHint()} | Leben #${S.lives}`}
function msgs(a){ // Pollinations / WebLLM / API — same continuity block, compact
 Cont.ensureCont(S);
 let h=(S.hist||[]).slice(-8);
 if(!h.length){const last=(S.log||[]).filter(m=>m.k==='n').slice(-1)[0];if(last)h=[{role:'assistant',content:last.t}]}
 // hist in messages is short; full verbatim lives in turnMsg scene-last block
 return [{role:'system',content:sysPrompt(false)},...h.map(m=>({role:m.role,content:String(m.content||'').slice(0,500)})),{role:'user',content:turnMsg(a)}]}
function turnMsg(a){
  Cont.ensureCont(S);
  return Cont.buildTurnUserMessage(S,a,{
    worldLean:worldText(),
    memory:String(memoryHint()||'').slice(0,400),
    heat:heatHint(),
    state:stateSum(),
    quest:String(questHint()||'').slice(0,200),
    leanLore:leanLore(a),
    isGrey:isG()
  });
}
function storyRollup(){return Cont.compactContinuity(S,'');}
function lastPromptDump(a){const built=turnMsg(a||S.cont?.lastPlayer||'…');return Cont.dumpPromptForTest(S,a||'',built)}
function guardNoRegression(u){if(!u?.scene?.ort||!S?.world?.scene?.ort)return u;
  const prev=S.world.scene.ort; const next=u.scene.ort;
  if(S.turn>3 && next!==prev){
    const startish=/halle|thron|einführung|tutorial|start|akademie-tor/i.test(next)&&!/halle|thron|tor/i.test(prev);
    if(startish && !(S.flags&&S.flags.allowReturn)){u={...u,scene:{...u.scene,ort:prev,zeit:u.scene.zeit||phaseLabel()}};
      try{Sim.ledgerPush(S,{type:'guard',who:'System',what:`Erzähler-Ortrücksprung nach ${next} verhindert.`,where:prev,importance:20,emotion:'neutral'})}catch(_){}}
  }
  return u}

function parse(raw){let m=raw.match(/```(?:json)?\s*([\s\S]*?)```/)||raw.match(/(\{[\s\S]*\})\s*$/);let ch=null;
 if(m){try{ch=JSON.parse(m[1].trim())}catch(e){try{ch=JSON.parse(m[1].replace(/,\s*}/g,'}').replace(/'/g,'"'))}catch(_){}}}
 const text=(m?raw.replace(m[0],''):raw).replace(/```[\s\S]*$/,'').replace(/^\s*\d[.)]\s.*$/gm,'').replace(/\n*(Wie|Was) (willst|wirst|tust) du[^\n]*\?\s*$/,'').trim();return {text:text||'…',changes:ch||{xp:10}}}
function parseStream(raw){const i=raw.indexOf(STREAM_DELIM);if(i<0){const j=raw.lastIndexOf('{');if(j>0){const nar=raw.slice(0,j).trim();const o=gJSON(raw.slice(j));if(o)return packStream(nar||o.narration||o.text||'…',o)}return parse(raw)}
 const nar=raw.slice(0,i).trim();const o=gJSON(raw.slice(i+STREAM_DELIM.length).trim())||{};return packStream(nar||o.narration||'…',o)}
function packStream(text,o){const ch=Object.assign({},o.changes||{});if(o.choices)ch.choices=o.choices;if(o.summary)ch.summary=o.summary;if(o.world)ch.world=o.world;if(o.ending)ch.ending=o.ending;if(o.quests)ch.quests=o.quests;
 if(o.speaker)ch.speaker=o.speaker;if(o.scenePrompt)ch.scenePrompt=o.scenePrompt;if(o.imagePrompt)ch.scenePrompt=o.imagePrompt;
 if(o.durationMin!=null)ch.durationMin=o.durationMin; if(o.duration!=null&&ch.durationMin==null)ch.durationMin=o.duration;
 for(const k of ['verstand','schuld','hp','mp','str','cha','ruf','xp','gold','affinity','trust','items','newSkills','removeItems']){if(k in o&&!(k in ch))ch[k]=o[k]}
 return {text:String(text||'…'),changes:ch}}

const G_FALLBACK=['gemini-2.5-flash','gemini-flash-latest','gemini-2.5-flash-lite','gemini-2.0-flash'];
const GM_KEY='isekai_gmodels';
const G_SAFE=['HARM_CATEGORY_HARASSMENT','HARM_CATEGORY_HATE_SPEECH','HARM_CATEGORY_SEXUALLY_EXPLICIT','HARM_CATEGORY_DANGEROUS_CONTENT'].map(category=>({category,threshold:'BLOCK_ONLY_HIGH'}));
const G_TIMEOUT=25000;
function gmStore(){try{return JSON.parse(localStorage.getItem(GM_KEY))||{}}catch(_){return {}}}
function gmSave(o){localStorage.setItem(GM_KEY,JSON.stringify(o))}
function gmScore(id){const n=id.toLowerCase();const v=(n.match(/gemini-(\d+(?:\.\d+)?)/)||[])[1];let s=(v?+v:0)*100;
 if(/flash-lite/.test(n))s+=15;else if(/flash/.test(n))s+=45;else if(/pro/.test(n))s-=30;
 if(/-latest$/.test(n))s+=350;if(/preview|exp/.test(n))s-=60;if(/gemma/.test(n))s-=400;return s}
function gmRank(list){const bad=/embed|image|imagen|tts|audio|live|vision|aqa|veo|lyria|robotics|computer-use|learnlm|native|thinking-exp|nano|banana|deep-research/i;
 const ids=list.filter(m=>(m.supportedGenerationMethods||[]).includes('generateContent')).map(m=>String(m.name||'').replace(/^models\//,'')).filter(id=>/^gemini/i.test(id)&&!bad.test(id));
 return [...new Set(ids)].sort((a,b)=>gmScore(b)-gmScore(a))}
async function gmFetch(key,force){const st=gmStore();if(!force&&st.key===key.slice(-6)&&st.list&&Date.now()-st.t<864e5)return st;
 let all=[],tok='';try{for(let i=0;i<10;i++){const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000'+(tok?'&pageToken='+encodeURIComponent(tok):'')+'&key='+encodeURIComponent(key));if(!r.ok)break;const j=await r.json();all=all.concat(j.models||[]);tok=j.nextPageToken;if(!tok)break}}catch(_){}
 const list=all.length?gmRank(all):null;const o={key:key.slice(-6),t:Date.now(),list:list||st.list||G_FALLBACK,fail:force?{}:(st.fail||{}),noThink:force?{}:(st.noThink||{}),chosen:st.chosen,manual:st.manual,lat:st.lat||{}};gmSave(o);gmUI();return o}
function gmOrder(st){const fail=st.fail||{},now=Date.now();const cool=m=>!(fail[m]&&now-fail[m].t<(fail[m].c===429?(fail[m].rd||600)*1000:864e5));
 let L=(st.list||G_FALLBACK).slice();
 if(st.manual){const primary=st.manual;const rest=L.filter(x=>x!==primary&&cool(x));return cool(primary)?[primary,...rest.slice(0,1)]:[...rest.slice(0,2)]}
 if(st.chosen&&cool(st.chosen)){const rest=L.filter(x=>x!==st.chosen&&cool(x));return [st.chosen,...rest.slice(0,1)]}
 const ok=L.filter(cool);return (ok.length?ok:L).slice(0,2)}
function gmUI(){const sel=$('#gmodel');if(!sel)return;const st=gmStore();const L=st.list||G_FALLBACK;
 sel.innerHTML='<option value="">Automatisch</option>'+L.map(m=>`<option value="${m}">${m}${st.chosen===m?' ✓':''}</option>`).join('');
 sel.value=st.manual||'';const gs=$('#gmstatus');if(gs)gs.textContent=st.chosen?'Aktiv: '+st.chosen:'Bereit'}
function thinkingCfg(model){const st=gmStore();if(st.noThink&&st.noThink[model])return null;const n=model.toLowerCase();
 if(/gemini-([34](\.|$)|3\.\d)/.test(n)||/^gemini-3/.test(n)||/gemini-4/.test(n)){if(/flash-lite|3\.6|gemini-3-flash(?!-)|3\.5|3\.1-flash-lite|robotics/.test(n))return {thinkingLevel:'minimal'};return {thinkingLevel:'low'}}
 if(/2\.5/.test(n))return {thinkingBudget:0};return null}
function gParse(j){const c=j.candidates?.[0];const t=(c?.content?.parts||[]).filter(p=>!p.thought).map(p=>p.text||'').join('');return {t,fr:c?.finishReason||j.promptFeedback?.blockReason||(c?'':'LEER')}}
function gJSON(t){if(!t)return null;t=String(t).replace(/^```(?:json)?\s*/i,'').replace(/```\s*$/,'').trim();try{return JSON.parse(t)}catch(_){}const i=t.indexOf('{'),k=t.lastIndexOf('}');if(i>=0&&k>i)try{return JSON.parse(t.slice(i,k+1))}catch(_){}return null}
function gBody(a){Cont.ensureCont(S);const contents=[];
 for(const m of (S.hist||[]).slice(-12)){
  const role=m.role==='assistant'?'model':'user';
  const text=String(m.content||'').slice(0,500);
  const last=contents[contents.length-1];
  if(last&&last.role===role)last.parts[0].text+='\n'+text;else contents.push({role,parts:[{text}]});
 }
 if(contents[0]&&contents[0].role==='model')contents.unshift({role:'user',parts:[{text:'(Spielbeginn)'}]});
 contents.push({role:'user',parts:[{text:turnMsg(a)}]});
 // stream-friendly: slightly lower max to first finish JSON faster after prose
 return {systemInstruction:{parts:[{text:sysPrompt(true)}]},contents,generationConfig:{temperature:.85,maxOutputTokens:700},safetySettings:G_SAFE}}
function friendlyAIFail(){return 'Die Erzählerin stockt kurz. Versuch es noch einmal – oder spiele ohne sie weiter.'}
function setNarratorMode(mode){ // gemini | free | offline
  S._narratorMode=mode||'gemini';
  let el=$('#narratorBadge');
  if(!el){el=document.createElement('div');el.id='narratorBadge';el.className='narrator-badge hidden';document.body.appendChild(el)}
  // free is the intended no-key narrator — label softly; offline only if true fallback
  if(mode==='free'){el.textContent='Erzählerin: Pollinations';el.classList.remove('hidden','is-offline');el.classList.add('is-free')}
  else if(mode==='offline'){el.textContent='Offline-Erzähler';el.classList.remove('hidden','is-free');el.classList.add('is-offline')}
  else {el.classList.add('hidden'); el.classList.remove('is-free','is-offline')}
}
function scheduleAfterReply(tasks){
  const run=()=>{try{for(const fn of tasks){try{fn()}catch(e){console.warn('afterReply',e)}}}catch(_){}};
  if(typeof requestIdleCallback==='function')requestIdleCallback(run,{timeout:1200});
  else setTimeout(run,0);
}
function gErr(t){const e=new Error(t);e.gem=1;return e}
async function fetchWithTimeout(url,opts,ms){const ac=new AbortController();const to=setTimeout(()=>ac.abort(),ms);try{return await fetch(url,{...opts,signal:ac.signal})}finally{clearTimeout(to)}}
async function readSSE(res,onText){const reader=res.body.getReader();const dec=new TextDecoder();let buf='',raw='';
 while(true){const {done,value}=await reader.read();if(done)break;buf+=dec.decode(value,{stream:true});
  let idx;while((idx=buf.indexOf('\n'))>=0){let line=buf.slice(0,idx);buf=buf.slice(idx+1);if(line.endsWith('\r'))line=line.slice(0,-1);
   if(!line.startsWith('data:'))continue;const data=line.slice(5).trim();if(!data||data==='[DONE]')continue;
   try{const j=JSON.parse(data);const {t}=gParse(j);if(t){raw+=t;if(onText)onText(raw)}}catch(_){}}}
 if(buf.startsWith('data:')){try{const j=JSON.parse(buf.slice(5).trim());const {t}=gParse(j);if(t){raw+=t;if(onText)onText(raw)}}catch(_){}}
 return raw}
function showNarration(el,raw){let vis=raw;const i=raw.indexOf(STREAM_DELIM);if(i>=0)vis=raw.slice(0,i);else{const partial=STREAM_DELIM;for(let n=Math.min(partial.length-1,raw.length);n>=3;n--){if(raw.endsWith(partial.slice(0,n))){vis=raw.slice(0,-n);break}}}
 const tx=vis.replace(/\n+$/,'');if(el)el.textContent=tx;const vn=$('#vnText');if(vn)vn.textContent=tx}

async function gmProbe(key){const st=await gmFetch(key);const cands=(st.list||G_FALLBACK).slice(0,6);const results=[];
 for(const m of cands){const t0=performance.now();
  try{const body={contents:[{role:'user',parts:[{text:'Sag nur: ok'}]}],generationConfig:{maxOutputTokens:8,temperature:0}};
   const tc=thinkingCfg(m);if(tc)body.generationConfig.thinkingConfig=tc;
   let res=await fetchWithTimeout(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify(body)},12000);
   let ms=Math.round(performance.now()-t0);let errObj=null;try{if(!res.ok)errObj=await res.json()}catch(_){}
   let msg=errObj?.error?.message||'';
   if(!res.ok&&res.status===400&&/thinking|Thinking/i.test(msg)){const s2=gmStore();s2.noThink=s2.noThink||{};s2.noThink[m]=1;gmSave(s2);
    const body2={contents:[{role:'user',parts:[{text:'Sag nur: ok'}]}],generationConfig:{maxOutputTokens:8,temperature:0}};
    res=await fetchWithTimeout(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify(body2)},12000);
    ms=Math.round(performance.now()-t0);errObj=null;try{if(!res.ok)errObj=await res.json()}catch(_){}msg=errObj?.error?.message||''}
   if(res.ok){results.push({m,ok:1,ms,c:200});continue}
   let rd=0;try{const d=(errObj?.error?.details||[]).find(x=>x['@type']?.includes('RetryInfo'));rd=parseInt(String(d?.retryDelay||'').replace(/s$/,''),10)||0}catch(_){}
   results.push({m,ok:0,ms,c:res.status,rd,msg:String(msg).slice(0,80)})}catch(e){results.push({m,ok:0,ms:Math.round(performance.now()-t0),c:0})}
 }
 const s2=gmStore();s2.lat=s2.lat||{};s2.fail=s2.fail||{};
 for(const r of results){if(r.ok){s2.lat[r.m]=r.ms;if(s2.fail[r.m])delete s2.fail[r.m]}else if(r.c){s2.fail[r.m]={c:r.c,t:Date.now(),rd:r.rd||(r.c===429?600:0)}}}
 const best=results.filter(r=>r.ok).sort((a,b)=>a.ms-b.ms)[0];
 if(best){s2.chosen=best.m;s2.lat[best.m]=best.ms}gmSave(s2);gmUI();return {best,results}}

async function gemini(a,el){const key=(cfg.gkey||'').trim();if(!key)throw gErr(friendlyAIFail());
 const st=await gmFetch(key);const tPrompt0=performance.now();const base=gBody(a);const order=gmOrder(st);let last,tried=0;
 S._promptChars=(JSON.stringify(base).length)|0; S._ttft=null; S._turnTotal=null;
 for(const m of order){if(tried>=2)break;tried++;
  el.classList.add('typing');el.textContent='…';
  let think=thinkingCfg(m),attempt=0;
  while(attempt++<2){const body=JSON.parse(JSON.stringify(base));
   if(think)body.generationConfig.thinkingConfig=think;else delete body.generationConfig.thinkingConfig;
   let res;try{res=await fetchWithTimeout(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(m)}:streamGenerateContent?alt=sse`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify(body)},G_TIMEOUT)}
   catch(e){last=gErr(friendlyAIFail());break}
   if(res.ok){let raw='';const tFetch=performance.now();
    try{raw=await readSSE(res,r=>{if(S._ttft==null&&r&&r.trim())S._ttft=Math.round(performance.now()-tPrompt0);showNarration(el,r)})}catch(_){last=gErr(friendlyAIFail());break}
    const packed=parseStream(raw);if(packed&&packed.text&&packed.text!=='…'){const s2=gmStore();s2.chosen=m;if(s2.fail)delete s2.fail[m];gmSave(s2);gmUI();
     S._turnTotal=Math.round(performance.now()-tPrompt0); setNarratorMode('gemini');
     return {...packed,model:m,ttft:S._ttft,totalMs:S._turnTotal,promptChars:S._promptChars}}
    last=gErr(friendlyAIFail());break}
   let msg='',errObj=null;try{errObj=await res.json();msg=errObj?.error?.message||''}catch(_){}
   if(res.status===400&&think&&/thinking|Thinking|budget|level/i.test(msg)){const s2=gmStore();s2.noThink=s2.noThink||{};s2.noThink[m]=1;gmSave(s2);think=null;continue}
   if((res.status===400&&/api.?key/i.test(msg))||res.status===401||(res.status===403&&!/model/i.test(msg))){throw gErr(friendlyAIFail())}
   let rd=0;try{const d=(errObj?.error?.details||[]).find(x=>x['@type']?.includes('RetryInfo'));rd=parseInt(String(d?.retryDelay||'').replace(/s$/,''),10)||0}catch(_){}
   const s2=gmStore();s2.fail=s2.fail||{};s2.fail[m]={c:res.status,t:Date.now(),rd:rd||(res.status===429?600:0)};if(s2.chosen===m)delete s2.chosen;gmSave(s2);
   last=gErr(friendlyAIFail());break}
 }gmUI();throw last||gErr(friendlyAIFail())}

async function loadWebLLM(){if(engine)return engine;if(!navigator.gpu)throw new Error('WebGPU nicht verfügbar');
 const w=await import('https://esm.run/@mlc-ai/web-llm');$('#wstatus').textContent='Lade Modell…';
 engine=await w.CreateMLCEngine(cfg.wmodel||'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',{initProgressCallback:p=>{$('#wstatus').textContent=p.text}});$('#wstatus').textContent='✅ Modell bereit';return engine}
async function streamTo(el,iter){let raw='';for await(const c of iter){raw+=c;el.textContent=raw.split('```')[0]}return raw}
async function aiTurn(a,el,mode=cfg.mode){if(mode==='webllm'){const e=await loadWebLLM();const it=await e.chat.completions.create({messages:msgs(a),stream:true,temperature:.8,max_tokens:400});
  return streamTo(el,(async function*(){for await(const c of it)yield c.choices[0]?.delta?.content||''})())}
 if(mode==='api'){const res=await fetch((cfg.aurl||'').replace(/\/$/,'')+'/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+cfg.akey},body:JSON.stringify({model:cfg.amodel,messages:msgs(a),temperature:.8,max_tokens:500})});
  if(!res.ok)throw new Error('API '+res.status);const j=await res.json();const t=j.choices[0].message.content;el.textContent=t.split('```')[0];return t}
 if(mode==='free'){let err;for(let i=0;i<2;i++){try{const ac=new AbortController(),to=setTimeout(()=>ac.abort(),25000);
   const res=await fetch(FREE_URL,{method:'POST',signal:ac.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'openai',messages:msgs(a),temperature:.9,reasoning_effort:'low',referrer:'https://markusstol.github.io/isekai-game/'})});clearTimeout(to);
   if(!res.ok){const e=new Error('Gratis-KI '+res.status);e.ra=+res.headers.get('Retry-After')||0;throw e}const j=await res.json();const mm=j.choices?.[0]?.message||{};let t=(mm.content||'').trim()||(mm.reasoning_content||'').trim();if(!t){const e=new Error('leere Antwort');e.ra=1;throw e}showNarration(el,t);return t}
  catch(e){err=e;if(i<1){el.textContent='…';await new Promise(r=>setTimeout(r,Math.min(3,e.ra||1)*1000))}}}throw err}
 throw new Error('offline')}

/* ---------- v16 encounter (choice-first, never forced) ---------- */
function allyWouldRefuseFight(name){
  try{
    const r=S.romance?.[name]; const npc=S.world?.npcs?.[name];
    if(!npc||npc.alive===false) return true;
    if(r && ((r.stage|0)>=3 || (r.affection|0)>=40) && !(S.flags?.forceHostile||[]).includes(name)) return true;
    return false;
  }catch(_){return false}
}
async function openPendingEncounter(res){
  if(Battle.isActive())return;
  const offer=S.flags?._offerEncounter;
  const combatFlag=res?.changes?._combat||res?.changes?.combat||S.flags?.narratorCombat;
  if(S.flags){ delete S.flags._offerEncounter; delete S.flags.narratorCombat }
  if(!offer && !combatFlag)return;
  let foes=(offer?.foes&&offer.foes.length)?offer.foes.slice():pickEncounter(S,{noBoss:true});
  foes=foes.filter(f=>{
    if(f._storyNpc && allyWouldRefuseFight(f._storyNpc)) return false;
    if(f.human && S.world?.npcs?.[f.name] && allyWouldRefuseFight(f.name)) return false;
    return true;
  });
  if(!foes.length){ pushSys('Ein Verbündeter weigert sich zu kämpfen.'); return }
  const result=await Battle.offerEncounter(S,{
    enemies:foes,
    blurb:offer?.blurb||(`Konflikt mit ${foes.map(f=>f.name).join(', ')}. Deine Entscheidung.`),
    bg:battleBgFor(S)
  });
  if(result) await afterEncounterResolved(result);
}
async function afterEncounterResolved(result){
  const sum=result.summary||{};
  const text=sum.text||'Die Begegnung endet.';
  add('n', text);
  try{Cont.noteExchange(S, S.cont?.lastPlayer||'(Begegnung)', text)}catch(_){}
  S.choices=travelChoices();
  hud(); renderChoices();
  typewrite(isG()?'Nebel':'Erzähler', text, ()=>{});
  try{save()}catch(_){}
}
function parseHostilityOffer(a){
  const t=String(a||'').toLowerCase();
  if(!/^(ich )?(greif|schlage|attackiere|kämpfe gegen|töt|ermorde)/.test(t) && !/angriff auf|ziehe (die |meine )?waffe|kämpfen gegen/.test(t)) return null;
  const beast=parseCreatureEncounter(a);
  let foes;
  if(beast){
    const id=['goblin','orc','wolf','slime','skeleton','bandit','walker','runner','drone','looter'].find(k=>beast.toLowerCase().includes(k));
    foes=id?[enemyById(id)]:pickEncounter(S,{noBoss:true,count:1});
    if(foes[0] && !id) foes[0].name=beast;
  } else {
    const who=(typeof findAnyNpc==='function'?findAnyNpc(a):null);
    if(who && allyWouldRefuseFight(who)){
      return {block:true, text:`${who} steht dir zu nah für einen Kampf. Rede, drohe oder geh.`};
    }
    if(who && S.world?.npcs?.[who]){
      const base=enemyById('bandit')||pickEncounter(S,{noBoss:true})[0];
      if(base){ base.name=who; base.human=true; base._storyNpc=who; foes=[base] }
    } else foes=pickEncounter(S,{noBoss:true});
  }
  return {foes, forceAttack:true, blurb:'Du willst angreifen — du kannst trotzdem noch reden, drohen oder fliehen.'};
}


function setBusy(on){busy=!!on;const txt=$('#txt'),btn=$('#inputRow button'),ch=$('#choices');if(txt)txt.disabled=on;if(btn)btn.disabled=on;if(ch)ch.querySelectorAll('button').forEach(b=>b.disabled=on);document.body.classList.toggle('busy',on)}
async function act(a){if(busy||!a.trim())return;
 // Freedom & systems: travel / crime / romance / life-sim offline-first
 if(_mode==='play'&&S?.setup?.done){const dest=parseTravel(a);const crime=parseCrime(a);const life=parseLifeSim(a);const isRom=/küss|kuss|date|nacht (mit|zusammen)|bleib(en)? (bei|über)|schlaf(en)? (mit|bei)|flirt|umarmen|geständnis|liebe gestehen|verabredung/.test(a.toLowerCase());
  if(crime||dest||isRom||life){busy=true;try{let res=null;if(crime){res=crime.type==='kill'?killNPC(crime.who,a):robNPC(crime.who);res={text:res.text,changes:res.changes}}
   else if(life){res={text:life.text,changes:life.changes||{choices:travelChoices()}}}
   else if(dest){const tr=travelTo(dest);res={text:tr.text,changes:tr.changes||{choices:travelChoices(tr.to),xp:5}}}
   else {res=parseRomance(a)}
   if(res){add('p',a);apply(res.changes||{});if(res.changes?.world)applyWorld(res.changes.world);add('n',res.text);
    S.hist=(S.hist||[]).concat([{role:'user',content:'SPIELER: '+a},{role:'assistant',content:res.text}]).slice(-24);
    Cont.noteExchange(S,a,res.text);S.turn++;
    // travel/crime already advanced time inside helpers — don't worldTick-hour-jump
    scheduleAfterReply([()=>{try{worldTick()}catch(_){}},()=>{try{save()}catch(_){}}]);
    S.choices=(res.changes&&res.changes.choices)||travelChoices();hud();renderChoices();busy=false;return}}catch(e){console.warn(e)}busy=false}}

 // Intro free-text
 if(_mode==='intro'){await actIntro(a);return}
 if(S&&S.setup&&!S.setup.done){
   // allow free text during setup as custom choice
   const pack=S._setupPack;const beat=S._setupBeat;if(beat){pickSetup({label:a.trim(),past:a.trim().slice(0,80)});return}
 }
 if(!S||!S.setup?.done)return;
 if(_mode==='play'&&S.setup?.done){
  const hos=parseHostilityOffer(a);
  if(hos){
   if(hos.block){add('p',a);add('n',hos.text);S.choices=['Reden','Gehen','Entschuldigen','Status prüfen'];hud();renderChoices();typewrite(isG()?'Nebel':'Erzähler',hos.text,()=>{});return}
   S.flags._offerEncounter={foes:hos.foes,blurb:hos.blurb,forceAttack:!!hos.forceAttack};
   add('p',a); add('n',hos.blurb||'Konflikt.');
   setBusy(true); try{await openPendingEncounter({changes:{}})}finally{setBusy(false)} return;
  }
  if(S.flags?._offerEncounter){
   const low=a.trim().toLowerCase();
   if(/kämpfen|reden|überzeugen|einschüchtern|bestechen|schleichen|fliehen|ergeben|kapitul/.test(low)){
    add('p',a); setBusy(true);
    try{
     const foes=S.flags._offerEncounter.foes; const blurb=S.flags._offerEncounter.blurb;
     const result=await Battle.offerEncounter(S,{enemies:foes,blurb:blurb||'Deine Entscheidung.',bg:battleBgFor(S)});
     if(result) await afterEncounterResolved(result);
    }finally{setBusy(false)} return;
   }
  }
 }
 setBusy(true);const t0=performance.now();try{await loadPack(S.role)}catch(_){}
 if(!hasKey()&&cfg.mode==='gemini'){cfg.mode='free';try{localStorage.setItem(CFG,JSON.stringify(cfg))}catch(_){}}
 try{Imm.uiTick()}catch(_){}
 // show player intent briefly
 const prevSp=$('#speaker').textContent;$('#speaker').textContent='Du';$('#speaker').classList.remove('hidden');$('#vnText').textContent='„'+a+'“';
 S.turn++;S.log.push({k:'p',t:a});
 $('#vnText').innerHTML='<span class="caret">Schreibe</span>';let res;let softFail=false;const el=$('#vnText');
 let modelSummary,scenePrompt,worldUpdate,questUpdate;
 try{if(cfg.mode==='offline')throw 0;
  if(cfg.mode==='gemini'||(cfg.mode!=='webllm'&&cfg.mode!=='api'&&cfg.mode!=='free'&&hasKey())){
   try{res=await gemini(a,el)}catch(e){softFail=true;el.textContent='…'}}
  if(!res&&(cfg.mode==='free'||softFail||(cfg.mode!=='gemini'&&cfg.mode!=='webllm'&&cfg.mode!=='api'&&cfg.mode!=='offline'))){
   try{const raw=await aiTurn(a,el,'free');let p=raw.includes(STREAM_DELIM)?parseStream(raw):parse(raw);if(p&&p.text&&p.text!=='…'&&p.text.length>8){res=p;softFail=false;setNarratorMode('free')}}catch(_){}}
  if(!res&&cfg.mode!=='gemini'&&cfg.mode!=='free'){const raw=await aiTurn(a,el,cfg.mode);res=parse(raw);setNarratorMode(cfg.mode)}
  if(!res){res=offline(a);softFail=true;setNarratorMode('offline')}
  try{if(res.changes)res.changes=Sim.validateChanges(S,res.changes);if(res.changes?.world)res.changes.world=guardNoRegression(Sim.validateWorldUpdate(S,res.changes.world))}catch(_){}
  {const c=res.changes||{},lim={hp:30,mp:30,str:2,cha:2,ruf:5,xp:60,verstand:15,schuld:5,gold:50};for(const k in lim)if(k in c)c[k]=Math.max(-lim[k],Math.min(lim[k],+c[k]||0));if(c.affinity)for(const n in c.affinity)c.affinity[n]=Math.max(-15,Math.min(15,+c.affinity[n]||0));if(c.trust)for(const n in c.trust)c.trust[n]=Math.max(-10,Math.min(10,+c.trust[n]||0))}
  if(!res.changes)res.changes={};
  if(Array.isArray(res.changes.items))res.changes.items=res.changes.items.filter(x=>{const n=typeof x==='string'?x:x.name;return !invNames().includes(n)});
  if(Array.isArray(res.changes.newSkills))res.changes.newSkills=res.changes.newSkills.filter(x=>{const n=typeof x==='string'?x:x.name;return !skillNames().includes(n)});
  modelSummary=res.changes.summary; res._durationMin=res.changes.durationMin; delete res.changes.summary; delete res.changes.durationMin;
  if(res.changes.speaker){S.flags.speaker=String(res.changes.speaker).slice(0,40);delete res.changes.speaker}
  scenePrompt=res.changes.scenePrompt; delete res.changes.scenePrompt;
  worldUpdate=res.changes.world; delete res.changes.world;
  questUpdate=res.changes.quests; delete res.changes.quests;
  // Continuity: hist first (needed for next turn); keep 24 turns (~12 exchanges)
  S.hist=S.hist||[];S.hist.push({role:'user',content:'SPIELER: '+a},{role:'assistant',content:res.text});S.hist=S.hist.slice(-24);
  Cont.noteExchange(S,a,res.text);
  if(softFail){res.note=friendlyAIFail();setNarratorMode(S._narratorMode||'offline')}
  else if(!S._narratorMode)setNarratorMode('gemini')}
 catch(e){res=offline(a);res.changes=res.changes||{};res.note=friendlyAIFail();setNarratorMode('offline')}
 _dbgMs=Math.round(performance.now()-t0); S._turnTotal=S._turnTotal||_dbgMs;
 // Time BEFORE showing? No — apply duration after reply starts streaming/typing, still before worldTick
 try{applyActionDuration(a, res._durationMin)}catch(_){try{applyActionDuration(a,null)}catch(__){}}
 S.log.push({k:'n',t:res.text});if(S.log.length>80)S.log=S.log.slice(-80);
 const sp=S.flags?.speaker||(isG()?'Nebel':'Erzähler');
 // Portrait sync can wait — show text first
 await typewriteAsync(sp,res.text);
 if(res.note)pushSys(res.note);apply(res.changes||{});
 hud();renderChoices();setBusy(false);
 requestAnimationFrame(()=>{const t=$('#txt');if(t)t.focus({preventScroll:true})});
 // AFTER reply: world tick, summary, images, codex, save — never block TTFT
 const _worldUpdate=worldUpdate, _scenePrompt=scenePrompt, _questUpdate=questUpdate, _modelSummary=modelSummary, _a=a, _text=res.text;
 scheduleAfterReply([
  ()=>{try{if(_modelSummary)Cont.ingestModelSummary(S,_modelSummary); else Cont.rollChapterAsync(S)}catch(_){}},
  ()=>{try{if(_worldUpdate)applyWorld(_worldUpdate)}catch(_){}},
  ()=>{try{if(_questUpdate)applyQuestUpdate(_questUpdate)}catch(_){}},
  ()=>{try{if(_scenePrompt){S.flags.scenePrompt=String(_scenePrompt).slice(0,220);setSceneImage(S.flags.scenePrompt,'ai_'+S.turn)}}catch(_){}},
  ()=>{try{setPortraitFromSpeaker(S.flags?.speaker)}catch(_){}},
  ()=>{try{worldTick()}catch(_){}},
  ()=>{try{maybeSceneFromWorld()}catch(_){}},
  ()=>{try{save()}catch(_){}},
  ()=>{try{dbgLine()}catch(_){}},
  ()=>{try{const w=Imm.weatherFor(S);S.flags=S.flags||{};S.flags.weather=w;Imm.setWeather(w==='klar'?'none':w);Imm.applyDayNightTint(S)}catch(_){}},
  ()=>{try{openPendingEncounter(res)}catch(_){}}
 ]);
}


/* ---------- title particles + soft music ---------- */
function runParticles(){const c=$('#particles');if(!c)return;const ctx=c.getContext('2d');let parts=[];
 function resize(){c.width=c.clientWidth*devicePixelRatio;c.height=c.clientHeight*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0)}
 function spawn(){parts=Array.from({length:48},()=>({x:Math.random()*c.clientWidth,y:Math.random()*c.clientHeight,r:Math.random()*2.2+.3,vx:(Math.random()-.5)*.25,vy:-Math.random()*.35-.05,a:Math.random()*.5+.15}))}
 function frame(){if(!$('#title').classList.contains('hidden')){ctx.clearRect(0,0,c.clientWidth,c.clientHeight);
  for(const p of parts){p.x+=p.vx;p.y+=p.vy;if(p.y<-5){p.y=c.clientHeight+5;p.x=Math.random()*c.clientWidth}ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,6.28);ctx.fillStyle='rgba(255,180,230,'+p.a+')';ctx.fill()}}
  requestAnimationFrame(frame)}
 resize();spawn();window.addEventListener('resize',()=>{resize();spawn()});frame()}
function toggleMusic(){_musicOn=!_musicOn;$('#btnMusic').textContent=_musicOn?'🔊 Musik an':'🔇 Musik aus';
 if(!_musicOn){stopMusic();return}startMusic()}
function startMusic(){try{if(!_audioCtx)_audioCtx=new(window.AudioContext||window.webkitAudioContext)();
 const ctx=_audioCtx;if(ctx.state==='suspended')ctx.resume();
 stopMusic();const master=ctx.createGain();master.gain.value=0.03;master.connect(ctx.destination);
 const oscs=[];[196,246.94,293.66,392].forEach((f,i)=>{const o=ctx.createOscillator();const g=ctx.createGain();o.type='sine';o.frequency.value=f;
  g.gain.value=0.15/(i+1);o.connect(g);g.connect(master);o.start();oscs.push(o)});
 _musicNodes={master,oscs}}catch(_){_musicOn=false;$('#btnMusic').textContent='🔇 Musik aus'}}
function stopMusic(){if(!_musicNodes)return;try{_musicNodes.oscs.forEach(o=>{try{o.stop()}catch(_){}});_musicNodes.master.disconnect()}catch(_){}_musicNodes=null}

/* ---------- UI boot ---------- */

function openGenrePicker(){const el=$('#genrePick');if(!el)return;el.classList.remove('hidden');const sel=$('#genreSelect');if(sel&&!sel.options.length){Object.values(GENRES).forEach(g=>{const o=document.createElement('option');o.value=g.id;o.textContent=g.icon+' '+g.label;sel.appendChild(o)})}}
function closeGenrePicker(){$('#genrePick')?.classList.add('hidden')}
function showTitle(){_mode='title';$('#stage').classList.add('hidden');$('#keyGate').classList.add('hidden');$('#title').classList.remove('hidden');
 document.body.classList.remove('greyw');
 const sv=localStorage.getItem(KEY);if(sv)$('#btnContinue').classList.remove('hidden');else $('#btnContinue').classList.add('hidden');
 runParticles()}

$('#btnNew').onclick=()=>startIntro();
 if($('#btnGenre'))$('#btnGenre').onclick=()=>openGenrePicker();
 if($('#btnGenreGo'))$('#btnGenreGo').onclick=()=>{const v=($('#genreCustom')?.value||'').trim()||$('#genreSelect')?.value||'zombie';const name=($('#genreName')?.value||'Alex').trim()||'Alex';closeGenrePicker();startProcedural(v,name)};

$('#btnGreyBook').onclick=()=>startGreyBook();
$('#btnContinue').onclick=async()=>{
  try{S=await loadSave()}catch(_){const sv=localStorage.getItem(KEY);if(!sv)return;S=migrate(sv)}
  if(!S){toast('Kein Spielstand');return}
  try{await loadPack(S.role)}catch(_){}
  if(!S.world&&PACKS[S.role])S.world=buildWorldFromPack(PACKS[S.role],S.role);
  try{Sim.migrateToV13(S);Econ.ensureEcon(S);Codex.ensureCodex(S);WorldMap.ensureSpawn(S);Level.ensureProgress(S);Know.ensureKnow(S);Know.migrateKnow(S);S.ver=VER}catch(_){}
  gateOrShow();
};
$('#btnMusic').onclick=toggleMusic;
$('#btnTitleSettings').onclick=openSheet;
$('#btnSettings').onclick=openSheet;
$('#btnMenu').onclick=()=>{try{Imm.uiTick()}catch(_){}openMenu('hub')};
 try{$('#btnAudio').onclick=()=>{const on=Imm.toggleMute();$('#btnAudio').textContent=on?'🔊':'🔇';$('#btnAudio').classList.toggle('is-on',on);if(on)Imm.startAmbient(document.body.className.match(/genre-\w+/)?.[0]||'genre-fantasy');toast(on?'Ambient an':'Ambient stumm')}}catch(_){}
$('#btnMenuClose').onclick=closeMenu;
$('#menu').addEventListener('click',e=>{if(e.target.id==='menu')closeMenu()});
$$('#menuTabs button').forEach(b=>b.onclick=()=>{_menuTab=b.dataset.tab;$$('#menuTabs button').forEach(x=>x.classList.toggle('on',x.dataset.tab===_menuTab));renderMenu()});

$('#inputRow').onsubmit=e=>{e.preventDefault();const v=$('#txt').value;$('#txt').value='';
 if(_mode==='intro'){actIntro(v);return}
 if(_mode==='intro'||!S){/* grey own name via text */ const t=v.trim();if(t&&document.body.classList.contains('greyw')&&!S){newGrey('own',t,'');return}}
 act(v)};

const sync=()=>{$('#webllmBox').style.display=$('#mode').value==='webllm'?'':'none';$('#apiBox').style.display=$('#mode').value==='api'?'':'none'};
function openSheet(){$('#mode').value=cfg.mode||'gemini';$('#wmodel').value=cfg.wmodel||$('#wmodel').value;$('#aurl').value=cfg.aurl||'';$('#akey').value=cfg.akey||'';$('#amodel').value=cfg.amodel||'';$('#gkey').value=cfg.gkey||'';
 if($('#dbgToggle'))$('#dbgToggle').checked=!!cfg.debug;if($('#battleDiff'))$('#battleDiff').value=cfg.battleDiff||'normal';if($('#atbMode'))$('#atbMode').value=cfg.atbMode||'active';gmUI();sync();$('#sheet').classList.remove('hidden')}
$('#mode').onchange=sync;$('#btnClose').onclick=()=>$('#sheet').classList.add('hidden');
$('#gkey').oninput=()=>{if($('#gkey').value.trim())$('#mode').value='gemini';sync()};
function saveCfgFromUI(gk){const mode=$('#mode')?$('#mode').value:(gk?'gemini':'offline');
 cfg={v2:1,gkey:gk,mode:gk&&(!cfg.gkey||cfg.gkey!==gk)?'gemini':mode,wmodel:$('#wmodel')?.value,aurl:$('#aurl')?.value,akey:$('#akey')?.value,amodel:$('#amodel')?.value,debug:!!($('#dbgToggle')&&$('#dbgToggle').checked),battleDiff:$('#battleDiff')?.value||'normal',atbMode:$('#atbMode')?.value||'active'};
 localStorage.setItem(CFG,JSON.stringify(cfg));
 const st=gmStore();if($('#gmodel'))st.manual=$('#gmodel').value||'';gmSave(st);
 if(gk)gmFetch(gk,true).then(()=>gmProbe(gk).catch(()=>{}));
 dbgLine();return cfg}
$('#btnSave').onclick=()=>{const gk=$('#gkey').value.trim();saveCfgFromUI(gk);
 if(S){S.cfgBattleDiff=cfg.battleDiff||'normal';S.cfgAtbMode=cfg.atbMode||'active'} toast(gk?'Gespeichert – die Geschichte kann beginnen.':(cfg.mode==='offline'?'Offline gespeichert':'Gespeichert'));
 $('#sheet').classList.add('hidden')};
$('#btnLoad').onclick=()=>{cfg.wmodel=$('#wmodel').value;engine=null;loadWebLLM().catch(e=>$('#wstatus').textContent='❌ '+e.message)};
$('#btnReset').onclick=()=>{if(confirm('Wirklich alles löschen?')){localStorage.removeItem(KEY);location.reload()}};
$('#btnAdv').onclick=()=>{$('#advBox').classList.toggle('hidden');$('#btnAdv').textContent=$('#advBox').classList.contains('hidden')?'Erweitert ▸':'Erweitert ▾'};
$('#btnGateSave').onclick=()=>{const gk=$('#gateKey').value.trim();if(!gk){toast('Bitte Schlüssel einfügen');return}
 cfg.gkey=gk;cfg.mode='gemini';cfg.v2=1;localStorage.setItem(CFG,JSON.stringify(cfg));
 toast('Alles bereit.');gmFetch(gk,true).then(()=>gmProbe(gk).catch(()=>{}));enterPlay()};
$('#btnGateSkip').onclick=()=>{cfg.mode='free';cfg.v2=1;localStorage.setItem(CFG,JSON.stringify(cfg));toast('Erzählerin: Pollinations (ohne Schlüssel)');enterPlay()};

window.__setCfg=o=>{cfg=Object.assign(cfg||{},o||{});try{localStorage.setItem(CFG,JSON.stringify(cfg))}catch(_){}};window.__game={Battle,Jobs,Gems,Summons,Equip,Jrpg,openPendingEncounter,Imm,discoverThing,showCodexInline,Level,UI14,Know,Cont,lastPromptDump,advanceTimeMinutes,applyActionDuration,newGrey,greyDetails,loadGrey,loadPack,get S(){return S},act,newLife,gBody,msgs,gmRank,gmProbe,parseStream,thinkingCfg,gmOrder,readSSE,STREAM_DELIM,migrate,worldTick,bumpRel,openMenu,stageName,offline,startIntro,setSceneImage,setPortrait,imgUrl,advanceTime,phaseLabel,typewrite,enterPlay,showTitle,analyzeImage,applySceneTheme,themeFromText,loadValidatedImage,openingNarration,travelTo,parseTravel,killNPC,robNPC,addMemory,memoryHint,startProcedural,offlineGenerateWorld,generateWorldPack,GENRES,travelChoices,ensureGraph,whoHere,parseLifeSim,Sim,Persist,WorldMap,Econ,Codex,UI13,save,loadSave,applyCatchUp,findAnyNpc};
window.__game.askNPC=a=>askNPC(a);window.__game.gemini=gemini;
if(cfg.gkey)gmFetch(cfg.gkey.trim()).then(()=>gmProbe(cfg.gkey.trim()).catch(()=>{})).catch(()=>{});
(function(){const root=document.documentElement;const apply=()=>{try{const vv=window.visualViewport;if(!vv)return;const kb=Math.max(0,window.innerHeight-vv.height-vv.offsetTop);root.style.setProperty('--kb',kb+'px')}catch(_){}};
 if(window.visualViewport){visualViewport.addEventListener('resize',apply);visualViewport.addEventListener('scroll',apply)}
 window.addEventListener('focusin',e=>{if(e.target&&e.target.id==='txt'){setTimeout(()=>{try{e.target.scrollIntoView({block:'end',behavior:'smooth'})}catch(_){};apply()},300)}});
 $('#txt')&&$('#txt').addEventListener('blur',()=>root.style.setProperty('--kb','0px'))})();
try{if('serviceWorker' in navigator&&navigator.serviceWorker){navigator.serviceWorker.register('./sw.js?v=16').catch(()=>{});
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(sessionStorage.getItem('isekai_sw_reloaded'))return;sessionStorage.setItem('isekai_sw_reloaded','1');location.reload()})}}catch(_){}
showTitle();
