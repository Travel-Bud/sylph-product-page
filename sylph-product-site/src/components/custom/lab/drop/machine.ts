/*
 * The board's runtime. It measures the board, builds each charge's path (engine.ts), holds charges
 * in single file, and plays the result: chips by their scripted paths, doors, pushers and the match
 * latch by fixed-step springs driven from the paths' events (so a replay gets the same events at
 * the same offsets), gate lights and tallies, stacks in the trays, traces of every path. React only
 * renders what this reports through `onView`; the frame loop writes transforms directly.
 *
 * Sound follows the page policy in v2-sides/sound.ts: a drop the visitor clicked books its gate
 * clicks and its landing on the audio clock at the moment of the click. Nothing else sounds.
 */
import { play, hush } from "@/components/custom/v2-sides/sound";
import { BY_KEY, DEMO_KEY, GATES, WEEK, type Charge, type Verdict } from "./data";
import { buildPath, drawnAt, hold, pathD, poseIn, schedule, type EvKind, type Geo, type Held, type Mode, type Path, type Pose } from "./engine";

const DT = 1 / 240;
const TAN = Math.tan((6 * Math.PI) / 180);
const now = () => performance.now() / 1000;
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOut = (u: number) => 1 - (1 - u) ** 3;

type Spring = { x: number; v: number; to: number };
const spring = (): Spring => ({ x: 0, v: 0, to: 0 });
function stepSpring(s: Spring, k: number, c: number) {
  s.v += (-k * (s.x - s.to) - c * s.v) * DT;
  s.x += s.v * DT;
}
const atRest = (s: Spring) => Math.abs(s.x - s.to) < 0.02 && Math.abs(s.v) < 0.05;

export type TraceState = "live" | "ghost" | "fresh" | "old";
export type TraceView = { id: number; key: string; d: string; v: Verdict; len: number; state: TraceState; thin: boolean };
export type Slip =
  | { kind: "idle" }
  | { kind: "checking"; key: string; n: number }
  | { kind: "verdict"; key: string; n: number; same: boolean; touched: string[] }
  | { kind: "train"; key: string; done: number; total: number; same: boolean }
  | { kind: "pour"; done: number; total: number; counts: Record<Verdict, number> };

export interface View {
  chips: { id: number; key: string; amount: string }[];
  traces: TraceView[];
  counts: Record<Verdict, number>;
  filed: number;
  slip: Slip;
  badges: Record<string, { n: number; v: Verdict }>;
  bulk: null | "pour" | "train";
  lastKey: string | null;
  viewBox: string;
}

export const INITIAL_VIEW: View = {
  chips: [],
  traces: [],
  counts: { ok: 0, note: 0, block: 0 },
  filed: 0,
  slip: { kind: "idle" },
  badges: {},
  bulk: null,
  lastKey: null,
  viewBox: "0 0 560 720",
};

type GateEls = { row: HTMLElement; doorL: HTMLElement; doorR: HTMLElement; doors: HTMLElement; pusher: HTMLElement | null; res: HTMLElement };
type Measure = {
  geo: Geo;
  slotX: number;
  stack: Record<"note" | "block", number>;
  report: { x: number; y: number };
  push: number;
  step: number;
  box: string;
  w: number;
};

type Chip = {
  id: number;
  c: Charge;
  path: Path;
  mode: Mode;
  release: number;
  spawn: number;
  slot: { x: number; y: number };
  toss: { x: number; y: number; t0: number; dur: number; arc: number } | null;
  aheads: number[];
  headline: boolean;
  n: number;
  group: "pour" | "train" | null;
  traceId: number | null;
  phase: "air" | "settle" | "file" | "gone";
  from?: Pose;
  to?: { x: number; y: number };
  t0?: number;
  still: boolean;
  landed: boolean;
  el: HTMLElement | null;
};

type Q = { t: number; kind: EvKind | "release" | "settle" | "filed"; gate: number; chip: number };

const CAP = { desk: 8, phone: 7 };
/* a stack leans a little, the same way every time */
const LEAN = [0, 2, -1, 1.5, -2, 1, -0.5, 2];
const RESULT_NONE = "";

export class DropMachine {
  private onView: (v: View) => void;
  private stage: HTMLElement | null = null;
  private board: HTMLElement | null = null;
  private shaft: HTMLElement | null = null;
  private spine: HTMLElement | null = null;
  private rails: { L: HTMLElement | null; R: HTMLElement | null } = { L: null, R: null };
  private gateEls: (GateEls | null)[] = GATES.map(() => null);
  private arm: HTMLElement | null = null;
  private trays: Record<Verdict, HTMLElement | null> = { ok: null, note: null, block: null };
  private report: HTMLElement | null = null;
  private cards = new Map<string, HTMLElement>();
  private traceEls = new Map<number, SVGPathElement>();

