import Link from "next/link";
import { Mark } from "@/components/custom/site/mark";
import { DEMO, PRICING } from "@/components/custom/site/anchors";
import { DANA, PRIYA, QBO_LIVE } from "@/components/custom/v2-sides/data";
import { Figure, Person } from "@/components/custom/v2-sides/parts";

/* Mock B's tail: the live questions and close (v2-sides/closing.tsx), same words, given the page's
   grounds. The questions sit on Dana's lilac, because finance is asking; the close splits the page back
   into the two sides it opened with, Priya's blue and Dana's lilac, and puts the offer where they meet. */

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
  { q: "Where does our data go?", a: TRUST },
  {
    q: "What does it cost?",
    a: "Per active employee a month. Small business, up to 100 people: Expense $25, Flights $25, both together $40. Mid-size: $35 each, $60 together.",
  },
  {
    q: "How long does setup take?",
    a: "Same day. Connect the cards and banks you already have, bring a policy or answer the questions, approve the rules.",
  },
];

export function MbQuestions() {
  return (
    <section id="questions" className="mb-q" aria-labelledby="questions-t" data-ground="#f3effb">
      <div className="v2s-wrap mb-q-grid">
        <div className="mb-q-head">
          <Person side="dana" {...DANA} size={40} />
          <h2 id="questions-t" className="mb-h2 mb-h2--xl">
            What finance asks first.
          </h2>
          <p className="mb-q-trust">
            <span className="mb-q-mark" aria-hidden="true">
              <Mark />
            </span>
            {TRUST}
          </p>
        </div>
        <ol className="mb-q-list">
          {QA.map((x, i) => (
            <li key={x.q}>
              <details className="mb-qa">
                <summary>
                  <span className="mb-qa-n mono">{String(i + 1).padStart(2, "0")}</span>
                  <span className="mb-qa-q">{x.q}</span>
                  <span className="mb-qa-plus" aria-hidden="true" />
                </summary>
                <p>{x.a}</p>
              </details>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const PRICES = [
  { plan: "Small business", note: "up to 100 people", one: "$25", both: "$40" },
  { plan: "Mid-size", note: "", one: "$35", both: "$60" },
];

export function MbClose() {
  return (
    <section className="mb-close" aria-labelledby="close-t" data-ground="#eaf1fb">
      <div className="mb-close-side mb-close-side--priya" aria-hidden="true">
        <Figure name="priya-walk" height={380} react={false} />
      </div>
      <div className="mb-close-side mb-close-side--dana" aria-hidden="true">
        <Figure name="dana-review" height={380} react={false} />
      </div>
      <div className="v2s-wrap mb-close-wrap">
        <div className="mb-close-card">
          <p className="mb-close-who">
            <Person side="priya" {...PRIYA} size={32} />
            <Person side="dana" {...DANA} size={32} />
          </p>
          <h2 id="close-t" className="mb-h2 mb-h2--xl">
            Close next month without chasing a&nbsp;receipt.
          </h2>
          <p className="mb-lede">
            Bring last month&rsquo;s card statement, with or without a policy. Thirty minutes, your charges, real
            verdicts.
          </p>
          <div className="mb-close-cta">
            <Link href={DEMO} className="v2s-btn v2s-btn--ink v2s-btn--lg">
              Book a demo
            </Link>
            <Link href={PRICING} className="v2s-btn v2s-btn--line v2s-btn--lg">
              Pricing
            </Link>
          </div>
          <table className="v2s-price mb-price">
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
        </div>
      </div>
    </section>
  );
}
