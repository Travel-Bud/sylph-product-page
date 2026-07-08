/**
 * DOM→texture capture for the paper flight. A row is captured in its resting
 * state via html-to-image's real-CSSOM rendering (fonts, tabular-nums, and
 * letter-spacing survive), with a TRANSPARENT background — the panel glass
 * stays visible beneath the spawned plane, so the composite at swap time is
 * identical by construction.
 *
 * Fidelity contract (checkpoint 1 measures this):
 *  - `document.fonts.ready` gates every capture; the font-embed CSS is
 *    built once per page and reused (30–150ms per call otherwise).
 *  - pixelRatio = min(devicePixelRatio, 2) — texels map 1:1 to device
 *    pixels at rest.
 *  - The capture CANVAS is the cached artifact (it survives GL context
 *    disposal, so replay-after-dispose re-uploads without re-capturing).
 *    Premultiplication and y-flip happen at texture upload via three's
 *    UNPACK path (sheetTexture) — no createImageBitmap options, so there is
 *    no cross-browser variance to carry.
 */

import { toCanvas, getFontEmbedCSS } from "html-to-image";

export interface RowCapture {
  /** straight-alpha capture — texture source AND the A/B diff reference */
  canvas: HTMLCanvasElement;
  /** CSS px size of the row at capture time */
  width: number;
  height: number;
  pixelRatio: number;
}

let fontCssPromise: Promise<string> | null = null;

/** Build (once) the @font-face CSS with same-origin woff2 inlined as data URLs. */
export function fontEmbedCss(scope: HTMLElement): Promise<string> {
  if (!fontCssPromise) {
    fontCssPromise = document.fonts.ready.then(() => getFontEmbedCSS(scope));
  }
  return fontCssPromise;
}

export function capturePixelRatio(): number {
  return Math.min(window.devicePixelRatio || 1, 2);
}

/**
 * Capture one row. Call while the row is in its resting state (no transforms)
 * — captures are taken during the pre-delay, before any shiver plays.
 */
export async function captureRow(row: HTMLElement, scope: HTMLElement): Promise<RowCapture> {
  const fontEmbedCSS = await fontEmbedCss(scope);
  const pixelRatio = capturePixelRatio();
  const rect = row.getBoundingClientRect();
  const canvas = await toCanvas(row, {
    pixelRatio,
    fontEmbedCSS,
    backgroundColor: undefined, // transparent — the glass shows through
    cacheBust: false,
  });
  return { canvas, width: rect.width, height: rect.height, pixelRatio };
}

/**
 * Capture many rows, idle-sliced (one macrotask between rows) so the main
 * thread breathes during the pre-delay window.
 */
export async function captureRows(
  rows: HTMLElement[],
  scope: HTMLElement,
  onProgress?: (done: number, total: number) => void,
): Promise<RowCapture[]> {
  const out: RowCapture[] = [];
  for (let i = 0; i < rows.length; i++) {
    out.push(await captureRow(rows[i], scope));
    onProgress?.(i + 1, rows.length);
    if (i < rows.length - 1) await new Promise((r) => setTimeout(r, 0));
  }
  return out;
}

/* ------------------------------------------------------------- atlas ----- */

export interface AtlasRect {
  /** uv rect with v measured from the TEXTURE TOP (flipY=false uploads):
      shader samples vec2(u + uv.x·uw, v + (1−uv.y)·vh) */
  u: number;
  v: number;
  uw: number;
  vh: number;
}

export interface RowAtlas {
  canvas: HTMLCanvasElement;
  rects: AtlasRect[];
  /** CSS px sheet sizes (texel size / pixelRatio) */
  sizes: { w: number; h: number }[];
  pixelRatio: number;
}

/** Gap between packed rows — wide enough that mip blending never bleeds. */
const ATLAS_GAP = 8;

/** Stack the captures into one texture (rows share a width; heights vary). */
export function buildAtlas(captures: RowCapture[]): RowAtlas {
  const width = Math.max(...captures.map((c) => c.canvas.width));
  const height =
    captures.reduce((sum, c) => sum + c.canvas.height, 0) + ATLAS_GAP * (captures.length - 1);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const rects: AtlasRect[] = [];
  const sizes: { w: number; h: number }[] = [];
  let y = 0;
  for (const c of captures) {
    ctx.drawImage(c.canvas, 0, y);
    rects.push({
      u: 0,
      v: y / height,
      uw: c.canvas.width / width,
      vh: c.canvas.height / height,
    });
    sizes.push({ w: c.canvas.width / c.pixelRatio, h: c.canvas.height / c.pixelRatio });
    y += c.canvas.height + ATLAS_GAP;
  }
  return { canvas, rects, sizes, pixelRatio: captures[0]?.pixelRatio ?? 1 };
}
