import { ImageResponse } from "next/og";

// Social card in the landing's voice: white ground, ink type, the coloured
// phrase, and a sample verdict row. No fabricated metrics. Next wires this
// to both og:image and twitter:image.
export const alt = "Sylph: your expenses close themselves.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#101b16";
const INK_3 = "#5d6761";
const GREEN = "#0ecc83";

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
          background: "#ffffff",
          backgroundImage:
            "radial-gradient(38% 50% at 88% 12%, rgba(74,144,201,0.22) 0%, rgba(74,144,201,0) 70%), radial-gradient(40% 50% at 70% 100%, rgba(14,204,131,0.2) 0%, rgba(14,204,131,0) 70%)",
          color: INK,
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30, fontWeight: 600 }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: GREEN }} />
          Sylph
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 84, fontWeight: 600, lineHeight: 1.0, letterSpacing: -3 }}>
            <span>Your expenses</span>
            <span
              style={{
                backgroundImage: "linear-gradient(94deg, #076044 0%, #0a9a66 46%, #2c6395 100%)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              close themselves.
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
            border: "1px solid rgba(16,27,22,0.14)",
            borderRadius: 14,
            background: "rgba(255,255,255,0.9)",
            fontSize: 24,
          }}
        >
          <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
            <span style={{ fontWeight: 600 }}>Sushi Kanda</span>
            <span style={{ color: INK_3 }}>$84.20</span>
            <span style={{ color: INK_3 }}>Meals</span>
          </div>
          <div style={{ display: "flex", gap: 24, alignItems: "center", color: "#a15c07", fontWeight: 600 }}>
            <span style={{ width: 12, height: 12, borderRadius: 6, background: "#f59e0b" }} />
            Needs a note, M-041, $9.20 over the $75 cap
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
