import type { Metadata } from "next";

/* /mock: landing mockups for the team to compare, plus the router between them and the live page.
   Every route under /mock is noindex and nothing on the site links here. */
export const metadata: Metadata = {
  title: "Sylph mockups",
  robots: { index: false, follow: false },
};

export default function MockLayout({ children }: { children: React.ReactNode }) {
  return children;
}
