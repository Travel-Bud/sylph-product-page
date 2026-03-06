"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { CinematicFlowLines } from "@/components/custom/sylph-identity/cinematic-flow-lines";
import { AnimatedHeroDashboard } from "./animated-hero-dashboard";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { blurReveal, scaleUpFade } from "@/lib/animations";

/* ── Hero-specific stagger (needs delayChildren: 0.75) ─────────── */

const heroStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.75 },
  },
};

/* ── Letter reveal headline ──────────────────────────────────────── */

function LetterRevealHeadline({ text }: { text: string }) {
  const words = text.split(" ");

  return (
    <h1
      className="text-6xl md:text-7xl xl:text-[5.25rem] font-normal tracking-tight leading-[0.9] max-w-4xl text-center text-balance"
      style={{
        backgroundImage:
          "linear-gradient(to right, #ffffff, rgba(255,255,255,0.8))",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      }}
    >
      {words.map((word, wi) => (
        <span key={wi} className="inline-block whitespace-nowrap">
          {word.split("").map((char, ci) => (
            <motion.span
              key={ci}
              className="inline-block"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: wi * 0.1 + ci * 0.03,
                type: "spring",
                stiffness: 150,
                damping: 25,
              }}
            >
              {char}
            </motion.span>
          ))}
          {wi < words.length - 1 && (
            <span className="inline-block w-[0.3em]" />
          )}
        </span>
      ))}
    </h1>
  );
}

/* ── Hero section ────────────────────────────────────────────────── */

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-[#0a0f1a] pt-24 md:pt-36 pb-16 md:pb-24">
      {/* Animated grid pattern — breathing teal lines */}
      <div className="pointer-events-none absolute inset-x-0 top-0 hidden h-screen lg:block">
        <AnimatedGridPattern
          numSquares={30}
          maxOpacity={0.05}
          duration={3}
          repeatDelay={1}
          className="fill-teal-500/[0.03] stroke-teal-500/[0.03] [mask-image:radial-gradient(500px_circle_at_center,white,transparent)]"
        />
      </div>

      {/* Flow lines — constrained to viewport height so curves match login proportions */}
      <div className="pointer-events-none absolute inset-x-0 top-0 hidden h-screen lg:block">
        <CinematicFlowLines variant="teal-amber" lines={5} microParticles />
      </div>

      {/* heroFade radial gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, transparent 70%, #0a0f1a 100%)",
        }}
      />

      {/* tealGlow ambient light */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(13,148,136,0.15) 0%, transparent 70%)",
        }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-6 text-center"
        variants={heroStagger}
        initial="hidden"
        animate="visible"
      >
        {/* Headline with per-letter spring animation */}
        <LetterRevealHeadline text="Enforce expense policy before money is spent" />

        {/* Subtitle */}
        <motion.p
          className="text-lg md:text-xl text-gray-400 text-balance max-w-2xl"
          variants={blurReveal}
        >
          AI-native compliance for corporate travel and expenses. Every receipt
          checked, every rule enforced, every exception applied.
        </motion.p>

        {/* CTA group — primary in gradient border wrapper + ghost */}
        <motion.div
          className="flex items-center gap-4"
          variants={blurReveal}
        >
          <Link href="/launching-soon">
            <ShimmerButton
              shimmerColor="#2dd4bf"
              background="rgba(13, 148, 136, 1)"
              borderRadius="14px"
              className="px-5 py-2.5 text-base font-semibold"
            >
              Get Started
            </ShimmerButton>
          </Link>

          {/* Ghost secondary */}
          <a
            href="#how-it-works"
            className="rounded-xl px-5 py-2.5 text-base text-gray-400 transition-colors hover:text-white"
          >
            See how it works
          </a>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          className="flex items-center gap-6"
          variants={blurReveal}
        >
          <span className="text-sm font-medium text-gray-500">
            SOC 2 Type II
          </span>
          <span className="text-sm text-gray-500">&middot;</span>
          <span className="text-sm font-medium text-gray-500">
            GDPR Compliant
          </span>
          <span className="text-sm text-gray-500">&middot;</span>
          <span className="text-sm font-medium text-gray-500">
            Enterprise AI
          </span>
        </motion.div>
      </motion.div>

      {/* Product Preview — delayed entrance */}
      <motion.div
        className="relative z-10 mx-auto mt-10 sm:mt-14 max-w-6xl px-6"
        id="product"
        variants={scaleUpFade}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {/* Outer frame — rounded-2xl, border, inset shadow, p-4 */}
        <div
          className="rounded-2xl border border-white/[0.08] p-4 inset-shadow-2xs"
          style={{
            maskImage:
              "linear-gradient(to bottom, black 60%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 60%, transparent 100%)",
          }}
        >
          {/* Browser chrome */}
          <div className="overflow-hidden rounded-xl">
            {/* Top bar */}
            <div className="flex items-center border-b border-white/[0.06] bg-[#1a1c26] px-4 py-3">
              {/* macOS dots */}
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>
              {/* URL pill */}
              <div className="mx-auto rounded-lg bg-white/[0.06] px-3 py-1">
                <span className="font-mono text-xs text-white/40">
                  app.sylph.ai/dashboard
                </span>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="bg-[#111318]">
              <AnimatedHeroDashboard />
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
