#!/usr/bin/env node
/** Generate SNES-quality procedural pixel assets for v25 */
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'assets/pixel');

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const t = Buffer.from(type);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}
function encodePNG(w, h, rgba) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}
function canvas(w, h) {
  const data = Buffer.alloc(w * h * 4);
  return {
    w, h, data,
    clear(r = 0, g = 0, b = 0, a = 0) {
      for (let i = 0; i < data.length; i += 4) { data[i] = r; data[i + 1] = g; data[i + 2] = b; data[i + 3] = a; }
    },
    set(x, y, col) {
      if (x < 0 || y < 0 || x >= w || y >= h) return;
      const i = (y * w + x) * 4;
      data[i] = col[0]; data[i + 1] = col[1]; data[i + 2] = col[2]; data[i + 3] = col[3] ?? 255;
    },
    get(x, y) {
      if (x < 0 || y < 0 || x >= w || y >= h) return [0, 0, 0, 0];
      const i = (y * w + x) * 4;
      return [data[i], data[i + 1], data[i + 2], data[i + 3]];
    },
    fillRect(x, y, tw, th, col) {
      for (let j = 0; j < th; j++) for (let i = 0; i < tw; i++) this.set(x + i, y + j, col);
    },
    rect(x, y, tw, th, col) {
      for (let i = 0; i < tw; i++) { this.set(x + i, y, col); this.set(x + i, y + th - 1, col); }
      for (let j = 0; j < th; j++) { this.set(x, y + j, col); this.set(x + tw - 1, y + j, col); }
    },
    blit(src, dx, dy, sx = 0, sy = 0, sw = src.w, sh = src.h) {
      for (let j = 0; j < sh; j++) for (let i = 0; i < sw; i++) {
        const c = src.get(sx + i, sy + j);
        if (c[3] > 0) this.set(dx + i, dy + j, c);
      }
    },
    mirrorH() {
      const n = canvas(w, h);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) n.set(w - 1 - x, y, this.get(x, y));
      return n;
    },
    png() { return encodePNG(w, h, data); },
  };
}
function save(rel, c) {
  const fp = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, c.png());
  console.log('+', rel, c.w + 'x' + c.h);
}

const SKIN = [240, 200, 160], SKIN2 = [220, 170, 130], SKIN_D = [200, 140, 100];
const OUTLINE = [20, 16, 28];

