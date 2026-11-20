import {
  BuiltMesh,
  FLAG_FIRE,
  FLAG_GLASS,
  FLAG_LANTERN,
  FLAG_SNOW_EXEMPT,
  FLAG_WATER,
  MeshBuilder,
  PointLightDef,
  UV_AWNING_GREEN,
  UV_AWNING_RED,
  UV_CLAY,
  UV_CLOCK,
  UV_COBBLE,
  UV_DRY_STONE,
  UV_GRASS,
  UV_INTERIOR,
  UV_IRON_RIVET,
  UV_KILN_COAL,
  UV_LIMESTONE,
  UV_PLASTER,
  UV_PLAQUE_VIA,
  UV_SIGN_GROCER,
  UV_SLATE,
  UV_TIMBER,
  addPaneledDoor,
  addRecessedWindow,
  addSculptedTree,
  addTerracottaPot,
  addWallLantern,
} from './meshBuilder';

export interface LandmarkInfo {
  id: 'watermill' | 'kiln' | 'bakery' | 'tower';
  name: string;
  zMin: number;
  zMax: number;
  playerZ: number;
  promptText: string;
  canInteract: boolean;
}

export const LANDMARKS: LandmarkInfo[] = [
  {
    id: 'watermill',
    name: '🎡 水车石桥',
    zMin: 7.5,
    zMax: 24.0,
    playerZ: 16.5,
    promptText: '老石水车在左侧溪流旁转动，踏上弯拱石桥就能望见整条纵深雪村',
    canInteract: false,
  },
  {
    id: 'kiln',
    name: '🔥 暖光砖窑',
    zMin: -2.8,
    zMax: 7.5,
    playerZ: 2.8,
    promptText: '路西侧红砖窑炉火正旺，融化了潮湿石板路的雪霜，右前方木顶钟亭轻鸣',
    canInteract: true,
  },
  {
    id: 'bakery',
    name: '🥐 杂货街角',
    zMin: -13.5,
    zMax: -2.8,
    playerZ: -5.2,
    promptText: '右侧 ALIMENTARI 老字号红白雨棚下暖灯闪烁，左侧 Skeldale 玻璃温室透出绿意',
    canInteract: false,
  },
  {
    id: 'tower',
    name: '⛪ 钟楼牧场',
    zMin: -25.0,
    zMax: -13.5,
    playerZ: -15.6,
    promptText: '穿过钟楼罗马钟盘下的广场，路尽头就是一览无余的 Pennine 雪峰与古修道院',
    canInteract: false,
  },
];

export interface PromenadeScene {
  opaque: BuiltMesh;
  trans: BuiltMesh;
  waterwheel: BuiltMesh;
  wheelPivot: [number, number, number];
  sheepMesh: BuiltMesh;
  sheepSpots: Array<{ x: number; z: number; yaw: number; phase: number }>;
  heroTorso: BuiltMesh;
  heroLeg: BuiltMesh;
  heroArmLantern: BuiltMesh;
  lights: PointLightDef[];
  kilnPos: [number, number, number];
}

// Gentle S-curve cobblestone lane wandering forward into -Z toward the distant mountains
export function laneCenterX(z: number): number {
  return Math.sin((z - 2.0) * 0.115) * 2.15;
}

export function laneSlopeDxDz(z: number): number {
  return Math.cos((z - 2.0) * 0.115) * 2.15 * 0.115;
}

// Smooth height of walkable road along Z (flat Y=0 except rising smoothly over stone arch bridge at Z in [8.5..14.5])
export function walkGroundHeightAt(z: number): number {
  const dz = z - 11.5;
  if (Math.abs(dz) < 3.0) {
    return Math.cos((dz / 3.0) * Math.PI * 0.5) * 0.85;
  }
  return 0.0;
}

