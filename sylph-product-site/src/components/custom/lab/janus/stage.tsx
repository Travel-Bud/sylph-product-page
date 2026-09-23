"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/components/custom/site/motion";
import { Pill } from "./parts";

/*
 * The stage runs in one of three modes:
 *
 *  - live: a desktop with a fine pointer, wide and tall enough. One viewport is pinned and the
 *    beats play on it, derived from the run's scroll progress. Column time t (0 to 5) says which
 *    beat the faces show: Priya's column moves with the scroll, Dana's against it. Story time
 *    sigma (0 to 6) runs from k to k+1 inside beat k; the charge crosses the seam early in the
 *    hold and what it causes appears once it lands. Scrolling is settled: when a wheel gesture
 *    or a scrollbar drag ends between two finished beats, the page carries on, in the direction
 *    it was going, to the next one, so any frame a visitor stops on is lined up and complete.
 *    The crossing follows the scroll but never faster than FLIGHT_S, so a quick settle still
 *    shows the charge travel.
 *  - stack: phones, tablets and touch screens. The beats are plain rows in the flow (Priya's half
 *    above Dana's below the desktop breakpoint), nothing is pinned or clipped, and as each
 *    seam comes into view the charge crosses it once.
 *  - still: reduced motion. The settled rows exactly as the server rendered them.
 */

declare global {
  interface Window {
    /** capture helper (live only): scroll position for a story time or a column time */
    __jn?: { y: (sigma: number) => number; yt: (t: number) => number };
  }
}

type Mode = "live" | "stack" | "still";
const LIVE_MQ = "(min-width: 861px) and (min-height: 600px) and (hover: hover) and (pointer: fine)";
const REDUCE_MQ = "(prefers-reduced-motion: reduce)";
function subscribe(cb: () => void) {
  const a = window.matchMedia(LIVE_MQ);
  const b = window.matchMedia(REDUCE_MQ);
  a.addEventListener("change", cb);
  b.addEventListener("change", cb);
  return () => {
    a.removeEventListener("change", cb);
    b.removeEventListener("change", cb);
  };
}
function readMode(): Mode {
  if (window.matchMedia(REDUCE_MQ).matches) return "still";
  return window.matchMedia(LIVE_MQ).matches ? "live" : "stack";
}

const HOLD = [0.08, 1, 1, 1, 1, 1.35];
const TRANS = 1;
const TOTAL = HOLD.reduce((a, b) => a + b, 0) + TRANS * (HOLD.length - 1);
/** scroll length of one unit, as a share of the stage height */
const UNIT = 0.8;
const CROSS: [number, number] = [0.08, 0.5];
/** from this share of a beat's hold on, the beat reads finished; the meet needs longer */
const SETTLED = 0.72;
const SETTLED_MEET = 0.6;
const FLIGHT_S = 0.5;
const FLIGHTS = [
  { k: 0, from: "0s", to: "1p" },
  { k: 1, from: "1p", to: "1d" },
  { k: 2, from: "2d", to: "2p" },
  { k: 3, from: "3p", to: "3d" },
  { k: 4, from: "4d", to: "4p" },
];
const FLOOD: [number, number] = [5.1, 5.38];
const ONE_AT = 5.28;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const inOut = (v: number) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);
const outCubic = (v: number) => 1 - Math.pow(1 - v, 3);
const holdStart = (k: number) => HOLD.slice(0, k).reduce((a, b) => a + b, 0) + k * TRANS;

/** the stretches of the run (in units) where the page is lined up and complete */
const REST: [number, number][] = HOLD.map((h, k) => {
  const s = holdStart(k);
  if (k === 0) return [0, h];
  if (k === HOLD.length - 1) return [s + SETTLED_MEET * h, TOTAL];
  return [s + SETTLED * h, s + h];
});

type Clock = { t: number; sigma: number; tr: number; x: number };
function clockAt(u: number): Clock {
  let acc = 0;
  for (let k = 0; k < HOLD.length; k++) {
    const h = HOLD[k];
    if (u <= acc + h || k === HOLD.length - 1) return { t: k, sigma: k + clamp01((u - acc) / h), tr: -1, x: 0 };
    acc += h;
    if (u <= acc + TRANS) {
      const x = clamp01((u - acc) / TRANS);
      return { t: k + inOut(x), sigma: k + 1, tr: k, x };
    }
    acc += TRANS;
  }
  return { t: HOLD.length - 1, sigma: HOLD.length, tr: -1, x: 0 };
}

