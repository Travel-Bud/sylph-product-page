"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree, type RootState } from "@react-three/fiber";
import * as THREE from "three";

import { NOISE_GLSL } from "./noise";
import type { FieldSource } from "./sources";

/**
 * The particle field — one engine, many pieces.
 *
 * Everything expensive happens once on the GPU: rest positions live in a static
 * buffer, and every frame only advances a handful of uniforms. No per-particle
 * CPU work, no buffer re-upload, so 40-60k points hold 60fps.
 *
 * The one control worth understanding is `resolve`. At 0 the field is fully
 * displaced by noise — scattered, unsettled. At 1 every particle sits exactly on
 * its rest position and the source's shape snaps into focus. Driving it from
 * scroll is the whole trick behind the "chaos clears into order" pieces.
 */

const VERT = /* glsl */ `
uniform float uTime;
uniform vec3  uPointer;
uniform float uPointerStrength;
uniform float uPointerRadius;
uniform float uAmp;
uniform float uFreq;
uniform float uSpeed;
uniform float uSize;
uniform float uResolve;
uniform float uDpr;
uniform float uRefDepth;
uniform float uHeat;
uniform float uHeatSize;
uniform float uBloom;

attribute float aSeed;
attribute float aTone;
attribute float aFade;

varying float vTone;
varying float vDepth;
varying float vGlow;
varying float vFade;
varying float vEnergy;
varying float vBloom;

${NOISE_GLSL}

void main() {
  vec3 pos = position;
  float t = uTime * uSpeed;
  float chaos = 1.0 - uResolve;

  // Three decorrelated fbm samples -> a displacement that never repeats and
  // never reads as a single travelling wave.
  vec3 q = pos * uFreq;
  float n1 = fbm(q + vec3(0.0, 0.0, t));
  float n2 = fbm(q * 1.9 + vec3(4.7, 2.1, t * 0.70));
  float n3 = fbm(q * 0.6 + vec3(-3.1, 8.4, t * 0.45));

  vec3 disp = vec3(n2, n1 * 1.6, n3) * uAmp * chaos;
  pos += disp;

  // Energy = how hard this point is being driven right now. Wave crests and
  // noise ridges run hot, flats run cool. This is the single biggest difference
  // between a field that reads as expensive and one that reads as flat: the
  // reference work all has a blazing core along its ridges, never uniform
  // brightness. Survives resolve, so a settled field still has structure.
  float drive = abs(n1) * 0.65 + abs(n2) * 0.35;
  vEnergy = clamp(drive * 1.9, 0.0, 1.0);

  // A resolved field still breathes — dead-still points look broken, not calm.
  pos.z += sin(t * 0.9 + aSeed * 6.2831853) * uAmp * 0.06;

  // Pointer force: gaussian falloff, pushing outward. vGlow reuses the same
  // falloff in the fragment stage so the wake lights as well as displaces.
  vec2 toP = pos.xy - uPointer.xy;
  float d = length(toP);
  float fall = exp(-(d * d) / max(uPointerRadius * uPointerRadius, 0.0001));
  float force = uPointerStrength * fall;
  pos.xy += normalize(toP + vec2(0.0001)) * force;
  pos.z  += force * 0.5;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

  vDepth = -mv.z;
  vTone  = aTone;
  vGlow  = fall;
  vFade  = aFade;

  // A thin slice of particles render huge and faint — a poor man's bloom that
  // costs one branch instead of a post-processing pass. These are what give the
  // hot ridges their halo; without them the field is sharp but airless.
  vBloom = step(1.0 - uBloom, aSeed);
  float bloomScale = mix(1.0, 7.0, vBloom);

  // uRefDepth is the camera distance, so a particle resting on the field's own
  // plane comes out at exactly uSize device pixels. Without that normalisation
  // "size" means nothing to the author and additive blending blows out.
  float size = uSize * (0.55 + aSeed * 0.9) * (1.0 + vEnergy * uHeatSize) * bloomScale;
  gl_PointSize = size * uDpr * (uRefDepth / max(vDepth, 0.001));
}
`;

