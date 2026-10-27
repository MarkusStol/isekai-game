const $=s=>document.querySelector(s);const R=a=>a[Math.floor(Math.random()*a.length)];const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const ROLES={
 held:{e:'⚔️',name:'Held mit Status-System',d:'Ein blaues Fenster erscheint: [Status]. Die Welt braucht dich.',world:'Königreich Aldheim, bedroht vom Dämonenheer',
  base:{hp:100,mp:40,str:12,cha:8,ruf:10},skills:['Status-Fenster','Schwertschlag'],inv:['Bronzeschwert','Heiltrank'],
  npcs:{Lyra:'Elfische Bogenschützin, misstrauisch',Garrick:'Polternder Söldner',Prinzessin_Elise:'Beschwört dich, kühl & stolz'},
  cls:['Abenteurer','Ritter','Held','Legendärer Held']},
 villainess:{e:'🌹',name:'Villainess',d:'Du erwachst als Lady Rosalind – die Schurkin aus einem Otome-Roman. Dein Untergang ist in 1 Jahr.',world:'Akademie von Lumière, Hofintrigen',
  base:{hp:70,mp:60,str:5,cha:16,ruf:-20},skills:['Romanwissen','Eleganter Fächerhieb'],inv:['Seidenfächer','Tagebuch der Zukunft'],
  npcs:{Kronprinz_Julian:'Dein Verlobter, hasst dich',Heldin_Mira:'Die Protagonistin, zu nett',Ritter_Cedric:'Stiller Leibwächter'},
  cls:['Verstoßene Lady','Salonlöwin','Herzogin','Kaiserin der Intrige']},
 daemon:{e:'😈',name:'Dämonenkönig',d:'Du erwachst auf einem Thron aus Knochen. Deine Diener knien – und ein Held ist unterwegs.',world:'Das Dunkle Reich Nocturna',
  base:{hp:160,mp:120,str:20,cha:6,ruf:-50},skills:['Dunkle Aura','Höllenflamme'],inv:['Krone der Nacht'],
  npcs:{Sekretärin_Velka:'Sukkubus-Beraterin, loyal',General_Brok:'Ork-General, will Krieg',Heldin_Aria:'Die Heldin, die dich töten will'},
  cls:['Gefallener Fürst','Dämonenlord','Dämonenkönig','Gott der Nacht']},
 mensch:{e:'🧑',name:'Normaler Mensch',d:'Keine Kräfte, kein Status. Nur du, ein Dorf und viel Hoffnung.',world:'Dorf Kleinbach am Waldrand',
  base:{hp:60,mp:0,str:6,cha:8,ruf:0},skills:['Moderne Bildung'],inv:['Holzstock','Brotkanten'],
  npcs:{Wirtin_Hanna:'Gutmütige Tavernenwirtin',Jäger_Tom:'Rauer Jäger',Hexe_Morgana:'Mysteriöse Waldhexe'},
  cls:['Dorfbewohner','Lehrling','Meister','Ungekrönter Legende']},
 grey:{e:'🌫️',name:'Greymourne',d:'Ein Nachtzug hält, wo er nicht halten dürfte.',world:'Greymourne, eine Stadt hinter dem Nebel, die auf keiner Karte steht',
  base:{hp:100,mp:0,str:0,cha:0,ruf:0},skills:['Nach Unwichtigem fragen'],inv:['Fahrkarte ohne Rückfahrt','Reisetasche'],
  npcs:{Velicya:'',Marlowe:'',Elias:'',Mascha:''},cls:['Fahrgast','Gast im Eisernen Licht','Eingetragen','Wer durch den Nebel kommt'],hidden:1}
};
const ISEKAI=Object.keys(ROLES).filter(k=>!ROLES[k].hidden);const isG=()=>S&&S.role==='grey';
let GREY=null;async function loadGrey(){if(!GREY)GREY=await (await fetch('worlds/greymourne.json?v=7')).json();return GREY}
const GINTRO_DARREN=`Der Zug hätte nicht halten dürfen.\n\nAuf deiner Fahrkarte steht Blackmere, zwei Stationen weiter nördlich. Kurz nach Mitternacht verliert das Rattern der Räder seinen Takt – erst fehlt jeder zwölfte Schlag, dann jeder sechste. Die Messinglampe im Abteil hängt plötzlich vollkommen still, obwohl der Zug noch fährt.\n\nGegenüber schläft ein Soldat mit offenem Mund. Eine alte Frau strickt an einem grauen Handschuh und hat seit der Abfahrt nicht ein einziges Mal aus dem Fenster gesehen. Ein Junge in Sonntagskleidung liest ein Buch, dessen Seiten er nie umblättert.\n\nVor dem Fenster liegt Nebel wie trübes Wasser. Und außen auf der Scheibe, im Ruß: der Abdruck einer kleinen Hand. Fünf Finger, der Daumen schräg abgespreizt.\n\nDie Bremsen greifen. Die alte Frau zieht ihre Masche fest und legt die Nadeln quer über den Korb.\n„Sie sollten sitzen bleiben“, sagt sie.\n\nDraußen erscheint ein Schild an eisernen Pfosten. GREYMOURNE. Darunter, bis zur Brust im Nebel, steht ein Mädchen in einem hellen Mantel. Es hebt den Kopf.`;
const GINTRO_OWN=(n,bg)=>`Der Zug hätte nicht halten dürfen.\n\nDu – ${n}. ${bg}. Seit Tagen hast du kaum geschlafen, und wenn du die Augen schließt, fällst du nicht in Träume, sondern in Räume. Jetzt sitzt du in einem Nachtzug, dessen Räder kurz nach Mitternacht ihren Takt verlieren. Die Messinglampe im Abteil hängt still, obwohl der Zug noch fährt.\n\nNeben dir strickt eine alte Frau an einem grauen Handschuh. Gegenüber hält ein unrasierter Mann mit Reisetasche eine Fahrkarte so fest, dass das Papier weich geworden ist; unter seiner Manschette zieht sich eine helle Narbe über den Unterarm. Er starrt auf das Fenster. Außen im Ruß: der Abdruck einer kleinen Hand.\n\nDie Abteiltür geht auf, ohne dass Schritte zu hören waren. Ein Schaffner in feucht glänzender Uniform, die Augen im Schatten der Mütze.\n„Fahrkarten.“\n\nAls du ihm deine reichst, dreht er sie um. Auf der Rückseite steht in violetter Tinte dein Name. Darunter hat jemand etwas gezeichnet – etwas, das du kennst und das du verloren hast.\n\nDraußen gleitet ein Schild in den Nebel: GREYMOURNE.\nDie alte Frau sagt, ohne aufzusehen: „Lassen Sie sich nicht beim vollen Namen rufen.“`;
const INTRO={
 held:`🚚 Hupen. Scheinwerfer. Ein dumpfer Schlag – dann nur noch weißes Rauschen.\n\nDu öffnest die Augen auf kaltem Marmor. Über dir glüht ein riesiger Beschwörungskreis aus, Weihrauch brennt in deiner Nase, und ein Dutzend Ritter starrt dich mit offenen Mündern an.\n\n[STATUS] Name: ??? · Klasse: Abenteurer · Lv 1 · Einzigartige Fähigkeit: Status-Fenster\n\nEin blaues Fenster schwebt direkt vor deinem Gesicht. Bevor du es wegwischen kannst, tritt eine junge Frau mit silberner Tiara vor – Prinzessin Elise. Ihr Blick ist eisig, aber ihre Hände zittern.\n„Endlich … der Held aus der anderen Welt.“ Sie mustert deine Kleidung, als wäre sie ein schlechter Witz. „Sag mir, dass du kämpfen kannst. Das Dämonenheer steht drei Tage vor unseren Mauern.“\n\n(Was sagst oder tust du?)`,
 villainess:`🚚 Ein Lastwagen. Ein Knall. Und das Letzte, was du denkst: „Ich hab das Otome-Spiel nicht mal durchgespielt …“\n\nDu erwachst vor einem goldgerahmten Spiegel. Darin: blutrote Locken, ein arroganter Mund, ein Seidenfächer in der Hand – Lady Rosalind von Ashcroft. Die Schurkin. Die, die im Finale hingerichtet wird.\n\n[SYSTEM] Romanwissen aktiviert · Verbleibende Zeit bis zum Untergang: 365 Tage\n\nDie Tür fliegt auf. Kronprinz Julian steht im Rahmen, hinter ihm die zitternde Mira mit verschüttetem Tee auf dem Kleid. „Rosalind!“, zischt er. „Hast du Mira schon WIEDER gestoßen? Erklär dich – sofort.“\n(Moment … das ist exakt die Szene aus Kapitel 1. Die, mit der alles schiefgeht.)\n\n(Was sagst oder tust du?)`,
 daemon:`🚚 Licht, Schmerz – und dann eine Stimme, tief wie ein Abgrund: „Erhebe dich.“\n\nDu sitzt auf einem Thron aus Knochen. Schwarze Flammen lecken an den Säulen, und unter dir knien hunderte Monster – Orks, Skelette, Schattenwesen – mit gesenkten Köpfen.\n\n[STATUS] Titel: Gefallener Fürst · Lv 1 · Aura: ÜBERWÄLTIGEND · Warnung: Ein Held wurde beschworen.\n\nEine Sukkubus mit Brille und Klemmbrett tritt an deine Seite – Velka. „Willkommen zurück, mein König. Sie haben dreihundert Jahre geschlafen.“ Sie räuspert sich. „Kurzer Lagebericht: Die Kasse ist leer, General Brok will sofort Krieg, und die neue Heldin Aria marschiert auf uns zu. Ihre Befehle?“\nGeneral Brok schlägt die Faust auf die Brust. „KRIEG, Herr! Sagt nur das Wort!“\n\n(Was sagst oder tust du?)`,
 mensch:`🚚 Bremsen quietschen. Dunkelheit. Dann – Vogelgezwitscher und ein Stock, der dir in die Rippen piekst.\n\nDu liegst in einem Heuhaufen am Rand eines Dorfes. Fachwerkhäuser, Matschwege, ein Schild: „Kleinbach“. Kein blaues Fenster. Keine Göttin. Keine Cheat-Skills. Nur dein knurrender Magen.\n\nÜber dir steht ein bärtiger Mann mit Bogen und einem toten Hasen über der Schulter – Jäger Tom. Er piekst noch einmal. „Lebst du noch? Komische Kleidung hast du.“ Er kneift die Augen zusammen. „Bist du einer von den Wegelagerern, oder hat dich die Hexe aus dem Wald ausgespuckt?“\nAus der Taverne ruft eine Frauenstimme: „Tom! Lass den armen Kerl in Ruhe und bring ihn rein!“\n\n(Was sagst oder tust du?)`
};
const WORLD={
 held:{scene:{ort:'Beschwörungshalle im Königspalast von Aldheim',zeit:'Abend, Fackellicht',anwesend:['Prinzessin Elise','Hofmagier Orren','ein Dutzend Ritter']},
  orte:{'Beschwörungshalle':'Marmorhalle mit glühendem Beschwörungskreis, Weihrauchgeruch','Hauptstadt Aldheim':'Belagerte Königsstadt mit hohen weißen Mauern','Söldnergilde':'Laute Gildenhalle, Garricks Stammplatz','Nordwall':'Mauer, vor der das Dämonenheer lagert'},
  npcs:{'Prinzessin Elise':{art:'kühl, stolz, spricht förmlich, insgeheim verzweifelt',ziel:'Das Königreich retten',geheimnis:'Die Beschwörung hat ihren Vater das Leben gekostet',beziehung:'misstrauische Beschwörerin',erinnerung:[]},
   'Lyra':{art:'elfische Bogenschützin, wortkarg, spöttisch',ziel:'Ihren verschollenen Bruder finden',geheimnis:'Spionin des Elfenrats',beziehung:'noch unbekannt',erinnerung:[]},
   'Garrick':{art:'polternder Söldner, lacht laut, redet derb',ziel:'Gold und ein letzter großer Kampf',geheimnis:'Desertierte einst aus der Königsarmee',beziehung:'noch unbekannt',erinnerung:[]},
   'Hofmagier Orren':{art:'alter, nervöser Magier, murmelt Formeln',ziel:'Seinen Fehler bei der Beschwörung vertuschen',geheimnis:'Er hat den falschen Helden beschworen?',beziehung:'beobachtet dich ängstlich',erinnerung:[]}},
  ereignisse:['Das Dämonenheer steht drei Tage vor dem Nordwall','Der Adel zweifelt an der Beschwörung']},
 villainess:{scene:{ort:'Rosalinds Gemach in der Akademie von Lumière',zeit:'Morgen, Sonnenlicht durch Spitzenvorhänge',anwesend:['Kronprinz Julian','Heldin Mira']},
  orte:{'Rosalinds Gemach':'Prunkvolles Zimmer mit goldgerahmtem Spiegel','Akademie-Rosengarten':'Ort der berüchtigten Teepartys','Ballsaal':'Hier findet in einem Jahr die Verurteilung statt'},
  npcs:{'Kronprinz Julian':{art:'kalt, selbstgerecht, scharfe Zunge',ziel:'Die Verlobung lösen',geheimnis:'Fühlt sich vom Hof erdrückt',beziehung:'verachtet dich',erinnerung:[]},
   'Heldin Mira':{art:'überfreundlich, tollpatschig, entschuldigt sich ständig',ziel:'Von allen gemocht werden',geheimnis:'Weiß vielleicht mehr, als sie zeigt',beziehung:'fürchtet dich',erinnerung:[]},
   'Ritter Cedric':{art:'stiller Leibwächter, kurze Sätze, loyal',ziel:'Rosalind beschützen, egal was',geheimnis:'Schwärmt heimlich für dich',beziehung:'treuer Schatten',erinnerung:[]}},
  ereignisse:['365 Tage bis zur Verurteilung im Ballsaal','Gerüchte, Rosalind habe Mira gestoßen']},
 daemon:{scene:{ort:'Thronsaal der Nachtfestung, Nocturna',zeit:'Ewige Nacht, schwarze Flammen',anwesend:['Sekretärin Velka','General Brok','hunderte kniende Monster']},
  orte:{'Thronsaal':'Knochenthron, schwarze Flammen an den Säulen','Schatzkammer':'Fast leer','Kasernen':'Brok\'s Orks trainieren lärmend','Grenzpass':'Weg, auf dem die Heldin anrückt'},
  npcs:{'Sekretärin Velka':{art:'Sukkubus mit Brille, sachlich, trocken-ironisch, loyal',ziel:'Das Reich vor dem Bankrott retten',geheimnis:'Hat den alten König vergiftet?',beziehung:'ergebene Beraterin',erinnerung:[]},
   'General Brok':{art:'Ork, brüllt, will immer Krieg',ziel:'Ruhm in der Schlacht',geheimnis:'Kann nicht lesen',beziehung:'fanatisch treu',erinnerung:[]},
   'Heldin Aria':{art:'entschlossen, idealistisch, heißblütig',ziel:'Den Dämonenkönig töten',geheimnis:'Zweifelt an der Kirche, die sie schickte',beziehung:'Todfeindin (noch nie getroffen)',erinnerung:[]}},
  ereignisse:['Die Heldin Aria marschiert auf Nocturna zu','Die Kriegskasse ist leer']},
 mensch:{scene:{ort:'Heuhaufen am Dorfrand von Kleinbach',zeit:'Früher Morgen, Tau, Vogelgezwitscher',anwesend:['Jäger Tom']},
  orte:{'Taverne „Zum Krummen Kessel“':'Warme Stube, Hannas Eintopf','Dunkelwald':'Hier lebt die Hexe','Dorfplatz':'Brunnen, Schwarzes Brett'},
  npcs:{'Wirtin Hanna':{art:'gutmütig, resolut, mütterlich',ziel:'Die Taverne über den Winter bringen',geheimnis:'Ihr Mann verschwand im Dunkelwald',beziehung:'noch unbekannt',erinnerung:[]},
   'Jäger Tom':{art:'rau, wortkarg, misstrauisch, trockener Humor',ziel:'Das Dorf vor Wölfen schützen',geheimnis:'Hat Angst vor der Hexe',beziehung:'misstrauisch',erinnerung:[]},
   'Hexe Morgana':{art:'rätselhaft, spricht in Andeutungen',ziel:'Ein Ritual vollenden',geheimnis:'Sie hat dich hierher gerufen',beziehung:'beobachtet dich aus der Ferne',erinnerung:[]}},
  ereignisse:['Wölfe reißen Schafe am Waldrand','Steuereintreiber kommen in einer Woche']}
};
function worldText(){const w=S.world;if(!w)return '';
 const scene=w.scene||{};const present=new Set((scene.anwesend||[]).map(String));
 const histTxt=((S.hist||[]).slice(-6).map(h=>h.content).join(' ')+' '+(S.summary||'')).toLowerCase();
 const npcs={};for(const[k,v]of Object.entries(w.npcs||{})){const hit=present.has(k)||k.toLowerCase().split(/[ \/–_-]+/).some(p=>p.length>3&&histTxt.includes(p));if(!hit)continue;
  const o={art:v.art,beziehung:v.beziehung,ziel:v.ziel};const mem=(v.erinnerung||[]).slice(-2);if(mem.length)o.erinnerung=mem;if(S.turn>=40&&v.geheimnis)o.geheimnis=v.geheimnis;npcs[k]=o}
 const orte={};for(const[k,v]of Object.entries(w.orte||{})){const key=k.toLowerCase().split(/[ \/–]/)[0];if(String(scene.ort||'').toLowerCase().includes(key)||histTxt.includes(key))orte[k]=v}
 return 'WELT (kompakt):\n'+JSON.stringify({scene,npcs,orte,ereignisse:(w.ereignisse||[]).slice(0,4)})}
