import type { Metadata } from "next";
import { siteFonts } from "@/components/custom/site/fonts";
import { ClipStage } from "./clip-stage";
import "./clip.css";

/* The ten-second clip's composition (docs/plans/2026-09-22-landing-v2/clip/). Not a page for
   visitors: scripts/clip/render.mjs steps it frame by frame over CDP. ?f=45 (1080x1350),
   ?f=169 (1920x1080) or ?f=og (the 1200x630 poster); ?play=1 runs it in real time. */
export const metadata: Metadata = {
  title: "Sylph clip composition",
  robots: { index: false, follow: false },
};

export default function ClipPage() {
  return (
    <main className={`clip ${siteFonts}`}>
      <ClipStage />
    </main>
  );
}
