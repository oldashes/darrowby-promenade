// Procedural 2048x2048 Winter-Yorkshire PBR Texture Atlas (4x4 grid of 512x512 cells)
export const ATLAS_SIZE = 2048;
export const CELL_SIZE = 512;
export const GRID_DIM = 4;

export interface CellCoord {
  col: number;
  row: number;
}

export const MAT_MILL_TIMBER: CellCoord = { col: 0, row: 0 };
export const MAT_LIMESTONE: CellCoord = { col: 1, row: 0 };
export const MAT_PLASTER_BRICK: CellCoord = { col: 2, row: 0 };
export const MAT_COBBLE_FAN: CellCoord = { col: 3, row: 0 };

export const MAT_CLAY_TILE: CellCoord = { col: 0, row: 1 };
export const MAT_SLATE_TILE: CellCoord = { col: 1, row: 1 };
export const MAT_WOOD_DOOR: CellCoord = { col: 2, row: 1 };
export const MAT_AWNING_RED: CellCoord = { col: 3, row: 1 };

export const MAT_INTERIOR_ROOM: CellCoord = { col: 0, row: 2 };
export const MAT_GRASS: CellCoord = { col: 1, row: 2 };
export const MAT_SIGNS: CellCoord = { col: 2, row: 2 };
export const MAT_CLOCK_DIAL: CellCoord = { col: 3, row: 2 };

export const MAT_DRY_STONE: CellCoord = { col: 0, row: 3 };
export const MAT_AWNING_GREEN_RUG: CellCoord = { col: 1, row: 3 };
export const MAT_SHUTTER_WOOD: CellCoord = { col: 2, row: 3 };
export const MAT_FORGE_KILN: CellCoord = { col: 3, row: 3 }; // Top half: riveted iron plates; Bottom half: blazing kiln embers

export interface UvRect {
  u0: number;
  v0: number;
  u1: number;
  v1: number;
}

export function uvRect(cell: CellCoord, subU0 = 0, subV0 = 0, subU1 = 1, subV1 = 1): UvRect {
  const pad = 4 / ATLAS_SIZE;
  const baseU = cell.col / GRID_DIM + pad;
  const baseV = cell.row / GRID_DIM + pad;
  const span = 1 / GRID_DIM - pad * 2;
  return {
    u0: baseU + subU0 * span,
    v0: baseV + subV0 * span,
    u1: baseU + subU1 * span,
    v1: baseV + subV1 * span,
  };
}

export interface ProceduralAtlas {
  albedoCanvas: HTMLCanvasElement;
  normalData: Uint8Array;
  materialData: Uint8Array;
  size: number;
}

function hash2(x: number, y: number, seed = 13): number {
  let h = (x * 374761393 + y * 668265263 + seed * 1442695041) | 0;
  h = ((h ^ (h >>> 13)) * 1274126177) | 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function valueNoise(x: number, y: number, seed = 13): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const n00 = hash2(xi, yi, seed);
  const n10 = hash2(xi + 1, yi, seed);
  const n01 = hash2(xi, yi + 1, seed);
  const n11 = hash2(xi + 1, yi + 1, seed);
  return n00 + (n10 - n00) * u + (n01 - n00) * v + (n00 - n10 - n01 + n11) * u * v;
}

function fbm(x: number, y: number, seed = 13): number {
  return (
    valueNoise(x, y, seed) * 0.55 +
    valueNoise(x * 2.07 + 3.1, y * 2.07 + 1.9, seed + 19) * 0.30 +
    valueNoise(x * 4.21 + 9.4, y * 4.21 + 5.7, seed + 47) * 0.15
  );
}

function clampByte(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : Math.round(v);
}

interface CellBuffer {
  albedo: Uint8Array;
  height: Float32Array;
  rough: Uint8Array;
  metal: Uint8Array;
  ao: Uint8Array;
  emissive: Uint8Array;
}

function makeCellBuffer(): CellBuffer {
  const n = CELL_SIZE * CELL_SIZE;
  return {
    albedo: new Uint8Array(n * 4),
    height: new Float32Array(n),
    rough: new Uint8Array(n).fill(200),
    metal: new Uint8Array(n).fill(0),
    ao: new Uint8Array(n).fill(255),
    emissive: new Uint8Array(n).fill(0),
  };
}

