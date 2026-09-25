import Image from "next/image";
import Link from "next/link";
import { Mark } from "@/components/custom/site/mark";
import { APP_LOGIN, DEMO } from "@/components/custom/site/anchors";
import {
  BEAT,
  CHECK,
  CLEARED,
  CLEARED_TOTAL,
  DEFAULT_RULES,
  DUPES,
  EXCEPTIONS,
  FOREIGN,
  MONTH,
  NO_RECEIPT,
  PEOPLE,
  PERSON_INK,
  RULE_BEATS,
  WITH_RECEIPT,
  andList,
  byPerson,
  fxAmount,
  money,
  personName,
  ruleFlagged,
  ruleRows,
  say,
  shortDate,
  type MonthCharge,
} from "./data";
import { Face, PileScene } from "./pile";
import { Deal } from "./deal";

/* Every sentence below is assembled from data.ts, so the copy cannot drift from the month it describes. */

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const VERDICT = { ok: "Cleared", note: "Needs a note", block: "Blocked" } as const;
const CURRENCY: Record<string, string> = { GBP: "pounds", EUR: "euros", JPY: "yen", CAD: "Canadian dollars" };

export function DNav() {
  return (
    <header className="md-nav">
      <Link href="/mock/D" className="md-brand" aria-label="Sylph, top of page">
        <Mark className="md-brand-mark" />
        <span>Sylph</span>
      </Link>
      <nav className="md-nav-links" aria-label="Primary">
        <a href={APP_LOGIN} className="md-link">
          Log in
        </a>
        <Link href={DEMO} className="md-btn md-btn--ink">
          Book a demo
        </Link>
      </nav>
    </header>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <p className="md-step">
      <span className="md-step-n">{n}</span>
      {children}
    </p>
  );
}

function Copy({ beat, children, className = "" }: { beat?: number; children: React.ReactNode; className?: string }) {
  return (
    <div className={`md-beat ${className}`} data-md-beat={beat}>
      <div className="md-copy">{children}</div>
    </div>
  );
}

