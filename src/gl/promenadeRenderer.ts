import { ProceduralAtlas, buildProceduralAtlas } from '../assets/proceduralTextures';
import { BuiltMesh, VERT_STRIDE } from '../scene/meshBuilder';
import { PromenadeScene, laneCenterX, walkGroundHeightAt } from '../scene/promenadeBuilder';

const SHADOW_SIZE = 2048;
const MAX_LIGHTS = 96;
export const LOOP_DURATION = 24.0;

export type SceneMode = 'dusk' | 'eclipse' | 'morning' | 'night';
export type BgMode = 'ai' | 'proc';

export interface CameraPose {
  x: number;
  y: number;
  z: number;
  targetX: number;
  targetY: number;
  targetZ: number;
}

export interface AtmosphereState {
  mode: SceneMode;
  umbraCx: number;
  umbraStrength: number;
  lightsIntensity: number;
  sunIntensity: number;
  sunDir: [number, number, number];
  sunColor: [number, number, number];
  ambientCool: [number, number, number];
  fogColor: [number, number, number];
  bgGrade: [number, number, number];
  starVis: number;
}

export function wrapTime(t: number): number {
  const m = t % LOOP_DURATION;
  return m < 0 ? m + LOOP_DURATION : m;
}

function smoothstep(e0: number, e1: number, x: number): number {
  const v = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return v * v * (3 - 2 * v);
}

function normalize3(v: [number, number, number]): [number, number, number] {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}

export function computeAtmosphere(rawT: number, mode: SceneMode): AtmosphereState {
  const t = wrapTime(rawT);

  if (mode === 'morning') {
    return {
      mode,
      umbraCx: -200,
      umbraStrength: 0,
      lightsIntensity: 0.25, // Hearth kiln stays alive even on bright cold mornings!
      sunIntensity: 1.25,
      sunDir: normalize3([-0.52, 0.54, 0.66]),
      sunColor: [1.0, 0.94, 0.86],
      ambientCool: [0.24, 0.31, 0.44],
      fogColor: [0.64, 0.72, 0.82],
      bgGrade: [1.22, 1.20, 1.26],
      starVis: 0,
    };
  }

  if (mode === 'night') {
    return {
      mode,
      umbraCx: -200,
      umbraStrength: 0,
      lightsIntensity: 1.15,
      sunIntensity: 0.16,
      sunDir: normalize3([0.38, 0.68, 0.62]),
      sunColor: [0.36, 0.52, 0.92],
      ambientCool: [0.04, 0.065, 0.13],
      fogColor: [0.06, 0.09, 0.16],
      bgGrade: [0.22, 0.30, 0.52],
      starVis: 1.0,
    };
  }

  if (mode === 'eclipse') {
    const uSweep = Math.max(0, Math.min(1, (t - 4.5) / 15.0));
    const umbraCx = 16 - uSweep * 48; // sweeps North down corridor (+16 -> -32); at t=11.5 -> -6.4 across Bakery/Conservatory!
    const umbraStrength = smoothstep(4.5, 6.2, t) * (1.0 - smoothstep(17.8, 19.5, t));
    const skyDip = smoothstep(5.5, 11.5, t) * (1.0 - smoothstep(12.5, 18.5, t)) * 0.62;
    return {
      mode,
      umbraCx,
      umbraStrength,
      lightsIntensity: 0.45 + skyDip * 2.0,
      sunIntensity: 1.25 * (1 - skyDip * 0.22),
      sunDir: normalize3([-0.56, 0.58, 0.59]),
      sunColor: [1.0, 0.88 - skyDip * 0.18, 0.72 - skyDip * 0.28],
      ambientCool: [0.18 * (1 - skyDip * 0.68), 0.24 * (1 - skyDip * 0.66), 0.36 * (1 - skyDip * 0.45)],
      fogColor: [0.46 * (1 - skyDip * 0.72), 0.54 * (1 - skyDip * 0.68), 0.66 * (1 - skyDip * 0.52)],
      bgGrade: [0.96 - skyDip * 0.52, 0.96 - skyDip * 0.50, 1.05 - skyDip * 0.32],
      starVis: skyDip * 0.95,
    };
  }

  // Default 'dusk': Snowy Yorkshire blue-hour twilight + roaring brick kiln + warm bakery lanterns
  return {
    mode,
    umbraCx: -200,
    umbraStrength: 0,
    lightsIntensity: 1.0,
    sunIntensity: 0.34,
    sunDir: normalize3([-0.68, 0.36, 0.64]),
    sunColor: [0.92, 0.74, 0.58],
    ambientCool: [0.11, 0.16, 0.26],
    fogColor: [0.26, 0.33, 0.44],
    bgGrade: [0.88, 0.92, 1.04],
    starVis: 0.15,
  };
}

// Column-major mat4 helpers
function mat4Mul(out: Float32Array, a: Float32Array, b: Float32Array): Float32Array {
  for (let col = 0; col < 4; col++) {
    const b0 = b[col * 4], b1 = b[col * 4 + 1], b2 = b[col * 4 + 2], b3 = b[col * 4 + 3];
    out[col * 4] = a[0] * b0 + a[4] * b1 + a[8] * b2 + a[12] * b3;
    out[col * 4 + 1] = a[1] * b0 + a[5] * b1 + a[9] * b2 + a[13] * b3;
    out[col * 4 + 2] = a[2] * b0 + a[6] * b1 + a[10] * b2 + a[14] * b3;
    out[col * 4 + 3] = a[3] * b0 + a[7] * b1 + a[11] * b2 + a[15] * b3;
  }
  return out;
}

function mat4Invert(out: Float32Array, m: Float32Array): boolean {
  const m00 = m[0], m01 = m[1], m02 = m[2], m03 = m[3];
  const m10 = m[4], m11 = m[5], m12 = m[6], m13 = m[7];
  const m20 = m[8], m21 = m[9], m22 = m[10], m23 = m[11];
  const m30 = m[12], m31 = m[13], m32 = m[14], m33 = m[15];

  const b00 = m00 * m11 - m01 * m10, b01 = m00 * m12 - m02 * m10, b02 = m00 * m13 - m03 * m10;
  const b03 = m01 * m12 - m02 * m11, b04 = m01 * m13 - m03 * m11, b05 = m02 * m13 - m03 * m12;
  const b06 = m20 * m31 - m21 * m30, b07 = m20 * m32 - m22 * m30, b08 = m20 * m33 - m23 * m30;
  const b09 = m21 * m32 - m22 * m31, b10 = m21 * m33 - m23 * m31, b11 = m22 * m33 - m23 * m32;

  let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  if (!det) return false;
  det = 1 / det;

  out[0] = (m11 * b11 - m12 * b10 + m13 * b09) * det;
  out[1] = (m02 * b10 - m01 * b11 - m03 * b09) * det;
  out[2] = (m31 * b05 - m32 * b04 + m33 * b03) * det;
  out[3] = (m22 * b04 - m21 * b05 - m23 * b03) * det;
  out[4] = (m12 * b08 - m10 * b11 - m13 * b07) * det;
  out[5] = (m00 * b11 - m02 * b08 + m03 * b07) * det;
  out[6] = (m32 * b02 - m30 * b05 - m33 * b01) * det;
  out[7] = (m20 * b05 - m22 * b02 + m23 * b01) * det;
  out[8] = (m10 * b10 - m11 * b08 + m13 * b06) * det;
  out[9] = (m01 * b08 - m00 * b10 - m03 * b06) * det;
  out[10] = (m30 * b04 - m31 * b02 + m33 * b00) * det;
  out[11] = (m21 * b02 - m20 * b04 - m23 * b00) * det;
  out[12] = (m11 * b07 - m10 * b09 - m12 * b06) * det;
  out[13] = (m00 * b09 - m01 * b07 + m02 * b06) * det;
  out[14] = (m31 * b01 - m30 * b03 - m32 * b00) * det;
  out[15] = (m20 * b03 - m21 * b01 + m22 * b00) * det;
  return true;
}

function mat4TRS(out: Float32Array, tx: number, ty: number, tz: number, rotX: number, rotY: number, rotZ: number): Float32Array {
  const cx = Math.cos(rotX), sx = Math.sin(rotX);
  const cy = Math.cos(rotY), sy = Math.sin(rotY);
  const cz = Math.cos(rotZ), sz = Math.sin(rotZ);
  // Y * X * Z
  out[0] = cy * cz + sy * sx * sz;
  out[1] = cx * sz;
  out[2] = -sy * cz + cy * sx * sz;
  out[3] = 0;

  out[4] = -cy * sz + sy * sx * cz;
  out[5] = cx * cz;
  out[6] = sy * sz + cy * sx * cz;
  out[7] = 0;

  out[8] = sy * cx;
  out[9] = -sx;
  out[10] = cy * cx;
  out[11] = 0;

  out[12] = tx;
  out[13] = ty;
  out[14] = tz;
  out[15] = 1;
  return out;
}

function mat4Perspective(out: Float32Array, fovy: number, aspect: number, near: number, far: number): void {
  const f = 1 / Math.tan(fovy * 0.5);
  const nf = 1 / (near - far);
  out.fill(0);
  out[0] = f / aspect;
  out[5] = f;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[14] = 2 * far * near * nf;
}

function mat4Ortho(out: Float32Array, l: number, r: number, b: number, t: number, n: number, f: number): void {
  const lr = 1 / (l - r), bt = 1 / (b - t), nf = 1 / (n - f);
  out.fill(0);
  out[0] = -2 * lr;
  out[5] = -2 * bt;
  out[10] = 2 * nf;
  out[12] = (l + r) * lr;
  out[13] = (t + b) * bt;
  out[14] = (f + n) * nf;
  out[15] = 1;
}

