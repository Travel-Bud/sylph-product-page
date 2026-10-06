import { Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";

/* The landing's faces are the product's own (brief, 2026-10-05): Hanken Grotesk for every word, IBM Plex Mono
   for labels, rule codes and amounts. Loaded only by the landing's <main>. */
export const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const landingFonts = `${hanken.variable} ${plexMono.variable}`;
