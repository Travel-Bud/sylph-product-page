"use client";

/**
 * /dev/depth-parallax — 2.5D "revive a still" lab (never ships; the route 404s
 * in production). Proves the report's cheapest hero-revival path: take ONE still
 * image + its depth map and drive a depth-based parallax in a single shader pass,
 * so a dead still breathes and parallaxes on mouse/scroll.
 *
 * Works with zero assets — it synthesises a procedural "river still" + depth so
 * the effect is visible immediately. Point it at real assets from gen-asset.py by
 * setting the panel paths or appending ?img=/landing/river.png&depth=/landing/river.depth.png
 *
 * One full-screen quad, two textures, one fragment sample per pixel — far cheaper
 * than a particle sim. Motion lives in the CODE (mouse + auto-drift), not the asset.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  CanvasTexture,
  ClampToEdgeWrapping,
  LinearFilter,
  NoColorSpace,
  ShaderMaterial,
  SRGBColorSpace,
  type Texture,
  TextureLoader,
  Vector2,
} from "three";
import { Leva, useControls } from "leva";

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0); // full-screen quad, ignore camera
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uImage;
  uniform sampler2D uDepth;
  uniform vec2  uOffset;      // mouse + drift, [-1,1]-ish
  uniform float uStrength;    // max parallax in UV units
  uniform float uImageAspect;
  uniform float uViewAspect;
  uniform float uInvert;
  void main() {
    // cover-fit: scale UVs so the image fills the viewport without distortion
    float ia = uImageAspect, va = uViewAspect;
    vec2 scale = va < ia ? vec2(va / ia, 1.0) : vec2(1.0, ia / va);
    vec2 uv = (vUv - 0.5) * scale + 0.5;

    float d = texture2D(uDepth, uv).r;
    d = mix(d, 1.0 - d, uInvert);              // near vs far
    vec2 par = uOffset * uStrength * (d - 0.5) * 2.0;
    gl_FragColor = texture2D(uImage, uv + par);
  }
`;

/** Draw a procedural pine-green "river" still + matching depth map (streaks = near). */
function makeRiverTextures(): { image: CanvasTexture; depth: CanvasTexture; aspect: number } {
  const w = 1280;
  const h = 720;

  const ic = document.createElement("canvas");
  ic.width = w;
  ic.height = h;
  const ig = ic.getContext("2d")!;
  const bg = ig.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#05160e");
  bg.addColorStop(1, "#02100a");
  ig.fillStyle = bg;
  ig.fillRect(0, 0, w, h);

  const dc = document.createElement("canvas");
  dc.width = w;
  dc.height = h;
  const dg = dc.getContext("2d")!;
  dg.fillStyle = "#404040"; // mid-grey = background plane
  dg.fillRect(0, 0, w, h);

  const streaks = 8;
  for (let s = 0; s < streaks; s++) {
    const baseY = (h * (s + 0.5)) / streaks;
    const amp = 22 + (s % 3) * 14;
    const near = 0.5 + 0.45 * (s / (streaks - 1)); // depth: front streaks nearer
    const grey = Math.round(near * 255);

    // image streak — aurora green with additive glow
    ig.save();
    ig.globalCompositeOperation = "lighter";
    ig.strokeStyle = `rgba(95, 220, 166, ${0.18 + 0.12 * (s / streaks)})`;
    ig.lineWidth = 2 + (s % 2);
    ig.shadowColor = "rgba(95, 220, 166, 0.9)";
    ig.shadowBlur = 26;
    // depth streak — solid grey, softly blurred
    dg.save();
    dg.strokeStyle = `rgb(${grey},${grey},${grey})`;
    dg.lineWidth = 26;
    dg.shadowColor = `rgb(${grey},${grey},${grey})`;
    dg.shadowBlur = 22;

    ig.beginPath();
    dg.beginPath();
    for (let x = 0; x <= w; x += 8) {
      const y = baseY + Math.sin(x * 0.006 + s * 1.7) * amp + Math.sin(x * 0.017 + s) * (amp * 0.4);
      if (x === 0) {
        ig.moveTo(x, y);
        dg.moveTo(x, y);
      } else {
        ig.lineTo(x, y);
        dg.lineTo(x, y);
      }
    }
    ig.stroke();
    dg.stroke();
    ig.restore();
    dg.restore();
  }

  const image = new CanvasTexture(ic);
  const depth = new CanvasTexture(dc);
  for (const t of [image, depth]) {
    t.minFilter = LinearFilter;
    t.magFilter = LinearFilter;
    t.wrapS = ClampToEdgeWrapping;
    t.wrapT = ClampToEdgeWrapping;
    t.generateMipmaps = false;
  }
  image.colorSpace = SRGBColorSpace;
  depth.colorSpace = NoColorSpace; // raw depth values, no gamma decode
  return { image, depth, aspect: w / h };
}

