"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "./motion";
import { Flip } from "gsap/Flip";
import { enterTile } from "./bento-motion";
import { Obj, type ObjName } from "./obj";
import { VerdictCard } from "./verdicts";
import { ReviewQueue } from "./review";
import { QBO_LIVE } from "./sample-data";
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
    id: "receipts",
    art: "receipt",
    label: "Receipts find their charge",
    span: 1,
    hue: "white",
    compact: <ReceiptWays compact />,
    open: (
      <div className="t-receipts">
        <ReceiptWays />
        <MatchCard />
      </div>
    ),
    caption: "Upload, email or text. Each one finds its own charge and lands on the report.",
  },

  {
    id: "cards",
    label: "Your cards, your banks",
    span: 1,
    hue: "mint",
    compact: (
      <div className="t-cards">
        <Obj name="card" size={150} className="t-obj" />
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
    id: "review",
    art: "phone",
    label: "Only exceptions reach you",
    span: 2,
    hue: "white",
    compact: <ReviewQueue compact />,
    open: <ReviewQueue />,
    caption: "Each exception arrives with its rule, the amount over and the employee's note. Cleared lines never do.",
  },

  {
    id: "record",
    art: "report",
    label: "The month, closed",
    span: 2,
    hue: "sand",
    compact: <ReportPaper compact />,
    open: (
      <div className="t-record">
        <ReportPaper />
        <ExportChips />
      </div>
    ),
    caption: `Cleared charges land on the report by themselves, coded to the accounts you set once. The journal is ready for your accountant${QBO_LIVE ? " and posts to QuickBooks\u00a0Online" : ""}.`,
  },

  {
    id: "policy",
    art: "policy",
    label: "Policy, written or built",
    span: 2,
    hue: "lavender",
    compact: (
      <div className="t-policy">
        <Obj name="policy" size={132} className="t-obj" />
        <RuleRows n={4} />
      </div>
    ),
    open: <RulesWindow />,
    caption: "Bring the PDF, or answer a dozen questions and Sylph writes one. Every rule quotes its sentence. You approve the set once.",
  },

  {
    id: "verdict",
    label: "Same rules, same answer",
    span: 1,
    hue: "white",
    compact: <VerdictCard compact />,
    open: <VerdictCard />,
    caption: "Move the amount. The verdict cites the rule, the threshold and the amount, every time.",
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
    id: "booking",
    art: "boarding-pass",
    label: "Booking, no markup",
    span: 2,
    hue: "sky",
    compact: <FaresWindow compact />,
    open: <FaresWindow />,
    caption: "Fares at the airline's price. No markup, no commission, no fee per trip.",
  },
];

export function Bento() {
  const grid = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<string | null>(null);
  const flipState = useRef<ReturnType<typeof Flip.getState> | null>(null);
  const lastOpen = useRef<string | null>(null);
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

  // keyboard focus follows the open surface and comes back to the toggle on close
  useEffect(() => {
    const el = grid.current;
    if (!el) return;
    const toggleOf = (id: string) => el.querySelector<HTMLElement>(`[data-tile="${id}"] .tile-toggle`);
    if (open) {
      lastOpen.current = open;
      const t = window.setTimeout(() => toggleOf(open)?.focus({ preventScroll: true }), 80);
      return () => window.clearTimeout(t);
    }
    if (lastOpen.current) {
      const id = lastOpen.current;
      lastOpen.current = null;
      toggleOf(id)?.focus({ preventScroll: true });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <section id="product" className="sec sec--band bento-sec" aria-labelledby="product-title">
      <div className="wrap">
        <div className="sec-head rv">
          <h2 id="product-title" className="h2">
            From the card charge to the closed month.
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
                    aria-controls={`tile-x-${t.id}`}
                    aria-label={isOpen ? `Close ${t.label}` : `Open ${t.label}`}
                    onClick={() => toggle(t.id)}
                  >
                    <span aria-hidden="true" />
                    <span aria-hidden="true" />
                  </button>
                </div>
                {isOpen ? (
                  <div className="tile-x" id={`tile-x-${t.id}`}>
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
                    <button type="button" className="tile-open" tabIndex={-1} aria-label={`Open ${t.label}`} onClick={() => toggle(t.id)} />
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
