# Mock B, "Two sides, upgraded" (2026-09-25)

Route `/mock/B` (noindex). Code in `src/components/custom/mock/b/`, page in `src/app/mock/B/page.tsx`.
Captures: `mock-b-1440.jpg` (700px steps), `mock-b-390.jpg` (800px steps), `mock-b-1440-reduced.jpg`.

The live page, the version a team could ship next week. Same story, cast, chapter order, panels and words;
the fixes are all in composition, colour and the joins. Colour sits on the ground, never on the cards: Priya's
chapters on her coat blue (the answer on its deep coat ink), Dana's on the sweater lilac, month end on the
deep green, the sample month on the cleared green's tint. Cards stay white, type stays White Air.

## Sections
- **Hero**: untouched but for its two columns taking their people's tints and no bottom padding.
- **Handoffs** (`handoff.tsx`): the five 360px seams become 120 to 176px bands. The next chapter's ground
  sweeps in from its person's edge (Priya left, Dana right; into month end both rise to a hill). The meeting
  line is the live page's dividing line; the step pill sits on it and a mono caption on each ground says what
  just happened and what is waiting. Pure SVG markup, so reduced motion and no script show the same band.
- **Courier** (`courier.tsx`): the Sylph bird carries the Sushi Kanda pill from stop to stop with an amber beam
  behind it that shrinks into it on landing, in the spirit of Mock A. A flight lifts off when its stop reaches
  36% of the viewport and lands when the next reaches 58%, so the charge never leaves the screen, and it passes
  exactly through the band's pill. The beam is the flown path; on the last leg (approved) it turns green. Pure function of scroll; rewinds. The stop inside the policy pin
  lands early in the pin and lifts after it lets go, so the charge waits under the compile while it runs.
- **Receipts**: a street. Headline at 76px across the top, lede right, Priya walks in beside a wide panel.
- **Policy**: a document on ruled lilac. Centred title block, then the compile pinned wide (150svh, from 180)
  with Dana reading at its edge. The compile is the live code; it reads its track from `[data-pin-track]`.
- **Verdicts**: deep coat blue. Cleared, Needs a note, Blocked and In policy as large words in their verdict
  colours; the words are the picker (tablist) and the white card shows the live answer detail.
- **Desk**: "Twenty charges. Five reach Dana." beside a wall of the twenty sample charges (`wall.tsx`) that
  sorts as it scrolls in (scrub 0.3): fifteen green and settle as filed, five lift in amber or oxblood.
  Below, Dana at the desk and the live queue (its small strip hidden; the wall replaces it).
- **Month end**: centred on the deep green, the pair beside the report, "Expenses run on air." as a ghost line.
- **Tail**: sample month on mint; questions on Dana's lilac as numbered cards with a sticky head (finance
  asks); the close splits the page back into the two sides with Priya and Dana at the edges and the offer card
  where they meet; the footer on ink. Plain curved edges join the tail grounds.
- **Nav**: a copy (`nav.tsx`) so the rail runs on `/mock/B`; it takes the ground under it (bone over dark ones).

## Weak or unfinished
- On long legs the beam is nearly a straight diagonal across copy; a route around the panels would read better.
- The desk wall and the sample month are both tiles, and the wall does not follow Dana's Approve and Return.
- The close's figures hide below 1100px; their live choreography (step down through the floor) was tuned for
  the live layout, so in the close they sink as the page ends.
