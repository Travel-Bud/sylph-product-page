import { Obj } from "@/components/custom/site/obj";
import { Mark } from "@/components/custom/site/mark";
import { APP_LOGIN, DEMO, PRICING } from "@/components/custom/site/anchors";
import { QBO_LIVE } from "@/components/custom/site/sample-data";
import { Folio, SampleChip, Stamp } from "./bits";
import { Chapter } from "./entries";
import { Sorter } from "./sorter";
import { BOOK, CLEARED, EXCEPTIONS, KEPT_OFF, REIMBURSABLE, TOTAL_ENTERED, money } from "./data";

export function Masthead() {
  return (
    <header className="lg-mast">
      <a className="lg-mast__brand" href="/v2/ledger" aria-label="Sylph, top of the page">
        <Mark className="lg-mast__mark" />
        <span>Sylph</span>
      </a>
      <span className="lg-mast__book" aria-hidden="true">
        Book of account, September 2026
      </span>
      <nav className="lg-mast__nav" aria-label="Site">
        <a href={PRICING}>Pricing</a>
        <a href={APP_LOGIN}>Log in</a>
        <a className="lg-btn lg-btn--sm" href={DEMO}>
          Book a demo
        </a>
      </nav>
    </header>
  );
}

export function Exceptions() {
  return (
    <Chapter id="exceptions" className="lg-wide">
      <header className="lg-ch__head lg-ch__head--wide">
        <h2 id="exceptions-h" className="lg-h2">
          <span className="lg-sr">September 17. </span>
          Twenty charges. Five reach you.
        </h2>
        <p className="lg-p">
          Month end is too late to find out, so every charge is checked as it happens. What is in policy files itself.
          What is not comes to you with its rule, its threshold and its amount. Blocked means kept off the reimbursable
          total, never a declined card.
        </p>
      </header>
      <Sorter />
    </Chapter>
  );
}

const ANSWERS = [
  { q: "Dinner alone, per person", a: "$75", rule: "M-041", tone: "note" as const, tag: "Warn" },
  { q: "Dinner, hard cap", a: "$120", rule: "M-044", tone: "block" as const, tag: "Block" },
  { q: "Alcohol", a: "Not reimbursable", rule: "M-022", tone: "block" as const, tag: "Block" },
  { q: "Hotel, nightly cap", a: "$350", rule: "L-007", tone: "note" as const, tag: "Warn" },
  { q: "Itemized receipt over", a: "$25", rule: "R-003", tone: "note" as const, tag: "Warn" },
];

export function Policy() {
  return (
    <Chapter id="policy" className="lg-wide">
      <header className="lg-ch__head lg-ch__head--wide">
        <h2 id="policy-h" className="lg-h2">
          <span className="lg-sr">September 22. </span>
          Start without a policy document.
        </h2>
        <p className="lg-p">
          Most small companies run on a few rules everyone knows. Sylph writes them down and checks them.
        </p>
      </header>
      <div className="lg-policy" data-reveal="">
        <Folio head="A dozen answers" folio="Folio 22" className="lg-answers">
          <ol className="lg-answers__list">
            {ANSWERS.map((x, i) => (
              <li key={x.q} className="lg-answer" style={{ ["--t" as string]: `${200 + i * 380}ms` }}>
                <span className="lg-answer__q">{x.q}</span>
                <span className="lg-answer__a">{x.a}</span>
                <span className={`lg-answer__rule is-${x.tone}`}>
                  {x.rule} <b>{x.tag}</b>
                </span>
              </li>
            ))}
          </ol>
          <p className="lg-folio__foot">
            Caps, cabin class, receipts, alcohol. Skip what does not apply. Sylph writes the policy your team reads
            and the rules it checks on every charge.
          </p>
        </Folio>
        <div className="lg-pdf">
          <Obj name="policy" size={150} className="lg-pdf__obj" />
          <h3 className="lg-h3">Or bring the PDF you have.</h3>
          <p className="lg-p">
            Sylph reads it and drafts the rules. Every rule quotes its sentence. You approve the set once.
          </p>
        </div>
      </div>
      <p className="lg-rulefoot">Either way, the same rules check every charge from then on. Setup is same-day.</p>
    </Chapter>
  );
}

