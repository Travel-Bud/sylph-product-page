import { Familjen_Grotesk, Martian_Mono } from "next/font/google";

// The marketing surface's faces. Familjen Grotesk is the page voice (Ben, 2026-09-08, after the
// 2026-09-01 type board and a Familjen/Onest A/B), Martian Mono the evidence face. Loaded only by
// the routes that render under `.site`, so app pages never download them.
export const familjen = Familjen_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-familjen",
  display: "swap",
});

export const martian = Martian_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-martian",
  display: "swap",
});

export const siteFonts = `${familjen.variable} ${martian.variable}`;