function mat4LookAt(out: Float32Array, eye: [number, number, number], center: [number, number, number], up: [number, number, number]): void {
  let zx = eye[0] - center[0], zy = eye[1] - center[1], zz = eye[2] - center[2];
  let len = Math.hypot(zx, zy, zz) || 1;
  zx /= len; zy /= len; zz /= len;
  let xx = up[1] * zz - up[2] * zy, xy = up[2] * zx - up[0] * zz, xz = up[0] * zy - up[1] * zx;
  len = Math.hypot(xx, xy, xz) || 1;
  xx /= len; xy /= len; xz /= len;
  const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
  out[0] = xx; out[4] = xy; out[8] = xz; out[12] = -(xx * eye[0] + xy * eye[1] + xz * eye[2]);
  out[1] = yx; out[5] = yy; out[9] = yz; out[13] = -(yx * eye[0] + yy * eye[1] + yz * eye[2]);
  out[2] = zx; out[6] = zy; out[10] = zz; out[14] = -(zx * eye[0] + zy * eye[1] + zz * eye[2]);
  out[3] = 0;  out[7] = 0;  out[11] = 0;  out[15] = 1;
}

// ---------------- Shaders ----------------

const SHADOW_VS = /* glsl */ `#version 300 es
layout(location = 0) in vec3 aPos;
uniform mat4 uMVP;
void main() { gl_Position = uMVP * vec4(aPos, 1.0); }
`;

const SHADOW_FS = /* glsl */ `#version 300 es
precision highp float;
void main() {}
`;

const GBUF_VS = /* glsl */ `#version 300 es
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aUv;
layout(location = 3) in vec3 aTint;
layout(location = 4) in float aAo;
layout(location = 5) in float aFlags;

uniform mat4 uModel;
uniform mat4 uVP;

out vec3 vWorldPos;
out vec3 vWorldNormal;
out vec2 vUv;
out vec3 vTint;
out float vAo;
out float vFlags;

void main() {
  vec4 wp = uModel * vec4(aPos, 1.0);
  vWorldPos = wp.xyz;
  vWorldNormal = normalize(mat3(uModel) * aNormal);
  vUv = aUv;
  vTint = aTint;
  vAo = aAo;
  vFlags = aFlags;
  gl_Position = uVP * wp;
}
`;

const GBUF_FS = /* glsl */ `#version 300 es
precision highp float;

in vec3 vWorldPos;
in vec3 vWorldNormal;
in vec2 vUv;
in vec3 vTint;
in float vAo;
in float vFlags;

uniform sampler2D uAlbedoAtlas;
uniform sampler2D uNormalAtlas;
uniform sampler2D uMatAtlas;
uniform float uLightsIntensity;
uniform vec3 uKilnPos;
uniform float uKilnBoost;

layout(location = 0) out vec4 outRT0; // albedo.rgb, roughness
layout(location = 1) out vec4 outRT1; // normal.xyz*0.5+0.5, metallic
layout(location = 2) out vec4 outRT2; // emissive.rgb/4.0, ao

vec3 perturbNormal(vec3 N, vec3 p, vec2 uv) {
  vec3 mapN = texture(uNormalAtlas, uv).xyz * 2.0 - 1.0;
  vec3 dp1 = dFdx(p);
  vec3 dp2 = dFdy(p);
  vec2 duv1 = dFdx(uv);
  vec2 duv2 = dFdy(uv);
  vec3 dp2perp = cross(dp2, N);
  vec3 dp1perp = cross(N, dp1);
  vec3 T = dp2perp * duv1.x + dp1perp * duv2.x;
  vec3 B = dp2perp * duv1.y + dp1perp * duv2.y;
  float maxLen = max(dot(T, T), dot(B, B));
  if (maxLen < 1e-10) return N;
  float invmax = inversesqrt(maxLen);
  return normalize(mat3(T * invmax, B * invmax, N) * mapN);
}

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

void main() {
  vec3 texCol = texture(uAlbedoAtlas, vUv).rgb;
  vec4 matSample = texture(uMatAtlas, vUv);
  vec3 N = perturbNormal(normalize(vWorldNormal), vWorldPos, vUv);

  vec3 baseSrgb = clamp(texCol * vTint, vec3(0.0), vec3(1.0));
  float rough = clamp(matSample.r, 0.08, 0.98);
  float metal = matSample.g;
  float ao = clamp(vAo * (0.45 + 0.55 * matSample.b), 0.15, 1.0);

  // Physical Winter Snow Drift along Winding Cobblestone Corridor + Thermal Kiln Snow-Melt!
  float snowExempt = step(4.5, vFlags); // exclude FIRE & SNOW_EXEMPT props
  float kilnDist = length(vWorldPos.xz - uKilnPos.xz);
  float kilnMelt = 1.0 - smoothstep(1.8, 5.8, kilnDist);
  float laneCx = sin((vWorldPos.z - 2.0) * 0.115) * 2.15;
  float driftWobble = 0.28 * sin(vWorldPos.z * 0.95 + vWorldPos.x * 0.65) + 0.16 * cos(vWorldPos.z * 2.3 - vWorldPos.x * 1.4);
  float roadTraffic = 1.0 - 0.72 * (1.0 - smoothstep(0.6, 2.75, abs(vWorldPos.x - (laneCx + driftWobble))));
  float nSnow = hash21(floor(vWorldPos.xz * 26.0));
  float snowGrain = 0.86 + 0.14 * sin(vWorldPos.x * 2.4 + cos(vWorldPos.z * 2.1));
  float snowMask = smoothstep(0.48, 0.88, N.y) * (1.0 - snowExempt) * (1.0 - kilnMelt) * roadTraffic;

  vec3 snowTone = vec3(0.84, 0.89, 0.95) * snowGrain;
  baseSrgb = mix(baseSrgb, snowTone, snowMask * 0.72);
  rough = mix(rough, 0.64 + nSnow * 0.20, snowMask * 0.78);
  // Wet melted cobbles near hot brick kiln turn dark & glossy!
  float wetCobble = kilnMelt * smoothstep(0.55, 0.95, N.y) * (1.0 - snowExempt);
  baseSrgb *= mix(1.0, 0.70, wetCobble);
  rough = mix(rough, 0.16, wetCobble * 0.85);

  vec3 emissive = vec3(0.0);
  if (vFlags > 0.5 && vFlags < 1.5) {
    // 3D Interior Room Window
    vec3 texLin = pow(baseSrgb, vec3(2.2));
    emissive = texLin * vec3(1.45, 0.90, 0.42) * (0.42 + 1.58 * matSample.a) * uLightsIntensity;
    baseSrgb *= mix(0.30, 0.14, clamp(uLightsIntensity, 0.0, 1.0));
  } else if (vFlags > 1.5 && vFlags < 2.5) {
    // Lantern filament or Clock dial
    vec3 texLin = pow(baseSrgb, vec3(2.2));
    emissive = texLin * vec3(1.75, 1.12, 0.46) * (0.15 + 2.4 * uLightsIntensity);
  } else if (vFlags > 4.5 && vFlags < 5.5) {
    // Blazing Brick Kiln Hearth Embers & Firebox Coals!
    vec3 texLin = pow(baseSrgb, vec3(2.2));
    emissive = texLin * vec3(2.6, 1.05, 0.24) * (1.6 + uKilnBoost * 1.4);
  }

  outRT0 = vec4(baseSrgb, rough);
  outRT1 = vec4(N * 0.5 + 0.5, metal);
  outRT2 = vec4(clamp(emissive / 4.0, vec3(0.0), vec3(1.0)), ao);
}
`;

const FS_QUAD_VS = /* glsl */ `#version 300 es
out vec2 vUv;
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`;

const DEFERRED_BASE_FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;

uniform sampler2D uRT0;
uniform sampler2D uRT1;
uniform sampler2D uRT2;
uniform sampler2D uGDepth;
uniform sampler2D uShadowMap;
uniform sampler2D uAiBgTex;

uniform mat4 uInvVP;
uniform mat4 uVP;
uniform mat4 uLightVP;
uniform vec3 uCameraPos;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform float uSunIntensity;
uniform vec3 uAmbientCool;
uniform vec3 uFogColor;
uniform vec3 uBgGrade;
uniform float uStarVis;
uniform vec2 uUmbra; // cx, strength
uniform int uBgMode; // 0 = AI painting, 1 = Procedural GLSL mountains
uniform float uPhase;
uniform float uMousePx;
uniform float uMousePy;
uniform float uCamYaw;
uniform float uValleyDepth;
uniform float uHdrScale;
uniform vec2 uResolution;

const vec2 POISSON[12] = vec2[](
  vec2(-0.326, -0.405), vec2(-0.840, -0.073), vec2(-0.695,  0.457),
  vec2(-0.203,  0.620), vec2( 0.962, -0.194), vec2( 0.473, -0.480),
  vec2( 0.519,  0.767), vec2( 0.185, -0.893), vec2( 0.507,  0.064),
  vec2( 0.896,  0.412), vec2(-0.321, -0.932), vec2(-0.791, -0.597)
);

const vec3 SSAO_DIRS[8] = vec3[](
  vec3( 0.42,  0.35,  0.40), vec3(-0.45,  0.28,  0.35),
  vec3( 0.22,  0.62, -0.35), vec3(-0.32,  0.48, -0.42),
  vec3( 0.65,  0.18, -0.15), vec3(-0.62,  0.15,  0.22),
  vec3( 0.12,  0.25,  0.68), vec3(-0.15,  0.72, -0.12)
);

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float hash11(float p) {
  float x = fract(p * 0.1031);
  x *= x + 33.33;
  x *= x + x;
  return fract(x);
}

