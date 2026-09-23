import { Mark } from "@/components/custom/site/mark";
import { DEMO } from "@/components/custom/site/anchors";
import { QBO_LIVE } from "@/components/custom/site/sample-data";
import { Beat, Berth, Chip, Clock, Fig, Head, Msg, Panel, Phone, Sample, Straddle, Swap, Tick, Who } from "./parts";

/*
 * The story, as shared moments. Story time (the numbers on data-at / data-until) runs 0 to 6:
 * beat k holds from k to k+1, the charge crosses the seam between k+0.12 and k+0.62, and what the
 * landing causes appears just after. The server render is the settled end state of every beat,
 * which is what reduced motion and no script show.
 */

const PRIYA = "On the road in Denver";
const DANA = "Closes the books";

function Rcpt() {
  return (
    <span className="jn-rcpt" aria-label="Photo of the Sushi Kanda receipt: omakase 72.00, tea 4.00, tax 8.20, total 84.20">
      <b>SUSHI KANDA</b>
      <span>Denver, CO</span>
      <span className="jn-rcpt-l">
        <span>Omakase</span>
        <span>72.00</span>
      </span>
      <span className="jn-rcpt-l">
        <span>Tea</span>
        <span>4.00</span>
      </span>
      <span className="jn-rcpt-l">
        <span>Tax</span>
        <span>8.20</span>
      </span>
      <span className="jn-rcpt-l jn-rcpt-t">
        <span>TOTAL</span>
        <span>84.20</span>
      </span>
    </span>
  );
}

function Row({ m, a, cite, v, children, className = "" }: { m: string; a: string; cite?: string; v?: "ok" | "note" | "block"; children?: React.ReactNode; className?: string }) {
  return (
    <li className={`jn-row ${className}`}>
      <span className="jn-row-m">
        {m}
        {cite && <span className="jn-row-c mono">{cite}</span>}
      </span>
      <span className="jn-row-a mono">{a}</span>
      {v ? <Chip v={v} /> : children}
    </li>
  );
}

/* ---------- 0. the first screen: both faces, the seam, the charge on it ---------- */
export function Hero() {
  return (
    <Beat
      i={0}
      id="jn-top"
      label="Sylph: two sides of one charge"
      className="jn-beat--hero"
      p={
        <>
          <div className="jn-col jn-col--hero">
            <Who who="priya" role="Spent it, on the road" />
            <p className="jn-lede">She texts a photo of the receipt and gets an answer that names the rule.</p>
            <a className="jn-follow" href="#jn-b1" data-jn-go="1">
              Follow the charge
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M8 3v10M3.5 8.5 8 13l4.5-4.5" />
              </svg>
            </a>
          </div>
          <Fig pose="priya-walk" className="jn-fig--hero" eager />
        </>
      }
      d={
        <>
          <div className="jn-col jn-col--hero">
            <Who who="dana" role={DANA} />
            <p className="jn-lede">Sylph checks every charge against the policy as it happens. He sees only the exceptions.</p>
            <a className="jn-btn jn-btn--face" href={DEMO}>
              Book a demo
            </a>
          </div>
          <Fig pose="dana-review" className="jn-fig--hero" eager />
        </>
      }
      seam={
        <>
          <Straddle y="var(--h1-y)" className="jn-st--h1">
            <h1 className="jn-h1">
              <span className="jn-h1-wide">
                <span>Nothing to chase</span>
                <span>at month end.</span>
              </span>
              <span className="jn-h1-narrow">
                <span>Nothing to</span>
                <span>chase at</span>
                <span>month end.</span>
              </span>
            </h1>
          </Straddle>
          <Straddle y="var(--pill-y)" x="var(--pill-x)" className="jn-st--pill">
            <Berth id="0s" slot="" gone={false} />
            <span className="jn-pill-note mono">Sample data</span>
          </Straddle>
        </>
      }
    />
  );
}

