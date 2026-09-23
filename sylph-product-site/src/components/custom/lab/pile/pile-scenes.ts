/*
 * The six states of the graphic, one per story step. Pure geometry: each scene says where every mark
 * goes and when (moves), what it looks like and when (looks), which guides the canvas draws, and which
 * HTML labels sit over it. Times are ms from the step becoming active. The graphic plays a scene from
 * those times, or settles it at once (scrolling back, reduced motion) from `settle`.
 */
import {
  CAPS,
  CLEARED,
  COUNTS,
  CUR_NAME,
  EXCEPTIONS,
  MARKS,
  REPORT_CATS,
  printedOf,
  shortDate,
  usd,
  type Channel,
  type Cur,
  type Row,
  type Verdict,
} from "./pile-data";

export type Look = "slip" | "empty" | "matched" | "faded" | "focus" | Verdict;
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
}
export interface Move {
  t: number;
  box: Box;
  dur: number;
  /** travel along a curve (two control points) instead of a straight line */
  c?: [Pt, Pt];
}
export interface LookKey {
  t: number;
  look: Look;
}
export type Pt = [number, number];
export type Tone = "hair" | "trail" | "mute" | "ink" | "amber";
type Phase = { t: number; phase?: "a" | "b"; over?: boolean };
export type Guide = Phase &
  (
    | { k: "line"; a: Pt; b: Pt; tone: Tone; dash?: number[]; draw?: boolean; w?: number }
    | { k: "curve"; p: [Pt, Pt, Pt, Pt]; tone: Tone; dash?: number[]; draw?: boolean; w?: number }
    | { k: "rect"; x: number; y: number; w: number; h: number; tone: Tone }
    | { k: "node"; x: number; y: number; s: number }
    | { k: "ghost"; x: number; y: number; s: number }
    | { k: "sweep"; x0: number; x1: number; y0: number; y1: number; dur: number }
  );
export interface Label {
  key: string;
  x: number;
  y: number;
  text: string;
  meta?: string;
  right?: string;
  sub?: string;
  cls?: string;
  w?: number;
  swatch?: Look;
  t?: number;
  phase?: "a" | "b";
}
export interface Particle {
  i: number;
  t: number;
  dur: number;
  p: [Pt, Pt, Pt, Pt];
}
export interface Scene {
  moves: Move[][];
  looks: LookKey[][];
  settle: { box: Box[]; look: Look[] };
  guides: Guide[];
  labels: Label[];
  particles: Particle[];
  /** labels and guides marked phase "a" give way to phase "b" here */
  phaseAt?: number;
  end: number;
}
export interface Geo {
  W: number;
  H: number;
  mobile: boolean;
}

/* ---------- helpers ---------- */

const N = MARKS.length;
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const pad = (g: Geo) => (g.mobile ? 16 : 28);
const top = (g: Geo) => (g.mobile ? 10 : 22);
const bot = (g: Geo) => (g.mobile ? 8 : 26);

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function logX(lo: number, hi: number, x0: number, x1: number) {
  const a = Math.log10(lo);
  const b = Math.log10(hi);
  return (v: number) => x0 + ((Math.log10(clamp(v, lo, hi)) - a) / (b - a)) * (x1 - x0);
}

/** Beeswarm for square marks: vertical offsets so no two overlap, smallest offset first. */
function swarm(xs: number[], d: number): number[] {
  const order = xs.map((_, i) => i).sort((a, b) => xs[a] - xs[b]);
  const placed: Pt[] = [];
  const out = new Array<number>(xs.length).fill(0);
  for (const i of order) {
    const x = xs[i];
    const near = placed.filter((p) => Math.abs(p[0] - x) < d);
    const cands = [0, ...near.flatMap((p) => [p[1] + d, p[1] - d])].sort((a, b) => Math.abs(a) - Math.abs(b) || b - a);
    const y = cands.find((c) => near.every((p) => Math.abs(p[1] - c) >= d - 0.01)) ?? 0;
    placed.push([x, y]);
    out[i] = y;
  }
  return out;
}

/** Fit a swarm into a band: shrink the spacing if the offsets would spill. */
function fitSwarm(xs: number[], s: number, gap: number, half: number) {
  let d = s + gap;
  let ys = swarm(xs, d);
  for (let k = 0; k < 6; k++) {
    const m = Math.max(0, ...ys.map(Math.abs));
    if (m + s / 2 <= half) break;
    d *= 0.88;
    ys = swarm(xs, d);
  }
  const m = Math.max(0, ...ys.map(Math.abs));
  const squeeze = m + s / 2 > half ? (half - s / 2) / m : 1;
  return ys.map((y) => y * squeeze);
}

