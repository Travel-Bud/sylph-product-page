"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { SYLPH_BIRD_VIEWBOX, SYLPH_BIRD_PATH } from "@/components/custom/sylph-identity/sylph-bird-path";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const navLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Product", href: "#product" },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <>
      {/* Outer fixed container */}
      <nav className="fixed z-20 w-full px-2">
        {/* Inner bar — shrinks max-width and gains visual treatment on scroll */}
        <div
          className={`mx-auto mt-2 flex h-14 items-center justify-between px-6 transition-all duration-300 lg:px-12 ${
            scrolled || mobileOpen
              ? "max-w-4xl rounded-2xl border border-white/[0.06] bg-[#0a0f1a]/50 backdrop-blur-lg lg:px-5"
              : "max-w-6xl"
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <svg
              width={28}
              height={28}
              viewBox={SYLPH_BIRD_VIEWBOX}
              fill="white"
              aria-hidden="true"
            >
              <path d={SYLPH_BIRD_PATH} />
            </svg>
            <span
              className={`text-sm font-semibold tracking-[-0.01em] text-white transition-opacity duration-300 ${
                scrolled ? "opacity-100" : "opacity-0"
              }`}
            >
              Sylph
            </span>
          </Link>

          {/* Desktop anchor links */}
          <div className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-gray-400 transition-colors duration-300 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop right-side CTAs */}
          <div className="hidden items-center gap-4 lg:flex">
            {scrolled ? (
              <Link
                href="/launching-soon"
                className="inline-flex items-center rounded-full bg-teal-600 px-4 py-1.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-teal-700"
              >
                Get Started
              </Link>
            ) : (
              <>
                <Link
                  href="/launching-soon"
                  className="text-sm font-medium text-gray-400 transition-colors duration-300 hover:text-white"
                >
                  Sign in
                </Link>
                <Link
                  href="/launching-soon"
                  className="inline-flex items-center rounded-full bg-teal-600 px-4 py-1.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-teal-700"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger button */}
          <button
            className="relative flex h-8 w-8 items-center justify-center lg:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            <span className="sr-only">{mobileOpen ? "Close" : "Menu"}</span>
            <div className="flex w-[18px] flex-col items-center gap-[5px]">
              <span
                className={`block h-[1.5px] w-full rounded-full bg-white transition-all duration-300 ${
                  mobileOpen ? "translate-y-[6.5px] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-[1.5px] w-full rounded-full bg-white transition-all duration-300 ${
                  mobileOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-[1.5px] w-full rounded-full bg-white transition-all duration-300 ${
                  mobileOpen ? "-translate-y-[6.5px] -rotate-45" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile overlay menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-x-4 top-[4.5rem] z-40 rounded-3xl border border-white/[0.06] bg-[#0a0f1a]/95 p-6 shadow-2xl backdrop-blur-xl lg:hidden"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-xl px-3 py-3 text-sm font-medium text-gray-400 transition-colors hover:bg-white/[0.04] hover:text-white"
                  onClick={closeMobile}
                >
                  {link.label}
                </a>
              ))}
              <div className="my-3 h-px bg-white/[0.06]" />
              <div className="flex flex-col gap-2">
                <Link
                  href="/launching-soon"
                  className="inline-flex items-center justify-center rounded-full border border-white/[0.08] px-4 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:border-white/[0.15] hover:text-white"
                  onClick={closeMobile}
                >
                  Sign in
                </Link>
                <Link
                  href="/launching-soon"
                  className="inline-flex items-center justify-center rounded-full bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
                  onClick={closeMobile}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop to close menu on tap outside */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-30 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={closeMobile}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </>
  );
}
