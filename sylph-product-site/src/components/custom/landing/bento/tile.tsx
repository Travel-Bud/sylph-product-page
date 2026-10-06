"use client";

/* One bento tile: a short title, one line and the working piece. `used` marks that the visitor has used the piece,
   which stops its idle cue (landing.css, [data-used]). */
export function Tile({
  id,
  className,
  title,
  line,
  used,
  children,
}: {
  id: string;
  className: string;
  title: string;
  line: string;
  used: boolean;
  children: React.ReactNode;
}) {
  return (
    <article className={`lp-tile ${className}`} aria-labelledby={`${id}-t`} data-used={used || undefined} data-rv>
      <div className="lp-tile-head">
        <h3 id={`${id}-t`}>{title}</h3>
        <p>{line}</p>
      </div>
      <div className="lp-tile-stage">{children}</div>
    </article>
  );
}