const sq = (x: number, y: number, s: number): Box => ({ x, y, w: s, h: s, r: 0 });

function blank(): Pick<Scene, "moves" | "looks"> {
  return { moves: MARKS.map(() => []), looks: MARKS.map(() => []) };
}

/* ---------- 0. the pile ---------- */

function pile(g: Geo): Scene {
  const r = rng(20260922);
  const sw = g.mobile ? 31 : 52;
  const sh = g.mobile ? 40 : 68;
  const heapW = Math.min(g.W - 2 * pad(g) + (g.mobile ? 8 : 0), g.mobile ? 420 : 820);
  const heapH = g.mobile ? Math.min(290, g.H - top(g) - bot(g) - 40) : Math.min(g.H - top(g) - bot(g) - 70, 620);
  const base = g.mobile ? top(g) + (g.H - top(g) - bot(g) + heapH) / 2 - 6 : g.H - bot(g) - 40;
  const cx = g.W / 2;
  /* the month piles up in the order it posted: early charges low, late ones on top */
  const us = MARKS.map(() => 1 - Math.pow(1 - r(), 0.66)).sort((a, b) => a - b);
  const box: Box[] = MARKS.map((_, i) => {
    const u = clamp(us[i] + (r() - 0.5) * 0.1);
    const hw = (heapW / 2 - sw / 2) * Math.pow(1 - u, 0.8);
    const k = 0.9 + r() * 0.18;
    return {
      x: cx + (r() * 2 - 1) * hw,
      y: base - (sh * k) / 2 - u * (heapH - sh),
      w: sw * k,
      h: sh * k,
      r: (r() * 2 - 1) * 0.6,
    };
  });
  const { moves, looks } = blank();
  box.forEach((b, i) => {
    moves[i].push({ t: 0, box: b, dur: 480 });
    looks[i].push({ t: 0, look: "slip" });
  });
  const labels: Label[] = [
    {
      key: "cap",
      x: cx,
      y: g.mobile ? base + 12 : g.H - bot(g) - 14,
      text: g.mobile ? "One slip, one charge. Sep 1 at the bottom, Sep 30 on top." : "One slip, one card charge, piled in the order they posted: Sep 1 at the bottom, Sep 30 on top.",
      cls: "is-cap is-c",
    },
  ];
  return { moves, looks, settle: { box, look: box.map(() => "slip") }, guides: [], labels, particles: [], end: 520 };
}

/** The intro: the month drops onto the pile in posting order. */
export function pileIntro(g: Geo, scene: Scene): { from: Box[]; moves: Move[][] } {
  const r = rng(7);
  const from = scene.settle.box.map((b) => ({ ...b, x: b.x + (r() - 0.5) * 120, y: -80 - r() * 160, r: b.r + (r() - 0.5) * 1.4 }));
  const moves = scene.settle.box.map((b, i) => [{ t: 40 + i * 5, box: b, dur: 460 }]);
  return { from, moves };
}

/* ---------- the calendar (1 and 3) ---------- */

function calendar(g: Geo) {
  const x0 = pad(g);
  const x1 = g.W - pad(g);
  const cw = (x1 - x0) / 30;
  const w = Math.min(cw - (g.mobile ? 2.5 : 5), 26);
  const gap = g.mobile ? 2 : 3;
  const base = g.H - bot(g) - (g.mobile ? 22 : 34);
  const h = g.mobile ? 12 : Math.max(20, Math.min(34, (base - top(g) - 300) / 7 - gap));
  const stack = new Map<number, number>();
  const box = MARKS.map((m) => {
    const k = stack.get(m.day) ?? 0;
    stack.set(m.day, k + 1);
    return { x: x0 + (m.day - 0.5) * cw, y: base - k * (h + gap) - h / 2, w, h, r: 0 };
  });
  const days: Label[] = [1, 8, 15, 22, 30].map((d) => ({
    key: `d${d}`,
    x: x0 + (d - 0.5) * cw,
    y: base + (g.mobile ? 6 : 10),
    text: d === 1 ? "Sep 1" : String(d),
    cls: "is-tick is-c",
  }));
  const guides: Guide[] = [{ k: "line", a: [x0, base + 2], b: [x1, base + 2], tone: "hair", t: 0 }];
  return { box, x0, x1, cw, h, base, days, guides };
}

/* ---------- 1. receipts find their charges ---------- */

