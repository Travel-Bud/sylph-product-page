import { type Variants, type Transition } from "framer-motion";

// ── Spring configs ──────────────────────────────────────────────
// Use these 3 named presets across all landing page animations.
// springSubtle: background/atmospheric elements (high damping, moderate stiffness)
// springSmooth: content transitions, reveals, layout shifts (balanced)
// springSnappy: verdict pops, badge bounces, interactive feedback (low damping, high stiffness)

export const springSubtle: Transition = {
  type: "spring",
  damping: 30,
  stiffness: 200,
};

export const springSmooth: Transition = {
  type: "spring",
  damping: 30,
  stiffness: 250,
};

export const springSnappy: Transition = {
  type: "spring",
  damping: 15,
  stiffness: 400,
};

/** @deprecated Use springSnappy instead */
export const springBouncy: Transition = springSnappy;

/** @deprecated Use springSubtle instead */
export const springGentle: Transition = springSubtle;

// ── Element variants ────────────────────────────────────────────

/** Standard card/element entry — fades up from below */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springSmooth,
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

/** Smaller fade-up for compact items */
export const fadeInUpSmall: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springSmooth,
  },
  exit: { opacity: 0, y: -4, transition: { duration: 0.12 } },
};

/** Simple opacity fade */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

/** Slide in from left */
export const slideInFromLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: springSmooth },
  exit: { opacity: 0, x: -20, transition: { duration: 0.15 } },
};

/** Slide in from right */
export const slideInFromRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: springSmooth },
  exit: { opacity: 0, x: 20, transition: { duration: 0.15 } },
};

/** Scale in for badges, modals, status indicators */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: springBouncy },
  exit: { opacity: 0, scale: 0.92, transition: { duration: 0.12 } },
};

/** Slide up from bottom for sticky bars, toolbars */
export const slideUp: Variants = {
  hidden: { opacity: 0, y: "100%" },
  visible: { opacity: 1, y: 0, transition: springSmooth },
  exit: { opacity: 0, y: "100%", transition: { duration: 0.2 } },
};

// ── Container variants (stagger children) ───────────────────────

/** Standard stagger container — 50ms between children */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05 },
  },
};

/** Faster stagger for dense lists — 30ms between children */
export const staggerFast: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.03 },
  },
};

/** Slower stagger for hero/feature sections — 80ms */
export const staggerSlow: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

// ── Sylph identity motion ──────────────────────────────────────

/** The Sylph ease curve — fast start, gentle deceleration like settling air */
export const sylphEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Spring overshoot for verdict icon pop, badge morphs */
export const sylphSpring: [number, number, number, number] = [0.34, 1.56, 0.64, 1];

// ── Page transition variants ────────────────────────────────────

export const pageVariants: Variants = {
  initial: { opacity: 0 },
  enter: {
    opacity: 1,
    transition: { duration: 0.25, ease: sylphEase },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
};

// ── Utility: reduced-motion safe ────────────────────────────────

/** Returns empty variants when prefers-reduced-motion is set */
export const reducedMotionVariants: Variants = {
  hidden: {},
  visible: {},
  exit: {},
};

/** The Drift — page content enters on a diagonal breeze */
export const driftIn: Variants = {
  hidden: { opacity: 0, x: 12, y: 4 },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: { duration: 0.45, ease: sylphEase },
  },
};

/** Drift container with stagger — each section drifts in 80ms apart */
export const driftContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

// ── Phase & stepper variants ───────────────────────────────────

/** Dialog phase swap — content slides in from right, exits left */
export const phaseSwap: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.25, ease: sylphEase },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.15 },
  },
};

/** Stepper checkpoint — pops on completion */
export const checkpointPop: Variants = {
  pending: { scale: 1, opacity: 0.5 },
  current: { scale: 1, opacity: 1, transition: springSmooth },
  completed: {
    scale: [1, 1.2, 1],
    opacity: 1,
    transition: { duration: 0.3, ease: sylphEase },
  },
};

/** Card reveal from below — for result cards */
export const cardReveal: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: sylphEase },
  },
};

// ── Landing page variants ───────────────────────────────────────

/** Stagger for landing sections — slower, more dramatic */
export const staggerLanding: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

/** Fade in from left for alternating feature layouts */
export const fadeInFromLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: springSmooth,
  },
};

/** Fade in from right for alternating feature layouts */
export const fadeInFromRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: springSmooth,
  },
};

/** Scale up fade — for product preview browser frame */
export const scaleUpFade: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: sylphEase },
  },
};

/** Draw line — for the how-it-works connector */
export const drawLine: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 1.2, ease: "easeInOut" },
  },
};