float noise1D(float x) {
  float i = floor(x);
  float f = fract(x);
  float u = f * f * (3.0 - 2.0 * f);
  return mix(hash11(i), hash11(i + 1.0), u);
}

float ridge1D(float x) {
  float sum = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for (int k = 0; k < 4; k++) {
    float n = 1.0 - abs(noise1D(x * freq + float(k) * 17.3) * 2.0 - 1.0);
    sum += n * n * amp;
    freq *= 2.15;
    amp *= 0.48;
  }
  return sum;
}

float noise21(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm2(vec2 p) {
  const mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
  float v = 0.0;
  float a = 0.52;
  vec2 q = p;
  for (int i = 0; i < 4; i++) {
    v += a * noise21(q);
    q = rot * q * 2.04 + vec2(5.2, 1.3);
    a *= 0.48;
  }
  return v;
}

vec3 reconstructWorldPos(vec2 uv, float depth) {
  vec4 ndc = vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
  vec4 wp = uInvVP * ndc;
  return wp.xyz / wp.w;
}

// Pipeline B: 100% Pure GLSL Layered Pennine Mountains, Storm Clouds & Distant Ruined Abbey!
vec3 evalProceduralMountainVista(vec2 uv) {
  float zoom = 1.0 + uValleyDepth * 0.14;
  vec2 zuv = (uv - vec2(0.5, 0.42)) / zoom + vec2(0.5, 0.42);
  float px = uCamYaw * 0.28 + uCameraPos.x * 0.010 + uMousePx * 0.025;
  float py = (uCameraPos.y - 2.6) * 0.015 + uMousePy * 0.015 - 0.04;

  // Sky twilight gradient + warm pass glow (balanced sRGB luminosity so blue-hour clouds match AI depth)
  vec3 zenith = vec3(0.24, 0.32, 0.46) * uBgGrade;
  vec3 midSky = vec3(0.36, 0.45, 0.58) * uBgGrade;
  vec3 horizon = mix(vec3(0.56, 0.60, 0.68), vec3(0.92, 0.78, 0.58), exp(-pow((zuv.x - 0.54) * 2.3, 2.0))) * uBgGrade;
  vec3 sky = mix(horizon, midSky, smoothstep(0.28, 0.58, zuv.y));
  sky = mix(sky, zenith, smoothstep(0.52, 0.96, zuv.y));

  // Soft swirling winter clouds with subtle silver rim
  vec2 cUv = vec2(zuv.x * 2.6 + px * 0.22 + uPhase * 0.20, zuv.y * 5.2 + py * 0.18);
  float clouds = fbm2(cUv);
  float cloudMask = smoothstep(0.42, 0.76, clouds) * smoothstep(0.32, 0.88, zuv.y) * (1.0 - smoothstep(0.86, 1.0, zuv.y));
  vec3 cloudDark = mix(vec3(0.24, 0.30, 0.42), vec3(0.68, 0.68, 0.74), smoothstep(0.35, 0.68, zuv.y)) * uBgGrade;
  sky = mix(sky, cloudDark, cloudMask * 0.56);

  // Subtle eclipsed sun corona when in Eclipse mode
  if (uUmbra.y > 0.05) {
    vec2 sunUv = vec2(0.54 - px * 0.18, 0.70 - py * 0.12);
    float dSun = length((zuv - sunUv) * vec2(1.75, 1.0));
    float corona = exp(-dSun * 8.5) * uUmbra.y;
    float moonDisc = 1.0 - smoothstep(0.032, 0.038, dSun);
    sky += vec3(0.96, 0.76, 0.44) * corona * 0.78;
    sky = mix(sky, vec3(0.03, 0.04, 0.08), moonDisc * uUmbra.y * 0.92);
  }

  // Pinpoint twinkling stars if night/eclipse
  if (uStarVis > 0.05 && zuv.y > 0.50) {
    float st = hash21(floor(uv * uResolution * 0.22));
    if (st > 0.996) sky += vec3(0.78, 0.85, 1.0) * uStarVis * (1.0 - cloudMask * 0.7);
  }

  vec3 col = sky;

  // Far Ridged Multifractal Pennine Range with lit west-facing snow couloirs
  float x1 = zuv.x + px * 0.30;
  float r1 = ridge1D(x1 * 4.2 + 1.3);
  float h1 = 0.46 + 0.24 * r1 + 0.05 * sin(x1 * 3.1);
  if (zuv.y < h1) {
    float slope = (ridge1D((x1 + 0.008) * 4.2 + 1.3) - r1) * 14.0;
    float snowFace = smoothstep(h1 - 0.15, h1, zuv.y);
    float sunlit = clamp(0.45 - slope * 0.35, 0.05, 1.0);
    vec3 rockCol = vec3(0.20, 0.26, 0.36) * uBgGrade;
    vec3 snowCol = mix(vec3(0.56, 0.65, 0.78), vec3(0.84, 0.88, 0.92), sunlit) * uBgGrade;
    vec3 peakCol = mix(rockCol, snowCol, smoothstep(0.18, 0.72, snowFace + sunlit * 0.25));
    col = mix(peakCol, uFogColor, 0.22 + (1.0 - snowFace) * 0.22);
  }

  // Mid Ridge + Distant Ruined Yorkshire Abbey Silhouette right down the valley pass!
  float x2 = zuv.x + px * 0.52;
  float r2 = ridge1D(x2 * 5.6 + 8.4);
  float h2 = 0.36 + 0.14 * r2 + 0.03 * cos(x2 * 4.2 - 0.7);
  float abbeyDist = abs(x2 - 0.53);
  if (abbeyDist < 0.036) {
    float spireLeft = smoothstep(0.018, 0.012, abs(x2 - 0.518)) * 0.072;
    float naveRight = smoothstep(0.022, 0.016, abs(x2 - 0.542)) * 0.056;
    float abbeyH = h2 + 0.024 + max(spireLeft, naveRight);
    float lancetGap = (abs(x2 - 0.530) < 0.004 && zuv.y < h2 + 0.042 && zuv.y > h2 + 0.018) ? 1.0 : 0.0;
    if (zuv.y < abbeyH && lancetGap < 0.5) {
      col = mix(vec3(0.18, 0.23, 0.31) * uBgGrade, uFogColor, 0.32);
    }
  }
  if (zuv.y < h2) {
    float rim = smoothstep(h2 - 0.06, h2, zuv.y);
    vec3 rCol = mix(vec3(0.20, 0.26, 0.34), vec3(0.54, 0.62, 0.74), rim) * uBgGrade;
    col = mix(rCol, uFogColor, 0.36);
  }

  // Lower Distant Snow-Dusted Pine Line + Fog Mist Transition
  float x3 = zuv.x + px * 0.82;
  float pines = 0.018 * abs(sin(x3 * 92.0 + ridge1D(x3 * 12.0) * 3.0));
  float h3 = 0.29 + 0.04 * sin(x3 * 6.5 + 0.5) + 0.03 * ridge1D(x3 * 9.0) + pines;
  if (zuv.y < h3) {
    col = mix(vec3(0.14, 0.19, 0.26) * uBgGrade, uFogColor, 0.44);
  }

  // Smooth lower valley mist blending cleanly into 3D terrain dissolve
  float fogBand = 1.0 - smoothstep(0.18, 0.38, zuv.y);
  col = mix(col, uFogColor, fogBand * 0.86);
  return pow(max(col, vec3(0.0)), vec3(2.2));
}

// Pipeline A: AI-Painted Concept Panorama Plate with Multi-Speed Parallax & Depth Zoom
vec3 evalAiPanoramaVista(vec2 uv) {
  float zoom = 1.0 + uValleyDepth * 0.14;
  vec2 zuv = (uv - vec2(0.5, 0.44)) / zoom + vec2(0.5, 0.44);
  float px = clamp(uCamYaw * 0.16 + uCameraPos.x * 0.0045 + uMousePx * 0.012, -0.14, 0.14);
  float py = clamp((uCameraPos.y - 2.6) * 0.010 + uMousePy * 0.008 - 0.05, -0.09, 0.05);
  vec2 bgUv = vec2(clamp(zuv.x * 0.74 + 0.12 + px, 0.005, 0.995), clamp(1.0 - zuv.y + py, 0.005, 0.995));
  vec3 aiCol = pow(texture(uAiBgTex, bgUv).rgb, vec3(2.2)) * uBgGrade;
  if (uUmbra.y > 0.05) {
    vec2 sunUv = vec2(0.54 - px * 0.5, 0.70 - py * 0.5);
    float dSun = length((zuv - sunUv) * vec2(1.75, 1.0));
    aiCol += vec3(0.95, 0.72, 0.38) * exp(-dSun * 8.5) * uUmbra.y * 0.65;
    float moonDisc = 1.0 - smoothstep(0.032, 0.038, dSun);
    aiCol = mix(aiCol, vec3(0.02, 0.03, 0.06), moonDisc * uUmbra.y * 0.9);
  }
  if (uStarVis > 0.1 && zuv.y > 0.52) {
    float st = hash21(floor(uv * uResolution * 0.22));
    if (st > 0.9965) aiCol += vec3(0.75, 0.84, 1.0) * uStarVis * 0.6;
  }
  vec3 fogLin = pow(uFogColor, vec3(2.2));
  float mist = 1.0 - smoothstep(0.14, 0.36, zuv.y);
  return mix(aiCol, fogLin, mist * 0.48);
}

float sampleShadow(vec3 wp, vec3 N, float ndotl) {
  vec4 sc = uLightVP * vec4(wp + N * 0.06, 1.0);
  vec3 p = sc.xyz / sc.w;
  p = p * 0.5 + 0.5;
  if (p.x < 0.0 || p.x > 1.0 || p.y < 0.0 || p.y > 1.0 || p.z > 1.0) return 1.0;
  float texel = 1.0 / ${SHADOW_SIZE}.0;
  float ang = fract(sin(dot(wp.xz, vec2(12.9898, 78.233))) * 43758.5453) * 6.283185;
  float ca = cos(ang), sa = sin(ang);
  mat2 rot = mat2(ca, -sa, sa, ca);
  float bias = max(0.0005, 0.0014 * (1.0 - ndotl));
  float spread = texel * 1.4;
  float lit = 0.0;
  for (int i = 0; i < 12; i++) {
    vec2 uv = clamp(p.xy + (rot * POISSON[i]) * spread, vec2(0.001), vec2(0.999));
    lit += step(p.z - bias, texture(uShadowMap, uv).r);
  }
  return lit / 12.0;
}

float evalContactSSAO(vec3 wp, vec3 N) {
  float camDist = length(uCameraPos - wp);
  float rad = clamp(camDist * 0.018, 0.16, 0.58);
  float ang = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) * 6.283185;
  float ca = cos(ang), sa = sin(ang);
  float occ = 0.0;
  for (int i = 0; i < 8; i++) {
    vec3 dir = SSAO_DIRS[i];
    vec3 rotDir = vec3(dir.x * ca - dir.z * sa, dir.y, dir.x * sa + dir.z * ca);
    if (dot(rotDir, N) < 0.0) rotDir = -rotDir;
    vec3 sp = wp + rotDir * rad;
    vec4 clip = uVP * vec4(sp, 1.0);
    vec2 suv = (clip.xy / clip.w) * 0.5 + 0.5;
    if (suv.x < 0.01 || suv.x > 0.99 || suv.y < 0.01 || suv.y > 0.99) continue;
    float sDepth = texture(uGDepth, suv).r;
    if (sDepth >= 0.9999) continue;
    vec3 swp = reconstructWorldPos(suv, sDepth);
    float distGap = dot(swp - wp, N);
    float range = 1.0 - smoothstep(0.04, rad * 1.6, length(swp - wp));
    occ += step(0.025, distGap) * range;
  }
  return 1.0 - clamp(occ / 8.0, 0.0, 0.72);
}

