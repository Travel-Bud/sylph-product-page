"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "./motion";
import { Obj } from "./obj";

/**
 * One receipt's journey. A single receipt sprite lifts out of the hero clip on the first
 * scroll, drifts down the page and perches on the receipts tile, then lifts again and lands
 * on the report in the record tile. Scrubbed by scroll, so it only moves when the visitor
 * does; between legs it sits still. Desktop and no-preference only; otherwise not rendered
 * at all (the tiles carry their own receipts).
 */
const SIZE = 120;
const A = '[data-journey="hero"]';
const B = '[data-tile="receipts"]';
const C = '[data-tile="record"]';

interface Spot {
  x: number;
  y: number;
  rot: number;
  s: number;
}

/* Each spot is where the receipt's centre sits, in page coordinates (the sprite scales about its centre). */
function spotFor(el: HTMLElement, i: number): Spot {
  const r = el.getBoundingClientRect();
  const top = r.top + window.scrollY;
  const left = r.left + window.scrollX;
  const at = (cx: number, cy: number, rot: number, s: number): Spot => ({ x: cx - SIZE / 2, y: cy - SIZE / 2, rot, s });
  // over the receipt inside the hero clip
  if (i === 0) return at(left + r.width * 0.17, top + r.height * 0.4, -16, 1);
  // dropping into the upload tray in the receipts tile
  if (i === 1) return at(left + r.width * 0.2, top + r.height * 0.47, -6, 0.5);
  // clipped to the report paper's top-right corner, right of the title, clear of the rows
  return at(left + r.width * 0.8, top + r.height * 0.22, -7, 0.52);
}

export function ReceiptJourney() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference) and (min-width: 1024px)", () => {
      const a = document.querySelector<HTMLElement>(A);
      const b = document.querySelector<HTMLElement>(B);
      const c = document.querySelector<HTMLElement>(C);
      if (!a || !b || !c) return;
      const anchors = [a, b, c];
      let pts = anchors.map(spotFor);
      const measure = () => {
        pts = anchors.map(spotFor);
      };
      ScrollTrigger.addEventListener("refreshInit", measure);

      const lift = el.querySelector<HTMLElement>(".journey-lift")!;
      gsap.set(el, { display: "block", x: () => pts[0].x, y: () => pts[0].y, rotation: () => pts[0].rot, scale: () => pts[0].s, autoAlpha: 0 });

      // leg 1: out of the hero clip, onto the receipts tile. Starts with the first scroll.
      const leg1 = gsap.timeline({
        scrollTrigger: {
          start: () => 30,
          end: () => pts[1].y - window.innerHeight * 0.5,
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      });
      leg1
        .to(el, { autoAlpha: 1, duration: 0.12, ease: "none" }, 0)
        .to(el, { x: () => pts[1].x, y: () => pts[1].y, rotation: () => pts[1].rot, scale: () => pts[1].s, duration: 1, ease: "none" }, 0)
        .to(lift, { keyframes: [{ y: -70, rotation: -28, duration: 0.45 }, { y: 0, rotation: 0, duration: 0.55 }], ease: "sine.inOut" }, 0);

      // leg 2: off the receipts tile, onto the report in the record tile.
      const leg2 = gsap.timeline({
        scrollTrigger: {
          start: () => pts[1].y - window.innerHeight * 0.22,
          end: () => pts[2].y - window.innerHeight * 0.3,
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      });
      leg2
        .to(el, { x: () => pts[2].x, y: () => pts[2].y, rotation: () => pts[2].rot, scale: () => pts[2].s, duration: 1, ease: "none" }, 0)
        .to(lift, { keyframes: [{ y: -56, rotation: 22, duration: 0.45 }, { y: 0, rotation: 0, duration: 0.55 }], ease: "sine.inOut" }, 0);

      // after a refresh (a tile opened or closed, a resize) the scrubbed timelines sit at an
      // unchanged progress, so nothing would re-render; invalidate and force a render so the
      // sprite moves to the re-measured spots
      const rerender = () => {
        for (const tl of [leg1, leg2]) {
          tl.invalidate();
          tl.render(tl.totalTime(), true, true);
        }
      };
      ScrollTrigger.addEventListener("refresh", rerender);

      return () => {
        ScrollTrigger.removeEventListener("refresh", rerender);
        ScrollTrigger.removeEventListener("refreshInit", measure);
        leg1.scrollTrigger?.kill();
        leg2.scrollTrigger?.kill();
        leg1.kill();
        leg2.kill();
        gsap.set(el, { clearProps: "all" });
      };
    });
    return () => mm.revert();
  }, []);

  return (
    <div className="journey" ref={ref} aria-hidden="true">
      <div className="journey-lift">
        <Obj name="receipt" size={SIZE} />
      </div>
    </div>
  );
}
