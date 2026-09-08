import { Obj } from "./obj";
import { RuleRows } from "./panels";

/**
 * Start without a policy document. Two ways in, one visual each: an answer in the policy
 * builder becoming the rule Sylph checks (the rule and its chip land once the card is in
 * view; LoopGate adds .is-in), and the PDF path with its rule rows. The line under both
 * hands off to the how-line.
 */
export function Start() {
  return (
    <section id="start" className="sec start" aria-labelledby="start-title">
      <div className="wrap">
        <div className="sec-head rv">
          <h2 id="start-title" className="h2">
            Start without a policy document.
          </h2>
          <p className="lede">Most small companies run on a few rules everyone knows. Sylph writes them down and checks them.</p>
        </div>

        <div className="start-grid">
          <article className="start-card rv rv-i">
            <div className="start-vis">
              <div className="win sb" data-once role="group" aria-label="Sample answer in the policy builder becoming a rule">
                <div className="win-bar">
                  <span>Policy builder</span>
                  <span className="sample">Sample data</span>
                </div>
                <div className="sb-body">
                  <p className="sb-q">
                    Dinner alone is capped at <span className="sb-a num">$75</span> a person.
                  </p>
                  <div className="sb-arrow" aria-hidden="true" />
                  <div className="sb-rule">
                    <span className="mono">M-041</span>
                    <span>Dinner over $75 a person needs a note</span>
                    <span className="chip chip-warn sb-chip">Warn</span>
                  </div>
                  <p className="sb-foot">Written into the policy your team reads.</p>
                </div>
              </div>
            </div>
            <h3 className="h3">Answer a dozen questions.</h3>
            <p>
              Caps, cabin class, receipts, alcohol. Skip what does not apply. Sylph writes the policy your
              team can read and the rules it checks on every charge.
            </p>
          </article>

          <article className="start-card rv rv-i">
            <div className="start-vis start-vis-pdf">
              <Obj name="policy" size={150} className="start-obj" />
              <RuleRows n={3} />
            </div>
            <h3 className="h3">Or bring the PDF you have.</h3>
            <p>Sylph reads it and drafts the rules. Every rule quotes its sentence. You approve the set once.</p>
          </article>
        </div>

        <p className="start-foot rv">Either way, the same rules check every charge from then on.</p>
      </div>
    </section>
  );
}