function setCellPixel(
  b: CellBuffer,
  x: number,
  y: number,
  r: number,
  g: number,
  bl: number,
  h: number,
  rough: number,
  metal = 0,
  ao = 255,
  emissive = 0,
): void {
  const i = y * CELL_SIZE + x;
  const p = i * 4;
  b.albedo[p] = clampByte(r);
  b.albedo[p + 1] = clampByte(g);
  b.albedo[p + 2] = clampByte(bl);
  b.albedo[p + 3] = 255;
  b.height[i] = h;
  b.rough[i] = clampByte(rough);
  b.metal[i] = clampByte(metal);
  b.ao[i] = clampByte(ao);
  b.emissive[i] = clampByte(emissive);
}

function canvasToCell(
  b: CellBuffer,
  drawFn: (ctx: CanvasRenderingContext2D, s: number) => void,
  heightFn?: (img: Uint8ClampedArray, p: number, x: number, y: number) => { h: number; rough: number; metal: number; ao: number; em: number },
): void {
  const c = document.createElement('canvas');
  c.width = CELL_SIZE;
  c.height = CELL_SIZE;
  const ctx = c.getContext('2d')!;
  drawFn(ctx, CELL_SIZE);
  const img = ctx.getImageData(0, 0, CELL_SIZE, CELL_SIZE).data;
  for (let y = 0; y < CELL_SIZE; y++) {
    for (let x = 0; x < CELL_SIZE; x++) {
      const idx = y * CELL_SIZE + x;
      const p = idx * 4;
      const info = heightFn
        ? heightFn(img, p, x, y)
        : { h: (img[p] + img[p + 1] + img[p + 2]) / (3 * 255), rough: 195, metal: 0, ao: 255, em: 0 };
      setCellPixel(b, x, y, img[p], img[p + 1], img[p + 2], info.h, info.rough, info.metal, info.ao, info.em);
    }
  }
}

function genMillTimber(): CellBuffer {
  const b = makeCellBuffer();
  for (let y = 0; y < CELL_SIZE; y++) {
    const plankId = Math.floor(y / 96);
    const py = y % 96;
    const seamDist = Math.min(py, 95 - py);
    const seam = seamDist < 2.2 ? 0.25 : seamDist < 5 ? 0.68 : 1.0;
    for (let x = 0; x < CELL_SIZE; x++) {
      const grain = Math.sin(y * 0.25 + fbm(x * 0.015, y * 0.09, 17 + plankId * 9) * 9.0) * 0.5 + 0.5;
      const wetMoss = fbm(x * 0.03, y * 0.03, 81) > 0.64 ? 0.25 : 0;
      const damp = fbm(x * 0.04, y * 0.04, 107);
      const lum = (0.64 + grain * 0.26 + damp * 0.14) * seam;
      const r = (92 * (1 - wetMoss) + 48 * wetMoss) * lum;
      const g = (68 * (1 - wetMoss) + 64 * wetMoss) * lum;
      const bl = (48 * (1 - wetMoss) + 38 * wetMoss) * lum;
      setCellPixel(b, x, y, r, g, bl, (grain * 0.4 + damp * 0.25) * seam, seamDist < 3 ? 235 : 98 - grain * 24, 0, clampByte(seam * 255));
    }
  }
  return b;
}

function genLimestone(): CellBuffer {
  const b = makeCellBuffer();
  const rows = 8;
  const rowH = CELL_SIZE / rows;
  const cols = 4;
  const colW = CELL_SIZE / cols;
  for (let y = 0; y < CELL_SIZE; y++) {
    const ry = Math.floor(y / rowH);
    const ly = y - ry * rowH;
    const stagger = (ry % 2) * (colW * 0.5);
    for (let x = 0; x < CELL_SIZE; x++) {
      const sx = (x + stagger) % CELL_SIZE;
      const rx = Math.floor(sx / colW);
      const lx = sx - rx * colW;
      const edge = Math.min(ly, rowH - 1 - ly, lx, colW - 1 - lx);
      const mortar = edge < 3.2;
      const bevel = Math.min(1, edge / 8.5);
      const stoneVar = hash2(rx, ry, 103);
      const grit = fbm(x * 0.07, y * 0.07, 55);
      if (mortar) {
        setCellPixel(b, x, y, 78 + grit * 14, 76 + grit * 14, 72 + grit * 14, 0.05, 245, 0, 120);
      } else {
        const base = 0.74 + stoneVar * 0.22 + (grit - 0.5) * 0.18;
        setCellPixel(b, x, y, 168 * base, 160 * base, 146 * base, 0.35 + bevel * 0.45 + grit * 0.22, 210 - grit * 25, 0, clampByte(172 + bevel * 83));
      }
    }
  }
  return b;
}

