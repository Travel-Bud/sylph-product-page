/**
 * The wind — a deterministic curl-noise flow field plus the gust envelope,
 * precomputed into per-sheet flight paths.
 *
 * Determinism contract (the product claim "run it again — same 214, same 3"):
 *  - the ONLY entropy is `seeded(i, k)` from wind-sweep.ts;
 *  - paths are integrated at a FIXED number of virtual steps — never frame dt,
 *    never wall clock; two calls with the same inputs are byte-equal
 *    (guarded by __tests__/flight-field.test.ts);
 *  - playback samples the precomputed arrays by phase ∈ [0,1] via Catmull-Rom,
 *    so scrubbing, playing, and replaying all read identical geometry.
 *
 * Coordinates are WORLD px (the pixel-mapped camera: 1 unit = 1 CSS px,
 * +y up, +x right). Paths are RELATIVE to the sheet's spawn center.
 * `fitToRoom` rescales a path so the sheet always dissolves INSIDE the frame
 * — cleared rows join the air, they never exit it.
 */

import { seeded } from "../wind-sweep";

export const PATH_STEPS = 64;

export interface GustShape {
  /** total travel of an unconstrained sheet over its full flight, px */
  strength: number;
  /** envelope fractions of the flight window */
  attack: number;
  peak: number;
  decay: number; // implied: 1 - attack - peak; kept for the leva panel's shape read
}

export interface FieldShape {
  /** spatial frequency of the potential, 1/px */
  noiseScale: number;
  /** curl contribution relative to base wind (same px-over-flight units) */
  curlIntensity: number;
  /** how fast the field evolves over one flight */
  fieldTimeScale: number;
  /** wind heading LATE in the flight, degrees CCW from +x (y up) */
  baseWindAngleDeg: number;
  /** extra climb EARLY in the flight — the heading eases from
      (base + climbBoost) down to base, so the stream rises off the panel
      steeply and bends over to follow the ribbon band (one arced gust) */
  climbBoostDeg: number;
}

export interface FlutterShape {
  /** per-sheet stiffness sampled in [min, max]; 1 = rigid */
  stiffnessMin: number;
  stiffnessMax: number;
  /** tumble/flutter angular amplitude, radians, scaled by (1 − stiffness) */
  flutterAmp: number;
  /** how strongly the sheet banks into its direction of travel */
  bankGain: number;
  /** rotisserie turns over one flight (about the sheet's long axis) — some
      sheets flip fully edge-on mid-air, the strongest paper tell */
  tumble: number;
}

export interface Room {
  /** available travel from spawn center in each world direction, px (≥ 0) */
  left: number;
  right: number;
  up: number;
  down: number;
}

export interface SheetPath {
  /** PATH_STEPS × (x, y, z) relative to spawn center */
  pos: Float32Array;
  /** PATH_STEPS × (rx, ry, rz) radians */
  rot: Float32Array;
  /** the sheet's seeded stiffness (the material reads it too) */
  stiffness: number;
}

/* ---------------------------------------------------------------- gust --- */

/** One breath: builds, crests sharply, trails off. s ∈ [0,1] → [0,1]. */
export function gustEnvelope(s: number, g: GustShape): number {
  const a = Math.max(g.attack, 1e-4);
  const p = a + Math.max(g.peak, 1e-4);
  if (s <= 0) return 0;
  if (s < a) {
    const t = s / a;
    return 0.92 * t * t * (3 - 2 * t);
  }
  if (s < p) {
    const t = (s - a) / (p - a);
    return 0.92 + 0.08 * Math.sin(t * Math.PI); // the crest
  }
  const u = Math.min((s - p) / Math.max(1 - p, 1e-4), 1);
  const f = 1 - u;
  return (0.92 - 0.06) * f * f + 0.06; // trails off to a light tail, never dead
}

/* --------------------------------------------------------------- noise --- */

const fract = (x: number) => x - Math.floor(x);

/** seeded 3D lattice hash — same constant family as seeded() */
function hash3(x: number, y: number, z: number, fieldSeed: number): number {
  return fract(Math.sin(x * 127.1 + y * 311.7 + z * 74.7 + fieldSeed * 43.13) * 43758.5453);
}

