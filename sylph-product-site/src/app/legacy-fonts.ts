import localFont from "next/font/local";
import { IBM_Plex_Mono } from "next/font/google";

/* The pre-v3 faces (Satoshi, IBM Plex Mono), loaded only by the routes that still render on them
   (/launching-soon, /terms, /dev) through their own layouts. They used to load from the root layout,
   which preloaded six font files on every page, the landing included (Lighthouse, 2026-09-22). */
const satoshi = localFont({
  src: [
    { path: "../fonts/Satoshi-Variable.woff2", style: "normal" },
    { path: "../fonts/Satoshi-VariableItalic.woff2", style: "italic" },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/* `font-sans` re-resolves --font-sans on the wrapper, where the variables are defined. */
export const legacyFonts = `${satoshi.variable} ${ibmPlexMono.variable} font-sans`;
