"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { gsap, SplitText, useGSAP, EASE_REVEAL, MM_MOTION } from "./motion";
import { QueuePanel } from "./flight/queue-panel";
import { createGustStore } from "./flight/gust-store";
import { detectFlightTier, budgetFor, type FlightCapabilities } from "./flight/detect";
import { buildFlightTimeline, resetFlight, type FlightStage } from "./flight/orchestrator";
import { AURORA_ART, DEFAULT_PARAMS } from "./flight/params";
import type { SheetsApi } from "./flight/hero-flight";
import type { RowAtlas } from "./flight/capture";
import { DEMO } from "@/components/custom/site/anchors";

/* three.js enters only through this — zero GL bytes on first paint, nothing
   at all on the fade tier. (The living-vortex bg shader is parked in the lab
   for now — owner's call 2026-07-08: the artwork stays STATIC in the hero.) */
const FlightCanvas = dynamic(
  () => import("./flight/flight-canvas").then((m) => m.FlightCanvas),
  { ssr: false },
);

/* The flight runs only where it can be read: motion allowed, desktop widths.
   The living vortex runs anywhere WebGL does — it is the page's resting state. */
const MM_WIND = "(prefers-reduced-motion: no-preference) and (min-width: 981px)";

/** the pre-delay before the wind: entrance settles, captures finish */
const GATE_S = 2.1;
/** if the GL pipeline isn't ready this long after the gate, the DOM sweep runs */
const BAILOUT_MS = 3500;

/**
 * Night hero on the aurora vortex. Left: the pillar, verbatim. Right: the
 * signature moment — a glass review queue holds this month's charges; the
 * wind builds, rows peel off as real paper and ride the current INTO the
 * coil, winding in and dissolving into its light; the giant serif tally
 * falls 214 → 3; the meter drains to an amber sliver; the three exceptions
 * settle in front of the reader. The coil is the still center of the frame —
 * the motion belongs to the paper.
 *
 * Two layers, one truth: `.wq` (in flow) is the settled end state that
 * no-JS, reduced-motion, and mobile all see. `.wq-before` is an absolute
 * overlay that exists only while JS owns the wind. The wind never plays to
 * an empty room: if the stage is off-screen at play time it snaps to truth,
 * and a quiet "run it again" replays it — same 214, same 3, every time.
 */