const CHANNELS: { c: Channel; name: string; n: number }[] = [
  { c: "text", name: "Texted", n: COUNTS.text },
  { c: "email", name: "Emailed", n: COUNTS.email },
  { c: "upload", name: "Uploaded", n: COUNTS.upload },
];

function receipts(g: Geo): Scene {
  const cal = calendar(g);
  const sy = top(g) + (g.mobile ? 20 : 34);
  const src: Record<Channel, Pt> = {
    text: [cal.x0 + (cal.x1 - cal.x0) * 0.17, sy],
    email: [cal.x0 + (cal.x1 - cal.x0) * 0.5, sy],
    upload: [cal.x0 + (cal.x1 - cal.x0) * 0.83, sy],
  };
  const { moves, looks } = blank();
  const particles: Particle[] = [];
  const guides: Guide[] = [...cal.guides];
  const withReceipt = MARKS.filter((m) => m.receipt);
  const FLY = 380;
  MARKS.forEach((m, i) => {
    moves[i].push({ t: (m.day / 30) * 100, box: cal.box[i], dur: 480 });
    looks[i].push({ t: 0, look: "empty" });
  });
  withReceipt.forEach((m, k) => {
    const [x, y] = src[m.channel!];
    const b = cal.box[m.n];
    const ey = b.y - b.h / 2;
    const p: [Pt, Pt, Pt, Pt] = [
      [x, y + 6],
      [x, y + (ey - y) * 0.55],
      [b.x, y + (ey - y) * 0.42],
      [b.x, ey],
    ];
    const t = 240 + (k / withReceipt.length) * 340;
    particles.push({ i: m.n, t, dur: FLY, p });
    looks[m.n].push({ t: t + FLY, look: "matched" });
    guides.push({ k: "curve", p, tone: "trail", t: t + FLY * 0.5 });
  });
  CHANNELS.forEach(({ c }) => guides.push({ k: "node", x: src[c][0], y: src[c][1], s: g.mobile ? 7 : 9, t: 150 }));
  const labels: Label[] = [
    ...cal.days,
    ...CHANNELS.map(({ c, name, n }) => ({
      key: `src-${c}`,
      x: src[c][0],
      y: src[c][1] - (g.mobile ? 8 : 12),
      text: name,
      right: String(n),
      cls: "is-src is-c is-b",
      t: 150,
    })),
    {
      key: "leg-a",
      x: cal.x0,
      y: cal.base - 7 * (cal.h + (g.mobile ? 2 : 3)) - (g.mobile ? 30 : 44),
      text: "Receipt found its charge",
      swatch: "matched",
      cls: "is-leg",
      t: 450,
    },
    {
      key: "leg-b",
      x: cal.x0,
      y: cal.base - 7 * (cal.h + (g.mobile ? 2 : 3)) - (g.mobile ? 14 : 24),
      text: "No receipt",
      swatch: "empty",
      cls: "is-leg",
      t: 450,
    },
  ];
  const settle = { box: cal.box, look: MARKS.map((m) => (m.receipt ? "matched" : "empty") as Look) };
  return { moves, looks, settle, guides, labels, particles, end: 240 + 340 + FLY + 60 };
}

/* ---------- 2. currencies, as printed and then in dollars ---------- */

const CURS: Cur[] = ["USD", "GBP", "EUR", "JPY", "CAD"];

