import Link from "next/link";
import { Mark } from "./mark";
import { HOME } from "./anchors";

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
            <Link href={`${HOME}/demo`} className="btn btn-primary btn-lg">
              Book a demo
            </Link>
            <Link href={`${HOME}/pricing`} className="btn btn-secondary btn-lg">
              Pricing
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
