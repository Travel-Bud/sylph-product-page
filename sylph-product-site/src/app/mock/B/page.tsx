import type { Metadata } from "next";
import { siteFonts } from "@/components/custom/site/fonts";
import "@/components/custom/site/site.css";
import "@/components/custom/v2-sides/sides.css";
import "@/components/custom/mock/b/b.css";
import { SidesHero } from "@/components/custom/v2-sides/hero";
import { SidesFooter } from "@/components/custom/v2-sides/closing";
import { Reveal } from "@/components/custom/v2-sides/reveal";
import { SidesScroll } from "@/components/custom/v2-sides/scroll";
import { YourMonth } from "@/components/custom/v2-sides/your-month";
import { MbNav } from "@/components/custom/mock/b/nav";
import { Receipts, Policy, Verdicts, Desk, MonthEnd } from "@/components/custom/mock/b/chapters";
import { Handoff, Edge } from "@/components/custom/mock/b/handoff";
import { MbQuestions, MbClose } from "@/components/custom/mock/b/tail";
import { MbCourier, MbNavTint } from "@/components/custom/mock/b/courier";
import { MockSwitch } from "@/components/custom/mock/shared/switch";

/* Mock B, "Two sides, upgraded" (docs/plans/2026-09-25-mock-b/NOTES.md): the live landing, kept and
   refined. Same story, cast, chapters, panels and words; the 360px seams become short handoff bands the
   charge is carried across, each chapter gets its own composition and a ground tied to its person or its
   verdicts, and the tail is given the same grounds. */
export const metadata: Metadata = {
  title: "Sylph: one charge, two people, nothing to chase (Two sides, upgraded)",
  description:
    "The person who spent it texts a receipt and gets an answer that names the rule. The person who closes the books sees only the exceptions. At month end the report is already there.",
};

/* the grounds, in page order (b.css carries the same values as custom properties) */
const G = {
  heroP: "#f1f6fc",
  heroD: "#f7f4fc",
  priya: "#eaf1fb",
  policy: "#f3effb",
  answer: "#12294a",
  desk: "#ebe4f8",
  deep: "#0b5f44",
  mint: "#e3f4ec",
  asks: "#f3effb",
};

export default function MockBPage() {
  return (
    <main className={`v2s mb ${siteFonts}`} id="main">
      <a href="#top" className="v2s-skip">
        Skip to content
      </a>
      <SidesScroll />
      <Reveal />
      <MbNav />
      <SidesHero />
      <Handoff
        leg={0}
        to="priya"
        top={G.heroP}
        split={G.heroD}
        bottom={G.priya}
        title="The photo"
        out="Both sides, one charge"
        into="Sat Sep 12, 7:52 pm, Denver"
      />
      <Receipts />
      <Handoff
        leg={1}
        to="dana"
        top={G.priya}
        bottom={G.policy}
        title="The rule"
        out="Matched to card 4417"
        into="Rule M-041 is already waiting"
      />
      <Policy />
      <Handoff
        leg={2}
        to="priya"
        top={G.policy}
        bottom={G.answer}
        darkBottom
        title="The answer"
        out="M-041: $9.20 over the $75 dinner cap"
        into="Back on Priya's phone"
      />
      <Verdicts />
      <Handoff
        leg={3}
        to="dana"
        top={G.answer}
        bottom={G.desk}
        darkTop
        title="The desk"
        out="Needs a note. She writes one."
        into="Dana's queue, with her note"
      />
      <Desk />
      <Handoff
        leg={4}
        to="both"
        top={G.desk}
        bottom={G.deep}
        darkBottom
        title="Month end"
        out="Approved by Dana"
        into="Line 3 of the September report"
      />
      <MonthEnd />
      <Edge to="dana" top={G.deep} bottom={G.mint} />
      <YourMonth />
      <Edge to="dana" top={G.mint} bottom={G.asks} />
      <MbQuestions />
      <Edge to="half" top={G.asks} bottom={G.priya} />
      <MbClose />
      <SidesFooter sampleNote />
      <MbCourier />
      <MbNavTint />
      <MockSwitch current="B" />
    </main>
  );
}
