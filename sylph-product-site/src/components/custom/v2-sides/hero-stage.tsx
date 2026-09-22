"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Mark } from "@/components/custom/site/mark";
import { CHARGE, DANA, PRIYA, ROWS, VERDICT_LABEL, type EngineRow } from "./data";
import { Figure, Person, Sample, Tick, VerdictChip } from "./parts";
import { play as sound } from "./sound";

/*
 * The hero is playable. Priya's phone carries three receipts from the Denver trip; the visitor
 * picks one and watches it go: the photo goes out, Sylph answers with the verdict and the rule,
 * and the charge crosses the seam to Dana's queue (an exception) or files itself (cleared).
 *
 * Every step is CSS, keyed on .is-play and each element's delay, and the markup ships playing the
 * Sushi Kanda receipt, so the default play runs from first paint with no script and ends settled:
 * Sushi Kanda in Dana's queue as courier stop 0. Script adds the other picks, measures the flight
 * (transform free, so it is exact at any width) and restarts the play. Reduced motion drops every
 * animation in hero.css, so each pick simply renders its settled end state.
 */

type Id = "sushi" | "lyft" | "bar";
type Play = {
  id: Id;
  row: EngineRow;
  lines: [string, string][];
  /** Sylph's last line, after the verdict */
  then: string;
  /** seconds: when the charge leaves the phone, and when it lands */
  fly: number;
  land: number;
};

const row = (m: string) => ROWS.find((r) => r.merchant === m) as EngineRow;

const PLAYS: Record<Id, Play> = {
  sushi: {
    id: "sushi",
    row: row("Sushi Kanda"),
    lines: [
      ["Omakase", "72.00"],
      ["Tea", "4.00"],
      ["Tax", "8.20"],
    ],
    then: "Reply with a note.",
    fly: 3.3,
    land: 4.45,
  },
  lyft: {
    id: "lyft",
    row: row("Lyft"),
    lines: [
      ["Ride", "19.90"],
      ["Fees", "3.25"],
    ],
    then: "Filed on your September report. Nothing to do.",
    fly: 1.9,
    land: 3.05,
  },
  bar: {
    id: "bar",
    row: row("Bar Bianco"),
    lines: [
      ["Negroni x2", "32.00"],
      ["Olives", "9.00"],
      ["Tax", "5.90"],
    ],
    then: "Not reimbursed. Dana sees it with the rule.",
    fly: 2.0,
    land: 3.15,
  },
};
const ORDER: Id[] = ["sushi", "lyft", "bar"];

/* Dana's desk: what had already filed itself before Priya's receipts arrived. */
const FILED = ["United Airlines", "Hyatt Regency Denver", "Blue Bottle Coffee", "Amtrak"].map(row);

const sec = (s: number) => `${s}s`;
type Vars = React.CSSProperties & Record<`--${string}`, string>;

