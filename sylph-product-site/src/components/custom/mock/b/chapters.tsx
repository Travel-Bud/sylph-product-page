"use client";

import { useState } from "react";
import { EXCEPTIONS, QBO_LIVE } from "@/components/custom/v2-sides/data";
import { Figure } from "@/components/custom/v2-sides/parts";
import { play } from "@/components/custom/v2-sides/sound";
import { ANSWERS, AnswerDetail, Card, DeskQueue, MonthReport, PolicyCompile, ReceiptPaths, StopPulse, tabKeys } from "./panels";
import { DeskWall } from "./wall";

/* The landing's five chapters (Mock B; copy cut to one headline and one line each on 2026-09-25), each
   with its own composition and ground. Priya's chapters sit on her coat blue (the answer on its deep ink), Dana's
   on the sweater lilac, month end on the deep green where they meet. */

/** Where the courier lands the charge in a chapter: the pill alone ([data-courier-stop], courier.tsx). */
function Stop({ n }: { n: number }) {
  return (
    <p className="v2s-token-line" data-rv>
      <span className="v2s-token-pill" data-courier-stop={n}>
        <span className="v2s-token-m">Sushi Kanda</span>
        <span className="mono">$84.20</span>
      </span>
    </p>
  );
}

/* ---------- 1. Receipts: a street. The headline across the top, Priya walks in on the floor line
   beside the panel ---------- */
export function Receipts() {
  return (
    <section id="receipts" className="v2s-ch v2c v2c--priya mb-ch mb-rc" aria-labelledby="receipts-t" data-ground="#eaf1fb">
      <StopPulse stop={1} />
      <StopPulse stop={2} />
      <StopPulse stop={3} />
      <StopPulse stop={4} />
      <StopPulse stop={5} />
      <div className="v2s-wrap mb-rc-grid">
        <div className="mb-rc-head">
          <h2 id="receipts-t" className="mb-h2">
            <span className="v2s-name v2s-name--priya">Priya</span> just texts a&nbsp;photo.
          </h2>
        </div>
        <div className="mb-rc-lede">
          <p className="mb-lede">
            Or forwards the email, or drops it in the app. Sylph finds the card charge it belongs to, and that is
            her whole expense report.
          </p>
          <Stop n={1} />
        </div>
        <div className="mb-rc-fig">
          <Figure name="priya-walk" height={440} />
        </div>
        <div className="mb-rc-panel">
          <ReceiptPaths />
        </div>
      </div>
    </section>
  );
}

/* ---------- 2. Policy: a document. A centred title block, then the compile pinned wide with Dana
   reading at its edge. The pin is 150svh, and the charge waits under the compile while it runs ---------- */
