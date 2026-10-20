import { FlagTile } from "./flag-tile";
import { ReceiptTile } from "./receipt-tile";
import { ReportTile } from "./report-tile";
import { TripTile } from "./trip-tile";
import { Kicker } from "../kicker";

/* The features, as working pieces (Ben, 2026-10-05): tiles sized by importance, each doing its job when touched.
   Cut to four tiles with titles only (Ben, 2026-10-19). */
export function Bento() {
  return (
    <section className="lp-bento" id="features" data-settle aria-labelledby="bento-t">
      <div className="lp-wrap">
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
