"use client";

import { useEffect } from "react";

/**
 * The CSS demonstrations (route marker, receipt settling, terminal toast)
 * play once, when their panel first enters the viewport: this adds `is-in`
 * to every `[data-once]` element on entry and stops watching it. Nothing
 * loops off screen, and the settled state is the CSS default for no-JS and
 * reduced motion. A panel marked [data-manual] is gated by its own component instead.
 */
export function LoopGate() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-once]:not([data-manual])"));
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.35 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
