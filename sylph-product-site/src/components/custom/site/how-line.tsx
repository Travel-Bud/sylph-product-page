"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "./motion";
import { Mark } from "./mark";

/* the glyph's beak points up and to the right; this offset turns it along the line */
const HEADING = 40;

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
    const bird = el.querySelector<HTMLElement>(".how-bird");
    const stations = Array.from(el.querySelectorAll<HTMLElement>(".how-station"));
    if (!path || !bird) return;

    /* the bird rides the tip of the line: a point on the path, mapped through the stretched
       svg into the how-line's own pixels, turned to face along the line */
    const place = (t: number) => {
      const ctm = path.getScreenCTM();
      /* below 760px the line is display: none and the matrix is the identity; the bird is hidden there too */
      if (!ctm || path.getBoundingClientRect().width === 0) return;
      const len = path.getTotalLength();
      const host = el.getBoundingClientRect();
      const at = (u: number) => {
        const q = path.getPointAtLength(Math.min(len, Math.max(0, u)) * 1).matrixTransform(ctm);
        return { x: q.x - host.left, y: q.y - host.top };
      };
      const b = at(t * len);
      const a = at(Math.max(0, t - 0.015) * len);
      const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
      gsap.set(bird, { x: b.x - bird.offsetWidth / 2, y: b.y - bird.offsetHeight / 2, rotation: angle + HEADING });
    };

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: reduce)", () => {
      place(1);
      const onResize = () => place(1);
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    });
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
            place(self.animation ? self.animation.progress() : self.progress);
          },
          onRefresh: (self) => place(self.animation ? self.animation.progress() : self.progress),
        },
      });
      place(0);
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
      <span className="how-bird" aria-hidden="true">
        <Mark />
      </span>
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
