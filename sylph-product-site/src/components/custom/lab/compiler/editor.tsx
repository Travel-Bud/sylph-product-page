"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { play } from "@/components/custom/v2-sides/sound";
import {
  ADDABLE,
  BASE,
  NUMS,
  OUT_PHRASE,
  VERDICT_LABEL,
  WEEK,
  bounds,
  checkWeek,
  compile,
  fingerprint,
  lineOrder,
  lineParts,
  lineText,
  money,
  money0,
  setNum,
  totals,
  type AddLine,
  type BaseLine,
  type Check,
  type LineKey,
  type NumKey,
  type OutKey,
  type Outcome,
  type PolicyState,
  type Rule,
  type Verdict,
} from "./model";
import { usePolicy } from "./store";

/* The first screen: a policy in plain language, the rules it compiles to, and a sample week checked
   against them. The visitor edits the policy in ways that cannot break it (scrub or type an amount,
   flip an outcome, strike a line, add a sentence from a short set); the rules recompile and every
   charge re-verdicts, each verdict citing its line. The draft is diffed against the approved set,
   the way a reviewer reads a change, and nothing counts until a person approves it. */

type Focus = { kind: "line"; id: LineKey | "built-in" } | { kind: "rule"; id: string } | { kind: "charge"; id: string };
const DEFAULT_FOCUS: Focus = { kind: "charge", id: "sushi" };

