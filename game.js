const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];const R=a=>a[Math.floor(Math.random()*a.length)];const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const VER=11,CACHE_V='v11';
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
 [...bg.classList].filter(c=>c.startsWith('theme-')).forEach(c=>bg.classList.remove(c));
 bg.classList.add('theme-'+th);bg.dataset.theme=th;buildSceneArt(th);
 const ph=$('#scenePh');if(ph){ph.classList.add('hidden')}}

function portColors(name){const h=hashSeed(String(name||'x'));const hues=[[255,111,181],[123,107,255],[110,200,255],[255,180,100],[160,255,180],[255,120,140],[200,160,255]];
 const a=hues[h%hues.length],b=hues[(h*3)%hues.length];return {a:`rgb(${a[0]},${a[1]},${a[2]})`,b:`rgb(${(b[0]*0.35)|0},${(b[1]*0.35)|0},${(b[2]*0.35)|0})`,hexA:`#${a.map(x=>x.toString(16).padStart(2,'0')).join('')}`}}
function initialsOf(name){const p=String(name||'?').replace(/[^a-zA-ZäöüÄÖÜß\s]/g,' ').trim().split(/\s+/).filter(Boolean);
 if(!p.length)return '?';if(p.length===1)return p[0].slice(0,2).toUpperCase();return (p[0][0]+p[p.length-1][0]).toUpperCase()}
function stylizedPortraitHTML(name,npc){const col=portColors(name);const ini=initialsOf(name);const e=(npc&&npc.e)||'';
 return `<div class="port-svg" style="--port-a:${col.a};--port-b:${col.b};width:100%;height:100%;display:grid;place-items:center;background:linear-gradient(160deg,${col.a},${col.b})"><div style="text-align:center"><div style="font-size:22px;line-height:1">${e||'✦'}</div><div class="port-initial" style="font-size:20px;margin-top:2px">${ini}</div></div></div>`}
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
 const theme=themeFromText((prompt||'')+' '+(k||'')+' '+(S?.world?.scene?.ort||'')+' '+(S?.role||''));
 applySceneTheme(theme);hideScenePhoto();
 const forceCss=!!opts.cssOnly||!!window.__FORCE_CSS_SCENES;
 if(forceCss){cache.next[k]=Date.now()+60000;return}
 if(cache.ok[k]&&cache.scenes[k]){ // previously validated — still re-check occasionally? use cached url carefully
  // Don't auto-show cached URL without revalidation if it might be placard from v10; only if ok flag set in v11
 }
 const seed=hashSeed('scene:'+k+(S?.role||''));
 const url=imgUrl(prompt||scenePromptFor(k),512,896,seed,isG());
 cache.scenes[k]=url;if(S)save();
 if(!canRetry(cache,k)&&cache.fail[k]){scheduleRetry('scene',k,()=>setSceneImage(prompt,key,opts));return}
 enqueueImg(()=>loadValidatedImage(url).then(res=>{
  const img=$('#sceneImg');if(!img)return;
  if(res.ok){cache.ok[k]=1;delete cache.fail[k];delete cache.next[k];img.src=url;img.dataset.key=k;
   requestAnimationFrame(()=>img.classList.add('on'));if(S)save()}
  else{markFail(cache,k);hideScenePhoto();scheduleRetry('scene',k,()=>setSceneImage(prompt,key,{...opts}));if(S)save()}
 }))}

function setPortrait(name,npc){const cache=ensureImgCache();const wrap=$('#portraitWrap'),img=$('#portraitImg');
 if(!name){wrap&&wrap.classList.add('hidden');return}
 wrap.classList.remove('hidden');applyPortraitFallback(name,npc);hidePortraitPhoto();
 if(window.__FORCE_CSS_SCENES)return;
 const seed=hashSeed('port:'+name+(S?.role||''));
 const url=imgUrl(portraitPromptFor(name,npc),192,192,seed,isG());
 cache.portraits[name]=url;
 const key='port:'+name;
 if(!canRetry(cache,key)&&cache.fail[key]){scheduleRetry('port',key,()=>setPortrait(name,npc));if(S)save();return}
 enqueueImg(()=>loadValidatedImage(url).then(res=>{
  if(!res.ok){markFail(cache,key);hidePortraitPhoto();scheduleRetry('port',key,()=>setPortrait(name,npc));if(S)save();return}
  cache.ok[key]=1;delete cache.fail[key];delete cache.next[key];
  img.src=url;img.dataset.name=name;requestAnimationFrame(()=>img.classList.add('on'));if(S)save()}))}

function maybeSceneFromWorld(){if(!S?.world?.scene?.ort)return;const ort=S.world.scene.ort;const zeit=S.world.scene.zeit||phaseLabel();
 const prompt=(S.flags&&S.flags.scenePrompt)||scenePromptFor(ort,zeit);setSceneImage(prompt,ort)}
function maybePortraitsPresent(){/* warm cache URLs only — don't burst-fetch; portraits load on speak/meet */}

/* ---------- save / toast / gate ---------- */
function save(){if(!S)return;try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){try{if(S.hist)S.hist=S.hist.slice(-8);if(S.log)S.log=S.log.slice(-40);if(S.summary)S.summary=String(S.summary).slice(0,400);if(S.world&&S.world.npcs)for(const n of Object.values(S.world.npcs))if(n.erinnerung)n.erinnerung=n.erinnerung.slice(-2);localStorage.setItem(KEY,JSON.stringify(S));toast('Speicher gekürzt (wenig Platz)')}catch(_){toast('Speichern fehlgeschlagen – wenig Speicher')}}}
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('on'),2600)}
function eventToast(t){const e=$('#eventToast');if(!e)return;e.textContent=t;e.classList.remove('hidden');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.add('hidden'),4200)}
function hasKey(){return !!(cfg.gkey||'').trim()}
function wantAI(){return cfg.mode!=='offline'}
function gateOrShow(){if(S&&S.setup&&!S.setup.done){enterPlay();return}if(wantAI()&&!hasKey()&&cfg.mode!=='webllm'&&cfg.mode!=='api'&&cfg.mode!=='free'){showKeyGate();return}enterPlay()}
function showKeyGate(){$('#title').classList.add('hidden');$('#stage').classList.add('hidden');const g=$('#keyGate');if(g){g.classList.remove('hidden');$('#gateKey').value='';setTimeout(()=>$('#gateKey').focus(),50)}}
function dbgLine(){const el=$('#dbg');if(!el)return;if(!cfg.debug){el.classList.add('hidden');return}el.classList.remove('hidden');el.textContent=_dbgMs?('Zug '+_dbgMs+' ms'):'–'}