function drawChar(pal, frame = 0, dir = 0) {
  // 16x24 character: dir 0=down 1=left 2=right 3=up; frame 0-3 walk
  const c = canvas(16, 24);
  c.clear();
  const hair = pal.hair || [60, 40, 30];
  const shirt = pal.shirt || [70, 110, 180];
  const pants = pal.pants || [40, 50, 80];
  const accent = pal.accent || [200, 180, 60];
  const boots = pal.boots || [50, 35, 30];
  const bob = (frame === 1 || frame === 3) ? 1 : 0;
  const leg = frame % 4;
  const faceY = 3 + bob;

  // shadow
  c.fillRect(4, 22, 8, 2, [0, 0, 0, 60]);

  if (dir === 3) {
    // back view
    c.fillRect(4, faceY, 8, 7, hair);
    c.fillRect(3, faceY + 1, 10, 5, hair);
    c.fillRect(4, faceY + 6, 8, 2, shirt);
    c.fillRect(3, faceY + 8, 10, 7, shirt);
    if (pal.cape) c.fillRect(2, faceY + 7, 12, 9, pal.cape);
    c.fillRect(4, faceY + 15, 3, 5 + (leg === 1 ? 1 : 0), pants);
    c.fillRect(9, faceY + 15, 3, 5 + (leg === 3 ? 1 : 0), pants);
    c.fillRect(4, faceY + 19, 3, 2, boots);
    c.fillRect(9, faceY + 19, 3, 2, boots);
    // outline
    for (let y = 0; y < 24; y++) for (let x = 0; x < 16; x++) {
      const p = c.get(x, y); if (!p[3]) continue;
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        if (!c.get(x + dx, y + dy)[3]) c.set(x + dx, y + dy, OUTLINE);
      }
    }
    return c;
  }

  // head
  c.fillRect(5, faceY, 6, 7, SKIN);
  c.fillRect(4, faceY + 1, 8, 5, SKIN);
  // hair
  if (dir === 0) {
    c.fillRect(4, faceY - 1, 8, 3, hair);
    c.fillRect(3, faceY, 2, 4, hair);
    c.fillRect(11, faceY, 2, 4, hair);
    if (pal.longHair) { c.fillRect(3, faceY + 4, 2, 5, hair); c.fillRect(11, faceY + 4, 2, 5, hair); }
  } else {
    // side
    c.fillRect(4, faceY - 1, 8, 3, hair);
    c.fillRect(dir === 1 ? 3 : 10, faceY, 3, 6, hair);
  }
  // eyes
  if (dir === 0) {
    c.set(6, faceY + 3, [30, 30, 40]); c.set(9, faceY + 3, [30, 30, 40]);
    c.set(6, faceY + 3, pal.eye || [40, 80, 140]); c.set(9, faceY + 3, pal.eye || [40, 80, 140]);
  } else if (dir === 1) {
    c.set(6, faceY + 3, pal.eye || [40, 80, 140]);
  } else {
    c.set(9, faceY + 3, pal.eye || [40, 80, 140]);
  }
  // body
  c.fillRect(4, faceY + 7, 8, 2, SKIN2);
  c.fillRect(3, faceY + 8, 10, 7, shirt);
  if (pal.trim) c.fillRect(3, faceY + 8, 10, 2, accent);
  // arms
  const armSwing = leg === 1 ? 1 : leg === 3 ? -1 : 0;
  if (dir === 0) {
    c.fillRect(2, faceY + 8 + armSwing, 2, 6, SKIN);
    c.fillRect(12, faceY + 8 - armSwing, 2, 6, SKIN);
    c.fillRect(2, faceY + 8 + armSwing, 2, 3, shirt);
    c.fillRect(12, faceY + 8 - armSwing, 2, 3, shirt);
  } else if (dir === 1) {
    c.fillRect(1, faceY + 9 + armSwing, 3, 2, SKIN);
    c.fillRect(12, faceY + 8, 2, 5, SKIN);
  } else {
    c.fillRect(12, faceY + 9 + armSwing, 3, 2, SKIN);
    c.fillRect(2, faceY + 8, 2, 5, SKIN);
  }
  // legs
  const l1 = leg === 1 ? 1 : 0, l2 = leg === 3 ? 1 : 0;
  c.fillRect(4, faceY + 15, 3, 5 + l1, pants);
  c.fillRect(9, faceY + 15, 3, 5 + l2, pants);
  c.fillRect(4, faceY + 19 + l1, 3, 2, boots);
  c.fillRect(9, faceY + 19 + l2, 3, 2, boots);
  // weapon/prop
  if (pal.weapon && dir !== 3) {
    const wx = dir === 1 ? 1 : 13;
    c.fillRect(wx, faceY + 6, 1, 10, [160, 160, 170]);
    c.set(wx, faceY + 5, accent);
  }
  if (pal.hat) c.fillRect(3, faceY - 2, 10, 3, pal.hat);
  // outline pass
  const out = canvas(16, 24); out.clear();
  for (let y = 0; y < 24; y++) for (let x = 0; x < 16; x++) {
    const p = c.get(x, y); if (!p[3]) continue;
    out.set(x, y, p);
  }
  for (let y = 0; y < 24; y++) for (let x = 0; y < 24 && x < 16; x++) {
    const p = c.get(x, y); if (!p[3]) continue;
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      if (!c.get(x + dx, y + dy)[3]) out.set(x + dx, y + dy, OUTLINE);
    }
  }
  // fix loop bug - rewrite outline properly
  const final = canvas(16, 24); final.clear();
  for (let y = 0; y < 24; y++) for (let x = 0; x < 16; x++) {
    const p = c.get(x, y);
    if (p[3]) final.set(x, y, p);
  }
  for (let y = 0; y < 24; y++) for (let x = 0; x < 16; x++) {
    const p = c.get(x, y); if (!p[3]) continue;
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nx = x + dx, ny = y + dy;
      if (!c.get(nx, ny)[3]) final.set(nx, ny, OUTLINE);
    }
  }
  return final;
}

