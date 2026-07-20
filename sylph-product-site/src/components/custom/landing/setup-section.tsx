"use client";

import { useRef } from "react";
import { RevealHeading, gsap, ScrollTrigger, useGSAP, EASE_REVEAL, MM_MOTION, START_GROUP } from "./motion";

/**
 * Setup: fifteen minutes, three stations. The idea of the viewport: setup is
 * review, not data entry — and the green line IS the quarter hour passing,
 * so it causes everything. One timeline: the line sweeps linearly (time is
 * linear); each station rises and its node fills exactly as the line front
 * reaches it; the "policy live" pill is lit by the line's arrival.
 *
 * Static truth (no JS / reduced motion): line complete, all nodes filled,
 * pill lit — the settled state.
 */
export function SetupSection() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(MM_MOTION, () => {
        const steps = gsap.utils.toArray<HTMLElement>(".su-step", root);
        const pill = root.querySelector<HTMLElement>(".su-live");

        /* rewind to 0:00 — JS owns the "before" */
        steps.forEach((s) => s.classList.add("su-wait"));

        const tl = gsap.timeline({
          scrollTrigger: { trigger: ".su-line", start: "top 80%", once: true },
        });

        /* the quarter hour passes at one speed */
        tl.fromTo(".su-rule i", { scaleX: 0 }, { scaleX: 1, duration: 1.5, ease: "none" }, 0);

        /* each station exists because the line reached it */
        steps.forEach((step, i) => {
          const at = i * 0.52;
          tl.from(step, { y: 18, autoAlpha: 0, duration: 0.7, ease: EASE_REVEAL }, at);
          tl.call(() => step.classList.remove("su-wait"), [], at + 0.04);
        });

        /* …and the line's arrival is what turns the policy on */
        if (pill) {
          tl.fromTo(
            pill,
            { scale: 0.94, autoAlpha: 0 },
            { scale: 1, autoAlpha: 1, duration: 0.35, ease: "back.out(1.6)" },
            1.5,
          );

          /* the live dot breathes (CSS keyframes) — but only while the
             section is on screen; is-live gates animation-play-state */
          ScrollTrigger.create({
            trigger: root,
            start: "top bottom",
            end: "bottom top",
            onToggle: (self) => pill.classList.toggle("is-live", self.isActive),
          });
        }

        /* the head's supporting line rises with everything else */
        const sub = root.querySelector(".ar-head .ar-sub");
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
    <section ref={ref} className="ar-sec ar-sec--wash" id="setup" aria-labelledby="setup-h">
      <div className="wrap">
        <div className="ar-head">
          <RevealHeading className="ar-h2">
            <span id="setup-h">
              Drop in your policy. <em className="em-ink">Go get a coffee.</em>
            </span>
          </RevealHeading>
          <p className="ar-sub">
            Most software asks you to rebuild your policy in its format, field by field.
            Sylph reads the document you already wrote.
          </p>
        </div>

        <div className="su-line">
          <div className="su-rule" aria-hidden="true">
            <i />
          </div>
          <div className="su-grid">
            <div className="su-step">
              <span className="tm">0:00</span>
              <h3>Drop in the document</h3>
              <p>The policy PDF you already have. That&rsquo;s the whole input.</p>
              <div className="su-vis" aria-hidden="true">
                <span className="su-doc">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                  </svg>
                  travel-expense-policy.pdf
                </span>
              </div>
            </div>
            <div className="su-step">
              <span className="tm">0:12</span>
              <h3>Come back to a ruleset</h3>
              <p>
                Sylph has extracted your rules. Proofread them: a review, not data entry.
              </p>
              <div className="su-vis" aria-hidden="true">
                <div className="su-rules">
                  <div className="rr">
                    <span className="k">MEAL-03 · dinner cap</span>
                    <span>$75</span>
                  </div>
                  <div className="rr">
                    <span className="k">FLT-02 · cabin</span>
                    <span>economy</span>
                  </div>
                  <div className="rr">
                    <span className="k">HTL-01 · nightly cap</span>
                    <span>$400</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="su-step">
              <span className="tm">0:15</span>
              <h3>Approve. It&rsquo;s enforced.</h3>
              <p>
                From that moment, every booking and every charge is checked against your
                policy, automatically.
              </p>
              <div className="su-vis" aria-hidden="true">
                <span className="su-live">Policy live · enforced from this moment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
