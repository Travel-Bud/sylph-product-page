"use client";

import "./chapters.css";
import { useEffect, useRef, useState } from "react";
import { Obj, type ObjName } from "@/components/custom/site/obj";
import { VerdictCard } from "@/components/custom/site/verdicts";
import { FaresWindow } from "@/components/custom/site/panels";
import { CHARGE, CLEARED, EXCEPTIONS, DANA, PRIYA, QBO_LIVE, ROWS, type EngineRow } from "./data";
import { Figure, Head, Person, Sample, SideTag, Tick, Token, VerdictChip, type CastName, type Side } from "./parts";
import { play } from "./sound";

/* Round 3: every chapter is one composed screen. The person stands on their own edge, the copy sits
   beside them, and one panel teaches by responding to the visitor. Panels are keyboard complete;
   under reduced motion or without script they render their settled default state. */

/* ---------- shared helpers ---------- */

/** Runs `fn` when the courier lands at `stop` (contract: window event "v2s:arrive", detail.stop). */
function useArrival(stop: number, fn: () => void) {
  const ref = useRef(fn);
  useEffect(() => {
    ref.current = fn;
  });
  useEffect(() => {
    const on = (e: Event) => {
      if ((e as CustomEvent<{ stop: number }>).detail?.stop === stop) ref.current();
    };
    window.addEventListener("v2s:arrive", on);
    return () => window.removeEventListener("v2s:arrive", on);
  }, [stop]);
}

/** When the courier lands, the stop's own pill settles with one pulse (motion is caused by the arrival). */
function StopPulse({ stop }: { stop: number }) {
  useArrival(stop, () => {
    const pill = document.querySelector<HTMLElement>(`[data-courier-stop="${stop}"]`);
    if (!pill) return;
    pill.classList.remove("is-arrived");
    void pill.offsetWidth;
    pill.classList.add("is-arrived");
  });
  return null;
}

/** Arrow keys, Home and End move between tabs in a tablist (WAI-ARIA tabs pattern, automatic activation). */
function tabKeys(e: React.KeyboardEvent<HTMLElement>, i: number, n: number, set: (j: number) => void) {
  const k = e.key;
  let j = -1;
  if (k === "ArrowRight" || k === "ArrowDown") j = (i + 1) % n;
  else if (k === "ArrowLeft" || k === "ArrowUp") j = (i - 1 + n) % n;
  else if (k === "Home") j = 0;
  else if (k === "End") j = n - 1;
  if (j < 0) return;
  e.preventDefault();
  set(j);
  e.currentTarget.parentElement?.querySelectorAll<HTMLElement>('[role="tab"]')[j]?.focus();
}

function Chapter({
  id,
  side,
  figure,
  figH,
  title,
  lede,
  token,
  stack = false,
  pin = false,
  children,
}: {
  id: string;
  side: Side;
  figure: CastName;
  figH: number;
  title: React.ReactNode;
  lede: React.ReactNode;
  token: React.ReactNode;
  stack?: boolean;
  pin?: boolean;
  children: React.ReactNode;
}) {
  const who = side === "priya" ? PRIYA : DANA;
  const grid = (
    <div className="v2s-wrap v2c-grid">
      <div className="v2c-fig">
        <Figure name={figure} height={figH} />
      </div>
      <div className="v2c-copy">
        <Person side={side} {...who} size={40} />
        <h2 id={`${id}-t`} className="v2c-h2">
          {title}
        </h2>
        <div className="v2c-lede">{lede}</div>
        {token}
      </div>
      <div className="v2c-panel">{children}</div>
    </div>
  );
  if (pin)
    return (
      <section id={id} className={`v2s-ch v2c v2c--${side} v2c--pin`} aria-labelledby={`${id}-t`}>
        <div className="v2c-pin">{grid}</div>
      </section>
    );
  return (
    <section id={id} className={`v2s-ch v2c v2c--${side}${stack ? " v2c--stack" : ""}`} aria-labelledby={`${id}-t`}>
      <div className="v2s-wrap v2c-grid">
        <div className="v2c-fig">
          <Figure name={figure} height={figH} />
        </div>
        <div className="v2c-copy">
          <Person side={side} {...who} size={40} />
          <h2 id={`${id}-t`} className="v2c-h2">
            {title}
          </h2>
          <div className="v2c-lede">{lede}</div>
          {token}
        </div>
        <div className="v2c-panel">{children}</div>
      </div>
    </section>
  );
}

function Card({ side, title, children, className = "" }: { side: Side | "both"; title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`v2c-card ${className}`}>
      <div className="v2c-card-head">
        <h3 className="v2c-card-k">{title}</h3>
        <span className="v2c-card-tags">
          <SideTag side={side} />
          <Sample />
        </span>
      </div>
      {children}
    </div>
  );
}

/* ---------- the seams between scenes (round 6) ----------
   Each scene is framed off from the next by a seam: an ink hairline across the top and bottom and one
   down the middle, the line that divides the two sides. The side the charge leaves sits at the top, on
   that person's half; the side it goes to sits at the bottom, on theirs; the next scene's card sits on
   the dividing line. The courier flies every leg through that card (data-courier-seam, courier.tsx). */

const SEAMS: { from: Side | "both"; to: Side | "both"; title: string }[] = [
  { from: "both", to: "priya", title: "The photo" },
  { from: "priya", to: "dana", title: "The rule" },
  { from: "dana", to: "priya", title: "The answer" },
  { from: "priya", to: "dana", title: "The desk" },
  { from: "dana", to: "both", title: "Month end" },
];

