import { SYLPH_BIRD_PATH, SYLPH_BIRD_VIEWBOX } from "@/components/custom/sylph-identity/sylph-bird-path";
import { WIND } from "./scenery";

/*
 * The close, on open air: the Sylph bird rides a line of wind across the section above the last call to
 * action, and the streamlines drift under it. CSS only (offset-path in the SVG's own units, and dash
 * offsets), off under reduced motion, where the bird rests on its line.
 */
const GLIDE = "M-80 150 C 200 40 420 190 700 90 S 1180 20 1540 80";

export function AirClose({ children }: { children: React.ReactNode }) {
  return (
    <div className="hrs-air">
      <svg className="hrs-air-sky" viewBox="0 0 1440 520" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        {WIND.map((d, i) => (
          <path key={i} d={d} className={`hrs-air-line hrs-air-line--${i}`} pathLength={1} />
        ))}
        <path d={GLIDE} className="hrs-air-line hrs-air-glide" pathLength={1} />
        <g className="hrs-air-bird" style={{ offsetPath: `path("${GLIDE}")` } as React.CSSProperties}>
          <svg x={-42} y={-40} width={84} height={80} viewBox={SYLPH_BIRD_VIEWBOX}>
            <path d={SYLPH_BIRD_PATH} fill="#fff" />
          </svg>
        </g>
      </svg>
      <p className="hrs-air-slogan" aria-hidden="true">
        Expenses run on air.
      </p>
      {children}
    </div>
  );
}
