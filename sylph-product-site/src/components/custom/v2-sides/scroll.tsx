"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/components/custom/site/motion";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/**
 * The page's scroll. Lenis smooths the wheel only (touch, keyboard and the scrollbar stay native),
 * rides GSAP's ticker, and calls ScrollTrigger.update on every frame it moves, so every track's
 * ScrollTrigger uses the default window scroller unchanged. Exposed as window.__lenis.
 * In-page anchors (nav links, the skip link, "Follow the charge") glide under the nav and move
 * focus to their target, as a native jump would. Reduced motion and touch-first devices never
 * instantiate any of it: native scroll, with hero.css's scroll-padding keeping anchors clear of the nav.
 */
export function SidesScroll() {
  useEffect(() => {
    /* reduced motion, and any device whose main pointer is a finger, keep native scroll */
    if (window.matchMedia("(prefers-reduced-motion: reduce), (hover: none) and (pointer: coarse)").matches) return;

    const lenis = new Lenis({ lerp: 0.11, smoothWheel: true, syncTouch: false, wheelMultiplier: 0.9 });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest?.<HTMLAnchorElement>("a[href^='#']");
      if (!a) return;
      const id = a.getAttribute("href") ?? "";
      if (id.length < 2) return;
      const el = document.getElementById(decodeURIComponent(id.slice(1)));
      if (!el) return;
      e.preventDefault();
      /* Lenis honours hero.css's scroll-padding-top, so targets land clear of the sticky nav;
         the hero sits right under the nav, so its anchor goes to the very top */
      lenis.scrollTo(el.id === "top" ? 0 : el, { duration: 1.1 });
      history.replaceState(null, "", id);
      if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
      el.focus({ preventScroll: true });
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(raf);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);
  return null;
}
