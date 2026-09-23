# Two sides, round 5 (shared brief)

Branch `landing-two-sides` (worktree `sylph-product-page-v2`); the landing is now `/` (http://localhost:3200/).
Ben's notes on the promoted page:
- **The travelling receipt is buggy**, especially scrolling up and down: "it sometimes uses the wrong one". Fine-tune
  it and reduce the confusion it can cause.
- **Reimagine the connection between section 4 (desk) and 5 (month end).**
- **Part 2 (the policy compile) is a little long** and should be smoother.
- **Better sounds**: free sounds, or generated (ElevenLabs is available). Sound design and timing are not great.
  **Sound should hit when you click a button, not on scroll**, because people scroll by.

Binding as before: SHARED-BRIEF, ROUND3-BRIEF (contracts, scroll contract), ROUND4-BRIEF (mobile bar, pacing).

| Track | Agent | Owns |
|---|---|---|
| Courier correctness and the 4 to 5 connection | `courier` | `courier.tsx`, `courier.css`, `public/site/courier/`; and, for the connection only, the `Desk` and `MonthEnd` functions in `chapters.tsx` plus their rules in `chapters.css` |
| Policy compile: shorter, smoother | `sides` | the `Policy` function in `chapters.tsx` and its rules in `chapters.css` only |
| Sound | `stage` | `sound.ts`, new `public/site/sound/`, and every `play(...)` call site across the page (edit only those lines in other tracks' files) |

`chapters.tsx` and `chapters.css` are shared this round between courier (Desk, MonthEnd) and sides (Policy): edit
only your own functions and rules; if the Edit tool reports the file changed, re-read and retry.

## Sound policy (new)

Sound plays only in direct response to the visitor's own click, tap or key press on a control. Nothing plays on
scroll, on a courier landing, on a timer or on an animation ending, even if the visitor has switched sound on.
`sound.ts` enforces this centrally: `play()` is a no-op unless called during, or within a short window after, a
trusted pointer or keyboard activation. Stage owns that rule; other tracks remove their scroll-driven calls.

## Gates

Typecheck, eslint on your paths, real-time captures at 1440 and 390 that you look at, console clean, reduced motion.
Evidence under `docs/plans/2026-09-22-landing-v2/sides/round5/<track>/`. No `pnpm build`, no dev server (tell `main`
if :3200 is down), no commits, no pushes.