function noise3(x: number, y: number, z: number, fs: number): number {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const w = zf * zf * (3 - 2 * zf);
  const n = (dx: number, dy: number, dz: number) => hash3(xi + dx, yi + dy, zi + dz, fs);
  const x00 = n(0, 0, 0) + u * (n(1, 0, 0) - n(0, 0, 0));
  const x10 = n(0, 1, 0) + u * (n(1, 1, 0) - n(0, 1, 0));
  const x01 = n(0, 0, 1) + u * (n(1, 0, 1) - n(0, 0, 1));
  const x11 = n(0, 1, 1) + u * (n(1, 1, 1) - n(0, 1, 1));
  const y0 = x00 + v * (x10 - x00);
  const y1 = x01 + v * (x11 - x01);
  return y0 + w * (y1 - y0); // 0..1
}

/** divergence-free 2D curl of the scalar potential (z = time axis) */
function curl2(x: number, y: number, t: number, fs: number): [number, number] {
  const e = 0.35;
  const dy = noise3(x, y + e, t, fs) - noise3(x, y - e, t, fs);
  const dx = noise3(x + e, y, t, fs) - noise3(x - e, y, t, fs);
  return [dy / (2 * e), -dx / (2 * e)];
}

/** One place computes a sheet's stiffness — the path integrator AND the
    material's per-instance attribute must agree on it. */
export function sheetStiffness(
  index: number,
  range: { stiffnessMin: number; stiffnessMax: number },
): number {
  return range.stiffnessMin + seeded(index, 21) * (range.stiffnessMax - range.stiffnessMin);
}

/* --------------------------------------------------------------- paths --- */

export interface PathParams {
  gust: GustShape;
  field: FieldShape;
  flutter: FlutterShape;
  /** one shared field seed — one wind for every sheet */
  fieldSeed?: number;
}

/**
 * Integrate one sheet's flight at PATH_STEPS fixed virtual steps.
 * `index` is the sheet's global index (the seed); `spawnAbs` is the sheet's
 * spawn center in world px (the field is sampled in absolute space so
 * neighboring sheets ride the SAME wind, not clones of it).
 */
export function precomputePath(
  index: number,
  spawnAbs: { x: number; y: number },
  room: Room,
  p: PathParams,
): SheetPath {
  const fs = p.fieldSeed ?? 7.31;
  const r = (k: number) => seeded(index, k);
  const stiffness = sheetStiffness(index, p.flutter);
  const soft = 1 - stiffness;

  /* one shared stream: heading arcs from steep climb to the band's sweep;
     per-sheet jitter stays SMALL so sheets string along one gust, not many */
  const thetaBase = (p.field.baseWindAngleDeg * Math.PI) / 180 + (r(22) - 0.5) * 0.14;
  const climb = ((p.field.climbBoostDeg ?? 0) * Math.PI) / 180;
  /** every third-ish sheet resists, then yields (kept from the DOM sweep) */
  const counter = index % 3 === 2;
  const counterKick = counter ? 0.35 + r(23) * 0.3 : 0;
  /** small offsets: sheets ride the SAME eddies a beat apart */
  const off = [r(24) * 9.1, r(25) * 7.3];

  const pos = new Float32Array(PATH_STEPS * 3);
  const rot = new Float32Array(PATH_STEPS * 3);

  let x = 0, y = 0;
  const dt = 1 / (PATH_STEPS - 1);
  let vx = 0, vy = 0;

  for (let k = 1; k < PATH_STEPS; k++) {
    const s = k * dt;
    const g = gustEnvelope(s, p.gust);
    /* the arc: steep lift-off easing over into the band's direction */
    const theta = thetaBase + climb * Math.pow(1 - s, 1.4);
    const dir = [Math.cos(theta), Math.sin(theta)];
    const [cx, cy] = curl2(
      (spawnAbs.x + x) * p.field.noiseScale + off[0],
      (spawnAbs.y + y) * p.field.noiseScale + off[1],
      s * p.field.fieldTimeScale,
      fs,
    );
    vx = dir[0] * p.gust.strength * g + cx * p.field.curlIntensity * (0.35 + 0.65 * g);
    vy = dir[1] * p.gust.strength * g + cy * p.field.curlIntensity * (0.35 + 0.65 * g);
    if (counterKick > 0) {
      const resist = Math.pow(Math.max(1 - s * 2.4, 0), 2);
      vx -= dir[0] * p.gust.strength * counterKick * resist;
      vy -= dir[1] * p.gust.strength * counterKick * resist;
    }
    x += vx * dt;
    y += vy * dt;
    const z = Math.sin(s * Math.PI * (1 + r(26))) * 24 * soft * (r(27) - 0.3);
    pos[k * 3] = x;
    pos[k * 3 + 1] = y;
    pos[k * 3 + 2] = z;
  }

  fitToRoom(pos, room);

  /* rotation: bank into travel + rotisserie tumble + seeded flutter, all
     ramping in from EXACTLY zero at s=0 (the swap frame must be
     transform-identical). The tumble is the strongest paper tell: some
     sheets roll fully edge-on mid-air, catching the light as thin glints. */
  const f1 = 2.2 + r(28) * 2.6;
  const f2 = 1.4 + r(29) * 2.0;
  const ph1 = r(30) * Math.PI * 2;
  const ph2 = r(31) * Math.PI * 2;
  const turns =
    p.flutter.tumble *
    (0.35 + r(32) * 0.65) *
    (r(33) > 0.45 ? 1 : 0.35) * // some sheets glide calm
    (r(34) > 0.5 ? 1 : -1);
  for (let k = 0; k < PATH_STEPS; k++) {
    const s = k * dt;
    const ramp = smooth01(s / 0.2);
    const g = gustEnvelope(s, p.gust);
    const kp = Math.max(k, 1);
    const tx = pos[kp * 3] - pos[(kp - 1) * 3];
    const ty = pos[kp * 3 + 1] - pos[(kp - 1) * 3 + 1];
    const bank = Math.atan2(ty, Math.abs(tx) + 1e-4) * p.flutter.bankGain;
    const amp = p.flutter.flutterAmp * soft * (0.35 + 0.65 * g);
    rot[k * 3] =
      ramp *
      (turns * Math.PI * 2 * s * soft + amp * 0.35 * Math.sin(s * Math.PI * 2 * f1 + ph1));
    rot[k * 3 + 1] = ramp * amp * Math.sin(s * Math.PI * 2 * f2 + ph2);
    rot[k * 3 + 2] = ramp * (bank + amp * 0.45 * Math.sin(s * Math.PI * 2 * f1 * 0.53 + ph2));
  }

  return { pos, rot, stiffness };
}

