"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { springSmooth } from "@/lib/animations";

const testimonials = [
  {
    quote:
      "We cut expense review time by 80%. Sylph catches policy violations before they reach my desk.",
    name: "Sarah Chen",
    title: "CFO",
    company: "Meridian Corp",
    initials: "SC",
  },
  {
    quote:
      "The AI agents handle 90% of our travel booking queries. Our finance team finally has bandwidth for strategic work.",
    name: "James Okafor",
    title: "Finance Director",
    company: "Helix Systems",
    initials: "JO",
  },
  {
    quote:
      "Real-time enforcement verdicts changed everything. We went from monthly audits to continuous compliance.",
    name: "Maria Vasquez",
    title: "VP Operations",
    company: "Astra Dynamics",
    initials: "MV",
  },
  {
    quote:
      "Onboarding was seamless — our policies were encoded in the rule engine within a day. No custom code needed.",
    name: "David Park",
    title: "Head of Procurement",
    company: "NovaTech",
    initials: "DP",
  },
];

export function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setActive((i) => (i + 1) % testimonials.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [paused, next]);

  const t = testimonials[active];

  return (
    <section className="relative overflow-hidden bg-[#080c16] py-20 md:py-32">
      {/* Section divider */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div
        className="mx-auto max-w-3xl px-6 text-center"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="relative min-h-[180px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={springSmooth}
            >
              {/* Quote */}
              <p className="text-xl leading-relaxed text-gray-300 md:text-2xl">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Attribution */}
              <div className="mt-8 flex items-center justify-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/10 text-sm font-semibold text-teal-400">
                  {t.initials}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-white">{t.name}</p>
                  <p className="text-xs text-gray-500">
                    {t.title}, {t.company}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot indicators */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "h-2 w-2 rounded-full transition-colors duration-200",
                i === active ? "bg-teal-500" : "bg-zinc-600 hover:bg-zinc-500"
              )}
              aria-label={`Testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
