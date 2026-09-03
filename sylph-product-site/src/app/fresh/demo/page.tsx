import type { Metadata } from "next";
import "@/components/custom/site/site.css";
import { siteFonts } from "@/components/custom/site/fonts";
import { SiteNav, SiteFooter, SmoothScroll } from "@/components/custom/site";
import { Check } from "@/components/custom/site/icons";
import { DemoForm } from "./demo-form";

export const metadata: Metadata = {
  title: "Book a Sylph demo",
  description:
    "A thirty-minute walkthrough on your own travel and expense policy: the rules it becomes, the verdicts it gives, and how finance reviews exceptions instead of expenses.",
};

const POINTS = [
  {
    t: "Your policy, drafted into rules",
    d: "Your PDF becomes a ruleset you can read, every rule quoting its sentence.",
  },
  {
    t: "A verdict you can check",
    d: "A flagged dinner earns its citation: rule, threshold, amount.",
  },
  {
    t: "The review surface",
    d: "Cleared lines file themselves. Only the exceptions reach you.",
  },
];

export default function DemoPage() {
  return (
    <main className={`site ${siteFonts}`}>
      <SmoothScroll>
      <SiteNav />
      <section className="lead">
        <div className="wrap lead-grid">
          <div className="lead-copy">
            <p className="eyebrow">Book a demo</p>
            <h1 className="h1 h1-sm">See Sylph clear a report on your own policy.</h1>
            <p className="lede">
              Thirty minutes, no slides. Your policy, a month of sample charges, real verdicts.
            </p>
            <ul className="lead-points">
              {POINTS.map((p) => (
                <li key={p.t}>
                  <span className="lead-ic" aria-hidden="true">
                    <Check />
                  </span>
                  <div>
                    <b>{p.t}</b>
                    <p>{p.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <DemoForm />
        </div>
      </section>
      <SiteFooter />
      </SmoothScroll>
    </main>
  );
}
