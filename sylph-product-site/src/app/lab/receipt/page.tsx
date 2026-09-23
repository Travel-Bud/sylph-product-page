import type { Metadata } from "next";
import { siteFonts } from "@/components/custom/site/fonts";
import { Mark } from "@/components/custom/site/mark";
import { APP_LOGIN, DEMO } from "@/components/custom/site/anchors";
import { receiptMono } from "@/components/custom/lab/receipt/fonts";
import { Strip } from "@/components/custom/lab/receipt/scenes";
import { Printer } from "@/components/custom/lab/receipt/printer";
import { SoundToggle } from "@/components/custom/lab/receipt/controls";
import "@/components/custom/lab/receipt/receipt.css";

/* Explore direction "The receipt" (2026-09-22): the whole page is one strip of thermal paper, printed as
   it scrolls out of the head at the bottom of the screen, told by the Sushi Kanda receipt itself.
   Notes: docs/plans/2026-09-22-landing-v2/explore/receipt/NOTES.md */
export const metadata: Metadata = {
  title: "Sylph: the receipt nobody had to chase",
  description:
    "One dinner receipt tells its own month: texted, matched to its card charge, read against the policy, noted, approved, filed on line 3. Sylph checks every charge as it happens.",
};

export default function ReceiptPage() {
  return (
    <main className={`rcp ${siteFonts} ${receiptMono.variable}`} id="main">
      <a href="#receipt" className="rcp-skip">
        Skip to the receipt
      </a>
      <header className="rcp-top">
        <a href="#main" className="rcp-brand" aria-label="Sylph">
          <Mark className="rcp-brand-mark" />
          <span>Sylph</span>
        </a>
        <a href={APP_LOGIN} className="rcp-top-login">
          Log in
        </a>
      </header>
      <div className="rcp-feed">
        <Strip />
      </div>
      <div className="rcp-head">
        <div className="rcp-head-in">
          <p className="rcp-head-status" aria-hidden="true">
            <span className="rcp-head-led" />
            <span data-head-status>PRINTING</span>
          </p>
          <span className="rcp-head-slot" aria-hidden="true" />
          <div className="rcp-head-act">
            <SoundToggle />
            <a href={DEMO} className="rcp-btn rcp-btn--head">
              Book a demo
            </a>
          </div>
        </div>
      </div>
      <Printer />
    </main>
  );
}
