/**
 * Minimal 2D simplex noise — inlined to avoid dependency overhead.
 * Returns values in [-1, 1]. Based on Stefan Gustavson's implementation.
 */

const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;

// Permutation table (doubled to avoid wrapping)
const perm = new Uint8Array(512);
const grad2 = [
  [1, 1], [-1, 1], [1, -1], [-1, -1],
  [1, 0], [-1, 0], [0, 1], [0, -1],
];

// Seed the permutation table (deterministic)
const p = new Uint8Array(256);
for (let i = 0; i < 256; i++) p[i] = i;
// Fisher-Yates shuffle with a fixed seed
let seed = 42;
for (let i = 255; i > 0; i--) {
  seed = (seed * 16807 + 0) % 2147483647;
  const j = seed % (i + 1);
  [p[i], p[j]] = [p[j], p[i]];
}
for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

function dot2(g: number[], x: number, y: number): number {
  return g[0] * x + g[1] * y;
}

export function noise2D(xin: number, yin: number): number {
  const s = (xin + yin) * F2;
  const i = Math.floor(xin + s);
  const j = Math.floor(yin + s);
  const t = (i + j) * G2;

  const X0 = i - t;
  const Y0 = j - t;
  const x0 = xin - X0;
  const y0 = yin - Y0;

  const i1 = x0 > y0 ? 1 : 0;
  const j1 = x0 > y0 ? 0 : 1;

  const x1 = x0 - i1 + G2;
  const y1 = y0 - j1 + G2;
  const x2 = x0 - 1.0 + 2.0 * G2;
  const y2 = y0 - 1.0 + 2.0 * G2;

  const ii = i & 255;
  const jj = j & 255;

  let n0 = 0, n1 = 0, n2 = 0;

  let t0 = 0.5 - x0 * x0 - y0 * y0;
  if (t0 >= 0) {
    t0 *= t0;
    const gi0 = perm[ii + perm[jj]] % 8;
    n0 = t0 * t0 * dot2(grad2[gi0], x0, y0);
  }

  let t1 = 0.5 - x1 * x1 - y1 * y1;
  if (t1 >= 0) {
    t1 *= t1;
    const gi1 = perm[ii + i1 + perm[jj + j1]] % 8;
    n1 = t1 * t1 * dot2(grad2[gi1], x1, y1);
  }

  let t2 = 0.5 - x2 * x2 - y2 * y2;
  if (t2 >= 0) {
    t2 *= t2;
    const gi2 = perm[ii + 1 + perm[jj + 1]] % 8;
    n2 = t2 * t2 * dot2(grad2[gi2], x2, y2);
  }

  // Scale to [-1, 1]
  return 70.0 * (n0 + n1 + n2);
}
