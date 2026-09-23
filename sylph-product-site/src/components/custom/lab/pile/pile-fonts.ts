import { Newsreader } from "next/font/google";

/* The pile reads as an article: Newsreader (a text serif with optical sizes) carries the prose, while
   Familjen Grotesk and Martian Mono (siteFonts) keep the headlines and the data. Loaded by this route only. */
export const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-news",
  display: "swap",
});
