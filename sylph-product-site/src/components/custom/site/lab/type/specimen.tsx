import Link from "next/link";
import { Arrow } from "@/components/custom/site/icons";
import { HOME } from "@/components/custom/site/anchors";
import { RulesWindow } from "@/components/custom/site/panels";
import { VerdictCard } from "@/components/custom/site/verdicts";
import type { Face } from "./faces";

/* One candidate: the real hero copy and two real product panels, set in the face. The wrapper re-declares
   font-family from the overridden variables so inherited text follows too. */
export function Specimen({ sans, mono, index }: { sans: Face; mono: Face; index: number }) {
  return (
    <section
      className="type-spec"
      id={sans.id}
      style={{ "--sans": sans.family, "--display": sans.display ?? sans.family, "--mono": mono.family, "--h1w": sans.weight, "--h1t": sans.tracking } as React.CSSProperties}
      aria-labelledby={`spec-${sans.id}`}
    >
      <div className="wrap">
        <div className="type-spec-head">
          <span className="mono type-spec-n">{String(index).padStart(2, "0")}</span>
          <h2 id={`spec-${sans.id}`} className="type-spec-name">{sans.name}</h2>
          <span className="type-spec-note">{sans.note} Evidence face: {mono.name}.</span>
        </div>
        <div className="type-spec-hero">
          <div className="hero-copy">
            <p className="eyebrow">Corporate travel and expense</p>
            <h1 className="h1">
              Nothing to chase <span className="hl">at month end.</span>
            </h1>
            <p className="lede">
              Sylph turns your policy into rules and checks every charge as it happens. Receipts find their own
              charges. At month end the report is already there. You review the exceptions, not the pile.
            </p>
            <div className="hero-cta">
              <Link href={`${HOME}/demo`} className="btn btn-primary btn-lg">
                Book a demo
              </Link>
              <a href="#product" className="link-arrow">
                See how it works
                <Arrow />
              </a>
            </div>
            <p className="hero-note mono">Works with the cards and banks you use.</p>
          </div>
          <div className="type-spec-panels">
            <RulesWindow />
            <VerdictCard compact />
          </div>
        </div>
      </div>
    </section>
  );
}
