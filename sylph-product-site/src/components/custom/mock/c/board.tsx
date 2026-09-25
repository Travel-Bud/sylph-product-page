"use client";

import { useEffect, useRef } from "react";
import { FlapRow } from "./flap";
import { Flaps, Picto } from "./parts";
import { TRIP, VERDICT, boardRow, pad, COLS, REMARK, type TripCharge } from "./data";

const joined = (c: TripCharge, remark?: string) => {
  const r = boardRow(c, remark);
  return r.date + r.merchant + r.amount + r.rule + r.remark;
};

export function BoardRow({ c, remark }: { c: TripCharge; remark?: string }) {
  const r = boardRow(c, remark);
  return (
    <li className="brow" data-v={c.v} data-id={c.id}>
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
      <span className="sr-only">
        {c.date}, {c.merchant}, ${c.amount}, rule {c.rule}, {VERDICT[c.v]}
      </span>
    </li>
  );
}

export function BoardHead({ title, sub }: { title: string; sub: string }) {
  return (
    <>
      <div className="board-top">
        <span className="board-title">
          <Picto name="plane" />
          {title}
        </span>
        <span className="board-sub">{sub}</span>
        <span className="dep-sample is-dark">Sample data</span>
      </div>
      <div className="brow brow--head" aria-hidden="true">
        <span className="bc bc-date">Date</span>
        <span className="bc bc-m">Charge</span>
        <span className="bc bc-amt">Amount</span>
        <span className="bc bc-rule">Rule</span>
        <span className="bc bc-rem">Remarks</span>
      </div>
    </>
  );
}

/* The hero's departures board: the Denver trip's eight charges, each with its rule and verdict. On load
   every cell drums from blank to its text, row after row; after that, one row at a time goes back to
   CHECKING and lands on its verdict again, while the board is on screen. */
export function DepartureBoard() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el?.classList.add("is-live");
      return;
    }
    const rows = Array.from(el.querySelectorAll<HTMLElement>("li.brow")).map((li) => new FlapRow(li, 60));
    const blank = " ".repeat(COLS.date + COLS.merchant + COLS.amount + COLS.rule + COLS.remark);
    rows.forEach((r) => r.jump(blank));
    el.classList.add("is-live");
    rows.forEach((r, i) => r.to(joined(TRIP[i]), (k) => 180 + i * 140 + (k % 7) * 18));

    let timer = 0;
    let n = 0;
    let visible = true;
    const cycle = () => {
      if (visible && !document.hidden) {
        const i = [3, 0, 6, 2, 5, 1, 7, 4][n++ % 8];
        const row = rows[i];
        const c = TRIP[i];
        const lamp = el.querySelectorAll<HTMLElement>("li.brow")[i];
        lamp.dataset.checking = "1";
        row.to(joined(c, pad("CHECKING", COLS.remark)));
        row.onSettle = () => {
          row.onSettle = undefined;
          window.setTimeout(() => {
            row.to(joined(c, REMARK[c.v]));
            row.onSettle = () => {
              row.onSettle = undefined;
              delete lamp.dataset.checking;
            };
          }, 650);
        };
      }
      timer = window.setTimeout(cycle, 4200);
    };
    timer = window.setTimeout(cycle, 5200);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    return () => {
      window.clearTimeout(timer);
      io.disconnect();
      rows.forEach((r) => r.destroy());
    };
  }, []);

  return (
    <div className="board board--dep" ref={ref}>
      <BoardHead title="Departures" sub="Denver site visit, Sep 11 to 13" />
      <ul className="board-rows" aria-label="Charges on the Denver trip, sample data">
        {TRIP.map((c) => (
          <BoardRow key={c.id} c={c} />
        ))}
      </ul>
    </div>
  );
}
