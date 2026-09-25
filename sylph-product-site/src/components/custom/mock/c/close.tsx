"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Mark } from "@/components/custom/site/mark";
import { APP_LOGIN, DEMO, PRICING } from "@/components/custom/site/anchors";
import { FlapRow } from "./flap";
import { Flaps, Picto } from "./parts";

/* Pricing as the last board: Small business, per active employee a month (pricing page, 2026-09-22). */
const FARES = [
  { k: "EXPENSE", p: "$25", r: "PER PERSON" },
  { k: "FLIGHTS", p: "$25", r: "NO MARKUP" },
  { k: "BOTH", p: "$40", r: "NOW BOARDING" },
];
const line = (f: (typeof FARES)[number]) => f.k.padEnd(8) + f.p.padStart(4) + " " + f.r.padEnd(12);

const QA = [
  {
    q: "Do we have to switch cards or banks?",
    a: "No. Sylph works on the cards and banks your company already uses. There is no new card to issue and nothing for travellers to carry.",
  },
  {
    q: "Is AI deciding what gets approved?",
    a: "No. AI reads your policy once and drafts the rules; a person approves every one. The check itself is deterministic: no model in the decision, so the same charge gets the same answer every time.",
  },
  {
    q: "We do not have a written policy.",
    a: "Answer a dozen questions and Sylph writes one. You read it and approve it rule by rule, the same as a policy you brought.",
  },
  {
    q: "What does our accountant get at month end?",
    a: "An audit-grade PDF, an XLSX and a GL journal CSV, with every verdict citing its rule, and posting to QuickBooks Online.",
  },
  {
    q: "What happens to a Blocked charge?",
    a: "It stays off the reimbursable total, with the rule, threshold and amount cited. The card is never declined, and the traveller sees the reason when it is checked.",
  },
  {
    q: "How long does setup take?",
    a: "Same day. Connect the cards and banks you already have, bring a policy or answer the questions, approve the rules.",
  },
];

function FareBoard() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rows = Array.from(el.querySelectorAll<HTMLElement>(".frow")).map((r) => new FlapRow(r, 42));
    rows.forEach((r) => r.jump(" ".repeat(25)));
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        rows.forEach((r, i) => r.to(line(FARES[i]), (k) => 150 + i * 220 + k * 20));
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      rows.forEach((r) => r.destroy());
    };
  }, []);
  return (
    <div className="board board--fare" ref={ref}>
      <div className="board-top">
        <span className="board-title">
          <Picto name="plane" />
          Fares
        </span>
        <span className="board-sub">Small business, per person a month</span>
      </div>
      <ul className="board-rows">
        {FARES.map((f) => (
          <li key={f.k} className="frow" data-k={f.k}>
            <Flaps text={line(f)} />
            <span className="sr-only">
              {f.k.toLowerCase()}: {f.p} per active employee a month
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* 8. Boarding: the close goes back to the signage black it started on, with pricing as a fares board,
   the questions finance asks first as an information desk, and the footer. */
export function DepClose() {
  return (
    <>
      <section className="dep-close" id="boarding" aria-labelledby="close-t">
        <div className="dep-wrap dep-close-in">
          <div className="dep-close-copy" data-rv>
            <p className="dep-kick">Now boarding</p>
            <h2 id="close-t" className="dep-h2 dep-h2--xl">
              Your team&rsquo;s next trip, on one itinerary.
            </h2>
            <p className="dep-lede">
              Expense and Flights priced separately, and together for less. Mid-size teams, 101 to 1,000 people: $35
              each, $60 together. Booking carries no markup on any plan.
            </p>
            <div className="dep-cta">
              <a href={DEMO} className="dep-btn dep-btn--sign dep-btn--lg">
                Book a demo
              </a>
              <Link href={PRICING} className="dep-follow">
                See pricing
              </Link>
            </div>
          </div>
          <FareBoard />
        </div>
        <div className="dep-wrap dep-desk">
          <div className="dep-desk-head" data-rv>
            <span className="dep-desk-i" aria-hidden="true">
              i
            </span>
            <h2 className="dep-h3">What finance asks first.</h2>
            <p>Policies and receipts are encrypted in transit and at rest, and never used to train models.</p>
          </div>
          <div className="dep-qa-list">
            {QA.map((x) => (
              <details key={x.q} className="dep-qa">
                <summary>
                  <span>{x.q}</span>
                  <span className="dep-qa-plus" aria-hidden="true" />
                </summary>
                <p>{x.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <footer className="dep-foot">
        <div className="dep-wrap dep-foot-in">
          <span className="dep-brand">
            <Mark className="dep-mark" />
            <span>Sylph</span>
          </span>
          <p className="dep-foot-note">
            Expenses run on air. Priya, Dana, the Denver trip and every charge on this page are sample data.
          </p>
          <nav className="dep-foot-links" aria-label="Footer">
            <Link href={PRICING}>Pricing</Link>
            <a href="/privacy">Privacy</a>
            <Link href="/terms">Terms</Link>
            <a href={APP_LOGIN}>Log in</a>
          </nav>
        </div>
      </footer>
    </>
  );
}