function makeWalkSheet(pal) {
  const sheet = canvas(16 * 4, 24 * 4); // 4 frames x 4 dirs
  sheet.clear();
  for (let dir = 0; dir < 4; dir++) {
    for (let fr = 0; fr < 4; fr++) {
      const ch = drawChar(pal, fr, dir);
      sheet.blit(ch, fr * 16, dir * 24);
    }
  }
  return sheet;
}

function makePortrait(pal) {
  const c = canvas(48, 48);
  c.clear(26, 36, 70, 255);
  // frame
  c.rect(1, 1, 46, 46, [158, 182, 255]);
  c.rect(2, 2, 44, 44, [74, 106, 208]);
  // bust
  const hair = pal.hair || [60, 40, 30];
  const shirt = pal.shirt || [70, 110, 180];
  // hair back
  c.fillRect(10, 8, 28, 22, hair);
  // face
  c.fillRect(14, 12, 20, 22, SKIN);
  c.fillRect(13, 14, 22, 18, SKIN);
  // hair front
  c.fillRect(12, 8, 24, 6, hair);
  c.fillRect(10, 10, 6, 14, hair);
  c.fillRect(32, 10, 6, 14, hair);
  if (pal.longHair) { c.fillRect(8, 18, 5, 20, hair); c.fillRect(35, 18, 5, 20, hair); }
  // eyes
  c.fillRect(17, 20, 4, 3, [255, 255, 255]);
  c.fillRect(27, 20, 4, 3, [255, 255, 255]);
  c.fillRect(18, 21, 2, 2, pal.eye || [40, 80, 140]);
  c.fillRect(28, 21, 2, 2, pal.eye || [40, 80, 140]);
  // brows
  c.fillRect(17, 18, 4, 1, hair);
  c.fillRect(27, 18, 4, 1, hair);
  // mouth
  c.fillRect(21, 28, 6, 1, SKIN_D);
  // shoulders
  c.fillRect(8, 34, 32, 12, shirt);
  if (pal.trim) c.fillRect(8, 34, 32, 3, pal.accent || [200, 180, 60]);
  c.fillRect(18, 34, 12, 4, SKIN);
  return c;
}

