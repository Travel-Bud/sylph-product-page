"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCcw, Search } from "lucide-react";
import { FLIGHTS, TRIP_SENTENCE } from "../data";
import { useReducedMotion } from "../hooks";
import { Tile } from "./tile";

type Phase = "idle" | "typing" | "filled" | "done";

/* Book a trip in a sentence, the way Plan trip does it in application-v2 (trip/concourse/omnibox.tsx): the one line
   fills the search bar, the search comes back with every fare already marked against the policy, and an
   out-of-policy fare stays bookable but is flagged for the approver. */
const FIELDS = [
  { k: "Where from?", v: "SFO" },
  { k: "Where to?", v: "JFK" },
  { k: "Dates", v: "Oct 13 to 16" },
  { k: "Travelers", v: "1 \u00b7 Economy" },
];

export function TripTile() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [n, setN] = useState(0);
  const reduce = useReducedMotion();
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((t) => window.clearTimeout(t));
  }, []);

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  const run = () => {
    if (phase !== "idle") return;
    if (reduce) {
      setN(TRIP_SENTENCE.length);
      setPhase("done");
      return;
    }
    setPhase("typing");
    for (let i = 1; i <= TRIP_SENTENCE.length; i++) later(() => setN(i), i * 36);
    const end = TRIP_SENTENCE.length * 36;
    later(() => setPhase("filled"), end + 220);
    later(() => setPhase("done"), end + 900);
  };

  const reset = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current.length = 0;
    setN(0);
    setPhase("idle");
  };

  const filled = phase === "filled" || phase === "done";
  return (
    <Tile
      id="trip"
      className="lp-tile--trip"
      title="Book a trip in one sentence."
      line="Type the whole trip as one line. Every fare comes back checked against your policy."
      hint="Click the search line"
      touchHint="Tap the search line"
      used={phase !== "idle"}
    >
      <div className="ap lp-trip">
        <div className="ap-card lp-trip-card">
          <p className="lp-trip-q">Where are we headed, Priya?</p>
          <button type="button" className={`lp-omni is-${phase}`} onClick={phase === "done" ? reset : run} aria-label={phase === "done" ? "Start again" : `Plan a trip: ${TRIP_SENTENCE}`}>
            {phase === "idle" ? <span className="lp-omni-ghost">{TRIP_SENTENCE}</span> : <span className="lp-omni-typed ap-num">{TRIP_SENTENCE.slice(0, n)}</span>}
            <i className="lp-caret" aria-hidden="true" />
            {phase === "done" ? <RotateCcw strokeWidth={1.75} aria-hidden="true" /> : <kbd aria-hidden="true">/</kbd>}
          </button>
          <p className="lp-trip-tip">Type the whole trip as one line, &ldquo;sfo to jfk, tue to fri, business&rdquo;</p>
          <div className={`lp-trip-bar${filled ? " is-filled" : ""}`}>
            {FIELDS.map((f, i) => (
              <span key={f.k} className="lp-trip-f" style={{ transitionDelay: `${i * 70}ms` }}>
                <small>{f.k}</small>
                <b>{filled ? f.v : " "}</b>
              </span>
            ))}
            <span className="ap-btn ap-btn--ink lp-trip-go" aria-hidden="true">
              <Search strokeWidth={1.75} />
              Search
            </span>
          </div>
          {phase !== "done" && (
            <p className="lp-fares-ghost ap-num" aria-hidden="true">
              Fares come back here, each one checked against T&amp;E Policy 2026
            </p>
          )}
          <ul className={`lp-fares${phase === "done" ? " is-done" : ""}`} aria-live="polite">
            {phase === "done" &&
              FLIGHTS.map((f, i) => (
                <li key={f.airline} className={f.ok ? "" : "is-out"} style={{ animationDelay: `${i * 90}ms` }}>
                  <span className="lp-fare-m">
                    <b>{f.airline}</b>
                    <small>
                      {f.time}, {f.info}
                    </small>
                  </span>
                  <span className="ap-num lp-fare-p">{f.price}</span>
                  <span className={`lp-fare-pol ap-num${f.ok ? "" : " is-out"}`}>{f.ok ? "In policy" : "Out of policy"}</span>
                  {!f.ok && <span className="lp-fare-strip ap-num">Business class is for flights over 6 hours &middot; bookable, flagged for approver</span>}
                </li>
              ))}
          </ul>
        </div>
      </div>
    </Tile>
  );
}
