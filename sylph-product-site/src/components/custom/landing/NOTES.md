# TROPE CLEANUP + RIVER LEGIBILITY PASS (2026-07-18)

Ben's brief: strip the AI-trope furniture, make the capture photos convincing,
and fix the moments where the river runs through text.

- **Eyebrow kit REMOVED everywhere:** the hero's "Corporate travel & expense"
  dash-eyebrow, the `book > capture > match > enforce > record` pipeline lines
  (hero foot + footer), and `SectionEyebrow` (dash + station rail) in all five
  sections. `SectionEyebrow`/`Station` deleted from motion.tsx; `.ar-rail`,
  `.ar-eyebrow-row`, `.ar-dash`, `.ar-pipeline` CSS deleted (base
  `.ar-eyebrow` kept — /dev labs still use it). Headings now open each
  chapter directly.
- **Spine station nodes REMOVED** (same trope family — mono uppercase
  `○ ENFORCE` etc.); `Geo.nodes`, `.sp-node` CSS, and `ptAtY` gone.
- **Capture photos replaced** with stock-style people shots: `capture-tap.jpg`
  (card tapped on a POS across a café counter) and `capture-text-in.jpg`
  (traveler photographing a receipt to text it in), gpt-image-2 high,
  1536x1152 (4:3 = `.cap-vis`). Old `capture-terminal.jpg`/`capture-text.jpg`
  deleted (in git history). NOTE: gpt-image-2 rejects sizes below a minimum
  pixel budget — 768x576 fails; iterate at final size with `--quality low`.
- **River legibility (spine.tsx):**
  - QUIET ZONES: `QUIET_SELS` lists bare-ink text blocks; at build time,
    wherever the sampled path actually crosses one (x∩y test, per viewport),
    the shared gradient is dimmed to `QUIET_DIM` (0.16) across that y-band
    with soft ramps (`quietStops`, pure gradient surgery — zero runtime
    cost, packet dims with it since all strokes share the gradient).
  - Enforce anchor moved to the su-grid gutter (`ax: 0.325` on `.su-rule`)
    so the line threads between the 0:00/0:12 columns instead of running
    through column 1.
  - `LEG_DIR` capture→book flipped RIGHT (+0.55): the descent and the
    boarding-pass emission ride open air beside the booking copy, never
    across "already there.". book→enforce softened to -0.6, enforce→sky
    to -0.25.
  - Stamp emission ("cleared · ¥3,200 → $21.55") now rides BELOW the su-grid
    (measured), no longer over the travel-expense-policy.pdf chip.
- Verified: 14-stop Playwright walk (channel chrome, 1440×900) ×2 rounds —
  every chapter checked for line-through-text; tsc + lint green.
- **Em/en dash sweep (same day, Ben's follow-up):** zero dashes in visible
  copy on `/` and `/demo` (code comments exempt). Rewords: capture proof line
  (comma), hero replay button (`·`), rec-catch caption (commas), flight times
  ("10:40a to 2:25p"), bento dates ("May 12 to 17"), demo title
  ("Book a demo · Sylph"), demo lede/point/thanks (colon/period), company-size
  options ("1 to 50"). Booking aria-label de-dashed too.

# THE SPINE — the current made visible, full-page (2026-07-08, later session)

Ben's brief: "a flowing spine along the full landing page which spits out
receipts at important places" — the OPEN DIRECTION from v5.1 (river-as-page-
spine), now built. Supersedes the three discrete CurrentSeam bands (deleted;
`current-seam.tsx` keeps only RecordLanding).

- **`spine.tsx` (TheSpine):** one continuous procedural streamline from the
  hero coil's quadrant to the decision record. Catmull-Rom path through
  MEASURED anchors per chapter (capture `.ci-slot`, booking `.app-frame` left
  gap, setup `.su-rule`, interlude, bento, `#record .rec-landing`) + one
  seeded sway midpoint per leg (`LEG_DIR` tunes side/magnitude so the line
  clears headings and product windows). Rebuilt on resize (RO, debounced) and
  font settle; renders nothing outside desktop+motion (`MM_SPINE`).
