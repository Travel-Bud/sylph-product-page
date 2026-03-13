import {
  LandingNav,
  HeroSection,
  SystemOverview,
  StickyProductReveal,
  HowItWorks,
  FeatureGrid,
  FeatureShowcase,
  ComparisonSection,
  CtaSection,
  LandingFooter,
} from "@/components/custom/landing";
import { TractionMarquee } from "@/components/custom/landing/traction-marquee";

export default function LandingPage() {
  return (
    <main className="relative w-full overflow-clip">
      <div className="grain-overlay" />
      <LandingNav />
      <HeroSection />
      <HowItWorks />
      <ComparisonSection />
      <TractionMarquee />
      <FeatureGrid />
      <StickyProductReveal />
      <FeatureShowcase />
      <SystemOverview />
      <CtaSection />
      <LandingFooter />
    </main>
  );
}
