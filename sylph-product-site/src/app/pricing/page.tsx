import type { Metadata } from "next";
import Link from "next/link";
import "@/components/custom/site/site.css";
import { siteFonts } from "@/components/custom/site/fonts";
import { SiteNav, SiteFooter, SmoothScroll } from "@/components/custom/site";
import { DEMO } from "@/components/custom/site/anchors";

export const metadata: Metadata = {
  title: "Sylph pricing",
  description:
    "Per-employee pricing for Sylph. Every plan includes receipt matching, currency normalization, deterministic policy enforcement and audit-grade reports.",
};

const TIERS = [
  {
    name: "Small business",
    price: "$30",
    period: "per active employee, per month",
    description: "Policy enforcement and receipt matching for teams up to 100 employees.",
    highlighted: true,
    features: [
      "Up to 100 employees",
      "Receipt reading: photos, scans, multipage PDFs",
      "Deterministic rule engine with nested conditions",
      "Receipt to charge matching",
      "Currency normalization",
      "Verdicts as charges land",
      "Duplicate detection",
      "Audit-grade PDF reports",
      "Email support",
    ],
  },
  {
    name: "Mid-size",
    price: "$40",
    period: "per active employee, per month",
    description: "Adds the audit log, dedicated onboarding and priority support, for 101 to 1,000 employees.",
    highlighted: false,
    features: [
      "101 to 1,000 employees",
      "Everything in Small business",
      "Policy PDF drafted into rules",
      "Priority support",
      "Audit log and compliance reports",
      "Dedicated onboarding",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Dedicated service for more than 1,000 employees.",
    highlighted: false,
    features: ["More than 1,000 employees", "Everything in Mid-size", "Dedicated account manager", "Custom integrations", "Volume discounts"],
  },
];

export default function PricingPage() {
  return (
    <main className={`site ${siteFonts}`}>
      <SmoothScroll>
      <SiteNav />
      <section className="lead lead-center">
        <div className="wrap">
          <h1 className="h1 h1-sm">Simple pricing, per employee.</h1>
          <p className="lede">
            Every plan includes matching, currency normalization and deterministic enforcement. Booking
            carries no markup on any plan.
          </p>
        </div>
      </section>
      <section className="sec sec--band tiers-sec">
        <div className="wrap">
          <ul className="tiers">
            {TIERS.map((t) => (
              <li key={t.name} className={`tier${t.highlighted ? " is-hi" : ""}`}>
                
                <h2 className="h3">{t.name}</h2>
                <div className="tier-price">
                  <span className="num">{t.price}</span>
                  {t.period && <span className="tier-period">{t.period}</span>}
                </div>
                <p className="tier-desc">{t.description}</p>
                <ul className="tier-features">
                  {t.features.map((f) => (
                    <li key={f}>
                      <span className="tier-mark" aria-hidden="true" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={DEMO} className={`btn btn-lg ${t.highlighted ? "btn-primary" : "btn-secondary"}`}>
                  {t.name === "Enterprise" ? "Contact sales" : "Book a demo"}
                </Link>
              </li>
            ))}
          </ul>
          <p className="tiers-fine">
            Billed per employee who expensed that month. Booking carries no markup on any plan, so the
            subscription is the whole bill. Figures and capabilities are subject to change before general
            availability.
          </p>
        </div>
      </section>
      <SiteFooter />
      </SmoothScroll>
    </main>
  );
}
