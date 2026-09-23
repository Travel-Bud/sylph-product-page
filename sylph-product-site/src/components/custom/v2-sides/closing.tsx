import Link from "next/link";
import { Mark } from "@/components/custom/site/mark";
import { APP_LOGIN, DEMO, PRICING } from "@/components/custom/site/anchors";
import { QBO_LIVE } from "./data";

const TRUST = "Policies and receipts are encrypted in transit and at rest, and never used to train models.";

const QA: { q: string; a: string }[] = [
  {
    q: "Do we have to switch cards or banks?",
    a: "No. Sylph works on the cards and banks your company already uses. There is no new card to issue and nothing for travellers to carry.",
  },
  {
    q: "Is AI deciding what gets approved?",
    a: "No. AI reads your policy once and drafts the rules; a person approves every one. The check itself is deterministic: no model in the decision, so the same charge gets the same answer every time.",
  },
  {
    q: "We do not have a written policy.",
    a: "Answer a dozen questions and Sylph writes one. You read it and approve it rule by rule, the same as a policy you brought.",
  },
  {
    q: "What does our accountant get at month end?",
    a: `An audit-grade PDF, an XLSX and a GL journal CSV, with every verdict citing its rule${QBO_LIVE ? ", and posting to QuickBooks Online" : ""}.`,
  },
  {
    q: "What happens to a Blocked charge?",
    a: "It stays off the reimbursable total, with the rule, threshold and amount cited. The card is never declined, and the traveller sees the reason when it is checked.",
  },
  {
    q: "Where does our data go?",
    a: TRUST,
  },
  {
    q: "What does it cost?",
    a: "Per active employee a month. Small business, up to 100 people: Expense $25, Flights $25, both together $40. Mid-size: $35 each, $60 together.",
  },
  {
    q: "How long does setup take?",
    a: "Same day. Connect the cards and banks you already have, bring a policy or answer the questions, approve the rules.",
  },
];

export function Questions() {
  return (
    <section id="questions" className="v2s-q" aria-labelledby="questions-t">
      <div className="v2s-wrap v2s-q-grid">
        <div className="v2s-q-head" data-rv>
          <h2 id="questions-t" className="v2s-h2">
            What finance asks first.
          </h2>
          <p className="v2s-trust">
            <span className="v2s-trust-mark" aria-hidden="true">
              <Mark />
            </span>
            {TRUST}
          </p>
        </div>
        <div className="v2s-q-list">
          {QA.map((x) => (
            <details key={x.q} className="v2s-qa">
              <summary>
                <span>{x.q}</span>
                <span className="v2s-qa-plus" aria-hidden="true" />
              </summary>
              <p>{x.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Ben, 2026-09-22: Expense and Flights priced separately, and together for less. */
const PRICES = [
  { plan: "Small business", note: "up to 100 people", one: "$25", both: "$40" },
  { plan: "Mid-size", note: "", one: "$35", both: "$60" },
];

export function SidesClose() {
  return (
    <section className="v2s-close" aria-labelledby="close-t">
      <div className="v2s-wrap v2s-close-in" data-rv>
        <div className="v2s-close-copy">
          <Mark className="v2s-close-mark" />
          <h2 id="close-t" className="v2s-h2 v2s-h2--xl">
            Close next month without chasing a&nbsp;receipt.
          </h2>
          <p className="v2s-lede">
            Bring last month&rsquo;s card statement, with or without a policy. Thirty minutes, your charges, real
            verdicts.
          </p>
          <div className="v2s-close-cta">
            <Link href={DEMO} className="v2s-btn v2s-btn--ink v2s-btn--lg">
              Book a demo
            </Link>
            <Link href={PRICING} className="v2s-btn v2s-btn--line v2s-btn--lg">
              Pricing
            </Link>
          </div>
        </div>
        <table className="v2s-price">
          <caption>Per active employee a month</caption>
          <thead>
            <tr>
              <th scope="col">Plan</th>
              <th scope="col">Expense</th>
              <th scope="col">Flights</th>
              <th scope="col">Both</th>
            </tr>
          </thead>
          <tbody>
            {PRICES.map((p) => (
              <tr key={p.plan}>
                <th scope="row">
                  {p.plan}
                  {p.note && <span>{p.note}</span>}
                </th>
                <td className="mono">{p.one}</td>
                <td className="mono">{p.one}</td>
                <td className="mono">{p.both}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* the same prices shaped for a phone: one card per plan, three prices across */}
        <div className="v2s-price-m">
          <p className="v2s-price-m-cap">Per active employee a month</p>
          {PRICES.map((p) => (
            <div key={p.plan} className="v2s-price-m-plan">
              <p className="v2s-price-m-name">
                <strong>{p.plan}</strong>
                {p.note && <span>{p.note}</span>}
              </p>
              <dl>
                <div>
                  <dt>Expense</dt>
                  <dd className="mono">{p.one}</dd>
                </div>
                <div>
                  <dt>Flights</dt>
                  <dd className="mono">{p.one}</dd>
                </div>
                <div className="is-both">
                  <dt>Both</dt>
                  <dd className="mono">{p.both}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** `sampleNote` is for the landing, where every panel carries sample data; /pricing and /demo leave it off. */
export function SidesFooter({ sampleNote = false }: { sampleNote?: boolean }) {
  return (
    <footer className="v2s-foot">
      <div className="v2s-wrap v2s-foot-in">
        <p className="v2s-foot-brand">
          <Mark className="v2s-brand-mark" />
          <span>
            <strong>Sylph</strong> Expenses run on air.
          </span>
        </p>
        <nav className="v2s-foot-links" aria-label="Footer">
          <Link href={DEMO}>Book a demo</Link>
          <Link href={PRICING}>Pricing</Link>
          <a href={APP_LOGIN}>Log in</a>
          <Link href="/privacy">Privacy</Link>
        </nav>
        <p className="v2s-foot-fine">
          {sampleNote && "Sample data throughout: Priya, Dana, the merchants and every amount are invented. "}
          {TRUST} &copy; 2026
          Janus Labs.
        </p>
      </div>
    </footer>
  );
}
