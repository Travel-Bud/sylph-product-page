import Image from "next/image";
import Link from "next/link";
import { Mark } from "@/components/custom/site/mark";
import { APP_LOGIN, DEMO, PRICING } from "@/components/custom/site/anchors";
import { Head, Sample, VerdictTag } from "./board";
import { TenButton } from "./nav";
import { BY_KEY, GATES, QBO_LIVE, WEEK_CLEARED, WEEK_EXCEPTIONS, dollars, money } from "./data";

/* The scenes around the board: each says what the visitor just watched, in the board's own parts. */

const DEST: Record<string, { text: string; tone: "note" | "block" | "wait" }> = {
  match: { text: "Unmatched waits here", tone: "wait" },
  dinner: { text: "Needs a note", tone: "note" },
  alcohol: { text: "Blocked", tone: "block" },
  dup: { text: "Needs a note", tone: "note" },
  hotel: { text: "Needs a note", tone: "note" },
  rental: { text: "Needs a note", tone: "note" },
};

export function GatesScene() {
  return (
    <section className="dp-scene dp-scene--gates" id="gates" aria-labelledby="gates-t">
      <div className="dp-wrap dp-scene-in">
        <div className="dp-scene-copy">
          <h2 id="gates-t" className="dp-h2">
            The gates are your policy, compiled.
          </h2>
          <p className="dp-lede">
            Sylph reads the travel and expense policy you already have, or writes one from a dozen answers, and
            drafts every line as a rule: its code, its threshold, and where an exception goes. A person approves each
            rule before it checks a single charge.
          </p>
          <p className="dp-lede">The board above is that policy, one gate per rule, in the order a charge meets them.</p>
        </div>
        <figure className="dp-compile">
          <div className="dp-compile-head">
            <span className="dp-compile-doc">Travel and expense policy</span>
            <span className="dp-compile-arrow" aria-hidden="true">
              compiles to
            </span>
            <span className="dp-compile-board">Gates on the board</span>
          </div>
          <ol className="dp-compile-rows">
            {GATES.map((g) => (
              <li key={g.id}>
                <p className="dp-compile-line">{g.policy}</p>
                <span className="dp-compile-wire" aria-hidden="true" />
                <p className="dp-compile-gate">
                  <span className="dp-code">{g.code}</span>
                  <span className="dp-compile-name">{g.name}</span>
                  <span className={`dp-dest dp-dest--${DEST[g.id].tone}`}>{DEST[g.id].text}</span>
                </p>
              </li>
            ))}
          </ol>
          <figcaption className="dp-compile-foot">
            <Head who="dana" size={30} />
            <span>
              <strong>Approved by Dana, Sep 1.</strong> Drafted by Sylph from the policy PDF, six rules, each one read
              and signed off.
            </span>
            <Sample />
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

const SUSHI = BY_KEY["Sushi Kanda"];

export function MatchScene() {
  return (
    <section className="dp-scene dp-scene--match" id="match" aria-labelledby="match-t">
      <div className="dp-wrap dp-scene-in dp-scene-in--flip">
        <div className="dp-scene-copy">
          <h2 id="match-t" className="dp-h2">
            The receipt finds its own charge.
          </h2>
          <p className="dp-lede">
            Priya texts a photo, forwards the email or uploads the file. Sylph finds the card charge it belongs to by
            merchant, amount and date, and converts a foreign currency at the rate on the receipt date.
          </p>
          <p className="dp-lede">
            Nothing is judged until it is matched. That is why the match sits at the top of the board, before any rule.
          </p>
        </div>
        <figure className="dp-latch">
          <div className="dp-latch-in">
            <ul className="dp-ways" aria-label="Three ways in">
              <li>Text</li>
              <li>Email</li>
              <li>Upload</li>
            </ul>
            <div className="dp-latch-pair">
              <div className="dp-rcpt">
                <p className="dp-rcpt-h">SUSHI KANDA</p>
                <p className="dp-rcpt-s">Denver, CO</p>
                <dl>
                  <div>
                    <dt>Omakase</dt>
                    <dd>72.00</dd>
                  </div>
                  <div>
                    <dt>Tea</dt>
                    <dd>4.00</dd>
                  </div>
                  <div>
                    <dt>Tax</dt>
                    <dd>8.20</dd>
                  </div>
                  <div className="is-total">
                    <dt>TOTAL</dt>
                    <dd>84.20</dd>
                  </div>
                </dl>
              </div>
              <div className="dp-clasp" aria-hidden="true">
                <span />
                <b>Matched</b>
                <span />
              </div>
              <div className="dp-charge">
                <p className="dp-charge-h">
                  <span className="dp-charge-card" aria-hidden="true" />
                  Card ending 4417
                </p>
                <p className="dp-charge-m">SUSHI KANDA DENVER CO</p>
                <p className="dp-charge-row">
                  <span>Sep 12</span>
                  <strong>{SUSHI.amount}</strong>
                </p>
              </div>
            </div>
            <p className="dp-latch-keys">
              <span>Merchant</span>
              <span>Amount</span>
              <span>Date</span>
            </p>
            <p className="dp-fx">
              <strong>JR East</strong> <span className="mono">¥3,200</span> matched and converted to{" "}
              <span className="mono">$21.55</span> at the rate on the receipt date.
            </p>
          </div>
          <figcaption className="dp-latch-foot">
            <Head who="priya" size={30} />
            <span>Priya texted it from the table, Sep 12, 7:52 pm.</span>
            <Sample />
          </figcaption>
          <span className="dp-latch-fig" aria-hidden="true">
            <Image src="/site/characters/priya-snap.webp" alt="" width={764} height={1302} sizes="200px" />
          </span>
        </figure>
      </div>
    </section>
  );
}

/* Ten drops, as chance would scatter them and as the rules place them. */
const CHANCE = { block: 2, ok: 3, note: 5 } as const;

function MiniTrays({ fill }: { fill: Record<"block" | "ok" | "note", number> }) {
  return (
    <div className="dp-mini">
      {(["block", "ok", "note"] as const).map((v) => (
        <div key={v} className={`dp-mini-tray dp-mini-tray--${v}`}>
          <span className="dp-mini-stack">
            {Array.from({ length: fill[v] }, (_, i) => (
              <i key={i} />
            ))}
          </span>
          <span className="dp-mini-n">{fill[v]}</span>
          <span className="dp-mini-l">{v === "ok" ? "Cleared" : v === "note" ? "Needs a note" : "Blocked"}</span>
        </div>
      ))}
    </div>
  );
}

export function SameScene() {
  return (
    <section className="dp-scene dp-scene--same" id="same" aria-labelledby="same-t">
      <div className="dp-wrap">
        <div className="dp-same-head">
          <h2 id="same-t" className="dp-h2 dp-h2--xl">
            Same charge, same answer.
            <span> Every time.</span>
          </h2>
          <p className="dp-lede">
            There is no model in the decision. A model reads your policy once and drafts the rules, a person approves
            them, and from then on every verdict comes from the rules alone. Drop a charge ten times and it takes one
            path to one bin, citing one rule: the answer you get today is the answer an auditor gets next year.
          </p>
        </div>
        <div className="dp-same-grid">
          <figure className="dp-same-card dp-same-card--chance">
            <figcaption>
              <strong>A board of pegs</strong>
              <span>Ten drops, scattered by chance.</span>
            </figcaption>
            <MiniTrays fill={CHANCE} />
            <Sample dark />
          </figure>
          <figure className="dp-same-card dp-same-card--rules">
            <figcaption>
              <strong>The same ten, through the rules</strong>
              <span>
                {SUSHI.merchant} <span className="mono">{SUSHI.amount}</span>, every drop to M-041.
              </span>
            </figcaption>
            <MiniTrays fill={{ block: 0, ok: 0, note: 10 }} />
            <Sample dark />
          </figure>
        </div>
        <div className="dp-same-act">
          <TenButton />
          <span>It runs on the board above.</span>
        </div>
      </div>
    </section>
  );
}

const cleared = WEEK_CLEARED.reduce((s, c) => s + dollars(c.amount), 0);

export function MonthScene() {
  return (
    <section className="dp-scene dp-scene--month" id="month" aria-labelledby="month-t">
      <div className="dp-wrap dp-scene-in">
        <div className="dp-scene-copy">
          <h2 id="month-t" className="dp-h2">
            Only the exceptions reach Dana. The report is already there.
          </h2>
          <p className="dp-lede">
            Everything that clears files itself into the month&rsquo;s report as it lands. What does not arrives on
            Dana&rsquo;s desk with the rule, the threshold and the amount, often with Priya&rsquo;s note already on it.
            Blocked means kept off the reimbursable total, never a declined card.
          </p>
          <p className="dp-lede">
            At month end the report is assembled with every receipt attached: an audit-grade PDF, an XLSX and a GL
            journal CSV{QBO_LIVE ? ", posted to QuickBooks Online" : ""}.
          </p>
        </div>
        <div className="dp-month">
          <figure className="dp-queue">
            <figcaption>
              <Head who="dana" size={30} />
              <strong>Dana&rsquo;s desk, the team&rsquo;s week</strong>
              <Sample />
            </figcaption>
            <ul>
              {WEEK_EXCEPTIONS.map((c) => (
                <li key={c.key}>
                  <p className="dp-queue-top">
                    <strong>{c.merchant}</strong>
                    <span className="mono">{c.amount}</span>
                    <VerdictTag v={c.verdict} />
                  </p>
                  <p className="dp-queue-cite">{c.cite}</p>
                </li>
              ))}
            </ul>
          </figure>
          <figure className="dp-report-card">
            <span className="dp-report-obj" aria-hidden="true">
              <Image src="/site/objects/report.webp" alt="" width={240} height={240} sizes="120px" />
            </span>
            <figcaption>
              <strong>September report</strong>
              <span>
                {WEEK_CLEARED.length} cleared charges, <span className="mono">{money(cleared)}</span>, filed as they
                landed
              </span>
            </figcaption>
            <ul className="dp-formats" aria-label="Formats">
              <li>PDF</li>
              <li>XLSX</li>
              <li>GL journal CSV</li>
              {QBO_LIVE && <li>QuickBooks Online</li>}
            </ul>
            <Sample />
          </figure>
          <span className="dp-month-fig" aria-hidden="true">
            <Image src="/site/characters/dana-review.webp" alt="" width={619} height={1388} sizes="170px" />
          </span>
        </div>
      </div>
    </section>
  );
}

const TRUST = "Policies and receipts are encrypted in transit and at rest, and never used to train models.";

export function DropClose() {
  return (
    <section className="dp-close" aria-labelledby="close-t">
      <div className="dp-wrap dp-close-in">
        <div className="dp-close-copy">
          <Mark className="dp-close-mark" />
          <h2 id="close-t" className="dp-h2 dp-h2--xl">
            Write the policy once. Every charge takes the same path.
          </h2>
          <p className="dp-lede">
            Bring last month&rsquo;s card statement, with or without a policy. In the demo we compile your policy into
            gates and drop your own charges through it.
          </p>
          <div className="dp-close-cta">
            <Link href={DEMO} className="dp-btn dp-btn--paper dp-btn--lg">
              Book a demo
            </Link>
            <p className="dp-price">
              <strong>$30</strong> per active employee a month
            </p>
          </div>
          <p className="dp-close-fine">On the cards and banks you already use. Set up the same day. {TRUST}</p>
        </div>
        <span className="dp-close-fig" aria-hidden="true">
          <Image src="/site/characters/together.webp" alt="" width={912} height={960} sizes="(max-width: 640px) 260px, 420px" />
        </span>
      </div>
    </section>
  );
}

export function DropFooter() {
  return (
    <footer className="dp-foot">
      <div className="dp-wrap dp-foot-in">
        <p className="dp-foot-brand">
          <Mark className="dp-brand-mark" />
          <span>
            <strong>Sylph</strong> Expenses run on air.
          </span>
        </p>
        <nav className="dp-foot-links" aria-label="Footer">
          <Link href={DEMO}>Book a demo</Link>
          <Link href={PRICING}>Pricing</Link>
          <a href={APP_LOGIN}>Log in</a>
          <a href="/privacy">Privacy</a>
        </nav>
        <p className="dp-foot-fine">
          Sample data throughout: Priya, Dana, the merchants and every amount are invented. &copy; 2026 Janus Labs.
        </p>
      </div>
    </footer>
  );
}