export function Seam({ leg }: { leg: number }) {
  const s = SEAMS[leg];
  if (!s) return null;
  return (
    <div className={`v2c-seam v2c-seam--${s.from}-${s.to}`} data-courier-seam={leg} aria-hidden="true">
      <div className="v2s-wrap v2c-seam-in">
        <span className="v2c-seam-line" />
        <span className={`v2c-seam-tag v2c-seam-tag--top v2c-seam-tag--${s.from}`}>
          <SideTag side={s.from} />
        </span>
        <span className="v2c-seam-card">
          <b className="mono">0{leg + 1}</b>
          <span>{s.title}</span>
        </span>
        <span className={`v2c-seam-tag v2c-seam-tag--bottom v2c-seam-tag--${s.to}`}>
          <SideTag side={s.to} />
        </span>
      </div>
    </div>
  );
}

/* ---------- 1. Receipts: choose how the receipt arrives, watch that path find its charge ---------- */

const WAYS: { id: string; obj: ObjName; label: string; did: string; charge: EngineRow; when: string }[] = [
  { id: "text", obj: "phone", label: "Text", did: "Priya texts a photo", charge: row("Sushi Kanda"), when: "Sep 12, card 4417" },
  { id: "email", obj: "envelope", label: "Email", did: "She forwards the e-receipt", charge: row("United Airlines"), when: "Sep 11, card 4417" },
  { id: "upload", obj: "tray", label: "Upload", did: "She drops the folio in the app", charge: row("Hyatt Regency Denver"), when: "Sep 12, card 4417" },
];

function row(merchant: string): EngineRow {
  return ROWS.find((r) => r.merchant === merchant) ?? ROWS[0];
}

function WaySource({ id }: { id: string }) {
  if (id === "text")
    return (
      <div className="v2c-src v2c-src--text">
        <span className="v2c-src-bubble">
          <span className="v2c-mini-rcpt" aria-hidden="true">
            <b>SUSHI KANDA</b>
            <i />
            <i />
            <i />
            <b>TOTAL 84.20</b>
          </span>
        </span>
        <span className="v2c-src-meta mono">Photo, 7:52 pm</span>
      </div>
    );
  if (id === "email")
    return (
      <div className="v2c-src v2c-src--email">
        <span className="v2c-mail-row">
          <b>Fwd:</b> Your receipt from United Airlines
        </span>
        <span className="v2c-mail-row mono">To: her Sylph receipts address</span>
        <span className="v2c-mail-att mono">united-receipt.pdf</span>
      </div>
    );
  return (
    <div className="v2c-src v2c-src--upload">
      <span className="v2c-drop mono">hyatt-folio.jpg</span>
      <span className="v2c-src-meta">Dropped into the app</span>
    </div>
  );
}

/** Flips true once the element is mostly in view, so a demonstration can replay where it is seen. */
function useSeen<T extends Element>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen] as const;
}

function ReceiptPaths() {
  const [i, setI] = useState(0);
  const touched = useRef(false);
  const [seenRef, seen] = useSeen<HTMLDivElement>();
  const w = WAYS[i];
  useArrival(1, () => {
    if (!touched.current) setI(0);
  });
  const pick = (j: number) => {
    touched.current = true;
    setI(j);
  };
  return (
    <Card side="priya" title="How the receipt arrives">
      <div className="v2c-tabs" role="tablist" aria-label="How the receipt arrives">
        {WAYS.map((x, j) => (
          <button
            key={x.id}
            type="button"
            role="tab"
            id={`way-tab-${x.id}`}
            aria-selected={i === j}
            aria-controls="way-panel"
            tabIndex={i === j ? 0 : -1}
            className="v2c-tab"
            onClick={() => {
              play("tap");
              pick(j);
            }}
            onKeyDown={(e) => tabKeys(e, j, WAYS.length, pick)}
          >
            <Obj name={x.obj} size={36} />
            {x.label}
          </button>
        ))}
      </div>
      {/* keyed by the path and by first sight: each choice, and the first look, replays the match */}
      <div className="v2c-match" role="tabpanel" id="way-panel" aria-labelledby={`way-tab-${w.id}`} key={`${w.id}-${seen}`} ref={seenRef}>
        <div className="v2c-match-side">
          <span className="v2c-k">{w.did}</span>
          <WaySource id={w.id} />
        </div>
        <span className="v2c-match-line" aria-hidden="true" />
        <div className="v2c-match-side">
          <span className="v2c-k">It finds its card charge</span>
          <div className="v2c-charge">
            <span className="v2c-charge-m">{w.charge.merchant}</span>
            <span className="mono v2c-charge-d">{w.when}</span>
            <span className="mono v2c-charge-a">{w.charge.amount}</span>
            <span className="v2c-matched">
              <Tick />
              Matched
            </span>
          </div>
        </div>
      </div>
      <p className="v2c-foot">
        Amount and date agree, so the receipt lands on its charge by itself. Any currency:{" "}
        <span className="mono">&yen;14,200</span> becomes <span className="mono">$95.62</span> at the rate on the receipt date.
      </p>
    </Card>
  );
}

