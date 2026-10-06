"use client";

import { useEffect, useState, useSyncExternalStore, type RefObject } from "react";

const subscribers = new Map<string, (cb: () => void) => () => void>();
function subscribeTo(query: string) {
  let fn = subscribers.get(query);
  if (!fn) {
    fn = (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    };
    subscribers.set(query, fn);
  }
  return fn;
}

/** A media query as state; false on the server and in the first client render. */
export function useMedia(query: string) {
  return useSyncExternalStore(
    subscribeTo(query),
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const useReducedMotion = () => useMedia("(prefers-reduced-motion: reduce)");

/** True once the element has been at least `threshold` visible (then stays true). */
export function useSeen(ref: RefObject<Element | null>, threshold = 0.35) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, seen, threshold]);
  return seen;
}

/** 0 while the element's top sits below `start` of the viewport, 1 once it reaches `end` (fractions of its height). */
export function useScrollProgress(ref: RefObject<Element | null>, start = 0.9, end = 0.35) {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top / window.innerHeight;
      const v = Math.min(1, Math.max(0, (start - top) / (start - end)));
      setP((old) => (Math.abs(old - v) > 0.002 ? v : old));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref, start, end]);
  return p;
}
