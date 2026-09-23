# Landing sounds

Six short sounds for `/`, one per slot, played by `src/components/custom/v2-sides/sound.ts`. Sound is off by default, and it plays only in answer to a visitor's click, tap or key press on a control. `/v2/sounds` auditions alternatives, and a pick saved there replaces a slot's file in that browser.

## Shipped (`<slot>.webm`, Opus 24 kbps, with an `.mp3` fallback at 48 kbps)

| Slot | Source and licence | Length | Loudness |
|---|---|---|---|
| `tap` | SFXMint `ui-click-30.mp3` (sfxmint.com), CC0, no attribution required | 42 ms | -22.0 LUFS, peak -9.1 dBFS |
| `send` | SFXMint `ui-click-12.mp3` (sfxmint.com), CC0, no attribution required | 224 ms | -24.0 LUFS, peak -3.9 dBFS |
| `approve` | Kenney Interface Sounds 1.0, `Audio/switch_006.ogg` (kenney.nl), CC0 | 147 ms | -24.0 LUFS, peak -5.5 dBFS |
| `stamp` | SFXMint `ui-click-25.mp3` (sfxmint.com), CC0, no attribution required | 261 ms | -24.0 LUFS, peak -4.4 dBFS |
| `toggle` | Kenney Interface Sounds 1.0, `Audio/switch_007.ogg` (kenney.nl), CC0 | 147 ms | -24.0 LUFS, peak -6.4 dBFS |
| `land` | SFXMint `ui-click-14.mp3` (sfxmint.com), CC0, no attribution required | 139 ms | -24.0 LUFS, peak -3.8 dBFS |

## Audition set (`audition/`)

These are the shortlisted candidates, processed the same way. The `el-*` files are the round 5 ElevenLabs sounds, kept for comparison only.

| File | Source and licence |
|---|---|
| `el-card` | ElevenLabs sound effects, generated 2026-09-22 on Janus Labs' paid plan (commercial use); round 5 `card` |
| `el-click` | ElevenLabs sound effects, generated 2026-09-22 on Janus Labs' paid plan (commercial use); round 5 `click` |
| `el-stamp` | ElevenLabs sound effects, generated 2026-09-22 on Janus Labs' paid plan (commercial use); round 5 `stamp` |
| `el-tick` | ElevenLabs sound effects, generated 2026-09-22 on Janus Labs' paid plan (commercial use); round 5 `tick` |
| `k-click_001` | Kenney Interface Sounds 1.0, `Audio/click_001.ogg` (kenney.nl), CC0 |
| `k-click_002` | Kenney Interface Sounds 1.0, `Audio/click_002.ogg` (kenney.nl), CC0 |
| `k-click_005` | Kenney Interface Sounds 1.0, `Audio/click_005.ogg` (kenney.nl), CC0 |
| `k-select_001` | Kenney Interface Sounds 1.0, `Audio/select_001.ogg` (kenney.nl), CC0 |
| `k-select_002` | Kenney Interface Sounds 1.0, `Audio/select_002.ogg` (kenney.nl), CC0 |
| `k-switch_002` | Kenney Interface Sounds 1.0, `Audio/switch_002.ogg` (kenney.nl), CC0 |
| `k-switch_004` | Kenney Interface Sounds 1.0, `Audio/switch_004.ogg` (kenney.nl), CC0 |
| `k-switch_006` | Kenney Interface Sounds 1.0, `Audio/switch_006.ogg` (kenney.nl), CC0 |
| `k-switch_007` | Kenney Interface Sounds 1.0, `Audio/switch_007.ogg` (kenney.nl), CC0 |
| `m-ui-click-03` | SFXMint `ui-click-03.mp3` (sfxmint.com), CC0, no attribution required |
| `m-ui-click-06` | SFXMint `ui-click-06.mp3` (sfxmint.com), CC0, no attribution required |
| `m-ui-click-08` | SFXMint `ui-click-08.mp3` (sfxmint.com), CC0, no attribution required |
| `m-ui-click-10` | SFXMint `ui-click-10.mp3` (sfxmint.com), CC0, no attribution required |
| `m-ui-click-11` | SFXMint `ui-click-11.mp3` (sfxmint.com), CC0, no attribution required |
| `m-ui-click-12` | SFXMint `ui-click-12.mp3` (sfxmint.com), CC0, no attribution required |
| `m-ui-click-14` | SFXMint `ui-click-14.mp3` (sfxmint.com), CC0, no attribution required |
| `m-ui-click-18` | SFXMint `ui-click-18.mp3` (sfxmint.com), CC0, no attribution required |
| `m-ui-click-21` | SFXMint `ui-click-21.mp3` (sfxmint.com), CC0, no attribution required |
| `m-ui-click-23` | SFXMint `ui-click-23.mp3` (sfxmint.com), CC0, no attribution required |
| `m-ui-click-24` | SFXMint `ui-click-24.mp3` (sfxmint.com), CC0, no attribution required |
| `m-ui-click-25` | SFXMint `ui-click-25.mp3` (sfxmint.com), CC0, no attribution required |
| `m-ui-click-27` | SFXMint `ui-click-27.mp3` (sfxmint.com), CC0, no attribution required |
| `m-ui-click-28` | SFXMint `ui-click-28.mp3` (sfxmint.com), CC0, no attribution required |
| `m-ui-click-29` | SFXMint `ui-click-29.mp3` (sfxmint.com), CC0, no attribution required |
| `m-ui-click-30` | SFXMint `ui-click-30.mp3` (sfxmint.com), CC0, no attribution required |

## Licences

- **Kenney "Interface Sounds" 1.0:** Creative Commons Zero (CC0), per the pack's `License.txt` (creativecommons.org/publicdomain/zero/1.0). Crediting kenney.nl is welcome but not required.
- **SFXMint:** CC0, with no attribution required, as stated on every page of sfxmint.com.
- **ElevenLabs:** generated output on a paid plan, commercial use permitted.

## Processing

1. **Measure.** Each of the 142 library files was scored on attack, decay to -30 dB, spectral centroid, tonality and event count, then checked by spectrogram. Tonal beeps, water-drop blips and ratchets were cut.
2. **Trim.** Each keeper was trimmed to its first event. A switch's release, up to 160 ms later, stays in.
3. **Shape.** A highpass at 70 Hz. The SFXMint recordings got a lowpass at 6 kHz and +2 dB at 250 Hz for warmth; the Kenney files a lowpass at 8.5 kHz. Then a 1 ms fade in and a short fade out.
4. **Normalise.** Loudness is measured on the clip looped to 3 s, because gating ignores anything under 400 ms. Clicks of 90 ms or less go to -22 LUFS; longer sounds to -24 LUFS. A limiter holds peaks at -3 dBFS.
