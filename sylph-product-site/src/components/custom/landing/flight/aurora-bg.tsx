"use client";

/**
 * The ribbons respond — a small demand-rendered canvas nested inside `.wh-bg`
 * (so it inherits the hero's parallax scrub for free), sampling the already-
 * loaded aurora <img> as its texture. A gentle domain warp drifts the ribbons
 * and swells their brightness with the gust, luma-weighted so the BRIGHT
 * strands breathe, not the whole frame.
 *
 * The DOM <Image> stays mounted beneath as the LCP/resting truth; the
 * orchestrator crossfades this canvas in before the gust (undistorted at
 * fade-in) and out after handback. Virtual time comes from the gust store —
 * never the wall clock.
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
  advance(virtualMs: number): void;
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
  uniform float uTime;   // virtual — timeline progress scaled
  uniform float uGust;   // gust envelope 0..1
  uniform float uDrift;
  uniform float uFlowGain;
  uniform float uSwell;

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

  void main() {
    vec2 uv = vUv * uUvScale + uUvOffset;
    float w = uDrift + uGust * uFlowGain;
    vec2 warp = vec2(
      vnoise(uv * 3.0 + vec2(uTime * 0.7, 0.0)),
      vnoise(uv * 3.0 + vec2(7.3, uTime * 0.6))
    ) - 0.5;
    warp += 0.5 * (vec2(
      vnoise(uv * 7.0 + vec2(-uTime * 0.9, 3.1)),
      vnoise(uv * 7.0 + vec2(uTime * 0.8, 9.7))
    ) - 0.5);
    vec2 suv = uv + warp * w * 0.045;
    vec4 c = texture2D(uMap, suv);
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
    return new ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms: {
        uMap: { value: tex },
        uUvScale: { value: new Vector2(1, 1) },
        uUvOffset: { value: new Vector2(0, 0) },
        uTime: { value: 0 },
        uGust: { value: 0 },
        uDrift: { value: params.bg.drift },
        uFlowGain: { value: params.bg.flowGain },
        uSwell: { value: params.bg.swell },
      },
      depthWrite: false,
      depthTest: false,
    });
  }, [img, params.bg.drift, params.bg.flowGain, params.bg.swell]);

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
  });

  const readyOnce = useRef(false);
  useEffect(() => {
    if (readyOnce.current) return;
    readyOnce.current = true;
    onReady({
      advance: (ms) => three.advance(ms),
      updateParams: (p) => {
        paramsRef.current = p;
        material.uniforms.uDrift.value = p.bg.drift;
        material.uniforms.uFlowGain.value = p.bg.flowGain;
        material.uniforms.uSwell.value = p.bg.swell;
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
 * carries `.wh-bg-canvas` (opacity 0 at rest); the orchestrator tweens it.
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
        gl={{ alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: "low-power" }}
      >
        <RibbonQuad img={img} gust={gust} params={params} onReady={onReady} />
      </Canvas>
    </div>
  );
}
