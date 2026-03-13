"use client";

import { motion } from "framer-motion";
import { FileText, Upload, Plane, Table } from "lucide-react";
import { fadeInUp, staggerLanding } from "@/lib/animations";
import { Particles } from "@/components/ui/particles";
import { WorkflowCard } from "./workflow-card";
import {
  PolicyVisual, PolicyResult,
  ReceiptVisual, ReceiptResult,
  FlightVisual, FlightResult,
  ExportVisual, ExportResult,
} from "./workflow-visuals";

const cards = [
  {
    icon: <FileText className="h-4 w-4" />,
    label: "Upload Policy",
    title: "Drop in your policy PDF",
    visual: <PolicyVisual />,
    result: <PolicyResult />,
  },
  {
    icon: <Upload className="h-4 w-4" />,
    label: "Submit Expense",
    title: "Drop a receipt",
    visual: <ReceiptVisual />,
    result: <ReceiptResult />,
  },
  {
    icon: <Plane className="h-4 w-4" />,
    label: "Book Travel",
    title: "Book a flight",
    visual: <FlightVisual />,
    result: <FlightResult />,
  },
  {
    icon: <Table className="h-4 w-4" />,
    label: "Export Data",
    title: "Export in your format",
    visual: <ExportVisual />,
    result: <ExportResult />,
  },
];

export function ComparisonSection() {
  return (
    <section className="relative overflow-hidden bg-[#080c16] py-20 md:py-28">
      <Particles quantity={40} color="#2dd4bf" speed={0.5} size={1.5} />

      <motion.div
        className="relative mx-auto max-w-5xl px-6"
        variants={staggerLanding}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
      >
        {/* Header */}
        <motion.p
          variants={fadeInUp}
          className="mb-3 text-center text-sm font-medium uppercase tracking-[0.2em] text-teal-400"
        >
          Zero Friction
        </motion.p>
        <motion.h2
          variants={fadeInUp}
          className="mb-4 text-center text-3xl font-semibold tracking-tight text-white md:text-4xl"
        >
          Your workflow. Now intelligent.
        </motion.h2>
        <motion.p
          variants={fadeInUp}
          className="mx-auto mb-14 max-w-2xl text-center text-gray-400"
        >
          Keep your policies, receipts, and spreadsheets. Sylph fits
          in&nbsp;&mdash; you don&apos;t rearrange.
        </motion.p>

        {/* 2x2 Card Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {cards.map((card) => (
            <WorkflowCard key={card.label} {...card} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
