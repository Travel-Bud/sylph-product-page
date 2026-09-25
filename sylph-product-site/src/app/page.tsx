import type { Metadata } from "next";
import { UpgradedLanding } from "@/components/custom/mock/b/landing";

/* The landing: "Two sides" (direction C of the 2026-09-22 V2 exploration, promoted to the root the same day;
   docs/plans/2026-09-22-landing-v2-directions.md), upgraded on 2026-09-25 to Mock B (components/custom/mock/b,
   docs/plans/2026-09-25-mock-b/NOTES.md). The social card is app/opengraph-image.jpg. */
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
    <UpgradedLanding>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
    </UpgradedLanding>
  );
}