/* ---------- items / skills helpers ---------- */
function itemFromStr(x){if(typeof x==='object'&&x&&x.name)return x;const s=String(x);return {id:'i_'+s.slice(0,20),name:s,icon:'📦',desc:s,type:'misc',rarity:'common'}}
function skillFromStr(x){if(typeof x==='object'&&x&&x.name)return x;const s=String(x);return {id:'sk_'+s.slice(0,20),name:s,icon:'✨',desc:s,level:1,cost:0,cd:0,_cd:0}}
function invNames(){return (S.inv||[]).map(i=>typeof i==='string'?i:i.name)}
function skillNames(){return (S.skills||[]).map(i=>typeof i==='string'?i:i.name)}
function stageOf(aff,trust){let s=0;for(let i=0;i<STAGE_NEED.length;i++){const needT=i>=4?STAGE_NEED[i]-10:0;if(aff>=STAGE_NEED[i]&&(trust||0)>=needT)s=i}return s}
function stageName(n){return STAGES[Math.max(0,Math.min(5,n|0))]}
function rarityOf(item){const r=(item&&item.rarity)||'common';return ['common','uncommon','rare','epic','legendary'].includes(r)?r:'common'}
function hearts(stage){return '♥'.repeat(Math.max(0,Math.min(5,stage|0)))+'♡'.repeat(Math.max(0,5-Math.max(0,stage|0)))}
function phaseLabel(){if(!S?.time)return '–';return `${S.time.phase||PHASE_H[S.time.hour|0]||'–'} · Tag ${S.time.day|1}`}
function advanceTime(hours){if(!S.time)S.time={day:1,hour:8,phase:'Morgen'};let h=(S.time.hour|0)+(hours||1);let d=S.time.day|1;
 while(h>=24){h-=24;d++}while(h<0){h+=24;d=Math.max(1,d-1)}S.time.day=d;S.time.hour=h;S.time.phase=PHASE_H[h]||'–';
 if(S.world?.scene)S.world.scene.zeit=`${S.time.phase}, Tag ${d}`}

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
 return s}

function buildQuests(pack){const arc=pack.arc||{titel:'Hauptgeschichte',acts:[]};const act0=arc.acts[0]||{id:'a1',titel:'Anfang',ziel:'Ankommen',mile:[]};
 return {main:{id:arc.acts[0]?.id||'a1',titel:arc.titel,act:0,actTitel:act0.titel,ziel:act0.ziel,objectives:[...(act0.mile||[])],done:[],twist:act0.twist||''},
  side:(pack.sideQuests||[]).map(q=>({...q,status:'offen',progress:0}))}}

function buildWorldFromPack(pack,role){const npcs={};
 for(const[k,v]of Object.entries(pack.npcs||{})){npcs[k]={art:v.art||v.stimme||'',stimme:v.stimme||'',ziel:v.ziel||'',furcht:v.furcht||'',geheimnis:v.geheim||v.geheimnis||'',beziehung:'Fremd',erinnerung:[],e:v.e||'👤',ort:v.ort||'',plan:[...(v.plan||[])],meinung:v.meinung||{},romance:!!v.romance,geschlecht:v.geschlecht||'',schedule:v.schedule||[]}}
 const orte={};for(const[k,v]of Object.entries(pack.regionen||pack.orte||{}))orte[k]=typeof v==='string'?v:v;
 return {scene:JSON.parse(JSON.stringify(pack.startScene||{ort:'',zeit:'',anwesend:[]})),orte,npcs,ereignisse:[...(pack.startEvents||[])],lore:{geschichte:pack.geschichte||'',magie:pack.magie||'',kultur:pack.kultur||'',alltag:pack.alltag||'',politik:pack.politik||'',ton:pack.ton||''}}}

function initRomance(pack,affKeys){const rom={};const names=new Set([...(pack.romanceable||[]),...affKeys]);
 for(const n of names){rom[n]={affection:0,trust:0,stage:0,events:[]}}
 return rom}

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
 S.world=world;
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
 const name=S.pc.name&&S.pc.name!=='???'?S.pc.name:'Fremde Seele';
 const ort=(pack.startScene&&pack.startScene.ort)||'';
 const anw=((pack.startScene&&pack.startScene.anwesend)||[]).slice(0,3);
 const ev=((pack.startEvents||[])[0]||'');
 const mem=softMemory(S.pc.trait,S.pc.bg);
 const look=S.pc.look?`In diesem Körper: ${S.pc.look}.`:'';
 const byRole={
  held:`Fackellicht zittert an alten Steinen. Weihrauch. Metall. Atem, der nicht deiner allein ist.\n\nDu – ${name} – stehst im Beschwörungskreis.${look?'\n'+look:''}${mem?'\n'+mem:''}\n\n${ort?ort+'.':''}\n${anw.length?'Gesichter warten: '+anw.join(', ')+'.':''}\n${ev?ev+'.':''}\n\nNiemand klatscht. Die Welt hält den Atem an – und überlässt dir den nächsten Schritt.`,
  villainess:`Spiegelglas. Rosenwasser. Das leise Klicken einer Uhr, die bereits gegen dich zählt.\n\nDu – ${name} – öffnest die Augen in einem Leben, das jemand anderes zu Ende schreiben wollte.${look?'\n'+look:''}${mem?'\n'+mem:''}\n\n${ort?ort+'.':''}\n${anw.length?'Im Raum: '+anw.join(', ')+'.':''}\n${ev?ev+'.':''}\n\nEin Skandal wartet nicht auf deine Erlaubnis. Was tust du zuerst?`,
  daemon:`Knochen. Samt. Eine Krone, die zu schwer ist für höfliche Lügen.\n\nDu – ${name} – sitzt, wo Könige knien lernen.${look?'\n'+look:''}${mem?'\n'+mem:''}\n\n${ort?ort+'.':''}\n${anw.length?'Zu deinen Füßen: '+anw.join(', ')+'.':''}\n${ev?ev+'.':''}\n\nDie Nacht lauscht. Ein Befehl würde reichen – oder eine Frage.`,
  mensch:`Heu. Morgenluft. Irgendwo kräht etwas, das kein Monster ist.\n\nDu – ${name} – wachst ohne Statusfenster auf. Nur Haut, Atem, Zweifel.${look?'\n'+look:''}${mem?'\n'+mem:''}\n\n${ort?ort+'.':''}\n${anw.length?'In der Nähe: '+anw.join(', ')+'.':''}\n${ev?ev+'.':''}\n\nDie Welt ist klein und gefährlich zugleich. Dein nächster Schritt gehört dir.`
 };
 return byRole[S.role]||byRole.held}

function finishSetup(pack){S.setup.done=true;S._setupChoices=null;S._setupBeat=null;_mode='play';
 if(wantAI()&&!hasKey()&&cfg.mode!=='webllm'&&cfg.mode!=='api'&&cfg.mode!=='free'){save();showKeyGate();return}
 $('.top-actions').style.visibility='';$('#hud').style.visibility='';
 let bridge=openingNarration(pack);
 S.log=[{k:'n',t:bridge}];S.hist=[{role:'assistant',content:bridge}];S.choices=defChoices();
 maybeSceneFromWorld();maybePortraitsPresent();
 const firstNpc=(S.world?.scene?.anwesend||[])[0];if(firstNpc&&S.world.npcs[firstNpc])setPortrait(firstNpc,S.world.npcs[firstNpc]);
 $('#txt').placeholder='Was tust oder sagst du?';
 typewrite(isG()?'Nebel':'Erzähler',bridge,()=>{hud();renderChoices();save()});
 discover(S.world?.scene?.ort)}

