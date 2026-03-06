"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

interface GlowOrbProps {
  /** Orb color preset. */
  color?: "teal" | "cyan" | "amber";
  /** Diameter in pixels. */
  size?: number;
  /** CSS blur radius in pixels. */
  blur?: number;
  /** Orb opacity (0-1). */
  opacity?: number;
  /** Preset position or custom positioning offsets. */
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "center"
    | { top?: number; right?: number; bottom?: number; left?: number };
  /** Whether to apply the orbDrift animation. */
  animate?: boolean;
  /** Animation cycle duration in seconds. */
  duration?: number;
  /** Additional CSS classes. */
  className?: string;
}

const COLOR_MAP: Record<"teal" | "cyan" | "amber", string> = {
  teal: "#0d9488",
  cyan: "#06b6d4",
  amber: "#f59e0b",
};

function resolvePosition(
  position: GlowOrbProps["position"],
  size: number
): React.CSSProperties {
  const offset = -size / 4;

  if (typeof position === "object" && position !== null) {
    return position;
  }

  switch (position) {
    case "top-right":
      return { top: offset, right: offset };
    case "top-left":
      return { top: offset, left: offset };
    case "bottom-right":
      return { bottom: offset, right: offset };
    case "bottom-left":
      return { bottom: offset, left: offset };
    case "center":
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    default:
      return { top: offset, right: offset };
  }
}

const GlowOrb = React.memo(function GlowOrb({
  color = "teal",
  size = 300,
  blur = 100,
  opacity = 0.06,
  position = "top-right",
  animate = true,
  duration = 10,
  className,
}: GlowOrbProps) {
  const positionStyles = useMemo(
    () => resolvePosition(position, size),
    [position, size]
  );

  const style = useMemo<React.CSSProperties>(() => {
    const base: React.CSSProperties = {
      position: "absolute",
      width: size,
      height: size,
      borderRadius: "50%",
      backgroundColor: COLOR_MAP[color],
      filter: `blur(${blur}px)`,
      opacity,
      pointerEvents: "none",
      willChange: animate ? "transform" : undefined,
      ...positionStyles,
    };

    if (animate) {
      base.animation = `orbDrift ${duration}s ease-in-out infinite`;
    }

    return base;
  }, [color, size, blur, opacity, positionStyles, animate, duration]);

  return (
    <div
      className={cn(className)}
      style={style}
      aria-hidden="true"
    />
  );
});

GlowOrb.displayName = "GlowOrb";

export { GlowOrb };
export type { GlowOrbProps };