  private chips = new Map<number, Chip>();
  private q: Q[] = [];
  private held: Held[] = [];
  private doors = GATES.map(spring);
  private pushers = GATES.map(spring);
  private armS = spring();
  private simT = -1;
  private raf = 0;
  private lastW = 0;
  private m: Measure | null = null;
  private seq = 1;
  private reduced = false;
  private touched = false;
  private drops = new Map<string, number>();
  private stacks: Record<"note" | "block", number[]> = { note: [], block: [] };
  private restingOk: number | null = null;
  private tallies = GATES.map(() => ({ checked: 0, caught: 0 }));
  private pulse = new Map<Element, boolean>();
  private live: { traceId: number; chip: number }[] = [];
  private bulkLeft = 0;
  private view: View = { ...INITIAL_VIEW, counts: { ...INITIAL_VIEW.counts } };
  private emitting = false;

  constructor(onView: (v: View) => void) {
    this.onView = onView;
  }

  /* ---------- DOM: everything is found under the stage root; chips and traces by data-id ---------- */
  private bind(root: HTMLElement) {
    const q = <T extends Element = HTMLElement>(sel: string) => root.querySelector<T & HTMLElement>(sel);
    this.stage = root;
    this.board = q(".dp-board");
    this.shaft = q(".dp-shaft");
    this.spine = q(".dp-spine");
    this.rails = { L: q(".dp-rail--L"), R: q(".dp-rail--R") };
    this.arm = q(".dp-arm");
    this.report = q(".dp-report");
    this.trays = { ok: q(".dp-tray--ok"), note: q(".dp-tray--note"), block: q(".dp-tray--block") };
    root.querySelectorAll<HTMLElement>(".dp-gate").forEach((row) => {
      const i = Number(row.dataset.i);
      const f = (sel: string) => row.querySelector<HTMLElement>(sel);
      const doors = f(".dp-doors");
      const doorL = f(".dp-door--l");
      const doorR = f(".dp-door--r");
      const res = f(".dp-res");
      if (doors && doorL && doorR && res) this.gateEls[i] = { row, doors, doorL, doorR, pusher: f(".dp-pusher"), res };
    });
    root.querySelectorAll<HTMLElement>(".dp-card").forEach((el) => {
      if (el.dataset.key) this.cards.set(el.dataset.key, el);
    });
  }

  /** A chip's element, once React has rendered it. */
  private chipEl(ch: Chip): HTMLElement | null {
    if (ch.el?.isConnected) return ch.el;
    const el = this.stage?.querySelector<HTMLElement>(`[data-chip="${ch.id}"]`) ?? null;
    ch.el = el;
    if (el && ch.landed) el.classList.add("is-matched", `is-${ch.path.verdict}`);
    return el;
  }

  private traceEl(id: number): SVGPathElement | null {
    const hit = this.traceEls.get(id);
    if (hit?.isConnected) return hit;
    const el = this.stage?.querySelector<SVGPathElement>(`[data-trace="${id}"]`) ?? null;
    if (el) this.traceEls.set(id, el);
    return el;
  }

  /** React rendered new chips or traces: paint them where they belong. */
  rendered() {
    this.kick();
  }

  /* ---------- lifecycle ---------- */
  mount(root: HTMLElement) {
    this.bind(root);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.reduced = mq.matches;
    const onMq = () => (this.reduced = mq.matches);
    mq.addEventListener("change", onMq);
    const ro = new ResizeObserver(() => {
      const w = this.stage?.getBoundingClientRect().width ?? 0;
      if (this.lastW && Math.abs(w - this.lastW) > 1) this.relayout();
      this.lastW = w;
    });
    if (this.stage) ro.observe(this.stage);
    const onPointer = () => (this.touched = true);
    this.stage?.addEventListener("pointerdown", onPointer, { passive: true });
    this.m = this.measure();
    this.emit();
    return () => {
      mq.removeEventListener("change", onMq);
      ro.disconnect();
      this.stage?.removeEventListener("pointerdown", onPointer);
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    };
  }

  get isReduced() {
    return this.reduced;
  }

  /** The first view of the board: Sushi Kanda drops itself once, unless the visitor got there first. */
  demo() {
    if (this.touched || this.drops.size) return;
    this.dropSingle(DEMO_KEY, true);
  }

