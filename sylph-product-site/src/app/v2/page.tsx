import type { Metadata } from "next";
import Link from "next/link";
import "@/components/custom/site/site.css";
import { siteFonts } from "@/components/custom/site/fonts";

export const metadata: Metadata = { title: "Sylph landing V2 directions", robots: { index: false } };

/* Review index for the three V2 directions (docs/plans/2026-09-22-landing-v2-directions.md). Not linked from the site. */
const DIRECTIONS = [
  {
    href: "/",
    name: "A. Refined",
    kind: "Deepens the current page",
    what: "The premium pass plus a sorter chapter (twenty charges, five reach you), the questions finance asks first with the trust line, a price line in the close, the roadmap visuals fixed, the verdict tile's labels fixed.",
  },
  {
    href: "/v2/ledger",
    name: "B. Ledger",
    kind: "Full direction change",
    what: "The month told as a ledger being written and closed: paper, ruled lines, stamps, a day rail that advances as you read.",
  },
  {
    href: "/v2/sides",
    name: "C. Two sides",
    kind: "Full direction change",
    what: "The person who spent it and the person who closes the books. One charge travels between a phone and the finance desk.",
  },
];

export default function V2Index() {
  return (
    <main className={`site ${siteFonts}`}>
      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <h1 className="h2">Landing V2, three directions.</h1>
            <p className="lede">Each opens as a full page. Nothing here is deployed.</p>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: "40px 0 0", display: "grid", gap: 16 }}>
            {DIRECTIONS.map((d) => (
              <li key={d.href}>
                <Link href={d.href} className="win" style={{ display: "block", padding: "22px 24px", textDecoration: "none", color: "inherit" }}>
                  <span className="mono" style={{ fontSize: 12, color: "var(--ink-3)" }}>
                    {d.kind}
                  </span>
                  <span className="h3" style={{ display: "block", fontSize: 24, margin: "6px 0 8px" }}>
                    {d.name}
                  </span>
                  <span style={{ color: "var(--ink-2)" }}>{d.what}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