function genPlasterAndBricks(): CellBuffer {
  const b = makeCellBuffer();
  const rows = 16;
  const rowH = CELL_SIZE / rows;
  const cols = 8;
  const colW = CELL_SIZE / cols;
  for (let y = 0; y < CELL_SIZE; y++) {
    const ry = Math.floor(y / rowH);
    const ly = y - ry * rowH;
    const stagger = (ry % 2) * (colW * 0.5);
    for (let x = 0; x < CELL_SIZE; x++) {
      const sx = (x + stagger) % CELL_SIZE;
      const rx = Math.floor(sx / colW);
      const lx = sx - rx * colW;
      const peelNoise = fbm(x * 0.018, y * 0.018, 221);
      const damp = fbm(x * 0.025, y * 0.025, 317);
      const exposedBrick = peelNoise > 0.76 || (y > 435 && peelNoise > 0.54);
      if (!exposedBrick) {
        const edgeFade = Math.min(1, Math.max(0, (0.76 - peelNoise) * 24));
        const stu = fbm(x * 0.08, y * 0.08, 73);
        const shade = 0.86 + (stu - 0.5) * 0.14 - Math.max(0, damp - 0.58) * 0.30;
        setCellPixel(b, x, y, 188 * shade, 168 * shade, 136 * shade, 0.74 + stu * 0.12 + edgeFade * 0.14, 212, 0, clampByte(212 + edgeFade * 43));
      } else {
        const edge = Math.min(ly, rowH - 1 - ly, lx, colW - 1 - lx);
        const mortar = edge < 2.4;
        const bVar = hash2(rx, ry, 99);
        const tex = fbm(x * 0.09, y * 0.09, 17);
        if (mortar) {
          setCellPixel(b, x, y, 108, 102, 92, 0.12, 242, 0, 125);
        } else {
          setCellPixel(b, x, y, 134 + bVar * 26 + tex * 12, 84 + bVar * 16 + tex * 10, 64 + bVar * 14 + tex * 8, 0.34 + Math.min(1, edge / 5) * 0.24 + tex * 0.12, 224, 0, 195);
        }
      }
    }
  }
  return b;
}

function genCobbleFan(): CellBuffer {
  const b = makeCellBuffer();
  const arcW = 128;
  const arcH = 96;
  for (let y = 0; y < CELL_SIZE; y++) {
    for (let x = 0; x < CELL_SIZE; x++) {
      const col = Math.floor(x / arcW);
      const ax = (x % arcW) - arcW * 0.5;
      const ayShift = (col % 2) * (arcH * 0.5);
      const yy = (y + ayShift) % arcH;
      const dist = Math.hypot(ax, yy * 0.92 + 12);
      const ring = Math.floor(dist / 16);
      const ang = Math.atan2(yy + 12, ax);
      const stonesInRing = Math.max(4, Math.round((ring + 1) * 3.1));
      const angSector = ((ang / Math.PI) * stonesInRing + 10) % 1;
      const rFrac = (dist % 16) / 16;
      const edgeR = Math.min(rFrac, 1 - rFrac) * 16;
      const edgeA = Math.min(angSector, 1 - angSector) * ((dist * Math.PI) / stonesInRing);
      const edge = Math.min(edgeR, edgeA);

      const sSeed = hash2(ring + col * 19, Math.floor(ang * 10), 401);
      const g = fbm(x * 0.11, y * 0.11, 88);
      if (edge < 2.2) {
        const snowCrevice = fbm(x * 0.04, y * 0.04, 151) > 0.62;
        setCellPixel(b, x, y, snowCrevice ? 168 : 48, snowCrevice ? 178 : 50, snowCrevice ? 192 : 56, 0.06, 225, 0, 120);
      } else {
        const dome = Math.sin(Math.min(1, (edge - 2.2) / 5.5) * Math.PI * 0.5);
        const tone = 0.72 + sSeed * 0.28 + (g - 0.5) * 0.14;
        const wetGlaze = 128 - dome * 42; // Wet icy stone gleams cleanly under kiln firelight!
        setCellPixel(b, x, y, 114 * tone, 115 * tone, 122 * tone, 0.22 + dome * 0.72 + g * 0.10, wetGlaze, 0, clampByte(168 + dome * 87));
      }
    }
  }
  return b;
}

