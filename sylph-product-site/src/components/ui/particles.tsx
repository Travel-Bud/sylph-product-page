"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ParticlesProps {
  /** Number of particles. Default: 50 */
  quantity?: number;
  /** Particle color as hex. Default: "#2dd4bf" (teal-400) */
  color?: string;
  /** Upward drift speed multiplier. Default: 1 */
  speed?: number;
  /** Max particle radius in px. Default: 2 */
  size?: number;
  /** Additional CSS classes */
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  speed: number;
  swayOffset: number;
  swayAmplitude: number;
}

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function createParticle(w: number, h: number, maxSize: number): Particle {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    radius: 0.5 + Math.random() * maxSize,
    baseAlpha: 0.15 + Math.random() * 0.35,
    speed: 0.2 + Math.random() * 0.6,
    swayOffset: Math.random() * Math.PI * 2,
    swayAmplitude: 10 + Math.random() * 20,
  };
}

const Particles = React.memo(function Particles({
  quantity = 50,
  color = "#2dd4bf",
  speed = 1,
  size = 2,
  className,
}: ParticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const sizeRef = useRef({ w: 0, h: 0 });
  const timeRef = useRef(0);
  const lastFrameRef = useRef(0);

  const [r, g, b] = hexToRgb(color);

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

    // Rebuild particles
    particlesRef.current = Array.from({ length: quantity }, () =>
      createParticle(rect.width, rect.height, size)
    );
  }, [quantity, size]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const now = performance.now() / 1000;
    const dt = Math.min(now - lastFrameRef.current, 0.05);
    lastFrameRef.current = now;
    timeRef.current += dt;
    const time = timeRef.current;

    const { w, h } = sizeRef.current;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    for (const p of particlesRef.current) {
      // Drift upward
      p.y -= p.speed * speed * dt * 30;

      // Gentle sway
      const swayX = Math.sin(time * 0.5 + p.swayOffset) * p.swayAmplitude * 0.02;
      p.x += swayX;

      // Wrap around when off-screen
      if (p.y < -10) {
        p.y = h + 10;
        p.x = Math.random() * w;
      }
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;

      // Fade near edges
      const edgeFadeY = Math.min(p.y / (h * 0.15), (h - p.y) / (h * 0.15), 1);
      const alpha = p.baseAlpha * Math.max(0, edgeFadeY);

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      ctx.fill();
    }

    rafRef.current = requestAnimationFrame(animate);
  }, [r, g, b, speed]);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    handleResize();

    if (prefersReduced) {
      // Render one static frame
      lastFrameRef.current = performance.now() / 1000;
      timeRef.current = 5;
      rafRef.current = requestAnimationFrame(() => {
        animate();
        cancelAnimationFrame(rafRef.current);
      });
      return;
    }

    lastFrameRef.current = performance.now() / 1000;
    rafRef.current = requestAnimationFrame(animate);

    const container = containerRef.current;
    let resizeObserver: ResizeObserver | undefined;
    if (container) {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(container);
    }

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

Particles.displayName = "Particles";

export { Particles };
export type { ParticlesProps };
