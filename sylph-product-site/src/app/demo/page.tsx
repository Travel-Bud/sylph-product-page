import type { Metadata } from "next";
import "@/components/custom/landing/landing.css";
import { LandingNav, LandingFooter } from "@/components/custom/landing";
import { landingFonts } from "@/components/custom/landing/fonts";
import { DemoForm } from "./demo-form";

export const metadata: Metadata = {
  title: "Book a demo · Sylph",
  description:
    "See Sylph clear an expense report in real time: receipts match to charges, currency normalizes, and policy enforces automatically. Book a 30-minute walkthrough on your own policy.",
};

export default function DemoPage() {
  return (
    <main className={`sylph-lp ${landingFonts}`}>
      <LandingNav />

      <section className="band band--tight">
        <div className="wrap">
          <div className="demo-grid">
            <div className="demo-lead">
              <span className="kicker">
                <span className="tick" />
                Book a demo
              </span>
              <h1>See Sylph clear a report in real time.</h1>
              <p className="lede">
                A focused 30-minute walkthrough on your own travel policy. We&rsquo;ll show how a receipt
                matches its charge, normalizes currency, and gets a cited verdict, so finance reviews
                exceptions, not expenses.
              </p>
              <ul className="demo-points">
                <li>
                  <span className="ic">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M5 12l4 4L19 6" />
                    </svg>
                  </span>
                  <div>
                    <b>Your policy, drafted into rules.</b>
                    <p>Bring a policy PDF and watch Sylph turn it into a reviewable condition tree.</p>
                  </div>
                </li>
                <li>
                  <span className="ic">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M5 12l4 4L19 6" />
                    </svg>
                  </span>
                  <div>
                    <b>The enforcement &ldquo;aha&rdquo;.</b>
                    <p>See a flagged dinner earn its verdict: rule, threshold, and amount, every time.</p>
                  </div>
                </li>
                <li>
                  <span className="ic">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M5 12l4 4L19 6" />
                    </svg>
                  </span>
                  <div>
                    <b>The finance-review surface.</b>
                    <p>How the clean ~90% clears automatically and only the exceptions reach your queue.</p>
                  </div>
                </li>
              </ul>
            </div>

            <DemoForm />
          </div>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}
