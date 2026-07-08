"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, SplitText, useGSAP, ambient, EASE_REVEAL, MM_MOTION } from "./motion";

/**
 * The interlude: the page's one photographic exhale, and the traveler's own
 * viewport. An empty terminal at first light — the trip is real, and nobody
 * is standing at it doing paperwork. The image drifts slower than the page
 * (the only scrubbed photograph on the page); the line rises once.
 */
export function InterludeSection() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(MM_MOTION, () => {
        gsap.fromTo(
          ".ar-interlude-bg",
          { yPercent: -7 },
          {
            yPercent: 7,
            ease: "none",
            force3D: true,
            scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: true },
          },
        );

        /* the photographic exhale literally breathes — a 22s cycle on the img
           (the scrub owns the parent's yPercent; channels never collide),
           spending frames only while the interlude is on screen */
        const img = root.querySelector(".ar-interlude-bg img");
        if (img) {
          ambient(root, gsap.to(img, { scale: 1.035, duration: 11, ease: "sine.inOut", yoyo: true, repeat: -1 }));
        }

        const split = SplitText.create(".ar-interlude-line", {
          type: "lines",
          mask: "lines",
          linesClass: "lp-line",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 112,
              duration: 1.0,
              ease: EASE_REVEAL,
              stagger: 0.09,
              scrollTrigger: { trigger: root, start: "top 70%", once: true },
              onComplete: () => {
                gsap.set(self.lines, { clearProps: "willChange" });
              },
            }),
        });
        return () => split.revert();
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="ar-interlude" aria-label="An empty airport terminal at first light">
      <div className="ar-interlude-bg" aria-hidden="true">
        <Image
          src="/landing/interlude.jpg"
          alt=""
          fill
          sizes="100vw"
          quality={80}
        />
      </div>
      <div className="ar-interlude-veil" aria-hidden="true" />
      <div className="wrap ar-interlude-copy">
        <p className="ar-interlude-line">
          Your people are already at the gate.
          <br />
          <em>The paperwork never boards.</em>
        </p>
      </div>
    </section>
  );
}