function genClayTile(): CellBuffer {
  const b = makeCellBuffer();
  const ribs = 12;
  const courses = 6;
  const courseH = CELL_SIZE / courses;
  for (let y = 0; y < CELL_SIZE; y++) {
    const cy = Math.floor(y / courseH);
    const ly = y - cy * courseH;
    const lipDist = courseH - 1 - ly;
    for (let x = 0; x < CELL_SIZE; x++) {
      const rx = (x * ribs) / CELL_SIZE;
      const ribId = Math.floor(rx);
      const barrel = Math.cos(((rx - ribId) * Math.PI * 2) - Math.PI) * 0.5 + 0.5;
      const tileVar = hash2(ribId, cy, 509);
      const tex = fbm(x * 0.06, y * 0.06, 33);
      const shadowLip = lipDist < 5 ? lipDist / 5 : 1.0;
      const shade = (0.74 + tileVar * 0.22 + (tex - 0.5) * 0.14) * (0.58 + 0.42 * shadowLip);
      setCellPixel(b, x, y, 156 * shade, 70 * shade, 48 * shade, barrel * 0.68 + (ly / courseH) * 0.3 + tex * 0.08, 175, 0, clampByte((0.45 + 0.55 * barrel) * shadowLip * 255));
    }
  }
  return b;
}

function genSlateTile(): CellBuffer {
  const b = makeCellBuffer();
  const rows = 10;
  const rowH = CELL_SIZE / rows;
  const cols = 8;
  const colW = CELL_SIZE / cols;
  for (let y = 0; y < CELL_SIZE; y++) {
    const ry = Math.floor(y / rowH);
    const ly = y - ry * rowH;
    const stagger = (ry % 2) * (colW * 0.5);
    const lip = rowH - 1 - ly;
    for (let x = 0; x < CELL_SIZE; x++) {
      const sx = (x + stagger) % CELL_SIZE;
      const rx = Math.floor(sx / colW);
      const lx = sx - rx * colW;
      const crack = lx < 2 || lx > colW - 2;
      const sVar = hash2(rx, ry, 613);
      const grit = fbm(x * 0.08, y * 0.08, 91);
      const edgeAO = crack ? 0.55 : lip < 4 ? 0.55 + (lip / 4) * 0.45 : 1.0;
      const tone = (0.74 + sVar * 0.24 + (grit - 0.5) * 0.14) * edgeAO;
      setCellPixel(b, x, y, 74 * tone, 86 * tone, 106 * tone, crack ? 0.15 : 0.35 + (ly / rowH) * 0.55 + grit * 0.1, 138, 20, clampByte(edgeAO * 255));
    }
  }
  return b;
}

function genWoodDoor(): CellBuffer {
  const b = makeCellBuffer();
  for (let y = 0; y < CELL_SIZE; y++) {
    for (let x = 0; x < CELL_SIZE; x++) {
      const plank = Math.floor(x / 64);
      const px = x % 64;
      const groove = px < 2 || px > 61;
      const rail = (y > 40 && y < 74) || (y > 240 && y < 276) || (y > 448 && y < 484);
      const panelBorder = !rail && ((x > 46 && x < 236) || (x > 276 && x < 466)) && ((y > 96 && y < 220) || (y > 296 && y < 428));
      const grain = fbm(x * 0.12, y * 0.02, 77 + plank * 3);
      const ironBand = (y > 90 && y < 110 && x < 240) || (y > 395 && y < 415 && x < 240);
      const dr = Math.hypot(x - 430, y - 260);
      if (dr < 24 && dr > 11) {
        setCellPixel(b, x, y, 218, 178, 86, 0.95, 56, 235, 255);
      } else if (ironBand) {
        setCellPixel(b, x, y, 40, 42, 46, 0.85, 110, 190, 225);
      } else {
        const shade = groove ? 0.45 : panelBorder ? 1.1 : 0.92;
        setCellPixel(b, x, y, (92 + grain * 24) * shade, (58 + grain * 18) * shade, (36 + grain * 12) * shade, groove ? 0.1 : panelBorder ? 0.72 : 0.48 + grain * 0.15, 152, 0, groove ? 130 : 240);
      }
    }
  }
  return b;
}

function genAwningRed(): CellBuffer {
  const b = makeCellBuffer();
  for (let y = 0; y < CELL_SIZE; y++) {
    for (let x = 0; x < CELL_SIZE; x++) {
      const stripe = Math.floor(x / 64) % 2 === 0;
      const weave = Math.sin(x * 0.9) * Math.cos(y * 0.9) * 0.5 + 0.5;
      const dirty = 1.0 - (fbm(x * 0.02, y * 0.02, 12) - 0.5) * 0.14;
      setCellPixel(b, x, y, (stripe ? 176 : 228) * dirty, (stripe ? 52 : 216) * dirty, (stripe ? 40 : 196) * dirty, 0.5 + weave * 0.1, 215, 0, 245);
    }
  }
  return b;
}

