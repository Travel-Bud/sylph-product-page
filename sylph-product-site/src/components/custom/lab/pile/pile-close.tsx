import Link from "next/link";
import { Mark } from "@/components/custom/site/mark";
import { DEMO } from "@/components/custom/site/anchors";
import { COUNTS, MARKS, VERDICT_LABEL, printedOf, shortDate, usd } from "./pile-data";

/* The nav, the close, the whole month as a table, a note on the sample, and the footer. */

export function PileNav() {
  return (
    <nav className="pl-nav" aria-label="Sylph">
      <div className="pl-nav-in">
        <Link href="/" prefetch={false} className="pl-brand">
          <Mark className="pl-brand-mark" />
          <span>Sylph</span>
        </Link>
        <span className="pl-nav-story">A month of expenses, sorted</span>
        <span className="pl-nav-links">
          <Link href="/pricing" prefetch={false} className="pl-nav-link">
            Pricing
          </Link>
          <Link href={DEMO} prefetch={false} className="pl-btn pl-btn--sm">
            Book a demo
          </Link>
        </span>
      </div>
    </nav>
  );
}

const SENT: Record<string, string> = { text: "Texted", email: "Emailed", upload: "Uploaded" };

export function PileClose() {
  return (
    <>
      <section className="pl-close" aria-labelledby="pl-close-h">
        <div className="pl-close-in">
          <p className="pl-close-n" aria-hidden="true">
            <span>{COUNTS.charges}</span>
            <span className="pl-close-to">to</span>
            <span className="pl-close-left">{COUNTS.exceptions}</span>
            <span className="pl-sample">Sample data</span>
          </p>
          <h2 id="pl-close-h">Close the month without chasing a receipt.</h2>
          <p className="pl-close-lede">
            Sylph compiles your policy into rules a person approves, then checks every charge as it happens, on the
            cards and banks you already have. Receipts find their own charges. At month end the report is already
            there, and you review the exceptions, not the pile.
          </p>
          <div className="pl-cta">
            <Link href={DEMO} prefetch={false} className="pl-btn">
              Book a demo
            </Link>
            <span className="pl-price">$30 per active employee a month.</span>
          </div>
        </div>
      </section>

      <section className="pl-data" aria-labelledby="pl-data-h">
        <details className="pl-details">
          <summary>
            <span id="pl-data-h">All {COUNTS.charges} charges in this month</span>
            <span className="pl-sample">Sample data</span>
          </summary>
          <div className="pl-table-wrap">
            <table className="pl-table">
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Person</th>
                  <th scope="col">Merchant</th>
                  <th scope="col" className="pl-col-opt">
                    As printed
                  </th>
                  <th scope="col" className="pl-num">
                    Dollars
                  </th>
                  <th scope="col" className="pl-col-opt">
                    Receipt
                  </th>
                  <th scope="col">Verdict</th>
                  <th scope="col">Rule</th>
                </tr>
              </thead>
              <tbody>
                {MARKS.map((m) => (
                  <tr key={m.id}>
                    <td className="pl-mono">{shortDate(m.date)}</td>
                    <td>{m.name}</td>
                    <td>{m.merchant}</td>
                    <td className="pl-mono pl-col-opt">{m.cur === "USD" ? "" : printedOf(m)}</td>
                    <td className="pl-mono pl-num">{usd(m.usd)}</td>
                    <td className="pl-col-opt">{m.channel ? SENT[m.channel] : "None"}</td>
                    <td>
                      <span className={`pl-chip pl-chip--${m.verdict}`}>{VERDICT_LABEL[m.verdict]}</span>
                    </td>
                    <td className="pl-mono pl-cite">{m.cite}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
        <p className="pl-about">
          <b>About this sample.</b> The month is invented: {COUNTS.people} people, {COUNTS.charges} charges, merchants
          from Sylph&rsquo;s own sample fixtures. Foreign charges use one rate per trip. The verdicts come from a small
          deterministic check written for this page over the rules shown, a sketch of the idea rather than Sylph&rsquo;s
          engine. Every count on the page is a count of the marks shown.
        </p>
      </section>

      <footer className="pl-foot">
        <div className="pl-foot-in">
          <Link href="/" prefetch={false} className="pl-brand">
            <Mark className="pl-brand-mark" />
            <span>Sylph</span>
          </Link>
          <span className="pl-foot-line">Expenses run on air.</span>
          <span className="pl-foot-links">
            <Link href="/pricing" prefetch={false}>Pricing</Link>
            <Link href={DEMO} prefetch={false}>Book a demo</Link>
            <a href="/privacy">Privacy</a>
          </span>
        </div>
      </footer>
    </>
  );
}
