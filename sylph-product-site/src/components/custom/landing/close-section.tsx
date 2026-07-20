"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap, SplitText, useGSAP, ambient, EASE_REVEAL, MM_MOTION } from "./motion";

/**
 * The night returns to close the page. The close and the footer share one
 * night frame and ONE light source: the planet's atmosphere below. Scroll is
 * the dimmer switch — the shared glow (.nf-glow, owned by the frame) rises
 * as you arrive, and the pillar's arithmetic finally pays off: 214 in,
 * three decisions.
 */
export function CloseSection() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(MM_MOTION, () => {
        /* the horizon light rises as you arrive — scroll is the dimmer switch.
           The glow lives on the shared night frame, outside this section. */
        const frame = root.closest(".night-frame");
        const glow = frame?.querySelector(".nf-glow");
        if (glow) {
          gsap.fromTo(
            glow,
            { autoAlpha: 0.15, yPercent: 10 },
            {
              autoAlpha: 1,
              yPercent: 0,
              ease: "none",
              force3D: true,
              scrollTrigger: { trigger: root, start: "top 85%", end: "top 15%", scrub: true },
            },
          );
          /* the horizon light breathes, rooted at the planet — scaleY only
             (the scrub owns autoAlpha/yPercent), paused whenever the night
             frame is off screen */
          ambient(
            frame ?? root,
            gsap.to(glow, { scaleY: 1.045, transformOrigin: "50% 100%", duration: 8, ease: "sine.inOut", yoyo: true, repeat: -1 }),
          );
        }

        /* one timeline, one beat: slogan lines, then the rest on a fixed offset */
        const split = SplitText.create(".close-slogan", {
          type: "lines",
          mask: "lines",
          linesClass: "lp-line",
          autoSplit: true,
          onSplit: (self) => {
            const tl = gsap.timeline({
              scrollTrigger: { trigger: root, start: "top 62%", once: true },
            });
            tl.from(self.lines, {
              yPercent: 112,
              duration: 1.1,
              ease: EASE_REVEAL,
              stagger: 0.09,
              onComplete: () => {
                gsap.set(self.lines, { clearProps: "willChange" });
              },
            });
            tl.from(
              ".ar-close .ar-sub, .ar-close-ctas, .ar-close-note",
              { y: 18, autoAlpha: 0, duration: 0.9, ease: EASE_REVEAL, stagger: 0.09 },
              "-=0.55",
            );
            return tl;
          },
        });

        return () => split.revert();
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="ar-close on-night" id="close" aria-labelledby="close-h">
      <div className="wrap">
        <h2 className="close-slogan" id="close-h">
          Expenses run <em>on air.</em>
        </h2>
        <p className="ar-sub" style={{ maxWidth: "44ch" }}>
          A 214-charge month. Three decisions. See Sylph run on your own policy.
        </p>

        <div className="ar-close-ctas">
          <Link href="/demo" className="btn btn-aurora btn-lg">
            Book a demo
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
          <Link href="/login" className="ar-link">
            or log in
          </Link>
        </div>
        <p className="ar-close-note">A 30-minute demo, run on your own policy document. No card required.</p>
      </div>
    </section>
  );
}
