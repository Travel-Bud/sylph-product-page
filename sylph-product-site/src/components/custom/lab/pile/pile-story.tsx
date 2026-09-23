"use client";

import { useEffect, useRef, useState } from "react";
import { COUNTS, MARKS, QBO_LIVE, usd, word } from "./pile-data";
import { PileGraphic } from "./pile-graphic";

/*
 * The story: the hero, the sticky graphic and five steps. The active step is the last one whose top
 * has crossed the trigger line (60% down on a wide screen, near the bottom edge on a phone, where the
 * text scrolls in beneath the graphic).
 */

const folio = MARKS.reduce((a, m) => (m.cur !== "USD" && m.printed > a.printed ? m : a));
const pairs = MARKS.filter((m) => m.dupOf !== null).map((m) => ({ m, first: MARKS[m.dupOf!] }));
const cab = pairs.find((p) => p.first.merchant !== p.m.merchant);
const twice = pairs.find((p) => p.first.merchant === p.m.merchant);

function Counts() {
  return (
    <p className="pl-counts">
      <span className="pl-count pl-count--ok">
        <b>{COUNTS.cleared}</b> cleared
      </span>
      <span className="pl-count pl-count--note">
        <b>{COUNTS.note}</b> need a note
      </span>
      <span className="pl-count pl-count--block">
        <b>{COUNTS.block}</b> blocked
      </span>
    </p>
  );
}

export function PileStory() {
  const root = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const steps = Array.from(el.querySelectorAll<HTMLElement>("[data-step]"));
    let raf = 0;
    const check = () => {
      raf = 0;
      const vh = window.innerHeight;
      const line = vh * (window.innerWidth < 900 ? 0.84 : 0.6);
      let s = 0;
      for (const st of steps) if (st.getBoundingClientRect().top < line) s = Number(st.dataset.step);
      setStep(s);
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, []);

  return (
    <div className="pl-story" ref={root}>
      <header className="pl-hero" data-step="0" id="top">
        <h1>You review the exceptions, not the pile.</h1>
        <p className="pl-dek">
          This is the pile: one sample September at a company of seven. {COUNTS.charges} card charges from{" "}
          {word(COUNTS.people)} people in {word(COUNTS.currencies)} currencies, every one of them something a finance
          lead would otherwise open, match and check by hand.
        </p>
        <p className="pl-dek pl-dek--go">Scroll, and Sylph sorts it.</p>
        <p className="pl-meta">
          <span className="pl-sample">Sample data</span>
          <span className="pl-how">
            <span className="pl-how-hover">Each mark is one charge. Hover any mark to read it.</span>
            <span className="pl-how-tap">Each mark is one charge. Tap one to read it.</span>
          </span>
        </p>
      </header>

      <PileGraphic step={step} />

      <div className="pl-steps">
        <section className="pl-step" data-step="1" aria-labelledby="pl-s1">
          <h2 id="pl-s1">Receipts find their own charges.</h2>
          <p>
            People send them the way they already do. This month {COUNTS.text} were texted, {COUNTS.email} emailed
            and {COUNTS.upload} uploaded, and each one found its charge. Nobody matched anything.
          </p>
          <p>
            {COUNTS.noReceipt} charges never got a receipt. The rules decide whether that matters.
          </p>
        </section>

        <section className="pl-step" data-step="2" aria-labelledby="pl-s2">
          <h2 id="pl-s2">One currency, at the rate on the receipt date.</h2>
          <p>
            {COUNTS.foreign} charges were printed in pounds, euros, yen or Canadian dollars. Taken at face value, a{" "}
            {folio.merchant.includes("Hotel") ? "hotel folio" : "folio"} of ¥{folio.printed.toLocaleString("en-US")} would
            dwarf everything else in the month.
          </p>
          <p>
            In dollars it is {usd(folio.usd)}, {folio.detail} in Tokyo, or {usd(folio.rowValue)} a night.
          </p>
        </section>

        <section className="pl-step" data-step="3" aria-labelledby="pl-s3">
          <h2 id="pl-s3">Duplicates surface on their own.</h2>
          {cab && twice && (
            <p>
              {cab.m.name}&rsquo;s {cab.first.merchant} and a {cab.m.merchant} fare, both {usd(cab.m.usd)} on{" "}
              {`Sep ${cab.m.day}`}. {twice.m.name}&rsquo;s two {twice.m.merchant} charges, {usd(twice.m.usd)} each on{" "}
              {`Sep ${twice.m.day}`}. Same person, same amount, same day: each pair is flagged for a note, not refused.
            </p>
          )}
          <p>
            {word(COUNTS.lookalikes).replace(/^./, (c) => c.toUpperCase())} look-alikes on different days pass: a
            return trip, two coffees weeks apart, two breakfasts in Toronto.
          </p>
        </section>

        <section className="pl-step" data-step="4" aria-labelledby="pl-s4">
          <h2 id="pl-s4">Then every charge meets the rules.</h2>
          <p>
            Your policy, compiled into rules a person approved. A dinner is measured a head and a hotel a night,
            against the line the policy draws. Cross it and the charge needs a note that cites the rule, the
            threshold and the amount. Alcohol is kept off the reimbursable total.
          </p>
          <p>No model decides. The same charge gets the same verdict every time.</p>
          <Counts />
        </section>

        <section className="pl-step pl-step--last" data-step="5" aria-labelledby="pl-s5">
          <h2 id="pl-s5">The cleared ones file themselves.</h2>
          <p>
            {COUNTS.cleared} charges, {usd(COUNTS.clearedTotal)} with their receipts, are already in September&rsquo;s
            report: an audit-grade PDF, an XLSX and a GL journal CSV{QBO_LIVE ? ", posted to QuickBooks Online" : ""}.
            Nobody opened them.
          </p>
          <p>
            What is left for a person is {COUNTS.exceptions} charges, each named, each with its rule.
          </p>
        </section>
      </div>
    </div>
  );
}
