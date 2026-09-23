"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/components/custom/site/motion";
import type { Side } from "./parts";
import "./cast.css";

/*
 * The cast (owned by the cast track). `Figure` and `Head` are the only way the page draws Priya
 * and Dana, so their motion lives here, not at the call sites. Call sites pass a pose name, a
 * drawn height and a class; that API stays stable.
 *
 * The choreography says whose turn it is, scrubbed to the scroll (GSAP ScrollTrigger on the
 * window scroller, so Lenis stays in sync):
 *  - Priya is the one on the road. She walks into her scenes from her own edge of the page, a
 *    few steps with a small bob, and slows into her spot facing the page.
 *  - Dana stays put. He rises into his scenes from the ground line, like a stage lift, clipped at
 *    the floor so nothing shows below it, his contact shadow growing under him.
 *  - When a scene scrolls away its person steps down through the floor (desktop). The hero pair
 *    sink the same way as the hero leaves, handing the page to the chapters.
 *  - At month end the two arrive from their two directions: Priya walks in, Dana rises beside her.
 *  - Reactions to the charge (courier `v2s:arrive` / `v2s:depart`, hero `v2s:hero`) play only on a
 *    landed figure: Priya's phone flashes or she reads her answer, Dana looks up, the pair lean in.
 * Phones get the entrances (shorter, fewer steps) and no exits. Reduced motion and no script get
 * the plain settled figure: nothing below runs. The hero stills are opaque from the first frame
 * (they are the page's LCP): their intro and exit are transform and clip only.
 */

type Rect = { x: number; y: number; w: number; h: number }; // % of the drawn box
type Pose = {
  w: number;
  h: number;
  alt: string;
  /** a second pose on the same canvas, crossfaded in for a reaction */
  swap?: "priya-read" | "dana-look" | "dana-desk-look";
  /** where the phone sits, for the snap flash (in the unmirrored render) */
  phone?: Rect;
  /** contact shadow span, % of the box width (as drawn) */
  shadow: [number, number];
  /** drawn mirrored, so a walker faces the way she travels */
  mirror?: boolean;
  /** two people on one canvas: cut at this % so each can move on their own */
  split?: number;
};

/* The cast: matte clay renders, transparent WebP. Decorative, never a claim. */
export const CAST = {
  "priya-snap": {
    w: 764,
    h: 1302,
    alt: "Priya, photographing a receipt beside her suitcase",
    swap: "priya-read",
    phone: { x: 67.5, y: 17, w: 9.5, h: 6.5 },
    shadow: [3, 80],
  },
  "priya-walk": {
    w: 695,
    h: 1125,
    alt: "Priya, walking with her suitcase and phone",
    phone: { x: 83, y: 31.5, w: 10, h: 6 },
    shadow: [5, 90],
    mirror: true,
  },
  "dana-desk": { w: 938, h: 931, alt: "Dana, at a desk with a laptop", swap: "dana-desk-look", shadow: [6, 95] },
  "dana-review": { w: 619, h: 1388, alt: "Dana, reading one sheet, pen in hand", swap: "dana-look", shadow: [18, 86] },
  together: { w: 912, h: 960, alt: "Priya and Dana together, Dana holding the closed report", shadow: [2, 93], split: 55.15 },
} satisfies Record<string, Pose>;
export type CastName = keyof typeof CAST;

type Reaction = "flash" | "read" | "glance" | "meet";

/* Which reaction a pose plays when the charge lands at the stop in its own section. Keyed on the
   pose, so chapters can recast a scene without touching this: Priya snaps (a flash) where the
   receipt starts and reads her answer everywhere else, the pair lean in. Dana looks up only when
   the charge reaches his queue (stop 4): at the policy stop the rule does the checking and he is
   not involved, which is the point of the page. */
function reactionFor(name: CastName, stop: number): Reaction | null {
  if (name === "together") return "meet";
  if (name === "priya-walk") return "flash";
  if (name === "priya-snap") return stop === 1 ? "flash" : "read";
  return stop === 4 ? "glance" : null;
}

const HOLD: Record<Reaction, number> = { flash: 700, read: 3400, glance: 2800, meet: 2000 };
const INTRO_MS = 1300; // the hero pair's CSS settle
const PHONE_H = 240;
const GROUND = 2.6; // % of the box below the feet (the renders' transparent margin)
const DESK = "(prefers-reduced-motion: no-preference) and (min-width: 861px)";
const PHONE = "(prefers-reduced-motion: no-preference) and (max-width: 860px)";

