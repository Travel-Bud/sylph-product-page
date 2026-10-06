import Image from "next/image";
import { BedDouble } from "lucide-react";
import { NIGHT_FLIGHT_HD, RECEIPT_PILE } from "./film";
import { StatusTag } from "./app-ui/chip";

/* The problem, as one contrast (option P1 of .design/frames/problem-options-*.png; Ben picks at the halfway check):
   today the policy is checked after the money is spent, by a person, line by line; with Sylph it is checked the
   moment money moves, with the reason. The two launch-film stills carry the feeling; the labels carry the claim. */
export function Problem() {
  return (
    <section className="lp-problem" aria-labelledby="problem-t">
      <div className="lp-wrap">
        <h2 id="problem-t" className="lp-h2 lp-problem-h">
          Most expense policies are checked too late.
        </h2>
        <div className="lp-problem-grid">
          <figure className="lp-pf lp-pf--today">
            <Image src={RECEIPT_PILE.src} alt="" fill sizes="(max-width: 720px) 100vw, 50vw" quality={75} placeholder="blur" blurDataURL={RECEIPT_PILE.blur} className="lp-pf-img" />
            <figcaption>
              <span className="lp-lab">Today</span>
              <strong>Checked weeks later, by a person, line by line.</strong>
            </figcaption>
          </figure>
          <figure className="lp-pf lp-pf--sylph">
            <Image src={NIGHT_FLIGHT_HD.src} alt="" fill sizes="(max-width: 720px) 100vw, 50vw" quality={75} placeholder="blur" blurDataURL={NIGHT_FLIGHT_HD.blur} className="lp-pf-img" />
            <figcaption>
              <span className="lp-lab">With Sylph</span>
              <strong>Checked the moment money moves, with the reason.</strong>
            </figcaption>
            <div className="ap lp-pf-card" role="img" aria-label="A hotel charge flagged at the swipe: $62 over the $350 nightly cap, rule L-007">
              <div className="ap-card lp-pf-verdict">
                <div className="lp-pf-row">
                  <span className="ap-ic">
                    <BedDouble strokeWidth={1.75} />
                  </span>
                  <span>
                    <b>Marriott Marquis</b>
                    <small>New York, card ending 4417</small>
                  </span>
                  <span className="lp-pf-r">
                    <span className="ap-num">$412.00</span>
                    <StatusTag v="note" />
                  </span>
                </div>
                <p className="lp-pf-why ap-num">
                  <span>
                    <b>L-007</b>&ensp;$62 over the $350 nightly cap
                  </span>
                  <span>Checked at the swipe</span>
                </p>
              </div>
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
