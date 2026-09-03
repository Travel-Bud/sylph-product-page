import { ReceiptRebuild } from "./receipt-rebuild";
import { Obj } from "./obj";

export function Next() {
  return (
    <section id="next" className="sec sec--night next on-night" aria-labelledby="next-title">
      <div className="wrap">
        <div className="sec-head rv">
          <p className="eyebrow">In build</p>
          <h2 id="next-title" className="h2">
            Where this is going.
          </h2>
          <p className="lede">Two things in build, shown with sample data. Neither is available yet.</p>
        </div>

        <div className="next-grid">
          <article className="next-card rv rv-i">
            <div className="next-vis">
              <span className="sample sample-night">In build, not yet available</span>
              <div className="ctl" aria-hidden="true">
                <Obj name="terminal" size={230} className="ctl-obj" />
                <div className="ctl-toast">
                  <span className="verdict verdict-block">
                    <i className="dot" />
                    Declined at the terminal
                  </span>
                  <span className="mono">C-018, merchant category not allowed, $58.00</span>
                </div>
              </div>
            </div>
            <h3 className="h3">Card controls, without changing cards.</h3>
            <p>
              Today Sylph checks a charge after it happens. Next, the policy rides on the card: the
              purchase is declined at the terminal, with a text naming the rule. Starting with Visa
              cards, on the cards you already issue.
            </p>
          </article>

          <article className="next-card rv rv-i">
            <div className="next-vis">
              <span className="sample sample-night">In build, not yet available</span>
              <ReceiptRebuild />
            </div>
            <h3 className="h3">The receipt that writes itself.</h3>
            <p>
              The line items often travel with the card transaction already. We are building the path
              that asks for them and rebuilds the receipt, so nobody photographs anything.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
