"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "./motion";
import { Flip } from "gsap/Flip";
import { enterTile } from "./bento-motion";
import { Obj, type ObjName } from "./obj";
import { VerdictCard } from "./verdicts";
import { ReviewQueue } from "./review";
import { CurrencyVisual, ExportChips, FaresWindow, MatchCard, ReceiptWays, ReportPaper, RuleRows, RulesWindow } from "./panels";

gsap.registerPlugin(Flip);

interface Tile {
  id: string;
  label: string;
  span: 1 | 2;
  hue: string;
  compact: ReactNode;
  open: ReactNode;
  caption: string;
  art?: ObjName;
}

/**
 * The product, as one grid. Each tile is a real surface with as little text
 * as the information allows. Click a tile and it takes the full row (a GSAP
 * Flip layout transition) to show the working demonstration; one open at a
 * time. Under reduced motion the layout simply changes.
 */
const TILES: Tile[] = [
  {
    id: "policy",
    art: "policy",
    label: "Policy into rules",
    span: 2,
    hue: "lavender",
    compact: (
      <div className="t-policy">
        <Obj name="policy" size={132} className="t-obj" />
        <RuleRows n={4} />
      </div>
    ),
    open: <RulesWindow />,
    caption: "Drop in the PDF. Every rule quotes its sentence. You approve the set once.",
  },
  {
    id: "verdict",
    label: "Verdicts",
    span: 1,
    hue: "white",
    compact: <VerdictCard compact />,
    open: <VerdictCard />,
    caption: "Move the amount. Same rules, same answer, every time.",
  },
  {
    id: "cards",
    label: "Any card, any bank",
    span: 1,
    hue: "mint",
    compact: (
      <div className="t-cards">
        <Obj name="card" size={150} className="t-obj" priority />
      </div>
    ),
    open: (
      <div className="t-cards is-open">
        <Obj name="card" size={260} className="t-obj" />
        <Obj name="terminal" size={220} className="t-obj t-obj-2" />
      </div>
    ),
    caption: "Keep the cards and banks you have. Statements import, connected accounts sync.",
  },
  {
    id: "receipts",
    art: "receipt",
    label: "Receipts",
    span: 1,
    hue: "white",
    compact: <ReceiptWays compact />,
    open: (
      <div className="t-receipts">
        <ReceiptWays />
        <MatchCard />
      </div>
    ),
    caption: "Upload, email or text. It finds its charge.",
  },
  {
    id: "booking",
    art: "boarding-pass",
    label: "Booking, no markup",
    span: 2,
    hue: "sky",
    compact: <FaresWindow compact />,
    open: <FaresWindow />,
    caption: "Fares at the airline's price. No markup, no commission, no fee per trip.",
  },
  {
    id: "currency",
    label: "Any currency",
    span: 1,
    hue: "amber",
    compact: <CurrencyVisual />,
    open: <CurrencyVisual large />,
    caption: "Normalized at the rate on the receipt date. Duplicates flagged the same way.",
  },
  {
    id: "review",
    art: "phone",
    label: "Review queue",
    span: 2,
    hue: "white",
    compact: <ReviewQueue compact />,
    open: <ReviewQueue />,
    caption: "Only the exceptions reach you, each with its rule and the employee's note.",
  },
  {
    id: "record",
    art: "report",
    label: "The record",
    span: 2,
    hue: "sand",
    compact: <ReportPaper compact />,
    open: (
      <div className="t-record">
        <ReportPaper />
        <ExportChips />
      </div>
    ),
    caption: "Cleared charges land on the report by themselves. PDF, workbook, CSV.",
  },
];

export function Bento() {
  const grid = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<string | null>(null);
  const flipState = useRef<ReturnType<typeof Flip.getState> | null>(null);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const toggle = (id: string) => {
    const el = grid.current;
    if (el && !reduced.current) flipState.current = Flip.getState(el.querySelectorAll(".tile"));
    setOpen((o) => (o === id ? null : id));
  };

  useLayoutEffect(() => {
    // the page's scroll-scrubbed pieces (the receipt journey) re-measure after any layout change,
    // including a close by Escape, which captures no Flip state
    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 640);
    const st = flipState.current;
    const el = grid.current;
    let entrance: ReturnType<typeof enterTile> | undefined;
    if (st && el) {
      flipState.current = null;
      Flip.from(st, { duration: 0.55, ease: "power2.inOut", nested: true, scale: false, simple: true });
      const tile = open ? el.querySelector<HTMLElement>(`[data-tile="${open}"]`) : null;
      // the open surface enters the way its subject would, once the layout has settled
      if (tile) entrance = enterTile(open!, tile, 0.26);
    }
    return () => {
      window.clearTimeout(refresh);
      entrance?.kill();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = grid.current?.querySelector<HTMLElement>(`[data-tile="${open}"]`);
    if (!el) return;
    const once = window.setTimeout(() => el.querySelectorAll("[data-once]").forEach((n) => n.classList.add("is-in")), 650);
    const t = window.setTimeout(() => {
      const top = el.getBoundingClientRect().top;
      if (top < 80 || top > window.innerHeight * 0.5) {
        const y = top + window.scrollY - 96;
        if (window.__lenis) window.__lenis.scrollTo(y, { duration: 0.8 });
        else window.scrollTo({ top: y, behavior: reduced.current ? "auto" : "smooth" });
      }
    }, 60);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(once);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <section id="product" className="sec bento-sec" aria-labelledby="product-title">
      <div className="wrap">
        <div className="sec-head rv">
          <h2 id="product-title" className="h2">
            One engine, every charge.
          </h2>
        </div>
        <div className="bento" ref={grid}>
          {TILES.map((t) => {
            const isOpen = open === t.id;
            return (
              <article
                key={t.id}
                data-tile={t.id}
                className={`tile tile-${t.hue}${isOpen ? " is-open" : ""}`}
                style={{ "--c": t.span } as React.CSSProperties}
                aria-labelledby={`tile-${t.id}`}
              >
                <div className="tile-head">
                  <h3 id={`tile-${t.id}`} className="tile-k">
                    {t.label}
                  </h3>
                  <button
                    type="button"
                    className="tile-toggle"
                    aria-expanded={isOpen}
                    aria-label={isOpen ? `Close ${t.label}` : `Open ${t.label}`}
                    onClick={() => toggle(t.id)}
                  >
                    <span aria-hidden="true" />
                    <span aria-hidden="true" />
                  </button>
                </div>
                {isOpen ? (
                  <div className="tile-x">
                    <div className="tile-x-main">{t.open}</div>
                    <div className="tile-x-side">
                      <p className="tile-cap">{t.caption}</p>
                      {t.art && <Obj name={t.art} size={220} className="tile-art" />}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="tile-body" aria-hidden="true">
                      {t.compact}
                    </div>
                    <button type="button" className="tile-open" aria-label={`Open ${t.label}`} onClick={() => toggle(t.id)} />
                  </>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
