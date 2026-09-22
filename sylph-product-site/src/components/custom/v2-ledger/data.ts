import { ENGINE_ROWS, type EngineRow } from "@/components/custom/site/sample-data";

/* The month in the book. Every figure here is sample data and renders with a
   "Sample data" chip. Counts are counts of the rows shown. */

export type Chapter = { id: string; day: number; title: string };

/* The rail reads this list: each chapter is an entry on its day of September. */
export const CHAPTERS: Chapter[] = [
  { id: "opened", day: 1, title: "Book opened" },
  { id: "charge", day: 3, title: "A charge lands" },
  { id: "receipt", day: 4, title: "Its receipt finds it" },
  { id: "rule", day: 9, title: "The rule is cited" },
  { id: "exceptions", day: 17, title: "Exceptions to you" },
  { id: "policy", day: 22, title: "Policy, written or built" },
  { id: "notes", day: 26, title: "Notes to the accounts" },
  { id: "closed", day: 30, title: "Month closed" },
];

/* September 2026 opens on a Tuesday (Monday-first grid offset 1). */
export const MONTH_OFFSET = 1;
export const MONTH_DAYS = 30;

/* The day each sample charge posted, by ENGINE_ROWS index. */
const POSTED = [2, 3, 9, 3, 4, 10, 5, 8, 8, 11, 11, 12, 14, 12, 15, 4, 15, 16, 16, 16];

export type BookRow = EngineRow & { day: number; cents: number };

const cents = (amount: string) => Math.round(Number(amount.replace(/[$,]/g, "")) * 100);

export const BOOK: BookRow[] = ENGINE_ROWS.map((r, i) => ({ ...r, day: POSTED[i], cents: cents(r.amount) }))
  .map((r, i) => ({ r, i }))
  .sort((a, b) => a.r.day - b.r.day || a.i - b.i)
  .map(({ r }) => r);

export const EXCEPTIONS = BOOK.filter((r) => r.verdict !== "ok");
export const CLEARED = BOOK.filter((r) => r.verdict === "ok");

export const money = (c: number) =>
  `$${(c / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const TOTAL_ENTERED = BOOK.reduce((s, r) => s + r.cents, 0);
export const KEPT_OFF = BOOK.filter((r) => r.verdict === "block").reduce((s, r) => s + r.cents, 0);
export const REIMBURSABLE = TOTAL_ENTERED - KEPT_OFF;

export const day2 = (d: number) => String(d).padStart(2, "0");
