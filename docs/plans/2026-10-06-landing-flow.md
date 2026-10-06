# Landing flow: section transitions, settle snap, density (2026-10-06)

Ben, comparing the landing with instalily.ai: it needs more polish, a little more content density, and transitions between sections, because the page feels flat. He also wants InstaLily's settle: half a second after you stop partway into the next section, it glides into place.

## What InstaLily does

Measured on 2026-10-06 at 1440x900 in headless Chrome, scrolling with wheel input.

- Each section is about one screen tall: a kicker, a heading near the top (about 48px) and content filling the rest.
- Dark sections arrive as rounded panels inset from the page edge, and sit full-bleed once in place.
- The settle is script, not CSS scroll-snap. When scrolling stops partway, it glides to the nearer position a moment later. From the use-cases section on, its positions are 1125px apart.

## Changes

1. **Night sections become panels.** This applies to How it works, Try it, and Close plus the footer.
   - The night background is a layer behind the content with rounded corners (28px on desktop, 20px on phones).
   - It is inset from the viewport edges (24px desktop, 10px phone) while its top or bottom edge is in view, and widens to full-bleed as the section comes into place. This is scroll-linked: transform only, one CSS variable per panel, read once per animation frame.
   - Paper shows around the corners, so the hard straight edge between paper and night goes away.
   - Close and the footer share one panel, with no seam between them.
   - Under reduced motion the panel stays inset and still.
2. **Settle snap.**
   - Desktop only (fine pointer, 1024px and wider), and off under reduced motion.
   - Rests sit where a section's top meets the viewport top, or where its end meets the bottom (its top, if it is shorter than the viewport).
   - About 450ms after the last scroll, if a section boundary is inside the viewport, the page glides (350 to 700ms, eased) on to the next rest in the scroll's direction once the reader is within 55% of a screen of it, or takes back an overshoot of a section's top (within 20%).
   - Otherwise it stays put. It never pulls the reader back to where the scroll began. A first draft that simply took the nearer rest trapped short scrolls, the same trap InstaLily has.
   - With no boundary in view, such as inside Features, nothing happens.
   - Any wheel, key, touch or pointer input cancels a glide. There is no settle while a form field has focus or text is selected. An in-page link jump already lands on a rest, so nothing moves after it.
   - Settle points: hero, problem, how, features, try, questions, close.
3. **A little more density.**
   - Section padding goes from 128–144px to 96–104px.
   - The h2 goes from 60px to 52px.
   - Gaps between a heading and its content go from 56–72px to 40–48px.
   - The problem section's film cards go from 560px to 480px tall.
   - Target: every section except Features fits one 1440x900 screen, so the settle lands on a whole composition.

## Out of scope

- A nav redesign, copy changes and new sections.
- /pricing and /demo, which pick up only the shared type change.

## Verify

- The four gates pass.
- explore-check is clean at 1440, 390 and reduced motion on /, /pricing and /demo.
- Frames at 1440 and 390 every 800px with wheel input (scratchpad `study.mjs`) confirm the settle points and the panel transitions.
- Ben checks it in Firefox.