/* ---------- 1. she texts the photo / it finds its charge ---------- */
export function Beat1() {
  return (
    <Beat
      i={1}
      id="jn-b1"
      label="Seven fifty two in the evening: the receipt"
      p={
        <>
          <div className="jn-col">
            <Who who="priya" role={PRIYA} />
            <h2 className="jn-h2">She texts a photo.</h2>
            <p className="jn-body">No app to open, no report to build. Text, email or upload, whichever is nearest.</p>
            <Phone>
              <Msg from="her" className="jn-msg--photo">
                <Rcpt />
              </Msg>
              <div className="jn-berth-row jn-berth-row--her">
                <Berth id="1p" slot="Sent" />
              </div>
            </Phone>
          </div>
          <Fig pose="priya-snap" />
        </>
      }
      d={
        <>
          <div className="jn-col">
            <Who who="dana" role={DANA} />
            <h2 className="jn-h2">It finds its charge.</h2>
            <p className="jn-body">The receipt lands on the card charge it belongs to, on the cards and bank the company already has.</p>
            <Panel title="Card 4417">
              <div className="jn-match">
                <div className="jn-match-top">
                  <span className="jn-match-d mono">Sep 12</span>
                  <span className="jn-match-m">Sushi Kanda</span>
                  <span className="jn-match-a mono">$84.20</span>
                </div>
                <div className="jn-match-r">
                  <span className="jn-match-k">Receipt</span>
                  <Berth id="1d" slot="No receipt yet" gone={false} />
                </div>
                <Swap
                  at={1.54}
                  className="jn-match-s"
                  before={<span className="jn-wait">Waiting for its receipt</span>}
                  after={
                    <span className="jn-ok">
                      <Tick /> Matched: amount and date agree
                    </span>
                  }
                />
              </div>
              <ul className="jn-rows">
                <Row m="United Airlines" a="$412.30">
                  <span className="jn-rin">
                    <Tick /> Receipt in
                  </span>
                </Row>
                <Row m="Hyatt Regency Denver" a="$258.00" className="jn-m-hide">
                  <span className="jn-rin">
                    <Tick /> Receipt in
                  </span>
                </Row>
                <Row m="Lyft" a="$23.15" className="jn-m-hide jn-s-hide">
                  <span className="jn-rin">
                    <Tick /> Receipt in
                  </span>
                </Row>
              </ul>
            </Panel>
          </div>
          <Fig pose="dana-desk" className="jn-fig--desk" />
        </>
      }
      seam={<Clock day="Sep 12" time="7:52 pm" />}
    />
  );
}

/* ---------- 2. the rule he approved / the answer that names it ---------- */
export function Beat2() {
  return (
    <Beat
      i={2}
      id="jn-b2"
      label="Seven fifty three: the rule"
      p={
        <>
          <div className="jn-col">
            <Who who="priya" role={PRIYA} />
            <h2 className="jn-h2">The answer names the rule.</h2>
            <p className="jn-body">Not a guess, a citation: the rule, the threshold and the amount. Same charge, same answer, every time.</p>
            <Phone>
              <Msg from="her" className="jn-msg--thumb">
                Photo: Sushi Kanda receipt
              </Msg>
              <Msg from="sylph" className="jn-msg--answer">
                <span className="jn-berth-row">
                  <Berth id="2p" slot="Checking" gone={false} />
                </span>
                <span className="jn-answer" data-at={2.54}>
                  <span>Matched to your card.</span>
                  <Chip v="note" />
                  <span className="mono jn-cite">M-041, $9.20 over the $75 dinner cap.</span>
                  <span>Reply with a note.</span>
                </span>
              </Msg>
            </Phone>
          </div>
          <Fig pose="priya-snap" swap="priya-read" at={2.52} />
        </>
      }
      d={
        <>
          <div className="jn-col">
            <Who who="dana" role={DANA} />
            <h2 className="jn-h2">Checked against a rule he approved.</h2>
            <p className="jn-body">Sylph read the policy and drafted the rules. Dana approved them once. No model in the decision.</p>
            <Panel title="Travel policy, compiled">
              <blockquote className="jn-quote">
                <span className="mono">4.2</span> Dinners are reimbursed up to $75 per person.
              </blockquote>
              <div className="jn-rule">
                <div className="jn-rule-top">
                  <span className="mono jn-rule-id">M-041</span>
                  <span className="jn-rule-n">Dinner cap</span>
                  <span className="jn-rule-by">Approved by Dana, Aug 28</span>
                </div>
                <span className="mono jn-rule-x">dinner, per person, at most $75.00</span>
                <div className="jn-rule-r">
                  <Berth id="2d" slot="Checked" />
                  <span className="jn-rule-out mono" data-at={2.2}>
                    $9.20 over
                  </span>
                </div>
              </div>
              <ul className="jn-rules mono jn-m-hide">
                <li>
                  <b>M-012</b> Lunch, at most $25
                </li>
                <li>
                  <b>M-022</b> Alcohol, kept off the total
                </li>
                <li className="jn-s-hide">
                  <b>L-007</b> Lodging, at most $350 a night
                </li>
              </ul>
            </Panel>
          </div>
          <Fig pose="dana-review" />
        </>
      }
      seam={<Clock day="Sep 12" time="7:53 pm" />}
    />
  );
}

