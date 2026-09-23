/* Sample story, sample data. Priya, Dana, Sushi Kanda and every amount are invented; the merchants and
   citations come from the shared ENGINE_ROWS, and every count is a count of the rows shown. */
import { ENGINE_ROWS, QBO_LIVE, type EngineRow } from "@/components/custom/site/sample-data";

export { QBO_LIVE };
export type { EngineRow };

export const CHARGE = {
  merchant: "Sushi Kanda",
  amount: "$84.20",
  rule: "M-041",
  cite: "$9.20 over the $75 dinner cap",
  note: "Late finish at the site visit, only place still open.",
};

export const RECEIPT_LINES: [string, string][] = [
  ["Omakase", "72.00"],
  ["Tea", "4.00"],
  ["Tax", "8.20"],
];

const pick = (m: string) => ENGINE_ROWS.find((r) => r.merchant === m) as EngineRow;

/* Dana's queue: the week's charges that filed themselves. */
export const FILED = ["United Airlines", "Hyatt Regency Denver", "Lyft", "Blue Bottle Coffee", "Amtrak"].map(pick);

/* Priya's September report for the Denver trip. The total is the sum of these rows. */
export const REPORT = ["United Airlines", "Hyatt Regency Denver", "Lyft", "Blue Bottle Coffee", "Sushi Kanda"].map(pick);
export const REPORT_TOTAL = REPORT.reduce((s, r) => s + Number(r.amount.replace(/[$,]/g, "")), 0).toLocaleString("en-US", {
  style: "currency",
  currency: "USD",
});

/** "T-004, in policy" to "T-004" */
export const ruleOf = (r: EngineRow) => r.cite.split(",")[0];
