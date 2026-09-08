import type { Metadata } from "next";
import "@/components/custom/site/site.css";
import "@/components/custom/site/lab/spine/spine.css";
import { siteFonts } from "@/components/custom/site/fonts";
import { SiteNav, SmoothScroll } from "@/components/custom/site";
import { SpineHero, SpineCompile, SpineClose, spineFonts } from "@/components/custom/site/lab/spine";

const TITLE = "Sylph lab: editorial with a spine";
const DESCRIPTION =
  "Hero prototype. A display serif for the headlines, the policy sentence in mono as the recurring image, and one beat where the sentence compiles into a rule and the rule decides a charge.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: false, follow: false },
};

export default function SpineLabPage() {
  return (
    <main className={`site spine ${siteFonts} ${spineFonts}`} id="main">
      <a href="#hero" className="skip">
        Skip to content
      </a>
      <SmoothScroll>
        <SiteNav />
        <SpineHero />
        <SpineCompile />
        <SpineClose />
      </SmoothScroll>
    </main>
  );
}
