"use client";

import { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface CardSpotlightProps extends React.HTMLAttributes<HTMLDivElement> {
  spotlightColor?: string;
  radius?: number;
}

export function CardSpotlight({
  children,
  className,
  spotlightColor = "rgba(13, 148, 136, 0.08)",
  radius = 300,
  ...props
}: CardSpotlightProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    },
    []
  );

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <div
        className="pointer-events-none absolute -inset-px rounded-[inherit] transition-opacity duration-300"
        style={{
          opacity: isHovering ? 1 : 0,
          background: `radial-gradient(${radius}px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
