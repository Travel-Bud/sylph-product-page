import type { Metadata } from "next";
import { siteFonts } from "@/components/custom/site/fonts";
import "@/components/custom/lab/janus/janus.css";
import { JanusStage } from "@/components/custom/lab/janus/stage";
import { Hero, Beat1, Beat2, Beat3, Beat4, Meet } from "@/components/custom/lab/janus/beats";
import { JanusClose, JanusNav } from "@/components/custom/lab/janus/chrome";

/* Explore direction "janus", Two faces (docs/plans/2026-09-22-landing-v2/explore/janus/NOTES.md).
   The page is split down the middle for its whole length: Priya's face and Dana's face move
   against each other, and the Sushi Kanda charge crosses the seam at every handover. */
export const metadata: Metadata = {
  title: "Sylph: two faces of one charge",
  description:
    "Priya spends it and texts the receipt. Dana closes the books and sees only the exceptions. One charge crosses between them, and at month end the report is already there.",
};

export default function JanusPage() {
  return (
    <main className={`jn ${siteFonts}`} id="main">
      <a className="jn-skip" href="#jn-close">
        Skip to the close
      </a>
      <JanusNav />
      <JanusStage>
        <Hero />
        <Beat1 />
        <Beat2 />
        <Beat3 />
        <Beat4 />
        <Meet />
      </JanusStage>
      <JanusClose />
    </main>
  );
}
