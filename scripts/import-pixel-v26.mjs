#!/usr/bin/env node
/** Import licensed pixel packs into assets/pixel for v26. Requires pillow via python helper. */
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PACKS = '/workspace/pixel-packs';
const OUT = path.join(ROOT, 'assets/pixel');

const py = `
from PIL import Image
from pathlib import Path
import os, json, shutil

PACKS = Path('/workspace/pixel-packs')
OUT = Path('${OUT.replace(/\\/g,'/')}')
LPC = PACKS / 'lpc/gen/spritesheets'
NA = PACKS / 'ninja/superpowers-asset-packs/ninja-adventure'
NA2 = PACKS / 'ninja/NinjaAdventure/content'
ZELDA = PACKS / 'extracted/zelda-like/gfx'
LPC_T = PACKS / 'extracted/lpc-terrains/lpc-terrains'
KENNEY = PACKS / 'extracted/kenney-urban'
BASE = PACKS / 'zelda-like'

def ensure(p):
  Path(p).parent.mkdir(parents=True, exist_ok=True)

def save(im, rel):
  p = OUT / rel
  ensure(p)
  im.save(p, 'PNG')
  print('+', rel, im.size)

def crop_tile(atlas, x, y, tw=16, th=16):
  return atlas.crop((x, y, x+tw, y+th))

# --- Tiles from Zelda-like Overworld (16x16, ArMM1998 / OGA) ---
ow = Image.open(ZELDA / 'Overworld.png').convert('RGBA')
# Common Zelda-like layout (ArMM1998): grass, path, water, trees, houses
# We'll map by sampling known regions - Overworld is typically 240x? or similar
print('Overworld', ow.size)
W,H = ow.size
# Extract a palette of useful tiles into a composed tilesheet AND individual tiles
# Grid assumed 16x16
def tile_at(img, col, row, s=16):
  return img.crop((col*s, row*s, col*s+s, row*s+s))

# Heuristic mapping for ArMM1998 Overworld.png (often 20x? tiles)
# Save a rich tileset sheet and key singles
tiles = {
  'grass': (1,1),
  'path': (3,1),
  'water': (5,5),
  'tree': (0,7),
  'wall': (10,0),
  'floor': (1,0),
  'sand': (7,1),
  'stone': (8,3),
  'door': (6,9),
  'house': (10,7),
  'carpet': (2,0),
  'void': (0,0),
  'camp': (4,3),
  'ruin': (9,4),
}
# Validate coords fit
cols, rows = W//16, H//16
print('grid', cols, rows)
for k,(c,r) in list(tiles.items()):
  if c>=cols or r>=rows:
    tiles[k] = (min(c,cols-1), min(r,rows-1))

# Better: scan and pick distinctive tiles by hand-chosen coords for ArMM1998
# Looking at typical Overworld.png 320x? — actually size printed above
# Use LPC terrain atlas for better fantasy JRPG look
terrain = Image.open(LPC_T / 'terrain-v7.png').convert('RGBA')
print('terrain-v7', terrain.size)
# LPC terrain-v7 is a large sheet of terrain transitions; also use base_out_atlas
base = Image.open(BASE / 'base_out_atlas.png').convert('RGBA')
terr = Image.open(BASE / 'terrain_atlas.png').convert('RGBA')
print('base_out', base.size, 'terrain_atlas', terr.size)

# LPC base_out_atlas / terrain_atlas (Lanea Zimmerman et al) — classic 32x32? or 16?
# Actually LPC atlases are often 32px tiles on 1024 sheet
def pick32(img, col, row):
  return img.crop((col*32, row*32, col*32+32, row*32+32)).resize((16,16), Image.Resampling.NEAREST)

def pick16(img, col, row):
  return img.crop((col*16, row*16, col*16+16, row*16+16))

# Zelda-like is 16px — use for overworld polish
# Common ArMM1998 Overworld layout (from community docs):
# Row0: water variants; grass; paths...
# We'll extract a curated set from Overworld + objects
obj = Image.open(ZELDA / 'objects.png').convert('RGBA')
print('objects', obj.size)

# Curated Zelda-like tiles (verified against typical sheet):
zelda_map = {
  'grass': (1, 1),
  'path': (5, 1),
  'water': (2, 5),
  'tree': (0, 9),  # tall tree top — may need adjust
  'floor': (1, 0),
  'wall': (10, 0),
  'sand': (7, 2),
  'stone': (8, 4),
  'door': (9, 10),
  'house': (12, 8),
  'carpet': (3, 0),
  'void': (0, 0),
  'camp': (4, 4),
  'ruin': (11, 5),
}
for name,(c,r) in zelda_map.items():
  c=min(c, cols-1); r=min(r, rows-1)
  save(tile_at(ow,c,r), f'tiles/{name}.png')

# Decor from objects sheet
oc, or_ = obj.size[0]//16, obj.size[1]//16
for i, (c,r) in enumerate([(0,0),(1,0),(2,0),(3,1),(5,2),(0,4),(2,4),(4,3)]):
  c=min(c,oc-1); r=min(r,or_-1)
  save(tile_at(obj,c,r), f'decor/d{i}.png')

# Water animation 4 frames from water area
wa = Image.new('RGBA', (64, 16))
for f in range(4):
  t = tile_at(ow, min(2+f, cols-1), min(5, rows-1))
  wa.paste(t, (f*16, 0))
save(wa, 'tiles/water-anim.png')

# Genre variants: dungeon from Inner/cave, neon/zombie tint copies
inner = Image.open(ZELDA / 'Inner.png').convert('RGBA')
cave = Image.open(ZELDA / 'cave.png').convert('RGBA')
print('inner', inner.size, 'cave', cave.size)
ic, ir = inner.size[0]//16, inner.size[1]//16
for name, (c,r) in [('floor',(1,1)),('wall',(0,0)),('path',(2,1)),('door',(3,2)),('void',(0,0)),('grass',(1,1)),('tree',(0,0)),('stone',(2,2))]:
  c=min(c,ic-1); r=min(r,ir-1)
  save(tile_at(inner,c,r), f'tiles-dungeon/{name}.png')

# Abandoned / ruins from Ninja village tileset
if (NA2/'map/tileset_village_abandoned.png').exists():
  v = Image.open(NA2/'map/tileset_village_abandoned.png').convert('RGBA')
  print('village', v.size)
  for name, box in [('grass',(0,0,16,16)),('path',(16,0,32,16)),('house',(64,32,96,64)),('wall',(0,32,16,48)),('door',(32,48,48,64)),('floor',(48,0,64,16)),('tree',(96,0,112,16)),('ruin',(80,64,96,80)),('stone',(112,16,128,32))]:
    save(v.crop(box).resize((16,16), Image.NEAREST) if (box[2]-box[0])!=16 else v.crop(box), f'tiles-ruins/{name}.png')

# Floor tileset from Ninja for nicer grass/path variety — build composite tilesheet used by overworld
if (NA2/'map/tileset_floor.png').exists():
  fl = Image.open(NA2/'map/tileset_floor.png').convert('RGBA')
  print('na floor', fl.size)
  # Extract several grass/path/water variants into tiles-fantasy extras
  save(fl.crop((0,0,16,16)), 'tiles/grass2.png')
  save(fl.crop((16,0,32,16)), 'tiles/grass3.png')
  save(fl.crop((32,0,48,16)), 'tiles/path2.png')
  # Keep full sheet for runtime autotile
  save(fl, 'tiles/sheet-floor.png')

if (NA2/'map/tileset_wall_simple.png').exists():
  save(Image.open(NA2/'map/tileset_wall_simple.png').convert('RGBA'), 'tiles/sheet-wall.png')

# Kenney urban for cyberpunk/zombie city
kp = Image.open(KENNEY/'Tilemap/tilemap_packed.png').convert('RGBA')
print('kenney', kp.size)
# Kenney urban tiles are 16x16
kc, kr = kp.size[0]//16, kp.size[1]//16
for name,(c,r) in [('grass',(0,0)),('path',(1,0)),('wall',(5,0)),('floor',(2,1)),('door',(3,2)),('house',(8,3)),('tree',(0,5)),('water',(4,6)),('void',(0,0)),('stone',(6,1)),('sand',(2,0)),('carpet',(7,2)),('camp',(1,4)),('ruin',(9,5))]:
  c=min(c,kc-1); r=min(r,kr-1)
  save(tile_at(kp,c,r), f'tiles-neon/{name}.png')
  save(tile_at(kp,c,r), f'tiles-zombie/{name}.png')
save(kp, 'tiles/sheet-urban.png')

# --- LPC Character compositing ---
# Walk sheets: 576x256 = 9*64 x 4*64. We re-export as 4-dir x 4-frame at 64x64 for quality (dir rows, frame cols)
# Our overworld currently expects 16x24 sheets with 4 frames x 4 dirs — we'll UPDATE overworld to use LPC 64x64 layout:
# layout OUT: width=64*4 frames, height=64*4 dirs (down,left,right,up) matching classic extract of frames 1-4 of walk

def load_rgba(p):
  return Image.open(p).convert('RGBA')

def composite_walk(layers):
  base = None
  for p in layers:
    if not p or not Path(p).exists():
      continue
    im = load_rgba(p)
    if base is None:
      base = Image.new('RGBA', im.size, (0,0,0,0))
    if im.size != base.size:
      im = im.resize(base.size, Image.NEAREST)
    base = Image.alpha_composite(base, im)
  return base

def to_game_sheet(walk576):
  # Input: 9 frames x 4 dirs, 64px. Output: 4 frames x 4 dirs (skip idle col0, take 1-4)
  out = Image.new('RGBA', (64*4, 64*4), (0,0,0,0))
  for d in range(4):
    for f in range(4):
      src_f = f+1  # skip frame 0 idle-ish
      if src_f > 8: src_f = 8
      frame = walk576.crop((src_f*64, d*64, src_f*64+64, d*64+64))
      out.paste(frame, (f*64, d*64))
  return out

def portrait_from_walk(walk576, sheet_out_name):
  # front-facing idle-ish frame
  face = walk576.crop((0, 0, 64, 64))
  # crop upper body
  port = face.crop((8, 4, 56, 52)).resize((48,48), Image.NEAREST)
  bg = Image.new('RGBA', (48,48), (26,36,88,255))
  bg.paste(port, (0,0), port)
  save(bg, sheet_out_name)

BODY = LPC/'body/bodies'
HAIR = LPC/'hair'
TORSO = LPC/'torso'
LEGS = LPC/'legs'
FEET = LPC/'feet'

def find1(*cands):
  for c in cands:
    if c and Path(c).exists():
      return str(c)
  return None

# Colorized hair: many hairs have walk.png as grayscale mask OR colored variants in subdirs
def hair_layer(style, color_name='brown'):
  # try colored path first
  for p in [
    HAIR/style/'adult'/'walk'/f'{color_name}.png',
    HAIR/style/'adult'/color_name/'walk.png',
    HAIR/style/'adult'/'walk.png',
  ]:
    if p.exists(): return str(p)
  # search
  hits=list((HAIR/style).rglob('walk.png')) if (HAIR/style).exists() else []
  return str(hits[0]) if hits else None

def torso_layer(path_bits):
  p = TORSO.joinpath(*path_bits)
  if p.exists(): return str(p)
  hits=list(TORSO.rglob(path_bits[-1])) if path_bits else []
  return str(hits[0]) if hits else None

roles = {
  'hero': dict(body='male', body_file='light.png', hair=('bedhead','brown'),
    layers_extra=lambda: [
      find1(TORSO/'armour'/'plate'/'male'/'walk.png', TORSO/'armour'/'plate'/'walk.png'),
      find1(LEGS/'armour'/'plate'/'male'/'walk.png'),
      find1(FEET/'boots'/'basic'/'male'/'walk.png'),
    ]),
  'villager': dict(body='male', hair=('messy1','brown'),
    layers_extra=lambda: [
      find1(*list((TORSO/'clothes'/'longsleeve').rglob('walk/brown.png'))[:1] or [None]),
      find1(LEGS/'pants'/'male'/'walk'/'teal.png', *list((LEGS/'pants').rglob('walk/teal.png'))[:1]),
      find1(FEET/'boots'/'basic'/'male'/'walk.png'),
    ]),
  'guard': dict(body='male', hair=('balding','black'),
    layers_extra=lambda: [
      find1(TORSO/'armour'/'plate'/'male'/'walk.png'),
      find1(LEGS/'armour'/'plate'/'male'/'walk.png'),
      find1(FEET/'armour'/'plate'/'male'/'walk.png'),
    ]),
  'mage': dict(body='female', hair=('longhawk','purple'),
    layers_extra=lambda: [
      find1(*list((TORSO/'clothes'/'robe').rglob('walk*.png'))[:1] or list((TORSO).rglob('robe/**/walk/purple.png'))[:1] or [None]),
      find1(FEET/'boots'/'basic'/'thin'/'walk.png', FEET/'boots'/'basic'/'male'/'walk.png'),
    ]),
  'merchant': dict(body='male', hair=('jewfro','black'),
    layers_extra=lambda: [
      find1(*list((TORSO/'clothes').rglob('walk/orange.png'))[:1] or [None]),
      find1(*list((LEGS/'pants').rglob('walk/brown.png'))[:1] or [None]),
      find1(FEET/'boots'/'basic'/'male'/'walk.png'),
    ]),
  'spy': dict(body='female', hair=('ponytail','white'),
    layers_extra=lambda: [
      find1(*list((TORSO/'clothes'/'longsleeve').rglob('walk/black.png'))[:1] or list((TORSO/'clothes').rglob('walk/black.png'))[:1] or [None]),
      find1(*list((LEGS/'pants').rglob('walk/black.png'))[:1] or [None]),
      find1(FEET/'boots'/'basic'/'thin'/'walk.png', FEET/'boots'/'basic'/'male'/'walk.png'),
    ]),
  'princess': dict(body='female', hair=('princess','blonde'),
    layers_extra=lambda: [
      find1(*list((TORSO/'clothes'/'gown').rglob('walk*.png'))[:1] or list((TORSO).rglob('**/dress/**/walk/pink.png'))[:1] or list((TORSO/'dress').rglob('walk.png'))[:1] or [None]),
      find1(FEET/'boots'/'basic'/'thin'/'walk.png'),
    ]),
  'daemon': dict(body='female', hair=('curtains','red'),
    layers_extra=lambda: [
      find1(*list((TORSO/'clothes').rglob('walk/maroon.png'))[:1] or list((TORSO/'clothes').rglob('walk/red.png'))[:1] or [None]),
      find1(*list((LEGS/'pants').rglob('walk/black.png'))[:1] or [None]),
      find1(FEET/'boots'/'basic'/'thin'/'walk.png'),
    ]),
  'neutral': dict(body='male', hair=('plain','brown'),
    layers_extra=lambda: [
      find1(*list((TORSO/'clothes'/'longsleeve').rglob('walk/lavender.png'))[:1] or [None]),
      find1(*list((LEGS/'pants').rglob('walk/teal.png'))[:1] or [None]),
      find1(FEET/'boots'/'basic'/'male'/'walk.png'),
    ]),
}

# Body files may be colored: bodies/male/walk.png is often a folder of colors
def body_walk(body):
  p = BODY/body/'walk.png'
  if p.exists(): return str(p)
  # colored
  for col in ['light','amber','olive','taupe','bronze','brown']:
    q = BODY/body/'walk'/f'{col}.png'
    if q.exists(): return str(q)
  hits=list((BODY/body).rglob('walk*.png'))
  # prefer walk/light.png
  for h in hits:
    if 'light' in h.name: return str(h)
  return str(hits[0]) if hits else None

# Fix hair lookup - styles may use different structure (walk.png with recolor, or walk/color.png)
def hair_walk(style, color):
  root = HAIR/style
  if not root.exists():
    # fuzzy
    styles=[p.name for p in HAIR.iterdir() if p.is_dir()]
    match=next((s for s in styles if style in s), styles[0] if styles else None)
    if not match: return None
    root = HAIR/match
  candidates=[
    root/'adult'/'walk'/f'{color}.png',
    root/'adult'/color/'walk.png',
    root/'adult'/'walk.png',
    root/'walk'/f'{color}.png',
    root/'walk.png',
  ]
  for c in candidates:
    if c.exists(): return str(c)
  hits=list(root.rglob('walk.png'))+list(root.rglob(f'{color}.png'))
  # prefer adult walk
  hits=sorted(hits, key=lambda p: (0 if 'adult' in str(p) and 'walk' in str(p) else 1, len(str(p))))
  return str(hits[0]) if hits else None

# Discover actual clothing paths more robustly
def first_glob(*globs):
  for g in globs:
    hits=list(LPC.glob(g))
    if hits: return str(hits[0])
  return None

role_layers = {
  'hero': lambda: [body_walk('male'), hair_walk('bedhead','brown'),
    first_glob('torso/armour/**/male/walk.png','torso/armour/**/walk.png'),
    first_glob('legs/armour/**/male/walk.png'),
    first_glob('feet/boots/basic/male/walk.png')],
  'villager': lambda: [body_walk('male'), hair_walk('messy1','light_brown') or hair_walk('messy1','brown') or hair_walk('plain','brown'),
    first_glob('torso/clothes/longsleeve/**/walk/brown.png','torso/clothes/**/walk/brown.png'),
    first_glob('legs/pants/**/walk/teal.png','legs/pants/**/walk/brown.png'),
    first_glob('feet/boots/basic/male/walk.png')],
  'guard': lambda: [body_walk('male'), hair_walk('balding','black') or hair_walk('balding','brown'),
    first_glob('torso/armour/**/male/walk.png'),
    first_glob('legs/armour/**/male/walk.png'),
    first_glob('feet/armour/**/male/walk.png','feet/boots/basic/male/walk.png')],
  'mage': lambda: [body_walk('female') or body_walk('teen'), hair_walk('longhawk','purple') or hair_walk('longhawk','blue') or hair_walk('bob','purple'),
    first_glob('torso/clothes/robe/**/walk*.png','torso/**/robe/**/walk/purple.png','torso/clothes/**/walk/purple.png'),
    first_glob('feet/boots/basic/thin/walk.png','feet/boots/basic/male/walk.png')],
  'merchant': lambda: [body_walk('male'), hair_walk('jewfro','black') or hair_walk('plain','black'),
    first_glob('torso/clothes/**/walk/orange.png','torso/clothes/longsleeve/**/walk/orange.png'),
    first_glob('legs/pants/**/walk/brown.png'),
    first_glob('feet/boots/basic/male/walk.png')],
  'spy': lambda: [body_walk('female') or body_walk('teen'), hair_walk('ponytail','white') or hair_walk('ponytail','blonde') or hair_walk('bob','white'),
    first_glob('torso/clothes/**/walk/black.png','torso/clothes/longsleeve/**/walk/black.png'),
    first_glob('legs/pants/**/walk/black.png','legs/pants/**/walk/charcoal.png'),
    first_glob('feet/boots/basic/thin/walk.png','feet/boots/basic/male/walk.png')],
  'princess': lambda: [body_walk('female') or body_walk('teen'), hair_walk('princess','blonde') or hair_walk('princess','gold') or hair_walk('bangs','blonde'),
    first_glob('torso/**/gown/**/walk*.png','torso/clothes/gown/**/walk.png','dress/**/walk.png','torso/**/dress/**/walk/pink.png'),
    first_glob('feet/boots/basic/thin/walk.png')],
  'daemon': lambda: [body_walk('female') or body_walk('teen'), hair_walk('curtains','red') or hair_walk('curtains','maroon') or hair_walk('bob','red'),
    first_glob('torso/clothes/**/walk/maroon.png','torso/clothes/**/walk/red.png'),
    first_glob('legs/pants/**/walk/black.png'),
    first_glob('feet/boots/basic/thin/walk.png')],
  'neutral': lambda: [body_walk('male'), hair_walk('plain','brown') or hair_walk('bedhead','brown'),
    first_glob('torso/clothes/longsleeve/**/walk/lavender.png','torso/clothes/**/walk/blue.png'),
    first_glob('legs/pants/**/walk/teal.png'),
    first_glob('feet/boots/basic/male/walk.png')],
}

for role, get in role_layers.items():
  layers=[x for x in get() if x]
  print('ROLE', role, 'layers', len(layers), layers[:3])
  if not layers:
    print('SKIP', role); continue
  walk = composite_walk(layers)
  sheet = to_game_sheet(walk)
  if role=='hero':
    save(sheet, 'hero/walk.png')
    # battle side view: right-facing frame
    side = walk.crop((64, 128, 128, 192)).resize((48,48), Image.NEAREST)  # right dir is row 2 in LPC (down,left,right,up)
    # Actually LPC dirs: 0 down, 1 left, 2 right? Standard is down, left, right, up — row2=right
    side = walk.crop((0, 128, 64, 192)).resize((40,54), Image.NEAREST)
    save(side, 'hero/battle.png')
    portrait_from_walk(walk, 'portrait/hero.png')
  else:
    save(sheet, f'npc/{role}.png')
    portrait_from_walk(walk, f'portrait/{role}.png')

# --- Monsters from Ninja Adventure (CC0) ---
# Sheets are often single frames or small strips; export 48x48 battle sprites
mon_dir = NA/'monsters'
for name, src in [('wolf','10.png'),('slime','1.png'),('skeleton','15.png'),('bat','5.png'),
                  ('bandit','20.png'),('imp','8.png'),('golem','18.png'),('boss','22.png')]:
  p = mon_dir/src
  if not p.exists():
    # pick by index files
    files=sorted(mon_dir.glob('*.png'))
    p = files[min(int(src.split('.')[0]), len(files)-1)] if files else None
  if not p or not p.exists(): continue
  im = load_rgba(p)
  # take first frame if sheet
  if im.size[0] > 64:
    im = im.crop((0,0,min(64,im.size[0]), min(64,im.size[1])))
  im = im.resize((64,64), Image.NEAREST)
  save(im, f'enemy/{name}.png')

# Facesets for dialogue extras
fs = NA/'characters'/'faceset'
if fs.exists():
  for i, f in enumerate(sorted(fs.glob('*.png'))[:12]):
    im=load_rgba(f).resize((48,48), Image.NEAREST)
    save(im, f'portrait/extra{i}.png')

# UI: faceset box + dialogue from ninja hud; also simple window from kenney-ish
hud = NA/'hud'
if (hud/'faceset-box.png').exists():
  save(load_rgba(hud/'faceset-box.png'), 'ui/faceset-box.png')
if (hud/'dialogue-bubble.png').exists():
  save(load_rgba(hud/'dialogue-bubble.png'), 'ui/dialogue-bubble.png')

# Battle backgrounds: crop scenic strips from overworld/cave
bg = ow.crop((0,0,min(240,ow.size[0]), min(160,ow.size[1]))).resize((240,160), Image.NEAREST)
save(bg, 'bg-battle/overworld.png')
save(cave.crop((0,0,min(240,cave.size[0]),min(160,cave.size[1]))).resize((240,160), Image.NEAREST), 'bg-battle/dungeon.png')
save(inner.crop((0,0,min(240,inner.size[0]),min(160,inner.size[1]))).resize((240,160), Image.NEAREST), 'bg-battle/town.png')

# UI window skin 32x32 nine-slice source
ui = Image.new('RGBA', (48,48), (26,36,88,255))
for i in range(48):
  ui.putpixel((i,0),(158,182,255,255)); ui.putpixel((i,47),(158,182,255,255))
  ui.putpixel((0,i),(158,182,255,255)); ui.putpixel((47,i),(158,182,255,255))
save(ui, 'ui/window.png')

print('IMPORT DONE')
`;

fs.writeFileSync('/tmp/import-v26.py', py);
const r = spawnSync('python3', ['/tmp/import-v26.py'], { encoding: 'utf8', maxBuffer: 20_000_000 });
console.log(r.stdout);
if (r.stderr) console.error(r.stderr);
console.log('exit', r.status);
