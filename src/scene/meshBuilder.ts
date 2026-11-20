import {
  MAT_AWNING_GREEN_RUG,
  MAT_AWNING_RED,
  MAT_CLAY_TILE,
  MAT_CLOCK_DIAL,
  MAT_COBBLE_FAN,
  MAT_DRY_STONE,
  MAT_FORGE_KILN,
  MAT_GRASS,
  MAT_INTERIOR_ROOM,
  MAT_LIMESTONE,
  MAT_MILL_TIMBER,
  MAT_PLASTER_BRICK,
  MAT_SHUTTER_WOOD,
  MAT_SIGNS,
  MAT_SLATE_TILE,
  MAT_WOOD_DOOR,
  UvRect,
  uvRect,
} from '../assets/proceduralTextures';

// 13 floats: pos(3) + normal(3) + uv(2) + tint(3) + ao(1) + flags(1)
export const VERT_STRIDE = 13;

export const FLAG_PBR = 0.0;
export const FLAG_INTERIOR = 1.0;
export const FLAG_LANTERN = 2.0;
export const FLAG_WATER = 3.0;
export const FLAG_GLASS = 4.0;
export const FLAG_FIRE = 5.0; // Intense warm kiln hearth flame & embers (no snow!)
export const FLAG_SNOW_EXEMPT = 6.0; // Steep/vertical prop or hero character surface without thick snow coating

export interface PointLightDef {
  x: number;
  y: number;
  z: number;
  r: number;
  g: number;
  b: number;
  radius: number;
  intensity: number;
  kind: 'kiln' | 'lantern' | 'window' | 'bridge';
}

export interface BuiltMesh {
  vertices: Float32Array;
  indices: Uint32Array;
  vertexCount: number;
  indexCount: number;
}

export const UV_TIMBER = uvRect(MAT_MILL_TIMBER);
export const UV_LIMESTONE = uvRect(MAT_LIMESTONE);
export const UV_PLASTER = uvRect(MAT_PLASTER_BRICK);
export const UV_COBBLE = uvRect(MAT_COBBLE_FAN);
export const UV_CLAY = uvRect(MAT_CLAY_TILE);
export const UV_SLATE = uvRect(MAT_SLATE_TILE);
export const UV_DOOR = uvRect(MAT_WOOD_DOOR);
export const UV_AWNING_RED = uvRect(MAT_AWNING_RED);
export const UV_CREAM = uvRect(MAT_AWNING_RED, 0.14, 0.10, 0.23, 0.90);
export const UV_INTERIOR = uvRect(MAT_INTERIOR_ROOM);
export const UV_GRASS = uvRect(MAT_GRASS);
export const UV_SIGN_GROCER = uvRect(MAT_SIGNS, 0.01, 0.01, 0.99, 0.49);
export const UV_LINTEL_1784 = uvRect(MAT_SIGNS, 0.02, 0.52, 0.48, 0.98);
export const UV_PLAQUE_VIA = uvRect(MAT_SIGNS, 0.52, 0.52, 0.98, 0.98);
export const UV_CLOCK = uvRect(MAT_CLOCK_DIAL);
export const UV_DRY_STONE = uvRect(MAT_DRY_STONE);
export const UV_AWNING_GREEN = uvRect(MAT_AWNING_GREEN_RUG, 0.01, 0.01, 0.99, 0.49);
export const UV_RUG_KILIM = uvRect(MAT_AWNING_GREEN_RUG, 0.02, 0.52, 0.98, 0.98);
export const UV_SHUTTER = uvRect(MAT_SHUTTER_WOOD);
export const UV_IRON_RIVET = uvRect(MAT_FORGE_KILN, 0.01, 0.01, 0.99, 0.48);
export const UV_KILN_COAL = uvRect(MAT_FORGE_KILN, 0.01, 0.52, 0.99, 0.99);

export class MeshBuilder {
  private verts: Float32Array;
  private inds: Uint32Array;
  vCount = 0;
  iCount = 0;

  constructor(initV = 16384, initI = 24576) {
    this.verts = new Float32Array(initV * VERT_STRIDE);
    this.inds = new Uint32Array(initI);
  }

