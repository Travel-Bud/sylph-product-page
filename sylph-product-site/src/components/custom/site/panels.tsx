import { Obj } from "./obj";
import { QBO_LIVE } from "./sample-data";

/* Product surfaces used by the bento. Minimal text: numbers, names, states,
   and one citation where the citation is the information. */

const RULES = [
  { title: "Solo dinner cap $75", kind: "warn", on: true },
  { title: "Solo dinner hard cap $120", kind: "block" },
  { title: "Alcohol not reimbursable", kind: "block" },
  { title: "Itemized receipt over $25", kind: "warn" },
  { title: "Business cabin needs approval", kind: "warn" },
  { title: "Nightly rate cap by city", kind: "warn" },
] as const;

export function RuleRows({ n = RULES.length }: { n?: number }) {
  return (
    <ul className="rule-rows">
      {RULES.slice(0, n).map((r) => (
        <li key={r.title} className={`rule-row${"on" in r && r.on ? " is-on" : ""}`}>
          <span>{r.title}</span>
          <span className={`chip ${r.kind === "block" ? "chip-block" : "chip-warn"}`}>{r.kind === "block" ? "Block" : "Warn"}</span>
        </li>
      ))}
    </ul>
  );
}

export function RulesWindow() {
  return (
    <div className="win rules" aria-label="Sample policy rules window">
      <div className="win-bar">
        <span>Policy rules</span>
        <span className="sample">Sample data</span>
      </div>
      <div className="rules-stats">
        <div>
          <span className="rules-k">Rules</span>
          <span className="rules-v num">53</span>
        </div>
        <div>
          <span className="rules-k">Blocking</span>
          <span className="rules-v num">15</span>
        </div>
        <div>
          <span className="rules-k">Ruleset</span>
          <span className="rules-v num">
            v13c5b06e <span className="chip chip-ok">Active</span>
          </span>
        </div>
      </div>
      <div className="rules-body">
        <div className="rules-list">
          <RuleRows />
        </div>
        <div className="rules-detail">
          <div className="rules-detail-h">
            <span className="mono">M-041</span>
            <span className="chip chip-warn">Warn</span>
          </div>
          <h3>Solo dinner cap $75</h3>
          <p className="rules-src">From §4.2: &ldquo;Dinner while traveling alone is reimbursable up to $75.&rdquo;</p>
          <div className="tree">
            <div className="tree-op">ALL of</div>
            <div className="tree-row">
              <span className="tree-k">category</span>
              <span className="tree-o">is</span>
              <span className="tree-v">Meals</span>
            </div>
            <div className="tree-row">
              <span className="tree-k">meal</span>
              <span className="tree-o">is</span>
              <span className="tree-v">Dinner</span>
            </div>
            <div className="tree-row">
              <span className="tree-k">attendees</span>
              <span className="tree-o">=</span>
              <span className="tree-v">1</span>
            </div>
            <div className="tree-row">
              <span className="tree-k">amount</span>
              <span className="tree-o">&gt;</span>
              <span className="tree-v">75.00 USD</span>
            </div>
            <div className="tree-then">
              <span>then</span>
              <span className="verdict verdict-note">
                <i className="dot" />
                Needs a note
              </span>
            </div>
          </div>
          <div className="rules-approved mono">Approved by A. Sumant, Aug 14</div>
        </div>
      </div>
    </div>
  );
}

export function MatchCard({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`win rc-match${compact ? " is-compact" : ""}`} aria-label="Sample receipt match" data-once>
      {!compact && (
        <div className="win-bar">
          <span>Match</span>
          <span className="sample">Sample data</span>
        </div>
      )}
      <div className="rc-pair">
        <div className="rc-charge">
          <span className="rc-k">Card charge</span>
          <span className="rc-merchant">Sushi Kanda</span>
          <span className="mono">Sep 12, card 4417</span>
          <span className="num rc-amt">$84.20</span>
        </div>
        <div className="rc-tie">
          <span className="rc-tie-line" />
          <span className="chip chip-ok">Matched</span>
          <span className="rc-tie-line" />
        </div>
        <div className="rc-receipt" aria-hidden="true">
          <div className="rcp">
            <div className="rcp-h">SUSHI KANDA</div>
            <div className="rcp-l">
              <span>Omakase</span>
              <span>72.00</span>
            </div>
            <div className="rcp-l">
              <span>Tea</span>
              <span>4.00</span>
            </div>
            <div className="rcp-l">
              <span>Tax</span>
              <span>8.20</span>
            </div>
            <div className="rcp-t">
              <span>Total</span>
              <span>84.20</span>
            </div>
            <div className="rcp-f">Sep 12, 19:48</div>
          </div>
        </div>
      </div>
      {!compact && (
        <div className="rc-foot mono">
          <span>Amount and date agree</span>
          <span className="verdict verdict-note">
            <i className="dot" />
            Needs a note
          </span>
        </div>
      )}
    </div>
  );
}

const FARES = [
  { carrier: "ANA", route: "Nonstop, 10:40a to 2:25p +1", price: "$986.00", state: "ok", label: "In policy" },
  { carrier: "United", route: "1 stop, 9:15a to 4:50p +1", price: "$912.00", state: "ok", label: "Lowest in policy" },
  { carrier: "JAL", route: "Nonstop, 12:05p to 3:40p +1", price: "$3,410.00", state: "note", label: "Needs approval" },
] as const;

const ARC = "M 24 92 C 160 -10, 380 -10, 516 92";