out vec4 fragColor;

void main() {
  float depth = texture(uGDepth, vUv).r;
  if (depth >= 0.9999) {
    vec3 bg = uBgMode == 0 ? evalAiPanoramaVista(vUv) : evalProceduralMountainVista(vUv);
    fragColor = vec4(bg * uHdrScale, 1.0);
    return;
  }

  vec4 rt0 = texture(uRT0, vUv);
  vec4 rt1 = texture(uRT1, vUv);
  vec4 rt2 = texture(uRT2, vUv);

  vec3 albedo = pow(rt0.rgb, vec3(2.2));
  float rough = rt0.a;
  vec3 N = normalize(rt1.rgb * 2.0 - 1.0);
  float metal = rt1.a;
  vec3 emissive = rt2.rgb * 4.0;
  float bakedAo = rt2.a;

  vec3 wp = reconstructWorldPos(vUv, depth);
  float ssao = evalContactSSAO(wp, N);
  float ao = clamp(bakedAo * ssao, 0.14, 1.0);

  // Diagonal Eclipse Lunar Umbra sweeping down deep corridor (wp.z + oblique angle)!
  float umbraDist = abs(wp.z - uUmbra.x + wp.x * 0.55);
  float localUmbra = uUmbra.y * (1.0 - smoothstep(3.0, 10.5, umbraDist));
  float umbraSunMul = mix(1.0, 0.02, localUmbra);

  vec3 V = normalize(uCameraPos - wp);
  float ndotl = max(dot(N, uSunDir), 0.0);
  float shadow = (ndotl > 0.001 && uSunIntensity * umbraSunMul > 0.01) ? sampleShadow(wp, N, ndotl) : 0.0;

  float hemi = N.y * 0.5 + 0.5;
  vec3 skyAmb = mix(uAmbientCool * 0.55, uAmbientCool * 1.15, hemi) * mix(1.0, 0.24, localUmbra);

  vec3 F0 = mix(vec3(0.04), albedo, metal);
  vec3 kD = (1.0 - F0) * (1.0 - metal);
  vec3 H = normalize(uSunDir + V);
  float a2 = pow(max(rough, 0.08), 4.0);
  float ndoth = max(dot(N, H), 0.0);
  float denom = ndoth * ndoth * (a2 - 1.0) + 1.0;
  float D = a2 / (3.14159 * denom * denom);
  float fresnel = F0.r + (1.0 - F0.r) * pow(1.0 - max(dot(H, V), 0.0), 5.0);
  vec3 specCol = mix(vec3(fresnel), F0, metal) * (D * 0.16);

  vec3 sunRad = uSunColor * (uSunIntensity * umbraSunMul * shadow * 2.0);
  vec3 direct = (kD * albedo + specCol) * sunRad * ndotl;
  vec3 color = albedo * skyAmb * ao + direct * mix(0.65, 1.0, ao) + emissive;

  // Seamless valley mist fading distant terrain (-Z horizon & deep view distance) into Plane 1 mountain vista!
  float distFade = smoothstep(26.0, 58.0, length(uCameraPos - wp));
  float backFade = smoothstep(-23.5, -33.5, wp.z) * (1.0 - smoothstep(0.5, 3.0, wp.y));
  float farFade = max(distFade, backFade);
  if (farFade > 0.001) {
    vec3 fogLin = pow(uFogColor, vec3(2.2));
    vec3 bgVista = uBgMode == 0 ? evalAiPanoramaVista(vUv) : evalProceduralMountainVista(vUv);
    color = mix(color, mix(fogLin, bgVista, 0.78), farFade * 0.92);
  }

  fragColor = vec4(color * uHdrScale, 1.0);
}
`;

const POINT_LIGHT_VS = /* glsl */ `#version 300 es
layout(location = 0) in vec3 aPos;
layout(location = 6) in vec4 aLightPosRad;
layout(location = 7) in vec4 aLightColInt;
uniform mat4 uVP;
out vec3 vLightPos;
out float vRadius;
out vec3 vLightCol;
out float vIntensity;
void main() {
  vLightPos = aLightPosRad.xyz;
  vRadius = aLightPosRad.w;
  vLightCol = aLightColInt.rgb;
  vIntensity = aLightColInt.w;
  gl_Position = uVP * vec4(aLightPosRad.xyz + aPos * aLightPosRad.w, 1.0);
}
`;

const POINT_LIGHT_FS = /* glsl */ `#version 300 es
precision highp float;
in vec3 vLightPos;
in float vRadius;
in vec3 vLightCol;
in float vIntensity;
uniform sampler2D uRT0;
uniform sampler2D uRT1;
uniform sampler2D uGDepth;
uniform mat4 uInvVP;
uniform vec3 uCameraPos;
uniform vec2 uResolution;
uniform float uHdrScale;
out vec4 fragColor;
void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float depth = texture(uGDepth, uv).r;
  if (depth >= 0.9999) discard;
  vec4 wp4 = uInvVP * vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
  vec3 wp = wp4.xyz / wp4.w;
  vec3 toL = vLightPos - wp;
  float dist = length(toL);
  if (dist >= vRadius || dist < 0.02) discard;

  vec4 rt0 = texture(uRT0, uv);
  vec4 rt1 = texture(uRT1, uv);
  vec3 albedo = pow(rt0.rgb, vec3(2.2));
  float rough = rt0.a;
  vec3 N = normalize(rt1.rgb * 2.0 - 1.0);
  float metal = rt1.a;
  vec3 L = toL / dist;
  float ndotl = max(dot(N, L), 0.0);
  if (ndotl <= 0.001) discard;

  float u = clamp(dist / vRadius, 0.0, 1.0);
  float win = pow(1.0 - u * u, 2.0);
  float atten = (win / (0.40 + dist * dist * 0.36)) * vIntensity;

  vec3 V = normalize(uCameraPos - wp);
  vec3 H = normalize(L + V);
  float spec = pow(max(dot(N, H), 0.0), mix(56.0, 6.0, rough)) * mix(0.32, 0.04, rough);
  vec3 F0 = mix(vec3(0.04), albedo, metal);
  vec3 contrib = (albedo * (1.0 - metal * 0.65) * ndotl + mix(vec3(1.0), F0, metal) * spec * ndotl) * vLightCol * atten;
  fragColor = vec4(contrib * uHdrScale, 1.0);
}
`;

const TRANS_VS = /* glsl */ `#version 300 es
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aNormal;
layout(location = 3) in vec3 aTint;
layout(location = 5) in float aFlags;
uniform mat4 uModel;
uniform mat4 uVP;
out vec3 vWorldPos;
out vec3 vNormal;
out vec3 vTint;
out float vFlags;
void main() {
  vec4 wp = uModel * vec4(aPos, 1.0);
  vWorldPos = wp.xyz;
  vNormal = normalize(mat3(uModel) * aNormal);
  vTint = aTint;
  vFlags = aFlags;
  gl_Position = uVP * wp;
}
`;

const TRANS_FS = /* glsl */ `#version 300 es
precision highp float;
in vec3 vWorldPos;
in vec3 vNormal;
in vec3 vTint;
in float vFlags;
uniform vec3 uCameraPos;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform float uSunIntensity;
uniform vec3 uFogColor;
uniform float uLightsIntensity;
uniform float uPhase;
uniform float uHdrScale;
out vec4 fragColor;
void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(uCameraPos - vWorldPos);
  if (vFlags > 2.5 && vFlags < 3.5) {
    float tau = 6.2831853;
    float r1 = sin(vWorldPos.x * 2.2 - uPhase * tau * 4.0 + vWorldPos.z * 2.6);
    float r2 = cos(vWorldPos.z * 2.8 + uPhase * tau * 5.0 - vWorldPos.x * 1.8);
    vec3 wN = normalize(N + vec3(r1 * 0.14, 0.0, r2 * 0.14));
    float fresnel = mix(0.24, 0.88, pow(1.0 - max(dot(wN, V), 0.0), 3.0));
    vec3 H = normalize(uSunDir + V);
    float spec = pow(max(dot(wN, H), 0.0), 84.0) * uSunIntensity * 1.2;
    vec3 waterCol = pow(vTint, vec3(2.2)) * (0.28 + 0.72 * uSunIntensity);
    vec3 skyCol = pow(uFogColor, vec3(2.2));
    // Warm orange lantern reflection near bridge Z in [-1..+3]
    float bridgeGlow = exp(-pow((vWorldPos.z - 1.1) * 0.7, 2.0)) * 0.22 * uLightsIntensity;
    vec3 outCol = mix(waterCol, skyCol * 1.05, fresnel * 0.62) + uSunColor * spec + vec3(1.0, 0.68, 0.28) * bridgeGlow;
    fragColor = vec4(outCol * uHdrScale, 0.76);
  } else {
    float fresnel = mix(0.18, 0.72, pow(1.0 - max(dot(N, V), 0.0), 2.8));
    vec3 H = normalize(uSunDir + V);
    float spec = pow(max(dot(N, H), 0.0), 72.0) * uSunIntensity * 0.75;
    vec3 col = pow(vTint, vec3(2.2)) * (0.25 + 0.65 * uSunIntensity) + uSunColor * spec + vec3(0.95, 0.62, 0.22) * (uLightsIntensity * 0.14);
    fragColor = vec4(col * uHdrScale, 0.16 + fresnel * 0.24);
  }
}
`;

const PARTICLE_VS = /* glsl */ `#version 300 es
layout(location = 0) in vec2 aQuad;
layout(location = 1) in vec3 aCenter;
layout(location = 2) in vec4 aColorSize; // rgb, radius
uniform mat4 uVP;
uniform vec3 uCamRight;
uniform vec3 uCamUp;
out vec2 vLocal;
out vec3 vCol;
void main() {
  vLocal = aQuad;
  vCol = aColorSize.rgb;
  vec3 wp = aCenter + uCamRight * (aQuad.x * aColorSize.a) + uCamUp * (aQuad.y * aColorSize.a);
  gl_Position = uVP * vec4(wp, 1.0);
}
`;

const PARTICLE_FS = /* glsl */ `#version 300 es
precision highp float;
in vec2 vLocal;
in vec3 vCol;
uniform float uHdrScale;
out vec4 fragColor;
void main() {
  float d = length(vLocal);
  if (d > 1.0) discard;
  float alpha = smoothstep(1.0, 0.18, d) * 0.72;
  fragColor = vec4(vCol * uHdrScale, alpha);
}
`;

const TONE_MAP_FS = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uHdrTex;
uniform float uInvHdrScale;
uniform vec2 uInvRes;

vec3 aces(vec3 x) {
  const float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}
vec3 sampleTone(vec2 uv) {
  return pow(aces(texture(uHdrTex, uv).rgb * uInvHdrScale), vec3(1.0 / 2.2));
}
out vec4 fragColor;
void main() {
  vec3 cM = sampleTone(vUv);
  vec3 cN = sampleTone(vUv + vec2(0.0, uInvRes.y));
  vec3 cS = sampleTone(vUv - vec2(0.0, uInvRes.y));
  vec3 cE = sampleTone(vUv + vec2(uInvRes.x, 0.0));
  vec3 cW = sampleTone(vUv - vec2(uInvRes.x, 0.0));
  vec3 lw = vec3(0.299, 0.587, 0.114);
  float lMax = max(max(dot(cN, lw), dot(cS, lw)), max(dot(cE, lw), dot(cW, lw)));
  float lMin = min(min(dot(cN, lw), dot(cS, lw)), min(dot(cE, lw), dot(cW, lw)));
  vec3 avg = (cN + cS + cE + cW) * 0.25;
  vec3 col = mix(cM, avg, smoothstep(0.14, 0.45, lMax - lMin) * 0.28);
  // Subtle cinematic dark vignette framing 2.5D vista edges
  float vig = 1.0 - smoothstep(0.55, 1.25, length(vUv - 0.5) * 1.45) * 0.22;
  fragColor = vec4(col * vig, 1.0);
}
`;

