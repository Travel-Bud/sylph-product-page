# Hours: the landing, keeping the story's clock (2026-09-25)

Mockup A at `/mock/A` (first shipped at `/lab/hours`, moved 2026-09-25; noindex, unlinked). `/` is untouched. Branch `lab/hours`, cut
from `staging` at `a4a93f3`.

## Audit

Captures: `audit-landing-1440.jpg` and `audit-lab-*.jpg` in this folder.

### The landing (`/`)

1. **The seams are dead air.** Five 360px frames (1,800px of an 8,950px page, one screen in five) hold an ink
   cross, two side tags and a pill such as "02 The rule". The courier's flight through them is a small pill on a
   large empty white field, and when it is not in flight the frame is empty. This is the "bumper" feeling: the
   page stops, says the chapter number, and starts again.
2. **One ground, one grid.** White, then `#f5f8f6`, then white again for seven screens, and every chapter is the
   same composition: a clay figure on its edge, a 40px avatar, an H2 at 42px, a lede, a white card. Only month
   end changes colour. The White Air rules in `sides.css` (no tints, no gradients, no washes) are why: they made
   the page calm, and they also made it flat.
3. **The story has a clock the page never uses.** The data already dates every beat: the photo at 7:52 pm on
   Saturday Sep 12 in Denver, the answer at 21:52, Dana's queue on Monday at 09:12, the report on Sep 30. The
   page shows these only as small mono captions.
4. **The best motion is invisible.** The courier's carriers (bird, rail, paper plane, text bubble, stamp) are
   good ideas, but each is a 60px glyph crossing blank space, so they read as decoration rather than as the story.
5. **The tail flattens.** After the green month end the sample month, questions, close and footer are four
   white screens of forms and lists with nothing to look at.

### The lab

- **The receipt** has the best voice ("Nobody had to chase me.") but is a single paper column on black: great for
  one scroll, monotonous at eight.
- **Compiled** and **Same path** are strong demos and weak pages: dense UI panels on white, one idea each.
- **The pile** has the strongest argument (98 to 14) and no warmth; it reads as a report.
- **Two faces** has the strongest first screen, but the split holds for the whole page, so every beat looks alike.
- **Drawn** has the warmth and the colour, bought with generated scenes that drift off model and that every copy
  change has to follow.

What they share with `/`: each one found a single device and repeated it. None of them changes its world as
the story moves.

## Direction

**The page keeps the story's clock.** The ground follows the hours of the story: white for the hero, Denver
dusk for the photo, Dana's lilac paper for the rule, night for the answer, dawn into Monday morning for the
desk, green for month end. The gaps between chapters stop being frames and become the time passing between
the beats: each is a full-screen passage, scrubbed to the scroll, drawn by hand in SVG and CSS, that carries the
charge from one person to the other and changes the light on the way. The palette changes because the time of
day changes, so the colour has a reason.

Sylph is an air spirit and the slogan is "Expenses run on air", so the charge travels on air: wind lines, a
paper plane, torn calendar pages on a draught.

## The passages

Each is 180svh tall with a sticky 100svh stage; the stage's colour starts on the chapter above and ends on the
chapter below, so no edge shows. At the end of passage *n* the page dispatches `v2s:arrive` for stop *n + 1* (the
same contract the courier used), so the cast still reacts. The courier is not mounted on this route; the
passages are the courier.

| # | Time card | From / to ground | The animation |
|---|---|---|---|
| 1 | Sat, Sep 12, 7:52 pm, Denver | white to dusk | The sky falls to dusk behind a hand-drawn Front Range and a street; windows light; Sushi Kanda's lantern comes on; a thermal receipt prints line by line; a viewfinder closes on it and the shutter flashes; the receipt becomes the charge pill. |
| 2 | Section 4, approved Aug 28 | dusk to lilac paper | A sheet of paper slides up over the night like a page turning; the policy riffles to section 4 and the dinner-cap sentence is marked; the charge settles on the line. |
| 3 | Sat, 9:52 pm | lilac to night | That sheet folds into a paper plane, fold by fold, and glides across a starfield over Denver on an air trail, down to Priya's phone. |
| 4 | Mon, Sep 14, 9:12 am | night to morning | A split-flap clock rolls from Saturday night through Sunday to Monday morning while the sky goes through indigo, rose and peach, the sun clears the mountains and the stars go out; Priya's reply crosses as a text bubble on the wind. |
| 5 | Wed, Sep 30 | morning to green | A tear-off calendar sheds Sep 14 to Sep 29, faster and faster, the pages carried off on a draught; the 30 stays, and green floods out from it. |

