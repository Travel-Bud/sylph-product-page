"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/components/custom/site/motion";
import { SYLPH_BIRD_PATH, SYLPH_BIRD_VIEWBOX } from "@/components/custom/sylph-identity/sylph-bird-path";
import { CHARGE } from "@/components/custom/v2-sides/data";

/*
 * Mock B's courier: the Sushi Kanda charge, carried from stop to stop ([data-courier-stop] 0 in the hero,
 * 1 to 5 in the chapters) by the Sylph bird, across each handoff band ([data-handoff] n, between stop n and
 * n + 1). In the spirit of Mock A's: a pure function of the scroll position and the live boxes, read every
 * frame on GSAP's ticker, so scrolling back rewinds it.
 *
 * A flight is timed so the charge never leaves the screen: it lifts off when its stop reaches 36% of the
 * viewport and lands when the next stop reaches 58%. In between its height on screen moves steadily from
 * one to the other while its page position runs from stop to stop, so it passes exactly through the
 * band's pill on the line where the two grounds meet; sideways it crosses from one person's side to the
 * other. The amber beam behind it is the path it flew, attached to the page, and it shrinks into the
 * charge as it lands. On the last leg Dana has approved it: the charge flies green, as cleared.
 *
 * While the charge rests at a stop that stop's own pill is itself; every other pill is an empty slot
 * (data-courier="away"). Landing dispatches v2s:arrive, lifting off v2s:depart ({stop, to}), which the cast
 * and the panels already answer. Reduced motion never mounts any of it; every pill is simply present.
 */

type V = { x: number; y: number };
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
/* cubic Hermite: from a to b with end velocities va, vb (in units per segment) */
const herm = (a: number, b: number, va: number, vb: number, t: number) => {
  const t2 = t * t;
  const t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * a + (t3 - 2 * t2 + t) * va + (-2 * t3 + 3 * t2) * b + (t3 - t2) * vb;
};
const LIFT = 0.36;
const LAND = 0.58;

