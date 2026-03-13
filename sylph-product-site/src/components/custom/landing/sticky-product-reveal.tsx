"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { Zap, ShieldCheck, Bot, Radio } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { BorderBeam } from "@/components/ui/border-beam";
import { DotPattern } from "@/components/ui/dot-pattern";
import {
  OCRScanVisual,
  PolicyEngineVisual,
  AgentRoutingVisual,
  LiveFeedVisual,
} from "./feature-visuals";

const features = [
  {
    Icon: Zap,
    title: "Instant OCR",
    description:
      "Receipt data extracted and structured in under 2 seconds with Mistral-powered recognition. No manual data entry required.",
  },
  {
    Icon: ShieldCheck,
    title: "Policy Engine",
    description:
      "Nested AND/OR rule logic with BLOCK, ENFORCE, and EXCEPTION priorities applied deterministically to every transaction.",
  },
  {
    Icon: Bot,
    title: "AI Agents",
    description:
      "Multi-agent routing handles policy lookups, flight bookings, and enforcement queries through natural language chat.",
  },
  {
    Icon: Radio,
    title: "Real-Time Streaming",
    description:
      "Live enforcement verdicts streamed to your dashboard via SSE as each bill is processed. No refresh needed.",
  },
];

const visuals = [OCRScanVisual, PolicyEngineVisual, AgentRoutingVisual, LiveFeedVisual];

function FeatureBlock({
  feature,
  index,
  scrollYProgress,
}: {
  feature: (typeof features)[number];
  index: number;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const segmentSize = 1 / features.length;
  const start = index * segmentSize;
  const end = start + segmentSize;

  const opacity = useTransform(
    scrollYProgress,
    [start, start + 0.05, end - 0.05, end],
    [0.3, 1, 1, 0.3]
  );

  return (
    <motion.div
      className="flex h-[100vh] flex-col justify-center"
      style={{ opacity }}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10">
          <feature.Icon className="size-5 text-teal-400" />
        </div>
        <h3 className="text-xl font-medium text-white">{feature.title}</h3>
      </div>
      <p className="mt-4 text-base leading-relaxed text-gray-400">
        {feature.description}
      </p>
    </motion.div>
  );
}

export function StickyProductReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const [activeIndex, setActiveIndex] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = Math.min(
      features.length - 1,
      Math.floor(v * features.length)
    );
    setActiveIndex(idx);
  });

  const ActiveVisual = visuals[activeIndex];

  return (
    <section className="relative bg-[#080c14]">
      {/* Radial glow behind sticky visual (right column) */}
      <div
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{
          background: "radial-gradient(ellipse 50% 60% at 70% 40%, rgba(13, 148, 136, 0.10) 0%, transparent 70%)",
        }}
      />

      {/* Faint dot grid to fill scroll void */}
      <DotPattern
        className="fill-teal-500/[0.05] [mask-image:radial-gradient(800px_circle_at_70%_40%,white,transparent)]"
      />

      {/* Section header */}
      <div className="mx-auto max-w-5xl px-6 pt-16 md:pt-32">
        <span className="mb-3 block text-sm font-medium uppercase tracking-[0.2em] text-teal-400">
          PLATFORM
        </span>
        <h2 className="text-4xl tracking-tight text-white lg:text-5xl">
          Built for scaling finance teams
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-gray-400">
          From receipt upload to verdict — every expense flows through AI
          extraction, deterministic rule evaluation, and real-time compliance
          streaming.
        </p>
      </div>

      {/* Scroll container */}
      <div ref={containerRef} className="relative mx-auto max-w-5xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left — feature text blocks (desktop only) */}
          <div className="hidden lg:block">
            {features.map((feature, i) => (
              <FeatureBlock
                key={feature.title}
                feature={feature}
                index={i}
                scrollYProgress={scrollYProgress}
              />
            ))}
          </div>

          {/* Right — sticky visual that crossfades */}
          <div className="hidden lg:block">
            <div className="sticky top-[20vh] pb-32">
              <div className="relative overflow-hidden rounded-xl border border-white/[0.08] shadow-2xl shadow-black/40">
                {/* Browser bar */}
                <div className="flex items-center border-b border-white/[0.06] bg-[#131720] px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" />
                  </div>
                  <div className="mx-auto rounded-lg bg-white/[0.04] px-3 py-1">
                    <span className="font-mono text-xs text-white/30">
                      app.sylph.ai
                    </span>
                  </div>
                </div>

                {/* Crossfading visuals */}
                <div className="relative min-h-[380px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="absolute inset-0"
                    >
                      <ActiveVisual active={true} />
                    </motion.div>
                  </AnimatePresence>
                </div>

                <BorderBeam size={100} duration={6} delay={2} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile fallback — each feature with its visual */}
      <div className="mx-auto max-w-5xl space-y-6 px-6 pb-16 md:pb-32 lg:hidden">
        {features.map((feature, i) => {
          const Visual = visuals[i];
          return (
            <div key={feature.title} className="space-y-3">
              <div className="flex items-center gap-2">
                <feature.Icon className="size-4 text-teal-400" />
                <h3 className="text-sm font-medium text-white">
                  {feature.title}
                </h3>
              </div>
              <p className="text-sm text-gray-500">{feature.description}</p>
              <div className="overflow-hidden rounded-xl border border-white/[0.08]">
                <Visual active={true} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
