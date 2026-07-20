/**
 * The review queue panel — ONE component rendered by both the /dev/hero lab
 * and (at integration) the production hero, so what is tuned in the lab is
 * what ships. Two layers, one truth, exactly as before:
 *
 *  - `.wq` (in flow): the settled 3-of-214 card every static view sees.
 *  - `.wq-before` (absolute overlay, exists under [data-anim]): the full
 *    pile. Under the GL tier it is TALL (nav-to-fold, CSS-capped) with a
 *    clipped `.wq-list` — 14 rows visible, 8 pool rows below the clip that
 *    backfill upward as waves lift sheets away.
 *
 * Row copy stays inside the sample close's world (M. Chen · ANA SFO→KIX trip
 * + the Chicago leg). Pool rows carry `.pool` so the DOM fallback tier can
 * hide them and keep today's compact pile.
 */

export interface CrowRow {
  kind: "crow";
  label: string;
  amount: string;
  pool?: boolean;
}

export interface ExceptionRow {
  kind: "exception";
  who: string;
  detail: string;
  amount: string;
  rule: string;
}

export type PanelRow = CrowRow | ExceptionRow;

/* A handful, not a blizzard (owner's calls, 2026-07-08): six clearable rows,
   ALL visible in the expansive pane, sweep away — nothing feeds in from
   below, no pile behind the fold. What you see is what the wind takes.
   The tally still tells the 214 story; the paper just doesn't crowd it. */
export const PANEL_ROWS: PanelRow[] = [
  { kind: "crow", label: "ANA · SFO → KIX", amount: "$980.00" },
  { kind: "crow", label: "Hyatt Osaka · night 1", amount: "$352.86" },
  { kind: "exception", who: "M. Chen", detail: "Kitcho · dinner, Osaka", amount: "$95.62", rule: "MEAL-03 · over cap" },
  { kind: "crow", label: "MK Taxi · Osaka", amount: "$21.55" },
  { kind: "crow", label: "Uber · SFO airport", amount: "$34.12" },
  { kind: "exception", who: "R. Alvarez", detail: "Team dinner ×6", amount: "$612.00", rule: "MEAL-01 · not itemized" },
  { kind: "crow", label: "Marriott · Chicago", amount: "$418.75" },
  { kind: "exception", who: "J. Park", detail: "Delta · seat upgrade", amount: "$780.00", rule: "FLT-02 · above cabin" },
];

export const CROW_COUNT = PANEL_ROWS.filter((r) => r.kind === "crow").length;

function Foot() {
  return (
    <>
      <span className="dot" />
      <span>
        <b>211 cleared themselves.</b> Sylph carried them off.
      </span>
    </>
  );
}

/**
 * The head is the headline now: a giant serif tally that falls 214 → 3 while
 * the wind works, over a meter that drains to the amber sliver of exceptions.
 * Selector contract (orchestrator + reset): the falling number is
 * `.wq-head .n b`; the meter fill is `.wq-meter .fill`.
 */
function Head({ count }: { count: string }) {
  return (
    <div className="wq-head">
      <span className="t">
        Needs review <small>· this month</small>
      </span>
      <span className="n">
        <b>{count}</b>
        <span className="of">
          flagged · of <strong>214</strong> checked
        </span>
      </span>
      <span className="wq-meter">
        <i className="fill" />
        <i className="cap" />
      </span>
    </div>
  );
}

function Exception({ row }: { row: ExceptionRow }) {
  return (
    <div className="wq-row">
      <div className="who">
        <b>{row.who}</b>
        <span>{row.detail}</span>
      </div>
      <span className="amt">{row.amount}</span>
      <span className="rule">{row.rule}</span>
    </div>
  );
}

/**
 * Both layers. The overlay's initial tally reads 214; the truth reads 3.
 * JS owns visibility exactly as before (truth hidden while data-anim).
 */
export function QueuePanel() {
  return (
    <>
      {/* truth: the settled queue — what every static view sees */}
      <div
        className="wq"
        role="img"
        aria-label="Sample review queue: of 214 charges this month, 211 cleared themselves and 3 exceptions await review"
      >
        <div aria-hidden="true">
          <Head count="3" />
          {PANEL_ROWS.filter((r): r is ExceptionRow => r.kind === "exception").map((row) => (
            <Exception key={row.who} row={row} />
          ))}
          <div className="wq-foot">
            <Foot />
          </div>
        </div>
      </div>

      {/* before: the full pile — exists only while JS owns the wind */}
      <div className="wq-before" aria-hidden="true">
        <Head count="214" />
        <div className="wq-list">
          {PANEL_ROWS.map((row, i) =>
            row.kind === "exception" ? (
              <Exception key={row.who} row={row} />
            ) : (
              <div key={`${row.label}-${i}`} className={row.pool ? "crow pool" : "crow"}>
                <span>{row.label}</span>
                <span className="amt2">{row.amount}</span>
                <span className="ok">cleared</span>
              </div>
            ),
          )}
        </div>
        <div className="wq-foot" style={{ opacity: 0 }}>
          <Foot />
        </div>
      </div>
    </>
  );
}