export function MbCourier() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = root.current;
    if (!layer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const main = layer.closest<HTMLElement>(".mb");
    if (!main) return;
    const pill = layer.querySelector<HTMLElement>(".mbc-pill")!;
    const bird = layer.querySelector<HTMLElement>(".mbc-bird")!;
    const beam = layer.querySelector<SVGPathElement>(".mbc-beam")!;
    const glow = layer.querySelector<SVGPathElement>(".mbc-glow")!;
    const svg = layer.querySelector<SVGSVGElement>(".mbc-sky")!;
    const stop = (n: number) => main.querySelector<HTMLElement>(`[data-courier-stop="${n}"]`);
    const band = (n: number) => main.querySelector<HTMLElement>(`[data-handoff="${n}"] .mb-ho-pill`);
    layer.dataset.on = "";
    main.setAttribute("data-courier-live", "");

    let restAt: number | null = null;
    let away = "";

    const tick = () => {
      const s = window.scrollY;
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      svg.setAttribute("viewBox", `0 0 ${vw} ${vh}`);

      /* every stop and band pill, in page coordinates. N is where a stop would be if nothing were
         sticky: a stop inside the policy pin lands by it (early in the pin) but lifts off by its live
         place (after the pin lets go), so the charge waits under the compile while it runs */
      const P: (V | null)[] = [];
      const N: (number | null)[] = [];
      for (let n = 0; n <= 5; n++) {
        const el = stop(n);
        const r = el?.getBoundingClientRect();
        P.push(r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 + s } : null);
        const track = el?.closest<HTMLElement>("[data-pin-track]");
        const pin = track?.firstElementChild as HTMLElement | null | undefined;
        if (r && track && pin) {
          const pad = parseFloat(getComputedStyle(track).paddingTop) || 0;
          N.push(r.top + r.height / 2 - pin.getBoundingClientRect().top + track.getBoundingClientRect().top + pad + s);
        } else N.push(r ? r.top + r.height / 2 + s : null);
      }
      const M: (V | null)[] = [];
      for (let n = 0; n < 5; n++) {
        const r = band(n)?.getBoundingClientRect();
        M.push(r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 + s } : null);
      }

      /* which leg: rest at k until stop k lifts off, fly leg k until stop k + 1 lands */
      let restStop: number | null = 5;
      let leg = -1;
      let t = 0;
      for (let k = 0; k < 5; k++) {
        const A = P[k];
        const B = P[k + 1];
        if (!A || !B) continue;
        const s0 = A.y - LIFT * vh;
        const s1 = Math.max(s0 + 1, N[k + 1]! - LAND * vh);
        if (s < s0) {
          restStop = k;
          break;
        }
        if (s < s1) {
          restStop = null;
          leg = k;
          t = (s - s0) / (s1 - s0);
          break;
        }
      }

      if (leg >= 0) {
        const A = P[leg]!;
        const B = P[leg + 1]!;
        const Mid = M[leg] ?? { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
        const tm = clamp((Mid.y - A.y) / Math.max(1, B.y - A.y), 0.2, 0.8);
        /* the path as a function of flight progress u, in page coordinates */
        const at = (u: number): V => {
          const y = A.y + (B.y - A.y) * u - Math.sin(Math.PI * u) * 36;
          const v = (B.x - A.x) * 0.9;
          const x = u < tm ? herm(A.x, Mid.x, 0, v * tm, u / tm) : herm(Mid.x, B.x, v * (1 - tm), 0, (u - tm) / (1 - tm));
          return { x, y };
        };
        const p = at(t);
        const q = at(Math.min(1, t + 0.01));
        const heading = Math.atan2(q.y - p.y, q.x - p.x);
        const flight = clamp(Math.sin(Math.PI * t) * 3, 0, 1);

        /* the beam: the flown path just behind the charge, growing, then drawn into it */
        const u0 = Math.max(0, t - 0.32 * Math.sin(Math.PI * t));
        let d = "";
        for (let i = 0; i <= 32; i++) {
          const w = at(u0 + ((t - u0) * i) / 32);
          d += `${i ? "L" : "M"}${w.x.toFixed(1)} ${(w.y - s).toFixed(1)}`;
        }
        beam.setAttribute("d", d);
        glow.setAttribute("d", d);
        beam.style.opacity = String(flight);
        glow.style.opacity = String(flight * 0.55);

        /* Dana approved it at the desk: the last leg flies cleared */
        const cleared = leg === 4 && t > 0.12;
        layer.dataset.tone = cleared ? "ok" : "note";

        const w = pill.offsetWidth;
        const h = pill.offsetHeight;
        const sy = p.y - s;
        pill.style.transform = `translate(${(p.x - w / 2).toFixed(1)}px, ${(sy - h / 2).toFixed(1)}px)`;
        const facing = Math.cos(heading) < 0 ? -1 : 1;
        const tilt = clamp((heading * 180) / Math.PI, -35, 35) * 0.5 * facing;
        bird.style.transform = `translate(${(p.x - 21).toFixed(1)}px, ${(sy - h / 2 - 40).toFixed(1)}px) scaleX(${facing}) rotate(${tilt.toFixed(1)}deg)`;
        pill.style.opacity = "1";
        bird.style.opacity = String(flight);
      } else {
        pill.style.opacity = "0";
        bird.style.opacity = "0";
        beam.style.opacity = "0";
        glow.style.opacity = "0";
      }

      /* the stops' own pills: the one holding the charge is itself, the rest are empty slots */
      const key = String(restStop);
      if (key !== away) {
        away = key;
        for (let n = 0; n <= 5; n++) {
          const el = stop(n);
          if (!el) continue;
          if (n === restStop) delete el.dataset.courier;
          else el.dataset.courier = "away";
        }
      }
      if (restStop !== restAt) {
        const to = restStop ?? (leg >= 0 ? (restAt === leg ? leg + 1 : leg) : null);
        if (restAt != null) window.dispatchEvent(new CustomEvent("v2s:depart", { detail: { stop: restAt, to } }));
        if (restStop != null) window.dispatchEvent(new CustomEvent("v2s:arrive", { detail: { stop: restStop } }));
        restAt = restStop;
      }
    };

    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      delete layer.dataset.on;
      main.removeAttribute("data-courier-live");
      for (let n = 0; n <= 5; n++) delete stop(n)?.dataset.courier;
    };
  }, []);

  return (
    <div ref={root} className="mbc" aria-hidden="true">
      <svg className="mbc-sky" preserveAspectRatio="none">
        <path className="mbc-glow" />
        <path className="mbc-beam" />
      </svg>
      <div className="mbc-bird">
        <svg viewBox={SYLPH_BIRD_VIEWBOX}>
          <path d={SYLPH_BIRD_PATH} />
        </svg>
      </div>
      <span className="mbc-pill v2s-token-pill">
        <span className="v2s-token-m">{CHARGE.merchant}</span>
        <span className="mono">{CHARGE.amount}</span>
      </span>
    </div>
  );
}

/*
 * The nav takes the ground under it, so the bar never cuts a coloured chapter: it reads the section (or
 * the half of a handoff band) at its bottom edge and flips its type to bone over the two dark grounds.
 */
export function MbNavTint() {
  useEffect(() => {
    const main = document.querySelector<HTMLElement>(".mb");
    if (!main) return;
    let last = "";
    const tick = () => {
      const y = 64;
      let colour = "#ffffff";
      let dark = false;
      for (const el of Array.from(main.querySelectorAll<HTMLElement>("[data-ground], [data-ground-top]"))) {
        const r = el.getBoundingClientRect();
        if (r.top > y || r.bottom <= y) continue;
        if (el.dataset.groundTop) {
          const upper = y - r.top < r.height / 2;
          colour = upper ? el.dataset.groundTop : (el.dataset.groundBottom ?? colour);
          dark = upper ? el.dataset.darkTop != null : el.dataset.darkBottom != null;
        } else {
          colour = el.dataset.ground ?? colour;
          dark = el.dataset.dark != null;
        }
        break;
      }
      const key = colour + dark;
      if (key === last) return;
      last = key;
      main.style.setProperty("--nav-bg", colour);
      main.dataset.nav = dark ? "dark" : "light";
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
