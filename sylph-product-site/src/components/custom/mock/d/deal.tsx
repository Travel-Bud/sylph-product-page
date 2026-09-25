"use client";

import { useEffect, useRef } from "react";

/* Deals Dana's short list onto the table when it scrolls in: each card drops, overshoots and settles on a
   hand-tuned spring curve (sorted.css, .md-deal). Without script, or with reduced motion, the cards simply lie there. */
export function Deal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.8) return;
    el.classList.add("md-deal");
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        el.classList.add("is-in");
        io.disconnect();
      },
      { rootMargin: "0px 0px -22% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="md-deck">
      {children}
    </div>
  );
}
