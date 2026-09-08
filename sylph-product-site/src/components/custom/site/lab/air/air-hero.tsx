import Link from "next/link";
import { Arrow } from "@/components/custom/site/icons";
import { Obj } from "@/components/custom/site/obj";
import { HOME } from "@/components/custom/site/anchors";
import { VideoLoop } from "@/components/custom/site/video-loop";

/* Hero clip: the air trio probe (receipt, boarding pass, envelope lift on a current and settle back). */
export const HERO_CLIP = { src: "/site/video/lab/air-trio.mp4", poster: "/site/video/lab/air-trio.jpg" };

const STRIP = [
  { merchant: "United Airlines", amount: "$412.30", verdict: "ok", label: "Cleared", cite: "T-004, in policy" },
  { merchant: "Sushi Kanda", amount: "$84.20", verdict: "warn", label: "Needs a note", cite: "M-041, $9.20 over the $75 dinner cap" },
  { merchant: "Bar Bianco", amount: "$46.90", verdict: "block", label: "Blocked", cite: "M-022, alcohol, kept off the total" },
] as const;

export function AirHero() {
  return (
    <section className="hero air-hero" id="hero" aria-labelledby="hero-title">
      <div className="wrap air-grid">
        <div className="hero-copy air-copy">
          <p className="eyebrow" style={{ "--i": 0 } as React.CSSProperties}>
            Corporate travel and expense
          </p>
          <h1 id="hero-title" className="h1 air-h1" style={{ "--i": 1 } as React.CSSProperties}>
            Every charge gets a verdict. <span className="hl">Every verdict cites the rule.</span>
          </h1>
          <p className="lede" style={{ "--i": 2 } as React.CSSProperties}>
            Sylph reads your policy and drafts the rules. A person approves them. From then on every card
            charge, receipt and booking is checked against the same rules, on the cards you already carry.
          </p>
          <div className="hero-cta" style={{ "--i": 3 } as React.CSSProperties}>
            <Link href={`${HOME}/demo`} className="btn btn-primary btn-lg">
              Book a demo
            </Link>
            <a href="#receipts" className="link-arrow">
              See how it works
              <Arrow />
            </a>
          </div>
          <p className="hero-note mono" style={{ "--i": 4 } as React.CSSProperties}>
            Expenses run on air.
          </p>
        </div>

        <div className="air-stage">
          <div className="hero-field" aria-hidden="true" />
          <div className="air-clip">
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
              <span>Enforcement</span>
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
