import { QBO_LIVE } from "@/components/custom/site/sample-data";
import { Kicker } from "./kicker";

/* What finance asks first. Plain answers; the only setup claim is the one we can make. */
export const TRUST = "Encrypted in transit and at rest. Never used to train models.";

const QA: { q: string; a: string }[] = [
  {
    q: "Do we have to switch cards or banks?",
    a: "No. Connect the company cards and bank feeds you already use. Personal cards are matched through receipts, not feeds.",
  },
  {
    q: "Is AI approving our expenses?",
    a: "No. AI drafts the rules from your policy and a person approves each one. After that every check is plain rule logic, so the same charge always gets the same answer.",
  },
  {
    q: "We don't have a written policy.",
    a: "Answer a few questions and Sylph drafts one. The quick version takes about five minutes, and you approve it rule by rule.",
  },
  {
    q: "What happens to a blocked charge?",
    a: "It stays off the reimbursement total, with the reason shown. The card itself still works.",
  },
  {
    q: "How long does setup take?",
    a: "It took us about an hour for a 10-person company: connect the cards, answer the policy questions, approve the rules.",
  },
  {
    q: "What does our accountant get at month end?",
    a: `A statement PDF, an Excel workbook and an audit package for every report${QBO_LIVE ? ", and the entries posted to QuickBooks Online" : ""}.`,
  },
  { q: "Where does our data go?", a: TRUST },
];

export function Faq() {
  return (
    <section className="lp-faq" id="questions" aria-labelledby="faq-t">
      <div className="lp-wrap lp-faq-grid">
        <div className="lp-faq-head" data-rv>
          <Kicker>Questions</Kicker>
          <h2 id="faq-t" className="lp-h2">
            What finance asks first.
          </h2>
        </div>
        <ol className="lp-faq-list" data-rv>
          {QA.map((x, i) => (
            <li key={x.q}>
              <details className="lp-qa">
                <summary>
                  <span className="lp-qa-n">{String(i + 1).padStart(2, "0")}</span>
                  <span className="lp-qa-q">{x.q}</span>
                  <span className="lp-qa-plus" aria-hidden="true" />
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
