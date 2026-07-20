"use client";

/**
 * THE SPINE — the hero's current, made visible for the whole descent.
 *
 * One continuous procedural streamline runs from the coil's quadrant at the
 * hero seam down to the decision record, threading a measured anchor at every
 * chapter: the capture inbox slot, the booking window, the 15-minute setup
 * line, the interlude sky, the bento, and finally the record's landing stack —
 * where it flattens out and ends. The page's claim, drawn as one line: every
 * charge rides a single system from intake to record. A spool, not a hole.
 *
 * Layering ("under glass"): the line lives at the BOTTOM of the body's
 * stacking order — above the paper, the washes and the band grain, below
 * every .wrap of content — so it reads as the system flowing beneath the
 * product's surface. Paper (the receipts it spits out at each station) flies
 * on a second layer ABOVE the content, riding the actual path via
 * MotionPathPlugin. Between the two layers sits the page.
 *
 * Motion doctrine (Ben's): the reader's scroll IS the wind. Everything here
 * is scroll-scrubbed — the bright packet riding the line, every emission —
 * nothing runs on a clock; stop scrolling and the air holds still. All
 * variance is seeded (replay-identical), never Math.random.
 *
 * Decoration only: aria-hidden, pointer-events none, desktop + motion only
 * (the layers collapse entirely elsewhere; the story still reads in copy).
 * Geometry is measured client-side and rebuilt on resize / font settle.
 */

import { useRef, useState } from "react";
import Image from "next/image";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { gsap, ScrollTrigger, useGSAP } from "./gsap";
import { seeded } from "./wind-sweep";

gsap.registerPlugin(MotionPathPlugin);

const MM_SPINE = "(prefers-reduced-motion: no-preference) and (min-width: 981px)";

const GREEN = "#0ecc83"; /* --green: the current on paper */
const AURORA = "#2ede97"; /* --aurora: the current over night */

/* How far the layer reaches up into the hero, so the line is born inside the
   coil's veiled bottom edge instead of popping at the seam. Keep in sync with
   the .lp-spine / .lp-spine-paper `top` in landing.css. */
const HERO_REACH = 120;

/* the stations the current threads, in page order. ax/ay = fractional point
   inside the anchor's rect. */
type StationSpec = { key: string; sel: string; ax: number; ay: number; dx: number };
const STATIONS: readonly StationSpec[] = [
  { key: "capture", sel: "#capture .ci-slot", ax: 0.5, ay: 0.35, dx: 0 },
  /* the gap between copy and window: the line (and the boarding pass riding
     it) keeps to open band instead of covering the fare evidence */
  { key: "book", sel: "#booking .app-frame", ax: 0, ay: 0.55, dx: -46 },
  /* the gutter between the 0:00 and 0:12 columns — the line threads the
     timeline without running through either column's copy */
  { key: "enforce", sel: "#setup .su-rule", ax: 0.325, ay: 0.5, dx: 0 },
  { key: "sky", sel: ".ar-interlude", ax: 0.56, ay: 0.44, dx: 0 },
  { key: "inside", sel: "#inside .bn-grid", ax: 0.44, ay: 0.55, dx: 0 },
  { key: "record", sel: "#record .rec-landing", ax: 0.28, ay: 0.75, dx: 0 },
];

/* per-leg sway direction & magnitude (hero->capture, capture->book, …):
   chosen so the sway keeps clear of headings, copy columns, and the product
   windows at every station. capture->book sways RIGHT so the descent (and
   the boarding pass riding it) stays in open air beside the booking copy,
   never across the heading. */
const LEG_DIR = [1, 0.55, -0.6, -0.25, 1, 1];

/* Bare-ink text blocks the line must stay quiet behind. Wherever the path
   actually crosses one of these (measured, per viewport), the gradient dims
   to QUIET_DIM across that band — the current ducks under the type instead
   of running through it. Opaque cards need no entry: the line already
   disappears beneath them ("under glass"). */
const QUIET_SELS = [
  "#capture .ar-head",
  "#booking .bk-copy",
  "#setup .ar-head",
  "#setup .su-step",
  "#inside .ar-head",
  "#record .rec-grid > div:first-child",
  ".ar-interlude-copy",
];
const QUIET_DIM = 0.16; /* opacity multiplier inside a quiet band */
const QUIET_PAD = 24; /* px of quiet beyond the text block */
const QUIET_RAMP = 52; /* px of soft ramp on either side */

type Pt = { x: number; y: number };
type Seg = { p1: Pt; c1: Pt; c2: Pt; p2: Pt };

