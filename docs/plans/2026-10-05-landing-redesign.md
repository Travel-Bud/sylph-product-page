# Landing redesign (2026-10-05)

Brief: `.design/BRIEF.md` (local, git-ignored). Frames and Ben's pick: `.design/frames/` (A, B, C).
Ben's direction (via janus-0e, 2026-10-05): C's hero, A's night "how it works", C's live policy, Book a demo stays
on Calendly (`DEMO`), "One hotel stay, told two ways" dropped. Product screens must match the current app
(application-v2, read only) and the fresh captures in `.design/product-current/`.

## Page, in order

| # | Section | Content | Interaction |
|---|---|---|---|
| 1 | Nav | Bird + Sylph; How it works, Features, Pricing; Log in (`APP_LOGIN`); Book a demo (`DEMO`) | Turns solid on scroll |
| 2 | Hero (C) | Night still full bleed, centred "The expense policy that enforces itself.", lede, two CTAs; the current app's admin screen rises out of the clouds onto paper | Slow drift on the still (off under reduced motion) |
| 3 | Problem | One contrast: today checked after the money is spent, by a person, line by line; with Sylph checked the moment money moves, with the reason. Labels of ten words or fewer, no timelines. Ben picked P1, the two film stills (frames P1 to P3 in `.design/frames/problem-options-*.png`) | None needed |
| 4 | How it works (A) | Night section, four isometric vignettes: bring your policy, approve the rules, every charge checked, finance sees exceptions | Static drawings |
| 5 | Features bento | Seven tiles sized by importance (below) | One mechanic per tile |
| 6 | Try it (C) | Editable plain-English policy (four limits) and this week's charges re-checked live | Typed inputs, steppers |
| 7 | FAQ | Seven questions from finance | `<details>` |
| 8 | Close | Try it on last month's statement; Book a demo, Pricing; per-employee prices | |
| 9 | Footer | Links, sample-data note, trust line | |

## Bento tiles

Every tile does its job rather than describing it, reads in under three seconds, shows an idle hint, has a tap
equivalent, and renders its settled end state under reduced motion or without script.

| Tile | Size (12 col) | Mechanic | Phone |
|---|---|---|---|
| A flagged charge reveals its rule | 7 x 2 rows | Hover a flagged row: it opens to the rule, threshold, amount and policy line | Tap a row |
| A receipt snaps to its charge | 5 x 2 rows | Drag the receipt photo; it snaps to the matching card charge | Tap the receipt |
| Book a trip in a sentence | 6 | Click the field: the sentence types itself, results come back marked in or out of policy | Tap |
| A report assembles itself | 6 | Scroll-scrub: matched lines fly into the month's report and the total adds up | Scroll |
| Change a limit | 4 | Drag the dinner cap; the charge flips between Needs a note and Cleared | Drag or steppers |
| Cards connect | 4 | Click Connect: the company's cards and bank feed link up and sync | Tap |
| Setup in about an hour | 4 | Click through three steps; the clock runs to about an hour | Tap |

## System

Hanken Grotesk (display and text) and IBM Plex Mono (labels, amounts) through `next/font/google`. Tokens: paper
`#F3F2ED`, ink `#101B16`, night `#0A1410`, pine `#0A7C53` (on light), aurora `#2EDE97` (on dark); product UI uses
the app's own tokens. Plain CSS in `landing.css` under one root class (`lp`); no Lenis, no GSAP on this page:
small hooks for reveal and scroll progress, so phones stay fast. Images through `next/image`.

## Files

`src/components/custom/landing/`: `landing.tsx` (composition), section components, `bento/` tiles, `app-ui/`
(recreated product screens), `iso.tsx` (generated drawings), `landing.css`, `fonts.ts`. `src/app/page.tsx` renders it.
Film stills in `public/site/film/`.

## Truth

No customer logos, testimonials, user counts, savings figures or partnerships; no AI chat. Setup is only "took us
about an hour for a 10-person company". Product screens carry sample data, said once in the footer. Cards are
shown without network or bank brands.

## Gates

Screens at 1440 and 390 compared against the references as sections land; reduced motion checked;
`node scripts/explore-check.mjs` for console errors and overflow. Halfway stop after the bento: screenshots at both
widths and a short recording of the bento interactions to janus-0e. Then try it, FAQ and close; `ai-slop-check`;
typecheck, lint, test and build; commit on `redesign/landing-refs`, no push.

## Outcome (2026-10-06)

Built as above; the old Mock B landing (`mock/b`) and the parts only it used (`site/obj`, `site/panels`, `site/verdicts`,
`site/site.css`, `v2-sides/chapters.css`, `v2-sides/reveal`, `v2-sides/scroll`, `public/site/objects`) are removed.
Product screens follow application-v2's tokens and nav and the 2026-10-05 captures, with fictional data.

`lenis` went with it (no other user; `@gsap/react` stays, `site/motion.ts` still needs it). Follow-ups: the social card (`opengraph-image.jpg`) still shows the old clip poster; `/pricing` and `/demo`
keep the old faces and the Two sides styling; unused character figures remain in `v2-sides/cast.tsx`.
