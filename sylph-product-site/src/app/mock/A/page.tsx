import type { Metadata } from "next";
import { siteFonts } from "@/components/custom/site/fonts";
import "@/components/custom/site/site.css";
import "@/components/custom/v2-sides/sides.css";
import "@/components/custom/mock/a/hours.css";
import { SidesNav } from "@/components/custom/v2-sides/nav";
import { SidesHero } from "@/components/custom/v2-sides/hero";
import { Receipts, Policy, Verdicts, Desk, MonthEnd } from "@/components/custom/v2-sides/chapters";
import { Questions, SidesClose, SidesFooter } from "@/components/custom/v2-sides/closing";
import { Reveal } from "@/components/custom/v2-sides/reveal";
import { SidesScroll } from "@/components/custom/v2-sides/scroll";
import { YourMonth } from "@/components/custom/v2-sides/your-month";
import { HoursRefresh } from "@/components/custom/mock/a/passage";
import { DuskPassage } from "@/components/custom/mock/a/p1-dusk";
import { PagePassage } from "@/components/custom/mock/a/p2-page";
import { PlanePassage } from "@/components/custom/mock/a/p3-plane";
import { DawnPassage } from "@/components/custom/mock/a/p4-dawn";
import { MonthPassage } from "@/components/custom/mock/a/p5-month";
import { AirClose } from "@/components/custom/mock/a/close";
import { HoursCourier, HoursNavTint } from "@/components/custom/mock/a/courier";
import { MockSwitch } from "@/components/custom/mock/shared/switch";

/* Mock A, "Hours" (docs/plans/2026-09-25-landing-hours/README.md): the Two sides landing with
   its seams replaced by passages of time, each chapter on the ground of the hour it happens in. Its own
   courier (mock/a/courier.tsx) carries the charge through scenes and chapters alike. */
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
      <HoursCourier />
      <HoursNavTint />
      <MockSwitch current="A" />
    </main>
  );
}
