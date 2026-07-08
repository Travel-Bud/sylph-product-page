/**
 * The conductor. Builds ONE paused GSAP timeline for the whole breath:
 * shiver → wave 1 lifts (rows convert to sheets, rows below backfill upward)
 * → waves 2/3 overlapping → counter plummets in wave landings → exceptions
 * shudder at each crest but hold → the tall panel collapses to the settled
 * card → handback to the truth layer.
 *
 * Determinism rules (the product claim):
 *  - every DOM read happens at BUILD time, against the rested layout; wave
 *    backfill shifts are ARITHMETIC (summed row heights), so replays and
 *    scrubs read identical geometry — no measurements inside the timeline;
 *  - all variance is seeded(i, k); all sequencing is timeline time;
 *  - state changes are gsap .set()/tweens (scrub-reversible), never call()s;
 *  - the tick advances both canvases with the timeline's OWN clock.
 *
 * The reset preserves the documented gotcha: `data-anim` is restored BEFORE
 * any clearProps (clearProps inside a display:none subtree reparents nodes
 * next to text-node siblings — the "of 214 214" bug).
 */

import { gsap, EASE_REVEAL } from "../gsap";
import { seeded } from "../wind-sweep";
import { gustEnvelope, precomputePath, type Room } from "./flight-field";
import type { SheetsApi } from "./hero-flight";
import type { GustStore } from "./gust-store";
import type { FlightParams } from "./params";

export interface FlightStage {
  /** the hero root carrying [data-anim][data-tier="gl"] */
  root: HTMLElement;
  sheets: SheetsApi;
  gust: GustStore;
  bgAdvance?: (ms: number) => void;
  /** lab hooks: fps meters, hash captures — never flight state */
  onTick?: (tl: gsap.core.Timeline) => void;
  onComplete?: () => void;
}

export interface FlightRun {
  tl: gsap.core.Timeline;
  /** the wind window in timeline seconds (the global gust spans it) */
  windStart: number;
  windEnd: number;
}

const q = <T extends HTMLElement>(root: ParentNode, sel: string) =>
  root.querySelector<T>(sel);
const qa = <T extends HTMLElement>(root: ParentNode, sel: string) =>
  Array.from(root.querySelectorAll<T>(sel));

