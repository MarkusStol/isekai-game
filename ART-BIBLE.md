# Nocturna Art Bible (v74)

## One family
All maps, props, and battle backgrounds use the **Ninja Adventure** CC0 pack (Pixel-Boy + AAA) as the single visual language.
- Vendor: `assets/vendor/ninja-adventure/` + `assets/pixel/tiles-na/`
- Source: https://pixel-boy.itch.io/ninja-adventure-asset-pack (CC0)
- Grid: **16×16** ground tiles; props may be 16×32 / 32×48
- Camera: **¾ top-down** (lit top face + darker front on walls/cliffs) — never pure orthographic flat blobs

## Palette & contrast
- Outdoor grass: saturated NA greens; paths warmer brown/ochre
- Pass/snow: white/blue NA snow + grey rock cliffs
- Interiors: warm wood / cool stone from `interior_floor` sheet
- Dungeons: mid-grey lit stone floors (`dfloor_*`) vs **near-black void** (`dvoid`) — floor never matches wall chroma
- Torches: warm radial pools; no painterly gradients on terrain

## Walls (mandatory)
Every wall edge adjacent to walkable floor draws:
1. Lit top face (`wall_top*`)
2. Tall dark front face (`wall_front*`) when south is walkable
3. Soft shadow cast onto the floor south of the wall

## Characters
- Overworld actors stay on the NA ¾ scale (~1.3 tiles tall on screen at 3× → ~48 CSS px)
- Battlers may keep existing ally sheets but battle **backgrounds** must be pixel composites from NA tiles (no soft painterly photos)

## Do not
- Mix tiles-nocturna wang plank floors with NA grass
- Use purple cobble as “rock”
- Zoom dungeons to whole-map overview
- Paint battle BGs as illustrations that fight the sprite scale

## Biome map
| Ort | NA biome keys |
|-----|----------------|
| Thronsaal / Festung | ifloor_stone / wall_top / carpet |
| Grenzpass | biome_snow / cliff_snow / path |
| Kathedrale | ifloor_tile / wall_top |
| Solmir / Gruft / Katakomben | dfloor_* / wall_* / dvoid |
| Outdoor wild | grass* / path* / water* / tree |

## Audio/feel (paired with art)
Chest open = short fanfare; level-up = modal beat; map encounters = visible NA monsters.
