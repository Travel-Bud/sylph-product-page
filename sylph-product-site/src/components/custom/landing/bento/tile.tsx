"use client";

import { useCoarsePointer } from "../hooks";

/* One bento tile: a short title, one line, the working piece, and an idle hint that names the gesture
   ("Drag the receipt" with a mouse, "Tap the receipt" on a phone) until the visitor has used it. */
export function Tile({
  id,
  className,
  title,
  line,
  hint,
  touchHint,
  used,
  children,
}: {
  id: string;
  className: string;
  title: string;
  line: string;
  hint: string;
  touchHint?: string;
  used: boolean;
  children: React.ReactNode;
}) {
  const coarse = useCoarsePointer();
  return (
    <article className={`lp-tile ${className}`} aria-labelledby={`${id}-t`} data-used={used || undefined}>
      <div className="lp-tile-head">
        <h3 id={`${id}-t`}>{title}</h3>
        <p>{line}</p>
      </div>
      <div className="lp-tile-stage">{children}</div>
      <p className={`lp-hint${used ? " is-used" : ""}`} aria-hidden="true">
        <i />
        {coarse && touchHint ? touchHint : hint}
      </p>
    </article>
  );
}
