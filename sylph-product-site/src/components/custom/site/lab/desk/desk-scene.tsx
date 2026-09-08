"use client";

import Link from "next/link";
import { useRef, type CSSProperties } from "react";
import { gsap, ScrollTrigger, useGSAP, MM_MOTION } from "@/components/custom/site/motion";
import { Obj, type ObjName } from "@/components/custom/site/obj";
import { RulesWindow, MatchCard } from "@/components/custom/site/panels";
import { Arrow } from "@/components/custom/site/icons";
import { HOME } from "@/components/custom/site/anchors";

/* ------------------------------------------------------------------
   THE DESK — one continuous three quarter surface, travelled by camera.

   The world is WORLD vw wide and the camera pans TRAVEL vw across it,
   scrubbed by ScrollTrigger against a sticky viewport. Three depths:
   the far layer (wall and desk plane) at FAR rate, the objects at 1,
   the risen surfaces at 1 + SURF with a per surface offset so each one
   registers exactly with its objects at its own stop.
   Below 1000px, and under reduced motion, none of this runs: CSS lays
   the same DOM out as a stacked still with every surface visible.
   ------------------------------------------------------------------ */

const WORLD = 420; // world width, vw
const TRAVEL = 320; // camera travel, vw
const FAR = 0.35; // background parallax rate
const SURF = 0.045; // surfaces run this much faster than the objects

/* alpha bounding box of each render, from MEDIA.md: width and the base
   line as a percentage of its square box. Drives the contact shadow. */
const BBOX: Record<ObjName, { w: number; base: number }> = {
  policy: { w: 65.2, base: 88.6 },
  receipt: { w: 71.5, base: 92.3 },
  envelope: { w: 74.6, base: 79.5 },
  phone: { w: 70.9, base: 84.1 },
  tray: { w: 83.3, base: 82.8 },
  "boarding-pass": { w: 82.8, base: 73.7 },
  card: { w: 74.9, base: 78.7 },
  terminal: { w: 52.0, base: 88.8 },
  report: { w: 55.7, base: 92.7 },
};

type SlotProps = { name: ObjName; x: number; y: number; s: number; r?: number; priority?: boolean };

/** One object standing on the desk: positioned by world x, depth y, with
    its own contact ellipse under the render's real base line. */
function Slot({ name, x, y, s, r = 0, priority }: SlotProps) {
  const b = BBOX[name];
  const style = { "--x": x, "--y": y, "--s": s, "--r": `${r}deg`, "--bw": b.w, "--base": b.base } as CSSProperties;
  return (
    <span className="dk-slot" style={style}>
      <Obj name={name} size={s} className="dk-obj" priority={priority} />
    </span>
  );
}

const VERDICTS = [
  {
    m: "Sushi Kanda",
    a: "$84.20",
    v: "note" as const,
    label: "Needs a note",
    cite: "M-041, solo dinner cap $75.00, $9.20 over",
  },
  {
    m: "Bar Bianco",
    a: "$46.90",
    v: "block" as const,
    label: "Blocked",
    cite: "M-017, alcohol not reimbursable, $46.90 off the total",
  },
  {
    m: "Amtrak",
    a: "$118.00",
    v: "ok" as const,
    label: "Cleared",
    cite: "T-008, rail fare cap $250.00, $132.00 under",
  },
];

/** Hand built: panels.tsx has no verdict surface. 84.20 + 46.90 + 118.00
    checked, less the blocked 46.90, leaves 202.20 reimbursable. */
function VerdictSlip() {
  return (
    <div className="win dkv" aria-label="Sample verdicts">
      <div className="win-bar">
        <span>Verdicts, Sep 12 to Sep 13</span>
        <span className="sample">Sample data</span>
      </div>
      <ul className="dkv-list">
        {VERDICTS.map((r) => (
          <li key={r.m} className="dkv-row">
            <span className="dkv-m">{r.m}</span>
            <span className="num dkv-a">{r.a}</span>
            <span className={`verdict verdict-${r.v}`}>
              <i className="dot" aria-hidden="true" />
              {r.label}
            </span>
            <span className="mono dkv-c">{r.cite}</span>
          </li>
        ))}
      </ul>
      <div className="dkv-foot">
        <div className="dkv-sums mono">
          <span>
            Checked <b className="num">$249.10</b>
          </span>
          <span>
            Reimbursable <b className="num">$202.20</b>
          </span>
        </div>
        <p className="mono dkv-note">Blocked means not reimbursable. The card was not declined.</p>
      </div>
    </div>
  );
}

