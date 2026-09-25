"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import {
  BEAT,
  BEATS,
  CHECK,
  CLEARED,
  CLEARED_TOTAL,
  DUPES,
  EXCEPTIONS,
  MONTH,
  PEOPLE,
  PERSON_INK,
  RULE_BEATS,
  byPerson,
  flagBeat,
  fxAmount,
  fxRate,
  money,
  shortDate,
} from "./data";

/*
 * The pile: every charge of the month as a paper slip, in one sticky scene behind the page's copy.
 * Each sorting beat (data.ts BEAT) is a full layout of all 98 slips; scroll position picks a point
 * between two layouts, each slip eases across on its own stagger, and a hand-written spring per slip
 * (position, turn, scale, flip) chases that target, so slips overshoot, settle and flutter like paper.
 * Receipts are their own slips of paper that fly from text, email and upload to their charge.
 * Reduced motion: the same layouts, snapped, no springs, no toss, no nudge. Without script: the pile,
 * placed by CSS from the same seeded positions.
 */

const N = MONTH.length;
const F = 10; // stride: x y r s o f z chip clip stamp
const [X, Y, R, S, O, FL, Z, CHIP, CLIP, STAMP] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/* deterministic noise in [0, 1) */
function rnd(i: number, salt: number) {
  let h = Math.imul(i + 1, 374761393) ^ Math.imul(salt + 7, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const ramp = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const smooth = (x: number) => x * x * (3 - 2 * x);

const LANE = MONTH.map((r) => PEOPLE.findIndex((p) => p.id === r.who));
const POS = MONTH.map((r) => byPerson(r.who).indexOf(r));
const LANE_N = PEOPLE.map((p) => byPerson(p.id).length);
const FLAG = MONTH.map(flagBeat);
const TRAY = [...EXCEPTIONS].sort((a, b) => flagBeat(a) - flagBeat(b) || a.id.localeCompare(b.id));
const TRAY_K = MONTH.map((r) => TRAY.indexOf(r));
const DUPE_ROLE = new Map<string, { k: number; second: boolean }>();
DUPES.forEach(([a, b], k) => {
  DUPE_ROLE.set(a.id, { k, second: false });
  DUPE_ROLE.set(b.id, { k, second: true });
});
/* which door each receipt came through: text, email, upload (illustrative; the month does not record it) */
const CHANNEL = MONTH.map((r, i) => (r.receipt ? Math.floor(rnd(i, 71) * 3) : -1));
export const CHANNELS = ["Text", "Email", "Upload"];

/* the pile, as fractions of the scene box: a mound with a few strays, and a stacking order */
const PILE = MONTH.map((_, i) => {
  const a = rnd(i, 1) * Math.PI * 2;
  const m = Math.sqrt(-2 * Math.log(1 - rnd(i, 2) * 0.985));
  /* rounded, so the server's and the browser's Math agree to the digit (hydration) */
  const q = (v: number) => Math.round(v * 1e4) / 1e4;
  return {
    fx: q(clamp(0.5 + Math.cos(a) * m * 0.17, 0.1, 0.9)),
    fy: q(clamp(0.5 + Math.sin(a) * m * 0.16, 0.12, 0.88)),
    r: q((rnd(i, 3) - 0.5) * 64),
  };
});
const PILE_Z = MONTH.map((_, i) => i)
  .sort((a, b) => rnd(a, 4) - rnd(b, 4))
  .reduce<number[]>((z, i, k) => ((z[i] = k), z), []);

type Geo = {
  W: number;
  H: number;
  mobile: boolean;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  sw: number;
  sh: number;
  sx0: number;
  sx1: number;
  bandY0: number;
  bandY1: number;
  laneY0: number;
  laneH: number;
  trayX: number;
  trayY0: number;
  trayY1: number;
  folder: { x: number; y: number; w: number; h: number };
  src: { x: number; y: number }[];
};

function geo(W: number, H: number): Geo {
  const mobile = W < 820;
  if (!mobile) {
    const x0 = Math.max(W * 0.41, 380);
    const x1 = W - 32;
    const y0 = 84;
    const y1 = H - 70;
    const sw = clamp((x1 - x0) / 7.2, 72, 112);
    const sh = sw * 0.58;
    const trayW = sw * 1.3;
    const mx1 = x1 - trayW - 18;
    const sx0 = x0 + sw * 0.95;
    const bandY0 = y0 + 6;
    const bandY1 = bandY0 + sh * 3.1;
    const laneY0 = bandY1 + 8;
    const laneH = (y1 - laneY0) / 6;
    const fw = Math.min(360, (mx1 - x0) * 0.62);
    return {
      W, H, mobile, x0, y0, x1, y1, sw, sh, sx0, sx1: mx1, bandY0, bandY1, laneY0, laneH,
      trayX: x1 - trayW / 2,
      trayY0: y0 + 74,
      trayY1: y1 - sh * 0.2,
      folder: { x: (x0 + mx1) / 2, y: laneY0 + (y1 - laneY0) * 0.52, w: fw, h: fw * 0.58 },
      src: [0.2, 0.5, 0.8].map((f) => ({ x: sx0 + (mx1 - sx0) * f, y: (bandY0 + bandY1) / 2 })),
    };
  }
  const x0 = 12;
  const x1 = W - 12;
  const y0 = 56;
  const y1 = Math.round(H * 0.6);
  const sw = clamp((x1 - x0) / 6.3, 50, 74);
  const sh = sw * 0.58;
  const sx0 = x0 + 30;
  const bandY0 = y0 + 4;
  const bandY1 = bandY0 + sh * 3;
  const laneY0 = bandY1 + 6;
  const trayRow = y1 - sh * 0.62;
  const laneH = (trayRow - sh * 0.75 - laneY0) / 6;
  const fw = Math.min(250, W * 0.64);
  return {
    W, H, mobile, x0, y0, x1, y1, sw, sh, sx0, sx1: x1, bandY0, bandY1, laneY0, laneH,
    trayX: 0,
    trayY0: trayRow,
    trayY1: trayRow,
    folder: { x: W / 2, y: laneY0 + laneH * 3.2, w: fw, h: fw * 0.58 },
    src: [0.18, 0.5, 0.82].map((f) => ({ x: x0 + (x1 - x0) * f, y: (bandY0 + bandY1) / 2 })),
  };
}

/* where the threshold of rule beat b sits on the ruler */
function rulerX(g: Geo, b: number, v: number) {
  const rb = RULE_BEATS[b - BEAT.dinner];
  const [d0, d1] = rb.domain;
  return g.sx0 + g.sw / 2 + clamp((v - d0) / (d1 - d0)) * (g.sx1 - g.sx0 - g.sw);
}

function trayPos(g: Geo, k: number): [number, number, number] {
  const n = TRAY.length;
  if (g.mobile) {
    const step = (g.x1 - g.x0 - g.sw) / (n - 1);
    return [g.x0 + g.sw / 2 + k * step, g.trayY0, (rnd(k, 90) - 0.5) * 8];
  }
  const step = Math.min(g.sh * 0.72, (g.trayY1 - g.trayY0 - g.sh) / (n - 1));
  return [g.trayX + (k % 2 ? 5 : -5), g.trayY0 + g.sh / 2 + k * step, (rnd(k, 91) - 0.5) * 7];
}

function build(g: Geo): Float32Array[] {
  const B = Array.from({ length: BEATS }, () => new Float32Array(N * F));
  const put = (b: number, i: number, v: number[]) => B[b].set(v, i * F);

  /* ruler placements, per rule beat */
  const ruler = new Map<string, [number, number, number, number]>(); // key b|id -> x y r chip
  for (const rb of RULE_BEATS) {
    const b = rb.beat;
    const rows = MONTH.filter((r, i) => rb.applies(r) && !(FLAG[i] < b)).sort((a, c) => rb.value(a) - rb.value(c));
    let no = 0;
    let nu = 0;
    /* over the line, the slips spread out across the hatched zone in value order so each can be read */
    const nOver = rows.filter((r) => CHECK[r.id].codes.includes(rb.code)).length;
    const lx = rb.at === null ? 0 : rulerX(g, b, rb.at);
    const ox0 = lx + g.sw * 0.62;
    const ox1 = Math.max(ox0, g.sx1 - g.sw * 0.5);
    rows.forEach((r, rank) => {
      const over = CHECK[r.id].codes.includes(rb.code);
      const row = over ? no++ : nu++;
      let x: number;
      let y: number;
      if (rb.at === null) {
        x = g.sx0 + (g.sx1 - g.sx0) * (0.28 + rank * 0.22);
        y = g.bandY0 + g.sh * 1.25;
      } else {
        x = over ? (nOver > 1 ? ox0 + ((ox1 - ox0) * row) / (nOver - 1) : (ox0 + ox1) / 2) : rulerX(g, b, rb.value(r));
        y = over ? g.bandY0 + g.sh * (row % 2 ? 1.2 : 0.6) : g.bandY0 + g.sh * (row % 2 ? 2.45 : 1.85);
      }
      ruler.set(`${b}|${r.id}`, [x, y, (rnd(rank, b) - 0.5) * 10, over ? 1 : 0]);
    });
  }

  const span = g.sx1 - g.sx0;
  const pairGap = span / Math.max(1, DUPES.length);

  MONTH.forEach((r, i) => {
    const bw = g.x1 - g.x0;
    const bh = g.y1 - g.y0;
    put(0, i, [g.x0 + PILE[i].fx * bw, g.y0 + PILE[i].fy * bh, PILE[i].r, 1, 1, 0, 10 + PILE_Z[i], 0, 0, 0]);

    const n = LANE_N[LANE[i]];
    const step = Math.min(g.sw * 0.92, (span - g.sw) / Math.max(1, n - 1));
    const lx = g.sx0 + g.sw / 2 + POS[i] * step;
    const ly = g.laneY0 + (LANE[i] + 0.5) * g.laneH + (rnd(i, 5) - 0.5) * g.laneH * 0.16;
    const lr = (rnd(i, 6) - 0.5) * 9;
    const fx = r.fx ? 1 : 0;

    for (let b = 1; b < BEATS; b++) {
      let x = lx;
      let y = ly;
      let rot = lr;
      let s = 1;
      let o = 1;
      let z = 10 + POS[i] + LANE[i] * 30;
      let clip = 0;
      let stamp = 0;
      const f = fx && b >= BEAT.convert ? 1 : 0;
      const chip = FLAG[i] <= b ? 1 : 0;
      const inTray = FLAG[i] < b;

      if (b === BEAT.convert) {
        if (fx) {
          y -= g.laneH * 0.22;
          s = 1.08;
          z += 300;
          stamp = 1;
        } else o = 0.34;
      } else if (b === BEAT.dupes) {
        const d = DUPE_ROLE.get(r.id);
        if (d) {
          const cx = g.sx0 + (d.k + 0.5) * pairGap;
          x = cx + (d.second ? 0.3 : -0.3) * g.sw;
          y = (g.bandY0 + g.bandY1) / 2 + (d.second ? 0.22 : -0.12) * g.sh;
          rot = d.second ? 7 : -4;
          s = g.mobile ? 1.15 : 1.25;
          z = d.second ? 520 : 510;
          clip = d.second ? 1 : 0;
        } else o = 0.34;
      } else if (b >= BEAT.dinner && b <= BEAT.receipt) {
        const hit = ruler.get(`${b}|${r.id}`);
        if (hit) {
          [x, y, rot] = hit;
          z = 420 + Math.round((x / g.W) * 60);
        } else o = 0.3;
      } else if (b === BEAT.file) {
        const fo = g.folder;
        x = fo.x + (rnd(i, 8) - 0.5) * fo.w * 0.66;
        y = fo.y - fo.h * 0.36 + rnd(i, 9) * fo.h * 0.16;
        rot = (rnd(i, 10) - 0.5) * 18;
        s = 0.6;
        z = 60 + i;
      }
      if (inTray) {
        [x, y, rot] = trayPos(g, TRAY_K[i]);
        s = g.mobile ? 0.9 : 0.95;
        o = 1;
        z = 900 + TRAY_K[i];
      }
      put(b, i, [x, y, rot, s, o, f, z, chip, clip, stamp]);
    }
  });
  return B;
}

/* stagger: when, within the move into beat b, slip i starts (0..dmax) */
function delay(b: number, i: number) {
  if (b === BEAT.arrive) return (POS[i] / LANE_N[LANE[i]]) * 0.26 + LANE[i] * 0.02;
  if (b === BEAT.file) return (i / N) * 0.5;
  return rnd(i, b + 20) * 0.22;
}
const DMAX = (b: number) => (b === BEAT.file ? 0.5 : b === BEAT.arrive ? 0.36 : 0.22);

export function PileScene() {
  const scene = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = scene.current;
    if (!root) return;
    const main = root.closest("main") ?? document.body;
    const slips = Array.from(root.querySelectorAll<HTMLElement>("[data-slip]"));
    const rcpts = new Map<number, HTMLElement>();
    root.querySelectorAll<HTMLElement>("[data-rcpt]").forEach((el) => rcpts.set(+el.dataset.rcpt!, el));
    const q = <T extends HTMLElement>(s: string) => Array.from(root.querySelectorAll<T>(s));
    const laneEls = q("[data-lane]");
    const srcEls = q("[data-src]");
    const ruleEls = q("[data-rule]");
    const tray = root.querySelector<HTMLElement>("[data-tray]")!;
    const trayN = root.querySelector<HTMLElement>("[data-tray-n]")!;
    const folder = q("[data-folder]");
    const chips = q("[data-export]");
    const copies = Array.from(main.querySelectorAll<HTMLElement>(".md-beat .md-copy"));
    const hero = main.querySelector<HTMLElement>(".md-hero");
    const copyO = new Map<HTMLElement, string>();
    const markers = Array.from(main.querySelectorAll<HTMLElement>("[data-md-beat]")).sort((a, b) => +a.dataset.mdBeat! - +b.dataset.mdBeat!);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");

    let g = geo(window.innerWidth, window.innerHeight);
    let beats = build(g);

    /* live state */
    const cur = new Float32Array(N * 5); // x y r s f
    const vel = new Float32Array(N * 5);
    const rc = new Float32Array(N * 3); // receipt x y r
    const rv = new Float32Array(N * 3);
    const K = MONTH.map((_, i) => 150 + rnd(i, 30) * 90);
    const Zeta = MONTH.map((_, i) => 0.5 + rnd(i, 31) * 0.2);
    const born = new Float64Array(N);
    const last = { tf: new Array<string>(N).fill(""), o: new Float32Array(N).fill(-1), z: new Int32Array(N).fill(-1), usd: new Int8Array(N).fill(-1), chip: new Float32Array(N).fill(-1), clip: new Float32Array(N).fill(-1), stamp: new Float32Array(N).fill(-1), lift: new Float32Array(N).fill(-1) };
    const lastR = { tf: new Map<number, string>(), o: new Map<number, number>() };
    const tgt = new Float32Array(F);
    const other = new Float32Array(F);

    const applyGeo = () => {
      root.style.setProperty("--sw", `${g.sw}px`);
      root.style.setProperty("--sh", `${g.sh}px`);
      laneEls.forEach((el, k) => {
        el.style.transform = `translate(${g.x0}px, ${g.laneY0 + (k + 0.5) * g.laneH}px) translateY(-50%)`;
        el.style.width = `${g.sx0 - g.x0 - 6}px`;
      });
      srcEls.forEach((el, k) => {
        el.style.transform = `translate(${g.src[k].x}px, ${g.src[k].y}px) translate(-50%, -50%)`;
      });
      ruleEls.forEach((el) => {
        const b = +el.dataset.rule!;
        const rb = RULE_BEATS[b - BEAT.dinner];
        const x = rb.at === null ? g.sx0 - 6 : rulerX(g, b, rb.at);
        el.style.transform = `translate(${x}px, ${g.bandY0 - 4}px)`;
        el.style.setProperty("--lh", `${g.y1 - g.bandY0 - (g.mobile ? g.sh * 1.2 : 0)}px`);
        el.style.setProperty("--zone", `${Math.max(0, g.sx1 - x + g.sw * 0.3)}px`);
        el.style.setProperty("--bandh", `${g.bandY1 - g.bandY0 + 8}px`);
      });
      if (g.mobile) tray.style.transform = `translate(${g.x0}px, ${g.trayY0 - g.sh * 0.5 - 22}px)`;
      else tray.style.transform = `translate(${g.trayX - g.sw * 0.62}px, ${g.y0 + 6}px)`;
      folder.forEach((el) => {
        const f = g.folder;
        el.style.width = `${f.w}px`;
        el.style.height = `${f.h}px`;
        el.style.transform = `translate(${f.x - f.w / 2}px, ${f.y - f.h / 2}px)`;
      });
    };
    applyGeo();
    root.classList.add("is-live");

    /* where the page is: t runs 0 (the pile) to BEATS - 1 (filed) */
    const readT = () => {
      const H = window.innerHeight;
      /* a beat's move runs while its block's top travels from a*H to (a - w)*H */
      const a = g.mobile ? 1.0 : 0.62;
      const w = g.mobile ? 0.45 : 0.5;
      let t = 0;
      for (const m of markers) t += clamp((a * H - m.getBoundingClientRect().top) / (w * H));
      return Math.min(t, BEATS - 1);
    };

    let t = readT();
    const motion = () => !reduce.matches;
    const now0 = performance.now();

    /* start state: tossed from above when the page opens at the top; otherwise where the page is */
    const seed = (toss: boolean) => {
      for (let i = 0; i < N; i++) {
        target(i, t, now0 + 1e9);
        if (toss) {
          cur[i * 5] = tgt[X] + (rnd(i, 40) - 0.5) * 160;
          cur[i * 5 + 1] = -g.sh * 1.5 - rnd(i, 41) * g.H * 0.8;
          cur[i * 5 + 2] = (rnd(i, 42) - 0.5) * 140;
          born[i] = now0 + 150 + PILE_Z[i] * 8.5;
        } else {
          cur[i * 5] = tgt[X];
          cur[i * 5 + 1] = tgt[Y];
          cur[i * 5 + 2] = tgt[R];
          born[i] = 0;
        }
        cur[i * 5 + 3] = tgt[S];
        cur[i * 5 + 4] = tgt[FL];
        vel.fill(0, i * 5, i * 5 + 5);
      }
    };

    const pointer = { x: -1e4, y: -1e4, on: false };

    /* the target of slip i at scroll t */
    function target(i: number, tt: number, now: number) {
      const b = Math.min(Math.floor(tt), BEATS - 1);
      const l = tt - b;
      const A = beats[b];
      for (let k = 0; k < F; k++) tgt[k] = A[i * F + k];
      if (b < BEATS - 1 && l > 0) {
        const nb = b + 1;
        const Bn = beats[nb];
        const e = smooth(clamp((l - delay(nb, i)) / (1 - DMAX(nb))));
        for (let k = 0; k < F; k++) other[k] = Bn[i * F + k];
        for (const k of [X, Y, R, S, O, FL, CHIP, CLIP, STAMP]) tgt[k] += (other[k] - tgt[k]) * e;
        if (e > 0.5) tgt[Z] = other[Z];
        else if (e > 0.02) tgt[Z] = Math.max(tgt[Z], other[Z]);
      }
      /* the pile answers the pointer, a little */
      if (pointer.on && tt < 0.35 && motion()) {
        const dx = tgt[X] - pointer.x;
        const dy = tgt[Y] - pointer.y;
        const d = Math.hypot(dx, dy);
        const Rr = g.sw * 1.35;
        if (d < Rr && d > 0.01) {
          const p = (1 - d / Rr) ** 2 * g.sw * 0.55 * (1 - tt / 0.35);
          tgt[X] += (dx / d) * p;
          tgt[Y] += (dy / d) * p;
          tgt[R] += (dx > 0 ? 1 : -1) * p * 0.25;
        }
      }
      if (now < born[i]) {
        tgt[X] = cur[i * 5];
        tgt[Y] = cur[i * 5 + 1];
        tgt[R] = cur[i * 5 + 2];
      }
    }

    seed(motion() && window.scrollY < window.innerHeight * 0.3);

    let raf = 0;
    let prev = performance.now();
    let dirty = true;

    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(1 / 30, (now - prev) / 1000);
      prev = now;
      const snap = !motion();
      t = readT();
      let moving = false;

      for (let i = 0; i < N; i++) {
        target(i, t, now);
        const c = i * 5;
        const k = K[i];
        const damp = 2 * Zeta[i] * Math.sqrt(k);
        const tv = [tgt[X], tgt[Y], tgt[R], tgt[S], tgt[FL]];
        for (let a = 0; a < 5; a++) {
          if (snap) {
            cur[c + a] = tv[a];
            vel[c + a] = 0;
            continue;
          }
          const kk = a === 4 ? 180 : a === 3 ? k * 1.3 : k;
          const dd = a === 4 ? 2 * 0.8 * Math.sqrt(180) : a === 3 ? damp * 1.14 : damp;
          for (let sub = 0; sub < 2; sub++) {
            const h = dt / 2;
            vel[c + a] += (kk * (tv[a] - cur[c + a]) - dd * vel[c + a]) * h;
            cur[c + a] += vel[c + a] * h;
          }
          if (Math.abs(vel[c + a]) > 0.02 || Math.abs(tv[a] - cur[c + a]) > 0.05) moving = true;
        }
        if (now < born[i]) moving = true;

        /* paint the slip */
        const el = slips[i];
        const speed = Math.hypot(vel[c], vel[c + 1]);
        const lift = snap ? 0 : clamp(speed / 1600);
        const sc = cur[c + 3] * (1 + lift * 0.06);
        const flip = cur[c + 4];
        const sx = Math.max(0.04, Math.abs(Math.cos(Math.PI * flip)));
        const tf = `translate3d(${(cur[c] - g.sw / 2).toFixed(1)}px,${(cur[c + 1] - g.sh / 2).toFixed(1)}px,0) rotate(${cur[c + 2].toFixed(2)}deg) scale(${(sc * sx).toFixed(3)},${sc.toFixed(3)})`;
        if (tf !== last.tf[i]) {
          el.style.transform = tf;
          last.tf[i] = tf;
        }
        const o = Math.round(tgt[O] * 50) / 50;
        if (o !== last.o[i]) {
          el.style.opacity = String(o);
          last.o[i] = o;
        }
        const z = Math.round(tgt[Z]) * 2;
        if (z !== last.z[i]) {
          el.style.zIndex = String(z);
          last.z[i] = z;
          const re = rcpts.get(i);
          if (re) re.style.zIndex = String(z + 1);
        }
        const usd = flip > 0.5 ? 1 : 0;
        if (usd !== last.usd[i]) {
          el.classList.toggle("is-usd", usd === 1);
          last.usd[i] = usd;
        }
        for (const [key, idx] of [["chip", CHIP], ["clip", CLIP], ["stamp", STAMP]] as const) {
          const v = Math.round(tgt[idx] * 20) / 20;
          if (v !== last[key][i]) {
            el.style.setProperty(`--${key}`, String(v));
            last[key][i] = v;
          }
        }
        const lf = Math.round(lift * 20) / 20;
        if (lf !== last.lift[i]) {
          el.style.setProperty("--lift", String(lf));
          last.lift[i] = lf;
        }

        /* its receipt */
        const re = rcpts.get(i);
        if (re) {
          const ch = CHANNEL[i];
          const src = g.src[ch];
          const sxr = src.x + (rnd(i, 50) - 0.5) * g.sw * 0.4;
          const syr = src.y + (rnd(i, 51) - 0.5) * g.sh * 0.3;
          let e: number;
          if (t >= BEAT.arrive) e = 1;
          else e = smooth(clamp((t - 0.42 - delay(BEAT.arrive, i) * 0.8) / 0.28));
          const rot = (cur[c + 2] * Math.PI) / 180;
          const ax = g.sw * 0.34 * cur[c + 3];
          const ay = -g.sh * 0.46 * cur[c + 3];
          const px = cur[c] + ax * Math.cos(rot) - ay * Math.sin(rot);
          const py = cur[c + 1] + ax * Math.sin(rot) + ay * Math.cos(rot);
          const txr = sxr + (px - sxr) * e;
          const tyr = syr + (py - syr) * e - Math.sin(Math.PI * e) * g.sh * 1.6;
          const trr = (rnd(i, 52) - 0.5) * 30 * (1 - e) + (cur[c + 2] + 9) * e;
          const rr = i * 3;
          const tvr = [txr, tyr, trr];
          for (let a = 0; a < 3; a++) {
            if (snap || e === 0) {
              rc[rr + a] = tvr[a];
              rv[rr + a] = 0;
              continue;
            }
            for (let sub = 0; sub < 2; sub++) {
              const h = dt / 2;
              rv[rr + a] += (300 * (tvr[a] - rc[rr + a]) - 2 * 0.62 * Math.sqrt(300) * rv[rr + a]) * h;
              rc[rr + a] += rv[rr + a] * h;
            }
            if (Math.abs(rv[rr + a]) > 0.02 || Math.abs(tvr[a] - rc[rr + a]) > 0.05) moving = true;
          }
          const srcVis = ramp(t, 0.3, 0.62) * (1 - ramp(t, 1.55, 1.9));
          const ro = Math.round((e > 0.01 ? tgt[O] : srcVis * 0.9) * 50) / 50;
          const rtf = `translate3d(${rc[rr].toFixed(1)}px,${rc[rr + 1].toFixed(1)}px,0) translate(-50%,-50%) rotate(${rc[rr + 2].toFixed(2)}deg) scale(${cur[c + 3].toFixed(3)})`;
          if (rtf !== lastR.tf.get(i)) {
            re.style.transform = rtf;
            lastR.tf.set(i, rtf);
          }
          if (ro !== lastR.o.get(i)) {
            re.style.opacity = String(ro);
            lastR.o.set(i, ro);
          }
        }
      }

      /* on a phone the copy shares the screen with the pile: a card that has had its turn fades as it rises
         into the pile, and the hero steps back while the lanes form */
      const setO = (el: HTMLElement, v: string) => {
        if (copyO.get(el) !== v) {
          el.style.opacity = v;
          el.style.pointerEvents = v !== "" && +v < 0.1 ? "none" : "";
          copyO.set(el, v);
        }
      };
      if (g.mobile) {
        const H = window.innerHeight;
        for (const el of copies) {
          const pinned = H - 64 - el.offsetHeight;
          setO(el, ramp(el.getBoundingClientRect().top, pinned - 170, pinned - 16).toFixed(3));
        }
        if (hero) setO(hero, ramp(hero.getBoundingClientRect().bottom, H * 0.45, H * 0.8).toFixed(3));
      } else {
        for (const el of copies) setO(el, "");
        if (hero) setO(hero, "");
      }

      /* the scene's furniture */
      const laneVis = ramp(t, 0.45, 0.85) * (1 - ramp(t, BEAT.file - 0.75, BEAT.file - 0.35));
      laneEls.forEach((el) => (el.style.opacity = laneVis.toFixed(3)));
      const srcVis = ramp(t, 0.3, 0.62) * (1 - ramp(t, 1.55, 1.9));
      srcEls.forEach((el) => (el.style.opacity = srcVis.toFixed(3)));
      ruleEls.forEach((el) => {
        const b = +el.dataset.rule!;
        const vis = ramp(t, b - 0.62, b - 0.3) * (1 - ramp(t, b + 0.28, b + 0.55));
        el.style.opacity = vis.toFixed(3);
        el.style.setProperty("--draw", smooth(ramp(t, b - 0.55, b - 0.08)).toFixed(3));
      });
      tray.style.opacity = ramp(t, BEAT.dupes - 0.5, BEAT.dupes - 0.15).toFixed(3);
      const inTray = FLAG.filter((fb) => fb + 1 <= t + 0.45).length;
      const tn = String(inTray);
      if (trayN.textContent !== tn) trayN.textContent = tn;
      const fv = ramp(t, BEAT.file - 0.8, BEAT.file - 0.45).toFixed(3);
      folder.forEach((el) => (el.style.opacity = fv));
      chips.forEach((el, k) => (el.style.opacity = ramp(t, BEAT.file - 0.5 + k * 0.07, BEAT.file - 0.28 + k * 0.07).toFixed(3)));

      if (moving || dirty) {
        dirty = false;
        raf = requestAnimationFrame(frame);
      }
    };

    const wake = () => {
      dirty = true;
      if (!raf) {
        prev = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    const onResize = () => {
      g = geo(window.innerWidth, window.innerHeight);
      beats = build(g);
      applyGeo();
      last.tf.fill("");
      wake();
    };
    const onMove = (e: PointerEvent) => {
      if (!fine.matches || e.pointerType !== "mouse") return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.on = true;
      if (t < 0.35) wake();
    };
    const onLeave = () => {
      pointer.on = false;
      wake();
    };
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    reduce.addEventListener("change", wake);
    wake();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      reduce.removeEventListener("change", wake);
    };
  }, []);

  return (
    <div className="md-scene-track" aria-hidden="true">
      <div className="md-scene" ref={scene}>
        {/* lanes: one per person */}
        {PEOPLE.map((p) => (
          <div key={p.id} className="md-lane" data-lane style={{ ["--pc" as string]: PERSON_INK[p.id] }}>
            <Face id={p.id} />
            <span className="md-lane-t">
              <b>{p.name}</b>
              <span>{byPerson(p.id).length}</span>
            </span>
          </div>
        ))}

        {/* the three doors receipts come through */}
        {CHANNELS.map((c, k) => (
          <div key={c} className="md-src" data-src>
            <span className="md-src-ico">{SRC_ICON[k]}</span>
            <span className="md-src-t">{c}</span>
          </div>
        ))}

        {/* each rule's line */}
        {RULE_BEATS.map((rb) => (
          <div key={rb.code} className={`md-rule${rb.at === null ? " md-rule--flat" : ""}`} data-rule={rb.beat}>
            <span className="md-rule-zone" />
            <span className="md-rule-line" />
            <span className="md-rule-t">
              <b>{rb.code}</b> {rb.line}
            </span>
          </div>
        ))}

        {/* Dana's tray */}
        <div className="md-tray" data-tray>
          <span className="md-tray-face">
            <Image src="/site/characters/dana-head.webp" alt="" width={64} height={64} />
          </span>
          <span className="md-tray-t">
            For Dana <b data-tray-n>0</b>
          </span>
        </div>

        {/* the report folder: back, slips go between, front */}
        <div className="md-folder md-folder--back" data-folder />
        <div className="md-folder md-folder--front" data-folder>
          <span className="md-folder-k">September report</span>
          <span className="md-folder-v">
            {CLEARED.length} charges, {money(CLEARED_TOTAL)}
          </span>
          <span className="md-folder-x">
            {["PDF", "XLSX", "GL journal CSV", "QuickBooks Online"].map((x) => (
              <i key={x} data-export>
                {x}
              </i>
            ))}
          </span>
        </div>

        {MONTH.map((r, i) => (
          <div
            key={r.id}
            className={`md-slip${r.fx ? " has-fx" : ""} md-slip--${CHECK[r.id].v}`}
            data-slip
            style={{
              ["--pc" as string]: PERSON_INK[r.who],
              ["--px" as string]: PILE[i].fx,
              ["--py" as string]: PILE[i].fy,
              ["--pr" as string]: `${PILE[i].r.toFixed(1)}deg`,
              zIndex: (10 + PILE_Z[i]) * 2,
            }}
          >
            <span className="md-slip-lift" />
            <span className="md-slip-m">
              <i>{r.who.slice(0, 1).toUpperCase()}</i>
              {r.merchant}
            </span>
            <span className="md-slip-b">
              <span className="md-slip-a">
                {r.fx && <span className="md-slip-fx">{fxAmount(r)}</span>}
                <span className="md-slip-usd">{money(r.amount)}</span>
              </span>
              <span className="md-slip-d">{shortDate(r.date)}</span>
            </span>
            {r.fx && <span className="md-slip-stamp">{fxRate(r)}</span>}
            {CHECK[r.id].v !== "ok" && <span className="md-slip-chip">{CHECK[r.id].codes[0]}</span>}
            {DUPE_ROLE.get(r.id)?.second && (
              <svg className="md-slip-clip" viewBox="0 0 16 40" aria-hidden="true">
                <path d="M5 30V8a3 3 0 0 1 6 0v24a5 5 0 0 1-10 0V10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            )}
          </div>
        ))}
        {MONTH.map((r, i) =>
          r.receipt ? (
            <span key={r.id} className="md-rcpt" data-rcpt={i} style={{ ["--pc" as string]: PERSON_INK[r.who] }}>
              <i />
              <i />
              <i />
            </span>
          ) : null,
        )}
      </div>
    </div>
  );
}

/** a person's face: the clay head for Priya and Dana, an inked initial for everyone else */
export function Face({ id, size }: { id: string; size?: number }) {
  if (id === "priya" || id === "dana")
    return (
      <span className="md-face md-face--img" style={size ? { width: size, height: size } : undefined}>
        <Image src={`/site/characters/${id}-head.webp`} alt="" width={96} height={96} />
      </span>
    );
  return (
    <span className="md-face" style={{ ["--pc" as string]: PERSON_INK[id], ...(size ? { width: size, height: size } : {}) }}>
      {id.slice(0, 1).toUpperCase()}
    </span>
  );
}

const SRC_ICON = [
  <svg key="t" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
    <path d="M10.5 18.5h3" />
  </svg>,
  <svg key="e" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="5.5" width="18" height="13" rx="2" />
    <path d="M3.5 6.5l8.5 6.5 8.5-6.5" />
  </svg>,
  <svg key="u" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 15V4M7.5 8.5L12 4l4.5 4.5" />
    <path d="M4 14v4.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V14" />
  </svg>,
];
