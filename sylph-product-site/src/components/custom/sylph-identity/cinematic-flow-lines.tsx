"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { noise2D } from "./simplex-noise";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CinematicFlowLinesProps {
  /** Total number of lines across all layers (3-6). Default: 5 */
  lines?: number;
  /** Base opacity multiplier (scales layer-specific opacities). Default: 1.0 */
  intensity?: number;
  /** Color variant. Default: "teal-amber" */
  variant?: "teal" | "teal-amber";
  /** Additional CSS classes on the container div */
  className?: string;
  /** Show micro-particles drifting along curves. Default: false */
  microParticles?: boolean;
}

interface ControlPoint {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  noiseOffsetX: number;
  noiseOffsetY: number;
  driftRadius: number;
}

type Layer = "back" | "mid" | "fore";

interface Particle {
  t: number;
  speed: number;
  noiseOff: number;
}

interface FlowLine {
  points: ControlPoint[];
  layer: Layer;
  strokeWidth: number;
  opacity: number;
  colorStart: string;
  colorEnd: string;
  speedMult: number;
  particles: Particle[];
}

/* ------------------------------------------------------------------ */
/*  Layer configuration                                                */
/* ------------------------------------------------------------------ */

const LAYER_CONFIG: Record<Layer, {
  opacityRange: [number, number];
  driftRange: [number, number];
  speedMult: number;
}> = {
  back: { opacityRange: [0.10, 0.15], driftRange: [8, 15], speedMult: 0.6 },
  mid:  { opacityRange: [0.18, 0.24], driftRange: [12, 22], speedMult: 1.0 },
  fore: { opacityRange: [0.28, 0.35], driftRange: [18, 30], speedMult: 1.3 },
};

/**
 * Hand-crafted curve templates — sweeping S-curves that span the full width.
 * Each path is 7 normalized [0,1] coordinate pairs: start, c1, c2, mid, c3, c4, end.
 * Drawn as: moveTo(start) → bezierCurveTo(c1,c2,mid) → bezierCurveTo(c3,c4,end).
 * X extends slightly past 0/1 for edge fadeout.
 */
