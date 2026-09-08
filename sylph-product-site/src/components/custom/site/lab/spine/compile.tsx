"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger, MM_MOTION } from "@/components/custom/site/motion";
import { CHARGE, RULE_ID, RULE_ROWS } from "./copy";

/**
 * The beat under the fold. The same sentence from the hero compiles into a
 * rule, and the rule decides one charge. A single hairline spine runs down the
 * left of the three stations and is drawn as the beat plays. Motion is
 * typographic only: two phrases underline, the rule rows set, the verdict lands
 * with a scale settle. The settled state is what the markup renders, so reduced
 * motion gets the whole thing as a still.
 */
export function SpineCompile() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const scope = root.current;
      if (!scope) return;
      const mm = gsap.matchMedia();

      mm.add(MM_MOTION, () => {
        const q = (sel: string) => scope.querySelector<HTMLElement>(sel);
        const line = q(".spine-line");
        const marks = Array.from(scope.querySelectorAll<HTMLElement>(".spine-mk-line"));
        const rows = Array.from(scope.querySelectorAll<HTMLElement>(".spine-rule-row"));
        const hits = rows.filter((r) => r.dataset.hit === "1");
        const charge = q(".spine-charge");
        const stamp = q(".spine-stamp");
        const cite = q(".spine-cite");
        if (!line || !charge || !stamp || !cite) return;

        const tl = gsap.timeline({ paused: true });
        tl.from(line, { scaleY: 0, duration: 0.7, ease: "power2.out" })
          .from(marks, { scaleX: 0, duration: 0.5, stagger: 0.14, ease: "expo.out" }, "-=0.28")
          .from(rows, { opacity: 0, y: 9, duration: 0.42, stagger: 0.1, ease: "expo.out" }, "-=0.16")
          .fromTo(
            hits,
            { backgroundColor: "rgba(14, 204, 131, 0.18)" },
            { backgroundColor: "rgba(14, 204, 131, 0)", duration: 1, ease: "power1.out" },
            "-=0.2",
          )
          .from(charge, { opacity: 0, y: 9, duration: 0.44, ease: "expo.out" }, "-=0.7")
          .from(stamp, { opacity: 0, scale: 1.18, duration: 0.44, ease: "expo.out" }, "+=0.1")
          .from(cite, { opacity: 0, duration: 0.5, ease: "power1.out" }, "-=0.12");

        const st = ScrollTrigger.create({
          trigger: scope,
          start: "top 78%",
          end: "bottom top",
          onToggle: (self) => (self.isActive ? tl.play() : tl.pause()),
        });
        if (st.isActive) tl.play();
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section className="spine-beat" id="compile" aria-labelledby="spine-compile-title" ref={root}>
      <div className="wrap spine-beat-grid">
        <header className="spine-beat-head">
          <p className="eyebrow">The compile</p>
          <h2 id="spine-compile-title" className="spine-h2">
            A verdict that cannot cite its rule is an opinion.
          </h2>
          <p className="lede">
            Every rule keeps the sentence it came from, so every verdict can name the rule, the
            threshold and the amount that broke it.
          </p>
        </header>

        <div className="spine-track">
          <div className="spine-line" aria-hidden="true" />
          <ol className="spine-stations">
            <li className="spine-st spine-st-1">
              <p className="spine-st-k">
                <span className="spine-st-n" aria-hidden="true">
                  1
                </span>
                <span>The sentence</span>
                <span className="sample">Sample data</span>
              </p>
              <p className="spine-policy">
                Dinner is capped at{" "}
                <span className="spine-mk">
                  $75 a person
                  <i className="spine-mk-line" aria-hidden="true" />
                </span>
                . Anything over that{" "}
                <span className="spine-mk">
                  needs a note
                  <i className="spine-mk-line" aria-hidden="true" />
                </span>{" "}
                from the traveler.
              </p>
            </li>

            <li className="spine-st spine-st-2">
              <p className="spine-st-k">
                <span className="spine-st-n" aria-hidden="true">
                  2
                </span>
                <span>The rule it compiles to</span>
              </p>
              <div className="spine-rule">
                <p className="spine-rule-id">{RULE_ID}</p>
                <dl className="spine-rule-rows">
                  {RULE_ROWS.map((row) => (
                    <div
                      className="spine-rule-row"
                      key={row.term}
                      data-hit={row.hit ? "1" : undefined}
                    >
                      <dt>{row.term}</dt>
                      <dd>{row.value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="spine-rule-note">
                  Sylph drafts it. Your controller reads it and approves it before it runs on
                  anything.
                </p>
              </div>
            </li>

            <li className="spine-st spine-st-3">
              <p className="spine-st-k">
                <span className="spine-st-n" aria-hidden="true">
                  3
                </span>
                <span>The verdict on one charge</span>
              </p>
              <div className="spine-charge">
                <span className="spine-charge-who">
                  <span className="spine-charge-merchant">{CHARGE.merchant}</span>
                  <span className="spine-charge-meta">
                    {CHARGE.date}, {CHARGE.meta}
                  </span>
                </span>
                <span className="spine-charge-amount">{CHARGE.amount}</span>
              </div>
              <p className="spine-stamp verdict verdict-note">
                <span className="dot" aria-hidden="true" />
                {CHARGE.verdict}
              </p>
              <p className="spine-cite">{CHARGE.cite}</p>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
