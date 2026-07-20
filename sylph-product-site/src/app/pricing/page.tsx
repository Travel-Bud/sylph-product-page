import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import "@/components/custom/landing/landing.css";
import { LandingNav, LandingFooter } from "@/components/custom/landing";
import { landingFonts } from "@/components/custom/landing/fonts";

export const metadata: Metadata = {
  title: "Pricing · Sylph",
  description:
    "Per-employee pricing for Sylph's AI-native travel & expense platform. Every plan includes automated receipt matching, currency normalization, and deterministic policy enforcement.",
};

const tiers = [
  {
    name: "Small Business",
    price: "$30",
    period: "per employee / month",
    description: "Full compliance automation for teams under 100 employees.",
    highlighted: true,
    features: [
      "Up to 100 employees",
      "AI receipt extraction (photos, scans, multi-page PDFs)",
      "Deterministic rule engine (nested AND/OR)",
      "Receipt-to-charge matching",
      "Currency normalization",
      "Real-time enforcement verdicts",
      "Duplicate detection",
      "Audit-ready PDF reports",
      "Email support",
    ],
  },
  {
    name: "Mid-Size",
    price: "$40",
    period: "per employee / month",
    description: "Enhanced capabilities for growing organizations.",
    highlighted: false,
    features: [
      "100-1,000 employees",
      "Everything in Small Business",
      "Policy-PDF → drafted rules",
      "Priority support",
      "Audit log & compliance reports",
      "Dedicated onboarding",
    ],
  },
  {
    name: "Large Enterprise",
    price: "Custom",
    period: "",
    description: "Dedicated service for 1,000+ employees.",
    highlighted: false,
    features: [
      "1,000+ employees",
      "Everything in Mid-Size",
      "Dedicated account manager",
      "Custom integrations",
      "Volume discounts",
    ],
  },
];

export default function PricingPage() {
  return (
    <main className={`sylph-lp ${landingFonts}`}>
      <LandingNav />

      <section className="band band--tight" style={{ paddingBottom: "clamp(28px,4vw,48px)" }}>
        <div className="wrap" style={{ textAlign: "center" }}>
          <span className="kicker" style={{ justifyContent: "center" }}>
            <span className="tick" />
            Pricing
          </span>
          <h1
            style={{
              fontSize: "clamp(2.2rem, 1.5rem + 2.4vw, 3.4rem)",
              letterSpacing: "-0.02em",
              marginTop: 18,
            }}
          >
            Simple, per-employee pricing.
          </h1>
          <p
            style={{
              margin: "18px auto 0",
              maxWidth: "56ch",
              fontSize: "1.1rem",
              color: "var(--ink-body)",
            }}
          >
            Scale as your team grows. Every plan includes automated receipt matching, currency
            normalization, and deterministic policy enforcement, so finance reviews exceptions, not expenses.
          </p>
        </div>
      </section>

      <section className="band band--paper band-top-rule" style={{ paddingTop: "clamp(40px,5vw,64px)" }}>
        <div className="wrap">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 20,
              alignItems: "stretch",
            }}
          >
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className="card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: 28,
                  position: "relative",
                  borderColor: tier.highlighted ? "var(--pine-mist)" : "var(--line-warm)",
                  boxShadow: tier.highlighted ? "var(--shadow-lg)" : "var(--shadow-sm)",
                }}
              >
                {tier.highlighted && (
                  <span
                    className="badge b-dot"
                    style={{
                      position: "absolute",
                      top: -12,
                      left: "50%",
                      transform: "translateX(-50%)",
                      whiteSpace: "nowrap",
                      background: "var(--card)",
                      borderColor: "var(--pine-mist)",
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    Most popular
                  </span>
                )}
                <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>{tier.name}</h3>
                <div style={{ marginTop: 16, display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span
                    style={{ fontFamily: "var(--serif)", fontSize: "2.5rem", fontWeight: 440, letterSpacing: "-0.02em", color: "var(--ink-warm)", fontVariantNumeric: "tabular-nums" }}
                  >
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span style={{ fontSize: ".85rem", color: "var(--ink-body-2)" }}>{tier.period}</span>
                  )}
                </div>
                <p style={{ marginTop: 12, fontSize: ".92rem", color: "var(--ink-body)" }}>{tier.description}</p>

                <div style={{ height: 1, background: "var(--line-hair)", margin: "20px 0" }} />

                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 11, flex: 1 }}>
                  {tier.features.map((feature) => (
                    <li key={feature} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: ".9rem", color: "var(--ink-body)" }}>
                      <Check className="h-4 w-4" style={{ marginTop: 2, flex: "none", color: "var(--pine)" }} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/demo"
                  className={`btn btn-lg ${tier.highlighted ? "btn-primary" : "btn-ghost"}`}
                  style={{ marginTop: 24, width: "100%" }}
                >
                  {tier.name === "Large Enterprise" ? "Contact sales" : "Book a demo"}
                </Link>
              </div>
            ))}
          </div>

          <p style={{ marginTop: 28, fontSize: 12.5, color: "var(--ink-muted)", textAlign: "center" }}>
            All plans are billed per active employee. Figures and capabilities are subject to change before
            general availability.
          </p>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}