function greyIntroDarren(){return `Der Zug hätte nicht halten dürfen.\n\nAuf deiner Fahrkarte steht Blackmere. Kurz nach Mitternacht verliert das Rattern seinen Takt. Die Messinglampe hängt still.\n\nAußen im Ruß: der Abdruck einer kleinen Hand.\nDie Bremsen greifen. GREYMOURNE.\n\nDu bist Darren Crowe. ${S.pc.bg?S.pc.bg.slice(0,120):'Koch, unrasiert, eine Narbe am Unterarm.'}`}
function greyIntroOwn(){return `Der Zug hätte nicht halten dürfen.\n\nDu – ${S.pc.name}. ${S.pc.bg}\nIm Ruß außen: eine kleine Hand. Der Schaffner hat deinen Namen in violetter Tinte geschrieben.\nGREYMOURNE.\nDie alte Frau: „Lassen Sie sich nicht beim vollen Namen rufen.“`}

function defChoices(){const r=S.role;return {grey:['Sitzen bleiben','Aus dem Fenster sehen','Die alte Frau fragen','Nach etwas Unwichtigem fragen'],held:['Mit Elise sprechen','Status prüfen','Die Halle verlassen','Orren nach dem Kreis fragen'],villainess:['Mira helfen','Julian antworten','Romanwissen prüfen','Cedric rufen'],daemon:['Velka zuhören','Brok antworten','Schatzkammer prüfen','Die Armee mustern'],mensch:['Tom antworten','Zur Taverne','Taschen prüfen','Den Wald ansehen']}[r]||['Weiter','Umsehen','Fragen','Warten']}

function discover(place){if(!place)return;if(!S.discovered)S.discovered=[];if(!S.discovered.includes(place)){S.discovered.push(place);if(S.setup?.done)toast('📍 Neu entdeckt: '+place)}}

/* ---------- typewriter VN ---------- */
function typewrite(speaker,text,done){_twDone=false;_twFull=text||'';
 const sp=$('#speaker'),el=$('#vnText'),tap=$('#vnTap');
 if(speaker){sp.textContent=speaker;sp.classList.remove('hidden')}else sp.classList.add('hidden');
 el.textContent='';tap.classList.add('hidden');
 clearInterval(_twTimer);
 function finish(){if(_twDone)return;clearInterval(_twTimer);el.textContent=_twFull;_twDone=true;tap.classList.remove('hidden');done&&done()}
 el.onclick=finish;$('#vnBox').onclick=finish;
 if(window.__FAST){finish();return}
 let i=0;const step=Math.max(1,Math.floor(_twFull.length/120));
 _twTimer=setInterval(()=>{i=Math.min(_twFull.length,i+step);el.textContent=_twFull.slice(0,i);if(i>=_twFull.length)finish()},12)}
function typewriteAsync(speaker,text){return new Promise(res=>typewrite(speaker,text,res))}

/* ---------- relationships / romance ---------- */
function bumpRel(name,daff,dtrust,toastOn){if(!S.romance)S.romance={};
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
 advanceTime(rnd(1,3));
 const phase=S.time.phase;const npcs=Object.entries(S.world.npcs||{});if(!npcs.length)return;
 const present=new Set((S.world.scene.anwesend||[]).map(String));
 // schedule-driven location hints
 for(const[name,n]of npcs){const sch=n.schedule||[];const hit=sch.find(s=>matchSchedule(s,phase));
  if(hit){const bit=String(hit).split(':').slice(1).join(':').trim()||hit;n._schedNow=bit;if(!present.has(name)&&Math.random()<.3)n.ort=bit}}
 const actors=npcs.filter(([k])=>!present.has(k)).sort(()=>Math.random()-.5).slice(0,2);
 const notes=[];
 for(const[name,n]of actors){const plan=n.plan||[];const schedAct=n._schedNow;const act=schedAct||(plan.length?R(plan):null);
  if(act){const line=`${n.e||'👤'} ${name} handelt abseits: ${act}.`;notes.push(line);n.erinnerung=(n.erinnerung||[]).concat(['(Offscreen) '+act]).slice(-6);
   if(Math.random()<.4){const rum=`Gerücht: ${name} – ${act}`;S.ticks.rumours=(S.ticks.rumours||[]).concat(rum).slice(-8);S.world.ereignisse=(S.world.ereignisse||[]).concat(rum).slice(0,6)}}
  if(n.ziel&&Math.random()<.25)S.ticks.rumours.push(`${name} verfolgt weiter: ${String(n.ziel).slice(0,60)}`)}
 if(S.turn%5===0&&S.quests?.main){const m=S.quests.main;const left=(m.objectives||[]).filter(o=>!(m.done||[]).includes(o));
  if(left.length&&Math.random()<.5)S.world.ereignisse=(S.world.ereignisse||[]).concat(`Etwas zieht die Geschichte: ${left[0]}`).slice(0,6)}
 if(notes.length&&S.turn>0&&S.turn%2===0){const t=notes[0];S.ticks.log=(S.ticks.log||[]).concat(t).slice(-10);eventToast(t)}
 // NPC may initiate conversation
 if(Math.random()<.28){const here=[...present].filter(p=>S.world.npcs[p]);if(here.length){const who=R(here);const n=S.world.npcs[who];
  const line=R([`${n.e||''} ${who} spricht dich an.`.trim(),`${who}: „${R(['Wir müssen reden.','Hast du einen Moment?','Das bleibt nicht so.','Komm. Kurz.'])}“`]);
  S.flags.npcInit=who;eventToast(line);if(S.choices&&S.choices.length)S.choices=[`Mit ${who} sprechen`,...S.choices.slice(0,3)];
  setPortrait(who,n)}}}

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
function add(k,t){S.log.push({k,t});if(S.log.length>80)S.log.shift();
 if(k==='n'){const sp=S.flags?.speaker||(isG()?'Nebel':'Erzähler');typewrite(sp,t,()=>{});setPortraitFromSpeaker(S.flags?.speaker)}
 else if(k==='s')eventToast(t)
 else if(k==='p'){/* player line already shown via input */}
 else if(k==='tick')eventToast(t)}
function setPortraitFromSpeaker(name){if(!name||!S.world?.npcs){$('#portraitWrap').classList.add('hidden');return}
 let key=Object.keys(S.world.npcs).find(k=>k.toLowerCase()===String(name).toLowerCase())||Object.keys(S.world.npcs).find(k=>String(name).toLowerCase().includes(k.toLowerCase().split(' ')[0]));
 if(key)setPortrait(key,S.world.npcs[key]);else $('#portraitWrap').classList.add('hidden')}

function enterPlay(){$('#keyGate')&&$('#keyGate').classList.add('hidden');$('#title').classList.add('hidden');
 document.body.classList.toggle('greyw',isG());$('#stage').classList.remove('hidden');
 $('.top-actions').style.visibility='';$('#hud').style.visibility='';
 if(S.setup&&!S.setup.done){_mode='setup';loadPack(S.role).then(p=>{S._setupPack=p;showBeat(p)});return}
 _mode='play';maybeSceneFromWorld();maybePortraitsPresent();
 const last=(S.log||[]).filter(m=>m.k==='n').slice(-1)[0];
 if(last)typewrite(isG()?'Nebel':'Erzähler',last.t,()=>{});else typewrite('','…',()=>{});
 hud();renderChoices()}