function makeTile(kind, variant = 0, frame = 0) {
  const c = canvas(16, 16);
  const rnd = (x, y) => ((x * 17 + y * 31 + variant * 13 + kind.length) % 7);
  if (kind === 'grass') {
    c.fillRect(0, 0, 16, 16, [46, 120, 48]);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      if (rnd(x, y) === 0) c.set(x, y, [62, 148, 58]);
      if (rnd(x + 3, y + 2) === 1) c.set(x, y, [36, 96, 40]);
    }
    // grass blades
    for (let i = 0; i < 6; i++) {
      const x = (i * 3 + variant) % 14 + 1, y = (i * 5 + 2) % 12 + 2;
      c.set(x, y, [80, 170, 70]); c.set(x, y - 1, [100, 190, 80]);
    }
  } else if (kind === 'path') {
    c.fillRect(0, 0, 16, 16, [168, 140, 90]);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      if (rnd(x, y) < 2) c.set(x, y, [148, 120, 74]);
      if (rnd(x + 1, y) === 3) c.set(x, y, [188, 160, 110]);
    }
    c.rect(0, 0, 16, 16, [120, 96, 60]);
  } else if (kind === 'water') {
    const base = [[40, 90, 180], [50, 110, 200], [36, 80, 160], [60, 120, 210]][frame % 4];
    c.fillRect(0, 0, 16, 16, base);
    for (let i = 0; i < 16; i++) {
      const y = (i + frame * 2) % 16;
      c.set(i, y, [100, 180, 230]);
      c.set((i + 8) % 16, (y + 4) % 16, [80, 160, 220]);
    }
    c.set(3, (5 + frame) % 16, [200, 230, 255]);
    c.set(11, (10 + frame) % 16, [200, 230, 255]);
  } else if (kind === 'floor') {
    c.fillRect(0, 0, 16, 16, [120, 100, 70]);
    c.rect(0, 0, 16, 16, [90, 70, 50]);
    c.fillRect(1, 1, 6, 6, [130, 110, 80]);
    c.fillRect(9, 1, 6, 6, [110, 90, 60]);
    c.fillRect(1, 9, 6, 6, [110, 90, 60]);
    c.fillRect(9, 9, 6, 6, [130, 110, 80]);
  } else if (kind === 'wall') {
    c.fillRect(0, 0, 16, 16, [90, 90, 100]);
    for (let row = 0; row < 4; row++) {
      const off = row % 2 ? 4 : 0;
      for (let col = 0; col < 3; col++) {
        c.fillRect(off + col * 8, row * 4, 7, 3, [110, 110, 120]);
        c.rect(off + col * 8, row * 4, 7, 3, [70, 70, 80]);
      }
    }
  } else if (kind === 'tree') {
    c.fillRect(0, 0, 16, 16, [46, 120, 48]); // grass under
    c.fillRect(7, 10, 2, 6, [90, 60, 30]);
    c.fillRect(3, 2, 10, 8, [30, 100, 40]);
    c.fillRect(4, 1, 8, 3, [40, 130, 50]);
    c.fillRect(5, 4, 6, 5, [50, 150, 60]);
    c.set(6, 3, [80, 180, 70]); c.set(9, 5, [80, 180, 70]);
  } else if (kind === 'sand') {
    c.fillRect(0, 0, 16, 16, [210, 190, 120]);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if (rnd(x, y) === 0) c.set(x, y, [190, 170, 100]);
  } else if (kind === 'stone') {
    c.fillRect(0, 0, 16, 16, [46, 120, 48]);
    c.fillRect(3, 5, 10, 8, [130, 130, 140]);
    c.fillRect(4, 4, 8, 2, [150, 150, 160]);
    c.rect(3, 5, 10, 8, [80, 80, 90]);
  } else if (kind === 'carpet') {
    c.fillRect(0, 0, 16, 16, [140, 40, 50]);
    c.rect(1, 1, 14, 14, [180, 140, 60]);
    c.fillRect(4, 4, 8, 8, [160, 50, 60]);
  } else if (kind === 'void') {
    c.fillRect(0, 0, 16, 16, [10, 8, 16]);
  } else if (kind === 'door') {
    c.fillRect(0, 0, 16, 16, [90, 90, 100]);
    c.fillRect(3, 2, 10, 14, [100, 60, 30]);
    c.rect(3, 2, 10, 14, [60, 35, 15]);
    c.fillRect(7, 2, 2, 14, [80, 45, 20]);
    c.set(11, 9, [200, 180, 60]);
  } else if (kind === 'camp') {
    c.fillRect(0, 0, 16, 16, [46, 100, 40]);
    c.fillRect(2, 8, 12, 6, [120, 80, 40]);
    c.fillRect(4, 4, 8, 5, [160, 50, 40]);
    c.set(7, 6, [255, 180, 60]); c.set(8, 5, [255, 220, 100]);
  } else if (kind === 'house') {
    c.fillRect(0, 0, 16, 16, [46, 120, 48]);
    c.fillRect(2, 6, 12, 10, [160, 120, 80]);
    c.fillRect(1, 3, 14, 4, [140, 50, 40]);
    c.fillRect(6, 10, 4, 6, [80, 50, 30]);
    c.fillRect(3, 8, 3, 3, [100, 180, 220]);
    c.fillRect(10, 8, 3, 3, [100, 180, 220]);
  } else if (kind === 'ruin') {
    c.fillRect(0, 0, 16, 16, [80, 78, 70]);
    c.fillRect(2, 4, 5, 12, [100, 98, 90]);
    c.fillRect(9, 8, 5, 8, [90, 88, 80]);
    c.set(4, 6, [60, 58, 50]); c.set(11, 10, [60, 58, 50]);
  } else if (kind === 'neon') {
    c.fillRect(0, 0, 16, 16, [20, 16, 40]);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if (rnd(x, y) === 0) c.set(x, y, [30, 24, 55]);
    c.fillRect(0, 14, 16, 2, [0, 220, 255]);
    c.fillRect(2, 2, 4, 8, [40, 20, 60]);
    c.set(3, 3, [255, 0, 200]); c.set(4, 5, [0, 255, 200]);
  } else if (kind === 'asphalt') {
    c.fillRect(0, 0, 16, 16, [50, 50, 55]);
    c.fillRect(7, 0, 2, 16, [180, 160, 40]);
    for (let y = 0; y < 16; y++) if (rnd(3, y) === 0) c.set(3, y, [70, 70, 75]);
  } else if (kind === 'rubble') {
    c.fillRect(0, 0, 16, 16, [70, 65, 55]);
    c.fillRect(2, 8, 5, 4, [90, 85, 70]);
    c.fillRect(9, 5, 4, 6, [60, 55, 45]);
  } else {
    c.fillRect(0, 0, 16, 16, [80, 80, 80]);
  }
  return c;
}