  /* ---------- measuring ---------- */
  private measure(): Measure | null {
    const { stage, board, shaft, spine } = this;
    const railL = this.rails.L;
    const railR = this.rails.R;
    if (!stage || !board || !shaft || !spine || !railL || !railR) return null;
    const S = stage.getBoundingClientRect();
    const rel = (el: Element) => {
      const r = el.getBoundingClientRect();
      return { l: r.left - S.left, t: r.top - S.top, r: r.right - S.left, b: r.bottom - S.top, w: r.width, h: r.height };
    };
    const cs = getComputedStyle(board);
    const cw = parseFloat(cs.getPropertyValue("--cw")) || 64;
    const ch = parseFloat(cs.getPropertyValue("--ch")) || 28;
    const sp = rel(spine);
    const sh = rel(shaft);
    const rl = rel(railL);
    const rr = rel(railR);
    const spineX = sp.l + sp.w / 2;
    const rowH = sh.h / GATES.length;
    const gates = GATES.map((g, i) => {
      const els = this.gateEls[i];
      const floor = els ? rel(els.doors).t : sh.t + rowH * (i + 1) - 10;
      return {
        floor,
        side: g.side,
        edge: g.side === "R" ? sp.r : sp.l,
        railX: g.side === "R" ? rr.l + rr.w / 2 : rl.l + rl.w / 2,
      };
    });
    const tray = (v: Verdict) => {
      const el = this.trays[v];
      return el ? rel(el) : { l: 0, t: 0, r: 0, b: sh.b + 100, w: 0, h: 0 };
    };
    const tOk = tray("ok");
    const tNote = tray("note");
    const tBlock = tray("block");
    const pad = parseFloat(cs.getPropertyValue("--tray-pad")) || 9;
    const rep = this.report ? rel(this.report) : { l: tOk.r - 30, t: tOk.b - 40, w: 30, h: 30 };
    const b = rel(board);
    const phone = cw < 60;
    return {
      geo: {
        cw,
        ch,
        g: 44 * rowH,
        spineX,
        spineW: sp.w,
        slotY: sh.t - ch / 2 + 3,
        gates,
        tan: TAN,
        trays: {
          ok: { floor: tOk.b - pad, x: spineX },
          note: { floor: tNote.b - pad, x: rr.l + rr.w / 2 },
          block: { floor: tBlock.b - pad, x: rl.l + rl.w / 2 },
        },
      },
      slotX: spineX,
      stack: { note: tNote.l + tNote.w * 0.34, block: tBlock.l + tBlock.w * 0.64 },
      report: { x: rep.l + rep.w / 2, y: rep.t + rep.h / 2 },
      push: (sp.w - cw) / 2 + (phone ? 6 : 8),
      step: phone ? 4 : 5,
      box: `${b.l.toFixed(1)} ${b.t.toFixed(1)} ${b.w.toFixed(1)} ${b.h.toFixed(1)}`,
      w: S.width,
    };
  }

  /* ---------- actions ---------- */
  private waiting(T: number) {
    let n = 0;
    for (const c of this.chips.values()) if (c.phase === "air" && c.release > T && !c.group) n++;
    return n;
  }

  dropSingle(key: string, auto = false) {
    if (!auto) this.touched = true;
    if (this.view.bulk) return;
    const c = BY_KEY[key];
    const m = (this.m = this.measure());
    if (!c || !m) return;
    const T = now();
    const q = this.waiting(T);
    if (q >= 3) return;
    const path = buildPath(m.geo, c, "single");
    const n = (this.drops.get(key) ?? 0) + 1;
    this.drops.set(key, n);
    this.view.lastKey = key;

    if (this.reduced) {
      this.instant([{ c, path, n }], null);
      if (!auto) play("land");
      return;
    }

    const card = this.cards.get(key);
    const slot = { x: m.slotX, y: m.geo.slotY };
    let toss: Chip["toss"] = null;
    let arrive = T + 0.1;
    if (card && this.stage) {
      const S = this.stage.getBoundingClientRect();
      const r = card.getBoundingClientRect();
      const x = r.left - S.left + r.width / 2;
      const y = r.top - S.top + r.height / 2;
      const dist = Math.hypot(slot.x - x, slot.y - y);
      const dur = clamp(0.34 + dist / 1900, 0.4, 0.68);
      toss = { x, y, t0: T, dur, arc: clamp(40 + dist * 0.28, 50, 190) };
      arrive = T + dur;
      card.dataset.press = card.dataset.press === "a" ? "b" : "a";
    }
    const aheads = [...this.chips.values()].filter((o) => o.phase === "air" && !o.group && o.release > T).map((o) => o.release);
    const release = schedule(path, arrive + 0.08, this.held);
    this.commit({ c, path, mode: "single", release, spawn: T, slot, toss, aheads, headline: true, n, group: null });

    if (!auto) {
      play("send");
      for (const e of path.events) {
        const d = release + e.t - T;
        if (e.kind === "land") play("tap", { delay: d });
        else if (e.kind === "fire") play("stamp", { delay: d });
        else if (e.kind === "tray") play("land", { delay: d });
      }
    }
  }

