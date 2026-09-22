import type { Metadata } from "next";
import { siteFonts } from "@/components/custom/site/fonts";
/* site.css styles the reused bento panels; every rule in it is scoped to .site (plus two html
   rules for Lenis, which this page mounts through SidesScroll), so it only reaches the .site wrappers inside tiles. */
import "@/components/custom/site/site.css";
import "@/components/custom/v2-sides/sides.css";
import { SidesNav } from "@/components/custom/v2-sides/nav";
import { SidesHero } from "@/components/custom/v2-sides/hero";
import { Receipts, Policy, Verdicts, Desk, MonthEnd } from "@/components/custom/v2-sides/chapters";
import { Questions, SidesClose, SidesFooter } from "@/components/custom/v2-sides/closing";
import { Reveal } from "@/components/custom/v2-sides/reveal";
import { SidesScroll } from "@/components/custom/v2-sides/scroll";
import { Courier } from "@/components/custom/v2-sides/courier";
import { YourMonth } from "@/components/custom/v2-sides/your-month";

/* Direction C of the landing V2 exploration (docs/plans/2026-09-22-landing-v2-directions.md). */
export const metadata: Metadata = {
  title: "Sylph: one charge, two people, nothing to chase",
  description:
    "The person who spent it texts a receipt and gets an answer that names the rule. The person who closes the books sees only the exceptions. At month end the report is already there.",
  robots: { index: false, follow: false },
};

export default function SidesPage() {
  return (
    <main className={`v2s ${siteFonts}`} id="main">
      <a href="#top" className="v2s-skip">
        Skip to content
      </a>
      <SidesScroll />
      <Reveal />
      <SidesNav />
      <SidesHero />
      <Receipts />
      <Policy />
      <Verdicts />
      <Desk />
      <MonthEnd />
      <YourMonth />
      <Questions />
      <SidesClose />
      <SidesFooter />
      {/* last: its effect runs after the chapters' and cast's listeners exist */}
      <Courier />
    </main>
  );
}
