"use client";

import { useRef } from "react";
import { FileSpreadsheet, FileText, MessageSquare } from "lucide-react";
import { Chip } from "../app-ui/chip";
import { REPORT_LINES, money } from "../data";
import { useMedia, useScrollProgress } from "../hooks";
import { Tile } from "./tile";

/* A report assembles itself: as the tile scrolls through the screen, each matched charge leaves the inbox and files
   into September's report, and the total adds up. Without motion (or before script) it shows the finished report. */
export function ReportTile() {
  const ref = useRef<HTMLDivElement>(null);
  const p = useScrollProgress(ref, 0.92, 0.4);
  const live = useMedia("(prefers-reduced-motion: no-preference)");
  const q = live ? p : 1;
  const shown = Math.min(REPORT_LINES.length, Math.floor(q * (REPORT_LINES.length + 0.999)));
  const total = REPORT_LINES.slice(0, shown).reduce((a, l) => a + l.amount, 0);
  const ready = shown === REPORT_LINES.length;

  return (
    <Tile
      id="report"
      className="lp-tile--report"
      title="Reports build themselves."
      line="Matched charges file into the month's report. At month end it is already done."
      used={q > 0.15}
    >
      <div ref={ref} className="ap lp-rp" data-ready={ready || undefined}>
        <ul className="lp-rp-in" aria-hidden="true" data-empty={ready || undefined}>
          {REPORT_LINES.map((l, i) => (
            <li key={l.merchant} className={i < shown ? "is-gone" : ""}>
              <b>{l.merchant}</b>
              <span className="ap-num">{money(l.amount)}</span>
            </li>
          ))}
        </ul>
        <div className="ap-card lp-rp-doc">
          <div className="lp-rp-h">
            <span>
              <b>September travel, New York</b>
              <small>Emma Collins, Sales</small>
            </span>
            {ready ? <Chip v="ok">Ready to seal</Chip> : <Chip v="gray">Filing</Chip>}
          </div>
          <ul className="lp-rp-lines">
            {REPORT_LINES.map((l, i) => (
              <li key={l.merchant} className={i < shown ? "is-in" : ""}>
                <span>
                  <b>{l.merchant}</b>
                  <small>
                    {l.note && <MessageSquare strokeWidth={1.75} aria-hidden="true" />}
                    {l.detail}
                  </small>
                </span>
                <span className="ap-num">{money(l.amount)}</span>
              </li>
            ))}
          </ul>
          <div className="lp-rp-total">
            <span>Report total</span>
            <b className="ap-num">{money(total)}</b>
          </div>
          <div className="lp-rp-paper">
            <span>
              <FileText strokeWidth={1.75} />
              Statement, PDF
            </span>
            <span>
              <FileSpreadsheet strokeWidth={1.75} />
              Workbook, Excel
            </span>
            <span>
              <FileText strokeWidth={1.75} />
              Post to QuickBooks
            </span>
          </div>
        </div>
      </div>
    </Tile>
  );
}
