import Link from "next/link";
import { PRICING } from "./anchors";
import { QBO_LIVE } from "./sample-data";

/**
 * The objections a finance buyer raises first, answered in the page voice. Native <details>, so it
 * works without JS and the first answer stays open. Every answer restates a claim the page already
 * makes elsewhere, or the public pricing page; nothing new is claimed here.
 */
const QA: { q: string; a: React.ReactNode }[] = [
  {
    q: "Do we have to switch cards or banks?",
    a: "No. Sylph works on the cards and banks you already have. Nothing to switch, no new card to issue.",
  },
  {
    q: "We do not have a written policy.",
    a: "Answer a dozen questions: caps, cabin class, receipts, alcohol. Sylph writes the policy your team reads and the rules it checks. Or bring the PDF you have, and every rule quotes its sentence.",
  },
  {
    q: "Is an AI deciding what gets approved?",
    a: "No. AI drafts the rules from your policy and a person approves them. The check itself is plain rules: no model sits in the decision, so the same charge gets the same answer every time, and every verdict names the rule, the threshold and the amount.",
  },
  {
    q: "What does our accountant get at month end?",
    a: `The report, already assembled: an audit-grade PDF, an XLSX and a journal CSV with the account on every line${
      QBO_LIVE ? ". It posts to QuickBooks Online" : ""
    }.`,
  },
  {
    q: "What if a receipt never shows up?",
    a: "Receipts arrive by upload, email or text and find their own charge. A charge is checked once its receipt is matched, and a report cannot be submitted while a receipt is unmatched, so nothing slips through unseen.",
  },
  {
    q: "How long does it take to start?",
    a: "You can start the same day: connect the cards, bring or build the policy, approve the rules.",
  },
  {
    q: "What does it cost?",
    a: (
      <>
        For teams up to 100: $25 per active employee a month for Expense or for Flights, $40 for both. Mid-size teams pay $35 each or $60 for both. The full plan list is on the{" "}
        <Link href={PRICING}>pricing page</Link>.
      </>
    ),
  },
];

export function Questions() {
  return (
    <section id="questions" className="sec sec--band questions" aria-labelledby="questions-title">
      <div className="wrap qa-grid">
        <div className="sec-head qa-head rv">
          <h2 id="questions-title" className="h2">
            What finance asks first.
          </h2>
          <p className="lede">Plain answers. The rest is a thirty-minute call with your own card statement.</p>
          <p className="qa-trust">
            <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              <path d="M8 1.5 13 3.5v4c0 3.2-2.1 5.9-5 7-2.9-1.1-5-3.8-5-7v-4L8 1.5Z" />
              <path d="m5.6 8 1.7 1.7L10.6 6.4" />
            </svg>
            Policies and receipts are encrypted in transit and at rest, and never used to train models.
          </p>
        </div>
        <div className="qa-list">
          {QA.map((item, i) => (
            <details key={item.q} className="qa" open={i === 0}>
              <summary>
                <span>{item.q}</span>
                <i aria-hidden="true" />
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
