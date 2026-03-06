"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCountUp, springSnappy, sylphEase, driftIn } from "@/lib/animations";

/* ── Mock data ───────────────────────────────────────────────────── */

const expenses = [
  { vendor: "Delta Air Lines", id: "EXP-2847", amount: "$847.50", status: "Compliant", rule: "Max Per Diem" },
  { vendor: "Marriott Hotels", id: "EXP-2848", amount: "$312.00", status: "Flagged", rule: "Advance Booking" },
  { vendor: "Uber Business", id: "EXP-2849", amount: "$34.20", status: "Compliant", rule: "Transport Limit" },
  { vendor: "Ruth's Chris", id: "EXP-2850", amount: "$285.00", status: "Blocked", rule: "Meal Cap" },
];

const statusStyles: Record<string, { bg: string; text: string }> = {
  Compliant: { bg: "bg-teal-500/10", text: "text-teal-400" },
  Flagged: { bg: "bg-amber-500/10", text: "text-amber-400" },
  Blocked: { bg: "bg-red-500/10", text: "text-red-400" },
};

const badges = [
  { label: "COMPLIANT", color: "bg-teal-500/15 text-teal-400 border-teal-500/20" },
  { label: "PENDING", color: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  { label: "FLAGGED", color: "bg-red-500/15 text-red-400 border-red-500/20" },
];

const kpis = [
  { label: "Compliance", target: 94, suffix: "%", accent: "border-l-teal-500" },
  { label: "Processed", target: 247, suffix: "", accent: "border-l-gray-500" },
  { label: "Flagged", target: 12, suffix: "", accent: "border-l-amber-500" },
  { label: "Review", target: 3, suffix: "", accent: "border-l-red-500" },
] as const;

/* ── KPI card with count-up ──────────────────────────────────────── */

function KpiCard({
  label,
  target,
  suffix,
  accent,
  index,
}: {
  label: string;
  target: number;
  suffix: string;
  accent: string;
  index: number;
}) {
  const value = useCountUp(target, 1200);

  return (
    <motion.div
      className={`rounded-lg border border-white/[0.06] bg-white/[0.03] border-l-2 ${accent} pl-3 pr-3 py-2.5`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
    >
      <p
        className="font-mono text-lg font-bold text-white"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {value}
        {suffix}
      </p>
      <p className="text-xs text-gray-500">{label}</p>
    </motion.div>
  );
}

/* ── Main dashboard component ────────────────────────────────────── */

export function AnimatedHeroDashboard() {
  const prefersReducedMotion = useReducedMotion();

  // For reduced motion, show final state immediately
  const instant = prefersReducedMotion
    ? { initial: undefined, animate: undefined, transition: { duration: 0 } }
    : {};

  return (
    <div className="flex h-full flex-col bg-[#111318] p-4 sm:p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Expense Dashboard</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <motion.div
              className="h-1.5 w-1.5 rounded-full bg-teal-500"
              animate={prefersReducedMotion ? {} : { opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-xs text-teal-400">Live</span>
          </div>
          <span className="font-mono text-xs text-gray-600">Mar 2, 2026</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        {kpis.map((kpi, i) => (
          <KpiCard
            key={kpi.label}
            label={kpi.label}
            target={kpi.target}
            suffix={kpi.suffix}
            accent={kpi.accent}
            index={i}
          />
        ))}
      </div>

      {/* Compliance Progress Bar */}
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-gray-500">Compliance Score</span>
          <span className="font-mono font-bold text-teal-400" style={{ fontVariantNumeric: "tabular-nums" }}>
            94%
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-teal-600 to-teal-400"
            initial={{ width: 0 }}
            animate={{ width: "94%" }}
            transition={{
              duration: 1.5,
              delay: 1.0,
              ease: sylphEase,
            }}
            {...instant}
          />
        </div>
      </div>

      {/* Status Badges */}
      <div className="mb-4 flex items-center gap-2">
        {badges.map((badge, i) => (
          <motion.span
            key={badge.label}
            className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badge.color}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              ...(springSnappy as object),
              delay: 2.5 + i * 0.15,
            }}
            {...instant}
          >
            {badge.label}
          </motion.span>
        ))}
      </div>

      {/* Table Header */}
      <div className="mb-0.5 grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 px-3 text-[10px] font-medium uppercase tracking-wider text-gray-600 sm:grid-cols-[1fr_100px_90px_120px]">
        <span>Vendor</span>
        <span className="hidden sm:block">Amount</span>
        <span>Status</span>
        <span className="hidden sm:block">Rule</span>
      </div>

      {/* Expense Table Rows */}
      <div className="flex-1 divide-y divide-white/[0.04]">
        {expenses.map((expense, i) => {
          const style = statusStyles[expense.status] ?? statusStyles.Compliant;
          return (
            <motion.div
              key={expense.id}
              className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 px-3 py-2 sm:grid-cols-[1fr_100px_90px_120px]"
              variants={driftIn}
              initial="hidden"
              animate="visible"
              transition={{
                duration: 0.45,
                delay: 3.5 + i * 0.2,
                ease: sylphEase,
              }}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-200">{expense.vendor}</p>
                <p className="font-mono text-xs text-gray-600">{expense.id}</p>
              </div>
              <span
                className="hidden font-mono text-sm text-gray-400 sm:block"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {expense.amount}
              </span>
              <motion.span
                className={`inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-semibold ${style.bg} ${style.text}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  ...(springSnappy as object),
                  delay: 3.5 + i * 0.2 + 0.15,
                }}
                {...instant}
              >
                {expense.status}
              </motion.span>
              <span className="hidden text-xs text-gray-500 sm:block">{expense.rule}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
