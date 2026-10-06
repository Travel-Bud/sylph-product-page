"use client";

import { useEffect, useRef, useState } from "react";
import { ShieldAlert, ShieldX } from "lucide-react";
import { KindIcon, StatusTag } from "../app-ui/chip";
import { TRIP_CHARGES, money } from "../data";
import { useSeen } from "../hooks";
import { Tile } from "./tile";

/* A flagged charge reveals its rule: hover (or tap, or focus) a flagged line and it opens to the rule, the limit
   it crossed and the policy sentence it enforces, the way a flagged line reads in the app today
   (.design/product-current/11). The first flag opens on its own once the tile is in view, as the demonstration. */
export function FlagTile() {
  const [open, setOpen] = useState<string | null>(null);
  const [used, setUsed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const seen = useSeen(ref, 0.5);

  useEffect(() => {
    if (!seen || used) return;
    const t = window.setTimeout(() => setOpen((o) => o ?? "mm"), 900);
    return () => window.clearTimeout(t);
  }, [seen, used]);

  const pick = (id: string) => {
    setUsed(true);
    setOpen(id);
  };

  return (
    <Tile
      id="flag"
      className="lp-tile--flag"
      title="Every flag shows its reason."
      line="Open a flagged charge: the rule, the limit and the policy line it came from."
      used={used}
    >
      <div ref={ref} className="ap lp-flag">
        <div className="ap-card lp-flag-card">
          <div className="lp-flag-h">
            <b>New York client visit</b>
            <span className="ap-muted">5 charges, checked as they posted</span>
          </div>
          <ul className="lp-flag-list">
            {TRIP_CHARGES.map((c) => {
              const isOpen = open === c.id;
              const row = (
                <>
                  <KindIcon kind={c.kind} />
                  <span className="lp-flag-m">
                    <b>{c.merchant}</b>
                    <small>{c.detail}</small>
                  </span>
                  <span className="ap-num lp-flag-amt">{c.amount}</span>
                  <StatusTag v={c.verdict} />
                </>
              );
              if (!c.rule) {
                return (
                  <li key={c.id} className="lp-flag-li">
                    <div className="lp-flag-row">{row}</div>
                  </li>
                );
              }
              const r = c.rule;
              return (
                <li key={c.id} className={`lp-flag-li is-flagged${isOpen ? " is-open" : ""}`} data-v={c.verdict}>
                  <button
                    type="button"
                    className="lp-flag-row"
                    aria-expanded={isOpen}
                    aria-controls={`why-${c.id}`}
                    onMouseEnter={() => pick(c.id)}
                    onFocus={() => pick(c.id)}
                    onClick={() => pick(c.id)}
                  >
                    {row}
                  </button>
                  <div className="lp-why-wrap" id={`why-${c.id}`} inert={!isOpen}>
                    <div className="lp-why">
                      <p className="lp-why-rule">
                        {c.verdict === "block" ? <ShieldX strokeWidth={1.75} /> : <ShieldAlert strokeWidth={1.75} />}
                        <b>{r.name}</b>
                        <span className="ap-chip ap-chip--gray ap-num">{r.code}</span>
                      </p>
                      <p className="lp-why-quote">Violates policy: &ldquo;{r.policy}&rdquo;</p>
                      {r.meter ? (
                        <div className="lp-meter" aria-label={`${money(r.meter.value)} against a ${money(r.meter.cap)} limit`}>
                          <div className="lp-meter-bar">
                            <span className="lp-meter-in" style={{ width: `${(r.meter.cap / r.meter.value) * 100}%` }} />
                            <span className="lp-meter-over" />
                            <i style={{ left: `${(r.meter.cap / r.meter.value) * 100}%` }} />
                          </div>
                          <p className="lp-meter-k">
                            <span className="ap-num">{money(r.meter.cap)} limit</span>
                            <b>{r.reason}</b>
                          </p>
                        </div>
                      ) : (
                        <p className="lp-why-reason">{r.reason}</p>
                      )}
                      <p className="lp-why-then">
                        {r.then}
                        <span className="ap-num">{r.source}</span>
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Tile>
  );
}
