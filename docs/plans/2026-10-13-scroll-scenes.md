# Scroll scenes (2026-10-13)

Ben, after Kyle Skelly's "Claude + Blender + Seedance 2.5" video and the scroll-studies board
(https://claude.ai/artifact/ShCpCEBjpafQVcQFq7T7SS): "Let's build all of these." Five Seedance 2.5 clips become four
scroll scenes on `/`. Study inputs, raw drafts, prompts and draft ids: `.design/scroll-studies-2026-10-13/` (local).

## Scenes

| Study | Section | What happens |
|---|---|---|
| A Living aurora | Hero, at rest | The hero still becomes a seamless 7 s loop of the same sky. The still stays as poster and first paint. |
| B Through the clouds | Hero, on scroll | The hero pins. Scrolling dives into the cloud sea; the headline lifts away, the dashboard sinks out, the frame whites out to paper and the dashboard lands on it. |
| C Only the exception stays | Problem | One pinned film card replaces the two. A gust clears the receipt pile until one receipt is left; the caption turns from "Today" to "With Sylph" and the Marriott verdict card rises. |
| D One charge, taken apart | How it works | The four drawings give way to the exploded clip. The four steps light up in turn as the policy, receipt and charge separate; the last step brings the exception chip. |
| E The card | Features, opening | A pinned film card: the card turns while three lines trade sides, then the bento follows. |

Copy stays inside the landing's existing claims: C reuses the problem captions and the Marriott card, D keeps the four
steps, and E's lines restate what How it works and the Cards tile already say.

## Mechanics

- One controller, `scenes.tsx`, like `panels.tsx`: it writes each `[data-scene]`'s scroll progress as `--p` and seeks
  its `video[data-scrub]` to match. Overlays read `--p` in CSS.
- Clips load when their scene is within about a screen and a half, into memory (blob URL) so seeking never waits on the
  network. Scrubbed clips are encoded all-intra. Save-Data skips the clips; the posters stay.
- Tall tracks and sticky stages exist only under `prefers-reduced-motion: no-preference`. Reduced motion and no script
  get today's layout with settled frames: the hero still, the last frame of C, the exploded frame of D, a face-on card.
- The settle keeps working: inside a track no section boundary is on screen, so nothing moves.

## Assets

`public/site/scroll/`: clips at 960x540 from the 480p drafts, posters and settled frames as JPEG. The 1080p versions
need a fal top-up (the drafts expire 2026-10-20; about $45 for all five), and then replace these files.

## Verify

The four gates; `node scripts/explore-check.mjs` at 1440, 390 and reduced motion; headless frames through each track at
1440 and 390.
