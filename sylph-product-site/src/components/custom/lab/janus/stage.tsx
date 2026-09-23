"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/components/custom/site/motion";
import { Pill } from "./parts";

/*
 * The stage. With motion allowed it pins one viewport and plays the beats on it, all derived
 * from one number, the run's scroll progress, so any scroll position renders the same frame:
 *
 *  - Column time t (0 to 5): which beat the faces show. Priya's column moves with the scroll
 *    (her next moment rises from below), Dana's moves against it (his descends from above).
 *    Between beats the faces travel; on a beat they hold and line up.
 *  - Story time sigma (0 to 6): inside beat k it runs from k to k+1. The charge crosses the
 *    seam between k+0.12 and k+0.62 and lands; what the landing causes appears after
 *    (the data-at / data-until marks in beats.tsx).
 *  - At month end a deep green ground opens from the seam and takes both faces.
 *
 * On a phone the seam is horizontal and the faces slide sideways against each other. Reduced
 * motion never gets here: the page stays the stacked, settled rows the server rendered.
 */

declare global {
  interface Window {
    /** capture helper: scroll position for a story time (hold) or a column time (travel) */
    __jn?: { y: (sigma: number) => number; yt: (t: number) => number };
  }
}

const HOLD = [0.08, 1, 1, 1, 1, 1.35];
const TRANS = 1;
const TOTAL = HOLD.reduce((a, b) => a + b, 0) + TRANS * (HOLD.length - 1);
/** scroll length of one unit, as a share of the stage height */
const UNIT = 0.8;
const CROSS: [number, number] = [0.12, 0.62];
const FLIGHTS = [
  { k: 0, from: "0s", to: "1p" },
  { k: 1, from: "1p", to: "1d" },
  { k: 2, from: "2d", to: "2p" },
  { k: 3, from: "3p", to: "3d" },
  { k: 4, from: "4d", to: "4p" },
];
const FLOOD: [number, number] = [5.12, 5.42];
const ONE_AT = 5.3;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const inOut = (v: number) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);
const holdStart = (k: number) => HOLD.slice(0, k).reduce((a, b) => a + b, 0) + k * TRANS;

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

