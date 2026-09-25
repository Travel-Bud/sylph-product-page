"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mark } from "@/components/custom/site/mark";
import { APP_LOGIN, DEMO, PRICING } from "@/components/custom/site/anchors";
import { isOn, play, setOn, subscribe } from "@/components/custom/v2-sides/sound";
/* the rail, the lit link and the sound switch are styled with the hero */
import "@/components/custom/v2-sides/hero.css";

type Spot = "priya" | "dana" | "month-end" | "your-month" | "questions" | null;
const STOPS = [0, 1, 2, 3, 4, 5];

/* The section being read decides the lit link: a chapter's side, or month end, or the questions. */
function spotOf(el: Element | null): Spot {
  if (!el) return null;
  if (el.id === "questions") return "questions";
  if (el.id === "month-end") return "month-end";
  if (el.id === "your-month") return "your-month";
  /* chapters mark their side with data-side, or a side modifier class */
  const side = (el as HTMLElement).dataset.side ?? el.className.match(/--(priya|dana)\b/)?.[1];
  return side === "priya" || side === "dana" ? side : null;
}

/** The one sound switch: off by default, remembered, and its own click is the gesture audio needs. */
function SoundToggle() {
  const on = useSyncExternalStore(subscribe, isOn, () => false);
  return (
    <button
      type="button"
      className="v2s-sound"
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

/**
 * The nav, with a rail on its bottom edge that tracks the Sushi Kanda charge: six stops, one per
 * courier stop ([data-courier-stop] 0 to 5), filled up to the one the reader has passed, amber
 * while it is an exception and green once month end closes it. The lit link says whose side you
 * are reading. Reading only; nothing here moves the page.
 */
/* A section link: on the landing it glides in place (scroll.tsx) and lights while its section is
   read; anywhere else it leads home to that section. */
function Sec({ id, side, landing, lit, children }: { id: string; side?: "priya" | "dana"; landing: boolean; lit: boolean; children: React.ReactNode }) {
  if (!landing) return <Link href={`/#${id}`}>{children}</Link>;
  return (
    <a href={`#${id}`} data-side={side} aria-current={lit ? "true" : undefined}>
      {children}
    </a>
  );
}

/* Mock B's copy of the landing nav (v2-sides/nav.tsx): identical, except the charge rail, the lit links
   and the sound switch run on / and /mock/B, which the shared nav's route list does not name for this page. */
const LANDING = new Set(["/", "/mock/B"]);

export function MbNav() {
  const rail = useRef<HTMLDivElement>(null);
  const [spot, setSpot] = useState<Spot>(null);
  const path = usePathname();
  const landing = LANDING.has(path);

  useEffect(() => {
    if (!landing) return;
    let raf = 0;
    const tick = () => {
      raf = 0;
      const line = window.innerHeight * 0.5;
      /* where the charge is: piecewise between the stops the reading line sits between */
      const ys = STOPS.map((n) => {
        const el = document.querySelector(`[data-courier-stop="${n}"]`);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return r.top + r.height / 2;
      });
      let p = 0;
      for (let k = 0; k < ys.length - 1; k++) {
        const a = ys[k];
        const b = ys[k + 1];
        if (a == null || b == null) continue;
        if (line >= b) p = k + 1;
        else if (line > a) {
          p = k + (line - a) / (b - a);
          break;
        } else break;
      }
      const r = rail.current;
      if (r) {
        r.style.setProperty("--p", String(p / 5));
        r.querySelectorAll<HTMLElement>(".v2s-rail-stop").forEach((s, i) => s.classList.toggle("is-past", p >= i - 0.001));
        if (p >= 5) r.dataset.done = "";
        else delete r.dataset.done;
      }
      /* whose side: the last section whose top has crossed a line under the nav */
      let cur: Element | null = null;
      document.querySelectorAll(".v2s-ch, #month-end, #your-month, #questions").forEach((s) => {
        if (s.getBoundingClientRect().top <= 64 + window.innerHeight * 0.3) cur = s;
      });
      setSpot(spotOf(cur));
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, [landing]);

  return (
    <header className="v2s-nav">
      <div className="v2s-wrap v2s-nav-in">
        <Link href={landing ? "#top" : "/"} className="v2s-brand" aria-label={landing ? "Sylph, top of page" : "Sylph home"}>
          <Mark className="v2s-brand-mark" />
          Sylph
        </Link>
        <nav className="v2s-nav-links" aria-label="Page">
          <Sec id="receipts" side="priya" landing={landing} lit={spot === "priya"}>
            Priya&rsquo;s side
          </Sec>
          <Sec id="policy" side="dana" landing={landing} lit={spot === "dana"}>
            Dana&rsquo;s side
          </Sec>
          <Sec id="month-end" landing={landing} lit={spot === "month-end"}>
            Month end
          </Sec>
          <Sec id="your-month" landing={landing} lit={spot === "your-month"}>
            Sample month
          </Sec>
          <Sec id="questions" landing={landing} lit={spot === "questions"}>
            Questions
          </Sec>
          <Link href={PRICING} aria-current={path === PRICING ? "page" : undefined}>
            Pricing
          </Link>
        </nav>
        <div className="v2s-nav-cta">
          {/* only the landing makes sound */}
          {landing && <SoundToggle />}
          <a href={APP_LOGIN} className="v2s-nav-login">
            Log in
          </a>
          <Link href={DEMO} className="v2s-btn v2s-btn--ink">
            Book a demo
          </Link>
        </div>
      </div>
      <div className="v2s-rail" aria-hidden="true">
        {/* the charge's rail belongs to the landing; elsewhere this is the nav's plain hairline */}
        {landing && (
          <div className="v2s-wrap">
            <div className="v2s-rail-in" ref={rail}>
              <span className="v2s-rail-fill" />
              {STOPS.map((n) => (
                <span key={n} className="v2s-rail-stop" style={{ left: `${n * 20}%` }} />
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
