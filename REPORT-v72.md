# Nocturna v72 / installer v0.72.0 — ship report

Shots: `/workspace/isekai-game-shots/v72-ship-report/` (desktop1080/720 dungeon suite + battle 80/80c–e, playtest-c1/).
Local gate: **PASSED** (`GATE_SKIP_LIVE=1`) — battler-size, foe-size, atk-fx, layout-reuse, dungeon-camera, **dungeon-spawn-view**, unique-battlers, party-order, battle-bg-tex, camera-scale, overlap.

## Fixes vs v71 review

### Battle kept (`desktop1080-80d-battle-dungeon.png`)
- FF6 diagonal party + centred Fiend unchanged (party imgs **127×167**, foe **240×240** cx **526**).
- Attack step / slash / dmg FX kept.

### Velka battler = scholar (not cream princess gown)
- Regenerated `assets/pixel/battler/ally_velka.png`: short purple hair, forest-green clerk robe, white collar/cuffs, clipboard, satchel+ledger, boots.
- Wired as named battler `ally_velka.png` (party-order / unique-battlers confirm).

### Dungeons rewritten as authored carves (all `60-dung-*`)
- Root cause of v71 katakomben void: spawn landed in a tiny edge vestibule while camera looked at solid brown **iwall** wang; Passants seeded via `presentFiltered`; gates only checked layout fingerprints / camera scale.
- v72: every dungeon preset carves **2–4-wide (mostly 3)** corridors + rooms around a **center spawn** (`questMark._dungSpawn`) so the 40×22 frustum sees architecture.
- Presets: `catacomb`, `ice_cave`, `relic_vault`, `bone_labyrinth`, `watch_dungeon`, `aether_rift` with props (coffins, chests, altars, glass, torches).
- Wall wang: **near-black** `cwall0/5` only (cwall1–4 are brown and read as floor). Floor wang: dark `cfloor1/3/5` + jitter.
- Wall-height sprites only on walls **edge-adjacent to walkables** (no forest of pillars in solid rock).
- Dungeons skip Passant/Edelfrau crowd NPCs (`skipCrowd`); authored cast only (Imp-Schuldner, Grabräuber Jex, Hüter Orun, Rekrut Venn).

### New gate: `dungeon-spawn-view`
- Renders each dungeon spawn view (9 orte: katakomben r1/r3/r5, eishoehlen, reliquien, knochen, wachtuerme, gruft, solari).
- Fails if any single wang tile pattern owns **>40%** of the frustum, if name tags would overlap / same-tile NPCs, if generic townsfolk sheets appear, or if walkable ratio in frustum **<22%**.
- v71 layout-reuse / dungeon-camera gates remain.

## Honest notes
- Floors still use crypt `cfloor` plank-ish dark stone — not a hand-painted tileset; corridors/rooms are procedural carves with placed props.
- Vision captions on stills sometimes still invent “Passant” for Imp/Jex sprites; **NPC list + gate** are authoritative (no villager/princess sheets in dungeons).
- Velka battler is rear three-quarter scholar (clipboard) — matches portrait role; not a front-facing SNES clone of the portrait frame.
- Live Pages VER lags until deploy; installer follows tag `v0.72.0`.
- Untracked atlas/backup/maps assets remain out of ship (same as v71).

## Ship
- `VER` / SW / `package.json` → **72** / **0.72.0**
- Tag **v0.72.0** → GHA Windows NSIS + Pages from `main`.

## Verify
- Gate: 0 failures (SKIP_LIVE) including dungeon-spawn-view (maxDom≈0.22, minWalk≈0.56)
- Playtest c1: puzzle + boss win → `c2_open` (`scripts/playtest-nocturna-v72-c1.mjs` ok)
- Battle: party staggered; foe 240px left-half; `ally_velka.png` in party stage
- Dungeon meta: 56×48 @ scale 3; center spawn; authored NPCs only
