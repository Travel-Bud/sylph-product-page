"use client";

import { useRef, useState } from "react";
import { Check, CircleCheck, CircleDashed, CircleDot, LoaderCircle, RotateCcw } from "lucide-react";
import { CARD_CHARGES } from "../data";
import { useReducedMotion } from "../hooks";
import { Tile } from "./tile";

type Phase = "idle" | "drag" | "fly" | "read" | "match" | "check" | "done";

const STEPS: { id: Phase; label: string }[] = [
  { id: "read", label: "Reading receipt" },
  { id: "match", label: "Matching" },
  { id: "check", label: "Checking policy" },
];

/* A receipt snaps to its charge: drag the photo toward the card charges and it finds the one it belongs to, then runs
   the app's own steps (Reading receipt, Matching, Checking policy) and shows the signals that matched it.
   A tap, a click or Enter does the same. */
export function ReceiptTile() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [off, setOff] = useState({ x: 0, y: 0, s: 1 });
  const reduce = useReducedMotion();
  const rcpt = useRef<HTMLButtonElement>(null);
  const slot = useRef<HTMLSpanElement>(null);
  const grab = useRef<{ x: number; y: number; moved: boolean } | null>(null);

  const snap = () => {
    const r = rcpt.current?.getBoundingClientRect();
    const s = slot.current?.getBoundingClientRect();
    if (!r || !s || reduce) {
      setPhase("done");
      return;
    }
    setOff((o) => ({
      x: o.x + (s.left + s.width / 2 - (r.left + r.width / 2)),
      y: o.y + (s.top + s.height / 2 - (r.top + r.height / 2)),
      s: s.width / (r.width / o.s),
    }));
    setPhase("fly");
    window.setTimeout(() => setPhase("read"), 460);
    window.setTimeout(() => setPhase("match"), 900);
    window.setTimeout(() => setPhase("check"), 1340);
    window.setTimeout(() => setPhase("done"), 1800);
  };

  const reset = () => {
    setOff({ x: 0, y: 0, s: 1 });
    setPhase("idle");
  };

  const down = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (phase !== "idle") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    grab.current = { x: e.clientX, y: e.clientY, moved: false };
    setPhase("drag");
  };
  const move = (e: React.PointerEvent<HTMLButtonElement>) => {
    const g = grab.current;
    if (!g || phase !== "drag") return;
    const x = e.clientX - g.x;
    const y = e.clientY - g.y;
    if (Math.hypot(x, y) > 6) g.moved = true;
    setOff({ x, y, s: 1 });
  };
  const up = () => {
    const g = grab.current;
    grab.current = null;
    if (phase !== "drag" || !g) return;
    /* a drag of any real length, or a plain tap, sends the receipt to its charge */
    snap();
  };

  const done = phase === "done";
  const landed = done || phase === "read" || phase === "match" || phase === "check";
  const stepAt = STEPS.findIndex((x) => x.id === phase);
  return (
    <Tile
      id="receipt"
      className="lp-tile--receipt"
      title="Receipts find their own charge."
      line="Text a photo, forward the email or drop it in. Each one finds its charge."
      used={phase !== "idle"}
    >
      <div className="ap lp-rc" data-phase={phase}>
        <div className="lp-rc-top">
          {!landed && (
            <button
              ref={rcpt}
              type="button"
              className={`lp-rc-paper is-${phase}`}
              style={{ transform: `translate(${off.x}px, ${off.y}px) scale(${off.s})` }}
              onPointerDown={down}
              onPointerMove={move}
              onPointerUp={up}
              onPointerCancel={reset}
              onClick={(e) => {
                if (e.detail === 0) snap();
              }}
              aria-label="Receipt from Sushi Kanda, $84.20. Match it to its card charge"
            >
              <span className="lp-rc-sheet">
              <span className="lp-rc-shop">SUSHI KANDA</span>
              <span className="lp-rc-addr">412 E 9th St, New York</span>
              <span className="lp-rc-l">
                <span>Omakase</span>
                <span>68.00</span>
              </span>
              <span className="lp-rc-l">
                <span>Tea</span>
                <span>6.00</span>
              </span>
              <span className="lp-rc-l">
                <span>Tax</span>
                <span>6.04</span>
              </span>
              <span className="lp-rc-l">
                <span>Tip</span>
                <span>4.16</span>
              </span>
              <span className="lp-rc-l lp-rc-tot">
                <span>TOTAL</span>
                <span>84.20</span>
              </span>
              <span className="lp-rc-when">SEP 12 2026 9:48 PM</span>
              </span>
            </button>
          )}
          {landed && !done && (
            <ol className="lp-rc-steps" aria-live="polite">
              {STEPS.map((x, i) => (
                <li key={x.id} className={i < stepAt ? "is-done" : i === stepAt ? "is-now" : ""}>
                  {i < stepAt ? <Check strokeWidth={2} /> : i === stepAt ? <LoaderCircle strokeWidth={2} /> : <CircleDashed strokeWidth={1.75} />}
                  {x.label}
                </li>
              ))}
            </ol>
          )}
          {done && (
            <div className="ap-card lp-rc-signals" aria-live="polite">
              <p className="lp-rc-sig-h">
                <span className="ap-tag ap-tag--ok">
                  <CircleCheck strokeWidth={2} />
                  Matched to Sushi Kanda, Sep 12
                </span>
                <button type="button" className="lp-again" onClick={reset}>
                  <RotateCcw strokeWidth={1.75} />
                  Again
                </button>
              </p>
              <p className="lp-rc-sig">
                <span className="ap-chip ap-chip--ok">amount &#10003;</span>
                <span className="ap-chip ap-chip--ok">date &#10003;</span>
                <span className="ap-chip ap-chip--ok">merchant &#10003;</span>
                <span className="ap-num lp-rc-of">3 of 3 signals</span>
              </p>
              <p className="lp-rc-pol">
                <span className="ap-tag ap-tag--note">
                  <CircleDot strokeWidth={2} />
                  Needs a note
                </span>
                <span className="ap-num">M-041 &middot; $9.20 over the $75 dinner cap</span>
              </p>
            </div>
          )}
        </div>
        <div className="ap-card lp-rc-list">
          <p className="lp-rc-list-h">
            Card charges <span className="ap-cardchip">Credit &middot;&middot;4417</span>
          </p>
          {CARD_CHARGES.map((c) => {
            const target = c.id === "sk";
            const matched = c.matched || (target && landed);
            return (
              <div key={c.id} className={`lp-rc-row${target ? " is-target" : ""}${target && landed ? " is-hit" : ""}`}>
                <span className="lp-rc-thumb" ref={target ? slot : undefined}>
                  {matched && <i aria-hidden="true" />}
                </span>
                <span className="lp-rc-m">
                  <b>{c.merchant}</b>
                  <small>{c.when}</small>
                </span>
                <span className="ap-num">{c.amount}</span>
                <span className={`ap-tag ap-tag--${matched ? "ok" : "note"}`}>
                  {matched ? <CircleCheck strokeWidth={2} /> : <CircleDashed strokeWidth={2} />}
                  {matched ? "Matched" : "Unmatched"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Tile>
  );
}
