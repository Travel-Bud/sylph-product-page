import Image from "next/image";
import { Mark } from "@/components/custom/site/mark";
import { APP_LOGIN, DEMO } from "@/components/custom/site/anchors";
import { CHARGE, FEED, LIFE, REPORT, REPORT_TOTAL, TEAR_BOTTOM, TEAR_TOP, VERDICT_LABEL, WEEK, WEEK_CLEARED, WEEK_EXCEPTIONS, fadeKeys } from "./data";
import { Bar, Chip, KV, P, Row, Rule, Stamp } from "./paper";
import { Approval, Exports } from "./controls";

/* ---------------------------------------------------------------- the world, seen from the paper */

function LifeLog() {
  return (
    <nav className="rcp-life" aria-label="This receipt's month">
      <p className="rcp-life-h">This receipt&apos;s month</p>
      <ol>
        {LIFE.map((e) => (
          <li key={e.id}>
            <a href={`#${e.id}`}>
              <span className="rcp-life-when">{e.when}</span>
              <span className="rcp-life-what">{e.what}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function Pov({ who, className = "" }: { who: "priya" | "dana"; className?: string }) {
  return (
    <div className={`rcp-pov rcp-pov--${who} ${className}`} data-cue="0.9" aria-hidden="true">
      <Image src={`/lab/receipt/pov-${who}.webp`} alt="" width={640} height={960} sizes="(max-width: 1099px) 200px, 480px" draggable={false} />
    </div>
  );
}

function MiniReceipt() {
  return (
    <span className="rcp-mini" aria-hidden="true">
      <span className="rcp-mini-t">SUSHI KANDA</span>
      <span className="rcp-mini-l" />
      <span className="rcp-mini-l rcp-mini-l--s" />
      <span className="rcp-mini-l" />
      <span className="rcp-mini-tot">84.20</span>
    </span>
  );
}

function SmsPhoto() {
  return (
    <div className="rcp-sms rcp-sms--photo" data-cue="0.8">
      <p className="rcp-sms-to">Priya to Sylph</p>
      <div className="rcp-bub rcp-bub--me">
        <MiniReceipt />
        <span className="rcp-bub-cap">Photo, 21:49</span>
      </div>
      <p className="rcp-sms-meta">Delivered</p>
    </div>
  );
}

function FeedSlip() {
  return (
    <div className="rcp-feedslip" data-cue="0.72">
      <div className="rcp-feedslip-h">
        <span>Card ****4417, Sep 12</span>
        <Chip />
      </div>
      <ol>
        {FEED.map((f) => (
          <li key={f.m} className={f.me ? "is-me" : undefined}>
            <span className="rcp-feedslip-m">{f.m}</span>
            <span className="rcp-feedslip-a">{f.a}</span>
          </li>
        ))}
      </ol>
      <p className="rcp-feedslip-foot">The card Priya already carries. Same bank, same card program.</p>
    </div>
  );
}

function PolicyPage() {
  return (
    <figure className="rcp-policy" data-cue="0.78">
      <figcaption>Travel and expense policy, section 4</figcaption>
      <p className="rcp-policy-dim">4.1 Book economy for flights under six hours.</p>
      <p className="rcp-policy-dim">4.2 Hotels up to $350 a night in major cities.</p>
      <p className="rcp-policy-hit">
        <mark>4.3 Dinner is reimbursed up to $75 per person, tax included.</mark>
      </p>
      <p className="rcp-policy-dim">4.4 No alcohol on the company card.</p>
    </figure>
  );
}

function SmsThread() {
  return (
    <div className="rcp-sms rcp-sms--thread" data-cue="0.72">
      <div className="rcp-sms-top">
        <p className="rcp-sms-to">Sylph to Priya, 21:49</p>
        <Chip />
      </div>
      <div className="rcp-bub rcp-bub--them">
        Matched to your card: Sushi Kanda, $84.20. Needs a note: M-041, $9.20 over the $75 dinner cap. Reply with a note.
      </div>
      <p className="rcp-sms-to rcp-sms-to--me">Priya, 21:52</p>
      <div className="rcp-bub rcp-bub--me rcp-bub--typed" data-type={CHARGE.note}>
        <span className="rcp-sr">{CHARGE.note}</span>
        <span data-type-out aria-hidden="true">
          {CHARGE.note}
        </span>
      </div>
    </div>
  );
}

function CustomerCopy() {
  return (
    <div className="rcp-copy">
      <p className="rcp-life-h">Customer copy</p>
      <p className="rcp-copy-for">For whoever closes the month.</p>
      <p className="rcp-copy-say">Sylph is travel and expense management. This is what it does to one receipt, start to finish.</p>
    </div>
  );
}

/* ---------------------------------------------------------------- the strip */

function Printed() {
  return (
    <section className="rcp-scene rcp-scene--printed" id="printed" data-log={LIFE[0].log} aria-labelledby="rcp-h1">
      <Row className="rcp-row--top" l={<LifeLog />} r={<CustomerCopy />}>
        <div className="rcp-top-chip">
          <Chip />
        </div>
        <p className="rcp-merchant rcp-ln">Sushi Kanda</p>
        <p className="rcp-center rcp-ln">Denver, CO</p>
        <div className="rcp-gap" />
        <KV k="Sat Sep 12 2026" v="21:47" className="rcp-kv--flat" />
        <KV k="Table 6, guests 1" v="Check 0212" className="rcp-kv--flat" />
        <Rule />
        <KV k="1  Omakase" v="72.00" className="rcp-kv--flat" />
        <KV k="1  Tea" v="4.00" className="rcp-kv--flat" />
        <KV k="   Tax" v="8.20" className="rcp-kv--flat" />
        <Rule kind="double" />
        <div className="rcp-total rcp-ln">
          <span>Total</span>
          <span>$84.20</span>
        </div>
        <KV k="Card ****4417" v="Chip" className="rcp-kv--flat" />
        <Rule />
        <p className="rcp-center rcp-ln">Thank you. Please come again.</p>
      </Row>
      <Row className="rcp-row--hero">
        <Rule kind="star" />
        <p className="rcp-kicker rcp-ln">Most receipts end here, in a coat pocket.</p>
        <h1 className="rcp-h1" id="rcp-h1">
          <span className="rcp-ln">Nobody had</span> <span className="rcp-ln">to chase me.</span>
        </h1>
        <P className="rcp-lede">
          I&apos;m Priya&apos;s dinner receipt. Sylph checks every card charge against your spend policy as it happens. Receipts
          like me find our own charges. At month end the report is already there.
        </P>
        <p className="rcp-hint rcp-ln">
          <a href="#texted">Scroll, and I&apos;ll print my September</a>
          <span aria-hidden="true" className="rcp-hint-arrow">
            ↓
          </span>
        </p>
      </Row>
    </section>
  );
}

function Texted() {
  return (
    <section className="rcp-scene" id="texted" data-log={LIFE[1].log} aria-labelledby="texted-h">
      <Row>
        <Bar when="21:49" what="Texted to Sylph" />
      </Row>
      <Row l={<SmsPhoto />} r={<Pov who="priya" />} inline={<Pov who="priya" className="rcp-pov--peek" />} className="rcp-row--pov">
        <span className="rcp-sr" id="texted-h">
          21:49, texted to Sylph
        </span>
        <P>Two minutes old. Priya took my picture and texted it to Sylph. Nothing to install, nothing to fill in.</P>
        <P>She could have emailed me or uploaded me instead. Same door either way.</P>
      </Row>
      <Row inline={<SmsPhoto />}>
        <div className="rcp-finder" data-cue="0.66">
          <span className="rcp-finder-c rcp-finder-c--tl" aria-hidden="true" />
          <span className="rcp-finder-c rcp-finder-c--tr" aria-hidden="true" />
          <span className="rcp-finder-c rcp-finder-c--bl" aria-hidden="true" />
          <span className="rcp-finder-c rcp-finder-c--br" aria-hidden="true" />
          <span className="rcp-flash" aria-hidden="true" />
          <div className="rcp-block-h rcp-ln">
            <span>Read from the photo</span>
            <Chip />
          </div>
          <KV k="Merchant" v="Sushi Kanda" />
          <KV k="Date" v="Sat Sep 12, 21:47" />
          <KV k="Total" v="$84.20" />
          <KV k="Card" v="****4417" />
          <KV k="Seen before" v="No, not a duplicate" />
        </div>
      </Row>
    </section>
  );
}

function Matched() {
  return (
    <section className="rcp-scene" id="matched" data-log={LIFE[2].log} aria-labelledby="matched-h">
      <Row>
        <Bar when="21:49" what="Found my charge" />
      </Row>
      <Row>
        <span className="rcp-sr" id="matched-h">
          21:49, found my charge
        </span>
        <P>Then I went looking for my charge. It was waiting for me, from the card Priya&apos;s company already issues. Nobody switched banks for me.</P>
      </Row>
      <Row l={<FeedSlip />} inline={<FeedSlip />} className="rcp-row--match">
        <div className="rcp-match" data-cue="0.62">
          <div className="rcp-block-h rcp-ln">
            <span>Matched</span>
          </div>
          <KV k="Card charge" v="SUSHI KANDA DENVER CO" />
          <KV k="Amount" v="84.20 = 84.20" />
          <KV k="Date" v="Sep 12 = Sep 12" />
          <Stamp tone="ink" rot={-5} sub="Card ****4417" className="rcp-stamp--matched" after>
            Matched
          </Stamp>
        </div>
      </Row>
      <Row>
        <P>Matching comes first. Until a receipt finds its charge, nobody judges it. I had found mine.</P>
      </Row>
    </section>
  );
}

function Read() {
  return (
    <section className="rcp-scene" id="read" data-log={LIFE[3].log} aria-labelledby="read-h">
      <Row>
        <Bar when="21:49" what="Read against M-041" />
      </Row>
      <Row l={<PolicyPage />} inline={<PolicyPage />} inlineEnd>
        <span className="rcp-sr" id="read-h">
          21:49, read against rule M-041
        </span>
        <P>Priya&apos;s company wrote its spend policy once. One sentence of it was about me.</P>
      </Row>
      <Row>
        <P>Sylph compiled that sentence into a rule, and a person at the company approved the rule, long before I was printed.</P>
        <div className="rcp-code rcp-ln" aria-label="Rule M-041">
          <span className="rcp-code-id">M-041</span>
          <span>Meals, dinner</span>
          <span className="rcp-code-if">if amount per person &gt; 75.00</span>
          <span className="rcp-code-then">then Needs a note</span>
        </div>
      </Row>
      <Row>
        <div className="rcp-meter" data-cue="0.64">
          <div className="rcp-block-h rcp-ln">
            <span>The reading</span>
            <Chip />
          </div>
          <div className="rcp-meter-row rcp-ln">
            <span className="rcp-meter-k">Cap</span>
            <span className="rcp-meter-track">
              <span className="rcp-meter-fill rcp-meter-fill--cap" />
            </span>
            <span className="rcp-meter-v">75.00</span>
          </div>
          <div className="rcp-meter-row rcp-ln">
            <span className="rcp-meter-k">Me</span>
            <span className="rcp-meter-track">
              <span className="rcp-meter-fill rcp-meter-fill--me" />
              <span className="rcp-meter-over" />
              <span className="rcp-meter-tick" aria-hidden="true" />
            </span>
            <span className="rcp-meter-v">84.20</span>
          </div>
          <div className="rcp-meter-row rcp-meter-row--over rcp-ln">
            <span className="rcp-meter-k">Over</span>
            <span className="rcp-meter-track rcp-meter-track--none" />
            <span className="rcp-meter-v">9.20</span>
          </div>
          <Stamp tone="amber" rot={-8} sub="M-041, $9.20 over the $75 dinner cap" className="rcp-stamp--note" after>
            Needs a note
          </Stamp>
        </div>
      </Row>
      <Row>
        <P>Every verdict names the rule, the threshold and the amount. No model makes the call. Same receipt, same rule, same answer, every time.</P>
        <div className="rcp-verdicts rcp-ln" role="list" aria-label="The three verdicts">
          <span role="listitem" className="rcp-v rcp-v--ok">
            {VERDICT_LABEL.ok}
          </span>
          <span role="listitem" className="rcp-v rcp-v--note is-me">
            {VERDICT_LABEL.note}
          </span>
          <span role="listitem" className="rcp-v rcp-v--block">
            {VERDICT_LABEL.block}
          </span>
        </div>
        <P className="rcp-small">Blocked keeps a charge off the reimbursable total. It never declines a card. I got the middle one.</P>
      </Row>
    </section>
  );
}

function Note() {
  return (
    <section className="rcp-scene" id="note" data-log={LIFE[4].log} aria-labelledby="note-h">
      <Row>
        <Bar when="21:52" what="Priya's note" />
      </Row>
      <Row r={<SmsThread />} inline={<SmsThread />} inlineEnd>
        <span className="rcp-sr" id="note-h">
          21:52, Priya&apos;s note
        </span>
        <P>Sylph texted Priya my verdict and asked for a note. She answered in the same thread three minutes later.</P>
      </Row>
      <Row>
        <div className="rcp-quote" data-cue="0.6">
          <p className="rcp-quote-h rcp-ln">Note, Priya, 21:52</p>
          <blockquote className="rcp-quote-b rcp-ln">{CHARGE.note}</blockquote>
        </div>
        <P>It&apos;s printed on me now. Wherever I go, it goes.</P>
      </Row>
    </section>
  );
}

function Queue() {
  return (
    <section className="rcp-scene" id="queue" data-log={LIFE[5].log} aria-labelledby="queue-h">
      <Row>
        <Bar when="Sep 14, 09:12" what="Dana's queue" />
      </Row>
      <Row r={<Pov who="dana" />} inline={<Pov who="dana" className="rcp-pov--peek" />} className="rcp-row--pov">
        <span className="rcp-sr" id="queue-h">
          Monday September 14, Dana&apos;s queue
        </span>
        <P>Monday. Dana closes the books. Twenty charges came in across the company that week.</P>
        <P>She didn&apos;t see twenty.</P>
      </Row>
      <Row>
        <div className="rcp-pile" data-cue="0.62">
          <div className="rcp-block-h rcp-ln">
            <span className="rcp-pile-t">
              <span className="rcp-pile-all">Charges, Sep 7 to 13: {WEEK.length}</span>
              <span className="rcp-pile-few">Dana&apos;s queue: {WEEK_EXCEPTIONS.length}</span>
            </span>
            <Chip />
          </div>
          <ol className="rcp-pile-list">
            {WEEK.map((r, i) => (
              <li
                key={r.merchant}
                className={`rcp-pr rcp-pr--${r.verdict} ${r.merchant === CHARGE.merchant ? "is-me" : ""}`}
                style={{ "--i": i } as React.CSSProperties}
              >
                <div className="rcp-pr-in">
                  <span className="rcp-pr-top">
                    <span className="rcp-pr-m">{r.merchant}</span>
                    <span className="rcp-pr-a">{r.amount.replace("$", "")}</span>
                    <span className={`rcp-pr-v rcp-pr-v--${r.verdict}`}>{VERDICT_LABEL[r.verdict]}</span>
                  </span>
                  {r.verdict !== "ok" ? (
                    <span className="rcp-pr-c">
                      {r.cite}
                      {r.merchant === CHARGE.merchant ? ". Note attached. That's me." : ""}
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
          <p className="rcp-pile-foot rcp-ln">
            {WEEK_CLEARED.length} cleared and filed themselves. {WEEK_EXCEPTIONS.length} came to Dana, each with its rule.
          </p>
        </div>
      </Row>
      <Row>
        <P>She sees the exceptions, not the pile. I was one of the five.</P>
        <Approval />
      </Row>
    </section>
  );
}

function Filed() {
  return (
    <section className="rcp-scene" id="filed" data-log={LIFE[6].log} aria-labelledby="filed-h">
      <Row>
        <Bar when="Sep 30" what="Filed, line 3" />
      </Row>
      <Row>
        <span className="rcp-sr" id="filed-h">
          September 30, filed on line 3
        </span>
        <P>The month closed on the 30th. Nobody went looking for me. I was already on line 3.</P>
        <div className="rcp-report" data-cue="0.6">
          <div className="rcp-block-h rcp-ln">
            <span>Priya&apos;s September report</span>
            <Chip />
          </div>
          <table className="rcp-rt">
            <caption className="rcp-sr">Priya&apos;s September report. Line 3 is this receipt.</caption>
            <thead>
              <tr className="rcp-ln">
                <th scope="col">Ln</th>
                <th scope="col" className="rcp-rt-d">
                  Date
                </th>
                <th scope="col">Merchant</th>
                <th scope="col" className="rcp-num">
                  Amount
                </th>
                <th scope="col">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {REPORT.map((l) => (
                <tr key={l.n} className={`rcp-ln ${l.n === 3 ? "is-me" : ""} rcp-rt--${l.v}`}>
                  <td>{l.n}</td>
                  <td className="rcp-rt-d">{l.d}</td>
                  <td>
                    {l.m}
                    {l.n === 3 ? <span className="rcp-rt-me"> ◀ me</span> : null}
                  </td>
                  <td className="rcp-num">{l.a}</td>
                  <td className="rcp-rt-say">{l.say}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="rcp-ln">
                <td />
                <td className="rcp-rt-d" />
                <td>Reimbursable</td>
                <td className="rcp-num">{REPORT_TOTAL}</td>
                <td className="rcp-rt-say">Closed</td>
              </tr>
            </tfoot>
          </table>
          <p className="rcp-rt-cite rcp-ln">
            <span>Line 3.</span> M-041, $9.20 over the $75 dinner cap. Priya&apos;s note attached. Approved by Dana, Sep 14.
          </p>
          <Stamp tone="ink" rot={6} sub="Sep 30" className="rcp-stamp--filed" after>
            Filed
          </Stamp>
        </div>
      </Row>
      <Row>
        <P>The report leaves in the files your accountant already takes. Pick one to see me in it.</P>
        <Exports />
      </Row>
    </section>
  );
}

const FADED = ["SUSHI KANDA", "Sat Sep 12 2026  21:47", "TOTAL  $84.20"].map((line, n) => ({ line, keys: fadeKeys(line, 14 + n * 11) }));
function Fading() {
  return (
    <section className="rcp-scene" id="fading" data-log="NEXT SEPTEMBER  FADING" aria-labelledby="fading-h">
      <Row>
        <Bar when="Next September" what="Fading" />
      </Row>
      <Row>
        <span className="rcp-sr" id="fading-h">
          Next September, fading
        </span>
        <P>One more thing about thermal paper. It fades. Leave me in a drawer for a year and I&apos;ll be blank.</P>
        <div className="rcp-fade" data-fade aria-hidden="true">
          {FADED.map(({ line, keys }) => (
            <p key={line} className="rcp-fade-l">
              {keys.map((c, j) => (
                <span key={j} style={{ "--k": c.k } as React.CSSProperties}>
                  {c.ch}
                </span>
              ))}
            </p>
          ))}
          <p className="rcp-fade-when" data-fade-when>
            Sep 2027, a year in a drawer
          </p>
        </div>
        <P>It doesn&apos;t matter. Everything I said is on line 3, with the rule that read me, the note that explained me and the person who approved me. The audit trail was built as I went, not reconstructed later.</P>
      </Row>
      <Row className="rcp-row--sign">
        <p className="rcp-h2 rcp-ln">Nobody chased me.</p>
        <Rule label="Tear here" />
      </Row>
      <Row className="rcp-row--end" style={{ "--tear": TEAR_BOTTOM } as React.CSSProperties}>
        <div className="rcp-end-space" />
      </Row>
    </section>
  );
}

/* ---------------------------------------------------------------- the close: a second, short receipt */

function Close() {
  return (
    <section className="rcp-close" id="close" data-log="YOUR RECEIPT" aria-labelledby="close-h">
      <div className="rcp-close-paper" style={{ "--tear": TEAR_TOP } as React.CSSProperties}>
        <p className="rcp-close-brand rcp-ln">
          <Mark className="rcp-close-mark" />
          <span>Sylph</span>
        </p>
        <p className="rcp-center rcp-ln rcp-close-slogan">Expenses run on air.</p>
        <Rule />
        <h2 className="rcp-close-h rcp-ln" id="close-h">
          Every receipt, this uneventful.
        </h2>
        <P>Write your spend policy once. Sylph compiles it into rules a person approves, checks every card charge as it happens, and has the month&apos;s report ready at the end.</P>
        <P>Works on the cards and banks you already use.</P>
        <Rule />
        <p className="rcp-price-l rcp-ln">Small business, up to 100 people</p>
        <KV k="Per active employee, a month" v="$30" />
        <KV k="Setup" v="Same day" />
        <Rule kind="double" />
        <div className="rcp-close-cta rcp-ln">
          <a className="rcp-btn rcp-btn--demo" href={DEMO}>
            Book a demo
          </a>
          <a className="rcp-close-login" href={APP_LOGIN}>
            Log in
          </a>
        </div>
        <Rule />
        <P className="rcp-small">Policies and receipts are encrypted in transit and at rest, and never used to train models.</P>
        <P className="rcp-small">Sample data: Priya, Dana, Sushi Kanda and every amount on this page are invented.</P>
        <div className="rcp-barcode rcp-ln" aria-hidden="true" />
      </div>
      <footer className="rcp-foot">
        <a href="https://legal.januslabsinc.com/sylph/v1/privacy">Privacy</a>
        <a href="/terms">Terms</a>
        <span>Sylph, by Janus Labs</span>
      </footer>
    </section>
  );
}

export function Strip() {
  return (
    <>
      <article className="rcp-strip" id="receipt" aria-label="The Sushi Kanda receipt, and its month">
        <Printed />
        <Texted />
        <Matched />
        <Read />
        <Note />
        <Queue />
        <Filed />
        <Fading />
      </article>
      <Close />
    </>
  );
}