  private ensure(addV: number, addI: number): void {
    if ((this.vCount + addV) * VERT_STRIDE > this.verts.length) {
      const next = new Float32Array(Math.max(this.verts.length * 2, (this.vCount + addV) * VERT_STRIDE));
      next.set(this.verts);
      this.verts = next;
    }
    if (this.iCount + addI > this.inds.length) {
      const next = new Uint32Array(Math.max(this.inds.length * 2, this.iCount + addI));
      next.set(this.inds);
      this.inds = next;
    }
  }

  addVertex(
    px: number,
    py: number,
    pz: number,
    nx: number,
    ny: number,
    nz: number,
    u: number,
    v: number,
    tr = 1,
    tg = 1,
    tb = 1,
    ao = 1,
    flag = FLAG_PBR,
  ): number {
    this.ensure(1, 0);
    const id = this.vCount++;
    let p = id * VERT_STRIDE;
    const arr = this.verts;
    arr[p++] = px;
    arr[p++] = py;
    arr[p++] = pz;
    arr[p++] = nx;
    arr[p++] = ny;
    arr[p++] = nz;
    arr[p++] = u;
    arr[p++] = v;
    arr[p++] = tr;
    arr[p++] = tg;
    arr[p++] = tb;
    arr[p++] = ao;
    arr[p++] = flag;
    return id;
  }

  addQuad(
    p0: [number, number, number],
    p1: [number, number, number],
    p2: [number, number, number],
    p3: [number, number, number],
    uv: UvRect,
    tint: [number, number, number] = [1, 1, 1],
    ao0 = 1,
    ao1 = 1,
    ao2 = 1,
    ao3 = 1,
    flag = FLAG_PBR,
    customNormal?: [number, number, number],
  ): void {
    this.ensure(4, 6);
    let nx: number;
    let ny: number;
    let nz: number;
    if (customNormal) {
      [nx, ny, nz] = customNormal;
    } else {
      const ax = p1[0] - p0[0];
      const ay = p1[1] - p0[1];
      const az = p1[2] - p0[2];
      const bx = p3[0] - p0[0];
      const by = p3[1] - p0[1];
      const bz = p3[2] - p0[2];
      nx = ay * bz - az * by;
      ny = az * bx - ax * bz;
      nz = ax * by - ay * bx;
      const len = Math.hypot(nx, ny, nz) || 1;
      nx /= len;
      ny /= len;
      nz /= len;
    }
    const i0 = this.addVertex(p0[0], p0[1], p0[2], nx, ny, nz, uv.u0, uv.v1, tint[0], tint[1], tint[2], ao0, flag);
    const i1 = this.addVertex(p1[0], p1[1], p1[2], nx, ny, nz, uv.u1, uv.v1, tint[0], tint[1], tint[2], ao1, flag);
    const i2 = this.addVertex(p2[0], p2[1], p2[2], nx, ny, nz, uv.u1, uv.v0, tint[0], tint[1], tint[2], ao2, flag);
    const i3 = this.addVertex(p3[0], p3[1], p3[2], nx, ny, nz, uv.u0, uv.v0, tint[0], tint[1], tint[2], ao3, flag);

    const ind = this.inds;
    let ip = this.iCount;
    ind[ip++] = i0;
    ind[ip++] = i1;
    ind[ip++] = i2;
    ind[ip++] = i0;
    ind[ip++] = i2;
    ind[ip++] = i3;
    this.iCount = ip;
  }

