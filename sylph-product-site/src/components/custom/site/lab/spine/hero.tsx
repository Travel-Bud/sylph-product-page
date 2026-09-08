"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger, MM_MOTION } from "@/components/custom/site/motion";
import { Arrow } from "@/components/custom/site/icons";
import { HOME } from "@/components/custom/site/anchors";
import { POLICY_SENTENCE } from "./copy";
import { Typed } from "./typed";

export function SpineHero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const scope = root.current;
      if (!scope) return;
      const mm = gsap.matchMedia();

      mm.add(MM_MOTION, () => {
        const chars = Array.from(scope.querySelectorAll<HTMLElement>(".spine-ch"));
        const caret = scope.querySelector<HTMLElement>(".spine-caret");
        const hair = scope.querySelector<HTMLElement>(".spine-hair");
        if (!chars.length || !caret || !hair) return;

        gsap.set(chars, { opacity: 0 });
        gsap.set(hair, { scaleX: 0 });
        gsap.set(caret, { opacity: 1, x: 0, y: 0 });

        let shown = 0;
        const cursor = { i: 0 };
        const place = (el: HTMLElement) => {
          const dy = (el.offsetHeight - caret.offsetHeight) / 2;
          gsap.set(caret, { x: el.offsetLeft + el.offsetWidth, y: el.offsetTop + dy });
        };

        const tl = gsap.timeline({ paused: true });
        tl.to(hair, { scaleX: 1, duration: 0.8, ease: "expo.out" })
          .to(
            cursor,
            {
              i: chars.length,
              duration: Math.min(2.9, chars.length * 0.03),
              ease: "none",
              onUpdate: () => {
                const next = Math.round(cursor.i);
                if (next === shown) return;
                for (let k = Math.min(shown, next); k < Math.max(shown, next); k++) {
                  chars[k].style.opacity = k < next ? "1" : "0";
                }
                shown = next;
                if (next > 0) place(chars[next - 1]);
              },
            },
            "-=0.42",
          )
          .to(caret, { opacity: 0, duration: 0.14, repeat: 5, yoyo: true, ease: "none" }, "+=0.18")
          .to(caret, { opacity: 0, duration: 0.3, ease: "power1.out" });

        tl.play();
        ScrollTrigger.create({
          trigger: scope,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => (self.isActive ? tl.play() : tl.pause()),
        });

        return () => {
          for (const c of chars) c.style.opacity = "";
        };
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section className="spine-hero" id="hero" aria-labelledby="spine-hero-title" ref={root}>
      <div className="wrap">
        <div className="spine-hero-top">
          <div className="spine-hero-lead">
            <p className="eyebrow">Corporate travel and expense</p>
            <h1 id="spine-hero-title" className="spine-h1">
              Write the policy <em>once</em>. Sylph enforces it on every charge.
            </h1>
          </div>
          <div className="spine-hero-deck">
            <p className="lede">
              Sylph reads your policy and drafts the rules. Your controller approves them. After that
              every charge, receipt and booking is checked against the same rules.
            </p>
            <div className="spine-cta">
              <Link href={`${HOME}/demo`} className="btn btn-primary btn-lg">
                Book a demo
              </Link>
              <a href="#compile" className="link-arrow">
                Watch a sentence compile
                <Arrow />
              </a>
            </div>
            <p className="spine-note mono">Works with the cards and banks you already use.</p>
          </div>
        </div>

        <div className="spine-hair" aria-hidden="true" />

        <p className="spine-kicker">
          <span>One line from a travel policy</span>
          <span className="sample">Sample data</span>
        </p>
        <p className="spine-policy">
          <Typed text={POLICY_SENTENCE} />
          <span className="spine-caret" aria-hidden="true" />
        </p>
      </div>
    </section>
  );
}
