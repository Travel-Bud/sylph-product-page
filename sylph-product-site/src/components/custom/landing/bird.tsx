import { SYLPH_BIRD_PATH } from "@/components/custom/sylph-identity/sylph-bird-path";

/** The Sylph bird in currentColor, cropped to the drawing (the shared path's viewBox carries padding). */
export function Bird({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="195 180 688 631" fill="currentColor" aria-hidden="true" focusable="false">
      <path d={SYLPH_BIRD_PATH} />
    </svg>
  );
}