function compileShader(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(`Shader error: ${gl.getShaderInfoLog(sh)}`);
  return sh;
}

function linkProgram(gl: WebGL2RenderingContext, vsSrc: string, fsSrc: string): WebGLProgram {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vsSrc);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSrc);
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(`Program link error: ${gl.getProgramInfoLog(prog)}`);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  return prog;
}

interface GpuMesh {
  vao: WebGLVertexArrayObject;
  shadowVao: WebGLVertexArrayObject;
  indexCount: number;
}

function uploadMesh(gl: WebGL2RenderingContext, mesh: BuiltMesh): GpuMesh {
  const vbo = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, mesh.vertices, gl.STATIC_DRAW);
  const ebo = gl.createBuffer()!;
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);

  const stride = VERT_STRIDE * 4;
  const vao = gl.createVertexArray()!;
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, stride, 0);
  gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, stride, 12);
  gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 2, gl.FLOAT, false, stride, 24);
  gl.enableVertexAttribArray(3); gl.vertexAttribPointer(3, 3, gl.FLOAT, false, stride, 32);
  gl.enableVertexAttribArray(4); gl.vertexAttribPointer(4, 1, gl.FLOAT, false, stride, 44);
  gl.enableVertexAttribArray(5); gl.vertexAttribPointer(5, 1, gl.FLOAT, false, stride, 48);

  const shadowVao = gl.createVertexArray()!;
  gl.bindVertexArray(shadowVao);
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, stride, 0);

  gl.bindVertexArray(null);
  return { vao, shadowVao, indexCount: mesh.indexCount };
}

function createLightSphere(gl: WebGL2RenderingContext, instVbo: WebGLBuffer): { vao: WebGLVertexArrayObject; indexCount: number } {
  const verts: number[] = [];
  const inds: number[] = [];
  const latB = 10, lonB = 14;
  for (let lat = 0; lat <= latB; lat++) {
    const t = (lat * Math.PI) / latB;
    for (let lon = 0; lon <= lonB; lon++) {
      const p = (lon * Math.PI * 2) / lonB;
      verts.push(Math.cos(p) * Math.sin(t), Math.cos(t), Math.sin(p) * Math.sin(t));
    }
  }
  for (let lat = 0; lat < latB; lat++) {
    for (let lon = 0; lon < lonB; lon++) {
      const a = lat * (lonB + 1) + lon;
      const b = a + lonB + 1;
      inds.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const vbo = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
  const ebo = gl.createBuffer()!;
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(inds), gl.STATIC_DRAW);

  const vao = gl.createVertexArray()!;
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 12, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, instVbo);
  gl.enableVertexAttribArray(6); gl.vertexAttribPointer(6, 4, gl.FLOAT, false, 32, 0); gl.vertexAttribDivisor(6, 1);
  gl.enableVertexAttribArray(7); gl.vertexAttribPointer(7, 4, gl.FLOAT, false, 32, 16); gl.vertexAttribDivisor(7, 1);
  gl.bindVertexArray(null);
  return { vao, indexCount: inds.length };
}

export class PromenadeRenderer {
  private readonly gl: WebGL2RenderingContext;
  readonly scene: PromenadeScene;
  readonly atlas: ProceduralAtlas;

  private readonly opqGpu: GpuMesh;
  private readonly transGpu: GpuMesh;
  private readonly wheelGpu: GpuMesh;
  private readonly sheepGpu: GpuMesh;
  private readonly heroTorsoGpu: GpuMesh;
  private readonly heroLegGpu: GpuMesh;
  private readonly heroArmGpu: GpuMesh;

  private readonly albedoTex: WebGLTexture;
  private readonly normalTex: WebGLTexture;
  private readonly matTex: WebGLTexture;
  private readonly aiBgTex: WebGLTexture;
  aiBgReady = false;

  private readonly shadowProg: WebGLProgram;
  private readonly gbufProg: WebGLProgram;
  private readonly baseLightProg: WebGLProgram;
  private readonly pointLightProg: WebGLProgram;
  private readonly transProg: WebGLProgram;
  private readonly particleProg: WebGLProgram;
  private readonly toneMapProg: WebGLProgram;

  private readonly quadVao: WebGLVertexArrayObject;
  private readonly shadowFbo: WebGLFramebuffer;
  private readonly shadowTex: WebGLTexture;
  private readonly lightSphereVao: WebGLVertexArrayObject;
  private readonly lightSphereIdxCount: number;
  private readonly lightInstVbo: WebGLBuffer;
  private readonly lightInstData = new Float32Array(MAX_LIGHTS * 8);

  private readonly particleVao: WebGLVertexArrayObject;
  private readonly particleInstVbo: WebGLBuffer;
  private readonly particleData = new Float32Array(900 * 7);

