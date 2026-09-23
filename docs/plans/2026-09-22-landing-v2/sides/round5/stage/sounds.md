# Listening sheet (round 5b, stage)

**Audition:** http://localhost:3200/v2/sounds (noindex). Every candidate has a play button and a number key (1 to 8 for the active slot; up and down arrows change slot). "Use this" saves a pick in this browser, and the landing uses it straight away: go to `/`, turn sound on with the nav speaker, and click. "Export picks" prints the choices as text to paste back.

The click-only rule in `sound.ts` is unchanged. Nothing sounds on scroll, on the courier, on timers or when an animation ends.

| Slot | Plays on | Default | Length | Loudness | Why this one |
|---|---|---|---|---|---|
| tap | tabs and pickers (receipt ways, answers, Your month filters) | SFXMint ui-click-30 | 42 ms | -22 LUFS | a single clean recorded click, no ring, the shortest of the real clicks |
| send | a receipt tapped in the hero's phone | SFXMint ui-click-12 | 224 ms | -24 LUFS | the warmest real click, with a little body behind the hit, so the hero tap feels like a press |
| approve | Dana's Approve and Return | Kenney switch_006 | 147 ms | -24 LUFS | a press and release about 106 ms apart, warm (1.7 kHz), which reads as a decision |
| stamp | approving the compiled policy | SFXMint ui-click-25 | 261 ms | -24 LUFS | a low, woody knock (centroid 1.4 kHz), the closest thing to a stamp without a thud sample |
| toggle | the sound switch in the nav | Kenney switch_007 | 147 ms | -24 LUFS | the warmest press-and-release switch (1.6 kHz) |
| land | the hero's charge landing, booked from the receipt click | SFXMint ui-click-14 | 139 ms | -24 LUFS | a soft two-part click, played at 0.8 gain |

`swish` (Your month re-runs and rule changes that move verdicts) now uses the send file.

Every play varies slightly, by ±4% pitch and 86 to 100% gain. Loudness is measured on the clip looped to 3 s; clicks of 90 ms or less sit at -22 LUFS so they don't read quieter than the longer sounds.

**Headless check.** All 47 audition buttons were clicked with real (CDP) mouse events. All 47 decoded and started an AudioBufferSource, with 0 failures and a clean console. A saved pick (tap set to ui-click-27) made the landing fetch `audition/m-ui-click-27.webm` once sound was switched on.

**Shortlist method.** 142 files were scored on attack, decay to -30 dB, spectral centroid, tonality and event count, then checked by spectrogram (`sfx/*.png` in the scratchpad). Kenney's tonal "confirmation", "drop" and "glass" blips, the "back" ratchets, and SFXMint's synthetic `ready-*` beeps were excluded.