interface SceneProps {
  imagePath: string;
  depthPath: string;
  strength: number;
  drift: number;
  driftSpeed: number;
  invert: boolean;
  freeze: boolean;
  reduced: boolean;
}

function Scene({ imagePath, depthPath, strength, drift, driftSpeed, invert, freeze, reduced }: SceneProps) {
  const size = useThree((s) => s.size);
  const [tex, setTex] = useState<{ image: Texture; depth: Texture; aspect: number } | null>(null);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uImage: { value: null },
          uDepth: { value: null },
          uOffset: { value: new Vector2(0, 0) },
          uStrength: { value: strength },
          uImageAspect: { value: 1 },
          uViewAspect: { value: 1 },
          uInvert: { value: 0 },
        },
        vertexShader: VERT,
        fragmentShader: FRAG,
      }),
    // build once; live values are pushed in useFrame
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // load real assets when both paths are set, else synthesise the procedural still
  useEffect(() => {
    let cancelled = false;
    if (imagePath && depthPath) {
      const loader = new TextureLoader();
      Promise.all([loader.loadAsync(imagePath), loader.loadAsync(depthPath)])
        .then(([img, dep]) => {
          if (cancelled) return;
          for (const t of [img, dep]) {
            t.minFilter = LinearFilter;
            t.magFilter = LinearFilter;
            t.wrapS = ClampToEdgeWrapping;
            t.wrapT = ClampToEdgeWrapping;
            t.generateMipmaps = false;
          }
          img.colorSpace = SRGBColorSpace;
          dep.colorSpace = NoColorSpace;
          const iw = (img.image as HTMLImageElement)?.width || 16;
          const ih = (img.image as HTMLImageElement)?.height || 9;
          setTex({ image: img, depth: dep, aspect: iw / ih });
        })
        .catch(() => {
          if (!cancelled) setTex(makeRiverTextures());
        });
    } else {
      setTex(makeRiverTextures());
    }
    return () => {
      cancelled = true;
    };
  }, [imagePath, depthPath]);

  useEffect(() => {
    if (!tex) return;
    material.uniforms.uImage.value = tex.image;
    material.uniforms.uDepth.value = tex.depth;
    material.uniforms.uImageAspect.value = tex.aspect;
  }, [tex, material]);

  useEffect(() => () => material.dispose(), [material]);

  const targetPtr = useRef(new Vector2(0, 0));
  const curPtr = useRef(new Vector2(0, 0));
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      targetPtr.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -((e.clientY / window.innerHeight) * 2 - 1),
      );
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, dt) => {
    const u = material.uniforms;
    u.uViewAspect.value = size.width / size.height;
    u.uStrength.value = strength;
    u.uInvert.value = invert ? 1 : 0;

    if (freeze) {
      (u.uOffset.value as Vector2).set(0, 0);
      return;
    }
    const k = Math.min(1, 1 - Math.pow(0.0015, dt)); // frame-rate independent easing
    curPtr.current.lerp(targetPtr.current, k);
    const t = state.clock.elapsedTime;
    const driftAmt = reduced ? 0 : drift;
    const dx = Math.sin(t * driftSpeed) * driftAmt * 0.6;
    const dy = Math.cos(t * driftSpeed * 0.8) * driftAmt * 0.4;
    (u.uOffset.value as Vector2).set(curPtr.current.x + dx, curPtr.current.y + dy);
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

export default function DepthParallax() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    const onChange = () => setReduced(m.matches);
    m.addEventListener("change", onChange);
    return () => m.removeEventListener("change", onChange);
  }, []);

  const [initial] = useState(() => {
    if (typeof window === "undefined") return { img: "", depth: "" };
    const q = new URLSearchParams(window.location.search);
    return { img: q.get("img") ?? "", depth: q.get("depth") ?? "" };
  });

  const { imagePath, depthPath, strength, drift, driftSpeed, invert, freeze } = useControls({
    imagePath: { value: initial.img, label: "image path" },
    depthPath: { value: initial.depth, label: "depth path" },
    strength: { value: 0.045, min: 0, max: 0.2, step: 0.005 },
    drift: { value: 0.35, min: 0, max: 1, step: 0.05, label: "auto drift" },
    driftSpeed: { value: 0.3, min: 0, max: 2, step: 0.05, label: "drift speed" },
    invert: { value: false, label: "invert depth" },
    freeze: { value: false, label: "freeze (dead still)" },
  });

  return (
    <>
      <Leva collapsed titleBar={{ title: "depth parallax" }} />
      <Canvas dpr={[1, 2]} gl={{ antialias: false, alpha: false }} style={{ position: "fixed", inset: 0, zIndex: 0 }}>
        <Scene
          imagePath={imagePath}
          depthPath={depthPath}
          strength={strength}
          drift={drift}
          driftSpeed={driftSpeed}
          invert={invert}
          freeze={freeze}
          reduced={reduced}
        />
      </Canvas>

      {/* DOM layered over the living still — proves text stays crisp on top */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          padding: "clamp(2rem, 6vw, 5rem)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          pointerEvents: "none",
          color: "#e9f1eb",
        }}
      >
        <div
          style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: "0.72rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#5fdca6",
          }}
        >
          Corporate Travel &amp; Expense
        </div>

        <h1
          style={{
            fontFamily: "'Iowan Old Style', Palatino, Georgia, serif",
            fontWeight: 600,
            fontSize: "clamp(2.4rem, 6vw, 4rem)",
            lineHeight: 1.02,
            letterSpacing: "-0.015em",
            margin: 0,
            maxWidth: "18ch",
            textShadow: "0 2px 30px rgba(0,0,0,0.5)",
          }}
        >
          Stop reviewing expenses.
          <br />
          Start reviewing{" "}
          <em style={{ color: "#5fdca6", fontStyle: "italic" }}>exceptions.</em>
        </h1>

        <p
          style={{
            pointerEvents: "auto",
            maxWidth: "60ch",
            fontFamily: "ui-monospace, monospace",
            fontSize: "0.78rem",
            lineHeight: 1.6,
            color: "rgba(233,241,235,0.72)",
            background: "rgba(4,16,10,0.55)",
            border: "1px solid rgba(95,220,166,0.18)",
            borderRadius: 10,
            padding: "0.9rem 1.1rem",
            backdropFilter: "blur(6px)",
          }}
        >
          Move your mouse — the still parallaxes by its depth map. Toggle <b>freeze</b> in the panel to
          compare with the dead still. Load real assets from{" "}
          <code style={{ color: "#5fdca6" }}>gen-asset.py</code> by setting the panel paths, or append{" "}
          <code style={{ color: "#5fdca6" }}>?img=/landing/river.png&amp;depth=/landing/river.depth.png</code>.
          {reduced ? " (Reduced-motion on: auto-drift disabled, mouse still active.)" : ""}
        </p>
      </div>
    </>
  );
}
