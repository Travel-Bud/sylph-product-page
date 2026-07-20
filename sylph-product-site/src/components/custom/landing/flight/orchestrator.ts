/**
 * The conductor. Builds ONE paused GSAP timeline for the whole breath:
 * shiver → the VISIBLE cleared rows lift in staggered waves (rows convert to
 * sheets and ride the current into the coil; their slots simply empty — no
 * pile behind the fold, nothing feeds in from below) → counter plummets in
 * wave landings → exceptions shudder at each crest but hold → the panel
 * closes up around the three → handback to the truth layer.
 *
 * Determinism rules (the product claim):
 *  - every DOM read happens at BUILD time, against the rested layout;
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
import {
  gustEnvelope,
  precomputePath,
  vortexWorldPoint,
  type Room,
  type SinkSpec,
} from "./flight-field";
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
  const allCrows = listRows.filter((el) => el.classList.contains("crow"));
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

  /* the wind only takes what the reader can SEE: a row wholly inside the
     pane's clip box flies; anything straddling or beyond the fold just goes
     with the collapse (owner's call — no bills appearing from below) */
  const clipBottom = list.getBoundingClientRect().bottom + 1;
  const crows = allCrows.filter((el) => rectOf.get(el)!.bottom <= clipBottom);

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
  const waveCount = crows.length ? Math.max(...waveOf) + 1 : 1;
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
  const windEnd = (crows.length ? Math.max(...liftAt) : windStart) + p.flightDuration;

  /* ---------------- spawns + paths --------------------------------------- */
  /* ≥5% clear margin on every side, plus allowance for banked corners */
  const margin = 0.08 * Math.min(W, H) + 24;

  /* the portal: one anchor shared with the background shader. The swirl's
     safe radius keeps every wind-in arc inside the frame. */
  const eye = vortexWorldPoint(W, H, params.vortex);
  const sink: SinkSpec = {
    x: eye.x,
    y: eye.y,
    room: Math.max(
      Math.min(W / 2 - Math.abs(eye.x), H / 2 - Math.abs(eye.y)) - margin * 0.5,
      60,
    ),
    bendStart: params.sink.bendStart,
    swirlTurns: params.sink.swirlTurns,
    spinDir: params.sink.spinDir,
    plunge: params.sink.plunge,
    swirlRoll: params.sink.swirlRoll,
  };

  /* sheet/atlas indices are keyed by CAPTURE order (all crows) — a flying
     crow must fly with its OWN captured texture */
  const flyIdx = crows.map((c) => allCrows.indexOf(c));

  for (let i = 0; i < crows.length; i++) {
    const g = flyIdx[i];
    if (g < 0 || g >= sheets.count) continue;
    const rect = rectOf.get(crows[i])!;
    const spawn = sheets.spawnFor(g, { left: rect.left, top: rect.top });
    const halfW = rect.width / 2;
    const halfH = rect.height / 2;
    const room: Room = {
      right: Math.max(W / 2 - spawn.x - halfW - margin, 8),
      left: Math.min(Math.max(spawn.x + W / 2 - halfW - margin, 8), W * 0.5),
      up: Math.max(H / 2 - spawn.y - halfH - margin, 24),
      down: Math.min(Math.max(spawn.y + H / 2 - halfH - margin, 0), 50),
    };
    const st = sheets.state[g];
    st.spawn = spawn;
    st.path = precomputePath(g, spawn, room, {
      gust: params.gust,
      field: params.field,
      flutter: {
        stiffnessMin: params.paper.stiffnessMin,
        stiffnessMax: params.paper.stiffnessMax,
        flutterAmp: params.paper.flutterAmp,
        bankGain: params.paper.bankGain,
        tumble: params.paper.tumble,
      },
      sink, // absolute world px — precomputePath makes it spawn-relative
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
  for (let i = 0; i < crows.length; i++) {
    const g = flyIdx[i];
    if (g < 0 || g >= sheets.count) continue;
    const crow = crows[i];
    /* a few rows stir before committing to flight (x-only, no rigid tilt) */
    if (seeded(g, 42) > 0.82) {
      tl.to(
        crow,
        { x: 3 + seeded(g, 47) * 2, duration: 0.16, ease: "sine.inOut", yoyo: true, repeat: 1 },
        Math.max(liftAt[i] - 0.45, 0.1),
      );
    }
    tl.set(crow, { visibility: "hidden" }, liftAt[i]);
    tl.set(sheets.state[g], { active: 1 }, liftAt[i]);
    tl.to(sheets.state[g], { phase: 1, duration: p.flightDuration, ease: "none" }, liftAt[i]);
  }

  /* 3 · (no backfill — a lifted row's slot simply empties; the gaps are the
     evidence the wind was here, and the collapse closes them at the end) */

  /* 4 · the tally falls in wave landings; the meter drains with it, leaving
     only the amber sliver of exceptions */
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
  const meterFill = q<HTMLElement>(before, ".wq-meter .fill");
  if (meterFill) {
    /* the fill's CSS width already ends at the amber cap — scaleX(1) means
       "every cleared charge accounted for", matching the settled truth */
    tl.fromTo(
      meterFill,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: waveStartAt(waveCount - 1) + Math.min(1.15, p.waveGap * 0.9) - windStart,
        ease: "power2.inOut",
      },
      windStart,
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

  /* 6 · the ledger closes up while the last sheets melt — but not before
     they are well off the glass (a shrinking pane must never strand a
     just-converted sheet outside its own border) */
  const collapseAt = windEnd - p.flightDuration * 0.5;
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

  /* 7 · hand the frame back to the truth layer. The bg canvas STAYS — the
     living vortex is the page's resting state now, churning on its ambient
     clock long after the flight has settled. */
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
  const meterFill = q<HTMLElement>(before, ".wq-meter .fill");
  if (meterFill) gsap.set(meterFill, { clearProps: "all" });
  /* the bg canvas is NOT reset — the vortex keeps churning between takes */
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
