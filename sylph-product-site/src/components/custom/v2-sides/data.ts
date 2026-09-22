/* Direction C, "Two sides". Sample data only: Priya and Dana are invented people, the
   merchants come from the shared ENGINE_ROWS, and every count is a count of rows shown. */
import { ENGINE_ROWS, type EngineRow } from "@/components/custom/site/sample-data";

export { QBO_LIVE, VERDICT_LABEL } from "@/components/custom/site/sample-data";
export type { EngineRow, Verdict } from "@/components/custom/site/sample-data";

export const PRIYA = { name: "Priya", role: "Spent it, on the road" };
export const DANA = { name: "Dana", role: "Closes the books" };

/* The one charge that travels the page. */
export const CHARGE = {
  merchant: "Sushi Kanda",
  amount: "$84.20",
  cite: "M-041, $9.20 over the $75 dinner cap",
  note: "Late finish at the site visit, only place still open.",
};

export const ROWS: EngineRow[] = ENGINE_ROWS;
export const EXCEPTIONS = ROWS.filter((r) => r.verdict !== "ok");
export const CLEARED = ROWS.filter((r) => r.verdict === "ok");

/* Hero desk: charges that filed themselves while Priya was texting. */
export const HERO_FILED = ["United Airlines", "Hyatt Regency Denver", "Lyft", "Blue Bottle Coffee", "Amtrak"]
  .map((m) => ROWS.find((r) => r.merchant === m))
  .filter((r): r is EngineRow => Boolean(r));
