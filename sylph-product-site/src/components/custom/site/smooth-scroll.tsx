"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./motion";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/**
 * Lenis + ScrollTrigger on one rAF (GSAP's ticker drives Lenis). Wheel only:
 * touch, keyboard and scrollbar stay native, and reduced motion never
 * instantiates it at all. Anchor clicks (both "#how" and "/#how") glide.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ lerp: 0.12, smoothWheel: true, syncTouch: false });
    if (process.env.NODE_ENV !== "production") window.__lenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.("a[href*='#']");
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      const hash = href.indexOf("#");
      const path = href.slice(0, hash);
      if (path && path !== window.location.pathname) return;
      const id = href.slice(hash);
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement);
      history.replaceState(null, "", id);
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(raf);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  return <>{children}</>;
}
