import { CardsTile } from "./cards-tile";
import { FlagTile } from "./flag-tile";
import { LimitTile } from "./limit-tile";
import { ReceiptTile } from "./receipt-tile";
import { ReportTile } from "./report-tile";
import { SetupTile } from "./setup-tile";
import { TripTile } from "./trip-tile";

/* The features, as working pieces (Ben, 2026-10-05): tiles sized by importance, each doing its job when touched. */
export function Bento() {
  return (
    <section className="lp-bento" id="features" aria-labelledby="bento-t">
      <div className="lp-wrap">
        <div className="lp-bento-head">
          <p className="lp-kick">Features</p>
          <h2 id="bento-t" className="lp-h2">
            See what it does.
          </h2>
          <p className="lp-bento-lede">
            Each tile is a small working piece of Sylph, with sample data. Hover, drag, click, hold and scroll.
          </p>
        </div>
        <div className="lp-bento-grid">
          <FlagTile />
          <ReceiptTile />
          <TripTile />
          <ReportTile />
          <LimitTile />
          <CardsTile />
          <SetupTile />
        </div>
      </div>
    </section>
  );
}
