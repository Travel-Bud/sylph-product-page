"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { BentoGrid, BentoCell } from "@/components/custom/sylph-identity/bento-grid";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";

/* ── Visuals — self-contained card content components ────────────── */

function ExtractionVisual() {
  const fields = [
    { field: "Vendor", value: "Delta Air Lines", confidence: 99.2 },
    { field: "Amount", value: "$847.50", confidence: 99.1 },
    {
      field: "Date",
      value: "2026-01-15",
      confidence: 98.4,
      desktopOnly: true,
    },
    {
      field: "Category",
      value: "Airfare",
      confidence: 97.8,
      desktopOnly: true,
    },
  ];

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="mb-3 flex items-center gap-2 text-sm text-gray-500 sm:mb-4">
        <motion.div
          className="h-2 w-2 rounded-full bg-teal-500"
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        Extracting fields...
      </div>
      {fields.map((item, i) => (
        <motion.div
          key={item.field}
          className={`flex items-center justify-between rounded-lg bg-white/[0.06] px-3 py-2 transition-colors duration-300 hover:bg-white/[0.1] sm:px-4 sm:py-3 ${item.desktopOnly ? "hidden sm:flex" : ""}`}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: i * 0.15 }}
        >
          <div className="flex items-center gap-3">
            <span className="w-16 text-sm text-gray-500 sm:w-20">
              {item.field}
            </span>
            <span className="font-mono text-sm font-medium text-gray-200">
              {item.value}
            </span>
          </div>
          <motion.span
            className="font-mono rounded-full bg-teal-500/10 px-2 py-0.5 text-sm font-medium text-teal-400"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: i * 0.15 + 0.3 }}
          >
            {item.confidence}%
          </motion.span>
        </motion.div>
      ))}
      <p className="text-center text-sm text-gray-500 sm:hidden">
        + 2 more fields extracted
      </p>
    </div>
  );
}

function ComplianceMonitorVisual() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.08em] text-gray-500">
            Compliance Score
          </p>
          <div className="flex items-baseline gap-1.5">
            <span
              className="font-mono text-3xl font-bold tracking-tight text-teal-400"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              94
            </span>
            <span className="font-mono text-sm text-teal-600">
              / 100
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <motion.div
            className="h-1.5 w-1.5 rounded-full bg-teal-500"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-sm text-teal-600">Monitoring</span>
        </div>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-400"
          initial={{ width: 0 }}
          animate={{ width: "94%" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Checked", value: "247", color: "text-gray-200" },
          { label: "Flagged", value: "12", color: "text-amber-500" },
          { label: "Blocked", value: "3", color: "text-red-500" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-lg bg-white/[0.06] px-2.5 py-2 text-center transition-colors duration-300 hover:bg-white/[0.1]"
          >
            <p
              className={`font-mono text-lg font-bold ${kpi.color}`}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {kpi.value}
            </p>
            <p className="text-sm uppercase tracking-[0.06em] text-gray-500">
              {kpi.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DuplicateComparisonVisual() {
  const fields = [
    { label: "Vendor", valueA: "Marriott", valueB: "Marriott" },
    { label: "Amount", valueA: "$312.00", valueB: "$312.00" },
    { label: "Date", valueA: "02/14", valueB: "02/14" },
  ];

  return (
    <div className="mt-4 space-y-2.5">
      {/* Receipt ID headers */}
      <div className="flex items-center">
        <span className="flex-1 font-mono text-sm text-gray-500">
          EXP-2848
        </span>
        <div className="w-6" />
        <span className="flex-1 text-right font-mono text-sm text-gray-500">
          EXP-3201
        </span>
      </div>

      {/* Field comparison rows */}
      {fields.map((f, i) => (
        <motion.div
          key={f.label}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.12 }}
        >
          <p className="mb-1 text-sm text-gray-500">{f.label}</p>
          <div className="flex items-center gap-1.5">
            <div className="flex-1 rounded-lg bg-teal-500/8 px-2.5 py-1.5 ring-1 ring-teal-500/20">
              <span className="font-mono text-sm text-gray-200">
                {f.valueA}
              </span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <div className="h-px w-3 bg-teal-400/40" />
            </div>
            <div className="flex-1 rounded-lg bg-teal-500/8 px-2.5 py-1.5 ring-1 ring-teal-500/20">
              <span className="font-mono text-sm text-gray-200">
                {f.valueB}
              </span>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Match badge */}
      <motion.div
        className="flex justify-center pt-1"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.4,
          delay: 0.5,
          type: "spring",
          damping: 15,
          stiffness: 400,
        }}
      >
        <span className="rounded-full bg-teal-500/10 px-3 py-1 font-mono text-sm font-medium text-teal-400">
          97% Match
        </span>
      </motion.div>
    </div>
  );
}

function PreSpendVisual() {
  const checks = [
    { rule: "Max $150/night", status: "pass" },
    { rule: "14-day advance", status: "pass" },
    { rule: "Economy class", status: "fail" },
  ];

  return (
    <div className="mt-4 space-y-3">
      {/* Booking card */}
      <div className="rounded-lg bg-white/[0.06] p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">Delta Air Lines</p>
            <p className="text-sm text-gray-500">
              JFK &rarr; LAX &middot; Mar 15
            </p>
          </div>
          <p className="font-mono text-sm font-semibold text-white">
            $342
          </p>
        </div>
      </div>

      {/* Policy checks */}
      {checks.map((check, i) => (
        <motion.div
          key={check.rule}
          className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.8 + i * 0.2 }}
        >
          <span className="text-sm text-gray-400">{check.rule}</span>
          <motion.span
            className={`rounded-full px-2 py-0.5 text-sm font-semibold ${
              check.status === "pass"
                ? "bg-teal-500/10 text-teal-400"
                : "bg-amber-500/10 text-amber-400"
            }`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 1.2 + i * 0.2 }}
          >
            {check.status === "pass" ? "PASS" : "REVIEW"}
          </motion.span>
        </motion.div>
      ))}

      {/* Pre-payment badge */}
      <motion.div
        className="mt-2 flex items-center justify-center gap-1.5 text-sm font-medium text-teal-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <div className="h-1.5 w-1.5 rounded-full bg-teal-400" />
        Checked before payment
      </motion.div>
    </div>
  );
}