function genInteriorRoom(): CellBuffer {
  const b = makeCellBuffer();
  canvasToCell(
    b,
    (ctx, s) => {
      const grad = ctx.createRadialGradient(s * 0.5, s * 0.22, 16, s * 0.5, s * 0.5, s * 0.65);
      grad.addColorStop(0, '#ffe8aa');
      grad.addColorStop(0.35, '#e8ba6b');
      grad.addColorStop(1, '#7a5233');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, s, s);

      ctx.fillStyle = '#5c3c24';
      ctx.fillRect(0, s * 0.66, s, s * 0.34);
      ctx.fillStyle = '#472d19';
      for (let x = 16; x < s; x += 64) ctx.fillRect(x, s * 0.70, 44, s * 0.24);

      ctx.fillStyle = '#6c4928';
      ctx.fillRect(s * 0.36, s * 0.20, s * 0.28, s * 0.24);
      ctx.fillStyle = '#8fa98d';
      ctx.fillRect(s * 0.39, s * 0.23, s * 0.22, s * 0.18);

      ctx.fillStyle = '#d6c6ac';
      ctx.fillRect(s * 0.22, s * 0.60, s * 0.56, s * 0.26);
      ctx.fillStyle = '#b44838';
      for (let ty = 0; ty < 6; ty++) {
        for (let tx = 0; tx < 12; tx++) {
          if ((tx + ty) % 2 === 0) ctx.fillRect(s * 0.22 + tx * 24, s * 0.60 + ty * 22, 24, 22);
        }
      }
      ctx.fillStyle = '#e8d79b';
      ctx.beginPath();
      ctx.ellipse(s * 0.50, s * 0.68, 28, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(246, 232, 206, 0.88)';
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(s * 0.24, 0); ctx.quadraticCurveTo(s * 0.18, s * 0.55, s * 0.08, s); ctx.lineTo(0, s);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(s, 0); ctx.lineTo(s * 0.76, 0); ctx.quadraticCurveTo(s * 0.82, s * 0.55, s * 0.92, s); ctx.lineTo(s, s);
      ctx.closePath(); ctx.fill();

      ctx.fillStyle = '#fff5cf';
      ctx.beginPath();
      ctx.arc(s * 0.5, s * 0.10, 26, 0, Math.PI * 2);
      ctx.fill();
    },
    (img, p) => {
      const lum = (img[p] + img[p + 1] + img[p + 2]) / (3 * 255);
      return { h: 0.4, rough: 225, metal: 0, ao: 255, em: Math.round(lum * 255) };
    },
  );
  return b;
}

function genWinterGrass(): CellBuffer {
  const b = makeCellBuffer();
  for (let y = 0; y < CELL_SIZE; y++) {
    for (let x = 0; x < CELL_SIZE; x++) {
      const patch = fbm(x * 0.02, y * 0.02, 307);
      const blade = fbm(x * 0.24, y * 0.24, 809);
      const frost = smoothVal(0.45, 0.75, patch);
      const l = 0.72 + patch * 0.25 + (blade - 0.5) * 0.18;
      // Frosted Yorkshire moor grass blending olive sage + frost tips
      const r = (74 * (1 - frost * 0.4) + 170 * (frost * 0.4)) * l;
      const g = (94 * (1 - frost * 0.4) + 186 * (frost * 0.4)) * l;
      const bl = (58 * (1 - frost * 0.4) + 198 * (frost * 0.4)) * l;
      setCellPixel(b, x, y, r, g, bl, 0.35 + blade * 0.45, 224, 0, clampByte(185 + blade * 70));
    }
  }
  return b;
}

