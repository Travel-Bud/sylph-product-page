"use client";

import "./your-month.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { Head } from "./cast";
import { Sample, Tick, VerdictChip } from "./parts";
import type { Verdict } from "./data";
import { play } from "./sound";
import { MONTH, MONTH_CATS, PEOPLE, type MonthCat, type MonthCharge } from "./month-data";

/*
 * "Your month" (round 4, month track). A visitor runs a whole invented month through five editable
 * rules. The check below is a small deterministic function in this file: same rules, same rows, same
 * verdicts. It is a sketch of the idea running in the browser, not Sylph's engine, and the page says so.
 * Pasted CSV is parsed here and never leaves the page.
 * Reduced motion and no script render the sorted month; the pile and the sort only play with motion.
 */

/* ---------- the rules ---------- */

type RuleKey = "dinner" | "hotel" | "alcohol" | "receipt" | "dupes";
type RuleState = Record<RuleKey, { on: boolean; v: number }>;

const DEFAULT_RULES: RuleState = {
  dinner: { on: true, v: 75 },
  hotel: { on: true, v: 350 },
  alcohol: { on: true, v: 0 },
  receipt: { on: true, v: 75 },
  dupes: { on: true, v: 0 },
};

const days = (n: number) => (n === 0 ? "same day" : n === 1 ? "within 1 day" : `within ${n} days`);

const RULES: {
  key: RuleKey;
  code: string;
  name: string;
  step?: number;
  min?: number;
  max?: number;
  show?: (v: number) => string;
  /** the rule as the delta line names it */
  say: (s: { on: boolean; v: number }) => string;
}[] = [
  {
    key: "dinner",
    code: "M-041",
    name: "Dinner cap",
    step: 5,
    min: 25,
    max: 200,
    show: (v) => `$${v}`,
    say: (s) => (s.on ? `Dinner cap $${s.v}` : "Dinner cap off"),
  },
  {
    key: "hotel",
    code: "L-007",
    name: "Hotel, nightly",
    step: 25,
    min: 150,
    max: 600,
    show: (v) => `$${v}`,
    say: (s) => (s.on ? `Nightly cap $${s.v}` : "Nightly cap off"),
  },
  {
    key: "alcohol",
    code: "M-022",
    name: "No alcohol",
    say: (s) => (s.on ? "Alcohol rule on" : "Alcohol rule off"),
  },
  {
    key: "receipt",
    code: "R-003",
    name: "Receipt over",
    step: 25,
    min: 0,
    max: 200,
    show: (v) => `$${v}`,
    say: (s) => (s.on ? (s.v === 0 ? "Receipts on every charge" : `Receipts over $${s.v}`) : "Receipt rule off"),
  },
  {
    key: "dupes",
    code: "D-001",
    name: "Duplicates",
    step: 1,
    min: 0,
    max: 7,
    show: (v) => (v === 0 ? "same day" : `${v} day${v > 1 ? "s" : ""}`),
    say: (s) => (s.on ? `Duplicates ${days(s.v)}` : "Duplicate check off"),
  },
];

/* ---------- the check (deterministic) ---------- */

type Check = { v: Verdict; cite: string; codes: string[] };

const money = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const dayNum = (iso: string) => Math.round(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) / 864e5);
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const shortDate = (iso: string) => `${MON[+iso.slice(5, 7) - 1]} ${+iso.slice(8, 10)}`;

