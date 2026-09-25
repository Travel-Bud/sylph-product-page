# Mock C, "Departures" (`/mock/C`)

**Idea.** Travel and expense told the way a trip is told. Priya's Denver site visit (Sep 11 to 13, the page's own sample charges) runs as an itinerary, and every section borrows the paperwork of airports: boards, signage, a boarding pass, a route map, passport stamps, a folio. Each section sits on the ground of its object, and the joins are the objects' own edges (a sign opening out, rounded panels rising, a stamp-sheet perforation, a receipt-printer tear), not empty bands.

Code: `src/components/custom/mock/c/` (one file per section, `dep.css`, `flap.ts`, `data.ts`, `store.ts`). Captures: `sheet-1440.jpg`, `sheet-390.jpg`.

## Sections and their motion
1. **Departures** (signage black, yellow flaps). The trip's eight charges on a split-flap board, each with its rule and verdict. `flap.ts` is rebuilt from Mock A's engine around a drum: a cell can only advance one character at a time, so the board settles in a natural cascade. Leaves are Web Animations, no reflow per flip. After it settles, one row at a time goes back to CHECKING and lands on its verdict again, only while on screen. An inline script hides the flaps before first paint so the finished board never flashes (CSS shows it anyway after 2.5s).
2. **Rules of the road** (signage yellow). The section is a wayfinding sign that opens to full width out of the hero (scrubbed clip-path). Each rule row quotes its policy clause; Dana's APPROVED flaps turn over row by row as the sign scrolls.
3. **Booked** (cabin daylight). Clouds cross a row of cabin windows at the speed of the scroll. The boarding pass (fare checked by T-004 before she paid, stamp lands) tears at the stub, scrubbed: the stub is the trip report the confirmed booking opened. Interlocking zigzag clip-paths make the tear; the pass is vertical on phones and tears downward.
4. **On the road** (night apron, sticky for 140svh, scrub 0.3). A hand-projected route map of the western US: the plane traces SFO to DEN, the viewBox itself closes in on Denver (hairline strokes stay hairline), the Lyft ride draws in, and four luggage tags swing down on strings to their pins, each naming rule, verdict and how the receipt arrived. All reversible. Phones list the tags under the map.
5. **Stamps** (passport paper, guilloche). Cleared L-007, Needs a note M-041, Blocked M-022 land one after another with a page thump; the rubber-stamp ink is an SVG filter (grain displacement plus patchy coverage). Priya's note types into the declaration beside them. Carries the card-terminal "In build, not yet available" line.
6. **Arrivals** (Dana's violet). Dana's queue as an arrivals board: cleared rows flip to FILED and dim, the three exceptions flip to AWAITING, then Dana's answers land. Approve and Return are live buttons.
7. **Folio** (hotel folio cream, torn top edge). Lines print column by column as it scrolls and the balance tots up; it counts only what stays on the report, driven by Dana's answers above (shared store), so returning the Sushi Kanda dinner changes the total. A "Closed" stamp lands when the last line prints. Exports: PDF, XLSX, GL journal CSV, QuickBooks Online.
8. **Now boarding** (signage black). Pricing as a fares board (Expense $25, Flights $25, both $40), the questions finance asks first, footer.

Reduced motion and no script render every object settled (board final, map flown with tags hung, stamps down, folio totalled, road not sticky). Lenis smooth scroll is the live page's `SidesScroll`, imported unchanged.

## Product truth
Every charge, rule id, threshold and amount comes from `site/sample-data.ts` and `month-data.ts`; booking claims come from the live copy and pricing (policy shown before paying, airline's price, no markup; a confirmed booking opens the trip report). Invented for the story and marked sample: flight UA 1187, seat, policy clause numbers 3.1, 3.4 and 5.2, and Yellow Cab counted as returned by default.

## Weak or unfinished
- Drumming flaps pass through junk characters for up to about two seconds (authentic, but a frame caught mid-drum reads as noise). The fares board takes about two seconds to settle.
- The route map is a sketch (coast, state lines, Rockies chevrons), not surveyed geography; Denver's pin positions are illustrative.
- The arrivals intro hides the Approve and Return buttons for about five seconds while the board sorts.
- The hero board's remarks column leaves spare blank flaps at wide widths; the rules sign leaves some empty yellow below it at 1440.
- Not tested in Safari or Firefox; the stamp ink filter and `clip-path` tear are the likeliest to differ.
