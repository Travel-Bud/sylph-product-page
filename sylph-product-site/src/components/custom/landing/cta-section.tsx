"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { DotPattern } from "@/components/ui/dot-pattern";

/* ── Component ───────────────────────────────────────────────────── */

export function CtaSection() {
  return (
    <section className="relative bg-[#0a0f1a] py-20 md:py-28 lg:py-36">
      {/* Section divider */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* Ambient teal glow */}
      <div
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(13,148,136,0.15) 0%, transparent 70%)",
        }}
      />

      {/* Dot pattern background */}
      <DotPattern
        className="fill-teal-500/[0.07] [mask-image:radial-gradient(400px_circle_at_center,white,transparent)]"
      />

      {/* Content */}
      <motion.div
        className="relative z-10 mx-auto max-w-7xl px-6 flex flex-col items-center text-center"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <motion.h2
          variants={fadeInUp}
          className="text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white max-w-3xl text-balance"
        >
          Stop approving expenses you should have blocked.
        </motion.h2>

        <motion.p
          variants={fadeInUp}
          className="text-lg md:text-xl text-gray-400 mt-5 max-w-xl text-balance"
        >
          Sylph enforces your policy on every transaction. Before and after the
          spend.
        </motion.p>

        {/* Premium CTA */}
        <motion.div
          variants={fadeInUp}
          className="mt-8 flex flex-col sm:flex-row items-center gap-4"
        >
          <Link href="/launching-soon">
            <ShimmerButton
              shimmerColor="#2dd4bf"
              background="rgba(13, 148, 136, 1)"
              borderRadius="18px"
              className="px-8 py-4 text-lg font-semibold"
            >
              <span className="flex items-center gap-2">
                Get Early Access
                <ArrowRight className="h-5 w-5" />
              </span>
            </ShimmerButton>
          </Link>

          {/* Ghost secondary */}
          <a
            href="#"
            className="rounded-xl px-5 py-2.5 text-base text-gray-400 transition-colors hover:text-white"
          >
            Schedule a Demo
          </a>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          variants={fadeInUp}
          className="mt-8 flex items-center gap-4 text-sm font-medium text-gray-500"
        >
          <span className="flex items-center gap-1.5">
            <div className="h-3.5 w-3.5 rounded-lg bg-white/20" />
            SOC 2
          </span>
          <span className="text-gray-500">|</span>
          <span className="flex items-center gap-1.5">
            <div className="h-3.5 w-3.5 rounded-lg bg-white/20" />
            GDPR
          </span>
          <span className="text-gray-500">|</span>
          <span>Enterprise AI</span>
        </motion.div>
      </motion.div>
    </section>
  );
}