function runRules(rows: MonthCharge[], rs: RuleState): Record<string, Check> {
  // duplicates: the later of two charges by the same person for the same amount, within the window
  const dupOf = new Map<string, MonthCharge>();
  if (rs.dupes.on) {
    const groups = new Map<string, MonthCharge[]>();
    for (const r of rows) {
      const k = `${r.who}|${r.amount.toFixed(2)}`;
      const g = groups.get(k);
      if (g) g.push(r);
      else groups.set(k, [r]);
    }
    for (const g of groups.values()) {
      g.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
      for (let i = 1; i < g.length; i++) if (dayNum(g[i].date) - dayNum(g[i - 1].date) <= rs.dupes.v) dupOf.set(g[i].id, g[i - 1]);
    }
  }

  const out: Record<string, Check> = {};
  for (const r of rows) {
    const fired: { v: Verdict; code: string; cite: string }[] = [];
    const guests = r.guests ?? 1;
    const nights = r.nights ?? 1;
    const perHead = r.amount / guests;
    const perNight = r.amount / nights;

    if (rs.alcohol.on && r.alcohol) fired.push({ v: "block", code: "M-022", cite: `M-022, alcohol, ${money(r.amount)} kept off the total` });
    const d = dupOf.get(r.id);
    if (d) {
      const same = d.date === r.date;
      fired.push({
        v: "note",
        code: "D-001",
        cite: same ? `D-001, same amount and day as ${d.merchant}` : `D-001, same amount as ${d.merchant} on ${shortDate(d.date)}`,
      });
    }
    if (rs.hotel.on && r.category === "Lodging" && perNight > rs.hotel.v) {
      const over = money(perNight - rs.hotel.v);
      fired.push({
        v: "note",
        code: "L-007",
        cite:
          nights > 1
            ? `L-007, ${money(perNight)} a night for ${nights} nights, ${over} over the $${rs.hotel.v} nightly cap`
            : `L-007, ${over} over the $${rs.hotel.v} nightly cap`,
      });
    }
    if (rs.dinner.on && r.meal === "dinner" && perHead > rs.dinner.v) {
      const over = money(perHead - rs.dinner.v);
      fired.push({
        v: "note",
        code: "M-041",
        cite:
          guests > 1
            ? `M-041, ${money(perHead)} a head for ${guests}, ${over} over the $${rs.dinner.v} dinner cap`
            : `M-041, ${over} over the $${rs.dinner.v} dinner cap`,
      });
    }
    if (rs.receipt.on && !r.receipt && r.amount > rs.receipt.v) {
      fired.push({
        v: "note",
        code: "R-003",
        cite: `R-003, no receipt on ${money(r.amount)}, required ${rs.receipt.v === 0 ? "on every charge" : `over $${rs.receipt.v}`}`,
      });
    }

    const codes = fired.map((f) => f.code);
    if (fired.length) {
      const top = fired.find((f) => f.v === "block") ?? fired[0];
      const more = fired.length - 1;
      out[r.id] = { v: top.v, codes, cite: more ? `${top.cite}, and ${more} more rule${more > 1 ? "s" : ""}` : top.cite };
      continue;
    }
    let cite = r.receipt ? "No rule fired, receipt matched" : "No rule fired";
    if (rs.dinner.on && r.meal === "dinner") cite = `M-041, ${money(perHead)}${guests > 1 ? " a head" : ""}, under the $${rs.dinner.v} dinner cap`;
    else if (rs.hotel.on && r.category === "Lodging") cite = `L-007, ${money(perNight)} a night, under the $${rs.hotel.v} cap`;
    else if (rs.receipt.on && !r.receipt) cite = `R-003, ${money(r.amount)}, no receipt needed under $${rs.receipt.v}`;
    out[r.id] = { v: "ok", cite, codes };
  }
  return out;
}

/* ---------- CSV, parsed in the browser only ---------- */