export function buildFlightTimeline(stage: FlightStage, params: FlightParams): FlightRun {
  const { root, sheets, gust } = stage;
  const before = q<HTMLElement>(root, ".wq-before")!;
  const truth = q<HTMLElement>(root, ".wq")!;
  const list = q<HTMLElement>(before, ".wq-list")!;
  const listRows = Array.from(list.children) as HTMLElement[];
  const crows = listRows.filter((el) => el.classList.contains("crow"));
  const keeps = listRows.filter((el) => el.classList.contains("wq-row"));
  const foot = q<HTMLElement>(before, ".wq-foot")!;
  const truthKeeps = qa<HTMLElement>(truth, ".wq-row");
  const countEl = q<HTMLElement>(before, ".wq-head .n b");

  /* ---------------- rest measurements (the ONLY DOM reads) --------------- */
  const rectOf = new Map(listRows.map((el) => [el, el.getBoundingClientRect()]));
  const tallH = before.offsetHeight;
  const truthH = truth.offsetHeight;
  const truthRects = truthKeeps.map((el) => el.getBoundingClientRect());
  const { width: W, height: H } = sheets.canvasSize();

  /* ---------------- waves ------------------------------------------------ */
  const p = params.pacing;
  const waveOf: number[] = [];
  {
    let wave = 0;
    let inWave = 0;
    for (let i = 0; i < crows.length; i++) {
      waveOf[i] = wave;
      inWave++;
      if (inWave >= (p.sheetsPerWave[wave] ?? Infinity) && wave < p.sheetsPerWave.length - 1) {
        wave++;
        inWave = 0;
      }
    }
  }
  const waveCount = Math.max(...waveOf) + 1;
  const windStart = p.shiverDur + 0.2;
  const waveStartAt = (w: number) => windStart + w * p.waveGap;

  /* lift times — seeded stagger inside each wave */
  const liftAt: number[] = [];
  {
    const orderInWave: number[] = [];
    const seen: Record<number, number> = {};
    for (let i = 0; i < crows.length; i++) {
      const w = waveOf[i];
      orderInWave[i] = seen[w] ?? 0;
      seen[w] = orderInWave[i] + 1;
    }
    for (let i = 0; i < crows.length; i++) {
      const jitter = (seeded(i, 41) - 0.5) * p.staggerJitter;
      liftAt[i] = Math.max(waveStartAt(waveOf[i]) + orderInWave[i] * p.liftSpacing + jitter, waveStartAt(waveOf[i]));
    }
  }
  const windEnd = Math.max(...liftAt) + p.flightDuration;

  /* ---------------- arithmetic backfill shifts --------------------------- */
  /* shiftAfter[w].get(row) = how far row sits ABOVE its rest position once
     every wave ≤ w has lifted (sum of lifted-crow heights above it) */
  const shiftAfter: Map<HTMLElement, number>[] = [];
  for (let w = 0; w < waveCount; w++) {
    const m = new Map<HTMLElement, number>();
    for (const row of listRows) {
      let s = 0;
      for (let i = 0; i < crows.length; i++) {
        if (waveOf[i] <= w && listRows.indexOf(crows[i]) < listRows.indexOf(row)) {
          s += rectOf.get(crows[i])!.height;
        }
      }
      m.set(row, s);
    }
    shiftAfter.push(m);
  }

  /* ---------------- spawns + paths --------------------------------------- */
  /* ≥5% clear margin on every side, plus allowance for banked corners */
  const margin = 0.08 * Math.min(W, H) + 24;
  for (let i = 0; i < crows.length && i < sheets.count; i++) {
    const rect = rectOf.get(crows[i])!;
    const preShift = waveOf[i] > 0 ? shiftAfter[waveOf[i] - 1].get(crows[i])! : 0;
    const spawn = sheets.spawnFor(i, { left: rect.left, top: rect.top - preShift });
    const halfW = rect.width / 2;
    const halfH = rect.height / 2;
    const room: Room = {
      right: Math.max(W / 2 - spawn.x - halfW - margin, 8),
      left: Math.min(Math.max(spawn.x + W / 2 - halfW - margin, 8), W * 0.5),
      up: Math.max(H / 2 - spawn.y - halfH - margin, 24),
      down: Math.min(Math.max(spawn.y + H / 2 - halfH - margin, 0), 50),
    };
    const st = sheets.state[i];
    st.spawn = spawn;
    st.path = precomputePath(i, spawn, room, {
      gust: params.gust,
      field: params.field,
      flutter: {
        stiffnessMin: params.paper.stiffnessMin,
        stiffnessMax: params.paper.stiffnessMax,
        flutterAmp: params.paper.flutterAmp,
        bankGain: params.paper.bankGain,
        tumble: params.paper.tumble,
      },
    });
  }

  /* ---------------- the timeline ----------------------------------------- */
  const gustGlobal = (t: number) => {
    const s = (t - windStart) / Math.max(windEnd - windStart, 1e-4);
    return gustEnvelope(Math.min(Math.max(s, 0), 1), params.gust);
  };

  const tl = gsap.timeline({
    paused: true,
    onUpdate: () => {
      const t = tl.time();
      gust.g = gustGlobal(t);
      gust.progress = tl.progress();
      const ms = t * 1000;
      sheets.advance(ms);
      stage.bgAdvance?.(ms);
      stage.onTick?.(tl);
    },
    onComplete: () => {
      gsap.set([...listRows], { clearProps: "will-change" });
      delete root.dataset.anim;
      stage.onComplete?.();
    },
  });

  gsap.set(listRows, { willChange: "transform" });

  /* 1 · the wind builds: the pile feels the gust before it hits.
     x-only — a full-width DOM row must NEVER visibly rotate (rigid-card tell);
     rotation belongs to sheets, after conversion */
  tl.to(
    crows,
    {
      x: 5,
      duration: Math.max(p.shiverDur / 2, 0.2),
      ease: "sine.inOut",
      yoyo: true,
      repeat: 1,
      stagger: 0.015,
    },
    0,
  );

  /* the air is never dead: ribbons drift from the first beat, swell with the gust */
  const bgCanvas = q<HTMLElement>(root, ".wh-bg-canvas");
  if (bgCanvas) {
    tl.to(bgCanvas, { opacity: 1, duration: 0.6, ease: "power1.out" }, 0.05);
  }

  /* 2 · lifts, flights, stirs */
  for (let i = 0; i < crows.length && i < sheets.count; i++) {
    const crow = crows[i];
    /* a few rows stir before committing to flight (x-only, no rigid tilt) */
    if (seeded(i, 42) > 0.82) {
      tl.to(
        crow,
        { x: 3 + seeded(i, 47) * 2, duration: 0.16, ease: "sine.inOut", yoyo: true, repeat: 1 },
        Math.max(liftAt[i] - 0.45, 0.1),
      );
    }
    tl.set(crow, { visibility: "hidden" }, liftAt[i]);
    tl.set(sheets.state[i], { active: 1 }, liftAt[i]);
    tl.to(sheets.state[i], { phase: 1, duration: p.flightDuration, ease: "none" }, liftAt[i]);
  }

  /* 3 · backfill: rows slide up into freed space — but never before the
     rows ABOVE them have actually left (no double-printed slots) */
  for (let w = 0; w < waveCount; w++) {
    for (const row of listRows) {
      const target = shiftAfter[w].get(row)!;
      const prev = w > 0 ? shiftAfter[w - 1].get(row)! : 0;
      if (target === prev) continue;
      /* a row lifted in wave ≤ w is already airborne — no need to slide it */
      const crowIdx = crows.indexOf(row);
      if (crowIdx >= 0 && waveOf[crowIdx] <= w) continue;
      /* wait for the last same-wave lift above this row */
      let lastLiftAbove = waveStartAt(w);
      for (let i = 0; i < crows.length; i++) {
        if (waveOf[i] === w && listRows.indexOf(crows[i]) < listRows.indexOf(row)) {
          lastLiftAbove = Math.max(lastLiftAbove, liftAt[i]);
        }
      }
      tl.to(
        row,
        { y: -target, duration: p.backfillDur, ease: EASE_REVEAL },
        lastLiftAbove + 0.08 + seeded(listRows.indexOf(row), 43) * 0.08,
      );
    }
  }

  /* 4 · the tally falls in wave landings */
  const nObj = { v: params.counter.splits[0] ?? 214 };
  const write = () => {
    if (countEl) countEl.textContent = String(Math.round(nObj.v));
  };
  for (let w = 0; w < waveCount; w++) {
    const target = params.counter.splits[w + 1];
    if (target === undefined) break;
    tl.to(
      nObj,
      {
        v: target,
        duration: Math.min(1.15, p.waveGap * 0.9),
        ease: params.counter.eases[w] ?? "power2.inOut",
        onUpdate: write,
      },
      waveStartAt(w), // the tally moves the instant the wave's first row lifts
    );
  }

  /* 5 · exceptions shudder at each crest — never lifted; physics is the message */
  for (let w = 0; w < waveCount; w++) {
    const crest = waveStartAt(w) + 0.35;
    keeps.forEach((ex, k) => {
      const cycles = Math.max(Math.round(params.exceptions.shudderFreq), 1);
      tl.to(
        ex,
        {
          x: params.exceptions.shudderAmp * (0.6 + seeded(k, 44 + w) * 0.8),
          rotation: 0.35 * (seeded(k, 45 + w) - 0.5),
          duration: 0.09,
          ease: "sine.inOut",
          yoyo: true,
          repeat: cycles * 2 - 1,
        },
        crest + seeded(k, 46 + w) * 0.08,
      );
    });
  }

  /* 6 · the ledger closes up while the last sheets melt — no empty-void
     beat between the last lift and the settle */
  const collapseAt = windEnd - p.flightDuration * 0.55;
  keeps.forEach((keep, k) => {
    const finalY = truthRects[k].top - rectOf.get(keep)!.top;
    tl.to(keep, { y: finalY, duration: 0.85, ease: EASE_REVEAL }, collapseAt + k * 0.05);
  });
  tl.fromTo(before, { height: tallH }, { height: truthH, duration: 0.85, ease: EASE_REVEAL }, collapseAt);
  tl.to(foot, { autoAlpha: 1, duration: 0.6 }, collapseAt + 0.35);
  const dot = q<HTMLElement>(foot, ".dot");
  if (dot) tl.from(dot, { scale: 0, duration: 0.35, ease: "back.out(1.7)" }, collapseAt + 0.45);

  /* 6b · the landing: 3 hits, the number breathes once in aurora */
  if (countEl) {
    const landAt = waveStartAt(waveCount - 1) + Math.min(1.15, p.waveGap * 0.9);
    tl.fromTo(countEl, { scale: 1 }, { scale: 1.07, duration: 0.14, ease: "power2.out" }, landAt)
      .to(countEl, { scale: 1, duration: 0.3, ease: "power2.inOut" }, landAt + 0.14)
      .to(countEl, { color: "#58e8ad", duration: 0.12, ease: "power1.in" }, landAt)
      .to(countEl, { color: "#f4f7f5", duration: 0.45, ease: "power1.out" }, landAt + 0.29);
  }

  /* 7 · ribbons settle; hand the frame back to the truth layer */
  if (bgCanvas) tl.to(bgCanvas, { opacity: 0, duration: 0.6, ease: "power1.out" }, collapseAt + 0.6);
  tl.to(truth, { autoAlpha: 1, duration: 0.4, ease: "power1.out" }, "+=0.3");
  tl.to(before, { autoAlpha: 0, duration: 0.4, ease: "power1.out" }, "<");

  return { tl, windStart, windEnd };
}