// ── Landing page overhaul variants ──────────────────────────

/** Word-by-word stagger container for headlines */
export const wordRevealContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

/** Individual word spring-drop */
export const wordReveal: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 300 },
  },
};

/** Stat focusing — blur + scale to sharp */
export const statFocus: Variants = {
  hidden: { opacity: 0, scale: 1.3, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

/** Scale-bounce for verdict stamps, checkmarks */
export const scaleBounce: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", damping: 12, stiffness: 400 },
  },
};

/** Particle burst — individual particle variant (used with stagger) */
export const particleBurst: Variants = {
  hidden: { opacity: 1, scale: 1 },
  visible: {
    opacity: 0,
    scale: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

// ── Visual polish variants ──────────────────────────────────────

/** Blur-to-sharp text reveal */
export const blurReveal: Variants = {
  hidden: { opacity: 0, filter: "blur(12px)", y: 8 },
  visible: { opacity: 1, filter: "blur(0px)", y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

/** Atmospheric drift-in for large elements */
export const atmosphericDrift: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } },
};

/** Stagger cascade with delayed start */
export const staggerCascade: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};

// ── Discovery Card variants ─────────────────────────────────────

/** Stagger container for extracted fields — 200ms between children */
export const fieldStagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2, delayChildren: 0.1 },
  },
};

/** Individual field row fade-in */
export const fieldReveal: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: springSmooth,
  },
};

/** Category chip pop-in */
export const chipPop: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", damping: 12, stiffness: 400 },
  },
};

/** Stagger container for scorecard rules — 300ms between children */
export const scorecardStagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.3, delayChildren: 0.2 },
  },
};

/** Individual rule row slide-in from left */
export const ruleRowReveal: Variants = {
  hidden: { opacity: 0, x: -16, scale: 0.98 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: springSmooth,
  },
};

/** Pass badge spring-in (green check) */
export const passBadge: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", damping: 10, stiffness: 350, delay: 0.15 },
  },
};

/** Fail badge pop with shake */
export const failBadge: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    x: [0, -3, 3, -2, 0],
    transition: { type: "spring", damping: 10, stiffness: 350, delay: 0.15 },
  },
};

/** Verdict stamp scale-in with emphasis */
export const verdictRevealVariant: Variants = {
  hidden: { opacity: 0, scale: 0.5, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", damping: 12, stiffness: 300, delay: 0.3 },
  },
};

/** Noncompliant shake — apply after verdictRevealVariant */
export const shakeX: Variants = {
  idle: { x: 0 },
  shake: {
    x: [0, -4, 4, -3, 3, 0],
    transition: { duration: 0.4, delay: 0.6 },
  },
};

// ── Stage Card Accordion variants ───────────────────────────────

/** Stage card expand/collapse content */
export const stageCardContent: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: { height: { duration: 0.3 }, opacity: { duration: 0.15 } },
  },
  expanded: {
    height: "auto",
    opacity: 1,
    transition: { height: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }, opacity: { duration: 0.2, delay: 0.1 } },
  },
};

/** Stage card border glow for active state */
export const stageCardGlow: Variants = {
  inactive: { boxShadow: "0 0 0 0 rgba(var(--color-primary), 0)" },
  active: {
    boxShadow: [
      "0 0 0 0 rgba(var(--color-primary), 0)",
      "0 0 0 3px rgba(var(--color-primary), 0.1)",
      "0 0 0 0 rgba(var(--color-primary), 0)",
    ],
    transition: { duration: 2, repeat: Infinity },
  },
};

/** Stagger container for stage data rows — 200ms between children */
export const stageDataStagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2, delayChildren: 0.15 },
  },
};

/** Individual data row within a stage card */
export const stageDataRow: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: springSmooth,
  },
};

/** Checkmark scale-in when stage completes */
export const stageCheckmark: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", damping: 12, stiffness: 350 },
  },
};

/** Completion card entrance */
export const completionCardReveal: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", damping: 14, stiffness: 250, delay: 0.2 },
  },
};

// ── Intelligence Card variants ──────────────────────────────────

/** Beat card slide-in from below */
export const beatSlideIn: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", damping: 25, stiffness: 300 },
  },
  exit: {
    opacity: 0,
    y: -16,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
  },
};

/** Beat card completion — subtle settle */
export const beatComplete: Variants = {
  active: { opacity: 1 },
  complete: {
    opacity: 0.8,
    transition: { duration: 0.3 },
  },
};

/** Verdict entrance — dramatic scale spring with delay */
export const verdictEntrance: Variants = {
  hidden: { opacity: 0, scale: 0.85, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 12,
      stiffness: 300,
      delay: 0.3,
    },
  },
};

