/*
 * The board's physics, scripted. A charge's path is a pure function of the charge and the board's
 * measured geometry: free fall under a fixed gravity, a small hop where it lands on a gate's doors,
 * a dwell while the gate reads it, then either the doors open (pass) or a pusher kicks it out of a
 * side door onto a ramp and down a rail (fire). No randomness anywhere, so the same charge on the
 * same board always takes the same path, sample for sample. Time is in seconds from release; space
 * is in pixels of the stage.
 *
 * The scheduler keeps charges in single file: each path reserves the doors it lands on or falls
 * through (from the moment they start moving for it until they are shut again) and the landing spot
 * in Cleared, and a new charge is held at the slot until its reservations are free. A charge can only
 * meet another in the spine at a door, so the doors are enough to keep them apart.
 */
import { GATES, type Charge, type Verdict } from "./data";

export type Pose = { x: number; y: number; r: number; sx: number; sy: number };
export type EvKind = "land" | "match" | "unarm" | "pass" | "fire" | "retract" | "open" | "close" | "tray";
export type Ev = { t: number; kind: EvKind; gate: number };
export type Mode = "single" | "fast";

export interface GateGeo {
  /** y of the doors' top surface */
  floor: number;
  side: "L" | "R";
  /** x of the spine groove's edge on the fire side, where the ramp starts */
  edge: number;
  /** x of the rail the ramp feeds */
  railX: number;
}

export interface Geo {
  cw: number;
  ch: number;
  g: number;
  spineX: number;
  spineW: number;
  /** chip centre at rest in the slot */
  slotY: number;
  gates: GateGeo[];
  /** ramp slope, rise over run */
  tan: number;
  trays: Record<Verdict, { floor: number; x: number }>;
}

type Seg = { t0: number; t1: number; at: (t: number) => Pose };
type Span = { k: number; a: number; b: number };

export interface Path {
  segs: Seg[];
  events: Ev[];
  /** first contact with the tray floor */
  land: number;
  /** end of the scripted path (after the hops, and for a cleared charge its short rest) */
  dur: number;
  end: Pose;
  zones: Span[];
  doors: Span[];
  /** x, y pairs from release to the tray, every STEP seconds */
  trace: number[];
  /** cumulative length at each sample */
  cum: number[];
  verdict: Verdict;
  /** the gates it touched, for the proof line: e.g. MATCH, M-041 */
  touched: string[];
}

export const STEP = 1 / 90;
const DWELL: Record<Mode, number> = { single: 0.25, fast: 0.06 };

const still = (x: number, y: number, r = 0): Pose => ({ x, y, r, sx: 1, sy: 1 });

function fallSeg(t0: number, t1: number, x: number, y0: number, v0: number, g: number): Seg {
  return { t0, t1, at: (t) => still(x, y0 + v0 * (t - t0) + 0.5 * g * (t - t0) ** 2) };
}

function restSeg(t0: number, t1: number, x: number, y: number, r = 0): Seg {
  const p = still(x, y, r);
  return { t0, t1, at: () => p };
}

/** A contact and its hop: squash on impact (the bottom stays on the surface), then up and down. */
function hopSeg(t0: number, dur: number, x: number, yRest: number, vUp: number, g: number, hh: number, impact: number): Seg {
  return {
    t0,
    t1: t0 + dur,
    at: (t) => {
      const u = t - t0;
      const lift = Math.max(0, vUp * u - 0.5 * g * u * u);
      const k = Math.max(0, 1 - u / 0.075) * impact;
      const sy = 1 - 0.16 * k;
      return { x, y: yRest - lift + (1 - sy) * hh, r: 0, sx: 1 + 0.1 * k, sy };
    },
  };
}

