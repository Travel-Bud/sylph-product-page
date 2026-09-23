"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { COUNTS, MARKS, VERDICT_LABEL, printedOf, shortDate, usd, type PileMark } from "./pile-data";
import { buildScenes, type Geo, type Label, type Scene } from "./pile-scenes";
import { PileEngine, type FrameInfo, type Mode } from "./pile-engine";

/*
 * The sticky graphic: the canvas of marks, the tally above it, the HTML labels over it, and the
 * tooltip. It is told which step is active; moving forward plays that step's scene, moving back
 * settles it. Reduced motion settles every step at once.
 */

const ARIA = [
  `A pile of ${COUNTS.charges} card charges, one slip each, in the order they posted.`,
  `The charges on a calendar of September, with ${COUNTS.receipts} receipts drawn from text, email and upload to their charges.`,
  `The charges by currency on a dollar scale: ${COUNTS.foreign} foreign charges moved from their printed amount to dollars.`,
  `The calendar again, with ${COUNTS.dupes} flagged duplicates bracketed and ${COUNTS.lookalikes} look-alikes on other days linked by arcs.`,
  `The charges in rows by rule, against each rule's threshold: ${COUNTS.cleared} cleared, ${COUNTS.note} need a note, ${COUNTS.block} blocked.`,
  `The ${COUNTS.cleared} cleared charges filed into the September report, and the ${COUNTS.exceptions} left for a person listed with their rules.`,
];

const SENT: Record<string, string> = { text: "texted", email: "emailed", upload: "uploaded" };

function Tip({ m, step }: { m: PileMark; step: number }) {
  const foreign = m.cur !== "USD";
  return (
    <>
      <span className="pl-tip-h">
        <b>{m.merchant}</b>
        <span>{step >= 2 || !foreign ? usd(m.usd) : printedOf(m)}</span>
      </span>
      <span className="pl-tip-m">
        {shortDate(m.date)}, {m.name}, {m.category.toLowerCase()}
        {m.detail !== m.category.toLowerCase() ? `, ${m.detail}` : ""}
      </span>
      {foreign && (
        <span className="pl-tip-m">
          {step >= 2 ? `${printedOf(m)} at ${m.rate}` : `${printedOf(m)}, not yet in dollars`}
        </span>
      )}
      {step >= 1 && <span className="pl-tip-m">{m.channel ? `Receipt ${SENT[m.channel]}` : "No receipt"}</span>}
      {step >= 4 ? (
        <span className="pl-tip-v">
          <span className={`pl-chip pl-chip--${m.verdict}`}>{VERDICT_LABEL[m.verdict]}</span>
          <span className="pl-tip-c">{m.cite}</span>
        </span>
      ) : (
        <span className="pl-tip-m pl-tip-wait">Not checked yet</span>
      )}
    </>
  );
}

function Lab({ l, d }: { l: Label; d: number }) {
  return (
    <div className={`pl-l ${l.cls ?? ""}`} style={{ left: l.x, top: l.y, width: l.w, animationDelay: `${Math.max(0, d)}ms` }}>
      {l.swatch && <i className={`pl-sw pl-sw--${l.swatch}`} aria-hidden="true" />}
      <span className="pl-l-t">{l.text}</span>
      {l.meta && <span className="pl-l-m">{l.meta}</span>}
      {l.right && <span className="pl-l-r">{l.right}</span>}
      {l.sub && <span className="pl-l-s">{l.sub}</span>}
    </div>
  );
}

type Tal = { step: number; big: number; a: number; b: number; c: number };

/** What the tally reads once a step has settled. */
const settledTal = (step: number): Tal => ({
  step,
  big: step >= 4 ? COUNTS.exceptions : COUNTS.charges,
  a: step === 1 ? COUNTS.receipts : step >= 4 ? COUNTS.cleared : COUNTS.charges,
  b: COUNTS.note,
  c: COUNTS.block,
});

