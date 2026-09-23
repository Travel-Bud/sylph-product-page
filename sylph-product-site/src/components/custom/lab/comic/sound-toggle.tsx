"use client";

import { useSyncExternalStore } from "react";
import { isOn, play, setOn, subscribe } from "@/components/custom/v2-sides/sound";

/** The page's one sound switch: off by default, remembered, and its own click is the gesture audio needs. */
export function SoundToggle() {
  const on = useSyncExternalStore(subscribe, isOn, () => false);
  return (
    <button
      type="button"
      className="cx-sound"
      aria-pressed={on}
      aria-label="Sound"
      title={on ? "Sound on" : "Sound off"}
      onClick={() => {
        setOn(!on);
        if (!on) play("toggle");
      }}
    >
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3.5 7.5h2.8L10 4.5v11l-3.7-3H3.5z" fill="currentColor" fillOpacity={on ? 1 : 0} />
        {on ? <path d="M13 7.2a4 4 0 0 1 0 5.6M15.3 5a7 7 0 0 1 0 10" /> : <path d="M13.5 8l4 4M17.5 8l-4 4" />}
      </svg>
    </button>
  );
}
