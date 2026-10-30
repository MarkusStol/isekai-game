# Pixel Art Credits (v26–v40)

All art under `assets/pixel/` is derived from the following sources. Original
pack archives are **not** committed; only cropped/composited game assets are.

## Liberated Pixel Cup (LPC) / Universal LPC spritesheets
- Source: [LPC Spec](https://lpc.opengameart.org/) / Universal LPC Spritesheet Character Generator assets
- License: **CC-BY-SA 3.0** (and GPL where dual-licensed by authors)
- Used for: hero & NPC walk sheets (`assets/pixel/hero/`, `assets/pixel/npc/`), portraits
- Attribution: Liberated Pixel Cup contributors (see OpenGameArt LPC collection)

## Zelda-like Tilesets (ArMM1998)
- Source: OpenGameArt — “Zelda-like tilesets and sprites”
- License: **CC0 1.0**
- Used for: overworld grass/path/water/tree/house tiles (`assets/pixel/tiles/`, genre packs)

## LPC base_out_atlas / terrain atlases
- Source: OpenGameArt LPC terrain packs
- License: **CC-BY-SA 3.0** / CC0 where marked
- Used for: wall/floor/door/house accents, dungeon tiles

## Ninja Adventure (Pixel-Boy / faeluptus / Pixel Frog)
- Source: [Ninja Adventure Asset Pack](https://pixel-boy.itch.io/ninja-adventure-asset-pack)
- License: **CC0 1.0**
- Used for: floor autotile references, some decor, battle backgrounds

## Kenney
- Source: [Kenney.nl](https://kenney.nl) — RPG Urban Pack, Input Prompts
- License: **CC0 1.0**
- Used for: UI prompt icons (optional), urban accents

## Font
- Press Start 2P — SIL Open Font License (via Google Fonts)

If you redistribute this game, retain this CREDITS.md and the CC-BY-SA share-alike
obligations for LPC-derived character sprites.

## Audio (v27)
- Ninja Adventure musics & sounds (Pixel-Boy / faeluptus) — **CC0 1.0**
  - Used as: `assets/audio/music/*.ogg`, `assets/audio/sfx/*.ogg`


## Buildings (v29)
- **[LPC] Thatched-Roof Cottage** (OpenGameArt) — modular cottage walls/roofs composited into `housebig*` / `hall*`
- **[LPC] City Outside** by Tuomo Untinen (+ LPC contributors Sharm, Hyptosis, et al.) — CC-BY-SA 3.0 / GPL — city preview buildings & tiles
- **Stone Home Exterior / Desert House** (OpenGameArt LPC-compatible) — hall/desert variants
- **Zelda-like tilesets** (ArMM1998, CC0) — additional complete house crops
- **Kenney RPG Urban Pack** (CC0) — urban brick composites for neon/cyber presets

## Combat sprites (v29)
- Universal LPC spritesheets — slash / hurt / spellcast / thrust composited for hero, NPCs, skeleton enemies (CC-BY-SA 3.0)

## v30
- Denser LPC thatched composites; night window/lamp lights; companion battle crops from LPC slash sheets

## v31
- Richer LPC thatched house composites (windows, chimney, beams)
- Pixel intro cutscene; region travel map (horse/boat/airship)
- Per-merchant shop stocks + reputation pricing; NPC clock calendars; quest markers from quest data

## v32
- Airship unlock gated (ticket / quest); boats only between harbor-tagged places
- Full regional market sim (season, region, events) wired into shops
- Bespoke pixel intro cutscene backgrounds + pose strips (`assets/pixel/cutscene/`)
- Rebuilt LPC housebig0–7 and hall0–3 variants (richer windows/roofs)
- First-hour genre playtest fixes (everyday intents, place descs, rest vs sleep)


## v33 house crops
Rebuilt denser exterior crops from LPC city_outside / cottage / thatched-roof / desert_house and zelda-like atlas; window/door/chimney overlays. Same CC-BY licenses as LPC sources listed above.


## v34 house density
All `housebig*` / `hall*` rebuilt to ≥~0.85 opaque fill with consistent window/door/chimney overlays from LPC city/cottage sources (CC-BY).


## v35 architecture variants
Genre packs `arch_fan*`, `arch_zom*`, `arch_cyb*`, `arch_des*`, `arch_dark*` plus `housebig8–15` / `hall4–7` cropped from LPC city/cottage/desert (CC-BY) with genre accents.

## v36 UI + camp tiles

- Burnt/ash/ember/fence_broken/camp_burnt tiles for damaged-home overworld overlay.
- FF6/Chrono Trigger–inspired UI polish (opaque gold-border panels, less candy glass).
- Regional floorplan variants (cyber/wastes/dark/desert/walled/harborish/gardenish/marketish/fantasy).

## v37 UX + narrator

- Global first-name uniqueness; FF6/CT candy CSS removal; iPhone onboard coach; battle touch targets.
- Compact Pollinations lean pack + multi-endpoint failover for Classic 503s.

## v38 Offline narrator + keys

- Richer offline phrase pools (genre/situation/NPC), session anti-repeat (`_offlineRecent` / `_offlineOut`).
- Settings: Gemini + Pollinations pollen key fields, on-device only, narrator status indicator; gate skip → offline.
- No keys committed. Playtest: 40+ inputs/genre repetition/coherence.

## v39 Content depth

- Emergent per-genre threads (factions, escalating rumours), NPC side arcs with endings.
- Optional dungeons (puzzle/trap/loot/multi-phase boss), cooking + expanded craft tiers, mid-game job unlocks.
- Nothing railroaded.

## v40 Boss E2E + craft stations + minimap

- Full dungeon boss fights (phases, win/flee/talk/spare) in real battle UI.
- Every NPC gets wound/desire/secret arc hooks.
- Hard craft tier gating via stations/skills.
- Dungeon minimap + pixel boss intro cutscenes.

## v49 Battle battlers (CC0)
- **Kica's Enemy Pack** by Fava Beans (OpenGameArt) — CC0 1.0 — slime/wolf/skeleton/bat/imp/golem/bandit/boss sprites under `assets/pixel/enemy/`
- **Pixel Bosses. Yes!** by Monster Logix Studio (OpenGameArt) — CC0 1.0 — sheet kept in `assets/pixel/enemy/src/pixel_bosses_sheet.png`
- **50+ Monsters Pack 2D** by isaiah658 (OpenGameArt) — CC0 1.0 — credited; see `assets/pixel/enemy/src/isaiah658_credits.txt`

## v50 name-matched battlers
- Per-enemy art-key table (`content50.js` `ENEMY_ART_KEYS`) maps every `ENEMIES` id to `assets/pixel/battler/{id}.png`.
- Original JRPG-style battler sprites generated for this project (ogre/goblin/slime/wolf/etc.) — not the v49 Wicked Gourd heuristic.
- CC-BY packs kept as credit lineage: Admurin Enemy Galore I, Wishforge Free Pixel Sprites (OpenGameArt) — referenced for style, primary battlers are project-generated name-matched art.
- Gate: `scripts/gate-enemy-art.mjs` asserts every enemy has an appropriate key + file on disk.

## v57 — Front-facing ally battlers & SFX variety
- Ally battlers (`assets/pixel/battler/ally_*.png`): front-facing idle crops from
  **Ninja Adventure** character sheets (Pixel-Boy / faeluptus, **CC0 1.0**) with
  integer nearest-neighbor upscale + 1px outline; where denser, Universal LPC
  walk/idle front rows (CC-BY-SA 3.0) were preferred for the hero composite.
- Additional SFX (`hit_*`, `step_*`, `ui_*`): from Ninja Adventure sounds pack (**CC0 1.0**).


## v58 — Classic JRPG allies + Nocturna campaign
- Ally battlers rebuilt from denser LPC stage composites already in-repo
  (`assets/pixel/chars/*_stage.png`, `assets/pixel/hero/stage.png`) →
  `assets/pixel/battler/ally_*.png` (CC-BY-SA 3.0 LPC / prior attributions).
- Sparse v57 Ninja Adventure crops retained under `assets/pixel/battler/_v57_sparse/` (CC0).
- Free-text narrator archived: git tag/branch `freetext-archive`; runtime flag `FREETEXT_ENABLED=false` in `content58.js`.

## v59 — Ally fidelity & FF presentation
- Ally battlers: LPC stage composites (CC-BY-SA 3.0 lineage) re-framed with outline, contrast, ground shadow.
- Presentation: FF-like nameplate dialogue boxes, column choice menu, fade transitions (`body.visual59`).
- Softlock fix: boss choice no longer advances chapter before ATB ends; idempotent `onBossVictory`.
