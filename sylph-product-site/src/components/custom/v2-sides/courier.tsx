"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/components/custom/site/motion";
import { Mark } from "@/components/custom/site/mark";
import { CHARGE } from "./data";
import { play } from "./sound";
import "./courier.css";

/*
 * The courier: Sushi Kanda, $84.20, travelling the page. The charge rests at the stops
 * ([data-courier-stop], 0 in the hero, 1 to 5 in the chapters) and flies between them as the
 * visitor scrolls, each leg on a carrier that says what that step is:
 *
 *   0 to 1  the Sylph bird lifts it out of Dana's queue and swings wide to Priya's matched charge
 *   1 to 2  it rides a rail, square-cornered through the page's empty space, down to the rule
 *   2 to 3  the verdict goes back to Priya: it folds into a paper plane and glides to her
 *   3 to 4  her reply carries it: a sent text bubble with her note, across to Dana's queue
 *   4 to 5  the bird again, once around, and sets it down on the month-end report, cleared
 *
 * Every leg is driven by scroll through a ScrollTrigger window (Lenis drives the window scroll;
 * see scroll.tsx), so scrolling back rewinds it; a flight left mid-air when scrolling stops
 * finishes by itself in the direction of travel. Positions are read live from the stops' boxes on every frame, and
 * the legs' scroll windows re-measure on every refresh (resize, fonts, any change in page height).
 * The layer is fixed to the viewport and moves with transform and opacity only.
 *
 * While one stop holds the charge its pill is itself; every other pill is an empty dashed slot
 * (data-courier="away"). Landing dispatches v2s:arrive, leaving dispatches v2s:depart. Under
 * reduced motion or without script the layer never mounts and every pill is simply present.
 */

type V = { x: number; y: number };
type Cubic = [V, V, V, V];
type Box = { x: number; y: number; w: number; h: number; el: HTMLElement };

/* the bird glyph's beak points up and to the right: this offset turns it along its heading */
const BIRD_HEADING = 40;
/* the plane glyph's nose sits 13 degrees above its tail */
const PLANE_HEADING = 13;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const c01 = (v: number) => clamp(v, 0, 1);
const smooth = (v: number) => {
  const t = c01(v);
  return t * t * (3 - 2 * t);
};
const outQ = (t: number) => 1 - (1 - t) * (1 - t);
/* crosses quickly near the stops and lingers in open air, so the middle of a flight reads */
const linger = (t: number) => t + (0.34 / (2 * Math.PI)) * Math.sin(2 * Math.PI * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const add = (a: V, b: V): V => ({ x: a.x + b.x, y: a.y + b.y });
const DEG = 180 / Math.PI;

function cub(c: Cubic, t: number): V {
  const m = 1 - t;
  const a = m * m * m;
  const b = 3 * m * m * t;
  const d = 3 * m * t * t;
  const e = t * t * t;
  return { x: a * c[0].x + b * c[1].x + d * c[2].x + e * c[3].x, y: a * c[0].y + b * c[1].y + d * c[2].y + e * c[3].y };
}

/** A path of cubics, walked at constant speed: point and heading (radians) at arc fraction u. */
function walker(segs: Cubic[]) {
  const N = 28;
  const pts: V[] = [];
  const len: number[] = [];
  const seg: number[] = [];
  let L = 0;
  segs.forEach((c, i) => {
    for (let k = i === 0 ? 0 : 1; k <= N; k++) {
      const p = cub(c, k / N);
      const q = pts[pts.length - 1];
      if (q) L += Math.hypot(p.x - q.x, p.y - q.y);
      pts.push(p);
      len.push(L);
      seg.push(i);
    }
  });
  const head = pts.map((_, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    return Math.atan2(b.y - a.y, b.x - a.x);
  });
  return {
    length: L,
    at(u: number) {
      const s = c01(u) * L;
      let lo = 1;
      let hi = len.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (len[mid] < s) lo = mid + 1;
        else hi = mid;
      }
      const span = len[lo] - len[lo - 1] || 1;
      const f = c01((s - len[lo - 1]) / span);
      const a = pts[lo - 1];
      const b = pts[lo];
      let dh = head[lo] - head[lo - 1];
      if (dh > Math.PI) dh -= 2 * Math.PI;
      if (dh < -Math.PI) dh += 2 * Math.PI;
      return { x: lerp(a.x, b.x, f), y: lerp(a.y, b.y, f), h: head[lo - 1] + dh * f, seg: seg[lo] };
    },
  };
}

type Leg = {
  from: number;
  to: number;
  start: number;
  end: number;
  /** the viewport y the path starts and ends at, measured at refresh (the rail ignores these) */
  ay: number;
  zy: number;
  /** scroll progress through the window, the drawn progress easing after it, and a finish in progress */
  ps: number;
  pd: number;
  latch: 0 | 1 | null;
  /** hurrying through because the scroll has left it behind (no landing sound then) */
  fast: boolean;
  /** when it last landed (ms), so the next leg waits a beat before lifting off */
  doneAt: number;
  st: ScrollTrigger | null;
};

/* what each leg's flight fraction is spent on: before GRAB the carrier gathers the charge at its
   stop, after DROP it hands it to the next one; in between it follows the path */
const PHASES: Record<number, [number, number]> = { 0: [0.14, 0.86], 1: [0, 1], 2: [0.12, 0.88], 3: [0.16, 0.86], 4: [0.12, 0.88] };

