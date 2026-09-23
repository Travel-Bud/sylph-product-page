import type { Metadata } from "next";
import { siteFonts } from "@/components/custom/site/fonts";
import { newsreader } from "@/components/custom/lab/pile/pile-fonts";
import { PileStory } from "@/components/custom/lab/pile/pile-story";
import { PileClose, PileNav } from "@/components/custom/lab/pile/pile-close";
import "@/components/custom/lab/pile/pile.css";

/* /lab/pile, "The pile": the sample month as a scroll-driven data story (explore run 2026-09-22).
   The explore layout sets noindex. */
export const metadata: Metadata = {
  title: "Sylph: the pile",
  description:
    "A sample month of card charges, sorted: receipts find their charges, currencies convert, duplicates surface, the rules run, and what is left is the handful that needs a person.",
};

export default function PilePage() {
  return (
    <main className={`pl ${siteFonts} ${newsreader.variable}`}>
      <PileNav />
      <PileStory />
      <PileClose />
    </main>
  );
}