function applyWorld(u){if(!u||!S.world)return;const w=S.world;const cut=(x,n)=>String(x||'').slice(0,n);
 if(u.scene&&u.scene.ort)w.scene={ort:cut(u.scene.ort,80),zeit:cut(u.scene.zeit,60),anwesend:(u.scene.anwesend||[]).slice(0,8).map(x=>cut(x,40))};
 (u.npcUpdates||[]).forEach(n=>{if(!n||!n.name)return;let k=Object.keys(w.npcs).find(x=>x.toLowerCase()===String(n.name).toLowerCase());
  if(!k){if(Object.keys(w.npcs).length>=14)return;k=cut(n.name,40);w.npcs[k]={art:'',ziel:'',geheimnis:'',beziehung:'',erinnerung:[]}}const p=w.npcs[k];
  ['art','ziel','geheimnis','beziehung'].forEach(f=>{if(n[f])p[f]=cut(n[f],120)});if(n.erinnerung){p.erinnerung.push(cut(n.erinnerung,140));p.erinnerung=p.erinnerung.slice(-6)}});
 (u.newLocations||[]).forEach(l=>{if(l&&l.name&&Object.keys(w.orte).length<16)w.orte[cut(l.name,50)]=cut(l.desc,140)});
 if(Array.isArray(u.ereignisse)&&u.ereignisse.length)w.ereignisse=u.ereignisse.slice(0,6).map(x=>cut(x,140))}
