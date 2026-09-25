"use client";

import { Passage, TimeCard, type Build } from "./passage";
import { Range, Stars, Towers } from "./scenery";
import { H } from "./palette";

/*
 * Passage 1, Saturday 7:52 pm in Denver. The light goes: the sky falls from the hero's white to dusk,
 * the Front Range and the street darken into silhouette, windows come on, and Sushi Kanda's lantern
 * lights. A thermal receipt feeds out of its printer line by line, a viewfinder closes on it, the
 * shutter flashes, and the receipt becomes the charge, which drops toward Priya's chapter.
 */

/* the street, left to right: [x, width, roof y, window rows] */
const STREET: [number, number, number, number][] = [
  [0, 184, 612, 3],
  [184, 146, 652, 2],
  [330, 262, 596, 3],
  [850, 162, 632, 2],
  [1012, 218, 604, 3],
  [1230, 210, 644, 2],
];

function Street() {
  return (
    <g className="p1-street">
      {STREET.map(([x, w, y], i) => (
        <rect key={x} className={i % 2 ? "p1-bld2" : "p1-bld"} x={x} y={y} width={w} height={900 - y} />
      ))}
      {/* rooftops: a water tank, a vent stack, a parapet step */}
      <path className="p1-bld" d="M72 612 V590 H96 V612 Z M66 590 H102 L84 576 Z" />
      <rect className="p1-bld2" x={1080} y={588} width={36} height={16} />
      <rect className="p1-bld2" x={1300} y={630} width={10} height={14} />
      <rect className="p1-bld" x={380} y={584} width={120} height={12} />
      {/* awnings over the neighbours' shopfronts */}
      <path className="p1-awn" d="M348 780 H572 L560 800 H360 Z" />
      <path className="p1-awn" d="M1030 790 H1210 L1198 808 H1042 Z" />
      {/* Sushi Kanda's building: two floors over the shop */}
      <rect className="p1-bld" x={592} y={560} width={258} height={340} />
      <rect className="p1-bld p1-cornice" x={584} y={552} width={274} height={12} />
      <g className="p1-win">
        {STREET.flatMap(([x, w, y, rows], b) =>
          Array.from({ length: rows }, (_, r) =>
            Array.from({ length: Math.floor((w - 24) / 38) }, (_, c) => (
              <rect key={`${b}-${r}-${c}`} className={`p1-w p1-w--${(b + r + c) % 4}`} x={x + 20 + c * 38} y={y + 26 + r * 58} width={20} height={30} />
            )),
          ),
        )}
        {[0, 1].flatMap((r) =>
          [0, 1, 2, 3, 4].map((c) => <rect key={`k${r}${c}`} className={`p1-w p1-w--${(r + c) % 4}`} x={614 + c * 46} y={588 + r * 64} width={24} height={36} />),
        )}
      </g>
      {/* the shop: sign, the warm room behind the noren, the curtain, a red lantern */}
      <rect className="p1-room" x={620} y={744} width={202} height={116} />
      <rect className="p1-sign" x={626} y={706} width={190} height={30} rx={2} />
      <text className="p1-sign-t" x={721} y={727} textAnchor="middle">
        SUSHI KANDA
      </text>
      <g className="p1-noren">
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={630 + i * 37} y={744} width={34} height={50} />
        ))}
        <circle className="p1-mon" cx={721} cy={766} r={9} />
      </g>
      <circle className="p1-lantern-glow" cx={846} cy={778} r={70} />
      <line className="p1-cord" x1={846} y1={744} x2={846} y2={758} />
      <ellipse className="p1-lantern" cx={846} cy={778} rx={13} ry={19} />
      {/* a street lamp on the corner */}
      <circle className="p1-lamp-glow" cx={540} cy={716} r={90} />
      <path className="p1-pole" d="M540 860 V720 Q540 706 554 706" />
      <rect className="p1-lamp" x={550} y={704} width={16} height={7} rx={2} />
      <rect className="p1-walk" x={0} y={860} width={1440} height={40} />
    </g>
  );
}