export function Receipts() {
  return (
    <Chapter
      id="receipts"
      side="priya"
      figure="priya-walk"
      figH={440}
      title={
        <>
          <span className="v2s-name v2s-name--priya">Priya&rsquo;s</span> part is a photo.
        </>
      }
      lede={
        <p>
          Text it, forward the email, or drop it in. Each receipt finds its own charge on the cards and banks your
          company already has. Nothing to switch, no report to build.
        </p>
      }
      token={<Token step={1} state="Photo in, matched to the charge" />}
    >
      <StopPulse stop={1} />
      <StopPulse stop={2} />
      <StopPulse stop={3} />
      <StopPulse stop={4} />
      <StopPulse stop={5} />
      <ReceiptPaths />
    </Chapter>
  );
}

/* ---------- 2. Policy: a paragraph of plain policy compiles into rules as the visitor scrolls ---------- */

/* The paragraph, split into one clause per rule. Tokens are the words the compiler lifts out. */
type Part = string | { k: string; t: string };
const CLAUSES: { r: number; parts: Part[] }[] = [
  { r: 0, parts: ["4.3 A ", { k: "a0", t: "solo dinner" }, " is covered up to ", { k: "a1", t: "$75" }, ". Over the cap it ", { k: "a2", t: "needs a note" }, ","] },
  { r: 1, parts: [" and over ", { k: "b1", t: "$120" }, " it is ", { k: "b2", t: "not reimbursed" }, ". "] },
  { r: 2, parts: ["4.5 ", { k: "c0", t: "Alcohol" }, " is ", { k: "c2", t: "not reimbursed" }, ". "] },
  { r: 3, parts: ["4.6 A ", { k: "d0", t: "hotel" }, " is covered up to ", { k: "d1", t: "$350" }, " a night, and anything over ", { k: "d2", t: "needs a note" }, "."] },
];

/* What each rule is made of: [field, value, the token it is lifted from]. */
const COMPILED: { id: string; kind: "warn" | "block"; fields: [string, string, string][] }[] = [
  { id: "M-041", kind: "warn", fields: [["if", "solo dinner", "a0"], ["over", "$75", "a1"], ["then", "needs a note", "a2"]] },
  { id: "M-042", kind: "block", fields: [["if", "solo dinner", "a0"], ["over", "$120", "b1"], ["then", "not reimbursed", "b2"]] },
  { id: "M-022", kind: "block", fields: [["if", "Alcohol", "c0"], ["then", "not reimbursed", "c2"]] },
  { id: "L-007", kind: "warn", fields: [["if", "hotel", "d0"], ["over", "$350", "d1"], ["then", "needs a note", "d2"]] },
];
const FLIGHTS = COMPILED.flatMap((rule, r) => rule.fields.map(([, t, src], f) => ({ r, f, t, src })));

/* The script: each rule owns a slice of the run, and the slices overlap a little so the machine
   never idles between rules. Inside a slice the clause is read, its tokens lift out in an
   overlapping stream and fly to their fields, then the card eases into its lock and its chip
   stamps. The run starts while the section scrolls in and ends as the pin releases: no dead scroll. */
const RUN = { start: 0.02, end: 0.93, done: 0.95 };
const N = COMPILED.length;
const OVERLAP = 0.18;
const SLICE = (RUN.end - RUN.start) / (N - (N - 1) * OVERLAP);
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const smooth = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};
const ruleU = (p: number, r: number) => clamp01((p - (RUN.start + r * SLICE * (1 - OVERLAP))) / SLICE);
const flightT = (u: number, f: number) => clamp01((u - (0.1 + f * 0.15)) / 0.5);

type Box = { x: number; y: number; w: number; h: number };

