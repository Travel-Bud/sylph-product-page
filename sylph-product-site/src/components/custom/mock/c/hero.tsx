import Link from "next/link";
import { Mark } from "@/components/custom/site/mark";
import { APP_LOGIN, DEMO, PRICING } from "@/components/custom/site/anchors";
import { DepartureBoard } from "./board";

/* The terminal's signage strip: black, one yellow button, the same on every ground below it. */
export function DepNav() {
  return (
    <header className="dep-nav">
      <div className="dep-wrap dep-nav-in">
        <Link href="#top" className="dep-brand" aria-label="Sylph, back to the top">
          <Mark className="dep-mark" />
          <span>Sylph</span>
        </Link>
        <nav className="dep-nav-links" aria-label="Site">
          <a href="#booked">The trip</a>
          <a href="#queue">Finance</a>
          <Link href={PRICING}>Pricing</Link>
          <a href={APP_LOGIN}>Log in</a>
          <a href={DEMO} className="dep-btn dep-btn--sign">
            Book a demo
          </a>
        </nav>
      </div>
    </header>
  );
}

export function DepHero() {
  return (
    <section className="dep-hero" id="top" aria-labelledby="dep-h1">
      <div className="dep-wrap">
        <div className="dep-hero-copy">
          <p className="dep-kick">Sylph, travel and expense</p>
          <h1 id="dep-h1" className="dep-h1">
            <span>One trip.</span> <span className="dep-h1-b">Every charge on it, checked as it happens.</span>
          </h1>
          <div className="dep-hero-side">
            <p className="dep-lede">
              Priya books her Denver site visit in Sylph, and every card charge on the road gets an answer that names
              its rule. Dana closes the books and sees only the exceptions. At month end the report is already there.
            </p>
            <div className="dep-cta">
              <a href={DEMO} className="dep-btn dep-btn--sign dep-btn--lg">
                Book a demo
              </a>
              <a href="#booked" className="dep-follow">
                Follow the trip
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M8 3v10M4 9l4 4 4-4" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <DepartureBoard />
      </div>
    </section>
  );
}
