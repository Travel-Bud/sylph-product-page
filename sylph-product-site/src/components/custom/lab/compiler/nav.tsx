"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Mark } from "@/components/custom/site/mark";
import { APP_LOGIN, DEMO } from "@/components/custom/site/anchors";
import { isOn, play, setOn, subscribe } from "@/components/custom/v2-sides/sound";

export const SECTIONS = [
  { id: "editor", label: "The editor" },
  { id: "compile-time", label: "Compile time" },
  { id: "before", label: "Before the rules" },
  { id: "month-end", label: "Month end" },
  { id: "start", label: "No policy yet" },
];

export function CxNav() {
  const on = useSyncExternalStore(subscribe, isOn, () => false);
  return (
    <header className="cx-nav">
      <div className="cx-wrap cx-nav-in">
        <Link href="/" className="cx-brand" aria-label="Sylph home">
          <Mark className="cx-mark" />
          <span>Sylph</span>
        </Link>
        <nav className="cx-nav-links" aria-label="Sections">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`}>
              {s.label}
            </a>
          ))}
        </nav>
        <div className="cx-nav-r">
          <button
            type="button"
            className="cx-sound"
            aria-pressed={on}
            aria-label={on ? "Sound on. Press to turn it off." : "Sound off. Press to turn it on."}
            onClick={() => {
              setOn(!on);
              play("toggle");
            }}
          >
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M3.5 7.5h3l4-3.5v12l-4-3.5h-3z" />
              {on ? <path className="cx-sound-w" d="M13.5 7.2a4 4 0 0 1 0 5.6M15.6 5.2a7 7 0 0 1 0 9.6" /> : <path className="cx-sound-w" d="M13.5 8l4 4M17.5 8l-4 4" />}
            </svg>
          </button>
          <a href={APP_LOGIN} className="cx-login">
            Log in
          </a>
          <Link href={DEMO} className="cx-btn cx-btn--ink">
            Book a demo
          </Link>
        </div>
      </div>
    </header>
  );
}
