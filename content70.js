/** Nocturna v70 — chapter-1 slice polish + visual flags */
import * as C67 from './content67.js';
import { CHAPTERS } from './content60.js';

export function ensureV70(S){
  S.flags = S.flags || {};
  S.flags.visual70 = true;
  S.flags.attackAnims70 = true;
  S.flags.c1Slice70 = true;
  // keep party order Noctis, Velka, Brok, Aria when present
  try{
    const want=['Noctis','Sekretärin Velka','General Brok','Heldin Aria'];
    const p=S.party||[];
    const rest=p.filter(n=>!want.includes(n));
    const ordered=want.filter(n=>p.includes(n)).concat(rest);
    if(ordered.length) S.party=ordered;
  }catch(_){}
  return S;
}

export function migrateV70(S){
  try{ C67.migrateV67?.(S); }catch(_){}
  ensureV70(S);
  try{
    const c1=CHAPTERS.find(c=>c.id==='c1');
    if(c1 && !c1.scenes.some(s=>s.id==='c1_intro')){
      /* content60 already ships intro in v70 tree */
    }
    if(S.campaign && !S.campaign.flags?.visual70boot){
      S.campaign.flags=S.campaign.flags||{};
      S.campaign.flags.visual70boot=true;
      if(S.campaign.sceneId==='c1_open' && !(S.campaign.flags?.beat_lesser_fiend)){
        // leave mid-run players on open; new runs use c1_intro
      }
    }
  }catch(_){}
  S.ver=Math.max(S.ver|0, 70);
  return S;
}

export function c1PlayPath(){
  return [
    'c1_intro','c1_open','town','c1_dung','dungeon',
    'puzzle@room3','boss:lesser_fiend','c1_reward'
  ];
}

export default { ensureV70, migrateV70, c1PlayPath };