  addBox(
    cx: number,
    cy: number,
    cz: number,
    sx: number,
    sy: number,
    sz: number,
    uv: UvRect,
    tint: [number, number, number] = [1, 1, 1],
    opts: {
      rotY?: number;
      rotX?: number;
      rotZ?: number;
      aoBottom?: number;
      aoTop?: number;
      flag?: number;
      skipBottom?: boolean;
    } = {},
  ): void {
    const hx = sx * 0.5;
    const hy = sy * 0.5;
    const hz = sz * 0.5;
    const ry = opts.rotY ?? 0;
    const rx = opts.rotX ?? 0;
    const rz = opts.rotZ ?? 0;
    const aoB = opts.aoBottom ?? 0.84;
    const aoT = opts.aoTop ?? 1.0;
    const flag = opts.flag ?? FLAG_PBR;

    const cyr = Math.cos(ry), syr = Math.sin(ry);
    const cxr = Math.cos(rx), sxr = Math.sin(rx);
    const czr = Math.cos(rz), szr = Math.sin(rz);

    const xf = (lx: number, ly: number, lz: number): [number, number, number] => {
      const x1 = lx * czr - ly * szr;
      const y1 = lx * szr + ly * czr;
      const y2 = y1 * cxr - lz * sxr;
      const z2 = y1 * sxr + lz * cxr;
      const x3 = x1 * cyr + z2 * syr;
      const z3 = -x1 * syr + z2 * cyr;
      return [cx + x3, cy + y2, cz + z3];
    };

    const p000 = xf(-hx, -hy, -hz);
    const p100 = xf(hx, -hy, -hz);
    const p110 = xf(hx, hy, -hz);
    const p010 = xf(-hx, hy, -hz);
    const p001 = xf(-hx, -hy, hz);
    const p101 = xf(hx, -hy, hz);
    const p111 = xf(hx, hy, hz);
    const p011 = xf(-hx, hy, hz);

    this.addQuad(p011, p111, p110, p010, uv, tint, aoT, aoT, aoT, aoT, flag);
    if (!opts.skipBottom) this.addQuad(p000, p100, p101, p001, uv, tint, aoB, aoB, aoB, aoB, flag);
    this.addQuad(p001, p101, p111, p011, uv, tint, aoB, aoB, aoT, aoT, flag);
    this.addQuad(p100, p000, p010, p110, uv, tint, aoB, aoB, aoT, aoT, flag);
    this.addQuad(p101, p100, p110, p111, uv, tint, aoB, aoB, aoT, aoT, flag);
    this.addQuad(p000, p001, p011, p010, uv, tint, aoB, aoB, aoT, aoT, flag);
  }

  addTiledFloor(
    x0: number,
    z0: number,
    x1: number,
    z1: number,
    y: number,
    nxSegs: number,
    nzSegs: number,
    uv: UvRect,
    tint: [number, number, number] = [1, 1, 1],
    ao = 0.94,
    flag = FLAG_PBR,
  ): void {
    const dx = (x1 - x0) / nxSegs;
    const dz = (z1 - z0) / nzSegs;
    for (let iz = 0; iz < nzSegs; iz++) {
      for (let ix = 0; ix < nxSegs; ix++) {
        const ax = x0 + ix * dx;
        const az = z0 + iz * dz;
        this.addQuad(
          [ax, y, az + dz],
          [ax + dx, y, az + dz],
          [ax + dx, y, az],
          [ax, y, az],
          uv,
          tint,
          ao,
          ao,
          ao,
          ao,
          flag,
          [0, 1, 0],
        );
      }
    }
  }

  addCylinder(
    cx: number,
    y0: number,
    cz: number,
    rBot: number,
    rTop: number,
    height: number,
    segs: number,
    uv: UvRect,
    tint: [number, number, number] = [1, 1, 1],
    rotX = 0,
    rotZ = 0,
    flag = FLAG_PBR,
  ): void {
    const cxr = Math.cos(rotX), sxr = Math.sin(rotX);
    const czr = Math.cos(rotZ), szr = Math.sin(rotZ);
    const trP = (lx: number, ly: number, lz: number): [number, number, number] => {
      const x1 = lx * czr - ly * szr;
      const y1 = lx * szr + ly * czr;
      const y2 = y1 * cxr - lz * sxr;
      const z2 = y1 * sxr + lz * cxr;
      return [cx + x1, y0 + y2, cz + z2];
    };

    for (let i = 0; i < segs; i++) {
      const a0 = (i / segs) * Math.PI * 2;
      const a1 = ((i + 1) / segs) * Math.PI * 2;
      const c0 = Math.cos(a0), s0 = Math.sin(a0);
      const c1 = Math.cos(a1), s1 = Math.sin(a1);
      this.addQuad(
        trP(c0 * rBot, 0, s0 * rBot),
        trP(c1 * rBot, 0, s1 * rBot),
        trP(c1 * rTop, height, s1 * rTop),
        trP(c0 * rTop, height, s0 * rTop),
        uv,
        tint,
        0.84,
        0.84,
        1.0,
        1.0,
        flag,
      );
    }
    if (rTop > 0.01) {
      const cap = trP(0, height, 0);
      for (let i = 0; i < segs; i++) {
        const a0 = (i / segs) * Math.PI * 2;
        const a1 = ((i + 1) / segs) * Math.PI * 2;
        this.addQuad(
          cap,
          trP(Math.cos(a1) * rTop, height, Math.sin(a1) * rTop),
          trP(Math.cos(a0) * rTop, height, Math.sin(a0) * rTop),
          cap,
          uv,
          tint,
          1,
          1,
          1,
          1,
          flag,
        );
      }
    }
  }

