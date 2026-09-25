"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FlapRow } from "./flap";
import { Flaps } from "./parts";
import { BoardHead } from "./board";
import { TRIP, NOTE, VERDICT, REMARK, boardRow, type TripCharge } from "./data";
import { answer, useAnswers, type Answer, type Answers } from "./store";

const REM_ANSWER: Record<Answer, string> = { approved: "APPROVED", returned: "RETURNED" };
const remarkFor = (c: TripCharge, a: Answers) => (c.v === "ok" ? "FILED" : REM_ANSWER[a[c.id]]);
const joined = (c: TripCharge, remark: string) => {
  const r = boardRow(c, remark);
  return r.date + r.merchant + r.amount + r.rule + r.remark;
};

/* 6. Dana's queue, as an arrivals board on Dana's violet. When the board comes into view the trip's charges
   arrive with the verdicts they got on the road; everything Cleared flips to FILED and dims, the three
   exceptions flip to AWAITING, and Dana's answers land one by one. Approve and Return are live: the row
   flips to the new answer and the folio below follows. */
export function DepArrivals() {
  const ref = useRef<HTMLDivElement>(null);
  const rows = useRef<Map<string, FlapRow>>(new Map());
  const played = useRef(false);
  const answers = useAnswers();
  const latest = useRef(answers);

  const [first] = useState(answers);

  useEffect(() => {
    latest.current = answers;
    if (!played.current) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    TRIP.forEach((c) => {
      const row = rows.current.get(c.id);
      if (c.v === "ok" || !row) return;
      if (still) row.jump(joined(c, remarkFor(c, answers)));
      else row.to(joined(c, remarkFor(c, answers)), (k) => k * 16);
    });
  }, [answers]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const map = rows.current;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.querySelectorAll<HTMLElement>("li.arow").forEach((li) => {
      const id = li.dataset.id!;
      const c = TRIP.find((t) => t.id === id)!;
      const row = new FlapRow(li.querySelector(".brow")!, 50);
      if (!still) row.jump(joined(c, REMARK[c.v]));
      map.set(id, row);
    });
    if (still) {
      played.current = true;
      return () => map.clear();
    }
    el.dataset.stage = "arrive";
    const timers: number[] = [];
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        el.dataset.stage = "sort";
        TRIP.forEach((c, i) => {
          const row = map.get(c.id)!;
          row.to(joined(c, c.v === "ok" ? "FILED" : "AWAITING"), (k) => 200 + i * 110 + k * 14);
        });
        let d = 2600;
        TRIP.filter((c) => c.v !== "ok").forEach((c) => {
          timers.push(
            window.setTimeout(() => {
              map.get(c.id)!.to(joined(c, remarkFor(c, latest.current)), (k) => k * 16);
              el.querySelector(`li.arow[data-id="${c.id}"]`)?.classList.add("is-answered");
            }, d),
          );
          d += 900;
        });
        timers.push(
          window.setTimeout(() => {
            played.current = true;
            el.dataset.stage = "done";
          }, d),
        );
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
      map.forEach((r) => r.destroy());
      map.clear();
    };
  }, []);

  return (
    <section className="dep-arr" id="queue" aria-labelledby="arr-t">
      <div className="dep-wrap dep-arr-in">
        <div className="dep-arr-copy" data-rv>
          <p className="dep-kick dep-kick--lilac">Back at the office</p>
          <h2 id="arr-t" className="dep-h2">
            Eight charges on the trip. Three reach Dana.
          </h2>
          <p className="dep-lede">
            Everything in policy files itself. What reaches Dana carries its rule, threshold and amount, and the note
            the traveller already wrote. No model sits in the decision: the same charge gets the same answer, every
            time.
          </p>
          <Image className="dep-arr-dana" src="/site/characters/dana-desk.webp" alt="" width={938} height={931} sizes="(max-width: 760px) 200px, 300px" />
        </div>
        <div className="board board--arr" ref={ref} data-stage="done">
          <BoardHead title="Arrivals" sub="Dana's queue, Denver site visit" />
          <ul className="board-rows" aria-label="Charges from the trip and Dana's answers, sample data">
            {TRIP.map((c) => {
              const r = boardRow(c, remarkFor(c, first));
              const a = answers[c.id];
              return (
                <li key={c.id} className={`arow${c.v === "ok" ? " is-filed" : " is-ex is-answered"}`} data-id={c.id} data-v={c.v} data-a={a}>
                  <div className="brow" data-v={c.v}>
                    <span className="bc bc-date">
                      <Flaps text={r.date} />
                    </span>
                    <span className="bc bc-m">
                      <Flaps text={r.merchant} />
                    </span>
                    <span className="bc bc-amt">
                      <Flaps text={r.amount} />
                    </span>
                    <span className="bc bc-rule">
                      <Flaps text={r.rule} />
                    </span>
                    <span className="bc bc-rem">
                      <i className="lamp" aria-hidden="true" />
                      <Flaps text={r.remark} />
                    </span>
                  </div>
                  {c.v === "ok" ? (
                    <span className="sr-only">
                      {c.date}, {c.merchant}, ${c.amount}, {c.rule}, cleared and filed
                    </span>
                  ) : (
                    <div className="arow-ex">
                      <p className="arow-why">
                        <span className="sr-only">
                          {c.date}, {c.merchant}, ${c.amount}, {VERDICT[c.v]}, Dana {a}:{" "}
                        </span>
                        <span className="mono">{c.rule}</span>, {c.why}
                        {c.id === "sushi" && <span className="arow-note">Priya: &ldquo;{NOTE}&rdquo;</span>}
                      </p>
                      <div className="arow-act" role="group" aria-label={`Dana's answer on ${c.merchant}`}>
                        <button type="button" className="arow-b" aria-pressed={a === "approved"} onClick={() => answer(c.id, "approved")}>
                          Approve
                        </button>
                        <button type="button" className="arow-b" aria-pressed={a === "returned"} onClick={() => answer(c.id, "returned")}>
                          Return
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
