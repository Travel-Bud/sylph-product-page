"use client";

import { useRef } from "react";
import Image from "next/image";
import { Mark } from "@/components/custom/site/mark";
import { gsap, useGSAP, MM_MOTION } from "@/components/custom/site/motion";
import { Sample } from "./parts";

/* The torn edge between the pass and its stub: teeth every 2.5%, cut so the two edges interlock while the
   stub is still attached. H is the desktop pass (stub on the right), V the phone pass (stub below). */
const T = 5;
function zig(n: number, pos: (i: number, tip: boolean) => string) {
  return Array.from({ length: n + 1 }, (_, i) => pos(i, i % 2 === 0)).join(", ");
}
const N = 40;
const ZZ = {
  mainH: `polygon(0 0, 100% 0, ${zig(N, (i, tip) => `${tip ? "100%" : `calc(100% - ${T}px)`} ${(i * 100) / N}%`)}, 100% 100%, 0 100%)`,
  stubH: `polygon(${zig(N, (i, tip) => `${tip ? `${T}px` : "0px"} ${(i * 100) / N}%`)}, 100% 100%, 100% 0)`,
  mainV: `polygon(0 0, 100% 0, 100% 100%, ${zig(N, (i, tip) => `${100 - (i * 100) / N}% ${tip ? "100%" : `calc(100% - ${T}px)`}`)})`,
  stubV: `polygon(${zig(N, (i, tip) => `${(i * 100) / N}% ${tip ? `${T}px` : "0px"}`)}, 100% 100%, 0 100%)`,
};

/* A barcode as a boarding pass prints it: bars from a fixed seed, so server and client agree. */
function Barcode({ n = 64, seed = 7, className }: { n?: number; seed?: number; className?: string }) {
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  let x = 0;
  const bars: { x: number; w: number }[] = [];
  for (let i = 0; i < n; i++) {
    const w = 1 + Math.floor(rnd() * 3);
    if (i % 2 === 0) bars.push({ x, w });
    x += w;
  }
  return (
    <svg className={className} viewBox={`0 0 ${x} 20`} preserveAspectRatio="none" aria-hidden="true">
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y="0" width={b.w} height="20" />
      ))}
    </svg>
  );
}

/* 3. Booked, in cabin daylight. The pass tears at the stub as it scrolls through: the stub is the trip
   report the confirmed booking opened, and it comes away as its own slip. Clouds cross the window row
   above at the speed of the scroll. */
