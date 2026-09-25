/* Mock C, "Departures". Sample data only: Priya and Dana are invented people, and every charge is one of the
   page's own sample rows (site/sample-data.ts ENGINE_ROWS, v2-sides/month-data.ts, the Denver trip). */

export type V = "ok" | "note" | "block";
export type Via = "booked" | "text" | "email" | "upload";

export interface TripCharge {
  id: string;
  date: string;
  merchant: string;
  /** the merchant as a departures board prints it, at most 15 characters */
  board: string;
  amount: string;
  cents: number;
  rule: string;
  v: V;
  /** what the rule found: threshold and amount for the exceptions */
  why: string;
  via: Via;
}

export const VERDICT: Record<V, string> = { ok: "Cleared", note: "Needs a note", block: "Blocked" };

/* Priya's Denver site visit, Sep 11 to 13, in card-posting order. */
export const TRIP: TripCharge[] = [
  { id: "united", date: "Sep 11", merchant: "United Airlines", board: "UNITED AIRLINES", amount: "412.30", cents: 41230, rule: "T-004", v: "ok", why: "economy, under six hours", via: "booked" },
  { id: "lyft", date: "Sep 11", merchant: "Lyft", board: "LYFT", amount: "23.15", cents: 2315, rule: "G-002", v: "ok", why: "ground transport, in policy", via: "upload" },
  { id: "hyatt", date: "Sep 12", merchant: "Hyatt Regency Denver", board: "HYATT REGENCY", amount: "258.00", cents: 25800, rule: "L-007", v: "ok", why: "under the $350 nightly cap", via: "email" },
  { id: "sushi", date: "Sep 12", merchant: "Sushi Kanda", board: "SUSHI KANDA", amount: "84.20", cents: 8420, rule: "M-041", v: "note", why: "$9.20 over the $75 dinner cap", via: "text" },
  { id: "uber", date: "Sep 12", merchant: "Uber", board: "UBER", amount: "41.60", cents: 4160, rule: "G-002", v: "ok", why: "ground transport, in policy", via: "email" },
  { id: "cab", date: "Sep 12", merchant: "Yellow Cab Co", board: "YELLOW CAB CO", amount: "41.60", cents: 4160, rule: "D-001", v: "note", why: "same amount and date as the Uber ride", via: "upload" },
  { id: "bar", date: "Sep 13", merchant: "Bar Bianco", board: "BAR BIANCO", amount: "46.90", cents: 4690, rule: "M-022", v: "block", why: "alcohol, kept off the total", via: "text" },
  { id: "amtrak", date: "Sep 13", merchant: "Amtrak", board: "AMTRAK", amount: "118.00", cents: 11800, rule: "T-011", v: "ok", why: "rail, in policy", via: "email" },
];

export const byId = (id: string) => TRIP.find((c) => c.id === id)!;
export const QUEUE = TRIP.filter((c) => c.v !== "ok");

export const NOTE = "Late finish at the site visit, only place still open.";

/* Board columns, in characters. Every row is one fixed-width string cut into these. */
export const COLS = { date: 6, merchant: 15, amount: 6, rule: 5, remark: 12 } as const;

export const pad = (s: string, n: number, right = false) => (right ? s.padStart(n, " ") : s.padEnd(n, " ")).slice(0, n);

export const REMARK: Record<V, string> = { ok: "CLEARED", note: "NEEDS A NOTE", block: "BLOCKED" };

export function boardRow(c: TripCharge, remark: string = REMARK[c.v]) {
  return {
    date: pad(c.date.toUpperCase(), COLS.date),
    merchant: pad(c.board, COLS.merchant),
    amount: pad(c.amount, COLS.amount, true),
    rule: pad(c.rule, COLS.rule),
    remark: pad(remark, COLS.remark),
  };
}

export const money = (cents: number) =>
  "$" + (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* The rules in force on the trip, as the approved set shows them. Clauses quote the sample policy. */
export const RULES = [
  { id: "T-004", icon: "plane", say: "Economy on flights under six hours", clause: "3.1 Book economy for any flight under six hours." },
  { id: "G-002", icon: "car", say: "Rides and taxis on a work trip", clause: "3.4 Ground transport between work stops is covered." },
  { id: "L-007", icon: "bed", say: "Hotel up to $350 a night, over it needs a note", clause: "4.6 A hotel is covered up to $350 a night." },
  { id: "M-041", icon: "fork", say: "Solo dinner up to $75, over it needs a note", clause: "4.3 A solo dinner is covered up to $75." },
  { id: "M-022", icon: "glass", say: "Alcohol is not reimbursed", clause: "4.5 Alcohol is not reimbursed." },
  { id: "D-001", icon: "pair", say: "Two charges, same amount and day, need a note", clause: "5.2 A charge that repeats another needs a note." },
] as const;