function makeEnemy(kind) {
  const c = canvas(48, 48);
  c.clear();
  const ink = OUTLINE;
  if (kind === 'wolf') {
    // body
    c.fillRect(8, 20, 28, 14, [50, 50, 60]);
    c.fillRect(6, 22, 8, 8, [40, 40, 50]); // head
    c.fillRect(4, 20, 4, 3, [40, 40, 50]); // ear
    c.fillRect(10, 20, 4, 3, [40, 40, 50]);
    c.set(7, 24, [220, 60, 60]); c.set(11, 24, [220, 60, 60]); // eyes
    c.fillRect(2, 26, 5, 2, [30, 30, 40]); // snout
    c.fillRect(32, 24, 10, 4, [50, 50, 60]); // tail
    c.fillRect(10, 32, 4, 8, [40, 40, 50]);
    c.fillRect(20, 32, 4, 8, [40, 40, 50]);
    c.fillRect(28, 32, 4, 6, [40, 40, 50]);
  } else if (kind === 'slime') {
    c.fillRect(10, 18, 28, 22, [60, 200, 100]);
    c.fillRect(12, 14, 24, 8, [80, 220, 120]);
    c.fillRect(14, 10, 20, 6, [100, 240, 140]);
    c.fillRect(16, 22, 4, 5, [20, 40, 30]);
    c.fillRect(28, 22, 4, 5, [20, 40, 30]);
    c.set(17, 24, [255, 255, 255]); c.set(29, 24, [255, 255, 255]);
    c.fillRect(20, 30, 8, 2, [30, 80, 40]);
  } else if (kind === 'skeleton') {
    c.fillRect(18, 6, 12, 12, [230, 230, 210]); // skull
    c.fillRect(20, 10, 3, 3, [20, 20, 30]);
    c.fillRect(25, 10, 3, 3, [20, 20, 30]);
    c.fillRect(21, 16, 6, 2, [20, 20, 30]);
    c.fillRect(20, 18, 8, 16, [220, 220, 200]); // ribs
    for (let i = 0; i < 4; i++) c.fillRect(20, 20 + i * 3, 8, 1, [180, 180, 160]);
    c.fillRect(14, 20, 6, 3, [220, 220, 200]);
    c.fillRect(28, 20, 6, 3, [220, 220, 200]);
    c.fillRect(18, 34, 4, 10, [220, 220, 200]);
    c.fillRect(26, 34, 4, 10, [220, 220, 200]);
  } else if (kind === 'bat') {
    c.fillRect(20, 18, 8, 8, [60, 40, 70]);
    c.set(22, 20, [255, 80, 80]); c.set(25, 20, [255, 80, 80]);
    // wings
    c.fillRect(4, 16, 16, 10, [80, 50, 100]);
    c.fillRect(28, 16, 16, 10, [80, 50, 100]);
    c.fillRect(6, 14, 6, 4, [60, 40, 80]);
    c.fillRect(36, 14, 6, 4, [60, 40, 80]);
  } else if (kind === 'bandit') {
    c.fillRect(18, 6, 12, 12, SKIN);
    c.fillRect(16, 4, 16, 4, [40, 30, 20]); // hood
    c.fillRect(20, 10, 2, 2, [30, 30, 40]);
    c.fillRect(26, 10, 2, 2, [30, 30, 40]);
    c.fillRect(14, 18, 20, 14, [80, 50, 40]);
    c.fillRect(16, 32, 6, 12, [40, 40, 50]);
    c.fillRect(26, 32, 6, 12, [40, 40, 50]);
    c.fillRect(10, 20, 4, 14, [160, 160, 170]); // knife
  } else if (kind === 'imp') {
    c.fillRect(16, 14, 16, 16, [180, 60, 50]);
    c.fillRect(14, 10, 6, 6, [180, 60, 50]); // horn area
    c.fillRect(28, 10, 6, 6, [180, 60, 50]);
    c.set(16, 8, [220, 80, 60]); c.set(31, 8, [220, 80, 60]);
    c.fillRect(20, 18, 3, 3, [255, 220, 40]);
    c.fillRect(25, 18, 3, 3, [255, 220, 40]);
    c.fillRect(18, 30, 5, 10, [140, 40, 40]);
    c.fillRect(25, 30, 5, 10, [140, 40, 40]);
    c.fillRect(32, 20, 8, 3, [180, 60, 50]); // tail
  } else if (kind === 'golem') {
    c.fillRect(10, 8, 28, 32, [120, 110, 100]);
    c.fillRect(14, 4, 20, 10, [100, 95, 90]);
    c.fillRect(18, 12, 4, 4, [80, 200, 255]);
    c.fillRect(26, 12, 4, 4, [80, 200, 255]);
    c.fillRect(6, 16, 8, 16, [110, 100, 90]);
    c.fillRect(34, 16, 8, 16, [110, 100, 90]);
    c.rect(10, 8, 28, 32, [70, 65, 60]);
  } else if (kind === 'boss') {
    c.fillRect(8, 10, 32, 28, [80, 20, 100]);
    c.fillRect(12, 4, 24, 14, [60, 10, 80]);
    c.fillRect(16, 12, 5, 5, [255, 40, 40]);
    c.fillRect(27, 12, 5, 5, [255, 40, 40]);
    c.fillRect(4, 8, 8, 8, [100, 30, 120]); // horns
    c.fillRect(36, 8, 8, 8, [100, 30, 120]);
    c.fillRect(14, 38, 8, 8, [50, 10, 60]);
    c.fillRect(26, 38, 8, 8, [50, 10, 60]);
    c.fillRect(18, 22, 12, 4, [200, 40, 60]);
  } else {
    c.fillRect(12, 12, 24, 24, [100, 100, 120]);
  }
  // outline
  const out = canvas(48, 48); out.clear();
  for (let y = 0; y < 48; y++) for (let x = 0; x < 48; x++) {
    const p = c.get(x, y); if (p[3]) out.set(x, y, p);
  }
  for (let y = 0; y < 48; y++) for (let x = 0; x < 48; x++) {
    const p = c.get(x, y); if (!p[3]) continue;
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      if (!c.get(x + dx, y + dy)[3]) out.set(x + dx, y + dy, ink);
    }
  }
  return out;
}

