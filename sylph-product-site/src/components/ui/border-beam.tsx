"use client";

import { useReducedMotion, motion, type Transition } from "framer-motion";
import { cn } from "@/lib/utils";

const VARIANT_COLORS = {
  default: "#2dd4bf",
  warning: "#fbbf24",
  success: "#34d399",
  critical: "#f87171",
} as const;

interface BorderBeamProps {
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
  variant?: "default" | "warning" | "success" | "critical";
  transition?: Transition;
  className?: string;
  style?: React.CSSProperties;
  reverse?: boolean;
  initialOffset?: number;
  borderWidth?: number;
}

export function BorderBeam({
  className,
  size = 80,
  delay = 0,
  duration = 4,
  colorFrom,
  colorTo = "transparent",
  variant,
  transition,
  style,
  reverse = false,
  initialOffset = 0,
  borderWidth = 1.5,
}: BorderBeamProps) {
  const prefersReducedMotion = useReducedMotion();
  const resolvedColor = variant
    ? VARIANT_COLORS[variant]
    : colorFrom ?? VARIANT_COLORS.default;

  if (prefersReducedMotion) {
    return (
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          border: `${borderWidth}px solid ${resolvedColor}20`,
        }}
      />
    );
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 rounded-[inherit] border-transparent"
      style={
        {
          borderWidth: `${borderWidth}px`,
          borderStyle: "solid",
          maskImage:
            "linear-gradient(#fff 0 0), linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          maskClip: "padding-box, border-box",
          WebkitMaskImage:
            "linear-gradient(#fff 0 0), linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          WebkitMaskClip: "padding-box, border-box",
        } as React.CSSProperties
      }
    >
      <motion.div
        className={cn("absolute aspect-square", className)}
        style={
          {
            width: size,
            offsetPath: `rect(0 auto auto 0 round ${size}px)`,
            background: `linear-gradient(to left, ${resolvedColor}, ${colorTo})`,
            ...style,
          } as React.CSSProperties
        }
        initial={{ offsetDistance: `${initialOffset}%` }}
        animate={{
          offsetDistance: reverse
            ? [`${100 - initialOffset}%`, `${-initialOffset}%`]
            : [`${initialOffset}%`, `${100 + initialOffset}%`],
        }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration,
          delay: -delay,
          ...transition,
        }}
      />
    </div>
  );
}
