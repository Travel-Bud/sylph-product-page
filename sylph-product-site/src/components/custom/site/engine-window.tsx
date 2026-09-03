"use client";

import { useEffect, useRef, useState } from "react";
import { CATEGORY_KEY, ENGINE_ROWS, VERDICT_LABEL } from "./sample-data";

const N = ENGINE_ROWS.length;
const VISIBLE = 9;

interface Item {
  id: number;
  idx: number;
  done: boolean;
  fresh: boolean;
}

const INITIAL: Item[] = ENGINE_ROWS.slice(0, VISIBLE).map((_, i) => ({ id: i, idx: i, done: true, fresh: false }));
const INITIAL_EXC = INITIAL.filter((it) => ENGINE_ROWS[it.idx].verdict !== "ok").length;

/**
 * The hero's real-time piece: a sample ruleset checking charges as they
 * arrive. First paint is a full, finished table (the truth; also what no-JS
 * and reduced motion get). On screen, the window becomes a rolling ticker:
 * a new charge lands at the bottom in the "checking" state, its verdict
 * resolves a beat later with one colour sweep (the app's "cleared moment"),
 * and the oldest row slides off the top. Every row is the same height, so
 * the window never reflows; the loop pauses off screen.
 */
export function EngineWindow() {
  const root = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<Item[]>(INITIAL);
  const [count, setCount] = useState(VISIBLE);
  const [exceptions, setExceptions] = useState(INITIAL_EXC);
  const [shift, setShift] = useState(false);
  const [snap, setSnap] = useState(false);
  const [live, setLive] = useState(false);
  const nextIdx = useRef(VISIBLE);
  const nextId = useRef(VISIBLE);

  useEffect(() => {
    if (!snap) return;
    const raf = requestAnimationFrame(() => setSnap(false));
    return () => cancelAnimationFrame(raf);
  }, [snap]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = root.current;
    if (!el) return;

    let active = false;
    let timer = 0;

    const add = () => {
      if (!active) return;
      const idx = nextIdx.current % N;
      nextIdx.current += 1;
      setItems((list) => [...list, { id: nextId.current++, idx, done: false, fresh: true }]);
      timer = window.setTimeout(resolve, 560);
    };
    const resolve = () => {
      if (!active) return;
      const row = ENGINE_ROWS[(nextIdx.current - 1) % N];
      setItems((list) => list.map((it, i) => (i === list.length - 1 ? { ...it, done: true } : it)));
      setCount((c) => c + 1);
      if (row.verdict !== "ok") setExceptions((e) => e + 1);
      timer = window.setTimeout(shiftUp, row.verdict === "ok" ? 900 : 1700);
    };
    const shiftUp = () => {
      if (!active) return;
      setShift(true);
      timer = window.setTimeout(drop, 500);
    };
    const drop = () => {
      if (!active) return;
      setShift(false);
      setSnap(true);
      setItems((list) => list.slice(1));
      timer = window.setTimeout(add, 260);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !active) {
          active = true;
          setLive(true);
          timer = window.setTimeout(add, 1400);
        } else if (!entry.isIntersecting && active) {
          active = false;
          window.clearTimeout(timer);
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => {
      active = false;
      window.clearTimeout(timer);
      io.disconnect();
    };
  }, []);

  return (
    <div className={`win eng${live ? " is-live" : ""}`} ref={root} aria-label="Sample enforcement window">
      <div className="win-bar">
        <span>Enforcement</span>
        <span className="sample">Sample data</span>
      </div>
      <div className="eng-head" aria-hidden="true">
        <span>Merchant</span>
        <span className="ta-r">Amount</span>
        <span>Category</span>
        <span>Verdict</span>
      </div>
      <div className="eng-rows">
        <ol className={`eng-track${shift ? " is-shift" : ""}${snap ? " is-snap" : ""}`}>
          {items.map((it) => {
            const r = ENGINE_ROWS[it.idx];
            return (
              <li
                key={it.id}
                className={`eng-row${it.fresh ? " is-fresh" : ""}${it.done && live && it.fresh ? ` did-${r.verdict}` : ""}`}
              >
                <div className="eng-main">
                  <span className="eng-merchant">{r.merchant}</span>
                  <span className="eng-amount num ta-r">{r.amount}</span>
                  <span className={`cat cat-${CATEGORY_KEY[r.category]}`}>{r.category}</span>
                  <span className={`verdict verdict-${it.done ? r.verdict : "wait"}`}>
                    <i className="dot" aria-hidden="true" />
                    {it.done ? VERDICT_LABEL[r.verdict] : "Checking"}
                  </span>
                </div>
                <div className={`eng-cite${it.done ? "" : " is-pending"}`}>{r.cite}</div>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="eng-foot">
        <span className="num">
          {count} checked since you arrived, {exceptions} {exceptions === 1 ? "exception" : "exceptions"}
        </span>
        <span className="eng-foot-note">Cleared lines file themselves</span>
      </div>
    </div>
  );
}