// ——— Generate ———
const pals = {
  hero: { hair: [50, 35, 25], shirt: [55, 100, 180], pants: [40, 50, 90], accent: [220, 180, 60], boots: [40, 30, 25], eye: [60, 120, 200], weapon: true },
  villager: { hair: [90, 60, 30], shirt: [180, 140, 80], pants: [80, 70, 50], boots: [50, 40, 30], eye: [80, 100, 60] },
  guard: { hair: [40, 30, 20], shirt: [90, 90, 110], pants: [50, 50, 70], accent: [180, 160, 60], boots: [30, 30, 35], eye: [40, 60, 100], hat: [70, 70, 85], weapon: true },
  mage: { hair: [80, 50, 140], shirt: [50, 40, 140], pants: [30, 25, 80], accent: [180, 120, 255], boots: [30, 20, 40], eye: [160, 100, 255], longHair: true, hat: [40, 30, 100] },
  merchant: { hair: [100, 70, 40], shirt: [160, 80, 40], pants: [70, 50, 30], accent: [220, 180, 60], boots: [50, 35, 25], eye: [60, 80, 40], hat: [120, 60, 30] },
  spy: { hair: [200, 200, 210], shirt: [40, 50, 70], pants: [30, 35, 50], accent: [100, 180, 120], boots: [25, 25, 30], eye: [100, 180, 140], longHair: true },
  princess: { hair: [240, 200, 80], shirt: [220, 100, 140], pants: [180, 60, 100], accent: [255, 220, 120], boots: [180, 140, 160], eye: [80, 140, 200], longHair: true, cape: [200, 60, 100] },
  daemon: { hair: [40, 10, 50], shirt: [120, 30, 60], pants: [40, 10, 30], accent: [255, 80, 120], boots: [30, 10, 20], eye: [255, 60, 80], longHair: true },
  neutral: { hair: [70, 55, 40], shirt: [100, 110, 120], pants: [60, 65, 70], boots: [40, 35, 30], eye: [60, 70, 80] },
};

