"use client";

/**
 * The catch — mounted inside RecordSection's stage: the sheets the spine
 * carried down the page settle onto the archive behind the decision record,
 * straight and in order. The loop the hero opened closes here: nothing
 * disappeared into the coil; it landed, cited.
 *
 * (The discrete CurrentSeam bands this file used to hold were superseded by
 * TheSpine in spine.tsx — one continuous current instead of three seams.)
 */

import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "./motion";
import { seeded } from "./wind-sweep";

const MM_SEAM = "(prefers-reduced-motion: no-preference) and (min-width: 981px)";

const CUTS = [
  "/landing/receipt-cafe.png",
  "/landing/receipt-kitcho.png",
  "/landing/receipt-taxi.png",
];

export function RecordLanding() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(MM_SEAM, () => {
        const notes = gsap.utils.toArray<HTMLElement>(".cur-note", root);
        gsap.fromTo(
          notes,
          {
            y: (i: number) => -70 - i * 18,
            rotation: (i: number) => (seeded(70 + i, 1) - 0.5) * 18,
            autoAlpha: 0,
          },
          {
            y: 0,
            rotation: (i: number) => (seeded(70 + i, 2) - 0.5) * 5,
            autoAlpha: 1,
            duration: 0.9,
            stagger: 0.14,
            ease: "power2.out",
            scrollTrigger: { trigger: root, start: "top 78%", once: true },
          },
        );
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="rec-landing" aria-hidden="true">
      {CUTS.map((src) => (
        <Image key={src} className="cur-note" src={src} alt="" width={110} height={138} />
      ))}
    </div>
  );
}