/* Priya's side is the left edge of the page, Dana's the right: who travels and who rises. */
const walker = (name: CastName) => name === "priya-walk" || name === "priya-snap";

/** A full figure. `height` is its largest drawn height in CSS px (for the image request); CSS sets the box. */
export function Figure({
  name,
  className = "",
  priority = false,
  height,
  react = true,
  sizes,
}: {
  name: CastName;
  className?: string;
  priority?: boolean;
  height: number;
  /** false keeps the figure out of the story's reactions (it still enters and leaves) */
  react?: boolean;
  /** overrides the computed `sizes` for every layer of the figure (base and reaction pose) */
  sizes?: string;
}) {
  const c: Pose = CAST[name];
  const w = Math.round((c.w * height) / c.h);
  /* phones draw every figure at most PHONE_H tall, so they never fetch the desktop width */
  const pw = Math.round((c.w * Math.min(height, PHONE_H)) / c.h);
  const sz = sizes ?? `(max-width: 860px) ${pw}px, ${w}px`;
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const section = el.closest("section");
    const timers = new Set<number>();
    const later = (fn: () => void, ms: number) => {
      const t = window.setTimeout(() => {
        timers.delete(t);
        fn();
      }, ms);
      timers.add(t);
    };

    /* ---------- reactions: only on a figure that has landed and is on screen ---------- */
    let landed = priority; // the hero pair are in place from the first frame
    const introAt = priority ? performance.now() + INTRO_MS : 0;
    let vis = false;
    let pending: Reaction | null = null;
    let playing: Reaction | null = null;
    let startedAt = 0;
    const end = () => {
      playing = null;
      delete el.dataset.act;
    };
    /* a pose swap waits for its image: fading the still out over an undecoded pose would blank the figure */
    const altImg = el.querySelector<HTMLImageElement>(".v2s-cast-alt img");
    const altReady = () => {
      el.dataset.alt = "1";
    };
    if (altImg) {
      if (altImg.complete && altImg.naturalWidth) altReady();
      else altImg.addEventListener("load", altReady, { once: true });
    }
    function play(kind: Reaction) {
      if (playing) return;
      if (!vis || !landed) {
        pending = kind;
        return;
      }
      playing = kind;
      later(
        () => {
          el!.dataset.act = kind;
          startedAt = performance.now();
          later(end, HOLD[kind]);
        },
        Math.max(0, introAt - performance.now()),
      );
    }
    const settle = (isLanded: boolean) => {
      landed = isLanded;
      if (landed && vis && pending) {
        const k = pending;
        pending = null;
        play(k);
      }
    };
    const io = new IntersectionObserver(
      ([e]) => {
        vis = e.isIntersecting;
        settle(landed);
      },
      { threshold: 0.3 },
    );
    io.observe(el);

    /* the stop in this figure's own section, read live: pills can move while the page settles */
    const myStop = () => {
      const pill = section?.querySelector<HTMLElement>("[data-courier-stop]");
      const n = pill ? Number(pill.dataset.courierStop) : NaN;
      return Number.isFinite(n) ? n : null;
    };
    const onArrive = (e: Event) => {
      if (!react) return;
      const stop = (e as CustomEvent<{ stop: number }>).detail?.stop;
      /* stop 0 is the hero, which plays its own receipts: its figures answer v2s:hero instead */
      if (typeof stop !== "number" || stop === 0 || stop !== myStop()) return;
      const kind = reactionFor(name, stop);
      if (kind) play(kind);
    };
    const onDepart = (e: Event) => {
      const stop = (e as CustomEvent<{ stop: number }>).detail?.stop;
      if (stop !== myStop()) return;
      pending = null;
      if (playing !== "read" && playing !== "glance") return; // a flash or a lean just finishes
      timers.forEach((t) => window.clearTimeout(t));
      timers.clear();
      /* a held pose returns early when the charge leaves, but is seen for at least a moment first */
      if (el.dataset.act) later(end, Math.max(0, startedAt + 1200 - performance.now()));
      else playing = null;
    };
    /* the hero's own moment: Priya's phone flashes as a receipt goes, Dana looks up only when it
       needs him (a note or a block); a cleared charge files itself and he stays with his sheet */
    const onHero = (e: Event) => {
      if (!react || myStop() !== 0) return;
      const d = (e as CustomEvent<{ verdict?: string; phase?: string }>).detail ?? {};
      if (name === "priya-snap" && d.phase === "sent") play("flash");
      if (name === "dana-review" && d.phase === "landed" && (d.verdict === "note" || d.verdict === "block")) play("glance");
    };
    window.addEventListener("v2s:arrive", onArrive);
    window.addEventListener("v2s:depart", onDepart);
    window.addEventListener("v2s:hero", onHero);

    /* ---------- the choreography, scrubbed to the scroll ---------- */
    const q = <T extends Element>(s: string) => el.querySelector<T>(s);
    const inEl = q<HTMLElement>(".v2s-cast-in");
    const outEl = q<HTMLElement>(".v2s-cast-out");
    const gIn = q<HTMLElement>(".v2s-cast-gin");
    const gOut = q<HTMLElement>(".v2s-cast-gout");
    const partA = q<HTMLElement>(".v2s-cast-part--a .v2s-cast-step");
    const partB = q<HTMLElement>(".v2s-cast-part--b .v2s-cast-step");
    const clipAt = (p: number) => `inset(0% 0% ${p <= 0 ? 0 : Math.min(100, p + GROUND)}% 0%)`;

    /* walking in from the left edge: off-screen start, a few steps, slowing into the spot */
    const walkIn = (tl: gsap.core.Timeline, target: HTMLElement, frac: number, steps: number, lift: number) => {
      const off = () => -(el.getBoundingClientRect().left + el.offsetWidth * frac + 32);
      tl.fromTo(target, { x: off }, { x: 0, ease: "power2.out", duration: 1 }, 0);
      tl.fromTo(target, { y: 0 }, { y: -lift, duration: 1 / (steps * 2), repeat: steps * 2 - 1, yoyo: true, ease: "sine.inOut" }, 0);
      if (gIn && target !== partA) tl.fromTo(gIn, { x: off }, { x: 0, ease: "power2.out", duration: 1 }, 0);
    };
    /* rising from the ground line: clipped at the floor, the shadow growing under him */
    const riseIn = (tl: gsap.core.Timeline, target: HTMLElement, at = 0) => {
      tl.fromTo(
        target,
        { yPercent: 100, scale: 0.94, clipPath: clipAt(100) },
        { yPercent: 0, scale: 1, clipPath: clipAt(0), ease: "power3.out", duration: 1 - at },
        at,
      );
    };

    const mm = gsap.matchMedia();
    mm.add({ desk: DESK, phone: PHONE }, (ctx) => {
      const phone = !!ctx.conditions?.phone;
      if (!section || !inEl || !outEl) return;
      const scrub = phone ? 0.4 : true;

      if (priority) {
        /* the hero pair: in place from the first frame; on desktop they step down through the
           floor as the hero leaves, Priya first. Transform and clip only: the still stays opaque. */
        if (!phone) {
          const late = name === "dana-review" ? 0.08 : 0;
          const tl = gsap.timeline({
            scrollTrigger: { trigger: section, start: `bottom ${70 - late * 100}%`, end: `bottom ${8 - late * 100}%`, scrub },
          });
          tl.fromTo(outEl, { yPercent: 0, clipPath: clipAt(0) }, { yPercent: 100, clipPath: clipAt(100), ease: "power2.in", duration: 1 }, 0);
          if (gOut) tl.fromTo(gOut, { scaleX: 1, opacity: 1 }, { scaleX: 0.3, opacity: 0, ease: "power2.in", duration: 1 }, 0);
        }
        return;
      }

      /* entrance: landed once the scene's heading area is in view */
      const tl = gsap.timeline({
        scrollTrigger: phone
          ? { trigger: el, start: "top 100%", end: "bottom 78%", scrub, invalidateOnRefresh: true, onUpdate: (st) => settle(st.progress > 0.97) }
          : { trigger: section, start: "top 88%", end: "top 28%", scrub, invalidateOnRefresh: true, onUpdate: (st) => settle(st.progress > 0.97) },
      });
      if (name === "together" && partA && partB) {
        walkIn(tl, partA, (c.split ?? 50) / 100, phone ? 2 : 3, phone ? 3 : 5);
        riseIn(tl, partB, 0.3);
        if (gIn) tl.fromTo(gIn, { scaleX: 0.35, opacity: 0 }, { scaleX: 1, opacity: 1, ease: "power2.out", duration: 1 }, 0);
      } else if (walker(name)) {
        walkIn(tl, inEl, 1, phone ? 2 : 4, phone ? 3 : 6);
      } else {
        riseIn(tl, inEl);
        if (gIn) tl.fromTo(gIn, { scaleX: 0.3, opacity: 0 }, { scaleX: 1, opacity: 1, ease: "power3.out", duration: 1 }, 0);
      }

      /* exit (desktop only, not the finale): step down through the floor as the scene scrolls away */
      if (!phone && name !== "together") {
        const out = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "bottom 32%",
            end: "bottom 0%",
            scrub,
            onUpdate: (st) => settle(st.progress < 0.03),
          },
        });
        out.fromTo(outEl, { yPercent: 0, clipPath: clipAt(0) }, { yPercent: 100, clipPath: clipAt(100), ease: "power2.in", duration: 1 }, 0);
        if (gOut) out.fromTo(gOut, { scaleX: 1, opacity: 1 }, { scaleX: 0.3, opacity: 0, ease: "power2.in", duration: 1 }, 0);
      }
    });
    /* layout under the figures keeps changing while the page settles (fonts, pins, lazy panels) */
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh, { once: true });

    return () => {
      mm.revert();
      io.disconnect();
      altImg?.removeEventListener("load", altReady);
      window.removeEventListener("load", refresh);
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("v2s:arrive", onArrive);
      window.removeEventListener("v2s:depart", onDepart);
      window.removeEventListener("v2s:hero", onHero);
    };
  }, [name, priority, react, c.split]);

  const img = (src: string, alt: string, cls: string, later = false) => (
    <Image
      src={`/site/characters/${src}.webp`}
      alt={alt}
      width={c.w}
      height={c.h}
      sizes={sz}
      priority={priority && !later}
      /* any chapter still can be the largest paint on a deep link, so stills load eagerly but at low
         fetch priority (behind the hero); a reaction pose is only needed once its figure is seen */
      loading={priority && !later ? undefined : later ? "lazy" : "eager"}
      fetchPriority={priority || later ? undefined : "low"}
      className={`v2s-cast-img ${cls}`}
      draggable={false}
    />
  );
  const [s0, s1] = c.shadow;

  return (
    <span
      ref={ref}
      className={`v2s-fig v2s-cast ${className}`}
      data-cast={name}
      data-prio={priority ? "" : undefined}
      style={{ aspectRatio: `${c.w} / ${c.h}` }}
    >
      <span className="v2s-cast-gin" aria-hidden="true">
        <span className="v2s-cast-gout">
          <span className="v2s-cast-shadow" style={{ left: `${s0}%`, width: `${s1 - s0}%` }} />
        </span>
      </span>
      <span className="v2s-cast-body">
        <span className="v2s-cast-in">
          <span className="v2s-cast-out">
            {c.split ? (
              <>
                <span className="v2s-cast-part v2s-cast-part--a" style={{ clipPath: `inset(0 ${100 - c.split}% 0 0)` }}>
                  <span className="v2s-cast-step">{img(name, c.alt, "")}</span>
                </span>
                <span className="v2s-cast-part v2s-cast-part--b" style={{ clipPath: `inset(0 0 0 ${c.split}%)` }} aria-hidden="true">
                  <span className="v2s-cast-step">{img(name, "", "")}</span>
                </span>
              </>
            ) : (
              <span className="v2s-cast-face" data-mirror={c.mirror ? "" : undefined}>
                <span className="v2s-cast-act">
                  {img(name, c.alt, "v2s-cast-base")}
                  {c.swap ? (
                    <span className="v2s-cast-alt" aria-hidden="true">
                      {img(c.swap, "", "", true)}
                    </span>
                  ) : null}
                  {c.phone ? (
                    <span
                      className="v2s-cast-flash"
                      aria-hidden="true"
                      style={{ left: `${c.phone.x}%`, top: `${c.phone.y}%`, width: `${c.phone.w}%`, height: `${c.phone.h}%` }}
                    />
                  ) : null}
                </span>
              </span>
            )}
          </span>
        </span>
      </span>
    </span>
  );
}

/** A head in a ring of the person's own colour. Decorative: the name always sits beside it. */
export function Head({ who, size = 40, className = "" }: { who: Side; size?: number; className?: string }) {
  return (
    <span className={`v2s-head v2s-head--${who} ${className}`} style={{ width: size, height: size }} aria-hidden="true">
      <Image src={`/site/characters/${who}-head.webp`} alt="" width={256} height={256} sizes={`${size}px`} draggable={false} />
    </span>
  );
}
