# Mock D, "The month, sorted" (/mock/D)

**Idea.** The outcome at the scale a finance lead lives with: "you review the exceptions, not the pile". The first
screen is the whole sample month (98 charges, six people) as a heap of paper slips. Scrolling sorts it, one stage per
colour ground, until the 13 slips Dana actually reads are left, then the close.

**Numbers.** Every count, name and amount in the copy is computed in `mock/d/data.ts` from `v2-sides/month-data.ts`
run through a verbatim copy of the live page's `runRules` (it is not exported from `your-month.tsx`, so it is copied,
not imported; if the live rules change, recopy it). Default rules give: 98 charges, 78 with receipts, 34 foreign,
2 same-day duplicates, 4 dinner, 2 hotel, 3 alcohol (Blocked), 2 missing-receipt, so 13 exceptions and 85 cleared
($11,226.40). The retired /lab/pile said 14; the current data gives 13.

**Sections and grounds.** Pile (apricot), receipts arrive (sky), currency (mint), duplicates (rose), four rules
(marigold), filed (leaf), Dana's short list (aubergine), close (apricot again, the desk now clear). Each section's
own gradient runs into the next ground, so there are no bands; the slips float over the joins.

**The pile engine** (`pile.tsx`). One sticky scene inside an absolutely positioned track that spans the sorting
column, so it leaves with the column's end (no negative-margin sticky). Each beat is a full layout of all 98 slips
(pile, person lanes, currency lifted and flipped, duplicate pairs clipped, a ruler band per rule, the folder).
Scroll position picks a point between two layouts, each slip starts on its own stagger, and a hand-written
under-damped spring per slip (position, turn, scale, flip) chases the target: slips overshoot, settle, lift their
shadow while moving. Receipts are separate slips of paper that arc from Text, Email and Upload to their charge and
then ride it. Each rule draws a dashed threshold line top to bottom with a hatched "over" zone; slips over the line
spread across the zone with an index tab naming the rule, then go to Dana's tray, whose counter climbs to 13. On
load the pile is tossed onto the desk from above; the pile shies away from a mouse. The loop sleeps when at rest.

**Copy on the phone.** Each stage card is sticky at the foot of its own 100svh block (well under 150svh) while the pile
sorts in the top 60%; a card that has had its turn fades as it rises into the pile, and the hero steps back as the
lanes form. On desktop the copy is a plain left column and the pile sits right.

**Dana and close.** The 13 exceptions are real DOM cards (person, date, merchant, amount with original currency,
verdict chip, the rule's own citation), dealt onto the table on a hand-tuned CSS `linear()` spring. Close reuses the
live page's close copy, with the Priya and Dana clay render.

**Reduced motion and no script.** Reduced motion keeps every layout but snaps them (no springs, toss, nudge or deal).
Without script the pile is placed by CSS from the same seeded positions and the list is static.

**Choices.** Native scroll, no Lenis: the springs already smooth the scene, and double smoothing felt laggy on paper.
No GSAP and no generated art. Which door a receipt came through is not in the month data, so it is assigned for show.

**Weak or unfinished.**
- In the lanes the slips overlap heavily (Priya has 22 on one row); they read as texture, not as records.
- Phone slips are too small to read; the readable version is the list at the end.
- The rules stage is four beats on one marigold ground; it could step its tint per rule.
- The phone hero fades early if someone stops to read the people row mid-scroll.
- The scene is technically sticky for the whole sorting column (about 7 screens) while copy scrolls over it; nothing
  holds the wheel, but it is longer than the brief's 150svh guideline for pinned scenes.