/**
 * Rewind everything so the wind can run again — same 214, same 3.
 * Kills nothing itself: the caller kills its timeline first.
 */
export function resetFlight(stage: FlightStage): void {
  const { root, sheets } = stage;
  const before = q<HTMLElement>(root, ".wq-before");
  const truth = q<HTMLElement>(root, ".wq");
  if (!before || !truth) return;
  /* the overlay must be laid out BEFORE any clearProps (the "of 214 214" bug) */
  root.dataset.anim = "1";
  root.dataset.tier = "gl";
  const list = q<HTMLElement>(before, ".wq-list");
  const listRows = list ? (Array.from(list.children) as HTMLElement[]) : [];
  const foot = q<HTMLElement>(before, ".wq-foot");
  gsap.set([...listRows, before], { clearProps: "all" });
  if (foot) {
    gsap.set(foot, { clearProps: "all" });
    gsap.set(foot, { opacity: 0 });
  }
  const countEl = q<HTMLElement>(before, ".wq-head .n b");
  if (countEl) {
    gsap.set(countEl, { clearProps: "all" });
    countEl.textContent = "214";
  }
  const bgCanvas = q<HTMLElement>(root, ".wh-bg-canvas");
  if (bgCanvas) gsap.set(bgCanvas, { clearProps: "opacity" });
  gsap.set(truth, { autoAlpha: 0 });
  for (const s of sheets.state) {
    s.active = 0;
    s.phase = 0;
  }
  stage.gust.g = 0;
  stage.gust.progress = 0;
  sheets.advance(0);
  stage.bgAdvance?.(0);
}
