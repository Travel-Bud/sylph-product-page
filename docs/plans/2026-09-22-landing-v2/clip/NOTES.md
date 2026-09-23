# The clip (round 4, item 4)

One cut, 10.5 s at 30 fps, silent, in two framings. It is built from the landing's own tokens, Familjen and Martian Mono, the clay cast and the Sylph bird, so it reads as the page in motion.

| t (s) | beat | on screen |
|---|---|---|
| 0.0 | snap | Priya, "Priya texts a photo of the receipt.", the Sushi Kanda photo sends with a flash |
| 1.2 | verdict | "Sylph answers with the rule.", matched pill, Needs a note, M-041 cite types on, her note |
| 3.2 | carry | the bird lifts the pill and the camera pans across the ink seam to Dana's side |
| 4.9 | exception | the pill lands in Dana's queue (Needs you 1, 4 filed themselves), she taps Approve |
| 6.4 | month end | deep green rises, the bird goes once around and sets the pill on line 3 of the September report, 895.65, Closed Sep 30 |
| 8.8 | card | the bird flies to centre and becomes the mark: "Expenses run on air.", sylph-product.com, Priya and Dana together |

## Files

- `sylph-product-site/public/site/clip/`: `sylph-clip-4x5.{mp4,webm}` (1080x1350), `sylph-clip-16x9.{mp4,webm}` (1920x1080), a poster JPG for each, `og-sides.jpg` (1200x630).
- Composition: `src/app/v2/clip/` (`page.tsx`, `clip-stage.tsx`, `clip.css`), noindex. `?f=45`, `?f=169` or `?f=og`, and `&play=1` plays it in real time.
- Capture: `scripts/clip/render.mjs` steps `window.__clipSeek(t)` over CDP and saves PNG frames. Every style is a pure function of t, so renders are deterministic and do not depend on wall-clock time.

## Rebuild

```
node scripts/clip/render.mjs '{"f":"45","out":"/tmp/f45"}'
ffmpeg -framerate 30 -i /tmp/f45/f%04d.png -c:v libx264 -preset slow -crf 19 -tune animation -pix_fmt yuv420p -movflags +faststart public/site/clip/sylph-clip-4x5.mp4
ffmpeg -framerate 30 -i /tmp/f45/f%04d.png -c:v libvpx-vp9 -crf 31 -b:v 0 -row-mt 1 -pix_fmt yuv420p public/site/clip/sylph-clip-4x5.webm
node scripts/clip/render.mjs '{"f":"og","out":"/tmp/og"}'
```

## Evidence

`contact-4x5.jpg` and `contact-16x9.jpg` are frames pulled from the encoded MP4s. I measured frame-to-frame luma difference (the method in `sylph-promo-video/docs/creative/PACING.md`). The longest still spans are about 0.3 s (after the verdict, and before Dana taps Approve) plus the 0.5 s hold on the end card.

Cost: $0. No generated video or images.