const TRUST = "Policies and receipts are encrypted in transit and at rest, and never used to train models.";

const NOTES = [
  {
    q: "Do we have to switch cards or banks?",
    a: "No. Sylph works on the cards and banks you already have. Nothing to switch, no new card to issue.",
  },
  {
    q: "Is AI making the decisions?",
    a: "No. AI reads your policy and drafts the rules, and a person approves them. From then on every check is deterministic: no model in the decision, and the same charge always gets the same answer.",
  },
  {
    q: "What does our accountant get?",
    a: QBO_LIVE
      ? "The report, assembled at month end: an audit-grade PDF, an XLSX and a GL journal CSV. The journal posts to QuickBooks Online."
      : "The report, assembled at month end: an audit-grade PDF, an XLSX and a GL journal CSV.",
  },
  {
    q: "Where does our data go?",
    a: "Policies and receipts are encrypted in transit and at rest. They are never used to train models.",
  },
  {
    q: "What if we have no written policy?",
    a: "Answer a dozen questions. Sylph writes the policy your team reads and the rules it checks, and you approve them before anything is enforced.",
  },
  {
    q: "What happens to a blocked charge?",
    a: "It is kept off the reimbursable total, with the rule that blocked it. The card is never declined: Sylph checks each charge as it posts.",
  },
  {
    q: "What does it cost, and how long is setup?",
    a: "On the Small business plan, for teams up to 100: $25 per active employee a month for Expense or for Flights, $40 for both. Mid-size teams pay $35 each or $60 for both. Setup is same-day.",
    link: true,
  },
];

export function Notes() {
  return (
    <Chapter id="notes" className="lg-wide">
      <div className="lg-notes">
        <header className="lg-ch__head">
          <h2 id="notes-h" className="lg-h2">
            <span className="lg-sr">September 26. </span>
            Notes to the accounts.
          </h2>
          <p className="lg-trust">{TRUST}</p>
          <p className="lg-p">The questions finance asks first, answered in the order they usually come.</p>
        </header>
        <div className="lg-notes__list">
          {NOTES.map((n, i) => (
            <details key={n.q} className="lg-note">
              <summary>
                <span className="lg-note__no">Note {i + 1}</span>
                <span className="lg-note__q">{n.q}</span>
                <span className="lg-note__pm" aria-hidden="true" />
              </summary>
              <p>
                {n.a}
                {n.link ? (
                  <>
                    {" "}
                    <a className="lg-link" href={PRICING}>
                      See pricing
                    </a>
                  </>
                ) : null}
              </p>
            </details>
          ))}
        </div>
      </div>
    </Chapter>
  );
}

