/* Sample data for the landing's product screens. Invented people, merchants and amounts, kept consistent across
   sections (the Marriott night is always $412.00 against the $350 cap). The footer says so once. */

export type Verdict = "ok" | "note" | "block";
/* The app's own words: a charge is "In policy", "Needs a note" or "Blocked" (status tags, components/ui/status-mark.tsx). */
export const VERDICT: Record<Verdict, string> = { ok: "In policy", note: "Needs a note", block: "Blocked" };

export type Kind = "air" | "hotel" | "meal" | "drink" | "ground" | "office";

export interface Flagged {
  id: string;
  merchant: string;
  detail: string;
  amount: string;
  kind: Kind;
  verdict: Verdict;
  rule?: { code: string; name: string; reason: string; policy: string; source: string; then: string; meter?: { value: number; cap: number } };
}

/* The flag tile: five charges from one trip, two of them flagged and one blocked. */
export const TRIP_CHARGES: Flagged[] = [
  { id: "ua", merchant: "United Airlines", detail: "SFO to JFK, economy", amount: "$412.30", kind: "air", verdict: "ok" },
  {
    id: "mm",
    merchant: "Marriott Marquis",
    detail: "New York, 1 night",
    amount: "$412.00",
    kind: "hotel",
    verdict: "note",
    rule: {
      code: "L-007",
      name: "Hotel nightly cap",
      reason: "$62 over the $350 nightly cap",
      policy: "Hotels up to $350 a night.",
      source: "T&E Policy 2026, section 4.2",
      then: "Asks Priya for a note before it can be submitted",
      meter: { value: 412, cap: 350 },
    },
  },
  { id: "ly", merchant: "Lyft", detail: "JFK to Midtown", amount: "$23.15", kind: "ground", verdict: "ok" },
  {
    id: "sk",
    merchant: "Sushi Kanda",
    detail: "Dinner, 1 person",
    amount: "$84.20",
    kind: "meal",
    verdict: "note",
    rule: {
      code: "M-041",
      name: "Dinner cap",
      reason: "$9.20 over the $75 dinner cap",
      policy: "Dinner up to $75 a person.",
      source: "T&E Policy 2026, section 5.1",
      then: "Asks Priya for a note before it can be submitted",
      meter: { value: 84.2, cap: 75 },
    },
  },
  {
    id: "bb",
    merchant: "Bar Bianco",
    detail: "Card ending 4417",
    amount: "$46.90",
    kind: "drink",
    verdict: "block",
    rule: {
      code: "M-022",
      name: "Alcohol on solo meals",
      reason: "Alcohol, kept off the total",
      policy: "Alcohol is personal unless you are hosting a client.",
      source: "T&E Policy 2026, section 5.4",
      then: "Stays off the reimbursement total, with the reason shown",
    },
  },
];

/* The receipt tile: the card charges the photo can land on. */
export const CARD_CHARGES = [
  { id: "ub", merchant: "Uber", when: "Sep 12, 7:12 pm", amount: "$41.60", matched: true },
  { id: "sk", merchant: "Sushi Kanda", when: "Sep 12, 9:48 pm", amount: "$84.20", matched: false },
  { id: "hy", merchant: "Hyatt Regency Denver", when: "Sep 11", amount: "$258.00", matched: true },
  { id: "bb", merchant: "Blue Bottle Coffee", when: "Sep 11, 8:05 am", amount: "$6.40", matched: true },
];

/* The report tile: lines that file into September's report as the tile scrolls in. */
export const REPORT_LINES = [
  { merchant: "United Airlines", detail: "SFO to JFK", amount: 412.3, note: false },
  { merchant: "Marriott Marquis", detail: "1 night, note added", amount: 412.0, note: true },
  { merchant: "Lyft", detail: "JFK to Midtown", amount: 23.15, note: false },
  { merchant: "Sushi Kanda", detail: "Dinner, note added", amount: 84.2, note: true },
  { merchant: "Uber", detail: "Midtown to JFK", amount: 41.6, note: false },
];

/* The trip tile: what one sentence finds. */
export const TRIP_SENTENCE = "sfo to jfk, tue to fri, economy";
export const FLIGHTS = [
  { airline: "United", time: "7:05 am to 3:37 pm", info: "Nonstop, 5h 32m, economy", price: "$412.30", ok: true },
  { airline: "JetBlue", time: "9:15 am to 5:55 pm", info: "Nonstop, 5h 40m, economy", price: "$389.00", ok: true },
  { airline: "Delta", time: "8:00 am to 4:41 pm", info: "Nonstop, 5h 41m, business", price: "$1,180.00", ok: false },
];

/* Try it: the editable policy and the week it checks. */
export interface Limit {
  code: string;
  before: string;
  after: string;
  unit: "$" | "h";
  value: number;
  min: number;
  max: number;
  step: number;
}

export const LIMITS: Limit[] = [
  { code: "L-007", before: "Hotels up to", after: "a night.", unit: "$", value: 350, min: 100, max: 800, step: 10 },
  { code: "M-041", before: "Dinner up to", after: "a person.", unit: "$", value: 75, min: 20, max: 200, step: 5 },
  { code: "T-004", before: "Business class only on flights over", after: "hours.", unit: "h", value: 6, min: 2, max: 12, step: 1 },
  { code: "R-002", before: "A receipt for anything over", after: ".", unit: "$", value: 25, min: 0, max: 100, step: 5 },
];

export interface WeekCharge {
  id: string;
  merchant: string;
  detail: string;
  amount: number;
  kind: Kind;
  /** Which limit decides it, and the number it is compared with. */
  check?: { code: string; measure: number };
  fixed?: { code: string; reason: string };
}

export const WEEK: WeekCharge[] = [
  { id: "mm", merchant: "Marriott Marquis", detail: "New York, 1 night", amount: 412, kind: "hotel", check: { code: "L-007", measure: 412 } },
  { id: "sk", merchant: "Sushi Kanda", detail: "Dinner, 1 person", amount: 84.2, kind: "meal", check: { code: "M-041", measure: 84.2 } },
  { id: "dl", merchant: "Delta", detail: "BOS to SFO, business, 6h 25m", amount: 1240, kind: "air", check: { code: "T-004", measure: 6.42 } },
  { id: "hy", merchant: "Hyatt Regency", detail: "Denver, 1 night", amount: 258, kind: "hotel", check: { code: "L-007", measure: 258 } },
  { id: "ly", merchant: "Lyft", detail: "No receipt", amount: 23.15, kind: "ground", check: { code: "R-002", measure: 23.15 } },
  { id: "bb", merchant: "Bar Bianco", detail: "Card ending 4417", amount: 46.9, kind: "drink", fixed: { code: "M-022", reason: "alcohol, kept off the total" } },
];

export const money = (v: number) =>
  `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
