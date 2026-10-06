import { ArrowRight, CircleDollarSign, Clock, FileText, Inbox } from "lucide-react";
import { Shell } from "./shell";

/* The admin dashboard as it is today (.design/product-current/01-dashboard.png): the one report waiting for review,
   the unsubstantiated-spend line, and the "Needs you" column with amounts. Fictional people and numbers. */
const NEEDS = [
  { Icon: FileText, t: "To review", s: "5 receipts \u00b7 oldest 1 day", amt: "$973", late: false },
  { Icon: Inbox, t: "Missing receipts", s: "4 card charges \u00b7 oldest 9 days", amt: "$186", late: true },
  { Icon: Clock, t: "Awaiting approval", s: "1 report \u00b7 oldest 2 days", amt: "$412", late: false },
  { Icon: CircleDollarSign, t: "Owed to employees", s: "None", amt: "", late: false },
];

const ACTIVITY = [
  { who: "Emma Collins", verb: "submitted", what: "sms-receipt-0912.jpg", when: "9/12/2026" },
  { who: "Emma Collins", verb: "added a note to", what: "Marriott Marquis", when: "9/12/2026" },
  { who: "Lee Park", verb: "submitted", what: "hertz-folio.pdf", when: "9/11/2026" },
];

export function AdminScreen() {
  return (
    <div className="ap" role="img" aria-label="The Sylph admin dashboard: one report waiting for review and what needs finance today, with sample data">
      <Shell active="dashboard">
        <div className="ap-page">
          <p className="ap-hello">Good morning, Claire</p>
          <div className="ap-dash">
            <div className="ap-card ap-focus">
              <p className="ap-focus-k">Expense reports &middot; needs your review</p>
              <h5>September travel, New York needs your review: 2 lines over policy.</h5>
              <p className="ap-focus-amt ap-num">$973.25</p>
              <p className="ap-focus-who">Emma Collins &middot; Sales &middot; 5 entries &middot; in queue 5h</p>
              <div className="ap-focus-cta">
                <span className="ap-btn ap-btn--ink">Review report</span>
                <span className="ap-btn">All reports</span>
              </div>
              <div className="ap-focus-fin">
                <p className="ap-muted">Finance</p>
                <p>
                  <strong>Unsubstantiated card spend</strong>&ensp;<span className="ap-num">$186.40</span>
                </p>
                <p>4 charges with no receipt. Undocumented spend becomes taxable wages.</p>
                <nav>
                  <span className="ap-link">Review unmatched</span>
                  <span>Taxable report (CSV)</span>
                </nav>
              </div>
            </div>
            <div className="ap-activity">
              <p className="ap-activity-h">
                Recent activity <span className="ap-num">3 events</span>
              </p>
              {ACTIVITY.map((x) => (
                <p key={x.what} className="ap-activity-row">
                  <i aria-hidden="true" />
                  <span>
                    <b>{x.who}</b> {x.verb} {x.what}
                  </span>
                  <span className="ap-num">{x.when}</span>
                </p>
              ))}
            </div>
            <div className="ap-needs">
              <div className="ap-needs-h">
                Needs you <span className="ap-link">Analytics</span>
              </div>
              {NEEDS.map((n) => (
                <div className="ap-need" key={n.t}>
                  <n.Icon strokeWidth={1.75} />
                  <div>
                    <b>{n.t}</b>
                    <small className={n.late ? "is-late" : ""}>{n.s}</small>
                  </div>
                  <span className="ap-num">{n.amt}</span>
                  <ArrowRight strokeWidth={1.75} />
                </div>
              ))}
              <div className="ap-spend">
                Spend, last 90 days
                <span>
                  <span className="ap-num">$48,210</span>
                  <em>+4.2%</em>
                </span>
              </div>
            </div>
          </div>
        </div>
      </Shell>
    </div>
  );
}