- **Layering — "under glass":** `.lp-body` wraps the six chapters; every
  `.wrap` gets z1; TheSpine mounts DOM-LAST with `.lp-spine` at z0 → the line
  paints above section backgrounds/washes/grain/interlude photo but below ALL
  content; it visibly dives UNDER each evidence card. `.lp-spine-paper` (z3)
  flies the receipts above the page. Both layers reach `top:-120px` into the
  hero's veiled seam (HERO_REACH), so the line is born inside the coil's air.
- **Color is one userSpaceOnUse gradient** keyed to measured y: born aurora
  in the hero dark, --green over paper, aurora across the interlude sky
  (deliberately VISIBLE over the photo — verified, it reads as an aurora
  ribbon), fading to 0 into the record. Strokes: halo/body/core + a bright
  dash-window PACKET whose dashoffset is scroll-scrubbed (the gust travels
  ahead of the reader; `[style]`-gated opacity so it never paints pre-JS).
- **Nodes:** quiet mono stops (capture/book/enforce/record) placed where the
  path crosses each chapter's top air (`ptAtY(sectionTop+48)`) — the page
  reads as a pipeline diagram.
- **Emissions (MotionPathPlugin, all scrub, seeded):** hero→capture two
  receipts dive under the cap card; a BOARDING PASS (new asset) rides the
  booking gap and dissolves at the app-frame's edge, chip "booked · in policy
  / report opened itself"; a receipt is stamped "cleared · ¥3,200 → $21.55"
  mid-air in setup's lower half; a HOTEL FOLIO (new asset) unspools below the
  bento into RecordLanding. Emission fraction windows are computed from the
  same analytic samples that build the path (fracAtY), so paper always rides
  the drawn line.
- **New assets:** `boarding-pass.png` (640×779, SFO→KIX = canonical trip,
  kept crisp) + `receipt-folio.png` (420×1181, "Total 82000" blurred RGB-only
  — non-canonical number). gpt-image-1 `--background transparent` + the v4.2
  Pillow hardening pipeline.
- **Gotchas burned:** (1) useGSAP `scope` scopes ScrollTrigger selector
  STRINGS — `trigger: "#booking"` silently resolved against the spine root →
  body fallback / zero-length windows. Resolve section triggers via
  `document.querySelector` and pass ELEMENTS. (2) Lenis re-asserts its own
  target after a native `window.scrollTo` in an eval — "state at scroll 0"
  reads were actually at the old position; measure `scrollY` in the same
  read. (3) The preview tab's screenshot surface desyncs from scroll after a
  reload — use Playwright `channel:'chrome'` headless for scrolled captures.
- Verified: scroll-walk screenshots at 12 stops ×1440 + 1280/1728 spots, no
  console/page errors; mobile + reduced-motion collapse both layers (nothing
  mounts); /demo + /pricing untouched; build green (/ first-load 190→201kB —
  MotionPathPlugin; three still async-only); lint 0 new; flight vitest 6/6.
  Dev helper: `window.__spineST` (ScrollTrigger) exposed in dev builds only.

---

# The Current + receipt morph — the page arc (2026-07-08, same session as v5.1)

Ben's go on the "In → Along → Out" arc, plus: the flying paper must look like
the MOCKUP receipts, not row-strips.

- **Row → receipt morph (sheet-material):** each captured row is a 10:1 plank
  only for the swap instant; over phase 0.05→0.24 the plane compacts to a
  seeded receipt-note proportion (aCard attr, ~118-158×78-106px) while the
  fragment crossfades the row print into a PROCEDURAL receipt (warm-white body,
  seeded ruled lines, total bar, diagonal crease shadow — premultiplied like
  the rest of the pipeline). Swap frame untouched; harnesses stay green
  (det GREEN, A/B 0.5 LSB/0%, 659f max 9.7ms 0>17).
- **CurrentSeam (`current-seam.tsx` + `.cur-seam` CSS):** scroll-scrubbed
  receipt cutouts (the capture intake's own pngs) riding seams between
  chapters — the reader's scroll IS the wind, nothing ambient (Ben rejected
  clock-driven bg motion). Three variants placed in page.tsx: `intake`
  (hero→capture, paper drifts out of the night), `pass` (setup→interlude,
  one sheet crosses), `unspool` (bento→record, sheets straighten + hand off).
  Desktop+motion only; display:none ≤980px and under reduced motion.
