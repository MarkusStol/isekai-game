# Nocturna v71 / installer v0.71.0 — ship report

Shots: `/workspace/isekai-game-shots/v71-ship-report/` (desktop1080 dungeon suite + battle 80/80c–e, playtest-c1/).
Local gate: **PASSED** (`GATE_SKIP_LIVE=1`) — battler-size, foe-size, atk-fx, layout-reuse, dungeon-camera, unique-battlers, party-order, battle-bg-tex, camera-scale, overlap.

## Fixes vs v70 review

### Battle party + Fiend (`desktop1080-80-battle.png`, `80d-battle-dungeon.png`)
- Removed v70 column shrink (`flex:1` / max-height stack) that crushed party to ~40px top-right.
- FF6 absolute diagonal stagger via `--i` (right/top offsets in `vw`/`%`); CSS specificity beats v68 `min(118px)` square shrink.
- Measured @1080p: party imgs **127×167** (~120×158 CSS), lefts 1724→1578→1431→1285, tops 114→201→287→374 — no overlap pairs in gate.
- Fiend **240×240**, center-x **526** (left half of 1920); boss art path still 300px class.
- Attack step / slash / dmg FX kept (`atkStepFwd`, `.slash-fx`, `.dmg-pop`); staged shots 80c–e.
- Katakomb battles use `nocturna/dungeon.png` vault BG + dungeon parallax layers (not throne hub map).

### Schatzkatakomben + dungeon authorship (`60-dung-*`, playtest `05-dungeon-r1`)
- Ort `/katakomb/` no longer maps to throne tileset / throne preset.
- Authored presets: `catacomb`, `ice_cave`, `relic_vault`, `bone_labyrinth`, `watch_dungeon`, `aether_rift` (coffins, vaults, ice pools, glass niches, maze, watch shafts, aether choir).
- Per-Raum fingerprint shifts inside Schatzkatakomben (gate: 3 distinct room sigs).
- Map **56×48**, follow camera **scale 3**, frustum **40×22**, `wholeMap=false` (no indoor whole-map zoom / black gutter mode).
- `applyJrpgPack` + `startDungeon` refresh OW when ort/mode changes (fixes playtest still showing Thronsaal).
- Crypt tileset for dungeon kind (`tiles-nocturna/areas/crypt`).

### Gate additions
- `battler-size` / `foe-size` / `atk-fx`
- `layout-reuse` (no throne preset for Raum N; ≥4 distinct dungeon presets; Schatz rooms not identical)
- `dungeon-camera` (scale ~3, map > view, mapW≥48)

## Honest notes
- Vision captions on stills may still “see” v70 (small sprites / throne) — **DOM metrics + map fingerprints** are authoritative for this ship.
- Catacomb carves are authored corridors/rooms on crypt tiles, not a full hand-painted metroid map; coffins/altar/chests are placed props.
- Attack stills inject CSS classes/FX for freeze-frames; live ATB still plays lunge+slash+pop.
- Live Pages VER lags until deploy; installer follows tag `v0.71.0`.
- Untracked atlas/backup/maps assets remain out of ship (same as v70).

## Ship
- `VER` / SW / `package.json` → **71** / **0.71.0**
- Tag **v0.71.0** → GHA Windows NSIS + Pages from `main`.

## Verify
- Gate: 0 failures (SKIP_LIVE)
- Playtest c1: puzzle + boss win → `c2_open` (`scripts/playtest-nocturna-v71-c1.mjs` ok)
- Battle metrics: party ≥120px tall staggered; foe 240px left-half
- Dungeon meta: catacomb 56×48 @ scale 3

## Shipped
- Commit `5cb9db0` on `main`, tag **v0.71.0**
- Installer: https://github.com/MarkusStol/isekai-game/releases/download/v0.71.0/Nocturna-Setup-0.71.0-x64.exe (~92.5 MB)
- Release: https://github.com/MarkusStol/isekai-game/releases/tag/v0.71.0
- Playtest c1: puzzle + boss win → reward (`scripts/playtest-nocturna-v71-c1.mjs` ok)
- Gate: PASSED (SKIP_LIVE) — battler-size, foe-size, layout-reuse, dungeon-camera
