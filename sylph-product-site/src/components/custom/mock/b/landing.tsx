import { siteFonts } from "@/components/custom/site/fonts";
import "@/components/custom/site/site.css";
import "@/components/custom/v2-sides/sides.css";
import "./b.css";
import { SidesHero } from "./hero";
import { SidesFooter } from "@/components/custom/v2-sides/closing";
import { Reveal } from "@/components/custom/v2-sides/reveal";
import { SidesScroll } from "@/components/custom/v2-sides/scroll";
import { MbNav } from "./nav";
import { Receipts, Policy, Verdicts, Desk, MonthEnd } from "./chapters";
import { Handoff, Edge } from "./handoff";
import { MbQuestions, MbClose } from "./tail";
import { MbCourier, MbNavTint } from "./courier";

/* The upgraded Two sides landing (Mock B, promoted to / on 2026-09-25; notes in
   docs/plans/2026-09-25-mock-b/NOTES.md). The same story, cast, chapters, panels and words as the
   2026-09-22 page; the seams became short handoff bands the charge is carried across, each chapter has its
   own composition and ground, and the tail shares those grounds. Rendered by / (with the site metadata and
   JSON-LD) and by /mock/B (with the mockup switcher, passed as children). */

/* the grounds, in page order (b.css carries the same values as custom properties) */
const G = {
  heroP: "#f1f6fc",
  heroD: "#f7f4fc",
  priya: "#eaf1fb",
  policy: "#f3effb",
  answer: "#12294a",
  desk: "#ebe4f8",
  deep: "#0b5f44",
  asks: "#f3effb",
};

export function UpgradedLanding({ children }: { children?: React.ReactNode }) {
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
      />
      <Receipts />
      <Handoff
        leg={1}
        to="dana"
        top={G.priya}
        bottom={G.policy}
        title="The rule"
      />
      <Policy />
      <Handoff
        leg={2}
        to="priya"
        top={G.policy}
        bottom={G.answer}
        darkBottom
        title="The answer"
      />
      <Verdicts />
      <Handoff
        leg={3}
        to="dana"
        top={G.answer}
        bottom={G.desk}
        darkTop
        title="The desk"
      />
      <Desk />
      <Handoff
        leg={4}
        to="both"
        top={G.desk}
        bottom={G.deep}
        darkBottom
        title="Month end"
      />
      <MonthEnd />
      <Edge to="dana" top={G.deep} bottom={G.asks} />
      <MbQuestions />
      <Edge to="half" top={G.asks} bottom={G.priya} />
      <MbClose />
      <SidesFooter sampleNote />
      <MbCourier />
      <MbNavTint />
      {children}
    </main>
  );
}
