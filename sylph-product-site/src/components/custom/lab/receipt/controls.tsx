"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { isOn, play, setOn, subscribe } from "@/components/custom/v2-sides/sound";
import { CHARGE, EXPORTS, type ExportId } from "./data";
import { Stamp } from "./paper";

const REDUCE = "(prefers-reduced-motion: reduce)";
function subReduce(fn: () => void) {
  const mq = window.matchMedia(REDUCE);
  mq.addEventListener("change", fn);
  return () => mq.removeEventListener("change", fn);
}
export function useReduced() {
  return useSyncExternalStore(subReduce, () => window.matchMedia(REDUCE).matches, () => false);
}

/** The page's one sound switch, on the print head. Off by default; sound.ts keeps the rest of the policy. */
export function SoundToggle() {
  const on = useSyncExternalStore(subscribe, isOn, () => false);
  return (
    <button
      type="button"
      className="rcp-sound"
      aria-pressed={on}
      onClick={() => {
        setOn(!on);
        if (!on) play("toggle");
      }}
    >
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3.5 7.5h2.8L10 4.5v11l-3.7-3H3.5z" fill="currentColor" fillOpacity={on ? 1 : 0} />
        {on ? <path d="M13 7.2a4 4 0 0 1 0 5.6M15.3 5a7 7 0 0 1 0 10" /> : <path d="M13.5 8l4 4M17.5 8l-4 4" />}
      </svg>
      <span className="rcp-sound-t">Sound {on ? "on" : "off"}</span>
    </button>
  );
}

/**
 * Dana's approval. The visitor can press her button; if nobody does, she presses it herself once the
 * block is halfway up the screen, because the story does not wait. Reduced motion shows it approved.
 */
export function Approval() {
  const reduced = useReduced();
  const [approved, setApproved] = useState(false);
  const [byHand, setByHand] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setApproved(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -48% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const done = approved || reduced;
  return (
    <div className="rcp-approve" ref={ref}>
      <div className="rcp-approve-row rcp-ln">
        <span className="rcp-approve-who">09:12 Dana read my note.</span>
        <button
          type="button"
          className="rcp-btn rcp-btn--approve"
          disabled={done}
          onClick={() => {
            setApproved(true);
            setByHand(true);
            play("stamp");
          }}
        >
          {done ? "Approved" : "Approve"}
        </button>
      </div>
      <p className="rcp-approve-cap rcp-ln" aria-live="polite">
        {done ? (byHand ? "You pressed Dana's button. Same answer she gave." : "Dana pressed it. One click, with the note right there.") : "Dana's button. Press it, or keep scrolling and she will."}
      </p>
      <Stamp tone="green" rot={-7} cue={null} live={done} className="rcp-stamp--approve" sub={`Dana, Sep 14 09:12`}>
        Approved
      </Stamp>
    </div>
  );
}

const PREVIEW: Record<ExportId, React.ReactNode> = {
  pdf: (
    <div className="rcp-x rcp-x--pdf">
      <div className="rcp-x-pdf-h">
        <span>Priya, September 2026</span>
        <span>Expense report</span>
      </div>
      <div className="rcp-x-pdf-l">
        <span>3</span>
        <span>Sep 12</span>
        <span>{CHARGE.merchant}</span>
        <span>{CHARGE.amount}</span>
      </div>
      <p>
        {CHARGE.rule}, ${CHARGE.over} over the $75 dinner cap. Note: {CHARGE.note} Approved by Dana, Sep 14.
      </p>
    </div>
  ),
  xlsx: (
    <div className="rcp-x rcp-x--xlsx" role="table" aria-label="Line 3 as a spreadsheet row">
      <div role="row" className="rcp-x-xr rcp-x-xr--h">
        {["Ln", "Date", "Merchant", "Amount", "Rule", "Verdict", "Approved"].map((c) => (
          <span role="columnheader" key={c}>
            {c}
          </span>
        ))}
      </div>
      <div role="row" className="rcp-x-xr">
        {["3", "2026-09-12", CHARGE.merchant, CHARGE.amount, CHARGE.rule, "Needs a note", "Dana"].map((c) => (
          <span role="cell" key={c}>
            {c}
          </span>
        ))}
      </div>
    </div>
  ),
  csv: (
    <pre className="rcp-x rcp-x--csv">
      {`date,account,debit,credit,memo
2026-09-12,6420 Meals,84.20,,Sushi Kanda M-041 note approved
2026-09-12,2110 Reimbursements payable,,84.20,Priya Sep ln 3`}
    </pre>
  ),
  qbo: (
    <div className="rcp-x rcp-x--qbo">
      <p>The month&apos;s journal, posted. Line 3 goes as two lines, 84.20 each side, the memo carrying the rule and the approval.</p>
    </div>
  ),
};

/** What the report leaves as. Each format shows line 3, the receipt, the way that file holds it. */
export function Exports() {
  const [cur, setCur] = useState<ExportId>("pdf");
  const e = EXPORTS.find((x) => x.id === cur) ?? EXPORTS[0];
  return (
    <div className="rcp-exports">
      <div className="rcp-exp-tabs rcp-ln" role="group" aria-label="Export formats">
        {EXPORTS.map((x) => (
          <button
            key={x.id}
            type="button"
            className="rcp-exp"
            aria-pressed={cur === x.id}
            onClick={() => {
              setCur(x.id);
              play("tap");
            }}
          >
            {x.k}
          </button>
        ))}
      </div>
      <div className="rcp-exp-view rcp-ln" aria-live="polite">
        <p className="rcp-exp-say">{e.say}</p>
        {PREVIEW[e.id]}
      </div>
    </div>
  );
}
