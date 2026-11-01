# Nocturna v70 / installer v0.70.0 — ship report

Shots: `/workspace/isekai-game-shots/v70-ship-report/` (desktop1080+720 suite, attack sequence 80c–e, playtest-c1/).
Local gate: **PASSED** (`GATE_SKIP_LIVE=1`) — unique-battlers, party-order, battle-bg-tex, camera-scale, tile-repetition, overlap.

## Fixes vs v69 review

### Grenzpass decor + cliffs (`desktop1080-16-hub-pass.png`)
- Removed stump-wang under pines (`plantCluster` no longer stamps `tree` tiles; leftover tree/grass scrubbed → sand).
- Varied pine overhead (`pine` / `pine2` / `pine3` / `pine_tall`) in denser belts.
- Snowdrifts, footprints, rocks, dead bushes via overlay scatter (~200 overlays: footprints≈87, snowdrift≈72, rock/dead_bush≈15 each).
- Height-shaded cliff faces (snow cap + multi-band rock + shadow + jagged toe) instead of thin dark lips.
- Camera still scale-3 / tileCss≈48 / frustum 40×22 on 52×42.

### Battle BG + party order + Velka (`desktop1080-80-battle.png`)
- Regenerated `nocturna/throne.png` (+ cathedral copy): bricks, pillars, torches, carpet/dais.
- Dungeon parallax layers under throne/cathedral + torch-flicker `battle-bg-tex` (v68-style depth; not flat blocks).
- Party stage CSS column top→bottom matches HUD list: **Noctis → Velka → Brok → Aria**.
- Velka battler recolored from mage sheet (sage/cream + green hair) — secretary/scholar, not ball gown (gown stays Aria).

### Attack juice + shot sequence
- Step-forward (`atk-step`), slash FX (`slash-fx`), larger damage pops; wired before `popNumber`.
- Shots: `80c-atk-step`, `80d-atk-slash`, `80e-atk-dmg` (dmg shows floating **42**).

### Chapter 1 slice (~52 min estimate)
- Intro beat `c1_intro` → throne open.
- Dungeon 5 rooms + **ledger seal puzzle** (room 3, sum 27) + boss setpiece + `c1_reward`.
- Puppeteer E2E `scripts/playtest-nocturna-v70-c1.mjs`: puzzle flag + `beat_lesser_fiend` + reward → `c2_open` (**ok: true**).

## Honest notes
- Pass is much denser than v69; residual green on some cliff tops is pine canopy / residual grass scrub edge cases, not stump wang floors.
- Throne battle BG is hand-painted + dungeon underlay — still geometric vs a full painted matte, but clearly torch-lit textured hall (not flat color blocks).
- Attack anim shots are staged (class/FX injected) for stills; live ATB also runs lunge+slash+pop on hit.
- Gate `tile-repetition` greenRatio≈0.028, snowRatio≈0.39 — within bar.
- Live Pages VER will lag until deploy; installer follows tag `v0.70.0`.

## Ship
- `VER` / SW / `package.json` → **70** / **0.70.0**
- Tag **v0.70.0** → GHA Windows NSIS + Pages from `main`.
