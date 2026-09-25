import Link from "next/link";
import { MOCKS, type Mock } from "./mocks";
import "./switch.css";

/* The mockup switcher: a small bar pinned to the foot of every mockup, linking back to /mock, to the live
   page and to each other mockup. It is not part of any design; it is how the team moves between them. */
export function MockSwitch({ current }: { current: Mock["id"] }) {
  return (
    <nav className="mk-switch" aria-label="Mockups">
      <Link href="/mock" className="mk-switch-home">
        Mockups
      </Link>
      {MOCKS.map((m) => (
        <Link key={m.id} href={m.href} className="mk-switch-item" aria-current={m.id === current ? "page" : undefined} title={m.name}>
          {m.id === "live" ? "Live" : m.id}
        </Link>
      ))}
    </nav>
  );
}
