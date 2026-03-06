"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  SYLPH_BIRD_VIEWBOX,
  SYLPH_BIRD_PATH,
} from "@/components/custom/sylph-identity/sylph-bird-path";

/* ── Animation variants from design_guidelines.json ──────────────── */

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, bounce: 0.3, duration: 2 },
  },
};

/* ── Reusable showcase layout ────────────────────────────────────── */

function ShowcaseSection({
  label,
  title,
  description,
  visual,
  reverseLayout = false,
}: {
  label: string;
  title: string;
  description: string;
  visual: React.ReactNode;
  reverseLayout?: boolean;
}) {
  return (
    <div className="mx-auto max-w-7xl px-6">
      <motion.div
        className={`grid grid-cols-1 items-center gap-12 md:gap-16 lg:grid-cols-2 ${
          reverseLayout ? "lg:[grid-auto-flow:dense]" : ""
        }`}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {/* Text content */}
        <motion.div
          className={`flex flex-col items-start gap-4 ${
            reverseLayout ? "lg:col-start-2" : ""
          }`}
          variants={itemVariants}
        >
          <span className="text-sm font-medium uppercase tracking-[0.2em] text-teal-400">
            {label}
          </span>
          <h2 className="text-3xl sm:text-4xl tracking-tight text-white">
            {title}
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed">{description}</p>
        </motion.div>

        {/* Visual mockup */}
        <motion.div
          className={`relative mx-auto w-full max-w-[480px] lg:max-w-none ${
            reverseLayout ? "lg:col-start-1" : ""
          }`}
          variants={itemVariants}
        >
          {/* Decorative background card — shifted for depth */}
          <motion.div
            className="absolute rounded-2xl bg-[#111318] z-0"
            style={{
              width: "90%",
              height: "90%",
              top: reverseLayout ? "auto" : "8%",
              bottom: reverseLayout ? "8%" : "auto",
              left: reverseLayout ? "auto" : "-6%",
              right: reverseLayout ? "-6%" : "auto",
            }}
            initial={{ y: 0 }}
            whileInView={{ y: reverseLayout ? -12 : -16 }}
            transition={{ duration: 1.2, type: "spring", bounce: 0.3 }}
            viewport={{ once: true, amount: 0.5 }}
          />

          {/* Main frosted card */}
          <motion.div
            className="relative z-10 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl shadow-lg shadow-zinc-950/15"
            initial={{ y: 0 }}
            whileInView={{ y: reverseLayout ? 12 : 16 }}
            transition={{
              duration: 1.2,
              type: "spring",
              bounce: 0.3,
              delay: 0.1,
            }}
            viewport={{ once: true, amount: 0.5 }}
          >
            {visual}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ── Mock Visual: Chat Interface ─────────────────────────────────── */

function ChatInterfaceMock() {
  return (
    <div className="p-5 sm:p-6">
      {/* Chat header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="grid h-8 w-8 place-items-center rounded-xl bg-teal-500/10">
          <svg
            width={14}
            height={14}
            viewBox={SYLPH_BIRD_VIEWBOX}
            fill="#0d9488"
          >
            <path d={SYLPH_BIRD_PATH} />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-white">Sylph Assistant</p>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-teal-500" />
            <span className="text-sm text-teal-600">Online</span>
          </div>
        </div>
      </div>

      {/* User message */}
      <div className="mb-4 flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-lg bg-teal-600 px-4 py-2.5">
          <p className="text-sm text-white">
            Check if this Delta receipt is compliant with our travel policy
          </p>
        </div>
      </div>

      {/* AI response */}
      <div className="mb-4 flex justify-start">
        <div className="max-w-[90%] space-y-3 rounded-2xl rounded-bl-lg border border-white/[0.08] bg-white/[0.04] px-4 py-3">
          <p className="text-sm text-gray-300">
            I&apos;ve analyzed the receipt. Here&apos;s what I found:
          </p>

          {/* Extracted fields */}
          <div className="space-y-1.5 rounded-xl bg-white/[0.04] p-3">
            {[
              { field: "Vendor", value: "Delta Air Lines" },
              { field: "Amount", value: "$847.50" },
              { field: "Category", value: "Airfare" },
              { field: "Date", value: "Jan 15, 2026" },
            ].map((item) => (
              <div key={item.field} className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{item.field}</span>
                <span className="font-mono text-sm text-gray-200">
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {/* Verdict */}
          <div className="flex items-center gap-2 rounded-xl bg-teal-500/10 px-3 py-2">
            <div className="grid h-5 w-5 place-items-center rounded-full bg-teal-500/20">
              <svg
                width={10}
                height={10}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#14b8a6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span className="text-sm font-medium text-teal-400">
              Compliant — within per diem limits
            </span>
          </div>
        </div>
      </div>

      {/* Input bar */}
      <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5">
        <span className="flex-1 text-sm text-gray-500">
          Ask about policies, expenses, or bookings...
        </span>
        <div className="grid h-7 w-7 place-items-center rounded-lg bg-teal-600">
          <svg
            width={12}
            height={12}
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ── Mock Visual: Policy Rules Dashboard ─────────────────────────── */

function PolicyDashboardMock() {
  const rules = [
    {
      name: "Max Hotel Per Diem",
      condition: "Hotel nightly rate ≤ $150",
      priority: "ENFORCE",
      priorityColor: "text-teal-400 bg-teal-500/10",
      active: true,
    },
    {
      name: "Advance Booking Required",
      condition: "Flight booked ≥ 14 days ahead",
      priority: "BLOCK",
      priorityColor: "text-red-400 bg-red-500/10",
      active: true,
    },
    {
      name: "Meal Cap",
      condition: "Per meal expense ≤ $75",
      priority: "ENFORCE",
      priorityColor: "text-teal-400 bg-teal-500/10",
      active: true,
    },
    {
      name: "VP Exception",
      condition: "Employee level = VP+",
      priority: "EXCEPTION",
      priorityColor: "text-amber-400 bg-amber-500/10",
      active: false,
    },
  ];

  return (
    <div className="p-5 sm:p-6">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white">Active Policies</p>
          <p className="text-sm text-gray-500">4 rules configured</p>
        </div>
        <div className="rounded-xl bg-teal-500/10 px-3 py-1.5">
          <span className="text-sm font-medium text-teal-400">
            3 active
          </span>
        </div>
      </div>

      {/* Rule cards */}
      <div className="space-y-2.5">
        {rules.map((rule) => (
          <div
            key={rule.name}
            className={`rounded-xl border px-4 py-3 transition-colors ${
              rule.active
                ? "border-white/[0.08] bg-white/[0.04]"
                : "border-white/[0.04] bg-white/[0.02] opacity-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white truncate">
                    {rule.name}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-sm font-medium ${rule.priorityColor}`}
                  >
                    {rule.priority}
                  </span>
                </div>
                <p className="mt-1 font-mono text-sm text-gray-500">
                  {rule.condition}
                </p>
              </div>

              {/* Toggle */}
              <div
                className={`ml-4 h-5 w-9 shrink-0 rounded-full transition-colors ${
                  rule.active ? "bg-teal-600" : "bg-gray-700"
                }`}
              >
                <div
                  className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                    rule.active ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom summary */}
      <div className="mt-4 flex items-center justify-between rounded-xl bg-white/[0.04] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-1">
            {["BLOCK", "ENFORCE", "EXCEPTION"].map((p, i) => (
              <div
                key={p}
                className={`h-3 w-3 rounded-full border border-[#0a0f1a] ${
                  i === 0
                    ? "bg-red-400"
                    : i === 1
                      ? "bg-teal-400"
                      : "bg-amber-400"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-400">Priority cascade active</span>
        </div>
        <span className="font-mono text-sm text-gray-500">
          BLOCK &gt; ENFORCE &gt; EXCEPTION
        </span>
      </div>
    </div>
  );
}

/* ── Exported section ────────────────────────────────────────────── */

export function FeatureShowcase() {
  return (
    <section className="relative bg-[#0a0f1a] py-16 md:py-24 lg:py-32 space-y-16 md:space-y-24 lg:space-y-32">
      {/* Section divider */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* Showcase 1: Chat interface (text left, visual right) */}
      <ShowcaseSection
        label="AI ASSISTANT"
        title="Ask anything about your expenses"
        description="Chat with Sylph's AI to check compliance, analyze receipts, or look up policy rules. Every response is grounded in your company's actual policies."
        visual={<ChatInterfaceMock />}
      />

      {/* Showcase 2: Policy dashboard (text right, visual left) */}
      <ShowcaseSection
        label="POLICY ENGINE"
        title="Policies that enforce themselves"
        description="Define rules with nested AND/OR logic, set priority cascades, and let the engine evaluate every transaction automatically. No manual review required."
        visual={<PolicyDashboardMock />}
        reverseLayout
      />

      {/* Decorative bottom gradient */}
      <div
        className="absolute inset-x-0 bottom-0 h-px"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, rgba(255,255,255,0.12) 0%, transparent 100%)",
        }}
      />
    </section>
  );
}
