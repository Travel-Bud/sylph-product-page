import type { Metadata } from "next";
import { siteFonts } from "@/components/custom/site/fonts";
import "@/components/custom/v2-sides/sides.css";
import "@/components/custom/v2-sides/sound-audition.css";
import { SidesNav } from "@/components/custom/v2-sides/nav";
import { SoundAudition } from "@/components/custom/v2-sides/sound-audition";

/* Internal: Ben's by-ear pick of the landing's sounds (round 5b). Not linked from the site. */
export const metadata: Metadata = {
  title: "Sylph sound audition",
  robots: { index: false, follow: false },
};

export default function SoundsPage() {
  return (
    <main className={`v2s ${siteFonts}`} id="main">
      <a href="#sounds-t" className="v2s-skip">
        Skip to content
      </a>
      <SidesNav />
      <section className="v2a-head" aria-labelledby="sounds-t">
        <div className="v2s-wrap">
          <h1 id="sounds-t" className="v2s-h2" tabIndex={-1}>
            Choose the landing&rsquo;s sounds by ear.
          </h1>
          <p className="v2s-lede">
            Six slots, each with the measured shortlist from two CC0 libraries and the round 5 ElevenLabs sound for
            comparison. Play them here, then pick one per slot; the landing uses your picks straight away.
          </p>
        </div>
      </section>
      <div className="v2s-wrap">
        <SoundAudition />
      </div>
    </main>
  );
}
