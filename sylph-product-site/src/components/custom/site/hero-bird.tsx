"use client";

import { useEffect, useRef } from "react";
import { gsap } from "./motion";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { Mark } from "./mark";

gsap.registerPlugin(MotionPathPlugin);

/* The glyph's beak points up and to the right; this is the offset that turns it along a path. */
const HEADING = 40;

/**
 * The Sylph arrives. On load the bird comes in from beyond the top-right of the stage, glides
 * left across the clip, turns, and flares up onto the corner of the month-end window. Only once
 * it has landed do the three verdicts land under it (the strip is [data-manual], so LoopGate
 * leaves it to us), and the wake it drew through the air retracts behind it. The flight runs
 * only under no-preference at desktop widths; everywhere else the bird is simply perched and
 * the verdicts land when the strip scrolls in, as before.
 */
export function HeroBird() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const stage = el?.parentElement;
    if (!el || !stage) return;
    const bird = el.querySelector<HTMLElement>(".hero-bird");
    const wake = el.querySelector<SVGPathElement>(".hero-wake");
    const svg = el.querySelector<SVGSVGElement>(".hero-wake-svg");
    const strip = stage.querySelector<HTMLElement>(".air-strip");
    if (!bird || !wake || !svg || !strip) return;

    /* the perch: on the top edge of the strip window, just left of its sample-data chip */
    const chip = strip.querySelector<HTMLElement>(".sample");
    const perch = () => {
      const s = stage.getBoundingClientRect();
      const r = strip.getBoundingClientRect();
      const edge = chip ? chip.getBoundingClientRect().left - 12 : r.right - 16;
      /* an outer <svg> has no offsetWidth; clientWidth is its CSS box */
      return {
        x: edge - s.left - bird.clientWidth,
        y: r.top - s.top - bird.clientHeight + 9,
        W: s.width,
        H: s.height,
      };
    };
    const settle = () => {
      const p = perch();
      gsap.set(bird, { x: p.x, y: p.y, rotation: 0, scale: 1, opacity: 1 });
    };
    const land = () => strip.classList.add("is-in");

    const mm = gsap.matchMedia();
    mm.add(
      {
        fly: "(prefers-reduced-motion: no-preference) and (min-width: 1025px)",
        still: "(prefers-reduced-motion: reduce), (max-width: 1024px)",
      },
      (ctx) => {
        const { fly } = ctx.conditions as { fly: boolean };
        const onResize = () => settle();

        /* the strip's height depends on the web fonts; re-seat the bird once they are in */
        const fonts = document.fonts?.ready;

        if (!fly) {
          settle();
          fonts?.then(settle);
          const io = new IntersectionObserver(
            (entries) => {
              if (entries.some((e) => e.isIntersecting)) {
                land();
                io.disconnect();
              }
            },
            { threshold: 0.35 },
          );
          io.observe(strip);
          window.addEventListener("resize", onResize);
          return () => {
            io.disconnect();
            window.removeEventListener("resize", onResize);
          };
        }

        let tl: gsap.core.Timeline | undefined;
        /* the route is measured just before take-off, once the fonts have settled the strip */
        const start = gsap.delayedCall(0.45, () => {
          const p = perch();
          const d = [
            `M ${p.W * 1.12} ${-p.H * 0.28}`,
            `C ${p.W * 0.9} ${-p.H * 0.02}, ${p.W * 0.5} ${p.H * 0.06}, ${p.W * 0.2} ${p.H * 0.3}`,
            `C ${p.W * 0.02} ${p.H * 0.5}, ${p.x - 180} ${p.y + 80}, ${p.x} ${p.y}`,
          ].join(" ");
          svg.setAttribute("viewBox", `0 0 ${p.W} ${p.H}`);
          wake.setAttribute("d", d);

          tl = gsap
            .timeline({ defaults: { ease: "none" }, onComplete: settle })
            .set(bird, { opacity: 0, scale: 0.55, rotation: 0 }, 0)
            .to(bird, { motionPath: { path: d, autoRotate: HEADING }, duration: 2.2, ease: "power2.inOut" }, 0)
            .to(bird, { opacity: 1, duration: 0.5 }, 0.05)
            .to(bird, { scale: 1, duration: 2.2, ease: "power1.inOut" }, 0)
            .fromTo(wake, { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: 2.2, ease: "power2.inOut" }, 0)
            /* the landing: the pose settles, one small bounce, and the verdicts land */
            .to(bird, { rotation: 0, duration: 0.6, ease: "back.out(1.8)" }, 2.1)
            .to(bird, { y: "+=3", duration: 0.16, ease: "power1.out", yoyo: true, repeat: 1 }, 2.2)
            .add(land, 2.4)
            /* the wake retracts toward the bird and fades */
            .to(wake, { drawSVG: "100% 100%", duration: 0.9, ease: "power2.in" }, 2.3)
            .to(wake, { opacity: 0, duration: 0.4 }, 2.9);
        });

        const onResizeFlown = () => {
          if (tl && tl.progress() === 1) settle();
        };
        window.addEventListener("resize", onResizeFlown);
        fonts?.then(onResizeFlown);
        return () => {
          start.kill();
          tl?.kill();
          window.removeEventListener("resize", onResizeFlown);
        };
      },
    );
    return () => mm.revert();
  }, []);

  return (
    <div className="hero-bird-layer" ref={root} aria-hidden="true">
      <svg className="hero-wake-svg" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
        <path className="hero-wake" d="M0 0" />
      </svg>
      <Mark className="hero-bird" />
    </div>
  );
}
