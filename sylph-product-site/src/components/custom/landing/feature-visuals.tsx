"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Check,
  X,
  ArrowRight,
  Zap,
  ShieldCheck,
  Bot,
  Radio,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────
   1. OCR Scan Visual
   Adapted from Aceternity's Tracing Beam + Text Generate Effect.
   A receipt with a scan line sweeping down and fields materializing.
   ───────────────────────────────────────────────────────────────────── */

const receiptLines = [
  "DELTA AIR LINES",
  "Flight DL 1842  ATL → SFO",
  "03/08/2026  14:35",
  "Seat 12A  Economy Plus",
  "TOTAL:  $847.50",
  "Card ending 4821",
];

const extractedFields = [
  { label: "Vendor", value: "Delta Air Lines", delay: 0.9 },
  { label: "Amount", value: "$847.50", delay: 1.2 },
  { label: "Date", value: "Mar 8, 2026", delay: 1.5 },
  { label: "Category", value: "Air Travel", delay: 1.8 },
];

export function OCRScanVisual({ active }: { active: boolean }) {
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (active) {
      setScanning(false);
      const t = setTimeout(() => setScanning(true), 200);
      return () => clearTimeout(t);
    }
    setScanning(false);
  }, [active]);

  return (
    <div className="flex h-full flex-col gap-3 bg-[#0d1117] p-5">
      {/* Receipt card */}
      <div className="relative overflow-hidden rounded-lg border border-white/[0.06] bg-[#161b22] p-4 font-mono text-xs">
        {/* Scan line */}
        {scanning && (
          <motion.div
            className="pointer-events-none absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent"
            initial={{ top: 0 }}
            animate={{ top: "100%" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        )}
        {/* Scan glow */}
        {scanning && (
          <motion.div
            className="pointer-events-none absolute inset-x-0 h-8 bg-gradient-to-b from-teal-400/10 to-transparent"
            initial={{ top: -32 }}
            animate={{ top: "100%" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        )}

        <div className="space-y-1.5 text-gray-500">
          {receiptLines.map((line, i) => (
            <div key={i} className={cn(i === 0 && "text-sm font-semibold text-gray-300", i === 4 && "mt-3 border-t border-dashed border-white/[0.06] pt-2 font-semibold text-white")}>
              {line}
            </div>
          ))}
        </div>
      </div>

      {/* Extracted fields */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-teal-400">
          <Zap className="size-3" />
          Extracted Fields
        </div>
        <div className="grid grid-cols-2 gap-2">
          {extractedFields.map((field) => (
            <motion.div
              key={field.label}
              className="rounded-md border border-white/[0.06] bg-[#161b22] px-3 py-2"
              initial={{ opacity: 0, filter: "blur(8px)", y: 4 }}
              animate={
                scanning
                  ? { opacity: 1, filter: "blur(0px)", y: 0 }
                  : { opacity: 0, filter: "blur(8px)", y: 4 }
              }
              transition={{ duration: 0.4, delay: field.delay }}
            >
              <p className="text-[10px] text-gray-500">{field.label}</p>
              <p className="text-xs font-medium text-white">{field.value}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   2. Policy Engine Visual
   Inspired by Aceternity's Timeline component.
   Rule conditions evaluating sequentially with verdicts.
   ───────────────────────────────────────────────────────────────────── */

const ruleConditions = [
  { rule: "Amount ≤ $500", operator: "LTE", result: false },
  { rule: "Category ∈ [Air Travel]", operator: "IN", result: true },
  { rule: "Has pre-approval", operator: "EXISTS", result: true },
  { rule: "Within budget period", operator: "EQ", result: true },
];

export function PolicyEngineVisual({ active }: { active: boolean }) {
  const [step, setStep] = useState(-1);

  useEffect(() => {
    if (!active) {
      setStep(-1);
      return;
    }
    let i = 0;
    const interval = setInterval(() => {
      setStep(i);
      i++;
      if (i > ruleConditions.length) clearInterval(interval);
    }, 500);
    return () => clearInterval(interval);
  }, [active]);

  const allDone = step >= ruleConditions.length;
  const passCount = ruleConditions.filter((c) => c.result).length;
  const failCount = ruleConditions.length - passCount;

  return (
    <div className="flex h-full flex-col bg-[#0d1117] p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-teal-400">
          <ShieldCheck className="size-3" />
          Rule Evaluation
        </div>
        <span className="font-mono text-[10px] text-gray-600">
          4 conditions · ENFORCE priority
        </span>
      </div>

      {/* Condition group */}
      <div className="mb-3 rounded-lg border border-white/[0.06] bg-[#161b22] p-3">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded bg-teal-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-teal-400">
            AND
          </span>
          <span className="text-xs text-gray-500">All must pass</span>
        </div>
        <div className="space-y-2">
          {ruleConditions.map((cond, i) => (
            <motion.div
              key={i}
              className="flex items-center justify-between rounded-md border border-white/[0.04] bg-[#0d1117] px-3 py-2"
              initial={{ opacity: 0.4 }}
              animate={{
                opacity: step >= i ? 1 : 0.4,
                borderColor:
                  step >= i
                    ? cond.result
                      ? "rgba(45,212,191,0.2)"
                      : "rgba(248,113,113,0.2)"
                    : "rgba(255,255,255,0.04)",
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2">
                <span className="rounded bg-white/[0.04] px-1 py-0.5 font-mono text-[9px] text-gray-600">
                  {cond.operator}
                </span>
                <span className="text-xs text-gray-300">{cond.rule}</span>
              </div>
              <AnimatePresence>
                {step >= i && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      damping: 12,
                      stiffness: 400,
                    }}
                  >
                    {cond.result ? (
                      <Check className="size-3.5 text-teal-400" />
                    ) : (
                      <X className="size-3.5 text-red-400" />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Verdict */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 300 }}
            className={cn(
              "flex items-center justify-between rounded-lg border px-4 py-3",
              failCount > 0
                ? "border-amber-500/20 bg-amber-500/[0.06]"
                : "border-teal-500/20 bg-teal-500/[0.06]"
            )}
          >
            <div>
              <p className="text-xs font-semibold text-white">
                {failCount > 0 ? "FLAGGED" : "COMPLIANT"}
              </p>
              <p className="text-[10px] text-gray-500">
                {passCount}/{ruleConditions.length} conditions passed
              </p>
            </div>
            <div
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px] font-bold",
                failCount > 0
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-teal-500/20 text-teal-400"
              )}
            >
              {failCount > 0 ? "UNCERTAIN" : "PASS"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   3. AI Agent Routing Visual
   Adapted from Aceternity's Chat Conversation block.
   Staggered chat messages with agent routing chip.
   ───────────────────────────────────────────────────────────────────── */

const chatMessages = [
  {
    isUser: true,
    text: "Can I upgrade my flight to business class?",
    delay: 0.3,
  },
  {
    isUser: false,
    isRouting: true,
    text: "sylph_flight_agent",
    delay: 0.9,
  },
  {
    isUser: false,
    text: "Checking your travel policy... Business class is allowed for flights over 6 hours. Your ATL→SFO route is 4h 35m — upgrade requires manager approval.",
    delay: 1.4,
  },
  {
    isUser: true,
    text: "What about the meal expense policy?",
    delay: 2.2,
  },
  {
    isUser: false,
    isRouting: true,
    text: "sylph_retrieval_agent",
    delay: 2.7,
  },
];

export function AgentRoutingVisual({ active }: { active: boolean }) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (!active) {
      setVisibleCount(0);
      return;
    }
    let i = 0;
    const timers: NodeJS.Timeout[] = [];
    chatMessages.forEach((msg, idx) => {
      timers.push(
        setTimeout(() => {
          setVisibleCount(idx + 1);
        }, msg.delay * 1000)
      );
    });
    return () => timers.forEach(clearTimeout);
  }, [active]);

  return (
    <div className="flex h-full flex-col bg-[#0d1117] p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-teal-400">
          <Bot className="size-3" />
          Agent Router
        </div>
        <span className="font-mono text-[10px] text-gray-600">
          sylph_master_agent
        </span>
      </div>

      {/* Messages */}
      <div className="flex flex-1 flex-col gap-2.5 overflow-hidden">
        {chatMessages.map((msg, i) => (
          <AnimatePresence key={i}>
            {i < visibleCount && (
              <motion.div
                initial={{ opacity: 0, x: msg.isUser ? 10 : -10, y: 4 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.3 }}
                className={cn("flex", msg.isUser && "justify-end")}
              >
                {msg.isRouting ? (
                  <div className="flex items-center gap-1.5 rounded-full border border-teal-500/20 bg-teal-500/[0.06] px-3 py-1">
                    <ArrowRight className="size-3 text-teal-400" />
                    <span className="font-mono text-[11px] text-teal-400">
                      {msg.text}
                    </span>
                  </div>
                ) : (
                  <div
                    className={cn(
                      "max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed",
                      msg.isUser
                        ? "bg-teal-500/10 text-teal-100"
                        : "border border-white/[0.06] bg-[#161b22] text-gray-300"
                    )}
                  >
                    {msg.text}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        ))}

        {/* Typing indicator */}
        {visibleCount >= chatMessages.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-1 px-3 py-2"
          >
            {[0, 1, 2].map((d) => (
              <motion.div
                key={d}
                className="h-1.5 w-1.5 rounded-full bg-gray-600"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: d * 0.2,
                }}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   4. Real-Time Streaming Visual
   Adapted from Aceternity's Animated List / Card Stack pattern.
   Rows stream in one-by-one with staggered animations.
   ───────────────────────────────────────────────────────────────────── */

const streamRows = [
  { vendor: "Delta Air Lines", id: "EXP-2847", amount: "$847.50", status: "Compliant" as const },
  { vendor: "Marriott Hotels", id: "EXP-2848", amount: "$312.00", status: "Flagged" as const },
  { vendor: "Uber Business", id: "EXP-2849", amount: "$34.20", status: "Compliant" as const },
  { vendor: "Ruth's Chris", id: "EXP-2850", amount: "$285.00", status: "Blocked" as const },
  { vendor: "AWS Services", id: "EXP-2851", amount: "$1,240.00", status: "Compliant" as const },
];

const statusBadge = {
  Compliant: "bg-teal-500/10 text-teal-400",
  Flagged: "bg-amber-500/10 text-amber-400",
  Blocked: "bg-red-500/10 text-red-400",
};

export function LiveFeedVisual({ active }: { active: boolean }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    if (!active) {
      setVisibleCount(0);
      setBarWidth(0);
      return;
    }
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleCount(i);
      if (i >= streamRows.length) {
        clearInterval(interval);
        setBarWidth(94);
      }
    }, 400);
    return () => clearInterval(interval);
  }, [active]);

  return (
    <div className="flex h-full flex-col bg-[#0d1117] p-5">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-teal-400">
          <Radio className="size-3" />
          Live Enforcement Feed
        </div>
        <div className="flex items-center gap-1.5">
          <motion.div
            className="h-1.5 w-1.5 rounded-full bg-teal-500"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-[10px] text-teal-400">Streaming</span>
        </div>
      </div>

      {/* Column headers */}
      <div className="mb-1 grid grid-cols-[1fr_70px_70px] gap-2 px-2 text-[9px] font-medium uppercase tracking-wider text-gray-600">
        <span>Vendor</span>
        <span>Amount</span>
        <span>Status</span>
      </div>

      {/* Rows */}
      <div className="flex-1 space-y-0.5">
        {streamRows.map((row, i) => (
          <AnimatePresence key={row.id}>
            {i < visibleCount && (
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  type: "spring",
                  damping: 25,
                  stiffness: 300,
                }}
                className="grid grid-cols-[1fr_70px_70px] items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-white/[0.02]"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-gray-300">
                    {row.vendor}
                  </p>
                  <p className="font-mono text-[10px] text-gray-600">
                    {row.id}
                  </p>
                </div>
                <span
                  className="font-mono text-xs text-gray-400"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {row.amount}
                </span>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    damping: 12,
                    stiffness: 400,
                    delay: 0.15,
                  }}
                  className={cn(
                    "inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    statusBadge[row.status]
                  )}
                >
                  {row.status}
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>

      {/* Compliance bar */}
      <div className="mt-3 border-t border-white/[0.06] pt-3">
        <div className="mb-1 flex items-center justify-between text-[10px]">
          <span className="text-gray-500">Compliance Score</span>
          <motion.span
            className="font-mono font-bold text-teal-400"
            initial={{ opacity: 0 }}
            animate={barWidth > 0 ? { opacity: 1 } : {}}
          >
            94%
          </motion.span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-white/[0.04]">
          <motion.div
            className="h-full rounded-full bg-teal-500"
            initial={{ width: "0%" }}
            animate={{ width: `${barWidth}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>
    </div>
  );
}