  /** The same charge ten times over, in single file. */
  train(key: string, lead = 0.12) {
    this.touched = true;
    if (this.view.bulk) return;
    const c = BY_KEY[key];
    const m = (this.m = this.measure());
    if (!c || !m) return;
    this.view.lastKey = key;
    const n0 = this.drops.get(key) ?? 0;
    this.drops.set(key, n0 + 10);
    this.startBulk("train", 10);
    this.view.slip = { kind: "train", key, done: 0, total: 10, same: n0 > 0 };
    const path = buildPath(m.geo, c, "fast");
    if (this.reduced) {
      this.instant(
        Array.from({ length: 10 }, (_, i) => ({ c, path, n: n0 + i + 1 })),
        "train",
      );
      play("land");
      return;
    }
    const T = now();
    let earliest = T + lead;
    play("send");
    for (let i = 0; i < 10; i++) {
      const release = schedule(path, earliest, this.held);
      this.commit({
        c,
        path,
        mode: "fast",
        release,
        spawn: release - 0.16,
        slot: { x: m.slotX, y: m.geo.slotY },
        toss: null,
        aheads: [],
        headline: i === 0,
        n: n0 + i + 1,
        group: "train",
      });
      play("land", { delay: release + path.land - T });
      earliest = release + 0.02;
    }
  }

  /** The team's week: every sample row, one after another. */
  pour() {
    this.touched = true;
    if (this.view.bulk) return;
    const m = (this.m = this.measure());
    if (!m) return;
    this.startBulk("pour", WEEK.length);
    this.view.slip = { kind: "pour", done: 0, total: WEEK.length, counts: { ok: 0, note: 0, block: 0 } };
    const items = WEEK.map((c) => {
      const n = (this.drops.get(c.key) ?? 0) + 1;
      this.drops.set(c.key, n);
      return { c, path: buildPath(m.geo, c, "fast"), n };
    });
    if (this.reduced) {
      this.instant(items, "pour");
      play("land");
      return;
    }
    const T = now();
    let earliest = T + 0.12;
    play("send");
    /* the machine takes whichever charge can go in soonest, so fast ones do not queue behind slow ones */
    const left = [...items];
    while (left.length) {
      let pick = 0;
      let release = Infinity;
      left.forEach((it, k) => {
        const r = schedule(it.path, earliest, this.held);
        if (r < release - 1e-6) {
          release = r;
          pick = k;
        }
      });
      const it = left.splice(pick, 1)[0];
      this.commit({
        c: it.c,
        path: it.path,
        mode: "fast",
        release,
        spawn: release - 0.16,
        slot: { x: m.slotX, y: m.geo.slotY },
        toss: null,
        aheads: [],
        headline: false,
        n: it.n,
        group: "pour",
      });
      play("land", { delay: release + it.path.land - T });
      earliest = release + 0.02;
    }
  }

  /** Empty the board: chips, traces, counts, lights. */
  clear() {
    hush();
    this.chips.clear();
    this.q = [];
    this.held = [];
    this.live = [];
    this.stacks = { note: [], block: [] };
    this.restingOk = null;
    this.drops.clear();
    this.resetGates();
    this.tallies = GATES.map(() => ({ checked: 0, caught: 0 }));
    for (const s of [...this.doors, ...this.pushers, this.armS]) Object.assign(s, spring());
    this.paintSprings();
    this.view = { ...INITIAL_VIEW, counts: { ok: 0, note: 0, block: 0 }, viewBox: this.view.viewBox };
    this.emit();
  }

  private startBulk(kind: "pour" | "train", total: number) {
    this.view.bulk = kind;
    this.bulkLeft = total;
    this.resetGates();
    this.tallies = GATES.map(() => ({ checked: 0, caught: 0 }));
    this.view.traces = this.view.traces.map((t) => ({ ...t, state: "old" as const }));
  }

  private commit(o: Omit<Chip, "id" | "traceId" | "phase" | "still" | "landed" | "el">) {
    const id = this.seq++;
    const ch: Chip = { ...o, id, traceId: null, phase: "air", still: false, landed: false, el: null };
    this.chips.set(id, ch);
    this.held.push(...hold(o.path, o.release));
    const T = now();
    this.held = this.held.filter((h) => h.b > T - 1);
    this.push({ t: o.release, kind: "release", gate: -1, chip: id });
    for (const e of o.path.events) this.push({ t: o.release + e.t, kind: e.kind, gate: e.gate, chip: id });
    this.push({ t: o.release + o.path.dur, kind: "settle", gate: -1, chip: id });
    this.view.chips = [...this.view.chips, { id, key: o.c.key, amount: o.c.amount }];
    this.emit();
    this.kick();
  }

  private push(e: Q) {
    let i = this.q.length;
    while (i > 0 && this.q[i - 1].t > e.t) i--;
    this.q.splice(i, 0, e);
  }

  /* ---------- the frame loop ---------- */
  private kick() {
    if (this.raf) return;
    if (this.simT < 0 || !this.busy()) this.simT = now();
    this.raf = requestAnimationFrame(this.frame);
  }

  private busy() {
    if (this.q.length) return true;
    for (const c of this.chips.values()) if (!c.still) return true;
    return [...this.doors, ...this.pushers, this.armS].some((s) => !atRest(s));
  }

