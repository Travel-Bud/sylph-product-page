import { howDrawings } from "./iso";
import { Kicker } from "./kicker";

/* Frame A's night section (Ben, 2026-10-05): four technical drawings of how a charge gets checked, on one sheet.
   Drawings and titles only (Ben, 2026-10-19). */
const STEPS = ["Bring your policy", "Approve the rules", "Every charge is checked", "Finance sees exceptions"];

export function How() {
  const art = howDrawings();
  return (
    <section className="lp-how lp-panel" id="how" data-panel data-settle aria-labelledby="how-t">
      <div className="lp-wrap">
        <div className="lp-how-head" data-rv>
          <div>
            <Kicker night>How it works</Kicker>
            <h2 id="how-t" className="lp-h2">
              <span>Write the policy once.</span> <span>Sylph checks every charge.</span>
            </h2>
          </div>
        </div>
        <div className="lp-sheet">
          <i aria-hidden="true" />
          <i aria-hidden="true" />
          <i aria-hidden="true" />
          <i aria-hidden="true" />
          <ol className="lp-steps">
            {STEPS.map((s, i) => (
              <li key={s} className="lp-step" data-rv>
                <svg
                  className="lp-step-art"
                  viewBox={art[i].viewBox}
                  role="img"
                  aria-label={art[i].title}
                  dangerouslySetInnerHTML={{ __html: art[i].inner }}
                />
                <h3>
                  <span className="lp-step-n">{String(i + 1).padStart(2, "0")}</span>
                  {s}
                </h3>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
