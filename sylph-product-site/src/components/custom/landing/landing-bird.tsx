import {
  SYLPH_BIRD_VIEWBOX,
  SYLPH_BIRD_PATH,
} from "@/components/custom/sylph-identity/sylph-bird-path";

/**
 * The real Sylph bird mark, rendered with `currentColor` so it can sit
 * paper-on-pine inside the brand / PDF tiles on the landing page.
 */
export function LandingBird({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox={SYLPH_BIRD_VIEWBOX}
      style={{ width: "1.4rem", height: "1.4rem", display: "block" }}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d={SYLPH_BIRD_PATH} />
    </svg>
  );
}