- **RecordLanding + `.rec-catch`:** the unspooled sheets settle onto the
  record-paper archive behind the decision card (z between backplate and
  card), once, on section enter; caption closes the hero's loop: "the 211
  that cleared themselves land here — in order, cited." This is the answer
  to Ben's black-box worry: the coil is a spool, not a hole — the vortex
  appears ONCE (hero), the river carries, the record pays it off.
- Build green after arc (/ 190kB unchanged).

---

# Hero v5.1 rework — static coil, visible-only sweep, expansive glass (2026-07-08)

Ben's same-day feedback on v5: the dynamic vortex "does not look good" → the coil
is STATIC again (the living-vortex shader is parked in the lab — hero mounts no
bg canvas); bills feeding in from below "feels strange" → BACKFILL DELETED
(no pool rows; the orchestrator clips the fly-list to rows wholly inside the
pane — what you see is what the wind takes; emptied slots stay empty until the
collapse closes the ledger); panel "more expansive like the mockups" → 524px
glass, roomier row metrics, 5 crows + 3 exceptions all visible (PANEL_ROWS
trimmed, waves [3,2]). Sheet/atlas indices are capture-order — the visibility
filter maps through `flyIdx` so a flying crow keeps its own texture.
Re-verified after rework: determinism GREEN, A/B 0.5 LSB/0%, 659f avg 8.33
max 10ms 0>17, replay 3→99→3, vitest 6/6, tsc/eslint clean.

OPEN DIRECTION (Ben, thinking aloud): carry the motif through the page —
receipts leaving/entering a river that follows the reader — BUT he suspects
vortex-everywhere reads as a BLACK BOX vs. Sylph's observability story. Proposed
resolution (awaiting his go): vortex appears ONCE (hero intake); the RIVER is
the page spine with paper riding in/out of frame at receipt-relevant sections;
the payoff is the record/audit section where the current unspools and lays the
cleared items back down as a flat cited audit trail — the coil was winding the
month INTO the record, not into a hole.

---

# Hero v5 "Into the Vortex" — living portal + integrated flight (2026-07-08)

Ben's brief (after the 3-direction exploration in
`docs/prompts/landing-references/hero-directions/` — he picked A "Vortex Intake",
liked B's split-verdict legibility, and required the vortex be DYNAMIC): the gust
must read as receipts riding the aurora INTO a spiral vortex with real paper
weight, and the needs-review panel must make "down to 3" the dominant focal point.
Phase-3 integration shipped in the same pass — the flight lab now drives the real
hero. Fresh-eyes eval run; its findings (tape silhouettes, radial clock-hands,
early green ignite, ambiguous counter copy) all fixed.

- **New art:** `public/landing/aurora-vortex.jpg` (gpt-image-2 high, 2560×1440) —
  ribbons wind into a coil at image fraction (0.70, 0.29). `AURORA_ART` +
  `params.vortex` are the single anchor; `vortexWorldPoint()` (flight-field.ts)
  replicates the `.wh-bg` cover/center-right/inset-6% layout so the flight sink and
  the bg shader agree on where the portal is at any viewport.
- **The vortex LIVES:** aurora-bg.tsx is now a two-phase looping flow (each phase
  winds ±θ/2 around the eye and resets while crossfaded out — endless apparent spin,
  bounded distortion; rigid core plateau + narrow shear band). Two clocks by design:
  gust warp reads virtual timeline time (deterministic, scrub-safe); the spin reads
  an ambient clock that only accrues (timeline advances feed it deltas; a ~30fps
  gsap.ticker drives it between flights, paused offscreen via IntersectionObserver).
  The canvas fades in once ready and STAYS — the churn is the page's resting state
  (measured: mean |Δ| ≈ 9/channel over 6s at rest). Mobile gets the living vortex
  too (any WebGL2 width); reduced motion gets the static JPG.
- **Flight into the coil:** `precomputePath` gains a sink post-pass — past a seeded
  bendStart the fitted free path blends onto a log-spiral that lands on a seeded
  60–100px STANDOFF orbit at the eye's rim (never skewering the core), tangent-
  aligned via unwrapped atan2 (no ±π seam), flutter/tumble damped by wind-in
  progress, roll into the rotation. Sheets shrink into the portal (scale is a pure
  function of phase). Byte-equal + orbit-contract vitest tests.
