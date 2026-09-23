import type { CSSProperties, ReactNode } from "react";

/* The receipt's printing vocabulary. Server-safe: no hooks. Anything with the class rcp-ln is "printed":
   the controller (printer.tsx) develops it as it leaves the print head. */

/** One band of the strip: paper in the middle, the world in the margins. `inline` is what the world
    looks like when there are no margins (under 1100px): laid on the paper instead. */
export function Row({
  children,
  l,
  r,
  inline,
  inlineEnd,
  className = "",
  id,
  style,
}: {
  children?: ReactNode;
  l?: ReactNode;
  r?: ReactNode;
  inline?: ReactNode;
  /** lay the inline world after the paper's text instead of before it */
  inlineEnd?: boolean;
  className?: string;
  id?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`rcp-row ${className}`} id={id} style={style}>
      <div className="rcp-side rcp-side--l">{l}</div>
      <div className="rcp-c">
        {inline && !inlineEnd ? <div className="rcp-inline">{inline}</div> : null}
        {children}
        {inline && inlineEnd ? <div className="rcp-inline">{inline}</div> : null}
      </div>
      <div className="rcp-side rcp-side--r">{r}</div>
    </div>
  );
}

/** A reverse-printed bar, the way a thermal head prints a heading: white on black, full width. */
export function Bar({ when, what }: { when: string; what: string }) {
  return (
    <h2 className="rcp-bar rcp-ln">
      <span className="rcp-bar-when">{when}</span>
      <span className="rcp-bar-what">{what}</span>
    </h2>
  );
}

/** A dotted-leader line: key on the left, value on the right. */
export function KV({ k, v, className = "" }: { k: ReactNode; v: ReactNode; className?: string }) {
  return (
    <div className={`rcp-kv rcp-ln ${className}`}>
      <span className="rcp-kv-k">{k}</span>
      <span className="rcp-kv-dots" aria-hidden="true" />
      <span className="rcp-kv-v">{v}</span>
    </div>
  );
}

const RULE_CHAR = { dash: "-", double: "=", star: "*" } as const;
/** A printed rule, made of the characters a receipt makes it of. */
export function Rule({ kind = "dash", label }: { kind?: keyof typeof RULE_CHAR; label?: string }) {
  const c = RULE_CHAR[kind];
  const run = (kind === "star" ? `${c} ` : c).repeat(kind === "star" ? 40 : 90);
  return (
    <div className={`rcp-rule rcp-rule--${kind} rcp-ln`} aria-hidden="true">
      {label ? (
        <>
          <span className="rcp-rule-run">{run}</span>
          <span className="rcp-rule-label">{label}</span>
          <span className="rcp-rule-run">{run}</span>
        </>
      ) : (
        <span className="rcp-rule-run">{run}</span>
      )}
    </div>
  );
}

export function Chip({ className = "" }: { className?: string }) {
  return <span className={`rcp-chip ${className}`}>Sample data</span>;
}

export type Tone = "ink" | "amber" | "green" | "ox";
/** A rubber stamp. Lands when its cue is reached (data-cue), or when a click lands it. */
export function Stamp({
  tone,
  children,
  sub,
  rot = -6,
  className = "",
  cue = 0.62,
  live,
  after,
}: {
  tone: Tone;
  children: ReactNode;
  sub?: ReactNode;
  rot?: number;
  className?: string;
  cue?: number | null;
  live?: boolean;
  /** land when the parent block goes live, after its --delay, instead of on its own cue */
  after?: boolean;
}) {
  return (
    <div
      className={`rcp-stamp rcp-stamp--${tone} ${live ? "is-live" : ""} ${className}`}
      style={{ "--rot": `${rot}deg` } as CSSProperties}
      data-cue={after ? undefined : (cue ?? undefined)}
      data-after={after ? "" : undefined}
    >
      <span className="rcp-stamp-main">{children}</span>
      {sub ? <span className="rcp-stamp-sub">{sub}</span> : null}
    </div>
  );
}

/** Plain printed prose. */
export function P({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`rcp-p rcp-ln ${className}`}>{children}</p>;
}
