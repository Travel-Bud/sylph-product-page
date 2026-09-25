"use client";

import { gsap } from "@/components/custom/site/motion";
import { Passage, visibleBox, type Build } from "./passage";
import { Range, Stars, Towers, Wind } from "./scenery";
import { FlapBoard, flapCells } from "./flap";
import { H } from "./palette";

/*
 * Passage 4, the weekend. A time-lapse over Denver driven by one clock: a split-flap board runs from
 * Saturday 8:05 pm, when Priya sends her note, to Monday 9:12 am, when Dana opens his queue. The sky,
 * the sun and moon on their arcs, the stars, the range and the city's windows are all computed from the
 * hour on the board, so Sunday flashes past as a whole day. Her reply crosses the screen on the wind.
 */

const START = 20 * 60 + 5; // Sat 8:05 pm, minutes after Saturday midnight
const END = 48 * 60 + 9 * 60 + 12; // Mon 9:12 am
const DAYS = ["SAT", "SUN", "MON"];

function label(t: number) {
  const m = Math.round(t);
  const day = DAYS[Math.min(2, Math.floor(m / 1440))];
  const h24 = Math.floor((m % 1440) / 60);
  const min = m % 60;
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${day} ${String(h).padStart(2, " ")}:${String(min).padStart(2, "0")} ${h24 < 12 ? "AM" : "PM"}`;
}

/* the sky through a day, by hour */
const SKY: [number, string][] = [
  [0, H.night],
  [4.9, H.night],
  [5.7, "#2b2f6b"],
  [6.3, "#b9667a"],
  [6.9, "#f1ab86"],
  [7.7, "#fbe3c6"],
  [9, H.morning],
  [12.5, "#dfeaf3"],
  [16.5, "#e8edf0"],
  [18.2, "#f1ab86"],
  [18.9, "#b9667a"],
  [19.6, "#4a3f6b"],
  [20.4, H.dusk],
  [21.6, H.night],
  [24, H.night],
];
function sky(hour: number) {
  for (let i = 1; i < SKY.length; i++) {
    const [h1, c1] = SKY[i];
    const [h0, c0] = SKY[i - 1];
    if (hour <= h1) return gsap.utils.interpolate(c0, c1, (hour - h0) / (h1 - h0)) as string;
  }
  return H.night;
}
/* daylight, 0 to 1: up with the sunrise, down with the sunset (Denver in September: 6:35 am, 7:10 pm) */
function light(hour: number) {
  const up = gsap.utils.clamp(0, 1, (hour - 5.6) / 1.6);
  const down = gsap.utils.clamp(0, 1, (19.6 - hour) / 1.4);
  return Math.min(up, down);
}

const build: Build = ({ tl, q, stage }) => {
  const board = new FlapBoard(q(".p4-board")[0] as HTMLElement);
  const sun = q(".p4-sun")[0] as SVGGElement;
  const moon = q(".p4-moon")[0] as SVGGElement;
  const stars = q(".hrs-stars")[0] as SVGGElement;
  const wins = q(".p4-city .hrs-tower-win")[0] as SVGGElement;
  const far = q(".p4-city .hrs-range-far")[0] as SVGPathElement;
  const near = q(".p4-city .hrs-range-near")[0] as SVGPathElement;
  const towers = q(".p4-city .hrs-tower");
  const card = q(".p4-card")[0] as HTMLElement;

  const r = stage.getBoundingClientRect();
  const v = visibleBox(r.width, r.height || window.innerHeight);
  const horizon = 600;
  /* a body on its arc across the visible sky: 0 at one horizon, 1 at the other */
  const arc = (f: number) => ({
    x: v.x0 + v.vw * (0.08 + 0.84 * f),
    y: horizon + 60 - Math.sin(Math.PI * f) * Math.min(460, horizon - v.y0 - 40),
  });

  const clock = { t: START };
  const paint = () => {
    const t = clock.t;
    const hour = (t / 60) % 24;
    const L = light(hour);
    stage.style.backgroundColor = sky(hour);
    board.set(label(t));
    /* the sun from 6:35 am to 7:10 pm, the moon through the night */
    const fs = (hour - 6.3) / (19.4 - 6.3);
    const s = arc(gsap.utils.clamp(-0.05, 1.05, fs));
    sun.setAttribute("transform", `translate(${s.x.toFixed(1)} ${s.y.toFixed(1)})`);
    sun.style.opacity = fs > -0.05 && fs < 1.05 ? "1" : "0";
    const hn = hour < 12 ? hour + 24 : hour;
    const fm = (hn - 19.8) / (29.8 - 19.8);
    const m = arc(gsap.utils.clamp(-0.05, 1.05, fm));
    moon.setAttribute("transform", `translate(${m.x.toFixed(1)} ${m.y.toFixed(1)})`);
    moon.style.opacity = String(fm > 0 && fm < 1 ? 1 - L : 0);
    stars.style.opacity = String(Math.pow(1 - L, 2));
    wins.style.opacity = String(gsap.utils.clamp(0, 1, 1.4 - L * 1.6));
    far.style.fill = gsap.utils.interpolate("#19224a", "#b9b6cf", L) as string;
    near.style.fill = gsap.utils.interpolate("#121a3a", "#a9b39a", L) as string;
    const tw = gsap.utils.interpolate("#0a1022", "#8a93a8", L) as string;
    towers.forEach((el) => ((el as SVGElement).style.fill = tw));
    card.style.color = gsap.utils.interpolate(H.bone, H.ink, gsap.utils.clamp(0, 1, (L - 0.35) * 3)) as string;
  };
  paint();
  tl.to(clock, { t: END, duration: 0.86, ease: "power2.inOut", onUpdate: paint }, 0.06);

  /* her note, sent, carried across on the wind to Dana's side */
  tl.fromTo(q(".p4-bubble"), { opacity: 0, y: 18, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.05, ease: "back.out(2)" }, 0.02);
  tl.fromTo(q(".p4-fly"), { xPercent: 0 }, { xPercent: 100, duration: 0.5, ease: "power1.in" }, 0.36);
  tl.fromTo(q(".p4-bob"), { y: 0, rotate: 0 }, { keyframes: { y: [0, -26, 10, -18, 0], rotate: [0, -3, 2, -2, 0] }, duration: 0.5 }, 0.36);
  tl.fromTo(q(".hrs-wind-line"), { drawSVG: "0% 0%" }, { drawSVG: "100% 100%", duration: 0.3, stagger: 0.07, ease: "power1.inOut" }, 0.34);
  tl.fromTo(q(".p4-sent"), { opacity: 0 }, { opacity: 1, duration: 0.02 }, 0.07);
  tl.fromTo(q(".p4-city"), { y: 70 }, { y: 400, duration: 0.1, ease: "power2.in" }, 0.9);
};

export function DawnPassage() {
  const cells = flapCells(label(END));
  return (
    <Passage from={H.night} to={H.morning} label="The weekend, to Monday 9:12 am" className="hrs-p--dawn" build={build}>
      <svg className="hrs-scene" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <defs>
          <radialGradient id="p4-sun-g">
            <stop offset="0" stopColor="#ffd08a" stopOpacity="0.9" />
            <stop offset="0.35" stopColor="#ffb86b" stopOpacity="0.35" />
            <stop offset="1" stopColor="#ffb86b" stopOpacity="0" />
          </radialGradient>
        </defs>
        <Stars />
        <g className="p4-sun" transform="translate(380 370)">
          <circle r={140} fill="url(#p4-sun-g)" />
          <circle r={36} fill="#ffcf73" />
        </g>
        <g className="p4-moon" transform="translate(300 200)" style={{ opacity: 0 }}>
          <circle r={26} fill="#f3eedd" />
        </g>
        <g className="p4-city" transform="translate(0 70)">
          <Range />
          <g transform="translate(360 20)">
            <Towers />
          </g>
        </g>
        <Wind className="p4-wind" />
      </svg>

      <div className="hrs-card p4-card">
        <p className="hrs-kicker mono">04  Dana&rsquo;s side</p>
        <p className="p4-board mono" aria-label="Monday 9:12 am">
          {cells.map((ch, i) => (
            <span key={i} className={`fl${ch === " " ? " fl--gap" : ""}`} data-ch={ch} aria-hidden="true">
              <span className="fl-t">{ch}</span>
              <span className="fl-b">{ch}</span>
              <span className="fl-ft">{ch}</span>
              <span className="fl-fb">{ch}</span>
            </span>
          ))}
        </p>
        <p className="hrs-cap">
          Sunday goes by. Nobody chases anybody. At 9:12 on Monday her note is already in Dana&rsquo;s queue, beside the
          rule it answers.
        </p>
      </div>

      <div className="p4-fly" aria-hidden="true">
        <div className="p4-bob">
          <div className="p4-bubble">
            <span className="p4-from mono">Priya, 8:05 pm</span>
            <span className="p4-msg">Late finish at the site visit, only place still open.</span>
            <span className="p4-sent mono">Sent to Dana with your note</span>
            <span className="p4-anchor" />
          </div>
        </div>
      </div>
    </Passage>
  );
}
