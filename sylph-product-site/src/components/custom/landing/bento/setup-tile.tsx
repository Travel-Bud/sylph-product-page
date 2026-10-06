"use client";

import { useEffect, useRef, useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { useReducedMotion } from "../hooks";
import { Tile } from "./tile";

/* Setup in about an hour: press and hold to run the admin wizard's steps (application-v2's onboarding: Company &
   Team, Policy Setup, Review & Launch) while the clock runs. Letting go early winds it back. The only claim is the
   one we can make: it took us about an hour for a 10-person company. */
const STEPS = [
  { t: "Company & Team", d: "Invite people, connect cards" },
  { t: "Policy Setup", d: "Quick: about 5 minutes" },
  { t: "Review & Launch", d: "Approve the rules" },
];
const HOLD_MS = 1800;

export function SetupTile() {
  const [p, setP] = useState(0);
  const [holding, setHolding] = useState(false);
  const reduce = useReducedMotion();
  const pRef = useRef(0);

  /* holding runs the clock forward; letting go before the end winds it back */
  useEffect(() => {
    if (!holding && (pRef.current <= 0 || pRef.current >= 1)) return;
    let id = 0;
    let lastT = 0;
    const tick = (t: number) => {
      const dt = lastT ? t - lastT : 16;
      lastT = t;
      const v = holding ? Math.min(1, pRef.current + dt / HOLD_MS) : Math.max(0, pRef.current - dt / 700);
      pRef.current = v;
      setP(v);
      if (holding ? v < 1 : v > 0) id = requestAnimationFrame(tick);
      else if (v >= 1) setHolding(false);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [holding]);

  const start = () => {
    if (pRef.current >= 1) return;
    if (reduce) {
      pRef.current = 1;
      setP(1);
      return;
    }
    setHolding(true);
  };
  const stop = () => setHolding(false);
  const done = p >= 1;
  const mins = Math.round(p * 60);
  const R = 34;
  const L = 2 * Math.PI * R;

  return (
    <Tile
      id="setup"
      className="lp-tile--setup"
      title="Set up in about an hour."
      line="It took us about an hour for a 10-person company."
      hint="Press and hold"
      touchHint="Press and hold"
      used={p > 0}
    >
      <div className="ap lp-setup" data-done={done || undefined}>
        <div className="lp-setup-dial" aria-hidden="true">
          <svg viewBox="0 0 80 80">
            <circle cx="40" cy="40" r={R} className="lp-dial-track" />
            <circle cx="40" cy="40" r={R} className="lp-dial-run" style={{ strokeDasharray: L, strokeDashoffset: L * (1 - p) }} />
          </svg>
          <span className="ap-num">{done ? "1 h" : `${mins} min`}</span>
        </div>
        <ol className="lp-setup-steps">
          {STEPS.map((s, i) => {
            const ok = p >= (i + 1) / STEPS.length - 0.001;
            return (
              <li key={s.t} className={ok ? "is-ok" : ""}>
                <span className="lp-setup-dot">{ok && <Check strokeWidth={2.5} />}</span>
                <span>
                  <b>{s.t}</b>
                  <small>{s.d}</small>
                </span>
              </li>
            );
          })}
        </ol>
        <div className="lp-setup-act">
          <button
            type="button"
            className={`ap-btn ap-btn--ink lp-hold${holding ? " is-holding" : ""}`}
            aria-disabled={done}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              start();
            }}
            onPointerUp={stop}
            onPointerCancel={stop}
            onKeyDown={(e) => {
              if ((e.key === " " || e.key === "Enter") && !e.repeat) {
                e.preventDefault();
                start();
              }
            }}
            onKeyUp={(e) => {
              if (e.key === " " || e.key === "Enter") stop();
            }}
          >
            <span className="lp-hold-fill" style={{ transform: `scaleX(${p})` }} aria-hidden="true" />
            <span className="lp-hold-t">{done ? "Live" : holding ? "Setting up..." : "Hold to set up"}</span>
          </button>
          {done && (
            <button
              type="button"
              className="lp-again"
              onClick={() => {
                pRef.current = 0;
                setP(0);
              }}
            >
              <RotateCcw strokeWidth={1.75} />
              Again
            </button>
          )}
        </div>
      </div>
    </Tile>
  );
}
