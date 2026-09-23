/* "The receipt" (explore direction, 2026-09-22). Sample data only: Priya, Dana, Sushi Kanda and every
   amount are invented; the week's charges are the shared ENGINE_ROWS, and every count is a count of rows
   shown. Plain module, so server components read it too. */
import { ENGINE_ROWS, QBO_LIVE, VERDICT_LABEL, type EngineRow, type Verdict } from "@/components/custom/site/sample-data";

export { QBO_LIVE, VERDICT_LABEL };
export type { EngineRow, Verdict };

export const CHARGE = {
  merchant: "Sushi Kanda",
  amount: "84.20",
  rule: "M-041",
  cap: 75,
  total: 84.2,
  over: "9.20",
  note: "Late finish at the site visit, only place still open.",
};

/* The week of charges that reached Dana, in the order they came in. */
export const WEEK: EngineRow[] = ENGINE_ROWS;
export const WEEK_EXCEPTIONS = WEEK.filter((r) => r.verdict !== "ok");
export const WEEK_CLEARED = WEEK.filter((r) => r.verdict === "ok");

/* The receipt's month, one entry per scene. `log` is what the print head reads while the scene is on the
   paper; `id` is the scene's anchor. */
export const LIFE = [
  { id: "printed", when: "21:47", what: "Printed in Denver", log: "21:47  PRINTED" },
  { id: "texted", when: "21:49", what: "Texted to Sylph", log: "21:49  TEXTED TO SYLPH" },
  { id: "matched", when: "21:49", what: "Found its card charge", log: "21:49  FOUND MY CHARGE" },
  { id: "read", when: "21:49", what: "Read against rule M-041", log: "21:49  READ AGAINST M-041" },
  { id: "note", when: "21:52", what: "Carried Priya's note", log: "21:52  NOTE ATTACHED" },
  { id: "queue", when: "Sep 14", what: "Approved by Dana", log: "SEP 14  DANA'S QUEUE" },
  { id: "filed", when: "Sep 30", what: "Filed on line 3", log: "SEP 30  FILED, LINE 3" },
] as const;

/* Priya's September report. Line 3 is the receipt. Bar Bianco is blocked, so the reimbursable total is
   the other five: 412.30 + 23.15 + 84.20 + 258.00 + 118.00 = 895.65. */
export const REPORT = [
  { n: 1, d: "Sep 11", m: "United Airlines", a: "412.30", v: "ok" as Verdict, say: "Cleared" },
  { n: 2, d: "Sep 12", m: "Lyft", a: "23.15", v: "ok" as Verdict, say: "Cleared" },
  { n: 3, d: "Sep 12", m: "Sushi Kanda", a: "84.20", v: "note" as Verdict, say: "Note, approved" },
  { n: 4, d: "Sep 12", m: "Hyatt Regency Denver", a: "258.00", v: "ok" as Verdict, say: "Cleared" },
  { n: 5, d: "Sep 13", m: "Bar Bianco", a: "46.90", v: "block" as Verdict, say: "Blocked" },
  { n: 6, d: "Sep 13", m: "Amtrak", a: "118.00", v: "ok" as Verdict, say: "Cleared" },
];
export const REPORT_TOTAL = "895.65";

/* The card feed the receipt searched, card ****4417 (sample). */
export const FEED = [
  { d: "Sep 12", m: "BLUE BOTTLE COFFEE", a: "6.40" },
  { d: "Sep 12", m: "LYFT *RIDE", a: "23.15" },
  { d: "Sep 12", m: "HYATT REGENCY DENVER", a: "258.00" },
  { d: "Sep 12", m: "SUSHI KANDA DENVER CO", a: "84.20", me: true },
];

export type ExportId = "pdf" | "xlsx" | "csv" | "qbo";
export const EXPORTS: { id: ExportId; k: string; say: string }[] = [
  { id: "pdf", k: "PDF", say: "Audit-grade statement. Every line with its rule, threshold and amount." },
  { id: "xlsx", k: "XLSX", say: "Line items with their rule references, ready to filter." },
  { id: "csv", k: "GL journal CSV", say: "The journal, coded to the accounts you set once." },
  ...(QBO_LIVE ? [{ id: "qbo" as ExportId, k: "QuickBooks Online", say: "The same journal, posted to QuickBooks Online." }] : []),
];

/* The torn end of the strip. One jagged edge, drawn once: the strip's bottom and the next receipt's top
   share it, as two halves of one tear would. Deterministic, so the server and the client agree. */
function tearPoints(n: number, depth: number) {
  let s = 41;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  const pts: { x: number; d: number }[] = [];
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * 100;
    const d = Math.round((0.15 + rnd() * 0.85) * depth * 10) / 10;
    pts.push({ x: Math.round(x * 100) / 100, d });
  }
  return pts;
}
const TEAR = tearPoints(46, 12);
/** clip-path for a block whose bottom edge is the tear (depth in px from the bottom). */
export const TEAR_BOTTOM = `polygon(0 0, 100% 0, ${[...TEAR]
  .reverse()
  .map((p) => `${p.x}% calc(100% - ${p.d}px)`)
  .join(", ")})`;
/** clip-path for a block whose top edge is the same tear. */
export const TEAR_TOP = `polygon(${TEAR.map((p) => `${p.x}% ${12 - p.d}px`).join(", ")}, 100% 100%, 0 100%)`;

/* Deterministic per-character fade thresholds for the "next September" block. */
export function fadeKeys(text: string, seed = 7) {
  let s = seed;
  return [...text].map((ch) => {
    s = (s * 16807) % 2147483647;
    return { ch, k: Math.round((s / 2147483647) * 100) / 100 };
  });
}