/** Verdict summary text — staggered fade in */
export const verdictSummaryStagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2, delayChildren: 0.5 },
  },
};

/** Verdict summary child */
export const verdictSummaryItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
  },
};

/** Error banner slide-in */
export const errorBannerIn: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", damping: 20, stiffness: 300, delay: 0.1 },
  },
};

// ── Count-up hook ────────────────────────────────────────────────

import { useState, useEffect } from "react";

/** Animates a number from 0 to target with ease-out cubic.
 *  Pass decimals > 0 for fractional targets like 2.2 */
export function useCountUp(target: number, duration = 600, decimals = 0): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    const start = performance.now();
    const factor = Math.pow(10, decimals);
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.round(eased * target * factor) / factor);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, decimals]);
  return count;
}

// ── Enforcement Pipeline Visual Enhancements ────────────────────

/** Beam flow along SVG path — used by EnforcementBeam */
export const beamFlow: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.8, ease: sylphEase },
  },
};

/** Ring progress completion pop — used by CircularStageProgress */
export const ringProgress: Variants = {
  incomplete: { scale: 1 },
  complete: {
    scale: [1, 1.15, 1],
    transition: { duration: 0.3, ease: sylphEase },
  },
};

/** Burst expand glow ring — used by VerdictBurst */
export const burstExpand: Variants = {
  initial: { scale: 0.5, opacity: 0.8 },
  animate: {
    scale: 2,
    opacity: 0,
    transition: { duration: 0.6, ease: sylphEase },
  },
};

// ── Dashboard & Card Interaction variants ────────────────────

/** Spotlight fade for MagicCard hover */
export const spotlightFade: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: springSubtle },
  exit: { opacity: 0, transition: springSubtle },
};

/** Number digit slide for NumberTicker (reserved for future per-digit mode) */
export const digitSlide: Variants = {
  initial: { y: "100%" },
  animate: { y: "0%", transition: { duration: 0.3, ease: sylphEase } },
  exit: { y: "-100%", transition: { duration: 0.3, ease: sylphEase } },
};

// === Air Current Motion Language ===

/** 15° diagonal drift — content carried on a breeze */
export const airDriftIn: Variants = {
  hidden: { opacity: 0, x: 8, y: -4 },
  visible: {
    opacity: 1, x: 0, y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
};

/** Reverse diagonal drift — breeze changed direction */
export const airDriftOut: Variants = {
  hidden: { opacity: 1, x: 0, y: 0 },
  visible: {
    opacity: 0, x: -8, y: 4,
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
  },
};

/** Settling spring — feather finding its resting position.
 *  Starts 4px above and 4px right, settles with brief overshoot. */
export const settleIn: Variants = {
  hidden: { opacity: 0, x: 4, y: -4 },
  visible: {
    opacity: 1, x: 0, y: 0,
    transition: { type: "spring", stiffness: 180, damping: 22 },
  },
};

/** Stagger container for air current cards — 60ms between children */
export const airStagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

/** Leaf turn — 5° rotational flourish for checkmarks */
export const leafTurn: Variants = {
  hidden: { opacity: 0, scale: 0.8, rotate: -5 },
  visible: {
    opacity: 1, scale: 1, rotate: 0,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
};

// ── Bill Upload Modal animations ────────────────────────────────

/** Backdrop blur-in for the upload modal */
export const modalBackdropReveal: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: sylphEase },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.25, ease: sylphEase },
  },
};

/** Content fade-in within the modal */
export const modalContentEnter: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: sylphEase, delay: 0.05 },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: { duration: 0.2, ease: sylphEase },
  },
};

/** Phase crossfade — used when switching between drop/analyze/verdict */
export const phaseCrossfade: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: sylphEase },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: sylphEase },
  },
};

/** Breathing scale pulse for the analysis detail card */
export const breathingPulse: Variants = {
  idle: { scale: 1 },
  breathe: {
    scale: [1, 1.01, 1],
    transition: { duration: 0.5, ease: "easeInOut" },
  },
};

/** Analysis UI receding before verdict */
export const analysisRecede: Variants = {
  visible: { opacity: 1, scale: 1 },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: { duration: 0.3, ease: sylphEase },
  },
};

/** Verdict card entrance with glow */
export const verdictCardEntrance: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.25, ease: sylphEase },
  },
};

/** Verdict text spring-in */
export const verdictTextSpring: Variants = {
  hidden: { opacity: 0, scale: 0.85, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 180, damping: 22 },
  },
};

/** Stagger container for verdict counter blocks */
export const verdictCountersStagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.7 },
  },
};

/** Individual counter block entrance */
export const verdictCounterItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springSmooth,
  },
};
