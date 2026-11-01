# Nocturna v69 / installer v0.69.0 — ship report

Shots: `/workspace/isekai-game-shots/v69-ship-report/` (80 PNGs + gate/shot logs + zoom crops).
Local gate: **0 failures** (`GATE_SKIP_LIVE=1`).

## Kept from v68
- FF6 battle UI (cmd column, party strip, short names, foe HP, hint) stays clean — `desktop1080-80-battle.png`.
- Overlap audit still green (`battle-ff69`, `menu-hub`).

## Fixes
### Distinct companion battlers
- Bug: `sheetRoleForCompanion` mapped Brok **and** Aria → `guard` (identical blue knights).
- v69: Velka → `ally_velka.png` (mage/teal), Brok → `ally_brok.png` (crimson-cape knight), Aria → `ally_aria.png` (peach Heldin). Named overrides in `partySpriteUrl`.
- Gate `unique-battlers`: `ally_velka / ally_brok / ally_aria` (+ hero).

### Grenzpass camera + tiles (desktop1080-16-hub-pass)
- Restored fixed gameplay camera: **scale 3 @ 1080p**, logical 640×360, **tileCss ≈ 48**, frustum **40×22**, follows player.
- Pass map enlarged **52×42** (was 30×28 < frustum → whole-map overview).
- Dropped outdoor cover-zoom / whole-map expand; integer **contain** (not cover).
- Pass snow-dominant: grass→sand, path wang skips green `path0–4`, cliff wang rock-only `cliff0–3` (cliff4–7 are green).
- OOB: snow + rock faces + dark fog vignette — **no pine-wall filler** (edge pine thicken removed).
- Gate: `camera-scale` OK; `tile-repetition` greenRatio≈0.028, snowRatio≈0.40, pineOh=6.

### Skill-tree labels
- Nodes **200×84**, 13px titles, 2-line desc clamp — full lines like “Gruppen-Angriff +5%” / “Analyse zeigt Schwächen” readable in `desktop1080-82-progress.png`.

## Honest visual notes
- Battle party sprites are distinct and readable; layout matches v68 polish.
- Pass is snow-led with rock bands; residual green is mostly tree/pine cluster crowns, not grass wang patchwork. Cliff faces remain somewhat blocky (16px wang limits).
- Throne hub still fills the room (indoor modest zoom) — intentional, not the pass overview bug.
- Desktop720 uses scale 2 (tileCss 32) — expected at 1280×720.

## Ship
- `VER` / SW cache / `package.json` → **69** / **0.69.0**
- Tag **v0.69.0** → GHA Windows NSIS release + Pages deploy from `main`.

## Shipped
- Commit `00f5b15` on `main`, tag **v0.69.0**
- Installer: https://github.com/MarkusStol/isekai-game/releases/download/v0.69.0/Nocturna-Setup-0.69.0-x64.exe (~92 MB)
- Release: https://github.com/MarkusStol/isekai-game/releases/tag/v0.69.0
- Shots + REPORT: `/workspace/isekai-game-shots/v69-ship-report/`
