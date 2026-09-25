"use client";

import { gsap } from "@/components/custom/site/motion";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { Passage, TimeCard, visibleBox, type Build } from "./passage";
import { Range, Stars, Towers } from "./scenery";
import { H } from "./palette";

gsap.registerPlugin(MotionPathPlugin);

/*
 * Passage 3, the answer. The verdict is a note on Dana's lilac paper. It folds into a paper plane,
 * crease by crease (each facet's points morph, so the fold is drawn, not swapped), while the page
 * falls to night over Denver. Then it launches, loops over the city on a line of air and glides down
 * toward Priya, who is still outside the restaurant.
 */

/* the sheet, centred on 0,0: a body and two flaps. Each keyframe keeps every polygon's point count. */
const BODY = [
  "0,-130 100,-130 100,130 -100,130 -100,-130",
  "0,-130 100,-30 100,130 -100,130 -100,-30",
  "0,-130 52,24 52,130 -52,130 -52,24",
  "0,-130 96,112 10,96 -10,96 -96,112",
];
const FLAP_L = ["0,-130 -100,-130 -100,-30", "0,-130 0,-30 -100,-30", "0,-130 0,44 -52,24", "0,-130 -2,96 -44,70"];
const FLAP_R = ["0,-130 100,-130 100,-30", "0,-130 0,-30 100,-30", "0,-130 0,44 52,24", "0,-130 2,96 44,70"];
const CREASE = ["0,-130 0,130", "0,-130 0,130", "0,-130 0,130", "0,-130 0,96"];

const build: Build = ({ tl, q, stage }) => {
  /* night falls: lilac, a violet dusk, then night; the city and the range rise into it */
  tl.fromTo(stage, { backgroundColor: H.lilac }, { backgroundColor: "#7d6fa8", duration: 0.2 }, 0).to(
    stage,
    { backgroundColor: H.night, duration: 0.22 },
    0.2,
  );
  tl.fromTo(q(".hrs-card"), { color: H.ink }, { color: H.bone, duration: 0.12 }, 0.16);
  tl.fromTo(q(".hrs-star"), { opacity: 0 }, { opacity: 1, duration: 0.2, stagger: { each: 0.002, from: "random" } }, 0.25);
  tl.fromTo(q(".p3-moon"), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.25 }, 0.3);
  tl.fromTo(q(".p3-city"), { y: 260 }, { y: 0, duration: 0.4, ease: "power2.out" }, 0.18);
  tl.fromTo(q(".p3-city .hrs-tower-win rect"), { opacity: 0 }, { opacity: 1, duration: 0.02, stagger: { each: 0.002, from: "random" } }, 0.4);

  /* where the sheet sits and where the plane goes: fractions of whatever part of the scene is visible */
  const r = stage.getBoundingClientRect();
  const v = visibleBox(r.width, r.height || window.innerHeight);
  const narrow = r.width < 760;
  const X = (f: number) => (v.x0 + v.vw * f).toFixed(1);
  const Y = (f: number) => (v.y0 + v.vh * f).toFixed(1);
  const sx = narrow ? 0.5 : 0.64;
  const sy = narrow ? 0.66 : 0.5;
  const d = narrow
    ? `M${X(sx)},${Y(sy)} C${X(0.5)},${Y(0.4)} ${X(0.95)},${Y(0.36)} ${X(0.8)},${Y(0.56)} C${X(0.6)},${Y(0.78)} ${X(0.2)},${Y(0.62)} ${X(-0.1)},${Y(0.9)}`
    : `M${X(sx)},${Y(sy)} C${X(sx)},${Y(0.22)} ${X(0.96)},${Y(0.14)} ${X(0.86)},${Y(0.42)} C${X(0.74)},${Y(0.74)} ${X(0.34)},${Y(0.5)} ${X(-0.04)},${Y(0.86)}`;
  const path = q(".p3-trail")[0] as SVGPathElement;
  path.setAttribute("d", d);
  const plane = q(".p3-plane")[0] as SVGGElement;
  gsap.set(plane, { x: Number(X(sx)), y: Number(Y(sy)), rotation: 0, scale: narrow ? 0.8 : 1 });

  /* the note's words go as the first fold starts */
  /* the charge lands on the note's own line and goes into it as the fold starts; it comes back out where
     the plane leaves the screen */
  tl.fromTo(q(".p3-anchor"), { opacity: 1 }, { opacity: 0, duration: 0.02 }, 0.36);
  tl.to(q(".p3-anchor"), { opacity: 1, duration: 0.01 }, 0.97);
  tl.fromTo(q(".p3-words"), { opacity: 1 }, { opacity: 0, duration: 0.05 }, 0.37);
  /* fold, fold, fold: every facet walks its keyframes together */
  const folds = [0.39, 0.47, 0.55];
  folds.forEach((at, k) => {
    const o = { duration: 0.08, ease: "power2.inOut", immediateRender: k === 0 };
    tl.fromTo(q(".p3-body"), { attr: { points: BODY[k] } }, { attr: { points: BODY[k + 1] }, ...o }, at);
    tl.fromTo(q(".p3-flap-l"), { attr: { points: FLAP_L[k] } }, { attr: { points: FLAP_L[k + 1] }, ...o }, at);
    tl.fromTo(q(".p3-flap-r"), { attr: { points: FLAP_R[k] } }, { attr: { points: FLAP_R[k + 1] }, ...o }, at);
    tl.fromTo(q(".p3-crease"), { attr: { points: CREASE[k] } }, { attr: { points: CREASE[k + 1] }, ...o }, at);
  });
  tl.fromTo(q(".p3-flap-l, .p3-flap-r"), { fill: "#fdfcff" }, { fill: "#d9d0ee", duration: 0.08 }, 0.39);
  tl.fromTo(q(".p3-crease"), { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0.43);
  tl.to(plane, { scale: narrow ? 0.34 : 0.42, duration: 0.06, ease: "power2.in" }, 0.63);

  /* the flight: along the line of air, nose first, the trail drawing behind it */
  tl.to(
    plane,
    {
      motionPath: { path, align: path, alignOrigin: [0.5, 0.5], autoRotate: 90 },
      duration: 0.28,
      ease: "power1.inOut",
      immediateRender: false,
    },
    0.68,
  );
  tl.fromTo(path, { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: 0.28, ease: "power1.inOut" }, 0.68);
  tl.to(path, { drawSVG: "100% 100%", duration: 0.1 }, 0.88);
  tl.to(q(".p3-city"), { y: 300, duration: 0.1, ease: "power2.in" }, 0.9);
};