export function JanusStage({ children }: { children: ReactNode }) {
  const runRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const overRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const run = runRef.current;
    const stage = stageRef.current;
    const over = overRef.current;
    const root = run?.closest<HTMLElement>(".jn");
    if (!run || !stage || !over || !root) return;
    const meet = stage.querySelector<HTMLElement>("[data-meet]");

    /* reduced motion: the settled rows; only the nav needs to know when the ground turns green */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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

    root.classList.add("is-live");
    const phoneMq = window.matchMedia("(max-width: 860px)");

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
    const berths = new Map<string, HTMLElement[]>();
    stage.querySelectorAll<HTMLElement>("[data-berth]").forEach((el) => {
      const id = el.dataset.berth ?? "";
      if (!berths.has(id)) berths.set(id, []);
      berths.get(id)?.push(el);
    });
    const berthState = new Map<string, string>();
    const flies = [...over.querySelectorAll<HTMLElement>(".jn-fly")];
    const traces = [...over.querySelectorAll<SVGSVGElement>(".jn-trace")];
    const tracePaths = traces.map((s) => s.querySelector("path"));

    let W = 0;
    let H = 0;
    let phone = false;
    let pw = 0;
    let ph = 0;
    const rest = new Map<string, Pt>();

    function layout() {
      phone = phoneMq.matches;
      W = stage!.clientWidth;
      H = stage!.clientHeight;
      run!.style.height = `${Math.round(H + TOTAL * UNIT * H)}px`;
      rest.clear();
      /* each berth's centre when its beat is lined up, in stage coordinates (the half's own
         translate cancels out of the difference) */
      for (const [id, els] of berths) {
        const b = els[0];
        const half = b.closest<HTMLElement>(".jn-half");
        if (!half) continue;
        const rb = b.getBoundingClientRect();
        const rh = half.getBoundingClientRect();
        const dana = half.dataset.half === "d";
        rest.set(id, {
          x: (dana && !phone ? W / 2 : 0) + rb.left - rh.left + rb.width / 2,
          y: (dana && phone ? H / 2 : 0) + rb.top - rh.top + rb.height / 2,
        });
      }
      pw = flies[0]?.offsetWidth ?? 0;
      ph = flies[0]?.offsetHeight ?? 0;
      traces.forEach((svg, n) => {
        svg.setAttribute("width", String(W));
        svg.setAttribute("height", String(H));
        svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
        svg.style.transform = n === 0 ? "" : phone ? `translate(0, ${-H / 2}px)` : `translate(${-W / 2}px, 0)`;
      });
      for (const h of halves) h.tf = "";
    }

    function pathAt(f: (typeof FLIGHTS)[number], c: number, t: number): Pt {
      const a = rest.get(f.from);
      const b0 = rest.get(f.to);
      if (!a || !b0) return { x: 0, y: 0 };
      let b = b0;
      /* the first flight chases Priya's phone while her column is still rising into place */
      if (f.k === 0) {
        const off = 1 - Math.min(1, t);
        b = phone ? { x: b0.x + off * W, y: b0.y } : { x: b0.x, y: b0.y + off * H };
      }
      const e = inOut(c);
      const bump = Math.sin(Math.PI * e);
      let x = a.x + (b.x - a.x) * e;
      let y = a.y + (b.y - a.y) * e;
      if (phone) x += bump * Math.min(46, Math.abs(b.y - a.y) * 0.3) * (f.k % 2 ? 1 : -1);
      else y -= bump * Math.min(84, Math.abs(b.x - a.x) * 0.16);
      return { x, y };
    }

    function place(el: HTMLElement, n: number, p: Pt) {
      let x = p.x - pw / 2;
      let y = p.y - ph / 2;
      if (n === 1) {
        if (phone) y -= H / 2;
        else x -= W / 2;
      }
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    }

    function setBerth(id: string, state: "full" | "slot" | "gone") {
      const prev = berthState.get(id);
      if (prev === state) return;
      berthState.set(id, state);
      for (const el of berths.get(id) ?? []) {
        el.classList.toggle("is-slot", state === "slot");
        el.classList.toggle("is-gone", state === "gone");
        el.classList.remove("is-land");
        if (state === "full" && prev === "slot") {
          void el.offsetWidth;
          el.classList.add("is-land");
        }
      }
    }

    let flyShown = false;
    let traceShown = false;
    function render(progress: number) {
      const { t, sigma, tr, x } = clockAt(progress * TOTAL);

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
        const tf = phone ? `translate3d(${(s * W).toFixed(1)}px,0,0)` : `translate3d(0,${(s * H).toFixed(1)}px,0)`;
        if (tf !== h.tf) {
          h.el.style.transform = tf;
          h.tf = tf;
        }
        /* a clock is only read while its two halves line up; mid travel, one beat's left half
           would meet the next beat's right half */
        const co = (1 - clamp01(Math.abs(d) * 5)).toFixed(2);
        if (co !== h.co) {
          h.clocks.forEach((c) => (c.style.opacity = co));
          h.co = co;
        }
      }

      for (const m of marks) {
        if (!Number.isNaN(m.at)) {
          const on = sigma >= m.at;
          if (on !== m.on) {
            m.el.classList.toggle("is-on", on);
            m.el.toggleAttribute("aria-hidden", !on);
            m.on = on;
          }
        }
        if (!Number.isNaN(m.until)) {
          const off = sigma >= m.until;
          if (off !== m.off) {
            m.el.classList.toggle("is-off", off);
            m.el.toggleAttribute("aria-hidden", off);
            m.off = off;
          }
        }
      }

      /* the charge: each berth is full once its incoming flight has landed and until its
         outgoing one leaves */
      const cs = FLIGHTS.map((f) =>
        f.k === 0 ? (t >= 1 ? 1 : tr === 0 ? x : 0) : clamp01((sigma - f.k - CROSS[0]) / (CROSS[1] - CROSS[0])),
      );
      for (const id of berths.keys()) {
        const inn = FLIGHTS.findIndex((f) => f.to === id);
        const out = FLIGHTS.findIndex((f) => f.from === id);
        const arrived = inn < 0 || cs[inn] >= 1;
        const left = out >= 0 && cs[out] > 0;
        setBerth(id, arrived && !left ? "full" : left && id === "0s" ? "gone" : "slot");
      }
      const active = FLIGHTS.findIndex((_, n) => cs[n] > 0 && cs[n] < 1);
      if (active >= 0) {
        const p = pathAt(FLIGHTS[active], cs[active], t);
        flies.forEach((el, n) => place(el, n, p));
      }
      if ((active >= 0) !== flyShown) {
        flyShown = active >= 0;
        flies.forEach((el) => (el.style.visibility = flyShown ? "visible" : "hidden"));
      }

      /* the tracer: the path the charge took across the seam, until the faces move on */
      const k = Math.floor(sigma);
      const f = FLIGHTS[k];
      const tc = k >= 1 && k <= 4 && tr < 0 ? cs[k] : 0;
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
        traces.forEach((s) => (s.style.visibility = traceShown ? "visible" : "hidden"));
      }

      meet?.style.setProperty("--f", inOut(clamp01((sigma - FLOOD[0]) / (FLOOD[1] - FLOOD[0]))).toFixed(3));
      root!.classList.toggle("is-one", sigma >= ONE_AT);
    }

    /* eased wheel on desktop only; touch keeps native scroll */
    let lenis: Lenis | null = null;
    const raf = (time: number) => lenis?.raf(time * 1000);
    if (!window.matchMedia("(hover: none) and (pointer: coarse)").matches) {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: false, wheelMultiplier: 0.9 });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
    }

    layout();
    const st = ScrollTrigger.create({
      trigger: run,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (s) => render(s.progress),
      onRefresh: (s) => render(s.progress),
    });
    ScrollTrigger.addEventListener("refreshInit", layout);
    render(st.progress);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    const runTop = () => run.getBoundingClientRect().top + window.scrollY;
    const toY = (u: number) => runTop() + (u / TOTAL) * (run.offsetHeight - H);
    const y = (sigma: number) => {
      const k = Math.min(HOLD.length - 1, Math.floor(sigma));
      return toY(holdStart(k) + (sigma - k) * HOLD[k]);
    };
    const yt = (tf: number) => {
      const k = Math.floor(tf);
      return toY(holdStart(k) + HOLD[k] + (tf - k) * TRANS);
    };
    window.__jn = { y, yt };

    /* "Follow the charge": go to the first beat's crossing, not to a row that is not there */
    const onGo = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLElement>("[data-jn-go]");
      if (!a) return;
      e.preventDefault();
      const k = Number(a.dataset.jnGo);
      const top = k === 0 ? 0 : y(k + 0.02);
      if (lenis) lenis.scrollTo(top, { duration: 1.6 });
      else window.scrollTo({ top, behavior: "smooth" });
      const target = stage.querySelector<HTMLElement>(`[data-beat="${k}"]`);
      if (target) {
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    };
    root.addEventListener("click", onGo);

    return () => {
      root.removeEventListener("click", onGo);
      ScrollTrigger.removeEventListener("refreshInit", layout);
      st.kill();
      if (lenis) {
        gsap.ticker.remove(raf);
        gsap.ticker.lagSmoothing(500, 33);
        lenis.destroy();
      }
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
    };
  }, []);

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
