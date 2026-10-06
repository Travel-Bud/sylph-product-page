import Link from "next/link";
import { ChevronDown, ExternalLink } from "lucide-react";
import { DEMO, PRICING } from "@/components/custom/site/anchors";

/* The close: the offer (thirty minutes on last month's statement) beside the kind of finding Sylph writes when it
   reads one, in the shape of an Insights card in the app today (.design/product-current/06). Sample figures. */
const PRICES = [
  { plan: "Small business", note: "up to 100 people", one: "$25", both: "$40" },
  { plan: "Mid-size", note: "", one: "$35", both: "$60" },
];

export function Close() {
  return (
    <section className="lp-close" aria-labelledby="close-t">
      <div className="lp-wrap lp-close-grid">
        <div className="lp-close-copy">
          <p className="lp-kick lp-kick--night">Your numbers</p>
          <h2 id="close-t" className="lp-h2">
            Try it on last month&rsquo;s statement.
          </h2>
          <p className="lp-close-lede">Bring a card statement. We will run it through Sylph with you in thirty minutes.</p>
          <div className="lp-close-cta">
            <a href={DEMO} className="lp-btn lp-btn--bone">
              Book a demo
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </a>
            <Link href={PRICING} prefetch={false} className="lp-btn lp-btn--glass">
              Pricing
            </Link>
          </div>
          <table className="lp-price">
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
                    {p.note && <small>{p.note}</small>}
                  </th>
                  <td>{p.one}</td>
                  <td>{p.one}</td>
                  <td>{p.both}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ap lp-insight" role="img" aria-label="An Insights finding Sylph writes from a card statement, with sample figures">
          <p className="lp-insight-k ap-num">What Sylph finds on a statement</p>
          <div className="ap-card lp-insight-card">
            <span className="ap-chip ap-chip--block">Act now</span>
            <div className="lp-insight-body">
              <small>Receipts &amp; close</small>
              <b>$1,284 of card charges passed the 60-day receipt line</b>
              <p>Charges without a receipt after 60 days count as taxable pay under an accountable plan.</p>
              <span className="lp-insight-how">
                <ChevronDown strokeWidth={2} />
                How this was worked out
              </span>
              <span className="lp-insight-act">
                <span className="ap-btn ap-btn--sm">Open matching</span>
                <span className="lp-insight-l">
                  <ExternalLink strokeWidth={1.75} />
                  Chart
                </span>
              </span>
            </div>
            <span className="lp-insight-fig">
              <b className="ap-num">$1,284</b>
              <small>unsubstantiated, any age</small>
            </span>
          </div>
          <div className="ap-card lp-insight-card is-quiet">
            <span className="ap-chip ap-chip--note">Review</span>
            <div className="lp-insight-body">
              <small>Vendors &amp; subscriptions</small>
              <b>1 monthly subscription went up 20% or more</b>
            </div>
            <span className="lp-insight-fig">
              <b className="ap-num">$70</b>
              <small>a year more</small>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