  private frame = () => {
    this.raf = 0;
    const T = now();
    if (T - this.simT > 0.5) {
      /* the tab slept: catch up without stepping every spring tick */
      while (this.q.length && this.q[0].t <= T) this.apply(this.q.shift()!);
      for (const s of [...this.doors, ...this.pushers, this.armS]) {
        s.x = s.to;
        s.v = 0;
      }
      this.simT = T;
    }
    while (this.simT + DT <= T) {
      const tn = this.simT + DT;
      while (this.q.length && this.q[0].t <= tn) this.apply(this.q.shift()!);
      this.doors.forEach((s) => stepSpring(s, 760, 34));
      this.pushers.forEach((s) => stepSpring(s, 2200, 62));
      stepSpring(this.armS, 1100, 50);
      this.simT = tn;
    }
    this.paintSprings();
    for (const ch of this.chips.values()) if (!ch.still) this.paintChip(ch, T);
    for (const lv of this.live) {
      const ch = this.chips.get(lv.chip);
      const el = this.traceEl(lv.traceId);
      const tv = this.view.traces.find((t) => t.id === lv.traceId);
      if (!ch || !el || !tv) continue;
      el.style.strokeDashoffset = String(tv.len - drawnAt(ch.path, T - ch.release));
    }
    if (this.busy()) this.raf = requestAnimationFrame(this.frame);
  };

  private paintSprings() {
    const m = this.m;
    this.gateEls.forEach((g, i) => {
      if (!g) return;
      const a = this.doors[i].x;
      g.doorL.style.transform = `rotate(${a.toFixed(2)}deg)`;
      g.doorR.style.transform = `rotate(${(-a).toFixed(2)}deg)`;
      if (g.pusher && m) {
        const dir = GATES[i].side === "R" ? 1 : -1;
        g.pusher.style.transform = `translateX(${(dir * this.pushers[i].x * m.push).toFixed(2)}px)`;
      }
    });
    if (this.arm) this.arm.style.transform = `scaleX(${clamp(this.armS.x, 0, 1.08).toFixed(3)})`;
  }

  /** Where a waiting charge sits: in the slot, or on the charges still waiting ahead of it. */
  private restY(ch: Chip, t: number, chH: number) {
    const k = ch.aheads.filter((a) => a > t).length;
    let y = ch.slot.y - k * (chH + 3);
    const moved = ch.aheads.filter((a) => a <= t).sort((a, b) => b - a)[0];
    if (moved !== undefined && t - moved < 0.13) {
      const w = (t - moved) / 0.13;
      y -= (chH + 3) * (1 - w * w);
    }
    return y;
  }

  private paintChip(ch: Chip, T: number) {
    const el = this.chipEl(ch);
    const m = this.m;
    if (!el || !m) return;
    const { cw, ch: chH } = m.geo;
    let p: Pose;
    let o = 1;
    if (T < ch.spawn) {
      el.style.opacity = "0";
      return;
    }
    if (ch.phase === "air") {
      if (T < ch.release) {
        if (ch.toss) {
          const tz = ch.toss;
          const u = clamp((T - tz.t0) / tz.dur);
          if (u < 1) {
            const sc = 1.22 - 0.22 * u;
            const ty = this.restY(ch, tz.t0 + tz.dur, chH);
            p = {
              x: tz.x + (ch.slot.x - tz.x) * u,
              y: tz.y + (ty - tz.y) * u - tz.arc * 4 * u * (1 - u),
              r: -11 * (1 - u) * (1 - u),
              sx: sc,
              sy: sc,
            };
          } else p = { x: ch.slot.x, y: this.restY(ch, T, chH), r: 0, sx: 1, sy: 1 };
        } else {
          /* poured in from Priya's side: a short fall into the slot */
          const u = clamp((T - ch.spawn) / Math.max(0.01, ch.release - ch.spawn));
          p = { x: ch.slot.x, y: ch.slot.y - 34 * (1 - u * u), r: 0, sx: 1, sy: 1 };
          o = clamp(u * 3);
        }
      } else {
        const t = T - ch.release;
        p = t < ch.path.dur ? poseIn(ch.path.segs, t) : ch.path.end;
      }
    } else if (ch.phase === "settle" && ch.from && ch.to && ch.t0 !== undefined) {
      const u = clamp((T - ch.t0) / 0.3);
      const e = easeOut(u);
      p = {
        x: ch.from.x + (ch.to.x - ch.from.x) * e,
        y: ch.from.y + (ch.to.y - ch.from.y) * e - Math.sin(Math.PI * u) * 7,
        r: 0,
        sx: 1,
        sy: 1,
      };
      if (u >= 1) ch.still = true;
    } else if (ch.phase === "file" && ch.from && ch.to && ch.t0 !== undefined) {
      const u = clamp((T - ch.t0) / 0.3);
      const e = u * u * (3 - 2 * u);
      const sc = 1 - 0.62 * e;
      p = {
        x: ch.from.x + (ch.to.x - ch.from.x) * e,
        y: ch.from.y + (ch.to.y - ch.from.y) * e - Math.sin(Math.PI * u) * 10,
        r: 8 * e,
        sx: sc,
        sy: sc,
      };
      o = 1 - clamp((u - 0.55) / 0.45);
    } else return;
    el.style.opacity = o.toFixed(3);
    el.style.transform = `translate3d(${(p.x - cw / 2).toFixed(2)}px, ${(p.y - chH / 2).toFixed(2)}px, 0) rotate(${p.r.toFixed(2)}deg) scale(${p.sx.toFixed(3)}, ${p.sy.toFixed(3)})`;
  }

