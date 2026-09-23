"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AFTER, BY_KEY, DEMO_KEY, GATES, HAND, VERDICT_LABEL, WEEK, type Verdict } from "./data";
import { DropMachine, INITIAL_VIEW, type View } from "./machine";

/* The stage: Priya's hand on one side, the board on the other, and one layer above both where the
   charges fly. The machine (machine.ts) owns every moving part; this renders what it reports. */

export function Head({ who, size }: { who: "priya" | "dana"; size: number }) {
  return (
    <span className={`dp-head dp-head--${who}`} style={{ width: size, height: size }} aria-hidden="true">
      <Image src={`/site/characters/${who}-head.webp`} alt="" width={256} height={256} sizes={`${size}px`} draggable={false} />
    </span>
  );
}

export function Sample({ dark = false }: { dark?: boolean }) {
  return <span className={`dp-sample${dark ? " dp-sample--dark" : ""}`}>Sample data</span>;
}

export function VerdictTag({ v }: { v: Verdict }) {
  return <span className={`dp-vtag dp-vtag--${v}`}>{VERDICT_LABEL[v]}</span>;
}

const TRAY_SUB: Record<Verdict, { long: string; short: string }> = {
  block: { long: "Kept off the total", short: "Off the total" },
  ok: { long: "Files itself", short: "Files itself" },
  note: { long: "To Dana, with the rule", short: "To Dana" },
};