const build: Build = ({ tl, q, stage }) => {
  /* the light: white to dusk, through a low orange glow that stays as the last of the day */
  tl.fromTo(stage, { backgroundColor: H.white }, { backgroundColor: "#fbe6d2", duration: 0.16 }, 0)
    .to(stage, { backgroundColor: "#c9807a", duration: 0.16 }, 0.16)
    .to(stage, { backgroundColor: "#4a3f6b", duration: 0.12 }, 0.32)
    .to(stage, { backgroundColor: H.dusk, duration: 0.14 }, 0.44);
  tl.fromTo(q(".p1-sun"), { opacity: 0 }, { opacity: 1, duration: 0.25 }, 0.08).to(q(".p1-sun"), { opacity: 0.55, duration: 0.3 }, 0.4);
  tl.fromTo(q(".hrs-range-far"), { fill: "#e4e9ec" }, { fill: "#2e3a68", duration: 0.5 }, 0.05);
  tl.fromTo(q(".hrs-range-near"), { fill: "#d7dedb" }, { fill: "#222c52", duration: 0.5 }, 0.08);
  tl.fromTo(q(".p1-range"), { y: 60 }, { y: 0, duration: 0.6, ease: "power2.out" }, 0);
  tl.fromTo(q(".p1-street"), { y: 180 }, { y: 0, duration: 0.45, ease: "power2.out" }, 0.02);
  tl.fromTo(q(".p1-bld"), { fill: "#e8ece9" }, { fill: "#141b37", duration: 0.5 }, 0.1);
  tl.fromTo(q(".p1-bld2"), { fill: "#dde3df" }, { fill: "#1b2446", duration: 0.5 }, 0.1);
  tl.fromTo(q(".p1-awn"), { fill: "#cfd6d2" }, { fill: "#6b2a2a", duration: 0.5 }, 0.1);
  tl.fromTo(q(".p1-towers"), { y: 120, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }, 0.1);
  tl.fromTo(q(".p1-towers .hrs-tower"), { fill: "#d9dfe3" }, { fill: "#1f2851", duration: 0.45 }, 0.12);
  tl.fromTo(q(".p1-towers .hrs-tower-win rect"), { opacity: 0 }, { opacity: 0.9, duration: 0.02, stagger: { each: 0.002, from: "random" } }, 0.4);
  tl.fromTo(q(".p1-walk"), { fill: "#dfe4e1" }, { fill: "#0e1429", duration: 0.5 }, 0.1);
  tl.fromTo(q(".p1-pole, .p1-cord"), { stroke: "#c8cfcc" }, { stroke: "#0b1024", duration: 0.5 }, 0.1);
  tl.fromTo(q(".p1-sign"), { fill: "#d4dad7" }, { fill: "#2b2118", duration: 0.4 }, 0.2);
  tl.fromTo(q(".p1-noren rect"), { fill: "#cdd4d1" }, { fill: "#233262", duration: 0.4 }, 0.2);
  /* lights come on as it gets dark: windows at random, the shop, the lantern, the lamp */
  tl.fromTo(q(".p1-w"), { opacity: 0 }, { opacity: 1, duration: 0.02, stagger: { each: 0.004, from: "random" } }, 0.36);
  tl.fromTo(q(".p1-room"), { fill: "#d9dfdc" }, { fill: "#ffc978", duration: 0.12 }, 0.4);
  tl.fromTo(q(".p1-sign-t, .p1-mon"), { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0.42);
  tl.fromTo(q(".p1-lantern"), { fill: "#c9cfcc" }, { fill: "#e0513a", duration: 0.06 }, 0.44);
  tl.fromTo(q(".p1-lantern-glow, .p1-lamp-glow"), { opacity: 0, scale: 0.6, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.1 }, 0.44);
  tl.fromTo(q(".p1-lamp"), { fill: "#c9cfcc" }, { fill: "#ffe2a6", duration: 0.05 }, 0.4);
  tl.fromTo(q(".hrs-star"), { opacity: 0 }, { opacity: 1, duration: 0.2, stagger: { each: 0.01, from: "random" } }, 0.5);
  /* the card reads on both grounds */
  tl.fromTo(q(".hrs-card"), { color: H.ink }, { color: H.bone, duration: 0.2 }, 0.28);

  /* the clock runs to 7:52 */
  const clock = q(".hrs-clock")[0] as HTMLElement | undefined;
  const t = { m: 38 };
  tl.fromTo(
    t,
    { m: 38 },
    {
      m: 52,
      duration: 0.62,
      onUpdate: () => {
        if (clock) clock.textContent = `7:${String(Math.round(t.m)).padStart(2, "0")} pm`;
      },
    },
    0,
  );

  /* the receipt feeds out of its printer, then the lines print one by one */
  tl.fromTo(q(".p1-printer"), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.08, ease: "power2.out" }, 0.3);
  tl.fromTo(q(".p1-paper"), { yPercent: 101 }, { yPercent: 0, duration: 0.24, ease: "steps(16)" }, 0.36);
  tl.fromTo(q(".p1-line"), { opacity: 0 }, { opacity: 1, duration: 0.01, stagger: 0.02 }, 0.4);
  /* the viewfinder closes on it and the shutter fires */
  tl.fromTo(q(".p1-vf"), { scale: 1.45, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.08, ease: "power3.out" }, 0.64);
  tl.fromTo(q(".p1-flash"), { opacity: 0 }, { opacity: 0.9, duration: 0.012 }, 0.73).to(q(".p1-flash"), { opacity: 0, duration: 0.06 }, 0.742);
  tl.fromTo(q(".p1-shot"), { opacity: 0 }, { opacity: 1, duration: 0.03 }, 0.74);
  /* the photo becomes the charge */
  tl.to(q(".p1-print, .p1-vf"), { scale: 0.35, opacity: 0, duration: 0.08, ease: "power2.in" }, 0.8);
  tl.fromTo(q(".p1-charge"), { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.06, ease: "back.out(2)" }, 0.84);
  tl.fromTo(q(".p1-charge"), { y: 0 }, { y: 150, duration: 0.12, ease: "power2.in", immediateRender: false }, 0.9);
  tl.to(q(".p1-street, .p1-range, .p1-towers"), { y: 340, duration: 0.14, ease: "power2.in" }, 0.86);
  tl.to(q(".p1-sun"), { opacity: 0, duration: 0.1 }, 0.88);
};

