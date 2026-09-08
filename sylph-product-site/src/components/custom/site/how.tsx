import { HowLine } from "./how-line";

/**
 * How it runs, as one drawn line: the policy sentence becomes a rule becomes a verdict.
 * Three labels, no paragraphs; the line draws as the visitor scrolls and lights each
 * station as it passes. Sample data, so the chip is on.
 */
export function How() {
  return (
    <section id="how" className="sec how" aria-labelledby="how-title">
      <div className="wrap">
        <div className="how-head rv">
          <h2 id="how-title" className="h2">
            One line from your policy to every verdict.
          </h2>
          <span className="sample">Sample data</span>
        </div>
        <HowLine />
      </div>
    </section>
  );
}
