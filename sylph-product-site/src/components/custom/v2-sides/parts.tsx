import type { Verdict } from "./data";
import { VERDICT_LABEL } from "./data";

export type Side = "priya" | "dana";
export { Figure, Head, type CastName } from "./cast";
import { Head } from "./cast";

/** Who this side belongs to: a head, a name, a role. */
export function Person({ side, name, role, size = 44 }: { side: Side; name: string; role: string; size?: number }) {
  return (
    <span className={`v2s-person v2s-person--${side}`}>
      <Head who={side} size={size} />
      <span className="v2s-person-txt">
        <strong>{name}</strong>
        <span>{role}</span>
      </span>
    </span>
  );
}

const TAG: Record<Side | "both", string> = { priya: "Priya’s side", dana: "Dana’s side", both: "Both sides" };

export function SideTag({ side }: { side: Side | "both" }) {
  return (
    <span className={`v2s-sidetag v2s-sidetag--${side}`}>
      <i aria-hidden="true" />
      {TAG[side]}
    </span>
  );
}

export function Sample() {
  return <span className="v2s-sample">Sample data</span>;
}

export function VerdictChip({ v }: { v: Verdict }) {
  return <span className={`v2s-chip v2s-chip--${v}`}>{VERDICT_LABEL[v]}</span>;
}

export function Tick({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8.5l3.2 3L13 4.5" />
    </svg>
  );
}

/**
 * The charge that travels the page. Each chapter shows it once, on the side that holds it,
 * with what just happened to it.
 */
export function Token({ state, tone = "note", step }: { state: string; tone?: "note" | "ok"; step: number }) {
  return (
    <p className={`v2s-token-line v2s-token-line--${tone}`} data-rv>
      <span className="v2s-token-step mono">{step}/5</span>
      {/* courier contract: the courier layer flies the charge between these stops (0 is the hero's) */}
      <span className="v2s-token-pill" data-courier-stop={step}>
        <span className="v2s-token-m">Sushi Kanda</span>
        <span className="mono">$84.20</span>
      </span>
      <span className="v2s-token-state">{state}</span>
    </p>
  );
}
