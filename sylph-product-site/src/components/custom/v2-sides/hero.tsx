import Link from "next/link";
import { DEMO } from "@/components/custom/site/anchors";
import { HeroStage } from "./hero-stage";
import "./hero.css";

export function SidesHero() {
  return (
    <section className="v2s-hero" id="top" aria-labelledby="hero-t">
      <div className="v2s-wrap">
        <div className="v2s-hero-copy">
          <h1 id="hero-t" className="v2s-h1">
            <span>
              <span>One charge.</span> <span>Two people.</span>
            </span>
            <span className="v2s-h1-b">Nothing to chase.</span>
          </h1>
          <div className="v2s-hero-side">
            <p className="v2s-lede">
              <span className="v2s-name v2s-name--priya">Priya</span> texts a photo of the receipt and gets an answer
              that names the rule. <span className="v2s-name v2s-name--dana">Dana</span> closes the books and sees
              only the exceptions. At month end the report is already there.
            </p>
            <div className="v2s-hero-cta">
              <Link href={DEMO} className="v2s-btn v2s-btn--ink v2s-btn--lg">
                Book a demo
              </Link>
              <a href="#receipts" className="v2s-follow">
                Follow the charge
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
