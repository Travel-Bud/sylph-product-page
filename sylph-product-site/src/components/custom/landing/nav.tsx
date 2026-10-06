"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { APP_LOGIN, DEMO } from "@/components/custom/site/anchors";
import { Bird } from "./bird";

/** Clear over the hero's night sky, solid paper once the page scrolls past it. */
export function Nav() {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero) return;
    const io = new IntersectionObserver(([e]) => setSolid(!e.isIntersecting), { rootMargin: "-64px 0px 0px 0px", threshold: 0 });
    const probe = hero.querySelector<HTMLElement>("[data-nav-probe]") ?? hero;
    io.observe(probe);
    return () => io.disconnect();
  }, []);
  return (
    <header className={`lp-nav${solid ? " is-solid" : ""}`}>
      <div className="lp-wrap lp-nav-in">
        <Link href="/" className="lp-brand" aria-label="Sylph, home">
          <Bird className="lp-brand-mark" />
          <span>Sylph</span>
        </Link>
        <nav className="lp-nav-links" aria-label="Sections">
          <a href="#how">How it works</a>
          <a href="#features">Features</a>
          <Link href="/pricing">Pricing</Link>
        </nav>
        <span className="lp-nav-sp" />
        <a href={APP_LOGIN} className="lp-nav-login">
          Log in
        </a>
        <a href={DEMO} className="lp-btn lp-btn--sm lp-nav-cta">
          Book a demo
        </a>
      </div>
    </header>
  );
}
