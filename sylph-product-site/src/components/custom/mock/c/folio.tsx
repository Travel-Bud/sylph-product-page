"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Mark } from "@/components/custom/site/mark";
import { gsap, ScrollTrigger, useGSAP, MM_MOTION } from "@/components/custom/site/motion";
import { TRIP, money, type TripCharge } from "./data";
import { useAnswers, type Answers } from "./store";
import { Sample } from "./parts";

const onReport = (c: TripCharge, a: Answers) => c.v === "ok" || (c.v === "note" && a[c.id] === "approved");

function status(c: TripCharge, a: Answers) {
  if (c.v === "ok") return "Cleared";
  if (a[c.id] === "returned") return "Returned to Priya";
  if (c.v === "block") return "Blocked, kept off";
  return c.id === "sushi" ? "Approved, note attached" : "Approved by Dana";
}

const EXPORTS = [
  { k: "PDF", say: "Audit-grade statement, every line with its rule" },
  { k: "XLSX", say: "Line items with their rule references" },
  { k: "GL journal CSV", say: "Coded to the accounts you set once" },
  { k: "QuickBooks Online", say: "The journal, posted" },
];

/* 7. Month end, as a hotel folio on its own paper. The lines print one by one as the folio scrolls up,
   and the balance tots up with them, counting only what stays on the report. Dana's answers from the
   board above decide which lines count. The markup is the whole folio with its final balance. */
export function DepFolio() {
  const root = useRef<HTMLElement>(null);
  const answers = useAnswers();
  const shown = useRef(TRIP.length);
  const totalEl = useRef<HTMLElement>(null);
  const tally = useRef({ v: 0 });

  const sumTo = (n: number, a: Answers) => TRIP.slice(0, n).reduce((s, c) => s + (onReport(c, a) ? c.cents : 0), 0);
  const total = sumTo(TRIP.length, answers);
  const [firstTotal] = useState(total);
  const kept = TRIP.reduce((s, c) => s + (onReport(c, answers) ? 0 : c.cents), 0);

  const show = (cents: number, instant = false) => {
    const el = totalEl.current;
    if (!el) return;
    gsap.to(tally.current, {
      v: cents,
      duration: instant ? 0 : 0.5,
      ease: "power2.out",
      overwrite: true,
      onUpdate: () => {
        el.textContent = money(Math.round(tally.current.v));
      },
    });
  };

  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
    show(sumTo(shown.current, answers));
  }, [answers]);

  useGSAP(
    () => {
      const el = root.current!;
      tally.current.v = sumTo(TRIP.length, answersRef.current);
      const mm = gsap.matchMedia();
      mm.add(MM_MOTION, () => {
        const lines = Array.from(el.querySelectorAll<HTMLElement>(".fo-line"));
        const set = (n: number) => {
          if (n === shown.current) return;
          lines.forEach((l, i) => l.classList.toggle("is-in", i < n));
          shown.current = n;
          el.toggleAttribute("data-closed", n === lines.length);
          show(sumTo(n, answersRef.current));
        };
        el.dataset.live = "";
        lines.forEach((l) => l.classList.remove("is-in"));
        shown.current = -1;
        set(0);
        const st = ScrollTrigger.create({
          trigger: el.querySelector(".fo-table"),
          start: "top 80%",
          end: "bottom 50%",
          onUpdate: (s) => set(Math.min(lines.length, Math.floor(s.progress * (lines.length + 0.5)))),
          onLeave: () => set(lines.length),
        });
        return () => {
          st.kill();
          delete el.dataset.live;
          lines.forEach((l) => l.classList.add("is-in"));
          shown.current = TRIP.length;
          show(sumTo(TRIP.length, answersRef.current), true);
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const runs = TRIP.map((_, i) => sumTo(i + 1, answers));
  return (
    <section className="dep-folio" id="month-end" ref={root} aria-labelledby="folio-t">
      <div className="dep-wrap dep-folio-in">
        <div className="dep-folio-copy" data-rv>
          <p className="dep-kick dep-kick--ink">Sep 30, month end</p>
          <h2 id="folio-t" className="dep-h2">
            The month closes. The report is already there.
          </h2>
          <p className="dep-lede">
            Every charge matched, every exception answered, the journal coded for your accountant. Priya sent photos
            and one note. Dana answered three exceptions.
          </p>
          <Image className="dep-folio-img" src="/site/characters/together.webp" alt="" width={912} height={960} sizes="(max-width: 760px) 220px, 320px" />
        </div>
        <div className="fo">
          <div className="fo-head">
            <span className="fo-brand">
              <Mark className="fo-mark" />
              Sylph
            </span>
            <span className="fo-title">Expense report, folio</span>
            <Sample />
          </div>
          <dl className="fo-meta">
            <div>
              <dt>Guest</dt>
              <dd>Priya Natarajan</dd>
            </div>
            <div>
              <dt>Trip</dt>
              <dd>Denver site visit</dd>
            </div>
            <div>
              <dt>Stay</dt>
              <dd className="mono">Sep 11 to 13</dd>
            </div>
            <div>
              <dt>Report</dt>
              <dd>September 2026</dd>
            </div>
          </dl>
          <table className="fo-table">
            <caption className="sr-only">Priya&rsquo;s Denver trip on her September report, sample data</caption>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Description</th>
                <th scope="col" className="fo-num">
                  Charges
                </th>
                <th scope="col" className="fo-num">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody>
              {TRIP.map((c, i) => {
                const on = onReport(c, answers);
                return (
                  <tr key={c.id} className={`fo-line is-in${on ? "" : " is-off"}`} data-v={c.v}>
                    <td className="mono fo-date">{c.date}</td>
                    <td>
                      <span className="fo-m">{c.merchant}</span>
                      <span className="fo-cite">
                        <span className="mono">{c.rule}</span> {status(c, answers)}
                      </span>
                    </td>
                    <td className="mono fo-num">{on ? c.amount : `(${c.amount})`}</td>
                    <td className="mono fo-num fo-run">{money(runs[i]).slice(1)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="fo-foot">
            <div className="fo-total">
              <span>Balance on the report</span>
              <b className="mono" ref={totalEl}>
                {money(firstTotal)}
              </b>
            </div>
            <div className="fo-kept">
              <span>Kept off</span>
              <span className="mono">{money(kept)}</span>
            </div>
          </div>
          <ul className="fo-exports" aria-label="What the report files as">
            {EXPORTS.map((x) => (
              <li key={x.k}>
                <b>{x.k}</b>
                <span>{x.say}</span>
              </li>
            ))}
          </ul>
          <span className="fo-paid" aria-hidden="true">
            Closed
          </span>
        </div>
      </div>
    </section>
  );
}
