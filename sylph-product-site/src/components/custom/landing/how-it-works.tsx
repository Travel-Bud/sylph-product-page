"use client";

import { motion } from "framer-motion";
import { Upload, ScanSearch, ShieldCheck, CheckCircle2 } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/animations";

/* ── Data ────────────────────────────────────────────────────────── */

const steps = [
  {
    num: "01",
    icon: Upload,
    title: "Upload",
    desc: "Drop a receipt, invoice, or booking. Photo, PDF, or forwarded email.",
  },
  {
    num: "02",
    icon: ScanSearch,
    title: "Extract",
    desc: "Every field pulled with precision — vendor, amount, date, category.",
  },
  {
    num: "03",
    icon: ShieldCheck,
    title: "Enforce",
    desc: "Your rules run automatically. Every condition checked, every exception applied.",
  },
  {
    num: "04",
    icon: CheckCircle2,
    title: "Resolved",
    desc: "Compliant transactions flow. Violations flag with clear explanations.",
  },
];

/* ── Component ───────────────────────────────────────────────────── */

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative bg-[#090d17] py-16 md:py-20 lg:py-24"
    >
      {/* Gradient bleed from hero zone */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0a0f1a] to-transparent" />

      {/* Teal radial glow anchored behind step cards */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 70%, rgba(13, 148, 136, 0.05) 0%, transparent 70%)",
        }}
      />

      <motion.div
        className="max-w-7xl mx-auto px-6"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <motion.p
          variants={fadeInUp}
          className="text-sm font-medium uppercase tracking-[0.2em] text-teal-400 mb-3"
        >
          HOW IT WORKS
        </motion.p>
        <motion.h2
          variants={fadeInUp}
          className="text-3xl sm:text-4xl md:text-5xl tracking-tight text-white"
        >
          From receipt to ruling in seconds.
        </motion.h2>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                variants={fadeInUp}
                className="relative"
              >
                <p className="text-sm font-medium text-teal-400/60 mb-3">
                  {step.num}
                </p>
                <div className="h-10 w-10 rounded-lg bg-teal-500/10 flex items-center justify-center mb-3">
                  <Icon className="h-5 w-5 text-teal-400" />
                </div>
                <h3 className="text-base font-semibold text-white">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-400 mt-1.5 leading-relaxed">
                  {step.desc}
                </p>
                {/* Connector line between steps (desktop only) */}
                {index < 3 && (
                  <div className="hidden lg:block absolute top-5 -right-4 w-8 h-px bg-white/[0.08]" />
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
