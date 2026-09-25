import Image from "next/image";
import Link from "next/link";
import { siteFonts } from "@/components/custom/site/fonts";
import { Mark } from "@/components/custom/site/mark";
import { MOCKS } from "@/components/custom/mock/shared/mocks";
import "./mock.css";

/* /mock: the router. The live page first, then every mockup, each a working noindex route. */
export default function MockIndex() {
  const n = MOCKS.length - 1;
  return (
    <main className={`mk ${siteFonts}`}>
      <header className="mk-head">
        <Link href="/" className="mk-brand">
          <Mark className="mk-mark" />
          <span>Sylph</span>
        </Link>
        <span className="mk-date">Mockups, Sep 2026</span>
      </header>
      <section className="mk-intro">
        <h1>
          {n} mockups for the landing.
          <br />
          <span>Beside the page that is live.</span>
        </h1>
        <p>
          Each is a working page, built to be judged at 1440 and on a phone. The bar at the foot of every mockup moves
          between them.
        </p>
      </section>
      <ol className="mk-list">
        {MOCKS.map((m, i) => (
          <li key={m.id} className={m.id === "live" ? "mk-item--live" : undefined}>
            <Link href={m.href} className="mk-card">
              <span className="mk-shot">
                <Image
                  src={`/mock/index/${m.id.toLowerCase()}.webp`}
                  alt={`First screen of ${m.name}`}
                  fill
                  sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 400px"
                  priority={i < 3}
                />
              </span>
              <span className="mk-meta">
                <span className="mk-n">{m.id === "live" ? "Live" : `Mock ${m.id}`}</span>
                <span className={`mk-kind ${m.kind === "Live" ? "is-live" : m.kind === "Upgrade" ? "is-push" : "is-dep"}`}>{m.kind}</span>
              </span>
              <span className="mk-name">{m.name}</span>
              <span className="mk-line">{m.line}</span>
              <span className="mk-go">{m.href}</span>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
