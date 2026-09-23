import { Mark } from "@/components/custom/site/mark";
import { VERDICT_LABEL } from "@/components/custom/site/sample-data";
import { CHARGE, QBO_LIVE, RECEIPT_LINES, REPORT, REPORT_TOTAL, ruleOf } from "./data";
import { Sample } from "./bits";

/* The product as it appears inside the story: Priya's phone and the month-end report. Dana's queue
   (queue.tsx) is the third screen. Everything is real text, never part of a picture. */

/** Priya's phone at the counter: the receipt goes out, the answer comes back naming the rule. */
export function Phone() {
  return (
    <div className="cx-phone" data-phone>
      <div className="cx-phone-screen">
        <div className="cx-phone-top">
          <Mark className="cx-app-mark" />
          <strong>Sylph</strong>
          <Sample />
        </div>
        <div className="cx-thread">
          <div className="cx-msg cx-msg--out" data-msg="1">
            <div className="cx-mini mono" aria-label="Photo of the Sushi Kanda receipt, total $84.20">
              <b>SUSHI KANDA</b>
              <span className="cx-mini-sub">Denver, CO</span>
              {RECEIPT_LINES.map(([k, v]) => (
                <span className="cx-mini-row" key={k}>
                  <span>{k}</span>
                  <span>{v}</span>
                </span>
              ))}
              <span className="cx-mini-row cx-mini-total">
                <span>TOTAL</span>
                <span>84.20</span>
              </span>
            </div>
          </div>
          <div className="cx-typing" data-typing aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <div className="cx-msg cx-msg--in" data-msg="2">
            <p>
              Matched to your card: {CHARGE.merchant}, <span className="mono">{CHARGE.amount}</span>.
            </p>
            <span className="cx-chip cx-chip--note">Needs a note</span>
            <p className="mono cx-cite">
              {CHARGE.rule}
              <sup>*</sup>, {CHARGE.cite}.
            </p>
            <p>Reply with a note.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** The report on Dana's desk at month end: every line with its rule, the approved note, the exports. */
export function Report() {
  return (
    <div className="cx-doc" data-doc>
      <span className="cx-doc-tab" aria-hidden="true" />
      <header className="cx-doc-head">
        <div>
          <p className="mono cx-doc-kind">Expense report</p>
          <h3>September, Denver site visit</h3>
          <p className="cx-doc-who">Priya</p>
        </div>
        <Sample />
      </header>
      <ul className="cx-doc-lines">
        {REPORT.map((r) => {
          const kanda = r.merchant === CHARGE.merchant;
          return (
            <li key={r.merchant} className={kanda ? "is-kanda" : undefined}>
              <span className="cx-doc-m">
                {r.merchant}
                <span className={`cx-chip cx-chip--${r.verdict}`}>{VERDICT_LABEL[r.verdict]}</span>
                {kanda && <span className="cx-doc-note">Note from Priya, approved by Dana</span>}
              </span>
              <span className="mono cx-doc-r">{ruleOf(r)}</span>
              <span className="mono cx-doc-a">{r.amount}</span>
            </li>
          );
        })}
      </ul>
      <div className="cx-doc-total">
        <span>Reimbursable total</span>
        <span className="mono">{REPORT_TOTAL}</span>
      </div>
      <p className="cx-doc-meta">
        {REPORT.length} of {REPORT.length} receipts matched. Every line cites its rule.
      </p>
      <div className="cx-doc-out" aria-label="Exports">
        <span>PDF</span>
        <span>XLSX</span>
        <span>GL journal CSV</span>
        {QBO_LIVE && <span>QuickBooks Online</span>}
      </div>
    </div>
  );
}
