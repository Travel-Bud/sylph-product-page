"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Mark } from "@/components/custom/site/mark";
import { APP_LOGIN, DEMO } from "@/components/custom/site/anchors";
import { isOn, play, setOn, subscribe } from "@/components/custom/v2-sides/sound";
import { DEMO_KEY } from "./data";

/** The page's one sound switch: off by default, remembered, and its own click is the gesture audio needs. */
function SoundToggle() {
  const on = useSyncExternalStore(subscribe, isOn, () => false);
  return (
    <button
      type="button"
      className="dp-sound"
      role="switch"
      aria-checked={on}
      onClick={() => {
        setOn(!on);
        if (!on) play("toggle");
      }}
    >
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3.5 7.5h2.8L10 4.5v11l-3.7-3H3.5z" fill="currentColor" fillOpacity={on ? 1 : 0} />
        {on ? <path d="M13 7.2a4 4 0 0 1 0 5.6M15.3 5a7 7 0 0 1 0 10" /> : <path d="M13.5 8l4 4M17.5 8l-4 4" />}
      </svg>
      <span>Sound {on ? "on" : "off"}</span>
    </button>
  );
}

export function DropNav() {
  return (
    <header className="dp-nav">
      <div className="dp-wrap dp-nav-in">
        <Link href="/" className="dp-brand" aria-label="Sylph home">
          <Mark className="dp-brand-mark" />
          Sylph
        </Link>
        <nav className="dp-nav-links" aria-label="Page">
          <a href="#board">The board</a>
          <a href="#gates">Policy</a>
          <a href="#same">Same answer</a>
          <a href="#month">Month end</a>
        </nav>
        <div className="dp-nav-cta">
          <SoundToggle />
          <a href={APP_LOGIN} className="dp-nav-login">
            Log in
          </a>
          <Link href={DEMO} className="dp-btn dp-btn--ink">
            Book a demo
          </Link>
        </div>
      </div>
    </header>
  );
}

/** Runs the ten-drop train on the board above (board.tsx listens), from inside this click. */
export function TenButton({ label = "Drop Sushi Kanda ten times" }: { label?: string }) {
  return (
    <button type="button" className="dp-btn dp-btn--ink" onClick={() => window.dispatchEvent(new CustomEvent("dp:ten", { detail: DEMO_KEY }))}>
      {label}
    </button>
  );
}
