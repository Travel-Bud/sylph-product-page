"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/components/custom/site/motion";
import { SYLPH_BIRD_PATH, SYLPH_BIRD_VIEWBOX } from "@/components/custom/sylph-identity/sylph-bird-path";

/*
 * The courier for /lab/hours: one Sushi Kanda charge, carried down the whole page by the Sylph bird.
 *
 * The chain alternates scenes and chapters: the charge is born in the dusk scene (the photographed
 * receipt), flies down to Priya's chapter, down into the next scene, and so on to the month-end report.
 * In a scene it rests on an anchor the scene animates (an invisible element: the pill lifted by the
 * rising page, the note before it folds, her reply bubble, the calendar); in a chapter it rests in that
 * chapter's own pill ([data-courier-stop]), and every other stop shows an empty dashed slot.
 *
 * Everything is a pure function of the scroll position and the anchors' live boxes, read every frame on
 * GSAP's ticker, so scrolling back rewinds it and a scene's own motion carries the charge with it.
 * Between two resting places the bird lifts the charge and flies it on a wide arc while an amber beam
 * draws behind it and shrinks into it as it lands. Reduced motion never mounts any of it.
 */

type Node = { kind: "stop"; n: number } | { kind: "scene"; n: number; anchor: string };

const CHAIN: Node[] = [
  { kind: "scene", n: 0, anchor: ".p1-charge" },
  { kind: "stop", n: 1 },
  { kind: "scene", n: 1, anchor: ".p2-charge" },
  { kind: "stop", n: 2 },
  { kind: "scene", n: 2, anchor: ".p3-anchor" },
  { kind: "stop", n: 3 },
  { kind: "scene", n: 3, anchor: ".p4-anchor" },
  { kind: "stop", n: 4 },
  { kind: "scene", n: 4, anchor: ".p5-anchor" },
  { kind: "stop", n: 5 },
];

