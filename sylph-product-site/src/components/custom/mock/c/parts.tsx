import type { Via } from "./data";

/* One split-flap cell per character. The markup always carries the finished text, so no script and
   reduced motion both read a settled board; flap.ts takes the cells over when motion is allowed. */
export function Flaps({ text, className }: { text: string; className?: string }) {
  return (
    <span className={`fls${className ? ` ${className}` : ""}`} aria-hidden="true">
      {Array.from(text).map((ch, i) => (
        <span key={i} className={`fl${ch === " " ? " fl--sp" : ""}`} data-ch={ch}>
          <span className="fl-t">{ch}</span>
          <span className="fl-b">{ch}</span>
          <span className="fl-ft">{ch}</span>
          <span className="fl-fb">{ch}</span>
        </span>
      ))}
    </span>
  );
}

/* Wayfinding pictograms, drawn on a 32 grid in currentColor. */
export function Picto({ name }: { name: string }) {
  const p = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg viewBox="0 0 32 32" className="picto" aria-hidden="true" focusable="false">
      {name === "plane" && <path {...p} d="M4 18l9-2 6-10h3l-3 10 7-1.5 2-3.5h2l-1 6 1 6h-2l-2-3.5-7-1.5 3 10h-3l-6-10-9-2z" />}
      {name === "car" && (
        <g {...p}>
          <path d="M5 21v-5l3-6h16l3 6v5z" />
          <path d="M5 16h22" />
          <circle cx="10" cy="22.5" r="2.4" />
          <circle cx="22" cy="22.5" r="2.4" />
        </g>
      )}
      {name === "bed" && (
        <g {...p}>
          <path d="M4 8v18M4 20h24v6M4 15h24v5" />
          <rect x="7" y="11" width="6" height="4" rx="1.5" />
        </g>
      )}
      {name === "fork" && (
        <g {...p}>
          <path d="M9 4v8a3 3 0 0 0 6 0V4M12 4v24" />
          <path d="M23 28V4c-3 2-4 6-4 10h4" />
        </g>
      )}
      {name === "glass" && (
        <g {...p}>
          <path d="M8 4h16l-2 9a6 6 0 0 1-12 0z" />
          <path d="M16 19v8M11 27h10" />
          <path d="M5 29L27 3" />
        </g>
      )}
      {name === "pair" && (
        <g {...p}>
          <rect x="4" y="7" width="16" height="11" rx="2" />
          <rect x="12" y="14" width="16" height="11" rx="2" />
        </g>
      )}
    </svg>
  );
}

/* How a receipt reached its charge. */
export function ViaIcon({ via }: { via: Via }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 20 20" className="via" aria-hidden="true" focusable="false">
      {via === "text" && <path {...p} d="M3 5h14v8H8l-4 3v-3H3z" />}
      {via === "email" && (
        <g {...p}>
          <rect x="2.5" y="4.5" width="15" height="11" rx="1.5" />
          <path d="M3 5.5l7 5.5 7-5.5" />
        </g>
      )}
      {via === "upload" && <path {...p} d="M10 13V3M6 7l4-4 4 4M3 13v4h14v-4" />}
      {via === "booked" && <path {...p} d="M2 11l6-1.5 3.5-6h2l-1.8 6 4.3-1 1.3-2h1.2l-.6 3.5.6 3.5H17l-1.3-2-4.3-1 1.8 6h-2L8 12.5z" />}
    </svg>
  );
}

export const VIA_LABEL: Record<Via, string> = {
  booked: "Booked in Sylph",
  text: "Receipt by text",
  email: "Receipt by email",
  upload: "Receipt by upload",
};

export function Sample({ dark = false }: { dark?: boolean }) {
  return <span className={`dep-sample${dark ? " is-dark" : ""}`}>Sample data</span>;
}