export function Editor() {
  const { policy, approved, approvedBy, update, approve, reset } = usePolicy();
  const rules = useMemo(() => compile(policy), [policy]);
  const aRules = useMemo(() => compile(approved), [approved]);
  const fp = fingerprint(rules);
  const afp = fingerprint(aRules);
  const draft = fp !== afp;
  const checks = useMemo(() => checkWeek(rules), [rules]);
  const aChecks = useMemo(() => checkWeek(aRules), [aRules]);
  const differ = WEEK.filter((c) => checks[c.id].v !== aChecks[c.id].v).length;
  const sum = totals(checks);

  const [focus, setFocus] = useState<Focus>(DEFAULT_FOCUS);
  const [pointing, setPointing] = useState(false);
  const [open, setOpen] = useState<NumKey | null>(null);
  const [booted, setBooted] = useState(false);
  const [runs, setRuns] = useState<{ fp: string; n: number; key: number }>({ fp: "", n: 1, key: 0 });
  const runN = runs.fp === fp ? runs.n : 1;
  const [rerun, setRerun] = useState(false);
  const rerunT = useRef(0);
  /* the first edit retires the "drag" cue on the first amount */
  const [touched, setTouched] = useState(false);
  const edit = (fn: (p: PolicyState) => PolicyState) => {
    setTouched(true);
    update(fn);
  };
  const openCtl = (k: NumKey | null) => {
    if (k) setTouched(true);
    setOpen(k);
  };

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = window.setTimeout(() => setBooted(true), reduce ? 0 : 2300);
    return () => window.clearTimeout(t);
  }, []);

  /* what the current focus touches, in all three panes */
  const hot = useMemo(() => {
    const lines = new Set<string>();
    const rs = new Set<string>();
    const cs = new Set<string>();
    const ruleOfLine = (k: string) => rules.find((r) => r.line === k);
    const chargesOf = (id: string) => WEEK.filter((c) => checks[c.id].rule?.id === id).map((c) => c.id);
    if (focus.kind === "charge") {
      cs.add(focus.id);
      const r = checks[focus.id]?.rule;
      if (r) {
        rs.add(r.id);
        lines.add(r.line);
      }
    } else if (focus.kind === "rule") {
      rs.add(focus.id);
      const r = rules.find((x) => x.id === focus.id);
      if (r) lines.add(r.line);
      chargesOf(focus.id).forEach((c) => cs.add(c));
    } else {
      lines.add(focus.id);
      const r = ruleOfLine(focus.id);
      if (r) {
        rs.add(r.id);
        chargesOf(r.id).forEach((c) => cs.add(c));
      }
    }
    return { lines, rules: rs, charges: cs };
  }, [focus, rules, checks]);

  const bodyRef = useRef<HTMLDivElement>(null);
  const wiresRef = useRef<SVGSVGElement>(null);

  /* the wires between a line, its rule and the charges it decided: drawn straight into the SVG
     after every render, and again when the layout moves */
  useLayoutEffect(() => {
    const body = bodyRef.current;
    const svg = wiresRef.current;
    if (!body || !svg) return;
    const draw = () => {
      const wide = window.matchMedia("(min-width: 1100px)").matches;
      if (!wide || !booted) {
        svg.innerHTML = "";
        return;
      }
      const o = body.getBoundingClientRect();
      svg.setAttribute("viewBox", `0 0 ${o.width} ${o.height}`);
      const q = (sel: string) => body.querySelector<HTMLElement>(sel);
      const box = (el: HTMLElement | null) => {
        if (!el) return null;
        const b = el.getBoundingClientRect();
        return { l: b.left - o.left, r: b.right - o.left, y: b.top - o.top + Math.min(b.height / 2, 22) };
      };
      /* from the right side of one element to the left side of another: a short lead out to its
         pane's edge, an S through the channel between panes, a short lead in */
      const wire = (a: HTMLElement, b: HTMLElement, cls: string) => {
        const A = box(a);
        const B = box(b);
        const PA = box(a.closest<HTMLElement>(".cx-pane"));
        const PB = box(b.closest<HTMLElement>(".cx-pane"));
        if (!A || !B || !PA || !PB) return "";
        const pa = PA.r;
        const pb = PB.l;
        const d = (pb - pa) / 2;
        const f = (n: number) => n.toFixed(1);
        return `<path class="${cls}" d="M${f(A.r)} ${f(A.y)} H${f(pa)} C${f(pa + d)} ${f(A.y)}, ${f(pb - d)} ${f(B.y)}, ${f(pb)} ${f(B.y)} H${f(B.l)}"/><circle class="${cls}-dot" cx="${f(A.r)}" cy="${f(A.y)}" r="2.5"/><circle class="${cls}-dot" cx="${f(B.l)}" cy="${f(B.y)}" r="2.5"/>`;
      };
      let out = "";
      hot.rules.forEach((id) => {
        const rEl = q(`[data-rule="${id}"]`);
        if (!rEl) return;
        const r = rules.find((x) => x.id === id);
        if (r && r.line !== "built-in") {
          const lEl = q(`[data-line="${r.line}"]`);
          if (lEl) out += wire(lEl, rEl, "cx-wire");
        }
        hot.charges.forEach((cid) => {
          if (checks[cid]?.rule?.id !== id) return;
          const cEl = q(`[data-charge="${cid}"]`);
          if (cEl) out += wire(rEl, cEl, `cx-wire cx-wire--${checks[cid].v}`);
        });
      });
      svg.innerHTML = out;
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(body);
    return () => ro.disconnect();
  });

  const onRun = () => {
    setRuns({ fp, n: runN + 1, key: runs.key + 1 });
    setRerun(true);
    window.clearTimeout(rerunT.current);
    rerunT.current = window.setTimeout(() => setRerun(false), 1500);
    play("send");
  };
  const onApprove = () => {
    approve();
    play("stamp");
  };
  const onReset = () => {
    reset();
    setOpen(null);
    play("tap");
  };

  const pointFocus = (f: Focus) => {
    setPointing(true);
    setFocus(f);
  };

  return (
    <div className={`cx-ed${booted ? "" : " is-boot"}${touched || draft ? " is-touched" : ""}`} aria-label="Policy editor, sample data" role="region">
      <div className="cx-bar">
        <span className="cx-doc" aria-hidden="true" />
        <span className="cx-bar-t">
          <b>Harbor &amp; Pine</b>
          <span className="cx-bar-sep" aria-hidden="true">/</span>
          <span>Travel and expense policy</span>
          <span className="cx-bar-sec">section 4</span>
        </span>
        <span className="cx-sample">Sample data</span>
        <span className={`cx-fp mono${draft ? " is-draft" : ""}`}>
          <span className="cx-fp-k">{draft ? "Draft" : "Approved"}</span>
          <span className="cx-fp-v">{fp}</span>
        </span>
      </div>

      <div
        className="cx-body"
        ref={bodyRef}
        data-pointing={pointing ? "" : undefined}
        onMouseLeave={() => {
          setPointing(false);
          setFocus(DEFAULT_FOCUS);
        }}
      >
        <PolicyPane
          policy={policy}
          approved={approved}
          hot={hot.lines}
          open={open}
          setOpen={openCtl}
          update={edit}
          onFocusLine={(id) => pointFocus({ kind: "line", id })}
        />
        <span className="cx-chan" aria-hidden="true">
          <span>compile</span>
        </span>
        <RulesPane rules={rules} aRules={aRules} policy={policy} approved={approved} hot={hot.rules} onFocusRule={(id) => pointFocus({ kind: "rule", id })} />
        <span className="cx-chan" aria-hidden="true">
          <span>check</span>
        </span>
        <WeekPane
          checks={checks}
          aChecks={aChecks}
          hot={hot.charges}
          draft={draft}
          fp={fp}
          runN={runN}
          runKey={runs.key}
          rerun={rerun}
          onRun={onRun}
          sum={sum}
          onFocusCharge={(id) => pointFocus({ kind: "charge", id })}
        />
        <svg className="cx-wires" ref={wiresRef} aria-hidden="true" />
      </div>

      <div className={`cx-status${draft ? " is-draft" : ""}`}>
        <div className="cx-ribbon" aria-hidden="true">
          {WEEK.map((c, i) => (
            <i key={c.id} style={{ "--i": i } as React.CSSProperties} className={`cx-cell cx-cell--${checks[c.id].v}${checks[c.id].v !== aChecks[c.id].v ? " is-diff" : ""}`} />
          ))}
        </div>
        <p className="cx-status-t">
          {draft ? (
            <>
              <b>Draft {fp}.</b>{" "}
              {differ === 0
                ? "No verdict changes."
                : differ === 1
                  ? `1 verdict differs from approved ${afp}.`
                  : `${differ} verdicts differ from approved ${afp}.`}{" "}
              <span className="cx-status-s">Charges stay on {afp} until a person approves.</span>
            </>
          ) : (
            <>
              <b>Ruleset {fp}, approved</b> {approvedBy === "dana" ? "by Dana, Sep 1." : "by you, just now."}{" "}
              <span className="cx-status-s">Every charge is checked against it.</span>
            </>
          )}
        </p>
        <span className="cx-live" aria-live="polite">
          {draft ? `Recompiled. ${differ} of ${WEEK.length} verdicts differ from the approved rules.` : `Ruleset ${fp} approved.`}
        </span>
        {draft ? (
          <span className="cx-status-b">
            <button type="button" className="cx-btn cx-btn--line" onClick={onReset}>
              Reset
            </button>
            <button type="button" className="cx-btn cx-btn--ink" onClick={onApprove}>
              Approve {fp}
            </button>
          </span>
        ) : (
          <span className="cx-status-hint">
            <span className="cx-hint-fine">Drag an amount in the policy</span>
            <span className="cx-hint-touch">Tap an amount in the policy</span>
          </span>
        )}
      </div>
    </div>
  );
}