function show(){enterPlay()}

/* ---------- menu overlays ---------- */
function openMenu(tab){_menuTab=tab||_menuTab||'status';$('#menu').classList.remove('hidden');
 $$('#menuTabs button').forEach(b=>b.classList.toggle('on',b.dataset.tab===_menuTab));renderMenu()}
function closeMenu(){$('#menu').classList.add('hidden')}
function renderMenu(){const body=$('#menuBody');if(!body||!S)return;body.innerHTML='';
 if(_menuTab==='status'){const s=S.st;body.innerHTML=`<div class="card"><h3>${ROLES[S.role].e} ${S.pc?.name||ROLES[S.role].name}</h3>
 <p class="meta">${ROLES[S.role].cls[S.cls]} · Leben #${S.lives} · Seele ${S.soul}</p>
 <p>${isG()?`Verstand ${s.hp}/100 · Schuld ${s.ruf}/100`:`Lv ${s.lvl} · HP ${s.hp}/${s.maxhp} · MP ${s.mp}/${s.maxmp} · 🪙 ${s.gold|0}<br>Stärke ${s.str} · Charme ${s.cha} · Ruf ${s.ruf} · XP ${s.xp}/${s.lvl*100}`}</p>
 <p class="meta">Ort: ${S.world?.scene?.ort||'–'}<br>Zeit: ${phaseLabel()} (${S.world?.scene?.zeit||'–'})<br>Anwesend: ${(S.world?.scene?.anwesend||[]).join(', ')||'–'}</p>
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
 else if(_menuTab==='rels'){const entries=Object.entries(S.romance||{});if(!entries.length)body.innerHTML='<div class="card"><p>Noch keine Beziehungen.</p></div>';
  entries.sort((a,b)=>b[1].affection-a[1].affection).forEach(([name,r])=>{const n=S.world?.npcs?.[name];const card=document.createElement('div');card.className='card';
   const mem=(n?.erinnerung||[]).slice(-1)[0]||'–';const portId='rp_'+hashSeed(name);
   card.innerHTML=`<div class="rel-row"><div class="rel-port" id="${portId}">${n?.e||'👤'}</div><div style="flex:1"><h3>${name}</h3>
   <div class="hearts">${hearts(r.stage)}</div><div class="stage-lab">${stageName(r.stage)} · ♡${r.affection} · Vertrauen ${r.trust}</div>
   <div class="aff-bar"><i style="width:${Math.max(0,Math.min(100,r.affection))}%"></i></div></div></div>
   <p class="meta">${n?.art?String(n.art).slice(0,100):''}</p><p class="meta">Ort: ${n?.ort||'?'} · ${mem}</p>
   <div class="row"><button type="button">Ansprechen</button></div>`;
   card.querySelector('button').onclick=()=>{closeMenu();act('Ich gehe zu '+name+' und spreche sie/ihn an.')};body.appendChild(card);
   const box=card.querySelector('.rel-port');const col=portColors(name);box.style.setProperty('--port-a',col.a);box.style.setProperty('--port-b',col.b);
   box.innerHTML=`<span class="port-initial">${initialsOf(name)}</span>`;
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
function apply(ch){if(!ch)return;const s=S.st,num=v=>Math.max(-200,Math.min(200,Math.round(+v||0)));const out=[];
 const map={verstand:'hp',schuld:'ruf',hp:'hp',mp:'mp',str:'str',staerke:'str',stärke:'str',cha:'cha',charme:'cha',ruf:'ruf',xp:'xp',gold:'gold'};
 for(const[k,v]of Object.entries(ch)){const m=map[k.toLowerCase()];if(m&&v){s[m]=(s[m]|0)+num(v);out.push(`${k} ${v>0?'+':''}${num(v)}`)}}
 if(ch.affinity&&typeof ch.affinity==='object')for(const[n,v]of Object.entries(ch.affinity)){const trust=ch.trust&&ch.trust[n]!=null?num(ch.trust[n]):Math.max(0,num(v)/2|0);bumpRel(n,num(v),trust,false);out.push(`💗${n.split(' ').pop()} ${v>0?'+':''}${num(v)}`)}
 if(ch.trust&&typeof ch.trust==='object'&&!ch.affinity)for(const[n,v]of Object.entries(ch.trust))bumpRel(n,0,num(v),false);
 (ch.newSkills||ch.skills||[]).forEach(x=>{const sk=skillFromStr(x);if(!S.skills.some(s=>s.name===sk.name)&&S.skills.length<24){S.skills.push(sk);out.push('Skill: '+sk.name);toast('✨ Neue Fähigkeit: '+sk.name)}});
 (ch.items||ch.addItems||[]).forEach(x=>{const it=itemFromStr(x);if(!it.rarity)it.rarity='uncommon';if(S.inv.length<40){S.inv.push(it);out.push('Item: '+it.name);toast('📦 '+it.name)}});
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
 const scene=w.scene||{};const present=new Set((scene.anwesend||[]).map(String));
 const histTxt=((S.hist||[]).slice(-6).map(h=>h.content).join(' ')+' '+(S.summary||'')).toLowerCase();
 const npcs={};for(const[k,v]of Object.entries(w.npcs||{})){const hit=present.has(k)||k.toLowerCase().split(/[ \/–_-]+/).some(p=>p.length>3&&histTxt.includes(p));if(!hit)continue;
  const rom=S.romance?.[k];const o={art:String(v.art||'').slice(0,100),stimme:String(v.stimme||'').slice(0,80),beziehung:stageName(rom?.stage||0),ziel:String(v.ziel||'').slice(0,80),furcht:String(v.furcht||'').slice(0,60)};
  const mem=(v.erinnerung||[]).slice(-2);if(mem.length)o.erinnerung=mem;if(S.turn>=40&&v.geheimnis)o.geheimnis=String(v.geheimnis).slice(0,100);
  if(rom)o.romance={stage:stageName(rom.stage),affection:rom.affection,trust:rom.trust};npcs[k]=o}
 const orte={};for(const[k,v]of Object.entries(w.orte||{})){const key=k.toLowerCase().split(/[ \/–]/)[0];if(String(scene.ort||'').toLowerCase().includes(key)||histTxt.includes(key)||(S.discovered||[]).includes(k))orte[k]=String(v).slice(0,120)}
 const q=S.quests?.main;const qHint=q?{akt:q.actTitel,ziel:q.ziel,offen:(q.objectives||[]).filter(o=>!(q.done||[]).includes(o)).slice(0,3)}:null;
 return 'WELT (nur Szene):\n'+JSON.stringify({scene,zeit:phaseLabel(),npcs,orte,ereignisse:(w.ereignisse||[]).slice(0,4),quest:qHint,geruechte:(S.ticks?.rumours||[]).slice(-2)})}
function applyWorld(u){if(!u||!S.world)return;const w=S.world;const cut=(x,n)=>String(x||'').slice(0,n);const prevOrt=w.scene?.ort;
 if(u.scene&&u.scene.ort){w.scene={ort:cut(u.scene.ort,80),zeit:cut(u.scene.zeit,60)||phaseLabel(),anwesend:(u.scene.anwesend||[]).slice(0,8).map(x=>cut(x,40))};discover(w.scene.ort);
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
 let who=pres.map(p=>{const f=find(p);return f?{n:f[0],d:f[1],label:p}:{n:p,d:null,label:p}});if(!who.length)who=Object.entries(bible).slice(0,2).map(([k,v])=>({n:k,d:v,label:k}));
 const named=who.filter(w=>t.includes(w.n.toLowerCase().split(' ')[0]));const sp=(named.length?named:who).slice(0,/ihr|euch|alle|seid/.test(t)?3:1);
 const first=s=>String(s||'').split(/[.;]/)[0].trim();const lines=sp.map(w=>{const nm=w.n.split(' / ')[0];const desc=first(w.d?.art||w.d?.stimme);
  const rom=S.romance?.[w.n];const st=rom?stageName(rom.stage):'Fremd';
  if(/wer|seid|bist|name/.test(t)){return `${w.label} ${R(['mustert dich','hebt den Blick','zögert kurz'])}. „${nm}.“${desc?' '+desc+'.':''} (${st})`}
  if(/wo|wohin|woher/.test(t)){const o=S.world?.scene?.ort||'hier';return `${w.label}: „Du bist ${/^(in|im|am|auf|an)\b/i.test(o)?o:'in '+o}.“`}
  return `${w.label} ${R(['runzelt die Stirn','sieht dich lange an','senkt die Stimme'])}: „${R(['Das ist eine gute Frage.','Nicht hier. Nicht jetzt.','Wenn du das wirklich wissen willst, bleib in meiner Nähe.'])}“`});
 const aff={};sp.forEach(w=>{aff[w.n]=2});
 return {text:`„${a}“\n\n`+lines.join('\n\n'),changes:{xp:5,affinity:aff,choices:defChoices()}}}

function offline(a){const q=askNPC(a);if(q)return q;if(isG()){const t=a.toLowerCase();const hit=/tür|öffn|klink/.test(t);
  const txt=R(['Irgendwo schlägt eine Glocke, tief und unsauber. Du spürst sie im Brustbein.','Der Nebel antwortet nicht. Nur eine Uhr tickt, deren Zeiger stillstehen.','Aus einem Ablaufgitter: drei Schläge, Pause, zwei weitere.','Du zählst, ohne es zu wollen. Die Zahl stimmt nicht.']);
  return {text:`„${a}“ – ${txt}`,changes:{hp:hit?-8:-2,ruf:0,choices:defChoices()}}}
 const t=a.toLowerCase(),s=S.st;const npcs=Object.keys(S.romance||S.aff||{});
 const who=npcs.find(n=>n.toLowerCase().split(/[ _]/).some(p=>p.length>2&&t.includes(p.toLowerCase())));
 let txt,ch={};
 if(/kämpf|kampf|angriff|greif|jag|monster|schlag|töt|armee|befehl/.test(t)){const foe=R({held:['einen Goblin-Trupp','einen Oger','einen Dämonenspäher'],villainess:['einen Attentäter','eine Rivalin'],daemon:['eine Abenteurergruppe','einen rebellischen Fürsten'],mensch:['ein Wildschwein','einen Wegelagerer','einen Wolf']}[S.role]||['einen Gegner']);
  const win=Math.random()<0.45+s.str/80;const dmg=rnd(5,20)+(win?0:15);
  txt=win?`Du forderst ${foe} heraus und siegst!`:`Du forderst ${foe} heraus und entkommst blutend.`;
  ch={hp:-dmg,xp:win?rnd(30,60):10,str:win&&Math.random()<.4?1:0,ruf:win?(S.role==='daemon'?-5:5):0};if(win&&Math.random()<.3)ch.items=[{name:R(['Monsterkern','Silbermünzen','Amulett','Heiltrank']),icon:'💎',desc:'Beute',type:'misc'}]}
 else if(/red|sprech|sag|frag|flirt|küss|hilf|helf|plan|lieb|tee|party/.test(t)||who){const n=who||R(npcs);const good=Math.random()<0.5+s.cha/50;
  txt=good?`${n} hört dir zu. ${R(['Ein kleines Lächeln.','„Du bist anders…“','Ihr redet lange.'])}`:`${n} wirkt abweisend. ${R(['„Was willst du?“','Ein kalter Blick.','Unterbrochen.'])}`;
  ch={affinity:{[n]:good?rnd(8,18):-rnd(2,8)},trust:{[n]:good?rnd(4,10):-1},xp:15,cha:good&&Math.random()<.3?1:0}}
 else if(/train|üb|lern|magie|zauber|stud/.test(t)){const cost=Math.min(s.mp,rnd(5,15));txt=`Du trainierst. ${R(['Schweiß und Fortschritt.','Ein neues Gefühl.','Mühsam, aber lohnend.'])}`;
  ch={mp:-cost,xp:rnd(20,40),str:Math.random()<.5?1:0};if(Math.random()<.25)ch.newSkills=[{name:R(['Doppelschlag','Schildwall','Giftige Zunge','Schattenportal','Fallenbau','Kräuterkunde']),icon:'✨',desc:'Neu erlernt',level:1,cost:5,cd:0}]}
 else if(/ruh|schlaf|rast|ess|heil/.test(t)){txt='Du ruhst dich aus. Wärme kehrt zurück.';ch={hp:rnd(20,40),mp:rnd(10,25)}}
 else if(/intrig|lüg|schmied|spion|stehl|sabot/.test(t)){const ok=Math.random()<.55;txt=ok?'Dein Plan geht auf.':'Du wirst beinahe erwischt!';ch={xp:25,ruf:ok?rnd(-3,6):-10}}
 else if(/quest|auftrag|mission|hauptgeschichte|nebenquest/.test(t)){const m=S.quests?.main;txt=m?`Du denkst an dein Ziel: ${m.ziel}. Offene Punkte: ${(m.objectives||[]).filter(o=>!(m.done||[]).includes(o)).join(', ')||'keine'}.`:'Die Geschichte ist noch unklar.';ch={xp:10,choices:defChoices()}}
 else{const ev=R([['Du findest etwas Verstecktes!',{items:[{name:R(['Goldmünzen','Alte Karte','Zauberring']),icon:'📦',desc:'Gefunden',type:'misc'}],xp:20}],['Ein Händler hilft.',{xp:10,ruf:2}],['Eine Falle!',{hp:-rnd(8,18),xp:10}],['Ein Fremder flüstert deinen Namen.',{xp:15,ruf:3}],['Ruhige Gegend. Du lernst die Welt kennen.',{xp:20}]]);
  txt=`Du versuchst: „${a}“. ${ev[0]}`;ch=ev[1]}
 ch.choices=[...defChoices().sort(()=>Math.random()-.5).slice(0,3),R(['Ausruhen','Umgebung erkunden','Training'])];
 // soft quest progress offline
 if(S.quests?.main&&Math.random()<.2){const left=(S.quests.main.objectives||[]).filter(o=>!(S.quests.main.done||[]).includes(o));if(left.length){ch.quests={mainObjectiveDone:left[0]};txt+='\n\n(Etwas fügt sich: '+left[0]+')'}}
 return {text:txt,changes:ch}}

/* ---------- AI ---------- */
if(!cfg.v2){if(cfg.mode==='offline'||!cfg.mode)cfg.mode=hasKey()?'gemini':'gemini';cfg.v2=1;localStorage.setItem(CFG,JSON.stringify(cfg))}
const FREE_URL='https://text.pollinations.ai/openai';
const STREAM_DELIM='###DATA###';
function romanceHint(){const lines=[];for(const[n,r]of Object.entries(S.romance||{})){if((r.affection|0)>5||(r.stage|0)>0)lines.push(n+':'+stageName(r.stage)+'(♡'+r.affection+'/T'+r.trust+')')}
 return lines.length?'BEZIEHUNGEN: '+lines.slice(0,6).join('; ')+'. Stufen: Fremd→Bekannt→Freund→Vertraut→Verliebt→Partner. Keine expliziten Inhalte (13+). Eifersucht möglich.':'BEZIEHUNGEN: noch dünn – organisch wachsen lassen.'}
function questHint(){const m=S.quests?.main;if(!m)return '';const left=(m.objectives||[]).filter(o=>!(m.done||[]).includes(o));
 return `QUEST (organisch steuern, nicht railroading): Akt „${m.actTitel}“ – Ziel: ${m.ziel}. Offen: ${left.join('; ')||'–'}. Nebenquests: ${(S.quests.side||[]).filter(q=>q.status!=='erledigt').slice(0,3).map(q=>q.titel).join('; ')}. Markiere Fortschritt in JSON quests.` }
function greyPrompt(stream){const B=GREY||PACKS.grey||{kern:{}};const k=B.kern||{};return `Du bist der Erzähler eines interaktiven literarischen Horror-Romans auf Deutsch: „${B.titel||'Greymourne'}“.
SPIELFIGUR: ${S.pc.name}${S.kind==='darren'?' (Romanfigur)':' (eigene Figur; Darren kann als NPC existieren)'}. Hintergrund: ${S.pc.bg}
TON: ${k.ton||B.ton||'Leiser Horror.'}
STIL: ${k.stil||'Deutsche literarische Prosa, 2. Person.'}
REGELN: ${((k.regeln_der_stadt||[]).slice(0,8)).map((x,i)=>(i+1)+') '+x).join(' ')}
SPOILERSCHUTZ: ${k.spoilerschutz||''}
${romanceHint()}
${questHint()}
ERZÄHLREGELN: 1) Erster Satz reagiert direkt. Fragen werden beantwortet. 2) 2. Person, nie Erzähler-Ich. 3) Kein Splatter/Anime-Fenster. 4) NPCs eigenständig (können ablehnen). 5) 4-9 Sätze. 6) Romanzen: zurückhaltend, melancholisch, passend zur Stadt.
${stream?`AUSGABE: Erzähltext, dann Zeile „${STREAM_DELIM}“, dann JSON: choices[4], changes{verstand,schuld,affinity,trust,xp,items,removeItems}, summary, world{scene,npcUpdates,newLocations,ereignisse,scenePrompt?,speaker?}, speaker, scenePrompt (engl. Bildprompt zur Szene), quests{mainObjectiveDone?,advanceAct?,sideComplete?}, optional ending.`:`JSON mit narration, choices, changes, summary, world, speaker, scenePrompt, quests.`}`}
function voiceHint(){const pack=PACKS[S.role];if(!pack?.npcs)return '';
 return 'STIMMEN: '+Object.entries(pack.npcs).slice(0,6).map(([k,v])=>k+': '+(v.stimme||v.art||'').slice(0,60)).join(' | ')}
function sysPrompt(stream=true){if(isG())return greyPrompt(stream);const r=ROLES[S.role];const pack=PACKS[S.role]||{};
 return `Du bist Erzähler eines interaktiven Isekai-Anime auf Deutsch. SPIELER = Hauptfigur.