export function RouteStrip() {
  return (
    <div className="route" aria-hidden="true" data-once>
      <svg className="route-svg" viewBox="0 0 540 110" preserveAspectRatio="none">
        <path className="route-arc" d={ARC} />
      </svg>
      <span className="route-marker" style={{ offsetPath: `path("${ARC}")` }} />
      <div className="route-ends mono">
        <span>
          <b>SFO</b> San Francisco
        </span>
        <span className="route-dur">11h 45m</span>
        <span>
          <b>KIX</b> Osaka
        </span>
      </div>
    </div>
  );
}

export function FaresWindow({ compact = false }: { compact?: boolean }) {
  const list = compact ? FARES.slice(1) : FARES;
  return (
    <div className={`win fares${compact ? " is-compact" : ""}`} aria-label="Sample fare results">
      {!compact && (
        <div className="win-bar">
          <span>Flights, SFO to KIX</span>
          <span className="sample">Sample data</span>
        </div>
      )}
      <RouteStrip />
      <ul className="fare-list">
        {list.map((f) => (
          <li key={f.carrier} className={`fare fare-${f.state}`}>
            <div className="fare-main">
              <span className="fare-carrier">{f.carrier}</span>
              <span className="fare-route mono">{f.route}</span>
            </div>
            <span className="fare-price num">{f.price}</span>
            <span className={`verdict verdict-${f.state}`}>
              <i className="dot" />
              {f.label}
            </span>
          </li>
        ))}
      </ul>
      {!compact && (
        <div className="fare-foot">
          <span className="mono">Osaka, Oct 14 to 18</span>
          <span className="chip chip-ok">Trip report opened</span>
        </div>
      )}
    </div>
  );
}

const LINES = [
  { n: 1, d: "Sep 11", m: "United Airlines", a: "412.30", v: "ok" },
  { n: 2, d: "Sep 12", m: "Lyft", a: "23.15", v: "ok" },
  { n: 3, d: "Sep 12", m: "Sushi Kanda", a: "84.20", v: "note" },
  { n: 4, d: "Sep 12", m: "Hyatt Regency Denver", a: "258.00", v: "ok" },
  { n: 5, d: "Sep 13", m: "Bar Bianco", a: "46.90", v: "block" },
  { n: 6, d: "Sep 13", m: "Amtrak", a: "118.00", v: "ok" },
] as const;

const V_LABEL = { ok: "Cleared", note: "Needs a note", block: "Blocked" } as const;

export function ReportPaper({ compact = false }: { compact?: boolean }) {
  const lines = compact ? LINES.slice(0, 3) : LINES;
  return (
    <div className={`paper${compact ? " is-compact" : ""}`} aria-label="Sample expense report">
      <div className="paper-h">
        <div>
          <span className="paper-k">Expense report</span>
          <span className="paper-t">September 2026, Priya Natarajan</span>
        </div>
        {!compact && <span className="sample">Sample data</span>}
      </div>
      <table className="paper-table">
        {!compact && (
          <thead>
            <tr>
              <th>Ln</th>
              <th>Date</th>
              <th>Merchant</th>
              <th className="ta-r">Amount</th>
              <th>Verdict</th>
            </tr>
          </thead>
        )}
        <tbody>
          {lines.map((l) => (
            <tr key={l.n}>
              <td className="num">{l.n}</td>
              <td className="num">{l.d}</td>
              <td>{l.m}</td>
              <td className="num ta-r">{l.a}</td>
              <td>
                <span className={`verdict verdict-${l.v}`}>
                  <i className="dot" />
                  {V_LABEL[l.v]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
        {!compact && (
          <tfoot>
            <tr>
              <td colSpan={3}>Report total</td>
              <td className="num ta-r">942.55</td>
              <td />
            </tr>
            <tr>
              <td colSpan={3}>Reimbursable after verdicts</td>
              <td className="num ta-r">895.65</td>
              <td />
            </tr>
          </tfoot>
        )}
      </table>
      <span className="paper-stamp" aria-hidden="true">
        Approved
        <small>Sep 30, A. Sumant</small>
      </span>
    </div>
  );
}

export function ExportChips() {
  return (
    <ul className="rec-exports">
      <li>
        <span className="chip chip-neutral">PDF</span>
        <span>Audit-grade statement</span>
      </li>
      <li>
        <span className="chip chip-neutral">XLSX</span>
        <span>Line items and rule references</span>
      </li>
      <li>
        <span className="chip chip-neutral">CSV</span>
        <span>Journal, payroll and AP files, coded to your accounts</span>
      </li>
      {QBO_LIVE && (
        <li>
          <span className="chip chip-neutral">QBO</span>
          <span>Posts the journal to QuickBooks&nbsp;Online</span>
        </li>
      )}
    </ul>
  );
}

export function CurrencyVisual({ large = false }: { large?: boolean }) {
  return (
    <div className={`fx${large ? " is-large" : ""}`} aria-label="Currency normalized">
      <span className="num fx-from">¥14,200</span>
      <span className="fx-arrow" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12h16M14 6l6 6-6 6" />
        </svg>
      </span>
      <span className="num fx-to">$95.62</span>
      <span className="fx-note mono">JPY, at the rate on the receipt date</span>
    </div>
  );
}

export function ReceiptWays({ compact = false }: { compact?: boolean }) {
  return (
    <ul className={`ways${compact ? " is-compact" : ""}`}>
      <li>
        <Obj name="tray" size={compact ? 72 : 96} />
        <span>Upload</span>
      </li>
      <li>
        <Obj name="envelope" size={compact ? 72 : 96} />
        <span>Email</span>
      </li>
      <li>
        <Obj name="phone" size={compact ? 72 : 96} />
        <span>Text</span>
      </li>
    </ul>
  );
}