/* ---------- the policy ---------- */

function PolicyPane({
  policy,
  approved,
  hot,
  open,
  setOpen,
  update,
  onFocusLine,
}: {
  policy: PolicyState;
  approved: PolicyState;
  hot: Set<string>;
  open: NumKey | null;
  setOpen: (k: NumKey | null) => void;
  update: (fn: (p: PolicyState) => PolicyState) => void;
  onFocusLine: (id: LineKey) => void;
}) {
  const [menu, setMenu] = useState(false);
  const paneRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const left = ADDABLE.filter((k) => !policy.added.includes(k));

  /* place the open control under its amount */
  useLayoutEffect(() => {
    const pane = paneRef.current;
    const pop = popRef.current;
    if (!pane || !pop || !open) return;
    const place = () => {
      const tok = pane.querySelector<HTMLElement>(`[data-num="${open}"]`);
      if (!tok) return;
      const o = pane.getBoundingClientRect();
      const b = tok.getBoundingClientRect();
      const w = pop.offsetWidth;
      const x = Math.max(8, Math.min(o.width - w - 8, b.left - o.left + b.width / 2 - w / 2));
      pop.style.transform = `translate(${x.toFixed(0)}px, ${(b.bottom - o.top + 10).toFixed(0)}px)`;
      pop.style.setProperty("--arrow", `${(b.left - o.left + b.width / 2 - x).toFixed(0)}px`);
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(pane);
    return () => ro.disconnect();
  });

  /* close the control on a press outside it or its amount */
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Element;
      if (popRef.current?.contains(t) || t.closest?.(`[data-num="${open}"]`)) return;
      setOpen(null);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [open, setOpen]);

  const toggleLine = (k: BaseLine) => {
    update((p) => ({ ...p, off: p.off.includes(k) ? p.off.filter((x) => x !== k) : [...p.off, k] }));
    play("tap");
  };
  const add = (k: AddLine) => {
    update((p) => (p.added.includes(k) ? p : { ...p, added: [...p.added, k] }));
    setMenu(false);
    play("tap");
  };
  const remove = (k: AddLine) => {
    update((p) => ({ ...p, added: p.added.filter((x) => x !== k) }));
    if (open && NUMS[open].line === k) setOpen(null);
    play("tap");
  };

  return (
    <div className="cx-pane cx-pane--policy" ref={paneRef}>
      <div className="cx-ph">
        <span className="cx-ph-k">Policy</span>
        <span className="cx-ph-n">
          <span className="cx-hint-fine">Plain language, as written</span>
          <span className="cx-hint-touch cx-ph-tap">Tap a boxed amount to change it</span>
        </span>
      </div>
      <p className="cx-policy-h">4. Meals, lodging and travel</p>
      <div className="cx-lines">
        {lineOrder(policy).map(({ key, num, added }, i) => {
          const off = (policy.off as LineKey[]).includes(key);
          const isNew = added && !approved.added.includes(key as AddLine);
          return (
            <div
              key={key}
              className={`cx-line${off ? " is-off" : ""}${hot.has(key) ? " is-hot" : ""}${isNew ? " is-new" : ""}`}
              data-line={key}
              style={{ "--i": i } as React.CSSProperties}
              onMouseEnter={() => onFocusLine(key)}
            >
              {added ? (
                <span className="cx-ln cx-ln--static mono">{num}</span>
              ) : (
                <button
                  type="button"
                  className="cx-ln mono"
                  aria-pressed={!off}
                  aria-label={`Line ${num}, ${off ? "struck from the policy. Press to restore it." : "in the policy. Press to strike it."}`}
                  onClick={() => toggleLine(key as BaseLine)}
                  onFocus={() => onFocusLine(key)}
                >
                  {num}
                </button>
              )}
              <p className="cx-line-t">
                {lineParts(key).map((part, j) => {
                  if (typeof part === "string") return <span key={j}>{part}</span>;
                  if ("num" in part)
                    return (
                      <NumToken
                        key={j}
                        k={part.num}
                        policy={policy}
                        changed={policy.nums[part.num] !== approved.nums[part.num]}
                        disabled={off}
                        open={open === part.num}
                        setOpen={setOpen}
                        update={update}
                        onFocus={() => onFocusLine(key)}
                      />
                    );
                  if ("out" in part) return <OutToggle key={j} k={part.out} num={num} policy={policy} approved={approved} disabled={off} update={update} />;
                  return (
                    <span key={j} className={`cx-fixed cx-fixed--${part.fixed}`}>
                      {OUT_PHRASE[part.fixed]}
                    </span>
                  );
                })}
              </p>
              {added && (
                <button type="button" className="cx-rm" aria-label={`Remove line ${num}`} onClick={() => remove(key as AddLine)}>
                  <svg viewBox="0 0 12 12" aria-hidden="true">
                    <path d="M3 3l6 6M9 3l-6 6" />
                  </svg>
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="cx-add">
        {left.length > 0 ? (
          <>
            <button type="button" className="cx-add-b" aria-expanded={menu} onClick={() => setMenu((m) => !m)}>
              <svg viewBox="0 0 12 12" aria-hidden="true">
                <path d="M6 2v8M2 6h8" />
              </svg>
              Add a sentence
            </button>
            {menu && (
              <ul className="cx-menu" aria-label="Sentences you can add">
                {left.map((k) => (
                  <li key={k}>
                    <button type="button" onClick={() => add(k)}>
                      {lineText(policy, k)}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <span className="cx-add-done">All three sample sentences are in. Remove one with its cross.</span>
        )}
      </div>

      <div className="cx-pop" ref={popRef} hidden={!open} role="group" aria-label={open ? NUMS[open].label : undefined}>
        {open && <NumControl k={open} policy={policy} update={update} close={() => setOpen(null)} />}
      </div>
      <p className="cx-hint">
        <span className="cx-hint-fine">Drag a boxed amount sideways, or click it to type.</span>
        <span className="cx-hint-touch">Tap a boxed amount to change it.</span> The number beside a line strikes it.
      </p>
    </div>
  );
}

/* An amount in the policy: drag sideways to scrub it, arrow keys to step it, click or Enter to type it. */
function NumToken({
  k,
  policy,
  changed,
  disabled,
  open,
  setOpen,
  update,
  onFocus,
}: {
  k: NumKey;
  policy: PolicyState;
  changed: boolean;
  disabled: boolean;
  open: boolean;
  setOpen: (k: NumKey | null) => void;
  update: (fn: (p: PolicyState) => PolicyState) => void;
  onFocus: () => void;
}) {
  const v = policy.nums[k];
  const { step, label } = NUMS[k];
  const drag = useRef<{ x: number; v: number; moved: boolean; id: number } | null>(null);
  const swallow = useRef(false);
  const [scrub, setScrub] = useState(false);

  return (
    <button
      type="button"
      className={`cx-num${changed ? " is-changed" : ""}${open ? " is-open" : ""}${scrub ? " is-scrub" : ""}`}
      data-num={k}
      disabled={disabled}
      aria-expanded={open}
      aria-label={`${label}, ${money0(v)}. Drag sideways or use the arrow keys to change it, press Enter to type it.`}
      onFocus={onFocus}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        drag.current = { x: e.clientX, v, moved: false, id: e.pointerId };
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d || d.id !== e.pointerId) return;
        const dx = e.clientX - d.x;
        if (!d.moved) {
          if (Math.abs(dx) < 4) return;
          d.moved = true;
          setScrub(true);
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            /* the pointer already ended */
          }
        }
        const steps = Math.round(dx / 7);
        update((p) => setNum(p, k, d.v + steps * step));
      }}
      onPointerUp={() => {
        if (drag.current?.moved) swallow.current = true;
        drag.current = null;
        setScrub(false);
      }}
      onPointerCancel={() => {
        drag.current = null;
        setScrub(false);
      }}
      onClick={() => {
        if (swallow.current) {
          swallow.current = false;
          return;
        }
        setOpen(open ? null : k);
        play("tap");
      }}
      onKeyDown={(e) => {
        const big = e.shiftKey ? 5 : 1;
        let next: number | null = null;
        let delta = 0;
        if (e.key === "ArrowUp" || e.key === "ArrowRight") delta = step * big;
        else if (e.key === "ArrowDown" || e.key === "ArrowLeft") delta = -step * big;
        else if (e.key === "Home") next = bounds(policy, k)[0];
        else if (e.key === "End") next = bounds(policy, k)[1];
        else if (e.key === "Escape" && open) {
          e.preventDefault();
          setOpen(null);
          return;
        }
        if (delta) {
          e.preventDefault();
          update((p) => setNum(p, k, p.nums[k] + delta));
          return;
        }
        if (next === null) return;
        e.preventDefault();
        const n = next;
        update((p) => setNum(p, k, n));
      }}
    >
      {money0(v)}
    </button>
  );
}

/* The open control for one amount: step it, slide it, or type it. */
function NumControl({
  k,
  policy,
  update,
  close,
}: {
  k: NumKey;
  policy: PolicyState;
  update: (fn: (p: PolicyState) => PolicyState) => void;
  close: () => void;
}) {
  const v = policy.nums[k];
  const [lo, hi] = bounds(policy, k);
  const { step, label } = NUMS[k];
  const [text, setText] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* a keyboard or mouse opens it ready to type; a finger gets the stepper and slider, no keyboard */
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [k]);

  const commit = () => {
    if (text === null) return;
    const n = Number(text.replace(/[^0-9.]/g, ""));
    if (Number.isFinite(n) && n > 0) update((p) => setNum(p, k, n));
    setText(null);
  };
  const back = () => {
    close();
    document.querySelector<HTMLElement>(`[data-num="${k}"]`)?.focus();
  };

  return (
    <div
      className="cx-ctl"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          back();
        }
      }}
    >
      <div className="cx-ctl-h">
        <span>{label}</span>
        <button type="button" className="cx-ctl-x" aria-label="Close" onClick={back}>
          <svg viewBox="0 0 12 12" aria-hidden="true">
            <path d="M3 3l6 6M9 3l-6 6" />
          </svg>
        </button>
      </div>
      <div className="cx-ctl-row">
        <button type="button" className="cx-step" aria-label={`Lower by ${money0(step)}`} disabled={v <= lo} onClick={() => update((p) => setNum(p, k, p.nums[k] - step))}>
          <svg viewBox="0 0 12 12" aria-hidden="true">
            <path d="M2 6h8" />
          </svg>
        </button>
        <label className="cx-ctl-in">
          <span aria-hidden="true">$</span>
          <input
            ref={inputRef}
            inputMode="numeric"
            aria-label={`${label} in dollars`}
            value={text ?? String(v)}
            onChange={(e) => setText(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit();
              }
            }}
          />
        </label>
        <button type="button" className="cx-step" aria-label={`Raise by ${money0(step)}`} disabled={v >= hi} onClick={() => update((p) => setNum(p, k, p.nums[k] + step))}>
          <svg viewBox="0 0 12 12" aria-hidden="true">
            <path d="M6 2v8M2 6h8" />
          </svg>
        </button>
      </div>
      <input
        type="range"
        className="cx-range"
        min={lo}
        max={hi}
        step={step}
        value={v}
        aria-label={`${label}, slider`}
        onChange={(e) => update((p) => setNum(p, k, Number(e.target.value)))}
      />
      <div className="cx-ctl-scale mono" aria-hidden="true">
        <span>{money0(lo)}</span>
        <span>{money0(hi)}</span>
      </div>
    </div>
  );
}

function OutToggle({
  k,
  num,
  policy,
  approved,
  disabled,
  update,
}: {
  k: OutKey;
  num: string;
  policy: PolicyState;
  approved: PolicyState;
  disabled: boolean;
  update: (fn: (p: PolicyState) => PolicyState) => void;
}) {
  const o = policy.out[k];
  const next: Outcome = o === "note" ? "block" : "note";
  return (
    <button
      type="button"
      className={`cx-out cx-out--${o}${o !== approved.out[k] ? " is-changed" : ""}`}
      disabled={disabled}
      aria-label={`Line ${num} outcome: ${OUT_PHRASE[o]}. Press to switch to ${OUT_PHRASE[next]}.`}
      onClick={() => {
        update((p) => ({ ...p, out: { ...p.out, [k]: next } }));
        play("tap");
      }}
    >
      {OUT_PHRASE[o]}
    </button>
  );
}

/* ---------- the rules ---------- */

const OUT_SHORT: Record<Outcome, string> = { note: "Note", block: "Block" };

function RulesPane({
  rules,
  aRules,
  policy,
  approved,
  hot,
  onFocusRule,
}: {
  rules: Rule[];
  aRules: Rule[];
  policy: PolicyState;
  approved: PolicyState;
  hot: Set<string>;
  onFocusRule: (id: string) => void;
}) {
  const keys: LineKey[] = [...BASE, ...Array.from(new Set<AddLine>([...approved.added, ...policy.added]))];
  const rows = keys
    .map((key) => ({ key, cur: rules.find((r) => r.line === key), old: aRules.find((r) => r.line === key) }))
    .filter((r) => r.cur || r.old);
  const dup = rules.find((r) => r.line === "built-in")!;
  const live = rules.filter((r) => r.line !== "built-in").length;

  return (
    <div className="cx-pane cx-pane--rules">
      <div className="cx-ph">
        <span className="cx-ph-k">Rules</span>
        <span className="cx-ph-n">
          {live} compiled, each quoting its line
        </span>
      </div>
      <ul className="cx-rules">
        {rows.map(({ key, cur, old }, i) => {
          const r = (cur ?? old)!;
          const gone = !cur;
          const fresh = !old;
          const valChanged = !!(cur && old && cur.value !== old.value);
          const outChanged = !!(cur && old && cur.outcome !== old.outcome);
          return (
            <li key={key} style={{ "--i": i } as React.CSSProperties}>
              {gone ? (
                <div className="cx-rule is-gone" data-rule={r.id}>
                  <RuleHead r={r} tag="Struck" />
                  <RuleExpr r={r} />
                </div>
              ) : (
                <button
                  type="button"
                  className={`cx-rule${hot.has(r.id) ? " is-hot" : ""}${fresh ? " is-fresh" : ""}${valChanged || outChanged ? " is-changed" : ""}`}
                  data-rule={r.id}
                  onMouseEnter={() => onFocusRule(r.id)}
                  onFocus={() => onFocusRule(r.id)}
                  onClick={() => onFocusRule(r.id)}
                  aria-label={`Rule ${r.id}, from line ${r.num}: ${r.subject} ${r.op} ${r.value}, ${r.outcome === "note" ? "needs a note" : "blocked"}`}
                >
                  <RuleHead r={r} tag={fresh ? "New" : valChanged || outChanged ? "Changed" : undefined} was={outChanged ? old!.outcome : undefined} />
                  <RuleExpr r={r} was={valChanged ? old!.value : undefined} />
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <p className="cx-rules-sub">Built in to every ruleset</p>
      <ul className="cx-rules">
        <li>
          <button
            type="button"
            className={`cx-rule cx-rule--built${hot.has(dup.id) ? " is-hot" : ""}`}
            data-rule={dup.id}
            onMouseEnter={() => onFocusRule(dup.id)}
            onFocus={() => onFocusRule(dup.id)}
            onClick={() => onFocusRule(dup.id)}
            aria-label="Rule D-001, built in: a charge with the same amount on the same day as another needs a note"
          >
            <RuleHead r={dup} />
            <RuleExpr r={dup} />
          </button>
        </li>
        <li>
          <div className="cx-rule cx-rule--built cx-rule--norm">
            <span className="cx-rule-h">
              <span className="cx-rule-id mono">N-001</span>
              <span className="cx-rule-from mono">built in</span>
              <span className="cx-rule-chips">
                <span className="cx-rchip cx-rchip--norm">Normalize</span>
              </span>
            </span>
            <span className="cx-rule-x mono">
              <span>currency</span> <span className="cx-op">at</span> <b>receipt-date rate</b>
            </span>
          </div>
        </li>
      </ul>
    </div>
  );
}

function RuleHead({ r, tag, was }: { r: Rule; tag?: string; was?: Outcome }) {
  return (
    <span className="cx-rule-h">
      <span className="cx-rule-id mono">{r.id}</span>
      <span className="cx-rule-from mono">{r.line === "built-in" ? "built in" : `line ${r.num}`}</span>
      {tag && <span className="cx-rule-tag mono">{tag}</span>}
      <span className="cx-rule-chips">
        {was && <s className="cx-rchip cx-rchip--was">{OUT_SHORT[was]}</s>}
        <span className={`cx-rchip cx-rchip--${r.outcome}`}>{OUT_SHORT[r.outcome]}</span>
      </span>
    </span>
  );
}
function RuleExpr({ r, was }: { r: Rule; was?: string }) {
  return (
    <span className="cx-rule-x mono">
      <span>{r.subject}</span> <span className="cx-op">{r.op}</span> {was && <s className="cx-was-v">{was}</s>} <b>{r.value}</b>
    </span>
  );
}

/* ---------- the week ---------- */

function WeekPane({
  checks,
  aChecks,
  hot,
  draft,
  fp,
  runN,
  runKey,
  rerun,
  onRun,
  sum,
  onFocusCharge,
}: {
  checks: Record<string, Check>;
  aChecks: Record<string, Check>;
  hot: Set<string>;
  draft: boolean;
  fp: string;
  runN: number;
  runKey: number;
  rerun: boolean;
  onRun: () => void;
  sum: ReturnType<typeof totals>;
  onFocusCharge: (id: string) => void;
}) {
  return (
    <div className="cx-pane cx-pane--week">
      <div className="cx-ph">
        <span className="cx-ph-k">A sample week</span>
        <span className="cx-ph-n">{draft ? `Previewed against draft ${fp}` : `Checked against ${fp}`}</span>
        <span className="cx-sample cx-sample--pane">Sample data</span>
        <button type="button" className="cx-btn cx-btn--line cx-btn--sm cx-again" onClick={onRun}>
          <svg viewBox="0 0 12 12" aria-hidden="true">
            <path d="M10 6a4 4 0 1 1-1.2-2.85M10 1.5v2.2H7.8" />
          </svg>
          Check again
        </button>
      </div>
      <ol className={`cx-week${rerun ? " is-rerun" : ""}`} key={runKey}>
        {WEEK.map((c, i) => {
          const k = checks[c.id];
          const was: Verdict | null = k.v !== aChecks[c.id].v ? aChecks[c.id].v : null;
          return (
            <li key={c.id} style={{ "--i": i } as React.CSSProperties}>
              <button
                type="button"
                className={`cx-row${hot.has(c.id) ? " is-hot" : ""}${was ? " is-diff" : ""}`}
                data-charge={c.id}
                data-v={k.v}
                onMouseEnter={() => onFocusCharge(c.id)}
                onFocus={() => onFocusCharge(c.id)}
                onClick={() => onFocusCharge(c.id)}
                aria-label={`${c.day} ${c.date}, ${c.merchant}, ${money(c.usd)}: ${VERDICT_LABEL[k.v]}. ${k.rule ? `Rule ${k.rule.id}, line ${k.rule.num}. ` : ""}${k.cite}.${was ? ` Was ${VERDICT_LABEL[was]} under the approved rules.` : ""}`}
              >
                <span className="cx-r1">
                  <span className="cx-day mono">{c.day}</span>
                  <span className="cx-merch">{c.merchant}</span>
                </span>
                <span className="cx-amt mono">
                  {c.fx && <small>{c.fx.amount}</small>}
                  {money(c.usd)}
                </span>
                <span className="cx-cite">
                  <span className="cx-cite-ln mono">{k.rule ? (k.rule.line === "built-in" ? "built in" : k.rule.num) : "no line"}</span>
                  {k.rule && <span className="cx-cite-id mono">{k.rule.id}</span>}
                  <span className="cx-cite-t">{k.cite}</span>
                  {k.more > 0 && <span className="cx-cite-more mono">+{k.more}</span>}
                </span>
                <span className="cx-vcol">
                  <span key={k.v} className={`cx-chip cx-chip--${k.v}`}>
                    {VERDICT_LABEL[k.v]}
                  </span>
                  {was && <s className="cx-was mono">{VERDICT_LABEL[was]}</s>}
                </span>
                <span key={`f-${k.v}`} className="cx-flash" aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ol>
      <div className="cx-foot">
        <span className="cx-tot">
          <span className="cx-tot-k">Reimbursable</span>
          <span className="mono">{money(sum.on)}</span>
        </span>
        <span className="cx-tot">
          <span className="cx-tot-k">Kept off</span>
          <span className="mono">{money(sum.kept)}</span>
        </span>
        <span className={`cx-run-t mono${runN > 1 ? " is-rerun" : ""}`} aria-live="polite">
          {runN > 1 ? `Run ${runN} on ${fp}: the same ${WEEK.length} answers` : `Run 1 on ${fp}`}
        </span>
      </div>
    </div>
  );
}