/* ── Feature cards data (removed — now rendered explicitly in BentoGrid) */

/* ── FeatureGrid section ─────────────────────────────────────────── */

export function FeatureGrid() {
  return (
    <section
      id="features"
      className="relative bg-[#080c14] py-16 md:py-24 lg:py-32"
    >
      {/* Gradient bleed from warm indigo zone */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#090d17] to-transparent" />

      {/* Breathing grid pattern — elliptical mask on bento area */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        <AnimatedGridPattern
          numSquares={25}
          maxOpacity={0.06}
          duration={4}
          repeatDelay={2}
          className="fill-teal-500/[0.04] stroke-teal-500/[0.04] [mask-image:ellipse(50%_65%_at_50%_55%)]"
        />
      </div>

      <motion.div
        className="mx-auto max-w-7xl px-6"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        {/* Section header */}
        <motion.div variants={fadeInUp}>
          <span className="mb-3 block text-sm font-medium uppercase tracking-[0.2em] text-teal-400">
            FEATURES
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl tracking-tight text-white">
            Everything that powers enforcement.
          </h2>
        </motion.div>

        {/* Bento Grid — flagship "Real-Time Compliance" spans 2 cols */}
        <BentoGrid className="mt-12">
          {/* Flagship card — 2-column span */}
          <BentoCell colSpan={2}>
            <p className="text-base font-semibold text-white">Real-Time Compliance</p>
            <p className="mt-1 text-sm text-gray-400">Policy enforcement at the speed of spend</p>
            <div className="mt-4">
              <ComplianceMonitorVisual />
            </div>
          </BentoCell>

          {/* Remaining 3 cards */}
          <BentoCell>
            <p className="text-base font-semibold text-white">AI Extraction</p>
            <p className="mt-1 text-sm text-gray-400">From receipt to structured data in seconds</p>
            <div className="mt-4">
              <ExtractionVisual />
            </div>
          </BentoCell>

          <BentoCell>
            <p className="text-base font-semibold text-white">Duplicate Detection</p>
            <p className="mt-1 text-sm text-gray-400">Cross-employee history matching</p>
            <div className="mt-4">
              <DuplicateComparisonVisual />
            </div>
          </BentoCell>

          <BentoCell>
            <p className="text-base font-semibold text-white">Pre-Spend Enforcement</p>
            <p className="mt-1 text-sm text-gray-400">Policy checked before payment clears</p>
            <div className="mt-4">
              <PreSpendVisual />
            </div>
          </BentoCell>
        </BentoGrid>
      </motion.div>
    </section>
  );
}
