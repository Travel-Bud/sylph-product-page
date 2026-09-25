"use client";

import { useState } from "react";
import { DANA, EXCEPTIONS, PRIYA } from "@/components/custom/v2-sides/data";
import { Figure, Person, Token } from "@/components/custom/v2-sides/parts";
import { play } from "@/components/custom/v2-sides/sound";
import { ANSWERS, AnswerDetail, Card, DeskQueue, MonthReport, PolicyCompile, ReceiptPaths, StepLine, StopPulse, tabKeys } from "./panels";
import { DeskWall } from "./wall";

/* Mock B's five chapters: the live story, copy and panels (panels.tsx is the live code), each given its
   own composition and ground. Priya's chapters sit on her coat blue (the answer on its deep ink), Dana's
   on the sweater lilac, month end on the deep green where they meet. */

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
          <Person side="priya" {...PRIYA} size={40} />
          <h2 id="receipts-t" className="mb-h2">
            <span className="v2s-name v2s-name--priya">Priya&rsquo;s</span> part is a&nbsp;photo.
          </h2>
        </div>
        <div className="mb-rc-lede">
          <p className="mb-lede">
            Text it, forward the email, or drop it in. Each receipt finds its own charge on the cards and banks your
            company already has. Nothing to switch, no report to build.
          </p>
          <Token step={1} state="Photo in, matched to the charge" />
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
        <Person side="dana" {...DANA} size={40} />
        <h2 id="policy-t" className="mb-h2">
          <span className="v2s-name v2s-name--dana">Dana&rsquo;s</span> part is written once.
        </h2>
        <p className="mb-lede">
          Hand Sylph the policy you already have, or answer a dozen questions and Sylph writes one. Every sentence
          compiles to rules that quote it, and nothing checks a charge until Dana approves the set.
        </p>
      </div>
      <div className="mb-po-track" data-pin-track>
        <div className="mb-po-pin">
          <div className="v2s-wrap mb-po-stage">
            <div className="mb-po-panel">
              <PolicyCompile />
              <Token step={2} state="Rule M-041 is already waiting for it" />
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
          <Person side="priya" {...PRIYA} size={40} />
          <h2 id="verdicts-t" className="mb-h2">
            Every answer <span className="v2s-name v2s-name--priya">Priya</span> gets names its rule.
          </h2>
          <p className="mb-lede">
            Each charge is checked as it happens, with the rule, the threshold and the amount. Blocked keeps a charge
            off the reimbursable total. It never declines the card.
          </p>
          <Token step={3} state="Needs a note, and she has already written it" />
        </div>
        <VerdictBoard />
        <div className="mb-vd-fig">
          <Figure name="priya-snap" height={400} />
        </div>
        <p className="mb-vd-next">
          <span className="v2c-next-tag">In build, not yet available</span> The same rule answering at the card terminal,
          Visa cards first.
        </p>
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
          <Person side="dana" {...DANA} size={40} />
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
            Everything in policy files itself. What reaches Dana carries its rule, threshold and amount, and the note
            the traveller already wrote. No model sits in the decision: the same charge gets the same answer, every
            time.
          </p>
          <StepLine step={4} state="In Dana's queue, with Priya's note. Her approval files it." />
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
          <p className="mb-me-kicker mono">Both sides, September 30</p>
          <h2 id="month-end-t" className="mb-h2 mb-h2--xl">
            They meet at month end. The report is already there.
          </h2>
          <p className="mb-lede">
            Every charge matched, every exception answered, the journal coded for your accountant. Priya sent photos and
            one note. Dana answered five exceptions.
          </p>
        </div>
        <div className="mb-me-fig">
          <Figure name="together" height={420} />
        </div>
        <div className="mb-me-panel">
          <MonthReport />
          <StepLine step={5} state="Filed on line 3 of Priya's September report, closed" />
        </div>
        <p className="mb-me-air" aria-hidden="true">
          Expenses run on air.
        </p>
      </div>
    </section>
  );
}
