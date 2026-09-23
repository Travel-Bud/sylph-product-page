import type { CSSProperties, ReactNode } from "react";

/* Small shared pieces of the comic: the Sample data chip, a tick, caption boxes, balloons and sound
   effects. Captions and balloons carry data-cap so the director can letter them in after a panel opens. */

export function Sample() {
  return <span className="cx-sample">Sample data</span>;
}

export function Tick() {
  return (
    <svg className="cx-tick" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8.5l3.2 3L13 4.5" />
    </svg>
  );
}

type At = "tl" | "tr" | "bl" | "br" | "bc";

/** A narration box, with an optional time slate on its top edge. */
export function Cap({ at, slate, children, style }: { at: At; slate?: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <div className={`cx-cap cx-at-${at}`} data-cap style={style}>
      {slate && <span className="cx-slate">{slate}</span>}
      <p>{children}</p>
    </div>
  );
}

/** A speech balloon; `tail` says which corner the tail leaves from. Placed by --l/--t (--ml/--mt on the strip). */
export function Balloon({ tail, children, style, who }: { tail: "bl" | "br" | "tl"; children: ReactNode; style: CSSProperties; who: string }) {
  return (
    <p className={`cx-balloon cx-tail-${tail}`} data-cap style={style}>
      <span className="cx-vh">{who}: </span>
      {children}
    </p>
  );
}

/** A lettered sound effect. Decorative: the panel's caption already says what happened. */
export function Sfx({ children, style, late }: { children: ReactNode; style: CSSProperties; late?: string }) {
  return (
    <span className="cx-sfx" data-sfx={late ? undefined : ""} data-sfx-late={late} data-t={typeof children === "string" ? children : undefined} style={style} aria-hidden="true">
      {children}
    </span>
  );
}
