import Link from "next/link";
import { HOME } from "@/components/custom/site/anchors";

export function SpineClose() {
  return (
    <section className="spine-close" aria-labelledby="spine-close-title">
      <div className="wrap">
        <div className="spine-close-inner">
          <h2 id="spine-close-title" className="spine-close-line">
            Month end is too late to find out.
          </h2>
          <p className="lede">Bring the PDF. Thirty minutes, your rules, real verdicts.</p>
          <Link href={`${HOME}/demo`} className="btn btn-primary btn-lg">
            Bring your policy
          </Link>
        </div>
      </div>
    </section>
  );
}
