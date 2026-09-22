"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { VERDICT_LABEL } from "@/components/custom/site/sample-data";
import { BOOK, CLEARED, EXCEPTIONS, day2 } from "./data";
import { Folio, Stamp } from "./bits";

const STEP = 95;

/* Twenty charges run through the rules when the chapter reaches the reader. Each
   entry is marked in date order; cleared ones file themselves and quiet down, the
   exceptions arrive in the queue with their rule, threshold and amount. Nothing
   reflows: the pile keeps its height, the queue has room for every exception. */
export function Sorter() {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      const id = requestAnimationFrame(() => setRun(true));
      return () => cancelAnimationFrame(id);
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setRun(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const replay = useCallback(() => {
    setRun(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setRun(true)));
  }, []);

  const order = new Map(BOOK.map((r, i) => [r, i]));

  return (
    <div ref={ref} className={`lg-sorter${run ? " is-run" : ""}`}>
      <Folio head="Entered, September" folio="Folio 17" className="lg-pile">
        <table className="lg-pile__t">
          <caption className="lg-sr">Twenty sample charges and how each was sorted</caption>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Merchant</th>
              <th scope="col" className="is-num">
                Amount
              </th>
              <th scope="col" className="is-mark">
                Sorted
              </th>
            </tr>
          </thead>
          <tbody>
            {BOOK.map((r, i) => (
              <tr key={r.merchant} className={`lg-pile__r is-${r.verdict}`} style={{ ["--t" as string]: `${i * STEP}ms` }}>
                <td className="is-date">{day2(r.day)}</td>
                <td className="is-name">{r.merchant}</td>
                <td className="is-num">{r.amount}</td>
                <td className="is-mark">
                  <span className="lg-pile__mark">{r.verdict === "ok" ? "Cleared" : "To you"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Folio>

      <div className="lg-queue">
        <div className="lg-queue__head">
          <span>
            To you: <b>{EXCEPTIONS.length}</b>
          </span>
          <span>
            Filed without you: <b>{CLEARED.length}</b>
          </span>
        </div>
        <ol className="lg-queue__list">
          {EXCEPTIONS.map((r) => {
            const t = (order.get(r) ?? 0) * STEP + 180;
            return (
              <li key={r.merchant} className={`lg-card is-${r.verdict}`} style={{ ["--t" as string]: `${t}ms` }}>
                <div className="lg-card__top">
                  <span className="lg-card__date">Sep {day2(r.day)}</span>
                  <span className="lg-card__name">{r.merchant}</span>
                  <span className="lg-card__amt">{r.amount}</span>
                </div>
                <div className="lg-card__cite">{r.cite}</div>
                <Stamp tone={r.verdict} rot={r.verdict === "block" ? -7 : -4} delay={t + 120} className="lg-card__stamp">
                  {VERDICT_LABEL[r.verdict]}
                </Stamp>
              </li>
            );
          })}
        </ol>
        <button type="button" className="lg-replay" onClick={replay}>
          Sort the month again
        </button>
      </div>
    </div>
  );
}