type Pt = { x: number; y: number };
type Half = { el: HTMLElement; i: number; face: string; shown: boolean | null; tf: string; clocks: HTMLElement[]; co: string };
type Mark = { el: HTMLElement; at: number; until: number; on: boolean | null; off: boolean | null };

function collectBerths(scope: HTMLElement) {
  const berths = new Map<string, HTMLElement[]>();
  scope.querySelectorAll<HTMLElement>("[data-berth]").forEach((el) => {
    const id = el.dataset.berth ?? "";
    if (!berths.has(id)) berths.set(id, []);
    berths.get(id)?.push(el);
  });
  return berths;
}

function makeBerthSetter(berths: Map<string, HTMLElement[]>) {
  const state = new Map<string, string>();
  return (id: string, next: "full" | "slot" | "gone", land = true) => {
    const prev = state.get(id);
    if (prev === next) return;
    state.set(id, next);
    for (const el of berths.get(id) ?? []) {
      el.classList.toggle("is-slot", next === "slot");
      el.classList.toggle("is-gone", next === "gone");
      el.classList.remove("is-land");
      if (land && next === "full" && prev === "slot") {
        void el.offsetWidth;
        el.classList.add("is-land");
      }
    }
  };
}

/** back to the server's settled classes: a berth the charge left shows its slot */
function resetBerths(berths: Map<string, HTMLElement[]>) {
  for (const [id, els] of berths) {
    const left = FLIGHTS.some((f) => f.k > 0 && f.from === id);
    els.forEach((el) => {
      el.classList.remove("is-land", "is-gone");
      el.classList.toggle("is-slot", left);
    });
  }
}

/** The nav turns bone once the green ground is under it (stack and still). */
function navOnGreen(root: HTMLElement, meet: HTMLElement | null) {
  const st = ScrollTrigger.create({
    trigger: meet,
    start: "top 32px",
    end: "max",
    onToggle: (s) => root.classList.toggle("is-one", s.isActive),
  });
  return () => {
    st.kill();
    root.classList.remove("is-one");
  };
}

/* ======================= stack: rows in the flow, one crossing per seam ======================= */
/* Every beat stays in its finished state, so any stop reads complete. When both ends of a
   crossing are on screen, the charge travels it once: a copy leaves the berth it left from and
   lands on the one it reached, which is hidden only for the flight. */
