"use client";

import { createElement, useRef, type ReactNode, type ElementType } from "react";
import {
  gsap,
  ScrollTrigger,
  SplitText,
  useGSAP,
  EASE_REVEAL,
  DUR_REVEAL,
  EASE_GUST,
  START_HEADING,
  START_GROUP,
  START_STAGE,
} from "./gsap";

const MM_MOTION = "(prefers-reduced-motion: no-preference)";

/**
 * The wisp: a streamline of air, drawn once and gone. Always causally
 * attached to something the wind carries (a departure or an arrival),
 * never ambient. CSS keeps it invisible — wind is transient, not evidence —
 * and GSAP reveals it only for the duration of its gesture.
 *
 * Sections animate it themselves: draw with `drawWisp(el, tl, at)`, which
 * strokes the paths in and dissolves the whole glyph before the gesture ends.
 */
export function Wisp({ className }: { className?: string }) {
  return (
    <svg
      className={`lp-wisp${className ? ` ${className}` : ""}`}
      viewBox="0 0 120 24"
      fill="none"
      aria-hidden="true"
    >
      <path className="w1" d="M4 16 C 34 16, 44 6, 74 6 S 112 12, 116 10" />
      <path className="w2" d="M14 21 C 38 21, 52 13, 78 13 S 104 17, 110 15" />
    </svg>
  );
}

/** Stroke a wisp's two paths in, then dissolve the glyph — all inside `tl` at `at`. */
export function drawWisp(el: Element | null, tl: gsap.core.Timeline, at: number, dur = 0.5) {
  if (!el) return;
  tl.set(el, { autoAlpha: 1 }, at);
  const paths = el.querySelectorAll<SVGPathElement>("path");
  paths.forEach((p) => {
    const len = p.getTotalLength();
    tl.fromTo(
      p,
      { strokeDasharray: len, strokeDashoffset: len },
      { strokeDashoffset: 0, duration: dur, ease: "power2.out" },
      at,
    );
  });
  tl.to(el, { autoAlpha: 0, duration: dur * 0.6, ease: "power1.out" }, at + dur * 0.7);
}

/**
 * An ambient loop breathes only while its stage is on screen. Tweens arrive
 * paused (or are paused here) and one ScrollTrigger toggles them — no frames
 * are spent on anything the reader can't see. ScrollTrigger over
 * IntersectionObserver because Lenis already drives ScrollTrigger.update:
 * one synced axis, no double bookkeeping. Call only inside mm.add(MM_MOTION).
 */
export function ambient(trigger: Element, ...tweens: gsap.core.Tween[]) {
  tweens.forEach((t) => t.pause());
  return ScrollTrigger.create({
    trigger,
    start: "top bottom",
    end: "bottom top",
    onToggle: (self) => tweens.forEach((t) => (self.isActive ? t.play() : t.pause())),
  });
}

const STATIONS = ["book", "capture", "match", "enforce", "record"] as const;
export type Station = (typeof STATIONS)[number];

/**
 * Section eyebrow: the airstream dash (a real element, so it can draw in
 * with the heading) + the label, plus the page's running head — the five-
 * station pipeline rail with this section's station lit. The rail repeats
 * the hero foot / footer line verbatim, so the body reads as stops on one
 * line of air rather than a stack of slides.
 */
export function SectionEyebrow({
  children,
  station,
}: {
  children: ReactNode;
  station?: Station;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MM_MOTION, () => {
        gsap.from(el.querySelector(".ar-dash"), {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 0.6,
          ease: EASE_REVEAL,
          scrollTrigger: { trigger: el, start: START_GROUP, once: true },
        });
      });
    },
    { scope: ref },
  );

  return (
    <span className="ar-eyebrow-row" ref={ref}>
      {station && (
        <span className="ar-rail" aria-hidden="true">
          {STATIONS.map((s, i) => (
            <span key={s} className={s === station ? "is-on" : undefined}>
              {i > 0 && <i>&gt;</i>}
              {s}
            </span>
          ))}
        </span>
      )}
      <span className="ar-eyebrow">
        <i className="ar-dash" aria-hidden="true" />
        {children}
      </span>
    </span>
  );
}

/**
 * Line-mask headline reveal: lines rise out of overflow-hidden wrappers, once,
 * on scroll-in. Static (fully visible) under reduced motion or before JS.
 * autoSplit re-splits when webfonts settle so masks never sit on wrong breaks.
 */
export function RevealHeading({
  as: Tag = "h2",
  className,
  children,
  delay = 0,
  start = START_HEADING,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  delay?: number;
  start?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MM_MOTION, () => {
        const split = SplitText.create(el, {
          type: "lines",
          mask: "lines",
          linesClass: "lp-line",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 112,
              duration: DUR_REVEAL,
              ease: EASE_REVEAL,
              stagger: 0.09,
              delay,
              scrollTrigger: { trigger: el, start, once: true },
              onComplete: () => {
                gsap.set(self.lines, { clearProps: "willChange" });
              },
            }),
        });
        return () => split.revert();
      });
    },
    { scope: ref },
  );

  /* createElement, not <Tag …>: JSX over a bare ElementType union collapses
     its props to `never` under TS 5.9 + React 19 types. Same runtime. */
  return createElement(Tag, { ref, className }, children);
}

/**
 * Rise-and-fade group: targets stagger up 18px, once, on scroll-in.
 * By default the direct children animate; pass `selector` to give list
 * items their own cadence instead of the whole list arriving as one slab.
 */
export function RiseGroup({
  className,
  children,
  stagger = 0.08,
  start = START_GROUP,
  selector,
}: {
  className?: string;
  children: ReactNode;
  stagger?: number;
  start?: string;
  selector?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MM_MOTION, () => {
        const targets = selector ? el.querySelectorAll(selector) : el.children;
        if (!targets.length) return;
        gsap.from(targets, {
          y: 18,
          autoAlpha: 0,
          duration: 0.8,
          ease: EASE_REVEAL,
          stagger,
          scrollTrigger: { trigger: el, start, once: true },
        });
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/** Re-export for sections that write their own choreography. */
export {
  gsap,
  ScrollTrigger,
  SplitText,
  useGSAP,
  EASE_REVEAL,
  DUR_REVEAL,
  EASE_GUST,
  START_HEADING,
  START_GROUP,
  START_STAGE,
  MM_MOTION,
};