export function HeroSection() {
  const ref = useRef<HTMLElement>(null);

  const gustRef = useRef(createGustStore());
  const capsRef = useRef<FlightCapabilities | null>(null);
  const sheetsRef = useRef<SheetsApi | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const armedRef = useRef(false);
  const gateFiredRef = useRef(false);
  const playedRef = useRef(false);

  const [glMount, setGlMount] = useState(false);
  const [atlas, setAtlas] = useState<RowAtlas | null>(null);

  /* ------------------------------------------------------------ helpers -- */

  const stage = useCallback(
    (): FlightStage => ({
      root: ref.current!,
      sheets: sheetsRef.current!,
      gust: gustRef.current,
    }),
    [],
  );

  const snapToTruth = useCallback(() => {
    const root = ref.current;
    if (!root) return;
    const truth = root.querySelector<HTMLElement>(".wq");
    const before = root.querySelector<HTMLElement>(".wq-before");
    if (truth) gsap.set(truth, { autoAlpha: 1 });
    if (before) gsap.set(before, { autoAlpha: 0 });
    delete root.dataset.anim;
  }, []);

  /** GL path: reset to the full pile, rebuild the master timeline */
  const buildRun = useCallback(() => {
    if (!sheetsRef.current || !ref.current) return null;
    tlRef.current?.kill();
    const st = stage();
    resetFlight(st);
    const run = buildFlightTimeline(st, DEFAULT_PARAMS);
    tlRef.current = run.tl;
    return run.tl;
  }, [stage]);

  const playGl = useCallback(() => {
    const tl = buildRun();
    if (!tl) return false;
    playedRef.current = true;
    tl.play(0);
    return true;
  }, [buildRun]);

  /* DOM sweep — the graceful tier: no GL, no paper theatrics; the rows fade
     into the air in two quiet clusters while the tally and meter do the
     telling, then the ledger closes up. Same story, calmer voice. */
  const domReset = useCallback(() => {
    const root = ref.current;
    if (!root) return null;
    const before = root.querySelector<HTMLElement>(".wq-before");
    const truth = root.querySelector<HTMLElement>(".wq");
    if (!before || !truth) return null;
    tlRef.current?.kill();
    tlRef.current = null;
    /* laid out BEFORE clearProps (the "of 214 214" reparenting bug) */
    root.dataset.anim = "1";
    root.dataset.tier = capsRef.current?.tier === "fade" ? "fade" : "dom";
    const rows = gsap.utils.toArray<HTMLElement>(".wq-list > *", before);
    gsap.set([...rows, before], { clearProps: "all" });
    const foot = before.querySelector<HTMLElement>(".wq-foot");
    if (foot) {
      gsap.set(foot, { clearProps: "all" });
      gsap.set(foot, { opacity: 0 });
    }
    const count = before.querySelector<HTMLElement>(".wq-head .n b");
    if (count) {
      gsap.set(count, { clearProps: "all" });
      count.textContent = "214";
    }
    const fill = before.querySelector<HTMLElement>(".wq-meter .fill");
    if (fill) gsap.set(fill, { clearProps: "all" });
    gsap.set(truth, { autoAlpha: 0 });
    return { before, truth };
  }, []);

  const playDom = useCallback(() => {
    const root = ref.current;
    const parts = domReset();
    if (!root || !parts) return snapToTruth();
    const { before, truth } = parts;
    playedRef.current = true;

    const crows = gsap.utils.toArray<HTMLElement>(".wq-list .crow", before).filter(
      (el) => el.offsetParent !== null,
    );
    const keeps = gsap.utils.toArray<HTMLElement>(".wq-list .wq-row", before);
    const truthKeeps = gsap.utils.toArray<HTMLElement>(".wq-row", truth);
    const foot = before.querySelector<HTMLElement>(".wq-foot");
    const count = before.querySelector<HTMLElement>(".wq-head .n b");
    const fill = before.querySelector<HTMLElement>(".wq-meter .fill");
    if (keeps.length !== truthKeeps.length) return snapToTruth();

    const deltas = keeps.map((el, i) => truthKeeps[i].offsetTop - el.offsetTop);
    const tallH = before.offsetHeight;
    const truthH = truth.offsetHeight;
    const n = { v: 214 };

    const tl = gsap.timeline({
      defaults: { ease: EASE_REVEAL },
      onComplete: () => {
        delete root.dataset.anim;
      },
    });
    tlRef.current = tl;

    /* the rows leave in two breaths */
    crows.forEach((row, i) => {
      const at = 0.3 + (i % 2 === 0 ? 0 : 0.9) + Math.floor(i / 2) * 0.14;
      tl.to(row, { x: 16, autoAlpha: 0, duration: 0.55, ease: "power1.in" }, at);
    });
    if (count) {
      tl.to(
        n,
        {
          v: 3,
          duration: 2.1,
          ease: "power2.inOut",
          onUpdate: () => {
            count.textContent = String(Math.round(n.v));
          },
        },
        0.3,
      );
      tl.fromTo(count, { scale: 1 }, { scale: 1.07, duration: 0.14, ease: "power2.out" }, 2.4)
        .to(count, { scale: 1, duration: 0.3, ease: "power2.inOut" }, 2.54)
        .to(count, { color: "#58e8ad", duration: 0.12, ease: "power1.in" }, 2.4)
        .to(count, { color: "#f4f7f5", duration: 0.45, ease: "power1.out" }, 2.69);
    }
    if (fill) tl.fromTo(fill, { scaleX: 0 }, { scaleX: 1, duration: 2.1, ease: "power2.inOut" }, 0.3);

    /* what needs a person settles; the ledger closes up */
    tl.to(keeps, { y: (i: number) => deltas[i], duration: 0.85, stagger: 0.05 }, 2.2);
    tl.fromTo(before, { height: tallH }, { height: truthH, duration: 0.85, ease: EASE_REVEAL }, 2.2);
    if (foot) tl.to(foot, { autoAlpha: 1, duration: 0.6 }, 2.55);
    const dot = foot?.querySelector<HTMLElement>(".dot");
    if (dot) tl.from(dot, { scale: 0, duration: 0.35, ease: "back.out(1.7)" }, 2.65);

    tl.to(truth, { autoAlpha: 1, duration: 0.4, ease: "power1.out" }, "+=0.3");
    tl.to(before, { autoAlpha: 0, duration: 0.4, ease: "power1.out" }, "<");
  }, [domReset, snapToTruth]);

  /** the gate: play whatever is ready, to whoever is watching */
  const fireGate = useCallback(() => {
    const root = ref.current;
    if (!root || playedRef.current) return;
    gateFiredRef.current = true;
    const stageEl = root.querySelector<HTMLElement>(".wh-stage");
    const r = stageEl?.getBoundingClientRect();
    const visible = !!r && r.bottom > 0 && r.top < window.innerHeight * 0.9;
    if (!visible) return snapToTruth();

    if (capsRef.current?.tier === "gl") {
      if (armedRef.current && playGl()) return;
      /* not armed yet — the bailout below decides */
      window.setTimeout(() => {
        if (playedRef.current) return;
        if (armedRef.current && playGl()) return;
        playDom(); // capture/GL never arrived — the story still plays
      }, BAILOUT_MS);
      return;
    }
    playDom();
  }, [playDom, playGl, snapToTruth]);

  /* --------------------------------------------------------- entrances --- */

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const mm = gsap.matchMedia();

      /* entrance — all widths, motion allowed */
      mm.add(MM_MOTION, () => {
        const split = SplitText.create(".ar-h1", {
          type: "lines",
          mask: "lines",
          linesClass: "lp-line",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 112,
              duration: 1.05,
              ease: EASE_REVEAL,
              stagger: 0.1,
              delay: 0.25,
              onComplete: () => {
                gsap.set(self.lines, { clearProps: "willChange" });
              },
            }),
        });
        gsap
          .timeline({ defaults: { ease: EASE_REVEAL } })
          .from(".wh-bg", { autoAlpha: 0, scale: 1.06, duration: 1.6, ease: "power2.out" }, 0)
          .from(".wh-copy .ar-sub, .wh-ctas, .wh-note", { y: 18, autoAlpha: 0, duration: 0.9, stagger: 0.08 }, 0.55)
          .from(".wh-stage", { x: 36, autoAlpha: 0, duration: 1.15 }, 0.7)
          .from(".wh-foot", { autoAlpha: 0, duration: 0.9, ease: "power2.out" }, 1.0);

        /* scroll: the aurora sinks slower than the page; copy and foot ease out. */
        gsap.to(".wh-bg", {
          yPercent: 14,
          ease: "none",
          force3D: true,
          scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
        });
        gsap.to(".wh-inner, .wh-foot", {
          yPercent: -5,
          autoAlpha: 0.3,
          ease: "none",
          force3D: true,
          scrollTrigger: { trigger: root, start: "top top", end: "bottom 30%", scrub: true },
        });

        return () => split.revert();
      });

      /* the wind — desktop + motion only */
      mm.add(MM_WIND, () => {
        const caps = capsRef.current ?? detectFlightTier();
        capsRef.current = caps;
        root.classList.add("can-anim");

        const truth = root.querySelector<HTMLElement>(".wq");

        if (caps.tier === "gl") {
          /* the overlay must be laid out before capture reads it */
          root.dataset.anim = "1";
          root.dataset.tier = "gl";
          if (truth) gsap.set(truth, { autoAlpha: 0 });
          setGlMount(true);
        } else {
          root.dataset.anim = "1";
          root.dataset.tier = caps.tier;
          if (truth) gsap.set(truth, { autoAlpha: 0 });
        }

        const dc = gsap.delayedCall(GATE_S, fireGate);

        /* replay: same inputs, same verdicts — determinism you can poke */
        const replayBtn = root.querySelector<HTMLButtonElement>(".wq-replay");
        const onReplay = () => {
          if (root.dataset.anim && tlRef.current?.isActive()) return;
          if (capsRef.current?.tier === "gl" && armedRef.current) playGl();
          else playDom();
        };
        replayBtn?.addEventListener("click", onReplay);

        return () => {
          dc.kill();
          tlRef.current?.kill();
          tlRef.current = null;
          replayBtn?.removeEventListener("click", onReplay);
          if (truth) gsap.set(truth, { clearProps: "opacity,visibility" });
          delete root.dataset.anim;
          delete root.dataset.tier;
          root.classList.remove("can-anim");
        };
      });
    },
    { scope: ref },
  );

  /* ----------------------------------------------------------- tiers ----- */

  /* capability probe once */
  useEffect(() => {
    capsRef.current = detectFlightTier();
  }, []);

  /* capture the rows into the atlas during the pre-gate window */
  useEffect(() => {
    if (!glMount) return;
    const root = ref.current;
    if (!root) return;
    let dead = false;
    (async () => {
      try {
        const { captureRows, buildAtlas } = await import("./flight/capture");
        const rows = Array.from(root.querySelectorAll<HTMLElement>(".wq-before .wq-list .crow"));
        if (!rows.length) throw new Error("no rows");
        const caps = await captureRows(rows, root);
        if (dead) return;
        setAtlas(buildAtlas(caps));
      } catch {
        /* the gate's bailout plays the DOM sweep */
        if (!dead && capsRef.current) capsRef.current = { ...capsRef.current, tier: "dom" };
      }
    })();
    return () => {
      dead = true;
    };
  }, [glMount]);

  /* sheets ready → arm; if the gate already fired to a watching viewer, fly now */
  const onSheets = useCallback(
    (api: SheetsApi) => {
      sheetsRef.current = api;
      armedRef.current = true;
      buildRun();
      if (gateFiredRef.current && !playedRef.current) {
        const stageEl = ref.current?.querySelector<HTMLElement>(".wh-stage");
        const r = stageEl?.getBoundingClientRect();
        if (r && r.bottom > 0 && r.top < window.innerHeight * 0.9) playGl();
        else snapToTruth();
      }
    },
    [buildRun, playGl, snapToTruth],
  );

  /* ------------------------------------------------------------- markup -- */

  return (
    <header ref={ref} className="wh-hero on-night" id="top">
      <div className="wh-bg" aria-hidden="true">
        <Image src={AURORA_ART.src} alt="" fill priority sizes="100vw" quality={86} />
      </div>
      <div className="wh-veil" aria-hidden="true" />

      <div className="wrap wh-inner">
        <div className="wh-copy">
          <h1 className="ar-h1">
            Stop reviewing expenses.
            <br />
            Start reviewing <em>exceptions.</em>
          </h1>
          <p className="ar-sub">
            Sylph books travel inside your policy, catches receipts on their own, and checks
            every charge as it lands. The routine clears itself. Your team decides only what
            actually needs a decision.
          </p>
          <div className="wh-ctas">
            <Link href={DEMO} className="btn btn-aurora btn-lg">
              Book a demo
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
            <a href="#capture" className="btn btn-glass btn-lg">
              See how it works
            </a>
          </div>
          <p className="wh-note">Configured in 15 minutes, from your own policy document.</p>
        </div>

        <div className="wh-stage">
          <div>
            <QueuePanel />

            {/* determinism, poke-able: replays the wind on the same 214 and
                lands on the same 3. Rendered only where the wind can run. */}
            <button type="button" className="wq-replay">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              run it again · same 214, same 3
            </button>
          </div>
        </div>
      </div>

      {glMount && atlas && (
        <FlightCanvas
          atlas={atlas}
          params={DEFAULT_PARAMS}
          segments={budgetFor(capsRef.current ?? detectFlightTier()).planeSegments}
          dprCap={budgetFor(capsRef.current ?? detectFlightTier()).dprCap}
          onSheets={onSheets}
        />
      )}

      <div className="wrap wh-foot">
        <span className="ar-scrollcue">
          <span className="ar-wheel" aria-hidden="true" />
          Scroll
        </span>
      </div>
    </header>
  );
}