function startStack(stage: HTMLElement, root: HTMLElement) {
  root.classList.add("is-stack");
  const offNav = navOnGreen(root, stage.querySelector<HTMLElement>("[data-meet]"));
  const berths = collectBerths(stage);
  const flights = FLIGHTS.filter((f) => f.k > 0);
  const running = new Set<Animation>();
  const timers = new Set<number>();

  const play = (f: (typeof flights)[number]) => {
    const a = berths.get(f.from)?.[0];
    const b = berths.get(f.to)?.[0];
    const art = a?.closest<HTMLElement>(".jn-beat");
    if (!a || !b || !art) return;
    const ra = a.getBoundingClientRect();
    const rb = b.getBoundingClientRect();
    const rr = art.getBoundingClientRect();
    const fromFace = a.closest<HTMLElement>(".jn-half")?.dataset.half ?? "p";
    const toFace = b.closest<HTMLElement>(".jn-half")?.dataset.half ?? "d";
    const pill = b.querySelector(".jn-pill")?.cloneNode(true);
    if (!pill) return;
    const fly = document.createElement("span");
    fly.className = `jn-fly-stack jn-face-${fromFace}`;
    fly.setAttribute("aria-hidden", "true");
    fly.appendChild(pill);
    fly.style.left = `${ra.left + ra.width / 2 - rr.left}px`;
    fly.style.top = `${ra.top + ra.height / 2 - rr.top}px`;
    art.appendChild(fly);
    b.classList.add("is-await");
    const dx = rb.left + rb.width / 2 - (ra.left + ra.width / 2);
    const dy = rb.top + rb.height / 2 - (ra.top + ra.height / 2);
    /* a small bow sideways when the seam is horizontal, upwards when it is vertical */
    const across = Math.abs(dy) > Math.abs(dx);
    const bx = across ? (dx >= 0 ? 36 : -36) : 0;
    const by = across ? 0 : -Math.min(70, Math.abs(dx) * 0.16);
    const anim = fly.animate(
      [
        { transform: "translate(-50%, -50%)" },
        { transform: `translate(calc(-50% + ${dx / 2 + bx}px), calc(-50% + ${dy / 2 + by}px))`, offset: 0.5 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))` },
      ],
      { duration: 820, easing: "cubic-bezier(.6, 0, .35, 1)", fill: "forwards" },
    );
    running.add(anim);
    const swap = window.setTimeout(() => (fly.className = `jn-fly-stack jn-face-${toFace}`), 410);
    timers.add(swap);
    anim.onfinish = () => {
      running.delete(anim);
      fly.remove();
      b.classList.remove("is-await");
      void b.offsetWidth;
      b.classList.add("is-land");
    };
  };

  /* the lower of a crossing's two berths decides: once it is well inside the screen, so is the
     other, and the charge travels */
  const sentinels = new Map<Element, (typeof flights)[number]>();
  for (const f of flights) {
    const a = berths.get(f.from)?.[0];
    const b = berths.get(f.to)?.[0];
    if (!a || !b) continue;
    sentinels.set(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? b : a, f);
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const f = sentinels.get(e.target);
        if (!f) continue;
        if (e.isIntersecting) play(f);
        if (e.isIntersecting || e.boundingClientRect.top < 0) io.unobserve(e.target);
      }
    },
    { rootMargin: "0px 0px -28% 0px" },
  );
  sentinels.forEach((_, el) => io.observe(el));

  return () => {
    io.disconnect();
    offNav();
    running.forEach((a) => a.cancel());
    timers.forEach((t) => window.clearTimeout(t));
    stage.querySelectorAll(".jn-fly-stack").forEach((el) => el.remove());
    resetBerths(berths);
    stage.querySelectorAll(".is-await").forEach((el) => el.classList.remove("is-await"));
    root.classList.remove("is-stack");
  };
}

/* ======================= live: the pinned stage ======================= */
function startLive(run: HTMLElement, stage: HTMLElement, over: HTMLElement, root: HTMLElement) {
  const meet = stage.querySelector<HTMLElement>("[data-meet]");
  root.classList.add("is-live");

  const halves: Half[] = [...stage.querySelectorAll<HTMLElement>(".jn-half")].map((el) => ({
    el,
    i: Number(el.dataset.i),
    face: el.dataset.half ?? "p",
    shown: null,
    tf: "",
    clocks: [...el.querySelectorAll<HTMLElement>(".jn-st--clock")],
    co: "",
  }));
  const marks: Mark[] = [...stage.querySelectorAll<HTMLElement>("[data-at],[data-until]")].map((el) => ({
    el,
    at: el.dataset.at ? Number(el.dataset.at) : NaN,
    until: el.dataset.until ? Number(el.dataset.until) : NaN,
    on: null,
    off: null,
  }));
  const berths = collectBerths(stage);
  const setBerth = makeBerthSetter(berths);
  const flies = [...over.querySelectorAll<HTMLElement>(".jn-fly")];
  const traces = [...over.querySelectorAll<SVGSVGElement>(".jn-trace")];
  const tracePaths = traces.map((s) => s.querySelector("path"));

  let W = 0;
  let H = 0;
  let pw = 0;
  let ph = 0;
  const rest = new Map<string, Pt>();

  function layout() {
    W = stage.clientWidth;
    H = stage.clientHeight;
    run.style.height = `${Math.round(H + TOTAL * UNIT * H)}px`;
    rest.clear();
    /* each berth's centre when its beat is lined up, in stage coordinates (the half's own
       translate cancels out of the difference) */
    for (const [id, els] of berths) {
      const b = els[0];
      const half = b.closest<HTMLElement>(".jn-half");
      if (!half) continue;
      const rb = b.getBoundingClientRect();
      const rh = half.getBoundingClientRect();
      rest.set(id, {
        x: (half.dataset.half === "d" ? W / 2 : 0) + rb.left - rh.left + rb.width / 2,
        y: rb.top - rh.top + rb.height / 2,
      });
    }
    pw = flies[0]?.offsetWidth ?? 0;
    ph = flies[0]?.offsetHeight ?? 0;
    traces.forEach((svg, n) => {
      svg.setAttribute("width", String(W));
      svg.setAttribute("height", String(H));
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      svg.style.transform = n === 0 ? "" : `translate(${-W / 2}px, 0)`;
    });
    for (const h of halves) h.tf = "";
  }

  function pathAt(f: (typeof FLIGHTS)[number], c: number, t: number): Pt {
    const a = rest.get(f.from);
    const b0 = rest.get(f.to);
    if (!a || !b0) return { x: 0, y: 0 };
    /* the first flight chases Priya's phone while her column is still rising into place */
    const b = f.k === 0 ? { x: b0.x, y: b0.y + (1 - Math.min(1, t)) * H } : b0;
    const e = inOut(c);
    const x = a.x + (b.x - a.x) * e;
    const y = a.y + (b.y - a.y) * e - Math.sin(Math.PI * e) * Math.min(84, Math.abs(b.x - a.x) * 0.16);
    return { x, y };
  }

  function place(el: HTMLElement, n: number, p: Pt) {
    const x = p.x - pw / 2 - (n === 1 ? W / 2 : 0);
    const y = p.y - ph / 2;
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  }

  /* what the scroll asks for, and what is shown (the crossing trails it by at most FLIGHT_S) */
  let cur: Clock = { t: 0, sigma: 0, tr: -1, x: 0 };
  const target = FLIGHTS.map(() => 0);
  const shown = FLIGHTS.map(() => -1);
  let flyShown = false;
  let traceShown = false;

  function read(progress: number) {
    cur = clockAt(progress * TOTAL);
    const { t, sigma, tr, x } = cur;
    FLIGHTS.forEach((f, n) => {
      target[n] = f.k === 0 ? (t >= 1 ? 1 : tr === 0 ? x : 0) : clamp01((sigma - f.k - CROSS[0]) / (CROSS[1] - CROSS[0]));
      /* the first flight rides the columns, and a beat that is not lined up shows its end state */
      if (shown[n] < 0 || f.k === 0 || Math.abs(t - f.k) > 0.02) shown[n] = target[n];
    });
    paint();
  }

  function tick(_time: number, dt: number) {
    let moved = false;
    FLIGHTS.forEach((_, n) => {
      if (shown[n] === target[n]) return;
      const step = dt / 1000 / FLIGHT_S;
      shown[n] = shown[n] < target[n] ? Math.min(target[n], shown[n] + step) : Math.max(target[n], shown[n] - step);
      moved = true;
    });
    if (moved) paint();
  }

  function paint() {
    const { t, sigma, tr } = cur;

    for (const h of halves) {
      const d = h.i - t;
      const show = Math.abs(d) < 0.999;
      /* off stage by opacity, not visibility, so every beat stays in the accessibility tree */
      if (show !== h.shown) {
        h.el.style.opacity = show ? "1" : "0";
        h.shown = show;
      }
      if (!show) continue;
      const s = h.face === "p" ? d : -d;
      const tf = `translate3d(0,${(s * H).toFixed(1)}px,0)`;
      if (tf !== h.tf) {
        h.el.style.transform = tf;
        h.tf = tf;
      }
      /* a clock reads only while its two halves line up */
      const co = (1 - clamp01(Math.abs(d) * 5)).toFixed(2);
      if (co !== h.co) {
        h.clocks.forEach((c) => (c.style.opacity = co));
        h.co = co;
      }
    }

    /* what a landing causes waits for the charge to land */
    const k = Math.floor(sigma);
    let s = sigma;
    if (k >= 1 && k <= 4 && shown[k] < 1 && shown[k] <= target[k]) s = Math.min(sigma, k + CROSS[0] + shown[k] * (CROSS[1] - CROSS[0]));
    for (const m of marks) {
      if (!Number.isNaN(m.at)) {
        const on = s >= m.at;
        if (on !== m.on) {
          m.el.classList.toggle("is-on", on);
          m.el.toggleAttribute("aria-hidden", !on);
          m.on = on;
        }
      }
      if (!Number.isNaN(m.until)) {
        const off = s >= m.until;
        if (off !== m.off) {
          m.el.classList.toggle("is-off", off);
          m.el.toggleAttribute("aria-hidden", off);
          m.off = off;
        }
      }
    }

    /* each berth is full once its incoming flight has landed and until its outgoing one leaves */
    for (const id of berths.keys()) {
      const inn = FLIGHTS.findIndex((f) => f.to === id);
      const out = FLIGHTS.findIndex((f) => f.from === id);
      const arrived = inn < 0 || shown[inn] >= 1;
      const left = out >= 0 && shown[out] > 0;
      setBerth(id, arrived && !left ? "full" : left && id === "0s" ? "gone" : "slot");
    }
    const active = FLIGHTS.findIndex((_, n) => shown[n] > 0 && shown[n] < 1);
    if (active >= 0) {
      const p = pathAt(FLIGHTS[active], shown[active], t);
      flies.forEach((el, n) => place(el, n, p));
    }
    if ((active >= 0) !== flyShown) {
      flyShown = active >= 0;
      flies.forEach((el) => (el.style.visibility = flyShown ? "visible" : "hidden"));
    }

    /* the tracer: the path the charge took across the seam, until the faces move on */
    const f = FLIGHTS[k];
    const tc = k >= 1 && k <= 4 && tr < 0 ? shown[k] : 0;
    if (f && tc > 0) {
      let d = "";
      const n = 28;
      for (let j = 0; j <= n; j++) {
        const p = pathAt(f, (tc * j) / n, t);
        d += `${j ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
      }
      const fade = clamp01((k + 1 - sigma) / 0.16);
      tracePaths.forEach((path) => {
        path?.setAttribute("d", d);
        path?.style.setProperty("opacity", String(0.55 * fade));
      });
    }
    if ((tc > 0) !== traceShown) {
      traceShown = tc > 0;
      traces.forEach((svg) => (svg.style.visibility = traceShown ? "visible" : "hidden"));
    }

    meet?.style.setProperty("--f", inOut(clamp01((sigma - FLOOD[0]) / (FLOOD[1] - FLOOD[0]))).toFixed(3));
    root.classList.toggle("is-one", sigma >= ONE_AT);
  }

  /* eased wheel; the page settles on finished beats */
  const lenis = new Lenis({ lerp: 0.12, smoothWheel: true, syncTouch: false, wheelMultiplier: 0.9 });
  lenis.on("scroll", ScrollTrigger.update);
  const raf = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  layout();
  const st = ScrollTrigger.create({
    trigger: run,
    start: "top top",
    end: "bottom bottom",
    onUpdate: (s) => read(s.progress),
    onRefresh: (s) => read(s.progress),
  });
  ScrollTrigger.addEventListener("refreshInit", layout);
  read(st.progress);
  document.fonts?.ready.then(() => ScrollTrigger.refresh());

  const runTop = () => run.getBoundingClientRect().top + window.scrollY;
  const span = () => run.offsetHeight - H;
  const toY = (u: number) => runTop() + (u / TOTAL) * span();
  const toU = (y: number) => ((y - runTop()) / span()) * TOTAL;
  const y = (sigma: number) => {
    const k = Math.min(HOLD.length - 1, Math.floor(sigma));
    return toY(holdStart(k) + (sigma - k) * HOLD[k]);
  };
  const yt = (tf: number) => {
    const k = Math.floor(tf);
    return toY(holdStart(k) + HOLD[k] + (tf - k) * TRANS);
  };
  window.__jn = { y, yt };

  /* ---- settling ---- */
  let anchor = window.scrollY;
  let snapping = false;
  let lastWheel = -Infinity;
  let wheelDir = 1;
  let wheelTimer = 0;
  let scrollTimer = 0;
  const EPS = 0.004;

  const snapTo = (to: number) => {
    const dist = Math.abs(to - window.scrollY);
    if (dist < 2) {
      anchor = to;
      return;
    }
    snapping = true;
    lenis.scrollTo(to, {
      duration: Math.min(0.78, 0.46 + (dist / H) * 0.16),
      easing: outCubic,
      onComplete: () => {
        snapping = false;
        anchor = to;
      },
    });
  };

  const settle = (ref: number, dir: number) => {
    /* between month end and the close, the stage is scrolling away: finish the move */
    const endY = toY(TOTAL);
    if (ref > endY + 2 && ref < endY + H - 2) {
      snapTo((dir || Math.sign(ref - anchor) || 1) > 0 ? Math.min(endY + H, lenis.limit) : endY);
      return;
    }
    const u = toU(ref);
    if (u <= EPS || u >= TOTAL - EPS || REST.some(([a, b]) => u >= a - EPS && u <= b + EPS)) {
      anchor = ref;
      return;
    }
    const d = dir || Math.sign(ref - anchor) || 1;
    if (d > 0) {
      const next = REST.find(([a]) => a > u);
      if (next) snapTo(toY(next[0]));
    } else {
      const prev = [...REST].reverse().find(([, b]) => b < u);
      if (prev) snapTo(toY(prev[1]));
    }
  };

  lenis.on("virtual-scroll", ({ deltaY }: { deltaY: number }) => {
    if (!deltaY) return;
    lastWheel = performance.now();
    wheelDir = Math.sign(deltaY);
    snapping = false;
    window.clearTimeout(wheelTimer);
    wheelTimer = window.setTimeout(() => settle(lenis.targetScroll, wheelDir), 90);
  });
  /* keys, the scrollbar, find-in-page: settle when the native scroll stops */
  const onScroll = () => {
    if (snapping || performance.now() - lastWheel < 260 || lenis.isScrolling === "smooth") return;
    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(() => settle(window.scrollY, Math.sign(window.scrollY - anchor)), 160);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  settle(window.scrollY, 1);

  /* "Follow the charge" and the wordmark go to a finished beat, not to a row that is not there */
  const onGo = (e: MouseEvent) => {
    const a = (e.target as HTMLElement).closest<HTMLElement>("[data-jn-go]");
    if (!a) return;
    e.preventDefault();
    const k = Number(a.dataset.jnGo);
    const to = k === 0 ? 0 : toY(REST[k][0]);
    snapping = true;
    lenis.scrollTo(to, {
      duration: 1.5,
      onComplete: () => {
        snapping = false;
        anchor = to;
      },
    });
    const beat = stage.querySelector<HTMLElement>(`[data-beat="${k}"]`);
    if (beat) {
      beat.setAttribute("tabindex", "-1");
      beat.focus({ preventScroll: true });
    }
  };
  root.addEventListener("click", onGo);

  return () => {
    root.removeEventListener("click", onGo);
    window.removeEventListener("scroll", onScroll);
    window.clearTimeout(wheelTimer);
    window.clearTimeout(scrollTimer);
    ScrollTrigger.removeEventListener("refreshInit", layout);
    st.kill();
    gsap.ticker.remove(raf);
    gsap.ticker.remove(tick);
    gsap.ticker.lagSmoothing(500, 33);
    lenis.destroy();
    delete window.__jn;
    root.classList.remove("is-live", "is-one");
    run.style.height = "";
    for (const h of halves) {
      h.el.style.transform = "";
      h.el.style.opacity = "";
      h.clocks.forEach((c) => (c.style.opacity = ""));
    }
    meet?.style.removeProperty("--f");
    for (const m of marks) {
      m.el.classList.remove("is-on", "is-off");
      m.el.removeAttribute("aria-hidden");
    }
    resetBerths(berths);
  };
}

export function JanusStage({ children }: { children: ReactNode }) {
  const runRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const overRef = useRef<HTMLDivElement>(null);
  const mode = useSyncExternalStore<Mode | null>(subscribe, readMode, () => null);

  useEffect(() => {
    const run = runRef.current;
    const stage = stageRef.current;
    const over = overRef.current;
    const root = run?.closest<HTMLElement>(".jn");
    if (!mode || !run || !stage || !over || !root) return;
    if (mode === "live") return startLive(run, stage, over, root);
    if (mode === "stack") return startStack(stage, root);
    return navOnGreen(root, stage.querySelector<HTMLElement>("[data-meet]"));
  }, [mode]);

  return (
    <div className="jn-run" ref={runRef}>
      <div className="jn-stage" ref={stageRef}>
        {children}
        <div className="jn-over" ref={overRef} aria-hidden="true">
          <div className="jn-over-side jn-over-side--p jn-face-p">
            <svg className="jn-trace">
              <path />
            </svg>
            <span className="jn-fly">
              <Pill />
            </span>
          </div>
          <div className="jn-over-side jn-over-side--d jn-face-d">
            <svg className="jn-trace">
              <path />
            </svg>
            <span className="jn-fly">
              <Pill />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
