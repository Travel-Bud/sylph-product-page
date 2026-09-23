/*
 * The page's sound (round 5b). Six short recorded clicks (CC0, Kenney "Interface Sounds" and
 * SFXMint; trimmed, warmed and normalised to about -24 LUFS, clicks -22; public/site/sound/, see
 * its README) played through WebAudio with a little pitch and gain variation so repeats don't
 * sound mechanical. /v2/sounds auditions alternatives: a pick saved there (localStorage
 * PICKS_KEY) replaces a slot's file here, at once.
 *
 * The policy, enforced here rather than at the call sites:
 *  - Off by default. The nav toggle is the only switch, and the choice is remembered.
 *  - play() is a no-op unless it runs during, or within WINDOW ms of, a trusted pointerdown,
 *    click or keydown on a control. Scroll, courier landings, timers and animation ends never
 *    make a sound, whoever calls play().
 *  - A click may schedule a short consequence (the hero's charge landing a few seconds later)
 *    with play(name, { delay }). It is booked on the audio clock at the moment of the click,
 *    and hush() cancels anything still pending.
 *  - Nothing is fetched until sound is switched on.
 *
 *   import { play } from "./sound";
 *   play("tap");   // "tap" | "send" | "land" | "stamp" | "swish" | "approve" | "toggle"
 */

export type SoundName = "tap" | "send" | "land" | "stamp" | "swish" | "approve" | "toggle";

/* Six slots, one file each: tap (tabs and pickers), send (the hero's receipt), approve (Dana's
   Approve), stamp (the policy approval), toggle (the sound switch), land (the hero's charge
   landing, booked from its click). `swish` shares send's file. */
export type Slot = "tap" | "send" | "approve" | "stamp" | "toggle" | "land";
export const SLOTS: Slot[] = ["tap", "send", "approve", "stamp", "toggle", "land"];
const FILE: Record<SoundName, Slot> = {
  tap: "tap",
  send: "send",
  swish: "send",
  land: "land",
  stamp: "stamp",
  approve: "approve",
  toggle: "toggle",
};
/* per-slot trim on top of the files' own normalisation */
const LEVEL: Record<Slot, number> = { tap: 1, send: 0.95, approve: 1, stamp: 1, toggle: 0.9, land: 0.8 };
type File = Slot;
const FILES = SLOTS;

/** Where /v2/sounds keeps the visitor's chosen file per slot: { [slot]: "<name>" } under audition/. */
export const PICKS_KEY = "v2s-sound-picks";
function picks(): Partial<Record<Slot, string>> {
  try {
    return JSON.parse(window.localStorage.getItem(PICKS_KEY) ?? "{}") ?? {};
  } catch {
    return {};
  }
}
/** Forget decoded files so the next play loads the current picks (the audition page calls this). */
export function reloadPicks() {
  buffers.clear();
  loading = null;
}

const KEY = "v2s-sound";
const WINDOW = 150;
const CONTROL = "button, a[href], [role='button'], [role='tab'], [role='switch'], [role='checkbox'], input, select, textarea, summary, label";

let pref: boolean | null = null;
let ctx: AudioContext | null = null;
let out: GainNode | null = null;
let loading: Promise<void> | null = null;
const buffers = new Map<File, AudioBuffer>();
const pending = new Set<AudioBufferSourceNode>();
const subs = new Set<(on: boolean) => void>();
let gestureAt = -Infinity;
let last = { file: "", at: 0 };
/* a click that arrived before the files were decoded (the very first one) still sounds, late by
   the decode, as long as that is still plainly its answer */
let queued: { name: SoundName; at: number } | null = null;
const LATE = 600;

function read(): boolean {
  if (pref !== null) return pref;
  try {
    pref = window.localStorage.getItem(KEY) === "on";
  } catch {
    pref = false;
  }
  return pref;
}

/* One capture listener per event on window: it runs before any component's handler, so play()
   inside a click handler always sees its own gesture. Only trusted events on controls count. */
if (typeof window !== "undefined") {
  const mark = (e: Event) => {
    if (!e.isTrusted) return;
    const t = e.target as Element | null;
    if (!t?.closest?.(CONTROL)) return;
    gestureAt = performance.now();
    if (read()) void warm();
  };
  for (const type of ["pointerdown", "click", "keydown"]) window.addEventListener(type, mark, { capture: true, passive: true });
  window.addEventListener("storage", (e) => {
    if (e.key === PICKS_KEY) reloadPicks();
  });
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
  if (on) void warm();
  else hush();
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

function audio(): AudioContext | null {
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    out = ctx.createGain();
    out.gain.value = 0.9;
    out.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

async function decode(c: AudioContext, file: File): Promise<AudioBuffer> {
  const pick = picks()[file];
  const base = pick && /^[a-z0-9_-]+$/i.test(pick) ? `/site/sound/audition/${pick}` : `/site/sound/${file}`;
  /* Opus in WebM first (smaller); MP3 where the browser cannot decode it */
  for (const ext of ["webm", "mp3"]) {
    try {
      const res = await fetch(`${base}.${ext}`);
      if (!res.ok) continue;
      return await c.decodeAudioData(await res.arrayBuffer());
    } catch {
      /* try the next format */
    }
  }
  throw new Error(`sound ${file} did not decode`);
}

/** Fetch and decode every sound once, only after sound is switched on (a gesture made the context). */
function warm(): Promise<void> {
  if (loading) return loading;
  const c = audio();
  if (!c) return Promise.resolve();
  loading = Promise.all(
    FILES.map((f) =>
      decode(c, f)
        .then((b) => void buffers.set(f, b))
        .catch(() => undefined),
    ),
  ).then(() => {
    const q = queued;
    queued = null;
    if (q && performance.now() - q.at < LATE) start(q.name, 0);
  });
  return loading;
}

/** Stop anything a click booked for later (a new pick, or its stage scrolled away). */
export function hush() {
  pending.forEach((s) => {
    try {
      s.stop();
    } catch {
      /* already ended */
    }
  });
  pending.clear();
}

/**
 * Play a sound in answer to the visitor's own click, tap or key press. Outside that window it
 * does nothing. `delay` (seconds) books a consequence of this same click on the audio clock.
 */
export function play(name: SoundName, opts: { delay?: number } = {}) {
  if (typeof window === "undefined" || !read()) return;
  if (performance.now() - gestureAt > WINDOW) return;
  if (!buffers.get(FILE[name])) {
    if (!opts.delay) queued = { name, at: gestureAt };
    void warm();
    return;
  }
  start(name, Math.max(0, opts.delay ?? 0));
}

function start(name: SoundName, delay: number) {
  const c = audio();
  const file = FILE[name];
  const buf = buffers.get(file);
  if (!c || !out || !buf) return;
  const at = c.currentTime + 0.005 + delay;
  /* one gesture, one sound: the same file twice within 40ms plays once */
  if (last.file === file && Math.abs(at - last.at) < 0.04) return;
  last = { file, at };

  const src = c.createBufferSource();
  src.buffer = buf;
  src.playbackRate.value = 0.96 + Math.random() * 0.08;
  const g = c.createGain();
  g.gain.value = LEVEL[file] * (0.86 + Math.random() * 0.14);
  src.connect(g).connect(out);
  try {
    src.start(at);
  } catch {
    return;
  }
  if (delay > 0) {
    pending.add(src);
    src.onended = () => pending.delete(src);
  }
}
