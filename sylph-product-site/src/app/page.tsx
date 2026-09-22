import type { Metadata } from "next";
import "@/components/custom/site/site.css";
import { siteFonts } from "@/components/custom/site/fonts";
import { SiteNav, SiteFooter, SmoothScroll, Hero, Bento, Held, Start, Next, Close, LoopGate } from "@/components/custom/site";
import { ReceiptJourney } from "@/components/custom/site/receipt-journey";
import { How } from "@/components/custom/site/how";

const TITLE = "Sylph: stop chasing receipts";
const DESCRIPTION =
  "Every card charge finds its receipt, gets checked against your rules and lands on the report, coded and ready for your accountant. No policy document needed to start. Works with the cards and banks you already use.";

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
    <main className={`site ${siteFonts}`} id="main">
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
        <Held />
        <Start />
        <How />
        <Next />
        <Close />
        <SiteFooter sampleNote />
      </SmoothScroll>
    </main>
  );
}
