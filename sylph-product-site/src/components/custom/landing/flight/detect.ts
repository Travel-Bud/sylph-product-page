/**
 * Capability probe for the hero flight — the tier ladder chooses by what the
 * device can DO, never by viewport width alone (Ben's locked decision #4).
 *
 *   1. prefers-reduced-motion        → "fade"  (gentle countdown + crossfade)
 *   2. WebGL2 available              → "gl"    (full flight; capable phones get
 *                                               the scaled MOBILE_BUDGET)
 *   3. no WebGL2, desktop width      → "dom"   (today's sweep, verbatim)
 *   4. no WebGL2, narrow             → "fade"
 *
 * The runtime warm-up check (3 hidden frames, avg > 12ms → downgrade) lives
 * with the flight mount, not here — this probe is synchronous and cheap.
 */

export type FlightTier = "gl" | "dom" | "fade";

export interface FlightCapabilities {
  tier: FlightTier;
  /** when tier === "gl": run the scaled-down budget below */
  mobileBudget: boolean;
  reducedMotion: boolean;
  webgl2: boolean;
  reason: string;
}

export interface FlightBudget {
  dprCap: number;
  /** total airborne sheets across all waves */
  sheetTarget: number;
  waveCount: number;
  /** PlaneGeometry subdivisions [x, y] */
  planeSegments: [number, number];
}

export const DESKTOP_BUDGET: FlightBudget = {
  dprCap: 2,
  sheetTarget: 8,
  waveCount: 2,
  planeSegments: [24, 8],
};

export const MOBILE_BUDGET: FlightBudget = {
  dprCap: 1.5,
  sheetTarget: 6,
  waveCount: 2,
  planeSegments: [16, 6],
};

/** Same breakpoint the CSS uses for the non-GL fallback split. */
const DESKTOP_MIN_WIDTH = 981;

function probeWebGL2(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2", {
      alpha: true,
      failIfMajorPerformanceCaveat: true,
    });
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/** Heuristic for "capable phone / low-power device": scale the budget, don't drop the tier. */
function probeMobileBudget(): boolean {
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const memory = (navigator as { deviceMemory?: number }).deviceMemory;
  const cores = navigator.hardwareConcurrency ?? 8;
  return coarse || (memory !== undefined && memory <= 4) || cores <= 4;
}

export function detectFlightTier(): FlightCapabilities {
  if (typeof window === "undefined") {
    return { tier: "fade", mobileBudget: false, reducedMotion: false, webgl2: false, reason: "ssr" };
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) {
    return { tier: "fade", mobileBudget: false, reducedMotion, webgl2: false, reason: "prefers-reduced-motion" };
  }

  const webgl2 = probeWebGL2();
  if (webgl2) {
    const mobileBudget = probeMobileBudget();
    return {
      tier: "gl",
      mobileBudget,
      reducedMotion,
      webgl2,
      reason: mobileBudget ? "webgl2, mobile budget" : "webgl2, full budget",
    };
  }

  const desktop = window.innerWidth >= DESKTOP_MIN_WIDTH;
  return {
    tier: desktop ? "dom" : "fade",
    mobileBudget: false,
    reducedMotion,
    webgl2,
    reason: desktop ? "no webgl2, desktop → DOM sweep" : "no webgl2, narrow → fade",
  };
}

export function budgetFor(caps: FlightCapabilities): FlightBudget {
  return caps.mobileBudget ? MOBILE_BUDGET : DESKTOP_BUDGET;
}
