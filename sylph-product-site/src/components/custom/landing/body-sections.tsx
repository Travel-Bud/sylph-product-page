"use client";

import { useRef } from "react";
import Image from "next/image";
import { SectionEyebrow, RevealHeading, RiseGroup, gsap, useGSAP, EASE_REVEAL, MM_MOTION, START_GROUP, START_STAGE } from "./motion";

/**
 * Record: the trust band. Speed, security, and the next-generation claim are
 * carried by what is actually true of the engine — deterministic verdicts,
 * cited rules, replayable records — shown as a decision record with the raw
 * material of record-keeping (receipt paper, neatly archived) resting behind
 * it. The seal stamps itself once, when the card lands.
 */
export function RecordSection() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(MM_MOTION, () => {
        gsap.from(".ar-seal", {
          scale: 1.14,
          rotation: -4,
          autoAlpha: 0,
          duration: 0.45,
          ease: "back.out(1.8)",
          delay: 0.55,
          scrollTrigger: { trigger: ".rec-card", start: START_STAGE, once: true },
        });

        /* the archive behind the record drifts slower than the page */
        gsap.fromTo(
          ".rec-backplate",
          { yPercent: 5 },
          {
            yPercent: -5,
            ease: "none",
            force3D: true,
            scrollTrigger: { trigger: ".rec-stage", start: "top bottom", end: "bottom top", scrub: true },
          },
        );

        /* the head's supporting line rises with everything else */
        const sub = root.querySelector(".ar-sub");
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
    <section ref={ref} className="ar-sec ar-sec--band" id="record" aria-labelledby="record-h">
      <div className="wrap rec-grid">
        <div>
          <SectionEyebrow station="record">The record</SectionEyebrow>
          <RevealHeading className="ar-h2">
            <span id="record-h">
              Fast to review, because it&rsquo;s <em className="em-ink">built to be checked.</em>
            </span>
          </RevealHeading>
          <p className="ar-sub">
            The exception queue is quick because everything beneath it is exact. Every decision
            Sylph makes is one your auditors, and your own team, can open later and see
            exactly why.
          </p>
          <RiseGroup selector=".rec-cells > li" stagger={0.1}>
            <ul className="rec-cells">
              <li>
                <b>Deterministic</b>
                <p>Same charge, same policy, same verdict, every time. No mood, no drift.</p>
              </li>
              <li>
                <b>Cited</b>
                <p>
                  Every exception names the rule it tripped and the numbers behind it. Reviews
                  start from evidence, not archaeology.
                </p>
              </li>
              <li>
                <b>Replayable</b>
                <p>Any verdict can be reproduced later, exactly as it was made.</p>
              </li>
            </ul>
          </RiseGroup>
        </div>

        <RiseGroup className="rec-stage">
          <div>
            {/* the raw material of the record, archived — paper, in order */}
            <div className="rec-backplate ev-backplate" aria-hidden="true">
              <Image
                src="/landing/record-paper.jpg"
                alt=""
                fill
                sizes="(max-width: 980px) 60vw, 400px"
                quality={80}
              />
            </div>
            <div
              className="ev-card rec-card"
              role="img"
              aria-label="Sample decision record: line 118, Kitcho dinner, rule MEAL-03, exception approved by L. Marsh on May 21, on record and replayable"
            >
              <div aria-hidden="true">
                <div className="rec-card-head">
                  <span className="ev-label">Decision record · sample</span>
                  <span className="ar-seal">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    on record
                  </span>
                </div>
                <div className="rec-row">
                  <span className="k">Line</span>
                  <b>118 · Kitcho · dinner, Osaka</b>
                </div>
                <div className="rec-row">
                  <span className="k">Amount</span>
                  <b>¥14,200 → $95.62 · rate of May 14</b>
                </div>
                <div className="rec-row">
                  <span className="k">Rule</span>
                  <b>MEAL-03 · dinner cap</b>
                </div>
                <div className="rec-row">
                  <span className="k">Decision</span>
                  <span className="ok">exception approved · L. Marsh · May 21</span>
                </div>
                <div className="rec-foot">
                  <span>every input snapshotted</span>
                  <span>replayable</span>
                </div>
              </div>
            </div>
          </div>
        </RiseGroup>
      </div>

      {/* the CFO's real question — who is in control — answered in plain text */}
      <div className="wrap">
        <RiseGroup className="rec-controls" selector="li" stagger={0.08}>
          <span className="ev-label">You stay in control</span>
          <ul>
            <li>A person approves every rule before it enforces anything.</li>
            <li>No charge is judged without its matched receipt.</li>
            <li>Approvals follow your org chart, not ours.</li>
            <li>Any verdict can be replayed later, input for input.</li>
          </ul>
        </RiseGroup>
      </div>
    </section>
  );
}
