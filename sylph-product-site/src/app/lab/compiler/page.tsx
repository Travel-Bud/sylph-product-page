import type { Metadata } from "next";
import Link from "next/link";
import { siteFonts } from "@/components/custom/site/fonts";
import { Mark } from "@/components/custom/site/mark";
import { APP_LOGIN, DEMO, PRICING } from "@/components/custom/site/anchors";
import { CxNav } from "@/components/custom/lab/compiler/nav";
import { PolicyProvider } from "@/components/custom/lab/compiler/store";
import { Editor } from "@/components/custom/lab/compiler/editor";
import { BeforeRules, CompileTime, MonthEnd, StartScene } from "@/components/custom/lab/compiler/scenes";
import "@/components/custom/lab/compiler/compiler.css";
import "@/components/custom/lab/compiler/scenes.css";

/* /lab/compiler, "Compiled": the page is a policy editor. The policy is the protagonist; the
   visitor edits it and watches a sample week recompile and re-verdict, each verdict citing its line.
   docs/plans/2026-09-22-landing-v2/explore/compiler/NOTES.md */
export const metadata: Metadata = {
  title: "Sylph: your policy, compiled",
  description:
    "Sylph compiles your spend policy into rules a person approves, then checks every card charge against them. Every verdict cites the line that produced it.",
};

export default function CompilerPage() {
  return (
    <main className={`cx ${siteFonts}`} id="main">
      <a href="#editor" className="cx-skip">
        Skip to the editor
      </a>
      <CxNav />
      <PolicyProvider>
        <section className="cx-hero" id="editor" aria-labelledby="cx-h1">
          <div className="cx-wrap">
            <div className="cx-hero-head">
              <h1 id="cx-h1">Your policy, compiled.</h1>
              <div className="cx-hero-side">
                <p>
                  Sylph turns your spend policy into rules a person approves, then checks every card charge against
                  them. Every verdict cites the line it came from.
                </p>
                <div className="cx-hero-cta">
                  <Link href={DEMO} className="cx-btn cx-btn--ink cx-btn--lg">
                    Book a demo
                  </Link>
                  <span className="cx-hero-try">Edit the policy below and watch the week answer.</span>
                </div>
              </div>
            </div>
            <Editor />
          </div>
        </section>
        <CompileTime />
        <BeforeRules />
        <MonthEnd />
        <StartScene />
      </PolicyProvider>

      <section className="cx-close" aria-labelledby="cx-close-h">
        <div className="cx-wrap cx-close-in">
          <h2 id="cx-close-h">
            Write the policy once. <span>Every charge answers to it.</span>
          </h2>
          <div>
            <p className="cx-price">
              <b>$30</b> per active employee a month
            </p>
            <div className="cx-close-cta">
              <Link href={DEMO} className="cx-btn cx-btn--bone cx-btn--lg">
                Book a demo
              </Link>
              <Link href={PRICING} className="cx-close-link">
                See pricing
              </Link>
            </div>
            <ul className="cx-close-fine">
              <li>Works on the cards and banks you already use. Nothing to switch.</li>
              <li>Set up the same day, from the policy you already have or a dozen answers.</li>
              <li>Policies and receipts are encrypted in transit and at rest, and never used to train models.</li>
            </ul>
          </div>
        </div>
      </section>
      <footer className="cx-foot-site">
        <div className="cx-wrap cx-foot-in">
          <Link href="/" className="cx-brand">
            <Mark className="cx-mark" />
            <span>Sylph</span>
          </Link>
          <span>Expenses run on air. A Janus Labs product.</span>
          <nav aria-label="Footer">
            <Link href={PRICING}>Pricing</Link>
            <Link href={DEMO}>Book a demo</Link>
            <a href={APP_LOGIN}>Log in</a>
            <a href="/privacy">Privacy</a>
            <Link href="/terms">Terms</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
