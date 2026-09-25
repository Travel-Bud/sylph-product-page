"use client";

import { Passage, TimeCard, type Build } from "./passage";
import { Wind } from "./scenery";
import { H } from "./palette";

/*
 * Passage 5, the rest of September. A tear-off calendar on Dana's wall sheds its days, Monday the 14th to
 * Tuesday the 29th, each page caught by a draught and carried off, faster and faster, the way a quiet
 * month goes when nobody is chasing receipts. The 30th stays, and green floods out from it: month end.
 */

const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
/* Sep 1 2026 is a Tuesday */
const weekday = (d: number) => WD[(d + 1) % 7];
const DAYS = Array.from({ length: 17 }, (_, i) => 14 + i); // 14 .. 30
/* a few days carry what happened on them, all sample */
const NOTE: Record<number, string> = {
  14: "Dana approves one note",
  18: "12 charges filed themselves",
  23: "Priya flies home",
  25: "9 charges filed themselves",
};

const build: Build = ({ tl, q, stage }) => {
  tl.fromTo(stage, { backgroundColor: H.morning }, { backgroundColor: H.morning, duration: 0.01 }, 0);
  tl.fromTo(q(".p5-cal"), { y: 80, opacity: 0, rotate: -3 }, { y: 0, opacity: 1, rotate: 0, duration: 0.1, ease: "power2.out" }, 0);
  tl.fromTo(q(".hrs-wind-line"), { drawSVG: "0% 0%" }, { drawSVG: "100% 100%", duration: 0.34, stagger: 0.07, ease: "power1.inOut" }, 0.1);
  /* the pages go, the gaps between them closing: an accelerating schedule */
  const pages = q(".p5-page:not(.p5-page--last)").reverse(); // the 14th is on top
  const n = pages.length;
  pages.forEach((p, i) => {
    const at = 0.1 + 0.56 * (1 - Math.pow(1 - i / n, 1.7));
    const k = (i * 37) % 11;
    tl.fromTo(
      p,
      { x: 0, y: 0, rotate: 0, opacity: 1 },
      {
        keyframes: {
          x: [0, 40, 260 + k * 30, 620 + k * 40],
          y: [0, -30, -180 - k * 12, -520 - k * 20],
          rotate: [0, 8, 24 + k * 4, 70 + k * 6],
          opacity: [1, 1, 1, 0],
        },
        duration: 0.14,
        ease: "power1.in",
      },
      at,
    );
  });
  /* the 30th stays; green floods out from it, and the card turns to read on green */
  const flood = q(".p5-flood")[0] as HTMLElement;
  const cs = getComputedStyle(flood);
  const at = `${cs.getPropertyValue("--fx").trim() || "50%"} ${cs.getPropertyValue("--fy").trim() || "50%"}`;
  tl.fromTo(flood, { clipPath: `circle(0% at ${at})` }, { clipPath: `circle(150% at ${at})`, duration: 0.2, ease: "power2.in" }, 0.74);
  tl.fromTo(q(".hrs-card"), { color: H.ink }, { color: H.bone, duration: 0.06 }, 0.8);
  tl.fromTo(q(".p5-ring"), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.06, ease: "back.out(2)" }, 0.7);
  tl.set(stage, { backgroundColor: H.green }, 0.95);
};

export function MonthPassage() {
  return (
    <Passage n={4} from={H.morning} to={H.green} label="September, to month end" className="hrs-p--month" build={build}>
      <div className="p5-flood" />
      <svg className="hrs-scene" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <Wind className="p5-wind" />
      </svg>
      <TimeCard kicker="05  Both sides" when="Wed, Sep 30">
        Two weeks go by. Every charge that fits the policy files itself on the day it happens, and nobody opens a
        spreadsheet. Then it is month end, and the report is already there.
      </TimeCard>
      <div className="p5-cal" aria-hidden="true">
        <div className="p5-rings">
          <i />
          <i />
          <i />
        </div>
        <div className="p5-head mono">September 2026</div>
        <div className="p5-stack">
          {DAYS.slice()
            .reverse()
            .map((d) => (
              <div key={d} className={`p5-page${d === 30 ? " p5-page--last" : ""}`}>
                <span className="p5-wd">{weekday(d)}</span>
                <span className="p5-d">
                  {d}
                  {d === 30 && <i className="p5-ring" />}
                </span>
                <span className="p5-note mono">{d === 30 ? "Month end" : (NOTE[d] ?? "")}</span>
              </div>
            ))}
        </div>
      </div>
    </Passage>
  );
}
