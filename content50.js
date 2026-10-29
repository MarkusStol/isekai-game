/** v50: name-matched battler art keys + gate, polish helpers */
import * as C49 from './content49.js';
import { ENEMIES } from './enemies.js';

/** Explicit per-enemy art key → battler file under assets/pixel/battler/{key}.png
 *  Tags document expected silhouette so gates catch pumpkin≠ogre mismatches. */
export const ENEMY_ART_KEYS = {
  goblin:              { key:'goblin',              tags:['goblin','green','ears','dagger'], expect:'small green goblin with pointed ears' },
  orc:                 { key:'orc',                 tags:['orc','green','tusk','axe'], expect:'green orc warrior with axe' },
  wolf:                { key:'wolf',                tags:['wolf','quadruped','fur'], expect:'grey wolf quadruped' },
  slime:               { key:'slime',               tags:['slime','blob','gel'], expect:'green slime blob' },
  skeleton:            { key:'skeleton',            tags:['skeleton','bone','skull'], expect:'undead skeleton' },
  bandit:              { key:'bandit',              tags:['bandit','human','hood','dagger'], expect:'hooded human bandit' },
  mage_rogue:          { key:'mage_rogue',          tags:['mage','robe','staff'], expect:'hooded mage with staff' },
  dragon_whelp:        { key:'dragon_whelp',        tags:['dragon','wing','scale'], expect:'small green dragon' },
  demon_imp:           { key:'demon_imp',           tags:['imp','demon','horn','red'], expect:'red imp with horns' },
  shadow_wraith:       { key:'shadow_wraith',       tags:['wraith','ghost','shadow'], expect:'shadowy wraith' },
  ash_hound:           { key:'ash_hound',           tags:['hound','ash','quadruped'], expect:'ash-grey hound' },
  bone_knight:         { key:'bone_knight',         tags:['skeleton','knight','armor','bone'], expect:'armored bone knight' },
  blood_cultist:       { key:'blood_cultist',       tags:['cultist','robe','blood'], expect:'crimson cultist' },
  walker:              { key:'walker',              tags:['zombie','undead'], expect:'shambling zombie' },
  runner:              { key:'runner',              tags:['zombie','undead','thin'], expect:'thin fast zombie' },
  bloater:             { key:'bloater',             tags:['zombie','bloated','undead'], expect:'bloated zombie' },
  looter:              { key:'looter',              tags:['human','bandit','looter'], expect:'human looter' },
  drone:               { key:'drone',               tags:['drone','robot','machine'], expect:'chrome drone robot' },
  street_thug:         { key:'street_thug',         tags:['human','thug','cyber'], expect:'cyber street thug' },
  chrome_hound:        { key:'chrome_hound',        tags:['hound','chrome','cyber'], expect:'chrome cyber hound' },
  net_ghost:           { key:'net_ghost',           tags:['ghost','net','cyber'], expect:'digital net ghost' },
  lesser_fiend:        { key:'lesser_fiend',        tags:['fiend','demon'], expect:'lesser demon fiend' },
  hellhound:           { key:'hellhound',           tags:['hound','hell','fire'], expect:'flaming hellhound' },
  cultist:             { key:'cultist',             tags:['cultist','robe'], expect:'dark cultist in robes' },
  fog_passenger:       { key:'fog_passenger',       tags:['fog','ghost','grey'], expect:'foggy passenger ghost' },
  mirror_double:       { key:'mirror_double',       tags:['mirror','humanoid','double'], expect:'mirror double humanoid' },
  quiet_porter:        { key:'quiet_porter',        tags:['porter','human','cap'], expect:'human porter with cap' },
  boss_ogre:           { key:'boss_ogre',           tags:['ogre','club','large','tusk','boss'], expect:'large green ogre warlord with club' },
  boss_lich:           { key:'boss_lich',           tags:['lich','undead','crown','staff','boss'], expect:'crowned lich with staff' },
  boss_tyrant:         { key:'boss_tyrant',         tags:['tyrant','zombie','mutant','boss'], expect:'bloated zombie tyrant' },
  boss_chrome:         { key:'boss_chrome',         tags:['chrome','assassin','cyber','boss'], expect:'chrome cyber assassin' },
  boss_archfiend:      { key:'boss_archfiend',      tags:['fiend','demon','wing','boss'], expect:'winged archfiend demon' },
  boss_fogking:        { key:'boss_fogking',        tags:['fog','king','crown','boss'], expect:'fog king with crown' },
  golden_slime:        { key:'golden_slime',        tags:['slime','gold','blob'], expect:'golden slime blob' },
  story_wallbreaker:   { key:'story_wallbreaker',   tags:['ogre','club','large','boss'], expect:'ogre siege warlord (Wallbrecher)' },
  story_velka_shadow:  { key:'story_velka_shadow',  tags:['fiend','demon','shadow','boss'], expect:'shadow archfiend' },
  story_ashcroft:      { key:'story_ashcroft',      tags:['human','noble','rapier','boss'], expect:'noblewoman with rapier' },
  story_nebelrichter:  { key:'story_nebelrichter',  tags:['fog','judge','boss'], expect:'fog judge king' },
  superboss_aether:    { key:'superboss_aether',    tags:['dragon','wyrm','aether','boss'], expect:'blue aether dragon wyrm' },
};

