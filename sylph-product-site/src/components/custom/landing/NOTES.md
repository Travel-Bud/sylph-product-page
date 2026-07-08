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