function splitCsvLine(line: string, sep: string): string[] {
  const out: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') q = false;
      else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === sep) {
      out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

function toIso(s: string): string | null {
  const t = s.trim();
  let m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (m) {
    const y = m[3].length === 2 ? `20${m[3]}` : m[3];
    return `${y}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;
  }
  const p = Date.parse(t);
  if (Number.isNaN(p)) return null;
  const d = new Date(p);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function toCat(s: string): { category: MonthCat; alcohol?: boolean } {
  const t = s.toLowerCase();
  if (/alcohol|liquor|wine|beer|spirits/.test(t)) return { category: "Meals", alcohol: true };
  if (/air|flight/.test(t)) return { category: "Airfare" };
  if (/hotel|lodg|accom|stay|motel/.test(t)) return { category: "Lodging" };
  if (/rail|train/.test(t)) return { category: "Rail" };
  if (/meal|food|dinner|lunch|breakfast|restaurant|coffee|cafe|entertain|drink/.test(t)) return { category: "Meals" };
  if (/taxi|ride|uber|lyft|ground|car|rental|parking|mileage|transport|transit/.test(t)) return { category: "Ground" };
  if (/software|saas|subscr|licen/.test(t)) return { category: "Software" };
  return { category: "Office" };
}

const CSV_MAX = 500;

function parseCsv(text: string): { rows: MonthCharge[]; skipped: number } | { error: string } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return { error: "Nothing to read yet. Paste rows of date, merchant, amount, category." };
  const sep = (lines[0].match(/\t/g)?.length ?? 0) > (lines[0].match(/,/g)?.length ?? 0) ? "\t" : lines[0].includes(";") && !lines[0].includes(",") ? ";" : ",";
  let cols = { date: 0, merchant: 1, amount: 2, category: 3, who: 4 };
  const first = splitCsvLine(lines[0], sep).map((h) => h.toLowerCase());
  const isHead = first.some((h) => /date|merchant|amount|category|vendor|description/.test(h));
  if (isHead) {
    const find = (re: RegExp, dflt: number) => {
      const i = first.findIndex((h) => re.test(h));
      return i < 0 ? dflt : i;
    };
    cols = {
      date: find(/date|posted|day/, 0),
      merchant: find(/merchant|vendor|payee|description|name/, 1),
      amount: find(/amount|total|usd|value/, 2),
      category: find(/category|type|class/, 3),
      who: find(/person|employee|who|cardholder|spender/, -1),
    };
  }
  const rows: MonthCharge[] = [];
  let skipped = 0;
  for (const line of lines.slice(isHead ? 1 : 0)) {
    if (rows.length >= CSV_MAX) {
      skipped++;
      continue;
    }
    const f = splitCsvLine(line, sep);
    const date = toIso(f[cols.date] ?? "");
    const amount = Math.abs(parseFloat((f[cols.amount] ?? "").replace(/[^0-9.-]/g, "")));
    const merchant = (f[cols.merchant] ?? "").slice(0, 60);
    if (!date || !merchant || !Number.isFinite(amount) || amount === 0) {
      skipped++;
      continue;
    }
    const { category, alcohol } = toCat(f[cols.category] ?? "");
    const who = (cols.who >= 0 && f[cols.who]?.slice(0, 24)) || "You";
    rows.push({
      id: `U-${String(rows.length + 1).padStart(3, "0")}`,
      date,
      who,
      merchant,
      category,
      amount: Math.round(amount * 100) / 100,
      receipt: true,
      ...(category === "Meals" && !alcohol ? { meal: "dinner" as const } : {}),
      ...(category === "Lodging" ? { nights: 1 } : {}),
      ...(alcohol ? { alcohol: true } : {}),
    });
  }
  if (!rows.length) return { error: "No rows could be read. Each row needs a date, a merchant and an amount." };
  rows.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  return { rows, skipped };
}

/* ---------- people ---------- */

const personName = (id: string) => PEOPLE.find((p) => p.id === id)?.name ?? id;

function Avatar({ who, size = 24 }: { who: string; size?: number }) {
  if (who === "priya") return <Head who="priya" size={size} />;
  return (
    <span className="ym-av" style={{ width: size, height: size }} aria-hidden="true">
      {personName(who).charAt(0).toUpperCase()}
    </span>
  );
}

/* ---------- the tile field ---------- */

type Phase = "pile" | "check" | "sorted";
const LABEL = 30;
const ZGAP = 10;

function fieldGeometry(width: number) {
  const narrow = width < 520;
  const gap = narrow ? 3 : 4;
  const target = narrow ? 21 : 23;
  const cols = Math.max(10, Math.min(26, Math.round((width + gap) / (target + gap))));
  const t = (width - (cols - 1) * gap) / cols;
  return { cols, t, step: t + gap };
}

const VERDICT_RANK: Record<Verdict, number> = { block: 0, note: 1, ok: 2 };

/* ---------- the section ---------- */

type Data = { rows: MonthCharge[]; source: "sample" | "csv"; skipped?: number };

export function YourMonth() {
  const [rules, setRules] = useState<RuleState>(DEFAULT_RULES);
  const [data, setData] = useState<Data>({ rows: MONTH, source: "sample" });
  const [who, setWho] = useState("all");
  const [cat, setCat] = useState<"all" | MonthCat>("all");
  const [tab, setTab] = useState<"dana" | "filed">("dana");
  const [sel, setSel] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("sorted");
  const [width, setWidth] = useState(0);
  const [delta, setDelta] = useState("");
  const [moved, setMoved] = useState<string[]>([]);
  const [csvOpen, setCsvOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [csvErr, setCsvErr] = useState("");
  const [allRows, setAllRows] = useState(false);

  const secRef = useRef<HTMLElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const csvRef = useRef<HTMLTextAreaElement>(null);
  const csvBtnRef = useRef<HTMLButtonElement>(null);
  const timers = useRef<number[]>([]);
  const ran = useRef(false);

  const rows = data.rows;
  const checks = useMemo(() => runRules(rows, rules), [rows, rules]);
  const shown = useMemo(() => rows.filter((r) => (who === "all" || r.who === who) && (cat === "all" || r.category === cat)), [rows, who, cat]);
  const shownIds = useMemo(() => new Set(shown.map((r) => r.id)), [shown]);

  const filed = shown.filter((r) => checks[r.id].v === "ok");
  const exceptions = shown
    .filter((r) => checks[r.id].v !== "ok")
    .sort((a, b) => VERDICT_RANK[checks[a.id].v] - VERDICT_RANK[checks[b.id].v] || a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  const nNote = exceptions.filter((r) => checks[r.id].v === "note").length;
  const nBlock = exceptions.length - nNote;
  const keptOff = exceptions.filter((r) => checks[r.id].v === "block").reduce((s, r) => s + r.amount, 0);
  const total = shown.reduce((s, r) => s + r.amount, 0);
  const catches = (code: string) => shown.filter((r) => checks[r.id].codes.includes(code)).length;

  const people = useMemo(() => {
    if (data.source === "sample") return PEOPLE.map((p) => p.id);
    return Array.from(new Set(rows.map((r) => r.who))).slice(0, 8);
  }, [data.source, rows]);
  const cats = useMemo(() => MONTH_CATS.filter((c) => rows.some((r) => r.category === c)), [rows]);

  /* measure the field; tiles are placed in px from its width */
  useEffect(() => {
    const el = fieldRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.floor(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => () => clearTimers(), []);

  const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* the pile, the check, the sort: once when the section is first seen, and on "Run it again" */
  const run = (n: number) => {
    clearTimers();
    if (reduced()) return setPhase("sorted");
    setPhase("pile");
    later(() => setPhase("check"), 700);
    later(() => setPhase("sorted"), 700 + Math.min(1300, n * 12) + 450);
  };

  useEffect(() => {
    const el = secRef.current;
    if (!el || reduced()) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (ran.current) return;
        if (e.isIntersecting && e.intersectionRatio >= 0.3) {
          ran.current = true;
          io.disconnect();
          run(MONTH.length);
        } else if (!e.isIntersecting) setPhase("pile");
      },
      { threshold: [0, 0.3] },
    );
    io.observe(el);
    return () => io.disconnect();
    // run is stable enough here: it only touches refs and setters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* a rule change re-sorts; tiles that change zone pulse once, the delta line says what moved */
  const changeRule = (key: RuleKey, patch: Partial<{ on: boolean; v: number }>) => {
    const next = { ...rules, [key]: { ...rules[key], ...patch } };
    const after = runRules(rows, next);
    const changed = shown.filter((r) => after[r.id].v !== checks[r.id].v).map((r) => r.id);
    const before = shown.filter((r) => checks[r.id].v !== "ok").length;
    const now = shown.filter((r) => after[r.id].v !== "ok").length;
    const d = now - before;
    const rule = RULES.find((x) => x.key === key)!;
    const what =
      d > 0 ? `${d} more reach${d === 1 ? "es" : ""} Dana` : d < 0 ? `${-d} fewer reach Dana` : changed.length ? `${changed.length} verdict${changed.length > 1 ? "s" : ""} changed` : "no verdict changed";
    setDelta(`${rule.say(next[key])}: ${what}. ${now} of ${shown.length} in her list.`);
    setMoved(changed);
    clearTimers();
    setPhase("sorted");
    later(() => setMoved([]), 1100);
    play(changed.length ? "swish" : "tap");
    setRules(next);
  };

  const resetRules = () => {
    const before = shown.filter((r) => checks[r.id].v !== "ok").length;
    const after = runRules(rows, DEFAULT_RULES);
    const now = shown.filter((r) => after[r.id].v !== "ok").length;
    setRules(DEFAULT_RULES);
    setDelta(`Rules back to the sample policy: ${now} of ${shown.length} reach Dana${now !== before ? "" : ", as before"}.`);
    play(now !== before ? "swish" : "tap");
  };

  const pickWho = (id: string) => {
    setWho(id);
    setSel(null);
    setAllRows(false);
    play("tap");
  };
  const pickCat = (c: "all" | MonthCat) => {
    setCat(c);
    setSel(null);
    setAllRows(false);
    play("tap");
  };

  const select = (id: string, fromField = false) => {
    const next = sel === id && !fromField ? null : id;
    setSel(next);
    play("tap");
    if (next && fromField) {
      const t = checks[id].v === "ok" ? "filed" : "dana";
      setTab(t);
      setAllRows(true);
      requestAnimationFrame(() => {
        const row = document.getElementById(`ym-row-${id}`);
        const list = listRef.current;
        if (row && list) list.scrollTop = row.offsetTop - list.offsetTop - list.clientHeight / 3;
      });
    }
  };

  const openCsv = () => {
    setCsvOpen(true);
    setCsvErr("");
    play("tap");
    requestAnimationFrame(() => csvRef.current?.focus());
  };
  const closeCsv = () => {
    setCsvOpen(false);
    requestAnimationFrame(() => csvBtnRef.current?.focus());
  };
  const runCsv = () => {
    const res = parseCsv(csvText);
    if ("error" in res) {
      setCsvErr(res.error);
      return;
    }
    setData({ rows: res.rows, source: "csv", skipped: res.skipped });
    setWho("all");
    setCat("all");
    setSel(null);
    setTab("dana");
    setDelta("");
    setCsvOpen(false);
    play("swish");
    run(res.rows.length);
    requestAnimationFrame(() => csvBtnRef.current?.focus());
  };
  const backToSample = () => {
    setData({ rows: MONTH, source: "sample" });
    setWho("all");
    setCat("all");
    setSel(null);
    setDelta("");
    play("swish");
    run(MONTH.length);
  };

  /* ---------- tile positions ---------- */
  const geo = width > 0 ? fieldGeometry(width) : null;
  const sorted = phase === "sorted";
  const order0 = sorted
    ? [...filed].sort((a, b) => MONTH_CATS.indexOf(a.category) - MONTH_CATS.indexOf(b.category) || a.date.localeCompare(b.date) || a.id.localeCompare(b.id))
    : shown;
  const order1 = sorted ? exceptions : [];
  const pos = new Map<string, { x: number; y: number; k: number }>();
  let y1 = LABEL;
  let height = 0;
  if (geo) {
    const { cols, step } = geo;
    order0.forEach((r, i) => pos.set(r.id, { x: (i % cols) * step, y: LABEL + Math.floor(i / cols) * step, k: i }));
    const rows0 = Math.max(1, Math.ceil(order0.length / cols));
    y1 = LABEL + rows0 * step + ZGAP;
    order1.forEach((r, i) => pos.set(r.id, { x: (i % cols) * step, y: y1 + LABEL + Math.floor(i / cols) * step, k: i }));
    height = LABEL + (Math.ceil(rows.length / cols) + 1) * step + ZGAP + LABEL;
  }
  // tiles filtered out fade where the whole month would place them
  const home = new Map<string, { x: number; y: number }>();
  if (geo) rows.forEach((r, i) => home.set(r.id, { x: (i % geo.cols) * geo.step, y: LABEL + Math.floor(i / geo.cols) * geo.step }));
  const chrono = new Map(shown.map((r, i) => [r.id, i]));

  const zone0 = (
    <span className="ym-zone-k">
      {sorted ? (
        <>
          <Tick className="ym-zone-tick" /> Filed itself <b className="mono">{filed.length}</b>
        </>
      ) : (
        <>
          The pile, by date <b className="mono">{shown.length}</b>
        </>
      )}
    </span>
  );
  const zone1 = (
    <span className={`ym-zone-k ym-zone-k--dana${sorted ? "" : " is-away"}`} style={geo ? { transform: `translateY(${y1}px)` } : undefined}>
      <Head who="dana" size={20} /> Reached Dana <b className="mono">{exceptions.length}</b>
    </span>
  );
  const tile = (r: MonthCharge, i: number) => {
    const vis = shownIds.has(r.id);
    const p = pos.get(r.id) ?? home.get(r.id);
    const v = checks[r.id].v;
    const ci = chrono.get(r.id) ?? i;
    const tilt = sorted ? 0 : ((ci * 37) % 9) - 4;
    const style: React.CSSProperties | undefined = p
      ? ({
          transform: `translate3d(${p.x}px, ${p.y}px, 0) rotate(${tilt}deg)`,
          "--d": `${phase === "check" ? ci * 12 : Math.min((pos.get(r.id)?.k ?? 0) * 6, 420)}ms`,
        } as React.CSSProperties)
      : undefined;
    return (
      <span
        key={r.id}
        data-id={r.id}
        title={`${r.merchant}, ${money(r.amount)}`}
        className={`ym-tile ym-tile--${v}${vis ? "" : " is-hidden"}${sel === r.id ? " is-sel" : ""}${moved.includes(r.id) ? " is-moved" : ""}`}
        style={style}
      >
        <i>{v === "ok" ? <Tick /> : null}</i>
      </span>
    );
  };

  const exShown = tab === "dana" ? exceptions : [];
  const sourceLabel = data.source === "sample" ? "September" : "Your CSV";

  return (
    <section id="your-month" ref={secRef} className="ym" aria-labelledby="your-month-t">
      <div className="v2s-wrap ym-grid">
        <header className="ym-head">
          <h2 id="your-month-t" className="ym-h2">
            Run a whole month. <span className="ym-h2-2">Dana sees the short list.</span>
          </h2>
          <div className="ym-lede">
            <p>
              {MONTH.length} invented charges from six people, checked against five rules you can change. Move a threshold and
              every verdict recomputes, each naming its rule, threshold and amount.
            </p>
            <p className="ym-honest">A small checker running on this page to show the idea, not Sylph&rsquo;s engine. Nothing is sent anywhere.</p>
          </div>
        </header>

        {/* ---------- rules ---------- */}
        <div className="ym-card ym-rules" role="group" aria-labelledby="ym-rules-t">
          <div className="ym-card-head">
            <h3 id="ym-rules-t" className="ym-card-k">
              Your rules
            </h3>
            <span className="ym-card-tags">
              <button type="button" className="ym-textbtn" onClick={resetRules}>
                Reset
              </button>
              <Sample />
            </span>
          </div>
          <ul className="ym-rule-list">
            {RULES.map((r) => {
              const s = rules[r.key];
              const n = catches(r.code);
              return (
                <li key={r.key} className={`ym-rule${s.on ? "" : " is-off"}`}>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={s.on}
                    className="ym-switch"
                    onClick={() => changeRule(r.key, { on: !s.on })}
                    aria-label={`${r.code} ${r.name}`}
                  >
                    <i aria-hidden="true" />
                  </button>
                  <span className="ym-rule-txt">
                    <span className="ym-rule-name">
                      <span className="mono ym-rule-code">{r.code}</span> {r.name}
                    </span>
                    <span className={`mono ym-catch${n && s.on ? " is-hit" : ""}`}>
                      <b>{s.on ? n : 0}</b> caught
                    </span>
                  </span>
                  {r.step !== undefined ? (
                    <span className="ym-step">
                      <button
                        type="button"
                        className="ym-step-b"
                        disabled={!s.on || s.v <= (r.min ?? 0)}
                        onClick={() => changeRule(r.key, { v: Math.max(r.min ?? 0, s.v - r.step!) })}
                        aria-label={`Lower: ${r.name}`}
                      >
                        <span aria-hidden="true">&minus;</span>
                      </button>
                      <output className="mono ym-step-v" aria-live="off">
                        {r.show!(s.v)}
                      </output>
                      <button
                        type="button"
                        className="ym-step-b"
                        disabled={!s.on || s.v >= (r.max ?? 0)}
                        onClick={() => changeRule(r.key, { v: Math.min(r.max ?? 0, s.v + r.step!) })}
                        aria-label={`Raise: ${r.name}`}
                      >
                        <span aria-hidden="true">+</span>
                      </button>
                    </span>
                  ) : (
                    <span className="ym-step ym-step--none">Blocked</span>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="ym-delta" aria-live="polite">
            {delta || "Change a threshold. The same rules give the same answers, every time."}
          </p>
        </div>

        {/* ---------- filters ---------- */}
        <div className="ym-filters">
          <div className="ym-chips" role="group" aria-label="Filter by person">
            <span className="ym-chips-k">Who</span>
            <div className="ym-chips-row">
              <button type="button" className="ym-chip" aria-pressed={who === "all"} onClick={() => pickWho("all")}>
                Everyone
              </button>
              {people.map((p) => (
                <button key={p} type="button" className="ym-chip" aria-pressed={who === p} onClick={() => pickWho(p)}>
                  <Avatar who={p} size={20} />
                  {personName(p)}
                </button>
              ))}
            </div>
          </div>
          <div className="ym-chips" role="group" aria-label="Filter by category">
            <span className="ym-chips-k">What</span>
            <div className="ym-chips-row">
              <button type="button" className="ym-chip" aria-pressed={cat === "all"} onClick={() => pickCat("all")}>
                All
              </button>
              {cats.map((c) => (
                <button key={c} type="button" className="ym-chip" aria-pressed={cat === c} onClick={() => pickCat(c)}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ---------- the month, as tiles ---------- */}
        <div className="ym-card ym-month">
          <div className="ym-card-head">
            <h3 className="ym-card-k">
              {sourceLabel}
              {data.source === "csv" ? <span className="ym-yours">Your data, this browser only</span> : <Sample />}
            </h3>
            <span className="ym-card-tags">
              <button type="button" className="ym-textbtn" onClick={() => (play("swish"), run(shown.length))}>
                Run it again
              </button>
              {data.source === "csv" ? (
                <button type="button" className="ym-textbtn" onClick={backToSample}>
                  Sample month
                </button>
              ) : (
                <button type="button" className="ym-textbtn" ref={csvBtnRef} onClick={openCsv} aria-expanded={csvOpen} aria-controls="ym-csv">
                  Paste a CSV
                </button>
              )}
            </span>
          </div>

          <div className="ym-stage">
            <div
              ref={fieldRef}
              className={`ym-field ym-field--${phase}${geo ? "" : " is-static"}`}
              style={geo ? ({ height, "--t": `${geo.t}px` } as React.CSSProperties) : undefined}
              aria-hidden="true"
              onClick={(e) => {
                if (!window.matchMedia("(pointer: fine)").matches) return;
                const id = (e.target as HTMLElement).closest<HTMLElement>("[data-id]")?.dataset.id;
                if (id) select(id, true);
              }}
            >
              {geo ? (
                <>
                  {zone0}
                  {zone1}
                  {rows.map(tile)}
                </>
              ) : (
                <>
                  {zone0}
                  {order0.map(tile)}
                  {zone1}
                  {order1.map(tile)}
                </>
              )}
            </div>

            {csvOpen && (
              <div className="ym-csv" id="ym-csv" role="group" aria-labelledby="ym-csv-t">
                <label id="ym-csv-t" htmlFor="ym-csv-in" className="ym-csv-k">
                  Paste your own charges
                </label>
                <p className="ym-csv-help">
                  One row per charge: <span className="mono">date, merchant, amount, category</span>, and a person if you like. Read in
                  this browser only: nothing is sent or stored. Meals are checked as dinners, hotels as one night, receipts as
                  attached.
                </p>
                <textarea
                  id="ym-csv-in"
                  ref={csvRef}
                  className="mono ym-csv-in"
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") closeCsv();
                  }}
                  placeholder={"2026-09-12, Sushi Kanda, 84.20, Meals\n2026-09-12, Hyatt Regency Denver, 412.00, Hotel"}
                  spellCheck={false}
                  rows={5}
                />
                {csvErr && (
                  <p className="ym-csv-err" role="alert">
                    {csvErr}
                  </p>
                )}
                <div className="ym-csv-acts">
                  <button type="button" className="ym-btn ym-btn--ink" onClick={runCsv}>
                    Run my charges
                  </button>
                  <button type="button" className="ym-btn" onClick={closeCsv}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <p className={`ym-tally${sorted ? "" : " is-waiting"}`} aria-live="polite">
            <span>
              <b className="mono">{shown.length}</b> charges
            </span>
            <span className="ym-op">=</span>
            <span className="ym-t-ok">
              <b className="mono">{filed.length}</b> filed
            </span>
            <span className="ym-op">+</span>
            <span className="ym-t-note">
              <b className="mono">{nNote}</b> {nNote === 1 ? "needs" : "need"} a note
            </span>
            <span className="ym-op">+</span>
            <span className="ym-t-block">
              <b className="mono">{nBlock}</b> blocked
            </span>
          </p>
          <p className="ym-sum">
            <span>
              Charged <b className="mono">{money(total)}</b>
            </span>
            <span>
              Kept off the reimbursable total <b className="mono">{money(keptOff)}</b>
            </span>
            {data.source === "csv" && data.skipped ? <span>{data.skipped === 1 ? "1 row" : `${data.skipped} rows`} skipped</span> : null}
          </p>
        </div>

        {/* ---------- what Dana sees ---------- */}
        <div className="ym-card ym-list">
          <div className="ym-card-head">
            <h3 className="ym-card-k ym-list-k">
              <Head who="dana" size={28} />
              <span>
                This is the part Dana sees
                <span className="ym-list-sub">
                  <b className="mono">{exceptions.length}</b> of <b className="mono">{shown.length}</b>. The other{" "}
                  <b className="mono">{filed.length}</b> filed themselves.
                </span>
              </span>
            </h3>
          </div>
          <div className="ym-tabs" role="tablist" aria-label="Charges">
            {(
              [
                ["dana", `Reached Dana`, exceptions.length],
                ["filed", "Filed", filed.length],
              ] as const
            ).map(([id, label, n], i) => (
              <button
                key={id}
                type="button"
                role="tab"
                id={`ym-tab-${id}`}
                aria-selected={tab === id}
                aria-controls="ym-panel"
                tabIndex={tab === id ? 0 : -1}
                className="ym-tab"
                onClick={() => {
                  setTab(id);
                  setAllRows(false);
                  play("tap");
                }}
                onKeyDown={(e) => {
                  if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
                    e.preventDefault();
                    const j = i === 0 ? 1 : 0;
                    const next = j === 0 ? "dana" : "filed";
                    setTab(next);
                    document.getElementById(`ym-tab-${next}`)?.focus();
                  }
                }}
              >
                {label} <b className="mono">{n}</b>
              </button>
            ))}
            <span className="ym-tabs-tag">{data.source === "csv" ? <span className="ym-yours">Your data</span> : <Sample />}</span>
          </div>
          <div
            id="ym-panel"
            role="tabpanel"
            aria-labelledby={`ym-tab-${tab}`}
            ref={listRef}
            className={`ym-panel${allRows ? " is-all" : ""}`}
            data-lenis-prevent=""
            tabIndex={0}
          >
            {tab === "dana" ? (
              exShown.length ? (
                <ul className="ym-rows">
                  {exShown.map((r, i) => (
                    <Row key={r.id} r={r} c={checks[r.id]} open={sel === r.id} onPick={() => select(r.id)} extra={i >= 6} flag={moved.includes(r.id)} />
                  ))}
                </ul>
              ) : (
                <p className="ym-empty">Nothing reaches Dana with these rules and filters. Every charge shown filed itself.</p>
              )
            ) : (
              <FiledGroups rows={filed} checks={checks} sel={sel} onPick={select} />
            )}
          </div>
          {(tab === "dana" ? exceptions.length : filed.length) > 6 && (
            <button type="button" className="ym-more" onClick={() => (setAllRows((a) => !a), play("tap"))} aria-expanded={allRows} aria-controls="ym-panel">
              {allRows ? "Show fewer" : `Show all ${tab === "dana" ? exceptions.length : filed.length}`}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function Row({ r, c, open, onPick, extra, flag = false }: { r: MonthCharge; c: Check; open: boolean; onPick: () => void; extra: boolean; flag?: boolean }) {
  return (
    <li id={`ym-row-${r.id}`} className={`ym-row${open ? " is-open" : ""}${flag ? " is-new" : ""}`} data-extra={extra ? "" : undefined}>
      <button type="button" className="ym-row-b" aria-expanded={open} onClick={onPick}>
        <Avatar who={r.who} size={26} />
        <span className="ym-row-main">
          <span className="ym-row-top">
            <strong>{r.merchant}</strong>
            <span className="mono ym-row-amt">{money(r.amount)}</span>
          </span>
          <span className="ym-row-meta">
            <span>
              {shortDate(r.date)}, {personName(r.who)}, {r.category}
            </span>
            {c.v !== "ok" && <VerdictChip v={c.v} />}
          </span>
          <span className="mono ym-row-cite">{c.cite}</span>
          {open && <span className="ym-row-more">{detail(r)}</span>}
        </span>
      </button>
    </li>
  );
}

function detail(r: MonthCharge): string {
  const bits: string[] = [];
  if (r.meal) bits.push(`${r.meal[0].toUpperCase()}${r.meal.slice(1)}${r.guests && r.guests > 1 ? ` for ${r.guests}` : ""}.`);
  if (r.nights) bits.push(`${r.nights} night${r.nights > 1 ? "s" : ""} on the folio.`);
  if (r.alcohol) bits.push("Bar tab, all alcohol.");
  if (r.fx) {
    const sym = { GBP: "£", EUR: "€", JPY: "¥", CAD: "CA$" }[r.fx.code];
    const amt = r.fx.code === "JPY" ? r.fx.amount.toLocaleString("en-US") : r.fx.amount.toFixed(2);
    bits.push(`${sym}${amt} at ${r.fx.rate} on the receipt date.`);
  }
  bits.push(r.receipt ? "Receipt matched." : "No receipt.");
  bits.push(`Charge ${r.id}.`);
  return bits.join(" ");
}

function FiledGroups({
  rows,
  checks,
  sel,
  onPick,
}: {
  rows: MonthCharge[];
  checks: Record<string, Check>;
  sel: string | null;
  onPick: (id: string) => void;
}) {
  if (!rows.length) return <p className="ym-empty">Nothing filed with these rules and filters.</p>;
  const groups = MONTH_CATS.map((c) => ({
    c,
    g: rows.filter((r) => r.category === c).sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id)),
  }))
    .filter((x) => x.g.length)
    .map((x, i, all) => ({ ...x, start: all.slice(0, i).reduce((s, y) => s + y.g.length, 0) }));
  return (
    <div className="ym-groups">
      {groups.map(({ c, g, start }) => {
        return (
          <section key={c} className="ym-group" data-extra={start >= 6 ? "" : undefined} aria-label={`${c}, ${g.length} filed`}>
            <h4 className="ym-group-k">
              <span>{c}</span>
              <span className="mono">
                {g.length} <span className="ym-group-sum">{money(g.reduce((s, r) => s + r.amount, 0))}</span>
              </span>
            </h4>
            <ul className="ym-rows">
              {g.map((r, i) => (
                <Row key={r.id} r={r} c={checks[r.id]} open={sel === r.id} onPick={() => onPick(r.id)} extra={start + i >= 6} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