function currencies(g: Geo): Scene {
  const labelW = g.mobile ? 0 : 150;
  const x0 = pad(g) + labelW + (g.mobile ? 4 : 0);
  const x1 = g.W - pad(g) - (g.mobile ? 4 : 16);
  const sx = logX(2, 300000, x0, x1);
  const s = g.mobile ? 7 : 10;
  const rowHead = g.mobile ? 18 : 0;
  const axisH = g.mobile ? 30 : 44;
  const y0 = top(g) + (g.mobile ? 4 : 14);
  const avail = g.H - bot(g) - axisH - y0;
  const weight = (c: Cur) => (c === "USD" ? 1.55 : 1);
  const totalW = CURS.reduce((a, c) => a + weight(c), 0);
  const PHASE = 500;

  const printedBox: Box[] = [];
  const usdBox: Box[] = [];
  const hop: [Pt, Pt][] = [];
  const guides: Guide[] = [];
  const labels: Label[] = [];
  let y = y0;
  CURS.forEach((c, ci) => {
    const band = (avail * weight(c)) / totalW;
    const cy = y + rowHead + (band - rowHead) / 2;
    const members = MARKS.filter((m) => m.cur === c);
    const half = (band - rowHead) / 2 - 2;
    const pxs = members.map((m) => sx(m.printed));
    const uxs = members.map((m) => sx(m.usd));
    const pys = fitSwarm(pxs, s, g.mobile ? 1.5 : 2, half);
    const uys = fitSwarm(uxs, s, g.mobile ? 1.5 : 2, half);
    members.forEach((m, k) => {
      printedBox[m.n] = sq(pxs[k], cy + pys[k], s);
      usdBox[m.n] = sq(uxs[k], cy + uys[k], s);
      if (c !== "USD") {
        const a: Pt = [pxs[k], cy + pys[k]];
        const b: Pt = [uxs[k], cy + uys[k]];
        const lift = Math.min(12 + Math.abs(b[0] - a[0]) * 0.22, half + 6);
        hop[m.n] = [
          [a[0], Math.min(a[1], b[1]) - lift],
          [b[0], Math.min(a[1], b[1]) - lift],
        ];
        guides.push({ k: "ghost", x: a[0], y: a[1], s, t: PHASE, phase: "b" });
        guides.push({ k: "curve", p: [a, hop[m.n][0], hop[m.n][1], b], tone: "trail", t: PHASE + 40, phase: "b", draw: true });
      }
    });
    if (ci > 0) guides.push({ k: "line", a: [g.mobile ? pad(g) : pad(g), y], b: [x1, y], tone: "hair", t: 100 });
    const rate = c === "USD" ? "no conversion" : `1 ${c} = $${members[0].rate}`;
    if (g.mobile) {
      labels.push({ key: `c-${c}`, x: pad(g), y: y + 4, text: CUR_NAME[c], right: String(members.length), sub: undefined, cls: "is-row", t: 100 });
      labels.push({ key: `r-${c}`, x: x1, y: y + 4, text: c === "USD" ? "" : rate, cls: "is-rate is-r", t: 0, phase: "b" });
    } else {
      labels.push({ key: `c-${c}`, x: pad(g), y: cy, text: CUR_NAME[c], right: String(members.length), cls: "is-row is-m", t: 100 });
      labels.push({ key: `r-${c}`, x: pad(g), y: cy + 18, text: rate, cls: "is-rate is-m", t: 0, phase: "b" });
    }
    y += band;
  });

  const axisY = y + 6;
  guides.push({ k: "line", a: [x0, axisY], b: [x1, axisY], tone: "hair", t: 0 });
  const ticks = [10, 100, 1000, 10000, 100000];
  ticks.forEach((v) => {
    guides.push({ k: "line", a: [sx(v), y0], b: [sx(v), axisY], tone: "hair", t: 0, dash: [2, 4] });
    const txt = v.toLocaleString("en-US");
    labels.push({ key: `ta${v}`, x: sx(v), y: axisY + 5, text: txt, cls: "is-tick is-c", phase: "a" });
    labels.push({ key: `tb${v}`, x: sx(v), y: axisY + 5, text: `$${txt}`, cls: "is-tick is-c", phase: "b" });
  });
  labels.push({ key: "axa", x: x1, y: axisY + (g.mobile ? 17 : 21), text: g.mobile ? "As printed, log scale" : "Amount as printed on the receipt, log scale", cls: "is-axis is-r", phase: "a" });
  labels.push({ key: "axb", x: x1, y: axisY + (g.mobile ? 17 : 21), text: g.mobile ? "US dollars, rate on the receipt date" : "Amount in US dollars, at the rate on the receipt date", cls: "is-axis is-r", phase: "b" });

  /* the call-out: the Tokyo folio */
  const folio = MARKS.reduce((a, m) => (m.cur !== "USD" && m.printed > a.printed ? m : a));
  const fp = printedBox[folio.n];
  const fu = usdBox[folio.n];
  labels.push({
    key: "fa",
    x: fp.x,
    y: fp.y - 12,
    text: printedOf(folio),
    sub: g.mobile ? undefined : folio.merchant,
    cls: "is-call is-r is-b",
    t: 200,
    phase: "a",
  });
  labels.push({
    key: "fb",
    x: fu.x + (g.mobile ? -4 : 4),
    y: g.mobile ? fu.y + 8 : fu.y - 12,
    text: `${usd(folio.usd)}, ${folio.detail}`,
    sub: g.mobile ? undefined : `${printedOf(folio)} at ${folio.rate}`,
    cls: g.mobile ? "is-call" : "is-call is-b",
    t: PHASE + 380,
    phase: "b",
  });

  const { moves, looks } = blank();
  MARKS.forEach((m, i) => {
    const ci = CURS.indexOf(m.cur);
    moves[i].push({ t: ci * 20 + (i % 9) * 8, box: printedBox[i], dur: 400 });
    if (m.cur !== "USD") moves[i].push({ t: PHASE + (ci - 1) * 30 + (i % 7) * 10, box: usdBox[i], dur: 360, c: hop[i] });
    looks[i].push({ t: 0, look: m.cur === "USD" ? "faded" : "focus" });
  });
  const settle = { box: usdBox, look: MARKS.map((m) => (m.cur === "USD" ? "faded" : "focus") as Look) };
  return { moves, looks, settle, guides, labels, particles: [], phaseAt: PHASE, end: PHASE + 3 * 30 + 6 * 10 + 400 };
}

