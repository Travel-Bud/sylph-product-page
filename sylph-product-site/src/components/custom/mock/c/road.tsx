"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, MM_MOTION } from "@/components/custom/site/motion";
import { FlapRow } from "./flap";
import { Flaps, ViaIcon, VIA_LABEL, Sample } from "./parts";
import { byId, VERDICT, type TripCharge } from "./data";

/*
 * 4. On the road, on the night apron. A route map drawn by hand in an equirectangular projection of the
 * western US (x = (lon + 125) * 22.06, y = (46 - lat) * 28). The stage holds for 140svh of scroll: the
 * flight traces SFO to DEN, the map closes in on Denver (the viewBox itself moves, strokes stay hairline),
 * the Lyft ride draws in from the airport, and a luggage tag swings down for each charge as it lands, tied
 * by a string to its pin. Scroll back and it all runs backwards. The markup is the settled map (route
 * flown, every tag hung, strings to Denver), which is what reduced motion and no script show.
 */

const FULL = [0, 0, 552, 420];
const ZOOM = [372, 121, 138, 105];
const SFO = [57.8, 234.6];
const DEN = [448.6, 171.9];
const ROUTE = `M${SFO[0]} ${SFO[1]} Q250 110 ${DEN[0]} ${DEN[1]}`;
const RIDE = "M448.6 171.9 C447.8 176.4 443.4 174.6 441.6 176.6 S439.6 177.9 439 178.2";
const LAND =
  "M23.2 0 L21 39.2 L19.9 72.8 L9.9 89.6 L17.7 112 L17.7 140 L13.2 156.8 L26.5 179.2 L28.7 198.8 L44.1 224 L55.2 229.6 L55.2 246.4 L68.4 263.2 L68.4 271.6 L81.6 291.2 L97.1 310.8 L99.3 322 L119.1 324.8 L143.4 336 L150 344.4 L169.9 364 L174.3 378 L227.3 372.4 L306.7 410.8 L370.7 410.8 L370.7 398.2 L408.2 398.2 L434.7 420 L552 420 L552 0Z";
const BORDERS =
  "M17.7 112 L307.8 112 M110.3 112 L110.3 196 L228.8 308 M228.8 308 L233.9 327.6 L227.3 352.8 L226.8 371.8 M241.6 112 L241.6 274.4 L228.8 308 M241.6 252 L506.4 252 M351.9 140 L506.4 140 L506.4 252 M351.9 410.8 L351.9 140 M307.8 140 L307.8 28 L462.2 28 L462.2 140 M307.8 140 L351.9 140 M307.8 112 L307.8 140 M485.4 252 L485.4 392 L406 392 M506.4 168 L552 168 M462.2 84 L552 84 M485.4 266 L552 266 M175.9 0 L178.7 11.2 L172.1 47.6 L175.9 112 M462.2 28 L552 28";
const CITIES = [
  { k: "LAX", x: 145.4, y: 337.7 },
  { k: "LAS", x: 217.3, y: 277.8 },
  { k: "PHX", x: 286.6, y: 352 },
  { k: "SLC", x: 287.3, y: 145.9 },
];
/* the Rockies as a draughtsman marks them: chevrons along the ranges */
const PEAKS = [
  [300, 175], [318, 160], [336, 150], [352, 164], [370, 150], [388, 160], [404, 150], [420, 164], [410, 178], [424, 186], [428, 172],
  [396, 186], [380, 200], [398, 206], [414, 198], [366, 214], [384, 224], [402, 220], [350, 196], [334, 186], [316, 200], [300, 214],
  [340, 70], [360, 90], [380, 64], [396, 96], [362, 118], [330, 104], [270, 60], [250, 90], [220, 40], [200, 70], [415, 120],
  [431.2, 160.5], [433.5, 168.5], [430.6, 176.2], [433.2, 183.8], [429.8, 190.5], [427.2, 170.2], [426.6, 182.3], [428.9, 163.3],
] as const;
const GRID = [
  ...[430.4, 432.4, 434.4, 436.4, 438.4, 440.4, 442.4].map((x) => `M${x} 173.4 L${x} 187.2`),
  ...[174, 176, 178, 180, 182, 184, 186].map((y) => `M429.6 ${y} L443.2 ${y}`),
].join(" ");
const RUNWAYS = "M446.6 170.2 L446.6 173.6 M450.6 170.2 L450.6 173.6 M447.4 168.9 L450.2 168.9 M447.4 174.9 L450.2 174.9 M452 171.2 L452 174";
const HIGHWAYS = "M372 172.6 C400 171.8 420 173.8 441.5 175.3 S480 172 512 171 M437.6 121 C439 140 440.8 160 441.5 175.3 S440.6 205 439.8 226";

