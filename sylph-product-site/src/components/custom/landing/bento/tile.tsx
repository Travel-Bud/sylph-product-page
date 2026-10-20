"use client";

/* One bento tile: a short title and the working piece. `used` marks that the visitor has used the piece,
   which stops its idle cue (landing.css, [data-used]). */
export function Tile({
  id,
  className,
  title,
  used,
  children,
}: {
  id: string;
  className: string;
  title: string;
  used: boolean;
  children: React.ReactNode;
}) {
  return (
    <article className={`lp-tile ${className}`} aria-labelledby={`${id}-t`} data-used={used || undefined} data-rv>
      <div className="lp-tile-head">
        <h3 id={`${id}-t`}>{title}</h3>
      </div>
      <div className="lp-tile-stage">{children}</div>
    </article>
  );
}