- **Fold-to-slip (the tape killer):** captured rows are 10:1 planks, so the vertex
  shader Z-folds BOTH wings along seeded creases (one up, one down) over phase
  0.05→0.26 — silhouettes compact to folded-slip proportions with matte per-face
  shading (vFace). Swap frame untouched (fold is 0 at phase 0). Curvature rim-light
  is now fully airT-gated: paper stays paper until the coil; green means proximity
  to the portal.
- **Panel (B's legibility folded in):** giant serif tally (`.wq-head .n b`,
  Newsreader ~3rem) falls 214→3 with "flagged · of 214 checked" beside it; meter
  drains to a GLOWING amber cap (2.8%); amber rule chips on exceptions; deeper glass
  (rgba .68/.8) + aurora border. Same selector contract — orchestrator/reset
  unchanged except the meter tween + persistent bg canvas. Panel sits BELOW the
  coil's eye on desktop (stage translateY — the portal must stay visible).
- **hero-section.tsx** now runs the tier ladder end-to-end: gl (capture → atlas →
  FlightCanvas + orchestrator, visibility gate at 2.1s, 3.5s bailout to DOM sweep),
  dom/fade (calm two-cluster fade + tally/meter/collapse — the old SVG streamline
  gust is DELETED), reduced-motion/no-JS (settled truth). Replay rebuilds via
  resetFlight → same 214, same 3. three.js enters only via next/dynamic
  (`/` first-load 190kB, three absent; loads on demand).
- **Gotchas burned here:** R3F's Canvas wrapper sets pointer-events:auto INSIDE a
  pointer-events:none layer — it swallowed the replay-button clicks (fix: style
  prop + CSS `!important` backstop on both canvases); `lsof -ti :3000` lists CLIENT
  sockets too (filter `-sTCP:LISTEN`); Playwright's bundled headless shell has NO GL
  in this env ("BindToCurrentSequence failed") but `channel:'chrome', headless:true`
  gives full Metal GPU incl. the strict performance-caveat probe.
- **Harnesses (real GPU, post-integration):** determinism GREEN (frame hashes ×2
  rebuilds), A/B swap max 0.5 LSB / 0% >2LSB, play 761f avg 8.33ms max 11.7ms
  0>17ms, build green, flight-field vitest 6/6.
- **Next (agreed with Ben, not built):** the RETURN ARC — cleared bills spat back
  out further down the page, assembling into a report/record (a second AuroraBgCanvas
  with mirrored spin + a reversed flight field; modules are already reusable).
  Residual polish knobs live in the lab (`/dev/hero`): heading spread, fold angle,
  swirl turns, spin speed.

---

# Hero paper flight — DOM→WebGL rebuild, lab phase (2026-07-08)

