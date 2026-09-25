"use client";

import { Passage, TimeCard, type Build } from "./passage";
import { Stars } from "./scenery";
import { H } from "./palette";

/*
 * Passage 2, the rule. The charge waits in Priya's night; a sheet of Dana's lilac paper rises over it
 * like a page turning. On it the policy lies open: three leaves riffle over to section 4, each
 * sentence gets the rule code it compiled to in the margin, the dinner cap is marked, and the charge
 * settles on the line that will judge it. Dana wrote it once, weeks before this dinner.
 */

const LINES = [
  { n: "4.1", t: "Flights under six hours are booked in economy.", code: "T-004" },
  { n: "4.2", t: "Lunch on the road is covered up to $25.", code: "M-012" },
  { n: "4.3", t: null, code: "M-041" },
  { n: "4.4", t: "Alcohol is not reimbursed.", code: "M-022" },
  { n: "4.5", t: "A hotel is covered up to $350 a night.", code: "L-007" },
];

function Bars({ n = 7, seed = 0 }: { n?: number; seed?: number }) {
  return (
    <span className="p2-bars">
      {Array.from({ length: n }, (_, i) => (
        <i key={i} style={{ width: `${62 + (((i + seed) * 37) % 36)}%` }} />
      ))}
    </span>
  );
}

const LEAVES: { front: React.ReactNode; back: React.ReactNode }[] = [
  {
    front: (
      <>
        <b className="p2-title">Travel and expense policy</b>
        <span className="p2-sub mono">Revised August 2026</span>
        <Bars n={3} />
        <span className="p2-sub mono p2-foot">Approved by Dana, Aug 28</span>
      </>
    ),
    back: (
      <>
        <b>1 Who this covers</b>
        <Bars seed={2} />
      </>
    ),
  },
  {
    front: (
      <>
        <b>2 Booking travel</b>
        <Bars seed={4} />
      </>
    ),
    back: (
      <>
        <b>3 Receipts</b>
        <Bars seed={1} />
      </>
    ),
  },
  {
    front: (
      <>
        <b>3.4 Lost receipts</b>
        <Bars seed={3} n={6} />
      </>
    ),
    back: (
      <>
        <b className="p2-title">4 Meals, lodging and travel</b>
        <span className="p2-intro">
          What the company covers on the road, per person. Anything over a cap is not refused: it needs a note, and
          a person reads it.
        </span>
        <Bars seed={5} n={4} />
      </>
    ),
  },
];

const build: Build = ({ tl, q, stage }) => {
  tl.fromTo(q(".p2-sheet"), { yPercent: 104, rotate: 5 }, { yPercent: 0, rotate: 0, duration: 0.3, ease: "power2.out" }, 0.04);
  tl.fromTo(q(".hrs-star"), { opacity: 1 }, { opacity: 0, duration: 0.2 }, 0.1);
  /* the charge waits in the night, then rides to its line */
  const pill = q(".p2-charge")[0] as HTMLElement;
  const slot = q(".p2-slot")[0] as HTMLElement;
  /* the rising sheet lifts the charge clear of the book; later it settles on its line. The flight is
     measured with the sheet, the lift and the pill all at rest, whatever frame the scrub is on. */
  const sheet = q(".p2-sheet")[0] as HTMLElement;
  const lift = q(".p2-lift")[0] as HTMLElement;
  /* on a phone the book sits low under the card, so the lift is short */
  const L = () => Math.round(stage.clientHeight * (stage.clientWidth < 760 ? 0.12 : 0.36));
  tl.fromTo(lift, { y: 0 }, { y: () => -L(), duration: 0.28, ease: "power2.out" }, 0.06);
  const delta = () => {
    const els = [sheet, lift, pill];
    const prev = els.map((e) => e.style.transform);
    els.forEach((e) => (e.style.transform = "none"));
    const a = pill.getBoundingClientRect();
    const b = slot.getBoundingClientRect();
    els.forEach((e, i) => (e.style.transform = prev[i]));
    return { x: b.left - a.left, y: b.top + b.height / 2 - (a.top + a.height / 2) + L() };
  };
  tl.fromTo(
    pill,
    { x: 0, y: 0 },
    { x: () => delta().x, y: () => delta().y, duration: 0.14, ease: "power2.inOut", immediateRender: false },
    0.8,
  );
  /* the book: three leaves turn over to section 4 */
  q(".p2-leaf").forEach((leaf, i) => {
    const at = 0.3 + i * 0.09;
    tl.fromTo(leaf, { rotateY: 0 }, { rotateY: -180, duration: 0.12, ease: "power1.inOut" }, at);
    /* past the spine it lies on the left pile, over the leaves turned before it */
    tl.fromTo(leaf, { zIndex: 10 - i }, { zIndex: 20 + i, duration: 0.001 }, at + 0.06);
  });
  /* compile: each sentence gets its code in the margin, then the cap is marked */
  tl.fromTo(q(".p2-code"), { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.03, stagger: 0.025 }, 0.62);
  tl.fromTo(q(".p2-mark"), { scaleX: 0 }, { scaleX: 1, duration: 0.05, stagger: 0.03 }, 0.74);
  tl.fromTo(q(".p2-card-in"), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.1 }, 0.22);
};

export function PagePassage() {
  return (
    <Passage from={H.dusk} to={H.lilac} label="The rule, written once" className="hrs-p--page" build={build}>
      <svg className="hrs-scene" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <Stars count={70} />
      </svg>
      <div className="p2-sheet">
        <div className="p2-card-in">
          <TimeCard kicker="02  Dana's side, Aug 28" when="Written once.">
            Dana handed Sylph the policy he already had. Each sentence became a rule that quotes it, and he approved
            the set weeks before this dinner. Nothing checks a charge until he has.
          </TimeCard>
        </div>
        <div className="p2-book" aria-hidden="true">
          <div className="p2-page p2-page--l">
            <b>Contents</b>
            <Bars n={5} seed={6} />
          </div>
          <div className="p2-page p2-page--r">
            {LINES.map((l) => (
              <p key={l.n} className={`p2-line${l.t ? "" : " p2-line--hit"}`}>
                <span className="p2-n mono">{l.n}</span>
                <span className="p2-t">
                  {l.t ?? (
                    <>
                      A solo dinner is covered up to <span className="p2-hl"><i className="p2-mark" />$75</span>. Over the
                      cap it <span className="p2-hl"><i className="p2-mark" />needs a note</span>.
                    </>
                  )}
                </span>
                <span className="p2-code mono">{l.code}</span>
                {!l.t && (
                  <span className="p2-slot">
                    <span className="p2-slot-pill v2s-token-pill">
                      Sushi Kanda <span className="mono">$84.20</span>
                    </span>
                  </span>
                )}
              </p>
            ))}
          </div>
          {LEAVES.map((lf, i) => (
            <div key={i} className="p2-leaf" style={{ zIndex: 20 + i }}>
              <div className="p2-face p2-face--front">{lf.front}</div>
              <div className="p2-face p2-face--back">{lf.back}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="p2-lift" aria-hidden="true">
        <span className="p2-charge v2s-token-pill">
          Sushi Kanda <span className="mono">$84.20</span>
        </span>
      </div>
    </Passage>
  );
}
