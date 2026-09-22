import { Libre_Caslon_Display, Libre_Caslon_Text } from "next/font/google";
import { martian } from "@/components/custom/site/fonts";

// Direction B, Ledger. Caslon is the bookkeeper's face: Display for the headlines,
// Text for the running copy. Martian Mono stays the evidence face, shared with the site.
const caslonDisplay = Libre_Caslon_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-lg-display",
  display: "swap",
});

const caslonText = Libre_Caslon_Text({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-lg-text",
  display: "swap",
});

export const ledgerFonts = `${caslonDisplay.variable} ${caslonText.variable} ${martian.variable}`;
