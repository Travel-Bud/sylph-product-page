"use client";

/**
 * The living vortex — a demand-rendered canvas nested inside `.wh-bg` (so it
 * inherits the hero's parallax scrub for free), sampling the already-loaded
 * aurora <img> as its texture.
 *
 * Three motions, one layer:
 *  - the coil CHURNS: differential rotation around the artwork's eye, built
 *    as a two-phase looping flow (each phase's wind-up resets while it is
 *    fully crossfaded out) — perpetual apparent spin, bounded distortion;
 *  - the ribbons breathe: the original seeded domain warp, always on;
 *  - the gust swells: luma-weighted brightness lift while the flight plays.
 *
 * Two clocks, deliberately: the GUST warp reads virtual timeline time
 * (deterministic, scrub-safe, owned by the orchestrator). The SPIN reads an
 * ambient clock that only ever accrues — timeline advances feed it deltas
 * during the flight, `ambient()` feeds it between flights — so the vortex
 * turns from first paint and never spins backward, even under scrubbing.
 * The determinism harness hashes the FLIGHT canvas, not this one; the
 * product claim (same 214, same 3) lives entirely over there.
 */

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  CanvasTexture,
  ClampToEdgeWrapping,
  LinearFilter,
  NoColorSpace,
  ShaderMaterial,
  type Texture,
  Vector2,
} from "three";
import type { GustStore } from "./gust-store";
import type { FlightParams } from "./params";

