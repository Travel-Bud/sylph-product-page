import type { ReactNode } from "react";
import type { Verdict } from "@/components/custom/site/sample-data";
import { VERDICT_LABEL } from "@/components/custom/site/sample-data";

/** A rubber stamp. Tone follows the verdict; `close` is the month-end stamp. */
export function Stamp({
  tone,
  children,
  rot = -4,
  delay = 0,
  className = "",
}: {
  tone: Verdict | "close" | "ink";
  children?: ReactNode;
  rot?: number;
  delay?: number;
  className?: string;
}) {
  const label = children ?? (tone === "close" || tone === "ink" ? null : VERDICT_LABEL[tone]);
  return (
    <span
      className={`lg-stamp lg-stamp--${tone} ${className}`}
      style={{ ["--rot" as string]: `${rot}deg`, ["--d" as string]: `${delay}ms` }}
    >
      {label}
    </span>
  );
}

export function SampleChip() {
  return <span className="lg-chip">Sample data</span>;
}

/** A folio: one ruled page of the book, with its running head. */
export function Folio({
  head,
  folio,
  children,
  className = "",
  sample = true,
}: {
  head: ReactNode;
  folio?: string;
  children: ReactNode;
  className?: string;
  sample?: boolean;
}) {
  return (
    <div className={`lg-folio ${className}`}>
      <div className="lg-folio__head">
        <span className="lg-folio__title">{head}</span>
        <span className="lg-folio__meta">
          {sample ? <SampleChip /> : null}
          {folio ? <span className="lg-folio__no">{folio}</span> : null}
        </span>
      </div>
      {children}
    </div>
  );
}