Ben's brief: upgrade the v4.2 DOM queue sweep to true paper physics (plan:
`docs/plans/2026-07-07-hero-paper-flight-plan.md`). Built + tuned at `/dev/hero`
(prod-gated lab; `flight/` modules). NOT yet integrated into hero-section (Phase 3,
after Ben's checkpoint-2 sign-off). Key revisions Ben made during the build: sweep
trimmed to a HANDFUL (8 crows, 2 waves of 4, counter 214→96→3 — "less busy"), and
the flight vocabulary matched to wind-blown-paper reference footage (one arced
gust-stream; hinge-folded, tumbling sheets; not parallel strips).

- **Handoff recipe (pixel-exact, cross-browser: Chrome/Safari 0.5 LSB, Firefox 0.9,
  0% >2LSB):** html-to-image capture (fonts.ready gate, memoized font CSS,
  transparent bg) → packed atlas CanvasTexture (premultiplied, flipY=false,
  NoColorSpace raw round-trip) → InstancedMesh on a pixel-mapped camera (fov 50,
  z=(h/2)/tan25°) → `<Canvas flat frameloop="never">` advanced from the GSAP tick →
  device-pixel-snapped spawns sized by TEXEL dims (fractional CSS rects blur).
- **Determinism:** paths precomputed at 64 fixed virtual steps (`flight-field.ts`,
  vitest byte-equal test); ALL DOM reads at build time (backfill shifts are summed
  row heights — no measurements inside the timeline); state changes are gsap
  .set()/tweens (scrub-reversible, no call()s); lab determinism harness = frame
  hashes at 4 progress points across two full rebuilds, GREEN.
- **Perf:** real GPU 669f avg 8.34ms max 12.6ms, 0 >17ms (120Hz).
- **Gotchas burned here:** leva replays stale module-store values through onChange
  after Fast Refresh — hard-navigate after edits (clean loads are deterministic);
  next/image `fill` imgs report LAYOUT size to three's sized texture upload
  (INVALID_VALUE → black) — snapshot to a natural-size canvas first;
  `failIfMajorPerformanceCaveat:true` sends SwiftShader to the DOM tier (headless
  Chromium reports tier=dom; the lab renders anyway); GSAP .set() tweens are the
  scrub-safe way to flip visibility (never call()); a row's backfill must start
  after the last same-wave lift ABOVE it (else double-printed rows); vertex + fragment
  stages each need their own GLSL uniform declaration (uDissolveStart).
- Fallback tiers, mobile un-hide (≤980px `.wq-before` display:none), lifecycle
  dispose, and `wind-sweep-dom.ts` extraction are Phase 3 work.

---

# Landing — v4.2 "One Wind" motion & texture pass (2026-07-07)

Ben's brief: Plaid-caliber motion, wind with WEIGHT. Direction doc in the approved plan
("One wind, with weight"): one prevailing current (low-left → high-right, nothing moves
against it), paper physics (lift / curl / arc / settle, decoupled x-y channels, per-object
variance **seeded by index — `seeded()` in `wind-sweep.ts`, never Math.random** so the
replay button stays honest), the gust always leads. What changed:

- **Hero sweep upgraded (centerpiece):** the six compliant rows now fly per-row 3-phase
  keyframed carry flights (catch / carry / exit past the measured frame edge, rotationZ ≤12°,
  rotationY/X flutter ≤7°, scale 1.02 lift-off), seeded stagger with jitter. Counter pulses
  once in aurora as it lands on 3 (scale 1.07 + color flash, inside the timeline so replays
  get it). GOTCHA fixed: `clearProps` on a node inside the display:none overlay makes GSAP
  reparent it to measure, and it re-inserts relative to ELEMENT siblings only — the tally's
  `<b>` landed after its text node ("of 214 214"). reset() now sets `data-anim` BEFORE any
  clearProps.
- **Capture intake (new signature):** `.cap-intake` band in `.cap-grid` — three gpt-image
  receipt cutouts (`receipt-{cafe,kitcho,taxi}.png`, transparent PNGs alpha-hardened via
  Pillow: threshold ≥200, MinFilter(5) erode, 1px blur; legible text regions blurred
  RGB-only inside the silhouette) ride the current in from the left, dive into an ink slot
  (LandingBird + "Inbox · sample"), a scan strip sweeps, and each resolves into a mono
  matched row (canonical numbers: $28.40 / ¥14,200→$95.62 / ¥3,200→$21.55). Settled truth =
  rows filed, no paper. Desktop ≥981px + motion only; mobile hides `.ci-stage`.
- **Warm paper day body (homepage only — `.lp-home` on page.tsx's main; /demo + /pricing
  keep cool white):** --paper-0/1/2/3 → #fdfbf4/#fbf8ef/#f6f1e4/#efe9d9 (ink-warm 15.4:1 on
  the band), feTurbulence grain baked at 0.028 opacity as a background LAYER (band +
  wash ::before stack — no new elements, no fixed overlay), sky radial warmed, bn-wash-sky
  nudged. Paper texture returns (v4 retired a heavier one) at Ben's explicit request.
- **Ambient budget of three, all paused offscreen** via `ambient()` in motion.tsx
  (ScrollTrigger onToggle; wisps stay causal-only): interlude img breathes scale 1.035/22s,
  nf-glow breathes scaleY 1.045/16s rooted at the horizon, su-live dot pulses via CSS
  keyframes gated by `.is-live` (+ reduced-motion `animation: none`).
- **Hero perf:** brightness/saturate baked INTO aurora-hero.jpg with Pillow (CSS filter
  deleted; original backed up in session scratchpad), force3D on all scrubbed tweens.
  Replay measured at 0 frames >17ms (409 frames, avg 8.3ms, 120Hz).
- **Footer planet anchored:** `.ftr-planet` gets `mix-blend-mode: screen` (black field →
  transparent over --night; blend MUST stay on the transformed element itself — a transform
  on .ar-footer/.night-frame or moving the blend to the img isolates the group and the black
  rectangle returns), top-fade mask, height clamp 220→480px (arc apex is always 10vw under
  bottom-anchored cover — only the cap mattered), © reserve updated in lockstep.