  addPrismGable(
    cx: number,
    baseY: number,
    cz: number,
    w: number,
    d: number,
    ridgeH: number,
    ridgeAlongX: boolean,
    wallUv: UvRect,
    roofUv: UvRect,
    wallTint: [number, number, number],
    roofTint: [number, number, number],
  ): void {
    const over = 0.28;
    const thick = 0.14;
    if (ridgeAlongX) {
      const hw = w * 0.5, hd = d * 0.5;
      this.addQuad([cx + hw, baseY, cz + hd], [cx + hw, baseY, cz - hd], [cx + hw, baseY + ridgeH, cz], [cx + hw, baseY + ridgeH, cz], wallUv, wallTint, 0.9, 0.9, 1, 1);
      this.addQuad([cx - hw, baseY, cz - hd], [cx - hw, baseY, cz + hd], [cx - hw, baseY + ridgeH, cz], [cx - hw, baseY + ridgeH, cz], wallUv, wallTint, 0.9, 0.9, 1, 1);
      const slopeLen = Math.hypot(hd + over, ridgeH + over * 0.5);
      const tilt = Math.atan2(ridgeH, hd);
      const offZ = (hd + over) * 0.5;
      this.addBox(cx, baseY + ridgeH * 0.5 - 0.04, cz + offZ, w + over * 2, thick, slopeLen, roofUv, roofTint, { rotX: tilt, aoBottom: 0.72 });
      this.addBox(cx, baseY + ridgeH * 0.5 - 0.04, cz - offZ, w + over * 2, thick, slopeLen, roofUv, roofTint, { rotX: -tilt, aoBottom: 0.72 });
      this.addBox(cx, baseY + ridgeH + 0.06, cz, w + over * 2.1, 0.18, 0.24, roofUv, [roofTint[0] * 0.85, roofTint[1] * 0.85, roofTint[2] * 0.85]);
    } else {
      const hw = w * 0.5, hd = d * 0.5;
      this.addQuad([cx - hw, baseY, cz + hd], [cx + hw, baseY, cz + hd], [cx, baseY + ridgeH, cz + hd], [cx, baseY + ridgeH, cz + hd], wallUv, wallTint, 0.9, 0.9, 1, 1);
      this.addQuad([cx + hw, baseY, cz - hd], [cx - hw, baseY, cz - hd], [cx, baseY + ridgeH, cz - hd], [cx, baseY + ridgeH, cz - hd], wallUv, wallTint, 0.9, 0.9, 1, 1);
      const slopeLen = Math.hypot(hw + over, ridgeH + over * 0.5);
      const tilt = Math.atan2(ridgeH, hw);
      const offX = (hw + over) * 0.5;
      this.addBox(cx + offX, baseY + ridgeH * 0.5 - 0.04, cz, slopeLen, thick, d + over * 2, roofUv, roofTint, { rotZ: -tilt, aoBottom: 0.72 });
      this.addBox(cx - offX, baseY + ridgeH * 0.5 - 0.04, cz, slopeLen, thick, d + over * 2, roofUv, roofTint, { rotZ: tilt, aoBottom: 0.72 });
      this.addBox(cx, baseY + ridgeH + 0.06, cz, 0.24, 0.18, d + over * 2.1, roofUv, [roofTint[0] * 0.85, roofTint[1] * 0.85, roofTint[2] * 0.85]);
    }
  }

  build(): BuiltMesh {
    return {
      vertices: this.verts.subarray(0, this.vCount * VERT_STRIDE),
      indices: this.inds.subarray(0, this.iCount),
      vertexCount: this.vCount,
      indexCount: this.iCount,
    };
  }
}

