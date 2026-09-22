"use client";

import { useId, useState } from "react";

const CAP = 75;
const APPROVAL = 120;

function evaluate(amount: number) {
  if (amount > APPROVAL) {
    return {
      verdict: "block" as const,
      label: "Blocked",
      cites: [
        `M-042, solo dinner hard cap $${APPROVAL.toFixed(2)}, kept off the total`,
        `M-041, solo dinner cap $${CAP.toFixed(2)}, $${(amount - CAP).toFixed(2)} over`,
      ],
    };
  }
  if (amount > CAP) {
    return {
      verdict: "note" as const,
      label: "Needs a note",
      cites: [`M-041, solo dinner cap $${CAP.toFixed(2)}, $${(amount - CAP).toFixed(2)} over`],
    };
  }
  return {
    verdict: "ok" as const,
    label: "Cleared",
    cites: [`M-041, solo dinner cap $${CAP.toFixed(2)}, $${(CAP - amount).toFixed(2)} under`],
  };
}

/**
 * Real-time piece 2. Move the amount; the verdict recomputes from the same
 * two rules every time. "Run it again" re-evaluates and counts identical runs.
 */
export function VerdictCard({ compact = false }: { compact?: boolean }) {
  const id = useId();
  const [amount, setAmount] = useState(84.2);
  const [runs, setRuns] = useState(1);
  const r = evaluate(amount);

  return (
    <div className={`win vc${compact ? " is-compact" : ""}`} aria-label="Interactive sample verdict">
      {!compact && (
        <div className="win-bar">
          <span>Verdict</span>
          <span className="sample">Sample data</span>
        </div>
      )}
      <div className="vc-body">
        {!compact && (
          <div className="vc-meta mono">
            <span>Sushi Kanda</span>
            <span>Dinner</span>
            <span>Attendees 1</span>
            <span>Sep 12</span>
          </div>
        )}
        <div className="vc-amount">
          <label htmlFor={id} className="vc-label">
            Amount
          </label>
          <output htmlFor={id} className="num vc-num" aria-live="polite">
            ${amount.toFixed(2)}
          </output>
        </div>
        <input
          id={id}
          className="vc-range"
          type="range"
          min={12}
          max={140}
          step={0.1}
          value={amount}
          onChange={(e) => {
            setAmount(Number(e.target.value));
            setRuns(1);
          }}
          aria-valuetext={`$${amount.toFixed(2)}`}
        />
        <div className="vc-ticks mono" aria-hidden="true">
          <span>$12</span>
          {/* The compact tile is ~230px wide: the long labels collided there, so it shows the thresholds alone. */}
          <span className="vc-tick-cap">{compact ? "$75" : "cap $75.00"}</span>
          <span className="vc-tick-appr">{compact ? "$120" : "block $120.00"}</span>
          <span>$140</span>
        </div>
        <div className={`vc-result vc-result-${r.verdict}`} aria-live="polite">
          <span className={`verdict verdict-${r.verdict}`}>
            <i className="dot" aria-hidden="true" />
            {r.label}
          </span>
          {!compact && (
            <ul className="vc-cites mono">
              {r.cites.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          )}
        </div>
        {!compact && (
          <div className="vc-foot">
            <button type="button" className="btn btn-secondary" onClick={() => setRuns((n) => n + 1)}>
              Run it again
            </button>
            <span className="mono vc-runs" aria-live="polite">
              {runs === 1 ? "1 run" : `${runs} runs, identical`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