const KEY='isekai_save_v1',CFG='isekai_cfg_v1';
let S=null,cfg=JSON.parse(localStorage.getItem(CFG)||'{"mode":"gemini"}'),engine=null,busy=false,_dbgMs=0;
const save=()=>localStorage.setItem(KEY,JSON.stringify(S));
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('on'),2200)}
function hasKey(){return !!(cfg.gkey||'').trim()}
function wantAI(){return cfg.mode!=='offline'}
function gateOrShow(){if(wantAI()&&!hasKey()&&cfg.mode!=='webllm'&&cfg.mode!=='api'){showKeyGate();return}show()}
function showKeyGate(){$('#start').classList.add('hidden');$('#game').classList.add('hidden');const g=$('#keyGate');if(g){g.classList.remove('hidden');$('#gateKey').value='';setTimeout(()=>$('#gateKey').focus(),50)}}
function dbgLine(){let el=$('#dbg');if(!cfg.debug){if(el)el.remove();return}if(!el){el=document.createElement('div');el.id='dbg';el.className='dbg';$('#game').appendChild(el)}el.textContent=_dbgMs?('Zug '+_dbgMs+' ms'):'–'}

function newLife(role,meta){const r=ROLES[role];meta=meta||{lives:0,soul:0,keptSkills:[]};
 const b=meta.soul;S={role,lives:meta.lives+1,soul:b,
  st:{hp:r.base.hp+b*5,maxhp:r.base.hp+b*5,mp:r.base.mp+b*3,maxmp:r.base.mp+b*3,str:r.base.str+b,cha:r.base.cha+b,ruf:r.base.ruf,lvl:1,xp:0},
  skills:[...new Set([...r.skills,...meta.keptSkills])],inv:[...r.inv],aff:Object.fromEntries(Object.keys(r.npcs).map(k=>[k,0])),
  cls:0,turn:0,hist:[],log:[],flags:{}};
 const intro=(meta.lives?`${r.e} Reinkarnation #${S.lives}. Wieder dieses weiße Licht – und diesmal erinnert sich deine Seele (Seelenfragmente: ${b}).\n\n`:'')+INTRO[role];
 S.world=JSON.parse(JSON.stringify(WORLD[role]));S.hist=[{role:'assistant',content:INTRO[role]}]; add('n',intro);S.choices=defChoices();save();gateOrShow();}
function defChoices(){const r=S.role;return {grey:['Sitzen bleiben','Aus dem Fenster sehen','Die alte Frau fragen','Nach etwas Unwichtigem fragen'],held:['Monster jagen','Mit Lyra reden','Training im Hof','Die Stadt erkunden'],villainess:['Mit dem Kronprinzen sprechen','Mira helfen','Intrige schmieden','Teeparty besuchen'],daemon:['Armee befehligen','Mit Velka planen','Die Heldin ausspionieren','Dunkle Magie üben'],mensch:['In der Taverne arbeiten','Mit Tom jagen gehen','Die Hexe besuchen','Ausruhen']}[r]}
function add(k,t){S.log.push({k,t});if(S.log.length>80)S.log.shift();renderMsg(k,t)}
function renderMsg(k,t){const d=document.createElement('div');d.className='msg '+k;d.textContent=t;$('#log').appendChild(d);d.scrollIntoView({behavior:'smooth',block:'end'});return d}
function hud(){if(isG())return hudG();const s=S.st,r=ROLES[S.role];const p=(v,m,c)=>`<div class="bar"><i style="width:${Math.max(0,Math.min(100,v/m*100))}%;background:${c}"></i></div>`;
 $('#hud').innerHTML=`<b>${r.e} ${r.cls[S.cls]}</b> · Lv ${s.lvl} · Leben #${S.lives}
 <div class="bars"><div style="flex:1">HP ${Math.max(0,s.hp)}/${s.maxhp}${p(s.hp,s.maxhp,'#ff5f7e')}</div><div style="flex:1">MP ${s.mp}/${s.maxmp}${p(s.mp,s.maxmp||1,'#6fb6ff')}</div><div style="flex:1">XP ${s.xp}/${s.lvl*100}${p(s.xp,s.lvl*100,'#ffd35a')}</div></div>
 <div class="chips"><span class="chip">💪 ${s.str}</span><span class="chip">✨ ${s.cha}</span><span class="chip">📣 Ruf ${s.ruf}</span>${Object.entries(S.aff).map(([n,v])=>`<span class="chip">💗 ${n.split('_').pop()} ${v}</span>`).join('')}</div>`;
 const c=$('#choices');c.innerHTML='';(S.choices||[]).slice(0,4).forEach(t=>{const b=document.createElement('button');b.textContent=t;b.onclick=()=>act(t);c.appendChild(b)});dbgLine()}
async function newGrey(kind,name,bg){const B=await loadGrey();const r=ROLES.grey;const own=kind!=='darren';
 const who=own?(name||'Fremde Person'):'Darren Crowe';
 S={role:'grey',world_id:'greymourne',kind,pc:{name:who,bg:own?(bg||'Jemand, der etwas verloren hat'):B.npcs['Darren Crowe'].art},lives:1,soul:0,
  st:{hp:100,maxhp:100,mp:0,maxmp:0,str:0,cha:0,ruf:own?10:30,lvl:1,xp:0},skills:[...r.skills],inv:own?['Fahrkarte ohne Rückfahrt','Reisetasche']:['Fahrkarte ohne Rückfahrt','Reisetasche','Taschenmesser mit Holzgriff','Streckenkarte'],
  aff:own?{Marlowe:0,Elias:0,Mascha:0,Darren:0}:{Velicya:0,Marlowe:0,Elias:0,Mascha:0},cls:0,turn:0,hist:[],log:[],flags:{}};
 S.world={scene:{ort:'Nachtzug, Abteil mit Messinglampe, kurz nach Mitternacht',zeit:'Nacht, Nebel',anwesend:['Der Schaffner','Die alte Frau im Zug','ein schlafender Soldat','ein Junge mit Buch']},orte:{},npcs:{},ereignisse:['Der Zug hält in Greymourne, obwohl er nach Blackmere fahren sollte']};
 const first=own?GINTRO_OWN(who,S.pc.bg):GINTRO_DARREN;
 add('n',first);S.hist=[{role:'assistant',content:first}];S.choices=defChoices();save();gateOrShow()}
