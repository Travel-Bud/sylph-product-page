/**
 * The paper sheets' look — ONE InstancedMesh, one compile, one draw call.
 * Vertex: phase-driven envelope (corner peel → carried bend + long body wave
 * + ripple + twist — the two long edges are never both straight mid-flight).
 * Fragment: paper body ramp → aurora illumination → a dissolve that reads as
 * BECOMING LIGHT: anisotropic streak erosion drifting off the trailing edge,
 * hue melting toward the ribbon color, a wide feathered edge (never a neon
 * rim), and a terminal fade so nothing lingers as specks.
 *
 * The load-bearing contract: at aPhase = 0 the shader outputs EXACTLY the
 * sampled texel with zero displacement — the DOM→GL swap is pixel-identical
 * by construction. Everything phase-driven starts strictly after 0.
 *
 * Color/blend recipe (checkpoint-1 hardened): premultiplied texture upload,
 * NoColorSpace raw round-trip, premultiplied blending, depth fully off.
 */

import {
  CanvasTexture,
  Color,
  DynamicDrawUsage,
  InstancedBufferAttribute,
  LinearFilter,
  LinearMipmapLinearFilter,
  NoColorSpace,
  PlaneGeometry,
  ShaderMaterial,
} from "three";
import type { RowAtlas } from "./capture";
import type { FlightParams } from "./params";

export function atlasTexture(atlas: RowAtlas): CanvasTexture {
  const tex = new CanvasTexture(atlas.canvas);
  tex.colorSpace = NoColorSpace; // raw bytes in, raw bytes out
  tex.premultiplyAlpha = true; // linear filtering never fringes glyph edges
  tex.flipY = false; // rects are top-origin; the shader flips per-sheet
  tex.generateMipmaps = true;
  tex.minFilter = LinearMipmapLinearFilter;
  tex.magFilter = LinearFilter;
  tex.anisotropy = 4;
  return tex;
}

/** Shared unit-plane geometry with per-instance attributes for `count` sheets. */
export function sheetGeometry(
  atlas: RowAtlas,
  seeds: number[],
  stiffness: number[],
  segments: [number, number],
): { geometry: PlaneGeometry; phaseAttr: InstancedBufferAttribute } {
  const count = atlas.rects.length;
  const geometry = new PlaneGeometry(1, 1, segments[0], segments[1]);
  const rect = new Float32Array(count * 4);
  const size = new Float32Array(count * 2);
  const card = new Float32Array(count * 2);
  const seed = new Float32Array(count);
  const stiff = new Float32Array(count);
  const phase = new Float32Array(count); // dynamic — the orchestrator drives it
  for (let i = 0; i < count; i++) {
    const r = atlas.rects[i];
    rect.set([r.u, r.v, r.uw, r.vh], i * 4);
    size.set([atlas.sizes[i].w, atlas.sizes[i].h], i * 2);
    /* the receipt the row becomes: mockup proportions (~3:2 paper note),
       seeded per sheet — deterministic, replay-identical */
    const fr = (k: number) => {
      const x = Math.sin(seeds[i] * 127.1 + k * 311.7) * 43758.5453;
      return x - Math.floor(x);
    };
    card.set([118 + fr(1) * 40, 78 + fr(2) * 28], i * 2);
    seed[i] = seeds[i];
    stiff[i] = stiffness[i];
  }
  geometry.setAttribute("aRect", new InstancedBufferAttribute(rect, 4));
  geometry.setAttribute("aSize", new InstancedBufferAttribute(size, 2));
  geometry.setAttribute("aCard", new InstancedBufferAttribute(card, 2));
  geometry.setAttribute("aSeed", new InstancedBufferAttribute(seed, 1));
  geometry.setAttribute("aStiffness", new InstancedBufferAttribute(stiff, 1));
  const phaseAttr = new InstancedBufferAttribute(phase, 1);
  phaseAttr.setUsage(DynamicDrawUsage);
  geometry.setAttribute("aPhase", phaseAttr);
  return { geometry, phaseAttr };
}

