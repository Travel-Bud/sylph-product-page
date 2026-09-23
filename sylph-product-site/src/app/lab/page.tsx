import Image from "next/image";
import Link from "next/link";
import { siteFonts } from "@/components/custom/site/fonts";
import { Mark } from "@/components/custom/site/mark";
import { DIRECTIONS } from "./directions";
import "./lab.css";

/* /lab: the index of the 2026-09-22 explore run. One row per direction, each a noindex route. */
export default function LabIndex() {
  return (
    <main className={`xp ${siteFonts}`}>
      <header className="xp-head">
        <Link href="/" className="xp-brand">
          <Mark className="xp-mark" />
          <span>Sylph</span>
        </Link>
        <span className="xp-date">Lab, 22 Sep 2026</span>
      </header>
      <section className="xp-intro">
        <h1>
          {DIRECTIONS.length} directions for the landing.
          <br />
          <span>Same product, different ways in.</span>
        </h1>
        <p>
          Each is a working page, built to be judged at 1440 and on a phone. The current page, Two sides, stays
          at <Link href="/">the root</Link>.
        </p>
      </section>
      <ol className="xp-list">
        {DIRECTIONS.map((d, i) => (
          <li key={d.slug}>
            <Link href={`/lab/${d.slug}`} className="xp-card">
              <span className="xp-shot">
                <Image
                  src={`/lab/index/${d.slug}.webp`}
                  alt={`First screen of ${d.name}`}
                  fill
                  sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 400px"
                  priority={i < 3}
                />
              </span>
              <span className="xp-meta">
                <span className="xp-n">{String(i + 1).padStart(2, "0")}</span>
                <span className={`xp-kind ${d.kind === "Departure" ? "is-dep" : "is-push"}`}>{d.kind}</span>
              </span>
              <span className="xp-name">{d.name}</span>
              <span className="xp-line">{d.line}</span>
              <span className="xp-go">/lab/{d.slug}</span>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
