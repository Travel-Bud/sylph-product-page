import type { Metadata } from "next";
import { siteFonts } from "@/components/custom/site/fonts";
import { DropNav } from "@/components/custom/lab/drop/nav";
import { DropStage } from "@/components/custom/lab/drop/board";
import { DropClose, DropFooter, GatesScene, MatchScene, MonthScene, SameScene } from "@/components/custom/lab/drop/scenes";
import "@/components/custom/lab/drop/drop.css";

/* /lab/drop, "Same path": the travelling charge becomes a toy. The visitor drops one of Priya's
   receipts through the policy, built as a board of gates, and it lands in the same bin every time.
   docs/plans/2026-09-22-landing-v2/explore/drop/NOTES.md */
export const metadata: Metadata = {
  title: "Sylph: every charge sorts itself",
  description:
    "Sylph compiles your spend policy into rules a person approves and checks every card charge against them. Drop a charge through the rules: same charge, same path, same answer.",
};

export default function DropPage() {
  return (
    <main className={`dp ${siteFonts}`} id="main">
      <a href="#board" className="dp-skip">
        Skip to the board
      </a>
      <DropNav />
      <section className="dp-hero" aria-labelledby="dp-h1">
        <div className="dp-wrap">
          <DropStage
            intro={
              <div className="dp-intro">
                <h1 id="dp-h1" className="dp-h1">
                  <span>Every charge sorts itself.</span> <span className="dp-h1-b">Only the exceptions reach you.</span>
                </h1>
                <p className="dp-lede dp-hero-lede">
                  Sylph compiles your spend policy into rules a person approves, then checks every card charge as it
                  happens. Receipts find their own charge. Exceptions arrive with the rule that caught them, and the
                  rest files itself into the month-end report.
                </p>
                <p className="dp-try">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" />
                  </svg>
                  <span>
                    Drop one of Priya&rsquo;s receipts through the policy. Then drop it again: same path, same bin.
                  </span>
                </p>
              </div>
            }
          />
        </div>
      </section>
      <GatesScene />
      <MatchScene />
      <SameScene />
      <MonthScene />
      <DropClose />
      <DropFooter />
    </main>
  );
}
