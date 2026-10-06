"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { StatusTag } from "../app-ui/chip";
import { money } from "../data";
import { Tile } from "./tile";

const DINNER = 84.2;

/* Change a limit: drag the dinner cap and the same dinner re-checks against it, the way a rule reads in the app
   ("What this rule does: Flag the expense when ... is greater than $75"). Steppers do the same on a phone. */
export function LimitTile() {
  const [cap, setCap] = useState(75);
  const [used, setUsed] = useState(false);
  const set = (v: number) => {
    setUsed(true);
    setCap(Math.min(120, Math.max(40, v)));
  };
  const over = DINNER > cap;
  const pct = ((cap - 40) / 80) * 100;
  return (
    <Tile
      id="limit"
      className="lp-tile--limit"
      title="Change a limit, see what changes."
      line="Every rule is a sentence with a number in it. Move the number."
      used={used}
    >
      <div className="ap lp-limit">
        <div className="ap-card lp-limit-card">
          <p className="ap-cap">M-041 &middot; What this rule does</p>
          <p className="lp-limit-rule">
            Flag the expense when dinner is greater than <b className="ap-num">${cap}</b> a person.
          </p>
          <div className="lp-limit-ctl">
            <button type="button" className="lp-stepper" onClick={() => set(cap - 5)} aria-label="Lower the limit by $5">
              <Minus strokeWidth={2} />
            </button>
            <input
              type="range"
              min={40}
              max={120}
              step={5}
              value={cap}
              onChange={(e) => set(Number(e.target.value))}
              aria-label="Dinner limit, dollars a person"
              aria-valuetext={`$${cap}`}
              style={{ "--pct": `${pct}%` } as React.CSSProperties}
            />
            <button type="button" className="lp-stepper" onClick={() => set(cap + 5)} aria-label="Raise the limit by $5">
              <Plus strokeWidth={2} />
            </button>
          </div>
          <div className={`lp-limit-row${over ? " is-over" : ""}`} aria-live="polite">
            <span>
              <b>Sushi Kanda</b>
              <small>Dinner, 1 person</small>
            </span>
            <span className="ap-num">{money(DINNER)}</span>
            <StatusTag v={over ? "note" : "ok"} />
          </div>
          <p className="lp-limit-why ap-num">{over ? `${money(DINNER - cap)} over the $${cap} cap` : `Under the $${cap} cap`}</p>
        </div>
      </div>
    </Tile>
  );
}
