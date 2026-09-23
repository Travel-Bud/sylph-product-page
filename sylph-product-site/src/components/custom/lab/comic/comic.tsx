import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { Mark } from "@/components/custom/site/mark";
import { APP_LOGIN, DEMO } from "@/components/custom/site/anchors";
import { Balloon, Cap, Sfx } from "./bits";
import { Phone, Report } from "./screens";
import { Queue } from "./queue";
import { SoundToggle } from "./sound-toggle";
import { CHARGE } from "./data";

/*
 * "Drawn": the Sushi Kanda charge told as a graphic novel. Nine panels on two grounds: Priya's night
 * in Denver on a night page, a hard cut to the paper of Dana's morning, month end, then the close.
 * The scenes are clay diorama renders (public/lab/comic/), the product appears only as screens
 * inside the story, and the charge itself travels the gutters between panels as a paper ticket.
 * Motion lives in director.tsx; this file is the settled page that reduced motion renders.
 */

type Vars = CSSProperties & Record<`--${string}`, string>;

/** A panel's picture layer. f is the desktop framing (object-position), m the strip's. */
function Scene({ src, alt, f = "50% 50%", m = "50% 50%", sizes, priority }: { src: string; alt: string; f?: string; m?: string; sizes: string; priority?: boolean }) {
  const [fx, fy] = f.split(" ");
  const [mx, my] = m.split(" ");
  return (
    <div className="cx-cam" style={{ "--fx": fx, "--fy": fy, "--mx": mx, "--my": my } as Vars}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} quality={80} />
    </div>
  );
}

type Cam = { cam?: "push" | "pull" | "pan"; scale?: number; origin?: string; originM?: string; pan?: string; panM?: string; start?: string };

function Panel({ className, wipe = "down", label, children, cam, data }: { className: string; wipe?: "down" | "right" | "left" | "up" | "cut" | "none"; label: string; children: ReactNode; cam?: Cam; data?: Record<string, string> }) {
  return (
    <figure
      className={`cx-panel ${className}`}
      aria-label={label}
      data-panel
      data-wipe={wipe}
      data-cam={cam?.cam}
      data-scale={cam?.scale}
      data-origin={cam?.origin}
      data-origin-m={cam?.originM}
      data-pan={cam?.pan}
      data-pan-m={cam?.panM}
      data-start={cam?.start}
      {...data}
    >
      {children}
    </figure>
  );
}

/** The charge, handed on through a gutter. from/to are its path across the gutter (desktop, then strip). */
function Gutter({ state, tone, from, to, mfrom, mto, id }: { state: string; tone: "plain" | "note" | "ok"; from: string; to: string; mfrom: string; mto: string; id?: string }) {
  return (
    <div className="cx-gutter" id={id}>
      <p className={`cx-ticket cx-ticket--${tone}`} data-ticket style={{ "--from": from, "--to": to, "--mfrom": mfrom, "--mto": mto } as Vars}>
        <span className="cx-ticket-m">{CHARGE.merchant}</span>
        <span className="mono cx-ticket-a">{CHARGE.amount}</span>
        <span className="cx-ticket-s">{state}</span>
        <span className="mono cx-ticket-x">Sample</span>
      </p>
    </div>
  );
}

function Nav() {
  return (
    <nav className="cx-nav" aria-label="Main">
      <div className="cx-nav-in">
        <Link href="/" className="cx-brand">
          <Mark className="cx-brand-mark" />
          Sylph
        </Link>
        <div className="cx-nav-r">
          <Link href="/pricing" className="cx-nav-link">
            Pricing
          </Link>
          <a href={APP_LOGIN} className="cx-nav-link">
            Log in
          </a>
          <SoundToggle />
          <Link href={DEMO} className="cx-btn cx-btn--sm">
            Book a demo
          </Link>
        </div>
      </div>
    </nav>
  );
}