/* ---------- 3. her note / his one exception ---------- */
export function Beat3() {
  return (
    <Beat
      i={3}
      id="jn-b3"
      label="Five past eight: the note"
      p={
        <>
          <div className="jn-col">
            <Who who="priya" role={PRIYA} />
            <h2 className="jn-h2">She answers in one line.</h2>
            <p className="jn-body">Her reason travels with the charge. Nobody writes an email about a dinner.</p>
            <Phone>
              <Msg from="sylph" className="jn-msg--small">
                <Chip v="note" /> <span className="mono jn-cite">M-041, $9.20 over the $75 dinner cap.</span>
              </Msg>
              <Msg from="her">Late finish at the site visit, only place still open.</Msg>
              <div className="jn-berth-row jn-berth-row--her">
                <Berth id="3p" slot="Sent with her note" />
              </div>
              <p className="jn-status" data-at={3.3}>
                Sent to Dana with your note.
              </p>
            </Phone>
          </div>
          <Fig pose="priya-walk" />
        </>
      }
      d={
        <>
          <div className="jn-col">
            <Who who="dana" role={DANA} />
            <h2 className="jn-h2">It arrives as his one exception.</h2>
            <p className="jn-body">His queue holds only what needs a person, each with its rule, its amount and the reason.</p>
            <Panel
              title={
                <>
                  Needs you <Swap at={3.52} className="jn-count" before="0" after="1" />
                </>
              }
            >
              <div className="jn-exc">
                <Berth id="3d" slot="Nothing waiting" gone={false} />
                <div className="jn-exc-body" data-at={3.56}>
                  <span className="jn-exc-top">
                    <Chip v="note" />
                    <span className="mono jn-cite">M-041, $9.20 over the $75 dinner cap</span>
                  </span>
                  <span className="jn-exc-note">
                    <Head who="priya" size={22} />
                    <q>Late finish at the site visit, only place still open.</q>
                  </span>
                  <span className="jn-exc-act">
                    <span className="jn-fake jn-fake--go">Approve</span>
                    <span className="jn-fake">Return</span>
                  </span>
                </div>
              </div>
              <p className="jn-filed jn-m-hide">
                <span>Filed itself</span>
                <span className="mono">5 cleared, on the report</span>
              </p>
            </Panel>
          </div>
          <Fig pose="dana-desk" swap="dana-desk-look" at={3.53} className="jn-fig--desk" />
        </>
      }
      seam={<Clock day="Sep 12" time="8:05 pm" />}
    />
  );
}

/* ---------- 4. he approves one, the rest filed itself / she hears back once ---------- */
export function Beat4() {
  return (
    <Beat
      i={4}
      id="jn-b4"
      label="The next morning: the approval"
      p={
        <>
          <div className="jn-col">
            <Who who="priya" role={PRIYA} />
            <h2 className="jn-h2">She hears back once.</h2>
            <p className="jn-body">Approved, and on her September report. Nothing else to send, nobody to chase.</p>
            <Phone>
              <Msg from="her" className="jn-msg--small">
                Late finish at the site visit, only place still open.
              </Msg>
              <Msg from="sylph" className="jn-msg--answer">
                <span className="jn-berth-row">
                  <Berth id="4p" slot="" gone={false} />
                </span>
                <span className="jn-answer" data-at={4.54}>
                  <Chip v="done" />
                  <span>Approved by Dana. On your September report.</span>
                </span>
              </Msg>
            </Phone>
          </div>
          <Fig pose="priya-read" />
        </>
      }
      d={
        <>
          <div className="jn-col">
            <Who who="dana" role={DANA} />
            <h2 className="jn-h2">He approves one. The rest filed itself.</h2>
            <p className="jn-body">Everything in policy cleared on its own, each citing its rule. The bar tab is kept off the reimbursable total, not declined at the table.</p>
            <Panel title="Priya, September">
              <div className="jn-appr">
                <Berth id="4d" slot="Approved, 9:14 am" />
                <span className="jn-fake jn-fake--go jn-fake--done">
                  <Tick /> Approved
                </span>
              </div>
              <ul className="jn-rows jn-rows--cite">
                <Row m="United Airlines" cite="T-004" a="$412.30" v="ok" />
                <Row m="Hyatt Regency Denver" cite="L-007" a="$258.00" v="ok" className="jn-m-hide" />
                <Row m="Amtrak" cite="T-011" a="$118.00" v="ok" className="jn-m-hide jn-s-hide" />
                <Row m="Lyft" cite="G-002" a="$23.15" v="ok" className="jn-m-hide jn-s-hide" />
                <Row m="Blue Bottle Coffee" cite="M-010" a="$6.40" v="ok" className="jn-m-hide" />
                <Row m="Bar Bianco" cite="M-022, alcohol" a="$46.90" v="block" />
              </ul>
            </Panel>
          </div>
          <Fig pose="dana-look" />
        </>
      }
      seam={<Clock day="Sep 13" time="9:14 am" />}
    />
  );
}

