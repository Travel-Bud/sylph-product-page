/**
 * FlightParams — the single tuning-handoff artifact for the hero paper
 * flight. The lab's leva panel binds to this shape; after checkpoint 2,
 * Ben's dialed values are hardcoded here as DEFAULT_PARAMS.
 *
 * None of this is entropy. All per-sheet variance is drawn from
 * `seeded(i, k)` (../wind-sweep.ts) at the use site — these are the
 * physical constants of the one wind every sheet shares.
 */

/** The aurora artwork the vortex anchor is expressed against. */
export const AURORA_ART = {
  src: "/landing/aurora-vortex.jpg",
  width: 2560,
  height: 1440,
} as const;

export interface FlightParams {
  /** the coil's eye, in FRACTIONS OF THE ARTWORK — one anchor shared by the
      background shader and the flight sink so sheets and light agree on
      where the portal is */
  vortex: {
    xFrac: number;
    yFrac: number;
  };
  /** the wind-in: how flights bend off the free field into the spiral */
  sink: {
    /** flight phase at which the path starts committing to the spiral */
    bendStart: number;
    /** turns a sheet winds around the eye on its way in */
    swirlTurns: number;
    /** 1 = counterclockwise on screen, -1 = clockwise (match the art) */
    spinDir: number;
    /** radius decay exponent — higher dives to the eye sooner */
    plunge: number;
    /** sheet scale at the eye (receding into the portal) */
    endScale: number;
    /** extra roll as the sheet joins the rotation, radians */
    swirlRoll: number;
  };
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
    /** the living vortex: apparent angular speed at the core, rad/s.
        Runs on an ambient clock that never rewinds — the coil churns
        from first paint, through the flight, and forever after. */
    spinSpeed: number;
    /** loop period of the two-phase flow crossfade, seconds — bounds how
        far the art ever winds before the faded-out phase snaps back */
    spinPeriod: number;
    /** rigid-rotation plateau radius around the eye (aspect-corrected UV) */
    coreRadius: number;
    /** decay band width outside the plateau — shear lives only here */
    bandWidth: number;
  };
}

/** Provisional physics — every value below is a leva knob until Ben's checkpoint-2 pass. */
export const DEFAULT_PARAMS: FlightParams = {
  vortex: { xFrac: 0.7, yFrac: 0.29 },
  sink: {
    bendStart: 0.36,
    swirlTurns: 1.05,
    spinDir: 1,
    plunge: 1.35,
    endScale: 0.18,
    swirlRoll: 0.7,
  },
  gust: { strength: 560, attack: 0.2, peak: 0.16, decay: 0.64 },
  field: {
    noiseScale: 0.0032,
    curlIntensity: 200,
    fieldTimeScale: 0.85,
    baseWindAngleDeg: 22,
    climbBoostDeg: 64,
  },
  paper: {
    peelAmp: 26,
    bendAmp: 1.2,
    foldSharp: 0.55,
    foldAngle: 2.3,
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
    flightDuration: 2.2,
    waveGap: 1.7,
    staggerJitter: 0.12,
    liftSpacing: 0.3,
    backfillDur: 0.6,
    shiverDur: 0.7,
    sheetsPerWave: [3, 2],
  },
  dissolve: {
    start: 0.7,
    edgeWidth: 0.36,
    erodeScale: 5.5,
    erodeElong: 3.2,
    trailBias: 0.55, /* holes originate at the trailing edge — shredding, not decay */
    huePull: 0.7, /* the sheet is light-toned BEFORE it erodes */
    illum: 0.32,
    glowColor: "#58e8ad",
  },
  counter: {
    splits: [214, 96, 3],
    eases: ["power2.inOut", "power2.inOut"],
  },
  exceptions: { shudderAmp: 5, shudderFreq: 3 },
  bg: {
    drift: 0.05,
    flowGain: 0.45,
    swell: 0.28,
    spinSpeed: 0.11,
    spinPeriod: 7,
    coreRadius: 0.15,
    bandWidth: 0.24,
  },
};
