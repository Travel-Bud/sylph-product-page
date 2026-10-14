import Image from "next/image";
import { BedDouble } from "lucide-react";
import { SCENE } from "./film";
import { StatusTag } from "./app-ui/chip";

/* The problem, as one scene (2026-10-13; it replaces the two-card contrast of 2026-10-05). The track pins the card
   while scrolling scrubs the clip (scenes.tsx): a gust clears the receipt pile until one receipt is left, the caption
   turns from today to Sylph, and the verdict on that one charge rises. Reduced motion shows the settled end: the last
   receipt, the Sylph caption and its verdict. */
export function Problem() {
  return (
    <section className="lp-problem" data-scene data-settle aria-labelledby="problem-t">
      <div className="lp-scene-stage lp-problem-stage">
        <div className="lp-wrap lp-problem-in">
          <h2 id="problem-t" className="lp-h2 lp-problem-h" data-rv>
            Most expense policies are checked too late.
          </h2>
          <figure className="lp-pf lp-pf--scene">
            <Image src={SCENE.exception.end} alt="" fill sizes="(max-width: 720px) 200vw, 100vw" quality={75} className="lp-scene-end" />
            <video className="lp-scene-v" data-scrub data-src={SCENE.exception.clip} poster={SCENE.exception.start} muted playsInline preload="none" aria-hidden="true" />
            <figcaption className="lp-pf-cap">
              <span className="lp-pf-cap-today">
                <span className="lp-lab">Today</span>
                <strong>Checked weeks later, by a person, line by line.</strong>
              </span>
              <span className="lp-pf-cap-sylph">
                <span className="lp-lab">With Sylph</span>
                <strong>Checked the moment money moves*, with the reason.</strong>
              </span>
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
                  <span>Checked at the swipe*</span>
                </p>
              </div>
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
