/**
 * The one wind, shared. A plain mutable object written by the master
 * timeline's onUpdate and read by both canvases (sheets + aurora ribbons)
 * inside the same GSAP tick — no React state, no re-renders, no drift
 * between the layers.
 */

export interface GustStore {
  /** current gust envelope value, 0..1 */
  g: number;
  /** master timeline progress, 0..1 — the virtual clock for both shaders */
  progress: number;
}

export function createGustStore(): GustStore {
  return { g: 0, progress: 0 };
}
