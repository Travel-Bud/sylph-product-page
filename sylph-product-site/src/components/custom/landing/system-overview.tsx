"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Cog, Bot, SparklesIcon } from "lucide-react";
import {
  SYLPH_BIRD_VIEWBOX,
  SYLPH_BIRD_PATH,
} from "@/components/custom/sylph-identity/sylph-bird-path";

/* ── Animation variants from design_guidelines.json ──────────────── */

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, bounce: 0.3, duration: 2 },
  },
};

const staggerSection = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

/* ── SVG icon components (for use inside the SVG viewBox) ────────── */

const ShieldIcon = ({ x, y }: { x: string; y: string }) => (
  <svg
    x={x}
    y={y}
    width="5"
    height="5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#0d9488"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const ReceiptIcon = ({ x, y }: { x: string; y: string }) => (
  <svg
    x={x}
    y={y}
    width="5"
    height="5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#0d9488"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 2v20l4-2 4 2 4-2 4 2V2l-4 2-4-2-4 2z" />
    <line x1="8" y1="10" x2="16" y2="10" />
    <line x1="8" y1="14" x2="13" y2="14" />
  </svg>
);

const PlaneIcon = ({ x, y }: { x: string; y: string }) => (
  <svg
    x={x}
    y={y}
    width="5"
    height="5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#0d9488"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
  </svg>
);

const ChartIcon = ({ x, y }: { x: string; y: string }) => (
  <svg
    x={x}
    y={y}
    width="5"
    height="5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#0d9488"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

/* ── System visual ───────────────────────────────────────────────── */

function SylphSystemVisual({ className }: { className?: string }) {
  // Connection paths: each badge center → center box at (100, 50)
  const paths = [
    "M 31 15 v 10 q 0 5 5 5 h 59 q 5 0 5 5 v 15",
    "M 77 15 v 10 q 0 5 5 5 h 13 q 5 0 5 5 v 15",
    "M 124 15 v 10 q 0 5 -5 5 h -14 q -5 0 -5 5 v 15",
    "M 169 15 v 10 q 0 5 -5 5 h -59 q -5 0 -5 5 v 15",
  ];

  // Badge definitions: position, width, icon, label
  const badges = [
    { x: 12, w: 38, iconX: "16", label: "Policy", labelX: 26, Icon: ShieldIcon },
    { x: 60, w: 34, iconX: "64", label: "Bills", labelX: 74, Icon: ReceiptIcon },
    { x: 109, w: 30, iconX: "113", label: "Book", labelX: 122, Icon: PlaneIcon },
    { x: 148, w: 42, iconX: "152", label: "Reports", labelX: 162, Icon: ChartIcon },
  ];

  return (
    <div
      className={cn(
        "relative flex h-[360px] w-full max-w-[520px] flex-col items-center",
        className
      )}
    >
      {/* SVG paths and top badges */}
      <svg
        className="h-full w-full"
        width="100%"
        height="100%"
        viewBox="0 0 200 100"
      >
        {/* Connection lines with draw-in animation */}
        <g
          stroke="rgba(255,255,255,0.08)"
          fill="none"
          strokeWidth="0.4"
          strokeDasharray="100 100"
        >
          {paths.map((d, i) => (
            <path key={i} d={d} pathLength={100} />
          ))}
          <animate
            attributeName="stroke-dashoffset"
            from="100"
            to="0"
            dur="1s"
            fill="freeze"
            calcMode="spline"
            keySplines="0.25,0.1,0.5,1"
            keyTimes="0; 1"
          />
        </g>

        {/* Traveling light orbs */}
        {paths.map((d, i) => (
          <g key={`light-${i}`} mask={`url(#sylph-mask-${i})`}>
            <circle r="16" fill="url(#sylph-teal-grad)">
              <animateMotion
                dur="3s"
                repeatCount="indefinite"
                path={d}
                begin={`${1.5 + i * 0.4}s`}
                calcMode="spline"
                keySplines="0.25,0.1,0.5,1"
                keyTimes="0;1"
              />
            </circle>
          </g>
        ))}

        {/* Top badges */}
        <g
          stroke="rgba(255,255,255,0.08)"
          fill="none"
          strokeWidth="0.4"
        >
          {badges.map((badge) => (
            <g key={badge.label}>
              <rect
                fill="#111318"
                x={badge.x}
                y="5"
                width={badge.w}
                height="10"
                rx="5"
              />
              <badge.Icon x={badge.iconX} y="7.5" />
              <text
                x={badge.labelX}
                y="12"
                fill="white"
                stroke="none"
                fontSize="5"
                fontWeight="500"
              >
                {badge.label}
              </text>
            </g>
          ))}
        </g>

        {/* Definitions */}
        <defs>
          {paths.map((d, i) => (
            <mask key={`mask-${i}`} id={`sylph-mask-${i}`}>
              <path d={d} strokeWidth="3" stroke="white" fill="none" />
            </mask>
          ))}
          <radialGradient id="sylph-teal-grad" fx="1">
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
      </svg>

      {/* Central intelligence box */}
      <div className="absolute bottom-10 flex w-full flex-col items-center">
        {/* Bottom teal glow */}
        <div
          className="absolute -bottom-4 h-[100px] w-[62%] rounded-xl"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(13,148,136,0.08) 0%, transparent 70%)",
          }}
        />

        {/* Title badge — "Sylph Intelligence" */}
        <div className="absolute -top-3 z-20 flex items-center justify-center rounded-xl border border-white/[0.08] bg-[#111318] px-3 py-1.5 sm:-top-4">
          <SparklesIcon className="h-3 w-3 text-teal-400" />
          <span className="ml-2 text-sm font-medium text-white">
            Sylph Intelligence
          </span>
        </div>

        {/* Bottom circle — Sylph bird */}
        <div className="absolute -bottom-8 z-30 grid h-[60px] w-[60px] place-items-center rounded-full border-t border-white/[0.08] bg-[#111318]">
          <svg
            width={20}
            height={20}
            viewBox={SYLPH_BIRD_VIEWBOX}
            fill="#0d9488"
            aria-hidden="true"
          >
            <path d={SYLPH_BIRD_PATH} />
          </svg>
        </div>

        {/* Main box */}
        <div className="relative z-10 flex h-[150px] w-full items-center justify-center overflow-hidden rounded-xl border border-white/[0.08] bg-[#0a0f1a] shadow-lg shadow-zinc-950/15">
          {/* Inner badges */}
          <div className="absolute bottom-8 left-8 z-10 flex h-7 items-center gap-2 rounded-full border border-white/[0.08] bg-[#111318] px-3 text-sm sm:left-12">
            <Cog className="h-3.5 w-3.5 text-teal-400" />
            <span className="text-gray-400">Rule Engine</span>
          </div>
          <div className="absolute right-8 top-8 z-10 hidden h-7 items-center gap-2 rounded-full border border-white/[0.08] bg-[#111318] px-3 text-sm sm:flex sm:right-16">
            <Bot className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-gray-400">AI Agents</span>
          </div>

          {/* Pulsing teal circles — atmospheric depth */}
          <motion.div
            className="absolute -bottom-14 h-[100px] w-[100px] rounded-full border-t border-teal-500/10 bg-teal-500/[0.03]"
            animate={{
              scale: [0.98, 1.02, 0.98, 1, 1, 1, 1, 1, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-20 h-[145px] w-[145px] rounded-full border-t border-teal-500/10 bg-teal-500/[0.03]"
            animate={{
              scale: [1, 1, 1, 0.98, 1.02, 0.98, 1, 1, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-[100px] h-[190px] w-[190px] rounded-full border-t border-teal-500/10 bg-teal-500/[0.03]"
            animate={{
              scale: [1, 1, 1, 1, 1, 0.98, 1.02, 0.98, 1, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-[120px] h-[235px] w-[235px] rounded-full border-t border-teal-500/10 bg-teal-500/[0.03]"
            animate={{
              scale: [1, 1, 1, 1, 1, 1, 0.98, 1.02, 0.98, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Section wrapper ─────────────────────────────────────────────── */

export function SystemOverview() {
  return (
    <section className="relative bg-[#070b12] py-16 md:py-20 lg:py-24">
      {/* Gradient bleed from deep neutral zone */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#080c14] to-transparent" />

      {/* Radial teal glow from center — reinforces Sylph Intelligence focal point */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 55% 65% at 50% 65%, rgba(13, 148, 136, 0.10) 0%, transparent 70%)",
        }}
      />

      <motion.div
        className="mx-auto max-w-7xl px-6"
        variants={staggerSection}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <motion.div
          variants={fadeInUp}
          className="mb-8 text-center md:mb-12"
        >
          <span className="mb-3 block text-sm font-medium uppercase tracking-[0.2em] text-teal-400">
            SYSTEM OVERVIEW
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl tracking-tight text-white">
            Four inputs. One intelligence.
          </h2>
          <p className="mt-4 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto text-balance">
            Policies, bills, bookings, and reports all flow into Sylph&apos;s AI
            engine for real-time compliance and enforcement.
          </p>
        </motion.div>

        <motion.div variants={fadeInUp} className="flex justify-center">
          <SylphSystemVisual />
        </motion.div>
      </motion.div>
    </section>
  );
}