type V = { x: number; y: number };
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
function cubic(a: V, b: V, c: V, d: V, t: number): V {
  const m = 1 - t;
  return {
    x: m * m * m * a.x + 3 * m * m * t * b.x + 3 * m * t * t * c.x + t * t * t * d.x,
    y: m * m * m * a.y + 3 * m * m * t * b.y + 3 * m * t * t * c.y + t * t * t * d.y,
  };
}
function centre(el: Element | null): V | null {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

export function HoursCourier() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = root.current;
    if (!layer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const main = layer.closest(".hrs");
    const scenes = Array.from(document.querySelectorAll<HTMLElement>(".hrs-p"));
    const pill = layer.querySelector<HTMLElement>(".hc-pill")!;
    const bird = layer.querySelector<HTMLElement>(".hc-bird")!;
    const beam = layer.querySelector<SVGPathElement>(".hc-beam")!;
    const glow = layer.querySelector<SVGPathElement>(".hc-glow")!;
    const svg = layer.querySelector<SVGSVGElement>(".hc-sky")!;
    const stop = (n: number) => main?.querySelector<HTMLElement>(`[data-courier-stop="${n}"]`) ?? null;
    const anchor = (sel: string) => main?.querySelector<HTMLElement>(sel) ?? null;
    layer.dataset.on = "";
    main?.setAttribute("data-courier-live", "");

    let restAt: number | null = null;
    let away = "";

    const pos = (node: Node): { p: V | null; here: number } => {
      if (node.kind === "stop") return { p: centre(stop(node.n)), here: 1 };
      const el = anchor(node.anchor);
      return { p: centre(el), here: el ? Number(getComputedStyle(el).opacity) : 0 };
    };

    const tick = () => {
      const s = window.scrollY;
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      svg.setAttribute("viewBox", `0 0 ${vw} ${vh}`);

      /* the scroll positions where each scene sticks and lets go, in page coordinates */
      const S = scenes.map((el) => {
        const top = el.getBoundingClientRect().top + s;
        return { start: top, end: top + el.offsetHeight - vh };
      });
      /* resting spans and flights, in order: [from, to, a, b]; a flight when from !== to */
      type Span = { from: number; to: number; a: number; b: number };
      const spans: Span[] = [];
      let cursor = -Infinity;
      for (let i = 0; i < CHAIN.length; i++) {
        const node = CHAIN[i];
        if (node.kind === "scene") {
          const sc = S[node.n];
          if (!sc) break;
          const land = sc.start - 0.3 * vh;
          if (i > 0) {
            const prevEnd = cursor;
            const room = land - prevEnd;
            const out = Math.min(0.8 * vh, room * 0.45);
            const into = Math.min(0.7 * vh, room * 0.45);
            /* out of the last scene to the chapter's stop, a rest there, then down into this scene */
            spans.push({ from: i - 2, to: i - 1, a: prevEnd, b: prevEnd + out });
            spans.push({ from: i - 1, to: i - 1, a: prevEnd + out, b: land - into });
            spans.push({ from: i - 1, to: i, a: land - into, b: land });
          }
          spans.push({ from: i, to: i, a: i === 0 ? -Infinity : land, b: sc.end });
          cursor = sc.end;
        }
      }
      const last = CHAIN.length - 1;
      spans.push({ from: last - 1, to: last, a: cursor, b: cursor + 0.8 * vh });
      spans.push({ from: last, to: last, a: cursor + 0.8 * vh, b: Infinity });

      const span = spans.find((sp) => s >= sp.a && s < sp.b) ?? spans[spans.length - 1];
      let at: V | null = null;
      let showPill = 0;
      let flight = 0;
      let heading = 0;
      let restStop: number | null = null;

      if (span.from === span.to) {
        const node = CHAIN[span.from];
        const { p, here } = pos(node);
        at = p;
        if (node.kind === "stop") restStop = node.n;
        else showPill = here;
        beam.style.opacity = "0";
        glow.style.opacity = "0";
      } else {
        const A = pos(CHAIN[span.from]).p;
        const B = pos(CHAIN[span.to]).p;
        if (A && B) {
          const t = ease(clamp((s - span.a) / (span.b - span.a), 0, 1));
          /* a wide arc: out to one side, then in to the landing, alternating sides leg by leg */
          const side = span.to % 2 === 0 ? 1 : -1;
          const swing = side * Math.min(280, vw * 0.2);
          const dy = B.y - A.y;
          const c1 = { x: clamp(A.x + swing, 40, vw - 40), y: A.y + dy * 0.2 };
          const c2 = { x: clamp(B.x + swing * 0.8, 40, vw - 40), y: B.y - dy * 0.35 };
          at = cubic(A, c1, c2, B, t);
          const ahead = cubic(A, c1, c2, B, Math.min(1, t + 0.02));
          heading = Math.atan2(ahead.y - at.y, ahead.x - at.x);
          flight = clamp(Math.sin(Math.PI * t) * 3, 0, 1);
          showPill = 1;
          /* the beam: the stretch of the arc just behind the charge, growing, then drawn into it */
          const u0 = Math.max(0, t - 0.6 * Math.sin(Math.PI * t));
          let d = "";
          for (let k = 0; k <= 28; k++) {
            const q = cubic(A, c1, c2, B, u0 + ((t - u0) * k) / 28);
            d += `${k ? "L" : "M"}${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
          }
          beam.setAttribute("d", d);
          glow.setAttribute("d", d);
          beam.style.opacity = String(flight);
          glow.style.opacity = String(flight * 0.6);
        }
      }

      if (at) {
        const w = pill.offsetWidth;
        const h = pill.offsetHeight;
        pill.style.transform = `translate(${(at.x - w / 2).toFixed(1)}px, ${(at.y - h / 2).toFixed(1)}px)`;
        const facing = Math.cos(heading) < 0 ? -1 : 1;
        const tilt = clamp((heading * 180) / Math.PI, -35, 35) * 0.5 * facing;
        bird.style.transform = `translate(${(at.x - 30).toFixed(1)}px, ${(at.y - h / 2 - 50).toFixed(1)}px) scaleX(${facing}) rotate(${tilt.toFixed(1)}deg)`;
      }
      pill.style.opacity = String(showPill);
      bird.style.opacity = String(flight);

      /* the chapters' own pills: the one the charge rests in is itself, the rest are empty slots */
      const key = String(restStop);
      if (key !== away) {
        away = key;
        for (let n = 1; n <= 5; n++) {
          const el = stop(n);
          if (!el) continue;
          if (n === restStop) delete el.dataset.courier;
          else el.dataset.courier = "away";
        }
      }
      /* the cast still reacts when the charge lands in their chapter */
      if (restStop !== restAt) {
        if (restAt != null) window.dispatchEvent(new CustomEvent("v2s:depart", { detail: { stop: restAt } }));
        if (restStop != null) window.dispatchEvent(new CustomEvent("v2s:arrive", { detail: { stop: restStop } }));
        restAt = restStop;
      }
    };

    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      delete layer.dataset.on;
      main?.removeAttribute("data-courier-live");
      for (let n = 1; n <= 5; n++) delete stop(n)?.dataset.courier;
    };
  }, []);

  return (
    <div ref={root} className="hc" aria-hidden="true">
      <svg className="hc-sky" preserveAspectRatio="none">
        <path className="hc-glow" />
        <path className="hc-beam" />
      </svg>
      <div className="hc-bird">
        <svg viewBox={SYLPH_BIRD_VIEWBOX}>
          <path d={SYLPH_BIRD_PATH} />
        </svg>
      </div>
      <span className="hc-pill v2s-token-pill">
        <span className="v2s-token-m">Sushi Kanda</span>
        <span className="mono">$84.20</span>
      </span>
    </div>
  );
}

/*
 * The nav takes the ground under it: its bar turns the colour of whatever hour is behind it (a scene's
 * live sky included), and its type flips to bone over the dark ones, so the bar never cuts the page.
 */
export function HoursNavTint() {
  useEffect(() => {
    const main = document.querySelector<HTMLElement>(".hrs");
    if (!main) return;
    let last = "";
    const grounds = () =>
      Array.from(main.querySelectorAll<HTMLElement>(":scope > section, :scope > .hrs-air, :scope > footer, .hrs-p .hrs-stage"));
    const tick = () => {
      const y = 66;
      let colour = "";
      /* stages first: while one is stuck under the nav it wins over its own section */
      for (const el of grounds()) {
        const r = el.getBoundingClientRect();
        if (r.top <= y && r.bottom > y) {
          const c = el.classList.contains("hrs-stage") ? el.style.backgroundColor || getComputedStyle(el).backgroundColor : getComputedStyle(el).backgroundColor;
          if (c && c !== "rgba(0, 0, 0, 0)" && c !== "transparent") {
            colour = c;
            if (el.classList.contains("hrs-stage")) break;
          }
        }
      }
      if (!colour) colour = "rgb(255, 255, 255)";
      if (colour === last) return;
      last = colour;
      const m = colour.match(/[\d.]+/g)?.map(Number) ?? [255, 255, 255];
      const lum = (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255;
      main.style.setProperty("--nav-bg", colour);
      main.dataset.nav = lum < 0.5 ? "dark" : "light";
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      main.style.removeProperty("--nav-bg");
      delete main.dataset.nav;
    };
  }, []);
  return null;
}