export function addWallLantern(
  mb: MeshBuilder,
  lights: PointLightDef[],
  wx: number,
  wy: number,
  wz: number,
  nx: number,
  nz: number,
  radius = 5.4,
  intensity = 1.9,
): void {
  const bx = wx + nx * 0.24;
  const bz = wz + nz * 0.24;
  mb.addBox(wx + nx * 0.12, wy + 0.14, wz + nz * 0.12, Math.abs(nx) * 0.24 + 0.05, 0.05, Math.abs(nz) * 0.24 + 0.05, UV_IRON_RIVET, [0.24, 0.25, 0.28], { flag: FLAG_SNOW_EXEMPT });
  mb.addCylinder(bx, wy + 0.04, bz, 0.12, 0.02, 0.12, 6, UV_IRON_RIVET, [0.24, 0.25, 0.28]);
  mb.addBox(bx, wy - 0.05, bz, 0.14, 0.18, 0.14, UV_INTERIOR, [1.0, 0.88, 0.54], { flag: FLAG_LANTERN });
  mb.addBox(bx, wy - 0.16, bz, 0.08, 0.04, 0.08, UV_IRON_RIVET, [0.24, 0.25, 0.28], { flag: FLAG_SNOW_EXEMPT });
  lights.push({ x: wx + nx * 0.58, y: wy - 0.08, z: wz + nz * 0.58, r: 1.0, g: 0.72, b: 0.30, radius, intensity, kind: 'lantern' });
}

