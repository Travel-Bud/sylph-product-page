/**
 * Source generators for the particle field.
 *
 * A source answers one question: where does each particle REST? Everything
 * after that — displacement, pointer force, resolve — is the shader's job.
 * Swapping the source is what changes the piece; the engine never changes.
 *
 * Every generator returns the same three buffers so <ParticleField> can hold
 * one geometry shape regardless of what is feeding it.
 */

export type FieldSource = {
  /** xyz rest positions, length = count * 3 */
  positions: Float32Array;
  /** per-particle 0..1 constant — breaks up uniform motion and sizing */
  seeds: Float32Array;
  /** per-particle 0..1 constant — drives the colorA -> colorB ramp */
  tones: Float32Array;
  /**
   * per-particle 0..1 alpha multiplier — how a source shapes its OWN density.
   *
   * This is the difference between a field and a rectangle of static. A field
   * with hard edges reads as a texture swatch; one that thins toward its
   * boundaries reads as a thing suspended in air. The shader has no idea where
   * a source's edges are, so the source has to say.
   */
  fades: Float32Array;
  count: number;
};

function alloc(count: number): FieldSource {
  return {
    positions: new Float32Array(count * 3),
    seeds: new Float32Array(count),
    tones: new Float32Array(count),
    fades: new Float32Array(count),
    count,
  };
}

/** smoothstep, for shaping density falloff on the CPU side */
function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * A jittered lattice on the XY plane with a shallow z-spread.
 *
 * Read straight on this is the "wave field" archetype: the shader's fbm pushes
 * y hard and the z-spread supplies parallax, so the lattice reads as layered
 * ribbons of air rather than a flat plane of dots.
 */
export function waveGrid({
  count = 42000,
  width = 26,
  height = 11,
  depth = 5,
}: { count?: number; width?: number; height?: number; depth?: number } = {}): FieldSource {
  const aspect = width / height;
  const rows = Math.max(2, Math.round(Math.sqrt(count / aspect)));
  const cols = Math.max(2, Math.round(count / rows));
  const total = rows * cols;
  const src = alloc(total);

  let i = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // (0..1) lattice coordinate, jittered by up to one cell so the grid
      // never shows itself as a grid.
      const u = (c + (Math.random() - 0.5) * 0.9) / (cols - 1);
      const v = (r + (Math.random() - 0.5) * 0.9) / (rows - 1);

      src.positions[i * 3] = (u - 0.5) * width;
      src.positions[i * 3 + 1] = (v - 0.5) * height;
      src.positions[i * 3 + 2] = (Math.random() - 0.5) * depth;

      src.seeds[i] = Math.random();
      // tone follows height: the ramp reads as a light source above the field
      src.tones[i] = v;
      // thin toward all four edges so the lattice has no visible boundary
      src.fades[i] =
        smoothstep(0, 0.22, u) * smoothstep(1, 0.78, u) *
        smoothstep(0, 0.18, v) * smoothstep(1, 0.82, v);
      i++;
    }
  }
  return src;
}

/**
 * Parallel filaments — points strung tightly ALONG lines, lines spaced apart.
 *
 * This is the source that actually reproduces the reel's wave. A uniform
 * lattice displaced by noise reads as static, because every particle moves
 * independently of its neighbours at the eye's scale. Points packed along a
 * line move together, so the noise bends the LINE — and a bent line is a
 * ribbon. Same shader, same particle count, completely different object.
 *
 * `sag` bows each filament at its centre so the resting state already has a
 * curve in it; without it a still field is a stack of straight rules.
 */
export function filaments({
  count = 46000,
  lines = 130,
  width = 30,
  height = 11,
  depth = 6,
  sag = 0.22,
  wander = 0.5,
}: {
  count?: number;
  lines?: number;
  width?: number;
  height?: number;
  depth?: number;
  sag?: number;
  wander?: number;
} = {}): FieldSource {
  const perLine = Math.max(2, Math.floor(count / lines));
  const total = lines * perLine;
  const src = alloc(total);

  let i = 0;
  for (let l = 0; l < lines; l++) {
    const lv = l / (lines - 1);
    // uneven line spacing — evenly spaced lines read as a printed rule pattern
    const baseY = (lv - 0.5) * height + (Math.random() - 0.5) * (height / lines) * wander * 2;
    const lineZ = (Math.random() - 0.5) * depth;
    const lineSag = sag * (0.6 + Math.random() * 0.8);
    const phase = Math.random() * Math.PI * 2;

    for (let p = 0; p < perLine; p++) {
      const u = p / (perLine - 1);
      const x = (u - 0.5) * width;

      // a shallow arc plus one slow sine so no two filaments share a silhouette
      const arc = -Math.sin(u * Math.PI) * lineSag * height * 0.5;
      const ripple = Math.sin(u * Math.PI * 2 + phase) * height * 0.018;

      src.positions[i * 3] = x;
      src.positions[i * 3 + 1] = baseY + arc + ripple;
      src.positions[i * 3 + 2] = lineZ + (Math.random() - 0.5) * 0.35;

      src.seeds[i] = Math.random();
      src.tones[i] = lv;
      // fade the ends of every filament, and the field's top and bottom lines
      src.fades[i] =
        smoothstep(0, 0.16, u) * smoothstep(1, 0.84, u) *
        smoothstep(0, 0.12, lv) * smoothstep(1, 0.88, lv);
      i++;
    }
  }
  return src;
}

