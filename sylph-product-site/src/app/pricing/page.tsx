import type { Metadata } from "next";
import { DEMO } from "@/components/custom/site/anchors";
import { landingFonts } from "@/components/custom/landing/fonts";
import "@/components/custom/landing/landing.css";
import "@/components/custom/landing/sub.css";
import { Nav } from "@/components/custom/landing/nav";
import { Footer } from "@/components/custom/landing/footer";
import { Kicker } from "@/components/custom/landing/kicker";

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

/* What every plan does, for the people who spend and the people who close the books. The month-end files are the
   ones the app builds today (statement PDF, Excel workbook, audit package). */
const SIDES = [
  {
    who: "For the people who spend",
    lines: ["Text a photo of the receipt and get an answer that names the rule.", "Nothing to chase at month end."],
  },
  {
    who: "For the people who close the books",
    lines: [
      "Only the exceptions arrive, each with its rule, threshold and amount.",
      "At month end the report is already there: a statement PDF, an Excel workbook and an audit package.",
    ],
  },
];

function Check() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 8.5l3.2 3L13 4.5" />
    </svg>
  );
}

export default function PricingPage() {
  return (
    <main className={`lp lp-sub ${landingFonts}`} id="main">
      <a href="#plans" className="lp-skip">
        Skip to content
      </a>
      <Nav solid />

      <section className="lp-sub-head" aria-labelledby="pricing-t">
        <div className="lp-wrap">
          <Kicker>Pricing</Kicker>
          <h1 id="pricing-t" className="lp-h2 lp-sub-h1">
            Simple pricing, per employee.
          </h1>
          <p className="lp-sub-lede">
            Every plan includes matching, currency normalization and deterministic enforcement. Booking carries no markup
            on any plan.
          </p>
        </div>
      </section>

      <section className="lp-plans" id="plans" aria-label="Plans" tabIndex={-1}>
        <div className="lp-wrap">
          <ul className="lp-tiers">
            {TIERS.map((t) => (
              <li key={t.name} className={`lp-tier${t.highlighted ? " is-hi" : ""}`}>
                <div className="lp-tier-top">
                  <h2>{t.name}</h2>
                  <span className="lp-tier-size">{t.size}</span>
                </div>
                <p className="lp-tier-price">
                  <b>{t.price}</b>
                  {t.period && <span>{t.period}</span>}
                </p>
                {t.bundle && <p className="lp-tier-bundle">{t.bundle}</p>}
                <p className="lp-tier-desc">{t.description}</p>
                <ul className="lp-tier-feats">
                  {t.features.map((f) => (
                    <li key={f}>
                      <Check />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <a href={DEMO} className={`lp-btn${t.highlighted ? " lp-btn--bone" : ""}`}>
                  {t.cta}
                </a>
              </li>
            ))}
          </ul>
          <p className="lp-plans-fine">
            Billed per employee who expensed that month. Booking carries no markup on any plan, so the subscription is the
            whole bill. Figures and capabilities are subject to change before general availability.
          </p>
        </div>
      </section>

      <section className="lp-every" aria-labelledby="every-t">
        <div className="lp-wrap lp-every-grid">
          <div>
            <Kicker night>On every plan</Kicker>
            <h2 id="every-t" className="lp-h2">
              Both sides of the charge.
            </h2>
          </div>
          <div className="lp-every-cols">
            {SIDES.map((s) => (
              <div key={s.who}>
                <h3>{s.who}</h3>
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

      <Footer sampleNote={false} />
    </main>
  );
}
