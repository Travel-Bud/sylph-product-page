"use client";

import { motion } from "framer-motion";
import { Zap, ShieldCheck, Bot, Radio } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { BorderBeam } from "@/components/ui/border-beam";

/* ── Features data ───────────────────────────────────────────────── */

const features = [
  {
    Icon: Zap,
    title: "Instant OCR",
    description:
      "Receipt data extracted and structured in under 2 seconds with Mistral-powered recognition.",
  },
  {
    Icon: ShieldCheck,
    title: "Policy Engine",
    description:
      "Nested AND/OR rule logic with BLOCK, ENFORCE, and EXCEPTION priorities applied deterministically.",
  },
  {
    Icon: Bot,
    title: "AI Agents",
    description:
      "Multi-agent routing handles policy lookups, flight bookings, and enforcement queries via chat.",
  },
  {
    Icon: Radio,
    title: "Real-Time",
    description:
      "Live enforcement verdicts streamed to your dashboard via SSE as each bill is processed.",
  },
];

/* ── Static dashboard mockup for 3D showcase ─────────────────────── */

const expenses = [
  { vendor: "Delta Air Lines", id: "EXP-2847", amount: "$847.50", status: "Compliant" },
  { vendor: "Marriott Hotels", id: "EXP-2848", amount: "$312.00", status: "Flagged" },
  { vendor: "Uber Business", id: "EXP-2849", amount: "$34.20", status: "Compliant" },
  { vendor: "Ruth's Chris", id: "EXP-2850", amount: "$285.00", status: "Blocked" },
  { vendor: "AWS Services", id: "EXP-2851", amount: "$1,240.00", status: "Compliant" },
];

const statusStyles: Record<string, string> = {
  Compliant: "bg-teal-50 text-teal-600",
  Flagged: "bg-amber-50 text-amber-600",
  Blocked: "bg-red-50 text-red-500",
};

function StaticDashboard() {
  return (
    <div className="flex h-full flex-col bg-white p-4 sm:p-6">
      {/* KPI row */}
      <div className="mb-4 grid grid-cols-4 gap-2.5">
        {[
          { label: "Compliance", value: "94%", border: "border-l-teal-500" },
          { label: "Checked", value: "247", border: "border-l-slate-400" },
          { label: "Flagged", value: "12", border: "border-l-amber-500" },
          { label: "Blocked", value: "3", border: "border-l-red-500" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className={`rounded-lg border border-slate-100 bg-slate-50 border-l-2 ${kpi.border} py-2.5 pl-3 pr-3`}
          >
            <p
              className="font-mono text-lg font-bold text-slate-800"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {kpi.value}
            </p>
            <p className="text-xs text-slate-400">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Feed header */}
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">Enforcement Feed</h3>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-teal-500" />
          <span className="text-xs text-teal-600">Live</span>
        </div>
      </div>

      {/* Table header */}
      <div className="mb-0.5 grid grid-cols-[1fr_100px_90px] items-center gap-3 px-3 text-[10px] font-medium uppercase tracking-wider text-slate-400">
        <span>Vendor</span>
        <span>Amount</span>
        <span>Status</span>
      </div>

      {/* Table rows */}
      <div className="flex-1 divide-y divide-slate-100">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className="grid grid-cols-[1fr_100px_90px] items-center gap-3 px-3 py-2"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-700">{expense.vendor}</p>
              <p className="font-mono text-xs text-slate-300">{expense.id}</p>
            </div>
            <span
              className="font-mono text-sm text-slate-600"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {expense.amount}
            </span>
            <span
              className={`inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-semibold ${statusStyles[expense.status]}`}
            >
              {expense.status}
            </span>
          </div>
        ))}
      </div>

      {/* Compliance bar */}
      <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-4">
        <div className="flex-1">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-500">Compliance Score</span>
            <span className="font-mono font-bold text-teal-600">94%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-[94%] rounded-full bg-teal-500" />
          </div>
        </div>
        <span className="text-xs text-slate-400">247 recent</span>
      </div>
    </div>
  );
}

/* ── ProductShowcase section ─────────────────────────────────────── */

export function ProductShowcase() {
  return (
    <section className="relative overflow-hidden bg-[#080c16] py-16 md:py-32">
      {/* Section divider */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <motion.div
        className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-12"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        {/* Left-aligned heading */}
        <motion.div className="relative z-10 max-w-2xl" variants={fadeInUp}>
          <span className="mb-3 block text-sm font-medium uppercase tracking-[0.2em] text-teal-400">
            PLATFORM
          </span>
          <h2 className="text-4xl tracking-tight text-white lg:text-5xl">
            Built for scaling finance teams
          </h2>
          <p className="mt-6 text-lg text-gray-400">
            From receipt upload to verdict — every expense flows through AI extraction,
            deterministic rule evaluation, and real-time compliance streaming.
          </p>
        </motion.div>

        {/* 3D perspective product image */}
        <motion.div
          className="relative -mx-4 rounded-3xl p-3 md:-mx-12 lg:col-span-3"
          variants={fadeInUp}
        >
          <div style={{ perspective: "800px" }}>
            <div
              style={{
                transform: "skewY(-2deg) skewX(-2deg) rotateX(6deg)",
              }}
            >
              <div className="relative aspect-[88/36]">
                {/* Radial gradient overlay for edge blending */}
                <div
                  className="absolute -inset-[4.25rem] z-[1]"
                  style={{
                    backgroundImage:
                      "radial-gradient(at 75% 25%, transparent 0%, #080c16 75%)",
                  }}
                />

                {/* Dashboard in browser chrome frame */}
                <div className="absolute inset-0 z-10 overflow-hidden rounded-xl border border-white/[0.08] shadow-2xl shadow-black/40">
                  {/* Browser bar */}
                  <div className="flex items-center border-b border-slate-200/80 bg-slate-50 px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="mx-auto rounded-lg bg-slate-200/60 px-3 py-1">
                      <span className="font-mono text-xs text-slate-400">
                        app.sylph.ai/enforcement
                      </span>
                    </div>
                  </div>

                  {/* Dashboard content */}
                  <StaticDashboard />

                  <BorderBeam size={100} duration={6} delay={2} />
                </div>

                {/* Background layer for depth */}
                <div className="absolute inset-0 rounded-xl bg-[#111318]" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* 4-column feature grid */}
        <motion.div
          className="relative mx-auto grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-8 lg:grid-cols-4"
          variants={staggerContainer}
        >
          {features.map((feature) => (
            <motion.div key={feature.title} className="space-y-3" variants={fadeInUp}>
              <div className="flex items-center gap-2">
                <feature.Icon className="size-4 text-teal-400" />
                <h3 className="text-sm font-medium text-white">{feature.title}</h3>
              </div>
              <p className="text-sm text-gray-500">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
