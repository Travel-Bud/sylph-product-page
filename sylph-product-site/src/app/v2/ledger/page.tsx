import type { Metadata } from "next";
import "@/components/custom/v2-ledger/ledger.css";
import { ledgerFonts } from "@/components/custom/v2-ledger/fonts";
import { DayRail } from "@/components/custom/v2-ledger/rail";
import { LedgerMotion } from "@/components/custom/v2-ledger/motion";
import { Charge, Hero, Receipt, Rule } from "@/components/custom/v2-ledger/entries";
import {
  CarriedForward,
  Closed,
  Exceptions,
  LedgerFooter,
  Masthead,
  Notes,
  Policy,
} from "@/components/custom/v2-ledger/month";

export const metadata: Metadata = {
  title: "Sylph: the month, closed",
  description:
    "Direction B, Ledger. Every card charge finds its receipt and gets checked against your rules as it happens. You see the exceptions, not the pile, and the month closes itself.",
  robots: { index: false, follow: false },
};

/* Direction B of the V2 exploration: the page is September's ledger, written
   entry by entry and closed on the thirtieth. Everything is scoped under .ledger. */
export default function LedgerPage() {
  return (
    <main className={`ledger ${ledgerFonts}`} id="main">
      <a href="#opened" className="lg-skip">
        Skip to content
      </a>
      <LedgerMotion />
      <Masthead />
      <div className="lg-book">
        <DayRail />
        <div className="lg-pages">
          <Hero />
          <Charge />
          <Receipt />
          <Rule />
          <Exceptions />
          <Policy />
          <Notes />
          <Closed />
        </div>
      </div>
      <CarriedForward />
      <LedgerFooter />
    </main>
  );
}
