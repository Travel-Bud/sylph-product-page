"use client";

import { useEffect, useRef, useState } from "react";

/* Real-time piece 3. A receipt assembling itself from the fields the card
   network carries, one line at a time. Loops while on screen; the finished
   receipt is the base state (no-JS, reduced motion). */

const LINES = [
  { k: "merchant", t: "Kinokuniya Books, Shinjuku" },
  { k: "when", t: "Sep 12, 14:02 JST" },
  { k: "item", t: "Notebook A5 × 2", v: "¥1,200" },
  { k: "item", t: "Fineliner 0.4 × 1", v: "¥480" },
  { k: "tax", t: "Tax 10%", v: "¥168" },
  { k: "total", t: "Total", v: "¥1,848" },
  { k: "fx", t: "USD at the rate that day", v: "$12.44" },
];

const N = LINES.length;

export function ReceiptRebuild() {
  const root = useRef<HTMLDivElement>(null);
  const [n, setN] = useState(N);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = root.current;
    if (!el) return;
    let active = false;
    let timer = 0;
    let i = N;
    const step = () => {
      if (!active) return;
      if (i >= N) {
        i = 0;
        setN(0);
        timer = window.setTimeout(step, 900);
        return;
      }
      i += 1;
      setN(i);
      timer = window.setTimeout(step, i >= N ? 3600 : i <= 2 ? 700 : 520);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !active) {
          active = true;
          timer = window.setTimeout(step, 1800);
        } else if (!e.isIntersecting && active) {
          active = false;
          window.clearTimeout(timer);
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      active = false;
      window.clearTimeout(timer);
      io.disconnect();
    };
  }, []);

  return (
    <div className="rb" ref={root} aria-label="A receipt rebuilt from network line items (in build)">
      <div className="rb-fields mono" aria-hidden="true">
        <span className={n >= 1 ? "is-on" : ""}>merchant</span>
        <span className={n >= 2 ? "is-on" : ""}>time</span>
        <span className={n >= 3 ? "is-on" : ""}>line items</span>
        <span className={n >= 5 ? "is-on" : ""}>tax</span>
        <span className={n >= 6 ? "is-on" : ""}>total</span>
        <span className={n >= 7 ? "is-on" : ""}>fx</span>
      </div>
      <div className="rb-paper">
        {LINES.map((l, idx) => (
          <div key={idx} className={`rb-line rb-${l.k}${idx < n ? " is-on" : ""}`}>
            <span>{l.t}</span>
            {l.v && <span className="num">{l.v}</span>}
          </div>
        ))}
        <div className={`rb-stamp${n >= N ? " is-on" : ""}`}>Rebuilt, no photo</div>
      </div>
    </div>
  );
}
