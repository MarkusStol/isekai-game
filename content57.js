/* content57 — code-split boot, front-facing allies, SFX variety, music crossfade, hub portrait fallback */
import * as C56 from './content56.js';

export function migrateV57(S){
  C56.migrateV56(S);
  if(!S || typeof S!=='object') return S;
  S.ver = Math.max(Number(S.ver)||0, 57);
  S.flags = S.flags || {};
  S.flags.visual57 = true;
  S.flags.perf57 = true;
  S.flags.audio57 = true;
  return S;
}

/** Hub portrait for proc/genre worlds when pc.portrait missing */
export function hubPortraitFallback(S){
  const pc = S?.pc?.portrait;
  if(pc) return `assets/port/${pc}.webp`;
  const role = S?.role;
  if(role==='held' || role==='heldin') return 'assets/port/heldin.webp';
  if(role==='grey') return 'assets/port/grey/darren.webp';
  const g = String(S?.genre||S?.world?.systems?.kind||'').toLowerCase();
  if(/zombie|apoc|survival/.test(g)) return 'assets/port/zombie/leader.webp';
  if(/cyber|neon|punk/.test(g)) return 'assets/port/cyberpunk/runner.webp';
  if(/dark|horror|gothic/.test(g)) return 'assets/port/darkfantasy/jaeger.webp';
  // generic hero
  return 'assets/port/heldin.webp';
}

export default { migrateV57, hubPortraitFallback };