export function buildPath(geo: Geo, c: Charge, mode: Mode): Path {
  const { g, ch, cw, spineX, spineW } = geo;
  const hh = ch / 2;
  const dwell = DWELL[mode];
  const segs: Seg[] = [];
  const events: Ev[] = [];
  const zones: Span[] = [];
  const touched: string[] = [];
  /* doors opened by this charge and when they started being busy; their close is found by scan */
  const opened: { k: number; from: number }[] = [];
  const firedDoors: Span[] = [];

  /* the current free fall */
  const x = spineX;
  let ft = 0;
  let fy = geo.slotY;
  let fv = 0;
  const tAt = (y: number) => ft + (-fv + Math.sqrt(fv * fv + 2 * g * Math.max(0, y - fy))) / g;
  let zoneStart = 0;
  let verdict: Verdict = "ok";
  let land = 0;
  let firedAt = -1;

  for (let i = 0; i < c.gates.length; i++) {
    const oc = c.gates[i];
    const G = geo.gates[i];
    const rest = G.floor - hh;

    if (oc === "skip") {
      /* the gate does not apply: its doors open ahead of the charge and it falls straight through */
      const tArr = tAt(rest);
      const tOpen = tArr - (mode === "single" ? 0.14 : 0.1);
      events.push({ t: tOpen, kind: "open", gate: i });
      opened.push({ k: i, from: tOpen });
      zoneStart = tAt(G.floor);
      continue;
    }

    /* it lands on the doors */
    touched.push(GATES[i].code);
    const tLand = tAt(rest);
    const vLand = fv + g * (tLand - ft);
    segs.push(fallSeg(ft, tLand, x, fy, fv, g));
    events.push({ t: tLand, kind: "land", gate: i });
    const vUp = Math.min(vLand * 0.24, Math.sqrt(2 * g * (mode === "single" ? 6 : 3)));
    const hop = (2 * vUp) / g;
    segs.push(hopSeg(tLand, hop, x, rest, vUp, g, hh, Math.min(1, vLand / (g * 0.3))));
    let t = tLand + hop;
    if (i === 0) {
      /* the card charge's latch reaches out and meets the receipt */
      events.push({ t: tLand + 0.05, kind: "match", gate: 0 });
      events.push({ t: tLand + 0.05 + (mode === "single" ? 0.34 : 0.16), kind: "unarm", gate: 0 });
    }
    const d = dwell + (i === 0 && mode === "single" ? 0.07 : 0);
    segs.push(restSeg(t, t + d, x, rest));
    t += d;

    if (oc === "pass") {
      events.push({ t, kind: "pass", gate: i });
      opened.push({ k: i, from: tLand - 0.02 });
      const start = t + 0.035;
      segs.push(restSeg(t, start, x, rest));
      ft = start;
      fy = rest;
      fv = 0;
      zoneStart = tAt(G.floor);
      continue;
    }

    /* fire: the pusher kicks it out of the side door, onto the ramp, down the rail */
    firedAt = i;
    verdict = GATES[i].fire ?? "note";
    events.push({ t, kind: "fire", gate: i });
    events.push({ t: t + 0.2, kind: "retract", gate: i });
    const dir = G.side === "R" ? 1 : -1;
    const contact = t + 0.03;
    segs.push(restSeg(t, contact, x, rest));
    const vk = g * (mode === "single" ? 0.2 : 0.26);
    const ta = 0.05;
    const dist = Math.abs(G.edge - x);
    const tEdge = contact + (dist >= (vk * ta) / 2 ? dist / vk + ta / 2 : Math.sqrt((2 * dist * ta) / vk));
    segs.push({
      t0: contact,
      t1: tEdge,
      at: (tt) => {
        const u = tt - contact;
        const s = u < ta ? (vk * u * u) / (2 * ta) : vk * (u - ta / 2);
        return still(x + dir * s, rest);
      },
    });
    /* the ramp: horizontal acceleration g sin cos, the surface falling at `tan` */
    const tan = geo.tan;
    const phi = (Math.atan(tan) * 180) / Math.PI;
    const ax = (g * tan) / (1 + tan * tan);
    const D = Math.abs(G.railX - G.edge);
    const uR = (-vk + Math.sqrt(vk * vk + 2 * ax * D)) / ax;
    const tRail = tEdge + uR;
    segs.push({
      t0: tEdge,
      t1: tRail,
      at: (tt) => {
        const u = tt - tEdge;
        const s = vk * u + 0.5 * ax * u * u;
        return still(G.edge + dir * s, rest + s * tan, dir * phi * Math.min(1, s / 14));
      },
    });
    /* its trailing edge leaves the spine: the zone and the doors are free again */
    const half = cw / 2;
    const uOut = half <= D ? (-vk + Math.sqrt(vk * vk + 2 * ax * half)) / ax : uR;
    firedDoors.push({ k: i, a: tLand - 0.02, b: Math.max(tEdge + uOut, t + 0.26) });

    /* the rail: it knocks the outer wall and falls, straightening */
    const vx = vk + ax * uR;
    const vy = vx * tan;
    const yR = rest + D * tan;
    const tray = geo.trays[verdict];
    const restT = tray.floor - hh;
    const uF = (-vy + Math.sqrt(vy * vy + 2 * g * Math.max(0, restT - yR))) / g;
    const tTray = tRail + uF;
    segs.push({
      t0: tRail,
      t1: tTray,
      at: (tt) => {
        const u = tt - tRail;
        const w = Math.min(1, u / 0.16);
        const knock = Math.sin(Math.PI * w) * (1 - 0.4 * w) * 5;
        const r = dir * phi * (1 - w) * (1 - w) - dir * 5 * Math.sin(Math.PI * Math.min(1, u / 0.22)) * (1 - w);
        return still(G.railX + dir * knock, yR + vy * u + 0.5 * g * u * u, r);
      },
    });
    const vT = vy + g * uF;
    land = tTray;
    t = tTray;
    t = trayHops(segs, t, G.railX, restT, vT, g, hh, mode);
    events.push({ t: land, kind: "tray", gate: -1 });
    break;
  }

  if (firedAt < 0) {
    /* through every gate: down the spine into Cleared */
    const tray = geo.trays.ok;
    const restT = tray.floor - hh;
    const tLand = tAt(restT);
    const vLand = fv + g * (tLand - ft);
    segs.push(fallSeg(ft, tLand, x, fy, fv, g));
    land = tLand;
    let t = trayHops(segs, tLand, x, restT, vLand, g, hh, mode);
    const rest = mode === "single" ? 0.28 : 0.02;
    segs.push(restSeg(t, t + rest, x, restT));
    t += rest;
    zones.push({ k: GATES.length, a: zoneStart, b: mode === "single" ? t + 0.1 : t });
    events.push({ t: land, kind: "tray", gate: -1 });
  }

  const last = segs[segs.length - 1];
  const dur = last.t1;
  const at = (t: number): Pose => poseIn(segs, t);

  /* each opened door closes once the charge has dropped clear of it: its top a little below the door
     plane (the doors swing up behind it), or out through a side door, or landed */
  const doors: Span[] = [...firedDoors];
  const clear = mode === "single" ? 10 : 3;
  const tail = mode === "single" ? 0.11 : 0.07;
  for (const o of opened) {
    const floor = geo.gates[o.k].floor;
    let tc = dur;
    for (let t = Math.max(0, o.from); t <= dur; t += 1 / 240) {
      const p = at(t);
      const below = p.y - hh > floor + clear;
      const out = Math.abs(p.x - spineX) > spineW / 2 + cw / 2;
      if (below || out) {
        tc = t;
        break;
      }
    }
    events.push({ t: tc + 0.02, kind: "close", gate: o.k });
    doors.push({ k: o.k, a: o.from, b: tc + tail });
  }
  events.sort((a, b) => a.t - b.t);

  const trace: number[] = [];
  const cum: number[] = [];
  let len = 0;
  for (let t = 0; t <= land + 1e-6; t += STEP) {
    const p = at(t);
    if (trace.length) len += Math.hypot(p.x - trace[trace.length - 2], p.y - trace[trace.length - 1]);
    trace.push(p.x, p.y);
    cum.push(len);
  }
  const pl = at(land);
  len += Math.hypot(pl.x - trace[trace.length - 2], pl.y - trace[trace.length - 1]);
  trace.push(pl.x, pl.y);
  cum.push(len);

  return { segs, events, land, dur, end: at(dur), zones, doors, trace, cum, verdict, touched };
}

