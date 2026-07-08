import type { Metadata } from "next";
import "@/components/custom/landing/landing.css";
import { landingFonts } from "@/components/custom/landing/fonts";
import {
  LandingNav,
  HeroSection,
  CaptureSection,
  BookingSection,
  SetupSection,
  InterludeSection,
  BentoSection,
  RecordSection,
  CloseSection,
  LandingFooter,
  SmoothScroll,
} from "@/components/custom/landing";

const TITLE = "Sylph · Stop reviewing expenses. Start reviewing exceptions.";
const DESCRIPTION =
  "Sylph books travel inside your policy, catches receipts on their own (straight from the payment terminal, or by text), and checks every charge as it lands. The routine clears itself; your team reviews only the exceptions. Configured in 15 minutes from your own policy document.";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sylph.ai";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Sylph",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

// Organization + WebSite structured data so the homepage is eligible for rich results.
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
    <main className={`sylph-lp lp-home ${landingFonts}`} id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <a href="#capture" className="lp-skip">
        Skip to how it works
      </a>
      <SmoothScroll>
        <LandingNav overDark />

        {/* Night: the aurora, the pillar, the wind doing its work. */}
        <HeroSection />

        {/* Light body walks the claim: capture, booking, setup, one photographic
            exhale (the traveler's viewport), the rest, record. */}
        <CaptureSection />
        <BookingSection />
        <SetupSection />
        <InterludeSection />
        <BentoSection />
        <RecordSection />

        {/* The night returns: close + footer share one frame and ONE light —
            the planet's atmosphere below. */}
        <div className="night-frame">
          <div className="nf-glow" aria-hidden="true" />
          <CloseSection />
          <LandingFooter />
        </div>
      </SmoothScroll>
    </main>
  );
}
