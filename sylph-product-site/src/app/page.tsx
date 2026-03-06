import {
  LandingNav,
  HeroSection,
  SystemOverview,
  ProductShowcase,
  HowItWorks,
  FeatureGrid,
  FeatureShowcase,
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
      <TractionMarquee />
      <FeatureGrid />
      <ProductShowcase />
      <FeatureShowcase />
      <SystemOverview />
      <CtaSection />
      <LandingFooter />
    </main>
  );
}
