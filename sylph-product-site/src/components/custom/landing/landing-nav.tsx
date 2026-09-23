"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LandingBird } from "./landing-bird";
import { DEMO } from "@/components/custom/site/anchors";

/* one vocabulary — nav and footer agree */
const ANCHORS = [
  { href: "/#capture", label: "Receipts" },
  { href: "/#booking", label: "Booking" },
  { href: "/#setup", label: "Setup" },
  { href: "/#record", label: "Record" },
];

/**
 * Fixed nav with two themes. `overDark` means "this page has night zones —
 * watch for them": the landing starts light over the white hero and flips to
 * the night theme only while the close/footer sit under the bar. Lead pages
 * render the light theme from the start.
 */
export function LandingNav({ overDark = false }: { overDark?: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [overNight, setOverNight] = useState(overDark);
  const ticking = useRef(false);

  useEffect(() => {
    if (!overDark) return;
    const zones = Array.from(document.querySelectorAll<HTMLElement>(".on-night"));
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 24);
        // night theme whenever a dark section sits under the nav bar
        setOverNight(
          zones.some((z) => {
            const r = z.getBoundingClientRect();
            return r.top <= 28 && r.bottom >= 30;
          }),
        );
        ticking.current = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [overDark]);

  useEffect(() => {
    if (overDark) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overDark]);

  const theme = overDark && overNight ? "night" : "light";
  const close = () => setOpen(false);

  return (
    <nav className={`nav${scrolled ? " is-scrolled" : ""}`} data-theme={theme}>
      <div className="wrap nav-inner">
        <Link href="/" className="brand" onClick={close}>
          <span className="mark" aria-hidden="true">
            <LandingBird />
          </span>
          <span>Sylph</span>
        </Link>
        <div className="nav-links">
          {ANCHORS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
          <Link href="/pricing">Pricing</Link>
        </div>
        <div className="nav-cta">
          <Link href="https://app.sylph-product.com/login" className="btn btn-ghost nav-login">
            Log in
          </Link>
          <Link href={DEMO} className="btn btn-primary">
            Book a demo
          </Link>
          <button
            type="button"
            className="nav-burger"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="nav-mobile"
            onClick={() => setOpen((o) => !o)}
          >
            <span className={open ? "x1" : ""} />
            <span className={open ? "x2" : ""} />
            <span className={open ? "x3" : ""} />
          </button>
        </div>
      </div>

      <div id="nav-mobile" className={`nav-mobile${open ? " is-open" : ""}`}>
        {ANCHORS.map((l) => (
          <a key={l.href} href={l.href} onClick={close}>
            {l.label}
          </a>
        ))}
        <Link href="/pricing" onClick={close}>
          Pricing
        </Link>
        <Link href="https://app.sylph-product.com/login" className="btn btn-ghost btn-lg" onClick={close}>
          Log in
        </Link>
        <Link href={DEMO} className="btn btn-primary btn-lg" onClick={close}>
          Book a demo
        </Link>
      </div>
    </nav>
  );
}