function PolicyCompile() {
  const root = useRef<HTMLDivElement>(null);
  const [lit, setLit] = useState<number | null>(null);
  const [approved, setApproved] = useState(false);
  const replayRef = useRef<() => void>(() => {});

  useEffect(() => {
    const el = root.current;
    const section = el?.closest("section");
    if (!el || !section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; // the markup is the finished compile

    const q = <T extends Element>(sel: string) => Array.from(el.querySelectorAll<T>(sel));
    const clauses = q<HTMLElement>(".v2c-cl");
    const cards = q<HTMLElement>(".v2c-rc");
    const fields = q<HTMLElement>(".v2c-rf-v");
    const toks = q<HTMLElement>(".v2c-tk");
    const clones = q<HTMLElement>(".v2c-flyt");
    const status = el.querySelector<HTMLElement>(".v2c-cstatus-t");
    const bar = el.querySelector<HTMLElement>(".v2c-cbar i");
    const kinds = q<HTMLElement>(".v2c-kind");
    const tokBy = new Map(toks.map((t) => [t.dataset.k!, t]));

    let src: Box[] = [];
    let dst: Box[] = [];
    const measure = () => {
      const o = el.getBoundingClientRect();
      const box = (n?: Element | null): Box => {
        const b = n?.getBoundingClientRect();
        return b ? { x: b.left - o.left, y: b.top - o.top, w: b.width, h: b.height } : { x: 0, y: 0, w: 0, h: 0 };
      };
      src = FLIGHTS.map((f) => box(tokBy.get(f.src)));
      dst = FLIGHTS.map((f) => box(fields[FLIGHTS.indexOf(f)]));
    };

    const last = new Map<Element, string>();
    const setState = (n: Element, cls: string[], on: string) => {
      if (last.get(n) === on) return;
      last.set(n, on);
      cls.forEach((c) => n.classList.toggle(c, c === on));
    };

    let prev = -1;
    const apply = (p: number) => {
      if (Math.abs(p - prev) < 0.0005) return;
      prev = p;
      const out = new Set<string>();
      FLIGHTS.forEach((f, i) => {
        const u = ruleU(p, f.r);
        const t = flightT(u, f.f);
        const c = clones[i];
        const field = fields[i];
        /* the field fades up under the chip as it lands, so the hand-off is continuous */
        const land = smooth((t - 0.8) / 0.2);
        field.classList.toggle("is-in", t >= 1);
        field.style.opacity = land.toFixed(3);
        field.style.transform = `scale(${(0.85 + 0.15 * land).toFixed(3)})`;
        if (t <= 0 || t >= 1) {
          if (c.style.opacity !== "0") c.style.opacity = "0";
          return;
        }
        out.add(f.src);
        const e = ease(t);
        const a = src[i];
        const b = dst[i];
        const x = a.x + (b.x - a.x) * e;
        const y = a.y + (b.y - a.y) * e - Math.sin(Math.PI * t) * 36;
        const s = 1 + Math.sin(Math.PI * t) * 0.14;
        c.style.opacity = (smooth(t / 0.08) * (1 - smooth((t - 0.9) / 0.1))).toFixed(3);
        c.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${s.toFixed(3)})`;
      });
      toks.forEach((t) => t.classList.toggle("is-out", out.has(t.dataset.k!)));
      let building = 0;
      COMPILED.forEach((_, r) => {
        const u = ruleU(p, r);
        setState(clauses[r], ["is-reading", "is-done", "is-waiting"], u >= 1 ? "is-done" : u > 0 ? "is-reading" : "is-waiting");
        setState(cards[r], ["is-empty", "is-building", "is-locked"], u >= 0.96 ? "is-locked" : u > 0.08 ? "is-building" : "is-empty");
        /* the chip stamps in over the last stretch of the slice rather than on one frame */
        const k = smooth((u - 0.8) / 0.2);
        const chip = kinds[r];
        chip.style.opacity = k.toFixed(3);
        chip.style.transform = `scale(${(1.7 - 0.7 * k).toFixed(3)}) rotate(${(-6 * (1 - k)).toFixed(2)}deg)`;
        if (u >= 0.96) building = r + 1;
        else if (u > 0) building = Math.max(building, r + 0.5);
      });
      const done = p >= RUN.done;
      el.classList.toggle("is-compiled", done);
      if (status)
        status.textContent = done
          ? `${COMPILED.length} rules compiled`
          : building === 0
            ? "Ready to compile section 4"
            : `Compiling rule ${Math.min(COMPILED.length, Math.ceil(building + 0.01))} of ${COMPILED.length}`;
      if (bar) bar.style.transform = `scaleX(${clamp01(p / RUN.done).toFixed(3)})`;
    };

    el.classList.add("is-live");
    measure();
    const ro = new ResizeObserver(() => {
      measure();
      const keep = prev;
      prev = -1;
      apply(Math.max(0, keep));
    });
    ro.observe(el);
    document.fonts?.ready.then(() => {
      measure();
      const keep = prev;
      prev = -1;
      apply(Math.max(0, keep));
    });

    const pinned = window.matchMedia("(min-width: 961px) and (min-height: 700px)");
    let raf = 0;
    let from = 0;
    let span = 1;
    /* the run begins while the section is still scrolling in (its top 30% of a viewport below the
       nav) and ends as the pin releases, so scroll always moves the machine */
    const place = () => {
      const r = section.getBoundingClientRect();
      const top = r.top + window.scrollY;
      const lead = window.innerHeight * 0.3;
      from = top - 64 - lead;
      span = Math.max(1, section.offsetHeight - window.innerHeight + 64 + lead);
    };
    /* a light scrub: the shown progress eases toward the scroll position (about 110ms to settle),
       so a wheel's steps read as one continuous run, forwards or back */
    let cur = -1;
    let target = 0;
    let lastT = 0;
    const tick = (now: number) => {
      raf = 0;
      const dt = lastT ? Math.min(64, now - lastT) : 16;
      lastT = now;
      if (cur < 0) cur = target;
      cur += (target - cur) * (1 - Math.exp(-dt / 110));
      if (Math.abs(target - cur) < 0.0006) cur = target;
      apply(cur);
      if (cur !== target) raf = requestAnimationFrame(tick);
      else lastT = 0;
    };
    const onScroll = () => {
      target = clamp01((window.scrollY - from) / span);
      if (!raf) raf = requestAnimationFrame(tick);
    };

    /* phones and short screens: no pin; the compile runs by itself once the panel is in view */
    let timer = 0;
    let io: IntersectionObserver | null = null;
    const runTimed = () => {
      cancelAnimationFrame(timer);
      const t0 = performance.now();
      const step = (now: number) => {
        const p = clamp01((now - t0) / 6200);
        apply(p);
        if (p < 1) timer = requestAnimationFrame(step);
      };
      timer = requestAnimationFrame(step);
    };

    let bodyRo: ResizeObserver | null = null;
    if (pinned.matches) {
      place();
      bodyRo = new ResizeObserver(() => {
        place();
        onScroll();
      });
      bodyRo.observe(document.body);
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    } else {
      el.classList.add("is-timed");
      apply(0);
      replayRef.current = runTimed;
      io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            runTimed();
            io?.disconnect();
          }
        },
        { threshold: 0.35 },
      );
      io.observe(el);
    }
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      cancelAnimationFrame(timer);
      ro.disconnect();
      bodyRo?.disconnect();
      io?.disconnect();
      el.classList.remove("is-live", "is-compiled", "is-timed");
    };
  }, []);

  const light = (r: number) => setLit(r);
  const approve = () => {
    if (approved) return;
    setApproved(true);
    play("stamp");
  };

  return (
    <Card side="dana" title="Section 4, compiled into rules" className="v2c-compile-card">
      <div className="v2c-cstage" ref={root} data-lit={lit ?? undefined} data-approved={approved ? "1" : undefined}>
        <div className="v2c-cstatus">
          <span className="v2c-cstatus-t mono" aria-live="off">
            {COMPILED.length} rules compiled
          </span>
          <span className="v2c-cbar" aria-hidden="true">
            <i />
          </span>
          {/* shown only where the compile runs by itself (phones, short screens) */}
          <button type="button" className="v2c-crun" onClick={() => replayRef.current()}>
            Compile again
          </button>
        </div>
        <div className="v2c-cgrid">
          {/* role="group": a bare <p> may not carry aria-label (axe aria-prohibited-attr) */}
          <p className="v2c-paper" role="group" aria-label="Travel and expense policy, section 4 (sample)">
            {CLAUSES.map((c) => (
              /* an inline toggle: a real <button> cannot flow as running text, so the sentence stays a
                 span with the button role and the keys a button answers to */
              <span
                key={c.r}
                role="button"
                tabIndex={0}
                className="v2c-cl"
                data-r={c.r}
                aria-pressed={lit === c.r}
                onMouseEnter={() => light(c.r)}
                onFocus={() => light(c.r)}
                onClick={() => light(c.r)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    light(c.r);
                  }
                }}
              >
                {c.parts.map((part, k) =>
                  typeof part === "string" ? (
                    <span key={k}>{part}</span>
                  ) : (
                    <span key={k} className="v2c-tk" data-k={part.k}>
                      {part.t}
                    </span>
                  ),
                )}
                <span className="v2c-cl-tag mono">{COMPILED[c.r].id}</span>
              </span>
            ))}
          </p>
          <span className="v2c-cgut mono" aria-hidden="true">
            compile
          </span>
          <ul className="v2c-rcs" aria-label="Compiled rules">
            {COMPILED.map((rule, r) => (
              <li key={rule.id}>
                <button
                  type="button"
                  className="v2c-rc"
                  data-r={r}
                  aria-pressed={lit === r}
                  onMouseEnter={() => light(r)}
                  onFocus={() => light(r)}
                  onClick={() => light(r)}
                >
                  <span className="v2c-rc-h">
                    <span className="mono v2c-rc-id">{rule.id}</span>
                    <span className={`v2c-kind v2c-kind--${rule.kind}`}>{rule.kind === "warn" ? "Warn" : "Block"}</span>
                  </span>
                  {rule.fields.map(([k, v]) => (
                    <span key={k} className="v2c-rf mono">
                      <span className="v2c-rf-k">{k}</span>
                      <span className="v2c-rf-v">{v}</span>
                    </span>
                  ))}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="v2c-fly-layer" aria-hidden="true">
          {FLIGHTS.map((f, i) => (
            <span key={i} className="v2c-flyt mono" style={{ opacity: 0 }}>
              {f.t}
            </span>
          ))}
        </div>
        <div className="v2c-approve-row">
          <Head who="dana" size={30} />
          {approved ? (
            <p className="v2c-stamp" role="status">
              Approved by Dana. Every rule quotes its sentence.
            </p>
          ) : (
            <>
              <span className="v2c-approve-q">Dana reads the set once.</span>
              <button type="button" className="v2c-approve-b" onClick={approve}>
                Approve the rules
              </button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

export function Policy() {
  return (
    <Chapter
      id="policy"
      side="dana"
      figure="dana-review"
      figH={440}
      pin
      title={
        <>
          <span className="v2s-name v2s-name--dana">Dana&rsquo;s</span> part is written once.
        </>
      }
      lede={
        <p>
          Hand Sylph the policy you already have, or answer a dozen questions and Sylph writes one. Every sentence
          compiles to rules that quote it, and nothing checks a charge until Dana approves the set.
        </p>
      }
      token={<Token step={2} state="Rule M-041 is already waiting for it" />}
    >
      <PolicyCompile />
    </Chapter>
  );
}

/* ---------- 3. Verdicts: pick an answer Priya got; the dinner one lets you move the amount ---------- */

const ANSWERS = [
  { id: "united", when: "Sep 11", merchant: "United Airlines", amount: "$412.30", v: "ok" as const, label: "Cleared" },
  { id: "sushi", when: "Sep 12", merchant: CHARGE.merchant, amount: CHARGE.amount, v: "note" as const, label: "Needs a note" },
  { id: "bar", when: "Sep 13", merchant: "Bar Bianco", amount: "$46.90", v: "block" as const, label: "Blocked" },
  { id: "flight", when: "Oct 2", merchant: "Flight to Osaka", amount: "$912.00", v: "ok" as const, label: "In policy" },
];

function AnswerDetail({ id }: { id: string }) {
  if (id === "sushi")
    return (
      <div className="site v2s-site v2c-detail-site">
        <VerdictCard />
      </div>
    );
  if (id === "flight")
    return (
      <div className="v2c-detail-flight">
        <p className="v2c-detail-p">
          Booking her next trip, she sees the same policy before she pays. Fares at the airline&rsquo;s price: no
          markup, no commission, no fee per trip.
        </p>
        <div className="site v2s-site">
          <FaresWindow compact />
        </div>
      </div>
    );
  const united = id === "united";
  return (
    <div className="v2c-detail-plain">
      <span className="v2c-detail-top">
        <strong>{united ? "United Airlines" : "Bar Bianco"}</strong>
        <span className="mono">{united ? "$412.30" : "$46.90"}</span>
        <VerdictChip v={united ? "ok" : "block"} />
      </span>
      <dl className="v2c-dl">
        <div>
          <dt>Rule</dt>
          <dd className="mono">{united ? "T-004, economy under six hours" : "M-022, alcohol not reimbursed"}</dd>
        </div>
        <div>
          <dt>Amount</dt>
          <dd className="mono">{united ? "$412.30, economy, 4h 10m" : "$46.90, bar tab"}</dd>
        </div>
        <div>
          <dt>What happens</dt>
          <dd>{united ? "Filed on her report. Nothing for her to do." : "Kept off her reimbursable total. Her card works as normal."}</dd>
        </div>
      </dl>
    </div>
  );
}

function VerdictPicker() {
  const [i, setI] = useState(1);
  const a = ANSWERS[i];
  return (
    <Card side="priya" title="What Sylph tells her" className="v2c-verdicts">
      <div className="v2c-pick">
        <div className="v2c-pick-list" role="tablist" aria-orientation="vertical" aria-label="Answers Priya got">
          {ANSWERS.map((x, j) => (
            <button
              key={x.id}
              type="button"
              role="tab"
              id={`ans-tab-${x.id}`}
              aria-selected={i === j}
              aria-controls="ans-panel"
              tabIndex={i === j ? 0 : -1}
              className="v2c-pick-b"
              onClick={() => {
                play("tap");
                setI(j);
              }}
              onKeyDown={(e) => tabKeys(e, j, ANSWERS.length, setI)}
            >
              <span className="mono v2c-pick-when">{x.when}</span>
              <span className="v2c-pick-m">{x.merchant}</span>
              <span className="mono v2c-pick-a">{x.amount}</span>
              <span className={`v2s-chip v2s-chip--${x.v}`}>{x.label}</span>
            </button>
          ))}
        </div>
        <div className="v2c-pick-detail" role="tabpanel" id="ans-panel" aria-labelledby={`ans-tab-${a.id}`} key={a.id}>
          <AnswerDetail id={a.id} />
        </div>
      </div>
    </Card>
  );
}

export function Verdicts() {
  return (
    <Chapter
      id="verdicts"
      side="priya"
      figure="priya-snap"
      figH={440}
      title={
        <>
          Every answer <span className="v2s-name v2s-name--priya">Priya</span> gets names its rule.
        </>
      }
      lede={
        <>
          <p>
            Each charge is checked as it happens: Cleared, Needs a note or Blocked, with the rule, the threshold and
            the amount. Blocked keeps a charge off the reimbursable total. It never declines the card.
          </p>
          <p className="v2c-next">
            <span className="v2c-next-tag">In build, not yet available</span> The same rule answering at the card
            terminal, Visa cards first.
          </p>
        </>
      }
      token={<Token step={3} state="Needs a note, and she has already written it" />}
    >
      <VerdictPicker />
    </Chapter>
  );
}

/* ---------- 4. Desk: Approve or Return moves the item; the count and the month strip follow ----------
   Round 5: the charge sits in Dana's queue itself (courier stop 4 is the pill in its row). Her approval
   is what files it: as the courier leaves the desk for month end, the row reads Approved, the strip
   ticks, and the charge drops into its own line on the September report (stop 5). */

type Decision = "approved" | "returned";

/** The courier's position relative to the desk: true once the charge has left for (or reached) the report. */
function useFiled() {
  const [filed, setFiled] = useState(false);
  useEffect(() => {
    const onArrive = (e: Event) => {
      const n = (e as CustomEvent<{ stop: number }>).detail?.stop;
      if (typeof n === "number") setFiled(n >= 5);
    };
    const onDepart = (e: Event) => {
      const d = (e as CustomEvent<{ stop: number; to?: number }>).detail;
      if (d?.stop === 4) setFiled((d.to ?? 5) >= 5);
    };
    window.addEventListener("v2s:arrive", onArrive);
    window.addEventListener("v2s:depart", onDepart);
    return () => {
      window.removeEventListener("v2s:arrive", onArrive);
      window.removeEventListener("v2s:depart", onDepart);
    };
  }, []);
  return filed;
}

function DeskQueue() {
  const [done, setDone] = useState<Record<string, Decision>>({});
  const [flash, setFlash] = useState(false);
  const [leaving, setLeaving] = useState<{ merchant: string; d: Decision } | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const resetRef = useRef<HTMLButtonElement>(null);
  const filed = useFiled();
  const ours = CHARGE.merchant;
  /* our row is answered either by the visitor or by the story (the courier filing it) */
  const oursD: Decision | undefined = done[ours] ?? (filed ? "approved" : undefined);
  const decided = (m: string) => (m === ours ? oursD : done[m]);
  /* our row never leaves the list: it carries the charge, and the answer shows in place */
  const rows = EXCEPTIONS.filter((r) => r.merchant === ours || !done[r.merchant]);
  const waiting = EXCEPTIONS.filter((r) => !decided(r.merchant)).length;
  const approved = EXCEPTIONS.filter((r) => decided(r.merchant) === "approved").length;
  const returned = EXCEPTIONS.filter((r) => decided(r.merchant) === "returned").length;

  useArrival(4, () => {
    setFlash(true);
    window.setTimeout(() => setFlash(false), 1400);
  });

  const commit = (merchant: string, d: Decision, idx: number) => {
    setLeaving(null);
    setDone((s) => ({ ...s, [merchant]: d }));
    // keyboard focus moves to the next open item, or to the reset when the queue is clear
    requestAnimationFrame(() => {
      const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>(".v2c-q-approve");
      const next = buttons?.[Math.min(idx, (buttons?.length ?? 1) - 1)];
      if (next) next.focus();
      else resetRef.current?.focus();
    });
  };
  const decide = (merchant: string, d: Decision, idx: number) => {
    if (leaving) return;
    play("approve");
    // our row answers in place; other approved items leave toward the report, returned ones back toward the traveller
    if (merchant === ours || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return commit(merchant, d, idx);
    setLeaving({ merchant, d });
    window.setTimeout(() => commit(merchant, d, idx), 260);
  };

  return (
    <Card side="dana" title="Dana's September" className="v2c-desk">
      <div className="v2c-strip" aria-hidden="true">
        {ROWS.map((r) => {
          const d = decided(r.merchant);
          const state = r.verdict === "ok" ? "ok" : d ?? r.verdict;
          return (
            <span key={r.merchant} className={`v2c-cell v2c-cell--${state}`} title={r.merchant}>
              {state === "ok" || state === "approved" ? <Tick /> : state === "returned" ? "↩" : ""}
            </span>
          );
        })}
      </div>
      <p className="v2c-strip-cap">
        <span>
          <b className="mono">{CLEARED.length}</b> filed themselves
        </span>
        <span>
          <b className="mono">{EXCEPTIONS.length}</b> reached Dana
        </span>
        <span aria-live="polite">
          <b className="mono">{waiting}</b> still waiting
        </span>
      </p>
      <ul className="v2c-queue" ref={listRef} aria-label={`Dana's queue, ${waiting} waiting`}>
        {rows.map((r, idx) => {
          const mine = r.merchant === ours;
          const d = decided(r.merchant);
          return (
            <li
              key={r.merchant}
              className={`v2c-q${mine ? " is-ours" : ""}${mine && d ? ` is-${d}` : ""}${flash && mine ? " is-flash" : ""}${
                leaving?.merchant === r.merchant ? ` is-leaving--${leaving.d}` : ""
              }`}
            >
              <span className="v2c-q-main">
                <span className="v2c-q-top">
                  {mine ? (
                    /* courier stop 4: the charge itself, waiting in Dana's queue */
                    <span className="v2s-token-pill" data-courier-stop="4">
                      <span className="v2s-token-m">{CHARGE.merchant}</span>
                      <span className="mono">{CHARGE.amount}</span>
                    </span>
                  ) : (
                    <>
                      <strong>{r.merchant}</strong>
                      <span className="mono">{r.amount}</span>
                    </>
                  )}
                  <VerdictChip v={r.verdict} />
                </span>
                <span className="mono v2c-q-cite">{r.cite}</span>
                {mine && (
                  <span className="v2c-q-note">
                    <Head who="priya" size={20} />
                    &ldquo;{CHARGE.note}&rdquo;
                  </span>
                )}
              </span>
              <span className="v2c-q-acts">
                {mine && d ? (
                  <span className={`v2c-q-status v2c-q-status--${d}`} role="status">
                    {d === "approved" ? (
                      <>
                        <Tick /> Approved, on the report
                      </>
                    ) : (
                      "Returned to Priya"
                    )}
                  </span>
                ) : (
                  <>
                    <button type="button" className="v2c-q-b v2c-q-approve" onClick={() => decide(r.merchant, "approved", idx)} aria-label={`Approve ${r.merchant}`}>
                      Approve
                    </button>
                    <button type="button" className="v2c-q-b" onClick={() => decide(r.merchant, "returned", idx)} aria-label={`Return ${r.merchant}`}>
                      Return
                    </button>
                  </>
                )}
              </span>
            </li>
          );
        })}
        {waiting === 0 && (
          <li className="v2c-q-empty">
            <span>
              Queue clear: {approved} approved onto the report, {returned} returned to the traveller for more detail.
            </span>
            <button type="button" className="v2c-q-b" ref={resetRef} onClick={() => setDone({})}>
              Put them back
            </button>
          </li>
        )}
      </ul>
    </Card>
  );
}

/** The step line under a chapter's copy, for chapters whose charge sits inside their panel. */
function StepLine({ step, state }: { step: number; state: string }) {
  return (
    <p className="v2s-token-line v2c-stepline">
      <span className="v2s-token-step mono">{step}/5</span>
      <span className="v2s-token-state">{state}</span>
    </p>
  );
}

export function Desk() {
  return (
    <Chapter
      id="desk"
      side="dana"
      figure="dana-desk"
      figH={300}
      stack
      title={
        <>
          Twenty charges. {EXCEPTIONS.length === 5 ? "Five" : EXCEPTIONS.length} reach{" "}
          <span className="v2s-name v2s-name--dana">Dana</span>.
        </>
      }
      lede={
        <p>
          Everything in policy files itself. What reaches Dana carries its rule, threshold and amount, and the note
          the traveller already wrote. No model sits in the decision: the same charge gets the same answer, every
          time.
        </p>
      }
      token={<StepLine step={4} state="In Dana's queue, with Priya's note. Her approval files it." />}
    >
      <DeskQueue />
    </Chapter>
  );
}

/* ---------- 5. Month end: point at a line to read its citation; each export says what it holds ---------- */

const LINES = [
  { n: 1, d: "Sep 11", m: "United Airlines", a: "412.30", v: "ok" as const, cite: "T-004, economy under six hours. Receipt by email." },
  { n: 2, d: "Sep 12", m: "Lyft", a: "23.15", v: "ok" as const, cite: "G-002, ground transport, in policy. Receipt by upload." },
  { n: 3, d: "Sep 12", m: "Sushi Kanda", a: "84.20", v: "note" as const, cite: "M-041, $9.20 over the $75 cap. Priya's note attached, approved by Dana." },
  { n: 4, d: "Sep 12", m: "Hyatt Regency Denver", a: "258.00", v: "ok" as const, cite: "L-007, under the $350 nightly cap." },
  { n: 5, d: "Sep 13", m: "Bar Bianco", a: "46.90", v: "block" as const, cite: "M-022, alcohol. Kept off the reimbursable total." },
  { n: 6, d: "Sep 13", m: "Amtrak", a: "118.00", v: "ok" as const, cite: "T-011, rail, in policy." },
];

const EXPORTS = [
  { id: "pdf", k: "PDF", say: "Audit-grade statement: every line with its rule, threshold and amount." },
  { id: "xlsx", k: "XLSX", say: "Line items with their rule references, ready to filter." },
  { id: "csv", k: "GL journal CSV", say: "The journal, coded to the accounts you set once." },
  ...(QBO_LIVE ? [{ id: "qbo", k: "QuickBooks Online", say: "Posts the journal to QuickBooks Online." }] : []),
];

function MonthReport() {
  const [line, setLine] = useState(3);
  const [exp, setExp] = useState("pdf");
  const touched = useRef(false);
  useArrival(5, () => {
    if (!touched.current) setLine(3);
  });
  const pick = (n: number) => {
    touched.current = true;
    setLine(n);
  };
  const cur = LINES.find((l) => l.n === line) ?? LINES[2];
  const e = EXPORTS.find((x) => x.id === exp) ?? EXPORTS[0];
  return (
    <Card side="both" title="Priya's September report" className="v2c-report">
      <table className="v2c-rt">
        <caption className="v2c-sr">Report lines. Choose a line to read its citation.</caption>
        <thead>
          <tr>
            <th scope="col">Ln</th>
            <th scope="col">Merchant</th>
            <th scope="col" className="v2c-num">
              Amount
            </th>
            <th scope="col">Verdict</th>
          </tr>
        </thead>
        <tbody>
          {LINES.map((l) => (
            <tr key={l.n} className={line === l.n ? "is-on" : undefined} onMouseEnter={() => pick(l.n)}>
              <td className="mono">{l.n}</td>
              <td>
                <button type="button" className="v2c-rt-b" aria-pressed={line === l.n} onFocus={() => pick(l.n)} onClick={() => pick(l.n)}>
                  {l.m === CHARGE.merchant ? (
                    /* courier stop 5: the charge lands on its own line of the report */
                    <span className="v2s-token-pill" data-courier-stop="5">
                      <span className="v2s-token-m">{CHARGE.merchant}</span>
                      <span className="mono">{CHARGE.amount}</span>
                    </span>
                  ) : (
                    l.m
                  )}
                </button>
              </td>
              <td className="mono v2c-num">{l.a}</td>
              <td>
                <VerdictChip v={l.v} />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td />
            <td>Reimbursable after verdicts</td>
            <td className="mono v2c-num">895.65</td>
            <td className="v2c-closed">Closed Sep 30</td>
          </tr>
        </tfoot>
      </table>
      <p className="v2c-cite-line" aria-live="polite">
        <span className="mono">Line {cur.n}</span> {cur.cite}
      </p>
      <div className="v2c-exports" role="group" aria-label="What your accountant gets">
        {EXPORTS.map((x) => (
          <button key={x.id} type="button" className="v2c-exp" aria-pressed={exp === x.id} onClick={() => setExp(x.id)} onFocus={() => setExp(x.id)}>
            {x.k}
          </button>
        ))}
      </div>
      <p className="v2c-exp-say" aria-live="polite">
        {e.say}
      </p>
    </Card>
  );
}

export function MonthEnd() {
  return (
    <section id="month-end" className="v2s-meet v2c v2c--meet" aria-labelledby="month-end-t">
      <div className="v2s-wrap v2c-grid">
        <div className="v2c-fig">
          <Figure name="together" height={400} />
        </div>
        <div className="v2c-copy">
          <h2 id="month-end-t" className="v2c-h2 v2c-h2--meet">
            They meet at month end. The report is already there.
          </h2>
          <div className="v2c-lede">
            <p>
              Every charge matched, every exception answered, the journal coded for your accountant. Priya sent photos
              and one note. Dana answered five exceptions.
            </p>
          </div>
          <StepLine step={5} state="Filed on line 3 of Priya's September report, closed" />
          <p className="v2c-air">Expenses run on air.</p>
        </div>
        <div className="v2c-panel">
          <MonthReport />
        </div>
      </div>
    </section>
  );
}