save('hero/walk.png', makeWalkSheet(pals.hero));
save('hero/battle.png', (() => {
  const c = canvas(32, 48);
  const ch = drawChar(pals.hero, 0, 1); // side view for battle
  // scale 2x
  for (let y = 0; y < 24; y++) for (let x = 0; x < 16; x++) {
    const p = ch.get(x, y); if (!p[3]) continue;
    c.fillRect(x * 2, y * 2, 2, 2, p);
  }
  return c;
})());

for (const [name, pal] of Object.entries(pals)) {
  if (name === 'hero') continue;
  save(`npc/${name}.png`, makeWalkSheet(pal));
  save(`portrait/${name}.png`, makePortrait(pal));
}
save('portrait/hero.png', makePortrait(pals.hero));

const tileKinds = ['grass', 'path', 'water', 'floor', 'wall', 'tree', 'sand', 'stone', 'carpet', 'void', 'door', 'camp', 'house', 'ruin'];
for (const k of tileKinds) save(`tiles/${k}.png`, makeTile(k));
// animated water strip 4 frames
{
  const strip = canvas(16 * 4, 16);
  for (let f = 0; f < 4; f++) strip.blit(makeTile('water', 0, f), f * 16, 0);
  save('tiles/water-anim.png', strip);
}

// genre tilesets
for (const k of ['grass', 'path', 'floor', 'wall', 'tree', 'door', 'house', 'asphalt', 'rubble']) {
  if (k === 'asphalt' || k === 'rubble') {
    save(`tiles-zombie/${k}.png`, makeTile(k));
  } else if (k === 'grass') {
    const t = makeTile('grass'); // tint brown-green
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const p = t.get(x, y); t.set(x, y, [Math.min(255, p[0] + 20), Math.max(0, p[1] - 30), Math.max(0, p[2] - 20), p[3]]);
    }
    save('tiles-zombie/grass.png', t);
  } else {
    save(`tiles-zombie/${k}.png`, makeTile(k === 'path' ? 'asphalt' : k));
  }
}
for (const k of ['neon', 'path', 'floor', 'wall', 'door', 'void']) {
  save(`tiles-neon/${k === 'neon' ? 'grass' : k}.png`, makeTile(k === 'path' ? 'neon' : k === 'grass' ? 'neon' : k));
}
save('tiles-neon/path.png', makeTile('neon'));
save('tiles-neon/tree.png', makeTile('neon'));
save('tiles-neon/water.png', makeTile('water', 1, 0));
save('tiles-neon/house.png', makeTile('neon'));

for (const k of ['floor', 'wall', 'void', 'door', 'stone', 'path']) {
  save(`tiles-dungeon/${k}.png`, makeTile(k === 'path' ? 'floor' : k));
}
save('tiles-dungeon/grass.png', makeTile('void'));
save('tiles-dungeon/tree.png', makeTile('stone'));

for (const k of ['grass', 'path', 'floor', 'wall', 'tree', 'door', 'ruin', 'stone']) {
  save(`tiles-ruins/${k === 'ruin' ? 'house' : k}.png`, makeTile(k === 'house' ? 'ruin' : k));
}
save('tiles-ruins/ruin.png', makeTile('ruin'));

for (const e of ['wolf', 'slime', 'skeleton', 'bat', 'bandit', 'imp', 'golem', 'boss']) {
  save(`enemy/${e}.png`, makeEnemy(e));
}

// UI window frame
{
  const c = canvas(32, 32);
  c.fillRect(0, 0, 32, 32, [26, 36, 88]);
  c.rect(0, 0, 32, 32, [158, 182, 255]);
  c.rect(2, 2, 28, 28, [74, 106, 208]);
  save('ui/window.png', c);
}

console.log('done');
