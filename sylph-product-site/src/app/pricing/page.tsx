import type { Metadata } from "next";
import Link from "next/link";
import { siteFonts } from "@/components/custom/site/fonts";
import { DEMO } from "@/components/custom/site/anchors";
import "@/components/custom/v2-sides/sides.css";
import "@/components/custom/v2-sides/pricing.css";
import { SidesNav } from "@/components/custom/v2-sides/nav";
import { SidesFooter } from "@/components/custom/v2-sides/closing";
import { Head } from "@/components/custom/v2-sides/cast";

export const metadata: Metadata = {
  title: "Sylph pricing",
  description:
    "Per-employee pricing for Sylph. Every plan includes receipt matching, currency normalization, deterministic policy enforcement and audit-grade reports.",
};

type Tier = {
  name: string;
  size: string;
  price: string;
  period?: string;
  bundle?: string;
  description: string;
  highlighted?: boolean;
  features: string[];
  cta: string;
};

const TIERS: Tier[] = [
  {
    name: "Small business",
    size: "Up to 100 people",
    price: "$25",
    period: "per active employee, per month, for Expense or Flights",
    bundle: "Expense and Flights together, $40",
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
    cta: "Book a demo",
  },
  {
    name: "Mid-size",
    size: "101 to 1,000 people",
    price: "$35",
    period: "per active employee, per month, for Expense or Flights",
    bundle: "Expense and Flights together, $60",
    description: "Adds the audit log, dedicated onboarding and priority support, for 101 to 1,000 employees.",
    features: [
      "101 to 1,000 employees",
      "Everything in Small business",
      "Policy PDF drafted into rules",
      "Priority support",
      "Audit log and compliance reports",
      "Dedicated onboarding",
    ],
    cta: "Book a demo",
  },
  {
    name: "Enterprise",
    size: "More than 1,000 people",
    price: "Custom",
    description: "Dedicated service for more than 1,000 employees.",
    features: ["More than 1,000 employees", "Everything in Mid-size", "Dedicated account manager", "Custom integrations", "Volume discounts"],
    cta: "Contact sales",
  },
];

/* What every plan does, told from each side of the charge. Product truth only (SHARED-BRIEF). */
const SIDES = [
  {
    who: "priya" as const,
    name: "Priya",
    role: "Spends it",
    lines: ["Texts a photo of the receipt and gets an answer that names the rule.", "Nothing to chase at month end."],
  },
  {
    who: "dana" as const,
    name: "Dana",
    role: "Closes the books",
    lines: [
      "Sees only the exceptions, each with its rule, threshold and amount.",
      "At month end the report is already there: PDF, XLSX and a GL journal CSV.",
    ],
  },
];

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8.5l3.2 3L13 4.5" />
    </svg>
  );
}

export default function PricingPage() {
  return (
    <main className={`v2s ${siteFonts}`} id="main">
      <a href="#plans" className="v2s-skip">
        Skip to content
      </a>
      <SidesNav />

      <section className="v2p-head" aria-labelledby="pricing-t">
        <div className="v2s-wrap v2p-head-in">
          <h1 id="pricing-t" className="v2s-h2 v2s-h2--xl">
            Simple pricing, per employee.
          </h1>
          <p className="v2s-lede">
            Every plan includes matching, currency normalization and deterministic enforcement. Booking carries no
            markup on any plan.
          </p>
        </div>
      </section>

      <section className="v2p-tiers" id="plans" aria-label="Plans" tabIndex={-1}>
        <div className="v2s-wrap">
          <ul className="v2p-grid">
            {TIERS.map((t) => (
              <li key={t.name} className={`v2p-tier${t.highlighted ? " is-hi" : ""}`}>
                <div className="v2p-tier-top">
                  <h2 className="v2p-name">{t.name}</h2>
                  <span className="v2p-size">{t.size}</span>
                </div>
                <p className="v2p-price">
                  <span className="v2p-num">{t.price}</span>
                  {t.period && <span className="v2p-period">{t.period}</span>}
                </p>
                {t.bundle && <p className="v2p-bundle">{t.bundle}</p>}
                <p className="v2p-desc">{t.description}</p>
                <ul className="v2p-feats">
                  {t.features.map((f) => (
                    <li key={f}>
                      <Check />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={DEMO} className={`v2s-btn v2s-btn--lg ${t.highlighted ? "v2s-btn--ink" : "v2s-btn--line"} v2p-cta`}>
                  {t.cta}
                </Link>
              </li>
            ))}
          </ul>
          <p className="v2p-fine">
            Billed per employee who expensed that month. Booking carries no markup on any plan, so the subscription is
            the whole bill. Figures and capabilities are subject to change before general availability.
          </p>
        </div>
      </section>

      <section className="v2p-sides" aria-labelledby="sides-t">
        <div className="v2s-wrap">
          <h2 id="sides-t" className="v2p-sides-k">
            On every plan, both sides of the charge
          </h2>
          <div className="v2p-sides-grid">
            {SIDES.map((s) => (
              <div key={s.who} className={`v2p-side v2p-side--${s.who}`}>
                <p className="v2p-side-who">
                  <Head who={s.who} size={44} />
                  <span>
                    <strong>{s.name}</strong>
                    <span>{s.role}</span>
                  </span>
                </p>
                <ul>
                  {s.lines.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SidesFooter />
    </main>
  );
}