/** The tally from a frame: counts of the marks as drawn. */
function talOf(f: FrameInfo): Tal {
  const t = settledTal(f.step);
  if (f.step === 0 && f.mode === "intro") return { ...t, big: f.landed, a: f.landed };
  if (f.step === 1) return { ...t, a: f.by.matched ?? 0 };
  if (f.step === 4) {
    const ok = f.by.ok ?? 0;
    return { ...t, big: COUNTS.charges - ok, a: ok, b: f.by.note ?? 0, c: f.by.block ?? 0 };
  }
  return t;
}

type FeedRef = React.RefObject<((t: Tal) => void) | null>;

function Tally({ step, feedRef }: { step: number; feedRef: FeedRef }) {
  const [t, setT] = useState<Tal>(() => settledTal(step));
  useEffect(() => {
    feedRef.current = (n) => setT((o) => (o.step === n.step && o.big === n.big && o.a === n.a && o.b === n.b && o.c === n.c ? o : n));
    return () => {
      feedRef.current = null;
    };
  }, [feedRef]);
  const v = t.step === step ? t : settledTal(step);
  let sub: React.ReactNode;
  if (step === 0) sub = <><b>{v.a}</b> charges, {usd(COUNTS.total)}, none checked yet</>;
  else if (step === 1) sub = <>Receipts matched <b>{v.a}</b> of {COUNTS.charges}</>;
  else if (step === 2) sub = <><b>{COUNTS.foreign}</b> of {COUNTS.charges} charged in another currency</>;
  else if (step === 3) sub = <><b>{COUNTS.dupes}</b> flagged as duplicates, <b>{COUNTS.lookalikes}</b> look-alikes pass</>;
  else if (step === 4)
    sub = (
      <>
        <i className="pl-sw pl-sw--ok" /> Cleared <b>{v.a}</b>
        <i className="pl-sw pl-sw--note" /> Needs a note <b>{v.b}</b>
        <i className="pl-sw pl-sw--block" /> Blocked <b>{v.c}</b>
      </>
    );
  else
    sub = (
      <>
        <i className="pl-sw pl-sw--ok" /> Filed <b>{COUNTS.cleared}</b>, {usd(COUNTS.clearedTotal)}
      </>
    );
  return (
    <div className="pl-tally">
      <span className="pl-big">
        <span className="pl-big-n">{v.big}</span>
        <span className="pl-big-l">left for a person</span>
      </span>
      <span className="pl-sub" key={step}>
        {sub}
      </span>
      <span className="pl-sample">Sample data</span>
    </div>
  );
}

