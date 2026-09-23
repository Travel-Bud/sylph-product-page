"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PICKS_KEY, SLOTS, reloadPicks, type Slot } from "./sound";
import { CANDIDATES, DEFAULTS, SLOT_INFO } from "./sound-candidates";

/*
 * /v2/sounds: Ben chooses the landing's sounds by ear. Every candidate plays on its own
 * AudioContext here (no sound switch needed), and "Use this" saves the slot's pick to
 * localStorage, which sound.ts reads at once, so the landing plays it next time it sounds.
 * Keys: 1 to 8 play the active slot's candidates, arrow up and down change slot, Enter uses the
 * last one played.
 */

type Picks = Record<Slot, string>;

function readPicks(): Picks {
  const out = { ...DEFAULTS };
  try {
    const saved = JSON.parse(window.localStorage.getItem(PICKS_KEY) ?? "{}") as Partial<Picks>;
    for (const s of SLOTS) {
      const f = saved[s];
      if (f && CANDIDATES[s].some((c) => c.file === f)) out[s] = f;
    }
  } catch {
    /* storage blocked: defaults */
  }
  return out;
}

declare global {
  interface Window {
    __auditionErrors?: string[];
  }
}

export function SoundAudition() {
  const [picks, setPicks] = useState<Picks>(DEFAULTS);
  const [active, setActive] = useState<Slot>("tap");
  const [playing, setPlaying] = useState<string | null>(null);
  const [lastPlayed, setLastPlayed] = useState<{ slot: Slot; file: string } | null>(null);
  const [exported, setExported] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const ctx = useRef<AudioContext | null>(null);
  const cache = useRef(new Map<string, Promise<AudioBuffer>>());

  useEffect(() => {
    /* saved picks live in this browser only; read them after mount so the server render stays stable */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPicks(readPicks());
  }, []);

  const buffer = useCallback((file: string) => {
    const c = ctx.current!;
    let p = cache.current.get(file);
    if (!p) {
      p = (async () => {
        for (const ext of ["webm", "mp3"]) {
          try {
            const res = await fetch(`/site/sound/audition/${file}.${ext}`);
            if (!res.ok) continue;
            return await c.decodeAudioData(await res.arrayBuffer());
          } catch {
            /* next format */
          }
        }
        throw new Error(file);
      })();
      cache.current.set(file, p);
    }
    return p;
  }, []);

  const audition = useCallback(
    async (slot: Slot, file: string) => {
      if (!ctx.current) ctx.current = new AudioContext();
      const c = ctx.current;
      if (c.state === "suspended") void c.resume();
      setActive(slot);
      setLastPlayed({ slot, file });
      try {
        const b = await buffer(file);
        const src = c.createBufferSource();
        src.buffer = b;
        src.connect(c.destination);
        src.start();
        setPlaying(`${slot}:${file}`);
        src.onended = () => setPlaying((p) => (p === `${slot}:${file}` ? null : p));
      } catch {
        window.__auditionErrors = [...(window.__auditionErrors ?? []), file];
      }
    },
    [buffer],
  );

  const choose = useCallback((slot: Slot, file: string) => {
    setPicks((prev) => {
      const next = { ...prev, [slot]: file };
      try {
        window.localStorage.setItem(PICKS_KEY, JSON.stringify(next));
      } catch {
        /* storage blocked: the pick lasts until reload */
      }
      reloadPicks();
      return next;
    });
    setExported(null);
  }, []);

  const reset = () => {
    try {
      window.localStorage.removeItem(PICKS_KEY);
    } catch {
      /* ignore */
    }
    reloadPicks();
    setPicks({ ...DEFAULTS });
    setExported(null);
  };

  const exportText = () =>
    SLOTS.map((s) => {
      const c = CANDIDATES[s].find((x) => x.file === picks[s])!;
      return `${s}: ${c.file} (${c.label}${c.file === DEFAULTS[s] ? ", default" : ""})`;
    }).join("\n");

  /* keys: 1 to 8 play, up and down change slot, Enter uses the last played */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("textarea, input[type='text']") || e.metaKey || e.ctrlKey || e.altKey) return;
      const n = Number(e.key);
      if (n >= 1 && n <= 8) {
        const c = CANDIDATES[active][n - 1];
        if (c) {
          e.preventDefault();
          void audition(active, c.file);
        }
      } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        if (t.closest("[role='radiogroup']")) return;
        e.preventDefault();
        const i = SLOTS.indexOf(active) + (e.key === "ArrowDown" ? 1 : -1);
        const next = SLOTS[(i + SLOTS.length) % SLOTS.length];
        setActive(next);
        document.getElementById(`slot-${next}`)?.scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter" && lastPlayed && !t.closest("button, a, input")) {
        choose(lastPlayed.slot, lastPlayed.file);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, audition, lastPlayed, choose]);

  return (
    <div className="v2a">
      <div className="v2a-bar">
        <p className="v2a-keys">
          <kbd>1</kbd> to <kbd>8</kbd> play the active slot&rsquo;s sounds, <kbd>&uarr;</kbd> <kbd>&darr;</kbd> change
          slot, <kbd>Enter</kbd> uses the last one played.
        </p>
        <div className="v2a-bar-acts">
          <button type="button" className="v2s-btn v2s-btn--line" onClick={reset}>
            Back to defaults
          </button>
          <button type="button" className="v2s-btn v2s-btn--ink" onClick={() => (setExported(exportText()), setCopied(false))}>
            Export picks
          </button>
        </div>
      </div>

      {exported && (
        <div className="v2a-export" role="region" aria-label="Your picks">
          <textarea readOnly value={exported} rows={6} aria-label="Your picks, as text" onFocus={(e) => e.currentTarget.select()} />
          <button
            type="button"
            className="v2s-btn v2s-btn--line"
            onClick={() => {
              void navigator.clipboard?.writeText(exported).then(() => setCopied(true));
            }}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}

      {SLOTS.map((slot) => (
        <section
          key={slot}
          id={`slot-${slot}`}
          className={`v2a-slot${active === slot ? " is-active" : ""}`}
          aria-labelledby={`slot-${slot}-t`}
          onFocusCapture={() => setActive(slot)}
          onPointerDown={() => setActive(slot)}
        >
          <div className="v2a-slot-head">
            <h2 id={`slot-${slot}-t`} className="v2a-slot-t">
              {SLOT_INFO[slot].title}
              {active === slot && <span className="v2a-active mono">keys 1 to {CANDIDATES[slot].length}</span>}
            </h2>
            <p className="v2a-slot-where">{SLOT_INFO[slot].where}</p>
          </div>
          <div className="v2a-grid" role="radiogroup" aria-label={`${SLOT_INFO[slot].title}: which sound the page uses`}>
            {CANDIDATES[slot].map((c, i) => {
              const on = picks[slot] === c.file;
              const id = `${slot}-${c.file}`;
              return (
                <div key={c.file} className={`v2a-cand${on ? " is-on" : ""}${playing === `${slot}:${c.file}` ? " is-playing" : ""}`}>
                  <button
                    type="button"
                    className="v2a-play"
                    data-file={c.file}
                    aria-label={`Play ${c.label}`}
                    onClick={() => void audition(slot, c.file)}
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
                      <path d="M4 2.5v11l9-5.5z" fill="currentColor" />
                    </svg>
                    <kbd>{i + 1}</kbd>
                  </button>
                  <div className="v2a-txt">
                    <strong>{c.label}</strong>
                    <span className="mono">
                      {c.ms ? `${c.ms} ms, ` : ""}
                      {c.feel}
                      {c.file === DEFAULTS[slot] ? ", default" : ""}
                    </span>
                  </div>
                  <label className="v2a-use" htmlFor={id}>
                    <input type="radio" id={id} name={`use-${slot}`} checked={on} onChange={() => choose(slot, c.file)} />
                    <span>{on ? "In use" : "Use this"}</span>
                  </label>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <p className="v2a-foot">
        Picks are saved in this browser and drive the landing straight away. Go to <Link href="/">the landing</Link>, turn sound
        on with the speaker in the nav, and click around. Sources and licences: <code>public/site/sound/README.md</code>.
      </p>
    </div>
  );
}