export function addRecessedWindow(
  mb: MeshBuilder,
  lights: PointLightDef[],
  wallX: number,
  centerY: number,
  wallZ: number,
  facing: 'S' | 'E' | 'W' | 'N',
  opts: {
    width?: number;
    height?: number;
    shutters?: boolean;
    flowerBox?: boolean;
    hasCat?: boolean;
    emitBounce?: boolean;
  } = {},
): void {
  const w = opts.width ?? 0.92;
  const h = opts.height ?? 1.15;
  const [nx, nz, tx, tz] =
    facing === 'S' ? [0, 1, 1, 0] : facing === 'N' ? [0, -1, -1, 0] : facing === 'E' ? [1, 0, 0, -1] : [-1, 0, 0, 1];
  const rotY = facing === 'S' ? 0 : facing === 'E' ? Math.PI * 0.5 : facing === 'N' ? Math.PI : -Math.PI * 0.5;

  mb.addBox(wallX + nx * 0.05, centerY + h * 0.5 + 0.06, wallZ + nz * 0.05, Math.abs(tx) * (w + 0.18) + Math.abs(nx) * 0.12, 0.10, Math.abs(tz) * (w + 0.18) + Math.abs(nz) * 0.12, UV_LIMESTONE, [0.92, 0.90, 0.86]);
  mb.addBox(wallX + nx * 0.08, centerY - h * 0.5 - 0.05, wallZ + nz * 0.08, Math.abs(tx) * (w + 0.24) + Math.abs(nx) * 0.18, 0.10, Math.abs(tz) * (w + 0.24) + Math.abs(nz) * 0.18, UV_LIMESTONE, [0.88, 0.86, 0.82]);
  for (const sSide of [-1, 1]) {
    mb.addBox(wallX + nx * 0.04 + tx * sSide * (w * 0.5 + 0.05), centerY, wallZ + nz * 0.04 + tz * sSide * (w * 0.5 + 0.05), Math.abs(tx) * 0.09 + Math.abs(nx) * 0.10, h, Math.abs(tz) * 0.09 + Math.abs(nz) * 0.10, UV_LIMESTONE, [0.90, 0.88, 0.84], { flag: FLAG_SNOW_EXEMPT });
  }

  const hw = w * 0.46, hh = h * 0.46;
  const inX = wallX + nx * 0.006, inZ = wallZ + nz * 0.006;
  mb.addQuad(
    [inX - tx * hw, centerY - hh, inZ - tz * hw],
    [inX + tx * hw, centerY - hh, inZ + tz * hw],
    [inX + tx * hw, centerY + hh, inZ + tz * hw],
    [inX - tx * hw, centerY + hh, inZ - tz * hw],
    UV_INTERIOR,
    [1, 1, 1],
    1,
    1,
    1,
    1,
    FLAG_INTERIOR,
    [nx, 0, nz],
  );

  mb.addBox(wallX + nx * 0.03, centerY, wallZ + nz * 0.03, Math.abs(tx) * 0.04 + Math.abs(nx) * 0.05, h * 0.94, Math.abs(tz) * 0.04 + Math.abs(nz) * 0.05, UV_TIMBER, [0.88, 0.84, 0.78], { flag: FLAG_SNOW_EXEMPT });
  mb.addBox(wallX + nx * 0.03, centerY + 0.06, wallZ + nz * 0.03, Math.abs(tx) * w * 0.94 + Math.abs(nx) * 0.05, 0.04, Math.abs(tz) * w * 0.94 + Math.abs(nz) * 0.05, UV_TIMBER, [0.88, 0.84, 0.78], { flag: FLAG_SNOW_EXEMPT });

  if (opts.shutters !== false) {
    const shCol: [number, number, number] = [0.58, 0.86, 0.65];
    const shW = w * 0.44;
    for (const side of [-1, 1]) {
      const shX = wallX + nx * 0.06 + tx * side * (w * 0.5 + 0.11 + shW * 0.5);
      const shZ = wallZ + nz * 0.06 + tz * side * (w * 0.5 + 0.11 + shW * 0.5);
      mb.addBox(shX, centerY, shZ, shW, h * 0.96, 0.05, UV_SHUTTER, shCol, { rotY, aoBottom: 0.72, flag: FLAG_SNOW_EXEMPT });
      for (let s = -4; s <= 4; s++) {
        mb.addBox(shX + nx * 0.028, centerY + s * (h * 0.095), shZ + nz * 0.028, shW * 0.82, 0.038, 0.04, UV_SHUTTER, shCol, { rotY, aoBottom: 0.78, flag: FLAG_SNOW_EXEMPT });
      }
    }
  }

  if (opts.flowerBox) {
    const fx = wallX + nx * 0.19, fy = centerY - h * 0.5 + 0.02, fz = wallZ + nz * 0.19;
    mb.addBox(fx, fy, fz, w * 0.96, 0.18, 0.22, UV_CLAY, [0.95, 0.65, 0.52], { rotY, aoBottom: 0.65, flag: FLAG_SNOW_EXEMPT });
    for (let k = -3; k <= 3; k++) {
      const px = fx + tx * (k * w * 0.12), pz = fz + tz * (k * w * 0.12);
      mb.addBox(px, fy + 0.13, pz, 0.12, 0.11, 0.12, UV_GRASS, [0.54, 0.86, 0.45], { rotY: k * 0.6 });
      if (k % 2 === 0) mb.addBox(px + nx * 0.04, fy + 0.19, pz + nz * 0.04, 0.07, 0.07, 0.07, UV_AWNING_RED, [1.0, 0.42, 0.42]);
    }
  }

  if (opts.hasCat) {
    const cx = wallX + nx * 0.14 + tx * 0.22, cy = centerY - h * 0.5 + 0.05, cz = wallZ + nz * 0.14 + tz * 0.22;
    mb.addBox(cx, cy, cz, 0.24, 0.12, 0.16, UV_PLASTER, [0.98, 0.58, 0.24], { rotY, flag: FLAG_SNOW_EXEMPT });
    mb.addBox(cx - tx * 0.11, cy + 0.04, cz - tz * 0.11, 0.11, 0.11, 0.11, UV_PLASTER, [0.99, 0.64, 0.28], { rotY, flag: FLAG_SNOW_EXEMPT });
  }

  if (opts.emitBounce) {
    lights.push({ x: wallX + nx * 0.52, y: centerY, z: wallZ + nz * 0.52, r: 1.0, g: 0.72, b: 0.34, radius: 4.0, intensity: 1.05, kind: 'window' });
  }
}

