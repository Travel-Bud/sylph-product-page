# Landing premium pass (design, 2026-09-08, evening)

Branch `landing-v3-personality`, working tree only until Ben reviews. Ben asked for the page spiced up: more
premium, more personality. This pass keeps every bone of the 09-08 close-the-books build (hero, receipt journey,
bento and its choreography, Start, How line, night roadmap, mint close) and adds one chapter and one layer of
material. Remove the appended CSS block and the new chapter and the page is the 09-08 build again.

## Design read

Preserve-mode redesign of a B2B landing for whoever closes the month at a ten-to-few-hundred-person company.
Language stays "structured air": white, ink, one green, Familjen Grotesk with Martian Mono as the evidence face.
Dials: variance 7 (was 5), motion 7 (was 6), density 3 (was 4). Personality comes from Ben's own beliefs stated
out loud, not from decoration. Premium comes from breath, scale and material, not from gradients.

## What changes

1. **Breath.** Section rhythm steps up (`--sec-y` 76 to 136px, was 60 to 96). Display type a size up: H1 to 78px at
   1440, H2 to 54px, both tighter. The hero grid goes 11/11 so the bigger H1 still holds two lines.
2. **Material.** A paper grain over the whole surface (one fixed layer, 5.5% opacity, no blend mode). Tiles get a
   top light on the tinted hues, an inner hairline, and a lift on hover. The primary button lifts a pixel with a
   tinted shadow.
3. **New chapter "Held", deep green, after the bento.** Head "What we hold to." Four beliefs from `voice.md`, set
   at display size, each with one support sentence in the right column and one drawn stroke under its key phrase
   that lands once the row is in view (LoopGate, `[data-once]`; settled state is the CSS default). Grounds now run
   white, band, deep green, white, band, night, mint. Placed after the bento so the receipt journey does not
   cross it. The nav takes its night theme over it.
   - Month end is **too late** to find out. / Every charge is checked as it happens, not after the money is gone.
     A verdict at month end is an autopsy.
   - A verdict that cannot **cite its rule** is an opinion. / Every decision names the rule, the threshold and the
     amount. The audit trail is built as it happens, not reconstructed at month end.
   - AI drafts. A person approves. The check **never guesses**. / Sylph compiles your policy into rules once. No
     model sits in the decision, so the same charge gets the same answer every time.
   - The card stays. **The chaos goes.** / Sylph works on the cards and banks you already have. Nothing to switch,
     no new card to issue.
4. **Start as one surface.** The two cards become one bordered panel with a hairline between the two ways in, so
   Start no longer shares a layout family with the night roadmap's two cards.
5. **Close at poster scale.** "See your month close." to 72px, the bird larger and drifting in on scroll, a soft
   light on the mint ground, more padding.
6. **Footer.** "Expenses run on air." set large (to 38px) under the brand, more top padding.

Copy untouched everywhere else. No new claims: every belief line is a belief, and the two product facts in the
support lines (checked as it happens, same answer every time) are already stated in the bento.

## Gates

typecheck, lint (no new findings), vitest, build; screenshots at 1440 and 390; reduced motion complete (strokes
drawn, no grain motion, no lift); console clean; zero horizontal overflow; the H1 holds two lines at 390, 1024,
1280 and 1440; dash sweep. Evidence under `docs/plans/2026-09-08-premium-pass/`.

## Status (2026-09-08, evening, after the build)

Built on `landing-v3-personality`, uncommitted, for Ben's review. Files: `site/held.tsx` (new), `site/index.ts`,
`app/page.tsx`, and one appended block at the end of `site/site.css` (about 310 lines); nothing else touched.
Gates: typecheck 0; lint at the 11 pre-existing findings in the v5 `landing/` tree, none in `site/`; vitest 6/6;
build 0 with `/` static; SSR and client ids match after a clean load (the one hydration warning seen mid-session
was a stale hot-reload, reproduced away); no horizontal overflow at 375, 1024, 1280 or 1440; the H1 holds two
lines at 375, 1024, 1280 and 1440 (72.7px at 1440); reduced motion renders the Held strokes drawn and no lift;
tile open and close through the Flip still work; dash sweep clean. Evidence: `2026-09-08-premium-pass/*.jpg`.

Open, Ben's call: the grain (5.5%, one fixed layer) is easy to drop if it reads as noise on a retina display;
the Held chapter's height (four rows, about 1,100px at 1440) versus three; whether Held should take a nav link.

## Round 2 (2026-09-09): the bird, the orbs, more character

Ben's notes on round 1: the bird's fly-past was poor (it flew in and vanished), the glow orbs must go, and the
page could carry a little more character.

**The Sylph is now a character with three appearances, and each one does something.**

1. **Hero: it arrives.** `site/hero-bird.tsx` (GSAP MotionPath and DrawSVG). On load the bird comes in from beyond
   the top-right of the stage, glides left across the clip with a thin wake behind it, turns, flares up and settles
   on the top edge of the month-end window, just left of the sample-data chip. It banks with the route
   (`autoRotate`, the glyph's beak leads), grows as it nears (scale 0.55 to 1), lands with one small bounce, and
   only then do the three verdicts land under it: the strip is `[data-manual]`, LoopGate leaves it alone, and the
   bird adds `is-in` at touchdown (chips on a shorter fuse, 140ms plus 420ms per row). The wake retracts toward
   the bird and fades. The route is measured just before take-off and the perch re-seated on resize and once the
   web fonts are in. Flight only under no-preference at 1025px and up; otherwise the bird is simply perched and the
   verdicts land when the strip scrolls in, as before. The old `bird-pass` keyframes are deleted.
2. **How it runs: it rides the line.** `site/how-line.tsx`: the bird sits at the tip of the drawn line and rides it
   from the policy sentence to the verdict as the visitor scrolls, turned to the line's tangent, driven by the
   scrubbed tween's own progress so it never leads the stroke. Under reduced motion it waits at the verdict. Below
   760px the line is a vertical list, so there is no rider.
3. **Close: it settles.** Unchanged from round 1 (the large mark drifts in on scroll).
4. **Nav: it hops.** One 0.6s hop of the brand mark under the pointer, no-preference only.

**The orbs are gone.** The three blurred colour blobs behind the hero stage (`.hero-field::before`) are off; the
dotted ground stays. The deep-green chapter lost its radial washes for a flat ground with a faint top-to-bottom
darkening, and the close is flat mint again. The night chapter's horizon glow is Ben's and untouched; say the word
and it goes the same way.

**Verification.** Frame-driven motion cannot be judged from the Browser pane (it does not paint while hidden and
GSAP's ticker sleeps on a hidden tab) or from headless virtual time (frames and transitions drift). Added
`sylph-product-site/scripts/shot.mjs`: a dependency-free Node script that drives headless Chrome over the DevTools
Protocol in real time, captures JPEG frames at chosen milliseconds after load, can scroll or evaluate before a shot,
emulate a phone or reduced motion, and prints a probe. Usage:
`node scripts/shot.mjs '{"url":"http://localhost:3100/","w":1440,"h":900,"shots":[{"t":1900,"file":"f.jpg"}]}'`.
Evidence: `2026-09-08-premium-pass/bird-*.jpg` (two mid-flight frames, the landing with the first verdict, the perch,
reduced motion, the phone perch, the how-line rider). Gates: typecheck 0, vitest 6/6, build 0, lint unchanged;
the probes confirm the perch left of the chip at 1440 and 390, `is-in` on the strip after touchdown, and the rider
`display: none` at 390.