  private rtW = 0;
  private rtH = 0;
  private readonly gbufFbo: WebGLFramebuffer;
  private readonly rt0Tex: WebGLTexture;
  private readonly rt1Tex: WebGLTexture;
  private readonly rt2Tex: WebGLTexture;
  private readonly gDepthTex: WebGLTexture;
  private readonly lightFbo: WebGLFramebuffer;
  private readonly lightDepthFbo: WebGLFramebuffer;
  private readonly hdrTex: WebGLTexture;
  private readonly useFloatHdr: boolean;

  private readonly modelMat = new Float32Array(16);
  private readonly projMat = new Float32Array(16);
  private readonly viewMat = new Float32Array(16);
  private readonly vpMat = new Float32Array(16);
  private readonly invVpMat = new Float32Array(16);
  private readonly lightProjMat = new Float32Array(16);
  private readonly lightViewMat = new Float32Array(16);
  private readonly lightVpMat = new Float32Array(16);
  private readonly lightMvpMat = new Float32Array(16);

  constructor(canvas: HTMLCanvasElement, scene: PromenadeScene, onBgReady?: () => void) {
    const gl = canvas.getContext('webgl2', {
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    if (!gl) throw new Error('WebGL2 required');
    this.gl = gl;
    this.scene = scene;

    this.useFloatHdr = !!(gl.getExtension('EXT_color_buffer_float') && gl.getExtension('EXT_float_blend'));
    const anisoExt = gl.getExtension('EXT_texture_filter_anisotropic');
    const maxAniso = anisoExt ? Math.min(16, gl.getParameter(anisoExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT)) : 1;

    this.atlas = buildProceduralAtlas();
    const uploadTex = (src: TexImageSource | Uint8Array, fmt: number) => {
      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      if (src instanceof Uint8Array) {
        gl.texImage2D(gl.TEXTURE_2D, 0, fmt, this.atlas.size, this.atlas.size, 0, fmt, gl.UNSIGNED_BYTE, src);
      } else {
        gl.texImage2D(gl.TEXTURE_2D, 0, fmt, fmt, gl.UNSIGNED_BYTE, src);
      }
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      if (anisoExt) gl.texParameterf(gl.TEXTURE_2D, anisoExt.TEXTURE_MAX_ANISOTROPY_EXT, maxAniso);
      return tex;
    };

    this.albedoTex = uploadTex(this.atlas.albedoCanvas, gl.RGBA);
    this.normalTex = uploadTex(this.atlas.normalData, gl.RGBA);
    this.matTex = uploadTex(this.atlas.materialData, gl.RGBA);

    // Load AI Concept Painting Panorama plate cleanly with safe fallback pixel
    this.aiBgTex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.aiBgTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([38, 48, 66, 255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const bgImg = new Image();
    bgImg.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, this.aiBgTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bgImg);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      this.aiBgReady = true;
      onBgReady?.();
    };
    bgImg.src = './assets/bg_dales_dusk.png';

    // Upload Static + Dynamic Meshes
    this.opqGpu = uploadMesh(gl, scene.opaque);
    this.transGpu = uploadMesh(gl, scene.trans);
    this.wheelGpu = uploadMesh(gl, scene.waterwheel);
    this.sheepGpu = uploadMesh(gl, scene.sheepMesh);
    this.heroTorsoGpu = uploadMesh(gl, scene.heroTorso);
    this.heroLegGpu = uploadMesh(gl, scene.heroLeg);
    this.heroArmGpu = uploadMesh(gl, scene.heroArmLantern);

    this.lightInstVbo = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.lightInstVbo);
    gl.bufferData(gl.ARRAY_BUFFER, this.lightInstData.byteLength, gl.DYNAMIC_DRAW);
    const sp = createLightSphere(gl, this.lightInstVbo);
    this.lightSphereVao = sp.vao;
    this.lightSphereIdxCount = sp.indexCount;

    // Snow & Kiln Ember Particles VAO
    const qVbo = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, qVbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]), gl.STATIC_DRAW);
    this.particleInstVbo = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.particleInstVbo);
    gl.bufferData(gl.ARRAY_BUFFER, this.particleData.byteLength, gl.DYNAMIC_DRAW);
    this.particleVao = gl.createVertexArray()!;
    gl.bindVertexArray(this.particleVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, qVbo);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 8, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.particleInstVbo);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 28, 0); gl.vertexAttribDivisor(1, 1);
    gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 28, 12); gl.vertexAttribDivisor(2, 1);
    gl.bindVertexArray(null);

    this.quadVao = gl.createVertexArray()!;

    this.shadowProg = linkProgram(gl, SHADOW_VS, SHADOW_FS);
    this.gbufProg = linkProgram(gl, GBUF_VS, GBUF_FS);
    this.baseLightProg = linkProgram(gl, FS_QUAD_VS, DEFERRED_BASE_FS);
    this.pointLightProg = linkProgram(gl, POINT_LIGHT_VS, POINT_LIGHT_FS);
    this.transProg = linkProgram(gl, TRANS_VS, TRANS_FS);
    this.particleProg = linkProgram(gl, PARTICLE_VS, PARTICLE_FS);
    this.toneMapProg = linkProgram(gl, FS_QUAD_VS, TONE_MAP_FS);

    this.shadowTex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.shadowTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, SHADOW_SIZE, SHADOW_SIZE, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    this.shadowFbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.shadowFbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.shadowTex, 0);
    gl.drawBuffers([gl.NONE]);
    gl.readBuffer(gl.NONE);

    this.gbufFbo = gl.createFramebuffer()!;
    this.lightFbo = gl.createFramebuffer()!;
    this.lightDepthFbo = gl.createFramebuffer()!;
    this.rt0Tex = gl.createTexture()!;
    this.rt1Tex = gl.createTexture()!;
    this.rt2Tex = gl.createTexture()!;
    this.gDepthTex = gl.createTexture()!;
    this.hdrTex = gl.createTexture()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  private ensureTargets(w: number, h: number): void {
    if (this.rtW === w && this.rtH === h) return;
    this.rtW = w;
    this.rtH = h;
    const gl = this.gl;
    const setupColor = (tex: WebGLTexture, intFmt: number, fmt: number, type: number) => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, intFmt, w, h, 0, fmt, type, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    };

    setupColor(this.rt0Tex, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE);
    setupColor(this.rt1Tex, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE);
    setupColor(this.rt2Tex, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE);

    gl.bindTexture(gl.TEXTURE_2D, this.gDepthTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, w, h, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.gbufFbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.rt0Tex, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, this.rt1Tex, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT2, gl.TEXTURE_2D, this.rt2Tex, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.gDepthTex, 0);
    gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1, gl.COLOR_ATTACHMENT2]);

    if (this.useFloatHdr) setupColor(this.hdrTex, gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT);
    else setupColor(this.hdrTex, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.lightFbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.hdrTex, 0);
    gl.drawBuffers([gl.COLOR_ATTACHMENT0]);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.lightDepthFbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.hdrTex, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.gDepthTex, 0);
    gl.drawBuffers([gl.COLOR_ATTACHMENT0]);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  screenToWalkPoint(clientX: number, clientY: number, rect: DOMRect, cam: CameraPose): { x: number; z: number } | null {
    const nx = ((clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
    const ny = 1 - ((clientY - rect.top) / Math.max(1, rect.height)) * 2;
    const aspect = rect.width / Math.max(1, rect.height);
    const fovy = aspect < 0.85 ? (50 * Math.PI) / 180 : (42 * Math.PI) / 180;
    mat4Perspective(this.projMat, fovy, aspect, 0.3, 200.0);
    mat4LookAt(this.viewMat, [cam.x, cam.y, cam.z], [cam.targetX, cam.targetY, cam.targetZ], [0, 1, 0]);
    mat4Mul(this.vpMat, this.projMat, this.viewMat);
    mat4Invert(this.invVpMat, this.vpMat);

    const unproj = (ndcZ: number): [number, number, number] => {
      const m = this.invVpMat;
      const w = nx * m[3] + ny * m[7] + ndcZ * m[11] + m[15];
      return [
        (nx * m[0] + ny * m[4] + ndcZ * m[8] + m[12]) / w,
        (nx * m[1] + ny * m[5] + ndcZ * m[9] + m[13]) / w,
        (nx * m[2] + ny * m[6] + ndcZ * m[10] + m[14]) / w,
      ];
    };
    const p0 = unproj(-1);
    const p1 = unproj(1);
    const dy = p1[1] - p0[1];
    if (Math.abs(dy) < 1e-5) return null;
    const tHit = (0.08 - p0[1]) / dy;
    if (tHit < 0) return null;
    const hz = Math.max(-23.5, Math.min(21.5, p0[2] + (p1[2] - p0[2]) * tHit));
    const cx = laneCenterX(hz);
    const hx = Math.max(cx - 2.1, Math.min(cx + 2.1, p0[0] + (p1[0] - p0[0]) * tHit));
    return { x: hx, z: hz };
  }

  render(
    t: number,
    mode: SceneMode,
    bgMode: BgMode,
    cam: CameraPose,
    mousePx: number,
    mousePy: number,
    playerX: number,
    playerZ: number,
    playerYaw: number,
    walkSpeed: number,
    kilnBoost: number,
    width: number,
    height: number,
  ): void {
    const gl = this.gl;
    this.ensureTargets(width, height);

    const atmo = computeAtmosphere(t, mode);
    const wrappedT = wrapTime(t);
    const phase = wrappedT / LOOP_DURATION;
    const hdrScale = this.useFloatHdr ? 1.0 : 0.25;

    const aspect = width / Math.max(1, height);
    const fovy = aspect < 0.85 ? (50 * Math.PI) / 180 : (42 * Math.PI) / 180;
    mat4Perspective(this.projMat, fovy, aspect, 0.3, 200.0);
    mat4LookAt(this.viewMat, [cam.x, cam.y, cam.z], [cam.targetX, cam.targetY, cam.targetZ], [0, 1, 0]);
    mat4Mul(this.vpMat, this.projMat, this.viewMat);
    mat4Invert(this.invVpMat, this.vpMat);

    const camRight: [number, number, number] = [this.viewMat[0], this.viewMat[4], this.viewMat[8]];
    const camUp: [number, number, number] = [this.viewMat[1], this.viewMat[5], this.viewMat[9]];

    // Shadow matrix centered ahead of camera along the deep -Z winding corridor
    const shCenterZ = Math.max(-22, Math.min(18, cam.targetZ));
    const shCenterX = laneCenterX(shCenterZ);
    const sunEye: [number, number, number] = [
      shCenterX + atmo.sunDir[0] * 52,
      atmo.sunDir[1] * 52,
      shCenterZ + atmo.sunDir[2] * 52,
    ];
    mat4LookAt(this.lightViewMat, sunEye, [shCenterX, 1.0, shCenterZ], [0, 1, 0]);
    mat4Ortho(this.lightProjMat, -26, 26, -26, 26, 6, 125);
    mat4Mul(this.lightVpMat, this.lightProjMat, this.lightViewMat);

    // Prepare Animated Draw Calls
    interface EntityDraw { gpu: GpuMesh; mat: Float32Array }
    const entityDraws: EntityDraw[] = [];

    // 1. Waterwheel (2 rotations per 24s)
    {
      const wm = new Float32Array(16);
      const [wx, wy, wz] = this.scene.wheelPivot;
      mat4TRS(wm, wx, wy, wz, 0, 0, -phase * 2 * Math.PI * 2);
      entityDraws.push({ gpu: this.wheelGpu, mat: wm });
    }
    // 2. Sheep
    for (const sh of this.scene.sheepSpots) {
      const sm = new Float32Array(16);
      mat4TRS(sm, sh.x, 0.0, sh.z, 0, sh.yaw + Math.sin((phase * 2 + sh.phase) * Math.PI * 2) * 0.25, 0);
      entityDraws.push({ gpu: this.sheepGpu, mat: sm });
    }
    // 3. Articulated Hero + Hand Lantern
    const heroY = walkGroundHeightAt(playerZ);
    const swing = walkSpeed > 0.1 ? Math.sin(wrappedT * 8.5) * 0.55 : Math.sin(phase * Math.PI * 4) * 0.04;
    {
      const hm = new Float32Array(16);
      mat4TRS(hm, playerX, heroY + Math.abs(swing) * 0.05, playerZ, 0, playerYaw, 0);
      entityDraws.push({ gpu: this.heroTorsoGpu, mat: hm });

      const cYaw = Math.cos(playerYaw), sYaw = Math.sin(playerYaw);
      for (const side of [-1, 1]) {
        const lm = new Float32Array(16);
        mat4TRS(lm, playerX + side * 0.11 * cYaw, heroY + 0.52, playerZ - side * 0.11 * sYaw, side * swing, playerYaw, 0);
        entityDraws.push({ gpu: this.heroLegGpu, mat: lm });
      }
      const am = new Float32Array(16);
      mat4TRS(am, playerX + 0.24 * cYaw, heroY + 0.98, playerZ - 0.24 * sYaw, -swing * 0.35, playerYaw, 0);
      entityDraws.push({ gpu: this.heroArmGpu, mat: am });
    }

    // Populate Dynamic + Static Analytic Point Lights
    let lightCount = 0;
    const pushLight = (x: number, y: number, z: number, r: number, g: number, b: number, radius: number, intensity: number) => {
      if (lightCount >= MAX_LIGHTS || intensity <= 0.02) return;
      let p = lightCount * 8;
      this.lightInstData[p++] = x;
      this.lightInstData[p++] = y;
      this.lightInstData[p++] = z;
      this.lightInstData[p++] = radius;
      this.lightInstData[p++] = r;
      this.lightInstData[p++] = g;
      this.lightInstData[p++] = b;
      this.lightInstData[p++] = intensity;
      lightCount++;
    };

    const flicker = 0.92 + 0.10 * Math.sin(wrappedT * 11.3) + 0.06 * Math.cos(wrappedT * 23.7);
    for (const ld of this.scene.lights) {
      if (ld.kind === 'kiln') {
        const kInt = ld.intensity * (0.85 + 0.45 * atmo.lightsIntensity) * flicker * (1.0 + kilnBoost * 0.85);
        pushLight(ld.x, ld.y, ld.z, ld.r, ld.g, ld.b, ld.radius + kilnBoost * 1.6, kInt);
      } else {
        const uDist = Math.abs(ld.z - atmo.umbraCx);
        const uMul = mode === 'eclipse' ? Math.max(atmo.lightsIntensity, 1.0 - smoothstep(4, 14, uDist)) : atmo.lightsIntensity;
        pushLight(ld.x, ld.y, ld.z, ld.r, ld.g, ld.b, ld.radius, ld.intensity * uMul);
      }
    }
    // Dynamic Player Handheld Brass Lantern Light!
    pushLight(
      playerX + Math.sin(playerYaw) * 0.45,
      heroY + 0.72,
      playerZ + Math.cos(playerYaw) * 0.45,
      1.0,
      0.74,
      0.34,
      5.4,
      2.1 * Math.max(0.45, atmo.lightsIntensity),
    );

    // -------- PASS 1: 2048px Directional Shadow Map --------
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.shadowFbo);
    gl.viewport(0, 0, SHADOW_SIZE, SHADOW_SIZE);
    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.clear(gl.DEPTH_BUFFER_BIT);

    gl.useProgram(this.shadowProg);
    const shLoc = gl.getUniformLocation(this.shadowProg, 'uMVP');
    gl.uniformMatrix4fv(shLoc, false, this.lightVpMat);
    gl.bindVertexArray(this.opqGpu.shadowVao);
    gl.drawElements(gl.TRIANGLES, this.opqGpu.indexCount, gl.UNSIGNED_INT, 0);

    for (const d of entityDraws) {
      mat4Mul(this.lightMvpMat, this.lightVpMat, d.mat);
      gl.uniformMatrix4fv(shLoc, false, this.lightMvpMat);
      gl.bindVertexArray(d.gpu.shadowVao);
      gl.drawElements(gl.TRIANGLES, d.gpu.indexCount, gl.UNSIGNED_INT, 0);
    }

    // -------- PASS 2: MRT G-Buffer Geometry Pass --------
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.gbufFbo);
    gl.viewport(0, 0, width, height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    gl.useProgram(this.gbufProg);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.albedoTex);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.normalTex);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, this.matTex);
    gl.uniform1i(gl.getUniformLocation(this.gbufProg, 'uAlbedoAtlas'), 0);
    gl.uniform1i(gl.getUniformLocation(this.gbufProg, 'uNormalAtlas'), 1);
    gl.uniform1i(gl.getUniformLocation(this.gbufProg, 'uMatAtlas'), 2);
    gl.uniformMatrix4fv(gl.getUniformLocation(this.gbufProg, 'uVP'), false, this.vpMat);
    gl.uniform1f(gl.getUniformLocation(this.gbufProg, 'uLightsIntensity'), atmo.lightsIntensity);
    gl.uniform3fv(gl.getUniformLocation(this.gbufProg, 'uKilnPos'), this.scene.kilnPos);
    gl.uniform1f(gl.getUniformLocation(this.gbufProg, 'uKilnBoost'), kilnBoost);

    const gModelLoc = gl.getUniformLocation(this.gbufProg, 'uModel');
    mat4TRS(this.modelMat, 0, 0, 0, 0, 0, 0);
    gl.uniformMatrix4fv(gModelLoc, false, this.modelMat);
    gl.bindVertexArray(this.opqGpu.vao);
    gl.drawElements(gl.TRIANGLES, this.opqGpu.indexCount, gl.UNSIGNED_INT, 0);

    for (const d of entityDraws) {
      gl.uniformMatrix4fv(gModelLoc, false, d.mat);
      gl.bindVertexArray(d.gpu.vao);
      gl.drawElements(gl.TRIANGLES, d.gpu.indexCount, gl.UNSIGNED_INT, 0);
    }

    // -------- PASS 3: Deferred Base Lighting + Plane 1 Dual Backdrop + 8-Tap SSAO --------
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.lightFbo);
    gl.viewport(0, 0, width, height);
    gl.disable(gl.DEPTH_TEST);
    gl.depthMask(false);
    gl.disable(gl.CULL_FACE);

    gl.useProgram(this.baseLightProg);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.rt0Tex);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.rt1Tex);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, this.rt2Tex);
    gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, this.gDepthTex);
    gl.activeTexture(gl.TEXTURE4); gl.bindTexture(gl.TEXTURE_2D, this.shadowTex);
    gl.activeTexture(gl.TEXTURE5); gl.bindTexture(gl.TEXTURE_2D, this.aiBgTex);

    gl.uniform1i(gl.getUniformLocation(this.baseLightProg, 'uRT0'), 0);
    gl.uniform1i(gl.getUniformLocation(this.baseLightProg, 'uRT1'), 1);
    gl.uniform1i(gl.getUniformLocation(this.baseLightProg, 'uRT2'), 2);
    gl.uniform1i(gl.getUniformLocation(this.baseLightProg, 'uGDepth'), 3);
    gl.uniform1i(gl.getUniformLocation(this.baseLightProg, 'uShadowMap'), 4);
    gl.uniform1i(gl.getUniformLocation(this.baseLightProg, 'uAiBgTex'), 5);
    gl.uniformMatrix4fv(gl.getUniformLocation(this.baseLightProg, 'uInvVP'), false, this.invVpMat);
    gl.uniformMatrix4fv(gl.getUniformLocation(this.baseLightProg, 'uVP'), false, this.vpMat);
    gl.uniformMatrix4fv(gl.getUniformLocation(this.baseLightProg, 'uLightVP'), false, this.lightVpMat);
    gl.uniform3f(gl.getUniformLocation(this.baseLightProg, 'uCameraPos'), cam.x, cam.y, cam.z);
    gl.uniform3fv(gl.getUniformLocation(this.baseLightProg, 'uSunDir'), atmo.sunDir);
    gl.uniform3fv(gl.getUniformLocation(this.baseLightProg, 'uSunColor'), atmo.sunColor);
    gl.uniform1f(gl.getUniformLocation(this.baseLightProg, 'uSunIntensity'), atmo.sunIntensity);
    gl.uniform3fv(gl.getUniformLocation(this.baseLightProg, 'uAmbientCool'), atmo.ambientCool);
    gl.uniform3fv(gl.getUniformLocation(this.baseLightProg, 'uFogColor'), atmo.fogColor);
    gl.uniform3fv(gl.getUniformLocation(this.baseLightProg, 'uBgGrade'), atmo.bgGrade);
    gl.uniform1f(gl.getUniformLocation(this.baseLightProg, 'uStarVis'), atmo.starVis);
    gl.uniform2f(gl.getUniformLocation(this.baseLightProg, 'uUmbra'), atmo.umbraCx, atmo.umbraStrength);
    gl.uniform1i(gl.getUniformLocation(this.baseLightProg, 'uBgMode'), bgMode === 'ai' ? 0 : 1);
    gl.uniform1f(gl.getUniformLocation(this.baseLightProg, 'uPhase'), phase);
    const camYaw = Math.atan2(cam.targetX - cam.x, Math.max(0.5, -(cam.targetZ - cam.z)));
    const valleyDepth = Math.max(0, Math.min(1, (22 - cam.z) / 44));
    gl.uniform1f(gl.getUniformLocation(this.baseLightProg, 'uMousePx'), mousePx);
    gl.uniform1f(gl.getUniformLocation(this.baseLightProg, 'uMousePy'), mousePy);
    gl.uniform1f(gl.getUniformLocation(this.baseLightProg, 'uCamYaw'), camYaw);
    gl.uniform1f(gl.getUniformLocation(this.baseLightProg, 'uValleyDepth'), valleyDepth);
    gl.uniform1f(gl.getUniformLocation(this.baseLightProg, 'uHdrScale'), hdrScale);
    gl.uniform2f(gl.getUniformLocation(this.baseLightProg, 'uResolution'), width, height);

    gl.bindVertexArray(this.quadVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // -------- PASS 4: Full-Resolution Analytic Point Light Spheres --------
    if (lightCount > 0) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.lightInstVbo);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.lightInstData.subarray(0, lightCount * 8));
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);
      gl.enable(gl.CULL_FACE);
      gl.cullFace(gl.FRONT);

      gl.useProgram(this.pointLightProg);
      gl.uniform1i(gl.getUniformLocation(this.pointLightProg, 'uRT0'), 0);
      gl.uniform1i(gl.getUniformLocation(this.pointLightProg, 'uRT1'), 1);
      gl.uniform1i(gl.getUniformLocation(this.pointLightProg, 'uGDepth'), 3);
      gl.uniformMatrix4fv(gl.getUniformLocation(this.pointLightProg, 'uVP'), false, this.vpMat);
      gl.uniformMatrix4fv(gl.getUniformLocation(this.pointLightProg, 'uInvVP'), false, this.invVpMat);
      gl.uniform3f(gl.getUniformLocation(this.pointLightProg, 'uCameraPos'), cam.x, cam.y, cam.z);
      gl.uniform2f(gl.getUniformLocation(this.pointLightProg, 'uResolution'), width, height);
      gl.uniform1f(gl.getUniformLocation(this.pointLightProg, 'uHdrScale'), hdrScale);

      gl.bindVertexArray(this.lightSphereVao);
      gl.drawElementsInstanced(gl.TRIANGLES, this.lightSphereIdxCount, gl.UNSIGNED_INT, 0, lightCount);
      gl.disable(gl.BLEND);
      gl.cullFace(gl.BACK);
    }

    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, null);

    // -------- PASS 5: Forward Water, Conservatory Glass, 3-Plane Snowflakes & Kiln Embers --------
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.lightDepthFbo);
    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(false);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    gl.useProgram(this.transProg);
    mat4TRS(this.modelMat, 0, 0, 0, 0, 0, 0);
    gl.uniformMatrix4fv(gl.getUniformLocation(this.transProg, 'uModel'), false, this.modelMat);
    gl.uniformMatrix4fv(gl.getUniformLocation(this.transProg, 'uVP'), false, this.vpMat);
    gl.uniform3f(gl.getUniformLocation(this.transProg, 'uCameraPos'), cam.x, cam.y, cam.z);
    gl.uniform3fv(gl.getUniformLocation(this.transProg, 'uSunDir'), atmo.sunDir);
    gl.uniform3fv(gl.getUniformLocation(this.transProg, 'uSunColor'), atmo.sunColor);
    gl.uniform1f(gl.getUniformLocation(this.transProg, 'uSunIntensity'), atmo.sunIntensity);
    gl.uniform3fv(gl.getUniformLocation(this.transProg, 'uFogColor'), atmo.fogColor);
    gl.uniform1f(gl.getUniformLocation(this.transProg, 'uLightsIntensity'), atmo.lightsIntensity);
    gl.uniform1f(gl.getUniformLocation(this.transProg, 'uPhase'), phase);
    gl.uniform1f(gl.getUniformLocation(this.transProg, 'uHdrScale'), hdrScale);
    gl.bindVertexArray(this.transGpu.vao);
    gl.drawElements(gl.TRIANGLES, this.transGpu.indexCount, gl.UNSIGNED_INT, 0);

    // 720 3-Plane Winter Snowflakes + 40 Rising Glowing Kiln Embers!
    gl.disable(gl.CULL_FACE);
    const pArr = this.particleData;
    const totalP = 760;
    const fracHash = (k: number, a: number, b: number) => {
      const s = Math.sin(k * a + b) * 43758.5453123;
      return s - Math.floor(s);
    };
    for (let i = 0; i < totalP; i++) {
      let ptr = i * 7;
      if (i < 720) {
        const s1 = fracHash(i, 127.1, 311.7);
        const s2 = fracHash(i, 269.5, 183.3);
        const s3 = fracHash(i, 419.2, 371.9);
        const fallCycles = 2.6 + s3 * 2.2;
        const life = (phase * fallCycles + s1) % 1;
        const pz = cam.z - 1.4 - s3 * 25.0; // Distributed through camera forward -Z corridor frustum!
        const px = cam.targetX + (s2 - 0.5) * 24.0 + Math.sin(life * Math.PI * 2 + i * 0.7) * 0.75 - life * 1.4;
        const py = 9.0 - life * 9.4;
        pArr[ptr++] = px;
        pArr[ptr++] = py;
        pArr[ptr++] = pz;
        pArr[ptr++] = 0.86;
        pArr[ptr++] = 0.91;
        pArr[ptr++] = 1.0;
        pArr[ptr++] = cam.z - pz < 5.0 ? 0.044 + s2 * 0.020 : 0.022 + s2 * 0.015;
      } else {
        const ei = i - 720;
        const eLife = (phase * 8 + ei / 40) % 1;
        const [kx, ky, kz] = this.scene.kilnPos;
        pArr[ptr++] = kx + 0.55 + Math.sin(eLife * 9.0 + ei) * (0.20 + eLife * 0.50);
        pArr[ptr++] = ky + eLife * (2.6 + kilnBoost * 1.6);
        pArr[ptr++] = kz + Math.cos(eLife * 7.0 + ei) * 0.30;
        pArr[ptr++] = 1.8 * (1 - eLife * 0.4);
        pArr[ptr++] = 0.65 * (1 - eLife * 0.6);
        pArr[ptr++] = 0.14;
        pArr[ptr++] = 0.042 * (1 - eLife * 0.65);
      }
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.particleInstVbo);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, pArr.subarray(0, totalP * 7));
    gl.useProgram(this.particleProg);
    gl.uniformMatrix4fv(gl.getUniformLocation(this.particleProg, 'uVP'), false, this.vpMat);
    gl.uniform3fv(gl.getUniformLocation(this.particleProg, 'uCamRight'), camRight);
    gl.uniform3fv(gl.getUniformLocation(this.particleProg, 'uCamUp'), camUp);
    gl.uniform1f(gl.getUniformLocation(this.particleProg, 'uHdrScale'), hdrScale);
    gl.bindVertexArray(this.particleVao);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, totalP);

    gl.disable(gl.BLEND);
    gl.depthMask(true);

    // -------- PASS 6: Final ACES Filmic Tone-Mapping + Subtle Edge AA + Vignette --------
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, width, height);
    gl.disable(gl.DEPTH_TEST);
    gl.useProgram(this.toneMapProg);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.hdrTex);
    gl.uniform1i(gl.getUniformLocation(this.toneMapProg, 'uHdrTex'), 0);
    gl.uniform1f(gl.getUniformLocation(this.toneMapProg, 'uInvHdrScale'), this.useFloatHdr ? 1.0 : 4.0);
    gl.uniform2f(gl.getUniformLocation(this.toneMapProg, 'uInvRes'), 1 / Math.max(1, width), 1 / Math.max(1, height));
    gl.bindVertexArray(this.quadVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
  }
}
