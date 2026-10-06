import { Bird } from "./bird";

/* The small mono label above a section heading, led by the Sylph bird (Ben, 2026-10-06: the bird replaces the dot). */
export function Kicker({ night = false, children }: { night?: boolean; children: React.ReactNode }) {
  return (
    <p className={night ? "lp-kick lp-kick--night" : "lp-kick"}>
      <Bird className="lp-kick-bird" />
      {children}
    </p>
  );
}
