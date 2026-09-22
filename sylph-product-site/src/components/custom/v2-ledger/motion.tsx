"use client";

import { useEffect } from "react";

/* Writes each entry into the book as it reaches the reader: every [data-reveal]
   block gains .is-in once, and its CSS plays the entry (ink, stamps, rules).
   Reduced motion: everything is marked in at once and CSS renders the settled state. */
export function LedgerMotion() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".ledger [data-reveal]"));
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.25, rootMargin: "0px 0px -10% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
