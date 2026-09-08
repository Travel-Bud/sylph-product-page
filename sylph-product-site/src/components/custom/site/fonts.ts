import { Familjen_Grotesk, Onest, Martian_Mono } from "next/font/google";

// The marketing surface's faces, chosen on the type board (docs/plans/landing-v3/direction-board/type,
// Ben 2026-09-01): Familjen Grotesk is the default page voice, Onest the A/B alternative
// (`?face=onest` on /fresh sets data-face on <main>), Martian Mono the evidence face for both.
// Loaded only by the routes that render under `.site`, so app pages never download them.
export const familjen = Familjen_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-familjen",
  display: "swap",
});

export const onest = Onest({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-onest",
  display: "swap",
});

export const martian = Martian_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-martian",
  display: "swap",
});

export const siteFonts = `${familjen.variable} ${onest.variable} ${martian.variable}`;

export type Face = "familjen" | "onest";
export function faceFrom(v: string | string[] | undefined): Face {
  return v === "onest" ? "onest" : "familjen";
}