export interface AuroraApi {
  /** timeline-driven render (virtual ms — deterministic gust, spin accrues) */
  advance(virtualMs: number): void;
  /** idle-driven render between flights (delta ms — spin only) */
  ambient(deltaMs: number): void;
  updateParams(p: FlightParams): void;
  /** lab diagnostics only */
  _material?: ShaderMaterial;
}

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy * 2.0, 0.0, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  precision highp float;

  uniform sampler2D uMap;
  uniform vec2 uUvScale;
  uniform vec2 uUvOffset;
  uniform float uTime;      // virtual — timeline progress scaled
  uniform float uSpinTime;  // ambient — only ever grows
  uniform float uGust;      // gust envelope 0..1
  uniform float uDrift;
  uniform float uFlowGain;
  uniform float uSwell;
  uniform vec2 uVortex;     // eye, image UV (v measured from bottom)
  uniform float uAspect;    // image w/h — corrects UV space to circles
  uniform float uSpinTheta; // max wind-up per phase, radians at the core
  uniform float uSpinPeriod;
  uniform float uCore;      // rigid-rotation plateau radius
  uniform float uBand;      // decay band width (shear lives only here)

  varying vec2 vUv;

  float vhash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(vhash(i), vhash(i + vec2(1.0, 0.0)), u.x),
               mix(vhash(i + vec2(0.0, 1.0)), vhash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  vec2 spun(vec2 uv, float ang) {
    vec2 d = uv - uVortex;
    d.x *= uAspect;
    float ca = cos(ang), sa = sin(ang);
    d = vec2(ca * d.x - sa * d.y, sa * d.x + ca * d.y);
    d.x /= uAspect;
    return uVortex + d;
  }

  void main() {
    vec2 uv = vUv * uUvScale + uUvOffset;

    /* the coil's reach: rigid inside the core, letting go across the band */
    vec2 dv = uv - uVortex;
    dv.x *= uAspect;
    float r = length(dv);
    float fall = 1.0 - smoothstep(uCore, uCore + uBand, r);

    /* two-phase looping rotation — each phase winds up ±theta/2 and resets
       while fully faded out; together they read as one endless turn */
    float t1 = fract(uSpinTime / uSpinPeriod);
    float t2 = fract(uSpinTime / uSpinPeriod + 0.5);
    float wgt = abs(t1 * 2.0 - 1.0);
    float th = uSpinTheta * fall;
    vec2 uv1 = spun(uv, (t1 - 0.5) * th);
    vec2 uv2 = spun(uv, (t2 - 0.5) * th);

    /* the ribbons breathe: shared seeded warp (gust adds reach) */
    float w = uDrift + uGust * uFlowGain;
    vec2 warp = vec2(
      vnoise(uv * 3.0 + vec2(uTime * 0.7 + uSpinTime * 0.03, 0.0)),
      vnoise(uv * 3.0 + vec2(7.3, uTime * 0.6 + uSpinTime * 0.025))
    ) - 0.5;
    warp += 0.5 * (vec2(
      vnoise(uv * 7.0 + vec2(-uTime * 0.9 - uSpinTime * 0.04, 3.1)),
      vnoise(uv * 7.0 + vec2(uTime * 0.8 + uSpinTime * 0.035, 9.7))
    ) - 0.5);
    vec2 off = warp * w * 0.045;

    vec4 c1 = texture2D(uMap, uv1 + off);
    vec4 c2 = texture2D(uMap, uv2 + off);
    vec4 c = mix(c1, c2, wgt);

    float luma = dot(c.rgb, vec3(0.299, 0.587, 0.114));
    c.rgb *= 1.0 + uGust * uSwell * smoothstep(0.14, 0.55, luma);
    gl_FragColor = vec4(c.rgb, 1.0);
  }
`;

function RibbonQuad({
  img,
  gust,
  params,
  onReady,
}: {
  img: HTMLImageElement;
  gust: GustStore;
  params: FlightParams;
  onReady: (api: AuroraApi) => void;
}) {
  const three = useThree();
  const size = useThree((s) => s.size);
  const paramsRef = useRef(params);
  /* the ambient clock: seconds, only ever grows */
  const spinRef = useRef({ t: 0, lastVirtual: 0 });

  const material = useMemo(() => {
    /* snapshot the live <img> at its NATURAL size — a next/image `fill` img
       reports its LAYOUT size to three's sized upload path (INVALID_VALUE →
       black texture), and its responsive src can swap under us; a canvas
       copy costs no extra download and is stable */
    const src = document.createElement("canvas");
    src.width = img.naturalWidth || 2;
    src.height = img.naturalHeight || 2;
    src.getContext("2d")!.drawImage(img, 0, 0, src.width, src.height);
    const tex = new CanvasTexture(src);
    tex.colorSpace = NoColorSpace;
    tex.wrapS = ClampToEdgeWrapping;
    tex.wrapT = ClampToEdgeWrapping;
    tex.minFilter = LinearFilter;
    tex.magFilter = LinearFilter;
    tex.generateMipmaps = false;
    tex.needsUpdate = true;
    const p = paramsRef.current;
    const aspect = (img.naturalWidth || 1) / (img.naturalHeight || 1);
    return new ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms: {
        uMap: { value: tex },
        uUvScale: { value: new Vector2(1, 1) },
        uUvOffset: { value: new Vector2(0, 0) },
        uTime: { value: 0 },
        uSpinTime: { value: 0 },
        uGust: { value: 0 },
        uDrift: { value: p.bg.drift },
        uFlowGain: { value: p.bg.flowGain },
        uSwell: { value: p.bg.swell },
        uVortex: { value: new Vector2(p.vortex.xFrac, 1 - p.vortex.yFrac) },
        uAspect: { value: aspect },
        uSpinTheta: { value: p.bg.spinSpeed * p.bg.spinPeriod },
        uSpinPeriod: { value: p.bg.spinPeriod },
        uCore: { value: p.bg.coreRadius },
        uBand: { value: p.bg.bandWidth },
      },
      depthWrite: false,
      depthTest: false,
    });
  }, [img]);

  useEffect(() => {
    const tex = material.uniforms.uMap.value as Texture;
    return () => {
      material.dispose();
      tex.dispose();
    };
  }, [material]);

  /* object-fit: cover; object-position: center right — as a UV transform */
  useEffect(() => {
    const nw = img.naturalWidth || 1;
    const nh = img.naturalHeight || 1;
    const scale = Math.max(size.width / nw, size.height / nh);
    const dispW = nw * scale;
    const dispH = nh * scale;
    (material.uniforms.uUvScale.value as Vector2).set(size.width / dispW, size.height / dispH);
    (material.uniforms.uUvOffset.value as Vector2).set(
      (dispW - size.width) / dispW, // right-aligned
      (dispH - size.height) / 2 / dispH, // vertically centered
    );
  }, [img, material, size]);

  useFrame(() => {
    material.uniforms.uTime.value = gust.progress * 6.0;
    material.uniforms.uGust.value = gust.g;
    material.uniforms.uSpinTime.value = spinRef.current.t;
  });

  const readyOnce = useRef(false);
  useEffect(() => {
    if (readyOnce.current) return;
    readyOnce.current = true;
    onReady({
      advance: (ms) => {
        /* spin accrues through the flight but never rewinds under scrubbing */
        const spin = spinRef.current;
        spin.t += Math.max(0, ms - spin.lastVirtual) / 1000;
        spin.lastVirtual = ms;
        three.advance(ms);
      },
      ambient: (deltaMs) => {
        const spin = spinRef.current;
        spin.t += Math.max(0, deltaMs) / 1000;
        three.advance(spin.t * 1000);
      },
      updateParams: (p) => {
        paramsRef.current = p;
        material.uniforms.uDrift.value = p.bg.drift;
        material.uniforms.uFlowGain.value = p.bg.flowGain;
        material.uniforms.uSwell.value = p.bg.swell;
        (material.uniforms.uVortex.value as Vector2).set(p.vortex.xFrac, 1 - p.vortex.yFrac);
        material.uniforms.uSpinTheta.value = p.bg.spinSpeed * p.bg.spinPeriod;
        material.uniforms.uSpinPeriod.value = p.bg.spinPeriod;
        material.uniforms.uCore.value = p.bg.coreRadius;
        material.uniforms.uBand.value = p.bg.bandWidth;
      },
      _material: material,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [material, three]);

  return (
    <mesh frustumCulled={false} material={material}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
}

/**
 * Mount inside `.wh-bg`, as a sibling AFTER the aurora <Image>. The wrapper
 * carries `.wh-bg-canvas` (opacity 0 at rest); the owner fades it in once
 * ready and LEAVES it — the vortex is a resting state of the page now, not
 * a flight effect.
 */
export function AuroraBgCanvas({
  img,
  gust,
  params,
  onReady,
}: {
  img: HTMLImageElement;
  gust: GustStore;
  params: FlightParams;
  onReady: (api: AuroraApi) => void;
}) {
  return (
    <div className="wh-bg-canvas" aria-hidden="true">
      <Canvas
        frameloop="never"
        flat
        dpr={[1, 1.5]}
        style={{ pointerEvents: "none" }}
        gl={{ alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: "low-power" }}
      >
        <RibbonQuad img={img} gust={gust} params={params} onReady={onReady} />
      </Canvas>
    </div>
  );
}
