"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, MM_MOTION } from "@/components/custom/site/motion";

/*
 * A passage: the time between two beats of the story, drawn as one full-screen scene and scrubbed to
 * the scroll. The section is tall (hours.css) and its stage sticks for the length of it, so the scene
 * plays while the visitor scrolls and rewinds when they scroll back. The stage's ground starts on the
 * chapter above and ends on the chapter below, so no edge shows between them.
 *
 * Every scene's markup and CSS describe its settled, final frame: that is what reduced motion and
 * no-script see. Under no-preference `build` receives a timeline of length 1 (fromTo tweens set the
 * opening frame as soon as they are created) and draws the passage over it.
 *
 * The charge itself is not drawn here: courier.tsx carries it down the page and lands it on the anchor
 * each scene animates.
 */

export type Build = (ctx: {
  tl: gsap.core.Timeline;
  q: (s: string) => Element[];
  el: HTMLElement;
  stage: HTMLElement;
}) => void;

export function Passage({
  from,
  to,
  label,
  className = "",
  build,
  children,
}: {
  from: string;
  to: string;
  label: string;
  className?: string;
  build: Build;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const stage = el.querySelector<HTMLElement>(".hrs-stage");
      if (!stage) return;
      const mm = gsap.matchMedia();
      mm.add(MM_MOTION, () => {
        el.dataset.live = "on";
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: el,
            start: "top 70%",
            end: "bottom bottom",
            scrub: 0.3,
            invalidateOnRefresh: true,
          },
        });
        const q = gsap.utils.selector(el);
        build({ tl, q, el, stage });
        /* the time card leaves before the stage does, so each scene ends on its bare ground */
        tl.fromTo(q(".hrs-card"), { opacity: 1, y: 0 }, { opacity: 0, y: -48, duration: 0.08, ease: "power1.in", immediateRender: false }, 0.9);
        /* pad the timeline to exactly 1 so positions in `build` read as fractions of the passage */
        tl.set({}, {}, 1);
        return () => {
          delete el.dataset.live;
        };
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      className={`hrs-p ${className}`}
      aria-label={label}
      style={{ "--from": from, "--to": to } as React.CSSProperties}
    >
      <div className="hrs-stage">{children}</div>
    </section>
  );
}

/** The time card every passage carries: whose side, when, and one line of what happened. */
export function TimeCard({
  kicker,
  when,
  clock,
  children,
  className = "",
}: {
  kicker: string;
  when: string;
  clock?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`hrs-card ${className}`}>
      <p className="hrs-kicker mono">{kicker}</p>
      <p className="hrs-when">
        <span>{when}</span>
        {clock && <span className="hrs-clock mono">{clock}</span>}
      </p>
      <p className="hrs-cap">{children}</p>
    </div>
  );
}

/** Once every passage has taken its height, let every ScrollTrigger on the page measure again. */
export function HoursRefresh() {
  useGSAP(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    const fonts = document.fonts?.ready.then(() => ScrollTrigger.refresh());
    void fonts;
    return () => cancelAnimationFrame(id);
  });
  return null;
}

/** The visible part of a 1440 x 900 viewBox drawn with `xMidYMax slice` into a box of w x h. */
export function visibleBox(w: number, h: number) {
  const s = Math.max(w / 1440, h / 900);
  const vw = w / s;
  const vh = h / s;
  const x0 = (1440 - vw) / 2;
  const y0 = 900 - vh;
  return { x0, y0, vw, vh, s };
}
