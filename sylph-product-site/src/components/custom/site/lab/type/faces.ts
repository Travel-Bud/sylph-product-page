/* Type board candidates. Nothing from the AI default set (Inter, Space Grotesk, Instrument, IBM Plex, Geist,
   DM Sans, Manrope). All on Google Fonts, so the pick becomes one next/font import in fonts.ts. */
export interface Face {
  id: string;
  name: string;
  family: string;
  note: string;
  weight: number;
  tracking: string;
  /* optional separate display face for the headline only */
  display?: string;
}
export const SANS: Face[] = [
  { id: "base", name: "Instrument Sans (current)", family: '"Instrument Sans", sans-serif', note: "The page today, for reference. Now common in generated pages.", weight: 560, tracking: "-0.032em" },
  { id: "schibsted", name: "Schibsted Grotesk", family: '"Schibsted Grotesk", sans-serif', note: "Newsroom grotesk from Norway. Sturdy, editorial, rare on SaaS pages.", weight: 600, tracking: "-0.03em" },
  { id: "familjen", name: "Familjen Grotesk", family: '"Familjen Grotesk", sans-serif', note: "Swedish, slightly industrial terminals. Warm without being soft.", weight: 600, tracking: "-0.025em" },
  { id: "funnel", name: "Funnel Display + Funnel Sans", family: '"Funnel Sans", sans-serif', display: '"Funnel Display", "Funnel Sans", sans-serif', note: "2024 pair. Squared counters, fintech-modern; headline in Funnel Display, everything else in Funnel Sans.", weight: 600, tracking: "-0.028em" },
  { id: "bricolage", name: "Bricolage Grotesque", family: '"Bricolage Grotesque", sans-serif', note: "Optical sizes, a little eccentric at display size. The riskiest of the set.", weight: 600, tracking: "-0.03em" },
  { id: "onest", name: "Onest", family: '"Onest", sans-serif', note: "Quiet geometric with small quirks. Closest to safe without being the safe set.", weight: 600, tracking: "-0.03em" },
];
export const MONO: Face[] = [
  { id: "plex", name: "IBM Plex Mono (current)", family: '"IBM Plex Mono", monospace', note: "The evidence face today.", weight: 500, tracking: "0" },
  { id: "fragment", name: "Fragment Mono", family: '"Fragment Mono", monospace', note: "Helvetica-shaped mono. Clean, rare.", weight: 400, tracking: "0" },
  { id: "martian", name: "Martian Mono", family: '"Martian Mono", monospace', note: "Wide, technical, distinctive numerals.", weight: 500, tracking: "0" },
  { id: "azeret", name: "Azeret Mono", family: '"Azeret Mono", monospace', note: "Chunky and characterful; strongest personality.", weight: 500, tracking: "0" },
];
export const GOOGLE_CSS =
  "https://fonts.googleapis.com/css2?" +
  [
    "family=Schibsted+Grotesk:wght@400;500;600;700",
    "family=Familjen+Grotesk:wght@400;500;600;700",
    "family=Funnel+Display:wght@400;500;600;700",
    "family=Funnel+Sans:wght@400;500;600",
    "family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600",
    "family=Onest:wght@400;500;600",
    "family=Fragment+Mono",
    "family=Martian+Mono:wght@400;500;600",
    "family=Azeret+Mono:wght@400;500;600",
  ].join("&") +
  "&display=swap";