export function Policy() {
  return (
    <section id="policy" className="v2s-ch v2c v2c--dana mb-ch mb-po" aria-labelledby="policy-t" data-ground="#f3effb">
      <div className="v2s-wrap mb-po-intro">
        <h2 id="policy-t" className="mb-h2">
          <span className="v2s-name v2s-name--dana">Dana</span> sets the rules once.
        </h2>
        <p className="mb-lede">
          Upload your expense policy, or answer a few questions instead. Sylph turns each line into a rule, and
          nothing runs until Dana approves it.
        </p>
      </div>
      <div className="mb-po-track" data-pin-track>
        <div className="mb-po-pin">
          <div className="v2s-wrap mb-po-stage">
            <div className="mb-po-panel">
              <PolicyCompile />
              <Stop n={2} />
            </div>
            <div className="mb-po-fig">
              <Figure name="dana-review" height={420} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 3. Verdicts: the answer, on Priya's deep coat blue. The three words are the picker: each
   one opens the answer Priya got, with its rule, threshold and amount ---------- */
const WORD: Record<string, { w: string; rule: string }> = {
  united: { w: "Cleared", rule: "T-004" },
  sushi: { w: "Needs a note", rule: "M-041" },
  bar: { w: "Blocked", rule: "M-022" },
  flight: { w: "In policy, before she books", rule: "T-004" },
};

function VerdictBoard() {
  const [i, setI] = useState(1);
  const a = ANSWERS[i];
  const pick = (j: number) => {
    play("tap");
    setI(j);
  };
  return (
    <>
      <div className="mb-vd-words" role="tablist" aria-orientation="vertical" aria-label="Answers Priya got">
        {ANSWERS.map((x, j) => (
          <button
            key={x.id}
            type="button"
            role="tab"
            id={`mb-ans-${x.id}`}
            aria-selected={i === j}
            aria-controls="mb-ans-panel"
            tabIndex={i === j ? 0 : -1}
            className={`mb-vd-word mb-vd-word--${x.v}${x.id === "flight" ? " is-small" : ""}`}
            onClick={() => pick(j)}
            onKeyDown={(e) => tabKeys(e, j, ANSWERS.length, setI)}
          >
            <span className="mb-vd-w">{WORD[x.id].w}</span>
            <span className="mb-vd-meta mono">
              {WORD[x.id].rule} &middot; {x.merchant} {x.amount}
            </span>
          </button>
        ))}
      </div>
      <div className="mb-vd-panel">
        <Card side="priya" title="What Sylph tells her" className="mb-vd-card">
          <div className="v2c-pick-detail" role="tabpanel" id="mb-ans-panel" aria-labelledby={`mb-ans-${a.id}`} key={a.id}>
            <AnswerDetail id={a.id} />
          </div>
        </Card>
      </div>
    </>
  );
}

export function Verdicts() {
  return (
    <section id="verdicts" className="v2s-ch v2c v2c--priya mb-ch mb-vd" aria-labelledby="verdicts-t" data-ground="#12294a" data-dark="">
      <div className="v2s-wrap mb-vd-grid">
        <div className="mb-vd-head">
          <h2 id="verdicts-t" className="mb-h2">
            <span className="v2s-name v2s-name--priya">Priya</span> hears back right away.
          </h2>
          <p className="mb-lede">
            Cleared, needs a note, or blocked, and the rule that decided it. Pick one to see what she sees.
          </p>
          <Stop n={3} />
        </div>
        <VerdictBoard />
        <div className="mb-vd-fig">
          <Figure name="priya-snap" height={400} />
        </div>
      </div>
    </section>
  );
}

/* ---------- 4. Desk: the filter. Twenty charges on the wall, fifteen file themselves as it scrolls in,
   five reach Dana's queue beside the desk ---------- */
export function Desk() {
  return (
    <section id="desk" className="v2s-ch v2c v2c--dana mb-ch mb-dk" aria-labelledby="desk-t" data-ground="#ebe4f8">
      <div className="v2s-wrap mb-dk-grid">
        <div className="mb-dk-head">
          <h2 id="desk-t" className="mb-h2 mb-h2--xl">
            <span>Twenty charges.</span>{" "}
            <span>
              {EXCEPTIONS.length === 5 ? "Five" : EXCEPTIONS.length} reach <span className="v2s-name v2s-name--dana">Dana</span>.
            </span>
          </h2>
        </div>
        <DeskWall />
        <div className="mb-dk-side">
          <p className="mb-lede">
            The other fifteen file themselves. Each one Dana does see arrives with the rule it broke and Priya&rsquo;s
            note.
          </p>
          <div className="mb-dk-fig">
            <Figure name="dana-desk" height={280} />
          </div>
        </div>
        <div className="mb-dk-panel">
          <DeskQueue />
        </div>
      </div>
    </section>
  );
}

/* ---------- 5. Month end: the meeting. Centred on the deep green, the pair beside the report ---------- */
export function MonthEnd() {
  return (
    <section id="month-end" className="v2s-meet v2c v2c--meet mb-ch mb-me" aria-labelledby="month-end-t" data-ground="#0b5f44" data-dark="">
      <div className="v2s-wrap mb-me-grid">
        <div className="mb-me-head">
          <h2 id="month-end-t" className="mb-h2 mb-h2--xl">
            Month end is already done.
          </h2>
          <p className="mb-lede">
            Receipts matched, notes attached. Hand your accountant a PDF, a spreadsheet{QBO_LIVE ? ", or the entries in QuickBooks" : " or a GL journal"}.
          </p>
        </div>
        <div className="mb-me-fig">
          <Figure name="together" height={420} />
        </div>
        <div className="mb-me-panel">
          <MonthReport />
        </div>
        <p className="mb-me-air" aria-hidden="true">
          Expenses run on air.
        </p>
      </div>
    </section>
  );
}
