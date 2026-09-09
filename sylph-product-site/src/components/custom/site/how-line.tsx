"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "./motion";

const PATH = "M 14 96 C 240 96, 300 40, 600 64 S 940 118, 1186 70";

const STATIONS = [
  { k: "Your policy, written or built", v: "“Dinner is capped at $75 a person. Anything over needs a note.”", at: 0.06 },
  { k: "The rule Sylph drafts", v: "M-041, dinner, amount per person over $75.00, needs a note", at: 0.5 },
  { k: "The verdict on a charge", v: "Sushi Kanda $84.20, $9.20 over", chip: "Needs a note", at: 0.97 },
];

export function HowLine() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const path = el.querySelector<SVGPathElement>(".how-path");
    const stations = Array.from(el.querySelectorAll<HTMLElement>(".how-station"));
    if (!path) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      const tween = gsap.to(path, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top 78%",
          end: "bottom 42%",
          scrub: 0.4,
          onUpdate: (self) => {
            stations.forEach((s, i) => s.classList.toggle("is-lit", self.progress >= STATIONS[i].at - 0.02));
          },
        },
      });
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        gsap.set(path, { clearProps: "strokeDasharray,strokeDashoffset" });
        stations.forEach((s) => s.classList.add("is-lit"));
      };
    });
    return () => {
      mm.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <div className="how-line" ref={root}>
      <svg className="how-svg" viewBox="0 0 1200 140" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path className="how-path-ghost" d={PATH} />
        <path className="how-path" d={PATH} />
      </svg>
      <ol className="how-stations">
        {STATIONS.map((s) => (
          <li key={s.k} className="how-station">
            <span className="how-dot" aria-hidden="true" />
            <span className="how-k">{s.k}</span>
            <span className="how-v">
              {s.chip && <span className="chip chip-warn">{s.chip}</span>}
              <span className="mono">{s.v}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
