"use client";

import { useEffect } from "react";

/* Entrances happen once: this adds .is-in to every [data-rv] and [data-once] under .dep when it enters
   view. The hidden pre-state exists only while .dep carries data-io="on", which is set here and only when
   motion is allowed, so reduced motion and no script both render settled. */
export function DepReveal() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".dep");
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-rv], [data-once]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.25, rootMargin: "0px 0px -8% 0px" },
    );
    root.dataset.io = "on";
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}

