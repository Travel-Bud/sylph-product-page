import { DEMO } from "@/components/custom/site/anchors";
import { HeroSky } from "./hero-sky";
import { AdminScreen } from "./app-ui/admin-screen";

/* Frame C's hero (Ben, 2026-10-05): the launch film's night flight full bleed (a sharp 3840px version of the film's
   opening, 2026-10-06), the headline centred in its sky, and the admin screen rising out of the clouds onto the paper
   below. On load the sky fades in once it has arrived and the copy reveals line by line (landing.css, "load-in"). */
export function Hero() {
  return (
    <section className="lp-hero" id="top" aria-labelledby="hero-t">
      <HeroSky />
      <span className="lp-hero-probe" data-nav-probe aria-hidden="true" />
      <div className="lp-wrap lp-hero-copy">
        <h1 id="hero-t" className="lp-h1">
          <span className="lp-line">
            <span>Stop chasing receipts.</span>
          </span>{" "}
          <span className="lp-line">
            <span>Handle exceptions instead.</span>
          </span>
        </h1>
        <div className="lp-hero-cta">
          <a href={DEMO} className="lp-btn lp-btn--bone">
            Book a demo
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </a>
          <a href="#how" className="lp-btn lp-btn--glass">
            See how it works
          </a>
        </div>
      </div>
      <div className="lp-hero-rise">
        <AdminScreen />
      </div>
    </section>
  );
}
