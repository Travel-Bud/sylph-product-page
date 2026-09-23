# Two sides, round 6 (shared brief)

Landing at `/` (http://localhost:3200/), branch `landing-two-sides`. Ben's notes on round 5:
- **More space between sections, and sections more visually distinct**, so the travelling receipt has room and
  its movement feels natural. It is smoother now, but the page leaves it little room to travel.
- **The character animation did not land.** He was thinking of moving them **in and out of frame**: "some sort
  of awwwards animation thing". The subtle breathing, lean and reaction swaps read as too little.

Binding as before: SHARED-BRIEF, ROUND3-BRIEF (contracts, scroll contract), ROUND4-BRIEF (mobile bar), ROUND5-BRIEF
(sound only on clicks; `scripts/courier-check.mjs` must stay at zero violations).

| Track | Agent | Owns |
|---|---|---|
| Space, distinct sections, courier retune | `courier` | `courier.tsx`, `courier.css`, `src/app/page.tsx`, section-level layout (section padding, grounds, dividers, any new between-section elements) in `chapters.tsx`, `chapters.css`, `sides.css`, `hero.css` |
| Characters in and out of frame | `cast` | `cast.tsx`, `cast.css`, `public/site/characters/` |

The cast track changes how figures enter, hold and leave; the courier track changes the space around them. Each
figure's slot (its box in the chapter grid) stays where chapters put it; cast animates the figure within and
beyond that slot (it may overflow the slot, the section edge or the viewport edge while moving). If you need the
other track to change something, message `main`.

Gates: typecheck, eslint on your paths, the courier harness at 1440, 1280 and 390 with zero violations, real-time
captures you look at (1440, 390, reduced motion), CLS 0, console clean, no horizontal overflow at 390 and 375.
Evidence under `docs/plans/2026-09-22-landing-v2/sides/round6/<track>/`. No build, no dev server, no commits.
