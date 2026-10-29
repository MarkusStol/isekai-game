#!/usr/bin/env node
/** v50 gate: every ENEMIES id has ENEMY_ART_KEYS row + battler file + semantic tags */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const { ENEMIES } = await import(pathToFileURL(path.join(ROOT, 'enemies.js')).href);
const C50 = await import(pathToFileURL(path.join(ROOT, 'content50.js')).href);

const result = C50.assertEnemyArtKeys(ENEMIES);
let fileMiss = [];
for (const e of Object.values(ENEMIES)) {
  const row = C50.ENEMY_ART_KEYS[e.id];
  if (!row) continue;
  const fp = path.join(ROOT, 'assets/pixel/battler', row.key + '.png');
  if (!fs.existsSync(fp)) fileMiss.push(e.id + '→' + row.key);
  else {
    const st = fs.statSync(fp);
    if (st.size < 400) fileMiss.push(e.id + ' tiny file');
  }
}
// Forbidden: no enemy may resolve to boss_lg / pumpkin / gourd
const forbidden = [];
for (const e of Object.values(ENEMIES)) {
  const url = C50.battleEnemyArt(e);
  if (/boss_lg|pumpkin|gourd|wicked/i.test(url)) forbidden.push(e.id + '→' + url);
  if (/oger|ogre|wallbrecher|ghor/i.test(e.id + e.name) && !/boss_ogre|story_wallbreaker/.test(url)) {
    forbidden.push(e.id + ' ogre-family wrong art ' + url);
  }
}
const ok = result.ok && fileMiss.length === 0 && forbidden.length === 0;
console.log(JSON.stringify({
  ok, count: result.count, missing: result.missing, bad: result.bad,
  fileMiss, forbidden, sample: Object.values(ENEMIES).slice(0,5).map(e=>({id:e.id,name:e.name,art:C50.battleEnemyArt(e)}))
}, null, 2));
if (!ok) process.exit(1);
console.log('GATE enemy-art PASS');
