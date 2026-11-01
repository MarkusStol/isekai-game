# Nocturna v0.68.0 ship report

Date: 2026-11-01 (Europe/Berlin)
Shots: `/workspace/isekai-game-shots/v68-ship-report/` (desktop1080 + desktop720)

## Intent
Keep FF6 PC battle layout from v67; fix battle UI bugs; fill overworld 16:9 without purple void; ship Windows installer 0.68.0; gate overlap audit for battle/menus.

## Fixes (honest)
1. **Command popup** — was 2-col grid mash (`Fähigkeiltem` etc.). Now single-column flex list, one command per line, hand cursor on focused row, padding. Verified in `desktop1080-80-battle.png` / `80b-setpiece-boss.png`.
2. **Top party clip** — party stage uses space-evenly + smaller sprites (`min(118px,10.5vw,15vh)`); top knight no longer cut off in 1080 battle shots.
3. **Party names** — `shortBattleName` → Velka / Brok / Aria; 88px name column, nowrap; no wrap into HP labels in battle strip.
4. **Enter/A prompt** — moved to bottom-left of stage (`.battle-kb-hint`); no longer overlaps top-right icons.
5. **Enemy panel** — foe strip shows count `Gegner · n/n` + HP bar rows (was empty).
6. **Battle BG** — `.battle-bg-tex` hatch/lighting + stronger floor gradients; walls less flat (still limited by source BG art).
7. **Overworld 16:9** — desktop cover frustum; interiors zoom so room fills frame; richer OOB stone fill (no purple page pillars). Throne/cathedral fill edge-to-edge; Grenzpass uses biome tree fill at sides (not purple void).
8. **BattleRoot hide bug** — `.battle-ff67 { display:flex !important }` beat `.hidden`; gated with `:not(.hidden)`. Shot/gate must **await** lazy `Battle.__forceHide()` (proxy is async) or menu/inn shots go black. Documented in gate/shot.

## Gate
Local `GATE_SKIP_LIVE=1 node scripts/gate-player-inputs.mjs` → **GATE PASSED**, failures 0.
New checks: `overlap-audit` battle-ff68 + menu-hub **clean**.

## Residual / honesty
- Progress skill-tree nodes can look cramped (small FP labels) — not battle-cmd overlap; not failing overlap audit.
- Battle wall texture depends on BG image + CSS overlay; not hand-painted tiles.
- Outdoor narrow maps still show biome side fill (intentional cover), not stretched tiles.
- Untracked atlas/backup assets under `assets/pixel/` were **not** included in this ship commit.

## Installer
Tag **v0.68.0** → GitHub Actions `windows-installer.yml` builds `Nocturna-Setup-0.68.0-x64.exe`.
Expected URL: https://github.com/MarkusStol/isekai-game/releases/download/v0.68.0/Nocturna-Setup-0.68.0-x64.exe
