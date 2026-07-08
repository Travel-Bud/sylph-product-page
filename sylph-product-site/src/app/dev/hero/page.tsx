import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "@/components/custom/landing/landing.css";
import { landingFonts } from "@/components/custom/landing/fonts";
import { HeroLabClient } from "./lab-client";

/**
 * /dev/hero — the paper-flight lab. Dev-only: production 404s unless
 * NEXT_PUBLIC_ENABLE_HERO_LAB is set. landing.css + landingFonts are imported
 * here the same way src/app/page.tsx does it, and the client tree is wrapped
 * in `sylph-lp lp-home`, so the queue panel renders EXACTLY as it does on the
 * real landing page — the capture fidelity work depends on that.
 */

export const metadata: Metadata = {
  title: "Sylph · hero flight lab",
  robots: { index: false, follow: false },
};

export default function HeroLabPage() {
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_ENABLE_HERO_LAB !== "1") {
    notFound();
  }
  return (
    <main className={`sylph-lp lp-home ${landingFonts}`}>
      <HeroLabClient />
    </main>
  );
}
