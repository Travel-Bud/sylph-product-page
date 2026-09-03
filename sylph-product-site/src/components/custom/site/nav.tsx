"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Mark } from "./mark";
import { HOME, SITE_ANCHORS } from "./anchors";

/**
 * Fixed bar. Transparent over the hero, frosted once scrolled. On the home
 * page it flips to the night theme while a `.on-night` section sits under it.
 */
export function SiteNav({ watchNight = false }: { watchNight?: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [night, setNight] = useState(false);
  const ticking = useRef(false);

  useEffect(() => {
    const zones = watchNight ? Array.from(document.querySelectorAll<HTMLElement>(".on-night")) : [];
    const read = () => {
      setScrolled(window.scrollY > 24);
      if (zones.length) {
        setNight(
          zones.some((z) => {
            const r = z.getBoundingClientRect();
            return r.top <= 32 && r.bottom >= 32;
          }),
        );
      }
    };
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        read();
        ticking.current = false;
      });
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [watchNight]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <nav className={`nav${scrolled ? " is-scrolled" : ""}${open ? " is-open" : ""}`} data-theme={night ? "night" : "light"}>
      <div className="wrap nav-inner">
        <Link href={HOME} className="brand" onClick={close} aria-label="Sylph home">
          <Mark className="brand-mark" />
          <span>Sylph</span>
        </Link>

        <div className="nav-links">
          {SITE_ANCHORS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
          <Link href={`${HOME}/pricing`}>Pricing</Link>
        </div>

        <div className="nav-cta">
          <Link href="/login" className="btn btn-ghost nav-login">
            Log in
          </Link>
          <Link href={`${HOME}/demo`} className="btn btn-primary">
            Book a demo
          </Link>
          <button
            type="button"
            className="nav-burger"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      {open && <button type="button" className="nav-scrim" aria-label="Close menu" onClick={close} />}
      <div id="site-menu" className="nav-sheet" hidden={!open}>
        {SITE_ANCHORS.map((l) => (
          <a key={l.href} href={l.href} onClick={close}>
            {l.label}
          </a>
        ))}
        <Link href={`${HOME}/pricing`} onClick={close}>
          Pricing
        </Link>
        <div className="nav-sheet-cta">
          <Link href="/login" className="btn btn-secondary btn-lg" onClick={close}>
            Log in
          </Link>
          <Link href={`${HOME}/demo`} className="btn btn-primary btn-lg" onClick={close}>
            Book a demo
          </Link>
        </div>
      </div>
    </nav>
  );
}
