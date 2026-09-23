import type { Metadata } from "next";

/* The 2026-09-22 explore run, served at /lab: new directions for the landing, one route each, none linked from the
   site (docs/plans/2026-09-22-landing-v2/explore/README.md). Every route under /lab is noindex. */
export const metadata: Metadata = {
  title: "Sylph lab",
  robots: { index: false, follow: false },
};

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return children;
}
