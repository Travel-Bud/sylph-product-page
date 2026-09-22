"use client";

import { useEffect } from "react";

/* Chapters demonstrate once, when they enter view: this adds .is-in to every [data-rv] (and every
   reused [data-once] panel) under the root. The hidden pre-state only exists while the root carries data-io="on", which is set
   here and only when motion is allowed, so reduced motion and no-script both render settled. */
export function Reveal() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".v2s");
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    /* [data-once] is the reused site panels' own "demonstrate on entry" hook (site.css keys its
       entrances on .is-in); it is left alone under reduced motion so those panels stay settled. */
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-rv], .site [data-once]"));
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
