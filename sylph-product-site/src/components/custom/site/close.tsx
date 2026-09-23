import Link from "next/link";
import { Mark } from "./mark";
import { DEMO, PRICING } from "./anchors";

export function Close() {
  return (
    <section className="sec sec--band sec--mint close" aria-labelledby="close-title">
      <div className="wrap">
        <Mark className="close-mark" />
        <div className="close-inner rv">
          <h2 id="close-title" className="h2">
            See your month close.
          </h2>
          <p className="lede">Bring last month&rsquo;s card statement, with or without a policy. Thirty minutes, your charges, real verdicts.</p>
          <div className="close-cta">
            <Link href={DEMO} className="btn btn-primary btn-lg">
              Book a demo
            </Link>
            <Link href={PRICING} className="btn btn-secondary btn-lg">
              Pricing
            </Link>
          </div>
          <p className="close-price">
            $25 per active employee a month for Expense, $40 with Flights, for teams up to 100.{" "}
            <Link href={PRICING}>See every plan</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
