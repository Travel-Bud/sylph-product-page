# Two sides, round 3: polish run (shared brief)

Ben picked direction C (`/v2/sides`) and wants it pushed further. His notes, verbatim in substance:
- **Cleaner scroll.**
- **More animation for the characters**, and **movement of the receipt or data between scenes**. The Sylph
  bird can carry it off and around once or twice, but the transport should **not be the same thing between
  every scene**.
- **Use space as a resource.** Several sections are too long to fit on one screen, and their information
  should fit on one.
- **The hero is underdeveloped**, too simple.
- **Items should feel more interactive.** They are too static now.
- "Make me proud and polish this page."

Also read `SHARED-BRIEF.md` (claims, taste, repo mechanics; binding) and look at the page at
http://localhost:3200/v2/sides, plus round-2 evidence in `sides/`. Palette rules from round 2 still stand:
White Air (white, band `#f5f8f6`, ink `#101b16`, green `#0ecc83` = cleared only, amber and oxblood keep
their meanings). Priya's blue (`#9dbde6`, text `#1b4680`) and Dana's lilac (`#c9b8ec`, text `#46328a`) are
solid accents only. No washes, no blur, no soft gradients, no glow orbs. One flat deep-green ground at
month end.

## Four tracks run in parallel on one worktree

| Track | Owns (only edit these) |
|---|---|
| **stage**: hero, nav, scroll | `hero.tsx`, `hero-stage.tsx`, `nav.tsx`, `reveal.tsx`, `app/v2/sides/page.tsx`, new `hero.css`, new `scroll.tsx` (or similar) |
| **courier**: the charge travelling between scenes | new `courier.tsx`, new `courier.css`, new carrier assets under `public/site/courier/` |
| **chapters**: density and interactivity | `chapters.tsx`, `closing.tsx`, `parts.tsx` (except the two contracts below), `data.ts`, new `chapters.css` |
| **cast**: character animation | `cast.tsx`, new `cast.css`, new assets under `public/site/characters/` |

`sides.css` is shared legacy. Edit an existing rule there only if its selector belongs to your own
components (hero rules: stage; chapter, question and close rules: chapters). Put new rules in your own
stylesheet and import it from your own component. If the Edit tool reports that the file changed since
you read it, re-read and retry; never overwrite someone else's lines. Do not edit another track's files.
If you need something from another track, message the lead (`main`) with the exact ask.

## Contracts between tracks (keep them stable)

1. **Courier stops.** The charge's journey is Sushi Kanda, $84.20. Its stops are elements carrying
   `data-courier-stop="<n>"`. Stop 0 is the charge in the hero (stage marks it). Stops 1 to 5 are the
   `Token` pill in each chapter (`parts.tsx`, already in place: receipts 1, policy 2, verdicts 3, desk 4,
   month end 5). Chapters may move a Token within its chapter but must keep one per chapter, in order.
   The courier reads the stops' live positions, so it must survive layout changes.
2. **Arrival event.** When the courier lands at a stop it dispatches
   `window.dispatchEvent(new CustomEvent("v2s:arrive", { detail: { stop: n } }))`. When it leaves, it
   dispatches `v2s:depart` with the same detail. Cast and chapters may listen (for example Dana looks up
   when the charge lands in her queue, or the stop's pill pulses). Nobody else dispatches these events.
3. **Cast API.** `Figure({ name, height, className, priority })` and `Head({ who, size, className })`
   from `cast.tsx` are the only way to draw Priya and Dana. Call sites keep that API. Cast may add
   optional props (for example `react` or `idle`) but must not require new ones.
4. **Scroll.** Stage decides whether the page mounts smooth scrolling (Lenis is installed: `lenis`, plus
   `gsap` and `@gsap/react`, with ScrollTrigger and MotionPath available) and exposes it so the courier's
   ScrollTrigger stays in sync. If Lenis is mounted, it must call `ScrollTrigger.update` on scroll. Stage
   tells the lead which hook or global the others use (for example `window.__lenis`).
5. **Reduced motion and no-JS.** Every track renders its settled, fully readable state under
   `prefers-reduced-motion: reduce` and without script. The courier then shows nothing in flight: each
   stop's pill is simply present.

## Shared quality bar

- **Fit.** At 1440x900 and 1280x800, each chapter's core (heading, character, the key panel) reads in one
  viewport without scrolling inside it. Nothing important starts below the fold of its own section. At
  390 the page stacks cleanly with no horizontal overflow.
- **Motion is caused.** Every movement demonstrates something (the charge moving, a verdict landing, a
  person reacting). Nothing loops ambiently except a character's very subtle idle, if cast chooses one.
  60fps: animate `transform` and `opacity` only.
- **Interactive means responsive to the visitor.** Hover, focus, click, drag and keyboard states, and each
  interaction teaches something true about the product. Every control has a visible focus state, a 44px
  target on touch, and works with the keyboard.
- **Claims.** Sample data chips on every panel with numbers; no new claims beyond SHARED-BRIEF; no dashes.
- **Gates for your paths.** `pnpm typecheck` 0; `pnpm exec eslint <your paths>` clean; real-time captures
  via `scripts/shot.mjs` (1440, 1280x800, 390 `mobile:true`, and one reduced-motion frame), saved to
  `docs/plans/2026-09-22-landing-v2/sides/round3/<track>/` and actually looked at; console clean. Do not
  run `pnpm build` or start a dev server (:3200 is running; if it is down, message `main`). Do not commit.

## Scroll contract (decided by stage, 2026-09-22)

The page mounts Lenis (`v2-sides/scroll.tsx`, mounted from `page.tsx`).
1. Import gsap and ScrollTrigger only from `@/components/custom/site/motion` (one registered instance and ticker).
   The scroller is still the window: default ScrollTrigger scroller, no `scrollerProxy`, no `scroller:` option.
   `scrub: true` or a small number both work.
2. No second Lenis, never touch `gsap.ticker.lagSmoothing`, never set `scroll-behavior`.
3. `window.__lenis` exists except under reduced motion and on touch (touch and keyboard scroll natively).
   Programmatic scroll: `window.__lenis?.scrollTo(el)` with NO offset (Lenis applies the 64px `scroll-padding-top`), else `el.scrollIntoView()`.
4. Window scroll events and IntersectionObserver fire normally.
5. Stage owns in-page anchor clicks (`a[href^="#"]`); add no other anchor handlers.
6. Headless shots: wait ~300ms after `window.scrollTo`, or `window.__lenis.scrollTo(y, { immediate: true })`.
7. The hero dispatches `v2s:hero` (detail `{ id: "sushi"|"lyft"|"bar", verdict: "note"|"ok"|"block", phase: "sent"|"landed" }`)
   when a visitor plays a receipt. Stop 0 is a `.v2s-token-pill` inside Dana's queue card in the hero; it may go
   to opacity 0 briefly during a replay, so query `[data-courier-stop]` live and never cache the elements.