/* ---------- 5. month end: the halves meet, and the report is already there ---------- */
function Report() {
  const rows: [string, string, string, "ok" | "block" | "done"][] = [
    ["United Airlines", "T-004", "$412.30", "ok"],
    ["Hyatt Regency Denver", "L-007", "$258.00", "ok"],
    ["Sushi Kanda", "M-041, note", "$84.20", "done"],
    ["Amtrak", "T-011", "$118.00", "ok"],
    ["Lyft", "G-002", "$23.15", "ok"],
    ["Blue Bottle Coffee", "M-010", "$6.40", "ok"],
    ["Bar Bianco", "M-022", "$46.90", "block"],
  ];
  return (
    <div className="jn-report">
      <div className="jn-report-head">
        <Mark className="jn-report-mark" />
        <span className="jn-report-t">
          <b>September report</b>
          <span>Priya, travel and expenses, Sep 1 to Sep 30</span>
        </span>
        <Sample />
      </div>
      <ul className="jn-report-rows">
        {rows.map(([m, c, a, v]) => (
          <li key={m} className={m === "Sushi Kanda" ? "is-hers" : m === "Amtrak" || m === "Lyft" ? "jn-m-hide jn-s-hide" : undefined}>
            <span className="jn-report-m">{m}</span>
            <span className="mono jn-report-c">{c}</span>
            <span className="mono jn-report-a">{a}</span>
            <Chip v={v} />
          </li>
        ))}
      </ul>
      <div className="jn-report-sum">
        <span>Reimbursable</span>
        <b className="mono">$902.05</b>
        <span>Kept off the total</span>
        <span className="mono">$46.90</span>
      </div>
      <div className="jn-report-out">
        <span>PDF</span>
        <span>XLSX</span>
        <span>GL journal CSV</span>
        {QBO_LIVE && <span>QuickBooks Online</span>}
      </div>
    </div>
  );
}

export function Meet() {
  return (
    <Beat
      i={5}
      id="jn-meet"
      label="Month end: the report"
      meet
      className="jn-beat--meet"
      p={
        <>
          <p className="jn-cap" data-until={5.16}>
            Nothing left to send.
          </p>
          <Fig pose="priya-read" className="jn-fig--meet" />
        </>
      }
      d={
        <>
          <p className="jn-cap" data-until={5.16}>
            Nothing left to chase.
          </p>
          <Fig pose="dana-look" className="jn-fig--meet" />
        </>
      }
      seam={
        <>
          <Clock day="Sep 30" time="Month end" />
          <Straddle y="var(--meet-h-y)" className="jn-st--meet-h" at={5.42}>
            <h2 className="jn-h2 jn-h2--one">The report is already there.</h2>
            <p className="jn-one-sub">Every charge with its receipt, its rule and its verdict. Audit-grade PDF, XLSX and a GL journal CSV{QBO_LIVE ? ", posted to QuickBooks Online" : ""}.</p>
          </Straddle>
          <Straddle y="var(--report-y)" className="jn-st--report">
            <Report />
          </Straddle>
        </>
      }
    />
  );
}
