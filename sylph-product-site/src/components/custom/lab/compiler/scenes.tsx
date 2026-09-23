"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Obj } from "@/components/custom/site/obj";
import { QBO_LIVE } from "@/components/custom/site/sample-data";
import { play } from "@/components/custom/v2-sides/sound";
import {
  DEFAULT_POLICY,
  VERDICT_LABEL,
  WEEK,
  check,
  checkWeek,
  compile,
  fingerprint,
  lineText,
  money,
  money0,
  type Check,
  type Outcome,
  type PolicyState,
} from "./model";
import { usePolicy } from "./store";

const APPROVED_RULES = compile(DEFAULT_POLICY);
const APPROVED_FP = fingerprint(APPROVED_RULES);
const APPROVED_CHECKS = checkWeek(APPROVED_RULES);

/** True once the element has been a third in view (and at once under reduced motion). */
function useArrived<T extends Element>(threshold = 0.3) {
  const ref = useRef<T>(null);
  const [state, setState] = useState<"idle" | "armed" | "run">("idle");
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setState("run");
          io.disconnect();
        } else setState((s) => (s === "idle" ? "armed" : s));
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, state] as const;
}

function SceneHead({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="cx-shead">
      <h2>{title}</h2>
      <div className="cx-shead-p">{children}</div>
    </div>
  );
}

function Chip({ v }: { v: Check["v"] }) {
  return <span className={`cx-chip cx-chip--${v}`}>{VERDICT_LABEL[v]}</span>;
}
const OUT_SHORT: Record<Outcome, string> = { note: "Note", block: "Block" };

/* ---------- 1. Compile time: a model reads and drafts, a person approves, arithmetic decides ---------- */

const DRAFTED = ["dinner", "alcohol", "hotel"] as const;
const HISTORY = [
  { when: "When the card was charged", at: "Sep 15, 21:04" },
  { when: "When the receipt matched", at: "Sep 16, 08:12" },
  { when: "In the month-end report", at: "Oct 1, 06:00" },
];
const SUSHI = WEEK.find((c) => c.id === "sushi")!;