function hudG(){const s=S.st;const p=(v,m,c)=>`<div class="bar"><i style="width:${Math.max(0,Math.min(100,v/m*100))}%;background:${c}"></i></div>`;
 $('#hud').innerHTML=`<b>🌫️ ${S.pc.name}</b> · ${ROLES.grey.cls[S.cls]} · ${S.world?.scene?.ort||''}
 <div class="bars"><div style="flex:1">🧠 Verstand ${Math.max(0,s.hp)}/100${p(s.hp,100,'#9fb3c8')}</div><div style="flex:1">⚖️ Schuld ${s.ruf}/100${p(s.ruf,100,'#8a5a5a')}</div></div>
 <div class="chips">${Object.entries(S.aff).map(([n,v])=>`<span class="chip">🤝 ${n} ${v}</span>`).join('')}</div>`;
 const c=$('#choices');c.innerHTML='';(S.choices||[]).slice(0,4).forEach(t=>{const b=document.createElement('button');b.textContent=t;b.onclick=()=>act(t);c.appendChild(b)});dbgLine()}
function show(){$('#keyGate')&&$('#keyGate').classList.add('hidden');document.body.classList.toggle('greyw',isG());$('.title').textContent=isG()?'✦ Greymourne':'✦ Isekai Reinkarnation';$('#start').classList.add('hidden');$('#game').classList.remove('hidden');$('#log').innerHTML='';S.log.forEach(m=>renderMsg(m.k,m.t));hud()}

// ---------- apply JSON changes ----------
function apply(ch){if(!ch)return;const s=S.st,num=v=>Math.max(-200,Math.min(200,Math.round(+v||0)));const out=[];
 const map={verstand:'hp',schuld:'ruf',hp:'hp',mp:'mp',str:'str',staerke:'str',stärke:'str',cha:'cha',charme:'cha',ruf:'ruf',xp:'xp'};
 for(const[k,v]of Object.entries(ch)){const m=map[k.toLowerCase()];if(m&&v){s[m]+=num(v);out.push(`${k} ${v>0?'+':''}${num(v)}`)}}
 if(ch.affinity&&typeof ch.affinity==='object')for(const[n,v]of Object.entries(ch.affinity)){const key=Object.keys(S.aff).find(a=>a.toLowerCase().includes(n.toLowerCase().split(/[ _]/).pop()));if(key&&v){S.aff[key]=Math.max(-100,Math.min(100,S.aff[key]+num(v)));out.push(`💗${key.split('_').pop()} ${v>0?'+':''}${num(v)}`)}}
 (ch.newSkills||ch.skills||[]).forEach(x=>{if(typeof x==='string'&&!S.skills.includes(x)&&S.skills.length<20){S.skills.push(x.slice(0,40));out.push('Skill: '+x)}});
 (ch.items||ch.addItems||[]).forEach(x=>{if(typeof x==='string'&&S.inv.length<30){S.inv.push(x.slice(0,40));out.push('Item: '+x)}});
 (ch.removeItems||[]).forEach(x=>{const i=S.inv.indexOf(x);if(i>=0)S.inv.splice(i,1)});
 if(Array.isArray(ch.choices)&&ch.choices.length)S.choices=ch.choices.filter(x=>typeof x==='string').map(x=>x.slice(0,50));
 s.hp=Math.min(s.hp,s.maxhp);s.mp=Math.max(0,Math.min(s.mp,s.maxmp));
 if(isG()){s.ruf=Math.max(0,Math.min(100,s.ruf));s.hp=Math.max(-1,s.hp);const nc=Math.min(3,Math.floor(S.turn/15));if(nc>S.cls){S.cls=nc;out.push('🌫️ '+ROLES.grey.cls[nc])}}
 else while(s.xp>=s.lvl*100){s.xp-=s.lvl*100;s.lvl++;s.maxhp+=10;s.hp=s.maxhp;s.maxmp+=5;s.mp=s.maxmp;s.str+=2;s.cha+=1;out.push(`⬆ LEVEL ${s.lvl}!`)}
 const nc=isG()?0:Math.min(3,Math.floor(s.lvl/5));if(!isG()&&nc>S.cls){S.cls=nc;const cn=ROLES[S.role].cls[nc];out.push(`🌟 Klassenwechsel: ${cn}!`);S.skills.push(R(['Erwachte Aura','Zweite Natur','Seelenblick','Königlicher Befehl']))}
 if(out.length)add('s',out.join(' · '));
 if(ch.ending)return ending(String(ch.ending));checkEnd()}
function checkEnd(){const s=S.st;if(isG()){if(s.hp<=0)return ending('Der Nebel hat deinen Verstand. Greymourne trägt deinen Namen jetzt in seinem Register.');if(s.ruf>=100)return ending('Die Schuld wiegt mehr als du. Die Stadt behält dich – AUSGEGEBEN: 1, ZURÜCK: 0.');return}
 if(s.hp<=0)return death();
 const top=Object.entries(S.aff).find(([,v])=>v>=100);if(top)return ending(`Romantisches Ende mit ${top[0].replace('_',' ')} 💞`);
 if(s.lvl>=20)return ending('Legenden-Ende: Dein Name wird ewig besungen 👑');
 if(s.ruf>=150)return ending('Ruhmes-Ende: Das Volk krönt dich zur Hoffnung der Welt');
 if(s.ruf<=-150)return ending('Tyrannen-Ende: Die Welt kniet in Furcht vor dir');}
function death(){add('s',`💀 Du bist gestorben (Level ${S.st.lvl}).`);setTimeout(()=>reincarnate('Die Göttin seufzt: „Schon wieder? Na gut – nimm etwas mit.“'),600)}
function ending(t){add('s','🏁 ENDE: '+t);S.choices=[];hud();save();if(isG()){const c=$('#choices');c.innerHTML='';[['🎫 Erneut als Darren',()=>newGrey('darren')],['✒️ Andere Figur',()=>{S=null;location.reload()}]].forEach(([l,f])=>{const b=document.createElement('button');b.textContent=l;b.onclick=f;c.appendChild(b)});return}setTimeout(()=>reincarnate('Ein neues Kapitel? Deine Seele wird stärker.'),1500)}
function reincarnate(msg){const soul=S.soul+Math.max(1,Math.floor(S.st.lvl/2));const kept=S.skills.filter(x=>!Object.values(ROLES).some(r=>r.skills.includes(x))).slice(-2);
 const meta={lives:S.lives,soul,keptSkills:kept};add('n',msg+(kept.length?`\nBehaltene Skills: ${kept.join(', ')}`:''));
 S.choices=[];hud();const c=$('#choices');c.innerHTML='';Object.entries(ROLES).filter(([k])=>k!=='grey').forEach(([k,r])=>{const b=document.createElement('button');b.textContent=r.e+' '+r.name;b.onclick=()=>{$('#log').innerHTML='';newLife(k,meta)};c.appendChild(b)});save()}

