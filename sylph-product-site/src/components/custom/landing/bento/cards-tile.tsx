"use client";

import { useState } from "react";
import { CreditCard, Landmark } from "lucide-react";
import { Bird } from "../bird";
import { Tile } from "./tile";

/* Cards connect: switch on the company's cards and its bank feed, the way Finance > Cards & connections lists them
   in application-v2 (finance/cards-tab.tsx), and each one draws its line into Sylph. No card networks or banks named. */
const SOURCES = [
  { id: "c1", Icon: CreditCard, name: "Company card", num: "•••• 4417", kind: "card" },
  { id: "c2", Icon: CreditCard, name: "Travel card", num: "•••• 1009", kind: "card" },
  { id: "b1", Icon: Landmark, name: "Operating account", num: "Bank feed", kind: "bank" },
];

export function CardsTile() {
  const [on, setOn] = useState<Record<string, boolean>>({});
  const used = Object.keys(on).length > 0;
  const all = SOURCES.every((s) => on[s.id]);
  return (
    <Tile
      id="cards"
      className="lp-tile--cards"
      title="Works on the cards you have."
      line="Connect the company cards and bank feeds you already use. Nothing new to issue."
      used={used}
    >
      <div className="ap lp-cards" data-all={all || undefined}>
        <ul className="lp-cards-list">
          {SOURCES.map((s, i) => {
            const live = !!on[s.id];
            return (
              <li key={s.id} className={live ? "is-on" : ""} style={{ "--i": i } as React.CSSProperties}>
                <span className="ap-ic">
                  <s.Icon strokeWidth={1.75} />
                </span>
                <span className="lp-cards-m">
                  <b>{s.name}</b>
                  <small className="ap-num">{live ? (s.kind === "bank" ? "Connected · synced just now" : `${s.num} · Active`) : s.num}</small>
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={live}
                  aria-label={`Connect ${s.name}`}
                  className="lp-switch"
                  onClick={() => setOn((o) => ({ ...o, [s.id]: !o[s.id] }))}
                >
                  <i />
                </button>
              </li>
            );
          })}
        </ul>
        <svg className="lp-cards-wires" viewBox="0 0 100 150" preserveAspectRatio="none" aria-hidden="true">
          {SOURCES.map((s, i) => (
            <path key={s.id} className={on[s.id] ? "is-on" : ""} d={`M0 ${25 + i * 50} C 50 ${25 + i * 50}, 50 75, 100 75`} pathLength={1} />
          ))}
        </svg>
        <div className="lp-cards-hub">
          <span className="lp-cards-bird">
            <Bird />
          </span>
          <small className="ap-num">{all ? "All charges flowing in" : `${SOURCES.filter((s) => on[s.id]).length} of 3 connected`}</small>
        </div>
      </div>
    </Tile>
  );
}
