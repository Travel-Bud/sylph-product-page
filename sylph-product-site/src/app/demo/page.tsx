import type { Metadata } from "next";
import { siteFonts } from "@/components/custom/site/fonts";
import "@/components/custom/v2-sides/sides.css";
import "@/components/custom/v2-sides/pricing.css";
import { SidesNav } from "@/components/custom/v2-sides/nav";
import { SidesFooter } from "@/components/custom/v2-sides/closing";
import { Head } from "@/components/custom/v2-sides/cast";
import { DemoForm } from "./demo-form";

export const metadata: Metadata = {
  title: "Book a Sylph demo",
  description:
    "A thirty-minute walkthrough on last month's charges, with or without a policy document: the rules Sylph checks, the verdicts it gives, and how the month closes with only the exceptions left to review.",
};

/* Each point is seen from the side it serves. */
const POINTS = [
  {
    who: "dana" as const,
    t: "Your policy, written or built",
    d: "Your PDF, or your answers to a dozen questions, becomes a ruleset you can read.",
  },
  {
    who: "priya" as const,
    t: "A verdict you can check",
    d: "A flagged dinner earns its citation: rule, threshold, amount.",
  },
  {
    who: "dana" as const,
    t: "The review surface",
    d: "Cleared lines file themselves. Only the exceptions reach you.",
  },
];

export default function DemoPage() {
  return (
    <main className={`v2s ${siteFonts}`} id="main">
      <a href="#lead" className="v2s-skip">
        Skip to content
      </a>
      <SidesNav />
      <section className="v2d" id="lead" aria-labelledby="demo-t" tabIndex={-1}>
        <div className="v2s-wrap v2d-grid">
          <div className="v2d-copy">
            <h1 id="demo-t" className="v2s-h2 v2s-h2--xl">
              See your month close.
            </h1>
            <p className="v2s-lede">
              Thirty minutes, no slides. Last month&rsquo;s charges, your policy or a dozen answers, real verdicts.
            </p>
            <ul className="v2d-points">
              {POINTS.map((p) => (
                <li key={p.t}>
                  <Head who={p.who} size={40} />
                  <div>
                    <b>{p.t}</b>
                    <p>{p.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {/* the wired lead form, unchanged (repo rule); pricing.css styles it under .v2d-form */}
          <div className="v2d-form">
            <DemoForm />
          </div>
        </div>
      </section>
      <SidesFooter />
    </main>
  );
}
