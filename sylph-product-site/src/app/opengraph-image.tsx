import { ImageResponse } from "next/og";

// Honest social card in the landing's own Night Air voice: brand + the
// verbatim pillar + the pipeline. No fabricated data, no metrics.
// Next auto-wires this to both og:image and twitter:image so shared links
// render the same night the page opens on.
export const alt = "Sylph: Stop reviewing expenses. Start reviewing exceptions.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NIGHT = "#0a1410";
const MOON = "#f4f7f5";
const MOON_DIM = "rgba(244, 247, 245, 0.62)";
const AURORA = "#2ede97";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: NIGHT,
          backgroundImage: `radial-gradient(85% 60% at 78% 118%, rgba(46,222,151,0.32) 0%, rgba(46,222,151,0.10) 45%, rgba(46,222,151,0) 75%)`,
          color: MOON,
          padding: "70px 76px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: "rgba(244,247,245,0.12)",
              color: AURORA,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
            }}
          >
            ~
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.5 }}>Sylph</div>
          <div style={{ fontSize: 15, color: MOON_DIM, letterSpacing: 4, marginLeft: 8 }}>
            CORPORATE TRAVEL &amp; EXPENSE
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>
            Stop reviewing expenses.
          </div>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, color: AURORA }}>
            Start reviewing exceptions.
          </div>
          <div style={{ fontSize: 27, color: MOON_DIM, marginTop: 30, maxWidth: 940, lineHeight: 1.4 }}>
            Booking inside your policy, receipts that arrive on their own, and a cited,
            replayable verdict on every charge. Configured in 15 minutes.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 21,
            color: MOON_DIM,
          }}
        >
          <div>Expenses run on air.</div>
          <div style={{ fontFamily: "monospace", color: AURORA }}>
            book &gt; capture &gt; match &gt; enforce &gt; record
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