const FRAG = /* glsl */ `
uniform vec3  uColorA;
uniform vec3  uColorB;
uniform vec3  uColorHot;
uniform float uOpacity;
uniform float uFadeNear;
uniform float uFadeFar;
uniform float uHeat;

varying float vTone;
varying float vDepth;
varying float vGlow;
varying float vFade;
varying float vEnergy;
varying float vBloom;

void main() {
  // round the point sprite; discard early so overdraw stays cheap
  vec2 c = gl_PointCoord - 0.5;
  float r2 = dot(c, c);
  if (r2 > 0.25) discard;

  // bloom sprites get a soft falloff instead of a crisp edge, so they read as
  // haze around the hot ridges rather than as oversized dots
  float alpha = mix(
    smoothstep(0.25, 0.02, r2),
    smoothstep(0.25, 0.0, r2) * 0.10,
    vBloom
  );

  // Three stops, not two: cool base -> accent by tone -> hot core by energy.
  // The narrow two-stop ramp is what made the first pass read as tasteful but
  // tame. pow() keeps the hot stop confined to genuine ridges instead of
  // washing the whole field toward white.
  vec3 col = mix(uColorA, uColorB, vTone);
  col = mix(col, uColorHot, pow(vEnergy, 2.2) * uHeat);
  col = mix(col, uColorHot, clamp(vGlow * 1.2, 0.0, 1.0));

  float depthFade = 1.0 - smoothstep(uFadeNear, uFadeFar, vDepth);

  gl_FragColor = vec4(col, alpha * uOpacity * depthFade * vFade);
  #include <colorspace_fragment>
}
`;

export type ParticleFieldProps = {
  source: FieldSource;
  colorA?: string;
  colorB?: string;
  /** colour of the pointer wake — the only place a third hue is allowed */
  colorHot?: string;
  amp?: number;
  freq?: number;
  speed?: number;
  size?: number;
  opacity?: number;
  /** 0 = fully scattered, 1 = settled onto the source's shape */
  resolve?: number;
  pointerStrength?: number;
  pointerRadius?: number;
  fadeNear?: number;
  fadeFar?: number;
  /** camera distance — normalises point size so `size` reads in device pixels */
  refDepth?: number;
  /**
   * 0..1 — how far high-energy ridges push toward `colorHot`.
   *
   * The vibrancy dial. At 0 the field is a flat two-stop ramp (tasteful, tame);
   * at 0.8+ the crests blaze and the flats stay cool, which is what the
   * reference work is actually doing. Start here before touching anything else.
   */
  heat?: number;
  /** extra point size on hot ridges — thickens crests, keeps troughs fine */
  heatSize?: number;
  /** 0..1 fraction of particles rendered huge and faint as a fake bloom */
  bloom?: number;
  /** additive glows beautifully on night; turn OFF over paper or it blows out */
  additive?: boolean;
  rotation?: [number, number, number];
  /** slow constant yaw, radians/sec — 0 to hold still */
  autoRotate?: number;
};

