"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { sylphEase } from "@/lib/animations";

/**
 * Aceternity-style lamp effect — conic-gradient cone fans upward from
 * bottom-center, with a focal glow and bright lamp bar at the convergence.
 */
export function LampContainer({ className }: { className?: string }) {
  const wedgeTransition = {
    duration: 1.2,
    ease: sylphEase,
    delay: 0.2,
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Cone — conic gradient V-funnel fanning upward from bottom center */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0.5 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={wedgeTransition}
        className="absolute inset-0 origin-bottom"
        style={{
          background:
            "conic-gradient(from 180deg at 50% 100%, transparent 30%, rgba(13,148,136,0.45) 37%, rgba(45,212,191,0.25) 44%, rgba(45,212,191,0.15) 50%, rgba(45,212,191,0.25) 56%, rgba(13,148,136,0.45) 63%, transparent 70%)",
          maskImage:
            "radial-gradient(ellipse 100% 100% at 50% 100%, black 0%, black 25%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 100% 100% at 50% 100%, black 0%, black 25%, transparent 70%)",
        }}
      />

      {/* Focal glow — soft teal bloom at convergence point */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 1.5,
          ease: sylphEase,
          delay: 0.4,
        }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[40%] w-[55%]"
        style={{
          background:
            "radial-gradient(ellipse at center bottom, rgba(13,148,136,0.22) 0%, transparent 65%)",
        }}
      />

      {/* Lamp bar — thin bright line at the convergence */}
      <motion.div
        initial={{ width: "8rem", opacity: 0 }}
        animate={{ width: "24rem", opacity: 1 }}
        transition={{
          duration: 1,
          ease: sylphEase,
          delay: 0.5,
        }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px bg-gradient-to-r from-transparent via-teal-400/40 to-transparent"
      />
    </div>
  );
}