export function addPaneledDoor(mb: MeshBuilder, wallX: number, groundY: number, wallZ: number, facing: 'S' | 'E' | 'W' | 'N', hasLintel = true): void {
  const [nx, nz] = facing === 'S' ? [0, 1] : facing === 'N' ? [0, -1] : facing === 'E' ? [1, 0] : [-1, 0];
  const rotY = facing === 'S' ? 0 : facing === 'E' ? Math.PI * 0.5 : facing === 'N' ? Math.PI : -Math.PI * 0.5;
  mb.addBox(wallX + nx * 0.22, groundY + 0.09, wallZ + nz * 0.22, 1.32, 0.18, 0.44, UV_LIMESTONE, [0.90, 0.88, 0.84], { rotY, aoBottom: 0.75 });
  mb.addBox(wallX + nx * 0.04, groundY + 1.08, wallZ + nz * 0.04, 1.18, 2.02, 0.14, UV_LIMESTONE, [0.85, 0.82, 0.76], { rotY, flag: FLAG_SNOW_EXEMPT });
  mb.addBox(wallX + nx * 0.115, groundY + 1.02, wallZ + nz * 0.115, 0.96, 1.88, 0.06, UV_DOOR, [1, 1, 1], { rotY, flag: FLAG_SNOW_EXEMPT });
  if (hasLintel) {
    mb.addBox(wallX + nx * 0.12, groundY + 2.18, wallZ + nz * 0.12, 1.24, 0.28, 0.18, UV_LINTEL_1784, [0.95, 0.92, 0.86], { rotY });
  }
}

export function addTerracottaPot(mb: MeshBuilder, x: number, y: number, z: number, scale = 1): void {
  mb.addCylinder(x, y, z, 0.14 * scale, 0.21 * scale, 0.34 * scale, 8, UV_CLAY, [1.0, 0.72, 0.55]);
  mb.addCylinder(x, y + 0.34 * scale, z, 0.04 * scale, 0.03 * scale, 0.26 * scale, 6, UV_TIMBER, [0.85, 0.72, 0.56]);
  mb.addBox(x, y + 0.68 * scale, z, 0.38 * scale, 0.34 * scale, 0.38 * scale, UV_GRASS, [0.58, 0.85, 0.48], { rotY: 0.4, aoBottom: 0.68 });
}

export function addSculptedTree(
  mb: MeshBuilder,
  x: number,
  y: number,
  z: number,
  kind: 'pine' | 'oak' | 'cherry' | 'willow',
  scale = 1,
): void {
  if (kind === 'pine') {
    mb.addCylinder(x, y, z, 0.18 * scale, 0.10 * scale, 1.1 * scale, 6, UV_TIMBER, [0.76, 0.64, 0.52]);
    for (let k = 0; k < 5; k++) {
      const cy = y + (0.95 + k * 0.62) * scale;
      const w = (1.55 - k * 0.26) * scale;
      mb.addBox(x, cy, z, w, 0.68 * scale, w, UV_GRASS, [0.36, 0.52, 0.38], { rotY: k * 0.55, aoBottom: 0.62 });
    }
    return;
  }

  const trunkH = 1.45 * scale;
  mb.addCylinder(x, y, z, 0.22 * scale, 0.13 * scale, trunkH, 7, UV_TIMBER, [0.76, 0.62, 0.50]);
  mb.addCylinder(x, y + trunkH * 0.72, z, 0.10 * scale, 0.06 * scale, 0.9 * scale, 5, UV_TIMBER, [0.76, 0.62, 0.50], 0.35, 0.55);
  mb.addCylinder(x, y + trunkH * 0.78, z, 0.10 * scale, 0.06 * scale, 0.85 * scale, 5, UV_TIMBER, [0.76, 0.62, 0.50], -0.4, -0.45);

  const leafUv = kind === 'cherry' ? UV_CREAM : UV_GRASS;
  const topTint: [number, number, number] = kind === 'cherry' ? [1.0, 0.76, 0.84] : [0.64, 0.86, 0.48];
  const subTint: [number, number, number] = kind === 'cherry' ? [0.85, 0.58, 0.68] : [0.46, 0.66, 0.36];

  const lobes = [
    [0, trunkH + 0.72 * scale, 0, 1.32 * scale, 0.94 * scale],
    [0.64 * scale, trunkH + 0.48 * scale, 0.38 * scale, 0.96 * scale, 0.74 * scale],
    [-0.60 * scale, trunkH + 0.52 * scale, -0.34 * scale, 0.92 * scale, 0.72 * scale],
  ];
  for (let i = 0; i < lobes.length; i++) {
    const [ox, oy, oz, rw, rh] = lobes[i];
    mb.addBox(x + ox, y + oy, z + oz, rw, rh, rw, leafUv, i === 0 ? topTint : subTint, { rotY: i * 0.65, aoBottom: 0.62 });
  }
}