Protagonist: ${S.pc?.name||r.name}, ${r.cls[S.cls]}, Leben ${S.lives}. Welt: ${pack.titel||r.world}. Ton: ${pack.ton||''}
${voiceHint()}
${romanceHint()}
${questHint()}
GOLDENE REGELN:
1. Erster Satz reagiert DIREKT. Fragen beantworten. Absurde Aktionen → echte NPC-Reaktionen.
2. NPCs sind eigenständig: eigene Ziele, können ablehnen/widersprechen/von sich aus handeln.
3. Steuere zur Hauptgeschichte organisch (Gerüchte, Gelegenheiten) – kein Railroading, Spielerfreiheit.
4. Romanzen: Stufen Fremd→…→Partner, geschmackvoll (13+), keine expliziten Szenen.
5. Anime-Mittel sparsam: (Gedanke), [Status]. 4-9 Sätze, 2. Person.
6. WELT-JSON nur für Szene/Updates. Inventar/Skills nur bei echten Änderungen.
${stream?`AUSGABE: Erzähltext, dann „${STREAM_DELIM}“, dann JSON: choices[4], changes{hp,mp,str,cha,ruf,xp,gold,affinity,trust,items,newSkills,removeItems}, summary, world{scene,npcUpdates,newLocations,ereignisse,scenePrompt?,speaker?}, speaker (wer spricht sichtbar), scenePrompt (kurzer engl. Anime-Bildprompt zur Location/Key-Moment), quests{mainObjectiveDone?,advanceAct?,sideComplete?}, optional ending.`:`JSON: narration, choices, changes, summary, world, speaker, scenePrompt, quests.`}`}
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
function msgs(a){let h=(S.hist||[]).slice(-10);if(!h.length){const last=S.log.filter(m=>m.k==='n').slice(-1)[0];if(last)h=[{role:'assistant',content:last.t}]}
 return [{role:'system',content:sysPrompt(false)},...h,{role:'user',content:turnMsg(a)}]}
function turnMsg(a){return (leanLore(a)?leanLore(a)+'\n':'')+worldText()+'\n'+(S.summary?'BISHER: '+S.summary+'\n':'')+stateSum()+'\n'+questHint()+'\n'+(isG()?'DIE SPIELFIGUR':'DER SPIELER')+' sagt/tut: „'+a+'“\n(Zuerst direkte Reaktion. NPCs können ablehnen.)'}
function parse(raw){let m=raw.match(/```(?:json)?\s*([\s\S]*?)```/)||raw.match(/(\{[\s\S]*\})\s*$/);let ch=null;
 if(m){try{ch=JSON.parse(m[1].trim())}catch(e){try{ch=JSON.parse(m[1].replace(/,\s*}/g,'}').replace(/'/g,'"'))}catch(_){}}}
 const text=(m?raw.replace(m[0],''):raw).replace(/```[\s\S]*$/,'').replace(/^\s*\d[.)]\s.*$/gm,'').replace(/\n*(Wie|Was) (willst|wirst|tust) du[^\n]*\?\s*$/,'').trim();return {text:text||'…',changes:ch||{xp:10}}}