type Stop = { off: number; c: string; o: number };

type Geo = {
  w: number;
  h: number;
  d: string;
  stops: Stop[];
  /* path fractions for the emissions, precomputed from the same samples */
  ems: {
    intake: { f0: number; f1: number };
    pass: { f0: number; f1: number };
    stamp: { f0: number; f1: number; fNode: number };
    unspool: { f0: number; f1: number };
  };
};

/* ---- quiet-zone gradient math (all piecewise-linear, offsets = y/h) ---- */

const hexRgb = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mixHex = (a: string, b: string, t: number) => {
  const A = hexRgb(a);
  const B = hexRgb(b);
  return `#${A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("")}`;
};

/* read the base gradient's color/opacity at an offset */
function readStops(stops: Stop[], off: number): { c: string; o: number } {
  if (off <= stops[0].off) return stops[0];
  for (let i = 1; i < stops.length; i++) {
    if (off <= stops[i].off) {
      const a = stops[i - 1];
      const b = stops[i];
      const t = b.off === a.off ? 1 : (off - a.off) / (b.off - a.off);
      return { c: mixHex(a.c, b.c, t), o: a.o + (b.o - a.o) * t };
    }
  }
  return stops[stops.length - 1];
}

/* fold merged quiet windows into the gradient: sample the base stops at
   every breakpoint and multiply opacity by the dim factor (soft ramps) */
function quietStops(base: Stop[], wins: { a: number; b: number }[], ramp: number): Stop[] {
  if (!wins.length) return base;
  const dimAt = (off: number) => {
    let f = 1;
    for (const w of wins) {
      if (off <= w.a - ramp || off >= w.b + ramp) continue;
      if (off >= w.a && off <= w.b) f = Math.min(f, QUIET_DIM);
      else if (off < w.a) f = Math.min(f, 1 - (1 - QUIET_DIM) * ((off - (w.a - ramp)) / ramp));
      else f = Math.min(f, 1 - (1 - QUIET_DIM) * ((w.b + ramp - off) / ramp));
    }
    return f;
  };
  const offs = new Set<number>(base.map((s) => s.off));
  for (const w of wins) [w.a - ramp, w.a, w.b, w.b + ramp].forEach((o) => offs.add(Math.min(1, Math.max(0, o))));
  return [...offs]
    .sort((x, y) => x - y)
    .map((off) => {
      const s = readStops(base, off);
      return { off, c: s.c, o: s.o * dimAt(off) };
    });
}

/* Catmull-Rom through the route points -> cubic segments (uniform, t=1/6) */
function catmullRom(pts: Pt[]): Seg[] {
  const segs: Seg[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    segs.push({
      p1,
      c1: { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 },
      c2: { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 },
      p2,
    });
  }
  return segs;
}

function segsToPath(segs: Seg[]): string {
  const f = (n: number) => n.toFixed(1);
  let d = `M ${f(segs[0].p1.x)} ${f(segs[0].p1.y)}`;
  for (const s of segs) d += ` C ${f(s.c1.x)} ${f(s.c1.y)}, ${f(s.c2.x)} ${f(s.c2.y)}, ${f(s.p2.x)} ${f(s.p2.y)}`;
  return d;
}

/* Sample the cubics analytically (no DOM needed) so node positions and
   emission fractions come from the same math that draws the line. */
function sample(segs: Seg[], per = 28) {
  const pts: Pt[] = [];
  const cum: number[] = [];
  let len = 0;
  let prev: Pt | null = null;
  for (const s of segs) {
    for (let i = 0; i < per; i++) {
      const t = i / per;
      const u = 1 - t;
      const x = u * u * u * s.p1.x + 3 * u * u * t * s.c1.x + 3 * u * t * t * s.c2.x + t * t * t * s.p2.x;
      const y = u * u * u * s.p1.y + 3 * u * u * t * s.c1.y + 3 * u * t * t * s.c2.y + t * t * t * s.p2.y;
      const p = { x, y };
      if (prev) len += Math.hypot(p.x - prev.x, p.y - prev.y);
      pts.push(p);
      cum.push(len);
      prev = p;
    }
  }
  const last = segs[segs.length - 1].p2;
  if (prev) len += Math.hypot(last.x - prev.x, last.y - prev.y);
  pts.push(last);
  cum.push(len);
  return { pts, cum, total: len };
}

