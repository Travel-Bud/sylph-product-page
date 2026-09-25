import Link from "next/link";
import { DEMO } from "@/components/custom/site/anchors";
import { HeroStage } from "./hero-stage";
import "@/components/custom/v2-sides/hero.css";

/* The landing's hero (copy of v2-sides/hero.tsx with the 2026-09-25 copy pass). */
export function SidesHero() {
  return (
    <section className="v2s-hero" id="top" aria-labelledby="hero-t">
      <div className="v2s-wrap">
        <div className="v2s-hero-copy">
          <h1 id="hero-t" className="v2s-h1">
            <span>Stop chasing</span> <span className="v2s-h1-b">receipts.</span>
          </h1>
          <div className="v2s-hero-side">
            <p className="v2s-lede">
              Your team texts a photo of each receipt. Sylph checks it against your policy, files it, and shows
              finance only what breaks a rule.
            </p>
            <div className="v2s-hero-cta">
              <Link href={DEMO} className="v2s-btn v2s-btn--ink v2s-btn--lg">
                Book a demo
              </Link>
              <a href="#receipts" className="v2s-follow">
                See how it works
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M8 3v10M4 9l4 4 4-4" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <HeroStage />
      </div>
    </section>
  );
}
