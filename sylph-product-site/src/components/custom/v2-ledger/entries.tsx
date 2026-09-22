import type { ReactNode } from "react";
import { Obj } from "@/components/custom/site/obj";
import { DEMO } from "@/components/custom/site/anchors";
import { Folio, Stamp } from "./bits";
import { CHAPTERS, day2 } from "./data";

/* One chapter of the book: its day (visible in the date column on phones,
   read from the rail on desktop, spoken to assistive tech), a heading and its entry. */
export function Chapter({
  id,
  className = "",
  children,
}: {
  id: string;
  className?: string;
  children: ReactNode;
}) {
  const ch = CHAPTERS.find((c) => c.id === id);
  const day = ch?.day ?? 1;
  return (
    <section id={id} className={`lg-ch ${className}`} aria-labelledby={`${id}-h`}>
      <div className="lg-ch__date" aria-hidden="true">
        <b>{day2(day)}</b>
        <span>Sep</span>
      </div>
      {children}
    </section>
  );
}

function Head({ id, day, title, children }: { id: string; day: number; title: ReactNode; children?: ReactNode }) {
  return (
    <header className="lg-ch__head">
      <h2 id={`${id}-h`} className="lg-h2">
        <span className="lg-sr">September {day}. </span>
        {title}
      </h2>
      {children}
    </header>
  );
}

const HERO_ROWS = [
  { d: "03", name: "United Airlines", cite: "receipt by email, T-004, in policy", amt: "$412.30", v: "ok" as const, rot: -3 },
  { d: "09", name: "Sushi Kanda", cite: "M-041, $9.20 over the $75 dinner cap", amt: "$84.20", v: "note" as const, rot: -5 },
  { d: "10", name: "Bar Bianco", cite: "M-022, alcohol, kept off the total", amt: "$46.90", v: "block" as const, rot: 4 },
];