/* ---------- 3. duplicates and look-alikes, on the calendar ---------- */

function duplicates(g: Geo): Scene {
  const cal = calendar(g);
  const { moves, looks } = blank();
  const involved = new Set<number>();
  MARKS.forEach((m) => {
    if (m.dupOf !== null) involved.add(m.n).add(m.dupOf);
    if (m.lookalike !== null) involved.add(m.n).add(m.lookalike);
  });
  MARKS.forEach((m, i) => {
    moves[i].push({ t: (i % 11) * 6, box: cal.box[i], dur: 480 });
    looks[i].push({ t: 0, look: involved.has(i) ? "focus" : "faded" });
  });
  const guides: Guide[] = [...cal.guides];
  const labels: Label[] = [...cal.days];

  /* flagged pairs: a bracket beside the column */
  MARKS.filter((m) => m.dupOf !== null).forEach((m, k) => {
    const a = cal.box[m.dupOf!];
    const b = cal.box[m.n];
    const bx = a.x + a.w / 2 + (g.mobile ? 2 : 4);
    const yt = Math.min(a.y, b.y) - a.h / 2;
    const yb = Math.max(a.y, b.y) + a.h / 2;
    const t = 420 + k * 80;
    const o = g.mobile ? 2 : 3;
    guides.push({ k: "rect", x: a.x - a.w / 2 - o, y: yt - o, w: a.w + 2 * o, h: yb - yt + 2 * o, tone: "ink", t, over: true });
    const first = MARKS[m.dupOf!];
    const same = first.merchant === m.merchant;
    const colTop = cal.base - 7 * (cal.h + 3);
    const ly = g.mobile ? colTop - 26 - k * 30 : Math.min(yt - 16, colTop + 20) - k * 4;
    labels.push({
      key: `dup${k}`,
      x: g.mobile ? (k === 0 ? pad(g) : g.W / 2 + 4) : bx + 12,
      y: g.mobile ? cal.base - 7 * (cal.h + 2) - 40 : ly,
      text: same ? `${m.name}, ${m.merchant} twice` : `${m.name}, ${first.merchant} and ${m.merchant}`,
      sub: `${usd(m.usd)} each, ${shortDate(m.date)}. Flagged`,
      cls: "is-dup",
      w: g.mobile ? g.W / 2 - pad(g) - 4 : 210,
      t: t + 120,
    });
  });

  /* look-alikes on other days: an arc across the month */
  MARKS.filter((m) => m.lookalike !== null)
    .sort((a, b) => a.day - MARKS[a.lookalike!].day - (b.day - MARKS[b.lookalike!].day))
    .forEach((m, k) => {
      const a = cal.box[m.lookalike!];
      const b = cal.box[m.n];
      const ya = a.y - a.h / 2;
      const yb = b.y - b.h / 2;
      const span = Math.abs(b.x - a.x);
      const lift = (g.mobile ? 22 : 34) + span * (g.mobile ? 0.5 : 0.62);
      const t = 480 + k * 90;
      guides.push({
        k: "curve",
        p: [
          [a.x, ya],
          [a.x, ya - lift],
          [b.x, yb - lift],
          [b.x, yb],
        ],
        tone: "mute",
        dash: [3, 3],
        draw: true,
        t,
      });
      const apex = Math.min(ya, yb) - lift * 0.75;
      const days = m.day - MARKS[m.lookalike!].day;
      const wide = span > (g.mobile ? 120 : 200);
      labels.push({
        key: `look${k}`,
        x: (a.x + b.x) / 2,
        y: apex - 6,
        text: wide || !g.mobile ? `${m.merchant}, ${usd(m.usd)}` : m.merchant,
        sub: `${days} day${days > 1 ? "s" : ""} apart. Passes`,
        cls: `is-look is-c is-b${!wide && g.mobile ? " is-tight" : ""}`,
        t: t + 250,
      });
    });

  const kx = pad(g);
  const ky = top(g) + (g.mobile ? 8 : 18);
  labels.push({ key: "key-a", x: kx, y: ky, text: "Same person, same amount, same day", sub: "Flagged for a note (D-001)", cls: "is-key is-ring", t: 250 });
  labels.push({ key: "key-b", x: kx, y: ky + (g.mobile ? 36 : 44), text: "Same person, same amount, another day", sub: "Passes", cls: "is-key is-arc", t: 450 });
  for (const l of labels) {
    if (!l.key.startsWith("look")) continue;
    const half = (Math.max(l.text.length, (l.sub ?? "").length) * (g.mobile ? 5.6 : 6.6)) / 2 + 6;
    l.x = Math.min(Math.max(l.x, pad(g) + half), g.W - pad(g) - half + (g.mobile ? 10 : 0));
  }
  const settle = { box: cal.box, look: MARKS.map((m) => (involved.has(m.n) ? "focus" : "faded") as Look) };
  return { moves, looks, settle, guides, labels, particles: [], end: 480 + 3 * 90 + 450 };
}