// ---------- offline narrator ----------
function isQ(a){return /\?\s*$/.test(a.trim())||/^\s*(wer|was|wo|wohin|woher|wie|warum|wieso|weshalb|wann|welche[rsmn]?|seid|bist|sind|kannst|könnt|ist|habt|hast|gibt)\b/i.test(a)}
function askNPC(a){if(!isQ(a)||!S)return null;const t=a.toLowerCase();const pres=(S.world?.scene?.anwesend||[]).map(String);const bible=isG()&&GREY?GREY.npcs:Object.fromEntries(Object.entries(ROLES[S.role].npcs||{}).map(([k,v])=>[k.replace('_',' '),{art:v}]));
 const STOP=/^(der|die|das|ein|eine|einer|im|am|zug|von|und)$/;const find=n=>{const w=n.toLowerCase();return Object.entries(bible).find(([k])=>k.toLowerCase()===w)||Object.entries(bible).find(([k])=>k.toLowerCase().split(/[ \/–_-]+/).some(p=>p.length>3&&!STOP.test(p)&&w.includes(p)))};
 let who=pres.map(p=>{const f=find(p);return f?{n:f[0],d:f[1],label:p}:{n:p,d:null,label:p}});if(!who.length)who=Object.entries(bible).slice(0,2).map(([k,v])=>({n:k,d:v,label:k}));
 const named=who.filter(w=>t.includes(w.n.toLowerCase().split(' ')[0]));const sp=(named.length?named:who).slice(0,/ihr|euch|alle|seid/.test(t)?3:1);
 const first=s=>String(s||'').split(/[.;]/)[0].trim();const lines=sp.map(w=>{const nm=w.n.split(' / ')[0];const desc=first(w.d?.art||w.d?.rolle);
  if(/wer|seid|bist|name/.test(t)){const art=/^(der|die|das|ein|eine)\s/i.test(nm);return `${w.label} ${R(['mustert dich','hebt den Blick','zögert kurz'])}. „${art?'Ich? Nur '+nm.replace(/^\S+/,x=>x.toLowerCase())+'. Namen sagt man hier nicht laut.':'Ich bin '+nm+'.'}“${desc?' '+desc+'.':''}`}
  if(/wo|wohin|woher/.test(t)){const o=S.world?.scene?.ort||'hier';return `${w.label} antwortet leise: „Du bist ${/^(in|im|am|auf|an)\b/i.test(o)?o:'in '+o}. ${R(['Mehr weiß niemand genau.','Frag lieber nicht zu laut.','Das sollte reichen – vorerst.'])}“`}
  return `${w.label} ${R(['runzelt die Stirn','sieht dich lange an','senkt die Stimme'])}: „${R(['Das ist eine gute Frage. Ich weiß nur, was ich gesehen habe.','Nicht hier. Nicht jetzt.','Wenn du das wirklich wissen willst, bleib in meiner Nähe.'])}“${desc?' ('+desc+')':''}`});
 const aff={};sp.forEach(w=>{if(S.aff&&w.n in S.aff)aff[w.n]=2;const k=Object.keys(S.aff||{}).find(x=>x.replace('_',' ')===w.n);if(k)aff[k]=2});
 return {text:`„${a}“\n\n`+lines.join('\n\n'),changes:{xp:5,affinity:aff,choices:defChoices()}}}

function offline(a){const q=askNPC(a);if(q)return q;if(isG()){const t=a.toLowerCase();const hit=/tür|öffn|klink/.test(t);
  const txt=R(['Irgendwo in der Stadt schlägt eine Glocke, tief und unsauber. Du spürst sie im Brustbein. Als der Ton vergeht, ist etwas an der Szene anders, aber du kannst nicht sagen, was.','Der Nebel antwortet nicht. Nur eine Uhr tickt, deren Zeiger stillstehen.','Aus einem Ablaufgitter kommt ein Klopfen: drei Schläge, eine Pause, zwei weitere.','Du zählst, ohne es zu wollen. Die Zahl stimmt nicht mit der von vorhin überein.']);
  return {text:`„${a}“ – ${txt}`,changes:{hp:hit?-8:-2,ruf:0,choices:defChoices()}}}const t=a.toLowerCase(),s=S.st,r=ROLES[S.role],npcs=Object.keys(S.aff);
 const who=npcs.find(n=>n.toLowerCase().split('_').some(p=>p.length>2&&t.includes(p.toLowerCase())));
 const nm=x=>x.replace('_',' ');let txt,ch={};
 if(/kämpf|kampf|angriff|greif|jag|monster|schlag|töt|armee|befehl/.test(t)){const foe=R({held:['einen Goblin-Trupp','einen Oger','einen Dämonenspäher'],villainess:['einen Attentäter','eine eifersüchtige Rivalin im Duell'],daemon:['eine Abenteurergruppe','einen rebellischen Fürsten'],mensch:['einen Wildschwein','einen Wegelagerer','einen Wolf']}[S.role]);
  const win=Math.random()<0.45+s.str/80;const dmg=rnd(5,20)+(win?0:15);
  txt=win?`Du forderst ${foe} heraus. ${R(['Ein präziser Hieb','Ein waghalsiger Konter','Pure Entschlossenheit'])} entscheidet den Kampf – du siegst!`:`Du forderst ${foe} heraus, doch der Gegner ist stärker. Du entkommst blutend.`;
  ch={hp:-dmg,xp:win?rnd(30,60):10,str:win&&Math.random()<.4?1:0,ruf:win?(S.role==='daemon'?-5:5):0};if(win&&Math.random()<.3)ch.items=[R(['Monsterkern','Silbermünzen','Seltsames Amulett','Heiltrank'])]}
 else if(/red|sprech|sag|frag|flirt|küss|hilf|helf|plan|lieb|tee|party/.test(t)||who){const n=who||R(npcs);const good=Math.random()<0.5+s.cha/50;
  txt=good?`${nm(n)} (${r.npcs[n]}) hört dir zu. ${R(['Ein kleines Lächeln huscht über das Gesicht.','„Du bist anders, als ich dachte…“','Ihr redet bis spät in die Nacht.'])}`:`${nm(n)} wirkt abweisend. ${R(['„Was willst du?“','Ein kalter Blick trifft dich.','Ihr werdet unterbrochen.'])}`;
  ch={affinity:{[n]:good?rnd(8,18):-rnd(2,8)},xp:15,cha:good&&Math.random()<.3?1:0,ruf:good?2:-1}}
 else if(/train|üb|lern|magie|zauber|stud/.test(t)){const cost=Math.min(s.mp,rnd(5,15));txt=`Du trainierst hart. ${R(['Schweiß tropft, doch du spürst Fortschritt.','Ein neues Gefühl regt sich in dir.','Es ist mühsam – aber lohnend.'])}`;
  ch={mp:-cost,xp:rnd(20,40),str:Math.random()<.5?1:0};if(Math.random()<.25)ch.newSkills=[R({held:['Doppelschlag','Schildwall','Lichtklinge'],villainess:['Giftige Zunge','Tränen-Taktik','Hofetikette'],daemon:['Schattenportal','Seelenraub','Furchtgebrüll'],mensch:['Kochen','Fallenbau','Feilschen','Kräuterkunde']}[S.role])]}
 else if(/ruh|schlaf|rast|ess|heil/.test(t)){txt='Du ruhst dich aus. Wärme kehrt in deinen Körper zurück.';ch={hp:rnd(20,40),mp:rnd(10,25)}}
 else if(/intrig|lüg|schmied|spion|stehl|sabot/.test(t)){const ok=Math.random()<.55;txt=ok?'Dein Plan geht auf. Gerüchte verbreiten sich – genau wie du wolltest.':'Du wirst beinahe erwischt! Getuschel folgt dir.';ch={xp:25,ruf:ok?rnd(-3,6):-10,cha:ok?1:0}}
 else{const ev=R([['Du findest eine versteckte Truhe!',{items:[R(['Goldmünzen','Alte Karte','Zauberring'])],xp:20}],['Ein Händler bietet dir Hilfe an.',{xp:10,ruf:2}],['Eine Falle! Spitze Steine treffen dich.',{hp:-rnd(8,18),xp:10}],['Ein Fremder erkennt dich und flüstert deinen Namen…',{xp:15,ruf:3}],['Die Gegend ist ruhig. Du lernst die Welt besser kennen.',{xp:20}]]);
  txt=`Du versuchst: „${a}“. ${ev[0]}`;ch=ev[1]}
 ch.choices=[...defChoices().sort(()=>Math.random()-.5).slice(0,3),R(['Ausruhen','Die Umgebung erkunden','Training'])];
 return {text:txt,changes:ch}}