function smoothVal(e0: number, e1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

function genSigns(): CellBuffer {
  const b = makeCellBuffer();
  canvasToCell(
    b,
    (ctx, s) => {
      ctx.fillStyle = '#254230';
      ctx.fillRect(0, 0, s, s * 0.5);
      ctx.strokeStyle = '#d4b46a';
      ctx.lineWidth = 10;
      ctx.strokeRect(14, 14, s - 28, s * 0.5 - 28);
      ctx.fillStyle = '#efe0b8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 54px Georgia, serif';
      ctx.fillText('ALIMENTARI', s * 0.5, s * 0.19);
      ctx.font = 'bold 26px Georgia, serif';
      ctx.fillStyle = '#d9bf82';
      ctx.fillText('DARROWBY · EST. 1784', s * 0.5, s * 0.34);

      ctx.fillStyle = '#aba08a';
      ctx.fillRect(0, s * 0.5, s * 0.5, s * 0.5);
      ctx.strokeStyle = '#6f6655';
      ctx.lineWidth = 8;
      ctx.strokeRect(12, s * 0.5 + 12, s * 0.5 - 24, s * 0.5 - 24);
      ctx.fillStyle = '#4e463a';
      ctx.font = 'bold 66px Georgia, serif';
      ctx.fillText('1784', s * 0.25, s * 0.75);

      ctx.fillStyle = '#1e3f68';
      ctx.fillRect(s * 0.5, s * 0.5, s * 0.5, s * 0.5);
      ctx.strokeStyle = '#e8e4d8';
      ctx.lineWidth = 10;
      ctx.strokeRect(s * 0.5 + 16, s * 0.5 + 16, s * 0.5 - 32, s * 0.5 - 32);
      ctx.fillStyle = '#f2efe6';
      ctx.font = 'bold 42px Georgia, serif';
      ctx.fillText('VIA DEL', s * 0.75, s * 0.68);
      ctx.fillText('SOLE', s * 0.75, s * 0.82);
    },
    (img, p, x, y) => {
      const lum = (img[p] + img[p + 1] + img[p + 2]) / (3 * 255);
      const isLintel = y >= 256 && x < 256;
      return { h: isLintel ? lum * 0.8 : 0.65, rough: y >= 256 && x >= 256 ? 78 : 165, metal: 0, ao: 245, em: 0 };
    },
  );
  return b;
}

function genClockDial(): CellBuffer {
  const b = makeCellBuffer();
  canvasToCell(
    b,
    (ctx, s) => {
      ctx.fillStyle = '#efe0b8';
      ctx.fillRect(0, 0, s, s);
      const cx = s * 0.5;
      const cy = s * 0.5;
      ctx.strokeStyle = '#38322a';
      ctx.lineWidth = 16;
      ctx.beginPath(); ctx.arc(cx, cy, s * 0.42, 0, Math.PI * 2); ctx.stroke();
      ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(cx, cy, s * 0.35, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        ctx.lineWidth = i % 3 === 0 ? 12 : 6;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * s * 0.28, cy + Math.sin(a) * s * 0.28);
        ctx.lineTo(cx + Math.cos(a) * s * 0.36, cy + Math.sin(a) * s * 0.36);
        ctx.stroke();
      }
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx, cy); ctx.lineTo(cx - s * 0.16, cy - s * 0.10);
      ctx.moveTo(cx, cy); ctx.lineTo(cx + s * 0.21, cy - s * 0.16);
      ctx.stroke();
      ctx.fillStyle = '#8b6830';
      ctx.beginPath(); ctx.arc(cx, cy, 16, 0, Math.PI * 2); ctx.fill();
    },
    (img, p) => {
      const dark = img[p] < 100 ? 0.1 : 0.8;
      return { h: dark, rough: 155, metal: 10, ao: 255, em: img[p] > 140 ? 225 : 20 };
    },
  );
  return b;
}

function genDryStone(): CellBuffer {
  const b = makeCellBuffer();
  for (let y = 0; y < CELL_SIZE; y++) {
    const row = Math.floor(y / 32);
    const ly = y % 32;
    for (let x = 0; x < CELL_SIZE; x++) {
      const shift = hash2(row, 1, 701) * 48;
      const sx = x + shift;
      const cellW = 48 + Math.floor(hash2(Math.floor(sx / 64), row, 709) * 32);
      const col = Math.floor(sx / cellW);
      const lx = sx % cellW;
      const edge = Math.min(ly, 31 - ly, lx, cellW - 1 - lx);
      const n = fbm(x * 0.09, y * 0.09, 88);
      const sv = hash2(col, row, 733);
      if (edge < 2.2) {
        setCellPixel(b, x, y, 56, 55, 54, 0.08, 240, 0, 115);
      } else {
        const s = 0.70 + sv * 0.28 + (n - 0.5) * 0.18;
        setCellPixel(b, x, y, 126 * s, 122 * s, 118 * s, 0.3 + Math.min(1, edge / 6) * 0.55 + n * 0.15, 218, 0, clampByte(170 + edge * 14));
      }
    }
  }
  return b;
}

