/* Sample data for the product panels. Everything here is illustrative and is
   labeled as sample data wherever it renders. No customer data, no invented
   aggregate metrics: counts on the page are counts of the rows shown. */

export type Verdict = "ok" | "note" | "block";
export type Category = "Meals" | "Airfare" | "Lodging" | "Ground" | "Rail" | "Office";

export interface EngineRow {
  merchant: string;
  amount: string;
  category: Category;
  verdict: Verdict;
  cite: string;
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  ok: "Cleared",
  note: "Needs a note",
  block: "Blocked",
};

/* Category colour keys mirror the app's CategoryPill families
   (food = orange, stay = sky, transport = violet, office = slate). */
export const CATEGORY_KEY: Record<Category, string> = {
  Meals: "food",
  Airfare: "move",
  Rail: "move",
  Ground: "move",
  Lodging: "stay",
  Office: "office",
};

/* The hero's enforcement window: a sample ruleset checking a week of
   charges. Every row carries its rule, and the exceptions carry the
   threshold and the amount. The window rolls through this list. */
export const ENGINE_ROWS: EngineRow[] = [
  { merchant: "Blue Bottle Coffee", amount: "$6.40", category: "Meals", verdict: "ok", cite: "M-010, in policy" },
  { merchant: "United Airlines", amount: "$412.30", category: "Airfare", verdict: "ok", cite: "T-004, in policy" },
  { merchant: "Sushi Kanda", amount: "$84.20", category: "Meals", verdict: "note", cite: "M-041, $9.20 over the $75 dinner cap" },
  { merchant: "Lyft", amount: "$23.15", category: "Ground", verdict: "ok", cite: "G-002, in policy" },
  { merchant: "Hyatt Regency Denver", amount: "$258.00", category: "Lodging", verdict: "ok", cite: "L-007, in policy" },
  { merchant: "Bar Bianco", amount: "$46.90", category: "Meals", verdict: "block", cite: "M-022, alcohol, kept off the total" },
  { merchant: "Amtrak", amount: "$118.00", category: "Rail", verdict: "ok", cite: "T-011, in policy" },
  { merchant: "Shake Shack", amount: "$14.75", category: "Meals", verdict: "ok", cite: "M-012, in policy" },
  { merchant: "FedEx Office", amount: "$32.10", category: "Office", verdict: "ok", cite: "O-001, in policy" },
  { merchant: "Uber", amount: "$41.60", category: "Ground", verdict: "ok", cite: "G-002, in policy" },
  { merchant: "Yellow Cab Co", amount: "$41.60", category: "Ground", verdict: "note", cite: "D-001, same amount and date as the Uber ride" },
  { merchant: "Delta Air Lines", amount: "$688.00", category: "Airfare", verdict: "ok", cite: "T-004, in policy" },
  { merchant: "Marriott Marquis", amount: "$412.00", category: "Lodging", verdict: "note", cite: "L-007, $62.00 over the $350 nightly cap" },
  { merchant: "Pret a Manger", amount: "$11.20", category: "Meals", verdict: "ok", cite: "M-012, in policy" },
  { merchant: "JR East", amount: "$21.55", category: "Rail", verdict: "ok", cite: "T-011, ¥3,200 normalized" },
  { merchant: "Hilton Garden Inn", amount: "$189.00", category: "Lodging", verdict: "ok", cite: "L-007, in policy" },
  { merchant: "Chipotle", amount: "$13.40", category: "Meals", verdict: "ok", cite: "M-012, in policy" },
  { merchant: "Avis", amount: "$156.80", category: "Ground", verdict: "note", cite: "G-009, rental class above policy" },
  { merchant: "Caffe Nero", amount: "$4.90", category: "Meals", verdict: "ok", cite: "M-010, in policy" },
  { merchant: "Southwest Airlines", amount: "$236.00", category: "Airfare", verdict: "ok", cite: "T-004, in policy" },
];