// ---------- AI ----------
if(!cfg.v2){if(cfg.mode==='offline'||!cfg.mode)cfg.mode=hasKey()?'gemini':'gemini';cfg.v2=1;localStorage.setItem(CFG,JSON.stringify(cfg))}
if(cfg.mode==='free'){cfg.mode='gemini';localStorage.setItem(CFG,JSON.stringify(cfg))}
const FREE_URL='https://text.pollinations.ai/openai';
const STREAM_DELIM='###DATA###';
function greyPrompt(stream){const B=GREY||{kern:{}};const k=B.kern;return `Du bist der Erzähler eines interaktiven literarischen Horror-Romans auf Deutsch: „${B.titel}“ (${B.quelle}).
SPIELFIGUR: ${S.pc.name}${S.kind==='darren'?' (die Hauptfigur des Romans)':' (eigene Figur, kein Teil des Romans; Darren Crowe existiert als NPC in derselben Nacht)'}. Hintergrund: ${S.pc.bg}
TON: ${k.ton}
STIL: ${k.stil} Erzähle in der 2. Person („du“), Präsens oder Präteritum konsistent wie bisher.
REGELN DER STADT (verbindlich, die Welt hält sich daran): ${(k.regeln_der_stadt||[]).map((x,i)=>(i+1)+') '+x).join(' ')}
MOTIVE: ${(k.motive||[]).join('; ')}.
SPOILERSCHUTZ: ${k.spoilerschutz}
ERZÄHLREGELN:
1. Reagiere zuerst direkt und konkret auf die exakten Worte/Taten des Spielers. Wer anwesend ist, hört es und antwortet in wörtlicher Rede „…“ mit eigener Stimme (siehe NPC-Bibel). Ignoriere oder ersetze die Eingabe nie.
2. Nichts Beliebiges: keine zusammenhanglosen Ereignisse, keine Monsterjagd, keine Fantasy-Magie, keine Anime-Systemfenster. Neue Details müssen zur Bibel passen und werden in "world" eingetragen.
3. Langsamer Aufbau: Unheimliches in kleinen Abweichungen. Zahlen, Namen, Glocken, Nebel, Kohle. Die Welt lebt weiter und wartet auf die Spielfigur: NPCs erinnern sich, Schichten laufen, Register zählen.
4. Bricht die Spielfigur eine Regel der Stadt (voller Name, Tür nach dem 2. Schlag), hat das spürbare, konsequente Folgen.
5. 4-9 Sätze. Ende auf einem stillen, beunruhigenden Detail oder einer offenen Frage. Entscheide nie für die Spielfigur.
${stream?`AUSGABE: Zuerst NUR den Erzähltext (Narration) als normalen Fließtext. Danach eine eigene Zeile genau „${STREAM_DELIM}“. Danach EIN JSON-Objekt (ohne Markdown) mit: "choices" (4 kurze, eher leise Handlungen), "changes" {verstand,schuld,affinity,xp,items,removeItems}, "summary" (max 5 Sätze), "world" (scene,npcUpdates,newLocations,ereignisse≤6), optional "ending". Kein narration-Feld im JSON.`:`AUSGABE als JSON: "narration"; "choices" (4 kurze, szenenpassende, eher leise Handlungen); "changes" als Deltas dieses Zuges: "verstand" (-15..+10), "schuld" (-5..+5), "affinity" = Vertrauen je NPC (-15..15) für ${Object.keys(S.aff).join(', ')}, "xp" 0-20, items nur neu erhaltene, removeItems; "summary" (max 5 Sätze); "world" (scene {ort,zeit,anwesend}, npcUpdates [{name, erinnerung, beziehung}], newLocations, ereignisse ≤6); "ending" nur bei echtem Ende.`}`}
function greyDetails(a){const B=GREY;if(!B)return '';const txt=(a+' '+JSON.stringify(S.world.scene)+' '+(S.hist||[]).slice(-4).map(h=>h.content).join(' ')).toLowerCase();
 const pick=(obj,force)=>Object.entries(obj).filter(([k])=>force.includes(k)||k.toLowerCase().split(/[ \/–-]+/).some(w=>w.length>3&&txt.includes(w)));
 const npcs=pick(B.npcs,S.kind==='darren'?['Der Schaffner']:['Der Schaffner','Darren Crowe']).slice(0,5).map(([k,v])=>{const o={...v};if(S.turn<40)delete o.geheim;return k+': '+JSON.stringify(o)});
 const orte=pick(B.orte,[]).slice(0,4).map(([k,v])=>k+': '+v);
 return 'BIBEL-DETAILS ZUR SZENE:\nNPCs: '+npcs.join('\n')+'\nOrte: '+orte.join('\n')+(S.turn>=25?'\nFraktionen: '+JSON.stringify(B.fraktionen):'')}
function sysPrompt(stream=true){if(isG())return greyPrompt(stream);const r=ROLES[S.role];return `Du bist der Erzähler eines interaktiven Isekai-Anime auf Deutsch. Der SPIELER ist die Hauptfigur (Protagonist) – alles dreht sich um ihn. Schreibe wie eine packende Anime-/Light-Novel-Szene.

WELT & FIGUREN (Charakterbogen):
- Protagonist: ${r.name}, Klasse ${r.cls[S.cls]}, reinkarniert aus unserer modernen Welt (wurde von einem Lastwagen erfasst). Leben Nr. ${S.lives}.
- Welt: ${r.world}. Ausgangslage: ${r.d}
- NPCs (jeder mit eigener Stimme, Sprechweise, Gefühlen und Zielen): ${Object.entries(r.npcs).map(([k,v])=>k.replace('_',' ')+' – '+v).join('; ')}. Du darfst passende Nebenfiguren einführen, aber die Hauptbesetzung bleibt.

GOLDENE REGELN:
1. REAGIERE ZUERST und DIREKT auf die exakten Worte/Taten des Spielers. Sein Satz ist der Auslöser der Szene. Sagt er etwas laut, dann HÖREN die Anwesenden das – sie reagieren konkret darauf und antworten in wörtlicher Rede.
2. Ignoriere oder ersetze NIE die Eingabe des Spielers. Erfinde keine zusammenhanglosen Zufallsereignisse.
3. Kontinuität: Bleib in der aktuellen Szene. Greife Details aus dem Verlauf auf.
4. NPCs sprechen in direkter Rede mit Anführungszeichen „…“.
5. Anime-Stilmittel, wenn passend: innere Gedanken (Gedanke …), Systemfenster [Status]/ [Skill].
6. Sinneseindrücke kurz und lebendig.
7. Länge: 4-9 Sätze in der 2. Person („du“). Kein Meta-Kommentar.
8. Ende mit einem Hook. Entscheide nie für den Spieler.
9. WELT-BIBEL ist verbindlich. Updates per "world".
10. Fairness: Riskantes kann HP kosten; Reden/Fragen meist nicht.
${stream?`AUSGABE: Zuerst NUR den Erzähltext als Fließtext. Dann eine eigene Zeile genau „${STREAM_DELIM}“. Dann EIN JSON-Objekt (ohne Markdown, ohne narration) mit: "choices" (genau 4 kurze Aktionen), "changes" (Deltas: hp,mp,str,cha,ruf,xp,affinity,items,newSkills,removeItems), "summary" (max 5 Sätze), "world" (scene,npcUpdates,newLocations,ereignisse), optional "ending".`:`AUSGABE als JSON: "narration", "choices" (4), "changes", "summary", "world", optional "ending".`}`}
function stateSum(){const s=S.st;if(isG())return `STATUS: Verstand ${s.hp}/100, Schuld ${s.ruf}/100 | Inventar: ${S.inv.join(', ')} | Vertrauen: ${Object.entries(S.aff).map(([k,v])=>k+'='+v).join(', ')} | Zug ${S.turn}`;return `STATUS: Lv${s.lvl} HP${s.hp}/${s.maxhp} MP${s.mp} Stärke${s.str} Charme${s.cha} Ruf${s.ruf} | Skills: ${S.skills.join(', ')} | Inventar: ${S.inv.join(', ')} | Affinität: ${Object.entries(S.aff).map(([k,v])=>k+'='+v).join(', ')} | Leben #${S.lives}`}
function msgs(a){const sum=S.summary?'BISHERIGE GESCHICHTE (Zusammenfassung): '+S.summary+'\n':'';
 let h=(S.hist||[]).slice(-10);if(!h.length){const last=S.log.filter(m=>m.k==='n').slice(-1)[0];if(last)h=[{role:'assistant',content:last.t}]}
 return [{role:'system',content:sysPrompt(false)},...h,{role:'user',content:turnMsg(a)}]}
