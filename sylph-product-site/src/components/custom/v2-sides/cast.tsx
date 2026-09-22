"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Side } from "./parts";
import "./cast.css";

/*
 * The cast (owned by the cast track). `Figure` and `Head` are the only way the page draws Priya
 * and Dana, so their motion lives here, not at the call sites. Call sites pass a pose name, a
 * drawn height and a class; that API stays stable.
 *
 * What a figure does, all of it transform and opacity:
 *  - lands: drops onto its ground line with a small squash while its contact shadow grows;
 *  - breathes: a very slow idle, only while on screen (not the seated pose, the desk would breathe);
 *  - leans toward the pointer on desktop, with a little parallax against its shadow;
 *  - reacts to the charge. The courier dispatches `v2s:arrive` / `v2s:depart` ({ stop }), the hero
 *    dispatches `v2s:hero` ({ verdict, phase }). A figure reacts only to the stop in its own section.
 * Reduced motion and no script get the plain settled figure: nothing below runs, no pose swaps.
 */

type Rect = { x: number; y: number; w: number; h: number }; // % of the drawn box
type Pose = {
  w: number;
  h: number;
  alt: string;
  /** a second pose on the same canvas, crossfaded in for a reaction */
  swap?: "priya-read" | "dana-look" | "dana-desk-look";
  /** where the phone sits, for the snap flash */
  phone?: Rect;
  /** contact shadow span, % of the box width */
  shadow: [number, number];
  idle?: boolean;
  /** seated at a desk: no breath and no lean, furniture does not sway */
  still?: boolean;
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
    idle: true,
  },
  "priya-walk": {
    w: 695,
    h: 1125,
    alt: "Priya, walking with her suitcase and phone",
    phone: { x: 83, y: 31.5, w: 10, h: 6 },
    shadow: [10, 95],
    idle: true,
  },
  "dana-desk": { w: 938, h: 931, alt: "Dana, at a desk with a laptop", swap: "dana-desk-look", shadow: [6, 95], still: true },
  "dana-review": { w: 619, h: 1388, alt: "Dana, reading one sheet, pen in hand", swap: "dana-look", shadow: [18, 86], idle: true },
  together: { w: 912, h: 960, alt: "Priya and Dana together, Dana holding the closed report", shadow: [2, 93], idle: true, split: 55.15 },
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
const LAND_MS = 1150;
const PHONE_H = 240;

/* One pointer listener for every figure on the page. */
const leaners = new Set<HTMLElement>();
let pointerBound = false;
function bindPointer() {
  if (pointerBound) return;
  pointerBound = true;
  let raf = 0;
  let px = 0;
  let py = 0;
  const frame = () => {
    raf = 0;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    leaners.forEach((el) => {
      if (el.dataset.vis !== "1") return;
      const r = el.getBoundingClientRect();
      const lx = Math.max(-1, Math.min(1, (px - (r.left + r.width / 2)) / (vw * 0.5)));
      const ly = Math.max(-1, Math.min(1, (py - (r.top + r.height * 0.3)) / (vh * 0.6)));
      el.style.setProperty("--lx", lx.toFixed(3));
      el.style.setProperty("--ly", ly.toFixed(3));
    });
  };
  window.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse") return;
      px = e.clientX;
      py = e.clientY;
      if (!raf) raf = requestAnimationFrame(frame);
    },
    { passive: true },
  );
}

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
  /** false keeps the figure out of the story's reactions (it still lands, breathes and leans) */
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
    const timers = new Set<number>();
    const later = (fn: () => void, ms: number) => {
      const t = window.setTimeout(() => {
        timers.delete(t);
        fn();
      }, ms);
      timers.add(t);
    };
    /* a priority (hero) figure lands from CSS on load; the rest land when they scroll in */
    let landedAt = priority ? performance.now() + 150 + LAND_MS : Infinity;
    el.style.setProperty("--idle-delay", `${-(Math.random() * 6).toFixed(2)}s`);

    /* the charge can land in a scene a beat before its figure scrolls in: hold that reaction until
       the figure is seen, unless the charge has left again by then */
    let pending: Reaction | null = null;
    const io = new IntersectionObserver(
      ([e]) => {
        el.dataset.vis = e.isIntersecting ? "1" : "0";
        if (e.isIntersecting && !el.dataset.in) {
          el.dataset.in = "1";
          if (!priority) landedAt = performance.now() + LAND_MS;
        }
        if (e.isIntersecting && pending) {
          const k = pending;
          pending = null;
          play(k);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);

    if (!c.still && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      leaners.add(el);
      bindPointer();
    }

    /* the stop in this figure's own section, read live: pills can move while the page settles */
    const myStop = () => {
      const pill = el.closest("section")?.querySelector<HTMLElement>("[data-courier-stop]");
      const n = pill ? Number(pill.dataset.courierStop) : NaN;
      return Number.isFinite(n) ? n : null;
    };

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
      if (el!.dataset.vis !== "1") {
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
        Math.max(0, landedAt - performance.now()),
      );
    }

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
      /* a held pose returns early when the charge leaves, but is seen for at least a moment first;
         one that has not started yet (still landing) is dropped */
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
    return () => {
      io.disconnect();
      altImg?.removeEventListener("load", altReady);
      leaners.delete(el);
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("v2s:arrive", onArrive);
      window.removeEventListener("v2s:depart", onDepart);
      window.removeEventListener("v2s:hero", onHero);
    };
  }, [name, priority, react, c.still]);

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
      data-still={c.still ? "" : undefined}
      style={{ aspectRatio: `${c.w} / ${c.h}` }}
    >
      <span className="v2s-cast-shadow" aria-hidden="true" style={{ left: `${s0}%`, width: `${s1 - s0}%` }} />
      <span className="v2s-cast-body">
        <span className="v2s-cast-lean">
          <span className="v2s-cast-idle" data-idle={c.idle ? "" : undefined}>
            {c.split ? (
              <>
                <span className="v2s-cast-part v2s-cast-part--a" style={{ clipPath: `inset(0 ${100 - c.split}% 0 0)` }}>
                  {img(name, c.alt, "")}
                </span>
                <span className="v2s-cast-part v2s-cast-part--b" style={{ clipPath: `inset(0 0 0 ${c.split}%)` }} aria-hidden="true">
                  {img(name, "", "")}
                </span>
              </>
            ) : (
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
