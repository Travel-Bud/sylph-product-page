import Link from "next/link";
import { EngineWindow } from "./engine-window";
import { Arrow } from "./icons";
import { Obj } from "./obj";
import { HOME } from "./anchors";

export function Hero() {
  return (
    <section className="hero" id="hero" aria-labelledby="hero-title">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Corporate travel and expense</p>
          <h1 id="hero-title" className="h1">
            Your policy, <span className="hl">enforced on every charge.</span>
          </h1>
          <p className="lede">
            Sylph turns your policy into rules and checks every charge, receipt and booking against
            them. You review the exceptions, not the pile.
          </p>
          <div className="hero-cta">
            <Link href={`${HOME}/demo`} className="btn btn-primary btn-lg">
              Book a demo
            </Link>
            <a href="#product" className="link-arrow">
              See how it works
              <Arrow />
            </a>
          </div>
          <p className="hero-note mono">Works with the cards and banks you use.</p>
        </div>
        <div className="hero-stage">
          <div className="hero-field" aria-hidden="true" />
          <Obj name="receipt" size={150} className="hero-receipt" priority />
          <Obj name="card" size={170} className="hero-card" priority />
          <EngineWindow />
        </div>
      </div>
    </section>
  );
}