export function ParticleField({
  source,
  colorA = "#0a7c53",
  colorB = "#2ede97",
  colorHot = "#eafff4",
  amp = 1.1,
  freq = 0.22,
  speed = 0.16,
  size = 2.0,
  opacity = 0.85,
  resolve = 0,
  pointerStrength = 0.9,
  pointerRadius = 2.6,
  fadeNear = 14,
  fadeFar = 30,
  refDepth = 14,
  heat = 0.8,
  heatSize = 0.9,
  bloom = 0.05,
  additive = true,
  rotation = [0, 0, 0],
  autoRotate = 0,
}: ParticleFieldProps) {
  const points = useRef<THREE.Points>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const smoothPointer = useRef(new THREE.Vector3(999, 999, 0));
  const { viewport, gl } = useThree();

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(source.positions, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(source.seeds, 1));
    g.setAttribute("aTone", new THREE.BufferAttribute(source.tones, 1));
    g.setAttribute("aFade", new THREE.BufferAttribute(source.fades, 1));
    // points have no meaningful bounding sphere once the shader displaces them;
    // an explicit large one stops three from frustum-culling the whole field
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 60);
    return g;
  }, [source]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector3(999, 999, 0) },
      uPointerStrength: { value: pointerStrength },
      uPointerRadius: { value: pointerRadius },
      uAmp: { value: amp },
      uFreq: { value: freq },
      uSpeed: { value: speed },
      uSize: { value: size },
      uResolve: { value: resolve },
      uDpr: { value: gl.getPixelRatio() },
      uRefDepth: { value: refDepth },
      uHeat: { value: heat },
      uHeatSize: { value: heatSize },
      uBloom: { value: bloom },
      uColorA: { value: new THREE.Color(colorA) },
      uColorB: { value: new THREE.Color(colorB) },
      uColorHot: { value: new THREE.Color(colorHot) },
      uOpacity: { value: opacity },
      uFadeNear: { value: fadeNear },
      uFadeFar: { value: fadeFar },
    }),
    // built once; every prop below is pushed per-frame in useFrame instead, so
    // that live tweaks (leva, scroll) never rebuild the material
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useFrame((state: RootState, delta) => {
    const u = mat.current?.uniforms;
    if (!u) return;

    u.uTime.value += delta;

    // NDC pointer -> world units on the z=0 plane, then critically damped so
    // the wake trails the cursor instead of snapping to it
    const target = smoothPointer.current;
    target.x += (state.pointer.x * (viewport.width / 2) - target.x) * Math.min(1, delta * 4.5);
    target.y += (state.pointer.y * (viewport.height / 2) - target.y) * Math.min(1, delta * 4.5);
    u.uPointer.value.copy(target);

    u.uPointerStrength.value = pointerStrength;
    u.uPointerRadius.value = pointerRadius;
    u.uAmp.value = amp;
    u.uFreq.value = freq;
    u.uSpeed.value = speed;
    u.uSize.value = size;
    u.uOpacity.value = opacity;
    u.uFadeNear.value = fadeNear;
    u.uFadeFar.value = fadeFar;
    u.uRefDepth.value = refDepth;
    u.uHeat.value = heat;
    u.uHeatSize.value = heatSize;
    u.uBloom.value = bloom;
    u.uDpr.value = gl.getPixelRatio();

    // ease resolve rather than tracking it exactly — scroll is jittery input
    u.uResolve.value += (resolve - u.uResolve.value) * Math.min(1, delta * 3.2);

    if (autoRotate && points.current) points.current.rotation.y += autoRotate * delta;
  });

  useEffect(() => {
    const u = mat.current?.uniforms;
    if (!u) return;
    u.uColorA.value.set(colorA);
    u.uColorB.value.set(colorB);
    u.uColorHot.value.set(colorHot);
  }, [colorA, colorB, colorHot]);

  return (
    <points ref={points} geometry={geometry} rotation={rotation} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={VERT}
        fragmentShader={FRAG}
        transparent
        depthWrite={false}
        blending={additive ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </points>
  );
}

export type FieldCanvasProps = ParticleFieldProps & {
  className?: string;
  /** camera distance on +z; larger = wider field of view onto the piece */
  distance?: number;
  fov?: number;
  /** capped, not uncapped — a 3x retina buffer at 40k points is a heater */
  maxDpr?: number;
  children?: React.ReactNode;
};

/**
 * Canvas wrapper with the defaults every piece here wants: transparent clear,
 * capped DPR, no tone mapping (these are emissive points, not lit surfaces),
 * and `pointer-events: none` so the field never eats clicks from the copy
 * sitting on top of it.
 */
export function FieldCanvas({
  className,
  distance = 14,
  fov = 52,
  maxDpr = 1.75,
  children,
  ...field
}: FieldCanvasProps) {
  return (
    <Canvas
      className={className}
      dpr={[1, maxDpr]}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, distance], fov, near: 0.1, far: 200 }}
      onCreated={({ gl }) => {
        gl.setClearAlpha(0);
        gl.toneMapping = THREE.NoToneMapping;
      }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      {/* refDepth defaults to the camera distance so `size` reads in device
          pixels without every caller having to keep the two numbers in sync */}
      <ParticleField refDepth={distance} {...field} />
      {children}
    </Canvas>
  );
}