/* The four charges the map follows, where each sits, and where its tag hangs (percent of the map box). */
type Stop = { id: string; x: number; y: number; at: number; slot: { left: number; top: number }; flip?: boolean };
const STOPS: Stop[] = [
  { id: "united", x: DEN[0], y: DEN[1], at: 0.44, slot: { left: 64, top: 5 } },
  { id: "lyft", x: 444.2, y: 175.3, at: 0.69, slot: { left: 64, top: 67 } },
  { id: "hyatt", x: 439, y: 178.2, at: 0.78, slot: { left: 3, top: 67 }, flip: true },
  { id: "sushi", x: 433.4, y: 183.2, at: 0.87, slot: { left: 3, top: 5 }, flip: true },
];

const pct = (vb: number[], x: number, y: number) => [((x - vb[0]) / vb[2]) * 100, ((y - vb[1]) / vb[3]) * 100];
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};

/* where a tag's string ties on: the eyelet end of the tag */
const tie = (s: Stop) => [s.flip ? s.slot.left + 33 : s.slot.left, s.slot.top + 7.5];

function Tag({ c, n, flip }: { c: TripCharge; n: number; flip?: boolean }) {
  return (
    <div className={`tag${flip ? " is-flip" : ""}`} data-v={c.v}>
      <span className="tag-eye" aria-hidden="true" />
      <span className="tag-code" aria-hidden="true">
        DEN
      </span>
      <span className="tag-n" aria-hidden="true">
        {n}
      </span>
      <span className="tag-m">{c.merchant}</span>
      <span className="tag-a mono">${c.amount}</span>
      <span className="tag-r">
        <i className="lamp" aria-hidden="true" />
        <span className="mono">{c.rule}</span> {VERDICT[c.v]}
      </span>
      <span className="tag-via">
        <ViaIcon via={c.via} />
        {VIA_LABEL[c.via]}
      </span>
    </div>
  );
}

