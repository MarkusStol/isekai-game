# Nocturna v74 / installer v0.74.0 — ship report

Shots: `/workspace/isekai-game-shots/v74-ship-report/` (full desktop1080/720 suite + `desktop1080-refresh-*` + `first15/` + compare plates).
Local gate: **PASSED** (`GATE_SKIP_LIVE=1`) — includes dungeon-camera, dungeon-spawn-view, camera-scale (scale **3**, tileCss **48**, view **40×22**), unique-battlers (`ally_velka.png`), battle FX.

## Art direction pivot (why not another dungeon patch)

v72–v73 incremental crypt tiles did not converge on readability. v74 steps back:

1. **One tileset family** — [Ninja Adventure CC0](https://pixel-boy.itch.io/ninja-adventure-asset-pack) (Pixel-Boy + AAA), vendored under `assets/vendor/ninja-adventure/` + `assets/pixel/tiles-na/` (sheets + cuts).
2. **Art bible** — `ART-BIBLE.md` (¾ walls, NA biomes per hub, pixel battle BGs, no painterly/nocturna mix).
3. **All map kinds** remapped through `BASE_TILES` / `applyGenre` / `wangUrlFor` / dungeon draw to **tiles-na/cut only** (throne, pass, cathedral, crypt/dungeons, outdoor).
4. **Battle backgrounds** — `assets/pixel/bg-battle/nocturna/*.png` replaced with **pixel composites** from the same NA cuts (not soft webp illustrations).

Kept from v72 review: **battle layout** + **clerk Velka** battler.

## Gameplay feel (v74)

| Feature | Status |
|--------|--------|
| Shift-run | Yes (`stepHero` speed 6→11) |
| 8-dir grid | Yes (diagonal `tryMove`) |
| Interact prompts | Face-tile label `E · Sprechen/Truhe/Durchgang` |
| Visible map encounters | NA monster sheets seeded in dungeon/wild/pass; bump → `startEncounter` |
| Chest fanfare | Toast + on-screen ✦ banner |
| Level-up screen | Modal via `Level.showLevelUpScreen` (~2.2s) |
| ATB pacing | Fill rate raised (`max(3.8, spd*1.15)`) |
| First arc | C60 hook + Velka party + fight path + chest/level-up (see first15) |

## First-15 playtest (`scripts/playtest-first15-v74.mjs`)

- Frame shots in `first15/` (title → hook → hub → Velka).
- Fight step **timed out** in Puppeteer (`protocolTimeout`) — **not** a clean timed 15‑min human run. Gate still shows story bosses resolving in ~3 turns.
- Critique JSON: `first15/critique.json`.
- Honest pacing: on-map encounter → battle handoff needs soak; level-up modal is short; hub→dungeon travel still menu-heavy vs Zelda-like seamlessness.

## Side-by-side plates

- `compare-v72-vs-v74.png` — katakomben, gruft, pass, throne before/after.
- `compare-ff-principles-vs-v74-dungeon.png` — **illustrative** FF6/CT *principles* plate (lit top + dark front + floor shadow + black void + hero scale), **not** ripped Square IP, vs our katakomben refresh.

### FF6 / Chrono Trigger dungeon comparison (honest)

| Principle | FF6 / CT reference | Nocturna v74 |
|-----------|-------------------|--------------|
| Floor vs wall chroma | Floors mid-value; walls clearly darker fronts | Improved with light `dfloor_*` vs black void; wall fronts now drawn but still short of SNES autotile richness |
| ¾ wall (top + front + floor shadow) | Always | Implemented in dungeon draw path; NA `wall_simple` was weak → refreshed drawn tops/fronts |
| Camera | Character ~readable (~⅓–½ tile row) | Gate: **3× / ~48 CSS px** hero (logical 16px × scale). Stills can *look* tiny if you count canvas pixels |
| Rock / void | Solid black or unique rock | Solid `#05060a` void (no purple carpet rock) |
| Torches | Warm pools | Radial pools kept |
| Cohesion | One chipset per area | One NA family globally — biggest win vs v72 style soup |

## Remaining gaps (do not hide)

- Full itch NA zip (30 MB Godot V4) was not downloadable without itch auth; we used GitHub + Superpowers sheets. Richer outdoor props/houses still thin vs a full chipset.
- Throne purple “carpet” diagonals come from **map generation** (`carpet` tile), not a second art pack — redesign layout next if needed.
- Map-encounter battle handoff + first15 fight framing incomplete.
- Overhead buildings still use older decor sheets (not fully NA).

## Ship

- `VER` / SW / package → **74** / **0.74.0**
- Commit `b0b57e8` · tag **v0.74.0** · GHA [Windows installer](https://github.com/MarkusStol/isekai-game/actions/runs/41311920475) **success** (Europe/Berlin ~14:37)
- Release: https://github.com/MarkusStol/isekai-game/releases/tag/v0.74.0
- Installer: https://github.com/MarkusStol/isekai-game/releases/download/v0.74.0/Nocturna-Setup-0.74.0-x64.exe (~92.6 MB)
- Pages: builds from `main` (same commit)

## Verify

- Gate: 0 failures (SKIP_LIVE)
- camera-scale: scale 3, tileCss 48, 40×22
- dungeon-spawn-view: maxDom≈0.22, minWalk≈0.56
- Battle: party order + `ally_velka.png` + foe sizing OK
