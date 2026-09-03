import { SYLPH_BIRD_PATH, SYLPH_BIRD_VIEWBOX } from "@/components/custom/sylph-identity/sylph-bird-path";

/** The Sylph bird in currentColor, for the nav and footer wordmarks. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox={SYLPH_BIRD_VIEWBOX} fill="currentColor" aria-hidden="true" focusable="false">
      <path d={SYLPH_BIRD_PATH} />
    </svg>
  );
}