export function DepBooked() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const mm = gsap.matchMedia();
      mm.add(
        { motion: MM_MOTION, phone: "(max-width: 760px)" },
        (ctx) => {
          const { motion, phone } = ctx.conditions as { motion: boolean; phone: boolean };
          if (!motion) return;
          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: el.querySelector(".pass-stage"), start: "top 85%", end: "bottom 30%", scrub: 0.3 },
          });
          tl.fromTo(el.querySelector(".pass-ok"), { scale: 1.9, opacity: 0, rotate: -24 }, { scale: 1, opacity: 1, rotate: -9, ease: "back.out(2.2)", duration: 0.12 }, 0.18)
            .fromTo(el.querySelector(".pass-perf"), { opacity: 1 }, { opacity: 0, duration: 0.1 }, 0.42)
            .fromTo(
              el.querySelector(".pass-stub"),
              { x: 0, y: 0, rotate: 0 },
              phone ? { x: 10, y: 34, rotate: 4, duration: 0.4, ease: "power2.out" } : { x: 46, y: 22, rotate: 7, duration: 0.4, ease: "power2.out" },
              0.4,
            )
            .fromTo(el.querySelector(".pass-stub-say"), { opacity: 0.35 }, { opacity: 1, duration: 0.2 }, 0.5)
            .fromTo(el.querySelector(".pass-priya"), { x: phone ? -10 : -40 }, { x: phone ? 10 : 30, duration: 1 }, 0)
            .to({}, { duration: 0.02 }, 0.98);
          gsap.fromTo(
            el.querySelector(".cabin-sky"),
            { backgroundPositionX: "0px" },
            { backgroundPositionX: "-900px", ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.3 } },
          );
        },
      );
      return () => mm.revert();
    },
    { scope: root },
  );

  const zz = { "--zz-main-h": ZZ.mainH, "--zz-stub-h": ZZ.stubH, "--zz-main-v": ZZ.mainV, "--zz-stub-v": ZZ.stubV } as React.CSSProperties;

  return (
    <section className="dep-booked" id="booked" ref={root} aria-labelledby="booked-t">
      <div className="cabin" aria-hidden="true">
        <div className="cabin-sky" />
      </div>
      <div className="dep-wrap dep-booked-in">
        <div className="dep-booked-copy" data-rv>
          <p className="dep-kick dep-kick--blue">Sep 11, booked</p>
          <h2 id="booked-t" className="dep-h2">
            Priya books the flight in Sylph.
          </h2>
          <p className="dep-lede">
            She sees the policy before she pays, at the airline&rsquo;s price: no markup, no commission, no fee per
            trip. The confirmed booking opens the trip&rsquo;s report, with the dates and destination already on it.
          </p>
          <ul className="dep-facts">
            <li>
              <b>T-004</b> checked the fare before she paid
            </li>
            <li>
              <b>Report</b> opened by the booking, nothing to start
            </li>
          </ul>
        </div>
        <figure className="pass-stage">
          <Image className="pass-priya" src="/site/characters/priya-walk.webp" alt="" width={695} height={1125} sizes="220px" />
          <div className="pass" style={zz}>
            <div className="pass-main">
              <div className="pass-band">
                <span className="pass-brand">
                  <Mark className="pass-mark" />
                  Sylph
                </span>
                <span>Boarding pass</span>
                <span className="pass-class">Economy</span>
              </div>
              <div className="pass-body">
                <div className="pass-route">
                  <span className="pass-port">
                    <b>SFO</b>
                    <small>San Francisco</small>
                  </span>
                  <svg className="pass-arc" viewBox="0 0 120 30" aria-hidden="true">
                    <path d="M4 26 Q60 -6 116 26" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 4" />
                    <path d="M56 6.5l6-1.4 3.4-5.6h2l-1.8 5.6 4.3-.9 1.3-1.9h1.2l-.6 3.3.6 3.3H71l-1.3-1.9-4.3-.9 1.8 5.6h-2L62 8.9z" fill="currentColor" transform="translate(-3 1)" />
                  </svg>
                  <span className="pass-port">
                    <b>DEN</b>
                    <small>Denver</small>
                  </span>
                </div>
                <dl className="pass-fields">
                  <div>
                    <dt>Passenger</dt>
                    <dd>Priya Natarajan</dd>
                  </div>
                  <div>
                    <dt>Flight</dt>
                    <dd>UA 1187</dd>
                  </div>
                  <div>
                    <dt>Date</dt>
                    <dd>11 Sep</dd>
                  </div>
                  <div>
                    <dt>Seat</dt>
                    <dd>23C</dd>
                  </div>
                </dl>
                <div className="pass-fare">
                  <span>
                    <small>Fare, airline&rsquo;s price</small>
                    <b>$412.30</b>
                  </span>
                  <span className="pass-rule">
                    <small>Policy</small>
                    T-004, economy under six hours
                  </span>
                  <span className="pass-ok" aria-label="Cleared, rule T-004, before she paid">
                    <svg viewBox="0 0 100 100" aria-hidden="true">
                      <circle cx="50" cy="50" r="46" />
                      <circle cx="50" cy="50" r="38" />
                      <text x="50" y="47" textAnchor="middle">
                        CLEARED
                      </text>
                      <text x="50" y="63" textAnchor="middle" className="pass-ok-s">
                        T-004
                      </text>
                    </svg>
                  </span>
                </div>
                <Barcode className="pass-code" />
              </div>
              <span className="pass-perf" aria-hidden="true" />
            </div>
            <div className="pass-stub">
              <div className="pass-stub-band">Trip report</div>
              <div className="pass-stub-say">
                <b>Opened by the booking</b>
                <span>Denver site visit</span>
                <span className="mono">Sep 11 to 13</span>
                <span className="pass-stub-line mono">1 line, $412.30</span>
              </div>
              <Barcode className="pass-code pass-code--stub" n={28} seed={31} />
            </div>
          </div>
          <figcaption>
            <Sample />
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
