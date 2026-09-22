"use client";

import { useEffect, useState } from "react";
import { CHAPTERS, MONTH_DAYS, MONTH_OFFSET, day2 } from "./data";

const WEEK = ["M", "T", "W", "T", "F", "S", "S"];
const ENTRY_DAYS = new Set(CHAPTERS.map((c) => c.day));

/* The date column of the book. It is read from the scroll position: between two
   entries the day advances in proportion, so the month passes as the page does.
   Decorative (each chapter carries its own heading); hidden from assistive tech. */
export function DayRail() {
  const [pos, setPos] = useState({ day: 1, k: 0 });

  useEffect(() => {
    const els = CHAPTERS.map((c) => document.getElementById(c.id));
    let raf = 0;
    const read = () => {
      raf = 0;
      const line = window.innerHeight * 0.45;
      const tops = els.map((el) => (el ? el.getBoundingClientRect().top : Infinity));
      let k = 0;
      for (let i = 0; i < tops.length; i++) if (tops[i] <= line) k = i;
      let day = CHAPTERS[k].day;
      if (k < CHAPTERS.length - 1 && tops[k] <= line) {
        const span = tops[k + 1] - tops[k];
        const raw = span > 0 ? Math.min(1, Math.max(0, (line - tops[k]) / span)) : 0;
        /* Hold on the entry's own day while it is being read, then let the days run. */
        const p = Math.max(0, (raw - 0.55) / 0.45);
        day = Math.floor(CHAPTERS[k].day + (CHAPTERS[k + 1].day - CHAPTERS[k].day) * p);
      }
      setPos((prev) => (prev.day === day && prev.k === k ? prev : { day, k }));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    raf = requestAnimationFrame(read);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const { day, k } = pos;
  const title = CHAPTERS[k].title;
  const days = Array.from({ length: MONTH_DAYS }, (_, i) => i + 1);

  return (
    <aside className="lg-rail" aria-hidden="true">
      <div className="lg-rail__in">
        <div className="lg-rail__mon">Sep 2026</div>
        <div className="lg-rail__day">
          <span key={day} className="lg-rail__num">
            {day2(day)}
          </span>
        </div>
        <div className="lg-rail__title">{title}</div>
        <div className="lg-cal">
          {WEEK.map((w, i) => (
            <span key={`w${i}`} className="lg-cal__wk">
              {w}
            </span>
          ))}
          {Array.from({ length: MONTH_OFFSET }, (_, i) => (
            <span key={`b${i}`} />
          ))}
          {days.map((d) => (
            <span
              key={d}
              className={`lg-cal__d${d < day ? " is-past" : ""}${d === day ? " is-today" : ""}${ENTRY_DAYS.has(d) ? " is-entry" : ""}`}
            >
              {d}
            </span>
          ))}
        </div>
        <div className="lg-rail__folio">
          Entry {k + 1} of {CHAPTERS.length}
        </div>
      </div>

      <div className="lg-strip">
        <span className="lg-strip__date">
          Sep <b key={day}>{day2(day)}</b>
        </span>
        <span className="lg-strip__title">{title}</span>
        <span className="lg-strip__ticks">
          {days.map((d) => (
            <i key={d} className={d <= day ? "is-on" : undefined} />
          ))}
        </span>
      </div>
    </aside>
  );
}
