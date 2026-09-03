"use client";

import { useEffect, useRef, useState } from "react";

import { markFromImage, type FieldSource } from "./sources";

/**
 * Async source loader for image-backed fields.
 *
 * Returns null until the bitmap has been sampled — callers render the field
 * only once it resolves, so nothing flashes as a single point at the origin.
 */
export function useMarkSource(
  src: string,
  opts?: Parameters<typeof markFromImage>[1],
): FieldSource | null {
  const [source, setSource] = useState<FieldSource | null>(null);
  // opts is an inline object at every call site; freeze it so a new literal
  // each render doesn't re-sample the image on a loop
  const frozen = useRef(opts);

  useEffect(() => {
    let live = true;
    markFromImage(src, frozen.current)
      .then((s) => {
        if (live) setSource(s);
      })
      .catch((err) => console.error("[field] mark source failed", err));
    return () => {
      live = false;
    };
  }, [src]);

  return source;
}

/**
 * `prefers-reduced-motion` as a boolean, updated live.
 *
 * The field's answer to reduced motion is not to disappear — it's to hold at
 * resolve=1 with speed near zero, so the composition survives and only the
 * movement stops.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/**
 * Scroll progress (0..1) over the first `spanVh` viewport heights of the page.
 *
 * For pieces whose canvas is `position: fixed` there is no scrollable ancestor
 * to measure against — the window IS the reference frame, so this is the right
 * hook rather than useScrollProgress below.
 */
export function useWindowProgress(spanVh: number): number {
  const [p, setP] = useState(0);
  const frame = useRef(0);

  useEffect(() => {
    const measure = () => {
      frame.current = 0;
      const span = window.innerHeight * spanVh;
      setP(span > 0 ? Math.min(1, Math.max(0, window.scrollY / span)) : 0);
    };
    const onScroll = () => {
      if (!frame.current) frame.current = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [spanVh]);

  return p;
}

/** ease-out-cubic — most of the settling happens early, while the hero is still in view */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Scroll progress (0..1) across an element, measured against the viewport.
 *
 * Deliberately not GSAP ScrollTrigger: this feeds a shader uniform every frame
 * and never touches the DOM, so a passive rAF-throttled listener is both
 * lighter and immune to the ScrollTrigger/Lenis refresh ordering issues the
 * landing page has already been bitten by.
 */
export function useScrollProgress(ref: React.RefObject<HTMLElement | null>): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const span = rect.height + window.innerHeight;
      const p = span > 0 ? (window.innerHeight - rect.top) / span : 0;
      setProgress(Math.min(1, Math.max(0, p)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ref]);

  return progress;
}