export function ComicPage() {
  return (
    <>
      <a href="#story" className="cx-skip">
        Skip to the story
      </a>
      <Nav />

      {/* ---------------------------------------------------------------- night: Priya in Denver */}
      <div className="cx-night">
        <header className="cx-page cx-cover">
          <div className="cx-cover-copy">
            <h1>Nothing to chase at month end.</h1>
            <p className="cx-lede">
              Sylph turns your policy into rules and checks every charge as it happens. Receipts find their own charges. At month end the
              report is already there. You review the exceptions, not the pile.
            </p>
            <div className="cx-ctas">
              <Link href={DEMO} className="cx-btn">
                Book a demo
              </Link>
              <a href="#story" className="cx-textlink">
                Read the story
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M8 3v10M3.5 8.5L8 13l4.5-4.5" />
                </svg>
              </a>
            </div>
          </div>
          <Panel
            className="cx-p-splash"
            wipe="none"
            label="Panel 1: Denver at night"
            cam={{ cam: "push", scale: 1.22, origin: "74% 62%", start: "top top", panM: "18,64" }}
            data={{ "data-hero": "" }}
          >
            <Scene
              src="/lab/comic/street.webp"
              alt="Clay diorama of a dark Denver street at night. Every shop is shuttered except a small sushi restaurant, Sushi Kanda, glowing amber. Priya walks toward it pulling her suitcase."
              f="50% 62%"
              m="64% 50%"
              sizes="(max-width: 760px) 200vw, 1320px"
              priority
            />
            <Cap at="br" slate="Denver, 21:47">
              Priya&rsquo;s site visit ran long. One place on the street is still open.
            </Cap>
          </Panel>
        </header>

        <div className="cx-page" id="story">
          <Gutter state="Charged to her card, 22:30" tone="plain" from="14%" to="58%" mfrom="-50%" mto="50%" />

          <div className="cx-row">
            <Panel className="cx-p-counter" label="Panel 2: Priya at the counter" cam={{ cam: "pan", scale: 1.14, pan: "5,-5", panM: "40,72" }}>
              <Scene
                src="/lab/comic/counter.webp"
                alt="Inside Sushi Kanda, late. The chef wipes the counter while Priya, alone at the counter with her suitcase beside her, photographs her receipt with her phone."
                f="50% 45%"
                m="72% 50%"
                sizes="(max-width: 760px) 200vw, 880px"
              />
              <Cap at="bl" slate="Sushi Kanda, 22:31">
                Omakase, tea, the last seat at the counter. The receipt never makes it to her pocket.
              </Cap>
              <Balloon who="The chef" tail="bl" style={{ "--l": "29%", "--t": "5%", "--ml": "4%", "--mt": "9%" } as Vars}>
                No rush. The counter&rsquo;s yours.
              </Balloon>
              <Sfx style={{ left: "73%", top: "14%", rotate: "-10deg" }}>click</Sfx>
            </Panel>

            <Panel className="cx-p-phone" wipe="up" label="Panel 3: the answer on Priya's phone" data={{ "data-phone-panel": "" }}>
              <div className="cx-phone-bg" aria-hidden="true">
                <Scene src="/lab/comic/counter.webp" alt="" f="70% 34%" m="70% 34%" sizes="(max-width: 760px) 100vw, 440px" />
              </div>
              <Phone />
              <Sfx late="bzzt" style={{ left: "5%", top: "2.5%", rotate: "-8deg" }}>
                bzzt
              </Sfx>
              <Cap at="bc">The answer names the rule, the cap and the amount.</Cap>
            </Panel>
          </div>

          <p className="cx-footnote">
            <sup>*</sup>M-041 is a line of her company&rsquo;s policy, compiled into a rule that a person approved. No model makes the call:
            same charge, same answer, every time.
          </p>

          <Gutter state="Matched. Needs a note." tone="note" from="70%" to="36%" mfrom="150%" mto="50%" />

          <div className="cx-row">
            <Panel className="cx-p-cab" wipe="right" label="Panel 4: Priya in the back of a cab" cam={{ cam: "pan", scale: 1.14, pan: "-5,5", panM: "30,52" }} data={{ "data-cab": "" }}>
              <Scene
                src="/lab/comic/cab.webp"
                alt="Cutaway of a yellow taxi at night. Priya sits in the back seat beside her suitcase, typing on her phone; the driver in a flat cap faces the road; Denver's lights blur past."
                f="50% 58%"
                m="36% 55%"
                sizes="(max-width: 760px) 200vw, 1320px"
              />
              <Cap at="bl" slate="22:58">
                One line from the cab. That is her whole part of the paperwork.
              </Cap>
              <div className="cx-textnote" data-note>
                <p className="cx-textnote-b">
                  <span className="cx-vh">Priya&rsquo;s note: </span>
                  {CHARGE.note}
                </p>
                <p className="cx-textnote-s" data-note-sent>
                  Sent to Dana with your note.
                </p>
              </div>
            </Panel>
          </div>

          <Gutter state="Note attached. On Dana's queue." tone="note" from="30%" to="66%" mfrom="-50%" mto="50%" />
        </div>
      </div>

      {/* ---------------------------------------------------------------- the cut: next morning */}
      <div className="cx-day">
        <div className="cx-page">
          <p className="cx-cut" data-cut>
            <span className="cx-cut-l">Next morning.</span>
            <span className="mono cx-cut-s">Finance, 09:02</span>
          </p>

          <div className="cx-row">
            <Panel className="cx-p-desk" wipe="cut" label="Panel 5: Dana at his desk" cam={{ cam: "push", scale: 1.3, origin: "46% 52%", panM: "64,46" }}>
              <Scene
                src="/lab/comic/desk.webp"
                alt="Clay diorama of a bright small office in the morning. Dana, in a lilac sweater and round glasses, sits at a pale wood desk with his laptop and a steaming mug of coffee."
                f="50% 50%"
                m="46% 50%"
                sizes="(max-width: 760px) 200vw, 1320px"
              />
              <Cap at="tl" slate="09:02">
                Dana closes the books. Coffee first, then the queue.
              </Cap>
            </Panel>
          </div>

          <div className="cx-row cx-row--queue">
            <Panel className="cx-p-queue" wipe="right" label="Panel 6: Dana's queue">
              <Queue />
              <Cap at="bc">The week filed itself. One exception waits, with her note and the rule beside it.</Cap>
            </Panel>

            <Panel className="cx-p-react" wipe="cut" label="Panel 7: Dana, coffee in hand" data={{ "data-react": "" }}>
              <div className="cx-react-cam">
                <Scene src="/lab/comic/desk.webp" alt="Close on Dana smiling over his coffee mug." f="63% 34%" m="63% 34%" sizes="(max-width: 760px) 300vw, 1300px" />
              </div>
              <Balloon who="Dana" tail="br" style={{ "--l": "8%", "--t": "7%" } as Vars}>
                That&rsquo;s the whole queue?
              </Balloon>
              <Cap at="bc">Approved before the coffee cooled.</Cap>
            </Panel>
          </div>

          <Gutter state="Approved by Dana" tone="ok" from="22%" to="64%" mfrom="150%" mto="50%" />

          <div className="cx-row">
            <Panel className="cx-p-month" wipe="down" label="Panel 8: month end" cam={{ cam: "pull", scale: 1.7, origin: "72% 36%", originM: "74% 34%" }}>
              <Scene
                src="/lab/comic/month-end.webp"
                alt="Late golden light on the last day of the month. The wall calendar shows September 30 circled and the clock reads half past five. Dana, coat on and bag on his shoulder, switches off his desk lamp; one report folder sits on the desk."
                f="50% 50%"
                m="62% 50%"
                sizes="(max-width: 760px) 200vw, 780px"
              />
              <Cap at="tl" slate="Sep 30, 17:30">
                Month end. The report is already there.
              </Cap>
              <Cap at="br">Dana leaves on time. He could get used to this.</Cap>
            </Panel>

            <Panel className="cx-p-report" wipe="left" label="Panel 9: the report">
              <Report />
              <Cap at="bc">Every line cites its rule, ready to export.</Cap>
            </Panel>
          </div>
        </div>

        {/* ---------------------------------------------------------------- the close */}
        <section className="cx-page cx-close" aria-labelledby="cx-close-h">
          <div className="cx-row">
            <Panel className="cx-p-end" wipe="cut" label="The end">
              <p className="cx-end-l">
                The end.
                <span>of the month</span>
              </p>
              <Image className="cx-end-cast" src="/site/characters/together.webp" alt="Priya, waving, and Dana, holding the report, take a bow." width={912} height={960} sizes="(max-width: 760px) 80vw, 420px" />
            </Panel>
            <div className="cx-sale">
              <h2 id="cx-close-h">Your policy does the chasing.</h2>
              <p>
                Sylph reads your travel and expense policy and drafts the rules. A person approves them. From then on every charge on the cards and
                banks you already use is checked against the same rules, and every verdict names the rule, the threshold and the amount.
              </p>
              <p className="cx-price">
                <span className="mono">$30</span> per active employee a month.
              </p>
              <div className="cx-ctas">
                <Link href={DEMO} className="cx-btn cx-btn--ink">
                  Book a demo
                </Link>
                <Link href="/pricing" className="cx-textlink cx-textlink--ink">
                  See pricing
                </Link>
              </div>
              <p className="cx-fine">Policies and receipts are encrypted in transit and at rest and never used to train models.</p>
            </div>
          </div>
        </section>

        <footer className="cx-page cx-foot">
          <span className="cx-brand cx-brand--ink">
            <Mark className="cx-brand-mark" />
            Sylph
          </span>
          <span className="cx-foot-note">A sample story. Priya, Dana, Sushi Kanda and every amount on this page are invented.</span>
          <span className="cx-foot-links">
            <Link href="/pricing">Pricing</Link>
            <a href={APP_LOGIN}>Log in</a>
            <a href="/privacy">Privacy</a>
            <Link href="/terms">Terms</Link>
          </span>
        </footer>
      </div>
    </>
  );
}
