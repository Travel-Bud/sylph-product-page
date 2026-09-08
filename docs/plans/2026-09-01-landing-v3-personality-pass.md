# Landing v3 personality pass — spec (2026-09-01, late evening)

Branch `landing-v3-lab`, worktree `application-v2/sylph-app-lab` (off staging, which already carries `/fresh`).
Follows the direction board (`2026-09-01-landing-v3-direction-board.md`) and Ben's answers to it.

**Intent.** `/fresh` keeps its bones (white product-forward page, the interactive bento, the night roadmap, the mint
close) and gains a personality: the Air prototype's motion ported in, a wind motif that gives the page depth, an
outcome-first voice, a typeface nobody else is using, and bento tiles whose expand feels like the thing the tile is
about. The reference is instalily.ai: chapters that alternate ground, one visual per chapter that carries the story,
copy measured out by the word. Sylph's version of that stays fintech-calm: motion is caused (by load, by scroll, by a
click), never ambient, and everything that moves lands.

## Ben's answers (2026-09-01, 20:45)

1. Base bento stays; port from Air: the air-trio loop as the hero centrepiece with the enforcement ticker as the
   landing strip under it, drift-then-land on objects and verdict chips, the receipt clip in the receipts tile, the
   terminal card-tap clip in the in-build chapter. Add wind motifs: things blowing past in the background for depth,
   or something tumbling along with the visitor (the river idea from the old landing).
2. Type: nothing overused. Open, decided by a type board.
3. Video: yes.
4. Voice: outcome first. Month end is handled, nothing to chase.
5. Reference: instalily.ai. Transporting transitions, one eye-grabbing visual per section, no word fluff, sections that
   differ from each other.
6. Bento: each tile more responsive and expressive; the expand should feel like the subject (a receipt unrolling, a
   plane taking off and leaving something behind).

## On depth and B2B (the question Ben asked)

Depth fits this product when it is the product's own story: paper carried by air and landing where it belongs is
literally what Sylph does to receipts. It stops fitting when it is weather, so three rules: motion is scrubbed by scroll
or triggered once on entry, never a perpetual ambient loop; every object that crosses the page lands somewhere that
means something; nothing crosses more than once per chapter. The buyer is a controller. The page should feel like a
very well-run room with a window open, not a snow globe.

**The wind motif, concretely: one receipt's journey.** A single receipt object rides with the visitor. It is the one
tumbling in the hero clip; on the first scroll it lifts out of the hero (a fixed-position sprite scrubbed by
ScrollTrigger), drifts across the seam into the bento band, slows and lands in the receipts tile as that tile's
receipt, and at the close settles onto the report page beside the approval stamp. Two or three background pieces
(boarding pass, envelope) cross once each in the hero and the roadmap chapter at a slower rate for parallax, and
stop. Under reduced motion and below 1024px the receipt simply sits in each place; no fixed sprite.

## Type

Candidates on the type board `/fresh/lab/type`, each rendered as the real hero plus two real bento tiles with the
outcome-first copy, so the choice is made by looking. Shortlist: Schibsted Grotesk, Familjen Grotesk, Funnel Display
with Funnel Sans, Bricolage Grotesque, Onest; evidence face: Fragment Mono, Martian Mono or Azeret Mono. All on
Google Fonts (no licensing friction; loaded through next/font once chosen). Off the table because they are now the
AI default set: Inter, Space Grotesk, Instrument Sans and Serif, IBM Plex, Geist, DM Sans, Manrope, Satoshi, Söhne
lookalikes. Ben picks; the pick is one token swap in `fonts.ts` and the `--sans` / `--mono` variables.

## Voice

Headline default: "Nothing to chase at month end." Lede: "Sylph turns your policy into rules and checks every charge
as it happens. Receipts find their own charges. At month end the report is already there. You review the
exceptions, not the pile." Alternates and the section-head register in `landing-v3/voice.md`. Every tile label and
chapter head is rewritten in this register, and every chapter gets a label plus at most one sentence; the visual
carries the rest (instalily rule). Claim guardrails unchanged.

## Chapters (instalily rhythm: alternate ground, one visual each)

1. **Hero, white.** Outcome-first headline; the air-trio loop in a studio window; two objects drift in and float; the
   ticker becomes a three-row landing strip whose chips land. The receipt lifts out on the first scroll.
2. **Bento, band.** Same eight tiles, each with an idle "tell" (a hairline drawing, a chip landing, a route arc) and a
   subject-shaped expand: receipts unroll from the top edge like paper; booking's expand is the plane leaving the
   arc behind it; policy's expand turns a page (the policy-fan clip as the tile's visual); verdict's expand is a stamp;
   the report prints down. Flip stays the mechanism, the choreography changes per tile.
3. **How it runs, white.** New, small: policy → rules → verdict as one drawn line (SVG, scrubbed), three labels, no
   paragraphs. This is the instalily "technical drawing" beat and the only place the compile idea is shown.
4. **In build, night.** The terminal card-tap clip, labelled in build; the receipt-that-writes-itself timeline stays.
5. **Close, mint.** The receipt lands on the report beside the stamp; bird watermark; two buttons.

## Gates

`tsc --noEmit`, eslint, `pnpm build` green; console clean at 1440, 1024, 390; zero horizontal overflow; reduced motion
a complete still with every clip on its poster; wheel-scroll frame probe with no frame over 17 ms at 1440 including
the scrubbed receipt; copy audit against the guardrails and a dash sweep; the `/fresh/demo` and `/fresh/pricing`
chrome unchanged. Evidence under `docs/plans/landing-v3/personality-pass/`.

## Budget

Full-resolution regeneration of the four clips once prompts are final: about $5. New clips if a chapter needs one
(policy-fan already exists; a "receipt lands on the report" clip is a candidate): about $2.50. No new objects planned.

## Sequence

1. Type board, Ben picks. 2. Voice pass on `/fresh` copy. 3. Hero port (clip, objects, landing strip). 4. Receipt
journey sprite. 5. Bento tells and per-tile expands. 6. How-it-runs line. 7. Night and close. 8. Gates, evidence,
commit per step, PR into staging when Ben signs off.

**Status (2026-09-01, late night):** 1 to 7 done and pushed (commits e2663008, 45bb1f6b, 05b031a4); Ben chose
Familjen with Onest as an A/B rather than one face, so both ship behind `?face`. Bird pass and Janus footer nod added
on his later notes. Evidence: `landing-v3/personality-pass/README.md`. Left: the production build gate, Ben's
review of the A/B and the swing, then the PR.

## Not in scope

Promoting `/fresh` to `/`. WebGL. New object renders. Any claim change. Pricing and demo pages beyond chrome.