export function DropStage({ intro }: { intro: ReactNode }) {
  const [view, setView] = useState<View>(INITIAL_VIEW);
  const [m] = useState(() => new DropMachine((v) => setView(v)));
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!root.current) return;
    const off = m.mount(root.current);
    const board = document.getElementById("board");
    let timer = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        timer = window.setTimeout(() => m.demo(), m.isReduced ? 0 : 650);
      },
      { threshold: 0.3 },
    );
    if (board) io.observe(board);
    /* the "ten times" button in the Same answer scene runs the train here */
    const onTen = (e: Event) => {
      const key = (e as CustomEvent<string | undefined>).detail ?? DEMO_KEY;
      board?.scrollIntoView({ behavior: m.isReduced ? "auto" : "smooth", block: "center" });
      m.train(key, m.isReduced ? 0 : 0.95);
    };
    window.addEventListener("dp:ten", onTen);
    return () => {
      off();
      io.disconnect();
      window.clearTimeout(timer);
      window.removeEventListener("dp:ten", onTen);
    };
  }, [m]);

  /* new chips and traces are in the DOM: let the machine paint them */
  useEffect(() => m.rendered(), [m, view]);

  const busy = view.bulk !== null;

  return (
    <div className="dp-stage" ref={root}>
      <div className="dp-left">
        {intro}
        <div className="dp-hand-wrap">
          <div className="dp-hand-head">
            <Head who="priya" size={30} />
            <p>
              <strong>Priya&rsquo;s receipts</strong>
              <span>Denver, Sep 8 to 12</span>
            </p>
            <Sample />
          </div>
          <div className="dp-hand" role="group" aria-label="Priya's receipts. Choose one to drop it through the policy.">
            {HAND.map((c, i) => {
              const b = view.badges[c.key];
              return (
                <button
                  key={c.key}
                  type="button"
                  className="dp-card"
                  data-key={c.key}
                  disabled={busy}
                  onClick={() => m.dropSingle(c.key)}
                  aria-label={`Drop ${c.merchant}, ${c.amount}${b ? `, dropped ${b.n} ${b.n === 1 ? "time" : "times"}, ${VERDICT_LABEL[b.v]}` : ""}`}
                  style={{ ["--i" as string]: i }}
                >
                  <span className="dp-card-paper">
                    <span className="dp-card-m">{c.short}</span>
                    <span className="dp-card-a">{c.amount}</span>
                    <span className="dp-card-c">{c.category}</span>
                  </span>
                  {b && (
                    <span className="dp-card-b" data-v={b.v} aria-hidden="true">
                      <i />×{b.n}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="dp-pour">
            <button type="button" className="dp-btn dp-btn--ink" onClick={() => m.pour()} disabled={busy}>
              <PourIcon />
              Pour in the team&rsquo;s week
            </button>
            <span>{WEEK.length} sample charges, one after another.</span>
          </div>
        </div>
      </div>

      <div className="dp-right">
        <Board view={view} m={m} />
      </div>

      <div className="dp-chips" aria-hidden="true">
        {view.chips.map((c) => (
          <div key={c.id} data-chip={c.id} className="dp-chip">
            {c.amount}
          </div>
        ))}
      </div>
    </div>
  );
}

function PourIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 2.5v9M6.5 8.5 10 12l3.5-3.5" />
      <rect x="4" y="14" width="12" height="3.5" rx="1.2" />
    </svg>
  );
}

function Board({ view, m }: { view: View; m: DropMachine }) {
  return (
    <div className="dp-board" id="board" role="region" aria-label="The policy board">
      <svg className="dp-traces" viewBox={view.viewBox} preserveAspectRatio="none" aria-hidden="true">
        {view.traces.map((t) => (
          <path
            key={t.id}
            data-trace={t.id}
            d={t.d}
            className={`dp-tr dp-tr--${t.state} dp-tr--${t.v}${t.thin ? " is-thin" : ""}`}
            strokeDasharray={t.state === "live" ? `${t.len} ${t.len}` : undefined}
            strokeDashoffset={t.state === "live" ? t.len : undefined}
          />
        ))}
      </svg>

      <div className="dp-top">
        <span className="dp-side">
          <Head who="priya" size={26} />
          <span>
            <strong>Priya&rsquo;s side</strong>
            <span>Receipts go in</span>
          </span>
        </span>
        <span className="dp-mouth" aria-hidden="true" />
        <Sample dark />
      </div>

      <div className="dp-shaft">
        <div className="dp-spine" aria-hidden="true" />
        <div className="dp-rail dp-rail--L" aria-hidden="true" />
        <div className="dp-rail dp-rail--R" aria-hidden="true" />
        <ol className="dp-gates" aria-label="The policy, compiled into gates, in the order a charge meets them">
          {GATES.map((g, i) => (
            <li key={g.id} className="dp-gate" data-i={i} data-side={g.side} data-fire={g.fire ?? "none"} data-state="idle">
              <span className="dp-label">
                <span className="dp-code">{g.code}</span>
                <span className="dp-name">
                  <span className="dp-name-l">{g.name}</span>
                  <span className="dp-name-s" aria-hidden="true">
                    {g.short}
                  </span>
                  <i className="dp-led" aria-hidden="true" />
                </span>
                <span className="dp-res" aria-hidden="true" />
              </span>
              {g.fire && <span className="dp-ramp" aria-hidden="true" />}
              {g.fire && <span className="dp-pusher" aria-hidden="true" />}
              <span className="dp-doors" aria-hidden="true">
                <i className="dp-door dp-door--l" />
                <i className="dp-door dp-door--r" />
              </span>
              {i === 0 && (
                <span className="dp-feed" aria-hidden="true">
                  <span className="dp-arm" />
                  <span className="dp-feed-card">
                    <i />
                    <b>4417</b>
                  </span>
                  <span className="dp-feed-t">Card charges</span>
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>

      <div className="dp-trays">
        {(["block", "ok", "note"] as const).map((v) => (
          <div key={v} className={`dp-tray dp-tray--${v}`}>
            <p className="dp-tray-h">
              <span>{VERDICT_LABEL[v]}</span>
              <b>{v === "ok" ? view.filed : view.counts[v]}</b>
            </p>
            <p className="dp-tray-s">
              <span className="dp-l">{TRAY_SUB[v].long}</span>
              <span className="dp-s">{TRAY_SUB[v].short}</span>
            </p>
            {v === "ok" && (
              <span className="dp-report" aria-hidden="true">
                <Image src="/site/objects/report.webp" alt="" width={120} height={120} sizes="56px" draggable={false} />
              </span>
            )}
          </div>
        ))}
      </div>

      <SlipView view={view} m={m} />
    </div>
  );
}

function SlipView({ view, m }: { view: View; m: DropMachine }) {
  const s = view.slip;
  const last = view.lastKey ? BY_KEY[view.lastKey] : null;
  let title: ReactNode = null;
  let cite: ReactNode = null;
  let sub: ReactNode = null;
  let stamp: string | null = null;
  let stampKey = "";

  switch (s.kind) {
    case "idle":
      title = (
        <>
          <strong>Dana&rsquo;s side.</strong> Only the exceptions stop here.
        </>
      );
      sub = "Tap one of Priya’s receipts to drop it through the policy.";
      break;
    case "checking": {
      const c = BY_KEY[s.key];
      title = (
        <>
          Checking <strong>{c.merchant}</strong> <span className="dp-amt">{c.amount}</span>
        </>
      );
      sub = s.n > 1 ? `Drop ${s.n}. The dashed line is the path it took last time.` : "Every gate it touches lights and names its rule.";
      break;
    }
    case "verdict": {
      const c = BY_KEY[s.key];
      title = (
        <>
          <VerdictTag v={c.verdict} /> <strong>{c.merchant}</strong> <span className="dp-amt">{c.amount}</span>
        </>
      );
      cite = `${c.cite}.`;
      sub = s.same ? `Drop ${s.n}: through ${s.touched.join(", ")} to ${VERDICT_LABEL[c.verdict]}, the same as drop 1.` : AFTER[c.verdict];
      if (s.same) {
        stamp = "Same path";
        stampKey = `v${s.n}`;
      }
      break;
    }
    case "train": {
      const c = BY_KEY[s.key];
      const done = s.done === s.total;
      title = done ? (
        <>
          Ten drops of <strong>{c.merchant}</strong>. One path, one bin, one rule.
        </>
      ) : (
        <>
          Dropping <strong>{c.merchant}</strong> ten times
        </>
      );
      cite = done ? `${c.cite}, ten times out of ten.` : null;
      sub = done ? "Chance would have spread them across the bins. The rules put every one in the same place." : `${s.done} of ${s.total} landed${s.done ? `, all in ${VERDICT_LABEL[c.verdict]}` : ""}.`;
      if (done) {
        stamp = "Same path ×10";
        stampKey = `t${view.counts.note}${view.filed}${view.counts.block}`;
      }
      break;
    }
    case "pour": {
      const done = s.done === s.total;
      const k = s.counts;
      title = done ? (
        <>
          <strong>The team&rsquo;s week, {s.total} charges.</strong> {k.ok} filed themselves.
        </>
      ) : (
        <>
          Pouring in the team&rsquo;s week: <span className="dp-amt">{s.done}</span> of {s.total} landed
        </>
      );
      sub = done
        ? `${k.note} reached Dana, each with its rule. ${k.block} kept off the reimbursable total.`
        : `${k.ok} cleared, ${k.note} to Dana, ${k.block} blocked so far.`;
      break;
    }
  }

  const anything = view.counts.ok + view.counts.note + view.counts.block > 0;
  const live = s.kind === "idle" || s.kind === "verdict" || ((s.kind === "train" || s.kind === "pour") && s.done === s.total);

  return (
    <div className="dp-slip">
      <Head who="dana" size={34} />
      <div className="dp-slip-body">
        <div aria-live="polite" aria-atomic="true" className="dp-slip-live">
          {live && (
            <>
              <p className="dp-slip-t">{title}</p>
              {cite && <p className="dp-slip-cite">{cite}</p>}
              {stamp && (
                <p className="dp-stamp" key={stampKey}>
                  {stamp}
                </p>
              )}
              {sub && <p className="dp-slip-s">{sub}</p>}
            </>
          )}
        </div>
        {!live && (
          <div aria-hidden="true">
            <p className="dp-slip-t">{title}</p>
            {cite && <p className="dp-slip-cite">{cite}</p>}
            {sub && <p className="dp-slip-s">{sub}</p>}
          </div>
        )}
      </div>
      <div className="dp-slip-act">
        {last && !view.bulk && (
          <>
            <button type="button" className="dp-btn dp-btn--bone" onClick={() => m.dropSingle(last.key)}>
              Drop it again
            </button>
            <button type="button" className="dp-btn dp-btn--line" onClick={() => m.train(last.key)}>
              Ten times
            </button>
          </>
        )}
        {anything && !view.bulk && (
          <button type="button" className="dp-clear" onClick={() => m.clear()}>
            Clear the board
          </button>
        )}
      </div>
    </div>
  );
}
