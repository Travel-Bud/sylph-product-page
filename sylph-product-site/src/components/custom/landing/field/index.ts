/**
 * The field — a reusable generative centrepiece for marketing surfaces.
 *
 * Pick a source (where particles rest), hand it to <FieldCanvas>, drive
 * `resolve` from scroll if the piece has a story. That is the whole API.
 *
 * Scope note: this belongs to the marketing surface only. The app's admin and
 * finance pages stay institutional and undecorated per the Page Layout
 * Standard — do not import this under /dashboard or /admin.
 */
export { ParticleField, FieldCanvas } from "./particle-field";
export type { ParticleFieldProps, FieldCanvasProps } from "./particle-field";
export { waveGrid, filaments, driftVolume, markFromImage } from "./sources";
export type { FieldSource } from "./sources";
export {
  useMarkSource,
  usePrefersReducedMotion,
  useScrollProgress,
  useWindowProgress,
  easeOutCubic,
} from "./use-field";
export { NOISE_GLSL } from "./noise";
