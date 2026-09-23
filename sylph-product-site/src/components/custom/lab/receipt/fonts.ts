import { Martian_Mono } from "next/font/google";

/* The receipt's face: the brand's Martian Mono, loaded variable with its width axis so the print can do
   what a thermal head does, narrow double-height lines for totals and wide double-width ones for the
   merchant. Familjen Grotesk (siteFonts) stays the voice of everything that is not paper. */
export const receiptMono = Martian_Mono({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-rcp-mono",
  display: "swap",
});