- Reveal gaps: `.ar-sub` in capture/booking/setup/record + `.bn-sample` now rise with their
  heads.

---

# Landing — v4.1 "Life pass" (2026-07-06, same day as v4)

Ben's follow-up brief: more life (middle was image-less), tighter/meaning-first animation,
kill the AI-looking capture photos, fix footer cohesion. Design doc:
`docs/superpowers/specs/2026-07-06-landing-life-pass-design.md`. What changed on top of v4:

- **Imagery doctrine: photos carry atmosphere, DOM carries claims.** Capture vignettes
  regenerated as documentary photography (real terminal on a café counter; receipt + face-down
  phone still life — no hands, no screens rendering UI, no legible micro-text); each gets a
  crisp DOM `.cap-chip` with the product moment. New: `booking-wing.jpg` + `record-paper.jpg`
  as `.ev-backplate` photos behind the app-frame / decision record (photo-under-UI, ±5%
  scrub), and `interlude.jpg` — a full-bleed ~56vh photographic exhale between setup and
  bento, the traveler's own viewport ("Your people are already at the gate. The paperwork
  never boards."). `planet.jpg` KEPT (Ben likes it); og card rewritten to Night Air + exact pillar.
- **Wind fixed:** gust now LEADS the rows (streamlines 0.4s/1.0s power1.out, departures 0.8s),
  rows exit THROUGH the glass (`[data-anim] .wq-before { overflow: visible }`, x:460),
  visibility-gated at 2.1s (snaps to truth if off-screen), and a mono `.wq-replay` button
  ("run it again — same 214, same 3") makes determinism poke-able.
- **Every section has one causal gesture:** capture = wisp delivers + photo settles + chip
  lands + dot pops; booking = takeoff 1.25s power1.inOut, verdicts pop as the flight
  completes; setup = ONE timeline where the linear green line causes steps/node-fills/pill
  (static truth = all settled; JS adds `.su-wait` and rewinds); bento = report rows file in +
  approval chain draws (small cells stay still); record = seal stamps (back.out) — wording
  now "on record" (diligence-safe, nothing is cryptographically signed).
- **Motion hygiene:** trigger tiers in gsap.ts (START_HEADING/GROUP/STAGE), SplitText
  `autoSplit` everywhere, will-change cleared after settle, `RiseGroup` grew a `selector`
  prop (lists stagger as items, not slabs), Counter/GUST deleted, station rail SHIPPED
  (quiet mono above eyebrows: book/capture/enforce/record lit per section).
- **One night frame:** close + footer wrapped in `.night-frame` with a single `.nf-glow`
  anchored at the planet; footer grid now 1.5/0.9/0.9/0.7 (brand+trust line / Product /
  Company incl. mailto / Legal), aria-labels match headings, © line drops the duplicated
  slogan, planet is a controlled-height band (cover, bottom-anchored, rises 16%→0 on scrub).
- **Credibility trims:** Hyatt labeled per-night everywhere ($352.86/night under the $400
  cap), record band gained the "You stay in control" row (4 verbatim-true statements),
  capture proof line now includes the traveler's job description.

---

# Landing — v4 "Night Air, Lit" (2026-07-06)

Full rework per Ben's brief (wind signature, Plaid-caliber, exact pillar phrase), revised
same-day per Ben's live feedback: night aurora hero RETURNED, photographic capture imagery,
booking inside Sylph app chrome + plane takeoff, bento of real product features, quiet color
washes. Supersedes v3 "Proof Under Glass" (snapshotted at commit cfbb960 on `landing-rework`).
Working notes + decisions log: `/Users/benfaib/Sylph/.claude/notes/landing-rework.md`.

## System

- **Palette:** white only; slate-green ink family (`--ink-warm #101b16`); ONE vibrant green
  `--green #0ecc83` spent exclusively on wind/cleared/in-policy moments (+ the close's aurora
  button at night). Green text on white uses `--green-deep #0a7c53` (AA). Exceptions stay
  NEUTRAL slate — green never marks "needs review".
- **Legacy token names preserved as aliases** (`--pine*`, `--paper*`, `--night`, `--moon`,
  `--aurora`) so the LEAD PAGES block and /demo + /pricing keep working untouched.
