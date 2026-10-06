"use client";

import { useEffect } from "react";

/* The night sections as panels (Ben, 2026-10-06, after instalily.ai). Each [data-panel] draws its night on a rounded
   layer that sits inset from the page edge while the panel's top or bottom edge is on screen, and widens to full bleed
   as the panel comes into place. This writes one number per panel (--s, the layer's horizontal scale) at most once a
   frame. Without script, or under reduced motion, the layer simply stays inset (landing.css, "night panels"). */
export function Panels() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".lp");
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-panel]"));
    let insets = els.map(() => 0);
    let raf = 0;
    const measure = () => {
      insets = els.map((el) => parseFloat(getComputedStyle(el).getPropertyValue("--panel-inset")) || 0);
    };
    const read = () => {
      raf = 0;
      const h = window.innerHeight;
      els.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -h || r.top > 2 * h) return;
        const enter = Math.min(1, Math.max(0, (h - r.top) / (0.5 * h)));
        const leave = Math.min(1, Math.max(0, (r.bottom - 0.5 * h) / (0.5 * h)));
        const s = 1 - ((1 - Math.min(enter, leave)) * 2 * insets[i]) / r.width;
        el.style.setProperty("--s", s.toFixed(4));
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    const onResize = () => {
      measure();
      onScroll();
    };
    measure();
    read();
    root.dataset.panels = "on";
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