export function Courier() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = root.current;
    if (!layer) return;
    const q = <T extends Element>(s: string) => layer.querySelector<T>(s)!;
    const bird = q<HTMLElement>(".v2s-cour-bird");
    const birdBone = q<SVGElement>(".v2s-cour-bird-bone");
    const pill = q<HTMLElement>(".v2s-cour-pill--note");
    const pillOk = q<HTMLElement>(".v2s-cour-pill--ok");
    const plane = q<HTMLElement>(".v2s-cour-plane");
    const bubble = q<HTMLElement>(".v2s-cour-bubble");
    const rails = Array.from(layer.querySelectorAll<HTMLElement>(".v2s-cour-rail"));
    const movers: HTMLElement[] = [bird, pill, pillOk, plane, bubble, ...rails];

    const mm = gsap.matchMedia();
    mm.add({ motion: "(prefers-reduced-motion: no-preference)", phone: "(max-width: 760px)" }, (ctx) => {
      const { motion, phone } = ctx.conditions as { motion: boolean; phone: boolean };
      if (!motion) return;
      layer.dataset.on = "1";

      /* live, never cached: the hero re-renders stop 0 while a visitor replays a receipt */
      const stopEl = (n: number) => document.querySelector<HTMLElement>(`[data-courier-stop="${n}"]`);
      const box = (n: number): Box | null => {
        const el = stopEl(n);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, el };
      };
      /* Where a stop sits in the viewport as a function of scroll σ. A stop inside a sticky pin (the
         policy chapter pins on desktop) holds still while pinned: vy(σ) = y - σ + clamp(σ - a, 0, m),
         with y its natural document centre, a the scroll at which the pin sticks and m how far it
         travels stuck. Measured per refresh with the pins briefly unstuck, so the result does not
         depend on where the page happened to be scrolled. */
      type Nat = { y: number; a: number; m: number };
      const nat = new Map<number, Nat>();
      const measureNat = () => {
        nat.clear();
        const sy = window.scrollY;
        const found: { n: number; el: HTMLElement; pin: HTMLElement | null }[] = [];
        for (const n of order) {
          const el = stopEl(n);
          if (!el) continue;
          let pin: HTMLElement | null = null;
          for (let e = el.parentElement; e && e !== document.body; e = e.parentElement) {
            if (getComputedStyle(e).position === "sticky") {
              pin = e;
              break;
            }
          }
          found.push({ n, el, pin });
        }
        const pins = Array.from(new Set(found.map((f) => f.pin).filter((x): x is HTMLElement => !!x)));
        const tops = new Map(pins.map((pn) => [pn, parseFloat(getComputedStyle(pn).top) || 0]));
        const saved = pins.map((pn) => pn.style.position);
        pins.forEach((pn) => (pn.style.position = "static"));
        for (const { n, el, pin } of found) {
          const r = el.getBoundingClientRect();
          const y = r.top + r.height / 2 + sy;
          if (!pin || !pin.parentElement) {
            nat.set(n, { y, a: Infinity, m: 0 });
            continue;
          }
          const pr = pin.getBoundingClientRect();
          const par = pin.parentElement;
          const cs = getComputedStyle(par);
          const bottom = par.getBoundingClientRect().bottom - (parseFloat(cs.paddingBottom) || 0) - (parseFloat(cs.borderBottomWidth) || 0);
          nat.set(n, { y, a: pr.top + sy - (tops.get(pin) ?? 0), m: Math.max(0, bottom - pr.bottom) });
        }
        pins.forEach((pn, i) => (pn.style.position = saved[i]));
      };
      const vy = (n: number, sig: number) => {
        const N = nat.get(n);
        if (!N) return 0;
        return N.y - sig + (Number.isFinite(N.a) ? clamp(sig - N.a, 0, N.m) : 0);
      };
      /* the first scroll at which stop n has risen to viewport height t */
      const reach = (n: number, t: number) => {
        const N = nat.get(n);
        if (!N) return 0;
        if (!Number.isFinite(N.a) || N.y - N.a <= t) return N.y - t;
        return N.y + N.m - t;
      };

      const order = Array.from(document.querySelectorAll<HTMLElement>("[data-courier-stop]"))
        .map((el) => Number(el.dataset.courierStop))
        .filter((n) => Number.isFinite(n))
        .sort((a, b) => a - b);
      if (order.length < 2) return;

      let dirty = false;
      let movedAt = -Infinity;
      const request = () => {
        dirty = true;
      };

      /* ---------- state: who holds the charge, and the two events ---------- */
      /* the hero plays the sushi receipt into Dana's queue on load, and again whenever a visitor
         replays it; until it lands there the charge is the hero's, so the courier leaves stop 0
         alone (no flight from it, no slot styling, no arrive event) */
      let heroBusy = order[0] === 0;
      const emit = (type: "v2s:arrive" | "v2s:depart", stop: number) => {
        if (type === "v2s:arrive" && stop === 0 && heroBusy) return;
        window.dispatchEvent(new CustomEvent(type, { detail: { stop } }));
      };
      const onHero = (e: Event) => {
        const d = (e as CustomEvent<{ id: string; phase: string }>).detail;
        if (d?.id !== "sushi") return;
        heroBusy = d.phase === "sent";
        marked = "";
        request();
      };
      window.addEventListener("v2s:hero", onHero);
      /* if the hero never reports (its play was skipped), do not hold the charge forever */
      const heroTimer = setTimeout(() => {
        heroBusy = false;
        request();
      }, 7000);

      let marked = "";
      const mark = (now: number | null) => {
        const key = `${now}:${heroBusy}`;
        if (key === marked) return;
        marked = key;
        for (const n of order) {
          const el = stopEl(n);
          if (!el) continue;
          if (n === 0 && heroBusy) {
            delete el.dataset.courier;
            continue;
          }
          const v = n === now ? "here" : "away";
          if (el.dataset.courier !== v) el.dataset.courier = v;
        }
      };
      /* the journey as one line of states: 2i holds stop order[i], 2i + 1 flies leg i. Moving from
         one state to another walks every state between, so a fast scroll or an anchor jump that
         skips a stop in a single frame still lands there (arrive) and leaves again (depart). */
      let state = -1;
      const settle = (next: number) => {
        const k = next % 2 === 0 ? next / 2 : -1;
        mark(k >= 0 ? order[k] : null);
        if (state < 0) {
          /* first frame (a load mid-page included): take the state as found, announce only where the charge is */
          state = next;
          if (k >= 0) emit("v2s:arrive", order[k]);
          return;
        }
        const was = state;
        while (state !== next) {
          const up = next > state;
          const from = state;
          state += up ? 1 : -1;
          if (from % 2 === 0) emit("v2s:depart", order[from / 2]);
          if (state % 2 === 0) emit("v2s:arrive", order[state / 2]);
        }
        /* a landing the visitor scrolled into makes a sound (the paper plane's is a swish); never on
           load, never for a stop only passed through. sound.ts stays silent until it is switched on
           and the visitor has clicked something. */
        if (k >= 0 && was !== next && performance.now() - movedAt < 2500) {
          const leg = legs[next > was ? k - 1 : k];
          if (leg && !leg.fast) play(leg.from === 2 ? "swish" : "land");
        }
      };

      /* ---------- drawing ---------- */
      let used = new Set<HTMLElement>();
      const put = (el: HTMLElement, x: number, y: number, o = 1, r = 0, sx = 1, sy = sx) => {
        used.add(el);
        el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-50%) rotate(${r.toFixed(2)}deg) scale(${sx.toFixed(3)},${sy.toFixed(3)})`;
        el.style.opacity = c01(o).toFixed(3);
      };
      /* a rail segment is a 1px square stretched along one axis from a to b, 2px thick; the
         segments turn square corners, so each has one horizontal or one vertical run */
      const rail = (el: HTMLElement, a: V, b: V, o: number) => {
        used.add(el);
        const flat = Math.abs(b.y - a.y) < 0.5;
        const x = Math.min(a.x, b.x) - (flat ? 0 : 1);
        const y = Math.min(a.y, b.y) - (flat ? 1 : 0);
        const w = flat ? Math.abs(b.x - a.x) + 1 : 2;
        const h = flat ? 2 : Math.abs(b.y - a.y) + 1;
        el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) scale(${w.toFixed(1)},${h.toFixed(1)})`;
        el.style.opacity = c01(o).toFixed(3);
      };
      const hideRest = () => {
        for (const el of movers) if (!used.has(el) && el.style.opacity !== "0") el.style.opacity = "0";
      };

      /* the bird banks through a turn instead of flying upside down: it narrows as its heading
         passes vertical and comes out mirrored. In a loop it simply rolls with the path. */
      const flyBird = (x: number, y: number, h: number, o: number, bank = true, bone = 0) => {
        const c = Math.cos(h);
        let r = h * DEG + BIRD_HEADING;
        let sx = 1;
        if (bank) {
          sx = clamp(c / 0.32, -1, 1);
          if (Math.abs(sx) < 0.06) sx = sx < 0 ? -0.06 : 0.06;
          if (c < 0) r = h * DEG + 180 - BIRD_HEADING;
        }
        put(bird, x, y, o, r, sx, 1);
        birdBone.style.opacity = bone.toFixed(3);
      };
      const hang = () => bird.offsetHeight * 0.44 + pill.offsetHeight * 0.5;

      /* keep control points on screen */
      const vp = (x: number, y: number, W: number, H: number): V => ({ x: clamp(x, W * 0.05, W * 0.95), y: clamp(y, H * 0.12, H * 0.9) });

      /* a viewport-frame path is drawn for the in-sync case; near its ends it bends onto the live
         stop, so a lagging scrub or a late layout change still lands exactly on the pill */
      const onto = (pt: V, q: number, A: V, Z: V, S: V, E: V): V => {
        const w0 = smooth(1 - q / 0.25);
        const w1 = smooth((q - 0.75) / 0.25);
        return { x: pt.x + (S.x - A.x) * w0 + (E.x - Z.x) * w1, y: pt.y + (S.y - A.y) * w0 + (E.y - Z.y) * w1 };
      };

      const draw = (leg: Leg, p: number) => {
        const S = box(leg.from);
        const E = box(leg.to);
        if (!S || !E) return;
        const W = window.innerWidth;
        const H = window.innerHeight;
        const [g, d] = PHASES[leg.from] ?? [0.12, 0.88];
        const A = { x: S.x, y: leg.ay };
        const Z = { x: E.x, y: leg.zy };
        const qf = c01((p - g) / (d - g));
        const kIn = c01(p / g);
        const kOut = c01((p - d) / (1 - d));
        /* a carried pill never leaves the screen, which matters on phones where paths run edge to edge */
        const pw = pill.offsetWidth;
        const keep = (x: number, left = pw / 2, right = pw / 2) => clamp(x, left + 6, Math.max(left + 6, W - right - 6));

        if (leg.from === 0 || leg.from === 4) {
          /* ---------- the bird ---------- */
          const loop = leg.from === 4;
          const segs: Cubic[] = [];
          let loopFrom = -1;
          let loopTo = -1;
          /* which way the bird sets off: toward the roomier side for the arc, rightward into the loop */
          const out = loop ? 1 : A.x < W / 2 ? 1 : -1;
          if (!loop) {
            /* a wide arc: up out of the queue, round the far side of the page, in to the charge */
            const P1 = vp(W * (out > 0 ? 0.9 : 0.1), H * 0.4, W, H);
            segs.push([A, vp(A.x + out * W * 0.12, A.y - H * 0.34, W, H), vp(W * (out > 0 ? 0.94 : 0.06), H * 0.12, W, H), P1]);
            segs.push([P1, vp(P1.x, H * 0.7, W, H), vp(Z.x - out * W * 0.22, Z.y + H * 0.06, W, H), Z]);
          } else {
            /* off and around once: down and right into a loop, then a hop down onto the report */
            const r = Math.min(H * 0.13, W * 0.1, 120);
            const cx = clamp((A.x + Z.x) / 2, r + W * 0.08, W - r - W * 0.08);
            const by = clamp(Math.max(A.y, Z.y) + H * 0.1, H * 0.2 + 2 * r, H * 0.86);
            const B = { x: cx, y: by };
            const k = r * 0.5523;
            const cy = by - r;
            const R = { x: cx + r, y: cy };
            const T = { x: cx, y: cy - r };
            const Lf = { x: cx - r, y: cy };
            segs.push([A, { x: A.x + W * 0.03, y: A.y + H * 0.14 }, { x: B.x - r * 0.9, y: B.y }, B]);
            loopFrom = 1;
            segs.push([B, { x: B.x + k, y: B.y }, { x: R.x, y: R.y + k }, R]);
            segs.push([R, { x: R.x, y: R.y - k }, { x: T.x + k, y: T.y }, T]);
            segs.push([T, { x: T.x - k, y: T.y }, { x: Lf.x, y: Lf.y - k }, Lf]);
            segs.push([Lf, { x: Lf.x, y: Lf.y + k }, { x: B.x - k, y: B.y }, B]);
            loopTo = 4;
            segs.push([B, { x: B.x + r * 1.1, y: B.y }, { x: Z.x - r * 0.4, y: Z.y - r * 0.9 }, Z]);
          }
          const path = walker(segs);
          const hg = hang();
          /* the empty bird comes down from off screen and levels out over the charge, already
             heading the way the flight sets off */
          const hold = { x: S.x, y: S.y - hg };
          const from = { x: S.x - out * W * 0.32, y: -60 };
          const approach = walker([[from, { x: from.x, y: hold.y - H * 0.06 }, { x: hold.x - out * W * 0.14, y: hold.y }, hold]]);
          const hA = approach.at(1).h;
          /* over month end's deep green ground the bird is drawn in bone */
          const ground = loop ? E.el.closest("section")?.getBoundingClientRect().top ?? Infinity : Infinity;
          const boneAt = (y: number) => smooth((y - ground + 24) / 48);
          const cargo = (x: number, y: number, o: number, r: number, ok: number) => {
            put(pill, x, y, o * (1 - ok), r);
            if (ok > 0) put(pillOk, x, y, o * ok, r);
          };

          if (p < g) {
            const at = approach.at(outQ(kIn));
            flyBird(at.x, at.y, at.h, smooth(kIn * 2.5), true, boneAt(at.y));
            cargo(S.x, S.y, 1, 0, 0);
          } else if (p <= d) {
            const u = linger(qf);
            const at = path.at(u);
            const pos = onto(at, qf, A, Z, S, E);
            pos.x = keep(pos.x);
            const inLoop = loop && at.seg >= loopFrom && at.seg <= loopTo;
            /* in the loop the charge is held at the feet and rolls with the bird; elsewhere it hangs
               and swings back against the direction of flight */
            const belly = inLoop ? { x: -Math.sin(at.h) * hg, y: Math.cos(at.h) * hg } : { x: 0, y: hg };
            const lift = smooth(qf / 0.12);
            const bpos = { x: pos.x - belly.x, y: pos.y - belly.y };
            const h = at.h + turn(hA, at.h) * (1 - smooth(qf / 0.1));
            const swing = inLoop ? wrapDeg(at.h * DEG) : clamp(Math.cos(h) * 6 * lift, -8, 8);
            flyBird(bpos.x, bpos.y, h, 1, !inLoop, boneAt(bpos.y));
            cargo(pos.x, pos.y, 1, swing, loop ? smooth((qf - 0.7) / 0.3) : 0);
          } else {
            /* set down: the charge sits on the stop, the bird carries on up and away */
            const k = kOut;
            const end = path.at(1);
            const dir = { x: Math.cos(end.h) * W, y: (Math.sin(end.h) - 1.2) * H };
            const n = Math.hypot(dir.x, dir.y) || 1;
            const away = { x: (dir.x / n) * W * 0.22 * k * k, y: (dir.y / n) * H * 0.3 * k * k };
            const bpos = add({ x: E.x, y: E.y - hg }, away);
            const ha = Math.atan2(dir.y, dir.x);
            flyBird(bpos.x, bpos.y, end.h + turn(end.h, ha) * smooth(k / 0.35), 1 - smooth(k * 1.3), true, boneAt(bpos.y));
            cargo(E.x, E.y, 1, 0, loop ? 1 : 0);
          }
        } else if (leg.from === 1) {
          /* ---------- the rail: a square-cornered track through the page's empty space. Down into
             the receipts chapter's bottom margin, along it, down the column gap beside Dana's copy,
             under her copy, and up into the rule's slot. It belongs to the page, so it scrolls
             with it. ---------- */
          const rect = (el: Element | null | undefined) => el?.getBoundingClientRect();
          const gridS = rect(S.el.closest(".v2c-grid"));
          const gridE = E.el.closest(".v2c-grid");
          const copyE = rect(E.el.closest(".v2c-copy"));
          let pts: V[];
          if (gridS && gridE && copyE) {
            const hs = gridS.bottom + 26;
            const sib = Array.from(gridE.children)
              .filter((c) => !c.contains(E.el))
              .map((c) => c.getBoundingClientRect())
              .filter((r) => r.width > 0);
            const g = gridE.getBoundingClientRect();
            const rightN = Math.min(g.right, ...sib.filter((r) => r.left >= copyE.right - 1).map((r) => r.left));
            const leftN = Math.max(g.left, ...sib.filter((r) => r.right <= copyE.left + 1).map((r) => r.right));
            const xr = (copyE.right + rightN) / 2;
            const xl = (copyE.left + leftN) / 2;
            const xv = Math.abs(xl - S.x) <= Math.abs(xr - S.x) ? xl : xr;
            const he = Math.max(copyE.bottom, E.y + E.h / 2) + 18;
            pts = [
              { x: S.x, y: S.y },
              { x: S.x, y: hs },
              { x: xv, y: hs },
              { x: xv, y: he },
              { x: E.x, y: he },
              { x: E.x, y: E.y },
            ];
          } else {
            const gut = Math.max(8, Math.min(S.x, E.x) - W * 0.2);
            pts = [
              { x: S.x, y: S.y },
              { x: S.x, y: S.y + 44 },
              { x: gut, y: S.y + 44 },
              { x: gut, y: E.y },
              { x: E.x, y: E.y },
            ];
          }
          const lens = pts.slice(1).map((b, i) => Math.hypot(b.x - pts[i].x, b.y - pts[i].y));
          const L = lens.reduce((a, b) => a + b, 0) || 1;
          let s = (0.5 - Math.cos(Math.PI * p) / 2) * L;
          let at = pts[pts.length - 1];
          const trail = 1 - smooth((p - 0.9) / 0.1);
          for (let i = 0; i < lens.length; i++) {
            const f = lens[i] ? c01(s / lens[i]) : 1;
            const b = { x: lerp(pts[i].x, pts[i + 1].x, f), y: lerp(pts[i].y, pts[i + 1].y, f) };
            if (f > 0 && s > 0) rail(rails[i], pts[i], b, trail);
            if (s <= lens[i]) {
              at = b;
              s = 0;
              break;
            }
            s -= lens[i];
          }
          put(pill, keep(at.x), at.y, 1);
        } else if (leg.from === 2) {
          /* ---------- the paper plane: a throw up and back, a long glide down the near side, and a
             flare into Priya's thread ---------- */
          const side = A.x < W / 2 ? -1 : 1;
          const P1 = vp(side < 0 ? W * 0.08 : W * 0.92, H * 0.52, W, H);
          const path = walker([
            [A, vp(A.x - side * W * 0.1, A.y - H * 0.26, W, H), vp(side < 0 ? W * 0.02 : W * 0.98, H * 0.16, W, H), P1],
            [P1, vp(P1.x, H * 0.86, W, H), vp(Z.x + side * W * 0.3, Z.y + H * 0.14, W, H), Z],
          ]);
          /* it folds pointing level, the way it is thrown, and noses up into the throw */
          const hFold = side > 0 ? Math.PI : 0;
          if (p < g) {
            const k = smooth(kIn);
            const h0 = hFold;
            put(pill, S.x, S.y, 1 - smooth((kIn - 0.35) / 0.5), 0, lerp(1, 0.45, k), lerp(1, 0.12, k));
            putPlane(S.x, S.y, h0, smooth(kIn / 0.6), lerp(0.3, 1, k));
          } else if (p <= d) {
            const at = path.at(linger(qf));
            const pos = onto(at, qf, A, Z, S, E);
            /* the glide undulates a little, nose rising and falling with it */
            const env = Math.sin(qf * Math.PI);
            const bob = Math.sin(qf * Math.PI * 4) * 12 * env;
            const x = pos.x - Math.sin(at.h) * bob;
            const y = pos.y + Math.cos(at.h) * bob;
            const h = at.h + turn(hFold, at.h) * (1 - smooth(qf / 0.12));
            putPlane(x, y, h - Math.cos(qf * Math.PI * 4) * 0.07 * env, 1, 1);
          } else {
            const k = smooth(kOut);
            const h1 = path.at(0.98).h;
            putPlane(E.x, E.y, h1 - 0.35 * k, 1 - smooth(kOut / 0.6), lerp(1, 0.3, k));
            put(pill, E.x, E.y, smooth((kOut - 0.2) / 0.5), 0, lerp(0.45, 1, k), lerp(0.12, 1, k));
          }
        } else if (leg.from === 3) {
          /* ---------- the text bubble: her reply, with the note, sent across to Dana ---------- */
          const bw = bubble.offsetWidth;
          const bh = bubble.offsetHeight;
          const ph = pill.offsetHeight;
          const off = { x: bw / 2 - 14 - pw / 2, y: bh / 2 - 9 - ph / 2 };
          const R = { x: clamp(Math.max(A.x, Z.x) + W * 0.34, A.x, W - bw + pw / 2 - 16), y: (A.y + Z.y) / 2 - H * 0.08 };
          const path = walker([
            [A, { x: lerp(A.x, R.x, 0.33), y: lerp(A.y, R.y, 0.33) }, { x: R.x - W * 0.06, y: R.y }, R],
            [R, { x: R.x + W * 0.04, y: R.y + H * 0.02 }, { x: lerp(R.x, Z.x, 0.6), y: lerp(R.y, Z.y, 0.6) }, Z],
          ]);
          if (p < g) {
            const k = outQ(kIn);
            put(pill, S.x, S.y, 1);
            put(bubble, S.x + off.x * k, S.y + off.y * k, smooth(kIn * 1.5), 0, lerp(0.5, 1, k));
          } else if (p <= d) {
            const u = linger(qf);
            const at = path.at(u);
            const pos = onto(at, qf, A, Z, S, E);
            pos.x = keep(pos.x, pw / 2 + 14, bw - pw / 2 - 14);
            /* sent: it leans into the direction of travel, most at the fastest point */
            const lean = Math.cos(at.h) * 5 * Math.sin(qf * Math.PI);
            put(pill, pos.x, pos.y, 1, lean);
            put(bubble, pos.x + off.x, pos.y + off.y, 1, lean);
          } else {
            const k = smooth(kOut);
            put(pill, E.x, E.y, 1);
            put(bubble, E.x + off.x * (1 - k), E.y + off.y * (1 - k), 1 - k, 0, lerp(1, 0.5, k));
          }
        }
      };

      /* ---------- phones ----------
         A small screen gets its own journey instead of a shrunken desktop flight. The charge lifts
         off its stop to a dock just under the nav, over copy the visitor has already scrolled past,
         rides across the top of the screen on that leg's carrier in its light form, and comes down
         onto the next stop. Everything it needs is measured once per refresh (document positions
         of the stops, the nav's bottom, element sizes), so a frame reads only scrollY. */
      const geo = { W: 0, H: 0, nav: 64, pw: 166, ph: 36, bw: 232, bh: 90, bird: 44, ground: Infinity, stops: new Map<number, V>() };
      const docPos = (el: HTMLElement): V => {
        let x = el.offsetWidth / 2;
        let y = el.offsetHeight / 2;
        for (let e: HTMLElement | null = el; e; e = e.offsetParent as HTMLElement | null) {
          x += e.offsetLeft;
          y += e.offsetTop;
        }
        return { x, y };
      };
      const recache = () => {
        geo.W = layer.clientWidth;
        geo.H = layer.clientHeight;
        geo.nav = document.querySelector(".v2s-nav")?.getBoundingClientRect().bottom ?? 64;
        geo.pw = pill.offsetWidth;
        geo.ph = pill.offsetHeight;
        geo.bw = bubble.offsetWidth;
        geo.bh = bubble.offsetHeight;
        geo.bird = bird.offsetHeight;
        const five = stopEl(order[order.length - 1])?.closest("section");
        geo.ground = five ? five.getBoundingClientRect().top + window.scrollY : Infinity;
        geo.stops.clear();
        for (const n of order) {
          const el = stopEl(n);
          if (el) geo.stops.set(n, docPos(el));
        }
      };

      const drawPhone = (leg: Leg, p: number) => {
        const sy = window.scrollY;
        const s0 = geo.stops.get(leg.from);
        const e0 = geo.stops.get(leg.to);
        if (!s0 || !e0) return;
        const { W, pw, ph } = geo;
        const S = { x: s0.x, y: s0.y - sy };
        const E = { x: e0.x, y: e0.y - sy };
        const kind = leg.from;
        const sc = kind === 3 ? 0.7 : 0.8;
        /* on a bird leg the bird rides above the chip, so the dock sits lower to keep it clear of the nav */
        const dockY = geo.nav + (ph * sc) / 2 + 10 + (kind === 0 || kind === 4 ? geo.bird * 0.8 * 0.8 : 0);
        /* the dock's ends keep the chip, and the bubble around it, on screen */
        const left = kind === 3 ? (pw * sc) / 2 + 14 * sc + 8 : (pw * sc) / 2 + 10;
        const right = kind === 3 ? W - 8 - (geo.bw - pw / 2 - 14) * sc : W - (pw * sc) / 2 - 10;
        const xr = Math.max(left, right);
        const xd = clamp(E.x, left, xr);
        const LIFT = 0.24;
        const DOWN = 0.74;
        /* where the chip is at progress t: up to the dock's far end, across it, down to the stop */
        const at = (t: number): V & { s: number } => {
          if (t < LIFT) {
            const k = smooth(t / LIFT);
            return { x: lerp(S.x, xr, outQ(t / LIFT)), y: lerp(S.y, dockY, k), s: lerp(1, sc, k) };
          }
          if (t < DOWN) {
            const k = (t - LIFT) / (DOWN - LIFT);
            return { x: lerp(xr, xd, linger(k)), y: dockY + Math.sin(k * Math.PI * 2) * 5, s: sc };
          }
          const k = smooth((t - DOWN) / (1 - DOWN));
          return { x: lerp(xd, E.x, k), y: lerp(dockY, E.y, k), s: lerp(sc, 1, k) };
        };
        const c = at(p);
        const b = at(Math.max(0, p - 0.006));
        const h = Math.hypot(c.x - b.x, c.y - b.y) > 0.01 ? Math.atan2(c.y - b.y, c.x - b.x) : Math.PI;
        const appear = smooth(p / 0.08);
        const leave = smooth((p - 0.9) / 0.1);

        if (kind === 0 || kind === 4) {
          /* the bird, small, holding the chip from above; it lets go at the stop and climbs away */
          const bs = 0.8;
          const hg = geo.bird * bs * 0.44 + (ph * c.s) / 2;
          const bx = c.x + (p > 0.9 ? leave * 30 : 0);
          const by = c.y - hg - (p > 0.9 ? leave * 60 : 0);
          const bone = kind === 4 ? smooth((by + sy - geo.ground + 12) / 24) : 0;
          const hb = p > 0.9 ? -Math.PI / 3 : h;
          const cb = Math.cos(hb);
          const sx = clamp(cb / 0.32, -1, 1) || 0.06;
          put(bird, bx, by, appear * (1 - leave), (cb < 0 ? hb * DEG + 180 - BIRD_HEADING : hb * DEG + BIRD_HEADING), sx * bs, bs);
          birdBone.style.opacity = bone.toFixed(3);
          const ok = kind === 4 ? smooth((p - 0.6) / 0.3) : 0;
          put(pill, c.x, c.y, 1 - ok, 0, c.s);
          if (ok > 0) put(pillOk, c.x, c.y, ok, 0, c.s);
        } else if (kind === 1) {
          /* the rail: an amber line drawn along the dock behind the chip */
          if (p > LIFT) {
            const k = (p - LIFT) / (DOWN - LIFT);
            const x = k >= 1 ? xd : lerp(xr, xd, linger(k));
            rail(rails[0], { x: Math.min(x, xr), y: dockY }, { x: Math.max(x, xr), y: dockY }, 1 - smooth((p - DOWN) / 0.2));
          }
          put(pill, c.x, c.y, 1, 0, c.s);
        } else if (kind === 2) {
          /* folds into a small plane off the stop, glides across, unfolds onto the next stop */
          const fold = smooth(p / (LIFT * 0.7));
          const open = smooth((p - (DOWN + 0.12)) / 0.14);
          const plane_ = fold * (1 - open);
          const ph_ = h + Math.sin(p * Math.PI * 6) * 0.08;
          const cp = Math.cos(ph_);
          const psx = clamp(cp / 0.3, -1, 1) || 0.08;
          put(plane, c.x, c.y, plane_, cp < 0 ? ph_ * DEG + 180 - PLANE_HEADING : ph_ * DEG + PLANE_HEADING, psx * 0.72, 0.72);
          const pillO = 1 - plane_;
          put(pill, c.x, c.y, pillO, 0, c.s * lerp(1, 0.5, plane_), c.s * lerp(1, 0.12, plane_));
        } else {
          /* her reply: the chip inside a small sent bubble with the note */
          const grow = smooth(p / LIFT);
          const gone = smooth((p - DOWN) / (1 - DOWN));
          const bs = sc * lerp(0.6, 1, grow) * lerp(1, 0.6, gone);
          const off = { x: (geo.bw / 2 - 14 - pw / 2) * bs, y: (geo.bh / 2 - 9 - ph / 2) * bs };
          put(bubble, c.x + off.x, c.y + off.y, grow * (1 - gone), 0, bs);
          put(pill, c.x, c.y, 1, 0, c.s);
        }
      };

      /* the plane faces its heading; flying back the other way it banks over like the bird */
      const putPlane = (x: number, y: number, h: number, o: number, s: number) => {
        const c = Math.cos(h);
        let sx = clamp(c / 0.3, -1, 1);
        if (Math.abs(sx) < 0.08) sx = sx < 0 ? -0.08 : 0.08;
        const r = c < 0 ? h * DEG + 180 - PLANE_HEADING : h * DEG + PLANE_HEADING;
        put(plane, x, y, o, r, sx * s, s);
      };
      const wrapDeg = (deg: number) => ((((deg + 180) % 360) + 360) % 360) - 180;
      /* the signed shortest turn from heading a to heading b, radians */
      const turn = (a: number, b: number) => {
        let t = b - a;
        while (t > Math.PI) t -= 2 * Math.PI;
        while (t < -Math.PI) t += 2 * Math.PI;
        return -t;
      };

      /* ---------- the legs and their scroll windows ---------- */
      const legs: Leg[] = [];
      for (let i = 0; i < order.length - 1; i++) {
        legs.push({ from: order[i], to: order[i + 1], start: 0, end: 1, ay: 0, zy: 0, ps: 0, pd: 0, latch: null, fast: false, doneAt: 0, st: null });
      }

      const render = () => {
        used = new Set();
        /* the furthest leg that has begun decides: in flight, or landed at its end */
        let i = legs.length - 1;
        while (i >= 0 && legs[i].pd <= 0) i--;
        if (i < 0) settle(0);
        else if (legs[i].pd >= 1) settle(2 * i + 2);
        else {
          settle(2 * i + 1);
          if (!(legs[i].from === 0 && heroBusy)) (phone ? drawPhone : draw)(legs[i], legs[i].pd);
        }
        hideRest();
      };

      /* A leg's scroll window opens when its stop rises to 42% of the viewport and closes when the
         next stop reaches 62%, so each stop holds the charge for a fifth of a screen and the flight
         spans the rest. The drawn flight is then paced in time (see step). */
      const measure = (leg: Leg, i: number) => {
        if (i === 0) measureNat();
        const H = window.innerHeight;
        const hero = i === 0 && leg.from === 0;
        /* a pinned stop takes the charge as its pin engages (wherever it sits on that screen) and
           keeps it until the pin is nearly done, so the compile plays with the charge in place */
        const pinned = (n: number) => {
          const N = nat.get(n);
          return N && Number.isFinite(N.a) && N.m > H * 0.3 ? N : null;
        };
        const PS = pinned(leg.from);
        const PE = pinned(leg.to);
        const a = hero ? 0 : PS ? PS.a + PS.m - H * 0.15 : Math.max(0, reach(leg.from, H * 0.42));
        const land = PE && PE.y - PE.a > H * 0.62 ? PE.a + H * 0.04 : reach(leg.to, H * 0.62);
        const b = Math.max(a + 160, land);
        const [g, d] = PHASES[leg.from] ?? [0.12, 0.88];
        const D = b - a;
        leg.start = a;
        leg.end = b;
        /* where each stop will sit in the viewport when the flight proper begins and ends */
        leg.ay = vy(leg.from, a + g * D);
        leg.zy = vy(leg.to, a + d * D);
      };
      legs.forEach((leg, i) => {
        leg.st = ScrollTrigger.create({
          invalidateOnRefresh: true,
          start: () => {
            measure(leg, i);
            return leg.start;
          },
          end: () => leg.end,
          onRefresh: request,
        });
      });

      /* Pacing. The drawn progress (pd) follows the scroll progress (ps), but a flight is never
         over in a blink: pd moves at most 1/LEG_S per second, so every leg is in the air for about
         two seconds at an ordinary scroll, longer at a slow one. Flights run one at a time: a leg
         waits for the one before it to land (or, scrolling back, for the one after it to rewind),
         and legs the scroll has left two or more behind hurry through. If scrolling stops
         mid-window the flight finishes by itself in the direction of travel (latch), eased;
         scrolling the other way releases it and the flight rewinds. */
      const LEG_S = phone ? 1.5 : 1.6;
      let lastY = window.scrollY;
      let dir = 1;
      let still = 0;
      const IDLE = 0.35;
      const step = (_t: number, dtMs: number) => {
        const dt = Math.min(0.1, dtMs / 1000);
        const y = window.scrollY;
        const moved = Math.abs(y - lastY) > 0.5;
        if (moved) {
          dir = y > lastY ? 1 : -1;
          lastY = y;
          still = 0;
          movedAt = performance.now();
        } else still += dt;
        const n = legs.length;
        for (let i = 0; i < n; i++) {
          const leg = legs[i];
          const ps = leg.st ? leg.st.progress : 0;
          leg.ps = ps;
          if (leg.latch !== null) {
            const toward = Math.sign(leg.latch - ps) === dir;
            if (ps === leg.latch || (moved && !toward)) leg.latch = null;
          } else if (still > IDLE && ps > 0 && ps < 1) {
            leg.latch = dir > 0 ? 1 : 0;
          }
          let target = leg.latch ?? ps;
          const now = performance.now();
          if (target > leg.pd && i > 0 && (legs[i - 1].pd < 1 || now - legs[i - 1].doneAt < (legs[i - 1].fast ? 0 : 350))) target = leg.pd;
          if (target < leg.pd && i < n - 1 && legs[i + 1].pd > 0) target = leg.pd;
          if (leg.pd === target) continue;
          const up = target > leg.pd;
          const hurry = up ? (legs[i + 2]?.ps ?? 0) > 0 : i >= 2 && legs[i - 2].ps < 1;
          leg.fast = hurry;
          const ease = 1 - Math.exp(-dt / (leg.latch !== null ? 0.45 : 0.22));
          const cap = ((hurry ? 6 : 1) / LEG_S) * dt;
          const move = clamp((target - leg.pd) * ease, -cap, cap);
          leg.pd = Math.abs(target - leg.pd - move) < 0.0008 ? target : leg.pd + move;
          if (leg.pd >= 1) leg.doneAt = now;
          dirty = true;
        }
        if (!dirty) return;
        dirty = false;
        render();
      };
      gsap.ticker.add(step);

      const onRefresh = () => {
        recache();
        marked = "";
        request();
      };
      ScrollTrigger.addEventListener("refresh", onRefresh);
      recache();

      /* re-measure when the page's height changes (chapters re-lay, images and fonts arrive) */
      const main = layer.closest("main") ?? document.body;
      let lastH = main.offsetHeight;
      let t: ReturnType<typeof setTimeout> | undefined;
      const ro = new ResizeObserver(() => {
        const h = main.offsetHeight;
        if (Math.abs(h - lastH) < 2) return;
        lastH = h;
        clearTimeout(t);
        t = setTimeout(() => ScrollTrigger.refresh(), 160);
      });
      ro.observe(main);
      document.fonts?.ready.then(() => ScrollTrigger.refresh());
      dirty = true;

      return () => {
        ro.disconnect();
        clearTimeout(t);
        gsap.ticker.remove(step);
        clearTimeout(heroTimer);
        ScrollTrigger.removeEventListener("refresh", onRefresh);
        window.removeEventListener("v2s:hero", onHero);
        delete layer.dataset.on;
        for (const el of movers) el.style.opacity = "0";
        for (const n of order) {
          const el = stopEl(n);
          if (el) delete el.dataset.courier;
        }
      };
    });
    return () => mm.revert();
  }, []);

  return (
    <div className="v2s-cour" ref={root} aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <i key={i} className="v2s-cour-rail" />
      ))}
      <div className="v2s-cour-bubble">
        <span className="v2s-cour-bubble-note">&ldquo;Late finish at the site visit, only place still open.&rdquo;</span>
      </div>
      <span className="v2s-token-pill v2s-cour-pill v2s-cour-pill--note">
        <span className="v2s-token-m">{CHARGE.merchant}</span>
        <span className="mono">{CHARGE.amount}</span>
      </span>
      <span className="v2s-token-pill v2s-cour-pill v2s-cour-pill--ok">
        <span className="v2s-token-m">{CHARGE.merchant}</span>
        <span className="mono">{CHARGE.amount}</span>
      </span>
      <svg className="v2s-cour-plane" viewBox="0 0 48 26" focusable="false">
        <path className="v2s-cour-plane-top" d="M1.5 13.5 L46.5 2 L17 16.5 Z" />
        <path className="v2s-cour-plane-fold" d="M17 16.5 L46.5 2 L23 24 Z" />
      </svg>
      <span className="v2s-cour-bird">
        <Mark className="v2s-cour-bird-ink" />
        <Mark className="v2s-cour-bird-bone" />
      </span>
    </div>
  );
}
