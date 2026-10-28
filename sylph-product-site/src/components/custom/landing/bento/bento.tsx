import { FlagTile } from "./flag-tile";
import { ReceiptTile } from "./receipt-tile";
import { ReportTile } from "./report-tile";
import { TripTile } from "./trip-tile";
import { Kicker } from "../kicker";
import { CardScene } from "../card-scene";

/* The features, as working pieces (Ben, 2026-10-05): tiles sized by importance, each doing its job when touched.
   The card scene opens the section (2026-10-13); cut to four tiles with titles only (Ben, 2026-10-19). */
export function Bento() {
  return (
    <section className="lp-bento" id="features" data-settle aria-labelledby="bento-t">
      <CardScene />
      <div className="lp-wrap lp-bento-in">
        <div className="lp-bento-head" data-rv>
          <Kicker>Features</Kicker>
          <h2 id="bento-t" className="lp-h2">
            See what it does.
          </h2>
        </div>
        <div className="lp-bento-grid">
          <FlagTile />
          <ReceiptTile />
          <TripTile />
          <ReportTile />
        </div>
      </div>
    </section>
  );
}
