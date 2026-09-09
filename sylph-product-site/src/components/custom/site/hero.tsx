import Link from "next/link";
import { Arrow } from "./icons";
import { Obj } from "./obj";
import { DEMO } from "./anchors";
import { VideoLoop } from "./video-loop";
import { Mark } from "./mark";
import { QBO_LIVE } from "./sample-data";

/* Hero clip: our own three objects (receipt, boarding pass, envelope) lifting on a current and
   settling back; first and last frame are the same render, so the loop is exact. */
const HERO_CLIP = { src: "/site/video/lab/air-trio.mp4", poster: "/site/video/lab/air-trio.jpg" };

/* The landing strip under the clip: three sample charges whose verdicts land once the strip is on
   screen (LoopGate adds .is-in). Counts on the page are counts of the rows shown. */
const STRIP = [
  { merchant: "United Airlines", amount: "$412.30", verdict: "ok", label: "Cleared", cite: "receipt from email, T-004, in policy" },
  { merchant: "Sushi Kanda", amount: "$84.20", verdict: "warn", label: "Needs a note", cite: "M-041, $9.20 over the $75 dinner cap" },
  { merchant: "Bar Bianco", amount: "$46.90", verdict: "block", label: "Blocked", cite: "M-022, alcohol, kept off the total" },
] as const;

export function Hero() {
  return (
    <section className="hero" id="hero" aria-labelledby="hero-title">
      <Mark className="hero-bird" />
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <h1 id="hero-title" className="h1" style={{ "--i": 0 } as React.CSSProperties}>
            Stop chasing <span className="hl">receipts.</span>
          </h1>
          <p className="lede" style={{ "--i": 1 } as React.CSSProperties}>
            Every card charge finds its receipt, gets checked and coded, and lands on the report. You see
            the exceptions, not the pile. At month end the journal is ready{QBO_LIVE ? " and posts to QuickBooks\u00a0Online" : ""}.
          </p>
          <div className="hero-cta" style={{ "--i": 2 } as React.CSSProperties}>
            <Link href={DEMO} className="btn btn-primary btn-lg">
              Book a demo
            </Link>
            <a href="#product" className="link-arrow">
              See how it works
              <Arrow />
            </a>
          </div>
          <p className="hero-note" style={{ "--i": 3 } as React.CSSProperties}>
            No policy document needed. Sylph writes one from a dozen answers.
          </p>
        </div>

        <div className="hero-stage air-stage">
          <div className="hero-field" aria-hidden="true" />
          <div className="air-clip" data-journey="hero">
            <VideoLoop src={HERO_CLIP.src} poster={HERO_CLIP.poster} className="air-video" />
          </div>
          <div className="air-obj air-obj-1" aria-hidden="true">
            <Obj name="policy" size={164} priority />
          </div>
          <div className="air-obj air-obj-2" aria-hidden="true">
            <Obj name="card" size={176} priority />
          </div>
          <div className="win air-strip" data-once aria-label="Sample verdicts">
            <div className="win-bar">
              <span>Month end</span>
              <span className="sample">Sample data</span>
            </div>
            <ul className="air-rows">
              {STRIP.map((r, i) => (
                <li key={r.merchant} className="air-row" style={{ "--i": i } as React.CSSProperties}>
                  <span className="air-m">{r.merchant}</span>
                  <span className="num air-a">{r.amount}</span>
                  <span className={`chip chip-${r.verdict} air-chip`}>{r.label}</span>
                  <span className="mono air-cite">{r.cite}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
