import type { Metadata } from "next";
import "@/components/custom/site/site.css";
import { siteFonts } from "@/components/custom/site/fonts";
import { SiteNav, SiteFooter, SmoothScroll, Hero, Bento, Next, Close, LoopGate } from "@/components/custom/site";

const TITLE = "Sylph: your policy, enforced on every charge";
const DESCRIPTION =
  "Sylph turns your travel and expense policy into rules, then checks every card charge, receipt and booking against them. Deterministic verdicts that cite the rule, the threshold and the amount. Works with the cards and banks you already use.";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sylph.ai";

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

export default function LandingPage() {
  return (
    <main className={`site ${siteFonts}`} id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <a href="#hero" className="skip">
        Skip to content
      </a>
      <SmoothScroll>
        <LoopGate />
        <SiteNav watchNight />
        <Hero />
        <Bento />
        <Next />
        <Close />
        <SiteFooter sampleNote />
      </SmoothScroll>
    </main>
  );
}
