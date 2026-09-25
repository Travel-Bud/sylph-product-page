import type { Metadata } from "next";
import { siteFonts } from "@/components/custom/site/fonts";
import "@/components/custom/mock/c/dep.css";
import { SidesScroll } from "@/components/custom/v2-sides/scroll";
import { DepNav, DepHero } from "@/components/custom/mock/c/hero";
import { DepRules } from "@/components/custom/mock/c/rules";
import { DepBooked } from "@/components/custom/mock/c/pass";
import { DepRoad } from "@/components/custom/mock/c/road";
import { DepStamps } from "@/components/custom/mock/c/stamps";
import { DepArrivals } from "@/components/custom/mock/c/arrivals";
import { DepFolio } from "@/components/custom/mock/c/folio";
import { DepClose } from "@/components/custom/mock/c/close";
import { DepReveal } from "@/components/custom/mock/c/reveal";
import { MockSwitch } from "@/components/custom/mock/shared/switch";

/* Mock C, "Departures" (docs/plans/2026-09-25-mock-c/NOTES.md): travel and expense told the way a trip is
   told. Priya's Denver site visit as an itinerary, in the paperwork of airports: a departures board, the
   rules as signage, a boarding pass, a route map, passport stamps, an arrivals board and a hotel folio. */
export const metadata: Metadata = {
  title: "Sylph: every charge on the trip, checked as it happens",
  description:
    "Book the flight in Sylph and every card charge on the road gets an answer that names its rule. Finance sees only the exceptions. At month end the report is already there.",
};

/* Before first paint, when motion is allowed, the hero board starts blank so its flaps can drum in
   without the finished board flashing first. The rule goes into <head>, which React leaves alone, and its
   animation shows the text anyway after 2.5s if script never arrives. */
const PREPAINT = `try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches){var s=document.createElement("style");s.textContent=".board--dep:not(.is-live) .fl>span{color:transparent;animation:dep-unhide 0s 2.5s forwards}";document.head.appendChild(s)}}catch(e){}`;

export default function DeparturesPage() {
  return (
    <main className={`dep ${siteFonts}`} id="main">
      <script dangerouslySetInnerHTML={{ __html: PREPAINT }} />
      <a href="#top" className="dep-skip">
        Skip to content
      </a>
      <SidesScroll />
      <DepReveal />
      <DepNav />
      <DepHero />
      <DepRules />
      <DepBooked />
      <DepRoad />
      <DepStamps />
      <DepArrivals />
      <DepFolio />
      <DepClose />
      <MockSwitch current="C" />
    </main>
  );
}
