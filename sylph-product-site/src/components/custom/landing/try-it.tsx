"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Bird } from "./bird";
import { KindIcon, StatusTag } from "./app-ui/chip";
import { LIMITS, WEEK, money, type Verdict, type WeekCharge } from "./data";

/* Try it (frame C's live policy, Ben 2026-10-05): four plain-English limits you can change, and the week's charges
   re-checked against them as you type. The same deterministic logic for every charge, so the same answer every time. */

function judge(c: WeekCharge, v: Record<string, number>): { verdict: Verdict; cite: string } {
  if (c.fixed) return { verdict: "block", cite: `${c.fixed.code}, ${c.fixed.reason}` };
  const { code, measure } = c.check!;
  const lim = v[code];
  switch (code) {
    case "L-007":
      return measure > lim
        ? { verdict: "note", cite: `${code}, ${money(measure - lim)} over the $${lim} nightly cap` }
        : { verdict: "ok", cite: `${code}, under the $${lim} nightly cap` };
    case "M-041":
      return measure > lim
        ? { verdict: "note", cite: `${code}, ${money(measure - lim)} over the $${lim} dinner cap` }
        : { verdict: "ok", cite: `${code}, under the $${lim} dinner cap` };
    case "T-004":
      return measure > lim
        ? { verdict: "ok", cite: `${code}, business allowed over ${lim} hours` }
        : { verdict: "note", cite: `${code}, business class under ${lim} hours` };
    default:
      return measure > lim
        ? { verdict: "note", cite: `${code}, no receipt over $${lim}` }
        : { verdict: "ok", cite: `${code}, no receipt needed under $${lim}` };
  }
}

const START = Object.fromEntries(LIMITS.map((l) => [l.code, l.value]));
const BEFORE = Object.fromEntries(WEEK.map((c) => [c.id, judge(c, START).verdict]));

export function TryIt() {
  const [vals, setVals] = useState<Record<string, number>>(START);
  const [beat, setBeat] = useState(0);
  /* steppers and blur snap to the limit's range and step; typing re-checks on every keystroke */
  const set = (code: string, raw: number, snap = true) => {
    if (!Number.isFinite(raw)) return;
    const l = LIMITS.find((x) => x.code === code)!;
    const v = snap ? Math.min(l.max, Math.max(l.min, Math.round(raw / l.step) * l.step)) : Math.max(0, Math.min(raw, 9999));
    setVals((o) => ({ ...o, [code]: v }));
    setBeat((b) => b + 1);
  };
  const rows = WEEK.map((c) => ({ c, ...judge(c, vals) }));
  const count = (v: Verdict) => rows.filter((r) => r.verdict === v).length;
  const changed = beat > 0;

  return (
    <section className="lp-try" id="try" aria-labelledby="try-t">
      <div className="lp-wrap lp-try-grid">
        <div className="lp-try-copy" data-rv>
          <p className="lp-kick lp-kick--night">Try it</p>
          <h2 id="try-t" className="lp-h2">
            Change a limit. Watch every charge re&#8209;check.
          </h2>
          <p className="lp-try-lede">
            Your policy is the source. Change a number and this week&rsquo;s charges are checked again, the same way Sylph
            checks each one as it happens.
          </p>
          <ol className="lp-try-points">
            <li>
              <span>01</span>Every verdict names the rule that decided it.
            </li>
            <li>
              <span>02</span>The same charge always gets the same answer.
            </li>
            <li>
              <span>03</span>Blocked spend stays off the reimbursement total.
            </li>
          </ol>
        </div>

        <div className="ap lp-pol" data-rv>
          <div className="lp-pol-h">
            <Bird />
            <strong>T&amp;E Policy 2026</strong>
            <span className="ap-chip ap-chip--gray">Draft</span>
            <span className="lp-pol-sp" />
            <small className="ap-num">Sample policy</small>
          </div>
          <ol className="lp-pol-lines">
            {LIMITS.map((l, i) => (
              <li key={l.code}>
                <em className="ap-num">{String(i + 1).padStart(2, "0")}</em>
                <span className="lp-pol-s">
                  {l.before}{" "}
                  <span className="lp-val">
                    <button type="button" onClick={() => set(l.code, vals[l.code] - l.step)} aria-label={`Lower: ${l.before} ${l.after}`}>
                      <Minus strokeWidth={2} />
                    </button>
                    <label>
                      {l.unit === "$" && <span aria-hidden="true">$</span>}
                      <input
                        type="number"
                        inputMode="numeric"
                        min={l.min}
                        max={l.max}
                        step={l.step}
                        value={vals[l.code]}
                        onChange={(e) => set(l.code, e.target.valueAsNumber, false)}
                        onBlur={(e) => set(l.code, e.target.valueAsNumber)}
                        aria-label={`${l.before} ${l.unit === "$" ? "dollars" : "hours"} ${l.after}`}
                        style={{ width: `${String(vals[l.code]).length + 0.6}ch` }}
                      />
                    </label>
                    <button type="button" onClick={() => set(l.code, vals[l.code] + l.step)} aria-label={`Raise: ${l.before} ${l.after}`}>
                      <Plus strokeWidth={2} />
                    </button>
                  </span>
                  {l.after === "." ? "." : ` ${l.after}`}
                </span>
                <code className="ap-num">{l.code}</code>
              </li>
            ))}
          </ol>
          <div className="lp-pol-sep ap-num">
            <span>This week, {WEEK.length} charges</span>
            <b key={beat} className={changed ? "is-beat" : ""}>
              {changed ? "Re-checked just now" : "Checked as they posted"}
            </b>
          </div>
          <ul className="lp-pol-rows" aria-live="polite">
            {rows.map(({ c, verdict, cite }) => {
              const flipped = verdict !== BEFORE[c.id];
              return (
                <li key={c.id} className={flipped ? "is-flip" : ""}>
                  <KindIcon kind={c.kind} />
                  <span className="lp-pol-m">
                    <b>{c.merchant}</b>
                    <small>{c.detail}</small>
                    <cite className="ap-num">{cite}</cite>
                  </span>
                  <span className="ap-num lp-pol-amt">{money(c.amount)}</span>
                  <span className="lp-pol-v">
                    <StatusTag v={verdict} />
                    {flipped && <small className="ap-num">was {BEFORE[c.id] === "ok" ? "in policy" : "needs a note"}</small>}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="lp-pol-sum ap-num">
            {count("ok")} in policy &middot; {count("note")} {count("note") === 1 ? "needs" : "need"} a note &middot; {count("block")} blocked
          </p>
        </div>
      </div>
    </section>
  );
}
