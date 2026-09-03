import Image from "next/image";

export type ObjName = "policy" | "receipt" | "envelope" | "phone" | "tray" | "boarding-pass" | "card" | "terminal" | "report";

/**
 * One of the nine rendered objects (public/site/objects, transparent WebP).
 * Decorative: always aria-hidden, sized by its slot, never carries a claim.
 */
export function Obj({
  name,
  size = 140,
  className = "",
  priority = false,
}: {
  name: ObjName;
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <span className={`obj ${className}`} style={{ width: size, height: size }} aria-hidden="true">
      <Image
        src={`/site/objects/${name}.webp`}
        alt=""
        fill
        sizes={`${size}px`}
        priority={priority}
        style={{ objectFit: "contain" }}
        draggable={false}
      />
    </span>
  );
}
