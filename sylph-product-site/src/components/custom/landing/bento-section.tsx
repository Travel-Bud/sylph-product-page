"use client";

import { useRef } from "react";
import { RevealHeading, RiseGroup, gsap, useGSAP, EASE_REVEAL, MM_MOTION, START_GROUP } from "./motion";

/**
 * Bento: the rest of what Sylph does around the trip, shown as small true
 * artifacts — a report assembling itself, an approval chain, an audit trail,
 * an itinerary, a hotel verdict, a currency conversion. Color returns here
 * in quiet washes; each cell keeps exactly one idea.
 *
 * Exactly two cells move beyond the shared rise, because their ideas ARE
 * motion: the report's rows file themselves in, and the approval chain
 * passes the baton. The four small cells stay still.
 */
export function BentoSection() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(MM_MOTION, () => {
        /* the report writes itself: rows land one by one, the pending row last */
        gsap.from(gsap.utils.toArray(".bn-report .bn-mini-row", root), {
          y: 10,
          autoAlpha: 0,
          duration: 0.4,
          ease: "power2.out",
          stagger: 0.16,
          delay: 0.25,
          scrollTrigger: { trigger: ".bn-report", start: "top 80%", once: true },
        });

        /* the approval passes: the link draws, then the next reviewer wakes */
        const chainTl = gsap.timeline({
          scrollTrigger: { trigger: ".bn-chain", start: "top 80%", once: true },
        });
        chainTl.from(".bn-chain-link", {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 0.35,
          ease: "power2.inOut",
          delay: 0.4,
        });
        chainTl.from(".bn-chain .bn-appr:last-child", { autoAlpha: 0.45, duration: 0.3, ease: "power1.out" }, "-=0.1");

        /* the sample-data note rises with the head */
        const note = root.querySelector(".bn-sample");
        if (note) {
          gsap.from(note, {
            y: 14, autoAlpha: 0, duration: 0.8, ease: EASE_REVEAL,
            scrollTrigger: { trigger: note, start: START_GROUP, once: true },
          });
        }
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="ar-sec ar-sec--wash" id="inside" aria-labelledby="inside-h">
      <div className="wrap">
        <div className="ar-head">
          <RevealHeading className="ar-h2">
            <span id="inside-h">
              Everything the trip touches, <em>handled.</em>
            </span>
          </RevealHeading>
          <p className="bn-sample">Shown with sample data.</p>
        </div>

        <RiseGroup className="bn-grid" stagger={0.07}>
          <div className="bn-cell bn-cell--w2 bn-wash-green">
            <div className="bn-vis" aria-hidden="true">
              <div className="bn-report">
                <div className="bn-report-head">
                  <b>Osaka · May 12 to 17</b>
                  <span className="ok-mark">report opened itself</span>
                </div>
                <div className="bn-mini-row"><span>ANA · SFO → KIX</span><span>$980.00</span></div>
                <div className="bn-mini-row"><span>Hyatt Regency Osaka · night 1</span><span>$352.86</span></div>
                <div className="bn-mini-row is-faint"><span>charges attach as they land…</span><span /></div>
              </div>
            </div>
            <h3>Reports that write themselves</h3>
            <p>
              Confirm a booking and the expense report opens itself: trip dates, destination,
              rules attached. Every charge files to it as it arrives.
            </p>
          </div>

          <div className="bn-cell bn-cell--w2 bn-wash-sky">
            <div className="bn-vis" aria-hidden="true">
              <div className="bn-chain">
                <div className="bn-appr is-done">
                  <span className="who">Manager · A. Osei</span>
                  <span className="st">approved</span>
                </div>
                <i className="bn-chain-link" />
                <div className="bn-appr">
                  <span className="who">Finance · D. Rossi</span>
                  <span className="st">reviewing</span>
                </div>
              </div>
            </div>
            <h3>Approvals at every level</h3>
            <p>
              Admin roles with their own scopes, so approval flows match how your org actually
              signs things off: manager first, finance last, nothing skipped.
            </p>
          </div>

          <div className="bn-cell">
            <div className="bn-vis" aria-hidden="true">
              <div className="bn-log">
                <span>14:02:11 · MEAL-03 fired · line 118</span>
                <span>14:02:11 · verdict recorded</span>
                <span>May 21 · exception approved · L.M.</span>
              </div>
            </div>
            <h3>An audit trail for everything</h3>
            <p>Every action, every verdict, every approval, logged as it happens.</p>
          </div>

          <div className="bn-cell bn-wash-sand">
            <div className="bn-vis" aria-hidden="true">
              <div className="bn-itin">
                <span><b>10:40a</b> SFO → KIX · ANA 106</span>
                <span><b>May 12 to 17</b> Hyatt Regency Osaka</span>
                <span><b>4:05p</b> KIX → SFO · ANA 105</span>
              </div>
            </div>
            <h3>One clear itinerary</h3>
            <p>Flights, hotel, and times in a single view, for the traveler and for finance.</p>
          </div>

          <div className="bn-cell bn-wash-green">
            <div className="bn-vis" aria-hidden="true">
              <div className="bn-hotel-wrap">
                <div className="bn-mini-row bn-hotel">
                  <span>Hyatt Regency Osaka · 5 nights</span>
                  <span className="ok-mark">In policy</span>
                </div>
                <span className="bn-hotel-rate">¥52,400/night → $352.86 · under the $400 cap</span>
              </div>
            </div>
            <h3>Hotels, in policy too</h3>
            <p>The same policy-aware search, for the room as well as the seat.</p>
          </div>

          <div className="bn-cell">
            <div className="bn-vis" aria-hidden="true">
              <div className="bn-fx">
                <span className="a">¥14,200</span>
                <span className="arr">→</span>
                <span className="b">$95.62</span>
                <span className="r">rate of May 14</span>
              </div>
            </div>
            <h3>Every currency, normalized</h3>
            <p>Foreign charges convert at the transaction date&rsquo;s rate, not today&rsquo;s.</p>
          </div>
        </RiseGroup>
      </div>
    </section>
  );
}