export function PlanePassage() {
  return (
    <Passage from={H.lilac} to={H.night} label="Saturday, 7:53 pm: the answer" className="hrs-p--plane" build={build}>
      <svg className="hrs-scene" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <Stars />
        <g className="p3-moon">
          <circle cx={1210} cy={150} r={34} fill="#f3eedd" />
          <circle cx={1226} cy={140} r={30} className="p3-moon-cut" />
        </g>
        <g className="p3-city">
          <Range />
          <g transform="translate(120 20)">
            <Towers />
          </g>
          <rect className="p3-ground" x={0} y={840} width={1440} height={60} />
        </g>
        <path className="p3-trail" d="M300,640 C520,560 700,420 930,330" pathLength={1} />
        <g className="p3-plane" transform="translate(930 330) rotate(62) scale(0.45)">
          <polygon className="p3-body" points={BODY[3]} />
          <polygon className="p3-flap-l" points={FLAP_L[3]} />
          <polygon className="p3-flap-r" points={FLAP_R[3]} />
          <polyline className="p3-crease" points={CREASE[3]} />
          <circle className="p3-anchor" cx={0} cy={-62} r={2} />
          <g className="p3-words">
            <text x={-78} y={-92} className="p3-w-k">
              SYLPH
            </text>
            <text x={-78} y={-58} className="p3-w-h">
              Sushi Kanda
            </text>
            <text x={78} y={-58} className="p3-w-h" textAnchor="end">
              $84.20
            </text>
            <rect x={-78} y={-42} width={74} height={18} rx={9} className="p3-w-chip" />
            <text x={-41} y={-29} className="p3-w-chip-t" textAnchor="middle">
              Needs a note
            </text>
            <text x={-78} y={0} className="p3-w-b">
              M-041, $9.20 over the
            </text>
            <text x={-78} y={18} className="p3-w-b">
              $75 dinner cap.
            </text>
            <text x={-78} y={52} className="p3-w-b">
              Reply with a note.
            </text>
            <rect x={-78} y={76} width={156} height={30} rx={15} className="p3-w-reply" />
          </g>
        </g>
      </svg>
      <TimeCard kicker="03  Priya's side" when="Sat, Sep 12" clock="7:53 pm">
        A minute later the answer is on her phone. It names the rule, the cap and the amount, and it asks her for
        one thing: a note.
      </TimeCard>
    </Passage>
  );
}