/* ---------- 4. the rules run ---------- */

const RULE_ROWS: { row: Row; code: string; name: string; rule: string; cap?: number; weight: number }[] = [
  { row: "dinner", code: "M-041", name: "Dinner, a head", rule: `cap $${CAPS.dinner}`, cap: CAPS.dinner, weight: 1.05 },
  { row: "hotel", code: "L-007", name: "Hotel, a night", rule: `cap $${CAPS.hotel}`, cap: CAPS.hotel, weight: 0.95 },
  { row: "receipt", code: "R-003", name: "No receipt", rule: `required over $${CAPS.receipt}`, cap: CAPS.receipt, weight: 1.15 },
  { row: "dupes", code: "D-001", name: "Same amount", rule: "same person and day", weight: 0.75 },
  { row: "alcohol", code: "M-022", name: "Alcohol", rule: "kept off the total", weight: 0.75 },
  { row: "other", code: "", name: "Everything else", rule: "its category rule", weight: 2.1 },
];

function rules(g: Geo): Scene {
  const labelW = g.mobile ? 0 : 150;
  const citeW = g.mobile ? 0 : Math.min(290, g.W * 0.34);
  const x0 = pad(g) + labelW + (g.mobile ? 4 : 10);
  const x1 = g.W - pad(g) - citeW - (g.mobile ? 4 : 30);
  const sx = logX(2, 2000, x0, x1);
  const s = g.mobile ? 8 : 11;
  const rowHead = g.mobile ? 17 : 0;
  const axisH = g.mobile ? 30 : 44;
  const y0 = top(g) + (g.mobile ? 2 : 10);
  const avail = g.H - bot(g) - axisH - y0;
  const totalW = RULE_ROWS.reduce((a, r) => a + r.weight, 0);
  const SWEEP = 380;
  const SWEEP_DUR = 560;

  const box: Box[] = [];
  const guides: Guide[] = [];
  const labels: Label[] = [];
  let y = y0;
  RULE_ROWS.forEach((R, ri) => {
    const band = (avail * R.weight) / totalW;
    const cy = y + rowHead + (band - rowHead) / 2;
    const members = MARKS.filter((m) => m.row === R.row);
    const xs = members.map((m) => sx(m.rowValue));
    const ys = fitSwarm(xs, s, g.mobile ? 1.5 : 2.5, (band - rowHead) / 2 - 2);
    members.forEach((m, k) => (box[m.n] = sq(xs[k], cy + ys[k], s)));
    if (ri > 0) guides.push({ k: "line", a: [pad(g), y], b: [g.W - pad(g), y], tone: "hair", t: 60 });
    if (R.cap) {
      const cx = sx(R.cap);
      guides.push({ k: "line", a: [cx, y + rowHead + 4], b: [cx, y + band - 4], tone: "ink", t: 240 + ri * 25, draw: true, w: 1.25 });
      labels.push({ key: `cap-${R.row}`, x: cx + 4, y: y + rowHead + 3, text: `$${R.cap}`, cls: "is-capv", t: 280 + ri * 25 });
    }
    if (g.mobile) {
      labels.push({ key: `rl-${R.row}`, x: pad(g), y: y + 3, text: R.code ? `${R.code} ${R.name}` : R.name, right: R.rule, cls: "is-rule", t: 80 });
    } else {
      labels.push({ key: `rl-${R.row}`, x: pad(g), y: cy, text: R.code || " ", meta: R.name, sub: R.rule, cls: "is-rule is-m", w: labelW, t: 80 });
      /* each exception's citation, beside the chart */
      const ex = members.filter((m) => m.verdict !== "ok").sort((a, b) => box[a.n].y - box[b.n].y);
      const lx = x1 + 30;
      const step = Math.min(20, (band - 8) / Math.max(1, ex.length));
      ex.forEach((m, k) => {
        const b = box[m.n];
        const ly = cy + (k - (ex.length - 1) / 2) * step;
        const tv = SWEEP + ((b.x - x0) / (x1 - x0)) * SWEEP_DUR;
        guides.push({ k: "line", a: [b.x + s / 2 + 3, b.y], b: [x1 + 12, b.y], tone: "trail", t: tv + 60 });
        guides.push({ k: "line", a: [x1 + 12, b.y], b: [lx - 4, ly], tone: "trail", t: tv + 60 });
        labels.push({ key: `ex-${m.n}`, x: lx, y: ly, text: m.merchant, right: m.why, cls: `is-ex is-m is-${m.verdict}`, w: citeW, t: tv + 80 });
      });
    }
    y += band;
  });
  const axisY = y + 4;
  guides.push({ k: "line", a: [x0, axisY], b: [x1, axisY], tone: "hair", t: 0 });
  [10, 100, 1000].forEach((v) => {
    guides.push({ k: "line", a: [sx(v), y0], b: [sx(v), axisY], tone: "hair", t: 0, dash: [2, 4] });
    labels.push({ key: `t${v}`, x: sx(v), y: axisY + 5, text: `$${v.toLocaleString("en-US")}`, cls: "is-tick is-c" });
  });
  labels.push({
    key: "ax",
    x: g.mobile ? x1 : x0,
    y: axisY + (g.mobile ? 17 : 21),
    text: g.mobile ? "Dollars, log scale. Dinners a head, hotels a night" : "Dollars, log scale: dinners a head, hotels a night",
    cls: g.mobile ? "is-axis is-r" : "is-axis",
  });
  guides.push({ k: "sweep", x0: x0 - 6, x1: x1 + 6, y0: y0, y1: axisY, t: SWEEP, dur: SWEEP_DUR });

  const { moves, looks } = blank();
  MARKS.forEach((m, i) => {
    moves[i].push({ t: (i % 13) * 7, box: box[i], dur: 480 });
    looks[i].push({ t: 0, look: m.receipt ? "matched" : "empty" });
    looks[i].push({ t: SWEEP + ((box[i].x - x0) / (x1 - x0)) * SWEEP_DUR, look: m.verdict });
  });
  const settle = { box, look: MARKS.map((m) => m.verdict as Look) };
  return { moves, looks, settle, guides, labels, particles: [], end: SWEEP + SWEEP_DUR + 250 };
}

