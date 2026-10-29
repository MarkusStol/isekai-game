# Isekai Reinkarnation — Art Direction v44

## Reference north stars
- **Chrono Trigger / FF6**: readable SNES-JRPG silhouettes, warm UI chrome, clear tile grammar
- **Octopath Traveler HD-2D**: depth via soft lighting, vignette, specular highlights on floors, multi-layer UI
- **Sea of Stars**: cohesive handmade pixel palette, juicy combat FX, consistent character scale

## One style (no pack clash)
| Layer | Rule |
|-------|------|
| World tiles | 16×16 pixel tiles, muted earth/teal base, high-contrast path edges |
| Characters | LPC-ish walk sprites + **unique procedural pixel bust portraits** (same palette as UI gold/ink) |
| UI | “Crystal window” — deep navy `#0b1224`, gold rim `#d4b45a`, parchment text `#f4efd8` |
| FX | Soft bloom only on highlights; no neon candy except cyberpunk genre tint |
| Typography | Title: display serif/cinzel feel; body: system UI, 14–16px readable |

## Palette (locked)
```
--ink:        #f4efd8
--ink-dim:    #b8b0a0
--navy-0:     #05070e
--navy-1:     #0b1224
--navy-2:     #162038
--gold:       #d4b45a
--gold-dim:   #8a7020
--hp:         #3ecf7a
--mp:         #5b9cff
--danger:     #e85d6a
--accent:     #a78bfa  (magic only)
```
Genre accents are **tints**, not new palettes (cyber: cyan rim, zombie: moss rim).

## Scale
- OW tile draw ≥ 3× integer scale on desktop, ≥ 2× on mobile
- Hero/NPC sprites occupy ~1 tile visually (no postage stamps)
- Dialogue portraits: 64–96 CSS px, pixelated, framed
- Battle foes: larger cards with readable names

## Lighting
- Always: soft vignette + ground contact shadows
- Day/dusk/night tints already exist — keep; add warm key-light ellipse near hero
- Interiors: cooler fill, warmer lamps (existing lights)
- Battle: subtle animated BG gradient + floor reflection strip

## Windows / UX
- Modal panels use shared `.jrpg-panel` chrome
- Buttons: 2px gold border, pressed translateY(1px)
- Menus breathe: 12–16px padding, less chrome clutter
- Onboarding: title → one clear CTA; settings secondary

## Performance (iPhone)
- No heavy WebGL bloom; CSS + canvas 2D overlays only
- Integer scaling, `image-rendering: pixelated`
- Cap particles; ambient audio already looped lightly

## Implemented in v44
- Richer 128px framed pixel busts (C44) with expression set
- OW camera zoom (mobile view 9×11) for readable sprites
- Autotile edge blend + vignette + hero key light (canvas 2D, iPhone-safe)
- Unified navy/gold JRPG window chrome + typography
- Shorter battle swirl (380ms) + animated battle BG pulse
- Softer battle screen transition

## Multi-perspective review (v44)
| Lens | Biggest issue found | Fix in v44 |
|------|---------------------|------------|
| Art | Hard tile seams, tiny sprites, weak portraits, swirl hides battle | zoom, edges, C44 portraits, swirl/FX |
| UX | Portrait often lost under OW; controls dominate | larger portrait CSS; VN hide OW in audit; panel contrast |
| Design | Battle readability | wait ATB preserved; swirl shortened |
| Narrative | OK — keep gates | no story rewrite |
| Audio | Ambient suite from v43 | kept; no new heavy beds |
| Perf | Avoid WebGL bloom on iPhone | canvas/CSS only |
| QA | Saves v13–43 must migrate | migrateV44 + gate versions +43 |