/**
 * Points scattered through a flattened ellipsoid shell.
 *
 * Weighted toward the surface (cbrt bias) so the volume has a visible skin
 * instead of a dense fog core — that skin is what catches the pointer light.
 */
export function driftVolume({
  count = 36000,
  radius = 6.2,
  flatten = 0.62,
  shell = 0.55,
}: { count?: number; radius?: number; flatten?: number; shell?: number } = {}): FieldSource {
  const src = alloc(count);

  for (let i = 0; i < count; i++) {
    // uniform direction on the sphere
    const theta = Math.random() * Math.PI * 2;
    const z = Math.random() * 2 - 1;
    const s = Math.sqrt(1 - z * z);

    // cbrt gives uniform volume density; lerping it toward 1 pulls mass outward
    const t = Math.cbrt(Math.random());
    const r = radius * (t * (1 - shell) + shell);

    src.positions[i * 3] = Math.cos(theta) * s * r;
    src.positions[i * 3 + 1] = z * r * flatten;
    src.positions[i * 3 + 2] = Math.sin(theta) * s * r * 0.8;

    src.seeds[i] = Math.random();
    src.tones[i] = (z + 1) / 2;
    // interior points fade out; the shell keeps full alpha
    src.fades[i] = 0.35 + smoothstep(shell, 1, t) * 0.65;
  }
  return src;
}

/**
 * Rest positions sampled from the opaque pixels of an image.
 *
 * This is the dot-portrait source: point an SVG mark or a photo at it and the
 * field settles into that shape. Samples ALPHA, not luminance, so transparent
 * PNGs and `fill="currentColor"` SVGs both work without a colour assumption.
 *
 * Browser-only (needs canvas + Image). Callers should treat it as async data
 * and render nothing until it resolves.
 */
export async function markFromImage(
  src: string,
  {
    count = 40000,
    width = 12,
    height = 12,
    raster = 320,
    alphaThreshold = 0.35,
    jitter = 0.4,
  }: {
    count?: number;
    width?: number;
    height?: number;
    raster?: number;
    alphaThreshold?: number;
    jitter?: number;
  } = {},
): Promise<FieldSource> {
  const img = await loadImage(src, raster);

  const canvas = document.createElement("canvas");
  const ratio = img.height / img.width || 1;
  canvas.width = raster;
  canvas.height = Math.max(1, Math.round(raster * ratio));

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("markFromImage: 2d context unavailable");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Collect every pixel above threshold once, then sample from that pool.
  // Rejection-sampling straight into the output stalls badly on sparse marks.
  const pool: number[] = [];
  for (let p = 0; p < canvas.width * canvas.height; p++) {
    if (data[p * 4 + 3] / 255 >= alphaThreshold) pool.push(p);
  }
  if (pool.length === 0) throw new Error(`markFromImage: no pixels above alpha ${alphaThreshold}`);

  const out = alloc(count);
  const cellW = width / canvas.width;
  const cellH = height / canvas.height;

  for (let i = 0; i < count; i++) {
    const p = pool[(Math.random() * pool.length) | 0];
    const px = p % canvas.width;
    const py = (p / canvas.width) | 0;

    // image space is y-down, world space is y-up
    const x = (px / canvas.width - 0.5) * width + (Math.random() - 0.5) * cellW * jitter * 2;
    const y = (0.5 - py / canvas.height) * height + (Math.random() - 0.5) * cellH * jitter * 2;

    out.positions[i * 3] = x;
    out.positions[i * 3 + 1] = y * (canvas.height / canvas.width) * (width / height);
    out.positions[i * 3 + 2] = (Math.random() - 0.5) * 0.9;

    out.seeds[i] = Math.random();
    // tone by luminance so a photo keeps its light; a flat mark ramps by height
    const lum = (data[p * 4] * 0.299 + data[p * 4 + 1] * 0.587 + data[p * 4 + 2] * 0.114) / 255;
    out.tones[i] = lum > 0.02 ? lum : 1 - py / canvas.height;
    // partially-transparent edge pixels carry less weight, which is what keeps
    // an anti-aliased mark's outline soft instead of stepped
    out.fades[i] = 0.45 + (data[p * 4 + 3] / 255) * 0.55;
  }
  return out;
}

function loadImage(src: string, fallbackSize: number): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // SVGs without width/height attributes decode at 0x0 in some engines;
      // give them an explicit box before anyone tries to draw them.
      if (!img.width || !img.height) {
        img.width = fallbackSize;
        img.height = fallbackSize;
      }
      resolve(img);
    };
    img.onerror = () => reject(new Error(`markFromImage: failed to load ${src}`));
    img.src = src;
  });
}
