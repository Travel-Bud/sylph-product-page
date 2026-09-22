import { legacyFonts } from "../legacy-fonts";

export default function LegacyFontsLayout({ children }: { children: React.ReactNode }) {
  return <div className={legacyFonts}>{children}</div>;
}
