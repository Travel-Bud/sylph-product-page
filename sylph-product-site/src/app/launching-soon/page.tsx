"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  SYLPH_BIRD_VIEWBOX,
  SYLPH_BIRD_PATH,
} from "@/components/custom/sylph-identity/sylph-bird-path";
import { blurReveal, staggerContainer, fadeInUp } from "@/lib/animations";

export default function LaunchingSoonPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#0a0f1a] px-6">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(13,148,136,0.12) 0%, transparent 60%)",
        }}
      />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-6 text-center"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Bird logo */}
        <motion.div variants={fadeInUp}>
          <svg
            width={64}
            height={64}
            viewBox={SYLPH_BIRD_VIEWBOX}
            fill="white"
            className="opacity-80"
            aria-hidden="true"
          >
            <path d={SYLPH_BIRD_PATH} />
          </svg>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={blurReveal}
          className="text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white max-w-2xl text-balance"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff, rgba(255,255,255,0.8))",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Launching in March
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={blurReveal}
          className="text-lg md:text-xl text-gray-400 max-w-md text-balance"
        >
          We&apos;re putting the finishing touches on Sylph. AI-native expense
          compliance is almost here.
        </motion.p>

        {/* Back to home */}
        <motion.div variants={fadeInUp}>
          <Link
            href="/"
            className="mt-4 inline-flex items-center rounded-full border border-white/[0.08] px-5 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:border-white/[0.15] hover:text-white"
          >
            &larr; Back to home
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}