function trayHops(segs: Seg[], t: number, x: number, rest: number, v: number, g: number, hh: number, mode: Mode): number {
  const up1 = Math.min(v * 0.3, Math.sqrt(2 * g * (mode === "single" ? 14 : 8)));
  const h1 = (2 * up1) / g;
  segs.push(hopSeg(t, h1, x, rest, up1, g, hh, Math.min(1, v / (g * 0.35))));
  const up2 = up1 * 0.34;
  const h2 = (2 * up2) / g;
  segs.push(hopSeg(t + h1, h2, x, rest, up2, g, hh, 0.35));
  return t + h1 + h2;
}

export function poseIn(segs: Seg[], t: number): Pose {
  if (t <= segs[0].t0) return segs[0].at(segs[0].t0);
  for (const s of segs) if (t <= s.t1) return s.at(Math.max(t, s.t0));
  const l = segs[segs.length - 1];
  return l.at(l.t1);
}

export function pathD(trace: number[]): string {
  let d = "";
  for (let i = 0; i < trace.length; i += 2) d += `${i ? "L" : "M"}${trace[i].toFixed(1)} ${trace[i + 1].toFixed(1)}`;
  return d;
}

/** Length of trace drawn by time t from release. */
export function drawnAt(p: Path, t: number): number {
  if (t <= 0) return 0;
  const i = Math.floor(t / STEP);
  if (i >= p.cum.length - 1) return p.cum[p.cum.length - 1];
  const f = t / STEP - i;
  return p.cum[i] + (p.cum[i + 1] - p.cum[i]) * f;
}

export type Held = { kind: "zone" | "door"; k: number; a: number; b: number };

/** The earliest release at or after `earliest` whose zones and doors do not overlap anything held. */
export function schedule(p: Path, earliest: number, held: Held[]): number {
  const M = 0.02;
  let s = earliest;
  for (let n = 0; n < 400; n++) {
    let next = s;
    for (const kind of ["zone", "door"] as const) {
      const mine = kind === "zone" ? p.zones : p.doors;
      for (const z of mine) {
        for (const h of held) {
          if (h.kind !== kind || h.k !== z.k) continue;
          if (s + z.a - M < h.b && s + z.b + M > h.a) next = Math.max(next, h.b - z.a + M);
        }
      }
    }
    if (next === s) return s;
    s = next;
  }
  return s;
}

export function hold(p: Path, release: number): Held[] {
  return [
    ...p.zones.map((z) => ({ kind: "zone" as const, k: z.k, a: release + z.a, b: release + z.b })),
    ...p.doors.map((z) => ({ kind: "door" as const, k: z.k, a: release + z.a, b: release + z.b })),
  ];
}
