import { howDrawings } from "./iso";
import { Kicker } from "./kicker";

/* Frame A's night section (Ben, 2026-10-05): four technical drawings of how a charge gets checked, on one sheet. */
const STEPS = [
  { t: "Bring your policy", d: "Upload the PDF you have, or answer a few questions and Sylph drafts one." },
  { t: "Approve the rules", d: "Each line becomes a rule with a code. Nothing runs until a person approves it." },
  { t: "Every charge is checked", d: "Card swipes, receipts and bookings are checked as they happen, not at month end." },
  { t: "Finance sees exceptions", d: "The rest files itself. Each exception arrives with the rule it broke and a note." },
];

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
          <p className="lp-how-aside">
            Your policy stays in plain English. Every rule points back to the line it came from, and every flag names its
            rule.
          </p>
        </div>
        <div className="lp-sheet">
          <i aria-hidden="true" />
          <i aria-hidden="true" />
          <i aria-hidden="true" />
          <i aria-hidden="true" />
          <div className="lp-sheet-meta" aria-hidden="true">
            <span>Fig. 1&ensp;How a charge is checked</span>
            <span>Sample ruleset</span>
          </div>
          <ol className="lp-steps">
            {STEPS.map((s, i) => (
              <li key={s.t} className="lp-step" data-rv>
                <svg
                  className="lp-step-art"
                  viewBox={art[i].viewBox}
                  role="img"
                  aria-label={art[i].title}
                  dangerouslySetInnerHTML={{ __html: art[i].inner }}
                />
                <h3>
                  <span className="lp-step-n">{String(i + 1).padStart(2, "0")}</span>
                  {s.t}
                </h3>
                <p>{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