- **Type:** Newsreader (display serif, italic accents) + Hanken Grotesk (body/UI) +
  IBM Plex Mono (evidence: amounts, rules, timestamps). Loaded via `fonts.ts`
  (`landingFonts`), only on .sylph-lp routes.
- **Buttons:** `.btn-primary` = ink solid (calm, Plaid-like). `.btn-aurora` (green) exists
  ONLY in the night close. Green is never button chrome on white.

## Page order

1. **Hero (night, aurora-hero.jpg)** — H1 exact pillar: "Stop reviewing expenses. Start
   reviewing exceptions." Signature wind on the dark glass queue: rows SHIVER (anticipation),
   layered aurora streamlines sweep (wide faint body + bright core pairs, travelling dash),
   six compliant rows carried off on rising arcs, tally 214 → 3, three exceptions settle,
   "211 cleared themselves. The wind took the rest."
   - Two-layer truth: `.wq` in-flow = settled state (no-JS/reduced-motion/mobile truth);
     `.wq-before` absolute GLASS overlay exists only under `[data-anim]` (JS, desktop ≥981px,
     motion-ok). JS hides the truth card while the translucent overlay animates and
     crossfades back. Measurements at play time (delayedCall 2.6s) so webfonts are settled.
2. **Capture (white + wash)** — differentiators 2+3: terminal-direct (Toast as example, any
   provider) + text-it-in. Photographic gpt-image vignettes: `capture-terminal.jpg`,
   `capture-text.jpg` (palette-locked prompts, finals at high quality).
3. **Booking (soft band)** — differentiator 1: policy-aware booking INSIDE Sylph — app-frame
   chrome (bird + Sylph topbar + M. Chen chip) around the fare list; plane takeoff line draws
   on scroll-in (static truth = completed flight). Green "In policy" marks, one neutral
   "Needs approval · FLT-02".
4. **Setup (white + wash)** — differentiator 4: 15-minute timeline 0:00 → 0:12 → 0:15; green
   progress hairline animates once.
5. **Bento "Inside Sylph" (white)** — six real product cells: auto-created reports, approval
   levels, audit trail, one itinerary, hotels in policy, FX at transaction-date rate. Quiet
   green/sky/sand washes = the color Ben asked back in.
6. **Record (soft band)** — trust: deterministic / cited / replayable + signed decision
   record card (SST numbers).
7. **Close (night)** — pure CSS aurora glow rising from below (no image; the hero owns the
   aurora asset again). Slogan + aurora CTA.
8. **Footer (night)** — regenerated hi-res planet (`planet.jpg`, 3840×1280, gpt-image-2)
   rising along the bottom.

## The sample close (single source of truth for every number on the page)

- Close · sample. **214 in · 211 cleared themselves · 3 need review.**
- Trip: M. Chen · ANA SFO → KIX · May 12–17 · card ·1142. FX May 14: USD/JPY 148.50.
- Rows: ANA $980.00 ✓ · Hyatt Osaka ¥52,400 → $352.86 ✓ · MK Taxi ¥3,200 → $21.55 ✓ ·
  **Kitcho ¥14,200 → $95.62 MEAL-03 exception** (dinner over cap).
- Other exceptions: Team dinner ×6 $612.00 MEAL-01 (not itemized, R. Alvarez);
  Delta seat upgrade $780.00 FLT-02 (above cabin, J. Park).
- Record: Line 118 · Kitcho · MEAL-03 · exception approved · L. Marsh · May 21 ·
  ¥14,200 → $95.62 · rate May 14 · replayable.
- Filler compliant rows in the hero pile (new in v4, sample-labeled): Uber SFO $34.12,
  Marriott Chicago $418.75, Coffee SFO T2 $6.80.

## Motion doctrine (unchanged from v3)

GSAP expo.out reveals; wind departures on power2.in (EASE_GUST); transform/opacity only
(one contained height tween on the absolute hero overlay — no page layout impact); CSS
default = truthful settled state, JS owns the "before"; reduced-motion/mobile = static
truth; will-change set by JS at play time, cleared on complete.

## Removed in v4

paper-fiber texture (paper motif retired) · travel-sky.jpg · aurora-close.jpg (replaced by
planet.jpg) · match/console/travel sections · CostSection (GBTA stats band dropped for calm —
flagged to Ben) · night/paper material alternation · Satoshi/Fraunces voice.
