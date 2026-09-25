/*
 * Hand-drawn scenery shared by the passages, all in one 1440 x 900 viewBox (drawn with xMidYMax slice,
 * so the bottom edge always sits on the stage floor and a phone sees the middle of it). Nothing here
 * moves by itself; each passage colours and moves these layers on its own timeline.
 */

/* the Front Range from Denver, far then near: jagged peaks behind, the foothills' long swells in front */
export const RANGE_FAR =
  "M0 612 L48 596 L96 604 L150 566 L196 584 L246 548 L292 578 L338 560 L396 590 L452 536 L500 570 L548 556 L604 588 L664 548 L716 574 L774 526 L826 562 L880 544 L936 580 L996 540 L1048 566 L1104 548 L1160 580 L1220 536 L1280 570 L1336 552 L1392 578 L1440 562 L1440 900 L0 900 Z";
export const RANGE_NEAR =
  "M0 676 C 110 646 204 672 300 656 C 404 638 508 676 628 660 C 748 644 850 680 968 664 C 1090 648 1206 684 1324 660 C 1380 650 1420 654 1440 656 L1440 900 L0 900 Z";

export function Range({ className = "" }: { className?: string }) {
  return (
    <g className={className}>
      <path className="hrs-range-far" d={RANGE_FAR} />
      <path className="hrs-range-near" d={RANGE_NEAR} />
    </g>
  );
}

/* Downtown Denver, simplified: flat tops, one arched crown, one spire. [x, width, height, crown] */
const TOWERS: [number, number, number, "flat" | "arch" | "spire" | "step"][] = [
  [548, 38, 132, "flat"],
  [590, 54, 214, "flat"],
  [648, 46, 184, "arch"],
  [698, 34, 250, "spire"],
  [736, 58, 164, "flat"],
  [798, 42, 204, "step"],
  [844, 32, 128, "flat"],
  [880, 50, 110, "flat"],
];
const BASE = 752;

function crown(x: number, w: number, top: number, kind: string) {
  if (kind === "arch") return `M${x} ${top + 18} Q${x + w / 2} ${top - 16} ${x + w} ${top + 18} Z`;
  if (kind === "spire") return `M${x + w / 2 - 3} ${top} L${x + w / 2} ${top - 34} L${x + w / 2 + 3} ${top} Z`;
  if (kind === "step") return `M${x + 8} ${top} L${x + 8} ${top - 14} L${x + w - 8} ${top - 14} L${x + w - 8} ${top} Z`;
  return "";
}

export function Towers({ className = "", lit = true }: { className?: string; lit?: boolean }) {
  return (
    <g className={className}>
      {TOWERS.map(([x, w, h, kind]) => {
        const top = BASE - h;
        return (
          <g key={x}>
            <rect className="hrs-tower" x={x} y={top} width={w} height={h + 160} />
            {kind !== "flat" && <path className="hrs-tower" d={crown(x, w, top, kind)} />}
          </g>
        );
      })}
      {lit && (
        <g className="hrs-tower-win">
          {TOWERS.flatMap(([x, w, h], t) => {
            const out: React.ReactElement[] = [];
            const top = BASE - h + 14;
            for (let r = 0; top + r * 13 < BASE - 8; r++)
              for (let c = 0; 6 + c * 9 < w - 6; c++) {
                /* a scatter of lit windows, the same every render */
                if ((t * 7 + r * 5 + c * 3) % 4 === 0) out.push(<rect key={`${t}-${r}-${c}`} x={x + 6 + c * 9} y={top + r * 13} width={4} height={6} />);
              }
            return out;
          })}
        </g>
      )}
    </g>
  );
}

/* a fixed starfield: a small hash, so server and client draw the same sky */
function rand(i: number) {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}
export const STARS = Array.from({ length: 110 }, (_, i) => ({
  x: rand(i) * 1440,
  y: rand(i + 500) * 520,
  r: 0.6 + rand(i + 900) * 1.5,
  tw: i % 5,
}));

export function Stars({ className = "", count = STARS.length }: { className?: string; count?: number }) {
  return (
    <g className={`hrs-stars ${className}`}>
      {STARS.slice(0, count).map((s, i) => (
        <circle key={i} cx={s.x.toFixed(1)} cy={s.y.toFixed(1)} r={s.r.toFixed(2)} className={`hrs-star hrs-star--${s.tw}`} />
      ))}
    </g>
  );
}

/* air: long drawn streamlines, the way Sylph carries things. Each is one open cubic run. */
export const WIND = [
  "M-40 300 C 220 250 380 350 620 300 S 1020 230 1480 290",
  "M-40 420 C 260 380 420 470 700 420 S 1100 360 1480 410",
  "M-40 520 C 180 500 400 560 660 520 S 1060 470 1480 520",
  "M-40 200 C 300 170 520 240 780 200 S 1180 150 1480 190",
];

export function Wind({ className = "", count = WIND.length }: { className?: string; count?: number }) {
  return (
    <g className={`hrs-wind ${className}`}>
      {WIND.slice(0, count).map((d, i) => (
        <path key={i} d={d} className={`hrs-wind-line hrs-wind-line--${i}`} pathLength={1} />
      ))}
    </g>
  );
}