const VERTEX = /* glsl */ `
  attribute vec4 aRect;
  attribute vec2 aSize;
  attribute vec2 aCard;
  attribute float aSeed;
  attribute float aStiffness;
  attribute float aPhase;

  uniform float uPeelAmp;
  uniform float uBendAmp;
  uniform float uFoldSharp;
  uniform float uFoldAngle;
  uniform float uRippleAmp;
  uniform float uRippleFreq;
  uniform float uWaveAmp;
  uniform float uWaveFreq;
  uniform float uTwistAmp;
  uniform float uDissolveStart;

  varying vec2 vUv;
  varying vec4 vRect;
  varying float vPhase;
  varying float vSeed;
  varying float vCurve;
  varying float vMorph;

  void main() {
    vUv = uv;
    vRect = aRect;
    vPhase = aPhase;
    vSeed = aSeed;
    float soft = 1.0 - aStiffness;
    /* dissolve-thinning: the sheet narrows as it melts — the far-arc slips */
    float thin = 1.0 - smoothstep(uDissolveStart, 1.0, aPhase) * 0.5;

    /* ROW → RECEIPT — the paper the wind actually carries (owner's call,
       matching the mockups): the captured row is a 10:1 plank only for the
       swap instant; as it lifts, the plane compacts to a seeded receipt-note
       proportion (the fragment crossfades the print in step). Zero at
       aPhase = 0 — the swap frame is untouched. */
    float morphT = smoothstep(0.05, 0.24, aPhase);
    vMorph = morphT;
    vec2 eff = mix(aSize, aCard, morphT);
    vec3 p = vec3(position.x * eff.x, position.y * eff.y * thin, 0.0);
    float carryT = smoothstep(0.08, 0.3, aPhase);
    float z = 0.0;
    float hingeGlow = 0.0;

    /* peel: the downwind corner lifts off the glass first, then relaxes */
    float peelT = smoothstep(0.0, 0.16, aPhase) * (1.0 - 0.4 * smoothstep(0.3, 0.7, aPhase));
    float dCorner = distance(uv, vec2(1.0, 1.0)) * 1.2;
    float lift = pow(max(1.0 - dCorner, 0.0), 2.0);
    z += uPeelAmp * peelT * lift;

    /* carry: a bend around a slowly rotating axis — uFoldSharp morphs it
       from a soft bow into a crisp crease (the reference fold states) */
    float axisA = aSeed * 6.2831 + aPhase * 2.2;
    vec2 axis = vec2(cos(axisA), sin(axisA));
    float s = dot(uv - 0.5, axis);
    float bendPx = uBendAmp * 24.0 * soft * carryT;
    float bow = s * s * 2.6;
    float crease = max(0.5 - abs(s), 0.0) * 2.2;
    z += bendPx * mix(bow, crease, uFoldSharp);

    /* long wave through the WHOLE body — no straight edges mid-flight */
    float wave = uWaveAmp * soft * carryT *
                 sin(uv.x * uWaveFreq * 6.2831 + aPhase * 9.0 + aSeed * 6.2831);
    z += wave;

    /* short ripple, stiffening toward the leading edge */
    float lead = smoothstep(-0.5, 0.15, s);
    float ripple = uRippleAmp * soft * carryT * lead *
                   sin(s * uRippleFreq * 6.2831 + aPhase * 14.0 + aSeed * 9.4);
    z += ripple;

    /* hyperbolic twist across the sheet */
    float twist = uTwistAmp * soft * carryT * sin(aPhase * 5.0 + aSeed * 4.7);
    z += twist * (uv.x - 0.5) * (uv.y - 0.5) * 4.0;

    p.z = z;

    /* curvature proxy feeding the rim light */
    vCurve =
      (abs(bendPx * 5.2 * s) + abs(wave) * 2.0 + abs(ripple) * 2.5 + abs(twist) + hingeGlow * 14.0) *
      0.02;

    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(p, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  precision highp float;

  uniform sampler2D uMap;    // premultiplied atlas
  uniform float uBodyRamp;
  uniform float uDissolveStart;
  uniform float uEdgeWidth;
  uniform float uErodeScale;
  uniform float uErodeElong;
  uniform float uTrailBias;
  uniform float uHuePull;
  uniform float uIllum;
  uniform vec3 uGlowColor;

  varying vec2 vUv;
  varying vec4 vRect;
  varying float vPhase;
  varying float vSeed;
  varying float vCurve;
  varying float vMorph;

  /* same constant family as seeded() in wind-sweep.ts — one entropy family */
  float vhash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(vhash(i), vhash(i + vec2(1.0, 0.0)), u.x),
               mix(vhash(i + vec2(0.0, 1.0)), vhash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  void main() {
    vec2 tuv = vec2(vRect.x + vUv.x * vRect.z, vRect.y + (1.0 - vUv.y) * vRect.w);
    vec4 tex = texture2D(uMap, tuv);

    /* paper body: a translucent leaf fades in beneath the glyphs — frozen
       frames read as paper, not floating text */
    float body = smoothstep(0.02, 0.12, vPhase) * uBodyRamp;
    vec4 paper = vec4(vec3(0.955, 0.975, 0.960) * body, body);
    vec4 col = tex + paper * (1.0 - tex.a);

    /* THE RECEIPT — the print the row becomes (the mockups' paper note):
       near-opaque warm-white body, ruled text lines with seeded lengths, a
       total bar low-left. Premultiplied, like everything in this pipeline. */
    {
      float rBody = 0.93;
      vec3 rPaper = vec3(0.972, 0.985, 0.975);
      /* ruled lines inside an inset box (uv.y = 1 is the TOP of the note:
         lines fill the upper body, the total bar sits low) */
      float rows = 6.0;
      float rowI = floor((0.9 - vUv.y) / 0.5 * rows);
      float rowF = fract((0.9 - vUv.y) / 0.5 * rows);
      float inBand = step(0.4, vUv.y) * step(vUv.y, 0.9);
      float lineLen = 0.62 + vhash(vec2(vSeed * 9.13, rowI)) * 0.26;
      float inLine = inBand * step(0.35, rowF) * step(rowF, 0.62)
                   * step(0.12, vUv.x) * step(vUv.x, lineLen + 0.12);
      /* the total bar */
      float inTotal = step(0.16, vUv.y) * step(vUv.y, 0.23)
                    * step(0.12, vUv.x) * step(vUv.x, 0.5);
      float ink = clamp(inLine * 0.34 + inTotal * 0.5, 0.0, 0.55);
      vec3 rCol = mix(rPaper, vec3(0.13, 0.22, 0.17), ink);
      /* a soft diagonal fold shadow, like the mockups' crease gradient */
      float diag = dot(vUv, vec2(0.8, 0.45));
      float crease = exp(-pow((diag - 0.62) * 7.0, 2.0)) * 0.13;
      rCol *= 1.0 - crease;
      vec4 receipt = vec4(rCol * rBody, rBody);
      col = mix(col, receipt, vMorph);
    }

    /* illumination: paper-toned and legible near the panel, brightening only
       DOWNSTREAM — the flight ends at the coil's eye now, so brightness IS
       proximity to the portal; paper stays paper for most of the arc (the
       curvature rim light is gated the same way — no green before the coil) */
    float airT = smoothstep(0.55, 0.95, vPhase);
    col.rgb += uGlowColor * airT * (uIllum + vCurve) * col.a;

    /* dissolve → light. Anisotropic streak cells (elongated along the wind)
       drift backward off the trailing edge, which erodes first; the sheet's
       remaining color melts toward the ribbon hue; the edge is a WIDE soft
       feather, never a rim; a terminal fade leaves nothing behind. */
    float d = smoothstep(uDissolveStart, 0.98, vPhase);
    vec2 nUv = vec2(vUv.x * uErodeScale * (10.0 / max(uErodeElong, 1.0)),
                    vUv.y * uErodeScale);
    nUv.x -= d * 1.3; // streaks blow backward as it melts
    float n = mix(uEdgeWidth + 0.001, 1.0, vnoise(nUv + vSeed * 7.31));
    n -= (1.0 - vUv.x) * uTrailBias * d; // upwind edge lets go first
    float alive = smoothstep(d, d + uEdgeWidth, n);
    float tail = 1.0 - smoothstep(0.9, 1.0, vPhase);

    /* melt the remaining paper toward the light it is joining */
    float luma = dot(col.rgb, vec3(0.299, 0.587, 0.114));
    col.rgb = mix(col.rgb, uGlowColor * max(luma, 0.22 * col.a), d * uHuePull);

    col *= alive * tail;

    /* soft luminous breath where the paper is currently letting go */
    float edgeGlow = alive * (1.0 - alive);
    col.rgb += uGlowColor * edgeGlow * (0.18 + 0.4 * airT) * tail;

    gl_FragColor = col;
  }
`;