export function DuskPassage() {
  return (
    <Passage n={0} from={H.white} to={H.dusk} label="Saturday, 7:52 pm in Denver" className="hrs-p--dusk" build={build}>
      <svg className="hrs-scene" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <defs>
          <radialGradient id="p1-sun-g" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ff9f5a" stopOpacity="0.85" />
            <stop offset="0.45" stopColor="#f07f6a" stopOpacity="0.35" />
            <stop offset="1" stopColor="#f07f6a" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="p1-glow-g">
            <stop offset="0" stopColor="#ffcf7d" stopOpacity="0.7" />
            <stop offset="1" stopColor="#ffcf7d" stopOpacity="0" />
          </radialGradient>
        </defs>
        <Stars count={60} />
        <ellipse className="p1-sun" cx={720} cy={600} rx={980} ry={260} fill="url(#p1-sun-g)" />
        <Range className="p1-range" />
        <g transform="translate(-400 -34)">
          <Towers className="p1-towers" />
        </g>
        <Street />
      </svg>

      <TimeCard kicker="01  Priya's side" when="Sat, Sep 12" clock="7:52 pm">
        The site visit ran long in Denver. One place on the street is still open, and its receipt is the last
        thing Priya wants to carry home.
      </TimeCard>

      <div className="p1-focal" aria-hidden="true">
        <div className="p1-print">
          <div className="p1-feed">
            <div className="p1-paper">
              <p className="p1-line p1-l-h">SUSHI KANDA</p>
              <p className="p1-line p1-l-s">Denver, CO</p>
              <p className="p1-line p1-l-s">Sat Sep 12 2026 19:51</p>
              <p className="p1-line p1-rule" />
              <p className="p1-line">
                <span>Omakase</span>
                <span>72.00</span>
              </p>
              <p className="p1-line">
                <span>Tea</span>
                <span>4.00</span>
              </p>
              <p className="p1-line">
                <span>Tax</span>
                <span>8.20</span>
              </p>
              <p className="p1-line p1-rule" />
              <p className="p1-line p1-l-t">
                <span>TOTAL</span>
                <span>$84.20</span>
              </p>
              <p className="p1-line p1-l-s">Card ****4417</p>
            </div>
          </div>
          <div className="p1-printer" />
        </div>
        <div className="p1-vf">
          <i />
          <i />
          <i />
          <i />
          <span className="p1-shot mono">Photo, 7:52 pm</span>
        </div>
        <span className="p1-charge v2s-token-pill">
          Sushi Kanda <span className="mono">$84.20</span>
        </span>
      </div>
      <div className="p1-flash" />
    </Passage>
  );
}
