import type { Metadata } from "next";
import "@/components/custom/site/site.css";
import { siteFonts, faceFrom } from "@/components/custom/site/fonts";
import { SiteNav, SiteFooter, SmoothScroll, Hero, Bento, Next, Close, LoopGate } from "@/components/custom/site";
import { ReceiptJourney } from "@/components/custom/site/receipt-journey";
import { How } from "@/components/custom/site/how";

const TITLE = "Sylph: your policy, enforced on every charge";
const DESCRIPTION =
  "Sylph turns your travel and expense policy into rules, then checks every card charge, receipt and booking against them. Deterministic verdicts that cite the rule, the threshold and the amount. Works with the cards and banks you already use.";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sylph-product.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/fresh" },
  robots: { index: false, follow: false },
  openGraph: { title: TITLE, description: DESCRIPTION, siteName: "Sylph", type: "website", url: "/fresh" },
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

/* `?face=onest` switches the page voice for the type A/B (Familjen is the default). */
export default async function LandingPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const face = faceFrom((await searchParams).face);
  return (
    <main className={`site ${siteFonts}`} id="main" data-face={face}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <a href="#hero" className="skip">
        Skip to content
      </a>
      <SmoothScroll>
        <LoopGate />
        <SiteNav watchNight />
        <Hero />
        <ReceiptJourney />
        <Bento />
        <How />
        <Next />
        <Close />
        <SiteFooter sampleNote />
      </SmoothScroll>
    </main>
  );
}
