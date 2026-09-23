"use client";

import { useEffect, useRef, useState } from "react";
import { COUNTS, MARKS, QBO_LIVE, usd, word } from "./pile-data";
import { PileGraphic } from "./pile-graphic";

/*
 * The story: a sticky graphic and a sticky text panel, driven by empty spacers. The panel shows only the
 * active step's copy, so whatever frame a reader stops on, the text and the chart describe the same step.
 * Wide screens: the panel is the left column and the hero is step 0. Phones: the hero sits above the
 * graphic in the flow, and the panel sits under the graphic. The active step is the last spacer whose top
 * has crossed the reading line.
 */

const folio = MARKS.reduce((a, m) => (m.cur !== "USD" && m.printed > a.printed ? m : a));
const pairs = MARKS.filter((m) => m.dupOf !== null).map((m) => ({ m, first: MARKS[m.dupOf!] }));
const cab = pairs.find((p) => p.first.merchant !== p.m.merchant);
const twice = pairs.find((p) => p.first.merchant === p.m.merchant);
const cap = (s: string) => s.replace(/^./, (c) => c.toUpperCase());

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

function Dek() {
  return (
    <p className="pl-dek">
      This is the pile: one sample September at a company of seven. {COUNTS.charges} card charges from{" "}
      {word(COUNTS.people)} people in {word(COUNTS.currencies)} currencies, every one of them something a finance lead
      would otherwise open, match and check by hand.
    </p>
  );
}

function How() {
  return (
    <span className="pl-how">
      <span className="pl-how-hover">Each mark is one charge. Hover any mark to read it.</span>
      <span className="pl-how-tap">Each mark is one charge. Tap one to read it.</span>
    </span>
  );
}

const STEPS: React.ReactNode[] = [
  <>
    <div className="pl-copy0-wide">
      <h1>You review the exceptions, not the pile.</h1>
      <Dek />
      <p className="pl-dek pl-dek--go">Scroll, and Sylph sorts it.</p>
      <p className="pl-meta">
        <span className="pl-sample">Sample data</span>
        <How />
      </p>
    </div>
    <div className="pl-copy0-narrow">
      <h2>The month, piled up.</h2>
      <p>One slip for each card charge, in the order they posted. Scroll, and Sylph sorts it.</p>
      <p className="pl-meta">
        <How />
      </p>
    </div>
  </>,
  <>
    <h2>Receipts find their own charges.</h2>
    <p>
      People send them the way they already do. This month {COUNTS.text} were texted, {COUNTS.email} emailed and{" "}
      {COUNTS.upload} uploaded, and each one found its charge. Nobody matched anything.
    </p>
    <p>{COUNTS.noReceipt} charges never got a receipt. The rules decide whether that matters.</p>
  </>,
  <>
    <h2>One currency, at the rate on the receipt date.</h2>
    <p>
      {COUNTS.foreign} charges were printed in pounds, euros, yen or Canadian dollars. Taken at face value, a{" "}
      {folio.merchant.includes("Hotel") ? "hotel folio" : "folio"} of ¥{folio.printed.toLocaleString("en-US")} would
      dwarf everything else in the month.
    </p>
    <p>
      In dollars it is {usd(folio.usd)}, {folio.detail} in Tokyo, or {usd(folio.rowValue)} a night.
    </p>
  </>,
  <>
    <h2>Duplicates surface on their own.</h2>
    {cab && twice && (
      <p>
        {cab.m.name}&rsquo;s {cab.first.merchant} and a {cab.m.merchant} fare, both {usd(cab.m.usd)} on{" "}
        {`Sep ${cab.m.day}`}. {twice.m.name}&rsquo;s two {twice.m.merchant} charges, {usd(twice.m.usd)} each on{" "}
        {`Sep ${twice.m.day}`}. Same person, amount and day: each pair is flagged for a note, not refused.
      </p>
    )}
    <p>
      {cap(word(COUNTS.lookalikes))} look-alikes on other days pass: a return trip, two coffees weeks apart, two
      breakfasts in Toronto.
    </p>
  </>,
  <>
    <h2>Then every charge meets the rules.</h2>
    <p>
      Your policy, compiled into rules a person approved. Dinners are measured a head, hotels a night. Cross the line
      and the charge needs a note citing the rule, the threshold and the amount. Alcohol stays off the total.
    </p>
    <p>No model decides: the same charge gets the same verdict every time.</p>
    <Counts />
  </>,
  <>
    <h2>The cleared ones file themselves.</h2>
    <p>
      {COUNTS.cleared} charges, {usd(COUNTS.clearedTotal)}, are already in September&rsquo;s report with their
      receipts: an audit-grade PDF, an XLSX and a GL journal CSV{QBO_LIVE ? ", posted to QuickBooks Online" : ""}.
      Nobody opened them.
    </p>
    <p>What is left for a person is {COUNTS.exceptions} charges, each named, each with its rule.</p>
  </>,
];

export function PileStory() {
  const root = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const spacers = Array.from(el.querySelectorAll<HTMLElement>("[data-step]"));
    const panel = el.querySelector<HTMLElement>(".pl-panel");
    let raf = 0;
    const check = () => {
      raf = 0;
      const vh = window.innerHeight;
      /* the reading line: mid-screen on a wide screen, the middle of the text panel on a phone */
      let line = vh * 0.5;
      if (window.innerWidth < 900 && panel) {
        const top = parseFloat(getComputedStyle(panel).top) || vh * 0.6;
        line = top + (vh - top) * 0.5;
      }
      let s = 0;
      for (const sp of spacers) if (sp.getBoundingClientRect().top <= line) s = Number(sp.dataset.step);
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
      <header className="pl-hero" id="top">
        <h1>You review the exceptions, not the pile.</h1>
        <Dek />
        <p className="pl-meta">
          <span className="pl-sample">Sample data</span>
          <How />
        </p>
      </header>

      <PileGraphic step={step} />

      <div className="pl-rail">
        <div className="pl-panel-track">
          <div className="pl-panel">
            {STEPS.map((copy, i) => (
              <section key={i} className={`pl-copy${i === step ? " is-on" : ""}${i === 0 ? " pl-copy--0" : ""}`}>
                {copy}
              </section>
            ))}
          </div>
        </div>
        {STEPS.map((_, i) => (
          <div key={i} className={`pl-spacer pl-spacer--${i}`} data-step={i} aria-hidden="true" />
        ))}
      </div>
    </div>
  );
}
