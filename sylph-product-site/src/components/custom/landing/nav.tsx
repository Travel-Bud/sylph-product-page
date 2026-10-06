"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { APP_LOGIN, DEMO } from "@/components/custom/site/anchors";
import { Bird } from "./bird";

/** Clear over the hero's night sky, solid paper once the page scrolls past it; always solid on the inner pages. */
export function Nav({ solid: always = false }: { solid?: boolean }) {
  const [scrolled, setSolid] = useState(false);
  const solid = always || scrolled;
  useEffect(() => {
    if (always) return;
    const hero = document.getElementById("top");
    if (!hero) return;
    const io = new IntersectionObserver(([e]) => setSolid(!e.isIntersecting), { rootMargin: "-64px 0px 0px 0px", threshold: 0 });
    const probe = hero.querySelector<HTMLElement>("[data-nav-probe]") ?? hero;
    io.observe(probe);
    return () => io.disconnect();
  }, [always]);
  return (
    <header className={`lp-nav${solid ? " is-solid" : ""}`}>
      <div className="lp-wrap lp-nav-in">
        <Link href="/" prefetch={false} className="lp-brand" aria-label="Sylph, home">
          <Bird className="lp-brand-mark" />
          <span>Sylph</span>
        </Link>
        <nav className="lp-nav-links" aria-label="Sections">
          <Link href="/#how" prefetch={false}>
            How it works
          </Link>
          <Link href="/#features" prefetch={false}>
            Features
          </Link>
          <Link href="/pricing" prefetch={false}>
            Pricing
          </Link>
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
