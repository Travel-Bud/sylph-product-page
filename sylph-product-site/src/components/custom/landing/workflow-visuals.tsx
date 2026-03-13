import { FileText, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { fieldReveal, passBadge, chipPop } from "@/lib/animations";
import { NumberTicker } from "@/components/ui/number-ticker";

/* ── Card 1: Policy PDF ────────────────────────────── */
export function PolicyVisual() {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-white/[0.04] px-3 py-2.5">
      <div className="flex h-10 w-8 items-center justify-center rounded border border-red-400/20 bg-red-500/10">
        <FileText className="h-4 w-4 text-red-400" />
      </div>
      <div className="flex-1">
        <div className="text-xs font-medium text-white">travel-policy-2026.pdf</div>
        <div className="text-[10px] text-gray-500">2.4 MB · Uploaded just now</div>
      </div>
    </div>
  );
}

export function PolicyResult() {
  return (
    <div className="space-y-2">
      <motion.div variants={fieldReveal} className="flex items-baseline justify-between text-xs">
        <span className="text-gray-400">Rules extracted</span>
        <span className="font-semibold text-white">
          <NumberTicker value={12} delay={0.3} />
        </span>
      </motion.div>
      <motion.div variants={fieldReveal} className="flex items-baseline justify-between text-xs">
        <span className="text-gray-400">Condition groups</span>
        <span className="font-semibold text-white">
          <NumberTicker value={3} delay={0.5} />
        </span>
      </motion.div>
      <motion.div variants={chipPop} className="mt-1 inline-block rounded-full bg-teal-500/15 px-2.5 py-0.5 text-[10px] font-medium text-teal-400">
        Ready in seconds
      </motion.div>
    </div>
  );
}

/* ── Card 2: Receipt ───────────────────────────────── */
export function ReceiptVisual() {
  return (
    <div className="rounded-lg bg-white/[0.04] p-3">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-medium text-white">Marriott Hotels</span>
        <span className="font-mono text-white">$312.00</span>
      </div>
      <div className="flex gap-1.5">
        {["Photo", "PDF", "Email"].map((fmt) => (
          <span key={fmt} className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[9px] text-gray-500">
            {fmt}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ReceiptResult() {
  return (
    <div className="space-y-1.5">
      {[
        { rule: "Category: Accommodation", pass: true },
        { rule: "Per diem: Within limit", pass: true },
        { rule: "Preferred vendor", pass: true },
      ].map((r) => (
        <motion.div key={r.rule} variants={passBadge} className="flex items-center gap-2 text-xs">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-gray-400">{r.rule}</span>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Card 3: Flight ────────────────────────────────── */
export function FlightVisual() {
  return (
    <div className="rounded-lg bg-white/[0.04] p-3">
      <div className="flex items-center justify-between">
        <div className="text-xs">
          <div className="font-medium text-white">DXB → LHR</div>
          <div className="text-[10px] text-gray-500">Emirates EK-201 · Economy</div>
        </div>
        <div className="text-right text-xs">
          <div className="font-mono font-medium text-white">$847</div>
          <div className="text-[10px] text-gray-500">Mar 28</div>
        </div>
      </div>
    </div>
  );
}

export function FlightResult() {
  return (
    <div className="space-y-2">
      <motion.div variants={fieldReveal} className="text-xs text-gray-400">
        Policy checked before purchase
      </motion.div>
      <motion.div
        variants={chipPop}
        className="inline-block rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400"
      >
        Pre-approved
      </motion.div>
    </div>
  );
}

/* ── Card 4: Export ────────────────────────────────── */
export function ExportVisual() {
  return (
    <div className="rounded-lg bg-white/[0.04] p-3">
      <div className="grid grid-cols-4 gap-px text-[9px]">
        {["Employee", "Vendor", "Amount", "Status"].map((h) => (
          <div key={h} className="bg-white/[0.04] px-1.5 py-1 font-medium uppercase tracking-wider text-gray-500">
            {h}
          </div>
        ))}
        {["Sarah K.", "Marriott", "$312", "✓", "James L.", "Delta", "$847", "✓"].map(
          (cell, i) => (
            <div key={i} className="border-t border-white/[0.04] px-1.5 py-1 text-gray-400">
              {cell}
            </div>
          )
        )}
      </div>
    </div>
  );
}

export function ExportResult() {
  return (
    <div className="space-y-2">
      <motion.div variants={fieldReveal} className="text-xs text-gray-400">
        Your template, Sylph's data
      </motion.div>
      <motion.div variants={fieldReveal} className="flex gap-1.5">
        {["CSV", "XLSX", "API"].map((fmt) => (
          <span key={fmt} className="rounded bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-gray-400">
            {fmt}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