function genAwningGreenAndRug(): CellBuffer {
  const b = makeCellBuffer();
  for (let y = 0; y < CELL_SIZE; y++) {
    for (let x = 0; x < CELL_SIZE; x++) {
      if (y < 256) {
        const stripe = Math.floor(x / 64) % 2 === 0;
        const weave = Math.sin(x * 0.9) * Math.cos(y * 0.9) * 0.5 + 0.5;
        setCellPixel(b, x, y, stripe ? 56 : 226, stripe ? 96 : 216, stripe ? 64 : 196, 0.5 + weave * 0.1, 215, 0, 245);
      } else {
        const dx = Math.abs((x - 256) / 220);
        const dy = Math.abs((y - 384) / 110);
        const d = dx + dy;
        const thread = fbm(x * 0.35, y * 0.35, 31) * 0.14 + 0.93;
        let r = 138, g = 46, bl = 40;
        if (d < 0.24) { r = 224; g = 210; bl = 186; }
        else if (d < 0.44) { r = 38; g = 56; bl = 86; }
        else if (d > 0.78 && d < 0.90) { r = 212; g = 176; bl = 104; }
        setCellPixel(b, x, y, r * thread, g * thread, bl * thread, 0.55 + (thread - 0.93) * 1.5, 235, 0, 240);
      }
    }
  }
  return b;
}

function genShutterWood(): CellBuffer {
  const b = makeCellBuffer();
  for (let y = 0; y < CELL_SIZE; y++) {
    for (let x = 0; x < CELL_SIZE; x++) {
      const grain = fbm(x * 0.14, y * 0.03, 521);
      const slat = Math.sin((y / CELL_SIZE) * Math.PI * 28) * 0.5 + 0.5;
      const l = 0.78 + grain * 0.2 + slat * 0.16;
      setCellPixel(b, x, y, 52 * l, 94 * l, 62 * l, 0.4 + slat * 0.45, 165, 0, clampByte(185 + slat * 70));
    }
  }
  return b;
}

function genForgeAndKiln(): CellBuffer {
  const b = makeCellBuffer();
  // Top half (y 0..255): Heavy forged cast-iron plates + raised domed rivets (for industrial iron bell & bands!)
  for (let y = 0; y < 256; y++) {
    for (let x = 0; x < CELL_SIZE; x++) {
      const px = x % 128;
      const py = y % 128;
      const seam = Math.min(px, 127 - px, py, 127 - py) < 3;
      const rust = fbm(x * 0.05, y * 0.05, 641);
      const rivX = Math.min(Math.abs(px - 18), Math.abs(px - 110));
      const rivY = Math.min(Math.abs(py - 18), Math.abs(py - 110));
      const dr = Math.hypot(rivX, rivY);
      const isRivet = dr < 9;
      if (seam) {
        setCellPixel(b, x, y, 36, 36, 40, 0.08, 200, 140, 120);
      } else if (isRivet) {
        const dome = Math.sqrt(Math.max(0, 1 - (dr / 9) * (dr / 9)));
        setCellPixel(b, x, y, 88 + dome * 32, 86 + dome * 28, 86 + dome * 26, 0.6 + dome * 0.4, 88, 225, 255);
      } else {
        const rs = Math.max(0, rust - 0.56) * 2.2;
        setCellPixel(
          b,
          x,
          y,
          64 + rs * 54,
          64 + rs * 22,
          70 - rs * 10,
          0.42 + rust * 0.14,
          104 + rs * 90,
          215 - rs * 110,
          230,
        );
      }
    }
  }
  // Bottom half (y 256..511): Glowing Kiln Hearth Embers & Charred Charcoal Firebricks
  for (let y = 256; y < CELL_SIZE; y++) {
    const ny = (y - 256) / 256;
    for (let x = 0; x < CELL_SIZE; x++) {
      const nx = x / CELL_SIZE;
      const distCore = Math.hypot(nx - 0.5, (ny - 0.55) * 1.2);
      const coal = fbm(x * 0.07, y * 0.07, 977);
      const heat = Math.max(0, 1 - distCore * 1.55) * (0.65 + 0.55 * coal);
      const crack = coal > 0.48 ? heat : heat * 0.35;
      const r = 42 + crack * 213;
      const g = 24 + Math.pow(crack, 1.45) * 185;
      const bl = 18 + Math.pow(crack, 2.3) * 110;
      setCellPixel(b, x, y, r, g, bl, 0.25 + coal * 0.65, 210, 0, 240, clampByte(crack * 255));
    }
  }
  return b;
}

