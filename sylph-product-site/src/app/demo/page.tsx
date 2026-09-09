import type { Metadata } from "next";
import "@/components/custom/site/site.css";
import { siteFonts } from "@/components/custom/site/fonts";
import { SiteNav, SiteFooter, SmoothScroll } from "@/components/custom/site";
import { Check } from "@/components/custom/site/icons";
import { DemoForm } from "./demo-form";

export const metadata: Metadata = {
  title: "Book a Sylph demo",
  description:
    "A thirty-minute walkthrough on last month's charges, with or without a policy document: the rules Sylph checks, the verdicts it gives, and how the month closes with only the exceptions left to review.",
};

const POINTS = [
  {
    t: "Your policy, written or built",
    d: "Your PDF, or your answers to a dozen questions, becomes a ruleset you can read.",
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
    <main className={`site ${siteFonts}`} id="main">
      <a href="#lead" className="skip">
        Skip to content
      </a>
      <SmoothScroll>
      <SiteNav />
      <section className="lead" id="lead">
        <div className="wrap lead-grid">
          <div className="lead-copy">
            <h1 className="h1 h1-sm">See your month close.</h1>
            <p className="lede">
              Thirty minutes, no slides. Last month&rsquo;s charges, your policy or a dozen answers, real verdicts.
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