export interface SheetMaterialHandle {
  material: ShaderMaterial;
  /** live-retune from the leva panel without a rebuild */
  updateParams(p: FlightParams): void;
}

export function createSheetMaterial(texture: CanvasTexture, p: FlightParams): SheetMaterialHandle {
  const material = new ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    uniforms: {
      uMap: { value: texture },
      uPeelAmp: { value: p.paper.peelAmp },
      uBendAmp: { value: p.paper.bendAmp },
      uFoldSharp: { value: p.paper.foldSharp },
      uFoldAngle: { value: p.paper.foldAngle },
      uRippleAmp: { value: p.paper.rippleAmp },
      uRippleFreq: { value: p.paper.rippleFreq },
      uWaveAmp: { value: p.paper.waveAmp },
      uWaveFreq: { value: p.paper.waveFreq },
      uTwistAmp: { value: p.paper.twistAmp },
      uBodyRamp: { value: p.paper.bodyRamp },
      uDissolveStart: { value: p.dissolve.start },
      uEdgeWidth: { value: p.dissolve.edgeWidth },
      uErodeScale: { value: p.dissolve.erodeScale },
      uErodeElong: { value: p.dissolve.erodeElong },
      uTrailBias: { value: p.dissolve.trailBias },
      uHuePull: { value: p.dissolve.huePull },
      uIllum: { value: p.dissolve.illum },
      uGlowColor: { value: new Color(p.dissolve.glowColor) },
    },
    transparent: true,
    premultipliedAlpha: true,
    depthWrite: false,
    depthTest: false,
  });
  const updateParams = (np: FlightParams) => {
    const u = material.uniforms;
    u.uPeelAmp.value = np.paper.peelAmp;
    u.uBendAmp.value = np.paper.bendAmp;
    u.uFoldSharp.value = np.paper.foldSharp;
    u.uFoldAngle.value = np.paper.foldAngle;
    u.uRippleAmp.value = np.paper.rippleAmp;
    u.uRippleFreq.value = np.paper.rippleFreq;
    u.uWaveAmp.value = np.paper.waveAmp;
    u.uWaveFreq.value = np.paper.waveFreq;
    u.uTwistAmp.value = np.paper.twistAmp;
    u.uBodyRamp.value = np.paper.bodyRamp;
    u.uDissolveStart.value = np.dissolve.start;
    u.uEdgeWidth.value = np.dissolve.edgeWidth;
    u.uErodeScale.value = np.dissolve.erodeScale;
    u.uErodeElong.value = np.dissolve.erodeElong;
    u.uTrailBias.value = np.dissolve.trailBias;
    u.uHuePull.value = np.dissolve.huePull;
    u.uIllum.value = np.dissolve.illum;
    (u.uGlowColor.value as Color).set(np.dissolve.glowColor);
  };
  return { material, updateParams };
}