## The chapters

The chapter components (`Receipts`, `Policy`, `Verdicts`, `Desk`, `MonthEnd`, `YourMonth`, `Questions`) are
reused as they are, with their panels, cast and interactions. The route restyles them under `.hrs`: each takes the
ground of its hour, its copy recolours for that ground (panels keep their own light card tokens), and the headline
scale and composition change per chapter so no two read alike. After the sample month, the questions sit on
night ink, and the close is a new scene: the Sylph bird riding hand-drawn wind lines under "Expenses run on air."

## Rules for the mockup

- Everything drawn is inline SVG or CSS, by hand. No new raster assets; the clay cast is reused.
- Motion is transform, opacity, colour and clip only, scrubbed by GSAP ScrollTrigger on the Lenis-driven window.
- Reduced motion: no sticky stages, no scrub; each passage renders one settled composition at a short height.
- 390px: every scene is a `slice`-fitted SVG and every time card fits without overflow.
- No em dashes; sample data stays labelled as sample.

## Check

`node scripts/explore-check.mjs http://localhost:3100/mock/A` (console, failed requests and overflow at 1440, 390
and reduced motion), plus the four repo gates.

## State (2026-09-25)

Built as specified and committed on local branch `lab/hours` (not pushed, not in `staging`). Captures in this folder: `passage-1-dusk.jpg` to
`passage-5-month.jpg` (nine scrub frames each at 1440), `hours-1440-a.jpg` and `hours-1440-b.jpg` (the whole page),
`hours-390-passages.jpg` and `hours-reduced-motion.jpg`. `explore-check` passes at 1440, 390 and reduced motion;
typecheck, test and build pass. The new files lint clean (`pnpm lint` fails on 11 older errors elsewhere).

Open before any of this reaches `/`:
- The page is 16,800px against the current 8,950px: each passage takes two screens of scroll. Try 160svh.
- The nav stays a white bar over the dark hours; it could take the ground's colour.
- The scenery is flat and deliberately simple. It needs an art pass (roofline detail, the weekend's daylight
  palette) and a decision on whether the clay cast should appear inside the passages.
- The sun rises over the Front Range, which lies west of Denver. It is a liberty; move the arc if anyone minds.

## Round 2 (2026-09-25): the courier and the scroll

- **One charge, carried the whole way.** `courier.tsx` flies the single Sushi Kanda pill down the page on the Sylph
  bird, with an amber beam that draws behind it and shrinks into it on landing. It is born from the photographed
  receipt, rests in each chapter's own pill (the others show empty dashed slots), and in each scene rides an anchor
  the scene animates: lifted by the rising page onto rule 4.3, into the note before it folds into the plane,
  attached to Priya's reply, pinned to the calendar, and onto line 3 of the month-end report. Position is a pure
  function of scroll, so scrolling back rewinds it. The cast reactions fire when it lands in a chapter.
- **Easier scroll.** Passages are 160svh (from 200svh; the page is 15,000px, from 16,800px), scrub smoothing is 0.3
  (from 0.6) on top of Lenis, and scenes 3 to 5 were re-timed so their main action starts after the charge lands.
- **Flow between sections.** Each time card leaves before its stage does, so every scene ends on bare ground in
  the next chapter's colour; the nav bar takes the colour of the hour under it (bone type over the dark ones); and
  the nav's orange charge rail now runs on this route too (`v2-sides/nav.tsx`, the one shared file touched).

Captures: `courier-1440-a.jpg`, `courier-1440-b.jpg` (the walk at 420px steps), `courier-390.jpg`. Checks as before, all clean.
