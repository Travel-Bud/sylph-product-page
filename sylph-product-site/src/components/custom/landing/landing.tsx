import { landingFonts } from "./fonts";
import "./app-ui/app-ui.css";
import "./landing.css";
import { Nav } from "./nav";
import { Hero } from "./hero";
import { Problem } from "./problem";
import { How } from "./how";
import { Bento } from "./bento/bento";
import { TryIt } from "./try-it";
import { Faq } from "./faq";
import { Close } from "./close";
import { Footer } from "./footer";
import { Reveal } from "./reveal";
import { Panels } from "./panels";
import { Settle } from "./settle";

/* The landing at / (2026-10-05 redesign, Ben's mix of the frames: C's hero, A's night section, C's live policy, plus
   the problem contrast and the features bento). Plan: docs/plans/2026-10-05-landing-redesign.md. Rendered by
   src/app/page.tsx, which passes the site metadata's JSON-LD as children. */
export function Landing({ children }: { children?: React.ReactNode }) {
  return (
    <main className={`lp ${landingFonts}`} id="main">
      <a href="#how" className="lp-skip">
        Skip to content
      </a>
      <Reveal />
      <Panels />
      <Settle />
      <Nav />
      <Hero />
      <Problem />
      <How />
      <Bento />
      <TryIt />
      <Faq />
      <div className="lp-panel lp-end" data-panel data-settle>
        <Close />
        <Footer />
      </div>
      {children}
    </main>
  );
}
