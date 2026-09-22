# Two sides, round 4 (shared brief)

Ben's notes on round 3 (`/v2/sides`), in substance:
- The charge moving between stages is **too fast**: scrolling without expecting it, the flight is over before
  it reads. Slow it down.
- **1.** Source a rich, good-looking sample month with **a lot of bills** and put it in: the "run your own month"
  demo.
- **2.** The scroll-told policy compile: yes, **if it can be a fun graphic**.
- **3.** Sound on tap: yes (off by default).
- **4.** The ten-second clip from the same cast: "what can you cook up".
- **5.** **Optimize for mobile, hard. It is very important.**
- **6.** Accessibility and performance pass: yes.
- **7.** Promote C to `/`: the lead does this after the tracks land.

Binding as before: `SHARED-BRIEF.md` (claims, taste), `ROUND3-BRIEF.md` (ownership, contracts, scroll contract,
quality bar). This file adds round-4 ownership and contracts; where they differ, this file wins.

## Tracks

| Track | Agent | Owns |
|---|---|---|
| Pacing and mobile courier | `courier` | `courier.tsx`, `courier.css`, `public/site/courier/` |
| Policy compile graphic, chapters on mobile | `sides` | `chapters.tsx`, `closing.tsx`, `parts.tsx`, `data.ts`, `chapters.css` |
| Sound, hero and nav on mobile | `stage` | `hero.tsx`, `hero-stage.tsx`, `nav.tsx`, `reveal.tsx`, `scroll.tsx`, `hero.css`, `app/v2/sides/page.tsx`, new `sound.ts` |
| Cast on mobile, image weight | `cast` | `cast.tsx`, `cast.css`, `public/site/characters/` |
| Your month (item 1) | `month` | new `your-month.tsx`, `your-month.css`, `month-data.ts` |
| The clip (item 4) | `clip` | new files under `sylph-product-site/public/site/clip/` and `docs/plans/2026-09-22-landing-v2/clip/`, plus scripts under `sylph-product-site/scripts/clip/` |

## New contracts

1. **Sound** (stage owns `sound.ts`). `import { play } from "./sound"` then `play(name)` where name is one of
   `"tap" | "send" | "land" | "stamp" | "swish" | "approve"`. Synthesized with WebAudio (no audio files), off by
   default, one toggle in the nav, the choice remembered in `localStorage` (wrapped in try/catch), never plays
   under reduced motion unless the visitor turned it on, never before a user gesture. Other tracks call `play()`
   only on the visitor's own actions or the courier landing; stage publishes the module first (a no-op stub is
   fine) so nobody blocks.
2. **Your month section.** `month` exports `YourMonth` from `your-month.tsx` as a `<section id="your-month">`;
   stage mounts it in `page.tsx` right after `<MonthEnd />` and before `<Questions />`, adds a nav link if it
   fits, and may add a quiet "Run a sample month" link in the hero. It carries no courier stop.
3. **Mobile bar** (everyone, for their own area). Targets: 390x844 and 375x667 (`mobile:true`, `scale:2` in
   `shot.mjs`). No horizontal overflow; nothing hover-only (every hover reveal has a tap or focus path); 44px
   touch targets; the first screen of every section carries its point; no text under 14px for body copy;
   characters never crowd the copy; motion stays but gets lighter. Performance: character images sized for the
   phone (`sizes` correct, no desktop-width downloads), no layout shift, JS work off the main thread where it
   can be, nothing that janks on a mid-range phone (animate transform and opacity only, avoid per-frame layout
   reads where a cached value will do).
4. **Pacing.** A flight should read: at an ordinary wheel or trackpad pace, each leg is visible in the air for
   roughly 1.5 to 2.5 seconds, not a blink. If a flight finishes itself when scrolling stops, it does so slowly
   (about a second or more, eased).

## Data rule (item 1)

Never read the shared Supabase database: it is production with live customer data. Sample data may draw on
repo fixtures and seed scripts (merchant names, categories, realistic amounts) but ships as invented sample
data with the "Sample data" chip, and no customer, employee or company names from any real record.

## Gates

As in round 3 for your own paths (typecheck, eslint on your paths, real-time captures that you look at, console
clean, reduced motion), plus the mobile bar above at 390 and 375. Evidence under
`docs/plans/2026-09-22-landing-v2/sides/round4/<track>/`. No `pnpm build`, no dev server (tell `main` if :3200 is
down), no commits.

## Sound module is live (stage, 2026-09-22)

`import { play } from "./sound"; play("tap" | "send" | "land" | "stamp" | "swish" | "approve")`. Real WebAudio,
safe anywhere (no-op on the server, while off, and before the first gesture). Call only from the visitor's own
actions or the courier landing; wheel scroll is not a gesture, so courier sounds start once the visitor has
clicked something. Only the nav calls `setOn`. Two calls within 30ms play once: do not layer. Mapping: courier
landing "land" ("swish" on a paper leg), policy approval "stamp", desk Approve "approve", tab and filter taps "tap".
