import { byId, NOTE } from "./data";
import { Sample } from "./parts";

/* 5. The verdicts, as passport stamps on the page of the trip, and Priya's answer as the declaration beside
   them. Each stamp carries its rule, threshold and amount. They land one after another when the spread
   comes into view (CSS, keyed on .is-in from reveal.tsx); the ink is an SVG filter, grain displacing the
   edges and a low-frequency noise thinning the ink in patches, the way a rubber stamp prints. */

function InkFilter() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <filter id="dep-ink" x="-4%" y="-4%" width="108%" height="108%">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" result="grain" />
        <feDisplacementMap in="SourceGraphic" in2="grain" scale="2.6" xChannelSelector="R" yChannelSelector="G" result="rough" />
        <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" seed="11" result="blot" />
        <feColorMatrix in="blot" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -1.9 0 0 0 1.62" result="mask" />
        <feComposite in="rough" in2="mask" operator="in" />
      </filter>
    </svg>
  );
}

function Cleared() {
  const c = byId("hyatt");
  return (
    <svg viewBox="0 0 220 220" className="stamp-svg">
      <defs>
        <path id="dep-ring" d="M110 110 m-78 0 a78 78 0 1 1 156 0 a78 78 0 1 1 -156 0" />
      </defs>
      <g filter="url(#dep-ink)">
        <circle cx="110" cy="110" r="102" strokeWidth="5" />
        <circle cx="110" cy="110" r="92" strokeWidth="1.6" />
        <circle cx="110" cy="110" r="66" strokeWidth="1.6" />
        <text className="st-ring">
          <textPath href="#dep-ring" startOffset="0">
            CLEARED · IN POLICY · CLEARED · IN POLICY ·
          </textPath>
        </text>
        <text x="110" y="108" className="st-big" textAnchor="middle">
          {c.rule}
        </text>
        <text x="110" y="128" className="st-s" textAnchor="middle">
          HYATT ${c.amount}
        </text>
        <text x="110" y="145" className="st-s" textAnchor="middle">
          UNDER $350 CAP
        </text>
      </g>
    </svg>
  );
}

function Note() {
  const c = byId("sushi");
  return (
    <svg viewBox="0 0 300 170" className="stamp-svg">
      <g filter="url(#dep-ink)">
        <rect x="4" y="4" width="292" height="162" rx="10" strokeWidth="5" />
        <rect x="14" y="14" width="272" height="142" rx="4" strokeWidth="1.6" />
        <text x="150" y="58" className="st-head" textAnchor="middle">
          NEEDS A NOTE
        </text>
        <line x1="30" x2="270" y1="72" y2="72" strokeWidth="1.6" />
        <text x="150" y="100" className="st-mid" textAnchor="middle">
          {c.rule} · $9.20 OVER $75 CAP
        </text>
        <text x="150" y="128" className="st-s" textAnchor="middle">
          SUSHI KANDA · ${c.amount} · 12 SEP
        </text>
        <text x="150" y="146" className="st-s" textAnchor="middle">
          DINNER
        </text>
      </g>
    </svg>
  );
}

function Blocked() {
  const c = byId("bar");
  return (
    <svg viewBox="0 0 280 180" className="stamp-svg">
      <g filter="url(#dep-ink)">
        <path d="M40 4 H240 L276 44 V136 L240 176 H40 L4 136 V44 Z" strokeWidth="5" />
        <path d="M46 16 H234 L264 49 V131 L234 164 H46 L16 131 V49 Z" strokeWidth="1.6" />
        <text x="140" y="66" className="st-head" textAnchor="middle">
          BLOCKED
        </text>
        <text x="140" y="94" className="st-mid" textAnchor="middle">
          {c.rule} · ALCOHOL
        </text>
        <text x="140" y="118" className="st-s" textAnchor="middle">
          KEPT OFF THE TOTAL · ${c.amount}
        </text>
        <text x="140" y="140" className="st-s" textAnchor="middle">
          CARD NOT DECLINED
        </text>
      </g>
    </svg>
  );
}

export function DepStamps() {
  const sushi = byId("sushi");
  return (
    <section className="dep-stamps" id="verdicts" aria-labelledby="stamps-t">
      <InkFilter />
      <div className="dep-wrap">
        <div className="dep-stamps-head" data-rv>
          <p className="dep-kick dep-kick--ink">Each charge, as it lands</p>
          <h2 id="stamps-t" className="dep-h2">
            Every answer names its rule.
          </h2>
          <div className="dep-stamps-lede">
            <p className="dep-lede">
              Cleared, Needs a note or Blocked, with the rule, the threshold and the amount. No model sits in the
              decision: the same charge gets the same answer, every time. Blocked keeps a charge off the reimbursable
              total. It never declines the card.
            </p>
            <p className="dep-next">
              <span className="dep-next-tag">In build, not yet available</span> The same rule answering at the card
              terminal, Visa cards first.
            </p>
          </div>
        </div>
        <div className="pp" data-once>
          <div className="pp-page pp-page--l">
            <span className="pp-no mono" aria-hidden="true">
              12
            </span>
            <ul className="pp-stamps" aria-label="Three verdicts from the trip, sample data">
              <li className="stamp stamp--ok" style={{ "--r": "-8deg", "--d": "0.25s" } as React.CSSProperties}>
                <Cleared />
                <span className="sr-only">Cleared, rule L-007, Hyatt Regency Denver, $258.00, under the $350 nightly cap</span>
              </li>
              <li className="stamp stamp--note" style={{ "--r": "5deg", "--d": "0.85s" } as React.CSSProperties}>
                <Note />
                <span className="sr-only">Needs a note, rule M-041, Sushi Kanda, $84.20, $9.20 over the $75 dinner cap</span>
              </li>
              <li className="stamp stamp--block" style={{ "--r": "-4deg", "--d": "1.45s" } as React.CSSProperties}>
                <Blocked />
                <span className="sr-only">Blocked, rule M-022, Bar Bianco, $46.90, alcohol, kept off the total, card not declined</span>
              </li>
            </ul>
          </div>
          <div className="pp-page pp-page--r">
            <span className="pp-no mono" aria-hidden="true">
              13
            </span>
            <div className="decl">
              <div className="decl-top">
                <span className="decl-k">Declaration</span>
                <span className="mono">{sushi.rule}</span>
              </div>
              <h3 className="decl-h">Her answer, already written.</h3>
              <dl className="decl-dl">
                <div>
                  <dt>Charge</dt>
                  <dd>
                    {sushi.merchant}, <span className="mono">${sushi.amount}</span>, Sep 12
                  </dd>
                </div>
                <div>
                  <dt>Rule</dt>
                  <dd>
                    <span className="mono">{sushi.rule}</span>, {sushi.why}
                  </dd>
                </div>
                <div className="decl-note-row">
                  <dt>Her note</dt>
                  <dd className="decl-note">
                    {Array.from(NOTE).map((ch, i) => (
                      <span key={i} style={{ "--i": i } as React.CSSProperties}>
                        {ch}
                      </span>
                    ))}
                  </dd>
                </div>
              </dl>
              <p className="decl-sent">
                <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                  <path d="M3 8.5l3.2 3L13 4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Travels with the charge to Dana
              </p>
            </div>
            <Sample />
          </div>
        </div>
      </div>
    </section>
  );
}
