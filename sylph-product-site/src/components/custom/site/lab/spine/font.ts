import { Instrument_Serif } from "next/font/google";

/**
 * The Spine prototype's display face. Loaded here rather than in the shared
 * `site/fonts.ts` so only this lab route downloads it. Instrument Serif is by
 * the same foundry as Instrument Sans: the sans and the serif share skeletons
 * and spacing, so the pairing reads as one voice rather than two.
 */
export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-spine-serif",
  display: "swap",
});

export const spineFonts = instrumentSerif.variable;
