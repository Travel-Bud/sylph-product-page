import Image from "next/image";
import { DEMO } from "@/components/custom/site/anchors";
import { NIGHT_FLIGHT_HD } from "./film";
import { AdminScreen } from "./app-ui/admin-screen";

/* Frame C's hero (Ben, 2026-10-05): the launch film's night flight as a floating panel inset on the paper (a sharp
   3840px render of the film's opening, 2026-10-06), the headline centred in its sky, and the admin screen rising out
   of the clouds onto the paper below. */
export function Hero() {
  return (
    <section className="lp-hero" id="top" aria-labelledby="hero-t">
      <div className="lp-hero-sky">
        <Image src={NIGHT_FLIGHT_HD.src} alt="" fill priority quality={80} sizes="100vw" placeholder="blur" blurDataURL={NIGHT_FLIGHT_HD.blur} className="lp-hero-img" />
      </div>
      <span className="lp-hero-probe" data-nav-probe aria-hidden="true" />
      <div className="lp-wrap lp-hero-copy">
        <p className="lp-kick lp-kick--night">Corporate travel and expense</p>
        <h1 id="hero-t" className="lp-h1">
          <span>The expense policy</span> <span>that enforces itself.</span>
        </h1>
        <p className="lp-hero-lede">
          Write your travel and expense policy once, in plain English. Sylph checks every receipt, card swipe and booking
          against it, and shows finance only what breaks a&nbsp;rule.
        </p>
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