export function buildPromenadeScene(): PromenadeScene {
  const opq = new MeshBuilder(48000, 72000);
  const tr = new MeshBuilder(4096, 6144);
  const lights: PointLightDef[] = [];

  // =========================================================================
  // PLANE 2 BASE: Deep Winding Cobblestone Lane (-Z corridor), Cross Stream & Snowy Banks
  // =========================================================================
  // Broad snowy village floor split cleanly around transverse icy stream channel (Z = 9.0 .. 14.0)
  opq.addTiledFloor(-38, 14.0, 38, 30.0, -0.05, 16, 4, UV_GRASS, [0.80, 0.87, 0.94], 0.92);
  opq.addTiledFloor(-38, -32.0, 38, 9.0, -0.05, 16, 10, UV_GRASS, [0.80, 0.87, 0.94], 0.92);

  // Sculpted low heather & snowdrift mounds flanking both sides of the winding lane
  for (let z = -24; z <= 22; z += 4.5) {
    if (z > 6.5 && z < 16.5) continue;
    const cx = laneCenterX(z);
    opq.addBox(cx - 5.2, 0.04, z, 3.6, 0.24, 3.8, UV_GRASS, [0.78, 0.85, 0.92], { rotZ: 0.06, aoBottom: 0.82 });
    opq.addBox(cx + 5.2, 0.04, z, 3.6, 0.24, 3.8, UV_GRASS, [0.78, 0.85, 0.92], { rotZ: -0.06, aoBottom: 0.82 });
  }

  // Segmented Winding Cobblestone Promenade Road + Smooth Tangent-Aligned Limestone Curbs (Z = +25 -> -25.5)
  for (let z = 25.0; z >= -25.5; z -= 1.0) {
    if (z > 8.6 && z < 14.4) continue; // Arch bridge spans Z = 8.5 .. 14.5
    const cx = laneCenterX(z);
    const yaw = -Math.atan(laneSlopeDxDz(z));
    const nX = Math.cos(yaw);
    const nZ = -Math.sin(yaw);
    opq.addBox(cx, -0.02, z, 5.2, 0.08, 1.32, UV_COBBLE, [1.0, 0.98, 0.95], { rotY: yaw, aoBottom: 0.94 });
    // Continuous tangent-aligned limestone curbs along left & right edges (no sawtooth stepping!)
    opq.addBox(cx - 2.76 * nX, 0.08, z - 2.76 * nZ, 0.42, 0.20, 1.38, UV_LIMESTONE, [0.84, 0.82, 0.78], { rotY: yaw, aoBottom: 0.72 });
    opq.addBox(cx + 2.76 * nX, 0.08, z + 2.76 * nZ, 0.42, 0.20, 1.38, UV_LIMESTONE, [0.84, 0.82, 0.78], { rotY: yaw, aoBottom: 0.72 });
  }

  // Transverse Icy Mill Stream Channel (Z = 9.0 .. 14.0, crossing X = -28 .. +28)
  opq.addTiledFloor(-28, 9.0, 28, 14.0, -0.98, 10, 2, UV_DRY_STONE, [0.64, 0.72, 0.78], 0.84);
  opq.addBox(0, -0.45, 9.0, 56.0, 0.98, 0.28, UV_DRY_STONE, [0.84, 0.86, 0.88]);
  opq.addBox(0, -0.45, 14.0, 56.0, 0.98, 0.28, UV_DRY_STONE, [0.84, 0.86, 0.88]);
  tr.addTiledFloor(-28, 9.0, 28, 14.0, -0.24, 12, 2, UV_COBBLE, [0.22, 0.56, 0.68], 1, FLAG_WATER);

  // 18-Segment Curved Stone Arch Bridge carrying the winding lane across the stream (Z = 8.5 .. 14.5)
  const bridgeSegs = 18;
  for (let i = 0; i < bridgeSegs; i++) {
    const z0 = 8.5 + (i / bridgeSegs) * 6.0;
    const z1 = 8.5 + ((i + 1) / bridgeSegs) * 6.0;
    const zm = (z0 + z1) * 0.5;
    const cx = laneCenterX(zm);
    const yaw = -Math.atan(laneSlopeDxDz(zm));
    const h = walkGroundHeightAt(zm);
    const pitch = Math.sin(((zm - 11.5) / 3.0) * Math.PI * 0.5) * 0.44;
    opq.addBox(cx, h - 0.14, zm, 5.2, 0.30, (6.0 / bridgeSegs) * 1.24, UV_COBBLE, [1, 0.98, 0.95], {
      rotX: pitch,
      rotY: yaw,
      aoBottom: 0.70,
    });
    for (const side of [-2.62, 2.62]) {
      opq.addBox(cx + side, h + 0.36, zm, 0.34, 0.78, (6.0 / bridgeSegs) * 1.22, UV_LIMESTONE, [0.92, 0.90, 0.86], {
        rotX: pitch,
        rotY: yaw,
        aoBottom: 0.78,
      });
    }
  }
  // 4 Stone Bridge Corner Piers + Glowing Bridge Lanterns
  for (const bz of [8.7, 14.3]) {
    const cx = laneCenterX(bz);
    for (const bxOff of [-2.65, 2.65]) {
      const bx = cx + bxOff;
      opq.addBox(bx, 0.42, bz, 0.50, 0.92, 0.50, UV_LIMESTONE, [0.90, 0.88, 0.84]);
      opq.addBox(bx, 1.12, bz, 0.11, 0.55, 0.11, UV_IRON_RIVET, [0.22, 0.24, 0.28], { flag: FLAG_SNOW_EXEMPT });
      opq.addBox(bx, 1.46, bz, 0.24, 0.26, 0.24, UV_INTERIOR, [1.0, 0.88, 0.56], { flag: FLAG_LANTERN });
      lights.push({ x: bx, y: 1.50, z: bz, r: 1.0, g: 0.74, b: 0.34, radius: 5.8, intensity: 1.75, kind: 'bridge' });
    }
  }

  // =========================================================================
  // ZONE 1: VILLAGE ENTRY GATE, SPINNING WATERMILL (LEFT) & MILLKEEPER COTTAGE (RIGHT)
  // =========================================================================
  // South Village Entry Stone Gate Pillars framing first impression (Z = 22.0)
  const gateCx = laneCenterX(22.0);
  for (const side of [-1, 1]) {
    opq.addBox(gateCx + side * 3.8, 1.35, 22.0, 0.78, 2.7, 0.78, UV_DRY_STONE, [0.88, 0.86, 0.82], { aoBottom: 0.68 });
    opq.addBox(gateCx + side * 3.8, 2.78, 22.0, 0.96, 0.26, 0.96, UV_LIMESTONE, [0.92, 0.90, 0.88]);
    opq.addBox(gateCx + side * 3.8, 3.12, 22.0, 0.22, 0.28, 0.22, UV_INTERIOR, [1.0, 0.88, 0.56], { flag: FLAG_LANTERN });
    lights.push({ x: gateCx + side * 3.8, y: 3.12, z: 22.0, r: 1.0, g: 0.74, b: 0.34, radius: 5.5, intensity: 1.45, kind: 'lantern' });
  }

  // Left Side: Two-Story Yorkshire Stone Watermill on North Bank of Stream (Z = 6.4, facing East + South)
  const millCx = laneCenterX(11.5) - 6.7;
  const millZ = 6.6;
  opq.addBox(millCx, 2.25, millZ, 5.2, 4.5, 4.6, UV_DRY_STONE, [0.94, 0.92, 0.90], { aoBottom: 0.72 });
  opq.addPrismGable(millCx, 4.5, millZ, 5.2, 4.6, 1.65, true, UV_DRY_STONE, UV_SLATE, [0.92, 0.90, 0.88], [0.92, 0.96, 1.04]);
  opq.addBox(millCx - 1.3, 5.9, millZ - 0.6, 0.62, 1.5, 0.62, UV_DRY_STONE, [0.86, 0.84, 0.82]);
  // East facing wall (toward road) & South facing wall (over stream & camera)
  addPaneledDoor(opq, millCx + 2.6, 0.0, millZ - 0.6, 'E', false);
  addRecessedWindow(opq, lights, millCx + 2.6, 1.45, millZ + 1.1, 'E', { width: 0.95, height: 1.12, shutters: true, emitBounce: true });
  addRecessedWindow(opq, lights, millCx + 2.6, 3.25, millZ - 0.8, 'E', { width: 0.88, height: 1.05, shutters: true });
  addRecessedWindow(opq, lights, millCx + 2.6, 3.25, millZ + 1.1, 'E', { width: 0.88, height: 1.05, shutters: true, emitBounce: true });
  addRecessedWindow(opq, lights, millCx - 0.8, 1.55, millZ + 2.3, 'S', { width: 0.92, height: 1.1, shutters: true, emitBounce: true });
  addRecessedWindow(opq, lights, millCx + 1.2, 3.25, millZ + 2.3, 'S', { width: 0.92, height: 1.1, shutters: true, emitBounce: true });
  addWallLantern(opq, lights, millCx + 2.62, 2.38, millZ + 0.15, 1, 0, 5.8, 1.9);
  addWallLantern(opq, lights, millCx + 1.75, 2.38, millZ + 2.32, 0, 1, 5.5, 1.65);

  // Elevated Wooden Millrace Flume feeding top of Waterwheel over the icy stream (Z = 10.6)
  opq.addBox(millCx - 0.4, 3.85, 10.4, 4.6, 0.26, 0.68, UV_TIMBER, [0.85, 0.76, 0.66], { aoBottom: 0.7 });
  for (const fx of [millCx - 2.1, millCx + 1.4]) {
    opq.addBox(fx, 1.90, 10.4, 0.20, 3.8, 0.20, UV_TIMBER, [0.76, 0.68, 0.58]);
  }
  const wheelPivot: [number, number, number] = [millCx + 0.85, 2.02, 10.75];
  opq.addBox(wheelPivot[0], wheelPivot[1], wheelPivot[2] - 0.8, 0.28, 0.28, 1.8, UV_IRON_RIVET, [0.28, 0.28, 0.32], {
    flag: FLAG_SNOW_EXEMPT,
  });

  // Right Side: Warm Stone Millkeeper's Cottage (Z = 16.4, facing West toward lane)
  const cotCx = laneCenterX(16.4) + 5.65;
  const cotZ = 16.4;
  opq.addBox(cotCx, 2.15, cotZ, 4.4, 4.3, 5.4, UV_DRY_STONE, [0.94, 0.91, 0.86], { aoBottom: 0.72 });
  opq.addPrismGable(cotCx, 4.3, cotZ, 4.4, 5.4, 1.55, false, UV_DRY_STONE, UV_SLATE, [0.92, 0.89, 0.84], [0.92, 0.96, 1.04]);
  opq.addBox(cotCx + 0.9, 5.6, cotZ - 1.2, 0.58, 1.45, 0.58, UV_DRY_STONE, [0.85, 0.82, 0.78]);
  addPaneledDoor(opq, cotCx - 2.2, 0.0, cotZ - 0.8, 'W', true);
  addRecessedWindow(opq, lights, cotCx - 2.2, 1.42, cotZ + 1.1, 'W', { width: 1.02, height: 1.15, shutters: true, emitBounce: true });
  addRecessedWindow(opq, lights, cotCx - 2.2, 3.18, cotZ - 1.0, 'W', { width: 0.92, height: 1.06, shutters: true, flowerBox: true });
  addRecessedWindow(opq, lights, cotCx - 2.2, 3.18, cotZ + 1.1, 'W', { width: 0.92, height: 1.06, shutters: true, emitBounce: true });
  addWallLantern(opq, lights, cotCx - 2.22, 2.32, cotZ + 0.05, -1, 0, 5.8, 1.9);
  // Stacked Firewood under Eaves + Warm Lantern Bench
  for (let r = 0; r < 3; r++) {
    opq.addBox(cotCx - 2.48, 0.14 + r * 0.22, cotZ + 2.25, 0.45, 0.20, 0.85 - r * 0.14, UV_TIMBER, [0.76, 0.62, 0.48], { flag: FLAG_SNOW_EXEMPT });
  }

  // =========================================================================
  // ZONE 2: GLOWING BRICK KILN & CLAY STACK (LEFT) + LYCHGATE BELFRY (RIGHT)
  // =========================================================================
  const kilnZ = 0.6;
  const kilnBaseX = laneCenterX(kilnZ) - 4.7;
  const kilnPos: [number, number, number] = [kilnBaseX + 1.55, 0.68, kilnZ];

  // Domed Masonry Oven Shell + Chimney + Thermal Snow-Melt Hearth Facing East (+X into lane!)
  opq.addCylinder(kilnBaseX, 0.0, kilnZ, 2.05, 1.72, 1.50, 12, UV_DRY_STONE, [0.90, 0.86, 0.82]);
  opq.addCylinder(kilnBaseX, 1.50, kilnZ, 1.72, 1.02, 1.08, 12, UV_PLASTER, [0.88, 0.68, 0.54]);
  opq.addCylinder(kilnBaseX, 2.58, kilnZ, 0.44, 0.36, 1.25, 8, UV_DRY_STONE, [0.74, 0.70, 0.68]);

  // Sculpted Brick Arch Voussoirs oriented in YZ plane facing East (+X toward cobble lane!)
  for (let a = 0; a < 9; a++) {
    const theta = (a / 8) * Math.PI;
    const az = kilnZ + Math.cos(theta) * 0.76;
    const ay = 0.72 + Math.sin(theta) * 0.74;
    opq.addBox(kilnBaseX + 1.82, ay, az, 0.68, 0.30, 0.24, UV_PLASTER, [0.92, 0.45, 0.30], {
      rotX: -(theta - Math.PI * 0.5),
      flag: FLAG_SNOW_EXEMPT,
    });
  }
  // Hearth Slab + Blazing Glowing Coals & Charcoal Logs (FLAG_FIRE) facing +X & visible from +Z approach!
  opq.addBox(kilnBaseX + 1.48, 0.22, kilnZ, 1.65, 0.44, 2.15, UV_LIMESTONE, [0.82, 0.78, 0.74]);
  opq.addBox(kilnBaseX + 1.62, 0.70, kilnZ, 0.76, 0.80, 1.18, UV_KILN_COAL, [1.0, 0.88, 0.58], { flag: FLAG_FIRE });
  opq.addCylinder(kilnBaseX + 1.84, 0.55, kilnZ - 0.18, 0.08, 0.07, 0.55, 6, UV_KILN_COAL, [1.0, 0.72, 0.42], 0.4, 0.8, FLAG_FIRE);
  opq.addCylinder(kilnBaseX + 1.86, 0.52, kilnZ + 0.16, 0.08, 0.07, 0.52, 6, UV_KILN_COAL, [1.0, 0.72, 0.42], -0.35, -0.7, FLAG_FIRE);

  // Fierce Real-Time Flickering Kiln Furnace Point Light lighting cobbles, bricks, belfry & stroller!
  lights.push({ x: kilnBaseX + 2.55, y: 0.92, z: kilnZ, r: 1.0, g: 0.46, b: 0.12, radius: 10.8, intensity: 4.3, kind: 'kiln' });

  // Baker's Peel Shovel, Water Bucket & Staggered Stack of Fresh Clay Bricks beside Kiln (Z = -1.6)
  opq.addBox(kilnBaseX + 1.45, 1.05, kilnZ + 1.55, 0.07, 2.15, 0.07, UV_TIMBER, [0.85, 0.72, 0.56], { rotX: -0.22, flag: FLAG_SNOW_EXEMPT });
  opq.addBox(kilnBaseX + 1.45, 0.36, kilnZ + 1.78, 0.04, 0.52, 0.38, UV_TIMBER, [0.85, 0.72, 0.56], { rotX: -0.22, flag: FLAG_SNOW_EXEMPT });
  opq.addCylinder(kilnBaseX + 1.85, 0.0, kilnZ + 1.35, 0.22, 0.26, 0.46, 8, UV_TIMBER, [0.82, 0.70, 0.56], 0, 0, FLAG_SNOW_EXEMPT);

  const brickStackX = laneCenterX(-1.6) - 3.65;
  for (let row = 0; row < 4; row++) {
    const count = row === 3 ? 2 : 3;
    for (let b = 0; b < count; b++) {
      const bz = -1.95 + b * 0.46 + (row % 2) * 0.16;
      const by = 0.11 + row * 0.20;
      const bx = brickStackX + ((row + b) % 2) * 0.06;
      opq.addBox(bx, by, bz, 0.26, 0.18, 0.40, UV_PLASTER, [0.95 - row * 0.05, 0.48 + (b % 2) * 0.08, 0.30], {
        rotY: (b - 1) * 0.05,
        aoBottom: 0.65,
        flag: FLAG_SNOW_EXEMPT,
      });
    }
  }

  // Right Side: Yorkshire Timber & Slate Lychgate Belfry with Aged-Bronze Bell (Z = +2.2)
  const belfX = laneCenterX(2.2) + 4.3;
  const belfZ = 2.2;
  opq.addBox(belfX, 1.55, belfZ - 0.75, 0.22, 3.1, 0.22, UV_TIMBER, [0.76, 0.66, 0.56]);
  opq.addBox(belfX, 1.55, belfZ + 0.75, 0.22, 3.1, 0.22, UV_TIMBER, [0.76, 0.66, 0.56]);
  opq.addBox(belfX, 2.95, belfZ, 0.30, 0.20, 1.75, UV_TIMBER, [0.74, 0.64, 0.54]);
  opq.addPrismGable(belfX, 3.05, belfZ, 1.35, 2.05, 0.78, false, UV_TIMBER, UV_SLATE, [0.74, 0.64, 0.54], [0.90, 0.94, 1.02]);
  for (let l = 0; l < 3; l++) {
    opq.addBox(belfX, 2.74 - l * 0.22, belfZ, l % 2 === 0 ? 0.04 : 0.10, 0.18, l % 2 === 0 ? 0.10 : 0.04, UV_IRON_RIVET, [0.72, 0.72, 0.76], {
      flag: FLAG_SNOW_EXEMPT,
    });
  }
  opq.addCylinder(belfX, 1.95, belfZ, 0.24, 0.16, 0.28, 12, UV_IRON_RIVET, [0.86, 0.68, 0.40], 0, 0, FLAG_SNOW_EXEMPT);
  opq.addCylinder(belfX, 1.65, belfZ, 0.42, 0.24, 0.32, 12, UV_IRON_RIVET, [0.88, 0.70, 0.42], 0, 0, FLAG_SNOW_EXEMPT);
  lights.push({ x: belfX - 0.55, y: 2.15, z: belfZ, r: 1.0, g: 0.70, b: 0.34, radius: 4.8, intensity: 1.2, kind: 'lantern' });

  // =========================================================================
  // ZONE 3: ALIMENTARI BAKERY (RIGHT) & SKELDALE CONSERVATORY + APOTHECARY (LEFT)
  // =========================================================================
  const bakCx = laneCenterX(-8.5) + 5.25;
  const bakZ = -8.5;
  opq.addBox(bakCx, 2.55, bakZ, 4.5, 5.1, 6.2, UV_PLASTER, [1.02, 0.96, 0.88], { aoBottom: 0.74 });
  opq.addPrismGable(bakCx, 5.1, bakZ, 4.5, 6.2, 1.65, false, UV_PLASTER, UV_CLAY, [1.0, 0.95, 0.88], [1.02, 0.86, 0.78]);
  for (let k = 0; k < 6; k++) {
    opq.addBox(bakCx - 2.26, 0.45 + k * 0.84, bakZ - 3.05, 0.22, 0.42, 0.22, UV_LIMESTONE, [0.88, 0.84, 0.78]);
    opq.addBox(bakCx - 2.26, 0.45 + k * 0.84, bakZ + 3.05, 0.22, 0.42, 0.22, UV_LIMESTONE, [0.88, 0.84, 0.78]);
  }
  opq.addBox(bakCx + 0.8, 6.45, bakZ - 1.4, 0.56, 1.35, 0.56, UV_DRY_STONE, [0.84, 0.79, 0.72]);

  // Storefront Details Facing West (-X into street) + Warm South Gable Windows Facing Approaching Strollers!
  addPaneledDoor(opq, bakCx - 2.25, 0.0, bakZ + 1.45, 'W', true);
  addRecessedWindow(opq, lights, bakCx - 2.25, 1.22, bakZ - 1.15, 'W', { width: 1.85, height: 1.36, shutters: false, emitBounce: true });
  addRecessedWindow(opq, lights, bakCx - 2.25, 3.85, bakZ + 1.45, 'W', { width: 1.08, height: 1.28, shutters: true, flowerBox: true, emitBounce: true });
  addRecessedWindow(opq, lights, bakCx - 2.25, 3.85, bakZ - 1.35, 'W', { width: 1.08, height: 1.28, shutters: true, flowerBox: true, hasCat: true, emitBounce: true });

  // South Gable End Facade facing +Z so approaching strollers see warm bakery windows, timber beam & lantern!
  addRecessedWindow(opq, lights, bakCx - 0.35, 1.38, bakZ + 3.1, 'S', { width: 1.65, height: 1.32, shutters: false, emitBounce: true });
  addRecessedWindow(opq, lights, bakCx + 0.15, 3.68, bakZ + 3.1, 'S', { width: 1.08, height: 1.22, shutters: true, flowerBox: true, emitBounce: true });
  opq.addBox(bakCx, 2.66, bakZ + 3.13, 3.85, 0.18, 0.12, UV_TIMBER, [0.58, 0.44, 0.32], { aoBottom: 0.72 });
  addWallLantern(opq, lights, bakCx - 1.55, 2.38, bakZ + 3.12, 0, 1, 5.6, 1.9);

  // Main ALIMENTARI Signboard along West Facade (axis-aligned -> UV_SIGN_GROCER reads cleanly looking East!)
  opq.addBox(bakCx - 2.31, 2.66, bakZ, 0.14, 0.72, 4.95, UV_SIGN_GROCER, [1, 1, 1], { aoBottom: 0.78, flag: FLAG_SNOW_EXEMPT });
  // Projecting Corner Hanging Bracket Sign Facing South (+Z toward approaching stroller down the lane!)
  opq.addBox(bakCx - 2.75, 3.15, bakZ + 2.85, 1.15, 0.08, 0.08, UV_IRON_RIVET, [0.24, 0.24, 0.28], { flag: FLAG_SNOW_EXEMPT });
  opq.addBox(bakCx - 3.05, 2.75, bakZ + 2.85, 1.15, 0.52, 0.08, UV_SIGN_GROCER, [1, 1, 1], { flag: FLAG_SNOW_EXEMPT });

  // Red-and-White Scalloped Awning Sloping West (-X) over East Footpath
  opq.addBox(bakCx - 3.05, 2.08, bakZ, 1.72, 0.09, 5.2, UV_AWNING_RED, [1, 1, 1], { rotZ: 0.34, aoBottom: 0.68 });
  for (let s = 0; s < 14; s++) {
    opq.addBox(bakCx - 3.85, 1.72, bakZ - 2.35 + s * 0.36, 0.05, 0.18, 0.32, UV_AWNING_RED, s % 2 === 0 ? [1.0, 0.85, 0.82] : [1, 1, 1], { flag: FLAG_SNOW_EXEMPT });
  }
  opq.addBox(bakCx - 2.29, 2.25, bakZ + 2.68, 0.04, 0.28, 0.42, UV_PLAQUE_VIA, [1, 1, 1], { flag: FLAG_SNOW_EXEMPT });
  addWallLantern(opq, lights, bakCx - 2.32, 2.68, bakZ + 2.55, -1, 0, 5.8, 2.1);
  addWallLantern(opq, lights, bakCx - 2.32, 2.68, bakZ - 2.55, -1, 0, 5.8, 2.1);

  // Produce Crates & Potted Evergreen along East Footpath beside Bakery
  const crates: Array<[number, number, number]> = [[1.0, 0.55, 0.12], [0.98, 0.88, 0.20], [0.92, 0.22, 0.18], [0.45, 0.78, 0.30]];
  for (let c = 0; c < 4; c++) {
    const cz = bakZ - 0.55 - (c % 2) * 0.92;
    const cx = bakCx - 2.68 - Math.floor(c / 2) * 0.62;
    const ch = 0.52 - Math.floor(c / 2) * 0.18;
    opq.addBox(cx, ch * 0.5, cz, 0.54, ch, 0.82, UV_TIMBER, [0.85, 0.72, 0.54], { aoBottom: 0.62, flag: FLAG_SNOW_EXEMPT });
    for (let fx = -2; fx <= 2; fx++) {
      opq.addBox(cx, ch + 0.06, cz + fx * 0.14, 0.11, 0.11, 0.11, UV_PLASTER, crates[c], { flag: FLAG_SNOW_EXEMPT });
    }
  }
  addTerracottaPot(opq, bakCx - 2.95, 0.0, bakZ + 2.45, 1.15);

  // Left Side: Skeldale Glass Conservatory (Z = -6.2) & Apothecary Cottage behind it (Z = -11.5)
  const gx = laneCenterX(-6.2) - 4.85;
  const gz = -6.2;
  opq.addBox(gx, 0.28, gz, 3.05, 0.56, 2.85, UV_DRY_STONE, [0.88, 0.85, 0.80]);
  opq.addBox(gx, 0.72, gz, 2.25, 0.25, 2.05, UV_GRASS, [0.58, 0.88, 0.48]);
  opq.addBox(gx, 1.68, gz, 0.20, 0.24, 0.20, UV_INTERIOR, [1.0, 0.88, 0.52], { flag: FLAG_LANTERN });
  lights.push({ x: gx, y: 1.55, z: gz, r: 1.0, g: 0.78, b: 0.42, radius: 6.2, intensity: 2.0, kind: 'lantern' });
  for (const px of [gx - 1.48, gx, gx + 1.48]) {
    for (const pz of [gz - 1.38, gz + 1.38]) {
      opq.addBox(px, 1.24, pz, 0.08, 1.48, 0.08, UV_LIMESTONE, [0.95, 0.95, 0.95]);
    }
  }
  tr.addBox(gx, 1.24, gz, 2.94, 1.40, 2.74, UV_INTERIOR, [0.24, 0.42, 0.44], { flag: FLAG_GLASS });
  tr.addBox(gx, 2.18, gz - 0.65, 2.98, 0.06, 1.44, UV_INTERIOR, [0.28, 0.46, 0.48], { rotX: -0.46, flag: FLAG_GLASS });
  tr.addBox(gx, 2.18, gz + 0.65, 2.98, 0.06, 1.44, UV_INTERIOR, [0.28, 0.46, 0.48], { rotX: 0.46, flag: FLAG_GLASS });

  const apCx = laneCenterX(-11.8) - 5.4;
  const apZ = -11.8;
  opq.addBox(apCx, 2.15, apZ, 4.2, 4.3, 4.8, UV_DRY_STONE, [0.92, 0.90, 0.86], { aoBottom: 0.72 });
  opq.addPrismGable(apCx, 4.3, apZ, 4.2, 4.8, 1.45, false, UV_DRY_STONE, UV_SLATE, [0.90, 0.88, 0.84], [0.92, 0.96, 1.04]);
  addPaneledDoor(opq, apCx + 2.1, 0.0, apZ + 0.9, 'E', true);
  addRecessedWindow(opq, lights, apCx + 2.1, 1.35, apZ - 1.0, 'E', { width: 1.0, height: 1.15, shutters: true, emitBounce: true });
  addRecessedWindow(opq, lights, apCx + 2.1, 3.15, apZ + 0.9, 'E', { width: 0.9, height: 1.05, shutters: true, emitBounce: true });
  addRecessedWindow(opq, lights, apCx + 2.1, 3.15, apZ - 1.0, 'E', { width: 0.9, height: 1.05, shutters: true });
  addWallLantern(opq, lights, apCx + 2.12, 2.28, apZ + 0.0, 1, 0, 5.6, 1.85);

  // =========================================================================
  // ZONE 4: CLOCK TOWER (LEFT), MARKET STALL & SHEEPFOLD (RIGHT), NORTHERN VALLEY OVERLOOK
  // =========================================================================
  const tx = laneCenterX(-19.5) - 5.1;
  const tz = -19.5;
  opq.addBox(tx, 0.45, tz, 3.3, 0.9, 3.3, UV_DRY_STONE, [0.88, 0.85, 0.78]);
  opq.addBox(tx, 4.35, tz, 2.6, 7.0, 2.6, UV_LIMESTONE, [1.0, 0.97, 0.90]);
  for (const bx of [tx - 1.28, tx + 1.28]) {
    for (const bz of [tz - 1.28, tz + 1.28]) {
      opq.addBox(bx, 4.2, bz, 0.30, 7.2, 0.30, UV_DRY_STONE, [0.84, 0.80, 0.72]);
    }
  }
  // Illuminated Roman Clock Faces on BOTH South (+Z, visible down the whole corridor!) and East (+X) faces!
  opq.addBox(tx, 6.55, tz + 1.32, 1.42, 1.42, 0.08, UV_CLOCK, [1, 1, 1], { flag: FLAG_LANTERN });
  opq.addBox(tx + 1.32, 6.55, tz, 0.08, 1.42, 1.42, UV_CLOCK, [1, 1, 1], { flag: FLAG_LANTERN });
  opq.addBox(tx, 7.95, tz, 2.8, 0.24, 2.8, UV_LIMESTONE, [0.92, 0.88, 0.82]);
  for (const px of [tx - 1.05, tx + 1.05]) {
    for (const pz of [tz - 1.05, tz + 1.05]) {
      opq.addBox(px, 8.65, pz, 0.26, 1.25, 0.26, UV_LIMESTONE, [0.90, 0.88, 0.82]);
    }
  }
  opq.addCylinder(tx, 8.35, tz, 0.32, 0.18, 0.45, 8, UV_CLOCK, [0.95, 0.78, 0.40]);
  opq.addCylinder(tx, 9.25, tz, 1.88, 0.06, 2.35, 4, UV_SLATE, [0.92, 0.96, 1.05]);
  addPaneledDoor(opq, tx + 1.32, 0.0, tz, 'E', true);
  addWallLantern(opq, lights, tx + 1.34, 2.45, tz + 0.9, 1, 0, 5.8, 1.9);
  lights.push({ x: tx + 1.5, y: 6.55, z: tz + 1.5, r: 1.0, g: 0.78, b: 0.44, radius: 6.0, intensity: 1.4, kind: 'lantern' });

  // Market Stall + Open Snowy Sheepfold Paddock on East Side (Z = -18.5 .. -24)
  const stX = laneCenterX(-16.2) + 4.4;
  opq.addBox(stX, 0.42, -16.2, 1.15, 0.84, 1.9, UV_TIMBER, [0.85, 0.74, 0.58]);
  opq.addBox(stX - 0.15, 2.02, -16.2, 1.5, 0.08, 2.1, UV_AWNING_GREEN, [1, 1, 1], { rotZ: 0.24 });
  opq.addBox(stX - 0.55, 1.65, -16.2, 0.14, 0.18, 0.14, UV_INTERIOR, [1.0, 0.88, 0.55], { flag: FLAG_LANTERN });
  lights.push({ x: stX - 0.55, y: 1.55, z: -16.2, r: 1.0, g: 0.72, b: 0.32, radius: 5.2, intensity: 1.6, kind: 'lantern' });

  const padX = laneCenterX(-20.8) + 4.8;
  opq.addBox(padX - 1.8, 0.38, -20.8, 0.36, 0.76, 6.2, UV_DRY_STONE, [0.88, 0.88, 0.90]);
  opq.addCylinder(padX + 1.2, 0.0, -21.2, 0.50, 0.50, 0.75, 10, UV_PLASTER, [1.15, 0.96, 0.46], 0, Math.PI * 0.5);
  opq.addCylinder(padX + 1.8, 0.0, -22.0, 0.46, 0.46, 0.70, 10, UV_PLASTER, [1.12, 0.94, 0.44], 0, Math.PI * 0.5);

  // Northern Valley Overlook Low Balustrade (Z = -25.4) -> Open panorama straight into Pennine Peaks & Abbey!
  const ovCx = laneCenterX(-25.4);
  opq.addBox(ovCx, 0.42, -25.4, 16.0, 0.84, 0.42, UV_DRY_STONE, [0.88, 0.88, 0.90], { aoBottom: 0.68 });
  for (const gxOff of [-3.05, 3.05]) {
    opq.addBox(ovCx + gxOff, 0.62, -25.3, 0.52, 1.24, 0.52, UV_LIMESTONE, [0.92, 0.90, 0.86]);
    opq.addBox(ovCx + gxOff, 1.38, -25.3, 0.22, 0.24, 0.22, UV_INTERIOR, [1.0, 0.88, 0.54], { flag: FLAG_LANTERN });
    lights.push({ x: ovCx + gxOff, y: 1.42, z: -25.3, r: 1.0, g: 0.74, b: 0.34, radius: 5.5, intensity: 1.65, kind: 'lantern' });
  }

  // Alternating Staggered Iron Streetlamps along the Winding Corridor
  const lampSpecs: Array<[number, number]> = [
    [19.2, -1],
    [5.8, 1],
    [-2.8, -1],
    [-13.8, 1],
    [-22.6, -1],
  ];
  for (const [lz, side] of lampSpecs) {
    const lx = laneCenterX(lz) + side * 2.95;
    opq.addBox(lx, 1.25, lz, 0.12, 2.5, 0.12, UV_IRON_RIVET, [0.22, 0.24, 0.28], { flag: FLAG_SNOW_EXEMPT });
    opq.addBox(lx, 2.58, lz, 0.22, 0.24, 0.22, UV_INTERIOR, [1.0, 0.86, 0.54], { flag: FLAG_LANTERN });
    lights.push({ x: lx, y: 2.55, z: lz, r: 1.0, g: 0.72, b: 0.34, radius: 5.8, intensity: 1.85, kind: 'lantern' });
  }

  // =========================================================================
  // PLANE 3: ROADSIDE WINTER OAKS & VALLEY PINES (Natural layered silhouettes)
  // =========================================================================
  const archZones: Array<[number, number]> = [
    [20.2, -1],
    [7.2, 1],
    [-3.6, -1],
    [-14.8, 1],
  ];
  for (const [az, side] of archZones) {
    const bx = laneCenterX(az) + side * 5.85;
    opq.addCylinder(bx, 0.0, az, 0.26, 0.16, 4.4, 7, UV_TIMBER, [0.46, 0.38, 0.32], 0, side * 0.08);
    opq.addCylinder(bx, 3.3, az, 0.14, 0.08, 2.4, 6, UV_TIMBER, [0.46, 0.38, 0.32], 0, side * 0.62);
    // Multi-lobe winter oak foliage clusters framing upper corners organically
    opq.addBox(bx, 5.15, az, 1.9, 1.05, 1.85, UV_GRASS, [0.36, 0.50, 0.38], { rotY: az * 0.3, aoBottom: 0.65 });
    opq.addBox(bx - side * 1.15, 5.05, az + 0.35, 1.45, 0.88, 1.4, UV_GRASS, [0.38, 0.52, 0.40], { rotZ: side * 0.25, aoBottom: 0.68 });
    opq.addBox(bx + side * 0.65, 4.65, az - 0.45, 1.35, 0.85, 1.3, UV_GRASS, [0.34, 0.46, 0.36], { rotY: -0.4, aoBottom: 0.62 });
  }

  // Outer Valley Pines Framing Both Flanks into the Mountain Mist
  const valleyPines: Array<[number, number, number]> = [
    [-11.5, 20.5, 1.35],
    [10.8, 21.0, 1.25],
    [-12.5, 4.2, 1.4],
    [11.6, 5.4, 1.3],
    [-11.2, -2.5, 1.15],
    [11.4, -3.5, 1.25],
    [-10.8, -16.5, 1.3],
    [11.5, -14.2, 1.35],
    [-10.5, -26.5, 1.45],
    [9.8, -26.8, 1.4],
  ];
  for (const [px, pz, sc] of valleyPines) {
    addSculptedTree(opq, laneCenterX(pz) + px, 0.0, pz, 'pine', sc);
  }

  // =========================================================================
  // DYNAMIC ENTITY MESHES (Waterwheel, Sheep, Articulated Hero + Hand Lantern)
  // =========================================================================
  // Giant 12-spoke 16-paddle 3D Timber Waterwheel around origin in XY plane
  const wheelMb = new MeshBuilder(2048, 3072);
  const wheelR = 2.08;
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const rx = Math.cos(a) * wheelR;
    const ry = Math.sin(a) * wheelR;
    for (const rz of [-0.42, 0.42]) {
      wheelMb.addBox(rx, ry, rz, 0.86, 0.22, 0.16, UV_TIMBER, [0.85, 0.76, 0.64], {
        rotZ: a + Math.PI * 0.5,
        flag: FLAG_SNOW_EXEMPT,
      });
    }
    wheelMb.addBox(rx * 1.02, ry * 1.02, 0, 0.34, 0.08, 0.82, UV_TIMBER, [0.74, 0.65, 0.54], {
      rotZ: a + 0.32,
      flag: FLAG_SNOW_EXEMPT,
    });
  }
  for (let s = 0; s < 6; s++) {
    const sa = (s / 6) * Math.PI;
    for (const rz of [-0.32, 0.32]) {
      wheelMb.addBox(0, 0, rz, wheelR * 2.0, 0.14, 0.10, UV_TIMBER, [0.78, 0.68, 0.56], {
        rotZ: sa,
        flag: FLAG_SNOW_EXEMPT,
      });
    }
  }
  wheelMb.addCylinder(0, 0, -0.5, 0.34, 0.34, 1.0, 10, UV_IRON_RIVET, [0.75, 0.76, 0.80], Math.PI * 0.5, 0, FLAG_SNOW_EXEMPT);

  // Sheep Mesh
  const sheepMb = new MeshBuilder(256, 512);
  sheepMb.addBox(0, 0.38, 0, 0.48, 0.42, 0.72, UV_PLASTER, [0.96, 0.94, 0.90], { flag: FLAG_SNOW_EXEMPT });
  sheepMb.addBox(0, 0.48, 0.42, 0.24, 0.24, 0.28, UV_IRON_RIVET, [0.22, 0.22, 0.25], { flag: FLAG_SNOW_EXEMPT });

  // Articulated Hero Protagonist (Warm Camel Coat & Berry Scarf)
  const torsoMb = new MeshBuilder(512, 1024);
  torsoMb.addBox(0, 0.85, 0, 0.46, 0.62, 0.30, UV_PLASTER, [0.96, 0.86, 0.72], { flag: FLAG_SNOW_EXEMPT });
  torsoMb.addBox(0, 1.14, 0.04, 0.38, 0.15, 0.34, UV_AWNING_RED, [1.0, 0.32, 0.28], { flag: FLAG_SNOW_EXEMPT });
  torsoMb.addBox(0, 1.34, 0, 0.28, 0.28, 0.28, UV_PLASTER, [1.0, 0.86, 0.76], { flag: FLAG_SNOW_EXEMPT });
  torsoMb.addBox(0, 1.50, 0.03, 0.32, 0.11, 0.36, UV_TIMBER, [0.54, 0.44, 0.34], { flag: FLAG_SNOW_EXEMPT });

  const legMb = new MeshBuilder(128, 256);
  legMb.addBox(0, -0.26, 0, 0.15, 0.54, 0.17, UV_DRY_STONE, [0.34, 0.36, 0.42], { flag: FLAG_SNOW_EXEMPT });

  const armMb = new MeshBuilder(256, 512);
  armMb.addBox(0, -0.20, 0.12, 0.14, 0.42, 0.15, UV_PLASTER, [0.96, 0.86, 0.72], { rotX: -0.45, flag: FLAG_SNOW_EXEMPT });
  armMb.addBox(0, -0.42, 0.30, 0.04, 0.12, 0.04, UV_IRON_RIVET, [0.3, 0.3, 0.3], { flag: FLAG_SNOW_EXEMPT });
  armMb.addBox(0, -0.54, 0.30, 0.18, 0.22, 0.18, UV_INTERIOR, [1.0, 0.90, 0.56], { flag: FLAG_LANTERN });

  return {
    opaque: opq.build(),
    trans: tr.build(),
    waterwheel: wheelMb.build(),
    wheelPivot,
    sheepMesh: sheepMb.build(),
    sheepSpots: [
      { x: padX + 0.6, z: -19.2, yaw: 0.8, phase: 0.1 },
      { x: padX + 2.1, z: -20.5, yaw: -1.1, phase: 0.45 },
      { x: padX + 0.9, z: -22.2, yaw: 0.3, phase: 0.78 },
      { x: padX + 2.5, z: -22.9, yaw: -0.4, phase: 0.32 },
    ],
    heroTorso: torsoMb.build(),
    heroLeg: legMb.build(),
    heroArmLantern: armMb.build(),
    lights,
    kilnPos,
  };
}