export function Hero() {
  return (
    <Chapter id="opened" className="lg-hero">
      <h1 id="opened-h" className="lg-h1">
        <span className="lg-h1__a">Stop chasing receipts.</span>
        <span className="lg-h1__b">The month closes itself.</span>
      </h1>
      <div className="lg-hero__row">
        <div className="lg-hero__copy">
          <p className="lg-lede">
            Sylph turns your spend policy into rules and checks every card charge as it happens. Receipts find their
            own charges. You see the exceptions, not the pile, and at month end the report is already written.
          </p>
          <div className="lg-ctas">
            <a className="lg-btn" href={DEMO}>
              Book a demo
            </a>
            <a className="lg-link" href="#charge">
              Read the month
            </a>
          </div>
          <p className="lg-fine">No policy document needed. Sylph writes one from a dozen answers.</p>
        </div>
        <div className="lg-hero__book" data-reveal="">
          <Folio head="September 2026" folio="Folio 1">
            <table className="lg-rows">
              <caption className="lg-sr">Three sample entries with their verdicts</caption>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Particulars</th>
                  <th scope="col" className="is-num">
                    Amount
                  </th>
                  <th scope="col" className="is-mark">
                    Verdict
                  </th>
                </tr>
              </thead>
              <tbody>
                {HERO_ROWS.map((r, i) => (
                  <tr key={r.name} className="lg-ink" style={{ ["--t" as string]: `${300 + i * 750}ms` }}>
                    <td className="is-date">{r.d}</td>
                    <td>
                      <span className="lg-rows__name">{r.name}</span>
                      <span className="lg-rows__cite">{r.cite}</span>
                    </td>
                    <td className="is-num">{r.amt}</td>
                    <td className="is-mark">
                      <Stamp tone={r.v} rot={r.rot} delay={750 + i * 750} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Folio>
        </div>
      </div>
    </Chapter>
  );
}

function ChargeRow({ matched }: { matched: boolean }) {
  return (
    <table className="lg-rows lg-rows--one">
      <caption className="lg-sr">{matched ? "The charge, matched to its receipt" : "The charge, waiting for its receipt"}</caption>
      <thead>
        <tr>
          <th scope="col">Date</th>
          <th scope="col">Particulars</th>
          <th scope="col" className="is-num">
            Amount
          </th>
          <th scope="col" className="is-mark">
            Receipt
          </th>
        </tr>
      </thead>
      <tbody>
        {matched ? null : (
          <tr className="is-prior">
            <td className="is-date">02</td>
            <td>
              <span className="lg-rows__name">Blue Bottle Coffee</span>
            </td>
            <td className="is-num">$6.40</td>
            <td className="is-mark">
              <span className="lg-await is-done">Matched</span>
            </td>
          </tr>
        )}
        <tr className="lg-ink" style={{ ["--t" as string]: "650ms" }}>
          <td className="is-date">03</td>
          <td>
            <span className="lg-rows__name">United Airlines</span>
            <span className="lg-rows__cite">Airfare, company card ending 4417</span>
          </td>
          <td className="is-num">$412.30</td>
          <td className="is-mark">
            {matched ? (
              <Stamp tone="ink" rot={-3} delay={1500}>
                Matched
              </Stamp>
            ) : (
              <span className="lg-await">Awaiting</span>
            )}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function Charge() {
  return (
    <Chapter id="charge" className="lg-split">
      <Head id="charge" day={3} title="The charge is in the book before anyone files it.">
        <p className="lg-p">
          Sylph reads the cards and banks you already have. Each charge is entered as it posts, dated and waiting for
          its receipt. Nothing to switch, no new card to issue.
        </p>
        <p className="lg-aside">The card stays. The chaos goes.</p>
      </Head>
      <div className="lg-entry lg-charge" data-reveal="">
        <Obj name="card" size={200} className="lg-charge__card" />
        <Folio head="Posted from the card feed" folio="Folio 3">
          <ChargeRow matched={false} />
        </Folio>
      </div>
    </Chapter>
  );
}

const SLIPS = [
  { obj: "receipt" as const, how: "Upload", line: "Dropped in from the web" },
  { obj: "envelope" as const, how: "Email", line: "Forwarded to your Sylph address", hit: true },
  { obj: "phone" as const, how: "Text", line: "Texted as a photo" },
];

export function Receipt() {
  return (
    <Chapter id="receipt" className="lg-split lg-split--flip">
      <Head id="receipt" day={4} title="The receipt finds its own charge.">
        <p className="lg-p">
          Upload it, forward the email or text the photo. Sylph reads it and finds the charge it belongs to. Nothing is
          judged until the two are matched: matching is the gate.
        </p>
      </Head>
      <div className="lg-entry lg-receipt" data-reveal="">
        <ul className="lg-slips">
          {SLIPS.map((s) => (
            <li key={s.how} className={`lg-slip${s.hit ? " is-hit" : ""}`}>
              <Obj name={s.obj} size={96} />
              <b>{s.how}</b>
              <span>{s.line}</span>
            </li>
          ))}
        </ul>
        <Folio head="September 2026" folio="Folio 4">
          <ChargeRow matched />
          <ul className="lg-notes-mini">
            <li>
              <span className="lg-notes-mini__k">FX</span>
              <span>
                JR East, <b>¥3,200</b> entered as <b>$21.55</b> at the rate on the receipt date.
              </span>
            </li>
            <li>
              <span className="lg-notes-mini__k">Dup</span>
              <span>
                Yellow Cab, <b>$41.60</b>, same amount and date as an Uber ride. Flagged, not paid twice.
              </span>
            </li>
          </ul>
        </Folio>
      </div>
    </Chapter>
  );
}

export function Rule() {
  return (
    <Chapter id="rule" className="lg-split">
      <Head id="rule" day={9} title="A verdict that cannot cite its rule is an opinion.">
        <p className="lg-p">
          Every verdict names the rule, the threshold and the amount. AI reads your policy and drafts the rules; a
          person approves them. No model sits in the decision, so the same charge gets the same answer every time, and
          the audit trail is written as it happens.
        </p>
      </Head>
      <div className="lg-entry lg-rule" data-reveal="">
        <Folio head="Cross reference" folio="Folio 9">
          <ol className="lg-chain">
            <li className="lg-chain__step" style={{ ["--t" as string]: "150ms" }}>
              <span className="lg-chain__k">Policy</span>
              <q className="lg-chain__quote">Dinner is capped at $75 a person. Anything over needs a note.</q>
            </li>
            <li className="lg-chain__step" style={{ ["--t" as string]: "650ms" }}>
              <span className="lg-chain__k">Rule</span>
              <code className="lg-chain__code">
                <b>M-041</b> meals, per person, over $75.00, needs a note
              </code>
              <span className="lg-chain__by">Drafted from the sentence above, approved Sep 1</span>
            </li>
            <li className="lg-chain__step" style={{ ["--t" as string]: "1150ms" }}>
              <span className="lg-chain__k">Entry</span>
              <span className="lg-chain__entry">
                <span>
                  Sep 09, <b>Sushi Kanda</b>
                </span>
                <b className="lg-chain__amt">$84.20</b>
              </span>
              <Stamp tone="note" rot={-5} delay={1700} className="lg-chain__stamp" />
            </li>
          </ol>
          <div className="lg-scale" role="img" aria-label="Scale: the $84.20 charge sits $9.20 over the $75 cap and under the $120 hard cap">
            <div className="lg-scale__bar">
              <span className="lg-scale__zone" />
              <span className="lg-scale__tick is-cap" style={{ left: "50%" }}>
                <i>cap $75</i>
              </span>
              <span className="lg-scale__tick is-block" style={{ left: "80%" }}>
                <i>hard cap $120</i>
              </span>
              <span className="lg-scale__pin" style={{ ["--x" as string]: "56.13%" }}>
                <i>$84.20, $9.20 over</i>
              </span>
            </div>
            <div className="lg-scale__ends">
              <span>$0</span>
              <span>$150</span>
            </div>
          </div>
        </Folio>
      </div>
    </Chapter>
  );
}