function Caption({ x, b, eyebrow, line }: { x: number; b: number; eyebrow: string; line: string }) {
  return (
    <div className="dk-cap" data-x={x} style={{ "--x": x, "--cb": b } as CSSProperties}>
      <p className="eyebrow">{eyebrow}</p>
      <p className="dk-cap-line">{line}</p>
    </div>
  );
}

/** Surface anchors are camera stops as a fraction of TRAVEL: the rules
    window lands at 60vw of travel, the match at 140, the verdicts at 224. */
const A_RULES = 60 / TRAVEL;
const A_MATCH = 140 / TRAVEL;
const A_VERDICT = 224 / TRAVEL;

export function DeskScene() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const far = useRef<HTMLDivElement>(null);
  const ground = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const lead = useRef<HTMLDivElement>(null);
  const tail = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`${MM_MOTION} and (min-width: 1280px) and (min-height: 640px)`, () => {
        const d = () => (window.innerWidth * TRAVEL) / 100;

        // a caption sits directly above its surface, whatever height the
        // panel takes at this width; measured, not guessed
        const groups = gsap.utils.toArray<HTMLElement>(".desk-group", root.current);
        const place = () => {
          groups.forEach((g) => {
            const cap = g.querySelector<HTMLElement>(".dk-cap");
            const sur = g.querySelector<HTMLElement>(".dk-surface");
            if (cap && sur) cap.style.bottom = `${g.offsetHeight - sur.offsetTop + 20}px`;
          });
        };
        place();
        ScrollTrigger.addEventListener("refreshInit", place);

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: track.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.55,
            invalidateOnRefresh: true,
          },
        });

        tl.fromTo(world.current, { x: 0 }, { x: () => -d(), ease: "none", duration: 1 }, 0);
        tl.fromTo(far.current, { x: 0, scale: 1 }, { x: () => -d() * FAR, scale: 1.08, ease: "none", duration: 1 }, 0);
        // the camera settling a little lower over the desk as it travels
        tl.fromTo(ground.current, { scale: 1 }, { scale: 1.035, ease: "none", duration: 1 }, 0);
        tl.to(lead.current, { autoAlpha: 0, y: -30, ease: "power1.in", duration: 0.075 }, 0.012);
        tl.fromTo(tail.current, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.06 }, 0.9);

        // captions belong to a stop: they arrive with it and leave with it,
        // so no half a word is ever clipped by the frame edge
        const at = (camera: number) => camera / TRAVEL;
        gsap.utils.toArray<HTMLElement>(".dk-cap", root.current).forEach((el) => {
          const x = Number(el.dataset.x);
          tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, ease: "none", duration: at(26) }, at(x - 88));
          tl.to(el, { autoAlpha: 0, ease: "none", duration: at(15) }, at(x - 17));
        });

        const surfaces = gsap.utils.toArray<HTMLElement>(".dk-surface", root.current);
        surfaces.forEach((el) => {
          const a = Number(el.dataset.anchor);
          // linear in progress, so the offset is zero exactly at this stop
          tl.fromTo(el, { x: () => SURF * d() * a }, { x: () => -SURF * d() * (1 - a), ease: "none", duration: 1 }, 0);
          tl.fromTo(
            el,
            { autoAlpha: 0, yPercent: 24, scale: 0.965 },
            { autoAlpha: 1, yPercent: 0, scale: 1, ease: "power2.out", duration: 0.062 },
            a - 0.098,
          );
          // the one thing that is not scrubbed: a short settle as it lands
          tl.call(
            () => {
              el.classList.add("is-set");
            },
            undefined,
            a - 0.036,
          );
        });
        return () => {
          ScrollTrigger.removeEventListener("refreshInit", place);
          groups.forEach((g) => {
            const cap = g.querySelector<HTMLElement>(".dk-cap");
            if (cap) cap.style.bottom = "";
          });
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      className="desk"
      id="desk"
      ref={root}
      aria-label="The desk"
      style={{ "--dk-w": WORLD, "--dk-tr": TRAVEL, "--dk-far": FAR } as CSSProperties}
    >
      <div className="desk-track" ref={track}>
        <div className="desk-view">
          <div className="desk-ground" ref={ground} aria-hidden="true">
            <div className="desk-wall" />
            <div className="desk-plane" />
          </div>
          <div className="desk-far" ref={far} aria-hidden="true">
            <span className="desk-pool" style={{ "--x": 16 } as CSSProperties} />
            <span className="desk-pool" style={{ "--x": 92 } as CSSProperties} />
            <span className="desk-pool" style={{ "--x": 168 } as CSSProperties} />
          </div>

          <div className="desk-lead" ref={lead}>
            <p className="eyebrow">Corporate travel and expense</p>
            <h1 className="h1">
              Write the policy once. <span className="hl">Sylph enforces it on every charge.</span>
            </h1>
            <p className="lede">
              Sylph reads your policy and drafts the rules. A person approves them. From then on every card charge,
              receipt and booking is checked against the same rules.
            </p>
            <div className="hero-cta">
              <Link href={`${HOME}/demo`} className="btn btn-primary btn-lg">
                Book a demo
              </Link>
              <span className="mono dk-scroll-cue">Scroll to cross the desk</span>
            </div>
            <p className="hero-note mono">Works with the cards and banks you use.</p>
          </div>

          <div className="desk-world" ref={world}>
            <div className="desk-group">
              <Caption x={96} b={68} eyebrow="Compile" line="Your policy, compiled into rules. A person approves each one before it runs." />
              <div className="dk-things">
                <Slot name="receipt" x={57} y={73} s={135} r={16} />
                <Slot name="policy" x={67} y={45} s={265} r={-5} priority />
                <Slot name="boarding-pass" x={78} y={71} s={205} r={-8} priority />
                <Slot name="receipt" x={89} y={40} s={175} r={7} priority />
              </div>
              <div className="dk-surface dk-rules" data-anchor={A_RULES} style={{ "--x": 96, "--sw": 46, "--b": 15 } as CSSProperties}>
                <div className="dk-in">
                  <RulesWindow />
                </div>
              </div>
            </div>

            <div className="desk-group">
              <Caption x={192} b={59} eyebrow="Evidence" line="Receipts arrive three ways. Each one finds its charge before anything is enforced." />
              <div className="dk-things">
                <Slot name="envelope" x={149} y={63} s={195} r={-4} />
                <Slot name="tray" x={166} y={43} s={250} r={3} />
                <Slot name="phone" x={183} y={70} s={185} r={-9} />
              </div>
              <div className="dk-surface dk-match" data-anchor={A_MATCH} style={{ "--x": 192, "--sw": 44, "--b": 24 } as CSSProperties}>
                <div className="dk-in">
                  <MatchCard />
                </div>
              </div>
            </div>

            <div className="desk-group">
              <Caption x={276} b={57} eyebrow="Verdict" line="A verdict that cannot cite its rule is an opinion." />
              <div className="dk-things">
                <Slot name="terminal" x={242} y={43} s={245} />
                <Slot name="card" x={257} y={70} s={200} r={-11} />
              </div>
              <div className="dk-surface dk-verdict" data-anchor={A_VERDICT} style={{ "--x": 276, "--sw": 44, "--b": 17 } as CSSProperties}>
                <div className="dk-in">
                  <VerdictSlip />
                </div>
              </div>
            </div>

            <div className="desk-group">
              <div className="dk-things">
                <Slot name="report" x={392} y={46} s={275} r={-3} priority />
                <Slot name="card" x={371} y={72} s={175} r={9} />
                <Slot name="receipt" x={408} y={70} s={155} r={-13} />
              </div>
            </div>
          </div>

          <div className="desk-tail" ref={tail}>
            <h2 className="h2">Exceptions come to you. Everything else files itself.</h2>
            <p className="lede">Every line carries the rule, the threshold and the amount that produced it.</p>
            <div className="hero-cta">
              <Link href={`${HOME}/demo`} className="btn btn-primary btn-lg">
                Book a demo
              </Link>
              <Link href={`${HOME}/pricing`} className="link-arrow">
                See pricing
                <Arrow />
              </Link>
            </div>
            <p className="hero-note mono">Same day setup. Nothing to switch.</p>
          </div>

          <div className="desk-lip" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