function turnMsg(a){return (isG()?greyDetails(a)+'\n':'')+worldText()+'\n'+(S.summary?'BISHERIGE GESCHICHTE (Zusammenfassung): '+S.summary+'\n':'')+stateSum()+'\n'+(isG()?'DIE SPIELFIGUR sagt/tut jetzt:':'DER SPIELER (Protagonist) sagt/tut jetzt:')+' „'+a+'“\n(Reagiere zuerst direkt und konkret genau darauf – die Anwesenden hören/sehen es.)'}
function parse(raw){let m=raw.match(/```(?:json)?\s*([\s\S]*?)```/)||raw.match(/(\{[\s\S]*\})\s*$/);let ch=null;
 if(m){try{ch=JSON.parse(m[1].trim())}catch(e){try{ch=JSON.parse(m[1].replace(/,\s*}/g,'}').replace(/'/g,'"'))}catch(_){}}}
 const text=(m?raw.replace(m[0],''):raw).replace(/```[\s\S]*$/,'').replace(/^\s*\d[.)]\s.*$/gm,'').replace(/\n*(Wie|Was) (willst|wirst|tust) du[^\n]*\?\s*$/,'').trim();return {text:text||'…',changes:ch||{xp:10}}}
function parseStream(raw){const i=raw.indexOf(STREAM_DELIM);if(i<0){const j=raw.lastIndexOf('{');if(j>0){const nar=raw.slice(0,j).trim();const o=gJSON(raw.slice(j));if(o)return packStream(nar||o.narration||o.text||'…',o); }return parse(raw)}
 const nar=raw.slice(0,i).trim();const o=gJSON(raw.slice(i+STREAM_DELIM.length).trim())||{};return packStream(nar||o.narration||'…',o)}
function packStream(text,o){const ch=Object.assign({},o.changes||{});if(o.choices)ch.choices=o.choices;if(o.summary)ch.summary=o.summary;if(o.world)ch.world=o.world;if(o.ending)ch.ending=o.ending;
 // allow top-level deltas if model put them outside changes
 for(const k of ['verstand','schuld','hp','mp','str','cha','ruf','xp','affinity','items','newSkills','removeItems']){if(k in o&&!(k in ch))ch[k]=o[k]}
 return {text:String(text||'…'),changes:ch}}

const G_FALLBACK=['gemini-2.5-flash','gemini-flash-latest','gemini-2.5-flash-lite','gemini-2.0-flash'];
const GM_KEY='isekai_gmodels';
const G_SAFE=['HARM_CATEGORY_HARASSMENT','HARM_CATEGORY_HATE_SPEECH','HARM_CATEGORY_SEXUALLY_EXPLICIT','HARM_CATEGORY_DANGEROUS_CONTENT'].map(category=>({category,threshold:'BLOCK_ONLY_HIGH'}));
const G_TIMEOUT=25000;
function gmStore(){try{return JSON.parse(localStorage.getItem(GM_KEY))||{}}catch(_){return {}}}
function gmSave(o){localStorage.setItem(GM_KEY,JSON.stringify(o))}
function gmScore(id){const n=id.toLowerCase();const v=(n.match(/gemini-(\d+(?:\.\d+)?)/)||[])[1];let s=(v?+v:0)*100;
 if(/flash-lite/.test(n))s+=15;else if(/flash/.test(n))s+=45;else if(/pro/.test(n))s-=30;// flash > flash-lite > pro
 if(/-latest$/.test(n))s+=350;// alias tracks newest stable
 if(/preview|exp/.test(n))s-=60;if(/-\d{3}$|-\d{2}-\d{4}$/.test(n))s-=5;if(/gemma/.test(n))s-=400;return s}
function gmRank(list){const bad=/embed|image|imagen|tts|audio|live|vision|aqa|veo|lyria|robotics|computer-use|learnlm|native|thinking-exp|nano|banana|deep-research/i;
 const ids=list.filter(m=>(m.supportedGenerationMethods||[]).includes('generateContent')).map(m=>String(m.name||'').replace(/^models\//,'')).filter(id=>/^gemini/i.test(id)&&!bad.test(id));
 return [...new Set(ids)].sort((a,b)=>gmScore(b)-gmScore(a))}
async function gmFetch(key,force){const st=gmStore();if(!force&&st.key===key.slice(-6)&&st.list&&Date.now()-st.t<864e5)return st;
 let all=[],tok='';try{for(let i=0;i<10;i++){const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000'+(tok?'&pageToken='+encodeURIComponent(tok):'')+'&key='+encodeURIComponent(key));if(!r.ok)break;const j=await r.json();all=all.concat(j.models||[]);tok=j.nextPageToken;if(!tok)break}}catch(_){}
 const list=all.length?gmRank(all):null;const o={key:key.slice(-6),t:Date.now(),list:list||st.list||G_FALLBACK,fail:force?{}:(st.fail||{}),noThink:force?{}:(st.noThink||{}),chosen:st.chosen,manual:st.manual,lat:st.lat||{}};gmSave(o);gmUI();return o}
function gmOrder(st){const fail=st.fail||{},now=Date.now();
 const cool=m=>!(fail[m]&&now-fail[m].t<(fail[m].c===429?(fail[m].rd||600)*1000:864e5));
 let L=(st.list||G_FALLBACK).slice();
 if(st.manual){const primary=st.manual;const rest=L.filter(x=>x!==primary&&cool(x));return cool(primary)?[primary,...rest.slice(0,1)]:[...rest.slice(0,2)]}
 if(st.chosen&&cool(st.chosen)){const rest=L.filter(x=>x!==st.chosen&&cool(x));return [st.chosen,...rest.slice(0,1)]}
 const ok=L.filter(cool);return (ok.length?ok:L).slice(0,2)}
function gmUI(){const sel=$('#gmodel');if(!sel)return;const st=gmStore();const L=st.list||G_FALLBACK;
 sel.innerHTML='<option value="">Automatisch (gepinnt bevorzugt)</option>'+L.map(m=>`<option value="${m}">${m}${st.chosen===m?' ✓':''}${st.fail&&st.fail[m]?' ⚠️':''}</option>`).join('');
 sel.value=st.manual||'';const gs=$('#gmstatus');if(gs)gs.textContent=st.chosen?'Aktiv: '+st.chosen+(st.lat&&st.lat[st.chosen]?' · '+st.lat[st.chosen]+'ms':''):(L.length?'Bereit':'')}
function thinkingCfg(model){const st=gmStore();if(st.noThink&&st.noThink[model])return null;
 const n=model.toLowerCase();
 if(/gemini-([34](\.|$)|3\.\d)/.test(n)||/^gemini-3/.test(n)||/gemini-4/.test(n)){
  // 3.x/4.x: minimal where likely supported, else low (docs: 3.8 has no minimal)
  if(/flash-lite|3\.6|gemini-3-flash(?!-)|3\.5|3\.1-flash-lite|robotics/.test(n))return {thinkingLevel:'minimal'};
  return {thinkingLevel:'low'}}
 if(/2\.5/.test(n))return {thinkingBudget:0};
 return null}
function gParse(j){const c=j.candidates?.[0];const t=(c?.content?.parts||[]).filter(p=>!p.thought).map(p=>p.text||'').join('');return {t,fr:c?.finishReason||j.promptFeedback?.blockReason||(c?'':'LEER')}}
function gJSON(t){if(!t)return null;t=String(t).replace(/^```(?:json)?\s*/i,'').replace(/```\s*$/,'').trim();try{return JSON.parse(t)}catch(_){}const i=t.indexOf('{'),k=t.lastIndexOf('}');if(i>=0&&k>i)try{return JSON.parse(t.slice(i,k+1))}catch(_){}return null}
function gBody(a){const contents=[];for(const m of (S.hist||[]).slice(-10)){const role=m.role==='assistant'?'model':'user';const last=contents[contents.length-1];
  if(last&&last.role===role)last.parts[0].text+='\n'+m.content;else contents.push({role,parts:[{text:m.content}]})}
 if(contents[0]&&contents[0].role==='model')contents.unshift({role:'user',parts:[{text:'(Spielbeginn)'}]});
 contents.push({role:'user',parts:[{text:turnMsg(a)}]});
 return {systemInstruction:{parts:[{text:sysPrompt(true)}]},contents,generationConfig:{temperature:.9,maxOutputTokens:700},safetySettings:G_SAFE}}
function friendlyAIFail(){return 'Die Erzählerin ist gerade nicht erreichbar. Versuch es gleich noch einmal – oder spiele offline weiter.'}
function gErr(t){const e=new Error(t);e.gem=1;return e}
async function fetchWithTimeout(url,opts,ms){const ac=new AbortController();const to=setTimeout(()=>ac.abort(),ms);try{return await fetch(url,{...opts,signal:ac.signal})}finally{clearTimeout(to)}}
async function readSSE(res,onText){const reader=res.body.getReader();const dec=new TextDecoder();let buf='',raw='';
 while(true){const {done,value}=await reader.read();if(done)break;buf+=dec.decode(value,{stream:true});
  let idx;while((idx=buf.indexOf('\n'))>=0){let line=buf.slice(0,idx);buf=buf.slice(idx+1);if(line.endsWith('\r'))line=line.slice(0,-1);
   if(!line.startsWith('data:'))continue;const data=line.slice(5).trim();if(!data||data==='[DONE]')continue;
   try{const j=JSON.parse(data);const {t}=gParse(j);if(t){raw+=t;if(onText)onText(raw)}}catch(_){}}}
 if(buf.startsWith('data:')){try{const j=JSON.parse(buf.slice(5).trim());const {t}=gParse(j);if(t){raw+=t;if(onText)onText(raw)}}catch(_){}}
 return raw}
function showNarration(el,raw){const i=raw.indexOf(STREAM_DELIM);const vis=i>=0?raw.slice(0,i):raw;el.textContent=vis.replace(/\n+$/,'');el.classList.remove('typing')}

async function gmProbe(key){const st=await gmFetch(key);const cands=(st.list||G_FALLBACK).slice(0,6);
 const results=[];for(const m of cands){const t0=performance.now();
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
   last=gErr(friendlyAIFail());break}// next model once
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
   const res=await fetch(FREE_URL,{method:'POST',signal:ac.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'openai',messages:msgs(a),temperature:.9,reasoning_effort:'low',referrer:'isekai-game'})});clearTimeout(to);
   if(!res.ok){const e=new Error('Gratis-KI '+res.status);e.ra=+res.headers.get('Retry-After')||0;throw e}const j=await res.json();const mm=j.choices?.[0]?.message||{};let t=(mm.content||'').trim()||(mm.reasoning_content||'').trim();if(!t){const e=new Error('leere Antwort');e.ra=1;throw e}el.textContent=t.split('```')[0];return t}
  catch(e){err=e;if(i<1){el.textContent='…';await new Promise(r=>setTimeout(r,Math.min(3,e.ra||1)*1000))}}}throw err}
 throw new Error('offline')}
async function act(a){if(busy||!a.trim())return;busy=true;const t0=performance.now();if(isG())try{await loadGrey()}catch(_){}add('p',a);S.turn++;const el=renderMsg('n typing','…');let res;
 let softFail=false;try{if(cfg.mode==='offline')throw 0;
  if(cfg.mode==='gemini'||(cfg.mode!=='webllm'&&cfg.mode!=='api'&&cfg.mode!=='free'&&hasKey())){
   try{res=await gemini(a,el)}catch(e){softFail=true;el.textContent='…'}}
  if(!res&&cfg.mode!=='gemini'){const raw=await aiTurn(a,el,cfg.mode);res=parse(raw)}
  if(!res){res=offline(a);softFail=true}
  {const c=res.changes,lim={hp:30,mp:30,str:2,cha:2,ruf:5,xp:60,verstand:15,schuld:5};for(const k in lim)if(k in c)c[k]=Math.max(-lim[k],Math.min(lim[k],+c[k]||0));if(c.affinity)for(const n in c.affinity)c.affinity[n]=Math.max(-15,Math.min(15,+c.affinity[n]||0))}
  if(Array.isArray(res.changes.items))res.changes.items=res.changes.items.filter(x=>!S.inv.includes(x));
  if(Array.isArray(res.changes.newSkills))res.changes.newSkills=res.changes.newSkills.filter(x=>!S.skills.includes(x));
  if(res.changes.summary){S.summary=String(res.changes.summary).slice(0,800);delete res.changes.summary}
  if(res.changes.world){try{applyWorld(res.changes.world)}catch(_){}delete res.changes.world}
  S.hist=S.hist||[];S.hist.push({role:'user',content:'SPIELER: '+a},{role:'assistant',content:res.text});S.hist=S.hist.slice(-20);
  if(softFail)res.note=friendlyAIFail()}
 catch(e){res=offline(a);res.note=friendlyAIFail()}
 _dbgMs=Math.round(performance.now()-t0);el.remove();add('n',res.text);if(res.note)add('s',res.note);apply(res.changes);hud();save();busy=false}

// ---------- UI ----------
function startScreen(){const g=$('#roles');g.innerHTML='';Object.entries(ROLES).filter(([k])=>k!=='grey').forEach(([k,r])=>{const b=document.createElement('button');b.className='role';b.innerHTML=`<div class="e">${r.e}</div><b>${r.name}</b><span>${r.d}</span>`;b.onclick=()=>newLife(k);g.appendChild(b)});
 const sv=localStorage.getItem(KEY);if(sv){$('#btnContinue').classList.remove('hidden');$('#btnContinue').onclick=()=>{S=JSON.parse(sv);if(S.role==='grey')loadGrey();if(!S.world&&WORLD[S.role])S.world=JSON.parse(JSON.stringify(WORLD[S.role]));gateOrShow()}}}
$('#btnRandom').onclick=()=>newLife(R(ISEKAI));
$('#btnDarren').onclick=()=>newGrey('darren');$('#btnOwnShow').onclick=()=>$('#ownForm').classList.toggle('hidden');
$('#btnOwnGo').onclick=()=>newGrey('own',$('#ownName').value.trim(),$('#ownBg').value.trim());
$('#inputRow').onsubmit=e=>{e.preventDefault();const v=$('#txt').value;$('#txt').value='';act(v)};
const sync=()=>{$('#webllmBox').style.display=$('#mode').value==='webllm'?'':'none';$('#apiBox').style.display=$('#mode').value==='api'?'':'none'};
function openSheet(){$('#mode').value=cfg.mode;$('#wmodel').value=cfg.wmodel||$('#wmodel').value;$('#aurl').value=cfg.aurl||'';$('#akey').value=cfg.akey||'';$('#amodel').value=cfg.amodel||'';$('#gkey').value=cfg.gkey||'';
 if($('#dbgToggle'))$('#dbgToggle').checked=!!cfg.debug;gmUI();sync();$('#sheet').classList.remove('hidden')}
$('#btnMenu').onclick=openSheet;
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
$('#btnStats').onclick=()=>{if(!S)return;$('#sheet').classList.add('hidden');add('s',`📜 ${ROLES[S.role].cls[S.cls]} · Seelenfragmente ${S.soul}\nSkills: ${S.skills.join(', ')}\nInventar: ${S.inv.join(', ')}`)};
$('#btnAdv').onclick=()=>{$('#advBox').classList.toggle('hidden');$('#btnAdv').textContent=$('#advBox').classList.contains('hidden')?'Erweitert ▸':'Erweitert ▾'};
$('#btnGateSave').onclick=()=>{const gk=$('#gateKey').value.trim();if(!gk){toast('Bitte Schlüssel einfügen');return}
 cfg.gkey=gk;cfg.mode='gemini';cfg.v2=1;localStorage.setItem(CFG,JSON.stringify(cfg));
 toast('Alles bereit.');gmFetch(gk,true).then(()=>gmProbe(gk).catch(()=>{}));show()};
$('#btnGateSkip').onclick=()=>{cfg.mode='offline';cfg.v2=1;localStorage.setItem(CFG,JSON.stringify(cfg));show()};
window.__game={newGrey,greyDetails,loadGrey,get S(){return S},act,newLife,gBody,msgs,gmRank,gmProbe,parseStream,thinkingCfg,gmOrder,readSSE,STREAM_DELIM};
window.__game.askNPC=a=>askNPC(a);window.__game.gemini=gemini;
if(cfg.gkey)gmFetch(cfg.gkey.trim()).then(()=>gmProbe(cfg.gkey.trim()).catch(()=>{})).catch(()=>{});
startScreen();