  /* ---------- events ---------- */
  private apply(e: Q) {
    const ch = this.chips.get(e.chip);
    if (!ch) return;
    const i = e.gate;
    const bulk = ch.group !== null;
    switch (e.kind) {
      case "release":
        this.onRelease(ch);
        break;
      case "open":
        this.doors[i].to = 90;
        break;
      case "close":
        this.doors[i].to = 0;
        break;
      case "land":
        this.doors[i].v += 120;
        this.show(i, "read", bulk ? null : "checking");
        break;
      case "match":
        this.armS.to = 1;
        this.chipEl(ch)?.classList.add("is-matched");
        break;
      case "unarm":
        this.armS.to = 0;
        break;
      case "pass":
        this.doors[i].to = 90;
        this.tallies[i].checked++;
        this.show(i, "pass", bulk ? this.tallyText(i) : ch.c.results[i]);
        break;
      case "fire": {
        this.pushers[i].to = 1;
        this.tallies[i].checked++;
        this.tallies[i].caught++;
        this.show(i, GATES[i].fire ?? "note", bulk ? this.tallyText(i) : ch.c.results[i]);
        const row = this.gateEls[i]?.row;
        if (row) row.dataset.ramp = "on";
        break;
      }
      case "retract":
        this.pushers[i].to = 0;
        break;
      case "tray":
        this.onTray(ch);
        break;
      case "settle":
        this.onSettle(ch, e.t);
        break;
      case "filed":
        this.onFiled(ch);
        break;
    }
  }

  /** A finished pour or train: every gate that saw a charge shows its count, coloured by what it caught. */
  private showTallies() {
    GATES.forEach((g, i) => {
      const t = this.tallies[i];
      if (!t.checked) return;
      this.show(i, t.caught ? (g.fire ?? "note") : "pass", this.tallyText(i));
    });
  }

  private tallyText(i: number) {
    const t = this.tallies[i];
    return i === 0 ? `${t.checked} matched` : `caught ${t.caught} of ${t.checked}`;
  }

  private show(i: number, state: string, text: string | null) {
    const g = this.gateEls[i];
    if (!g) return;
    g.row.dataset.state = state;
    if (text !== null) g.res.textContent = text;
    this.flash(g.row);
  }

  private flash(el: HTMLElement) {
    const on = !this.pulse.get(el);
    this.pulse.set(el, on);
    el.dataset.pulse = on ? "a" : "b";
  }

  private resetGates() {
    this.gateEls.forEach((g) => {
      if (!g) return;
      g.row.dataset.state = "idle";
      delete g.row.dataset.ramp;
      delete g.row.dataset.pulse;
      g.res.textContent = RESULT_NONE;
    });
  }

  private airborne(except: number) {
    for (const c of this.chips.values()) if (c.id !== except && c.phase === "air" && c.release <= now() + 0.001) return true;
    return false;
  }

  private onRelease(ch: Chip) {
    if (ch.headline && !ch.group) {
      if (!this.airborne(ch.id)) this.resetGates();
      this.view.slip = { kind: "checking", key: ch.c.key, n: ch.n };
    }
    /* a trace for singles, the first of a train, and every poured charge */
    if (ch.group === "train" && !ch.headline) return;
    const m = this.m;
    if (!m) return;
    const id = this.seq++;
    const len = ch.path.cum[ch.path.cum.length - 1];
    const traces = this.view.traces
      .filter((t) => !(t.key === ch.c.key && t.state === "ghost"))
      .map((t) => {
        if (t.key === ch.c.key && ch.group !== "pour") return { ...t, state: "ghost" as const };
        if (t.key === ch.c.key) return null;
        return t.state === "fresh" ? { ...t, state: "old" as const } : t;
      })
      .filter((t): t is TraceView => t !== null);
    traces.push({ id, key: ch.c.key, d: pathD(ch.path.trace), v: ch.path.verdict, len, state: "live", thin: ch.group === "pour" });
    this.view.traces = traces.slice(-26);
    ch.traceId = id;
    this.live.push({ traceId: id, chip: ch.id });
    this.emit();
  }

