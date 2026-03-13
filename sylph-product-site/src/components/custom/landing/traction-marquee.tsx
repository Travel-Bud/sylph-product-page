"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { Marquee } from "@/components/ui/marquee";
import { CinematicFlowLines } from "@/components/custom/sylph-identity/cinematic-flow-lines";

const companies = [
  { name: "Zoho", subtitle: "Enterprise Interest" },
  { name: "SAP", subtitle: "Enterprise Interest" },
  { name: "Air Arabia", subtitle: "Enterprise Interest" },
  { name: "Airbus", subtitle: "Enterprise Interest" },
];

function CompanyCard({ name, subtitle }: { name: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.04] px-5 py-3">
      <span className="text-base font-semibold text-white">{name}</span>
      <span className="text-xs text-gray-500">{subtitle}</span>
    </div>
  );
}

function EventBadge() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-teal-500/20 bg-teal-500/[0.06] px-5 py-3">
      <div className="h-2 w-2 rounded-full bg-teal-500" />
      <div>
        <span className="text-sm font-semibold text-white">
          Arabian Travel Market 2026
        </span>
        <span className="mx-2 text-gray-600">|</span>
        <span className="text-sm text-teal-400">Dubai</span>
      </div>
      <span className="text-xs text-gray-500">Hosted by Nucore Software Solutions</span>
    </div>
  );
}

export function TractionMarquee() {
  return (
    <section className="relative bg-[#090d17] py-12 md:py-16">

      {/* Brand thread — faint flow lines continue below hero */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block opacity-40">
        <CinematicFlowLines variant="teal" lines={3} intensity={0.4} />
      </div>

      <motion.div
        className="mx-auto max-w-7xl px-6"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
      >
        <motion.p
          variants={fadeInUp}
          className="mb-6 text-center text-sm font-medium uppercase tracking-[0.2em] text-gray-500"
        >
          Trusted by industry leaders
        </motion.p>
      </motion.div>

      <div className="relative overflow-hidden">
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#090d17] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#090d17] to-transparent" />

        <Marquee pauseOnHover className="[--duration:30s]">
          {companies.map((c) => (
            <CompanyCard key={c.name} name={c.name} subtitle={c.subtitle} />
          ))}
          <EventBadge />
        </Marquee>
      </div>
    </section>
  );
}
