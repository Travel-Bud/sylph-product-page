import type { Metadata } from "next";
import { DEMO } from "@/components/custom/site/anchors";
import { landingFonts } from "@/components/custom/landing/fonts";
import "@/components/custom/landing/landing.css";
import "@/components/custom/landing/sub.css";
import { Nav } from "@/components/custom/landing/nav";
import { Footer } from "@/components/custom/landing/footer";
import { DemoForm } from "./demo-form";
import { Kicker } from "@/components/custom/landing/kicker";

export const metadata: Metadata = {
  title: "Book a Sylph demo",
  description:
    "A thirty-minute walkthrough on last month's charges, with or without a policy document: the rules Sylph checks, the verdicts it gives, and how the month closes with only the exceptions left to review.",
};

const POINTS = [
  { t: "Your policy, written or built", d: "Your PDF, or your answers to a dozen questions, becomes a ruleset you can read." },
  { t: "A verdict you can check", d: "A flagged dinner earns its citation: rule, threshold, amount." },
  { t: "The review surface", d: "Cleared lines file themselves. Only the exceptions reach you." },
];

/* Two ways to book (Ben, 2026-10-06): the wired intake form, unchanged (repo rule; sub.css styles it from outside),
   or a time straight on Atharva's calendar. The landing's Book a demo goes to the calendar. */
export default function DemoPage() {
  return (
    <main className={`lp lp-sub ${landingFonts}`} id="main">
      <a href="#lead" className="lp-skip">
        Skip to content
      </a>
      <Nav solid />
      <section className="lp-demo" id="lead" aria-labelledby="demo-t" tabIndex={-1}>
        <div className="lp-wrap lp-demo-grid">
          <div className="lp-demo-copy">
            <Kicker>Book a demo</Kicker>
            <h1 id="demo-t" className="lp-h2 lp-sub-h1">
              See your month close.
            </h1>
            <p className="lp-sub-lede">
              Thirty minutes, no slides. Last month&rsquo;s charges, your policy or a dozen answers, real verdicts.
            </p>
            <ol className="lp-demo-points">
              {POINTS.map((p, i) => (
                <li key={p.t}>
                  <em>{String(i + 1).padStart(2, "0")}</em>
                  <div>
                    <b>{p.t}</b>
                    <p>{p.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="lp-demo-side">
            <div className="lp-demo-form">
              <DemoForm />
            </div>
            <p className="lp-demo-or">
              <span>or</span>
            </p>
            <a href={DEMO} className="lp-demo-cal">
              <span>
                <b>Or pick a time now</b>
                <small>Thirty minutes, straight onto our calendar.</small>
              </span>
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M4 10h12M11 5l5 5-5 5" />
              </svg>
            </a>
          </div>
        </div>
      </section>
      <Footer sampleNote={false} />
    </main>
  );
}
