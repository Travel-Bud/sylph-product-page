import { Newsreader, Hanken_Grotesk } from "next/font/google";

// The marketing surface's voice — loaded ONLY by routes that render under
// .sylph-lp (/, /demo, /pricing) via the variable classes on their <main>,
// so neither font ships to app pages (which stay on Satoshi).
//
// Newsreader: the calm editorial serif that carries the display sizes.
// Hanken Grotesk: the working grotesque for body and UI.
export const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

export const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

export const landingFonts = `${newsreader.variable} ${hanken.variable}`;