export function PileGraphic({ step }: { step: number }) {
  const wrap = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<PileEngine | null>(null);
  const feedRef = useRef<((t: Tal) => void) | null>(null);
  const prevStep = useRef(-1);
  const reduce = useRef(false);
  const [geo, setGeo] = useState<Geo | null>(null);
  const scenes = useMemo<Scene[] | null>(() => (geo ? buildScenes(geo) : null), [geo]);
  const [shown, setShown] = useState<{ step: number; mode: Mode; nonce: number }>({ step: 0, mode: "settle", nonce: 0 });
  const [phase, setPhase] = useState<"a" | "b">("b");
  const [tip, setTip] = useState<number | null>(null);

  /* measure the stage */
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const measure = () => {
      const r = el.getBoundingClientRect();
      const W = Math.round(r.width);
      const H = Math.round(r.height);
      if (W < 50 || H < 50) return;
      setGeo((g) => (g && g.W === W && g.H === H ? g : { W, H, mobile: W < 560 }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* the engine follows the scenes (created once, re-laid on resize) */
  useEffect(() => {
    if (!scenes || !geo || !canvas.current) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let e = engine.current;
    if (!e) {
      e = new PileEngine(canvas.current);
      e.reduce = reduce.current;
      engine.current = e;
      const fam = getComputedStyle(canvas.current).getPropertyValue("--font-martian").trim();
      if (fam) {
        e.setFont(fam);
        document.fonts?.load(`600 10px ${fam}`).then(() => engine.current?.kick(), () => undefined);
      }
    }
    e.setScenes(scenes, geo, dpr);
    if (prevStep.current < 0) {
      const first = step;
      prevStep.current = first;
      e.go(first, first === 0 && !reduce.current ? "intro" : "settle", reduce.current || first !== 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenes, geo]);

  /* per-frame counts into the tally (a state update only when a count changes) */
  useEffect(() => {
    const e = engine.current;
    if (!e) return;
    e.onFrame = (f: FrameInfo) => feedRef.current?.(talOf(f));
  }, [scenes]);

  /* step changes: forward plays, back settles */
  useEffect(() => {
    const e = engine.current;
    if (!e || !scenes || step === prevStep.current) return;
    const forward = step > prevStep.current;
    prevStep.current = step;
    const mode: Mode = forward && !reduce.current ? "play" : "settle";
    e.hover = null;
    e.go(step, mode);
    const at = scenes[step].phaseAt;
    let timer = 0;
    /* one state update per step change, then the phase flip on its timer */
    queueMicrotask(() => {
      setTip(null);
      setShown((s) => ({ step, mode, nonce: s.nonce + 1 }));
      setPhase(mode === "play" && at ? "a" : "b");
    });
    if (mode === "play" && at) timer = window.setTimeout(() => setPhase("b"), at);
    return () => window.clearTimeout(timer);
  }, [step, scenes]);

  const scene = scenes?.[shown.step];

  const pick = (clientX: number, clientY: number) => {
    const e = engine.current;
    const el = stage.current;
    if (!e || !el) return null;
    const r = el.getBoundingClientRect();
    return e.hit(clientX - r.left, clientY - r.top);
  };
  const setHover = (i: number | null) => {
    const e = engine.current;
    if (!e || e.hover === i) return;
    e.hover = i;
    e.kick();
    setTip(i);
  };

  const tipBox = tip !== null ? engine.current?.box(tip) : undefined;
  let tipStyle: React.CSSProperties | undefined;
  let tipBelow = false;
  if (tipBox && geo) {
    const w = Math.min(260, geo.W - 16);
    const left = Math.min(Math.max(8, tipBox.x - w / 2), geo.W - w - 8);
    tipBelow = tipBox.y - tipBox.h / 2 < 170;
    tipStyle = {
      left,
      width: w,
      top: tipBelow ? tipBox.y + tipBox.h / 2 + 10 : tipBox.y - tipBox.h / 2 - 10,
    };
  }

  return (
    <div className="pl-graphic" ref={wrap}>
      <Tally step={shown.step} feedRef={feedRef} />
      <div className="pl-stage" ref={stage}>
        <canvas
          ref={canvas}
          className={`pl-canvas${tip !== null ? " is-pointing" : ""}`}
          role="img"
          aria-label={ARIA[shown.step]}
          onPointerMove={(ev) => {
            if (ev.pointerType === "mouse") setHover(pick(ev.clientX, ev.clientY));
          }}
          onPointerLeave={(ev) => {
            if (ev.pointerType === "mouse") setHover(null);
          }}
          onClick={(ev) => {
            const i = pick(ev.clientX, ev.clientY);
            setHover(i === tip && ev.nativeEvent instanceof PointerEvent && ev.nativeEvent.pointerType !== "mouse" ? null : i);
          }}
        />
        {scene && (
          <div className="pl-labels" key={shown.nonce}>
            {scene.labels
              .filter((l) => !l.phase || l.phase === phase)
              .map((l) => (
                <Lab key={l.key} l={l} d={shown.mode === "play" ? (l.t ?? 0) - (l.phase === "b" && scene.phaseAt ? scene.phaseAt : 0) : 0} />
              ))}
          </div>
        )}
        {tip !== null && tipStyle && (
          <div className={`pl-tip${tipBelow ? " is-below" : ""}`} style={tipStyle} role="status">
            <Tip m={MARKS[tip]} step={shown.step} />
          </div>
        )}
      </div>
    </div>
  );
}
