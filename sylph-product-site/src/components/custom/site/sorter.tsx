"use client";

import { useEffect, useRef, useState } from "react";
import { ENGINE_ROWS } from "./sample-data";

/**
 * The pile against the exceptions, shown at scale. The twenty sample charges run through the same
 * rules once the board is in view: cleared rows file onto the report, exceptions land in the queue
 * with their citation. Counts are counts of the rows shown. The sorted state is the CSS default, so
 * no-JS and reduced motion get the finished board; `is-armed` holds the rows back until the board is
 * in view and `is-run` plays the sort.
 */
const FILED = ENGINE_ROWS.filter((r) => r.verdict === "ok");
const QUEUE = ENGINE_ROWS.filter((r) => r.verdict !== "ok");
const WORDS: Record<number, string> = { 3: "Three", 4: "Four", 5: "Five", 6: "Six", 20: "Twenty" };
const order = new Map(ENGINE_ROWS.map((r, i) => [r, i]));

export function Sorter() {
  const board = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(0);

  useEffect(() => {
    const el = board.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Armed on mount, while the board is still far below the fold: rows wait hidden until it scrolls in.
    // Set on the node, not in state: the next render is the run, which remounts the board anyway.
    el.classList.add("is-armed");
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setRun(1);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The board is keyed on the run, so a replay remounts it and the CSS sort plays from the first row.
  const replay = () => setRun((n) => n + 1);

  return (
    <section id="sorter" className="sec sorter" aria-labelledby="sorter-title">
      <div className="wrap">
        <div className="sec-head rv">
          <h2 id="sorter-title" className="h2">
            {WORDS[ENGINE_ROWS.length] ?? ENGINE_ROWS.length} charges. {WORDS[QUEUE.length] ?? QUEUE.length} reach you.
          </h2>
          <p className="lede">
            A sample week of card charges runs through one set of rules. Everything in policy files itself onto
            the report. Only the exceptions come to you, each with the rule that caught it.
          </p>
        </div>

        <div ref={board} key={run} className={`sort-board${run ? " is-run" : ""}`}>
          <div className="win sort-col sort-filed" role="group" aria-label="Filed onto the report">
            <div className="win-bar">
              <span>Filed onto the report</span>
              <span className="sample">Sample data</span>
            </div>
            <ul className="sort-filed-list">
              {FILED.map((r) => (
                <li key={r.merchant} className="sort-f" style={{ "--o": order.get(r) } as React.CSSProperties}>
                  <i className="dot" aria-hidden="true" />
                  <span className="sort-m">{r.merchant}</span>
                  <span className="num sort-a">{r.amount}</span>
                </li>
              ))}
            </ul>
            <p className="sort-sum mono">
              {FILED.length} cleared, receipts matched, coded
            </p>
          </div>

          <div className="win sort-col sort-queue" role="group" aria-label="Your queue">
            <div className="win-bar">
              <span>Your queue</span>
              <span className="sample">Sample data</span>
            </div>
            <ul className="sort-queue-list">
              {QUEUE.map((r) => (
                <li key={r.merchant} className={`sort-q sort-q-${r.verdict}`} style={{ "--o": order.get(r) } as React.CSSProperties}>
                  <div className="sort-q-top">
                    <span className="sort-m">{r.merchant}</span>
                    <span className="num sort-a">{r.amount}</span>
                    <span className={`chip chip-${r.verdict === "block" ? "block" : "warn"}`}>
                      {r.verdict === "block" ? "Blocked" : "Needs a note"}
                    </span>
                  </div>
                  <span className="mono sort-cite">{r.cite}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="sort-foot rv">
          <button type="button" className="btn btn-secondary" onClick={replay}>
            Run the week again
          </button>
          <span className="mono sort-note">Same charges, same rules, same answer.</span>
        </div>
      </div>
    </section>
  );
}