  private onTray(ch: Chip) {
    const v = ch.path.verdict;
    ch.landed = true;
    this.chipEl(ch)?.classList.add("is-matched", `is-${v}`);
    this.view.counts = { ...this.view.counts, [v]: this.view.counts[v] + 1 };
    const tray = this.trays[v];
    if (tray) this.flash(tray);
    const b = this.view.badges[ch.c.key];
    this.view.badges = { ...this.view.badges, [ch.c.key]: { n: (b?.n ?? 0) + 1, v } };
    if (ch.traceId !== null) {
      const id = ch.traceId;
      this.live = this.live.filter((l) => l.traceId !== id);
      const el = this.traceEl(id);
      if (el) el.style.strokeDashoffset = "0";
      this.view.traces = this.view.traces
        .filter((t) => !(t.key === ch.c.key && t.state === "ghost" && ch.group !== "pour"))
        .map((t) => (t.id === id ? { ...t, state: ch.group === "pour" ? "old" : "fresh" } : t));
    }
    if (!ch.group && ch.headline) {
      this.view.slip = { kind: "verdict", key: ch.c.key, n: ch.n, same: ch.n > 1, touched: ch.path.touched };
    } else if (ch.group) {
      this.bulkLeft--;
      const s = this.view.slip;
      if (ch.group === "train" && s.kind === "train") this.view.slip = { ...s, done: s.done + 1 };
      if (ch.group === "pour" && s.kind === "pour") this.view.slip = { ...s, done: s.done + 1, counts: { ...s.counts, [v]: s.counts[v] + 1 } };
      if (this.bulkLeft <= 0) {
        this.view.bulk = null;
        this.showTallies();
      }
    }
    this.emit();
  }

  private onSettle(ch: Chip, t: number) {
    const m = this.m;
    if (!m) return;
    const v = ch.path.verdict;
    ch.from = ch.path.end;
    ch.t0 = t;
    if (v === "ok") {
      ch.phase = "file";
      ch.to = m.report;
      this.push({ t: t + 0.3, kind: "filed", gate: -1, chip: ch.id });
      return;
    }
    ch.phase = "settle";
    const stack = this.stacks[v];
    stack.push(ch.id);
    const cap = m.geo.cw < 60 ? CAP.phone : CAP.desk;
    if (stack.length > cap) {
      const gone = stack.shift()!;
      this.drop(gone);
      stack.forEach((id, k) => {
        const o = this.chips.get(id);
        if (!o || o.id === ch.id) return;
        this.retarget(o, this.stackPos(v, k), t);
      });
    }
    ch.to = this.stackPos(v, stack.length - 1);
  }

  private stackPos(v: "note" | "block", k: number) {
    const m = this.m!;
    return { x: m.stack[v] + LEAN[k % LEAN.length], y: m.geo.trays[v].floor - m.geo.ch / 2 - k * m.step };
  }

  private retarget(o: Chip, to: { x: number; y: number }, t: number) {
    const cur = o.to ?? o.path.end;
    o.from = { x: cur.x, y: cur.y, r: 0, sx: 1, sy: 1 };
    o.to = to;
    o.t0 = t;
    o.phase = "settle";
    o.still = false;
  }

  private onFiled(ch: Chip) {
    this.view.filed++;
    if (this.report) this.flash(this.report);
    this.drop(ch.id);
  }

  private drop(id: number) {
    const ch = this.chips.get(id);
    if (!ch) return;
    ch.phase = "gone";
    ch.still = true;
    this.chips.delete(id);
    this.view.chips = this.view.chips.filter((c) => c.id !== id);
    this.emit();
  }

