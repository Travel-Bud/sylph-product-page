import type { ReactNode } from "react";

/**
 * What we hold to: four beliefs in Ben's own words (docs/plans/landing-v3/voice.md), set at
 * display size on the deep-green ground. Each row's key phrase carries one drawn stroke that
 * lands once the row is in view (LoopGate adds .is-in); the settled, drawn state is the CSS
 * default, so no-JS and reduced motion get the finished page.
 */
function U({ children }: { children: ReactNode }) {
  return (
    <span className="u">
      {children}
      <svg viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path d="M2 8.5 C 26 3.5, 52 11.5, 98 5.5" pathLength={1} />
      </svg>
    </span>
  );
}

const HELD: { s: ReactNode; p: string }[] = [
  {
    s: (
      <>
        Month end is <U>too late</U> to find out.
      </>
    ),
    p: "Every charge is checked as it happens, not after the money is gone. A verdict at month end is an autopsy.",
  },
  {
    s: (
      <>
        A verdict that cannot <U>cite its rule</U> is an opinion.
      </>
    ),
    p: "Every decision names the rule, the threshold and the amount. The audit trail is built as it happens, not reconstructed at month end.",
  },
  {
    s: (
      <>
        AI drafts. A person approves. The check <U>never guesses</U>.
      </>
    ),
    p: "Sylph compiles your policy into rules once. No model sits in the decision, so the same charge gets the same answer every time.",
  },
  {
    s: (
      <>
        The card stays. <U>The chaos goes.</U>
      </>
    ),
    p: "Sylph works on the cards and banks you already have. Nothing to switch, no new card to issue.",
  },
];

export function Held() {
  return (
    <section id="held" className="sec sec--deep held on-night" aria-labelledby="held-title">
      <div className="wrap">
        <h2 id="held-title" className="held-k rv">
          What we hold to.
        </h2>
        <ul className="held-list">
          {HELD.map((h, i) => (
            <li key={i} className="held-row rv" data-once>
              <h3 className="held-s">{h.s}</h3>
              <p className="held-p">{h.p}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
