import type { Metadata } from "next";
import { Landing } from "@/components/custom/landing/landing";

/* The landing (2026-10-05 redesign, components/custom/landing; docs/plans/2026-10-05-landing-redesign.md).
   The social card is app/opengraph-image.jpg. */
const TITLE = "Sylph: the expense policy that enforces itself";
const DESCRIPTION =
  "Write your travel and expense policy once, in plain English. Sylph checks every receipt, card swipe and booking against it, and shows finance only what breaks a rule. Works with the cards and banks you already use.";

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
    <Landing>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
    </Landing>
  );
}