function sobelNormal(height: Float32Array, strength = 2.6): { nx: Float32Array; ny: Float32Array; nz: Float32Array } {
  const n = CELL_SIZE * CELL_SIZE;
  const nx = new Float32Array(n);
  const ny = new Float32Array(n);
  const nz = new Float32Array(n);
  const sample = (x: number, y: number) => height[Math.max(0, Math.min(CELL_SIZE - 1, y)) * CELL_SIZE + Math.max(0, Math.min(CELL_SIZE - 1, x))];
  for (let y = 0; y < CELL_SIZE; y++) {
    for (let x = 0; x < CELL_SIZE; x++) {
      const tl = sample(x - 1, y - 1);
      const l = sample(x - 1, y);
      const bl = sample(x - 1, y + 1);
      const t = sample(x, y - 1);
      const bt = sample(x, y + 1);
      const tr = sample(x + 1, y - 1);
      const r = sample(x + 1, y);
      const br = sample(x + 1, y + 1);
      const dX = (tr + 2 * r + br - (tl + 2 * l + bl)) * strength;
      const dY = (bl + 2 * bt + br - (tl + 2 * t + tr)) * strength;
      const vx = -dX;
      const vy = -dY;
      const vz = 1.0;
      const inv = 1 / Math.hypot(vx, vy, vz);
      const i = y * CELL_SIZE + x;
      nx[i] = vx * inv;
      ny[i] = vy * inv;
      nz[i] = vz * inv;
    }
  }
  return { nx, ny, nz };
}

export function buildProceduralAtlas(): ProceduralAtlas {
  const albedoCanvas = document.createElement('canvas');
  albedoCanvas.width = ATLAS_SIZE;
  albedoCanvas.height = ATLAS_SIZE;
  const ctx = albedoCanvas.getContext('2d')!;
  const normalData = new Uint8Array(ATLAS_SIZE * ATLAS_SIZE * 4);
  const materialData = new Uint8Array(ATLAS_SIZE * ATLAS_SIZE * 4);

  const cells: Array<{ coord: CellCoord; gen: () => CellBuffer; normalStr: number }> = [
    { coord: MAT_MILL_TIMBER, gen: genMillTimber, normalStr: 2.3 },
    { coord: MAT_LIMESTONE, gen: genLimestone, normalStr: 3.1 },
    { coord: MAT_PLASTER_BRICK, gen: genPlasterAndBricks, normalStr: 2.9 },
    { coord: MAT_COBBLE_FAN, gen: genCobbleFan, normalStr: 3.6 },
    { coord: MAT_CLAY_TILE, gen: genClayTile, normalStr: 3.2 },
    { coord: MAT_SLATE_TILE, gen: genSlateTile, normalStr: 2.8 },
    { coord: MAT_WOOD_DOOR, gen: genWoodDoor, normalStr: 2.6 },
    { coord: MAT_AWNING_RED, gen: genAwningRed, normalStr: 1.8 },
    { coord: MAT_INTERIOR_ROOM, gen: genInteriorRoom, normalStr: 0.4 },
    { coord: MAT_GRASS, gen: genWinterGrass, normalStr: 2.4 },
    { coord: MAT_SIGNS, gen: genSigns, normalStr: 2.2 },
    { coord: MAT_CLOCK_DIAL, gen: genClockDial, normalStr: 1.8 },
    { coord: MAT_DRY_STONE, gen: genDryStone, normalStr: 3.4 },
    { coord: MAT_AWNING_GREEN_RUG, gen: genAwningGreenAndRug, normalStr: 1.9 },
    { coord: MAT_SHUTTER_WOOD, gen: genShutterWood, normalStr: 2.5 },
    { coord: MAT_FORGE_KILN, gen: genForgeAndKiln, normalStr: 3.0 },
  ];

  const imgScratch = ctx.createImageData(CELL_SIZE, CELL_SIZE);
  for (const item of cells) {
    const buf = item.gen();
    const { nx, ny, nz } = sobelNormal(buf.height, item.normalStr);
    imgScratch.data.set(buf.albedo);
    ctx.putImageData(imgScratch, item.coord.col * CELL_SIZE, item.coord.row * CELL_SIZE);

    const ox = item.coord.col * CELL_SIZE;
    const oy = item.coord.row * CELL_SIZE;
    for (let y = 0; y < CELL_SIZE; y++) {
      for (let x = 0; x < CELL_SIZE; x++) {
        const si = y * CELL_SIZE + x;
        const di = ((oy + y) * ATLAS_SIZE + (ox + x)) * 4;
        normalData[di] = clampByte((nx[si] * 0.5 + 0.5) * 255);
        normalData[di + 1] = clampByte((ny[si] * 0.5 + 0.5) * 255);
        normalData[di + 2] = clampByte((nz[si] * 0.5 + 0.5) * 255);
        normalData[di + 3] = 255;

        materialData[di] = buf.rough[si];
        materialData[di + 1] = buf.metal[si];
        materialData[di + 2] = buf.ao[si];
        materialData[di + 3] = buf.emissive[si];
      }
    }
  }

  return { albedoCanvas, normalData, materialData, size: ATLAS_SIZE };
}
