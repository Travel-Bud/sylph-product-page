import type { Metadata } from "next";
import "@/components/custom/site/site.css";
import "@/components/custom/site/lab/air/air.css";
import { siteFonts } from "@/components/custom/site/fonts";
import { SiteNav, SmoothScroll, Close, LoopGate } from "@/components/custom/site";
import { AirHero } from "@/components/custom/site/lab/air/air-hero";
import { AirReceipts, AirNext } from "@/components/custom/site/lab/air/air-beats";

export const metadata: Metadata = {
  title: "Sylph lab: Runs on air",
  description: "Direction prototype. Not the live page.",
  robots: { index: false, follow: false },
};

/* Direction board prototype A: "Runs on air" with the spine voice.
   Hero only plus two beats. Nothing here is wired to /fresh. */
export default function AirLabPage() {
  return (
    <main className={`site lab-air ${siteFonts}`} id="main">
      <SmoothScroll>
        <LoopGate />
        <SiteNav watchNight />
        <AirHero />
        <AirReceipts />
        <AirNext />
        <Close />
      </SmoothScroll>
    </main>
  );
}
