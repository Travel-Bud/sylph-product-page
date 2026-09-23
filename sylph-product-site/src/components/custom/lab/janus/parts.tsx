import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { Mark } from "@/components/custom/site/mark";
import { VERDICT_LABEL, type Verdict } from "@/components/custom/site/sample-data";

/*
 * Two faces: the building blocks. A Beat is one shared moment: Priya's half and Dana's half, in
 * that DOM order, so a screen reader hears the pair together. Anything that straddles the seam
 * (the headline, the clock, the report) is written once and drawn in both halves, each copy cut
 * by its own half's edge: whole only while the two faces line up. The second copy is hidden
 * from assistive tech and inert.
 */

export type Face = "p" | "d";

type Vars = CSSProperties & Record<`--${string}`, string | number>;

export function Beat({
  i,
  id,
  label,
  p,
  d,
  seam,
  className = "",
  meet = false,
}: {
  i: number;
  id: string;
  label: string;
  p: ReactNode;
  d: ReactNode;
  seam?: ReactNode;
  className?: string;
  meet?: boolean;
}) {
  return (
    <article className={`jn-beat ${className}`} id={id} aria-label={label} data-beat={i} data-meet={meet || undefined}>
      <div className="jn-half jn-half--p" data-half="p" data-i={i}>
        {meet && <span className="jn-flood" aria-hidden="true" />}
        {p}
        {seam && <div className="jn-seam jn-seam--p">{seam}</div>}
      </div>
      <div className="jn-half jn-half--d" data-half="d" data-i={i}>
        {meet && <span className="jn-flood" aria-hidden="true" />}
        {d}
        {seam && (
          <div className="jn-seam jn-seam--d" aria-hidden="true" inert>
            {seam}
          </div>
        )}
      </div>
    </article>
  );
}

/** One thing on the seam. `y` places it on desktop (the seam is vertical); on a phone the seam is
 *  horizontal and `x` places it along it. */
export function Straddle({
  y,
  x = "50%",
  className = "",
  children,
  at,
  until,
}: {
  y: string;
  x?: string;
  className?: string;
  children: ReactNode;
  at?: number;
  until?: number;
}) {
  const style: Vars = { "--sy": y, "--sx": x };
  return (
    <div className={`jn-st ${className}`} style={style} data-at={at} data-until={until}>
      {children}
    </div>
  );
}

/** The shared moment, on the seam: both faces read the same clock. */
export function Clock({ day, time }: { day: string; time: string }) {
  return (
    <Straddle y="var(--clock-y)" x="var(--clock-x)" className="jn-st--clock">
      <span className="jn-clock">
        <span>{day}</span>
        <b>{time}</b>
      </span>
    </Straddle>
  );
}

/** The one charge. `slot` is what the empty berth says before it arrives or after it leaves. */
export function Pill() {
  return (
    <span className="jn-pill">
      <span className="jn-pill-m">Sushi Kanda</span>
      <span className="jn-pill-a">$84.20</span>
    </span>
  );
}

export function Berth({ id, slot, gone = true, className = "" }: { id: string; slot: string; gone?: boolean; className?: string }) {
  /* Server render is the settled end state: a berth the charge left shows its slot, one it
     reached shows the charge. The live stage takes over these classes. */
  return (
    <span className={`jn-berth ${gone ? "is-slot" : ""} ${className}`} data-berth={id}>
      <Pill />
      <span className="jn-berth-slot">{slot}</span>
    </span>
  );
}

const CAST = {
  "priya-snap": [764, 1302],
  "priya-read": [764, 1302],
  "priya-walk": [695, 1125],
  "dana-desk": [938, 931],
  "dana-desk-look": [938, 931],
  "dana-review": [619, 1388],
  "dana-look": [619, 1388],
} as const;
export type Pose = keyof typeof CAST;

/** A person on their own half, standing on its floor. `swap` is the pose they take when the
 *  moment lands (at story time `at`). Decorative: the name and the copy carry the meaning. */
export function Fig({ pose, swap, at, className = "", eager = false }: { pose: Pose; swap?: Pose; at?: number; className?: string; eager?: boolean }) {
  const [w, h] = CAST[pose];
  const style: Vars = { "--ar": `${w} / ${h}` };
  return (
    <span className={`jn-fig jn-fig--${pose.split("-")[0]} ${className}`} style={style} aria-hidden="true">
      <Image
        src={`/site/characters/${pose}.webp`}
        alt=""
        width={w}
        height={h}
        sizes="(max-width: 860px) 160px, 420px"
        priority={eager}
        loading={eager ? undefined : "eager"}
        draggable={false}
        data-until={swap ? at : undefined}
      />
      {swap && (
        <Image
          src={`/site/characters/${swap}.webp`}
          alt=""
          width={CAST[swap][0]}
          height={CAST[swap][1]}
          sizes="(max-width: 860px) 160px, 420px"
          loading="eager"
          draggable={false}
          data-at={at}
        />
      )}
    </span>
  );
}

export function Head({ who, size = 34 }: { who: "priya" | "dana"; size?: number }) {
  return (
    <span className={`jn-head jn-head--${who}`} style={{ width: size, height: size }} aria-hidden="true">
      <Image src={`/site/characters/${who}-head.webp`} alt="" width={256} height={256} sizes={`${size * 2}px`} draggable={false} />
    </span>
  );
}

/** Whose half this is. */
export function Who({ who, role }: { who: "priya" | "dana"; role: string }) {
  return (
    <p className="jn-who">
      <Head who={who} />
      <span>
        <strong>{who === "priya" ? "Priya" : "Dana"}</strong>
        <span>{role}</span>
      </span>
    </p>
  );
}

export function Sample() {
  return <span className="jn-sample">Sample data</span>;
}

export function Chip({ v, children }: { v: Verdict | "done"; children?: ReactNode }) {
  return <span className={`jn-chip jn-chip--${v}`}>{children ?? (v === "done" ? "Approved" : VERDICT_LABEL[v])}</span>;
}

/** Priya's phone: the text thread with Sylph. */
export function Phone({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`jn-phone ${className}`}>
      <div className="jn-phone-bar">
        <Mark className="jn-phone-mark" />
        <span>Sylph</span>
        <Sample />
      </div>
      <div className="jn-thread">{children}</div>
    </div>
  );
}

export function Msg({ from, children, at, until, className = "" }: { from: "her" | "sylph"; children: ReactNode; at?: number; until?: number; className?: string }) {
  return (
    <div className={`jn-msg jn-msg--${from} ${className}`} data-at={at} data-until={until}>
      {children}
    </div>
  );
}

/** Dana's console: what the books look like from his side. */
export function Panel({ title, children, className = "" }: { title: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={`jn-panel ${className}`}>
      <div className="jn-panel-bar">
        <span>{title}</span>
        <Sample />
      </div>
      {children}
    </div>
  );
}

export function Tick() {
  return (
    <svg className="jn-tick" width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8.5l3.2 3L13 4.5" />
    </svg>
  );
}

/** Two states in one place: `before` until story time `at`, then `after`. Same footprint, so
 *  nothing reflows when the moment lands. */
export function Swap({ at, before, after, className = "" }: { at: number; before: ReactNode; after: ReactNode; className?: string }) {
  return (
    <span className={`jn-swap ${className}`}>
      <span data-until={at}>{before}</span>
      <span data-at={at}>{after}</span>
    </span>
  );
}
