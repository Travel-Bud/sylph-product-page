import { Instrument_Sans } from "next/font/google";

// The marketing surface's one family (display and body). Loaded only by the
// routes that render under `.site` (/, /demo, /pricing), so app pages never
// download it. IBM Plex Mono comes from the root layout (`--font-ibm-plex-mono`).
export const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

export const siteFonts = instrument.variable;
