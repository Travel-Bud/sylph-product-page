"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  SYLPH_BIRD_VIEWBOX,
  SYLPH_BIRD_PATH,
} from "@/components/custom/sylph-identity/sylph-bird-path";
import { fadeInUp, staggerContainer } from "@/lib/animations";

/* ── Data ────────────────────────────────────────────────────────── */

const footerLinks = {
  Product: [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Product", href: "#product" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
};

/* ── Social icons ────────────────────────────────────────────────── */

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

/* ── Component ───────────────────────────────────────────────────── */

export function LandingFooter() {
  return (
    <footer
      className="relative w-full px-6 pb-0 pt-16 md:pt-24"
      style={{
        background: `linear-gradient(180deg, #070b12, #060a10),
                     radial-gradient(ellipse at 20% 0%, rgba(13,148,136,0.03), transparent 50%)`,
      }}
    >
      {/* Gradient transition from CTA section */}
      <div className="pointer-events-none absolute inset-x-0 -top-24 h-24 bg-gradient-to-b from-[#070b12] to-[#070b12]" />

      <motion.div
        className="mx-auto grid max-w-7xl gap-12 sm:grid-cols-2 lg:grid-cols-4"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
      >
        {/* Brand column */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-col gap-4 lg:col-span-2"
        >
          <div className="flex items-center gap-2.5">
            <svg
              width={24}
              height={24}
              viewBox={SYLPH_BIRD_VIEWBOX}
              fill="rgba(255,255,255,0.8)"
              aria-hidden="true"
            >
              <path d={SYLPH_BIRD_PATH} />
            </svg>
            <span className="text-lg font-semibold text-white">Sylph</span>
          </div>
          <p className="text-sm italic text-gray-400">Expenses run on air.</p>
          <p className="mt-2 max-w-[280px] text-sm leading-relaxed text-gray-500">
            AI-native compliance that enforces policy before money is spent.
          </p>

          {/* Social icons */}
          <div className="mt-2 flex items-center gap-4">
            <a
              href="#"
              className="text-gray-500 transition-colors hover:text-gray-300"
              aria-label="X (Twitter)"
            >
              <XIcon className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="text-gray-500 transition-colors hover:text-gray-300"
              aria-label="LinkedIn"
            >
              <LinkedInIcon className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="text-gray-500 transition-colors hover:text-gray-300"
              aria-label="GitHub"
            >
              <GitHubIcon className="h-4 w-4" />
            </a>
          </div>
        </motion.div>

        {/* Link columns */}
        {Object.entries(footerLinks).map(([category, links]) => (
          <motion.div
            key={category}
            variants={fadeInUp}
            className="flex flex-col gap-4"
          >
            <span className="text-sm font-medium uppercase tracking-[0.14em] text-gray-500">
              {category}
            </span>
            <ul className="flex flex-col gap-2.5">
              {links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors duration-200 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </motion.div>

      {/* Copyright bar */}
      <div className="mx-auto mt-16 max-w-7xl border-t border-white/[0.04] py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Sylph AI, Inc. All rights
            reserved.
          </p>
          <p className="text-sm text-gray-500">Pittsburgh, PA</p>
        </div>
      </div>
    </footer>
  );
}