function smooth01(t: number): number {
  const c = Math.min(Math.max(t, 0), 1);
  return c * c * (3 - 2 * c);
}

/** scale a path (in place, per axis) so it never leaves the available room */
function fitToRoom(pos: Float32Array, room: Room): void {
  let maxX = 0, minX = 0, maxY = 0, minY = 0;
  for (let k = 0; k < pos.length; k += 3) {
    if (pos[k] > maxX) maxX = pos[k];
    if (pos[k] < minX) minX = pos[k];
    if (pos[k + 1] > maxY) maxY = pos[k + 1];
    if (pos[k + 1] < minY) minY = pos[k + 1];
  }
  const sx = Math.min(1, maxX > 0 ? room.right / maxX : 1, minX < 0 ? room.left / -minX : 1);
  const sy = Math.min(1, maxY > 0 ? room.up / maxY : 1, minY < 0 ? room.down / -minY : 1);
  if (sx < 1 || sy < 1) {
    for (let k = 0; k < pos.length; k += 3) {
      pos[k] *= sx;
      pos[k + 1] *= sy;
    }
  }
}

/* ------------------------------------------------------------- sampling --- */

export interface PathSample {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
}

/** Catmull-Rom over the precomputed steps; t ∈ [0,1]. */
export function samplePath(path: SheetPath, t: number, out: PathSample): PathSample {
  const c = Math.min(Math.max(t, 0), 1) * (PATH_STEPS - 1);
  const i1 = Math.min(Math.floor(c), PATH_STEPS - 2);
  const f = c - i1;
  const i0 = Math.max(i1 - 1, 0);
  const i2 = i1 + 1;
  const i3 = Math.min(i1 + 2, PATH_STEPS - 1);
  const cr = (a: number, b: number, m: number, d: number) => {
    const f2 = f * f;
    return (
      0.5 *
      (2 * b + (-a + m) * f + (2 * a - 5 * b + 4 * m - d) * f2 + (-a + 3 * b - 3 * m + d) * f2 * f)
    );
  };
  const g = (arr: Float32Array, comp: number) =>
    cr(arr[i0 * 3 + comp], arr[i1 * 3 + comp], arr[i2 * 3 + comp], arr[i3 * 3 + comp]);
  out.x = g(path.pos, 0);
  out.y = g(path.pos, 1);
  out.z = g(path.pos, 2);
  out.rx = g(path.rot, 0);
  out.ry = g(path.rot, 1);
  out.rz = g(path.rot, 2);
  return out;
}
