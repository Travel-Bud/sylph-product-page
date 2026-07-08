"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { SYLPH_BIRD_VIEWBOX, SYLPH_BIRD_PATH } from "./sylph-bird-path";

interface SylphBirdLogoProps {
  size?: number;
  state?: "idle" | "loading" | "attention" | "static";
  color?: string;
  className?: string;
}

const stateClasses: Record<string, string> = {
  idle: "sylph-bird-idle",
  loading: "sylph-bird-loading",
  attention: "sylph-bird-attention",
  static: "",
};

const SylphBirdLogo = React.memo(function SylphBirdLogo({
  size = 24,
  state = "static",
  color = "#0d9488",
  className,
}: SylphBirdLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={SYLPH_BIRD_VIEWBOX}
      fill={color}
      className={cn(stateClasses[state], className)}
      aria-hidden="true"
    >
      <path d={SYLPH_BIRD_PATH} />
    </svg>
  );
});

SylphBirdLogo.displayName = "SylphBirdLogo";

export { SylphBirdLogo };
export type { SylphBirdLogoProps };
