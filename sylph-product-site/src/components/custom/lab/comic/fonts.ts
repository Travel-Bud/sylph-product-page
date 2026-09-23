import { Shantell_Sans } from "next/font/google";

/* The lettering face for captions, balloons and sound effects. Shantell Sans is a marker hand with an
   informality axis, so the narration can sit between a letterer's hand and a typeface. The brand faces
   (Familjen Grotesk, Martian Mono) keep the headlines and every product screen. */
export const lettering = Shantell_Sans({
  subsets: ["latin"],
  weight: "variable",
  axes: ["INFM", "BNCE"],
  variable: "--font-lettering",
  display: "swap",
});
