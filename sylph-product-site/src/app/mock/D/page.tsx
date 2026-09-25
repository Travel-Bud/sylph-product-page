import type { Metadata } from "next";
import { siteFonts } from "@/components/custom/site/fonts";
import "@/components/custom/mock/d/sorted.css";
import { DClose, DNav, ShortList, Sorted } from "@/components/custom/mock/d/sections";
import { MockSwitch } from "@/components/custom/mock/shared/switch";

/* Mock D, "The month, sorted" (docs/plans/2026-09-25-mock-d/NOTES.md): a whole sample month as a pile of
   paper slips that sorts itself as the page scrolls, stage by stage on its own colour, until the handful
   Dana has to read is left. */
export const metadata: Metadata = {
  title: "Sylph: the month, sorted",
  description:
    "A month of card charges sorts itself: receipts find their charges, currency converts, duplicates are caught, the rules you approved draw their lines, and finance reads only the exceptions.",
};

export default function SortedPage() {
  return (
    <main className={`md ${siteFonts}`} id="main">
      <a href="#md-h1" className="md-skip">
        Skip to content
      </a>
      <DNav />
      <Sorted />
      <ShortList />
      <DClose />
      <MockSwitch current="D" />
    </main>
  );
}