const BASE_PATHS: { coords: number[]; layer: Layer; strokeWidth: number }[] = [
  // Line 1 (back): gentle high sweep
  { coords: [-0.08, 0.30, 0.12, 0.10, 0.29, 0.80, 0.50, 0.45, 0.71, 0.10, 0.88, 0.75, 1.08, 0.35], layer: "back", strokeWidth: 1.2 },
  // Line 2 (back): low inverse wave
  { coords: [-0.08, 0.70, 0.08, 0.90, 0.25, 0.20, 0.46, 0.55, 0.67, 0.90, 0.83, 0.25, 1.08, 0.65], layer: "back", strokeWidth: 1.0 },
  // Line 3 (mid): wide S-curve
  { coords: [-0.08, 0.15, 0.17, 0.40, 0.33, 0.85, 0.58, 0.50, 0.75, 0.25, 0.92, 0.75, 1.08, 0.45], layer: "mid", strokeWidth: 1.7 },
  // Line 4 (mid): reversed sweep
  { coords: [-0.08, 0.85, 0.15, 0.65, 0.32, 0.15, 0.50, 0.40, 0.68, 0.65, 0.82, 0.20, 1.08, 0.30], layer: "mid", strokeWidth: 1.5 },
  // Line 5 (fore): prominent center sweep (amber in teal-amber variant)
  { coords: [-0.08, 0.50, 0.10, 0.20, 0.30, 0.65, 0.52, 0.38, 0.74, 0.11, 0.90, 0.65, 1.08, 0.55], layer: "fore", strokeWidth: 2.2 },
  // Line 6 (fore): extra foreground if 6 lines requested
  { coords: [-0.08, 0.20, 0.15, 0.55, 0.35, 0.10, 0.52, 0.65, 0.70, 0.15, 0.85, 0.60, 1.08, 0.25], layer: "fore", strokeWidth: 2.0 },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/** Convert hex color to "r, g, b" for use in rgba() */
function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

/** Evaluate cubic Bezier at parameter t ∈ [0,1] */
function cubicBezier(
  p0x: number, p0y: number,
  p1x: number, p1y: number,
  p2x: number, p2y: number,
  p3x: number, p3y: number,
  t: number,
): [number, number] {
  const u = 1 - t;
  const uu = u * u;
  const uuu = uu * u;
  const tt = t * t;
  const ttt = tt * t;
  return [
    uuu * p0x + 3 * uu * t * p1x + 3 * u * tt * p2x + ttt * p3x,
    uuu * p0y + 3 * uu * t * p1y + 3 * u * tt * p2y + ttt * p3y,
  ];
}

/**
 * Evaluate position on the two-segment cubic Bezier path at parameter t ∈ [0,1].
 * t=0 → points[0], t=0.5 → points[3] (junction), t=1 → points[6].
 */
function evalBezierPair(points: ControlPoint[], t: number): [number, number] {
  if (t <= 0.5) {
    const localT = t * 2;
    return cubicBezier(
      points[0].x, points[0].y,
      points[1].x, points[1].y,
      points[2].x, points[2].y,
      points[3].x, points[3].y,
      localT,
    );
  }
  const localT = (t - 0.5) * 2;
  return cubicBezier(
    points[3].x, points[3].y,
    points[4].x, points[4].y,
    points[5].x, points[5].y,
    points[6].x, points[6].y,
    localT,
  );
}

/** Get tangent direction (unnormalized) at t on the two-segment path */
function evalBezierPairTangent(points: ControlPoint[], t: number): [number, number] {
  const dt = 0.002;
  const [x0, y0] = evalBezierPair(points, Math.max(0, t - dt));
  const [x1, y1] = evalBezierPair(points, Math.min(1, t + dt));
  return [x1 - x0, y1 - y0];
}

/** Build line data from curve templates, scaled to canvas size */
function createLines(
  count: number,
  width: number,
  height: number,
  variant: "teal" | "teal-amber",
): FlowLine[] {
  return BASE_PATHS.slice(0, count).map((base, lineIndex) => {
    const cfg = LAYER_CONFIG[base.layer];
    const isLast = lineIndex === count - 1;
    const useAmber = variant === "teal-amber" && isLast;

    // Convert 7 normalized coordinate pairs to ControlPoints
    const points: ControlPoint[] = [];
    for (let i = 0; i < 7; i++) {
      const baseX = base.coords[i * 2] * width;
      const baseY = base.coords[i * 2 + 1] * height;
      points.push({
        baseX,
        baseY,
        x: baseX,
        y: baseY,
        noiseOffsetX: rand(0, 1000),
        noiseOffsetY: rand(0, 1000),
        driftRadius: rand(cfg.driftRange[0], cfg.driftRange[1]),
      });
    }

    // Initialize particles (8 per line, used when microParticles is on)
    const particles: Particle[] = [];
    for (let i = 0; i < 8; i++) {
      particles.push({
        t: rand(0, 1),
        speed: rand(0.015, 0.04),
        noiseOff: rand(0, 1000),
      });
    }

    return {
      points,
      layer: base.layer,
      strokeWidth: base.strokeWidth,
      opacity: rand(cfg.opacityRange[0], cfg.opacityRange[1]),
      colorStart: useAmber ? "#f59e0b" : "#0d9488",
      colorEnd: useAmber ? "#f59e0b" : "#2dd4bf",
      speedMult: cfg.speedMult,
      particles,
    };
  });
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const CinematicFlowLines = React.memo(function CinematicFlowLines({
  lines: lineCount = 5,
  intensity = 1.0,
  variant = "teal-amber",
  className,
  microParticles = false,
}: CinematicFlowLinesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const linesRef = useRef<FlowLine[]>([]);
  const timeRef = useRef(0);
  const lastFrameRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0 });
  const microParticlesRef = useRef(microParticles);

  // Keep ref in sync without re-creating animate
  microParticlesRef.current = microParticles;

  const count = Math.max(3, Math.min(6, lineCount));

  // Resize handler: update canvas dimensions and rebuild lines
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);

    sizeRef.current = { w: rect.width, h: rect.height };
    linesRef.current = createLines(count, rect.width, rect.height, variant);
  }, [count, variant]);

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const now = performance.now() / 1000;
    const dt = Math.min(now - lastFrameRef.current, 0.05);
    lastFrameRef.current = now;
    timeRef.current += dt;
    const time = timeRef.current;

    const showParticles = microParticlesRef.current;
    const w = sizeRef.current.w;

    // Clear canvas
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    // Draw each line
    const lines = linesRef.current;
    for (let li = 0; li < lines.length; li++) {
      const line = lines[li];
      const { points, strokeWidth, opacity, colorStart, colorEnd, speedMult } = line;
      const adjustedTime = time * speedMult * 0.15;

      // Update control point positions via simplex noise
      for (const pt of points) {
        const nx = noise2D(pt.noiseOffsetX + adjustedTime, pt.noiseOffsetY);
        const ny = noise2D(pt.noiseOffsetY + adjustedTime, pt.noiseOffsetX + 100);
        pt.x = pt.baseX + nx * pt.driftRadius;
        pt.y = pt.baseY + ny * pt.driftRadius;
      }

      // Breathing thickness (always on)
      const breathMult = 0.6 + 0.8 * ((noise2D(time * 0.3, li * 100 + 500) + 1) / 2);
      const effectiveWidth = strokeWidth * breathMult;

      // Draw as two cubic bezier segments: M(0) C(1,2,3) C(4,5,6)
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      ctx.bezierCurveTo(
        points[1].x, points[1].y,
        points[2].x, points[2].y,
        points[3].x, points[3].y,
      );
      ctx.bezierCurveTo(
        points[4].x, points[4].y,
        points[5].x, points[5].y,
        points[6].x, points[6].y,
      );

      // Gradient stroke
      const gradient = ctx.createLinearGradient(0, 0, w, 0);
      const rgbStart = hexToRgb(colorStart);
      const rgbEnd = hexToRgb(colorEnd);
      gradient.addColorStop(0, `rgba(${rgbStart}, 0)`);
      gradient.addColorStop(0.1, `rgba(${rgbStart}, ${opacity * intensity})`);
      gradient.addColorStop(0.9, `rgba(${rgbEnd}, ${opacity * intensity})`);
      gradient.addColorStop(1, `rgba(${rgbEnd}, 0)`);

      ctx.strokeStyle = gradient;
      ctx.lineWidth = effectiveWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      // Micro-particles (opt-in)
      if (showParticles) {
        for (const p of line.particles) {
          p.t = (p.t + p.speed * dt) % 1;
          const [cx, cy] = evalBezierPair(points, p.t);

          // Perpendicular noise offset
          const [tx, ty] = evalBezierPairTangent(points, p.t);
          const tLen = Math.sqrt(tx * tx + ty * ty) || 1;
          const perpX = -ty / tLen;
          const perpY = tx / tLen;
          const offset = noise2D(p.noiseOff + time * 0.5, p.t * 10) * 12;

          const px = cx + perpX * offset;
          const py = cy + perpY * offset;

          const alpha = Math.sin(Math.PI * p.t) * 0.6 * intensity;
          const rgb = hexToRgb(p.t < 0.5 ? colorStart : colorEnd);
          ctx.beginPath();
          ctx.arc(px, py, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
          ctx.fill();
        }
      }
    }

    rafRef.current = requestAnimationFrame(animate);
  }, [intensity]);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    handleResize();

    if (prefersReduced) {
      // Render one static frame then stop
      lastFrameRef.current = performance.now() / 1000;
      timeRef.current = 5;
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const animateOnce = () => {
            animate();
            cancelAnimationFrame(rafRef.current);
          };
          rafRef.current = requestAnimationFrame(animateOnce);
        }
      }
      return;
    }

    // Start animation
    lastFrameRef.current = performance.now() / 1000;
    rafRef.current = requestAnimationFrame(animate);

    // Resize observer
    const container = containerRef.current;
    let resizeObserver: ResizeObserver | undefined;
    if (container) {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(container);
    }

    // Visibility API: pause when hidden
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current);
      } else {
        lastFrameRef.current = performance.now() / 1000;
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(rafRef.current);
      resizeObserver?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [animate, handleResize]);

  return (
    <div
      ref={containerRef}
      className={cn("pointer-events-none absolute inset-0", className)}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
});

CinematicFlowLines.displayName = "CinematicFlowLines";

export { CinematicFlowLines };
export type { CinematicFlowLinesProps };
