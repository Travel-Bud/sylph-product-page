"use client";

import { useEffect, useRef, useState } from "react";

type Status = "open" | "approved" | "returned" | "closing" | "gone";

interface Row {
  id: string;
  merchant: string;
  amount: string;
  cat: string;
  catKey: string;
  who: string;
  cite: string;
  note: string;
}

const ROWS: Row[] = [
  {
    id: "sushi",
    merchant: "Sushi Kanda",
    amount: "$84.20",
    cat: "Meals",
    catKey: "food",
    who: "Priya N.",
    cite: "M-041, solo dinner cap $75.00, $9.20 over",
    note: "Client dinner, receipt attached.",
  },
  {
    id: "marriott",
    merchant: "Marriott Marquis",
    amount: "$412.00",
    cat: "Lodging",
    catKey: "stay",
    who: "Dan O.",
    cite: "L-007, Chicago nightly cap $350.00, $62.00 over",
    note: "Conference block rate, nothing lower nearby.",
  },
  {
    id: "cab",
    merchant: "Yellow Cab Co",
    amount: "$41.60",
    cat: "Ground",
    catKey: "move",
    who: "Priya N.",
    cite: "D-001, same amount and date as the Uber charge",
    note: "Two rides, airport then hotel. Both receipts attached.",
  },
];

const DECIDED_LABEL: Record<"approved" | "returned", string> = {
  approved: "Cleared, note kept",
  returned: "Returned for more detail",
};

/**
 * Real-time piece 4: the reviewer's queue. Three exceptions, each carrying
 * its citation and the note the employee left on the line. Approve or return
 * and the line resolves (one colour sweep, then it leaves the queue). The
 * empty state is the point: nothing cleared ever reached this list.
 */
export function ReviewQueue({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<Record<string, Status>>(() => Object.fromEntries(ROWS.map((r) => [r.id, "open"])));
  const timers = useRef<number[]>([]);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = timers.current;
    return () => t.forEach((id) => window.clearTimeout(id));
  }, []);

  const decide = (id: string, next: "approved" | "returned") => {
    setStatus((s) => ({ ...s, [id]: next }));
    const hold = reduced.current ? 700 : 1100;
    timers.current.push(
      window.setTimeout(() => setStatus((s) => ({ ...s, [id]: "closing" })), hold),
      window.setTimeout(() => setStatus((s) => ({ ...s, [id]: "gone" })), hold + (reduced.current ? 0 : 420)),
    );
  };

  const reset = () => setStatus(Object.fromEntries(ROWS.map((r) => [r.id, "open"])));
  const remaining = ROWS.filter((r) => status[r.id] !== "gone").length;
  const openCount = ROWS.filter((r) => status[r.id] === "open").length;

  return (
    <div className={`win queue${compact ? " is-compact" : ""}`} aria-label="Sample review queue">
      {!compact && (
        <div className="win-bar">
          <span>Review queue</span>
          <span className="sample">Sample data</span>
        </div>
      )}
      <div className="queue-head">
        <span className="num" aria-live="polite">
          {openCount} to review
        </span>
        <span>Cleared lines never reach this queue</span>
      </div>
      <ul className="queue-rows">
        {(compact ? ROWS.slice(0, 2) : ROWS).map((r) => {
          const st = status[r.id];
          if (st === "gone") return null;
          const decided = st === "approved" || st === "returned";
          return (
            <li key={r.id} className={`q-row${st === "closing" ? " is-closing" : ""}${decided ? ` did-${st}` : ""}`}>
              <div className="q-inner">
                <div className="q-main">
                  <span className="q-merchant">{r.merchant}</span>
                  <span className="num q-amount">{r.amount}</span>
                  <span className={`cat cat-${r.catKey}`}>{r.cat}</span>
                  <span className="q-who mono">{r.who}</span>
                </div>
                <div className="q-cite mono">{r.cite}</div>
                {!compact && (
                  <div className="q-note">
                    <span className="q-note-k">Employee note</span>
                    <span>{r.note}</span>
                  </div>
                )}
                <div className="q-actions">
                  {decided ? (
                    <span className={`verdict ${st === "approved" ? "verdict-ok" : "verdict-note"}`}>
                      <i className="dot" aria-hidden="true" />
                      {DECIDED_LABEL[st]}
                    </span>
                  ) : (
                    <>
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => decide(r.id, "approved")}>
                        Approve
                      </button>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => decide(r.id, "returned")}>
                        Return
                      </button>
                    </>
                  )}
                </div>
              </div>
            </li>
          );
        })}
        {remaining === 0 && (
          <li className="q-empty">
            <span className="verdict verdict-ok">
              <i className="dot" aria-hidden="true" />
              Nothing left to review
            </span>
            <span>The report is ready to close, every decision cited.</span>
            <button type="button" className="btn btn-secondary btn-sm" onClick={reset}>
              Bring them back
            </button>
          </li>
        )}
      </ul>
      {!compact && (
        <div className="queue-foot">
          <span>Approved lines land on the report with the rule and the note beside them.</span>
        </div>
      )}
    </div>
  );
}