/** Where an element sits inside the stage, ignoring transforms (the play may be mid-animation). */
function spot(el: HTMLElement, stage: HTMLElement) {
  let x = 0;
  let y = 0;
  let n: HTMLElement | null = el;
  while (n && n !== stage) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

function Receipt({ play }: { play: Play }) {
  return (
    <span className="v2s-h-rc" role="img" aria-label={`Photo of the ${play.row.merchant} receipt, total ${play.row.amount}`}>
      <span className="v2s-h-rc-h">{play.row.merchant.toUpperCase()}</span>
      <span className="v2s-h-rc-s">Denver, CO</span>
      {play.lines.map(([k, v]) => (
        <span className="v2s-h-rc-l" key={k}>
          <span>{k}</span>
          <span>{v}</span>
        </span>
      ))}
      <span className="v2s-h-rc-l v2s-h-rc-t">
        <span>TOTAL</span>
        <span>{play.row.amount.slice(1)}</span>
      </span>
    </span>
  );
}

function Thread({ play, on }: { play: Play; on: boolean }) {
  const { row: r, id } = play;
  const d = (s: number) => ({ "--d": sec(s) }) as Vars;
  return (
    <div className="v2s-h-thread" data-thread={id} hidden={!on}>
      <div className="v2s-h-msg v2s-h-msg--out v2s-h-msg--photo v2s-h-a" style={d(0.25)}>
        <Receipt play={play} />
      </div>
      <div className="v2s-h-msg v2s-h-msg--in v2s-h-a" style={d(1.05)} data-from={id === "sushi" ? undefined : ""}>
        <p>
          Matched to your card: {r.merchant}, <span className="mono">{r.amount}</span>.
        </p>
        <p className="v2s-h-verdict">
          <VerdictChip v={r.verdict} />
          <span className="mono">{r.cite}.</span>
        </p>
        <p>{play.then}</p>
      </div>
      {id === "sushi" && (
        <>
          <div className="v2s-h-msg v2s-h-msg--out v2s-h-a" style={d(2.15)}>
            <p>{CHARGE.note}</p>
          </div>
          <div className="v2s-h-msg v2s-h-msg--in v2s-h-msg--sent v2s-h-a" style={d(2.85)} data-from="">
            <p>Sent to Dana with your note.</p>
          </div>
        </>
      )}
    </div>
  );
}

/** A count that ticks from `prev` to `next` when the charge lands (motion only). */
function Count({ prev, next, className = "" }: { prev: number; next: number; className?: string }) {
  if (prev === next) return <span className={className}>{next}</span>;
  return (
    <span className={`v2s-h-tick ${className}`}>
      <span className="v2s-h-tick-prev" aria-hidden="true">
        {prev}
      </span>
      <span className="v2s-h-tick-next">{next}</span>
    </span>
  );
}

export function HeroStage() {
  const ref = useRef<HTMLDivElement>(null);
  const [pick, setPick] = useState<Id>("sushi");
  const [delivered, setDelivered] = useState<ReadonlySet<Id>>(() => new Set<Id>(["sushi"]));
  const [run, setRun] = useState(0);
  const [said, setSaid] = useState("");
  const play = PLAYS[pick];

  const measure = useCallback(() => {
    const stage = ref.current;
    if (!stage) return;
    const id = stage.dataset.pick as Id;
    const from = stage.querySelector<HTMLElement>(`[data-thread="${id}"] [data-from]`);
    const to = stage.querySelector<HTMLElement>(`[data-to="${id}"]`);
    const fly = stage.querySelector<HTMLElement>(".v2s-h-fly");
    if (!from || !to || !fly) return;
    const a = spot(from, stage);
    /* on a phone Dana's queue sits below the fold, so the charge flies to the badge beside her
       name, which is in view; otherwise it lands on the target's own pill (or its first line) */
    const badge = stage.querySelector<HTMLElement>(`[data-dock="${PLAYS[id].row.verdict === "ok" ? "filed" : "queue"}"]`);
    const toBadge = Boolean(badge && badge.offsetParent);
    const dock = toBadge ? badge! : (to.querySelector<HTMLElement>(".v2s-token-pill, .v2s-h-filed-m") ?? to);
    const c = spot(dock, stage);
    /* keep the pill inside the stage: a badge is docked by its right edge */
    const pw = (fly.firstElementChild as HTMLElement | null)?.offsetWidth ?? 160;
    const room = stage.offsetWidth - pw;
    const x0 = Math.min(a.x + Math.max(0, from.offsetWidth - 170), room);
    const x1 = toBadge ? Math.min(c.x + dock.offsetWidth - pw, room) : c.x;
    const across = Math.abs(x1 - x0) > Math.abs(c.y - a.y);
    fly.style.setProperty("--x0", `${x0}px`);
    fly.style.setProperty("--y0", `${a.y + 6}px`);
    fly.style.setProperty("--x1", `${x1}px`);
    fly.style.setProperty("--y1", `${c.y + (toBadge ? (dock.offsetHeight - 36) / 2 : 0)}px`);
    fly.style.setProperty("--ax", across ? "0px" : "-48px");
    fly.style.setProperty("--ay", across ? "-120px" : "0px");
    stage.dataset.measured = "1";
  }, []);

  /* the first play is already running from first paint; later picks restart it */
  useLayoutEffect(() => {
    const stage = ref.current;
    if (!stage) return;
    if (run === 0) {
      measure();
      return;
    }
    stage.classList.remove("is-play");
    measure();
    void stage.offsetWidth;
    stage.classList.add("is-play");
    stage.dataset.played = "1";
  }, [run, measure]);

  useEffect(() => {
    const ro = new ResizeObserver(measure);
    if (ref.current) ro.observe(ref.current);
    return () => ro.disconnect();
  }, [measure]);

  const announce = useCallback((id: Id, phase: "sent" | "landed", audible = true) => {
    const p = PLAYS[id];
    if (audible) sound(phase === "sent" ? "send" : "land");
    window.dispatchEvent(new CustomEvent("v2s:hero", { detail: { id, verdict: p.row.verdict, phase } }));
    if (phase === "landed") {
      const where = p.row.verdict === "ok" ? "Filed itself on the report." : "In Dana's queue.";
      setSaid(`${p.row.merchant}, ${p.row.amount}: ${VERDICT_LABEL[p.row.verdict]}, ${p.row.cite}. ${where}`);
    }
  }, []);

  const choose = (id: Id) => {
    sound("tap");
    setPick(id);
    setDelivered((s) => new Set(s).add(id));
    setRun((n) => n + 1);
    /* reduced motion: nothing animates, so the play has already landed */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      announce(id, "sent", false);
      announce(id, "landed", false);
    }
  };

  const onStart = (e: React.AnimationEvent) => {
    if (e.animationName === "v2s-h-fly") announce(pick, "sent");
  };
  const onEnd = (e: React.AnimationEvent) => {
    if (e.animationName === "v2s-h-land" && (e.target as HTMLElement).dataset.to === pick) announce(pick, "landed");
  };

  /* counts: what the desk held before this charge landed, and after */
  const exceptions = (["sushi", "bar"] as Id[]).filter((i) => delivered.has(i)).length;
  const exPrev = exceptions - (play.row.verdict !== "ok" ? 1 : 0);
  const cleared = FILED.length + (delivered.has("lyft") ? 1 : 0);
  const clPrev = cleared - (pick === "lyft" ? 1 : 0);
  const inc = (id: Id) => (pick === id ? " is-inc" : "");
  const bar = PLAYS.bar.row;
  const lyft = PLAYS.lyft.row;

  return (
    <div
      className="v2s-h-stage is-play"
      ref={ref}
      data-pick={pick}
      style={{ "--t-fly": sec(play.fly), "--t-land": sec(play.land) } as Vars}
      onAnimationStart={onStart}
      onAnimationEnd={onEnd}
    >
      {/* ---------- Priya's side ---------- */}
      <div className="v2s-h-col v2s-h-col--priya">
        <div className="v2s-h-head">
          <Person side="priya" {...PRIYA} />
          <span className="v2s-h-when mono">Sat Sep 12, Denver</span>
        </div>
        <Figure name="priya-snap" height={540} priority sizes="(max-width: 860px) 84px, 300px" className="v2s-h-fig" />
        <div className="v2s-h-phone" role="group" aria-label="Priya's text thread with Sylph (sample)">
          <div className="v2s-h-phone-top">
            <span className="v2s-h-contact">
              <Mark className="v2s-h-contact-mark" />
              Sylph
            </span>
            <Sample />
          </div>
          <div className="v2s-h-threads">
            {ORDER.map((id) => (
              <Thread key={id} play={PLAYS[id]} on={id === pick} />
            ))}
          </div>
          <div className="v2s-h-tray">
            <div className="v2s-h-tray-row">
              <p className="v2s-h-tray-k" id="tray-k">
                Tap a receipt to text it
              </p>
              <a href="#your-month" className="v2s-h-month">
                Run a sample month
              </a>
            </div>
            <div className="v2s-h-thumbs" role="group" aria-labelledby="tray-k">
              {ORDER.map((id) => {
                const p = PLAYS[id];
                return (
                  <button
                    key={id}
                    type="button"
                    className="v2s-h-thumb"
                    aria-pressed={pick === id}
                    aria-label={`Text Sylph the ${p.row.merchant} receipt, ${p.row.amount}`}
                    onClick={() => choose(id)}
                  >
                    <span className="v2s-h-thumb-m">{p.row.merchant}</span>
                    <span className="v2s-h-thumb-bars" aria-hidden="true">
                      <i />
                      <i />
                    </span>
                    <span className="v2s-h-thumb-a mono">{p.row.amount}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Dana's side ---------- */}
      <div className="v2s-h-col v2s-h-col--dana">
        <div className="v2s-h-head">
          <Person side="dana" {...DANA} />
          <span className="v2s-h-when mono">Finance, same evening</span>
          {/* phones only: Dana's desk in brief, beside her, where the charge lands in view */}
          <span className="v2s-h-badge" aria-hidden="true">
            <span className="v2s-h-badge-k" data-dock="queue">
              Needs you <Count prev={exPrev} next={exceptions} className="v2s-h-count mono" />
            </span>
            <span className="v2s-h-badge-k" data-dock="filed">
              Filed <Count prev={clPrev} next={cleared} className="v2s-h-count v2s-h-count--ok mono" />
            </span>
          </span>
        </div>
        <div className="v2s-h-desk" role="group" aria-label="Dana's queue (sample)">
          <div className="v2s-h-desk-bar">
            <span>Dana&rsquo;s queue, September</span>
            <Sample />
          </div>

          <p className="v2s-h-desk-k">
            Needs you
            <Count prev={exPrev} next={exceptions} className="v2s-h-count mono" />
          </p>
          <div className="v2s-h-slot">
            <p className={`v2s-h-empty${inc("sushi")}`}>Nothing needs you yet.</p>
            <article className={`v2s-h-qcard v2s-h-dest${inc("sushi")}`} data-to="sushi">
              <div className="v2s-h-qcard-top">
                <span className="v2s-token-pill" data-courier-stop="0">
                  <span className="v2s-token-m">{CHARGE.merchant}</span>
                  <span className="mono">{CHARGE.amount}</span>
                </span>
                <VerdictChip v="note" />
              </div>
              <p className="v2s-cite mono">{CHARGE.cite}</p>
              <p className="v2s-h-qnote">
                <span className="v2s-h-qnote-who">Priya:</span> &ldquo;{CHARGE.note}&rdquo;
              </p>
            </article>
          </div>
          <div className="v2s-h-slot v2s-h-slot--row">
            <p className={`v2s-h-empty${delivered.has("bar") ? inc("bar") : " is-idle"}`}>Nothing else needs you.</p>
            {delivered.has("bar") && (
              <div className={`v2s-h-qrow v2s-h-dest${inc("bar")}`} data-to="bar">
                <span className="v2s-token-pill v2s-token-pill--block">
                  <span className="v2s-token-m">{bar.merchant}</span>
                  <span className="mono">{bar.amount}</span>
                </span>
                <VerdictChip v="block" />
                <span className="v2s-cite mono">{bar.cite}</span>
              </div>
            )}
          </div>

          <p className="v2s-h-desk-k">
            Filed itself
            <span className="v2s-h-desk-sub mono">
              <Count prev={clPrev} next={cleared} /> cleared, on the report
            </span>
          </p>
          <ul className={`v2s-h-filed${pick === "lyft" ? " is-inc" : ""}`}>
            {delivered.has("lyft") && (
              <li className={`v2s-h-dest${inc("lyft")}`} data-to="lyft">
                <span className="v2s-h-filed-tick">
                  <Tick />
                </span>
                <span className="v2s-h-filed-m">{lyft.merchant}</span>
                <span className="mono v2s-h-filed-a">{lyft.amount}</span>
              </li>
            )}
            {FILED.map((r) => (
              <li key={r.merchant}>
                <span className="v2s-h-filed-tick">
                  <Tick />
                </span>
                <span className="v2s-h-filed-m">{r.merchant}</span>
                <span className="mono v2s-h-filed-a">{r.amount}</span>
              </li>
            ))}
          </ul>
        </div>
        <Figure name="dana-review" height={540} priority sizes="(max-width: 860px) 64px, 230px" className="v2s-h-fig" />
      </div>

      <div className="v2s-h-fly" aria-hidden="true">
        <div className="v2s-h-fly-in">
          <span className={`v2s-token-pill v2s-token-pill--${play.row.verdict}`}>
            <span className="v2s-token-m">{play.row.merchant}</span>
            <span className="mono">{play.row.amount}</span>
          </span>
        </div>
      </div>

      <p className="v2s-h-sr" aria-live="polite">
        {said}
      </p>
    </div>
  );
}
