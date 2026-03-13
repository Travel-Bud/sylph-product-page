"use client";

import { useCallback, useEffect, useRef, type ComponentPropsWithoutRef } from "react";
import {
  useInView,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { cn } from "@/lib/utils";

interface NumberTickerProps extends ComponentPropsWithoutRef<"span"> {
  value: number;
  startValue?: number;
  direction?: "up" | "down";
  delay?: number;
  decimalPlaces?: number;
  prefix?: string;
  suffix?: string;
}

export function NumberTicker({
  value,
  startValue = 0,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
  prefix,
  suffix,
  ...props
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const motionValue = useMotionValue(
    direction === "down" ? value : startValue
  );
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: "0px" });

  // Format number with commas
  const format = useCallback(
    (n: number) =>
      Intl.NumberFormat("en-US", {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      }).format(Number(n.toFixed(decimalPlaces))),
    [decimalPlaces]
  );

  useEffect(() => {
    if (!isInView) return;

    if (prefersReducedMotion) {
      if (ref.current) {
        ref.current.textContent = format(value);
      }
      return;
    }

    const timer = setTimeout(() => {
      motionValue.set(direction === "down" ? startValue : value);
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [motionValue, isInView, delay, value, direction, startValue, prefersReducedMotion, format]);

  useEffect(
    () =>
      springValue.on("change", (latest) => {
        if (ref.current) {
          ref.current.textContent = format(
            Number(latest.toFixed(decimalPlaces))
          );
        }
      }),
    [springValue, decimalPlaces, format]
  );

  return (
    <span
      className={cn("inline-flex items-baseline tabular-nums tracking-wider", className)}
      {...props}
    >
      {prefix && <span>{prefix}</span>}
      <span ref={ref} className="inline-block">
        {format(startValue)}
      </span>
      {suffix && <span>{suffix}</span>}
    </span>
  );
}