export function CompileTime() {
  const [ref, arrived] = useArrived<HTMLDivElement>(0.35);
  const [mine, setMine] = useState<Check[]>([]);
  const logRef = useRef<HTMLOListElement>(null);
  const first = check(SUSHI, APPROVED_RULES);
  const runs = [
    ...HISTORY.map((h) => ({ ...h, res: first, you: false })),
    ...mine.map((res) => ({ when: "You, just now", at: "now", res, you: true })),
  ].map((r, n) => ({ ...r, n }));
  const shown = runs.length > 7 ? [...runs.slice(0, 3), ...runs.slice(-4)] : runs;
  const answers = new Set(runs.map((r) => `${r.res.v}|${r.res.rule?.id}|${r.res.cite}`)).size;

  return (
    <section className="cx-scene" id="compile-time" aria-labelledby="cx-ct-h">
      <div className="cx-wrap">
        <SceneHead title={<span id="cx-ct-h">AI at compile time. Never in the decision.</span>}>
          <p>
            Sylph reads the policy you already have and drafts a rule for every sentence, each quoting its line. A
            person reads the set and approves it, and nothing checks a charge until they do. From there the check is
            arithmetic on the charge: the same charge gets the same answer, every time it is asked.
          </p>
        </SceneHead>

        <div ref={ref} className={`cx-ct${arrived === "armed" ? " is-armed" : ""}${arrived === "run" ? " is-run" : ""}`}>
          <div className="cx-ct-side cx-ct-side--compile">
            <div className="cx-ct-top">
              <span className="cx-ct-k">Compile time</span>
              <span className="cx-ct-tag">A model reads. A person approves.</span>
              <span className="cx-sample">Sample data</span>
            </div>
            <div className="cx-ct-read">
              <Obj name="policy" size={92} className="cx-ct-obj" />
              <div>
                <p className="cx-ct-step">
                  <b>Reads</b> the policy you already have, as written.
                </p>
                <p className="cx-ct-file mono">harbor-pine-travel-policy.pdf</p>
              </div>
            </div>
            <p className="cx-ct-step cx-ct-step--rule">
              <b>Drafts</b> a rule for every sentence, quoting it.
            </p>
            <ul className="cx-ct-drafts">
              {DRAFTED.map((k, i) => {
                const r = APPROVED_RULES.find((x) => x.line === k)!;
                return (
                  <li key={k} style={{ "--i": i } as React.CSSProperties}>
                    <q>{lineText(DEFAULT_POLICY, k)}</q>
                    <span className="cx-ct-rule mono">
                      <b>{r.id}</b> {r.subject} <span className="cx-op">{r.op}</span> <b>{r.value}</b>
                      <span className={`cx-rchip cx-rchip--${r.outcome}`}>{OUT_SHORT[r.outcome]}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="cx-ct-step cx-ct-step--rule">
              <b>Waits</b> for a person. Dana reads each rule beside its sentence and approves the set.
            </p>
          </div>

          <div className="cx-ct-seam" aria-hidden="true">
            <span className="cx-ct-stamp mono">
              <span>Approved</span>
              <span>{APPROVED_FP}</span>
            </span>
            <span className="cx-ct-seam-t mono">The model stops here</span>
          </div>

          <div className="cx-ct-side cx-ct-side--check">
            <div className="cx-ct-top">
              <span className="cx-ct-k">Check time</span>
              <span className="cx-ct-tag">No model. The rule, the threshold, the amount.</span>
            </div>
            <div className="cx-ct-charge">
              <div>
                <p className="cx-ct-m">{SUSHI.merchant}</p>
                <p className="cx-ct-d mono">
                  Tue {SUSHI.date}, card ending 4417, dinner
                </p>
              </div>
              <span className="cx-ct-amt mono">{money(SUSHI.usd)}</span>
              <button
                type="button"
                className="cx-btn cx-btn--ink cx-btn--sm"
                onClick={() => {
                  setMine((m) => [...m, check(SUSHI, APPROVED_RULES)]);
                  play("tap");
                  requestAnimationFrame(() => logRef.current?.lastElementChild?.scrollIntoView({ block: "nearest" }));
                }}
              >
                Check it again
              </button>
            </div>
            <p className="cx-ct-in-k mono">What the check reads</p>
            <dl className="cx-ct-in">
              <div>
                <dt>Amount</dt>
                <dd className="mono">{money(SUSHI.usd)}</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>Dinner</dd>
              </div>
              <div>
                <dt>Receipt date</dt>
                <dd className="mono">{SUSHI.date}</dd>
              </div>
              <div>
                <dt>Ruleset</dt>
                <dd className="mono">{APPROVED_FP}</dd>
              </div>
            </dl>
            <p className="cx-ct-in-k mono">Every time it was checked</p>
            <ol className="cx-ct-log" ref={logRef} aria-label="Every time this charge was checked" aria-live="polite">
              {shown.map((r, i) => (
                <li key={r.n} className={r.you ? "is-you" : undefined} style={{ "--i": i } as React.CSSProperties}>
                  <span className="cx-ct-when">
                    {r.when}
                    <span className="mono">{r.at}</span>
                  </span>
                  <Chip v={r.res.v} />
                  <span className="cx-ct-why">
                    <b className="mono">
                      {r.res.rule?.num} {r.res.rule?.id}
                    </b>{" "}
                    {r.res.cite}
                  </span>
                  <span className="cx-ct-fp mono">{APPROVED_FP}</span>
                </li>
              ))}
            </ol>
            <p className="cx-ct-count">
              <b>
                {runs.length} checks, {answers === 1 ? "one answer" : `${answers} answers`}.
              </b>{" "}
              Same charge, same rules, same verdict, with the line it came from.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 2. Before the rules: the receipt finds its charge, currency and duplicates are settled ---------- */

type PassRow = {
  id: string;
  receipt: { by: string; ok: boolean };
  match: string;
  currency: string;
  dup: { t: string; flag: boolean };
  waiting?: boolean;
};
const PASS_ROWS: PassRow[] = [
  { id: "lumen", receipt: { by: "By email", ok: true }, match: "Card charge, Sep 17", currency: "€62.00 at 1.170, the Sep 17 rate, is $72.54", dup: { t: "None", flag: false } },
  { id: "cab", receipt: { by: "By text", ok: true }, match: "Card charge, Sep 16", currency: "USD, nothing to convert", dup: { t: "Same amount and day as Uber", flag: true } },
  { id: "hyatt", receipt: { by: "By upload", ok: true }, match: "Card charge, Sep 14", currency: "USD, nothing to convert", dup: { t: "None", flag: false } },
  { id: "avis", receipt: { by: "Not in yet", ok: false }, match: "Waiting for its receipt", currency: "Not yet", dup: { t: "Not yet", flag: false }, waiting: true },
];
const COLS = ["Receipt", "Match", "Currency", "Duplicate", "Verdict"];

export function BeforeRules() {
  const [ref, state] = useArrived<HTMLDivElement>(0.35);
  const [run, setRun] = useState(0);
  return (
    <section className="cx-scene cx-scene--band" id="before" aria-labelledby="cx-br-h">
      <div className="cx-wrap">
        <SceneHead title={<span id="cx-br-h">A receipt finds its charge before any rule runs.</span>}>
          <p>
            Receipts arrive by upload, email or text and match themselves to the card charge, and a charge is checked
            once it is matched. Foreign currency is converted at the rate on the receipt date, and a second charge with the
            same amount on the same day is flagged, so every rule compares like with like.
          </p>
        </SceneHead>

        <div className="cx-intake">
          <span className="cx-intake-i">
            <Obj name="receipt" size={52} />
            <span>
              <b>Upload</b> a photo or PDF in the app
            </span>
          </span>
          <span className="cx-intake-i">
            <Obj name="envelope" size={52} />
            <span>
              <b>Email</b> it to your Sylph address
            </span>
          </span>
          <span className="cx-intake-i">
            <Obj name="phone" size={52} />
            <span>
              <b>Text</b> a photo to the Sylph number
            </span>
          </span>
        </div>

        <div
          ref={ref}
          className={`cx-pass${state === "armed" ? " is-armed" : ""}${state === "run" ? " is-run" : ""}`}
          key={run}
          role="table"
          aria-label="Four sample charges, pass by pass"
        >
          <div className="cx-pass-top" role="presentation">
            <span className="cx-pass-k">Passes, in order</span>
            <span className="cx-sample">Sample data</span>
            <button
              type="button"
              className="cx-btn cx-btn--line cx-btn--sm"
              onClick={() => {
                setRun((n) => n + 1);
                play("tap");
              }}
            >
              Run the passes again
            </button>
          </div>
          <div className="cx-pass-grid">
            <div className="cx-pass-row cx-pass-row--head" role="row">
              <span role="columnheader">Charge</span>
              {COLS.map((c, i) => (
                <span key={c} role="columnheader" style={{ "--c": i } as React.CSSProperties}>
                  <i className="mono">{i + 1}</i> {c}
                </span>
              ))}
            </div>
            {PASS_ROWS.map((row, r) => {
              const c = WEEK.find((w) => w.id === row.id)!;
              const k = APPROVED_CHECKS[row.id];
              return (
                <div key={row.id} className={`cx-pass-row${row.waiting ? " is-waiting" : ""}`} role="row" style={{ "--r": r } as React.CSSProperties}>
                  <span role="cell" className="cx-pass-charge">
                    <b>{c.merchant}</b>
                    <span className="mono">
                      {c.fx ? c.fx.amount : money(c.usd)}, {c.date}
                    </span>
                  </span>
                  <span role="cell" data-label="Receipt" style={{ "--c": 0 } as React.CSSProperties}>
                    <em className={row.receipt.ok ? "is-ok" : "is-wait"}>{row.receipt.by}</em>
                  </span>
                  <span role="cell" data-label="Match" style={{ "--c": 1 } as React.CSSProperties}>
                    <em className={row.waiting ? "is-wait" : "is-ok"}>{row.match}</em>
                  </span>
                  <span role="cell" data-label="Currency" style={{ "--c": 2 } as React.CSSProperties}>
                    <em className={row.waiting ? "is-skip" : c.fx ? "is-ok is-strong" : "is-plain"}>{row.currency}</em>
                  </span>
                  <span role="cell" data-label="Duplicate" style={{ "--c": 3 } as React.CSSProperties}>
                    <em className={row.waiting ? "is-skip" : row.dup.flag ? "is-flag" : "is-plain"}>{row.dup.t}</em>
                  </span>
                  <span role="cell" data-label="Verdict" style={{ "--c": 4 } as React.CSSProperties}>
                    {row.waiting ? (
                      <em className="is-wait">Not checked. Matching comes first.</em>
                    ) : (
                      <span className="cx-pass-v">
                        <Chip v={k.v} />
                        <span className="mono">{k.rule?.id}</span>
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
            <span className="cx-scan" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 3. Month end: the report is built as the month happens; export or post it ---------- */

const NOTES: Record<string, string> = {
  sushi: "Late finish at the site visit, nothing else was open.",
  cab: "Two rides, to the site and back.",
  marriott: "Conference hotel, the block was full.",
  delta: "Booked two days out for the client visit.",
};
const GL: { account: string; ids: string[]; rule: string }[] = [
  { account: "6110 Travel: Airfare", ids: ["united", "delta"], rule: "T-004" },
  { account: "6120 Travel: Lodging", ids: ["hyatt", "marriott"], rule: "L-007" },
  { account: "6130 Meals", ids: ["sushi", "lumen"], rule: "M-041" },
  { account: "6140 Ground transport", ids: ["uber", "cab", "avis"], rule: "G, D-001" },
];
const glSum = (ids: string[]) => ids.reduce((s, id) => s + WEEK.find((w) => w.id === id)!.usd, 0);
const REIMB = WEEK.filter((c) => APPROVED_CHECKS[c.id].v !== "block").reduce((s, c) => s + c.usd, 0);
const KEPT = WEEK.filter((c) => APPROVED_CHECKS[c.id].v === "block").reduce((s, c) => s + c.usd, 0);
const iso = (d: string) => `2026-09-${d.replace("Sep ", "").padStart(2, "0")}`;

type Tab = "pdf" | "xlsx" | "csv" | "qbo";
const TABS: { id: Tab; label: string }[] = [
  { id: "pdf", label: "Report PDF" },
  { id: "xlsx", label: "XLSX" },
  { id: "csv", label: "GL journal CSV" },
  ...(QBO_LIVE ? [{ id: "qbo" as Tab, label: "QuickBooks Online" }] : []),
];

export function MonthEnd() {
  const [tab, setTab] = useState<Tab>("pdf");
  const tabsRef = useRef<HTMLDivElement>(null);
  const counts = useMemo(() => {
    const n = { ok: 0, note: 0, block: 0 };
    WEEK.forEach((c) => n[APPROVED_CHECKS[c.id].v]++);
    return n;
  }, []);

  const pick = (t: Tab) => {
    setTab(t);
    play("tap");
  };

  return (
    <section className="cx-scene" id="month-end" aria-labelledby="cx-me-h">
      <div className="cx-wrap">
        <SceneHead title={<span id="cx-me-h">At month end, the report is already built.</span>}>
          <p>
            Every charge arrives with its receipt, its verdict and the line it cites, so closing the month is a review
            of the exceptions, not a hunt. Export an audit-grade PDF, an XLSX or a GL journal CSV
            {QBO_LIVE ? ", or post the journal to QuickBooks Online" : ""}.
          </p>
        </SceneHead>

        <div className="cx-me">
          <div className="cx-me-aside">
            <Obj name="report" size={210} className="cx-me-obj" />
            <dl className="cx-me-sum">
              <div>
                <dt>Charges</dt>
                <dd className="mono">{WEEK.length}</dd>
              </div>
              <div>
                <dt>Receipts matched</dt>
                <dd className="mono">{WEEK.length}</dd>
              </div>
              <div>
                <dt>Answered with a note</dt>
                <dd className="mono">{counts.note}</dd>
              </div>
              <div>
                <dt>Kept off the total</dt>
                <dd className="mono">{money(KEPT)}</dd>
              </div>
              <div className="is-total">
                <dt>Reimbursable</dt>
                <dd className="mono">{money(REIMB)}</dd>
              </div>
            </dl>
            <p className="cx-me-fine">
              <span className="cx-sample cx-me-chip">Sample data</span> Counts are of the sample week shown here.
            </p>
          </div>

          <div className="cx-me-view">
            <div
              className="cx-tabs"
              role="tablist"
              aria-label="Exports"
              ref={tabsRef}
              onKeyDown={(e) => {
                if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                const i = TABS.findIndex((t) => t.id === tab);
                const n = TABS[(i + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length].id;
                pick(n);
                tabsRef.current?.querySelector<HTMLElement>(`[data-tab="${n}"]`)?.focus();
              }}
            >
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  id={`cx-tab-${t.id}`}
                  data-tab={t.id}
                  aria-selected={tab === t.id}
                  aria-controls="cx-tabpanel"
                  tabIndex={tab === t.id ? 0 : -1}
                  onClick={() => pick(t.id)}
                >
                  {t.label}
                </button>
              ))}
              <span className="cx-sample">Sample data</span>
            </div>
            <div className="cx-tabpanel" role="tabpanel" id="cx-tabpanel" aria-labelledby={`cx-tab-${tab}`} key={tab}>
              {tab === "pdf" && <PdfView />}
              {tab === "xlsx" && <XlsxView />}
              {tab === "csv" && <CsvView />}
              {tab === "qbo" && <QboView />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PdfView() {
  return (
    <div className="cx-pdf">
      <div className="cx-pdf-page">
        <div className="cx-pdf-h">
          <div>
            <p className="cx-pdf-t">Expense report, week of Sep 14</p>
            <p className="cx-pdf-s">Harbor &amp; Pine, finance. Checked against ruleset {APPROVED_FP}, approved Sep 1.</p>
          </div>
          <span className="cx-pdf-p mono">Page 1 of 1</span>
        </div>
        <table className="cx-pdf-tb">
          <thead>
            <tr>
              <th>Date</th>
              <th>Charge</th>
              <th className="is-r">Amount</th>
              <th>Verdict</th>
              <th>Cites</th>
            </tr>
          </thead>
          <tbody>
            {WEEK.map((c) => {
              const k = APPROVED_CHECKS[c.id];
              return (
                <tr key={c.id}>
                  <td className="mono">{c.date}</td>
                  <td>
                    {c.merchant}
                    {NOTES[c.id] && <span className="cx-pdf-note">Note: {NOTES[c.id]}</span>}
                  </td>
                  <td className="mono is-r">{money(c.usd)}</td>
                  <td>
                    <span className={`cx-pdf-v cx-pdf-v--${k.v}`}>{VERDICT_LABEL[k.v]}</span>
                  </td>
                  <td className="mono cx-pdf-c">{k.rule ? (k.rule.line === "built-in" ? `${k.rule.id}, built in` : `${k.rule.id}, line ${k.rule.num}`) : "no line"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="cx-pdf-f">
          <span>
            Reimbursable <b className="mono">{money(REIMB)}</b>
          </span>
          <span>
            Kept off <b className="mono">{money(KEPT)}</b>
          </span>
          <span className="cx-pdf-sig">Every line cites the rule that decided it, and every rule quotes its sentence.</span>
        </div>
      </div>
    </div>
  );
}

function XlsxView() {
  const cols = ["A", "B", "C", "D", "E", "F"];
  const head = ["Date", "Merchant", "Amount USD", "Verdict", "Rule", "Line"];
  return (
    <div className="cx-xl" role="group" aria-label="Spreadsheet preview">
      <div className="cx-xl-bar mono">
        <span>harbor-pine-2026-09-week-38.xlsx</span>
        <span>Sheet 1</span>
      </div>
      <div className="cx-xl-grid" style={{ "--cols": cols.length } as React.CSSProperties}>
        <span className="cx-xl-corner" />
        {cols.map((c) => (
          <span key={c} className="cx-xl-col mono">
            {c}
          </span>
        ))}
        <span className="cx-xl-rn mono">1</span>
        {head.map((h) => (
          <span key={h} className="cx-xl-c is-head">
            {h}
          </span>
        ))}
        {WEEK.map((c, i) => {
          const k = APPROVED_CHECKS[c.id];
          return [
            <span key={`${c.id}-n`} className="cx-xl-rn mono">
              {i + 2}
            </span>,
            <span key={`${c.id}-a`} className="cx-xl-c mono">
              {iso(c.date)}
            </span>,
            <span key={`${c.id}-b`} className="cx-xl-c">
              {c.merchant}
            </span>,
            <span key={`${c.id}-c`} className="cx-xl-c mono is-r">
              {c.usd.toFixed(2)}
            </span>,
            <span key={`${c.id}-d`} className={`cx-xl-c cx-xl-v--${k.v}`}>
              {VERDICT_LABEL[k.v]}
            </span>,
            <span key={`${c.id}-e`} className="cx-xl-c mono">
              {k.rule?.id ?? ""}
            </span>,
            <span key={`${c.id}-f`} className="cx-xl-c mono">
              {k.rule?.num ?? ""}
            </span>,
          ];
        })}
      </div>
    </div>
  );
}

function CsvView() {
  const lines = [
    "date,account,debit,credit,memo",
    ...GL.map((g) => `2026-09-18,${g.account},${glSum(g.ids).toFixed(2)},,${g.ids.length} charges ${g.rule}`),
    `2026-09-18,2100 Reimbursements payable,,${REIMB.toFixed(2)},week of Sep 14`,
  ];
  return (
    <div className="cx-csv">
      <div className="cx-xl-bar mono">
        <span>harbor-pine-gl-journal-2026-09-18.csv</span>
        <span>{lines.length} lines</span>
      </div>
      <pre className="mono">
        {lines.map((l, i) => (
          <span key={i} className={i === 0 ? "is-head" : undefined}>
            <i>{String(i + 1).padStart(2, " ")}</i>
            {l}
            {"\n"}
          </span>
        ))}
      </pre>
      <p className="cx-csv-f">Blocked charges never reach the journal. Bar Bianco, {money(KEPT)}, stays off it.</p>
    </div>
  );
}

function QboView() {
  return (
    <div className="cx-qbo">
      <div className="cx-qbo-h">
        <div>
          <p className="cx-pdf-t">Journal entry, week of Sep 14</p>
          <p className="cx-pdf-s">Ready to post to QuickBooks Online. Each line keeps its rule in the memo.</p>
        </div>
        <span className="cx-qbo-bal mono">Balanced</span>
      </div>
      <table className="cx-pdf-tb">
        <thead>
          <tr>
            <th>Account</th>
            <th className="is-r">Debit</th>
            <th className="is-r">Credit</th>
            <th>Memo</th>
          </tr>
        </thead>
        <tbody>
          {GL.map((g) => (
            <tr key={g.account}>
              <td>{g.account}</td>
              <td className="mono is-r">{money(glSum(g.ids))}</td>
              <td className="mono is-r" />
              <td className="mono cx-pdf-c">
                {g.ids.length} charges, {g.rule}
              </td>
            </tr>
          ))}
          <tr>
            <td>2100 Reimbursements payable</td>
            <td className="mono is-r" />
            <td className="mono is-r">{money(REIMB)}</td>
            <td className="mono cx-pdf-c">week of Sep 14</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td>Totals</td>
            <td className="mono is-r">{money(REIMB)}</td>
            <td className="mono is-r">{money(REIMB)}</td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/* ---------- 4. No policy yet: a few of the dozen questions write the sentences, then compile ---------- */

type Answers = { dinner: number; hotel: number; alcohol: "block" | "note" | "ok"; fare: number };
const Q_DEFAULT: Answers = { dinner: 60, hotel: 250, alcohol: "note", fare: 500 };
const MORE = [
  "Rides and taxis",
  "Rental car class",
  "Per diem or actual cost",
  "Receipts needed over",
  "Client entertainment",
  "Mileage rate",
  "Who answers the notes",
  "Reimbursement currency",
];

function toPolicy(a: Answers): PolicyState {
  return {
    ...DEFAULT_POLICY,
    nums: { ...DEFAULT_POLICY.nums, dinnerCap: a.dinner, dinnerMax: Math.max(a.dinner + 45, 120), hotelCap: a.hotel, fareCap: a.fare },
    /* "Reimbursed" strikes the sentence rather than rewording it */
    out: { ...DEFAULT_POLICY.out, alcohol: a.alcohol === "note" ? "note" : "block" },
    off: a.alcohol === "ok" ? ["alcohol"] : [],
    added: [],
  };
}

export function StartScene() {
  const { load } = usePolicy();
  const [a, setA] = useState<Answers>(Q_DEFAULT);
  const [sent, setSent] = useState(false);
  const draft = toPolicy(a);
  const set = <K extends keyof Answers>(k: K, v: Answers[K]) => {
    setA((x) => ({ ...x, [k]: v }));
    setSent(false);
    play("tap");
  };

  const Q: { k: keyof Answers; q: string; opts: { v: Answers[keyof Answers]; t: string }[] }[] = [
    { k: "dinner", q: "What can a dinner on the road cost, a person?", opts: [50, 60, 75, 100].map((v) => ({ v, t: money0(v) })) },
    { k: "hotel", q: "Where does a hotel night top out?", opts: [200, 250, 350, 450].map((v) => ({ v, t: money0(v) })) },
    {
      k: "alcohol",
      q: "And alcohol?",
      opts: [
        { v: "block", t: "Never reimbursed" },
        { v: "note", t: "With a note" },
        { v: "ok", t: "Reimbursed" },
      ],
    },
    { k: "fare", q: "Above what fare should a flight need a note?", opts: [400, 500, 600, 800].map((v) => ({ v, t: money0(v) })) },
  ];

  const sentences = (["dinner", "dinnerMax", "alcohol", "hotel", "fare"] as const).filter((k) => !draft.off.includes(k));

  return (
    <section className="cx-scene" id="start" aria-labelledby="cx-st-h">
      <div className="cx-wrap">
        <SceneHead title={<span id="cx-st-h">No policy yet. Answer a dozen questions and Sylph writes one.</span>}>
          <p>
            Plenty of companies run on habit instead of a document. Sylph asks what you would say anyway, writes the
            policy in plain language, and compiles it like any other. You approve it the same way.
          </p>
        </SceneHead>

        <div className="cx-st">
          <div className="cx-st-q">
            <p className="cx-st-k mono">Questions 1 to 4 of 12</p>
            {Q.map((q, i) => (
              <div key={q.k} className="cx-st-item" role="group" aria-labelledby={`cx-q-${q.k}`}>
                <p id={`cx-q-${q.k}`} className="cx-st-qt">
                  <span className="mono">{i + 1}</span>
                  {q.q}
                </p>
                <div className="cx-seg">
                  {q.opts.map((o) => (
                    <button key={String(o.v)} type="button" aria-pressed={a[q.k] === o.v} onClick={() => set(q.k, o.v as never)}>
                      {o.t}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <ol className="cx-st-more" start={5}>
              {MORE.map((m, i) => (
                <li key={m}>
                  <span className="mono">{i + 5}</span>
                  {m}
                </li>
              ))}
            </ol>
          </div>

          <div className="cx-st-doc">
            <div className="cx-st-doc-h">
              <span className="cx-doc" aria-hidden="true" />
              <span>Travel and expense policy, draft</span>
              <span className="cx-sample">Sample data</span>
            </div>
            <p className="cx-policy-h cx-st-sec">4. Meals, lodging and travel</p>
            <ol className="cx-st-lines" aria-live="polite">
              {sentences.map((k, i) => (
                <li key={k}>
                  <span className="mono">4.{i + 1}</span>
                  <span key={lineText(draft, k)} className="cx-st-s">
                    {lineText(draft, k)}
                  </span>
                </li>
              ))}
            </ol>
            <div className="cx-st-go">
              <button
                type="button"
                className="cx-btn cx-btn--ink"
                onClick={() => {
                  load(draft);
                  setSent(true);
                  play("send");
                  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                  document.getElementById("editor")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
                }}
              >
                Compile this draft
              </button>
              <span className="cx-st-go-t">
                {sent ? "Compiled into the editor at the top, as a draft to approve." : "It opens in the editor at the top, as a draft beside the approved set."}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