export function battlerPathForKey(key){
  return `./assets/pixel/battler/${key}.png`;
}

export function enemyArtKey(f){
  const id=String(f?.id||'').trim();
  if(id && ENEMY_ART_KEYS[id]) return ENEMY_ART_KEYS[id].key;
  // Never fall back to pumpkin/heuristic boss sheet — unknown → slime placeholder only if no id
  const n=String(f?.name||id||'').toLowerCase();
  for(const [eid,meta] of Object.entries(ENEMY_ART_KEYS)){
    if(n.includes(eid.replace(/_/g,' ')) || n.includes(eid)) return meta.key;
  }
  if(/oger|ogre|wallbrecher|ghor/.test(n)) return 'boss_ogre';
  if(/lich/.test(n)) return 'boss_lich';
  if(/schleim|slime/.test(n)) return /gold/.test(n)?'golden_slime':'slime';
  if(/goblin/.test(n)) return 'goblin';
  if(/wolf|hund/.test(n)) return /hölle|hell/.test(n)?'hellhound':(/chrom/.test(n)?'chrome_hound':(/asche|ash/.test(n)?'ash_hound':'wolf'));
  if(/skelett|skeleton|knochen/.test(n)) return /ritter|knight/.test(n)?'bone_knight':'skeleton';
  return id && ENEMY_ART_KEYS[id] ? ENEMY_ART_KEYS[id].key : 'slime';
}

export function battleEnemyArt(f){
  const key=enemyArtKey(f);
  return battlerPathForKey(key);
}

/** Gate: every ENEMIES entry must have an art-key row + matching tags appropriateness. */
export function assertEnemyArtKeys(enemies=ENEMIES){
  const missing=[];
  const bad=[];
  const list=enemies && typeof enemies==='object' ? Object.values(enemies) : [];
  for(const e of list){
    const id=e?.id;
    const row=ENEMY_ART_KEYS[id];
    if(!row){ missing.push(id||'?'); continue; }
    // Appropriateness: ogre/wallbreaker must not share pumpkin/gourd keys; tags must include semantic family
    const name=String(e.name||'').toLowerCase();
    const tags=(row.tags||[]).join(' ');
    if(/oger|ogre|wallbrecher|ghor/.test(name+id) && !/ogre/.test(tags)) bad.push(`${id}: ogre-family without ogre tag`);
    if(/schleim|slime/.test(name+id) && !/slime/.test(tags)) bad.push(`${id}: slime without slime tag`);
    if(/goblin/.test(name+id) && !/goblin/.test(tags)) bad.push(`${id}: goblin without goblin tag`);
    if(/wolf/.test(name) && !/wolf|hound/.test(tags)) bad.push(`${id}: wolf without wolf/hound tag`);
    if(/lich/.test(name+id) && !/lich/.test(tags)) bad.push(`${id}: lich without lich tag`);
    if(row.key==='boss_lg' || /pumpkin|gourd|wicked/.test(row.key)) bad.push(`${id}: forbidden pumpkin/gourd key ${row.key}`);
  }
  // Every table key must exist as enemy OR be intentional alias — require file presence checked by gate script
  const orphanKeys=Object.keys(ENEMY_ART_KEYS).filter(k=>!list.some(e=>e.id===k));
  return { ok: missing.length===0 && bad.length===0, missing, bad, orphanKeys, count:list.length };
}

export function migrateV50(S){
  C49.migrateV49(S);
  S.flags=S.flags||{};
  S.flags.visual50=true;
  S.ver=50;
  return S;
}

export default {
  ...C49.default,
  densifyTownMapV50: C49.densifyTownMapV49,
  migrateV50, ENEMY_ART_KEYS, enemyArtKey, battleEnemyArt, battlerPathForKey, assertEnemyArtKeys,
  battleLayerKey: C49.battleLayerKey,
  battleLayerUrls: C49.battleLayerUrls,
  BATTLE_LAYER_KEYS: C49.BATTLE_LAYER_KEYS,
};