export function DepRoad() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const mm = gsap.matchMedia();
      mm.add(MM_MOTION, () => {
        const svg = el.querySelector<SVGSVGElement>(".map-svg")!;
        const route = el.querySelector<SVGPathElement>(".map-flown")!;
        const plane = el.querySelector<SVGGElement>(".map-plane")!;
        const ride = el.querySelector<SVGPathElement>(".map-ride")!;
        const far = el.querySelector<SVGGElement>(".map-far")!;
        const near = el.querySelector<SVGGElement>(".map-near")!;
        const tags = Array.from(el.querySelectorAll<HTMLElement>(".road-tags > li"));
        const pins = Array.from(el.querySelectorAll<HTMLElement>(".road-pin"));
        const strings = Array.from(el.querySelectorAll<SVGLineElement>(".road-strings line"));
        const status = new FlapRow(el.querySelector(".road-status")!, 30);
        const len = route.getTotalLength();
        const rideLen = ride.getTotalLength();
        route.style.strokeDasharray = `${len}`;
        ride.style.strokeDasharray = `${rideLen}`;
        let said = "";

        el.dataset.live = "";
        const render = (p: number) => {
          const t = smooth((p - 0.04) / 0.4);
          const pt = route.getPointAtLength(t * len);
          const ahead = route.getPointAtLength(Math.min(len, t * len + 1));
          const back = route.getPointAtLength(Math.max(0, t * len - 1));
          const ang = (Math.atan2(ahead.y - back.y, ahead.x - back.x) * 180) / Math.PI;
          plane.setAttribute("transform", `translate(${pt.x} ${pt.y}) rotate(${ang})`);
          plane.style.opacity = String(1 - clamp01((p - 0.47) / 0.05));
          route.style.strokeDashoffset = String(len * (1 - t));

          const z = smooth((p - 0.47) / 0.15);
          route.style.opacity = String(1 - 0.8 * z);
          const vb = FULL.map((v, i) => v + (ZOOM[i] - v) * z);
          svg.setAttribute("viewBox", vb.join(" "));
          far.style.opacity = String(1 - z);
          near.style.opacity = String(z);
          ride.style.strokeDashoffset = String(rideLen * (1 - clamp01((p - 0.6) / 0.09)));

          const say = p < 0.04 ? "BOARDING" : t < 1 ? "EN ROUTE" : "LANDED  ";
          if (say !== said) {
            status.to(say, (k) => k * 30);
            said = say;
          }
          STOPS.forEach((s, i) => {
            const on = p >= s.at;
            tags[i].classList.toggle("is-on", on);
            pins[i].classList.toggle("is-on", on);
            /* while the map is wide, every pin is Denver */
            const [px, py] = pct(vb, s.x + (DEN[0] - s.x) * (1 - z), s.y + (DEN[1] - s.y) * (1 - z));
            pins[i].style.left = `${px}%`;
            pins[i].style.top = `${py}%`;
            const [tx, ty] = tie(s);
            strings[i].setAttribute("x1", String(tx));
            strings[i].setAttribute("y1", String(ty));
            strings[i].setAttribute("x2", String(px));
            strings[i].setAttribute("y2", String(py));
            strings[i].style.opacity = on ? "1" : "0";
          });
        };

        const proxy = { p: 0 };
        status.jump("BOARDING");
        ScrollTrigger.refresh();
        const tw = gsap.to(proxy, {
          p: 1,
          ease: "none",
          onUpdate: () => render(proxy.p),
          scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: 0.3 },
        });
        render(0);
        return () => {
          tw.scrollTrigger?.kill();
          tw.kill();
          status.destroy();
          delete el.dataset.live;
          svg.setAttribute("viewBox", FULL.join(" "));
          [route, ride].forEach((p) => {
            p.style.strokeDasharray = "";
            p.style.strokeDashoffset = "";
            p.style.opacity = "";
          });
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const stops = STOPS.map((s) => ({ s, c: byId(s.id) }));

  return (
    <section className="dep-road" id="road" ref={root} aria-labelledby="road-t">
      <div className="road-stage">
        <div className="dep-wrap road-in">
          <div className="road-copy" data-rv>
            <p className="dep-kick dep-kick--sign">Sep 11 to 13, on the road</p>
            <h2 id="road-t" className="dep-h2">
              Every charge on the road gets its answer.
            </h2>
            <p className="dep-lede">
              Text a photo of the receipt, forward the email, or drop it in. Each receipt finds its own card charge on
              the cards and banks the company already has, and each charge is checked as it lands.
            </p>
          </div>
          <div className="road-screen">
            <div className="road-bar">
              <span className="mono">UA 1187</span>
              <span className="mono road-leg">SFO to DEN</span>
              <span className="road-status mono" aria-hidden="true">
                <Flaps text="LANDED  " />
              </span>
              <Sample dark />
            </div>
            <div className="road-map">
              <svg className="map-svg" viewBox={FULL.join(" ")} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                <path className="map-land" d={LAND} />
                <path className="map-border" d={BORDERS} />
                <g className="map-peaks">
                  {PEAKS.map(([x, y], i) => (
                    <path key={i} d={`M${x - 3} ${y + 2} L${x} ${y - 2} L${x + 3} ${y + 2}`} />
                  ))}
                </g>
                <g className="map-far">
                  {CITIES.map((c) => (
                    <g key={c.k}>
                      <circle cx={c.x} cy={c.y} r="2" className="map-city" />
                      <text x={c.x + 5} y={c.y + 3.5} className="map-label">
                        {c.k}
                      </text>
                    </g>
                  ))}
                  <circle cx={SFO[0]} cy={SFO[1]} r="4" className="map-port" />
                  <text x={SFO[0] + 7} y={SFO[1] + 16} className="map-label map-label--port">
                    SFO
                  </text>
                  <circle cx={DEN[0]} cy={DEN[1]} r="4" className="map-port" />
                  <text x={DEN[0] - 12} y={DEN[1] + 18} className="map-label map-label--port">
                    DEN
                  </text>
                  <path className="map-route" d={ROUTE} />
                </g>
                <g className="map-near">
                  <path className="map-hwy" d={HIGHWAYS} />
                  <path className="map-grid" d={GRID} />
                  <path className="map-rwy" d={RUNWAYS} />
                  <text x="449.6" y="167.2" className="map-label map-label--near">
                    DEN airport
                  </text>
                  <text x="428.4" y="190.6" className="map-label map-label--near">
                    Downtown
                  </text>
                  <text x="378" y="132" className="map-label map-label--near">
                    Front Range
                  </text>
                </g>
                <path className="map-flown" d={ROUTE} />
                <path className="map-ride" d={RIDE} />
                <g className="map-plane" transform={`translate(${DEN[0]} ${DEN[1]})`} style={{ opacity: 0 }}>
                  <path d="M-9 0 L-11 -4 L-9.5 -4 L-5 -1 L1 -1 L-2.5 -8 L0 -8 L6 -1 L10 -1 Q12 0 10 1 L6 1 L0 8 L-2.5 8 L1 1 L-5 1 L-9.5 4 L-11 4 Z" />
                </g>
              </svg>
              <svg className="road-strings" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                {stops.map(({ s }) => {
                  const [px, py] = pct(FULL, DEN[0], DEN[1]);
                  const [tx, ty] = tie(s);
                  return <line key={s.id} x1={tx} y1={ty} x2={px} y2={py} />;
                })}
              </svg>
              {stops.map(({ s }, i) => {
                const [px, py] = pct(FULL, DEN[0], DEN[1]);
                return (
                  <span key={s.id} className="road-pin is-on" style={{ left: `${px}%`, top: `${py}%` }} aria-hidden="true">
                    {i + 1}
                  </span>
                );
              })}
              <ol className="road-tags" aria-label="Charges on the road, sample data">
                {stops.map(({ s, c }, i) => (
                  <li key={s.id} className="is-on" style={{ "--l": `${s.slot.left}%`, "--t": `${s.slot.top}%` } as React.CSSProperties}>
                    <Tag c={c} n={i + 1} flip={s.flip} />
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
