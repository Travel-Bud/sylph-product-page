"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/components/custom/site/motion";
import { CHARGE, CLEARED, EXCEPTIONS, ROWS } from "@/components/custom/v2-sides/data";
import { Tick } from "@/components/custom/v2-sides/parts";

/* The desk's wall: the twenty September charges on Dana's strip (the shared sample rows), sorting as the wall scrolls
   in. Each tile carries --s from 0 (just arrived) to 1 (sorted): a cleared one greens, ticks and settles
   back as filed; an exception lifts and takes its colour, bound for Dana's queue. The markup's default is
   --s: 1, so reduced motion and no script show the sorted wall. Scrubbed lightly (0.3), never pinned. */

const LABEL = { ok: "Filed", note: "Needs a note", block: "Blocked" } as const;

export function DeskWall() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tiles = Array.from(el.querySelectorAll<HTMLElement>(".mb-tile"));
    const filed = el.querySelector<HTMLElement>("[data-n='filed']");
    const dana = el.querySelector<HTMLElement>("[data-n='dana']");
    let last = "";
    const count = () => {
      let f = 0;
      let d = 0;
      for (const t of tiles) {
        if (Number(t.style.getPropertyValue("--s")) < 0.5) continue;
        if (t.dataset.v === "ok") f++;
        else d++;
      }
      const key = `${f}/${d}`;
      if (key === last) return;
      last = key;
      if (filed) filed.textContent = String(f);
      if (dana) dana.textContent = String(d);
    };
    const ctx = gsap.context(() => {
      gsap.set(tiles, { "--s": 0 });
      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: { trigger: el, start: "top 82%", end: "top 22%", scrub: 0.3, onUpdate: count, onRefresh: count },
      });
      tiles.forEach((t, i) => tl.to(t, { "--s": 1, duration: 0.28 }, i * 0.037));
    }, el);
    count();
    return () => ctx.revert();
  }, []);

  return (
    <div className="mb-wall" ref={root}>
      <ol className="mb-wall-grid" aria-label="Twenty September charges, sorted (sample data)">
        {ROWS.map((r) => (
          <li
            key={r.merchant}
            className={`mb-tile mb-tile--${r.verdict}${r.merchant === CHARGE.merchant ? " is-ours" : ""}`}
            data-v={r.verdict}
          >
            <span className="mb-tile-m">{r.merchant}</span>
            <span className="mb-tile-a mono">{r.amount}</span>
            <span className="mb-tile-v">
              {r.verdict === "ok" && <Tick />}
              {LABEL[r.verdict]}
            </span>
          </li>
        ))}
      </ol>
      <p className="mb-wall-cap">
        <span>
          <b className="mono" data-n="filed">
            {CLEARED.length}
          </b>{" "}
          of {CLEARED.length} filed themselves
        </span>
        <span>
          <b className="mono" data-n="dana">
            {EXCEPTIONS.length}
          </b>{" "}
          of {EXCEPTIONS.length} reached Dana
        </span>
        <span className="v2s-sample">Sample data</span>
      </p>
    </div>
  );
}
