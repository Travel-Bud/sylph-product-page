"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { fadeInUp, fieldStagger } from "@/lib/animations";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { BorderBeam } from "@/components/ui/border-beam";

interface WorkflowCardProps {
  icon: ReactNode;
  label: string;
  title: string;
  visual: ReactNode;
  result: ReactNode;
}

export function WorkflowCard({ icon, label, title, visual, result }: WorkflowCardProps) {
  return (
    <motion.div variants={fadeInUp}>
      <CardSpotlight className="h-full rounded-2xl border border-white/[0.08] bg-white/[0.02]">
        <div className="relative flex h-full flex-col p-5">
          {/* Action header */}
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400">
              {icon}
            </div>
            <div>
              <div className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                {label}
              </div>
              <div className="text-sm font-medium text-white">{title}</div>
            </div>
          </div>

          {/* Visual mock */}
          <div className="mb-4">{visual}</div>

          {/* Divider */}
          <div className="mb-4 border-t border-dashed border-white/[0.06]" />

          {/* Result area */}
          <motion.div
            variants={fieldStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {result}
          </motion.div>

          <BorderBeam variant="default" size={60} duration={5} />
        </div>
      </CardSpotlight>
    </motion.div>
  );
}