/* ---------- 5. the cleared ones file themselves; the rest are named ---------- */

function filed(g: Geo): Scene {
  const box: Box[] = [];
  const guides: Guide[] = [];
  const labels: Label[] = [];
  const { moves, looks } = blank();
  const y0 = top(g) + (g.mobile ? 2 : 6);

  /* the report */
  const rx = pad(g);
  const rw = g.mobile ? g.W - 2 * pad(g) : Math.min(420, g.W * 0.44);
  let reportH: number;
  if (g.mobile) {
    /* on a phone the report is one strip: every cleared mark as a bar, in category order */
    const stepX = (rw - 16) / CLEARED.length;
    const ordered = REPORT_CATS.flatMap((cat) => CLEARED.filter((m) => m.category === cat));
    ordered.forEach((m, k) => {
      const b: Box = { x: rx + 8 + (k + 0.5) * stepX, y: y0 + 32, w: Math.max(2, stepX - 1.2), h: 10, r: 0 };
      box[m.n] = b;
      moves[m.n].push({ t: 80 + k * 4, box: b, dur: 520 });
    });
    reportH = 44;
    labels.push({
      key: "rep",
      x: rx + 8,
      y: y0 + 7,
      text: "September report",
      right: `${COUNTS.cleared} filed, ${usd(COUNTS.clearedTotal)}`,
      cls: "is-rep",
      w: rw - 16,
      t: 200,
    });
  } else {
    const s = 12;
    const stepX = 15;
    const head = 70;
    const catLabelW = 96;
    const totW = 84;
    const mx0 = rx + 16 + catLabelW;
    const perLine = Math.max(8, Math.floor((rw - (mx0 - rx) - totW - 16) / stepX));
    const lineH = 15;
    const rowGap = 13;
    let ry = y0 + head;
    REPORT_CATS.forEach((cat, ci) => {
      const members = CLEARED.filter((m) => m.category === cat);
      const lines = Math.ceil(members.length / perLine);
      members.forEach((m, k) => {
        const b = sq(mx0 + (k % perLine) * stepX + s / 2, ry + Math.floor(k / perLine) * lineH + s / 2, s);
        box[m.n] = b;
        moves[m.n].push({ t: 60 + ci * 40 + k * 5, box: b, dur: 520 });
      });
      const total = members.reduce((a, m) => a + m.usd, 0);
      labels.push({ key: `cat-${cat}`, x: rx + 16, y: ry + s / 2, text: cat, right: String(members.length), cls: "is-cat is-m", w: catLabelW - 6, t: 300 + ci * 40 });
      labels.push({ key: `tot-${cat}`, x: rx + rw - 16, y: ry + s / 2, text: usd(total), cls: "is-tot is-r is-m", t: 300 + ci * 40 });
      ry += lines * lineH + rowGap;
    });
    guides.push({ k: "line", a: [rx + 16, ry], b: [rx + rw - 16, ry], tone: "mute", t: 600 });
    labels.push({ key: "sum", x: rx + 16, y: ry + 16, text: "Total", right: String(COUNTS.cleared), cls: "is-cat is-m", w: catLabelW - 6, t: 650 });
    labels.push({ key: "sumv", x: rx + rw - 16, y: ry + 16, text: usd(COUNTS.clearedTotal), cls: "is-tot is-sum is-r is-m", t: 650 });
    reportH = ry - y0 + 76;
    labels.push({
      key: "rep",
      x: rx + 16,
      y: y0 + 16,
      text: "September report",
      sub: `${COUNTS.cleared} charges, receipts attached`,
      cls: "is-rep",
      w: rw - 32,
      t: 200,
    });
    labels.push({ key: "exp", x: rx + 16, y: y0 + reportH - 24, text: "Audit-grade PDF, XLSX, GL journal CSV", cls: "is-exp", t: 700 });
  }
  guides.push({ k: "rect", x: rx, y: y0, w: rw, h: reportH, tone: "mute", t: 0 });

  /* the list: what is left for a person */
  const lx = g.mobile ? pad(g) : rx + rw + 40;
  const lw = g.W - pad(g) - lx;
  const ly0 = g.mobile ? y0 + reportH + 12 : y0;
  const listHead = g.mobile ? 22 : 34;
  const rowH = Math.min(g.mobile ? 30 : 50, (g.H - bot(g) - ly0 - listHead) / EXCEPTIONS.length);
  const ms = g.mobile ? 9 : 12;
  labels.push({
    key: "lh",
    x: lx,
    y: ly0,
    text: "Left for a person",
    right: String(EXCEPTIONS.length),
    cls: "is-lh",
    w: lw,
    t: 300,
  });
  EXCEPTIONS.forEach((m, k) => {
    const yy = ly0 + listHead + k * rowH;
    const b = sq(lx + ms / 2, yy + (g.mobile ? 7 : 9), ms);
    box[m.n] = b;
    moves[m.n].push({ t: k * 15, box: b, dur: 500 });
    if (k > 0 && !g.mobile) guides.push({ k: "line", a: [lx, yy - 5], b: [lx + lw, yy - 5], tone: "hair", t: 300 + k * 15 });
    labels.push({
      key: `li-${m.n}`,
      x: lx + ms + (g.mobile ? 8 : 12),
      y: yy,
      text: m.merchant,
      meta: g.mobile ? m.name : `${m.name}, ${shortDate(m.date)}`,
      right: usd(m.usd),
      sub: m.cite,
      cls: `is-li is-${m.verdict}`,
      w: lw - ms - (g.mobile ? 8 : 12),
      t: 350 + k * 25,
    });
  });
  MARKS.forEach((m, i) => looks[i].push({ t: 0, look: m.verdict }));
  const settle = { box, look: MARKS.map((m) => m.verdict as Look) };
  return { moves, looks, settle, guides, labels, particles: [], end: 1000 };
}

export const STEP_COUNT = 6;

export function buildScenes(g: Geo): Scene[] {
  const out = [pile(g), receipts(g), currencies(g), duplicates(g), rules(g), filed(g)];
  if (out.some((sc) => sc.settle.box.length !== N)) throw new Error("scene missing marks");
  return out;
}
