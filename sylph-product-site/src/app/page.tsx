import type { Metadata } from "next";
import { siteFonts } from "@/components/custom/site/fonts";
/* site.css styles the reused bento panels; every rule in it is scoped to .site (plus two html
   rules for Lenis, which this page mounts through SidesScroll), so it only reaches the .site wrappers inside tiles. */
import "@/components/custom/site/site.css";
import "@/components/custom/v2-sides/sides.css";
import { SidesNav } from "@/components/custom/v2-sides/nav";
import { SidesHero } from "@/components/custom/v2-sides/hero";
import { Receipts, Policy, Verdicts, Desk, MonthEnd, Seam } from "@/components/custom/v2-sides/chapters";
import { Questions, SidesClose, SidesFooter } from "@/components/custom/v2-sides/closing";
import { Reveal } from "@/components/custom/v2-sides/reveal";
import { SidesScroll } from "@/components/custom/v2-sides/scroll";
import { Courier } from "@/components/custom/v2-sides/courier";
import { YourMonth } from "@/components/custom/v2-sides/your-month";

/* The landing: "Two sides" (direction C of the 2026-09-22 V2 exploration, promoted to the root the same day;
   docs/plans/2026-09-22-landing-v2-directions.md). The social card is app/opengraph-image.jpg. */
const TITLE = "Sylph: one charge, two people, nothing to chase";
const DESCRIPTION =
  "The person who spent it texts a receipt and gets an answer that names the rule. The person who closes the books sees only the exceptions. At month end the report is already there. Works on the cards and banks you already use.";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sylph-product.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { title: TITLE, description: DESCRIPTION, siteName: "Sylph", type: "website", url: "/" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#org`,
      name: "Sylph",
      url: SITE_URL,
      description: "AI-native corporate travel and expense management.",
      slogan: "Expenses run on air.",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Sylph",
      description: DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#org` },
    },
  ],
};

export default function LandingPage() {
  return (
    <main className={`v2s ${siteFonts}`} id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <a href="#top" className="v2s-skip">
        Skip to content
      </a>
      <SidesScroll />
      <Reveal />
      <SidesNav />
      <SidesHero />
      {/* between scenes, a seam the charge crosses (round 6) */}
      <Seam leg={0} />
      <Receipts />
      <Seam leg={1} />
      <Policy />
      <Seam leg={2} />
      <Verdicts />
      <Seam leg={3} />
      <Desk />
      <Seam leg={4} />
      <MonthEnd />
      <YourMonth />
      <Questions />
      <SidesClose />
      <SidesFooter sampleNote />
      {/* last: its effect runs after the chapters' and cast's listeners exist */}
      <Courier />
    </main>
  );
}
