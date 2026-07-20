"use client";

import { useRef } from "react";
import Image from "next/image";
import { LandingBird } from "./landing-bird";
import { RevealHeading, RiseGroup, gsap, useGSAP, EASE_REVEAL, MM_MOTION, START_GROUP, START_STAGE } from "./motion";

const Tick = () => (
  <span className="tick" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  </span>
);

/**
 * Booking, unmistakably inside Sylph: the fare list sits in the product's own
 * window — bird, topbar, the traveler's name — with the trip itself (a wing
 * over the clouds) resting behind the glass. When the section arrives a plane
 * draws its takeoff arc, and as the flight completes, the policy verdicts pop
 * onto the fares: the trip departs, the rules ride along.
 *
 * Static truth: the takeoff trail is complete, the plane rests at its end,
 * and every verdict is on its fare. JS rewinds and flies it once.
 */
export function BookingSection() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(MM_MOTION, () => {
        const trail = root.querySelector<SVGPathElement>(".bk-plane-trail");
        const plane = root.querySelector<SVGGElement>(".bk-plane-glyph");
        const marks = gsap.utils.toArray<HTMLElement>(".bk-row .mark-cell", root);
        if (!trail || !plane) return;

        const len = trail.getTotalLength();
        const proxy = { t: 0 };
        const place = () => {
          const p = trail.getPointAtLength(proxy.t * len);
          const ahead = trail.getPointAtLength(Math.min(len, proxy.t * len + 2));
          const angle = (Math.atan2(ahead.y - p.y, ahead.x - p.x) * 180) / Math.PI;
          gsap.set(plane, { x: p.x, y: p.y, rotation: angle, transformOrigin: "center" });
        };

        gsap.set(trail, { strokeDasharray: len, strokeDashoffset: len });
        proxy.t = 0;
        place();

        gsap.timeline({
          scrollTrigger: { trigger: ".bk-stage", start: START_STAGE, once: true },
          defaults: { duration: 1.25, ease: "power1.inOut" },
        })
          .to(trail, { strokeDashoffset: 0 }, 0)
          .to(proxy, { t: 1, onUpdate: place }, 0)
          /* the flight delivers the policy onto the fares */
          .from(marks, { y: 6, autoAlpha: 0, duration: 0.3, ease: "power2.out", stagger: 0.08 }, 0.95);

        /* the trip behind the glass drifts slower than the page */
        gsap.fromTo(
          ".bk-backplate",
          { yPercent: 5 },
          {
            yPercent: -5,
            ease: "none",
            force3D: true,
            scrollTrigger: { trigger: ".bk-stage", start: "top bottom", end: "bottom top", scrub: true },
          },
        );

        /* the head's supporting line rises with everything else */
        const sub = root.querySelector(".bk-copy .ar-sub");
        if (sub) {
          gsap.from(sub, {
            y: 14, autoAlpha: 0, duration: 0.8, ease: EASE_REVEAL,
            scrollTrigger: { trigger: sub, start: START_GROUP, once: true },
          });
        }
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="ar-sec ar-sec--band" id="booking" aria-labelledby="booking-h">
      <div className="wrap bk-grid">
        <div className="bk-copy">
          <RevealHeading className="ar-h2">
            <span id="booking-h">
              Book the trip. The policy is <em>already there.</em>
            </span>
          </RevealHeading>
          <p className="ar-sub">
            Booking lives inside Sylph, and Sylph has read your travel policy documents, so the
            rules sit on the same screen as the fares. Employees see what&rsquo;s in policy at
            the moment of choice, not in a rejection email a week later.
          </p>
          <RiseGroup selector=".bk-points > li" stagger={0.1}>
            <ul className="bk-points">
              <li>
                <Tick />
                <span>
                  <b>No guessing.</b> Every fare is marked before anyone commits to it.
                </span>
              </li>
              <li>
                <Tick />
                <span>
                  <b>Your documents are the source.</b> The rules on screen are the ones you wrote.
                </span>
              </li>
              <li>
                <Tick />
                <span>
                  <b>Travel and expense, one system.</b> When the trip is booked, its report opens
                  itself, and charges arrive already attached.
                </span>
              </li>
            </ul>
          </RiseGroup>
        </div>

        <RiseGroup className="bk-stage">
          <div>
            {/* the trip itself, resting behind the product window */}
            <div className="bk-backplate ev-backplate" aria-hidden="true">
              <Image
                src="/landing/booking-wing.jpg"
                alt=""
                fill
                sizes="(max-width: 980px) 60vw, 400px"
                quality={80}
              />
            </div>

            {/* the takeoff: drawn once, when the section arrives */}
            <svg className="bk-sky" viewBox="0 0 560 120" aria-hidden="true">
              <path className="bk-plane-trail" d="M 8 104 C 150 100, 300 88, 400 62 S 530 18, 552 8" />
              <g className="bk-plane-glyph">
                <path
                  d="M -7 2.5 L 8 0 L -7 -2.5 L -3.5 0 Z M -1 4.6 L 3.4 0 L -1 -4.6 L -4.6 -1.4 L -0.6 0 L -4.6 1.4 Z"
                  fill="currentColor"
                  transform="rotate(0)"
                />
              </g>
            </svg>

            <div
              className="app-frame bk-card"
              role="img"
              aria-label="Booking inside the Sylph app: sample flight results with policy verdicts. Two fares in policy, one needing approval under rule FLT-02"
            >
              <div aria-hidden="true">
                <div className="app-bar">
                  <span className="app-brand">
                    <i className="app-mark">
                      <LandingBird />
                    </i>
                    Sylph
                  </span>
                  <span className="app-crumb">Book travel</span>
                  <span className="app-user">M. Chen</span>
                </div>
                <div className="bk-head">
                  <span className="rt">
                    SFO → KIX <span>· May 12 · sample</span>
                  </span>
                  <span className="pol">travel-policy.pdf · applied</span>
                </div>
                <div className="bk-row">
                  <div className="fl">
                    <b>ANA · nonstop</b>
                    <span>10:40a to 2:25p · economy</span>
                  </div>
                  <span className="fare">$980.00</span>
                  <span className="ok-mark mark-cell">In policy</span>
                </div>
                <div className="bk-row">
                  <div className="fl">
                    <b>United · 1 stop</b>
                    <span>8:05a to 3:10p · economy</span>
                  </div>
                  <span className="fare">$912.00</span>
                  <span className="ok-mark mark-cell">In policy</span>
                </div>
                <div className="bk-row">
                  <div className="fl">
                    <b>Delta · nonstop</b>
                    <span>11:20a to 3:05p · business</span>
                  </div>
                  <span className="fare">$2,340.00</span>
                  <span className="hold-mark mark-cell">Needs approval · FLT-02</span>
                </div>
              </div>
            </div>
          </div>
        </RiseGroup>
      </div>
    </section>
  );
}