  /* ---------- reduced motion, and a board that changed size ---------- */
  private instant(items: { c: Charge; path: Path; n: number }[], group: "pour" | "train" | null) {
    const m = this.m;
    if (!m) return;
    const T = now();
    if (!group) this.resetGates();
    let last: { c: Charge; path: Path; n: number } | null = null;
    for (const it of items) {
      last = it;
      const v = it.path.verdict;
      const id = this.seq++;
      const ch: Chip = {
        id,
        c: it.c,
        path: it.path,
        mode: "fast",
        release: T - it.path.dur,
        spawn: 0,
        slot: { x: m.slotX, y: m.geo.slotY },
        toss: null,
        aheads: [],
        headline: false,
        n: it.n,
        group,
        traceId: null,
        phase: "settle",
        still: false,
        landed: true,
        el: null,
      };
      this.chips.set(id, ch);
      if (v === "ok") {
        if (this.restingOk !== null) this.drop(this.restingOk);
        this.restingOk = id;
        ch.to = { x: m.geo.spineX, y: m.geo.trays.ok.floor - m.geo.ch / 2 };
        ch.from = { ...ch.to, r: 0, sx: 1, sy: 1 };
        this.view.filed++;
      } else {
        const stack = this.stacks[v];
        stack.push(id);
        const cap = m.geo.cw < 60 ? CAP.phone : CAP.desk;
        if (stack.length > cap) this.drop(stack.shift()!);
        stack.forEach((sid, k) => {
          const o = this.chips.get(sid);
          if (!o) return;
          const pos = this.stackPos(v, k);
          o.to = pos;
          o.from = { ...pos, r: 0, sx: 1, sy: 1 };
          o.t0 = T - 1;
          o.still = false;
        });
      }
      ch.t0 = T - 1;
      this.view.chips = [...this.view.chips.filter((c) => this.chips.has(c.id)), { id, key: it.c.key, amount: it.c.amount }];
      this.view.counts = { ...this.view.counts, [v]: this.view.counts[v] + 1 };
      const b = this.view.badges[it.c.key];
      this.view.badges = { ...this.view.badges, [it.c.key]: { n: (b?.n ?? 0) + 1, v } };
      it.c.gates.forEach((oc, gi) => {
        if (oc === "skip") return;
        this.tallies[gi].checked++;
        if (oc === "fire") this.tallies[gi].caught++;
      });
    }
    if (!last) return;
    /* the gates the last charge touched, lit and captioned, or the week's tallies */
    last.c.gates.forEach((oc, gi) => {
      if (oc === "skip") return;
      const state = oc === "pass" ? "pass" : (GATES[gi].fire ?? "note");
      this.show(gi, state, group ? this.tallyText(gi) : last.c.results[gi]);
      if (oc === "fire") {
        const row = this.gateEls[gi]?.row;
        if (row) row.dataset.ramp = "on";
      }
    });
    if (group) this.showTallies();
    /* traces, drawn whole */
    const keep: TraceView[] = this.view.traces.filter((t) => !items.some((it) => it.c.key === t.key)).map((t) => ({ ...t, state: "old" as const }));
    const seen = new Set<string>();
    for (const it of group === "train" ? items.slice(0, 1) : items) {
      if (seen.has(it.c.key)) continue;
      seen.add(it.c.key);
      keep.push({
        id: this.seq++,
        key: it.c.key,
        d: pathD(it.path.trace),
        v: it.path.verdict,
        len: it.path.cum[it.path.cum.length - 1],
        state: group === "pour" ? "old" : "fresh",
        thin: group === "pour",
      });
    }
    this.view.traces = keep.slice(-26);
    if (group === "train") {
      const s = this.view.slip;
      this.view.slip = { kind: "train", key: last.c.key, done: items.length, total: items.length, same: s.kind === "train" ? s.same : false };
    } else if (group === "pour") {
      const counts = { ok: 0, note: 0, block: 0 };
      items.forEach((it) => counts[it.path.verdict]++);
      this.view.slip = { kind: "pour", done: items.length, total: items.length, counts };
    } else {
      this.view.slip = { kind: "verdict", key: last.c.key, n: last.n, same: last.n > 1, touched: last.path.touched };
    }
    this.view.bulk = null;
    this.emit();
    this.kick();
  }

  /** The stage changed width: finish what is in flight at once and re-seat the stacks. */
  private relayout() {
    const m = (this.m = this.measure());
    if (!m) return;
    while (this.q.length) {
      const e = this.q.shift()!;
      if (e.kind === "filed") {
        const ch = this.chips.get(e.chip);
        if (ch) this.onFiled(ch);
        continue;
      }
      this.apply(e);
    }
    for (const s of [...this.doors, ...this.pushers, this.armS]) {
      s.to = 0;
      s.x = 0;
      s.v = 0;
    }
    this.held = [];
    this.live = [];
    for (const ch of [...this.chips.values()]) {
      if (ch.phase === "file" || (ch.phase === "air" && ch.path.verdict === "ok")) {
        this.view.filed++;
        this.drop(ch.id);
      }
    }
    (["note", "block"] as const).forEach((v) =>
      this.stacks[v].forEach((id, k) => {
        const o = this.chips.get(id);
        if (!o) return;
        const pos = this.stackPos(v, k);
        o.phase = "settle";
        o.to = pos;
        o.from = { ...pos, r: 0, sx: 1, sy: 1 };
        o.t0 = now() - 1;
        o.still = false;
        this.chipEl(o)?.classList.add("is-matched", `is-${v}`);
      }),
    );
    for (const ch of this.chips.values()) if (ch.phase === "air") this.drop(ch.id);
    this.view.traces = [];
    this.view.bulk = null;
    this.bulkLeft = 0;
    this.paintSprings();
    this.emit();
    this.kick();
  }

  /* ---------- view ---------- */
  private emit() {
    if (this.m) this.view.viewBox = this.m.box;
    if (this.emitting) return;
    this.emitting = true;
    queueMicrotask(() => {
      this.emitting = false;
      this.onView({ ...this.view });
    });
  }
}
