/* The handoffs that replace the live page's 360px seams. Each is a short band where one chapter's ground
   gives way to the next: the colour of the side the charge is going to sweeps in from that person's edge
   of the page (Priya's is the left, Dana's the right; into month end both rise to meet in the middle).
   The line where the grounds meet is the line that divided the two sides on the live page. The step's pill
   sits on it, a caption on each ground says what just happened and what is waiting, and the courier
   (courier.tsx) flies the charge across the band through the pill ([data-handoff] .mb-ho-pill).
   Pure markup: under reduced motion or without script the band is the same, minus the flight. */

type To = "priya" | "dana" | "both";
/* "half": into the close, Priya's blue takes only the left half back, Dana's lilac keeps the right */
type Shape = To | "half";

/* the arriving ground's shape and the meeting line, in a 100x100 box stretched to the band */
const SHAPE: Record<Shape, { fill: string; line: string }> = {
  dana: { fill: "M100 0 C56 0 44 100 0 100 L100 100 Z", line: "M100 0 C56 0 44 100 0 100" },
  priya: { fill: "M0 0 C44 0 56 100 100 100 L0 100 Z", line: "M0 0 C44 0 56 100 100 100" },
  both: { fill: "M0 100 C22 100 30 0 50 0 C70 0 78 100 100 100 Z", line: "M0 100 C22 100 30 0 50 0 C70 0 78 100 100 100" },
  half: { fill: "M0 0 C34 0 50 42 50 100 L0 100 Z", line: "M0 0 C34 0 50 42 50 100" },
};

export function Handoff({
  leg,
  to,
  top,
  bottom,
  split,
  title,
  out,
  into,
  darkTop = false,
  darkBottom = false,
}: {
  leg: number;
  to: To;
  /** the leaving chapter's ground */
  top: string;
  /** the arriving chapter's ground */
  bottom: string;
  /** the hero hands off from two grounds: Dana's lilac holds the top right until Priya's blue takes the band */
  split?: string;
  title: string;
  out: string;
  into: string;
  darkTop?: boolean;
  darkBottom?: boolean;
}) {
  const s = SHAPE[to];
  return (
    <div
      className={`mb-ho mb-ho--${to}`}
      data-handoff={leg}
      data-ground-top={top}
      data-ground-bottom={bottom}
      data-dark-top={darkTop ? "" : undefined}
      data-dark-bottom={darkBottom ? "" : undefined}
      aria-hidden="true"
    >
      <svg className="mb-ho-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        <rect width="100" height="100" fill={top} />
        <path d={s.fill} fill={bottom} />
        {split && <path d="M50 0 C50 58 72 100 100 100 L100 0 Z" fill={split} />}
        <path d={split ? "M50 0 C50 58 72 100 100 100" : s.line} className="mb-ho-line" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="v2s-wrap mb-ho-in">
        <span className={`mb-ho-cap mb-ho-cap--out${darkTop ? " is-dark" : ""}`}>{out}</span>
        <span className="mb-ho-pill">
          <b className="mono">0{leg + 1}</b>
          <span>{title}</span>
        </span>
        <span className={`mb-ho-cap mb-ho-cap--in${darkBottom ? " is-dark" : ""}`}>{into}</span>
      </div>
    </div>
  );
}

/** A plain edge for the tail: the next ground rises from the given side, no pill, no captions. */
export function Edge({ to, top, bottom }: { to: Shape; top: string; bottom: string }) {
  const s = SHAPE[to];
  return (
    <div className="mb-edge" data-ground-top={top} data-ground-bottom={bottom} aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <rect width="100" height="100" fill={top} />
        <path d={s.fill} fill={bottom} />
        {to === "half" && <path d={s.line} className="mb-ho-line" vectorEffect="non-scaling-stroke" />}
      </svg>
    </div>
  );
}
