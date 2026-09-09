import type { Metadata } from "next";
import "@/components/custom/site/site.css";
import "@/components/custom/site/lab/type/type.css";
import { siteFonts } from "@/components/custom/site/fonts";
import { SiteNav } from "@/components/custom/site";
import { GOOGLE_CSS, MONO, SANS } from "@/components/custom/site/lab/type/faces";
import { Specimen } from "@/components/custom/site/lab/type/specimen";

export const metadata: Metadata = {
  title: "Sylph lab: type board",
  description: "Typeface candidates on the real hero. Not the live page.",
  robots: { index: false, follow: false },
};

/* Each sans candidate is paired with a mono so every specimen is a complete page voice.
   Order: current pair first for reference, then the five candidates. */
const PAIRS: [string, string][] = [
  ["base", "plex"],
  ["schibsted", "fragment"],
  ["familjen", "martian"],
  ["funnel", "fragment"],
  ["bricolage", "azeret"],
  ["onest", "martian"],
];

export default function TypeBoardPage() {
  return (
    <main className={`site lab-type ${siteFonts}`} id="main">
      <link rel="stylesheet" href={GOOGLE_CSS} />
      <SiteNav />
      <section className="type-lead">
        <div className="wrap">
          <p className="eyebrow">Type board</p>
          <h1 className="h1 h1-sm">Six voices for the same hero.</h1>
          <p className="lede">
            The current pair first, then five candidates that are not the generated-page default set. Each one is the
            real hero and two real panels, so judge the whole page voice, not a sample string. Mono pairings are a
            starting point and can be swapped independently.
          </p>
          <nav className="type-toc" aria-label="Candidates">
            {PAIRS.map(([s], i) => {
              const face = SANS.find((f) => f.id === s)!;
              return (
                <a key={s} href={`#${s}`}>
                  {String(i + 1).padStart(2, "0")} {face.name}
                </a>
              );
            })}
          </nav>
        </div>
      </section>
      {PAIRS.map(([s, m], i) => (
        <Specimen key={s} sans={SANS.find((f) => f.id === s)!} mono={MONO.find((f) => f.id === m)!} index={i + 1} />
      ))}
    </main>
  );
}