export function TheSpine() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState<Geo | null>(null);

  /* ---- measure + build (desktop + motion only; rebuilt on resize) ---- */
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const layer = root.querySelector<HTMLElement>(".lp-spine");
      const body = layer?.parentElement;
      if (!layer || !body) return;

      const mm = gsap.matchMedia();
      mm.add(MM_SPINE, () => {
        let alive = true;

        const build = () => {
          if (!alive) return;
          const L = layer.getBoundingClientRect();
          if (!L.width || !L.height) return;
          const w = L.width;
          const h = L.height;

          const rectOf = (sel: string) => {
            const el = document.querySelector(sel);
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return { x: r.left - L.left, y: r.top - L.top, w: r.width, h: r.height };
          };

          /* anchors */
          const marks: Record<string, Pt> = {};
          for (const s of STATIONS) {
            const r = rectOf(s.sel);
            if (!r) return; // a chapter is missing — draw nothing rather than a wrong line
            marks[s.key] = { x: r.x + r.w * s.ax + s.dx, y: r.y + r.h * s.ay };
          }

          /* the route: born in the coil's quadrant, then one seeded sway per
             leg so the descent reads as a current instead of a wire */
          const clampX = (x: number) => Math.min(w * 0.92, Math.max(w * 0.07, x));
          const route: Pt[] = [{ x: w * 0.7, y: 8 }];
          const legTargets = STATIONS.map((s) => marks[s.key]);
          let prev = route[0];
          legTargets.forEach((p, i) => {
            const dir = LEG_DIR[i] ?? (i % 2 === 0 ? -1 : 1);
            const push = (0.07 + seeded(i, 3) * 0.07) * w * dir;
            route.push({ x: clampX((prev.x + p.x) / 2 + push), y: (prev.y + p.y) / 2 });
            route.push(p);
            prev = p;
          });
          /* the tail: past the landing stack the line straightens and stops —
             the unspool, the current laid flat into the record */
          const rec = marks.record;
          route.push({ x: clampX(rec.x + 170), y: rec.y + 22 });

          const segs = catmullRom(route);
          const d = segsToPath(segs);
          const { pts, cum, total } = sample(segs);

          const fracAtY = (y: number) => {
            for (let i = 0; i < pts.length; i++) if (pts[i].y >= y) return cum[i] / total;
            return 1;
          };

          /* section rects (for gradient ranges and emission windows) */
          const capGrid = rectOf("#capture .cap-grid");
          const book = rectOf("#booking");
          const bookFrame = rectOf("#booking .app-frame");
          const setup = rectOf("#setup");
          const suGrid = rectOf("#setup .su-grid");
          const sky = rectOf(".ar-interlude");
          const inside = rectOf("#inside");
          if (!capGrid || !book || !bookFrame || !setup || !suGrid || !sky || !inside) return;

          /* the gradient carries the line's whole life: born faint in the
             hero's veil, green over paper, aurora across the night interlude,
             gone as it lands in the record */
          const endY = rec.y + 22;
          const baseStops = [
            { off: 0, c: AURORA, o: 0 },
            { off: (HERO_REACH - 30) / h, c: AURORA, o: 0.85 },
            { off: (HERO_REACH + 60) / h, c: GREEN, o: 0.9 },
            { off: Math.max(0, (sky.y - 60) / h), c: GREEN, o: 0.9 },
            { off: (sky.y + 50) / h, c: AURORA, o: 1 },
            { off: (sky.y + sky.h - 50) / h, c: AURORA, o: 1 },
            { off: (sky.y + sky.h + 70) / h, c: GREEN, o: 0.9 },
            { off: Math.min(1, (endY - 160) / h), c: GREEN, o: 0.85 },
            { off: Math.min(1, (endY + 30) / h), c: GREEN, o: 0 },
          ].sort((a, b) => a.off - b.off);

          /* quiet zones: wherever the drawn line actually runs through a
             bare-ink text block at this viewport, duck the gradient */
          const wins: { a: number; b: number }[] = [];
          for (const sel of QUIET_SELS) {
            document.querySelectorAll(sel).forEach((el) => {
              const r = el.getBoundingClientRect();
              const q = { x: r.left - L.left, y: r.top - L.top, w: r.width, h: r.height };
              const hit = pts.some(
                (p) => p.y >= q.y && p.y <= q.y + q.h && p.x >= q.x - 10 && p.x <= q.x + q.w + 10,
              );
              if (hit) wins.push({ a: (q.y - QUIET_PAD) / h, b: (q.y + q.h + QUIET_PAD) / h });
            });
          }
          wins.sort((p, q) => p.a - q.a);
          const merged: { a: number; b: number }[] = [];
          for (const wnd of wins) {
            const last = merged[merged.length - 1];
            if (last && wnd.a <= last.b + QUIET_RAMP / h) last.b = Math.max(last.b, wnd.b);
            else merged.push({ ...wnd });
          }
          const stops = quietStops(baseStops, merged, QUIET_RAMP / h);

          const ems: Geo["ems"] = {
            /* paper out of the coil, under the veil, into the capture card */
            intake: { f0: fracAtY(26), f1: fracAtY(capGrid.y + 30) },
            /* the boarding pass rides the open band above the product window
               and dissolves at its edge — it dives INTO the booking screen,
               never over the fare evidence */
            pass: { f0: fracAtY(book.y + 40), f1: fracAtY(bookFrame.y + 24) },
            /* a receipt is checked mid-air BELOW the timeline grid — its ride
               keeps to the section's open bottom band, clear of the columns
               and their chips */
            stamp: (() => {
              const y0 = Math.min(suGrid.y + suGrid.h + 18, setup.y + setup.h - 96);
              const y1 = setup.y + setup.h - 22;
              return { f0: fracAtY(y0), f1: fracAtY(y1), fNode: fracAtY(y0 + (y1 - y0) * 0.45) };
            })(),
            /* the last sheet decelerates toward the landing stack — it rides
               the open band BELOW the bento (never over the cells) */
            unspool: { f0: fracAtY(inside.y + inside.h - 60), f1: Math.max(0, fracAtY(rec.y - 6) - 0.006) },
          };

          setGeo({ w, h, d, stops, ems });
        };

        build();
        document.fonts?.ready.then(() => alive && build());

        let t: ReturnType<typeof setTimeout> | null = null;
        const ro = new ResizeObserver(() => {
          if (t) clearTimeout(t);
          t = setTimeout(build, 180);
        });
        ro.observe(body);

        return () => {
          alive = false;
          ro.disconnect();
          if (t) clearTimeout(t);
          setGeo(null);
        };
      });
    },
    { scope: rootRef },
  );

  /* ---- animate: the packet rides the line, paper rides the path ---- */
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || !geo) return;
      const core = root.querySelector<SVGPathElement>(".sp-core");
      const layer = root.querySelector<HTMLElement>(".lp-spine");
      if (!core || !layer) return;

      const mm = gsap.matchMedia();
      mm.add(MM_SPINE, () => {
        const total = core.getTotalLength();

        /* the gust: a bright length of the current that travels just ahead of
           the reader — pure function of scroll, like everything else here */
        const pLen = Math.max(240, Math.min(480, total * 0.055));
        const packets = root.querySelectorAll<SVGPathElement>(".sp-packet, .sp-packet-glow");
        gsap.set(packets, { strokeDasharray: `${pLen} ${total + pLen}`, strokeDashoffset: pLen });
        gsap.to(packets, {
          strokeDashoffset: -total,
          ease: "none",
          scrollTrigger: { trigger: layer, start: "top 72%", end: "bottom 30%", scrub: true },
        });

        /* one emission = one scrubbed timeline: materialize on the current,
           ride the real path between two fractions, hand off, dissolve.
           NOTE: trigger/endTrigger selectors are resolved against document —
           useGSAP would scope selector STRINGS to rootRef, where the page's
           sections don't live, and an unresolved trigger degrades to body
           (or a zero-length window) silently. */
        const doc = (t: Element | string | undefined) =>
          typeof t === "string" ? document.querySelector(t) ?? undefined : t;
        const fly = (
          sel: string,
          f0: number,
          f1: number,
          trig: Element | string,
          start: string,
          end: string,
          opts: {
            r0?: number;
            r1?: number;
            scaleEnd?: number;
            chipAt?: number;
            fadeOutAt?: number;
            endTrigger?: Element | string;
          } = {},
        ) => {
          const el = root.querySelector<HTMLElement>(sel);
          const trigEl = doc(trig);
          if (!el || !trigEl || f1 <= f0) return;
          const chip = el.querySelector<HTMLElement>(".sp-chip, .sp-stamp");
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: trigEl,
              endTrigger: doc(opts.endTrigger),
              start,
              end,
              scrub: true,
              invalidateOnRefresh: true,
            },
          });
          tl.to(
            el,
            {
              motionPath: { path: core, align: core, alignOrigin: [0.5, 0.5], start: f0, end: f1 },
              ease: "none",
              duration: 1,
            },
            0,
          );
          tl.fromTo(el, { rotation: opts.r0 ?? 0 }, { rotation: opts.r1 ?? 0, ease: "none", duration: 1 }, 0);
          tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.08, ease: "none" }, 0.02);
          const out = opts.fadeOutAt ?? 0.9;
          tl.to(el, { autoAlpha: 0, duration: Math.min(0.1, 1 - out), ease: "none" }, out);
          if (opts.scaleEnd) tl.to(el, { scale: opts.scaleEnd, duration: 0.16, ease: "none" }, out - 0.06);
          if (chip && opts.chipAt !== undefined) {
            tl.fromTo(chip, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.09, ease: "none" }, opts.chipAt);
          }
          return tl;
        };

        const { intake, pass, stamp, unspool } = geo.ems;

        /* IN — receipts leave the coil's air and dive under the capture card,
           where the intake animation takes over the story */
        fly(".sp-in1", intake.f0, intake.f1, layer, "top 82%", "top 30%", {
          r0: -(6 + seeded(1, 9) * 8),
          r1: 4,
          scaleEnd: 0.62,
          fadeOutAt: 0.86,
          endTrigger: "#capture .cap-grid",
        });
        fly(".sp-in2", intake.f0 + 0.012, intake.f1 - 0.006, layer, "top 78%", "top 24%", {
          r0: 8 + seeded(2, 9) * 8,
          r1: -3,
          scaleEnd: 0.6,
          fadeOutAt: 0.84,
          endTrigger: "#capture .cap-grid",
        });

        /* OUT at booking — the trip departs with its paper already filed */
        fly(".sp-pass", pass.f0, pass.f1, "#booking", "top 78%", "bottom 26%", {
          r0: -4,
          r1: 3,
          chipAt: 0.42,
          fadeOutAt: 0.92,
        });

        /* CHECKED mid-air at enforce — the verdict lands while it flies */
        fly(".sp-stamp-carrier", stamp.f0, stamp.f1, "#setup", "top 78%", "bottom 24%", {
          r0: -7,
          r1: 2,
          chipAt: Math.max(0.08, Math.min(0.8, (stamp.fNode - stamp.f0) / Math.max(1e-4, stamp.f1 - stamp.f0))),
          fadeOutAt: 0.92,
        });

        /* UNSPOOL — the last sheet slows, straightens, and hands off to the
           record's landing stack (RecordLanding catches, in order, cited) */
        fly(".sp-out", unspool.f0, unspool.f1, "#inside", "top 60%", "bottom 45%", {
          r0: -10,
          r1: 1,
          fadeOutAt: 0.9,
          endTrigger: "#record",
        });

        if (process.env.NODE_ENV !== "production") {
          (window as unknown as Record<string, unknown>).__spineST = ScrollTrigger;
        }
      });
    },
    { dependencies: [geo], revertOnUpdate: true, scope: rootRef },
  );

  return (
    <div ref={rootRef} style={{ display: "contents" }}>
      <div className="lp-spine" aria-hidden="true">
        {geo && (
          <svg className="lp-spine-svg" width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`}>
            <defs>
              <linearGradient id="lpSpineGrad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={geo.h}>
                {geo.stops.map((s, i) => (
                  <stop key={i} offset={s.off} stopColor={s.c} stopOpacity={s.o} />
                ))}
              </linearGradient>
            </defs>
            <path className="sp-halo" d={geo.d} />
            <path className="sp-body" d={geo.d} />
            <path className="sp-core" d={geo.d} />
            <path className="sp-packet-glow" d={geo.d} />
            <path className="sp-packet" d={geo.d} />
          </svg>
        )}
      </div>
      <div className="lp-spine-paper" aria-hidden="true">
        {geo && (
          <>
            <div className="sp-fly sp-in1">
              <Image src="/landing/receipt-cafe.png" alt="" width={480} height={723} />
            </div>
            <div className="sp-fly sp-in2">
              <Image src="/landing/receipt-kitcho.png" alt="" width={416} height={1358} />
            </div>
            <div className="sp-fly sp-pass">
              <Image src="/landing/boarding-pass.png" alt="" width={640} height={779} />
              <span className="sp-chip">
                <span className="k">booked · in policy</span>
                <b>report opened itself</b>
              </span>
            </div>
            <div className="sp-fly sp-stamp-carrier">
              <Image src="/landing/receipt-taxi.png" alt="" width={480} height={698} />
              <span className="sp-stamp">cleared · ¥3,200 → $21.55</span>
            </div>
            <div className="sp-fly sp-out">
              <Image src="/landing/receipt-folio.png" alt="" width={420} height={1181} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