export function Sorted() {
  const underReceipt = NO_RECEIPT.filter((r) => r.amount <= DEFAULT_RULES.receipt.v);
  const currencies = [...new Set(FOREIGN.map((r) => r.fx!.code))].map((c) => CURRENCY[c]);
  const biggestFx = [...FOREIGN].sort((a, b) => b.amount - a.amount)[0];
  const dupeLines = DUPES.map(([a, b]) =>
    a.merchant === b.merchant
      ? `${personName(b.who)}’s ${b.merchant}, ${money(b.amount)}, posted twice on ${shortDate(b.date)}`
      : `${personName(b.who)}’s ${a.merchant} and ${b.merchant}, ${money(b.amount)} each, both on ${shortDate(b.date)}`,
  );

  return (
    <div className="md-sort">
      <PileScene />

      <section className="md-sec md-sec--pile" aria-labelledby="md-h1" id="top">
        <div className="md-hero">
          <p className="md-kicker">
            <span className="md-sample">Sample month</span> September, one small company
          </p>
          <h1 id="md-h1" className="md-h1">
            {MONTH.length} charges.
            <br />
            Dana reads {EXCEPTIONS.length}.
          </h1>
          <p className="md-lede">
            Six people spent the month on their cards. Sylph checks every charge against the policy you approved, files
            what fits, and leaves finance the exceptions, each naming its rule, threshold and amount.
          </p>
          <ul className="md-people" aria-label="Who spent it">
            {PEOPLE.map((p) => (
              <li key={p.id} style={{ ["--pc" as string]: PERSON_INK[p.id] }}>
                <Face id={p.id} />
                <span>
                  <b>{p.name}</b> {byPerson(p.id).length}
                </span>
              </li>
            ))}
          </ul>
          <div className="md-cta">
            <Link href={DEMO} className="md-btn md-btn--ink">
              Book a demo
            </Link>
            <a href="#arrive" className="md-link md-link--down">
              Sort the pile
            </a>
          </div>
        </div>
      </section>

      <section className="md-sec md-sec--arrive" id="arrive" aria-labelledby="md-arrive">
        <Copy beat={BEAT.arrive}>
          <Step n={1}>Receipts find their charges</Step>
          <h2 id="md-arrive" className="md-h2">
            By text, by email, by upload. Each receipt finds its own charge.
          </h2>
          <p className="md-p">
            Nobody matches anything by hand. {WITH_RECEIPT.length} of the {MONTH.length} charges have their receipt
            before the month is out. Of the {NO_RECEIPT.length} without one, {underReceipt.length} are under $
            {DEFAULT_RULES.receipt.v}: coffee, a metro fare, parking.
          </p>
        </Copy>
      </section>

      <section className="md-sec md-sec--convert" aria-labelledby="md-convert">
        <Copy beat={BEAT.convert}>
          <Step n={2}>Foreign currency converts</Step>
          <h2 id="md-convert" className="md-h2">
            {cap(say(FOREIGN.length))} charges came in {andList(currencies)}.
          </h2>
          <p className="md-p">
            Each converts to dollars at the rate on its receipt date and keeps the original beside it.{" "}
            {personName(biggestFx.who)}’s {biggestFx.nights} nights at {biggestFx.merchant}: {fxAmount(biggestFx)} on the
            folio, {money(biggestFx.amount)} in the report.
          </p>
        </Copy>
      </section>

      <section className="md-sec md-sec--dupes" aria-labelledby="md-dupes">
        <Copy beat={BEAT.dupes}>
          <Step n={3}>Same-day duplicates</Step>
          <h2 id="md-dupes" className="md-h2">
            {cap(say(DUPES.length))} charges look like the same thing, twice.
          </h2>
          <p className="md-p">
            {cap(andList(dupeLines))}. The second of each pair gets clipped to the first and waits for a note (D-001).
          </p>
        </Copy>
      </section>

      <section className="md-sec md-sec--rules" aria-labelledby="md-rules">
        <Copy beat={BEAT.dinner}>
          <Step n={4}>The rules you approved</Step>
          <h2 id="md-rules" className="md-h2">
            Then the rules sweep through, each drawing its line.
          </h2>
          <p className="md-p md-p--quiet">
            AI drafted them from the policy and a person approved every one. The check itself is arithmetic: same charge,
            same answer, no model in the decision.
          </p>
          <RuleNote i={0} />
        </Copy>
        <Copy beat={BEAT.hotel} className="md-copy--rule">
          <RuleNote i={1} />
        </Copy>
        <Copy beat={BEAT.alcohol} className="md-copy--rule">
          <RuleNote i={2} />
        </Copy>
        <Copy beat={BEAT.receipt} className="md-copy--rule">
          <RuleNote i={3} />
        </Copy>
      </section>

      <section className="md-sec md-sec--file" aria-labelledby="md-file">
        <Copy beat={BEAT.file}>
          <Step n={5}>Filed</Step>
          <h2 id="md-file" className="md-h2">
            {CLEARED.length} charges file themselves into September’s report.
          </h2>
          <p className="md-p">
            {money(CLEARED_TOTAL)}, every verdict citing its rule. It leaves as an audit-grade PDF, an XLSX and a GL
            journal CSV, and posts to QuickBooks Online. Nobody typed a line of it.
          </p>
        </Copy>
      </section>
    </div>
  );
}

function RuleNote({ i }: { i: number }) {
  const rb = RULE_BEATS[i];
  const rows = ruleRows(rb);
  const hit = ruleFlagged(rb);
  const val = (r: MonthCharge) => money(rb.value(r));
  let body: string;
  if (rb.code === "M-041") {
    const under = rows.filter((r) => !hit.includes(r)).sort((a, b) => rb.value(b) - rb.value(a))[0];
    body = `${cap(say(rows.length))} dinners, divided by the people at the table. ${cap(say(hit.length))} land over the line: ${andList(hit.map((r) => r.merchant))}. ${under.merchant}, at ${val(under)}, clears by ${Math.round((rb.at! - rb.value(under)) * 100)} cents.`;
  } else if (rb.code === "L-007") {
    const under = rows.filter((r) => !hit.includes(r)).sort((a, b) => rb.value(b) - rb.value(a))[0];
    body = `${cap(say(rows.length))} hotel folios, divided by their nights. ${andList(hit.map((r) => `${r.merchant} runs ${val(r)} a night`))}. ${under.merchant} stays under at ${val(under)}.`;
  } else if (rb.code === "M-022") {
    body = `${cap(say(rows.length))} bar tabs: ${andList(rows.map((r) => `${personName(r.who)}’s ${r.merchant}`))}. Blocked means kept off the reimbursable total with the rule named. The card is never declined.`;
  } else {
    const under = rows.filter((r) => !hit.includes(r));
    body = `${cap(say(rows.length))} charges came without a receipt. ${cap(say(under.length))} are under $${rb.at} and need none. ${andList(hit.map((r) => `${r.merchant} at ${val(r)}`))} do.`;
  }
  return (
    <div className="md-rule-note">
      <p className="md-rule-h">
        <span className="md-code">{rb.code}</span>
        {rb.name}
        {rb.pill && <span className="md-rule-at">{rb.pill}</span>}
      </p>
      <p className="md-p">{body}</p>
    </div>
  );
}

