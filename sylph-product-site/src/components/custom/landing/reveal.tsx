"use client";

import { useEffect } from "react";

/* Adds .is-in to each [data-rv] under the landing root as it enters view. The hidden pre-state only exists while the
   root carries data-io="on", which is set here and only when motion is allowed, so reduced motion and no script both
   render the settled page. */
export function Reveal() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".lp");
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-rv]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" },
    );
    root.dataset.io = "on";
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
