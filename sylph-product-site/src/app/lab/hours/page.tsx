import type { Metadata } from "next";
import { siteFonts } from "@/components/custom/site/fonts";
import "@/components/custom/site/site.css";
import "@/components/custom/v2-sides/sides.css";
import "@/components/custom/lab/hours/hours.css";
import { SidesNav } from "@/components/custom/v2-sides/nav";
import { SidesHero } from "@/components/custom/v2-sides/hero";
import { Receipts, Policy, Verdicts, Desk, MonthEnd } from "@/components/custom/v2-sides/chapters";
import { Questions, SidesClose, SidesFooter } from "@/components/custom/v2-sides/closing";
import { Reveal } from "@/components/custom/v2-sides/reveal";
import { SidesScroll } from "@/components/custom/v2-sides/scroll";
import { YourMonth } from "@/components/custom/v2-sides/your-month";
import { HoursRefresh } from "@/components/custom/lab/hours/passage";
import { DuskPassage } from "@/components/custom/lab/hours/p1-dusk";
import { PagePassage } from "@/components/custom/lab/hours/p2-page";
import { PlanePassage } from "@/components/custom/lab/hours/p3-plane";
import { DawnPassage } from "@/components/custom/lab/hours/p4-dawn";
import { MonthPassage } from "@/components/custom/lab/hours/p5-month";
import { AirClose } from "@/components/custom/lab/hours/close";

/* Lab direction "Hours" (docs/plans/2026-09-25-landing-hours/README.md): the Two sides landing with
   its seams replaced by passages of time, each chapter on the ground of the hour it happens in. The
   courier is not mounted here; the passages carry the charge and dispatch its arrivals. */
export const metadata: Metadata = {
  title: "Sylph: one charge, two people, the hours between",
  description:
    "The person who spent it texts a receipt and gets an answer that names the rule. The person who closes the books sees only the exceptions. At month end the report is already there.",
};

export default function HoursPage() {
  return (
    <main className={`v2s hrs ${siteFonts}`} id="main">
      <a href="#top" className="v2s-skip">
        Skip to content
      </a>
      <SidesScroll />
      <Reveal />
      <SidesNav />
      <SidesHero />
      <DuskPassage />
      <Receipts />
      <PagePassage />
      <Policy />
      <PlanePassage />
      <Verdicts />
      <DawnPassage />
      <Desk />
      <MonthPassage />
      <MonthEnd />
      <YourMonth />
      <Questions />
      <AirClose>
        <SidesClose />
      </AirClose>
      <SidesFooter sampleNote />
      <HoursRefresh />
    </main>
  );
}
