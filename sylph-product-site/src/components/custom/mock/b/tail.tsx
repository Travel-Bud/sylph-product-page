import Link from "next/link";
import { Mark } from "@/components/custom/site/mark";
import { DEMO, PRICING } from "@/components/custom/site/anchors";
import { Figure } from "@/components/custom/v2-sides/parts";

/* The landing's tail: five questions and the close (cut down from v2-sides/closing.tsx on 2026-09-25), on the
   page's grounds. The questions sit on Dana's lilac, because finance is asking; the close splits the page back
   into the two sides it opened with, Priya's blue and Dana's lilac, and puts the offer where they meet. */

const TRUST = "Encrypted in transit and at rest. Never used to train models.";

const QA: { q: string; a: string }[] = [
  {
    q: "Do we have to switch cards or banks?",
    a: "No. Sylph works with the cards and banks you already use.",
  },
  {
    q: "Is AI approving our expenses?",
    a: "No. AI drafts the rules from your policy and a person approves each one. After that every check is plain rule logic, so the same charge always gets the same answer.",
  },
  {
    q: "We don't have a written policy.",
    a: "Answer a few questions and Sylph drafts one. You approve it rule by rule.",
  },
  {
    q: "What happens to a blocked charge?",
    a: "It stays off the reimbursement total, with the reason shown. The card itself still works.",
  },
  {
    q: "How long does setup take?",
    a: "About a day. Connect your cards, add your policy, approve the rules.",
  },
];

export function MbQuestions() {
  return (
    <section id="questions" className="mb-q" aria-labelledby="questions-t" data-ground="#f3effb">
      <div className="v2s-wrap mb-q-grid">
        <div className="mb-q-head">
          <h2 id="questions-t" className="mb-h2 mb-h2--xl">
            Questions from finance.
          </h2>
          <p className="mb-q-trust">
            <span className="mb-q-mark" aria-hidden="true">
              <Mark />
            </span>
            {TRUST}
          </p>
        </div>
        <ol className="mb-q-list">
          {QA.map((x) => (
            <li key={x.q}>
              <details className="mb-qa">
                <summary>
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
          <h2 id="close-t" className="mb-h2 mb-h2--xl">
            Try it on last month&rsquo;s&nbsp;statement.
          </h2>
          <p className="mb-lede">
            Bring a card statement. We will run it through Sylph with you in thirty minutes.
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
