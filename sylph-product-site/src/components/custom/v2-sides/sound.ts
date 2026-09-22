/*
 * The page's sound (round 4, contract 1). Every sound is synthesized with WebAudio; there are no
 * audio files. Sound is off by default, and the nav toggle is the only way to turn it on. The
 * choice is remembered in localStorage. Nothing plays before the visitor's first gesture (sticky
 * user activation). Reduced motion never plays anything unless the visitor switched sound on
 * themselves, and switching it on is the only way anything plays, so that rule holds by
 * construction.
 *
 *   import { play } from "./sound";
 *   play("tap");   // "tap" | "send" | "land" | "stamp" | "swish" | "approve"
 *
 * Call play() only on the visitor's own actions or when the courier lands. It is safe to call
 * anywhere, any time: on the server, before hydration or while sound is off, it does nothing.
 */

export type SoundName = "tap" | "send" | "land" | "stamp" | "swish" | "approve";

const KEY = "v2s-sound";
let pref: boolean | null = null;
let ctx: AudioContext | null = null;
let out: GainNode | null = null;
let noise: AudioBuffer | null = null;
let gestured = false;
const subs = new Set<(on: boolean) => void>();

function read(): boolean {
  if (pref !== null) return pref;
  try {
    pref = window.localStorage.getItem(KEY) === "on";
  } catch {
    pref = false;
  }
  return pref;
}

/** Whether the visitor has switched sound on (false on the server). */
export function isOn(): boolean {
  if (typeof window === "undefined") return false;
  return read();
}

/** Turn sound on or off. Call it from the toggle's click, which also counts as the gesture. */
export function setOn(on: boolean) {
  pref = on;
  try {
    window.localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    /* private mode or blocked storage: the choice lasts for this page view */
  }
  if (on) {
    gestured = true;
    audio();
  }
  subs.forEach((f) => f(on));
}

/** For useSyncExternalStore: notifies on toggle, and when another tab changes the choice. */
export function subscribe(fn: (on: boolean) => void): () => void {
  subs.add(fn);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    pref = e.newValue === "on";
    fn(pref);
  };
  window.addEventListener("storage", onStorage);
  return () => {
    subs.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
}

function activated() {
  if (gestured) return true;
  const ua = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
  if (ua?.hasBeenActive) gestured = true;
  return gestured;
}

function audio(): AudioContext | null {
  if (ctx) {
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  }
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  out = ctx.createGain();
  out.gain.value = 0.55;
  out.connect(ctx.destination);
  noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return ctx;
}

/* ---------- voices ---------- */

type Env = { at: number; peak: number; attack: number; hold?: number; decay: number };

function envelope(g: GainNode, { at, peak, attack, hold = 0, decay }: Env) {
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(peak, at + attack);
  g.gain.setValueAtTime(peak, at + attack + hold);
  g.gain.exponentialRampToValueAtTime(0.0001, at + attack + hold + decay);
  return at + attack + hold + decay;
}

/** Filtered noise: paper, air. The filter sweeps from f0 to f1. */
function hiss(c: AudioContext, at: number, e: Omit<Env, "at">, f0: number, f1: number, q = 1, type: BiquadFilterType = "bandpass") {
  const src = c.createBufferSource();
  src.buffer = noise;
  src.playbackRate.value = 0.9 + Math.random() * 0.2;
  const f = c.createBiquadFilter();
  f.type = type;
  f.Q.value = q;
  f.frequency.setValueAtTime(f0, at);
  const g = c.createGain();
  const end = envelope(g, { at, ...e });
  f.frequency.exponentialRampToValueAtTime(f1, end);
  src.connect(f).connect(g).connect(out!);
  src.start(at, Math.random() * 0.5);
  src.stop(end + 0.02);
}

/** A pitched body: a knock, a thump, a chime. The pitch glides from p0 to p1. */
function tone(c: AudioContext, at: number, e: Omit<Env, "at">, p0: number, p1: number, type: OscillatorType = "sine") {
  const o = c.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(p0, at);
  const g = c.createGain();
  const end = envelope(g, { at, ...e });
  o.frequency.exponentialRampToValueAtTime(p1, end);
  o.connect(g).connect(out!);
  o.start(at);
  o.stop(end + 0.02);
}

const VOICES: Record<SoundName, (c: AudioContext, t: number) => void> = {
  /* a fingertip on paper */
  tap: (c, t) => {
    hiss(c, t, { peak: 0.28, attack: 0.002, decay: 0.045 }, 2600, 1800, 1.4);
    tone(c, t, { peak: 0.12, attack: 0.002, decay: 0.05 }, 220, 150);
  },
  /* a short breath of air as the charge leaves */
  send: (c, t) => {
    hiss(c, t, { peak: 0.16, attack: 0.12, decay: 0.26 }, 500, 3400, 0.9);
  },
  /* a soft, settled arrival */
  land: (c, t) => {
    hiss(c, t, { peak: 0.1, attack: 0.003, decay: 0.05 }, 1400, 900, 0.8, "lowpass");
    tone(c, t, { peak: 0.14, attack: 0.006, decay: 0.26 }, 587, 523);
    tone(c, t + 0.005, { peak: 0.05, attack: 0.006, decay: 0.2 }, 880, 784);
  },
  /* rubber on paper: a low thud with a pressed edge */
  stamp: (c, t) => {
    tone(c, t, { peak: 0.34, attack: 0.003, decay: 0.14 }, 130, 58);
    hiss(c, t, { peak: 0.2, attack: 0.002, hold: 0.012, decay: 0.07 }, 900, 500, 0.7, "lowpass");
  },
  /* a sheet sliding past */
  swish: (c, t) => {
    hiss(c, t, { peak: 0.12, attack: 0.05, decay: 0.2 }, 4200, 1600, 1.1);
  },
  /* a small, bright click up */
  approve: (c, t) => {
    tone(c, t, { peak: 0.11, attack: 0.003, decay: 0.08 }, 880, 860, "triangle");
    tone(c, t + 0.075, { peak: 0.11, attack: 0.003, decay: 0.14 }, 1320, 1290, "triangle");
    hiss(c, t, { peak: 0.08, attack: 0.001, decay: 0.02 }, 3000, 2500, 2);
  },
};

let last = 0;

/** Play a sound, if the visitor has turned sound on and has interacted with the page. */
export function play(name: SoundName) {
  if (typeof window === "undefined" || !read() || !activated()) return;
  const c = audio();
  if (!c || !out || !noise) return;
  /* never stack: two calls in the same instant play once */
  const now = c.currentTime;
  if (now - last < 0.03) return;
  last = now;
  try {
    VOICES[name](c, now + 0.005);
  } catch {
    /* audio is decoration; never let it throw into a click handler */
  }
}
