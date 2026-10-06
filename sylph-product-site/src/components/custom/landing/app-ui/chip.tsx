import { BadgeCheck, BedDouble, Car, CircleDot, OctagonX, Plane, Printer, UtensilsCrossed, Wine } from "lucide-react";
import { VERDICT, type Kind, type Verdict } from "../data";

/** The app's verdict chip: a dot and the verdict, in its status colour. */
export function Chip({ v, children, className = "" }: { v: Verdict | "gray" | "line"; children?: React.ReactNode; className?: string }) {
  return (
    <span className={`ap-chip ap-chip--${v} ${className}`}>
      {v !== "gray" && v !== "line" && <i aria-hidden="true" />}
      {children ?? (v in VERDICT ? VERDICT[v as Verdict] : null)}
    </span>
  );
}

const KIND_ICON = { air: Plane, hotel: BedDouble, meal: UtensilsCrossed, drink: Wine, ground: Car, office: Printer };

/** The category tile the app shows beside a charge. */
export function KindIcon({ kind }: { kind: Kind }) {
  const I = KIND_ICON[kind];
  return (
    <span className="ap-ic" aria-hidden="true">
      <I strokeWidth={1.75} />
    </span>
  );
}

const TAG_ICON = { ok: BadgeCheck, note: CircleDot, block: OctagonX };

/** The app's status tag: a glyph and the word, no pill ("In policy", "Needs a note", "Blocked"). */
export function StatusTag({ v, children }: { v: Verdict; children?: React.ReactNode }) {
  const I = TAG_ICON[v];
  return (
    <span className={`ap-tag ap-tag--${v}`}>
      <I strokeWidth={2} aria-hidden="true" />
      {children ?? VERDICT[v]}
    </span>
  );
}
