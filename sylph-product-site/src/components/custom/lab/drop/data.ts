/* /lab/drop, "Same path". Sample data only: Priya and Dana are invented, the merchants and
   amounts are the shared ENGINE_ROWS, and every count on the page is a count of the rows shown. */
import { ENGINE_ROWS, QBO_LIVE, VERDICT_LABEL, type EngineRow, type Verdict } from "@/components/custom/site/sample-data";

export { QBO_LIVE, VERDICT_LABEL };
export type { EngineRow, Verdict };

export type GateId = "match" | "dinner" | "alcohol" | "dup" | "hotel" | "rental";

export interface Gate {
  id: GateId;
  code: string;
  name: string;
  /** the name at phone width */
  short: string;
  /** where an exception leaves this gate; null for the match, which only lets matched receipts on */
  fire: Exclude<Verdict, "ok"> | null;
  /** the side of the spine its exception door opens on: the Needs a note rail is right, Blocked left */
  side: "L" | "R";
  /** the policy sentence the rule was compiled from */
  policy: string;
}

/* The policy, compiled into six gates, top to bottom in the order a charge meets them. */
export const GATES: Gate[] = [
  {
    id: "match",
    code: "MATCH",
    name: "Receipt matched",
    short: "Matched",
    fire: null,
    side: "R",
    policy: "Every expense needs a receipt that matches its card charge.",
  },
  {
    id: "dinner",
    code: "M-041",
    name: "Dinner cap $75",
    short: "Dinner $75",
    fire: "note",
    side: "R",
    policy: "Dinner is reimbursed up to $75 a person.",
  },
  {
    id: "alcohol",
    code: "M-022",
    name: "No alcohol",
    short: "Alcohol",
    fire: "block",
    side: "L",
    policy: "Alcohol is not reimbursable.",
  },
  {
    id: "dup",
    code: "D-001",
    name: "Duplicate check",
    short: "Duplicate",
    fire: "note",
    side: "R",
    policy: "Each expense is claimed once.",
  },
  {
    id: "hotel",
    code: "L-007",
    name: "Hotel cap $350",
    short: "Hotel $350",
    fire: "note",
    side: "R",
    policy: "Hotels are reimbursed up to $350 a night.",
  },
  {
    id: "rental",
    code: "G-009",
    name: "Rental class",
    short: "Rental",
    fire: "note",
    side: "R",
    policy: "Rental cars are intermediate class or below.",
  },
];

export type Outcome = "skip" | "pass" | "fire";

export interface Charge {
  key: string;
  merchant: string;
  short: string;
  amount: string;
  category: string;
  verdict: Verdict;
  cite: string;
  /** one entry per gate the charge reaches; the list stops at the gate that fires */
  gates: Outcome[];
  /** what each touched gate says, short enough for a phone */
  results: string[];
}

const SHORT: Record<string, string> = {
  "United Airlines": "United",
  "Hyatt Regency Denver": "Hyatt",
  "Yellow Cab Co": "Yellow Cab",
  "Marriott Marquis": "Marriott",
  "Blue Bottle Coffee": "Blue Bottle",
  "Delta Air Lines": "Delta",
  "Southwest Airlines": "Southwest",
  "Hilton Garden Inn": "Hilton",
  "Pret a Manger": "Pret",
};

/* Which rule a charge's cite names decides the gate that fires. */
const FIRES_AT: Record<string, GateId> = {
  "M-041": "dinner",
  "M-022": "alcohol",
  "D-001": "dup",
  "L-007": "hotel",
  "G-009": "rental",
};

function applies(gate: GateId, r: EngineRow): boolean {
  switch (gate) {
    case "match":
    case "dup":
      return true;
    case "dinner":
    case "alcohol":
      return r.category === "Meals";
    case "hotel":
      return r.category === "Lodging";
    case "rental":
      return r.merchant === "Avis";
  }
}

function passText(gate: GateId, r: EngineRow): string {
  switch (gate) {
    case "match":
      return r.merchant === "JR East" ? "matched, ¥ converted" : "matched";
    case "dinner":
      return "under $75";
    case "alcohol":
      return "no alcohol";
    case "dup":
      return "no duplicate";
    case "hotel":
      return "under $350";
    case "rental":
      return "in class";
  }
}

function fireText(gate: GateId): string {
  switch (gate) {
    case "dinner":
      return "$9.20 over";
    case "alcohol":
      return "alcohol";
    case "dup":
      return "same as Uber";
    case "hotel":
      return "$62.00 over";
    default:
      return "above class";
  }
}

function toCharge(r: EngineRow): Charge {
  const firing = r.verdict === "ok" ? null : FIRES_AT[r.cite.slice(0, 5)];
  const gates: Outcome[] = [];
  const results: string[] = [];
  for (const g of GATES) {
    if (!applies(g.id, r)) {
      gates.push("skip");
      results.push("");
      continue;
    }
    if (g.id === firing) {
      gates.push("fire");
      results.push(fireText(g.id));
      break;
    }
    gates.push("pass");
    results.push(passText(g.id, r));
  }
  return {
    key: r.merchant,
    merchant: r.merchant,
    short: SHORT[r.merchant] ?? r.merchant,
    amount: r.amount,
    category: r.category,
    verdict: r.verdict,
    cite: r.cite,
    gates,
    results,
  };
}

/** The team's week: every row of the sample, in the order the cards posted. */
export const WEEK: Charge[] = ENGINE_ROWS.map(toCharge);
export const BY_KEY: Record<string, Charge> = Object.fromEntries(WEEK.map((c) => [c.key, c]));

/** Priya's receipts from the Denver trip: the hand the visitor drops from. Every gate gets a turn. */
export const HAND: Charge[] = [
  "United Airlines",
  "Uber",
  "Hyatt Regency Denver",
  "Sushi Kanda",
  "Bar Bianco",
  "Yellow Cab Co",
  "Avis",
  "Marriott Marquis",
].map((m) => BY_KEY[m]);

export const DEMO_KEY = "Sushi Kanda";

/** What the verdict means for the charge, after its cite. */
export const AFTER: Record<Verdict, string> = {
  ok: "Filed itself into the report.",
  note: "Sent to Dana with the rule.",
  block: "Kept off the reimbursable total. The card still works.",
};

/** The week's rows by verdict, for the month-end scene. */
export const WEEK_EXCEPTIONS = WEEK.filter((c) => c.verdict !== "ok");
export const WEEK_CLEARED = WEEK.filter((c) => c.verdict === "ok");

export function dollars(s: string): number {
  return Number(s.replace(/[^0-9.]/g, ""));
}
export function money(n: number): string {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