export function Closed() {
  const approved = EXCEPTIONS.filter((r) => r.verdict === "note").length;
  const blocked = EXCEPTIONS.length - approved;
  return (
    <Chapter id="closed" className="lg-wide lg-closed">
      <div className="lg-closed__grid">
        <header className="lg-ch__head">
          <h2 id="closed-h" className="lg-h2">
            <span className="lg-sr">September 30. </span>
            Closed on the thirtieth. Nothing left to chase.
          </h2>
          <p className="lg-p">
            The report was being written all month, so at month end it is already there, every line cited. Your
            accountant gets the journal, not a shoebox.
          </p>
          <ul className="lg-files" aria-label="What the close produces">
            <li>
              <span className="lg-files__ext">PDF</span> Audit-grade report
            </li>
            <li>
              <span className="lg-files__ext">XLSX</span> Every line, every citation
            </li>
            <li>
              <span className="lg-files__ext">CSV</span> GL journal
            </li>
            {QBO_LIVE ? (
              <li>
                <span className="lg-files__ext">QBO</span> Posted to QuickBooks Online
              </li>
            ) : null}
          </ul>
        </header>
        <div className="lg-report" data-reveal="">
          <Folio head="Expense report, September 2026" folio="Folio 30">
            <dl className="lg-sum">
              <div style={{ ["--t" as string]: "150ms" }}>
                <dt>Entries</dt>
                <dd>
                  <span className="lg-sum__n">{BOOK.length}</span>
                  {money(TOTAL_ENTERED)}
                </dd>
              </div>
              <div style={{ ["--t" as string]: "450ms" }}>
                <dt>Cleared and filed</dt>
                <dd>
                  <span className="lg-sum__n">{CLEARED.length}</span>
                </dd>
              </div>
              <div style={{ ["--t" as string]: "750ms" }}>
                <dt>Approved with a note</dt>
                <dd>
                  <span className="lg-sum__n">{approved}</span>
                </dd>
              </div>
              <div style={{ ["--t" as string]: "1050ms" }}>
                <dt>Kept off the total</dt>
                <dd>
                  <span className="lg-sum__n">{blocked}</span>({money(KEPT_OFF)})
                </dd>
              </div>
              <div className="lg-sum__total" style={{ ["--t" as string]: "1350ms" }}>
                <dt>Reimbursable</dt>
                <dd>{money(REIMBURSABLE)}</dd>
              </div>
            </dl>
            <p className="lg-folio__foot">Approved Sep 30, A. Sumant. Journal ready for your accountant.</p>
            <Stamp tone="close" rot={-9} delay={2100} className="lg-closed__stamp">
              <span className="lg-closed__word">Closed</span>
              <span className="lg-closed__date">Sep 30 2026</span>
            </Stamp>
          </Folio>
        </div>
      </div>

      <div className="lg-cta">
        <h2 className="lg-cta__h">See your month close.</h2>
        <p className="lg-p">
          Bring last month&rsquo;s card statement, with or without a policy. Thirty minutes, your charges, real verdicts.
        </p>
        <div className="lg-ctas">
          <a className="lg-btn" href={DEMO}>
            Book a demo
          </a>
          <a className="lg-btn lg-btn--ghost" href={PRICING}>
            Pricing
          </a>
        </div>
        <p className="lg-fine">From $25 per active employee a month.</p>
      </div>
    </Chapter>
  );
}

export function CarriedForward() {
  return (
    <section className="lg-cf" aria-labelledby="cf-h">
      <div className="lg-cf__head">
        <h2 id="cf-h" className="lg-h3">
          Carried forward to October
        </h2>
        <span className="lg-cf__tag">In build, not yet available</span>
      </div>
      <ul className="lg-cf__list">
        <li>
          <b>Card controls at the terminal.</b> The policy rides on the card: a purchase outside it is declined at the
          terminal, with a text naming the rule. Starting with Visa cards, on the cards you already issue.
        </li>
        <li>
          <b>The receipt rebuilt from card line items.</b> The line items often travel with the charge already. We are
          building the path that rebuilds the receipt from them, so nobody photographs anything.
        </li>
      </ul>
    </section>
  );
}

export function LedgerFooter() {
  return (
    <footer className="lg-foot">
      <div className="lg-foot__top">
        <span className="lg-foot__brand">
          <Mark className="lg-mast__mark" />
          Sylph
        </span>
        <span className="lg-foot__slogan">Expenses run on air.</span>
        <nav className="lg-foot__nav" aria-label="Footer">
          <a href={PRICING}>Pricing</a>
          <a href={DEMO}>Book a demo</a>
          <a href={APP_LOGIN}>Log in</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </nav>
      </div>
      <div className="lg-foot__fine">
        <p>{TRUST}</p>
        <p>
          Every panel marked <SampleChip /> uses sample data, not customer data.
        </p>
        <p>&copy; 2026 Sylph. Made by Janus Labs.</p>
      </div>
    </footer>
  );
}
