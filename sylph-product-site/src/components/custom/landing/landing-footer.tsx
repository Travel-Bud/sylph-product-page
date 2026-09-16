"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { LandingBird } from "./landing-bird";
import { gsap, useGSAP, MM_MOTION } from "./motion";
import { DEMO } from "@/components/custom/site/anchors";

/**
 * Footer: the horizon the page settles on. Lives inside the shared
 * .night-frame with the close — same night, same light source. The planet
 * rises to meet you on the same scroll axis that raised the close's glow;
 * the grid itself is reference material and stays still.
 */
export function LandingFooter() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(MM_MOTION, () => {
        gsap.fromTo(
          ".ftr-planet",
          { yPercent: 16 },
          {
            yPercent: 0,
            ease: "none",
            force3D: true,
            scrollTrigger: { trigger: root, start: "top bottom", end: "bottom bottom", scrub: true },
          },
        );
      });
    },
    { scope: ref },
  );

  return (
    <footer ref={ref} className="ar-footer on-night">
      {/* the planet: the horizon the page settles on */}
      <div className="ftr-planet" aria-hidden="true">
        <Image src="/landing/planet.jpg" alt="" fill sizes="100vw" quality={80} />
      </div>

      <div className="wrap">
        <div className="ar-footer-grid">
          <div>
            <div className="brand">
              <span className="mark" aria-hidden="true">
                <LandingBird />
              </span>
              <span>Sylph</span>
            </div>
            <p className="ar-footer-about">
              AI-native corporate travel &amp; expense. The routine clears itself; people review
              only the exceptions.
            </p>
            <p className="ar-footer-trust">
              Deterministic verdicts · cited rules · replayable records
            </p>
          </div>
          <nav aria-label="Product">
            <h3>Product</h3>
            <ul>
              <li><Link href="/#capture">Receipts</Link></li>
              <li><Link href="/#booking">Booking</Link></li>
              <li><Link href="/#setup">Setup</Link></li>
              <li><Link href="/#record">Record</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
            </ul>
          </nav>
          <nav aria-label="Company">
            <h3>Company</h3>
            <ul>
              <li><Link href={DEMO}>Book a demo</Link></li>
              <li><Link href="https://app.sylph-product.com/login">Log in</Link></li>
              <li><a href="mailto:atharva-sumant@januslabsinc.com">atharva-sumant@januslabsinc.com</a></li>
            </ul>
          </nav>
          <nav aria-label="Legal">
            <h3>Legal</h3>
            <ul>
              <li><Link href="/privacy">Privacy</Link></li>
              <li><Link href="/terms">Terms</Link></li>
            </ul>
          </nav>
        </div>
        <div className="ar-footer-line">
          <span>© 2026 Sylph</span>
        </div>
      </div>
    </footer>
  );
}
