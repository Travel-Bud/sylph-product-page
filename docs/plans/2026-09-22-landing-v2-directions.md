# Landing V2: three directions (2026-09-22)

Worktree `sylph-product-page-v2`, branch `landing-v2` (local), cut from `landing-v3-personality` with the uncommitted
premium pass committed as its base (`2fdddfa`), so Ben's working tree in `sylph-product-page` is untouched. Dev
server: launch.json `product-page-v2`, port 3200. Ben asked for improvements seen as a V2, "multiple different
directions or additions, whether full direction changes or tweaks deepening the current style".

Each direction is a separate route so the three can be compared side by side. None replaces `/` on a deploy
until Ben picks.

| Route | Direction | Kind |
|---|---|---|
| `/` | **A. Refined**: the current page deepened | tweaks and additions |
| `/v2/ledger` | **B. Ledger**: the month told as a ledger being written and closed | full direction change |
| `/v2/sides` | **C. Two sides**: the person who spent it and the person who closes the books | full direction change |

## What the current page lacks (read 2026-09-22 at 1440)

1. No objection handling. A finance buyer's first questions (do we switch cards, is AI deciding, what does my
   accountant get, where does our data go, what if we have no policy) are answered only by inference.
2. The core outcome, "you see the exceptions, not the pile", is asserted, never shown at scale. The bento shows
   single items.
3. Trust lives in the footer's fine print (encryption, never used to train models).
4. No price signal on the page although `/pricing` publishes $30 per active employee a month.
5. The night roadmap chapter is nearly as tall as the sale (flagged by a reviewer on 09-08).
6. Bug: the compact "Same rules" tile's tick labels collide (`cap $75.00block $120.00`). Fixed in all directions.

## A. Refined (`/`)

Keep every bone of the premium pass. Add:
- **Sorter** (new chapter, white, after the bento): "Twenty charges. Four reach you." A month's sample charges
  (the 20 `ENGINE_ROWS`) run through the rules when the chapter enters view: cleared rows file themselves into
  the report column, exceptions land in "Your queue" with their citation. Counts are counts of the rows shown.
  Replay button. Reduced motion: the sorted end state.
- **Questions finance asks first** (new, band, before the close): six answers, native `<details>`.
- **Trust line** promoted from the footer into the FAQ's lead.
- **Close** gains the price signal as a text link: "From $30 per active employee a month."
- **Night chapter** compacted (smaller visuals, tighter padding).

## B. Ledger (`/v2/ledger`)

The page is the month's ledger. Paper ground, ruled lines, oversized mono dates, rubber-stamp verdicts, a display
serif for headlines against Martian Mono. Scrolling moves through the month: a sticky day rail (Sep 1 to Sep 30)
advances as chapters pass; each chapter is an entry (charge lands, receipt finds it, rule cited, exception to you,
month closed with a CLOSED stamp). Built as its own component tree.

## C. Two sides (`/v2/sides`)

Two people, one charge. The hero splits: the traveller's phone (texts a receipt photo, gets an answer naming the
rule) and the finance desk (only the exception arrives). Chapters alternate sides; they meet at month end.
Warmer, more human, more colour than the current page; "Expenses run on air" earned by nobody opening an app.
Built as its own component tree.

## Shared rules

Voice and claims: `docs/plans/landing-v3/voice.md` (off-limits list binding). No em or en dashes. Sample chips
on every panel with numbers. `QBO_LIVE` governs every QuickBooks line. Reduced motion renders the settled state.
No horizontal overflow at 390; H1 legible at 390.

## Gates

typecheck, lint (no new findings), vitest, build; real-time CDP captures at 1440 and 390 via `scripts/shot.mjs`;
reduced motion; console clean. Evidence under `docs/plans/2026-09-22-landing-v2/`.
