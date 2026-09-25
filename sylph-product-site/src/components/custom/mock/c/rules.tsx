"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger, useGSAP, MM_MOTION } from "@/components/custom/site/motion";
import { FlapRow } from "./flap";
import { Flaps, Picto } from "./parts";
import { RULES } from "./data";

const ON = "APPROVED";
const OFF = "PENDING ";

/* 2. The rules of the road, on signage yellow. The section is a wayfinding sign that opens out of the
   hero as it arrives (its clip widens to the full screen), and the rules in force are its rows. As the
   sign scrolls up, Dana's approval flips on each row in turn: nothing checks a charge until the set is
   approved. The markup carries every row approved. */
export function DepRules() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const mm = gsap.matchMedia();
      mm.add(MM_MOTION, () => {
        gsap.fromTo(
          el,
          { clipPath: "inset(0% 4% 0% 4% round 28px)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 0px)",
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "top 25%", scrub: 0.3 },
          },
        );
        const rows = Array.from(el.querySelectorAll<HTMLElement>(".rule-ok")).map((r) => new FlapRow(r, 56));
        rows.forEach((r) => r.jump(OFF));
        let shown = 0;
        const list = el.querySelector(".rules")!;
        const apply = (n: number) => {
          if (n === shown) return;
          rows.forEach((r, i) => r.to(i < n ? ON : OFF, (k) => k * 22));
          el.querySelectorAll<HTMLElement>(".rule").forEach((r, i) => r.classList.toggle("is-on", i < n));
          shown = n;
        };
        el.querySelectorAll<HTMLElement>(".rule").forEach((r) => r.classList.remove("is-on"));
        const st = ScrollTrigger.create({
          trigger: list,
          start: "top 78%",
          end: "bottom 45%",
          onUpdate: (s) => apply(Math.min(rows.length, Math.floor(s.progress * (rows.length + 0.6)))),
          onLeave: () => apply(rows.length),
        });
        return () => {
          st.kill();
          rows.forEach((r) => r.destroy());
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section className="dep-rules" id="rules" ref={root} aria-labelledby="rules-t">
      <div className="dep-wrap dep-rules-in">
        <div className="dep-rules-head" data-rv>
          <p className="dep-kick dep-kick--ink">Before anyone flies</p>
          <h2 id="rules-t" className="dep-h2">
            The rules of the road, written once.
          </h2>
          <p className="dep-lede">
            Hand Sylph the policy you already have, or answer a dozen questions and Sylph writes one. Every sentence
            compiles to a rule that quotes it, and nothing checks a charge until Dana approves the set.
          </p>
          <div className="dep-rules-dana">
            <Image src="/site/characters/dana-head.webp" alt="" width={56} height={56} />
            <span>
              <strong>Dana</strong> approves every rule. AI drafts them; a person decides.
            </span>
          </div>
        </div>
        <div className="dep-sign">
          <div className="dep-sign-bar">
            <span className="dep-sign-arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22">
                <path d="M4 12h14M12 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
              </svg>
            </span>
            Rules in force
            <span className="dep-sample">Sample policy</span>
          </div>
          <ol className="rules">
            {RULES.map((r) => (
              <li key={r.id} className="rule is-on">
                <span className="rule-pic">
                  <Picto name={r.icon} />
                </span>
                <span className="rule-id">{r.id}</span>
                <span className="rule-say">
                  <strong>{r.say}</strong>
                  <q>{r.clause}</q>
                </span>
                <span className="rule-ok">
                  <Flaps text={ON} />
                  <span className="sr-only">Approved by Dana</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