export function ShortList() {
  const blocked = EXCEPTIONS.filter((r) => CHECK[r.id].v === "block").length;
  return (
    <section className="md-dana" aria-labelledby="md-dana-h">
      <div className="md-dana-in">
        <div className="md-dana-head">
          <Image className="md-dana-fig" src="/site/characters/dana-review.webp" alt="" width={619} height={1388} sizes="(max-width: 820px) 120px, 220px" />
          <div>
            <p className="md-kicker md-kicker--light">
              <Face id="dana" size={28} /> Dana, closes the books
            </p>
            <h2 id="md-dana-h" className="md-h2 md-h2--xl">
              {cap(say(EXCEPTIONS.length))} slips left. Each one says why.
            </h2>
            <p className="md-p">
              That is the whole review: {EXCEPTIONS.length - blocked} that need a note from the person who spent it and{" "}
              {blocked} blocked, out of {MONTH.length}. Every other charge is already in the report.
            </p>
          </div>
        </div>
        <Deal>
          <ol className="md-list">
            {EXCEPTIONS.map((r, k) => {
              const c = CHECK[r.id];
              return (
                <li key={r.id} className={`md-card md-card--${c.v}`} style={{ ["--pc" as string]: PERSON_INK[r.who], ["--k" as string]: k, ["--tilt" as string]: `${((k * 37) % 7) - 3}deg` }}>
                  <p className="md-card-who">
                    <Face id={r.who} size={22} />
                    <b>{personName(r.who)}</b>
                    <span>{shortDate(r.date)}</span>
                  </p>
                  <p className="md-card-m">{r.merchant}</p>
                  <p className="md-card-a">
                    {money(r.amount)}
                    {r.fx && <span> {fxAmount(r)}</span>}
                  </p>
                  <p className="md-card-v">
                    <span className={`md-chip md-chip--${c.v}`}>{VERDICT[c.v]}</span>
                  </p>
                  <p className="md-card-cite">{c.cite}</p>
                </li>
              );
            })}
          </ol>
        </Deal>
      </div>
    </section>
  );
}

export function DClose() {
  return (
    <section className="md-close" aria-labelledby="md-close-h">
      <div className="md-close-in">
        <div className="md-close-copy">
          <Mark className="md-close-mark" />
          <h2 id="md-close-h" className="md-h2 md-h2--xl">
            Close next month without chasing a receipt.
          </h2>
          <p className="md-p">
            Bring last month’s card statement, with or without a policy. Thirty minutes, your charges, real verdicts. Sylph
            books the flights too.
          </p>
          <div className="md-cta">
            <Link href={DEMO} className="md-btn md-btn--ink md-btn--lg">
              Book a demo
            </Link>
            <a href={APP_LOGIN} className="md-link">
              Log in
            </a>
          </div>
        </div>
        <Image className="md-close-fig" src="/site/characters/together.webp" alt="" width={912} height={960} sizes="(max-width: 820px) 70vw, 420px" />
      </div>
      <footer className="md-foot">
        <p>
          <Mark className="md-brand-mark" /> <b>Sylph</b> Expenses run on air.
        </p>
        <p className="md-foot-fine">
          Sample data throughout: the people, merchants and amounts are invented. Policies and receipts are encrypted in
          transit and at rest, and never used to train models. &copy; 2026 Janus Labs.
        </p>
        <nav aria-label="Footer" className="md-foot-links">
          <Link href={DEMO}>Book a demo</Link>
          <Link href="/pricing">Pricing</Link>
          <a href={APP_LOGIN}>Log in</a>
          <Link href="/privacy">Privacy</Link>
        </nav>
      </footer>
    </section>
  );
}
