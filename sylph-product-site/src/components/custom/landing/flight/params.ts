/**
 * FlightParams — the single tuning-handoff artifact for the hero paper
 * flight. The lab's leva panel binds to this shape; after checkpoint 2,
 * Ben's dialed values are hardcoded here as DEFAULT_PARAMS.
 *
 * None of this is entropy. All per-sheet variance is drawn from
 * `seeded(i, k)` (../wind-sweep.ts) at the use site — these are the
 * physical constants of the one wind every sheet shares.
 */

export interface FlightParams {
  gust: {
    /** unconstrained travel over one full flight at gust crest, px */
    strength: number;
    /** envelope fractions of the flight window (attack + peak + decay ≈ 1) */
    attack: number;
    peak: number;
    decay: number;
  };
  field: {
    /** spatial frequency of the curl-noise potential, 1/px */
    noiseScale: number;
    /** curl contribution on top of the base wind, px over flight */
    curlIntensity: number;
    /** how fast the field itself evolves over one flight */
    fieldTimeScale: number;
    /** wind heading LATE in the flight, degrees CCW from +x (y up) */
    baseWindAngleDeg: number;
    /** extra climb EARLY — the stream lifts off steeply, then bends over
        into the band (one arced gust, the reference-footage arch) */
    climbBoostDeg: number;
  };
  paper: {
    /** corner-lift amplitude during peel, px */
    peelAmp: number;
    /** bend strength during carry */
    bendAmp: number;
    /** 0 = soft bow, 1 = crisp crease — the fold state of airborne sheets */
    foldSharp: number;
    /** hinge fold angle, radians — the wing past the crease rotates out of
        plane, shortening the silhouette to paper proportions */
    foldAngle: number;
    /** rotisserie turns per flight (about the long axis); sheets flip edge-on */
    tumble: number;
    /** short traveling ripple, px */
    rippleAmp: number;
    rippleFreq: number;
    /** long wave through the whole body — edges must never both be straight, px */
    waveAmp: number;
    waveFreq: number;
    /** hyperbolic twist across the sheet, px */
    twistAmp: number;
    /** per-sheet stiffness sampled in [min, max]; 1 = rigid card */
    stiffnessMin: number;
    stiffnessMax: number;
    /** tumble/flutter angular amplitude, radians — scaled by (1 − stiffness) */
    flutterAmp: number;
    /** how strongly a sheet banks into its direction of travel */
    bankGain: number;
    /** max opacity of the translucent paper leaf under the glyphs */
    bodyRamp: number;
  };
  pacing: {
    /** one sheet's full flight, timeline seconds */
    flightDuration: number;
    /** wave-start to wave-start, s (each row's backfill settles before its lift) */
    waveGap: number;
    /** seeded jitter applied to each sheet's start within its wave, s */
    staggerJitter: number;
    /** per-sheet lift spacing inside a wave, s */
    liftSpacing: number;
    /** backfill slide duration, s */
    backfillDur: number;
    /** pre-gust shiver duration, s */
    shiverDur: number;
    /** sheets lifted per wave (sums to the crow count) */
    sheetsPerWave: number[];
  };
  dissolve: {
    /** flight phase at which erosion begins (0..1) */
    start: number;
    /** width of the feathered erosion edge (0..1 of the ramp) — soft, never a rim */
    edgeWidth: number;
    /** erosion cell frequency across the sheet */
    erodeScale: number;
    /** cell elongation along the sheet (streaks along the wind), ≥ 1 */
    erodeElong: number;
    /** how much the trailing edge erodes first (0..1) */
    trailBias: number;
    /** how far the sheet's remaining color pulls toward the ribbon hue as it melts */
    huePull: number;
    /** brightening as the sheet joins the air */
    illum: number;
    /** the light the sheet becomes */
    glowColor: string;
  };
  counter: {
    /** tally waypoints, one landing per wave: 214 → … → 3 */
    splits: number[];
    /** GSAP ease string per split segment */
    eases: string[];
  };
  exceptions: {
    /** shudder x-amplitude at each wave crest, px */
    shudderAmp: number;
    /** shudder cycles per crest */
    shudderFreq: number;
  };
  bg: {
    /** idle drift speed of the ribbon domain-warp */
    drift: number;
    /** how much the gust adds to the warp */
    flowGain: number;
    /** luma-weighted brightness swell at gust crest (0..1) */
    swell: number;
  };
}

/** Provisional physics — every value below is a leva knob until Ben's checkpoint-2 pass. */
export const DEFAULT_PARAMS: FlightParams = {
  gust: { strength: 720, attack: 0.2, peak: 0.16, decay: 0.64 },
  field: {
    noiseScale: 0.0032,
    curlIntensity: 220,
    fieldTimeScale: 0.85,
    baseWindAngleDeg: 18,
    climbBoostDeg: 46,
  },
  paper: {
    peelAmp: 26,
    bendAmp: 1.2,
    foldSharp: 0.55,
    foldAngle: 1.35,
    tumble: 0.8,
    rippleAmp: 5,
    rippleFreq: 2.4,
    waveAmp: 9,
    waveFreq: 1.15,
    twistAmp: 6,
    stiffnessMin: 0.35,
    stiffnessMax: 0.68,
    flutterAmp: 0.45,
    bankGain: 0.5,
    bodyRamp: 0.5,
  },
  pacing: {
    flightDuration: 2.3,
    waveGap: 1.2,
    staggerJitter: 0.12,
    liftSpacing: 0.18,
    backfillDur: 0.6,
    shiverDur: 0.7,
    sheetsPerWave: [4, 4],
  },
  dissolve: {
    start: 0.55,
    edgeWidth: 0.42,
    erodeScale: 5.5,
    erodeElong: 3.2,
    trailBias: 0.55, /* holes originate at the trailing edge — shredding, not decay */
    huePull: 0.8, /* the sheet is light-toned BEFORE it erodes */
    illum: 0.2,
    glowColor: "#58e8ad",
  },
  counter: {
    splits: [214, 96, 3],
    eases: ["power2.inOut", "power2.inOut"],
  },
  exceptions: { shudderAmp: 5, shudderFreq: 3 },
  bg: { drift: 0.05, flowGain: 0.45, swell: 0.28 },
};