function parseStream(raw){const i=raw.indexOf(STREAM_DELIM);if(i<0){const j=raw.lastIndexOf('{');if(j>0){const nar=raw.slice(0,j).trim();const o=gJSON(raw.slice(j));if(o)return packStream(nar||o.narration||o.text||'…',o)}return parse(raw)}
 const nar=raw.slice(0,i).trim();const o=gJSON(raw.slice(i+STREAM_DELIM.length).trim())||{};return packStream(nar||o.narration||'…',o)}
function packStream(text,o){const ch=Object.assign({},o.changes||{});if(o.choices)ch.choices=o.choices;if(o.summary)ch.summary=o.summary;if(o.world)ch.world=o.world;if(o.ending)ch.ending=o.ending;if(o.quests)ch.quests=o.quests;
 if(o.speaker)ch.speaker=o.speaker;if(o.scenePrompt)ch.scenePrompt=o.scenePrompt;if(o.imagePrompt)ch.scenePrompt=o.imagePrompt;
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
function gBody(a){const contents=[];for(const m of (S.hist||[]).slice(-10)){const role=m.role==='assistant'?'model':'user';const last=contents[contents.length-1];
  if(last&&last.role===role)last.parts[0].text+='\n'+m.content;else contents.push({role,parts:[{text:m.content}]})}
 if(contents[0]&&contents[0].role==='model')contents.unshift({role:'user',parts:[{text:'(Spielbeginn)'}]});
 contents.push({role:'user',parts:[{text:turnMsg(a)}]});
 return {systemInstruction:{parts:[{text:sysPrompt(true)}]},contents,generationConfig:{temperature:.9,maxOutputTokens:800},safetySettings:G_SAFE}}
function friendlyAIFail(){return 'Die Erzählerin stockt kurz. Versuch es noch einmal – oder spiele ohne sie weiter.'}
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
 const st=await gmFetch(key);const base=gBody(a);const order=gmOrder(st);let last,tried=0;
 for(const m of order){if(tried>=2)break;tried++;
  el.classList.add('typing');el.textContent='…';
  let think=thinkingCfg(m),attempt=0;
  while(attempt++<2){const body=JSON.parse(JSON.stringify(base));
   if(think)body.generationConfig.thinkingConfig=think;else delete body.generationConfig.thinkingConfig;
   let res;try{res=await fetchWithTimeout(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(m)}:streamGenerateContent?alt=sse`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify(body)},G_TIMEOUT)}
   catch(e){last=gErr(friendlyAIFail());break}
   if(res.ok){let raw='';try{raw=await readSSE(res,r=>showNarration(el,r))}catch(_){last=gErr(friendlyAIFail());break}
    const packed=parseStream(raw);if(packed&&packed.text&&packed.text!=='…'){const s2=gmStore();s2.chosen=m;if(s2.fail)delete s2.fail[m];gmSave(s2);gmUI();return {...packed,model:m}}
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
function setBusy(on){busy=!!on;const txt=$('#txt'),btn=$('#inputRow button'),ch=$('#choices');if(txt)txt.disabled=on;if(btn)btn.disabled=on;if(ch)ch.querySelectorAll('button').forEach(b=>b.disabled=on);document.body.classList.toggle('busy',on)}
async function act(a){if(busy||!a.trim())return;
 // Intro free-text
 if(_mode==='intro'){await actIntro(a);return}
 if(S&&S.setup&&!S.setup.done){
   // allow free text during setup as custom choice
   const pack=S._setupPack;const beat=S._setupBeat;if(beat){pickSetup({label:a.trim(),past:a.trim().slice(0,80)});return}
 }
 if(!S||!S.setup?.done)return;
 setBusy(true);const t0=performance.now();try{await loadPack(S.role)}catch(_){}
 // show player intent briefly
 const prevSp=$('#speaker').textContent;$('#speaker').textContent='Du';$('#speaker').classList.remove('hidden');$('#vnText').textContent='„'+a+'“';
 S.turn++;S.log.push({k:'p',t:a});
 $('#vnText').innerHTML='<span class="caret">Schreibe</span>';let res;let softFail=false;const el=$('#vnText');
 try{if(cfg.mode==='offline')throw 0;
  if(cfg.mode==='gemini'||(cfg.mode!=='webllm'&&cfg.mode!=='api'&&cfg.mode!=='free'&&hasKey())){
   try{res=await gemini(a,el)}catch(e){softFail=true;el.textContent='…'}}
  if(!res&&(cfg.mode==='free'||softFail||(cfg.mode!=='gemini'&&cfg.mode!=='webllm'&&cfg.mode!=='api'&&cfg.mode!=='offline'))){
   try{const raw=await aiTurn(a,el,'free');let p=raw.includes(STREAM_DELIM)?parseStream(raw):parse(raw);if(p&&p.text&&p.text!=='…'&&p.text.length>8){res=p;softFail=false}}catch(_){}}
  if(!res&&cfg.mode!=='gemini'&&cfg.mode!=='free'){const raw=await aiTurn(a,el,cfg.mode);res=parse(raw)}
  if(!res){res=offline(a);softFail=true}
  {const c=res.changes,lim={hp:30,mp:30,str:2,cha:2,ruf:5,xp:60,verstand:15,schuld:5,gold:50};for(const k in lim)if(k in c)c[k]=Math.max(-lim[k],Math.min(lim[k],+c[k]||0));if(c.affinity)for(const n in c.affinity)c.affinity[n]=Math.max(-15,Math.min(15,+c.affinity[n]||0));if(c.trust)for(const n in c.trust)c.trust[n]=Math.max(-10,Math.min(10,+c.trust[n]||0))}
  if(Array.isArray(res.changes.items))res.changes.items=res.changes.items.filter(x=>{const n=typeof x==='string'?x:x.name;return !invNames().includes(n)});
  if(Array.isArray(res.changes.newSkills))res.changes.newSkills=res.changes.newSkills.filter(x=>{const n=typeof x==='string'?x:x.name;return !skillNames().includes(n)});
  if(res.changes.summary){S.summary=String(res.changes.summary).slice(0,800);delete res.changes.summary}
  if(res.changes.speaker){S.flags.speaker=String(res.changes.speaker).slice(0,40);delete res.changes.speaker}
  if(res.changes.scenePrompt){S.flags.scenePrompt=String(res.changes.scenePrompt).slice(0,220);setSceneImage(S.flags.scenePrompt,'ai_'+S.turn);delete res.changes.scenePrompt}
  if(res.changes.world){try{applyWorld(res.changes.world)}catch(_){}delete res.changes.world}
  if(res.changes.quests){try{applyQuestUpdate(res.changes.quests)}catch(_){}delete res.changes.quests}
  S.hist=S.hist||[];S.hist.push({role:'user',content:'SPIELER: '+a},{role:'assistant',content:res.text});S.hist=S.hist.slice(-20);
  if(softFail)res.note=friendlyAIFail()}
 catch(e){res=offline(a);res.note=friendlyAIFail()}
 _dbgMs=Math.round(performance.now()-t0);
 S.log.push({k:'n',t:res.text});if(S.log.length>80)S.log=S.log.slice(-80);
 const sp=S.flags?.speaker||(isG()?'Nebel':'Erzähler');
 setPortraitFromSpeaker(S.flags?.speaker);
 await typewriteAsync(sp,res.text);
 if(res.note)pushSys(res.note);apply(res.changes);
 try{worldTick()}catch(_){}
 maybeSceneFromWorld();
 hud();renderChoices();save();setBusy(false);requestAnimationFrame(()=>{const t=$('#txt');if(t)t.focus({preventScroll:true})})}


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
function showTitle(){_mode='title';$('#stage').classList.add('hidden');$('#keyGate').classList.add('hidden');$('#title').classList.remove('hidden');
 document.body.classList.remove('greyw');
 const sv=localStorage.getItem(KEY);if(sv)$('#btnContinue').classList.remove('hidden');else $('#btnContinue').classList.add('hidden');
 runParticles()}

$('#btnNew').onclick=()=>startIntro();
$('#btnGreyBook').onclick=()=>startGreyBook();
$('#btnContinue').onclick=async()=>{const sv=localStorage.getItem(KEY);if(!sv)return;S=migrate(sv);try{await loadPack(S.role)}catch(_){}
 if(!S.world&&PACKS[S.role])S.world=buildWorldFromPack(PACKS[S.role],S.role);gateOrShow()};
$('#btnMusic').onclick=toggleMusic;
$('#btnTitleSettings').onclick=openSheet;
$('#btnSettings').onclick=openSheet;
$('#btnMenu').onclick=()=>openMenu(_menuTab||'status');
$('#btnMenuClose').onclick=closeMenu;
$('#menu').addEventListener('click',e=>{if(e.target.id==='menu')closeMenu()});
$$('#menuTabs button').forEach(b=>b.onclick=()=>{_menuTab=b.dataset.tab;$$('#menuTabs button').forEach(x=>x.classList.toggle('on',x.dataset.tab===_menuTab));renderMenu()});

$('#inputRow').onsubmit=e=>{e.preventDefault();const v=$('#txt').value;$('#txt').value='';
 if(_mode==='intro'){actIntro(v);return}
 if(_mode==='intro'||!S){/* grey own name via text */ const t=v.trim();if(t&&document.body.classList.contains('greyw')&&!S){newGrey('own',t,'');return}}
 act(v)};

const sync=()=>{$('#webllmBox').style.display=$('#mode').value==='webllm'?'':'none';$('#apiBox').style.display=$('#mode').value==='api'?'':'none'};
function openSheet(){$('#mode').value=cfg.mode||'gemini';$('#wmodel').value=cfg.wmodel||$('#wmodel').value;$('#aurl').value=cfg.aurl||'';$('#akey').value=cfg.akey||'';$('#amodel').value=cfg.amodel||'';$('#gkey').value=cfg.gkey||'';
 if($('#dbgToggle'))$('#dbgToggle').checked=!!cfg.debug;gmUI();sync();$('#sheet').classList.remove('hidden')}
$('#mode').onchange=sync;$('#btnClose').onclick=()=>$('#sheet').classList.add('hidden');
$('#gkey').oninput=()=>{if($('#gkey').value.trim())$('#mode').value='gemini';sync()};
function saveCfgFromUI(gk){const mode=$('#mode')?$('#mode').value:(gk?'gemini':'offline');
 cfg={v2:1,gkey:gk,mode:gk&&(!cfg.gkey||cfg.gkey!==gk)?'gemini':mode,wmodel:$('#wmodel')?.value,aurl:$('#aurl')?.value,akey:$('#akey')?.value,amodel:$('#amodel')?.value,debug:!!($('#dbgToggle')&&$('#dbgToggle').checked)};
 localStorage.setItem(CFG,JSON.stringify(cfg));
 const st=gmStore();if($('#gmodel'))st.manual=$('#gmodel').value||'';gmSave(st);
 if(gk)gmFetch(gk,true).then(()=>gmProbe(gk).catch(()=>{}));
 dbgLine();return cfg}
$('#btnSave').onclick=()=>{const gk=$('#gkey').value.trim();saveCfgFromUI(gk);
 toast(gk?'Gespeichert – die Geschichte kann beginnen.':(cfg.mode==='offline'?'Offline gespeichert':'Gespeichert'));
 $('#sheet').classList.add('hidden')};
$('#btnLoad').onclick=()=>{cfg.wmodel=$('#wmodel').value;engine=null;loadWebLLM().catch(e=>$('#wstatus').textContent='❌ '+e.message)};
$('#btnReset').onclick=()=>{if(confirm('Wirklich alles löschen?')){localStorage.removeItem(KEY);location.reload()}};
$('#btnAdv').onclick=()=>{$('#advBox').classList.toggle('hidden');$('#btnAdv').textContent=$('#advBox').classList.contains('hidden')?'Erweitert ▸':'Erweitert ▾'};
$('#btnGateSave').onclick=()=>{const gk=$('#gateKey').value.trim();if(!gk){toast('Bitte Schlüssel einfügen');return}
 cfg.gkey=gk;cfg.mode='gemini';cfg.v2=1;localStorage.setItem(CFG,JSON.stringify(cfg));
 toast('Alles bereit.');gmFetch(gk,true).then(()=>gmProbe(gk).catch(()=>{}));enterPlay()};
$('#btnGateSkip').onclick=()=>{cfg.mode='offline';cfg.v2=1;localStorage.setItem(CFG,JSON.stringify(cfg));enterPlay()};

window.__game={newGrey,greyDetails,loadGrey,loadPack,get S(){return S},act,newLife,gBody,msgs,gmRank,gmProbe,parseStream,thinkingCfg,gmOrder,readSSE,STREAM_DELIM,migrate,worldTick,bumpRel,openMenu,stageName,offline,startIntro,setSceneImage,setPortrait,imgUrl,advanceTime,phaseLabel,typewrite,enterPlay,showTitle,analyzeImage,applySceneTheme,themeFromText,loadValidatedImage,openingNarration};
window.__game.askNPC=a=>askNPC(a);window.__game.gemini=gemini;
if(cfg.gkey)gmFetch(cfg.gkey.trim()).then(()=>gmProbe(cfg.gkey.trim()).catch(()=>{})).catch(()=>{});
(function(){const root=document.documentElement;const apply=()=>{try{const vv=window.visualViewport;if(!vv)return;const kb=Math.max(0,window.innerHeight-vv.height-vv.offsetTop);root.style.setProperty('--kb',kb+'px')}catch(_){}};
 if(window.visualViewport){visualViewport.addEventListener('resize',apply);visualViewport.addEventListener('scroll',apply)}
 window.addEventListener('focusin',e=>{if(e.target&&e.target.id==='txt'){setTimeout(()=>{try{e.target.scrollIntoView({block:'end',behavior:'smooth'})}catch(_){};apply()},300)}});
 $('#txt')&&$('#txt').addEventListener('blur',()=>root.style.setProperty('--kb','0px'))})();
try{if('serviceWorker' in navigator&&navigator.serviceWorker){navigator.serviceWorker.register('./sw.js?v=11').catch(()=>{});
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(sessionStorage.getItem('isekai_sw_reloaded'))return;sessionStorage.setItem('isekai_sw_reloaded','1');location.reload()})}}catch(_){}
showTitle();
